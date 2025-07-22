import QrScanner from "qr-scanner";
import { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router'
import QRCode from 'react-qr-code'
import { useWallet } from '../context/WalletManager'
import '../style/Ecash.css'
import { SpendEcash, RedeemEcash, ParseEcashNotes, subscribeSpend } from '../services/MintService'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setSpendResult, setParseEcashResult } from '../redux/slices/Mint'
import LoadingContext from '../context/loader'
import NProgress from 'nprogress'
import Alerts from './Alerts'
import { downloadQRCode } from '../services/DownloadQR';
import { convertToMsats, subscribeBalance } from "../services/BalanceService";
import logger from "../utils/logger";
import { setError, setResult } from "../redux/slices/Alerts";
import { setCurrency } from '../redux/slices/Balance';


export default function Ecash() {
    const [status, setStatus] = useState<boolean>(false)
    const [openVideo, setOpenVideo] = useState<boolean>(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [convertedAmountInMSat, setConvertedAmountInMSat] = useState<number>(0)
    const scannerRef = useRef<QrScanner | null>(null)
    const amount = useRef<HTMLInputElement | null>(null)
    const [notes, setNotes] = useState('')
    const { wallet } = useWallet()
    const { setLoading } = useContext(LoadingContext)
    const { SpendEcashResult, ParseEcashResult } = useSelector((state: RootState) => state.mint)
    const dispatch = useDispatch<AppDispatch>()
    const { currency } = useSelector((state: RootState) => state.balance)
    const { error, result } = useSelector((state: RootState) => state.Alert)

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = e.target.value;
        dispatch(setCurrency(selectedCurrency));
        localStorage.setItem('walletCurrency', selectedCurrency)
    }

    const handleSpendEcash = async (e: React.FormEvent) => {
        e.preventDefault()
        NProgress.start()
        setLoading(true)
        try {
            setStatus(true)

            if (convertedAmountInMSat && Number(convertedAmountInMSat) <= 0) {
                throw new Error("Spend amount should be greater than 0")
            }

            const result = await SpendEcash(wallet, convertedAmountInMSat)
            dispatch(setSpendResult(result))
            const unsubscribe = subscribeSpend(wallet, result.operationId, dispatch)
            setTimeout(() => {
                unsubscribe?.()
            }, 30000);
        } catch (err) {
            dispatch(setError({ type: 'Spend Error: ', message: err instanceof Error ? err.message : String(err) }))
            setTimeout(() => {
                dispatch(setError(null))
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
        try {
            if (!notes) {
                throw new Error("Notes value is required");
            }
            setStatus(true)

            const result = await RedeemEcash(wallet, notes);
            dispatch(setResult(result))
            subscribeBalance(wallet, dispatch)

            setTimeout(() => {
                dispatch(setResult(null))
                dispatch(setParseEcashResult(null))
            }, 3000);
        } catch (err) {
            logger.log(`An error occured ${err}`)
            dispatch(setError({ type: 'Redeem Error: ', message: err instanceof Error ? err.message : String(err) }))
            setTimeout(() => {
                dispatch(setError(null))
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
                            logger.error("Parsed value is undefined");
                            dispatch(setError({ type: 'Parse Error: ', message: 'Parsed value is undefined' }))
                            setTimeout(() => {
                                dispatch(setError(null))
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
                logger.log("scanning started")
            }).catch((err) => {
                logger.log(`${err}`)
                dispatch(setError({ type: 'QR Error: ', message: 'Scanning failed' }))
                setTimeout(() => {
                    dispatch(setError(null))
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
            {(error || result) && <Alerts key={Date.now()} Error={error} Result={result} />}
            {openVideo && (
                <div className="video-overlay">
                    <div className="video-container">
                        <div className="video-header">
                            <h3>Scan QR Code</h3>
                            <button
                                className="close-btn"
                                onClick={() => { scannerRef.current?.stop(); setOpenVideo(false) }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="video-wrapper">
                            <video width={'100%'} ref={videoRef}></video>
                        </div>
                    </div>
                </div>
            )}

            <section className="ecash-section">
                <div className="ecash-container">
                    <div className="ecash-card spend-card">
                        <div className="card-header">
                            <div className="header-icon spend-icon">
                                <i className="fa-solid fa-money-bill-transfer"></i>
                            </div>
                            <div className="header-content">
                                <h3 className="card-title">Generate Ecash & Spend</h3>
                                <p className="card-subtitle">
                                    You can change the currency from{' '}
                                    <Link to={'/settings'} className="settings-link">
                                        <i className="fa-solid fa-gear"></i> Settings
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSpendEcash} className="ecash-form">
                            <div className="form-group">
                                <label htmlFor="Ecashamount" className="form-label">
                                    Enter amount in {currency}:
                                </label>
                                <div className="input-group">
                                    <input
                                        type="decimal"
                                        id="Ecashamount"
                                        className="amount-input"
                                        placeholder={`Enter amount in ${currency}`}
                                        inputMode='decimal'
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
                            </div>

                            <button type="submit" disabled={status} className="ecash-primary-btn spend-btn">
                                <i className="fa-solid fa-money-bill-transfer"></i>
                                <span>Generate & Spend</span>
                            </button>
                        </form>

                        {SpendEcashResult && (
                            <div className='spend-result'>
                                <div className="result-header">
                                    <h4>Generated Ecash</h4>
                                    <button
                                        type="button"
                                        className="clear-btn"
                                        onClick={() => { dispatch(setSpendResult(null)) }}
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div className='copy-section'>
                                    <div className="copy-wrapper">
                                        <p id="spendNotesResult" className="notes-text">
                                            {SpendEcashResult.notes}
                                        </p>
                                        <button
                                            className="copy-btn"
                                            onClick={() => {
                                                navigator.clipboard.writeText(SpendEcashResult.notes);
                                            }}
                                        >
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className='qr-section'>
                                    <div className="qr-container">
                                        <QRCode
                                            value={JSON.stringify(SpendEcashResult)}
                                            size={150}
                                            bgColor='white'
                                            fgColor='black'
                                        />
                                    </div>
                                    <button
                                        onClick={() => { downloadQRCode('ecash') }}
                                        className="download-btn"
                                    >
                                        <i className="fa-solid fa-download"></i>
                                        Download QR
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="ecash-card receive-card">
                        <div className="card-header">
                            <div className="header-icon receive-icon">
                                <i className="fa-solid fa-hand-holding-dollar"></i>
                            </div>
                            <div className="header-content">
                                <h3 className="card-title">Redeem Ecash</h3>
                                <p className="card-subtitle">
                                    Enter the notes manually or scan QR code
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleRedeemEcash} className="ecash-form">
                            <div className="form-group">
                                <label htmlFor="notesvalue" className="form-label">
                                    Enter or Scan the notes:
                                </label>
                                <div className="textarea-wrapper">
                                    <textarea
                                        id="notesvalue"
                                        placeholder="Enter the notes"
                                        value={notes}
                                        onChange={(e) => { setNotes(e.target.value) }}
                                        className="form-textarea"
                                    />
                                </div>
                            </div>

                            {ParseEcashResult && (
                                <div className="parse-result">
                                    <div className="success-message">
                                        <i className="fa-solid fa-circle-check"></i>
                                        <span>{ParseEcashResult}</span>
                                    </div>
                                </div>
                            )}

                            <div className="button-group">
                                <button type="submit" disabled={status} className="ecash-primary-btn redeem-btn">
                                    <i className="fa-solid fa-hand-holding-dollar"></i>
                                    <span>Confirm Redeem</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={status}
                                    onClick={() => { setOpenVideo(true) }}
                                    className="secondary-btn scan-btn"
                                >
                                    <i className="fa-solid fa-qrcode"></i>
                                    <span>Scan QR</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}
