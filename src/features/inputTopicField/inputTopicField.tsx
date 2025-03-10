import { ChangeEvent, useRef, useState, useEffect } from "react";
import { Box, ListItemText, TextField } from "@mui/material";
import { useStore } from "zustand";
import { topicsStore } from "../../app/store";

export default function InputTopicField({ id, title } : { id: string, title: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [topicTitle, setTopicTitle] = useState(title);
    const editingTopic = useStore(topicsStore, state => state.editingTopic);
    const setEditingTopic = useStore(topicsStore, state => state.setEditingTopic);
    const setTopics = useStore(topicsStore, state => state.setTopics);
    const selected = useStore(topicsStore, state => state.selected);
    const setSelected = useStore(topicsStore, state => state.setSelected);

    const fetchTopics = async () => {
        const topics = await window.ipcRenderer.invoke('getTopics');
  
        if (topics) {
          setTopics(topics);
  
          const updated = topics.find((t: any) => t?.id === selected?.id);

          if (updated) setSelected(updated);
        }
    };

    const handleClickOutside = async (event: any) => {
        if (!inputRef.current || inputRef.current.contains(event.target)) return;

        if (editingTopic) {
            await window.ipcRenderer.invoke('updateTopic', { id: editingTopic, title: topicTitle });
            await fetchTopics();
            setEditingTopic(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ editingTopic, topicTitle ]);
    
    const onChangeTopic = ({ target }: ChangeEvent<HTMLInputElement>) => {
        setTopicTitle(target.value);
    };

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (editingTopic && event.key === 'Enter') {
            await window.ipcRenderer.invoke('updateTopic', { id: editingTopic, title: topicTitle });
            await fetchTopics();
            setEditingTopic(null);
        }
    };

    return (
        <>
            {id === editingTopic ? (
                <TextField
                    inputRef  = {inputRef}
                    value     = {topicTitle}
                    onChange  = {onChangeTopic}
                    onKeyDown = {handleKeyDown}
                    onClick   = {(event: React.MouseEvent) => event.stopPropagation()}
                    id        = "standard-basic"
                    variant   = "standard"
                />
            ) : (
                <ListItemText
                    primary={
                        <Box
                            sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {title}
                        </Box>
                    }
                />
            )}
        </>
    );
}