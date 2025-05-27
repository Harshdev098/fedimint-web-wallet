import { useRef, useState, useContext, useEffect } from 'react'
import QrScanner from "qr-scanner";
import receiveIcon from '../assets/recieve-icon.png'
import sendIcon from '../assets/send-icon.png'
import QRCode from 'react-qr-code'
import { setInvoice, setInvoiceError, setPayInvoiceError, setPayInvoiceResult } from '../redux/slices/LightningPayment'
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


export default function LighningPayment() {
    const [status, setStatus] = useState<boolean>(false)
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
    const { Invoice, InvoiceError, payInvoiceResult, payInvoiceError } = useSelector((state: RootState) => state.Lightning)

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        NProgress.start();
        setStatus(true);
        setLoading(true);
        const amountValue = Number((amount.current?.value)?.trim())
        try {
            if (!amountValue || amountValue <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            const result = await CreateInvoice(wallet, amountValue, (description.current?.value ?? '').trim());
            console.log('Create invoice result:', result);
            dispatch(setInvoice(result));
            const unsubscribe = wallet?.lightning.subscribeLnReceive(
                result.operationId,
                async(state) => {
                    if (state === "funded") {
                        alert("Payment received!");
                        const unsubscribeBalance = await wallet.balance.subscribeBalance((mSats) => {
                            console.log("Balance updated:", mSats);
                            dispatch(setBalance(mSats));
                            unsubscribeBalance?.();
                        });
                    } else if (typeof state === 'object' && 'canceled' in state) {
                        alert(`Payment cancelled: ${state.canceled.reason}`)
                    }
                },
                (error) => {
                    console.error("Error in subscription:", error);
                    throw new Error("An error occured! Payment cancelled")
                }
            );

            setTimeout(() => unsubscribe?.(), 60000);
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
            if (!invoice.current?.value) {
                throw new Error('Please enter an invoice');
            }
            const result = await PayInvoice(wallet, invoiceValue || '');
            const unsubscribe= wallet.lightning.subscribeLnPay(result.id,
                async(state: LnPayState) => {
                    if (typeof state === 'object' && 'status' in state && state.status === 'success') {
                        alert("payment sended!")
                        const unsubscribeBalance = await wallet.balance.subscribeBalance((mSats) => {
                            console.log("Balance updated:", mSats);
                            dispatch(setBalance(mSats));
                            unsubscribeBalance?.();
                        });
                    }else if(state==='canceled'){
                        alert("payment cancelled")
                    }
                },
                (error) => {
                    console.error("Error in subscription:", error);
                    throw new Error("An error occured! Payment cancelled")
                }
            )
            dispatch(setPayInvoiceResult(result));

            setTimeout(() => unsubscribe?.(), 60000);
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
            if (invoice.current) {
                invoice.current.value = '';
            }
            setOpenSendBox(false)
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
                        <button type='button' className='closeBtn' onClick={() => { setOpenRecieveBox(false); dispatch(setInvoice(null)) }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <h2>Create Invoice</h2>
                        <form onSubmit={handleCreateInvoice}>
                            <input type="number" inputMode='numeric' placeholder='Enter the amount' ref={amount} required />
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
                        <button type='button' className='closeBtn' onClick={() => setOpenSendBox(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <h2>Pay Invoice</h2>
                        <form onSubmit={handlePayInvoice}>
                            <input type="text" placeholder='Enter the Invoice' ref={invoice} required />
                            <button type='submit' disabled={status}>Pay Invoice</button>
                        </form>
                        {payInvoiceResult && (
                            <div className='createInvoiceResult'>
                                <div className='qrCode'>
                                    {/* <p><b>PreImage:</b> {payInvoiceResult.}</p> */}
                                    <p style={{ margin: '12px' }}><b>Fees Paid:</b> {payInvoiceResult.fee}</p>
                                </div>
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
