import { Routes, Route } from 'react-router'
import Main from './pages/Main'
import FederationDetails from './pages/FederationDetails'
import WalletContent from './Components/WalletContent'
import Settings from './pages/Settings'
import Transactions from './pages/Transactions'
import Invoices from './pages/Invoices'

export default function Wallet() {
  return (
    <Routes>
      <Route element={<Main />}>
        <Route index element={<WalletContent />} />
        <Route path='/federation' element={<FederationDetails />} />
        <Route path='/transactions' element={<Transactions />} />
        <Route path='/invoices' element={<Invoices />} />
        <Route path='/settings' element={<Settings />} />
      </Route>
    </Routes>
  )
}
