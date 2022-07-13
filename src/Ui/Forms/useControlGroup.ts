import { useCallback, useEffect, useRef, useState } from "react";

import { IControlGroup } from "./IControlGroup";
import { ControlsMap } from "./ControlsMap.type";

/**
 * Hook to create a group of nested controls. Helps determine if an entire form is valid or not.
 *
 * @example
 * // To access the child controls and bind to a form element use.
 * <InputText control={controlGroup.controls.controlName} />
 *
 * @param controlsMap The named controls map to be nested in this group.
 * @return A {@link ControlGroup} instance with all the nested controls ready to be used.
 *
 * @since 0.1.0
 */
export function useControlGroup(controlsMap: ControlsMap) {

    //#region Initialization
    const [isValid, setIsValid] = useState<undefined|boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [parentState, setParentState] = useState<null|IControlGroup>(null);
    //#endregion

    //#region Event Handlers
    /**
     * {@link ControlGroup.updateValidity}
     */
    const updateValidity = useCallback( (): void => {
        let valid: undefined|boolean = true;

        for (let controlKey in controlsMap) {
            if (!controlsMap[controlKey].isValid) {
                valid = controlsMap[controlKey].isValid;
                break;
            }
        }

        setIsValid(valid);
        },
        [controlsMap]
    );

    /**
     * {@link ControlGroup.updateValidity}
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
            setIsSubmitted(true);
            for (let controlKey in controlsMap) {
                controlsMap[controlKey].markSubmitted();
            }
        },
        [controlsMap]
    );

    /**
     * {@link ControlGroup.markRetracted}
     */
    const markRetracted = useCallback(
        () => {
            setIsSubmitted(false);
            for (let controlKey in controlsMap) {
                controlsMap[controlKey].markRetracted();
            }
        },
        [controlsMap]
    );
    //#endregion

    //#region Refs
    /**
     * ControlGroup never changes, only its contents. Re-Render is triggered normally because of
     * setState.
     */
    const controlGroup = useRef(new ControlGroup(
        controlsMap,
        isValid,
        isSubmitted,
        updateValidity,
        setParent,
        markSubmitted,
        markRetracted
    ));
    //#endregion

    //#region Effects
    // Sets this control group as the parent of each control on hook startup
    useEffect(
        () => {
            for (let controlKey in controlsMap) {
                controlsMap[controlKey].setParent(controlGroup.current);
            }
        },
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

     // Updates parent validity
     useEffect(
        () => {
            if (parentState != null) {
                parentState.updateValidity();
            }
        },
        [isValid, parentState]
    );
    //#endregion

    //#region Hook Return
    controlGroup.current.isValid = isValid;
    controlGroup.current.isSubmitted = isSubmitted;

    return controlGroup.current;
    //#endregion
}

//--------------------------------------------------------------------------------------------------
// Helpers

class ControlGroup implements IControlGroup {

    //#region Private Attributes
    #controls: ControlsMap;
    #isValid: undefined|boolean;
    #isSubmitted: boolean;
    //#endregion

    //#region Attributes Getters/Setters
    /**
     * @inheritDoc
     */
    get controls(): ControlsMap {
        return this.#controls;
    }
    set controls(value: ControlsMap) {
        this.#controls = value;
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
    //#endregion

    //#region Event Handlers
    /**
     * Updates the validity of the control group.
     */
    readonly updateValidity: () => void;
    /**
     * Sets a parent for this control. Will propagate any value change and validation status.
     */
    readonly setParent: (parent: IControlGroup) => void;
    /**
     * Marks this control group and all its children controls as submitted. To clear, please use
     * {@link this.markRetracted}
     */
    readonly markSubmitted: () => void;
    /**
     * Marks this control group and all its children controls as not submitted.
     */
    readonly markRetracted: () => void;
    //#endregion

    //#region Constructor
    constructor(controls: ControlsMap,
                isValid: undefined|boolean,
                isSubmitted: boolean,
                updateValidity: () => void,
                setParent: (parent: IControlGroup) => void,
                markSubmitted: () => void,
                markRetracted: () => void) {
        this.#controls = controls;
        this.#isValid = isValid;
        this.#isSubmitted = isSubmitted;

        this.updateValidity = updateValidity;
        this.setParent = setParent;
        this.markSubmitted = markSubmitted;
        this.markRetracted = markRetracted;
    }
    //#endregion
}
