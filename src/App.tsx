import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MessageBoxOptions, MessageBoxReturnValue } from "electron";

import isElectron from "is-electron";
import { FC } from "react";
import { HttpRequestStatusEnum } from "./hooks/HttpRequestStatus.enum";

import { useHttp } from "./hooks/useHttp";
import { Switch, SwitchCase, SwitchCaseDefault } from "./Ui/Structural";

const ipcRenderer = isElectron() ? window.require("electron").ipcRenderer : null;

const user = {
    user: "giancarlo.dalle",
    password: "Ptx408@5abcdefg"
};

/**
 * Main App component.
 *
 * @since 0.1.0
 */
const App: FC = () => {

    const issueHttpRequest = useHttp(
        `https://jiraproducao.totvs.com.br/rest/api/2/search?jql="Key"=DTCRMSD-228&maxResults=1`,
        {
            method: "GET",
            headers: {
                "Authorization": `Basic ${btoa(`${user.user}:${user.password}`)}`,
                "Content-Type": "application/json"
            }
        }
    );

    const fetchHandler = () => {
        issueHttpRequest.sendRequest()
            .catch(error => {
                if (isElectron()) {
                    ipcRenderer!
                        .invoke("show-modal", {
                            type: "error",
                            title: "Unable to fetch data",
                            message: "Unable to fetch JIRA data due to errors when processing the request.",
                            detail: JSON.stringify(error, null, 4),
                            buttons: ["OK", "Try Again"],
                            defaultId: 0
                        } as MessageBoxOptions)
                        .then((result: MessageBoxReturnValue) => {
                            if (result.response === 1) {
                                setTimeout(() => fetchHandler());
                            }
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
                else {
                    const confirmed = window.confirm(`Unable to fetch JIRA data due to errors when processing the request.\n\nTry again?\n\nEntry: ${JSON.stringify(error, null, 4)}`);
                    if (confirmed) {
                        setTimeout(() => fetchHandler());
                    }
                }
            });
    };

    const cancelHandler = () => {
        issueHttpRequest.cancelRequest();
    };


    return (
        <div className="App">
            <button type="button" onClick={fetchHandler}
                    disabled={issueHttpRequest.isSending}>
                Fetch
            </button>
            <button type="button" onClick={cancelHandler}
                    disabled={!issueHttpRequest.isSending}>
                Cancel
            </button>


            <Switch expression={issueHttpRequest.status}>
                <SwitchCase when={[HttpRequestStatusEnum.NOT_SENT, HttpRequestStatusEnum.ABORTED]}>
                    Click on "fetch" to fetch the issue
                </SwitchCase>
                <SwitchCase when={HttpRequestStatusEnum.SENDING}>
                    Fetching... <FontAwesomeIcon icon={faCircleNotch} spin/>
                </SwitchCase>
                <SwitchCase when={HttpRequestStatusEnum.ERROR}>
                    Error while fetching the issue data
                </SwitchCase>
                <SwitchCaseDefault>
                    {JSON.stringify(issueHttpRequest.result, null, 4)}
                </SwitchCaseDefault>
            </Switch>
        </div>
    );
};

export default App;
