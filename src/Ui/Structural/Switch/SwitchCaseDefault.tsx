import { FC, Fragment, PropsWithChildren } from "react";

/**
 * Structural directive to be used with {@link Switch}. Represents a default child to render if no
 * {@link SwitchCase} conditions are met. Must be the last child on {@link Switch} and only one
 * default is allowed.
 * @since 0.1.0
 */
export const SwitchCaseDefault: FC<PropsWithChildren> = (props) => {
    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
};
