import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function CustomSelect({ label, value, onChange, options }: { label: string, value: any, onChange: any, options: any }) {
    return (
        <FormControl fullWidth>
            <InputLabel id = "custom-select-label">{label}</InputLabel>
            <Select
                labelId  = "custom-select-label"
                id       = "custom-select"
                value    = {value}
                label    = {label}
                onChange = {onChange}
            >   
                {options.map(({ value, label }: any) => (
                    <MenuItem key={label} value={value}>{label}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}