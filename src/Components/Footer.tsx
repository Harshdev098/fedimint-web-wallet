import { Link } from 'react-router';

export default function Footer() {
    return (
        <div className="settings-section">
            <h2 className="section-title">Fedimint</h2>
            
            <div className="settings-grid">
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Ask Fedimint</h3>
                        <p>Get help and support from the community</p>
                    </div>
                    <div className="setting-control">
                        <a href="#" className="action-btn view-btn">
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Report Bug</h3>
                        <p>Help us improve by reporting issues</p>
                    </div>
                    <div className="setting-control">
                        <Link to="https://github.com/Harshdev098/fedimint-web-wallet/issues" target="_blank" className="action-btn view-btn">
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="community-links">
                <a href="https://discord.gg/8xn55stq" target="_blank" rel="noopener noreferrer" className="community-link">
                    <i className="fa-brands fa-discord"></i>
                </a>
                <a href="https://primal.net/p/nprofile1qqsgwgkrss7gthwkzc49edgxu895664setaevcp57snw2k3wlzdrghswflshg" target="_blank" rel="noopener noreferrer" className="community-link">
                    <i className="fa-solid fa-bolt"></i>
                </a>
                <a href="https://twitter.com/fedimint" target="_blank" rel="noopener noreferrer" className="community-link">
                    <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="https://t.me/fedimint" target="_blank" rel="noopener noreferrer" className="community-link">
                    <i className="fa-brands fa-telegram"></i>
                </a>
            </div>

            <div className="subsection-title">Contact</div>
            <div className="contact-details">
                <a href="mailto:elsirion@protonmail.com" className="contact-email">
                    elsirion@protonmail.com
                </a>
            </div>
        </div>
    );
}