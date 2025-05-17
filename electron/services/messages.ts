import Message from "../models/Message";
import Image from "../models/Image";

export const createMessage = async (_: any, args: any) => {
    const response = await Message.create(args);
  
    return response
}

export const getMessages = async (_: any, topic_id: number) => {
    // Retrieve messages for the given topic_id
    const messages = await Message.findWhere({ topic_id });

    // Retrieve images for the given topic_id
    const images = await Image.findWhere({ topic_id });

    // Define the type for the accumulator object
    type ImagesByMessageId = {
        [key: number]: {
            id: number;
            topic_id: number;
            base64_image: string;
            message_id: number;
        }[];
    };

    // Group images by message_id
    const imagesByMessageId = images.reduce<ImagesByMessageId>((acc, image: any) => {
        if (!acc[image.message_id]) acc[image.message_id] = [];
        
        acc[image.message_id].push(image);

        return acc;
    }, {});

    // Combine messages with their related images
    const messagesWithImages = messages.map(message => ({
        ...message,
        images: imagesByMessageId[message.id] || []
    }));

    return messagesWithImages;
}