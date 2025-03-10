import BaseLayout from '@/app/layouts/baseLayout';
import { createHashRouter } from 'react-router-dom'
import { PATHS } from '../config';
import ChatPage from '@/pages/chatPage';

export const router = () => createHashRouter([
    {
        path: PATHS.ROOT,
        element: <BaseLayout />,
        errorElement : <div />,
        children : [
            {
                index: true,
                element: <ChatPage />
            }
        ]
    }
])