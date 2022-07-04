import { HttpRequestStatusEnum } from "./HttpRequestStatus.enum";

export interface IHttpRequest {

    readonly status: HttpRequestStatusEnum;
    readonly isSending: boolean;
    readonly result: any;
    readonly errors: any;

    sendRequest(): Promise<any>;
    cancelRequest(): void;
}
