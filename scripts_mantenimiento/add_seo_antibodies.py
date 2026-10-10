
import os

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
    "CITOKERATIN 5/6": "Ayuda a identificar carcinomas escamosos y a distinguir mesoteliomas de otros tipos de cáncer de pulmón.",
    "CITOKERATIN 7": "Marcador de origen glandular; se encuentra comúnmente en tumores de mama, pulmón y ovario.",
    "CITOKERATIN 20": "Marcador de origen muy específico para el tracto digestivo (colon) y células de Merkel en la piel.",
    "DESMINA": "Detecta células musculares; esencial para diagnosticar tumores del músculo esquelético y liso.",
    "DOG-1": "Marcador altamente específico para tumores GIST; muy útil cuando el CD117 es negativo.",
    "HER2 (C-ERBB2/CB11)": "Evalúa la agresividad celular; crucial para guiar tratamientos biológicos en cáncer de mama y estómago.",
    "HMB45": "Altamente específico para el diagnóstico de Melanoma (cáncer agresivo de piel).",
    "KI67": "El marcador de proliferación más usado; indica qué porcentaje de células se están dividiendo.",
    "P16": "Marcador de infección por VPH; esencial en el diagnóstico de cáncer de cuello uterino y garganta.",
    "P40": "El marcador más fiable para diagnosticar el carcinoma de células escamosas del pulmón.",
    "P53": "Detecta la mutación más común en el cáncer, indicando agresividad y guiando el tratamiento.",
    "PSA": "Antígeno Prostático Específico; la prueba de referencia para el tejido de la próstata.",
    "S-100": "Marcador versátil usado para detectar melanomas, tumores nerviosos y de glándulas salivares.",
    "SINAPTOFISINA": "Identifica vesículas nerviosas; esencial para diagnosticar tumores neuroendocrinos.",
    "SOX-10": "Marcador moderno y muy sensible para diagnosticar melanomas y tumores de nervios.",
    "TTF-1": "Diferencia con precisión el cáncer originado en el pulmón de metástasis de otros órganos.",
    "VIMENTINA": "Marcador general de los tejidos conectivos; ayuda a clasificar sarcomas."
}

base_path = "c:\\Users\\josehp\\Desktop\\paginas web\\jcastilloc2920.github.io-index.html\\"
target_file = base_path + "index.html"

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Build hidden SEO section
seo_html = '<div style="display:none;" aria-hidden="true">\n'
for name, desc in descriptions.items():
    seo_html += f'  <p>Uso clínico de {name}: {desc}</p>\n'
seo_html += '</div>\n'

# Insert after the table (around line 630)
search_str = '</table>\n                            </div>'
if search_str in content:
    content = content.replace(search_str, search_str + "\n                            " + seo_html)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully added hidden SEO descriptions to index.html")
