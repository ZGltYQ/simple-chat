import { IconButton, useTheme } from '@mui/material';
import { useStore } from 'zustand';
import { drawerStore } from '@/app/store';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function CloseDrawerButton() {
    const theme = useTheme();
    const setOpen = useStore(drawerStore, (state) => state.setOpen);

    return (
        <IconButton onClick={() => setOpen(false)}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
    )
}
