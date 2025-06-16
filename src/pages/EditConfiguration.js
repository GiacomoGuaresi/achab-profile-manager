import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, TextField } from '@mui/material';
import { useFileActions } from '../FileActionsContext';

import ConfigKeyItem from '../components/ConfigKeyItem';
import ConfigNavbar from '../components/ConfigNavbar';
import ShowConfigKeyFullValueModal from '../components/ShowConfigKeyFullValueModal';
import EditConfigKeyValueModal from '../components/EditConfigKeyValueModal';
import AddNewConfigKeyInput from '../components/AddNewConfigKeyInput';

const cleanString = (val) => {
  if (typeof val === 'string') return val.replace(/\n/g, '');
  return String(val);
};

const EditConfiguration = () => {
  const { setActions } = useFileActions();
  const location = useLocation();
  const navigate = useNavigate();

  const nodeInfo = location.state?.nodeInfo;

  const [config, setConfig] = useState(null);
  const draftCopyRef = useRef({});
  const originalRef = useRef({});
  const [changedKeys, setChangedKeys] = React.useState({});

  const [breadcrumb, setBreadcrumb] = useState([]);
  const [error, setError] = useState(null);
  const [fullValue, setFullValue] = useState(null);

  const [firstConfig, setFirstConfig] = useState(null);
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const filteredConfigEntries = Object.entries(config || {}).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const setValue = useCallback((key, value) => {
    draftCopyRef.current = { ...draftCopyRef.current, [key]: value };

    try {
      draftCopyRef.current = {
        ...draftCopyRef.current,
        [key]: JSON.parse(value)
      };
    } catch (e) {
      window.alert("Invalid JSON string:", value, e);
      return;
    }

    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      if (newConfig[key]) {
        newConfig[key] = [value, ...newConfig[key].slice(1)];
      }
      return newConfig;
    });

    if (JSON.stringify(draftCopyRef.current[key]) === JSON.stringify(originalRef.current[key]))
      setChangedKeys(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    else
      setChangedKeys(prev => ({ ...prev, [key]: true }));

  }, []);

  const deleteValue = useCallback((key) => {
    // Se la chiave non esiste o l'array è vuoto, non fare nulla
    const draftArray = draftCopyRef.current[key];
    if (!Array.isArray(draftArray) || draftArray.length === 0) return;

    // Rimuove il primo elemento da draftCopyRef
    const updatedDraftArray = draftArray.slice(1);
    draftCopyRef.current = {
      ...draftCopyRef.current,
      [key]: updatedDraftArray
    };

    // Aggiorna firstConfig con il nuovo primo valore (o null/undefined se vuoto)
    setFirstConfig(prev => {
      const newConfig = { ...prev };
      delete newConfig[key];
      return newConfig;
    });


    // Aggiorna config rimuovendo il primo valore
    setConfig(prevConfig => {
      const configArray = prevConfig[key];
      if (!Array.isArray(configArray) || configArray.length === 0) return prevConfig;

      const updatedConfigArray = configArray.slice(1);
      return {
        ...prevConfig,
        [key]: updatedConfigArray
      };
    });

    if (originalRef.current[key] == undefined)
      setChangedKeys(prev => ({ ...prev, [key]: false }));
    else
      setChangedKeys(prev => ({ ...prev, [key]: true }));
  }, []);

  const addValue = useCallback((key) => {
    const emptyValue = '""'; // o '{}', o altro valore JSON vuoto

    const parsedEmptyValue = JSON.parse(emptyValue);

    // Aggiorna draftCopyRef aggiungendo il nuovo valore vuoto in cima all'array per la chiave
    draftCopyRef.current = {
      ...draftCopyRef.current,
      [key]: draftCopyRef.current[key] ? [parsedEmptyValue, ...[].concat(draftCopyRef.current[key])] : [parsedEmptyValue]
    };

    // Aggiorna firstConfig impostando il valore vuoto come nuovo valore "principale" per la chiave
    setFirstConfig(prev => ({
      ...prev,
      [key]: parsedEmptyValue,
    }));

    // Aggiorna lo stato config aggiungendo il nuovo valore vuoto in cima alla lista valori
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      if (newConfig[key]) {
        newConfig[key] = [emptyValue, ...newConfig[key]];
      } else {
        newConfig[key] = [emptyValue];
      }
      return newConfig;
    });

    // Segna la chiave come modificata
    setChangedKeys(prev => ({ ...prev, [key]: true }));
  }, []);


  const save = () => {
    window.api.saveConfig(nodeInfo.data.filePath, draftCopyRef.current)
      .then((res) => {
        if (res.success) {
          window.alert("Configuration saved successfully!");
          setChangedKeys({});
          // Reload the page to reflect changes
          window.location.reload();
        } else {
          window.alert(`Error saving configuration: ${res.error}`);
        }
      })
      .catch((err) => {
        window.alert(`Error saving configuration: ${err.message}`);
      });
  };

  const discard = () => {
    // reload the page to discard changes
    window.location.reload();
  };

  const openInFileExplorer = () => {
    window.api.openInFileExplorer(nodeInfo.data.filePath)
      .then((res) => {
        if (!res.success) {
          window.alert(`Error opening file in file explorer: ${res.error}`);
        }
      })
      .catch((err) => {
        window.alert(`Error opening file in file explorer: ${err.message}`);
      });
  };

  const openInTextEditor = () => {
    window.api.openInTextEditor(nodeInfo.data.filePath)
      .then((res) => {
        if (!res.success) {
          window.alert(`Error opening file in text editor: ${res.error}`);
        }
      })
      .catch((err) => {
        window.alert(`Error opening file in text editor: ${err.message}`);
      });
  };

  const handleOpenFullValue = useCallback((val) => {
    setFullValue(val);
  }, []);

  const handleCloseFullValue = useCallback(() => {
    setFullValue(null);
  }, []);

  const loadConfigsChain = useCallback(async (filePath) => {
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
        const findRes = await window.api.findConfigByName(dir, currentConfig.inherits);
        if (!findRes.success) {
          throw new Error(`Inherited config not found: ${findRes.error}`);
        }
        currentPath = findRes.path;
      } else {
        currentPath = null;
      }
    }
    return configsChain;
  }, []);

  const handleAddChild = useCallback((key) => {
    addValue(key);
  }, []);

  const handleNewKeyChange = useCallback((e) => {
    setNewKey(e.target.value);
  }, []);

  const handleAddNewKey = useCallback(() => {
    if (!newKey.trim()) {
      window.alert("Key cannot be empty");
      return;
    }

    // Se la chiave esiste già, avvisa e non fare nulla
    if (config && config.hasOwnProperty(newKey)) {
      window.alert(`Key "${newKey}" already exists.`);
      return;
    }

    // Aggiungi la nuova chiave con array vuoto temporaneo (poi handleAddChild aggiungerà il valore)
    setConfig(prevConfig => ({
      ...prevConfig,
      [newKey]: [],
    }));

    // Aggiorna firstConfig con chiave nuova e valore vuoto (ad es. "")
    setFirstConfig(prev => ({
      ...prev,
      [newKey]: '',
    }));

    // Aggiungi la nuova chiave anche a draftCopyRef con valore vuoto (per coerenza)
    draftCopyRef.current = {
      ...draftCopyRef.current,
      [newKey]: '',
    };

    // Chiama handleAddChild per aggiungere valore vuoto come primo elemento per la nuova chiave
    handleAddChild(newKey);

    // Reset input
    setNewKey('');
  }, [newKey, config, handleAddChild]);

  const openEditModal = useCallback((key) => {
    const currentVal = config[key]?.[0];
    setEditKey(key);
    setEditValue(currentVal ?? '');
  }, [config]);

  const closeEditModal = useCallback(() => {
    setEditKey(null);
    setEditValue('');
  }, []);

  const saveEditValue = useCallback(() => {
    setValue(editKey, editValue);
    closeEditModal();
  }, [editKey, editValue, setValue]);


  const deleteEditValue = useCallback(() => {
    deleteValue(editKey);
    closeEditModal();
  }, [editKey, closeEditModal, firstConfig]);

  const handleRestoreValue = useCallback((key) => {
    const originalValue = originalRef.current[key];
    if (originalValue !== undefined) {
      if (draftCopyRef.current[key] === undefined || draftCopyRef.current[key].length == 0)
        addValue(key);

      const originalString = JSON.stringify(originalValue, null, 2); // bello formattato per l’editor
      setValue(key, originalString);
    }
    else {
      deleteValue(key);
    }

  }, [firstConfig, setValue]);


  useEffect(() => {
    setActions({ save, discard, openInFileExplorer, openInTextEditor });

    if (!nodeInfo?.data?.filePath) return;

    async function load() {
      try {
        const chain = await loadConfigsChain(nodeInfo.data.filePath);
        setFirstConfig(chain[0]);
        const breadcrumbItems = chain.map(cfg => cleanString(cfg.name || 'Unnamed'));
        const allKeys = new Set(chain.flatMap(cfg => Object.keys(cfg)));
        const mergedConfig = {};

        draftCopyRef.current = { ...chain[0] };
        originalRef.current = { ...chain[0] };

        allKeys.forEach((key) => {
          const valuesChain = chain.map(cfg => cfg[key]).filter(v => v !== undefined).map(v => JSON.stringify(v));
          mergedConfig[key] = valuesChain;
        });

        // Sort mergedConfig alphabetically
        const sortedConfig = Object.keys(mergedConfig)
          .sort()
          .reduce((obj, key) => {
            obj[key] = mergedConfig[key];
            return obj;
          }, {});


        setConfig(sortedConfig);
        setBreadcrumb(breadcrumbItems);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }

    load();

    return () => setActions({ save: () => { }, discard: () => { }, openInFileExplorer: () => { }, openInTextEditor: () => { } });
  }, [nodeInfo, loadConfigsChain]);


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
      <ConfigNavbar breadcrumbItems={breadcrumb} navigate={navigate} />
      <Box sx={{ p: 3 }}>
        <TextField
          label="Search config key"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box>
          {filteredConfigEntries.map(([key, values], index) => {
            const isEditable = firstConfig && Object.prototype.hasOwnProperty.call(firstConfig, key);
            return (
              <ConfigKeyItem
                key={key}
                configKey={key}
                values={values}
                isEditable={isEditable}
                openEditModal={openEditModal}
                handleAddChild={handleAddChild}
                handleOpenFullValue={handleOpenFullValue}
                index={index}
                changedKeys={changedKeys}
                handleRestoreValue={handleRestoreValue}
              />
            );
          })}
          <AddNewConfigKeyInput
            newKey={newKey}
            handleNewKeyChange={handleNewKeyChange}
            handleAddNewKey={handleAddNewKey}
          />
        </Box>

        <ShowConfigKeyFullValueModal
          fullValue={fullValue}
          handleCloseFullValue={handleCloseFullValue}
        />
      </Box>

      <EditConfigKeyValueModal
        editKey={editKey}
        editValue={editValue}
        setEditValue={setEditValue}
        saveEditValue={saveEditValue}
        closeEditModal={closeEditModal}
        deleteEditValue={deleteEditValue}
      />
    </>
  );
};

export default EditConfiguration;
