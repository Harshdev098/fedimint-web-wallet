import type { CreateInvoiceResponse, InvoicePaymentResponse } from '../hooks/wallet.type';
import { Wallet } from '@fedimint/core-web';
import logger from '../utils/Logger';
import type { AppDispatch } from '../redux/store';
import { createNotification } from '../redux/slices/NotificationSlice';
import { setPayStatus } from '../redux/slices/LightningPayment';
import { subscribeBalance } from './BalanceService';
import type { LnInternalPayState, LnPayState, LnReceiveState } from '@fedimint/core-web';
import validate from 'bitcoin-address-validation';

export const CreateInvoice = async (
    wallet: Wallet,
    amount: number,
    description: string,
    expiryTime: number
): Promise<CreateInvoiceResponse> => {
    try {
        logger.log('expiry time is ', expiryTime * 60);
        const result = await wallet?.lightning.createInvoice(amount, description, expiryTime * 60);
        logger.log('result', result);
        if (result) {
            return {
                operationId: result.operation_id,
                invoice: result.invoice,
            };
        } else {
            throw new Error('Response not recieved');
        }
    } catch (err) {
        logger.log(`an error occured ${err}`);
        throw new Error(`${err}`);
    }
};

export const PayInvoice = async (
    wallet: Wallet,
    invoice: string
): Promise<InvoicePaymentResponse> => {
    try {
        const { fee, payment_type } = await wallet.lightning.payInvoice(invoice);
        logger.log('Invoice pay response:', fee, payment_type);
        let payType,
            id = '';
        if ('lightning' in payment_type) {
            id = payment_type.lightning;
            payType = 'lightning';
        } else {
            id = payment_type.internal;
            payType = 'internal';
            logger.log('internal payment ', payment_type.internal);
        }
        return { id, fee, payType };
    } catch (err) {
        logger.error('PayInvoice error:', err);
        throw new Error(`Payment failed ${err}`);
    }
};

export const subscribeLnPay = (
    wallet: Wallet,
    paymentId: string,
    dispatch: AppDispatch
): (() => void) => {
    const unsubscribe = wallet.lightning.subscribeLnPay(
        paymentId,
        (state: LnPayState) => {
            const date = new Date().toDateString();
            const time = new Date().toTimeString();

            if (state === 'created') {
                dispatch(setPayStatus(state));
            } else if (state === 'canceled') {
                dispatch(
                    createNotification({
                        type: 'lightning',
                        data: 'Payment Cancelled',
                        date,
                        time,
                        OperationId: paymentId,
                    })
                );
                dispatch(setPayStatus(state));
            } else if (typeof state === 'object') {
                if ('success' in state) {
                    dispatch(
                        createNotification({
                            type: 'lightning',
                            data: 'Payment Succeeded',
                            date,
                            time,
                            OperationId: paymentId,
                        })
                    );
                    subscribeBalance(wallet, dispatch);
                    dispatch(setPayStatus('success'));
                } else if ('funded' in state) {
                    dispatch(
                        createNotification({
                            type: 'lightning',
                            data: 'Payment Funded',
                            date,
                            time,
                            OperationId: paymentId,
                        })
                    );
                    dispatch(setPayStatus('funded'));
                } else if ('waiting_for_refund' in state) {
                    dispatch(
                        createNotification({
                            type: 'lightning',
                            data: 'Waiting for Refund',
                            date,
                            time,
                            OperationId: paymentId,
                        })
                    );
                    dispatch(setPayStatus('waiting_for_refund'));
                } else if ('refunded' in state) {
                    dispatch(
                        createNotification({
                            type: 'lightning',
                            data: 'Payment Refunded',
                            date,
                            time,
                            OperationId: paymentId,
                        })
                    );
                    dispatch(setPayStatus('refunded'));
                } else if ('unexpected_error' in state) {
                    dispatch(
                        createNotification({
                            type: 'lightning',
                            data: 'Unexpected Error Occurred',
                            date,
                            time,
                            OperationId: paymentId,
                        })
                    );
                    dispatch(setPayStatus('unexpected_error'));
                }
            }
        },
        (error: string) => {
            console.error('Error in Lightning subscribeLnPay:', error);
            throw new Error('An error occurred fetching state!');
        }
    );

    return unsubscribe;
};

export const subscribeInternalPay = (
    wallet: Wallet,
    operationId: string,
    dispatch: AppDispatch
) => {
    const unsubscribe = wallet.lightning.subscribeInternalPayment(
        operationId,
        (state: LnInternalPayState) => {
            const date = new Date().toDateString();
            const time = new Date().toTimeString();
            if (typeof state === 'object' && 'preimage' in state) {
                dispatch(
                    createNotification({
                        type: 'lightning',
                        data: 'Payment Funded',
                        date,
                        time,
                        OperationId: operationId,
                    })
                );
                dispatch(setPayStatus('funded'));
            } else if (typeof state === 'object' && 'funding_failed' in state) {
                dispatch(
                    createNotification({
                        type: 'lightning',
                        data: 'Funding failed',
                        date,
                        time,
                        OperationId: operationId,
                    })
                );
                dispatch(setPayStatus('funded'));
            } else if (typeof state === 'object' && 'refund_success' in state) {
                dispatch(
                    createNotification({
                        type: 'lightning',
                        data: 'Refund Successfull',
                        date,
                        time,
                        OperationId: operationId,
                    })
                );
                dispatch(setPayStatus('funded'));
            }
        },
        (error: string) => {
            throw new Error(`An error occured fetching state! ${error}`);
        }
    );
    return unsubscribe;
};

export const subscribeLnReceive = (wallet: Wallet, operationId: string, dispatch: AppDispatch) => {
    const unsubscribe = wallet.lightning.subscribeLnReceive(
        operationId,
        async (state: LnReceiveState) => {
            const date = new Date().toDateString();
            const time = new Date().toTimeString();
            if (state === 'funded') {
                dispatch(
                    createNotification({
                        type: 'lightning',
                        data: 'Payment Recieved',
                        date: date,
                        time: time,
                        OperationId: operationId,
                    })
                );
                subscribeBalance(wallet, dispatch);
                const balance = await wallet.balance.getBalance();
                const externalAddress = localStorage.getItem('autoWithdrawalValue');
                const thresholdAmount = Number(localStorage.getItem(''));
                if (thresholdAmount && externalAddress && balance / 1000 > thresholdAmount) {
                    if (validate(externalAddress)) {
                        // transfer the increased funds to external address
                        await wallet.wallet.sendOnchain(balance - thresholdAmount, externalAddress);
                    }
                }
            } else if (typeof state === 'object' && 'canceled' in state) {
                dispatch(
                    createNotification({
                        type: 'lightning',
                        data: `Payment Canceled ${state.canceled.reason}`,
                        date: date,
                        time: time,
                        OperationId: operationId,
                    })
                );
            }
        },
        (error: string) => {
            logger.error('Error in subscription:', error);
            throw new Error('An error occured! Payment cancelled');
        }
    );
    return unsubscribe;
};
