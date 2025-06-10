import { useContext, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import { Outlet } from 'react-router';
import { fetchFederationDetails } from '../services/FederationService';
import WalletContext from '../context/wallet';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { setFederationDetails, setFederationMetaData, setError } from '../redux/slices/FederationDetails';
import { setFederationId } from '../redux/slices/ActiveFederation';
import { setNewJoin } from '../redux/slices/ActiveFederation';
import Alerts from '../Components/Alerts';
import LoadingContext from '../context/loader';
import NProgress from 'nprogress';
import Header from '../Components/Header';

export default function Main() {
    const { wallet, walletStatus } = useContext(WalletContext);
    const dispatch = useDispatch<AppDispatch>();
    const { Details, metaData, error } = useSelector((state: RootState) => state.federationdetails);
    const { setLoading } = useContext(LoadingContext);
    const { federationId, newJoin } = useSelector((state: RootState) => state.activeFederation);

    useEffect(() => {
        const handleFederationDetails = async () => {
            console.log("wallet status in federation details ", walletStatus)
            const activeFederation = localStorage.getItem('activeFederation');
            try {
                NProgress.start();
                setLoading(true);
                let FederationID = federationId || activeFederation;
                if (!FederationID) {
                    FederationID=await wallet.federation.getFederationId()
                    localStorage.setItem('activeFederation',FederationID)
                    dispatch(setFederationId(FederationID))
                }
                const result = await fetchFederationDetails(wallet, FederationID);
                console.log("Federation Details:", result);
                dispatch(setFederationDetails(result.details));
                dispatch(setFederationMetaData(result.meta));
                console.log("new join is ", newJoin)
                console.log("welcome message", result.meta.welcome_message)
            } catch (err) {
                console.error("Error fetching federation details:", err);
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
                <section className='WalletContentSection'>
                    <Header />
                    {metaData && Details && <Outlet />}
                </section>
            </main>
        )
    );
}