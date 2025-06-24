import React, { useEffect, useCallback, useState } from 'react';
import { Box } from '@mui/material';
import GitNavbar from '../components/GitNavbar';
import ChangeList from '../components/ChangeList';
import FileViewer from '../components/FileViewer';
import CommitPanel from '../components/CommitPanel';

import { useNotification } from '../NotificationProvider';

const Git = () => {
  const { notify } = useNotification();

  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [pullCount, setPullCount] = useState(0);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    async function fetchGitInfo() {
      try {
        const [branchesList, currentBranch, behindCount, changedFiles] = await Promise.all([
          window.api.getBranches(),
          window.api.getCurrentBranch(),
          window.api.getPullCount(),
          window.api.getChangedFiles(),
        ]);

        setBranches(branchesList);
        setBranch(currentBranch);
        setPullCount(behindCount);
        setFiles(changedFiles);
      } catch (err) {
        notify('Error fetching git info: ' + err.message, 'error');
      }
    }
    fetchGitInfo();
  }, [notify]);

  const handlePull = async () => {
    try {
      await window.api.pull();
      notify('Pull successful', 'success');
      const [changedFiles, behindCount] = await Promise.all([
        window.api.getChangedFiles(),
        window.api.getPullCount(),
      ]);
      setFiles(changedFiles);
      setPullCount(behindCount);
    } catch (err) {
      notify('Pull failed: ' + err.message, 'error');
    }
  };

  const handleSwitchBranch = async (newBranch) => {
    try {
      await window.api.switchBranch(newBranch);
      setBranch(newBranch);
      const [changedFiles, updatedBranches, behindCount] = await Promise.all([
        window.api.getChangedFiles(),
        window.api.getBranches(),
        window.api.getPullCount(),
      ]);
      setFiles(changedFiles);
      setBranches(updatedBranches);
      setPullCount(behindCount);
      setSelectedFiles([]);
      setFileContent('');
      notify(`Switched to branch ${newBranch}`, 'success');
    } catch (err) {
      notify('Switch branch failed: ' + err.message, 'error');
    }
  };

  const handleCreateBranch = async (name, base) => {
    try {
      await window.api.createBranch(name, base);
      const [updatedBranches, changedFiles] = await Promise.all([
        window.api.getBranches(),
        window.api.getChangedFiles(),
      ]);
      setBranches(updatedBranches);
      setBranch(name);
      setFiles(changedFiles);
      setSelectedFiles([]);
      setFileContent('');
      notify(`Branch ${name} created from ${base}`, 'success');
    } catch (err) {
      notify('Create branch failed: ' + err.message, 'error');
    }
  };

  const handleSelectionChange = useCallback((selected) => {
    setSelectedFiles(selected);

    if (selected.length === 1) {
      setLoadingFile(true);
      const fetchContent = async () => {
        try {
          const content = await window.api.readFile(selected[0]);
          setFileContent(content);
        } catch (err) {
          notify('Error reading file: ' + err.message, 'error');
          setFileContent('');
        } finally {
          setLoadingFile(false);
        }
      };

      fetchContent();
    } else {
      setFileContent('');
    }
  }, [notify]);

  const handleOnRestore = async (file) => {
    try {
      await window.api.restoreFile(file);
      notify('File restored: ' + file, 'success');

      // aggiorna la lista dei file modificati dopo il restore
      const changedFiles = await window.api.getChangedFiles();
      setFiles(changedFiles);

    } catch (err) {
      notify('Restore failed: ' + err.message, 'error');
    }
  };


  const handleCommit = async (msg) => {
    try {
      await window.api.commit(msg);
      notify('Committed with message: ' + msg, 'success');
      const changedFiles = await window.api.getChangedFiles();
      setFiles(changedFiles);
      setSelectedFiles([]);
      setFileContent('');
    } catch (err) {
      notify('Commit failed: ' + err.message, 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <GitNavbar
        branch={branch}
        branches={branches}
        pullcount={pullCount}
        onPull={handlePull}
        onSwitchBranch={handleSwitchBranch}
        onCreateBranch={handleCreateBranch}
      />

      <Box sx={{ flex: 1, display: 'flex' }}>
        <Box sx={{ width: '50%', borderRight: '1px solid #ddd', overflow: 'auto' }}>
          <ChangeList
            files={files}
            selectedFiles={selectedFiles}
            onSelectionChange={handleSelectionChange}
            onActiveChange={async (file) => {
              setActiveFile(file);
              setLoadingFile(true);
              try {
                const content = await window.api.readFile(file);
                setFileContent(content);
              } catch (err) {
                notify('Error reading file: ' + err.message, 'error');
                setFileContent('');
              } finally {
                setLoadingFile(false);
              }
            }}
            onRestore={handleOnRestore}
          />
        </Box>

        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {loadingFile ? (
              <div>Loading file...</div>
            ) : (
              <FileViewer content={fileContent || 'No file selected'} />
            )}
          </Box>
          <Box sx={{ borderTop: '1px solid #ddd' }}>
            <CommitPanel onCommit={handleCommit} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Git;
