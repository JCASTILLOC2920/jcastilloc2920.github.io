from collections import Counter
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check for duplicate IDs
ids = re.findall(r'id="([^"]+)"', html)
id_counts = Counter(ids)
dupe_ids = {k: v for k, v in id_counts.items() if v > 1}
if dupe_ids:
    print('Duplicate IDs found:', dupe_ids)
else:
    print('No duplicate IDs found.')
