
import os
import json

descriptions = {
    "ACTINA MUSCULO LISO": "Detecta tumores derivados del músculo liso, como miomas uterinos y ciertos sarcomas.",
    "ACTINA (HIF35)": "Marcador general de células musculares; ayuda a identificar tumores del tejido blando.",
    "ADIPOFILINA": "Identifica la presencia de lípidos; útil en tumores sebáceos y de glándulas sudoríparas.",
    "AFP (Alfa FetoProteina)": "Marcador clave en tumores de hígado y tumores de células germinales del testículo u ovario.",
    "ALK(CD246)": "Identifica cambios genéticos en ciertos tipos de cáncer de pulmón, linfomas y tumores infantiles.",
    "AMACR (Racemase)": "Altamente sensible para diagnosticar cáncer de próstata y ciertos tipos de cáncer de riñón.",
    "AMILOIDE A": "Detecta depósitos de proteína amiloide en tejidos, asociados a enfermedades inflamatorias crónicas.",
    "ANDROGENO": "Evalúa la respuesta a hormonas masculinas en tumores de próstata y ciertos tumores de mama.",
    "A. CARBONICA IX (CA IX)": "Marcador específico para el cáncer de riñón (carcinoma de células claras).",
    "ARGINASE 1": "El marcador más específico para confirmar que un tumor se originó directamente en el hígado.",
    "ATRX": "Utilizado para clasificar tumores cerebrales (gliomas) y predecir su comportamiento clínico.",
    "BCL-2": "Proteína que impide la muerte celular; su exceso ayuda a diagnosticar diversos tipos de linfomas.",
    "BCL-6": "Identifica linfocitos de los centros germinales; esencial para clasificar linfomas agresivos.",
    "BER-EP4": "Ayuda a distinguir el carcinoma basocelular de la piel de otros tumores similares.",
    "BETACATENIN": "Marcador de señalización celular útil en tumores de colon, de mama y tumores 'desmoides'.",
    "C-MYC": "Gen que regula el crecimiento celular; su presencia indica alta agresividad en linfomas.",
    "CALCITONINA": "Marcador hormonal fundamental para el diagnóstico del cáncer medular de tiroides.",
    "CALDESMON": "Marcador muy específico para identificar células de músculo liso en tumores del útero y tejidos blandos.",
    "CALPONINA": "Identifica células de soporte en las glándulas; vital para diferenciar lesiones benignas de malignas en mama.",
    "CALRETININA": "Principal marcador para diagnosticar mesotelioma y ciertos tumores de los ovarios.",
    "CD1a": "Identifica células de Langerhans; crucial para diagnosticar la histiocitosis X.",
    "CD3": "El marcador universal para identificar Linfocitos T (células clave del sistema de defensa).",
    "CD4": "Subtipo de linfocitos T; importante en la evaluación de enfermedades inmunes y linfomas.",
    "CD5": "Ayuda a clasificar leucemias crónicas y linfomas de células pequeñas.",
    "CD7": "Uno de los marcadores más tempranos de células de defensa T; útil en leucemias agudas.",
    "CD8": "Identifica linfocitos T 'asesinos'; mide la fuerza del sistema inmune contra el cáncer.",
    "CD10": "Marcador de células germinales de los ganglios; útil en el estudio de linfomas y cáncer de riñón.",
    "CD15": "Característico de las células de Reed-Sternberg en el Linfoma de Hodgkin clásico.",
    "CD19": "Marcador fundamental para identificar todas las etapas de desarrollo de los Linfocitos B.",
    "CD20": "El marcador más importante para el diagnóstico y guía de tratamiento de Linfomas de células B.",
    "CD21": "Identifica las redes que sostienen a los linfocitos en los ganglios; útil en linfomas foliculares.",
    "CD23": "Ayuda a diferenciar la leucemia linfática crónica de otros tipos de linfomas.",
    "CD30": "Clave para el diagnóstico del Linfoma de Hodgkin y linfomas anaplásicos de células grandes.",
    "CD31": "Marcador de células endoteliales (vasos sanguíneos); identifica tumores vasculares como angiosarcomas.",
    "CD34": "Identifica vasos sanguíneos y células madre; esencial en la clasificación de leucemias y sarcomas.",
    "CD43": "Ayuda a detectar anormalidades en linfocitos B y T; útil en la clasificación de linfomas.",
    "CD45": "Antígeno Común Leucocitario; confirma que el tumor se origina en el sistema de la sangre.",
    "CD56": "Marcador para células de defensa NK y tumores neuroendocrinos (como el cáncer microcítico de pulmón).",
    "CD61": "Identifica células precursoras de las plaquetas; útil en el diagnóstico de leucemias específicas.",
    "CD68": "Marca macrófagos (células de limpieza); ayuda a identificar inflamación y ciertos tumores.",
    "CD79a": "Marcador muy específico y temprano para Linfocitos B; complementa al CD20.",
    "CD99": "Marcador distintivo del Sarcoma de Ewing y tumores neuroectodérmicos infantiles.",
    "CD117": "Esencial para diagnosticar tumores GIST del sistema digestivo y ciertos tipos de leucemia.",
    "CD138": "Principal marcador de células plasmáticas; fundamental para diagnosticar el Mieloma Múltiple.",
    "CDK4": "Evalúa anormalidades genéticas en tumores de grasa para distinguir lipomas de liposarcomas.",
    "CDX2": "Indica con alta precisión que un tumor proviene del tracto digestivo, especialmente del colon.",
    "CA-125": "Utilizado para monitorear y diagnosticar tumores de ovario y de la cavidad abdominal.",
    "CA 19.9": "Marcador de apoyo para el diagnóstico de cáncer de páncreas y vías biliares.",
    "CEA": "Antígeno Carcinoembrionario; marcador general para cáncer de colon, páncreas y otros.",
    "CYCLIN D1": "Proteína reguladora; su detección es clave para diagnosticar el Linfoma de Células del Manto.",
    "CITOKERATIN CAMS 2": "Cóctel de queratinas que confirma el origen epitelial (carcinoma) de un tumor.",
    "CITOKERATIN OSCAR": "Queratina de amplio espectro utilizada para detectar células cancerosas muy poco diferenciadas.",
    "CITOKERATIN 5/6": "Ayuda a identificar carcinomas escamosos y a distinguir mesoteliomas de otros tipos de cáncer de pulmón.",
    "CITOKERATIN 7": "Marcador de origen glandular; se encuentra comúnmente en tumores de mama, pulmón y ovario.",
    "CITOKERATIN 8": "Queratina presente en la mayoría de los carcinomas glandulares (adenocarcinomas).",
    "CITOKERATIN 14": "Marcador de células basales y escamosas; útil en el estudio de cáncer de mama y piel.",
    "CITOKERATIN 17": "Expresada en carcinomas de cuello uterino y páncreas; ayuda a definir subtipos tumorales.",
    "CITOKERATIN 18": "Marcador de células epiteliales simples; común en adenocarcinomas corporales.",
    "CITOKERATIN 19": "Marcador de células de conductos; muy útil en el diagnóstico de cáncer papilar de tiroides.",
    "CITOKERATIN 20": "Marcador de origen muy específico para el tracto digestivo (colon) y células de Merkel en la piel.",
    "CITOMEGALOVIRUS": "Detecta la presencia del virus CMV en tejidos de pacientes con defensas bajas.",
    "COLAGENO IV": "Marca la membrana que sostiene las células; evalúa si un tumor ha comenzado a invadir.",
    "CK HWM (34BE12)": "Queratina de alto peso molecular; ayuda a identificar glándulas prostáticas normales vs cancerosas.",
    "CROMOGRANINA A": "El marcador más común para detectar tumores neuroendocrinos en cualquier parte del cuerpo.",
    "DESMINA": "Detecta células musculares; esencial para diagnosticar tumores del músculo esquelético y liso.",
    "DOG-1": "Marcador altamente específico para tumores GIST; muy útil cuando el CD117 es negativo.",
    "EBV/LMP-1": "Detecta el Virus de Epstein-Barr en linfomas y otros carcinomas asociados al virus.",
    "E-CADHERINA": "Proteína de unión celular; clave para distinguir cáncer de mama ductal de lobulillar.",
    "EMA": "Antígeno de Membrana Epitelial; marca una amplia variedad de tumores de glándulas y meninges.",
    "ERG": "Marcador moderno para diagnosticar cáncer de próstata y tumores de vasos sanguíneos.",
    "ESTROGENO": "Evalúa receptores de estrógeno en cáncer de mama; determina la necesidad de terapia hormonal.",
    "FACTOR VIII": "Marcador de coagulación que ayuda a identificar el origen vascular de un tumor.",
    "FACTOR XIIIa": "Identifica células del tejido conectivo; útil en el diagnóstico de dermatofibromas en la piel.",
    "FASCIN A": "Marcador que indica movilidad celular; asociado a mayor agresividad en ciertos tumores.",
    "FOXP3": "Identifica células T reguladoras; evalúa cómo el tumor suprime el sistema inmune.",
    "FLY-1": "Marcador genético fundamental para confirmar el Sarcoma de Ewing.",
    "GCDFP-15": "Muy específico para confirmar que un tumor proviene de las glándulas mamarias.",
    "GCOFP-15": "Muy específico para confirmar que un tumor proviene de las glándulas mamarias.", # Alias para typo en el sitio
    "GATA 3": "Marcador excelente para identificar el origen mamario o del tracto urinario (vejiga).",
    "GFAP": "Identifica células gliales del cerebro; esencial para diagnosticar astrocitomas y otros gliomas.",
    "GLUT-1": "Marcador de transporte de azúcar; ayuda a identificar hemangiomas y áreas sin oxígeno en el tumor.",
    "GLIPICAN 3": "Marcador específico del carcinoma hepatocelular (cáncer primario de hígado).",
    "GLYCOFORINA": "Marca glóbulos rojos; esencial en el diagnóstico de leucemias que afectan la serie roja.",
    "GRANZYME B": "Identifica células de defensa activas; útil en la clasificación de linfomas agresivos.",
    "HCG (Beta)": "Detecta la hormona del embarazo en tumores de células germinales o de la placenta.",
    "HER2 (C-ERBB2/CB11)": "Evalúa la agresividad celular; crucial para guiar tratamientos biológicos en cáncer de mama y estómago.",
    "HEP-PAR1": "Marcador que confirma el origen de las células en el tejido del hígado.",
    "HHV-8": "Indica infección por el Herpesvirus 8, causante del Sarcoma de Kaposi.",
    "HMB45": "Altamente específico para el diagnóstico de Melanoma (cáncer agresivo de piel).",
    "IDH-1": "Mutación genética clave para pronosticador y clasificar tumores cerebrales (gliomas).",
    "IgG": "Inmunoglobulina G; ayuda a clasificar desórdenes de las células plasmáticas.",
    "IgG-4": "Asociado a enfermedades autoinmunes específicas que afectan múltiples órganos.",
    "Ig M": "Identifica estadios tempranos de respuesta inmune en enfermedades de la sangre.",
    "INI-1": "Su pérdida es característica de tumores infantiles muy agresivos (tumores rabdoides).",
    "IMP-3": "Marcador de mal pronóstico que ayuda a detectar cáncer de páncreas y pulmón.",
    "INHIBINA": "Fundamental para diagnosticar tumores de los cordones sexuales en ovario y testículo.",
    "KAPPA": "Cadena ligera de anticuerpos; se usa con LAMBDA para detectar cáncer de células plasmáticas.",
    "KI67": "El marcador de proliferación más usado; indica qué porcentaje de células se están dividiendo.",
    "LAMBDA": "Cadena ligera de anticuerpos; se usa con KAPPA para identificar clones malignos en la sangre.",
    "LEF-1": "Excelente marcador para diagnosticar la leucemia linfática crónica.",
    "LISOZIMA": "Identifica células de linaje mieloide en leucemias y ciertos procesos inflamatorios.",
    "MAMAGLOBINA": "Marcador muy sensible para detectar células originadas en la mama.",
    "MELAN A/MART-1": "Indispensable para el diagnóstico de melanoma y otros tumores de piel pigmentados.",
    "MIELOPEROXIDASA (MPO)": "Marcador clásico para identificar leucemias mieloides agudas.",
    "MIOGEINA": "Confirma el origen muscular esquelético en tumores infantiles (rabdomiosarcomas).",
    "MITF": "Proteína clave para el desarrollo de pigmento; útil en el estudio del melanoma.",
    "MLH1": "Proteína de reparación del ADN; su ausencia indica inestabilidad genética en cáncer de colon.",
    "MSH2": "Junto con MLH1, ayuda a detectar el Síndrome de Lynch (cáncer de colon hereditario).",
    "MSH6": "Proteína de reparación del sistema MMR; esencial en oncología genómica.",
    "MUC 2": "Proteína de moco que ayuda a clasificar tumores del intestino y páncreas.",
    "MUC 5AC": "Identifica moco de tipo gástrico; útil en tumores de estómago y páncreas.",
    "MUC 6": "Marcador de glándulas profundas del estómago; ayuda a clasificar tumores mucinosos.",
    "MUM-1": "Identifica estadios finales de maduración linfoide; clave en linfomas de células grandes.",
    "MYO D1": "Altamente específico para identificar tumores que intentan formar músculo (rabdomiosarcomas).",
    "MMP9": "Enzima asociada a la invasión y metástasis tumoral.",
    "NAPSIN A": "El marcador más específico para confirmar el adenocarcinoma de pulmón.",
    "NEUROFILAMENTO": "Marca extensiones de células nerviosas; diagnóstico de tumores del sistema nervioso.",
    "NGFR": "Receptor de crecimiento nervioso; ayuda a mapear la invasión en los nervios por el cáncer.",
    "OLIG 2": "Marcador fundamental para identificar tumores cerebrales de linaje oligodendroglial.",
    "P16": "Marcador de infección por VPH; esencial en el diagnóstico de cáncer de cuello uterino y garganta.",
    "P40": "El marcador más fiable para diagnosticar el carcinoma de células escamosas del pulmón.",
    "P53": "Detecta la mutación más común en el cáncer, indicando agresividad y guiando el tratamiento.",
    "PS3": "Detecta la mutación más común en el cáncer, indicando agresividad y guiando el tratamiento.", # Alias
    "P57": "Diferencia embarazos molares (mola hidatidiforme) completos de parciales.",
    "PANQUERATINA": "Proteína general selectiva para detectar cualquier tipo de carcinoma (cáncer epitelial).",
    "PAX-5": "Marcador principal y muy fiable para identificar el linaje de Linfocitos B.",
    "PAX-8": "Fundamental para identificar tumores de riñón, tiroides y el tracto genital femenino.",
    "PODOPLANINA / D2-40": "Identifica vasos linfáticos; crucial para ver si el cáncer se ha diseminado por la linfa.",
    "PODOPLANIND2-40": "Identifica vasos linfáticos; crucial para ver si el cáncer se ha diseminado por la linfa.", # Alias
    "PD-1/CD279": "Evalúa el estado del sistema inmune y es guía para terapias de inmunoterapia.",
    "PD-L1 (22c3)": "Predice si el paciente responderá a tratamientos modernos de inmunoterapia.",
    "PLAP": "Fosfatasa alcalina placentaria; marcador de tumores de células germinales (seminomas).",
    "PMS2": "Proteína de reparación del ADN vinculada al Síndrome de Lynch.",
    "PSA": "Antígeno Prostático Específico; la prueba de referencia para el tejido de la próstata.",
    "P-TEN": "Gen supresor que cuando se pierde, indica mayor agresividad en el cáncer.",
    "PROGESTERONA": "Evalúa la sensibilidad hormonal en el cáncer de mama para definir el tratamiento.",
    "VPH": "Detecta directamente la presencia del Virus del Papiloma Humano en los cortes de tejido.",
    "PVH": "Detecta directamente la presencia del Virus del Papiloma Humano en los cortes de tejido.", # Alias
    "S-100": "Marcador versátil usado para detectar melanomas, tumores nerviosos y de glándulas salivares.",
    "SATB-2": "Marcador muy específico para confirmar el origen colorrectal de un tumor.",
    "SALL 4": "Identifica células en estado primitivo; clave en tumores de células germinales fetales.",
    "SINAPTOFISINA": "Identifica vesículas nerviosas; esencial para diagnosticar tumores neuroendocrinos.",
    "SOX-10": "Marcador moderno y muy sensible para diagnosticar melanomas y tumores de nervios.",
    "SMAD4/DPC4": "Su pérdida en el tejido es un fuerte indicador de cáncer de páncreas.",
    "STAT 6": "Marcador diagnóstico definitivo para el Tumor Fibroso Solitario.",
    "T. PALLIDUM": "Prueba de inmunohistoquímica para detectar la bacteria de la Sífilis en biopsias.",
    "TDT": "Identifica linfocitos jóvenes; esencial para el diagnóstico de leucemias linfoblásticas.",
    "TLE-1": "Marcador principal para diagnosticar el Sarcoma Sinovial.",
    "TIA-1": "Identifica gránulos en células T 'asesinas'; útil en linfomas de células T.",
    "TIROGLOBULINA": "Confirma con certeza absoluta que un tumor proviene de la glándula tiroides.",
    "TIROSINASA": "Enzima clave en la producción de pigmento; utilizada para confirmar melanomas.",
    "TTF-1": "Diferencia con precisión el cáncer originado en el pulmón de metástasis de otros órganos.",
    "VIMENTINA": "Marcador general de los tejidos conectivos; ayuda a clasificar sarcomas.",
    "WT-1": "Utilizado en el diagnóstico de tumores abdominales infantiles y tumores de ovario."
}

def update_index():
    base_path = "c:\\Users\\josehp\\Desktop\\paginas web\\jcastilloc2920.github.io-index.html\\"
    target_file = base_path + "index.html"
    
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS if needed (already added, but let's ensure it's current)
    # 2. Update Modal HTML (already added)
    # 3. Update JS (replace the old one)
    
    js_data = json.dumps(descriptions, ensure_ascii=False)
    new_js = f"""
    <script>
        const antibodyData = {js_data};
        
        document.addEventListener('DOMContentLoaded', function() {{
            const modal = document.getElementById('antibodyModal');
            const span = document.getElementsByClassName('ab-close')[0];
            const title = document.getElementById('modalTitle');
            const info = document.getElementById('modalInfo');

            // Find all antibody cells and add the interactive class
            const cells = document.querySelectorAll('td');
            cells.forEach(cell => {{
                const text = cell.innerText.trim();
                // Check if the text matches an antibody name
                if (antibodyData[text]) {{
                    cell.classList.add('antibody-item');
                    cell.title = "Haz clic para ver su uso clínico";
                    
                    cell.addEventListener('click', function() {{
                        title.innerText = text;
                        info.innerText = antibodyData[text];
                        modal.classList.add('show');
                        modal.style.display = 'flex';
                    }});
                }}
            }});

            // Close modal events
            if (span) {{
                span.onclick = function() {{ 
                    modal.classList.remove('show');
                    setTimeout(() => modal.style.display = 'none', 300);
                }}
            }}
            window.onclick = function(event) {{
                if (event.target == modal) {{
                    modal.classList.remove('show');
                    setTimeout(() => modal.style.display = 'none', 300);
                }}
            }}
        }});
    </script>
    """
    
    # Locate the old script and replace it
    import re
    p = re.compile(r'<script>\s+const antibodyData =.*?</script>', re.DOTALL)
    if p.search(content):
        content = p.sub(new_js, content)
    else:
        # Fallback if first run failed to add it or it's missing
        if "</body>" in content:
            content = content.replace("</body>", new_js + "\n</body>")

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Successfully updated antibody table logic in index.html")

if __name__ == "__main__":
    update_index()
