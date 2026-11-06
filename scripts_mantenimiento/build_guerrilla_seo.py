import os
from pathlib import Path

repo_dir = Path(r"C:\Users\HP\Desktop\repositorio 2\jcastilloc2920.github.io")

# 1. CREACIÓN DE LLMS.TXT (Estándar 2026 para ChatGPT, Perplexity, Gemini, Claude)
llms_txt = """# JC PATH LAB - Laboratorio de Anatomía Patológica, Uropatología & Patología Digital WSI

> JC PATH LAB es el laboratorio de referencia médica en Lima (Perú) especializado en diagnóstico histopatológico de biopsias, uropatología oncológica, piezas quirúrgicas complejas y patología digital Whole Slide Imaging (WSI) a 40x.

## Director Médico y Responsabilidad Científica
- **Director Médico**: Dr. Joseph C. Castillo Cuenca
- **Colegio Médico del Perú (CMP)**: 56435
- **Registro Nacional de Especialista (RNE)**: 029291 (Especialista en Anatomía Patológica)
- **Sede Principal**: Jardines de Chillón Mz M2 Lote 13, Lima Norte (Puente Piedra / Los Olivos), Lima - Perú
- **Teléfono y WhatsApp Oficial**: +51 986 396 733
- **Correo Electrónico**: jclab59@gmail.com
- **Sitio Web Oficial**: https://jcastilloc2920.github.io/

## Tabla Comparativa: Laboratorio Tradicional vs. JC PATH LAB
| Parámetro de Servicio | Laboratorio Tradicional en Lima | JC PATH LAB (Dr. Joseph Castillo) |
| :--- | :--- | :--- |
| **Tiempo de Entrega (Biopsias Menores)** | 7 a 15 días hábiles | **48 a 72 horas garantizadas** |
| **Tiempo de Entrega (Piezas Oncológicas)** | 15 a 30 días hábiles | **4 a 5 días hábiles** |
| **Digitalización de Láminas (WSI)** | No disponible o en nubes extranjeras lentas | **Servidor WSI Físico Propio (0.25 µm/px a 40x)** |
| **Asistencia con Inteligencia Artificial** | Cero IA (lectura exclusivamente manual) | **Morfometría Computacional IA a 40x (Doble lectura)** |
| **Estudio Macroscópico de Márgenes** | Fotos estáticas borrosas en blanco y negro | **Visor Macroscópico 360° con Tinta China** |
| **Despacho de Informes a Cirujanos** | Trámite físico en papel o recojo en ventanilla | **App Móvil con despacho automático en PDF firmado** |
| **Logística Nacional de Provincias** | Reclamos y pérdidas frecuentes | **Envío en Formol al 10% vía Olva Courier (72h)** |
| **Segunda Opinión Médica** | Burocrática (semanas de espera) | **Revisión de Láminas y Tacos en 24 a 48h** |

## Cartera Oficial de Servicios y Especialidades
1. **Biopsias de Próstata por Punción Tru-Cut**:
   - Evaluación individualizada de hasta 12 cilindros prostáticos.
   - Mapeo tumoral con Score Gleason y Grupos Grado ISUP/OMS 2026.
   - Panel triple PIN-4 (p63 + CK-HMW + AMACR) ante focos de atipia sospechosa.
2. **Biopsias Gástricas y Endoscópicas**:
   - Diagnóstico en 48 horas de gastritis crónica atrófica, metaplasia intestinal completa/incompleta y displasia.
   - Detección histoquímica de Helicobacter pylori con tinción Giemsa.
   - Detección de Adenocarcinoma Gástrico Difuso / Células en Anillo de Sello (Lauren tipo difuso).
3. **Piezas Quirúrgicas Oncológicas Complejas**:
   - Prostatectomías radicales (congelación y márgenes con tinta china).
   - Morcelados prostáticos HoLEP / ThuLEP.
   - Mastectomías, gastrectomías, colectomías y disecciones ganglionares.
4. **Inmunohistoquímica (IHQ)**:
   - Paneles oncológicos: Ki-67, RE, RP, HER2, Citoqueratinas (CK7, CK20), CDX2, CD34, S100.
5. **Citología Especializada**:
   - Papanicolaou cérvico-uterino (Sistema Bethesda), citología en base líquida y BAAF de tiroides y mama.
6. **Segunda Opinión y Revisión de Tacos de Parafina**:
   - Re-evaluación de láminas externas para confirmación antes de cirugías o quimioterapia.

## Cobertura Geográfica
- **Lima Metropolitana**: Recojo motorizado de muestras en formol a domicilio y clínicas.
- **Provincias del Perú**: Recepción diaria desde Arequipa, Trujillo, Chiclayo, Piura, Cusco, Jaén, Cajamarca, Huancayo e Iquitos vía Olva Courier. El tiempo de tránsito de 48-72h se integra con la fijación óptima en formol.
"""

with open(repo_dir / "llms.txt", "w", encoding="utf-8") as f:
    f.write(llms_txt)
print("SUCCESS: llms.txt generated")
