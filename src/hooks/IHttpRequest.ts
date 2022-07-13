import { HttpRequestStatusEnum } from "./HttpRequestStatus.enum";

export interface IHttpRequest<T = any> {

    readonly status: HttpRequestStatusEnum;
    readonly isSending: boolean;
    readonly result: T;
    readonly errors: any;

    sendRequest(): Promise<T>;
    cancelRequest(): void;
    
    //TODO evalutate if the following methods are necessary
    /**
    setHeader(header: string, value: string): void;
    setQueryParam(queryParam: string, value: string): void;
    setPathParam(pathParam: string, value: string): void;
    setParser<T>(parser: () => T): void;
     */
}
