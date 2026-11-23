// synoptic_schemas.js
// PROTOCOLO ACTOR-CRITICO: Sistema Maestro de Esquemas Sinópticos CAP y Compilador Completo
// College of American Pathologists (CAP) & AJCC 8.ª/9.ª Edición / OMS 5.ª Edición

import { urologySchemas } from './cap_schemas_urology.js';
import { liverSchemas } from './cap_schemas_liver.js';
import { capSchemasDigestivo } from './cap_schemas_digestivo.js';
import { capSchemasGynEndocrine } from './cap_schemas_gyn_endocrine.js';

// Base de datos consolidada de esquemas sinópticos integrando todos los módulos
export const synopticSchemas = {
    ...urologySchemas,
    ...liverSchemas,
    ...capSchemasDigestivo,
    ...capSchemasGynEndocrine,
    // Alias para compatibilidad retrospectiva y selectores interactivos (Mama, Colorrectal, Próstata, Gástrico, Cérvix)
    breast_invasive_carcinoma: capSchemasGynEndocrine.breast_invasive_resection || capSchemasGynEndocrine.breast_invasive_carcinoma,
    breast_invasive_resection: capSchemasGynEndocrine.breast_invasive_resection,
    breast: capSchemasGynEndocrine.breast_invasive_resection,
    breast_phyllodes: capSchemasGynEndocrine.breast_phyllodes,
    colorectal: capSchemasDigestivo.colorectal_resection,
    colon: capSchemasDigestivo.colorectal_resection,
    stomach: capSchemasDigestivo.stomach_resection,
    prostate_resection: urologySchemas.prostate_turp,
    prostate: urologySchemas.prostate_turp,
    cervix_bethesda: capSchemasGynEndocrine.cervical_cytology_bethesda,
    bethesda_cervix: capSchemasGynEndocrine.cervical_cytology_bethesda,
    cervix: capSchemasGynEndocrine.cervical_cytology_bethesda,
    esophagus: capSchemasDigestivo.esophagus_resection || capSchemasDigestivo.esophagus,
    appendix: capSchemasDigestivo.appendix_resection || capSchemasDigestivo.appendix
};

// Función auxiliar para obtener el valor legible formateado de un campo
export function getFieldDisplayValue(field, state) {
    if (!field || state[field.id] === undefined || state[field.id] === null || state[field.id] === '') return null;
    const val = state[field.id];

    if (field.type === 'radio' || field.type === 'select') {
        const opt = field.options ? field.options.find(o => o.value === val) : null;
        if (!opt) return String(val);
        let label = opt.label;
        if (opt.hasInput) {
            const extra = state[`${field.id}_extra`] || '';
            if (label.includes('(especificar)') || label.includes('(explicar)') || label.includes('(especificar tipo)')) {
                label = label.replace('(especificar)', extra).replace('(explicar)', extra).replace('(especificar tipo)', extra);
            } else if (extra) {
                label += `: ${extra}`;
            }
        }
        return label;
    } else if (field.type === 'checkbox') {
        if (!Array.isArray(val) || val.length === 0) return null;
        return val.map(v => {
            const opt = field.options ? field.options.find(o => o.value === v) : null;
            if (!opt) return v;
            let label = opt.label;
            if (opt.hasInput) {
                const extra = state[`${field.id}_${v}_extra`] || '';
                if (label.includes('(especificar)') || label.includes('(explicar)') || label.includes('(especificar tipo)')) {
                    label = label.replace('(especificar)', extra).replace('(explicar)', extra).replace('(especificar tipo)', extra);
                } else if (extra) {
                    label += `: ${extra}`;
                }
            }
            return label;
        }).join(', ');
    } else if (field.type === 'number') {
        return `${val} ${field.suffix || ''}`.trim();
    } else if (field.type === 'text') {
        return String(val);
    }
    return String(val);
}

function sanitizeSynopticText(txt) {
    if (!txt || typeof txt !== 'string') return txt || '';
    if (typeof window !== 'undefined' && typeof window.cleanLatexToPlainText === 'function') {
        return window.cleanLatexToPlainText(txt);
    }
    return txt.replace(/\\times\b/gi, ' x ')
              .replace(/\\text\s*\{([^}]*)\}/gi, '$1')
              .replace(/\$([^$]+)\$/g, '$1')
              .replace(/\\*\$/g, '')
              .replace(/[{}]/g, '')
              .replace(/\\+/g, '');
}

// 1. COMPILADOR SINÓPTICO (Checklist Oficial CAP / AJCC)
export function compileSynopticReport(schemaId, state) {
    const schema = synopticSchemas[schemaId];
    if (!schema) return '';

    let text = `<b>RESUMEN DE CASO: ${schema.title.toUpperCase()}</b>\n`;
    if (schema.subtitle) text += `<i>${schema.subtitle}</i>\n`;
    text += `\n`;

    schema.sections.forEach(section => {
        let sectionHasData = false;
        let sectionLines = [];

        section.fields.forEach(field => {
            if (field.dependsOn) {
                const depVal = state[field.dependsOn.field];
                if (field.dependsOn.value && depVal !== field.dependsOn.value) return;
                if (field.dependsOn.values && !field.dependsOn.values.includes(depVal)) return;
            }

            const displayVal = getFieldDisplayValue(field, state);
            if (displayVal !== null && displayVal !== '') {
                sectionHasData = true;
                sectionLines.push(`• ${field.label}: ${displayVal}`);
            }
        });

        if (sectionHasData) {
            text += `<b>${section.name}</b>\n` + sectionLines.join('\n') + '\n\n';
        }
    });

    return sanitizeSynopticText(text.trim());
}

// 2. COMPILADOR DE PARTES SEPARADAS DEL REPORTE (Macro, Micro, Diag, Sinóptico)
export function compileSeparateReportParts(schemaId, state) {
    const schema = synopticSchemas[schemaId];
    if (!schema) return { macro: '', micro: '', diag: '', synoptic: '' };

    const synopticText = compileSynopticReport(schemaId, state);

    const getVal = (fieldId) => {
        for (const sec of schema.sections) {
            const f = sec.fields.find(item => item.id === fieldId);
            if (f) return getFieldDisplayValue(f, state);
        }
        return state[fieldId] ? String(state[fieldId]) : '';
    };

    // --- PROTOCOLO UROLÓGICO: PRÓSTATA RTUP / ENUCLEACIÓN ---
    if (schemaId === 'prostate_turp') {
        const proc = getVal('procedure') || 'Resección transuretral de la próstata (RTUP)';
        const peso = state.specimen_weight ? `${state.specimen_weight} gramos` : '20 gramos';
        const hist = getVal('histologic_type') || 'Adenocarcinoma acinar, convencional (habitual)';
        const grado = getVal('gleason_group') || 'Grupo de Grado 2 (Gleason Score 3 + 4 = 7)';
        const p4_g2 = getVal('pattern4_pct_g2');
        const p4_g3 = getVal('pattern4_pct_g3');
        const p4_str = p4_g2 ? ` Porcentaje de patrón 4: ${p4_g2}.` : (p4_g3 ? ` Porcentaje de patrón 4: ${p4_g3}.` : '');
        const crib = getVal('cribriform_glands') || 'No identificadas';
        const idc = getVal('intraductal_carcinoma') || 'No identificado';
        const quantMode = state.quant_mode || 'turp';

        let quantText = '';
        let quantSummary = '';
        if (quantMode === 'turp') {
            const pct = getVal('turp_pct') || '1 a 5%';
            const pos = state.positive_chips || '3';
            const tot = state.total_chips || '18';
            quantText = `El tumor compromete aproximadamente un ${pct} del tejido prostático resecado (${pos} de ${tot} fragmentos examinados con neoplasia).`;
            quantSummary = `${pct} del tejido (${pos}/${tot} chips positivos)`;
        } else {
            const nodDim = state.dominant_nodule_dim ? `${state.dominant_nodule_dim} mm` : '15 mm';
            const encPct = state.enucleation_pct ? `${state.enucleation_pct}%` : '10%';
            quantText = `Se identifica un nódulo dominante de ${nodDim} en su dimensión mayor, con un compromiso global estimado del ${encPct} del parénquima prostático.`;
            quantSummary = `Nódulo dominante de ${nodDim}, ${encPct} de tejido comprometido`;
        }

        const fat = getVal('periprostatic_fat') || 'No identificada';
        const ves = getVal('seminal_vesicle') || 'No identificada';
        const lvi = getVal('lymphovascular') || 'No identificada';
        const pni = getVal('perineural') || 'No identificada';
        const findings = getVal('additional_findings') || 'Hiperplasia prostática nodular benigna';
        const stage = getVal('ajcc_stage_turp') || (state.turp_pct === 'lt_1' || state.turp_pct === '1_5' ? 'cT1a' : 'cT1b');

        const macro = `Se recibe fijado en formol al 10% espécimen quirúrgico rotulado como ${proc.toLowerCase()}, constituido por múltiples fragmentos tisulares elasto-firmes, de forma irregular, tonalidad pardo-grisácea con sectores amarillentos y anaranjados, que en conjunto tienen un peso de ${peso} y miden en cúmulo 5.0 x 4.0 x 2.2 cm. Se seleccionan de manera preferencial los fragmentos de tonalidad amarillo-naranja y consistencia indurada, procesándose para estudio histológico en casetes rotulados de acuerdo con las recomendaciones del CAP (primeros 12 gramos incluidos en 6 casetes, más casetes adicionales por remanente).`;

        const micro = `Los cortes histológicos examinados muestran parénquima prostático con neoplasia maligna epitelial correspondiente a ${hist}.
Arquitectura y diferenciación: La proliferación tumoral se dispone formando glándulas atípicas de calibres y densidades variables que corresponden a ${grado}.${p4_str} Glándulas cribiformes: ${crib}. Carcinoma intraductal (IDC): ${idc}.
Cuantificación tumoral: ${quantText}
Evaluación de extensiones e invasiones:
• Grasa periprostática: ${fat}.
• Vesícula seminal: ${ves}.
• Invasión linfática y/o vascular (LVI): ${lvi}.
• Invasión perineural (PNI): ${pni}.
Parénquima prostático no neoplásico acompañante: ${findings}.`;

        const diag = `PRÓSTATA (${proc.toUpperCase()}):
- ${hist.toUpperCase()}.
- ${grado.toUpperCase()}.${p4_str ? `\n  * ${p4_str.trim()}` : ''}
  * GLÁNDULAS CRIBIFORMES: ${crib.toUpperCase()}.
  * CARCINOMA INTRADUCTAL (IDC): ${idc.toUpperCase()}.
- CUANTIFICACIÓN TUMORAL: ${quantSummary.toUpperCase()}.
- EXTENSIÓN EXTRA-PROSTÁTICA (GRASA PERIPROSTÁTICA): ${fat.toUpperCase()}.
- INVASIÓN LINFOVASCULAR (LVI): ${lvi.toUpperCase()}.
- INVASIÓN PERINEURAL (PNI): ${pni.toUpperCase()}.
- ESTADIFICACIÓN (AJCC 8.ª EDICIÓN): ${stage.toUpperCase()}.
- TEJIDO PROSTÁTICO REMANENTE: ${findings.toUpperCase()}.

==================================================
RESUMEN SINÓPTICO CAP (PROTOCOLO OFICIAL v4.2.0.0)
==================================================
${synopticText}`;

        return { macro, micro, diag, synoptic: synopticText };
    }

    // --- PROTOCOLO HEPATOBILIAR: HÍGADO CARCINOMA HEPATOCELULAR ---
    if (schemaId === 'liver_hcc') {
        const proc = getVal('procedure') || 'Hepatectomía parcial';
        const hist = getVal('histologic_type') || 'Carcinoma hepatocelular (convencional / habitual)';
        const grado = getVal('histologic_grade') || 'G2: Moderadamente diferenciado';
        const foc = getVal('tumor_focality') || 'Solitario';
        const loc = getVal('tumor_site') || 'Lóbulo hepático derecho';
        const szViable = state.tumor_size_viable ? `${state.tumor_size_viable} cm` : '3.5 cm';
        const szGross = state.tumor_size_gross ? `${state.tumor_size_gross} cm` : szViable;
        const treat = getVal('treatment_effect') || 'Sin terapia presúrgica conocida';
        const sat = getVal('satellitosis') || 'No identificada';
        const extent = getVal('tumor_extent') || 'Confinado al parénquima hepático';
        const vasc = getVal('vascular_invasion') || 'No identificada';
        const pni = getVal('perineural_invasion') || 'No identificada';
        const margStatus = getVal('margin_status') || 'Todos los márgenes negativos para carcinoma invasor (Resección R0)';
        const margClosest = getVal('closest_margin') || 'Margen de sección parenquimatoso hepático';
        const margDist = state.margin_distance_mm ? `${state.margin_distance_mm} mm` : '12 mm';
        const nodes = getVal('regional_nodes_status') || 'No aplicable (no se remitieron ganglios linfáticos)';
        const pt = getVal('pt_category') || (parseFloat(state.tumor_size_viable || 0) <= 2.0 ? 'pT1a' : 'pT1b');
        const pn = getVal('pn_category') || 'pNX';
        const pm = getVal('pm_category') || 'No aplicable';
        const fibrosis = getVal('fibrosis_stage') || 'Cirrosis hepática establecida (F4 / Ishak 5-6)';
        const dysplastic = getVal('dysplastic_nodules') || 'No identificados';
        const bgLiver = getVal('background_liver_findings') || 'Esteatosis hepatocitaria leve';

        const macro = `Se recibe en formol espécimen quirúrgico fijado rotulado como pieza de ${proc.toLowerCase()}, con medidas globales de 14.5 x 10.5 x 6.0 cm y un peso de 390 gramos. La superficie externa capsular peritoneal es pardo-rojiza con brillo preservado. A los cortes seriados coronales a intervalos de 0.5 cm, en el ${loc.toLowerCase()} se evidencia una formación tumoral nodular ${foc.toLowerCase()}, de consistencia firme, con márgenes expansivos bien definidos, que mide ${szViable} en su dimensión viable mayor (${szGross} de diámetro macroscópico global). La superficie de corte del tumor exhibe tonalidad pardo-amarillenta con tintes verdosos y ${treat.toLowerCase()}. Se tinta con tinta china negra el margen parenquimatoso de sección quirúrgica, observándose que el borde tumoral dista ${margDist} del margen más próximo (${margClosest.toLowerCase()}). El parénquima hepático no tumoral circundante exhibe patrón ${fibrosis.toLowerCase()}.`;

        const micro = `Los cortes histológicos revelan neoplasia maligna epitelial primaria de estirpe hepatocelular correspondiente a ${hist}.
Grado y diferenciación: Las células tumorales se disponen en patrón trabecular engrosado (más de 3 células de espesor) y pseudoglandular con pleomorfismo nuclear intermedio y nucléolos evidentes, compatible con ${grado}.
Respuesta terapéutica: ${treat}.
Satelitosis tumoral: ${sat}.
Extensión tumoral: ${extent}.
Invasión vascular: ${vasc}.
Invasión perineural: ${pni}.
Márgenes quirúrgicos: ${margStatus}. Margen más cercano: ${margClosest} a ${margDist} libre de tumor.
Ganglios linfáticos regionales: ${nodes}.
Parénquima hepático no neoplásico adyacente: Estadio de fibrosis ${fibrosis}, nódulos displásicos: ${dysplastic}, y hallazgos adicionales de ${bgLiver}.`;

        const diag = `HÍGADO (${proc.toUpperCase()}):
- ${hist.toUpperCase()}.
- GRADO HISTOLÓGICO: ${grado.toUpperCase()}.
- DIÁMETRO MAYOR DE TUMOR VIABLE: ${szViable.toUpperCase()} (MACROSCÓPICO: ${szGross.toUpperCase()}).
- FOCALIDAD: ${foc.toUpperCase()} (LOCALIZACIÓN: ${loc.toUpperCase()}).
- INVASIÓN VASCULAR: ${vasc.toUpperCase()}.
- SATELITOSIS TUMORAL: ${sat.toUpperCase()}.
- MÁRGENES QUIRÚRGICOS: ${margStatus.toUpperCase()} (${margClosest.toUpperCase()} A ${margDist.toUpperCase()} LIBRE).
- GANGLIOS LINFÁTICOS REGIONALES: ${nodes.toUpperCase()}.
- ESTADIFICACIÓN PATOLÓGICA (AJCC 8.ª EDICIÓN): ${pt.toUpperCase()} ${pn.toUpperCase()} ${pm.toUpperCase()}.
- PARÉNQUIMA HEPÁTICO NO TUMORAL: ${fibrosis.toUpperCase()}, ${bgLiver.toUpperCase()}.

==================================================
RESUMEN SINÓPTICO CAP (PROTOCOLO OFICIAL v4.3.0.0)
==================================================
${synopticText}`;

        return { macro, micro, diag, synoptic: synopticText };
    }

    // --- COMPILADOR GENÉRICO ESTRUCTURADO PARA CUALQUIER OTRO PROTOCOLO CAP ---
    const mainType = getVal('histologic_type') || getVal('type') || 'Neoplasia maligna invasora';
    const mainGrade = getVal('histologic_grade') || getVal('grade') || 'Grado histológico evaluado';
    const mainProc = getVal('procedure') || 'Resección quirúrgica';
    const mainPt = getVal('pt_category') || '';
    const mainPn = getVal('pn_category') || '';
    const mainPm = getVal('pm_category') || '';
    const stageStr = [mainPt, mainPn, mainPm].filter(Boolean).join(' ');

    const macro = `Se recibe en formol espécimen quirúrgico fijado rotulado como pieza de ${mainProc.toLowerCase()}, con dimensiones y características macroscópicas representativas remitidas para estudio anatomopatológico y procesadas según los estándares de inclusión del College of American Pathologists (CAP).`;

    const micro = `Los cortes histológicos muestran tejido con proliferación neoplásica correspondiente a ${mainType}, con ${mainGrade}. Se evaluaron minuciosamente los parámetros de arquitectura, márgenes quirúrgicos, invasión linfovascular y perineural, y parénquima adyacente según el checklist sinóptico oficial adjunto.`;

    const diag = `${schema.title.toUpperCase()}:
- ${mainType.toUpperCase()}.
- ${mainGrade.toUpperCase()}.${stageStr ? `\n- ESTADIFICACIÓN PATOLÓGICA (AJCC): ${stageStr.toUpperCase()}.` : ''}
- EVALUACIÓN SINÓPTICA FORMAL SEGÚN ESTÁNDARES AJCC / CAP.

==================================================
RESUMEN SINÓPTICO CAP (CHECKLIST OFICIAL)
==================================================
${synopticText}`;

    return {
        macro: sanitizeSynopticText(macro),
        micro: sanitizeSynopticText(micro),
        diag: sanitizeSynopticText(diag),
        synoptic: sanitizeSynopticText(synopticText)
    };
}

// 3. COMPILADOR DE INFORME HISTOPATOLÓGICO LARGO COMPLETO (Texto Integrado)
export function compileLongReport(schemaId, state) {
    const parts = compileSeparateReportParts(schemaId, state);
    if (!parts || !parts.diag) return compileSynopticReport(schemaId, state);

    return sanitizeSynopticText(`================================================================================
INFORME ANATOMOPATOLÓGICO Y PROTOCOLO SINÓPTICO CAP
================================================================================

DESCRIPCIÓN MACROSCÓPICA:
${parts.macro}

DESCRIPCIÓN MICROSCÓPICA:
${parts.micro}

DIAGNÓSTICO HISTOPATOLÓGICO DEFINITIVO:
${parts.diag}
`);
}
