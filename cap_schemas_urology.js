// cap_schemas_urology.js
// PROTOCOLOS SINÓPTICOS OFICIALES DEL COLLEGE OF AMERICAN PATHOLOGISTS (CAP) - UROLOGÍA
// Basado en: Prostate.TURP_4.2.0.0.REL_CAPCP.docx (Septiembre 2023) y AJCC 8.ª/9.ª Edición / OMS 5.ª Edición

export const urologySchemas = {
    prostate_turp: {
        id: "prostate_turp",
        title: "Próstata: Resección Transuretral (RTUP) y Enucleación",
        subtitle: "Protocolo Oficial CAP v4.2.0.0 (Septiembre 2023) - OMS 5.ª Ed. / AJCC 8.ª Ed.",
        organ: "Urología",
        category: "Próstata",
        targetField: "microDesc",
        sections: [
            {
                id: "sec_specimen",
                name: "1. ESPECÍMEN Y PROCEDIMIENTO",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        required: true,
                        helpText: "Nota Explicativa A (CAP): Criterios de muestreo macroscópico:\n• Muestras de RTUP que pesan 12 gramos o menos: deben incluirse en su TOTALIDAD (100% del tejido en casetes).\n• Muestras de más de 12 g: se incluyen inicialmente los primeros 12 g (aprox. 6 a 8 casetes), y se añade 1 casete adicional por cada 5 gramos restantes.\n• Seleccionar preferentemente fragmentos amarillos, anaranjados o firmes.\n• Si se halla un carcinoma insospechado que compromete <= 5% del tejido inicial, se recomienda incluir el resto del espécimen hasta un máximo de 12 casetes adicionales para descartar mayor volumen tumoral o mayor grado Gleason.",
                        options: [
                            { value: "rtup", label: "Resección transuretral de la próstata (RTUP)" },
                            { value: "enucleation", label: "Enucleación prostática (adenomectomía simple o subtotal suprapúbica/retropúbica)" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "specimen_weight",
                        label: "Peso del espécimen recibido (gramos)",
                        type: "number",
                        suffix: "g",
                        helpText: "Peso total en fresco del tejido prostático remitido. Si pesa <= 12 g, todo el material debe incluirse histológicamente."
                    }
                ]
            },
            {
                id: "sec_histology",
                name: "2. HISTOLOGÍA Y TIPO TUMORAL",
                fields: [
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico (OMS 5.ª Edición)",
                        type: "select",
                        required: true,
                        helpText: "Nota Explicativa B (CAP): Este protocolo aplica a adenocarcinomas invasores y otros carcinomas de próstata:\n• Adenocarcinoma acinar convencional: representa > 95% de los casos.\n• Adenocarcinoma ductal: arquitectura papilar y cribiforme con epitelio pseudoestratificado columnar alto; mayor agresividad clínica y metástasis óseas/viscerales más precoces.\n• Carcinoma neuroendocrino de células pequeñas: agresivo, alto índice mitótico, CD56/sinaptofisina (+), PSA bajo o negativo; no responde a bloqueo androgénico.\n• Variantes acinares poco comunes: células en anillo de sello (>= 50%), pleomórfico, sarcomatoide.",
                        options: [
                            { value: "acinar_conv", label: "Adenocarcinoma acinar, convencional (habitual)" },
                            { value: "acinar_signet", label: "Adenocarcinoma acinar, variante células en anillo de sello" },
                            { value: "acinar_pleomorphic", label: "Adenocarcinoma acinar, de células gigantes pleomórficas" },
                            { value: "acinar_sarcomatoid", label: "Adenocarcinoma acinar, sarcomatoide (carcinosarcoma)" },
                            { value: "acinar_pin_like", label: "Adenocarcinoma acinar, similar a neoplasia intraepitelial prostática (PIN-like)" },
                            { value: "intraductal_isolated", label: "Carcinoma intraductal aislado (sin carcinoma invasor identificado)" },
                            { value: "ductal_adenocarcinoma", label: "Adenocarcinoma ductal (tipo papilar / cribiforme)" },
                            { value: "adenosquamous", label: "Carcinoma adenoescamoso" },
                            { value: "squamous_cell", label: "Carcinoma de células escamosas puro" },
                            { value: "basal_cell", label: "Carcinoma de células basales (adenoide quístico)" },
                            { value: "neuroendocrine_diff", label: "Adenocarcinoma acinar con diferenciación neuroendocrina focal" },
                            { value: "neuroendocrine_tumor", label: "Tumor neuroendocrino bien diferenciado (NET)" },
                            { value: "small_cell", label: "Carcinoma neuroendocrino de células pequeñas" },
                            { value: "large_cell", label: "Carcinoma neuroendocrino de células grandes" },
                            { value: "other_type", label: "Otro tipo histológico (especificar)", hasInput: true },
                            { value: "undetermined", label: "Carcinoma, tipo no determinado" }
                        ]
                    }
                ]
            },
            {
                id: "sec_grade",
                name: "3. GRADO HISTOLÓGICO (GLEASON / GRUPOS DE GRADO ISUP)",
                fields: [
                    {
                        id: "gleason_group",
                        label: "Grado Histológico (ISUP / OMS / Gleason Score)",
                        type: "select",
                        required: true,
                        helpText: "Nota Explicativa C (CAP): Consenso ISUP 2014/2019 y GUPS:\n• Grupo de Grado 1 (Gleason 3+3=6): Glándulas bien formadas individuales; excelente pronóstico, virtualmente sin potencial metastásico.\n• Grupo de Grado 2 (Gleason 3+4=7): Predominio de patrón 3 con patrón 4 secundario.\n• Grupo de Grado 3 (Gleason 4+3=7): Predominio de patrón 4 con patrón 3 secundario; peor pronóstico y mayor tasa de recidiva que el 3+4.\n• Grupo de Grado 4 (Gleason 8): Gleason 4+4=8, 3+5=8 o 5+3=8.\n• Grupo de Grado 5 (Gleason 9-10): Gleason 4+5, 5+4 o 5+5; alta agresividad.",
                        options: [
                            { value: "g1", label: "Grupo de Grado 1 (Gleason Score 3 + 3 = 6)" },
                            { value: "g2", label: "Grupo de Grado 2 (Gleason Score 3 + 4 = 7)" },
                            { value: "g3", label: "Grupo de Grado 3 (Gleason Score 4 + 3 = 7)" },
                            { value: "g4_44", label: "Grupo de Grado 4 (Gleason Score 4 + 4 = 8)" },
                            { value: "g4_35", label: "Grupo de Grado 4 (Gleason Score 3 + 5 = 8)" },
                            { value: "g4_53", label: "Grupo de Grado 4 (Gleason Score 5 + 3 = 8)" },
                            { value: "g5_45", label: "Grupo de Grado 5 (Gleason Score 4 + 5 = 9)" },
                            { value: "g5_54", label: "Grupo de Grado 5 (Gleason Score 5 + 4 = 9)" },
                            { value: "g5_55", label: "Grupo de Grado 5 (Gleason Score 5 + 5 = 10)" },
                            { value: "cannot_assess", label: "No puede ser evaluado" },
                            { value: "na", label: "No aplicable (ej. carcinoma neuroendocrino de células pequeñas)" }
                        ]
                    },
                    {
                        id: "pattern4_pct_g2",
                        label: "Porcentaje de Patrón 4 (Obligatorio en Grupo de Grado 2: Gleason 3+4)",
                        type: "radio",
                        dependsOn: { field: "gleason_group", value: "g2" },
                        helpText: "En biopsias y RTUP con Gleason 3+4=7, reportar el porcentaje exacto de patrón 4 es fundamental: un porcentaje <= 10% puede hacer al paciente candidato a vigilancia activa estricta si no hay cribiforme.",
                        options: [
                            { value: "lte_5", label: "Menor o igual al 5%" },
                            { value: "6_10", label: "6 - 10%" },
                            { value: "11_20", label: "11 - 20%" },
                            { value: "21_30", label: "21 - 30%" },
                            { value: "31_40", label: "31 - 40%" },
                            { value: "gt_40", label: "Mayor al 40%" }
                        ]
                    },
                    {
                        id: "pattern4_pct_g3",
                        label: "Porcentaje de Patrón 4 (Obligatorio en Grupo de Grado 3: Gleason 4+3)",
                        type: "radio",
                        dependsOn: { field: "gleason_group", value: "g3" },
                        helpText: "Porcentaje de patrón 4 en Gleason 4+3=7. Va desde 51% hasta > 90%.",
                        options: [
                            { value: "lt_61", label: "Menor al 61%" },
                            { value: "61_70", label: "61 - 70%" },
                            { value: "71_80", label: "71 - 80%" },
                            { value: "81_90", label: "81 - 90%" },
                            { value: "gt_90", label: "Mayor al 90%" }
                        ]
                    },
                    {
                        id: "pattern4_high",
                        label: "Porcentaje de Patrón 4 (si Gleason Score > 7)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "gleason_group", values: ["g4_44", "g4_35", "g4_53", "g5_45", "g5_54", "g5_55"] },
                        helpText: "Cuantificación opcional pero recomendada de patrón 4 cuando coexiste con patrón 5."
                    },
                    {
                        id: "pattern5_high",
                        label: "Porcentaje de Patrón 5 (si Gleason Score > 7)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "gleason_group", values: ["g4_44", "g4_35", "g4_53", "g5_45", "g5_54", "g5_55"] },
                        helpText: "La presencia de patrón 5 (sábanas sólidas, comedonecrosis, células sueltas) empeora sensiblemente el pronóstico."
                    },
                    {
                        id: "cribriform_glands",
                        label: "Glándulas Cribiformes (en cáncer Gleason 7 u 8)",
                        type: "radio",
                        helpText: "Nota Explicativa C (CAP): La morfología cribiforme en el patrón 4 es un predictor adverso independiente de recurrencia bioquímica, metástasis ganglionares y muerte cáncer-específica. Se desaconseja la vigilancia activa ante su presencia.",
                        options: [
                            { value: "not_identified", label: "No identificadas" },
                            { value: "present", label: "Presentes" },
                            { value: "na", label: "No aplicable (Gleason 6 o 9-10)" },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "intraductal_carcinoma",
                        label: "Carcinoma Intraductal de Próstata (IDC)",
                        type: "radio",
                        helpText: "Nota Explicativa D (CAP): El Carcinoma Intraductal (IDC) se define como células malignas que proliferan y distienden conductos o acinos preexistentes con células basales preservadas (p63+, CK34bE12+). Se asocia a mutaciones en BRCA2, inestabilidad de microsatélites y curso clínico desfavorable. Se debe reportar siempre.",
                        options: [
                            { value: "not_identified", label: "No identificado" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "idc_graded",
                        label: "¿IDC incorporado en el Grado Gleason?",
                        type: "radio",
                        dependsOn: { field: "intraductal_carcinoma", value: "present" },
                        helpText: "Tanto ISUP como GUPS recomiendan NO asignar puntuación de Gleason al IDC puro. Cuando coexiste con cáncer invasor, la mayoría de paneles recomiendan graduar solo el componente invasor.",
                        options: [
                            { value: "no", label: "No (recomendación estándar ISUP/GUPS)" },
                            { value: "yes", label: "Sí (incorporado en el cálculo del grado)" },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "treatment_effect",
                        label: "Efecto del Tratamiento Previo",
                        type: "checkbox",
                        helpText: "Terapia hormonal (bloqueo androgénico) o radioterapia causan atipia celular por tratamiento. Si el efecto es marcado, no se debe calcular puntuación de Gleason formal.",
                        options: [
                            { value: "no_therapy", label: "Sin terapia presúrgica conocida" },
                            { value: "not_identified", label: "No identificado" },
                            { value: "radiation", label: "Efecto de radioterapia presente", hasInput: true },
                            { value: "hormonal", label: "Efecto de terapia hormonal / antiandrogénica presente", hasInput: true },
                            { value: "other", label: "Efecto de otra terapia presente (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                id: "sec_quantitation",
                name: "4. CUANTIFICACIÓN DEL TUMOR",
                fields: [
                    {
                        id: "quant_mode",
                        label: "Modalidad de Cuantificación",
                        type: "radio",
                        options: [
                            { value: "turp", label: "Para espécimen de RTUP (porcentaje y número de chips)" },
                            { value: "enucleation", label: "Para Enucleación / Prostatectomía simple (nódulo dominante y % global)" }
                        ]
                    },
                    {
                        id: "turp_pct",
                        label: "Porcentaje estimado de próstata involucrada por el tumor",
                        type: "select",
                        dependsOn: { field: "quant_mode", value: "turp" },
                        helpText: "Nota Explicativa E (CAP): Clave para definir el estadio AJCC clínico/patológico incidental:\n• <= 5% con Gleason 6: clasifica como cT1a.\n• > 5% O cualquier volumen con Gleason >= 7: clasifica como cT1b.",
                        options: [
                            { value: "lt_1", label: "Menor al 1%" },
                            { value: "1_5", label: "1 a 5% (compatible con T1a si Gleason <= 6)" },
                            { value: "6_10", label: "6 a 10% (compatible con T1b)" },
                            { value: "11_20", label: "11 a 20%" },
                            { value: "21_30", label: "21 a 30%" },
                            { value: "31_40", label: "31 a 40%" },
                            { value: "41_50", label: "41 a 50%" },
                            { value: "51_60", label: "51 a 60%" },
                            { value: "61_70", label: "61 a 70%" },
                            { value: "71_80", label: "71 a 80%" },
                            { value: "81_90", label: "81 a 90%" },
                            { value: "gt_90", label: "Mayor al 90%" },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "positive_chips",
                        label: "Número de fragmentos (chips) positivos con tumor",
                        type: "number",
                        dependsOn: { field: "quant_mode", value: "turp" },
                        helpText: "Número de fragmentos tisulares con foco de adenocarcinoma."
                    },
                    {
                        id: "total_chips",
                        label: "Número total de fragmentos (chips) examinados",
                        type: "number",
                        dependsOn: { field: "quant_mode", value: "turp" },
                        helpText: "Total de fragmentos en todos los casetes examinados."
                    },
                    {
                        id: "dominant_nodule_dim",
                        label: "Dimensión mayor del nódulo dominante (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "quant_mode", value: "enucleation" },
                        helpText: "Diámetro mayor del nódulo tumoral principal en espécimen de enucleación."
                    },
                    {
                        id: "dominant_nodule_add_w",
                        label: "Segunda dimensión del nódulo dominante (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "quant_mode", value: "enucleation" }
                    },
                    {
                        id: "enucleation_pct",
                        label: "Porcentaje estimado de tejido prostático involucrado por tumor (%)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "quant_mode", value: "enucleation" }
                    }
                ]
            },
            {
                id: "sec_extension",
                name: "5. EXTENSIÓN TUMORAL E INVASIONES",
                fields: [
                    {
                        id: "periprostatic_fat",
                        label: "Invasión de Grasa Periprostática (Extensión Extraprostática)",
                        type: "radio",
                        helpText: "Nota Explicativa E (CAP): En RTUP o enucleación, hallar células neoplásicas en grasa periprostática indica perforación capsular y equivale patológicamente a pT3a (extensión extraprostática).",
                        options: [
                            { value: "not_identified", label: "No identificada (no hay tejido adiposo o no está invadido)" },
                            { value: "present", label: "Presente (invasión directa de tejido adiposo periprostático = pT3a)" },
                            { value: "equivocal", label: "Equívoca (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "seminal_vesicle",
                        label: "Invasión de Vesícula Seminal",
                        type: "radio",
                        helpText: "Si se resecó fragmento de vesícula seminal y muestra invasión de su capa muscular propia, corresponde a pT3b.",
                        options: [
                            { value: "not_identified", label: "No identificada / Tejido de vesícula seminal no presente" },
                            { value: "present", label: "Presente (infiltración de la pared muscular de vesícula seminal = pT3b)" },
                            { value: "equivocal", label: "Equívoca (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "lymphovascular",
                        label: "Invasión Linfática y/o Vascular (LVI)",
                        type: "radio",
                        helpText: "Presencia de émbolos neoplásicos en canales endoteliales linfáticos o vasculares; factor de riesgo independiente de metástasis ganglionares y progresión.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "perineural",
                        label: "Invasión Perineural (PNI)",
                        type: "radio",
                        helpText: "Nota Explicativa F (CAP): Células neoplásicas que rodean o invaden los espacios perineurales a lo largo del trayecto nervioso intraprostático.",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    }
                ]
            },
            {
                id: "sec_findings",
                name: "6. HALLAZGOS ADICIONALES Y ESTADIO AJCC",
                fields: [
                    {
                        id: "additional_findings",
                        label: "Hallazgos Adicionales en el Tejido Prostático",
                        type: "checkbox",
                        helpText: "Patologías coexistentes en el tejido prostático no tumoral de resección o enucleación.",
                        options: [
                            { value: "none", label: "Ninguno identificado" },
                            { value: "pin", label: "Neoplasia intraepitelial prostática de alto grado (HGPIN)" },
                            { value: "aip", label: "Proliferación intraductal atípica (AIP)" },
                            { value: "adenosis", label: "Hiperplasia adenomatosa atípica (adenosis)" },
                            { value: "nodular_hyperplasia", label: "Hiperplasia prostática benigna / nodular (HPB)" },
                            { value: "acute_prostatitis", label: "Prostatitis aguda con microabscesos" },
                            { value: "chronic_prostatitis", label: "Prostatitis crónica linfocitaria / granulomatosa" },
                            { value: "infarction", label: "Infarto prostático con metaplasia escamosa reactiva" },
                            { value: "other", label: "Otros hallazgos (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "ajcc_stage_turp",
                        label: "Categoría de Estadificación (AJCC 8.ª Edición)",
                        type: "select",
                        helpText: "Clasificación clínica y patológica según AJCC 8.ª Edición para tumores incidentales post-RTUP:\n• cT1a: Hallazgo incidental en <= 5% de tejido resecado (Gleason <= 6).\n• cT1b: Hallazgo incidental en > 5% de tejido, o cualquier volumen con Gleason >= 7.\n• pT3a: Grasa periprostática invadida.\n• pT3b: Vesícula seminal invadida.",
                        options: [
                            { value: "ct1a", label: "cT1a: Tumor incidental en <= 5% de tejido resecado (Gleason Score <= 6)" },
                            { value: "ct1b", label: "cT1b: Tumor incidental en > 5% de tejido resecado, o cualquier % con Gleason >= 7" },
                            { value: "pt2", label: "pT2: Tumor confinado al órgano (evaluado en enucleación)" },
                            { value: "pt3a", label: "pT3a: Extensión extraprostática (grasa periprostática confirmada)" },
                            { value: "pt3b", label: "pT3b: Invasión de vesícula seminal identificada en espécimen" },
                            { value: "ptx", label: "pTX: Estadio primario no puede ser evaluado" }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios Clínicos y Notas Diagnósticas",
                        type: "text",
                        helpText: "Observaciones diagnósticas adicionales, correlación con PSA prequirúrgico o inmunohistoquímica (AMACR / p63 / CK HMW)."
                    }
                ]
            }
        ]
    }
};
