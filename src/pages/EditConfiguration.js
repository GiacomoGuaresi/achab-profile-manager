import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, Breadcrumbs, Link, Modal, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const EditConfiguration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const nodeInfo = location.state?.nodeInfo;

  const [config, setConfig] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [error, setError] = useState(null);
  const [fullValue, setFullValue] = useState(null); // stato per il valore completo nel popup

  const [firstConfig, setFirstConfig] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');

  const shortenValue = (val, maxLen = 20) => {
    const str = typeof val === 'string' ? val : String(val);
    if (str.length > maxLen) {
      return str.slice(0, maxLen) + '...';
    }
    return str;
  };

  // funzione per mostrare il popup con il valore completo
  const handleOpenFullValue = (val) => {
    setFullValue(val);
  };

  const handleCloseFullValue = () => {
    setFullValue(null);
  };
  const cleanString = (val) => {
    if (typeof val === 'string') return val.replace(/\n/g, '');
    return String(val);
  };

  const loadConfigsChain = async (filePath) => {
    const configsChain = [];

    let currentPath = filePath;
    const dir = currentPath.substring(0, currentPath.lastIndexOf('/'));

    while (currentPath) {
      const res = await window.api.readSingleConfig(currentPath);
      if (!res.success) {
        throw new Error(`Error loading config: ${res.error}`);
      }
      const currentConfig = res.data;
      configsChain.push(currentConfig);

      if (currentConfig.inherits) {
        // Cerca file padre
        const findRes = await window.api.findConfigByName(dir, currentConfig.inherits);
        if (!findRes.success) {
          throw new Error(`Inherited config not found: ${findRes.error}`);
        }
        currentPath = findRes.path;
      } else {
        currentPath = null; // fine catena
      }
    }

    // configsChain è array [figlio, padre, nonno, ...]
    return configsChain;
  };

  // Handler vuoto per il tasto +
  const handleAddChild = (key) => {
    // Non fa nulla per ora
    console.log('Add child for key:', key);
  };

  // Handler vuoto per il campo di testo nuova chiave
  const handleNewKeyChange = (e) => {
    setNewKey(e.target.value);
  };

  const handleAddNewKey = () => {
    // Non fa nulla per ora
    console.log('Add new key:', newKey);
    setNewKey('');
  };

  useEffect(() => {
    if (!nodeInfo?.data?.filePath) return;

    async function load() {
      try {
        const chain = await loadConfigsChain(nodeInfo.data.filePath);

        setFirstConfig(chain[0]);

        // Prendi tutti i nomi per il breadcrumb generale
        const breadcrumbItems = chain.map(cfg => cleanString(cfg.name || 'Unnamed'));

        // Unisci le chiavi da tutti i config in un set
        const allKeys = new Set(chain.flatMap(cfg => Object.keys(cfg)));

        // Per ogni chiave costruisci array valori dal figlio verso il padre
        const mergedConfig = {};
        allKeys.forEach((key) => {
          const valuesChain = chain.map(cfg => cfg[key]).filter(v => v !== undefined);
          mergedConfig[key] = valuesChain;
        });

        if (Object.keys(editValues).length > 0) {
          // aggiorna mergedConfig con editValues sovrascrivendo i valori
          Object.entries(editValues).forEach(([k, v]) => {
            if (mergedConfig[k]) {
              mergedConfig[k][0] = v; // aggiorna solo il valore del primo figlio (indice 0)
            }
          });
        }

        setConfig(mergedConfig);
        setBreadcrumb(breadcrumbItems);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [nodeInfo]);

  // funzione per aprire la modale edit per un campo
  const openEditModal = (key) => {
    // prendi il valore originale da mergedConfig
    const currentVal = config[key]?.[0];
    setEditKey(key);
    setEditValue(currentVal ?? '');
  };

  // funzione salva edit
  const saveEditValue = () => {
    setEditValues(prev => ({ ...prev, [editKey]: editValue }));

    // aggiorna config localmente (modifica solo il primo valore)
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      if (newConfig[editKey]) {
        newConfig[editKey] = [editValue, ...newConfig[editKey].slice(1)];
      }
      return newConfig;
    });

    setEditKey(null);
    setEditValue('');
  };

  if (!nodeInfo) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          No node data provided.
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading configuration...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 3 }}>
          Back
        </Button>
        {/* ... header, breadcrumb principale */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          {breadcrumb.slice().reverse().map((item, i, arr) => (
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

        <Box>
          {Object.entries(config).map(([key, values]) => {
            const isEditable = firstConfig && Object.prototype.hasOwnProperty.call(firstConfig, key);
            const hasFirstChildValue = isEditable; // come definito nel tuo codice
            const reversedValues = values.slice().reverse();

            return (
              <Box key={key} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" component="div" sx={{ flex: 1 }}>
                  <strong>{key}:</strong>{' '}
                  <Breadcrumbs aria-label="breadcrumb" separator=">">
                    {reversedValues.map((val, i) => {
                      const short = shortenValue(val);
                      const isTruncated = short !== (typeof val === 'string' ? val : String(val));
                      const isFirstChildValue = i === reversedValues.length - 1;

                      return (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span
                            onClick={() => isTruncated && handleOpenFullValue(val)}
                            style={{
                              cursor: isTruncated ? 'pointer' : 'default',
                              textDecoration: isTruncated ? 'underline dotted' : 'none',
                            }}
                            title={isTruncated ? 'Click to see full value' : undefined}
                          >
                            {short}
                          </span>

                          {isFirstChildValue && isEditable && (
                            <Button
                              onClick={() => openEditModal(key)}
                              size="small"
                              sx={{ minWidth: '20px', padding: '2px', marginLeft: '4px' }}
                              aria-label={`Edit ${key}`}
                            >
                              <EditIcon fontSize="small" />
                            </Button>
                          )}
                        </span>
                      );
                    })}

                    {/* Se NON ha firstChildValue, aggiungo icona + accanto all'ultimo elemento */}
                    {!hasFirstChildValue && (
                      <IconButton
                        size="small"
                        onClick={() => handleAddChild(key)}
                        aria-label={`Add child to ${key}`}
                        sx={{ ml: 1 }}
                      >
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Breadcrumbs>
                </Typography>
              </Box>
            );
          })}

          {/* Campo di testo per aggiungere una nuova chiave */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="Add new key"
              variant="outlined"
              size="small"
              value={newKey}
              onChange={handleNewKeyChange}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleAddNewKey} disabled={!newKey.trim()}>
              Add
            </Button>
          </Box>
        </Box>

        {/* Modal per valore completo */}
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
      </Box>
      <Modal
        open={!!editKey}
        onClose={() => setEditKey(null)}
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
            <Button variant="outlined" onClick={() => setEditKey(null)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={saveEditValue}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default EditConfiguration;