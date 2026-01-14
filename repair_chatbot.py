import os
import glob

# Configuration
base_dir = os.path.dirname(os.path.abspath(__file__))
chatbot_js_path = os.path.join(base_dir, 'chatbot.js')

def get_clean_text_content(file_path):
    """Reads a file trying multiple encodings and returns clean text."""
    encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.read()
                # Remove null bytes if any
                content = content.replace('\x00', '')
                return content
        except (UnicodeDecodeError, TypeError):
            continue
    return ""

def build_knowledge_base():
    """Scrapes all HTML files and builds the knowledge string."""
    knowledge_parts = []
    
    # Get all HTML files
    html_files = glob.glob(os.path.join(base_dir, '*.html'))
    
    for file_path in html_files:
        filename = os.path.basename(file_path)
        # Skip Google verification files or raw tables if preferred, but we fixed encoding so it should be fine.
        
        content = get_clean_text_content(file_path)
        
        # Simple extraction: Remove HTML tags (basic approach for minimizing noise)
        # For now, we will just take the raw text content to avoid complex parsing issues, 
        # or use a simple stripper if available. 
        # Given the previous approach was likely raw text, we'll stick to cleaning it up.
        
        # Let's try to strip tags to reduce size and weird characters
        clean_text = ""
        in_tag = False
        for char in content:
            if char == '<':
                in_tag = True
            elif char == '>':
                in_tag = False
            elif not in_tag:
                clean_text += char
        
        # Collapse whitespace
        clean_text = " ".join(clean_text.split())
        
        knowledge_parts.append(f"--- FILE: {filename} ---")
        knowledge_parts.append(clean_text)
        
    return "\\n".join(knowledge_parts).replace('"', '\\"').replace('`', '\\`')

def repair_chatbot_file():
    # 1. Build new knowledge string
    print("Rebuilding knowledge base...")
    clean_knowledge = build_knowledge_base()
    
    # 2. Read existing chatbot.js to save the logic (and API Key)
    # We look for the part matching the logic.
    # The corrupted file starts with `const SITE_KNOWLEDGE = "` and ends the string, then has logic.
    # Since the file is corrupted, we might have trouble reading it.
    # We will try to read it as binary or with error replace to salvage the logic.
    
    with open(chatbot_js_path, 'rb') as f:
        raw_content = f.read()
        
    # Attempt to decode ignoring errors to find the split point
    content_str = raw_content.decode('utf-8', errors='ignore')
    
    # We look for the marker where logic starts. 
    # In the previous `multi_replace`, we know the logic starts roughly after the knowledge, 
    # but we can search for the API Key variable or "DOM ELEMENTS".
    
    split_marker = "const GEMINI_API_KEY"
    if split_marker not in content_str:
        # Fallback if I can't find the exact split, look for something else unique to the logic
        split_marker = "initChatbotUI"
        
    if split_marker not in content_str:
        print("CRITICAL ERROR: Could not find logic section in chatbot.js. Aborting to avoid data loss.")
        return

    # Find the index of the marker
    split_index = content_str.find(split_marker)
    
    # But we need to verify if there are comments before GEMINI_API_KEY we want to keep.
    # The previous structure was:
    # const SITE_KNOWLEDGE = "...";
    #
    # // ============================================
    # // CONFIGURACIÓN DE INTELIGENCIA ARTIFICIAL...
    
    # Only keep the logic part
    # We will scan backwards from "GEMINI_API_KEY" to find the "const val =" or just duplicate the header.
    # Safer bet: Find the line "const GEMINI_API_KEY" and take everything from the comment block before it.
    
    logic_start_marker = "// ============================================\n// CONFIGURACIÓN DE INTELIGENCIA ARTIFICIAL"
    
    if logic_start_marker in content_str:
        logic_part = content_str[content_str.find(logic_start_marker):]
    else:
        # Fallback: Just look for the marker we found earlier
        logic_part = content_str[split_index:]

    # 3. Construct the new file content
    new_content = f'const SITE_KNOWLEDGE = "{clean_knowledge}";\n\n{logic_part}'
    
    # 4. Write back
    with open(chatbot_js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("chatbot.js repaired successfully!")

if __name__ == "__main__":
    repair_chatbot_file()
