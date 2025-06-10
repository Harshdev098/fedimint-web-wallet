import { useContext } from "react"
import { Link, useLocation } from "react-router"
import HamburgerContext from "../context/hamburger"
import whiteLogo from '../assets/logo-white.webp'
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'

export default function Sidebar() {
    const { hamburger, setHamburger } = useContext(HamburgerContext)
    const location = useLocation()
    const notifications = useSelector((state: RootState) => state.notifications)

    const isActive = (path: string) => location.pathname === path

    return (
        <section className={`sidebarContainer ${hamburger ? 'sidebarHidden' : ''}`}>
            <div>
                <div className='sidebarImageBox'>
                    <img src={whiteLogo} alt="logo" />
                </div>
                <div className='sidebarList'>
                    <ul>
                        <li className={isActive('/wallet') ? 'active' : ''}>
                            <Link to='/wallet' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-house"></i>Home
                            </Link>
                        </li>
                        <li className={isActive('/wallet/profile') ? 'active' : ''}>
                            <Link to='/wallet/profile' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-user"></i>Profile
                            </Link>
                        </li>
                        <li className={isActive('/wallet/notifications') ? 'active' : ''}>
                            <Link to='/wallet/notifications' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-bell"></i>Notifications {notifications.count > 0 &&
                                    <span style={{ backgroundColor: '#bb2828', color: 'white', borderRadius: '50%', padding: '0px 6px', fontSize: '15px' }}>
                                        {notifications.count}
                                    </span>}
                            </Link>
                        </li>
                        <li className={isActive('/wallet/federation') ? 'active' : ''}>
                            <Link to='/wallet/federation' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-landmark"></i>Federation
                            </Link>
                        </li>
                        <li className={isActive('/wallet/transactions') ? 'active' : ''}>
                            <Link to='/wallet/transactions' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-clock-rotate-left"></i>Transactions
                            </Link>
                        </li>
                        <li className={isActive('/wallet/onchain') ? 'active' : ''}>
                            <Link to='/wallet/onchain' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-money-bill-transfer"></i>Withdraw/Deposit
                            </Link>
                        </li>
                        <li className={isActive('/wallet/ecash') ? 'active' : ''}>
                            <Link to='/wallet/ecash' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-wallet"></i>ECashes
                            </Link>
                        </li>
                        <li className={isActive('/wallet/guardian') ? 'active' : ''}>
                            <Link to='/wallet/guardian' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-shield"></i>Guardians
                            </Link>
                        </li>
                        <li className={isActive('/wallet/modules') ? 'active' : ''}>
                            <Link to='/wallet/modules' onClick={() => window.innerWidth <= 870 && setHamburger(true)}>
                                <i className="fa-solid fa-puzzle-piece"></i>Modules
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}
