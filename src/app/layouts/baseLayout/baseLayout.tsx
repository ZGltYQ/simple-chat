import { useState, Suspense } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Outlet } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import SnackbarMessage from "@/features/snackbarMessage";
import { CssBaseline } from "@mui/material";


export default function BaseLayout() {
    const [ theme, setTheme ] = useState(createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
            background: {
                default: '#2C2C3A',
                paper: '#181B1D',
            },
            text: {
                primary: '#fff'
            },
        },
    }));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div>
                <Suspense fallback={<CircularProgress/>}>
                    <SnackbarMessage/>
                    <Outlet />
                </Suspense>
            </div>
        </ThemeProvider>
    )
}