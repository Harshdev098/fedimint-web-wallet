import { useRef, useState, useContext, useEffect } from 'react'
import QrScanner from "qr-scanner";
import receiveIcon from '../assets/recieve-icon.png'
import sendIcon from '../assets/send-icon.png'
import QRCode from 'react-qr-code'
import { setInvoice, setInvoiceError, setPayInvoiceError, setPayInvoiceResult, setPayStatus } from '../redux/slices/LightningPayment'
import { createNotification } from '../redux/slices/NotificationSlice';
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { CreateInvoice, PayInvoice } from '../services/LightningPaymentService'
import LoadingContext from '../context/loader'
import NProgress from 'nprogress'
import WalletContext from '../context/wallet'
import Alerts from './Alerts'
import { setBalance } from '../redux/slices/Balance'
import { downloadQRCode } from '../services/DownloadQR';
import type { LnPayState } from '@fedimint/core-web';
import { convertToSats } from '../services/BalanceService';
import { Link } from 'react-router';


export default function LighningPayment() {
    const [status, setStatus] = useState<boolean>(false)
    const [convertedAmountInSat,setConvertedAmountInSat]=useState<number | null>(null)
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
    const { Invoice, InvoiceError, payInvoiceResult, payInvoiceError, payStatus } = useSelector((state: RootState) => state.Lightning)
    const { currency } =useSelector((state:RootState)=>state.balance)

    const subscribeBalanceChange = () => {
        const unsubscribeBalance = wallet.balance.subscribeBalance((mSats) => {
            console.log('Balance updated:', mSats);
            dispatch(setBalance(mSats));
            setTimeout(() => {
                unsubscribeBalance?.();
            }, 10000);
        });
    }

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        NProgress.start();
        setStatus(true);
        setLoading(true);
        try {
            if (!convertedAmountInSat || convertedAmountInSat <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            // const amountValue = await convertToSats(convertedAmount,currency)
            console.log("amount value is",convertedAmountInSat*1000)
            const result = await CreateInvoice(wallet, convertedAmountInSat*1000, (description.current?.value ?? '').trim());
            console.log('Create invoice result:', result);
            dispatch(setInvoice(result));
            const unsubscribe = wallet?.lightning.subscribeLnReceive(
                result.operationId,
                async (state) => {
                    const date = (new Date()).toDateString()
                    const time = (new Date()).toTimeString()
                    if (state === "funded") {
                        dispatch(createNotification({ type: 'Payment', data: 'Payment Recieved', date: date, time: time, OperationId:result.operationId }))
                        subscribeBalanceChange()
                    } else if (typeof state === 'object' && 'canceled' in state) {
                        dispatch(createNotification({ type: 'Payment', data: `Payment Canceled ${state.canceled.reason}`, date: date, time: time, OperationId:result.operationId }))
                    }
                },
                (error) => {
                    console.error("Error in subscription:", error);
                    throw new Error("An error occured! Payment cancelled")
                }
            );

            setTimeout(() => {
                unsubscribe?.();
            }, 300000);
        } catch (err) {
            console.error('Create Invoice Error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
            dispatch(setInvoiceError(errorMessage));
            setTimeout(() => {
                dispatch(setInvoiceError(''))
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

            const result = await PayInvoice(wallet, invoiceValue || '');
            dispatch(setPayInvoiceResult(result));

            if (result.payType === 'lightning') {
                unsubscribe = wallet.lightning.subscribeLnPay(result.id,
                    (state: LnPayState) => {
                        const date = new Date().toDateString();
                        const time = new Date().toTimeString();

                        if (state === 'created') {
                            console.log("status created")
                            dispatch(setPayStatus(state))
                        } else if (state === 'canceled') {
                            dispatch(createNotification({ type: 'Payment', data: 'Payment Cancelled', date, time, OperationId:result.id }));
                            dispatch(setPayStatus(state))
                        } else if (typeof state === 'object') {
                            if ('success' in state) {
                                dispatch(createNotification({ type: 'Payment', data: 'Payment Succeeded', date, time, OperationId:result.id }));
                                subscribeBalanceChange();
                                dispatch(setPayStatus('success'))
                            } else if ('funded' in state) {
                                dispatch(createNotification({ type: 'Payment', data: 'Payment Funded', date, time, OperationId:result.id }));
                                dispatch(setPayStatus('funded'))
                            } else if ('waiting_for_refund' in state) {
                                dispatch(createNotification({ type: 'Payment', data: 'Waiting for Refund', date, time, OperationId:result.id }));
                                dispatch(setPayStatus('waiting_for_refund'))
                            } else if ('refunded' in state) {
                                dispatch(createNotification({ type: 'Payment', data: 'Payment Refunded', date, time, OperationId:result.id }));
                                dispatch(setPayStatus('refunded'))
                            } else if ('unexpected_error' in state) {
                                dispatch(createNotification({ type: 'Payment', data: 'Unexpected Error Occurred', date, time, OperationId:result.id }));
                                dispatch(setPayStatus('unexpected_error'))
                            }
                        }
                    },
                    (error) => {
                        console.error("Error in subscription:", error);
                        throw new Error("An error occured! Payment cancelled")
                    }
                )
            }

            setTimeout(() => unsubscribe?.(), 300000);
        } catch (err) {
            console.error('handlePayInvoice error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to pay invoice';
            dispatch(setPayInvoiceError(errorMessage));
            setTimeout(() => {
                dispatch(setPayInvoiceError(''))
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
                        console.log("qr data ", result.data)
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
                console.log("QR scanning started.")
            }).catch((err) => {
                console.error("QR scanning failed:", err)
                dispatch(setPayInvoiceError('camera access denied'))
                setTimeout(() => dispatch(setPayInvoiceError('')), 3000)
            })
        }

        return () => {
            scannerRef.current?.stop()
        }
    }, [openVideo])

    const handleConversion = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const amount=await convertToSats(Number((e.target.value).trim()),currency)
        setConvertedAmountInSat(amount)
    }

    return (
        <>
            {(InvoiceError || payInvoiceError) && <Alerts Error={InvoiceError || payInvoiceError} Result='' />}
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
                        <button type='button' className='closeBtn' onClick={() => { setOpenRecieveBox(false); dispatch(setInvoice(null));setConvertedAmountInSat(0) }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <h2>Create Invoice</h2>
                        <p style={{marginTop:'0px',textAlign:'center'}}>You can change the currency from <Link to={'/settings'} style={{color:'#0f61b9',textDecoration:'none'}}><i className="fa-solid fa-gear"></i> Settings</Link></p>
                        <form onSubmit={handleCreateInvoice}>
                            <label htmlFor='amountvalue'>Enter amount in {currency}:</label>
                            <input type="number" id='amountvalue' inputMode='numeric' placeholder={`Enter amount in ${currency}`} ref={amount} onChange={handleConversion} required />
                            <span style={{color:'green'}}>Entered amount in sats: {convertedAmountInSat}</span>
                            <label>Enter description:</label>
                            <input type="text" placeholder='Enter the description' ref={description} />
                            <button type='submit' disabled={status}>Create</button>
                        </form>
                        {Invoice && (
                            <div className='createInvoiceResult'>
                                <div className='qrCode'>
                                    <div className='copyWrapper'>
                                        <p><b>Invoice:</b> {Invoice.invoice}</p>
                                        <button
                                            className="copyBtnOverlay"
                                            onClick={() => {
                                                navigator.clipboard.writeText(Invoice.invoice);
                                            }}
                                        ><i className="fa-regular fa-copy"></i></button>
                                    </div>
                                    <p style={{ margin: '12px' }}><b>OperationID:</b> {Invoice.operationId}</p>
                                    <QRCode value={JSON.stringify(Invoice)} size={150} bgColor='white' fgColor='black' />
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
