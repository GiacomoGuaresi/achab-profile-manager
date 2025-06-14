// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, MenuItem } from '@mui/material';

const { ipcRenderer } = window.require('electron');

const editorOptions = [
  { label: 'Visual Studio Code', value: 'code' },
  { label: 'Sublime Text', value: 'subl' },
  { label: 'Notepad++', value: 'notepad++' },
  { label: 'Atom', value: 'atom' },
];

const Settings = () => {
  const [repoPath, setRepoPath] = useState('');
  const [editor, setEditor] = useState('');

  useEffect(() => {
    ipcRenderer.invoke('load-settings').then((settings) => {
      if (settings) {
        setRepoPath(settings.repoPath || '');
        setEditor(settings.editor || '');
      }
    });
  }, []);

  const handleSelectFolder = async () => {
    const path = await ipcRenderer.invoke('select-repo-folder');
    if (path) setRepoPath(path);
  };

  const handleSave = () => {
    ipcRenderer.send('save-settings', { repoPath, editor });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1">Repository OrcaSlicer</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField fullWidth value={repoPath} disabled />
            <Button variant="outlined" onClick={handleSelectFolder}>
              Seleziona cartella
            </Button>
          </Box>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1">Editor di testo preferito</Typography>
          <TextField
            select
            fullWidth
            value={editor}
            onChange={(e) => setEditor(e.target.value)}
            sx={{ mt: 1 }}
          >
            {editorOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Button variant="contained" onClick={handleSave}>
          Salva impostazioni
        </Button>
      </Box>
    </Container>
  );
};

export default Settings;
