// components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button, Menu, MenuItem, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useFileActions } from '../FileActionsContext';

const Navbar = () => {
  const location = useLocation();
  const { save, discard } = useFileActions();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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


  // Abilitiamo i menu solo se siamo in /edit-configuration
  const isEditConfigPage = location.pathname === '/edit-configuration';

  return (
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
      <>
        <Button
          color="inherit"
          onClick={handleClick}
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
            px: 1,
          }}
          aria-controls={open ? 'file-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          File
        </Button>
        <Menu
          id="file-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'file-button',
          }}
        >
          <MenuItem
            disabled={!isEditConfigPage}
            onClick={() => {
              if (isEditConfigPage) {
                save();
                handleClose();
              }
            }}
          >
            Save
            <Box component="span" sx={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.75rem', paddingLeft: 1 }}>
              {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘+S' : 'Ctrl+S'}
            </Box>
          </MenuItem>

          <MenuItem
            disabled={!isEditConfigPage}
            onClick={() => {
              if (isEditConfigPage) {
                discard();
                handleClose();
              }
            }}
          >
            Discard
            <Box component="span" sx={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.75rem', paddingLeft: 1 }}>
              {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘+D' : 'Ctrl+D'}
            </Box>
          </MenuItem>
          <MenuItem
            component={Link}
            to="/settings"
          >
            Settings
          </MenuItem>
        </Menu>
      </>

      {/* Altri bottoni */}
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

    </Box>
  );
};

export default Navbar;
