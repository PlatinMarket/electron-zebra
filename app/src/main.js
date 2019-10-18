"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var zebra_1 = require("./zebra");
var server = new zebra_1.Server();
var manager = new zebra_1.Manager();
var mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
        },
        title: 'zebra',
    });
    mainWindow.loadFile(path.join(__dirname, '../app.html'));
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
electron_1.app.on('ready', createWindow);
manager.deviceList.then(function (devices) {
    console.log(devices);
});
//# sourceMappingURL=main.js.map