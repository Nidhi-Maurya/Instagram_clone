import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification:[], // [1,2,3]
        messageNotification:[],
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            if(!Array.isArray(state.likeNotification)) state.likeNotification = [];
            if(action.payload.type === 'like'){
                const exists = state.likeNotification.some((item)=> item.userId === action.payload.userId && item.postId === action.payload.postId);
                if(!exists) state.likeNotification.unshift(action.payload);
            }else if(action.payload.type === 'dislike'){
                state.likeNotification = state.likeNotification.filter((item)=> !(item.userId === action.payload.userId && item.postId === action.payload.postId));
            }
        },
        clearLikeNotifications:(state)=>{
            state.likeNotification = [];
        },
        setMessageNotification:(state,action)=>{
            if(!Array.isArray(state.messageNotification)) state.messageNotification = [];
            const exists = state.messageNotification.some((item)=> item.userId === action.payload.userId);
            if(!exists){
                state.messageNotification.unshift(action.payload);
            }else{
                state.messageNotification = [
                    action.payload,
                    ...state.messageNotification.filter((item)=> item.userId !== action.payload.userId),
                ];
            }
        },
        clearMessageNotifications:(state,action)=>{
            if(!Array.isArray(state.messageNotification)) state.messageNotification = [];
            if(action.payload?.userId){
                state.messageNotification = state.messageNotification.filter((item)=> item.userId !== action.payload.userId);
            }else{
                state.messageNotification = [];
            }
        }
    }
});
export const {
    setLikeNotification,
    clearLikeNotifications,
    setMessageNotification,
    clearMessageNotifications,
} = rtnSlice.actions;
export default rtnSlice.reducer;
