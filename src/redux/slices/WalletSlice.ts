import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WalletSummary } from '../../hooks/wallet.type';

interface WalletState {
    UTXOSet: WalletSummary | null;
    walletStatus: 'closed' | 'opening' | 'open';
}

const initialState: WalletState = {
    UTXOSet: null,
    walletStatus: 'closed',
};

export const WalletSlice = createSlice({
    name: 'WalletSlice',
    initialState,
    reducers: {
        setUTXOSet: (state, action: PayloadAction<WalletSummary>) => {
            state.UTXOSet = action.payload;
        },
        setWalletStatus: (state, action: PayloadAction<'closed' | 'opening' | 'open'>) => {
            state.walletStatus = action.payload;
        },
    },
});

export const { setUTXOSet, setWalletStatus } = WalletSlice.actions;

export default WalletSlice.reducer;
