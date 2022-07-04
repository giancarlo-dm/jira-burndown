import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
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
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
