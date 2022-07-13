import { FC } from "react";
import { Navigate } from "react-router-dom";

import { useAuthSlice } from "../store";

export const AlreadyLoggedInGuard: FC<Props> = (props) => {

    //#region Initialization
    const authState = useAuthSlice();
    //#endregion

    //#region Render
    if (authState.isLoggedIn) {
        return <Navigate to="/" replace />;
    }
    else {
        return props.children;
    }
    //#endregion
};

type Props = {
    children: JSX.Element
}