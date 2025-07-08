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

    useEffect(() => {
        if (showFederations === true) {
            logger.log('calling discover federation function')
            DiscoverFederation()
            setTimeout(() => {
                setIsLoading(false)
            }, 30000);
        }
    }, [showFederations])

    return (
        <div className='federation-discovery'>
            <div className='previewData'>
                <div className='previewCard'>
                    <button className='closeButton' onClick={() => setShowFederation(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <h3>Recommended Federations</h3>
                    <ul>
                        {discoveredFederations.map((fed, key) => (
                            <li key={fed.inviteCode} onClick={() => joinFederation(fed.inviteCode)}>
                                <img src={fed.iconUrl} alt={`${fed.federationName} icon`} />
                                <div className="fed-info">
                                    <h4>{fed.federationName}</h4>
                                    <p>{fed.federationId}</p>
                                </div>
                                <div className="arrow-icon">
                                    <i className="fa-solid fa-arrow-right"></i>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {isLoading && <div style={{ textAlign: 'center', margin: '10px' }}>
                        <img src={loader} alt="loader" width={'20%'} />
                    </div>}
                </div>
            </div>
        </div>
    )
}