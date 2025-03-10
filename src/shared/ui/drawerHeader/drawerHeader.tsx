import { styled } from "@mui/material";

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
}));

export default function DrawerHeader({ children }: { children: React.ReactNode }) {
    return (
        <Header>
            {children}
        </Header>
    )
}