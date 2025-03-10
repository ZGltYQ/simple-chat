import { styled } from '@mui/material/styles';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{ open?: boolean }>(({ theme }) => ({
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -15,
    marginTop: 40,
    height: `calc(100vh - 40px)`,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    rowGap: 20,
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 205,
        },
      },
    ],
}));

export default function ChatWrapper({ open, children }: {open?: boolean, children: React.ReactNode}) {
    return (
        <Main open={open}>
            {children}
        </Main>
    )
}