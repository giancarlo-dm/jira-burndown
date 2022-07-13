import { FC } from "react";
import { classList } from "../../Ui/Helpers";

import classes from "./LazyLoadingFallback.module.scss";

export const LazyLoadingFallback: FC = () => {

    //#region Render
    return (
        <section className={classes.loadingContainer}>
            <h5 className="large">Carregando conteúdo</h5>
            <span className={classList(classes.loadingDot, classes.d1)} />
            <span className={classList(classes.loadingDot, classes.d2)} />
            <span className={classList(classes.loadingDot, classes.d3)} />
            <span className={classList(classes.loadingDot, classes.d4)} />
            <span className={classList(classes.loadingDot, classes.d5)} />
        </section>
    );
    //#endregion
};