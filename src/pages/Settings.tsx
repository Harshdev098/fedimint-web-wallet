import { useState, useContext, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
import { useWallet } from '../context/WalletManager';
import { convertFromMsat } from '../services/BalanceService';
import LoadingContext from '../context/Loading';
import { startProgress, doneProgress } from '../utils/ProgressBar';
import Alerts from '../Components/Alerts';
import { downloadQRCode } from '../services/DownloadQR';
import Faq from '../Components/Faq';
import Footer from '../Components/Footer';
import BasicSettings from '../Components/BasicSettings';
import { setErrorWithTimeout } from '../redux/slices/Alerts';
import '../style/Settings.css'
import { getMnemonic, getWalletInfo } from '@fedimint/core-web';
import NostrSettings from '../Components/NostrSettings';


export default function Settings() {
    const { setLoader } = useContext(LoadingContext);
    const { metaData } = useSelector((state: RootState) => state.federationdetails)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { wallet } = useWallet()
    const [balance, setBalance] = useState(0)
    const [joinDate, setJoinDate] = useState<number | undefined>(undefined)
    const [mnemonics, setMnemonics] = useState<string[]>([])
    const [lastAccess, setLastAccess] = useState<number | undefined>(undefined)
    const { federationId, walletId } = useSelector((state: RootState) => state.activeFederation)
    const { error } = useSelector((state: RootState) => state.Alert)
    const [showMnemonics, setShowMnemonics] = useState(false);


    const fetchBasicWalletDetails = async () => {
        try {
            startProgress()
            setLoader(true)
            const result = await wallet.balance.getBalance()
            const convertedAmount = await convertFromMsat(result, currency)
            const joinDate = getWalletInfo(walletId)?.createdAt
            const lastAccess = getWalletInfo(walletId)?.lastAccessedAt
            const walletMnemonics = await getMnemonic()
            setBalance(convertedAmount)
            setMnemonics(walletMnemonics)
            setJoinDate(joinDate)
            setLastAccess(lastAccess)
        } catch (err) {
            setErrorWithTimeout({ type: 'Balance Error: ', message: err instanceof Error ? err.message : String(err) })
        } finally {
            doneProgress()
            setLoader(false)
        }
    }

    useEffect(() => {
        fetchBasicWalletDetails();
    }, [balance, currency, federationId, walletId])

    return (
        <>
            {error && <Alerts Error={error} Result='' />}
            <main className='setting-container'>
                <section className='wallet-container'>
                    <section className="wallet-details">
                        <div className="wallet-item">
                            <span className="wallet-label">Wallet Name:</span>
                            <span className="wallet-value">{localStorage.getItem('walletName') || 'N/A'}</span>
                        </div>
                        <div className="wallet-item">
                            <span className="wallet-label">Balance:</span>
                            <span className="wallet-value">{balance} {currency.toUpperCase()}</span>
                        </div>
                        <div className="wallet-item">
                            <span className="wallet-label">Join Date:</span>
                            <span className="wallet-value">{joinDate ? new Date(joinDate).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="wallet-item">
                            <span className="wallet-label">Last Accessed:</span>
                            <span className="wallet-value">{lastAccess ? new Date(lastAccess).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="wallet-item mnemonic-item">
                            <span className="wallet-label">Wallet Mnemonics:</span>

                            {/* Simple Security Warning */}
                            <div className="simple-warning">
                                <p><strong>⚠️ Never share your recovery phrase with anyone</strong></p>
                                <p>Store it safely - this is the ONLY way to recover your wallet, if lost</p>
                            </div>

                            <div className="mnemonic-header">
                                <button
                                    className="mnemonic-toggle"
                                    onClick={() => setShowMnemonics(!showMnemonics)}
                                >
                                    {showMnemonics ? (
                                        <>
                                            <i className="fa-solid fa-eye-slash"></i>
                                            <span>Hide Phrase</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-eye"></i>
                                            <span>Show Phrase</span>
                                        </>
                                    )}
                                </button>

                                {mnemonics.length > 0 && showMnemonics && (
                                    <button className="copy-all-btn" onClick={() => navigator.clipboard.writeText(mnemonics.join(' '))}>
                                        <i className="fa-solid fa-copy"></i>
                                    </button>
                                )}
                            </div>

                            <div className="mnemonic-list">
                                {mnemonics.map((word, index) => (
                                    <span key={index} className="mnemonic-word">
                                        {showMnemonics === true ? `${index + 1}. ${word}` : `••••••`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="invite-code">
                        <div className="qr-code-wrapper">
                            <div className='qrCode'>
                                <QRCode value={`${metaData?.invite_code}`} bgColor='white' fgColor='black' />
                                <button onClick={() => { downloadQRCode('inviteCode') }}>Download QR</button>
                            </div>
                            <p className="invite-code-text">Share the code with your friends!</p>
                            <p className="invite-code-value">{`${(metaData?.invite_code)?.slice(0, 18)}...`}</p><i className="fa-solid fa-copy" style={{ cursor: 'pointer', padding: '0px 4px', color: 'rgb(28, 116, 230)' }} onClick={() => navigator.clipboard.writeText(metaData?.invite_code || '')}></i>
                        </div>
                    </section>
                </section>
                <section className='modern-settings'>

                    <BasicSettings />

                    <NostrSettings />

                    <Faq />

                    <Footer />
                </section>
            </main>
        </>
    );
}
