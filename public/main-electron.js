const path = require("path");

const {app, BrowserWindow, dialog, ipcMain, Menu} = require("electron");
const isDev = require("electron-is-dev");

const isMac = process.platform === "darwin";

/**
 * @type {BrowserWindow|null}
 */
let mainWindow = null;

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension;
let REACT_DEVELOPER_TOOLS;

if (isDev) {
    const devTools = require("electron-devtools-installer");
    installExtension = devTools.default;
    REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
    app.quit();
}

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
    if (!isMac) {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

/**
 * Shows a modal dialog for the main window. Use this instead of window.confirm due to bugs on windows
 * and also it is more customizable.
 */
ipcMain.handle(
    "show-modal",
    /**
     * @param event {IpcMainInvokeEvent}
     * @param args {MessageBoxOptions}
     */
    async (event, args) => {
        return await dialog.showMessageBox(mainWindow, args);
    }
);

/**
 * Creates the main window when the Electron App is ready
 */
app.whenReady()
    .then(() => {
        mainWindow = createWindow();
    });

/**
 *
 * @return {BrowserWindow}
 */
function createWindow() {

    // Create the browser window.
    const win = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({requestHeaders: {Origin: "*", ...details.requestHeaders}});
    });
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                "Access-Control-Allow-Origin": ["*"],
                "Access-Control-Allow-Methods": ["*"],
                "Access-Control-Allow-Headers": ["*"],
                ...details.responseHeaders
            }
        });
    });

    if (isDev) {
        win.maximize();
        win.loadURL("http://localhost:3000");
        win.webContents.openDevTools();
        installExtension(REACT_DEVELOPER_TOOLS, {allowFileAccess: true})
            .then(name => console.log(`Added Extension:  ${name}`))
            .catch(error => console.log(`An error occurred: , ${error}`));
    }
    else {
        win.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);
    }


    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            role: "fileMenu",
            submenu: [
                isMac ? {role: "close"} : {role: "quit"}
            ]
        },
        {
            role: "viewMenu",
            submenu: [
                {role: "reload"},
                {role: "forceReload"},
                {role: "toggleDevTools"},
                {type: "separator"},
                {role: "resetZoom"},
                {role: "zoomIn"},
                {role: "zoomOut"},
                {type: "separator"},
                {role: "togglefullscreen"}
            ]
        },
        {
            role: "help",
            submenu: [
                {
                    label: "Usage instructions",
                    accelerator: "F1",
                    async click() {
                        const instructionsWindow = new BrowserWindow({
                            width: 720,
                            height: 540,
                            resizable: false,
                            maximizable: false,
                            webPreferences: {
                                nodeIntegration: false,
                                contextIsolation: true
                            }
                        });

                        await instructionsWindow.loadURL(`file://${path.join(__dirname, "/help/index.html")}`);
                        instructionsWindow.removeMenu();
                        instructionsWindow.show();
                    }
                },
                {
                    label: "About",
                    async click() {
                        await dialog.showMessageBox(win, {
                            type: "info",
                            title: "About",
                            message: "About this App",
                            detail: `Created by: Giancarlo Dalle Mole <giancarlo.dallemole1995@gmail.com>\nWhen: July 2022\nVersion: ${app.getVersion()}`,
                            buttons: ["ok"]
                        });
                    }
                }
            ]
        }
    ]));

    return win;
}
