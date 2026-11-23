// cap_schemas_gyn_endocrine.js
// DEFINICIÓN DE ESQUEMAS SINÓPTICOS CAP (MAMA, ENDOCRINO, TIROIDES, PÁNCREAS Y GINECOLÓGICO)
// Basado en protocolos oficiales del College of American Pathologists (CAP), AJCC 8va/9na Ed. y Sistema Bethesda 2014
// Traducido al español médico con Notas Explicativas ('helpText') integradas para apoyo diagnóstico.

export const capSchemasGynEndocrine = {
    // -------------------------------------------------------------------------
    // 1. CARCINOMA INVASOR DE MAMA (RESECCIÓN QUIRÚRGICA)
    // -------------------------------------------------------------------------
    breast_invasive_resection: {
        id: "breast_invasive_resection",
        title: "Protocolo Sinóptico CAP: Carcinoma Invasor de Mama (Resección Quirúrgica)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        helpText: "Nota A: La escisión (tumorectomía, cuadrantectomía o mastectomía parcial) remueve tejido mamario sin extirpar la totalidad de la glándula. La mastectomía total incluye la remoción de todo el parénquima; puede ser simple, con preservación de piel, con preservación del complejo pezón-aréola (requiere evaluación del margen retroareolar), radical modificada (incluye vaciamiento axilar) o radical (incluye pectoral mayor).",
                        options: [
                            { value: "lumpectomy", label: "Escisión local amplia / Cuadrantectomía / Mastectomía parcial" },
                            { value: "total_mastectomy", label: "Mastectomía total (simple)" },
                            { value: "skin_sparing_mastectomy", label: "Mastectomía total con preservación de piel" },
                            { value: "nipple_sparing_mastectomy", label: "Mastectomía total con preservación del complejo aréola-pezón" },
                            { value: "modified_radical_mastectomy", label: "Mastectomía radical modificada (con vaciamiento axilar)" },
                            { value: "radical_mastectomy", label: "Mastectomía radical (con resección del músculo pectoral)" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "specimen_laterality",
                        label: "Lateralidad de la Muestra",
                        type: "radio",
                        helpText: "Identificación obligatoria de la mama intervenida (derecha, izquierda o no especificada). En piezas bilaterales deben llenarse protocolos independientes para cada mama.",
                        options: [
                            { value: "right", label: "Mama derecha" },
                            { value: "left", label: "Mama izquierda" },
                            { value: "unspecified", label: "No especificada" }
                        ]
                    },
                    {
                        id: "specimen_integrity",
                        label: "Integridad del Espécimen",
                        type: "radio",
                        helpText: "Espécimen íntegro en bloque único permite la orientación tridimensional fidedigna de todos los márgenes quirúrgicos entintados. Los especímenes fragmentados dificultan la medición exacta del tamaño tumoral macroscópico y la distancia a los márgenes.",
                        options: [
                            { value: "single_intact", label: "Espécimen único íntegro" },
                            { value: "fragmented", label: "Fragmentado / Múltiples piezas" },
                            { value: "undetermined", label: "No determinado" }
                        ]
                    }
                ]
            },
            {
                name: "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
                fields: [
                    {
                        id: "focality",
                        label: "Focalidad Tumoral",
                        type: "radio",
                        helpText: "Nota B: Unifocal vs Multifocal. Se define multifocalidad como dos o más focos de carcinoma invasor separados por tejido mamario no tumoral. En carcinomas multifocales, la categoría pT se asigna EXCLUSIVAMENTE sobre la base del foco tumoral invasor de mayor diámetro (no se suman los diámetros de los focos individuales). Debe indicarse el número de focos y sus dimensiones.",
                        options: [
                            { value: "unifocal", label: "Unifocal (foco único invasor)" },
                            { value: "multifocal", label: "Multifocal (dos o más focos invasores separados)" },
                            { value: "cannot_assess", label: "No puede ser evaluada" }
                        ]
                    },
                    {
                        id: "multifocal_count",
                        label: "Número de Focos Invasores (si es multifocal)",
                        type: "text",
                        dependsOn: { field: "focality", value: "multifocal" },
                        helpText: "Especifique el número cuantificado de focos (ej. 2 focos, 3 focos, o incontables / coalescentes). Cada foco debe evaluarse histológicamente."
                    },
                    {
                        id: "tumor_site",
                        label: "Localización del Tumor (Sitio Anatómico)",
                        type: "select",
                        helpText: "Nota C: Cuadrantes mamarios. CSE es el sitio anatómico más frecuente. La cola axilar de Spence se extiende hacia la base de la axila. Los tumores centrales comprometen la región retroareolar dentro de los primeros 2 cm del pezón.",
                        options: [
                            { value: "upper_outer", label: "Cuadrante superior externo (CSE)" },
                            { value: "lower_outer", label: "Cuadrante inferior externo (CIE)" },
                            { value: "upper_inner", label: "Cuadrante superior interno (CSI)" },
                            { value: "lower_inner", label: "Cuadrante inferior interno (CII)" },
                            { value: "central", label: "Región central / Retroareolar (a menos de 2 cm del pezón)" },
                            { value: "axillary_tail", label: "Prolongación axilar (cola de Spence)" },
                            { value: "clock_position", label: "Hora según manecillas del reloj (especificar hora y distancia)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico (OMS 6ta Edición)",
                        type: "select",
                        helpText: "Nota D: Clasificación OMS de tumores de mama. El Carcinoma Invasor Tipo No Especial (NST) o Ductal Infiltrante representa el 70-75% de los casos. El Carcinoma Lobulillar Invasor clásico muestra pérdida de expresión de E-cadherina y células dispersas en fila india. Los tipos especiales puros (>90% del tumor: tubular, cribiforme, mucinoso) tienen excelente pronóstico. El carcinoma micropapilar se asocia a marcada invasión linfovascular angioinvasiva y metástasis ganglionares axilares.",
                        options: [
                            { value: "nst", label: "Carcinoma invasor tipo no especial (NST / Ductal infiltrante)" },
                            { value: "lobular_classic", label: "Carcinoma lobulillar invasor, clásico" },
                            { value: "lobular_pleomorphic", label: "Carcinoma lobulillar invasor, variante pleomórfica" },
                            { value: "lobular_other", label: "Carcinoma lobulillar invasor (variante alveolar, sólida o mixta)" },
                            { value: "tubular", label: "Carcinoma tubular puro (>90% de túbulos abiertos)" },
                            { value: "cribriform", label: "Carcinoma cribiforme invasor" },
                            { value: "mucinous", label: "Carcinoma mucinoso (coloide) puro" },
                            { value: "micropapillary", label: "Carcinoma micropapilar invasor" },
                            { value: "apocrine", label: "Carcinoma con diferenciación apocrina" },
                            { value: "metaplastic_squamous", label: "Carcinoma metaplásico, de células escamosas" },
                            { value: "metaplastic_spindle", label: "Carcinoma metaplásico, de células fusocelulares (fusiformes)" },
                            { value: "metaplastic_matrix", label: "Carcinoma metaplásico, productor de matriz (condroide/ósea)" },
                            { value: "adenoid_cystic", label: "Carcinoma adenoide quístico" },
                            { value: "medullary_pattern", label: "Carcinoma invasor con infiltrado linfocitario estromal abundante (patrón medular)" },
                            { value: "neuroendocrine", label: "Carcinoma neuroendocrino de mama" },
                            { value: "other", label: "Otro tipo histológico (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "size_greatest_mm",
                        label: "Tamaño Tumoral Invasor Mayor (Dimensión Máxima en mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Nota F: Medir estrictamente el componente invasor mayor en milímetros. NO incluir fibrosis periférica desmoplásica sin células tumorales ni el halo de carcinoma in situ (CDIS) circundante. En microinvasión (<=1 mm) categorizar como pT1mi. Para dimensiones entre 1.0 y 1.9 mm, redondear a 2 mm según AJCC 8va Ed."
                    },
                    {
                        id: "size_additional_w",
                        label: "Dimensión Transversal Adicional (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Segunda dimensión ortogonal medida microscópicamente o macroscópicamente."
                    },
                    {
                        id: "size_additional_h",
                        label: "Dimensión Longitudinal o Espesor Adicional (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Tercera dimensión ortogonal del foco invasor."
                    }
                ]
            },
            {
                name: "GRADO HISTOLÓGICO DE NOTTINGHAM (BLOOM-RICHARDSON MODIFICADO)",
                fields: [
                    {
                        id: "nottingham_tubules",
                        label: "Formación de Túbulos / Glándulas",
                        type: "radio",
                        helpText: "Nota E: Nottingham Tubule Score. Evaluar la proporción del tumor compuesta por túbulos o glándulas con luces abiertas visibles: Puntuación 1 = >75% del tumor; Puntuación 2 = 10% a 75% del tumor; Puntuación 3 = <10% del tumor (cordones, sábanas sólidas o células aisladas).",
                        options: [
                            { value: "1", label: "Puntuación 1: >75% del tumor con formación tubular/glandular bien diferenciada" },
                            { value: "2", label: "Puntuación 2: 10% a 75% del tumor con formación tubular" },
                            { value: "3", label: "Puntuación 3: <10% del tumor con formación tubular (predominio sólido/cordonal)" }
                        ]
                    },
                    {
                        id: "nottingham_nuclear",
                        label: "Pleomorfismo Nuclear",
                        type: "radio",
                        helpText: "Nota E: Nottingham Nuclear Score. Comparar el tamaño y contorno de los núcleos neoplásicos con núcleos de células epiteliales mamarias normales o linfocitos maduros: Puntuación 1 = Núcleos pequeños, redondos, uniformes, cromatina fina; Puntuación 2 = Aumento moderado de tamaño y variación en forma, nucléolos pequeños visibles; Puntuación 3 = Marcado pleomorfismo, contornos irregulares vesiculosos, nucléolos prominentes o múltiples.",
                        options: [
                            { value: "1", label: "Puntuación 1: Núcleos pequeños, uniformes, cromatina condensada homogénea" },
                            { value: "2", label: "Puntuación 2: Aumento moderado de tamaño y atipia, nucléolos visibles" },
                            { value: "3", label: "Puntuación 3: Marcado pleomorfismo, cromatina gruesa, nucléolos prominentes o macro-nucléolos" }
                        ]
                    },
                    {
                        id: "nottingham_mitotic",
                        label: "Conteo Mitótico (Índice de Mitosis)",
                        type: "radio",
                        helpText: "Nota E: Nottingham Mitotic Score. Se deben contar las figuras mitóticas en 10 campos de gran aumento consecutivos en la periferia más proliferativa ('hot-spot'). El corte de puntuación depende del diámetro del campo microscópico (para objetivo 40x con diámetro de 0.55 mm: <=7 mitosis = 1 pt; 8-15 mitosis = 2 pts; >=16 mitosis = 3 pts).",
                        options: [
                            { value: "1", label: "Puntuación 1: Tasa mitótica baja (<=7 mitosis / 10 CGA para campo 0.55 mm)" },
                            { value: "2", label: "Puntuación 2: Tasa mitótica intermedia (8 a 15 mitosis / 10 CGA para campo 0.55 mm)" },
                            { value: "3", label: "Puntuación 3: Tasa mitótica alta (>=16 mitosis / 10 CGA para campo 0.55 mm)" }
                        ]
                    },
                    {
                        id: "overall_grade",
                        label: "Grado Histológico Combinado de Nottingham (Grado de Elston-Ellis)",
                        type: "select",
                        helpText: "Nota E: Grado combinado global. Se calcula sumando los puntajes de túbulos (1-3) + pleomorfismo nuclear (1-3) + mitosis (1-3). Puntuación total de 3 a 5 = Grado 1; Puntuación 6 o 7 = Grado 2; Puntuación 8 o 9 = Grado 3. Es un factor pronóstico mayor independiente validado a nivel mundial.",
                        options: [
                            { value: "grade_1", label: "Grado 1: Bien diferenciado (puntuación combinada total 3, 4 o 5)" },
                            { value: "grade_2", label: "Grado 2: Moderadamente diferenciado (puntuación combinada total 6 o 7)" },
                            { value: "grade_3", label: "Grado 3: Pobremente diferenciado (puntuación combinada total 8 o 9)" },
                            { value: "cannot_assess", label: "No puede ser evaluado / No aplicable" }
                        ]
                    }
                ]
            },
            {
                name: "COMPONENTE IN SITU (CDIS) Y EXTENSIÓN TUMORAL",
                fields: [
                    {
                        id: "dcis_presence",
                        label: "Carcinoma Ductal In Situ (CDIS / DCIS)",
                        type: "radio",
                        helpText: "Nota G: Evaluar si existe componente de carcinoma intraductal asociado al carcinoma invasor. Si está presente, reportar su arquitectura, grado nuclear, presencia de necrosis y estimación del porcentaje que ocupa en relación a la masa tumoral.",
                        options: [
                            { value: "not_identified", label: "No identificado (100% invasor puro)" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "dcis_pattern",
                        label: "Patrón Arquitectural del CDIS",
                        type: "checkbox",
                        dependsOn: { field: "dcis_presence", value: "present" },
                        helpText: "Seleccione todos los patrones arquitecturales identificados en el componente in situ.",
                        options: [
                            { value: "cribriform", label: "Cribiforme" },
                            { value: "micropapillary", label: "Micropapilar" },
                            { value: "solid", label: "Sólido" },
                            { value: "comedo", label: "Comedocarcionoma" },
                            { value: "papillary", label: "Papilar" },
                            { value: "pagetoid", label: "Extensión pagetoide al pezón" }
                        ]
                    },
                    {
                        id: "dcis_grade",
                        label: "Grado Nuclear del CDIS",
                        type: "radio",
                        dependsOn: { field: "dcis_presence", value: "present" },
                        helpText: "Grado I (Bajo): núcleos pequeños monomórficos; Grado II (Intermedio): pleomorfismo leve/moderado; Grado III (Alto): núcleos grandes vesiculosos con pleomorfismo marcado y nucléolos prominentes.",
                        options: [
                            { value: "low", label: "Grado I (Bajo)" },
                            { value: "intermediate", label: "Grado II (Intermedio)" },
                            { value: "high", label: "Grado III (Alto)" }
                        ]
                    },
                    {
                        id: "dcis_necrosis",
                        label: "Necrosis en el CDIS",
                        type: "radio",
                        dependsOn: { field: "dcis_presence", value: "present" },
                        helpText: "La presencia de necrosis central confluente tipo comedo en el CDIS se asocia fuertemente con aneuploidía, sobreexpresión de HER2 y mayor riesgo de recidiva local.",
                        options: [
                            { value: "absent", label: "Ausente" },
                            { value: "comedo", label: "Presente, tipo comedo confluente / central" },
                            { value: "punctate", label: "Presente, punteada o focal" }
                        ]
                    },
                    {
                        id: "dcis_percent",
                        label: "Porcentaje Aproximado de CDIS",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "dcis_presence", value: "present" },
                        helpText: "Porcentaje del volumen total del tumor constituido por CDIS. Un extenso componente intraductal (EIC) se define cuando el CDIS constituye >=25% del área tumoral y se extiende más allá del borde invasor."
                    },
                    {
                        id: "skin_invasion",
                        label: "Compromiso Cutáneo",
                        type: "select",
                        helpText: "Nota H: Compromiso de piel. La invasión de dermis por sí sola NO clasifica como pT4. Para calificar como pT4b se requiere ulceración macroscópica/microscópica de la epidermis o nódulos satélites macroscópicos separados del tumor primario. El carcinoma inflamatorio (pT4d) es una entidad clínico-patológica que requiere eritema y edema (piel de naranja) en al menos 1/3 de la piel mamaria, comúnmente con émbolos en linfáticos dérmicos.",
                        options: [
                            { value: "none", label: "Piel no comprometida o no incluida en la muestra" },
                            { value: "dermis_only", label: "Invasión de dermis únicamente (NO califica para pT4)" },
                            { value: "ulceration", label: "Ulceración franca de la piel (pT4b)" },
                            { value: "satellite_nodules", label: "Nódulos satélites tumorales macroscópicos en piel (pT4b)" },
                            { value: "ulceration_and_satellites", label: "Ulceración y nódulos satélites simultáneos (pT4b)" },
                            { value: "inflammatory", label: "Carcinoma inflamatorio con émbolos linfáticos dérmicos y clínica de piel de naranja (pT4d)" }
                        ]
                    },
                    {
                        id: "chest_wall_invasion",
                        label: "Compromiso de Pared Torácica",
                        type: "radio",
                        helpText: "Nota H: La invasión del músculo pectoral mayor por sí sola NO califica para pT4a. Se requiere invasión de las estructuras de la pared torácica esquelética profunda: costillas, músculos intercostales o músculo serrato anterior.",
                        options: [
                            { value: "none", label: "Sin compromiso de pared torácica" },
                            { value: "pectoral_muscle_only", label: "Invasión únicamente del músculo pectoral (NO califica para pT4a)" },
                            { value: "chest_wall_deep", label: "Invasión de costillas, músculos intercostales o serrato anterior (pT4a)" }
                        ]
                    },
                    {
                        id: "treatment_effect",
                        label: "Efecto del Tratamiento Presúrgico (Neoadyuvancia)",
                        type: "select",
                        helpText: "Nota K: En especímenes post-quimioterapia/terapia dirigida neoadyuvante (prefijo ypTNM). Reportar si hay respuesta patológica completa (ypT0 ypN0: ausencia completa de tumor invasor y ganglios metastásicos) o evaluar la Carga Tumoral Residual (RCB / Miller-Payne) documentando fibrosis estromal, histiocitos espumosos y nidos tumorales residuales viables.",
                        options: [
                            { value: "no_neoadjuvant", label: "Sin terapia presúrgica neoadyuvante conocida" },
                            { value: "no_effect", label: "Terapia recibida: Sin efecto evidente de tratamiento" },
                            { value: "partial_response", label: "Terapia recibida: Respuesta patológica parcial (células tumorales residuales viables en lecho fibrótico)" },
                            { value: "complete_response", label: "Respuesta Patológica Completa (pCR): Sin carcinoma invasor residual (ypT0 / ypTis, ypN0)" },
                            { value: "cannot_assess", label: "No puede ser evaluado" }
                        ]
                    }
                ]
            },
            {
                name: "INVASIÓN LINFOVASCULAR Y MICROCALCIFICACIONES",
                fields: [
                    {
                        id: "lvi",
                        label: "Invasión Linfovascular (LVI / Angiolinfática)",
                        type: "radio",
                        helpText: "Nota I: La LVI requiere identificar células tumorales adheridas o flotando dentro de un canal tapizado por endotelio vascular o linfático, fuera del tumor invasor principal (peritumoral). Debe distinguirse del artificio de retracción por retracción durante la fijación formalínica. La presencia de LVI es un factor predictivo independiente de metástasis ganglionar axilar y recidiva sistémica.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present_focal", label: "Presente, focal (1 a 3 espacios vasculares)" },
                            { value: "present_extensive", label: "Presente, extensa (>=4 espacios vasculares)" },
                            { value: "indeterminate", label: "Dudosa / No concluyente (artificio de retracción difícil de distinguir)" }
                        ]
                    },
                    {
                        id: "microcalcifications",
                        label: "Microcalcificaciones",
                        type: "checkbox",
                        helpText: "Nota J: Localización anatómica de las microcalcificaciones identificadas al microscopio óptico. Es crítico para confirmar que la anomalía radiológica sospechosa observada en la mamografía fue resecada en el lecho quirúrgico.",
                        options: [
                            { value: "not_identified", label: "No identificadas" },
                            { value: "in_invasive", label: "Presentes en el carcinoma invasor" },
                            { value: "in_dcis", label: "Presentes en el carcinoma in situ (CDIS)" },
                            { value: "in_benign", label: "Presentes en parénquima mamario no neoplásico / benigno" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES QUIRÚRGICOS",
                fields: [
                    {
                        id: "margin_status_invasive",
                        label: "Estado de Márgenes para Carcinoma Invasor",
                        type: "radio",
                        helpText: "Nota L: Guías de consenso SSO-ASTRO (Society of Surgical Oncology - American Society for Radiation Oncology). Para carcinoma invasor resecado en lumpectomía, un margen negativo se define como 'ausencia de tinta china en las células del tumor invasor' ('no ink on tumor'). Si la tinta toca directamente células invasoras, el margen es positivo.",
                        options: [
                            { value: "all_negative", label: "Todos los márgenes libres de carcinoma invasor (sin tinta en tumor invasor)" },
                            { value: "positive", label: "Margen(es) comprometido(s) con carcinoma invasor (tinta en tumor invasor)" },
                            { value: "cannot_assess", label: "No puede ser evaluado" }
                        ]
                    },
                    {
                        id: "closest_margin_invasive",
                        label: "Margen Libre Más Cercano (Invasor)",
                        type: "select",
                        dependsOn: { field: "margin_status_invasive", value: "all_negative" },
                        helpText: "Indique la orientación anatómica del margen quirúrgico más próximo al tumor invasor.",
                        options: [
                            { value: "anterior", label: "Margen anterior (superficial / cutáneo)" },
                            { value: "posterior", label: "Margen posterior (profundo / fascia pectoral)" },
                            { value: "superior", label: "Margen superior" },
                            { value: "inferior", label: "Margen inferior" },
                            { value: "medial", label: "Margen medial (interno)" },
                            { value: "lateral", label: "Margen lateral (externo)" }
                        ]
                    },
                    {
                        id: "margin_distance_invasive",
                        label: "Distancia al Margen Más Cercano para Carcinoma Invasor (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "margin_status_invasive", value: "all_negative" },
                        helpText: "Distancia en milímetros medida desde las células invasoras más externas hasta la superficie entintada del margen más próximo."
                    },
                    {
                        id: "margins_involved_invasive",
                        label: "Margen(es) Específico(s) Comprometido(s) con Tumor Invasor",
                        type: "checkbox",
                        dependsOn: { field: "margin_status_invasive", value: "positive" },
                        helpText: "Marque todos los márgenes donde exista contacto directo entre la tinta quirúrgica y las células tumorales invasoras.",
                        options: [
                            { value: "anterior", label: "Margen anterior comprometido" },
                            { value: "posterior", label: "Margen posterior comprometido" },
                            { value: "superior", label: "Margen superior comprometido" },
                            { value: "inferior", label: "Margen inferior comprometido" },
                            { value: "medial", label: "Margen medial comprometido" },
                            { value: "lateral", label: "Margen lateral comprometido" }
                        ]
                    },
                    {
                        id: "margin_status_dcis",
                        label: "Estado de Márgenes para Carcinoma Ductal In Situ (CDIS)",
                        type: "radio",
                        helpText: "Nota L: Guías de consenso SSO-ASTRO para CDIS. A diferencia del carcinoma invasor, para CDIS se recomienda un margen libre óptimo de al menos 2.0 mm para minimizar el riesgo de recidiva local in situ.",
                        options: [
                            { value: "na", label: "No aplicable (sin componente de CDIS)" },
                            { value: "all_negative_gt_2mm", label: "Márgenes libres de CDIS a >= 2.0 mm de distancia" },
                            { value: "all_negative_close", label: "Márgenes libres pero cercanos (< 2.0 mm, sin tinta en CDIS)" },
                            { value: "positive", label: "Margen(es) comprometido(s) con CDIS (tinta en CDIS)" }
                        ]
                    },
                    {
                        id: "margin_distance_dcis",
                        label: "Distancia del CDIS al Margen Más Cercano (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "margin_status_dcis", values: ["all_negative_gt_2mm", "all_negative_close"] },
                        helpText: "Distancia milimétrica exacta desde el foco de CDIS más cercano a la superficie entintada."
                    },
                    {
                        id: "margins_involved_dcis",
                        label: "Margen(es) Comprometido(s) con CDIS",
                        type: "checkbox",
                        dependsOn: { field: "margin_status_dcis", value: "positive" },
                        helpText: "Especifique qué márgenes tienen células de CDIS en contacto directo con la tinta.",
                        options: [
                            { value: "anterior", label: "Margen anterior con CDIS" },
                            { value: "posterior", label: "Margen posterior con CDIS" },
                            { value: "superior", label: "Margen superior con CDIS" },
                            { value: "inferior", label: "Margen inferior con CDIS" },
                            { value: "medial", label: "Margen medial con CDIS" },
                            { value: "lateral", label: "Margen lateral con CDIS" }
                        ]
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS REGIONALES",
                fields: [
                    {
                        id: "node_procedure",
                        label: "Tipo de Muestra / Procedimiento Ganglionar",
                        type: "radio",
                        helpText: "Nota M: Identificación del procedimiento ganglionar. Biopsia de ganglio centinela (BSGC) mediante trazador/colorante, vaciamiento axilar o ambos.",
                        options: [
                            { value: "sentinel_only", label: "Biopsia de ganglio centinela (BSGC) únicamente" },
                            { value: "axillary_dissection", label: "Disección axilar (Niveles I / II / III)" },
                            { value: "sentinel_and_axillary", label: "Biopsia de ganglio centinela y vaciamiento axilar concurrente" },
                            { value: "no_nodes", label: "No se extirparon ganglios linfáticos regionales" }
                        ]
                    },
                    {
                        id: "nodes_examined",
                        label: "Número Total de Ganglios Linfáticos Examinados",
                        type: "number",
                        helpText: "Número total absoluto de ganglios linfáticos evaluados microscópicamente (incluye centinelas y no centinelas)."
                    },
                    {
                        id: "nodes_positive",
                        label: "Número de Ganglios Linfáticos con Metástasis",
                        type: "number",
                        helpText: "Número de ganglios con metástasis macroscópicas o micrometástasis (>0.2 mm). Los ganglios con solo Células Tumorales Aisladas (ITC <=0.2 mm) se reportan aparte y NO se cuentan como positivos para el N numérico convencional según AJCC 8va Ed."
                    },
                    {
                        id: "sentinel_positive",
                        label: "Número de Ganglios Centinela con Metástasis",
                        type: "number",
                        helpText: "Número de ganglios centinela positivos."
                    },
                    {
                        id: "largest_metastasis_size_mm",
                        label: "Tamaño del Depósito Metastásico Mayor (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Nota M: Medición del mayor diámetro confluente continuo de células tumorales en el ganglio linfático: Células Tumorales Aisladas (ITC) <=0.2 mm o <=200 células; Micrometástasis >0.2 mm hasta 2.0 mm (pN1mi); Macrometástasis >2.0 mm (pN1a, pN2a, pN3a)."
                    },
                    {
                        id: "itc_status",
                        label: "Presencia de Células Tumorales Aisladas (ITC)",
                        type: "radio",
                        helpText: "Nota M: Las ITC se definen como cúmulos celulares no mayores a 0.2 mm y de menos de 200 células en un solo corte transversal histológico. Se estadifican como pN0(i+) o pN0(mol+) y no se incluyen en el conteo de ganglios positivos para pN1.",
                        options: [
                            { value: "none", label: "No identificadas" },
                            { value: "itc_present", label: "Presentes (cúmulos <=0.2 mm y <200 células, pN0(i+))" }
                        ]
                    },
                    {
                        id: "extranodal_extension",
                        label: "Extensión Extranodal (ENE)",
                        type: "radio",
                        helpText: "Nota M: Extensión extranodal (ENE). Infiltración de células tumorales a través de la cápsula ganglionar hacia el tejido adiposo circundante. Es un marcador mayor de recurrencia locorregional.",
                        options: [
                            { value: "not_identified", label: "No identificada (metástasis estrictamente intracapsular)" },
                            { value: "present", label: "Presente (extensión extracapsular a grasa perinodal)" },
                            { value: "cannot_assess", label: "No puede ser evaluada" }
                        ]
                    },
                    {
                        id: "ene_dimension_mm",
                        label: "Dimensión de la Extensión Extranodal (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "extranodal_extension", value: "present" },
                        helpText: "Distancia perpendicular máxima de invasión tumoral fuera de la cápsula ganglionar hacia la grasa axilar."
                    }
                ]
            },
            {
                name: "ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8va EDICIÓN)",
                fields: [
                    {
                        id: "tnm_modifiers",
                        label: "Modificadores de Clasificación TNM",
                        type: "checkbox",
                        helpText: "Prefijos y sufijos AJCC: 'y' = estadificación post-terapia neoadyuvante; 'r' = recidiva tumoral; 'm' = carcinomas primarios múltiples sincrónicos en la misma mama; 'sn' = estadificación ganglionar basada en ganglio centinela (<6 ganglios).",
                        options: [
                            { value: "y", label: "y - Post-tratamiento neoadyuvante sistémico" },
                            { value: "m", label: "m - Múltiples focos invasores sincrónicos (especificar tamaño del foco mayor)" },
                            { value: "r", label: "r - Recidiva tumoral" },
                            { value: "sn", label: "sn - Biopsia de ganglio centinela" }
                        ]
                    },
                    {
                        id: "pt_category",
                        label: "Categoría pT (Tumor Primario)",
                        type: "select",
                        helpText: "Nota N: Categorización pT según AJCC 8va Edición basada en la dimensión máxima del mayor foco de carcinoma invasor: T1mi (<=1 mm); T1a (>1 a 5 mm); T1b (>5 a 10 mm); T1c (>10 a 20 mm); T2 (>20 a 50 mm); T3 (>50 mm); T4a (pared torácica profunda: costillas/intercostales/serrato); T4b (piel: úlcera franca o nódulos satélites macroscópicos); T4c (T4a + T4b); T4d (carcinoma inflamatorio con eritema/edema en >=1/3 de la mama).",
                        options: [
                            { value: "pTX", label: "pTX: El tumor primario no puede ser evaluado" },
                            { value: "pT0", label: "pT0: Sin evidencia de tumor primario (ej. ypT0 tras respuesta completa)" },
                            { value: "pTis_DCIS", label: "pTis (DCIS): Carcinoma ductal in situ puro" },
                            { value: "pTis_Paget", label: "pTis (Paget): Enfermedad de Paget del pezón sin carcinoma invasor ni CDIS en parénquima" },
                            { value: "pT1mi", label: "pT1mi: Microinvasión menor o igual a 1 mm en su dimensión mayor" },
                            { value: "pT1a", label: "pT1a: Tumor mayor de 1 mm pero menor o igual a 5 mm" },
                            { value: "pT1b", label: "pT1b: Tumor mayor de 5 mm pero menor o igual a 10 mm" },
                            { value: "pT1c", label: "pT1c: Tumor mayor de 10 mm pero menor o igual a 20 mm" },
                            { value: "pT2", label: "pT2: Tumor mayor de 20 mm pero menor o igual a 50 mm" },
                            { value: "pT3", label: "pT3: Tumor mayor de 50 mm en su dimensión mayor" },
                            { value: "pT4a", label: "pT4a: Extensión a pared torácica (costillas, intercostales o serrato anterior)" },
                            { value: "pT4b", label: "pT4b: Ulceración cutánea y/o nódulos satélites macroscópicos en la piel ipsilateral" },
                            { value: "pT4c", label: "pT4c: Compromiso simultáneo de pared torácica y piel (T4a + T4b)" },
                            { value: "pT4d", label: "pT4d: Carcinoma inflamatorio clínico-patológico" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN (Ganglios Linfáticos Regionales)",
                        type: "select",
                        helpText: "Nota N: Categorización pN según AJCC 8va Edición: pN0 (sin metástasis); pN0(i+) (solo células aisladas <=0.2 mm); pN1mi (micrometástasis >0.2 a 2.0 mm); pN1a (1 a 3 ganglios axilares con macrometástasis); pN1b (metástasis en ganglios de mamaria interna detectados por centinela sin metástasis axilares); pN1c (pN1a + pN1b); pN2a (4 a 9 ganglios axilares); pN2b (mamaria interna clínicamente aparente sin axilares); pN3a (>=10 ganglios axilares o ganglios infraclaviculares nivel III); pN3b (axilar + mamaria interna); pN3c (ganglios supraclaviculares ipsilaterales).",
                        options: [
                            { value: "pNX", label: "pNX: Ganglios regionales no pueden ser evaluados (no extirpados)" },
                            { value: "pN0", label: "pN0: Sin metástasis en ganglios linfáticos regionales" },
                            { value: "pN0_i_plus", label: "pN0(i+): Solo células tumorales aisladas (ITC <=0.2 mm y <200 células)" },
                            { value: "pN0_mol_plus", label: "pN0(mol+): Hallazgos moleculares positivos por RT-PCR sin evidencia histológica" },
                            { value: "pN1mi", label: "pN1mi: Micrometástasis (>0.2 mm a 2.0 mm o >200 células en un corte)" },
                            { value: "pN1a", label: "pN1a: Metástasis en 1 a 3 ganglios linfáticos axilares (al menos una >2.0 mm)" },
                            { value: "pN1b", label: "pN1b: Metástasis en ganglios de mamaria interna por biopsia de centinela, sin axilares" },
                            { value: "pN1c", label: "pN1c: Metástasis en 1 a 3 ganglios axilares y en mamaria interna microscópica" },
                            { value: "pN2a", label: "pN2a: Metástasis en 4 a 9 ganglios linfáticos axilares (al menos una >2.0 mm)" },
                            { value: "pN2b", label: "pN2b: Metástasis en ganglios de mamaria interna clínicamente aparente sin metástasis axilares" },
                            { value: "pN3a", label: "pN3a: Metástasis en 10 o más ganglios axilares, o en ganglios infraclaviculares (Nivel III)" },
                            { value: "pN3b", label: "pN3b: Metástasis en ganglios axilares clínicamente aparente más mamaria interna" },
                            { value: "pN3c", label: "pN3c: Metástasis en ganglios supraclaviculares ipsilaterales" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM (Metástasis a Distancia)",
                        type: "radio",
                        helpText: "pM1 solo se reporta si existe confirmación histopatológica o citológica inequívoca de metástasis en un órgano a distancia (hueso, pulmón, hígado, pleura, encéfalo, ganglios extra-regionales). Si no hay confirmación histológica de biopsia distante, usar cM0 (clínico).",
                        options: [
                            { value: "cM0", label: "cM0: Sin evidencia clínica ni radiológica de metástasis a distancia" },
                            { value: "pM1", label: "pM1: Metástasis a distancia confirmada microscópicamente" }
                        ]
                    }
                ]
            },
            {
                name: "ESTUDIOS DE BIOMARCADORES E INMUNOHISTOQUÍMICA",
                fields: [
                    {
                        id: "er_status",
                        label: "Receptores de Estrógeno (RE / ER)",
                        type: "radio",
                        helpText: "Guías ASCO/CAP 2020: Reportar el porcentaje de núcleos teñidos: Negativo: <1% de núcleos neoplásicos teñidos; Positivo Débil / Bajo: 1% a 10% de núcleos teñidos (requiere nota comentando beneficio limitado con hormonoterapia); Positivo: >10% de núcleos teñidos.",
                        options: [
                            { value: "negative", label: "Negativo (<1% de células tumorales teñidas)" },
                            { value: "low_positive", label: "Positivo Bajo / Débil (1% a 10% de células tumorales teñidas)" },
                            { value: "positive", label: "Positivo (>10% de células tumorales teñidas)" },
                            { value: "pending", label: "Pendiente / En proceso" }
                        ]
                    },
                    {
                        id: "er_percent",
                        label: "Porcentaje de Células Positivas para RE (%)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "er_status", values: ["low_positive", "positive"] },
                        helpText: "Indique el porcentaje exacto de núcleos tumorales con tinción nuclear específica (0 - 100%)."
                    },
                    {
                        id: "pgr_status",
                        label: "Receptores de Progesterona (RP / PgR)",
                        type: "radio",
                        helpText: "Guías ASCO/CAP: Negativo: <1% de núcleos tumorales teñidos; Positivo: >=1% de núcleos tumorales teñidos.",
                        options: [
                            { value: "negative", label: "Negativo (<1% de células tumorales teñidas)" },
                            { value: "positive", label: "Positivo (>=1% de células tumorales teñidas)" },
                            { value: "pending", label: "Pendiente / En proceso" }
                        ]
                    },
                    {
                        id: "pgr_percent",
                        label: "Porcentaje de Células Positivas para RP (%)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "pgr_status", value: "positive" },
                        helpText: "Indique el porcentaje exacto de núcleos con inmunorreactividad nuclear para RP."
                    },
                    {
                        id: "her2_ihc",
                        label: "Estado de HER2 por Inmunohistoquímica (IHC)",
                        type: "select",
                        helpText: "Guías ASCO/CAP HER2: Puntaje 0: Sin tinción de membrana o tinción incompleta tenue en <=10% de células; Puntaje 1+: Tinción incompleta tenue/débil de membrana en >10% de células ('HER2 Low'); Puntaje 2+ (Equívoco): Tinción de membrana basolateral o circunferencial débil a moderada en >10% de células (requiere estudio reflejo por ISH/FISH); Puntaje 3+ (Positivo): Tinción circunferencial completa intensa y homogénea en >10% de células tumorales invasoras.",
                        options: [
                            { value: "score_0", label: "0: Negativo (sin tinción o tinción incompleta tenue en <=10% de células)" },
                            { value: "score_1_plus", label: "1+: Negativo / HER2-Low (tinción de membrana tenue/incompleta en >10%)" },
                            { value: "score_2_plus", label: "2+: Equívoco (tinción circunferencial débil/moderada en >10%, requiere FISH)" },
                            { value: "score_3_plus", label: "3+: Positivo (tinción circunferencial completa intensa en >10% de células)" },
                            { value: "pending", label: "Pendiente / En proceso" }
                        ]
                    },
                    {
                        id: "her2_ish",
                        label: "Estado de HER2 por Hibridación In Situ (FISH / CISH / SISH)",
                        type: "select",
                        helpText: "Guías ASCO/CAP ISH: Negativo: Ratio HER2/CEP17 <2.0 y copias promedio de HER2 <4.0 por célula; Positivo: Ratio HER2/CEP17 >=2.0 (Grupo 1) o copias promedio de HER2 >=6.0 independientemente del ratio.",
                        options: [
                            { value: "not_performed", label: "No realizado / No requerido (IHC 0, 1+ o 3+)" },
                            { value: "negative", label: "Negativo (sin amplificación génica: Ratio <2.0 y copias <4.0)" },
                            { value: "positive", label: "Positivo (amplificado: Ratio HER2/CEP17 >=2.0 o copias HER2 >=6.0)" },
                            { value: "pending", label: "Pendiente" }
                        ]
                    },
                    {
                        id: "ki67_index",
                        label: "Índice de Proliferación Ki-67 (%)",
                        type: "number",
                        suffix: "%",
                        helpText: "Grupo Internacional de Trabajo de Ki-67: Conteo en áreas calientes ('hot-spots') evaluando al menos 500-1000 células. <10% = Proliferación baja; 10-20% = Intermedia/límite; >20% = Alta proliferación celular (criterio mayor para diferenciar Luminal A de Luminal B HER2-negativo)."
                    },
                    {
                        id: "molecular_subtype",
                        label: "Subtipo Molecular Intrínseco Subrogado (St. Gallen)",
                        type: "select",
                        helpText: "Clasificación clínica sustituta de St. Gallen según perfil de biomarcadores: Luminal A (RE+, RP alto >=20%, HER2-, Ki67 bajo); Luminal B HER2- (RE+, RP bajo <20% o Ki67 alto, HER2-); Luminal B HER2+ (RE+, HER2+, cualquier Ki67); HER2 Enriquecido (RE-, RP-, HER2+); Triple Negativo (RE-, RP-, HER2-).",
                        options: [
                            { value: "luminal_a", label: "Luminal A (RE+, RP alto >=20%, HER2 negativo, Ki-67 bajo <14%)" },
                            { value: "luminal_b_her2_neg", label: "Luminal B HER2-negativo (RE+, RP bajo o Ki-67 alto >=20%, HER2 negativo)" },
                            { value: "luminal_b_her2_pos", label: "Luminal B HER2-positivo (RE+, HER2 positivo 3+/FISH+, cualquier Ki-67)" },
                            { value: "her2_enriched", label: "HER2 sobreexpresado / enriquecido (RE-, RP-, HER2 positivo)" },
                            { value: "triple_negative", label: "Triple Negativo / Fenotipo Basal (RE-, RP-, HER2 negativo)" }
                        ]
                    }
                ]
            },
            {
                name: "COMENTARIOS",
                fields: [
                    {
                        id: "comments",
                        label: "Comentarios Anatomopatológicos y Correlación Clínica",
                        type: "text",
                        helpText: "Espacio para consignar número de caso de la biopsia previa por punción con aguja, concordancia clínico-radiológica, lechos de biopsia previa con clips de titanio y correlación con estudios genómicos (Oncotype DX, MammaPrint)."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 2. CARCINOMA INVASOR DE MAMA (BIOPSIA POR AGUJA / TRU-CUT)
    // -------------------------------------------------------------------------
    breast_invasive_biopsy: {
        id: "breast_invasive_biopsy",
        title: "Protocolo Sinóptico CAP: Carcinoma Invasor de Mama (Biopsia por Aguja / Tru-Cut)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento de Biopsia",
                        type: "radio",
                        helpText: "Tipo de procedimiento de biopsia: biopsia por punción con aguja gruesa (Core / Tru-cut), biopsia asistida por vacío (Mammotome), aspiración con aguja fina (BAAF) o biopsia incisional abierta.",
                        options: [
                            { value: "core_needle", label: "Biopsia con aguja gruesa (Core / Tru-Cut)" },
                            { value: "vacuum_assisted", label: "Biopsia asistida por vacío (Mammotome)" },
                            { value: "fna", label: "Punción aspiración con aguja fina (PAAF / FNA)" },
                            { value: "incisional", label: "Biopsia incisional" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "specimen_laterality",
                        label: "Lateralidad",
                        type: "radio",
                        helpText: "Lateralidad mamaria de la muestra de punción.",
                        options: [
                            { value: "right", label: "Mama derecha" },
                            { value: "left", label: "Mama izquierda" },
                            { value: "unspecified", label: "No especificada" }
                        ]
                    },
                    {
                        id: "cores_count",
                        label: "Número de Cilindros / Fragmentos de Biopsia",
                        type: "number",
                        helpText: "Número de cilindros de tejido recibidos y procesados en los bloques de parafina."
                    },
                    {
                        id: "cores_length_mm",
                        label: "Longitud Agregada de los Cilindros (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Suma lineal aproximada de las longitudes de los cilindros de biopsia evaluados."
                    }
                ]
            },
            {
                name: "CARACTERÍSTICAS DEL TUMOR EN BIOPSIA",
                fields: [
                    {
                        id: "tumor_site",
                        label: "Sitio Anatómico de la Lesión",
                        type: "select",
                        helpText: "Localización de la masa biopsiada en los cuadrantes de la mama.",
                        options: [
                            { value: "upper_outer", label: "Cuadrante superior externo (CSE)" },
                            { value: "lower_outer", label: "Cuadrante inferior externo (CIE)" },
                            { value: "upper_inner", label: "Cuadrante superior interno (CSI)" },
                            { value: "lower_inner", label: "Cuadrante inferior interno (CII)" },
                            { value: "central", label: "Región central / Retroareolar" },
                            { value: "axillary_tail", label: "Prolongación axilar (cola de Spence)" },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico (OMS 6ta Edición)",
                        type: "select",
                        helpText: "Nota A: Clasificación histológica en biopsia con aguja. Tener presente que en muestras de aguja pequeñas puede existir subestimación de componentes mixtos o patrones especiales.",
                        options: [
                            { value: "nst", label: "Carcinoma invasor tipo no especial (NST / Ductal infiltrante)" },
                            { value: "lobular_classic", label: "Carcinoma lobulillar invasor, clásico" },
                            { value: "lobular_pleomorphic", label: "Carcinoma lobulillar invasor, variante pleomórfica" },
                            { value: "tubular", label: "Carcinoma tubular" },
                            { value: "cribriform", label: "Carcinoma cribiforme invasor" },
                            { value: "mucinous", label: "Carcinoma mucinoso (coloide)" },
                            { value: "micropapillary", label: "Carcinoma micropapilar invasor" },
                            { value: "metaplastic", label: "Carcinoma metaplásico" },
                            { value: "apocrine", label: "Carcinoma apocrino" },
                            { value: "other", label: "Otro tipo histológico (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "size_invasive_core_mm",
                        label: "Foco Invasor Mayor en la Muestra de Biopsia (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Longitud en milímetros del mayor segmento contiguo con carcinoma invasor en los cilindros. Nota: no representa el tamaño total del tumor mamario definitivo, que debe correlacionarse con ecografía o resonancia magnética."
                    }
                ]
            },
            {
                name: "GRADO HISTOLÓGICO DE NOTTINGHAM EN BIOPSIA",
                fields: [
                    {
                        id: "nottingham_tubules",
                        label: "Formación de Túbulos",
                        type: "radio",
                        helpText: "Nota B: Grado histológico en biopsia. 1 = >75%; 2 = 10-75%; 3 = <10%. Si hay escaso tejido tumoral, documentar las limitaciones en la nota final.",
                        options: [
                            { value: "1", label: "Puntuación 1: >75% túbulos" },
                            { value: "2", label: "Puntuación 2: 10% - 75% túbulos" },
                            { value: "3", label: "Puntuación 3: <10% túbulos (sólido)" }
                        ]
                    },
                    {
                        id: "nottingham_nuclear",
                        label: "Pleomorfismo Nuclear",
                        type: "radio",
                        helpText: "Puntuación nuclear en biopsia: 1 = pequeño/regular; 2 = aumento moderado; 3 = pleomorfismo marcado con nucléolos grandes.",
                        options: [
                            { value: "1", label: "Puntuación 1: Núcleos pequeños uniformes" },
                            { value: "2", label: "Puntuación 2: Pleomorfismo moderado" },
                            { value: "3", label: "Puntuación 3: Pleomorfismo marcado" }
                        ]
                    },
                    {
                        id: "nottingham_mitotic",
                        label: "Tasa Mitótica",
                        type: "radio",
                        helpText: "Conteo mitótico estricto en los campos evaluables con objetivo 40x.",
                        options: [
                            { value: "1", label: "Puntuación 1: Baja" },
                            { value: "2", label: "Puntuación 2: Intermedia" },
                            { value: "3", label: "Puntuación 3: Alta" }
                        ]
                    },
                    {
                        id: "overall_grade",
                        label: "Grado Histológico Combinado en Biopsia",
                        type: "select",
                        helpText: "Grado combinado Nottingham: Grado 1 (3-5 pts), Grado 2 (6-7 pts), Grado 3 (8-9 pts).",
                        options: [
                            { value: "grade_1", label: "Grado 1: Bien diferenciado (puntuación 3-5)" },
                            { value: "grade_2", label: "Grado 2: Moderadamente diferenciado (puntuación 6-7)" },
                            { value: "grade_3", label: "Grado 3: Pobremente diferenciado (puntuación 8-9)" }
                        ]
                    }
                ]
            },
            {
                name: "CARCINOMA DUCTAL IN SITU Y MICROCALCIFICACIONES",
                fields: [
                    {
                        id: "dcis_presence",
                        label: "Carcinoma Ductal In Situ (CDIS) en Biopsia",
                        type: "radio",
                        helpText: "Nota C: Evaluar la coexistencia de componente intraductal en los cilindros de punción.",
                        options: [
                            { value: "not_identified", label: "No identificado" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "dcis_grade",
                        label: "Grado Nuclear del CDIS",
                        type: "radio",
                        dependsOn: { field: "dcis_presence", value: "present" },
                        helpText: "Grado nuclear del CDIS asociado.",
                        options: [
                            { value: "low", label: "Grado I (Bajo)" },
                            { value: "intermediate", label: "Grado II (Intermedio)" },
                            { value: "high", label: "Grado III (Alto)" }
                        ]
                    },
                    {
                        id: "dcis_necrosis",
                        label: "Necrosis en el CDIS",
                        type: "radio",
                        dependsOn: { field: "dcis_presence", value: "present" },
                        helpText: "Presencia o ausencia de necrosis comedo.",
                        options: [
                            { value: "absent", label: "Ausente" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "microcalcifications",
                        label: "Microcalcificaciones en la Muestra",
                        type: "checkbox",
                        helpText: "Nota D: Confirmación anatomopatológica de las microcalcificaciones identificadas en la radiografía de las muestras de punción.",
                        options: [
                            { value: "not_identified", label: "No identificadas" },
                            { value: "in_invasive", label: "Presentes en el componente invasor" },
                            { value: "in_dcis", label: "Presentes en el CDIS" },
                            { value: "in_benign", label: "Presentes en tejido mamario benigno / estroma" }
                        ]
                    },
                    {
                        id: "lvi",
                        label: "Invasión Linfovascular (LVI)",
                        type: "radio",
                        helpText: "Identificación de émbolos neoplásicos en espacios vasculares endoteliales en los cilindros de biopsia.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "indeterminate", label: "Dudosa / No concluyente" }
                        ]
                    }
                ]
            },
            {
                name: "BIOMARCADORES E INMUNOHISTOQUÍMICA EN BIOPSIA",
                fields: [
                    {
                        id: "er_status",
                        label: "Receptores de Estrógeno (RE / ER)",
                        type: "radio",
                        helpText: "Guías ASCO/CAP 2020 para biopsia con aguja. Negativo <1%, Positivo Débil 1-10%, Positivo >10%.",
                        options: [
                            { value: "negative", label: "Negativo (<1%)" },
                            { value: "low_positive", label: "Positivo Bajo / Débil (1% - 10%)" },
                            { value: "positive", label: "Positivo (>10%)" },
                            { value: "pending", label: "Pendiente" }
                        ]
                    },
                    {
                        id: "er_percent",
                        label: "% RE Positivo",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "er_status", values: ["low_positive", "positive"] },
                        helpText: "Porcentaje de núcleos tumorales teñidos."
                    },
                    {
                        id: "pgr_status",
                        label: "Receptores de Progesterona (RP / PgR)",
                        type: "radio",
                        helpText: "Guías ASCO/CAP: Negativo <1%, Positivo >=1%.",
                        options: [
                            { value: "negative", label: "Negativo (<1%)" },
                            { value: "positive", label: "Positivo (>=1%)" },
                            { value: "pending", label: "Pendiente" }
                        ]
                    },
                    {
                        id: "pgr_percent",
                        label: "% RP Positivo",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "pgr_status", value: "positive" },
                        helpText: "Porcentaje de núcleos tumorales teñidos para RP."
                    },
                    {
                        id: "her2_ihc",
                        label: "Estado de HER2 por Inmunohistoquímica",
                        type: "select",
                        helpText: "Puntajes 0 y 1+ = Negativo; 2+ = Equívoco (indica FISH reflejo en el bloque); 3+ = Positivo.",
                        options: [
                            { value: "score_0", label: "0: Negativo (sin tinción o tinción tenue en <=10%)" },
                            { value: "score_1_plus", label: "1+: Negativo / HER2-Low (tinción de membrana tenue en >10%)" },
                            { value: "score_2_plus", label: "2+: Equívoco (tinción moderada en >10%, requiere FISH)" },
                            { value: "score_3_plus", label: "3+: Positivo (tinción circunferencial intensa en >10%)" },
                            { value: "pending", label: "Pendiente" }
                        ]
                    },
                    {
                        id: "ki67_index",
                        label: "Índice Ki-67 (%)",
                        type: "number",
                        suffix: "%",
                        helpText: "Porcentaje de proliferación Ki-67 en la biopsia."
                    },
                    {
                        id: "comments",
                        label: "Comentarios y Correlación Radiológica",
                        type: "text",
                        helpText: "Confirmación de concordancia histopatológica con los hallazgos en mamografía/ecografía (categoría BI-RADS reportada)."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 3. TUMOR FILODES DE MAMA (RESECCIÓN)
    // -------------------------------------------------------------------------
    breast_phyllodes: {
        id: "breast_phyllodes",
        title: "Protocolo Sinóptico CAP: Tumor Filodes de Mama (Resección)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        helpText: "Excisión amplia con márgenes libres (tratamiento de elección para preservar la mama) o mastectomía total (en tumores gigantescos con relación mama-tumor desfavorable).",
                        options: [
                            { value: "excision", label: "Excisión local amplia (tumorectomía / cuadrantectomía)" },
                            { value: "total_mastectomy", label: "Mastectomía total (simple)" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "specimen_laterality",
                        label: "Lateralidad de la Muestra",
                        type: "radio",
                        helpText: "Mama derecha, mama izquierda o no especificada.",
                        options: [
                            { value: "right", label: "Mama derecha" },
                            { value: "left", label: "Mama izquierda" },
                            { value: "unspecified", label: "No especificada" }
                        ]
                    },
                    {
                        id: "tumor_site",
                        label: "Localización del Tumor",
                        type: "select",
                        helpText: "Cuadrante o sitio anatómico de la lesión filodes.",
                        options: [
                            { value: "upper_outer", label: "Cuadrante superior externo (CSE)" },
                            { value: "lower_outer", label: "Cuadrante inferior externo (CIE)" },
                            { value: "upper_inner", label: "Cuadrante superior interno (CSI)" },
                            { value: "lower_inner", label: "Cuadrante inferior interno (CII)" },
                            { value: "central", label: "Región central" },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    }
                ]
            },
            {
                name: "DIMENSIONES DEL TUMOR",
                fields: [
                    {
                        id: "size_greatest_mm",
                        label: "Dimensión Máxima del Tumor (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Diámetro mayor del tumor filodes en milímetros. Los tumores filodes frecuentemente alcanzan tamaños voluminosos (>50 mm)."
                    },
                    {
                        id: "size_additional_w",
                        label: "Dimensión Adicional (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Segunda dimensión ortogonal."
                    },
                    {
                        id: "size_additional_h",
                        label: "Dimensión Adicional de Altura/Espesor (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Tercera dimensión ortogonal."
                    }
                ]
            },
            {
                name: "CRITERIOS DIAGNÓSTICOS Y CLASIFICACIÓN HISTOLÓGICA OMS",
                fields: [
                    {
                        id: "histologic_type",
                        label: "Clasificación Histológica / Grado (OMS)",
                        type: "select",
                        helpText: "Nota A: Clasificación OMS de tumores filodes. La estratificación en Benigno, Limítrofe (Borderline) y Maligno requiere la integración conjunta de 6 criterios microscópicos: celularidad estromal, atipia estromal, sobrecrecimiento estromal, tasa mitótica, tipo de borde tumoral y presencia de elementos mesenquimales heterólogos malignos.",
                        options: [
                            { value: "benign", label: "Tumor filodes benigno" },
                            { value: "borderline", label: "Tumor filodes limítrofe (borderline)" },
                            { value: "malignant", label: "Tumor filodes maligno" }
                        ]
                    },
                    {
                        id: "stromal_cellularity",
                        label: "Celularidad Estromal",
                        type: "radio",
                        helpText: "Nota B: Grado de densidad celular en el componente estromal de las hojas filodes: Leve = densidad celular similar a un fibroadenoma celular; Moderada = aumento difuso intermedio de células fusocelulares estromales; Marcada = estroma densamente hipercelular con amontonamiento y superposición de núcleos estromales.",
                        options: [
                            { value: "mild", label: "Leve (típica de tumor benigno)" },
                            { value: "moderate", label: "Moderada (típica de limítrofe)" },
                            { value: "marked", label: "Marcada / Hipercelular densa (típica de maligno)" }
                        ]
                    },
                    {
                        id: "stromal_atypia",
                        label: "Atipia Nuclear Estromal",
                        type: "radio",
                        helpText: "Nota C: Pleomorfismo de los fibroblastos y células estromales: Ninguna a leve = núcleos uniformes y regulares; Moderada = núcleos elongados con variación de tamaño e hipercromasia; Marcada = núcleos bizarros, multinucleados o pleomórficos gigantes con hipercromasia intensa.",
                        options: [
                            { value: "none_to_mild", label: "Ninguna a leve (favorable)" },
                            { value: "moderate", label: "Moderada" },
                            { value: "marked", label: "Marcada / Pleomorfismo atípico severo" }
                        ]
                    },
                    {
                        id: "stromal_overgrowth",
                        label: "Sobrecrecimiento Estromal (Stromal Overgrowth)",
                        type: "radio",
                        helpText: "Nota D: Definición estricta de la OMS: Presencia de al menos un campo microscópico de bajo aumento (objetivo 4x o 10x) compuesto EXCLUSIVAMENTE por estroma sarcomatoide sin ningún elemento epitelial visible. Su presencia es un criterio mayor definitorio de tumor filodes maligno.",
                        options: [
                            { value: "absent", label: "Ausente (el componente epitelial se mezcla de forma homogénea en todo el tumor)" },
                            { value: "present", label: "Presente (al menos un campo 4x/10x desprovisto de epitelio, criterio de malignidad)" }
                        ]
                    },
                    {
                        id: "mitotic_rate",
                        label: "Tasa Mitótica Estromal (Conteo por 10 CGA)",
                        type: "radio",
                        helpText: "Nota E: Recuento de mitosis en las áreas estromales más activas en 10 campos de gran aumento (CGA, objetivo 40x): <5 mitosis / 10 CGA = compatible con Benigno; 5 a 9 mitosis / 10 CGA = compatible con Limítrofe (Borderline); >=10 mitosis / 10 CGA = criterio mayor de Tumor Filodes Maligno.",
                        options: [
                            { value: "lt_5", label: "< 5 mitosis por 10 CGA (Benigno)" },
                            { value: "5_to_9", label: "5 a 9 mitosis por 10 CGA (Limítrofe / Borderline)" },
                            { value: "gte_10", label: ">= 10 mitosis por 10 CGA (Maligno)" }
                        ]
                    },
                    {
                        id: "tumor_borders",
                        label: "Bordes Tumorales (Margen Arquitectural Periférico)",
                        type: "radio",
                        helpText: "Borde de crecimiento en relación al tejido mamario circundante: Empujante / Circunscrito (borde romo expansivo bien delimitado) vs Infiltrativo / Permeativo (infiltración irregular con digitaciones entre los conductos y lóbulos mamarios adyacentes).",
                        options: [
                            { value: "pushing", label: "Circunscrito / Empujante (bien delimitado)" },
                            { value: "infiltrative", label: "Infiltrativo / Permeativo (penetra al parénquima adyacente)" }
                        ]
                    },
                    {
                        id: "malignant_heterologous",
                        label: "Elementos Heterólogos Malignos",
                        type: "radio",
                        helpText: "Nota F: Presencia de diferenciación sarcomatosa mesenquimal heteróloga verdadera: osteosarcoma, condrosarcoma, rabdomiosarcoma, liposarcoma pleomórfico o angiosarcoma. Su identificación califica AUTOMÁTICAMENTE al tumor filodes como MALIGNO, independientemente de los otros parámetros.",
                        options: [
                            { value: "absent", label: "Ausentes" },
                            { value: "present", label: "Presentes (especificar: osteosarcoma, condrosarcoma, rabdomiosarcoma, liposarcoma)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES QUIRÚRGICOS",
                fields: [
                    {
                        id: "margin_status",
                        label: "Estado de los Márgenes Quirúrgicos",
                        type: "radio",
                        helpText: "Los tumores filodes tienen alta propensión a la recurrencia local si los márgenes están en contacto directo con el tumor o son subóptimos (<1 mm).",
                        options: [
                            { value: "all_negative", label: "Márgenes libres de tumor filodes" },
                            { value: "positive", label: "Margen(es) comprometido(s) con tumor filodes" },
                            { value: "cannot_assess", label: "No puede ser evaluado" }
                        ]
                    },
                    {
                        id: "closest_margin",
                        label: "Margen Libre Más Cercano",
                        type: "select",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        helpText: "Localización del margen más próximo.",
                        options: [
                            { value: "anterior", label: "Margen anterior" },
                            { value: "posterior", label: "Margen posterior" },
                            { value: "superior", label: "Margen superior" },
                            { value: "inferior", label: "Margen inferior" },
                            { value: "medial", label: "Margen medial" },
                            { value: "lateral", label: "Margen lateral" }
                        ]
                    },
                    {
                        id: "margin_distance_mm",
                        label: "Distancia al Margen Más Cercano (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        helpText: "Distancia exacta en milímetros (un margen libre >= 10 mm se consideraba históricamente ideal, aunque actualmente márgenes libres sin tumor en tinta con margen estrecho son aceptables si se vigila estrictamente)."
                    },
                    {
                        id: "margins_involved",
                        label: "Margen(es) Comprometido(s)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "positive" },
                        helpText: "Márgenes con tinta en contacto directo con células del tumor filodes.",
                        options: [
                            { value: "anterior", label: "Margen anterior comprometido" },
                            { value: "posterior", label: "Margen posterior comprometido" },
                            { value: "superior", label: "Margen superior comprometido" },
                            { value: "inferior", label: "Margen inferior comprometido" },
                            { value: "medial", label: "Margen medial comprometido" },
                            { value: "lateral", label: "Margen lateral comprometido" }
                        ]
                    }
                ]
            },
            {
                name: "ESTADIFICACIÓN AJCC 8va EDICIÓN (SARCOMAS DE MAMA / FILODES MALIGNO)",
                fields: [
                    {
                        id: "pt_category",
                        label: "Categoría pT (Sarcoma de Tejidos Blandos de Mama)",
                        type: "select",
                        helpText: "Nota G: Clasificación AJCC 8va Ed. para sarcomas de partes blandas de mama (aplicable únicamente a Tumor Filodes Maligno): T1 <=5 cm; T2 >5 cm a <=10 cm; T3 >10 cm a <=15 cm; T4 >15 cm en dimensión máxima.",
                        options: [
                            { value: "na_benign_borderline", label: "No aplicable (Tumor Filodes Benigno o Limítrofe)" },
                            { value: "pT1", label: "pT1: Tumor menor o igual a 5 cm en su dimensión mayor" },
                            { value: "pT2", label: "pT2: Tumor mayor de 5 cm pero menor o igual a 10 cm" },
                            { value: "pT3", label: "pT3: Tumor mayor de 10 cm pero menor o igual a 15 cm" },
                            { value: "pT4", label: "pT4: Tumor mayor de 15 cm en su dimensión mayor" }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios Anatomopatológicos",
                        type: "text",
                        helpText: "Detalles sobre antecedentes de biopsia previa con aguja, recurrencias locales previas y recomendaciones de seguimiento estrecho clínico-ecográfico."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 4. CARCINOMA DE GLÁNDULA TIROIDES (RESECCIÓN)
    // -------------------------------------------------------------------------
    thyroid_carcinoma: {
        id: "thyroid_carcinoma",
        title: "Protocolo Sinóptico CAP: Carcinoma de Glándula Tiroides (Resección)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "select",
                        helpText: "Nota B: Procedimiento tiroideo: Tiroidectomía total (extirpación completa de ambos lóbulos e istmo); Lobectomía tiroidea / Hemitiroidectomía derecha o izquierda con o sin istmectomía; Tiroidectomía subtotal / casi total; Tiroidectomía de compleción (resección del lóbulo remanente tras un diagnóstico de cáncer en hemitiroides previa).",
                        options: [
                            { value: "total_thyroidectomy", label: "Tiroidectomía total" },
                            { value: "near_total_thyroidectomy", label: "Tiroidectomía casi total / subtotal" },
                            { value: "right_lobectomy", label: "Hemitiroidectomía / Lobectomía derecha" },
                            { value: "left_lobectomy", label: "Hemitiroidectomía / Lobectomía izquierda" },
                            { value: "lobectomy_with_isthmusectomy", label: "Lobectomía con istmectomía" },
                            { value: "completion_thyroidectomy", label: "Tiroidectomía de compleción" },
                            { value: "isthmusectomy_only", label: "Istmectomía aislada" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
                fields: [
                    {
                        id: "tumor_site",
                        label: "Localización del Tumor en la Glándula",
                        type: "checkbox",
                        helpText: "Nota C: Ubicación anatómica del foco tumoral: lóbulo derecho, lóbulo izquierdo, istmo o lóbulo piramidal.",
                        options: [
                            { value: "right_lobe", label: "Lóbulo derecho" },
                            { value: "left_lobe", label: "Lóbulo izquierdo" },
                            { value: "isthmus", label: "Istmo" },
                            { value: "pyramidal_lobe", label: "Lóbulo piramidal" }
                        ]
                    },
                    {
                        id: "tumor_focality",
                        label: "Focalidad Tumoral",
                        type: "radio",
                        helpText: "Nota C: Carcinomas tiroideos unifocales vs multifocales. En tumores multifocales, la estadificación pT se fundamenta en la dimensión mayor del foco tumoral dominante más grande. Se debe documentar la presencia de microcarcinomas papilares sincrónicos en el lóbulo contralateral.",
                        options: [
                            { value: "unifocal", label: "Unifocal (nódulo o foco neoplásico único)" },
                            { value: "multifocal", label: "Multifocal (dos o más focos neoplásicos sincrónicos)" }
                        ]
                    },
                    {
                        id: "size_greatest_mm",
                        label: "Dimensión Máxima del Tumor Mayor (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Nota I: Diámetro mayor en milímetros del foco tumoral tiroideo dominante. Papilares <=10 mm (1.0 cm) confinados a la glándula se clasifican como microcarcinomas papilares (pT1a)."
                    },
                    {
                        id: "size_additional_w",
                        label: "Dimensión Transversal Adicional (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Segunda dimensión ortogonal."
                    },
                    {
                        id: "size_additional_h",
                        label: "Dimensión Longitudinal Adicional (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Tercera dimensión ortogonal."
                    }
                ]
            },
            {
                name: "TIPO HISTOLÓGICO (OMS 5ta EDICIÓN 2022)",
                fields: [
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico Principal (Clasificación OMS 2022)",
                        type: "select",
                        helpText: "Notas D, F, G, H: Clasificación de tumores de tiroides derivados de células foliculares y células C. El Carcinoma Papilar de Tiroides (PTC) representa el 80-85%. La variante de células altas (tall-cell) requiere >=30% de células con altura al menos 3 veces su ancho y confiere pronóstico más agresivo. El NIFTP es una neoplasia folicular no invasiva de comportamiento indolente que no debe clasificarse como cáncer franco. El Carcinoma de Tiroides Diferenciado de Alto Grado (DHGTC) y el Carcinoma Pobremente Diferenciado (PDTC, Criterios de Turín) tienen alta propensión a metástasis.",
                        options: [
                            { value: "ptc_classic", label: "Carcinoma papilar de tiroides, clásico (convencional)" },
                            { value: "ptc_follicular_encapsulated", label: "Carcinoma papilar, variante folicular encapsulada con invasión" },
                            { value: "ptc_follicular_infiltrative", label: "Carcinoma papilar, variante folicular infiltrativa" },
                            { value: "ptc_tall_cell", label: "Carcinoma papilar, variante de células altas (tall-cell >=30%)" },
                            { value: "ptc_hobnail", label: "Carcinoma papilar, variante en tachuela (hobnail)" },
                            { value: "ptc_solid", label: "Carcinoma papilar, variante sólida / trabecular" },
                            { value: "ptc_diffuse_sclerosing", label: "Carcinoma papilar, variante esclerosante difusa" },
                            { value: "ptc_oncocytic", label: "Carcinoma papilar, variante oncocítica" },
                            { value: "niftp", label: "NIFTP (Neoplasia folicular tiroidea no invasiva con núcleos de tipo papilar)" },
                            { value: "ftc_minimally_invasive", label: "Carcinoma folicular de tiroides, mínimamente invasivo (solo invasión capsular)" },
                            { value: "ftc_encapsulated_angioinvasive", label: "Carcinoma folicular, encapsulado con angioinvasión" },
                            { value: "ftc_widely_invasive", label: "Carcinoma folicular, ampliamente invasivo" },
                            { value: "oncocytic_carcinoma", label: "Carcinoma oncocítico de tiroides (células de Hürthle)" },
                            { value: "high_grade_differentiated", label: "Carcinoma diferenciado de tiroides de alto grado (DHGTC: mitosis >=5/2 mm2 o necrosis)" },
                            { value: "poorly_differentiated", label: "Carcinoma pobremente diferenciado (PDTC - Criterios de Turín: arquitectura sólida/insular + mitosis>=3 o necrosis)" },
                            { value: "anaplastic", label: "Carcinoma anaplásico de tiroides (indiferenciado)" },
                            { value: "medullary", label: "Carcinoma medular de tiroides (derivado de células C / calcitonina+)" },
                            { value: "other", label: "Otro tipo histológico (especificar)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "ACTIVIDAD PROLIFERATIVA Y CARACTERÍSTICAS HISTOPATOLÓGICAS",
                fields: [
                    {
                        id: "mitotic_count_2mm2",
                        label: "Conteo Mitótico (Mitosis por 2 mm² o 10 CGA)",
                        type: "number",
                        helpText: "Nota E: Recuento de mitosis en un área de 2 mm2 (aproximadamente 10 campos de gran aumento). >=5 mitosis por 2 mm2 define Carcinoma Diferenciado de Alto Grado (DHGTC)."
                    },
                    {
                        id: "tumor_necrosis",
                        label: "Necrosis Tumoral",
                        type: "radio",
                        helpText: "Nota E: Presencia de necrosis tumoral franca (no atribuible a biopsia por punción previa). Es un criterio definitorio mayor de agresividad biológica y carcinoma de alto grado.",
                        options: [
                            { value: "absent", label: "Ausente" },
                            { value: "present", label: "Presente (foco de carcinoma de alto grado / necrosis coagulativa confluente)" }
                        ]
                    },
                    {
                        id: "capsular_invasion",
                        label: "Invasión de la Cápsula Tumoral",
                        type: "radio",
                        helpText: "Nota G: Criterio diagnóstico fundamental en lesiones foliculares y oncocíticas encapsuladas. Requiere la penetración completa a través de todo el espesor de la cápsula tumoral fibrosa por las células neoplásicas (protrusión en forma de hongo o botón de camisa hacia el parénquima tiroideo normal vecino). Las identaciones parciales no califican como invasión capsular.",
                        options: [
                            { value: "na", label: "No aplicable (tumor no encapsulado o difusamente infiltrativo)" },
                            { value: "absent", label: "Ausente (cápsula tumoral íntegra en su totalidad)" },
                            { value: "present", label: "Presente (penetración completa transmural de la cápsula tumoral)" }
                        ]
                    },
                    {
                        id: "angioinvasion",
                        label: "Invasión Vascular / Angioinvasión",
                        type: "select",
                        helpText: "Nota K: Angioinvasión vs invasión linfática. La angioinvasión requiere identificar células tumorales adheridas a la pared endotelial o cubiertas por un trombo de fibrina dentro de vasos venosos o arteriales de la cápsula o fuera de ella. Se estratifica en: Focal (<4 vasos) vs Extensa (>=4 focos vasculares). La angioinvasión extensa confiere un riesgo marcadamente elevado de metástasis a distancia hematógena (hueso, pulmón).",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "focal", label: "Presente, focal (< 4 focos de angioinvasión vascular)" },
                            { value: "extensive", label: "Presente, extensa (>= 4 focos de angioinvasión vascular)" }
                        ]
                    },
                    {
                        id: "lymphatic_invasion",
                        label: "Invasión Linfática",
                        type: "radio",
                        helpText: "Nota K: Presencia de émbolos tumorales en canales endoteliales linfáticos de pared delgada, común en PTC y predictiva de metástasis ganglionares cervicales.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "perineural_invasion",
                        label: "Invasión Perineural (PNI)",
                        type: "radio",
                        helpText: "Infiltración tumoral a lo largo del espacio perineural de fascículos nerviosos intra o peritiroideos.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    }
                ]
            },
            {
                name: "EXTENSIÓN EXTRATIROIDEA",
                fields: [
                    {
                        id: "extrathyroidal_extension",
                        label: "Extensión Extratiroidea (ETE)",
                        type: "select",
                        helpText: "Nota J: En AJCC 8va Edición, la extensión extratiroidea microscópica mínima hacia la grasa peritiroidea o fibras musculares estriadas microscópicas adyacentes YA NO modifica la categoría pT (se mantiene en pT1 o pT2 según el tamaño). Solo la extensión tosca / macroscópica evidente (Gross ETE) detectada intraoperatoriamente o macroscópicamente modifica el estadio: pT3b = invasión macroscópica exclusiva de músculos pretiroideos (esternohioideo, esternotiroideo, tirohioideo, omohioideo); pT4a = invasión tosca de tejido celular subcutáneo, laringe, tráquea, esófago o nervio laríngeo recurrente; pT4b = invasión de fascia prevertebral, arteria carótida o vasos mediastínicos.",
                        options: [
                            { value: "none", label: "No identificada (tumor confinado estrictamente a la glándula tiroides)" },
                            { value: "minimal_microscopic", label: "Mínima / Microscópica a grasa peritiroidea (no modifica pT en AJCC 8va Ed)" },
                            { value: "gross_t3b", label: "Macroscópica a músculos pretiroideos / infrahioideos únicamente (pT3b)" },
                            { value: "gross_t4a", label: "Macroscópica a laringe, tráquea, esófago, nervio laríngeo o celular subcutáneo (pT4a)" },
                            { value: "gross_t4b", label: "Macroscópica a fascia prevertebral o vaina / arteria carótida (pT4b)" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES QUIRÚRGICOS",
                fields: [
                    {
                        id: "margin_status",
                        label: "Estado de Márgenes Quirúrgicos",
                        type: "radio",
                        helpText: "Nota L: Margen quirúrgico tiroideo: superficie entintada del espécimen de resección. Libre = ausencia de células tumorales en la tinta; Comprometido = células tumorales en contacto directo con la tinta.",
                        options: [
                            { value: "all_negative", label: "Todos los márgenes libres de carcinoma" },
                            { value: "positive", label: "Margen(es) quirúrgico(s) comprometido(s)" },
                            { value: "cannot_assess", label: "No puede ser evaluado" }
                        ]
                    },
                    {
                        id: "closest_margin",
                        label: "Margen Libre Más Cercano",
                        type: "select",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        helpText: "Orientación del margen más próximo al carcinoma tiroideo.",
                        options: [
                            { value: "anterior", label: "Margen capsular anterior" },
                            { value: "posterior", label: "Margen posterior (surco traqueoesofágico)" },
                            { value: "superior", label: "Margen del polo superior" },
                            { value: "inferior", label: "Margen del polo inferior" },
                            { value: "isthmic", label: "Margen de sección del istmo (en hemitiroidectomías)" }
                        ]
                    },
                    {
                        id: "margin_distance_mm",
                        label: "Distancia al Margen Más Cercano (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        helpText: "Distancia milimétrica desde las células neoplásicas más externas hasta la tinta quirúrgica."
                    },
                    {
                        id: "margins_involved",
                        label: "Margen(es) Comprometido(s)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "positive" },
                        helpText: "Superficies con tinta en contacto directo con células de carcinoma.",
                        options: [
                            { value: "anterior", label: "Margen anterior comprometido" },
                            { value: "posterior", label: "Margen posterior comprometido" },
                            { value: "superior", label: "Polo superior comprometido" },
                            { value: "inferior", label: "Polo inferior comprometido" },
                            { value: "isthmic", label: "Borde de sección de istmo comprometido" }
                        ]
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS REGIONALES",
                fields: [
                    {
                        id: "node_compartments",
                        label: "Compartimento Ganglionar Evaluado",
                        type: "checkbox",
                        helpText: "Nota M: Compartimento Central (Nivel VI y VII: ganglios peritiroideos, paratraqueales, pretraqueales, laríngeos / de Delphian) vs Compartimento Lateral (Niveles I, II, III, IV, V: cadena yugular interna, accesorio espinal, supraclavicular).",
                        options: [
                            { value: "central_level_6_7", label: "Compartimento central cervical (Nivel VI / VII)" },
                            { value: "lateral_levels_1_5", label: "Compartimento lateral cervical (Niveles I, II, III, IV, V)" },
                            { value: "no_nodes", label: "No se remitieron ganglios linfáticos" }
                        ]
                    },
                    {
                        id: "nodes_examined",
                        label: "Número Total de Ganglios Linfáticos Examinados",
                        type: "number",
                        helpText: "Total de ganglios identificados y evaluados histopatológicamente."
                    },
                    {
                        id: "nodes_positive",
                        label: "Número de Ganglios Linfáticos con Metástasis",
                        type: "number",
                        helpText: "Total de ganglios positivos para metástasis de carcinoma tiroideo."
                    },
                    {
                        id: "central_nodes_positive",
                        label: "Ganglios Positivos en Compartimento Central (Nivel VI)",
                        type: "number",
                        helpText: "Corresponde a la categoría pN1a."
                    },
                    {
                        id: "lateral_nodes_positive",
                        label: "Ganglios Positivos en Compartimento Lateral (Niveles I-V)",
                        type: "number",
                        helpText: "Corresponde a la categoría pN1b."
                    },
                    {
                        id: "largest_metastasis_mm",
                        label: "Tamaño del Depósito Metastásico Mayor (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Dimensión máxima en milímetros del foco de metástasis ganglionar dominante."
                    },
                    {
                        id: "extranodal_extension",
                        label: "Extensión Extranodal (ENE)",
                        type: "radio",
                        helpText: "Infiltración tumoral que atraviesa la cápsula ganglionar hacia el tejido blando adyacente del cuello.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente (extensión extracapsular presente)" }
                        ]
                    }
                ]
            },
            {
                name: "ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8va EDICIÓN)",
                fields: [
                    {
                        id: "patient_age",
                        label: "Edad del Paciente al Diagnóstico (Años)",
                        type: "number",
                        suffix: "años",
                        helpText: "Nota N: En el carcinoma diferenciado de tiroides (papilar y folicular) el punto de corte de edad según AJCC 8va Edición es de 55 AÑOS (anteriormente 45 años en la 7ma Ed). Pacientes <55 años solo tienen Estadio I (cualquier T, cualquier N, M0) o Estadio II (cualquier T, cualquier N, M1). Pacientes >=55 años se estratifican en Estadios I, II, III, IVA y IVB según pTNM."
                    },
                    {
                        id: "pt_category",
                        label: "Categoría pT (Tumor Primario)",
                        type: "select",
                        helpText: "Nota N: pT1a <=1 cm; pT1b >1 a 2 cm; pT2 >2 a 4 cm; pT3a >4 cm limitado a tiroides; pT3b invasión macroscópica de músculos pretiroideos; pT4a invasión de celular subcutáneo, laringe, tráquea, esófago o laríngeo recurrente; pT4b fascia prevertebral o carótida.",
                        options: [
                            { value: "pTX", label: "pTX: Tumor primario no puede ser evaluado" },
                            { value: "pT0", label: "pT0: Sin evidencia de tumor primario" },
                            { value: "pT1a", label: "pT1a: Tumor menor o igual a 1 cm en su mayor dimensión, limitado a tiroides (microcarcinoma)" },
                            { value: "pT1b", label: "pT1b: Tumor mayor de 1 cm pero menor o igual a 2 cm, limitado a tiroides" },
                            { value: "pT2", label: "pT2: Tumor mayor de 2 cm pero menor o igual a 4 cm, limitado a tiroides" },
                            { value: "pT3a", label: "pT3a: Tumor mayor de 4 cm en su mayor dimensión, limitado a tiroides" },
                            { value: "pT3b", label: "pT3b: Invasión extratiroidea macroscópica a músculos infrahioideos / pretiroideos" },
                            { value: "pT4a", label: "pT4a: Invasión tosca a laringe, tráquea, esófago, nervio laríngeo recurrente o celular subcutáneo" },
                            { value: "pT4b", label: "pT4b: Invasión tosca a fascia prevertebral, o compromiso de arteria carótida o vasos mediastínicos" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN (Ganglios Linfáticos Regionales)",
                        type: "select",
                        helpText: "Nota N: pN0 = Sin metástasis ganglionares; pN1a = Metástasis en compartimento central (Nivel VI o VII: pretraqueales, paratraqueales, Delphiano); pN1b = Metástasis en compartimento lateral cervical (Niveles I a V) o retrofaríngeos.",
                        options: [
                            { value: "pNX", label: "pNX: Ganglios regionales no evaluados" },
                            { value: "pN0", label: "pN0: Ganglios evaluados negativos para metástasis" },
                            { value: "pN1a", label: "pN1a: Metástasis en ganglios del compartimento central (Nivel VI o VII)" },
                            { value: "pN1b", label: "pN1b: Metástasis en ganglios cervicales laterales (Niveles I, II, III, IV, V) o retrofaríngeos" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM (Metástasis a Distancia)",
                        type: "radio",
                        helpText: "pM1 requiere comprobación histopatológica o citológica de metástasis a distancia (pulmón, hueso, encéfalo). De lo contrario, cM0.",
                        options: [
                            { value: "cM0", label: "cM0: Sin evidencia de metástasis a distancia" },
                            { value: "pM1", label: "pM1: Metástasis a distancia confirmada microscópicamente" }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios y Estudios Moleculares (BRAF, RAS, RET, TERT)",
                        type: "text",
                        helpText: "Consignar resultados de estudios moleculares: mutación BRAF V600E (común en PTC clásico y tall-cell), mutaciones RAS (comunes en variante folicular y FTC), fusiones RET/PTC, mutación promotora TERT (marcador de alto riesgo de progresión y agresividad)."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 5. CARCINOMA EXOCRINO DE PÁNCREAS (RESECCIÓN)
    // -------------------------------------------------------------------------
    pancreas_exocrine: {
        id: "pancreas_exocrine",
        title: "Protocolo Sinóptico CAP: Carcinoma Exocrino de Páncreas (Resección)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "select",
                        helpText: "Nota A: Tipo de espécimen pancreático: Pancreatoduodenectomía (operación de Whipple convencional con antrectomía o preservadora de píloro de Traverso-Longmire); Pancreatectomía distal (usualmente con esplenectomía para tumores de cuerpo y cola); Pancreatectomía total; Pancreatectomía central.",
                        options: [
                            { value: "whipple_pylorus_preserving", label: "Pancreatoduodenectomía preservadora de píloro (Whipple modificada)" },
                            { value: "whipple_standard", label: "Pancreatoduodenectomía estándar (Whipple convencional con antrectomía)" },
                            { value: "distal_pancreatectomy_with_spleen", label: "Pancreatectomía distal con esplenectomía" },
                            { value: "distal_pancreatectomy_no_spleen", label: "Pancreatectomía distal sin esplenectomía" },
                            { value: "total_pancreatectomy", label: "Pancreatectomía total" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
                fields: [
                    {
                        id: "tumor_site",
                        label: "Localización del Tumor en el Páncreas",
                        type: "select",
                        helpText: "Nota B: Localización anatómica: Cabeza (a la derecha del borde izquierdo de la vena mesentérica superior / porta), Proceso uncinado (proyección posterior e inferior de la cabeza rodeando los vasos mesentéricos), Cuello (sobre los vasos mesentéricos superiores), Cuerpo (a la izquierda de los vasos mesentéricos hasta el hilio esplénico), Cola (adyacente al hilio esplénico).",
                        options: [
                            { value: "head", label: "Cabeza del páncreas" },
                            { value: "uncinate_process", label: "Proceso uncinado" },
                            { value: "neck", label: "Cuello del páncreas" },
                            { value: "body", label: "Cuerpo del páncreas" },
                            { value: "tail", label: "Cola del páncreas" },
                            { value: "diffuse", label: "Difuso / Múltiples sitios" }
                        ]
                    },
                    {
                        id: "size_greatest_cm",
                        label: "Dimensión Máxima del Tumor (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Nota E: Diámetro mayor del componente invasor en centímetros. AJCC 8va Edición pT se fundamenta estrictamente en el tamaño: pT1a <=0.5 cm; pT1b >0.5 a 1 cm; pT1c >1 a 2 cm; pT2 >2 a 4 cm; pT3 >4 cm."
                    },
                    {
                        id: "size_additional_w",
                        label: "Dimensión Adicional (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Segunda dimensión ortogonal."
                    },
                    {
                        id: "size_additional_h",
                        label: "Dimensión Adicional de Espesor (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Tercera dimensión ortogonal."
                    }
                ]
            },
            {
                name: "TIPO HISTOLÓGICO Y GRADO",
                fields: [
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico (OMS)",
                        type: "select",
                        helpText: "Nota C: El Adenocarcinoma Ductal Convencional representa más del 85-90% de los carcinomas exocrinos del páncreas. Otros subtipos incluyen Carcinoma Adenoescamoso (pronóstico muy agresivo), Carcinoma Coloide (mucinoso no quístico, asociado a menudo a IPMN intestinal, mejor pronóstico), Carcinoma Indiferenciado (anaplásico), Carcinoma Indiferenciado con células gigantes de tipo osteoclástico y Carcinoma de Células Acinares.",
                        options: [
                            { value: "ductal_adenocarcinoma", label: "Adenocarcinoma ductal de páncreas (convencional)" },
                            { value: "adenosquamous", label: "Carcinoma adenoescamoso" },
                            { value: "colloid_mucinous", label: "Carcinoma coloide (adenocarcinoma mucinoso no quístico)" },
                            { value: "undifferentiated", label: "Carcinoma indiferenciado / anaplásico" },
                            { value: "undifferentiated_osteoclast", label: "Carcinoma indiferenciado con células gigantes de tipo osteoclástico" },
                            { value: "signet_ring", label: "Carcinoma de células en anillo de sello / pobremente cohesivo" },
                            { value: "acinar_cell", label: "Carcinoma de células acinares" },
                            { value: "ipmn_associated_invasive", label: "Neoplasia mucinosa papilar intraductal (IPMN) con carcinoma invasor asociado" },
                            { value: "mcn_associated_invasive", label: "Neoplasia mucinosa quística (NMQ / MCN) con carcinoma invasor asociado" },
                            { value: "other", label: "Otro tipo histológico (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "histologic_grade",
                        label: "Grado Histológico (Diferenciación Glandular)",
                        type: "select",
                        helpText: "Nota D: Grado histopatológico para adenocarcinoma ductal: Grado 1 (Bien diferenciado: >95% compuesto por glándulas bien formadas); Grado 2 (Moderadamente diferenciado: 50% a 95% de glándulas bien formadas y ductos cribiformes); Grado 3 (Pobremente diferenciado: <50% de componente glandular con sábanas sólidas de células atípicas).",
                        options: [
                            { value: "grade_1", label: "Grado 1 (G1): Bien diferenciado (>95% diferenciación glandular)" },
                            { value: "grade_2", label: "Grado 2 (G2): Moderadamente diferenciado (50% - 95% glandular)" },
                            { value: "grade_3", label: "Grado 3 (G3): Pobremente diferenciado (<50% glandular / nidos sólidos)" },
                            { value: "cannot_assess", label: "No puede ser evaluado" }
                        ]
                    },
                    {
                        id: "treatment_effect",
                        label: "Efecto del Tratamiento Preoperatorio (Neoadyuvancia)",
                        type: "select",
                        helpText: "Nota H: Puntuación de regresión CAP tras quimioterapia / radioterapia neoadyuvante (ej. FOLFIRINOX): Puntaje 0 = Respuesta completa (sin células tumorales viables); Puntaje 1 = Respuesta casi completa (células cancerosas aisladas viables diminutas); Puntaje 2 = Respuesta parcial (células viables evidentes con estroma fibrótico extenso); Puntaje 3 = Respuesta pobre o nula (tumor viable extenso sin regresión).",
                        options: [
                            { value: "no_therapy", label: "Sin terapia presúrgica neoadyuvante conocida" },
                            { value: "score_0_complete", label: "Puntaje 0 (CAP): Respuesta completa (sin tumor viable, ypT0 ypN0)" },
                            { value: "score_1_near_complete", label: "Puntaje 1 (CAP): Respuesta casi completa (células aisladas escasas)" },
                            { value: "score_2_partial", label: "Puntaje 2 (CAP): Respuesta parcial (tumor residual con fibrosis apreciable)" },
                            { value: "score_3_poor", label: "Puntaje 3 (CAP): Respuesta pobre o ausente (tumor viable extenso)" }
                        ]
                    }
                ]
            },
            {
                name: "EXTENSIÓN E INVASIÓN PERINEURAL Y VASCULAR",
                fields: [
                    {
                        id: "direct_extension",
                        label: "Extensión Tumoral Directa",
                        type: "checkbox",
                        helpText: "Estructuras adyacentes infiltradas directamente por contigüidad tumoral: tejido adiposo peripancreático, pared duodenal, colédoco, bazo, estómago, colon, glándula suprarrenal o vasos sanguíneos mayores.",
                        options: [
                            { value: "confined_pancreas", label: "Confinado al parénquima pancreático" },
                            { value: "peripancreatic_fat", label: "Invasión de tejido adiposo peripancreático" },
                            { value: "duodenum", label: "Invasión de pared duodenal" },
                            { value: "bile_duct", label: "Invasión de conducto biliar común (colédoco)" },
                            { value: "major_arteries", label: "Invasión de tronco celíaco, arteria mesentérica superior o arteria hepática común (pT4)" },
                            { value: "spleen", label: "Invasión de bazo" },
                            { value: "stomach_colon", label: "Invasión de estómago o colon" }
                        ]
                    },
                    {
                        id: "lvi",
                        label: "Invasión Linfática y/o Vascular (LVI)",
                        type: "radio",
                        helpText: "Nota F: Presencia de células tumorales en vasos venosos o linfáticos. Es un factor adverso mayor asociado a recidiva hepática y ganglionar.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "pni",
                        label: "Invasión Perineural (PNI)",
                        type: "radio",
                        helpText: "Nota G: La invasión perineural es un hallazgo patognomónico extremadamente frecuente (>80-90%) en adenocarcinoma ductal de páncreas. Se asocia al dolor dorsolumbar característico y constituye una vía fundamental de diseminación locorregional al plexo celíaco y retroperitoneo.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente (infiltración neoplásica en vainas perineurales)" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES QUIRÚRGICOS",
                fields: [
                    {
                        id: "margin_status_invasive",
                        label: "Estado General de Márgenes para Carcinoma Invasor",
                        type: "radio",
                        helpText: "Nota I: En cirugía pancreática, se adopta ampliamente la regla de 1.0 mm (consenso CAP / europeo): un margen se considera POSITIVO (R1) si hay células tumorales en contacto con la tinta O a menos de 1.0 mm de la superficie entintada, debido al altísimo riesgo de recidiva local.",
                        options: [
                            { value: "all_negative_gt_1mm", label: "Todos los márgenes libres de tumor a > 1.0 mm (R0)" },
                            { value: "close_lte_1mm", label: "Márgenes microscópicamente cercanos (<= 1.0 mm del margen, R1 según consenso)" },
                            { value: "positive_direct", label: "Margen(es) directamente comprometido(s) con tumor en la tinta (R1)" }
                        ]
                    },
                    {
                        id: "uncinate_margin_status",
                        label: "Margen Uncinado / Retroperitoneal (Surco Vascular de la AMS)",
                        type: "select",
                        helpText: "Nota I: El margen del proceso uncinado (margen retroperitoneal / surco mesentérico superior) es el margen quirúrgico MÁS CRÍTICO y determinante del pronóstico tras una duodenopancreatectomía.",
                        options: [
                            { value: "negative_gt_1mm", label: "Libre de tumor invasor a > 1.0 mm" },
                            { value: "close_lte_1mm", label: "Cercano al margen (<= 1.0 mm)" },
                            { value: "positive", label: "Comprometido con tumor invasor en la tinta" },
                            { value: "na", label: "No aplicable (pancreatectomía distal)" }
                        ]
                    },
                    {
                        id: "uncinate_distance_mm",
                        label: "Distancia al Margen Uncinado / Retroperitoneal (mm)",
                        type: "number",
                        suffix: "mm",
                        helpText: "Distancia en milímetros desde las células tumorales más profundas hasta la superficie entintada del proceso uncinado."
                    },
                    {
                        id: "neck_margin_status",
                        label: "Margen de Sección Pancreática (Cuello / Parénquima)",
                        type: "radio",
                        helpText: "Margen de transección del parénquima pancreático remanente.",
                        options: [
                            { value: "negative", label: "Libre de tumor invasor" },
                            { value: "positive", label: "Comprometido con carcinoma invasor" }
                        ]
                    },
                    {
                        id: "bile_duct_margin_status",
                        label: "Margen del Conducto Biliar Común (Colédoco)",
                        type: "radio",
                        helpText: "Margen de transección del conducto biliar proximal.",
                        options: [
                            { value: "negative", label: "Libre de tumor invasor" },
                            { value: "positive", label: "Comprometido con carcinoma invasor" },
                            { value: "na", label: "No aplicable" }
                        ]
                    },
                    {
                        id: "margin_dysplasia_panin",
                        label: "Márgenes Comprometidos por PanIN de Alto Grado / Displasia",
                        type: "checkbox",
                        helpText: "Presencia de Neoplasia Intraepitelial Pancreática (PanIN de alto grado) o displasia de alto grado en los bordes de sección ductal o biliar.",
                        options: [
                            { value: "pancreatic_neck_panin", label: "PanIN de alto grado en margen de sección pancreática" },
                            { value: "bile_duct_dysplasia", label: "Displasia de alto grado en margen de conducto biliar" }
                        ]
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS REGIONALES",
                fields: [
                    {
                        id: "nodes_examined",
                        label: "Número Total de Ganglios Linfáticos Examinados",
                        type: "number",
                        helpText: "Se recomienda examinar al menos 12 ganglios linfáticos para una estadificación nodal adecuada en especímenes de duodenopancreatectomía."
                    },
                    {
                        id: "nodes_positive",
                        label: "Número de Ganglios Linfáticos con Metástasis",
                        type: "number",
                        helpText: "Número total de ganglios con metástasis: AJCC 8va Edición define: pN0 = 0 ganglios; pN1 = 1 a 3 ganglios con metástasis; pN2 = 4 o más ganglios con metástasis."
                    },
                    {
                        id: "extranodal_extension",
                        label: "Extensión Extranodal (ENE)",
                        type: "radio",
                        helpText: "Invasión tumoral a través de la cápsula ganglionar hacia la grasa perinodal.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    }
                ]
            },
            {
                name: "ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8va EDICIÓN)",
                fields: [
                    {
                        id: "tnm_modifiers",
                        label: "Modificadores TNM",
                        type: "checkbox",
                        helpText: "Prefijos AJCC: 'y' = post-quimioterapia neoadyuvante (FOLFIRINOX o gemcitabina/nab-paclitaxel); 'r' = recurrencia.",
                        options: [
                            { value: "y", label: "y - Post-tratamiento neoadyuvante" },
                            { value: "r", label: "r - Recurrencia tumoral" }
                        ]
                    },
                    {
                        id: "pt_category",
                        label: "Categoría pT (Tumor Primario)",
                        type: "select",
                        helpText: "Nota J: Clasificación AJCC 8va Edición basada en tamaño tumoral y compromiso vascular mayor: pT1a <=0.5 cm; pT1b >0.5 a 1.0 cm; pT1c >1.0 a 2.0 cm; pT2 >2.0 a 4.0 cm; pT3 >4.0 cm; pT4 involucra tronco celíaco, arteria mesentérica superior o arteria hepática común (irresecable irreconstruible).",
                        options: [
                            { value: "pTX", label: "pTX: Tumor primario no puede ser evaluado" },
                            { value: "pT0", label: "pT0: Sin evidencia de tumor primario (ej. ypT0 tras respuesta completa)" },
                            { value: "pT1a", label: "pT1a: Tumor menor o igual a 0.5 cm en su dimensión mayor" },
                            { value: "pT1b", label: "pT1b: Tumor mayor de 0.5 cm pero menor o igual a 1.0 cm" },
                            { value: "pT1c", label: "pT1c: Tumor mayor de 1.0 cm pero menor o igual a 2.0 cm" },
                            { value: "pT2", label: "pT2: Tumor mayor de 2.0 cm pero menor o igual a 4.0 cm" },
                            { value: "pT3", label: "pT3: Tumor mayor de 4.0 cm en su mayor dimensión" },
                            { value: "pT4", label: "pT4: El tumor compromete tronco celíaco, arteria mesentérica superior o arteria hepática común" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN (Ganglios Linfáticos Regionales)",
                        type: "select",
                        helpText: "Nota J: Clasificación numérica AJCC 8va Edición: pN0 = Sin metástasis ganglionares; pN1 = Metástasis en 1 a 3 ganglios linfáticos regionales; pN2 = Metástasis en 4 o más ganglios linfáticos regionales.",
                        options: [
                            { value: "pNX", label: "pNX: Ganglios regionales no evaluados" },
                            { value: "pN0", label: "pN0: Sin metástasis en ganglios linfáticos regionales (0 ganglios)" },
                            { value: "pN1", label: "pN1: Metástasis en 1 a 3 ganglios linfáticos regionales" },
                            { value: "pN2", label: "pN2: Metástasis en 4 o más ganglios linfáticos regionales" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM (Metástasis a Distancia)",
                        type: "radio",
                        helpText: "pM1 confirmado patológicamente en implantes peritoneales, metástasis hepáticas sincrónicas o epiplón.",
                        options: [
                            { value: "cM0", label: "cM0: Sin evidencia clínica de metástasis a distancia" },
                            { value: "pM1", label: "pM1: Metástasis a distancia confirmada microscópicamente" }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios y Estudios Moleculares / Inestabilidad Microsatelital",
                        type: "text",
                        helpText: "Nota L: Se recomienda test de Inestabilidad Microsatelital (MSI / proteínas MMR: MLH1, PMS2, MSH2, MSH6) para evaluar elegibilidad para inmunoterapia con inhibidores de PD-1 (Pembrolizumab). Registrar mutaciones somáticas conocidas (KRAS, TP53, SMAD4, BRCA1/2)."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 6. TUMOR NEUROENDOCRINO BIEN DIFERENCIADO DE PÁNCREAS (PanNET)
    // -------------------------------------------------------------------------
    pancreas_neuroendocrine: {
        id: "pancreas_neuroendocrine",
        title: "Protocolo Sinóptico CAP: Tumor Neuroendocrino Bien Diferenciado de Páncreas (PanNET)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "select",
                        helpText: "Nota C: Enucleación tumoral (frecuente en insulinomas pequeños bien delimitados); Pancreatectomía distal (con o sin preservación de bazo); Pancreatoduodenectomía (Whipple); Pancreatectomía total.",
                        options: [
                            { value: "enucleation", label: "Enucleación simple del nódulo tumoral" },
                            { value: "distal_with_spleen", label: "Pancreatectomía distal con esplenectomía" },
                            { value: "distal_spleen_preserving", label: "Pancreatectomía distal con preservación de bazo" },
                            { value: "whipple", label: "Pancreatoduodenectomía (Whipple)" },
                            { value: "total_pancreatectomy", label: "Pancreatectomía total" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "clinical_functional_status",
                        label: "Síndrome Clínico / Estado Funcional",
                        type: "select",
                        helpText: "Nota B: Los tumores neuroendocrinos funcionantes producen síndromes endocrinos clínicos por hipersecreción hormonal: Insulinoma (hipoglucemia grave); Gastrinoma / Síndrome de Zollinger-Ellison (úlceras pépticas refractarias); Glucagonoma (eritema necrolítico migratorio, diabetes); VIPoma / Síndrome de Verner-Morrison (diarrea secretoria masiva, hipopotasemia); Somatostatinoma (esteatorrea, colelitiasis). Los no funcionantes no generan síntomas hormonales pero expresan sinaptofisina y cromogranina A.",
                        options: [
                            { value: "non_functional", label: "No funcionante (asintomático hormonalmente, el más común)" },
                            { value: "insulinoma", label: "Insulinoma (síndrome de hipoglucemia hiperinsulinémica)" },
                            { value: "gastrinoma", label: "Gastrinoma (síndrome de Zollinger-Ellison)" },
                            { value: "glucagonoma", label: "Glucagonoma (síndrome de eritema necrolítico migratorio)" },
                            { value: "vipoma", label: "VIPoma (síndrome de diarrea acuosa, hipopotasemia y aclorhidria)" },
                            { value: "somatostatinoma", label: "Somatostatinoma" },
                            { value: "unspecified", label: "No especificado / Clínicamente no disponible" }
                        ]
                    }
                ]
            },
            {
                name: "LOCALIZACIÓN Y FOCALIDAD TUMORAL",
                fields: [
                    {
                        id: "tumor_site",
                        label: "Localización del Tumor en el Páncreas",
                        type: "select",
                        helpText: "Nota D: Localización anatómica: Cabeza, Proceso uncinado, Cuello, Cuerpo, Cola.",
                        options: [
                            { value: "head", label: "Cabeza del páncreas" },
                            { value: "uncinate", label: "Proceso uncinado" },
                            { value: "neck", label: "Cuello del páncreas" },
                            { value: "body", label: "Cuerpo del páncreas" },
                            { value: "tail", label: "Cola del páncreas" }
                        ]
                    },
                    {
                        id: "tumor_focality",
                        label: "Focalidad Tumoral",
                        type: "radio",
                        helpText: "Nota H: Nódulo unifocal vs Tumores Multifocales. La multifocalidad o presencia de microadenomatosis neuroendocrina se asocia fuertemente con síndromes hereditarios: Neoplasia Endocrina Múltiple tipo 1 (MEN 1) o Enfermedad de von Hippel-Lindau (VHL).",
                        options: [
                            { value: "unifocal", label: "Unifocal (tumor único aislado)" },
                            { value: "multifocal", label: "Multifocal (múltiples nódulos, sospecha de MEN 1 / VHL)" }
                        ]
                    },
                    {
                        id: "size_greatest_cm",
                        label: "Dimensión Máxima del Tumor Mayor (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Nota G: Diámetro mayor en centímetros. Nódulos <0.5 cm se consideran microadenomas neuroendocrinos. En AJCC Versión 9: pT1 <=2 cm; pT2 >2 a 4 cm; pT3 >4 cm o invasión de duodeno/colédoco."
                    },
                    {
                        id: "size_additional_w",
                        label: "Dimensión Adicional (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Segunda dimensión ortogonal."
                    },
                    {
                        id: "size_additional_h",
                        label: "Dimensión Adicional de Espesor (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Tercera dimensión ortogonal."
                    }
                ]
            },
            {
                name: "GRADO HISTOLÓGICO Y ACTIVIDAD PROLIFERATIVA (OMS / AJCC VERSIÓN 9)",
                fields: [
                    {
                        id: "histologic_grade",
                        label: "Grado Histológico del PanNET (OMS 2019 / AJCC Versión 9)",
                        type: "select",
                        helpText: "Nota E, F: Grado en Tumores Neuroendocrinos Bien Diferenciados: G1 = Conteo mitótico <2 mitosis por 2 mm2 Y Ki-67 <3%; G2 = Conteo mitótico 2 a 20 mitosis por 2 mm2 O Ki-67 entre 3% y 20%; G3 = Conteo mitótico >20 por 2 mm2 O Ki-67 >20%, pero conservando arquitectura organoide bien diferenciada ('salt-and-pepper' nuclear, DAXX/ATRX mutado, p53/Rb preservados). NOTA: Debe distinguirse claramente del Carcinoma Neuroendocrino Pobremente Diferenciado (NEC de células pequeñas o células grandes), que es una neoplasia biológicamente diferente con mutaciones en TP53 y RB1.",
                        options: [
                            { value: "g1", label: "Grado 1 (G1): Conteo mitótico < 2/2 mm² Y Ki-67 < 3%" },
                            { value: "g2", label: "Grado 2 (G2): Conteo mitótico 2-20/2 mm² O Ki-67 entre 3% y 20%" },
                            { value: "g3_well_diff", label: "Grado 3 (G3) Bien Diferenciado: Conteo mitótico > 20/2 mm² O Ki-67 > 20% (arquitectura organoide conservada)" }
                        ]
                    },
                    {
                        id: "mitotic_count_2mm2",
                        label: "Conteo Mitótico Exacto (Mitosis por 2 mm²)",
                        type: "number",
                        helpText: "Nota F: Recuento estricto de mitosis en un área de 2 mm2 en campos continuos en las áreas de mayor proliferación."
                    },
                    {
                        id: "ki67_index",
                        label: "Índice de Proliferación Ki-67 (%)",
                        type: "number",
                        suffix: "%",
                        helpText: "Nota F: Conteo porcentual del índice Ki-67 en zonas de 'hot-spot' evaluando al menos 500 a 2000 células. Es el biomarcador más robusto y crítico para el grado biológico y la toma de decisiones clínicas."
                    },
                    {
                        id: "tumor_necrosis",
                        label: "Necrosis Tumoral",
                        type: "radio",
                        helpText: "Nota K: La presencia de necrosis coagulativa es poco habitual en PanNETs bien diferenciados pero constituye un indicador independiente mayor de conducta clínica agresiva.",
                        options: [
                            { value: "absent", label: "Ausente" },
                            { value: "present", label: "Presente (necrosis punctata o confluente)" }
                        ]
                    }
                ]
            },
            {
                name: "EXTENSIÓN TUMORAL E INVASIONES",
                fields: [
                    {
                        id: "direct_extension",
                        label: "Extensión Directa del Tumor",
                        type: "checkbox",
                        helpText: "Órganos y tejidos vecinos infiltrados por contigüidad tumoral.",
                        options: [
                            { value: "confined_pancreas", label: "Confinado al parénquima pancreático" },
                            { value: "peripancreatic_fat", label: "Invasión de tejido adiposo peripancreático" },
                            { value: "duodenum", label: "Invasión de pared duodenal (pT3)" },
                            { value: "bile_duct", label: "Invasión de conducto biliar común (pT3)" },
                            { value: "adjacent_organs", label: "Invasión de estómago, bazo, colon o glándula suprarrenal (pT4)" },
                            { value: "celiac_sma", label: "Invasión de tronco celíaco o arteria mesentérica superior (pT4)" }
                        ]
                    },
                    {
                        id: "lvi",
                        label: "Invasión Linfática y/o Vascular (LVI)",
                        type: "radio",
                        helpText: "Nota I: Invasión de espacios vasculares sanguíneos o linfáticos.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "pni",
                        label: "Invasión Perineural (PNI)",
                        type: "radio",
                        helpText: "Nota J: Infiltración de vainas nerviosas perineurales.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES QUIRÚRGICOS",
                fields: [
                    {
                        id: "margin_status",
                        label: "Estado de Márgenes Quirúrgicos",
                        type: "radio",
                        helpText: "Nota L: Márgenes entintados: libres vs comprometidos por células neuroendocrinas tumorales.",
                        options: [
                            { value: "all_negative", label: "Todos los márgenes libres de tumor" },
                            { value: "positive", label: "Margen(es) quirúrgico(s) comprometido(s)" }
                        ]
                    },
                    {
                        id: "closest_margin",
                        label: "Margen Libre Más Cercano",
                        type: "select",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        helpText: "Margen más próximo.",
                        options: [
                            { value: "pancreatic_transection", label: "Margen de transección pancreática" },
                            { value: "retroperitoneal_uncinate", label: "Margen retroperitoneal / uncinado" },
                            { value: "enucleation_surface", label: "Margen de enucleación / radial" }
                        ]
                    },
                    {
                        id: "margin_distance_mm",
                        label: "Distancia al Margen Más Cercano (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        helpText: "Distancia en milímetros a la superficie entintada más cercana."
                    },
                    {
                        id: "margins_involved",
                        label: "Margen(es) Comprometido(s)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "positive" },
                        helpText: "Superficies entintadas con tumor directo.",
                        options: [
                            { value: "pancreatic_transection", label: "Margen de transección pancreática comprometido" },
                            { value: "retroperitoneal", label: "Margen retroperitoneal comprometido" },
                            { value: "enucleation", label: "Margen de enucleación comprometido" }
                        ]
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS Y METÁSTASIS A DISTANCIA",
                fields: [
                    {
                        id: "nodes_examined",
                        label: "Número Total de Ganglios Linfáticos Examinados",
                        type: "number",
                        helpText: "Total de ganglios regionales evaluados."
                    },
                    {
                        id: "nodes_positive",
                        label: "Número de Ganglios Linfáticos con Metástasis",
                        type: "number",
                        helpText: "Total de ganglios con metástasis (define pN1 en AJCC Versión 9)."
                    },
                    {
                        id: "distant_metastasis",
                        label: "Metástasis a Distancia (Categoría pM)",
                        type: "select",
                        helpText: "Nota M: AJCC Versión 9 para PanNET estratifica pM1 en subcategorías pronósticas: pM1a = Metástasis confinadas exclusivamente al hígado; pM1b = Metástasis extrahepática única (ej. hueso, pulmón, peritoneo); pM1c = Metástasis hepáticas Y extrahepáticas concurrentes.",
                        options: [
                            { value: "cM0", label: "cM0: Sin metástasis a distancia" },
                            { value: "pM1a", label: "pM1a: Metástasis confina exclusivamente al hígado" },
                            { value: "pM1b", label: "pM1b: Metástasis a distancia en un sitio único extrahepático" },
                            { value: "pM1c", label: "pM1c: Metástasis hepáticas y extrahepáticas combinadas o peritoneales" }
                        ]
                    }
                ]
            },
            {
                name: "ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC VERSIÓN 9)",
                fields: [
                    {
                        id: "pt_category",
                        label: "Categoría pT (Tumor Primario PanNET)",
                        type: "select",
                        helpText: "Nota M: AJCC Versión 9 para PanNET: pT1 <=2 cm limitado al páncreas; pT2 >2 a 4 cm limitado al páncreas; pT3 >4 cm o invasión de duodeno o colédoco; pT4 invasión de órganos adyacentes (estómago, bazo, colon, suprarrenal) o vasos mayores (tronco celíaco / AMS).",
                        options: [
                            { value: "pTX", label: "pTX: Tumor primario no evaluable" },
                            { value: "pT1", label: "pT1: Tumor menor o igual a 2 cm en su dimensión mayor, limitado al páncreas" },
                            { value: "pT2", label: "pT2: Tumor mayor de 2 cm pero menor o igual a 4 cm, limitado al páncreas" },
                            { value: "pT3", label: "pT3: Tumor mayor de 4 cm limitado al páncreas, o con invasión del duodeno o colédoco" },
                            { value: "pT4", label: "pT4: Invasión de órganos adyacentes (estómago, bazo, colon, suprarrenal) o vasos mayores (tronco celíaco / AMS)" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN (Ganglios Linfáticos Regionales)",
                        type: "select",
                        helpText: "Nota M: pN0 = Sin metástasis en ganglios regionales; pN1 = Metástasis en ganglios linfáticos regionales.",
                        options: [
                            { value: "pNX", label: "pNX: Ganglios regionales no evaluados" },
                            { value: "pN0", label: "pN0: Sin metástasis en ganglios linfáticos regionales" },
                            { value: "pN1", label: "pN1: Metástasis en ganglios linfáticos regionales" }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Estudios Auxiliares (DAXX / ATRX / p53) y Comentarios",
                        type: "text",
                        helpText: "La pérdida de expresión de DAXX o ATRX por inmunohistoquímica es característica de PanNETs bien diferenciados (incluso en G3) y apoya el diagnóstico frente a un carcinoma neuroendocrino poco diferenciado (NEC)."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 7. FEOCROMOCITOMA Y PARAGANGLIOMA (PPGL)
    // -------------------------------------------------------------------------
    pheochromocytoma_paraganglioma: {
        id: "pheochromocytoma_paraganglioma",
        title: "Protocolo Sinóptico CAP: Feocromocitoma y Paraganglioma (PPGL)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "select",
                        helpText: "Nota B: Suprarrenalectomía total derecha o izquierda (tratamiento estándar de feocromocitoma); Suprarrenalectomía cortical-sparing (parcial con preservación de corteza para evitar insuficiencia suprarrenal bilateral en pacientes con MEN 2 o VHL); Resección de tumor retroperitoneal / mediastínico / cervical (para paragangliomas extra-adrenales).",
                        options: [
                            { value: "total_adrenalectomy_right", label: "Suprarrenalectomía total derecha" },
                            { value: "total_adrenalectomy_left", label: "Suprarrenalectomía total izquierda" },
                            { value: "partial_adrenalectomy", label: "Suprarrenalectomía parcial con preservación cortical" },
                            { value: "extra_adrenal_paraganglioma_resection", label: "Resección de paraganglioma extra-adrenal" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "specimen_laterality",
                        label: "Lateralidad",
                        type: "radio",
                        helpText: "Lado afectado: derecho, izquierdo o bilateral.",
                        options: [
                            { value: "right", label: "Derecho" },
                            { value: "left", label: "Izquierdo" },
                            { value: "bilateral", label: "Bilateral (frecuente en síndromes familiares)" }
                        ]
                    },
                    {
                        id: "specimen_weight_g",
                        label: "Peso del Espécimen / Glándula (gramos)",
                        type: "number",
                        suffix: "g",
                        helpText: "Nota C: El peso de la glándula suprarrenal o masa es un parámetro físico patológico relevante (el peso normal de una suprarrenal adulta es de aproximadamente 4 a 6 gramos)."
                    }
                ]
            },
            {
                name: "DIMENSIONES Y TIPO HISTOLÓGICO",
                fields: [
                    {
                        id: "size_greatest_cm",
                        label: "Dimensión Máxima del Tumor (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Nota C: Diámetro mayor en centímetros. Tumores >=5 cm se clasifican como pT2 en feocromocitoma y conllevan mayor riesgo metastásico."
                    },
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico (OMS 2022)",
                        type: "select",
                        helpText: "Notas A, C: Feocromocitoma (tumor cromafín derivado de la médula suprarrenal intraadrenal) vs Paraganglioma simpático (extra-adrenal toracoabdominopélvico) o parasimpático (cabeza y cuello, no secretor de catecolaminas: glomus carotídeo, yugulotimpánico, vagal). NOTA CRÍTICA OMS: La clasificación de la OMS 2022 establece que TODOS los PPGLs poseen potencial metastásico inherente; no existe un subtipo patológico verdaderamente 'benigno', sino una estratificación de riesgo de metástasis.",
                        options: [
                            { value: "pheochromocytoma", label: "Feocromocitoma (paraganglioma intra-adrenal de médula suprarrenal)" },
                            { value: "paraganglioma_sympathetic", label: "Paraganglioma simpático (extra-adrenal abdominopélvico / retroperitoneal / torácico)" },
                            { value: "paraganglioma_parasympathetic", label: "Paraganglioma parasimpático (cabeza y cuello: carotídeo, yugular, vagal)" }
                        ]
                    },
                    {
                        id: "tumor_focality",
                        label: "Focalidad Tumoral",
                        type: "radio",
                        helpText: "Nota C: Tumores multifocales sincrónicos son sugestivos de mutaciones en línea germinal (VHL, RET/MEN2, NF1 o mutaciones del complejo Succinato Deshidrogenasa SDHx).",
                        options: [
                            { value: "unifocal", label: "Unifocal (nódulo único)" },
                            { value: "multifocal", label: "Multifocal (múltiples nódulos macroscópicos)" }
                        ]
                    }
                ]
            },
            {
                name: "PARÁMETROS HISTOPATOLÓGICOS Y ESTRATIFICACIÓN DE RIESGO (PASS / GAPP)",
                fields: [
                    {
                        id: "growth_pattern",
                        label: "Patrón Arquitectural Dominante",
                        type: "radio",
                        helpText: "Patrón alveolar en nidos organoides clásicos ('Zellballen') rodeados por células sustentaculares vs Patrón difuso en sábanas sólidas con pérdida del entramado organoide.",
                        options: [
                            { value: "zellballen", label: "Nidos alveolares organoides típicos (Zellballen clásicos)" },
                            { value: "diffuse_sheets", label: "Sábanas sólidas difusas / Crecimiento confluente (mayor riesgo)" },
                            { value: "spindle_cell", label: "Crecimiento fusocelular en huso" }
                        ]
                    },
                    {
                        id: "cellularity",
                        label: "Celularidad",
                        type: "radio",
                        helpText: "Densidad celular estromal.",
                        options: [
                            { value: "moderate", label: "Moderada / Típica" },
                            { value: "marked", label: "Marcada hipercelularidad" }
                        ]
                    },
                    {
                        id: "nuclear_pleomorphism",
                        label: "Pleomorfismo Nuclear y Cromatina Bizarra",
                        type: "radio",
                        helpText: "La atipia endocrina multinucleada aislada puede verse en tumores benignos indolentes; el pleomorfismo marcado con hipercromasia intensa confluente suma puntaje de riesgo.",
                        options: [
                            { value: "mild_moderate", label: "Leve a moderado / Atipia endocrina típica" },
                            { value: "marked", label: "Marcado pleomorfismo bizarro y células tumorales monstruosas" }
                        ]
                    },
                    {
                        id: "mitotic_count_2mm2",
                        label: "Tasa Mitótica (Mitosis por 2 mm² o 10 CGA)",
                        type: "radio",
                        helpText: "Nota D: Recuento mitótico: <3 mitosis por 10 CGA vs >=3 mitosis por 10 CGA (parámetro mayor en los sistemas de puntaje PASS y GAPP).",
                        options: [
                            { value: "lt_3", label: "< 3 mitosis por 10 CGA (baja actividad proliferativa)" },
                            { value: "gte_3", label: ">= 3 mitosis por 10 CGA (mayor agresividad biológica)" }
                        ]
                    },
                    {
                        id: "atypical_mitoses",
                        label: "Figuras Mitóticas Atípicas",
                        type: "radio",
                        helpText: "Identificación de figuras mitóticas anormales tripolares o en anillo.",
                        options: [
                            { value: "absent", label: "Ausentes" },
                            { value: "present", label: "Presentes (marcador adverso prominente)" }
                        ]
                    },
                    {
                        id: "tumor_necrosis",
                        label: "Necrosis Tumoral Confluente",
                        type: "radio",
                        helpText: "Nota C: Presencia de necrosis coagulativa confluente verdadera (no atribuible a embolización o biopsia previa). Suma puntaje de riesgo de malignidad en PASS/GAPP.",
                        options: [
                            { value: "absent", label: "Ausente" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "capsular_invasion",
                        label: "Invasión Capsular / Extensión a Tejido Adiposo",
                        type: "radio",
                        helpText: "Invasión que atraviesa la cápsula del tumor infiltrando el tejido adiposo perisuprarrenal o retroperitoneal adyacente (define pT3 en AJCC 8va Ed).",
                        options: [
                            { value: "absent", label: "Ausente (confinado a la glándula suprarrenal)" },
                            { value: "present", label: "Presente (infiltra grasa perisuprarrenal / pT3)" }
                        ]
                    },
                    {
                        id: "vascular_invasion",
                        label: "Invasión Vascular (Angioinvasión)",
                        type: "radio",
                        helpText: "Nota C: Presencia de células tumorales en el lumen de vasos venosos o endoteliales rodeadas de fibrina.",
                        options: [
                            { value: "absent", label: "Ausente" },
                            { value: "present", label: "Presente" }
                        ]
                    }
                ]
            },
            {
                name: "INMUNOHISTOQUÍMICA Y BIOMARCADORES CRÍTICOS",
                fields: [
                    {
                        id: "sdhb_status",
                        label: "Expresión Inmunohistoquímica de SDHB",
                        type: "select",
                        helpText: "Nota H: BIOMARCADOR CRÍTICO OBLIGATORIO: La pérdida de expresión de SDHB (Succinato Deshidrogenasa Subunidad B) en las células tumorales neoplásicas (con control interno positivo conservado en células endoteliales) indica una mutación patogénica en genes del complejo SDH (SDHA, SDHB, SDHC, SDHD o SDHAF2). Estos tumores tienen un riesgo marcadamente elevado de metástasis sistémicas (hasta 50-70%) y requieren estudio genético germinal familiar.",
                        options: [
                            { value: "retained_intact", label: "Expresión conservada / normal (tinción citoplasmática granular granular positiva en células tumorales)" },
                            { value: "loss_deficient", label: "Pérdida de expresión de SDHB (tumores deficientes en SDH: ALTO RIESGO de metástasis y mutación germinal)" },
                            { value: "pending", label: "Pendiente / En proceso" }
                        ]
                    },
                    {
                        id: "s100_sustentacular",
                        label: "Células Sustentaculares Periacinares (S100 / SOX10)",
                        type: "select",
                        helpText: "Preservación del entramado periférico de células sustentaculares alrededor de los nidos de Zellballen. La pérdida difusa o ausencia completa de células sustentaculares correlaciona con comportamiento agresivo y desdiferenciación tumoral.",
                        options: [
                            { value: "preserved", label: "Red sustentacular S100/SOX10 preservada continua (típico de tumor clásico)" },
                            { value: "attenuated", label: "Red sustentacular atenuada / focalmente disminuida" },
                            { value: "complete_loss", label: "Pérdida completa de células sustentaculares (asociado a malignidad)" }
                        ]
                    },
                    {
                        id: "ki67_index",
                        label: "Índice de Proliferación Ki-67 (%)",
                        type: "number",
                        suffix: "%",
                        helpText: "Nota D: Proliferación Ki-67: <1% = muy bajo riesgo; 1-3% = intermedio; >3% = riesgo aumentado de comportamiento metastásico (GAPP score)."
                    },
                    {
                        id: "atrx_status",
                        label: "Expresión de ATRX",
                        type: "radio",
                        helpText: "Nota H: La pérdida de expresión de ATRX ocurre por mutaciones somáticas y se asocia fuertemente al mecanismo alternativo de alargamiento telomérico (ALT) y metástasis agresiva.",
                        options: [
                            { value: "retained", label: "Expresión nuclear de ATRX conservada" },
                            { value: "loss", label: "Pérdida de expresión nuclear de ATRX (marcador de malignidad)" },
                            { value: "not_performed", label: "No evaluado" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES QUIRÚRGICOS",
                fields: [
                    {
                        id: "margin_status",
                        label: "Estado de Márgenes Quirúrgicos",
                        type: "radio",
                        helpText: "Superficie de resección entintada libre de células de feocromocitoma/paraganglioma vs comprometida.",
                        options: [
                            { value: "negative", label: "Todos los márgenes libres de tumor" },
                            { value: "positive", label: "Margen(es) quirúrgico(s) comprometido(s)" }
                        ]
                    }
                ]
            },
            {
                name: "ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8va EDICIÓN)",
                fields: [
                    {
                        id: "pt_category",
                        label: "Categoría pT (Tumor Primario PPGL)",
                        type: "select",
                        helpText: "Nota F: AJCC 8va Edición: pT1 = Feocromocitoma intraadrenal <5 cm sin invasión extra-adrenal; pT2 = Feocromocitoma intraadrenal >=5 cm O Paraganglioma simpático extra-adrenal de cualquier tamaño sin invasión adyacente; pT3 = Extensión / invasión directa al tejido adiposo perisuprarrenal o retroperitoneal; pT4 = Invasión de órganos adyacentes mayores (riñón, hígado, páncreas, pared de vena cava o aorta).",
                        options: [
                            { value: "pTX", label: "pTX: Tumor primario no evaluable" },
                            { value: "pT1", label: "pT1: Feocromocitoma menor de 5 cm en su dimensión mayor, confinado a la glándula suprarrenal" },
                            { value: "pT2", label: "pT2: Feocromocitoma >= 5 cm, o Paraganglioma simpático de cualquier tamaño sin invasión" },
                            { value: "pT3", label: "pT3: Invasión a tejido adiposo perisuprarrenal o retroperitoneal" },
                            { value: "pT4", label: "pT4: Invasión de órganos vecinos (riñón, hígado, páncreas, vena cava, aorta)" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN (Ganglios Linfáticos Regionales)",
                        type: "select",
                        helpText: "Nota F: pN0 = Sin metástasis ganglionares; pN1 = Metástasis en ganglios linfáticos regionales.",
                        options: [
                            { value: "pNX", label: "pNX: Ganglios regionales no evaluados" },
                            { value: "pN0", label: "pN0: Sin metástasis en ganglios regionales" },
                            { value: "pN1", label: "pN1: Metástasis en ganglios linfáticos regionales" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM (Metástasis a Distancia)",
                        type: "radio",
                        helpText: "Nota E: Metástasis a distancia se define como depósito neoplásico en sitios donde normalmente no existe tejido paraganglionar (hueso, hígado, pulmón, ganglios extra-regionales).",
                        options: [
                            { value: "cM0", label: "cM0: Sin evidencia de metástasis a distancia" },
                            { value: "pM1", label: "pM1: Metástasis a distancia confirmada microscópicamente" }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios Anatomopatológicos y Recomendación de Asesoría Genética",
                        type: "text",
                        helpText: "Hasta un 30-40% de todos los pacientes con feocromocitoma o paraganglioma portan una mutación hereditaria en línea germinal (SDHx, VHL, RET, NF1). Se recomienda asesoramiento genético formal para todos los casos."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 8. CITOLOGÍA CERVICOVAGINAL - SISTEMA BETHESDA (ACTUALIZACIÓN 2014 / ASCCP)
    // -------------------------------------------------------------------------
    cervical_cytology_bethesda: {
        id: "cervical_cytology_bethesda",
        title: "Sistema Bethesda para Citología Cervicovaginal (Bethesda 2014 / Guías ASCCP)",
        targetField: "microDesc",
        sections: [
            {
                name: "TIPO DE MUESTRA Y DATOS CLÍNICOS",
                fields: [
                    {
                        id: "specimen_type",
                        label: "Tipo de Muestra Citológica",
                        type: "radio",
                        helpText: "Método de procesamiento citológico: Citología en base líquida (LBC: ThinPrep o SurePath, que disminuye artificios por sangre y moco y permite realizar co-test molecular de VPH en alícuota) vs Citología convencional (frotis de Papanicolaou clásico fijado en alcohol al 96%).",
                        options: [
                            { value: "liquid_based_thinprep", label: "Citología en base líquida (ThinPrep)" },
                            { value: "liquid_based_surepath", label: "Citología en base líquida (SurePath)" },
                            { value: "conventional_pap", label: "Citología convencional (Papanicolaou clásico)" },
                            { value: "liquid_with_molecular", label: "Citología en base líquida con alícuota para biología molecular (Co-test)" }
                        ]
                    },
                    {
                        id: "patient_age",
                        label: "Edad de la Paciente (Años)",
                        type: "number",
                        suffix: "años",
                        helpText: "La edad es un factor determinante: la presencia de células endometriales normales en mujeres >=45 años requiere reporte específico. Además, las guías ASCCP estratifican el tamizaje y manejo por edad (<25, 25-29, >=30 años)."
                    },
                    {
                        id: "clinical_indication",
                        label: "Indicación Clínica / Datos Relevantes",
                        type: "select",
                        helpText: "Tamizaje de rutina, seguimiento de citología atípica previa (ASC-US, LSIL), antecedente de VPH positivo, control post-cono LEEP o sangrado poscoital / metrorragia.",
                        options: [
                            { value: "routine_screening", label: "Tamizaje de rutina" },
                            { value: "followup_prior_abnormal", label: "Seguimiento de citología anormal previa" },
                            { value: "hpv_positive_followup", label: "Seguimiento por antecedente de VPH de alto riesgo positivo" },
                            { value: "post_treatment_leep", label: "Control post-tratamiento escisional (Cono / LEEP)" },
                            { value: "symptomatic_bleeding", label: "Evaluación diagnóstica por sangrado anormal / metrorragia" }
                        ]
                    }
                ]
            },
            {
                name: "IDONEIDAD DE LA MUESTRA (ADECUACIÓN BETHESDA)",
                fields: [
                    {
                        id: "adequacy_status",
                        label: "Adecuación de la Muestra (Idoneidad)",
                        type: "radio",
                        helpText: "Criterios estrictos del Sistema Bethesda 2014: 1. Celularidad escamosa mínima estimada (>=5,000 células en base líquida; 8,000-12,000 en convencional); 2. Componente de zona de transformación (células endocervicales o metaplásicas); 3. Ausencia de factores oscurecedores en >=75% de las células. NOTA 'REGLA DE ORO': Cualquier muestra que contenga células anormales o atípicas es AUTOMÁTICAMENTE SATISFACTORIA independientemente de la celularidad o de factores oscurecedores.",
                        options: [
                            { value: "satisfactory_with_ec_tz", label: "Satisfactoria para evaluación: Presencia de componente endocervical / zona de transformación" },
                            { value: "satisfactory_without_ec_tz", label: "Satisfactoria para evaluación: Carente de componente endocervical / zona de transformación" },
                            { value: "unsatisfactory_scant_cellularity", label: "Insatisfactoria para evaluación: Celularidad escamosa insuficiente (<5,000 en base líquida / <8,000 en convencional)" },
                            { value: "unsatisfactory_obscured_blood", label: "Insatisfactoria para evaluación: Oscurecida en >=75% por sangre" },
                            { value: "unsatisfactory_obscured_inflammation", label: "Insatisfactoria para evaluación: Oscurecida en >=75% por exudado inflamatorio leucocitario intenso" },
                            { value: "unsatisfactory_poor_fixation", label: "Insatisfactoria para evaluación: Mala preservación celular / desecación grave" }
                        ]
                    },
                    {
                        id: "golden_rule_note",
                        label: "Regla de Oro de Atipia Aplicada",
                        type: "checkbox",
                        helpText: "Regla de Oro de Bethesda: Si se identifican células epiteliales atípicas o displásicas (ASC-US, ASC-H, LSIL, HSIL, AGC), la muestra se considera formalmente SATISFACTORIA para evaluación diagnóstica, sin importar celularidad escasa o sangre abundante.",
                        options: [
                            { value: "atypia_overrides_adequacy", label: "Muestra hipocelular u oscurecida pero categorizada como SATISFACTORIA por presencia de atipia diagnóstica" }
                        ]
                    }
                ]
            },
            {
                name: "CATEGORIZACIÓN GENERAL (BETHESDA 2014)",
                fields: [
                    {
                        id: "general_categorization",
                        label: "Categorización General",
                        type: "select",
                        helpText: "Categorización orientadora del Sistema Bethesda 2014: 1. Negativo para lesión intraepitelial o malignidad (NILM); 2. Anormalidad de células epiteliales (escamosas o glandulares); 3. Otros (ej. células endometriales normales en mujeres >=45 años).",
                        options: [
                            { value: "nilm", label: "NEGATIVO PARA LESIÓN INTRAEPITELIAL O MALIGNIDAD (NILM)" },
                            { value: "epithelial_abnormality", label: "ANORMALIDAD DE CÉLULAS EPITELIALES (Escamosas o Glandulares)" },
                            { value: "other_endometrial", label: "OTROS: Células endometriales citológicamente benignas en mujer >= 45 años" }
                        ]
                    }
                ]
            },
            {
                name: "INTERPRETACIÓN CITOMORFOLÓGICA: CÉLULAS ESCAMOSAS",
                fields: [
                    {
                        id: "squamous_interpretation",
                        label: "Interpretación / Diagnóstico de Células Escamosas",
                        type: "select",
                        helpText: "Criterios citomorfológicos Bethesda 2014: NILM: células superficiales e intermedias maduras normales; ASC-US: núcleos 2.5 a 3 veces el tamaño de un núcleo intermedio con hipercromasia leve y contornos regulares; ASC-H: grupos cohesivos pequeños de células con alta relación núcleo-citoplasma e irregularidad nuclear sugerente de HSIL; LSIL: coilocitos clásicos (halo perinuclear cavitado bien delimitado con núcleo agrandado hipercromático condensado) o displasia leve (NIC 1); HSIL: células pequeñas pleomórficas con marcada hipercromasia, contornos irregulares escotados y pérdida del citoplasma (NIC 2, NIC 3, Carcinoma in situ); Carcinoma Escamoso: presencia de diátesis tumoral necrótica hemática con núcleos pleomórficos aberrantes y perlas córneas o queratinización atípica.",
                        options: [
                            { value: "nilm_normal", label: "NILM: Sin alteraciones nucleares atípicas ni lesión escamosa" },
                            { value: "nilm_reactive", label: "NILM: Cambios celulares reactivos asociados a inflamación, reparación o atrofia" },
                            { value: "asc_us", label: "ASC-US: Células escamosas atípicas de significado indeterminado" },
                            { value: "asc_h", label: "ASC-H: Células escamosas atípicas, no se puede descartar lesión intraepitelial de alto grado" },
                            { value: "lsil", label: "LSIL: Lesión intraepitelial escamosa de bajo grado (incluye VPH / displasia leve / NIC 1)" },
                            { value: "hsil", label: "HSIL: Lesión intraepitelial escamosa de alto grado (incluye displasia moderada, severa y CIS / NIC 2 y 3)" },
                            { value: "hsil_features_invasion", label: "HSIL con características sospechosas de invasión franca" },
                            { value: "squamous_cell_carcinoma", label: "Carcinoma de células escamosas (invasor, con diátesis tumoral necrótica)" }
                        ]
                    }
                ]
            },
            {
                name: "INTERPRETACIÓN CITOMORFOLÓGICA: CÉLULAS GLANDULARES",
                fields: [
                    {
                        id: "glandular_interpretation",
                        label: "Interpretación / Diagnóstico de Células Glandulares",
                        type: "select",
                        helpText: "Células Glandulares Atípicas (AGC): AGC endocervicales o endometriales NOS muestran apiñamiento nuclear y aumento de tamaño sin criterios de adenocarcinoma; AGC que favorecen neoplasia presentan núcleos hipertróficos alargados estratificados; Adenocarcinoma In Situ (AIS): placas de células glandulares con núcleos hipercromáticos alargados estratificados, pérdida de moco citoplasmático y formaciones en 'plumas de ave' (feathering) o rosetas; Adenocarcinoma franco: grupos glandulares tridimensionales con macronucléolos prominentes y fondo necrótico.",
                        options: [
                            { value: "none", label: "Sin atipia glandular / No aplicable" },
                            { value: "agc_endocervical_nos", label: "Células endocervicales atípicas, sin otra especificación (AGC / AEC, NOS)" },
                            { value: "agc_endometrial_nos", label: "Células endometriales atípicas, sin otra especificación (AGC, NOS)" },
                            { value: "agc_favor_neoplasia", label: "Células glandulares atípicas (AGC) que favorecen origen neoplásico" },
                            { value: "ais", label: "Adenocarcinoma endocervical in situ (AIS)" },
                            { value: "adenocarcinoma_endocervical", label: "Adenocarcinoma endocervical invasor" },
                            { value: "adenocarcinoma_endometrial", label: "Adenocarcinoma endometrial" },
                            { value: "adenocarcinoma_extrauterine", label: "Adenocarcinoma extrauterino / metastásico" }
                        ]
                    }
                ]
            },
            {
                name: "MICROORGANISMOS Y MICROBIOTA VAGINAL",
                fields: [
                    {
                        id: "microorganisms",
                        label: "Microorganismos / Flora Identificada",
                        type: "checkbox",
                        helpText: "Microbiota y agentes infecciosos reconocibles citológicamente: Lactobacillus spp. representa la flora normal defensiva sana. Trichomonas vaginalis muestra protozoos piriformes gris-azulados con gránulos citoplasmáticos; Candida spp. se identifica por pseudohifas y esporas redondas/ovales; Vaginosis bacteriana muestra desplazamiento de la flora por cocobacilos densos que cubren las células epiteliales ('células clave' / 'clue cells'); Actinomyces forma agregados filamentosos algodonosos en 'madeja de lana' (frecuente en portadoras de DIU); VHS produce multinucleación, moldeamiento nuclear y marginación periférica de cromatina.",
                        options: [
                            { value: "lactobacillus", label: "Flora bacilar compatible con Lactobacillus spp. (microbiota vaginal normal conservada)" },
                            { value: "trichomonas", label: "Microorganismos morfológicamente compatibles con Trichomonas vaginalis" },
                            { value: "candida", label: "Estructuras fúngicas morfológicamente compatibles con Candida spp. (hifas/levaduras)" },
                            { value: "bacterial_vaginosis", label: "Desplazamiento de flora sugestivo de Vaginosis Bacteriana (Gardnerella / Clue cells)" },
                            { value: "actinomyces", label: "Bacterias morfológicamente compatibles con Actinomyces spp. (grumos en madeja)" },
                            { value: "herpes_simplex", label: "Cambios citopáticos compatibles con Virus Herpes Simple (VHS)" },
                            { value: "cytomegalovirus", label: "Cambios celulares sugerentes de Citomegalovirus (CMV, inclusión en ojo de búho)" }
                        ]
                    }
                ]
            },
            {
                name: "ESTUDIOS MOLECULARES CONCURRENTES (CO-TEST VPH)",
                fields: [
                    {
                        id: "hpv_hr_screening",
                        label: "Tamizaje VPH de Alto Riesgo (Co-Test Molecular)",
                        type: "radio",
                        helpText: "Detección molecular de ADN/ARN de los 14 genotipos de VPH de Alto Riesgo oncogénico.",
                        options: [
                            { value: "not_performed", label: "No realizado / Citología aislada" },
                            { value: "negative", label: "NEGATIVO para genotipos de VPH de Alto Riesgo" },
                            { value: "positive", label: "POSITIVO para VPH de Alto Riesgo" }
                        ]
                    },
                    {
                        id: "hpv_16",
                        label: "Genotipificación Específica VPH 16",
                        type: "radio",
                        dependsOn: { field: "hpv_hr_screening", value: "positive" },
                        helpText: "VPH 16 es el genotipo más oncogénico (responsable del 60% de los cánceres de cérvix). Si es positivo en presencia de citología anormal o incluso NILM, las guías ASCCP indican colposcopía obligatoria expedita.",
                        options: [
                            { value: "negative", label: "Negativo para VPH 16" },
                            { value: "positive", label: "POSITIVO para VPH 16 (Alto Riesgo Mayor)" }
                        ]
                    },
                    {
                        id: "hpv_18",
                        label: "Genotipificación Específica VPH 18",
                        type: "radio",
                        dependsOn: { field: "hpv_hr_screening", value: "positive" },
                        helpText: "VPH 18 es el segundo genotipo más prevalente, fuertemente asociado con adenocarcinoma endocervical y carcinoma neuroendocrino.",
                        options: [
                            { value: "negative", label: "Negativo para VPH 18" },
                            { value: "positive", label: "POSITIVO para VPH 18" }
                        ]
                    },
                    {
                        id: "hpv_other_hr",
                        label: "Pool de Otros 12 Genotipos de Alto Riesgo (31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68)",
                        type: "radio",
                        dependsOn: { field: "hpv_hr_screening", value: "positive" },
                        helpText: "Presencia de otros genotipos oncogénicos agrupados.",
                        options: [
                            { value: "negative", label: "Negativo" },
                            { value: "positive", label: "POSITIVO para otros genotipos de Alto Riesgo" }
                        ]
                    }
                ]
            },
            {
                name: "COMENTARIO DEL PATÓLOGO Y RECOMENDACIONES ASCCP",
                fields: [
                    {
                        id: "asccp_recommendation",
                        label: "Conducta Clínica Algorítmica Recomendada (Guías ASCCP 2019/2020 Basadas en Riesgo)",
                        type: "select",
                        helpText: "Guías de Consenso ASCCP basadas en riesgo de NIC 3+: 1. Riesgo inmediato de NIC 3+ <4%: Repetir tamizaje de rutina según edad (a 5 años con co-test o 3 años con citología); 2. Riesgo 4% a 24%: Repetir co-test a 1 año; 3. Riesgo 25% a 59%: Colposcopía obligatoria expedita con toma de biopsias dirigidas; 4. Riesgo >=60% (ej. HSIL con VPH 16+ en multíparas): Evaluación inmediata para tratamiento escisional expedito o colposcopía con biopsia múltiple y legrado endocervical.",
                        options: [
                            { value: "routine_screening_5y", label: "Continuar tamizaje rutinario en 5 años (Estrategia Co-test recomendada) o 3 años (Citología)" },
                            { value: "repeat_cotest_1y", label: "Repetir Co-test (Citología + VPH-AR) en 1 año (riesgo intermedio de NIC 3+ entre 4% y 24%)" },
                            { value: "colposcopy_immediate", label: "Colposcopía diagnóstica expedita con evaluación de biopsia dirigida (riesgo de NIC 3+ >= 25%)" },
                            { value: "colposcopy_endocervical_curettage", label: "Colposcopía con legrado endocervical (ECC) y evaluación endometrial (por AGC / AIS)" },
                            { value: "expedited_treatment_leep", label: "Tratamiento escisional expedito (LEEP / Cono) o colposcopía inmediata (riesgo crítico >= 60%)" }
                        ]
                    },
                    {
                        id: "pathologist_comments",
                        label: "Comentario Microscópico Detallado del Patólogo",
                        type: "text",
                        helpText: "Espacio para descripción morfológica de los frotis, correlación con biopsias previas de cérvix o hallazgos clínicos relevantes."
                    }
                ]
            }
        ]
    }
};

// -----------------------------------------------------------------------------
// COMPILADOR DE INFORME HISTOPATOLÓGICO SINÓPTICO EN ESPAÑOL
// Transforma el estado reactivo del formulario estructurado en un reporte
// histopatológico largo, formal, legible y profesional.
// -----------------------------------------------------------------------------
export function compileSynopticReport(schema, state) {
    if (!schema || !state) return "";

    let text = `<b>RESUMEN DE CASO: ${schema.title.toUpperCase()}</b>\n\n`;

    schema.sections.forEach(section => {
        let sectionHasData = false;
        let sectionText = `<b>${section.name}</b>\n`;

        section.fields.forEach(field => {
            // Check dependencies
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
                            label = label.replace("(especificar)", extra).replace("(explicar)", extra);
                        } else {
                            label += `: ${extra}`;
                        }
                    }
                    sectionText += `• ${field.label}: ${label}\n`;
                } else {
                    sectionText += `• ${field.label}: ${val}\n`;
                }
            } else if (field.type === "checkbox") {
                if (Array.isArray(val) && val.length > 0) {
                    let labels = val.map(v => {
                        const opt = field.options ? field.options.find(o => o.value === v) : null;
                        if (opt) {
                            let label = opt.label;
                            if (opt.hasInput) {
                                const extra = state[`${field.id}_${v}_extra`] || "";
                                if (label.includes("(especificar)")) {
                                    label = label.replace("(especificar)", extra);
                                } else {
                                    label += `: ${extra}`;
                                }
                            }
                            return label;
                        }
                        return v;
                    });
                    sectionText += `• ${field.label}: ${labels.join(", ")}\n`;
                }
            } else if (field.type === "number") {
                const suffix = field.suffix ? ` ${field.suffix}` : "";
                sectionText += `• ${field.label}: ${val}${suffix}\n`;
            } else if (field.type === "text") {
                sectionText += `• ${field.label}: ${val}\n`;
            }
        });

        if (sectionHasData) {
            text += sectionText + `\n`;
        }
    });

    return text.trim();
}
