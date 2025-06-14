import React from 'react';
import { Typography, Button, Box, Breadcrumbs, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const shortenValue = (val, maxLen = 20) => {
    const str = typeof val === 'string' ? val : String(val);
    if (str.length > maxLen) {
        return str.slice(0, maxLen) + '...';
    }
    return str;
};

const ConfigKeyItem = ({
    configKey,
    values,
    isEditable,
    openEditModal,
    handleAddChild,
    handleOpenFullValue,
    index
}) => {
    const hasFirstChildValue = isEditable;
    const reversedValues = values.slice().reverse();
    const backgroundColor = index % 2 === 0 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.05)';

    return (
        <Box
            sx={{
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                backgroundColor,
                borderRadius: 1,
                p: 1,
            }}
        >
            <Tooltip title="Lorem ipsum dolor sit amet, consectetur adipiscing elit." arrow>
                <IconButton size="small" sx={{ mr: 1 }} aria-label={`Info about ${configKey}`}>
                    <InfoOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Typography
                variant="body1"
                component="div"
                sx={{ fontWeight: 'bold', mr: 1, whiteSpace: 'nowrap' }}
            >
                {configKey}:
            </Typography>

            <Breadcrumbs
                aria-label="breadcrumb"
                separator=">"
                sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
            >
                {reversedValues.map((val, i) => {
                    const short = shortenValue(val);
                    const isTruncated = short !== (typeof val === 'string' ? val : String(val));
                    const isFirstChildValue = i === reversedValues.length - 1;

                    return (
                        <span
                            key={i}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: 'white',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                margin: '0 4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                        >
                            <span
                                onClick={() => isTruncated && handleOpenFullValue(val)}
                                style={{
                                    cursor: isTruncated ? 'pointer' : 'default',
                                    textDecoration: isTruncated ? 'underline dotted' : 'none',
                                    whiteSpace: 'nowrap',
                                }}
                                title={isTruncated ? 'Click to see full value' : undefined}
                            >
                                {short}
                            </span>

                            {isFirstChildValue && isEditable && (
                                <Button
                                    onClick={() => openEditModal(configKey)}
                                    size="small"
                                    sx={{ minWidth: '20px', padding: '2px', marginLeft: '4px' }}
                                    aria-label={`Edit ${configKey}`}
                                >
                                    <EditIcon fontSize="small" />
                                </Button>
                            )}
                        </span>
                    );
                })}

                {!hasFirstChildValue && (
                    <IconButton
                        size="small"
                        onClick={() => handleAddChild(configKey)}
                        aria-label={`Add child to ${configKey}`}
                        sx={{
                            ml: 1,
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}
                    >
                        <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                )}
            </Breadcrumbs>
        </Box>
    );
};

export default ConfigKeyItem;