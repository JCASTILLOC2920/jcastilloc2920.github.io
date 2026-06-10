import re
content = open('index.html', 'r', encoding='utf-8').read()
content = re.sub(r'"([a-zA-Z0-9_-]+\.mp4)"', r'"assets/media/\1"', content)
open('index.html', 'w', encoding='utf-8').write(content)
print("Updated video paths.")
