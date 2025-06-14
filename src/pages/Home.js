import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, TextField } from '@mui/material';

import GraphViewer from '../components/GraphViewer';
import VendorSelector from '../components/VendorSelector';
import NodeDrawer from '../components/NodeDrawer';
import SettingsWizard from '../components/SettingsWizard';

const Home = () => {
  const [vendorFolders, setVendorFolders] = useState([]);
  const [profileGraph, setProfileGraph] = useState(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(() => {
    return localStorage.getItem('selectedVendor') || '';
  });

  const [profilesRootPath, setProfilesRootPath] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);  // stato per controllo settings

  useEffect(() => {
    const loadSettingsAndVendors = async () => {
      try {
        const settings = await window.api.loadSettings();

        if (!settings || !settings.repoPath) {
          setSettingsLoaded(false); // mostra wizard
          return;
        }

        setSettingsLoaded(true);
        const fullPath = `${settings.repoPath}\\resources\\profiles`;
        setProfilesRootPath(fullPath);

        const folders = await window.api.getVendorFolders(fullPath);
        setVendorFolders(folders);
      } catch (error) {
        console.error('Errore nel caricamento impostazioni o cartelle vendor:', error);
        setVendorFolders(['Errore caricamento cartelle.']);
        setSettingsLoaded(false);
      }
    };

    loadSettingsAndVendors();
  }, []);

  const handleWizardComplete = (repoPath) => {
    setSettingsLoaded(true);
    const fullPath = `${repoPath}\\resources\\profiles`;
    setProfilesRootPath(fullPath);
    window.api.getVendorFolders(fullPath).then(setVendorFolders).catch(() => setVendorFolders(['Errore caricamento cartelle.']));
  };

  const handleVendorChange = (vendorName) => {
    setSelectedVendor(vendorName);
    if (window.api) {
      window.api
        .readVendorProfiles(vendorName)
        .then(setProfileGraph)
        .catch(() => setProfileGraph({ error: 'Errore nel caricamento dei profili.' }));
    }
  };

  const loadGraphData = useCallback(() => {
    if (!selectedVendor) return;

    if (window.api) {
      window.api
        .readVendorProfiles(selectedVendor)
        .then(setProfileGraph)
        .catch(() => setProfileGraph({ error: 'Errore nel caricamento dei profili.' }));
    }
  }, [selectedVendor]);

  // Se settings non caricati, mostra il wizard obbligatorio
  if (!settingsLoaded) {
    return <SettingsWizard onComplete={handleWizardComplete} />;
  }

  // Altrimenti mostra la UI principale
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
