import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Button, Box, Tooltip } from '@mui/material';
import definitionData from '../assets/definitions.json'; 

const AddNewConfigKeyInput = ({ newKey, handleNewKeyChange, handleAddNewKey }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const keys = Object.entries(definitionData).map(([key, value]) => ({
      key,
      label: value.label || '',
      tooltip: value.tooltip || '',
    }));
    setOptions(keys);
  }, []);

  return (
    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.key
        }
        renderOption={(props, option) => (
          <li {...props}>
            <Tooltip title={option.tooltip || ''} arrow>
              <Box>
                <strong>{option.key}</strong>
                {option.label && (
                  <Box sx={{ fontSize: 12, color: 'gray' }}>{option.label}</Box>
                )}
              </Box>
            </Tooltip>
          </li>
        )}
        onInputChange={(e, value) => handleNewKeyChange({ target: { value } })}
        inputValue={newKey}
        renderInput={(params) => (
          <TextField {...params} label="Add new key" variant="outlined" size="small" />
        )}
        sx={{ flexGrow: 1 }}
      />
      <Button
        variant="contained"
        onClick={handleAddNewKey}
        disabled={!newKey.trim()}
      >
        Add
      </Button>
    </Box>
  );
};

export default AddNewConfigKeyInput;
