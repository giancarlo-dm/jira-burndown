import { User } from "../models";

export type AuthState = {
    isLoggedIn: boolean;
    user: null|User;
}

export class AuthStateFactory {

    static create(isLoggedIn: boolean, user: null|User): AuthState {
        return {
            isLoggedIn: isLoggedIn,
            user: user
        };
    }
}