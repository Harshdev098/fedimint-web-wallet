import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { FederationID } from '../../hooks/Federation.type'

interface activeWallet {
    joining: boolean,
    federationId: string,
    walletId: string,
    newJoin: boolean
}
const initialState: activeWallet = {
    joining: false,
    federationId: '',
    walletId: '',
    newJoin: false
}


export const ActiveWalletSlice = createSlice({
    name: 'ActiveWallet',
    initialState,
    reducers: {
        setJoining: (state, action: PayloadAction<boolean>) => {
            state.joining = action.payload
        },
        setFederationId: (state, action: PayloadAction<FederationID>) => {
            state.federationId = action.payload
        },
        setNewJoin: (state, action: PayloadAction<boolean>) => {
            state.newJoin = action.payload
        },
        setWalletId: (state, action: PayloadAction<string>) => {
            state.walletId = action.payload
        }
    }
})

export const { setJoining, setFederationId, setNewJoin, setWalletId } = ActiveWalletSlice.actions

export default ActiveWalletSlice.reducer;