import React, { FC } from "react";
import { ForOf } from "../../Structural";

import { defaultMessages } from "../dafaulMessages.constant";
import { ValidationMessages } from "../ValidationMessages.type";
import { ValidationResult } from "../ValidationResult.type";
import classes from "./Messages.module.scss";

/**
 * Shows messages to a form control. May show validation error messages or success message.
 * @param props
 * @constructor
 */
export const Messages: FC<Props> = (props) => {

    //#region Render
    if (props.errors == null) {
        if (props.success != null && props.success.length >  0) {
            return <div className={classes.validMessage}>{props.success}</div>;
        }
        return null;
    }
    else {
        return (
            <div className={classes.invalidMessagesContainer}>
                <ForOf items={Reflect.ownKeys(props.errors)} useItselfAsKey>
                    {(errorKey) => {
                        let message: string;
                        if (props.errorMessages != null &&
                            Reflect.has(props.errorMessages, errorKey)) {
                            message = Reflect.get(props.errorMessages, errorKey);
                        }
                        else if (Reflect.has(defaultMessages, errorKey)) {
                            message = Reflect.get(defaultMessages, errorKey);
                        }
                        else {
                            message = defaultMessages.default;
                        }

                       return (
                           <div className={classes.invalidMessage}>{message}</div>
                       );
                    }}
                </ForOf>
            </div>
        );
    }
    //#endregion
};

type Props = {
    /**
     * Map of validation errors.
     */
    errors: ValidationResult;
    /**
     * Map of validation error messages by validation error key.
     */
    errorMessages?: ValidationMessages;
    /**
     * Success message.
     */
    success?: string;
};
