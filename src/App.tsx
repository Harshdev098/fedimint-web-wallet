import { Routes, Route } from 'react-router'
import './App.css'
import JoinFederation from './pages/JoinFederation'
import Wallet from './Wallet'
import { LoadingProvider } from './context/loader'
import 'nprogress/nprogress.css'
import { HamburgerProvider } from './context/hamburger'

function App() {
    return (
        <HamburgerProvider>
            <LoadingProvider>
                <Routes>
                    <Route path='/' element={<JoinFederation />} />
                    <Route path='/wallet/*' element={<Wallet />} />
                </Routes>
            </LoadingProvider>
        </HamburgerProvider>
    )
}

export default App
