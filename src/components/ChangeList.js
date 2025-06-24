import React, { useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';

const ChangeList = ({ files, selectedFiles = [], onSelectionChange, onActiveChange, onRestore }) => {
  const [selected, setSelected] = useState(new Set(selectedFiles));
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    onSelectionChange([...selected]);
  }, [selected, onSelectionChange]);

  const toggleFile = (file) => {
    const updated = new Set(selected);
    if (updated.has(file)) {
      updated.delete(file);
    } else {
      updated.add(file);
    }
    setSelected(updated);
  };

  const toggleAll = () => {
    if (selected.size === files.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(files));
    }
  };

  const handleActiveClick = (file) => {
    setActiveFile(file);
    if (onActiveChange) onActiveChange(file);
  };

  const handleRestoreClick = (file) => {
    if (onRestore) onRestore(file);
  };

  const allSelected = selected.size === files.length && files.length > 0;
  const someSelected = selected.size > 0 && selected.size < files.length;

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
        />
        <Typography variant="subtitle1">Changed files</Typography>
      </Box>

      <Divider />

      <List dense sx={{ overflowY: 'auto', maxHeight: 'calc(100% - 48px)' }}>
        {files.map((file) => (
          <ListItem
            key={file}
            disablePadding
            sx={{
              backgroundColor: file === activeFile ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflowX: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selected.has(file)}
                  onChange={() => toggleFile(file)}
                />
              </ListItemIcon>
              <ListItemText
                primary={file}
                onClick={() => handleActiveClick(file)}
                sx={{ userSelect: 'none', pr: 1 }}
              />
            </Box>
            <Tooltip title="Restore file">
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleRestoreClick(file)}
                aria-label={`restore ${file}`}
              >
                <RestoreIcon />
              </IconButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChangeList;
