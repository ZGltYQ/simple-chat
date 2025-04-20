import Topic from "../models/Topic";

export const createTopic = async (_: any, title: string) => {
  const response = await Topic.create({ title });

  return response
}

export const getTopics = async () => {
    const result = await Topic.findAll();
  
    return result;
}

export const deleteTopic = async (_:any, id: number) => {
    const response = await Topic.delete({id});
    
    return response
}

export const updateTopic = async (_:any, { id, ...args }: any) => {
    const response = await Topic.update(id, args);
    
    return response
}