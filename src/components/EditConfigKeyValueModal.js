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
    coEnumOptions = [],
}) => {
    const [isPercent, setIsPercent] = useState(false);

    const isListType = ['coPoints', 'coStrings', 'coInts', 'coBools', 'coEnums', 'coFloats', 'coPercents'].includes(editType);

    let parsedValue;
    try {
        parsedValue = isListType ? JSON.parse(editValue || '[]') : editValue;
    } catch {
        parsedValue = isListType ? [] : editValue;
    }

    const wrapAsString = (val) => (val !== undefined && val !== null ? String(val) : '');

    const updateValue = (newValue) => {
        if (isListType) {
            setEditValue(JSON.stringify(newValue.map(wrapAsString)));
        } else {
            setEditValue(wrapAsString(newValue));
        }
    };

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
                        value={wrapAsString(parsedValue) || ''}
                        onChange={e => updateValue(e.target.value)}
                        variant="outlined"
                    />
                );
            case 'coInt':
            case 'coFloat':
            case 'coPercent':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={editType === 'coFloat' ? { step: 'any' } : editType === 'coPercent' ? { min: 0, max: 100 } : {}}
                        value={parsedValue || ''}
                        onChange={e => {
                            let val = e.target.value;
                            if (editType === 'coPercent') {
                                let intVal = parseInt(val);
                                if (intVal < 0) intVal = 0;
                                if (intVal > 100) intVal = 100;
                                updateValue(intVal);
                            } else {
                                updateValue(val);
                            }
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
                            onChange={e => updateValue(e.target.value)}
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
            case 'coBool':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={parsedValue === "1"}
                                onChange={e => updateValue(e.target.checked ? "1" : "0")}
                            />
                        }
                        label={parsedValue === "1" ? 'True' : 'False'}
                    />
                );
            case 'coEnum':
                return (
                    <Select
                        fullWidth
                        value={wrapAsString(parsedValue) || ''}
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
                        value={wrapAsString(parsedValue) || ''}
                        onChange={e => updateValue(e.target.value)}
                        variant="outlined"
                    />
                );
        }
    };

    const renderListInput = () => {
        const list = Array.isArray(parsedValue) ? parsedValue : [];

        const updateItem = (index, value) => {
            const newList = [...list];
            newList[index] = wrapAsString(value);
            updateValue(newList);
        };

        const addItem = () => {
            let defaultValue = '';
            if (editType === 'coBools') defaultValue = "0";
            else if (['coInts', 'coPercents'].includes(editType)) defaultValue = "0";
            else if (editType === 'coFloats') defaultValue = "0.0";
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
                                            checked={item === "1"}
                                            onChange={e => updateItem(i, e.target.checked ? "1" : "0")}
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
                                            onChange={e => updateItem(i, e.target.value)}
                                            size="small"
                                        />
                                    );
                                default:
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
                    <Button color="error" onClick={deleteEditValue}>Delete</Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={closeEditModal}>Cancel</Button>
                        <Button variant="contained" onClick={saveEditValue}>Set</Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditConfigKeyValueModal;
