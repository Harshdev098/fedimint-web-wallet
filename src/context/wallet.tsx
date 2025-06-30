import { createContext, useCallback, useEffect, useState } from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { useNavigate } from "react-router";
import type { Wallet } from "../hooks/wallet.type";
import webLoader from '../assets/web-loader.gif'

const wallet = new FedimintWallet();
wallet.setLogLevel('debug');


interface WalletContextType {
    wallet: Wallet;
    walletStatus: 'open' | 'closed' | 'opening';
    setWalletStatus: React.Dispatch<React.SetStateAction<'open' | 'closed' | 'opening'>>;
}

const WalletContext = createContext<WalletContextType>({
    wallet,
    walletStatus: "closed",
    setWalletStatus: () => { },
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loader, setLoader] = useState(true);
    const [walletStatus, setWalletStatus] = useState<'open' | 'closed' | 'opening'>("closed");
    const navigate = useNavigate();


    const checkFedStatus = useCallback(async () => {
        const walletName = localStorage.getItem('walletName')

        if (wallet.isOpen()) {
            console.log("Wallet is already open");
            setWalletStatus('open');
            setLoader(false);
            navigate('/wallet');
            return;
        }
        console.log("opening the wallet")
        setWalletStatus('opening');
        try {
            await wallet.open(walletName || '');
            if (wallet.isOpen()) {
                console.log("Wallet opened successfully");
                setWalletStatus('open');
                setLoader(false);
                navigate('/wallet');
            } else {
                setWalletStatus('closed');
                setLoader(false);
                navigate('/');
            }
        } catch (error) {
            console.error("Error opening or rejoining wallet:", error);
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
                <img src={webLoader} alt="loading" width={'40%'} />
            </div>
        );
    }

    return (
        <WalletContext.Provider value={{ wallet, walletStatus, setWalletStatus }}>
            {children}
        </WalletContext.Provider>
    );
};

export default WalletContext;