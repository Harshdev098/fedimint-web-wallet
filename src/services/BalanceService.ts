import type { Wallet, BalanceResponse } from "../hooks/wallet.type";
const SATS_PER_BTC = 100_000_000;

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

export const fetchExchangeRates = async () => {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur');
    const data = await res.json();
    return {
        usd: data.bitcoin.usd,
        eur: data.bitcoin.eur
    };
};

export const convertToSats = async (amount: number, currency: string): Promise<number> => {
    if (currency === 'sat') return amount;
    if (currency === 'msat') return amount / 1000;

    const rates = await fetchExchangeRates();

    switch (currency.toLowerCase()) {
        case 'usd':
            return (amount / rates.usd * SATS_PER_BTC);
        case 'euro':
            return (amount / rates.eur * SATS_PER_BTC);
        default:
            return amount;
    }
};

export const convertFromMsat = async (msat: number, currency: string): Promise<number> => {
    const sats = msat / 1000;
    const btcValue = sats / SATS_PER_BTC;

    if (currency === 'msat') return msat;
    if (currency === 'sat') return sats;

    const rates = await fetchExchangeRates();

    switch (currency.toLowerCase()) {
        case 'usd':
            return btcValue * rates.usd;
        case 'euro':
            return btcValue * rates.eur;
        default:
            return sats;
    }
};