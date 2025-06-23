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
import { createNotification } from '../redux/slices/NotificationSlice';
import type { SpendNotesState } from "@fedimint/core-web";
import { convertToMsats } from "../services/BalanceService";


export default function Ecash() {
    const [status, setStatus] = useState<boolean>(false)
    const [openVideo, setOpenVideo] = useState<boolean>(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [convertedAmountInMSat, setConvertedAmountInMSat] = useState<number>(0)
    const scannerRef = useRef<QrScanner | null>(null)
    const amount = useRef<HTMLInputElement | null>(null)
    const [notes, setNotes] = useState('')
    const { wallet } = useContext(WalletContext)
    const { setLoading } = useContext(LoadingContext)
    const { SpendEcashError, SpendEcashResult, RedeemEcashResult, RedeemEcashError, ParseEcashResult, ParseEcashError } = useSelector((state: RootState) => state.mint)
    const dispatch = useDispatch<AppDispatch>()
    const { currency } = useSelector((state: RootState) => state.balance)

    const subscribeBalanceChange = () => {
        const unsubscribeBalance = wallet.balance.subscribeBalance((mSats) => {
            console.log('Balance updated:', mSats);
            dispatch(setBalance(mSats));
            setTimeout(() => {
                unsubscribeBalance?.();
            }, 10000);
        });
    }

    const handleSpendEcash = async (e: React.FormEvent) => {
        e.preventDefault()
        NProgress.start()
        setLoading(true)
        if (!(wallet.isOpen())) {
            await wallet?.open()
        }
        try {
            setStatus(true)

            if (convertedAmountInMSat && Number(convertedAmountInMSat) <= 0) {
                throw new Error("Spend amount should be greater than 0")
            }

            const result = await SpendEcash(wallet, convertedAmountInMSat)
            dispatch(setSpendResult(result))

            wallet.mint.subscribeSpendNotes(
                result.operationId,
                (state: SpendNotesState) => {
                    console.log("state is ", state)
                    const date = (new Date()).toDateString()
                    const time = (new Date()).toTimeString()
                    if (state === 'UserCanceledProcessing') {
                        dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes Cancelled processing', date: date, time: time, OperationId: result.operationId }))
                    } else if (state === 'UserCanceledSuccess') {
                        dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes Cancelled success', date: date, time: time, OperationId: result.operationId }))
                    } else if (state === 'UserCanceledFailure') {
                        dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes Cancelled failed', date: date, time: time, OperationId: result.operationId }))
                    } else if (state === 'Success') {
                        dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes success', date: date, time: time, OperationId: result.operationId }))
                    }
                },
                (error) => {
                    console.error("Spend notes subscription error:", error);
                    dispatch(setSpendError(error))
                }
            );
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
                setConvertedAmountInMSat(0)
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
            dispatch(setRedeemResult(result))
            subscribeBalanceChange()

            setTimeout(() => {
                dispatch(setRedeemResult(''))
                dispatch(setParseEcashResult(null))
            }, 3000);
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
            setNotes('')
        }
    }

    const memoizedParseNotes = useCallback(async (notesValue: string) => {
        const result = await ParseEcashNotes(wallet, notesValue);
        if (result !== undefined) {
            dispatch(setParseEcashResult(`Parsed Notes: ${result / 1000}sat (${result}msat)`));
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
                        const parseValue = await ParseEcashNotes(wallet, result.data)
                        if (parseValue !== undefined) {
                            dispatch(setParseEcashResult(`Parsed Notes: ${parseValue / 1000}sat (${parseValue}msat)`));
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

    const handleConversion = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = await convertToMsats(Number((e.target.value).trim()), currency)
        setConvertedAmountInMSat(amount)
    }

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
                        <p style={{marginTop:'0px'}}>You can change the currency from <Link to={'/settings'} style={{color:'#0f61b9',textDecoration:'none'}}><i className="fa-solid fa-gear"></i> Settings</Link></p>
                        <form onSubmit={handleSpendEcash}>
                            <label htmlFor="Ecashamount">Enter amount in {currency}:</label>
                            <input type="decimal" id="Ecashamount" placeholder={`Enter amount in ${currency}`} inputMode='decimal' ref={amount} onChange={handleConversion} required />
                            <span style={{color:'green',padding:'8px'}}>Entered amount in msats: {convertedAmountInMSat}</span>
                            <button type="submit" disabled={status}>
                                <i className="fa-solid fa-money-bill-transfer"></i>
                                Generate & Spend
                            </button>
                        </form>
                        {SpendEcashResult && (
                            <div className='spendResult'>
                                <button type="button" style={{ padding: '8px 13px', border: 'none', fontSize: '17px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => { dispatch(setSpendResult(null)) }}>Clear</button>
                                <div className='copyWrapper'>
                                    <p id="spendNotesResult" className="copyText">{SpendEcashResult.notes}</p>
                                    <button
                                        className="copyBtnOverlay"
                                        onClick={() => {
                                            navigator.clipboard.writeText(SpendEcashResult.notes);
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
                            <label htmlFor="notesvalue">Enter or Scan the notes:</label>
                            <input type="text" id="notesvalue" placeholder="Enter the notes" value={notes} onChange={(e) => { setNotes(e.target.value) }} />
                            {ParseEcashResult && (
                                <div>
                                    <p style={{ fontSize: '17px', color: 'green' }}>{ParseEcashResult}</p>
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
