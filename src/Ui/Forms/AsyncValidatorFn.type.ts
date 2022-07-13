import { ValidationResult } from "./ValidationResult.type";

export type AsyncValidatorFn = (current: any) => Promise<ValidationResult>;
