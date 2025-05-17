import { useEffect, useState, useTransition } from "react";
import ChatMessage from "@/shared/ui/chatMessage";

export default function StreamedMessage() {
    const [ _, startTransition ] = useTransition();
    const [ streamedMessage, setStreamedMessage ] = useState<string>('');

    useEffect(() => {
        window.ipcRenderer.on('llm-chunk', (event: any, { chunk, complied }: any) => {
            startTransition(() => {
                if (complied) setStreamedMessage('')
                else setStreamedMessage(prev => prev + chunk);
            })
        })

        return () => {
            window.ipcRenderer.removeAllListeners('llm-chunk');
        }
    }, [ ])

    return !!streamedMessage?.length ? <ChatMessage text={streamedMessage} sender="AI" /> : null
}