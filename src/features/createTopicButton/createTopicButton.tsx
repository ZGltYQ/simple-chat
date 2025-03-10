import { IconButton } from "@mui/material";
import { useStore } from "zustand";
import { topicsStore } from "../../app/store";
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function CreateTopicButton() {
    const setTopics = useStore(topicsStore, state => state.setTopics);
    const selected = useStore(topicsStore, state => state.selected);
    const setSelected = useStore(topicsStore, state => state.setSelected);
    
    const handleCrateTopic = async () => {
        await window.ipcRenderer.invoke('createTopic', 'New chat');

        const topics = await window.ipcRenderer.invoke('getTopics');

        if (topics) {
            setTopics(topics);

            const updated = topics.find((t:any) => t?.id === selected?.id);

            if (updated) setSelected(updated);
        }
    }

    return (
        <IconButton onClick={handleCrateTopic}>
            <AddBoxIcon />
        </IconButton>
    );
}