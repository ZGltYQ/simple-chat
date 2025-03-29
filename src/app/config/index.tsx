

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