import { useCallback, useEffect, useRef, useState } from "react";
import { HttpRequestStatusEnum } from "./HttpRequestStatus.enum";
import { IHttpRequest } from "./IHttpRequest";

export function useHttp(url: string, configuration: RequestInit): IHttpRequest {

    //#region Initialization
    const [status, setStatus] = useState<HttpRequestStatusEnum>(HttpRequestStatusEnum.NOT_SENT);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [result, setResult] = useState<null | any>(null);
    const [errors, setErrors] = useState<null | any>(null);
    const abortController = useRef<null|AbortController>(new AbortController());
    //#endregion

    //#region Event Handlers
    /**
     * {@link HttpRequest.sendRequest}
     */
    const sendRequest = useCallback(
        async () => {
            setIsSending(true);
            setErrors(null);
            setStatus(HttpRequestStatusEnum.SENDING);
            abortController.current = new AbortController();
            try {
                const result = await fetch(url, {
                    ...configuration,
                    signal: abortController.current!.signal
                });
                const data = await result.json();
                setResult(data);
                setStatus(HttpRequestStatusEnum.FINISHED);
                return data;
            }
            catch (e) {
                // Only propagate errors if it was not an abort triggered by the user
                if ((e as DOMException).name !== "AbortError") {
                    setErrors(e);
                    setStatus(HttpRequestStatusEnum.ERROR);
                    throw e;
                }
                else {
                    setStatus(HttpRequestStatusEnum.ABORTED);
                }
            }
            finally {
                setIsSending(false);
            }
        },
        [url, configuration]
    );

    /**
     * {@link HttpRequest.cancelRequest}
     */
    const cancelRequest = useCallback(
        () => {
            abortController.current?.abort();
        },
        []
    );
    //#endregion

    //#region Effects
    /**
     * Effect to abort the fetch call if the component is unmounted.
     */
    useEffect(
        () => () => cancelRequest(),
        [cancelRequest]
    );
    //#endregion

    //#region Hook Ref
    /**
     * HttpRequest never changes, only its contents. Re-Render is triggered normally because of
     * setState.
     */
    const httpRequest = useRef(new HttpRequest(
        status,
        isSending,
        result,
        errors,
        sendRequest,
        cancelRequest
    ));
    //#endregion

    //#region Hook Return
    httpRequest.current.status = status;
    httpRequest.current.isSending = isSending;
    httpRequest.current.result = result;
    httpRequest.current.errors = errors;

    return httpRequest.current;
    //#endregion
}

//--------------------------------------------------------------------------------------------------
// Helpers

class HttpRequest implements IHttpRequest {

    //#region Private Attributes
    #status: HttpRequestStatusEnum;
    #isSending: boolean;
    #result: any;
    #errors: any;
    //#endregion

    //#region Attributes Getters/Setters
    get status(): HttpRequestStatusEnum {
        return this.#status;
    }
    set status(value: HttpRequestStatusEnum) {
        this.#status = value;
    }

    get isSending(): boolean {
        return this.#isSending;
    }
    set isSending(value: boolean) {
        this.#isSending = value;
    }

    get result(): any {
        return this.#result;
    }
    set result(value: any) {
        this.#result = value;
    }

    get errors(): any {
        return this.#errors;
    }
    set errors(value: any) {
        this.#errors = value;
    }
    //#endregion

    //#region Event Handlers
    sendRequest: () => Promise<any>;
    cancelRequest: () => void;
    //#endregion

    //#region Constructor
    constructor(status: HttpRequestStatusEnum,
                isSending: boolean,
                result: any,
                errors: any,
                sendRequest: () => Promise<any>,
                cancelRequest: () => void) {
        this.#status = status;
        this.#isSending = isSending;
        this.#result = result;
        this.#errors = errors;

        this.sendRequest = sendRequest;
        this.cancelRequest = cancelRequest;
    }
    //#endregion
}
