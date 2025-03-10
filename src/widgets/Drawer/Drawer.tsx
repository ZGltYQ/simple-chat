import DrawerComponent from '@mui/material/Drawer';
import DrawerHeader from '@/shared/ui/drawerHeader';
import CreateTopicButton from '@/features/createTopicButton';
import CloseDrawerButton from '@/features/closeDrawerButton';
import SelectTopicButton from '@/features/selectTopicButton';
import EditTopicButton from '@/features/editTopicButton';
import DeleteTopicButton from '@/features/deleteTopicButton';
import InputTopicField from '@/features/inputTopicField';
import Divider from '@mui/material/Divider';
import { DEFAULT_STYLES } from '@/app/config';
import { useStore } from 'zustand';
import { drawerStore, topicsStore } from '@/app/store';
import { List, ListItem, ListItemIcon } from '@mui/material';
import { useEffect, useRef } from 'react';

export default function Drawer() {
    const open = useStore(drawerStore, state => state.open);
    const topics = useStore(topicsStore, state => state.topics);
    const setTopics = useStore(topicsStore, state => state.setTopics);

    const fetchTopics = async () => {
        const topics = await window.ipcRenderer.invoke('getTopics');

        if (topics) setTopics(topics)
    }

    useEffect(() => {
        fetchTopics();  
    }, [])

    return (
        <DrawerComponent
            sx={{
                width      : DEFAULT_STYLES?.DRAWER_WIDTH,
                flexShrink : 0,
                '& .MuiDrawer-paper': {
                    width     : DEFAULT_STYLES?.DRAWER_WIDTH,
                    boxSizing : 'border-box',
                },
            }}
            variant = "persistent"
            anchor  = "left"
            open    = {open}
        >
            <DrawerHeader>
                <CreateTopicButton />
                <CloseDrawerButton />
            </DrawerHeader>
            <Divider />
            <List>
                {topics.map(({id, title}) => (
                    <ListItem key={id}>
                        <SelectTopicButton id={id} title={title}>
                            <ListItemIcon>
                                <EditTopicButton id={id} />
                                <DeleteTopicButton id={id} />
                            </ListItemIcon>
                            <InputTopicField id={id} title={title}/>
                        </SelectTopicButton>
                    </ListItem>
                ))}
            </List>
        </DrawerComponent>
    )
}