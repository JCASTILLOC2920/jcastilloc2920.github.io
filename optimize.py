import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace <button class=...> with <button type='button' class=...> if type is missing
html_new = re.sub(r'<button(?![^>]*type=)([^>]*)>', r'<button type="button"\1>', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_new)
