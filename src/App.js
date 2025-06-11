import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box, Container } from '@mui/material';

import customTheme from './theme/customTheme';
import GraphViewer from './components/GraphViewer';
import VendorSelector from './components/VendorSelector';
import NodeDrawer from './components/NodeDrawer';

const App = () => {
  const [vendorFolders, setVendorFolders] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [profileGraph, setProfileGraph] = useState(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const profilesRootPath = 'C:\\Users\\guare\\source\\gingerRepos\\OrcaSlicer\\resources\\profiles';

  useEffect(() => {
    if (window.api) {
      window.api.getVendorFolders(profilesRootPath)
        .then(setVendorFolders)
        .catch(() => setVendorFolders(['Error loading folders. Check console.']));
    } else {
      setVendorFolders(['File reading API is not available.']);
    }
  }, []);

  const handleVendorChange = (vendorName) => {
    setSelectedVendor(vendorName);
    if (window.api) {
      window.api.readVendorProfiles(vendorName)
        .then(setProfileGraph)
        .catch(() => setProfileGraph({ error: 'Error loading vendor profiles.' }));
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Achab Profile Manager</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden' }}>
        {profileGraph?.error ? (
          <Container sx={{ mt: 4 }}>
            <Typography color="error">{profileGraph.error}</Typography>
          </Container>
        ) : (
          <GraphViewer
            profileGraph={profileGraph}
            onNodeClick={(node) => {
              console.log('App onNodeClick:', node);
              setSelectedNodeInfo(node);
              setIsPanelOpen(true);
            }}
          />
        )}
        <VendorSelector
          folders={vendorFolders}
          selectedVendor={selectedVendor}
          onChange={handleVendorChange}
        />
        <NodeDrawer
          open={isPanelOpen}
          nodeInfo={selectedNodeInfo}
          onClose={() => {
            setIsPanelOpen(false);
            setSelectedNodeInfo(null);
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default App;
