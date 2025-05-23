import {MODELS} from '../config';
export function formatDate(date: Date) {
    const year = date.getFullYear(); // Get the year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month with 0-padding
    const day = String(date.getDate()).padStart(2, '0'); // Get the day with 0-padding
    const hours = String(date.getHours()).padStart(2, '0'); // Get hours with 0-padding
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes with 0-padding
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Get seconds with 0-padding
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatMessage = (message: any, source: string = MODELS.OPENAI) => {
  switch (source) {
    case MODELS.OPENAI:
      return {
        role: message.sender === 'ME' ? 'user' : 'assistant',
        content: [
          ...(message.images || []).map((image: any) => ({
            type: "image_url",
            image_url: { url: image?.base64_image }
          })),
          ...message.text?.length ? [{ type: "text", text: message.text }] : []
        ]
    };
    case MODELS.DEEPSEEK:
      return {
        role: message.sender === 'ME' ? 'user' : 'assistant',
        content: message.images?.length ? [ message.images.map((img: any) => img.description), message.text ].join('\n') : message.text
      };
    case MODELS.LOCAL:
      return {
        type: message.sender === 'ME' ? 'user' : 'model',
        ...message.sender === 'ME' ? { 
          text: message.images?.length ? [ message.images.map((img: any) => img.description), message.text ].join('\n') : message.text 
        } : { 
          response : [ message.text ] 
        }
      };
    default:
      return {
        role: message.sender === 'ME' ? 'user' : 'assistant',
        content: message.text
      };
  }
};

export const formatSystemMessage = (message: string, source: string = MODELS.OPENAI) => {
  if (!message?.length) return [];

  switch (source) {
    case MODELS.OPENAI:
      return [{
        role: 'system',
        content: message
      }];
    case MODELS.DEEPSEEK:
      return [{
        role: 'system',
        content: message
      }];
    case MODELS.LOCAL:
      return [{
        type: 'system',
        text: message
      }];
    default:
      return [{
        role: 'system', 
        content: message
      }];
  }
};