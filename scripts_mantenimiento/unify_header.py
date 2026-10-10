import os
import re

# Standard Tags for HEAD
HEAD_RESOURCES = """    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom Style -->
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="mobile-app.css">"""

# Standard Header Snippet (Updated: Modern Clean Navigation)
STANDARD_HEADER_TEMPLATE = """    <!-- Header Section -->
    <header class="header">
        <div class="header-container">
            <!-- Logo -->
            <div class="logo-container">
                <a href="index.html" class="logo-link">
                    <img src="logo-jcpathlab.png" alt="JC PATH LAB, laboratorio de anatomía patológica y biopsias en Lima"
                        class="logo" width="180" height="60" loading="eager">
                </a>
            </div>

            <!-- Navigation Menu -->
            <nav>
                <ul class="nav-menu">
                    <li class="nav-item"><a href="index.html" class="nav-link {active_inicio}">Inicio</a></li>
                    <li class="nav-item"><a href="inmunohistoquimica.html" class="nav-link">Inmunohistoquímica</a></li>
                    <li class="nav-item"><a href="patologia-digital.html" class="nav-link">Patología Digital</a></li>
                    <li class="nav-item"><a href="macroscopia-360.html" class="nav-link">Visor 360°</a></li>
                    <li class="nav-item"><a href="academica.html" class="nav-link {active_academica}">Área Académica</a></li>
                    <li class="nav-item"><a href="contacto.html" class="nav-link">Sede & Contacto</a></li>
                    <li class="nav-item"><a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20coordinar%20el%20estudio%20de%20una%20biopsia" target="_blank" class="nav-link" style="color:#10b981;font-weight:700;"><i class="fab fa-whatsapp"></i> Contactar</a></li>
                </ul>
            </nav>

            <!-- Hamburger Menu -->
            <button class="hamburger" aria-label="Abrir menú de navegación">
                <span class="line"></span>
                <span class="line"></span>
                <span class="line"></span>
            </button>
        </div>
    </header>"""

def unify_file(filepath):
    filename = os.path.basename(filepath)
    print(f"Sincronizando: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define active states
    states = {
        "active_inicio": "",
        "active_institucional": "",
        "active_cv": "",
        "active_academica": "",
        "active_zona_medica": "",
        "active_classroom": "",
        "active_blogs": "",
        "active_solicitud": ""
    }
    
    if filename == "index.html":
        states["active_inicio"] = "active"
    elif filename == "cv.html":
        states["active_institucional"] = "active"
        states["active_cv"] = "active"
    elif filename == "educacion-medica.html":
        states["active_academica"] = "active"
        states["active_zona_medica"] = "active"
    elif filename == "classroom.html":
        states["active_academica"] = "active"
        states["active_classroom"] = "active"
    elif filename == "blogs.html":
        states["active_academica"] = "active"
        states["active_blogs"] = "active"
    elif filename == "solicitud.html":
        states["active_solicitud"] = "active"
        
    new_header = STANDARD_HEADER_TEMPLATE.format(**states)

    # 1. Update Head Resources (Font Awesome, Google Fonts, style.css)
    # Target all link tags that look like CSS or preloads for styles/icons
    head_pattern = re.compile(r'<!-- (Fonts|Icons|Styles) -->.*?link.*?style\.css.*?>', re.DOTALL | re.IGNORECASE)
    # If standard tags exist, replace them. If not, we'll try a broader match or insert it.
    if not head_pattern.search(content):
        # Alternative: look for any <link rel="stylesheet"> and replace the sequence
        head_pattern = re.compile(r'(<link.*?href=".*?font-awesome.*?>.*?<link.*?href="style\.css".*?>)', re.DOTALL | re.IGNORECASE)
    
    if head_pattern.search(content):
        content = head_pattern.sub(HEAD_RESOURCES, content)
    else:
        # Fallback: find </head> and insert before
        content = content.replace('</head>', HEAD_RESOURCES + '\n</head>')

    # 2. Update Header Body
    header_pattern = re.compile(r'(<!-- Header Section -->\s*)?<header class="header">.*?</header>', re.DOTALL)
    
    if header_pattern.search(content):
        updated_content = header_pattern.sub(new_header, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    return False

if __name__ == "__main__":
    count = 0
    for f in os.listdir('.'):
        if f.endswith('.html') and f != "404.html":
            if unify_file(f):
                count += 1
    print(f"Total de archivos actualizados: {count}")
