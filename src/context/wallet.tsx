import { createContext, useEffect, useState } from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { useNavigate } from "react-router";
// import { useSelector } from 'react-redux'
// import type { RootState } from '../redux/store'
import type { Wallet } from "../hooks/wallet.type";
import webLoader from '../assets/web-loader.gif'

const wallet = new FedimintWallet()

const WalletContext = createContext<Wallet>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Todo: implementing listClient method to redirect user if already joined earlier
    // const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const [loader, setLoader] = useState(true)
    const navigate = useNavigate()

    // Todo: implementing listClient method to redirect user if already joined earlier
    useEffect(() => {
        const checkFedStatus = async () => {
            try {
                if (wallet.isOpen()) navigate('/wallet')
                if (!wallet.isOpen() && localStorage.getItem('activeFederation')) { // use listClient instead
                    await wallet.open();
                    navigate('/wallet');
                } else {
                    navigate('/');
                }
            }catch(err){
                console.log('an error occured')
            }finally{
                setLoader(false)
            }
        };

        checkFedStatus();
    }, []);
    if (loader) {
         return <div className="web-loader">
            <img src={webLoader} alt="loading" width={'40%'} />
        </div>
    }
    return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
}

export default WalletContext;