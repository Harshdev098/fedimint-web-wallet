import { nwc } from "@getalby/sdk";
import { PayInvoice } from "../services/LightningPaymentService";
import type { Wallet } from "../hooks/wallet.type";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
import { generateSecretKey, getPublicKey } from "nostr-tools";
// import type { Transactions } from "@fedimint/core-web";

const invoiceStore = new Map<string, string>();

export const handleNWCConnection = (nwcService: nwc.NWCWalletService) => {
    let storedKeys = localStorage.getItem('WalletNostrKeys')
    let walletNostrKeys = null
    if (storedKeys) {
        walletNostrKeys = JSON.parse(storedKeys)
    }
    const walletNostrSecretKey = walletNostrKeys?.walletNostrSecretKey || bytesToHex(generateSecretKey())
    const walletNostrPubKey = walletNostrKeys?.walletNostrPubKey || getPublicKey(hexToBytes(walletNostrSecretKey))
    const clientSecretKey = walletNostrKeys?.clientSecretKey || bytesToHex(generateSecretKey())
    const clientPubKey = walletNostrKeys?.clientPubKey || getPublicKey(hexToBytes(clientSecretKey))
    !walletNostrKeys && localStorage.setItem('WalletNostrKeys', (JSON.stringify({ walletNostrSecretKey, walletNostrPubKey, clientPubKey, clientSecretKey })))
    const nwcUrl = `nostr+walletconnect://${walletNostrPubKey}?relay=wss://relay.getalby.com/v1&secret=${clientSecretKey}`;
    nwcService
        .publishWalletServiceInfoEvent(walletNostrSecretKey, ["get_info", "pay_invoice", "create_connection", "get_balance", "make_invoice", 'list_transactions', 'lookup_invoice'], [])
        .catch(console.error);
    localStorage.setItem('nwcEnabled', "true")
    console.log("nwculr and keys are ", nwcUrl, clientPubKey, clientSecretKey)
    return { nwcUrl, clientPubKey, walletNostrSecretKey, walletNostrPubKey };
}

export const handleNostrPayment = async (wallet: Wallet, clientPubKey: string, walletNostrSecretKey: string, walletNostrPubKey: string, nwcService: nwc.NWCWalletService) => {
    const keypair = new nwc.NWCWalletServiceKeyPair(walletNostrSecretKey, clientPubKey);
    const unsub = await nwcService.subscribe(keypair, {
        getInfo: async () => ({
            result: {
                methods: ["get_info", "pay_invoice", "make_invoice", "get_balance", "create_connection", 'list_transactions', 'lookup_invoice'],
                alias: "Fedimint Wallet",
                color: "#ff9900",
                pubkey: `${walletNostrPubKey}`,
                network: "regtest",
                block_height: 0,
                block_hash: "0000000000000000000000000000000000000000000000000000000000000000",
            },
            error: undefined
        }),

        payInvoice: async (request) => {
            try {
                console.log("request ", request)
                const invoiceResult = await PayInvoice(wallet, request.invoice)
                console.log("invoice Result is ", invoiceResult)
                return new Promise((resolve, reject) => {
                    const unsubscribe = wallet?.lightning.subscribeLnPay(
                        invoiceResult.id,
                        async (state) => {
                            if (typeof state === 'object' && 'success' in state) {
                                nwcService
                                resolve({
                                    result: {
                                        preimage: (state.success as { preimage: string }).preimage,
                                        fees_paid: invoiceResult.fee
                                    },
                                    error: undefined
                                });
                            } else if (typeof state === 'object' && 'canceled' in state) {
                                reject({
                                    result: undefined,
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
                    result: undefined,
                    error: { code: "pay_invoice_error", message: error?.toString() || "Unknown error" }
                };
            }
        },
        getBalance: async () => {
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
                    error: undefined
                };
            } catch (error: any) {
                return {
                    result: undefined,
                    error: { code: "get_balance_error", message: error?.toString() || "Unknown error" }
                };
            }
        },
        makeInvoice: async (request) => {
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
                        invoice: invoiceData.invoice,
                        amount: request.amount,
                        expires_at: request.expiry || now + 3600,
                        metadata: request.metadata,
                        description: request.description || '',
                        description_hash: request.description_hash || '',
                        type: "incoming",
                        fees_paid: 0,
                        created_at: now,
                        preimage: '',
                        payment_hash: '',
                        settled_at: now,
                        state: 'pending'
                    },
                    error: undefined
                };
            } catch (error: any) {
                return {
                    result: undefined,
                    error: { code: "make_invoice_error", message: error?.toString() || "Unknown error" }
                };
            }
        },
        // listTransactions: async () => {
        //     try {
        //         const rawTransactions: Transactions[] = await wallet.federation.listTransactions()
        //         const now = Math.floor(Date.now() / 1000);
        //         const transactions: Nip47Transaction[] = rawTransactions
        //             .map(tx => {
        //                 if (tx.type === 'lightning') {
        //                     let state: "settled" | "pending" | "failed" = "pending";
        //                     if (tx.outcome === "claimed" || tx.outcome === "success") {
        //                         state = "settled";
        //                     } else if (tx.outcome == 'cancelled' || tx.outcome === 'failed') {
        //                         state = "failed"
        //                     } else {
        //                         state = "pending"
        //                     }
        //                     return {
        //                         timeStamp: tx.timeStamp,
        //                         type: tx.type,
        //                         expires_at: now,
        //                         metadata: '',
        //                         description: '',
        //                         description_hash: '',
        //                         amount: Number(tx.amount),
        //                         fees_paid: 0,
        //                         created_at: now,
        //                         preimage: '',
        //                         payment_hash: '',
        //                         invoice: tx.invoice,
        //                         state,
        //                         settled_at: now,
        //                     };
        //                 }
        //                 return undefined;
        //             })
        //             .filter(Boolean) as Nip47Transaction[];
        //         return {
        //             result: {
        //                 total_count: transactions.length,
        //                 transactions: transactions
        //             },
        //             error: undefined
        //         };
        //     } catch (error: any) {
        //         return {
        //             result: undefined,
        //             error: { code: "list_transactions_error", message: error?.toString() || "Unknown error" }
        //         };
        //     }
        // },
        lookupInvoice: async (request) => {
            if (!request.invoice) {
                return Promise.resolve({
                    result: undefined,
                    error: { code: "invalid_invoice", message: "Invoice is undefined" }
                });
            }
            
            const operationId = invoiceStore.get(request.invoice);
            if (operationId) {
                return new Promise((resolve, reject) => {
                    const unsubscribe = wallet?.lightning.subscribeLnReceive(
                        operationId,
                        async (state) => {
                            if (state === 'claimed') {
                                resolve({
                                    result: {
                                        invoice: request.invoice || "",
                                        amount: 0,
                                        expires_at: 0,
                                        metadata: undefined,
                                        description: '',
                                        description_hash: '',
                                        type: "incoming",
                                        fees_paid: 0,
                                        created_at: 0,
                                        preimage: '',
                                        payment_hash: '',
                                        settled_at: 0,
                                        state: 'settled'
                                    },
                                    error: undefined
                                });
                            } else if (typeof state === 'object' && 'canceled' in state) {
                                reject({
                                    result: undefined,
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
            }
            return Promise.resolve({
                result: undefined,
                error: { code: "operation_id_not_found", message: "Operation ID not found for invoice" }
            });
        }
    });
    return () => unsub?.();
}