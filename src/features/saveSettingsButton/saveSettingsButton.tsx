import { Button } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";


export default function SaveSettingsButton() {
    const setOpen = useStore(settingsStore, (state) => state.setOpen);
    const formData = useStore(settingsStore, (state) => state.formData);

    const handleSave = async () => {
        await window.ipcRenderer.invoke('createSettings', formData);
        setOpen(false);
    }

    return (
        <Button autoFocus color="inherit" onClick={handleSave}>
            Save
        </Button>
    )
}