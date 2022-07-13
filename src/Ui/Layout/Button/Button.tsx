import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, MouseEvent, PropsWithChildren } from "react";

import { classList } from "../../Helpers";
import { If } from "../../Structural";

/**
 * Represents a button. Provides isLoading functionality and preferred to use instead on plain html
 * button.
 *
 * @since 0.1.0
 */
export const Button: FC<PropsWithChildren<Props>> = (props) => {

    //#region Initialization
    /**
     * Makes all props as required since we have defaults. Used for TypeScript type check.
     */
    const requiredProps: Required<PropsWithChildren<Props>> = props as any;
    //#endregion

    //#region Render
    return (
        <button type={requiredProps.type}
                className={classList({
                        small: requiredProps.size === "small",
                        large: requiredProps.size === "large",
                        block: requiredProps.block
                    },
                    requiredProps.className
                )}
                disabled={requiredProps.disabled}
                onClick={requiredProps.onClick}>
            {requiredProps.children}
            <If expression={requiredProps.loading}>
                <FontAwesomeIcon icon={faCircleNotch} spin
                                 className={classList({
                                     "mgl1": requiredProps.size === "large",
                                     "mgl0_5": requiredProps.size === undefined,
                                     "mgl0_25": requiredProps.size === "small"
                                 })} />
            </If>
        </button>
    );
    //#endregion
};

Button.defaultProps = {
    type: "button",
    block: false,
    disabled: false,
    loading: false,
    secondary: false,
    size: undefined,
    className: undefined,
    onClick: () => void 0
};

type Props = {
    /**
     * @default "button"
     */
    type?: "button" | "submit" | "reset";
    /**
     * @default false
     */
    block?: boolean;
    /**
     * @default false
     */
    disabled?: boolean;
    /**
     * @default false
     */
    loading?: boolean;
    /**
     * @default false
     */
    secondary?: boolean;
    /**
     * If not defined, will set the button to normal size.
     * @default undefined
     */
    size?: "small" | "large";
    /**
     * String of extra css classes to append the button
     */
    className?: string;
    /**
     * Event emitter when button is clicked.
     */
    onClick?(event: MouseEvent<HTMLButtonElement>): void;
};
