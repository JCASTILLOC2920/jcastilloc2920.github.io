import re

file_path = 'style.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update font-family for body
content = content.replace("font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;", 
                          "font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;")

# 2. Update .header-container padding to height + padding:0
# Pattern matches .header-container block and replaces the padding line
pattern = re.compile(r'(\.header-container\s*{[^}]*?)padding:\s*10px\s*0\s*;', re.MULTILINE)
if pattern.search(content):
    content = pattern.sub(r'\1height: 80px;\n    padding: 0;', content)
    print("CSS updated successfully.")
else:
    print("Could not find .header-container with padding: 10px 0;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
