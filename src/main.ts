import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { manager, server } from './zebra';

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
