import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FC, Fragment, useEffect, useRef, useState } from "react";

import { classList, LoopedRenderFn, Primitives, RequiredKeys } from "../../Helpers";
import { ForOf, If } from "../../Structural";
import { ControlElementBaseProps } from "../ControlElementBaseProps.type";
import { Messages } from "../Messages/Messages";
import { current } from "@reduxjs/toolkit";
import { IHttpRequest } from "../../../hooks"; // TODO move useHttp Hook to UI folder

export const Select = <T,>(props: Props<T>) => {

    //#region Initialization
    const selfRef = useRef<HTMLDivElement>(null);
    const selectInputRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    //#endregion

    //#region Event Handlers
    /**
     * Handler for clicks on select input. Opens and closes dropdown.
     */
    const inputClickHandler = () => {
        setIsOpen(prevState => !prevState);
    }

    const itemSelectHandler = (item: T) => {
        props.control.change(item);
        setIsOpen(false);
    }
    //#endregion

    //#region Effects
    /**
     * Verifys if clicks on the document were outside of this component. If so
     * closes the dropdown. 
     */
    useEffect(
        () => {
            const listener = (event: MouseEvent) => {
                if (!selfRef.current?.contains(event.target as any)) {
                    setIsOpen(false);
                }
            }

            document.addEventListener("click", listener);
            
            return () => {
                document.removeEventListener("click", listener);
            }
        },
        []
    );    
    //#endregion

    //#region Render Helpers
    const isItemSelected = (item: T): boolean => {
        if (item == null) {
            return false;
        }

        if (props.useItselfAsKey || props.useIndexAsKey) {
            return item === props.control.value;
        }
        else {
            if (item != null && props.control.value == null) {
                return false;
            }

            let itemKeyValue: any;
            let controlValue: any;

            if (typeof props.itemsKey === "function") {
                itemKeyValue = props.itemsKey(item);
                controlValue = props.itemsKey(props.control.value);
            }
            else {
                itemKeyValue = Reflect.get((item as Object), props.itemsKey as PropertyKey);
                controlValue = Reflect.get((props.control.value as Object), props.itemsKey as PropertyKey);
            }

            return itemKeyValue === controlValue;
        }
    }
    //#endregion

    //#region Render
    // TODO perhaps extract div container and label container to a higher order
    // component or a component that receives accepts child slot.
    return (
        <div className={classList("control", {
                 invalid: !props.control.isValid && (props.control.isTouched || props.control.isSubmitted),
                 large: props.size === "large",
                 small: props.size === "small"
             })}
             ref={selfRef}>
            <label htmlFor={props.name}
                   className={classList({
                       required: props.required ?? false
                   })}>
                {props.label}
            </label>
            <div className="select" id={props.name}>
                <div className="select__input" tabIndex={0}
                     onClick={inputClickHandler}
                     ref={selectInputRef}>
                    <div className="select__input__display">
                        <If expression={props.control.value != null}
                            else={
                                <span>- Select -</span>
                            }>
                            {() => (
                                <Fragment>
                                    {props.children(props.control.value, 0, 1, false, true, true, true)}
                                </Fragment>
                            )}
                        </If>
                    </div>
                    <div className="select__input__chevron">
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                </div>
                <If expression={isOpen}>
                    <div className="select__dropdown"
                        style={{
                            "width": selectInputRef.current?.clientWidth
                        }}>
                        <div className="select__dropdown__item"
                            tabIndex={0}
                            onClick={itemSelectHandler.bind(null, null as any)}>
                            - Select -
                        </div>
                        <ForOf items={props.items}
                            keyAttribute={props.itemsKey}
                            useIndexAsKey={props.useIndexAsKey}
                            useItselfAsKey={props.useItselfAsKey}>
                            {(...args) => (
                                <div className={classList(
                                         "select__dropdown__item",
                                         {
                                            "select__dropdown__item__selected": isItemSelected(args[0]) 
                                         }
                                     )}
                                     tabIndex={0}
                                     onClick={itemSelectHandler.bind(null, args[0])}>
                                    {props.children(...args)}
                                </div>
                            )}
                        </ForOf>
                    </div>
                </If>
            </div>
            <If expression={props.control.isTouched || props.control.isSubmitted}>
                <Messages errors={props.control.errors}
                    errorMessages={props.errorMessages}
                    success={props.successMessage} />
            </If>
        </div>
    )
    //#endregion
}

type Props<T> = ControlElementBaseProps<T> & {
    /**
     * Static list of items to render.
     */
    items: Array<T>;
    /**
     * Render function for select elements. By default will render the "renderProp"
     * or if not passed, the entire value, be it primitive or object (thus rendering
     * [object Object]).
     * @default (item: T) => item;
     */
    children: LoopedRenderFn<T>;

    // TODO the following 3 props may be extracted to a type and we should ForOf and
    // every component that uses this 3 props to use the extracted type.
    /**
     * Attribute of the item to be used as key. 
     */
    itemsKey?: RequiredKeys<T> | ((item: T) => Primitives);
    /**
     * Flag that indicates to use the array index as key.
     * @default false
     */
    useIndexAsKey?: boolean;
    /**
     * Flag that indicates to use the iteration value as key.
     * @default false
     */
    useItselfAsKey?: boolean;
}