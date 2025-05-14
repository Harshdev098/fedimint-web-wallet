import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'

export default function FederationDetails() {
    const { Details } = useSelector((state: RootState) => state.federationdetails)

    return (
        <>
            <section className='federation-section'>
                <h2 className='federation-title'>Federation Details</h2>
                <p>{Details?.meta.federation_name}</p>
                <Link to={Details?.meta?.meta_external_url || ''}>View Federation MetaData</Link>
                <div>
                    {Details?.api_endpoints && <div className="detailCard">
                        <h4>API Endpoints</h4>
                        <ul>
                            {Object.values(Details?.api_endpoints).map(
                                (endpoint: any, idx: number) => (
                                    <li key={idx}>
                                        <strong>{endpoint.name}</strong>: {endpoint.url}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>}
                    {Details?.broadcast_public_keys && <div>
                        <h4>Broadcast Public Keys</h4>
                        <ul>
                            {Object.entries(Details.broadcast_public_keys).map(
                                ([key, value]: any) => (
                                    <li key={key}>
                                        <strong>Node {key}</strong>: {value}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>}
                    {Details?.consensus_version && <div className="detailCard">
                        <h4>Consensus Version</h4>
                        <p>
                            <strong>Major:</strong> {Details.consensus_version.major}
                        </p>
                        <p>
                            <strong>Minor:</strong> {Details.consensus_version.minor}
                        </p>
                    </div>}
                </div>
            </section>
        </>
    )
}
