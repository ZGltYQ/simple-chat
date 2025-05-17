import { IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useStore } from "zustand";
import { topicsStore } from "../../app/store";

export default function DeleteTopicButton({ id} : {id: string}) {
    const setTopics = useStore(topicsStore, state => state.setTopics);
    const selected = useStore(topicsStore, state => state.selected);
    const setSelected = useStore(topicsStore, state => state.setSelected);

    const handleDeleteTopic = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        await window.ipcRenderer.invoke('deleteTopic', id);

        const topics = await window.ipcRenderer.invoke('getTopics');

        if (topics) {
            setTopics(topics);

            const updated = topics.find((t:any) => t?.id === selected?.id);

            if (updated) setSelected(updated);
        }
    }

    return (
        <IconButton sx={{ width: 30, height: 30 }} onClick={handleDeleteTopic}>
            <DeleteIcon sx={{ width: 20, height: 20 }} fontSize='small'/>
        </IconButton>
    )
}