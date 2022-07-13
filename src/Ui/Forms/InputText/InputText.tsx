import React, { ChangeEvent, FC } from "react";

import { classList } from "../../Helpers";
import { If } from "../../Structural";
import { ControlElementBaseProps } from "../ControlElementBaseProps.type";
import { IControl } from "../IControl";
import { Messages } from "../Messages/Messages";
import { ValidationMessages } from "../ValidationMessages.type";
import { ValidatorFn } from "../ValidatorFn.type";

/**
 * InputText control. Allows the user to input text data with validation.
 *
 * @since 0.1.0
 */
export const InputText: FC<Props> = (props) => {

    //#region Event Handlers
    const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
        props.control.change(event.target.value);
    };

    const blurHandler = (): void => {
        props.control.blur();
    };
    //#endregion

    //#region Render
    // TODO perhaps extract div container and label container to a higher order
    // component
    return (
        <div className={classList("control", {
            invalid: !props.control.isValid && (props.control.isTouched || props.control.isSubmitted),
            large: props.size === "large",
            small: props.size === "small"
        })}>
            <label htmlFor={props.name}
                   className={classList({
                       required: props.required ?? false
                   })}>
                {props.label}
            </label>
            <input id={props.name} type={props.type} name={props.name}
                   placeholder={props.placeholder}
                   required={props.required} autoComplete={props.autoComplete}
                   value={props.control.value}
                   onChange={changeHandler}
                   onBlur={blurHandler} />
            <If expression={props.control.isTouched || props.control.isSubmitted}>
                <Messages errors={props.control.errors}
                          errorMessages={props.errorMessages}
                          success={props.successMessage} />
            </If>
        </div>
    );
    //#endregion
};

InputText.defaultProps = {
    type: "text",
    required: false,
    autoComplete: "on"
};

type Props = ControlElementBaseProps<string> & {
    /**
     * Type of the input. If email type is used, the {@link BasicValidators.email} validator will be
     * automatically added.
     * @default text
     */
    type?: "text" | "password" | "email";
    /**
     * Input's placeholds
     */
    placeholder?: string;
    /**
     * Flag to allow showing browser auto complete popup. To disable, despite MDN says to use "off"
     * you must set to a random string, such as "nope".
     * @default "on"
     */
    autoComplete?: string;
};
