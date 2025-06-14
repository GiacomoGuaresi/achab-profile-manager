import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography } from '@mui/material';

import GraphViewer from '../components/GraphViewer';
import VendorSelector from '../components/VendorSelector';
import NodeDrawer from '../components/NodeDrawer';

const profilesRootPath =
  'C:\\Users\\guare\\source\\gingerRepos\\OrcaSlicer\\resources\\profiles';

const Home = () => {
  const [vendorFolders, setVendorFolders] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [profileGraph, setProfileGraph] = useState(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (window.api) {
      window.api
        .getVendorFolders(profilesRootPath)
        .then(setVendorFolders)
        .catch(() =>
          setVendorFolders(['Error loading folders. Check console.'])
        );
    } else {
      setVendorFolders(['File reading API is not available.']);
    }
  }, []);

  const handleVendorChange = (vendorName) => {
    setSelectedVendor(vendorName);
    if (window.api) {
      window.api
        .readVendorProfiles(vendorName)
        .then(setProfileGraph)
        .catch(() => setProfileGraph({ error: 'Error loading vendor profiles.' }));
    }
  };

  const loadGraphData = useCallback(() => {
    if (!selectedVendor) return;

    if (window.api) {
      window.api
        .readVendorProfiles(selectedVendor)
        .then(setProfileGraph)
        .catch(() => setProfileGraph({ error: 'Error loading vendor profiles.' }));
    }
  }, [selectedVendor]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 72px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {profileGraph?.error ? (
        <Container sx={{ mt: 4 }}>
          <Typography color="error">{profileGraph.error}</Typography>
        </Container>
      ) : (
        <GraphViewer
          profileGraph={profileGraph}
          onNodeClick={(node) => {
            console.log('Home onNodeClick:', node);
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
        reloadGraph={loadGraphData}
      />
    </Box>
  );
};

export default Home;
