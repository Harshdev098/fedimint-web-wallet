import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { convertFromMsat } from '../../services/BalanceService'

export const updateBalanceFromMsat = createAsyncThunk(
  'balance/updateBalanceFromMsat',
  async (mSats: number, { getState }) => {
    const state = getState() as any
    const currency = state.balance.currency
    return await convertFromMsat(mSats, currency)
  }
)

const initialState = {
  balance: 0,
  currency: localStorage.getItem('walletCurrency') || 'sat'
}

const BalanceSlice = createSlice({
  name: 'Balance',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateBalanceFromMsat.fulfilled, (state, action) => {
      state.balance = action.payload
    })
  }
})

export const { setCurrency } = BalanceSlice.actions
export default BalanceSlice.reducer
