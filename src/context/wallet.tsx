import { createContext, useCallback, useEffect, useState } from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { useNavigate } from "react-router";
import type { Wallet } from "../hooks/wallet.type";
import webLoader from '../assets/web-loader.gif'

const wallet = new FedimintWallet();
wallet.setLogLevel('debug');
// wallet.open()

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
    // wallet.open()
    const [loader, setLoader] = useState(true);
    const [walletStatus, setWalletStatus] = useState<'open' | 'closed' | 'opening'>("closed");
    const navigate = useNavigate();

    const checkFedStatus = useCallback(async () => {
        if (wallet.isOpen()) {
            console.log("Wallet is open");
            setWalletStatus('open');
            setLoader(false);
            navigate('/wallet');
        } else {
            console.log("Wallet not open, checking active federation");
            const activeFederation = localStorage.getItem('activeFederation');
            if (activeFederation) {
                setWalletStatus('opening');
                try {
                    await wallet.open(); 
                    if (wallet.isOpen()) {
                        console.log("Wallet opened successfully");
                        setWalletStatus('open');
                        setLoader(false);
                        navigate('/wallet');
                    } else {
                        console.log("Wallet failed to open");
                        setWalletStatus('closed');
                        setLoader(false);
                        navigate('/');
                    }
                } catch (error) {
                    console.error("Error opening wallet:", error);
                    setWalletStatus('closed');
                    setLoader(false);
                    navigate('/');
                }
            } else {
                console.log("No active federation or invite code, wallet closed");
                setWalletStatus('closed');
                setLoader(false);
                navigate('/');
            }
        }
    }, [navigate]);

    useEffect(() => {
        checkFedStatus();
    }, []);

    useEffect(() => {
        wallet.waitForOpen().then(() => {
            setWalletStatus('open')
        })
    }, [wallet])

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