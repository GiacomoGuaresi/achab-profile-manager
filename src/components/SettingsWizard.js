import React, { useState, useEffect } from 'react';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import logoUrl from '../assets/logo.svg';
import { useNotification } from '../NotificationProvider';

const editorOptions = [
  { label: 'Visual Studio Code', value: 'code' },
  { label: 'Sublime Text', value: 'subl' },
  { label: 'Notepad++', value: 'notepad++' },
  { label: 'Atom', value: 'atom' },
];

const SettingsWizard = ({ onComplete }) => {
  // Step enumeration:
  // 0: Welcome
  // 1: Git check (auto)
  // 2: Confirm if repo already cloned
  // 3: Select folder (repo path or clone folder)
  // 4: Cloning in progress
  // 5: Choose editor
  // 6: Confirm if validator already downloaded
  // 7: Downloading validator
  // 8: Finish
  const { notify } = useNotification();

  const [step, setStep] = useState(0);
  const [hasCloned, setHasCloned] = useState(null); // null = not chosen, true/false user choice
  const [hasDownloaded, setHasDownloaded] = useState(null); // null = not chosen, true/false user choice
  const [repoPath, setRepoPath] = useState('');
  const [validatorPath, setValidatorPath] = useState('');
  const [clonePath, setClonePath] = useState('');
  const [forkUrl, setForkUrl] = useState('');
  const [downloadPath, setDownloadPath] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editor, setEditor] = useState('');
  const [gitAvailable, setGitAvailable] = useState(null); // null = not checked, true/false result
  const [gitCheckError, setGitCheckError] = useState(null); // string error message if any

  useEffect(() => {
    if (step === 1) {
      const checkGit = async () => {
        try {
          const result = await window.api.checkGit();

          if (!result.installed) {
            setGitAvailable(false);
            setGitCheckError(
              'Git is not installed or not found in PATH.\nPlease install Git and restart the application.'
            );
          } else if (!result.loggedIn) {
            setGitAvailable(false);
            setGitCheckError(
              'Git is installed, but no user is configured.\nPlease set your Git user name and email with:\n' +
              'git config --global user.name "Your Name"\n' +
              'git config --global user.email "you@example.com"'
            );
          } else {
            setGitAvailable(true);
            setGitCheckError(null);
          }
        } catch (err) {
          setGitAvailable(false);
          setGitCheckError('Error while checking Git: ' + err.message);
        }
      };

      checkGit();
    }
  }, [step]);


  const handleSelectRepoFolder = async () => {
    const selectedPath = await window.api.selectFolder();
    if (selectedPath) setRepoPath(selectedPath);
  };

  const handleSelectDownloadFolder = async () => {
    const selectedPath = await window.api.selectFolder();
    if (selectedPath) setDownloadPath(selectedPath);
  };

  const handleSelectCloneRepoFolder = async () => {
    const selected = await window.api.selectFolder();
    if (selected) setClonePath(selected);
  };

  const handelselectValidatorFile = async () => {
    const selected = await window.api.selectFile();
    if (selected) setValidatorPath(selected);
  };

  const handleSelectEditorFile = async () => {
    const selected = await window.api.selectFile();
    if (selected) setEditor(selected);
  };

  const handleCloneRepo = async () => {
    if (!forkUrl || !forkUrl.includes('github.com')) {
      notify('Please provide a valid GitHub repository URL.', 'error');
      return;
    }

    if (!clonePath) {
      notify('Please select a folder to clone the repository.', 'error');
      return;
    }

    setIsCloning(true);

    try {
      await window.api.cloneRepo(forkUrl, clonePath);

      // ricava nome repo da URL
      const repoName = forkUrl.split('/').pop()?.replace(/\.git$/, '') || 'repository';
      const clonedRepoPath = `${clonePath}/${repoName}`;

      setRepoPath(clonedRepoPath);
      setStep(5); // vai allo step editor dopo clone
    } catch (err) {
      notify('Failed to clone repository: ' + err.message, 'error');
      setStep(3);
    }

    setIsCloning(false);
  };

  const handleDownloadValidator = async () => {
    if (!downloadPath) {
      notify('Please select a folder to download the Orca profile validator.', 'error');
      return;
    }
    setIsDownloading(true);
    try {
      const result = await window.api.downloadValidator(downloadPath);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      setValidatorPath(result.path)
      setStep(8);
    } catch (err) {
      notify('Failed to download Orca profile validator: ' + err.message, 'error');
      setStep(6); // torno a selezionare cartella download/validator
    }
    setIsDownloading(false);
  };


  const handleNextStep = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (hasCloned === null) {
        notify('Please choose an option.', 'error');
        return;
      }
      if (hasCloned) {
        if (!repoPath) {
          notify('Please select your existing OrcaSlicer repository path.', 'error');
          return;
        }
        setStep(5); // salto clone e vado a editor
      } else {
        if (!clonePath) {
          notify('Please select a folder where to clone the repository.', 'error');
          return;
        }
        setStep(4); // passo a clonare (cloning)
        handleCloneRepo();
      }
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      if (hasDownloaded === null) {
        notify('Please choose an option.', 'error');
        return;
      }
      if (hasDownloaded) {
        if (!validatorPath) {
          notify('Please select your existing Orca profile validator path.', 'error');
          return;
        }
        setStep(8); // passo a finire (Finish)
      } else {
        if (!downloadPath) {
          notify('Please select a folder where to download the Orca profile validator.', 'error');
          return;
        }
        setStep(7); // passo a scaricare (Downloading)
        handleDownloadValidator();
      }
    } else if (step === 8) {
      handleFinish();
    }
  };

  const handleBackStep = () => {
    if (step === 1) {
      setStep(0);
    } else if (step === 2) {
      setStep(1);
      setHasCloned(null);
      setRepoPath('');
      setClonePath('');
    } else if (step === 4) {
      setStep(2);
      setIsCloning(false);
    } else if (step === 5) {
      setStep(2);
    } else if (step === 6) {
      setStep(5);
      setDownloadPath('');
    } else if (step === 8) {
      setStep(6);
      setHasDownloaded(null);
      setValidatorPath('');
      setIsDownloading(false);
    }

  };

  const handleFinish = async () => {
    try {
      await window.api.saveSettings({ repoPath, validatorPath, editor });
      notify('Settings saved successfully!', 'success');
      onComplete(repoPath);
    } catch {
      notify('Error saving settings.', 'error');
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
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        elevation={10}
      >
        {/* Step 0 - Welcome */}
        {step === 0 && (
          <Box sx={{ textAlign: 'center', px: 3 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
              Welcome to
            </Typography>
            <img src={logoUrl} alt="Logo" style={{ width: 100, height: 100, marginBottom: 16 }} />
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

        {/* Step 1 - Git Check automatic */}
        {step === 1 && (
          <Box sx={{ textAlign: 'center', px: 3 }}>
            <Typography variant="h5" gutterBottom>Checking Git availability...</Typography>
            {gitAvailable === null && <CircularProgress sx={{ mt: 3, mb: 3 }} size={60} />}
            {gitAvailable === true && (
              <Box sx={{ mt: 3, color: 'success.main', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 80 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Git is installed and available!
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Proceeding to next step...
                </Typography>
              </Box>
            )}
            {gitAvailable === false && (
              <Box sx={{ mt: 3, color: 'error.main', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ErrorIcon sx={{ fontSize: 80 }} />
                <Typography variant="h6" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                  {gitCheckError || 'Git is not available. Please install Git and restart the application.'}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => window.api.openGitDownloadPage?.()}
                >
                  Download Git
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Step 2 - Ask if repo is cloned */}
        {step === 2 && (
          <Box sx={{ width: '100%', px: 3 }}>
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

            {/* Folder selector: repo or clone */}
            <Box sx={{ mt: 3 }}>
              {hasCloned === true && (
                <>
                  <Typography>Select your OrcaSlicer repository folder:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField fullWidth value={repoPath} disabled />
                    <Button variant="outlined" onClick={handleSelectRepoFolder}>
                      Browse...
                    </Button>
                  </Box>
                </>
              )}
              {hasCloned === false && (
                <>
                  <Typography>Paste the URL of your OrcaSlicer fork:</Typography>
                  <TextField
                    fullWidth
                    value={forkUrl}
                    onChange={(e) => setForkUrl(e.target.value)}
                    placeholder="https://github.com/your-username/OrcaSlicer"
                  />

                  <Typography sx={{ mt: 2 }}>Select folder where to clone the repository:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField fullWidth value={clonePath} disabled placeholder="Select folder" />
                    <Button variant="outlined" onClick={handleSelectCloneRepoFolder}>
                      Browse...
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Step 4 - Cloning in progress */}
        {step === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Cloning repository...</Typography>
          </Box>
        )}

        {/* Step 5 - Choose editor */}
        {step === 5 && (
          <Box sx={{ width: '100%', px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferred Text Editor (optional)
            </Typography>
            <Typography>Please enter or select the executable file of your preferred text editor to edit JSON files:</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <TextField
                fullWidth
                value={editor}
                onChange={(e) => setEditor(e.target.value)}
                placeholder="Path to editor executable (leave empty to use system default)"
              />
              <Button variant="outlined" onClick={handleSelectEditorFile}>
                Browse...
              </Button>
            </Box>
          </Box>
        )}


        {/* Step 6 - Ask if validator is downloaded */}
        {step === 6 && (
          <Box sx={{ width: '100%', px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Orca profile validator Setup
            </Typography>
            <Typography>Please confirm if you have already downloaded the Orca profile validator:</Typography>
            <RadioGroup
              value={hasDownloaded === null ? '' : hasDownloaded ? 'yes' : 'no'}
              onChange={(e) => setHasDownloaded(e.target.value === 'yes')}
              sx={{ mt: 2 }}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes, I already have it" />
              <FormControlLabel value="no" control={<Radio />} label="No, please download it for me" />
            </RadioGroup>

            {/* Folder selector: repo or clone */}
            <Box sx={{ mt: 3 }}>
              {hasDownloaded === true && (
                <>
                  <Typography>Select your Orca profile validator file:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField fullWidth value={validatorPath} disabled />
                    <Button variant="outlined" onClick={handelselectValidatorFile}>
                      Browse...
                    </Button>
                  </Box>
                </>
              )}
              {hasDownloaded === false && (
                <>
                  <Typography>Select folder where to download Orca profile validator:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField fullWidth value={downloadPath} disabled placeholder="Select folder" />
                    <Button variant="outlined" onClick={handleSelectDownloadFolder}>
                      Browse...
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Step 7 - Download in progress */}
        {step === 7 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Downloading Orca profile validator...</Typography>
          </Box>
        )}

        {/* Step 8 - Finish */}
        {step === 8 && (
          <Box sx={{ textAlign: 'center', px: 3 }}>
            <Typography variant="h5" gutterBottom>Setup Complete!</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You have successfully configured the OrcaSlicer Profile Manager.
            </Typography>
          </Box>
        )}


        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, width: '100%' }}>
          {step > 0 && step !== 4 && step !== 7 && (
            <Button variant="outlined" onClick={handleBackStep}>
              Back
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {step !== 0 && step !== 4 && step !== 7 && (step !== 1 || (step === 1 && gitAvailable)) && (
            <Button variant="contained" onClick={handleNextStep}>
              {step === 8 ? 'Finish' : 'Next'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsWizard;
