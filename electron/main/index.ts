import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path, { resolve } from 'node:path'
import AsyncDB from './asyncDB'
import os from 'node:os'

const API = new AsyncDB('story');

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
const indexHtml = path.join(__dirname, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    webPreferences: {
      preload
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);

    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
});

(async () => {

  await API.init();

  await API.createTable('messages');
  await API.createTable('topics');

  ipcMain.handle('getTopics', async () => {
    const result = await API.selectRows('topics')

    return result;
  })

  ipcMain.handle('getMessages', async (_, topic_id) => {
    const result = await API.selectRows('messages', `WHERE topic_id=${topic_id}`);

    return result;
  })

  ipcMain.handle('createMessage', async (_, args) => {
    const response = await API.insertRow('messages', args);

    return response
  })

  ipcMain.on('updateMessage', (_, message) => {
    console.log({ message })
  })

  ipcMain.handle('createTopic', async (_, title) => {
    const response = await API.insertRow('topics', [ title ]);

    return response
  })

  ipcMain.on('deleteTopic', (_, message) => {
    console.log({ message })
  })

  ipcMain.on('logs', (_, message) => console.log(message))
})();

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
});