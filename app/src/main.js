"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        },
        title: 'zebra'
    });
    mainWindow.loadFile(path.join(__dirname, '../app.html'));
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
electron_1.app.on('ready', createWindow);
//# sourceMappingURL=main.js.map