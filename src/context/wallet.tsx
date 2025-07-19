import { createContext, useCallback, useEffect, useState, useContext } from "react";
import { Wallet, setLogLevel, openWallet, isInitialized, initialize, hasWallet } from "@fedimint/core-web";
import { useNavigate } from "react-router";
import webloader from '../assets/loader.webp';
import logger from "../utils/logger";
import { setError } from "../redux/slices/Alerts";
import { setWalletStatus } from "../redux/slices/WalletSlice";
import type { AppDispatch, RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";

interface WalletContextType {
    wallet: Wallet;
    isDebug: boolean;
    toggleDebug: () => void;
}

// Use undefined as the default to enforce usage within provider
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [loader, setLoader] = useState(true);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const {walletStatus}=useSelector((state:RootState)=>state.wallet)
    const [isDebug, setIsDebug] = useState(localStorage.getItem("appDebug") === "true");
    const navigate = useNavigate();

    const toggleDebug = useCallback(() => {
        setIsDebug((prev) => {
            const newDebugState = !prev;
            localStorage.setItem("appDebug", newDebugState.toString());
            setLogLevel(newDebugState ? "debug" : 'none');
            return newDebugState;
        });
        window.location.reload();
    }, []);

    const InitializeAndOpenWallet = useCallback(async () => {
        try {
            if (!isInitialized()) {
                await initialize();
                logger.log("sdk initialized");
            }

            if (localStorage.getItem('appDebug') === 'true') {
                setLogLevel('debug');
            }
            const walletName = localStorage.getItem('lastUsedWallet');
            const walletId = walletName || 'fm-default';

            if (!hasWallet(walletId)) {
                logger.log("No wallet found in storage");
                dispatch(setWalletStatus('closed'));
                setLoader(false);
                navigate('/');
                return;
            }

            dispatch(setWalletStatus('opening'));
            const openedWallet = await openWallet(walletId);
            if (openedWallet) {
                logger.log("Wallet opened successfully", openedWallet);
                setWallet(openedWallet);
                (window as any).wallet = openedWallet;
                dispatch(setWalletStatus('open'));
                localStorage.setItem('activeFederation', openedWallet.federationId);
                setLoader(false);
                navigate('/wallet');
            } else {
                logger.log("Failed to open wallet");
                setWalletStatus('closed');
                setLoader(false);
                navigate('/');
            }
        } catch (err) {
            logger.error("Error initializing or opening wallet:", err);
            setWalletStatus('closed');
            setLoader(false);
            dispatch(setError({
                type: 'Opening Error',
                message: err instanceof Error ? err.message : "Failed to initialize wallet",
            }));
            navigate('/');
            setTimeout(() => {
                dispatch(setError(null));
            }, 3000);
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        InitializeAndOpenWallet();
    }, [InitializeAndOpenWallet]);

    if (loader) {
        return (
            <div className="web-loader">
                <img src={webloader} alt="loading" />
            </div>
        );
    }

    if (wallet && walletStatus === 'open') {
        return (
            <WalletContext.Provider value={{
                wallet,
                isDebug,
                toggleDebug
            }}>
                {children}
            </WalletContext.Provider>
        );
    }
    // If wallet is not open, don't render children
    return null;
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export default WalletContext;