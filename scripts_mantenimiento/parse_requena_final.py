
import re

def parse_requena(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    html_output = ""
    current_title = ""
    current_content = []
    
    # Regex for table titles (e.g., "TABLA 2. - DERMATITIS...")
    title_regex = re.compile(r'TABLA\s+\d+\.\s*-\s*(.+)')
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        match = title_regex.match(line)
        if match:
            # Clean title
            title = match.group(1)
            # Check for continuation
            if i+1 < len(lines):
                next_line = lines[i+1].strip()
                if next_line and not next_line.startswith('?') and next_line.isupper() and "TABLA" not in next_line:
                    title += " " + next_line
            
            # Save previous
            if current_title:
                html_output += create_accordion_item(current_title, current_content)
                current_content = []
            
            current_title = title
            continue

        if current_title:
             if "TABLA" in line: continue
             if line.isdigit() and int(line) < 100: continue
             current_content.append(line)

    if current_title:
        html_output += create_accordion_item(current_title, current_content)
        
    return html_output

def create_accordion_item(title, content_lines):
    # Clean title capitalization
    clean_title = title.lower().capitalize()
    
    # Use the EXISTING structure found in dermatopatologia.html
    html = f"""
            <button class="expandable-button">{clean_title}</button>
            <div class="expandable-content">
                <ul>
    """
    
    for line in content_lines:
        line = line.replace('?', '').strip()
        if not line: continue
        html += f"                    <li>{line}</li>\n"
        
    html += """                </ul>
            </div>
    """
    return html

if __name__ == "__main__":
    html = parse_requena("requena_raw.txt")
    with open("requena_html_final.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("HTML final generated.")
