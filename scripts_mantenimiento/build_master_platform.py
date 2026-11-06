import os
from pathlib import Path

html_content = """<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JC PATH LAB | Laboratorio de Anatomía Patológica, Biopsias y Patología Digital en Lima</title>
    
    <!-- SEO Meta Tags Supremos -->
    <meta name="description" content="Laboratorio de Anatomía Patológica y Uropatología en Lima dirigido por el Dr. Joseph C. Castillo Cuenca (CMP 56435 / RNE 029291). Biopsias gástricas, próstata, piezas oncológicas, patología digital WSI, morfometría IA a 40x y entrega en 48-72h. Cobertura en todo el Perú.">
    <meta name="keywords" content="laboratorio anatomia patologica lima, biopsias lima, uropatologia, patologia digital WSI, patologo lima norte, biopsia prostata tru-cut, papanicolaou lima, biopsia gastrica, doctor joseph castillo cuenca, jc path lab">
    <meta name="author" content="Dr. Joseph C. Castillo Cuenca">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://jcastilloc2920.github.io/">

    <!-- Open Graph / Redes Sociales -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://jcastilloc2920.github.io/">
    <meta property="og:title" content="JC PATH LAB | Innovación en Anatomía Patológica & WSI 40x">
    <meta property="og:description" content="Diagnósticos patológicos de máxima precisión en 48-72 horas con servidor WSI propio, microscopio digital y morfometría IA.">
    <meta property="og:image" content="https://jcastilloc2920.github.io/assets/fotos_hd/microscopio.jpg">

    <!-- Tailwind CSS (CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        darkBg: '#0B1120',
                        darkCard: '#111827',
                        clinicalWhite: '#F8FAFC',
                        cyanCobalt: '#0284C7',
                        emeraldLive: '#10B981',
                        purpleHemato: '#7C3AED',
                        goldBanner: '#F59E0B'
                    },
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <!-- Google Fonts & FontAwesome & AOS -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    <!-- Schema.org JSON-LD para MedicalBusiness & PathologyLab (E-E-A-T Google) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "MedicalBusiness",
          "@id": "https://jcastilloc2920.github.io/#organization",
          "name": "JC PATH LAB - Laboratorio de Anatomía Patológica & Patología Digital WSI",
          "url": "https://jcastilloc2920.github.io/",
          "logo": "https://jcastilloc2920.github.io/assets/fotos_hd/microscopio.jpg",
          "image": "https://jcastilloc2920.github.io/assets/fotos_hd/area_de_macroscopia.jpg",
          "description": "Centro especializado en diagnóstico histopatológico, uropatología, biopsias por punción, piezas oncológicas complejas y patología digital WSI 40x.",
          "telephone": "+51986396733",
          "email": "jclab59@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jardines de Chillón Mz M2 Lote 13",
            "addressLocality": "Puente Piedra / Los Olivos",
            "addressRegion": "Lima",
            "addressCountry": "PE"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -11.8654,
            "longitude": -77.0782
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "07:30",
              "closes": "20:00"
            }
          ],
          "priceRange": "$$"
        },
        {
          "@type": "Physician",
          "@id": "https://jcastilloc2920.github.io/#director",
          "name": "Dr. Joseph C. Castillo Cuenca",
          "jobTitle": "Director Médico y Médico Especialista en Anatomía Patológica",
          "medicalSpecialty": "Pathology",
          "identifier": [
            {
              "@type": "PropertyValue",
              "name": "CMP",
              "value": "56435"
            },
            {
              "@type": "PropertyValue",
              "name": "RNE",
              "value": "029291"
            }
          ],
          "worksFor": {
            "@id": "https://jcastilloc2920.github.io/#organization"
          }
        }
      ]
    }
    </script>

    <style>
        .glass-panel {
            background: rgba(17, 24, 39, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-panel-glow:hover {
            border-color: rgba(2, 132, 199, 0.45);
            box-shadow: 0 10px 30px -10px rgba(2, 132, 199, 0.3);
        }
        .pulse-emerald {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
    </style>
</head>
<body class="bg-darkBg text-slate-100 font-sans selection:bg-cyanCobalt selection:text-white antialiased overflow-x-hidden">

    <!-- 1. STICKY NAVBAR INTELIGENTE CON STATUS WSI -->
    <header class="sticky top-0 z-50 glass-panel border-b border-slate-800/80 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            <!-- Logo & Indicador Soberano -->
            <a href="#" class="flex items-center gap-3 group">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyanCobalt via-purpleHemato to-blue-600 p-[2px] shadow-lg shadow-cyanCobalt/20 group-hover:scale-105 transition-transform">
                    <div class="w-full h-full bg-darkBg rounded-[10px] flex items-center justify-center">
                        <i class="fa-solid fa-microscope text-cyan-400 text-lg"></i>
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">JC PATH LAB</span>
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-emerald"></span>
                            Servidor WSI Online
                        </span>
                    </div>
                    <p class="text-[10px] text-slate-400 font-medium tracking-wide">ANATOMÍA PATOLÓGICA &bull; CMP 56435 / RNE 029291</p>
                </div>
            </a>

            <!-- Menú Central -->
            <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
                <a href="#inicio" class="hover:text-cyan-400 transition-colors">Inicio</a>
                <a href="#pacientes" class="hover:text-cyan-400 transition-colors">Pacientes</a>
                <a href="#tecnologia" class="hover:text-cyan-400 transition-colors">Tecnología WSI & IA</a>
                <a href="#tarifario" class="hover:text-cyan-400 transition-colors">Servicios & Tarifario</a>
                <a href="#cobertura" class="hover:text-cyan-400 transition-colors">Envíos Provincia</a>
            </nav>

            <!-- Acciones Rápidas -->
            <div class="flex items-center gap-3">
                <a href="#portal-medicos" onclick="abrirModalPortalMedicos()" class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all">
                    <i class="fa-solid fa-hospital-user text-cyan-400"></i> Portal Médicos
                </a>
                <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20cotizar%20un%20estudio%20de%20biopsia" target="_blank" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-105">
                    <i class="fa-brands fa-whatsapp text-sm"></i> Cotizar WhatsApp
                </a>
            </div>
        </div>
    </header>

    <!-- 2. HERO SECTION CON CONMUTADOR INTERACTIVO PACIENTE / MÉDICO -->
    <section id="inicio" class="relative pt-16 pb-24 overflow-hidden">
        <!-- Luces de fondo -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyanCobalt/20 via-purpleHemato/15 to-transparent blur-[120px] pointer-events-none -z-10"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="fade-up">
            
            <!-- Badge de Autoridad -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-800/90 border border-slate-700/80 text-cyan-300 mb-6 shadow-inner">
                <i class="fa-solid fa-certificate text-goldBanner"></i>
                Único Laboratorio en Perú con Servidor WSI Dedicado y Entrega en 48-72h
            </div>

            <!-- Titular H1 Supremo -->
            <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
                Precisión Diagnóstica en <span class="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Anatomía Patológica</span> Impulsada por IA
            </h1>
            
            <p class="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
                Dirigido por el <strong class="text-white font-semibold">Dr. Joseph C. Castillo Cuenca</strong> (CMP 56435 / RNE 029291). Brindamos certeza médica con tecnología Whole Slide Imaging (WSI), análisis morfométrico a 40x y trazabilidad quirúrgica total.
            </p>

            <!-- CONMUTADOR INTERACTIVO HERO (El Gancho Principal) -->
            <div class="mt-12 max-w-3xl mx-auto">
                <div class="inline-flex p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-2xl mb-8">
                    <button type="button" id="tabHeroPaciente" onclick="switchHeroTab('paciente')" class="px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2.5 bg-gradient-to-r from-cyanCobalt to-blue-600 text-white shadow-lg">
                        <i class="fa-solid fa-heart-pulse"></i> Soy Paciente / Familiar
                    </button>
                    <button type="button" id="tabHeroMedico" onclick="switchHeroTab('medico')" class="px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2.5 text-slate-400 hover:text-white">
                        <i class="fa-solid fa-user-doctor"></i> Soy Médico / Clínica
                    </button>
                </div>

                <!-- Contenido A: Paciente -->
                <div id="contentHeroPaciente" class="glass-panel rounded-2xl p-8 sm:p-10 text-left transition-all duration-300">
                    <div class="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div class="space-y-4 max-w-xl">
                            <span class="px-3 py-1 rounded-md text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Atención Empática & Humanizada</span>
                            <h3 class="text-2xl font-bold text-white">Sabemos que detrás de cada biopsia hay una familia esperando respuestas.</h3>
                            <p class="text-sm text-slate-300 leading-relaxed">
                                No te preocupes por el trámite. Recogemos tu muestra en formol en cualquier distrito de Lima o te orientamos paso a paso para enviarla seguro desde provincia. Recibe tu informe oficial firmado digitalmente en 48 a 72 horas.
                            </p>
                            <div class="grid grid-cols-3 gap-3 pt-2 text-xs">
                                <div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                    <strong class="block text-cyan-400 mb-1">1. Muestra en Formol</strong>
                                    Conserva el frasco cerrado al 10%.
                                </div>
                                <div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                    <strong class="block text-emerald-400 mb-1">2. Envío o Recojo</strong>
                                    Delivery o recepción directa.
                                </div>
                                <div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                    <strong class="block text-purple-400 mb-1">3. Informe en 48-72h</strong>
                                    PDF interactivo con fotos HD.
                                </div>
                            </div>
                        </div>
                        <div class="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
                            <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20tengo%20una%20orden%20de%20biopsia%20y%20deseo%20saber%20el%20costo%20y%20recojo" target="_blank" class="px-6 py-4 rounded-xl text-center font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-transform hover:scale-105">
                                <i class="fa-brands fa-whatsapp text-xl"></i> Cotizar Biopsia Inmediata
                            </a>
                            <span class="text-[11px] text-slate-400 text-center"><i class="fa-solid fa-truck-medical text-cyan-400"></i> Servicio de recojo a domicilio en Lima</span>
                        </div>
                    </div>
                </div>

                <!-- Contenido B: Médico / Clínica (Inicialmente oculto) -->
                <div id="contentHeroMedico" class="glass-panel rounded-2xl p-8 sm:p-10 text-left hidden transition-all duration-300">
                    <div class="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div class="space-y-4 max-w-xl">
                            <span class="px-3 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Alianza B2B para Clínicas y Cirujanos</span>
                            <h3 class="text-2xl font-bold text-white">Despacho Digital Automatizado, Trazabilidad QR y Visor 360°.</h3>
                            <p class="text-sm text-slate-300 leading-relaxed">
                                Integramos a su centro quirúrgico o clínica privada con nuestra plataforma web soberana: descarga de informes en PDF con fotos microscópicas de calidad atlas, estudio fotográfico de márgenes quirúrgicos y correlación clínico-patológica directa con el Dr. Castillo.
                            </p>
                            <div class="grid grid-cols-3 gap-3 pt-2 text-xs">
                                <div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                    <strong class="block text-indigo-400 mb-1">App Quirúrgica</strong>
                                    Notificación al celular al firmarse.
                                </div>
                                <div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                    <strong class="block text-cyan-400 mb-1">Visor 360°</strong>
                                    Tinta china y márgenes oncológicos.
                                </div>
                                <div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                                    <strong class="block text-goldBanner mb-1">Convenios 48h</strong>
                                    Tarifario preferencial B2B.
                                </div>
                            </div>
                        </div>
                        <div class="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
                            <a href="https://wa.me/51986396733?text=Estimado%20Dr.%20Castillo,%20represento%20a%20una%20cl%C3%ADnica/cirujano%20y%20deseamos%20convenio%20de%20biopsias" target="_blank" class="px-6 py-4 rounded-xl text-center font-extrabold bg-gradient-to-r from-cyanCobalt to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl shadow-cyanCobalt/20 flex items-center justify-center gap-3 transition-transform hover:scale-105">
                                <i class="fa-solid fa-file-contract text-lg"></i> Solicitar Convenio Clínico
                            </a>
                            <span class="text-[11px] text-slate-400 text-center"><i class="fa-solid fa-shield-halved text-emerald-400"></i> Secreto médico & Blindaje legal total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 3. CATÁLOGO DE SERVICIOS Y TARIFARIO TRANSPARENTE -->
    <section id="tarifario" class="py-20 bg-slate-900/60 border-y border-slate-800/60 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
                <span class="text-xs font-bold text-cyan-400 tracking-wider uppercase">Cartera de Servicios & Tarifario Transparente</span>
                <h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-2">Diagnóstico Histopatológico Especializado</h2>
                <p class="text-slate-400 mt-4 text-sm sm:text-base">Sin costos ocultos. Informes detallados con microfotografías a color, clasificación CAP/AJCC y conducta sugerida.</p>
            </div>

            <!-- Grid de Servicios -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <!-- Tarjeta 1: Biopsias Menores -->
                <div class="glass-panel glass-panel-glow rounded-2xl p-6 flex flex-col justify-between" data-aos="fade-up" data-aos-delay="100">
                    <div>
                        <div class="w-12 h-12 rounded-xl bg-cyanCobalt/20 text-cyan-400 flex items-center justify-center text-xl mb-4">
                            <i class="fa-solid fa-vial"></i>
                        </div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Entrega en 48 Horas</span>
                        <h3 class="text-lg font-bold text-white mt-1">Biopsias Quirúrgicas Menores & Endoscópicas</h3>
                        <p class="text-xs text-slate-300 mt-3 leading-relaxed">
                            Muestras gástricas, pólipos colónicos, biopsias de piel (punch/afeitado), cuello uterino, endometrio y mucosa oral.
                        </p>
                        <ul class="mt-4 space-y-2 text-xs text-slate-400">
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Coloración H&E de alta resolución</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Giemsa para H. pylori incluido</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Entrega física y digital en PDF</li>
                        </ul>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-800">
                        <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20consultar%20sobre%20Biopsias%20Quir%C3%BArgicas%20Menores%20y%20Endosc%C3%B3picas" target="_blank" class="w-full py-2.5 rounded-lg text-center text-xs font-bold bg-slate-800 hover:bg-cyanCobalt text-white transition-colors flex items-center justify-center gap-2">
                            <i class="fa-brands fa-whatsapp"></i> Consultar Tarifa
                        </a>
                    </div>
                </div>

                <!-- Tarjeta 2: Biopsias de Próstata Tru-Cut -->
                <div class="glass-panel glass-panel-glow rounded-2xl p-6 flex flex-col justify-between border-cyanCobalt/40 relative" data-aos="fade-up" data-aos-delay="200">
                    <div class="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-cyanCobalt to-blue-600 text-white shadow-md">
                        ESPECIALIDAD UROPATOLOGÍA
                    </div>
                    <div>
                        <div class="w-12 h-12 rounded-xl bg-purpleHemato/20 text-purple-400 flex items-center justify-center text-xl mb-4">
                            <i class="fa-solid fa-dna"></i>
                        </div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-purple-400">Entrega en 72 Horas</span>
                        <h3 class="text-lg font-bold text-white mt-1">Biopsia de Próstata Tru-Cut (Hasta 12 Cilindros)</h3>
                        <p class="text-xs text-slate-300 mt-3 leading-relaxed">
                            Mapeo individualizado cilindro por cilindro con Score Gleason y Grupos Grado ISUP/OMS para guiar el tratamiento urológico.
                        </p>
                        <ul class="mt-4 space-y-2 text-xs text-slate-400">
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> % de tumor por cilindro y extensión</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Invasión perineural e infiltración</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Panel PIN-4 ante duda diagnóstica</li>
                        </ul>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-800">
                        <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20consultar%20sobre%20Biopsia%20de%20Pr%C3%B3stata%20por%20Punci%C3%B3n%20Tru-Cut" target="_blank" class="w-full py-2.5 rounded-lg text-center text-xs font-bold bg-cyanCobalt hover:bg-sky-500 text-white transition-colors flex items-center justify-center gap-2">
                            <i class="fa-brands fa-whatsapp"></i> Consultar Tarifa
                        </a>
                    </div>
                </div>

                <!-- Tarjeta 3: Piezas Oncológicas Complejas -->
                <div class="glass-panel glass-panel-glow rounded-2xl p-6 flex flex-col justify-between" data-aos="fade-up" data-aos-delay="300">
                    <div>
                        <div class="w-12 h-12 rounded-xl bg-goldBanner/20 text-amber-400 flex items-center justify-center text-xl mb-4">
                            <i class="fa-solid fa-scissors"></i>
                        </div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Entrega 48h a 5 Días</span>
                        <h3 class="text-lg font-bold text-white mt-1">Piezas Oncológicas Complejas & Tinta China</h3>
                        <p class="text-xs text-slate-300 mt-3 leading-relaxed">
                            Prostatectomías radicales, morcelados HoLEP/ThuLEP, mastectomías, gastrectomías, colectomías y disecciones ganglionares.
                        </p>
                        <ul class="mt-4 space-y-2 text-xs text-slate-400">
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Marcaje con tinta china de márgenes</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Registro fotográfico macroscópico 360°</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Estadificación TNM 8va edición</li>
                        </ul>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-800">
                        <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20consultar%20sobre%20Piezas%20Quir%C3%BArgicas%20Complejas%20y%20Oncol%C3%B3gicas" target="_blank" class="w-full py-2.5 rounded-lg text-center text-xs font-bold bg-slate-800 hover:bg-cyanCobalt text-white transition-colors flex items-center justify-center gap-2">
                            <i class="fa-brands fa-whatsapp"></i> Consultar Tarifa
                        </a>
                    </div>
                </div>

                <!-- Tarjeta 4: Citología e Inmunohistoquímica -->
                <div class="glass-panel glass-panel-glow rounded-2xl p-6 flex flex-col justify-between" data-aos="fade-up" data-aos-delay="400">
                    <div>
                        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4">
                            <i class="fa-solid fa-microscope"></i>
                        </div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Entrega 48h a 72h</span>
                        <h3 class="text-lg font-bold text-white mt-1">Citología Especializada & Inmunohistoquímica</h3>
                        <p class="text-xs text-slate-300 mt-3 leading-relaxed">
                            Papanicolaou cervicovaginal (Bethesda), citología en base líquida, BAAF de tiroides y mama, y paneles de anticuerpos IHQ.
                        </p>
                        <ul class="mt-4 space-y-2 text-xs text-slate-400">
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> BAAF tiroideo (Sistema Bethesda)</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Paneles: PIN-4, Ki-67, RE/RP, HER2</li>
                            <li><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Diagnóstico diferencial de certeza</li>
                        </ul>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-800">
                        <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20consultar%20sobre%20Citolog%C3%ADa%20Especializada%20e%20Inmunohistoqu%C3%ADmica" target="_blank" class="w-full py-2.5 rounded-lg text-center text-xs font-bold bg-slate-800 hover:bg-cyanCobalt text-white transition-colors flex items-center justify-center gap-2">
                            <i class="fa-brands fa-whatsapp"></i> Consultar Tarifa
                        </a>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- 4. NUESTRA INFRAESTRUCTURA TECNOLÓGICA (ÚNICA EN EL PERÚ) -->
    <section id="tecnologia" class="py-24 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
                <span class="text-xs font-bold text-purpleHemato tracking-wider uppercase">Infraestructura Tecnológica 100% Propia</span>
                <h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-2">Los 4 Ejes Tecnológicos de JC PATH LAB</h2>
                <p class="text-slate-400 mt-4 text-sm sm:text-base">Garantizamos soberanía médica de datos, cero dependencia de nubes extranjeras y telepatología interactiva instantánea.</p>
            </div>

            <!-- EJE 01: APLICATIVO MÓVIL QUIRÚRGICO & VISOR 360° -->
            <div class="glass-panel rounded-3xl p-8 sm:p-12 mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-aos="fade-right">
                <!-- Mockup Smartphone en CSS puro -->
                <div class="lg:col-span-5 flex justify-center">
                    <div class="w-[280px] h-[520px] bg-slate-950 rounded-[40px] border-[5px] border-slate-800 shadow-2xl p-3 flex flex-col relative overflow-hidden">
                        <!-- Parlante frontal del móvil -->
                        <div class="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>
                        <!-- Pantalla interactiva simulada -->
                        <div class="flex-1 bg-slate-900 rounded-[28px] p-3 text-white flex flex-col justify-between border border-slate-800">
                            <div>
                                <div class="flex justify-between items-center text-[10px] text-slate-400 mb-2">
                                    <span>JC PATH MOBILE</span>
                                    <span class="text-emerald-400"><i class="fa-solid fa-wifi"></i> 5G</span>
                                </div>
                                <div class="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 mb-2">
                                    <div class="flex justify-between text-[11px] font-bold">
                                        <span class="text-cyan-400">CASO 26Q-387</span>
                                        <span class="text-emerald-400">FIRMA LISTA</span>
                                    </div>
                                    <p class="text-[10px] text-slate-300 mt-1">Biopsia de Próstata Tru-Cut</p>
                                    <span class="text-[9px] text-slate-400 block mt-0.5">ISUP 2 (Gleason 3+4)</span>
                                </div>
                                <div class="p-2 rounded-lg bg-cyanCobalt/20 border border-cyanCobalt/40 mb-2 flex items-center gap-2">
                                    <i class="fa-solid fa-file-pdf text-red-400 text-base"></i>
                                    <div class="text-[10px]">
                                        <strong class="block text-white">Informe_26Q_387.pdf</strong>
                                        <span class="text-slate-400 text-[8px]">Firmado Dr. Joseph Castillo</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <button class="w-full py-2 rounded-lg bg-cyanCobalt text-white text-[11px] font-bold shadow-md flex items-center justify-center gap-1.5">
                                    <i class="fa-solid fa-eye"></i> Visor Macroscópico 360°
                                </button>
                                <button class="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center gap-1.5">
                                    <i class="fa-brands fa-whatsapp"></i> Compartir con Paciente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Explicación -->
                <div class="lg:col-span-7 space-y-4">
                    <span class="text-xs font-bold text-cyan-400 uppercase tracking-wide">EJE 01 &bull; Gestión Móvil</span>
                    <h3 class="text-2xl sm:text-3xl font-extrabold text-white">Despacho Digital Automatizado & Visor Macroscópico 360°</h3>
                    <p class="text-sm text-slate-300 leading-relaxed">
                        Apenas el Dr. Joseph Castillo firma digitalmente el informe histopatológico, nuestro sincronizador despacha el informe en alta resolución directamente al teléfono del cirujano y de la clínica colaboradora.
                    </p>
                    <div class="grid grid-cols-2 gap-4 pt-2">
                        <div class="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                            <strong class="text-xs text-white block mb-1"><i class="fa-solid fa-rotate text-cyan-400 mr-1.5"></i> Visor 360° de Muestras</strong>
                            <p class="text-[11px] text-slate-400">Inspección de márgenes teñidos con tinta china con rotación tridimensional interactiva.</p>
                        </div>
                        <div class="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                            <strong class="text-xs text-white block mb-1"><i class="fa-solid fa-qrcode text-emerald-400 mr-1.5"></i> Trazabilidad Estricta QR</strong>
                            <p class="text-[11px] text-slate-400">Cada casete plástico y lámina portaobjetos lleva código unívoco que previene cualquier extravío.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- EJE 02 & EJE 03: SERVIDOR WSI Y MORFOMETRÍA IA (CON SIMULADOR INTERACTIVO) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                
                <!-- EJE 02: Servidor WSI Propio -->
                <div class="glass-panel rounded-3xl p-8 flex flex-col justify-between" data-aos="fade-up">
                    <div class="space-y-4">
                        <span class="text-xs font-bold text-emerald-400 uppercase tracking-wide">EJE 02 &bull; Soberanía de Datos</span>
                        <h3 class="text-2xl font-bold text-white">Servidor Físico Local WSI (Whole Slide Imaging)</h3>
                        <p class="text-sm text-slate-300 leading-relaxed">
                            No alquilamos nubes de terceros para alojar láminas de pacientes. Contamos con nuestro clúster de servidores físicos dedicados que garantizan el secreto médico profesional absoluto y permiten navegar láminas histológicas gigapíxel de 2x a 40x con fluidez en tiempo real.
                        </p>
                        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                            <div class="flex justify-between text-emerald-400">
                                <span>[HARDWARE SOBERANO]:</span>
                                <span>DEDICADO 100% OFFLINE</span>
                            </div>
                            <div>&gt; Almacenamiento Láminas WSI: RAID Físico en Laboratorio</div>
                            <div>&gt; Resolución: 0.25 micras/píxel (Escaneo 40x Real)</div>
                            <div>&gt; Protocolo de Acceso: HTTPS TLS 1.3 con Cifrado Local</div>
                        </div>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span><i class="fa-solid fa-lock text-emerald-400 mr-1"></i> Ley General de Salud N° 26842</span>
                        <span class="text-emerald-400 font-bold">100% Soberano</span>
                    </div>
                </div>

                <!-- EJE 03: SIMULADOR INTERACTIVO DE MORFOMETRÍA IA A 40x -->
                <div class="glass-panel rounded-3xl p-8 flex flex-col justify-between border-purpleHemato/40 relative" data-aos="fade-up" data-aos-delay="100">
                    <div>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-bold text-purpleHemato uppercase tracking-wide">EJE 03 &bull; Inteligencia Artificial</span>
                            <!-- Botón Conmutador del Simulador IA -->
                            <button type="button" id="btnToggleMorphoIA" onclick="toggleMorphometrySimulator()" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purpleHemato to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white shadow-lg shadow-purpleHemato/30 flex items-center gap-2 transition-all">
                                <i class="fa-solid fa-brain"></i> <span id="labelToggleMorpho">Activar Filtro Algorítmico IA</span>
                            </button>
                        </div>
                        <h3 class="text-2xl font-bold text-white">Morfometría Computacional IA a 40x</h3>
                        <p class="text-xs text-slate-300 mt-2">
                            Simula en vivo la asistencia algorítmica sobre un adenocarcinoma gástrico / próstata. Haz clic en el botón superior para alternar la visión convencional vs la detección de atipia nuclear:
                        </p>

                        <!-- Visor Simulado de Morfometría -->
                        <div class="mt-4 relative h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                            <!-- Imagen de Fondo (Lámina H&E) -->
                            <img id="imgMorphoDisplay" src="assets/fotos_hd/morfologia_he_original.jpg" onerror="this.src='morfologia_he_original.jpg'" alt="Histología H&E 40x" class="w-full h-full object-cover transition-all duration-500">
                            
                            <!-- Capa de Detección Algorítmica (Oculta al inicio) -->
                            <div id="layerMorphoOverlay" class="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] p-4 flex flex-col justify-between hidden transition-all">
                                <div class="flex justify-between items-start">
                                    <span class="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-purple-600/90 text-white border border-purple-400/50 shadow-md">
                                        <i class="fa-solid fa-sparkles"></i> FILTRO MORFOMÉTRICO ACTIVO
                                    </span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                        97.3% CERTEZA
                                    </span>
                                </div>
                                
                                <!-- Badges Flotantes de Análisis -->
                                <div class="grid grid-cols-2 gap-2 text-[10px] font-semibold text-white">
                                    <div class="bg-slate-900/90 p-2 rounded-lg border border-purple-500/40">
                                        <span class="text-slate-400 block text-[8px]">CUANTIFICACIÓN</span>
                                        <strong>519 células indexadas</strong>
                                    </div>
                                    <div class="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/40">
                                        <span class="text-slate-400 block text-[8px]">RELACIÓN N/C</span>
                                        <strong class="text-cyan-300">39% (Aumento atípico)</strong>
                                    </div>
                                    <div class="bg-slate-900/90 p-2 rounded-lg border border-amber-500/40">
                                        <span class="text-slate-400 block text-[8px]">ACTIVIDAD MITÓTICA</span>
                                        <strong class="text-amber-300">0-1 / 10 HPF</strong>
                                    </div>
                                    <div class="bg-slate-900/90 p-2 rounded-lg border border-emerald-500/40">
                                        <span class="text-slate-400 block text-[8px]">PLEOMORFISMO CAP</span>
                                        <strong class="text-emerald-300">Grado 1 (Focal)</strong>
                                    </div>
                                </div>
                            </div>

                            <!-- Etiqueta de Modo Actual -->
                            <div id="badgeModeStatus" class="absolute bottom-2 left-2 px-2.5 py-1 rounded text-[10px] font-bold bg-slate-900/85 text-slate-300 border border-slate-700">
                                Modo: Microscopía Óptica Convencional 40x
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- EJE 04: COPILOTO DIAGNÓSTICO & LOGÍSTICA NACIONAL 72H -->
            <div id="cobertura" class="glass-panel rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" data-aos="fade-up">
                <div class="lg:col-span-7 space-y-4">
                    <span class="text-xs font-bold text-goldBanner uppercase tracking-wide">EJE 04 &bull; Red Nacional de Biopsias</span>
                    <h3 class="text-2xl sm:text-3xl font-extrabold text-white">Cobertura Nacional: Arequipa, Trujillo, Jaén y Todo el Perú</h3>
                    <p class="text-sm text-slate-300 leading-relaxed">
                        Nuestra logística aprovecha el tiempo de tránsito biológico: el traslado de 48 a 72 horas vía Olva Courier se integra perfectamente con el tiempo estándar de fijación en formol neutro al 10%. La muestra llega a Lima fijada de manera óptima para el tallado y procesamiento inmediato.
                    </p>
                    <div class="flex flex-wrap gap-2 pt-2 text-xs">
                        <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"><i class="fa-solid fa-location-dot text-cyanCobalt mr-1"></i> Arequipa</span>
                        <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"><i class="fa-solid fa-location-dot text-cyanCobalt mr-1"></i> Trujillo</span>
                        <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"><i class="fa-solid fa-location-dot text-cyanCobalt mr-1"></i> Cusco</span>
                        <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"><i class="fa-solid fa-location-dot text-cyanCobalt mr-1"></i> Jaén / Cajamarca</span>
                        <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"><i class="fa-solid fa-location-dot text-cyanCobalt mr-1"></i> Chiclayo / Piura</span>
                        <span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"><i class="fa-solid fa-location-dot text-cyanCobalt mr-1"></i> Huancayo / Iquitos</span>
                    </div>
                </div>
                <div class="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 text-center space-y-3">
                    <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
                        <i class="fa-solid fa-box-tissue"></i>
                    </div>
                    <h4 class="text-base font-bold text-white">¿Cómo enviar tu muestra desde provincia?</h4>
                    <p class="text-xs text-slate-400">Te enviamos el instructivo formal en PDF y la guía de remisión prepagada para dejarla en la agencia Olva Courier de tu ciudad.</p>
                    <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20enviar%20una%20biopsia%20desde%20provincia" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105">
                        <i class="fa-brands fa-whatsapp"></i> Solicitar Envío desde Provincia
                    </a>
                </div>
            </div>

        </div>
    </section>

    <!-- 5. SECCIÓN DE AUTORIDAD MÉDICA (E-E-A-T GOOGLE) -->
    <section class="py-20 bg-slate-950/80 border-t border-slate-800 relative">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="glass-panel rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-center">
                <div class="w-36 h-36 rounded-2xl overflow-hidden border-2 border-cyanCobalt shadow-xl flex-shrink-0">
                    <img src="assets/fotos_hd/ofcinaprincipal1.jpg" onerror="this.src='OFCINAPRINCIPAL1.jpg'" alt="Dr. Joseph C. Castillo Cuenca" class="w-full h-full object-cover">
                </div>
                <div class="space-y-3 text-center md:text-left flex-1">
                    <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Dirección Médica Científica</span>
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Dr. Joseph C. Castillo Cuenca</h2>
                    <div class="flex flex-wrap gap-3 justify-center md:justify-start text-xs font-mono text-slate-300">
                        <span class="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">CMP: <strong>56435</strong></span>
                        <span class="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">RNE: <strong>029291</strong> (Anatomía Patológica)</span>
                    </div>
                    <p class="text-sm text-slate-300 leading-relaxed pt-1">
                        Especialista con dedicación exclusiva al diagnóstico anatomopatológico, uropatología oncológica y patología digital. Líder en la implementación de la primera estación Whole Slide Imaging y copiloto de morfometría algorítmica en Lima Norte.
                    </p>
                    <div class="pt-3">
                        <a href="https://wa.me/51986396733?text=Estimado%20Dr.%20Castillo,%20deseo%20una%20interconsulta%20m%C3%A9dica%20especializada" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-cyanCobalt hover:bg-sky-500 text-white shadow-md transition-all">
                            <i class="fa-solid fa-user-doctor"></i> Iniciar Interconsulta Directa con el Patólogo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 6. PREGUNTAS FRECUENTES (ACORDEÓN INTERACTIVO PARA SEO GOOGLE) -->
    <section class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12" data-aos="fade-up">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Centro de Respuestas</span>
            <h2 class="text-3xl font-extrabold text-white mt-1">Preguntas Frecuentes</h2>
        </div>

        <div class="space-y-4">
            
            <details class="glass-panel rounded-xl p-5 group cursor-pointer" open>
                <summary class="font-bold text-white flex justify-between items-center text-sm sm:text-base">
                    <span>¿Cuánto tiempo demora el resultado de una biopsia en JC PATH LAB?</span>
                    <i class="fa-solid fa-chevron-down text-cyan-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <p class="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
                    Las biopsias quirúrgicas menores (endoscópicas gástricas, piel, cuello uterino) se entregan en <strong>48 a 72 horas</strong>. Las piezas quirúrgicas oncológicas complejas o biopsias de próstata Tru-Cut requieren entre <strong>72 horas y 5 días hábiles</strong> debido a los tiempos indispensables de fijación en formol y descalcificación si aplica.
                </p>
            </details>

            <details class="glass-panel rounded-xl p-5 group cursor-pointer">
                <summary class="font-bold text-white flex justify-between items-center text-sm sm:text-base">
                    <span>¿Cómo debo conservar y enviar una muestra de biopsia desde Lima o provincias?</span>
                    <i class="fa-solid fa-chevron-down text-cyan-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <p class="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
                    La muestra debe sumergirse inmediatamente después de la toma en un frasco con <strong>formol neutro al 10%</strong> (volumen de formol de 5 a 10 veces el tamaño de la muestra) herméticamente sellado. No se debe usar alcohol ni agua. Coordinamos el recojo motorizado en Lima o el envío por Olva Courier en provincia.
                </p>
            </details>

            <details class="glass-panel rounded-xl p-5 group cursor-pointer">
                <summary class="font-bold text-white flex justify-between items-center text-sm sm:text-base">
                    <span>¿Qué ventaja tiene la Patología Digital WSI y la Morfometría IA para mi diagnóstico?</span>
                    <i class="fa-solid fa-chevron-down text-cyan-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <p class="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
                    La digitalización Whole Slide Imaging a 40x permite escanear la lámina histológica completa a nivel submicrónico. La inteligencia artificial actúa como un copiloto de doble lectura: cuantifica mitosis, evalúa pleomorfismo nuclear CAP y reduce drásticamente cualquier probabilidad de error o falso negativo.
                </p>
            </details>

            <details class="glass-panel rounded-xl p-5 group cursor-pointer">
                <summary class="font-bold text-white flex justify-between items-center text-sm sm:text-base">
                    <span>¿Realizan convenios con clínicas, policlínicos y cirujanos particulares?</span>
                    <i class="fa-solid fa-chevron-down text-cyan-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <p class="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
                    Sí. Ofrecemos tarifas B2B preferenciales, suministro de frascos con formol rotulados, logística de recojo programado y acceso exclusivo al <strong>Portal Clínico Web</strong> para descargar informes con fotos microscópicas y macroscópicas 360° en tiempo real.
                </p>
            </details>

        </div>
    </section>

    <!-- 7. FOOTER CORPORATIVO -->
    <footer class="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <span class="text-lg font-extrabold text-white">JC PATH LAB</span>
                </div>
                <p class="text-[11px] leading-relaxed">
                    Especialistas en Anatomía Patológica, Uropatología y Diagnóstico Digital WSI. Máxima certeza diagnóstica en Lima y todo el Perú.
                </p>
                <div class="text-[11px] text-slate-500">
                    CMP 56435 &bull; RNE 029291
                </div>
            </div>

            <div>
                <strong class="text-white block mb-3 text-sm">Servicios Principales</strong>
                <ul class="space-y-2 text-[11px]">
                    <li><a href="#tarifario" class="hover:text-cyan-400">Biopsias Endoscópicas y Gástricas</a></li>
                    <li><a href="#tarifario" class="hover:text-cyan-400">Biopsias de Próstata Tru-Cut</a></li>
                    <li><a href="#tarifario" class="hover:text-cyan-400">Piezas Quirúrgicas Oncológicas</a></li>
                    <li><a href="#tarifario" class="hover:text-cyan-400">Inmunohistoquímica y Citología PAP</a></li>
                </ul>
            </div>

            <div>
                <strong class="text-white block mb-3 text-sm">Sede Central Lima</strong>
                <p class="text-[11px] leading-relaxed">
                    <i class="fa-solid fa-map-location-dot text-cyan-400 mr-1.5"></i> Jardines de Chillón Mz M2 Lote 13<br>
                    Lima Norte (Puente Piedra / Los Olivos), Lima - Perú.
                </p>
                <p class="mt-2 text-[11px]">
                    <i class="fa-solid fa-phone text-emerald-400 mr-1.5"></i> +51 986 396 733<br>
                    <i class="fa-solid fa-envelope text-purple-400 mr-1.5"></i> jclab59@gmail.com
                </p>
            </div>

            <div>
                <strong class="text-white block mb-3 text-sm">Horario de Atención</strong>
                <p class="text-[11px] leading-relaxed">
                    Lunes a Sábado: 07:30 a.m. - 08:00 p.m.<br>
                    Recepción de Biopsias de Emergencia 24/7 previa coordinación telefónica.
                </p>
                <div class="mt-4">
                    <a href="https://maps.google.com/?q=Jardines+de+Chillon+Mz+M2+Lote+13+Lima" target="_blank" class="inline-flex items-center gap-1.5 text-cyan-400 hover:underline text-[11px]">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver en Google Maps
                    </a>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500">
            &copy; 2026 JC PATH LAB. Todos los derechos reservados. Dirigido por el Dr. Joseph C. Castillo Cuenca (CMP 56435 / RNE 029291).
        </div>
    </footer>

    <!-- 8. WIDGET DE CHATBOT FLOTANTE CONEXIÓN N8N / LOCAL CON RESPALDO WHATSAPP -->
    <div id="chatbotContainer" class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        <!-- Ventana de Chat (Inicialmente oculta) -->
        <div id="chatWindow" class="w-[340px] sm:w-[380px] h-[480px] bg-slate-950/95 border border-cyanCobalt/40 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden mb-3 hidden transition-all duration-300">
            <!-- Header Chat -->
            <div class="p-3.5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-cyanCobalt/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                        <i class="fa-solid fa-robot text-xs"></i>
                    </div>
                    <div>
                        <strong class="text-xs text-white block">Cortana IA &bull; Concierge Patológico</strong>
                        <span class="text-[9px] text-emerald-400 flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-emerald"></span> Online 24/7 &bull; JC PATH LAB
                        </span>
                    </div>
                </div>
                <button type="button" onclick="toggleChatWindow()" class="text-slate-400 hover:text-white p-1 text-sm">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Mensajes -->
            <div id="chatMessages" class="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200">
                    <strong class="text-cyan-400 block mb-1">¡Hola! Soy Cortana, asistente IA de JC PATH LAB.</strong>
                    ¿En qué puedo ayudarte hoy con tu biopsia o estudio? Elige una opción rápida o escribe tu consulta:
                </div>
                
                <!-- Botones Rápidos -->
                <div class="space-y-1.5 pt-1">
                    <button onclick="enviarMensajeRapido('Deseo cotizar una biopsia')" class="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors flex items-center justify-between">
                        <span><i class="fa-solid fa-tag text-cyan-400 mr-1.5"></i> Cotizar una biopsia</span>
                        <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </button>
                    <button onclick="enviarMensajeRapido('¿Cómo debo entregar mi muestra en formol?')" class="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors flex items-center justify-between">
                        <span><i class="fa-solid fa-vial text-emerald-400 mr-1.5"></i> ¿Cómo entrego mi muestra?</span>
                        <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </button>
                    <button onclick="enviarMensajeRapido('Soy médico o clínica y deseo convenio')" class="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors flex items-center justify-between">
                        <span><i class="fa-solid fa-user-doctor text-purple-400 mr-1.5"></i> Soy médico / clínica</span>
                        <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </button>
                </div>
            </div>

            <!-- Input Box -->
            <form id="chatForm" onsubmit="handleChatSubmit(event)" class="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input type="text" id="chatInputText" placeholder="Escribe tu consulta médica..." class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyanCobalt">
                <button type="submit" class="w-9 h-9 rounded-lg bg-cyanCobalt hover:bg-sky-500 text-white flex items-center justify-center flex-shrink-0 transition-colors">
                    <i class="fa-solid fa-paper-plane text-xs"></i>
                </button>
            </form>
        </div>

        <!-- Botones Flotantes (WhatsApp + Asistente IA) -->
        <div class="flex items-center gap-3">
            <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20hacer%20una%20consulta" target="_blank" class="w-13 h-13 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center text-xl transition-transform hover:scale-110" title="Escribir al WhatsApp Oficial">
                <i class="fa-brands fa-whatsapp"></i>
            </a>

            <button type="button" onclick="toggleChatWindow()" class="px-4 py-3 rounded-full bg-gradient-to-r from-cyanCobalt to-purpleHemato hover:from-cyan-500 hover:to-purple-600 text-white shadow-xl shadow-cyanCobalt/30 flex items-center gap-2.5 text-xs font-bold transition-transform hover:scale-105" title="Abrir Asistente IA Patológico">
                <i class="fa-solid fa-brain text-sm"></i>
                <span class="hidden sm:inline">Asistente IA 24/7</span>
            </button>
        </div>
    </div>

    <!-- Scripts Interactivos & AOS -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        AOS.init({ duration: 750, once: true });

        // 1. Selector Interactivo Hero (Paciente vs Médico)
        function switchHeroTab(tab) {
            const btnP = document.getElementById('tabHeroPaciente');
            const btnM = document.getElementById('tabHeroMedico');
            const contP = document.getElementById('contentHeroPaciente');
            const contM = document.getElementById('contentHeroMedico');

            if (tab === 'paciente') {
                btnP.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2.5 bg-gradient-to-r from-cyanCobalt to-blue-600 text-white shadow-lg';
                btnM.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2.5 text-slate-400 hover:text-white';
                contP.classList.remove('hidden');
                contM.classList.add('hidden');
            } else {
                btnM.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2.5 bg-gradient-to-r from-cyanCobalt to-blue-600 text-white shadow-lg';
                btnP.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2.5 text-slate-400 hover:text-white';
                contM.classList.remove('hidden');
                contP.classList.add('hidden');
            }
        }

        // 2. Simulador Interactivo de Morfometría IA a 40x
        let morphoActive = false;
        function toggleMorphometrySimulator() {
            morphoActive = !morphoActive;
            const overlay = document.getElementById('layerMorphoOverlay');
            const label = document.getElementById('labelToggleMorpho');
            const badge = document.getElementById('badgeModeStatus');
            const btn = document.getElementById('btnToggleMorphoIA');
            const img = document.getElementById('imgMorphoDisplay');

            if (morphoActive) {
                overlay.classList.remove('hidden');
                label.innerText = 'Desactivar Filtro IA';
                badge.innerText = 'Modo: Morfometría Computacional IA a 40x (Red Convolucional)';
                badge.className = 'absolute bottom-2 left-2 px-2.5 py-1 rounded text-[10px] font-bold bg-purple-900/90 text-purple-200 border border-purple-500/50 shadow-md';
                btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2';
                img.src = 'assets/fotos_hd/morfologia_ia_pleomorfismo.jpg';
            } else {
                overlay.classList.add('hidden');
                label.innerText = 'Activar Filtro Algorítmico IA';
                badge.innerText = 'Modo: Microscopía Óptica Convencional 40x';
                badge.className = 'absolute bottom-2 left-2 px-2.5 py-1 rounded text-[10px] font-bold bg-slate-900/85 text-slate-300 border border-slate-700';
                btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purpleHemato to-indigo-600 text-white shadow-lg shadow-purpleHemato/30 flex items-center gap-2';
                img.src = 'assets/fotos_hd/morfologia_he_original.jpg';
            }
        }

        // 3. Chatbot Flotante (Conexión n8n / Local + Respaldo WhatsApp)
        const N8N_WEBHOOK_URL = "http://127.0.0.1:8766/api/chat_consultas"; // Fallback local o N8N Cloud
        let sessionIdGenerado = "web_" + Math.random().toString(36).substring(2, 10);

        function toggleChatWindow() {
            const win = document.getElementById('chatWindow');
            win.classList.toggle('hidden');
        }

        function appendMessage(sender, text, isError = false) {
            const container = document.getElementById('chatMessages');
            const div = document.createElement('div');
            if (sender === 'user') {
                div.className = 'bg-cyanCobalt/20 border border-cyanCobalt/40 p-2.5 rounded-xl text-white ml-6 text-right';
                div.innerHTML = text;
            } else {
                div.className = isError 
                    ? 'bg-rose-950/60 border border-rose-800/60 p-2.5 rounded-xl text-slate-200 mr-6'
                    : 'bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-200 mr-6';
                div.innerHTML = text;
            }
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }

        async function enviarMensajeN8N(mensajeUsuario) {
            appendMessage('user', mensajeUsuario);
            
            // Indicador de escribiendo
            const idWait = 'wait_' + Date.now();
            appendMessage('bot', '<span id="' + idWait + '" class="italic text-slate-400"><i class="fa-solid fa-spinner fa-spin"></i> Cortana está escribiendo...</span>');
            
            try {
                const res = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ chatInput: mensajeUsuario, sessionId: sessionIdGenerado })
                });
                
                const waitEl = document.getElementById(idWait);
                if (waitEl && waitEl.parentNode) waitEl.parentNode.remove();

                if (res.ok) {
                    const data = await res.json();
                    const respuesta = data.output || data.text || data.message || "Tu consulta ha sido registrada.";
                    appendMessage('bot', respuesta);
                } else {
                    throw new Error('Servidor IA no disponible');
                }
            } catch (err) {
                const waitEl = document.getElementById(idWait);
                if (waitEl && waitEl.parentNode) waitEl.parentNode.remove();
                
                // Respaldo WhatsApp Inteligente
                appendMessage('bot', `
                    <strong>Atención Médica Directa:</strong><br>
                    Para cotizaciones inmediatas o consultas sobre tu orden médica, contáctate directamente con el Dr. Joseph Castillo en WhatsApp:
                    <a href="https://wa.me/51986396733?text=${encodeURIComponent('Hola Dr. Castillo, tengo la siguiente consulta: ' + mensajeUsuario)}" target="_blank" class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] block text-center">
                        <i class="fa-brands fa-whatsapp"></i> Continuar por WhatsApp (+51 986 396 733)
                    </a>
                `, false);
            }
        }

        function handleChatSubmit(e) {
            e.preventDefault();
            const input = document.getElementById('chatInputText');
            const val = input.value.trim();
            if (!val) return;
            input.value = '';
            enviarMensajeN8N(val);
        }

        function enviarMensajeRapido(msg) {
            enviarMensajeN8N(msg);
        }

        function abrirModalPortalMedicos() {
            window.location.href = 'solicitud.html';
        }
    </script>
</body>
</html>
"""

# Write to repository
target_index = Path(r"C:\Users\HP\Desktop\repositorio 2\jcastilloc2920.github.io\index.html")
with open(target_index, 'w', encoding='utf-8') as f:
    f.write(html_content)
print(f"SUCCESS: index.html generated at {target_index} ({len(html_content)} bytes)")

# Write robots.txt
robots_content = """User-agent: *
Allow: /
Sitemap: https://jcastilloc2920.github.io/sitemap.xml
"""
robots_file = target_index.parent / "robots.txt"
with open(robots_file, 'w', encoding='utf-8') as f:
    f.write(robots_content)
print("SUCCESS: robots.txt written")

# Write sitemap.xml
sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://jcastilloc2920.github.io/</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
   </url>
   <url>
      <loc>https://jcastilloc2920.github.io/solicitud.html</loc>
      <lastmod>2026-11-06</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>
</urlset>
"""
sitemap_file = target_index.parent / "sitemap.xml"
with open(sitemap_file, 'w', encoding='utf-8') as f:
    f.write(sitemap_content)
print("SUCCESS: sitemap.xml written")
