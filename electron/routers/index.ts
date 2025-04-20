import { messages, topics, images, llm, settings } from '../services';
export default function Router(ipcMain: any) {
    ipcMain.handle('getTopics', topics.getTopics)
    ipcMain.handle('createTopic', topics.createTopic)
    ipcMain.handle('deleteTopic', topics.deleteTopic)
    ipcMain.handle('updateTopic', topics.updateTopic)
    ipcMain.handle('getMessages', messages.getMessages)
    ipcMain.handle('createMessage', messages.createMessage);
    ipcMain.handle('getImagesByMessage', images.getImagesByMessage);
    ipcMain.handle('getImagesByTopic', images.getImagesByTopic);
    ipcMain.handle('createImage', images.createImage);
    ipcMain.handle('startCompletion', llm.startCompletion);
    ipcMain.handle('stopCompletion', llm.stopCompletion);
    ipcMain.handle('uploadLocalModel', llm.uploadLocalModel);
    ipcMain.handle('getSettings', settings.getSettings);
    ipcMain.handle('createSettings', settings.createSettings);
    ipcMain.handle('initLLMByConfig', settings.initLLMByConfig);
    ipcMain.handle('updateSettingsSource', settings.updateSettingsSource)
}