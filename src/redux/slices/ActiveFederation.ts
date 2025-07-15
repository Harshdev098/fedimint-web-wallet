import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { FederationID } from '../../hooks/Federation.type'

const initialState = {
    joining: false,
    federationId: '',
    newJoin:false
}

// Todo: handling mulitple joins

export const ActiveFederationSlice = createSlice({
    name: 'ActiveFederation',
    initialState,
    reducers: {
        setJoining: (state, action: PayloadAction<boolean>) => {
            state.joining = action.payload
        },
        setFederationId:(state,action:PayloadAction<FederationID>)=>{
            state.federationId=action.payload
        },
        setNewJoin:(state,action:PayloadAction<boolean>)=>{
            state.newJoin=action.payload
        }
    }
})

export const { setJoining, setFederationId,setNewJoin } = ActiveFederationSlice.actions

export default ActiveFederationSlice.reducer;