import React, { useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider
} from '@mui/material';

const ChangeList = ({ files, selectedFiles = [], onSelectionChange }) => {
  const [selected, setSelected] = useState(new Set(selectedFiles));

  // useEffect(() => {
  //   onSelectionChange([...selected]);
  // }, [selected, onSelectionChange]);

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
          <ListItem key={file} disablePadding>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selected.has(file)}
                onChange={() => toggleFile(file)}
              />
            </ListItemIcon>
            <ListItemText primary={file} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChangeList;
