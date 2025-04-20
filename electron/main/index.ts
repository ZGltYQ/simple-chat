import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import runMigration from '../db/migrations';
import { initLLMByConfig } from '../services/settings';
import LLModel from '../models/LLModel';
import Router from '../routers';

const client = createClient({ url: 'file:story' });
const db = drizzle(client);

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const APP_ROOT = path.join(__dirname, '..');

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null;

const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(APP_ROOT, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Assistant',
    icon: path.join(APP_ROOT, 'icons/256x256.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.setMenu(null);
    win.loadFile(indexHtml)
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    
    return { action: 'deny' }
  })
}

app.whenReady().then(async () => {
  await runMigration(db);

  Router(ipcMain);
  
  await createWindow();
  await initLLMByConfig();
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    LLModel.dispose().then(() => {
      if (win?.isMinimized()) win.restore();
      win?.focus();
    });
  }
});

let isQuitting = false; 

app.on('before-quit', async (event) => {
  if (isQuitting) return;
  
  event.preventDefault();
  isQuitting = true;

  try {
    await LLModel.dispose();

    app.quit();
  } catch (error) {
    app.quit(); 
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();

  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
});