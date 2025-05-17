import { Slider, Typography } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function batchSizeSlider() {
    const batch_size = useStore(settingsStore, state => state.formData.batch_size);
    const setFormData = useStore(settingsStore, state => state.setFormData);


    const handleSliderChange = (_: Event, value: number | number[]) => {
        if (typeof value === 'number') {
          setFormData({ batch_size: value });
        }
    }

    return (
        <div>
            <Typography gutterBottom>Batch size</Typography>
            <Slider
                value={batch_size as number}
                valueLabelDisplay="on"
                step={64}
                max={1024}
                onChange={handleSliderChange}
                marks
            />
        </div>
    )
}