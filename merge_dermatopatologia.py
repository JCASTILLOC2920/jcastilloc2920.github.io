
import os

def merge_files():
    base_path = "c:\\Users\\josehp\\Desktop\\paginas web\\jcastilloc2920.github.io-index.html\\"
    target_file = base_path + "dermatopatologia.html"
    content_file = base_path + "requena_html_final.html"

    # HTML Header and Top Section
    header = """<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dermatopatología en Lima | Biopsias de Piel y Diagnóstico de Melanoma - JC PATH LAB</title>
    <meta name="description" content="Servicio de Dermatopatología en Lima y San Isidro. Diagnóstico experto de biopsias de piel, melanoma, lunares y enfermedades inflamatorias. Resultados precisos por patólogos especialistas.">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="chatbot.css">
    <link rel="stylesheet" href="expandable-buttons.css">
</head>

<body>
    <!-- Sección de Encabezado -->
    <header class="header">
        <div class="header-container">
            <!-- Logo -->
            <div class="logo-container">
                <img src="logo-jcpathlab.png" alt="JC PATH LAB Logo" class="logo">
            </div>

            <!-- Menú de Navegación -->
            <nav>
                <ul class="nav-menu">
                    <li class="nav-item"><a href="index.html#inicio" class="nav-link">Inicio</a></li>
                    <li class="nav-item"><a href="index.html#servicios" class="nav-link">Servicios</a></li>
                    <li class="nav-item"><a href="index.html#quienes-somos" class="nav-link">Quiénes Somos</a></li>
                    <li class="nav-item"><a href="index.html#classroom" class="nav-link active">Classroom</a></li>
                    <li class="nav-item"><a href="index.html#protocolos" class="nav-link">Nuestros Protocolos</a></li>
                    <li class="nav-item"><a href="index.html#contacto" class="nav-link">Contacto</a></li>
                </ul>
            </nav>

            <!-- Menú de Hamburguesa -->
            <button class="hamburger" aria-label="Menú de navegación">
                <span class="line"></span>
                <span class="line"></span>
                <span class="line"></span>
            </button>
        </div>
    </header>

    <!-- Sección de Contenido Principal -->
    <section class="topic-detail-section">
        <div class="topic-content">
            <h1 class="section-title">Dermatopatología: Diagnóstico Experto en Lima</h1>

            <div class="intro-text" style="margin-bottom: 30px; text-align: justify; font-size: 1.1em; line-height: 1.6;">
                <p>En <strong>JC PATH LAB</strong>, brindamos servicios especializados de <strong>Dermatopatología en Lima</strong> (San Isidro y alrededores). Nuestro laboratorio cuenta con tecnología avanzada y patólogos expertos para el análisis de <strong>biopsias de piel</strong>, permitiendo un diagnóstico preciso de condiciones complejas.</p>
                <p>Nos especializamos en la diferenciación de lesiones pigmentadas (<strong>lunares vs. melanoma</strong>) y enfermedades inflamatorias, utilizando criterios histopatológicos rigurosos basados en los patrones del Dr. Luis Requena. A continuación, presentamos nuestra guía de referencia de patrones diagnósticos:</p>
            </div>
"""

    # Footer Section
    footer = """
            <div style="margin-top: 40px;">
                <a href="index.html" class="back-button">Volver</a>
                <a href="partes-blandas.html" class="back-button">Partes Blandas</a>
                <a href="neuropatologia.html" class="back-button">Neuropatología</a>
                <a href="gastrointestinal.html" class="back-button">Gastrointestinal</a>
                <a href="genitourinario.html" class="back-button">Genitourinario</a>
                <a href="citopatologia.html" class="back-button">Citopatología</a>
            </div>
        </div>
    </section>

    <script src="main.js"></script>
    <script src="chatbot.js"></script>
    <script src="expandable-buttons.js"></script>
</body>

</html>
"""

    try:
        with open(content_file, 'r', encoding='utf-8') as f:
            new_content = f.read()
            
        final_html = header + new_content + footer
        
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(final_html)
            
        print("Successfully merged and updated dermatopatologia.html")
        
    except Exception as e:
        print(f"Error merging files: {e}")

if __name__ == "__main__":
    merge_files()
