import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const initialState = {
    balance: 0,
    error: ''
}

export const BalanceSlice = createSlice({
    name: 'Balance',
    initialState,
    reducers: {
        setBalance: (state, action: PayloadAction<number>) => {
            state.balance = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
        }
    }
})
export const { setBalance, setError } = BalanceSlice.actions
export default BalanceSlice.reducer;