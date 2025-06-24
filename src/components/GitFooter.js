import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import CommitIcon from '@mui/icons-material/Commit';
import StorageIcon from '@mui/icons-material/Storage';

const GitFooter = () => {
  const [branch, setBranch] = useState('');
  const [lastCommit, setLastCommit] = useState('');
  const [changes, setChanges] = useState('');

  useEffect(() => {
    const loadGitInfo = async () => {
      try {
        const [currentBranch, lastCommitHash, changedFiles] = await Promise.all([
          window.api.getCurrentBranch(),
          window.api.getLastCommit(),
          window.api.getChangedFiles(),
        ]);
        setBranch(currentBranch);
        setLastCommit(lastCommitHash);
        setChanges(`${changedFiles.length} modified`);
      } catch (err) {
        console.error('Failed to load git info:', err);
      }
    };

    // Primo caricamento immediato
    loadGitInfo();

    // Imposta l'intervallo
    const intervalId = setInterval(loadGitInfo, 1000); // ogni 1000ms = 1s

    // Pulizia quando il componente viene smontato
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        height: '24px',
        padding: '2px 8px',
        backgroundColor: '#fff',
        color: '#000',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'space-between',
        px: 2,
        fontSize: '0.75rem',
        borderTop: '1px solid #ccc',
        fontFamily: 'monospace',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
        <AltRouteIcon sx={{ fontSize: 16 }} />
        Branch: <strong>{branch}</strong>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
        <CommitIcon sx={{ fontSize: 16 }} />
        Commit: <strong>{lastCommit}</strong>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
        <StorageIcon sx={{ fontSize: 16 }} />
        Changes: <strong>{changes}</strong>
      </Box>
    </Box>
  );
};

export default GitFooter;
