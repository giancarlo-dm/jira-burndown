import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import { authSlice } from "./auth.slice";

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer
    }
})

export const useAppDispatcher = () => useDispatch<AppDispatch>();

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;