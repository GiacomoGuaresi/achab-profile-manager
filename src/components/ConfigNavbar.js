import React from 'react';
import { Breadcrumbs, Link, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ConfigBreadcrumbs = ({ breadcrumbItems, navigate }) => (
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
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
        >
            Back
        </Button>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0 }}>
            {breadcrumbItems.slice().reverse().map((item, i, arr) => (
                <Link
                    key={i}
                    underline="hover"
                    color={i === arr.length - 1 ? 'text.primary' : 'inherit'}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                >
                    {item}
                </Link>
            ))}
        </Breadcrumbs>
    </Box>
);

export default ConfigBreadcrumbs;