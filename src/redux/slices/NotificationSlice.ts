import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'

interface Notification {
    type: string;
    data: string;
    date: string;
    time: string;
    OperationId:string;
}

interface NotificationState{
    notifications:Notification[],
    count:number
}

const initialState:NotificationState={
    notifications:[],
    count:0
}

export const NotificationSlice=createSlice({
    name:'NotificationSlice',
    initialState:initialState,
    reducers:{
        createNotification:(state, action: PayloadAction<Notification>) => {
            state.notifications.push(action.payload);
            state.count+=1;
        },
        setCounts:(state,action:PayloadAction<number>)=>{
            state.count=action.payload
        }
    }
})

export const {createNotification,setCounts}=NotificationSlice.actions

export default NotificationSlice.reducer