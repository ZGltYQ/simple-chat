import { useEffect, useState, useTransition } from "react";
import ChatMessage from "@/shared/ui/chatMessage";
import { useStore } from "zustand";
import { topicsStore } from "@/app/store";

export default function StreamedMessage() {
    const [ _, startTransition ] = useTransition();
    const selected = useStore(topicsStore, state => state.selected);
    const [ streamedMessage, setStreamedMessage ] = useState<Record<string, string>>({});

    useEffect(() => {
        window.ipcRenderer.on('llm-chunk', (event: any, { chunk, complied, topic }: any) => {
            startTransition(() => {
                console.log({topic})
                if (complied) setStreamedMessage({ [topic]: '' });
                else setStreamedMessage(prev => ({
                    ...prev,
                    [topic]: (prev?.[topic] || '') + chunk
                }));
            })
        })

        return () => {
            window.ipcRenderer.removeAllListeners('llm-chunk');
        }
    }, [ ])

    return !!streamedMessage[selected?.id]?.length ? <ChatMessage text={streamedMessage[selected?.id]} sender="AI" /> : null
}