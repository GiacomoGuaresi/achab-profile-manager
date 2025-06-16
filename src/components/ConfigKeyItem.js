import React from 'react';
import { Typography, Button, Box, Breadcrumbs, IconButton, Tooltip } from '@mui/material';

import definitionData from '../assets/definitions.json';

import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReplayIcon from '@mui/icons-material/Replay';


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
    index,
    changedKeys,
    handleRestoreValue
}) => {
    const hasFirstChildValue = isEditable;
    const reversedValues = values.slice().reverse();
    const backgroundColor = index % 2 === 0 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.05)';
    const tooltipData = definitionData[configKey]?.tooltip;
    const hasTooltip = Boolean(tooltipData);

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
            <Tooltip
                title={hasTooltip ? tooltipData : ''}
                arrow
                disableHoverListener={!hasTooltip}
                disableFocusListener={!hasTooltip}
                disableTouchListener={!hasTooltip}
            >
                <span>
                    <IconButton
                        size="small"
                        sx={{
                            mr: 1,
                            opacity: hasTooltip ? 1 : 0.3,
                            pointerEvents: hasTooltip ? 'auto' : 'none', // evita click se disabilitato
                        }}
                        aria-label={`Info about ${configKey}`}
                        disabled={!hasTooltip}
                    >
                        <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                </span>
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
                    const isChanged = isFirstChildValue && changedKeys[configKey] && hasFirstChildValue;
                    return (
                        <span
                            key={i}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: 'white',
                                border: isChanged ? '2px solid orange' : '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                margin: '0 4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                color: isChanged ? 'orange' : 'inherit',
                            }}
                        >
                            {isChanged && (
                                <Button
                                    onClick={() => handleRestoreValue(configKey)}
                                    size="small"
                                    sx={{ minWidth: '20px', padding: '2px', marginLeft: '4px' }}
                                    aria-label={`Edit ${configKey}`}
                                >
                                    <ReplayIcon fontSize="small" sx={{ color: 'orange' }} />
                                </Button>
                            )}
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

                {!hasFirstChildValue && (() => {
                    const isChanged = changedKeys[configKey];
                    return (
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: 'white',
                                border: isChanged ? '2px solid orange' : '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                margin: '0 4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                color: isChanged ? 'orange' : 'inherit',
                            }}
                        >
                            {isChanged && (
                                <Button
                                    onClick={() => handleRestoreValue(configKey)}
                                    size="small"
                                    sx={{ minWidth: '20px', padding: '2px', marginRight: '4px' }}
                                    aria-label={`Edit ${configKey}`}
                                >
                                    <ReplayIcon fontSize="small" sx={{ color: 'orange' }} />
                                </Button>
                            )}
                            <Button
                                onClick={() => handleAddChild(configKey)}
                                size="small"
                                sx={{ minWidth: '20px', padding: '2px' }}
                                aria-label={`Add child to ${configKey}`}
                            >
                                <AddCircleOutlineIcon fontSize="small" />
                            </Button>
                        </span>
                    )
                })()}
            </Breadcrumbs>
        </Box>
    );
};

export default ConfigKeyItem;