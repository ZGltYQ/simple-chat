import AutoScrollWrapper from "@/shared/ui/autoScrollWrapper";
import ChatMessage from "@/shared/ui/chatMessage";
import { useStore } from "zustand";
import { chatStore, topicsStore } from "@/app/store";
import { useEffect } from "react";


export default function MessagesList({children}: {children?: React.ReactNode}) {
    const messages = useStore(chatStore, state => state.messages);
    const setMessages = useStore(chatStore, state => state.setMessages);
    const selected = useStore(topicsStore, state => state.selected);

    useEffect(() => {
        (async () => {
            const messages = await window.ipcRenderer.invoke('getMessages', selected?.id);
    
            setMessages(messages);
        })()
    }, [ selected ])
    
    return (
        <AutoScrollWrapper>
            {messages.map((message, index) => (
                <ChatMessage key={message.id || index} {...message}/>
            ))}
            {children}
        </AutoScrollWrapper>
    )
}