import { Link, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
import { fetchFederationDetails } from '../services/FederationService'
import WalletContext from '../context/wallet';
import { useContext, useState, useEffect } from 'react';
import type { FederationDetailResponse } from '../hooks/Federation.type';
import NProgress from 'nprogress';
import LoadingContext from '../context/loader';


export default function Federation() {
    const { Details } = useSelector((state: RootState) => state.federationdetails)
    const { wallet } = useContext(WalletContext);
    const { fedId } = useParams()
    const { setLoading } = useContext(LoadingContext);
    const [details, setDetails] = useState<FederationDetailResponse | null>(null)

    useEffect(() => {
        const fetchFederationData = async () => {
            if (fedId) {
                try {
                    console.log("fed id is ",fedId)
                    NProgress.start();
                    setLoading(true);
                    const result = await fetchFederationDetails(wallet, fedId)
                    setDetails(result)
                } catch (err) {
                    console.log("an error occured ", err)
                }finally{
                    NProgress.done();
                    setLoading(false)
                }
            } else {
                console.log("federation id not got")
            }
        }
            console.log("fetching the details")
            fetchFederationData()
    }, [])


    return (
        <>
            <section className='federation-section'>
                <h2 className='federation-title'>Federation Details</h2>
                <p>{details?.meta.federation_name}</p>
                <Link to={Details?.meta?.meta_external_url || ''}>View Federation MetaData</Link>
                <div>
                    {Details?.api_endpoints && <div className="detailCard">
                        <h4>API Endpoints</h4>
                        <ul>
                            {details?.details && Object.values(details.details.api_endpoints).map(
                                (endpoint: any, idx: number) => (
                                    <li key={idx}>
                                        <strong>{endpoint.name}</strong>: {endpoint.url}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>}
                    {details?.details.broadcast_public_keys && <div>
                        <h4>Broadcast Public Keys</h4>
                        <ul>
                            {Object.entries(details.details.broadcast_public_keys).map(
                                ([key, value]: any) => (
                                    <li key={key}>
                                        <strong>Node {key}</strong>: {value}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>}
                    {details?.details.consensus_version && <div className="detailCard">
                        <h4>Consensus Version</h4>
                        <p>
                            <strong>Major:</strong> {details.details.consensus_version.major}
                        </p>
                        <p>
                            <strong>Minor:</strong> {details.details.consensus_version.minor}
                        </p>
                    </div>}
                </div>
            </section>
        </>
    )
}
