import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { WalletSummary } from '../../hooks/wallet.type'

interface WalletState{
    UTXOSet:WalletSummary | null,
}
const initialState:WalletState={
    UTXOSet:null,
}

export const WalletSlice=createSlice({
    name:'WalletSlice',
    initialState,
    reducers:{
        setUTXOSet:(state,action:PayloadAction<WalletSummary>)=>{
            state.UTXOSet=action.payload
        }
    }
})

export const {setUTXOSet}=WalletSlice.actions

export default WalletSlice.reducer;