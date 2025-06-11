// src/pages/EditConfiguration.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';

const EditConfiguration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // I dati del nodo arrivano da location.state
  const nodeInfo = location.state?.nodeInfo;

  if (!nodeInfo) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">No node data provided.</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Edit Configuration for: {nodeInfo.data?.label || nodeInfo.id}</Typography>
      {/* Qui metti il form o la UI di modifica */}
      <pre>{JSON.stringify(nodeInfo, null, 2)}</pre>

      <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
    </Box>
  );
};

export default EditConfiguration;
