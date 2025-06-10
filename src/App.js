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
  List, // Mantenuto solo per riferimento, puoi rimuoverlo se non più usato
  ListItem, // Mantenuto solo per riferimento, puoi rimuoverlo se non più usato
  ListItemText // Mantenuto solo per riferimento, puoi rimuoverlo se non più usato
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Per un reset CSS di base

// Definisci il tuo tema personalizzato
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#009688', // Il tuo colore primario
    },
  },
});

const App = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(''); // Stato per il file selezionato dalla Select
  // ATTENZIONE: CAMBIA QUESTO PER IL TUO PERCORSO!
  // Ho mantenuto il percorso che hai fornito. Assicurati che sia corretto per il tuo sistema.
  const folderPath = 'C:\\Users\\guare\\source\\gingerRepos\\OrcaSlicer\\resources\\profiles';

  useEffect(() => {
    if (window.api) {
      window.api.getFiles(folderPath)
        .then(fileList => {
          // Filtra solo i file con estensione .json
          const jsonFiles = fileList.filter(file => file.endsWith('.json'));
          setFiles(jsonFiles);
        })
        .catch(err => {
          console.error("Errore nel recupero dei file:", err);
          setFiles(["Errore nel caricamento dei file. Controlla la console."]);
        });
    } else {
      console.warn("L'API 'window.api' non è disponibile. Sei in un browser o in un ambiente non Electron?");
      setFiles(["L'API per leggere i file non è disponibile."]);
    }
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
    console.log("File selezionato:", event.target.value);
    // Qui potresti aggiungere logica per gestire il file selezionato (es. aprirlo, visualizzarne il contenuto)
  };

  return (
    // Avvolgi l'intera applicazione con ThemeProvider per applicare il tema
    <ThemeProvider theme={customTheme}>
      <CssBaseline /> {/* Applica un reset CSS di base per coerenza */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Achab profile manager
          </Typography>
          {/* Potresti aggiungere altri elementi alla navbar qui */}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}> {/* Aggiungi un margin-top per spaziatura */}
        <FormControl fullWidth sx={{ mb: 3 }}> {/* Aggiungi un margin-bottom */}
          <InputLabel id="vendor-select-label">Select a Vendor</InputLabel>
          <Select
            labelId="vendor-select-label"
            id="vendor-select"
            value={selectedFile}
            label="Seleziona un file JSON"
            onChange={handleFileChange}
          >
            {files.length > 0 ? (
              files.map((file, index) => (
                <MenuItem key={index} value={file}>
                  {/* Rimuove l'estensione .json per la visualizzazione */}
                  {file.replace('.json', '')}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Nessun file JSON disponibile o caricamento in corso...</MenuItem>
            )}
          </Select>
        </FormControl>
      </Container>
    </ThemeProvider>
  );
};

export default App;
