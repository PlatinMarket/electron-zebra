import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import {IData} from './renderer';
import { Manager, Server } from './zebra';

const manager = new Manager();
const server = new Server(manager);

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
    title: 'zebra',
  });

  mainWindow.loadFile(path.join(__dirname, '../app.html'));

  mainWindow.webContents.openDevTools({mode: 'detach'});

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// When the renderer is ready execute the updateRenderer.
ipcMain.on('renderer.ready', () => updateRenderer());
ipcMain.on('device.set', (event: Electron.IpcMainEvent, index: number) => {
  manager.defaultDevice(index)
    .catch(console.log);
});

// Inform the renderer on any change on the manager.
manager.on('change', () => updateRenderer());

function updateRenderer() {
  manager.deviceList.then((devices) => {
    const index = manager.findDefaultDeviceIndex(devices);
    mainWindow.webContents.send('device.list', {selected: index, list: devices} as IData);
  });
}
