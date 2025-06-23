import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from "react-router";
// import GTranslator from '../Components/GTranslator';
import QRCode from 'react-qr-code';
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
import WalletContext from '../context/wallet';
import { setCurrency } from '../redux/slices/Balance';
import { convertFromMsat } from '../services/BalanceService';
import LoadingContext from '../context/loader';
import NProgress from 'nprogress';
// import { DownloadTransactionsCSV } from '../services/DownloadQR';
import Alerts from '../Components/Alerts';
import { downloadQRCode } from '../services/DownloadQR';


export default function Settings() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { setLoading } = useContext(LoadingContext);
    const [openAccordion, setOpenAccordion] = useState(null);
    const { metaData } = useSelector((state: RootState) => state.federationdetails)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { wallet, nwcEnabled, nwcURL, generateNWCConnection, nwcRelays, setNWCRelays } = useContext(WalletContext)
    const [balance, setBalance] = useState(0)
    const [error, setError] = useState('')
    const [autoPay, setAutoPay] = useState(localStorage.getItem('autoPayNostr') === 'true' ? true : false)
    const [relayUrl, setRelayURL] = useState('')
    const [enabledLocation, setEnabledLocation] = useState(localStorage.getItem('locationAccess') === 'true' ? true : false)

    const toggleAccordion = (index: any) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const fetchBalance = async () => {
        try {
            NProgress.start()
            setLoading(true)
            const result = await wallet.balance.getBalance()
            const convertedAmount = await convertFromMsat(result, currency)
            setBalance(convertedAmount)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            setTimeout(() => {
                setError('')
            }, 3000);
        } finally {
            NProgress.done()
            setLoading(false)
        }
    }

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = e.target.value;
        dispatch(setCurrency(selectedCurrency));
        localStorage.setItem('walletCurrency', selectedCurrency)
    };

    const handleAutoNostrPay = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setAutoPay(newValue);
        localStorage.setItem('autoPayNostr', newValue.toString());
    };

    const handleToggleLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        if (enabledLocation === true && newValue === false) {
            if (confirm("all the geoLocation data will be removed from your storage")) {
                localStorage.setItem('locationAccess', newValue.toString());
                localStorage.removeItem('paymentLocations')
                setEnabledLocation(newValue);
            }
        } else {
            setEnabledLocation(newValue);
            localStorage.setItem('locationAccess', newValue.toString());
        }
    }

    const isValidRelayUrl = (url: string): boolean => {
        const regex = /^wss?:\/\/[^\s/$.?#].[^\s]*$/i;
        return regex.test(url);
    };


    const handleConfigureRelay = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidRelayUrl(relayUrl)) {
            return alert("Invalid WebSocket relay URL format.");
        }
        if (relayUrl && !nwcRelays.includes(relayUrl)) {
            const updated = [...nwcRelays, relayUrl];
            localStorage.setItem('nwcRelays', JSON.stringify(updated));
            setNWCRelays(updated)
            setRelayURL('');
        }
    }


    const handleLeaveFederations = async () => {
        try {
            NProgress.start()
            setLoading(true)
            await wallet.cleanup();
            console.log('wallet cleanup called')
            await wallet.waitForOpen().catch(() => {
                console.log('Wallet is closed');
            });
            indexedDB.deleteDatabase(`${localStorage.getItem('walletName')}`);
            localStorage.removeItem('walletName')
            localStorage.removeItem('activeFederation')
            if (!wallet.isOpen()) {
                console.log('wallet open ', wallet.isOpen())
                navigate('/')
            }
        } catch (err) {
            console.log("an error occured")
            setError(err instanceof Error ? err.message : String(err))
            setTimeout(() => {
                setError('')
            }, 3000);
        } finally {
            NProgress.done()
            setLoading(false)
        }
    }

    const handleDownloadTransactions = async () => {
        // try {
        //     NProgress.start()
        //     setLoading(true)
        //     const transactions = await wallet.federation.listTransactions()
        //     if (transactions.length === 0) throw new Error("0 Transactions found")
        //     DownloadTransactionsCSV(transactions)
        // } catch (err) {
        //     console.log('an error occured')
        //     setError(err instanceof Error ? err.message : String(err))
        //     setTimeout(() => {
        //         setError('')
        //     }, 3000);
        // } finally {
        //     NProgress.done()
        //     setLoading(false)
        // }
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
                <section>
                    <p className="setting-label">Basic settings</p>
                    <div className='faq'>
                        <div className="accordion">
                            {metaData?.federation_expiry_timestamp && <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 0 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(0)}
                                    >
                                        Federation timestamp
                                    </button>
                                </div>
                                <div
                                    className={`accordion-collapse ${openAccordion === 0 ? 'show' : ''}`}
                                >
                                    <div className="accordion-body">
                                        <p>{metaData.federation_expiry_timestamp}</p>
                                    </div>
                                </div>
                            </div>}
                            {metaData?.pinned_message && <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 1 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(1)}
                                    >
                                        Pinned Message
                                    </button>
                                </div>
                                <div
                                    className={`accordion-collapse ${openAccordion === 1 ? 'show' : ''}`}
                                >
                                    <div className="accordion-body">
                                        <p>{metaData.pinned_message}</p>
                                    </div>
                                </div>
                            </div>}
                            {metaData?.welcome_message && <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 2 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(2)}
                                    >
                                        Welcome Message
                                    </button>
                                </div>
                                <div
                                    className={`accordion-collapse ${openAccordion === 2 ? 'show' : ''}`}
                                >
                                    <div className="accordion-body">
                                        <p>{metaData.welcome_message}</p>
                                    </div>
                                </div>
                            </div>}
                            <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className="accordion-button collapsed"
                                        onClick={() => toggleAccordion(999)}
                                        disabled
                                        style={{ cursor: 'default', backgroundColor: 'transparent' }}
                                    >
                                        Enable Geolocation
                                    </button>
                                </div>
                                <div className="accordion-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Fedimint will not track users data. Location will be saved locally</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={enabledLocation}
                                            onChange={handleToggleLocation}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="setting-div">
                        <p className="language-label">Languages</p>
                        {/* <GTranslator /> */}
                    </div>
                    <div className="setting-div">
                        <p className="language-label">Display currency</p>
                        <select className='setting-options' value={currency} onChange={handleCurrencyChange}>
                            <option value={'msat'}>msat</option>
                            <option value={'sat'}>sat</option>
                            <option value={'usd'}>USD</option>
                            <option value={'euro'}>EURO</option>
                        </select>
                    </div>
                    <div className="setting-div">
                        <p className="language-label">Export Trnasactions</p>
                        <i className="fa-solid fa-download" style={{ padding: "2px", margin: '0px 20px', cursor: 'pointer' }} onClick={handleDownloadTransactions}></i>
                    </div>
                    <p className="setting-label">Federations</p>
                    <ul className="federation-list">
                        {metaData && <li>
                            <p style={{ padding: '0px', margin: '0px' }}>{metaData.federation_name}</p>
                            <div>
                                <Link to={`/federation/${federationId || localStorage.getItem('activeFederation')}`} ><i
                                    className="fa-solid fa-arrow-up-right-from-square"
                                ></i></Link>
                                <i className="fa-solid fa-arrow-right-from-bracket" title='Leave Federation' onClick={handleLeaveFederations}></i>
                            </div>
                        </li>}
                    </ul>
                    <p className="setting-label">Fedimint</p>
                    <div className="setting-div">
                        <p className="language-label">Ask Fedimint</p>
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </div>
                    <div className="setting-div">
                        <p className="language-label">Terms of services</p>
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </div>
                    <p className="setting-label">Nostr Settings</p>
                    <div className='faq'>
                        <div className="accordion">
                            <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 0 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(0)}
                                    >
                                        Nostr Wallet Connect
                                    </button>
                                </div>
                                <div className={`accordion-collapse ${openAccordion === 0 ? 'show' : ''}`} >
                                    <div className="accordion-body">
                                        {nwcEnabled === false ? <div style={{ wordBreak: 'break-word' }}>
                                            <p>Nostr Wallet Connect will be enabled with Generating and connecting the client app</p>
                                            <button onClick={generateNWCConnection}>Generate Nostr Connection link</button>
                                        </div> : <div style={{ wordBreak: 'break-word' }}>
                                            <p
                                                title='Click to copy'
                                                onClick={() => { navigator.clipboard.writeText(nwcURL || ''); }}
                                            >
                                                {nwcURL ? nwcURL : "Can't load the connection url"}
                                            </p>
                                            <p>Auto payment is enabled by defualt</p>
                                        </div>}
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 1 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(1)}
                                    >
                                        Nostr Relays
                                    </button>
                                </div>
                                <div
                                    className={`accordion-collapse ${openAccordion === 1 ? 'show' : ''}`}
                                >
                                    <div className="accordion-body">
                                        <ul>
                                            {nwcRelays.map((relay, id) => (
                                                <li key={id}>{relay}</li>
                                            ))}
                                        </ul>
                                        <form onSubmit={handleConfigureRelay}>
                                            <input type="text" placeholder='Enter the relay url' onChange={(e) => setRelayURL(e.target.value)} />
                                            <button type='submit'>Add</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className="accordion-button collapsed"
                                        onClick={() => toggleAccordion(999)}
                                        disabled
                                        style={{ cursor: 'default', backgroundColor: 'transparent' }}
                                    >
                                        Auto Nostr Payments
                                    </button>
                                </div>
                                <div className="accordion-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Enable automatic Nostr payments</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={autoPay}
                                            onChange={handleAutoNostrPay}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>
                    <p className="setting-label">FAQs</p>
                    <div className="faq">
                        <div className="accordion">
                            <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 0 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(0)}
                                    >
                                        What is Fedimint?
                                    </button>
                                </div>
                                <div
                                    className={`accordion-collapse ${openAccordion === 0 ? 'show' : ''}`}
                                >
                                    <div className="accordion-body">
                                        Fedimint is a federated protocol that enables community-based custody and management of Bitcoin, providing privacy and scalability through a trusted group of guardians.
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 1 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(1)}
                                    >
                                        How do I join a federation?
                                    </button>
                                </div>
                                <div
                                    className={`accordion-collapse ${openAccordion === 1 ? 'show' : ''}`}
                                >
                                    <div className="accordion-body">
                                        To join a federation, you typically need an invitation from an existing member or guardian. Navigate to the Federations section and follow the link to explore available groups.
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <div className="accordion-header">
                                    <button
                                        className={`accordion-button ${openAccordion === 2 ? '' : 'collapsed'}`}
                                        onClick={() => toggleAccordion(2)}
                                    >
                                        What are the benefits of using Fedimint?
                                    </button>
                                </div>
                                <div
                                    className={`accordion-collapse ${openAccordion === 2 ? 'show' : ''}`}
                                >
                                    <div className="accordion-body">
                                        Fedimint offers enhanced privacy, lower transaction fees, and faster confirmations by leveraging a federated model, making it ideal for communities seeking scalable Bitcoin solutions.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="setting-label">Community</p>
                    <section className="community-links">
                        <a href="https://discord.gg/8xn55stq" target="_blank" rel="noopener noreferrer" className="community-link">
                            <i className="fa-brands fa-discord"></i>
                        </a>
                        <a href="https://primal.net/p/nprofile1qqsgwgkrss7gthwkzc49edgxu895664setaevcp57snw2k3wlzdrghswflshg" target="_blank" rel="noopener noreferrer" className="community-link">
                            <i className="fa-solid fa-bolt"></i>
                        </a>
                        <a href="https://twitter.com/fedimint" target="_blank" rel="noopener noreferrer" className="community-link">
                            <i className="fa-brands fa-twitter"></i>
                        </a>
                        <a href="https://t.me/fedimint" target="_blank" rel="noopener noreferrer" className="community-link">
                            <i className="fa-brands fa-telegram"></i>
                        </a>
                    </section>
                    <div className="setting-div">
                        <p className="language-label">Report Bug</p>
                        <Link to={'https://github.com/Harshdev098/fedimint-web-wallet/issues'} target='_blank'><i className="fa-solid fa-arrow-up-right-from-square"></i></Link>
                    </div>
                    <p className="setting-label">Contact</p>
                    <section className="contact-details">
                        <a href="mailto:elsirion@protonmail.com" className="contact-email">
                            elsirion@protonmail.com
                        </a>
                    </section>
                </section >
            </main>
        </>
    );
}