import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

const CommitPanel = ({ onCommit }) => {
  const [message, setMessage] = useState('');

  const handleCommit = () => {
    if (message.trim()) {
      onCommit(message.trim());
      setMessage('');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1">Commit message</Typography>
      <TextField
        multiline
        minRows={3}
        maxRows={6}
        fullWidth
        placeholder="Describe your changes..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        variant="outlined"
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<SyncAltIcon />}
        onClick={handleCommit}
        disabled={!message.trim()}
        sx={{ alignSelf: 'flex-end' }}
      >
        Commit & Sync
      </Button>
    </Box>
  );
};

export default CommitPanel;
