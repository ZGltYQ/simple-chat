import { TextField } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function InputApiToken() {
    const formData = useStore(settingsStore, state => state.formData);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    return (
        <TextField
            fullWidth 
            id="outlined-basic" 
            label="API Token"
            onChange={({ target }) => setFormData({ ...formData, api_token: target?.value })}
            value={formData?.api_token}
            variant="outlined"
        />
    )
}