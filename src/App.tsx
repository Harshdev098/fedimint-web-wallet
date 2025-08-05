import { Routes, Route, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { isInitialized, initialize, hasWallet, listClients, setLogLevel } from "@fedimint/core-web"
import './style/App.css'
import JoinFederation from './pages/JoinFederation'
import Wallet from './Wallet'
import { LoadingProvider } from './context/Loading.tsx'
import 'nprogress/nprogress.css'
import { WalletManagerProvider } from './context/WalletManager.tsx'
import { NostrProvider } from './context/nostr.tsx'
import webloader from './assets/loader.webp'
import logger from "./utils/logger"
import 'tippy.js/dist/tippy.css';

function AppInitializer({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate()
    const [isAppReady, setIsAppReady] = useState(false)

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Initialize SDK if not already done
                if (!isInitialized()) {
                    await initialize()
                    logger.log("SDK initialized")
                }

                if (localStorage.getItem('appDebug') === 'true') {
                    setLogLevel('debug')
                }

                const walletList = await listClients()
                logger.log("walletlist is ",walletList)
                let targetWalletId = localStorage.getItem('lastUsedWallet') || localStorage.getItem('activeWallet')

                // If we have a target wallet ID and it exists, navigate to wallet
                if (targetWalletId && hasWallet(targetWalletId)) {
                    logger.log("Found existing wallet")
                    if (!window.location.pathname.startsWith('/fedimint-web-wallet/wallet')) {
                        navigate('/wallet');
                    }
                } else if (walletList.length > 0) {
                    logger.log('loggere',walletList[0].id)
                    // If we have wallets but no specific target, use the first one
                    localStorage.setItem('activeWallet', walletList[0].id)
                    localStorage.setItem('lastUsedWallet', walletList[0].id)
                    if (!window.location.pathname.startsWith('/fedimint-web-wallet/wallet')) {
                        navigate('/wallet');
                    }
                } else {
                    logger.log("No wallets found, staying on join page")
                    // Only navigate if we're not already on the home page
                    if (window.location.pathname !== '/') {
                        navigate('/')
                    }
                }
                setIsAppReady(true)
            } catch (error) {
                logger.error("Failed to initialize app:", error)
                setIsAppReady(true)
                navigate('/')
            }
        }
        initializeApp()
    }, [])

    if (!isAppReady) {
        return (
            <div className="web-loader">
                <img src={webloader} alt="loading" />
            </div>
        )
    }

    return <>{children}</>
}

function App() {
    const WalletRoutes = () => {
        return (
            <WalletManagerProvider>
                <NostrProvider>
                    <Routes>
                        <Route path="/*" element={<Wallet />} />
                    </Routes>
                </NostrProvider>
            </WalletManagerProvider>
        )
    }
    
    const JoinFederationWithNostr = () => {
        return (
            <NostrProvider>
                <JoinFederation />
            </NostrProvider>
        )
    }

    return (
        <LoadingProvider>
            <AppInitializer>
                <Routes>
                    <Route path='/' element={<JoinFederationWithNostr />} />
                    <Route path='/wallet/*' element={<WalletRoutes />} />
                </Routes>
            </AppInitializer>
        </LoadingProvider>
    )
}

export default App