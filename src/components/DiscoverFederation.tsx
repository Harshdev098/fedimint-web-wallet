import React, { useContext, useEffect, useState } from 'react';
import NostrContext from '../context/Nostr';
import logger from '../utils/Logger';
import loader from '../assets/loader.webp';
import Tippy from '@tippyjs/react';

interface DiscoverFederationProps {
    setShowFederation: React.Dispatch<React.SetStateAction<boolean>>;
    setInviteCode: React.Dispatch<React.SetStateAction<string>>;
    setRecover: React.Dispatch<React.SetStateAction<boolean>>;
    joinFederation: (code: string) => Promise<void>;
    showFederations: React.SetStateAction<boolean>;
    recover: boolean;
}

export default function DiscoverFederation({
    setShowFederation,
    showFederations,
    joinFederation,
    setRecover,
    recover,
}: DiscoverFederationProps) {
    const { DiscoverFederation, discoveredFederations, isDiscovering, stopDiscovery } =
        useContext(NostrContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [expandedFed, setExpandedFed] = useState<string | null>(null);

    useEffect(() => {
        if (showFederations === true) {
            logger.log('calling discover federation function');
            DiscoverFederation();
            setTimeout(() => {
                setIsLoading(false);
            }, 30000);
        }
        return () => {
            if (isDiscovering) {
                stopDiscovery();
            }
        };
    }, [showFederations]);

    const toggleDetails = (federationID: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent triggering the join action
        setExpandedFed(expandedFed === federationID ? null : federationID);
    };

    const handleJoinFederation = (inviteCode: string) => {
        if (isDiscovering) {
            stopDiscovery();
        }
        joinFederation(inviteCode);
    };

    return (
        <section className="modalOverlay">
            <div className="previewCard">
                <button
                    type="button"
                    className="closeBtn"
                    onClick={() => {
                        stopDiscovery();
                        setShowFederation(false);
                    }}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <h3>Recommended Federations</h3>
                <label className="recovery-label">
                    <input
                        type="checkbox"
                        checked={recover}
                        onChange={(e) => setRecover(e.target.checked)}
                    />
                    Recover Wallet{' '}
                    <Tippy content="It will recover your wallet instead creating new one">
                        <i className="fa-solid fa-info-circle"></i>
                    </Tippy>
                </label>
                <ul className="discovered-fed">
                    {discoveredFederations.map((fed) => (
                        <li className="discovered-fed-elements" key={fed.inviteCode}>
                            <div className="fed-left">
                                <img src={fed.iconUrl} alt={`${fed.fedName} icon`} />
                                <div className="fed-elements-details">
                                    <h4>{fed.fedName}</h4>
                                    <p>{fed.federationID}</p>

                                    {expandedFed === fed.federationID && (
                                        <div className="federation-details">
                                            <div>
                                                <p>
                                                    <b>Guardians:</b> {fed.totalGuardians}
                                                </p>
                                                <p>
                                                    <b>Max stable Balance:</b> {fed.maxBalance}
                                                </p>
                                                <p>
                                                    <b>Message:</b> {fed.welcomeMessage}
                                                </p>
                                                <p>
                                                    <b>Onchain deposit:</b>{' '}
                                                    {fed.onChainDeposit === 'true'
                                                        ? 'Disabled'
                                                        : 'Enabled'}
                                                </p>
                                                <p>
                                                    <b>Services(modules):</b>{' '}
                                                    {fed.modules &&
                                                    Object.values(fed.modules).length > 0
                                                        ? Object.values(fed.modules)
                                                              .map((m) => m.kind)
                                                              .join(', ')
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="arrow-container"
                                    onClick={(e) => toggleDetails(fed.federationID, e)}
                                >
                                    <i
                                        className={`fa-solid ${expandedFed === fed.federationID ? 'fa-angle-up' : 'fa-angle-down'}`}
                                    ></i>
                                </div>
                            </div>
                            <div
                                className="join-button-right"
                                onClick={() => handleJoinFederation(fed.inviteCode)}
                            >
                                <i className="fa-solid fa-arrow-right"></i>
                            </div>
                        </li>
                    ))}
                </ul>
                {isLoading && (
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <img src={loader} alt="Loading federations..." width={'20%'} />
                        <p
                            style={{
                                marginTop: '12px',
                                color: '#666',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                            }}
                        >
                            Discovering federations...
                        </p>
                    </div>
                )}
                {!isLoading && discoveredFederations.length === 0 && (
                    <div style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
                        <p>No federations found. Try refreshing or check your connection.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
