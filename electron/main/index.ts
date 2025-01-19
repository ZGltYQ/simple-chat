import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import runMigration from '../db/migration';
import { topicsTable, messagesTable, settingsTable } from '../db/schema'

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

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);

    return { action: 'deny' }
  })
}

app.whenReady().then(async () => {
  await runMigration(db);
  await createWindow();
})

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
  ipcMain.handle('getTopics', async () => {
    const result = await db.select().from(topicsTable);

    return result;
  })

  ipcMain.handle('getMessages', async (_, topic_id) => {
    const result = await db.select().from(messagesTable).where(eq(messagesTable.topic_id, topic_id))

    return result;
  })

  ipcMain.handle('createMessage', async (_, args) => {
    const response = await db.insert(messagesTable).values(args);

    return response
  })

  ipcMain.on('updateMessage', (_, message) => {
    console.log({ message })
  })

  ipcMain.handle('createTopic', async (_, title) => {
    const response = await db.insert(topicsTable).values({ title });

    return response
  })

  ipcMain.handle('deleteTopic', async (_, id) => {
    const response = await db.delete(topicsTable).where(eq(topicsTable?.id, id));

    return response
  })

  ipcMain.handle('updateTopic', async (_, { id, ...args }) => {
    const response = await db.update(topicsTable).set(args).where(eq(topicsTable.id, id));

    return response
  })

  ipcMain.handle('createSettings', async (_, args) => {
    await db.delete(settingsTable).where(eq(settingsTable?.id, 1));

    const response = await db.insert(settingsTable).values(args);

    return response
  })

  ipcMain.handle('getSettings', async () => {
    const response = await db.select().from(settingsTable).where(eq(settingsTable?.id, 1));

    return response[0]
  })

  ipcMain.on('deleteTopic', (_, message) => {
    console.log({ message })
  })
})();

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
});