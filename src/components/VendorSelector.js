import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const VendorSelector = ({ folders, selectedVendor, onChange }) => (
  <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1, p: 2, boxShadow: 3 }}>
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id="vendor-select-label">Select a Vendor</InputLabel>
      <Select
        labelId="vendor-select-label"
        value={selectedVendor}
        label="Select a Vendor"
        onChange={(e) => onChange(e.target.value)}
      >
        {folders.length > 0
          ? folders.map((folder, idx) => (
              <MenuItem key={idx} value={folder}>{folder}</MenuItem>
            ))
          : <MenuItem disabled>No vendors available</MenuItem>
        }
      </Select>
    </FormControl>
  </Box>
);

export default VendorSelector;
