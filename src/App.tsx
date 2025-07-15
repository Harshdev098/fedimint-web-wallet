import { Routes, Route } from 'react-router'
import './style/App.css'
import JoinFederation from './pages/JoinFederation'
import Wallet from './Wallet'
import { LoadingProvider } from './context/loader'
import 'nprogress/nprogress.css'
import { HamburgerProvider } from './context/hamburger'
import Federations from './pages/Federations'

function App() {
    return (
        <HamburgerProvider>
            <LoadingProvider>
                <Routes>
                    <Route path='/' element={<JoinFederation />} />
                    <Route path='/wallet/*' element={<Wallet />} />
                    <Route path='/federation/:fedId' element={<Federations />} />
                </Routes>
            </LoadingProvider>
        </HamburgerProvider>
    )
}

export default App
