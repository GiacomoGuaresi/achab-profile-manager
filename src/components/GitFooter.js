import React from 'react';
import { Box } from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import CommitIcon from '@mui/icons-material/Commit';
import StorageIcon from '@mui/icons-material/Storage';

const GitFooter = ({ branch = 'main', lastCommit = 'abc1234', changes = '3 modified' }) => {
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
