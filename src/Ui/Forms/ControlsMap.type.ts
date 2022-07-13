import { IControl } from "./IControl";
import { IControlGroup } from "./IControlGroup";

/**
 * Map of named controls to be used in a {@link ControlGroup}.
 *
 * @since 0.1.0
 */
export type ControlsMap = {
    [controlName: string]: IControlGroup|IControl<any>;
}
