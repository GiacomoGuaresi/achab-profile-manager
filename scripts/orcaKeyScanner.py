import os
import re
import json

def extract_cpp_definitions(folder_path):
    """
    Scansiona i file .cpp in una cartella specificata ed estrae le definizioni
    secondo il pattern fornito.

    Args:
        folder_path (str): Il percorso della cartella da scansionare.

    Returns:
        dict: Un dizionario contenente tutte le definizioni estratte,
              dove la chiave è il nome della definizione (es. "line_width")
              e il valore è un altro dizionario con i dettagli della definizione.
    """
    all_definitions = {}

    # Regex per trovare un blocco di definizione completo.
    # Cattura la riga iniziale 'def = this->add("key", coType);'
    # e tutto il contenuto successivo fino al prossimo blocco 'def = this->add('
    # o alla fine del file.
    definition_block_pattern = re.compile(
        r'def\s*=\s*this->add\("([^"]+)",\s*co[A-Za-z]+(?:\|?\s*co[A-Za-z]+)*\);' # Inizio della riga di definizione (cattura la chiave)
        r'(.*?)' # Cattura non avida di tutto il contenuto del blocco
        r'(?=\s*def\s*=\s*this->add\(|\Z)', # Lookahead per la prossima definizione o la fine della stringa
        re.DOTALL # Permette a '.' di includere i newline
    )

    # Regex per estrarre i singoli campi all'interno di un blocco di definizione
    label_pattern = re.compile(r'label\s*=\s*L\("(?P<value>[^"]*)"\);')
    
    # Regex per 'tooltip': cattura il contenuto all'interno di L("string1" "string2") o L("string1").
    # È progettata per catturare anche stringhe concatenate tra virgolette.
    tooltip_pattern = re.compile(r'tooltip\s*=\s*L\((?P<value>"(?:[^"\\]|\\.)*?"(?:(?:\s*"(?:[^"\\]|\\.)*?")*))\);')
    
    sidetext_pattern = re.compile(r'sidetext\s*=\s*L\("(?P<value>[^"]*)"\);')
    
    # Regex per valori numerici (min, max, max_literal), accetta interi, float e 'f' per i float
    numeric_pattern_template = r'{field_name}\s*=\s*(?P<value>-?\d+(?:\.\d+)?f?);'
    min_pattern = re.compile(numeric_pattern_template.format(field_name="min"))
    max_pattern = re.compile(numeric_pattern_template.format(field_name="max"))
    max_literal_pattern = re.compile(numeric_pattern_template.format(field_name="max_literal"))
        
    # Cattura l'intero argomento della funzione set_default_value
    set_default_value_pattern = re.compile(r'set_default_value\((?P<value>.*?)\);')

    # Elenco dei pattern da cercare, in ordine
    field_patterns = [
        ("label", label_pattern),
        ("tooltip", tooltip_pattern),
        ("sidetext", sidetext_pattern),
        ("min", min_pattern),
        ("max", max_pattern),
        ("max_literal", max_literal_pattern),
        ("set_default_value", set_default_value_pattern)
    ]

    # Attraversa tutte le cartelle e i file nel percorso specificato
    for root, _, files in os.walk(folder_path):
        for file_name in files:
            # Controlla se il file è un file C++
            if file_name.endswith(".cpp"):
                file_path = os.path.join(root, file_name)
                # print(f"Elaborazione: {file_path}") # Stampa il file in elaborazione

                try:
                    # Leggi il contenuto del file
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()

                    # Trova tutti i blocchi di definizione nel contenuto del file
                    matches = definition_block_pattern.finditer(content)

                    for match in matches:
                        key = match.group(1) # Cattura il nome della definizione (es. "line_width")
                        block_content = match.group(2) # Cattura il contenuto del blocco (label, tooltip, ecc.)
                        
                        definition_data = {"file": file_path} # Includi il percorso del file sorgente

                        # Estrai i campi per la definizione corrente
                        for field_name, pattern in field_patterns:
                            field_match = pattern.search(block_content)
                            if field_match:
                                value = field_match.group("value").strip()
                                # Gestione speciale per i tooltip con stringhe concatenate
                                if field_name == "tooltip":
                                    # Rimuovi le virgolette e gli spazi intermedi tra le stringhe concatenate
                                    value = re.sub(r'"\s*"', '', value)
                                    # Rimuovi le virgolette iniziali e finali
                                    value = value.strip('"')
                                    # Gestisci i caratteri di escape per virgolette e newline
                                    value = value.replace('\\"', '"')
                                    value = value.replace('\\n', '\n')
                                    definition_data[field_name] = value
                                # Conversione dei valori numerici in int/float
                                elif field_name in ["min", "max", "max_literal"]:
                                    try:
                                        if '.' in value or 'f' in value:
                                            # Se contiene '.' o 'f', prova a convertirlo in float
                                            definition_data[field_name] = float(value.replace('f', ''))
                                        else:
                                            # Altrimenti, prova a convertirlo in intero
                                            definition_data[field_name] = int(value)
                                    except ValueError:
                                        # Se la conversione fallisce, mantieni il valore come stringa
                                        definition_data[field_name] = value
                                else:
                                    definition_data[field_name] = value
                        
                        # Aggiungi la definizione al dizionario principale
                        all_definitions[key] = definition_data

                except Exception as e:
                    print(f"Errore durante l'elaborazione di {file_path}: {e}")
    return all_definitions

# Punto di ingresso principale dello script
if __name__ == "__main__":
    # Chiedi all'utente il percorso della cartella da scansionare
    folder_to_scan = input("Inserisci il percorso della cartella contenente i file C++: ")

    # Verifica se il percorso inserito è una directory valida
    if not os.path.isdir(folder_to_scan):
        print(f"Errore: Il percorso '{folder_to_scan}' non è una directory valida.")
    else:
        # Estrai le definizioni
        definitions = extract_cpp_definitions(folder_to_scan)

        output_file_name = "output.json"
        try:
            # Scrivi le definizioni estratte nel file JSON
            with open(output_file_name, 'w', encoding='utf-8') as json_file:
                json.dump(definitions, json_file, indent=4, ensure_ascii=False)
            print(f"\nDefinizioni estratte con successo in '{output_file_name}'")
        except Exception as e:
            print(f"Errore durante la scrittura del file '{output_file_name}': {e}")
