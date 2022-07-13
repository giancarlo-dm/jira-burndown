import { IControl } from "./IControl";
import { ValidationMessages } from "./ValidationMessages.type";

export type ControlElementBaseProps<T> = {
     /**
     * The label to present.
     */
      label: string;
      /**
       * The name of the input. Used as name property and ID.
       */
      name: string;
      /**
     * Control to be used with this Input.
     */
    control: IControl<T>;
    /**
     * The size of the input. If none is passed, a "normal" size is used.
     * @default undefined
     */
     size?: "small" | "large";
      /**
     * Informs if a value is required. Adds a star and also the {@link BasicValidators.required}
     * validator.
     * @default false
     */
    required?: boolean;
    /**
     * Map of error messages to be matched agains the error keys emitted by the {@link validators}.
     */
     errorMessages?: ValidationMessages;
     /**
      * Message to show when control holds a valid value.
      */
     successMessage?: string;
};