import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FederationID } from '../../hooks/Federation.type';

interface activeWallet {
    joining: boolean;
    federationId: string;
    walletId: string;
    newJoin: boolean;
    recoveryState: {
        status: boolean;
        progress?: { complete: number; total?: number };
        moduleId: number;
    };
}
const initialState: activeWallet = {
    joining: false,
    federationId: '',
    walletId: '',
    newJoin: false,
    recoveryState: { status: false, progress: { complete: 0, total: 0 }, moduleId: 0 },
};

export const ActiveWalletSlice = createSlice({
    name: 'ActiveWallet',
    initialState,
    reducers: {
        setJoining: (state, action: PayloadAction<boolean>) => {
            state.joining = action.payload;
        },
        setFederationId: (state, action: PayloadAction<FederationID>) => {
            state.federationId = action.payload;
        },
        setNewJoin: (state, action: PayloadAction<boolean>) => {
            state.newJoin = action.payload;
        },
        setWalletId: (state, action: PayloadAction<string>) => {
            state.walletId = action.payload;
        },
        setRecoverySate: (
            state,
            action: PayloadAction<{
                status: boolean;
                progress?: { complete: number; total: number };
                moduleId?: number;
            }>
        ) => {
            state.recoveryState = {
                status: action.payload.status,
                progress: action.payload.progress,
                moduleId: action.payload.moduleId !== undefined ? action.payload.moduleId : 0,
            };
        },
    },
});

export const { setJoining, setFederationId, setNewJoin, setWalletId, setRecoverySate } =
    ActiveWalletSlice.actions;

export default ActiveWalletSlice.reducer;
