import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import {IData} from './renderer';
import { Manager, Server } from './zebra';

const manager = new Manager();
const server = new Server(manager);

/**
 * A global value to detect if app.quit() fired via tray.
 */
const quittingViaTray: boolean = false;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Global reference to main window.
let mainWindow: Electron.BrowserWindow;

function createMainWindow() {
  const window = new BrowserWindow({
    webPreferences: {nodeIntegration: true},
    title: 'zebra',
    width: 320,
    height: 480,
    fullscreenable: false,
    minimizable: false,
    resizable: false,
    autoHideMenuBar: true,
    // closable: false,
    // transparent: true,
    // frame: false,
  });

  window.loadFile(path.join(__dirname, '../app.html'));

  // Open devtools automatically on dev mode.
  if (isDevelopment) {
    window.webContents.openDevTools({mode: 'detach'});
  }

  window.on('close', (event) => {
    // Prevent the closing app directly, minimize to tray instead.
    if (!quittingViaTray) {
      event.preventDefault();
      window.hide();
    }
  });

  window.on('closed', () => {
    mainWindow = null;
  });

  return window;
}

app.on('ready', () => {
  mainWindow = createMainWindow();
});

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
