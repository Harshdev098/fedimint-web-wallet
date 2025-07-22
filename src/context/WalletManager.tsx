import { createContext, useCallback, useEffect, useState, useContext, useRef } from "react";
import { Wallet, setLogLevel, openWallet, getWallet, listClients } from "@fedimint/core-web";
import { useNavigate } from "react-router";
import webloader from '../assets/loader.webp';
import logger from "../utils/logger";
import { setError } from "../redux/slices/Alerts";
import { setWalletStatus } from "../redux/slices/WalletSlice";
import type { AppDispatch, RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import type { FederationConfig, FederationMetaData } from "../hooks/Federation.type";
import { fetchFederationDetails } from "../services/FederationService";
import { setWalletId } from "../redux/slices/ActiveWallet";
import { setFederationId } from "../redux/slices/ActiveWallet";
import { setFederationDetails, setFederationMetaData } from "../redux/slices/FederationDetails";
import NProgress from 'nprogress'
import LoadingContext from '../context/loader'
import { updateBalanceFromMsat } from "../redux/slices/Balance";

interface WalletCache {
    wallet: Wallet;
    federationDetails: FederationConfig;
    federationMeta: FederationMetaData;
}

interface WalletManagerContextType {
    wallet: Wallet;
    setWallet: (_wallet: Wallet) => void
    availableWalletList: { name: string, fedId: string, walletId: string }[];
    isLoadingAvailableFederations: boolean
    isDebug: boolean;
    switchWallet: (walletId: string) => Promise<WalletCache | undefined>;
    refreshActiveWallet: () => Promise<void>;
    toggleDebug: () => void;
    loadWalletData: (walletId: string, walletInstance?: Wallet) => Promise<WalletCache | undefined>;
}

const WalletManagerContext = createContext<WalletManagerContextType | undefined>(undefined);

export const WalletManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [loader, setLoader] = useState(true);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isDebug, setIsDebug] = useState(localStorage.getItem("appDebug") === "true");
    const [availableWalletList, setAvailableWalletList] = useState<{ name: string, fedId: string, walletId: string }[]>([])
    const { walletStatus } = useSelector((state: RootState) => state.wallet)
    const { walletId } = useSelector((state: RootState) => state.activeFederation)
    const walletCache = useRef<Map<string, WalletCache>>(new Map());
    const { setLoading, loading } = useContext(LoadingContext)
    const [isLoadingAvailableFederations, setIsLoadingAvailableFederations] = useState(true);

    const toggleDebug = useCallback(() => {
        setIsDebug((prev) => {
            const newDebugState = !prev;
            localStorage.setItem("appDebug", newDebugState.toString());
            setLogLevel(newDebugState ? "debug" : 'none');
            return newDebugState;
        });
        window.location.reload();
    }, []);

    const loadWalletData = useCallback(async (id: string, walletInstance?: Wallet) => {
        try {
            const walletId = id || localStorage.getItem('activeWallet')
            // Use provided wallet instance or get from state/API
            let currentWallet: Wallet | undefined = walletInstance;

            if (!currentWallet && walletId) {
                logger.log(`Getting wallet instance for ${id}`);
                currentWallet = await getWallet(walletId);
                if (!currentWallet) {
                    throw new Error(`Failed to get wallet instance for ${id}`);
                }
                setWallet(currentWallet);
            }

            if (currentWallet) {
                logger.log('wallet instance in loadWalletData is', currentWallet, currentWallet.id);

                // Check cache first
                const cached = walletCache.current.get(id);
                if (cached && cached.wallet.id === currentWallet?.id) {
                    logger.log(`Using cached data for wallet ${id}`);
                    dispatch(setFederationId(currentWallet.federationId));
                    dispatch(setWalletId(currentWallet.id));
                    dispatch(setFederationDetails(cached.federationDetails));
                    dispatch(setFederationMetaData(cached.federationMeta));
                    return cached;
                }

                logger.log(`Loading wallet data for ${id}`);

                // Load federation details
                const federationResult = await fetchFederationDetails(currentWallet, currentWallet.federationId);
                if (!federationResult.details) {
                    throw new Error("Federation details missing");
                }

                // Update Redux store
                dispatch(setFederationId(currentWallet.federationId));
                dispatch(setWalletId(currentWallet.id));
                dispatch(setFederationDetails(federationResult.details));
                dispatch(setFederationMetaData(federationResult.meta));

                const walletData: WalletCache = {
                    wallet: currentWallet,
                    federationDetails: federationResult.details,
                    federationMeta: federationResult.meta,
                };

                // Cache the data
                walletCache.current.set(id, walletData);
                return walletData;

            }
        } catch (error) {
            logger.error(`Error loading wallet data for ${id}:`, error);
            throw error;
        }
    }, [wallet, dispatch, walletId]);

    const getAvailableFederations = useCallback(async () => {
        logger.log("getting available joined federations")
        if (walletStatus === 'open' && wallet) {
            setIsLoadingAvailableFederations(true);
            const walletList = await listClients().filter(
                (w) => w.federationId !== wallet.federationId
            );

            const activeFederationList = await Promise.all(
                walletList.map(async (w) => {
                    const walletInstance = await openWallet(w.id);
                    const result = await fetchFederationDetails(walletInstance, w.federationId);
                    return {
                        name: result.meta.federation_name,
                        fedId: w.federationId,
                        walletId: walletInstance.id
                    };
                })
            );
            logger.log("available federations are: ", activeFederationList)
            setAvailableWalletList(activeFederationList);
            setIsLoadingAvailableFederations(false);
        }
    }, [walletStatus, wallet]);


    useEffect(() => {
        void getAvailableFederations();
    }, [walletStatus]);


    const switchWallet = useCallback(async (walletId: string) => {
        try {
            if (!loading) {
                NProgress.start()
                setLoading(true)
            }
            logger.log(`Switching to wallet ${walletId}`);

            // get or open the wallet first
            const walletData = await getWallet(walletId) || await openWallet(walletId);
            if (!walletData) {
                throw new Error(`Failed to open wallet ${walletId}`);
            }

            const previousWallet = wallet;
            // Update wallet state immediately
            setWallet(walletData);


            // Load wallet data with the opened wallet instance
            const result = await loadWalletData(walletData.id, walletData);

            if (result) {
                setAvailableWalletList(prev => {
                    if (!prev) return [];

                    const filtered = prev.filter(w => w.walletId !== walletData.id);

                    if (previousWallet) {
                        const prevCached = walletCache.current.get(previousWallet.id);
                        filtered.push({
                            name: prevCached?.federationMeta?.federation_name || 'Unknown',
                            fedId: previousWallet.federationId,
                            walletId: previousWallet.id,
                        });
                    }

                    return filtered;
                });


                localStorage.setItem('lastUsedWallet', walletData.id);
                localStorage.setItem('activeFederation', walletData.federationId);
                localStorage.setItem('activeWallet', walletData.id);

                logger.log(`Successfully switched to wallet ${walletId}`);
                logger.log('available federations in switch functions: ', availableWalletList)
            }

            return result;
        } catch (err) {
            logger.error(`Failed to switch wallet:`, err);
            throw err; // handle it in component side
        } finally {
            NProgress.done()
            setLoading(false)
        }
    }, [dispatch, loadWalletData]);

    const refreshActiveWallet = useCallback(async () => {
        if (!wallet) return;

        try {
            logger.log("Refreshing active wallet");
            const unsubscribeBalance = wallet.balance.subscribeBalance((mSats) => {
                dispatch(updateBalanceFromMsat(mSats));
                setTimeout(() => {
                    unsubscribeBalance?.();
                }, 10000);
            });

            // Clear cache for this wallet to force fresh data
            walletCache.current.delete(wallet.id);

            // Reload wallet data with current wallet instance
            await loadWalletData(wallet.id, wallet);
        } catch (error) {
            logger.error("Failed to refresh wallet:", error);
            dispatch(setError({
                type: 'Refresh Error',
                message: error instanceof Error ? error.message : "Failed to refresh wallet",
            }));
        }
    }, [wallet, loadWalletData, dispatch]);

    // open wallet
    const loadInitialWallet = useCallback(async () => {
        try {
            let targetWalletId = localStorage.getItem('lastUsedWallet') || localStorage.getItem('activeWallet');

            if (targetWalletId) {
                dispatch(setWalletStatus('opening'));
                const result = await switchWallet(targetWalletId);

                if (result) {
                    logger.log("Initial wallet loaded successfully", result.wallet);
                    (window as any).wallet = result.wallet;
                    dispatch(setWalletStatus('open'));
                } else {
                    throw new Error("Failed to load initial wallet");
                }
            } else {
                // No wallet to load
                logger.log("No wallet found, redirecting to home");
                dispatch(setWalletStatus('closed'));
                navigate('/');
            }
        } catch (error) {
            logger.error("Failed to load initial wallet:", error);
            dispatch(setWalletStatus('closed'));
            dispatch(setError({
                type: 'Opening Error',
                message: error instanceof Error ? error.message : "Failed to load wallet",
            }));
            navigate('/');
            setTimeout(() => {
                dispatch(setError(null));
            }, 3000);
        } finally {
            setLoader(false);
        }
    }, [])

    useEffect(() => {
        loadInitialWallet()
    }, [])


    if (loader) {
        return (
            <div className="web-loader">
                <img src={webloader} alt="loading" />
            </div>
        );
    }

    if (wallet && walletStatus === 'open') {
        return (
            <WalletManagerContext.Provider value={{
                wallet,
                setWallet,
                availableWalletList,
                isLoadingAvailableFederations,
                isDebug,
                switchWallet,
                refreshActiveWallet,
                toggleDebug,
                loadWalletData
            }}>
                {children}
            </WalletManagerContext.Provider>
        );
    }

    // If wallet is not open, don't render children
    return null;
};

export const useWallet = () => {
    const context = useContext(WalletManagerContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export default WalletManagerContext;