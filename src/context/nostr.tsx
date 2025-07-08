import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import WalletContext from "./wallet";
import { handleDiscoverFederation, handleNWCConnection, handleNostrPayment } from "../services/nostrPayment";
import { useNDKInit } from '@nostr-dev-kit/ndk-hooks';
import NDK from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import logger from "../utils/logger";
import type { Federation } from "../hooks/Federation.type";

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
    DiscoverFederation: () => Promise<void>;
    discoveredFederations: Federation[];
    isConnected: boolean;
    connectionStatus: string;
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
    updateRelay: (_relay: string) => { },
    DiscoverFederation: async () => {},
    discoveredFederations: [],
    isConnected: false,
    connectionStatus: 'disconnected'
})

export const NostrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [nwcEnabled, setNWCEnabled] = useState(false)
    const [nwcURL, setNWCURL] = useState<Array<{ appName: string, nwcUri: string }>>([])
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [connectedRelays, setConnectedRelays] = useState<string[]>([]);
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
    ]
    const [NostrAppName, setNostrAppName] = useState<string>('');
    const [NostrRelay, setNostrRelay] = useState<string | null>(null);
    const { wallet, walletStatus } = useContext(WalletContext)
    const [nwcRelays, setNWCRelays] = useState<string[]>(
        JSON.parse(localStorage.getItem('nwcRelays') || JSON.stringify(DEFAULT_RELAYS))
    )
    const [discoveredFederations, setDiscoveredFederations] = useState<Federation[]>([]);

    const initializeNDK = useNDKInit();

    // nostr integerations- cache adapters and ndk instances
    const cacheAdapter = new NDKCacheAdapterDexie({ dbName: "nwc-wallet-events" })
    cacheAdapter.onReady(() => {
        // logger.log("cache adapter ready to use")
    })

    useEffect(() => {
        const ndk = new NDK({
            autoConnectUserRelays: true,
            cacheAdapter,
            explicitRelayUrls: nwcRelays
        });
        ndkRef.current = ndk;
    }, []);

    const waitForConnection = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            const ndk = ndkRef.current;
            if (!ndk) {
                reject(new Error('NDK not initialized'));
                return;
            }

            if (connectedRelays.length > 0) {
                logger.log("Already connected to relays:", connectedRelays);
                resolve();
                return;
            }
            setConnectionStatus('connecting');

            const timeout = setTimeout(() => {
                logger.error("Connection timeout - no relays connected");
                setConnectionStatus('timeout');
                reject(new Error('Connection timeout'));
            }, 15000);

            const checkConnections = () => {
                const activeRelays = Array.from(ndk.pool.relays.keys()).filter(url => {
                    const relay = ndk.pool.relays.get(url);
                    return relay && relay.connectivity.status === 1;
                });

                logger.log("Active relays check:", activeRelays.length, "relays connected");
                
                if (activeRelays.length > 0) {
                    clearTimeout(timeout);
                    setConnectedRelays(activeRelays);
                    setIsConnected(true);
                    setConnectionStatus('connected');
                    logger.log("Connected to relays:", activeRelays);
                    resolve();
                } else {
                    setTimeout(checkConnections, 1000);
                }
            };

            checkConnections();
        });
    };

    const DiscoverFederation = async (): Promise<void> => {
        try {
            logger.log("Starting federation discovery...");
            
            const ndk = ndkRef.current;
            if (!ndk) {
                throw new Error('NDK not initialized');
            }
            await waitForConnection();
            
            logger.log("NDK connected");
            await handleDiscoverFederation(wallet, ndk, setDiscoveredFederations,discoveredFederations);
        } catch (error) {
            logger.error("Federation discovery failed:", error);
            setConnectionStatus('error');
        }
    };

    const generateNWCConnection = (appName: string, relay?: string) => {
        const ndk = ndkRef.current;
        if (!ndk) {
            logger.error("NDK not initialized");
            return null;
        }

        if (!appName) {
            logger.error("Nostr app name is required");
            return null;
        }
        logger.log("Nostr app name:", appName, "Relay:", relay);
        const connectionResult = handleNWCConnection(ndk, relay || null, appName);
        if (!connectionResult) {
            logger.error("Failed to generate NWC connection");
            return null;
        }
        setNWCURL((prev) => ([...prev, { appName, nwcUri: connectionResult.nwcUrl }]));
        setNWCEnabled(true);
        localStorage.setItem('nwcEnabled', "true");
        logger.log("NWC URL and keys:", connectionResult.nwcUrl, connectionResult.clientPubKey);
        localStorage.setItem('autoPayNostr', "true");
        return connectionResult;
    }

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

    const updateRelay = (url: string) => {
        setNWCRelays(prev => {
            const updatedRelays = [...prev, url];
            localStorage.setItem('nwcRelays', JSON.stringify(updatedRelays));
            return updatedRelays;
        });
    }

    const retryFailedEvents = async () => {
        const ndk = ndkRef.current;
        if (!ndk) return;

        const failedEvents = await ndk.cacheAdapter?.getUnpublishedEvents?.();

        if (failedEvents && failedEvents.length > 0) {
            logger.log(`${failedEvents.length} cached events failed before. Retrying it...`);

            for (const ev of failedEvents) {
                try {
                    await ev.event.publish();
                } catch (err) {
                    logger.error("Retry failed for event", ev.event.id);
                }
            }
        }
    };

    useEffect(() => {
        const SetupNDK = async () => {
            const ndk = ndkRef.current;
            if (!ndk) return;

            logger.log("Setting up NDK connection...");
            setConnectionStatus('connecting');

            ndk.pool.on('relay:connect', (relay) => {
                logger.log("Relay connected:", relay.url);
                setConnectedRelays(prev => {
                    const newRelays = [...prev, relay.url];
                    if (newRelays.length > 0) {
                        setIsConnected(true);
                        setConnectionStatus('connected');
                    }
                    return newRelays;
                });
            });

            ndk.pool.on('relay:disconnect', (relay) => {
                logger.log("Relay disconnected:", relay.url);
                setConnectedRelays(prev => {
                    const newRelays = prev.filter(url => url !== relay.url);
                    if (newRelays.length === 0) {
                        setIsConnected(false);
                        setConnectionStatus('disconnected');
                    }
                    return newRelays;
                });
            });

            try {
                await ndk.connect();
                
                if (localStorage.getItem('nwcEnabled')) {
                    setNWCEnabled(true);
                }
                setTimeout(() => {
                    retryFailedEvents();
                }, 2000);
                
            } catch (error) {
                logger.error("NDK connection error:", error);
                setConnectionStatus('error');
            }
        }

        SetupNDK();
    }, []);

    useEffect(() => {
        const ndk = ndkRef.current;
        if (ndk) {
            initializeNDK(ndk);
        }
    }, [initializeNDK]);

    useEffect(() => {
        const nostrNWC = async () => {
            const ndk = ndkRef.current;
            if (!ndk) return;

            const walletKeys = JSON.parse(localStorage.getItem('WalletNostrKeys') || '{}');

            if (!walletKeys.walletNostrSecretKey || !walletKeys.walletNostrPubKey) {
                logger.log('No wallet keys found, skipping NWC setup');
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
                logger.log('Published service info event');
            } catch (err) {
                logger.error("Error publishing service info event:", err);
            }

            // Set up payment request handling
            if (localStorage.getItem('autoPayNostr') === "true") {
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
            const ndk = ndkRef.current;
            if (ndk) {
                ndk.on('event:publish-failed', () => {
                    alert(`nostr event failed, preferred relay not connected! Please add a preferred relay`)
                });
            }
        }
    }, [nwcEnabled, wallet]);

    return <NostrContext.Provider value={{ 
        nwcEnabled, 
        generateNWCConnection, 
        NostrRelay, 
        NostrAppName, 
        setNostrAppName, 
        setNostrRelay, 
        nwcURL, 
        nwcRelays, 
        updateRelay, 
        DiscoverFederation, 
        discoveredFederations,
        isConnected,
        connectionStatus
    }}>
        {children}
    </NostrContext.Provider>
}

export default NostrContext