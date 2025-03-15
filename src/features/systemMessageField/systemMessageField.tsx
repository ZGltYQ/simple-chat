import { settingsStore } from "@/app/store";
import { TextField } from "@mui/material";
import { useStore } from "zustand";

export default function SystemMessageField() {
    const formData = useStore(settingsStore, state => state.formData);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    return (
        <TextField
          fullWidth
          id="system-message"
          label="System message"
          onChange={({ target }) => setFormData({ ...formData, system_message: target?.value })}
          value={formData?.system_message}
          multiline
          rows={6}
        />
    )
}