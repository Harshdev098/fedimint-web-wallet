import { useEffect, useContext } from 'react';
import WalletContext from '../context/wallet';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchFederationDetails } from '../services/FederationService';
import {
    setFederationDetails,
    setFederationMetaData,
    setError,
} from '../redux/slices/FederationDetails';
import LoadingContext from '../context/loader'
import NProgress from 'nprogress'

export default function Modules() {
    const {wallet} = useContext(WalletContext);
    const dispatch = useDispatch<AppDispatch>();
    const { Details } = useSelector((state: RootState) => state.federationdetails);
    const { setLoading } = useContext(LoadingContext)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)


    useEffect(() => {
        const handleFederationDetails = async () => {
            try {
                NProgress.start()
                setLoading(true)
                const result = await fetchFederationDetails(wallet,federationId || localStorage.getItem('activeFederation'));
                dispatch(setFederationDetails(result.details));
                dispatch(setFederationMetaData(result.meta));
            } catch (err) {
                dispatch(setError('An error occurred'));
                setTimeout(() => {
                    dispatch(setError(''))
                }, 3000);
            }finally{
                NProgress.done()
                setLoading(false)
            }
        };
        if (!Details) handleFederationDetails();
    }, [Details]);

    return (
        <>
            <section className="modules-section">
                <h2 className="modules-title">Modules</h2>
                <div className="modules-grid">
                    {Details?.modules &&
                        Object.entries(Details.modules).map(([id, module]: any) => (
                            <div className="module-card" key={id}>
                                <div className="module-row">
                                    <span className="label">Module ID:</span>
                                    <span className="value monospace">{id}</span>
                                </div>
                                <div className="module-row">
                                    <span className="label">Type:</span>
                                    <span className="value">{module.kind || 'Unknown'}</span>
                                </div>
                                <div className="module-row">
                                    <span className="label">Version:</span>
                                    <span className="value monospace">
                                        v{module.version?.major || 0}.{module.version?.minor || 0}
                                    </span>
                                </div>
                                <div className="module-row">
                                    <span className="label">Config Hash:</span>
                                    <span className="value monospace small">
                                        {module.config
                                            ? `${module.config.slice(0, 20)}...${module.config.slice(-25)}`
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </section>
        </>
    );
}
