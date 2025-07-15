import { createContext, useContext, useState, useEffect, useRef, useMemo,useCallback } from "react";
import WalletContext from "./wallet";
import { handleDiscoverFederation, handleNWCConnection, handleNostrPayment } from "../services/nostrPayment";
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import logger from "../utils/logger";
import type { DiscoveredFederation } from "../hooks/Federation.type";

interface NostrContextType {
    nwcEnabled: boolean;
    nwcURL: Array<{ appName: string, nwcUri: string }>;
    setNostrAppName: React.Dispatch<React.SetStateAction<string>>;
    NostrAppName: string;
    setNostrRelay: React.Dispatch<React.SetStateAction<string | null>>;
    NostrRelay: string | null;
    generateNWCConnection: (appName: string, relay?: string) => ReturnType<typeof handleNWCConnection> | null;
    updateRelay: (relay: string) => void;
    DiscoverFederation: () => Promise<void>;
    discoveredFederations: DiscoveredFederation[];
    isConnected: boolean;
    connectionStatus: { relay: string, status: string }[];
}

const NostrContext = createContext<NostrContextType>({
    nwcEnabled: false,
    nwcURL: [],
    setNostrAppName: () => { },
    NostrAppName: '',
    setNostrRelay: () => { },
    NostrRelay: null,
    generateNWCConnection: () => null,
    updateRelay: () => { },
    DiscoverFederation: async () => { },
    discoveredFederations: [],
    isConnected: false,
    connectionStatus: [],
});

export const NostrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { wallet, walletStatus } = useContext(WalletContext);

    const [nwcEnabled, setNWCEnabled] = useState(false);
    const [nwcURL, setNWCURL] = useState<NostrContextType['nwcURL']>([]);
    const [connectionStatus, setConnectionStatus] = useState<NostrContextType['connectionStatus']>([]);
    const ndkRef = useRef<NDK | null>(null);
    const DEFAULT_RELAYS = [
        'wss://nostr.mutinywallet.com/',
        'wss://relay.damus.io',
        'wss://relay.getalby.com/v1',
        'wss://nos.lol',
        'wss://relay.nostr.band',
        'wss://relay.snort.social',
        'wss://relay.primal.net',
        'wss://bitcoiner.social',
        'wss://nostr.bitcoiner.social',
    ];

    const [NostrAppName, setNostrAppName] = useState('');
    const [NostrRelay, setNostrRelay] = useState<string | null>(null);
    const [nwcRelays, setNWCRelays] = useState<string[]>(
        JSON.parse(localStorage.getItem('nwcRelays') || JSON.stringify(DEFAULT_RELAYS))
    );
    const [discoveredFederations, setDiscoveredFederations] = useState<DiscoveredFederation[]>([]);

    const cacheAdapter = new NDKCacheAdapterDexie({ dbName: "nwc-wallet-events" });

    useEffect(() => {
        cacheAdapter.onReady(() => {
            // logger.log("Dexie cache ready");
        });

        const ndk = new NDK({
            autoConnectUserRelays: true,
            cacheAdapter,
            explicitRelayUrls: nwcRelays,
        });
        ndkRef.current = ndk;
    }, [nwcRelays]);

    const isConnected = useMemo(
        () => connectionStatus.some(r => r.status === 'connected'),
        [connectionStatus]
    );

    const waitForConnection = (): Promise<void> =>
        new Promise((resolve, reject) => {
            const ndk = ndkRef.current;
            if (!ndk) return reject(new Error('NDK not initialized'));

            if (isConnected) return resolve();

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 15000);

            const check = () => {
                const connected = Array.from(ndk.pool.relays.values()).filter(r => r.connectivity.status === 1);
                if (connected.length > 0) {
                    clearTimeout(timeout);
                    connected.forEach(relay => {
                        setConnectionStatus(prev => {
                            const exists = prev.find(r => r.relay === relay.url);
                            return exists
                                ? prev.map(r => (r.relay === relay.url ? { ...r, status: 'connected' } : r))
                                : [...prev, { relay: relay.url, status: 'connected' }];
                        });
                    });
                    resolve();
                } else {
                    setTimeout(check, 1000);
                }
            };

            check();
        });

    const DiscoverFederation = async () => {
        try {
            logger.log("Discovering federation...");
            const ndk = ndkRef.current;
            if (!ndk) throw new Error('NDK not initialized');
            await waitForConnection();
            await handleDiscoverFederation(wallet, ndk, setDiscoveredFederations, discoveredFederations);
        } catch (err) {
            logger.error("Federation discovery failed:", err);
        }
    };

    const generateNWCConnection = (appName: string, relay?: string) => {
        const ndk = ndkRef.current;
        if (!ndk || !appName) return null;

        const connection = handleNWCConnection(ndk, relay || null, appName);
        if (connection) {
            setNWCURL(prev => [...prev, { appName, nwcUri: connection.nwcUrl }]);
            setNWCEnabled(true);
            localStorage.setItem('nwcEnabled', "true");
            localStorage.setItem('autoPayNostr', "true");
        }
        return connection;
    };

    const updateRelay = (url: string) => {
        setNWCRelays(prev => {
            const updated = [...prev, url];
            localStorage.setItem('nwcRelays', JSON.stringify(updated));
            return updated;
        });
        setConnectionStatus(prev => {
            const exists = prev.some(r => r.relay === url);
            if (exists) return prev;
            return [...prev, { relay: url, status: 'pending' }];
        });
    };

    const retryFailedEvents = async () => {
        const ndk = ndkRef.current;
        const failed = await ndk?.cacheAdapter?.getUnpublishedEvents?.();
        if (failed?.length) {
            for (const ev of failed) {
                try { await ev.event.publish(); } catch { }
            }
        }
    };

    const setNwcURI = useCallback(() => {
        const walletKeys = JSON.parse(localStorage.getItem('WalletNostrKeys') || '{}')
        const clientRelayKeys = JSON.parse(localStorage.getItem('ClientRelayKeys') || '{}')
        logger.log("getting keys from storage for setting nwcuri", clientRelayKeys)
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

    useEffect(() => {
        const ndk = ndkRef.current;
        if (!ndk) return;

        ndk.pool.on('relay:connect', relay => {
            logger.log("Relay connected:", relay.url);
            setConnectionStatus(prev => {
                const exists = prev.find(r => r.relay === relay.url);
                return exists
                    ? prev.map(r => r.relay === relay.url ? { ...r, status: 'connected' } : r)
                    : [...prev, { relay: relay.url, status: 'connected' }];
            });
        });

        ndk.pool.on('relay:disconnect', relay => {
            logger.log("Relay disconnected:", relay.url);
            setConnectionStatus(prev =>
                prev.map(r =>
                    r.relay === relay.url ? { ...r, status: 'disconnected' } : r
                )
            );
        });

        ndk.connect().then(() => {
            if (localStorage.getItem('nwcEnabled')) setNWCEnabled(true);
            retryFailedEvents();
        }).catch(err => {
            logger.error("NDK connection failed", err);
        });
    }, []);

    useEffect(() => {
        const runNostrNWC = async () => {
            const ndk = ndkRef.current;
            if (!ndk) return;

            const walletKeys = JSON.parse(localStorage.getItem('WalletNostrKeys') || '{}');
            if (!walletKeys.walletNostrSecretKey) return;

            ndk.signer = new NDKPrivateKeySigner(walletKeys.walletNostrSecretKey);

            const infoEvent = new NDKEvent(ndk);
            infoEvent.kind = 13194;
            infoEvent.content = JSON.stringify({
                methods: ["get_info", "pay_invoice", "make_invoice", "get_balance", "list_transactions", "lookup_invoice", "notifications", "payment_sent", "payment_received"],
            });
            infoEvent.tags = [["p", walletKeys.walletNostrPubKey]];

            try {
                await infoEvent.sign();
                await infoEvent.publish();
            } catch (err) {
                logger.error("Info event publish failed", err);
            }

            if (localStorage.getItem('nwcEnabled') === "true") {
                await handleNostrPayment(wallet, walletKeys.walletNostrSecretKey, walletKeys.walletNostrPubKey, ndk);
            }
        };

        if (nwcEnabled && walletStatus === 'open') {
            runNostrNWC()
            setNwcURI()
        }
    }, [nwcEnabled, walletStatus]);

    return (
        <NostrContext.Provider value={{
            nwcEnabled,
            nwcURL,
            setNostrAppName,
            NostrAppName,
            setNostrRelay,
            NostrRelay,
            generateNWCConnection,
            updateRelay,
            DiscoverFederation,
            discoveredFederations,
            isConnected,
            connectionStatus,
        }}>
            {children}
        </NostrContext.Provider>
    );
};

export default NostrContext;
