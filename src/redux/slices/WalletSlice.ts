import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { WalletSummary } from '../../hooks/wallet.type'

interface WalletState{
    UTXOSet:WalletSummary | null,
    error:string
}
const initialState:WalletState={
    UTXOSet:null,
    error:''
}

export const WalletSlice=createSlice({
    name:'WalletSlice',
    initialState,
    reducers:{
        setUTXOSet:(state,action:PayloadAction<WalletSummary>)=>{
            state.UTXOSet=action.payload
        },
        setError:(state,action:PayloadAction<string>)=>{
            state.error=action.payload
        }
    }
})

export const {setUTXOSet,setError}=WalletSlice.actions

export default WalletSlice.reducer;