import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
sections = re.findall(r'<section[^>]*id="([^"]+)"[^>]*>', html)
print('Sections found:', sections)
