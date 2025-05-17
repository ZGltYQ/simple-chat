import { useStore } from "zustand";
import { chatStore, settingsStore, topicsStore, snackbarStore, functionsStore } from "@/app/store";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ChangeEvent } from "react";
import { formatDate, formatMessage, formatSystemMessage } from "@/app/utils";

export default function InputChatField(props: any) {
  const input = useStore(chatStore, s => s.input);
  const setInput = useStore(chatStore, s => s.setInput);
  const images = useStore(chatStore, s => s.images);
  const setImages = useStore(chatStore, s => s.setImages);
  const isProcessing = useStore(chatStore, s => s.isProcessing);
  const setIsProcessing = useStore(chatStore, s => s.setIsProcessing);
  const messages = useStore(chatStore, s => s.messages);
  const setMessages = useStore(chatStore, s => s.setMessages);
  const openSnackbar = useStore(snackbarStore, s => s.openSnackbar);

  const contextCount = useStore(settingsStore, s => s.formData?.context_messages);
  const systemMessage = useStore(settingsStore, s => s.formData?.system_message);
  const model = useStore(settingsStore, s => s.formData?.model);
  const selected = useStore(topicsStore, s => s.selected);
  const source = useStore(settingsStore, state => state.formData?.source);
  const functions = useStore(functionsStore, state => state.list);

  const handleAttachImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Image = e.target?.result;
            if (typeof base64Image === 'string') {
              setImages([...images, base64Image]); // Add the image to the images array
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData?.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Image = e.target?.result;
            if (typeof base64Image === 'string') setImages([...images, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setInput(target?.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event?.key === 'Enter' && !event.shiftKey && !isProcessing) handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setImages([]);
      setInput('');

      const created = formatDate(new Date());

      const message = await window.ipcRenderer.invoke('createMessage', { 
        text: input || '', 
        sender: 'ME', 
        topic_id: selected?.id, 
        created 
      });

      const createdImages: any = [];

      if (images?.length) {
        await window.ipcRenderer.invoke('createImage', images.map(image => ({
          base64_image: image,
          topic_id: selected?.id,
          message_id: message?.id
        })));

        const imgs = await window.ipcRenderer.invoke('getImagesByMessage', message?.id);

        createdImages.push(...imgs);
      }

      setMessages([
        ...messages,
        { ...message, images: createdImages }
      ]);

      const botResponse = await window.ipcRenderer.invoke('startCompletion', {
        model,
        functions : functions.filter(f => f.active), 
        messages : [
          ...formatSystemMessage(systemMessage, source),
          ...messages.slice(-contextCount).map(m => formatMessage(m, source)),
          formatMessage({
            sender: 'ME',
            images: createdImages,
            text: message?.text
          }, source)
        ]
      })

      const createdBotMessage = await window.ipcRenderer.invoke('createMessage', { text: botResponse, sender: 'AI', topic_id: selected?.id, created });

      setMessages([
        ...messages,
        { ...message, images: createdImages },
        { text: createdBotMessage?.text, sender: 'AI', topic_id: selected?.id, created }
      ]);

      return setIsProcessing(false);
    } catch (error: any) {
      setIsProcessing(false);

      openSnackbar({ open: true, message: error?.message });
    }
  };

  const handleStopStreaming = async () => {
    await window.ipcRenderer.invoke('stopCompletion');
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
          endAdornment: (
            <InputAdornment position="end" sx={{ display: 'flex', gap: '10px' }}>
              <IconButton
                aria-label="Attach image"
                component="label"
                edge="end"
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAttachImage}
                  multiple
                />
                <AttachFileIcon />
              </IconButton>
              {isProcessing ? (
                <IconButton
                  aria-label="Stop"
                  onClick={handleStopStreaming}
                  edge="end"
                >
                  <StopIcon />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="Send message"
                  onClick={handleSubmit}
                  edge="end"
                >
                  <SendIcon />
                </IconButton>
              )}
            </InputAdornment>
          )
        },
      }}
    />
  );
}