import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const initialState = {
    module: {},
}

export const ModuleSlice = createSlice({
    name: 'Module',
    initialState,
    reducers: {
        setModule: (state, action: PayloadAction<JSON>) => {
            state.module = action.payload
        }
    }
})

export const { setModule } = ModuleSlice.actions;
export default ModuleSlice.reducer;