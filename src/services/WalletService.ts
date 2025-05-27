import type { Wallet,WalletSummary } from "../hooks/wallet.type";

export const getUTXOSet = async (wallet: Wallet) : Promise<WalletSummary> => {
    try {
        const result = await wallet.wallet.getWalletSummary()
        console.log('result from wallet UTXO set is ', result)
        if(result){
            return {
                spendable_utxos: result.spendable_utxos ?? [],
                unsigned_peg_out_txos: result.unsigned_peg_out_txos ?? [],
                unsigned_change_utxos: result.unsigned_change_utxos ?? [],
                unconfirmed_peg_out_utxos: result.unconfirmed_peg_out_txos ?? [],
                unconfirmed_change_utxos: result.unconfirmed_change_utxos ?? [],
            };
        } else {
            throw new Error("No wallet summary returned");
        }
    }catch(err){
        console.log("An error occured",err)
        throw new Error(`${err}`)
    }
}