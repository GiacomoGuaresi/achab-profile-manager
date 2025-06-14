import React, { useState } from 'react';
import { Box, Container, Typography, Button, TextField, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';

const editorOptions = [
  { label: 'Visual Studio Code', value: 'code' },
  { label: 'Sublime Text', value: 'subl' },
  { label: 'Notepad++', value: 'notepad++' },
  { label: 'Atom', value: 'atom' },
];

const SettingsWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [hasCloned, setHasCloned] = useState(null); // null = not chosen, true/false = user choice
  const [repoPath, setRepoPath] = useState('');
  const [clonePath, setClonePath] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [editor, setEditor] = useState('');

  const handleSelectFolder = async () => {
    const selectedPath = await window.api.selectRepoFolder();
    if (selectedPath) setRepoPath(selectedPath);
  };

  const handleCloneRepo = async () => {
    if (!clonePath) return alert('Please select a folder to clone the repository.');
    setIsCloning(true);
    try {
      // Chiamata API per clonare il repo, passando clonePath
      await window.api.cloneRepo('https://github.com/SoftFever/OrcaSlicer', clonePath);
      setRepoPath(clonePath);
      alert('Repository cloned successfully!');
    } catch (err) {
      alert('Failed to clone repository: ' + err.message);
    }
    setIsCloning(false);
  };

  const handleNextFromStep1 = () => {
    if (hasCloned === null) {
      alert('Please choose an option.');
      return;
    }
    if (hasCloned) {
      if (!repoPath) {
        alert('Please select your existing OrcaSlicer repository path.');
        return;
      }
      setStep(2);
    } else {
      if (!clonePath) {
        alert('Please select a folder where to clone the repository.');
        return;
      }
      handleCloneRepo().then(() => setStep(2));
    }
  };

  const handleFinish = async () => {
    if (!editor) {
      alert('Please select your preferred text editor.');
      return;
    }
    try {
      await window.api.saveSettings({ repoPath, editor });
      alert('Settings saved successfully!');
      onComplete(repoPath);
    } catch {
      alert('Error saving settings.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      {step === 1 && (
        <>
          <Typography variant="h6" gutterBottom>OrcaSlicer Repository Setup</Typography>
          <Typography>Please confirm if you have already cloned the OrcaSlicer project:</Typography>
          <RadioGroup
            value={hasCloned === null ? '' : hasCloned ? 'yes' : 'no'}
            onChange={(e) => setHasCloned(e.target.value === 'yes')}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes, I already have it cloned" />
            <FormControlLabel value="no" control={<Radio />} label="No, please clone it for me" />
          </RadioGroup>

          {hasCloned === true && (
            <Box sx={{ mt: 2 }}>
              <Typography>Select your OrcaSlicer repository folder:</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField fullWidth value={repoPath} disabled />
                <Button variant="outlined" onClick={handleSelectFolder}>Browse...</Button>
              </Box>
            </Box>
          )}

          {hasCloned === false && (
            <Box sx={{ mt: 2 }}>
              <Typography>Select folder where to clone OrcaSlicer repository:</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  fullWidth
                  value={clonePath}
                  disabled
                  placeholder="Select folder"
                />
                <Button variant="outlined" onClick={async () => {
                  const selected = await window.api.selectFolder();
                  if (selected) setClonePath(selected);
                }}>Browse...</Button>
              </Box>
              {isCloning && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography>Cloning repository...</Typography>
                </Box>
              )}
            </Box>
          )}

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleNextFromStep1}
            disabled={isCloning}
          >
            Next
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <Typography variant="h6" gutterBottom>Preferred Text Editor</Typography>
          <Typography>Please select your preferred text editor to edit JSON files:</Typography>
          <TextField
            select
            fullWidth
            value={editor}
            onChange={(e) => setEditor(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          >
            {editorOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => setStep(1)}>Back</Button>
            <Button variant="contained" onClick={handleFinish}>Finish</Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default SettingsWizard;
