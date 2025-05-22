import type { CreateInvoiceResponse, InvoicePaymentResponse, Wallet } from "../hooks/wallet.type";

export const CreateInvoice = async (wallet: Wallet, amount: number, description: string): Promise<CreateInvoiceResponse> => {
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
        const { fee, payment_type } = await wallet.lightning.payInvoice(invoice);
        console.log("Invoice pay response:", fee, payment_type);
        let id= '';
        if ('lightning' in payment_type) {
            id= payment_type.lightning
        }else{
            throw new Error("Payment is of internal type")
        }
        return {id,fee};
    } catch (err) {
        console.error('PayInvoice error:', err);
        throw new Error(`Payment failed ${err}`)
    }
};
