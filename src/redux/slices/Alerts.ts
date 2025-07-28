import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from '../store';

interface Alert {
    error: { type: string; message: string } | null;
    warn: { type: string; message: string } | null;
    result: string | null;
}

const initialState: Alert = {
    error: null,
    warn: null,
    result: null,
};

export const AlertSlice = createSlice({
    name: 'Alert',
    initialState,
    reducers: {
        setErrorWithTimeout: (state, action: PayloadAction<{ type: string; message: string } | null>) => {
            state.error = action.payload;
        },
        setWarn: (state, action: PayloadAction<{ type: string; message: string } | null>) => {
            state.warn = action.payload;
        },
        setResult: (state, action: PayloadAction<string | null>) => {
            state.result = action.payload;
        },
    },
});

// to auto clear the errors from UI
export const setErrorWithTimeoutWithTimeout =
    (payload: { type: string; message: string }) =>
        (dispatch: AppDispatch) => {
            dispatch(setErrorWithTimeout(payload));
            setTimeout(() => {
                dispatch(setErrorWithTimeout(null));
            }, 3000);
        };

export const setWarnWithTimeout =
    (payload: { type: string; message: string }) =>
        (dispatch: AppDispatch) => {
            dispatch(setWarn(payload));
            setTimeout(() => {
                dispatch(setWarn(null));
            }, 3000);
        };

export const setResultWithTimeout =
    (payload: string) =>
        (dispatch: AppDispatch) => {
            dispatch(setResult(payload));
            setTimeout(() => {
                dispatch(setResult(null));
            }, 3000);
        };

export const { setErrorWithTimeout, setResult, setWarn } = AlertSlice.actions;

export default AlertSlice.reducer;
