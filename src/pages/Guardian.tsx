import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import Tippy from '@tippyjs/react';

const guardianColors = ['#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

export default function Guardians() {
    const { Details, GuardianStatus } = useSelector((state: RootState) => state.federationdetails);

    // eslint-disable-next-line
    const guardians = Object.keys(Details?.api_endpoints ?? {}).map((key: any, idx) => {
        const status = GuardianStatus.status[Number(key)];

        return {
            id: key,
            name: Details?.api_endpoints[key].name,
            url: Details?.api_endpoints[key].url,
            pubKey: Details?.broadcast_public_keys[key],
            color: guardianColors[idx % guardianColors.length],
            status: status || 'checking',
        };
    });

    const onlineGuardians = guardians.filter((g) => g.status === 'online').length;
    const totalGuardians = guardians.length;

    return (
        <section className="guardian-section" id="guardians">
            <div className="guardian-header-info">
                <div className="guardian-title">
                    <h2 className="title" style={{ textAlign: 'left' }}>
                        <i className="fa-solid fa-shield"></i> Guardians (Members)
                    </h2>
                    <span className="title-span">
                        Trusted operators who secure your funds and keep the federation running.
                    </span>
                </div>
                <span className="guardian-count">
                    {onlineGuardians} out of {totalGuardians} Guardians are active
                </span>
            </div>

            <div className="guardian-list">
                {guardians.map((g) => (
                    <div key={g.id} className="guardian-card">
                        <div className="guardian-main-info">
                            <div className="guardian-name-section">
                                <div
                                    className="guardian-avatar"
                                    style={{ backgroundColor: g.color }}
                                >
                                    {g.name ? g.name[0].toUpperCase() : 'G'}
                                </div>
                                <div className="guardian-info">
                                    <h3 className="guardian-name">{g.name}</h3>
                                    <div className="guardian-url">{g.url}</div>
                                </div>
                            </div>
                        </div>

                        <div className="guardian-status-badges">
                            <span
                                className={`status-badge ${g.status === 'online' ? 'online' : g.status === 'offline' ? 'offline' : 'checking'}`}
                            >
                                {g.status === 'online'
                                    ? 'Online'
                                    : g.status === 'offline'
                                      ? 'Offline'
                                      : 'Checking'}
                            </span>
                            <span className="session-badge">
                                Session 184361
                                <Tippy content="How many times the guardians have updated and agreed on the federation’s state">
                                    <i className="fa-solid fa-info-circle"></i>
                                </Tippy>
                            </span>
                            <span className="block-badge">
                                Block 906835
                                <Tippy content="The total number of Bitcoin blocks since the network began">
                                    <i className="fa-solid fa-info-circle"></i>
                                </Tippy>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
