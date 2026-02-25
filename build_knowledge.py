import os
import re
import json

# Configuration
working_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(working_dir, "site_knowledge.js")

def extract_text_from_html(html_content):
    # Remove script and style elements
    clean = re.sub(r'<(script|style).*?>.*?</\1>', '', html_content, flags=re.DOTALL)
    # Get text
    clean = re.sub(r'<[^>]+>', ' ', clean)
    # Collapse whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

knowledge_base = []

print(f"Scanning directory: {working_dir}")

for filename in os.listdir(working_dir):
    if filename.endswith(".html"):
        file_path = os.path.join(working_dir, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                text = extract_text_from_html(content)
                if text:
                    knowledge_base.append(f"--- FILE: {filename} ---\n{text}\n")
                    print(f"Indexed HTML: {filename}")
        except Exception as e:
            print(f"Error reading {filename}: {e}")
    elif filename == "base_conocimiento.txt":
        file_path = os.path.join(working_dir, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                knowledge_base.append(f"--- INTERNAL KNOWLEDGE: {filename} ---\n{content}\n")
                print(f"Indexed Internal Knowledge: {filename}")
        except Exception as e:
            print(f"Error reading {filename}: {e}")

full_text = "\n".join(knowledge_base)

# Escape for JS string
full_text_js = json.dumps(full_text)

js_content = f"const SITE_KNOWLEDGE = {full_text_js};\n"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Knowledge base built: {output_file} ({len(knowledge_base)} pages indexed)")
