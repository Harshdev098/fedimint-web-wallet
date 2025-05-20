import { Routes, Route } from 'react-router'
import Main from './pages/Main'
import FederationDetails from './pages/FederationDetails'
import WalletContent from './Components/WalletContent'
import Modules from './pages/Modules'
import EcashSetting from './pages/EcashSetting'

export default function Wallet() {
  return (
    <Routes>
      <Route element={<Main />}>
        <Route index element={<WalletContent />} />
        <Route path='/federation' element={<FederationDetails />} />
        <Route path='/modules' element={<Modules />} />
        <Route path='/setting'  />
        <Route path='/ecash' element={<EcashSetting />} />
        <Route path='/guardian'  />
        <Route path='/history'  />
        <Route path='/profile'  />
        <Route path='/pegin'  />
      </Route>
    </Routes>
  )
}
