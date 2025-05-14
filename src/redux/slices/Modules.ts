import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const initialState = {
    module: {},
    error: ''
}

export const ModuleSlice = createSlice({
    name: 'Module',
    initialState,
    reducers: {
        setModule: (state, action: PayloadAction<JSON>) => {
            state.module = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.module = action.payload
        }
    }
})

export const { setModule, setError } = ModuleSlice.actions;
export default ModuleSlice.reducer;