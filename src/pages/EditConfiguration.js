import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import path from 'path-browserify';

const EditConfiguration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const nodeInfo = location.state?.nodeInfo;
  const filePath = nodeInfo?.data?.filePath;

  const [fileData, setFileData] = useState({});
  const [loading, setLoading] = useState(true);

  const loadConfigWithInheritance = async (currentPath, visited = new Set()) => {
    console.log(currentPath);
    if (visited.has(currentPath)) return {};
    visited.add(currentPath);

    const response = await window.api.readSingleConfig(currentPath);
    if (!response.success) return { __error__: response.error };

    const data = response.data;
    const currentDir = path.dirname(currentPath);
    let inheritedData = {};

    if (data.inherits) {
      console.log(currentDir);
      console.log(data.inherits);
      const result = await window.api.findConfigByName(currentDir, data.inherits);
      if (result.success) {
        inheritedData = await loadConfigWithInheritance(result.path, visited);
      } else {
        inheritedData = { [`[missing parent: ${data.inherits}]`]: '[Not found]' };
      }
    }

    const merged = { ...inheritedData, ...data };

    // Rendi ogni array una stringa JSON (sia da inheritedData che da data)
    Object.entries(merged).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        merged[key] = JSON.stringify(value);
      }
    });

    // Per i campi sovrascritti: salva entrambi (parent e override) come stringa JSON
    Object.entries(data).forEach(([key, value]) => {
      if (key in inheritedData && key !== 'inherits') {
        merged[key] = [
          JSON.stringify(inheritedData[key]),
          JSON.stringify(value)
        ];
      }
    });
    
    return merged;
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await loadConfigWithInheritance(filePath);
      setFileData(data);
      setLoading(false);
    };

    loadData();
  }, [filePath]);

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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fileData.__error__) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{fileData.__error__}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Configuration for: {nodeInfo.data?.label || nodeInfo.id}
      </Typography>

      <Box sx={{ mt: 3 }}>
        {Object.entries(fileData).map(([key, value]) => {
          if (key === 'inherits') return null;

          const breadcrumbItems = Array.isArray(value)
            ? value
            : [value];

          return (
            <Box
              key={key}
              sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
            >
              <Typography variant="subtitle2" sx={{ minWidth: 180, fontWeight: 'bold' }}>
                {key}
              </Typography>
              <Breadcrumbs separator="›" aria-label="breadcrumb">
                {breadcrumbItems.map((v, i) => (
                  <Link key={i} underline="hover" color="inherit">
                    {String(v)}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>
          );
        })}
      </Box>

      <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
        Back
      </Button>
    </Box>
  );
};

export default EditConfiguration;
