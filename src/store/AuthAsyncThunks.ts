import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserFactory } from "../models";
import { AuthState, AuthStateFactory } from "./AuthState.type";

export class AuthAsyncThunks {

    /**
     * @throws {message: string} ("aborted_http_request") if request is aborted
     * @throws {message: string} ("<status>_<statusText>") if request failed
     * @throws {message: string} ("json_parse_error") if JSON parsing failed
     */
    static login = createAsyncThunk<AuthState, { username: string, password: string, abortController?: AbortController }>(
        "auth/login",
        async ({ username, password, abortController }, thunkApi) => {

            let response: Response;
            try {
                response = await fetch(
                    `https://jiraproducao.totvs.com.br/rest/auth/1/session`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Basic ${btoa(`${username}:${password}`)}`
                        },
                        signal: abortController?.signal
                    }
                )
            }
            catch (e) {
                if ((e as DOMException).name !== "AbortError") {
                    console.error(e);
                    return thunkApi.rejectWithValue({message: (e as Error).message});
                }
                else {
                    return thunkApi.rejectWithValue({message: "aborted_http_request"});
                }
            }

            if (!response.ok) {
                return thunkApi.rejectWithValue({message: `${response.status}_${response.statusText}`});
            }

            let json: JiraGetSession;
            try {
                json = await response.json();
            }
            catch {
                return thunkApi.rejectWithValue({message: "json_parse_error"});
            }

            return AuthStateFactory.create(
                true,
                // TODO find a way to make electrons browser store the returned cookie so we can
                // omit password in the store
                UserFactory.create(username, password)
            );
        }
    );
}

type JiraGetSession = {
    /**
     * Uri to self
     */
    self: string,
    name: string,
    loginInfo: {
        failedLoginCount: number,
        loginCount: number,
        /**
         * Timestamp to last failed login attempt.
         */
        lastFailedLoginTime: string,
        /**
         * Timestamp to last previous succesfull login.
         */
        previousLoginTime: string
    }
} 