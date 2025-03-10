import { useEffect, useState } from "react"
import { useStore } from "zustand"
import { chatStore, topicsStore, settingsStore, drawerStore } from "@/app/store"
import { IconButton, InputAdornment} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import OpenAI from "openai";
import ImagesWrapper from "@/shared/ui/imagesWrapper";
import InputChatField from "@/features/inputChatField";
import ChatWrapper from "@/shared/ui/chatWrapper"
import AutoScrollWrapper from "@/shared/ui/autoScrollWrapper"
import ChatMessage from "@/shared/ui/chatMessage"
import { formatDate } from "@/app/utils"


export default function Chat() {
    const selected = useStore(topicsStore, state => state.selected);
    const setInput = useStore(chatStore, state => state.setInput);
    const input = useStore(chatStore, state => state.input);
    const setImages = useStore(chatStore, state => state.setImages);
    const images = useStore(chatStore, state => state.images);
    const setIsProcessing = useStore(chatStore, state => state.setIsProcessing);
    const isProcessing = useStore(chatStore, state => state.isProcessing);
    const messages = useStore(chatStore, state => state.messages);
    const setMessages = useStore(chatStore, state => state.setMessages);
    const contextCount = useStore(settingsStore, state => state.formData?.context_messages);
    const model = useStore(settingsStore, state => state.formData?.model);
    const open = useStore(drawerStore , state => state.open);
    const openai = useStore(settingsStore, state => state.openaiInstance);

    useEffect(() => {
        (async () => {
            const messages = await window.ipcRenderer.invoke('getMessages', selected?.id);
    
            setMessages(messages);
        })()
    }, [ selected ])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event?.key === 'Enter' && !event.shiftKey && !isProcessing) handleSubmit();
    };
    
    const handleSubmit = async () => {
      try {
        setIsProcessing(true)
        setImages([]);
        setInput('');
    
        const created = formatDate(new Date());
    
        const message = await window.ipcRenderer.invoke('createMessage', { text: input || '', sender: 'ME', topic_id: selected?.id, created });
    
        const createdImages: any = [];

        let botMessage = '';
    
        if (images?.length) {
          await window.ipcRenderer.invoke('createImage', images.map(image => ({ 
            base64_image: image, 
            topic_id: selected?.id, 
            message_id: message?.id 
          })));
    
          const imgs = await window.ipcRenderer.invoke('getImagesByMessage', message?.id)
    
          createdImages.push(...imgs);
        }
    
        setMessages([
          ...messages,
          { text: message?.text, images: createdImages, sender: 'ME', topic_id: selected?.id, created },
          { text: botMessage, sender: 'AI', topic_id: selected?.id, created }
        ]);
    
        const stream = await (openai.chat.completions as any).create({
          model,
          messages: [ 
            ...messages.slice(messages?.length - contextCount, messages?.length).map(message => ({
              "role": message?.sender === 'ME' ? "user" : "assistant",
              "content": [
                ...(message?.images || []).map((image: any) => {
                  return {
                    "type": "image_url",
                    "image_url": {
                      "url": image?.base64_image
                    }
                  }
                }),
                {
                  "type": "text",
                  "text": message?.text
                }
              ]
            })),
            {
              "role": 'user',
              "content": [
                ...images.map(image => {
                  return {
                    "type": "image_url",
                    "image_url": {
                      "url": image
                    }
                  }
                }),
                {
                  "type": "text",
                  "text": message?.text
                }
              ]
            }
          ],
          stream: true
        });

        for await (const chunk of stream) {
          botMessage += (chunk.choices[0]?.delta?.content || "");
  
          const updatedMessages = [
            ...messages,
            { text: message?.text, images: createdImages, sender: 'ME', topic_id: selected?.id, created },
            { text: botMessage, sender: 'AI', topic_id: selected?.id, created }
          ];

          setMessages(updatedMessages)
        }
    
        await window.ipcRenderer.invoke('createMessage', { text: botMessage, sender: 'AI', topic_id: selected?.id, created } );
    
        setIsProcessing(false)
      } catch(error: any) {
        setIsProcessing(false)
      }
    }

    return selected?.id ? (
      <ChatWrapper open={open}>
          <AutoScrollWrapper>
              {messages.map((message, index) => (
                  <ChatMessage key={index} {...message}/>
              ))}
          </AutoScrollWrapper>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <ImagesWrapper images={images} />
            <InputChatField
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  endAdornment : (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={'Send message'}
                        onClick={handleSubmit}
                        edge="end"
                      >
                        <SendIcon/>
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
        </div>
      </ChatWrapper>
  ) : null
}