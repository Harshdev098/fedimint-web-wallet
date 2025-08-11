import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CreateInvoiceResponse, InvoicePaymentResponse } from '../../hooks/wallet.type';

function getInitialInvoiceExpiry(): number {
    const expiry = Number(localStorage.getItem('InvoiceExpiryTime'));
    if (isNaN(expiry) || expiry <= 0) return 5;
    return expiry;
}

interface Invoice {
    Invoice: CreateInvoiceResponse['invoice'] | null;
    InvoiceOperationId: CreateInvoiceResponse['operationId'] | null;
    payInvoiceResult: InvoicePaymentResponse | null;
    payStatus: string;
    invoiceExpiry: number; // in min
}
const initialState: Invoice = {
    Invoice: null,
    InvoiceOperationId: null,
    payInvoiceResult: null,
    payStatus: '',
    invoiceExpiry: getInitialInvoiceExpiry(),
};

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
            state.payInvoiceResult = action.payload;
        },
        setPayStatus: (state, action: PayloadAction<string>) => {
            state.payStatus = action.payload;
        },
        setInvoiceExpiry: (state, action: PayloadAction<number>) => {
            state.invoiceExpiry = action.payload;
        },
    },
});

export const {
    setInvoice,
    setInvoiceOperationId,
    setPayInvoiceResult,
    setPayStatus,
    setInvoiceExpiry,
} = LightningSlice.actions;

export default LightningSlice.reducer;
