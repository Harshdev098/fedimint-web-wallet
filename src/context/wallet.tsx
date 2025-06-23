import { createContext, useCallback, useEffect, useState } from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { useNavigate } from "react-router";
import type { Wallet } from "../hooks/wallet.type";
import webLoader from '../assets/web-loader.gif'
import { nwc } from "@getalby/sdk";
import { handleNostrPayment, handleNWCConnection } from "../services/nostrPayment";

const wallet = new FedimintWallet();
wallet.setLogLevel('debug');

interface WalletContextType {
    wallet: Wallet;
    walletStatus: 'open' | 'closed' | 'opening';
    setWalletStatus: React.Dispatch<React.SetStateAction<'open' | 'closed' | 'opening'>>;
    nwcEnabled: boolean;
    nwcURL: string | null;
    nwcRelays: string[];
    setNWCRelays: React.Dispatch<React.SetStateAction<string[]>>;
    selectedRelay:''
    generateNWCConnection: () => { nwcUrl: string; clientPubKey: string; walletNostrSecretKey: string; walletNostrPubKey: string } | null;
    nwcService: nwc.NWCWalletService | null,
    updateRelay: (relay: string) => void
}

const WalletContext = createContext<WalletContextType>({
    wallet,
    walletStatus: "closed",
    setWalletStatus: () => { },
    nwcEnabled: false,
    nwcURL: null,
    nwcRelays: ["wss://relay.getalby.com/v1"],
    setNWCRelays: () => {},
    selectedRelay:'',
    generateNWCConnection: () => null,
    nwcService: null,
    updateRelay: (_relay: string) => {}
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loader, setLoader] = useState(true);
    const [walletStatus, setWalletStatus] = useState<'open' | 'closed' | 'opening'>("closed");
    const navigate = useNavigate();
    const [nwcEnabled, setNWCEnabled] = useState(false)
    const storedRelays = JSON.parse(localStorage.getItem('nwcRelays') || '["wss://relay.getalby.com/v1"]');
    const [nwcRelays, setNWCRelays] = useState<string[]>(storedRelays);
    const [selectedRelay, setSelectedRelay] = useState(storedRelays[0]);
    const [nwcService, setNWCService] = useState(() => new nwc.NWCWalletService({ relayUrl: storedRelays[0] }));
    const [nwcURL, setNWCURL] = useState<string | null>(null)

    const updateRelay = (newRelay: string) => {
        setSelectedRelay(newRelay);
        const updatedService = new nwc.NWCWalletService({ relayUrl: newRelay });
        setNWCService(updatedService);
        localStorage.setItem('nwcSelectedRelay', newRelay);
    };


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
                if (localStorage.getItem('nwcEnabled')) {
                    setNWCEnabled(true)
                }
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

    const generateNWCConnection = useCallback(() => {
        const connectionResult = handleNWCConnection(nwcService)
        setNWCURL(connectionResult.nwcUrl)
        setNWCEnabled(true)
        localStorage.setItem('nwcEnabled', "true")
        console.log("nwculr and keys are ", connectionResult.nwcUrl, connectionResult.clientPubKey)
        localStorage.setItem('autoPayNostr', "true")
        return connectionResult;
    }, [])

    useEffect(() => {
        checkFedStatus();
    }, [checkFedStatus]);

    useEffect(() => {
        localStorage.setItem('nwcRelays', JSON.stringify(nwcRelays));
    }, [nwcRelays]);


    useEffect(() => {
        const nostrNWC = async () => {
            const { clientPubKey, walletNostrSecretKey, walletNostrPubKey } = generateNWCConnection();
            if (walletNostrSecretKey && clientPubKey) {
                if (localStorage.getItem('autoPayNostr') === "true") {
                    await handleNostrPayment(wallet, clientPubKey, walletNostrSecretKey, walletNostrPubKey, nwcService);
                } else {
                    if (confirm("Are you sure to pay the invoice")) {
                        await handleNostrPayment(wallet, clientPubKey, walletNostrSecretKey, walletNostrPubKey, nwcService);
                    }
                }
            }
        }
        if (nwcEnabled && walletStatus === 'open') {
            nostrNWC()
        }
    }, [wallet, nwcEnabled])

    if (loader) {
        return (
            <div className="web-loader">
                <img src={webLoader} alt="loading" width={'40%'} />
            </div>
        );
    }

    return (
        <WalletContext.Provider value={{ wallet, walletStatus, setWalletStatus, nwcEnabled, nwcService, generateNWCConnection, nwcURL, nwcRelays, setNWCRelays, updateRelay, selectedRelay }}>
            {children}
        </WalletContext.Provider>
    );
};

export default WalletContext;