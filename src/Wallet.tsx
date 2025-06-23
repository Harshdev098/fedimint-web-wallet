import { Routes, Route } from 'react-router'
import Main from './pages/Main'
import FederationDetails from './pages/FederationDetails'
import WalletContent from './Components/WalletContent'
import Invoices from './pages/Invoices'
import EcashSetting from './pages/EcashSetting'
import OnChain from './pages/OnChain'
import Notifications from './Components/Notifications'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import Guardians from './pages/Guardian'

export default function Wallet() {
  return (
    <Routes>
      <Route element={<Main /> }>
        <Route index element={<WalletContent /> } />
        <Route path='/federation' element={<FederationDetails /> } />
        <Route path='/invoice' element={<Invoices /> } />
        <Route path='/notifications' element={<Notifications /> } />
        <Route path='/ecash' element={<EcashSetting /> } />
        <Route path='/guardian' element={<Guardians />} />
        <Route path='/transactions' element={<Transactions /> } />
        <Route path='/settings' element={<Settings /> } />
        <Route path='/onchain' element={<OnChain /> }  />
      </Route>
    </Routes>
  )
}
