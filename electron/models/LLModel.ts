import { getLlama, LlamaChatSession, defineChatSessionFunction } from "node-llama-cpp";
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

    static initDeepSeek({ api_token, base_url = 'https://api.deepseek.com' }: { api_token: string, base_url?: string }) {
        return this.state.deepseek = new OpenAI({
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

    static async streamLocal({messages, functions}: { messages: { role: string, text: string }[], functions: any }, cb: Function) {
        LLModel.state.chatSession.setChatHistory(messages.slice(0, -1));

        const preparedFunctions: Record<string, any> = {};

        if (functions?.length) {
            for (const func of functions) {
                preparedFunctions[func?.name] = defineChatSessionFunction({
                    description: func?.description,
                    params : JSON.parse(func?.params) as any,
                    handler : new Function('params', func.handler) as (params: undefined) => Promise<any> | any
                });
            }
        }
    
        await LLModel.state.chatSession.prompt(messages.at(-1)?.text, {
            temperature: 0.15,
            onTextChunk: cb,
            stopOnAbortSignal: true,
            signal: this.controller.signal,
            functions: preparedFunctions
        });
    }

    static async streamAPI({ model, messages, functions }: { model: string, functions: any[], messages: { role: string, text: string }[] }, cb: (chunk: any) => void) {
        const requestBody: any = {
            model,
            messages,
            stream: true
        };

        const completions = this.state?.openai?.chat?.completions || this.state?.deepseek?.chat?.completions;

        const tools : Record<string, any>[] = [];
        const preparedFunctions: Record<string, any> = {};

        if (functions?.length) {
            for (const func of functions) {
                preparedFunctions[func?.name] = new Function('params', func.handler) as (params: undefined) => Promise<any> | any;

                tools.push({
                    type  : 'function',
                    function : {
                        name : func?.name,
                        description : func?.description,
                        parameters : JSON.parse(func?.params)
                    }
                })
            }

            requestBody.tools = tools;
        }

        const stream = await completions.create(requestBody, { signal: this.controller.signal });

        const preparedArgs : Record<string, any> = {};
        const finalMessages = [
            ...requestBody.messages, 
        ]

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.tool_calls?.length) {
                chunk.choices[0]?.delta?.tool_calls.forEach((call: any) => {
                    if (!preparedArgs[call?.index]) preparedArgs[call?.index] = call;

                    preparedArgs[call?.index] = {
                        ...preparedArgs[call?.index],
                        function: {
                            ...preparedArgs[call?.index]?.function,
                            arguments: preparedArgs[call?.index]?.function?.arguments + call?.function?.arguments
                        }
                    };
                })
            }

            cb(chunk);
        }

        const results = [];

        for (const index in preparedArgs) {
            const name = preparedArgs[index]?.function?.name;
            const args = preparedArgs[index]?.function?.arguments;

            const result = await preparedFunctions[name](JSON.parse(args));

            finalMessages.push({
                role: "assistant",
                content: null,
                tool_calls : Object.values(preparedArgs)
            })

            results.push({ "role": "tool", "name": name, "tool_call_id": preparedArgs[index]?.id, "content": result })
        }

        if (results?.length) {
            const finalStream = await completions.create({
                ...requestBody,
                messages : [
                    ...finalMessages,
                    ...results
                ]
            }, { signal: this.controller.signal });

            for await (const chunk of finalStream) {
                cb(chunk);
            }
        }
        

        return;
    }

    static stopStream() {
        this.controller.abort()

        this.controller = new AbortController();
    }

    static async dispose() {
        if (this.state.openai || this.state.deepseek) {
            this.state.openai = null;
            this.state.deepseek = null;
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