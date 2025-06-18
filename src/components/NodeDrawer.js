import React, { useState } from 'react';
import {
  Drawer, Box, IconButton, Typography, Button,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../NotificationProvider';

const NodeDrawer = ({ open, onClose, nodeInfo, reloadGraph }) => {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [cloneName, setCloneName] = useState('');
  const [childName, setChildName] = useState('');

  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const handleOpenCloneDialog = () => setCloneDialogOpen(true);
  const handleCloseCloneDialog = () => {
    setCloneDialogOpen(false);
    setCloneName('');
  };

  const handleClone = async () => {
    if (!nodeInfo?.data?.filePath) {
      notify('File path not available.', 'error');
      return;
    }

    try {
      const result = await window.api.cloneProfile(nodeInfo.data.filePath, cloneName.trim());
      if (result.success) {
        handleCloseCloneDialog();
        notify(`Profile successfully cloned as "${cloneName.trim()}"`, 'success');
        reloadGraph();
      } else {
        notify(`Error cloning profile: ${result.error}`, 'error');
      }
    } catch (error) {
      notify(`Unexpected error: ${error.message}`, 'error');
    }
  };

  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const handleOpenAddChildDialog = () => setAddChildDialogOpen(true);
  const handleCloseAddChildDialog = () => {
    setAddChildDialogOpen(false);
    setChildName('');
  };

  const handleAddChild = async () => {
    if (!nodeInfo?.data?.filePath) {
      notify('File path not available.', 'error');
      return;
    }

    try {
      const result = await window.api.addChildProfile(nodeInfo.data.filePath, childName.trim());
      if (result.success) {
        handleCloseAddChildDialog();
        notify(`Child profile successfully created as "${childName.trim()}"`, 'success');
        reloadGraph();
      } else {
        notify(`Error adding child profile: ${result.error}`, 'error');
      }
    } catch (error) {
      notify(`Unexpected error: ${error.message}`, 'error');
    }
  };

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const handleDelete = () => {
    if (!nodeInfo || !nodeInfo.data?.filePath) {
      notify('Missing node file path.', 'error');
      return;
    }

    if (nodeInfo.children && nodeInfo.children.length > 0) {
      notify('This profile has children and cannot be deleted.', 'error');
      return;
    }

    setConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await window.api.deleteProfile(nodeInfo.data.filePath);
      if (result.success) {
        setConfirmDeleteDialogOpen(false);
        if (typeof reloadGraph === 'function') reloadGraph();
        onClose();
      } else {
        notify(`Error deleting profile: ${result.error}`, 'error');
      }
    } catch (err) {
      notify(`Unexpected error: ${err.message}`, 'error');
    }
  };

  const handleEdit = () => {
    if (!nodeInfo) {
      notify('No node selected.', 'error');
      return;
    }
    // Passa i dati del nodo alla pagina edit via state
    navigate('/edit-configuration', { state: { nodeInfo } });
  };

  return (
    <>
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
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleOpenCloneDialog}>
                Clone
              </Button>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddChildDialog}>
                Add child
              </Button>
              <Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
                Edit/View
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={cloneDialogOpen} onClose={handleCloseCloneDialog}>
        <DialogTitle>Clone Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New name"
            fullWidth
            variant="standard"
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCloneDialog}>Cancel</Button>
          <Button onClick={handleClone} disabled={!cloneName.trim()}>Clone</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addChildDialogOpen} onClose={handleCloseAddChildDialog}>
        <DialogTitle>Add Child Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New name"
            fullWidth
            variant="standard"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddChildDialog}>Cancel</Button>
          <Button onClick={handleAddChild} disabled={!childName.trim()}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete the profile <strong>{nodeInfo?.data?.label || nodeInfo?.id}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NodeDrawer;
