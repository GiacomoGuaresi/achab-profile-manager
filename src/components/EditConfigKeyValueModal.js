import React, { useState } from 'react';
import { Typography, Button, Box, Modal, TextField, Switch, FormControlLabel, MenuItem, Select } from '@mui/material';

const EditConfigKeyValueModal = ({
    editKey,
    editValue,
    editType,
    setEditValue,
    saveEditValue,
    deleteEditValue,
    closeEditModal,
    coEnumOptions = [], // opzionale: lista opzioni per coEnum e coEnums
}) => {
    // Stato interno per coFloatOrPercent toggle
    const [isPercent, setIsPercent] = useState(false);

    // Helper per gestire lista di valori (array) o singolo valore
    const isListType = ['coPoints', 'coStrings', 'coInts', 'coBools', 'coEnums', 'coFloats', 'coPercents'].includes(editType);

    // Parsing iniziale dell'editValue, supponiamo sia JSON se lista, stringa altrimenti
    let parsedValue;
    try {
        parsedValue = isListType ? JSON.parse(editValue || '[]') : editValue;
    } catch {
        parsedValue = isListType ? [] : editValue;
    }

    // Setter wrapper che converte in stringa se lista
    const updateValue = (newValue) => {
        if (isListType) {
            setEditValue(JSON.stringify(newValue));
        } else {
            setEditValue(newValue);
        }
    };

    // Render input singolo
    const renderSingleInput = () => {
        switch (editType) {
            case 'coString':
            case 'coPoint':
            case 'coPoint3':
                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={parsedValue || ''}
                        onChange={e => updateValue(e.target.value)}
                        variant="outlined"
                    />
                );
            case 'coInt':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        value={parsedValue || ''}
                        onChange={e => updateValue(parseInt(e.target.value) || 0)}
                        variant="outlined"
                    />
                );
            case 'coFloat':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ step: 'any' }}
                        value={parsedValue || ''}
                        onChange={e => updateValue(parseFloat(e.target.value) || 0)}
                        variant="outlined"
                    />
                );
            case 'coBool':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!parsedValue}
                                onChange={e => updateValue(e.target.checked)}
                            />
                        }
                        label={parsedValue ? 'True' : 'False'}
                    />
                );
            case 'coPercent':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, max: 100 }}
                        value={parsedValue || 0}
                        onChange={e => {
                            let val = parseInt(e.target.value);
                            if (val < 0) val = 0;
                            if (val > 100) val = 100;
                            updateValue(val);
                        }}
                        variant="outlined"
                    />
                );
            case 'coFloatOrPercent':
                return (
                    <>
                        <TextField
                            fullWidth
                            type="number"
                            inputProps={{ step: 'any', min: 0 }}
                            value={parsedValue || ''}
                            onChange={e => updateValue(parseFloat(e.target.value) || 0)}
                            variant="outlined"
                        />
                        <FormControlLabel
                            sx={{ mt: 1 }}
                            control={
                                <Switch
                                    checked={isPercent}
                                    onChange={e => setIsPercent(e.target.checked)}
                                />
                            }
                            label="Percent"
                        />
                    </>
                );
            case 'coEnum':
                return (
                    <Select
                        fullWidth
                        value={parsedValue || ''}
                        onChange={e => updateValue(e.target.value)}
                    >
                        {coEnumOptions.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>
                );
            default:
                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={parsedValue || ''}
                        onChange={e => updateValue(e.target.value)}
                        variant="outlined"
                    />
                );
        }
    };

    // Render input lista (array)
    const renderListInput = () => {
        const list = Array.isArray(parsedValue) ? parsedValue : [];
        const updateItem = (index, value) => {
            const newList = [...list];
            newList[index] = value;
            updateValue(newList);
        };
        const addItem = () => {
            let defaultValue;
            if (['coBools'].includes(editType)) defaultValue = false;
            else if (['coInts', 'coPercents'].includes(editType)) defaultValue = 0;
            else if (['coFloats'].includes(editType)) defaultValue = 0.0;
            else defaultValue = '';
            updateValue([...list, defaultValue]);
        };
        const removeItem = (index) => {
            const newList = [...list];
            newList.splice(index, 1);
            updateValue(newList);
        };

        return (
            <Box>
                {list.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        {(() => {
                            switch (editType) {
                                case 'coBools':
                                    return (
                                        <Switch
                                            checked={!!item}
                                            onChange={e => updateItem(i, e.target.checked)}
                                        />
                                    );
                                case 'coInts':
                                case 'coPercents':
                                    return (
                                        <TextField
                                            type="number"
                                            inputProps={editType === 'coPercents' ? { min: 0, max: 100 } : {}}
                                            value={item}
                                            onChange={e => {
                                                let val = parseInt(e.target.value);
                                                if (editType === 'coPercents') {
                                                    if (val < 0) val = 0;
                                                    if (val > 100) val = 100;
                                                }
                                                updateItem(i, val);
                                            }}
                                            size="small"
                                        />
                                    );
                                case 'coFloats':
                                    return (
                                        <TextField
                                            type="number"
                                            inputProps={{ step: 'any' }}
                                            value={item}
                                            onChange={e => updateItem(i, parseFloat(e.target.value) || 0)}
                                            size="small"
                                        />
                                    );
                                default: // coPoints, coStrings, coEnums
                                    return (
                                        <TextField
                                            value={item}
                                            onChange={e => updateItem(i, e.target.value)}
                                            size="small"
                                        />
                                    );
                            }
                        })()}
                        <Button color="error" onClick={() => removeItem(i)} size="small">Remove</Button>
                    </Box>
                ))}
                <Button variant="outlined" onClick={addItem} size="small">Add item</Button>
            </Box>
        );
    };

    return (
        <Modal
            open={!!editKey}
            onClose={closeEditModal}
            aria-labelledby="edit-value-modal-title"
            aria-describedby="edit-value-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 3,
                    width: 400,
                    maxWidth: '90%',
                }}
            >
                <Typography id="edit-value-modal-title" variant="h6" gutterBottom>
                    Edit value for: {editKey}
                </Typography>

                {isListType ? renderListInput() : renderSingleInput()}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button color="error" onClick={deleteEditValue}>
                        Delete
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={closeEditModal}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={saveEditValue}>
                            Set
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditConfigKeyValueModal;
