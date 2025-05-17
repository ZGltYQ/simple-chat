import { Slider, Typography } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function ContextMessagesSlider() {
    const context_messages = useStore(settingsStore, state => state.formData.context_messages);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    const handleSliderChange = (_: Event, value: number | number[]) => {
        if (typeof value === 'number') {
          setFormData({ context_messages: value });
        }
    }

    return (
        <div>
            <Typography gutterBottom>Amount of messages chat must remember</Typography>
            <Slider
                value={context_messages as number}
                valueLabelDisplay="on"
                onChange={handleSliderChange}
                marks
            />
        </div>
    )
}