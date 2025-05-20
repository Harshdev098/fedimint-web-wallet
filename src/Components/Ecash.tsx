import QrScanner from "qr-scanner";
import { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router'
import QRCode from 'react-qr-code'
import WalletContext from '../context/wallet'
import { SpendEcash, RedeemEcash, ParseEcashNotes } from '../services/MintService'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setSpendResult, setSpendError, setRedeemError, setRedeemResult, setParseEcashResult, setParseEcashError } from '../redux/slices/Mint'
import LoadingContext from '../context/loader'
import NProgress from 'nprogress'
import Alerts from './Alerts'
import { downloadQRCode } from '../services/DownloadQR';
import { setBalance } from '../redux/slices/Balance'


export default function Ecash() {
    const [status, setStatus] = useState<boolean>(false)
    const [openVideo, setOpenVideo] = useState<boolean>(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)
    const amount = useRef<HTMLInputElement | null>(null)
    const [notes, setNotes] = useState('')
    const { wallet } = useContext(WalletContext)
    const { setLoading } = useContext(LoadingContext)
    const { SpendEcashError, SpendEcashResult, RedeemEcashResult, RedeemEcashError, ParseEcashResult, ParseEcashError } = useSelector((state: RootState) => state.mint)
    const dispatch = useDispatch<AppDispatch>()

    const handleSpendEcash = async (e: React.FormEvent) => {
        e.preventDefault()
        NProgress.start()
        setLoading(true)
        if (!(wallet.isOpen())) {
            await wallet?.open()
        }
        try {
            setStatus(true)
            if (Number(amount.current?.value) <= 0) {
                throw new Error("Spend amount should be greater than 0")
            }
            const result = await SpendEcash(wallet, Number(amount.current?.value))
            const unsubscribe = wallet?.balance.subscribeBalance((mSats) => {
                console.log('Balance updated:', mSats)
                dispatch(setBalance(mSats))
            })
            dispatch(setSpendResult(result))
            if (unsubscribe) {
                unsubscribe();
            }
        } catch (err) {
            dispatch(setSpendError(`${err}`))
            setTimeout(() => {
                dispatch(setSpendError(''))
            }, 3000);
        } finally {
            NProgress.done()
            setLoading(false)
            setStatus(false)
            if (amount.current) {
                amount.current.value = '';
            }
        }
    }

    const handleRedeemEcash = async (e: React.FormEvent) => {
        e.preventDefault()
        NProgress.start()
        setLoading(true)
        if (!(wallet?.isOpen())) {
            await wallet?.open();
        }
        try {
            if (!notes) {
                throw new Error("Notes value is required");
            }
            setStatus(true)
            const result = await RedeemEcash(wallet, notes);
            const unsubscribe = wallet?.balance.subscribeBalance((mSats) => {
                console.log('Balance updated:', mSats)
                dispatch(setBalance(mSats))
            })
            dispatch(setRedeemResult(result))
            setTimeout(() => {
                dispatch(setRedeemResult(''))
                dispatch(setParseEcashResult(null))
            }, 3000);
            if (unsubscribe) {
                unsubscribe();
            }
        } catch (err) {
            console.log(`An error occured ${err}`)
            dispatch(setRedeemError(`${err}`))
            setTimeout(() => {
                dispatch(setRedeemError(''))
            }, 3000);
        } finally {
            NProgress.done()
            setLoading(false)
            setStatus(false)
        }
    }

    const memoizedParseNotes = useCallback(async (notesValue: string) => {
        const result = await ParseEcashNotes(wallet,notesValue);
        if (result !== undefined) {
            dispatch(setParseEcashResult(result));
        }
    }, [wallet, dispatch]);

    useEffect(() => {
        const trimmedNotes = notes.trim();
        if (trimmedNotes !== '') {
            NProgress.start()
            setLoading(true)
            setStatus(true)
            memoizedParseNotes(trimmedNotes);
            NProgress.done()
            setLoading(false)
            setStatus(false)
        }
    }, [notes, memoizedParseNotes]);

    useEffect(() => {
        if (openVideo && videoRef.current) {
            scannerRef.current = new QrScanner(
                videoRef.current,
                async (result) => {
                    if (result.data) {
                        const parseValue = await ParseEcashNotes(wallet,result.data)
                        if (parseValue !== undefined) {
                            dispatch(setParseEcashResult(parseValue));
                            setNotes(result.data)
                        } else {
                            console.error("Parsed value is undefined");
                            dispatch(setRedeemError('Parsed value is undefined'))
                            setTimeout(() => {
                                dispatch(setParseEcashError(''))
                            }, 3000);
                            setOpenVideo(false)
                        }
                        setOpenVideo(false)
                        scannerRef.current?.destroy()
                        scannerRef.current = null;
                    }
                },
                { returnDetailedScanResult: true }
            )
            scannerRef.current.start().then(() => {
                console.log("scanning started")
            }).catch((err) => {
                console.log(`${err}`)
                dispatch(setRedeemError('Scanning failed'))
                setTimeout(() => {
                    dispatch(setRedeemError(''))
                }, 3000);
            })
        }
    }, [openVideo])


    return (
        <>
            {(SpendEcashError || RedeemEcashError || ParseEcashError || RedeemEcashResult) && <Alerts key={Date.now()} Error={SpendEcashError || RedeemEcashError || ParseEcashError} Result={RedeemEcashResult || ''} />}
            {openVideo && (
                <div className="videoOverlay">
                    <div className='videoRef'>
                        <video width={'100%'} ref={videoRef}></video>
                        <button onClick={() => { scannerRef.current?.stop(); setOpenVideo(false) }}>Close</button>
                    </div>
                </div>
            )}
            <section className="BalanceSection" style={{ marginTop: "30px" }}>
                <div className="BalanceSectionTag">
                    <button>Transact Ecashes</button>
                </div>

                <div className="EcashTransactionWrapper">
                    <div className="SendSection">
                        <h3 className="TransactionHeading"><i className="fa-solid fa-money-bill-transfer"></i> Generate Ecash & Spend</h3>
                        <p>Manage ecash transfers in <Link to={'/wallet/setting'} style={{ textDecoration: 'none', color: '#004cff' }}>settings <i className="fa-solid fa-gear"></i></Link></p>
                        <form onSubmit={handleSpendEcash}>
                            <input type="number" placeholder="Enter amount" inputMode='numeric' ref={amount} required />
                            <button type="submit" disabled={status}>
                                <i className="fa-solid fa-money-bill-transfer"></i>
                                Generate & Spend
                            </button>
                        </form>
                        {SpendEcashResult && (
                            <div className='spendResult'>
                                <button type="button" style={{ padding: '8px 13px', border: 'none', fontSize: '17px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => { dispatch(setSpendResult('')) }}>Clear</button>
                                <div className='copyWrapper'>
                                    <p id="spendNotesResult" className="copyText">{SpendEcashResult}</p>
                                    <button
                                        className="copyBtnOverlay"
                                        onClick={() => {
                                            navigator.clipboard.writeText(SpendEcashResult);
                                        }}
                                    >
                                        <i className="fa-regular fa-copy"></i>
                                    </button>
                                </div>

                                <div className='qrCode'>
                                    <QRCode value={JSON.stringify(SpendEcashResult)} size={150} bgColor='white' fgColor='black' />
                                    <button onClick={() => { downloadQRCode('ecash') }}>Download QR</button>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="RecieveSection">
                        <h3 className="TransactionHeading"><i className="fa-solid fa-hand-holding-dollar"></i> Redeem Ecash</h3>
                        <form onSubmit={handleRedeemEcash}>
                            <input type="text" placeholder="Enter the notes" onChange={(e) => { setNotes(e.target.value) }} />
                            {ParseEcashResult && (
                                <div>
                                    <p style={{ fontSize: '17px', color: 'green' }}>Parsed Notes: {ParseEcashResult}</p>
                                    <p style={{ fontSize: '17px', color: 'red' }}>Confirm your redeemption!</p>
                                </div>
                            )}
                            <div className="ButtonRow">
                                <button type="submit" disabled={status}>
                                    <i className="fa-solid fa-hand-holding-dollar"></i> Confirm Redeem
                                </button>
                                <button type="button" disabled={status} onClick={() => { setOpenVideo(true) }}>
                                    <i className="fa-solid fa-qrcode"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}
