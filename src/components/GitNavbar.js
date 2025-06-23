import React, { useState } from 'react';
import {
    Button,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider
} from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const GitNavbar = ({
    branch,
    branches,
    pullcount,
    onPull,
    onSwitchBranch,
    onCreateBranch
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');
    const [baseBranch, setBaseBranch] = useState('master');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!newBranchName.trim()) {
            setError('Name required');
            return;
        }
        if (branches.includes(newBranchName)) {
            setError('Branch already exists');
            return;
        }
        onCreateBranch(newBranchName, baseBranch);
        setNewBranchName('');
        setError('');
        setDialogOpen(false);
    };

    return (
        <>
            <Box
                sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    gap: 2,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={() => setDialogOpen(true)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                        padding: '6px 12px',
                    }}
                >
                    <AltRouteIcon />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1 }}>
                            Current branch
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1 }}>
                            {branch}
                        </Typography>
                    </Box>
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<ArrowDownwardIcon />}
                    onClick={onPull}
                >
                    Pull Origin ({pullcount})
                </Button>
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Switch or Create Branch</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" gutterBottom>Select existing branch:</Typography>
                    <List dense>
                        {branches.map((b) => (
                            <ListItem disablePadding key={b}>
                                <ListItemButton
                                    onClick={() => {
                                        onSwitchBranch(b);
                                        setDialogOpen(false);
                                    }}
                                    selected={b === branch}
                                >
                                    <ListItemText primary={b} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>Create new branch:</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="New branch name"
                        value={newBranchName}
                        onChange={(e) => {
                            setNewBranchName(e.target.value);
                            setError('');
                        }}
                        error={!!error}
                        helperText={error}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel>Base branch</InputLabel>
                        <Select
                            label="Base branch"
                            value={baseBranch}
                            onChange={(e) => setBaseBranch(e.target.value)}
                        >
                            <MenuItem value="master">master</MenuItem>
                            <MenuItem value={branch}>{branch}</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create branch</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default GitNavbar;
