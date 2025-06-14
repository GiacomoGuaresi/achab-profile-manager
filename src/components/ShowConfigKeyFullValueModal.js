
import React from 'react';
import { Typography, Button, Box, Modal } from '@mui/material';

const ShowConfigKeyFullValueModal = ({ fullValue, handleCloseFullValue }) => (
    <Modal
        open={!!fullValue}
        onClose={handleCloseFullValue}
        aria-labelledby="full-value-modal-title"
        aria-describedby="full-value-modal-description"
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
                maxWidth: '90%',
                maxHeight: '80%',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                outline: 'none',
            }}
        >
            <Typography id="full-value-modal-description" variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {fullValue}
            </Typography>
            <Button onClick={handleCloseFullValue} sx={{ mt: 2 }} variant="contained" fullWidth>
                Close
            </Button>
        </Box>
    </Modal>
);

export default ShowConfigKeyFullValueModal;