import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Mode {
    mode: boolean; //false- light, true- dark
}

const savedMode = localStorage.getItem('appMode');
const initialState: Mode = {
    mode: savedMode !== null ? savedMode === 'true' : false,
};

export const Mode = createSlice({
    name: 'Mode',
    initialState,
    reducers: {
        setMode: (state, action: PayloadAction<boolean>) => {
            state.mode = action.payload;
        },
    },
});

export const { setMode } = Mode.actions;
export default Mode.reducer;
