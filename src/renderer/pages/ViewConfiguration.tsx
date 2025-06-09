// src/renderer/App.tsx
import React, { useState } from 'react';
import {  
  Typography, Menu, MenuItem,
  Box, InputBase, Container,
  Stack, Breadcrumbs, Paper, Dialog,
  DialogTitle, DialogContent, IconButton, Divider,
  Tooltip, TextField
} from '@mui/material';
import ExpandIcon from '@mui/icons-material/ZoomOutMap';
import InfoIcon from '@mui/icons-material/Info';

const mockData = [
  {
    title: 'Chiave 1',
    breadcrumbs: ['valore1', 'valore2', 'valore3'],
  },
  {
    title: 'Chiave 2',
    breadcrumbs: ['foo', 'bar', 'baz'],
  },
];

export default function App(): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogValue, setDialogValue] = useState('');

  const handleExpandClick = (value: string) => {
    setDialogValue(value);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
      <Box display="flex" flexDirection="column">
        <Container sx={{ mt: 4, mb: 4 }}>
          <Stack spacing={2}>
            {mockData.map((item, index) => (
              <Paper key={index} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Tooltip title={`Descrizione per ${item.title}`} arrow>
                    <IconButton size="small">
                      <Typography fontWeight="bold" color="primary">
                        <InfoIcon />
                      </Typography>
                    </IconButton>
                  </Tooltip>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.title}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Breadcrumbs separator="/">
                    {item.breadcrumbs.map((crumb, i) => (
                      <Typography key={i} color="text.secondary">
                        {crumb}
                      </Typography>
                    ))}
                  <InputBase
                    placeholder="Inserisci valore"
                    sx={{ borderBottom: '1px solid gray', ml: 1, flex: 1 }}
                    />
                  </Breadcrumbs>
                  <IconButton onClick={() => handleExpandClick('Valore espanso qui')}>
                    <ExpandIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
          <Box mt={4}>
            <Typography variant="subtitle2" gutterBottom>
              Aggiungi nuova chiave:
            </Typography>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              defaultValue=""
              helperText="Seleziona una chiave per aggiungerla"
            >
              <MenuItem value="">-- Seleziona --</MenuItem>
              <MenuItem value="chiave_nuova_1">Chiave Nuova 1</MenuItem>
              <MenuItem value="chiave_nuova_2">Chiave Nuova 2</MenuItem>
            </TextField>
          </Box>
        </Container>

        <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
          <DialogTitle>Valore esteso</DialogTitle>
          <Divider />
          <DialogContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{dialogValue}</Typography>
          </DialogContent>
        </Dialog>
      </Box>
  );
}
