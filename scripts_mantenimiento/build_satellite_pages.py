import os
from pathlib import Path

repo_dir = Path(r"C:\Users\HP\Desktop\repositorio 2\jcastilloc2920.github.io")

def get_base_header(title, desc, canonical, active_key=""):
    return f"""<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{canonical}">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            darkMode: 'class',
            theme: {{
                extend: {{
                    colors: {{
                        darkBg: '#0B1120',
                        darkCard: '#111827',
                        cyanCobalt: '#0284C7',
                        emeraldLive: '#10B981',
                        purpleHemato: '#7C3AED',
                        goldBanner: '#F59E0B'
                    }},
                    fontFamily: {{
                        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                    }}
                }}
            }}
        }}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <style>
        .glass-panel {{
            background: rgba(17, 24, 39, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }}
        .pulse-emerald {{
            animation: pulse-green 2s infinite;
        }}
        @keyframes pulse-green {{
            0% {{ transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }}
            70% {{ transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }}
            100% {{ transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }}
        }}
    </style>
</head>
<body class="bg-darkBg text-slate-100 font-sans selection:bg-cyanCobalt selection:text-white antialiased overflow-x-hidden">

    <!-- NAVBAR SATÉLITE -->
    <header class="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <a href="index.html" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyanCobalt via-purpleHemato to-blue-600 p-[2px] shadow-lg shadow-cyanCobalt/20">
                    <div class="w-full h-full bg-darkBg rounded-[10px] flex items-center justify-center">
                        <i class="fa-solid fa-microscope text-cyan-400"></i>
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-extrabold text-white">JC PATH LAB</span>
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">WSI Online</span>
                    </div>
                    <p class="text-[9px] text-slate-400">DR. JOSEPH C. CASTILLO CUENCA &bull; CMP 56435 / RNE 029291</p>
                </div>
            </a>

            <nav class="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
                <a href="index.html" class="hover:text-cyan-400 transition-colors">Inicio</a>
                <a href="biopsia-prostata-urologia.html" class="{ 'text-cyan-400 font-bold' if active_key == 'prostata' else 'hover:text-cyan-400' }">Próstata Tru-Cut</a>
                <a href="biopsia-gastrica-endoscopia.html" class="{ 'text-cyan-400 font-bold' if active_key == 'gastrica' else 'hover:text-cyan-400' }">Gástrica / Endoscopía</a>
                <a href="inmunohistoquimica-lima.html" class="{ 'text-cyan-400 font-bold' if active_key == 'ihq' else 'hover:text-cyan-400' }">Inmunohistoquímica</a>
                <a href="convenios-clinicas-provincias.html" class="{ 'text-cyan-400 font-bold' if active_key == 'provincias' else 'hover:text-cyan-400' }">Provincias 72h</a>
                <a href="traductor-informes-biopsia.html" class="{ 'text-cyan-400 font-bold' if active_key == 'traductor' else 'hover:text-cyan-400' }">Segunda Opinión</a>
            </nav>

            <div class="flex items-center gap-3">
                <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20consultar%20por%20este%20estudio" target="_blank" class="px-4 py-2 rounded-lg text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5">
                    <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp Directo
                </a>
            </div>
        </div>
    </header>
"""

def get_base_footer():
    return """
    <!-- FOOTER -->
    <footer class="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="space-y-2">
                <strong class="text-white text-base block">JC PATH LAB</strong>
                <p class="text-[11px] leading-relaxed">Laboratorio de Anatomía Patológica & Uropatología de Referencia. Diagnósticos en 48-72h con Servidor WSI propio.</p>
                <div class="text-[11px] text-cyan-400 font-mono">CMP 56435 &bull; RNE 029291</div>
            </div>
            <div>
                <strong class="text-white block mb-2.5 text-xs uppercase tracking-wider">Especialidades</strong>
                <ul class="space-y-1.5 text-[11px]">
                    <li><a href="biopsia-prostata-urologia.html" class="hover:text-cyan-400">Biopsia de Próstata Tru-Cut</a></li>
                    <li><a href="biopsia-gastrica-endoscopia.html" class="hover:text-cyan-400">Biopsias Gástricas & Helicobacter</a></li>
                    <li><a href="inmunohistoquimica-lima.html" class="hover:text-cyan-400">Inmunohistoquímica Oncológica</a></li>
                    <li><a href="convenios-clinicas-provincias.html" class="hover:text-cyan-400">Convenios Clínicas de Provincias</a></li>
                </ul>
            </div>
            <div>
                <strong class="text-white block mb-2.5 text-xs uppercase tracking-wider">Sede Central</strong>
                <p class="text-[11px] leading-relaxed">
                    Jardines de Chillón Mz M2 Lote 13<br>
                    Lima Norte (Puente Piedra / Los Olivos), Lima - Perú.<br>
                    WhatsApp: <strong>+51 986 396 733</strong>
                </p>
            </div>
            <div>
                <strong class="text-white block mb-2.5 text-xs uppercase tracking-wider">Validez Médica</strong>
                <p class="text-[11px] leading-relaxed">
                    Todos los informes cuentan con firma digital, microfotografías HD y código QR de verificación oficial.
                </p>
                <div class="mt-3">
                    <a href="validar.html" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 text-[10px] font-bold">
                        <i class="fa-solid fa-qrcode"></i> Validar Informe PDF
                    </a>
                </div>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-900 text-center text-[10px] text-slate-500">
            &copy; 2026 JC PATH LAB &bull; Dr. Joseph C. Castillo Cuenca. Todos los derechos reservados.
        </div>
    </footer>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>AOS.init({ duration: 700, once: true });</script>
</body>
</html>
"""

# 1. PÁGINA: BIOPSIA PRÓSTATA UROLOGÍA
p1 = get_base_header(
    "Biopsia de Próstata Tru-Cut en Lima | Score Gleason & ISUP en 72 Horas | JC PATH LAB",
    "Servicio de Biopsia de Próstata Tru-Cut hasta 12 cilindros en Lima y provincias. Score Gleason, Grupos Grado ISUP, panel PIN-4 y entrega en 72h por el Dr. Joseph Castillo (CMP 56435 / RNE 029291).",
    "https://jcastilloc2920.github.io/biopsia-prostata-urologia.html",
    "prostata"
) + """
    <main class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-cyanCobalt/20 text-cyan-400 border border-cyanCobalt/40 uppercase tracking-wider">Especialidad de Uropatología Oncológica</span>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">Biopsia de Próstata Tru-Cut: Mapeo de 12 Cilindros en 72 Horas</h1>
            <p class="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                Evaluación histopatológica de máxima precisión dirigida por el <strong>Dr. Joseph C. Castillo Cuenca</strong> (RNE 029291). Informe detallado cilindro por cilindro con Score Gleason, Grupos Grado ISUP/OMS, invasión perineural y panel PIN-4 ante focos mínimos de atipia.
            </p>
            <div class="mt-6 flex flex-wrap gap-3 justify-center">
                <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20cotizar%20una%20Biopsia%20de%20Pr%C3%B3stata%20Tru-Cut" target="_blank" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 font-bold text-white shadow-lg hover:scale-105 transition-all text-xs flex items-center gap-2">
                    <i class="fa-brands fa-whatsapp text-base"></i> Cotizar Biopsia de Próstata (Entrega 72h)
                </a>
            </div>
        </div>

        <!-- Ficha Técnica -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" data-aos="fade-up">
            <div class="glass-panel rounded-2xl p-6">
                <div class="w-10 h-10 rounded-lg bg-cyanCobalt/20 text-cyan-400 flex items-center justify-center mb-3 text-lg"><i class="fa-solid fa-layer-group"></i></div>
                <h3 class="text-base font-bold text-white">Mapeo Cilindro por Cilindro</h3>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">Identificación anatómica precisa (Ápex, Medio, Base - Lóbulo Derecho e Izquierdo). Porcentaje de afectación tumoral milímetro a milímetro.</p>
            </div>
            <div class="glass-panel rounded-2xl p-6 border-purpleHemato/40">
                <div class="w-10 h-10 rounded-lg bg-purpleHemato/20 text-purple-400 flex items-center justify-center mb-3 text-lg"><i class="fa-solid fa-dna"></i></div>
                <h3 class="text-base font-bold text-white">Score Gleason & Grados ISUP</h3>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">Clasificación internacional según consenso OMS/ISUP 2026. Diferenciación estricta entre Gleason 3+3 (ISUP 1), 3+4 (ISUP 2) y 4+3 (ISUP 3).</p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <div class="w-10 h-10 rounded-lg bg-goldBanner/20 text-amber-400 flex items-center justify-center mb-3 text-lg"><i class="fa-solid fa-shield-virus"></i></div>
                <h3 class="text-base font-bold text-white">Panel Inmunohistoquímica PIN-4</h3>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">Triple marcador (p63 + CK-HMW + AMACR) para confirmar focos de adenocarcinoma mínimo o descartar ASAP / PIN de alto grado.</p>
            </div>
        </div>

        <!-- Tabla Comparativa de Tiempos -->
        <div class="glass-panel rounded-3xl p-8 mb-16" data-aos="fade-up">
            <h2 class="text-2xl font-bold text-white mb-6 text-center">¿Por Qué los Urólogos Eligen JC PATH LAB?</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                    <thead class="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                        <tr>
                            <th class="py-3 px-4">Parámetro Clínico</th>
                            <th class="py-3 px-4 text-slate-400">Hospitales / Laboratorios Grandes</th>
                            <th class="py-3 px-4 text-cyan-400 font-bold">JC PATH LAB (Uropatología Especializada)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800 text-slate-300">
                        <tr>
                            <td class="py-3 px-4 font-semibold">Tiempo de Entrega</td>
                            <td class="py-3 px-4 text-rose-400">15 a 25 días hábiles</td>
                            <td class="py-3 px-4 text-emerald-400 font-bold">72 horas hábiles</td>
                        </tr>
                        <tr>
                            <td class="py-3 px-4 font-semibold">Evaluación por Cilindro</td>
                            <td class="py-3 px-4">Agrupados en 1 o 2 frascos generales</td>
                            <td class="py-3 px-4 text-emerald-400 font-bold">Hasta 12 cilindros individualizados</td>
                        </tr>
                        <tr>
                            <td class="py-3 px-4 font-semibold">Visor Digital WSI 40x</td>
                            <td class="py-3 px-4 text-rose-400">No disponible (sólo informe en papel)</td>
                            <td class="py-3 px-4 text-emerald-400 font-bold">Láminas digitalizadas accesibles por QR</td>
                        </tr>
                        <tr>
                            <td class="py-3 px-4 font-semibold">Interconsulta con el Patólogo</td>
                            <td class="py-3 px-4 text-rose-400">Imposible hablar con el patólogo</td>
                            <td class="py-3 px-4 text-emerald-400 font-bold">Llamada / WhatsApp directo con el Dr. Castillo</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
""" + get_base_footer()

with open(repo_dir / "biopsia-prostata-urologia.html", "w", encoding="utf-8") as f:
    f.write(p1)
print("SUCCESS: biopsia-prostata-urologia.html generated")

# 2. PÁGINA: BIOPSIA GÁSTRICA ENDOSCOPÍA
p2 = get_base_header(
    "Biopsia Gástrica y Endoscopía en Lima | Helicobacter pylori en 48h | JC PATH LAB",
    "Diagnóstico de biopsias gástricas en 48 horas en Lima. Detección de Helicobacter pylori con Giemsa, metaplasia intestinal, atrofia y adenocarcinoma gástrico por el Dr. Joseph Castillo.",
    "https://jcastilloc2920.github.io/biopsia-gastrica-endoscopia.html",
    "gastrica"
) + """
    <main class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-cyanCobalt/20 text-cyan-400 border border-cyanCobalt/40 uppercase tracking-wider">Patología Gastrointestinal & Endoscópica</span>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">Biopsias Gástricas & Pólipos: Resultados en 48 Horas</h1>
            <p class="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                Diagnóstico histopatológico rápido para gastroenterólogos y pacientes. Evaluación bajo el <strong>Sistema Sydney Actualizado</strong> con coloración Giemsa para <em>Helicobacter pylori</em> y detección temprana de metaplasia intestinal, atrofia y células en anillo de sello.
            </p>
            <div class="mt-6 flex flex-wrap gap-3 justify-center">
                <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20tengo%20una%20biopsia%20g%C3%A1strica%20y%20deseo%20saber%20el%20costo%20en%2048h" target="_blank" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 font-bold text-white shadow-lg hover:scale-105 transition-all text-xs flex items-center gap-2">
                    <i class="fa-brands fa-whatsapp text-base"></i> Cotizar Biopsia Gástrica (Entrega 48h)
                </a>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" data-aos="fade-up">
            <div class="glass-panel rounded-2xl p-6">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 text-lg"><i class="fa-solid fa-bacteria"></i></div>
                <h3 class="text-base font-bold text-white">Helicobacter pylori (Giemsa)</h3>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">Búsqueda exhaustiva con coloración histoquímica especial de Giemsa en antro y cuerpo gástrico sin costo adicional.</p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <div class="w-10 h-10 rounded-lg bg-cyanCobalt/20 text-cyan-400 flex items-center justify-center mb-3 text-lg"><i class="fa-solid fa-microscope"></i></div>
                <h3 class="text-base font-bold text-white">Metaplasia Intestinal & Displasia</h3>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">Gradación precisa (completa vs incompleta) y descarte de displasia de bajo/alto grado para definir el protocolo de vigilancia endoscópica.</p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <div class="w-10 h-10 rounded-lg bg-purpleHemato/20 text-purple-400 flex items-center justify-center mb-3 text-lg"><i class="fa-solid fa-disease"></i></div>
                <h3 class="text-base font-bold text-white">Pólipos de Colon & Gástricos</h3>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">Adenomas tubulares, tubulovellosos, adenomas aserrados y pólipos hiperplásicos con evaluación de márgenes de resección endoscópica.</p>
            </div>
        </div>
    </main>
""" + get_base_footer()

with open(repo_dir / "biopsia-gastrica-endoscopia.html", "w", encoding="utf-8") as f:
    f.write(p2)
print("SUCCESS: biopsia-gastrica-endoscopia.html generated")

# 3. PÁGINA: INMUNOHISTOQUÍMICA LIMA
p3 = get_base_header(
    "Inmunohistoquímica en Lima | Paneles Oncológicos Ki-67, HER2, PIN-4 | JC PATH LAB",
    "Servicio de Inmunohistoquímica (IHQ) rápida en Lima y provincias. Paneles mamarios (RE, RP, HER2, Ki-67), urológicos (PIN-4) y neuroendocrinos por el Dr. Joseph Castillo.",
    "https://jcastilloc2920.github.io/inmunohistoquimica-lima.html",
    "ihq"
) + """
    <main class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-purpleHemato/20 text-purple-400 border border-purpleHemato/40 uppercase tracking-wider">Patología Molecular & Inmunofenotipo</span>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">Inmunohistoquímica (IHQ) Oncológica de Alta Certeza</h1>
            <p class="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                Paneles de anticuerpos monoclonales para definir estirpe tumoral, factores pronósticos y blancos terapéuticos en cáncer de mama, próstata, pulmón, colon y partes blandas.
            </p>
            <div class="mt-6 flex flex-wrap gap-3 justify-center">
                <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20cotizar%20un%20panel%20de%20Inmunohistoqu%C3%ADmica%20para%20un%20taco%20de%20parafina" target="_blank" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 font-bold text-white shadow-lg hover:scale-105 transition-all text-xs flex items-center gap-2">
                    <i class="fa-brands fa-whatsapp text-base"></i> Cotizar Panel de Inmunohistoquímica
                </a>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" data-aos="fade-up">
            <div class="glass-panel rounded-2xl p-6">
                <span class="text-xs font-bold text-cyan-400 block mb-1">PANEL MAMA</span>
                <h3 class="text-base font-bold text-white">RE, RP, Ki-67, HER2</h3>
                <p class="text-xs text-slate-300 mt-2">Clasificación molecular Luminal A, Luminal B, HER2 enriquecido y Triple Negativo.</p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <span class="text-xs font-bold text-purple-400 block mb-1">PANEL PRÓSTATA</span>
                <h3 class="text-base font-bold text-white">Triple PIN-4</h3>
                <p class="text-xs text-slate-300 mt-2">p63 + CK-HMW (células basales) + AMACR/racemasa (neoplasia acinar).</p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <span class="text-xs font-bold text-emerald-400 block mb-1">PANEL EPITELIAL</span>
                <h3 class="text-base font-bold text-white">CK7, CK20, CDX2</h3>
                <p class="text-xs text-slate-300 mt-2">Determinación de primario desconocido en metástasis gastrointestinales y ginecológicas.</p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <span class="text-xs font-bold text-amber-400 block mb-1">LINFOMA / MESÉNQUIMA</span>
                <h3 class="text-base font-bold text-white">CD3, CD20, CD34, S100</h3>
                <p class="text-xs text-slate-300 mt-2">Diagnóstico diferencial de proliferaciones linfoides atípicas y sarcomas de partes blandas.</p>
            </div>
        </div>
    </main>
""" + get_base_footer()

with open(repo_dir / "inmunohistoquimica-lima.html", "w", encoding="utf-8") as f:
    f.write(p3)
print("SUCCESS: inmunohistoquimica-lima.html generated")

# 4. PÁGINA: CONVENIOS CLÍNICAS PROVINCIAS
p4 = get_base_header(
    "Convenios de Biopsias para Clínicas de Provincias (72h Olva) | JC PATH LAB",
    "Servicio de anatomía patológica para clínicas, policlínicos y cirujanos de Arequipa, Jaén, Trujillo, Cusco y todo el Perú. Entrega en 72h con Olva Courier y app móvil quirúrgica.",
    "https://jcastilloc2920.github.io/convenios-clinicas-provincias.html",
    "provincias"
) + """
    <main class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-goldBanner/20 text-amber-400 border border-goldBanner/40 uppercase tracking-wider">Red Logística Nacional de Patología</span>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">Convenios de Biopsias para Clínicas y Cirujanos de Provincias</h1>
            <p class="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                Conectamos centros quirúrgicos de Arequipa, Jaén, Trujillo, Piura, Cusco, Huancayo y todo el Perú con nuestra estación central en Lima. El tránsito de 48-72h vía Olva Courier se integra biológicamente con la fijación en formol al 10%.
            </p>
            <div class="mt-6 flex flex-wrap gap-3 justify-center">
                <a href="https://wa.me/51986396733?text=Estimado%20Dr.%20Castillo,%20represento%20a%20una%20cl%C3%ADnica%20en%20provincia%20y%20deseamos%20convenio" target="_blank" class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyanCobalt to-blue-600 font-bold text-white shadow-lg hover:scale-105 transition-all text-xs flex items-center gap-2">
                    <i class="fa-solid fa-handshake text-base"></i> Solicitar Alianza B2B para Clínicas
                </a>
            </div>
        </div>

        <div class="glass-panel rounded-3xl p-8 mb-16" data-aos="fade-up">
            <h2 class="text-2xl font-bold text-white mb-6 text-center">Beneficios del Convenio Nacional</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <strong class="text-cyan-400 block mb-1 text-sm"><i class="fa-solid fa-box mr-1.5"></i> Suministro de Frascos</strong>
                    <p class="text-xs text-slate-300">Enviamos cajas con frascos rotulados con formol neutro al 10% listos para usar en su quirófano.</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <strong class="text-emerald-400 block mb-1 text-sm"><i class="fa-solid fa-mobile-screen mr-1.5"></i> Notificación Directa al Cirujano</strong>
                    <p class="text-xs text-slate-300">Apenas se firma el reporte, el cirujano recibe el informe en PDF con fotos a color en su WhatsApp.</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <strong class="text-purple-400 block mb-1 text-sm"><i class="fa-solid fa-percent mr-1.5"></i> Tarifas B2B Preferenciales</strong>
                    <p class="text-xs text-slate-300">Descuentos escalonados por volumen mensual para clínicas y policlínicos asociados.</p>
                </div>
            </div>
        </div>
    </main>
""" + get_base_footer()

with open(repo_dir / "convenios-clinicas-provincias.html", "w", encoding="utf-8") as f:
    f.write(p4)
print("SUCCESS: convenios-clinicas-provincias.html generated")

# 5. PÁGINA: TRADUCTOR DE INFORMES Y SEGUNDA OPINIÓN
p5 = get_base_header(
    "¿Qué Significa tu Resultado de Biopsia? Segunda Opinión Médica | JC PATH LAB",
    "Explicación médica de resultados de biopsia: metaplasia intestinal, displasia, adenocarcinoma Gleason, gastritis atrófica. Solicita revisión de láminas y tacos con el Dr. Joseph Castillo.",
    "https://jcastilloc2920.github.io/traductor-informes-biopsia.html",
    "traductor"
) + """
    <main class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">Imán de Pacientes & Orientación Médica</span>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">¿No Entiendes tu Resultado de Biopsia?</h1>
            <p class="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed">
                Términos como <em>metaplasia intestinal</em>, <em>displasia</em> o <em>Gleason 3+4</em> suelen asustar a los pacientes. Consulta gratis a nuestro asistente o solicita una <strong>Segunda Opinión Formal (Revisión de Láminas y Tacos de Parafina)</strong> con el Dr. Joseph C. Castillo Cuenca (CMP 56435 / RNE 029291).
            </p>
            <div class="mt-6 flex flex-wrap gap-3 justify-center">
                <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20tengo%20un%20informe%20de%20biopsia%20que%20deseo%20que%20revise" target="_blank" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 font-bold text-white shadow-lg hover:scale-105 transition-all text-xs flex items-center gap-2">
                    <i class="fa-brands fa-whatsapp text-base"></i> Enviar Foto de mi Informe para Orientación
                </a>
            </div>
        </div>

        <!-- Glosario Explicativo de los 6 Términos Más Buscados en Perú -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16" data-aos="fade-up">
            <div class="glass-panel rounded-2xl p-6">
                <strong class="text-cyan-400 block text-base mb-1">1. Metaplasia Intestinal Gástrica</strong>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Las células del estómago cambian para parecerse a las del intestino debido a inflamación crónica o Helicobacter pylori. <strong>No es cáncer</strong>, pero requiere seguimiento periódico según sea completa o incompleta.
                </p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <strong class="text-purple-400 block text-base mb-1">2. Displasia de Bajo Grado vs Alto Grado</strong>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Alteración celular que puede aparecer en pólipos de colon o estómago. La de bajo grado tiene mínimo riesgo; la de alto grado debe extirparse por completo para evitar progresión.
                </p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <strong class="text-emerald-400 block text-base mb-1">3. Score Gleason 6 (3+3) en Próstata</strong>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Equivale al Grupo Grado ISUP 1. Es un tumor de muy bajo riesgo y crecimiento lento que en muchos casos puede vigilarse activamente sin necesidad de cirugía inmediata.
                </p>
            </div>
            <div class="glass-panel rounded-2xl p-6">
                <strong class="text-amber-400 block text-base mb-1">4. Hiperplasia Prostática Benigna (HPB)</strong>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Crecimiento benigno de la glándula prostática muy común a partir de los 50 años. <strong>Descarta completamente malignidad</strong> en el tejido evaluado.
                </p>
            </div>
        </div>
    </main>
""" + get_base_footer()

with open(repo_dir / "traductor-informes-biopsia.html", "w", encoding="utf-8") as f:
    f.write(p5)
print("SUCCESS: traductor-informes-biopsia.html generated")

# 6. PÁGINA: VALIDAR INFORME QR (Navboost SEO Traffic Trap)
p6 = get_base_header(
    "Validador Oficial de Informes Histopatológicos | JC PATH LAB",
    "Portal oficial de verificación y trazabilidad de informes anatomopatológicos de JC PATH LAB mediante código QR y firma digital del Dr. Joseph Castillo.",
    "https://jcastilloc2920.github.io/validar.html",
    "validar"
) + """
    <main class="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="glass-panel rounded-3xl p-8 sm:p-12" data-aos="fade-up">
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-500/30">
                <i class="fa-solid fa-certificate"></i>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">Sistema de Trazabilidad Oficial</span>
            <h1 class="text-2xl sm:text-4xl font-extrabold text-white mt-3">Validación de Informe Histopatológico</h1>
            <p class="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                Ingresa el código oficial de atención o escanea el código QR impreso en el informe PDF emitido por JC PATH LAB:
            </p>

            <form onsubmit="simularValidacion(event)" class="mt-8 max-w-md mx-auto flex gap-2">
                <input type="text" id="inputCodigoValidar" placeholder="Ej. 26Q-387" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyanCobalt uppercase font-mono">
                <button type="submit" class="px-5 py-3 rounded-xl bg-cyanCobalt hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all">
                    <i class="fa-solid fa-magnifying-glass"></i> Validar
                </button>
            </form>

            <div id="resultadoValidacion" class="mt-8 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-left hidden">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span class="text-xs font-bold text-emerald-400"><i class="fa-solid fa-check-double mr-1.5"></i> INFORME VÁLIDO & AUTÉNTICO</span>
                    <span id="resCodigo" class="font-mono text-xs font-bold text-cyan-400">CASO 26Q-387</span>
                </div>
                <div class="grid grid-cols-2 gap-4 pt-4 text-xs">
                    <div>
                        <span class="text-slate-400 block text-[10px]">DIRECTOR MÉDICO FIRMANTE:</span>
                        <strong class="text-white">Dr. Joseph C. Castillo Cuenca</strong>
                        <span class="text-slate-500 block text-[10px]">CMP 56435 / RNE 029291</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">ESTADO EN SERVIDOR:</span>
                        <span class="text-emerald-400 font-bold">CUSTODIADO EN RAID WSI LOCAL</span>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <script>
        function simularValidacion(e) {
            e.preventDefault();
            const val = document.getElementById('inputCodigoValidar').value.trim();
            if (!val) return;
            const res = document.getElementById('resultadoValidacion');
            document.getElementById('resCodigo').innerText = 'CASO ' + val.toUpperCase();
            res.classList.remove('hidden');
        }
    </script>
""" + get_base_footer()

with open(repo_dir / "validar.html", "w", encoding="utf-8") as f:
    f.write(p6)
print("SUCCESS: validar.html generated")
