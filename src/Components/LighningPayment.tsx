import { useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { setInvoice, setInvoiceOperationId, setPayInvoiceResult } from '../redux/slices/LightningPayment'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { CreateInvoice, PayInvoice, subscribeLnPay, subscribeLnReceive } from '../services/LightningPaymentService'
import { startProgress, doneProgress } from '../utils/ProgressBar';
import { useWallet } from '../context/WalletManager'
import Alerts from './Alerts'
import { downloadQRCode } from '../services/DownloadQR';
import { convertToMsats } from '../services/BalanceService';
import logger from '../utils/logger';
import { setErrorWithTimeout } from '../redux/slices/Alerts';
import { setCurrency } from '../redux/slices/Balance';
import QRScanner from './QrScanner';


export default function LighningPayment() {
    const [generatingInvoice, setGeneratingInvoice] = useState<boolean>(false)
    const [payingInvoice, setPayingInvoice] = useState<boolean>(false)
    const [convertedAmountInMSat, setConvertedAmountInMSat] = useState<number | null>(null)
    const amount = useRef<HTMLInputElement>(null)
    const [description,setDescription] = useState<string>(localStorage.getItem('description') || '')
    const invoice = useRef<HTMLInputElement>(null)
    const [openRecieveBox, setOpenRecieveBox] = useState(false)
    const [openSendBox, setOpenSendBox] = useState<boolean>(false)
    const [openVideo, setOpenVideo] = useState<boolean>(false)
    const { wallet } = useWallet()
    const dispatch = useDispatch<AppDispatch>()
    const { Invoice, payInvoiceResult, payStatus, invoiceExpiry } = useSelector((state: RootState) => state.Lightning)
    const { error } = useSelector((state: RootState) => state.Alert)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { metaData } = useSelector((state: RootState) => state.federationdetails)
    const { walletId } = useSelector((state: RootState) => state.activeFederation)


    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = e.target.value;
        dispatch(setCurrency(selectedCurrency));
        localStorage.setItem('walletCurrency', selectedCurrency)
    }

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        startProgress();
        setGeneratingInvoice(true);
        try {
            if (!convertedAmountInMSat || convertedAmountInMSat <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            let unsubscribe: (() => void);
            // const amountValue = await convertToSats(convertedAmount,currency)
            logger.log("amount value and wallet is", convertedAmountInMSat, walletId, wallet)
            const result = await CreateInvoice(wallet, convertedAmountInMSat, description?.trim(), invoiceExpiry);
            logger.log('Create invoice result:', result);
            dispatch(setInvoice(result.invoice));
            dispatch(setInvoiceOperationId(result.operationId))

            unsubscribe = subscribeLnReceive(wallet, result.operationId, dispatch, metaData)
            setTimeout(() => {
                unsubscribe?.();
            }, invoiceExpiry * 60 * 1000);
        } catch (err) {
            logger.error('Create Invoice Error:', err);
            dispatch(setErrorWithTimeout({ type: 'Invoice Error: ', message: err instanceof Error ? err.message : String(err) }));
        } finally {
            doneProgress();
            setGeneratingInvoice(false);
            if (amount.current) {
                amount.current.value = '';
            }
        }
    };

    const handlePayInvoice = async (e: React.FormEvent, QRData?: string) => {
        e.preventDefault();
        startProgress();
        setPayingInvoice(true);
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
            dispatch(setErrorWithTimeout({ type: 'Payment Error: ', message: err instanceof Error ? err.message : String(err) }));
        } finally {
            doneProgress();
            setPayingInvoice(false);
        }
    };


    const handlePayWithQR = async (data: string) => {
        console.log("qr sdsdfs", data)
        setOpenVideo(false)
        if (invoice.current) {
            invoice.current.value = data;
        }
        await handlePayInvoice({ preventDefault: () => { } } as React.FormEvent, data)
    }

    const handleConversion = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = await convertToMsats(Number((e.target.value).trim()), currency)
        setConvertedAmountInMSat(amount)
    }

    return (
        <>
            {(error) && <Alerts Error={error} />}
            <QRScanner open={openVideo} onClose={() => setOpenVideo(false)} onError={(err) => dispatch(setErrorWithTimeout(err))} onResult={(data) => handlePayWithQR(data)} />
            {openRecieveBox && (
                <div className="modalOverlay">
                    <div className='createInvoice'>
                        <button type='button' className='closeBtn' onClick={() => { setOpenRecieveBox(false); dispatch(setInvoice(null)); setConvertedAmountInMSat(0) }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <h2 style={{ marginBottom: '4px' }}><i className="fa-solid fa-bolt"></i> Create Lightning Invoice</h2>
                        <p className='title-span'>Receive eCash directly from the Lightning network</p>
                        <form onSubmit={handleCreateInvoice}>
                            <label htmlFor='amountvalue'>Enter amount in {currency}:</label>
                            <div className="input-group">
                                <input
                                    type="decimal"
                                    id='amountvalue'
                                    className="amount-input"
                                    inputMode='decimal'
                                    placeholder={`Enter amount in ${currency}`}
                                    ref={amount}
                                    onChange={handleConversion}
                                    required
                                />
                                <select className="currency-select" value={currency} onChange={handleCurrencyChange}>
                                    <option value={'msat'}>msat</option>
                                    <option value={'sat'}>sat</option>
                                    <option value={'usd'}>USD</option>
                                    <option value={'euro'}>EURO</option>
                                </select>
                            </div>
                            <label htmlFor='description'>Enter description:</label>
                            <input type="text" id='description' value={description} className='amount-input' placeholder='Enter the description' onChange={(e)=>setDescription(e.target.value)} required />
                            <button type='submit' disabled={generatingInvoice}>Create</button>
                        </form>
                        {Invoice && (
                            <div className='createInvoiceResult'>
                                <div className='qrCode'>
                                    <QRCode value={Invoice} size={150} bgColor='white' fgColor='black' />
                                    <div className='copyWrapper'>
                                        <p><b>Invoice:</b> {Invoice}</p>
                                        <button
                                            className="copyBtnOverlay"
                                            onClick={() => {
                                                navigator.clipboard.writeText(Invoice);
                                            }}
                                        ><i className="fa-regular fa-copy"></i></button>
                                    </div>
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
                        <h2 style={{ marginBottom: '4px' }}><i className="fa-solid fa-bolt"></i> Pay Lightning Invoice</h2>
                        <p className='title-span'>Send ecash via Lightning network</p>
                        <form onSubmit={handlePayInvoice}>
                            <label htmlFor='invoice'>Enter the invoice:</label>
                            <div className="input-with-icon">
                                <input type="text" className='amount-input' id='invoice' placeholder='Enter the Invoice' ref={invoice} required />
                                <button type="button" className="camera-btn" onClick={() => setOpenVideo(true)} >
                                    <i className="fa-solid fa-camera"></i>
                                </button>
                            </div>
                            <button type='submit' disabled={payingInvoice}>Pay Invoice</button>
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

            <div className="BalanceSectionActionsWrapper">
                <div className="BalanceSectionActions">
                    <button onClick={() => setOpenRecieveBox(true)}>
                        <i className="fa-solid fa-angles-down"></i> Receive
                    </button>
                    <button onClick={() => setOpenSendBox(true)}>
                        <i className="fa-solid fa-angles-up"></i> Send
                    </button>
                </div>
            </div>
        </>
    )
}
