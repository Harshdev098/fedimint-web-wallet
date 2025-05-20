import { configureStore } from "@reduxjs/toolkit";
import ActiveFederationSlice from "./slices/ActiveFederation";
import BalanceSlice from "./slices/Balance";
import FederationDetailsSlice from "./slices/FederationDetails";
import MintSlice from "./slices/Mint";
import LightningSlice from "./slices/LightningPayment";
import WalletSlice from "./slices/WalletSlice";


export const store=configureStore({
    reducer:{
        activeFederation: ActiveFederationSlice,
        balance: BalanceSlice,
        federationdetails: FederationDetailsSlice,
        mint: MintSlice,
        Lightning:LightningSlice,
        wallet:WalletSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch