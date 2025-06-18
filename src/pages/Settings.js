import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, MenuItem } from '@mui/material';
import { useNotification } from '../NotificationProvider';

const editorOptions = [
  { label: 'Visual Studio Code', value: 'code' },
  { label: 'Sublime Text', value: 'subl' },
  { label: 'Notepad++', value: 'notepad++' },
  { label: 'Atom', value: 'atom' },
];

const Settings = () => {
  const [repoPath, setRepoPath] = useState('');
  const [validatorPath, setValidatorPath] = useState('');
  const [editor, setEditor] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    window.api.loadSettings().then((settings) => {
      setRepoPath(settings.repoPath || '');
      setValidatorPath(settings.validatorPath || '');
      setEditor(settings.editor || '');
    });
  }, []);

  const handleSelectRepoFolder = async () => {
    const selectedPath = await window.api.selectFolder();
    if (selectedPath) {
      setRepoPath(selectedPath);
    }
  };

  const handleSelectValidatorFile = async () => {
    const selectedPath = await window.api.selectFile();
    if (selectedPath) {
      setValidatorPath(selectedPath);
    }
  };

  const handleSave = async () => {
    const result = await window.api.saveSettings({ repoPath, validatorPath, editor });
    if (!result.success) {
      notify(`Error saving settings: ${result.error}`, 'error');
    }
    else {
      notify('Settings saved successfully!', 'success');
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
            <Button variant="outlined" onClick={handleSelectRepoFolder}>
              Browse...
            </Button>
          </Box>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1">Orca profile validator File</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField fullWidth value={validatorPath} disabled />
            <Button variant="outlined" onClick={handleSelectValidatorFile}>
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
