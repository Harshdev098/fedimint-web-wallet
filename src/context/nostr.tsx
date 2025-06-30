import { createContext, useContext, useState, useCallback, useEffect } from "react";
import WalletContext from "./wallet";
import { handleNWCConnection, handleNostrPayment } from "../services/nostrPayment";
import { useNDKInit } from '@nostr-dev-kit/ndk-hooks';
import NDK from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

interface NostrContextType {
    nwcEnabled: boolean;
    nwcURL: Array<{ appName: string, nwcUri: string }>;
    nwcRelays: string[];
    setNostrAppName: React.Dispatch<React.SetStateAction<string>>;
    NostrAppName: string;
    setNostrRelay: React.Dispatch<React.SetStateAction<string | null>>;
    NostrRelay: string | null;
    generateNWCConnection: (appName: string, relay?: string) => { nwcUrl: string; clientPubKey: string; walletNostrSecretKey: string; walletNostrPubKey: string } | null;
    updateRelay: (relay: string) => void;
}

const NostrContext = createContext<NostrContextType>({
    nwcEnabled: false,
    nwcURL: [],
    nwcRelays: [],
    setNostrAppName: () => { },
    NostrAppName: '',
    setNostrRelay: () => { },
    NostrRelay: null,
    generateNWCConnection: (_appName: string, _relay?: string) => null,
    updateRelay: (_relay: string) => { }
})

export const NostrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [nwcEnabled, setNWCEnabled] = useState(false)
    const [nwcURL, setNWCURL] = useState<Array<{ appName: string, nwcUri: string }>>([])
    const [NostrAppName, setNostrAppName] = useState<string>('');
    const [NostrRelay, setNostrRelay] = useState<string | null>(null);
    const { wallet, walletStatus } = useContext(WalletContext)
    const [nwcRelays, setNWCRelays] = useState<string[]>(JSON.parse(localStorage.getItem('nwcRelays') || '["wss://relay.getalby.com/v1"]'))

    const initializeNDK = useNDKInit();

    // nostr integerations- cache adapters and ndk instances
    const cacheAdapter = new NDKCacheAdapterDexie({ dbName: "nwc-wallet-events" })
    cacheAdapter.onReady(() => {
        console.log("cache adapter ready to use")
    })

    const ndk = new NDK({
        autoConnectUserRelays: true,
        cacheAdapter,
        explicitRelayUrls: nwcRelays
    })

    const generateNWCConnection = (appName: string, relay?: string) => {
        if (!appName) {
            console.error("Nostr app name is required");
            return null;
        }
        console.log("Nostr app name:", appName, "Relay:", relay);
        const connectionResult = handleNWCConnection(ndk, relay || null, appName);
        if (!connectionResult) {
            console.error("Failed to generate NWC connection");
            return null;
        }
        setNWCURL((prev) => ([...prev, { appName, nwcUri: connectionResult.nwcUrl }]));
        setNWCEnabled(true);
        localStorage.setItem('nwcEnabled', "true");
        console.log("NWC URL and keys:", connectionResult.nwcUrl, connectionResult.clientPubKey);
        console.log("nwc uri is ", nwcURL)
        localStorage.setItem('autoPayNostr', "true");
        return connectionResult;
    }

    const setNwcURI = useCallback(() => {
        const walletKeys = JSON.parse(localStorage.getItem('WalletNostrKeys') || '{}')
        const clientRelayKeys = JSON.parse(localStorage.getItem('ClientRelayKeys') || '{}')
        console.log("getting keys from storage for setting nwcuri", clientRelayKeys)
        if (walletKeys && clientRelayKeys) {
            const uris = Object.entries(clientRelayKeys).map(([appName, value]) => {
                const { clientSecretKey, relay } = value as { clientSecretKey: string; relay?: string };
                const effectiveRelay = relay || 'wss://relay.getalby.com/v1';
                let result = {
                    appName,
                    nwcUri: `nostr+walletconnect://${walletKeys.walletNostrPubKey}?relay=${effectiveRelay}&secret=${clientSecretKey}`
                };
                return result;
            });

            setNWCURL(uris);
        }
    }, [])

    const updateRelay = (url: string) => {
        console.log('updating the relay set')
        setNWCRelays(prev => {
            const updatedRelays = [...prev, url];
            localStorage.setItem('nwcRelays', JSON.stringify(updatedRelays));
            return updatedRelays;
        });
    }

    const retryFailedEvents = async () => {
        const failedEvents = await ndk.cacheAdapter?.getUnpublishedEvents?.();

        if (failedEvents && failedEvents.length > 0) {
            console.log(`${failedEvents.length} cached events failed before. Retrying it...`);

            for (const ev of failedEvents) {
                try {
                    await ev.event.publish();
                } catch (err) {
                    console.error("Retry failed for event", ev.event.id);
                }
            }
        }
    };

    useEffect(() => {
        ndk.connect().then(() => {
            console.log("relay connected")
            console.log("storedRelay", nwcRelays)
            if (localStorage.getItem('nwcEnabled')) {
                setNWCEnabled(true)
            }
            retryFailedEvents();
        }).catch((error) => {
            console.log("an error occured", error)
        })
    }, [])

    useEffect(() => {
        initializeNDK(ndk)
    }, [initializeNDK])

    useEffect(() => {
        const nostrNWC = async () => {
            const walletKeys = JSON.parse(localStorage.getItem('WalletNostrKeys') || '{}');

            if (!walletKeys.walletNostrSecretKey || !walletKeys.walletNostrPubKey) {
                console.log('No wallet keys found, skipping NWC setup');
                return;
            }

            ndk.signer = new NDKPrivateKeySigner(walletKeys.walletNostrSecretKey);

            // Publish service info event only once
            const infoEvent = new NDKEvent(ndk);
            infoEvent.kind = 13194; // Service info event kind
            infoEvent.content = JSON.stringify({
                methods: ["get_info", "pay_invoice", "make_invoice", "get_balance", "list_transactions", "lookup_invoice"],
            });
            infoEvent.tags = [["p", walletKeys.walletNostrPubKey]];

            try {
                await infoEvent.sign();
                await infoEvent.publish();
                console.log('Published service info event');
            } catch (err) {
                console.error("Error publishing service info event:", err);
            }

            // Set up payment request handling
            if (localStorage.getItem('autoPayNostr') === "true") {
                console.log("Auto-pay enabled, setting up payment handler");
                await handleNostrPayment(wallet, walletKeys.walletNostrSecretKey, walletKeys.walletNostrPubKey, ndk);
            } else {
                if (confirm("Enable automatic payment processing for Nostr Wallet Connect?")) {
                    localStorage.setItem('autoPayNostr', "true");
                    await handleNostrPayment(wallet, walletKeys.walletNostrSecretKey, walletKeys.walletNostrPubKey, ndk);
                }
            }
        };

        if (nwcEnabled && walletStatus === 'open') {
            nostrNWC();
            setNwcURI();
        }
    }, [nwcEnabled, walletStatus]);

    useEffect(() => {
        if (nwcEnabled && walletStatus === 'open') {
            ndk.on('event:publish-failed', (event) => { // checking for failed events on wallet open
                alert(`nostr event failed ${event.id}`)
            })
        }
    }, [nwcEnabled, wallet])

    return <NostrContext.Provider value={{ nwcEnabled, generateNWCConnection, NostrRelay, NostrAppName, setNostrAppName, setNostrRelay, nwcURL, nwcRelays, updateRelay }}>
        {children}
    </NostrContext.Provider>
}

export default NostrContext