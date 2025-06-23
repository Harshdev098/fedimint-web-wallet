import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

export default function FederationDetails() {
    const { Details, metaData } = useSelector((state: RootState) => state.federationdetails);

    return (
        <div className="page-background">
            <section className="federation-glass-card">
                <div className="Fedheader">
                    <img
                        src={metaData?.federation_icon_url}
                        alt="Federation Icon"
                        className="federation-icon"
                    />
                    <div>
                        <h2 className="federation-title">{metaData?.federation_name}</h2>
                        <p className="subtitle">{metaData?.welcome_message}</p>
                    </div>
                </div>

                <div className="federation-grid">
                    {/* existing fields */}
                    <div className="federation-field">
                        <span>🧩 Consensus Version</span>
                        <strong>Major: {Details?.consensus_version.major} Minor: {Details?.consensus_version.minor}</strong>
                    </div>
                    <div className="federation-field">
                        <span>🔗 Invite Code</span>
                        <p>{metaData?.invite_code || 'N/A'}</p>
                    </div>
                    <div className="federation-field">
                        <span>💰 On-chain Deposit</span>
                        <strong>
                            {metaData?.onchain_deposits_disabled === "false"
                                ? "Enabled"
                                : metaData?.onchain_deposits_disabled === "true"
                                    ? "Disabled"
                                    : "N/A"}
                        </strong>
                    </div>
                    <div className="federation-field">
                        <span>📨 Welcome Message</span>
                        <p>{metaData?.welcome_message || 'N/A'}</p>
                    </div>
                    <div className="federation-field">
                        <span>📌 Pinned Message</span>
                        <p>{metaData?.pinned_message || 'N/A'}</p>
                    </div>
                    {metaData?.federation_expiry_timestamp && (
                        <div className="federation-field">
                            <span>⏳ Shutdown Time</span>
                            <strong>{metaData?.federation_expiry_timestamp}</strong>
                        </div>
                    )}
                    <div className="federation-field">
                        <span>💵 Max Stable Balance</span>
                        <strong>{metaData?.max_stable_balance_msats}</strong>
                    </div>
                </div>
                <div className="modules-section">
                    <h3 className="modules-title"><i className="fa-solid fa-file-invoice-dollar"></i> Federation Modules</h3>
                    <div className="modules-grid">
                        {
                            Object.entries(Details?.modules ?? {}).map(([id, mod]: any) => (
                                <div className="module-card" key={mod.id}>
                                    <h4>{mod.kind.toUpperCase()}</h4>
                                    <p><strong>Module ID: </strong> {id}</p>
                                    <p><strong>Version:</strong> {mod.version.major}.{mod.version.minor}</p>
                                    <p>
                                        <strong>Config:</strong>{' '}
                                        <code title={mod.config}>
                                            {mod.config.slice(0, 40)}...
                                        </code>
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="footer-link">
                    <Link to="/wallet/guardian"><i className="fa-solid fa-shield"></i> View Guardians</Link>
                </div>
            </section>
        </div>
    );
}
