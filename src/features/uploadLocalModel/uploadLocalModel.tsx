import { InputAdornment, TextField, IconButton } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";
import FileUploadIcon from '@mui/icons-material/FileUpload';

export default function UploadLocalModel() {
    const model = useStore(settingsStore, (state) => state.formData.model);
    const setFormData = useStore(settingsStore, (state) => state.setFormData);

    const handleUpload = async () => {
        const result = await window.ipcRenderer.invoke('uploadLocalModel');

        setFormData({ model: result });
    };

    return (
        <TextField
            fullWidth
            disabled
            label = "GGUF Model"
            value = {model}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleUpload}>
                                <FileUploadIcon/>
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}