import LLModel from "../models/LLModel";
import { dialog } from "electron";


export const startCompletion = async (event: any, { model, messages, functions }: { model: string, functions: any, messages: { role: string, text: string }[] }) => {
    let botMessage = '';

    console.log({messages})

    if (LLModel.state.openai || LLModel.state.deepseek) {
        await LLModel.streamAPI({
            model,
            messages,
            functions
        }, (chunk) => {
            botMessage += (chunk.choices[0]?.delta?.content || '');
            event.sender.send('llm-chunk', { chunk: (chunk.choices[0]?.delta?.content || ''), complied: chunk.choices[0]?.finish_reason });
        });

        return botMessage;
    }

    if (LLModel.state.chatSession) {
        await LLModel.streamLocal({ messages, functions}, (chunk: string) => {
            botMessage += chunk;
            event.sender.send('llm-chunk', { chunk, complied: false });
        })
    
        event.sender.send('llm-chunk', { chunk: '', complied: true });

        return botMessage;
    }

    return 'Model is not selected';
}

export const stopCompletion = async (event: any) => {
    LLModel.stopStream();

    event.sender.send('llm-chunk', { chunk: '', complied: true });
}


export const uploadLocalModel = async () => {
    const result = await dialog.showOpenDialog({
        properties: [ "openFile" ],
        filters: [{ name: "GGUF Files", extensions: ["gguf"] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }

    return null;
};