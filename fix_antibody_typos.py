
import os

base_path = "c:\\Users\\josehp\\Desktop\\paginas web\\jcastilloc2920.github.io-index.html\\"
target_file = base_path + "index.html"

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix common typos in the antibody table
content = content.replace('GCOFP-15', 'GCDFP-15')
content = content.replace('PS3', 'P53')
content = content.replace('PVH', 'VPH')
content = content.replace('PODOPLANIND2-40', 'PODOPLANINA / D2-40')

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed antibody typos in index.html")
