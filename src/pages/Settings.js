import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Settings = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography>
          Questa è una semplice pagina di esempio. Inserisci qui le impostazioni o altre
          informazioni che desideri mostrare.
        </Typography>
      </Box>
    </Container>
  );
};

export default Settings;
