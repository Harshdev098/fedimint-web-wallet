import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PeginResponse } from "../../hooks/wallet.type";

interface Onchain{
    pegin:PeginResponse | null
    pegout:{ operation_id: string; } | null,
}

const initialState:Onchain={
    pegin:null,
    pegout:null,
}

export const OnchainSlice=createSlice({
    name:'OnchainSlice',
    initialState,
    reducers:{
        setPegin:(state,action:PayloadAction<PeginResponse>)=>{
            state.pegin=action.payload
        },
        setPegout:(state,action:PayloadAction<{ operation_id: string; } | null>)=>{
            state.pegout=action.payload
        }
    }
})

export const {setPegin,setPegout}=OnchainSlice.actions

export default OnchainSlice.reducer