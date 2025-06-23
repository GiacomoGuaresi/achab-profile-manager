// App.js
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Box,
} from '@mui/material';
import { HashRouter, Routes, Route } from 'react-router-dom';

import customTheme from './theme/customTheme';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Git from './pages/Git';
import EditConfiguration from './pages/EditConfiguration';

import GitFooter from './components/GitFooter';
import Navbar from './components/Navbar';

import { FileActionsProvider } from './FileActionsContext';
import { NotificationProvider } from './NotificationProvider';

const App = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <NotificationProvider>
        <FileActionsProvider>
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
                  <Navbar />
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
                  <Route path="/git" element={<Git />} />
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
        </FileActionsProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
