import BaseLayout from '@/app/layouts/baseLayout';
import { createBrowserRouter } from 'react-router-dom'
import { PATHS } from '../config';
import ChatPage from '@/pages/chatPage';

export const router = () => createBrowserRouter([
    {
        element: <BaseLayout />,
        errorElement : <div />,
        children : [
            {
                path: PATHS.CHAT,
                element: <ChatPage />
            }
        ]
    }
])