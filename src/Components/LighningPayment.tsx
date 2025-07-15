import { useRef, useState, useContext, useEffect } from 'react'
import QrScanner from "qr-scanner";
import receiveIcon from '../assets/recieve-icon.png'
import sendIcon from '../assets/send-icon.png'
import QRCode from 'react-qr-code'
import { setInvoice, setInvoiceOperationId, setPayInvoiceResult } from '../redux/slices/LightningPayment'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { CreateInvoice, PayInvoice, subscribeLnPay, subscribeLnReceive } from '../services/LightningPaymentService'
import LoadingContext from '../context/loader'
import NProgress from 'nprogress'
import WalletContext from '../context/wallet'
import Alerts from './Alerts'
import { downloadQRCode } from '../services/DownloadQR';
import { convertToMsats } from '../services/BalanceService';
import { Link } from 'react-router';
import logger from '../utils/logger';
import { setError } from '../redux/slices/Alerts';


export default function LighningPayment() {
    const [status, setStatus] = useState<boolean>(false)
    const [convertedAmountInMSat, setConvertedAmountInMSat] = useState<number | null>(null)
    const amount = useRef<HTMLInputElement>(null)
    const description = useRef<HTMLInputElement>(null)
    const invoice = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)
    const [openRecieveBox, setOpenRecieveBox] = useState(false)
    const [openSendBox, setOpenSendBox] = useState<boolean>(false)
    const [openVideo, setOpenVideo] = useState<boolean>(false)
    const { wallet } = useContext(WalletContext)
    const { setLoading } = useContext(LoadingContext)
    const dispatch = useDispatch<AppDispatch>()
    const { Invoice, InvoiceOperationId, payInvoiceResult, payStatus } = useSelector((state: RootState) => state.Lightning)
    const { error } = useSelector((state: RootState) => state.Alert)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { metaData } = useSelector((state: RootState) => state.federationdetails)


    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        NProgress.start();
        setStatus(true);
        setLoading(true);
        try {
            if (!convertedAmountInMSat || convertedAmountInMSat <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            let unsubscribe: (() => void);
            // const amountValue = await convertToSats(convertedAmount,currency)
            logger.log("amount value is", convertedAmountInMSat)
            const result = await CreateInvoice(wallet, convertedAmountInMSat, (description.current?.value ?? '').trim());
            logger.log('Create invoice result:', result);
            dispatch(setInvoice(result.invoice));
            dispatch(setInvoiceOperationId(result.operationId))

            unsubscribe = subscribeLnReceive(wallet, result.operationId, dispatch, metaData)

            setTimeout(() => {
                unsubscribe?.();
            }, 300000);
        } catch (err) {
            logger.error('Create Invoice Error:', err);
            dispatch(setError({ type: 'Invoice Error: ', message: err instanceof Error ? err.message : 'Failed to create invoice' }));
            setTimeout(() => {
                dispatch(setError(null))
            }, 3000);
        } finally {
            NProgress.done();
            setLoading(false);
            setStatus(false);
            if (amount.current) {
                amount.current.value = '';
            }
        }
    };

    const handlePayInvoice = async (e: React.FormEvent, QRData?: string) => {
        e.preventDefault();
        NProgress.start();
        setStatus(true);
        setLoading(true);
        const invoiceValue = (invoice.current?.value)?.trim() || QRData
        try {
            if (!invoiceValue) {
                throw new Error('Please enter an invoice');
            }
            let unsubscribe: (() => void) | undefined;

            if (localStorage.getItem('locationAccess') === 'true') {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { longitude, latitude } = position.coords;
                        const location = { latitude, longitude };

                        let locations: { [invoiceId: string]: { latitude: number; longitude: number } } = {};
                        const storedLocations = localStorage.getItem('paymentLocations');
                        if (storedLocations) {
                            try {
                                locations = JSON.parse(storedLocations);
                            } catch (error) {
                                logger.error('Error parsing paymentLocations:', error);
                            }
                        }

                        locations[invoiceValue] = location;
                        localStorage.setItem('paymentLocations', JSON.stringify(locations));
                    },
                    (error) => {
                        logger.log('An error occurred while finding location', error);
                        if (error.PERMISSION_DENIED) {
                            alert("Permission Denied! you can reset your permissions")
                        }
                    }
                );
            }

            const result = await PayInvoice(wallet, invoiceValue || '');
            dispatch(setPayInvoiceResult(result));

            if (result.payType === 'lightning') {
                unsubscribe = subscribeLnPay(wallet, result.id, dispatch)
            }

            setTimeout(() => unsubscribe?.(), 300000);
        } catch (err) {
            logger.error('handlePayInvoice error:', err);
            dispatch(setError({ type: 'Payment Error: ', message: err instanceof Error ? err.message : 'Failed to pay invoice' }));
            setTimeout(() => {
                dispatch(setError(null))
            }, 3000);
        } finally {
            NProgress.done();
            setLoading(false);
            setStatus(false);
        }
    };


    useEffect(() => {
        if (openVideo && videoRef.current) {
            scannerRef.current = new QrScanner(
                videoRef.current,
                async (result) => {
                    if (result.data) {
                        logger.log("qr data ", result.data)
                        await handlePayInvoice({ preventDefault: () => { } } as React.FormEvent, result.data)
                        scannerRef.current?.stop()
                        setOpenVideo(false)
                        scannerRef.current?.destroy()
                        scannerRef.current = null;
                    }
                },
                { returnDetailedScanResult: true }
            )

            scannerRef.current.start().then(() => {
                logger.log("QR scanning started.")
            }).catch((err) => {
                logger.error("QR scanning failed:", err)
                dispatch(setError({ type: 'QR Error: ', message: 'camera access denied' }))
                setTimeout(() => dispatch(setError(null)), 3000)
            })
        }

        return () => {
            scannerRef.current?.stop()
        }
    }, [openVideo])

    const handleConversion = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = await convertToMsats(Number((e.target.value).trim()), currency)
        setConvertedAmountInMSat(amount)
    }

    return (
        <>
            {(error) && <Alerts Error={error} />}
            {openVideo && (
                <div className="videoOverlay">
                    <div className='videoRef'>
                        <video width={'100%'} ref={videoRef}></video>
                        <button onClick={() => { scannerRef.current?.stop(); setOpenVideo(false) }}>Close</button>
                    </div>
                </div>
            )}
            {openRecieveBox && (
                <div className="modalOverlay">
                    <div className='createInvoice'>
                        <button type='button' className='closeBtn' onClick={() => { setOpenRecieveBox(false); dispatch(setInvoice(null)); setConvertedAmountInMSat(0) }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <h2>Create Invoice</h2>
                        <p style={{ marginTop: '0px', textAlign: 'center' }}>You can change the currency from <Link to={'/settings'} style={{ color: '#0f61b9', textDecoration: 'none' }}><i className="fa-solid fa-gear"></i> Settings</Link></p>
                        <form onSubmit={handleCreateInvoice}>
                            <label htmlFor='amountvalue'>Enter amount in {currency}:</label>
                            <input type="decimal" id='amountvalue' inputMode='decimal' placeholder={`Enter amount in ${currency}`} ref={amount} onChange={handleConversion} required />
                            <label>Enter description:</label>
                            <input type="text" placeholder='Enter the description' ref={description} />
                            <button type='submit' disabled={status}>Create</button>
                        </form>
                        {Invoice && (
                            <div className='createInvoiceResult'>
                                <div className='qrCode'>
                                    <div className='copyWrapper'>
                                        <p><b>Invoice:</b> {Invoice}</p>
                                        <button
                                            className="copyBtnOverlay"
                                            onClick={() => {
                                                navigator.clipboard.writeText(Invoice);
                                            }}
                                        ><i className="fa-regular fa-copy"></i></button>
                                    </div>
                                    <p style={{ margin: '12px' }}><b>OperationID:</b> {InvoiceOperationId}</p>
                                    <QRCode value={JSON.stringify(Invoice)} onClick={() => { logger.log("invoice in qr is ", JSON.stringify(Invoice)) }} size={150} bgColor='white' fgColor='black' />
                                    <button type='button' onClick={() => downloadQRCode('invoice')}>Download QR</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {openSendBox && (
                <div className="modalOverlay">
                    <div className='payInvoice'>
                        <button type='button' className='closeBtn' onClick={() => { setOpenSendBox(false); dispatch(setPayInvoiceResult(null)) }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <h2>Pay Invoice</h2>
                        <form onSubmit={handlePayInvoice}>
                            <label htmlFor='invoice'>Enter the invoice:</label>
                            <input type="text" id='invoice' placeholder='Enter the Invoice' ref={invoice} required />
                            <button type='submit' disabled={status}>Pay Invoice</button>
                        </form>
                        {payInvoiceResult && (
                            <div className="invoiceDetailGroupModern">
                                {/* <div className="invoiceDetailCard"><b>Amount:</b> {invoicePayAmount} sat</div> */}
                                <div className="invoiceDetailCard"><b>Pay Type:</b> {payInvoiceResult.payType}</div>
                                <div className="invoiceDetailCard"><b>Fees Paid:</b> {payInvoiceResult.fee} msat</div>
                                {/* <div className="invoiceDetailCard"><b>Total Amount:</b> {(invoicePayAmount + payInvoiceResult.fee / 1000)} sat</div> */}
                                <div className="invoiceDetailCard"><b>Status:</b> {payStatus}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className='BalanceSectionActions'>
                <button onClick={() => { setOpenRecieveBox(true) }}><img src={receiveIcon} alt="" width={'20px'} /> Recieve</button>
                <button onClick={() => { setOpenSendBox(true) }}><img src={sendIcon} alt="" width={'20px'} /> Send</button>
            </div>
            <div className="TransactionsWithQR">
                <button onClick={() => { setOpenVideo(true) }}><i className="fa-solid fa-qrcode"></i> Scan QR</button>
            </div>
        </>
    )
}
