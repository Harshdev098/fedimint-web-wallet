import { useState, useContext } from "react";
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
import { setMode } from '../redux/slices/Mode';
import logger from "../utils/logger";
import WalletContext from "../context/wallet";
import { setCurrency } from '../redux/slices/Balance';
import { useNavigate } from "react-router";
import LoadingContext from '../context/loader';
import NProgress from 'nprogress';
import { DownloadTransactionsCSV } from "../services/DownloadQR";
import Alerts from "./Alerts";


export default function BasicSettings() {
    const dispatch = useDispatch()
    const { metaData } = useSelector((state: RootState) => state.federationdetails)
    const [enabledLocation, setEnabledLocation] = useState(localStorage.getItem('locationAccess') === 'true' ? true : false)
    const { mode } = useSelector((state: RootState) => state.Mode)
    const { wallet, isDebug, toggleDebug } = useContext(WalletContext)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const { setLoading } = useContext(LoadingContext);
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = e.target.value;
        dispatch(setCurrency(selectedCurrency));
        localStorage.setItem('walletCurrency', selectedCurrency)
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

    const toggleMode = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked
        dispatch(setMode(newValue))
        localStorage.setItem('appMode', JSON.stringify(newValue))
        logger.log("mode toggled")
    }

    const handleLeaveFederations = async () => {
        try {
            NProgress.start()
            setLoading(true)
            await wallet.cleanup();
            logger.log('wallet cleanup called')
            await wallet.waitForOpen().catch(() => {
                logger.log('Wallet is closed');
            });
            indexedDB.deleteDatabase(`${localStorage.getItem('walletName')}`);
            localStorage.removeItem('walletName')
            localStorage.removeItem('activeFederation')
            localStorage.removeItem('WalletNostrKeys')
            localStorage.removeItem('ClientRelayKeys')
            localStorage.removeItem('nwcRelays')
            localStorage.removeItem('nwcEnabled')
            if (!wallet.isOpen()) {
                logger.log('wallet open ', wallet.isOpen())
                navigate('/')
                window.location.reload()
            }
        } catch (err) {
            logger.log("an error occured")
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
        try {
            NProgress.start()
            setLoading(true)
            const transactions = await wallet.federation.listTransactions()
            if (transactions.length === 0) throw new Error("0 Transactions found")
            DownloadTransactionsCSV(transactions)
        } catch (err) {
            logger.log('an error occured')
            setError(err instanceof Error ? err.message : String(err))
            setTimeout(() => {
                setError('')
            }, 3000);
        } finally {
            NProgress.done()
            setLoading(false)
        }
    }

    return (
        <>
            {error && <Alerts Error={error} Result='' />}

            <div className="settings-container">
                {/* Federation Information Section */}
                {(metaData?.federation_expiry_timestamp || metaData?.pinned_message || metaData?.welcome_message) && (
                    <div className="settings-section">
                        <h2 className="section-title">Federation Information</h2>
                        <div className="info-cards">
                            {metaData?.federation_expiry_timestamp && (
                                <div className="info-card">
                                    <div className="info-header">
                                        <h3>Federation Expiry</h3>
                                    </div>
                                    <div className="info-content">
                                        <p>{metaData.federation_expiry_timestamp}</p>
                                    </div>
                                </div>
                            )}

                            {metaData?.pinned_message && (
                                <div className="info-card">
                                    <div className="info-header">
                                        <h3>Pinned Message</h3>
                                    </div>
                                    <div className="info-content">
                                        <p>{metaData.pinned_message}</p>
                                    </div>
                                </div>
                            )}

                            {metaData?.welcome_message && (
                                <div className="info-card">
                                    <div className="info-header">
                                        <h3>Welcome Message</h3>
                                    </div>
                                    <div className="info-content">
                                        <p>{metaData.welcome_message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Preferences Section */}
                <div className="settings-section">
                    <h2 className="section-title">Preferences</h2>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>Geolocation</h3>
                                <p>Fedimint will not track users data. Location will be saved locally.</p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={enabledLocation}
                                        onChange={handleToggleLocation}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>Theme</h3>
                                <p>Enable {mode === true ? 'Dark' : 'Light'} mode</p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={mode}
                                        onChange={toggleMode}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>Developer Mode</h3>
                                <p>{isDebug === true ? 'Disable' : 'Enable'} Developer mode</p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isDebug}
                                        onChange={toggleDebug}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Section */}
                <div className="settings-section">
                    <h2 className="section-title">Configuration</h2>
                    <div className="config-grid">
                        <div className="config-item">
                            <label className="config-label">Display Currency</label>
                            <select className="config-select" value={currency} onChange={handleCurrencyChange}>
                                <option value={'msat'}>msat</option>
                                <option value={'sat'}>sat</option>
                                <option value={'usd'}>USD</option>
                                <option value={'euro'}>EURO</option>
                            </select>
                        </div>

                        <div className="config-item">
                            <label className="config-label">Export Transactions</label>
                            <button className="export-btn" onClick={handleDownloadTransactions}>
                                <i className="fa-solid fa-download"></i>
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Federations Section */}
                <div className="settings-section">
                    <h2 className="section-title">Federations</h2>
                    <div className="federation-container">
                        {metaData && (
                            <div className="federation-card">
                                <div className="federation-info">
                                    <h3>{metaData.federation_name}</h3>
                                    <span className="federation-status">Active</span>
                                </div>
                                <div className="federation-actions">
                                    <a href={`/fedimint-web-wallet/federation/${federationId || localStorage.getItem('activeFederation')}`} className="action-btn view-btn">
                                        {/* <i className="fa-solid fa-arrow-up-right-from-square"></i> */}
                                        View
                                    </a>
                                    <button className="action-btn leave-btn" onClick={handleLeaveFederations} title="Leave Federation">
                                        {/* <i className="fa-solid fa-arrow-right-from-bracket"></i> */}
                                        Leave
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
