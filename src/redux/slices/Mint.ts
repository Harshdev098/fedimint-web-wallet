import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { MintSpendNotesResponse,NotesByDenomonationResponse } from '../../hooks/wallet.type'

interface MintState {
    SpendEcashResult: MintSpendNotesResponse | null,
    SpendEcashError: string,
    RedeemEcashResult: string | null,
    RedeemEcashError: string,
    ParseEcashResult:number | null,
    ParseEcashError:string,
    NotesByDenomonation:NotesByDenomonationResponse
}
const initialState: MintState = {
    SpendEcashResult: null,
    SpendEcashError: '',
    RedeemEcashResult: null,
    RedeemEcashError: '',
    ParseEcashResult:null,
    ParseEcashError:'',
    NotesByDenomonation: {}
}

const MintSlice = createSlice({
    name: 'Mint',
    initialState,
    reducers: {
        setSpendResult: (state, action: PayloadAction<MintSpendNotesResponse>) => {
            state.SpendEcashResult = action.payload;
        },
        setSpendError: (state, action: PayloadAction<string>) => {
            state.SpendEcashError = action.payload;
        },
        setRedeemResult: (state, action: PayloadAction<string>) => {
            state.RedeemEcashResult = action.payload
        },
        setRedeemError: (state, action: PayloadAction<string>) => {
            state.RedeemEcashError = action.payload
        },
        setParseEcashResult:(state,action:PayloadAction<number | null>)=>{
            state.ParseEcashResult=action.payload
        },
        setParseEcashError:(state,action:PayloadAction<string>)=>{
            state.ParseEcashError = action.payload
        },
        setNotesByDenomination:(state,action:PayloadAction<NotesByDenomonationResponse>)=>{
            state.NotesByDenomonation=action.payload
        }
    }
})

export const { setSpendResult, setSpendError, setRedeemResult, setRedeemError,setParseEcashResult,setParseEcashError,setNotesByDenomination } = MintSlice.actions

export default MintSlice.reducer;