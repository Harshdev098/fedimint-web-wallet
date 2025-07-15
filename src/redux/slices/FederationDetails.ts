import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { FederationConfig, FederationMetaData, GuardianStatus } from '../../hooks/Federation.type'

interface FederationDetailsState {
    Details: FederationConfig | null;
    metaData: FederationMetaData | null;
    GuardianStatus:GuardianStatus;
}
const initialState: FederationDetailsState={
    Details:null,
    metaData: null,
    GuardianStatus:{ status: {} }
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
        setGuardianStatus:(state,action:PayloadAction<GuardianStatus>)=>{
            state.GuardianStatus=action.payload
        }
    }
})

export const { setFederationDetails, setFederationMetaData, setGuardianStatus } = FederationDetailsSlice.actions;
export default FederationDetailsSlice.reducer;