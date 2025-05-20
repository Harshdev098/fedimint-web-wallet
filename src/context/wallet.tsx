import { createContext, useEffect, useState } from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { useNavigate } from "react-router";
import type { Wallet } from "../hooks/wallet.type";
import webLoader from '../assets/web-loader.gif'

const wallet = new FedimintWallet()

interface WalletContextType {
    wallet: Wallet;
    walletStatus: 'open' | 'closed';
    setWalletStatus: React.Dispatch<React.SetStateAction<'open' | 'closed'>>;
}

const WalletContext = createContext<WalletContextType>({
    wallet,
    walletStatus: "closed",
    setWalletStatus: () => { },
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Todo: implementing listClient method to redirect user if already joined earlier
    // const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const [loader, setLoader] = useState(true)
    const navigate = useNavigate()
    const [walletStatus, setWalletStatus] = useState<'open' | 'closed'>("closed");

    useEffect(() => {
        const checkFedStatus = async () => {
            try {
                const activeFederation = localStorage.getItem('activeFederation');
                if (activeFederation) {
                    console.log("active federation in wallet context ",activeFederation)
                    if (!wallet.isOpen()) {
                        console.log("opening the wallet")
                        await wallet.initialize()
                        wallet.open().then(()=>{
                            setWalletStatus('open')
                        })
                    }
                    console.log("wallet status ", walletStatus);
                    setLoader(false);
                    navigate('/wallet');
                } else {
                    console.log("wallet status in wallet context is ",walletStatus)
                    setLoader(false);
                    navigate('/');
                }
            } catch (err) {
                console.error("Failed to check federation status:", err);
                setLoader(false);
                navigate('/');
            }
        };

        checkFedStatus();
    }, []);


    if (loader) {
        return <div className="web-loader">
            <img src={webLoader} alt="loading" width={'40%'} />
        </div>
    }
    return <WalletContext.Provider value={{ wallet, walletStatus, setWalletStatus }}>{children}</WalletContext.Provider>
}

export default WalletContext;