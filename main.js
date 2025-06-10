const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs'); // Modulo per la gestione del filesystem

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Carica lo script di preload
      nodeIntegration: false, // Disabilita nodeIntegration per sicurezza
      contextIsolation: true, // Abilita contextIsolation
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
  // mainWindow.webContents.openDevTools(); // Abilita i DevTools di Electron per il debug
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gestione dell'IPC per la lettura dei file
ipcMain.handle('get-files', async (event, folderPath) => {
  try {
    const files = await fs.promises.readdir(folderPath);
    return files;
  } catch (error) {
    console.error("Errore nella lettura della directory:", error);
    throw error; // Propaga l'errore al processo di rendering
  }
});