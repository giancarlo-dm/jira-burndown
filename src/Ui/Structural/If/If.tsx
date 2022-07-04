import { FC, Fragment, PropsWithChildren } from "react";

/**
 * Conditionally renders its children. Accepts an optional else element to be shown.
 * @param props
 */
export const If: FC<PropsWithChildren<Props>> = (props) => {

    //#region Render
    return (
        <Fragment>
            {props.expression
                ? props.children
                : props.else != null
                    ? props.else
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
     * The else of the if..else statement. JSX.Element to show when the {@link expression} results
     * in <code>False</code>.
     */
    else?: JSX.Element
}
