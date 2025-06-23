import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import GitNavbar from '../components/GitNavbar';
import ChangeList from '../components/ChangeList';
import FileViewer from '../components/FileViewer';
import CommitPanel from '../components/CommitPanel';

const Git = () => {
  const [branch, setBranch] = useState('develop');
  const [branches, setBranches] = useState(['main', 'develop', 'feature-login']);
  const [pullCount, setPullCount] = useState(2);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);

  // Carica info branch, pullCount e file modificati all'avvio
  useEffect(() => {
    async function fetchGitInfo() {
      try {
        // Ottieni branches e branch corrente
        const [branchesList, currentBranch, behindCount, changedFiles] = await Promise.all([
          window.api.getBranches(),
          window.api.getCurrentBranch(),
          window.api.getPullCount(),
          window.api.getChangedFiles(),
        ]);

        setBranches(branchesList);
        setBranch(currentBranch);
        setPullCount(behindCount);
        setFiles(changedFiles);
      } catch (err) {
        console.error('Error fetching git info:', err);
      }
    }
    fetchGitInfo();
  }, []);

  // Handler Pull
  const handlePull = async () => {
    try {
      await window.api.pull();
      console.log('Pull successful');
      // Aggiorna file, pull count e branch info dopo il pull
      const [changedFiles, behindCount] = await Promise.all([
        window.api.getChangedFiles(),
        window.api.getPullCount(),
      ]);
      setFiles(changedFiles);
      setPullCount(behindCount);
    } catch (err) {
      console.error('Pull failed:', err);
    }
  };

  // Handler switch branch
  const handleSwitchBranch = async (newBranch) => {
    try {
      await window.api.switchBranch(newBranch);
      setBranch(newBranch);
      // Ricarica file cambiati, branches e pullCount
      const [changedFiles, updatedBranches, behindCount] = await Promise.all([
        window.api.getChangedFiles(),
        window.api.getBranches(),
        window.api.getPullCount(),
      ]);
      setFiles(changedFiles);
      setBranches(updatedBranches);
      setPullCount(behindCount);
      setSelectedFiles([]);
      setFileContent('');
    } catch (err) {
      console.error('Switch branch failed:', err);
    }
  };

  // Handler create branch
  const handleCreateBranch = async (name, base) => {
    try {
      await window.api.createBranch(name, base);
      const [updatedBranches, changedFiles] = await Promise.all([
        window.api.getBranches(),
        window.api.getChangedFiles(),
      ]);
      setBranches(updatedBranches);
      setBranch(name);
      setFiles(changedFiles);
      setSelectedFiles([]);
      setFileContent('');
    } catch (err) {
      console.error('Create branch failed:', err);
    }
  };

  // Quando cambia la selezione dei file
  const handleSelectionChange = async (selected) => {
    setSelectedFiles(selected);

    if (selected.length === 1) {
      setLoadingFile(true);
      try {
        const content = await window.api.readFile(selected[0]);
        setFileContent(content);
      } catch (err) {
        console.error('Error reading file:', err);
        setFileContent('');
      }
      setLoadingFile(false);
    } else {
      setFileContent('');
    }
  };

  // Commit
  const handleCommit = async (msg) => {
    try {
      await window.api.commit(msg);
      console.log('Committed with message:', msg);
      // Dopo commit aggiorna file modificati
      const changedFiles = await window.api.getChangedFiles();
      setFiles(changedFiles);
      setSelectedFiles([]);
      setFileContent('');
    } catch (err) {
      console.error('Commit failed:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Navbar in alto */}
      <GitNavbar
        branch={branch}
        branches={branches}
        pullcount={pullCount}
        onPull={handlePull}
        onSwitchBranch={handleSwitchBranch}
        onCreateBranch={handleCreateBranch}
      />

      {/* Parte sotto: ChangeList + FileViewer/CommitPanel */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Colonna sinistra: ChangeList */}
        <Box sx={{ width: '50%', borderRight: '1px solid #ddd', overflow: 'auto' }}>
          <ChangeList files={files} onSelectionChange={handleSelectionChange} />
        </Box>

        {/* Colonna destra: FileViewer + CommitPanel */}
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {loadingFile ? (
              <div>Loading file...</div>
            ) : (
              <FileViewer content={fileContent || 'No file selected'} />
            )}
          </Box>
          <Box sx={{ borderTop: '1px solid #ddd' }}>
            <CommitPanel onCommit={handleCommit} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Git;
