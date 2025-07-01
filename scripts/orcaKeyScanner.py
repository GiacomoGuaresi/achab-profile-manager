import os
import re
import json


def parse_cpp_file(file_path, filename):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    results = {}
    fields_found = set()

    # Pattern principale per blocchi this->add(...)
    pattern = r'def\s*=\s*this->add\(\s*"([^"]+)",\s*([^)]+)\);\s*((?:\s*def->[^;]+;\s*)+)'
    matches = re.findall(pattern, content, re.MULTILINE)

    if matches:
        print(f"📄 Trovato {len(matches)} blocco(i) in {filename}")

    for name, type_value, block in matches:
        entry = {
            "file": filename,
            "type": type_value.strip()
        }

        # Pattern 1: assegnazioni classiche: def->chiave = valore;
        attr_pattern = r'def->(\w+)\s*=\s*(.+?);'
        for attr, val in re.findall(attr_pattern, block):
            entry[attr] = val.strip()
            fields_found.add(attr)

        # Pattern 2: chiamate a funzione tipo: def->set_default_value(...)
        call_pattern = r'def->set_default_value\s*\((.+?)\);'
        call_match = re.search(call_pattern, block)
        if call_match:
            entry["default_value"] = call_match.group(1).strip()
            fields_found.add("default_value")

        results[name] = entry

    # Estrazione delle opzioni da classi TabXXX
    groups = extract_preset_option_groups(content)

    return results, fields_found, groups


def extract_preset_option_groups(content):
    # Pattern per catturare la dichiarazione del vettore e il suo contenuto fino alla chiusura '};'
    pattern = re.compile(
        r'static\s+std::vector<std::string>\s+(\w+)\s*{([^}]+)};',
        re.MULTILINE | re.DOTALL
    )

    groups = {}

    for match in pattern.finditer(content):
        group_name = match.group(1)
        body = match.group(2)

        # Estrai tutte le stringhe tra virgolette nel body
        options = re.findall(r'"([^"]+)"', body)

        groups[group_name] = options
        print(f"📦 Gruppo '{group_name}' -> {len(options)} opzioni")

    return groups


def scan_folder(folder):
    all_data = {}
    all_fields = set()
    all_groups = {}
    total_defs = 0

    print(f"🔍 Inizio scansione cartella: {folder}\n")

    for root, _, files in os.walk(folder):
        for file in files:
            if file.endswith(('.cpp', '.hpp', '.cxx', '.h')):
                path = os.path.join(root, file)
                # print(f"➡️  Analizzo file: {file}")
                file_data, file_fields, group_data = parse_cpp_file(path, file)
                all_data.update(file_data)
                all_fields.update(file_fields)
                all_groups.update(group_data)
                total_defs += len(file_data)

    print(f"\n✅ Scansione completata.")
    print(f"🔢 Totale definizioni trovate: {total_defs}")
    print(f"📋 Campi unici trovati: {len(all_fields)}\n")

    return all_data, sorted(all_fields), all_groups


def merge_data_with_groups(data, groups):
    # Mappa opzione -> gruppo
    option_to_group = {}
    for group_name, options in groups.items():
        for option in options:
            option_to_group[option] = group_name

    # Aggiungi il campo "group" se l'opzione è in un gruppo
    for option_name, option_data in data.items():
        if option_name in option_to_group:
            option_data["group"] = option_to_group[option_name]
        else:
            option_data["group"] = "N.A."

    return data


def main():
    folder = "C:\\Users\\guare\\source\\gingerRepos\\OrcaSlicer\\src"

    data, fields, groups = scan_folder(folder)

    # Merge tra data e groups
    merged_data = merge_data_with_groups(data, groups)

    with open("data.json", "w", encoding='utf-8') as f:
        json.dump(merged_data, f, indent=4, ensure_ascii=False)

    with open("fields.json", "w", encoding='utf-8') as f:
        json.dump(fields, f, indent=4, ensure_ascii=False)

    with open("groups.json", "w", encoding='utf-8') as f:
        json.dump(groups, f, indent=4, ensure_ascii=False)

    print("💾 File salvati: data.json, fields.json, groups.json")


if __name__ == "__main__":
    main()
