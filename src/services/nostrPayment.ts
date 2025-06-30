import NDK, { NDKEvent, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { PayInvoice } from "../services/LightningPaymentService";
import type { Wallet } from "../hooks/wallet.type";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
import { generateSecretKey, getPublicKey } from "nostr-tools";
// import type { Transactions } from "@fedimint/core-web";
import { handleZapRequest } from "./ZapService";

const invoiceStore = new Map<string, string>();

export const handleNWCConnection = (ndk: NDK, relay: string | null, appName: string) => {
    if (!appName) {
        console.error("App name is required");
        return null;
    }

    let storedKeys = localStorage.getItem('WalletNostrKeys');
    let walletNostrKeys: { walletNostrSecretKey?: string; walletNostrPubKey?: string } | null = null;
    if (storedKeys) {
        console.log("Stored wallet keys found:", storedKeys);
        walletNostrKeys = JSON.parse(storedKeys);
    }

    const walletNostrSecretKey = walletNostrKeys?.walletNostrSecretKey || bytesToHex(generateSecretKey());
    const walletNostrPubKey = walletNostrKeys?.walletNostrPubKey || getPublicKey(hexToBytes(walletNostrSecretKey));

    let clientRelayKeys: Record<string, { clientSecretKey: string; relay: string | null; nwcUrl: string }> = {};
    const rawClientRelayKeys = localStorage.getItem('ClientRelayKeys');
    if (rawClientRelayKeys) {
        console.log("Client relay keys found:", rawClientRelayKeys);
        clientRelayKeys = JSON.parse(rawClientRelayKeys);
    }

    let clientSecretKey: string;
    let clientPubKey: string;
    const effectiveRelay = relay || 'wss://relay.getalby.com/v1';

    if (clientRelayKeys[appName]) {
        console.log(`Using existing client keys for app: ${appName}`);
        clientSecretKey = clientRelayKeys[appName].clientSecretKey;
        clientPubKey = getPublicKey(hexToBytes(clientSecretKey));
    } else {
        console.log(`Generating new client keys for app: ${appName}`);
        clientSecretKey = bytesToHex(generateSecretKey());
        clientPubKey = getPublicKey(hexToBytes(clientSecretKey));
    }

    const nwcUrl = `nostr+walletconnect://${walletNostrPubKey}?relay=${effectiveRelay}&secret=${clientSecretKey}&appName=${encodeURIComponent(appName)}`;
    clientRelayKeys[appName] = { clientSecretKey, relay, nwcUrl };
    localStorage.setItem('ClientRelayKeys', JSON.stringify(clientRelayKeys));
    localStorage.setItem('WalletNostrKeys', JSON.stringify({ walletNostrSecretKey, walletNostrPubKey }));

    console.log(`Generated NWC URL for ${appName}:`, nwcUrl);
    console.log(`Client keys for ${appName}:`, { clientSecretKey, clientPubKey });

    // Publish wallet service info event
    ndk.signer = new NDKPrivateKeySigner(walletNostrSecretKey);
    const infoEvent = new NDKEvent(ndk);
    infoEvent.kind = 13194;
    infoEvent.pubkey = walletNostrPubKey;
    infoEvent.created_at = Math.floor(Date.now() / 1000);
    infoEvent.content = JSON.stringify({
        methods: ["get_info", "pay_invoice", "make_invoice", "get_balance", "list_transactions", "lookup_invoice"],
    });
    infoEvent.tags = [["p", walletNostrPubKey]];
    infoEvent.sign().then(() => {
        infoEvent.publish().then(() => {
            console.log(`Published wallet service info event for ${appName}`);
        }).catch((err) => console.error(`Error publishing service info event for ${appName}:`, err));
    }).catch((err) => console.error(`Error signing service info event for ${appName}:`, err));

    return { nwcUrl, clientPubKey, walletNostrSecretKey, walletNostrPubKey };
};

export const handleNostrPayment = async (wallet: Wallet, walletNostrSecretKey: string, walletNostrPubKey: string, ndk: NDK) => {
    const signer = new NDKPrivateKeySigner(walletNostrSecretKey);
    ndk.signer = signer;

    const subscription = ndk.subscribe({
        kinds: [23194],
        '#p': [walletNostrPubKey],
    });

    subscription.on('event', async (event: NDKEvent) => {
        console.log('got an event ', event);

        // Skip if this event is from wallet
        if (event.pubkey === walletNostrPubKey) {
            console.log('Skipping event from own wallet');
            return;
        }

        try {
            const sender = new NDKUser({ pubkey: event.pubkey });
            await event.decrypt(sender, signer, 'nip04');

            let content;
                try {
                    content = JSON.parse(event.content);
                    console.log('Decrypted event content:', content);
                } catch (e) {
                    console.log('Event content is not valid JSON:', e);
                    console.log('Raw content:', event.content);
                    return;
                }

            if (!content.method) {
                console.log('Event is not a payment request, skipping. Content structure:', {
                    hasMethod: !!content.method,
                    hasId: !!content.id,
                    keys: Object.keys(content)
                });
                return;
            }

            const method = content.method;
            const params = content.params || {};
            // Using event id if request id is not provided
            const id = content.id || event.id;

            console.log('Processing payment request:', { method, params, id });
            let result: { result?: any; error?: any };

            switch (method) {
                case 'get_info':
                    result = {
                        result: {
                            methods: ["get_info", "pay_invoice", "make_invoice", "get_balance", "create_connection", 'list_transactions', 'lookup_invoice'],
                            alias: "Fedimint Wallet",
                            color: "#ff9900",
                            pubkey: `${walletNostrPubKey}`,
                            network: "regtest",
                            block_height: 0,
                            block_hash: "0000000000000000000000000000000000000000000000000000000000000000",
                        },
                        error: null
                    };
                    break;
                case 'pay_invoice':
                    result = await PayInvoiceViaNostr(params).then((res) => res as { result?: any; error?: any; });
                    break;
                case 'get_balance':
                    result = await CheckBalance();
                    break;
                case 'make_invoice':
                    result = await CreateInvoice(params);
                    break;
                case 'lookup_invoice':
                    result = await LookForInvoice(params) as { result?: any; error?: any; };
                    break;
                case 'list_transactions':
                    result = await ListTransactions();
                    break;
                case 'zap_request':
                    result = await handleZapRequest(event, wallet, ndk, signer, walletNostrPubKey);
                    break;
                default:
                    result = {
                        error: {
                            code: "METHOD_NOT_FOUND",
                            message: `Method ${method} not supported`
                        }
                    };
            }

            // Send response back to the client
            const response = new NDKEvent(ndk);
            response.kind = 23195;
            response.tags = [["p", event.pubkey], ["e", event.id]];

            const jsonRpcResponse = {
                id: content.id || event.id,
                ...(result.error ? { error: result.error } : { result: result.result })
            };

            console.log('Sending JSON-RPC response:', {
                method: method,
                response: jsonRpcResponse,
                stringified: JSON.stringify(jsonRpcResponse)
            });

            response.content = JSON.stringify(jsonRpcResponse);
            const senderEvent = new NDKUser({ pubkey: event.pubkey });
            await response.encrypt(senderEvent, signer, 'nip04');
            await response.sign(signer);
            await response.publish();
            console.log('Response sent successfully for method:', method, 'with ID:', content.id || event.id);
        } catch (error) {
            console.error('Error processing event:', error);
            try {
                const sender = new NDKUser({ pubkey: event.pubkey });
                const errorResponse = new NDKEvent(ndk);
                errorResponse.kind = 23195;
                errorResponse.tags = [["p", event.pubkey], ["e", event.id]];
                errorResponse.content = JSON.stringify({
                    error: {
                        code: "PROCESSING_ERROR",
                        message: "Failed to process request"
                    }
                });

                await errorResponse.encrypt(sender, signer, 'nip04');
                await errorResponse.sign(signer);
                await errorResponse.publish();
            } catch (responseError) {
                console.error('Failed to send error response:', responseError);
            }
        }
    });

    subscription.on('eose', () => {
        console.log('End of stored events');
    });

    subscription.on('close', () => {
        console.log('Subscription closed');
    });


    const CheckBalance = async () => {
        try {
            const msats = await new Promise<number>((resolve, reject) => {
                const unsubscribe = wallet.balance.subscribeBalance((msats) => {
                    resolve(msats);
                    unsubscribe?.();
                });
                setTimeout(() => {
                    reject(new Error("Timeout while fetching balance"));
                    unsubscribe?.();
                }, 10000);
            });

            return {
                result: { balance: msats },
                error: null
            };
        } catch (error: any) {
            return {
                result: null,
                error: {
                    code: "BALANCE_ERROR",
                    message: error.message || "Failed to get balance"
                }
            };
        }
    };

    const CreateInvoice = async (request: { amount: number, description: string, description_hash: string, expiry: number }) => {
        try {
            const invoiceData = await wallet.lightning.createInvoice(
                request.amount,
                request.description || 'This is an invoice'
            );
            console.log(invoiceData.operation_id)
            invoiceStore.set(invoiceData.invoice, invoiceData.operation_id)

            const now = Math.floor(Date.now() / 1000);

            return {
                result: {
                    type: "incoming",
                    invoice: invoiceData.invoice,
                    description: request.description || 'This is an invoice',
                    description_hash: request.description_hash || null,
                    preimage: null,
                    payment_hash: invoiceData.operation_id || '',
                    amount: request.amount,
                    fees_paid: 0,
                    created_at: now,
                    expires_at: request.expiry ? now + request.expiry : now + 3600,
                    settled_at: null,
                    metadata: {}
                },
                error: null
            };;
        } catch (error: any) {
            return {
                result: null,
                error: { code: "INTERNAL", message: error?.toString() }
            };
        }
    }

    const PayInvoiceViaNostr = async (request: { invoice: string, amount: number }) => {
        try {
            console.log("request ", request)
            const invoiceResult = await PayInvoice(wallet, request.invoice)
            console.log("invoice Result is ", invoiceResult)
            return new Promise((resolve, reject) => {
                const unsubscribe = wallet?.lightning.subscribeLnPay(
                    invoiceResult.id,
                    async (state) => {
                        if (typeof state === 'object' && 'success' in state) {
                            ndk
                            resolve({
                                result_type: 'pay_invoice',
                                result: {
                                    preimage: (state.success as { preimage: string }).preimage,
                                    fees_paid: invoiceResult.fee
                                },
                                error: null
                            });
                        } else if (typeof state === 'object' && 'canceled' in state) {
                            reject({
                                result: null,
                                error: { code: "payment_cancelled", message: "Payment Cancelled" }
                            });
                        }
                    },
                    (error) => {
                        console.error("Error in subscription:", error);
                        resolve({
                            result: undefined,
                            error: { code: "subscription_error", message: error?.toString() || "Unknown error" }
                        });
                    }
                );

                setTimeout(() => {
                    unsubscribe?.();
                }, 300000);
            });
        } catch (error: any) {
            return {
                result: error,
                error: { code: "PAYMENT_FAILED", message: error?.toString() || "Unknown error" }
            };
        }
    }

    const ListTransactions = async () => {
        try {
            // const rawTransactions: Transactions[] = await wallet.federation.listTransactions()
            // const now = Math.floor(Date.now() / 1000);
            // const transactions = rawTransactions
            //     .map(tx => {
            //         if (tx.type === 'lightning') {
            //             let state: "settled" | "pending" | "failed" = "pending";
            //             if (tx.outcome === "claimed" || tx.outcome === "success") {
            //                 state = "settled";
            //             } else if (tx.outcome == 'cancelled' || tx.outcome === 'failed') {
            //                 state = "failed"
            //             } else {
            //                 state = "pending"
            //             }
            //             return {
            //                 result: {
            //                     timeStamp: tx.timeStamp,
            //                     type: tx.type,
            //                     expires_at: now,
            //                     metadata: '',
            //                     description: '',
            //                     description_hash: '',
            //                     amount: Number(tx.amount),
            //                     fees_paid: 0,
            //                     created_at: now,
            //                     preimage: '',
            //                     payment_hash: '',
            //                     invoice: tx.invoice,
            //                     state,
            //                     settled_at: now,
            //                 },
            //                 error: null
            //             };
            //         }
            //     })
            // return {
            //     result: {
            //         total_count: transactions.length,
            //         transactions: transactions
            //     },
            //     error: null
            // };
            return {
                result: [],
                error: null
            };
        } catch (error: any) {
            return {
                result: null,
                error: { code: "list_transactions_error", message: error?.toString() || "Unknown error" }
            };
        }
    }

    const LookForInvoice = async (request: { invoice: string, payment_hash: string }) => {
        if (!request.invoice) {
            console.log("invoice not found");
            return {
                result: null,
                error: { code: "INVALID_INVOICE", message: "Invoice is undefined" }
            };
        }

        const operationId = invoiceStore.get(request.invoice);
        if (!operationId) {
            console.log("Invoice not found in invoiceStore");
            return {
                result: null,
                error: { code: "NOT_FOUND", message: "Invoice not found" }
            };
        }

        return new Promise((resolve, reject) => {
            const unsubscribe = wallet?.lightning.subscribeLnReceive(
                operationId,
                async (state) => {
                    if (state === 'claimed') {
                        resolve({
                            result: {
                                invoice: request.invoice || "",
                                amount: 1000,
                                expires_at: 0,
                                metadata: undefined,
                                description: '',
                                description_hash: '',
                                type: "incoming",
                                fees_paid: 0,
                                created_at: 0,
                                preimage: '0000000000000000000000000000000000000000000000000000000000000000',
                                payment_hash: operationId,
                                state: 'settled'
                            },
                            error: null
                        });
                    } else if (typeof state === 'object' && 'canceled' in state) {
                        reject({
                            result: null,
                            error: { code: "PAYMENT_CANCELLED", message: "Payment Cancelled" }
                        });
                    }
                },
                (error) => {
                    console.error("Error in subscription:", error);
                    resolve({
                        result: null,
                        error: { code: "SUBSCRIPTION_ERROR", message: error?.toString() || "Unknown error" }
                    });
                }
            );

            setTimeout(() => {
                unsubscribe?.();
            }, 300000);
        });
    };
    
    return subscription;
}