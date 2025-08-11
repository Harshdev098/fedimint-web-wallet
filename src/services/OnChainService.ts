import type { PeginResponse } from '../hooks/wallet.type';
import { Wallet, type WalletDepositState } from '@fedimint/core-web';
import logger from '../utils/Logger';
import type { AppDispatch } from '../redux/store';
import { createNotification } from '../redux/slices/NotificationSlice';

export const Deposit = async (wallet: Wallet): Promise<PeginResponse> => {
    try {
        const result = await wallet.wallet.generateAddress();
        logger.log('result from pegin is ', result);
        if (result) {
            return result;
        }
        throw new Error('No result returned from pegin');
    } catch (err) {
        throw new Error(`An error occured ${err}`);
    }
};

export const PegOut = async (wallet: Wallet, address: string, amount: number) => {
    try {
        const result = await wallet.wallet.sendOnchain(amount, address);
        logger.log('pegout result ', result);
        if (result) {
            return result;
        }
    } catch (err) {
        logger.log('An error occured ', err);
        throw new Error(`An error occured ${err}`);
    }
};

export const subscribeDeposit = (
    wallet: Wallet,
    operationId: string,
    dispatch: AppDispatch,
    setDepositState: React.Dispatch<string | null>
) => {
    const unsubscribe = wallet.wallet.subscribeDeposit(
        operationId,
        (state: WalletDepositState) => {
            const date = new Date().toDateString();
            const time = new Date().toTimeString();

            if (state === 'WaitingForTransaction') {
                setDepositState('waiting');
            } else if (typeof state === 'object' && 'WaitingForConfirmation' in state) {
                setDepositState('waiting for confirmation');
                dispatch(
                    createNotification({
                        type: 'onchain',
                        data: 'Waiting for confirmation',
                        date,
                        time,
                        OperationId: operationId,
                    })
                );
            } else if (typeof state === 'object' && 'Confirmed' in state) {
                setDepositState('confirmed');
                dispatch(
                    createNotification({
                        type: 'onchain',
                        data: 'Payment confirmed',
                        date,
                        time,
                        OperationId: operationId,
                    })
                );
            } else if (typeof state === 'object' && 'Claimed' in state) {
                setDepositState('claimed');
                dispatch(
                    createNotification({
                        type: 'onchain',
                        data: 'Payment claimed',
                        date,
                        time,
                        OperationId: operationId,
                    })
                );
            } else if (typeof state === 'object' && 'Failed' in state) {
                setDepositState('failed');
                dispatch(
                    createNotification({
                        type: 'onchain',
                        data: 'Payment Failed',
                        date,
                        time,
                        OperationId: operationId,
                    })
                );
            }
        },
        (error: string) => {
            throw new Error(`An error occured fetching state! ${error}`);
        }
    );
    return unsubscribe;
};

// eslint-disable-next-line
export const getTxidFromOutPoint = (outPoint: any): string => {
    if (typeof outPoint === 'string') {
        return outPoint.split(':')[0];
    }
    if (outPoint && typeof outPoint === 'object' && 'txid' in outPoint) {
        return outPoint.txid;
    }
    return '';
};
