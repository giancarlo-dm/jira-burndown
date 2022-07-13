export type LoopedRenderFn<T> = (
    item: T,
    index: number,
    length: number,
    isOdd: boolean,
    isEven: boolean,
    isFirst: boolean,
    isLast: boolean
) => JSX.Element;