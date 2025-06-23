import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const guardianColors = ['#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

export default function Guardians() {
    const { Details, GuardianStatus } = useSelector((state: RootState) => state.federationdetails);

    const guardians = Object.keys(Details?.api_endpoints ?? {}).map((key: any, idx) => ({
        id: key,
        name: Details?.api_endpoints[key].name,
        url: Details?.api_endpoints[key].url,
        pubKey: Details?.broadcast_public_keys[key],
        color: guardianColors[idx % guardianColors.length],
        status: GuardianStatus.status[Number(key)] || 'checking'
    }));

    return (
        <section className="guardian-section">
            <h2><i className="fa-solid fa-shield"></i> GUARDIANS</h2>
            <p className="subtitle">Information about the active guardians</p>

            <div className="guardian-list">
                {guardians.map((g) => (
                    <div key={g.id} className="guardian-card">
                        <div className="guardian-header">
                            <div className="guardian-avatar" style={{ backgroundColor: g.color }}>
                                {g.name[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="guardian-name">{g.name}</h3>
                                <span className="status-text">
                                    <span className="status-dot" />{g.status}
                                </span>
                            </div>
                        </div>

                        <div className="guardian-detail">
                            <span>API Endpoint</span>
                            <code>{g.url}</code>
                        </div>

                        <div className="guardian-detail">
                            <span>Public Key</span>
                            <code>
                                {g.pubKey}
                            </code>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
