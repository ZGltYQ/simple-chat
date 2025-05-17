import { Slider, Typography } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function threadsSlider() {
    const threads = useStore(settingsStore, state => state.formData.threads);
    const setFormData = useStore(settingsStore, state => state.setFormData);


    const handleSliderChange = (_: Event, value: number | number[]) => {
        if (typeof value === 'number') {
          setFormData({ threads: value });
        }
      }

    return (
        <div>
            <Typography gutterBottom>Threads</Typography>
            <Slider
                value={threads as number}
                valueLabelDisplay="on"
                onChange={handleSliderChange}
                marks
            />
        </div>
    )
}