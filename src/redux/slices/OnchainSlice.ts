import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PeginResponse } from "../../hooks/wallet.type";

interface Onchain{
    pegin:PeginResponse | null
    peginError:string
    pegout:{ operation_id: string; } | null,
    pegoutError:string
}

const initialState:Onchain={
    pegin:null,
    peginError:'',
    pegout:null,
    pegoutError:''
}

export const OnchainSlice=createSlice({
    name:'OnchainSlice',
    initialState,
    reducers:{
        setPegin:(state,action:PayloadAction<PeginResponse>)=>{
            state.pegin=action.payload
        },
        setPeginError:(state,action:PayloadAction<string>)=>{
            state.peginError=action.payload
        },
        setPegout:(state,action:PayloadAction<{ operation_id: string; } | null>)=>{
            state.pegout=action.payload
        },
        setPegoutError:(state,action:PayloadAction<string>)=>{
            state.pegoutError=action.payload
        }
    }
})

export const {setPegin,setPeginError,setPegout,setPegoutError}=OnchainSlice.actions

export default OnchainSlice.reducer