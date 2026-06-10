
import zipfile
import re
import xml.etree.ElementTree as ET
import sys

docx_path = "CURRICULUM VITAE DIRIGIDO A ESPCIALIDAD.docx"
output_path = "cv_content.txt"

try:
    with zipfile.ZipFile(docx_path) as docx:
        xml_content = docx.read('word/document.xml')
        
    root = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    text_content = []
    
    for p in root.findall('.//w:p', ns):
        paragraph_text = []
        for t in p.findall('.//w:t', ns):
            if t.text:
                paragraph_text.append(t.text)
        
        if paragraph_text:
            text_content.append(''.join(paragraph_text))
            
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(text_content))
    
    print(f"Success. Written to {output_path}")

except Exception as e:
    print(f"Error reading docx: {e}")
