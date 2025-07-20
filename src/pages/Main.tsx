import { useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import { Outlet } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { setGuardianStatus } from '../redux/slices/FederationDetails';
import { setNewJoin } from '../redux/slices/ActiveWallet';
import Alerts from '../Components/Alerts';
import Header from '../Components/Header';
import { type FederationConfig } from '@fedimint/core-web';

export default function Main() {
    const dispatch = useDispatch<AppDispatch>();
    const { Details, metaData } = useSelector((state: RootState) => state.federationdetails);
    const { newJoin } = useSelector((state: RootState) => state.activeFederation);
    const { mode } = useSelector((state: RootState) => state.Mode)
    const { error } = useSelector((state: RootState) => state.Alert)
    const { walletStatus } = useSelector((state: RootState) => state.wallet)

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
                        return { key, status: 'offline' };
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
        walletStatus === 'open' && metaData && Details && (
            <main className='MainWalletContainer'>
                {error && <Alerts Error={error} />}
                {metaData?.welcome_message && newJoin === true && <Alerts Result={metaData.welcome_message} onDismiss={() => { dispatch(setNewJoin(false)) }} />}
                {metaData?.federation_expiry_timestamp && (
                    <Alerts
                        Result={`${metaData.welcome_message} federation Expiry time: ${new Date(metaData.federation_expiry_timestamp * 1000).toLocaleString()}`}
                    />
                )}

                <section className={`WalletContentSection ${mode === true ? 'DarkMode' : 'WhiteMode'}`}>
                    <Header />
                    {<Outlet />}
                </section>

                <Sidebar />
            </main>
        )
    );
}