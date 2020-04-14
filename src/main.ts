/* eslint global-require: "off" */

import {
  app, BrowserWindow, Menu, MenuItem, dialog, ipcMain,
} from 'electron';
import * as path from 'path';
import ZoneFileLoader from './ZoneFileLoader';

let mainWindow: Electron.BrowserWindow;

function openZone(): void {
  dialog.showOpenDialog({
    title: 'Open Zone File',
    filters: [
      {
        name: 'S3D Zone File',
        extensions: ['s3d'],
      },
    ],
  }).then(async (files) => {
    if (files.canceled) return;

    const scene = await ZoneFileLoader.load(files.filePaths[0]);

    mainWindow.webContents.send('load_zone', scene);
  });
}

function connectToDatabase(): void {

}

function createWindow(): void {
  const { screen } = require('electron');
  const display = screen.getAllDisplays()[0]; // secondary display DEBUG
  // screen.getPrimaryDisplay()
  const displayArea = display.workArea;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: displayArea.width * 0.8,
    height: displayArea.height * 0.8,
    x: displayArea.x + displayArea.width * 0.1,
    y: displayArea.y + displayArea.height * 0.1,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // DEBUG
  mainWindow.webContents.on('dom-ready', () => {
    ZoneFileLoader.load('C:\\Users\\amalk\\Documents\\Projects\\EQTools\\crushbone.s3d').then((scene) => {
      mainWindow.webContents.send('load_zone', scene);
    });
  });
  // END DEBUG

  const isMac = process.platform === 'darwin';

  const menuTemplate = [
    new MenuItem({
      label: 'File',
      submenu: [
        {
          label: 'Open Zone',
          click: () => openZone(),
        },
        {
          label: 'Connect to Database',
          click: () => connectToDatabase(),
        },
        {
          role: isMac ? 'close' : 'quit',
        },
      ],
    }),
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('request_objects', (event, zone: string) => {
  ZoneFileLoader.load(path.join(process.cwd(), `${zone.slice(0, zone.length - 4)}_obj.s3d`)).then((scene) => {
    mainWindow.webContents.send('load_objects', scene);
  });
});

ipcMain.on('request_spawns', (event, zone: string) => {
  
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.