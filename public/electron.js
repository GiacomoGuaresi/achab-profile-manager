// main.js (esempio)
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { exec } = require('child_process');
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');
const { spawn } = require('child_process');
const os = require('os');
const https = require('https');
const { createWriteStream } = require('fs');
const { unlink } = require('fs/promises');
const { pipeline } = require('stream/promises');
const { promisify } = require('util');

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
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
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
          jsonFilesData.push({ data: jsonData, filePath: fullPath });
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

  profilesData.forEach(({ data: profile, filePath }) => {
    if (profile.name) {
      const node = {
        id: profile.name,
        data: {
          label: profile.name,
          ...(profile.type && { type: profile.type }),
          ...(profile.instantiation && { instantiation: profile.instantiation }),
          ...(profile.version && { version: profile.version }),
          filePath: filePath.replace(/\\/g, '/'),
        },
        position: { x: Math.random() * 5000, y: Math.random() * 5000 },
        style: profile.instantiation == "false" ? {
          border: '2px dashed #009688',
          borderRadius: '8px',
          padding: 10,
        } : {
          border: '2px solid #009688',
          borderRadius: '8px',
          padding: 10,
        }
      };

      nodes.push(node);
      nodeMap.set(profile.name, node);
    }
  });

  profilesData.forEach(({ data: profile }) => {
    if (
      profile.name &&
      profile.inherits &&
      nodeMap.has(profile.inherits)
    ) {
      edges.push({
        id: `e-${profile.inherits}-${profile.name}`,
        source: profile.inherits,
        target: profile.name,
        type: 'default',
        markerEnd: {
          type: 'arrowclosed',
          color: '#009688',
        },
      });
    }
  });

  return { nodes, edges };
}

async function getOrcaRootPath() {
  try {
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    if (settings.repoPath) {
      return settings.repoPath;
    }
  } catch (error) {
    console.error('Errore nel caricamento settings per profiles root path:', error);
  }
}

async function getValidatorPath() {
  try {
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    if (settings.validatorPath) {
      return settings.validatorPath;
    }
  } catch (error) {
    console.error('Errore nel caricamento settings per validator path:', error);
  }
}

function downloadToBuffer(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

    https.get(url, (res) => {
      // Gestione redirect
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        const redirectUrl = res.headers.location;
        if (!redirectUrl) return reject(new Error('Redirect with no location header'));
        resolve(downloadToBuffer(redirectUrl, maxRedirects - 1));
        return;
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed: ${url} (${res.statusCode})`));
      }

      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

function getLatestReleaseTag() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/SoftFever/Orca_tools/releases/latest',
      headers: { 'User-Agent': 'electron-app' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          resolve(json.tag_name);
        } else {
          reject(new Error(`Failed to fetch release info (${res.statusCode})`));
        }
      });
    }).on('error', reject);
  });
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
  const profilesRootPath = path.join(await getOrcaRootPath(), 'resources', 'profiles');
  const vendorPath = path.join(profilesRootPath, vendorName);
  try {
    const allProfiles = await readJsonFilesRecursively(vendorPath);
    const graph = buildProfileGraph(allProfiles);
    return graph;
  } catch (error) {
    console.error(`Errore durante la lettura dei profili per il vendor ${vendorName}:`, error);
    throw new Error(`Impossibile leggere i profili per ${vendorName}.`);
  }
});

ipcMain.handle('clone-profile', async (event, originalFilePath, newName) => {
  try {
    // Leggi il file JSON originale
    const content = await fs.readFile(originalFilePath, 'utf8');
    const jsonData = JSON.parse(content);

    // Cambia il nome all'interno del json
    jsonData.name = newName;

    // Costruisci il nuovo path del file (stessa cartella, nome nuovo + .json)
    const dir = path.dirname(originalFilePath);
    const newFilePath = path.join(dir, `${newName}.json`);

    // Scrivi il nuovo file
    await fs.writeFile(newFilePath, JSON.stringify(jsonData, null, 2), 'utf8');

    return { success: true, newFilePath };
  } catch (error) {
    console.error('Errore nel clonare il profilo:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-child-profile', async (event, originalFilePath, newName) => {
  try {
    // Leggi il file JSON originale
    const content = await fs.readFile(originalFilePath, 'utf8');
    const oldJsonData = JSON.parse(content);
    const newJsonData = {
      "from": oldJsonData.from,
      "type": oldJsonData.type,
      "instantiation": oldJsonData.instantiation,
      "version": "0.0.0.0",
      "inherits": oldJsonData.name,
      "name": newName,
    }

    // Costruisci il nuovo path del file (stessa cartella, nome nuovo + .json)
    const dir = path.dirname(originalFilePath);
    const newFilePath = path.join(dir, `${newName}.json`);

    // Scrivi il nuovo file
    await fs.writeFile(newFilePath, JSON.stringify(newJsonData, null, 2), 'utf8');

    return { success: true, newFilePath };
  } catch (error) {
    console.error('Errore nel clonare il profilo:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-profile', async (event, filePath) => {
  try {
    await fs.unlink(filePath); // usa await e unlink (async)
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('read-single-config', async (event, filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    const rawData = await fs.readFile(absolutePath, 'utf-8');
    const jsonData = JSON.parse(rawData);
    return { success: true, data: jsonData };
  } catch (error) {
    console.error('Error reading config:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('find-config-by-name', async (event, directoryPath, nameToFind) => {
  try {
    // directoryPath deve essere assoluto
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const fullPath = path.join(directoryPath, file); // directoryPath deve essere assoluto e valido
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const json = JSON.parse(content);
          if (json.name === nameToFind) {
            return { success: true, path: fullPath };
          }
        } catch (err) {
          // ignore JSON parse errors
        }
      }
    }

    return { success: false, error: `No config found with name "${nameToFind}" in ${directoryPath}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-config', async (event, filePath, data) => {
  try {
    const absolutePath = path.resolve(filePath);
    await fs.writeFile(absolutePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving config:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-in-file-explorer', async (event, filePath) => {
  const absolutePath = path.resolve(filePath);
  try {
    const { shell } = require('electron');
    await shell.showItemInFolder(absolutePath);
    return { success: true };
  } catch (error) {
    console.error('Error opening in file explorer:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-in-text-editor', async (event, filePath) => {
  try {
    let settings = {};
    try {
      await fs.access(settingsFilePath);
      const settingsContent = await fs.readFile(settingsFilePath, 'utf-8');
      settings = JSON.parse(settingsContent);
    } catch (err) {
      // Il file non esiste o non è leggibile: fallback
      settings = {};
    }

    const editor = settings.editor || 'code'; // fallback a VSCode
    spawn(editor, [filePath], { detached: true, stdio: 'ignore' }).unref();

    return { success: true };
  } catch (error) {
    console.error('Errore apertura file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-file', async () => {
  let filters = [];
  if (os.platform() === 'win32') {
    filters = [
      { name: 'Executable Files', extensions: ['exe'] },
      { name: 'All Files', extensions: ['*'] }
    ];
  }
  else {
    filters = [
      { name: 'All Files', extensions: ['*'] }
    ];
  }

  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('load-settings', async () => {
  try {
    // Verifica se il file esiste
    await fs.access(settingsFilePath);
    const data = await fs.readFile(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Errore nel caricamento settings:', error);
    return {};
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Errore nel salvataggio settings:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clone-repo', async (event, repoUrl, clonePath) => {
  return new Promise((resolve, reject) => {
    clonePath = path.join(clonePath, 'OrcaSlicer');
    exec(`git clone ${repoUrl} "${clonePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Errore durante il clone del repository:', error);
        return reject(error);
      }
      console.log('Repository cloned successfully:', stdout);
      resolve();
    });
  });
});

ipcMain.handle('download-validator', async (event, downloadPath) => {
  try {
    const platform = os.platform();
    const fileName = platform === 'win32'
      ? 'OrcaSlicer_profile_validator.exe'
      : 'OrcaSlicer_profile_validator';

    const tag = await getLatestReleaseTag();
    const downloadUrl = `https://github.com/SoftFever/Orca_tools/releases/download/${tag}/${fileName}`;
    const fullPath = path.join(downloadPath, fileName);

    // Scarica tutto in memoria
    const fileBuffer = await downloadToBuffer(downloadUrl);

    console.log(`Scaricato file da ${downloadUrl} (${fileBuffer.length} bytes)`);
    console.log(`Salvataggio file in ${fullPath}`);

    // Salva file con fs/promises
    await fs.writeFile(fullPath, fileBuffer);

    if (platform !== 'win32') {
      await fs.chmod(fullPath, 0o755);
    }

    return { success: true, path: fullPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('check-git', async () => {
  return new Promise((resolve) => {
    exec('git --version', (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle('run-validation', async (event, type, vendor) => {
  const orcaRoot = await getOrcaRootPath();
  const profileRoot = path.join(orcaRoot, 'resources', 'profiles');
  const pythonScriptPath = path.join(orcaRoot, 'scripts', 'orca_extra_profile_check.py');
  const orcaValidatorPath = await getValidatorPath();

  let command;

  if (type === 'python') {
    command = `python "${pythonScriptPath}" ${vendor ? `--vendor="${vendor}"` : ''} --check-filaments --check-materials`;
  } else if (type === 'validator') {
    command = `"${orcaValidatorPath}" -p "${profileRoot}" -l 2 ${vendor ? `-v "${vendor}"` : ''}`;
  } else {
    return {
      status: 'failed',
      output: '[ERROR] Unknown validation type',
    };
  }

  console.log(`Running validation command: ${command}`);

  return new Promise((resolve) => {
    exec(command, { shell: true, cwd: orcaRoot }, (error, stdout, stderr) => {
      const output = stdout + '\n' + (stderr || '');
      const status = error ? 'failed' : 'success';

      // Log stderr only if there's an error
      if (error) {
        console.warn('Validation completed with errors');
        console.warn('STDERR:', stderr);
        console.warn('STDOUT:', stdout);
      }

      resolve({ status, output });
    });
  });
});

ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron');
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'apertura dell\'URL:', error);
    return { success: false, error: error.message };
  }
});