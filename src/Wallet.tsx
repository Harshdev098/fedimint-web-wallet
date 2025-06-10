import { Routes, Route } from 'react-router'
import Main from './pages/Main'
import FederationDetails from './pages/FederationDetails'
import WalletContent from './Components/WalletContent'
import Modules from './pages/Modules'
import EcashSetting from './pages/EcashSetting'
import OnChain from './pages/OnChain'
import Notifications from './Components/Notifications'
import Transactions from './pages/Transactions'

export default function Wallet() {
  return (
    <Routes>
      <Route element={<Main />}>
        <Route index element={<WalletContent />} />
        <Route path='/federation' element={<FederationDetails />} />
        <Route path='/modules' element={<Modules />} />
        <Route path='/notifications' element={<Notifications />}  />
        <Route path='/ecash' element={<EcashSetting />} />
        <Route path='/guardian'  />
        <Route path='/transactions' element={<Transactions />} />
        <Route path='/profile'  />
        <Route path='/onchain' element={<OnChain /> }  />
      </Route>
    </Routes>
  )
}
