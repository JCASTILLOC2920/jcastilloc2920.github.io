
import re

def parse_requena(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    html_output = ""
    current_title = ""
    current_content = []
    
    # Regex for table titles (e.g., "TABLA 2. - DERMATITIS...")
    title_regex = re.compile(r'TABLA\s+\d+\.\s*-\s*(.+)')
    
    # Iterate lines to find tables
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Check for title
        match = title_regex.match(line)
        if "TABLA" in line and not match:
             # Handle multi-line titles if needed or partial matches
             pass

        if match:
            # excessive logic to capture full title if it spans multiple lines?
            # primitive approach: assume title is 1-2 lines.
            title = match.group(1)
            # Check next line if it looks like continuation (all caps, no bullet)
            if i+1 < len(lines):
                next_line = lines[i+1].strip()
                if next_line and not next_line.startswith('?') and next_line.isupper() and "TABLA" not in next_line:
                    title += " " + next_line
            
            # If we had a previous section, save it
            if current_title:
                html_output += create_accordion_item(current_title, current_content)
                current_content = []
            
            current_title = title
            # Skip the next line if we consumed it
            continue

        # Add content lines
        if current_title:
            # simple cleanup
            if "TABLA" in line: continue 
            # heuristic to skip page numbers
            if line.isdigit() and int(line) < 100: continue
            
            current_content.append(line)

    # Add last section
    if current_title:
        html_output += create_accordion_item(current_title, current_content)
        
    return html_output

def create_accordion_item(title, content_lines):
    # Use the existing expandable-button class structure
    html = f"""
            <div class="elemento-desplegable">
                <button class="boton-desplegable">{title.lower().title()}</button>
                <div class="contenido-desplegable">
                    <ul>
    """
    
    for line in content_lines:
        line = line.replace('?', '').strip()
        if not line: continue
        # Highlight key terms locally if needed
        html += f"                        <li>{line}</li>\n"
        
    html += """                    </ul>
                </div>
            </div>
    """
    return html

if __name__ == "__main__":
    html = parse_requena("requena_raw.txt")
    with open("requena_html_fragment.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("HTML fragment generated.")
