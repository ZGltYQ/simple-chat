import ListItemButton from '@mui/material/ListItemButton';
import { useStore } from "zustand";
import { topicsStore } from "../../app/store";

export default function SelectTopicButton({ children, id, title } : { children: React.ReactNode, id: string, title: string }) {
    const selected = useStore(topicsStore, state => state.selected);
    const setSelect = useStore(topicsStore, state => state.setSelected);

    return (
        <ListItemButton
            selected = {selected?.id === id}
            onClick  = {() => setSelect({ id, title })}
        >
            {children}
        </ListItemButton>
    )
}