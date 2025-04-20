import { Button } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";
import { useState } from "react";


export default function SaveSettingsButton() {
    const setOpen = useStore(settingsStore, (state) => state.setOpen);
    const formData = useStore(settingsStore, (state) => state.formData);

    const [ loading, setLoading ] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);
            await window.ipcRenderer.invoke('createSettings', formData);
        
            setLoading(false);
            setOpen(false);
        } catch (error) {
            setLoading(false);
        }
    }

    return (
        <Button
            loading={loading}
            autoFocus 
            color="inherit" 
            onClick={handleSave}
        >
            Save
        </Button>
    )
}