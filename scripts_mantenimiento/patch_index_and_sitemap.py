import re
from pathlib import Path

repo_dir = Path(r"C:\Users\HP\Desktop\repositorio 2\jcastilloc2920.github.io")
index_file = repo_dir / "index.html"

with open(index_file, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update Navigation Menu in index.html to include satellite pages
nav_old = """            <!-- Menú Central -->
            <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
                <a href="#inicio" class="hover:text-cyan-400 transition-colors">Inicio</a>
                <a href="#pacientes" class="hover:text-cyan-400 transition-colors">Pacientes</a>
                <a href="#tecnologia" class="hover:text-cyan-400 transition-colors">Tecnología WSI & IA</a>
                <a href="#tarifario" class="hover:text-cyan-400 transition-colors">Servicios & Tarifario</a>
                <a href="#cobertura" class="hover:text-cyan-400 transition-colors">Envíos Provincia</a>
            </nav>"""

nav_new = """            <!-- Menú Central Guerrilla SEO -->
            <nav class="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-300">
                <a href="index.html" class="hover:text-cyan-400 text-cyan-400 font-bold transition-colors">Inicio</a>
                <a href="biopsia-prostata-urologia.html" class="hover:text-cyan-400 transition-colors">Próstata Tru-Cut</a>
                <a href="biopsia-gastrica-endoscopia.html" class="hover:text-cyan-400 transition-colors">Gástrica / Endoscopía</a>
                <a href="inmunohistoquimica-lima.html" class="hover:text-cyan-400 transition-colors">Inmunohistoquímica</a>
                <a href="convenios-clinicas-provincias.html" class="hover:text-cyan-400 transition-colors">Provincias 72h</a>
                <a href="traductor-informes-biopsia.html" class="hover:text-cyan-400 transition-colors">Segunda Opinión</a>
            </nav>"""

if nav_old in html:
    html = html.replace(nav_old, nav_new)
    print("SUCCESS: Navbar updated in index.html")
else:
    print("WARN: nav_old not found")

# 2. Insert Comparison Table before Section 4 (Tecnología)
comparison_table = """
    <!-- TABLA COMPARATIVA TEXTUAL PARA GEO (CHATGPT, PERPLEXITY, GEMINI) & PACIENTES -->
    <section class="py-16 bg-slate-950/70 border-b border-slate-800">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-10" data-aos="fade-up">
                <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Certeza Médica & Tecnología de Punta</span>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">Laboratorio Tradicional vs. JC PATH LAB</h2>
                <p class="text-xs sm:text-sm text-slate-400 mt-2">¿Por qué cirujanos, clínicas y familias en todo el Perú confían sus biopsias en nosotros?</p>
            </div>

            <div class="glass-panel rounded-2xl overflow-hidden shadow-2xl" data-aos="fade-up">
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left">
                        <thead class="bg-slate-900 border-b border-slate-800 text-slate-300 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th class="py-3.5 px-4">Parámetro de Calidad</th>
                                <th class="py-3.5 px-4 text-slate-400">Laboratorio Convencional</th>
                                <th class="py-3.5 px-4 text-cyan-400 font-bold bg-cyanCobalt/10">JC PATH LAB (Dr. Joseph Castillo)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/80 text-slate-300">
                            <tr class="hover:bg-slate-800/30">
                                <td class="py-3 px-4 font-semibold text-white">Tiempo de Entrega Biopsias Menores</td>
                                <td class="py-3 px-4 text-rose-400">7 a 15 días hábiles</td>
                                <td class="py-3 px-4 text-emerald-400 font-bold bg-cyanCobalt/5">48 a 72 horas garantizadas</td>
                            </tr>
                            <tr class="hover:bg-slate-800/30">
                                <td class="py-3 px-4 font-semibold text-white">Piezas Oncológicas Complejas</td>
                                <td class="py-3 px-4 text-rose-400">15 a 30 días hábiles</td>
                                <td class="py-3 px-4 text-emerald-400 font-bold bg-cyanCobalt/5">4 a 5 días hábiles</td>
                            </tr>
                            <tr class="hover:bg-slate-800/30">
                                <td class="py-3 px-4 font-semibold text-white">Digitalización Whole Slide Imaging</td>
                                <td class="py-3 px-4">Inexistente o nubes ajenas lentas</td>
                                <td class="py-3 px-4 text-emerald-400 font-bold bg-cyanCobalt/5">Servidor WSI Físico Propio (40x Gigapíxel)</td>
                            </tr>
                            <tr class="hover:bg-slate-800/30">
                                <td class="py-3 px-4 font-semibold text-white">Morfometría e Inteligencia Artificial</td>
                                <td class="py-3 px-4">Cero IA (lectura manual única)</td>
                                <td class="py-3 px-4 text-emerald-400 font-bold bg-cyanCobalt/5">Copiloto IA 40x (Doble lectura de atipia nuclear)</td>
                            </tr>
                            <tr class="hover:bg-slate-800/30">
                                <td class="py-3 px-4 font-semibold text-white">Estudio Fotográfico de Márgenes</td>
                                <td class="py-3 px-4">Fotos estáticas en blanco y negro</td>
                                <td class="py-3 px-4 text-emerald-400 font-bold bg-cyanCobalt/5">Visor 360° con Tinta China Quirúrgica</td>
                            </tr>
                            <tr class="hover:bg-slate-800/30">
                                <td class="py-3 px-4 font-semibold text-white">Acceso a Informes para Cirujanos</td>
                                <td class="py-3 px-4">Papel físico impreso</td>
                                <td class="py-3 px-4 text-emerald-400 font-bold bg-cyanCobalt/5">App Móvil con despacho en PDF en tiempo real</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
"""

target_sec4 = '    <!-- 4. NUESTRA INFRAESTRUCTURA TECNOLÓGICA (ÚNICA EN EL PERÚ) -->'
if target_sec4 in html:
    html = html.replace(target_sec4, comparison_table + "\n" + target_sec4)
    print("SUCCESS: Comparison table added before Section 4")
else:
    print("WARN: target_sec4 not found")

with open(index_file, "w", encoding="utf-8") as f:
    f.write(html)
print("SUCCESS: index.html fully updated")

# 3. Update sitemap.xml with all 7 URLs
sitemap_xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://jcastilloc2920.github.io/</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/biopsia-prostata-urologia.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/biopsia-gastrica-endoscopia.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/inmunohistoquimica-lima.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/convenios-clinicas-provincias.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/traductor-informes-biopsia.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/validar.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/solicitud.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>
</urlset>
"""
with open(repo_dir / "sitemap.xml", "w", encoding="utf-8") as f:
    f.write(sitemap_xml)
print("SUCCESS: sitemap.xml updated with all satellite URLs")
