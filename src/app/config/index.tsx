

export const PATHS = {
  ROOT: '/',
}

export const DEFAULT_STYLES = {
    DRAWER_WIDTH: 220
}

export const MODELS = {
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
  LOCAL: 'local'
}

export const DEFAULT_SOURCES = [
  { value: MODELS.OPENAI, label: 'OpenAI' },
  { value: MODELS.DEEPSEEK, label: 'DeepSeek' },
  { value: MODELS.LOCAL, label: 'Local' }
]

export const DEFAULT_MODELS: Record<string, any[]> = {
  openai : [
      { "label": "O1", "value": "o1" },
      { "label": "O1 Preview", "value": "o1-preview" },
      { "label": "O1 Pro", "value": "o1-pro" },
      { "label": "O1 Mini", "value": "o1-mini" },
      { "label": "O3 Mini", "value": "o3-mini" },
      { "label": "GPT-4.5 Preview", "value": "gpt-4.5-preview" },
      { "label": "GPT-4o", "value": "gpt-4o" },
      { "label": "GPT-4o Mini", "value": "gpt-4o-mini" },
      { "label": "GPT-4 Turbo", "value": "gpt-4-turbo" },
      { "label": "GPT-4", "value": "gpt-4" },
      { "label": "GPT-3.5 Turbo", "value": "gpt-3.5-turbo" },
      { "label": "GPT-3.5 Turbo (0125)", "value": "gpt-3.5-turbo-0125" },
      { "label": "GPT-3.5 Turbo (1106)", "value": "gpt-3.5-turbo-1106" }
  ],
  deepseek: [
      { "label": "DeepSeek Chat", "value": "deepseek-chat" },
      { "label": "DeepSeek Reasoner", "value": "deepseek-reasoner" }
  ]
}