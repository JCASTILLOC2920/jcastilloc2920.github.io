
import os
import re

def fix_external_links(directory):
    html_files = [f for f in os.listdir(directory) if f.endswith('.html')]
    link_pattern = re.compile(r'<a\s+([^>]*target=["\']_blank["\'][^>]*)>', re.IGNORECASE)
    
    for filename in html_files:
        filepath = os.path.join(directory, filename)
        content = None
        
        # Intentar leer con diferentes codificaciones
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                with open(filepath, 'r', encoding=encoding) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue
        
        if content is None:
            print(f"Error: No se pudo leer {filename} con ninguna codificación.")
            continue
        
        def replacement(match):
            attributes = match.group(1)
            if 'rel=' in attributes.lower():
                if 'noopener' not in attributes.lower() or 'noreferrer' not in attributes.lower():
                    # Si ya tiene rel, le añadimos los valores si faltan
                    # Esta versión es más simple para evitar errores de regex complejos
                    if 'rel="' in attributes.lower():
                        new_attr = re.sub(r'rel="([^"]*)"', r'rel="\1 noopener noreferrer"', attributes, flags=re.IGNORECASE)
                    else:
                        new_attr = re.sub(r"rel='([^']*)'", r"rel='\1 noopener noreferrer'", attributes, flags=re.IGNORECASE)
                    return f'<a {new_attr}>'
                else:
                    return match.group(0)
            else:
                return f'<a {attributes} rel="noopener noreferrer">'

        new_content = link_pattern.sub(replacement, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Actualizado: {filename}")
        else:
            print(f"Sin cambios: {filename}")

if __name__ == "__main__":
    work_dir = r"c:\Users\josehp\Desktop\paginas web\jcastilloc2920.github.io-index.html"
    fix_external_links(work_dir)
