import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  // Rimuovi List, ListItem, ListItemText se non più usati
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#009688',
    },
  },
});

const App = () => {
  const [vendorFolders, setVendorFolders] = useState([]); // Cambiato da 'files' a 'vendorFolders'
  const [selectedVendor, setSelectedVendor] = useState(''); // Stato per il vendor selezionato
  const [profileGraph, setProfileGraph] = useState(null); // Nuovo stato per il grafo dei profili

  // ATTENZIONE: CAMBIA QUESTO PER IL TUO PERCORSO!
  const profilesRootPath = 'C:\\Users\\guare\\source\\gingerRepos\\OrcaSlicer\\resources\\profiles';

  useEffect(() => {
    if (window.api) {
      // Inizialmente, ottieni solo i nomi delle cartelle dei vendor
      window.api.getVendorFolders(profilesRootPath)
        .then(folders => {
          setVendorFolders(folders);
        })
        .catch(err => {
          console.error("Errore nel recupero delle cartelle dei vendor:", err);
          setVendorFolders(["Errore nel caricamento delle cartelle. Controlla la console."]);
        });
    } else {
      console.warn("L'API 'window.api' non è disponibile. Sei in un browser o in un ambiente non Electron?");
      setVendorFolders(["L'API per leggere i file non è disponibile."]);
    }
  }, []);

  const handleVendorChange = (event) => {
    const vendorName = event.target.value;
    setSelectedVendor(vendorName);
    console.log("Vendor selezionato:", vendorName);

    if (window.api) {
      // Chiama l'API Electron per leggere i file del vendor e costruire il grafo
      window.api.readVendorProfiles(vendorName)
        .then(graph => {
          setProfileGraph(graph);
          console.log("Grafo dei profili:", graph);
          // Qui puoi aggiungere logica per visualizzare o utilizzare il grafo
        })
        .catch(err => {
          console.error("Errore nella lettura dei profili del vendor:", err);
          setProfileGraph({ error: "Errore nel caricamento dei profili del vendor." });
        });
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Achab Profile Manager
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="vendor-select-label">Select a Vendor</InputLabel>
          <Select
            labelId="vendor-select-label"
            id="vendor-select"
            value={selectedVendor}
            label="Select a Vendor"
            onChange={handleVendorChange}
          >
            {vendorFolders.length > 0 ? (
              vendorFolders.map((folder, index) => (
                <MenuItem key={index} value={folder}>
                  {folder}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Nessun vendor disponibile o caricamento in corso...</MenuItem>
            )}
          </Select>
        </FormControl>

        {profileGraph && (
          <div>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              Profilo Grafico per {selectedVendor}
            </Typography>
            {profileGraph.error ? (
              <Typography color="error">{profileGraph.error}</Typography>
            ) : (
              <pre>{JSON.stringify(profileGraph, null, 2)}</pre>
            )}
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;