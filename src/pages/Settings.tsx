import { useState, useContext, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
import { useWallet } from '../context/wallet';
import { convertFromMsat } from '../services/BalanceService';
import LoadingContext from '../context/loader';
import NProgress from 'nprogress';
import Alerts from '../Components/Alerts';
import { downloadQRCode } from '../services/DownloadQR';
import Nostr from '../Components/Nostr';
import Faq from '../Components/Faq';
import Footer from '../Components/Footer';
import BasicSettings from '../Components/BasicSettings';
import { setError } from '../redux/slices/Alerts';
import '../style/Settings.css'


export default function Settings() {
    const { setLoading } = useContext(LoadingContext);
    const { metaData } = useSelector((state: RootState) => state.federationdetails)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { wallet } = useWallet()
    const [balance, setBalance] = useState(0)
    const { error } = useSelector((state: RootState) => state.Alert)


    const fetchBalance = async () => {
        try {
            NProgress.start()
            setLoading(true)
            const result = await wallet.balance.getBalance()
            const convertedAmount = await convertFromMsat(result, currency)
            setBalance(convertedAmount)
        } catch (err) {
            setError({ type: 'Balance Error: ', message: err instanceof Error ? err.message : String(err) })
            setTimeout(() => {
                setError(null)
            }, 3000);
        } finally {
            NProgress.done()
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [balance, currency])

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
                            <span className="wallet-value">{localStorage.getItem('joinDate') || 'N/A'}</span>
                        </div>
                        <div className="wallet-item">
                            <span className="wallet-label">Navigate to other wallet:</span>
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

                    <Nostr />

                    <Faq />

                    <Footer />
                </section>
            </main>
        </>
    );
}
