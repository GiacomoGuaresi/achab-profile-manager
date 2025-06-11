import React from 'react';
import { Drawer, Box, IconButton, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const NodeDrawer = ({ open, onClose, nodeInfo }) => {
  const handleClone = () => {};
  const handleAddChild = () => {};
  const handleDelete = () => {};
  const handleEdit = () => {};

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          p: 3,
          backgroundColor: '#f5f5f5',
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {nodeInfo && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {nodeInfo.data?.label || nodeInfo.id}
          </Typography>

          {['type', 'instantiation', 'version', 'filePath'].map((key) =>
            nodeInfo.data?.[key] && (
              <Typography key={key} variant="body1">
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {nodeInfo.data[key]}
              </Typography>
            )
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleClone}>
              Clone configuration
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddChild}>
              Add child configuration
            </Button>
            <Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={handleDelete}>
              Delete configuration
            </Button>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
              Edit/View configuration
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default NodeDrawer;
