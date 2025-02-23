import { Avatar, Paper } from '@mui/material';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';

const MessageComponent = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    ...theme.typography.body2
}));

export default function Message({ text, sender, created, images } : { text: string, sender: string, created: string, images: any[] | null | undefined }) {
    return (
        <div style={{ display: 'flex', maxWidth: '100%', columnGap: 15, alignSelf: sender === 'User' ? 'flex-start' : 'flex-end' }}>
            {sender === 'User' && <Avatar>{sender}</Avatar>}
            <MessageComponent sx={{ display: 'flex', flexDirection: 'column', maxWidth: 'calc(100% - 70px)' }} square>
                <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 10 }}>
                    {images && images.map((image, index) => (
                        <img key={index} src={image.base64_image} alt="message" style={{ maxWidth: 200, objectFit: 'cover', marginBottom: 10 }} />
                    ))}
                </div>
                <ReactMarkdown
                    components={{
                        code(props: any) {
                        const {children, className, node, ...rest} = props;
                        const match = /language-(\w+)/.exec(className || '');
                        
                        return match ? (
                            <SyntaxHighlighter
                                {...rest}
                                PreTag="div"
                                customStyle={{
                                    maxWidth: `100%`,
                                }}
                                showLineNumbers
                                children={String(children).replace(/\n$/, '')}
                                language={match[1]}
                                style={dracula}
                            />
                        ) : (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        )
                        }
                    }}
                >
                    {text}
                </ReactMarkdown>
                <div style={{ fontSize: 10, alignSelf: sender === 'User' ? 'flex-start' : 'flex-end' }}>{created}</div>
            </MessageComponent>
            {sender !== 'User' && <Avatar>{sender}</Avatar>}
        </div>
    )
}