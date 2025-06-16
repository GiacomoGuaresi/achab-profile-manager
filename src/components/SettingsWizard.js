import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Paper,
  Select,
  MenuItem,
} from '@mui/material';
import logo from '../assets/logo.svg';

const editorOptions = [
  { label: 'Visual Studio Code', value: 'code' },
  { label: 'Sublime Text', value: 'subl' },
  { label: 'Notepad++', value: 'notepad++' },
  { label: 'Atom', value: 'atom' },
];

const SettingsWizard = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [hasCloned, setHasCloned] = useState(null); // null = not chosen, true/false = user choice
  const [repoPath, setRepoPath] = useState('');
  const [clonePath, setClonePath] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [editor, setEditor] = useState('');

  const handleSelectFolder = async () => {
    const selectedPath = await window.api.selectRepoFolder();
    if (selectedPath) setRepoPath(selectedPath);
  };

  const handleSelectCloneFolder = async () => {
    const selected = await window.api.selectFolder();
    if (selected) setClonePath(selected);
  };

  const handleCloneRepo = async () => {
    if (!clonePath) return alert('Please select a folder to clone the repository.');
    setIsCloning(true);
    try {
      await window.api.cloneRepo('https://github.com/SoftFever/OrcaSlicer', clonePath);
      setRepoPath(clonePath);
      setStep(4); // salto al passo editor
    } catch (err) {
      alert('Failed to clone repository: ' + err.message);
      setStep(2); // torno alla selezione percorso
    }
    setIsCloning(false);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (hasCloned === null) {
        alert('Please choose an option.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (hasCloned) {
        if (!repoPath) {
          alert('Please select your existing OrcaSlicer repository path.');
          return;
        }
        setStep(4); // salto il clone e vado all'editor
      } else {
        if (!clonePath) {
          alert('Please select a folder where to clone the repository.');
          return;
        }
        setStep(3); // passo a clonare
        handleCloneRepo();
      }
    } else if (step === 4) {
      if (!editor) {
        alert('Please select your preferred text editor.');
        return;
      }
      handleFinish();
    }
  };

  const handleBackStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
      setIsCloning(false);
    } else if (step === 4) {
      setStep(2);
    }
  };

  const handleFinish = async () => {
    try {
      await window.api.saveSettings({ repoPath, editor });
      alert('Settings saved successfully!');
      onComplete(repoPath);
    } catch {
      alert('Error saving settings.');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.5)',
        zIndex: 1300, // sopra navbar e tutto
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: 800,
          maxWidth: '100%',
          p: 3,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
        }}
        elevation={10}
      >
        {step === 0 && (
          <Box sx={{ textAlign: 'center', px: 3 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
              Welcome to
            </Typography>
            <Box component="img" src={logo} alt="Editor Logo" sx={{ height: 100 }} />
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
              Achab Profile Manager
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Configure your OrcaSlicer profiles with ease.
            </Typography>
            <Button variant="contained" size="medium" onClick={() => setStep(1)}>
              Start Setup
            </Button>
          </Box>
        )}


        {step === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              OrcaSlicer Repository Setup
            </Typography>
            <Typography>Please confirm if you have already cloned the OrcaSlicer project:</Typography>
            <RadioGroup
              value={hasCloned === null ? '' : hasCloned ? 'yes' : 'no'}
              onChange={(e) => setHasCloned(e.target.value === 'yes')}
              sx={{ mt: 2 }}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes, I already have it cloned" />
              <FormControlLabel value="no" control={<Radio />} label="No, please clone it for me" />
            </RadioGroup>
          </>
        )}

        {step === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Folder
            </Typography>
            {hasCloned ? (
              <>
                <Typography>Select your OrcaSlicer repository folder:</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField fullWidth value={repoPath} disabled />
                  <Button variant="outlined" onClick={handleSelectFolder}>
                    Browse...
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography>Select folder where to clone OrcaSlicer repository:</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField fullWidth value={clonePath} disabled placeholder="Select folder" />
                  <Button variant="outlined" onClick={handleSelectCloneFolder}>
                    Browse...
                  </Button>
                </Box>
              </>
            )}
          </>
        )}

        {step === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Cloning repository...</Typography>
          </Box>
        )}

        {step === 4 && (
          <>
            <Typography variant="h6" gutterBottom>
              Preferred Text Editor
            </Typography>
            <Typography>Please select your preferred text editor to edit JSON files:</Typography>
            <Select
              fullWidth
              value={editor}
              onChange={(e) => setEditor(e.target.value)}
              displayEmpty
              sx={{ mt: 2 }}
              renderValue={(selected) => (selected ? editorOptions.find((o) => o.value === selected)?.label : 'Select editor')}
            >
              <MenuItem disabled value="">
                Select editor
              </MenuItem>
              {editorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {step > 1 && (
            <Button variant="outlined" onClick={handleBackStep}>
              Back
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {step > 0 && step < 4 && (
            <Button variant="contained" onClick={handleNextStep} disabled={isCloning}>
              Next
            </Button>
          )}
          {step === 4 && (
            <Button variant="contained" onClick={handleNextStep}>
              Finish
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsWizard;
