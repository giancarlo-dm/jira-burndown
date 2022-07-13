import React, { FC, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { LazyLoadingFallback } from "./components";
import { AlreadyLoggedInGuard, AuthGuard, AutoLoginGuard } from "./guards";

const LoginView = React.lazy(() => import("./views/Login/LoginView"));
const BurndownView = React.lazy(() => import("./views/Burndown/BurndownView"));

/**
 * Main App component.
 *
 * @since 0.1.0
 */
const App: FC = () => {
    //#region Render
    return (
        <main>
            <AutoLoginGuard>
                <Routes>
                    <Route path="/" element={
                        <Navigate to="/burndown" />
                    } />
                    <Route path="/burndown" element={
                        <AuthGuard>
                            <React.Suspense fallback={<LazyLoadingFallback />}>
                                <BurndownView />
                            </React.Suspense>
                        </AuthGuard>
                    } />
                    <Route path="/login" element={
                        <AlreadyLoggedInGuard>
                            <React.Suspense fallback={<LazyLoadingFallback />}>
                                <LoginView />
                            </React.Suspense>
                        </AlreadyLoggedInGuard>
                    } />
                </Routes>
            </AutoLoginGuard>
        </main>
    );
    //#endregion
};

export default App;
