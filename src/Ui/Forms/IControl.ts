import { AsyncValidatorFn } from "./AsyncValidatorFn.type";
import { IControlGroup } from "./IControlGroup";
import { ValidatorFn } from "./ValidatorFn.type";
import { ValidationResult } from "./ValidationResult.type";

/**
 * Represents a control of a form. May be used with any form input element or custom elements that
 * requires a control. Provides methods for events dispatching.
 *
 * @since 0.1.0
 */
export interface IControl<T> {

    //#region Attributes
    /**
     * Current control value
     */
    readonly value: T;
    /**
     * Flag that indicates if the control was touched by the user (i.e. focus followed by blur).
     */
    readonly isTouched: boolean;
    /**
     * Flag that indicates if the control value was modified by the user.
     */
    readonly isDirty: boolean;
    /**
     * Flag that indicates if the control is valid. If <code>undefined</code>, means that async
     * validators are still running.
     */
    readonly isValid: undefined|boolean;
    /**
     * Flag that indicates if the form this control is attached to was submitted.
     */
    readonly isSubmitted: boolean;
    /**
     * Error map with error keys returned by validators or null if valid.
     */
    readonly errors: ValidationResult;
    /**
     * List of validators currently assigned to this control.
     */
    readonly validators: Array<ValidatorFn>;
    /**
     * List of asynchronous validators currently assigned to this control.
     */
    readonly asyncValidators: Array<AsyncValidatorFn>;
    //#endregion

    //#region Event Handlers
    /**
     * Change event handler to be invoked when value needs to be updated.
     */
    change(value: T): void;
    /**
     * Blur event handler to signal that a blur event occurred.
     */
    blur(): void;
    /**
     * Reset event handler to reset the controls value to the initial value. Re-runs validators.
     */
    reset(): void;
    /**
     * Overrides the current sync validators.
     */
    setValidators(validators: Array<ValidatorFn>): void;
    /**
     * Adds a set of validators the current list of validators.
     */
    addValidators(...validators: Array<ValidatorFn>): void;
    /**
     * Removes a set of validator the current list of validators.
     */
    removeValidators(...validators: Array<ValidatorFn>): void;
    /**
     * Overrides the current async validators.
     */
    setAsyncValidators(asyncValidators: Array<AsyncValidatorFn>): void;
    /**
     * Adds a set of async validators the current list of async validators.
     */
    addAsyncValidators(...asyncValidators: Array<AsyncValidatorFn>): void;
    /**
     * Removes a set of async validator the current list of async validators.
     */
    removeAsyncValidators(...validators: Array<AsyncValidatorFn>): void;
    /**
     * Sets a parent for this control. Will propagate any value change and validation status.
     */
    setParent(parent: IControlGroup): void;
    /**
     * Marks this control as submitted. To clear, please use {@link this.markRetracted}
     */
    markSubmitted(): void;
    /**
     * Marks this control as not submitted.
     */
    markRetracted(): void;
    //#endregion
}
