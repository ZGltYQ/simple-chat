import { useState, Suspense } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Outlet } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";


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
            <div>
                <Suspense fallback={<CircularProgress/>}>
                    <Outlet />
                </Suspense>
            </div>
        </ThemeProvider>
    )
}