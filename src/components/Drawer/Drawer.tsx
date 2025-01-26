import { useEffect, useRef, useState, ChangeEvent } from 'react';
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
import TextField from '@mui/material/TextField';
import ListItemText from '@mui/material/ListItemText';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Box } from '@mui/material';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

interface DrawerProps { 
  selected: string | undefined, 
  onClose: () => void,
  onSelect: (id: number, name: string) => void, 
  isOpen: boolean, 
  width: number 
}

export default function Drawer({ onClose, onSelect, isOpen, selected, width } : DrawerProps) {
    const theme = useTheme();
    const [ topics, setTopics ] = useState<any[]>([]);
    const [ editingTopic, setEditingTopic ] = useState<Record<string, string | number>>({});
    const dropdownRef = useRef<any>(null);

    const fetchTopics = async () => {
      const topics = await window.ipcRenderer.invoke('getTopics');

      if (topics) {
        setTopics(topics);

        const updated = topics.find((t:any) => t?.id === selected)
        onSelect(updated?.id, updated?.title)
      }
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

    const onEditTopic = (id: number, title: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
  
      setEditingTopic({ id, title });
    }

    const onChangeTopic = ({ target }: ChangeEvent<HTMLInputElement>) => {
      setEditingTopic(prev => ({ ...prev, title: target?.value }))
    }

    const handleClickOutside = async (event: any) => {
      if (dropdownRef?.current && dropdownRef?.current?.contains(event.target)) return;

      if (editingTopic?.id) {
        await window.ipcRenderer.invoke('updateTopic', editingTopic)

        await fetchTopics()
      }

      setEditingTopic({});
    }

    const handleDelete = (id: number) => async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
  
      await window.ipcRenderer.invoke('deleteTopic', id);

      await fetchTopics();
    }

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event?.key === 'Enter') {
        if (editingTopic?.id) {
          await window.ipcRenderer.invoke('updateTopic', editingTopic)
  
          await fetchTopics()
        }
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ editingTopic ]);
  
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
                  onClick={() => onSelect(id, title)}
                >
                  <ListItemIcon>
                    <IconButton size="small" onClick={onEditTopic(id, title)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton size="small" onClick={handleDelete(id)}>
                      <DeleteIcon fontSize='small'/>
                    </IconButton>
                  </ListItemIcon>
                  {id === editingTopic?.id ? <TextField 
                    ref={dropdownRef}
                    value={editingTopic?.title}
                    onChange={onChangeTopic}
                    onKeyDown={handleKeyDown}
                    onClick={(event: React.MouseEvent) => event.stopPropagation()}
                    id="standard-basic" 
                    variant="standard" 
                  /> : 
                  <ListItemText primary={
                    <Box 
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                    >
                      {title}
                    </Box>
                  } 
                  />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DrawerComponent>
    );
}