import React from 'react';
import { Box } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Puoi scegliere altri temi

const FileViewer = ({ content, language = 'json' }) => {
  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto', backgroundColor: '#1e1e1e', p: 2, borderRadius: 1 }}>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: 'none',
          fontSize: '0.9rem',
          minHeight: '100%',
        }}
        wrapLongLines
      >
        {content}
      </SyntaxHighlighter>
    </Box>
  );
};

export default FileViewer;
