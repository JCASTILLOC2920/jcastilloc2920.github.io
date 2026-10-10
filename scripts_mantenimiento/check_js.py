import re
from collections import Counter

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscando declaraciones de funciones
funcs = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', js)
arrow_funcs = re.findall(r'(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(async\s+)?\(.*?\)\s*=>', js)

all_funcs = funcs + [af[1] for af in arrow_funcs]
counts = Counter(all_funcs)
dupes = {k: v for k, v in counts.items() if v > 1}
if dupes:
    print('Duplicate functions found:', dupes)
else:
    print('No duplicate functions found.')
