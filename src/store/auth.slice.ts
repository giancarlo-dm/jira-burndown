import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { RootState } from ".";
import { AuthAsyncThunks } from "./AuthAsyncThunks";
import { AuthState, AuthStateFactory } from "./AuthState.type";

const defaultState: AuthState = AuthStateFactory.create(
    false,
    null
)

export const authSlice = createSlice({
    name: "auth",
    initialState: defaultState,
    reducers: {

    },
    extraReducers: builder => {
        // Login
        builder.addCase(AuthAsyncThunks.login.fulfilled, (state, {payload}) => {
            state.isLoggedIn = payload.isLoggedIn;
            state.user = payload.user;

            localStorage.setItem("user", JSON.stringify(payload.user));
        });
        builder.addCase(AuthAsyncThunks.login.rejected, (state, {payload}) => {
            state.isLoggedIn = false;
            state.user = null;
        });
    }
});

export const authActions = {
    ...authSlice.actions,
    login: AuthAsyncThunks.login
};

export const useAuthSlice = () => useSelector<RootState, AuthState>(state => state.auth);