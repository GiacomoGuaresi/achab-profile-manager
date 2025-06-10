// main.js (esempio)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises'); // Usa le promesse per un'interfaccia più pulita

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Importante per la sicurezza
      nodeIntegration: false,
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

// --- IPC Handlers ---

// Percorso radice per i profili (deve corrispondere a quello nel frontend)
const PROFILES_ROOT_PATH = 'C:\\Users\\guare\\source\\gingerRepos\\OrcaSlicer\\resources\\profiles';

/**
 * Legge ricorsivamente i file JSON da una directory e costruisce il grafo.
 * @param {string} dirPath Il percorso della directory da leggere.
 * @returns {Promise<Array<Object>>} Un array di oggetti JSON parsed.
 */
async function readJsonFilesRecursively(dirPath) {
  let jsonFilesData = [];
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        const nestedFiles = await readJsonFilesRecursively(fullPath);
        jsonFilesData = jsonFilesData.concat(nestedFiles);
      } else if (item.isFile() && item.name.endsWith('.json')) {
        try {
          const fileContent = await fs.readFile(fullPath, 'utf8');
          const jsonData = JSON.parse(fileContent);
          jsonFilesData.push(jsonData);
        } catch (parseError) {
          console.error(`Errore nel parsing del file JSON ${fullPath}:`, parseError);
        }
      }
    }
  } catch (err) {
    console.error(`Errore nella lettura della directory ${dirPath}:`, err);
  }
  return jsonFilesData;
}

function buildProfileGraph(profilesData) {
  const nodes = [];
  const edges = [];

  const nodeMap = new Map();

  profilesData.forEach((profile, index) => {
    if (profile.name) {
      const node = {
        id: profile.name,
        data: { label: profile.name },
        position: { x: 0, y: index * 100 } // Posizione iniziale arbitraria (puoi usare un algoritmo di layout)
      };

      nodes.push(node);
      nodeMap.set(profile.name, node);
    }
  });

  profilesData.forEach(profile => {
    if (
      profile.name &&
      profile.inherits &&
      nodeMap.has(profile.inherits)
    ) {
      edges.push({
        id: `e-${profile.inherits}-${profile.name}`,
        source: profile.inherits,
        target: profile.name,
        type: 'smoothstep' // o 'default', 'step', ecc.
      });
    }
  });

  return { nodes, edges };
}


// IPC Handler per ottenere le cartelle dei vendor (top-level directories)
ipcMain.handle('get-vendor-folders', async (event, rootPath) => {
  try {
    const items = await fs.readdir(rootPath, { withFileTypes: true });
    const vendorFolders = items
      .filter(item => item.isDirectory())
      .map(item => item.name);
    return vendorFolders;
  } catch (error) {
    console.error("Errore nell'ottenere le cartelle dei vendor:", error);
    throw new Error("Impossibile leggere le cartelle dei vendor.");
  }
});

// IPC Handler per leggere i profili di un vendor e costruire il grafo
ipcMain.handle('read-vendor-profiles', async (event, vendorName) => {
  const vendorPath = path.join(PROFILES_ROOT_PATH, vendorName);
  try {
    const allProfiles = await readJsonFilesRecursively(vendorPath);
    const graph = buildProfileGraph(allProfiles);
    return graph;
  } catch (error) {
    console.error(`Errore durante la lettura dei profili per il vendor ${vendorName}:`, error);
    throw new Error(`Impossibile leggere i profili per ${vendorName}.`);
  }
});