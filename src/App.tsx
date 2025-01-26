import { useState, ChangeEvent, useRef, useEffect } from 'react'
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
import Settings from './components/Settings';
import OpenAI from "openai";

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

const AppToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between'
}))

function formatDate(date: Date) {
  const year = date.getFullYear(); // Get the year
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month with 0-padding
  const day = String(date.getDate()).padStart(2, '0'); // Get the day with 0-padding
  const hours = String(date.getHours()).padStart(2, '0'); // Get hours with 0-padding
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes with 0-padding
  const seconds = String(date.getSeconds()).padStart(2, '0'); // Get seconds with 0-padding

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function App() {
  const [ isOpen, setIsOpen ] = useState(true);
  const [ isProcessing, setIsProcessing ] = useState(false);
  const [ selectedTopic, setSelectedTopic ] = useState<Record<string, any>>();
  const [ messages, setMessages ] = useState<{ text: string, sender: 'User' | 'Ai', created: string }[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<{ value: string }>({ value: '' });
  const openai = useRef<OpenAI | null>(null);

  const handleSubmit = async () => {
    setIsProcessing(true)
    const input = inputRef.current?.value || '';
    inputRef.current.value = '';
    const created = formatDate(new Date());

    setMessages(prev => [
      ...prev,
      { text: input, sender: 'User', topic_id: selectedTopic?.id, created },
      { text: '', sender: 'Ai', topic_id: selectedTopic?.id, created }
    ]);

    await window.ipcRenderer.invoke('createMessage', { text: input, sender: 'User', topic_id: selectedTopic?.id, created });

    const stream = await (openai?.current?.chat.completions as any).create({
      model: "gpt-4o-mini",
      messages: [ 
        ...messages.map(message => ({
          "role": message?.sender === 'User' ? "user" : "assistant",
          "content": [
            {
              "type": "text",
              "text": message?.text
            }
          ]
        })),
        {
          "role": 'user',
          "content": [
            {
              "type": "text",
              "text": input
            }
          ]
        }
      ],
      stream: true
    }).catch((error: Error) => {
      setMessages(prev => {

        const updatedMessages = [ ...prev ];
        const lastMessageIndex = updatedMessages.length - 1;

        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          text: error?.message,
        };

        return updatedMessages;
      })

      setIsProcessing(false)
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

    await window.ipcRenderer.invoke('createMessage', { text: botMessage, sender: 'Ai', topic_id: selectedTopic?.id, created } );

    setIsProcessing(false)
  }

  const onSelect = async (id: number, topic: string) => {
    setSelectedTopic({ id, topic });
    const messages = await window.ipcRenderer.invoke('getMessages', id);

    setMessages(messages);
  }

  useEffect(() => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [ messagesRef, selectedTopic, messages ])

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.value = target.value;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event?.key === 'Enter' && !event.shiftKey && !isProcessing) handleSubmit();
  };

  return (
    <>
    <AppBar position="fixed" open={isOpen}>
        <AppToolbar>
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
              {selectedTopic?.topic}
            </Typography>
            <Settings openai={openai} />
        </AppToolbar>
      </AppBar>
        <Drawer
            onSelect = {onSelect}
            selected = {selectedTopic?.id}
            isOpen  = {isOpen}
            width   = {220}
            onClose = {() => setIsOpen(false)}
          />
        <Main open={isOpen}>
          <div
            ref={messagesRef}
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              padding: 20, 
              rowGap: 20, 
              flexGrow: 1, 
              overflowY: 'auto' 
            }
          }>
            {messages.map(({ text, sender, created }, index) => (
              <Message key={index} text={text} sender={sender} created={created} />
            ))}
          </div>
          {selectedTopic?.id ? (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <TextField 
                sx={{
                  maxWidth: '50%', 
                  minWidth: 200,
                  maxHeight: 200
                }}
                fullWidth 
                id="outlined-basic" 
                label="Enter message"
                disabled={isProcessing}
                inputRef={inputRef}
                multiline
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
          ) : null}
        </Main>
    </>
  )
}

export default App