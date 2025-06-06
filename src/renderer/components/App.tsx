// src/renderer/App.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar, Typography, Menu, MenuItem,
  Button, Box, InputBase, Container,
  Stack, Breadcrumbs, Paper, Dialog,
  DialogTitle, DialogContent, IconButton, Divider,
  Tooltip, TextField, CssBaseline, ThemeProvider
} from '@mui/material';
import GitBranchIcon from '@mui/icons-material/CallSplit';
import ExpandIcon from '@mui/icons-material/ZoomOutMap';
import InfoIcon from '@mui/icons-material/Info';
import theme from "../theme";

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, name: string) => {
    setAnchorEl(event.currentTarget);
    setMenu(name);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenu(null);
  };

  const handleExpandClick = (value: string) => {
    setDialogValue(value);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const renderMenu = (name: string, items: string[]) => (
    <Menu anchorEl={anchorEl} open={menu === name} onClose={handleMenuClose}>
      {items.map((item) => (
        <MenuItem key={item} onClick={handleMenuClose}>{item}</MenuItem>
      ))}
    </Menu>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Achab Profile Manager
            </Typography>
            {['File', 'Validate', 'Tools', 'Git'].map((label) => (
              <Box key={label}>
                <Button color="inherit" onClick={(e) => handleMenuOpen(e, label)}>
                  {label}
                </Button>
                {renderMenu(label, label === 'File' ? ['Open', 'Save', 'Settings', 'Exit'] : ['Option 1', 'Option 2'])}
              </Box>
            ))}
          </Toolbar>
        </AppBar>

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

        <Box component="footer" sx={{ mt: 'auto', py: 1, px: 2, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
          <GitBranchIcon fontSize="small" />
          <Typography variant="body2">BranchCorrente</Typography>
        </Box>

        <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
          <DialogTitle>Valore esteso</DialogTitle>
          <Divider />
          <DialogContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{dialogValue}</Typography>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
