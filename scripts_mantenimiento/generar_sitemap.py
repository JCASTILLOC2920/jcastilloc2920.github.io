import os
from datetime import datetime

BASE_URL = "https://jcastilloc2920.github.io"
REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def generar_sitemap():
    rutas_html = []
    
    for root, dirs, files in os.walk(REPO_DIR):
        if '\\.git\\' in root or '/.git/' in root or '\\node_modules\\' in root or root.endswith('.git') or root.endswith('node_modules'):
            continue
            
        for file in files:
            if file.endswith(".html"):
                rel_path = os.path.relpath(os.path.join(root, file), REPO_DIR)
                rel_path = rel_path.replace("\\", "/")
                
                if rel_path == "404.html" or "google" in rel_path:
                    continue
                    
                prioridad = "0.6"
                if rel_path == "index.html":
                    prioridad = "1.0"
                    rel_path = "" 
                elif "seo-local" in rel_path or "seo-nacional" in rel_path:
                    prioridad = "0.9"
                    
                url_completa = f"{BASE_URL}/{rel_path}" if rel_path else BASE_URL
                fecha_actual = datetime.now().strftime("%Y-%m-%d")
                
                bloque = f"""  <url>
    <loc>{url_completa}</loc>
    <lastmod>{fecha_actual}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{prioridad}</priority>
  </url>"""
                rutas_html.append(bloque)
                
    sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(rutas_html)}
</urlset>"""

    with open(os.path.join(REPO_DIR, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sitemap_content)
        
    print(f"[EXITO] Sitemap generado con exito. {len(rutas_html)} URLs indexadas.")

if __name__ == "__main__":
    generar_sitemap()
