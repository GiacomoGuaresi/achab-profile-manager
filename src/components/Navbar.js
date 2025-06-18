// components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Button, Menu, MenuItem, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useFileActions } from '../FileActionsContext';
import ValidateProfilesPopup from './ValidateProfilesPopup';


const Navbar = () => {
  const location = useLocation();
  const { save, discard, openInFileExplorer, openInTextEditor } = useFileActions();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isEditConfigPage = location.pathname === '/edit-configuration';
  const [showPopup, setShowPopup] = useState(false);

  const [fileAnchorEl, setFileAnchorEl] = useState(null);
  const [guideAnchorEl, setGuideAnchorEl] = useState(null);

  const fileMenuOpen = Boolean(fileAnchorEl);
  const guideMenuOpen = Boolean(guideAnchorEl);

  const handleFileClick = (event) => {
    setFileAnchorEl(event.currentTarget);
  };
  const handleGuideClick = (event) => {
    setGuideAnchorEl(event.currentTarget);
  };

  const handleFileClose = () => {
    setFileAnchorEl(null);
  };
  const handleGuideClose = () => {
    setGuideAnchorEl(null);
  };


  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlKey && event.key === 's') {
        event.preventDefault(); // blocca il comportamento di default (salvataggio pagina)
        if (isEditConfigPage) save();
      }

      if (ctrlKey && event.key.toLowerCase() === 'd') {
        event.preventDefault(); // evita eventuale comportamento browser (bookmark)
        if (isEditConfigPage) discard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditConfigPage, save, discard]);

  return (
    <>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        {/* Bottone Home */}
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

        {/* Dropdown File sempre visibile */}
        <Button
          color="inherit"
          onClick={handleFileClick}
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
            px: 1,
          }}
          aria-controls={fileMenuOpen ? 'file-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={fileMenuOpen ? 'true' : undefined}
        >
          File
        </Button>
        <Menu
          id="file-menu"
          anchorEl={fileAnchorEl}
          open={fileMenuOpen}
          onClose={handleFileClose}
          MenuListProps={{
            'aria-labelledby': 'file-button',
          }}
        >
          <MenuItem onClick={() => { save(); handleFileClose(); }} disabled={!isEditConfigPage}>
            Save
            <Box component="span" sx={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.75rem', paddingLeft: 1 }}>
              {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘+S' : 'Ctrl+S'}
            </Box>
          </MenuItem>

          <MenuItem onClick={() => { discard(); handleFileClose(); }} disabled={!isEditConfigPage}>
            Discard
            <Box component="span" sx={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.75rem', paddingLeft: 1 }}>
              {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘+D' : 'Ctrl+D'}
            </Box>
          </MenuItem>

          <MenuItem onClick={() => { openInFileExplorer(); handleFileClose(); }} disabled={!isEditConfigPage}>
            Open in File Explorer
          </MenuItem>

          <MenuItem onClick={() => { openInTextEditor(); handleFileClose(); }} disabled={!isEditConfigPage}>
            Open in Text Editor
          </MenuItem>

          <MenuItem onClick={() => { Navigate("/settings"); handleFileClose(); }}>
            Settings
          </MenuItem>
        </Menu>

        {/* Altri bottoni */}
        <Button
          color="inherit"
          component={Link}
          onClick={() => setShowPopup(true)}
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
          onClick={handleGuideClick}
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
            px: 1,
          }}
          aria-controls={guideMenuOpen ? 'guide-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={guideMenuOpen ? 'true' : undefined}
        >
          Guide
        </Button>
        <Menu
          id="guide-menu"
          anchorEl={guideAnchorEl}
          open={guideMenuOpen}
          onClose={handleGuideClose}
        >
          <MenuItem onClick={() => {
            window.api.openExternal('https://github.com/SoftFever/OrcaSlicer/wiki/How-to-create-profiles');
            handleGuideClose();
          }}>
            Develop Profiles for OrcaSlicer
          </MenuItem>
        </Menu>


      </Box>
      {showPopup && <ValidateProfilesPopup onClose={() => setShowPopup(false)} />}
    </>
  );
};

export default Navbar;
