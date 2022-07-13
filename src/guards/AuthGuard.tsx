import { FC } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSlice } from "../store";

export const AuthGuard: FC<Props> = (props) => {
    
    //#region Initialization
    const authState = useAuthSlice();
    const location = useLocation();

    //#endregion

    //#region Render
    if (!authState.isLoggedIn) {
        return (
            <Navigate to="/login" state={{from: location}} />
        );
    }
    else {
        return props.children;
    }
    //#enderegion
}

type Props = {
    children: JSX.Element;
}