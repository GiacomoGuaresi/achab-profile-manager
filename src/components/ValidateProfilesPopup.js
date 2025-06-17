import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Collapse,
    IconButton,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function ProfileValidatorPopup({ onClose }) {
    const [pythonResult, setPythonResult] = useState({ output: '', status: null });
    const [orcaResult, setOrcaResult] = useState({ output: '', status: null });

    const [loadingPython, setLoadingPython] = useState(true);
    const [loadingOrca, setLoadingOrca] = useState(true);

    const [showPython, setShowPython] = useState(false);
    const [showOrca, setShowOrca] = useState(false);

    const selectedVendor = localStorage.getItem('selectedVendor') || '';

    useEffect(() => {
        const runValidations = async () => {
            try {
                const result = await window.api.runValidation('python', selectedVendor);
                setPythonResult(result);
            } catch {
                setPythonResult({ output: '❌ Error running Python validation.', status: 'failed' });
            } finally {
                setLoadingPython(false);
            }

            try {
                const result = await window.api.runValidation('validator', selectedVendor);
                setOrcaResult(result);
            } catch {
                setOrcaResult({ output: '❌ Error running OrcaSlicer validation.', status: 'failed' });
            } finally {
                setLoadingOrca(false);
            }
        };

        runValidations();
    }, [selectedVendor]);

    const getStatusIcon = (loading, status) => {
        if (loading) return <CircularProgress size={16} sx={{ mr: 1 }} />;
        if (status === 'success') return <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />;
        if (status === 'failed') return <ErrorIcon sx={{ color: 'red', mr: 1 }} />;
        return null;
    };

    const getTextColor = (status) => {
        if (status === 'success') return 'success.main';
        if (status === 'failed') return 'error.main';
        return '#aaa';
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                zIndex: 1300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
            }}
        >
            <Paper
                sx={{
                    width: '90%',
                    maxWidth: '100%',
                    p: 3,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    position: 'relative',
                }}
                elevation={10}
            >
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Profile Validator
                </Typography>

                {/* Python Validator */}
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowPython(!showPython)}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(loadingPython, pythonResult.status)}
                            <Typography variant="h6">Python Profile Validation Script</Typography>
                        </Box>
                        <IconButton size="small">
                            {showPython ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Collapse in={showPython}>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: '#111',
                                color: getTextColor(pythonResult.status),
                                fontFamily: 'monospace',
                                borderRadius: 1,
                                maxHeight: 200,
                                overflowY: 'auto',
                                overflowX: 'auto',
                                whiteSpace: 'pre',
                            }}
                        >
                            {loadingPython ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} color="inherit" />
                                </Box>
                            ) : (
                                pythonResult.output
                            )}
                        </Box>
                    </Collapse>
                </Box>

                {/* Orca Validator */}
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowOrca(!showOrca)}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(loadingOrca, orcaResult.status)}
                            <Typography variant="h6">OrcaSlicer Profile Validator</Typography>
                        </Box>
                        <IconButton size="small">
                            {showOrca ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Collapse in={showOrca}>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: '#111',
                                color: getTextColor(orcaResult.status),
                                fontFamily: 'monospace',
                                borderRadius: 1,
                                maxHeight: 200,
                                overflowY: 'auto',
                                overflowX: 'auto',
                                whiteSpace: 'pre',
                            }}
                        >
                            {loadingOrca ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} color="inherit" />
                                </Box>
                            ) : (
                                orcaResult.output
                            )}
                        </Box>
                    </Collapse>
                </Box>
            </Paper>
        </Box>
    );
}

export default ProfileValidatorPopup;
