import React, { useContext, useEffect, useState } from 'react'
import NostrContext from '../context/nostr';
import logger from '../utils/logger';
import loader from '../assets/loader.webp'

interface DiscoverFederationProps {
    setShowFederation: React.Dispatch<React.SetStateAction<boolean>>;
    setInviteCode: React.Dispatch<React.SetStateAction<string>>;
    joinFederation: (code: string) => Promise<void>
    showFederations: React.SetStateAction<boolean>
}

export default function DiscoverFederation({ setShowFederation, showFederations, joinFederation }: DiscoverFederationProps) {
    const { DiscoverFederation, discoveredFederations } = useContext(NostrContext)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [expandedFed, setExpandedFed] = useState<string | null>(null)

    useEffect(() => {
        if (showFederations === true) {
            logger.log('calling discover federation function')
            DiscoverFederation()
            setTimeout(() => {
                setIsLoading(false)
            }, 30000);
        }
    }, [showFederations])

    const toggleDetails = (federationID: string, event: React.MouseEvent) => {
        event.stopPropagation() // Prevent triggering the join action
        setExpandedFed(expandedFed === federationID ? null : federationID)
    }

    const handleJoinFederation = (inviteCode: string) => {
        joinFederation(inviteCode)
    }

    return (
        <section className='federation-discovery'>
            <div className='previewData'>
                <div className='previewCard'>
                    <button className='closeButton' onClick={() => setShowFederation(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <h3>Recommended Federations</h3>
                    <ul>
                        {discoveredFederations.map((fed) => (
                            <li key={fed.inviteCode}>
                                <img src={fed.iconUrl} alt={`${fed.fedName} icon`} />
                                <div className="fed-info">
                                    <h4>{fed.fedName}</h4>
                                    <p>{fed.federationID}</p>

                                    {expandedFed === fed.federationID && (
                                        <div className="federation-details">
                                            <div>
                                                <span><b>Guardians:</b> {fed.totalGuardians}</span>
                                                <span><b>Max stable Balance:</b> {fed.maxBalance}</span>
                                                <span><b>Message:</b> {fed.welcomeMessage}</span>
                                                <span><b>Onchain deposit:</b> {fed.onChainDeposit==='true' ? 'Disabled' : 'Enabled'}</span>
                                                <span><b>Services(modules):</b> {fed.modules && Object.values(fed.modules).length > 0
                                                    ? Object.values(fed.modules).map((m) => m.kind).join(', ')
                                                    : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="arrow-container" onClick={(e) => toggleDetails(fed.federationID, e)}>
                                    <i className={`fa-solid ${expandedFed === fed.federationID ? 'fa-angle-up' : 'fa-angle-down'}`}></i>
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
                            <p style={{
                                marginTop: '12px',
                                color: '#666',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                            }}>
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
            </div>
        </section>
    )
}