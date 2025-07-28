import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
import { fetchFederationDetails } from '../services/FederationService'
import { useWallet } from '../context/WalletManager';
import { useState, useCallback } from 'react';
import type { FederationDetailResponse } from '../hooks/Federation.type';
import { startProgress,doneProgress } from '../utils/ProgressBar';
import Guardians from './Guardian';
import logger from '../utils/logger';


export default function Federation() {
    const { Details } = useSelector((state: RootState) => state.federationdetails)
    const {federationId}=useSelector((state:RootState)=>state.activeFederation)
    const { wallet } = useWallet();
    const { fedId } = useParams()
    const [details, setDetails] = useState<FederationDetailResponse | null>(null)

    useCallback(() => {
        const fetchFederationData = async () => {
            if (fedId) {
                try {
                    logger.log("fed id is ", fedId)
                    startProgress();
                    const result = await fetchFederationDetails(wallet, fedId)
                    setDetails(result)
                } catch (err) {
                    logger.log("an error occured ", err)
                } finally {
                    doneProgress();
                }
            } else {
                logger.log("federation id not got")
            }
        }
        logger.log("fetching the details")
        fetchFederationData()
    }, [federationId])


    return (
        <>
            <div className="page-background">
                <section className="federation-glass-card">
                    <div className="Fedheader">
                        <img
                            src={details?.meta.federation_icon_url}
                            alt="Federation Icon"
                            className="federation-icon"
                        />
                        <div>
                            <h2 className="federation-title">{details?.meta.federation_name}</h2>
                            <p className="subtitle">{details?.meta.welcome_message}</p>
                        </div>
                    </div>

                    <div className="federation-grid">
                        <div className="federation-field">
                            <span>🧩 Consensus Version</span>
                            <strong>Major: {Details?.consensus_version.major} Minor: {Details?.consensus_version.minor}</strong>
                        </div>
                        <div className="federation-field">
                            <span>🔗 Invite Code</span>
                            <p>{details?.meta.invite_code}</p>
                        </div>
                        <div className="federation-field">
                            <span>💰 On-chain Deposit</span>
                            <strong>{details?.meta.onchain_deposits_disabled === "false" ? "Enabled" : 'Disabled'}</strong>
                        </div>
                        <div className="federation-field">
                            <span>📨 Welcome Message</span>
                            <p>{details?.meta.welcome_message}</p>
                        </div>
                        <div className="federation-field">
                            <span>📌 Pinned Message</span>
                            <p>{details?.meta.pinned_message}</p>
                        </div>
                        {details?.meta.federation_expiry_timestamp && <div className="federation-field">
                            <span>⏳ Shutdown Time</span>
                            <strong>{details?.meta.federation_expiry_timestamp}</strong>
                        </div>}
                        <div className="federation-field">
                            <span>💵 Max stable Balance</span>
                            <strong>{details?.meta.max_stable_balance_msats}</strong>
                        </div>
                    </div>
                </section>
            </div>
            <Guardians />
        </>
    )
}
