import { Slider, Typography } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function ContextMessagesSlider() {
    const formData = useStore(settingsStore, state => state.formData);
    const setFormData = useStore(settingsStore, state => state.setFormData);


    const handleSliderChange = (_: Event, value: number | number[]) => {
        if (typeof value === 'number') {
          setFormData({ ...formData, context_messages: value });
        }
      }

    return (
        <div>
            <Typography gutterBottom>Amount of messages chat must remember</Typography>
            <Slider
                value={formData?.context_messages as number}
                valueLabelDisplay="on"
                onChange={handleSliderChange}
                marks
            />
        </div>
    )
}