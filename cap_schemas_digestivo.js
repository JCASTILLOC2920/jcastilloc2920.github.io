// cap_schemas_digestivo.js
// Esquemas Sinópticos CAP y AJCC 8va Edición para Patología Digestiva y Gastrointestinal
// Generado con traducción al español médico, ayuda explicativa clínica (helpText) y compilador.

export const capSchemasDigestivo = {
  "colorectal_resection": {
    "id": "colorectal_resection",
    "title": "Protocolo Sinóptico: Colon y Recto (Resección) - CAP v4.4.0.1 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "right_hemicolectomy",
                "label": "Hemicolectomía derecha"
              },
              {
                "value": "transverse_colectomy",
                "label": "Colectomía transversa"
              },
              {
                "value": "left_hemicolectomy",
                "label": "Hemicolectomía izquierda"
              },
              {
                "value": "sigmoidectomy",
                "label": "Sigmoidectomía"
              },
              {
                "value": "lar",
                "label": "Resección anterior baja (LAR)"
              },
              {
                "value": "total_colectomy",
                "label": "Colectomía total abdominal"
              },
              {
                "value": "apr",
                "label": "Resección abdominoperineal (APR)"
              },
              {
                "value": "proctocolectomy",
                "label": "Proctocolectomía total"
              },
              {
                "value": "cecectomy",
                "label": "Resección cecal (cequectomía)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "Indica el procedimiento resectivo. En neoplasias rectales (LAR y APR), la técnica de escisión total del mesorrecto (TME) es el determinante oncológico estándar para el control locorregional y la prevención de recidivas."
          },
          {
            "id": "mesorectal_envelope",
            "label": "Evaluación Macroscópica del Mesorrecto (Obligatorio en cáncer de recto)",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (neoplasia de colon no rectal)"
              },
              {
                "value": "complete",
                "label": "Completo (Grado Quirke 1: mesorrecto intacto, liso, sin defectos >5 mm, sin exponer muscular propia)"
              },
              {
                "value": "near_complete",
                "label": "Casi completo (Grado Quirke 2: defectos moderados >5 mm, sin visualizar muscular propia)"
              },
              {
                "value": "incomplete",
                "label": "Incompleto (Grado Quirke 3: defectos profundos con exposición de muscular propia, margen circunferencial muy irregular)"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado (explicar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota A del CAP): Criterios de Quirke. Evalúa la calidad técnica de la escisión del mesorrecto fresca no peritonealizada. Un mesorrecto incompleto triplica el riesgo de recurrencia local (del 8% al 25%). Se califica según el área de peor calidad observada."
          }
        ]
      },
      {
        "name": "CARACTERÍSTICAS DEL TUMOR",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico del Tumor (seleccionar todos los que apliquen)",
            "type": "checkbox",
            "options": [
              {
                "value": "cecum",
                "label": "Ciego"
              },
              {
                "value": "ileocecal_valve",
                "label": "Válvula ileocecal"
              },
              {
                "value": "ascending_colon",
                "label": "Colon ascendente"
              },
              {
                "value": "hepatic_flexure",
                "label": "Ángulo hepático"
              },
              {
                "value": "transverse_colon",
                "label": "Colon transverso"
              },
              {
                "value": "splenic_flexure",
                "label": "Ángulo esplénico"
              },
              {
                "value": "descending_colon",
                "label": "Colon descendente"
              },
              {
                "value": "sigmoid_colon",
                "label": "Colon sigmoides"
              },
              {
                "value": "rectosigmoid",
                "label": "Unión rectosigmoidea"
              },
              {
                "value": "rectum",
                "label": "Recto"
              },
              {
                "value": "colon_nos",
                "label": "Colon, no especificado"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota B del CAP): Define el drenaje linfático regional y las asociaciones genómicas. El colon derecho tiene mayor frecuencia de inestabilidad de microsatélites (MSI-H), mutaciones BRAF V600E y vía serrada. El colon izquierdo presenta mayor inestabilidad cromosómica (CIN) y mutaciones KRAS/TP53."
          },
          {
            "id": "rectal_tumor_location",
            "label": "Localización del Tumor Rectal respecto a la Reflexión Peritoneal Anterior",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (tumor de colon no rectal)"
              },
              {
                "value": "above",
                "label": "Completamente por encima de la reflexión peritoneal anterior"
              },
              {
                "value": "below",
                "label": "Completamente por debajo de la reflexión peritoneal anterior"
              },
              {
                "value": "straddles",
                "label": "Cruza o cabalga (straddles) la reflexión peritoneal anterior"
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar (explicar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota B del CAP): La reflexión peritoneal separa el recto peritoneal (con serosa anterior y lateral) del recto subperitoneal (desprovisto de serosa, rodeado de mesorrecto circunferencial con alto riesgo de invasión del margen CRM)."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico (Clasificación OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "adenocarcinoma",
                "label": "Adenocarcinoma, no especificado de otra manera (convencional)"
              },
              {
                "value": "mucinous",
                "label": "Adenocarcinoma mucinoso (>50% de mucina extracelular)"
              },
              {
                "value": "signet_ring",
                "label": "Adenocarcinoma de células en anillo de sello (>50% de células en anillo de sello)"
              },
              {
                "value": "poorly_cohesive",
                "label": "Carcinoma pobremente cohesivo (incluye anillo de sello y otras variantes)"
              },
              {
                "value": "medullary",
                "label": "Carcinoma medular (sólido, abundante infiltrado linfoide, pushing border)"
              },
              {
                "value": "serrated",
                "label": "Adenocarcinoma serrado"
              },
              {
                "value": "micropapillary",
                "label": "Adenocarcinoma micropapilar (alta invasión linfática y ganglionar)"
              },
              {
                "value": "adenoma_like",
                "label": "Adenocarcinoma tipo adenoma-like (bien diferenciado)"
              },
              {
                "value": "adenosquamous",
                "label": "Carcinoma adenoescamoso"
              },
              {
                "value": "undifferentiated",
                "label": "Carcinoma indiferenciado, NOS"
              },
              {
                "value": "sarcomatoid",
                "label": "Carcinoma con componente sarcomatoide"
              },
              {
                "value": "large_cell_ne",
                "label": "Carcinoma neuroendocrino de células grandes"
              },
              {
                "value": "small_cell_ne",
                "label": "Carcinoma neuroendocrino de células pequeñas"
              },
              {
                "value": "minen",
                "label": "Neoplasia mixta neuroendocrina - no neuroendocrina (MiNEN) (especificar componentes)",
                "hasInput": true
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota C del CAP): El adenocarcinoma mucinoso requiere >=50% del volumen tumoral formado por lagos de mucina. El carcinoma medular se compone de sábanas sincitiales con marcada atipia, abundantes linfocitos intratumorales y borde expansivo no infiltrativo; se asocia típicamente a dMMR/MSI-H o Síndrome de Lynch y confiere buen pronóstico inicial. MiNEN exige al menos 30% de cada componente."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico (Diferenciación Glandular)",
            "type": "radio",
            "options": [
              {
                "value": "low_grade",
                "label": "Bajo grado (Bien a moderadamente diferenciado: >= 50% de formación glandular)"
              },
              {
                "value": "high_grade",
                "label": "Alto grado (Pobremente diferenciado a indiferenciado: < 50% de formación glandular)"
              },
              {
                "value": "cannot_assess",
                "label": "No puede ser evaluado / No aplicable"
              }
            ],
            "helpText": "(Nota D del CAP): Sistema graduado de 2 niveles recomendado por la OMS. Se fundamenta en el porcentaje de formación glandular tubular. Los tumores MSI-H frecuentemente tienen aspecto de alto grado arquitectural pero comportamiento indolente."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Medición macroscópica de la mayor dimensión tumoral invasora."
          },
          {
            "id": "tumor_size_add",
            "label": "Dimensiones Adicionales (cm x cm)",
            "type": "text",
            "helpText": "Dimensiones secundarias (ancho y espesor en cm)."
          },
          {
            "id": "macroscopic_perforation",
            "label": "Perforación Macroscópica del Tumor",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present_tumor",
                "label": "Presente en el lecho tumoral"
              },
              {
                "value": "present_not_tumor",
                "label": "Presente en intestino adyacente (no en el tumor)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota F del CAP): La perforación en el lecho tumoral que comunica con la cavidad peritoneal cataloga al caso como pT4a y representa un riesgo muy alto de carcinomatosis y siembra peritoneal."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN PATOLÓGICA (pTNM)",
        "fields": [
          {
            "id": "pt_category",
            "label": "Tumor Primario (pT - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: No puede ser evaluado"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin evidencia de tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Carcinoma in situ (intramucoso: confinado a lámina propia o muscularis mucosae)"
              },
              {
                "value": "pt1",
                "label": "pT1: El tumor invade la submucosa"
              },
              {
                "value": "pt2",
                "label": "pT2: El tumor invade la muscular propia"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor invade a través de la muscular propia hacia tejidos pericolónicos / perirrectales / subserosa"
              },
              {
                "value": "pt4a",
                "label": "pT4a: El tumor penetra la superficie del peritoneo visceral (serosa)"
              },
              {
                "value": "pt4b",
                "label": "pT4b: El tumor invade directamente o está adherente a otros órganos o estructuras"
              }
            ],
            "helpText": "(Nota E del CAP): Criterios AJCC 8va Edición. En pT4a, se requiere que las células tumorales alcancen la superficie mesotelial peritoneal visceral libre, con reacción mesotelial, fibrina o células exfoliadas. La invasión de grasa subserosa sin romper peritoneo permanece en pT3."
          },
          {
            "id": "nodes_examined",
            "label": "Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota E del CAP): Se exige un MÍNIMO de 12 ganglios linfáticos regionales examinados para clasificar confiablemente a un paciente como pN0. Con menos de 12 ganglios se incrementa el riesgo de subestadificación diagnóstica."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios Linfáticos con Metástasis",
            "type": "number",
            "helpText": "Número de ganglios con metástasis microscópica o macroscópica (>0.2 mm). Las células tumorales aisladas (ITC <=0.2 mm) se clasifican como pN0(i+)."
          },
          {
            "id": "extranodal_extension",
            "label": "Extensión Extranodal (ENE)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente (ruptura capsular e invasión a grasa perinodal)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Invasión tumoral más allá de la cápsula ganglionar hacia la grasa circundante. Factor pronóstico independiente de menor sobrevida libre de enfermedad."
          },
          {
            "id": "tumor_deposits",
            "label": "Depósitos Tumorales Satélites (Pericolónicos / Perirrectales)",
            "type": "radio",
            "options": [
              {
                "value": "none",
                "label": "No identificados"
              },
              {
                "value": "present",
                "label": "Presentes (especificar cantidad)",
                "hasInput": true
              },
              {
                "value": "cannot_determine",
                "label": "No determinado"
              }
            ],
            "helpText": "(Nota L del CAP): Focos microscópicos discretos de tumor en grasa pericolónica/perirrectal dentro del territorio de drenaje, sin evidencia de ganglio residual, pared vascular ni nervio. Si todos los ganglios regionales son negativos (0 ganglios metastásicos) pero hay depósitos tumorales, se clasifica como pN1c."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pnx",
                "label": "pNX: No pueden ser evaluados"
              },
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis en ganglios linfáticos regionales"
              },
              {
                "value": "pn1a",
                "label": "pN1a: Metástasis en 1 ganglio regional"
              },
              {
                "value": "pn1b",
                "label": "pN1b: Metástasis en 2 a 3 ganglios regionales"
              },
              {
                "value": "pn1c",
                "label": "pN1c: Sin ganglios metastásicos, pero con depósito(s) tumoral(es) satélite(s)"
              },
              {
                "value": "pn2a",
                "label": "pN2a: Metástasis en 4 a 6 ganglios regionales"
              },
              {
                "value": "pn2b",
                "label": "pN2b: Metástasis en 7 o más ganglios regionales"
              }
            ],
            "helpText": "Categorización según el número absoluto de ganglios metastásicos y la presencia de depósitos satélites (pN1c)."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (estudio microscópico patológico no disponible)"
              },
              {
                "value": "pm1a",
                "label": "pM1a: Metástasis en 1 solo órgano o sitio sin metástasis peritoneal"
              },
              {
                "value": "pm1b",
                "label": "pM1b: Metástasis en >1 órgano o sitio sin metástasis peritoneal"
              },
              {
                "value": "pm1c",
                "label": "pM1c: Metástasis en superficie peritoneal (con o sin otros órganos)"
              }
            ],
            "helpText": "pM1c denota carcinomatosis peritoneal, la cual confiere la tasa de sobrevida más baja en estadio IV."
          }
        ]
      },
      {
        "name": "MÁRGENES DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_proximal",
            "label": "Margen Quirúrgico Proximal",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota K del CAP): Margen tubular proximal. Consignar distancia libre al carcinoma invasor o a displasia de alto grado."
          },
          {
            "id": "margin_distal",
            "label": "Margen Quirúrgico Distal",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota K del CAP): Margen tubular distal. En LAR/APR, un margen libre distal microscópico >= 1 cm tras fijación es oncológicamente adecuado."
          },
          {
            "id": "margin_crm",
            "label": "Margen Radial / Circunferencial (CRM / Fascia Mesorrectal / Pericólica)",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (segmento totalmente cubierto por peritoneo)"
              },
              {
                "value": "uninvolved_gt_1mm",
                "label": "No comprometido: Carcinoma invasor a más de 1.0 mm del margen entintado (especificar distancia en mm)",
                "hasInput": true
              },
              {
                "value": "involved_lte_1mm",
                "label": "COMPROMETIDO: Carcinoma invasor o depósito tumoral a 1.0 mm o menos (<=1.0 mm) de la tinta (especificar distancia en mm)",
                "hasInput": true
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota K del CAP): Criterio internacional de CRM: Se considera POSITIVO (R1) si el tumor invasor, un depósito tumoral o un ganglio con invasión extracapsular dista 1.0 mm o menos (<=1.0 mm) de la tinta. Es el predictor independiente más potente de recurrencia locorregional en cáncer rectal y colon retroperitoneal."
          }
        ]
      },
      {
        "name": "INVASIONES Y BROTACIÓN TUMORAL (TUMOR BUDDING)",
        "fields": [
          {
            "id": "lvi_small_vessel",
            "label": "Invasión Linfática (Pequeños Vasos / Capilares)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): Nidos tumorales dentro de canales endoteliales linfáticos o capilares. Distinguir de artefactos de retracción mediante visualización de endotelio verdadero."
          },
          {
            "id": "lvi_large_vessel",
            "label": "Invasión Venosa (Grandes Vasos / EMVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "intramural",
                "label": "Presente intramural (dentro de la muscular propia)"
              },
              {
                "value": "extramural_emvi",
                "label": "Presente EXTRAMURAL (EMVI: venas del tejido adiposo subseroso / pericolónico)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): La Invasión Venosa Extramural (EMVI) es un predictor independiente de metástasis hepáticas hematógenas y sobrevida disminuida. Se reconoce por nidos tumorales rodeados de fibras musculares vasculares elásticas (tinción elástica de Verhoeff-Van Gieson)."
          },
          {
            "id": "perineural_invasion",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): Células tumorales dentro del espacio perineural o a lo largo del trayecto de filetes nerviosos. Factor pronóstico adverso de recidiva locorregional."
          },
          {
            "id": "tumor_budding",
            "label": "Brotación Tumoral (Tumor Budding - Consenso ITBCC 2016)",
            "type": "radio",
            "options": [
              {
                "value": "bd1",
                "label": "Bajo grado (Bd1: 0 a 4 brotes por campo hotspot de 0.785 mm²)"
              },
              {
                "value": "bd2",
                "label": "Grado intermedio (Bd2: 5 a 9 brotes por campo hotspot de 0.785 mm²)"
              },
              {
                "value": "bd3",
                "label": "Alto grado (Bd3: 10 o más brotes por campo hotspot de 0.785 mm²)"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota H del CAP): Células aisladas o grupos <=4 células en el frente invasor. Evaluado en un área de hotspot de 0.785 mm² (campo 20x con ocular estándar FN 22mm). En cánceres T1 (pólipos resecados), Bd2 y Bd3 son factores de alto riesgo de metástasis ganglionar que ameritan colectomía oncológica. En estadio II, Bd3 es indicación de quimioterapia adyuvante."
          }
        ]
      },
      {
        "name": "RESPUESTA TERAPÉUTICA Y ESTUDIOS ESPECIALES",
        "fields": [
          {
            "id": "treatment_effect",
            "label": "Efecto del Tratamiento Neoadyuvante (Sistema Ryan / CAP)",
            "type": "radio",
            "options": [
              {
                "value": "no_therapy",
                "label": "Sin tratamiento neoadyuvante conocido"
              },
              {
                "value": "score_0",
                "label": "Score 0 (Respuesta completa: sin células tumorales viables detectables, respuesta patológica completa pCR)"
              },
              {
                "value": "score_1",
                "label": "Score 1 (Respuesta moderada: células tumorales escasas aisladas o grupos microscópicos dispersos)"
              },
              {
                "value": "score_2",
                "label": "Score 2 (Respuesta mínima: cáncer residual prominente superado por fibrosis/desmoplasia)"
              },
              {
                "value": "score_3",
                "label": "Score 3 (Pobre o nula respuesta: extenso cáncer residual sin fibrosis destructiva franca)"
              }
            ],
            "helpText": "(Nota J del CAP): Sistema de graduación de regresión tumoral del CAP/Ryan. La respuesta patológica completa (Score 0) confiere un excelente pronóstico de sobrevida global a largo plazo."
          },
          {
            "id": "mmr_ihc",
            "label": "Reparación de Apareamiento de Bases (MMR por Inmunohistoquímica)",
            "type": "radio",
            "options": [
              {
                "value": "intact_pmmr",
                "label": "Expresión conservada en las 4 proteínas (pMMR: MLH1, MSH2, MSH6 y PMS2 nucleares positivas)"
              },
              {
                "value": "loss_dmmr",
                "label": "PÉRDIDA de expresión nuclear (dMMR - especificar proteínas ausentes)",
                "hasInput": true
              },
              {
                "value": "pending",
                "label": "En proceso / Pendiente"
              },
              {
                "value": "not_performed",
                "label": "No realizado"
              }
            ],
            "helpText": "(Nota M del CAP): Tamizaje universal obligatorio. La pérdida nuclear (dMMR) genera inestabilidad de microsatélites (MSI-H). En caso de pérdida dual de MLH1 y PMS2, debe realizarse prueba de mutación BRAF V600E o metilación del promotor de MLH1 para distinguir origen esporádico versus Síndrome de Lynch. Los casos dMMR/MSI-H son altamente sensibles a inmunoterapia anti-PD-1 (pembrolizumab)."
          },
          {
            "id": "molecular_biomarkers",
            "label": "Biomarcadores Moleculares Adicionales (KRAS, NRAS, BRAF, HER2)",
            "type": "text",
            "helpText": "(Nota M del CAP): Mutaciones en exones 2, 3 y 4 de KRAS y NRAS contraindican terapia anti-EGFR. BRAF V600E predice resistencia y comportamiento agresivo, permitiendo terapia dirigida con inhibidores de BRAF + cetuximab."
          }
        ]
      }
    ],
    "organ": "Colon y Recto",
    "subtitle": "CAP v4.4.0.1 / AJCC 8va Edición (Resección)"
  },
  "colorectal_biopsy": {
    "id": "colorectal_biopsy",
    "title": "Protocolo Sinóptico: Colon y Recto (Biopsia / Polipectomía) - CAP v4.3.0.0",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Endoscópico / Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "polypectomy",
                "label": "Polipectomía endoscópica (con asa)"
              },
              {
                "value": "emr",
                "label": "Resección mucosa endoscópica (EMR)"
              },
              {
                "value": "esd",
                "label": "Disección submucosa endoscópica (ESD)"
              },
              {
                "value": "transanal_disk",
                "label": "Escisión de disco transanal (TEM / TAMIS)"
              },
              {
                "value": "forceps_biopsy",
                "label": "Biopsia endoscópica con pinza (fórceps)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "Identifica el método de escisión endoscópica. En resecciones locales completas (polipectomía, EMR, ESD, TEM), la preservación anatómica orientada permite una evaluación fidedigna de los márgenes profundo y lateral."
          },
          {
            "id": "specimen_integrity",
            "label": "Integridad del Espécimen",
            "type": "radio",
            "options": [
              {
                "value": "intact",
                "label": "Íntegro (pieza única orientable)"
              },
              {
                "value": "fragmented",
                "label": "Fragmentado (múltiples fragmentos / resección en piecemeal)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "La fragmentación del tejido o resección en 'piecemeal' impide evaluar con certeza el margen de resección profundo y lateral, imposibilitando descartar enfermedad residual."
          }
        ]
      },
      {
        "name": "TUMOR Y PÓLIPO DE ORIGEN",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico de la Lesión",
            "type": "select",
            "options": [
              {
                "value": "cecum",
                "label": "Ciego"
              },
              {
                "value": "ascending_colon",
                "label": "Colon ascendente"
              },
              {
                "value": "hepatic_flexure",
                "label": "Ángulo hepático"
              },
              {
                "value": "transverse_colon",
                "label": "Colon transverso"
              },
              {
                "value": "splenic_flexure",
                "label": "Ángulo esplénico"
              },
              {
                "value": "descending_colon",
                "label": "Colon descendente"
              },
              {
                "value": "sigmoid_colon",
                "label": "Colon sigmoides"
              },
              {
                "value": "rectosigmoid",
                "label": "Unión rectosigmoidea"
              },
              {
                "value": "rectum",
                "label": "Recto"
              },
              {
                "value": "colon_nos",
                "label": "Colon, no especificado"
              }
            ],
            "helpText": "(Nota A del CAP): Ubicación endoscópica del pólipo. Los adenomas y carcinomas de recto distal pueden manejarse mediante abordaje transanal o requerir resección radical según la profundidad de invasión."
          },
          {
            "id": "polyp_type",
            "label": "Tipo de Pólipo en el que se Originó el Carcinoma Invasor",
            "type": "select",
            "options": [
              {
                "value": "tubular",
                "label": "Adenoma tubular"
              },
              {
                "value": "tubulovillous",
                "label": "Adenoma tubulovelloso"
              },
              {
                "value": "villous",
                "label": "Adenoma velloso"
              },
              {
                "value": "sessile_serrated",
                "label": "Lesión / pólipo serrado sésil (SSL)"
              },
              {
                "value": "traditional_serrated",
                "label": "Adenoma serrado tradicional (TSA)"
              },
              {
                "value": "hamartomatous",
                "label": "Pólipo hamartomatoso / Peutz-Jeghers / Juvenil"
              },
              {
                "value": "none_de_novo",
                "label": "Sin pólipo residual identificable (carcinoma de novo)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): La mayoría de los carcinomas colorrectales surgen sobre adenomas convencionales (vía supresora APC/CIN) o sobre lesiones serradas (vía serrada asociada a mutación BRAF e hipermetilación CIMP)."
          },
          {
            "id": "polyp_config",
            "label": "Configuración Macroscópica del Pólipo",
            "type": "radio",
            "options": [
              {
                "value": "pedunculated",
                "label": "Pediculado (con tallo evidente)"
              },
              {
                "value": "sessile",
                "label": "Sésil (base ancha de implantación, sin tallo)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota D del CAP): La presencia de tallo permite aplicar la clasificación pronóstica de niveles de Haggitt, mientras que los pólipos sésiles se estratifican según la invasión de la submucosa (niveles de Kikuchi o medición micrométrica directa)."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico del Carcinoma Invasor",
            "type": "select",
            "options": [
              {
                "value": "adenocarcinoma",
                "label": "Adenocarcinoma convencional"
              },
              {
                "value": "mucinous",
                "label": "Adenocarcinoma mucinoso (>50% de mucina)"
              },
              {
                "value": "signet_ring",
                "label": "Adenocarcinoma de células en anillo de sello"
              },
              {
                "value": "medullary",
                "label": "Carcinoma medular"
              },
              {
                "value": "micropapillary",
                "label": "Adenocarcinoma micropapilar"
              },
              {
                "value": "other",
                "label": "Otro tipo (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota B del CAP): Los tipos no convencionales como el carcinoma micropapilar y de células en anillo de sello tienen una alta tasa de metástasis ganglionar temprana incluso en lesiones T1."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico",
            "type": "radio",
            "options": [
              {
                "value": "low_grade",
                "label": "Bajo grado (Bien a moderadamente diferenciado: >= 50% de formación glandular)"
              },
              {
                "value": "high_grade",
                "label": "Alto grado (Pobremente diferenciado: < 50% de formación glandular)"
              }
            ],
            "helpText": "(Nota C del CAP): El alto grado histológico en un pólipo malignizado es un factor de alto riesgo independiente para metástasis en ganglios linfáticos regionales y justifica rescate quirúrgico con colectomía."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTRATIFICACIÓN EN PÓLIPOS",
        "fields": [
          {
            "id": "haggitt_level",
            "label": "Nivel de Invasión de Haggitt (Para pólipos pediculados únicamente)",
            "type": "radio",
            "dependsOn": {
              "field": "polyp_config",
              "value": "pedunculated"
            },
            "options": [
              {
                "value": "level_1",
                "label": "Nivel 1: Carcinoma invade la submucosa pero limitado a la cabeza del pólipo"
              },
              {
                "value": "level_2",
                "label": "Nivel 2: Carcinoma invade la submucosa a nivel del cuello del pólipo"
              },
              {
                "value": "level_3",
                "label": "Nivel 3: Carcinoma invade la submucosa a lo largo del tallo del pólipo"
              },
              {
                "value": "level_4",
                "label": "Nivel 4: Carcinoma invade la submucosa de la pared colónica por debajo del tallo"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota D del CAP): Clasificación de Haggitt. Los niveles 1, 2 y 3 tienen un riesgo muy bajo de metástasis ganglionar (<1%) si los márgenes están libres y no hay otros factores adversos. El nivel 4 eleva el riesgo de metástasis ganglionar al 10-15% y se equipara biológicamente a un pólipo sésil invasor."
          },
          {
            "id": "submucosal_depth_microns",
            "label": "Profundidad de Invasión Submucosa en Micrómetros (µm)",
            "type": "number",
            "suffix": "µm",
            "helpText": "(Nota D del CAP): Criterio de Ueno/Kikuchi. Medida desde la muscularis mucosae hasta el punto más profundo de invasión. En pólipos sésiles, una invasión submucosa profunda (> 1000 µm / > 1 mm) se asocia a un riesgo de metástasis ganglionar del 6% al 12%, considerándose criterio de alto riesgo."
          },
          {
            "id": "submucosal_width_microns",
            "label": "Ancho de la Invasión Submucosa (µm o mm)",
            "type": "number",
            "suffix": "µm",
            "helpText": "Anchura máxima del frente invasor submucoso. Lesiones con frente expansivo ancho (>2000 µm) presentan mayor frecuencia de compromiso vascular."
          }
        ]
      },
      {
        "name": "MÁRGENES DE RESECCIÓN EN LA BIOPSIA / POLIPECTOMÍA",
        "fields": [
          {
            "id": "deep_margin_status",
            "label": "Margen de Resección Profundo (Base / Tallo)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved_gt_1mm",
                "label": "No comprometido: Distancia libre >= 1.0 mm (especificar distancia exacta en mm)",
                "hasInput": true
              },
              {
                "value": "close_lte_1mm",
                "label": "Cercano: Carcinoma invasor a menos de 1.0 mm del margen entintado (especificar distancia en mm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido: Carcinoma invasor presente en la superficie entintada de corte (0 mm)"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado por fragmentación o electrocauterio"
              }
            ],
            "helpText": "(Nota D y K del CAP): En polipectomía, un margen profundo de resección < 1.0 mm (<1 mm) se considera POSITIVO o de ALTO RIESGO para persistencia tumoral local y metástasis residual en la pared colónica, justificando resección quirúrgica complementaria."
          },
          {
            "id": "mucosal_margin_status",
            "label": "Margen de Resección Mucoso (Lateral)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido por carcinoma invasor ni por adenoma"
              },
              {
                "value": "involved_adenoma",
                "label": "Comprometido por adenoma residual (displasia)",
                "hasInput": true
              },
              {
                "value": "involved_carcinoma",
                "label": "Comprometido por carcinoma invasor"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "El compromiso del margen lateral por displasia adenomatosa puede manejarse con vigilancia endoscópica o re-escisión local, a diferencia del compromiso por carcinoma invasor."
          }
        ]
      },
      {
        "name": "FACTORES HISTOLÓGICOS DE ALTO RIESGO",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfática y/o Vascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente (linfática o venosa)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota E del CAP): La presencia de embolias tumorales linfovasculares es uno de los factores más fuertes de metástasis ganglionar en pólipos malignos (riesgo del 15% al 35%), constituyendo una indicación categórica de colectomía oncológica."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota E del CAP): Células tumorales dentro o alrededor de filetes nerviosos en la submucosa."
          },
          {
            "id": "tumor_budding",
            "label": "Puntaje de Brotación Tumoral (Tumor Budding - ITBCC)",
            "type": "radio",
            "options": [
              {
                "value": "bd1",
                "label": "Bajo grado (Bd1: 0 a 4 brotes por 0.785 mm²)"
              },
              {
                "value": "bd2",
                "label": "Grado intermedio (Bd2: 5 a 9 brotes por 0.785 mm²)"
              },
              {
                "value": "bd3",
                "label": "Alto grado (Bd3: 10 o más brotes por 0.785 mm²)"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado"
              }
            ],
            "helpText": "(Nota F del CAP): La brotación tumoral intermedia/alta (Bd2/Bd3) en la base de un pólipo pT1 incrementa significativamente el riesgo de compromiso ganglionar metastásico independientemente de otros factores."
          },
          {
            "id": "high_risk_summary",
            "label": "Resumen de Criterios de Alto Riesgo de Metástasis Ganglionar",
            "type": "checkbox",
            "options": [
              {
                "value": "none",
                "label": "Sin factores de alto riesgo identificados (pólipo de bajo riesgo curado con polipectomía)"
              },
              {
                "value": "margin_positive",
                "label": "Margen de resección profundo positivo o cercano (< 1.0 mm)"
              },
              {
                "value": "poorly_diff",
                "label": "Grado histológico pobremente diferenciado (alto grado)"
              },
              {
                "value": "lvi_positive",
                "label": "Invasión linfovascular presente"
              },
              {
                "value": "high_budding",
                "label": "Brotación tumoral intermedia o alta (Bd2 o Bd3)"
              },
              {
                "value": "deep_sm_invasion",
                "label": "Invasión submucosa profunda (> 1000 µm o Haggitt nivel 4)"
              },
              {
                "value": "fragmented",
                "label": "Espécimen fragmentado que impide evaluación segura"
              }
            ],
            "helpText": "(Nota D del CAP): Criterios de consenso internacional: La presencia de CUALQUIERA de estos factores de alto riesgo clasifica al pólipo como de ALTO RIESGO oncológico y justifica plantear rescate mediante resección quirúrgica radical (colectomía con linfadenectomía formal)."
          }
        ]
      }
    ],
    "organ": "Colon y Recto",
    "subtitle": "CAP v4.3.0.0 (Biopsia / Polipectomía / EMR / ESD)"
  },
  "stomach_resection": {
    "id": "stomach_resection",
    "title": "Protocolo Sinóptico: Estómago (Resección) - CAP v4.4.0.0 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "total_gastrectomy",
                "label": "Gastrectomía total"
              },
              {
                "value": "distal_gastrectomy",
                "label": "Gastrectomía subtotal / distal"
              },
              {
                "value": "proximal_gastrectomy",
                "label": "Gastrectomía proximal"
              },
              {
                "value": "wedge_resection",
                "label": "Gastrectomía en cuña (resección atípica)"
              },
              {
                "value": "esd_emr",
                "label": "Resección endoscópica (ESD / EMR)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "(Nota A del CAP): Tipo de resección gástrica. Las gastrectomías oncológicas por adenocarcinoma habitualmente incluyen omentectomía y linfadenectomía D1/D2 según guías JGCA/NCCN."
          }
        ]
      },
      {
        "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico del Tumor (seleccionar todos los que apliquen)",
            "type": "checkbox",
            "options": [
              {
                "value": "cardia",
                "label": "Cardias"
              },
              {
                "value": "fundus",
                "label": "Fondo gástrico"
              },
              {
                "value": "body",
                "label": "Cuerpo gástrico"
              },
              {
                "value": "antrum",
                "label": "Antro gástrico"
              },
              {
                "value": "pylorus",
                "label": "Píloro"
              },
              {
                "value": "lesser_curvature",
                "label": "Curvatura menor"
              },
              {
                "value": "greater_curvature",
                "label": "Curvatura mayor"
              },
              {
                "value": "anterior_wall",
                "label": "Pared anterior"
              },
              {
                "value": "posterior_wall",
                "label": "Pared posterior"
              },
              {
                "value": "stomach_nos",
                "label": "Estómago, no especificado"
              }
            ],
            "helpText": "(Nota B del CAP): La localización condiciona las cadenas ganglionares de drenaje (estaciones japonesas de la 1 a la 16). Los tumores antropilóricos drenan a ganglios subpilóricos y suprapilóricos; los de curvatura menor a ganglios gástricos izquierdos y del tronco celíaco."
          },
          {
            "id": "egj_involvement",
            "label": "Compromiso de la Unión Esofagogástrica (UEG) y Clasificación de Siewert",
            "type": "radio",
            "options": [
              {
                "value": "no_egj",
                "label": "No compromete la Unión Esofagogástrica (epicentro enteramente gástrico >2 cm de la UEG)"
              },
              {
                "value": "siewert_1",
                "label": "Siewert Tipo I: Adenocarcinoma de esófago distal (epicentro 1 a 5 cm por encima de la UEG)"
              },
              {
                "value": "siewert_2",
                "label": "Siewert Tipo II: Adenocarcinoma del verdadero cardias/UEG (epicentro de 1 cm sobre a 2 cm bajo la UEG)"
              },
              {
                "value": "siewert_3",
                "label": "Siewert Tipo III: Adenocarcinoma subcardial (epicentro 2 a 5 cm bajo la UEG con invasión proximal)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota B del CAP): Regla estricta del AJCC 8va Edición: Si el punto medio (epicentro) del tumor se encuentra a 2.0 cm o menos de la UEG E invade el esófago tubular distal, el tumor DEBE ser clasificado y estadificado usando el protocolo de Esófago. Los tumores con epicentro a más de 2.0 cm de la UEG en el estómago proximal, o que no cruzan hacia el esófago, se estadifican usando el protocolo de Estómago."
          },
          {
            "id": "egj_distance_cm",
            "label": "Distancia del Centro del Tumor a la UEG (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Distancia en centímetros desde el centro geométrico de la masa tumoral hasta la línea Z / unión esofagogástrica anatómica."
          },
          {
            "id": "histologic_type_who",
            "label": "Tipo Histológico (Clasificación de la OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "tubular",
                "label": "Adenocarcinoma tubular"
              },
              {
                "value": "papillary",
                "label": "Adenocarcinoma papilar"
              },
              {
                "value": "mucinous",
                "label": "Adenocarcinoma mucinoso (>50% de mucina extracelular)"
              },
              {
                "value": "poorly_cohesive_signet",
                "label": "Carcinoma pobremente cohesivo, tipo células en anillo de sello (>50% de células en anillo de sello)"
              },
              {
                "value": "poorly_cohesive_other",
                "label": "Carcinoma pobremente cohesivo, otras variantes no anillo de sello"
              },
              {
                "value": "mixed_carcinoma",
                "label": "Carcinoma mixto (componentes glandulares tubulares y componentes no cohesivos)"
              },
              {
                "value": "medullary_ebv",
                "label": "Carcinoma medular / carcinoma gástrico con estroma linfoide abundante (asociado a virus Epstein-Barr EBV)"
              },
              {
                "value": "adenosquamous",
                "label": "Carcinoma adenoescamoso"
              },
              {
                "value": "squamous_cell",
                "label": "Carcinoma de células escamosas"
              },
              {
                "value": "undifferentiated",
                "label": "Carcinoma indiferenciado"
              },
              {
                "value": "large_cell_ne",
                "label": "Carcinoma neuroendocrino de células grandes"
              },
              {
                "value": "small_cell_ne",
                "label": "Carcinoma neuroendocrino de células pequeñas"
              },
              {
                "value": "minen",
                "label": "Neoplasia mixta neuroendocrina - no neuroendocrina (MiNEN) (especificar componentes)",
                "hasInput": true
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota C del CAP): El carcinoma pobremente cohesivo incluye el subtipo clásico de anillo de sello (con abundante vacuola citoplasmática de mucina que desplaza el núcleo hacia la periferia) y variantes sin anillo de sello. El carcinoma con estroma linfoide (rico en TILs) con frecuencia es positivo para EBV (EBER por hibridación in situ) o dMMR/MSI-H."
          },
          {
            "id": "lauren_classification",
            "label": "Clasificación de Lauren del Adenocarcinoma",
            "type": "radio",
            "options": [
              {
                "value": "intestinal",
                "label": "Tipo Intestinal (glándulas cohesivas bien o moderadamente diferenciadas, asociado a gastritis atrófica y metaplasia intestinal)"
              },
              {
                "value": "diffuse",
                "label": "Tipo Difuso (células aisladas no cohesivas, células en anillo de sello, patrón infiltrativo linitis plástica, mutación/pérdida de E-cadherina CDH1)"
              },
              {
                "value": "mixed",
                "label": "Tipo Mixto (componentes intestinales y difusos coexistentes en proporciones significativas)"
              },
              {
                "value": "indeterminate",
                "label": "Indeterminado"
              }
            ],
            "helpText": "(Nota C del CAP): Clasificación de Lauren: El tipo Intestinal predomina en pacientes mayores, varones y zonas de alta prevalencia de H. pylori, siguiendo la cascada de Correa. El tipo Difuso ocurre a menudo en pacientes más jóvenes, no se asocia a metaplasia intestinal, muestra pérdida de expresión membranosa de E-cadherina (CDH1) y presenta un patrón de diseminación peritoneal/linfática difusa altamente agresivo."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico (Diferenciación)",
            "type": "radio",
            "options": [
              {
                "value": "g1",
                "label": "G1: Bien diferenciado (>95% de formación glandular)"
              },
              {
                "value": "g2",
                "label": "G2: Moderadamente diferenciado (50% a 95% de formación glandular)"
              },
              {
                "value": "g3",
                "label": "G3: Pobremente diferenciado (<50% de formación glandular, incluye carcinomas de células en anillo de sello)"
              },
              {
                "value": "gx",
                "label": "GX: El grado no puede ser evaluado"
              }
            ],
            "helpText": "(Nota D del CAP): Sistema de 3 grados basado en la formación de túbulos glandulares. Los carcinomas de células en anillo de sello y pobremente cohesivos se asignan automáticamente a Grado 3."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Medición macroscópica y microscópica de la mayor extensión tumoral invasora."
          },
          {
            "id": "tumor_size_add",
            "label": "Dimensiones Adicionales (cm x cm)",
            "type": "text",
            "helpText": "Dimensiones adicionales del tumor (ej: 4.2 x 3.0 cm)."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
        "fields": [
          {
            "id": "pt_category",
            "label": "Tumor Primario (pT - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: El tumor primario no puede ser evaluado"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin evidencia de tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Carcinoma in situ (intramucoso sin invasión de la lámina propia/muscularis mucosae)"
              },
              {
                "value": "pt1a",
                "label": "pT1a: El tumor invade la lámina propia o la muscularis mucosae"
              },
              {
                "value": "pt1b",
                "label": "pT1b: El tumor invade la submucosa"
              },
              {
                "value": "pt2",
                "label": "pT2: El tumor invade la muscular propia"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor invade el tejido conectivo subseroso sin perforar el peritoneo visceral ni estructuras adyacentes"
              },
              {
                "value": "pt4a",
                "label": "pT4a: El tumor penetra la serosa (peritoneo visceral gástrico)"
              },
              {
                "value": "pt4b",
                "label": "pT4b: El tumor invade directamente órganos o estructuras adyacentes (bazo, colon transverso, hígado, páncreas, diafragma, epiplón)"
              }
            ],
            "helpText": "(Nota J del CAP): Criterios de la 8va Edición del AJCC: En pT1a (cáncer gástrico temprano intramucoso), el riesgo de metástasis ganglionar es <3%, siendo susceptible de curación por disección endoscópica (ESD). En pT1b (invasión submucosa), el riesgo salta a 15-20%. Para pT4a, el tumor debe alcanzar la superficie mesotelial peritoneal visceral libre. La extensión continua a epiplón mayor o menor sin invadir otros órganos se clasifica como pT3 a menos que rompa la superficie peritoneal libre del epiplón (pT4a)."
          },
          {
            "id": "nodes_examined",
            "label": "Número Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota I del CAP): El AJCC y el CAP establecen que se deben examinar un MÍNIMO de 16 ganglios linfáticos regionales para una estadificación pN confiable (linfadenectomía D2 estándar típicamente rinde >=16 a 25 ganglios). Si se aíslan menos de 16 ganglios, existe riesgo sustancial de subclasificar la categoría N."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios Linfáticos con Metástasis",
            "type": "number",
            "helpText": "Número de ganglios con metástasis microscópica o macroscópica de adenocarcinoma."
          },
          {
            "id": "extranodal_extension",
            "label": "Extensión Extranodal (ENE)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Ruptura de la cápsula ganglionar con invasión hacia la grasa periganglionar."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pnx",
                "label": "pNX: No pueden ser evaluados"
              },
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis en ganglios linfáticos regionales"
              },
              {
                "value": "pn1",
                "label": "pN1: Metástasis en 1 a 2 ganglios linfáticos regionales"
              },
              {
                "value": "pn2",
                "label": "pN2: Metástasis en 3 a 6 ganglios linfáticos regionales"
              },
              {
                "value": "pn3a",
                "label": "pN3a: Metástasis en 7 a 15 ganglios linfáticos regionales"
              },
              {
                "value": "pn3b",
                "label": "pN3b: Metástasis en 16 o más ganglios linfáticos regionales"
              }
            ],
            "helpText": "(Nota I del CAP): La división de pN3 en pN3a (7 a 15 ganglios) y pN3b (>=16 ganglios) es un cambio crítico de la 8va edición debido a la marcada diferencia en la sobrevida global a 5 años entre ambos grupos."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (sin confirmación patológica)"
              },
              {
                "value": "pm1",
                "label": "pM1: Metástasis a distancia presente (incluye citología peritoneal positiva o metástasis ganglionar retropancreática/mesentérica)"
              }
            ],
            "helpText": "Nota importante: Una citología de lavado peritoneal positiva para células malignas durante la laparoscopia se clasifica automáticamente como metástasis a distancia (M1)."
          }
        ]
      },
      {
        "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_proximal",
            "label": "Margen Quirúrgico Proximal (Esofágico / Gástrico)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia en cm/mm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota H del CAP): En gastrectomías, el compromiso del margen proximal por células tumorales infiltrantes (frecuente en carcinoma difuso/anillo de sello) obliga a considerar re-resección intraoperatoria."
          },
          {
            "id": "margin_distal",
            "label": "Margen Quirúrgico Distal (Duodenal / Gástrico)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia en cm/mm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota H del CAP): Margen duodenal o gástrico distal."
          },
          {
            "id": "margin_omental",
            "label": "Márgenes de Resección Omentales (Epiplón Mayor y Menor)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometidos"
              },
              {
                "value": "involved",
                "label": "Comprometidos por carcinoma invasor"
              },
              {
                "value": "na",
                "label": "No aplicable"
              }
            ],
            "helpText": "Evalúa el borde libre de resección del tejido graso del epiplón mayor y menor resecado en bloque."
          }
        ]
      },
      {
        "name": "INVASIONES Y EFECTO DEL TRATAMIENTO",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfovascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente (linfática o venosa)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota F del CAP): Invasión de canales linfáticos o venas de la submucosa, muscular o subserosa. Factor pronóstico independiente adverso."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): Invasión tumoral de espacios perineurales en la pared gástrica. Altamente prevalente en el adenocarcinoma difuso / células en anillo de sello."
          },
          {
            "id": "treatment_effect",
            "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan o Becker)",
            "type": "radio",
            "options": [
              {
                "value": "no_therapy",
                "label": "Sin quimioterapia presúrgica conocida"
              },
              {
                "value": "score_0",
                "label": "Score 0 / Becker 1a: Respuesta patológica completa (sin células tumorales viables)"
              },
              {
                "value": "score_1",
                "label": "Score 1 / Becker 1b: Respuesta casi completa (<10% de células tumorales viables)"
              },
              {
                "value": "score_2",
                "label": "Score 2 / Becker 2: Respuesta parcial (10% a 50% de células tumorales viables)"
              },
              {
                "value": "score_3",
                "label": "Score 3 / Becker 3: Pobre o nula respuesta (>50% de células tumorales viables)"
              }
            ],
            "helpText": "(Nota E del CAP): Cuantificación de la regresión histológica tras quimioterapia perioperatoria (ej: esquema FLOT). La respuesta patológica completa o casi completa se asocia a mejoría dramática en la sobrevida libre de recurrencia."
          }
        ]
      },
      {
        "name": "ESTUDIOS DE BIOMARCADORES Y ONCOLOGÍA DIRIGIDA",
        "fields": [
          {
            "id": "her2_ihc",
            "label": "Estado de HER2 por Inmunohistoquímica (Criterios de Hofman para Cáncer Gástrico)",
            "type": "radio",
            "options": [
              {
                "value": "score_0",
                "label": "Score 0 (Negativo: sin tinción o tinción membranosa en <10% de células en resección)"
              },
              {
                "value": "score_1",
                "label": "Score 1+ (Negativo: tinción membranosa débil/apenas visible en >=10% de células)"
              },
              {
                "value": "score_2",
                "label": "Score 2+ (Equívoco: tinción basolateral membranosa moderada completa/incompleta en >=10% de células)"
              },
              {
                "value": "score_3",
                "label": "Score 3+ (POSITIVO: tinción basolateral membranosa intensa en U en >=10% de células)"
              },
              {
                "value": "pending",
                "label": "Pendiente / En proceso"
              },
              {
                "value": "not_performed",
                "label": "No realizado"
              }
            ],
            "helpText": "Criterios diagnósticos específicos de Hofman para cáncer gástrico: a diferencia de la mama, las glándulas gástricas son polarizadas y muestran frecuentemente tinción membranosa basolateral incompleta (en forma de 'U'). Los casos Score 2+ requieren prueba refleja por hibridación in situ (FISH/CISH). Los casos Score 3+ o FISH amplificado son candidatos a terapia dirigida con Trastuzumab."
          },
          {
            "id": "her2_fish",
            "label": "HER2 por Hibridación In Situ (FISH / CISH)",
            "type": "radio",
            "dependsOn": {
              "field": "her2_ihc",
              "value": "score_2"
            },
            "options": [
              {
                "value": "amplified",
                "label": "AMPLIFICADO (Ratio HER2/CEP17 >= 2.0 o copia promedio de HER2 >= 6.0 señales/célula)"
              },
              {
                "value": "not_amplified",
                "label": "No amplificado (Ratio HER2/CEP17 < 2.0 y copias de HER2 < 4.0)"
              },
              {
                "value": "pending",
                "label": "En proceso / Pendiente"
              }
            ],
            "helpText": "Estudio confirmatorio para casos HER2 IHQ 2+ equívocos."
          },
          {
            "id": "mmr_status",
            "label": "Estado de Reparación de Apareamiento (MMR por IHQ / MSI)",
            "type": "radio",
            "options": [
              {
                "value": "pmmr",
                "label": "pMMR / MSS: Expresión nuclear conservada en las 4 proteínas (MLH1, PMS2, MSH2, MSH6)"
              },
              {
                "value": "dmmr",
                "label": "dMMR / MSI-H: PÉRDIDA de expresión nuclear de proteínas MMR",
                "hasInput": true
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "El fenotipo dMMR/MSI-H se observa en el 8-10% de carcinomas gástricos y predice una excelente respuesta a inhibidores de PD-1 (pembrolizumab), pero una respuesta reducida a la quimioterapia clásica perioperatoria con 5-FU/platino."
          },
          {
            "id": "pdl1_cps",
            "label": "PD-L1 Combined Positive Score (CPS)",
            "type": "number",
            "helpText": "CPS = (Número de células tumorales + linfocitos + macrófagos con tinción de membrana para PD-L1) / (Número total de células tumorales viables) x 100. Puntos de corte terapéuticos: CPS >= 1 y CPS >= 5 seleccionan pacientes para adición de Pembrolizumab o Nivolumab a la quimioterapia en primera línea."
          },
          {
            "id": "claudin_18_2",
            "label": "Expresión de Claudina 18.2 (Para terapia con Zolbetuximab)",
            "type": "radio",
            "options": [
              {
                "value": "positive",
                "label": "POSITIVO (Tinción membranosa de intensidad moderada a fuerte [2+/3+] en >= 75% de las células tumorales)"
              },
              {
                "value": "negative",
                "label": "Negativo (< 75% de células tumorales con tinción 2+/3+)"
              },
              {
                "value": "not_performed",
                "label": "No evaluado"
              }
            ],
            "helpText": "Criterio biomarcador para el anticuerpo monoclonal Zolbetuximab: exige tinción membranosa al menos moderada (2+/3+) en un mínimo del 75% de las células neoplásicas."
          }
        ]
      }
    ],
    "organ": "Estómago",
    "subtitle": "CAP v4.4.0.0 / AJCC 8va Edición (Gastrectomía / Resección)"
  },
  "stomach_gist_resection": {
    "id": "stomach_gist_resection",
    "title": "Protocolo Sinóptico: Tumor del Estroma Gastrointestinal - GIST (Resección) - CAP v4.3.0.0 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "INFORMACIÓN CLÍNICA Y PROCEDIMIENTO",
        "fields": [
          {
            "id": "associated_syndrome",
            "label": "Síndrome Asociado",
            "type": "radio",
            "options": [
              {
                "value": "none",
                "label": "Ninguno conocido (caso esporádico)"
              },
              {
                "value": "nf1",
                "label": "Neurofibromatosis tipo 1 (NF1)"
              },
              {
                "value": "carney_triad",
                "label": "Tríada de Carney (GIST gástrico, paraganglioma, condroma pulmonar)"
              },
              {
                "value": "carney_stratakis",
                "label": "Síndrome de Carney-Stratakis (GIST familiar y paraganglioma, deficiencia SDH)"
              },
              {
                "value": "other",
                "label": "Otro síndrome (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "Los GIST sindrómicos (ej: asociados a NF1 o deficiencia de succinato deshidrogenasa SDH) a menudo son gástricos multifocales, carecen de mutaciones KIT/PDGFRA y tienen menor sensibilidad al tratamiento estándar con imatinib."
          },
          {
            "id": "preresection_treatment",
            "label": "Tratamiento Previo a la Resección (Inhibidores de Tirosina Quinasa TKI)",
            "type": "radio",
            "options": [
              {
                "value": "none",
                "label": "Sin tratamiento previo conocido (paciente virgen de tratamiento)"
              },
              {
                "value": "imatinib",
                "label": "Imatinib mesilato"
              },
              {
                "value": "other_tki",
                "label": "Otro agente TKI (sunitinib, regorafenib, ripretinib, avapritinib)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "Tratamiento recibido pero agente no especificado"
              }
            ],
            "helpText": "(Nota C del CAP): El tratamiento neoadyuvante con imatinib induce cambios citológicos e histológicos marcados (degeneración mixoide, hialinización y reducción drástica de figuras mitóticas). El recuento mitótico tras TKI no refleja con exactitud el riesgo biológico basal."
          },
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "wedge_resection",
                "label": "Gastrectomía en cuña (resección gástrica no anatómica)"
              },
              {
                "value": "subtotal_gastrectomy",
                "label": "Gastrectomía subtotal / distal"
              },
              {
                "value": "total_gastrectomy",
                "label": "Gastrectomía total"
              },
              {
                "value": "enucleation",
                "label": "Enucleación local"
              },
              {
                "value": "segmental_bowel",
                "label": "Resección segmentaria de intestino delgado / colon"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "A diferencia del adenocarcinoma, los GIST raramente dan metástasis a ganglios linfáticos regionales (<1-2%), por lo que la resección en cuña R0 con márgenes libres sin linfadenectomía formal suele ser suficiente."
          }
        ]
      },
      {
        "name": "CARACTERÍSTICAS DEL TUMOR Y MORFOLOGÍA",
        "fields": [
          {
            "id": "tumor_focality",
            "label": "Focalidad Tumoral",
            "type": "radio",
            "options": [
              {
                "value": "unifocal",
                "label": "Unifocal (tumor único)"
              },
              {
                "value": "multifocal",
                "label": "Multifocal (múltiples nódulos tumorales sincrónicos - especificar número y tamaños)",
                "hasInput": true
              }
            ],
            "helpText": "La multifocalidad en el estómago puede indicar GIST primario múltiple (asociado a mutaciones germinales en KIT o deficiencia en SDH) o implantes metastásicos peritoneales sincrónicos."
          },
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico del Tumor Primario",
            "type": "select",
            "options": [
              {
                "value": "stomach",
                "label": "Estómago (fondo, cuerpo, antro)"
              },
              {
                "value": "duodenum",
                "label": "Duodeno"
              },
              {
                "value": "jejunum",
                "label": "Yeyuno"
              },
              {
                "value": "ileum",
                "label": "Íleon"
              },
              {
                "value": "colon",
                "label": "Colon"
              },
              {
                "value": "rectum",
                "label": "Recto"
              },
              {
                "value": "omentum_mesentery",
                "label": "Epiplón / Mesenterio / Peritoneo (GIST extraintestinal / EGIST)"
              },
              {
                "value": "other",
                "label": "Otro sitio anatómico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota A del CAP): El sitio anatómico es un factor determinante en la estratificación de riesgo de Miettinen/AFIP: a igual tamaño e índice mitótico, los GIST gástricos tienen un pronóstico SIGNIFICATIVAMENTE más favorable que los GIST de intestino delgado, colon o recto."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico Celular",
            "type": "radio",
            "options": [
              {
                "value": "spindle_cell",
                "label": "Fusocelular (70%: fascículos o verticilos de células fusiformes con núcleos alargados y extremos romos)"
              },
              {
                "value": "epitheloid",
                "label": "Epitelioide (20%: células poligonales o redondeadas en nidos/sábanas con citoplasma eosinófilo o claro)"
              },
              {
                "value": "mixed",
                "label": "Mixto fusocelular y epitelioide (10%)"
              }
            ],
            "helpText": "El tipo fusocelular es el más común (70%), mientras que el tipo epitelioide (20%) predomina en GIST con mutaciones en PDGFRA (D842V) y en GIST deficientes en complejo SDH (succinato deshidrogenasa)."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "(Nota D del CAP): Parámetro crítico de la clasificación de riesgo de Miettinen y de la estadificación pT: <= 2.0 cm, > 2.0 a 5.0 cm, > 5.0 a 10.0 cm, > 10.0 cm."
          },
          {
            "id": "mitotic_count_5mm2",
            "label": "Conteo Mitótico Exacto por 5 mm² de Tumor",
            "type": "number",
            "helpText": "(Nota B del CAP): Estandarización de 5 mm²: En microscopios antiguos, 5 mm² equivalían a 50 campos de gran aumento (HPF) con ocular de campo visual FN 18-20 mm. En microscopios modernos con oculares de gran campo (FN 22 mm), 5 mm² se abarcan en aproximadamente 20 a 25 campos de gran aumento (40x). Se debe contar en la zona de mayor densidad mitótica (hotspot)."
          },
          {
            "id": "mitotic_rate",
            "label": "Tasa Mitótica (Punto de Corte de Riesgo)",
            "type": "radio",
            "options": [
              {
                "value": "low_lte_5",
                "label": "Tasa mitótica baja: Menor o igual a 5 mitosis por 5 mm² (<= 5 / 5 mm²)"
              },
              {
                "value": "high_gt_5",
                "label": "Tasa mitótica alta: Mayor a 5 mitosis por 5 mm² (> 5 / 5 mm²)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota B del CAP): Punto de corte crucial (>5 mitosis por 5 mm²) que divide los tumores en bajo versus alto grado histológico y define el grupo de riesgo para progresión metastásica."
          },
          {
            "id": "necrosis",
            "label": "Necrosis Tumoral",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente (especificar porcentaje aproximado)",
                "hasInput": true
              }
            ],
            "helpText": "La necrosis tumoral espontánea extensa (no debida a tratamiento) es un marcador de alta agresividad biológica en GIST."
          },
          {
            "id": "tumor_rupture",
            "label": "Rotura Tumoral (Espontánea o Quirúrgica)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada (pseudocápsula intacta)"
              },
              {
                "value": "present",
                "label": "PRESENTE (perforación de la cápsula tumoral, derrame intraabdominal o fractura de la masa)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Factor de impacto catastrófico: La rotura tumoral (sea preoperatoria o por maniobras quirúrgicas) derrama células tumorales en la cavidad peritoneal e implica un riesgo de recurrencia peritoneal cercano al 100%. Clasifica al paciente AUTOMÁTICAMENTE en el grupo de RIESGO MUY ALTO independientemente del tamaño tumoral o del número de mitosis, requiriendo terapia adyuvante indefinida con imatinib."
          }
        ]
      },
      {
        "name": "ESTRATIFICACIÓN DE RIESGO Y CLASIFICACIÓN pTNM",
        "fields": [
          {
            "id": "risk_stratification_afip",
            "label": "Estratificación de Riesgo de Recurrencia / Progresión (Criterios de Miettinen / AFIP)",
            "type": "select",
            "options": [
              {
                "value": "none_very_low",
                "label": "Ninguno / Riesgo Muy Bajo (ej: gástrico <=2 cm con <=5 mitosis/5 mm²)"
              },
              {
                "value": "low",
                "label": "Riesgo Bajo (ej: gástrico 2.1 a 5 cm con <=5 mitosis/5 mm²)"
              },
              {
                "value": "moderate",
                "label": "Riesgo Moderado (ej: gástrico 5.1 a 10 cm con <=5 mitosis/5 mm²)"
              },
              {
                "value": "high",
                "label": "Riesgo Alto (ej: gástrico >10 cm o >5 mitosis/5 mm², o cualquier tamaño con rotura tumoral)"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado"
              }
            ],
            "helpText": "(Nota D del CAP): Tabla pronóstica de Miettinen y Lasota (AFIP). Para tumores gástricos: <=2 cm y <=5 mit = Riesgo nulo/muy bajo; 2.1-5 cm y <=5 mit = Bajo (1.9%); 5.1-10 cm y <=5 mit = Moderado (3.6%); >10 cm y <=5 mit = Alto (12%). Si las mitosis superan 5/5 mm²: <=2 cm = Ninguno (0%); 2.1-5 cm = Alto (16%); 5.1-10 cm = Alto (55%); >10 cm = Alto (86%)."
          },
          {
            "id": "pt_category",
            "label": "Tumor Primario (pT - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: El tumor primario no puede ser evaluado"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin evidencia de tumor primario"
              },
              {
                "value": "pt1",
                "label": "pT1: Tumor de 2.0 cm o menos en su mayor dimensión (<= 2 cm)"
              },
              {
                "value": "pt2",
                "label": "pT2: Tumor mayor de 2.0 cm pero no mayor de 5.0 cm (> 2 a 5 cm)"
              },
              {
                "value": "pt3",
                "label": "pT3: Tumor mayor de 5.0 cm pero no mayor de 10.0 cm (> 5 a 10 cm)"
              },
              {
                "value": "pt4",
                "label": "pT4: Tumor mayor de 10.0 cm en su mayor dimensión (> 10 cm)"
              }
            ],
            "helpText": "(Nota F del CAP): La estadificación pT para GIST depende exclusivamente de la mayor dimensión del tumor primario medida macroscópica y microscópicamente."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "radio",
            "options": [
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis ganglionares regionales (o ganglios no resecados clínicamente negativos)"
              },
              {
                "value": "pn1",
                "label": "pN1: Metástasis en ganglios linfáticos regionales presente"
              },
              {
                "value": "pnx",
                "label": "pNX: No evaluable"
              }
            ],
            "helpText": "(Nota E del CAP): Las metástasis ganglionares son extraordinariamente raras en GIST adultos (<1%). Si no se identifican ganglios macroscópicos en el espécimen de resección y clínicamente no hubo sospecha, el caso se asigna por convención a pN0 en lugar de pNX."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (sin confirmación patológica de metástasis a distancia)"
              },
              {
                "value": "pm1",
                "label": "pM1: Metástasis a distancia presente (sitios más frecuentes: hígado, epiplón y peritoneo)"
              }
            ],
            "helpText": "Los sitios predominantes de diseminación metastásica en GIST son el hígado (vía hematógena portal) y la cavidad peritoneal."
          }
        ]
      },
      {
        "name": "MÁRGENES DE RESECCIÓN QUIRÚRGICA",
        "fields": [
          {
            "id": "margin_status",
            "label": "Estado de los Márgenes Quirúrgicos de Resección",
            "type": "radio",
            "options": [
              {
                "value": "r0",
                "label": "R0: Márgenes libres de tumor (márgenes microscópicos no comprometidos, especificar distancia)",
                "hasInput": true
              },
              {
                "value": "r1",
                "label": "R1: Margen microscópicamente comprometido por tumor en la superficie entintada de sección quirúrgica"
              },
              {
                "value": "r2",
                "label": "R2: Margen macroscópicamente comprometido (enfermedad residual macroscópica)"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "La resección completa R0 sin romper la pseudocápsula es el objetivo quirúrgico curativo primordial."
          }
        ]
      },
      {
        "name": "INMUNOHISTOQUÍMICA Y GENÉTICA MOLECULAR",
        "fields": [
          {
            "id": "cd117_kit",
            "label": "Inmunohistoquímica KIT (CD117)",
            "type": "radio",
            "options": [
              {
                "value": "positive_diffuse",
                "label": "POSITIVO fuerte y difuso (citoplasmático / membranoso / perinuclear dot-like) (>95% de GIST)"
              },
              {
                "value": "positive_focal",
                "label": "Positivo focal"
              },
              {
                "value": "negative",
                "label": "Negativo (<5% de casos, típicamente GIST mutados en PDGFRA o deficientes en SDH)"
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "(Nota G del CAP): CD117 es el marcador diagnóstico patognomónico clásico del GIST. Tinción citoplasmática difusa con refuerzo perinuclear."
          },
          {
            "id": "dog1_ano1",
            "label": "Inmunohistoquímica DOG1 (Discovered on GIST-1 / Anoctamina 1)",
            "type": "radio",
            "options": [
              {
                "value": "positive",
                "label": "POSITIVO (membranoso y citoplasmático)"
              },
              {
                "value": "negative",
                "label": "Negativo"
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "(Nota G del CAP): Marcador altamente sensible y específico, especialmente útil para diagnosticar GIST CD117-negativos con mutaciones en PDGFRA o deficientes en KIT."
          },
          {
            "id": "sdhb_ihc",
            "label": "Inmunohistoquímica SDHB (Subunidad B de Succinato Deshidrogenasa)",
            "type": "radio",
            "options": [
              {
                "value": "intact",
                "label": "Expresión granular citoplasmática conservada (GIST no deficiente en complejo SDH)"
              },
              {
                "value": "loss_deficient",
                "label": "PÉRDIDA de expresión (GIST deficiente en SDH / síndrome de Carney / Carney-Stratakis)"
              },
              {
                "value": "not_performed",
                "label": "No realizado"
              }
            ],
            "helpText": "La pérdida de expresión mitocondrial de SDHB identifica los GIST deficientes en el complejo SDH, típicos de pacientes jóvenes y niños con tumores gástricos multifocales epitelioides."
          },
          {
            "id": "mutation_analysis",
            "label": "Análisis Mutacional por Secuenciación (KIT y PDGFRA)",
            "type": "text",
            "helpText": "(Nota G del CAP): Mutaciones en KIT (exón 11 [más común, excelente respuesta a imatinib], exón 9 [requiere dosis doble de 800 mg de imatinib], exones 13 y 17). Mutación PDGFRA exón 18 D842V confiere resistencia primaria completa a imatinib, respondiendo a avapritinib."
          }
        ]
      }
    ],
    "organ": "GIST",
    "subtitle": "CAP v4.3.0.0 / AJCC 8va Edición (GIST Resección)"
  },
  "stomach_gist_biopsy": {
    "id": "stomach_gist_biopsy",
    "title": "Protocolo Sinóptico: Tumor del Estroma Gastrointestinal - GIST (Biopsia) - CAP v4.3.0.0",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "INFORMACIÓN CLÍNICA Y ESPÉCIMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento de Obtención de la Biopsia",
            "type": "radio",
            "options": [
              {
                "value": "endoscopic_core",
                "label": "Biopsia endoscópica con aguja gruesa guiada por USE (EUS-FNB)"
              },
              {
                "value": "endoscopic_forceps",
                "label": "Biopsia endoscópica con pinza (fórceps)"
              },
              {
                "value": "percutaneous_core",
                "label": "Biopsia percutánea con aguja gruesa (core needle biopsy)"
              },
              {
                "value": "laparoscopic_incisional",
                "label": "Biopsia incisional laparoscópica"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "En lesiones subepiteliales gástricas, la punción-biopsia guiada por ultrasonografía endoscópica (EUS-FNB) con aguja de corte histológico ofrece el mayor rendimiento diagnóstico para obtener cilindros tisulares evaluables."
          },
          {
            "id": "preresection_treatment",
            "label": "Tratamiento Previo con TKI (Imatinib u otros)",
            "type": "radio",
            "options": [
              {
                "value": "none",
                "label": "Sin tratamiento previo conocido"
              },
              {
                "value": "imatinib",
                "label": "Recibiendo imatinib"
              },
              {
                "value": "other",
                "label": "Otro agente TKI (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "El tratamiento con imatinib induce cambios mixoides y arresto de figuras mitóticas."
          }
        ]
      },
      {
        "name": "EVALUACIÓN HISTOLÓGICA DE LA BIOPSIA",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico de la Lesión",
            "type": "select",
            "options": [
              {
                "value": "stomach",
                "label": "Estómago"
              },
              {
                "value": "duodenum",
                "label": "Duodeno"
              },
              {
                "value": "jejunum_ileum",
                "label": "Yeyuno / Íleon"
              },
              {
                "value": "colon_rectum",
                "label": "Colon / Recto"
              },
              {
                "value": "other",
                "label": "Otro sitio anatómico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "Localización anatómica comunicada por el endoscopista o radiólogo."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico Celular",
            "type": "radio",
            "options": [
              {
                "value": "spindle_cell",
                "label": "Fusocelular (células fusiformes con núcleos elongados)"
              },
              {
                "value": "epitheloid",
                "label": "Epitelioide (células redondeadas poligonales)"
              },
              {
                "value": "mixed",
                "label": "Mixto fusocelular y epitelioide"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar por material escaso"
              }
            ],
            "helpText": "Morfología celular observada en los cortes histológicos de la biopsia."
          },
          {
            "id": "mitotic_rate",
            "label": "Tasa Mitótica en el Material de Biopsia",
            "type": "radio",
            "options": [
              {
                "value": "low_lte_5",
                "label": "Baja: Menor o igual a 5 mitosis por 5 mm² (<=5/5 mm² en cilindro tisular representativo)"
              },
              {
                "value": "high_gt_5",
                "label": "Alta: Mayor a 5 mitosis por 5 mm² (>5/5 mm²)"
              },
              {
                "value": "inadequate_sample",
                "label": "Material de biopsia insuficiente para abarcar 5 mm² de tumor viable"
              }
            ],
            "helpText": "(Nota B del CAP): Alerta diagnóstica en biopsias: Debido al tamaño limitado de los cilindros de biopsia (que a menudo miden menos de 5 mm² de área total), el recuento mitótico puede subestimar el riesgo biológico real de la neoplasia."
          },
          {
            "id": "necrosis",
            "label": "Necrosis",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              }
            ],
            "helpText": "Presencia de necrosis focal o confluente en los fragmentos de la biopsia."
          }
        ]
      },
      {
        "name": "INMUNOHISTOQUÍMICA Y ESTUDIOS MOLECULARES",
        "fields": [
          {
            "id": "cd117_kit",
            "label": "KIT (CD117) por Inmunohistoquímica",
            "type": "radio",
            "options": [
              {
                "value": "positive",
                "label": "POSITIVO (tinción citoplasmática/membranosa difusa)"
              },
              {
                "value": "negative",
                "label": "Negativo"
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "Confirmación diagnóstica primaria esencial para confirmar diagnóstico de GIST en biopsias pequeñas."
          },
          {
            "id": "dog1_ano1",
            "label": "DOG1 (Anoctamina 1) por Inmunohistoquímica",
            "type": "radio",
            "options": [
              {
                "value": "positive",
                "label": "POSITIVO"
              },
              {
                "value": "negative",
                "label": "Negativo"
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "Complemento diagnóstico para descartar falsos negativos de CD117."
          },
          {
            "id": "molecular_testing",
            "label": "Estudio Mutacional Solicitado (KIT / PDGFRA)",
            "type": "text",
            "helpText": "Recomendado antes de iniciar terapia neoadyuvante con imatinib para confirmar susceptibilidad molecular (ej: descartar mutación de resistencia primaria PDGFRA D842V)."
          }
        ]
      }
    ],
    "organ": "GIST",
    "subtitle": "CAP v4.3.0.0 (GIST Biopsia / Punción USE-FNB)"
  },
  "esophagus_resection": {
    "id": "esophagus_resection",
    "title": "Protocolo Sinóptico: Esófago y Unión Esofagogástrica (Resección) - CAP v4.2.0.1 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "esophagectomy_transthoracic",
                "label": "Esofaguectomía transtorácica (Ivor Lewis / McKeown en 3 campos)"
              },
              {
                "value": "esophagectomy_transhiatal",
                "label": "Esofaguectomía transhiatal"
              },
              {
                "value": "esophagogastrectomy",
                "label": "Esofagogastrectomía distal"
              },
              {
                "value": "emr_esd",
                "label": "Resección mucosa endoscópica (EMR / ESD)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "(Nota A del CAP): Describe el tipo de intervención quirúrgica. La esofaguectomía transtorácica permite una linfadenectomía mediastínica y celíaca más amplia que el abordaje transhiatal."
          }
        ]
      },
      {
        "name": "TUMOR Y SITIO ANATÓMICO",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico del Tumor (seleccionar todos los que apliquen)",
            "type": "checkbox",
            "options": [
              {
                "value": "cervical",
                "label": "Esófago cervical (15 a <20 cm de arcada dental)"
              },
              {
                "value": "upper_thoracic",
                "label": "Esófago torácico superior (20 a <25 cm de arcada dental)"
              },
              {
                "value": "mid_thoracic",
                "label": "Esófago torácico medio (25 a <30 cm de arcada dental)"
              },
              {
                "value": "lower_thoracic",
                "label": "Esófago torácico inferior (30 a 40 cm de arcada dental)"
              },
              {
                "value": "egj",
                "label": "Unión esofagogástrica (UEG)"
              },
              {
                "value": "esophagus_nos",
                "label": "Esófago, no especificado"
              }
            ],
            "helpText": "(Nota B del CAP): La localización anatómica es determinante: los carcinomas de células escamosas predominan en el tercio medio y superior (asociados a tabaco y alcohol), mientras que los adenocarcinomas se concentran en el tercio inferior y UEG (asociados a reflujo gastroesofágico y esófago de Barrett)."
          },
          {
            "id": "egj_relationship",
            "label": "Relación del Tumor con la Unión Esofagogástrica (UEG)",
            "type": "radio",
            "options": [
              {
                "value": "entirely_esophagus",
                "label": "El tumor se encuentra enteramente en el esófago tubular sin comprometer la UEG"
              },
              {
                "value": "epicenter_esophagus_invades_egj",
                "label": "El punto medio (epicentro) del tumor está en el esófago distal Y cruza/compromete la UEG"
              },
              {
                "value": "epicenter_at_egj",
                "label": "El epicentro del tumor se encuentra exactamente en la UEG"
              },
              {
                "value": "epicenter_stomach_lte_2cm",
                "label": "El epicentro del tumor está a 2.0 cm o menos en el estómago proximal/cardias Y compromete la UEG"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota B del CAP): Regla AJCC 8va Edición: Un tumor cuyo epicentro se encuentra dentro de los 2 cm proximales del estómago (cardias) e involucra la UEG se clasifica y estadifica como CÁNCER DE ESÓFAGO. Si el epicentro dista más de 2 cm de la UEG hacia el estómago, se estadifica como CÁNCER GÁSTRICO."
          },
          {
            "id": "egj_distance_cm",
            "label": "Distancia del Centro del Tumor a la UEG (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Medición en centímetros desde el centro geométrico del tumor hasta la unión esofagogástrica."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico (OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "adenocarcinoma",
                "label": "Adenocarcinoma (frecuentemente sobre esófago de Barrett)"
              },
              {
                "value": "squamous_cell",
                "label": "Carcinoma de células escamosas convencional (queratinizante o no queratinizante)"
              },
              {
                "value": "basaloid_squamous",
                "label": "Carcinoma de células escamosas basaloide"
              },
              {
                "value": "spindle_squamous",
                "label": "Carcinoma de células escamosas de células fusiformes (sarcomatoide)"
              },
              {
                "value": "verrucous_squamous",
                "label": "Carcinoma de células escamosas verrugoso"
              },
              {
                "value": "adenosquamous",
                "label": "Carcinoma adenoescamoso"
              },
              {
                "value": "adenoid_cystic",
                "label": "Carcinoma adenoide quístico"
              },
              {
                "value": "mucoepidermoid",
                "label": "Carcinoma mucoepidermoide"
              },
              {
                "value": "neuroendocrine_large",
                "label": "Carcinoma neuroendocrino de células grandes"
              },
              {
                "value": "neuroendocrine_small",
                "label": "Carcinoma neuroendocrino de células pequeñas"
              },
              {
                "value": "undifferentiated",
                "label": "Carcinoma indiferenciado"
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota C del CAP): El adenocarcinoma y el carcinoma de células escamosas tienen tablas de estadificación anatómica/pronóstica diferentes en la 8va edición del AJCC. El adenocarcinoma se origina típicamente sobre metaplasia columnar con células caliciformes (esófago de Barrett)."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico (Diferenciación)",
            "type": "radio",
            "options": [
              {
                "value": "g1",
                "label": "G1: Bien diferenciado"
              },
              {
                "value": "g2",
                "label": "G2: Moderadamente diferenciado"
              },
              {
                "value": "g3",
                "label": "G3: Pobremente diferenciado / indiferenciado"
              },
              {
                "value": "gx",
                "label": "GX: No puede ser evaluado"
              }
            ],
            "helpText": "(Nota D del CAP): En el carcinoma de células escamosas, el grado histológico (G1 vs G2/G3) forma parte integral del agrupamiento de estadios pronósticos del AJCC 8va edición."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Mayor longitud tumoral en sentido longitudinal o circunferencial."
          },
          {
            "id": "barrett_esophagus",
            "label": "Esófago de Barrett Asociado",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificado"
              },
              {
                "value": "present_no_dysplasia",
                "label": "Presente sin displasia en mucosa adyacente"
              },
              {
                "value": "present_low_dysplasia",
                "label": "Presente con displasia de bajo grado"
              },
              {
                "value": "present_high_dysplasia",
                "label": "Presente con displasia de alto grado"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar por tratamiento neoadyuvante previo"
              }
            ],
            "helpText": "Presencia de mucosa columnar de tipo intestinal especializada (células caliciformes teñidas con azul alcian) en la mucosa esofágica tubular peritumoral."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
        "fields": [
          {
            "id": "pt_category",
            "label": "Tumor Primario (pT - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: No puede ser evaluado"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin evidencia de tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Displasia de alto grado (carcinoma in situ / no invasivo)"
              },
              {
                "value": "pt1a",
                "label": "pT1a: El tumor invade la lámina propia o la muscularis mucosae"
              },
              {
                "value": "pt1b",
                "label": "pT1b: El tumor invade la submucosa"
              },
              {
                "value": "pt2",
                "label": "pT2: El tumor invade la muscular propia"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor invade la adventicia esofágica"
              },
              {
                "value": "pt4a",
                "label": "pT4a: El tumor invade estructuras adyacentes resecables (pleura, pericardio, diafragma, vena ácigos, peritoneo)"
              },
              {
                "value": "pt4b",
                "label": "pT4b: El tumor invade estructuras adyacentes irresecables (aorta, cuerpo vertebral, tráquea)"
              }
            ],
            "helpText": "(Nota E del CAP): El esófago carece de cubierta serosa en la mayor parte de su trayecto torácico; la capa externa es una adventicia laxa de tejido conectivo. La invasión de la adventicia corresponde a pT3. La extensión a estructuras contiguas se divide en resecables quirúrgicamente (pT4a) e irresecables que contraindican cirugía curativa (pT4b)."
          },
          {
            "id": "nodes_examined",
            "label": "Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota I del CAP): El AJCC recomienda examinar un MÍNIMO de 15 ganglios linfáticos regionales para una estadificación pN confiable en esofaguectomía."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios Linfáticos con Metástasis",
            "type": "number",
            "helpText": "Número total de ganglios con depósito metastásico de carcinoma."
          },
          {
            "id": "extranodal_extension",
            "label": "Extensión Extranodal (ENE)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado"
              }
            ],
            "helpText": "Infiltración tumoral que atraviesa la cápsula del ganglio hacia el tejido adiposo mediastínico o perigástrico."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pnx",
                "label": "pNX: No pueden ser evaluados"
              },
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis en ganglios linfáticos regionales"
              },
              {
                "value": "pn1",
                "label": "pN1: Metástasis en 1 a 2 ganglios linfáticos regionales"
              },
              {
                "value": "pn2",
                "label": "pN2: Metástasis en 3 a 6 ganglios linfáticos regionales"
              },
              {
                "value": "pn3",
                "label": "pN3: Metástasis en 7 o más ganglios linfáticos regionales"
              }
            ],
            "helpText": "Clasificación pN numérica estandarizada común tanto para adenocarcinoma como para carcinoma escamoso."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable"
              },
              {
                "value": "pm1",
                "label": "pM1: Metástasis a distancia presente (pulmón, hígado, ganglios no regionales [supraclaviculares en tumores distales])"
              }
            ],
            "helpText": "Compromiso de órganos a distancia o ganglios linfáticos fuera del territorio de drenaje regional."
          }
        ]
      },
      {
        "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_proximal",
            "label": "Margen Quirúrgico Proximal (Esofágico)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota G del CAP): Margen tubular esofágico proximal."
          },
          {
            "id": "margin_distal",
            "label": "Margen Quirúrgico Distal (Gástrico)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota G del CAP): Margen tubular gástrico distal."
          },
          {
            "id": "margin_crm_adventitial",
            "label": "Margen Adventicial / Circunferencial (CRM)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved_gt_1mm",
                "label": "No comprometido: Carcinoma a más de 1.0 mm de la tinta adventicial (especificar distancia en mm)",
                "hasInput": true
              },
              {
                "value": "involved_lte_1mm",
                "label": "COMPROMETIDO: Carcinoma a 1.0 mm o menos (<=1.0 mm) de la superficie adventicial entintada",
                "hasInput": true
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): Al igual que en recto, el margen circunferencial adventicial (CRM) del esófago se considera POSITIVO si las células cancerosas distan <= 1.0 mm de la tinta externa. Un CRM positivo es un predictor crítico de recurrencia mediastínica local precoz."
          }
        ]
      },
      {
        "name": "INVASIONES, RESPUESTA AL TRATAMIENTO Y BIOMARCADORES",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfovascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Presencia de embolias en vasos linfáticos o venosos."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Infiltración del espacio perineural."
          },
          {
            "id": "treatment_effect",
            "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan)",
            "type": "radio",
            "options": [
              {
                "value": "no_therapy",
                "label": "Sin terapia neoadyuvante conocida"
              },
              {
                "value": "score_0",
                "label": "Score 0 (Respuesta completa: ausencia de células neoplásicas viables, pCR)"
              },
              {
                "value": "score_1",
                "label": "Score 1 (Respuesta moderada: células tumorales residuales escasas aisladas)"
              },
              {
                "value": "score_2",
                "label": "Score 2 (Respuesta mínima: cáncer residual evidente con fibrosis desmoplásica)"
              },
              {
                "value": "score_3",
                "label": "Score 3 (Pobre o nula respuesta: extenso cáncer residual)"
              }
            ],
            "helpText": "(Nota F del CAP): La respuesta patológica completa (Score 0) tras quimiorradioterapia neoadyuvante según protocolo CROSS triplica la sobrevida a 5 años tanto en adenocarcinoma como en carcinoma escamoso."
          },
          {
            "id": "her2_ihc",
            "label": "Estado de HER2 por IHQ (Relevante en Adenocarcinoma de Esófago distal / UEG)",
            "type": "radio",
            "options": [
              {
                "value": "score_0",
                "label": "Score 0 (Negativo)"
              },
              {
                "value": "score_1",
                "label": "Score 1+ (Negativo)"
              },
              {
                "value": "score_2",
                "label": "Score 2+ (Equívoco: requiere FISH)",
                "hasInput": true
              },
              {
                "value": "score_3",
                "label": "Score 3+ (POSITIVO: tinción basolateral intensa en U)"
              },
              {
                "value": "na_squamous",
                "label": "No aplicable (Carcinoma de células escamosas)"
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "Evaluación con criterios de Hofman para seleccionar tratamiento con trastuzumab en adenocarcinomas de esófago distal y UEG."
          },
          {
            "id": "pdl1_cps",
            "label": "PD-L1 Combined Positive Score (CPS) / Tumor Proportion Score (TPS)",
            "type": "number",
            "helpText": "En carcinoma epidermoide de esófago (TPS >= 1% o CPS >= 10) y en adenocarcinoma de la UEG (CPS >= 5 o >= 10), predice respuesta favorable a inhibidores de PD-1 (Pembrolizumab o Nivolumab)."
          }
        ]
      }
    ],
    "organ": "Esófago y UEG",
    "subtitle": "CAP v4.2.0.1 / AJCC 8va Edición (Esofaguectomía / UEG)"
  },
  "gallbladder_resection": {
    "id": "gallbladder_resection",
    "title": "Protocolo Sinóptico: Vesícula Biliar (Resección) - CAP v4.3.0.0 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "cholecystectomy_simple",
                "label": "Colecistectomía simple (laparoscópica o abierta)"
              },
              {
                "value": "cholecystectomy_radical",
                "label": "Colecistectomía radical / extendida (con resección de lecho hepático [segmentos IVb/V] y linfadenectomía portal)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "(Nota A del CAP): Cáncer incidental de vesícula biliar: Es común que el carcinoma sea un hallazgo histopatológico insospechado tras una colecistectomía rutinaria por litiasis. En estadios >= pT1b o pT2, la colecistectomía simple es insuficiente y amerita reoperación oncológica radical con resección en cuña del lecho hepático y linfadenectomía del ligamento hepatoduodenal."
          }
        ]
      },
      {
        "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico y Superficie Vesicular Afectada",
            "type": "radio",
            "options": [
              {
                "value": "peritoneal_side",
                "label": "Superficie peritoneal libre (fondo, cuerpo o cuello ventral cubierto por serosa peritoneal)"
              },
              {
                "value": "hepatic_side",
                "label": "Superficie hepática no peritonealizada (lecho vesicular íntimamente adosado al hígado)"
              },
              {
                "value": "both_circumferential",
                "label": "Ambas superficies (compromiso circunferencial / difuso)"
              },
              {
                "value": "cystic_duct",
                "label": "Conducto cístico"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado (pieza abierta sin orientación anatómica)"
              }
            ],
            "helpText": "(Nota A y I del CAP): Distinción pronóstica fundamental: La vesícula carece de serosa en su lecho hepático y se adosa directamente al parénquima por una capa laxa de tejido conectivo perimuscular rica en venas que drenan al hígado. Los tumores del lado hepático tienen acceso directo precoz al parénquima hepático y peor pronóstico que los del lado peritoneal."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico (OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "adenocarcinoma_biliary",
                "label": "Adenocarcinoma, tipo biliar (convencional)"
              },
              {
                "value": "adenocarcinoma_intestinal",
                "label": "Adenocarcinoma, tipo intestinal"
              },
              {
                "value": "adenocarcinoma_foveolar",
                "label": "Adenocarcinoma, tipo foveolar (gástrico)"
              },
              {
                "value": "mucinous",
                "label": "Adenocarcinoma mucinoso (>50% de mucina)"
              },
              {
                "value": "clear_cell",
                "label": "Adenocarcinoma de células claras"
              },
              {
                "value": "signet_ring",
                "label": "Carcinoma de células en anillo de sello / pobremente cohesivo"
              },
              {
                "value": "icpn_invasive",
                "label": "Neoplasia papilar intravesicular (ICPN) con carcinoma invasor asociado"
              },
              {
                "value": "adenosquamous",
                "label": "Carcinoma adenoescamoso"
              },
              {
                "value": "squamous_cell",
                "label": "Carcinoma de células escamosas"
              },
              {
                "value": "large_cell_ne",
                "label": "Carcinoma neuroendocrino de células grandes"
              },
              {
                "value": "small_cell_ne",
                "label": "Carcinoma neuroendocrino de células pequeñas"
              },
              {
                "value": "undifferentiated",
                "label": "Carcinoma indiferenciado"
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota B del CAP): El adenocarcinoma tipo biliar es el más frecuente. La neoplasia papilar intravesicular (ICPN) es una lesión precursora adenomatosa que forma masas exofíticas intraluminales con mejor pronóstico general, debiendo consignarse el porcentaje y profundidad del componente invasor destructivo."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico",
            "type": "radio",
            "options": [
              {
                "value": "g1",
                "label": "G1: Bien diferenciado (>95% de formación glandular)"
              },
              {
                "value": "g2",
                "label": "G2: Moderadamente diferenciado (50% a 95% de formación glandular)"
              },
              {
                "value": "g3",
                "label": "G3: Pobremente diferenciado (<50% de formación glandular)"
              },
              {
                "value": "gx",
                "label": "GX: No puede ser evaluado"
              }
            ],
            "helpText": "(Nota C del CAP): El grado pobremente diferenciado se asocia fuertemente a invasión vascular, perineural y metástasis a distancia."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor Invasor (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "(Nota D del CAP): Medida de la mayor dimensión del carcinoma invasor en centímetros."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN PATOLÓGICA (pTNM - AJCC 8va Ed.)",
        "fields": [
          {
            "id": "pt_category",
            "label": "Tumor Primario (pT - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: No puede ser evaluado"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin evidencia de tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Carcinoma in situ (neoplasia intraepitelial biliar de alto grado BilIN-3 o ICPN no invasor)"
              },
              {
                "value": "pt1a",
                "label": "pT1a: El tumor invade la lámina propia"
              },
              {
                "value": "pt1b",
                "label": "pT1b: El tumor invade la capa muscular propia"
              },
              {
                "value": "pt2a",
                "label": "pT2a: El tumor invade el tejido conectivo perimuscular en el LADO PERITONEAL (sin sobrepasar serosa)"
              },
              {
                "value": "pt2b",
                "label": "pT2b: El tumor invade el tejido conectivo perimuscular en el LADO HEPÁTICO (sin invadir el parénquima hepático)"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor perfora la serosa (peritoneo visceral) Y/O invade directamente el hígado o un órgano vecino (estómago, duodeno, colon, páncreas)"
              },
              {
                "value": "pt4",
                "label": "pT4: El tumor invade la vena porta principal o arteria hepática, o invade >=2 órganos extrahepáticos"
              }
            ],
            "helpText": "(Nota I del CAP): Avance crítico de la 8va edición del AJCC: La bifurcación de pT2 en pT2a (lado peritoneal) y pT2b (lado hepático). La sobrevida a 5 años en pT2a es aproximadamente del 65%, mientras que en pT2b cae al 33% debido a la alta tasa de diseminación hematógena microscópica directa hacia los sinusoides hepáticos y afectación ganglionar portal."
          },
          {
            "id": "nodes_examined",
            "label": "Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota I del CAP): El AJCC recomienda examinar un MÍNIMO de 6 ganglios linfáticos regionales (ganglio del conducto cístico, ganglios del colédoco, arteria hepática y vena porta) para una estadificación N certera."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios Linfáticos con Metástasis",
            "type": "number",
            "helpText": "Número de ganglios con metástasis microscópica o macroscópica."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pnx",
                "label": "pNX: No evaluable"
              },
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis en ganglios regionales"
              },
              {
                "value": "pn1",
                "label": "pN1: Metástasis en 1 a 3 ganglios linfáticos regionales"
              },
              {
                "value": "pn2",
                "label": "pN2: Metástasis en 4 o más ganglios linfáticos regionales"
              }
            ],
            "helpText": "En la 8va edición, la categoría N se basa en el recuento numérico (pN1: 1 a 3 ganglios; pN2: >=4 ganglios), reemplazando la antigua clasificación puramente anatómica."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable"
              },
              {
                "value": "pm1",
                "label": "pM1: Metástasis a distancia confirmada (peritoneo, pulmón, ganglios celíacos/paraórticos distantes)"
              }
            ],
            "helpText": "Los ganglios celíacos, mesentéricos superiores o paraórticos se consideran metástasis a distancia (M1)."
          }
        ]
      },
      {
        "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_cystic_duct",
            "label": "Margen de Resección del Conducto Cístico",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm)",
                "hasInput": true
              },
              {
                "value": "involved_carcinoma",
                "label": "COMPROMETIDO por carcinoma invasor"
              },
              {
                "value": "involved_dysplasia",
                "label": "COMPROMETIDO por neoplasia intraepitelial / displasia de alto grado",
                "hasInput": true
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota H del CAP): Margen crítico en la colecistectomía simple. Si el conducto cístico muestra carcinoma o displasia de alto grado en la tinta, existe riesgo inminente de tumor residual en la confluencia con el colédoco, requiriendo resección de la vía biliar principal."
          },
          {
            "id": "margin_liver_bed",
            "label": "Margen del Lecho Hepático / Tejido Fibroadiposo Hepático",
            "type": "radio",
            "options": [
              {
                "value": "na_peritoneal_side",
                "label": "No aplicable (tumor confinado a cara peritoneal)"
              },
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia en mm al lecho entintado)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "COMPROMETIDO por carcinoma invasor"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota H del CAP): Superficie externa de fijación al hígado. Si el lecho está comprometido (R1), se requiere re-resección en cuña del parénquima hepático adyacente."
          }
        ]
      },
      {
        "name": "INVASIONES Y FACTORES ADICIONALES",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfática y/o Vascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota E del CAP): La invasión linfovascular es altamente prevalente en cáncer de vesícula y predice fuertemente micrometástasis hepáticas y ganglionares."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota F del CAP): La rica red autonómica del lecho hepático y ligamento hepatoduodenal favorece la diseminación perineural precoz hacia el tronco celíaco."
          },
          {
            "id": "treatment_effect",
            "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan)",
            "type": "radio",
            "options": [
              {
                "value": "no_therapy",
                "label": "Sin quimioterapia/radioterapia presúrgica"
              },
              {
                "value": "score_0",
                "label": "Score 0: Respuesta completa (sin células tumorales viables)"
              },
              {
                "value": "score_1",
                "label": "Score 1: Respuesta moderada (células tumorales aisladas)"
              },
              {
                "value": "score_2",
                "label": "Score 2: Respuesta mínima (cáncer residual prominente)"
              },
              {
                "value": "score_3",
                "label": "Score 3: Pobre o nula respuesta"
              }
            ],
            "helpText": "(Nota G del CAP): Evaluación del tratamiento presúrgico."
          }
        ]
      }
    ],
    "organ": "Vesícula Biliar",
    "subtitle": "CAP v4.3.0.0 / AJCC 8va Edición (Colecistectomía / Lecho Hepático)"
  },
  "appendix_resection": {
    "id": "appendix_resection",
    "title": "Protocolo Sinóptico: Apéndice Cecal (Resección) - CAP v5.1.0.0 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "appendectomy",
                "label": "Apendicectomía (laparoscópica o abierta)"
              },
              {
                "value": "cecectomy",
                "label": "Cequectomía (resección parcial de ciego)"
              },
              {
                "value": "right_hemicolectomy",
                "label": "Hemicolectomía derecha (resección ileocecal formal)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "(Nota A del CAP): Tipo de intervención quirúrgica. En LAMN no complicado con margen cecal libre, la apendicectomía simple suele ser curativa. En adenocarcinoma invasor o adenocarcinoma de células caliciformes (GCA) de alto grado, se requiere hemicolectomía derecha oncológica para linfadenectomía regional."
          }
        ]
      },
      {
        "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico en el Apéndice",
            "type": "checkbox",
            "options": [
              {
                "value": "tip",
                "label": "Punta apendicular"
              },
              {
                "value": "body",
                "label": "Cuerpo / tercio medio"
              },
              {
                "value": "base",
                "label": "Base apendicular"
              },
              {
                "value": "diffuse",
                "label": "Difuso / compromiso de toda la longitud del órgano"
              }
            ],
            "helpText": "(Nota B del CAP): La localización en la base apendicular incrementa el riesgo de margen quirúrgico proximal comprometido e invasión directa del ciego."
          },
          {
            "id": "base_involvement",
            "label": "Compromiso de la Base del Apéndice",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometida (base libre de neoplasia)"
              },
              {
                "value": "involved",
                "label": "COMPROMETIDA por neoplasia / mucina neoplásica"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "El compromiso de la base exige correlación directa con el margen de resección proximal del ciego."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico (OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "lamn",
                "label": "Neoplasia mucinosa apendicular de bajo grado (LAMN)"
              },
              {
                "value": "hamn",
                "label": "Neoplasia mucinosa apendicular de alto grado (HAMN)"
              },
              {
                "value": "mucinous_adenocarcinoma",
                "label": "Adenocarcinoma mucinoso (>50% de mucina con invasión estromal destructiva)"
              },
              {
                "value": "adenocarcinoma_colonic",
                "label": "Adenocarcinoma no mucinoso (tipo colónico convencional)"
              },
              {
                "value": "signet_ring",
                "label": "Carcinoma de células en anillo de sello / pobremente cohesivo"
              },
              {
                "value": "gca_grade_1",
                "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 1 (túbulos uniformes, <25% sólido/anillo de sello)"
              },
              {
                "value": "gca_grade_2",
                "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 2 (25% a 50% de nidos irregulares/anillo de sello)"
              },
              {
                "value": "gca_grade_3",
                "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 3 (>50% de patrón sólido o pleomórfico)"
              },
              {
                "value": "net_g1",
                "label": "Tumor neuroendocrino bien diferenciado (NET G1 / carcinoide)"
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota C del CAP): LAMN se define por epitelio mucinoso con atipia de bajo grado que crece en empuje ('pushing border') con disección de mucina a través de la pared apendicular adelgazada o hialinizada, sin infiltración destructiva estromal. El Adenocarcinoma de Células Caliciformes (GCA) es una neoplasia anfícrina exclusiva del apéndice que se subclasifica en 3 grados (según consenso Tang/OMS) con impacto pronóstico crítico."
          },
          {
            "id": "peritoneal_mucin",
            "label": "Mucina Extra-Apendicular / Peritoneal (Pseudomixoma Peritoneal)",
            "type": "radio",
            "options": [
              {
                "value": "none",
                "label": "No identificada (mucina confinada estrictamente a la luz o pared apendicular)"
              },
              {
                "value": "acellular_serosa",
                "label": "Mucina ACELULAR en serosa apendicular o peritoneo adyacente"
              },
              {
                "value": "cellular_peritoneal",
                "label": "Mucina CELULAR (con células epiteliales viables) en serosa o cavidad peritoneal"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota C y I del CAP): Distinción pronóstica fundamental en neoplasias mucinosas: La presencia de mucina ACELULAR (sin células neoplásicas) en el peritoneo confiere un pronóstico sustancialmente más favorable que la presencia de epitelio neoplásico flotante (mucina CELULAR), la cual define el pseudomixoma peritoneal florido con riesgo elevado de progresión masiva."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico",
            "type": "radio",
            "options": [
              {
                "value": "g1_low",
                "label": "G1: Bajo grado (Bien diferenciado / concordante con LAMN)"
              },
              {
                "value": "g2_mod",
                "label": "G2: Moderadamente diferenciado"
              },
              {
                "value": "g3_high",
                "label": "G3: Alto grado (Pobremente diferenciado / HAMN / células en anillo de sello)"
              },
              {
                "value": "cannot_assess",
                "label": "No aplicable"
              }
            ],
            "helpText": "(Nota D del CAP): El grado histológico del tumor apendicular y del componente peritoneal debe ser concordante. El grado alto en el peritoneo predice una sobrevida significativamente menor tras cirugía citorreductora e HIPEC."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor / Masa Apendicular (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Diámetro mayor del tumor apendicular o del apéndice ectásico con mucocele."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
        "fields": [
          {
            "id": "pt_category_lamn",
            "label": "Categoría pT Específica para LAMN (Neoplasia Mucinosa de Bajo Grado)",
            "type": "select",
            "dependsOn": {
              "field": "histologic_type",
              "value": "lamn"
            },
            "options": [
              {
                "value": "ptis_lamn",
                "label": "pTis(LAMN): LAMN confinado al apéndice (mucina o epitelio que diseca muscular o subserosa pero con serosa peritoneal intacta)"
              },
              {
                "value": "pt3_lamn",
                "label": "pT3: LAMN que invade directamente el mesoapéndice pero sin romper la serosa peritoneal"
              },
              {
                "value": "pt4a_lamn",
                "label": "pT4a: LAMN que penetra la serosa peritoneal visceral (mucina o epitelio neoplásico en la superficie serosa externa)"
              },
              {
                "value": "pt4b_lamn",
                "label": "pT4b: LAMN que invade directamente otros órganos o estructuras adyacentes"
              }
            ],
            "helpText": "(Nota I del CAP): Clasificación exclusiva para LAMN en la 8va edición: Las categorías pT1 y pT2 NO se aplican a LAMN debido a la atrofia parietal y el crecimiento empujante. Si la mucina o el epitelio de bajo grado disecan la pared hasta la subserosa pero la serosa mesotelial externa está intacta, se clasifica como pTis(LAMN). Si la mucina o células rompen la serosa hacia la cavidad libre, se reclasifica como pT4a."
          },
          {
            "id": "pt_category_adenocarcinoma",
            "label": "Categoría pT para Adenocarcinoma Convencional y GCA",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: No evaluable"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Carcinoma in situ (intramucoso)"
              },
              {
                "value": "pt1",
                "label": "pT1: El tumor invade la submucosa"
              },
              {
                "value": "pt2",
                "label": "pT2: El tumor invade la muscular propia"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor invade la subserosa o el mesoapéndice"
              },
              {
                "value": "pt4a",
                "label": "pT4a: El tumor penetra la superficie del peritoneo visceral (serosa)"
              },
              {
                "value": "pt4b",
                "label": "pT4b: El tumor invade directamente otros órganos contiguos (ciego, íleon, pared abdominal)"
              }
            ],
            "helpText": "Estadificación convencional AJCC para carcinomas invasivos destructivos."
          },
          {
            "id": "nodes_examined",
            "label": "Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota I del CAP): Mínimo recomendado de 12 ganglios en caso de hemicolectomía derecha. En apendicectomía aislada habitualmente se evalúan solo ganglios del mesoapéndice (0 a 3)."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios con Metástasis",
            "type": "number",
            "helpText": "Número de ganglios metastásicos."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis ganglionares"
              },
              {
                "value": "pn1a",
                "label": "pN1a: Metástasis en 1 ganglio regional"
              },
              {
                "value": "pn1b",
                "label": "pN1b: Metástasis en 2 a 3 ganglios regionales"
              },
              {
                "value": "pn1c",
                "label": "pN1c: Depósitos tumorales en mesoapéndice sin metástasis ganglionares"
              },
              {
                "value": "pn2",
                "label": "pN2: Metástasis en 4 o más ganglios regionales"
              },
              {
                "value": "pnx",
                "label": "pNX: No evaluable"
              }
            ],
            "helpText": "Clasificación ganglionar según AJCC 8va edición."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - Subclasificación Peritoneal AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (sin diseminación confirmada)"
              },
              {
                "value": "pm1a",
                "label": "pM1a: Diseminación intraperitoneal de MUCINA ACELULAR exclusivamente"
              },
              {
                "value": "pm1b",
                "label": "pM1b: Metástasis peritoneal con CÉLULAS EPITELIALES de bajo grado (LAMN / G1)"
              },
              {
                "value": "pm1c",
                "label": "pM1c: Metástasis peritoneal de ALTO GRADO (con células en anillo de sello o adenocarcinoma G2/G3), o metástasis a distancia extraperitoneal"
              }
            ],
            "helpText": "(Nota I del CAP): Subclasificación pronóstica revolucionaria en el apéndice: pM1a (mucina acelular) tiene una excelente supervivencia (>85% a 5 años); pM1b (células epiteliales de bajo grado) tiene pronóstico intermedio tras peritonectomía e HIPEC; pM1c (células de alto grado/anillo de sello) tiene mal pronóstico."
          }
        ]
      },
      {
        "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_proximal_cecal",
            "label": "Margen Proximal de Resección (Base Apendicular / Cecal)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm)",
                "hasInput": true
              },
              {
                "value": "involved_lamn_mucin",
                "label": "COMPROMETIDO por epitelio neoplásico / mucina acelular de LAMN"
              },
              {
                "value": "involved_carcinoma",
                "label": "COMPROMETIDO por adenocarcinoma invasor"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota H del CAP): En apendicectomía por LAMN, un margen cecal comprometido por epitelio neoplásico obliga a valorar la re-escisión de la base cecal o cequectomía para evitar recurrencia peritoneal tardía."
          },
          {
            "id": "margin_mesoappendix",
            "label": "Margen Radial / Mesentérico (Mesoapéndice)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido"
              },
              {
                "value": "involved",
                "label": "Comprometido por tumor / mucina"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Borde vascular de resección del mesoapéndice."
          }
        ]
      },
      {
        "name": "INVASIONES Y ESTUDIOS ESPECIALES",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfovascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota F del CAP): En LAMN la invasión vascular está ausente. Es muy prevalente en adenocarcinoma convencional y adenocarcinoma de células caliciformes (GCA)."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): Invasión de filetes nerviosos en la pared apendicular o mesoapéndice."
          }
        ]
      }
    ],
    "organ": "Apéndice",
    "subtitle": "CAP v5.1.0.0 / AJCC 8va Edición (Apendicectomía / LAMN / GCA)"
  },
  "small_intestine_resection": {
    "id": "small_intestine_resection",
    "title": "Protocolo Sinóptico: Intestino Delgado (Resección) - CAP v4.3.0.0 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "segmental_resection",
                "label": "Resección segmentaria de intestino delgado (yeyuno / íleon)"
              },
              {
                "value": "duodenectomy",
                "label": "Duodenectomía segmental"
              },
              {
                "value": "pancreaticoduodenectomy",
                "label": "Pancreatoduodenectomía (procedimiento de Whipple)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "Tipo de resección quirúrgica. Las neoplasias duodenales a menudo requieren pancreatoduodenectomía cefálica para lograr márgenes libres y linfadenectomía peripancreática adecuada."
          }
        ]
      },
      {
        "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico del Tumor",
            "type": "select",
            "options": [
              {
                "value": "duodenum",
                "label": "Duodeno (no ampular: primera, tercera o cuarta porción)"
              },
              {
                "value": "jejunum",
                "label": "Yeyuno"
              },
              {
                "value": "ileum",
                "label": "Íleon"
              },
              {
                "value": "meckel_diverticulum",
                "label": "Divertículo de Meckel"
              },
              {
                "value": "small_intestine_nos",
                "label": "Intestino delgado, no especificado"
              }
            ],
            "helpText": "(Nota A del CAP): El sitio anatómico tiene implicancias etiológicas: los adenocarcinomas duodenales representan más del 50% de los cánceres del intestino delgado y se asocian a poliposis adenomatosa familiar (PAF); los yeyunales e ileales se asocian frecuentemente a enfermedad celíaca o enfermedad de Crohn de larga evolución."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico (OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "adenocarcinoma",
                "label": "Adenocarcinoma convencional"
              },
              {
                "value": "mucinous",
                "label": "Adenocarcinoma mucinoso (>50% de mucina)"
              },
              {
                "value": "signet_ring",
                "label": "Carcinoma de células en anillo de sello / pobremente cohesivo"
              },
              {
                "value": "adenosquamous",
                "label": "Carcinoma adenoescamoso"
              },
              {
                "value": "medullary",
                "label": "Carcinoma medular (asociado a MSI-H / Lynch)"
              },
              {
                "value": "large_cell_ne",
                "label": "Carcinoma neuroendocrino de células grandes"
              },
              {
                "value": "small_cell_ne",
                "label": "Carcinoma neuroendocrino de células pequeñas"
              },
              {
                "value": "undifferentiated",
                "label": "Carcinoma indiferenciado"
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota B del CAP): Los adenocarcinomas de intestino delgado comparten características morfológicas y moleculares con los colorrectales (frecuente inestabilidad de microsatélites dMMR/MSI-H, especialmente en el contexto de Síndrome de Lynch)."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico",
            "type": "radio",
            "options": [
              {
                "value": "g1",
                "label": "G1: Bien diferenciado (>95% de formación glandular)"
              },
              {
                "value": "g2",
                "label": "G2: Moderadamente diferenciado (50% a 95% de formación glandular)"
              },
              {
                "value": "g3",
                "label": "G3: Pobremente diferenciado (<50% de formación glandular)"
              },
              {
                "value": "gx",
                "label": "GX: No puede ser evaluado"
              }
            ],
            "helpText": "(Nota C del CAP): Sistema graduado de diferenciación glandular."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Dimensión mayor del tumor invasor en centímetros."
          },
          {
            "id": "macroscopic_perforation",
            "label": "Perforación Macroscópica del Tumor",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present_tumor",
                "label": "Presente en el lecho tumoral (pT4a)"
              },
              {
                "value": "present_not_tumor",
                "label": "Presente en intestino vecino no tumoral"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "La perforación transmural espontánea o mecánica en el lecho del tumor se asocia a diseminación peritoneal."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
        "fields": [
          {
            "id": "pt_category",
            "label": "Tumor Primario (pT - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: No evaluable"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin evidencia de tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Carcinoma in situ (intramucoso)"
              },
              {
                "value": "pt1a",
                "label": "pT1a: El tumor invade la lámina propia"
              },
              {
                "value": "pt1b",
                "label": "pT1b: El tumor invade la submucosa"
              },
              {
                "value": "pt2",
                "label": "pT2: El tumor invade la muscular propia"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor invade la subserosa o tejido perimuscular no peritonealizado (mesenterio/retroperitoneo) <= 2 cm"
              },
              {
                "value": "pt4",
                "label": "pT4: El tumor penetra la serosa (peritoneo visceral) O invade directamente otros órganos/tejido perimuscular > 2 cm"
              }
            ],
            "helpText": "(Nota F del CAP): En el duodeno retroperitoneal (que carece de serosa posterior), la invasión del tejido retroperitoneal adiposo con una profundidad menor o igual a 2 cm se clasifica como pT3; si sobrepasa los 2 cm de profundidad o invade el páncreas, se clasifica como pT4. En yeyuno e íleon, la perforación de la serosa peritoneal visceral es pT4."
          },
          {
            "id": "nodes_examined",
            "label": "Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota F del CAP): El consenso AJCC 8va edición recomienda un MÍNIMO de 8 ganglios linfáticos regionales examinados para una estadificación pN0 certera en resecciones de intestino delgado."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios Linfáticos con Metástasis",
            "type": "number",
            "helpText": "Número de ganglios con metástasis microscópica o macroscópica."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pnx",
                "label": "pNX: No evaluable"
              },
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis en ganglios linfáticos regionales"
              },
              {
                "value": "pn1",
                "label": "pN1: Metástasis en 1 a 2 ganglios linfáticos regionales"
              },
              {
                "value": "pn2",
                "label": "pN2: Metástasis en 3 o más ganglios linfáticos regionales"
              }
            ],
            "helpText": "Clasificación cuantitativa según el número de ganglios positivos."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable"
              },
              {
                "value": "pm1",
                "label": "pM1: Metástasis a distancia presente (hígado, peritoneo, pulmón)"
              }
            ],
            "helpText": "Diseminación tumoral a distancia."
          }
        ]
      },
      {
        "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_proximal",
            "label": "Margen Quirúrgico Proximal",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota E del CAP): Margen entérico proximal."
          },
          {
            "id": "margin_distal",
            "label": "Margen Quirúrgico Distal",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota E del CAP): Margen entérico distal."
          },
          {
            "id": "margin_mesenteric_radial",
            "label": "Margen Mesentérico / Radial (Retroperitoneal en Duodeno)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved_gt_1mm",
                "label": "No comprometido: Carcinoma a más de 1.0 mm de la tinta (especificar distancia en mm)",
                "hasInput": true
              },
              {
                "value": "involved_lte_1mm",
                "label": "COMPROMETIDO: Carcinoma a 1.0 mm o menos (<=1.0 mm) de la tinta",
                "hasInput": true
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota E del CAP): El margen mesentérico o radial vascularizado no peritonealizado se considera positivo si el tumor dista <= 1.0 mm de la superficie entintada."
          }
        ]
      },
      {
        "name": "INVASIONES Y BIOMARCADORES",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfovascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Embolias tumorales en vasos linfáticos o venosos."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Invasión de filetes nerviosos en la pared o mesenterio."
          },
          {
            "id": "treatment_effect",
            "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan)",
            "type": "radio",
            "options": [
              {
                "value": "no_therapy",
                "label": "Sin terapia presúrgica"
              },
              {
                "value": "score_0",
                "label": "Score 0: Respuesta completa (sin células viables)"
              },
              {
                "value": "score_1",
                "label": "Score 1: Respuesta moderada"
              },
              {
                "value": "score_2",
                "label": "Score 2: Respuesta mínima"
              },
              {
                "value": "score_3",
                "label": "Score 3: Pobre o nula respuesta"
              }
            ],
            "helpText": "(Nota D del CAP): Gradación de regresión tumoral."
          },
          {
            "id": "mmr_status",
            "label": "Proteínas de Reparación de Apareamiento (MMR por IHQ)",
            "type": "radio",
            "options": [
              {
                "value": "pmmr",
                "label": "pMMR: Expresión conservada en las 4 proteínas"
              },
              {
                "value": "dmmr",
                "label": "dMMR: PÉRDIDA de expresión nuclear (asociado a Síndrome de Lynch)",
                "hasInput": true
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "El carcinoma de intestino delgado es una de las neoplasias características del espectro tumoral del Síndrome de Lynch (mutaciones MLH1, MSH2, MSH6, PMS2)."
          }
        ]
      }
    ],
    "organ": "Intestino Delgado",
    "subtitle": "CAP v4.3.0.0 / AJCC 8va Edición (Duodeno / Yeyuno / Íleon)"
  },
  "esophagus": {
    "id": "esophagus_resection",
    "title": "Protocolo Sinóptico: Esófago y Unión Esofagogástrica (Resección) - CAP v4.2.0.1 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "esophagectomy_transthoracic",
                "label": "Esofaguectomía transtorácica (Ivor Lewis / McKeown en 3 campos)"
              },
              {
                "value": "esophagectomy_transhiatal",
                "label": "Esofaguectomía transhiatal"
              },
              {
                "value": "esophagogastrectomy",
                "label": "Esofagogastrectomía distal"
              },
              {
                "value": "emr_esd",
                "label": "Resección mucosa endoscópica (EMR / ESD)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "(Nota A del CAP): Describe el tipo de intervención quirúrgica. La esofaguectomía transtorácica permite una linfadenectomía mediastínica y celíaca más amplia que el abordaje transhiatal."
          }
        ]
      },
      {
        "name": "TUMOR Y SITIO ANATÓMICO",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico del Tumor (seleccionar todos los que apliquen)",
            "type": "checkbox",
            "options": [
              {
                "value": "cervical",
                "label": "Esófago cervical (15 a <20 cm de arcada dental)"
              },
              {
                "value": "upper_thoracic",
                "label": "Esófago torácico superior (20 a <25 cm de arcada dental)"
              },
              {
                "value": "mid_thoracic",
                "label": "Esófago torácico medio (25 a <30 cm de arcada dental)"
              },
              {
                "value": "lower_thoracic",
                "label": "Esófago torácico inferior (30 a 40 cm de arcada dental)"
              },
              {
                "value": "egj",
                "label": "Unión esofagogástrica (UEG)"
              },
              {
                "value": "esophagus_nos",
                "label": "Esófago, no especificado"
              }
            ],
            "helpText": "(Nota B del CAP): La localización anatómica es determinante: los carcinomas de células escamosas predominan en el tercio medio y superior (asociados a tabaco y alcohol), mientras que los adenocarcinomas se concentran en el tercio inferior y UEG (asociados a reflujo gastroesofágico y esófago de Barrett)."
          },
          {
            "id": "egj_relationship",
            "label": "Relación del Tumor con la Unión Esofagogástrica (UEG)",
            "type": "radio",
            "options": [
              {
                "value": "entirely_esophagus",
                "label": "El tumor se encuentra enteramente en el esófago tubular sin comprometer la UEG"
              },
              {
                "value": "epicenter_esophagus_invades_egj",
                "label": "El punto medio (epicentro) del tumor está en el esófago distal Y cruza/compromete la UEG"
              },
              {
                "value": "epicenter_at_egj",
                "label": "El epicentro del tumor se encuentra exactamente en la UEG"
              },
              {
                "value": "epicenter_stomach_lte_2cm",
                "label": "El epicentro del tumor está a 2.0 cm o menos en el estómago proximal/cardias Y compromete la UEG"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota B del CAP): Regla AJCC 8va Edición: Un tumor cuyo epicentro se encuentra dentro de los 2 cm proximales del estómago (cardias) e involucra la UEG se clasifica y estadifica como CÁNCER DE ESÓFAGO. Si el epicentro dista más de 2 cm de la UEG hacia el estómago, se estadifica como CÁNCER GÁSTRICO."
          },
          {
            "id": "egj_distance_cm",
            "label": "Distancia del Centro del Tumor a la UEG (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Medición en centímetros desde el centro geométrico del tumor hasta la unión esofagogástrica."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico (OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "adenocarcinoma",
                "label": "Adenocarcinoma (frecuentemente sobre esófago de Barrett)"
              },
              {
                "value": "squamous_cell",
                "label": "Carcinoma de células escamosas convencional (queratinizante o no queratinizante)"
              },
              {
                "value": "basaloid_squamous",
                "label": "Carcinoma de células escamosas basaloide"
              },
              {
                "value": "spindle_squamous",
                "label": "Carcinoma de células escamosas de células fusiformes (sarcomatoide)"
              },
              {
                "value": "verrucous_squamous",
                "label": "Carcinoma de células escamosas verrugoso"
              },
              {
                "value": "adenosquamous",
                "label": "Carcinoma adenoescamoso"
              },
              {
                "value": "adenoid_cystic",
                "label": "Carcinoma adenoide quístico"
              },
              {
                "value": "mucoepidermoid",
                "label": "Carcinoma mucoepidermoide"
              },
              {
                "value": "neuroendocrine_large",
                "label": "Carcinoma neuroendocrino de células grandes"
              },
              {
                "value": "neuroendocrine_small",
                "label": "Carcinoma neuroendocrino de células pequeñas"
              },
              {
                "value": "undifferentiated",
                "label": "Carcinoma indiferenciado"
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota C del CAP): El adenocarcinoma y el carcinoma de células escamosas tienen tablas de estadificación anatómica/pronóstica diferentes en la 8va edición del AJCC. El adenocarcinoma se origina típicamente sobre metaplasia columnar con células caliciformes (esófago de Barrett)."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico (Diferenciación)",
            "type": "radio",
            "options": [
              {
                "value": "g1",
                "label": "G1: Bien diferenciado"
              },
              {
                "value": "g2",
                "label": "G2: Moderadamente diferenciado"
              },
              {
                "value": "g3",
                "label": "G3: Pobremente diferenciado / indiferenciado"
              },
              {
                "value": "gx",
                "label": "GX: No puede ser evaluado"
              }
            ],
            "helpText": "(Nota D del CAP): En el carcinoma de células escamosas, el grado histológico (G1 vs G2/G3) forma parte integral del agrupamiento de estadios pronósticos del AJCC 8va edición."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Mayor longitud tumoral en sentido longitudinal o circunferencial."
          },
          {
            "id": "barrett_esophagus",
            "label": "Esófago de Barrett Asociado",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificado"
              },
              {
                "value": "present_no_dysplasia",
                "label": "Presente sin displasia en mucosa adyacente"
              },
              {
                "value": "present_low_dysplasia",
                "label": "Presente con displasia de bajo grado"
              },
              {
                "value": "present_high_dysplasia",
                "label": "Presente con displasia de alto grado"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar por tratamiento neoadyuvante previo"
              }
            ],
            "helpText": "Presencia de mucosa columnar de tipo intestinal especializada (células caliciformes teñidas con azul alcian) en la mucosa esofágica tubular peritumoral."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
        "fields": [
          {
            "id": "pt_category",
            "label": "Tumor Primario (pT - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: No puede ser evaluado"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin evidencia de tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Displasia de alto grado (carcinoma in situ / no invasivo)"
              },
              {
                "value": "pt1a",
                "label": "pT1a: El tumor invade la lámina propia o la muscularis mucosae"
              },
              {
                "value": "pt1b",
                "label": "pT1b: El tumor invade la submucosa"
              },
              {
                "value": "pt2",
                "label": "pT2: El tumor invade la muscular propia"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor invade la adventicia esofágica"
              },
              {
                "value": "pt4a",
                "label": "pT4a: El tumor invade estructuras adyacentes resecables (pleura, pericardio, diafragma, vena ácigos, peritoneo)"
              },
              {
                "value": "pt4b",
                "label": "pT4b: El tumor invade estructuras adyacentes irresecables (aorta, cuerpo vertebral, tráquea)"
              }
            ],
            "helpText": "(Nota E del CAP): El esófago carece de cubierta serosa en la mayor parte de su trayecto torácico; la capa externa es una adventicia laxa de tejido conectivo. La invasión de la adventicia corresponde a pT3. La extensión a estructuras contiguas se divide en resecables quirúrgicamente (pT4a) e irresecables que contraindican cirugía curativa (pT4b)."
          },
          {
            "id": "nodes_examined",
            "label": "Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota I del CAP): El AJCC recomienda examinar un MÍNIMO de 15 ganglios linfáticos regionales para una estadificación pN confiable en esofaguectomía."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios Linfáticos con Metástasis",
            "type": "number",
            "helpText": "Número total de ganglios con depósito metastásico de carcinoma."
          },
          {
            "id": "extranodal_extension",
            "label": "Extensión Extranodal (ENE)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No determinado"
              }
            ],
            "helpText": "Infiltración tumoral que atraviesa la cápsula del ganglio hacia el tejido adiposo mediastínico o perigástrico."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pnx",
                "label": "pNX: No pueden ser evaluados"
              },
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis en ganglios linfáticos regionales"
              },
              {
                "value": "pn1",
                "label": "pN1: Metástasis en 1 a 2 ganglios linfáticos regionales"
              },
              {
                "value": "pn2",
                "label": "pN2: Metástasis en 3 a 6 ganglios linfáticos regionales"
              },
              {
                "value": "pn3",
                "label": "pN3: Metástasis en 7 o más ganglios linfáticos regionales"
              }
            ],
            "helpText": "Clasificación pN numérica estandarizada común tanto para adenocarcinoma como para carcinoma escamoso."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
            "type": "radio",
            "options": [
              {
                "value": "na",
                "label": "No aplicable"
              },
              {
                "value": "pm1",
                "label": "pM1: Metástasis a distancia presente (pulmón, hígado, ganglios no regionales [supraclaviculares en tumores distales])"
              }
            ],
            "helpText": "Compromiso de órganos a distancia o ganglios linfáticos fuera del territorio de drenaje regional."
          }
        ]
      },
      {
        "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_proximal",
            "label": "Margen Quirúrgico Proximal (Esofágico)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota G del CAP): Margen tubular esofágico proximal."
          },
          {
            "id": "margin_distal",
            "label": "Margen Quirúrgico Distal (Gástrico)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm/cm)",
                "hasInput": true
              },
              {
                "value": "involved",
                "label": "Comprometido por carcinoma invasor"
              }
            ],
            "helpText": "(Nota G del CAP): Margen tubular gástrico distal."
          },
          {
            "id": "margin_crm_adventitial",
            "label": "Margen Adventicial / Circunferencial (CRM)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved_gt_1mm",
                "label": "No comprometido: Carcinoma a más de 1.0 mm de la tinta adventicial (especificar distancia en mm)",
                "hasInput": true
              },
              {
                "value": "involved_lte_1mm",
                "label": "COMPROMETIDO: Carcinoma a 1.0 mm o menos (<=1.0 mm) de la superficie adventicial entintada",
                "hasInput": true
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): Al igual que en recto, el margen circunferencial adventicial (CRM) del esófago se considera POSITIVO si las células cancerosas distan <= 1.0 mm de la tinta externa. Un CRM positivo es un predictor crítico de recurrencia mediastínica local precoz."
          }
        ]
      },
      {
        "name": "INVASIONES, RESPUESTA AL TRATAMIENTO Y BIOMARCADORES",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfovascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Presencia de embolias en vasos linfáticos o venosos."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Infiltración del espacio perineural."
          },
          {
            "id": "treatment_effect",
            "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan)",
            "type": "radio",
            "options": [
              {
                "value": "no_therapy",
                "label": "Sin terapia neoadyuvante conocida"
              },
              {
                "value": "score_0",
                "label": "Score 0 (Respuesta completa: ausencia de células neoplásicas viables, pCR)"
              },
              {
                "value": "score_1",
                "label": "Score 1 (Respuesta moderada: células tumorales residuales escasas aisladas)"
              },
              {
                "value": "score_2",
                "label": "Score 2 (Respuesta mínima: cáncer residual evidente con fibrosis desmoplásica)"
              },
              {
                "value": "score_3",
                "label": "Score 3 (Pobre o nula respuesta: extenso cáncer residual)"
              }
            ],
            "helpText": "(Nota F del CAP): La respuesta patológica completa (Score 0) tras quimiorradioterapia neoadyuvante según protocolo CROSS triplica la sobrevida a 5 años tanto en adenocarcinoma como en carcinoma escamoso."
          },
          {
            "id": "her2_ihc",
            "label": "Estado de HER2 por IHQ (Relevante en Adenocarcinoma de Esófago distal / UEG)",
            "type": "radio",
            "options": [
              {
                "value": "score_0",
                "label": "Score 0 (Negativo)"
              },
              {
                "value": "score_1",
                "label": "Score 1+ (Negativo)"
              },
              {
                "value": "score_2",
                "label": "Score 2+ (Equívoco: requiere FISH)",
                "hasInput": true
              },
              {
                "value": "score_3",
                "label": "Score 3+ (POSITIVO: tinción basolateral intensa en U)"
              },
              {
                "value": "na_squamous",
                "label": "No aplicable (Carcinoma de células escamosas)"
              },
              {
                "value": "pending",
                "label": "Pendiente"
              }
            ],
            "helpText": "Evaluación con criterios de Hofman para seleccionar tratamiento con trastuzumab en adenocarcinomas de esófago distal y UEG."
          },
          {
            "id": "pdl1_cps",
            "label": "PD-L1 Combined Positive Score (CPS) / Tumor Proportion Score (TPS)",
            "type": "number",
            "helpText": "En carcinoma epidermoide de esófago (TPS >= 1% o CPS >= 10) y en adenocarcinoma de la UEG (CPS >= 5 o >= 10), predice respuesta favorable a inhibidores de PD-1 (Pembrolizumab o Nivolumab)."
          }
        ]
      }
    ],
    "organ": "Esófago y UEG",
    "subtitle": "CAP v4.2.0.1 / AJCC 8va Edición (Esofaguectomía / UEG)"
  },
  "appendix": {
    "id": "appendix_resection",
    "title": "Protocolo Sinóptico: Apéndice Cecal (Resección) - CAP v5.1.0.0 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
      {
        "name": "PROCEDIMIENTO Y ESPECÍMEN",
        "fields": [
          {
            "id": "procedure",
            "label": "Procedimiento Quirúrgico",
            "type": "radio",
            "options": [
              {
                "value": "appendectomy",
                "label": "Apendicectomía (laparoscópica o abierta)"
              },
              {
                "value": "cecectomy",
                "label": "Cequectomía (resección parcial de ciego)"
              },
              {
                "value": "right_hemicolectomy",
                "label": "Hemicolectomía derecha (resección ileocecal formal)"
              },
              {
                "value": "other",
                "label": "Otro procedimiento (especificar)",
                "hasInput": true
              },
              {
                "value": "unspecified",
                "label": "No especificado"
              }
            ],
            "helpText": "(Nota A del CAP): Tipo de intervención quirúrgica. En LAMN no complicado con margen cecal libre, la apendicectomía simple suele ser curativa. En adenocarcinoma invasor o adenocarcinoma de células caliciformes (GCA) de alto grado, se requiere hemicolectomía derecha oncológica para linfadenectomía regional."
          }
        ]
      },
      {
        "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
        "fields": [
          {
            "id": "tumor_site",
            "label": "Sitio Anatómico en el Apéndice",
            "type": "checkbox",
            "options": [
              {
                "value": "tip",
                "label": "Punta apendicular"
              },
              {
                "value": "body",
                "label": "Cuerpo / tercio medio"
              },
              {
                "value": "base",
                "label": "Base apendicular"
              },
              {
                "value": "diffuse",
                "label": "Difuso / compromiso de toda la longitud del órgano"
              }
            ],
            "helpText": "(Nota B del CAP): La localización en la base apendicular incrementa el riesgo de margen quirúrgico proximal comprometido e invasión directa del ciego."
          },
          {
            "id": "base_involvement",
            "label": "Compromiso de la Base del Apéndice",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometida (base libre de neoplasia)"
              },
              {
                "value": "involved",
                "label": "COMPROMETIDA por neoplasia / mucina neoplásica"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "El compromiso de la base exige correlación directa con el margen de resección proximal del ciego."
          },
          {
            "id": "histologic_type",
            "label": "Tipo Histológico (OMS 5ta Ed.)",
            "type": "select",
            "options": [
              {
                "value": "lamn",
                "label": "Neoplasia mucinosa apendicular de bajo grado (LAMN)"
              },
              {
                "value": "hamn",
                "label": "Neoplasia mucinosa apendicular de alto grado (HAMN)"
              },
              {
                "value": "mucinous_adenocarcinoma",
                "label": "Adenocarcinoma mucinoso (>50% de mucina con invasión estromal destructiva)"
              },
              {
                "value": "adenocarcinoma_colonic",
                "label": "Adenocarcinoma no mucinoso (tipo colónico convencional)"
              },
              {
                "value": "signet_ring",
                "label": "Carcinoma de células en anillo de sello / pobremente cohesivo"
              },
              {
                "value": "gca_grade_1",
                "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 1 (túbulos uniformes, <25% sólido/anillo de sello)"
              },
              {
                "value": "gca_grade_2",
                "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 2 (25% a 50% de nidos irregulares/anillo de sello)"
              },
              {
                "value": "gca_grade_3",
                "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 3 (>50% de patrón sólido o pleomórfico)"
              },
              {
                "value": "net_g1",
                "label": "Tumor neuroendocrino bien diferenciado (NET G1 / carcinoide)"
              },
              {
                "value": "other",
                "label": "Otro tipo histológico (especificar)",
                "hasInput": true
              }
            ],
            "helpText": "(Nota C del CAP): LAMN se define por epitelio mucinoso con atipia de bajo grado que crece en empuje ('pushing border') con disección de mucina a través de la pared apendicular adelgazada o hialinizada, sin infiltración destructiva estromal. El Adenocarcinoma de Células Caliciformes (GCA) es una neoplasia anfícrina exclusiva del apéndice que se subclasifica en 3 grados (según consenso Tang/OMS) con impacto pronóstico crítico."
          },
          {
            "id": "peritoneal_mucin",
            "label": "Mucina Extra-Apendicular / Peritoneal (Pseudomixoma Peritoneal)",
            "type": "radio",
            "options": [
              {
                "value": "none",
                "label": "No identificada (mucina confinada estrictamente a la luz o pared apendicular)"
              },
              {
                "value": "acellular_serosa",
                "label": "Mucina ACELULAR en serosa apendicular o peritoneo adyacente"
              },
              {
                "value": "cellular_peritoneal",
                "label": "Mucina CELULAR (con células epiteliales viables) en serosa o cavidad peritoneal"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota C y I del CAP): Distinción pronóstica fundamental en neoplasias mucinosas: La presencia de mucina ACELULAR (sin células neoplásicas) en el peritoneo confiere un pronóstico sustancialmente más favorable que la presencia de epitelio neoplásico flotante (mucina CELULAR), la cual define el pseudomixoma peritoneal florido con riesgo elevado de progresión masiva."
          },
          {
            "id": "histologic_grade",
            "label": "Grado Histológico",
            "type": "radio",
            "options": [
              {
                "value": "g1_low",
                "label": "G1: Bajo grado (Bien diferenciado / concordante con LAMN)"
              },
              {
                "value": "g2_mod",
                "label": "G2: Moderadamente diferenciado"
              },
              {
                "value": "g3_high",
                "label": "G3: Alto grado (Pobremente diferenciado / HAMN / células en anillo de sello)"
              },
              {
                "value": "cannot_assess",
                "label": "No aplicable"
              }
            ],
            "helpText": "(Nota D del CAP): El grado histológico del tumor apendicular y del componente peritoneal debe ser concordante. El grado alto en el peritoneo predice una sobrevida significativamente menor tras cirugía citorreductora e HIPEC."
          },
          {
            "id": "tumor_size_greatest",
            "label": "Dimensión Mayor del Tumor / Masa Apendicular (cm)",
            "type": "number",
            "suffix": "cm",
            "helpText": "Diámetro mayor del tumor apendicular o del apéndice ectásico con mucocele."
          }
        ]
      },
      {
        "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
        "fields": [
          {
            "id": "pt_category_lamn",
            "label": "Categoría pT Específica para LAMN (Neoplasia Mucinosa de Bajo Grado)",
            "type": "select",
            "dependsOn": {
              "field": "histologic_type",
              "value": "lamn"
            },
            "options": [
              {
                "value": "ptis_lamn",
                "label": "pTis(LAMN): LAMN confinado al apéndice (mucina o epitelio que diseca muscular o subserosa pero con serosa peritoneal intacta)"
              },
              {
                "value": "pt3_lamn",
                "label": "pT3: LAMN que invade directamente el mesoapéndice pero sin romper la serosa peritoneal"
              },
              {
                "value": "pt4a_lamn",
                "label": "pT4a: LAMN que penetra la serosa peritoneal visceral (mucina o epitelio neoplásico en la superficie serosa externa)"
              },
              {
                "value": "pt4b_lamn",
                "label": "pT4b: LAMN que invade directamente otros órganos o estructuras adyacentes"
              }
            ],
            "helpText": "(Nota I del CAP): Clasificación exclusiva para LAMN en la 8va edición: Las categorías pT1 y pT2 NO se aplican a LAMN debido a la atrofia parietal y el crecimiento empujante. Si la mucina o el epitelio de bajo grado disecan la pared hasta la subserosa pero la serosa mesotelial externa está intacta, se clasifica como pTis(LAMN). Si la mucina o células rompen la serosa hacia la cavidad libre, se reclasifica como pT4a."
          },
          {
            "id": "pt_category_adenocarcinoma",
            "label": "Categoría pT para Adenocarcinoma Convencional y GCA",
            "type": "select",
            "options": [
              {
                "value": "ptx",
                "label": "pTX: No evaluable"
              },
              {
                "value": "pt0",
                "label": "pT0: Sin tumor primario"
              },
              {
                "value": "ptis",
                "label": "pTis: Carcinoma in situ (intramucoso)"
              },
              {
                "value": "pt1",
                "label": "pT1: El tumor invade la submucosa"
              },
              {
                "value": "pt2",
                "label": "pT2: El tumor invade la muscular propia"
              },
              {
                "value": "pt3",
                "label": "pT3: El tumor invade la subserosa o el mesoapéndice"
              },
              {
                "value": "pt4a",
                "label": "pT4a: El tumor penetra la superficie del peritoneo visceral (serosa)"
              },
              {
                "value": "pt4b",
                "label": "pT4b: El tumor invade directamente otros órganos contiguos (ciego, íleon, pared abdominal)"
              }
            ],
            "helpText": "Estadificación convencional AJCC para carcinomas invasivos destructivos."
          },
          {
            "id": "nodes_examined",
            "label": "Total de Ganglios Linfáticos Regionales Examinados",
            "type": "number",
            "helpText": "(Nota I del CAP): Mínimo recomendado de 12 ganglios en caso de hemicolectomía derecha. En apendicectomía aislada habitualmente se evalúan solo ganglios del mesoapéndice (0 a 3)."
          },
          {
            "id": "nodes_positive",
            "label": "Número de Ganglios con Metástasis",
            "type": "number",
            "helpText": "Número de ganglios metastásicos."
          },
          {
            "id": "pn_category",
            "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "pn0",
                "label": "pN0: Sin metástasis ganglionares"
              },
              {
                "value": "pn1a",
                "label": "pN1a: Metástasis en 1 ganglio regional"
              },
              {
                "value": "pn1b",
                "label": "pN1b: Metástasis en 2 a 3 ganglios regionales"
              },
              {
                "value": "pn1c",
                "label": "pN1c: Depósitos tumorales en mesoapéndice sin metástasis ganglionares"
              },
              {
                "value": "pn2",
                "label": "pN2: Metástasis en 4 o más ganglios regionales"
              },
              {
                "value": "pnx",
                "label": "pNX: No evaluable"
              }
            ],
            "helpText": "Clasificación ganglionar según AJCC 8va edición."
          },
          {
            "id": "pm_category",
            "label": "Metástasis a Distancia (pM - Subclasificación Peritoneal AJCC 8va Ed.)",
            "type": "select",
            "options": [
              {
                "value": "na",
                "label": "No aplicable (sin diseminación confirmada)"
              },
              {
                "value": "pm1a",
                "label": "pM1a: Diseminación intraperitoneal de MUCINA ACELULAR exclusivamente"
              },
              {
                "value": "pm1b",
                "label": "pM1b: Metástasis peritoneal con CÉLULAS EPITELIALES de bajo grado (LAMN / G1)"
              },
              {
                "value": "pm1c",
                "label": "pM1c: Metástasis peritoneal de ALTO GRADO (con células en anillo de sello o adenocarcinoma G2/G3), o metástasis a distancia extraperitoneal"
              }
            ],
            "helpText": "(Nota I del CAP): Subclasificación pronóstica revolucionaria en el apéndice: pM1a (mucina acelular) tiene una excelente supervivencia (>85% a 5 años); pM1b (células epiteliales de bajo grado) tiene pronóstico intermedio tras peritonectomía e HIPEC; pM1c (células de alto grado/anillo de sello) tiene mal pronóstico."
          }
        ]
      },
      {
        "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
        "fields": [
          {
            "id": "margin_proximal_cecal",
            "label": "Margen Proximal de Resección (Base Apendicular / Cecal)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido (especificar distancia libre en mm)",
                "hasInput": true
              },
              {
                "value": "involved_lamn_mucin",
                "label": "COMPROMETIDO por epitelio neoplásico / mucina acelular de LAMN"
              },
              {
                "value": "involved_carcinoma",
                "label": "COMPROMETIDO por adenocarcinoma invasor"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota H del CAP): En apendicectomía por LAMN, un margen cecal comprometido por epitelio neoplásico obliga a valorar la re-escisión de la base cecal o cequectomía para evitar recurrencia peritoneal tardía."
          },
          {
            "id": "margin_mesoappendix",
            "label": "Margen Radial / Mesentérico (Mesoapéndice)",
            "type": "radio",
            "options": [
              {
                "value": "uninvolved",
                "label": "No comprometido"
              },
              {
                "value": "involved",
                "label": "Comprometido por tumor / mucina"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "Borde vascular de resección del mesoapéndice."
          }
        ]
      },
      {
        "name": "INVASIONES Y ESTUDIOS ESPECIALES",
        "fields": [
          {
            "id": "lvi",
            "label": "Invasión Linfovascular (LVI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota F del CAP): En LAMN la invasión vascular está ausente. Es muy prevalente en adenocarcinoma convencional y adenocarcinoma de células caliciformes (GCA)."
          },
          {
            "id": "pni",
            "label": "Invasión Perineural (PNI)",
            "type": "radio",
            "options": [
              {
                "value": "not_identified",
                "label": "No identificada"
              },
              {
                "value": "present",
                "label": "Presente"
              },
              {
                "value": "cannot_determine",
                "label": "No se puede determinar"
              }
            ],
            "helpText": "(Nota G del CAP): Invasión de filetes nerviosos en la pared apendicular o mesoapéndice."
          }
        ]
      }
    ],
    "organ": "Apéndice",
    "subtitle": "CAP v5.1.0.0 / AJCC 8va Edición (Apendicectomía / LAMN / GCA)"
  }
};

// Alias para retrocompatibilidad o integración modular
export const digestiveSynopticSchemas = capSchemasDigestivo;

// Función de compilación de reporte histopatológico sinóptico largo y estructurado
export function compileDigestiveSynopticReport(schemaId, state) {
    const schema = capSchemasDigestivo[schemaId];
    if (!schema) return "";

    let text = `==========================================================\n`;
    text += `INFORME HISTOPATOLÓGICO SINÓPTICO (PROTOCOLO OFICIAL CAP)\n`;
    text += `${schema.title.toUpperCase()}\n`;
    text += `==========================================================\n\n`;

    schema.sections.forEach(section => {
        let sectionHasData = false;
        let sectionText = `[${section.name}]\n`;

        section.fields.forEach(field => {
            // Verificar dependencias condicionales
            if (field.dependsOn) {
                const depVal = state[field.dependsOn.field];
                if (field.dependsOn.value && depVal !== field.dependsOn.value) return;
                if (field.dependsOn.values && !field.dependsOn.values.includes(depVal)) return;
            }

            const val = state[field.id];
            if (val === undefined || val === null || val === "") return;

            sectionHasData = true;

            if (field.type === "radio" || field.type === "select") {
                const opt = field.options ? field.options.find(o => o.value === val) : null;
                if (opt) {
                    let label = opt.label;
                    if (opt.hasInput) {
                        const extra = state[`${field.id}_extra`] || "";
                        if (label.includes("(especificar)") || label.includes("(explicar)")) {
                            label = label.replace("(especificar)", `: ${extra}`).replace("(explicar)", `: ${extra}`);
                        } else {
                            label += extra ? `: ${extra}` : "";
                        }
                    }
                    sectionText += `  • ${field.label}: ${label}\n`;
                } else {
                    sectionText += `  • ${field.label}: ${val}\n`;
                }
            } else if (field.type === "checkbox") {
                if (Array.isArray(val) && val.length > 0) {
                    let labels = val.map(v => {
                        const opt = field.options ? field.options.find(o => o.value === v) : null;
                        if (opt) {
                            let label = opt.label;
                            if (opt.hasInput) {
                                const extra = state[`${field.id}_${v}_extra`] || "";
                                label += extra ? `: ${extra}` : "";
                            }
                            return label;
                        }
                        return v;
                    });
                    sectionText += `  • ${field.label}:\n    - ${labels.join("\n    - ")}\n`;
                }
            } else if (field.type === "number") {
                const suffix = field.suffix ? ` ${field.suffix}` : "";
                sectionText += `  • ${field.label}: ${val}${suffix}\n`;
            } else if (field.type === "text") {
                sectionText += `  • ${field.label}: ${val}\n`;
            }
        });

        if (sectionHasData) {
            text += sectionText + `\n`;
        }
    });

    text += `----------------------------------------------------------\n`;
    text += `Reporte generado conforme a los estándares de acreditación del CAP y AJCC 8va Ed.\n`;

    return text.trim();
}
