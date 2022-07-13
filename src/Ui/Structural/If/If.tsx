import { FC, Fragment, PropsWithChildren } from "react";

/**
 * Conditionally renders its children. Accepts an optional else element to be shown.
 * @param props
 */
export const If: FC<Props> = (props) => {

    //#region Render
    return (
        <Fragment>
            {props.expression
                ? typeof props.children === "function" ? props.children() : props.children
                : props.else != null
                    ? typeof props.else === "function" ? props.else() : props.else
                    : null}
        </Fragment>
    );
    //#endregion
};

type Props = {
    /**
     * Expression to conditionally show the children. If <code>true</code> shows the children,
     * otherwise if {@link else} is defined, will show its element, otherwise will not render
     * anything.
     */
    expression: boolean;
    /**
     * The if..then of if..else statement. JSX.Element or a factory that solves to JSX.Element
     * to show when the {@link expression} results in <code>true</code>.
     */
    children: JSX.Element | (() => JSX.Element);
    /**
     * The else of the if..else statement. JSX.Element or a factory that solves to JSX.Element
     * to show when the {@link expression} results in <code>false</code>.
     */
    else?: JSX.Element | (() => JSX.Element);
}
