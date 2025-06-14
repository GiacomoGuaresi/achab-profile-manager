import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, MenuItem } from '@mui/material';

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
    window.api.loadSettings().then((settings) => {
      setRepoPath(settings.repoPath || '');
      setEditor(settings.editor || '');
    });
  }, []);

  const handleSelectFolder = async () => {
    const selectedPath = await window.api.selectRepoFolder();
    if (selectedPath) {
      setRepoPath(selectedPath);
    }
  };

  const handleSave = async () => {
    const result = await window.api.saveSettings({ repoPath, editor });
    if (!result.success) {
      alert('Error saving settings: ' + result.error);
    }
    else {
      alert('Settings saved successfully!');
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1">OrcaSlicer Folder</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField fullWidth value={repoPath} disabled />
            <Button variant="outlined" onClick={handleSelectFolder}>
              Browse...
            </Button>
          </Box>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1">Preferred Text Editor</Typography>
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
          Save Settings
        </Button>
      </Box>
    </Container>
  );
};

export default Settings;
