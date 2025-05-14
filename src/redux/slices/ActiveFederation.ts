import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { FederationID } from '../../hooks/Federation.type'

const initialState = {
    joining: false,
    joinResult: '',
    joinError: '',
    federationId: ''
}

// Todo: handling mulitple joins

export const ActiveFederationSlice = createSlice({
    name: 'ActiveFederation',
    initialState,
    reducers: {
        setJoining: (state, action: PayloadAction<boolean>) => {
            state.joining = action.payload
        },
        setJoinResult: (state, action: PayloadAction<string>) => {
            state.joinResult = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.joinError = action.payload
        },
        setFederationId:(state,action:PayloadAction<FederationID>)=>{
            state.federationId=action.payload
        }
    }
})

export const { setJoining, setJoinResult, setError,setFederationId } = ActiveFederationSlice.actions

export default ActiveFederationSlice.reducer;