import AppBarWrapper from "@/shared/ui/appBarWrapper"
import { useStore } from "zustand"
import OpenDrawerButton from "@/features/openDrawerButton"
import { Typography } from "@mui/material"
import { drawerStore, topicsStore } from "@/app/store"

export default function AppBar({ children }: { children: React.ReactNode }) {
    const open = useStore(drawerStore, state => state.open);
    const selected = useStore(topicsStore, state => state.selected);

    return (
        <AppBarWrapper open={open}>
            <OpenDrawerButton />
            <Typography variant="h6" noWrap component="div">
              {selected?.title}
            </Typography>
            {children}
        </AppBarWrapper>
    )
}