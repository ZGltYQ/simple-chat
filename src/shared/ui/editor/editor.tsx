import Editor from 'react-simple-code-editor';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';

interface EditorComponentProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  error?: string; // Made optional with ?
}

export default function EditorComponent({ value, onChange, label, error }: EditorComponentProps) {
  const highlightCode = (code: string) => {
    return (
      <SyntaxHighlighter
        language="javascript"
        style={atomDark}
        PreTag="div"
        showLineNumbers={false}
        customStyle={{
          margin: 0,
          padding: 0,
          background: 'transparent',
          fontSize: 'inherit',
          fontFamily: 'inherit',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography 
          variant="subtitle1" 
          component="label"
          sx={{ 
            display: 'block', 
            mb: 1,
            color: 'text.primary',
            fontWeight: 'medium'
          }}
        >
          {label}
        </Typography>
      )}
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={10}
        style={{
          fontFamily: '"Fira Code", monospace',
          fontSize: 14,
          backgroundColor: '#1e1e1e',
          minHeight: '300px',
          borderRadius: '4px',
          border: error ? '1px solid #d32f2f' : '1px solid rgba(255, 255, 255, 0.12)',
        }}
      />
      {error && (
        <Typography 
          variant="caption" 
          component="p"
          sx={{ 
            color: 'error.main',
            mt: 0.5,
            ml: 1
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}