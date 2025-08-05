import { Link, useLocation } from "react-router"
import { useMemo } from "react"
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

export default function Sidebar() {
    const location = useLocation()
    const { mode } = useSelector((state: RootState) => state.Mode)
    const currentPath = useMemo(() => location.pathname, [location.pathname])
    const isActive = (path: string) => currentPath === path

    return (
        <section className={`navigation-bar ${mode === true ? 'DarkMode' : ''}`}>
            <svg
                width="100%"
                height="100%"
                id="svg"
                className="wave-bg"
                viewBox="0 0 1440 200"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="5%" stopColor="var(--wave-color-start)"></stop>
                        <stop offset="95%" stopColor="var(--wave-color-end)"></stop>
                    </linearGradient>
                </defs>
                <path
                    d="M 0,200 L 0,20 C 118.8,60 237.6,100 411,90 C 584.4,80 812.4,40 993,30 C 1173.6,20 1306.8,35 1440,40 L 1440,200 L 0,200 Z"
                    stroke="none"
                    strokeWidth="0"
                    fill="url(#gradient)"
                    fillOpacity="1"
                />
            </svg>
            <div className="navigator">
                <Link
                    className={`navigator-icon ${isActive("/wallet/federation") ? "active-nav" : ""}`}
                    to={"/wallet/federation"}
                >
                    <i className="fa-solid fa-landmark"></i>
                </Link>
                <p className="navigator-label">Federation</p>
            </div>
            <div className="navigator">
                <Link
                    className={`navigator-icon ${isActive("/wallet") ? "active-nav" : ""}`}
                    to={"/wallet"}
                >
                    <i className="fa-solid fa-house"></i>
                </Link>
                <p className="navigator-label">Home</p>
            </div>
            <div className="navigator">
                <Link
                    className={`navigator-icon ${isActive("/wallet/settings") ? "active-nav" : ""}`}
                    to={"/wallet/settings"}
                >
                    <i className="fa-solid fa-gear"></i>
                </Link>
                <p className="navigator-label">Settings</p>
            </div>
        </section>
    )
}