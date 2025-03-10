import { IconButton } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import { useStore } from "zustand";
import { drawerStore } from "@/app/store";


export default function OpenDrawerButton() {
    const isOpen = useStore(drawerStore, (state) => state.open);
    const setIsOpen = useStore(drawerStore, (state) => state.setOpen);

    return (
        <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => !isOpen && setIsOpen(true)}
            edge="start"
            sx={[ { mr: 2 }, isOpen && { display: 'none' } ]}
        >
            <MenuIcon />
        </IconButton>
    )
}