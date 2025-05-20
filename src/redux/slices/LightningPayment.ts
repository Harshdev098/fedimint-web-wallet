import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CreateInvoiceResponse,InvoicePaymentResponse } from '../../hooks/wallet.type'


interface Invoice {
    Invoice: CreateInvoiceResponse | null,
    InvoiceError: string,
    payInvoiceResult: InvoicePaymentResponse | null,
    payInvoiceError:string
}
const initialState: Invoice = {
    Invoice: null,
    InvoiceError: '',
    payInvoiceResult:null,
    payInvoiceError:''
}

export const LightningSlice=createSlice({
    name:'Mint',
    initialState,
    reducers:{
        setInvoice:(state,action:PayloadAction<CreateInvoiceResponse | null>)=>{
            state.Invoice=action.payload
        },
        setInvoiceError:(state,action:PayloadAction<string>)=>{
            state.InvoiceError=action.payload
        },
        setPayInvoiceResult:(state,action:PayloadAction<InvoicePaymentResponse>)=>{
            state.payInvoiceResult=action.payload
        },
        setPayInvoiceError:(state,action:PayloadAction<string>)=>{
            state.payInvoiceError=action.payload
        }
    }
})

export const {setInvoice,setInvoiceError,setPayInvoiceResult,setPayInvoiceError}=LightningSlice.actions;

export default LightningSlice.reducer;