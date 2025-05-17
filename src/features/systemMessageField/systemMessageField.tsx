import { settingsStore } from "@/app/store";
import { TextField } from "@mui/material";
import { useStore } from "zustand";

export default function SystemMessageField() {
    const system_message = useStore(settingsStore, state => state.formData.system_message);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    return (
        <TextField
          fullWidth
          id="system-message"
          label="System message"
          onChange={({ target }) => setFormData({ system_message: target?.value })}
          value={system_message}
          multiline
          rows={6}
        />
    )
}