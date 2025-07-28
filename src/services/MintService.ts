import type { SpendNotesState } from "@fedimint/core-web";
import type { MintSpendNotesResponse, NotesByDenomonationResponse } from "../hooks/wallet.type";
import { Wallet } from "@fedimint/core-web";
import type { AppDispatch } from "../redux/store";
import logger from "../utils/logger";
import { createNotification } from '../redux/slices/NotificationSlice'
import { setErrorWithTimeout } from "../redux/slices/Alerts";

export const SpendEcash = async (wallet: Wallet, amount: number): Promise<MintSpendNotesResponse> => {
    try {
        logger.log("the amount is", amount)
        const result = await wallet.mint.spendNotes(amount);
        logger.log("result in spend ecash is ", result)
        if (result) {
            return { notes: result.notes, operationId: result.operation_id };
        } else {
            throw new Error(`No value returned or invalid response`);
        }
    } catch (err) {
        logger.log("An error occurred", err);
        throw new Error(`An error occured ${err}`)
    }
}

export const RedeemEcash = async (wallet: Wallet, notes: string): Promise<string> => {
    try {
        const result = await wallet.mint.redeemEcash(notes)
        logger.log("result in redeem ecash ", result)
        if (result) {
            return "Redeem Successfully";
        } else {
            throw new Error(`No value returned`);
        }
    } catch (err) {
        throw new Error(`${err}`)
    }
}

export const ParseEcashNotes = async (wallet: Wallet, notes: string): Promise<number> => {
    try {
        const result = await wallet.mint.parseNotes(notes)
        logger.log("result of parseNotes is ", result)
        if (result) {
            return result;
        } else {
            throw new Error(`No value returned from parseNotes`);
        }
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export const NoteCountByDenomination = async (wallet: Wallet): Promise<NotesByDenomonationResponse> => {
    try {
        const result = await wallet.mint.getNotesByDenomination()
        logger.log("notes are ", result)
        if (result === null) {
            throw new Error("No value returned from getNotesByDenomination");
        }
        return result as NotesByDenomonationResponse;
    } catch (err) {
        throw new Error(`${err}`)
    }
}

export const subscribeSpend = (wallet:Wallet,operationId:string,dispatch:AppDispatch) => {
    const unsubscribe = wallet.mint.subscribeSpendNotes(
        operationId,
        (state: SpendNotesState) => {
            logger.log("state is ", state)
            const date = (new Date()).toDateString()
            const time = (new Date()).toTimeString()
            if (state === 'UserCanceledProcessing') {
                dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes Cancelled processing', date: date, time: time, OperationId: operationId }))
            } else if (state === 'UserCanceledSuccess') {
                dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes Cancelled success', date: date, time: time, OperationId: operationId }))
            } else if (state === 'UserCanceledFailure') {
                dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes Cancelled failed', date: date, time: time, OperationId: operationId }))
            } else if (state === 'Success') {
                dispatch(createNotification({ type: 'Ecash', data: 'Ecash Notes success', date: date, time: time, OperationId: operationId }))
            }
        },
        (error) => {
            logger.error("Spend notes subscription error:", error);
            dispatch(setErrorWithTimeout({ type: 'Subscription Error: ', message: error }))
        }
    );
    return unsubscribe;
}