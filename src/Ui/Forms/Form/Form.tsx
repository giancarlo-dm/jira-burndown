import { FC, FormEvent, PropsWithChildren } from "react";
import { classList } from "../../Helpers";
import { IControlGroup } from "../IControlGroup";

/**
 * Represents a form. Needs to be attached to a {@link ControlGroup}. Provides functionality like
 * setting the <code>submitted</code> flag on its controls when form is submitted, which allows for
 * immediately showing the validation messages. As convenience, it calls
 * <code>preventDefault()</code> on submit and will set a "submitted" class on the "form" tag.
 *
 * @since 0.1.0
 */
export const Form: FC<PropsWithChildren<Props>> = (props) => {

    //#region Initialization
    /**
     * Makes all props as required since we have defaults. Used for TypeScript type check.
     */
    const requiredProps: Required<PropsWithChildren<Props>> = props as any;
    //#endregion

    //#region Event Handlers
    const submitHandler = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        requiredProps.controlGroup.markSubmitted();
        requiredProps.onSubmit();
    };
    //#endregion

    //#region Render
    return (
        <form className={classList({
                submitted: requiredProps.controlGroup.isSubmitted
            },
            requiredProps.className)}
              noValidate autoComplete={props.autoComplete}
              onSubmit={submitHandler}>
            {requiredProps.children}
        </form>
    );
    //#endregion
};

Form.defaultProps = {
    className: undefined,
    autoComplete: "on",
    onSubmit: () => void 0
};

type Props = {
    /**
     * The Control Group to be used with this Form.
     */
    controlGroup: IControlGroup;
    /**
     * Custom class names to be set on the form tags.
     */
    className?: string;
    /**
     * Flag to allow showing browser auto complete popup.
     * @default "on"
     */
    autoComplete?: string;
    /**
     * Event handler to invoke when submitting.
     */
    onSubmit?(): void|Promise<void>;
}
