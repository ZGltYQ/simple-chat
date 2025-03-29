import { Slider, Typography } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function GPULayersSlider() {
    const context_size = useStore(settingsStore, state => state.formData.context_size);
    const setFormData = useStore(settingsStore, state => state.setFormData);


    const handleSliderChange = (_: Event, value: number | number[]) => {
        if (typeof value === 'number') {
          setFormData({ context_size: value });
        }
    }

    console.log({context_size})

    return (
        <div>
            <Typography gutterBottom>Context size</Typography>
            <Slider
                value={context_size as number}
                valueLabelDisplay="on"
                step={1024}
                onChange={handleSliderChange}
                max={32768}
                marks
            />
        </div>
    )
}