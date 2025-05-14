import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { FederationConfig, FederationMetaData } from '../../hooks/Federation.type'

interface FederationDetailsState {
    Details: FederationConfig | null;
    metaData: FederationMetaData | null;
    error: string;
}
const initialState: FederationDetailsState={
    Details:null,
    metaData: null,
    error:''
}

export const FederationDetailsSlice=createSlice({
    name:'FederationDetails',
    initialState,
    reducers:{
        setFederationDetails:(state,action:PayloadAction<FederationConfig>)=>{
            state.Details=action.payload
        },
        setFederationMetaData:(state,action:PayloadAction<FederationMetaData>)=>{
            state.metaData=action.payload
        },
        setError:(state,action:PayloadAction<string>)=>{
            state.error=action.payload
        }
    }
})

export const { setError, setFederationDetails, setFederationMetaData } = FederationDetailsSlice.actions;
export default FederationDetailsSlice.reducer;