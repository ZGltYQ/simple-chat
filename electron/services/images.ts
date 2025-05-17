import Image from "../models/Image";
import tesseract from 'node-tesseract-ocr'

export const createImage = async (_: any, args: any) => {
  const data = [];

  for (const arg of args) {
    try {
      const base64Data = arg.base64_image.replace(/^data:image\/\w+;base64,/, "");
  
      const buffer = Buffer.from(base64Data, "base64");
    
      const description = await tesseract.recognize(buffer, { lang: "eng", oem: 1, psm: 3, });
  
      arg.description = description;

      data.push(arg);
    } catch(_) {
      data.push(arg);
    }
  }

  const response = await Image.create(data);

  return response;
}

export const getImagesByMessage = async (_: any, message_id: number) => {
  const response = await Image.findWhere({ message_id });

  return response;
};

export const getImagesByTopic = async (_:any, topic_id: number) => {
  const response = await Image.findWhere({ topic_id });

  return response;
};