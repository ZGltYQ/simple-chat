import { useStore } from "zustand"
import { chatStore, settingsStore, topicsStore } from "@/app/store"
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { ChangeEvent, startTransition } from "react";
import { formatDate } from "@/app/utils";

export default function InputChatField(props: any) {
  const input = useStore(chatStore, s => s.input);
  const setInput = useStore(chatStore, s => s.setInput);
  const images = useStore(chatStore, s => s.images);
  const setImages = useStore(chatStore, s => s.setImages);
  const isProcessing = useStore(chatStore, s => s.isProcessing);
  const setIsProcessing = useStore(chatStore, s => s.setIsProcessing);
  const messages = useStore(chatStore, s => s.messages);
  const setMessages = useStore(chatStore, s => s.setMessages);

  const contextCount = useStore(settingsStore, s => s.formData?.context_messages);
  const model = useStore(settingsStore, s => s.formData?.model);
  const selected = useStore(topicsStore, s => s.selected);
  const openai = useStore(settingsStore, state => state.openaiInstance);

  const handlePaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();

        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Image = e.target?.result;

            if (typeof base64Image === 'string') setImages([ ...images, base64Image ]); // Set the image preview
          };

          reader.readAsDataURL(file);
        }
      }
    }
  };

    const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
      setInput(target?.value)
    };

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
        let lastUpdate: any = new Date();
    
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

          if (new Date() as any - lastUpdate > 500 || chunk.choices[0]?.finish_reason) {
            const updatedMessages = [
              ...messages,
              { text: message?.text, images: createdImages, sender: 'ME', topic_id: selected?.id, created },
              { text: botMessage, sender: 'AI', topic_id: selected?.id, created }
            ];
  
            startTransition(() => {
              setMessages(updatedMessages);
            })

            lastUpdate = new Date();
          }
        }
    
        await window.ipcRenderer.invoke('createMessage', { text: botMessage, sender: 'AI', topic_id: selected?.id, created } );
    
        setIsProcessing(false)
      } catch(error: any) {
        setIsProcessing(false)
      }
    }

    return (
      <TextField 
        sx={{ maxWidth: '50%' }}
        fullWidth 
        id="outlined-basic" 
        label="Enter message"
        disabled={isProcessing}
        multiline
        maxRows={10}
        value={input}
        onChange={handleChange}
        onPaste={handlePaste}
        variant="outlined"
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
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    )
}