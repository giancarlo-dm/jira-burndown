import { ValidationResult } from "./ValidationResult.type";

export type ValidatorFn = (current: any) => ValidationResult;
