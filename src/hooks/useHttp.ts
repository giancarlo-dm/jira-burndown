import { useCallback, useEffect, useRef, useState } from "react";
import { HttpRequestStatusEnum } from "./HttpRequestStatus.enum";
import { IHttpRequest } from "./IHttpRequest";
import { RequestConfiguration } from "./RequestConfiguration.type";
import { RequestParser } from "./RequestParser.type";

export function useHttp(url: string, configuration: RequestConfiguration, parser?: RequestParser): IHttpRequest {

    //#region Initialization
    const [statusState, setStatusState] = useState<HttpRequestStatusEnum>(HttpRequestStatusEnum.NOT_SENT);
    const [isSendingState, setIsSendingState] = useState<boolean>(false);
    const [resultState, setResultState] = useState<null | any>(null);
    const [errorsState, setErrorsState] = useState<null | any>(null);
    const abortController = useRef<null|AbortController>(new AbortController());
    //#endregion

    //#region Event Handlers
    /**
     * {@link HttpRequest.sendRequest}
     */
    const sendRequest = useCallback(
        async () => {
            setIsSendingState(true);
            setErrorsState(null);
            setStatusState(HttpRequestStatusEnum.SENDING);
            abortController.current = new AbortController();
            try {
                let encodedQueryParams: string = "";
                if (configuration.queryParams != null) {
                    encodedQueryParams += "?";
                    const keys = Reflect.ownKeys(configuration.queryParams);
                    for (let i = 0; i < keys.length; i++) {
                        if (i > 0) {
                            encodedQueryParams += "&";
                        }
                        
                        encodedQueryParams += encodeURIComponent(String(keys[i]));
                        encodedQueryParams += "=";
                        encodedQueryParams += encodeURIComponent(Reflect.get(configuration.queryParams, keys[i]));
                    }
                }

                const compiledUrl: string = `${url}${encodedQueryParams}`
                const response = await fetch(compiledUrl, {
                    ...configuration,
                    signal: abortController.current!.signal
                });

                let data: any;
                if (parser != null) {
                    data = await parser(response);
                }
                else {
                    data = await response.json();
                }
                setResultState(data);
                setStatusState(HttpRequestStatusEnum.FINISHED);
                return data;
            }
            catch (e) {
                // Only propagate errors if it was not an abort triggered by the user
                if ((e as DOMException).name !== "AbortError") {
                    setErrorsState(e);
                    setStatusState(HttpRequestStatusEnum.ERROR);
                    throw e;
                }
                else {
                    setStatusState(HttpRequestStatusEnum.ABORTED);
                }
            }
            finally {
                setIsSendingState(false);
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

    // /**
    //  * {@link HttpRequest.setHeader}
    //  */
    // const setHeader = useCallback(
    //     (header: string, value: string) => {
    //         setConfigurationState(prevState => {
    //             const state = {...prevState};
    //             state.headers = state.headers != null 
    //                 ? {...state.headers, [header]: value}
    //                 : {[header]: value};

    //             return {...prevState}
    //         });
    //     },
    //     []
    // );
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
        statusState,
        isSendingState,
        resultState,
        errorsState,
        sendRequest,
        cancelRequest,
        // setHeader
    ));
    //#endregion

    //#region Hook Return
    httpRequest.current.status = statusState;
    httpRequest.current.isSending = isSendingState;
    httpRequest.current.result = resultState;
    httpRequest.current.errors = errorsState;

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
    // setHeader: (header: string, value: string) => void;
    //#endregion

    //#region Constructor
    constructor(status: HttpRequestStatusEnum,
                isSending: boolean,
                result: any,
                errors: any,
                sendRequest: () => Promise<any>,
                cancelRequest: () => void,
                /*setHeader: (header: string, value: string) => void*/) {
        this.#status = status;
        this.#isSending = isSending;
        this.#result = result;
        this.#errors = errors;

        this.sendRequest = sendRequest;
        this.cancelRequest = cancelRequest;
        // this.setHeader = setHeader;
    }
    //#endregion
}
