import { IconButton } from "@mui/material"
import SettingsIcon from '@mui/icons-material/Settings';
import { useStore } from "zustand";
import { settingsStore } from "@/app/store";

export default function OpenSettingsButton() {
    const setOpen = useStore(settingsStore, (state) => state.setOpen);

    return (
        <IconButton onClick={() => setOpen(true)}>
            <SettingsIcon />
        </IconButton>
    )
}