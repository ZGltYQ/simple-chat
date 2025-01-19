import React, { useState, useEffect, Ref } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import SettingsIcon from '@mui/icons-material/Settings';
import { TransitionProps } from '@mui/material/transitions';
import { TextField } from '@mui/material';
import OpenAI from 'openai';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog({ openai }: { openai: any }) {
  const [ open, setOpen ] = React.useState(false);
  const [ formData, setFormData ] = useState<Record<string, string>>({ api_token: '' }) 

  useEffect(() => {
    (async () => {
        const formData = await window.ipcRenderer.invoke('getSettings');

        openai.current = new OpenAI({ 
            dangerouslyAllowBrowser: true,
            apiKey: formData?.api_token 
        });
        
        setFormData(formData)
    })()
  }, [ open ])

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    console.log({ formData })
    await window.ipcRenderer.invoke('createSettings', formData);
    handleClose();
  }
  
  return (
    <React.Fragment>
      <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleOpen}
            edge="end"
        >
            <SettingsIcon />
        </IconButton>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Button autoFocus color="inherit" onClick={handleSave}>
              Save
            </Button>
          </Toolbar>
        </AppBar>
        <List sx={{ margin: 2 }}>
            <TextField
                fullWidth 
                id="outlined-basic" 
                label="OpenAI API Token"
                onChange={({ target }) => setFormData(prev => ({ ...prev, api_token: target?.value }))}
                value={formData?.api_token}
                variant="outlined"
            />
        </List>
      </Dialog>
    </React.Fragment>
  );
}