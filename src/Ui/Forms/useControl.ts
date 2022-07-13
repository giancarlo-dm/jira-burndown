import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AsyncValidatorFn } from "./AsyncValidatorFn.type";

import { IControl } from "./IControl";
import { IControlGroup } from "./IControlGroup";
import { ValidatorFn } from "./ValidatorFn.type";
import { ValidationResult } from "./ValidationResult.type";

/**
 * Reducer actions for the control.
 *
 * @since 0.1.0
 */
enum ControlActions {
    INPUT = "INPUT",
    BLUR = "BLUR",
    RESET = "RESET"
}

/**
 * Hook to create controls instances to later be bound to form components that requires controls.
 * @param initialValue The initial value of the control.
 * @param validators The list of custom validators to be used.
 * @param asyncValidators The list of custom async validators to be used.
 * @param options Customize the behavior of this control.
 * @return A {@link Control} instance ready to be bound to form components.
 *
 * @since 0.1.0
 */
export function useControl<T = any>(initialValue: T,
                                    validators: Array<ValidatorFn> = [],
                                    asyncValidators: Array<AsyncValidatorFn> = [],
                                    options: ControlOptions = {}): IControl<T> {

    //#region Initialization
    options.runAllSyncValidators = options.runAllSyncValidators ?? false;

    const controlReducer = useMemo(() => buildControlReducer(initialValue), [initialValue]);

    const [controlState, controlDispatch] = useReducer(controlReducer.reducer, controlReducer.initialState);
    const [controlValidatorsState, setControlValidatorsState] = useState(validators);
    const [controlAsyncValidatorsState, setControlAsyncValidatorsState] = useState(asyncValidators);
    const [parentState, setParentState] = useState<null|IControlGroup>(null);
    const [isSubmittedState, setIsSubmittedState] = useState(false);
    const [isAsyncValidatorsRunningState, setIsAsyncValidatorsRunningState] = useState(false);
    const [asyncValidationResultState, setAsyncValidationResultState] = useState<ValidationResult>(null);

    /**
     * Validation result.
     */
    const validationResult: ValidationResult = useMemo(
        () => runSyncValidators(controlState.value, controlValidatorsState, options.runAllSyncValidators),
        [controlState.value, controlValidatorsState, options.runAllSyncValidators]
    );

    /**
     * Is valid only if no async validators are running and all results were null.
     */
    const isValid: undefined|boolean = isAsyncValidatorsRunningState
        ? undefined
        : validationResult == null && asyncValidationResultState == null;

    /**
     * Merged {@link ValidationResult} from sync and async validators.
     */
    const errors = validationResult == null && asyncValidationResultState == null
        ? null
        : {...validationResult, ...asyncValidationResultState};
    //#endregion

    //#region Event Handlers
    /**
     * {@link Control.change}
     */
    const change = useCallback(
        (value: T) => {
            controlDispatch({type: ControlActions.INPUT, value: value});
        },
        []
    );

    /**
     * {@link Control.blur}
     */
    const blur = useCallback(
        (): void => {
            controlDispatch({type: ControlActions.BLUR});
        },
        []
    );

    /**
     * {@link Control.reset}
     */
    const reset = useCallback(
        (): void => {
            controlDispatch({type: ControlActions.RESET});
        }, []
    );

    /**
     * {@link Control.setValidators}
     */
    const setValidators = useCallback(
        (validators: Array<ValidatorFn>): void => {
            setControlValidatorsState(validators);
        }, []
    );

    /**
     * {@link Control.addValidators}
     */
    const addValidators = useCallback(
        (...validators: Array<ValidatorFn>): void => {
            setControlValidatorsState(prevState => [...prevState, ...validators]);
        }, []
    );

    /**
     * {@link Control.removeValidators}
     */
    const removeValidators = useCallback(
        (...validators: Array<ValidatorFn>): void => {
            setControlValidatorsState(prevState => {
                const newValidators = [...prevState];
                for (let validator of validators) {
                    const index = newValidators.indexOf(validator);
                    if (index !== -1) {
                        newValidators.splice(index, 1);
                    }
                }

                return newValidators;
            });
        }, []
    );

    /**
     * {@link Control.setAsyncValidators}
     */
    const setAsyncValidators = useCallback(
        (asyncValidators: Array<AsyncValidatorFn>): void => {
            setControlAsyncValidatorsState(asyncValidators);
        }, []
    );

    /**
     * {@link Control.addAsyncValidators}
     */
    const addAsyncValidators = useCallback(
        (...asyncValidators: Array<AsyncValidatorFn>): void => {
            setControlAsyncValidatorsState(prevState => [...prevState, ...asyncValidators]);
        }, []
    );

    /**
     * {@link Control.removeAsyncValidators}
     */
    const removeAsyncValidators = useCallback(
        (...asyncValidators: Array<AsyncValidatorFn>): void => {
            setControlAsyncValidatorsState(prevState => {
                const newValidators = [...prevState];
                for (let asyncValidator of asyncValidators) {
                    const index = newValidators.indexOf(asyncValidator);
                    if (index !== -1) {
                        newValidators.splice(index, 1);
                    }
                }

                return newValidators;
            });
        }, []
    );

    /**
     * {@link Control.setParent}
     */
    const setParent = useCallback(
        (parent: IControlGroup): void => {
            setParentState(parent);
        }, []
    );

    /**
     * {@link ControlGroup.markSubmitted}
     */
    const markSubmitted = useCallback(
        () => {
            setIsSubmittedState(true);
        },
        []
    );

    /**
     * {@link ControlGroup.markRetracted}
     */
    const markRetracted = useCallback(
        () => {
            setIsSubmittedState(false);
        },
        []
    );
    //#endregion

    //#region Refs
    /**
     * Control never changes, only its contents. Re-Render is triggered normally because of setState.
     */
    const control = useRef(new Control(
        controlState.value,
        controlState.isTouched,
        controlState.isDirty,
        isValid,
        isSubmittedState,
        errors,
        controlValidatorsState,
        controlAsyncValidatorsState,
        change,
        blur,
        reset,
        setValidators,
        addValidators,
        removeValidators,
        setAsyncValidators,
        addAsyncValidators,
        removeAsyncValidators,
        setParent,
        markSubmitted,
        markRetracted
    ));
    /**
     * Current running async validators Promise. Used to ignore (i.e. "cancel") previous running
     * async validators if control value changed.
     */
    const asyncValidatorPromiseRef = useRef<null|Promise<ValidationResult>>(null);
    //#endregion

    //#region Effects
    // Updates parent validity
    useEffect(
        () => {
            if (parentState != null) {
                parentState.updateValidity();
            }
        },
        [isValid, parentState]
    );

    // Runs async validators
    useEffect(
        () => {
            // only runs if sync validation result is null and has asyncValidators
            if (validationResult == null && controlAsyncValidatorsState.length > 0) {
                setIsAsyncValidatorsRunningState(true);
                const promise: Promise<ValidationResult> = runAsyncValidators(controlState.value, controlAsyncValidatorsState);
                asyncValidatorPromiseRef.current = promise;

                promise
                    .then(result => {
                        // only process the if the current promise being resolved is the same as
                        // the latest one invoked
                        if (promise === asyncValidatorPromiseRef.current) {
                            console.log(result);
                            setAsyncValidationResultState(result);
                            setIsAsyncValidatorsRunningState(false);
                        }
                    });
            }
        },
        [controlState.value, controlAsyncValidatorsState, validationResult]
    );
    //#endregion

    //#region Hook Return
    control.current.value = controlState.value;
    control.current.isTouched = controlState.isTouched;
    control.current.isDirty = controlState.isDirty;
    control.current.isValid = isValid;
    control.current.isSubmitted = isSubmittedState;
    control.current.errors = errors;
    control.current.validators = controlValidatorsState;
    control.current.asyncValidators = controlAsyncValidatorsState;

    return control.current;
    //#endregion
}

/**
 * Options to configure behavior of the controls.
 *
 * @since 0.1.0
 */
export type ControlOptions = {
    /**
     * Flag to run all sync validators and not stop on first error.
     * @default false
     */
    runAllSyncValidators?: boolean;
}

//--------------------------------------------------------------------------------------------------
// Helpers

/**
 * Builds the control reducer.
 * @param initialValue The initial value to be set on the control.
 *
 * @since 0.1.0
 */
function buildControlReducer<T = any>(initialValue: T): Reducer<ControlReducerState<T>, ControlActions, T> {

    const initialState: ControlReducerState<T> = {
        value: initialValue,
        isTouched: false,
        isDirty: false
    };

    return {
        initialState: initialState,
        reducer: (state: ControlReducerState<T>, action: ControlReducerActions<T>) => {
            switch (action.type) {
                case ControlActions.INPUT:
                    return {...state, value: action.value, isDirty: true};
                case ControlActions.BLUR:
                    return {...state, isTouched: true};
                case ControlActions.RESET:
                    return initialState;
            }
        }
    };
}

/**
 * Runs the synchronous validators against the specified values return the errors or null if valid.
 * @param value The value to be used on the validators.
 * @param validators The list of validators.
 * @param runAllSyncValidators Flag to run all validators and not stop on first error.
 *
 * @since 0.1.0
 */
function runSyncValidators<T>(value: T,
                              validators: Array<ValidatorFn>,
                              runAllSyncValidators: boolean = false): ValidationResult {
    if (validators.length === 0) {
        return null;
    }

    let totalResult: ValidationResult = {};

    for (let validator of validators) {
        const result: ValidationResult = validator(value);
        if (result != null) {
            totalResult = {...totalResult, ...result};
            if (!runAllSyncValidators) {
                break;
            }
        }
    }

    if (Reflect.ownKeys(totalResult).length > 0) {
        return totalResult;
    }

    return null;
}

/**
 * Runs the asynchronous validators against the specified values return the errors or null if valid.
 * @param value The value to be used on the validators.
 * @param asyncValidators The list of validators.
 *
 * @since 0.1.0
 */
async function runAsyncValidators<T>(value: T,
                                     asyncValidators: Array<AsyncValidatorFn>): Promise<ValidationResult> {
    if (asyncValidators.length === 0) {
        return null;
    }

    const validatorPromises: Array<Promise<ValidationResult>> = [];
    for (let asyncValidator of asyncValidators) {
        validatorPromises.push(asyncValidator(value));
    }

    let totalResult: ValidationResult = {};
    const validatorsResult: Array<ValidationResult> = await Promise.all(validatorPromises);
    for (let result of validatorsResult) {
        totalResult = {...totalResult, ...result};
    }

    if (Reflect.ownKeys(totalResult).length > 0) {
        return totalResult;
    }

    return null;
}

/**
 * Control state inside reducer
 *
 * @since 0.1.0
 */
type ControlReducerState<T> = {
    /**
     * {@link Control.value}
     */
    value: T;
    /**
     * {@link Control.isTouched}
     */
    isTouched: boolean;
    /**
     * {@link Control.isDirty}
     */
    isDirty: boolean;
}

/**
 * List of actions that the control's dispatcher can dispatch.
 *
 * @since 0.1.0
 */
type ControlReducerActions<T> = { type: ControlActions.INPUT, value: T }
    | { type: ControlActions.BLUR }
    | { type: ControlActions.RESET }

/**
 * Reducer interface
 *
 * @since 0.1.0
 */
type Reducer<S, A, V> = {
    initialState: S;
    reducer(state: S, action: { type: A, value?: V }): S;
}

/**
 * Concrete control used by the hook.
 *
 * @since 0.1.0
 */
class Control<T> implements IControl<T> {

    //#region Private Attributes
    #value: T;
    #isTouched: boolean;
    #isDirty: boolean;
    #isValid: undefined|boolean;
    #isSubmitted: boolean;
    #errors: ValidationResult;
    #validators: Array<ValidatorFn>;
    #asyncValidators: Array<AsyncValidatorFn>;
    //#endregion

    //#region Attributes Getters/Setters
    get value(): T {
        return this.#value;
    }
    set value(value: T) {
        this.#value = value;
    }

    get isTouched(): boolean {
        return this.#isTouched;
    }
    set isTouched(value: boolean) {
        this.#isTouched = value;
    }

    get isDirty(): boolean {
        return this.#isDirty;
    }
    set isDirty(value: boolean) {
        this.#isDirty = value;
    }

    get isValid(): boolean | undefined {
        return this.#isValid;
    }
    set isValid(value: boolean | undefined) {
        this.#isValid = value;
    }

    get isSubmitted(): boolean {
        return this.#isSubmitted;
    }
    set isSubmitted(value: boolean) {
        this.#isSubmitted = value;
    }

    get errors(): ValidationResult {
        return this.#errors;
    }
    set errors(value: ValidationResult) {
        this.#errors = value;
    }

    get validators(): Array<ValidatorFn> {
        return this.#validators;
    }
    set validators(value: Array<ValidatorFn>) {
        this.#validators = value;
    }

    get asyncValidators(): Array<AsyncValidatorFn> {
        return this.#asyncValidators;
    }
    set asyncValidators(value: Array<AsyncValidatorFn>) {
        this.#asyncValidators = value;
    }
    //#endregion

    //#region Event Handlers
    /**
     * @inheritDoc
     */
    readonly addAsyncValidators: (...asyncValidators: Array<AsyncValidatorFn>) => void;
    /**
     * @inheritDoc
     */
    readonly addValidators: (...validators: Array<ValidatorFn>) => void;
    /**
     * @inheritDoc
     */
    readonly blur: () => void;
    /**
     * @inheritDoc
     */
    readonly change: (value: T) => void;
    /**
     * @inheritDoc
     */
    readonly markRetracted: () => void;
    /**
     * @inheritDoc
     */
    readonly markSubmitted: () => void;
    /**
     * @inheritDoc
     */
    readonly removeAsyncValidators: (...validators: Array<AsyncValidatorFn>) => void;
    /**
     * @inheritDoc
     */
    readonly removeValidators: (...validators: Array<ValidatorFn>)=> void;
    /**
     * @inheritDoc
     */
    readonly reset: () => void;
    /**
     * @inheritDoc
     */
    readonly setAsyncValidators: (asyncValidators: Array<AsyncValidatorFn>) => void;
    /**
     * @inheritDoc
     */
    readonly setParent: (parent: IControlGroup) => void;
    /**
     * @inheritDoc
     */
    readonly setValidators: (validators: Array<ValidatorFn>) => void;
    //#endregion

    //#region Constructor
    constructor(value: T,
                isTouched: boolean,
                isDirty: boolean,
                isValid: undefined|boolean,
                isSubmitted: boolean,
                errors: ValidationResult,
                validators: Array<ValidatorFn>,
                asyncValidators: Array<AsyncValidatorFn>,
                change: (value: T) => void,
                blur: () => void,
                reset: () => void,
                setValidators: (validators: Array<ValidatorFn>) => void,
                addValidators: (...validators: Array<ValidatorFn>) => void,
                removeValidators: (...validators: Array<ValidatorFn>) => void,
                setAsyncValidators: (asyncValidators: Array<AsyncValidatorFn>) => void,
                addAsyncValidators: (...asyncValidators: Array<AsyncValidatorFn>) => void,
                removeAsyncValidators: (...asyncValidators: Array<AsyncValidatorFn>) => void,
                setParent: (parent: IControlGroup) => void,
                markSubmitted: () => void,
                markRetracted: () => void) {
        this.#value = value;
        this.#isTouched = isTouched;
        this.#isDirty = isDirty;
        this.#isValid = isValid;
        this.#isSubmitted = isSubmitted;
        this.#errors = errors;
        this.#validators = validators;
        this.#asyncValidators = asyncValidators;

        this.change = change;
        this.blur = blur;
        this.reset = reset;
        this.setValidators = setValidators;
        this.addValidators = addValidators;
        this.removeValidators = removeValidators;
        this.setAsyncValidators = setAsyncValidators;
        this.addAsyncValidators = addAsyncValidators;
        this.removeAsyncValidators = removeAsyncValidators;
        this.setParent = setParent;
        this.markSubmitted = markSubmitted;
        this.markRetracted = markRetracted;
    }
    //#endregion
}
