import React, { useState } from 'react';
import { Drawer, Box, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const NodeDrawer = ({ open, onClose, nodeInfo, reloadGraph }) => {
  const [newName, setNewName] = useState('');

  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const handleOpenCloneDialog = () => setCloneDialogOpen(true);
  const handleCloseCloneDialog = () => {
    setCloneDialogOpen(false);
    setNewName('');
  };
  const handleClone = async () => {
    if (!nodeInfo?.data?.filePath) {
      alert("File path non disponibile.");
      return;
    }

    try {
      const result = await window.api.cloneProfile(nodeInfo.data.filePath, newName.trim());
      if (result.success) {
        handleCloseCloneDialog();
        alert(`Profilo clonato come "${newName.trim()}"`);
        reloadGraph(); // Funzione passata come prop per ricaricare il grafo
      } else {
        alert(`Errore nel clonare il profilo: ${result.error}`);
      }
    } catch (error) {
      alert(`Errore inatteso: ${error.message}`);
    }
  };

  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const handleOpenAddChildDialog = () => setAddChildDialogOpen(true);
  const handleCloseaddChildDialog = () => {
    setAddChildDialogOpen(false);
    setNewName('');
  };
  const handleAddChild = async () => {
    if (!nodeInfo?.data?.filePath) {
      alert("File path non disponibile.");
      return;
    }

    try {
      const result = await window.api.addChildProfile(nodeInfo.data.filePath, newName.trim());
      if (result.success) {
        handleCloseaddChildDialog();
        alert(`Profilo figlio aggiunto come "${newName.trim()}"`);
        reloadGraph(); // Funzione passata come prop per ricaricare il grafo
      } else {
        alert(`Errore nel clonare il profilo: ${result.error}`);
      }
    } catch (error) {
      alert(`Errore inatteso: ${error.message}`);
    }
  };

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const handleDelete = () => {
    if (!nodeInfo || !nodeInfo.data?.filePath) {
      alert('Missing node file path.');
      return;
    }

    if (nodeInfo.children && nodeInfo.children.length > 0) {
      alert('Questo profilo ha figli e non può essere eliminato.');
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
        onClose(); // chiude il drawer
      } else {
        alert(result.error || 'Eliminazione fallita.');
      }
    } catch (err) {
      alert(err.message || 'Errore imprevisto durante l\'eliminazione.');
    }
  };

  const handleEdit = () => { };

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
        <DialogTitle>Clone configuration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nuovo nome"
            fullWidth
            variant="standard"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCloneDialog}>Annulla</Button>
          <Button onClick={handleClone} disabled={!newName.trim()}>Clona</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addChildDialogOpen} onClose={handleCloseaddChildDialog}>
        <DialogTitle>Add child configuration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nuovo nome"
            fullWidth
            variant="standard"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseaddChildDialog}>Annulla</Button>
          <Button onClick={handleAddChild} disabled={!newName.trim()}>Clona</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>Vuoi eliminare definitivamente il profilo <strong>{nodeInfo?.data?.label || nodeInfo?.id}</strong>? Questa azione non può essere annullata.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Annulla</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Elimina</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NodeDrawer;
