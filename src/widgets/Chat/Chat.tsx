import { useStore } from "zustand"
import { topicsStore, drawerStore } from "@/app/store"
import { IconButton, InputAdornment} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import InputChatField from "@/features/inputChatField";
import ChatWrapper from "@/shared/ui/chatWrapper"
import MessagesList from "@/features/messagesList";
import ImagesBlock from "@/features/imagesBlock";


export default function Chat() {
    const selected = useStore(topicsStore, state => state.selected);
    const open = useStore(drawerStore , state => state.open);


    return selected?.id ? (
      <ChatWrapper open={open}>
          <MessagesList/>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <ImagesBlock/>
            <InputChatField />
          </div>
      </ChatWrapper>
  ) : null
}