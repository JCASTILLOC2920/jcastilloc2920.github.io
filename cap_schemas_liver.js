// cap_schemas_liver.js
// PROTOCOLOS SINÓPTICOS OFICIALES DEL COLLEGE OF AMERICAN PATHOLOGISTS (CAP) - HÍGADO Y VÍAS BILIARES
// Basado en: Liver.HCC_4.3.0.0.REL_CAPCP.docx (Junio 2022 / Marzo 2023) y AJCC 8.ª Edición / OMS 5.ª Edición

export const liverSchemas = {
    liver_hcc: {
        id: "liver_hcc",
        title: "Hígado: Carcinoma Hepatocelular (Resección Hepática)",
        subtitle: "Protocolo Oficial CAP v4.3.0.0 (Junio 2022 / Marzo 2023) - AJCC 8.ª Ed. / OMS 5.ª Ed.",
        organ: "Hígado",
        category: "Hepatobiliar",
        targetField: "microDesc",
        sections: [
            {
                id: "sec_specimen",
                name: "1. ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "select",
                        required: true,
                        helpText: "Nota Explicativa A (CAP): Este protocolo aplica únicamente a piezas de resección hepática (parcial o total) que contienen carcinoma hepatocelular (CHC), incluyendo el carcinoma fibrolamelar.\n• No aplica a colangiocarcinoma intrahepático (protocolo propio), hepatocolangiocarcinoma combinado, sarcomas ni metástasis.",
                        options: [
                            { value: "wedge", label: "Resección en cuña (Wedge resection)" },
                            { value: "partial_minor", label: "Hepatectomía parcial menor (menos de 3 segmentos: segmentectomía o bisegmentectomía)" },
                            { value: "partial_major", label: "Hepatectomía parcial mayor (3 o más segmentos: lobectomía hepática derecha o izquierda)" },
                            { value: "partial_nos", label: "Hepatectomía parcial (no especificada de otro modo)" },
                            { value: "total", label: "Hepatectomía total (explante de trasplante hepático ortotópico)" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "specimen_integrity",
                        label: "Integridad del espécimen",
                        type: "radio",
                        helpText: "Evalúa si el espécimen fue recibido intacto en bloque o fragmentado.",
                        options: [
                            { value: "intact", label: "Intacto" },
                            { value: "fragmented", label: "Fragmentado" },
                            { value: "undetermined", label: "No determinado" }
                        ]
                    }
                ]
            },
            {
                id: "sec_histology",
                name: "2. TIPO HISTOLÓGICO Y GRADO",
                fields: [
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico (OMS 5.ª Edición)",
                        type: "select",
                        required: true,
                        helpText: "Nota Explicativa B (CAP): Clasificación histológica OMS:\n• Carcinoma hepatocelular convencional: representa cerca del 70-85% de los tumores malignos primarios hepáticos.\n• Carcinoma fibrolamelar: característico en adolescentes y adultos jóvenes sin cirrosis subyacente; células tumorales grandes intensamente eosinófilas con nucléolos prominentes separadas por bandas fibrosas colágenas laminadas densas; positivo para CD68 y CK7 y mutación de fusión DNAJB1-PRKACA.\n• Variante escirrosa / esclerosante: marcado estroma desmoplásico (mayor al 50% de la masa).\n• Variante de células claras: más del 50% de células ricas en glucógeno/lípidos.",
                        options: [
                            { value: "hcc_conv", label: "Carcinoma hepatocelular (convencional / habitual)" },
                            { value: "hcc_fibrolamellar", label: "Carcinoma hepatocelular, variante fibrolamelar" },
                            { value: "hcc_scirrhous", label: "Carcinoma hepatocelular, variante escirrosa / esclerosante" },
                            { value: "hcc_clear_cell", label: "Carcinoma hepatocelular, variante de células claras" },
                            { value: "hcc_pleomorphic", label: "Carcinoma hepatocelular, de células gigantes pleomórficas" },
                            { value: "other_type", label: "Otro tipo histológico no listado (especificar)", hasInput: true },
                            { value: "cannot_determine", label: "Carcinoma, tipo no determinado" }
                        ]
                    },
                    {
                        id: "histologic_grade",
                        label: "Grado Histológico (AJCC 8.ª Ed. / Edmondson-Steiner / OMS)",
                        type: "select",
                        required: true,
                        helpText: "Nota Explicativa C (CAP): Sistema de 4 niveles del AJCC 8.ª Edición:\n• G1: Bien diferenciado (trabéculas delgadas, hepatocitos con atipia celular mínima).\n• G2: Moderadamente diferenciado (trabéculas de 3 o más células, células acinares/pseudoglandulares, pleomorfismo moderado).\n• G3: Pobremente diferenciado (pleomorfismo marcado, células gigantes tumorales, arquitectura sólida desorganizada).\n• G4: Indiferenciado (células sarcomatoides o anaplásicas sin diferenciación evidente).\n* Para tumores múltiples o heterogéneos, seleccionar el PEOR grado.",
                        options: [
                            { value: "g1", label: "G1: Bien diferenciado (diferenciación celular óptima, trabéculas finas)" },
                            { value: "g2", label: "G2: Moderadamente diferenciado (trabecular engrosado / pseudoglandular)" },
                            { value: "g3", label: "G3: Pobremente diferenciado (arquitectura sólida, pleomorfismo marcado)" },
                            { value: "g4", label: "G4: Indiferenciado (anaplásico / sarcomatoide)" },
                            { value: "gx", label: "GX: El grado no puede ser evaluado" },
                            { value: "na", label: "No aplicable" }
                        ]
                    }
                ]
            },
            {
                id: "sec_tumor_char",
                name: "3. CARACTERÍSTICAS TUMORALES Y LOCALIZACIÓN",
                fields: [
                    {
                        id: "tumor_focality",
                        label: "Focalidad Tumoral",
                        type: "radio",
                        required: true,
                        helpText: "Nota Explicativa D (CAP): La focalidad es crítica para pTNM:\n• Solitario: un único nódulo (permite estadificar como pT1a o pT1b si > 2 cm sin invasión vascular).\n• Múltiple: nódulos sincronos independientes o metástasis intrahepáticas (clasifica automáticamente como pT2 o pT3 si alguno supera los 5 cm).",
                        options: [
                            { value: "solitary", label: "Solitario (nódulo único)" },
                            { value: "multiple", label: "Múltiple (especificar número de nódulos)", hasInput: true },
                            { value: "cannot_determine", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "tumor_site",
                        label: "Localización Hepática (Lóbulos y Segmentos de Couinaud)",
                        type: "select",
                        helpText: "Nota Explicativa D (CAP): Anatomía segmentaria funcional según Couinaud (Segmentos I al VIII):\n• Lóbulo derecho: Segmentos V, VI, VII, VIII.\n• Lóbulo izquierdo: Segmentos II, III, IVa, IVb.\n• Lóbulo caudado: Segmento I (adyacente a la vena cava inferior).",
                        options: [
                            { value: "right_lobe", label: "Lóbulo hepático derecho (Segmentos V, VI, VII o VIII)" },
                            { value: "left_lobe", label: "Lóbulo hepático izquierdo (Segmentos II, III o IV)" },
                            { value: "caudate_lobe", label: "Lóbulo caudado (Segmento I de Couinaud)" },
                            { value: "quadrate_lobe", label: "Lóbulo cuadrado (Segmento IVb)" },
                            { value: "bilobar", label: "Afección bilobar (lóbulos derecho e izquierdo simultáneos)" },
                            { value: "segmental_spec", label: "Segmento anatómico específico (especificar)", hasInput: true },
                            { value: "other", label: "Otra localización (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "tumor_size_viable",
                        label: "Dimensión máxima de tumor viable (Centímetros)",
                        type: "number",
                        suffix: "cm",
                        required: true,
                        helpText: "Nota Explicativa D y G (CAP): Punto de corte fundamental en AJCC 8.ª Edición:\n• <= 2.0 cm: Clasifica como pT1a (independientemente de invasión vascular microvascular).\n• > 2.0 cm y <= 5.0 cm: Clasifica como pT1b (sin invasión vascular) o pT2 (con invasión vascular).\n• > 5.0 cm en tumores múltiples: Clasifica como pT3."
                    },
                    {
                        id: "tumor_size_add_w",
                        label: "Segunda dimensión de tumor viable (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "tumor_size_gross",
                        label: "Dimensión tumoral máxima macroscópica global (cm)",
                        type: "number",
                        suffix: "cm",
                        helpText: "Diámetro macroscópico antes del examen microscópico (incluyendo zonas de necrosis/terapia)."
                    },
                    {
                        id: "treatment_effect",
                        label: "Efecto del Tratamiento Previo (Respuesta Terapéutica)",
                        type: "radio",
                        helpText: "Nota Explicativa D (CAP): Evalúa el impacto de terapias locorregionales como quimioembolización transarterial (TACE), radioembolización con Ytrio-90, radiofrecuencia o inmunoterapia sistémica. Se estima el porcentaje de necrosis tumoral.",
                        options: [
                            { value: "no_therapy", label: "Sin terapia presúrgica conocida (resección primaria de novo)" },
                            { value: "complete_necrosis", label: "Necrosis tumoral completa (100% no viable, respuesta patológica completa)" },
                            { value: "incomplete_necrosis", label: "Necrosis tumoral incompleta (tumor viable residual presente)" },
                            { value: "no_necrosis", label: "Sin evidencia de necrosis tumoral" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "necrosis_pct",
                        label: "Porcentaje estimado de necrosis tumoral (%)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "treatment_effect", value: "incomplete_necrosis" },
                        helpText: "Porcentaje de necrosis coagulativa inducida por el tratamiento."
                    },
                    {
                        id: "satellitosis",
                        label: "Satelitosis Tumoral",
                        type: "radio",
                        helpText: "Nota Explicativa D (CAP): La satelitosis se define como nódulos tumorales satélites microscópicos o macroscópicos localizados a <= 2.0 cm del tumor principal sin cápsula fibrosa propia. Representa invasión vascular local y confiere alto riesgo de recurrencia postquirúrgica.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente (nódulos tumorales satélites a <= 2 cm del tumor principal)" },
                            { value: "cannot_determine", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                id: "sec_invasions",
                name: "4. EXTENSIÓN E INVASIÓN VASCULAR / PERINEURAL",
                fields: [
                    {
                        id: "tumor_extent",
                        label: "Extensión Tumoral Anatómica",
                        type: "checkbox",
                        required: true,
                        helpText: "Nota Explicativa G (CAP): Reglas anatómicas de extensión:\n• Confinado al parénquima hepático: estadio estándar pT1-pT3.\n• Perforación del peritoneo visceral (serosa hepática): estadio pT4 directo.\n• Invasión directa de órganos adyacentes (estómago, diafragma, colon): estadio pT4 directo.\n• La invasión directa de la pared de la vesícula biliar NO cambia a pT4.",
                        options: [
                            { value: "confined", label: "Confinado al parénquima hepático" },
                            { value: "portal_vein_major", label: "Involucra una rama mayor de la vena porta (rama derecha o izquierda principal) = pT4" },
                            { value: "hepatic_vein_major", label: "Involucra una vena hepática principal (suprahepática) = pT4" },
                            { value: "perforates_peritoneum", label: "Perfora el peritoneo visceral (superficie serosa capsular) = pT4" },
                            { value: "invades_gallbladder", label: "Invade directamente la vesícula biliar (no cambia a T4)" },
                            { value: "invades_diaphragm", label: "Invade directamente el diafragma = pT4" },
                            { value: "invades_adjacent_organs", label: "Invade directamente otros órganos adyacentes (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "vascular_invasion",
                        label: "Invasión Vascular (LVI / Vena Porta / Vénulas)",
                        type: "checkbox",
                        required: true,
                        helpText: "Nota Explicativa E (CAP): Factor pronóstico independiente crucial en CHC:\n• Invasión microvascular: células tumorales en pequeños vasos endoteliales o vénulas portales en el parénquima peritumoral; convierte un tumor solitario > 2 cm de pT1b a pT2.\n• Invasión macrovascular: trombo tumoral en grandes ramas venosas portales o suprahepáticas visibles macroscópicamente o en cortes de pedículos.",
                        options: [
                            { value: "not_identified", label: "No identificada (ausencia de invasión vascular)" },
                            { value: "small_vessel", label: "Invasión microvascular (vasos pequeños y vénulas portales peritumorales)" },
                            { value: "large_vessel", label: "Invasión macrovascular (rama principal de vena porta o vena hepática)" },
                            { value: "present_nos", label: "Presente (no especificada de otro modo)" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "perineural_invasion",
                        label: "Invasión Perineural (PNI)",
                        type: "radio",
                        helpText: "Compromiso de filetes nerviosos en tractos portales o estroma peritumoral.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "cannot_determine", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                id: "sec_margins",
                name: "5. MÁRGENES QUIRÚRGICOS",
                fields: [
                    {
                        id: "margin_status",
                        label: "Estado de los Márgenes Quirúrgicos",
                        type: "radio",
                        required: true,
                        helpText: "Nota Explicativa F (CAP): Evaluación del margen de sección hepática:\n• Margen negativo (R0): Ausencia de células tumorales en la tinta china de sección quirúrgica.\n• Distancia de seguridad recomendada: Un margen libre >= 10 mm (1.0 cm) confiere significativamente menor tasa de recidiva en el remanente hepático.\n• Margen positivo (R1 microscópico, R2 macroscópico).",
                        options: [
                            { value: "all_negative", label: "Todos los márgenes negativos para carcinoma invasor (Resección R0)" },
                            { value: "positive", label: "Carcinoma invasor presente en margen quirúrgico (Resección R1 / R2)" },
                            { value: "cannot_determine", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "closest_margin",
                        label: "Margen más cercano",
                        type: "select",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        options: [
                            { value: "parenchymal", label: "Margen de sección parenquimatoso hepático (transección)" },
                            { value: "capsular", label: "Margen capsular / peritoneal" },
                            { value: "vascular", label: "Margen vascular (pedículo portal o vena suprahepática)" },
                            { value: "other", label: "Otro margen (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "margin_distance_mm",
                        label: "Distancia del tumor al margen más cercano (milímetros)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "margin_status", value: "all_negative" },
                        helpText: "Distancia exacta en milímetros (>= 10 mm = 1.0 cm indica margen quirúrgico amplio y seguro)."
                    },
                    {
                        id: "margin_involved",
                        label: "Margen(es) comprometido(s) por el tumor",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "positive" },
                        options: [
                            { value: "parenchymal", label: "Margen parenquimatoso de sección hepática" },
                            { value: "peritoneal", label: "Margen peritoneal / serosa" },
                            { value: "vascular", label: "Margen vascular del pedículo portal" },
                            { value: "other", label: "Otro margen (especificar)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                id: "sec_nodes_mets",
                name: "6. GANGLIOS LINFÁTICOS Y METÁSTASIS",
                fields: [
                    {
                        id: "regional_nodes_status",
                        label: "Estado de Ganglios Linfáticos Regionales",
                        type: "radio",
                        required: true,
                        helpText: "Nota Explicativa G (CAP): Ganglios regionales del hígado: hilio hepático (a lo largo del ligamento hepatoduodenal, arteria hepática y vena porta) y ganglios a lo largo de la vena cava inferior suprarrenal. La presencia de metástasis ganglionar (pN1) confiere estadio IVA y supervivencia disminuida.",
                        options: [
                            { value: "na", label: "No aplicable (no se remitieron o no se encontraron ganglios linfáticos)" },
                            { value: "negative", label: "Ganglios regionales examinados, todos negativos para metástasis (pN0)" },
                            { value: "positive", label: "Metástasis presente en ganglios linfáticos regionales (pN1)" }
                        ]
                    },
                    {
                        id: "nodes_positive",
                        label: "Número de ganglios con metástasis",
                        type: "number",
                        dependsOn: { field: "regional_nodes_status", value: "positive" }
                    },
                    {
                        id: "nodes_examined",
                        label: "Número total de ganglios regionales examinados",
                        type: "number",
                        dependsOn: { field: "regional_nodes_status", values: ["negative", "positive"] }
                    },
                    {
                        id: "distant_metastasis",
                        label: "Metástasis a Distancia (pM)",
                        type: "radio",
                        helpText: "Nota Explicativa G (CAP): Confirmación patológica de diseminación extrahepática (pulmón, hueso, ganglios extra-regionales).",
                        options: [
                            { value: "na", label: "No aplicable (pM no determinado a partir del espécimen quirúrgico)" },
                            { value: "pm1", label: "pM1: Metástasis a distancia confirmada patológicamente" }
                        ]
                    },
                    {
                        id: "metastasis_sites",
                        label: "Sitio(s) de metástasis a distancia confirmados",
                        type: "text",
                        dependsOn: { field: "distant_metastasis", value: "pm1" },
                        helpText: "Especificar sitios anatómicos (ej: biopsia pulmonar, implante peritoneal extrahepático)."
                    }
                ]
            },
            {
                id: "sec_stage",
                name: "7. ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8.ª EDICIÓN)",
                fields: [
                    {
                        id: "tnm_descriptors",
                        label: "Descriptores TNM",
                        type: "checkbox",
                        helpText: "Prefijos de clasificación TNM:\n• m: Tumores primarios múltiples sincronos.\n• r: Recurrencia post-resección previa.\n• y: Clasificación post-tratamiento neoadyuvante (TACE, quimioterapia o radioterapia).",
                        options: [
                            { value: "none", label: "Ninguno (caso primario no tratado)" },
                            { value: "m", label: "m (tumores primarios múltiples sincronos)" },
                            { value: "r", label: "r (recurrencia tumoral)" },
                            { value: "y", label: "y (post-terapia neoadyuvante / TACE)" }
                        ]
                    },
                    {
                        id: "pt_category",
                        label: "Categoría pT (AJCC 8.ª Edición)",
                        type: "select",
                        required: true,
                        helpText: "Nota Explicativa G (CAP): Criterios pT para Carcinoma Hepatocelular (AJCC 8.ª Ed.):\n• pT1a: Tumor solitario <= 2.0 cm (con o sin invasión vascular).\n• pT1b: Tumor solitario > 2.0 cm SIN invasión vascular.\n• pT2: Tumor solitario > 2.0 cm CON invasión vascular, O tumores múltiples ninguno > 5.0 cm.\n• pT3: Tumores múltiples, al menos uno > 5.0 cm.\n• pT4: Tumor único o múltiple que involucra una rama mayor de la vena porta o vena hepática, o con invasión directa de órganos adyacentes (distintos a la vesícula biliar) o perforación del peritoneo visceral.",
                        options: [
                            { value: "ptx", label: "pTX: El tumor primario no puede ser evaluado" },
                            { value: "pt0", label: "pT0: Sin evidencia de tumor primario viable (ej. necrosis 100% post-TACE)" },
                            { value: "pt1a", label: "pT1a: Tumor solitario <= 2 cm (con o sin invasión vascular)" },
                            { value: "pt1b", label: "pT1b: Tumor solitario > 2 cm sin invasión vascular" },
                            { value: "pt2", label: "pT2: Tumor solitario > 2 cm con invasión vascular, O tumores múltiples ninguno > 5 cm" },
                            { value: "pt3", label: "pT3: Tumores múltiples, al menos uno mayor de 5 cm" },
                            { value: "pt4", label: "pT4: Invasión de rama mayor portal/suprahepática, o perforación serosa o invasión diafragma/órganos vecinos" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN",
                        type: "select",
                        required: true,
                        options: [
                            { value: "pnx", label: "pNX: Ganglios regionales no evaluados o no remitidos" },
                            { value: "pn0", label: "pN0: Sin metástasis en ganglios linfáticos regionales" },
                            { value: "pn1", label: "pN1: Metástasis en ganglio(s) linfático(s) regional(es)" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM",
                        type: "select",
                        required: true,
                        options: [
                            { value: "na", label: "No aplicable (cM0 clínico sin confirmación histológica de metástasis a distancia)" },
                            { value: "pm1", label: "pM1: Metástasis a distancia confirmada patológicamente" }
                        ]
                    }
                ]
            },
            {
                id: "sec_background",
                name: "8. PARÉNQUIMA HEPÁTICO NO NEOPLÁSICO Y ESTUDIOS ESPECIALES",
                fields: [
                    {
                        id: "fibrosis_stage",
                        label: "Estadio de Fibrosis Hepática (Ishak / Metavir)",
                        type: "select",
                        required: true,
                        helpText: "Nota Explicativa H (CAP): Evaluar la arquitectura del parénquima no tumoral es crucial:\n• Ishak 0 / Metavir F0: Sin fibrosis.\n• Ishak 1-2 / Metavir F1: Expansión fibrosa portal leve.\n• Ishak 3-4 / Metavir F2-F3: Fibrosis en puentes (porto-portal o porto-central).\n• Ishak 5-6 / Metavir F4: Cirrosis hepática nodular establecida; condiciona el riesgo de descompensación hepática y segundas neoplasias.",
                        options: [
                            { value: "none", label: "Sin fibrosis (F0 / Ishak 0)" },
                            { value: "mild", label: "Fibrosis portal leve sin septos (F1 / Ishak 1-2)" },
                            { value: "bridging", label: "Fibrosis septal en puentes porto-portales (F2-F3 / Ishak 3-4)" },
                            { value: "cirrhosis", label: "Cirrosis hepática establecida (F4 / Ishak 5-6)" },
                            { value: "cannot_assess", label: "No evaluable por escasez de parénquima adyacente" }
                        ]
                    },
                    {
                        id: "dysplastic_nodules",
                        label: "Nódulos Displásicos en Hígado No Tumoral",
                        type: "radio",
                        helpText: "Nota Explicativa H (CAP): Los nódulos displásicos de alto grado (HGDN) son los precursores directos del carcinoma hepatocelular; presentan clones de células atípicas con alta densidad nuclear y patrón sinusoidal irregular.",
                        options: [
                            { value: "none", label: "No identificados" },
                            { value: "low_grade", label: "Nódulo displásico de bajo grado (LGDN)" },
                            { value: "high_grade", label: "Nódulo displásico de alto grado (HGDN - lesión premaligna avanzada)" }
                        ]
                    },
                    {
                        id: "background_liver_findings",
                        label: "Hallazgos Adicionales en el Hígado No Neoplásico",
                        type: "checkbox",
                        helpText: "Etiologías de hepatopatía de base subyacente.",
                        options: [
                            { value: "steatosis", label: "Esteatosis hepatocitaria (macro y microvesicular)" },
                            { value: "steatohepatitis", label: "Esteatohepatitis (MASH / NASH: balonamiento, cuerpos de Mallory-Denk)" },
                            { value: "iron_overload", label: "Sobrecarga de hierro (hemosiderosis / hemocromatosis)" },
                            { value: "chronic_hepatitis_b", label: "Hepatitis crónica por virus B (VHB - hepatocitos en vidrio esmerilado)" },
                            { value: "chronic_hepatitis_c", label: "Hepatitis crónica por virus C (VHC - folículos linfoides portales)" },
                            { value: "cholestasis", label: "Colestasis intrahepática / pigmento biliar" },
                            { value: "normal", label: "Parénquima hepático no tumoral sin alteraciones histológicas significativas" },
                            { value: "other", label: "Otros hallazgos (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "ancillary_studies",
                        label: "Estudios Especiales / Inmunohistoquímica",
                        type: "text",
                        helpText: "Panel diagnóstico diferencial (HepPar-1, Arginasa-1, GPC3 Glipicano-3, CD34 capilarización sinusoidal, Glutamina sintetasa, CK7, CK19, CD68)."
                    },
                    {
                        id: "comments",
                        label: "Comentarios Clínicos y Notas Diagnósticas",
                        type: "text",
                        helpText: "Notas complementarias, correlación con niveles de alfa-fetoproteína (AFP) o hallazgos radiológicos previos."
                    }
                ]
            }
        ]
    }
};
