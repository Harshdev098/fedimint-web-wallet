import type { Wallet, BalanceResponse } from "../hooks/wallet.type";


export const fetchBalance = async (wallet: Wallet): Promise<BalanceResponse> => {
    try {
        if (!(wallet?.isOpen())) {
            await wallet?.open()
        }
        const value = await wallet?.balance.getBalance();
        console.log("balance", value)
        return value;
    } catch (err) {
        console.log("Failed to fetch balance",err)
        throw new Error(`An error occured ${err}`)
    }
}