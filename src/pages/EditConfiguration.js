import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';

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
  const location = useLocation();
  const navigate = useNavigate();

  const nodeInfo = location.state?.nodeInfo;

  const [config, setConfig] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [error, setError] = useState(null);
  const [fullValue, setFullValue] = useState(null);

  const [firstConfig, setFirstConfig] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');

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
    console.log('Add child for key:', key);
  }, []);

  const handleNewKeyChange = useCallback((e) => {
    setNewKey(e.target.value);
  }, []);

  const handleAddNewKey = useCallback(() => {
    console.log('Add new key:', newKey);
    setNewKey('');
  }, [newKey]);

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
    setEditValues(prev => ({ ...prev, [editKey]: editValue }));
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      if (newConfig[editKey]) {
        newConfig[editKey] = [editValue, ...newConfig[editKey].slice(1)];
      }
      return newConfig;
    });
    closeEditModal();
  }, [editKey, editValue, closeEditModal]);

  useEffect(() => {
    if (!nodeInfo?.data?.filePath) return;

    async function load() {
      try {
        const chain = await loadConfigsChain(nodeInfo.data.filePath);
        setFirstConfig(chain[0]);
        const breadcrumbItems = chain.map(cfg => cleanString(cfg.name || 'Unnamed'));
        const allKeys = new Set(chain.flatMap(cfg => Object.keys(cfg)));
        const mergedConfig = {};

        allKeys.forEach((key) => {
          const valuesChain = chain.map(cfg => cfg[key]).filter(v => v !== undefined);
          mergedConfig[key] = valuesChain;
        });

        if (Object.keys(editValues).length > 0) {
          Object.entries(editValues).forEach(([k, v]) => {
            if (mergedConfig[k]) {
              mergedConfig[k][0] = v;
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
  }, [nodeInfo, editValues, loadConfigsChain]);


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
        <Box>
          {Object.entries(config).map(([key, values], index) => {
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
              />
            );
          })}
          <AddNewConfigKeyInput
            newKey={newKey}
            handleNewKeyChange={handleNewKeyChange}
            handleAddNewKey={handleAddNewKey}
          />
        </Box>

        <ShowConfigKeyFullValueModal fullValue={fullValue} handleCloseFullValue={handleCloseFullValue} />
      </Box>

      <EditConfigKeyValueModal
        editKey={editKey}
        editValue={editValue}
        setEditValue={setEditValue}
        saveEditValue={saveEditValue}
        closeEditModal={closeEditModal}
      />
    </>
  );
};

export default EditConfiguration;