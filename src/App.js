import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

import customTheme from './theme/customTheme';
import Home from './pages/Home';
import Settings from './pages/Settings';
import EditConfiguration from './pages/EditConfiguration';

const App = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <HashRouter>
        {/* AppBar visibile su tutte le pagine */}
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/settings">
                Settings
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Contenuto specifico per rotta */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/edit-configuration" element={<EditConfiguration />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;