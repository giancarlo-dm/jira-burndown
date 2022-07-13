import { FC, useState } from "react";
import { IHttpRequest } from "../../hooks/IHttpRequest";
import { useHttp } from "../../hooks/useHttp";
import { authActions, useAppDispatcher } from "../../store";

import { BasicValidators, Form, IControl, IControlGroup, InputText, useControl, useControlGroup } from "../../Ui/Forms";
import { Button } from "../../Ui/Layout";
import { If } from "../../Ui/Structural";
import classes from "./LoginView.module.scss";

const LoginView: FC = () => {

    //#region Initialization
    const appDispatch = useAppDispatcher();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoginFailed, setIsLoginFailed] = useState(false);
    const loginControlGroup: IControlGroup = useControlGroup({
        username: useControl<string>(
            "",
            [BasicValidators.required()]
        ),
        password: useControl(
            "",
            [BasicValidators.required()]
        )
    });
    //#endregion

    //#region Event Handlers
    const submitHandler = async () => {

        if (!loginControlGroup.isValid) {
            return;
        }

        setIsLoading(true);
        setIsLoginFailed(false);

        const username = (loginControlGroup.controls.username as IControl<string>).value;
        const password = (loginControlGroup.controls.password as IControl<string>).value;

        try {
            await appDispatch(authActions.login({ username, password })).unwrap();
        }
        catch (e: any) {
            setIsLoginFailed(true);
        }
        finally {
            setIsLoading(false);
        }
    };
    //#endregion

    //#region Render
    const errorMessageTitle: JSX.Element = (
        <h5 className="large text-align-center text-color-danger">Invalid e-mail or password</h5>
    );

    return (
        <section className={classes.loginView}>
            <Form
                controlGroup={loginControlGroup}
                onSubmit={submitHandler}>

                <If expression={!isLoginFailed} else={errorMessageTitle}>
                    <h5 className="large text-align-center">Login</h5>
                </If>

                <InputText
                    label="Username" type="text" name="username" size="large"
                    required
                    control={loginControlGroup.controls.username as IControl<string>}
                    errorMessages={{
                        "required": "Username is required"
                    }} />
                <InputText
                    label="Password" type="password" name="password" size="large"
                    required
                    control={loginControlGroup.controls.password as IControl<string>}
                    errorMessages={{
                        "required": "Password is required"
                    }} />

                <Button
                    size="large" className="mgt3" type="submit"
                    block
                    loading={isLoading}>
                    Login
                </Button>
            </Form>
        </section>
    )
    //#endregion
}

export default LoginView;