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
}) => {
    const [isPercent, setIsPercent] = useState(() => {
        // Initialize isPercent based on whether editValue ends with '%'
        return typeof editValue === 'string' && editValue.endsWith('%');
    });

    const isListType = ['coPoints', 'coStrings', 'coInts', 'coBools', 'coEnums', 'coFloats', 'coPercents'].includes(editType);

    let parsedValue;
    try {
        parsedValue = isListType ? JSON.parse(editValue || '[]') : editValue;
    } catch {
        parsedValue = isListType ? [] : editValue;
    }

    const wrapAsString = (val) =>
        val !== undefined && val !== null ? String(val) : '';

    const updateValue = (newValue) => {
        if (isListType) {
            const stringList = newValue.map(wrapAsString);
            setEditValue(JSON.stringify(stringList));
        } else {
            // For coFloatOrPercent, append '%' if isPercent is true
            if (editType === 'coFloatOrPercent' && isPercent && newValue !== '' && !String(newValue).endsWith('%')) {
                setEditValue(wrapAsString(newValue) + '%');
            } else if (editType === 'coFloatOrPercent' && !isPercent && String(newValue).endsWith('%')) {
                setEditValue(wrapAsString(newValue).slice(0, -1));
            }
            else {
                setEditValue(wrapAsString(newValue));
            }
        }
    };

    const renderSingleInput = () => {
        switch (editType) {
            case 'coString':
            case 'coPoint':
            case 'coPoint3':
            case 'coEnum': // coEnum now remains a TextField as requested
                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={wrapAsString(parsedValue)}
                        onChange={(e) => updateValue(e.target.value)}
                        variant="outlined"
                    />
                );
            case 'coInt':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ step: '1' }}
                        value={wrapAsString(parsedValue)}
                        onChange={(e) => {
                            const val = Math.floor(Number(e.target.value));
                            updateValue(String(val));
                        }}
                        variant="outlined"
                    />
                );
            case 'coFloat':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ step: 'any' }}
                        value={wrapAsString(parsedValue)}
                        onChange={(e) => updateValue(e.target.value)}
                        variant="outlined"
                    />
                );
            case 'coPercent':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, max: 100 }}
                        value={wrapAsString(parsedValue)}
                        onChange={(e) => {
                            let num = Number(e.target.value); // Use Number for potential decimals during input
                            if (isNaN(num)) num = 0;
                            if (num < 0) num = 0;
                            if (num > 100) num = 100;
                            updateValue(String(Math.round(num))); // Round to integer for coPercent
                        }}
                        variant="outlined"
                    />
                );
            case 'coFloatOrPercent':
                return (
                    <>
                        <TextField
                            fullWidth
                            value={isPercent ? (wrapAsString(parsedValue).replace('%', '')) : wrapAsString(parsedValue)}
                            onChange={(e) => updateValue(e.target.value)}
                            variant="outlined"
                            placeholder='e.g., 10.5 or 25%'
                        />
                        <FormControlLabel
                            sx={{ mt: 1 }}
                            control={
                                <Switch
                                    checked={isPercent}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setIsPercent(checked);
                                        let currentValue = wrapAsString(parsedValue);
                                        if (checked && !currentValue.endsWith('%')) {
                                            updateValue(currentValue + '%');
                                        } else if (!checked && currentValue.endsWith('%')) {
                                            updateValue(currentValue.slice(0, -1));
                                        }
                                    }}
                                />
                            }
                            label="Is Percent"
                        />
                    </>
                );
            case 'coBool':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={wrapAsString(parsedValue) === "1"}
                                onChange={(e) =>
                                    updateValue(e.target.checked ? "1" : "0")
                                }
                            />
                        }
                        label={wrapAsString(parsedValue) === "1" ? 'True' : 'False'}
                    />
                );
            default:
                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={wrapAsString(parsedValue)}
                        onChange={(e) => updateValue(e.target.value)}
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
            if (['coBools', 'coInts', 'coPercents'].includes(editType))
                defaultValue = "0";
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
                    <Box
                        key={i}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            gap: 1
                        }}
                    >
                        {(() => {
                            switch (editType) {
                                case 'coBools':
                                    return (
                                        <Switch
                                            checked={wrapAsString(item) === "1"}
                                            onChange={(e) =>
                                                updateItem(
                                                    i,
                                                    e.target.checked ? "1" : "0"
                                                )
                                            }
                                        />
                                    );
                                case 'coInts':
                                case 'coPercents':
                                    return (
                                        <TextField
                                            type="number"
                                            inputProps={
                                                editType === 'coPercents'
                                                    ? { min: 0, max: 100, step: '1' }
                                                    : { step: '1' }
                                            }
                                            value={wrapAsString(item)}
                                            onChange={(e) => {
                                                let val = Math.floor(Number(e.target.value));
                                                if (editType === 'coPercents') {
                                                    if (val < 0) val = 0;
                                                    if (val > 100) val = 100;
                                                }
                                                updateItem(i, String(val));
                                            }}
                                            size="small"
                                        />
                                    );
                                case 'coFloats':
                                    return (
                                        <TextField
                                            type="number"
                                            inputProps={{ step: 'any' }}
                                            value={wrapAsString(item)}
                                            onChange={(e) =>
                                                updateItem(
                                                    i,
                                                    e.target.value
                                                )
                                            }
                                            size="small"
                                        />
                                    );
                                default: // coPoints, coStrings, coEnums will use default TextField
                                    return (
                                        <TextField
                                            value={wrapAsString(item)}
                                            onChange={(e) =>
                                                updateItem(i, e.target.value)
                                            }
                                            size="small"
                                        />
                                    );
                            }
                        })()}
                        <Button
                            color="error"
                            onClick={() => removeItem(i)}
                            size="small"
                        >
                            Remove
                        </Button>
                    </Box>
                ))}
                <Button variant="outlined" onClick={addItem} size="small">
                    Add item
                </Button>
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
                    maxWidth: '90%'
                }}
            >
                <Typography id="edit-value-modal-title" variant="h6" gutterBottom>
                    Edit value for: {editKey}
                </Typography>

                {isListType ? renderListInput() : renderSingleInput()}

                <Box
                    sx={{
                        mt: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
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