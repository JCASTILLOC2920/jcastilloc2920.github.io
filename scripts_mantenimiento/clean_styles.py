import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('style="color: #64FFDA; font-weight: 700;"', 'class="nav-results"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
