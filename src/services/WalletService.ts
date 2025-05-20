import type { Wallet,WalletSummary } from "../hooks/wallet.type";

export const getUTXOSet = async (wallet: Wallet) : Promise<WalletSummary> => {
    try {
        const result = await wallet.wallet.getWalletSummary()
        console.log('result from wallet UTXO set is ', result)
        if(result){
            return result;
        } else {
            throw new Error("No wallet summary returned");
        }
    }catch(err){
        console.log("An error occured",err)
        throw new Error(`${err}`)
    }
}