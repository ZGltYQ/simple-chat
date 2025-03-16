import Snackbar from '@mui/material/Snackbar';
import { useStore } from "zustand";
import { snackbarStore } from '@/app/store';
import Slide, { SlideProps } from '@mui/material/Slide';

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

export default function SnackbarMessage() {
    const open = useStore(snackbarStore, state => state.open);
    const message = useStore(snackbarStore, state => state.message);
    const setOpen = useStore(snackbarStore, state => state.openSnackbar);

    return (
        <Snackbar
            open={open}
            onClose={() => setOpen({ open: false, message: '' })}
            TransitionComponent={SlideTransition}
            message={message}
            key={message}
            autoHideDuration={4000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        />
    )
}