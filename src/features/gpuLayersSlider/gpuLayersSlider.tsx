import { Slider, Typography } from "@mui/material";
import { useStore } from "zustand";
import { settingsStore } from "../../app/store";

export default function GPULayersSlider() {
    const gpu_layers = useStore(settingsStore, state => state.formData.gpu_layers);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    const handleSliderChange = (_: Event, value: number | number[]) => {
        if (typeof value === 'number') {
            setFormData({ gpu_layers: value });
        }
    }

    return (
        <div>
            <Typography gutterBottom>Amount of GPU layers</Typography>
            <Slider
                value={gpu_layers as number}
                valueLabelDisplay="on"
                onChange={handleSliderChange}
                marks
            />
        </div>
    )
}