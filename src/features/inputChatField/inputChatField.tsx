import { useStore } from "zustand"
import { chatStore } from "@/app/store"
import { TextField } from "@mui/material";
import { ChangeEvent } from "react";

export default function InputChatField(props: any) {
    const setInput = useStore(chatStore, state => state.setInput);
    const input = useStore(chatStore, state => state.input);
    const setImages = useStore(chatStore, state => state.setImages);
    const images = useStore(chatStore, state => state.images);
    const isProcessing = useStore(chatStore, state => state.isProcessing);

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

    return (
      <TextField 
        sx={{
          maxWidth: '50%', 
          minWidth: 200,
          maxHeight: 200
        }}
        fullWidth 
        id="outlined-basic" 
        label="Enter message"
        disabled={isProcessing}
        multiline
        value={input}
        onChange={handleChange}
        onPaste={handlePaste}
        variant="outlined"
        {...props}
      />
    )
}