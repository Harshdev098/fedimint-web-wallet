import type { CreateInvoiceResponse, InvoicePaymentResponse, Wallet } from "../hooks/wallet.type";
import type { LnPayState } from '@fedimint/core-web'

export const CreateInvoice = async (wallet: Wallet, amount: number,description:string): Promise<CreateInvoiceResponse> => {
    try {
        const result = await wallet?.lightning.createInvoice(amount, description)
        console.log("result", result)
        if (result) {
            return {
                operationId: result.operation_id,
                invoice: result.invoice
            };
        } else {
            throw new Error('Response not recieved')
        }
    } catch (err) {
        console.log(`an error occured ${err}`)
        throw new Error(`${err}`)
    }
}

export const PayInvoice = async (wallet: Wallet, invoice: string): Promise<InvoicePaymentResponse> => {
    try {
        if (!wallet) {
            return { success: false, error: 'Wallet or lightning service not initialized' };
        }

        const response = await wallet.lightning.payInvoice(invoice);
        console.log("Invoice pay response:", response);
        const payType = response.payment_type;
        const [type, operationId] = Object.entries(payType)[0]
        console.log("Payment type:", type, "Operation ID:", operationId);

        return new Promise((resolve) => {
            let unsubscribe: () => void;

            const handleSuccess = (state: any) => {
                console.log('Payment state:', state);
                if (state.state === 'success') {
                    resolve({
                        success: true,
                        data: {
                            preimage: state.preimage,
                            feeMsats: state.fee_msats ?? response.fee,
                        },
                    });
                    unsubscribe?.();
                } else if (state.state === 'failure') {
                    resolve({ success: false, error: 'Payment failed' });
                    unsubscribe?.();
                }
            };

            const handleError = (error: string) => {
                console.error('Payment subscription error:', error);
                resolve({ success: false, error });
                unsubscribe?.();
            };

            if (type === 'lightning') {
                unsubscribe = wallet.lightning.subscribeLnPay(operationId, handleSuccess, handleError);
            } else {
                resolve({ success: false, error: `Unknown payment type: ${type}` });
            }
        });

    } catch (err) {
        console.error('PayInvoice error:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : String(err),
        };
    }
};
