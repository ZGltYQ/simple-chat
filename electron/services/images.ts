import Image from "../models/Image";

export const createImage = async (_: any, args: any) => {
  const response = await Image.create(args);

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