import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import * as log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { IData } from './renderer';
import { Manager, Server } from './zebra';

autoUpdater.logger = log;
log.info('App starting...');

const manager = new Manager();
const server = new Server(manager);

/**
 * A global value to detect if app.quit() fired via tray.
 */
let quittingViaTray: boolean = false;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Global reference to main window.
let mainWindow: Electron.BrowserWindow;
let mainTray: Tray;

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
    alwaysOnTop: true,
    icon: path.join(__dirname, '../assets/icon/window.png'),
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

function createMainTray() {
  const tray: Tray = new Tray(path.join(__dirname, '../assets/icon/tray.png'));

  const contextMenu: Menu = Menu.buildFromTemplate([
    {enabled: false, label: `v${app.getVersion()}`},
    {type: 'separator'},
    {label: 'Exit', click: () => {
      quittingViaTray = true;
      app.quit();
    }},
  ]);

  tray.setContextMenu(contextMenu);

  // On dblClick show-or-hide the main window.
  tray.on('double-click', () => {
    mainWindow.isVisible()
      ? mainWindow.hide()
      : mainWindow.show();
  });

  return tray;
}

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
  mainWindow = createMainWindow();
  mainTray = createMainTray();
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

autoUpdater.on('checking-for-update', () => {
  log.info('');
});

autoUpdater.on('update-available', (info) => {
  log.info('update-available' + info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('update-not-available' + info);
});

autoUpdater.on('error', (err) => {
  log.info('error ' + err);
});

autoUpdater.on('download-progress', () => {
  log.info('download-progress');
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('update-downloaded' + info);
});
