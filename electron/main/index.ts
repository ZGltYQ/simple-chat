import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import runMigration from '../db/migration';
import { topicsTable, messagesTable, settingsTable, imagesTable } from '../db/schema'

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

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    
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
    // Retrieve messages for the given topic_id
    const messages = await db.select().from(messagesTable).where(eq(messagesTable.topic_id, topic_id));

    // Retrieve images for the given topic_id
    const images = await db.select().from(imagesTable).where(eq(imagesTable.topic_id, topic_id));

    // Define the type for the accumulator object
    type ImagesByMessageId = {
      [key: number]: {
        id: number;
        topic_id: number;
        base64_image: string;
        message_id: number;
      }[];
    };

    // Group images by message_id
    const imagesByMessageId = images.reduce<ImagesByMessageId>((acc, image) => {
      if (!acc[image.message_id]) acc[image.message_id] = [];
      
      acc[image.message_id].push(image);

      return acc;
    }, {});

    // Combine messages with their related images
    const messagesWithImages = messages.map(message => ({
      ...message,
      images: imagesByMessageId[message.id] || []
    }));

    return messagesWithImages;
  })

  ipcMain.handle('createMessage', async (_, args) => {
    const response = await db.insert(messagesTable).values(args);

    const lastInsertRowid = Number(response.lastInsertRowid);

    const insertedMessage = await db.select().from(messagesTable).where(eq(messagesTable.id, lastInsertRowid));

    return insertedMessage[0];
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

  ipcMain.handle('createImage', async (_, args) => {
    const response = await db.insert(imagesTable).values(args);

    return response;
  });

  ipcMain.handle('getImagesByMessage', async (_, message_id) => {
    const response = await db.select().from(imagesTable).where(eq(imagesTable.message_id, message_id));

    return response;
  });

  ipcMain.handle('getImagesByTopic', async (_, topic_id) => {
    const response = await db.select().from(imagesTable).where(eq(imagesTable.topic_id, topic_id));

    return response;
  });
})();

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
});