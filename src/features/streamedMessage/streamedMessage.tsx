import { useStore } from "zustand"
import { chatStore } from "@/app/store"
import ChatMessage from "@/shared/ui/chatMessage";

export default function StreamedMessage() {
    const streamedMessage = useStore(chatStore, state => state.streamedMessage);

    console.log({streamedMessage})

    return streamedMessage && <ChatMessage {...streamedMessage}/>
}