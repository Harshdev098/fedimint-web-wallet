import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MintSpendNotesResponse, NotesByDenomonationResponse } from '../../hooks/wallet.type';

interface MintState {
    SpendEcashResult: MintSpendNotesResponse | null;
    ParseEcashResult: string | null;
    NotesByDenomonation: NotesByDenomonationResponse;
}
const initialState: MintState = {
    SpendEcashResult: null,
    ParseEcashResult: null,
    NotesByDenomonation: {},
};

const MintSlice = createSlice({
    name: 'Mint',
    initialState,
    reducers: {
        setSpendResult: (state, action: PayloadAction<MintSpendNotesResponse | null>) => {
            state.SpendEcashResult = action.payload;
        },
        setParseEcashResult: (state, action: PayloadAction<string | null>) => {
            state.ParseEcashResult = action.payload;
        },
        setNotesByDenomination: (state, action: PayloadAction<NotesByDenomonationResponse>) => {
            state.NotesByDenomonation = action.payload;
        },
    },
});

export const { setSpendResult, setParseEcashResult, setNotesByDenomination } = MintSlice.actions;

export default MintSlice.reducer;
