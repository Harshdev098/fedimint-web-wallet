import { useContext, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import { Outlet } from 'react-router';
import { fetchFederationDetails } from '../services/FederationService';
import WalletContext from '../context/wallet';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { setFederationDetails, setFederationMetaData, setError, setGuardianStatus } from '../redux/slices/FederationDetails';
import { setCurrency } from '../redux/slices/Balance';
import { setFederationId } from '../redux/slices/ActiveFederation';
import { setNewJoin } from '../redux/slices/ActiveFederation';
import Alerts from '../Components/Alerts';
import LoadingContext from '../context/loader';
import NProgress from 'nprogress';
import Header from '../Components/Header';
import type { FederationConfig } from '@fedimint/core-web';
import logger from '../utils/logger';

export default function Main() {
    const { wallet, walletStatus } = useContext(WalletContext);
    const dispatch = useDispatch<AppDispatch>();
    const { Details, metaData, error } = useSelector((state: RootState) => state.federationdetails);
    const { setLoading } = useContext(LoadingContext);
    const { federationId, newJoin } = useSelector((state: RootState) => state.activeFederation);
    const {mode}=useSelector((state:RootState)=>state.Mode)

    const checkGuardianStatus = async (Details: FederationConfig) => {
        if (Details.api_endpoints && typeof Details.api_endpoints === 'object') {
            let endpoints = Object.entries(Details.api_endpoints);
            const statusPromises = endpoints.map(async ([key, endpoint]) => {
                if (
                    typeof endpoint === 'object' &&
                    endpoint !== null &&
                    'url' in endpoint &&
                    typeof (endpoint as any).url === 'string'
                ) {
                    try {
                        const ws = new WebSocket((endpoint as { url: string }).url);
                        const timeout = new Promise<string>((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), 6000)
                        );

                        const status = await Promise.race([
                            new Promise<string>((resolve) => {
                                ws.onopen = () => {
                                    resolve('online');
                                    ws.close();
                                };
                                ws.onerror = () => {
                                    resolve('offline');
                                    ws.close();
                                };
                            }),
                            timeout,
                        ]);

                        return { key, status };
                    } catch (error) {
                        return { key, status: 'error' };
                    }
                } else {
                    return { key, status: 'invalid' };
                }
            });

            const results = await Promise.all(statusPromises);
            const statusMap: Record<number, string> = {};
            results.forEach(({ key, status }) => {
                statusMap[Number(key)] = status;
            });

            dispatch(setGuardianStatus({ status: statusMap }));
        }
    };

    useEffect(() => {
        const handleFederationDetails = async () => {
            logger.log("wallet status in federation details ", walletStatus)
            const activeFederation = localStorage.getItem('activeFederation');
            try {
                NProgress.start();
                setLoading(true);
                let FederationID = federationId || activeFederation;
                if (!FederationID) {
                    FederationID = await wallet.federation.getFederationId()
                    localStorage.setItem('activeFederation', FederationID)
                    dispatch(setFederationId(FederationID))
                }
                const result = await fetchFederationDetails(wallet, FederationID);
                logger.log("Federation Details:", result);
                dispatch(setFederationDetails(result.details));
                dispatch(setFederationMetaData(result.meta));
                if (!(localStorage.getItem('walletCurrency'))) {
                    localStorage.setItem('walletCurrency', 'sat')
                }
                setCurrency(localStorage.getItem('walletCurrency') || 'sat')
                logger.log("new join is ", newJoin)
                logger.log("welcome message", result.meta.welcome_message)
            } catch (err) {
                logger.error("Error fetching federation details:", err);
                dispatch(setError(`${err}`));
                setTimeout(() => {
                    dispatch(setError(''));
                }, 3000);
            } finally {
                NProgress.done();
                setLoading(false);
            }
        };

        if (walletStatus === 'open' && (!Details || !metaData)) {
            handleFederationDetails();
        }
    }, [walletStatus, federationId, Details, metaData, dispatch, setLoading]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (Details && walletStatus === 'open') {
            checkGuardianStatus(Details)
            interval = setInterval(() => {
                checkGuardianStatus(Details);
            }, 60000);
        }

        return () => clearInterval(interval);
    }, [Details, walletStatus])

return (
    walletStatus === 'open' && (
        <main className='MainWalletContainer'>
            {error && <Alerts Error={error} Result='' />}
            {metaData?.welcome_message && newJoin === true && <Alerts Error='' Result={metaData.welcome_message} onDismiss={() => { dispatch(setNewJoin(false)) }} />}
            {metaData?.federation_expiry_timestamp && (
                <Alerts
                    Error=''
                    Result={`${metaData.welcome_message} federation Expiry time: ${new Date(metaData.federation_expiry_timestamp * 1000).toLocaleString()}`}
                />
            )}
            <Sidebar />
            <section className={`WalletContentSection ${mode===true ? 'DarkMode' : 'WhiteMode'}`}>
                <Header />
                {metaData && Details && <Outlet />}
            </section>
        </main>
    )
);
}