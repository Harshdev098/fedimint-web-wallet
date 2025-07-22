import type { CreateInvoiceResponse, InvoicePaymentResponse } from "../hooks/wallet.type";
import { Wallet } from "@fedimint/core-web";
import logger from "../utils/logger";
import type { AppDispatch } from '../redux/store'
import { createNotification } from '../redux/slices/NotificationSlice'
import { setPayStatus } from '../redux/slices/LightningPayment'
import { subscribeBalance } from "./BalanceService";
import type { LnPayState, LnReceiveState } from "@fedimint/core-web";
import type { FederationMetaData } from "../hooks/Federation.type";
import validate from "bitcoin-address-validation";

export const CreateInvoice = async (wallet: Wallet, amount: number, description: string): Promise<CreateInvoiceResponse> => {
    try {
        const expiryTime = Number(localStorage.getItem('InvoiceExpiryTime')) * 60;
        logger.log("expiry time is ", expiryTime)
        logger.log("time from localstorage is ", localStorage.getItem('InvoiceExpiryTime'))
        const result = await wallet?.lightning.createInvoice(amount, description, expiryTime)
        logger.log("result", result)
        if (result) {
            return {
                operationId: result.operation_id,
                invoice: result.invoice
            };
        } else {
            throw new Error('Response not recieved')
        }
    } catch (err) {
        logger.log(`an error occured ${err}`)
        throw new Error(`${err}`)
    }
}

export const PayInvoice = async (wallet: Wallet, invoice: string): Promise<InvoicePaymentResponse> => {
    try {
        const { fee, payment_type } = await wallet.lightning.payInvoice(invoice);
        logger.log("Invoice pay response:", fee, payment_type);
        let payType, id = '';
        if ('lightning' in payment_type) {
            id = payment_type.lightning
            payType = 'lightning'
        } else {
            id = payment_type.internal
            payType = 'internal'
            logger.log("internal payment ", payment_type.internal)
        }
        return { id, fee, payType };
    } catch (err) {
        logger.error('PayInvoice error:', err);
        throw new Error(`Payment failed ${err}`)
    }
};


export const subscribeLnPay = (
    wallet: any,
    paymentId: string,
    dispatch: AppDispatch,
): (() => void) => {
    const unsubscribe = wallet.lightning.subscribeLnPay(
        paymentId,
        (state: LnPayState) => {
            const date = new Date().toDateString()
            const time = new Date().toTimeString()

            if (state === 'created') {
                dispatch(setPayStatus(state))
            } else if (state === 'canceled') {
                dispatch(createNotification({ type: 'Payment', data: 'Payment Cancelled', date, time, OperationId: paymentId }))
                dispatch(setPayStatus(state))
            } else if (typeof state === 'object') {
                if ('success' in state) {
                    dispatch(createNotification({ type: 'Payment', data: 'Payment Succeeded', date, time, OperationId: paymentId }))
                    subscribeBalance(wallet, dispatch)
                    dispatch(setPayStatus('success'))
                } else if ('funded' in state) {
                    dispatch(createNotification({ type: 'Payment', data: 'Payment Funded', date, time, OperationId: paymentId }))
                    dispatch(setPayStatus('funded'))
                } else if ('waiting_for_refund' in state) {
                    dispatch(createNotification({ type: 'Payment', data: 'Waiting for Refund', date, time, OperationId: paymentId }))
                    dispatch(setPayStatus('waiting_for_refund'))
                } else if ('refunded' in state) {
                    dispatch(createNotification({ type: 'Payment', data: 'Payment Refunded', date, time, OperationId: paymentId }))
                    dispatch(setPayStatus('refunded'))
                } else if ('unexpected_error' in state) {
                    dispatch(createNotification({ type: 'Payment', data: 'Unexpected Error Occurred', date, time, OperationId: paymentId }))
                    dispatch(setPayStatus('unexpected_error'))
                }
            }
        },
        (error: any) => {
            console.error("Error in Lightning subscribeLnPay:", error)
            throw new Error("An error occurred! Payment cancelled")
        }
    )

    return unsubscribe
}

export const subscribeLnReceive = (
    wallet: any,
    operationId: string,
    dispatch: AppDispatch,
    metaData:FederationMetaData | null
) => {
    const unsubscribe = wallet?.lightning.subscribeLnReceive(
        operationId,
        async (state:LnReceiveState) => {
            const date = (new Date()).toDateString()
            const time = (new Date()).toTimeString()
            if (state === "funded") {
                dispatch(createNotification({ type: 'Payment', data: 'Payment Recieved', date: date, time: time, OperationId: operationId }))
                subscribeBalance(wallet, dispatch)
                const balance = await wallet.balance.getBalance()
                let externalAddress = localStorage.getItem('autoWithdrawalValue')
                if (metaData?.max_stable_balance_msats && externalAddress && (balance > Number(metaData?.max_stable_balance_msats))) {
                    if (validate(externalAddress)) {
                        // transfer the increased funds to external address
                        // await wallet.wallet.withdraw(validateAddress,balance-metaData?.max_stable_balance_msats)
                    }
                }
            } else if (typeof state === 'object' && 'canceled' in state) {
                dispatch(createNotification({ type: 'Payment', data: `Payment Canceled ${state.canceled.reason}`, date: date, time: time, OperationId: operationId }))
            }
        },
        (error:any) => {
            logger.error("Error in subscription:", error);
            throw new Error("An error occured! Payment cancelled")
        }
    );
    return unsubscribe;
}