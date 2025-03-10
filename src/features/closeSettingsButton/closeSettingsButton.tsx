import { IconButton } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";
import CloseIcon from '@mui/icons-material/Close';

export default function CloseSettingsButton() {
    const setOpen = useStore(settingsStore, (state) => state.setOpen);

    return (
        <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(false)}
            aria-label="close"
        >
            <CloseIcon />
        </IconButton>
    )
}