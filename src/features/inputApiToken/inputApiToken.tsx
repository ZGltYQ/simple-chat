import { TextField } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function InputApiToken() {
    const api_token = useStore(settingsStore, state => state.formData.api_token);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    return (
        <TextField
            fullWidth 
            id="outlined-basic" 
            label="API Token"
            onChange={({ target }) => setFormData({ api_token: target?.value })}
            value={api_token}
            variant="outlined"
        />
    )
}