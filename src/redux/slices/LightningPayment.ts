import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CreateInvoiceResponse, InvoicePaymentResponse } from '../../hooks/wallet.type'


interface Invoice {
    Invoice: CreateInvoiceResponse["invoice"] | null,
    InvoiceOperationId: CreateInvoiceResponse['operationId'] | null
    InvoiceError: string,
    payInvoiceResult: InvoicePaymentResponse | null,
    payInvoiceError: string
    payStatus: string
}
const initialState: Invoice = {
    Invoice: null,
    InvoiceOperationId: null,
    InvoiceError: '',
    payInvoiceResult: null,
    payInvoiceError: '',
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
        setInvoiceError: (state, action: PayloadAction<string>) => {
            state.InvoiceError = action.payload
        },
        setPayInvoiceResult: (state, action: PayloadAction<InvoicePaymentResponse | null>) => {
            state.payInvoiceResult = action.payload
        },
        setPayInvoiceError: (state, action: PayloadAction<string>) => {
            state.payInvoiceError = action.payload
        },
        setPayStatus: (state, action: PayloadAction<string>) => {
            state.payStatus = action.payload
        }
    }
})

export const { setInvoice, setInvoiceOperationId, setInvoiceError, setPayInvoiceResult, setPayInvoiceError, setPayStatus } = LightningSlice.actions;

export default LightningSlice.reducer;