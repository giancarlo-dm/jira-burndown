export type RequestConfiguration = RequestInit & {
    // pathParams: {
    //     [key: string]: any
    // },
    queryParams?: {
        [key: string]: any
    }
}