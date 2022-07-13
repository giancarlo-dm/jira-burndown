import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";

import isElectron from "is-electron";

import App from "./App";
import { store } from "./store";
import "./assets/styles/main.scss";

/**
 * Root React node. Where the app is rendered.
 *
 * @since 0.1.0
 */
const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <App />
)

const rootAppElectron = (
    <React.StrictMode>
        <HashRouter>
            <Provider store={store}>
                <App />
            </Provider>
        </HashRouter>
    </React.StrictMode>
);
const rootAppBrowser = (
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <App />
            </Provider>
        </BrowserRouter>
    </React.StrictMode >
);

root.render(
    isElectron() && process.env.NODE_ENV === "production"
        ? rootAppElectron
        : rootAppBrowser
);
