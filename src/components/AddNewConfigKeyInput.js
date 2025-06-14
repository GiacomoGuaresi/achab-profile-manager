import React from 'react';
import { Button, Box, TextField } from '@mui/material';


const AddNewConfigKeyInput = ({ newKey, handleNewKeyChange, handleAddNewKey }) => (
  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
    <TextField
      label="Add new key"
      variant="outlined"
      size="small"
      value={newKey}
      onChange={handleNewKeyChange}
      sx={{ flexGrow: 1 }}
    />
    <Button variant="contained" onClick={handleAddNewKey} disabled={!newKey.trim()}>
      Add
    </Button>
  </Box>
);

export default AddNewConfigKeyInput;