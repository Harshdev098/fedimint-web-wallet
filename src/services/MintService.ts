import type { MintSpendNotesResponse, Wallet, NotesByDenomonationResponse } from "../hooks/wallet.type";
import logger from "../utils/logger";

export const SpendEcash=async(wallet:Wallet,amount:number) : Promise<MintSpendNotesResponse> =>{
    try{
        logger.log("the amount is",amount)
        const result = await wallet.mint.spendNotes(amount);
        logger.log("result in spend ecash is ",result)
        if (result) {
            return {notes:result.notes,operationId:result.operation_id};
        } else {
            throw new Error(`No value returned or invalid response`);
        }
    }catch(err){
        logger.log("An error occurred",err);
        throw new Error(`An error occured ${err}`)
    }
}

export const RedeemEcash=async(wallet:Wallet,notes:string) : Promise<string>=>{
    try{
        const result=await wallet?.mint.redeemEcash(notes)
        logger.log("result in redeem ecash ",result)
        if(result){
            return "Redeem Successfully";
        } else {
            throw new Error(`No value returned`);
        }
    }catch(err){
        throw new Error(`${err}`)
    }
}

export const ParseEcashNotes=async(wallet:Wallet,notes:string) : Promise<number>=>{
    try{
        const result=await wallet?.mint.parseNotes(notes)
        logger.log("result of parseNotes is ",result)
        if(result){
            return result;
        } else {
            throw new Error(`No value returned from parseNotes`);
        }
    }catch(err){
        throw new Error(`${err}`);
    }
}

export const NoteCountByDenomination=async(wallet:Wallet): Promise<NotesByDenomonationResponse>=>{
    try{
        const result=await wallet.mint.getNotesByDenomination()
        logger.log("notes are ",result)
        if (result === null) {
            throw new Error("No value returned from getNotesByDenomination");
        }
        return result as NotesByDenomonationResponse;
    }catch(err){
        throw new Error(`${err}`)
    }
}