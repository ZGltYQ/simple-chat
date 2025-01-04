import { useState, ChangeEvent, useEffect } from 'react'
import Drawer from './components/Drawer'
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { InputAdornment, TextField } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Message from './components/Message';
import { styled } from '@mui/material/styles';
import OpenAI from "openai";

const openai = new OpenAI({ 
  dangerouslyAllowBrowser: true,
  apiKey: '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' 
});


const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
  }>(({ theme }) => ({
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -15,
    marginTop: 70,
    height: `calc(100vh - 130px)`,
    display: 'flex',
    flexDirection: 'column',
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

  interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
  }

  const AppBar = styled(MuiAppBar, {
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

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [ input, setInput ] = useState('');
  const [ selectedTopic, setSelectedTopic ] = useState<string>();
  const [ messages, setMessages ] = useState<{ text: string, sender: 'User' | 'Ai' }[]>([]);

  const handleSubmit = async () => {
    setInput('');
    setMessages(prev => [
      ...prev,
      { text: input, sender: 'User', topic_id: selectedTopic },
      { text: '', sender: 'Ai', topic_id: selectedTopic }
    ]);

    await window.ipcRenderer.invoke('createMessage', { text: input, sender: 'User', topic_id: selectedTopic });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [ { role: "user", content: input } ],
      stream: true
    });

    let botMessage = '';

    for await (const chunk of stream) {
      botMessage += (chunk.choices[0]?.delta?.content || "");

      setMessages(prev => {

        const updatedMessages = [ ...prev ];
        const lastMessageIndex = updatedMessages.length - 1;

        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          text: updatedMessages[lastMessageIndex].text + (chunk.choices[0]?.delta?.content || ""),
        };

        return updatedMessages;
      })
    }

    await window.ipcRenderer.invoke('createMessage', { text: botMessage, sender: 'Ai', topic_id: selectedTopic } );
  }

  const onSelect = async (topic: string) => {
    setSelectedTopic(topic);
    const messages = await window.ipcRenderer.invoke('getMessages', topic);

    setMessages(messages);
  }

  useEffect(() => {
    window.ipcRenderer.send('save', messages)
  }, [ messages ])

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setInput(target?.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit()
    }
  };

  return (
    <>
    <AppBar position="fixed" open={isOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setIsOpen(true)}
            edge="start"
            sx={[
              {
                mr: 2,
              },
              isOpen && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Persistent drawer
          </Typography>
        </Toolbar>
      </AppBar>
        <Drawer
            onSelect = {onSelect}
            selected = {selectedTopic}
            isOpen  = {isOpen}
            width   = {220}
            onClose = {() => setIsOpen(false)}
          />
        <Main open={isOpen}>
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              paddingBottom: 20, 
              rowGap: 20, 
              flexGrow: 1, 
              overflowY: 'auto' 
            }
          }>
            {messages.map(({ text, sender }, index) => (
              <Message key={index} text={text} sender={sender}/>
            ))}
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <TextField 
              style={{ maxWidth: '50%' }} 
              fullWidth 
              id="outlined-basic" 
              label="Enter message" 
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              variant="outlined" 
              slotProps={{
                input: {
                  endAdornment : (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={'Send message'}
                        onClick={handleSubmit}
                        edge="end"
                      >
                        <SendIcon/>
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
        </Main>
    </>
  )
}

export default App