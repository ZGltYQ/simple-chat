import { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import DrawerComponent from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import AddBoxIcon from '@mui/icons-material/AddBox';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));


export default function Drawer({ onClose, onSelect, isOpen, selected, width } : { selected: string | undefined, onClose: () => void, onSelect: (name: string) => void, isOpen: boolean, width: number }) {
    const theme = useTheme();
    const [ topics, setTopics ] = useState([]);

    const fetchTopics = async () => {
      const topics = await window.ipcRenderer.invoke('getTopics');

      if (topics) setTopics(topics);
    }

    const onCreateTopic = async () => {
      await window.ipcRenderer.invoke('createTopic', 'New chat');

      await fetchTopics();
    }

    useEffect(() => {
      (async () => {
        await fetchTopics();
      })()
    }, [])
  
    return (
        <DrawerComponent
          sx={{
            width,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width,
              boxSizing: 'border-box',
            },
          }}
          variant = "persistent"
          anchor  = "left"
          open    = {isOpen}
        >
          <DrawerHeader>
            <IconButton onClick={onCreateTopic}>
              <AddBoxIcon/>
            </IconButton>
            <IconButton onClick={onClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {topics.map(({ id, title }) => (
              <ListItem key={id} disablePadding>
                <ListItemButton
                  selected = {selected === id}
                  onClick={() => onSelect(id)}
                >
                  <ListItemIcon>
                    <MailIcon />
                  </ListItemIcon>
                  <ListItemText primary={title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DrawerComponent>
    );
}