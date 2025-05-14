import { useContext } from "react"
import { Link } from "react-router"
import HamburgerContext from "../context/hamburger"
import whiteLogo from '../assets/logo-white.webp'


export default function Sidebar() {
    const { hamburger } = useContext(HamburgerContext)

    return (
        <>
            <section className={`sidebarContainer ${hamburger ? 'sidebarHidden' : ''}`}>
                <div>
                    <div className='sidebarImageBox'>
                        <img src={whiteLogo} alt="logo" />
                    </div>
                    <div className='sidebarList'>
                        <ul>
                            <li><Link to={'/wallet'}><i className="fa-solid fa-house"></i>Home</Link></li>
                            <li><Link to={'/wallet/setting'}><i className="fa-solid fa-gear"></i>Setting</Link></li>
                            <li><Link to={'/wallet/profile'}><i className="fa-solid fa-user"></i>Profile</Link></li>
                            <li><Link to={'/wallet/federation'}><i className="fa-solid fa-landmark"></i>Federation</Link></li>
                            <li><Link to={'/wallet/history'}><i className="fa-solid fa-clock-rotate-left"></i>Transactions</Link></li>
                            <li><Link to={'/wallet/pegin'}><i className="fa-solid fa-money-bill-transfer"></i>Withdraw/Deposit</Link></li>
                            <li><Link to={'/wallet/ecash'}><i className="fa-solid fa-wallet"></i>ECashes</Link></li>
                            <li><Link to={'/wallet/guardian'}><i className="fa-solid fa-shield"></i>Guardians</Link></li>
                            <li><Link to={'/wallet/modules'}><i className="fa-solid fa-puzzle-piece"></i>Modules</Link></li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    )
}
