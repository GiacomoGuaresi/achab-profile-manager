const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getVendorFolders: (path) => ipcRenderer.invoke('get-vendor-folders', path),
  readVendorProfiles: (vendorName) => ipcRenderer.invoke('read-vendor-profiles', vendorName),
  cloneProfile: (originalFilePath, newName) => ipcRenderer.invoke('clone-profile', originalFilePath, newName),
  addChildProfile: (originalFilePath, newName) => ipcRenderer.invoke('add-child-profile', originalFilePath, newName),
  deleteProfile: (filePath) => ipcRenderer.invoke('delete-profile', filePath),
  readSingleConfig: (filePath) => ipcRenderer.invoke('read-single-config', filePath),
  findConfigByName: (directoryPath, nameToFind) => ipcRenderer.invoke('find-config-by-name', directoryPath, nameToFind),
  saveConfig: (filePath, data) => ipcRenderer.invoke('save-config', filePath, data),
  openInFileExplorer: (filePath) => ipcRenderer.invoke('open-in-file-explorer', filePath),
  openInTextEditor: (filePath) => ipcRenderer.invoke('open-in-text-editor', filePath),
  selectRepoFolder: () => ipcRenderer.invoke('select-repo-folder'),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  cloneRepo: (repoUrl, clonePath) => ipcRenderer.invoke('clone-repo', repoUrl, clonePath),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
});