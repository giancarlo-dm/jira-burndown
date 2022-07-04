import { FC, Fragment, PropsWithChildren } from "react";

/**
 * Structural directive to be used with {@link Switch}. Represents a condition, or a set of
 * conditions, to be matched against an expression to determine if it will be rendered or not.
 * @since 0.1.0
 */
export const SwitchCase: FC<PropsWithChildren<SwitchCaseProps>> = (props) => {
    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
};

export type SwitchCaseProps = {
    /**
     * Condition of set of conditions to compare. If a set of conditions is used, an OR operation is
     * used, in other words, if one condition match, the case will be rendered.
     */
    when: any|Array<any>
}
