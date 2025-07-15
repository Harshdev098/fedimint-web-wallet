import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Alert {
    error:{type: string, message:string} | null,
    warn:{type: string, message:string} | null,
    result:string | null
}

const initialState:Alert = {
    error:null,
    warn:null,
    result:null
}

export const AlertSlice = createSlice({
    name: 'Alert',
    initialState,
    reducers: {
        setError: (state, action: PayloadAction<{type: string, message:string} | null>) => {
            state.error = action.payload
        },
        setWarn: (state, action: PayloadAction<{type: string, message:string} | null>) => {
            state.warn = action.payload
        },
        setResult:(state,action:PayloadAction<string | null>)=>{
            state.result=action.payload
        }
    }
})

export const { setError,setResult,setWarn } = AlertSlice.actions
export default AlertSlice.reducer;