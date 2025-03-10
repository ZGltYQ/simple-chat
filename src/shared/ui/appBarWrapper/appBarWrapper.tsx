import { styled } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const Bar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })<AppBarProps>(({ theme }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    textAlign: 'center',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          width: `calc(100% - ${220}px)`,
          marginLeft: `${220}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      },
    ],
}));


const AppToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between'
}))


export default function AppBar({ open, children }: { open: boolean, children: React.ReactNode }) {
    return (
      <Bar open={open}>
        <AppToolbar>
          {children}
        </AppToolbar>
      </Bar>
    )
}