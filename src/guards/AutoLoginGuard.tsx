import { FC, useEffect, useState } from "react";
import { User } from "../models";

import { LazyLoadingFallback } from "../components";
import { authActions, useAppDispatcher, useAuthSlice } from "../store";

export const AutoLoginGuard: FC<Props> = (props) => {

    //#region Initialization
    const authState = useAuthSlice();
    const appDispatch = useAppDispatcher();
    const [isTryingAutoLogin, setIsTryingAutoLogin] = useState(true);
    //#endregion

    //#Region Effects
    useEffect(
        () => {
            if (authState.isLoggedIn) {
                setIsTryingAutoLogin(false);
                return;
            }

            const userJson: null|string = localStorage.getItem("user");
            if (userJson == null) {
                setIsTryingAutoLogin(false);
                return;
            }

            const user: User = JSON.parse(userJson);
            appDispatch(authActions.login({username: user.username, password: user.password})).unwrap()
                .catch(() => void 0)
                .finally(() => {
                    setIsTryingAutoLogin(false);
                });
        },
        []
    )
    //#endregion

    //#region Render
    if (isTryingAutoLogin) {
        return (
            <LazyLoadingFallback />
        );
    }
    else {
        return props.children;
    }
    //#endregion
}

type Props = {
    children: JSX.Element;
}