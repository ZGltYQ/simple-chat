import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { drizzle } from 'drizzle-orm/libsql';
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import { eq } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import runMigration from '../db/migration';
import { topicsTable, messagesTable, settingsTable, imagesTable } from '../db/schema'


let llamaModel: any = null;
let chatSession: LlamaChatSession | null = null;

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

  const [ response ] = await db.select().from(settingsTable).where(eq(settingsTable?.selected, 1));

  if (response?.source !== 'local') return;
  
  const llama = await getLlama();

  llamaModel = await llama.loadModel({
      modelPath: response.model,
      gpuLayers: response.gpu_layers
  });
  
  const context = await llamaModel.createContext({
    contextSize: response.context_size,
    batchSize: response.batch_size,
    threads: response.threads 
  });

  chatSession = new LlamaChatSession({ 
    contextSequence: context.getSequence()
  });
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    disposeModel().then(() => {
      if (win?.isMinimized()) win.restore();
      win?.focus();
    });
  }
});

async function disposeModel() {
  if (chatSession) {
    await chatSession.dispose({ disposeSequence: true });
    chatSession = null;
  }
  
  if (llamaModel) {
    await llamaModel.dispose();
    llamaModel = null;
  }

  // Force garbage collection (Electron specific)
  if (app.isPackaged) {
    global?.gc?.();
  }
}

app.on('before-quit', async (event) => {
  // Prevent immediate exit to allow async cleanup
  event.preventDefault();
  
  // Perform cleanup
  await disposeModel();
  
  // Now quit the app
  app.quit();
});


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

ipcMain.handle('initLocalModel', async () => {
  try {
    await disposeModel();

    const [ response ] = await db.select().from(settingsTable).where(eq(settingsTable?.selected, 1));

    const llama = await getLlama();

    llamaModel = await llama.loadModel({
      modelPath: response.model,
      gpuLayers: response.gpu_layers
    });
    
    const context = await llamaModel.createContext({
      contextSize: response.context_size,
      batchSize: response.batch_size,
      threads: response.threads 
    });

    chatSession = new LlamaChatSession({ 
      contextSequence: context.getSequence()
    });

    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('localCompletion', async (event, { messages }) => {
  if (!chatSession) throw new Error('Local model not initialized');

  chatSession.setChatHistory(messages.slice(0, -1));
  
  await chatSession.prompt(messages.at(-1).text, {
    onTextChunk: (chunk) => {
      event.sender.send('llm-chunk', { chunk, complied: false });
    },
    // signal: AbortSignal.timeout(30000) // Add timeout
  });

  return event.sender.send('llm-chunk', { chunk: '', complied: true });;
});

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

ipcMain.handle("uploadLocalModel", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: [ "openFile" ],
    filters: [{ name: "GGUF Files", extensions: ["gguf"] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
});


ipcMain.handle('createSettings', async (_, args) => {
  await db.update(settingsTable).set({ selected: 0 });
  await db.delete(settingsTable).where(eq(settingsTable?.source, args?.source));

  const response = await db.insert(settingsTable).values({ ...args, selected: 1 });

  return response
})

ipcMain.handle('updateSettingsSource', async (_, source) => {
  await db.update(settingsTable).set({ selected: 0 });
  
  return await db.update(settingsTable).set({ selected: 1 }).where(eq(settingsTable?.source, source));
})

ipcMain.handle('getSettings', async () => {
  const [response] = await db.select().from(settingsTable).where(eq(settingsTable?.selected, 1));

  if (response?.source !== 'local' && llamaModel) disposeModel();

  return response || {}
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

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
});