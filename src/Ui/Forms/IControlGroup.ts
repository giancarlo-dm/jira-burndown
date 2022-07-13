import { ControlsMap } from "./ControlsMap.type";

/**
 * Represents a group of nested {@link Control}. May also hold nested {@link ControlGroup}.
 *
 * @since 0.1.0
 */
export interface IControlGroup {

    //#region Attributes
    /**
     * Map of controls by name
     */
    readonly controls: ControlsMap;
    /**
     * Flag that indicates if the control is valid. If <code>undefined</code>, means that async
     * validators are still running.
     */
    readonly isValid: undefined|boolean;
    /**
     * Flag that indicates if the form this control group is attached to was submitted.
     */
    readonly isSubmitted: boolean;
    //#endregion

    //#region Event Handlers
    /**
     * Updates the validity of the control group.
     */
    updateValidity(): void;
    /**
     * Sets a parent for this control. Will propagate any value change and validation status.
     */
    setParent(parent: IControlGroup): void;
    /**
     * Marks this control group and all its children controls as submitted. To clear, please use
     * {@link this.markRetracted}
     */
    markSubmitted(): void;
    /**
     * Marks this control group and all its children controls as not submitted.
     */
    markRetracted(): void;
    //#endregion
}


