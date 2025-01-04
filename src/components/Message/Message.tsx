import { Avatar, Paper } from '@mui/material';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';

const MessageComponent = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    ...theme.typography.body2
}));

export default function Message({ text, sender } : { text: string, sender: string }) {
    return (
        <div style={{ display: 'flex', columnGap: 15, alignSelf: sender === 'User' ? 'flex-start' : 'flex-end' }}>
            {sender === 'User' && <Avatar>{sender}</Avatar>}
            <MessageComponent square>
                <ReactMarkdown
                    components={{
                    code(props) {
                    const {children, className, node, ...rest} = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                            style={dark}
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
            </MessageComponent>
            {sender !== 'User' && <Avatar>{sender}</Avatar>}
        </div>
    )
}