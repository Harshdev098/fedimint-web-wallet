import { Routes, Route, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { isInitialized, initialize, hasWallet, listClients, setLogLevel } from "@fedimint/core-web"
import './style/App.css'
import JoinFederation from './pages/JoinFederation'
import Wallet from './Wallet'
import { LoadingProvider } from './context/loader'
import 'nprogress/nprogress.css'
import Federations from './pages/Federations'
import { WalletManagerProvider } from './context/WalletManager.tsx'
import webloader from './assets/loader.webp'
import logger from "./utils/logger"

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
                let targetWalletId = localStorage.getItem('lastUsedWallet') || localStorage.getItem('activeWallet')

                // If we have a target wallet ID and it exists, navigate to wallet
                if (targetWalletId && hasWallet(targetWalletId)) {
                    logger.log("Found existing wallet, navigating to /wallet")
                    navigate('/wallet')
                } else if (walletList.length > 0) {
                    // If we have wallets but no specific target, use the first one
                    localStorage.setItem('activeWallet', walletList[0].id)
                    localStorage.setItem('lastUsedWallet', walletList[0].id)
                    navigate('/wallet')
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
                <Routes>
                    <Route path="/*" element={<Wallet />} />
                </Routes>
            </WalletManagerProvider>
        )
    }

    const FederationRoutes = () => {
        return (
            <WalletManagerProvider>
                <Routes>
                    <Route path='/*' element={<Federations />} />
                </Routes>
            </WalletManagerProvider>
        )
    }

    return (
        <LoadingProvider>
            <AppInitializer>
                <Routes>
                    <Route path='/' element={<JoinFederation />} />
                    <Route path='/wallet/*' element={<WalletRoutes />} />
                    <Route path='/federation/:fedId' element={<FederationRoutes />} />
                </Routes>
            </AppInitializer>
        </LoadingProvider>
    )
}

export default App