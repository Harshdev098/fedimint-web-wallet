import { configureStore } from "@reduxjs/toolkit";
import ActiveFederationSlice from "./slices/ActiveFederation";
import BalanceSlice from "./slices/Balance";
import { FederationDetailsSlice } from "./slices/FederationDetails";

export const store=configureStore({
    reducer:{
        activeFederation: ActiveFederationSlice,
        balance: BalanceSlice,
        federationdetails: FederationDetailsSlice.reducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch