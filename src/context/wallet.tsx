import { createContext, useCallback, useEffect, useState } from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { useNavigate } from "react-router";
import type { Wallet } from "../hooks/wallet.type";
import webloader from '../assets/loader.webp'
import logger from "../utils/logger";

const wallet = new FedimintWallet();

interface WalletContextType {
    wallet: Wallet;
    walletStatus: 'open' | 'closed' | 'opening';
    setWalletStatus: React.Dispatch<React.SetStateAction<'open' | 'closed' | 'opening'>>;
    isDebug: boolean,
    toggleDebug: () => void
}

const WalletContext = createContext<WalletContextType>({
    wallet,
    walletStatus: "closed",
    setWalletStatus: () => { },
    isDebug: false,
    toggleDebug: () => {}
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loader, setLoader] = useState(true);
    const [walletStatus, setWalletStatus] = useState<'open' | 'closed' | 'opening'>("closed");
    const [isDebug, setIsDebug] = useState(localStorage.getItem("appDebug") === "true" ? true : false);
    const navigate = useNavigate();
    (window as any).wallet = wallet;
    if(localStorage.getItem('appDebug')==='true'){
        wallet.setLogLevel('debug')
    }

    const toggleDebug = useCallback(() => {
        setIsDebug((prev) => {
            const newDebugState = !prev;
            localStorage.setItem("appDebug", newDebugState.toString());
            wallet.setLogLevel(newDebugState ? "debug" : 'none');
            return newDebugState;
        });
        window.location.reload()
    }, []);

    const checkFedStatus = useCallback(async () => {
        const walletName = localStorage.getItem('walletName')
        console.log("is debug ",isDebug)
        if (wallet.isOpen()) {
            logger.log("Wallet is already open");
            setWalletStatus('open');
            setLoader(false);
            navigate('/wallet');
            return;
        }
        logger.log("opening the wallet")
        setWalletStatus('opening');
        try {
            await wallet.open(walletName || 'fm-default');
            if (wallet.isOpen()) {
                logger.log("Wallet opened successfully");
                setWalletStatus('open');
                setLoader(false);
                navigate('/wallet');
            } else {
                setWalletStatus('closed');
                setLoader(false);
                navigate('/');
            }
        } catch (error) {
            logger.log("Error opening or rejoining wallet:", error);
            setWalletStatus('closed');
            setLoader(false);
            navigate('/');
        }
    }, []);

    useEffect(() => {
        checkFedStatus();
    }, [checkFedStatus]);


    if (loader) {
        return (
            <div className="web-loader">
                <img src={webloader} alt="loading" />
            </div>
        );
    }

    return (
        <WalletContext.Provider value={{ wallet, walletStatus, setWalletStatus, isDebug, toggleDebug }}>
            {children}
        </WalletContext.Provider>
    );
};

export default WalletContext;