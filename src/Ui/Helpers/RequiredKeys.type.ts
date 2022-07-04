/**
 * Only returns the object key that are not optional.
 */
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
