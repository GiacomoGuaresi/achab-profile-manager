// App.tsx (refattorizzato per routing e home page dei grafi)
import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import GraphOverview from './pages/GraphOverview';
import ViewConfiguration from './pages/ViewConfiguration';
import GitBranchIcon from '@mui/icons-material/CallSplit';

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
        <Router>
          <Routes>
            <Route path="/" element={<GraphOverview />} />
            <Route path="/view" element={<ViewConfiguration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Box component="footer" sx={{ mt: 'auto', py: 1, px: 2, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
          <GitBranchIcon fontSize="small" />
          <Typography variant="body2">BranchCorrente</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
