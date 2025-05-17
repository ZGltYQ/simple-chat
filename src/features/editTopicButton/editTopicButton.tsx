import { IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { useStore } from "zustand";
import { topicsStore } from "../../app/store";


export default function EditTopicButton({ id } : { id: string }) {
    const setEditingTopic = useStore(topicsStore, state => state.setEditingTopic);

    const handleEditTopic = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    
        setEditingTopic(id);
    }

    return (
        <IconButton sx={{ width: 30, height: 30 }} onClick={handleEditTopic}>
            <EditIcon sx={{ width: 20, height: 20 }}  fontSize='small' />
        </IconButton>
    )
}