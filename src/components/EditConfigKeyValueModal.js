
import React from 'react';
import { Typography, Button, Box, Modal } from '@mui/material';


const EditConfigKeyValueModal = ({ editKey, editValue, setEditValue, saveEditValue, closeEditModal }) => (
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
            <textarea
                style={{ width: '100%', minHeight: 100, fontFamily: 'monospace', fontSize: 14 }}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" onClick={closeEditModal}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={saveEditValue}>
                    Save
                </Button>
            </Box>
        </Box>
    </Modal>
);

export default EditConfigKeyValueModal;