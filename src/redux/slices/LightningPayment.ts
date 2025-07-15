import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CreateInvoiceResponse, InvoicePaymentResponse } from '../../hooks/wallet.type'


interface Invoice {
    Invoice: CreateInvoiceResponse["invoice"] | null,
    InvoiceOperationId: CreateInvoiceResponse['operationId'] | null
    payInvoiceResult: InvoicePaymentResponse | null,
    payStatus: string
}
const initialState: Invoice = {
    Invoice: null,
    InvoiceOperationId: null,
    payInvoiceResult: null,
    payStatus: ''
}

export const LightningSlice = createSlice({
    name: 'Mint',
    initialState,
    reducers: {
        setInvoice: (state, action: PayloadAction<string | null>) => {
            state.Invoice = action.payload;
        },
        setInvoiceOperationId: (state, action: PayloadAction<string | null>) => {
            state.InvoiceOperationId = action.payload;
        },
        setPayInvoiceResult: (state, action: PayloadAction<InvoicePaymentResponse | null>) => {
            state.payInvoiceResult = action.payload
        },
        setPayStatus: (state, action: PayloadAction<string>) => {
            state.payStatus = action.payload
        }
    }
})

export const { setInvoice, setInvoiceOperationId, setPayInvoiceResult, setPayStatus } = LightningSlice.actions;

export default LightningSlice.reducer;