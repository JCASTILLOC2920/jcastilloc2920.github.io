import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]
patterns = [
    (r'href=\"index\.html#protocolos\"', 'href=\"educacion-medica.html\"'),
    (r'href=\"#protocolos\"', 'href=\"educacion-medica.html\"'),
    (r'href=\"index\.html#zona-medica\"', 'href=\"educacion-medica.html\"'),
    (r'href=\"#zona-medica\"', 'href=\"educacion-medica.html\"')
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
