const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getFiles: (folderPath) => ipcRenderer.invoke('get-files', folderPath),
});