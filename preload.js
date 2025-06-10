const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getVendorFolders: (path) => ipcRenderer.invoke('get-vendor-folders', path),
  readVendorProfiles: (vendorName) => ipcRenderer.invoke('read-vendor-profiles', vendorName),
});