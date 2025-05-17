import LLModel from "../models/LLModel";
import Setting from "../models/Setting";

export const initLLMByConfig = async () => {
  const [ response ] = await Setting.findWhere({ selected: 1 });

  if (response?.source === 'local' && response.model?.length) {
    return await LLModel.initLocalLLM({
      modelPath: response.model,
      gpuLayers: response.gpu_layers,
      context_size: response.context_size,
      batch_size: response.batch_size,
      threads: response.threads
    })
  };
  
  if (response?.api_token?.length && response?.source === 'openai') {
    return LLModel.initOpenAI({
      api_token: response?.api_token
    })
  }

  if (response?.api_token?.length && response?.source === 'deepseek') {
    return LLModel.initDeepSeek({
      api_token: response?.api_token
    })
  }
}

export const updateSettingsSource = async (_:any, source: string) => {
  return await Setting.switchSource(source);
}

export const getSettings = async () => {
  const [response] = await Setting.findWhere({ selected: 1 });

  if (response?.source !== 'local' && LLModel.state.llamaModel) await LLModel.dispose();

  return response || {}
}

export const createSettings = async (_:any, args: any) => {
    await Setting.updateAll({ selected: 0 });

    await Setting.delete({ source: args.source });

    const response = await Setting.create({ ...args, selected: 1 });

    await LLModel.dispose();

    await initLLMByConfig()

    return response
}