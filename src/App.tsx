import { Routes, Route } from 'react-router'
import './style/App.css'
import JoinFederation from './pages/JoinFederation'
import Wallet from './Wallet'
import { LoadingProvider } from './context/loader'
import 'nprogress/nprogress.css'
import Federations from './pages/Federations'
import { WalletProvider } from './context/wallet.tsx'

function App() {

    const WalletRoutes = () => {
        return (
            <WalletProvider>
                <Routes>
                    <Route path="/*" element={<Wallet />} />
                </Routes>
            </WalletProvider>
        )
    }

    const FederationRoutes=()=>{
        return (
            <WalletProvider>
                <Routes>
                    <Route path='/*' element={<Federations />} />
                </Routes>
            </WalletProvider>
        )
    }

    return (
        <LoadingProvider>
            <Routes>
                <Route path='/' element={<JoinFederation />} />
                <Route path='/wallet/*' element={<WalletRoutes />} />
                <Route path='/federation/:fedId' element={<FederationRoutes />} />
            </Routes>
        </LoadingProvider>
    )
}

export default App
