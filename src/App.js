import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

import customTheme from './theme/customTheme';
import Home from './pages/Home';
import Settings from './pages/Settings';
import EditConfiguration from './pages/EditConfiguration';

import GitFooter from './components/GitFooter';
import HomeIcon from '@mui/icons-material/Home';

const App = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <HashRouter>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* Navbar fissa */}
          <AppBar
            position="fixed"
            sx={{ bgcolor: 'secondary.main', borderRadius: 0, height: 48 }}
          >
            <Toolbar
              sx={{
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '48px !important',
              }}
            >
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Button
                  color="primary"
                  component={Link}
                  to="/"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    minWidth: 48,
                    minHeight: 48,
                    p: 0,
                    borderRadius: 0,
                  }}
                >
                  <HomeIcon fontSize="medium" />
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/settings"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 0,
                    px: 1,
                  }}
                >
                  Validate
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/settings"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 0,
                    px: 1,
                  }}
                >
                  Git
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/settings"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 0,
                    px: 1,
                  }}
                >
                  Settings
                </Button>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Contenuto scrollabile */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              mt: '48px',
              mb: '24px', // spazio per il footer
              overflowY: 'auto',
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/edit-configuration" element={<EditConfiguration />} />
            </Routes>
          </Box>

          <GitFooter
            branch="feature/login"
            lastCommit="9f2e4d1"
            changes="2 modified, 1 staged"
          />
        </Box>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
