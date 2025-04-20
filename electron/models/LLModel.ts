import { getLlama, LlamaChatSession } from "node-llama-cpp";
import OpenAI from "openai";


export default class LLModel {
    static state: Record<string, any> = {}
    static controller = new AbortController();

    static initOpenAI({ api_token, base_url = 'https://api.openai.com/v1' }: { api_token: string, base_url?: string }) {
        return this.state.openai = new OpenAI({
            dangerouslyAllowBrowser: true,
            baseURL: base_url,
            apiKey: api_token
        });
    }
    
    static async initLocalLLM({
        modelPath, 
        gpuLayers,
        context_size,
        batch_size,
        threads
    }: {
        modelPath: string,
        gpuLayers: number,
        context_size: number,
        batch_size: number,
        threads: number
    }) {
        const llama = await getLlama();

        this.state.llamaModel = await llama.loadModel({
            modelPath,
            gpuLayers
        });

        const context = await this.state.llamaModel.createContext({
            contextSize: context_size,
            batchSize: batch_size,
            threads: threads 
        })

        return this.state.chatSession = new LlamaChatSession({ 
            contextSequence: context.getSequence()
        });
    }

    static async streamLocal(messages: { role: string, text: string }[], cb: Function) {
        LLModel.state.chatSession.setChatHistory(messages.slice(0, -1));
    
        await LLModel.state.chatSession.prompt(messages.at(-1)?.text, {
            temperature: 0.15,
            onTextChunk: cb,
            stopOnAbortSignal: true,
            signal: this.controller.signal,
        });
    }

    static async streamAPI({ model, messages }: { model: string, messages: { role: string, text: string }[] }) {
        return await (this.state.openai.chat.completions as any).create({
            model,
            messages,
            stream: true
        }, { signal: this.controller.signal })
    }

    static stopStream() {
        this.controller.abort()

        this.controller = new AbortController();
    }

    static async dispose() {
        if (this.state.openai) {
            this.state.openai = null;
        }
    
        if (this.state.chatSession) {
            await this.state.chatSession.dispose({ disposeSequence: true });
            this.state.chatSession = null;
        }
        
        if (this.state.llamaModel) {
            await this.state.llamaModel.dispose();
            this.state.llamaModel = null;
        }

        return global?.gc?.();
    }
}