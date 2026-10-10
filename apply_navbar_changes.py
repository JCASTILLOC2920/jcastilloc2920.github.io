import sys

# 1. Modificar index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Altura 58px -> 67px (+15%)
html = html.replace('height: calc(100vh - 58px);', 'height: calc(100vh - 67px);')
html = html.replace('max-height: calc(100vh - 58px);', 'max-height: calc(100vh - 67px);')

old_navbar_css = '''.top-navbar {
            position: relative;
            height: 58px;
            max-height: 58px;'''

new_navbar_css = '''.top-navbar {
            position: relative;
            height: 67px;
            max-height: 67px;'''

html = html.replace(old_navbar_css, new_navbar_css)
html = html.replace(old_navbar_css.replace('\n', '\r\n'), new_navbar_css.replace('\n', '\r\n'))

# Reglas del boton creador de paneles
btn_css = '''
        /* Botón Quirúrgico Creador de Paneles IHQ */
        .btn-header-ihq-builder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(2, 132, 199, 0.95)) !important;
            color: #ffffff !important;
            border: 1px solid #38bdf8 !important;
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.35) !important;
            font-family: 'Montserrat', 'Inter', sans-serif !important;
            font-weight: 800 !important;
            padding: 8px 16px !important;
            border-radius: 24px !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            text-decoration: none !important;
            transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .btn-header-ihq-builder:hover {
            transform: translateY(-2px) !important;
            filter: brightness(1.1) !important;
            box-shadow: 0 0 24px rgba(56, 189, 248, 0.55) !important;
        }
        .btn-badge-ai {
            background: rgba(15, 23, 42, 0.85);
            color: #38bdf8;
            font-size: 10px;
            font-weight: 900;
            padding: 2px 7px;
            border-radius: 999px;
            border: 1px solid rgba(56, 189, 248, 0.6);
            letter-spacing: 0.5px;
            margin-left: 2px;
        }
        @media (max-width: 1200px) {
            .btn-header-ihq-builder .ihq-btn-text-full {
                display: none;
            }
            .btn-header-ihq-builder .ihq-btn-text-short {
                display: inline;
            }
        }
        @media (min-width: 1201px) {
            .btn-header-ihq-builder .ihq-btn-text-short {
                display: none;
            }
            .btn-header-ihq-builder .ihq-btn-text-full {
                display: inline;
            }
        }
'''

if '/* Responsive Breakpoints */' in html and '.btn-header-ihq-builder' not in html:
    html = html.replace('/* Responsive Breakpoints */', btn_css + '\n        /* Responsive Breakpoints */')

# Boton en el DOM
old_actions = '<div class="header-actions">'
btn_html = '''<div class="header-actions">
                <a href="immunomaster_app.html" target="_blank" rel="noopener noreferrer" class="btn-header btn-header-ihq-builder" id="btnHeaderIhqBuilder" title="Abrir Creador de Paneles de Inmunohistoquímica (ImmunoMaster AI Universal)">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color: #fef08a;"></i>
                    <span class="ihq-btn-text-full">Creador de Paneles IHQ</span>
                    <span class="ihq-btn-text-short">Paneles IHQ</span>
                    <span class="btn-badge-ai">IA</span>
                </a>'''

if 'btnHeaderIhqBuilder' not in html:
    html = html.replace(old_actions, btn_html, 1)
else:
    # Si ya existía una versión anterior del botón, actualizarlo a la versión exacta solicitada
    import re
    btn_regex = r'<a href="[^"]*"[^>]*class="btn-header btn-header-ihq-builder"[^>]*>.*?</a>'
    replacement_btn = '''<a href="immunomaster_app.html" target="_blank" rel="noopener noreferrer" class="btn-header btn-header-ihq-builder" id="btnHeaderIhqBuilder" title="Abrir Creador de Paneles de Inmunohistoquímica (ImmunoMaster AI Universal)">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color: #fef08a;"></i>
                    <span class="ihq-btn-text-full">Creador de Paneles IHQ</span>
                    <span class="ihq-btn-text-short">Paneles IHQ</span>
                    <span class="btn-badge-ai">IA</span>
                </a>'''
    html = re.sub(btn_regex, replacement_btn, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html actualizado exitosamente")

# 2. Modificar dossier_web_interactive.css
with open('dossier_web_interactive.css', 'r', encoding='utf-8') as f:
    css = f.read()

if '.btn-header-ihq-builder' not in css:
    target = '.btn-header-wa:hover {'
    if target in css:
        parts = css.split(target, 1)
        subparts = parts[1].split('}', 1)
        css = parts[0] + target + subparts[0] + '}\n' + btn_css + subparts[1]
        with open('dossier_web_interactive.css', 'w', encoding='utf-8') as f:
            f.write(css)
        print("dossier_web_interactive.css actualizado exitosamente")
else:
    print("dossier_web_interactive.css ya contenía .btn-header-ihq-builder")
