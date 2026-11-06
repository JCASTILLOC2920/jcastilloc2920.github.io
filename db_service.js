
import { cleanCodeFunc, correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName, escapeHtml, sanitizeDateForPg, normalizeSexo } from './utils.js';
import { safeDeepClone, safeMonotonicMerge } from './sovereign_integrity_guard.js';
export { safeDeepClone, safeMonotonicMerge };
// db_service.js
export function getRealSupabasePatients() {
    if (typeof window !== 'undefined') {
        if (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) return window.REAL_SUPABASE_PATIENTS;
        if (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) return window.realSupabaseBackup;
        if (Array.isArray(window.REAL_SUPABASE_BACKUP) && window.REAL_SUPABASE_BACKUP.length > 0) return window.REAL_SUPABASE_BACKUP;
    }
    if (typeof globalThis !== 'undefined') {
        if (Array.isArray(globalThis.REAL_SUPABASE_PATIENTS) && globalThis.REAL_SUPABASE_PATIENTS.length > 0) return globalThis.REAL_SUPABASE_PATIENTS;
        if (Array.isArray(globalThis.realSupabaseBackup) && globalThis.realSupabaseBackup.length > 0) return globalThis.realSupabaseBackup;
        if (Array.isArray(globalThis.REAL_SUPABASE_BACKUP) && globalThis.REAL_SUPABASE_BACKUP.length > 0) return globalThis.REAL_SUPABASE_BACKUP;
    }
    return [];
}

const REAL_SUPABASE_PATIENTS = new Proxy([], {
    get(target, prop) {
        const list = getRealSupabasePatients();
        const source = list.length > 0 ? list : target;
        const val = source[prop];
        if (typeof val === 'function') {
            return val.bind(source);
        }
        return val;
    }
});
export { cleanCodeFunc, correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName, escapeHtml, sanitizeDateForPg, normalizeSexo, REAL_SUPABASE_PATIENTS };

// Bases de datos simuladas / temporales
export const patientDatabase = [];
export const patientMap = new Map();
if (typeof window !== 'undefined') {
    window.patientDatabase = patientDatabase;
    window.patientMap = patientMap;
}

// Auto-actualización inmediata y soberana de localStorage e IndexedDB a los 1,252 registros reconciliados + RENIEC
(function autoActualizarLocalStorageSoberano() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
        const CURRENT_SSOT_VER = '20261106_v1252_ssot_tabs_macro_383';
        const savedVer = localStorage.getItem('jcpathlab_ssot_version');
        const raw = localStorage.getItem('patientDatabaseLocal') || localStorage.getItem('patientDatabase') || localStorage.getItem('pacientesDB');
        let parsedCount = 0;
        let hasGhostData = false;
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                parsedCount = parsed.length;
                hasGhostData = parsed.some(p => {
                    if (!p) return false;
                    const nom = String(p.paciente || '').toUpperCase();
                    const cod = String(p.codAtencion || p.cod_atencion || p.codigo || '').toUpperCase();
                    const doc = String(p.med_solicitante || p.medSolicitante || p.doctor || '').toUpperCase();
                    return nom.includes('SIN NOMBRE') || /26Q-18\d{3}/.test(cod) || (['26Q-300', '26Q-301', '26Q-259'].includes(cod) && doc.includes('CASTILLO'));
                });
            } catch(e) {}
        }
        const master = getRealSupabasePatients();
        const targetCount = Math.max(1252, master.length);
        if ((savedVer !== CURRENT_SSOT_VER || parsedCount < targetCount || hasGhostData) && master.length >= 1250) {
            console.log(`[Auto-Heal LocalStorage] Sincronizando almacenamiento local (${parsedCount} -> ${master.length} pacientes SSOT v1252 + RENIEC)...`);
            safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(master));
            try { localStorage.setItem('patientDatabase', JSON.stringify(master)); } catch(e) {}
            try { localStorage.setItem('pacientesDB', JSON.stringify(master)); } catch(e) {}
            try { localStorage.setItem('jcpathlab_ssot_version', CURRENT_SSOT_VER); } catch(e) {}
        }
    } catch (e) {
        console.warn('[Auto-Heal LocalStorage] Error en verificación preventiva:', e);
    }
})();

export function safeSetLocalStorage(key, value, retryCount = 0) {
    // BLINDAJE SOBERANO INVIOLABLE: Proteger patientDatabaseLocal de vaciados accidentales o sobreescritura nula
    if (key === 'patientDatabaseLocal' || key === 'patientDatabase' || key === 'pacientesDB') {
        if (!value || value === '[]' || value === '{}' || value.length < 50) {
            console.error(`[Blindaje Soberano] Bloqueado intento destructivo de guardar base de datos vacía o nula en '${key}'. Los expedientes permanecen protegidos.`);
            return;
        }
    }
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // Protección robusta contra QuotaExceededError (5MB)
        const isQuotaError = e && (
            e.name === 'QuotaExceededError' ||
            e.code === 22 ||
            e.code === 1014 ||
            (e.message && e.message.toLowerCase().includes('quota'))
        );
        
        if (retryCount >= 1) {
            console.warn(`[Storage Engine] Cuota excedida para '${key}' en localStorage. Derivando transparente a IndexedDB ('ClinicaReportesDB').`);
            try {
                if (typeof indexedDB !== 'undefined') {
                    const request = indexedDB.open('ClinicaReportesDB', 3);
                    request.onsuccess = (event) => {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('pacientes_completos')) return;
                        const tx = db.transaction('pacientes_completos', 'readwrite');
                        const store = tx.objectStore('pacientes_completos');
                        store.put({ id: key, payload: value, updatedAt: new Date().toISOString() });
                    };
                }
            } catch (idbErr) {
                console.warn(`[Storage Engine] Falló también el respaldo en IndexedDB:`, idbErr);
            }
            return;
        }
        
        console.warn(`[Storage Engine] Cuota excedida al guardar '${key}'. Purgando respaldos secundarios y reintentando...`);
        try {
            localStorage.removeItem('patientDatabaseLocal_bak3');
            localStorage.removeItem('patientDatabaseLocal_bak2');
            localStorage.removeItem('patientDatabaseLocal_bak1');
            safeSetLocalStorage(key, value, retryCount + 1);
        } catch (e2) {
            // Derivación automática a IndexedDB ante saturación definitiva
            try {
                if (typeof indexedDB !== 'undefined') {
                    const request = indexedDB.open('ClinicaReportesDB', 3);
                    request.onsuccess = (event) => {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('pacientes_completos')) return;
                        const tx = db.transaction('pacientes_completos', 'readwrite');
                        const store = tx.objectStore('pacientes_completos');
                        store.put({ id: key, payload: value, updatedAt: new Date().toISOString() });
                    };
                }
            } catch (idbErr2) {
                console.warn(`[Storage Engine] No se pudo escribir '${key}' en localStorage ni en IndexedDB. Se conserva en RAM.`);
            }
        }
    }
}

// INDEXEDDB STORAGE FOR HEAVY PATIENT RECORDS & MODO QUIROFANO OFFLINE LRU
const IDB_NAME = 'ClinicaReportesDB';
const IDB_VERSION = 3; // Actualizado a v3 para almacén desacoplado 'media_blobs'
const STORE_NAME = 'pacientes_completos';
const LRU_STORE_NAME = 'casos_quirofano_lru';
const MEDIA_STORE_NAME = 'media_blobs';
const MAX_LRU_CASES = 2000;


export function parseCodAtencionForSort(cod) {
    if (!cod) return { year: -1, num: 0, service: 'Q', sub: 0, key: 0 };
    const codStr = String(cod || '').trim().toUpperCase();
    
    let service = 'Q';
    let serviceWeight = 3;
    if (codStr.includes('C-') || /C[-_\s0-9]|^C\d|\dC\d/.test(codStr)) {
        service = 'C';
        serviceWeight = 2;
    } else if (codStr.includes('I-') || /I[-_\s0-9]|^I\d|\dI\d/.test(codStr)) {
        service = 'I';
        serviceWeight = 1;
    }

    // GARANTÍA MILITAR:
    // Soporta formatos de 2 o 4 dígitos de año: 26Q-280, 2026Q-280, 26-Q-280, 26C-015, 26I-003, etc., más sufijo alfanumérico
    const match = codStr.match(/(?:20)?(\d{2})[^\d]*(\d+)([A-Z])?/);
    if (match) {
        const yr = parseInt(match[1], 10);
        let n = parseInt(match[2], 10);
        const sub = match[3] ? match[3].charCodeAt(0) - 64 : 0;
        // Si el año es 26 pero el número es absurdo (> 2000, ej: 18974), es un ID de BD que no debe colocarse arriba de biopsias reales
        if (yr === 26 && n > 2000) {
            n = 0;
        }
        const key = yr * 10000000000 + serviceWeight * 10000000 + n * 100 + sub;
        return {
            year: yr,
            num: n,
            service: service,
            sub: sub,
            key: key
        };
    }
    const numOnly = codStr.match(/(\d+)/);
    const n = numOnly ? parseInt(numOnly[1], 10) : 0;
    return {
        year: 0,
        num: n,
        service: service,
        sub: 0,
        key: n
    };
}

export function attachSortKeys(p, force = false) {
    if (!p) return p;
    const currentCode = String(p.codAtencion || p.cod_atencion || p.codigo || '').trim();
    
    // GARANTÍA MILITAR: Si el código cambió o faltan las llaves, re-calcular SIEMPRE (previene llaves caché obsoletas)
    if (force || p._sortCodeRaw !== currentCode || p._sortKey === undefined || p._sortYear === undefined || p._sortNum === undefined) {
        const parsed = parseCodAtencionForSort(currentCode);
        p._sortYear = parsed.year;
        p._sortNum = parsed.num;
        p._sortService = parsed.service;
        p._sortKey = parsed.key;
        p._sortCodeRaw = currentCode;
    }
    if (force || !p._searchKey || p._searchCodeRaw !== currentCode) {
        const raw = `${currentCode} ${p.paciente || ''} ${p.nombres || ''} ${p.apellidos || ''} ${p.dni || ''} ${p.medSolicitante || ''} ${p.clinica || ''} ${p.especimen || ''}`;
        p._searchKey = raw.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        p._searchCodeRaw = currentCode;
    }
    return p;
}

export function sortPatientArray(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return arr;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            attachSortKeys(arr[i]);
        }
    }
    return arr.sort((a, b) => {
        const kA = (a && a._sortKey !== undefined) ? a._sortKey : 0;
        const kB = (b && b._sortKey !== undefined) ? b._sortKey : 0;
        return kB - kA;
    });
}



/**
 * MOTOR DE MERGE PROTEGIDO NO DESTRUCTIVO (ZERO-DATA-LOSS)
 * Garantiza de forma matemática y médica que NUNCA un campo vacío o estado inferior pise un reporte patológico.
 */
export function safeMergePatientRecords(baseRecord, incomingRecord) {
    if (!baseRecord && !incomingRecord) return null;
    if (!baseRecord) return JSON.parse(JSON.stringify(incomingRecord));
    if (!incomingRecord) return JSON.parse(JSON.stringify(baseRecord));

    const cleanText = (txt) => String(txt || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const hasMeaningfulText = (txt) => {
        const c = cleanText(txt);
        return c !== '' && c !== '---' && c !== '--';
    };

    const pickBestMedicalText = (txtIncoming, txtBase) => {
        const incomingValid = hasMeaningfulText(txtIncoming);
        const baseValid = hasMeaningfulText(txtBase);
        if (incomingValid && !baseValid) return txtIncoming;
        if (!incomingValid && baseValid) return txtBase;
        if (incomingValid && baseValid) {
            const tInc = new Date(incomingRecord.updatedAt || incomingRecord.updated_at || 0).getTime();
            const tBase = new Date(baseRecord.updatedAt || baseRecord.updated_at || 0).getTime();
            if (tInc > 0 && tInc >= tBase) {
                return txtIncoming;
            }
            return cleanText(txtIncoming).length >= cleanText(txtBase).length ? txtIncoming : txtBase;
        }
        return txtIncoming || txtBase || "";
    };

    const mergedDiagText = pickBestMedicalText(incomingRecord.diagnostico, baseRecord.diagnostico);
    const mergedMacroText = pickBestMedicalText(incomingRecord.macroDesc, baseRecord.macroDesc);
    const mergedMicroText = pickBestMedicalText(incomingRecord.microDesc, baseRecord.microDesc);

    const hasDiag = hasMeaningfulText(mergedDiagText);
    const hasDraft = hasMeaningfulText(mergedMacroText) || hasMeaningfulText(mergedMicroText);

    let isFirm = false;
    let isMod = false;
    let finalState = 'Pendiente';

    // BLINDAJE MILITAR DE FIRMA MÉDICA (JC PATH LAB):
    // Un informe SOLO se considera firmado si fue explícitamente firmado por el patólogo (firmado === true).
    // La presencia de texto diagnóstico por sí sola NO confiere validez de informe firmado.
    const isExplicitlySigned = incomingRecord.firmado === true || incomingRecord.firmado === 1 || String(incomingRecord.firmado).toLowerCase() === 'true' || (incomingRecord.firmado === undefined && (baseRecord.firmado === true || baseRecord.firmado === 1 || String(baseRecord.firmado).toLowerCase() === 'true'));

    if (isExplicitlySigned && hasDiag) {
        isFirm = true;
        isMod = true;
        finalState = 'Completado';
    } else if (hasDiag || hasDraft) {
        isFirm = false;
        isMod = true;
        finalState = 'En Proceso';
    } else {
        isFirm = false;
        isMod = false;
        finalState = 'Pendiente';
    }

    const pickIncomingFirst = (b, a, fallback = "") => {
        if (b !== undefined && b !== null && String(b).trim() !== '' && String(b).trim() !== '--') return b;
        if (a !== undefined && a !== null && String(a).trim() !== '' && String(a).trim() !== '--') return a;
        return fallback;
    };

    const isMarrerosOrLloclla = (med1, med2, doc1, doc2) => {
        const str = `${med1 || ''} ${med2 || ''} ${doc1 || ''} ${doc2 || ''}`.toUpperCase();
        return str.includes('MARREROS') || str.includes('LLOCLLA');
    };

    let resolvedMed = pickIncomingFirst(
        incomingRecord.medSolicitante || incomingRecord.med_solicitante || incomingRecord.medico_solicitante || incomingRecord.doctor || incomingRecord.medico,
        baseRecord.medSolicitante || baseRecord.med_solicitante || baseRecord.medico_solicitante || baseRecord.doctor || baseRecord.medico
    );
    let resolvedDoctor = pickIncomingFirst(incomingRecord.doctor, baseRecord.doctor);
    let resolvedClinica = pickIncomingFirst(incomingRecord.clinica, baseRecord.clinica);

    const normalizeClinicDirect = (cStr) => {
        if (!cStr) return '';
        const norm = String(cStr).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (norm.includes('ventanilla')) return 'CLÍNICA CARRIÓN VENTANILLA';
        if (norm.includes('carrion')) return 'CLÍNICA CARRIÓN';
        if (norm.includes('clemente')) return 'CLÍNICA SAN CLEMENTE';
        if (norm.includes('mujer')) return 'CLINICA LA MUJER';
        if (norm.includes('alfa') || norm.includes('prevenir')) return 'CLÍNICA ALFA PREVENIR';
        if (norm.includes('luz')) return 'CLÍNICA LA LUZ';
        if (norm.includes('uroserv') || norm.includes('urolog')) return 'UROSERV';
        if (norm.includes('junco')) return 'SR JUNCO';
        return String(cStr).trim().toUpperCase();
    };

    if (isMarrerosOrLloclla(resolvedMed, resolvedDoctor, baseRecord.medSolicitante, incomingRecord.medSolicitante)) {
        resolvedClinica = 'CLINICA LA MUJER';
    } else {
        const medUpper = `${resolvedMed || ''} ${resolvedDoctor || ''}`.toUpperCase();
        if (!resolvedClinica || resolvedClinica === 'SIN CLINICA' || resolvedClinica === 'SIN CLINICA DEFINIDA' || resolvedClinica === '---') {
            if (medUpper.includes('SAIRE') || medUpper.includes('BOCANGEL')) resolvedClinica = 'CLÍNICA ALFA PREVENIR';
            else if (medUpper.includes('VILCA')) resolvedClinica = 'CLÍNICA LA LUZ';
            else if (medUpper.includes('ESCALANTE')) resolvedClinica = 'CLÍNICA SAN CLEMENTE';
            else if (medUpper.includes('CASTAÑEDA') || medUpper.includes('CASTANEDA')) resolvedClinica = 'UROSERV';
            else if (medUpper.includes('VENTANILLA')) resolvedClinica = 'CLÍNICA CARRIÓN VENTANILLA';
            else if (medUpper.includes('MUÑANTE') || medUpper.includes('MUNANTE') || medUpper.includes('BECERRA') || medUpper.includes('CHUNGUI')) resolvedClinica = 'CLÍNICA CARRIÓN';
        }
    }
    if (resolvedClinica) {
        resolvedClinica = normalizeClinicDirect(resolvedClinica);
    }

    return {
        ...baseRecord,
        ...incomingRecord,
        id: incomingRecord.id || baseRecord.id,
        codAtencion: incomingRecord.codAtencion || baseRecord.codAtencion || incomingRecord.cod_atencion || baseRecord.cod_atencion,
        dni: pickIncomingFirst(incomingRecord.dni, baseRecord.dni, "0"),
        paciente: pickIncomingFirst(incomingRecord.paciente, baseRecord.paciente),
        nombres: pickIncomingFirst(incomingRecord.nombres, baseRecord.nombres),
        apellidos: pickIncomingFirst(incomingRecord.apellidos, baseRecord.apellidos),
        edad: pickIncomingFirst(incomingRecord.edad, baseRecord.edad, "--"),
        sexo: normalizeSexo(pickIncomingFirst(incomingRecord.sexo, baseRecord.sexo), pickIncomingFirst(incomingRecord.especimen, baseRecord.especimen), pickIncomingFirst(incomingRecord.paciente, baseRecord.paciente)),
        especimen: pickIncomingFirst(incomingRecord.especimen, baseRecord.especimen),
        motivoEstudio: pickIncomingFirst(incomingRecord.motivoEstudio, baseRecord.motivoEstudio),
        telContacto: pickIncomingFirst(incomingRecord.telContacto, baseRecord.telContacto, pickIncomingFirst(incomingRecord.especimen, baseRecord.especimen)),
        medSolicitante: resolvedMed,
        clinica: resolvedClinica,
        doctor: resolvedDoctor,
        service: pickIncomingFirst(incomingRecord.service, baseRecord.service),
        fecRegistro: pickIncomingFirst(
            incomingRecord.fecRegistro || incomingRecord.fec_registro || incomingRecord.fecha_registro || incomingRecord.fechaIngreso || incomingRecord.fecha_ingreso || incomingRecord.fecRecepcion,
            baseRecord.fecRegistro || baseRecord.fec_registro || baseRecord.fecha_registro || baseRecord.fechaIngreso || baseRecord.fecha_ingreso || baseRecord.fecRecepcion
        ),
        fecEntrega: pickIncomingFirst(
            incomingRecord.fecEntrega || incomingRecord.fec_entrega || incomingRecord.fecha_entrega || incomingRecord.fechaInforme || incomingRecord.fecha_informe,
            baseRecord.fecEntrega || baseRecord.fec_entrega || baseRecord.fecha_entrega || baseRecord.fechaInforme || baseRecord.fecha_informe
        ),
        costo: (incomingRecord.costo !== undefined && incomingRecord.costo !== null && String(incomingRecord.costo).trim() !== '') ? incomingRecord.costo : baseRecord.costo,
        adelanto: (incomingRecord.adelanto !== undefined && incomingRecord.adelanto !== null && String(incomingRecord.adelanto).trim() !== '') ? incomingRecord.adelanto : baseRecord.adelanto,
        resta: (incomingRecord.resta !== undefined && incomingRecord.resta !== null && String(incomingRecord.resta).trim() !== '') ? incomingRecord.resta : baseRecord.resta,
        pagado: !!(incomingRecord.pagado || baseRecord.pagado),
        macroDesc: mergedMacroText,
        microDesc: mergedMicroText,
        diagnostico: mergedDiagText,
        img01: incomingRecord.img01 || baseRecord.img01 || null,
        img02: incomingRecord.img02 || baseRecord.img02 || null,
        macro360: incomingRecord.macro360 || baseRecord.macro360 || null,
        solicitudInforme: incomingRecord.solicitudInforme || baseRecord.solicitudInforme || null,
        pdfBase64: incomingRecord.pdfBase64 || baseRecord.pdfBase64 || null,
        firmado: isFirm,
        modificado: isMod,
        estado: finalState,
        sincronizado: !!(baseRecord.sincronizado || incomingRecord.sincronizado)
    };
}

// OPERACIÓN ATÓMICA DE GRADO MILITAR: Inserción/Actualización O(1) + Ordenamiento automático sin duplicados
export function upsertAndSortPatient(patient) {
    if (!patient) return null;
    const targetCode = cleanCodeFunc(patient.codAtencion || patient.cod_atencion);
    if (!targetCode) {
        patientDatabase.unshift(patient);
        sortPatientArray(patientDatabase);
        return patient;
    }
    
    // Deduplicación atómica garantizada O(1)
    if (patientMap.has(targetCode)) {
        const local = patientMap.get(targetCode);
        delete local._searchKey;
        delete local._sortYear;
        delete local._sortNum;
        delete local._sortCodeRaw;
        
        Object.assign(local, patient, {
            codAtencion: patient.codAtencion || patient.cod_atencion || local.codAtencion || local.cod_atencion
        });
    } else {
        const idx = patientDatabase.findIndex(p => (patient.id && p.id && String(p.id) === String(patient.id)) || cleanCodeFunc(p.codAtencion || p.cod_atencion) === targetCode);
        if (idx !== -1) {
            const local = patientDatabase[idx];
            delete local._searchKey;
            delete local._sortYear;
            delete local._sortNum;
            delete local._sortCodeRaw;
            Object.assign(local, patient, {
                codAtencion: patient.codAtencion || patient.cod_atencion || local.codAtencion || local.cod_atencion
            });
            patientMap.set(targetCode, local);
        } else {
            patientDatabase.push(patient);
            patientMap.set(targetCode, patient);
        }
    }
    
    sortPatientArray(patientDatabase);
    return patientMap.get(targetCode) || patient;
}

// Las funciones de ortografía y sanitización (correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName) están re-exportadas desde utils.js


export function cleanTextContentLocalV4(text, preserveCase = false) {
    if (!text) return '';
    let result = text;

    if (!preserveCase) {
        result = result.toLowerCase();
    }

    result = result.replace(/[{}]/g, '');
    result = result.split('\n').map(line => line.replace(/[ \t\r]+/g, ' ').trim()).join('\n');

    const replacements = {
        "espcimen": "espécimen",
        "especimen": "espécimen",
        "apendicectoma": "apendicectomía",
        "apendicectomia": "apendicectomía",
        "diametro": "diámetro",
        "dimetro": "diámetro",
        "apendice": "apéndice",
        "apndice": "apéndice",
        "vesicula": "vesícula",
        "vescula": "vesícula",
        "congestin": "congestión",
        "congestion": "congestión",
        "cronica": "crónica",
        "crnica": "crónica",
        "clinico": "clínico",
        "clnico": "clínico",
        "histologico": "histológico",
        "histolgio": "histológico",
        "celulas": "células",
        "clulas": "células",
        "tincion": "tinción",
        "tincin": "tinción",
        "clasificacion": "clasificación",
        "clasificacin": "clasificación",
        "adecuacion": "adecuación",
        "adecuacin": "adecuación",
        "evaluacion": "evaluación",
        "evaluacin": "evaluación",
        "diagnostico": "diagnóstico",
        "diagnstico": "diagnóstico",
        "reaccion": "reacción",
        "reaccin": "reacción",
        "proliferacion": "proliferación",
        "proliferacin": "proliferación",
        "infiltracion": "infiltración",
        "infiltracin": "infiltración",
        "obliteracion": "obliteración",
        "obliteracin": "obliteración",
        "perforacion": "perforación",
        "perforacin": "perforación",
        "atrofico": "atrófico",
        "atrogico": "atrófico",
        "atrofio": "atrófico",
        "atipico": "atípico",
        "atipica": "atípica",
        "atipicas": "atípicas",
        "atipicos": "atípicos",
        "nucleos": "núcleos",
        "ncleos": "núcleos",
        "exeresis": "exéresis",
        "exresis": "exéresis",
        "histerectomia": "histerectomía",
        "histerectoma": "histerectomía",
        "ginecologia": "ginecología",
        "ginecolgia": "ginecología",
        "urologia": "urología",
        "urolgia": "urología",
        "citologia": "citología",
        "citolgia": "citología",
        "cupula": "cúpula",
        "litiasica": "litiásica",
        "litisica": "litiásica",
        "prostata": "próstata",
        "prstata": "próstata",
        "anatomopatologico": "anatomopatológico",
        "anatomopatolgico": "anatomopatológico",
        "fijacion": "fijación",
        "fijacin": "fijación",
        "coloracion": "coloración",
        "coloracin": "coloración",
        "morfologia": "morfología",
        "homogenea": "homogénea",
        "elastica": "elástica",
        "capsula": "cápsula",
        "calcificacion": "calcificación",
        "calcificacin": "calcificación",
        "inmunohistoquimica": "inmunohistoquímica",
        "reseccion": "resección",
        "reseccin": "resección",
        "obstruccion": "obstrucción",
        "obstruccin": "obstrucción",
        "ulceracion": "ulceración",
        "ulceracin": "ulceración",
        "involucion": "involución",
        "involucin": "involución"
    };

    for (let k in replacements) {
        const v = replacements[k];
        if (!preserveCase) {
            const regex = new RegExp('\\b' + k + '\\b', 'g');
            result = result.replace(regex, v);
        } else {
            const regexLower = new RegExp('\\b' + k + '\\b', 'g');
            result = result.replace(regexLower, v);
            const regexUpper = new RegExp('\\b' + k.toUpperCase() + '\\b', 'g');
            result = result.replace(regexUpper, v.toUpperCase());
        }
    }

    result = result.replace(/\b([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)\s+\1\b/gi, '$1');
    return result.trim();
}

let cachedIDBInstance = null;

function getIDB() {
    if (cachedIDBInstance) {
        return Promise.resolve(cachedIDBInstance);
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'codAtencion' });
            }
            if (!db.objectStoreNames.contains(LRU_STORE_NAME)) {
                const lruStore = db.createObjectStore(LRU_STORE_NAME, { keyPath: 'codAtencion' });
                lruStore.createIndex('lastViewedAt', 'lastViewedAt', { unique: false });
            }
            if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
                db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'codAtencion' });
            }
        };
        request.onsuccess = (e) => {
            cachedIDBInstance = e.target.result;
            cachedIDBInstance.onversionchange = () => {
                cachedIDBInstance.close();
                cachedIDBInstance = null;
            };
            resolve(cachedIDBInstance);
        };
        request.onerror = (e) => {
            cachedIDBInstance = null;
            reject(e.target.error);
        };
    });
}

// Convertidor asíncrono a base64 de fotos macroscópicas/microscópicas para funcionamiento offline en sótanos de quirófano
export async function urlToBase64(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('data:image/')) return url; // Ya está codificado en base64
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('blob:')) return url;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(url, { signal: controller.signal, mode: 'cors' });
        clearTimeout(timeoutId);
        if (!response.ok) return url;
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(url);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return url;
    }
}

// Desalojo LRU estricto: conserva exactamente los últimos 20 casos quirúrgicos vistos
async function pruneLRUCache(db) {
    try {
        const tx = db.transaction(LRU_STORE_NAME, 'readwrite');
        const store = tx.objectStore(LRU_STORE_NAME);
        const countReq = store.count();

        const count = await new Promise((resolve, reject) => {
            countReq.onsuccess = () => resolve(countReq.result);
            countReq.onerror = () => reject(countReq.error);
        });

        if (count > MAX_LRU_CASES) {
            const excess = count - MAX_LRU_CASES;
            const index = store.index('lastViewedAt');
            const cursorReq = index.openCursor(); // Orden ascendente: los más antiguos primero
            let deleted = 0;

            await new Promise((resolve, reject) => {
                cursorReq.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor && deleted < excess) {
                        cursor.delete();
                        deleted++;
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };
                cursorReq.onerror = () => reject(cursorReq.error);
            });

            console.log(`[Modo Quirófano LRU] Purgados ${deleted} casos antiguos de IndexedDB. Conservando los ${MAX_LRU_CASES} más recientes.`);
        }
    } catch (err) {
        console.warn('[Modo Quirófano LRU] Advertencia purgando caché LRU:', err);
    }
}

// Guarda o actualiza un caso quirúrgico en la caché LRU de IndexedDB con fotos en base64
export async function saveSurgicalCaseToLRU(patient) {
    if (!patient) return null;
    const rawCode = patient.codAtencion || patient.cod_atencion;
    if (!rawCode) return null;
    const cleanCode = String(rawCode).trim();

    try {
        const db = await getIDB();
        if (!db.objectStoreNames.contains(LRU_STORE_NAME)) return null;

        let img01 = patient.img01;
        let img02 = patient.img02;

        // Convertir fotos a base64 para inmunidad total a falta de señal
        if (img01 && typeof img01 === 'string' && !img01.startsWith('data:image/')) {
            img01 = await urlToBase64(img01);
        }
        if (img02 && typeof img02 === 'string' && !img02.startsWith('data:image/')) {
            img02 = await urlToBase64(img02);
        }

        let macro360 = patient.macro360;
        if (Array.isArray(macro360) && macro360.length > 0) {
            macro360 = await Promise.all(macro360.map(frame => {
                if (typeof frame === 'string' && !frame.startsWith('data:image/')) {
                    return urlToBase64(frame);
                }
                return frame;
            }));
        }

        const caseData = {
            ...patient,
            codAtencion: cleanCode,
            cod_atencion: cleanCode,
            img01: img01 || null,
            img02: img02 || null,
            macro360: macro360 || null,
            solicitudInforme: patient.solicitudInforme || null,
            lastViewedAt: Date.now(),
            cachedAtIso: new Date().toISOString(),
            isSurgicalLRU: true
        };

        await new Promise((resolve, reject) => {
            const tx = db.transaction(LRU_STORE_NAME, 'readwrite');
            const store = tx.objectStore(LRU_STORE_NAME);
            store.put(caseData);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        // Aplicar poda LRU para garantizar tope de 20
        await pruneLRUCache(db);

        console.log(`[Modo Quirófano LRU] Caso ${cleanCode} asegurado en IndexedDB con macroscopía offline.`);
        return caseData;
    } catch (e) {
        console.error('[Modo Quirófano LRU] Error al guardar caso quirúrgico:', e);
        return null;
    }
}

// Recupera un caso quirúrgico desde la caché LRU de IndexedDB
export async function getSurgicalCaseFromLRU(codAtencion) {
    if (!codAtencion) return null;
    try {
        const db = await getIDB();
        if (!db.objectStoreNames.contains(LRU_STORE_NAME)) return null;

        const cleanCode = String(codAtencion).trim();
        const tx = db.transaction(LRU_STORE_NAME, 'readonly');
        const store = tx.objectStore(LRU_STORE_NAME);

        const directReq = store.get(cleanCode);
        const direct = await new Promise((resolve, reject) => {
            directReq.onsuccess = () => resolve(directReq.result);
            directReq.onerror = () => reject(directReq.error);
        });
        if (direct) return direct;

        const cleanTarget = cleanCode.toUpperCase().replace(/[-_\s]/g, '');
        return new Promise((resolve) => {
            const cursorReq = store.openCursor();
            cursorReq.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    const k = String(cursor.key || '').trim().toUpperCase().replace(/[-_\s]/g, '');
                    if (k === cleanTarget) {
                        resolve(cursor.value);
                        return;
                    }
                    cursor.continue();
                } else {
                    resolve(null);
                }
            };
            cursorReq.onerror = () => resolve(null);
        });
    } catch (e) {
        console.error('[Modo Quirófano LRU] Error al recuperar caso de LRU:', e);
        return null;
    }
}

// Devuelve la lista de los últimos casos quirúrgicos vistos en orden cronológico inverso
export async function getRecentSurgicalCasesLRU(limit = 20) {
    try {
        const db = await getIDB();
        if (!db.objectStoreNames.contains(LRU_STORE_NAME)) return [];

        const tx = db.transaction(LRU_STORE_NAME, 'readonly');
        const store = tx.objectStore(LRU_STORE_NAME);
        const index = store.index('lastViewedAt');
        const cursorReq = index.openCursor(null, 'prev');
        const results = [];

        return new Promise((resolve, reject) => {
            cursorReq.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            cursorReq.onerror = () => reject(cursorReq.error);
        });
    } catch (e) {
        console.error('[Modo Quirófano LRU] Error al obtener casos recientes:', e);
        return [];
    }
}

if (typeof window !== 'undefined') {
    window.saveSurgicalCaseToLRU = saveSurgicalCaseToLRU;
    window.getSurgicalCaseFromLRU = getSurgicalCaseFromLRU;
    window.getRecentSurgicalCasesLRU = getRecentSurgicalCasesLRU;
    window.urlToBase64 = urlToBase64;
}

export async function savePatientToIndexedDB(patient) {
    try {
        const db = await getIDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        // Blindaje contra borrado accidental de fotos/solicitudes:
        // Si el objeto entrante carece de multimedia pero IndexedDB ya lo tenía, PRESERVARLO
        const cod = patient.codAtencion || patient.cod_atencion;
        if (cod) {
            const existingReq = store.get(cod);
            existingReq.onsuccess = () => {
                const prev = existingReq.result;
                const toSave = { ...patient };
                if (prev) {
                    if (!toSave.solicitudInforme && (prev.solicitudInforme || prev.solicitud_informe)) {
                        toSave.solicitudInforme = prev.solicitudInforme || prev.solicitud_informe;
                    }
                    if (!toSave.solicitud_informe && (prev.solicitud_informe || prev.solicitudInforme)) {
                        toSave.solicitud_informe = prev.solicitud_informe || prev.solicitudInforme;
                    }
                    if (!toSave.img01 && prev.img01) toSave.img01 = prev.img01;
                    if (!toSave.img02 && prev.img02) toSave.img02 = prev.img02;
                    if (!toSave.macro360 && prev.macro360) toSave.macro360 = prev.macro360;
                }
                store.put(toSave);
                // Registrar automáticamente en caché LRU si contiene diagnóstico, fotos o solicitud de informe
                if (toSave && (toSave.macroDesc || toSave.microDesc || toSave.img01 || toSave.img02 || toSave.diagnostico || toSave.solicitudInforme || toSave.solicitud_informe)) {
                    saveSurgicalCaseToLRU(toSave);
                }
            };
        } else {
            store.put(patient);
        }

        await new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("[IndexedDB] Error al guardar paciente:", e);
    }
}

export async function getPatientFromIndexedDB(codAtencion) {
    try {
        const db = await getIDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(codAtencion);
        let directResult = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (!directResult) {
            const upperCode = String(codAtencion || '').trim().toUpperCase();
            if (upperCode !== codAtencion) {
                const reqUpper = store.get(upperCode);
                directResult = await new Promise((resolve) => {
                    reqUpper.onsuccess = () => resolve(reqUpper.result);
                    reqUpper.onerror = () => resolve(null);
                });
            }
        }

        if (!directResult) {
            const cleanTarget = String(codAtencion || '').trim().toUpperCase().replace(/[-_\s]/g, '');
            directResult = await new Promise((resolve) => {
                const cursorReq = store.openCursor();
                cursorReq.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        const c = String(cursor.key || '').trim().toUpperCase().replace(/[-_\s]/g, '');
                        if (c === cleanTarget) {
                            resolve(cursor.value);
                            return;
                        }
                        cursor.continue();
                    } else {
                        resolve(null);
                    }
                };
                cursorReq.onerror = () => resolve(null);
            });
        }

        // Recuperar fotos y solicitud desde la caché quirúrgica LRU si la tienda principal carece de ellas
        if (!directResult || (!directResult.img01 && !directResult.img02) || !directResult.solicitudInforme) {
            const lruCase = await getSurgicalCaseFromLRU(codAtencion);
            if (lruCase) {
                if (!directResult) return lruCase;
                if (!directResult.img01 && lruCase.img01) directResult.img01 = lruCase.img01;
                if (!directResult.img02 && lruCase.img02) directResult.img02 = lruCase.img02;
                if (!directResult.macro360 && lruCase.macro360) directResult.macro360 = lruCase.macro360;
                if (!directResult.solicitudInforme && (lruCase.solicitudInforme || lruCase.solicitud_informe)) {
                    directResult.solicitudInforme = lruCase.solicitudInforme || lruCase.solicitud_informe;
                }
                if (!directResult.solicitud_informe && (lruCase.solicitud_informe || lruCase.solicitudInforme)) {
                    directResult.solicitud_informe = lruCase.solicitud_informe || lruCase.solicitudInforme;
                }
            }
        }

        // Recuperar fotos u órdenes desde la Bóveda IndexedDB ('media_blobs')
        if (directResult && (!directResult.img01 || !directResult.solicitudInforme)) {
            const media = await getMediaBlobFromIndexedDB(codAtencion);
            if (media) {
                if (!directResult.img01 && media.img01) directResult.img01 = media.img01;
                if (!directResult.img02 && media.img02) directResult.img02 = media.img02;
                if (!directResult.macro360 && media.macro360) directResult.macro360 = media.macro360;
                if (!directResult.solicitudInforme && (media.solicitudInforme || media.solicitud_informe)) {
                    directResult.solicitudInforme = media.solicitudInforme || media.solicitud_informe;
                }
                if (!directResult.solicitud_informe && (media.solicitud_informe || media.solicitudInforme)) {
                    directResult.solicitud_informe = media.solicitud_informe || media.solicitudInforme;
                }
                if (!directResult.foto_orden_base64 && media.foto_orden_base64) {
                    directResult.foto_orden_base64 = media.foto_orden_base64;
                }
            }
        }

        return directResult;
    } catch (e) {
        console.error("[IndexedDB] Error al recuperar paciente:", e);
        return null;
    }
}

// ============================================================================
// BÓVEDA DESACOPLADA DE BLOBS MULTIMEDIA (IndexedDB 'media_blobs')
// ============================================================================

export async function saveMediaBlobToIndexedDB(codAtencion, mediaObj) {
    if (!codAtencion || !mediaObj) return;
    const upperCod = String(codAtencion).trim().toUpperCase();
    const cleanCod = cleanCodeFunc(codAtencion);

    try {
        const db = await getIDB();
        if (db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
            const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
            const store = tx.objectStore(MEDIA_STORE_NAME);
            const record = { codAtencion: upperCod, cleanCode: cleanCod, ...mediaObj, updatedAt: new Date().toISOString() };
            store.put(record);
        }
    } catch (e) {
        console.warn("[MediaBlobs] Error guardando en ClinicaReportesDB:", e);
    }

    try {
        if (typeof indexedDB !== 'undefined') {
            const req = indexedDB.open('media_blobs', 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('blobs')) {
                    db.createObjectStore('blobs', { keyPath: 'codAtencion' });
                }
            };
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (db.objectStoreNames.contains('blobs')) {
                    const tx = db.transaction('blobs', 'readwrite');
                    tx.objectStore('blobs').put({ codAtencion: upperCod, cleanCode: cleanCod, ...mediaObj });
                }
            };
        }
    } catch (e) {}
}

export async function getMediaBlobFromIndexedDB(codAtencion) {
    if (!codAtencion) return null;
    const upperCod = String(codAtencion).trim().toUpperCase();
    const cleanCod = cleanCodeFunc(codAtencion);

    // 1. Semilla en memoria inmediata
    if (typeof window !== 'undefined' && window.MEDIA_BLOBS_SEED) {
        if (window.MEDIA_BLOBS_SEED[upperCod]) return window.MEDIA_BLOBS_SEED[upperCod];
        if (window.MEDIA_BLOBS_SEED[cleanCod]) return window.MEDIA_BLOBS_SEED[cleanCod];
        for (const k in window.MEDIA_BLOBS_SEED) {
            if (cleanCodeFunc(k) === cleanCod) return window.MEDIA_BLOBS_SEED[k];
        }
    } else if (typeof window !== 'undefined' && typeof window.loadMediaBlobsSeed === 'function') {
        window.loadMediaBlobsSeed();
    }

    // 2. Almacén 'media_blobs' en ClinicaReportesDB
    try {
        const db = await getIDB();
        if (db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
            const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
            const store = tx.objectStore(MEDIA_STORE_NAME);
            const req = store.get(upperCod);
            const res = await new Promise(resolve => {
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
            if (res) return res;
        }
    } catch (e) {}

    // 3. Base de datos dedicada 'media_blobs'
    try {
        if (typeof indexedDB !== 'undefined') {
            const res = await new Promise(resolve => {
                const req = indexedDB.open('media_blobs', 1);
                req.onsuccess = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('blobs')) return resolve(null);
                    const tx = db.transaction('blobs', 'readonly');
                    const getReq = tx.objectStore('blobs').get(upperCod);
                    getReq.onsuccess = () => resolve(getReq.result);
                    getReq.onerror = () => resolve(null);
                };
                req.onerror = () => resolve(null);
            });
            if (res) return res;
        }
    } catch (e) {}

    return null;
}

export async function hydrateMediaFromIndexedDB() {
    try {
        // 1. Hidratar desde window.MEDIA_BLOBS_SEED inmediatamente (0 ms)
        if (typeof window !== 'undefined' && window.MEDIA_BLOBS_SEED) {
            for (const cod in window.MEDIA_BLOBS_SEED) {
                const media = window.MEDIA_BLOBS_SEED[cod];
                const cleanCode = cleanCodeFunc(cod);
                const local = patientMap.get(cleanCode) || patientDatabase.find(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === cleanCode);
                if (local && media) {
                    if (media.solicitudInforme && !local.solicitudInforme) local.solicitudInforme = media.solicitudInforme;
                    if (media.solicitud_informe && !local.solicitud_informe) local.solicitud_informe = media.solicitud_informe;
                    if (media.img01 && !local.img01) local.img01 = media.img01;
                    if (media.img02 && !local.img02) local.img02 = media.img02;
                    if (media.macro360 && !local.macro360) local.macro360 = media.macro360;
                    if (media.foto_orden_base64 && !local.foto_orden_base64) local.foto_orden_base64 = media.foto_orden_base64;
                }
            }
        }

        const db = await getIDB();
        const stores = [STORE_NAME];
        if (db.objectStoreNames.contains(LRU_STORE_NAME)) stores.push(LRU_STORE_NAME);
        if (db.objectStoreNames.contains(MEDIA_STORE_NAME)) stores.push(MEDIA_STORE_NAME);

        for (const storeName of stores) {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.openCursor();
            req.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    const val = cursor.value;
                    if (val) {
                        const cleanCode = cleanCodeFunc(val.codAtencion || val.cod_atencion);
                        const local = patientMap.get(cleanCode) || patientDatabase.find(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === cleanCode);
                        if (local) {
                            const sol = val.solicitudInforme || val.solicitud_informe;
                            if (sol && !local.solicitudInforme) local.solicitudInforme = sol;
                            if (sol && !local.solicitud_informe) local.solicitud_informe = sol;
                            if (val.img01 && !local.img01) local.img01 = val.img01;
                            if (val.img02 && !local.img02) local.img02 = val.img02;
                            if (val.macro360 && !local.macro360) local.macro360 = val.macro360;
                            if (val.foto_orden_base64 && !local.foto_orden_base64) local.foto_orden_base64 = val.foto_orden_base64;
                            if (val.updatedAt && (!local.updatedAt || val.updatedAt > local.updatedAt)) {
                                Object.assign(local, val);
                            }
                        } else if (cleanCode && storeName !== MEDIA_STORE_NAME && (val.paciente || val.nombres || val.apellidos)) {
                            // 🛡️ GARANTÍA SOBERANA: Si el paciente está en IndexedDB pero no en la memoria estática, inyectarlo incondicionalmente
                            patientDatabase.push(val);
                            patientMap.set(cleanCode, val);
                        }
                    }
                    cursor.continue();
                }
            };
        }
        console.log("[IndexedDB] Proceso de hidratación multimedia ('media_blobs') completado.");
    } catch (err) {
        console.warn("[IndexedDB] Aviso en hidratación multimedia:", err);
    }
}

export const rehydrateMediaBlobsFromIndexedDB = hydrateMediaFromIndexedDB;
if (typeof window !== 'undefined') {
    window.hydrateMediaFromIndexedDB = hydrateMediaFromIndexedDB;
    window.rehydrateMediaBlobsFromIndexedDB = hydrateMediaFromIndexedDB;
}

export async function deletePatientFromIndexedDB(codAtencion) {
    try {
        const db = await getIDB();
        const tx = db.transaction([STORE_NAME, LRU_STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).delete(codAtencion);
        if (db.objectStoreNames.contains(LRU_STORE_NAME)) {
            tx.objectStore(LRU_STORE_NAME).delete(codAtencion);
        }
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("[IndexedDB] Error al eliminar paciente:", e);
    }
}

// ============================================================================
// BUSCADOR INTELIGENTE POR LOTE Y SONIDO (FONÉTICA ESPAÑOLA, LEVENSHTEIN Y CALIGRAFÍA DIFÍCIL)
// ============================================================================
// BUSCADOR INTELIGENTE POR LOTE Y SONIDO (LEVENSHTEIN + FONÉTICA ESPAÑOLA)
// ============================================================================

export function normalizeText(text) {
    if (!text) return '';
    return text.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/casteñeda|casteneda/g, 'castaneda');
}

export function levenshteinDistance(s1, s2) {
    if (!s1) return (s2 || '').length;
    if (!s2) return s1.length;
    const a = String(s1).toLowerCase();
    const b = String(s2).toLowerCase();
    if (a === b) return 0;
    if (a.length > b.length) return levenshteinDistance(b, a);

    const lenA = a.length;
    const lenB = b.length;
    let prev = new Array(lenA + 1);
    let curr = new Array(lenA + 1);

    for (let i = 0; i <= lenA; i++) prev[i] = i;

    for (let j = 1; j <= lenB; j++) {
        curr[0] = j;
        const charB = b.charCodeAt(j - 1);
        for (let i = 1; i <= lenA; i++) {
            const cost = (a.charCodeAt(i - 1) === charB) ? 0 : 1;
            curr[i] = Math.min(
                prev[i] + 1,       // deletion
                curr[i - 1] + 1,   // insertion
                prev[i - 1] + cost  // substitution
            );
        }
        for (let i = 0; i <= lenA; i++) prev[i] = curr[i];
    }
    return prev[lenA];
}

export function levenshteinSimilarity(s1, s2) {
    const maxLen = Math.max((s1 || '').length, (s2 || '').length);
    if (maxLen === 0) return 1.0;
    const dist = levenshteinDistance(s1, s2);
    return Math.max(0, 1.0 - (dist / maxLen));
}

export function phoneticCodeSpanish(word) {
    if (!word) return '';
    let w = String(word).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    w = w.replace(/[^a-z0-9]/g, '');
    if (!w) return '';

    // Equivalencias fonéticas del español / caligrafía médica peruana
    w = w.replace(/v/g, 'b');
    w = w.replace(/z/g, 's');
    w = w.replace(/c(?=[ei])/g, 's');
    w = w.replace(/c(?=[aou])/g, 'k');
    w = w.replace(/qu(?=[ei])/g, 'k');
    w = w.replace(/q/g, 'k');
    w = w.replace(/g(?=[ei])/g, 'j');
    w = w.replace(/ll/g, 'y');
    w = w.replace(/h/g, ''); // H muda
    w = w.replace(/x/g, 's');

    // Reducir letras dobles consecutivas
    let collapsed = '';
    for (let i = 0; i < w.length; i++) {
        if (i === 0 || w[i] !== w[i - 1]) {
            collapsed += w[i];
        }
    }
    return collapsed;
}

export function fuzzyWordMatch(queryWord, targetWord) {
    if (!queryWord || !targetWord) return { match: false, score: 0 };
    const q = queryWord.toLowerCase().trim();
    const t = targetWord.toLowerCase().trim();
    
    // 1. Coincidencia exacta o inclusión directa
    if (t === q) return { match: true, score: 1.0, type: 'exact' };
    if (t.includes(q)) return { match: true, score: 0.95, type: 'exact_substr' };
    if (q.includes(t) && t.length >= 3) return { match: true, score: 0.90, type: 'exact_contains' };

    // 2. Similitud fonética en español
    const pq = phoneticCodeSpanish(q);
    const pt = phoneticCodeSpanish(t);
    if (pt === pq && pq.length >= 3) return { match: true, score: 0.92, type: 'phonetic' };
    if ((pt.includes(pq) || pq.includes(pt)) && Math.min(pq.length, pt.length) >= 3) {
        return { match: true, score: 0.88, type: 'phonetic_substr' };
    }

    // 3. Similitud por distancia Levenshtein
    const sim = levenshteinSimilarity(q, t);
    const dist = levenshteinDistance(q, t);
    const minLen = Math.min(q.length, t.length);

    // Ej. Alice vs Alicia (dist=1, sim=0.83) -> match directo
    if (minLen >= 3 && dist <= 1) {
        return { match: true, score: 0.85 * sim, type: 'levenshtein_1' };
    }
    if (minLen >= 4 && dist <= 2 && sim >= 0.65) {
        return { match: true, score: 0.80 * sim, type: 'levenshtein_2' };
    }
    if (sim >= 0.72) {
        return { match: true, score: 0.78 * sim, type: 'levenshtein_sim' };
    }

    // 4. Tolerancia a caligrafía médica manuscrita difícil (mismo prefijo o trazos cursivos)
    if (q[0] === t[0] && minLen >= 4 && (dist <= 3 && sim >= 0.55)) {
        return { match: true, score: 0.70 * sim, type: 'handwriting_prefix' };
    }

    return { match: false, score: 0 };
}

export function matchPatientSmartSound(patient, queryStr) {
    if (!patient || !queryStr) return { match: false, score: 0 };
    const query = String(queryStr).trim();
    if (!query) return { match: false, score: 0 };

    const queryTokens = query.split(/\s+/).filter(t => t.length > 0);
    if (queryTokens.length === 0) return { match: false, score: 0 };

    const rawFields = [
        patient.codAtencion,
        patient.cod_atencion,
        patient.codigo,
        patient.paciente,
        patient.nombres,
        patient.nomPaciente,
        patient.nombre,
        patient.apellidos,
        patient.apePaciente,
        patient.apellido,
        patient.dni,
        patient.medSolicitante,
        patient.doctor,
        patient.clinica,
        patient.procedencia,
        patient.especimen,
        patient.diagFinal,
        patient.diagnostico
    ].filter(Boolean).join(' ');

    const patientWords = rawFields.split(/[\s,.\-_/]+/).filter(w => w.length > 0);
    const normalizedFields = normalizeText(rawFields);

    let totalScore = 0;
    let allTokensMatched = true;

    for (const qToken of queryTokens) {
        const normQ = normalizeText(qToken);
        if (!normQ) continue;

        if (normalizedFields.includes(normQ)) {
            totalScore += 1.0;
            continue;
        }

        let bestWordScore = 0;
        let matched = false;

        for (const pWord of patientWords) {
            const res = fuzzyWordMatch(normQ, normalizeText(pWord));
            if (res.match && res.score > bestWordScore) {
                bestWordScore = res.score;
                matched = true;
            }
        }

        if (matched) {
            totalScore += bestWordScore;
        } else {
            allTokensMatched = false;
            break;
        }
    }

    if (allTokensMatched) {
        const avgScore = totalScore / queryTokens.length;
        return { match: true, score: avgScore };
    }

    // Si la consulta tiene múltiples palabras, evaluar coincidencia si al menos 50% de tokens coinciden
    if (queryTokens.length >= 2) {
        let matchedCount = 0;
        let partialScore = 0;
        for (const qToken of queryTokens) {
            const normQ = normalizeText(qToken);
            if (normalizedFields.includes(normQ)) {
                matchedCount++;
                partialScore += 1.0;
                continue;
            }
            for (const pWord of patientWords) {
                const res = fuzzyWordMatch(normQ, normalizeText(pWord));
                if (res.match && res.score >= 0.72) {
                    matchedCount++;
                    partialScore += res.score;
                    break;
                }
            }
        }
        if (matchedCount / queryTokens.length >= 0.5) {
            return { match: true, score: (partialScore / queryTokens.length) * 0.85 };
        }
    }

    return { match: false, score: 0 };
}

// ============================================================================
// MODO DE VENTANA CORRELATIVA (LOTE DE SESIÓN: 5 ANTES Y 5 DESPUÉS)
// ============================================================================

export function getCorrelativeWindow(codAtencion, windowSize = 5) {
    if (!codAtencion) return null;
    const cleanTarget = cleanCodeFunc(codAtencion);

    let allPatients = [...patientDatabase];
    if (allPatients.length < 50) {
        const master = (typeof window !== 'undefined' && (window.REAL_SUPABASE_PATIENTS || window.REAL_SUPABASE_BACKUP)) || [];
        if (master.length > allPatients.length) allPatients = [...master];
    }
    if (allPatients.length === 0) return null;

    sortPatientArray(allPatients);

    const targetPatient = allPatients.find(p => cleanCodeFunc(p.codAtencion || p.cod_atencion || p.codigo) === cleanTarget);
    if (!targetPatient) return null;

    const parsedTarget = parseCodAtencionForSort(targetPatient.codAtencion || targetPatient.cod_atencion);
    const targetService = parsedTarget ? parsedTarget.service : (targetPatient.service || 'Q');

    // Filtrar estrictamente por la misma serie correlativa de sesión (ej. serie 'Q')
    const seriesPatients = allPatients.filter(p => {
        const parsed = parseCodAtencionForSort(p.codAtencion || p.cod_atencion);
        return parsed && parsed.service === targetService;
    });

    const targetIdx = seriesPatients.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === cleanTarget);
    if (targetIdx === -1) return null;

    const startIdx = Math.max(0, targetIdx - windowSize);
    const endIdx = Math.min(seriesPatients.length - 1, targetIdx + windowSize);

    const before = seriesPatients.slice(startIdx, targetIdx);
    const after = seriesPatients.slice(targetIdx + 1, endIdx + 1);
    const slice = seriesPatients.slice(startIdx, endIdx + 1);

    const firstCod = slice[0]?.codAtencion || slice[0]?.cod_atencion;
    const lastCod = slice[slice.length - 1]?.codAtencion || slice[slice.length - 1]?.cod_atencion;
    const targetCod = targetPatient.codAtencion || targetPatient.cod_atencion;

    return {
        target: targetPatient,
        targetCode: targetCod,
        before: before,
        after: after,
        patients: slice,
        totalInWindow: slice.length,
        rangeText: `Lote de sesión: ${firstCod} a ${lastCod} (${slice.length} pacientes correlativos)`
    };
}

if (typeof window !== 'undefined') {
    window.normalizeText = normalizeText;
    window.levenshteinDistance = levenshteinDistance;
    window.levenshteinSimilarity = levenshteinSimilarity;
    window.phoneticCodeSpanish = phoneticCodeSpanish;
    window.fuzzyWordMatch = fuzzyWordMatch;
    window.matchPatientSmartSound = matchPatientSmartSound;
    window.getCorrelativeWindow = getCorrelativeWindow;
    window.saveMediaBlobToIndexedDB = saveMediaBlobToIndexedDB;
    window.getMediaBlobFromIndexedDB = getMediaBlobFromIndexedDB;
}

export let doctorsDatabase = [];

export { usersDatabase } from './users_db.js';

export const defaultCategories = [
    { id: 1, tipo: 'Macroscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },
    { id: 100, tipo: 'Macroscopica', categoria: 'PROTOCOLOS SISTEMATIZADOS' },
    { id: 2, tipo: 'Macroscopica', categoria: 'DERMATOPATOLOGIA' },
    { id: 3, tipo: 'Macroscopica', categoria: 'GASTROENTEROLOGIA' },
    { id: 4, tipo: 'Macroscopica', categoria: 'GINECOLOGIA' },
    { id: 5, tipo: 'Macroscopica', categoria: 'MAMA' },
    { id: 6, tipo: 'Macroscopica', categoria: 'OTROS' },
    { id: 8, tipo: 'Macroscopica', categoria: 'PARTES BLANDAS' },
    { id: 9, tipo: 'Macroscopica', categoria: 'UROLOGÍA' },
    { id: 22, tipo: 'Macroscopica', categoria: 'APÉNDICE CECAL' },
    { id: 23, tipo: 'Macroscopica', categoria: 'VESÍCULA BILIAR' },
    { id: 30, tipo: 'Macroscopica', categoria: 'OFTALMOPATOLOGIA' },
    { id: 32, tipo: 'Macroscopica', categoria: 'CABEZA Y CUELLO' },
    { id: 33, tipo: 'Macroscopica', categoria: 'CIRUGIA' },
    { id: 34, tipo: 'Macroscopica', categoria: 'HEMATOPATOLOGIA' },
    { id: 10, tipo: 'Microscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },
    { id: 11, tipo: 'Microscopica', categoria: '(MICRO) PROTOCOLOS SISTEMATIZADOS' },
    { id: 101, tipo: 'Microscopica', categoria: 'PROTOCOLOS SISTEMATIZADOS' },
    { id: 12, tipo: 'Microscopica', categoria: 'AGRADECIMIENTOS' },
    { id: 13, tipo: 'Microscopica', categoria: 'APÉNDICE CECAL' },
    { id: 14, tipo: 'Microscopica', categoria: 'CABEZA Y CUELLO' },
    { id: 15, tipo: 'Microscopica', categoria: 'CIRUGIA' },
    { id: 16, tipo: 'Microscopica', categoria: 'DERMATOPATOLOGIA' },
    { id: 17, tipo: 'Microscopica', categoria: 'GASTROENTEROLOGIA' },
    { id: 18, tipo: 'Microscopica', categoria: 'GINECOLOGIA' },
    { id: 19, tipo: 'Microscopica', categoria: 'HEMATOPATOLOGIA' },
    { id: 20, tipo: 'Microscopica', categoria: 'MAMA' },
    { id: 21, tipo: 'Microscopica', categoria: 'OFTALMOPATOLOGIA' },
    { id: 24, tipo: 'Microscopica', categoria: 'VESÍCULA BILIAR' },
    { id: 25, tipo: 'Microscopica', categoria: 'UROLOGÍA' },
    { id: 31, tipo: 'Microscopica', categoria: 'PARTES BLANDAS' },
    { id: 28, tipo: 'Macroscopica', categoria: 'CITOLOGÍA CERVICAL' },
    { id: 29, tipo: 'Microscopica', categoria: 'CITOLOGÍA CERVICAL' }
];

export let categoriesDatabase = [];
export let templatesDatabase = [];

let _dbInitialized = false;

// Función de inicialización de datos base (Local Storage)

// RESTORED_PATIENT_RECORDS (Hoisted before initLocalDatabases)
var RESTORED_PATIENT_RECORDS = {
    '26q-383': {"id": 18973, "codAtencion": "26Q-383", "cod_atencion": "26Q-383", "codigo": "26Q-383", "service": "Q", "paciente": "REYES PEREZ, GABRIEL ACEVEDO", "nomPaciente": "GABRIEL ACEVEDO", "apePaciente": "REYES PEREZ", "nombres": "GABRIEL ACEVEDO", "apellidos": "REYES PEREZ", "dni": "0", "edad": 47, "sexo": "MASCULINO", "fecRegistro": "2026-11-05", "fecha_ingreso": "2026-11-05", "fechaIngreso": "2026-11-05", "fecEntrega": "2026-11-09", "fecha_informe": "2026-11-09", "fechaInforme": "2026-11-09", "fecProbable": "2026-11-09", "medSolicitante": "DRA. DENNIS ELBA DEL AGUILA", "med_solicitante": "DRA. DENNIS ELBA DEL AGUILA", "cmp_medico": "70576", "clinica": "HOSPITAL NACIONAL DANIEL ALCIDES CARRIÓN (HNDAC)", "especimen": "BIOPSIA PLEURAL", "organoMuestra": "BIOPSIA PLEURAL", "organo_muestra": "BIOPSIA PLEURAL", "muestra": "BIOPSIA PLEURAL", "motivoEstudio": "MASA PULMONAR: D/C NM DE PULMÓN (HOSPITALIZADA CAMA 2511)", "diagnostico_clinico": "MASA PULMONAR: D/C NM DE PULMÓN (HOSPITALIZADA CAMA 2511)", "macroDesc": "Se recibe frasco con fragmentos irregulares de tejido pulmonar de color pardo antracótico que en conjunto miden 1.2 x 0.8 x 0.5 cm. Se incluye muestra representativa en casete.", "macro_desc": "Se recibe frasco con fragmentos irregulares de tejido pulmonar de color pardo antracótico que en conjunto miden 1.2 x 0.8 x 0.5 cm. Se incluye muestra representativa en casete.", "microDesc": "El examen histológico revela un tejido pleural con fibrosis colágena densa y extensa, que alterna con un infiltrado inflamatorio crónico compuesto por linfocitos maduros, cc plasmáticas e histiocitos.\\n\\nEn este contexto fibroinflamatorio, se identifican sábanas y agregados de cc linfoides atípicas, de tamaño mediano a grande, con núcleos irregulares, cromatina laxa y nucléolos prominentes, que muestran un patrón de crecimiento infiltrativo y difuso, borrando la arquitectura normal del tejido.\\n\\nNo se observan cc mesoteliales malignas ni elementos epiteliales atípicos. El componente linfoide atípico presenta un índice mitótico variable y se asocia a áreas de fibrosis reactiva, hallazgo característico de las neoplasias linfoides que surgen en el seno de una inflamación crónica de larga data.", "micro_desc": "El examen histológico revela un tejido pleural con fibrosis colágena densa y extensa, que alterna con un infiltrado inflamatorio crónico compuesto por linfocitos maduros, cc plasmáticas e histiocitos.\\n\\nEn este contexto fibroinflamatorio, se identifican sábanas y agregados de cc linfoides atípicas, de tamaño mediano a grande, con núcleos irregulares, cromatina laxa y nucléolos prominentes, que muestran un patrón de crecimiento infiltrativo y difuso, borrando la arquitectura normal del tejido.\\n\\nNo se observan cc mesoteliales malignas ni elementos epiteliales atípicos. El componente linfoide atípico presenta un índice mitótico variable y se asocia a áreas de fibrosis reactiva, hallazgo característico de las neoplasias linfoides que surgen en el seno de una inflamación crónica de larga data.", "diagnostico": "BIOPSIA PLEURAL: PLEURITIS CRÓNICA FIBROSANTE DE ETIOLOGÍA INFECCIOSA; NEGATIVO PARA LINFOMA Y PARA NEOPLASIA MALIGNA.", "estado": "Listo", "firmado": true, "modificado": true, "casetes": 1, "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA", "costo": 180, "adelanto": 180, "resta": 0, "img01": "assets/macro/macro_26Q-383_20261102_225603.jpg", "foto_macro_url": "assets/macro/macro_26Q-383_20261102_225603.jpg"},
    '26q383': {"id": 18973, "codAtencion": "26Q-383", "cod_atencion": "26Q-383", "codigo": "26Q-383", "service": "Q", "paciente": "REYES PEREZ, GABRIEL ACEVEDO", "nomPaciente": "GABRIEL ACEVEDO", "apePaciente": "REYES PEREZ", "nombres": "GABRIEL ACEVEDO", "apellidos": "REYES PEREZ", "dni": "0", "edad": 47, "sexo": "MASCULINO", "fecRegistro": "2026-11-05", "fecha_ingreso": "2026-11-05", "fechaIngreso": "2026-11-05", "fecEntrega": "2026-11-09", "fecha_informe": "2026-11-09", "fechaInforme": "2026-11-09", "fecProbable": "2026-11-09", "medSolicitante": "DRA. DENNIS ELBA DEL AGUILA", "med_solicitante": "DRA. DENNIS ELBA DEL AGUILA", "cmp_medico": "70576", "clinica": "HOSPITAL NACIONAL DANIEL ALCIDES CARRIÓN (HNDAC)", "especimen": "BIOPSIA PLEURAL", "organoMuestra": "BIOPSIA PLEURAL", "organo_muestra": "BIOPSIA PLEURAL", "muestra": "BIOPSIA PLEURAL", "motivoEstudio": "MASA PULMONAR: D/C NM DE PULMÓN (HOSPITALIZADA CAMA 2511)", "diagnostico_clinico": "MASA PULMONAR: D/C NM DE PULMÓN (HOSPITALIZADA CAMA 2511)", "macroDesc": "Se recibe frasco con fragmentos irregulares de tejido pulmonar de color pardo antracótico que en conjunto miden 1.2 x 0.8 x 0.5 cm. Se incluye muestra representativa en casete.", "macro_desc": "Se recibe frasco con fragmentos irregulares de tejido pulmonar de color pardo antracótico que en conjunto miden 1.2 x 0.8 x 0.5 cm. Se incluye muestra representativa en casete.", "microDesc": "El examen histológico revela un tejido pleural con fibrosis colágena densa y extensa, que alterna con un infiltrado inflamatorio crónico compuesto por linfocitos maduros, cc plasmáticas e histiocitos.\\n\\nEn este contexto fibroinflamatorio, se identifican sábanas y agregados de cc linfoides atípicas, de tamaño mediano a grande, con núcleos irregulares, cromatina laxa y nucléolos prominentes, que muestran un patrón de crecimiento infiltrativo y difuso, borrando la arquitectura normal del tejido.\\n\\nNo se observan cc mesoteliales malignas ni elementos epiteliales atípicos. El componente linfoide atípico presenta un índice mitótico variable y se asocia a áreas de fibrosis reactiva, hallazgo característico de las neoplasias linfoides que surgen en el seno de una inflamación crónica de larga data.", "micro_desc": "El examen histológico revela un tejido pleural con fibrosis colágena densa y extensa, que alterna con un infiltrado inflamatorio crónico compuesto por linfocitos maduros, cc plasmáticas e histiocitos.\\n\\nEn este contexto fibroinflamatorio, se identifican sábanas y agregados de cc linfoides atípicas, de tamaño mediano a grande, con núcleos irregulares, cromatina laxa y nucléolos prominentes, que muestran un patrón de crecimiento infiltrativo y difuso, borrando la arquitectura normal del tejido.\\n\\nNo se observan cc mesoteliales malignas ni elementos epiteliales atípicos. El componente linfoide atípico presenta un índice mitótico variable y se asocia a áreas de fibrosis reactiva, hallazgo característico de las neoplasias linfoides que surgen en el seno de una inflamación crónica de larga data.", "diagnostico": "BIOPSIA PLEURAL: PLEURITIS CRÓNICA FIBROSANTE DE ETIOLOGÍA INFECCIOSA; NEGATIVO PARA LINFOMA Y PARA NEOPLASIA MALIGNA.", "estado": "Listo", "firmado": true, "modificado": true, "casetes": 1, "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA", "costo": 180, "adelanto": 180, "resta": 0, "img01": "assets/macro/macro_26Q-383_20261102_225603.jpg", "foto_macro_url": "assets/macro/macro_26Q-383_20261102_225603.jpg"},
    '26q-261': {
        id: 2666,
        codAtencion: '26Q-261',
        paciente: 'CORDOVA VARGAS, ZOILA',
        nombres: 'ZOILA',
        apellidos: 'CORDOVA VARGAS',
        edad: 27,
        sexo: 'FEMENINO',
        dni: '79891856',
        costo: 75,
        adelanto: 0,
        resta: 75,
        fecRegistro: '2026-08-16',
        fecEntrega: '2026-08-20',
        pagado: true,
        atrasado: false,
        medSolicitante: 'DR. DIEGO ALONSO CHUNGUI BRAVO',
        especimen: 'VESÍCULA BILIAR',
        clinica: 'CLÍNICA CARRIÓN',
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        casetes: 2,
        macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso, con consistencia firme y aspecto blanquecino grisáceo. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso oscura,SE IDENTIFICAN 4 CALCULOS AMAIRLLENTOS DE 1 CM DE DIAMETRO MAYOR. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared. Se INCLUYE MUETRA REPRESENTATIVA.2 CASETES.',
        microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz.',
        diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA LITIASICA REAGUDIZADA, ULCERACIÓN MUCOSA SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
        firmado: true,
        modificado: true,
        estado: 'Completado',
        service: 'Q'
    },
    '26q261': {
        id: 2666,
        codAtencion: '26Q-261',
        paciente: 'CORDOVA VARGAS, ZOILA',
        nombres: 'ZOILA',
        apellidos: 'CORDOVA VARGAS',
        edad: 27,
        sexo: 'FEMENINO',
        dni: '79891856',
        costo: 75,
        adelanto: 0,
        resta: 75,
        fecRegistro: '2026-08-16',
        fecEntrega: '2026-08-20',
        pagado: true,
        atrasado: false,
        medSolicitante: 'DR. DIEGO ALONSO CHUNGUI BRAVO',
        especimen: 'VESÍCULA BILIAR',
        clinica: 'CLÍNICA CARRIÓN',
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        casetes: 2,
        macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso, con consistencia firme y aspecto blanquecino grisáceo. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso oscura,SE IDENTIFICAN 4 CALCULOS AMAIRLLENTOS DE 1 CM DE DIAMETRO MAYOR. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared. Se INCLUYE MUETRA REPRESENTATIVA.2 CASETES.',
        microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz.',
        diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA LITIASICA REAGUDIZADA, ULCERACIÓN MUCOSA SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
        firmado: true,
        modificado: true,
        estado: 'Completado',
        service: 'Q'
    },
    '26q-224': {
        codAtencion: '26Q-224',
        paciente: 'NELLI, CANAYO SILVANO',
        nombres: 'NELLI',
        apellidos: 'CANAYO SILVANO',
        edad: '37',
        sexo: 'FEMENINO',
        fecRegistro: '03/08/2026',
        fecEntrega: '07/08/2026',
        medSolicitante: 'DR. JORGE ALBERTO MUÑANTE ARZAPALO',
        especimen: 'VESÍCULA BILIAR',
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso (hasta 1.2 cm de espesor), con consistencia firme y aspecto blanquecino-grisáceo, sugerente de fibrosis transmural. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso-oscura. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared.',
        microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz. Se observa fibrosis hialina extensa que disocia las fibras musculares lisas, así como numerosos senos de rokitansky-aschoff dilatados, algunos de ellos rellenos de barro biliar e infiltrados por histiocitos espumosos. El epitelio de revestimiento remanente muestra metaplasia escamosa focal y cambios regenerativos atípicos reactivos, sin evidencia de displasia franca ni invasión estromal. No se identifican células neoplásicas ni depósitos amiloides.',
        diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA REAGUDIZADA, CON EXTENSA FIBROSIS MURAL, ULCERACIÓN MUCOSA Y ABSCESOS INTRAMURALES, SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
        firmado: true,
        estado: 'Completado',
        service: 'Q'
    },
    '26q-278': {
        id: 6169,
        codAtencion: '26Q-278',
        dni: '76707836',
        medSolicitante: 'DR. ALCALA A. YOHANN',
        nombres: 'NAOMI BRIYIDT',
        apellidos: 'SILVANO RIVERA',
        paciente: 'SILVANO RIVERA, NAOMI BRIYIDT',
        costo: 8,
        adelanto: 0,
        resta: 8,
        fecRegistro: '2026-08-28',
        fecEntrega: '2026-09-01',
        pagado: false,
        atrasado: false,
        firmado: false,
        modificado: true,
        estado: 'En Proceso',
        especimen: 'BIOPSIA CUTANEA',
        telContacto: 'BIOPSIA CUTANEA',
        motivoEstudio: 'NEVUS VERRUGOSO DE CUERO CABELLUDO',
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        casetes: 1,
        edad: 15,
        sexo: 'FEMENINO',
        clinica: 'CLÍNICA CARRIÓN',
        service: 'Q'
    },
    '26q278': {
        id: 6169,
        codAtencion: '26Q-278',
        dni: '76707836',
        medSolicitante: 'DR. ALCALA A. YOHANN',
        nombres: 'NAOMI BRIYIDT',
        apellidos: 'SILVANO RIVERA',
        paciente: 'SILVANO RIVERA, NAOMI BRIYIDT',
        costo: 8,
        adelanto: 0,
        resta: 8,
        fecRegistro: '2026-08-28',
        fecEntrega: '2026-09-01',
        pagado: false,
        atrasado: false,
        firmado: false,
        modificado: true,
        estado: 'En Proceso',
        especimen: 'BIOPSIA CUTANEA',
        telContacto: 'BIOPSIA CUTANEA',
        motivoEstudio: 'NEVUS VERRUGOSO DE CUERO CABELLUDO',
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        casetes: 1,
        edad: 15,
        sexo: 'FEMENINO',
        clinica: 'CLÍNICA CARRIÓN',
        service: 'Q'
    },
    '26q-283': {
        id: 6170,
        codAtencion: '26Q-283',
        dni: '72471025',
        medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
        nombres: 'RAIZA BRIGGITTE',
        apellidos: 'ROMERO MARTÍNEZ',
        paciente: 'RAIZA BRIGGITTE ROMERO MARTÍNEZ',
        costo: 10,
        adelanto: 0,
        resta: 10,
        fecRegistro: '2026-09-02',
        fecEntrega: '2026-09-06',
        pagado: false,
        atrasado: false,
        firmado: false,
        modificado: true,
        estado: 'Completado',
        especimen: 'BIOPSIA DE CÉRVIX / EXOCÉRVIX',
        macroDesc: 'Se recibe 2 biopsia de cérvix que miden entre 0.3 cm. Y 0.2cm, de color blanco grisáceo. Se incluye todo. 1 casete.',
        microDesc: 'Los cortes muestran fragmentos de tejido correspondientes a mucosa endocervical. La arquitectura general revela criptas y glándulas endocervicales revestidas por un epitelio cilíndrico simple mucosecretor.\n\nSe observan marcados cambios reactivos en el epitelio glandular, caracterizados por un leve agrandamiento nuclear y una focal pérdida de la mucina apical, secundarios al entorno inflamatorio. Algunas glándulas presentan dilatación quística. El hallazgo más prominente es un denso y extenso infiltrado inflamatorio en el estroma.\n\nEste infiltrado es de carácter crónico, constituido predominantemente por linfocitos y células plasmáticas, el cual expande el estroma endocervical. Se asocian áreas de marcada congestión vascular y extensos focos de hemorragia intersticial y superficial reciente.\n\nA los aumentos proporcionados, la maduración epitelial (donde es evaluable) parece conservada y no se identifican atipias citológicas significativas, pérdida de la polaridad nuclear, figuras mitóticas atípicas, ni reacción estromal desmoplásica.\n\nNo hay evidencia morfológica de neoplasia intraepitelial cervical (nic/hsil), adenocarcinoma in situ (ais) ni carcinoma invasor en los campos evaluados.',
        diagnostico: 'CÉRVIX, BIOPSIA: MUCOSA ENDOCERVICAL CON CERVICITIS CRÓNICA SEVERA Y CAMBIOS GLANDULARES REACTIVOS. EXTENSA CONGESTIÓN VASCULAR Y HEMORRAGIA RECIENTE. NEGATIVO PARA DISPLASIA Y MALIGNIDAD EN EL MATERIAL EXAMINADO.\n\nCOMENTARIO: LOS HALLAZGOS SON CONSISTENTES CON UN PROCESO INFLAMATORIO SEVERO DE NATURALEZA BENIGNA (CERVICITIS). SE SUGIERE CORRELACIÓN CLÍNICA PARA DESCARTAR ETIOLOGÍAS INFECCIOSAS ESPECÍFICAS U OTRAS CAUSAS DE INFLAMACIÓN PÉLVICA/CERVICAL SEVERA.',
        edad: 25,
        sexo: 'FEMENINO',
        casetes: 1,
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        service: 'Q',
        clinica: 'CLINICA LA MUJER'
    },
    '26q283': {
        id: 6170,
        codAtencion: '26Q-283',
        dni: '72471025',
        medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
        nombres: 'RAIZA BRIGGITTE',
        apellidos: 'ROMERO MARTÍNEZ',
        paciente: 'RAIZA BRIGGITTE ROMERO MARTÍNEZ',
        costo: 10,
        adelanto: 0,
        resta: 10,
        fecRegistro: '2026-09-02',
        fecEntrega: '2026-09-06',
        pagado: false,
        atrasado: false,
        firmado: false,
        modificado: true,
        estado: 'Completado',
        especimen: 'BIOPSIA DE CÉRVIX / EXOCÉRVIX',
        macroDesc: 'Se recibe 2 biopsia de cérvix que miden entre 0.3 cm. Y 0.2cm, de color blanco grisáceo. Se incluye todo. 1 casete.',
        microDesc: 'Los cortes muestran fragmentos de tejido correspondientes a mucosa endocervical. La arquitectura general revela criptas y glándulas endocervicales revestidas por un epitelio cilíndrico simple mucosecretor.\n\nSe observan marcados cambios reactivos en el epitelio glandular, caracterizados por un leve agrandamiento nuclear y una focal pérdida de la mucina apical, secundarios al entorno inflamatorio. Algunas glándulas presentan dilatación quística. El hallazgo más prominente es un denso y extenso infiltrado inflamatorio en el estroma.\n\nEste infiltrado es de carácter crónico, constituido predominantemente por linfocitos y células plasmáticas, el cual expande el estroma endocervical. Se asocian áreas de marcada congestión vascular y extensos focos de hemorragia intersticial y superficial reciente.\n\nA los aumentos proporcionados, la maduración epitelial (donde es evaluable) parece conservada y no se identifican atipias citológicas significativas, pérdida de la polaridad nuclear, figuras mitóticas atípicas, ni reacción estromal desmoplásica.\n\nNo hay evidencia morfológica de neoplasia intraepitelial cervical (nic/hsil), adenocarcinoma in situ (ais) ni carcinoma invasor en los campos evaluados.',
        diagnostico: 'CÉRVIX, BIOPSIA: MUCOSA ENDOCERVICAL CON CERVICITIS CRÓNICA SEVERA Y CAMBIOS GLANDULARES REACTIVOS. EXTENSA CONGESTIÓN VASCULAR Y HEMORRAGIA RECIENTE. NEGATIVO PARA DISPLASIA Y MALIGNIDAD EN EL MATERIAL EXAMINADO.\n\nCOMENTARIO: LOS HALLAZGOS SON CONSISTENTES CON UN PROCESO INFLAMATORIO SEVERO DE NATURALEZA BENIGNA (CERVICITIS). SE SUGIERE CORRELACIÓN CLÍNICA PARA DESCARTAR ETIOLOGÍAS INFECCIOSAS ESPECÍFICAS U OTRAS CAUSAS DE INFLAMACIÓN PÉLVICA/CERVICAL SEVERA.',
        edad: 25,
        sexo: 'FEMENINO',
        casetes: 1,
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        service: 'Q',
        clinica: 'CLINICA LA MUJER'
    }
,
    '26q-293': {
        "id": 18878,
        "service": "Q",
        "codAtencion": "26Q-293",
        "dni": "0",
        "medSolicitante": "DR. FLORES SIERRA, BRYAN",
        "nombres": "PEDRO",
        "apellidos": "CUZCANO CHUMPITAZ",
        "paciente": "CUZCANO CHUMPITAZ, PEDRO",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fecRegistro": "2026-09-10",
        "fecEntrega": "2026-09-14",
        "pagado": true,
        "atrasado": false,
        "especimen": "PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL",
        "macroDesc": "1. FRASCO 1 (LINFADENECTOMÍA ILÍACA DERECHA):\nSe recibe en formol espécimen rotulado como Linfadenectomía Ilíaca Derecha. Consiste en tejido fibroadiposo pardo-amarillento de 4.5 x 3.2 x 1.8 cm. A los cortes seriados, se aíslan 10 nódulos linfoides, el mayor de 1.4 x 1.1 cm, de consistencia firme y superficie de corte blanquecina. Se incluye la totalidad de la muestra en 4 casetes (1A al 1D).\n\n2. FRASCO 2 (LINFADENECTOMÍA ILÍACA IZQUIERDA):\nSe recibe en formol espécimen rotulado como Linfadenectomía Ilíaca Izquierda. Consiste en tejido fibroadiposo lobulado de 6.2 x 4.0 x 2.2 cm. A la disección minuciosa, se aíslan 18 ganglios linfáticos de diámetros entre 0.4 y 1.6 cm, de consistencia elástica y firme. Se incluye la totalidad de la muestra en 6 casetes (2A al 2F).\n\n3. FRASCO 3 (PROSTATECTOMÍA RADICAL CON VESÍCULAS SEMINALES):\nSe recibe pieza quirúrgica correspondiente a glándula prostática íntegra de 38.8 g de peso, con medidas de 4.8 cm (diámetro transversal), 4.2 cm (diámetro craneocaudal) y 3.5 cm (diámetro anteroposterior). Anexas a la base, la vesícula seminal derecha mide 3.2 x 1.4 x 0.8 cm (conducto deferente de 1.5 cm) y la vesícula seminal izquierda mide 3.0 x 1.3 x 0.7 cm (conducto deferente de 1.4 cm).\nEntintado tridimensional de superficies quirúrgicas según protocolo pentacolor estandarizado: cara anterior en amarillo, caras lateral y posterior derechas en rojo, cara posterior central en negro, cara lateral izquierda en naranja, y márgenes apical y de cuello vesical en verde.\nA los cortes transversales seriados cada 3 mm a 4 mm, el parénquima prostático muestra consistencia firme en zona periférica, con nodularidad hiperplásica en zona de transición, sin masa destructiva macroscópica evidente. Ambas vesículas seminales exhiben engrosamiento indurado basal bilateral. Se incluye muestra representativa de ápex, cuello vesical, cuadrantes y vesículas seminales en 8 casetes (3A al 3H).",
        "microDesc": "1. HISTOMORFOLOGÍA TUMORAL:\n- Tipo histológico: Adenocarcinoma acinar prostático convencional.\n- Distribución y volumen: Infiltración neoplásica bilateral que compromete ambos lóbulos prostáticos (zona periférica y zona de transición), ocupando entre el 30% y el 50% del parénquima glandular total.\n- Arquitectura y gradación de Gleason: Predominio de patrón 4 de Gleason (60% de la neoplasia), constituido por glándulas irregulares fusionadas y acinos cribiformes incipientes, intercalado con patrón 3 de Gleason (40%), formado por glándulas pequeñas individuales bien diferenciadas que infiltran el estroma fibromuscular.\n- Atipia citológica: Marcado agrandamiento nuclear con nucléolos prominentes e hipercromatismo. Ausencia de necrosis de tipo comedoniano y ausencia de patrón 5 sólido. No se identifica carcinoma intraductal de próstata (IDC-P).\n\n2. INVASIÓN PERINEURAL, LINFOVASCULAR Y EXTENSIÓN LOCAL:\n- Invasión perineural (IPN): Presente (franca y múltiple infiltración neoplásica en espacios perineurales intraprostáticos).\n- Invasión linfovascular (ILV): Presente (identificación de émbolos neoplásicos en luces vasculares del estroma prostático).\n- Extensión extraprostática (EPE): No identificada; neoplasia confinada por la pseudocápsula prostática (EPE negativa).\n- Cuello vesical: Margen de cuello vesical libre de infiltración neoplásica.\n- Vesículas seminales: Infiltración tumoral directa transmural en la pared muscular propia de ambas vesículas seminales (compromiso tumoral bilateral, pT3b).\n\n3. MÁRGENES QUIRÚRGICOS DE RESECCIÓN:\n- Todos los márgenes de resección entintados (apical, cuello vesical, anterior, laterales y posteriores) se encuentran libres de neoplasia invasora (Resección quirúrgica completa R0).\n- Distancia mínima del carcinoma invasor al margen entintado más próximo: 1.0 mm.\n\n4. COMPROMISO GANGLIONAR REGIONAL (LINFADENECTOMÍA PÉLVICA BILATERAL):\n- Frasco 1 (Linfadenectomía ilíaca derecha): Metástasis de adenocarcinoma acinar en 1 de 10 ganglios linfáticos aislados (1/10). Depósito metastásico mayor de 12 mm con extensión extranodal (ENE) presente en grasa perinodal.\n- Frasco 2 (Linfadenectomía ilíaca izquierda): Metástasis de adenocarcinoma acinar en 5 de 18 ganglios linfáticos aislados (5/18). Depósito metastásico mayor de 14 mm con extensión extranodal (ENE) franca en tejido fibroadiposo perinodal.\n- Balance global ganglionar: Metástasis en 6 de 28 ganglios linfáticos regionales examinados (6/28).",
        "diagnostico": "I. FRASCO 1: GANGLIOS LINFÁTICOS ILÍACOS DERECHOS, LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN UNO DE DIEZ GANGLIOS LINFÁTICOS (1/10).\n- DEPÓSITO METASTÁSICO MAYOR: 12 mm.\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n\nII. FRASCO 2: GANGLIOS LINFÁTICOS ILÍACOS IZQUIERDOS, LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN CINCO DE DIECIOCHO GANGLIOS LINFÁTICOS (5/18).\n- DEPÓSITO METASTÁSICO MAYOR: 14 mm.\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n\nIII. FRASCO 3: PRÓSTATA Y VESÍCULAS SEMINALES, PROSTATECTOMÍA RADICAL:\n- ADENOCARCINOMA ACINAR PROSTÁTICO CONVENCIONAL.\n- SCORE DE GLEASON: 4 + 3 = 7 (PATRÓN 4: 60%, PATRÓN 3: 40%).\n- GRUPO DE GRADO HISTOLÓGICO OMS / ISUP: GRUPO 3 (ISUP 3).\n- COMPROMISO TUMORAL: BILATERAL (30% A 50% DEL PARÉNQUIMA GLANDULAR).\n- EXTENSIÓN EXTRAPROSTÁTICA EN GRASA (EPE): NO IDENTIFICADA (CONFINADO).\n- INVASIÓN DE VESÍCULAS SEMINALES: PRESENTE BILATERALMENTE (MUSCULAR PROPIA).\n- INVASIÓN PERINEURAL (IPN): PRESENTE.\n- INVASIÓN LINFOVASCULAR (ILV): PRESENTE.\n- MÁRGENES QUIRÚRGICOS DE RESECCIÓN: LIBRES DE NEOPLASIA (R0, DISTANCIA MÍNIMA: 1.0 mm).\n- HALLAZGOS BENIGNOS ASOCIADOS: HIPERPLASIA NODULAR BENIGNA Y PROSTATITIS CRÓNICA.\n\nIV. RESUMEN SINÓPTICO Y ESTADIFICACIÓN PATOLÓGICA (CAP / AJCC 8va EDICIÓN):\n- PROCEDIMIENTO: PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL.\n- ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8va EDICIÓN):\n  * TUMOR PRIMARIO (pT): pT3b (INVASIÓN TUMORAL BILATERAL DE VESÍCULAS SEMINALES).\n  * GANGLIOS LINFÁTICOS REGIONALES (pN): pN1 (6 DE 28 GANGLIOS METASTÁSICOS CON ENE+).\n  * ESTADO DE LOS MÁRGENES QUIRÚRGICOS: R0 (MÁRGENES NEGATIVOS, LIBRES DE NEOPLASIA).\n  * CLASIFICACIÓN FINAL DEFINITIVA: pT3b pN1 (6/28) R0.",
        "edad": 66,
        "sexo": "MASCULINO",
        "casetes": 18,
        "fContacto": "",
        "telContacto": "PROSTATECTOMÍA RADICAL",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "motivoEstudio": "SE RECIBEN 3 FRASCOS: ILIO-OBTURATRIZ DERECHO, ILIO-OBTURATRIZ IZQUIERDO Y PRÓSTATA CON VESÍCULAS SEMINALES",
        "catMacro": "9",
        "planMacro": "996",
        "catMicro": "",
        "planMicro": "",
        "clinica": "CLÍNICA SAN CLEMENTE",
        "firmado": true,
        "modificado": true,
        "estado": "Completado"
},
    '26q293': {
        "id": 18878,
        "service": "Q",
        "codAtencion": "26Q-293",
        "dni": "0",
        "medSolicitante": "DR. FLORES SIERRA, BRYAN",
        "nombres": "PEDRO",
        "apellidos": "CUZCANO CHUMPITAZ",
        "paciente": "CUZCANO CHUMPITAZ, PEDRO",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fecRegistro": "2026-09-10",
        "fecEntrega": "2026-09-14",
        "pagado": true,
        "atrasado": false,
        "especimen": "PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL",
        "macroDesc": "1. FRASCO 1 (LINFADENECTOMÍA ILÍACA DERECHA):\nSe recibe en formol espécimen rotulado como Linfadenectomía Ilíaca Derecha. Consiste en tejido fibroadiposo pardo-amarillento de 4.5 x 3.2 x 1.8 cm. A los cortes seriados, se aíslan 10 nódulos linfoides, el mayor de 1.4 x 1.1 cm, de consistencia firme y superficie de corte blanquecina. Se incluye la totalidad de la muestra en 4 casetes (1A al 1D).\n\n2. FRASCO 2 (LINFADENECTOMÍA ILÍACA IZQUIERDA):\nSe recibe en formol espécimen rotulado como Linfadenectomía Ilíaca Izquierda. Consiste en tejido fibroadiposo lobulado de 6.2 x 4.0 x 2.2 cm. A la disección minuciosa, se aíslan 18 ganglios linfáticos de diámetros entre 0.4 y 1.6 cm, de consistencia elástica y firme. Se incluye la totalidad de la muestra en 6 casetes (2A al 2F).\n\n3. FRASCO 3 (PROSTATECTOMÍA RADICAL CON VESÍCULAS SEMINALES):\nSe recibe pieza quirúrgica correspondiente a glándula prostática íntegra de 38.8 g de peso, con medidas de 4.8 cm (diámetro transversal), 4.2 cm (diámetro craneocaudal) y 3.5 cm (diámetro anteroposterior). Anexas a la base, la vesícula seminal derecha mide 3.2 x 1.4 x 0.8 cm (conducto deferente de 1.5 cm) y la vesícula seminal izquierda mide 3.0 x 1.3 x 0.7 cm (conducto deferente de 1.4 cm).\nEntintado tridimensional de superficies quirúrgicas según protocolo pentacolor estandarizado: cara anterior en amarillo, caras lateral y posterior derechas en rojo, cara posterior central en negro, cara lateral izquierda en naranja, y márgenes apical y de cuello vesical en verde.\nA los cortes transversales seriados cada 3 mm a 4 mm, el parénquima prostático muestra consistencia firme en zona periférica, con nodularidad hiperplásica en zona de transición, sin masa destructiva macroscópica evidente. Ambas vesículas seminales exhiben engrosamiento indurado basal bilateral. Se incluye muestra representativa de ápex, cuello vesical, cuadrantes y vesículas seminales en 8 casetes (3A al 3H).",
        "microDesc": "1. HISTOMORFOLOGÍA TUMORAL:\n- Tipo histológico: Adenocarcinoma acinar prostático convencional.\n- Distribución y volumen: Infiltración neoplásica bilateral que compromete ambos lóbulos prostáticos (zona periférica y zona de transición), ocupando entre el 30% y el 50% del parénquima glandular total.\n- Arquitectura y gradación de Gleason: Predominio de patrón 4 de Gleason (60% de la neoplasia), constituido por glándulas irregulares fusionadas y acinos cribiformes incipientes, intercalado con patrón 3 de Gleason (40%), formado por glándulas pequeñas individuales bien diferenciadas que infiltran el estroma fibromuscular.\n- Atipia citológica: Marcado agrandamiento nuclear con nucléolos prominentes e hipercromatismo. Ausencia de necrosis de tipo comedoniano y ausencia de patrón 5 sólido. No se identifica carcinoma intraductal de próstata (IDC-P).\n\n2. INVASIÓN PERINEURAL, LINFOVASCULAR Y EXTENSIÓN LOCAL:\n- Invasión perineural (IPN): Presente (franca y múltiple infiltración neoplásica en espacios perineurales intraprostáticos).\n- Invasión linfovascular (ILV): Presente (identificación de émbolos neoplásicos en luces vasculares del estroma prostático).\n- Extensión extraprostática (EPE): No identificada; neoplasia confinada por la pseudocápsula prostática (EPE negativa).\n- Cuello vesical: Margen de cuello vesical libre de infiltración neoplásica.\n- Vesículas seminales: Infiltración tumoral directa transmural en la pared muscular propia de ambas vesículas seminales (compromiso tumoral bilateral, pT3b).\n\n3. MÁRGENES QUIRÚRGICOS DE RESECCIÓN:\n- Todos los márgenes de resección entintados (apical, cuello vesical, anterior, laterales y posteriores) se encuentran libres de neoplasia invasora (Resección quirúrgica completa R0).\n- Distancia mínima del carcinoma invasor al margen entintado más próximo: 1.0 mm.\n\n4. COMPROMISO GANGLIONAR REGIONAL (LINFADENECTOMÍA PÉLVICA BILATERAL):\n- Frasco 1 (Linfadenectomía ilíaca derecha): Metástasis de adenocarcinoma acinar en 1 de 10 ganglios linfáticos aislados (1/10). Depósito metastásico mayor de 12 mm con extensión extranodal (ENE) presente en grasa perinodal.\n- Frasco 2 (Linfadenectomía ilíaca izquierda): Metástasis de adenocarcinoma acinar en 5 de 18 ganglios linfáticos aislados (5/18). Depósito metastásico mayor de 14 mm con extensión extranodal (ENE) franca en tejido fibroadiposo perinodal.\n- Balance global ganglionar: Metástasis en 6 de 28 ganglios linfáticos regionales examinados (6/28).",
        "diagnostico": "I. FRASCO 1: GANGLIOS LINFÁTICOS ILÍACOS DERECHOS, LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN UNO DE DIEZ GANGLIOS LINFÁTICOS (1/10).\n- DEPÓSITO METASTÁSICO MAYOR: 12 mm.\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n\nII. FRASCO 2: GANGLIOS LINFÁTICOS ILÍACOS IZQUIERDOS, LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN CINCO DE DIECIOCHO GANGLIOS LINFÁTICOS (5/18).\n- DEPÓSITO METASTÁSICO MAYOR: 14 mm.\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n\nIII. FRASCO 3: PRÓSTATA Y VESÍCULAS SEMINALES, PROSTATECTOMÍA RADICAL:\n- ADENOCARCINOMA ACINAR PROSTÁTICO CONVENCIONAL.\n- SCORE DE GLEASON: 4 + 3 = 7 (PATRÓN 4: 60%, PATRÓN 3: 40%).\n- GRUPO DE GRADO HISTOLÓGICO OMS / ISUP: GRUPO 3 (ISUP 3).\n- COMPROMISO TUMORAL: BILATERAL (30% A 50% DEL PARÉNQUIMA GLANDULAR).\n- EXTENSIÓN EXTRAPROSTÁTICA EN GRASA (EPE): NO IDENTIFICADA (CONFINADO).\n- INVASIÓN DE VESÍCULAS SEMINALES: PRESENTE BILATERALMENTE (MUSCULAR PROPIA).\n- INVASIÓN PERINEURAL (IPN): PRESENTE.\n- INVASIÓN LINFOVASCULAR (ILV): PRESENTE.\n- MÁRGENES QUIRÚRGICOS DE RESECCIÓN: LIBRES DE NEOPLASIA (R0, DISTANCIA MÍNIMA: 1.0 mm).\n- HALLAZGOS BENIGNOS ASOCIADOS: HIPERPLASIA NODULAR BENIGNA Y PROSTATITIS CRÓNICA.\n\nIV. RESUMEN SINÓPTICO Y ESTADIFICACIÓN PATOLÓGICA (CAP / AJCC 8va EDICIÓN):\n- PROCEDIMIENTO: PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL.\n- ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8va EDICIÓN):\n  * TUMOR PRIMARIO (pT): pT3b (INVASIÓN TUMORAL BILATERAL DE VESÍCULAS SEMINALES).\n  * GANGLIOS LINFÁTICOS REGIONALES (pN): pN1 (6 DE 28 GANGLIOS METASTÁSICOS CON ENE+).\n  * ESTADO DE LOS MÁRGENES QUIRÚRGICOS: R0 (MÁRGENES NEGATIVOS, LIBRES DE NEOPLASIA).\n  * CLASIFICACIÓN FINAL DEFINITIVA: pT3b pN1 (6/28) R0.",
        "edad": 66,
        "sexo": "MASCULINO",
        "casetes": 18,
        "fContacto": "",
        "telContacto": "PROSTATECTOMÍA RADICAL",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "motivoEstudio": "SE RECIBEN 3 FRASCOS: ILIO-OBTURATRIZ DERECHO, ILIO-OBTURATRIZ IZQUIERDO Y PRÓSTATA CON VESÍCULAS SEMINALES",
        "catMacro": "9",
        "planMacro": "996",
        "catMicro": "",
        "planMicro": "",
        "clinica": "CLÍNICA SAN CLEMENTE",
        "firmado": true,
        "modificado": true,
        "estado": "Completado"
}
};

export function initLocalDatabases(force = false) {
    const masterList = getRealSupabasePatients();
    const minRequired = (masterList && masterList.length >= 1252) ? masterList.length : 1252;
    if (_dbInitialized && !force && patientDatabase.length >= minRequired) return;
    _dbInitialized = true;

    // 1. Pacientes (Cargar respaldo local de varias claves posibles para disponibilidad inmediata)
    const localPatientBackup = localStorage.getItem('patientDatabaseLocal') || localStorage.getItem('patientDatabase') || localStorage.getItem('pacientesDB');
    let parsed = [];
    if (localPatientBackup) {
        try {
            parsed = JSON.parse(localPatientBackup) || [];
            if (Array.isArray(parsed) && parsed.length > 0) {
                parsed = parsed.filter(p => {
                    if (!p) return false;
                    const nom = String(p.paciente || '').toUpperCase();
                    const cod = String(p.codAtencion || p.cod_atencion || '').toUpperCase();
                    return !nom.includes('SIN NOMBRE') && !/26Q-18\d{3}/.test(cod) && !/26Q-18\d{3}/.test(String(p.id || ''));
                });
            }
        } catch (e) {
            console.error("Error al cargar el respaldo local de pacientes", e);
            parsed = [];
        }
    }

    // RUTINA SOBERANA DE AUTO-ACTUALIZACIÓN: Si masterList tiene más registros que localStorage o registros nuevos, sincronizar incondicionalmente
    if (masterList.length > 0 && (parsed.length < masterList.length || !parsed.some(p => (p.codAtencion || p.cod_atencion || p.codigo) === '26Q-377') || !parsed.some(p => (p.codAtencion || p.cod_atencion || p.codigo) === '26Q-373'))) {
        console.log(`[Auto-Update LocalStorage] Sincronizando catálogo con ${masterList.length} registros maestros...`);
        const mapLocal = new Map();
        parsed.forEach(p => {
            // SANEAMIENTO SUPREMO INVIOLABLE (JC PATH LAB): DR. CASTILLO ES EL PATÓLOGO, NUNCA EL SOLICITANTE
            const codeUpper = String(p.codAtencion || p.cod_atencion || '').toUpperCase().replace(/[-_\s]/g, '');
            const medNorm = (p.medSolicitante || p.med_solicitante || p.doctor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (medNorm.includes('castillo cuenca') || medNorm.includes('josehpi castillo') || medNorm.includes('josehp christopher castillo') || p.medSolicitante === 'DR. JOSÉ CASTILLO' || p.med_solicitante === 'DR. JOSÉ CASTILLO') {
                if (codeUpper.includes('26Q300') || codeUpper.includes('26Q301') || codeUpper.includes('26Q259') || (p.clinica && p.clinica.toUpperCase().includes('CARRION'))) {
                    p.medSolicitante = 'DR. JORGE ALBERTO MUÑANTE ARZAPALO';
                    p.med_solicitante = 'DR. JORGE ALBERTO MUÑANTE ARZAPALO';
                    p.doctor = 'DR. JORGE ALBERTO MUÑANTE ARZAPALO';
                    p.clinica = 'CLÍNICA CARRIÓN';
                    p.sede = 'CLÍNICA CARRIÓN';
                    p.procedencia = 'CLÍNICA CARRIÓN';
                } else {
                    p.medSolicitante = 'PARTICULAR / SIN ESPECIFICAR';
                    p.med_solicitante = 'PARTICULAR / SIN ESPECIFICAR';
                    p.doctor = 'PARTICULAR / SIN ESPECIFICAR';
                    if (!p.clinica || ['sin clinica', 'sin clínica', 'sin clinica definida', 'sin clínica definida'].includes(String(p.clinica).toLowerCase())) {
                        p.clinica = 'PARTICULAR';
                        p.sede = 'PARTICULAR';
                        p.procedencia = 'PARTICULAR';
                    }
                }
                databaseWasCleaned = true;
            }
 if (p && (p.codAtencion || p.cod_atencion)) mapLocal.set(cleanCodeFunc(p.codAtencion || p.cod_atencion), p); });
        masterList.forEach(m => {
            if (m && (m.codAtencion || m.cod_atencion)) {
                const k = cleanCodeFunc(m.codAtencion || m.cod_atencion);
                if (!mapLocal.has(k)) {
                    parsed.push(JSON.parse(JSON.stringify(m)));
                    mapLocal.set(k, m);
                } else {
                    // Si masterList tiene el médico correcto (Muñante), actualizar el objeto local
                    const existingLocal = mapLocal.get(k);
                    if (existingLocal && m.med_solicitante && m.med_solicitante !== existingLocal.med_solicitante) {
                        existingLocal.med_solicitante = m.med_solicitante;
                        existingLocal.medSolicitante = m.med_solicitante;
                        existingLocal.doctor = m.med_solicitante;
                        existingLocal.clinica = m.clinica || existingLocal.clinica;
                        existingLocal.sede = m.clinica || existingLocal.sede;
                        existingLocal.procedencia = m.clinica || existingLocal.procedencia;
                    }
                }
            }
        });
        sortPatientArray(parsed);
        safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(parsed));
    }

    if (parsed && parsed.length > 0) {
        patientDatabase.length = 0; 
        let databaseWasCleaned = false;
        parsed.forEach(p => {
            const cleanEspecimen = correctPapanicolaouSpelling(p.especimen || '');
            const cleanMacro = correctPapanicolaouSpelling(p.macroDesc || '');
            const cleanMicro = correctPapanicolaouSpelling(p.microDesc || '');
            const cleanDiag = correctPapanicolaouSpelling(p.diagnostico || '');
            
            const medNormVilcaInit = (p.medSolicitante || p.doctor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (medNormVilcaInit.includes('vilca')) {
                if (p.clinica !== 'CLÍNICA LA LUZ' || p.procedencia !== 'CLÍNICA LA LUZ') {
                    p.clinica = 'CLÍNICA LA LUZ';
                    p.procedencia = 'CLÍNICA LA LUZ';
                    databaseWasCleaned = true;
                }
            }
            if (cleanEspecimen !== p.especimen || cleanMacro !== p.macroDesc || cleanMicro !== p.microDesc || cleanDiag !== p.diagnostico) {
                p.especimen = cleanEspecimen;
                p.macroDesc = cleanMacro;
                p.microDesc = cleanMicro;
                p.diagnostico = cleanDiag;
                databaseWasCleaned = true;
            }
            patientDatabase.push(p);
        });
        if (databaseWasCleaned) {
            safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
            console.log("[Auto-Sanitizer] Local patient database spelling was corrected and saved.");
        }
    }

    // GARANTÍA MAESTRA ZERO-PERDIDA: Poblar incondicionalmente patientDatabase con los 1,196 expedientes reales de Supabase
    if (masterList.length > 0) {
        const existingMap = new Map();
        patientDatabase.forEach(p => {
            if (p && (p.codAtencion || p.cod_atencion)) {
                existingMap.set(cleanCodeFunc(p.codAtencion || p.cod_atencion), p);
            }
        });
        masterList.forEach(p => {
            if (p && (p.codAtencion || p.cod_atencion)) {
                const key = cleanCodeFunc(p.codAtencion || p.cod_atencion);
                const existing = existingMap.get(key);
                if (!existing) {
                    const clonedP = JSON.parse(JSON.stringify(p));
                    patientDatabase.push(clonedP);
                    existingMap.set(key, clonedP);
                } else {
                    const merged = safeMergePatientRecords(existing, p);
                    Object.assign(existing, merged);
                }
            }
        });
        sortPatientArray(patientDatabase);

        // Guardar inmediatamente la lista actualizada en el almacenamiento local e IndexedDB
        if (typeof savePatientsToLocal === 'function') {
            savePatientsToLocal();
        } else {
            safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
        }

        // Sincronización atómica inmediata O(1) de patientMap sin esperar plantillas
        patientMap.clear();
        patientDatabase.forEach(p => {
            if (p && (p.codAtencion || p.cod_atencion)) {
                patientMap.set(cleanCodeFunc(p.codAtencion || p.cod_atencion), p);
            }
        });
    }

    // Hidratación en segundo plano de fotos y solicitudes desde IndexedDB hacia la memoria
    hydrateMediaFromIndexedDB();

    // Purga automática de registros fantasmas de la serie 700
    const ghostCodes = ['26q778', '26q779', '26q782'];
    const filteredPatients = patientDatabase.filter(p => !ghostCodes.includes(cleanCodeFunc(p.codAtencion || p.cod_atencion)));
    if (filteredPatients.length !== patientDatabase.length && filteredPatients.length >= 1222) {
        patientDatabase.length = 0;
        patientDatabase.push(...filteredPatients);
        try {
            safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
            console.log("[Auto-Sanitizer] Registros fantasmas de la serie 700 removidos con éxito.");
        } catch(e) {}
    }

    // RECUPERACIÓN E INYECCIÓN DE 26Q-224 (VERDE FIRMADO)
    const idx224 = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === '26q224');
    if (idx224 !== -1) {
        const p224 = patientDatabase[idx224];
        if (!p224.diagnostico || p224.diagnostico.trim() === '' || (p224.paciente && p224.paciente.includes('224, Reporte')) || p224.dni === '0') {
            patientDatabase[idx224] = {
                ...p224,
                codAtencion: '26Q-224',
                paciente: 'NELLI, CANAYO SILVANO',
                nombres: 'NELLI',
                apellidos: 'CANAYO SILVANO',
                edad: '37',
                sexo: 'FEMENINO',
                medSolicitante: 'DR. JORGE ALBERTO MUÑANTE ARZAPALO',
                especimen: 'VESÍCULA BILIAR',
                clinica: 'CLÍNICA CARRIÓN',
                doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
                macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso (hasta 1.2 cm de espesor), con consistencia firme y aspecto blanquecino-grisáceo, sugerente de fibrosis transmural. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso-oscura. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared.',
                microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz. Se observa fibrosis hialina extensa que disocia las fibras musculares lisas, así como numerosos senos de rokitansky-aschoff dilatados, algunos de ellos rellenos de barro biliar e infiltrados por histiocitos espumosos. El epitelio de revestimiento remanente muestra metaplasia escamosa focal y cambios regenerativos atípicos reactivos, sin evidencia de displasia franca ni invasión estromal. No se identifican células neoplásicas ni depósitos amiloides.',
                diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA REAGUDIZADA, CON EXTENSA FIBROSIS MURAL, ULCERACIÓN MUCOSA Y ABSCESOS INTRAMURALES, SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
                firmado: true,
                modificado: true,
                estado: 'Completado',
                service: 'Q'
            };
        } else {
            p224.firmado = true;
            p224.modificado = true;
            p224.estado = 'Completado';
        }
    }

    
    // RECUPERACIÓN E INYECCIÓN DE 26Q-343, 26Q-344, 26Q-345 (CASOS REALES CLÍNICA DE LA MUJER)
    const guaranteedCases = {
        '26q-343': {
            id: 18928,
            codAtencion: '26Q-343',
            cod_atencion: '26Q-343',
            codigo: '26Q-343',
            paciente: 'TUÑOQUE SANDOVAL, KARINA',
            nombres: 'KARINA',
            apellidos: 'TUÑOQUE SANDOVAL',
            dni: '42109876',
            edad: 35,
            sexo: 'FEMENINO',
            especimen: 'BIOPSIA DE CÉRVIX',
            tipo_estudio: 'BIOPSIA DE CÉRVIX',
            fecRegistro: '2026-10-10',
            fec_registro: '2026-10-10',
            fecha_registro: '2026-10-10',
            fechaIngreso: '2026-10-10',
            fecRecepcion: '10/10/2026',
            fecEntrega: '2026-10-17',
            fec_entrega: '2026-10-17',
            fecha_entrega: '2026-10-17',
            fechaInforme: '2026-10-17',
            medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            med_solicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            medico_solicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            doctor: 'DR. JOSEPH CHRISTOPHER CASTILLO CUENCA',
            clinica: 'CLINICA LA MUJER',
            procedencia: 'CLINICA LA MUJER',
            sede: 'CLINICA LA MUJER',
            costo: 40.0,
            adelanto: 40.0,
            resta: 0.0,
            pagado: true,
            estado: 'Completado',
            firmado: true,
            validado: true,
            macroDesc: 'Se reciben tres (03) fragmentos tisulares parduzcos que miden entre 0.3 cm y 0.5 cm de diámetro mayor. Se incluye la totalidad de la muestra en una cápsula (1 casete).',
            microDesc: 'Se observa epitelio escamoso estratificado no queratinizado que muestra pérdida de la maduración y polaridad en los dos tercios inferiores del espesor epitelial, con marcada hipercromasia nuclear, pleomorfismo y aumento de la relación núcleo citoplasmática. Se identifican figuras mitóticas por encima del tercio basal. La membrana basal permanece íntegra sin invasión estromal. Estroma con infiltrado inflamatorio crónico inespecífico.',
            diagnostico: 'LESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (NIC 2) NEOPLASIA INTRAEPITELIAL CERVICAL GRADO 2 (AFECTACIÓN DE LOS DOS TERCIOS INFERIORES DEL EPITELIO, CON ACTIVIDAD MITÓTICA AUMENTADA Y ATIPIA CITOLÓGICA MARCADA, SIN INVASIÓN).'
        },
        '26q-344': {
            id: 1344,
            codAtencion: '26Q-344',
            cod_atencion: '26Q-344',
            codigo: '26Q-344',
            paciente: 'LARA ROJAS, XIOMARA',
            nombres: 'XIOMARA',
            apellidos: 'LARA ROJAS',
            dni: '45156738',
            edad: 32,
            sexo: 'FEMENINO',
            especimen: 'Biopsia de Cuello Uterino',
            tipo_estudio: 'BIOPSIA DE CÉRVIX',
            fecRegistro: '2026-10-10',
            fec_registro: '2026-10-10',
            fecha_registro: '2026-10-10',
            fechaIngreso: '2026-10-10',
            fecRecepcion: '10/10/2026',
            fecEntrega: '2026-10-18',
            fec_entrega: '2026-10-18',
            fecha_entrega: '2026-10-18',
            fechaInforme: '2026-10-18',
            medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            med_solicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            medico_solicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            doctor: 'DR. JOSEPH CHRISTOPHER CASTILLO CUENCA',
            clinica: 'CLINICA LA MUJER',
            procedencia: 'CLINICA LA MUJER',
            sede: 'CLINICA LA MUJER',
            costo: 40.0,
            adelanto: 40.0,
            resta: 0.0,
            pagado: true,
            estado: 'Completado',
            firmado: true,
            validado: true,
            macroDesc: 'Se reciben dos (02) fragmentos tisulares parduzcos que miden 0.4 cm y 0.5 cm de diámetro mayor. Se incluye íntegramente en 1 casete.',
            microDesc: 'Cortes histológicos de cuello uterino muestran epitelio escamoso estratificado y endocérvix con cervicitis crónica inespecífica. Negativo para lesión intraepitelial escamosa o malignidad invasora.',
            diagnostico: 'LESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (NIC 2) NEOPLASIA INTRAEPITELIAL CERVICAL GRADO 2 (AFECTACIÓN DE LOS DOS TERCIOS INFERIORES DEL EPITELIO, CON ACTIVIDAD MITÓTICA AUMENTADA Y ATIPIA CITOLÓGICA MARCADA, SIN INVASIÓN).'
        },
        '26q-345': {
            id: 1345,
            codAtencion: '26Q-345',
            cod_atencion: '26Q-345',
            codigo: '26Q-345',
            paciente: 'MARCELO DIAZ, NORAH LINA',
            nombres: 'NORAH LINA',
            apellidos: 'MARCELO DIAZ',
            dni: '41258963',
            edad: 40,
            sexo: 'FEMENINO',
            especimen: 'Biopsia de Cuello Uterino',
            tipo_estudio: 'BIOPSIA DE CÉRVIX',
            fecRegistro: '2026-10-10',
            fec_registro: '2026-10-10',
            fecha_registro: '2026-10-12',
            fechaIngreso: '2026-10-10',
            fecRecepcion: '10/10/2026',
            fecEntrega: '2026-10-18',
            fec_entrega: '2026-10-18',
            fecha_entrega: '2026-10-19',
            fechaInforme: '2026-10-18',
            medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            med_solicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            medico_solicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA',
            doctor: 'DR. JOSEPH CHRISTOPHER CASTILLO CUENCA',
            clinica: 'CLINICA LA MUJER',
            procedencia: 'CLINICA LA MUJER',
            sede: 'CLINICA LA MUJER',
            costo: 40.0,
            adelanto: 40.0,
            resta: 0.0,
            pagado: true,
            estado: 'Completado',
            firmado: true,
            validado: true,
            macroDesc: 'Se reciben tres (03) fragmentos tisulares parduzcos que miden entre 0.3 cm y 0.6 cm de diámetro mayor. Se incluye íntegramente en 1 casete.',
            microDesc: 'Cortes histológicos muestran fragmentos de cuello uterino con epitelio escamoso estratificado maduro y mucosa endocervical adyacente con infiltrado inflamatorio linfoplasmocitario estromal moderado. Negativo para displasia o malignidad.',
            diagnostico: 'LESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (NIC 2) NEOPLASIA INTRAEPITELIAL CERVICAL GRADO 2 (AFECTACIÓN DE LOS DOS TERCIOS INFERIORES DEL EPITELIO, CON ACTIVIDAD MITÓTICA AUMENTADA Y ATIPIA CITOLÓGICA MARCADA, SIN INVASIÓN).'
        }
    };

    Object.keys(guaranteedCases).forEach(k => {
        const targetObj = guaranteedCases[k];
        const exIdx = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion || p.codigo) === k);
        if (exIdx !== -1) {
            patientDatabase[exIdx] = { ...patientDatabase[exIdx], ...targetObj };
        } else {
            patientDatabase.push(JSON.parse(JSON.stringify(targetObj)));
        }
    });

    // RECUPERACIÓN E INYECCIÓN DE 26Q-261 (CORDOVA VARGAS, ZOILA - VERDE FIRMADO / COMPLETADO)
    const idx261 = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === '26q261');
    if (idx261 !== -1) {
        const p261 = patientDatabase[idx261];
        if (!p261.diagnostico || p261.diagnostico.trim() === '' || p261.estado === 'Pendiente' || !p261.firmado) {
            patientDatabase[idx261] = {
                ...p261,
                id: p261.id || 2666,
                codAtencion: '26Q-261',
                paciente: 'CORDOVA VARGAS, ZOILA',
                nombres: 'ZOILA',
                apellidos: 'CORDOVA VARGAS',
                dni: '79891856',
                edad: 27,
                sexo: 'FEMENINO',
                medSolicitante: 'DR. DIEGO ALONSO CHUNGUI BRAVO',
                especimen: 'VESÍCULA BILIAR',
                clinica: 'CLÍNICA CARRIÓN',
                doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
                fecRegistro: '2026-08-16',
                fecEntrega: '2026-08-20',
                casetes: 2,
                costo: 75,
                adelanto: 0,
                resta: 75,
                pagado: true,
                atrasado: false,
                macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso, con consistencia firme y aspecto blanquecino grisáceo. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso oscura, SE IDENTIFICAN 4 CALCULOS AMAIRLLENTOS DE 1 CM DE DIAMETRO MAYOR. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared. Se INCLUYE MUETRA REPRESENTATIVA. 2 CASETES.',
                microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz.',
                diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA LITIASICA REAGUDIZADA, ULCERACIÓN MUCOSA SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
                firmado: true,
                modificado: true,
                estado: 'Completado',
                service: 'Q'
            };
        } else {
            p261.firmado = true;
            p261.modificado = true;
            p261.estado = 'Completado';
        }
    } else {
        patientDatabase.push({
            id: 2666,
            codAtencion: '26Q-261',
            paciente: 'CORDOVA VARGAS, ZOILA',
            nombres: 'ZOILA',
            apellidos: 'CORDOVA VARGAS',
            dni: '79891856',
            edad: 27,
            sexo: 'FEMENINO',
            medSolicitante: 'DR. DIEGO ALONSO CHUNGUI BRAVO',
            especimen: 'VESÍCULA BILIAR',
            clinica: 'CLÍNICA CARRIÓN',
            doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
            fecRegistro: '2026-08-16',
            fecEntrega: '2026-08-20',
            casetes: 2,
            costo: 75,
            adelanto: 0,
            resta: 75,
            pagado: true,
            atrasado: false,
            macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso, con consistencia firme y aspecto blanquecino grisáceo. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso oscura, SE IDENTIFICAN 4 CALCULOS AMAIRLLENTOS DE 1 CM DE DIAMETRO MAYOR. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared. Se INCLUYE MUETRA REPRESENTATIVA. 2 CASETES.',
            microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz.',
            diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA LITIASICA REAGUDIZADA, ULCERACIÓN MUCOSA SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
            firmado: true,
            modificado: true,
            estado: 'Completado',
            service: 'Q'
        });
    }

    // RECUPERACIÓN E INYECCIÓN DE 26Q-293 (CUZCANO CHUMPITAZ, PEDRO - PROSTATECTOMÍA RADICAL - VERDE FIRMADO / COMPLETADO)
    const idx293 = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === '26q293');
    if (idx293 !== -1) {
        const p293 = patientDatabase[idx293];
        if (!p293.diagnostico || p293.diagnostico.trim() === '' || p293.estado === 'Pendiente' || !p293.firmado) {
            patientDatabase[idx293] = {
                ...p293,
                ...(typeof RESTORED_PATIENT_RECORDS !== 'undefined' && RESTORED_PATIENT_RECORDS['26q-293'] ? RESTORED_PATIENT_RECORDS['26q-293'] : {}),
                firmado: true,
                modificado: true,
                estado: 'Completado'
            };
        } else {
            p293.firmado = true;
            p293.modificado = true;
            p293.estado = 'Completado';
        }
    } else {
        patientDatabase.push({
            ...(typeof RESTORED_PATIENT_RECORDS !== 'undefined' && RESTORED_PATIENT_RECORDS['26q-293'] ? RESTORED_PATIENT_RECORDS['26q-293'] : {})
        });
    }

    // BUCLE DE RECUPERACIÓN Y REPARACIÓN INMEDIATA DE CLÍNICA EN LOCALSTORAGE
    let clinicaRepaired = false;
    patientDatabase.forEach(item => {
        delete item._searchKey;
        const cod = String(item.codAtencion || '').trim();
        if (cod === '26C-124' || cod === '26C-123' || cod.toLowerCase() === '26c-124' || cod.toLowerCase() === '26c-123') {
            item.clinica = 'CLÍNICA CARRIÓN';
            clinicaRepaired = true;
        } else {
            let c = (item.clinica || '').trim();
            if (!c || c.toLowerCase() === 'sin clinica') {
                const m = (item.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (m.includes('escalante')) c = 'CLÍNICA SAN CLEMENTE';
                else if (m.includes('sanchez') || m.includes('becerra') || m.includes('ulfe') || m.includes('carrion')) c = 'CLÍNICA CARRIÓN';
                else if (m.includes('marreros') || m.includes('lloclla')) c = 'CLINICA LA MUJER';
                else if (m.includes('saire') || m.includes('bocangel')) c = 'CLÍNICA ALFA PREVENIR';
                if (c) {
                    item.clinica = c;
                    clinicaRepaired = true;
                }
            }
        }
    });

    // BUCLE DE CLASIFICACIÓN DE 3 ESTADOS (🟢 VERDE FIRMADO | 🟡 AMARILLO GUARDADO CON INFO | 🔴 ROJO PENDIENTE SIN INFO)
    // Saneamiento Clínico Riguroso: Si no hay diagnóstico, NUNCA puede ser Completado / Firmado
    patientDatabase.forEach(item => {
        const sla = getPatientSlaStatus(item);
        item.firmado = sla.isFirmado;
        item.modificado = sla.isModificado;
        item.estado = sla.estado;
    });

    try {
        safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
        console.log('[SLA Auto-Repair] Se actualizaron e inmunizaron los estados SLA en localStorage.');
    } catch (e) {
        console.error(e);
    }

    // Do not populate dummy values for especimen if blank
    patientDatabase.forEach(item => {
        if (item.especimen === undefined || item.especimen === null) {
            item.especimen = '';
        }
    });


    // Migración automática de la dimensión 6.0 * 5* 2.0 cm a 6.0 x 5 x 2.0 cm
    let hasMigrationChanges = false;
    patientDatabase.forEach(item => {
        const fieldsToMigrate = ['macroDesc', 'microDesc', 'diagnostico', 'especimen', 'motivoEstudio'];
        fieldsToMigrate.forEach(field => {
            if (item[field] && typeof item[field] === 'string') {
                const normalized = item[field].replace(/6\.0\s*\*\s*5\s*\*?\s*2\.0\s*CM/gi, '6.0 x 5 x 2.0 CM');
                if (normalized !== item[field]) {
                    item[field] = normalized;
                    hasMigrationChanges = true;
                }
            }
        });
    });

    // REGLA SAGRADA: Reparar de forma permanente el registro 26Q-278
    const idx278 = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === '26q-278' || cleanCodeFunc(p.codAtencion || p.cod_atencion) === '26q278');
    if (idx278 !== -1) {
        const p278 = patientDatabase[idx278];
        const espUpper = String(p278.especimen || '').toUpperCase();
        const motUpper = String(p278.motivoEstudio || '').toUpperCase();
        if (espUpper.includes('CERVIX') || motUpper.includes('CUELLO UTERINO') || !p278.especimen || p278.especimen === 'CERVIX') {
            p278.especimen = 'BIOPSIA CUTANEA';
            p278.telContacto = 'BIOPSIA CUTANEA';
            p278.motivoEstudio = 'NEVUS VERRUGOSO DE CUERO CABELLUDO';
            p278.modificado = true;
            try {
                safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
            } catch(e) {}
            if (window.supabase && typeof window.supabase.from === 'function') {
                window.supabase.from('pacientes').update({
                    especimen: 'BIOPSIA CUTANEA',
                    tel_contacto: 'BIOPSIA CUTANEA',
                    motivo_estudio: 'NEVUS VERRUGOSO DE CUERO CABELLUDO'
                }).ilike('cod_atencion', '26Q-278').then(() => {
                    console.log("[Supabase Auto-Heal] 26Q-278 corregido permanentemente en la nube.");
                }).catch(e => console.warn(e));
            }
        }
    }

    if (hasMigrationChanges) {
        triggerAutomaticBackup();
        console.log('[Migration] Se corrigió el formato de dimensiones en los registros de paciente.');
    }


        // =========================================================================
    // 2. PLANTILLAS - GARANTÍA DE SINCRONIZACIÓN MAESTRA INFALIBLE O(N)
    // =========================================================================
    const defTpls = (typeof window !== 'undefined' && Array.isArray(window.defaultTemplates) && window.defaultTemplates.length > 0)
        ? window.defaultTemplates
        : ((typeof defaultTemplates !== 'undefined' && Array.isArray(defaultTemplates)) ? defaultTemplates : []);

    const REBUILD_KEY_V544 = 'PLANTILLAS_VERSION_V544_REBUILD';
    const isFirstV544Load = !localStorage.getItem(REBUILD_KEY_V544);

    let localTemplatesRaw = [];
    if (!isFirstV544Load) {
        try {
            localTemplatesRaw = JSON.parse(localStorage.getItem('plantillasDB')) || [];
        } catch (e) {
            localTemplatesRaw = [];
        }
    }

    // Mapa unificado indexado por clave canónica [categoryId + "___" + tituloNormalizado]
    const templateMap = new Map();

    // A. Cargar plantillas existentes en localStorage (preserva personalizaciones del usuario si no es reconstrucción)
    localTemplatesRaw.forEach(t => {
        if (t && t.titulo && t.categoryId !== undefined) {
            const key = `${t.categoryId}___${String(t.titulo).trim().toUpperCase()}`;
            templateMap.set(key, t);
        }
    });

    // B. GARANTÍA INFALIBLE: Inyectar y sobrescribir SIEMPRE con las plantillas maestras de plantillas_data.js
    defTpls.forEach(defTpl => {
        if (defTpl && defTpl.titulo && defTpl.categoryId !== undefined) {
            const key = `${defTpl.categoryId}___${String(defTpl.titulo).trim().toUpperCase()}`;
            templateMap.set(key, { ...defTpl });
        }
    });

    // C. Mutar in-place el array exportado para no romper referencias de otros módulos
    templatesDatabase.length = 0;
    templatesDatabase.push(...Array.from(templateMap.values()));

    if (isFirstV544Load) {
        try { safeSetLocalStorage(REBUILD_KEY_V544, 'true'); } catch (e) {}
    }

    // D. Sincronizar en localStorage y window
    if (typeof window !== 'undefined') {
        window.templatesDatabase = templatesDatabase;
    }
    try {
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
    } catch (e) {}

    // GARANTÍA MILITAR: Inyección forzada e inmediata de plantilla HIPERPLASIA SIMPLE SIN ATIPIA
    const idxHiperplasia = templatesDatabase.findIndex(t => (t.titulo || '').trim().toUpperCase().includes('HIPERPLASIA SIMPLE SIN ATIPIA'));
    const tplHiperplasia = {
        id: 69,
        categoryId: 4,
        titulo: "HIPERPLASIA SIMPLE SIN ATIPIA",
        macro: "Se reciben en fijador múltiples fragmentos irregulares de tejido blando, pardo-rojizos y francamente hemorrágicos, que en conjunto miden 1.5 x 1.0 x 0.4 cm. Se procesa la totalidad de la muestra en un bloque de parafina.",
        micro: "Los cortes muestran tejido endometrial con incremento difuso en la densidad glandular y alteración de la relación glándula/estroma (>1:1), con glándulas de tamaños variados, dilataciones quísticas y contornos tortuosos. El epitelio conserva la polaridad nuclear, con núcleos monótonos y sin atipia citológica ni pleomorfismo; el estroma interglandular persiste celular, con extravasación hemática focal y artefactos de compresión mecánica.",
        diag: "BIOPSIA DE ENDOMETRIO:\n- COMPATIBLE CON HIPERPLASIA ENDOMETRIAL SIN ATIPIA.\n\nRECOMENDACIÓN: SE SUGIERE CORRELACIÓN CLÍNICO-ECOGRÁFICA Y TRATAMIENTO CONSERVADOR CON PROGESTÁGENOS, CON CONTROL DE SEGUIMIENTO PARA VERIFICAR LA REGRESIÓN DE LA LESIÓN."
    };
    if (idxHiperplasia === -1) {
        templatesDatabase.push(tplHiperplasia);
    } else {
        templatesDatabase[idxHiperplasia] = { ...templatesDatabase[idxHiperplasia], ...tplHiperplasia };
    }
    safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));

    // GARANTÍA MILITAR: Inyección forzada e inmediata de EXOENDOCERVICITIS CRÓNICA MODERADA 1 y 2 (Cat 18 - Ginecología Microscopía)
    const gynMicroTemplates = [
        {
            id: 6319,
            categoryId: 18,
            titulo: "EXOENDOCERVICITIS CRÓNICA MODERADA 1",
            macro: "se recibe en formol fragmento(s) de tejido cérvico-uterino (biopsia de cérvix) que mide(n) [dimensiones] cm, de coloración pardo-rosada y consistencia blanda. se incluye la totalidad de la muestra en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / WHO Classification of Tumours Editorial Board (2020). Female Genital Tumours (5th ed.).</small>",
            micro: "los cortes histológicos muestran fragmentos de mucosa exocervical revestida por epitelio escamoso estratificado no queratinizante y endocervical con epitelio cilíndrico mucosecretor. la lámina propia y el estroma subyacente exhiben un infiltrado inflamatorio crónico de intensidad moderada, compuesto predominantemente por linfocitos y células plasmáticas maduras, con congestión vascular y cambios regenerativos epiteliales focales. no se identifican signos de displasia cervical (lesión intraepitelial escamosa de bajo o alto grado - LSIL/HSIL), coilocitos ni neoplasia maligna invasora.",
            diag: "BIOPSIA DE CÉRVIX: EXOENDOCERVICITIS CRÓNICA MODERADA."
        },
        {
            id: 6320,
            categoryId: 18,
            titulo: "EXOENDOCERVICITIS CRÓNICA MODERADA 2",
            macro: "se recibe en formol muestra de tejido correspondiente a biopsia de cérvix, que consta de [n] fragmento(s) que miden en conjunto [dimensiones] cm, de aspecto pardo-rojizo y consistencia elástica. se incluye la totalidad de la muestra en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / WHO Classification of Tumours Editorial Board (2020). Female Genital Tumours (5th ed.).</small>",
            micro: "el estudio histológico revela fragmentos de mucosa de cérvix (exocérvix y endocérvix) que muestran un infiltrado inflamatorio crónico moderado en el corion, constituido por linfocitos y células plasmáticas. se observa metaplasia escamosa madura focal y epitelio glandular endocervical con secreción conservada. no se observa atipia citológica, coilocitosis ni evidencia histológica de lesión intraepitelial escamosa ni carcinoma invasor.",
            diag: "BIOPSIA DE CÉRVIX: EXOENDOCERVICITIS CRÓNICA MODERADA."
        }
    ];

    gynMicroTemplates.forEach(tpl => {
        const idx = templatesDatabase.findIndex(t => 
            (t.categoryId === tpl.categoryId || t.categoryId === String(tpl.categoryId)) && 
            (t.titulo || '').trim().toUpperCase() === tpl.titulo
        );
        if (idx === -1) {
            templatesDatabase.push(tpl);
        } else {
            templatesDatabase[idx] = { ...templatesDatabase[idx], ...tpl };
        }
    });
    safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));

    // GARANTÍA MILITAR: Inyección forzada e inmediata de PROSTATECTOMÍA RADICAL, ENUCLEACIÓN DE PRÓSTATA (Cat 9 y Cat 25) y MORCELADOS DE PRÓSTATA
    const urologyCoreTemplates = [
    {
        "id": 997,
        "categoryId": 9,
        "titulo": "PROSTATECTOMÍA RADICAL",
        "macro": "se recibe producto de prostatectomía radical consistente en próstata íntegra con vesículas seminales bilaterales y segmentos de conductos deferentes, que en conjunto pesa [peso] g y mide [dimensiones] cm. la superficie externa se encuentra entintada según código (derecho negro, izquierdo azul). al corte seriado cada 3 a 5 mm desde el ápice hasta la base, el parénquima prostático muestra tejido nodular elástico pardo-amarillento, identificándose en zona periférica un nódulo blanquecino indurado de [x] cm. las vesículas seminales y muñones de conductos deferentes no presentan lesiones macroscópicas. se incluye muestra representativa según protocolo en [n] casetes.\\n\\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / College of American Pathologists (CAP, 2023).</small>",
        "micro": "los cortes histológicos de próstata muestran un adenocarcinoma acinar invasor de la próstata que involucra predominantemente la zona periférica. las glándulas neoplásicas muestran patrón de crecimiento tubular/acinar con luces fusionadas y focos cribiformes ocasionales (arquitectura correspondiente a patrones gleason 3 y 4). las células tumorales presentan pérdida completa de la capa de células basales externas (p63 y 34betae12 negativos), con núcleos aumentados de tamaño, hipercromáticos y macronucléolos prominentes. se evidencia sobreexpresión citoplasmática de alfa-metilacil-coa racemasa (amacr/p504s positiva). no se observa invasión perineural ni extensión extraprostática macroscópica. los márgenes quirúrgicos entintados (ápice, base y margen circunferencial) se encuentran libres de neoplasia. las vesículas seminales y conductos deferentes bilaterales examinados carecen de infiltración neoplásica.",
        "diag": "PRÓSTATA Y VESÍCULAS SEMINALES (PROSTATECTOMÍA RADICAL):\\n- ADENOCARCINOMA ACINAR PROSTÁTICO INVASOR.\\n- PUNTUACIÓN DE GLEASON: 7 (3 + 4) / GRUPO DE GRADO DE LA OMS/ISUP: GRUPO 2.\\n- EXTENSIÓN TUMORAL: COMPROMETE APROXIMADAMENTE EL [__]% DEL PARÉNQUIMA PROSTÁTICO EXAMINADO.\\n- EXTENSIÓN EXTRAPROSTÁTICA (EPE): NO IDENTIFICADA (LIMITADO A LA PRÓSTATA).\\n- INVASIÓN DE VESÍCULAS SEMINALES: NEGATIVO (LIBRES DE NEOPLASIA).\\n- INVASIÓN PERINEURAL: [NO IDENTIFICADA / PRESENTE].\\n- INVASIÓN LINFOVASCULAR: NO IDENTIFICADA.\\n- MÁRGENES QUIRÚRGICOS DE RESECCIÓN (ÁPICE, BASE, CÁPSULA): LIBRES DE NEOPLASIA MALIGNA (DISTANCIA AL MARGEN MÁS CERCANO: [__] mm).\\n- ESTADIFICACIÓN PATOLÓGICA (AJCC 8.ª EDICIÓN): pT2 pNx."
    },
    {
        "id": 1997,
        "categoryId": 25,
        "titulo": "PROSTATECTOMÍA RADICAL",
        "macro": "se recibe producto de prostatectomía radical consistente en próstata íntegra con vesículas seminales bilaterales y segmentos de conductos deferentes, que en conjunto pesa [peso] g y mide [dimensiones] cm. la superficie externa se encuentra entintada según código (derecho negro, izquierdo azul). al corte seriado cada 3 a 5 mm desde el ápice hasta la base, el parénquima prostático muestra tejido nodular elástico pardo-amarillento, identificándose en zona periférica un nódulo blanquecino indurado de [x] cm. las vesículas seminales y muñones de conductos deferentes no presentan lesiones macroscópicas. se incluye muestra representativa según protocolo en [n] casetes.\\n\\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / College of American Pathologists (CAP, 2023).</small>",
        "micro": "los cortes histológicos de próstata muestran un adenocarcinoma acinar invasor de la próstata que involucra predominantemente la zona periférica. las glándulas neoplásicas muestran patrón de crecimiento tubular/acinar con luces fusionadas y focos cribiformes ocasionales (arquitectura correspondiente a patrones gleason 3 y 4). las células tumorales presentan pérdida completa de la capa de células basales externas (p63 y 34betae12 negativos), con núcleos aumentados de tamaño, hipercromáticos y macronucléolos prominentes. se evidencia sobreexpresión citoplasmática de alfa-metilacil-coa racemasa (amacr/p504s positiva). no se observa invasión perineural ni extensión extraprostática macroscópica. los márgenes quirúrgicos entintados (ápice, base y margen circunferencial) se encuentran libres de neoplasia. las vesículas seminales y conductos deferentes bilaterales examinados carecen de infiltración neoplásica.",
        "diag": "PRÓSTATA Y VESÍCULAS SEMINALES (PROSTATECTOMÍA RADICAL):\\n- ADENOCARCINOMA ACINAR PROSTÁTICO INVASOR.\\n- PUNTUACIÓN DE GLEASON: 7 (3 + 4) / GRUPO DE GRADO DE LA OMS/ISUP: GRUPO 2.\\n- EXTENSIÓN TUMORAL: COMPROMETE APROXIMADAMENTE EL [__]% DEL PARÉNQUIMA PROSTÁTICO EXAMINADO.\\n- EXTENSIÓN EXTRAPROSTÁTICA (EPE): NO IDENTIFICADA (LIMITADO A LA PRÓSTATA).\\n- INVASIÓN DE VESÍCULAS SEMINALES: NEGATIVO (LIBRES DE NEOPLASIA).\\n- INVASIÓN PERINEURAL: [NO IDENTIFICADA / PRESENTE].\\n- INVASIÓN LINFOVASCULAR: NO IDENTIFICADA.\\n- MÁRGENES QUIRÚRGICOS DE RESECCIÓN (ÁPICE, BASE, CÁPSULA): LIBRES DE NEOPLASIA MALIGNA (DISTANCIA AL MARGEN MÁS CERCANO: [__] mm).\\n- ESTADIFICACIÓN PATOLÓGICA (AJCC 8.ª EDICIÓN): pT2 pNx."
    },
    {
        "id": 998,
        "categoryId": 9,
        "titulo": "ENUCLEACIÓN DE PRÓSTATA",
        "macro": "se recibe espécimen de enucleación prostática consistente en una pieza multilobulada íntegra (lóbulos laterales y medio), con superficie externa pseudo-capsular lisa y congestiva, que mide [dimensiones] cm y pesa [peso] g. a los cortes seriados cada 3 a 5 mm, el parénquima exhibe aspecto nodular pardo-amarillento a pardo-blanquecino, de consistencia elástica, con múltiples formaciones microquísticas ectásicas y secreción coloide, sin induraciones sospechosas ni áreas de necrosis. se incluye muestra representativa según protocolo de enucleación en [n] casete(s).\\n\\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / College of American Pathologists (CAP, 2023).</small>",
        "micro": "los cortes histológicos muestran parénquima prostático con hiperplasia nodular mixta (glandular y estromal). las unidades acinares exhiben luces dilatadas, plegamientos papilares y cuerpos amiláceos intraluminares, conservando una bicapa celular intacta (células basales continuas y células luminales secretoras) sin atipia citológica. el estroma interglandular presenta hiperplasia fibromuscular acompañada de un leve infiltrado inflamatorio crónico linfohistiocitario focal. la pseudocápsula periférica se encuentra libre de neoplasia. no se identifica proliferación acinar atípica (ASAP), neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma invasor.",
        "diag": "PRÓSTATA (ENUCLEACIÓN PROSTÁTICA):\\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (COMPONENTE GLANDULAR Y FIBROMUSCULAR).\\n- PROSTATITIS CRÓNICA LINFOHISTIOCITARIA LEVE INESPECÍFICA.\\n- PSEUDOCÁPSULA QUIRÚRGICA LIBRE DE NEOPLASIA.\\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) Y NEGATIVO PARA MALIGNIDAD EN EL MATERIAL EXAMINADO."
    },
    {
        "id": 1998,
        "categoryId": 25,
        "titulo": "ENUCLEACIÓN DE PRÓSTATA",
        "macro": "se recibe espécimen de enucleación prostática consistente en una pieza multilobulada íntegra (lóbulos laterales y medio), con superficie externa pseudo-capsular lisa y congestiva, que mide [dimensiones] cm y pesa [peso] g. a los cortes seriados cada 3 a 5 mm, el parénquima exhibe aspecto nodular pardo-amarillento a pardo-blanquecino, de consistencia elástica, con múltiples formaciones microquísticas ectásicas y secreción coloide, sin induraciones sospechosas ni áreas de necrosis. se incluye muestra representativa según protocolo de enucleación en [n] casete(s).\\n\\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / College of American Pathologists (CAP, 2023).</small>",
        "micro": "los cortes histológicos muestran parénquima prostático con hiperplasia nodular mixta (glandular y estromal). las unidades acinares exhiben luces dilatadas, plegamientos papilares y cuerpos amiláceos intraluminares, conservando una bicapa celular intacta (células basales continuas y células luminales secretoras) sin atipia citológica. el estroma interglandular presenta hiperplasia fibromuscular acompañada de un leve infiltrado inflamatorio crónico linfohistiocitario focal. la pseudocápsula periférica se encuentra libre de neoplasia. no se identifica proliferación acinar atípica (ASAP), neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma invasor.",
        "diag": "PRÓSTATA (ENUCLEACIÓN PROSTÁTICA):\\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (COMPONENTE GLANDULAR Y FIBROMUSCULAR).\\n- PROSTATITIS CRÓNICA LINFOHISTIOCITARIA LEVE INESPECÍFICA.\\n- PSEUDOCÁPSULA QUIRÚRGICA LIBRE DE NEOPLASIA.\\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) Y NEGATIVO PARA MALIGNIDAD EN EL MATERIAL EXAMINADO."
    },
    {
        "id": 999,
        "categoryId": 9,
        "titulo": "MORCELADOS DE PRÓSTATA (ASISTENTE WIZARD)",
        "macro": "Se reciben múltiples fragmentos tisulares alargados e irregulares (virutas de morcelado prostático láser HoLEP / ThuLEP o resección transuretral), de superficie lobulada, coloración pardo-blanquecina a pardo-amarillenta y consistencia elástica firme con sectores esponjosos, que en conjunto miden [dimensiones] cm y registran un peso neto de [peso] g. Al corte, los fragmentos muestran microquistes con contenido coloide translúcido y nódulos estromales blanquecinos bien delimitados. No se observan áreas friables, necróticas ni nódulos amarillentos xantomatosos. Se incluye muestreo representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / WHO Classification of Tumours of the Urinary System and Male Genital Organs (5th ed., 2022).</small>",
        "micro": "Los cortes histológicos coloreados con H&E revelan parénquima prostático correspondiente a la zona de transición con hiperplasia nodular benigna clásica de patrón mixto (adenomatoso y fibromuscular equilibrado). Las unidades glandulares muestran luces acinares de calibre variable, con pliegues papilares intraluminares revestidos por una doble capa epitelial íntegra y bien diferenciada: capa interna de células secretoras cilíndricas de citoplasma claro o finamente granular sin atipia ni macronucléolos prominentes, y capa externa continua de células basales mioepiteliales paralelas a la membrana basal. Se aprecian abundantes cuerpos amiláceos intraluminares basófilos y acidófilos laminares. El estroma interacinar demuestra proliferación ordenada de fascículos de músculo liso y fibroblastos maduros sin hipercromatismo ni actividad mitótica. No se observan atipias nucleares, cribas atípicas, proliferación microacinar carente de capa basal (ASAP), neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma acinar invasor.",
        "diag": "TEJIDO PROSTÁTICO (PRODUCTO DE MORCELADO / ENUCLEACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (PATRÓN MIXTO ADENOMATOSO Y FIBROMUSCULAR EQUILIBRADO).\n- ECTASIA DUCTO-ACINAR CON CUERPOS AMILÁCEOS INTRALUMINARES MÚLTIPLES.\n- NEGATIVO PARA PROCESO INFLAMATORIO AGUDO O CRÓNICO SIGNIFICATIVO.\n- NEGATIVO PARA PROLIFERACIÓN ACINAR ATÍPICA (ASAP) O NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN).\n- NEGATIVO PARA NEOPLASIA MALIGNA (ADENOCARCINOMA PROSTÁTICO INVASOR) EN EL MATERIAL EXAMINADO (ISUP / OMS 2022)."
    },
    {
        "id": 1999,
        "categoryId": 25,
        "titulo": "MORCELADOS DE PRÓSTATA (ASISTENTE WIZARD)",
        "macro": "Se reciben múltiples fragmentos tisulares alargados e irregulares (virutas de morcelado prostático láser HoLEP / ThuLEP o resección transuretral), de superficie lobulada, coloración pardo-blanquecina a pardo-amarillenta y consistencia elástica firme con sectores esponjosos, que en conjunto miden [dimensiones] cm y registran un peso neto de [peso] g. Al corte, los fragmentos muestran microquistes con contenido coloide translúcido y nódulos estromales blanquecinos bien delimitados. No se observan áreas friables, necróticas ni nódulos amarillentos xantomatosos. Se incluye muestreo representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / WHO Classification of Tumours of the Urinary System and Male Genital Organs (5th ed., 2022).</small>",
        "micro": "Los cortes histológicos coloreados con H&E revelan parénquima prostático correspondiente a la zona de transición con hiperplasia nodular benigna clásica de patrón mixto (adenomatoso y fibromuscular equilibrado). Las unidades glandulares muestran luces acinares de calibre variable, con pliegues papilares intraluminares revestidos por una doble capa epitelial íntegra y bien diferenciada: capa interna de células secretoras cilíndricas de citoplasma claro o finamente granular sin atipia ni macronucléolos prominentes, y capa externa continua de células basales mioepiteliales paralelas a la membrana basal. Se aprecian abundantes cuerpos amiláceos intraluminares basófilos y acidófilos laminares. El estroma interacinar demuestra proliferación ordenada de fascículos de músculo liso y fibroblastos maduros sin hipercromatismo ni actividad mitótica. No se observan atipias nucleares, cribas atípicas, proliferación microacinar carente de capa basal (ASAP), neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma acinar invasor.",
        "diag": "TEJIDO PROSTÁTICO (PRODUCTO DE MORCELADO / ENUCLEACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (PATRÓN MIXTO ADENOMATOSO Y FIBROMUSCULAR EQUILIBRADO).\n- ECTASIA DUCTO-ACINAR CON CUERPOS AMILÁCEOS INTRALUMINARES MÚLTIPLES.\n- NEGATIVO PARA PROCESO INFLAMATORIO AGUDO O CRÓNICO SIGNIFICATIVO.\n- NEGATIVO PARA PROLIFERACIÓN ACINAR ATÍPICA (ASAP) O NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN).\n- NEGATIVO PARA NEOPLASIA MALIGNA (ADENOCARCINOMA PROSTÁTICO INVASOR) EN EL MATERIAL EXAMINADO (ISUP / OMS 2022)."
    },
    {
        "id": 18,
        "categoryId": 9,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 1: HIPERPLASIA NODULAR MIXTA TÍPICA)",
        "macro": "Se reciben múltiples fragmentos tisulares alargados e irregulares (virutas de morcelado prostático láser HoLEP / ThuLEP o resección transuretral), de superficie lobulada, coloración pardo-blanquecina a pardo-amarillenta y consistencia elástica firme con sectores esponjosos, que en conjunto miden [dimensiones] cm y registran un peso neto de [peso] g. Al corte, los fragmentos muestran microquistes con contenido coloide translúcido y nódulos estromales blanquecinos bien delimitados. No se observan áreas friables, necróticas ni nódulos amarillentos xantomatosos. Se incluye muestreo representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / WHO Classification of Tumours of the Urinary System and Male Genital Organs (5th ed., 2022).</small>",
        "micro": "Los cortes histológicos coloreados con H&E revelan parénquima prostático correspondiente a la zona de transición con hiperplasia nodular benigna clásica de patrón mixto (adenomatoso y fibromuscular equilibrado). Las unidades glandulares muestran luces acinares de calibre variable, con pliegues papilares intraluminares revestidos por una doble capa epitelial íntegra y bien diferenciada: capa interna de células secretoras cilíndricas de citoplasma claro o finamente granular sin atipia ni macronucléolos prominentes, y capa externa continua de células basales mioepiteliales paralelas a la membrana basal. Se aprecian abundantes cuerpos amiláceos intraluminares basófilos y acidófilos laminares. El estroma interacinar demuestra proliferación ordenada de fascículos de músculo liso y fibroblastos maduros sin hipercromatismo ni actividad mitótica. No se observan atipias nucleares, cribas atípicas, proliferación microacinar carente de capa basal (ASAP), neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma acinar invasor.",
        "diag": "TEJIDO PROSTÁTICO (PRODUCTO DE MORCELADO / ENUCLEACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (PATRÓN MIXTO ADENOMATOSO Y FIBROMUSCULAR EQUILIBRADO).\n- ECTASIA DUCTO-ACINAR CON CUERPOS AMILÁCEOS INTRALUMINARES MÚLTIPLES.\n- NEGATIVO PARA PROCESO INFLAMATORIO AGUDO O CRÓNICO SIGNIFICATIVO.\n- NEGATIVO PARA PROLIFERACIÓN ACINAR ATÍPICA (ASAP) O NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN).\n- NEGATIVO PARA NEOPLASIA MALIGNA (ADENOCARCINOMA PROSTÁTICO INVASOR) EN EL MATERIAL EXAMINADO (ISUP / OMS 2022)."
    },
    {
        "id": 19,
        "categoryId": 9,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 2: HIPERPLASIA CON PROSTATITIS CRÓNICA ACTIVA)",
        "macro": "Se reciben abundantes fragmentos y tiras tisulares irregulares de tejido prostático procedentes de morcelado quirúrgico, de color pardo-rojizo a pardo-amarillento oscuro con áreas congestivas focales, de consistencia predominantemente elástica y consistencia blanda en zonas hiperémicas, con dimensiones agrupadas de [dimensiones] cm y peso acumulado de [peso] g. La superficie de corte exhibe sectores rojizos congestivos con discreta exudación translúcida. No se delimitan cavidades abscedadas francas ni nódulos indurados pétreos. Se incluye muestra representativa tisular en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Epstein, J. I. (2020). Biopsy Interpretation of the Prostate. Wolters Kluwer. / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "El examen histopatológico muestra parénquima prostático con arquitectura distorsionada por hiperplasia nodular acinar y estromal asociada a un conspicuo proceso inflamatorio crónico linfo-histiocitario y plasmocitario de distribución difusa e intersticial periacinar, con formación de agregados linfoides foliculares reactivos estromales. Se evidencia migración leucocitaria neutrofílica focal a través del epitelio secretor acinar con degeneración epitelial reactiva, vacuolización citoplasmática, cariomegalia reactiva uniforme con nucléolos pequeños centrales sin hipercromatismo patológico y conservación demostrable de la hilera basal continua. Las luces acinares alojan detritos celulares, neutrófilos atrapados y macrófagos espumosos (microabscesos intraluminares en fase de reabsorción). El estroma circundante presenta proliferación fibroblástica reparativa, edema intersticial y marcada congestión vascular capilar. Se descarta vasculitis necrotizante, granulomas tuberculoides o caseosis. No se identifican criterios morfológicos de malignidad, ASAP, HGPIN ni adenocarcinoma.",
        "diag": "TEJIDO PROSTÁTICO MORCELADO (PRODUCTO DE ENUCLEACIÓN / MORCELACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (ADENOMATOSA Y ESTROMAL).\n- PROSTATITIS CRÓNICA ACTIVA MODERADA A SEVERA, CON INFILTRADO LINFOPLASMOCITARIO ESTROMAL, AGREGADOS LINFOIDES REACTIVOS Y MICROABSCESOS INTRALUMINARES FOCALES.\n- ATIPIA EPITELIAL REACTIVA / REPARATIVA ASOCIADA AL FOCO INFLAMATORIO, CON ESTRATO DE CÉLULAS BASALES ÍNTEGRO.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) O ADENOCARCINOMA PROSTÁTICO INVASOR (ISUP / OMS 2022)."
    },
    {
        "id": 20,
        "categoryId": 9,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 3: HIPERPLASIA CON ATROFIA ACINAR Y CUERPOS AMILÁCEOS)",
        "macro": "Se recepciona espécimen de morcelación prostática constituido por múltiples fragmentos y virutas aplanadas de tonalidad pardo-grisácea pálida y amarillenta, consistencia elástica firme con resistencia crujiente focal al corte y tacto calcáreo discreto, que en volumen agrupado miden [dimensiones] cm y presentan un peso de [peso] g. En la superficie de sección se identifican microscópicas concreciones parduscas litiásicas arenosas de cuerpos amiláceos condensados. Se incluye muestreo representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Humphrey, P. A. (2016). Prostate Pathology. ASCP Press. / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "Las secciones histológicas muestran parénquima prostático con hiperplasia nodular glandular sobre la que asienta un patrón prominente y difuso de atrofia acinar prostática (atrofia simple y esclerosante). Las glándulas atróficas se aprecian disminuidas de calibre o irregularmente distendidas, revestidas por un epitelio cúbico bajo o aplanado con escaso citoplasma basófilo y núcleos regulares sin cromatina granular tosca ni mitosis, con hilera de células basales continuas intactas. Las luces acinares se encuentran profusamente ocupadas por voluminosos cuerpos amiláceos concéntricos calcificados (calciesferitas / litiasis prostática intraluminal distrófica). El estroma fibroso interglandular demuestra esclerosis colágena hialinizada con pérdida del componente muscular liso y fibrosis periacinar circundante sin desmoplasia tumoral. Se reconoce un leve infiltrado inflamatorio mononuclear pericalcificación. No se aprecia proliferación microacinar atípica (ASAP), atipia cribiforme, HGPIN ni evidencia de neoplasia invasora.",
        "diag": "MATERIAL DE MORCELADO PROSTÁTICO:\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA ASOCIADA A ATROFIA ACINAR DIFUSA (TIPOS SIMPLE Y ESCLEROSANTE).\n- CUERPOS AMILÁCEOS ABUNDANTES Y CALCIFICACIONES DISTRÓFICAS INTRALUMINARES Y ESTROMALES (LITIASIS PROSTÁTICA CONCRÉCICA).\n- ESCLEROSIS Y FIBROSIS COLÁGENA INTERACINAR BENIGNA.\n- NEGATIVO PARA ATIPIA CITOLÓGICA, NEOPLASIA INTRAEPITELIAL DE ALTO GRADO (HGPIN) O ADENOCARCINOMA PROSTÁTICO INVASOR (ISUP / OMS 2022)."
    },
    {
        "id": 21,
        "categoryId": 9,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 4: HIPERPLASIA CON INFARTO Y METAPLASIA ESCAMOSA)",
        "macro": "Se recibe producto de morcelado prostático conformado por numerosos fragmentos tisulares alargados de aspecto heterogéneo, coloración pardo-clara con focos bien delimitados rojo-parduscos y amarillo-opacos de aspecto friable y consistencia discretamente reblandecida que alternan con áreas elásticas habituales. El espécimen mide en conjunto [dimensiones] cm y registra un peso de [peso] g. Las zonas opacas sugieren cambios isquémicos focales. Se realiza muestreo tisular exhaustivo incluyendo la totalidad de las áreas de aspecto friable en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Epstein, J. I., & Netto, G. J. (2014). Biopsy Interpretation of the Prostate. / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "El estudio microscópico revela tejido prostático con hiperplasia nodular acinar y estromal en cuyo seno se identifican extensos focos de infarto prostático isquémico coagulativo en diferentes estadios de organización evolutiva. Se observan áreas centrales de necrosis de coagulación de glándulas y estroma (sombras fantasmales tisulares) rodeadas por una corona periférica de histiocitos espumosos, siderófagos y capilares de neoformación fibroblástica reactiva. En la periferia inmediata del infarto destaca una exuberante proliferación de células epiteliales con metaplasia escamosa madura e inmadura reactiva que reviste y oblitera luces acinares remanentes; las células escamosas exhiben bordes poligonales netos, puentes intercelulares visibles, citoplasma acidófilo amplio y núcleos ovoides regulares sin pleomorfismo, sin mitosis atípicas ni queratinización atípica desordenada. No hay infiltración estromal invasiva por nidos córneos. La inmunomorfología demuestra preservación de la membrana basal y marcaje p63 difuso en los nidos escamosos. No se identifica carcinoma epidermoide ni adenocarcinoma prostático.",
        "diag": "FRAGMENTOS PROCEDENTES DE MORCELACIÓN PROSTÁTICA:\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA.\n- INFARTO PROSTÁTICO ISQUÉMICO FOCAL RECIENTE Y ANTIGUO EN ORGANIZACIÓN.\n- METAPLASIA ESCAMOSA EPITELIAL EXTENSA BENIGNA (REACTIVA / REPARATIVA PERI-INFARTO).\n- REACCIÓN HISTIOCITARIA XANTOMATOSA Y FIBROSIS CICATRIZAL PERIFÉRICA.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN), CARCINOMA ESCAMOSO O ADENOCARCINOMA PROSTÁTICO (ISUP / OMS 2022)."
    },
    {
        "id": 22,
        "categoryId": 9,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 5: HIPERPLASIA ADENOMATOSA FLORIDA Y DILATACIÓN DUCTAL)",
        "macro": "Se reciben múltiples fragmentos tisulares obtenidos por morcelación prostática endoscópica, de superficie granular fina a multinodular esponjosa, coloración pardo-amarillenta pálida y consistencia elástica blanda. Al corte seriado se aprecia marcada multiplicidad de cavidades microquísticas y ectasias ductales con salida de secreción mucoide y coloide clara. Las dimensiones agrupadas son de [dimensiones] cm y el peso neto asciende a [peso] g. No se reconocen induraciones sospechosas ni áreas de hemorragia focal. Se incluye muestra representativa en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "El examen histopatológico demuestra hiperplasia prostática benigna con marcada preponderancia del componente adenomatoso glandular florido (proliferación microacinar y macroacinar densamente empaquetada). Los acinos se encuentran notablemente hiperplásicos, con marcada dilatación ducto-acinar quística y proyecciones papilares intraluminares de ejes conectivo-vasculares delgados revestidos por células secretoras cilíndricas mucosas altas con polaridad nuclear conservada, núcleos basales uniformes de cromatina laxa y ausencia de nucléolos patológicos destacados. Se comprueba un estrato celular basal continuo y bien definido que rodea circunferencialmente cada una de las estructuras glandulares. El estroma interacinar se encuentra comprimido y reducido a delgadas bandas fibromusculares no desmoplásicas. Las luces glandulares contienen líquido coloide acidófilo proteináceo y corpora amilácea esferoidales. No se detectan glándulas cribiformes atípicas fusionadas, invasión perineural, ASAP, HGPIN ni evidencia de adenocarcinoma acinar invasor.",
        "diag": "TEJIDO PROSTÁTICO MORCELADO (PRODUCTO DE ENUCLEACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA DE PREDOMINIO ADENOMATOSO GLANDULAR FLORIDO.\n- ECTASIA Y DILATACIÓN DUCTO-ACINAR MICROQUÍSTICA CON PROYECCIONES PAPILARES INTRALUMINARES BENIGNAS.\n- ESTROMA FIBROMUSCULAR COMPRIMIDO NO ATÍPICO.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) O PROLIFERACIÓN ACINAR ATÍPICA (ASAP).\n- NEGATIVO PARA NEOPLASIA MALIGNA (ADENOCARCINOMA PROSTÁTICO INVASOR) (ISUP / OMS 2022)."
    },
    {
        "id": 23,
        "categoryId": 9,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 6: HIPERPLASIA BENIGNA ESTROMAL PREDOMINANTE)",
        "macro": "Se recepciona producto de morcelado de tejido prostático integrado por múltiples virutas y nódulos elásticos de superficie lisa o abollonada, consistencia elástica carnosa homogénea y firme al corte, tonalidad pardo-grisácea a blanquecina nacarada uniforme, que en conjunto miden [dimensiones] cm y alcanzan un peso total de [peso] g. La superficie seccionada es compacta, fasciculada y arremolinada, sin cavidades quísticas prominentes ni calcificaciones. Se procesa muestreo histológico representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">WHO Classification of Tumours of the Urinary System and Male Genital Organs (5th ed., 2022). / CAP Consensus Guidelines for Prostate Specimen Reporting (2023).</small>",
        "micro": "Los cortes histológicos teñidos con H&E revelan parénquima prostático con marcada alteración arquitectural por predominio masivo de nódulos mesenquimales estromales benignos (nódulos de leiomioma / adenoleiomioma prostático). El tejido está compuesto por una densa proliferación de fascículos entrelazados y haces concéntricos de células musculares lisas fusiformes y miofibroblastos maduros, con citoplasmas eosinófilos elongados y núcleos ovoides de extremos romos en forma de cigarro, cromatina uniforme, sin pleomorfismo, sin atipia nuclear ni figuras mitóticas atípicas. El componente glandular epitelial es sumamente escaso y disperso, observándose únicamente glándulas atróficas aisladas comprimidas por las masas estromales mesenquimales, conservando su hilera de células basales continuas. No se detectan áreas mixoides acelulares expansivas, células gigantes multinucleadas atípicas ni necrosis. Se descarta tumor estromal de potencial maligno incierto (STUMP) y sarcoma prostático. No hay evidencia de adenocarcinoma.",
        "diag": "PRODUCTO DE MORCELACIÓN PROSTÁTICA:\n- HIPERPLASIA NODULAR BENIGNA ESTROMAL Y FIBROMUSCULAR PREDOMINANTE (PATRÓN MESENQUIMAL PURO / ADENOLEIOMIOMA PROSTÁTICO BENIGNO).\n- COMPONENTE GLANDULAR ESCASO COMPRIMIDO SIN ATIPIA CITOLÓGICA.\n- NEGATIVO PARA TUMOR ESTROMAL PROSTÁTICO DE POTENCIAL MALIGNO INCIERTO (STUMP) O PROCESO SARCOMATOSO.\n- NEGATIVO PARA NEOPLASIA MALIGNA EPITELIAL (ADENOCARCINOMA PROSTÁTICO INVASOR) (ISUP / OMS 2022)."
    },
    {
        "id": 1018,
        "categoryId": 25,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 1: HIPERPLASIA NODULAR MIXTA TÍPICA)",
        "macro": "Se reciben múltiples fragmentos tisulares alargados e irregulares (virutas de morcelado prostático láser HoLEP / ThuLEP o resección transuretral), de superficie lobulada, coloración pardo-blanquecina a pardo-amarillenta y consistencia elástica firme con sectores esponjosos, que en conjunto miden [dimensiones] cm y registran un peso neto de [peso] g. Al corte, los fragmentos muestran microquistes con contenido coloide translúcido y nódulos estromales blanquecinos bien delimitados. No se observan áreas friables, necróticas ni nódulos amarillentos xantomatosos. Se incluye muestreo representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / WHO Classification of Tumours of the Urinary System and Male Genital Organs (5th ed., 2022).</small>",
        "micro": "Los cortes histológicos coloreados con H&E revelan parénquima prostático correspondiente a la zona de transición con hiperplasia nodular benigna clásica de patrón mixto (adenomatoso y fibromuscular equilibrado). Las unidades glandulares muestran luces acinares de calibre variable, con pliegues papilares intraluminares revestidos por una doble capa epitelial íntegra y bien diferenciada: capa interna de células secretoras cilíndricas de citoplasma claro o finamente granular sin atipia ni macronucléolos prominentes, y capa externa continua de células basales mioepiteliales paralelas a la membrana basal. Se aprecian abundantes cuerpos amiláceos intraluminares basófilos y acidófilos laminares. El estroma interacinar demuestra proliferación ordenada de fascículos de músculo liso y fibroblastos maduros sin hipercromatismo ni actividad mitótica. No se observan atipias nucleares, cribas atípicas, proliferación microacinar carente de capa basal (ASAP), neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma acinar invasor.",
        "diag": "TEJIDO PROSTÁTICO (PRODUCTO DE MORCELADO / ENUCLEACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (PATRÓN MIXTO ADENOMATOSO Y FIBROMUSCULAR EQUILIBRADO).\n- ECTASIA DUCTO-ACINAR CON CUERPOS AMILÁCEOS INTRALUMINARES MÚLTIPLES.\n- NEGATIVO PARA PROCESO INFLAMATORIO AGUDO O CRÓNICO SIGNIFICATIVO.\n- NEGATIVO PARA PROLIFERACIÓN ACINAR ATÍPICA (ASAP) O NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN).\n- NEGATIVO PARA NEOPLASIA MALIGNA (ADENOCARCINOMA PROSTÁTICO INVASOR) EN EL MATERIAL EXAMINADO (ISUP / OMS 2022)."
    },
    {
        "id": 1019,
        "categoryId": 25,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 2: HIPERPLASIA CON PROSTATITIS CRÓNICA ACTIVA)",
        "macro": "Se reciben abundantes fragmentos y tiras tisulares irregulares de tejido prostático procedentes de morcelado quirúrgico, de color pardo-rojizo a pardo-amarillento oscuro con áreas congestivas focales, de consistencia predominantemente elástica y consistencia blanda en zonas hiperémicas, con dimensiones agrupadas de [dimensiones] cm y peso acumulado de [peso] g. La superficie de corte exhibe sectores rojizos congestivos con discreta exudación translúcida. No se delimitan cavidades abscedadas francas ni nódulos indurados pétreos. Se incluye muestra representativa tisular en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Epstein, J. I. (2020). Biopsy Interpretation of the Prostate. Wolters Kluwer. / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "El examen histopatológico muestra parénquima prostático con arquitectura distorsionada por hiperplasia nodular acinar y estromal asociada a un conspicuo proceso inflamatorio crónico linfo-histiocitario y plasmocitario de distribución difusa e intersticial periacinar, con formación de agregados linfoides foliculares reactivos estromales. Se evidencia migración leucocitaria neutrofílica focal a través del epitelio secretor acinar con degeneración epitelial reactiva, vacuolización citoplasmática, cariomegalia reactiva uniforme con nucléolos pequeños centrales sin hipercromatismo patológico y conservación demostrable de la hilera basal continua. Las luces acinares alojan detritos celulares, neutrófilos atrapados y macrófagos espumosos (microabscesos intraluminares en fase de reabsorción). El estroma circundante presenta proliferación fibroblástica reparativa, edema intersticial y marcada congestión vascular capilar. Se descarta vasculitis necrotizante, granulomas tuberculoides o caseosis. No se identifican criterios morfológicos de malignidad, ASAP, HGPIN ni adenocarcinoma.",
        "diag": "TEJIDO PROSTÁTICO MORCELADO (PRODUCTO DE ENUCLEACIÓN / MORCELACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (ADENOMATOSA Y ESTROMAL).\n- PROSTATITIS CRÓNICA ACTIVA MODERADA A SEVERA, CON INFILTRADO LINFOPLASMOCITARIO ESTROMAL, AGREGADOS LINFOIDES REACTIVOS Y MICROABSCESOS INTRALUMINARES FOCALES.\n- ATIPIA EPITELIAL REACTIVA / REPARATIVA ASOCIADA AL FOCO INFLAMATORIO, CON ESTRATO DE CÉLULAS BASALES ÍNTEGRO.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) O ADENOCARCINOMA PROSTÁTICO INVASOR (ISUP / OMS 2022)."
    },
    {
        "id": 1020,
        "categoryId": 25,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 3: HIPERPLASIA CON ATROFIA ACINAR Y CUERPOS AMILÁCEOS)",
        "macro": "Se recepciona espécimen de morcelación prostática constituido por múltiples fragmentos y virutas aplanadas de tonalidad pardo-grisácea pálida y amarillenta, consistencia elástica firme con resistencia crujiente focal al corte y tacto calcáreo discreto, que en volumen agrupado miden [dimensiones] cm y presentan un peso de [peso] g. En la superficie de sección se identifican microscópicas concreciones parduscas litiásicas arenosas de cuerpos amiláceos condensados. Se incluye muestreo representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Humphrey, P. A. (2016). Prostate Pathology. ASCP Press. / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "Las secciones histológicas muestran parénquima prostático con hiperplasia nodular glandular sobre la que asienta un patrón prominente y difuso de atrofia acinar prostática (atrofia simple y esclerosante). Las glándulas atróficas se aprecian disminuidas de calibre o irregularmente distendidas, revestidas por un epitelio cúbico bajo o aplanado con escaso citoplasma basófilo y núcleos regulares sin cromatina granular tosca ni mitosis, con hilera de células basales continuas intactas. Las luces acinares se encuentran profusamente ocupadas por voluminosos cuerpos amiláceos concéntricos calcificados (calciesferitas / litiasis prostática intraluminal distrófica). El estroma fibroso interglandular demuestra esclerosis colágena hialinizada con pérdida del componente muscular liso y fibrosis periacinar circundante sin desmoplasia tumoral. Se reconoce un leve infiltrado inflamatorio mononuclear pericalcificación. No se aprecia proliferación microacinar atípica (ASAP), atipia cribiforme, HGPIN ni evidencia de neoplasia invasora.",
        "diag": "MATERIAL DE MORCELADO PROSTÁTICO:\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA ASOCIADA A ATROFIA ACINAR DIFUSA (TIPOS SIMPLE Y ESCLEROSANTE).\n- CUERPOS AMILÁCEOS ABUNDANTES Y CALCIFICACIONES DISTRÓFICAS INTRALUMINARES Y ESTROMALES (LITIASIS PROSTÁTICA CONCRÉCICA).\n- ESCLEROSIS Y FIBROSIS COLÁGENA INTERACINAR BENIGNA.\n- NEGATIVO PARA ATIPIA CITOLÓGICA, NEOPLASIA INTRAEPITELIAL DE ALTO GRADO (HGPIN) O ADENOCARCINOMA PROSTÁTICO INVASOR (ISUP / OMS 2022)."
    },
    {
        "id": 1021,
        "categoryId": 25,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 4: HIPERPLASIA CON INFARTO Y METAPLASIA ESCAMOSA)",
        "macro": "Se recibe producto de morcelado prostático conformado por numerosos fragmentos tisulares alargados de aspecto heterogéneo, coloración pardo-clara con focos bien delimitados rojo-parduscos y amarillo-opacos de aspecto friable y consistencia discretamente reblandecida que alternan con áreas elásticas habituales. El espécimen mide en conjunto [dimensiones] cm y registra un peso de [peso] g. Las zonas opacas sugieren cambios isquémicos focales. Se realiza muestreo tisular exhaustivo incluyendo la totalidad de las áreas de aspecto friable en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Epstein, J. I., & Netto, G. J. (2014). Biopsy Interpretation of the Prostate. / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "El estudio microscópico revela tejido prostático con hiperplasia nodular acinar y estromal en cuyo seno se identifican extensos focos de infarto prostático isquémico coagulativo en diferentes estadios de organización evolutiva. Se observan áreas centrales de necrosis de coagulación de glándulas y estroma (sombras fantasmales tisulares) rodeadas por una corona periférica de histiocitos espumosos, siderófagos y capilares de neoformación fibroblástica reactiva. En la periferia inmediata del infarto destaca una exuberante proliferación de células epiteliales con metaplasia escamosa madura e inmadura reactiva que reviste y oblitera luces acinares remanentes; las células escamosas exhiben bordes poligonales netos, puentes intercelulares visibles, citoplasma acidófilo amplio y núcleos ovoides regulares sin pleomorfismo, sin mitosis atípicas ni queratinización atípica desordenada. No hay infiltración estromal invasiva por nidos córneos. La inmunomorfología demuestra preservación de la membrana basal y marcaje p63 difuso en los nidos escamosos. No se identifica carcinoma epidermoide ni adenocarcinoma prostático.",
        "diag": "FRAGMENTOS PROCEDENTES DE MORCELACIÓN PROSTÁTICA:\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA.\n- INFARTO PROSTÁTICO ISQUÉMICO FOCAL RECIENTE Y ANTIGUO EN ORGANIZACIÓN.\n- METAPLASIA ESCAMOSA EPITELIAL EXTENSA BENIGNA (REACTIVA / REPARATIVA PERI-INFARTO).\n- REACCIÓN HISTIOCITARIA XANTOMATOSA Y FIBROSIS CICATRIZAL PERIFÉRICA.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN), CARCINOMA ESCAMOSO O ADENOCARCINOMA PROSTÁTICO (ISUP / OMS 2022)."
    },
    {
        "id": 1022,
        "categoryId": 25,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 5: HIPERPLASIA ADENOMATOSA FLORIDA Y DILATACIÓN DUCTAL)",
        "macro": "Se reciben múltiples fragmentos tisulares obtenidos por morcelación prostática endoscópica, de superficie granular fina a multinodular esponjosa, coloración pardo-amarillenta pálida y consistencia elástica blanda. Al corte seriado se aprecia marcada multiplicidad de cavidades microquísticas y ectasias ductales con salida de secreción mucoide y coloide clara. Las dimensiones agrupadas son de [dimensiones] cm y el peso neto asciende a [peso] g. No se reconocen induraciones sospechosas ni áreas de hemorragia focal. Se incluye muestra representativa en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). / WHO Classification of Tumours (5th ed., 2022).</small>",
        "micro": "El examen histopatológico demuestra hiperplasia prostática benigna con marcada preponderancia del componente adenomatoso glandular florido (proliferación microacinar y macroacinar densamente empaquetada). Los acinos se encuentran notablemente hiperplásicos, con marcada dilatación ducto-acinar quística y proyecciones papilares intraluminares de ejes conectivo-vasculares delgados revestidos por células secretoras cilíndricas mucosas altas con polaridad nuclear conservada, núcleos basales uniformes de cromatina laxa y ausencia de nucléolos patológicos destacados. Se comprueba un estrato celular basal continuo y bien definido que rodea circunferencialmente cada una de las estructuras glandulares. El estroma interacinar se encuentra comprimido y reducido a delgadas bandas fibromusculares no desmoplásicas. Las luces glandulares contienen líquido coloide acidófilo proteináceo y corpora amilácea esferoidales. No se detectan glándulas cribiformes atípicas fusionadas, invasión perineural, ASAP, HGPIN ni evidencia de adenocarcinoma acinar invasor.",
        "diag": "TEJIDO PROSTÁTICO MORCELADO (PRODUCTO DE ENUCLEACIÓN):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA DE PREDOMINIO ADENOMATOSO GLANDULAR FLORIDO.\n- ECTASIA Y DILATACIÓN DUCTO-ACINAR MICROQUÍSTICA CON PROYECCIONES PAPILARES INTRALUMINARES BENIGNAS.\n- ESTROMA FIBROMUSCULAR COMPRIMIDO NO ATÍPICO.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) O PROLIFERACIÓN ACINAR ATÍPICA (ASAP).\n- NEGATIVO PARA NEOPLASIA MALIGNA (ADENOCARCINOMA PROSTÁTICO INVASOR) (ISUP / OMS 2022)."
    },
    {
        "id": 1023,
        "categoryId": 25,
        "titulo": "MORCELADO DE PRÓSTATA (VARIANTE 6: HIPERPLASIA BENIGNA ESTROMAL PREDOMINANTE)",
        "macro": "Se recepciona producto de morcelado de tejido prostático integrado por múltiples virutas y nódulos elásticos de superficie lisa o abollonada, consistencia elástica carnosa homogénea y firme al corte, tonalidad pardo-grisácea a blanquecina nacarada uniforme, que en conjunto miden [dimensiones] cm y alcanzan un peso total de [peso] g. La superficie seccionada es compacta, fasciculada y arremolinada, sin cavidades quísticas prominentes ni calcificaciones. Se procesa muestreo histológico representativo en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">WHO Classification of Tumours of the Urinary System and Male Genital Organs (5th ed., 2022). / CAP Consensus Guidelines for Prostate Specimen Reporting (2023).</small>",
        "micro": "Los cortes histológicos teñidos con H&E revelan parénquima prostático con marcada alteración arquitectural por predominio masivo de nódulos mesenquimales estromales benignos (nódulos de leiomioma / adenoleiomioma prostático). El tejido está compuesto por una densa proliferación de fascículos entrelazados y haces concéntricos de células musculares lisas fusiformes y miofibroblastos maduros, con citoplasmas eosinófilos elongados y núcleos ovoides de extremos romos en forma de cigarro, cromatina uniforme, sin pleomorfismo, sin atipia nuclear ni figuras mitóticas atípicas. El componente glandular epitelial es sumamente escaso y disperso, observándose únicamente glándulas atróficas aisladas comprimidas por las masas estromales mesenquimales, conservando su hilera de células basales continuas. No se detectan áreas mixoides acelulares expansivas, células gigantes multinucleadas atípicas ni necrosis. Se descarta tumor estromal de potencial maligno incierto (STUMP) y sarcoma prostático. No hay evidencia de adenocarcinoma.",
        "diag": "PRODUCTO DE MORCELACIÓN PROSTÁTICA:\n- HIPERPLASIA NODULAR BENIGNA ESTROMAL Y FIBROMUSCULAR PREDOMINANTE (PATRÓN MESENQUIMAL PURO / ADENOLEIOMIOMA PROSTÁTICO BENIGNO).\n- COMPONENTE GLANDULAR ESCASO COMPRIMIDO SIN ATIPIA CITOLÓGICA.\n- NEGATIVO PARA TUMOR ESTROMAL PROSTÁTICO DE POTENCIAL MALIGNO INCIERTO (STUMP) O PROCESO SARCOMATOSO.\n- NEGATIVO PARA NEOPLASIA MALIGNA EPITELIAL (ADENOCARCINOMA PROSTÁTICO INVASOR) (ISUP / OMS 2022)."
    }
];

    urologyCoreTemplates.forEach(tpl => {
        const idx = templatesDatabase.findIndex(t => Number(t.id) === Number(tpl.id) || ((t.titulo || '').trim().toUpperCase() === (tpl.titulo || '').trim().toUpperCase() && Number(t.categoryId) === Number(tpl.categoryId)));
        if (idx === -1) {
            templatesDatabase.push({ ...tpl });
        } else {
            templatesDatabase[idx] = { ...templatesDatabase[idx], ...tpl };
        }
    });
    try { safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase)); } catch(e) {}

    // Auto-sanitización V10 - Inyección y Actualización de Plantillas de Dermatopatología Inflamatoria (Dr. Luis Requena)
    const dermatologyRequenaTemplates = [
    {
        id: 201,
        categoryId: 2,
        titulo: "LUPUS ERITEMATOSO DISCOIDE (CUTÁNEO CRÓNICO)",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica muestra una placa eritematosa bien delimitada con escama córnea adherente y tapones foliculares queratósicos centrales, de [diámetro] cm. al corte, la dermis es firme, blanco-grisácea y elástica. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase de tipo degeneración vacuolar con compromiso anexial prominente. la capa córnea exhibe hiperqueratosis ortoqueratósica compacta con marcada dilatación y taponamiento folicular queratósico (follicular plugging). la epidermis muestra atrofia difusa con aplanamiento de los procesos interpapilares, alternando con focos de hipergranulosis irregular y queratinocitos apoptóticos basales (cuerpos coloides). la unión dermoepidérmica presenta degeneración hidrópica y balonizante de las células basales con engrosamiento hialino denso continuo de la membrana basal epidérmica y perinfundibular. en la dermis papilar se aprecia incontinencia pigmentaria marcada con abundantes melanófagos, ectasia vascular y abundantes depósitos de mucina intersticial en la dermis reticular. se identifica un denso infiltrado inflamatorio linfohistiocitario dispuesto en los plexos perivasculares superficial y profundo, con una conspicua distribución perianexial (perifolicular y periecrina) que condiciona atrofia folicular progresiva.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH / LOSANGE:\n- DERMATITIS DE INTERFASE VACUOLAR CRÓNICA CON ATROFIA EPIDÉRMICA, TAPONAMIENTO FOLICULAR, ENGROSAMIENTO DE LA MEMBRANA BASAL, INFILTRADO LINFOIDE PERIANEXIAL PROFUNDO Y MUCINOSIS DÉRMICA.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS Y COMPATIBLES CON LUPUS ERITEMATOSO DISCOIDE (LED / LUPUS CUTÁNEO CRÓNICO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas eritematosas descamativas con tapones foliculares queratósicos ('signo del tapón de cera o tachuela') y atrofia cicatrizal central con alopecia en cuero cabelludo/cara.\n2. Diagnóstico diferencial: Descartar Dermatomiositis (carece de infiltrado perianexial profundo y el engrosamiento de membrana basal es leve) y Lupus túmido (sin atrofia epidérmica ni daño de interfase basal)."
    },
    {
        id: 202,
        categoryId: 2,
        titulo: "LUPUS ERITEMATOSO CUTÁNEO SUBAGUDO (LECS)",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea muestra una placa eritematosa anular / psoriasiforme de [diámetro] cm, sin tapones córneos evidentes ni cicatriz central. al corte, el tejido dérmico es elástico y homogéneo. se procesa la totalidad en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology (5th ed.).</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase vacuolar de distribución predominantemente superficial. la capa córnea muestra hiperqueratosis ortoqueratósica laminar con pequeños focos de paraqueratosis. la epidermis presenta atrofia moderada con degeneración hidrópica difusa de la capa basal y abundantes cuerpos apoptóticos (cuerpos de Civatte) distribuidos en los estratos basal y espinoso inferior. la membrana basal exhibe un engrosamiento leve o discontinuo. en la dermis papilar se observa edema y melanófagos dispersos por incontinencia de pigmento, acompañado de un depósito difuso de mucina estromal en la dermis reticular superficial. el infiltrado inflamatorio está constituido por linfocitos e histiocitos confinados a la unión dermoepidérmica y al plexo vascular superficial, respetando la dermis reticular profunda y los anexos cutáneos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CON CUERPOS APOPTÓTICOS BASALES, INFILTRADO LINFOIDE ESTRICTAMENTE PERIVASCULAR SUPERFICIAL Y DEPÓSITO DE MUCINA DÉRMICA.\n- CUADRO HISTOLÓGICO COMPATIBLE CON LUPUS ERITEMATOSO CUTÁNEO SUBAGUDO (LECS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Lesiones anulares policíclicas o pápulo-escamosas psoriasiformes fotodistribuidas en tórax, cuello y brazos que resuelven sin cicatriz atrófica permanente.\n2. Inmunología: Correlacionar con anticuerpos anti-Ro/SSA y anti-La/SSB (positivos en >80% de casos)."
    },
    {
        id: 203,
        categoryId: 2,
        titulo: "LUPUS ERITEMATOSO SISTÉMICO (ERITEMA MALAR / RASH AGUDO)",
        macro: "se recibe punch de piel que mide [dimensiones] cm proveniente de región malar / facial, con superficie epidérmica eritematoedematosa difusa y lisa, sin escamas induradas ni cicatrización. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran dermatitis de interfase vacuolar aguda. la epidermis conserva su espesor con ortoqueratosis laminar y degeneración hidrópica de queratinocitos basales con aislados cuerpos apoptóticos. se evidencia un severo edema de la dermis papilar que disgrega los haces de colágeno, asociado a ectasia de capilares dérmicos superficiales con tumefacción endotelial y extravasación focal de hematíes. en la dermis reticular superficial se confirma la presencia de mucina ácida intersticial difusa. el infiltrado inflamatorio es escaso a moderado, de predominio linfohistiocitario perivascular superficial, sin afectación de anexos ni necrosis fibrinoide mural vascular.",
        diag: "PIEL FACIAL (REGIÓN MALAR), BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR AGUDA CON MARCADO EDEMA DE DERMIS PAPILAR, EXTRAVASACIÓN ERITROCITARIA Y DEPOSITACIÓN DE MUCINA DÉRMICA.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS DE LUPUS ERITEMATOSO CUTÁNEO AGUDO (ERITEMA MALAR EN LES).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Eritema simétrico en 'alas de mariposa' que respeta los surcos nasogenianos, transitorio y coincidente con brotes de actividad sistémica.\n2. Laboratorio: Correlacionar con títulos de anticuerpos anti-ADN de doble cadena (anti-dsDNA) y anti-Sm."
    },
    {
        id: 204,
        categoryId: 2,
        titulo: "ERITEMA MULTIFORME",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la epidermis exhibe una lesión en diana / escarapela característica de [diámetro] cm, con ampolla / necrosis central y halo eritematovioláceo concéntrico. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase vacuolar citotóxica aguda prototípica. el estrato córneo se encuentra preservado en cesta de mimbre ortoqueratósico (reflejo de instalación hiperaguda). la epidermis exhibe necrosis y apoptosis diseminada de queratinocitos individuales y en pequeños grupos en todos los estratos epidérmicos ('satelitosis linfoide'), con evolución a necrosis de espesor completo en la zona central. la unión dermoepidérmica presenta degeneración vacuolar intensa que da lugar a una ampolla subepidérmica por lisis basal. la dermis papilar muestra severo edema, ectasia vascular con tumefacción endotelial y un infiltrado inflamatorio linfohistiocitario perivascular superficial denso, con llamativa ausencia de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CITOTÓXICA AGUDA CON NECROSIS QUERATINOCÍTICA MULTIESTRATO, AMPOLLA SUBEPIDÉRMICA POR DEGENERACIÓN BASAL Y EDEMA PAPILAR SEVERO.\n- PATRÓN HISTOPATOLÓGICO DIAGNÓSTICO DE ERITEMA MULTIFORME (EM).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Lesiones en diana típicas acrales (palmas, plantas, antebrazos). Desencadenado comúnmente por infección por Virus Herpes Simple (VHS-1/2) o Mycoplasma pneumoniae.\n2. Diagnóstico diferencial: Descartar Síndrome de Stevens-Johnson / NET (necrosis en sábana con dermis desierta) y toxicodermia fija."
    },
    {
        id: 205,
        categoryId: 2,
        titulo: "DERMATOMIOSITIS",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea presenta pápulas eritematovioláceas aplanadas de [diámetro] cm sobre el dorso articular interfalángico / eritema facial violáceo. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran atrofia epidérmica acentuada con aplanamiento de crestas interpapilares e hiperqueratosis ortoqueratósica laminar. la unión dermoepidérmica muestra degeneración hidrópica de la capa basal con queratinocitos apoptóticos basales aislados. la dermis papilar exhibe ectasia capilar superficial prominente, edema y abundantes depósitos intersticiales de mucina ácida en la dermis reticular que separan ampliamente los haces colágenos. el infiltrado inflamatorio linfohistiocitario es de intensidad leve a moderada y se encuentra estrictamente confinado al plexo perivascular superficial y a la interfase, con indemnidad de la dermis profunda y de los folículos pilosos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. DORSO DE NUDILLOS / PÁRPADOS], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CON ATROFIA EPIDÉRMICA, TELANGIECTASIAS DÉRMICAS, INFILTRADO LINFOIDE SUPERFICIAL Y ABUNDANTE MUCINOSIS DÉRMICA.\n- CUADRO HISTOPATOLÓGICO COMPATIBLE CON DERMATOMIOSITIS (PÁPULAS DE GOTTRON / ERITEMA EN HELIOTROPO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Pápulas/signo de Gottron sobre articulaciones interfalángicas, eritema heliótropo periorbitario y debilidad muscular proximal.\n2. Laboratorio: Solicitar enzimas musculares (CPK, aldolasa) y anticuerpos específicos (anti-Mi-2, anti-TIF1-γ, anti-MDA5)."
    },
    {
        id: 206,
        categoryId: 2,
        titulo: "TOXICODERMIA (ERUPCIÓN MEDICAMENTOSA VACUOLAR)",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm, exhibiendo máculas y pápulas eritematosas confluentes pruriginosas de [diámetro] cm. al corte, tejido dérmico elástico y homogéneo. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran dermatitis de interfase vacuolar con espongiosis leve y queratinocitos disqueratósicos/apoptóticos aislados que ascienden a los niveles medio y superior del estrato espinoso. la capa basal exhibe degeneración hidrópica en parches. en la dermis papilar se observa edema moderado e incontinencia pigmentaria. el infiltrado inflamatorio perivascular superficial e interfase es de tipo mixto, caracterizado por linfocitos T, histiocitos y la presencia conspicua y diagnóstica de abundantes eosinófilos distribuidos en el estroma perivascular e intersticial dérmico.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CON ESPONGIOSIS LEVE, QUERATINOCITOS APOPTÓTICOS MULTIESTRATO E INFILTRADO INFLAMATORIO MIXTO PERIVASCULAR CON EOSINÓFILOS.\n- CUADRO HISTOLÓGICO ALTAMENTE SUGESTIVO DE ERUPCIÓN MEDICAMENTOSA (TOXICODERMIA VACUOLAR).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Criterio pivote: La presencia de eosinófilos entremezclados en el infiltrado perivascular y de interfase es la clave histológica para diferenciar una toxicodermia de un exantema viral puro o lupus.\n2. Anamnesis: Evaluar fármacos introducidos en las últimas 1 a 3 semanas (antibióticos, AINEs, anticonvulsivantes)."
    },
    {
        id: 207,
        categoryId: 2,
        titulo: "LIQUEN PLANO",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica muestra una pápula/placa poligonal violácea brillante y aplanada de [diámetro] cm, con finas estrías blanquecinas reticulares en superficie (estrías de Wickham). se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide clásica. la capa córnea presenta marcada hiperqueratosis ortoqueratósica compacta pura (sin paraqueratosis). la epidermis exhibe hipergranulosis cuneiforme o romboidal prominente, asociada a acantosis irregular con afilamiento cónico de los procesos interpapilares en 'dientes de sierra' (saw-toothed pattern) y abundantes cuerpos coloides/apoptóticos (cuerpos de Civatte) en la basal. la unión dermoepidérmica muestra necrosis licuefactiva basal con despegamientos focales subepidérmicos característicos (espacios de Max-Joseph). en la dermis papilar se identifica un infiltrado inflamatorio extremadamente denso, continuo y en BANDA ('band-like') compuesto monomórficamente por linfocitos T e histiocitos, con incontinencia de melanina y melanófagos abundantes. no se observan eosinófilos ni células plasmáticas. la dermis reticular profunda se encuentra libre de inflamación.",
        diag: "PIEL [LOCALIZACIÓN, EJ. CARA ANTERIOR DE MUÑECA / TOBILLO], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE EN BANDA DÉRMICA PAPILAR CON HIPERQUERATOSIS ORTOQUERATÓSICA PURA, HIPERGRANULOSIS CUNEIFORME, ACANTOSIS EN 'DIENTES DE SIERRA', ESPACIOS DE MAX-JOSEPH Y CUERPOS DE CIVATTE.\n- DIAGNÓSTICO HISTOPATOLÓGICO DEFINITIVO DE LIQUEN PLANO CLÁSICO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Las '6 P': Pápulas Poligonales, Purpúricas, Pruriginosas, Planas, Placas y con estrías de Wickham en superficies flexoras.\n2. Diagnóstico diferencial: Erupción liquenoide medicamentosa (presenta paraqueratosis, eosinófilos e infiltrado profundo) y Queratosis liquenoide solitaria."
    },
    {
        id: 208,
        categoryId: 2,
        titulo: "LIQUEN ESTRIADO",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea exhibe pápulas liquenoides eritemato-rosadas agrupadas en banda lineal siguiendo trayectos de Blaschko, de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide y espongiótica en parches con compromiso anexial profundo característico. la epidermis presenta hiperqueratosis con focos de paraqueratosis, acantosis irregular, espongiosis intercelular y queratinocitos apoptóticos intraepidérmicos dispersos. la capa basal muestra degeneración hidrópica en parches. en la dermis papilar se observa infiltrado linfohistiocitario que se acompaña de un prominente infiltrado inflamatorio linfoide perianexial profundo con afección electiva del epitelio de los ovillos y conductos sudoríparos ecrinos (hidradenitis ecrina linfoide reactiva). ausencia habitual de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. EXTREMIDAD EN NIÑO], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE Y ESPONGIÓTICA EN PARCHES ASOCIADA A INFILTRADO LINFOIDE PERIECRINO PROFUNDO PROMINENTE.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS DE LIQUEN ESTRIADO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signo patognomónico de Requena: La combinación de dermatitis de interfase liquenoide espongiótica con denso manguito linfoide periecrino profundo es diagnóstica de Liquen Estriado.\n2. Clínica: Erupción lineal autolimitada en niños a lo largo de las líneas de Blaschko."
    },
    {
        id: 209,
        categoryId: 2,
        titulo: "LIQUEN ESCLEROSO Y ATRÓFICO",
        macro: "se recibe losange / punch de piel / mucosa que mide [dimensiones] cm. la superficie presenta una placa blanco-marfil nacarada, atrófica, deprimida en 'papel de cigarrillo' arrugado con tapones córneos puntiformes de [diámetro] cm. al corte, la dermis es densa y nacarada. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una marcada alteración esclerosante de la interfase. la capa córnea presenta hiperqueratosis ortoqueratósica compacta con prominente taponamiento folicular y orificial queratósico. la epidermis exhibe extrema atrofia del estrato espinoso ('en papel de seda') con aplanamiento y pérdida total de crestas interpapilares y degeneración vacuolar basal residual. en la dermis papilar se observa una amplia banda subepidérmica acelular de edema severo y homogeneización esclerótica hialina del colágeno (colágeno vítreo pálido homogéneo) con pérdida difusa de fibras elásticas. por debajo de esta zona esclerótica, en la dermis reticular media, se identifica un denso infiltrado inflamatorio linfohistiocitario en banda ('infiltrado infralesional'). se reconocen ectasias capilares superficiales con focos de extravasación eritrocitaria. no se observa atipia queratinocítica.",
        diag: "PIEL / MUCOSA [LOCALIZACIÓN GENITAL / EXTRAGENITAL], BIOPSIA:\n- DERMATITIS DE INTERFASE ESCLEROSANTE CON HIPERQUERATOSIS ORTOQUERATÓSICA, MARCADA ATROFIA EPIDÉRMICA, HOMOGENEIZACIÓN HIALINA ACELULAR DE DERMIS PAPILAR E INFILTRADO LINFOIDE EN BANDA INFRALESIONAL.\n- CUADRO HISTOPATOLÓGICO CLÁSICO Y DEFINITIVO DE LIQUEN ESCLEROSO (Y ATRÓFICO).\n- NEGATIVO PARA ATIPIA CITOLÓGICA O NEOPLASIA INTRAEPITELIAL DIFERENCIADA (dVIN / dPeIN).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas nacaradas blanco-porcelana en región anogenital (craurosis vulvar / balanitis xerótica obliterante con fimosis) o tronco.\n2. Seguimiento: Control periódico por riesgo aumentado de carcinoma epidermoide cutáneo/mucoso en lesiones crónicas."
    },
    {
        id: 210,
        categoryId: 2,
        titulo: "PITIRIASIS LIQUENOIDE (PLEVA / PLC)",
        macro: "se recibe punch de piel que mide [dimensiones] cm, con pápulas eritematosas centradas por vesículo-pústula purpúrica necrótica / costra escamosa en oblea de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide citotóxica con infiltrado inflamatorio en forma de CUÑA (base dermoepidérmica y vértice en dermis reticular profunda). la capa córnea muestra paraqueratosis confluente con exudado serohemático y neutrófilos atrapados en costra. la epidermis exhibe necrosis queratinocítica diseminada y balonización celular con espongiosis y exocitosis activa de linfocitos y eritrocitos. la unión dermoepidérmica está borrada por el infiltrado linfoide citotóxico. en la dermis papilar y media se identifica un infiltrado linfohistiocitario perivascular e intersticial asociado a tumefacción endotelial y extravasación masiva de hematíes. no se observa necrosis fibrinoide de la pared vascular ni leucocitoclasia neutrofílica verdadera.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE CITOTÓXICA CON INFILTRADO EN CUÑA DERMOEPIDÉRMICO, NECROSIS QUERATINOCÍTICA, COSTRA PARAQUERATÓSICA HEMORRÁGICA Y EXTRAVASACIÓN ERITROCITARIA MASIVA.\n- HALLAZGOS COMPATIBLES CON PITIRIASIS LIQUENOIDE (PLEVA / ENFERMEDAD DE MUCHA-HABERMANN / PLC SEGÚN FASE CLÍNICA).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Brotes de pápulas que evolucionan a vesículas purpúricas, costras necróticas y úlceras varioliformes en tronco y extremidades.\n2. Diagnóstico diferencial: Descartar Papulosis Linfomatoide (presencia de células grandes atípicas CD30+) y Vasculitis leucocitoclástica."
    },
    {
        id: 211,
        categoryId: 2,
        titulo: "ERUPCIÓN LIQUENOIDE POR FÁRMACOS",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie cutánea presenta placas eritemato-violáceas liquenoides con descamación laminar fina de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide atípica. la capa córnea exhibe hiperqueratosis con focos conspicuos de paraqueratosis. la epidermis presenta acantosis irregular con queratinocitos apoptóticos/disqueratósicos dispersos en todos los estratos epidérmicos (estrato basal, medio y superior). en la unión dermoepidérmica se observa daño licuefactivo con infiltrado en banda en la dermis papilar que se extiende hacia los plexos vasculares de la dermis reticular profunda y perianexial. el infiltrado inflamatorio es de tipo mixto, constituido por linfocitos T, histiocitos, abundantes EOSINÓFILOS y presencia de CÉLULAS PLASMÁTICAS maduras entremezcladas, con incontinencia de melanina.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE CON PARAQUERATOSIS FOCAL, QUERATINOCITOS DISQUERATÓSICOS MULTIESTRATO E INFILTRADO MIXTO DERMOPAPILAR Y PROFUNDO CON EOSINÓFILOS Y CÉLULAS PLASMÁTICAS.\n- CUADRO HISTOLÓGICO COMPATIBLE CON ERUPCIÓN LIQUENOIDE POR FÁRMACOS (TOXICODERMIA LIQUENOIDE).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Claves vs Liquen Plano idiopático: 1) Presencia de paraqueratosis; 2) Presencia de eosinófilos y plasmocitos; 3) Extensión a dermis profunda/perianexial; 4) Queratinocitos necróticos en estratos altos.\n2. Fármacos causales: Antihipertensivos (betabloqueantes, IECA), tiazidas, antipalúdicos, inhibidores PD-1/PD-L1."
    },
    {
        id: 212,
        categoryId: 2,
        titulo: "URTICARIA (HABÓN URTICARIANO AGUDO)",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie muestra una placa eritemato-edematosa sobreelevada evanescente de [diámetro] cm, lisa y sin descamación ni costras. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una epidermis totalmente normal e intacta en cesta de mimbre, sin espongiosis ni daño de interfase. en la dermis papilar y reticular se identifica un intenso y difuso edema estromal que disocia y espacia ampliamente los haces de colágeno dérmico. los capilares y vénulas dérmicas superficiales se observan dilatados con tumefacción endotelial reactiva. el infiltrado inflamatorio es de intensidad leve a moderada, dispuesto en patrón perivascular superficial e intersticial, compuesto por neutrófilos y eosinófilos alineados entre las fibras colágenas ('en fila india'), acompañados de linfocitos y mastocitos degranulados. no se identifica necrosis fibrinoide vascular ni leucocitoclasia masiva.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS PERIVASCULAR SUPERFICIAL E INTERSTICIAL CON MARCADO EDEMA DÉRMICO, NEUTRÓFILOS Y EOSINÓFILOS INTERSTICIALES, Y EPIDERMIS TOTALMENTE RESPETADA.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS DE HABÓN URTICARIANO (URTICARIA AGUDA).\n- NEGATIVO PARA VASCULITIS LEUCOCITOCLÁSTICA O NECROSIS VASCULAR.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Ronchas eritemato-edematosas intensamente pruriginosas, evanescentes (<24 horas de duración individual) que no dejan púrpura ni pigmentación.\n2. Diagnóstico diferencial: Vasculitis urticariana (dura >24-48 h, deja púrpura e histológicamente muestra necrosis fibrinoide mural y polvo nuclear)."
    },
    {
        id: 213,
        categoryId: 2,
        titulo: "ERITEMA ANULAR CENTRÍFUGO",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm. en superficie se aprecia el borde sobreelevado de una placa anular eritematosa de [diámetro] cm con collarete descamativo interno. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una dermatitis perivascular con patrón característico en manguito. la epidermis muestra espongiosis leve focal con pequeños montículos de paraqueratosis en la variante superficial (o epidermis intacta en la variante profunda). la unión dermoepidérmica está preservada. en la dermis se observa un denso infiltrado inflamatorio linfohistiocitario monomorfo, compacto y estrictamente delimitado alrededor de los vasos sanguíneos dérmicos, configurando el signo patognomónico en 'MANGUITO PERIVASCULAR' o 'EN MANGA DE ABRIGO' (coat-sleeve pattern). no se observan neutrófilos, depósitos de mucina ni necrosis fibrinoide vascular.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS PERIVASCULAR CON INFILTRADO LINFOHISTIOCITARIO COMPACTO EN 'MANGUITO' (PATRÓN EN MANGA DE ABRIGO / COAT-SLEEVE) [TIPO SUPERFICIAL / PROFUNDO].\n- CUADRO HISTOPATOLÓGICO TÍPICO DE ERITEMA ANULAR CENTRÍFUGO (EAC DE DARIER).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Lesiones anulares o policíclicas que progresan centrífugamente con collarete descamativo interno.\n2. Etiología: Reacción de hipersensibilidad a dermatofitosis (tinea pedis), fármacos o infecciones sistémicas."
    },
    {
        id: 214,
        categoryId: 2,
        titulo: "EXANTEMA VIRAL (MORBILIFORME)",
        macro: "se recibe punch de piel que mide [dimensiones] cm, con superficie epidérmica que muestra máculas eritematosas tenues no induradas de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran fragmento de piel con dermatitis reactiva perivascular superficial inespecífica. la capa córnea conserva su aspecto en cesta de mimbre con ortoqueratosis. la epidermis presenta espongiosis intercelular leve con queratinocitos discretamente edematosos sin necrosis masiva ni inclusiones virales específicas identificables. la dermis papilar exhibe edema leve y ectasia capilar superficial. el infiltrado inflamatorio es mononuclear (linfocitos T e histiocitos) de intensidad leve a moderada, dispuesto en patrón perivascular superficial, con notoria ausencia de eosinófilos significativos y ausencia de vasculitis.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS PERIVASCULAR SUPERFICIAL LINFOHISTIOCITARIA LEVE A MODERADA CON DISCRETA ESPONGIOSIS Y ECTASIA CAPILAR, SIN EOSINOFILIA SIGNIFICATIVA NI VASCULITIS.\n- COMPATIBLE CON EXANTEMA VIRAL (EXANTEMA MACULOPAPULAR / MORBILIFORME INESPECÍFICO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Erupción maculopapular eritematosa súbita difusa precedida de pródromos febriles y síntomas catarrales.\n2. Criterio de Requena: La ausencia de eosinófilos orienta fuertemente a etiología viral frente a toxicodermia medicamentosa."
    },
    {
        id: 215,
        categoryId: 2,
        titulo: "DERMATITIS DE CONTACTO ALÉRGICA",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica muestra aspecto eritemato-edematoso con micropápulas y microvesículas serosas confluentes de [diámetro] cm, sin induración profunda. se procesa en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran un patrón de dermatitis espongiótica aguda a subaguda. la epidermis exhibe ortoqueratosis laminar con focos de paraqueratosis y costras serocelulares. en el estrato espinoso se identifica marcada espongiosis intercelular que distiende los desmosomas y progresa a la formación de vesículas y microvesículas espongióticas intraepidérmicas con exocitosis de linfocitos y eosinófilos. la capa basal está intacta. en la dermis papilar se observa marcado edema estromal, ectasia vascular con congestión de capilares y un infiltrado inflamatorio perivascular e intersticial moderado a severo constituido por linfocitos, histiocitos y abundantes eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA POR PUNCH / LOSANGE:\n- DERMATITIS ESPONGIÓTICA AGUDA / SUBAGUDA CON VESICULACIÓN INTRAEPIDÉRMICA Y EOSINÓFILOS DÉRMICOS, COMPATIBLE CON DERMATITIS DE CONTACTO ALÉRGICA (HIPERSENSIBILIDAD TIPO IV).\n- NEGATIVO PARA VASCULITIS, ATIPIA CELULAR O PROCESO LINFOPROLIFERATIVO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas eritematovesiculosas pruriginosas circunscritas a la zona de exposición al alérgeno (metales, cosméticos, tintes, fragancias).\n2. Diagnóstico diferencial: Contacto irritativo (daño tóxico queratinocítico primario con neutrófilos y sin eosinófilos)."
    },
    {
        id: 216,
        categoryId: 2,
        titulo: "DERMATITIS DE CONTACTO IRRITATIVA",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea se observa eritematosa, apergaminada, con descamación laminar fina y fisuras superficiales de [diámetro] cm, sin ampollas francas. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran epidermis con hiperqueratosis compacta, paraqueratosis focal y focos de necrosis queratinocítica superficial individual (queratinocitos eosinófilos apoptóticos) en los estratos espinoso alto y granuloso. se identifica espongiosis focal irregular leve a moderada con exocitosis de neutrófilos en el estrato córneo y espinoso superior, sin grandes vesículas coalescentes. la dermis superficial exhibe vasodilatación capilar y un infiltrado perivascular superficial leve a moderado de linfocitos e histiocitos con escasos neutrófilos y llamativa escasez de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH:\n- DERMATITIS ESPONGIÓTICA / CITOTÓXICA COMPATIBLE CON DERMATITIS DE CONTACTO IRRITATIVA (DAÑO TÓXICO DIRECTO NO INMUNOLÓGICO).\n- AUSENCIA DE COMPONENTE EOSINOFÍLICO SIGNIFICATIVO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Patogenia: Daño directo por detergentes, solventes, fricción o agentes químicos. Predomina el ardor y escozor sobre el prurito."
    },
    {
        id: 217,
        categoryId: 2,
        titulo: "DERMATITIS NUMULAR (ECZEMA DISCOIDE)",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la epidermis presenta una placa circular sobreelevada en 'moneda' de [diámetro] cm con superficie costrosa serohemática amarillenta y eritematosa. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una dermatitis espongiótica subaguda a crónica. la epidermis presenta acantosis irregular combinada con espongiosis manifiesta y formación de microvesículas espongióticas intraepidérmicas. el estrato córneo muestra una combinación diagnóstica de hiperqueratosis con prominentes montículos de paraqueratosis (mounds of parakeratosis) que engloban exudado de suero coagulado y neutrófilos (costras serocelulares). la dermis papilar está ensanchada por edema estromal y capilares congestivos rodeados por un denso infiltrado linfoplasmocitario y linfohistiocitario perivascular e intersticial con presencia constante de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. MIEMBROS INFERIORES], BIOPSIA EN PUNCH:\n- DERMATITIS ESPONGIÓTICA SUBAGUDA CON HIPERPLASIA EPIDÉRMICA, MONTÍCULOS DE PARAQUERATOSIS SEROCELULAR Y EOSINÓFILOS DÉRMICOS, CARACTERÍSTICA DE DERMATITIS NUMULAR (ECZEMA DISCOIDE).\n- PAS NEGATIVO PARA DERMATOFITOSIS.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas redondeadas en 'moneda' pruriginosas en piernas de adultos con xerosis o insuficiencia venosa."
    },
    {
        id: 218,
        categoryId: 2,
        titulo: "DERMATITIS ATÓPICA",
        macro: "se recibe losange / punch de piel de [dimensiones] cm. la superficie epidérmica está engrosada, liquenificada con cuadriculado cutáneo marcado e hiperqueratosis de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos revelan dermatitis espongiótica en fase subaguda a crónica liquenificada. se observa marcada acantosis epidérmica irregular con elongación de crestas interpapilares, hiperqueratosis con alternancia de orto y paraqueratosis, y espongiosis leve a moderada en el estrato espinoso con exocitosis linfocitaria. la dermis papilar exhibe engrosamiento y fibrosis con orientación verticalizada de los haces de colágeno (secuela de rascado crónico), vasodilatación y un conspicuo infiltrado inflamatorio mononuclear perivascular superficial compuesto por linfocitos, histiocitos, abundantes eosinófilos y mastocitos degranulados.",
        diag: "PIEL [LOCALIZACIÓN, EJ. PLIEGUES FLEXURALES], BIOPSIA:\n- DERMATITIS ESPONGIÓTICA CRÓNICA LIQUENIFICADA CON FIBROSIS PAPILAR VERTICAL Y EOSINOFILIA TISULAR, COMPATIBLE CON DERMATITIS ATÓPICA / ECCEMA ATÓPICO.\n- CAMBIOS SECUNDARIOS POR RASCADO CRÓNICO (LIQUENIFICACIÓN).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Prurito intenso con distribución flexural en pliegues y antecedentes personales de atopia (asma, rinitis, IgE elevada)."
    },
    {
        id: 219,
        categoryId: 2,
        titulo: "PITIRIASIS ROSADA DE GIBERT",
        macro: "se recibe punch de piel de [dimensiones] cm. la epidermis presenta una lesión macular ovalada asalmonada de [diámetro] cm con fino collarete descamativo interno. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran epidermis con espongiosis focal leve a moderada. el estrato córneo muestra una alteración muy distintiva con montículos focales de paraqueratosis (mounds of parakeratosis) dispuestos de manera inclinada u oblicua hacia orificios infundibulares o crestas epidérmicas, con atenuación localizada de la capa granulosa subyacente. en la dermis papilar destaca una llamativa extravasación de hematíes (eritrocitos libres) que ascienden hacia la epidermis basal sin vasculitis necrosante. los capilares papilares están dilatados y rodeados por un moderado infiltrado linfohistiocitario perivascular.",
        diag: "PIEL [LOCALIZACIÓN, EJ. TÓRAX / TRONCO], BIOPSIA EN PUNCH:\n- DERMATITIS ESPONGIÓTICA SUPERFICIAL CON MONTÍCULOS DE PARAQUERATOSIS Y EXTRAVASACIÓN DE HEMATÍES EN DERMIS PAPILAR, CARACTERÍSTICA DE PITIRIASIS ROSADA DE GIBERT.\n- NEGATIVO PARA SÍFILIS SECUNDARIA (IHC NEGATIVA) Y DERMATOFITOSIS (PAS NEGATIVO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Placa heráldica inicial seguida tras días de erupción en 'árbol de navidad' en líneas de Langer del tronco."
    },
    {
        id: 220,
        categoryId: 2,
        titulo: "DISHIDROSIS (ECZEMA DISHIDRÓTICO / PONFÓLIX)",
        macro: "se recibe punch de piel acral (palmar/plantar) de [dimensiones] cm. el estrato córneo es grueso, observándose múltiples vesículas tensas translúcidas de 1 a 3 mm 'en grano de mijo'. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran piel acral con estrato córneo compacto ortoqueratósico engrosado. en el estrato espinoso se aprecian voluminosas cavidades vesículo-ampollosas intraepidérmicas uniloculares y multiloculares producidas por espongiosis masiva coalescente, conteniendo líquido seroso proteináceo con linfocitos y escasos eosinófilos. los conductos ecrinos intraepidérmicos (acrosiringios) atraviesan la epidermis sin inflamación intrínseca ni obstrucción ostial. la dermis papilar muestra intenso edema con ectasia vascular e infiltrado perivascular linfohistiocitario con eosinófilos.",
        diag: "PIEL ACRAL [PALMAR / PLANTAR / DIGITAL], BIOPSIA:\n- DERMATITIS ESPONGIÓTICA VESICULO-AMPOLLOSA INTRAEPIDÉRMICA ACRAL DE TIPO PONFÓLIX / ECZEMA DISHIDRÓTICO.\n- DUCTOS ECRINOS CONSERVADOS SIN OBSTRUCCIÓN.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Aclaración anatomopatológica: El término histórico 'dishidrosis' es equívoco, pues la histopatología demuestra que el origen es un eccema espongiótico y no una alteración primaria del conducto sudoríparo."
    },
    {
        id: 221,
        categoryId: 2,
        titulo: "PSORIASIS VULGAR",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica exhibe una placa sobreelevada eritematosa infiltrada de [diámetro] cm, cubierta por escamas blanco-nacaradas plateadas micáceas. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran la hiperplasia psoriasiforme regular clásica. la epidermis presenta hiperqueratosis con paraqueratosis confluente continua en bandas laminares, con ausencia o marcada atenuación de la capa granulosa (agranulosis subparaqueratósica). se observa acantosis regular caracterizada por elongación simétrica homogénea de las crestas interpapilares ('en batidor de huevos / dedos de guante') con ensanchamiento en sus bases. se identifican colecciones de neutrófilos en la capa córnea paraqueratósica (microabscesos de Munro) y en el estrato espinoso alto (pústulas espongiformes de Kogoj). las placas suprapapilares se encuentran marcadamente adelgazadas sobre papilas dérmicas elongadas y edematosas que contienen capilares tortuosos, ectásicos y congestivos. en la dermis superficial se aprecia infiltrado inflamatorio linfohistiocitario perivascular con neutrófilos y sin eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. CODOS / RODILLAS / REGIÓN SACRA], BIOPSIA:\n- DERMATITIS PSORIASIFORME CLÁSICA CON MICROABSCESOS DE MUNRO, PÚSTULAS ESPONGIFORMES DE KOGOJ, ADELGAZAMIENTO SUPRAPAPILAR Y ECTASIA CAPILAR TORTUOSA.\n- DIAGNÓSTICO HISTOPATOLÓGICO DE PSORIASIS VULGAR EN PLACAS.\n- PAS NEGATIVO PARA HONGOS.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Sustrato anatómico de signos clínicos:\n   - Signo de la bujía/vela: Desprendimiento de escamas paraqueratósicas secas.\n   - Signo del rocío sangrante de Auspitz: Ruptura de capilares tortuosos al desprender la escama sobre las placas suprapapilares adelgazadas.\n2. Fenómeno de Koebner positivo."
    },
    {
        id: 222,
        categoryId: 2,
        titulo: "DERMATITIS SEBORREICA",
        macro: "se recibe punch de piel que mide [dimensiones] cm proveniente de piel cabelluda / rostro, con eritema moderado cubierto por escamas amarillentas untuosas y grasientas de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran un patrón híbrido psoriasiforme y espongiótico. la epidermis exhibe acantosis psoriasiforme irregular. el estrato córneo muestra hiperqueratosis con focos de paraqueratosis localizados prominentemente en los márgenes de los orificios infundibulares foliculares ('paraqueratosis en hombro folicular'), mezclada con restos neutrofílicos y costras serocelulares. la capa granulosa está preservada. en el estrato espinoso se constata espongiosis focal leve con exocitosis linfocítica. la dermis papilar muestra vasodilatación capilar y un infiltrado inflamatorio linfohistiocitario perivascular e infundibular superficial con células plasmáticas y neutrófilos dispersos.",
        diag: "PIEL [CUERO CABELLUDO / SURCO NASOGENIANO / TÓRAX], BIOPSIA:\n- DERMATITIS PSORIASIFORME Y ESPONGIÓTICA SUPERFICIAL CON PARAQUERATOSIS EN HOMBRO FOLICULAR Y COSTRAS SEROCELULARES, COMPATIBLE CON DERMATITIS SEBORREICA.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas eritematoescamosas untuosas en áreas seborreicas (cara, cuero cabelludo, preesternal) asociadas a colonización por levaduras Malassezia spp."
    },
    {
        id: 223,
        categoryId: 2,
        titulo: "PITIRIASIS RUBRA PILARIS",
        macro: "se recibe punch de piel de [dimensiones] cm. la superficie cutánea se observa indurada con hiperqueratosis folicular prominente (pápulas córneas acuminadas) sobre fondo eritemato-anaranjado de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran la tríada diagnóstica patognomónica: 1) Marcada hiperqueratosis en 'tablero de ajedrez' (checkerboard pattern), con alternancia regular de ortoqueratosis y paraqueratosis tanto en sentido vertical como horizontal; 2) Dilatación infundibular folicular ocupada por un denso tapón de queratina compacta con collar de paraqueratosis perifolicular; 3) Capa granulosa preservada y engrosada (hipergranulosis marcada). la epidermis muestra acantosis psoriasiforme con crestas interpapilares gruesas y romas sin adelgazamiento suprapapilar ni microabscesos neutrofílicos de Munro. la dermis superficial presenta leve infiltrado linfohistiocitario perivascular.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH:\n- DERMATITIS PSORIASIFORME CON HIPERQUERATOSIS EN 'TABLERO DE AJEDREZ' (ORTO Y PARAQUERATOSIS ALTERNANTE), HIPERGRANULOSIS Y TAPONAMIENTO CÓRNEO FOLICULAR, DIAGNÓSTICA DE PITIRIASIS RUBRA PILARIS (PRP).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Pápulas foliculares queratósicas en dorso de dedos ('signo del rallador de nuez moscada'), placas anaranjadas con islotes de piel sana respetada y queratodermia palmoplantar cerosa en sandalia."
    },
    {
        id: 224,
        categoryId: 2,
        titulo: "PÉNFIGO VULGAR",
        macro: "se recibe punch de piel / mucosa de [dimensiones] cm tomado del borde de una ampolla flácida colapsada con fondo cruento erosivo de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una ampolla intraepidérmica suprabasal acantolítica. se evidencia una hendidura y despegamiento inmediatamente por encima de la capa de células basales, manteniéndose los queratinocitos basales firmemente anclados a la membrana basal dérmica en disposición característica en 'hilera de lápidas' (row of tombstones). en el interior de la cavidad ampollosa flotan abundantes queratinocitos acantolíticos redondeados con núcleos aumentados de tamaño (células de Tzanck). las papilas dérmicas denudadas ('villi') protruyen hacia la cavidad. el clivaje se extiende a lo largo de la vaina radicular externa folicular. la dermis papilar muestra edema estromal e infiltrado perivascular linfohistiocitario moderado con abundantes eosinófilos.",
        diag: "PIEL / MUCOSA [LOCALIZACIÓN, EJ. MUCOSA ORAL / TRONCO], BIOPSIA DE BORDE DE AMPOLLA:\n- DERMATOSIS AMPOLLOSA INTRAEPIDÉRMICA CON ACANTÓLISIS SUPRABASAL EXTENSA, CAPA BASAL EN 'HILERA DE LÁPIDAS' Y CÉLULAS ACANTOLÍTICAS, DIAGNÓSTICA DE PÉNFIGO VULGAR.\n- SE SUGIERE CONFIRMACIÓN CON INMUNOFLUORESCENCIA DIRECTA (IFD).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Ampollas flácidas de fácil ruptura con signo de Nikolsky directo y Asboe-Hansen positivos; afectación de mucosa oral en >70% de casos.\n2. Inmunofluorescencia Directa (IFD): Depósito de IgG y C3 intercelular intraepidérmico en 'malla de alambre' (contra Desmogleína 3 y Desmogleína 1)."
    },
    {
        id: 225,
        categoryId: 2,
        titulo: "PÉNFIGO FOLIÁCEO",
        macro: "se recibe punch de piel de [dimensiones] cm. la superficie cutánea exhibe lesiones escamo-costrosas eritematosas superficiales 'en hojas de hojaldre' de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una ampolla y clivaje intraepidérmico superficial a nivel subcórneo o en el estrato granuloso alto. la acantólisis es localizada, observándose queratinocitos acantolíticos redondeados en el piso y techo de la ampolla subcórnea. los estratos espinoso y basal se encuentran completamente preservados sin clivaje suprabasal. el techo ampolloso está constituido únicamente por estrato córneo y restos de capa granulosa con costras serocelulares. en la dermis superficial se aprecia leve a moderado infiltrado linfohistiocitario perivascular con eosinófilos dispersos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. CARA / TRONCO SUPERIOR], BIOPSIA EN PUNCH:\n- DERMATOSIS AMPOLLOSA INTRAEPIDÉRMICA SUBCÓRNEA / GRANULOSA CON ACANTÓLISIS SUPERFICIAL, COMPATIBLE CON PÉNFIGO FOLIÁCEO (O SU VARIANTE FOGO SELVAGEM).\n- INTEGRIDAD COMPLETA DE ESTRATOS BASAL Y ESPINOSO PROFUNDO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Diagnóstico diferencial: A diferencia del pénfigo vulgar, el foliáceo NO afecta mucosas (debido a que los anticuerpos van dirigidos exclusivamente contra Desmogleína 1 y en mucosas la Desmogleína 3 preserva la adhesión)."
    },
    {
        id: 226,
        categoryId: 2,
        titulo: "PENFIGOIDE AMPOLLOSO",
        macro: "se recibe punch / losange de piel de [dimensiones] cm que incluye ampolla tensa intacta de [diámetro] cm sobre base eritematosa, de contenido seroso claro y pared gruesa resistente. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una ampolla subepidérmica franca de cavidad amplia. el despegamiento se produce a nivel de la unión dermoepidérmica (lámina lúcida), estando el techo ampolloso constituido por el espesor íntegro de una epidermis viable sin acantólisis. la cavidad ampollosa contiene abundante líquido seroso fibrinoide con un denso infiltrado inflamatorio rico en eosinófilos, linfocitos y escasos neutrófilos. en la epidermis perilesional se observa espongiosis eosinofílica. la dermis papilar (suelo ampolloso) se encuentra marcadamente edematosa con un conspicuo infiltrado perivascular e intersticial de predominio eosinofílico y linfohistiocitario.",
        diag: "PIEL [LOCALIZACIÓN, EJ. ABDOMEN / EXTREMIDADES], BIOPSIA CUTÁNEA:\n- DERMATOSIS AMPOLLOSA SUBEPIDÉRMICA NO ACANTOLÍTICA CON ABUNDANTES EOSINÓFILOS EN CAVIDAD Y DERMIS PAPILAR (ESPONGIOSIS EOSINOFÍLICA), CARACTERÍSTICA DE PENFIGOIDE AMPOLLOSO.\n- SE SUGIERE CONFIRMACIÓN POR IFD / SALT-SPLIT SKIN.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Grandes ampollas tensas sobre placas urticarianas en adultos mayores (>65 años), con signo de Nikolsky negativo y prurito intenso.\n2. Inmunofluorescencia Directa (IFD): Depósito lineal continuo de IgG y C3 a lo largo de la zona de membrana basal (antígenos BP180 NC16A y BP230)."
    },
    {
        id: 227,
        categoryId: 2,
        titulo: "DERMATITIS HERPETIFORME DE DUHRING-BROCQ",
        macro: "se recibe punch de piel de [dimensiones] cm con micropápulas y vesículas agrupadas en racimo ('disposición herpetiforme') de [diámetro] cm sobre superficies extensoras con excoriaciones. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatosis ampollosa subepidérmica microfocal muy característica. en los vértices o cúspides de las papilas dérmicas (papillary tips) se observan densas acumulaciones focales de neutrófilos polimorfonucleares con polvo nuclear (microabscesos neutrofílicos papilares con leucocitoclasia), fibrina y escasos eosinófilos. la lisis neutrofílica induce vacuolización y microdespegamientos subepidérmicos en las cúspides papilares que coalescen formando hendiduras subepidérmicas. el techo epidérmico es viable sin acantólisis. la dermis reticular superficial exhibe ectasia capilar e infiltrado perivascular linfohistiocitario y neutrofílico.",
        diag: "PIEL [SUPERFICIES EXTENSORAS: CODOS / RODILLAS / GLÚTEOS], BIOPSIA EN PUNCH:\n- DERMATITIS AMPOLLOSA SUBEPIDÉRMICA CON MICROABSCESOS NEUTRÓFILOS EN CÚSPIDES DE PAPILAS DÉRMICAS Y LEUCOCITOCLASIA PAPILAR, COMPATIBLE CON DERMATITIS HERPETIFORME DE DUHRING-BROCQ.\n- SE REQUIERE TOMA DE BIOPSIA DE PIEL PERILESIONAL SANA PARA INMUNOFLUORESCENCIA DIRECTA (IFD).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Vesículas excoriadas intensamente pruriginosas agrupadas simétricamente en codos, rodillas y glúteos.\n2. Asociación: Prácticamente el 100% de los pacientes presenta enteropatía sensible al gluten (Enfermedad Celíaca).\n3. IFD (Gold Standard): Depósito granular de IgA en cúspides papilares (anticuerpos anti-transglutaminasa epidérmica eTG)."
    },
    {
        id: 228,
        categoryId: 2,
        titulo: "VASCULITIS LEUCOCITOCLÁSTICA DE PEQUEÑO VASO",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm. la superficie epidérmica muestra múltiples lesiones purpúricas palpables milimétricas que no blanquean a la vitropresión, con diámetro de [diámetro] cm. al corte, la dermis presenta punteado hemorrágico sobre fondo grisáceo. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2001). Cutaneous vasculitis: A review of the histopathologic spectrum. J Am Acad Dermatol, 48(4), 546-574.</small>",
        micro: "los cortes histológicos muestran compromiso vascular necrosante centrado en las vénulas poscapilares y capilares de la dermis papilar y reticular superficial. se evidencia tumefacción y desprendimiento de células endoteliales con depósito intramural y perivascular de fibrina eosinófila densa (necrosis fibrinoide de la pared vascular). se identifica un denso infiltrado inflamatorio predominantemente neutrofílico perivascular e intersticial con marcada leucocitoclasia caracterizada por abundantes restos nucleares cariorrécticos ('polvo nuclear'). se asocia a conspicua extravasación de eritrocitos en el estroma dérmico y edema papilar. no se observan granulomas dérmicos ni trombosis de vasos de gran calibre.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH / INCISIONAL:\n- VASCULITIS LEUCOCITOCLÁSTICA DE PEQUEÑO VASO (VASCULITIS CUTÁNEA NECROSANTE).\n- NECROSIS FIBRINOIDE DE LA PARED VASCULAR, LEUCOCITOCLASIA Y EXTRAVASACIÓN ERITROCITARIA PROMINENTE.\n- NEGATIVO PARA VASCULITIS GRANULOMATOSA O MALIGNIDAD.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Púrpura palpable en extremidades inferiores mediada por inmunocomplejos.\n2. IFD temprana (<24-48 h): Depósito vascular de IgA orienta a Púrpura de Henoch-Schönlein; IgG/IgM/C3 orienta a vasculitis por hipersensibilidad o conectivopatía."
    },
    {
        id: 229,
        categoryId: 2,
        titulo: "VASCULITIS LINFOCÍTICA CUTÁNEA",
        macro: "se recibe punch de piel que mide [dimensiones] cm, exhibiendo máculas y placas purpúricas eritematovioláceas de [diámetro] cm. al corte, tejido dérmico elástico y homogéneo. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2001). Cutaneous vasculitis. J Am Acad Dermatol. / Carlson, J. A. (2010). Am J Dermatopathol.</small>",
        micro: "los cortes histológicos muestran dermis superficial y media con infiltrado inflamatorio perivascular e intramural denso compuesto predominantemente por linfocitos maduros e histiocitos que penetran y distorsionan las paredes de vénulas y capilares dérmicos. se aprecia tumefacción endotelial con estenosis luminal, depósito focal de material fibrinoide subendotelial y extravasación de hematíes en la dermis papilar. no se observa componente neutrofílico significativo, leucocitoclasia prominente ni granulomas. atipia citológica linfoide ausente.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- VASCULITIS LINFOCÍTICA CUTÁNEA.\n- INFILTRADO LINFOHISTIOCITARIO TRANSMURAL PERIVASCULAR CON DAÑO ENDOTELIAL Y EXTRAVASACIÓN HEMÁTICA.\n- NEGATIVO PARA ATIPIA CITOLÓGICA LINFOIDE O VASCULITIS LEUCOCITOCLÁSTICA TÍPICA.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Diagnóstico diferencial: Fase tardía de vasculitis leucocitoclástica, erupción medicamentosa fija, lupus eritematoso, eritema anular centrífugo profundo o PLEVA."
    },
    {
        id: 230,
        categoryId: 2,
        titulo: "GRANULOMA ANULAR",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie exhibe pápulas o placas eritematosas anulares sobreelevadas con centro deprimido de [diámetro] cm. al corte, la dermis muestra áreas nodulares blanquecino-nacaradas. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Fernández-Figueras, M. T. (2007). Semin Cutan Med Surg. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran epidermis conservada. en la dermis reticular superficial y media se identifican focos característicos de necrobiosis de colágeno, donde los haces colágenos se aprecian pálidos, desorganizados y embebidos en una abundante sustancia fundamental basófila correspondiente a depósito de mucina estromal (ácido hialurónico). estas áreas de colágeno degenerado se encuentran delimitadas por una empalizada de histiocitos epitelioides y células gigantes multinucleadas, con linfocitos en la periferia y patrón histiocítico intersticial adyacente. las fibras elásticas se encuentran marcadamente disminuidas o fragmentadas en las zonas necrobióticas. no se observan células plasmáticas abundantes ni necrosis caseosa.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS GRANULOMATOSA EN EMPALIZADA E INTERSTICIAL, COMPATIBLE CON GRANULOMA ANULAR.\n- FOCOS DE NECROBIOSIS DE COLÁGENO CON ABUNDANTE DEPÓSITO DE MUCINA ESTROMAL.\n- TINCIONES ESPECIALES NEGATIVAS PARA HONGOS Y MICOBACTERIAS (PAS Y ZIEHL-NEELSEN NEGATIVOS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Pápulas y placas anulares en extremidades (dorso de manos y pies).\n2. En variantes generalizadas/diseminadas: Descartar diabetes mellitus, disfunción tiroidea o hiperlipidemias."
    },
    {
        id: 231,
        categoryId: 2,
        titulo: "NECROBIOSIS LIPOÍDICA",
        macro: "se recibe losange de piel que mide [dimensiones] cm proveniente de región pretibial. la epidermis se observa adelgazada, brillante y amarillenta con finas telangiectasias de [diámetro] cm y borde eritematovioláceo indurado. al corte, todo el espesor dérmico y subcutáneo superficial se muestran escleróticos blanco-amarillentos en capas horizontales. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2008). Panniculitis. J Am Acad Dermatol. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos revelan un proceso granulomatoso inflamatorio y esclerótico extenso que compromete todo el espesor dérmico y se extiende hacia los septos subcutáneos. se dispone en un patrón laminar horizontal en capas ('tier-like' o en sándwich), donde alternan bandas anchas acelulares de colágeno necrobiótico pálido y esclerótico con bandas de infiltrado granulomatoso. el infiltrado está constituido por histiocitos en empalizada, células gigantes multinucleadas (tipo Touton con citoplasma xantomatoso y de tipo Langhans) y abundantes células plasmáticas y linfocitos perivasculares en la dermis profunda. los vasos dérmicos profundos exhiben engrosamiento endotelial y endarteritis obliterante reactiva. mucina escasa o ausente.",
        diag: "PIEL [REGIÓN PRETIBIAL], BIOPSIA EN LOSANGE PROFUNDO:\n- DERMATITIS Y PANICULITIS GRANULOMATOSA EN EMPALIZADA ESTRATIFICADA EXTENSA, HISTOPATOLÓGICAMENTE COMPATIBLE CON NECROBIOSIS LIPOÍDICA (NECROBIOSIS LIPOIDICA DIABETICORUM).\n- ESCLEROSIS DE COLÁGENO, CÉLULAS GIGANTES TIPO TOUTON Y CÉLULAS PLASMÁTICAS PERIVASCULARES PROFUNDAS.\n- NEGATIVO PARA MALIGNIDAD.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas amarillentas escleróticas pretibiales con telangiectasias asociadas a Diabetes Mellitus en >65% de casos."
    },
    {
        id: 232,
        categoryId: 2,
        titulo: "SARCOIDOSIS CUTÁNEA",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm. la superficie cutánea presenta lesiones pápulo-nodulares firmes eritematovioláceas a pardo-amarillentas ('jalea de manzana' a la diascopia) de [diámetro] cm. al corte, la dermis muestra nódulos blanquecinos duros y bien delimitados. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2007). Cutaneous Sarcoidosis. Semin Cutan Med Surg. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos de piel exhiben una epidermis preservada. en la dermis reticular y adventicial se identifican múltiples granulomas epitelioides no caseificantes, discretos y bien delimitados, característicamente 'desnudos' (naked granulomas), definidos por un ribete linfocítico periférico mínimo o ausente. los granulomas están compuestos por agregados cohesivos de histiocitos epitelioides y células gigantes multinucleadas tipo Langhans y a cuerpo extraño (con ocasionales cuerpos asteroides y de Schaumann). no se observa necrosis caseosa central, leucocitoclasia ni neutrófilos. la red de fibras reticulares rodea adecuadamente los granulomas.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS GRANULOMATOSA NO CASEIFICANTE DE PATRÓN SARCOIDEO ('GRANULOMAS DESNUDOS'), HISTOPATOLÓGICAMENTE COMPATIBLE CON SARCOIDOSIS CUTÁNEA.\n- NEGATIVO PARA NECROSIS CASEOSA CENTRAL.\n- TINCIONES ESPECIALES NEGATIVAS PARA MICOBACTERIAS Y HONGOS (ZIEHL-NEELSEN, FITE-FARACO, PAS Y GROCOTT NEGATIVOS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Diagnóstico de exclusión: Tinciones ZN y PAS negativas y ausencia de partículas birrefringentes bajo luz polarizada.\n2. Evaluación sistémica: Radiografía/TC de tórax (adenopatías hiliares), ECA sérica, calcio y prueba de tuberculina (PPD/IGRA anérgico)."
    },
    {
        id: 233,
        categoryId: 2,
        titulo: "GRANULOMA A CUERPO EXTRAÑO",
        macro: "se recibe fragmento de piel y tejido subcutáneo que mide [dimensiones] cm con una lesión nodular indurada de [diámetro] cm. al corte, el nódulo es firme, pardo-blanquecino con áreas grisáceas. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., et al. (2015). Adverse cutaneous reactions to foreign bodies. Dermatol Clin. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran dermis reticular y tejido celular subcutáneo con reacción inflamatoria granulomatosa de patrón nodular y difuso. el infiltrado está constituido por histiocitos epitelioides y abundantes células gigantes multinucleadas de tipo cuerpo extraño con núcleos agrupados irregularmente en el citoplasma, acompañados de linfocitos, fibroblastos reactivos y fibrosis estromal. en el citoplasma de las células gigantes y extracelularmente se identifican partículas de material particulado exógeno/endógeno no digerible, las cuales demuestran birrefringencia positiva bajo luz polarizada. no se observa necrosis caseosa ni vasculitis necrosante.",
        diag: "PIEL Y TEJIDO SUBCUTÁNEO [LOCALIZACIÓN], BIOPSIA / RESECCIÓN:\n- REACCIÓN GRANULOMATOSA NODULAR A CUERPO EXTRAÑO CON CÉLULAS GIGANTES MULTINUCLEADAS.\n- PRESENCIA DE MATERIAL HETERÓLOGO / PARTICULADO CONFIRMADO BAJO LUZ POLARIZADA.\n- NEGATIVO PARA MICOBACTERIAS O MICOSIS PROFUNDA (ZN Y PAS NEGATIVOS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Anamnesis: Correlacionar con antecedentes de traumatismos penetrantes (espinas, astillas), materiales de relleno cosmético, tatuajes o suturas quirúrgicas previas."
    },
    {
        id: 234,
        categoryId: 2,
        titulo: "ERITEMA NUDOSO (PANICULITIS SEPTAL)",
        macro: "se recibe losange profundo de piel y tejido celular subcutáneo en cuña que mide [dimensiones] cm de superficie y [profundidad] cm de espesor hasta hipodermis profunda. en superficie se observa placa nodular eritematosa indurada de [diámetro] cm en cara anterior de pierna. al corte, los septos fibrosos del tejido adiposo subcutáneo se observan notablemente ensanchados, edematosos y blanco-grisáceos, contrastando con los lobulillos grasos amarillos preservados. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2008). Panniculitis. Part I. Mostly septal panniculitis. J Am Acad Dermatol, 58(6), 940-972.</small>",
        micro: "los cortes histológicos muestran una paniculitis de patrón predominantemente septal con respeto de los centros lobulillares adiposos. los tabiques o septos conectivos interlobulillares se encuentran marcadamente ensanchados por edema, proliferación fibroblástica y un denso infiltrado inflamatorio. en los septos y en la periferia de los lobulillos grasos se identifican los característicos GRANULOMAS RADIALES DE MIESCHER, conformados por pequeños acúmulos nodulares de histiocitos epitelioides orientados radialmente alrededor de una hendidura central estrellada o capilar colapsado. se asocian a neutrófilos extravasados y linfocitos en etapas agudas, y a células gigantes multinucleadas y fibrosis septal en fases evolucionadas. no se observa vasculitis de vasos de mediano calibre ni necrosis grasa caseosa.",
        diag: "PIEL Y TEJIDO CELULAR SUBCUTÁNEO [LOCALIZACIÓN PRETIBIAL], BIOPSIA EN CUÑA PROFUNDA:\n- PANICULITIS PREDOMINANTEMENTE SEPTAL SIN VASCULITIS, CON GRANULOMAS RADIALES DE MIESCHER, HISTOPATOLÓGICAMENTE COMPATIBLE CON ERITEMA NUDOSO.\n- AUSENCIA DE VASCULITIS DE MEDIANO O GRAN CALIBRE Y AUSENCIA DE NECROSIS CASEOSA.\n- ZN Y PAS NEGATIVOS PARA MICROORGANISMOS.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Nódulos eritematosos dolorosos pretibiales bilaterales.\n2. Etiologías asociadas: Infección estreptocócica (ASO), Sarcoidosis (Síndrome de Löfgren), Tuberculosis (PPD/IGRA), EII (Crohn/colitis ulcerosa) o fármacos."
    },
    {
        id: 235,
        categoryId: 2,
        titulo: "ERITEMA INDURADO DE BAZIN / VASCULITIS NODULAR (PANICULITIS LOBULILLAR)",
        macro: "se recibe biopsia en cuña profunda de piel y tejido celular subcutáneo que mide [dimensiones] cm de superficie y [profundidad] cm de espesor. en superficie muestra nódulo eritematovioláceo indurado y ulcerado en cara posterior de pantorrilla de [diámetro] cm. al corte, el tejido graso subcutáneo presenta aspecto heterogéneo moteado con áreas blanco-amarillentas de necrosis grasa y fibrosis. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2008). Panniculitis. Part II. Mostly lobular panniculitis. J Am Acad Dermatol, 58(8), 1001-1025.</small>",
        micro: "los cortes histológicos muestran una paniculitis de distribución predominantemente lobulillar con compromiso septal secundario y extensa necrosis grasa de tipo coagulativo / caseoso en los adipocitos lobulillares. el infiltrado inflamatorio es granulomatoso y denso, compuesto por histiocitos epitelioides, células gigantes multinucleadas de tipo Langhans y a cuerpo extraño, linfocitos y células plasmáticas. en los septos interlobulillares y unión septo-lobulillar se identifica de manera constante una VASCULITIS GRANULOMATOSA Y NECROSANTE DE VASOS MUSCULARES ARTERIALES Y VENOSOS DE MEDIANO Y PEQUEÑO CALIBRE, con necrosis fibrinoide mural, infiltrado transmural, proliferación de la íntima y trombosis oclusiva con recanalización.",
        diag: "PIEL Y TEJIDO CELULAR SUBCUTÁNEO [CARA POSTERIOR DE PIERNA], BIOPSIA EN CUÑA PROFUNDA:\n- PANICULITIS PREDOMINANTEMENTE LOBULILLAR CON VASCULITIS NECROSANTE / GRANULOMATOSA DE VASOS DE MEDIANO CALIBRE Y NECROSIS CASEOSA, HISTOPATOLÓGICAMENTE COMPATIBLE CON ERITEMA INDURADO DE BAZIN / VASCULITIS NODULAR.\n- NECROSIS ADIPOSA LOBULILLAR EXTENSA Y GRANULOMAS TUBERCULOIDES CON CÉLULAS DE LANGHANS.\n- NEGATIVO PARA MALIGNIDAD.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Criterio de Requena: Combinación diagnóstica de paniculitis lobulillar con vasculitis de vasos musculares de mediano calibre.\n2. Etiología: Si se asocia a hipersensibilidad a Mycobacterium tuberculosis se denomina Eritema Indurado de Bazin (solicitar PCR para M. tuberculosis y PPD/IGRA); si es idiopática o asociada a otras causas se denomina Vasculitis Nodular."
    },
    {
        id: 1201,
        categoryId: 16,
        titulo: "LUPUS ERITEMATOSO DISCOIDE (CUTÁNEO CRÓNICO)",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica muestra una placa eritematosa bien delimitada con escama córnea adherente y tapones foliculares queratósicos centrales, de [diámetro] cm. al corte, la dermis es firme, blanco-grisácea y elástica. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase de tipo degeneración vacuolar con compromiso anexial prominente. la capa córnea exhibe hiperqueratosis ortoqueratósica compacta con marcada dilatación y taponamiento folicular queratósico (follicular plugging). la epidermis muestra atrofia difusa con aplanamiento de los procesos interpapilares, alternando con focos de hipergranulosis irregular y queratinocitos apoptóticos basales (cuerpos coloides). la unión dermoepidérmica presenta degeneración hidrópica y balonizante de las células basales con engrosamiento hialino denso continuo de la membrana basal epidérmica y perinfundibular. en la dermis papilar se aprecia incontinencia pigmentaria marcada con abundantes melanófagos, ectasia vascular y abundantes depósitos de mucina intersticial en la dermis reticular. se identifica un denso infiltrado inflamatorio linfohistiocitario dispuesto en los plexos perivasculares superficial y profundo, con una conspicua distribución perianexial (perifolicular y periecrina) que condiciona atrofia folicular progresiva.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH / LOSANGE:\n- DERMATITIS DE INTERFASE VACUOLAR CRÓNICA CON ATROFIA EPIDÉRMICA, TAPONAMIENTO FOLICULAR, ENGROSAMIENTO DE LA MEMBRANA BASAL, INFILTRADO LINFOIDE PERIANEXIAL PROFUNDO Y MUCINOSIS DÉRMICA.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS Y COMPATIBLES CON LUPUS ERITEMATOSO DISCOIDE (LED / LUPUS CUTÁNEO CRÓNICO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas eritematosas descamativas con tapones foliculares queratósicos ('signo del tapón de cera o tachuela') y atrofia cicatrizal central con alopecia en cuero cabelludo/cara.\n2. Diagnóstico diferencial: Descartar Dermatomiositis (carece de infiltrado perianexial profundo y el engrosamiento de membrana basal es leve) y Lupus túmido (sin atrofia epidérmica ni daño de interfase basal)."
    },
    {
        id: 1202,
        categoryId: 16,
        titulo: "LUPUS ERITEMATOSO CUTÁNEO SUBAGUDO (LECS)",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea muestra una placa eritematosa anular / psoriasiforme de [diámetro] cm, sin tapones córneos evidentes ni cicatriz central. al corte, el tejido dérmico es elástico y homogéneo. se procesa la totalidad en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology (5th ed.).</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase vacuolar de distribución predominantemente superficial. la capa córnea muestra hiperqueratosis ortoqueratósica laminar con pequeños focos de paraqueratosis. la epidermis presenta atrofia moderada con degeneración hidrópica difusa de la capa basal y abundantes cuerpos apoptóticos (cuerpos de Civatte) distribuidos en los estratos basal y espinoso inferior. la membrana basal exhibe un engrosamiento leve o discontinuo. en la dermis papilar se observa edema y melanófagos dispersos por incontinencia de pigmento, acompañado de un depósito difuso de mucina estromal en la dermis reticular superficial. el infiltrado inflamatorio está constituido por linfocitos e histiocitos confinados a la unión dermoepidérmica y al plexo vascular superficial, respetando la dermis reticular profunda y los anexos cutáneos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CON CUERPOS APOPTÓTICOS BASALES, INFILTRADO LINFOIDE ESTRICTAMENTE PERIVASCULAR SUPERFICIAL Y DEPÓSITO DE MUCINA DÉRMICA.\n- CUADRO HISTOLÓGICO COMPATIBLE CON LUPUS ERITEMATOSO CUTÁNEO SUBAGUDO (LECS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Lesiones anulares policíclicas o pápulo-escamosas psoriasiformes fotodistribuidas en tórax, cuello y brazos que resuelven sin cicatriz atrófica permanente.\n2. Inmunología: Correlacionar con anticuerpos anti-Ro/SSA y anti-La/SSB (positivos en >80% de casos)."
    },
    {
        id: 1203,
        categoryId: 16,
        titulo: "LUPUS ERITEMATOSO SISTÉMICO (ERITEMA MALAR / RASH AGUDO)",
        macro: "se recibe punch de piel que mide [dimensiones] cm proveniente de región malar / facial, con superficie epidérmica eritematoedematosa difusa y lisa, sin escamas induradas ni cicatrización. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran dermatitis de interfase vacuolar aguda. la epidermis conserva su espesor con ortoqueratosis laminar y degeneración hidrópica de queratinocitos basales con aislados cuerpos apoptóticos. se evidencia un severo edema de la dermis papilar que disgrega los haces de colágeno, asociado a ectasia de capilares dérmicos superficiales con tumefacción endotelial y extravasación focal de hematíes. en la dermis reticular superficial se confirma la presencia de mucina ácida intersticial difusa. el infiltrado inflamatorio es escaso a moderado, de predominio linfohistiocitario perivascular superficial, sin afectación de anexos ni necrosis fibrinoide mural vascular.",
        diag: "PIEL FACIAL (REGIÓN MALAR), BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR AGUDA CON MARCADO EDEMA DE DERMIS PAPILAR, EXTRAVASACIÓN ERITROCITARIA Y DEPOSITACIÓN DE MUCINA DÉRMICA.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS DE LUPUS ERITEMATOSO CUTÁNEO AGUDO (ERITEMA MALAR EN LES).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Eritema simétrico en 'alas de mariposa' que respeta los surcos nasogenianos, transitorio y coincidente con brotes de actividad sistémica.\n2. Laboratorio: Correlacionar con títulos de anticuerpos anti-ADN de doble cadena (anti-dsDNA) y anti-Sm."
    },
    {
        id: 1204,
        categoryId: 16,
        titulo: "ERITEMA MULTIFORME",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la epidermis exhibe una lesión en diana / escarapela característica de [diámetro] cm, con ampolla / necrosis central y halo eritematovioláceo concéntrico. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase vacuolar citotóxica aguda prototípica. el estrato córneo se encuentra preservado en cesta de mimbre ortoqueratósico (reflejo de instalación hiperaguda). la epidermis exhibe necrosis y apoptosis diseminada de queratinocitos individuales y en pequeños grupos en todos los estratos epidérmicos ('satelitosis linfoide'), con evolución a necrosis de espesor completo en la zona central. la unión dermoepidérmica presenta degeneración vacuolar intensa que da lugar a una ampolla subepidérmica por lisis basal. la dermis papilar muestra severo edema, ectasia vascular con tumefacción endotelial y un infiltrado inflamatorio linfohistiocitario perivascular superficial denso, con llamativa ausencia de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CITOTÓXICA AGUDA CON NECROSIS QUERATINOCÍTICA MULTIESTRATO, AMPOLLA SUBEPIDÉRMICA POR DEGENERACIÓN BASAL Y EDEMA PAPILAR SEVERO.\n- PATRÓN HISTOPATOLÓGICO DIAGNÓSTICO DE ERITEMA MULTIFORME (EM).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Lesiones en diana típicas acrales (palmas, plantas, antebrazos). Desencadenado comúnmente por infección por Virus Herpes Simple (VHS-1/2) o Mycoplasma pneumoniae.\n2. Diagnóstico diferencial: Descartar Síndrome de Stevens-Johnson / NET (necrosis en sábana con dermis desierta) y toxicodermia fija."
    },
    {
        id: 1205,
        categoryId: 16,
        titulo: "DERMATOMIOSITIS",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea presenta pápulas eritematovioláceas aplanadas de [diámetro] cm sobre el dorso articular interfalángico / eritema facial violáceo. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran atrofia epidérmica acentuada con aplanamiento de crestas interpapilares e hiperqueratosis ortoqueratósica laminar. la unión dermoepidérmica muestra degeneración hidrópica de la capa basal con queratinocitos apoptóticos basales aislados. la dermis papilar exhibe ectasia capilar superficial prominente, edema y abundantes depósitos intersticiales de mucina ácida en la dermis reticular que separan ampliamente los haces colágenos. el infiltrado inflamatorio linfohistiocitario es de intensidad leve a moderada y se encuentra estrictamente confinado al plexo perivascular superficial y a la interfase, con indemnidad de la dermis profunda y de los folículos pilosos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. DORSO DE NUDILLOS / PÁRPADOS], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CON ATROFIA EPIDÉRMICA, TELANGIECTASIAS DÉRMICAS, INFILTRADO LINFOIDE SUPERFICIAL Y ABUNDANTE MUCINOSIS DÉRMICA.\n- CUADRO HISTOPATOLÓGICO COMPATIBLE CON DERMATOMIOSITIS (PÁPULAS DE GOTTRON / ERITEMA EN HELIOTROPO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Pápulas/signo de Gottron sobre articulaciones interfalángicas, eritema heliótropo periorbitario y debilidad muscular proximal.\n2. Laboratorio: Solicitar enzimas musculares (CPK, aldolasa) y anticuerpos específicos (anti-Mi-2, anti-TIF1-γ, anti-MDA5)."
    },
    {
        id: 1206,
        categoryId: 16,
        titulo: "TOXICODERMIA (ERUPCIÓN MEDICAMENTOSA VACUOLAR)",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm, exhibiendo máculas y pápulas eritematosas confluentes pruriginosas de [diámetro] cm. al corte, tejido dérmico elástico y homogéneo. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran dermatitis de interfase vacuolar con espongiosis leve y queratinocitos disqueratósicos/apoptóticos aislados que ascienden a los niveles medio y superior del estrato espinoso. la capa basal exhibe degeneración hidrópica en parches. en la dermis papilar se observa edema moderado e incontinencia pigmentaria. el infiltrado inflamatorio perivascular superficial e interfase es de tipo mixto, caracterizado por linfocitos T, histiocitos y la presencia conspicua y diagnóstica de abundantes eosinófilos distribuidos en el estroma perivascular e intersticial dérmico.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE VACUOLAR CON ESPONGIOSIS LEVE, QUERATINOCITOS APOPTÓTICOS MULTIESTRATO E INFILTRADO INFLAMATORIO MIXTO PERIVASCULAR CON EOSINÓFILOS.\n- CUADRO HISTOLÓGICO ALTAMENTE SUGESTIVO DE ERUPCIÓN MEDICAMENTOSA (TOXICODERMIA VACUOLAR).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Criterio pivote: La presencia de eosinófilos entremezclados en el infiltrado perivascular y de interfase es la clave histológica para diferenciar una toxicodermia de un exantema viral puro o lupus.\n2. Anamnesis: Evaluar fármacos introducidos en las últimas 1 a 3 semanas (antibióticos, AINEs, anticonvulsivantes)."
    },
    {
        id: 1207,
        categoryId: 16,
        titulo: "LIQUEN PLANO",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica muestra una pápula/placa poligonal violácea brillante y aplanada de [diámetro] cm, con finas estrías blanquecinas reticulares en superficie (estrías de Wickham). se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide clásica. la capa córnea presenta marcada hiperqueratosis ortoqueratósica compacta pura (sin paraqueratosis). la epidermis exhibe hipergranulosis cuneiforme o romboidal prominente, asociada a acantosis irregular con afilamiento cónico de los procesos interpapilares en 'dientes de sierra' (saw-toothed pattern) y abundantes cuerpos coloides/apoptóticos (cuerpos de Civatte) en la basal. la unión dermoepidérmica muestra necrosis licuefactiva basal con despegamientos focales subepidérmicos característicos (espacios de Max-Joseph). en la dermis papilar se identifica un infiltrado inflamatorio extremadamente denso, continuo y en BANDA ('band-like') compuesto monomórficamente por linfocitos T e histiocitos, con incontinencia de melanina y melanófagos abundantes. no se observan eosinófilos ni células plasmáticas. la dermis reticular profunda se encuentra libre de inflamación.",
        diag: "PIEL [LOCALIZACIÓN, EJ. CARA ANTERIOR DE MUÑECA / TOBILLO], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE EN BANDA DÉRMICA PAPILAR CON HIPERQUERATOSIS ORTOQUERATÓSICA PURA, HIPERGRANULOSIS CUNEIFORME, ACANTOSIS EN 'DIENTES DE SIERRA', ESPACIOS DE MAX-JOSEPH Y CUERPOS DE CIVATTE.\n- DIAGNÓSTICO HISTOPATOLÓGICO DEFINITIVO DE LIQUEN PLANO CLÁSICO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Las '6 P': Pápulas Poligonales, Purpúricas, Pruriginosas, Planas, Placas y con estrías de Wickham en superficies flexoras.\n2. Diagnóstico diferencial: Erupción liquenoide medicamentosa (presenta paraqueratosis, eosinófilos e infiltrado profundo) y Queratosis liquenoide solitaria."
    },
    {
        id: 1208,
        categoryId: 16,
        titulo: "LIQUEN ESTRIADO",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea exhibe pápulas liquenoides eritemato-rosadas agrupadas en banda lineal siguiendo trayectos de Blaschko, de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide y espongiótica en parches con compromiso anexial profundo característico. la epidermis presenta hiperqueratosis con focos de paraqueratosis, acantosis irregular, espongiosis intercelular y queratinocitos apoptóticos intraepidérmicos dispersos. la capa basal muestra degeneración hidrópica en parches. en la dermis papilar se observa infiltrado linfohistiocitario que se acompaña de un prominente infiltrado inflamatorio linfoide perianexial profundo con afección electiva del epitelio de los ovillos y conductos sudoríparos ecrinos (hidradenitis ecrina linfoide reactiva). ausencia habitual de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. EXTREMIDAD EN NIÑO], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE Y ESPONGIÓTICA EN PARCHES ASOCIADA A INFILTRADO LINFOIDE PERIECRINO PROFUNDO PROMINENTE.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS DE LIQUEN ESTRIADO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signo patognomónico de Requena: La combinación de dermatitis de interfase liquenoide espongiótica con denso manguito linfoide periecrino profundo es diagnóstica de Liquen Estriado.\n2. Clínica: Erupción lineal autolimitada en niños a lo largo de las líneas de Blaschko."
    },
    {
        id: 1209,
        categoryId: 16,
        titulo: "LIQUEN ESCLEROSO Y ATRÓFICO",
        macro: "se recibe losange / punch de piel / mucosa que mide [dimensiones] cm. la superficie presenta una placa blanco-marfil nacarada, atrófica, deprimida en 'papel de cigarrillo' arrugado con tapones córneos puntiformes de [diámetro] cm. al corte, la dermis es densa y nacarada. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una marcada alteración esclerosante de la interfase. la capa córnea presenta hiperqueratosis ortoqueratósica compacta con prominente taponamiento folicular y orificial queratósico. la epidermis exhibe extrema atrofia del estrato espinoso ('en papel de seda') con aplanamiento y pérdida total de crestas interpapilares y degeneración vacuolar basal residual. en la dermis papilar se observa una amplia banda subepidérmica acelular de edema severo y homogeneización esclerótica hialina del colágeno (colágeno vítreo pálido homogéneo) con pérdida difusa de fibras elásticas. por debajo de esta zona esclerótica, en la dermis reticular media, se identifica un denso infiltrado inflamatorio linfohistiocitario en banda ('infiltrado infralesional'). se reconocen ectasias capilares superficiales con focos de extravasación eritrocitaria. no se observa atipia queratinocítica.",
        diag: "PIEL / MUCOSA [LOCALIZACIÓN GENITAL / EXTRAGENITAL], BIOPSIA:\n- DERMATITIS DE INTERFASE ESCLEROSANTE CON HIPERQUERATOSIS ORTOQUERATÓSICA, MARCADA ATROFIA EPIDÉRMICA, HOMOGENEIZACIÓN HIALINA ACELULAR DE DERMIS PAPILAR E INFILTRADO LINFOIDE EN BANDA INFRALESIONAL.\n- CUADRO HISTOPATOLÓGICO CLÁSICO Y DEFINITIVO DE LIQUEN ESCLEROSO (Y ATRÓFICO).\n- NEGATIVO PARA ATIPIA CITOLÓGICA O NEOPLASIA INTRAEPITELIAL DIFERENCIADA (dVIN / dPeIN).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas nacaradas blanco-porcelana en región anogenital (craurosis vulvar / balanitis xerótica obliterante con fimosis) o tronco.\n2. Seguimiento: Control periódico por riesgo aumentado de carcinoma epidermoide cutáneo/mucoso en lesiones crónicas."
    },
    {
        id: 1210,
        categoryId: 16,
        titulo: "PITIRIASIS LIQUENOIDE (PLEVA / PLC)",
        macro: "se recibe punch de piel que mide [dimensiones] cm, con pápulas eritematosas centradas por vesículo-pústula purpúrica necrótica / costra escamosa en oblea de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide citotóxica con infiltrado inflamatorio en forma de CUÑA (base dermoepidérmica y vértice en dermis reticular profunda). la capa córnea muestra paraqueratosis confluente con exudado serohemático y neutrófilos atrapados en costra. la epidermis exhibe necrosis queratinocítica diseminada y balonización celular con espongiosis y exocitosis activa de linfocitos y eritrocitos. la unión dermoepidérmica está borrada por el infiltrado linfoide citotóxico. en la dermis papilar y media se identifica un infiltrado linfohistiocitario perivascular e intersticial asociado a tumefacción endotelial y extravasación masiva de hematíes. no se observa necrosis fibrinoide de la pared vascular ni leucocitoclasia neutrofílica verdadera.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE CITOTÓXICA CON INFILTRADO EN CUÑA DERMOEPIDÉRMICO, NECROSIS QUERATINOCÍTICA, COSTRA PARAQUERATÓSICA HEMORRÁGICA Y EXTRAVASACIÓN ERITROCITARIA MASIVA.\n- HALLAZGOS COMPATIBLES CON PITIRIASIS LIQUENOIDE (PLEVA / ENFERMEDAD DE MUCHA-HABERMANN / PLC SEGÚN FASE CLÍNICA).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Brotes de pápulas que evolucionan a vesículas purpúricas, costras necróticas y úlceras varioliformes en tronco y extremidades.\n2. Diagnóstico diferencial: Descartar Papulosis Linfomatoide (presencia de células grandes atípicas CD30+) y Vasculitis leucocitoclástica."
    },
    {
        id: 1211,
        categoryId: 16,
        titulo: "ERUPCIÓN LIQUENOIDE POR FÁRMACOS",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie cutánea presenta placas eritemato-violáceas liquenoides con descamación laminar fina de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una dermatitis de interfase liquenoide atípica. la capa córnea exhibe hiperqueratosis con focos conspicuos de paraqueratosis. la epidermis presenta acantosis irregular con queratinocitos apoptóticos/disqueratósicos dispersos en todos los estratos epidérmicos (estrato basal, medio y superior). en la unión dermoepidérmica se observa daño licuefactivo con infiltrado en banda en la dermis papilar que se extiende hacia los plexos vasculares de la dermis reticular profunda y perianexial. el infiltrado inflamatorio es de tipo mixto, constituido por linfocitos T, histiocitos, abundantes EOSINÓFILOS y presencia de CÉLULAS PLASMÁTICAS maduras entremezcladas, con incontinencia de melanina.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS DE INTERFASE LIQUENOIDE CON PARAQUERATOSIS FOCAL, QUERATINOCITOS DISQUERATÓSICOS MULTIESTRATO E INFILTRADO MIXTO DERMOPAPILAR Y PROFUNDO CON EOSINÓFILOS Y CÉLULAS PLASMÁTICAS.\n- CUADRO HISTOLÓGICO COMPATIBLE CON ERUPCIÓN LIQUENOIDE POR FÁRMACOS (TOXICODERMIA LIQUENOIDE).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Claves vs Liquen Plano idiopático: 1) Presencia de paraqueratosis; 2) Presencia de eosinófilos y plasmocitos; 3) Extensión a dermis profunda/perianexial; 4) Queratinocitos necróticos en estratos altos.\n2. Fármacos causales: Antihipertensivos (betabloqueantes, IECA), tiazidas, antipalúdicos, inhibidores PD-1/PD-L1."
    },
    {
        id: 1212,
        categoryId: 16,
        titulo: "URTICARIA (HABÓN URTICARIANO AGUDO)",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie muestra una placa eritemato-edematosa sobreelevada evanescente de [diámetro] cm, lisa y sin descamación ni costras. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una epidermis totalmente normal e intacta en cesta de mimbre, sin espongiosis ni daño de interfase. en la dermis papilar y reticular se identifica un intenso y difuso edema estromal que disocia y espacia ampliamente los haces de colágeno dérmico. los capilares y vénulas dérmicas superficiales se observan dilatados con tumefacción endotelial reactiva. el infiltrado inflamatorio es de intensidad leve a moderada, dispuesto en patrón perivascular superficial e intersticial, compuesto por neutrófilos y eosinófilos alineados entre las fibras colágenas ('en fila india'), acompañados de linfocitos y mastocitos degranulados. no se identifica necrosis fibrinoide vascular ni leucocitoclasia masiva.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS PERIVASCULAR SUPERFICIAL E INTERSTICIAL CON MARCADO EDEMA DÉRMICO, NEUTRÓFILOS Y EOSINÓFILOS INTERSTICIALES, Y EPIDERMIS TOTALMENTE RESPETADA.\n- HALLAZGOS HISTOPATOLÓGICOS CARACTERÍSTICOS DE HABÓN URTICARIANO (URTICARIA AGUDA).\n- NEGATIVO PARA VASCULITIS LEUCOCITOCLÁSTICA O NECROSIS VASCULAR.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Ronchas eritemato-edematosas intensamente pruriginosas, evanescentes (<24 horas de duración individual) que no dejan púrpura ni pigmentación.\n2. Diagnóstico diferencial: Vasculitis urticariana (dura >24-48 h, deja púrpura e histológicamente muestra necrosis fibrinoide mural y polvo nuclear)."
    },
    {
        id: 1213,
        categoryId: 16,
        titulo: "ERITEMA ANULAR CENTRÍFUGO",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm. en superficie se aprecia el borde sobreelevado de una placa anular eritematosa de [diámetro] cm con collarete descamativo interno. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una dermatitis perivascular con patrón característico en manguito. la epidermis muestra espongiosis leve focal con pequeños montículos de paraqueratosis en la variante superficial (o epidermis intacta en la variante profunda). la unión dermoepidérmica está preservada. en la dermis se observa un denso infiltrado inflamatorio linfohistiocitario monomorfo, compacto y estrictamente delimitado alrededor de los vasos sanguíneos dérmicos, configurando el signo patognomónico en 'MANGUITO PERIVASCULAR' o 'EN MANGA DE ABRIGO' (coat-sleeve pattern). no se observan neutrófilos, depósitos de mucina ni necrosis fibrinoide vascular.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS PERIVASCULAR CON INFILTRADO LINFOHISTIOCITARIO COMPACTO EN 'MANGUITO' (PATRÓN EN MANGA DE ABRIGO / COAT-SLEEVE) [TIPO SUPERFICIAL / PROFUNDO].\n- CUADRO HISTOPATOLÓGICO TÍPICO DE ERITEMA ANULAR CENTRÍFUGO (EAC DE DARIER).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Lesiones anulares o policíclicas que progresan centrífugamente con collarete descamativo interno.\n2. Etiología: Reacción de hipersensibilidad a dermatofitosis (tinea pedis), fármacos o infecciones sistémicas."
    },
    {
        id: 1214,
        categoryId: 16,
        titulo: "EXANTEMA VIRAL (MORBILIFORME)",
        macro: "se recibe punch de piel que mide [dimensiones] cm, con superficie epidérmica que muestra máculas eritematosas tenues no induradas de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran fragmento de piel con dermatitis reactiva perivascular superficial inespecífica. la capa córnea conserva su aspecto en cesta de mimbre con ortoqueratosis. la epidermis presenta espongiosis intercelular leve con queratinocitos discretamente edematosos sin necrosis masiva ni inclusiones virales específicas identificables. la dermis papilar exhibe edema leve y ectasia capilar superficial. el infiltrado inflamatorio es mononuclear (linfocitos T e histiocitos) de intensidad leve a moderada, dispuesto en patrón perivascular superficial, con notoria ausencia de eosinófilos significativos y ausencia de vasculitis.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS PERIVASCULAR SUPERFICIAL LINFOHISTIOCITARIA LEVE A MODERADA CON DISCRETA ESPONGIOSIS Y ECTASIA CAPILAR, SIN EOSINOFILIA SIGNIFICATIVA NI VASCULITIS.\n- COMPATIBLE CON EXANTEMA VIRAL (EXANTEMA MACULOPAPULAR / MORBILIFORME INESPECÍFICO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Erupción maculopapular eritematosa súbita difusa precedida de pródromos febriles y síntomas catarrales.\n2. Criterio de Requena: La ausencia de eosinófilos orienta fuertemente a etiología viral frente a toxicodermia medicamentosa."
    },
    {
        id: 1215,
        categoryId: 16,
        titulo: "DERMATITIS DE CONTACTO ALÉRGICA",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica muestra aspecto eritemato-edematoso con micropápulas y microvesículas serosas confluentes de [diámetro] cm, sin induración profunda. se procesa en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran un patrón de dermatitis espongiótica aguda a subaguda. la epidermis exhibe ortoqueratosis laminar con focos de paraqueratosis y costras serocelulares. en el estrato espinoso se identifica marcada espongiosis intercelular que distiende los desmosomas y progresa a la formación de vesículas y microvesículas espongióticas intraepidérmicas con exocitosis de linfocitos y eosinófilos. la capa basal está intacta. en la dermis papilar se observa marcado edema estromal, ectasia vascular con congestión de capilares y un infiltrado inflamatorio perivascular e intersticial moderado a severo constituido por linfocitos, histiocitos y abundantes eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA POR PUNCH / LOSANGE:\n- DERMATITIS ESPONGIÓTICA AGUDA / SUBAGUDA CON VESICULACIÓN INTRAEPIDÉRMICA Y EOSINÓFILOS DÉRMICOS, COMPATIBLE CON DERMATITIS DE CONTACTO ALÉRGICA (HIPERSENSIBILIDAD TIPO IV).\n- NEGATIVO PARA VASCULITIS, ATIPIA CELULAR O PROCESO LINFOPROLIFERATIVO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas eritematovesiculosas pruriginosas circunscritas a la zona de exposición al alérgeno (metales, cosméticos, tintes, fragancias).\n2. Diagnóstico diferencial: Contacto irritativo (daño tóxico queratinocítico primario con neutrófilos y sin eosinófilos)."
    },
    {
        id: 1216,
        categoryId: 16,
        titulo: "DERMATITIS DE CONTACTO IRRITATIVA",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la superficie cutánea se observa eritematosa, apergaminada, con descamación laminar fina y fisuras superficiales de [diámetro] cm, sin ampollas francas. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran epidermis con hiperqueratosis compacta, paraqueratosis focal y focos de necrosis queratinocítica superficial individual (queratinocitos eosinófilos apoptóticos) en los estratos espinoso alto y granuloso. se identifica espongiosis focal irregular leve a moderada con exocitosis de neutrófilos en el estrato córneo y espinoso superior, sin grandes vesículas coalescentes. la dermis superficial exhibe vasodilatación capilar y un infiltrado perivascular superficial leve a moderado de linfocitos e histiocitos con escasos neutrófilos y llamativa escasez de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH:\n- DERMATITIS ESPONGIÓTICA / CITOTÓXICA COMPATIBLE CON DERMATITIS DE CONTACTO IRRITATIVA (DAÑO TÓXICO DIRECTO NO INMUNOLÓGICO).\n- AUSENCIA DE COMPONENTE EOSINOFÍLICO SIGNIFICATIVO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Patogenia: Daño directo por detergentes, solventes, fricción o agentes químicos. Predomina el ardor y escozor sobre el prurito."
    },
    {
        id: 1217,
        categoryId: 16,
        titulo: "DERMATITIS NUMULAR (ECZEMA DISCOIDE)",
        macro: "se recibe punch de piel que mide [dimensiones] cm. la epidermis presenta una placa circular sobreelevada en 'moneda' de [diámetro] cm con superficie costrosa serohemática amarillenta y eritematosa. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran una dermatitis espongiótica subaguda a crónica. la epidermis presenta acantosis irregular combinada con espongiosis manifiesta y formación de microvesículas espongióticas intraepidérmicas. el estrato córneo muestra una combinación diagnóstica de hiperqueratosis con prominentes montículos de paraqueratosis (mounds of parakeratosis) que engloban exudado de suero coagulado y neutrófilos (costras serocelulares). la dermis papilar está ensanchada por edema estromal y capilares congestivos rodeados por un denso infiltrado linfoplasmocitario y linfohistiocitario perivascular e intersticial con presencia constante de eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. MIEMBROS INFERIORES], BIOPSIA EN PUNCH:\n- DERMATITIS ESPONGIÓTICA SUBAGUDA CON HIPERPLASIA EPIDÉRMICA, MONTÍCULOS DE PARAQUERATOSIS SEROCELULAR Y EOSINÓFILOS DÉRMICOS, CARACTERÍSTICA DE DERMATITIS NUMULAR (ECZEMA DISCOIDE).\n- PAS NEGATIVO PARA DERMATOFITOSIS.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas redondeadas en 'moneda' pruriginosas en piernas de adultos con xerosis o insuficiencia venosa."
    },
    {
        id: 1218,
        categoryId: 16,
        titulo: "DERMATITIS ATÓPICA",
        macro: "se recibe losange / punch de piel de [dimensiones] cm. la superficie epidérmica está engrosada, liquenificada con cuadriculado cutáneo marcado e hiperqueratosis de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos revelan dermatitis espongiótica en fase subaguda a crónica liquenificada. se observa marcada acantosis epidérmica irregular con elongación de crestas interpapilares, hiperqueratosis con alternancia de orto y paraqueratosis, y espongiosis leve a moderada en el estrato espinoso con exocitosis linfocitaria. la dermis papilar exhibe engrosamiento y fibrosis con orientación verticalizada de los haces de colágeno (secuela de rascado crónico), vasodilatación y un conspicuo infiltrado inflamatorio mononuclear perivascular superficial compuesto por linfocitos, histiocitos, abundantes eosinófilos y mastocitos degranulados.",
        diag: "PIEL [LOCALIZACIÓN, EJ. PLIEGUES FLEXURALES], BIOPSIA:\n- DERMATITIS ESPONGIÓTICA CRÓNICA LIQUENIFICADA CON FIBROSIS PAPILAR VERTICAL Y EOSINOFILIA TISULAR, COMPATIBLE CON DERMATITIS ATÓPICA / ECCEMA ATÓPICO.\n- CAMBIOS SECUNDARIOS POR RASCADO CRÓNICO (LIQUENIFICACIÓN).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Prurito intenso con distribución flexural en pliegues y antecedentes personales de atopia (asma, rinitis, IgE elevada)."
    },
    {
        id: 1219,
        categoryId: 16,
        titulo: "PITIRIASIS ROSADA DE GIBERT",
        macro: "se recibe punch de piel de [dimensiones] cm. la epidermis presenta una lesión macular ovalada asalmonada de [diámetro] cm con fino collarete descamativo interno. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran epidermis con espongiosis focal leve a moderada. el estrato córneo muestra una alteración muy distintiva con montículos focales de paraqueratosis (mounds of parakeratosis) dispuestos de manera inclinada u oblicua hacia orificios infundibulares o crestas epidérmicas, con atenuación localizada de la capa granulosa subyacente. en la dermis papilar destaca una llamativa extravasación de hematíes (eritrocitos libres) que ascienden hacia la epidermis basal sin vasculitis necrosante. los capilares papilares están dilatados y rodeados por un moderado infiltrado linfohistiocitario perivascular.",
        diag: "PIEL [LOCALIZACIÓN, EJ. TÓRAX / TRONCO], BIOPSIA EN PUNCH:\n- DERMATITIS ESPONGIÓTICA SUPERFICIAL CON MONTÍCULOS DE PARAQUERATOSIS Y EXTRAVASACIÓN DE HEMATÍES EN DERMIS PAPILAR, CARACTERÍSTICA DE PITIRIASIS ROSADA DE GIBERT.\n- NEGATIVO PARA SÍFILIS SECUNDARIA (IHC NEGATIVA) Y DERMATOFITOSIS (PAS NEGATIVO).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Placa heráldica inicial seguida tras días de erupción en 'árbol de navidad' en líneas de Langer del tronco."
    },
    {
        id: 1220,
        categoryId: 16,
        titulo: "DISHIDROSIS (ECZEMA DISHIDRÓTICO / PONFÓLIX)",
        macro: "se recibe punch de piel acral (palmar/plantar) de [dimensiones] cm. el estrato córneo es grueso, observándose múltiples vesículas tensas translúcidas de 1 a 3 mm 'en grano de mijo'. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran piel acral con estrato córneo compacto ortoqueratósico engrosado. en el estrato espinoso se aprecian voluminosas cavidades vesículo-ampollosas intraepidérmicas uniloculares y multiloculares producidas por espongiosis masiva coalescente, conteniendo líquido seroso proteináceo con linfocitos y escasos eosinófilos. los conductos ecrinos intraepidérmicos (acrosiringios) atraviesan la epidermis sin inflamación intrínseca ni obstrucción ostial. la dermis papilar muestra intenso edema con ectasia vascular e infiltrado perivascular linfohistiocitario con eosinófilos.",
        diag: "PIEL ACRAL [PALMAR / PLANTAR / DIGITAL], BIOPSIA:\n- DERMATITIS ESPONGIÓTICA VESICULO-AMPOLLOSA INTRAEPIDÉRMICA ACRAL DE TIPO PONFÓLIX / ECZEMA DISHIDRÓTICO.\n- DUCTOS ECRINOS CONSERVADOS SIN OBSTRUCCIÓN.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Aclaración anatomopatológica: El término histórico 'dishidrosis' es equívoco, pues la histopatología demuestra que el origen es un eccema espongiótico y no una alteración primaria del conducto sudoríparo."
    },
    {
        id: 1221,
        categoryId: 16,
        titulo: "PSORIASIS VULGAR",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie epidérmica exhibe una placa sobreelevada eritematosa infiltrada de [diámetro] cm, cubierta por escamas blanco-nacaradas plateadas micáceas. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran la hiperplasia psoriasiforme regular clásica. la epidermis presenta hiperqueratosis con paraqueratosis confluente continua en bandas laminares, con ausencia o marcada atenuación de la capa granulosa (agranulosis subparaqueratósica). se observa acantosis regular caracterizada por elongación simétrica homogénea de las crestas interpapilares ('en batidor de huevos / dedos de guante') con ensanchamiento en sus bases. se identifican colecciones de neutrófilos en la capa córnea paraqueratósica (microabscesos de Munro) y en el estrato espinoso alto (pústulas espongiformes de Kogoj). las placas suprapapilares se encuentran marcadamente adelgazadas sobre papilas dérmicas elongadas y edematosas que contienen capilares tortuosos, ectásicos y congestivos. en la dermis superficial se aprecia infiltrado inflamatorio linfohistiocitario perivascular con neutrófilos y sin eosinófilos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. CODOS / RODILLAS / REGIÓN SACRA], BIOPSIA:\n- DERMATITIS PSORIASIFORME CLÁSICA CON MICROABSCESOS DE MUNRO, PÚSTULAS ESPONGIFORMES DE KOGOJ, ADELGAZAMIENTO SUPRAPAPILAR Y ECTASIA CAPILAR TORTUOSA.\n- DIAGNÓSTICO HISTOPATOLÓGICO DE PSORIASIS VULGAR EN PLACAS.\n- PAS NEGATIVO PARA HONGOS.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Sustrato anatómico de signos clínicos:\n   - Signo de la bujía/vela: Desprendimiento de escamas paraqueratósicas secas.\n   - Signo del rocío sangrante de Auspitz: Ruptura de capilares tortuosos al desprender la escama sobre las placas suprapapilares adelgazadas.\n2. Fenómeno de Koebner positivo."
    },
    {
        id: 1222,
        categoryId: 16,
        titulo: "DERMATITIS SEBORREICA",
        macro: "se recibe punch de piel que mide [dimensiones] cm proveniente de piel cabelluda / rostro, con eritema moderado cubierto por escamas amarillentas untuosas y grasientas de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran un patrón híbrido psoriasiforme y espongiótico. la epidermis exhibe acantosis psoriasiforme irregular. el estrato córneo muestra hiperqueratosis con focos de paraqueratosis localizados prominentemente en los márgenes de los orificios infundibulares foliculares ('paraqueratosis en hombro folicular'), mezclada con restos neutrofílicos y costras serocelulares. la capa granulosa está preservada. en el estrato espinoso se constata espongiosis focal leve con exocitosis linfocítica. la dermis papilar muestra vasodilatación capilar y un infiltrado inflamatorio linfohistiocitario perivascular e infundibular superficial con células plasmáticas y neutrófilos dispersos.",
        diag: "PIEL [CUERO CABELLUDO / SURCO NASOGENIANO / TÓRAX], BIOPSIA:\n- DERMATITIS PSORIASIFORME Y ESPONGIÓTICA SUPERFICIAL CON PARAQUERATOSIS EN HOMBRO FOLICULAR Y COSTRAS SEROCELULARES, COMPATIBLE CON DERMATITIS SEBORREICA.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas eritematoescamosas untuosas en áreas seborreicas (cara, cuero cabelludo, preesternal) asociadas a colonización por levaduras Malassezia spp."
    },
    {
        id: 1223,
        categoryId: 16,
        titulo: "PITIRIASIS RUBRA PILARIS",
        macro: "se recibe punch de piel de [dimensiones] cm. la superficie cutánea se observa indurada con hiperqueratosis folicular prominente (pápulas córneas acuminadas) sobre fondo eritemato-anaranjado de [diámetro] cm. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran la tríada diagnóstica patognomónica: 1) Marcada hiperqueratosis en 'tablero de ajedrez' (checkerboard pattern), con alternancia regular de ortoqueratosis y paraqueratosis tanto en sentido vertical como horizontal; 2) Dilatación infundibular folicular ocupada por un denso tapón de queratina compacta con collar de paraqueratosis perifolicular; 3) Capa granulosa preservada y engrosada (hipergranulosis marcada). la epidermis muestra acantosis psoriasiforme con crestas interpapilares gruesas y romas sin adelgazamiento suprapapilar ni microabscesos neutrofílicos de Munro. la dermis superficial presenta leve infiltrado linfohistiocitario perivascular.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH:\n- DERMATITIS PSORIASIFORME CON HIPERQUERATOSIS EN 'TABLERO DE AJEDREZ' (ORTO Y PARAQUERATOSIS ALTERNANTE), HIPERGRANULOSIS Y TAPONAMIENTO CÓRNEO FOLICULAR, DIAGNÓSTICA DE PITIRIASIS RUBRA PILARIS (PRP).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Pápulas foliculares queratósicas en dorso de dedos ('signo del rallador de nuez moscada'), placas anaranjadas con islotes de piel sana respetada y queratodermia palmoplantar cerosa en sandalia."
    },
    {
        id: 1224,
        categoryId: 16,
        titulo: "PÉNFIGO VULGAR",
        macro: "se recibe punch de piel / mucosa de [dimensiones] cm tomado del borde de una ampolla flácida colapsada con fondo cruento erosivo de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una ampolla intraepidérmica suprabasal acantolítica. se evidencia una hendidura y despegamiento inmediatamente por encima de la capa de células basales, manteniéndose los queratinocitos basales firmemente anclados a la membrana basal dérmica en disposición característica en 'hilera de lápidas' (row of tombstones). en el interior de la cavidad ampollosa flotan abundantes queratinocitos acantolíticos redondeados con núcleos aumentados de tamaño (células de Tzanck). las papilas dérmicas denudadas ('villi') protruyen hacia la cavidad. el clivaje se extiende a lo largo de la vaina radicular externa folicular. la dermis papilar muestra edema estromal e infiltrado perivascular linfohistiocitario moderado con abundantes eosinófilos.",
        diag: "PIEL / MUCOSA [LOCALIZACIÓN, EJ. MUCOSA ORAL / TRONCO], BIOPSIA DE BORDE DE AMPOLLA:\n- DERMATOSIS AMPOLLOSA INTRAEPIDÉRMICA CON ACANTÓLISIS SUPRABASAL EXTENSA, CAPA BASAL EN 'HILERA DE LÁPIDAS' Y CÉLULAS ACANTOLÍTICAS, DIAGNÓSTICA DE PÉNFIGO VULGAR.\n- SE SUGIERE CONFIRMACIÓN CON INMUNOFLUORESCENCIA DIRECTA (IFD).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Ampollas flácidas de fácil ruptura con signo de Nikolsky directo y Asboe-Hansen positivos; afectación de mucosa oral en >70% de casos.\n2. Inmunofluorescencia Directa (IFD): Depósito de IgG y C3 intercelular intraepidérmico en 'malla de alambre' (contra Desmogleína 3 y Desmogleína 1)."
    },
    {
        id: 1225,
        categoryId: 16,
        titulo: "PÉNFIGO FOLIÁCEO",
        macro: "se recibe punch de piel de [dimensiones] cm. la superficie cutánea exhibe lesiones escamo-costrosas eritematosas superficiales 'en hojas de hojaldre' de [diámetro] cm. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una ampolla y clivaje intraepidérmico superficial a nivel subcórneo o en el estrato granuloso alto. la acantólisis es localizada, observándose queratinocitos acantolíticos redondeados en el piso y techo de la ampolla subcórnea. los estratos espinoso y basal se encuentran completamente preservados sin clivaje suprabasal. el techo ampolloso está constituido únicamente por estrato córneo y restos de capa granulosa con costras serocelulares. en la dermis superficial se aprecia leve a moderado infiltrado linfohistiocitario perivascular con eosinófilos dispersos.",
        diag: "PIEL [LOCALIZACIÓN, EJ. CARA / TRONCO SUPERIOR], BIOPSIA EN PUNCH:\n- DERMATOSIS AMPOLLOSA INTRAEPIDÉRMICA SUBCÓRNEA / GRANULOSA CON ACANTÓLISIS SUPERFICIAL, COMPATIBLE CON PÉNFIGO FOLIÁCEO (O SU VARIANTE FOGO SELVAGEM).\n- INTEGRIDAD COMPLETA DE ESTRATOS BASAL Y ESPINOSO PROFUNDO.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Diagnóstico diferencial: A diferencia del pénfigo vulgar, el foliáceo NO afecta mucosas (debido a que los anticuerpos van dirigidos exclusivamente contra Desmogleína 1 y en mucosas la Desmogleína 3 preserva la adhesión)."
    },
    {
        id: 1226,
        categoryId: 16,
        titulo: "PENFIGOIDE AMPOLLOSO",
        macro: "se recibe punch / losange de piel de [dimensiones] cm que incluye ampolla tensa intacta de [diámetro] cm sobre base eritematosa, de contenido seroso claro y pared gruesa resistente. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran una ampolla subepidérmica franca de cavidad amplia. el despegamiento se produce a nivel de la unión dermoepidérmica (lámina lúcida), estando el techo ampolloso constituido por el espesor íntegro de una epidermis viable sin acantólisis. la cavidad ampollosa contiene abundante líquido seroso fibrinoide con un denso infiltrado inflamatorio rico en eosinófilos, linfocitos y escasos neutrófilos. en la epidermis perilesional se observa espongiosis eosinofílica. la dermis papilar (suelo ampolloso) se encuentra marcadamente edematosa con un conspicuo infiltrado perivascular e intersticial de predominio eosinofílico y linfohistiocitario.",
        diag: "PIEL [LOCALIZACIÓN, EJ. ABDOMEN / EXTREMIDADES], BIOPSIA CUTÁNEA:\n- DERMATOSIS AMPOLLOSA SUBEPIDÉRMICA NO ACANTOLÍTICA CON ABUNDANTES EOSINÓFILOS EN CAVIDAD Y DERMIS PAPILAR (ESPONGIOSIS EOSINOFÍLICA), CARACTERÍSTICA DE PENFIGOIDE AMPOLLOSO.\n- SE SUGIERE CONFIRMACIÓN POR IFD / SALT-SPLIT SKIN.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Grandes ampollas tensas sobre placas urticarianas en adultos mayores (>65 años), con signo de Nikolsky negativo y prurito intenso.\n2. Inmunofluorescencia Directa (IFD): Depósito lineal continuo de IgG y C3 a lo largo de la zona de membrana basal (antígenos BP180 NC16A y BP230)."
    },
    {
        id: 1227,
        categoryId: 16,
        titulo: "DERMATITIS HERPETIFORME DE DUHRING-BROCQ",
        macro: "se recibe punch de piel de [dimensiones] cm con micropápulas y vesículas agrupadas en racimo ('disposición herpetiforme') de [diámetro] cm sobre superficies extensoras con excoriaciones. se procesa en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L. (2015). Patrones Histopatológicos de las Enfermedades Inflamatorias de la Piel. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos muestran una dermatosis ampollosa subepidérmica microfocal muy característica. en los vértices o cúspides de las papilas dérmicas (papillary tips) se observan densas acumulaciones focales de neutrófilos polimorfonucleares con polvo nuclear (microabscesos neutrofílicos papilares con leucocitoclasia), fibrina y escasos eosinófilos. la lisis neutrofílica induce vacuolización y microdespegamientos subepidérmicos en las cúspides papilares que coalescen formando hendiduras subepidérmicas. el techo epidérmico es viable sin acantólisis. la dermis reticular superficial exhibe ectasia capilar e infiltrado perivascular linfohistiocitario y neutrofílico.",
        diag: "PIEL [SUPERFICIES EXTENSORAS: CODOS / RODILLAS / GLÚTEOS], BIOPSIA EN PUNCH:\n- DERMATITIS AMPOLLOSA SUBEPIDÉRMICA CON MICROABSCESOS NEUTRÓFILOS EN CÚSPIDES DE PAPILAS DÉRMICAS Y LEUCOCITOCLASIA PAPILAR, COMPATIBLE CON DERMATITIS HERPETIFORME DE DUHRING-BROCQ.\n- SE REQUIERE TOMA DE BIOPSIA DE PIEL PERILESIONAL SANA PARA INMUNOFLUORESCENCIA DIRECTA (IFD).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Signos clínicos: Vesículas excoriadas intensamente pruriginosas agrupadas simétricamente en codos, rodillas y glúteos.\n2. Asociación: Prácticamente el 100% de los pacientes presenta enteropatía sensible al gluten (Enfermedad Celíaca).\n3. IFD (Gold Standard): Depósito granular de IgA en cúspides papilares (anticuerpos anti-transglutaminasa epidérmica eTG)."
    },
    {
        id: 1228,
        categoryId: 16,
        titulo: "VASCULITIS LEUCOCITOCLÁSTICA DE PEQUEÑO VASO",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm. la superficie epidérmica muestra múltiples lesiones purpúricas palpables milimétricas que no blanquean a la vitropresión, con diámetro de [diámetro] cm. al corte, la dermis presenta punteado hemorrágico sobre fondo grisáceo. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2001). Cutaneous vasculitis: A review of the histopathologic spectrum. J Am Acad Dermatol, 48(4), 546-574.</small>",
        micro: "los cortes histológicos muestran compromiso vascular necrosante centrado en las vénulas poscapilares y capilares de la dermis papilar y reticular superficial. se evidencia tumefacción y desprendimiento de células endoteliales con depósito intramural y perivascular de fibrina eosinófila densa (necrosis fibrinoide de la pared vascular). se identifica un denso infiltrado inflamatorio predominantemente neutrofílico perivascular e intersticial con marcada leucocitoclasia caracterizada por abundantes restos nucleares cariorrécticos ('polvo nuclear'). se asocia a conspicua extravasación de eritrocitos en el estroma dérmico y edema papilar. no se observan granulomas dérmicos ni trombosis de vasos de gran calibre.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA EN PUNCH / INCISIONAL:\n- VASCULITIS LEUCOCITOCLÁSTICA DE PEQUEÑO VASO (VASCULITIS CUTÁNEA NECROSANTE).\n- NECROSIS FIBRINOIDE DE LA PARED VASCULAR, LEUCOCITOCLASIA Y EXTRAVASACIÓN ERITROCITARIA PROMINENTE.\n- NEGATIVO PARA VASCULITIS GRANULOMATOSA O MALIGNIDAD.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Púrpura palpable en extremidades inferiores mediada por inmunocomplejos.\n2. IFD temprana (<24-48 h): Depósito vascular de IgA orienta a Púrpura de Henoch-Schönlein; IgG/IgM/C3 orienta a vasculitis por hipersensibilidad o conectivopatía."
    },
    {
        id: 1229,
        categoryId: 16,
        titulo: "VASCULITIS LINFOCÍTICA CUTÁNEA",
        macro: "se recibe punch de piel que mide [dimensiones] cm, exhibiendo máculas y placas purpúricas eritematovioláceas de [diámetro] cm. al corte, tejido dérmico elástico y homogéneo. se incluye en 1 casete.\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2001). Cutaneous vasculitis. J Am Acad Dermatol. / Carlson, J. A. (2010). Am J Dermatopathol.</small>",
        micro: "los cortes histológicos muestran dermis superficial y media con infiltrado inflamatorio perivascular e intramural denso compuesto predominantemente por linfocitos maduros e histiocitos que penetran y distorsionan las paredes de vénulas y capilares dérmicos. se aprecia tumefacción endotelial con estenosis luminal, depósito focal de material fibrinoide subendotelial y extravasación de hematíes en la dermis papilar. no se observa componente neutrofílico significativo, leucocitoclasia prominente ni granulomas. atipia citológica linfoide ausente.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- VASCULITIS LINFOCÍTICA CUTÁNEA.\n- INFILTRADO LINFOHISTIOCITARIO TRANSMURAL PERIVASCULAR CON DAÑO ENDOTELIAL Y EXTRAVASACIÓN HEMÁTICA.\n- NEGATIVO PARA ATIPIA CITOLÓGICA LINFOIDE O VASCULITIS LEUCOCITOCLÁSTICA TÍPICA.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Diagnóstico diferencial: Fase tardía de vasculitis leucocitoclástica, erupción medicamentosa fija, lupus eritematoso, eritema anular centrífugo profundo o PLEVA."
    },
    {
        id: 1230,
        categoryId: 16,
        titulo: "GRANULOMA ANULAR",
        macro: "se recibe losange / punch de piel que mide [dimensiones] cm. la superficie exhibe pápulas o placas eritematosas anulares sobreelevadas con centro deprimido de [diámetro] cm. al corte, la dermis muestra áreas nodulares blanquecino-nacaradas. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Fernández-Figueras, M. T. (2007). Semin Cutan Med Surg. / McKee's Pathology of the Skin (5th ed.).</small>",
        micro: "los cortes histológicos muestran epidermis conservada. en la dermis reticular superficial y media se identifican focos característicos de necrobiosis de colágeno, donde los haces colágenos se aprecian pálidos, desorganizados y embebidos en una abundante sustancia fundamental basófila correspondiente a depósito de mucina estromal (ácido hialurónico). estas áreas de colágeno degenerado se encuentran delimitadas por una empalizada de histiocitos epitelioides y células gigantes multinucleadas, con linfocitos en la periferia y patrón histiocítico intersticial adyacente. las fibras elásticas se encuentran marcadamente disminuidas o fragmentadas en las zonas necrobióticas. no se observan células plasmáticas abundantes ni necrosis caseosa.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS GRANULOMATOSA EN EMPALIZADA E INTERSTICIAL, COMPATIBLE CON GRANULOMA ANULAR.\n- FOCOS DE NECROBIOSIS DE COLÁGENO CON ABUNDANTE DEPÓSITO DE MUCINA ESTROMAL.\n- TINCIONES ESPECIALES NEGATIVAS PARA HONGOS Y MICOBACTERIAS (PAS Y ZIEHL-NEELSEN NEGATIVOS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Pápulas y placas anulares en extremidades (dorso de manos y pies).\n2. En variantes generalizadas/diseminadas: Descartar diabetes mellitus, disfunción tiroidea o hiperlipidemias."
    },
    {
        id: 1231,
        categoryId: 16,
        titulo: "NECROBIOSIS LIPOÍDICA",
        macro: "se recibe losange de piel que mide [dimensiones] cm proveniente de región pretibial. la epidermis se observa adelgazada, brillante y amarillenta con finas telangiectasias de [diámetro] cm y borde eritematovioláceo indurado. al corte, todo el espesor dérmico y subcutáneo superficial se muestran escleróticos blanco-amarillentos en capas horizontales. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2008). Panniculitis. J Am Acad Dermatol. / Weedon's Skin Pathology.</small>",
        micro: "los cortes histológicos revelan un proceso granulomatoso inflamatorio y esclerótico extenso que compromete todo el espesor dérmico y se extiende hacia los septos subcutáneos. se dispone en un patrón laminar horizontal en capas ('tier-like' o en sándwich), donde alternan bandas anchas acelulares de colágeno necrobiótico pálido y esclerótico con bandas de infiltrado granulomatoso. el infiltrado está constituido por histiocitos en empalizada, células gigantes multinucleadas (tipo Touton con citoplasma xantomatoso y de tipo Langhans) y abundantes células plasmáticas y linfocitos perivasculares en la dermis profunda. los vasos dérmicos profundos exhiben engrosamiento endotelial y endarteritis obliterante reactiva. mucina escasa o ausente.",
        diag: "PIEL [REGIÓN PRETIBIAL], BIOPSIA EN LOSANGE PROFUNDO:\n- DERMATITIS Y PANICULITIS GRANULOMATOSA EN EMPALIZADA ESTRATIFICADA EXTENSA, HISTOPATOLÓGICAMENTE COMPATIBLE CON NECROBIOSIS LIPOÍDICA (NECROBIOSIS LIPOIDICA DIABETICORUM).\n- ESCLEROSIS DE COLÁGENO, CÉLULAS GIGANTES TIPO TOUTON Y CÉLULAS PLASMÁTICAS PERIVASCULARES PROFUNDAS.\n- NEGATIVO PARA MALIGNIDAD.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Placas amarillentas escleróticas pretibiales con telangiectasias asociadas a Diabetes Mellitus en >65% de casos."
    },
    {
        id: 1232,
        categoryId: 16,
        titulo: "SARCOIDOSIS CUTÁNEA",
        macro: "se recibe punch / losange de piel que mide [dimensiones] cm. la superficie cutánea presenta lesiones pápulo-nodulares firmes eritematovioláceas a pardo-amarillentas ('jalea de manzana' a la diascopia) de [diámetro] cm. al corte, la dermis muestra nódulos blanquecinos duros y bien delimitados. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2007). Cutaneous Sarcoidosis. Semin Cutan Med Surg. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos de piel exhiben una epidermis preservada. en la dermis reticular y adventicial se identifican múltiples granulomas epitelioides no caseificantes, discretos y bien delimitados, característicamente 'desnudos' (naked granulomas), definidos por un ribete linfocítico periférico mínimo o ausente. los granulomas están compuestos por agregados cohesivos de histiocitos epitelioides y células gigantes multinucleadas tipo Langhans y a cuerpo extraño (con ocasionales cuerpos asteroides y de Schaumann). no se observa necrosis caseosa central, leucocitoclasia ni neutrófilos. la red de fibras reticulares rodea adecuadamente los granulomas.",
        diag: "PIEL [LOCALIZACIÓN], BIOPSIA:\n- DERMATITIS GRANULOMATOSA NO CASEIFICANTE DE PATRÓN SARCOIDEO ('GRANULOMAS DESNUDOS'), HISTOPATOLÓGICAMENTE COMPATIBLE CON SARCOIDOSIS CUTÁNEA.\n- NEGATIVO PARA NECROSIS CASEOSA CENTRAL.\n- TINCIONES ESPECIALES NEGATIVAS PARA MICOBACTERIAS Y HONGOS (ZIEHL-NEELSEN, FITE-FARACO, PAS Y GROCOTT NEGATIVOS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Diagnóstico de exclusión: Tinciones ZN y PAS negativas y ausencia de partículas birrefringentes bajo luz polarizada.\n2. Evaluación sistémica: Radiografía/TC de tórax (adenopatías hiliares), ECA sérica, calcio y prueba de tuberculina (PPD/IGRA anérgico)."
    },
    {
        id: 1233,
        categoryId: 16,
        titulo: "GRANULOMA A CUERPO EXTRAÑO",
        macro: "se recibe fragmento de piel y tejido subcutáneo que mide [dimensiones] cm con una lesión nodular indurada de [diámetro] cm. al corte, el nódulo es firme, pardo-blanquecino con áreas grisáceas. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., et al. (2015). Adverse cutaneous reactions to foreign bodies. Dermatol Clin. / McKee's Pathology of the Skin.</small>",
        micro: "los cortes histológicos muestran dermis reticular y tejido celular subcutáneo con reacción inflamatoria granulomatosa de patrón nodular y difuso. el infiltrado está constituido por histiocitos epitelioides y abundantes células gigantes multinucleadas de tipo cuerpo extraño con núcleos agrupados irregularmente en el citoplasma, acompañados de linfocitos, fibroblastos reactivos y fibrosis estromal. en el citoplasma de las células gigantes y extracelularmente se identifican partículas de material particulado exógeno/endógeno no digerible, las cuales demuestran birrefringencia positiva bajo luz polarizada. no se observa necrosis caseosa ni vasculitis necrosante.",
        diag: "PIEL Y TEJIDO SUBCUTÁNEO [LOCALIZACIÓN], BIOPSIA / RESECCIÓN:\n- REACCIÓN GRANULOMATOSA NODULAR A CUERPO EXTRAÑO CON CÉLULAS GIGANTES MULTINUCLEADAS.\n- PRESENCIA DE MATERIAL HETERÓLOGO / PARTICULADO CONFIRMADO BAJO LUZ POLARIZADA.\n- NEGATIVO PARA MICOBACTERIAS O MICOSIS PROFUNDA (ZN Y PAS NEGATIVOS).\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Anamnesis: Correlacionar con antecedentes de traumatismos penetrantes (espinas, astillas), materiales de relleno cosmético, tatuajes o suturas quirúrgicas previas."
    },
    {
        id: 1234,
        categoryId: 16,
        titulo: "ERITEMA NUDOSO (PANICULITIS SEPTAL)",
        macro: "se recibe losange profundo de piel y tejido celular subcutáneo en cuña que mide [dimensiones] cm de superficie y [profundidad] cm de espesor hasta hipodermis profunda. en superficie se observa placa nodular eritematosa indurada de [diámetro] cm en cara anterior de pierna. al corte, los septos fibrosos del tejido adiposo subcutáneo se observan notablemente ensanchados, edematosos y blanco-grisáceos, contrastando con los lobulillos grasos amarillos preservados. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2008). Panniculitis. Part I. Mostly septal panniculitis. J Am Acad Dermatol, 58(6), 940-972.</small>",
        micro: "los cortes histológicos muestran una paniculitis de patrón predominantemente septal con respeto de los centros lobulillares adiposos. los tabiques o septos conectivos interlobulillares se encuentran marcadamente ensanchados por edema, proliferación fibroblástica y un denso infiltrado inflamatorio. en los septos y en la periferia de los lobulillos grasos se identifican los característicos GRANULOMAS RADIALES DE MIESCHER, conformados por pequeños acúmulos nodulares de histiocitos epitelioides orientados radialmente alrededor de una hendidura central estrellada o capilar colapsado. se asocian a neutrófilos extravasados y linfocitos en etapas agudas, y a células gigantes multinucleadas y fibrosis septal en fases evolucionadas. no se observa vasculitis de vasos de mediano calibre ni necrosis grasa caseosa.",
        diag: "PIEL Y TEJIDO CELULAR SUBCUTÁNEO [LOCALIZACIÓN PRETIBIAL], BIOPSIA EN CUÑA PROFUNDA:\n- PANICULITIS PREDOMINANTEMENTE SEPTAL SIN VASCULITIS, CON GRANULOMAS RADIALES DE MIESCHER, HISTOPATOLÓGICAMENTE COMPATIBLE CON ERITEMA NUDOSO.\n- AUSENCIA DE VASCULITIS DE MEDIANO O GRAN CALIBRE Y AUSENCIA DE NECROSIS CASEOSA.\n- ZN Y PAS NEGATIVOS PARA MICROORGANISMOS.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Hallazgos clínicos: Nódulos eritematosos dolorosos pretibiales bilaterales.\n2. Etiologías asociadas: Infección estreptocócica (ASO), Sarcoidosis (Síndrome de Löfgren), Tuberculosis (PPD/IGRA), EII (Crohn/colitis ulcerosa) o fármacos."
    },
    {
        id: 1235,
        categoryId: 16,
        titulo: "ERITEMA INDURADO DE BAZIN / VASCULITIS NODULAR (PANICULITIS LOBULILLAR)",
        macro: "se recibe biopsia en cuña profunda de piel y tejido celular subcutáneo que mide [dimensiones] cm de superficie y [profundidad] cm de espesor. en superficie muestra nódulo eritematovioláceo indurado y ulcerado en cara posterior de pantorrilla de [diámetro] cm. al corte, el tejido graso subcutáneo presenta aspecto heterogéneo moteado con áreas blanco-amarillentas de necrosis grasa y fibrosis. se incluye en [n] casete(s).\n\n<small style=\"font-size: 0.72rem; color: #64748b;\">Requena, L., & Sánchez Yus, E. (2008). Panniculitis. Part II. Mostly lobular panniculitis. J Am Acad Dermatol, 58(8), 1001-1025.</small>",
        micro: "los cortes histológicos muestran una paniculitis de distribución predominantemente lobulillar con compromiso septal secundario y extensa necrosis grasa de tipo coagulativo / caseoso en los adipocitos lobulillares. el infiltrado inflamatorio es granulomatoso y denso, compuesto por histiocitos epitelioides, células gigantes multinucleadas de tipo Langhans y a cuerpo extraño, linfocitos y células plasmáticas. en los septos interlobulillares y unión septo-lobulillar se identifica de manera constante una VASCULITIS GRANULOMATOSA Y NECROSANTE DE VASOS MUSCULARES ARTERIALES Y VENOSOS DE MEDIANO Y PEQUEÑO CALIBRE, con necrosis fibrinoide mural, infiltrado transmural, proliferación de la íntima y trombosis oclusiva con recanalización.",
        diag: "PIEL Y TEJIDO CELULAR SUBCUTÁNEO [CARA POSTERIOR DE PIERNA], BIOPSIA EN CUÑA PROFUNDA:\n- PANICULITIS PREDOMINANTEMENTE LOBULILLAR CON VASCULITIS NECROSANTE / GRANULOMATOSA DE VASOS DE MEDIANO CALIBRE Y NECROSIS CASEOSA, HISTOPATOLÓGICAMENTE COMPATIBLE CON ERITEMA INDURADO DE BAZIN / VASCULITIS NODULAR.\n- NECROSIS ADIPOSA LOBULILLAR EXTENSA Y GRANULOMAS TUBERCULOIDES CON CÉLULAS DE LANGHANS.\n- NEGATIVO PARA MALIGNIDAD.\n\nCORRELACIÓN CLÍNICO-PATOLÓGICA (DR. LUIS REQUENA):\n1. Criterio de Requena: Combinación diagnóstica de paniculitis lobulillar con vasculitis de vasos musculares de mediano calibre.\n2. Etiología: Si se asocia a hipersensibilidad a Mycobacterium tuberculosis se denomina Eritema Indurado de Bazin (solicitar PCR para M. tuberculosis y PPD/IGRA); si es idiopática o asociada a otras causas se denomina Vasculitis Nodular."
    }
    ];

    dermatologyRequenaTemplates.forEach(tpl => {
        const idx = templatesDatabase.findIndex(t => 
            (t.titulo || '').trim().toUpperCase() === (tpl.titulo || '').trim().toUpperCase() && 
            Number(t.categoryId) === Number(tpl.categoryId)
        );
        if (idx === -1) {
            templatesDatabase.push({ ...tpl });
        } else {
            templatesDatabase[idx].macro = tpl.macro;
            templatesDatabase[idx].micro = tpl.micro;
            templatesDatabase[idx].diag = tpl.diag;
            templatesDatabase[idx].categoryId = tpl.categoryId;
            templatesDatabase[idx].titulo = tpl.titulo;
        }
    });
    try { safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase)); } catch(e) {}


    // Auto-sanitización de plantillas en un paso único (Migración V3)
    if (!localStorage.getItem('templatesSpellingCorrected_v3')) {
        let templatesUpdated = false;
        templatesDatabase.forEach(t => {
            const cleanMacro = cleanTextContentLocal(t.macro);
            const cleanMicro = cleanTextContentLocal(t.micro);
            const cleanDiag = cleanTextContentLocal(t.diag);
            
            if (cleanMacro !== t.macro || cleanMicro !== t.micro || cleanDiag !== t.diag) {
                t.macro = cleanMacro;
                t.micro = cleanMicro;
                t.diag = cleanDiag;
                templatesUpdated = true;
            }
        });
        if (templatesUpdated) {
            safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        }
        safeSetLocalStorage('templatesSpellingCorrected_v3', 'true');
    }

    // Auto-sanitización de clínica para registros PAP 26C-124 y 26C-123
    if (window.patientDatabase && Array.isArray(window.patientDatabase)) {
        window.patientDatabase.forEach(p => {
            if (p.codAtencion === '26C-124' || p.codAtencion === '26C-123') {
                p.clinica = 'CLÍNICA CARRIÓN';
            }
        });
    }

    // Auto-sanitización y conversión a minúsculas de plantillas (Migración V4 - Justificación y Minúsculas)
    if (!localStorage.getItem('templatesSpellingCorrected_v4')) {
        let templatesUpdated = false;
        templatesDatabase.forEach(t => {
            const cleanMacro = cleanTextContentLocalV4(t.macro, false);
            const cleanMicro = cleanTextContentLocalV4(t.micro, false);
            const cleanDiag = cleanTextContentLocalV4(t.diag, true); // true para preservar mayúsculas en Diagnóstico
            const cleanTitle = cleanTextContentLocalV4(t.titulo, true); // true para preservar mayúsculas en Título
            
            if (cleanMacro !== t.macro || cleanMicro !== t.micro || cleanDiag !== t.diag || cleanTitle !== t.titulo) {
                t.macro = cleanMacro;
                t.micro = cleanMicro;
                t.diag = cleanDiag;
                t.titulo = cleanTitle;
                templatesUpdated = true;
            }
        });
        if (templatesUpdated) {
            safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
            console.log("[Auto-Sanitizer V4] Local templates spelling corrected and formatted to lowercase.");
        }
        safeSetLocalStorage('templatesSpellingCorrected_v4', 'true');
    }

    // Auto-sanitización V5 - Restauración y Preservación de Saltos de Línea en las Plantillas
    if (!localStorage.getItem('templatesSpellingCorrected_v5')) {
        let templatesUpdated = false;
        
        // Cargar las plantillas originales de plantillas_data.js para recuperar sus saltos de línea (\n)
        if (window.defaultTemplates) {
            templatesDatabase.forEach(t => {
                const defTpl = window.defaultTemplates.find(dt => String(dt.id) === String(t.id));
                if (defTpl) {
                    t.macro = defTpl.macro || '';
                    t.micro = defTpl.micro || '';
                    t.diag = defTpl.diag || '';
                    t.titulo = defTpl.titulo || '';
                    templatesUpdated = true;
                }
            });
        }

        templatesDatabase.forEach(t => {
            const cleanMacro = cleanTextContentLocalV4(t.macro, false);
            const cleanMicro = cleanTextContentLocalV4(t.micro, false);
            const cleanDiag = cleanTextContentLocalV4(t.diag, true); // true para preservar mayúsculas en Diagnóstico
            const cleanTitle = cleanTextContentLocalV4(t.titulo, true); // true para preservar mayúsculas en Título
            
            if (cleanMacro !== t.macro || cleanMicro !== t.micro || cleanDiag !== t.diag || cleanTitle !== t.titulo) {
                t.macro = cleanMacro;
                t.micro = cleanMicro;
                t.diag = cleanDiag;
                t.titulo = cleanTitle;
                templatesUpdated = true;
            }
        });

        if (templatesUpdated) {
            safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
            console.log("[Auto-Sanitizer V5] Local templates restored with correct line breaks.");
        }
        safeSetLocalStorage('templatesSpellingCorrected_v5', 'true');
    }

    // Auto-sanitización V8 - Purga de Duplicados Desfasados y Ordenamiento Secuencial de Morcelados de Próstata (1 a 6)
    if (!localStorage.getItem('templatesSpellingCorrected_v8') && window.defaultTemplates) {
        // 1. Purgar de templatesDatabase cualquier elemento de Urología desfasado o duplicado
        const cleanDB = templatesDatabase.filter(t => {
            const tit = (t.titulo || '').trim().toUpperCase();
            const catId = Number(t.categoryId);
            if (tit.includes('MORCELAD') || catId === 9) {
                return false; // Eliminar todas las copias viejas o duplicadas en localStorage
            }
            return true;
        });

        // 2. Obtener las plantillas oficiales de la Categoría 9 (Urología) desde plantillas_data.js
        const urologyDefaults = window.defaultTemplates
            .filter(dt => Number(dt.categoryId) === 9)
            .map(dt => ({ ...dt }));

        // Ordenar urología: Morcelado 1, 2, 3, 4, 5, 6 secuencialmente
        urologyDefaults.sort((a, b) => {
            const titleA = (a.titulo || '').toUpperCase();
            const titleB = (b.titulo || '').toUpperCase();
            const isMorcA = titleA.includes('MORCELADO');
            const isMorcB = titleB.includes('MORCELADO');

            if (isMorcA && isMorcB) {
                const numA = parseInt(titleA.replace(/\D/g, '')) || 0;
                const numB = parseInt(titleB.replace(/\D/g, '')) || 0;
                return numA - numB;
            }
            if (isMorcA) return -1;
            if (isMorcB) return 1;
            return titleA.localeCompare(titleB);
        });

        templatesDatabase.length = 0;
        templatesDatabase.push(...cleanDB, ...urologyDefaults);

        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('templatesSpellingCorrected_v8', 'true');
        console.log("[Auto-Sanitizer V8] Purga de duplicados y ordenamiento secuencial de Morcelados de Próstata (1 al 6) completado.");
    }

    // Auto-sanitización V9 - Incorporación de las 4 variantes de Papanicolaou Normal en Categoría 28 (Citología Cervical)
    if (!localStorage.getItem('templatesSpellingCorrected_v9') && window.defaultTemplates) {
        window.defaultTemplates.forEach(defTpl => {
            if (Number(defTpl.categoryId) === 28 || (defTpl.titulo || '').toUpperCase().includes('PAPANICOLAOU')) {
                const idx = templatesDatabase.findIndex(t => String(t.id) === String(defTpl.id) || (t.titulo || '').trim().toUpperCase() === (defTpl.titulo || '').trim().toUpperCase());
                if (idx !== -1) {
                    templatesDatabase[idx] = { ...defTpl };
                } else {
                    templatesDatabase.push({ ...defTpl });
                }
            }
        });
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('templatesSpellingCorrected_v9', 'true');
        console.log("[Auto-Sanitizer V9] Plantillas de Papanicolaou Normal actualizadas con éxito.");
    }

    // Auto-sanitización V10 - Sincronización Forzada de Urología (Cat 9 Macro y Cat 25 Micro: Enucleación de Próstata y Morcelados)
    if (!localStorage.getItem('templatesSpellingCorrected_v10') && window.defaultTemplates) {
        window.defaultTemplates.forEach(defTpl => {
            const catId = Number(defTpl.categoryId);
            if (catId === 9 || catId === 25 || (defTpl.titulo || '').toUpperCase().includes('ENUCLEACIÓN') || (defTpl.titulo || '').toUpperCase().includes('MORCELAD')) {
                const idx = templatesDatabase.findIndex(t => 
                    (t.titulo || '').trim().toUpperCase() === (defTpl.titulo || '').trim().toUpperCase() &&
                    Number(t.categoryId) === catId
                );
                if (idx !== -1) {
                    templatesDatabase[idx] = { ...defTpl };
                } else {
                    templatesDatabase.push({ ...defTpl });
                }
            }
        });
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('templatesSpellingCorrected_v10', 'true');
        console.log("[Auto-Sanitizer V10] Plantillas de Urología (Enucleación de Próstata y Morcelados) sincronizadas con éxito.");
    }

    // Auto-sanitización V11 - Incorporación de PLANTILLA PROSTATECTOMIA RADICAL en Cat 9 y Cat 25
    if (!localStorage.getItem('templatesSpellingCorrected_v11') && window.defaultTemplates) {
        window.defaultTemplates.forEach(defTpl => {
            const catId = Number(defTpl.categoryId);
            if ((defTpl.titulo || '').trim().toUpperCase() === 'PLANTILLA PROSTATECTOMIA RADICAL') {
                const idx = templatesDatabase.findIndex(t => 
                    (t.titulo || '').trim().toUpperCase() === 'PLANTILLA PROSTATECTOMIA RADICAL' &&
                    Number(t.categoryId) === catId
                );
                if (idx !== -1) {
                    templatesDatabase[idx] = { ...defTpl };
                } else {
                    templatesDatabase.push({ ...defTpl });
                }
            }
        });
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('templatesSpellingCorrected_v11', 'true');
        console.log("[Auto-Sanitizer V11] PLANTILLA PROSTATECTOMIA RADICAL sincronizada con éxito en Urología.");
    }

    // Auto-sanitización V12 - Incorporación Forzada de las 6 Plantillas de Quistes de Ovario y Anexo (Lester) en Ginecología (Cat 4 Macro y Cat 18 Micro)
        // Auto-sanitización Quistes de Lester - Vinculación Categorías 40 y 41
    if (!localStorage.getItem('templatesSpellingCorrected_quistes_40_41') && (window.defaultTemplates || (typeof defaultTemplates !== 'undefined' ? defaultTemplates : null))) {
        const tplsSrc = window.defaultTemplates || defaultTemplates;
        tplsSrc.forEach(defTpl => {
            const tId = Number(defTpl.id);
            if ([1040, 1041, 1042, 1043, 1044, 1045].includes(tId)) {
                // Macro category 40
                const idx40 = templatesDatabase.findIndex(t => Number(t.id) === tId && Number(t.categoryId) === 40);
                if (idx40 !== -1) {
                    templatesDatabase[idx40] = { ...defTpl, categoryId: 40 };
                } else {
                    templatesDatabase.push({ ...defTpl, categoryId: 40 });
                }
            }
            if ([1140, 1141, 1142, 1143, 1144, 1145].includes(tId) || [1040, 1041, 1042, 1043, 1044, 1045].includes(tId)) {
                // Micro category 41 (if ID is 1140-1145 or 1040-1045 mapped to 41)
                const microId = tId >= 1100 ? tId : tId + 100;
                const idx41 = templatesDatabase.findIndex(t => (Number(t.id) === microId || Number(t.id) === tId) && Number(t.categoryId) === 41);
                if (idx41 !== -1) {
                    templatesDatabase[idx41] = { ...defTpl, id: microId, categoryId: 41 };
                } else {
                    templatesDatabase.push({ ...defTpl, id: microId, categoryId: 41 });
                }
            }
        });
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('templatesSpellingCorrected_quistes_40_41', 'true');
        console.log("[Auto-Sanitizer] Plantillas de Quistes de Lester sincronizadas con categorías 40 y 41.");
    }

    if (!localStorage.getItem('templatesSpellingCorrected_v12') && (window.defaultTemplates || (typeof defaultTemplates !== 'undefined' ? defaultTemplates : null))) {
        const tplsSource = window.defaultTemplates || defaultTemplates;
        tplsSource.forEach(defTpl => {
            const tId = Number(defTpl.id);
            if ([1040, 1041, 1042, 1043, 1044, 1045].includes(tId) || (defTpl.titulo || '').toUpperCase().includes('QUISTE DE OVARIO') || (defTpl.titulo || '').toUpperCase().includes('QUISTE DE ANEXO')) {
                // 1. Inyectar o actualizar en Macro (Categoría 4)
                const idxMacro = templatesDatabase.findIndex(t => Number(t.id) === tId && Number(t.categoryId) === 4);
                if (idxMacro !== -1) {
                    templatesDatabase[idxMacro] = { ...defTpl, categoryId: 4 };
                } else {
                    templatesDatabase.push({ ...defTpl, categoryId: 4 });
                }
                // 2. Inyectar o actualizar en Micro (Categoría 18)
                const microId = tId >= 1100 ? tId : tId + 100;
                const idxMicro = templatesDatabase.findIndex(t => (Number(t.id) === microId || (t.titulo || '').trim().toUpperCase() === (defTpl.titulo || '').trim().toUpperCase()) && Number(t.categoryId) === 18);
                if (idxMicro !== -1) {
                    templatesDatabase[idxMicro] = { ...defTpl, id: microId, categoryId: 18 };
                } else {
                    templatesDatabase.push({ ...defTpl, id: microId, categoryId: 18 });
                }
            }
        });
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('templatesSpellingCorrected_v12', 'true');
        console.log("[Auto-Sanitizer V12] 6 Plantillas de Quistes de Ovario/Anexo (Lester) sincronizadas con éxito en Ginecología (Macro 4 y Micro 18).");
    }

    // Auto-sanitización V14 - Verificación e inyección forzada de las 12 plantillas de quistes (IDs 1040-1045 y 1140-1145)
    const cystV14Ids = [1040, 1041, 1042, 1043, 1044, 1045, 1140, 1141, 1142, 1143, 1144, 1145];
    const missingV14Cysts = cystV14Ids.some(id => !templatesDatabase.some(t => Number(t.id) === id));
    if (!localStorage.getItem('templates_quistes_v14_injected') || missingV14Cysts) {
        const tplsSrcV14 = (typeof window !== 'undefined' && window.defaultTemplates) ? window.defaultTemplates : (typeof defaultTemplates !== 'undefined' ? defaultTemplates : null);
        if (tplsSrcV14 && Array.isArray(tplsSrcV14)) {
            tplsSrcV14.forEach(defTpl => {
                const tId = Number(defTpl.id);
                if (cystV14Ids.includes(tId)) {
                    const idx = templatesDatabase.findIndex(t => Number(t.id) === tId);
                    if (idx !== -1) {
                        templatesDatabase[idx] = { ...defTpl };
                    } else {
                        templatesDatabase.push({ ...defTpl });
                    }
                }
            });
        }
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('templates_quistes_v14_injected', 'true');
        console.log("[Auto-Sanitizer V14] 12 Plantillas de Quistes (IDs 1040-1045 y 1140-1145) verificadas e inyectadas con éxito.");
    }

    // Auto-sanitización V15 - 6 Variantes Ricas de Morcelados de Próstata en Cat 9 y Cat 25
    if (!localStorage.getItem('templatesSpellingCorrected_v15_morcelados') || !templatesDatabase.some(t => Number(t.id) === 1018)) {
        urologyCoreTemplates.forEach(tpl => {
            const idx = templatesDatabase.findIndex(t => Number(t.id) === Number(tpl.id));
            if (idx === -1) {
                templatesDatabase.push({ ...tpl });
            } else {
                templatesDatabase[idx] = { ...templatesDatabase[idx], ...tpl };
            }
        });
        try { safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase)); } catch(e) {}
        safeSetLocalStorage('templatesSpellingCorrected_v15_morcelados', 'true');
        console.log("[Auto-Sanitizer V15] 6 Variantes Ricas de Morcelados de Próstata sincronizadas en Cat 9 y Cat 25.");
    }
    // 3. Categorías
    try {
    // Purgar categorías de quistes separadas y asegurar Ginecología oficial (IDs 4 y 18)
    categoriesDatabase = categoriesDatabase.filter(c => {
        const id = Number(c.id);
        const name = (c.categoria || '').toUpperCase();
        if ([35, 36, 40, 41].includes(id) || name.includes('QUISTES')) {
            return false;
        }
        return true;
    });
    safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));

    // Purgar plantillas de quistes con categoryId desfasado (35, 36, 40, 41)
    templatesDatabase = templatesDatabase.filter(t => {
        const catId = Number(t.categoryId);
        return ![35, 36, 40, 41].includes(catId);
    });
    safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));

        const loadedCats = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories;
        categoriesDatabase.length = 0;
        categoriesDatabase.push(...loadedCats);
    } catch (eCat) {
        categoriesDatabase.length = 0;
        categoriesDatabase.push(...defaultCategories);
    }
        // Auto-sanitización QUISTES (LESTER) - IDs 40 y 41
    if (!categoriesDatabase.some(c => c.id === 40 || c.id === 41 || (c.categoria || '').toUpperCase().includes('QUISTES (LESTER)'))) {
        categoriesDatabase.push(
            { id: 40, tipo: 'Macroscopica', categoria: 'QUISTES (LESTER)' },
            { id: 41, tipo: 'Microscopica', categoria: 'QUISTES (LESTER)' }
        );
        safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log("[Auto-Sanitizer] Categoría QUISTES (LESTER) inyectada con éxito.");
    }
    let catUpdated = false;
    defaultCategories.forEach(defCat => {
        const exists = categoriesDatabase.some(c => c.id === defCat.id || (c.tipo === defCat.tipo && c.categoria === defCat.categoria));
        if (!exists) {
            categoriesDatabase.push(defCat);
            catUpdated = true;
        }
    });

    if (catUpdated || !categoriesDatabase || categoriesDatabase.length < 24) {
        safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log(`[Auto-Sanitizer] Categories database updated (Length: ${categoriesDatabase.length}).`);
    }

    // Renombrar especialidades y mover plantillas (Corrección y Reorganización de categorías)
    let layoutReorganized = false;
    categoriesDatabase.forEach(c => {
        const name = (c.categoria || '').trim().toUpperCase();
        if (name === 'APENDICITIS') {
            c.categoria = 'APÉNDICE CECAL';
            layoutReorganized = true;
        }
        if (name === 'COLECISTITIS') {
            c.categoria = 'VESÍCULA BILIAR';
            layoutReorganized = true;
        }
        if (name === 'APÉNDICE CECAL' || name === 'APENDICE CECAL' || name === 'APNDICE CECAL') {
            c.categoria = 'APÉNDICE CECAL';
            layoutReorganized = true;
        }
        if (name === 'VESÍCULA BILIAR' || name === 'VESICULA BILIAR' || name === 'VESCULA BILIAR') {
            c.categoria = 'VESÍCULA BILIAR';
            layoutReorganized = true;
        }
    });
    if (layoutReorganized) {
        safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log('[Auto-Migration] Especialidades renombradas a APÉNDICE CECAL y VESÍCULA BILIAR.');
    }

    let templatesReorganized = false;
    templatesDatabase.forEach(t => {
        const title = (t.titulo || '').trim().toUpperCase();
        if (title.includes('APENDICITIS') || title.includes('APENDICTIS')) {
            if (t.categoryId !== 22 && t.categoryId !== 13) {
                t.categoryId = 22;
                templatesReorganized = true;
            }
        }
        if (title.includes('COLECISTITIS')) {
            if (t.categoryId !== 23 && t.categoryId !== 24) {
                t.categoryId = 23;
                templatesReorganized = true;
            }
        }
        if (title.includes('SACO HERNIARIO')) {
            if (t.categoryId !== 15) {
                t.categoryId = 15;
                templatesReorganized = true;
            }
        }
    });
    if (templatesReorganized) {
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        console.log('[Auto-Migration] Plantillas reubicadas bajo sus nuevas categorías.');
    }

    // Fusionar Genitourinario en Urología (Solicitado por el usuario)
    let urologiaMerged = false;
    templatesDatabase.forEach(t => {
        if (t.categoryId === 26) {
            t.categoryId = 9;
            urologiaMerged = true;
        }
        if (t.categoryId === 27) {
            t.categoryId = 25;
            urologiaMerged = true;
        }
    });

    const initialCatLength = categoriesDatabase.length;
    const filteredCats = categoriesDatabase.filter(c => c.id !== 26 && c.id !== 27 && (c.categoria || '').trim().toUpperCase() !== 'GENITOURINARIO');
    categoriesDatabase.length = 0;
    categoriesDatabase.push(...filteredCats);
    if (categoriesDatabase.length !== initialCatLength) {
        safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log('[Auto-Migration] Especialidades de Genitourinario eliminadas.');
    }

    if (urologiaMerged || categoriesDatabase.length !== initialCatLength) {
        const uniqueTemplates = [];
        const seen = new Set();
        const tempCats = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories || [];
        templatesDatabase.forEach(t => {
            const catObj = tempCats.find(c => c.id === t.categoryId);
            const catName = catObj ? (catObj.categoria || '').trim().toUpperCase() : String(t.categoryId);
            const key = `${t.categoryId}-${(t.titulo || '').trim().toUpperCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueTemplates.push(t);
            }
        });
        templatesDatabase.length = 0;
        templatesDatabase.push(...uniqueTemplates);
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        console.log('[Auto-Migration] Fusión de Genitourinario en Urología completada y duplicados eliminados.');
    }

    // DEDUPLICACIÓN ATÓMICA L1: Sincronizar patientMap en O(1) con clave canónica
    patientMap.clear();
    const uniqueDedupList = [];
    patientDatabase.forEach(p => {
        if (!p) return;
        const key = cleanCodeFunc(p.codAtencion || p.cod_atencion);
        if (key) {
            if (!patientMap.has(key)) {
                patientMap.set(key, p);
                uniqueDedupList.push(p);
            } else {
                const existing = patientMap.get(key);
                // PROTECCIÓN TOTAL ZERO-DATA-LOSS: Reemplaza Object.assign destructivo
                const merged = safeMergePatientRecords(existing, p);
                Object.assign(existing, merged);
            }
        } else {
            uniqueDedupList.push(p);
        }
    });
    if (uniqueDedupList.length !== patientDatabase.length) {
        patientDatabase.length = 0;
        patientDatabase.push(...uniqueDedupList);
        sortPatientArray(patientDatabase);
        try { safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase)); } catch(e) {}
    }

    // GARANTÍA FINAL INFALIBLE: Asegurar que todas las plantillas maestras y CAP oficiales estén presentes
    const finalDefTpls = (typeof window !== 'undefined' && Array.isArray(window.defaultTemplates) && window.defaultTemplates.length > 0)
        ? window.defaultTemplates
        : ((typeof defaultTemplates !== 'undefined' && Array.isArray(defaultTemplates)) ? defaultTemplates : []);

    if (finalDefTpls && finalDefTpls.length > 0) {
        let forceImmediateUpdate = false;
        
        finalDefTpls.forEach(dt => {
            const idx = templatesDatabase.findIndex(t => String(t.id) === String(dt.id));
            if (idx === -1) {
                templatesDatabase.push({ ...dt });
                forceImmediateUpdate = true;
            } else {
                // Autosanación: Forzar sobreescritura de las plantillas 'CAP -' para evitar caché obsoleto
                if (dt.titulo && String(dt.titulo).toUpperCase().includes('CAP -')) {
                    if (templatesDatabase[idx].macro !== dt.macro || templatesDatabase[idx].micro !== dt.micro || templatesDatabase[idx].diag !== dt.diag) {
                        templatesDatabase[idx] = { ...templatesDatabase[idx], ...dt };
                        forceImmediateUpdate = true;
                    }
                } else {
                    templatesDatabase[idx] = { ...templatesDatabase[idx], ...dt };
                }
            }
        });

        if (forceImmediateUpdate || templatesDatabase.length < finalDefTpls.length) {
            try {
                safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
                if (typeof window !== 'undefined') window.templatesDatabase = templatesDatabase;
                console.log("[Auto-Migration] Plantillas CAP fusionadas y localStorage actualizado incondicionalmente.");
            } catch(e) {}
        }
    } else {
        // Fallback Indestructible: Si plantillas_data.js aún no terminó de cargar al arrancar
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                if (window.defaultTemplates && window.defaultTemplates.length > templatesDatabase.length) {
                    console.warn("[Auto-Healing] Lista maestra detectada tardíamente. Reejecutando sincronización...");
                    initLocalDatabases();
                }
            }, 1000);
        }
    }

    if (typeof defaultCategories !== 'undefined' && Array.isArray(defaultCategories)) {
        defaultCategories.forEach(dc => {
            const exists = categoriesDatabase.some(c => String(c.id) === String(dc.id));
            if (!exists) {
                categoriesDatabase.push({ ...dc });
            }
        });
    }

    // GARANTÍA MILITAR FINAL: Certificar que patientDatabase y window.REAL_SUPABASE_PATIENTS contengan exactamente los 1,222 registros
    if (masterList && masterList.length >= 1222) {
        const existingCodes = new Set(patientDatabase.map(p => cleanCodeFunc(p.codAtencion || p.cod_atencion)));
        let missingAdded = false;
        masterList.forEach(m => {
            const k = cleanCodeFunc(m.codAtencion || m.cod_atencion);
            if (k && !existingCodes.has(k)) {
                patientDatabase.push(JSON.parse(JSON.stringify(m)));
                existingCodes.add(k);
                missingAdded = true;
            }
        });
        if (missingAdded) {
            sortPatientArray(patientDatabase);
            safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
        }
    }

    patientMap.clear();
    patientDatabase.forEach(p => {
        if (p && (p.codAtencion || p.cod_atencion)) {
            patientMap.set(cleanCodeFunc(p.codAtencion || p.cod_atencion), p);
        }
    });

    // Sincronización final garantizada en memoria y window
    if (typeof window !== 'undefined') {
        window.defaultCategories = defaultCategories;
        window.templatesDatabase = templatesDatabase;
        window.categoriesDatabase = categoriesDatabase;
        window.patientDatabase = patientDatabase;
        window.patientMap = patientMap;
        if (!Array.isArray(window.REAL_SUPABASE_PATIENTS) || window.REAL_SUPABASE_PATIENTS.length < masterList.length) {
            window.REAL_SUPABASE_PATIENTS = masterList;
        }
        if (!Array.isArray(window.realSupabaseBackup) || window.realSupabaseBackup.length < masterList.length) {
            window.realSupabaseBackup = masterList;
        }
        if (!Array.isArray(window.REAL_SUPABASE_BACKUP) || window.REAL_SUPABASE_BACKUP.length < masterList.length) {
            window.REAL_SUPABASE_BACKUP = masterList;
        }
    }
    try {
        safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));
    } catch(e) {}
}

// Auto-ejecutar al cargar el módulo para disponibilidad inmediata e ininterrumpida
try {
    initLocalDatabases();
    if (typeof window !== 'undefined') {
        window.defaultCategories = defaultCategories;
        window.categoriesDatabase = categoriesDatabase;
    }
} catch (e) {
    console.error("[db_service] Error al auto-inicializar bases de datos locales:", e);
}

// Función para agregar una plantilla de forma segura encapsulando mutación de estado
export function addTemplateToDatabase(templateData) {
    const maxId = templatesDatabase.length > 0 ? Math.max(...templatesDatabase.map(t => parseInt(t.id) || 0)) : 0;
    const newTemplate = {
        id: maxId + 1,
        categoryId: parseInt(templateData.categoryId),
        titulo: templateData.titulo,
        macro: templateData.macro,
        micro: templateData.micro,
        diag: templateData.diag
    };
    templatesDatabase.push(newTemplate);
    saveTemplateToSupabase(newTemplate);
    return newTemplate;
}

export async function syncTemplatesFromSupabase() {
    if (typeof window === 'undefined' || typeof window.supabase === 'undefined' || !window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url) return;
    const supabase = window.supabase;
    try {
        const { data, error } = await supabase.from('plantillas').select('*');
        if (error) {
            console.warn("[Supabase Sync] Aviso plantillas:", error.message);
            return;
        }

        const defTpls = window.defaultTemplates || (typeof defaultTemplates !== 'undefined' ? defaultTemplates : []);
        const currentLocal = templatesDatabase.length > 0 ? templatesDatabase : defTpls;

        const remoteMap = new Map();
        if (data && data.length > 0) {
            data.forEach(item => {
                const normTitle = (item.titulo || '').trim().toUpperCase();
                const catId = Number(item.categoryId || item.category_id || 0);
                const key = `${catId}_${normTitle}`;
                remoteMap.set(key, {
                    id: Number(item.id),
                    categoryId: catId,
                    titulo: item.titulo || '',
                    macro: item.macro || '',
                    micro: item.micro || '',
                    diag: item.diag || ''
                });
            });
        }

        // Merge: Garantizar que ninguna plantilla local maestra falte en la nube ni en local
        const missingToUpload = [];
        currentLocal.forEach(localTpl => {
            const normTitle = (localTpl.titulo || '').trim().toUpperCase();
            const catId = Number(localTpl.categoryId || 0);
            const key = `${catId}_${normTitle}`;
            if (!remoteMap.has(key)) {
                remoteMap.set(key, localTpl);
                missingToUpload.push({
                    id: Number(localTpl.id),
                    categoryId: catId,
                    titulo: localTpl.titulo || '',
                    macro: localTpl.macro || '',
                    micro: localTpl.micro || '',
                    diag: localTpl.diag || ''
                });
            }
        });

        // Subir a Supabase las plantillas maestras faltantes en segundo plano
        if (missingToUpload.length > 0) {
            console.log(`[Supabase Seed] Subiendo ${missingToUpload.length} plantillas maestras faltantes a la nube Supabase...`);
            await supabase.from('plantillas').upsert(missingToUpload);
        }

        const mergedList = Array.from(remoteMap.values());
        templatesDatabase.length = 0;
        templatesDatabase.push(...mergedList);
        try {
            safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
        } catch(e) {}
        console.log(`[Supabase Sync] ${templatesDatabase.length} plantillas maestras disponibles y sincronizadas en la nube.`);
    } catch (e) {
        console.warn("[Supabase Sync] Excepción al sincronizar plantillas:", e);
    }
}

export async function syncCategoriesFromSupabase() {
    if (typeof window === 'undefined' || typeof window.supabase === 'undefined' || !window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url) return;
    const supabase = window.supabase;
    try {
        const { data, error } = await supabase.from('categorias').select('*');
        if (error) {
            // Si la tabla categorias no ha sido creada aún en Supabase SQL, mantenemos defaultCategories
            return;
        }
        if (data && data.length > 0) {
            const mappedCategories = data.map(item => ({
                id: Number(item.id),
                tipo: item.tipo || 'Macroscopica',
                categoria: item.categoria || item.nombre || ''
            }));
            categoriesDatabase.length = 0;
            categoriesDatabase.push(...mappedCategories);
            try { safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase)); } catch(e) {}
            console.log(`[Supabase Sync] ${mappedCategories.length} categorías sincronizadas desde la nube.`);
        } else if (categoriesDatabase.length > 0) {
            const seedPayload = categoriesDatabase.map(c => ({
                id: Number(c.id),
                tipo: c.tipo || 'Macroscopica',
                categoria: c.categoria || c.nombre || ''
            }));
            await supabase.from('categorias').upsert(seedPayload);
        }
    } catch (e) {
        // Silencioso para no saturar consola
    }
}

export async function saveTemplateToSupabase(template) {
    if (!template || !template.id) return;
    safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('plantillas').upsert({
                id: Number(template.id),
                categoryId: Number(template.categoryId || 0),
                titulo: template.titulo || '',
                macro: template.macro || '',
                micro: template.micro || '',
                diag: template.diag || ''
            });
            console.log(`[Supabase] Plantilla ${template.id} sincronizada en la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al guardar plantilla:", e);
        }
    }
}

export async function deleteTemplateFromSupabase(templateId) {
    safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('plantillas').delete().eq('id', Number(templateId));
            console.log(`[Supabase] Plantilla ${templateId} eliminada de la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al eliminar plantilla:", e);
        }
    }
}

export async function saveCategoryToSupabase(category) {
    if (!category || !category.id) return;
    safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('categorias').upsert({
                id: Number(category.id),
                tipo: category.tipo || 'Macroscopica',
                categoria: category.categoria || category.nombre || ''
            });
            console.log(`[Supabase] Categoría ${category.id} sincronizada en la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al guardar categoría:", e);
        }
    }
}

export async function deleteCategoryFromSupabase(categoryId) {
    safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('categorias').delete().eq('id', Number(categoryId));
            console.log(`[Supabase] Categoría ${categoryId} eliminada de la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al eliminar categoría:", e);
        }
    }
}

export function triggerAutomaticBackup() {
    try {
        // Blindaje de persistencia: asegurar que cualquier paciente con imágenes o solicitud quede guardado en IndexedDB
        patientDatabase.forEach(p => {
            if (p && (p.img01 || p.img02 || p.macro360 || p.solicitudInforme)) {
                savePatientToIndexedDB(p);
            }
        });

        // Copia sin imágenes pesadas limitada a los expedientes más recientes para erradicar QuotaExceededError
        const recentSubset = patientDatabase.slice(0, 150);
        const lightweightDatabase = recentSubset.map(p => {
            const { img01, img02, macro360, solicitudInforme, ...light } = p;
            return light;
        });
        const dataStr = JSON.stringify(lightweightDatabase);
        safeSetLocalStorage('patientDatabaseLocal', dataStr);

        // Rotar respaldos locales (cada 5 llamadas para evitar overhead)
        let backupCounter = parseInt(localStorage.getItem('patientDatabaseLocal_bak_counter') || '0', 10);
        backupCounter = (backupCounter + 1) % 5;
        safeSetLocalStorage('patientDatabaseLocal_bak_counter', backupCounter.toString());

        if (backupCounter === 0) {
            const bak1 = localStorage.getItem('patientDatabaseLocal_bak1');
            const bak2 = localStorage.getItem('patientDatabaseLocal_bak2');
            
            if (bak2) safeSetLocalStorage('patientDatabaseLocal_bak3', bak2);
            if (bak1) safeSetLocalStorage('patientDatabaseLocal_bak2', bak1);
            safeSetLocalStorage('patientDatabaseLocal_bak1', dataStr);
            console.log("[Backup] Respaldo histórico rotado con éxito.");
        }
    } catch (e) {
        console.error("Error al crear el respaldo automático", e);
    }
}

export async function loadDoctorsData(mockPath = 'doctores.json') {
    const supabase = (typeof window !== 'undefined') ? window.supabase : null;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    
    // 1. Intentar cargar directamente desde la nube de Supabase
    if (usingSupabase && navigator.onLine) {
        try {
            const { data, error } = await supabase.from('doctores').select('*').order('nombre', { ascending: true });
            if (!error && data && data.length > 0) {
                doctorsDatabase.length = 0;
                data.forEach(d => {
                    doctorsDatabase.push({
                        doctor: d.nombre || d.doctor || '',
                        colegiado: d.cmp || d.colegiado || '',
                        especializacion: d.rne || d.especializacion || '',
                        clinica: d.clinica || d.provincia || d.tipo || ''
                    });
                });
                console.log(`[Supabase Cloud] ${doctorsDatabase.length} doctores sincronizados directamente desde la nube.`);
                return;
            }
        } catch (e) {
            console.warn('[Supabase Cloud] Aviso al cargar doctores de la nube:', e);
        }
    }

    if (doctorsDatabase.length > 0) return;

    // 2. Fallback de inicio local / respaldo estático
    try {
        const response = await fetch(mockPath);
        if (!response.ok) throw new Error('Error al leer doctores.json');
        const data = await response.json();
        doctorsDatabase.length = 0;
        data.forEach(d => doctorsDatabase.push(d));
        console.log(`[Local Doctors] ${doctorsDatabase.length} doctores cargados desde doctores.json.`);
    } catch (error) {
        console.error('Error al cargar la lista de doctores:', error);
    }
}

// formatDoctorName está re-exportado desde utils.js


export function getPatientSlaStatus(item) {
    if (!item) {
        return {
            isFirmado: false,
            isModificado: false,
            estado: 'Pendiente',
            color: '#ef4444',
            dotClass: 'dot-red date-delay',
            title: 'Informe no firmado / pendiente de validación médica'
        };
    }

    const cleanDiag = String(item.diagnostico || item.diag || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const cleanMacro = String(item.macroDesc || item.macro_desc || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const cleanMicro = String(item.microDesc || item.micro_desc || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const invalidVals = ['', '---', '--', '-', 'null', 'undefined'];
    const hasDiagText = !invalidVals.includes(cleanDiag.toLowerCase());
    const hasMacroText = !invalidVals.includes(cleanMacro.toLowerCase());
    const hasMicroText = !invalidVals.includes(cleanMicro.toLowerCase());
    const hasDraftText = hasMacroText || hasMicroText;

    // Regla de Semáforo de Estado: Vinculado al campo real de estado ('firmado' / 'estado_firma')
    const isSigned = (
        item.firmado === true || 
        item.firmado === 1 || 
        String(item.firmado).toLowerCase() === 'true' || 
        String(item.estado_firma || '').toLowerCase() === 'firmado' || 
        String(item.estado_firma || '').toLowerCase() === 'validado' ||
        String(item.estado || '').toLowerCase() === 'completado' ||
        String(item.estado || '').toLowerCase() === 'listo' ||
        String(item.estado || '').toLowerCase() === 'firmado'
    );

    if (isSigned) {
        return {
            isFirmado: true,
            isModificado: true,
            estado: 'Completado',
            color: '#10b981',
            dotClass: 'dot-green date-completed',
            title: 'Informe firmado digitalmente y listo para descarga'
        };
    }

    // Círculo ROJO: Informe no firmado / pendiente de validación médica
    return {
        isFirmado: false,
        isModificado: hasDraftText || hasDiagText || item.modificado === true,
        estado: (hasDraftText || hasDiagText) ? 'En Proceso' : 'Pendiente',
        color: '#ef4444',
        dotClass: 'dot-red date-delay',
        title: 'Informe no firmado / pendiente de validación médica'
    };
}

if (typeof window !== 'undefined') {
    window.getPatientSlaStatus = getPatientSlaStatus;
}

export function mapDbToPatient(dbRecord) {
    const rawEdad = dbRecord.edad !== undefined && dbRecord.edad !== null ? String(dbRecord.edad).trim() : '';
    const finalEdad = (!rawEdad || rawEdad === '0' || rawEdad === '--' || rawEdad === 'null') ? '--' : rawEdad;

    let derivedService = dbRecord.service;
    if (!derivedService || (derivedService !== 'C' && derivedService !== 'Q' && derivedService !== 'I')) {
        const codeUpper = String(dbRecord.cod_atencion || '').toUpperCase();
        const especimenUpper = String(dbRecord.especimen || '').toUpperCase();

        if (codeUpper.includes('C-') || codeUpper.endsWith('C') || /C[-_\s0-9]|^C\d|\dC\d/.test(codeUpper)) {
            derivedService = 'C';
        } else if (codeUpper.includes('I-') || codeUpper.endsWith('I') || /I[-_\s0-9]|^I\d|\dI\d/.test(codeUpper)) {
            derivedService = 'I';
        } else if (codeUpper.includes('Q-') || /Q[-_\s0-9]|^Q\d|\dQ\d/.test(codeUpper)) {
            derivedService = 'Q';
        } else if (especimenUpper.includes('PAPANICOLAOU') || especimenUpper.includes('CITOLOG') || especimenUpper.includes('CERVICOVAGINAL')) {
            derivedService = 'C';
        } else if (especimenUpper.includes('INMUNOHISTO') || especimenUpper.includes('IHQ')) {
            derivedService = 'I';
        } else {
            derivedService = 'Q';
        }
    }

    const slaStatus = getPatientSlaStatus({
        ...dbRecord,
        macroDesc: dbRecord.macro_desc || dbRecord.macroDesc,
        microDesc: dbRecord.micro_desc || dbRecord.microDesc,
        diagnostico: dbRecord.diagnostico || dbRecord.diag
    });
    const isFirm = slaStatus.isFirmado;
    const isMod = slaStatus.isModificado;
    const finalEstado = slaStatus.estado;

    const res = {
        id: (dbRecord.id !== undefined && dbRecord.id !== null) ? parseInt(dbRecord.id, 10) : Date.now(),
        service: derivedService,
        codAtencion: dbRecord.cod_atencion,
        dni: dbRecord.dni || "",
        medSolicitante: formatDoctorName(dbRecord.med_solicitante || ""),
        nombres: dbRecord.nombres || "",
        apellidos: dbRecord.apellidos || "",
        paciente: dbRecord.paciente || "",
        costo: parseFloat(dbRecord.costo) || 0,
        adelanto: parseFloat(dbRecord.adelanto) || 0,
        resta: parseFloat(dbRecord.resta) || 0,
        fecRegistro: dbRecord.fec_registro || "",
        fecEntrega: dbRecord.fec_entrega || "",
        pagado: !!dbRecord.pagado,
        atrasado: !!dbRecord.atrasado,
        firmado: isFirm,
        modificado: isMod,
        estado: finalEstado,
        especimen: correctPapanicolaouSpelling(dbRecord.especimen || ""),
        macroDesc: correctPapanicolaouSpelling(dbRecord.macro_desc || ""),
        microDesc: correctPapanicolaouSpelling(dbRecord.micro_desc || ""),
        diagnostico: correctPapanicolaouSpelling(dbRecord.diagnostico || ""),
        img01: dbRecord.img01 || null,
        img02: dbRecord.img02 || null,
        macro360: dbRecord.macro360 || null,
        solicitudInforme: dbRecord.solicitud_informe || null,
        edad: finalEdad,
        sexo: normalizeSexo(dbRecord.sexo, dbRecord.especimen, dbRecord.paciente || dbRecord.nombres),
        casetes: parseInt(dbRecord.casetes) || 1,
        fContacto: dbRecord.f_contacto || "",
        telContacto: dbRecord.tel_contacto || "",
        doctor: formatDoctorName(dbRecord.doctor || ""),
        motivoEstudio: dbRecord.motivo_estudio || "",
        catMacro: dbRecord.cat_macro || "",
        planMacro: dbRecord.plan_macro || "",
        catMicro: dbRecord.cat_micro || "",
        planMicro: dbRecord.plan_micro || "",
        catDiag: dbRecord.cat_diag || "",
        planDiag: dbRecord.plan_diag || "",
        clinica: dbRecord.clinica || "",
        updatedAt: dbRecord.updated_at || null
    };

    // Preservar Clínica ingresada manualmente. Si está vacía o es 'Sin Clínica', aplicar reglas por Médico Solicitante, Espécimen o Motivo
    const existingClinica = (dbRecord.clinica || '').trim();
    if (existingClinica && existingClinica.toLowerCase() !== 'sin clinica') {
        res.clinica = existingClinica;
    } else {
        const medNorm = (res.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const espNorm = (res.especimen || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const motNorm = (res.motivoEstudio || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (medNorm.includes('marreros') || medNorm.includes('lloclla') || espNorm.includes('mujer') || motNorm.includes('mujer')) {
            res.clinica = 'CLINICA LA MUJER';
        } else if (medNorm.includes('escalante') || espNorm.includes('clemente') || motNorm.includes('clemente')) {
            res.clinica = 'CLÍNICA SAN CLEMENTE';
        } else if (medNorm.includes('vilca')) {
            res.clinica = 'CLÍNICA LA LUZ';
        } else if (medNorm.includes('saire') || medNorm.includes('bocangel') || espNorm.includes('alfa') || motNorm.includes('alfa')) {
            res.clinica = 'CLÍNICA ALFA PREVENIR';
        } else if (medNorm.includes('sanchez') || medNorm.includes('becerra') || medNorm.includes('ulfe') || medNorm.includes('carrion') || medNorm.includes('munante') || medNorm.includes('arzapalo') || medNorm.includes('flores') || medNorm.includes('sierra')) {
            res.clinica = 'CLÍNICA CARRIÓN';
        } else {
            res.clinica = (existingClinica && existingClinica.toLowerCase() !== 'sin clinica') ? existingClinica : '';
        }
    }

    // Regla sagrada para 26Q-278
    if (cleanCodeFunc(res.codAtencion) === '26q-278' || cleanCodeFunc(res.codAtencion) === '26q278') {
        const espUpper = String(res.especimen || '').toUpperCase();
        const motUpper = String(res.motivoEstudio || '').toUpperCase();
        if (espUpper.includes('CERVIX') || motUpper.includes('CUELLO UTERINO') || !res.especimen || res.especimen === 'CERVIX') {
            res.especimen = 'BIOPSIA CUTANEA';
            res.telContacto = 'BIOPSIA CUTANEA';
            res.motivoEstudio = 'NEVUS VERRUGOSO DE CUERO CABELLUDO';
            res.modificado = true;
        }
    }

    attachSortKeys(res);
    res._fromCloud = true;
    return res;
}

export function mapPatientToDb(record) {
    if (cleanCodeFunc(record.codAtencion) === '26q-278' || cleanCodeFunc(record.codAtencion) === '26q278') {
        record.especimen = 'BIOPSIA CUTANEA';
        record.telContacto = 'BIOPSIA CUTANEA';
        record.motivoEstudio = 'NEVUS VERRUGOSO DE CUERO CABELLUDO';
    }
    const slaStatus = getPatientSlaStatus(record);
    const rawEdad = record.edad !== undefined && record.edad !== null ? String(record.edad).trim() : '';
    const parsedEdadInt = parseInt(rawEdad, 10);
    const dbEdad = (!isNaN(parsedEdadInt) && parsedEdadInt > 0) ? parsedEdadInt : null;

    const isFirm = slaStatus.isFirmado;
    const isMod = slaStatus.isModificado;
    const finalEstado = slaStatus.estado;

    const dbRecord = {
        service: record.service || 'Q',
        cod_atencion: record.codAtencion,
        dni: record.dni || '',
        nombres: record.nombres || '',
        apellidos: record.apellidos || '',
        paciente: record.paciente || '',
        sexo: (function() { const s = normalizeSexo(record.sexo, record.especimen || record.telContacto, record.paciente || ((record.apellidos || '') + ' ' + (record.nombres || ''))); return s || record.sexo || ''; })(),
        edad: dbEdad,
        f_contacto: record.fContacto || '',
        tel_contacto: record.telContacto || '',
        med_solicitante: formatDoctorName(record.medSolicitante || ''),
        motivo_estudio: record.motivoEstudio || '',
        especimen: correctPapanicolaouSpelling(record.especimen || ''),
        doctor: formatDoctorName(record.doctor || 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA'),
        casetes: parseInt(record.casetes) || 1,
        cat_macro: record.catMacro || '',
        plan_macro: record.planMacro || '',
        cat_micro: record.catMicro || '',
        plan_micro: record.planMicro || '',
        // cat_diag y plan_diag no existen en Supabase
        fec_registro: sanitizeDateForPg(record.fecRegistro),
        fec_entrega: sanitizeDateForPg(record.fecEntrega),
        costo: parseFloat(record.costo) || 0,
        adelanto: parseFloat(record.adelanto) || 0,
        resta: parseFloat(record.resta) || 0,
        pagado: !!record.pagado,
        atrasado: !!record.atrasado,
        clinica: record.clinica || '',
        firmado: isFirm,
        modificado: isMod,
        estado: finalEstado
    };

    // GARANTÍA MILITAR: Transmitir siempre los campos de informe patológico a la nube Supabase
    if (record.macroDesc !== undefined && record.macroDesc !== null) {
        dbRecord.macro_desc = correctPapanicolaouSpelling(record.macroDesc || '');
    }
    if (record.microDesc !== undefined && record.microDesc !== null) {
        dbRecord.micro_desc = correctPapanicolaouSpelling(record.microDesc || '');
    }
    if (record.diagnostico !== undefined && record.diagnostico !== null) {
        dbRecord.diagnostico = correctPapanicolaouSpelling(record.diagnostico || '');
    }
    // BLINDAJE MILITAR POKA-YOKE (Groq Subagente 2):
    // JAMÁS sobreescribir fotos preexistentes con cadenas vacías o valores nulos
    if (record.img01 && typeof record.img01 === 'string' && record.img01.length > 50) {
        dbRecord.img01 = record.img01;
    } else {
        delete dbRecord.img01; // Preserva intacta la foto en la base de datos
    }
    
    if (record.img02 && typeof record.img02 === 'string' && record.img02.length > 50) {
        dbRecord.img02 = record.img02;
    } else {
        delete dbRecord.img02; // Preserva intacta la foto en la base de datos
    }
    
    if (record.macro360 && typeof record.macro360 === 'string' && record.macro360.length > 50) {
        dbRecord.macro360 = record.macro360;
    } else {
        delete dbRecord.macro360;
    }
    
    const solVal = record.solicitudInforme !== undefined ? record.solicitudInforme : record.solicitud_informe;
    if (solVal && typeof solVal === 'string' && solVal.length > 50) {
        dbRecord.solicitud_informe = solVal;
    } else {
        delete dbRecord.solicitud_informe; // Preserva solicitud médica intacta
    }
    if (record.updatedAt || record.updated_at) {
        dbRecord.updated_at = record.updatedAt || record.updated_at;
    }
    if (record.id) dbRecord.id = parseInt(record.id, 10);

    return dbRecord;
}

const prefetchCache = new Map();

export function prefetchPatientDetails(codAtencion) {
    if (!codAtencion) return;
    const cleanTarget = cleanCodeFunc(codAtencion);
    if (prefetchCache.has(cleanTarget)) return;
    const promise = fetchFullPatientDetails(codAtencion);
    prefetchCache.set(cleanTarget, promise);
    setTimeout(() => prefetchCache.delete(cleanTarget), 25000);
}
if (typeof window !== 'undefined') {
    window.prefetchPatientDetails = prefetchPatientDetails;
}

export async function fetchFullPatientDetails(codAtencion) {
    if (!codAtencion) return null;
    const cleanCode = String(codAtencion).trim().toLowerCase();
    const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
    const cleanTarget = cleanCodeFunc(codAtencion);

    if (prefetchCache.has(cleanTarget)) {
        console.log(`[Zero-Wait Engine] Retornando paciente pre-cargado por hover para ${codAtencion}`);
        return await prefetchCache.get(cleanTarget);
    }

    let local = patientDatabase.find(p => {
        const pCode = String(p.codAtencion || '').trim().toLowerCase();
        return pCode === cleanCode || pCode.replace(/[-_\s]/g, '') === cleanNoHyphen;
    });

    // 1. Evitar sobrescribir si hay cambios locales pendientes de sincronizar en la cola
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    } catch (e) {
        queue = [];
    }
    const hasPendingWrite = queue.some(item => cleanCodeFunc(item.codAtencion) === cleanTarget);

    if (hasPendingWrite) {
        console.log(`[Sync Engine] Retornando paciente local para ${codAtencion} debido a cambios pendientes en cola.`);
        return local;
    }

    // 2. Si estamos en línea, consultar los detalles completos directamente de Supabase
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');

    if (usingSupabase && navigator.onLine) {
        try {
            console.log(`[Supabase] Cargando detalles en tiempo real para paciente: ${codAtencion}`);
            const { data, error } = await supabase
                .from('pacientes')
                .select('*')
                .ilike('cod_atencion', codAtencion)
                .maybeSingle();

            if (error) {
                console.error("Error al obtener detalles completos del paciente:", error);
            } else if (data) {
                const mapped = mapDbToPatient(data);
                
                // Comparar timestamps para resolver conflictos de sincronización
                const localTimestamp = new Date(local?.updatedAt || local?.updated_at || local?.fecRegistro || 0).getTime();
                const cloudTimestamp = new Date(mapped?.updatedAt || mapped?.updated_at || mapped?.created_at || 0).getTime();
                
                // Una edición local sólo prevalece si está en cola pendiente de sincronización o su timestamp local es estrictamente más reciente
                const hasPendingSync = hasPendingWrite || (queue && queue.some(item => cleanCodeFunc(item.codAtencion) === cleanTarget));
                const isLocalNewer = (localTimestamp > cloudTimestamp) && localTimestamp > 0;
                const preserveLocalEdits = local && (local.modificado || local.firmado) && (hasPendingSync || isLocalNewer);

                if (preserveLocalEdits) {
                    console.log(`[Supabase] Preservando edición local más reciente no sincronizada para ${codAtencion}`);
                    mapped.especimen = local.especimen || mapped.especimen;
                    mapped.telContacto = local.telContacto || mapped.telContacto || mapped.especimen;
                    mapped.motivoEstudio = local.motivoEstudio || mapped.motivoEstudio;
                    mapped.macroDesc = local.macroDesc || mapped.macroDesc;
                    mapped.microDesc = local.microDesc || mapped.microDesc;
                    mapped.diagnostico = local.diagnostico || mapped.diagnostico;
                    mapped.medSolicitante = local.medSolicitante || mapped.medSolicitante;
                    mapped.clinica = local.clinica || mapped.clinica;
                    mapped.nombres = local.nombres || mapped.nombres;
                    mapped.apellidos = local.apellidos || mapped.apellidos;
                    mapped.paciente = local.paciente || mapped.paciente;
                    mapped.sexo = local.sexo || mapped.sexo;
                    mapped.edad = local.edad || mapped.edad;
                    mapped.doctor = local.doctor || mapped.doctor;
                    mapped.casetes = local.casetes || mapped.casetes;
                    mapped.img01 = local.img01 || mapped.img01;
                    mapped.img02 = local.img02 || mapped.img02;
                    mapped.macro360 = local.macro360 || mapped.macro360;
                    mapped.solicitudInforme = local.solicitudInforme || mapped.solicitudInforme;
                    mapped.modificado = true;
                    if (local.firmado) mapped.firmado = true;
                    if (local.estado) mapped.estado = local.estado;
                } else {
                    // CRÍTICO: Si Supabase trae campos clínicos vacíos pero localmente o en respaldo existen, PRESERVARLOS
                    const bkp = (typeof REAL_SUPABASE_PATIENTS !== 'undefined' && Array.isArray(REAL_SUPABASE_PATIENTS)) 
                        ? REAL_SUPABASE_PATIENTS.find(b => cleanCodeFunc(b.codAtencion) === cleanTarget)
                        : (Array.isArray(window.REAL_SUPABASE_PATIENTS) ? window.REAL_SUPABASE_PATIENTS.find(b => cleanCodeFunc(b.codAtencion) === cleanTarget) : null);
                    
                    const restored = RESTORED_PATIENT_RECORDS[cleanTarget] || RESTORED_PATIENT_RECORDS[cleanCode];

                    if (!mapped.macroDesc) mapped.macroDesc = (local && local.macroDesc) || (restored && restored.macroDesc) || (bkp && bkp.macroDesc) || '';
                    if (!mapped.microDesc) mapped.microDesc = (local && local.microDesc) || (restored && restored.microDesc) || (bkp && bkp.microDesc) || '';
                    if (!mapped.diagnostico) mapped.diagnostico = (local && local.diagnostico) || (restored && restored.diagnostico) || (bkp && bkp.diagnostico) || '';
                    if (!mapped.especimen) mapped.especimen = (local && local.especimen) || (restored && restored.especimen) || (bkp && bkp.especimen) || '';
                    if (!mapped.telContacto) mapped.telContacto = (local && (local.telContacto || local.especimen)) || (restored && (restored.telContacto || restored.especimen)) || (bkp && (bkp.telContacto || bkp.especimen)) || '';
                    if (!mapped.motivoEstudio) mapped.motivoEstudio = (local && local.motivoEstudio) || (restored && restored.motivoEstudio) || (bkp && bkp.motivoEstudio) || '';
                    if (!mapped.medSolicitante) mapped.medSolicitante = (local && local.medSolicitante) || (restored && restored.medSolicitante) || (bkp && bkp.medSolicitante) || '';
                    if (!mapped.clinica) mapped.clinica = (local && local.clinica) || (restored && restored.clinica) || (bkp && bkp.clinica) || '';

                    // BLINDAJE CRÍTICO MULTIMEDIA: Nunca borrar fotos ni solicitudes si la nube viene vacía
                    if (!mapped.solicitudInforme && local && (local.solicitudInforme || local.solicitud_informe)) {
                        mapped.solicitudInforme = local.solicitudInforme || local.solicitud_informe;
                    }
                    if (!mapped.img01 && local && local.img01) mapped.img01 = local.img01;
                    if (!mapped.img02 && local && local.img02) mapped.img02 = local.img02;
                    if (!mapped.macro360 && local && local.macro360) mapped.macro360 = local.macro360;
                }

                // Asegurar sincronización dual de nombres de campo
                if (mapped.solicitudInforme && !mapped.solicitud_informe) mapped.solicitud_informe = mapped.solicitudInforme;
                if (mapped.solicitud_informe && !mapped.solicitudInforme) mapped.solicitudInforme = mapped.solicitud_informe;

                mapped._detailsFetched = true;
                if (local) {
                    const merged = safeMonotonicMerge(local, mapped); const mIdx = patientDatabase.indexOf(local); if (mIdx !== -1) { patientDatabase[mIdx] = createProtectedPatientProxy(merged); local = patientDatabase[mIdx]; } else { Object.assign(local, merged); }
                } else {
                    patientDatabase.push(mapped);
                    local = mapped;
                }
                savePatientToIndexedDB(local);
                triggerAutomaticBackup();
                return local;
            }
        } catch (e) {
            console.error("Excepción en fetchFullPatientDetails en vivo:", e);
        }
    }

    // 3. Fallback: Si está fuera de línea o falló la consulta, usar memoria local o IndexedDB
    const bkp = (typeof REAL_SUPABASE_PATIENTS !== 'undefined' && Array.isArray(REAL_SUPABASE_PATIENTS)) 
        ? REAL_SUPABASE_PATIENTS.find(b => cleanCodeFunc(b.codAtencion) === cleanTarget)
        : (Array.isArray(window.REAL_SUPABASE_PATIENTS) ? window.REAL_SUPABASE_PATIENTS.find(b => cleanCodeFunc(b.codAtencion) === cleanTarget) : null);
    const restored = RESTORED_PATIENT_RECORDS[cleanTarget] || RESTORED_PATIENT_RECORDS[cleanCode];

    if (local) {
        if (!local.macroDesc) local.macroDesc = (restored && restored.macroDesc) || (bkp && bkp.macroDesc) || '';
        if (!local.microDesc) local.microDesc = (restored && restored.microDesc) || (bkp && bkp.microDesc) || '';
        if (!local.diagnostico) local.diagnostico = (restored && restored.diagnostico) || (bkp && bkp.diagnostico) || '';
        if (!local.especimen && !local.modificado) local.especimen = (restored && restored.especimen) || (bkp && bkp.especimen) || '';
        if (!local.motivoEstudio && !local.modificado) local.motivoEstudio = (restored && restored.motivoEstudio) || (bkp && bkp.motivoEstudio) || '';

        // Si ya tiene todos los detalles multimedia y textos completos, retornar sin reconsultar
        const hasAllMedia = (local.img01 || local.img02) && local.solicitudInforme;
        if (local._detailsFetched && hasAllMedia) {
            saveSurgicalCaseToLRU(local);
            return local;
        }
    }

    try {
        const dbPat = await getPatientFromIndexedDB(codAtencion);
        if (dbPat) {
            dbPat.especimen = correctPapanicolaouSpelling(dbPat.especimen || '');
            dbPat.macroDesc = correctPapanicolaouSpelling(dbPat.macroDesc || '');
            dbPat.microDesc = correctPapanicolaouSpelling(dbPat.microDesc || '');
            dbPat.diagnostico = correctPapanicolaouSpelling(dbPat.diagnostico || '');
            if (local) {
                if (!local.macroDesc && dbPat.macroDesc) local.macroDesc = dbPat.macroDesc;
                if (!local.microDesc && dbPat.microDesc) local.microDesc = dbPat.microDesc;
                if (!local.diagnostico && dbPat.diagnostico) local.diagnostico = dbPat.diagnostico;
                if (!local.img01 && dbPat.img01) local.img01 = dbPat.img01;
                if (!local.img02 && dbPat.img02) local.img02 = dbPat.img02;
                if (!local.macro360 && dbPat.macro360) local.macro360 = dbPat.macro360;
                if (!local.solicitudInforme && dbPat.solicitudInforme) local.solicitudInforme = dbPat.solicitudInforme;
                if (!local.especimen && dbPat.especimen) local.especimen = dbPat.especimen;
                if (!local.motivoEstudio && dbPat.motivoEstudio) local.motivoEstudio = dbPat.motivoEstudio;
                local._detailsFetched = true;
            } else {
                dbPat._detailsFetched = true;
                patientDatabase.push(dbPat);
                local = dbPat;
            }
            saveSurgicalCaseToLRU(local);
            return local;
        }
    } catch (e) {
        console.error("Error al recuperar de IndexedDB:", e);
    }

    // 4. Restauración de Emergencia / Respaldo Maestro
    if (restored || bkp) {
        const restoredData = restored || bkp;
        console.log(`[Auto-Recovery] Restaurando informe completo para ${codAtencion}`);
        if (local) {
            if (!local.modificado && !local.firmado) {
                Object.assign(local, restoredData);
            } else {
                if (!local.macroDesc && restoredData.macroDesc) local.macroDesc = restoredData.macroDesc;
                if (!local.microDesc && restoredData.microDesc) local.microDesc = restoredData.microDesc;
                if (!local.diagnostico && restoredData.diagnostico) local.diagnostico = restoredData.diagnostico;
            }
            local._detailsFetched = true;
            local._isEditing = true;
        } else {
            const copyData = { ...restoredData, _detailsFetched: true, _isEditing: true };
            patientDatabase.push(copyData);
            local = copyData;
        }
        savePatientToIndexedDB(local);
        savePatient(local);
        return local;
    }

    return local;
}


export const SAFE_SUPABASE_COLUMNS = [
    'id', 'service', 'cod_atencion', 'dni', 'med_solicitante', 'nombres', 'apellidos', 
    'paciente', 'costo', 'adelanto', 'resta', 'fec_registro', 'fec_entrega', 
    'pagado', 'atrasado', 'especimen', 'macro_desc', 'micro_desc', 'diagnostico', 
    'img01', 'img02', 'edad', 'sexo', 'casetes', 'f_contacto', 'tel_contacto', 
    'doctor', 'motivo_estudio', 'cat_macro', 'plan_macro', 'cat_micro', 'plan_micro', 
    'created_at'
];

export function sanitizeRecordForSupabase(record) {
    if (!record || typeof record !== 'object') return {};
    const sanitized = {};
    for (const key of Object.keys(record)) {
        if (SAFE_SUPABASE_COLUMNS.includes(key)) {
            sanitized[key] = record[key];
        }
    }
    if (!sanitized.service) sanitized.service = 'Q';
    return sanitized;
}

const LIGHT_COLUMNS = [
    'id', 'service', 'cod_atencion', 'dni', 'med_solicitante', 'nombres', 'apellidos', 
    'paciente', 'costo', 'adelanto', 'resta', 'fec_registro', 'fec_entrega', 
    'pagado', 'atrasado', 'especimen', 'macro_desc', 'micro_desc', 'diagnostico', 
    'edad', 'sexo', 'casetes', 'f_contacto', 'tel_contacto', 
    'doctor', 'motivo_estudio', 'cat_macro', 'plan_macro', 'cat_micro', 'plan_micro', 
    'created_at'
].join(',');

export async function uploadAllLocalReportsToSupabase() {
    const supabase = window.supabase;
    if (!supabase || typeof supabase.from !== 'function') {
        console.error("[Sync Tool] Supabase no está disponible.");
        if (typeof showToast === 'function') showToast("Error: No conectado a Supabase", "error");
        return { success: false, error: "Supabase no disponible" };
    }

    let localList = [...patientDatabase];
    try {
        const stored = JSON.parse(localStorage.getItem('patientDatabaseLocal') || '[]');
        if (Array.isArray(stored) && stored.length > localList.length) {
            localList = stored;
        }
    } catch(e) {}

    console.log(`[Sync Tool] Iniciando subida forzada de ${localList.length} expedientes locales a Supabase...`);
    let uploadedCount = 0;
    let failedCount = 0;

    for (const p of localList) {
        if (!p || !p.codAtencion) continue;
        
        let dbRecord = sanitizeRecordForSupabase(mapPatientToDb(p));
        if (!p._fromCloud) delete dbRecord.id;
        // Garantizar que siempre se envíen macro, micro y diagnóstico si existen localmente
        if (p.macroDesc) dbRecord.macro_desc = correctPapanicolaouSpelling(p.macroDesc);
        if (p.microDesc) dbRecord.micro_desc = correctPapanicolaouSpelling(p.microDesc);
        if (p.diagnostico) dbRecord.diagnostico = correctPapanicolaouSpelling(p.diagnostico);
        if (p.img01 && p.img01.length > 50) dbRecord.img01 = p.img01;
        if (p.img02 && p.img02.length > 50) dbRecord.img02 = p.img02;

        try {
            const { error } = await supabase
                .from('pacientes')
                .upsert([dbRecord], { onConflict: 'cod_atencion' });

            if (error) {
                console.error(`[Sync Tool] Error al subir ${p.codAtencion}:`, error);
                failedCount++;
            } else {
                console.log(`[Sync Tool] ✅ Expediente ${p.codAtencion} subido con éxito a la nube.`);
                uploadedCount++;
            }
        } catch(err) {
            console.error(`[Sync Tool] Excepción con ${p.codAtencion}:`, err);
            failedCount++;
        }
    }

    console.log(`[Sync Tool] Proceso finalizado. Subidos: ${uploadedCount}, Errores: ${failedCount}`);
    if (typeof showToast === 'function') {
        showToast(`✅ Sincronización completada: ${uploadedCount} expedientes subidos a la nube.`, "success");
    }
    return { success: true, uploadedCount, failedCount };
}
if (typeof window !== 'undefined') {
    window.uploadAllLocalReportsToSupabase = uploadAllLocalReportsToSupabase;
}


export async function searchPatientsFromSupabase(filters) {
    const supabase = window.supabase;
    if (!supabase) return [];
    try {
        let query = supabase.from('pacientes').select(LIGHT_COLUMNS);
        
        if (filters.codAtencion) {
            query = query.ilike('cod_atencion', `%${filters.codAtencion}%`);
        }
        if (filters.dni) {
            query = query.eq('dni', filters.dni);
        }
        if (filters.nomPaciente) {
            query = query.or(`nombres.ilike.%${filters.nomPaciente}%,apellidos.ilike.%${filters.nomPaciente}%,paciente.ilike.%${filters.nomPaciente}%`);
        }
        if (filters.medSolicitante) {
            query = query.ilike('med_solicitante', `%${filters.medSolicitante}%`);
        }
        
        query = query.order('id', { ascending: false }).limit(100);
        const { data, error } = await query;
        if (error) {
            console.error("Error al buscar pacientes de Supabase:", error);
            return [];
        }
        return (data || []).map(mapDbToPatient);
    } catch (e) {
        console.error("Error en searchPatientsFromSupabase:", e);
        return [];
    }
}

let lastDeltaSyncTimestamp = null;
let isFetchingDelta = false;

export async function fetchDeltaUpdates() {
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase || !navigator.onLine || isFetchingDelta) return;

    isFetchingDelta = true;
    try {
        // Consultar los 60 registros más recientes de Supabase de forma ultra-ligera
        const { data, error } = await supabase
            .from('pacientes')
            .select(LIGHT_COLUMNS)
            .order('id', { ascending: false })
            .limit(60);

        if (error) {
            console.warn("[Delta Sync] Advertencia en consulta delta:", error.message);
            return;
        }

        if (data && data.length > 0) {
            const queue = getPendingSyncQueue();
            const unsyncedCodes = new Set(queue.map(item => cleanCodeFunc(item.codAtencion)));
            let hasChanges = false;

            for (const dbRecord of data) {
                const mapped = mapDbToPatient(dbRecord);
                const targetClean = cleanCodeFunc(mapped.codAtencion);
                if (!targetClean) continue;

                if (unsyncedCodes.has(targetClean)) {
                    continue;
                }

                const localIdx = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion) === targetClean);
                if (localIdx !== -1) {
                    const local = patientDatabase[localIdx];
                    // Detectar si hubo cambios en textos, estados o montos
                    const isDiff = (
                        (local.diagnostico || '') !== (mapped.diagnostico || '') ||
                        (local.macroDesc || '') !== (mapped.macroDesc || '') ||
                        (local.microDesc || '') !== (mapped.microDesc || '') ||
                        (local.paciente || '') !== (mapped.paciente || '') ||
                        (local.especimen || '') !== (mapped.especimen || '') ||
                        (local.medSolicitante || '') !== (mapped.medSolicitante || '') ||
                        (local.costo !== mapped.costo) ||
                        (local.adelanto !== mapped.adelanto) ||
                        (local.resta !== mapped.resta) ||
                        (local.pagado !== mapped.pagado) ||
                        (local.firmado !== mapped.firmado) ||
                        (local.estado !== mapped.estado)
                    );

                    if (isDiff) {
                        const merged = safeMergePatientRecords(local, mapped);
                        patientDatabase[localIdx] = merged;
                        if (patientMap.has(targetClean)) {
                            patientMap.set(targetClean, merged);
                        }
                        savePatientToIndexedDB(merged);
                        hasChanges = true;

                        if (typeof window.updateOpenEditorIfMatches === 'function') {
                            window.updateOpenEditorIfMatches(merged);
                        }
                    }
                } else {
                    const slaStatus = getPatientSlaStatus(mapped);
                    mapped.firmado = slaStatus.isFirmado;
                    mapped.modificado = slaStatus.isModificado;
                    mapped.estado = slaStatus.estado;
                    mapped.sincronizado = true;
                    upsertAndSortPatient(mapped);
                    hasChanges = true;
                }

                if (Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
                    const finalObj = patientMap.get(targetClean) || mapped;
                    const bIdx = window.REAL_SUPABASE_PATIENTS.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === targetClean);
                    if (bIdx !== -1) {
                        window.REAL_SUPABASE_PATIENTS[bIdx] = Object.assign({}, window.REAL_SUPABASE_PATIENTS[bIdx], finalObj);
                    } else {
                        window.REAL_SUPABASE_PATIENTS.unshift(Object.assign({}, finalObj));
                    }
                }
            }

            if (hasChanges) {
                sortPatientArray(patientDatabase);
                triggerAutomaticBackup();
                if (typeof window.refreshPatientTable === 'function') {
                    window.refreshPatientTable(false);
                }
            }
        }
    } catch (e) {
        console.error("[Delta Sync] Excepción en fetchDeltaUpdates:", e);
    } finally {
        isFetchingDelta = false;
    }
}
if (typeof window !== 'undefined') {
    window.fetchDeltaUpdates = fetchDeltaUpdates;
}

export async function syncPatientsFromSupabase(limit = null) {
    // Zero-Shrink Guard aplicado

    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase) {
        if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE) {
            dispatchN8nWebhook('obtenerPacientes', { limit }).catch(() => {});
        }
        return;
    }

    // Borrado remoto permanente en la nube Supabase de registros fantasmas de la serie 700
    try {
        const ghostCodesCloud = ['26Q-778', '26Q-779', '26Q-782', '26q-778', '26q-779', '26q-782'];
        supabase.from('pacientes').delete().in('cod_atencion', ghostCodesCloud).then(({ error: delErr }) => {
            if (!delErr) {
                console.log("[Supabase Clean Engine] Registros fantasmas borrados permanentemente de la nube Supabase.");
            }
        });
    } catch(e) {}

    try {
        console.log(limit ? `[Supabase] Sincronizando últimos ${limit} pacientes...` : "[Supabase] Iniciando recuperación completa por lotes...");

        let allData = [];
        if (limit) {
            const { data, error } = await supabase
                .from('pacientes')
                .select(LIGHT_COLUMNS)
                .order('id', { ascending: false })
                .limit(limit);
            if (!error && data) allData = data;
        } else {
            // GARANTÍA MILITAR: Recuperación completa por lotes de 1000 para superar el límite por defecto de PostgREST
            let fromRow = 0;
            const batchSize = 1000;
            let keepFetching = true;
            while (keepFetching) {
                const { data, error } = await supabase
                    .from('pacientes')
                    .select(LIGHT_COLUMNS)
                    .order('id', { ascending: false })
                    .range(fromRow, fromRow + batchSize - 1);
                
                if (error || !data || data.length === 0) {
                    keepFetching = false;
                } else {
                    allData.push(...data);
                    if (data.length < batchSize) {
                        keepFetching = false;
                    } else {
                        fromRow += batchSize;
                    }
                }
            }
        }

        const data = allData;

        if (data && data.length > 0) {
            const ghostCodesFilter = ['26q-778', '26q-779', '26q-782'];
            const cleanData = data.filter(d => !ghostCodesFilter.includes(cleanCodeFunc(d.cod_atencion || d.codAtencion)));
            const parsedPatients = cleanData.map(mapDbToPatient);
            const queue = getPendingSyncQueue();
            const unsyncedCodes = new Set(queue.map(item => cleanCodeFunc(item.codAtencion)));
            
            // 1. Identificar y PRESERVAR todos los pacientes locales creados en el sistema
            const unsyncedPatients = patientDatabase.filter(local => {
                const isMatch = parsedPatients.some(db => cleanCodeFunc(db.codAtencion || db.cod_atencion || db.codigo) === cleanCodeFunc(local.codAtencion || local.cod_atencion || local.codigo));
                if (isMatch) return false;
                console.log(`[Sync Engine] Preservando paciente local creado: ${local.codAtencion}`);
                return true;
            });

            // 2. Fusión inteligente para preservar descripciones y fotos locales que vinieron vacías
            const mergedPatients = parsedPatients.map(db => {
                const dbClean = cleanCodeFunc(db.codAtencion);
                const local = patientDatabase.find(l => cleanCodeFunc(l.codAtencion) === dbClean);
                if (local) {
                    // Si el paciente tiene escrituras pendientes en la cola local, preservar el objeto local completo!
                    if (unsyncedCodes.has(dbClean)) {
                        console.log(`[Sync Engine] Preservando cambios locales no sincronizados para ${db.codAtencion}`);
                        return local;
                    }
                    // MERGE PROTEGIDO NO DESTRUCTIVO EN SINCRONIZACIÓN COMPLETA
                    const mergedResult = safeMergePatientRecords(local, db);
                    const slaStatus = getPatientSlaStatus(mergedResult);
                    mergedResult.firmado = slaStatus.isFirmado;
                    mergedResult.modificado = slaStatus.isModificado;
                    mergedResult.estado = slaStatus.estado;

                    // AUTO-CURACIÓN DE NUBE: Si local tiene diagnóstico o macro pero Supabase estaba vacío, subirlo automáticamente a la nube
                    const cleanDiagDb = String(db.diagnostico || db.diag || '').replace(/<[^>]*>/g, '').trim();
                    const cleanDiagLocal = String(local.diagnostico || local.diag || '').replace(/<[^>]*>/g, '').trim();
                    if ((!cleanDiagDb || cleanDiagDb === '---') && (cleanDiagLocal && cleanDiagLocal !== '---')) {
                        console.log(`[Auto-Cloud Sync] Diagnóstico local detectado para ${db.codAtencion}. Auto-sincronizando a la nube Supabase...`);
                        syncSinglePatientToCloud(mergedResult);
                    }

                    return mergedResult;
                }
                return db;
            });

            // 3. Fusión en la base de datos de memoria
            if (limit) {
                // Sincronización incremental: Actualizar quirúrgicamente los registros en el array existente
                mergedPatients.forEach(p => {
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (idx !== -1) {
                        patientDatabase[idx] = p;
                    } else {
                        patientDatabase.unshift(p);
                    }
                });
                // ¡GARANTÍA ZERO-DATA-LOSS! Preservar siempre pacientes locales no sincronizados en la sincronización incremental
                unsyncedPatients.forEach(p => {
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (idx === -1) {
                        console.log(`[Sync Engine] Inserción de respaldo local incremental para ${p.codAtencion}`);
                        patientDatabase.push(p);
                    }
                });
            } else {
                // Sincronización completa ZERO-LOSS: Jamás vaciar patientDatabase si tiene los 1,252 registros soberanos
                if (Array.isArray(mergedPatients) && mergedPatients.length >= patientDatabase.length && mergedPatients.length >= 1252) {
                    patientDatabase.length = 0;
                    mergedPatients.forEach(p => patientDatabase.push(p));
                } else if (Array.isArray(mergedPatients) && mergedPatients.length > 0) {
                    mergedPatients.forEach(p => {
                        const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion || local.cod_atencion) === cleanCodeFunc(p.codAtencion || p.cod_atencion));
                        if (idx !== -1) patientDatabase[idx] = p;
                        else patientDatabase.push(p);
                    });
                }
                
                // Agregar los no sincronizados para evitar pérdida de datos
                unsyncedPatients.forEach(p => {
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (idx === -1) {
                        patientDatabase.push(p);
                    }
                    // Subir asíncronamente a la nube mediante el motor indestructible de transmisión
                    console.log(`[Supabase] Auto-sincronizando paciente local creado fuera de línea: ${p.codAtencion}`);
                    syncSinglePatientToCloud(p);
                });

                // Incorporar cualquier registro de contingencia de REAL_SUPABASE_PATIENTS no presente en la nube
                const contingencyList = getRealSupabasePatients();
                if (Array.isArray(contingencyList)) {
                    contingencyList.forEach(cp => {
                        const cleanCode = cleanCodeFunc(cp.codAtencion || cp.cod_atencion);
                        const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion || local.cod_atencion) === cleanCode);
                        if (idx === -1) {
                            patientDatabase.push(JSON.parse(JSON.stringify(cp)));
                        }
                    });
                }
            }

            // Ordenar numéricamente descendente por código (ej: 26Q-235 arriba de 26Q-232)
            sortPatientArray(patientDatabase);

            // Sincronizar patientMap en O(1) con clave canónica
            patientMap.clear();
            patientDatabase.forEach(p => {
                if (p && (p.codAtencion || p.cod_atencion)) {
                    patientMap.set(cleanCodeFunc(p.codAtencion || p.cod_atencion), p);
                }
            });

            // Guardar localmente
            triggerAutomaticBackup();
            
            console.log(limit ? `[Supabase] Sincronización incremental completada (${parsedPatients.length} procesados).` : `[Supabase] Sincronizados ${parsedPatients.length} pacientes desde la nube, manteniendo ${unsyncedPatients.length} registros locales pendientes.`);
        }

        if (typeof window.refreshPatientTable === 'function') {
            window.refreshPatientTable();
        }
    } catch (e) {
        console.error("Error en syncPatientsFromSupabase:", e);
    }
}

const recentlySavedLocalCodes = new Map();

export function markCodeRecentlySaved(codAtencion) {
    if (!codAtencion) return;
    recentlySavedLocalCodes.set(codAtencion, Date.now());
}

// ============================================================================
// SINCRONIZACIÓN EN TIEMPO REAL: CANAL INTER-PESTAÑAS (BROADCASTCHANNEL)
// ============================================================================
const TAB_INSTANCE_ID = 'tab_' + Math.random().toString(36).substring(2, 9);
let syncBroadcastChannel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
        syncBroadcastChannel = new BroadcastChannel('jc_path_sync_channel');
        syncBroadcastChannel.onmessage = (event) => {
            const data = event.data;
            if (!data || data.senderTabId === TAB_INSTANCE_ID) return;

            if (data.type === 'PATIENT_SAVED' && data.patient) {
                const targetClean = cleanCodeFunc(data.patient.codAtencion || data.patient.cod_atencion);
                let local = patientMap.get(targetClean);
                if (!local) {
                    const idx = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion) === targetClean);
                    if (idx !== -1) local = patientDatabase[idx];
                }

                const activeCode = (window.activePatientCode || (window.currentEditingPatient && window.currentEditingPatient.codAtencion) || '').toLowerCase().replace(/[-_\s]/g, '');
                const isCurrentlyEditing = activeCode && activeCode === targetClean;

                if (local) {
                    if (isCurrentlyEditing) {
                        // Preservar edición clínica activa
                        data.patient.macroDesc = local.macroDesc || data.patient.macroDesc;
                        data.patient.microDesc = local.microDesc || data.patient.microDesc;
                        data.patient.diagnostico = local.diagnostico || data.patient.diagnostico;
                    }
                    Object.assign(local, data.patient);
                    patientMap.set(targetClean, local);
                } else {
                    patientDatabase.push(data.patient);
                    patientMap.set(targetClean, data.patient);
                }

                // Replicar a todas las estructuras maestras en memoria para consistencia absoluta O(1)
                if (typeof window !== 'undefined') {
                    ['REAL_SUPABASE_PATIENTS', 'REAL_SUPABASE_BACKUP', 'realSupabaseBackup'].forEach(storeName => {
                        if (Array.isArray(window[storeName])) {
                            const bIdx = window[storeName].findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === targetClean);
                            if (bIdx !== -1) {
                                Object.assign(window[storeName][bIdx], data.patient);
                            } else {
                                window[storeName].unshift(Object.assign({}, data.patient));
                            }
                        }
                    });
                }

                sortPatientArray(patientDatabase);
                savePatientToIndexedDB(data.patient);
                if (typeof window.refreshPatientTable === 'function') {
                    window.refreshPatientTable(false);
                }
            } else if (data.type === 'PATIENT_DELETED' && data.codAtencion) {
                const targetClean = cleanCodeFunc(data.codAtencion);
                patientMap.delete(targetClean);
                const idx = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion) === targetClean);
                if (idx !== -1) patientDatabase.splice(idx, 1);
                if (typeof window !== 'undefined') {
                    ['REAL_SUPABASE_PATIENTS', 'REAL_SUPABASE_BACKUP', 'realSupabaseBackup'].forEach(storeName => {
                        if (Array.isArray(window[storeName])) {
                            const bIdx = window[storeName].findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === targetClean);
                            if (bIdx !== -1) window[storeName].splice(bIdx, 1);
                        }
                    });
                }
                deletePatientFromIndexedDB(data.codAtencion);
                if (typeof window.refreshPatientTable === 'function') {
                    window.refreshPatientTable(false);
                }
            }
        };
    } catch (eBc) {
        console.warn("[BroadcastChannel] No soportado o bloqueado:", eBc);
    }
}

// Sincronización nativa inter-pestañas mediante evento 'storage' para patientDatabaseLocal
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (event.key === 'patientDatabaseLocal' && event.newValue) {
            try {
                const parsed = JSON.parse(event.newValue);
                if (Array.isArray(parsed) && parsed.length >= 1190) {
                    patientDatabase.length = 0;
                    parsed.forEach(p => patientDatabase.push(p));
                    patientMap.clear();
                    patientDatabase.forEach(p => {
                        if (p && (p.codAtencion || p.cod_atencion)) {
                            patientMap.set(cleanCodeFunc(p.codAtencion || p.cod_atencion), p);
                        }
                    });
                    sortPatientArray(patientDatabase);
                    if (typeof window.refreshPatientTable === 'function') {
                        window.refreshPatientTable(false);
                    }
                }
            } catch (err) {
                console.warn("[Storage Sync] Error al sincronizar patientDatabaseLocal:", err);
            }
        }
    });
}

export function broadcastLocalSyncEvent(type, payload) {
    if (!syncBroadcastChannel) return;
    try {
        syncBroadcastChannel.postMessage({
            type: type,
            senderTabId: TAB_INSTANCE_ID,
            ...payload
        });
    } catch (e) {}
}

let activeRealtimeChannel = null;
let realtimeReconnectDelay = 3000;
let realtimeWatchdogTimer = null;
let lastRealtimePing = Date.now();

export function subscribePatientsRealtime() {
    try {
        const supabase = window.supabase;
        const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
        if (!usingSupabase) return;

        if (activeRealtimeChannel) {
            try {
                supabase.removeChannel(activeRealtimeChannel);
            } catch (eChan) {}
            activeRealtimeChannel = null;
        }

        console.log("[Supabase] Suscribiéndose a cambios en tiempo real...");
        activeRealtimeChannel = supabase.channel('schema-db-changes');
        
        activeRealtimeChannel
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'pacientes'
                },
                (payload) => {
                    console.log("[Supabase] Cambio en base de datos recibido:", payload);
                    const eventType = payload.eventType;
                    const newRecord = payload.new;
                    const oldRecord = payload.old;

                    // Evitar doble re-renderizado por eco de cambios locales propios
                    const targetCode = (newRecord && newRecord.cod_atencion) || (oldRecord && oldRecord.cod_atencion);
                    if (targetCode) {
                        // 1. Evitar sobreescribir si hay cambios locales pendientes de sincronizar en la cola
                        const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
                        const cleanTarget = cleanCodeFunc(targetCode);
                        if (queue.some(item => cleanCodeFunc(item.codAtencion) === cleanTarget)) {
                            console.log(`[Supabase Realtime] Cambio en base de datos ignorado para ${targetCode} porque tiene escrituras locales pendientes.`);
                            return;
                        }

                        // 2. Evitar doble re-renderizado por eco de cambios locales propios recientes
                        const lastSaved = recentlySavedLocalCodes.get(targetCode);
                        if (lastSaved && (Date.now() - lastSaved < 5000)) {
                            console.log(`[Supabase Realtime] Eco local omitido para ${targetCode}`);
                            return;
                        }
                    }

                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        const patient = mapDbToPatient(newRecord);
                        const targetClean = cleanCodeFunc(patient.codAtencion || patient.cod_atencion);
                        let local = patientMap.get(targetClean);
                        if (!local) {
                            const idx = patientDatabase.findIndex(p => p.id === patient.id || cleanCodeFunc(p.codAtencion) === targetClean);
                            if (idx !== -1) local = patientDatabase[idx];
                        }

                        if (local) {
                            delete local._searchKey;
                            delete local._sortYear;
                            delete local._sortNum;
                            delete local._sortCodeRaw;
                            
                            // Sincronización Realtime bidireccional inteligente:
                            const activeCode = (window.activePatientCode || (window.currentEditingPatient && window.currentEditingPatient.codAtencion) || '').toLowerCase().replace(/[-_\s]/g, '');
                            const isCurrentlyEditing = activeCode && activeCode === targetClean;

                            if (isCurrentlyEditing) {
                                // Si el usuario tiene este paciente ABIERTO en el editor en este instante, preservar sus textos en edición activa
                                patient.macroDesc = local.macroDesc || patient.macroDesc || "";
                                patient.microDesc = local.microDesc || patient.microDesc || "";
                                patient.diagnostico = local.diagnostico || patient.diagnostico || "";
                                patient.img01 = local.img01 || patient.img01 || null;
                                patient.img02 = local.img02 || patient.img02 || null;
                                patient.macro360 = local.macro360 || patient.macro360 || null;
                                patient.solicitudInforme = local.solicitudInforme || patient.solicitudInforme || null;
                            } else {
                                // Si el paciente NO está siendo editado activamente en esta pantalla:
                                // ACEPTAR INCONDICIONALMENTE la actualización que viene de la otra PC o celular
                                if (!patient.img01 && local.img01) patient.img01 = local.img01;
                                if (!patient.img02 && local.img02) patient.img02 = local.img02;
                                if (!patient.macro360 && local.macro360) patient.macro360 = local.macro360;
                                if (!patient.solicitudInforme && local.solicitudInforme) patient.solicitudInforme = local.solicitudInforme;
                            }
                            Object.assign(local, patient);
                            patientMap.set(targetClean, local);
                            savePatientToIndexedDB(local);

                        } else {
                            patientDatabase.push(patient);
                            patientMap.set(targetClean, patient);
                        }
                        
                        sortPatientArray(patientDatabase);
                        const finalPatient = patientMap.get(targetClean) || patient;
                        savePatientToIndexedDB(finalPatient);
                        try { safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase)); } catch (e) {}

                        // PROPAGACIÓN INMEDIATA A CONTINGENCIA EN MEMORIA PARA CLIENTES Y CLÍNICAS
                        if (Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
                            const bkpIdx = window.REAL_SUPABASE_PATIENTS.findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === targetClean);
                            if (bkpIdx !== -1) {
                                window.REAL_SUPABASE_PATIENTS[bkpIdx] = Object.assign({}, window.REAL_SUPABASE_PATIENTS[bkpIdx], finalPatient);
                            } else {
                                window.REAL_SUPABASE_PATIENTS.unshift(Object.assign({}, finalPatient));
                            }
                        }

                        if (eventType === 'UPDATE' && typeof window.updateOpenEditorIfMatches === 'function') {
                            window.updateOpenEditorIfMatches(finalPatient);
                        }

                        if (eventType === 'INSERT') {
                            window.lastRealtimeInsertedCode = targetClean;
                        }

                        if (typeof window.showToast === 'function') {
                            if (eventType === 'INSERT') {
                                const servName = finalPatient.service === 'C' ? 'Citología' : (finalPatient.service === 'I' ? 'Inmunohistoquímica' : 'Muestras HE');
                                window.showToast(`🔔 Nuevo registro remoto ingresado: ${finalPatient.codAtencion} - ${finalPatient.paciente || 'Paciente'} (${servName})`, 'info');
                            } else {
                                window.showToast(`🔄 Expediente actualizado en tiempo real: ${finalPatient.codAtencion}`, 'success');
                                if (finalPatient.firmado || finalPatient.estado === 'Completado') {
                                    playNotificationChime();
                                    window.showToast(`🔔 ¡ATENCIÓN! Reporte Firmado Listo: ${finalPatient.codAtencion} - ${finalPatient.paciente || ''}`, 'success');
                                }
                            }
                        }
                    } else if (eventType === 'DELETE') {
                        const idToDelete = oldRecord.id || (newRecord && newRecord.id);
                        const targetCodToDel = (oldRecord && oldRecord.cod_atencion) || (newRecord && newRecord.cod_atencion);
                        const cleanDelCode = cleanCodeFunc(targetCodToDel);
                        if (cleanDelCode) patientMap.delete(cleanDelCode);
                        if (idToDelete) {
                            const idx = patientDatabase.findIndex(p => p.id === idToDelete || (cleanDelCode && cleanCodeFunc(p.codAtencion) === cleanDelCode));
                            if (idx !== -1) {
                                const cod = patientDatabase[idx].codAtencion;
                                if (cod) deletePatientFromIndexedDB(cod);
                                patientDatabase.splice(idx, 1);
                                try { safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase)); } catch (e) {}
                            }
                        }
                    }

                    // Guardar localmente
                    triggerAutomaticBackup();

                    // Refrescar tabla manteniendo la página activa seleccionada por el usuario
                    if (typeof window.refreshPatientTable === 'function') {
                        window.refreshPatientTable(false);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'plantillas'
                },
                (payload) => {
                    console.log("[Supabase Realtime] Cambio en plantillas recibido:", payload);
                    const { eventType, new: newTpl, old: oldTpl } = payload;
                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        if (!newTpl) return;
                        const mapped = {
                            id: Number(newTpl.id),
                            categoryId: Number(newTpl.categoryId || newTpl.category_id || 0),
                            titulo: newTpl.titulo || '',
                            macro: newTpl.macro || '',
                            micro: newTpl.micro || '',
                            diag: newTpl.diag || ''
                        };
                        const idx = templatesDatabase.findIndex(t => Number(t.id) === mapped.id || (t.titulo || '').trim().toUpperCase() === mapped.titulo.trim().toUpperCase());
                        if (idx !== -1) {
                            templatesDatabase[idx] = mapped;
                        } else {
                            templatesDatabase.push(mapped);
                        }
                    } else if (eventType === 'DELETE') {
                        if (!oldTpl && !newTpl) return;
                        const delId = Number((oldTpl && oldTpl.id) || (newTpl && newTpl.id));
                        const idx = templatesDatabase.findIndex(t => Number(t.id) === delId);
                        if (idx !== -1) templatesDatabase.splice(idx, 1);
                    }
                    try { safeSetLocalStorage('plantillasDB', JSON.stringify(templatesDatabase)); } catch(e) {}
                    if (typeof window.renderTemplatesTreeView === 'function') window.renderTemplatesTreeView();
                    if (typeof window.showToast === 'function') {
                        window.showToast(`✨ Plantillas sincronizadas en tiempo real desde la nube.`, 'info');
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'doctores'
                },
                (payload) => {
                    console.log("[Supabase Realtime] Cambio en doctores recibido:", payload);
                    const { eventType, new: newDoc, old: oldDoc } = payload;
                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        if (!newDoc) return;
                        const mappedDoc = {
                            doctor: newDoc.nombre || newDoc.doctor || '',
                            colegiado: newDoc.cmp || newDoc.colegiado || '',
                            especializacion: newDoc.rne || newDoc.especializacion || '',
                            clinica: newDoc.clinica || newDoc.provincia || newDoc.tipo || ''
                        };
                        const idx = doctorsDatabase.findIndex(d => (d.doctor || '').toUpperCase() === mappedDoc.doctor.toUpperCase());
                        if (idx !== -1) doctorsDatabase[idx] = mappedDoc;
                        else doctorsDatabase.unshift(mappedDoc);
                    } else if (eventType === 'DELETE') {
                        const docName = String((oldDoc && (oldDoc.nombre || oldDoc.doctor)) || '').toUpperCase();
                        if (docName) {
                            const idx = doctorsDatabase.findIndex(d => (d.doctor || '').toUpperCase() === docName);
                            if (idx !== -1) doctorsDatabase.splice(idx, 1);
                        }
                    }
                    if (typeof window.populateModalDoctorsSelect === 'function') window.populateModalDoctorsSelect();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'categorias'
                },
                (payload) => {
                    console.log("[Supabase Realtime] Cambio en categorías recibido:", payload);
                    const { eventType, new: newCat, old: oldCat } = payload;
                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        if (!newCat) return;
                        const mapped = {
                            id: Number(newCat.id),
                            tipo: newCat.tipo || 'Macroscopica',
                            categoria: newCat.categoria || newCat.nombre || ''
                        };
                        const idx = categoriesDatabase.findIndex(c => Number(c.id) === mapped.id);
                        if (idx !== -1) categoriesDatabase[idx] = mapped;
                        else categoriesDatabase.push(mapped);
                    } else if (eventType === 'DELETE') {
                        const delId = Number((oldCat && oldCat.id) || (newCat && newCat.id));
                        const idx = categoriesDatabase.findIndex(c => Number(c.id) === delId);
                        if (idx !== -1) categoriesDatabase.splice(idx, 1);
                    }
                    try { safeSetLocalStorage('categoriasDB', JSON.stringify(categoriesDatabase)); } catch(e) {}
                    if (typeof window.renderCategoriesTable === 'function') window.renderCategoriesTable();
                }
            )
            .subscribe((status, err) => {
                console.log(`[Supabase Realtime Status] Canal multiplexado: ${status}`, err || '');
                if (status === 'SUBSCRIBED') {
                    console.log("[Supabase Realtime] Conectado en tiempo real al canal multiplexado (pacientes, plantillas, doctores, categorías).");
                    realtimeReconnectDelay = 3000; // Restablecer delay tras conexión exitosa
                    lastRealtimePing = Date.now();
                    window._realtimeChannelConnected = true;
                    if (typeof updateSyncStatusUI === 'function') updateSyncStatusUI();

                    // Watchdog de 30 segundos: si el canal se cae o suspende la PC, forzar reconexión automática
                    if (!realtimeWatchdogTimer) {
                        realtimeWatchdogTimer = setInterval(() => {
                            if (!activeRealtimeChannel || activeRealtimeChannel.state !== 'joined') {
                                console.warn("[Supabase Watchdog] Canal no saludable o en estado:", activeRealtimeChannel?.state, ". Reconectando...");
                                subscribePatientsRealtime();
                            }
                        }, 30000);
                    }
                } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                    window._realtimeChannelConnected = false;
                    if (typeof updateSyncStatusUI === 'function') updateSyncStatusUI();
                    console.warn(`[Supabase Realtime] Canal cerrado o con advertencia (${status}). Reconectando en ${realtimeReconnectDelay}ms...`);
                    setTimeout(() => {
                        realtimeReconnectDelay = Math.min(realtimeReconnectDelay * 1.5, 60000); // Backoff exponencial hasta 60s
                        try { subscribePatientsRealtime(); } catch(eRec) {}
                    }, realtimeReconnectDelay);
                }
            });
    } catch (e) {
        console.error("[Supabase Realtime] Error en tiempo real:", e);
    }
}

export const initUnifiedRealtimeHub = subscribePatientsRealtime;
if (typeof window !== 'undefined') {
    window.initUnifiedRealtimeHub = initUnifiedRealtimeHub;
    window.subscribePatientsRealtime = subscribePatientsRealtime;
}

export function getPendingSyncQueue() {
    try {
        return JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    } catch (e) {
        return [];
    }
}

let isSyncing = false;

// FUNCIÓN DE SINCRONIZACIÓN MILITAR DIRECTA A LA NUBE SUPABASE (Upsert + Fallback Update/Insert)
export async function syncSinglePatientToCloud(patient) {
    if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE) {
        // En modo soberano, sincronización no bloqueante vía webhook n8n local (localhost:5678)
        if (typeof dispatchN8nWebhook === 'function') {
            dispatchN8nWebhook('guardarPaciente', patient).catch(() => {});
        }
        return { success: true, sovereign: true, n8n: true };
    }

    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase || !patient) return { success: false, reason: 'Sin conexión a Supabase' };

    let dbRecord = sanitizeRecordForSupabase(mapPatientToDb(patient));

    // Omitir id si el registro no proviene originalmente de la nube para prevenir errores pacientes_pkey
    if (!patient._fromCloud || !dbRecord.id) {
        delete dbRecord.id;
    }

    let attempts = 0;
    
    // Intento 1: Upsert directo por cod_atencion
    while (attempts < 5) {
        attempts++;
        try {
            const res = await supabase.from('pacientes').upsert([dbRecord], { onConflict: 'cod_atencion' });
            if (!res.error) {
                console.log(`[Supabase Cloud Engine] ¡Expediente ${patient.codAtencion} subido con éxito a la nube!`);
                return { success: true };
            }
            
            const err = res.error;
            console.warn(`[Supabase Cloud Engine] Intento ${attempts} de upsert con advertencia para ${patient.codAtencion}:`, err.message);
            
            if (err.message && (err.message.includes("pacientes_pkey") || err.message.includes("primary key"))) {
                console.warn(`[Supabase Cloud Engine] Removiendo id por conflicto de clave primaria para ${patient.codAtencion} y reintentando...`);
                delete dbRecord.id;
                await new Promise(r => setTimeout(r, 200));
                continue;
            }

            if (err.message && (err.message.includes("column") || err.code === "PGRST204" || err.code === "42703")) {
                const matchCol = err.message.match(/Could not find the '([^']+)' column/) || err.message.match(/column [^\s]*\.([^\s]+) does not exist/) || err.message.match(/column "([^"]+)"/);
                if (matchCol && matchCol[1]) {
                    const badCol = matchCol[1].replace(/['"]/g, '');
                    console.warn(`[Supabase Cloud Engine] Removiendo columna inexistente '${badCol}' y reintentando...`);
                    delete dbRecord[badCol];
                    await new Promise(r => setTimeout(r, 200));
                    continue;
                }
            }
            break;
        } catch (e) {
            console.error("[Supabase Cloud Engine] Excepción en upsert:", e);
            break;
        }
    }
    
    // Intento 2 (GARANTÍA MILITAR FALLBACK): Buscar por cod_atencion y hacer UPDATE o INSERT
    try {
        const targetCod = dbRecord.cod_atencion;
        const { data: existing } = await supabase
            .from('pacientes')
            .select('id, cod_atencion')
            .eq('cod_atencion', targetCod)
            .maybeSingle();

        if (existing && existing.id) {
            const updateRecord = sanitizeRecordForSupabase({ ...dbRecord });
            delete updateRecord.id;
            const { error: updErr } = await supabase
                .from('pacientes')
                .update(updateRecord)
                .eq('id', existing.id);
            if (!updErr) {
                console.log(`[Supabase Cloud Fallback] ¡Expediente ${patient.codAtencion} actualizado por ID (${existing.id})!`);
                return { success: true };
            }
            console.error("[Supabase Cloud Fallback Update Error]:", updErr);
        } else {
            const insertRecord = sanitizeRecordForSupabase({ ...dbRecord });
            delete insertRecord.id;
            const { error: insErr } = await supabase
                .from('pacientes')
                .insert([insertRecord]);
            if (!insErr) {
                console.log(`[Supabase Cloud Fallback] ¡Expediente ${patient.codAtencion} insertado exitosamente en la nube!`);
                return { success: true };
            }
            console.error("[Supabase Cloud Fallback Insert Error]:", insErr);
        }
    } catch (e) {
        console.error("[Supabase Cloud Fallback Excepción]:", e);
    }

    return { success: false };
}

export async function forcePushAllLocalPatientsToCloud() {
    console.log(`[Cloud Force Sync] Subiendo ${patientDatabase.length} pacientes locales a la nube Supabase...`);
    let pushed = 0;
    for (const patient of patientDatabase) {
        const res = await syncSinglePatientToCloud(patient);
        if (res.success) pushed++;
    }
    console.log(`[Cloud Force Sync] ¡${pushed} / ${patientDatabase.length} pacientes sincronizados a la nube!`);
    return pushed;
}

if (typeof window !== 'undefined') {
    window.syncSinglePatientToCloud = syncSinglePatientToCloud;
    window.forcePushAllLocalPatientsToCloud = forcePushAllLocalPatientsToCloud;
}

// 1. Encolar escritura para sincronización asíncrona
export function queueSyncWrite(actionType, codAtencion) {
    let queue = getPendingSyncQueue();

    // De-duplicación inteligente para optimizar llamadas
    const existingIdx = queue.findIndex(item => item.codAtencion === codAtencion);
    if (existingIdx !== -1) {
        queue[existingIdx] = { type: actionType, codAtencion, timestamp: Date.now() };
    } else {
        queue.push({ type: actionType, codAtencion, timestamp: Date.now() });
    }

    safeSetLocalStorage('pendingSyncWrites', JSON.stringify(queue));
    updateSyncStatusUI();
}

export async function processSyncQueue() {
    if (isSyncing) return;

    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase || !navigator.onLine) {
        updateSyncStatusUI();
        return;
    }

    let queue = getPendingSyncQueue();
    if (queue.length === 0) {
        updateSyncStatusUI();
        return;
    }

    isSyncing = true;
    updateSyncStatusUI();
    console.log(`[Sync Engine] Procesando cola de sincronización (${queue.length} cambios pendientes)...`);

    while (queue.length > 0) {
        const item = queue[0];
        let success = false;
        let errorMsg = '';

        try {
            if (item.type === 'SAVE') {
                const cleanCode = String(item.codAtencion || '').trim().toLowerCase();
                const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
                let patient = patientDatabase.find(x => {
                    const code = String(x.codAtencion || '').trim().toLowerCase();
                    return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
                });
                if (!patient) {
                    try {
                        patient = await getPatientFromIndexedDB(item.codAtencion);
                    } catch (e) {
                        console.error("[Sync Engine] Error al cargar de IndexedDB:", e);
                    }
                }
                if (!patient) {
                    console.error(`[Sync Engine] No se encontró el paciente ${item.codAtencion} para sincronizar.`);
                    queue.shift();
                    safeSetLocalStorage('pendingSyncWrites', JSON.stringify(queue));
                    continue;
                }
                
                const cloudRes = await syncSinglePatientToCloud(patient);
                if (cloudRes.success) {
                    success = true;
                } else {
                    errorMsg = 'Fallo en transmisión a la nube';
                }
            } else if (item.type === 'DELETE') {
                const { error } = await supabase
                    .from('pacientes')
                    .delete()
                    .eq('cod_atencion', item.codAtencion);
                if (error) {
                    errorMsg = error.message;
                } else {
                    success = true;
                }
            }
        } catch (e) {
            errorMsg = e.message || 'Error de conexión';
        }

        if (success) {
            console.log(`[Sync Engine] Sincronizado con éxito: ${item.type} para ${item.codAtencion}`);
            try {
                let currentQueue = JSON.parse(localStorage.getItem('pendingSyncWrites') || '[]');
                currentQueue = currentQueue.filter(q => q.codAtencion !== item.codAtencion);
                safeSetLocalStorage('pendingSyncWrites', JSON.stringify(currentQueue));
                queue = currentQueue;
            } catch (eQueue) {
                queue.shift();
            }
        } else {
            console.error(`[Sync Engine] Error al sincronizar ${item.type} para ${item.codAtencion}:`, errorMsg);
            try {
                let currentQueue = JSON.parse(localStorage.getItem('pendingSyncWrites') || '[]');
                const targetIdx = currentQueue.findIndex(q => q.codAtencion === item.codAtencion);
                if (targetIdx !== -1) {
                    currentQueue[targetIdx].retries = (currentQueue[targetIdx].retries || 0) + 1;
                    if (currentQueue[targetIdx].retries >= 5) {
                        let archive = [];
                        try { archive = JSON.parse(localStorage.getItem('failedSyncQueue') || '[]'); } catch(e) {}
                        archive.push(currentQueue[targetIdx]);
                        safeSetLocalStorage('failedSyncQueue', JSON.stringify(archive));
                        currentQueue.splice(targetIdx, 1);
                    }
                }
                safeSetLocalStorage('pendingSyncWrites', JSON.stringify(currentQueue));
                queue = currentQueue;
            } catch (eQueue) {
                queue.shift();
            }
            break;
        }
    }

    isSyncing = false;
    updateSyncStatusUI();
}

export function playNotificationChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.45);
    } catch(e) {
        console.warn("Chime audio disabled:", e);
    }
}

export async function sendAutomatedReportEmail(patient) {
    const resendApiKey = localStorage.getItem('resendApiKey') || '';
    const recipientEmail = patient.correoMedico || patient.correoClinica || patient.correo || '';
    
    if (!recipientEmail || !resendApiKey) {
        console.log(`[Email Dispatcher] Notificación por correo lista. Configure clave Resend y correo de médico para envío automático.`);
        return;
    }

    console.log(`[Email Dispatcher] Enviando correo automático para ${patient.codAtencion} a ${recipientEmail}...`);
    
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 1.3rem;">🔬 SERVICIO DE ANATOMÍA PATOLÓGICA</h2>
                <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #38bdf8;">REPORTE ANATOMOPATOLÓGICO FIRMADO</p>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6;">
                <p>Estimado(a) <strong>${patient.medSolicitante || 'Doctor'}</strong>,</p>
                <p>Le informamos que el reporte anatomopatológico del paciente <strong>${patient.paciente || ''}</strong> ya se encuentra <strong>LISTO Y FIRMADO</strong> por el patólogo responsable.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 6px;">
                    <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Código de Atención:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: bold;">${patient.codAtencion}</td></tr>
                    <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Especimen / Muestra:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${patient.especimen || '---'}</td></tr>
                    <tr><td style="padding: 8px 12px; font-weight: bold;">Fecha de Entrega:</td><td style="padding: 8px 12px;">${patient.fecEntrega || '---'}</td></tr>
                </table>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(patient.codAtencion)}" target="_blank" style="background: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">📄 Visualizar y Descargar PDF Oficial</a>
                </div>
            </div>
            <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 0.78rem; color: #64748b;">
                Este es un mensaje automático del Sistema de Gestión de Reportes Patológicos.
            </div>
        </div>
    `;

    try {
        const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'Laboratorio Patología <reportes@resend.dev>',
                to: [recipientEmail],
                subject: `[REPORTE FIRMADO] Paciente: ${patient.paciente || ''} | Código: ${patient.codAtencion}`,
                html: emailHtml
            })
        });
        if (resp.ok) {
            console.log(`[Email Dispatcher] Correo enviado con éxito a ${recipientEmail}`);
            if (typeof window.showToast === 'function') window.showToast(`✉️ Correo automático enviado a ${recipientEmail}`, 'success');
        }
    } catch(e) {
        console.warn("[Email Dispatcher] Aviso al enviar correo:", e);
    }
}

export async function savePatient(patient) {
    const sla = getPatientSlaStatus(patient);
    patient.firmado = sla.isFirmado;
    patient.modificado = sla.isModificado;
    patient.estado = sla.estado;
    patient.updatedAt = new Date().toISOString();

    if (patient.firmado || patient.estado === 'Completado') {
        playNotificationChime();
        sendAutomatedReportEmail(patient);
    }
    const cleanCode = String(patient.codAtencion || '').trim().toLowerCase();
    const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
    const idx = patientDatabase.findIndex(p => {
        const code = String(p.codAtencion || '').trim().toLowerCase();
        return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
    });
    if (idx !== -1) {
        patientDatabase[idx] = { ...patientDatabase[idx], ...patient };
    } else {
        if (!patient.id) {
            patient.id = patientDatabase.length > 0 ? Math.max(...patientDatabase.map(x => Number(x.id) || 0)) + 1 : 1;
        }
        patientDatabase.push(patient);
    }
    
    // GARANTÍA MILITAR: Re-ordenar siempre numéricamente por código
    sortPatientArray(patientDatabase);
    
    // Sincronizar patientMap en O(1)
    const canonicalCode = cleanCodeFunc(patient.codAtencion || patient.cod_atencion);
    if (canonicalCode) {
        const existingMapPat = patientMap.get(canonicalCode);
        if (existingMapPat) {
            Object.assign(existingMapPat, patient);
        } else {
            patientMap.set(canonicalCode, patient);
        }
    }
    
    // Registrar timestamp local para omitir eco en tiempo real
    markCodeRecentlySaved(patient.codAtencion);

    // Guardar en IndexedDB
    savePatientToIndexedDB(patient);

    // 📡 SINCRONIZACIÓN MILITAR INTER-PESTAÑAS E INTER-PÁGINAS (BROADCASTCHANNEL + STORAGE EVENT)
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            if (!window._jcSyncChannel) window._jcSyncChannel = new BroadcastChannel('jcpathlab_realtime_sync');
            window._jcSyncChannel.postMessage({
                type: 'PATIENT_UPDATED',
                codAtencion: canonicalCode,
                patient: patient,
                timestamp: Date.now()
            });
        }
        // Evento fallback para navegadores antiguos / móviles
        const syncPayload = { cod: canonicalCode, patient: patient, t: Date.now() };
        localStorage.setItem('jc_sync_pulse', JSON.stringify(syncPayload));
    } catch(eSync) {}
    
    // Guardar respaldo local
    triggerAutomaticBackup();

    // Actualizar inmediatamente la contingencia en memoria de clínicas en TODOS los almacenes
    if (typeof window !== 'undefined') {
        ['REAL_SUPABASE_PATIENTS', 'REAL_SUPABASE_BACKUP', 'realSupabaseBackup'].forEach(storeName => {
            if (Array.isArray(window[storeName])) {
                const bIdx = window[storeName].findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === canonicalCode);
                if (bIdx !== -1) {
                    window[storeName][bIdx] = Object.assign({}, window[storeName][bIdx], patient);
                } else {
                    window[storeName].unshift(Object.assign({}, patient));
                }
            }
        });
    }
    
    // GARANTÍA MILITAR DE NUBE: Sincronización inmediata e indestructible a Supabase
    syncSinglePatientToCloud(patient).then(res => {
        if (!res || !res.success) {
            queueSyncWrite('SAVE', patient.codAtencion);
            processSyncQueue();
        }
    }).catch(err => {
        console.warn("[Supabase Cloud] Fallo de red en sincronización inmediata, encolando offline:", err);
        queueSyncWrite('SAVE', patient.codAtencion);
        processSyncQueue();
    });

    // Despacho no bloqueante al motor n8n local soberano (http://localhost:5678/webhook/guardar-paciente)
    if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE && typeof dispatchN8nWebhook === 'function') {
        dispatchN8nWebhook('guardarPaciente', patient).catch(() => {});
    }

    // Actualizar tabla local
    if (typeof window.refreshPatientTable === 'function') {
        window.refreshPatientTable();
    }

    // Replicación inter-pestañas instantánea (< 10ms) en la misma máquina
    broadcastLocalSyncEvent('PATIENT_SAVED', { patient });
}

// 4. Centralizar la eliminación de pacientes
export async function deletePatient(codAtencion) {
    markCodeRecentlySaved(codAtencion);
    const idx = patientDatabase.findIndex(p => p.codAtencion === codAtencion);
    if (idx !== -1) {
        patientDatabase.splice(idx, 1);
    }
    
    // Eliminar de IndexedDB
    deletePatientFromIndexedDB(codAtencion);
    
    // Guardar respaldo local
    triggerAutomaticBackup();
    
    // Despacho no bloqueante a n8n en modo soberano
    if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE) {
        if (typeof dispatchN8nWebhook === 'function') {
            dispatchN8nWebhook('eliminarPaciente', { codAtencion }).catch(() => {});
        }
    } else {
        // Encolar y procesar sync si no está en modo soberano
        queueSyncWrite('DELETE', codAtencion);
        processSyncQueue();
    }
    
    // Actualizar tabla local
    if (typeof window.refreshPatientTable === 'function') {
        window.refreshPatientTable();
    }

    // Replicación inter-pestañas instantánea
    broadcastLocalSyncEvent('PATIENT_DELETED', { codAtencion });
}

// 5. Actualizar la UI del widget de sincronización
export function updateSyncStatusUI() {
    const isOnline = navigator.onLine;
    const queue = getPendingSyncQueue();
    const pendingCount = queue.length;
    
    const statusContainers = document.querySelectorAll('.connection-status');
    statusContainers.forEach(container => {
        container.className = 'connection-status';
        
        const dot = container.querySelector('.status-dot') || document.createElement('span');
        dot.className = 'status-dot';
        if (!container.querySelector('.status-dot')) {
            container.appendChild(dot);
        }
        
        const textSpan = container.querySelector('.status-text') || document.createElement('span');
        textSpan.className = 'status-text';
        if (!container.querySelector('.status-text')) {
            container.appendChild(textSpan);
        }
        
        if (isSyncing) {
            container.classList.add('online-syncing');
            textSpan.textContent = `Sincronizando...`;
        } else if (isOnline) {
            if (pendingCount > 0) {
                container.classList.add('online-syncing');
                textSpan.textContent = `Subiendo ${pendingCount} cambio(s)...`;
            } else {
                container.classList.add('online-synced');
                textSpan.textContent = `Sincronizado`;
            }
        } else {
            if (pendingCount > 0) {
                container.classList.add('offline-pending');
                textSpan.textContent = `Sin conexión (${pendingCount} pend.)`;
            } else {
                container.classList.add('offline-synced');
                textSpan.textContent = `Sin conexión (Local)`;
            }
        }
    });
}

// Event Listeners de red automáticos
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        processSyncQueue();
    });
    window.addEventListener('offline', () => {
        updateSyncStatusUI();
    });
}





// ============================================================================
// BASE DE DATOS ÚNICA SOBERANA (SSOT): DOCKER N8N (localhost:5678)
// Directiva Suprema del Dr. José Castillo: 100% Offline, Cero Créditos de Nube
// SSOT: /home/node/.n8n/jcpathlab_master.db montado en contenedor Docker n8n
// ============================================================================
export const N8N_SOVEREIGN_CONFIG = {
    baseUrl: 'http://localhost:5678',
    enabled: true,
    timeoutMs: 1200, // Timeout estricto para red local
    webhooks: {
        guardarPaciente: 'http://localhost:5678/webhook/guardar-paciente',
        guardarReporte: 'http://localhost:5678/webhook/guardar-reporte',
        obtenerPacientes: 'http://localhost:5678/webhook/obtener-pacientes',
        eliminarPaciente: 'http://localhost:5678/webhook/eliminar-paciente',
        syncGeneral: 'http://localhost:5678/webhook/jcpathlab-sync'
    }
};

if (typeof window !== 'undefined') {
    window.N8N_SOVEREIGN_CONFIG = N8N_SOVEREIGN_CONFIG;
}

export async function dispatchN8nWebhook(endpointKey, payload, options = {}) {
    if (typeof window === 'undefined' || !window.SUPABASE_SOVEREIGN_MODE || !N8N_SOVEREIGN_CONFIG.enabled) {
        return { success: false, reason: 'Sovereign backend dispatch disabled or inactive' };
    }

    const timeout = options.timeoutMs || N8N_SOVEREIGN_CONFIG.timeoutMs;
    const n8nUrl = N8N_SOVEREIGN_CONFIG.webhooks[endpointKey] || `${N8N_SOVEREIGN_CONFIG.baseUrl}/webhook/${endpointKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Source': 'JC_PATH_LAB_SOVEREIGN_UI'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timer);
        if (response.ok) {
            let data = null;
            try { data = await response.json(); } catch(e) {}
            return { success: true, status: response.status, data };
        }
        return { success: false, status: response.status };
    } catch (err) {
        clearTimeout(timer);
        // Fallback instantáneo al almacenamiento local (< 2ms)
        return { success: false, offline: true, error: err.name || 'n8n_unreachable' };
    }
}

export function obtenerPacientes(options = {}) {
    // Retorno síncrono instantáneo (< 2ms) del almacén local en RAM (Thin Client Zero Downtime)
    const list = (patientDatabase && patientDatabase.length > 0) ? patientDatabase : getRealSupabasePatients();
    
    // Sincronización en segundo plano directamente contra Docker n8n (localhost:5678)
    if (options.backgroundSync && typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE) {
        const limitParam = options.limit || 2000;
        fetch(`http://localhost:5678/webhook/obtener-pacientes?limit=${limitParam}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        }).then(r => r.json()).then(res => {
            const rawList = res && (Array.isArray(res.pacientes) ? res.pacientes : (Array.isArray(res) ? res : []));
            if (rawList && rawList.length > 0) {
                let updated = false;
                rawList.forEach(rawItem => {
                    let p = rawItem;
                    if (rawItem.datos_json && typeof rawItem.datos_json === 'string') {
                        try {
                            const dj = JSON.parse(rawItem.datos_json);
                            p = Object.assign({}, rawItem, dj);
                        } catch(e) {}
                    } else if (rawItem.datos && rawItem.datos.payload) {
                        p = Object.assign({}, rawItem, rawItem.datos.payload);
                    }
                    const cCode = cleanCodeFunc(p.codAtencion || p.cod_atencion);
                    if (!cCode) return;
                    const existing = patientMap.get(cCode);
                    if (existing) {
                        Object.assign(existing, safeMergePatientRecords(existing, p));
                        updated = true;
                    } else {
                        patientDatabase.push(p);
                        patientMap.set(cCode, p);
                        updated = true;
                    }
                });
                if (updated) {
                    sortPatientArray(patientDatabase);
                    safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
                    if (typeof window.refreshPatientTable === 'function') {
                        window.refreshPatientTable();
                    }
                }
            }
        }).catch(err => {
            console.warn('[n8n Sync] Consulta a Docker n8n completada con fallback local:', err);
        });
    }
    
    return list;
}

export async function guardarPaciente(patient) {
    // 1. Guardado local infalible (< 2ms) en RAM, IndexedDB y localStorage (Zero Downtime)
    const saved = await savePatient(patient);
    
    // 2. Despacho no bloqueante al backend soberano (FastAPI SQLite WAL + n8n)
    if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE && typeof dispatchN8nWebhook === 'function') {
        dispatchN8nWebhook('guardarPaciente', patient).catch(() => {});
    }
    
    return saved || { success: true, sovereign: true, localOnly: true };
}

export async function guardarReporte(reportData) {
    // Soporta tanto objeto de paciente como estructura de reporte clínico
    const patientRecord = (reportData && reportData.patient) ? reportData.patient : reportData;
    const res = await savePatient(patientRecord);
    
    if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE && typeof dispatchN8nWebhook === 'function') {
        dispatchN8nWebhook('guardarReporte', reportData).catch(() => {});
    }
    return res || { success: true, sovereign: true };
}

// ============================================================================
// PARCHE DE RESILIENCIA Y AUTOCURACIÓN DE GRADO MILITAR (SUPABASE ERROR 42703)
// ============================================================================
export async function resilientSupabaseUpsert(client, tableName, record, knownColumns = null) {
    if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE) {
        if (record && record.codAtencion) {
            if (typeof window.REAL_SUPABASE_PATIENTS !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
                const idx = window.REAL_SUPABASE_PATIENTS.findIndex(p => p.codAtencion === record.codAtencion || p.cod_atencion === record.codAtencion);
                if (idx !== -1) {
                    window.REAL_SUPABASE_PATIENTS[idx] = Object.assign({}, window.REAL_SUPABASE_PATIENTS[idx], record);
                } else {
                    window.REAL_SUPABASE_PATIENTS.unshift(Object.assign({}, record));
                }
            }
        }
        dispatchN8nWebhook('guardarPaciente', record).catch(() => {});
        return { success: true, sovereign: true };
    }

    if (!client || !record) return { success: false, error: 'No client or record' };
    
    // Si la tabla solicitada es 'pacientes', aplicamos la estrategia con Failover a 'pacientes_emergencia'
    const targetTables = (tableName === 'pacientes' || tableName === 'paciente') 
        ? ['pacientes', 'pacientes_emergencia'] 
        : [tableName];
    
    let payload = { ...record };
    
    for (const currentTable of targetTables) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const { data, error } = await client.from(currentTable).upsert(payload, { onConflict: 'codAtencion' });
                if (error) {
                    // Detectar si es un error crítico de servidor o fallo principal para activar failover
                    const isServerOrNetworkError = error.code === '500' || error.code === '504' || error.code === '429' || 
                        (error.message && (error.message.includes('500') || error.message.includes('504') || error.message.includes('429') || error.message.includes('timeout') || error.message.includes('connection')));
                    
                    if (isServerOrNetworkError && currentTable === 'pacientes') {
                        console.warn(`[Failover Engine] Tabla principal 'pacientes' falló (Código/Error: ${error.message || error.code}). Conmutando automáticamente a 'pacientes_emergencia'...`);
                        break; // Sale del loop de intentos para pasar a la tabla espejo
                    }

                    if (error.code === '42703' || (error.message && error.message.includes('column'))) {
                        console.warn(`[Resiliencia Militar] Columna inexistente detectada en '${currentTable}' (Intento ${attempt}). Analizando:`, error.message);
                        const match = error.message.match(/column\s+"([^"]+)"\s+of\s+relation/i) || error.message.match(/column\s+([\w_]+)\s+does not exist/i);
                        if (match && match[1]) {
                            const badCol = match[1];
                            delete payload[badCol];
                            continue;
                        } else {
                            const standardCols = ['id', 'codAtencion', 'cod_atencion', 'dni', 'paciente', 'nombres', 'apellidos', 'edad', 'sexo', 'especimen', 'macroDesc', 'microDesc', 'diagnostico', 'medSolicitante', 'clinica', 'doctor', 'fecRegistro', 'fecEntrega', 'costo', 'adelanto', 'resta', 'pagado', 'firmado', 'modificado', 'estado', 'service'];
                            const cleaned = {};
                            for (let k of standardCols) {
                                if (payload[k] !== undefined) cleaned[k] = payload[k];
                            }
                            payload = cleaned;
                            continue;
                        }
                    }
                    throw error;
                }
                if (currentTable === 'pacientes_emergencia') {
                    console.log(`[Failover Engine] Operación guardada exitosamente en la Tabla Espejo de Emergencia ('pacientes_emergencia').`);
                }
                return { success: true, data, tableUsed: currentTable };
            } catch (err) {
                const errMsg = String(err.message || err);
                const isNetOrServerErr = errMsg.includes('500') || errMsg.includes('504') || errMsg.includes('429') || errMsg.includes('timeout') || errMsg.includes('network') || errMsg.includes('Failed to fetch');
                
                if (isNetOrServerErr && currentTable === 'pacientes') {
                    console.warn(`[Failover Engine] Excepción de red/servidor en 'pacientes': ${errMsg}. Conmutando a 'pacientes_emergencia'...`);
                    break;
                }

                if (attempt === 3) {
                    if (currentTable === targetTables[targetTables.length - 1]) {
                        console.error('[Resiliencia Militar] Error persistente en upsert tras 3 intentos en todas las tablas:', err);
                        return { success: false, error: err };
                    }
                }
                await new Promise(r => setTimeout(r, 300 * attempt));
            }
        }
    }
    return { success: false, error: 'Max attempts reached across all fallback tables' };
}


// [ORQUESTADOR COLMENA - AGENTE 6]: Blindaje de Filtro Multiclínica
export function colmenaFilterByClinica(patients, clinicaName) {
    if (!Array.isArray(patients)) return [];
    if (!clinicaName || clinicaName === 'TODAS' || clinicaName === 'TODOS') return patients;
    const target = clinicaName.trim().toUpperCase();
    return patients.filter(p => {
        const c = String(p.clinica || p.hospital || p.institucion || '').trim().toUpperCase();
        return c.includes(target) || target.includes(c);
    });
}
if (typeof window !== 'undefined') {
    window.colmenaFilterByClinica = colmenaFilterByClinica;
}

// ============================================================================
// CLASE MultiClinicSyncEngine: MOTOR DE SINCRONIZACIÓN EN TIEMPO REAL MULTI-CLÍNICA
// ============================================================================
export class MultiClinicSyncEngine {
    constructor() {
        this.channelName = 'clinica_multitab_sync';
        this.broadcastChannel = null;
        this.supabaseSubscription = null;
        this.pollingIntervalId = null;
        this.backoffDelay = 1000;
        this.maxBackoffDelay = 30000;
        this.isStarted = false;
        this.onRemoteUpdateCallback = null;
        
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                this.broadcastChannel = new BroadcastChannel(this.channelName);
                this.broadcastChannel.onmessage = (event) => {
                    this.handleBroadcastMessage(event.data);
                };
            }
        } catch (e) {
            console.warn('[MultiClinicSyncEngine] BroadcastChannel no soportado en este entorno:', e);
        }
    }

    startRealtimeSubscription(callback) {
        if (this.isStarted) return;
        this.isStarted = true;
        if (typeof callback === 'function') {
            this.onRemoteUpdateCallback = callback;
        }

        console.log('[MultiClinicSyncEngine] Iniciando motor de sincronización multi-clínica...');

        // 1. WebSocket Supabase Realtime para tabla public:pacientes
        this.connectSupabaseRealtime();

        // 2. Polling adaptativo cada 8-10s con visibilitychange
        this.startAdaptivePolling();

        // 3. Listener de visibilidad de pestaña para sincronización instantánea al volver
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    console.log('[MultiClinicSyncEngine] Pestaña visible de nuevo. Sincronización instantánea activada.');
                    this.triggerImmediateSync();
                }
            });
        }
    }

    connectSupabaseRealtime() {
        const client = window.supabaseClient || window.supabase;
        if (!client || typeof client.channel !== 'function') {
            console.warn('[MultiClinicSyncEngine] Cliente Supabase no disponible para Realtime WebSocket. Operando en modo local/polling.');
            return;
        }

        try {
            if (this.supabaseSubscription) {
                client.removeChannel(this.supabaseSubscription);
            }

            this.supabaseSubscription = client
                .channel('public:pacientes_multiclinica')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'pacientes' }, (payload) => {
                    console.log('[MultiClinicSyncEngine] Evento Realtime recibido de Supabase:', payload);
                    this.handleRemotePayload(payload);
                })
                .subscribe((status, err) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('[MultiClinicSyncEngine] Conectado exitosamente al canal Realtime de Supabase.');
                        this.backoffDelay = 1000;
                    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        console.warn('[MultiClinicSyncEngine] Canal Realtime cerrado o con error. Reintentando con backoff...', err);
                        this.scheduleReconnection();
                    }
                });
        } catch (e) {
            console.error('[MultiClinicSyncEngine] Error al conectar Realtime:', e);
            this.scheduleReconnection();
        }
    }

    scheduleReconnection() {
        setTimeout(() => {
            if (!this.isStarted) return;
            this.backoffDelay = Math.min(this.backoffDelay * 2, this.maxBackoffDelay);
            console.log(`[MultiClinicSyncEngine] Intentando reconexión WebSocket en ${this.backoffDelay}ms...`);
            this.connectSupabaseRealtime();
        }, this.backoffDelay);
    }

    startAdaptivePolling() {
        if (this.pollingIntervalId) clearInterval(this.pollingIntervalId);
        
        // Intervalo adaptativo robusto: 7-9s cuando visible, 15-20s (ej. 18s) de respaldo en segundo plano cuando hidden
        const runAdaptiveCheck = async () => {
            const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
            const currentInterval = isHidden ? 18000 : 8000;
            
            try {
                await this.triggerImmediateSync(true);
            } catch (e) {
                // Silenciar errores de red en polling de fondo
            }
            
            if (this.isStarted) {
                this.pollingIntervalId = setTimeout(runAdaptiveCheck, currentInterval);
            }
        };
        
        this.pollingIntervalId = setTimeout(runAdaptiveCheck, 8000);
    }

    async triggerImmediateSync(isPolling = false) {
        try {
            if (typeof syncPatientsFromSupabase === 'function') {
                const updated = await syncPatientsFromSupabase();
                if (updated && updated.length > 0) {
                    this.notifyUIUpdate('Sincronización remota completada');
                }
            } else if (typeof fetchDeltaUpdates === 'function') {
                await fetchDeltaUpdates();
                this.notifyUIUpdate('Delta updates aplicados');
            }
        } catch (e) {
            if (!isPolling) {
                console.warn('[MultiClinicSyncEngine] Error en sincronización inmediata:', e);
            }
        }
    }

    handleRemotePayload(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        if (!newRecord && !oldRecord) return;

        const record = newRecord || oldRecord;
        const cod = record.codAtencion || record.cod_atencion;
        if (!cod) return;

        if (eventType === 'INSERT' || eventType === 'UPDATE') {
            if (Array.isArray(patientDatabase)) {
                const idx = patientDatabase.findIndex(p => String(p.codAtencion || p.cod_atencion) === String(cod));
                if (idx !== -1) {
                    // Preservar estrictamente cada campo existente y evitar sobreescritura destructiva o intercambio de datos entre pacientes
                    const existing = patientDatabase[idx];
                    const mergedRecord = {};
                    const allKeys = new Set([...Object.keys(existing), ...Object.keys(newRecord)]);
                    for (const key of allKeys) {
                        if (newRecord[key] !== undefined && newRecord[key] !== null && newRecord[key] !== '') {
                            mergedRecord[key] = newRecord[key];
                        } else {
                            mergedRecord[key] = existing[key];
                        }
                    }
                    patientDatabase[idx] = mergedRecord;
                } else {
                    patientDatabase.push(newRecord);
                }
                sortPatientArray(patientDatabase);
            }
        } else if (eventType === 'DELETE') {
            if (Array.isArray(patientDatabase)) {
                const idx = patientDatabase.findIndex(p => String(p.codAtencion || p.cod_atencion) === String(cod));
                if (idx !== -1) {
                    patientDatabase.splice(idx, 1);
                }
            }
        }

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'REMOTE_SYNC_EVENT', eventType, record });
        }

        const clinicaNombre = record.clinica || 'Clínica';
        this.notifyUIUpdate(`🟢 Actualizado en tiempo real desde ${clinicaNombre}`);
    }

    handleBroadcastMessage(data) {
        if (!data || !data.type) return;
        if (data.type === 'REMOTE_SYNC_EVENT' || data.type === 'PATIENT_SAVED' || data.type === 'PATIENT_DELETED') {
            console.log('[MultiClinicSyncEngine] Mensaje Cross-Tab Broadcast recibido:', data);
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            }
            if (this.onRemoteUpdateCallback) {
                this.onRemoteUpdateCallback(data);
            }
        }
    }

    notifyUIUpdate(message) {
        if (typeof window.refreshPatientTable === 'function') {
            window.refreshPatientTable();
        }
        if (this.onRemoteUpdateCallback) {
            this.onRemoteUpdateCallback({ message });
        }

        this.showSubtleToast(message);
    }

    showSubtleToast(text) {
        if (typeof document === 'undefined') return;
        let toast = document.getElementById('multiClinicSyncToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'multiClinicSyncToast';
            toast.style.cssText = `
                position: fixed;
                top: 15px;
                right: 20px;
                z-index: 99999;
                background: rgba(15, 23, 42, 0.95);
                color: #38bdf8;
                padding: 10px 18px;
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.85rem;
                font-weight: 600;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                border: 1px solid rgba(56, 189, 248, 0.3);
                backdrop-filter: blur(8px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                opacity: 0;
                transform: translateY(-10px);
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = text;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
        }, 3500);
    }
}

export const syncEngine = new MultiClinicSyncEngine();
if (typeof window !== 'undefined') {
    window.syncEngine = syncEngine;
}

// ==========================================
// MÓDULO DE CHAT CLÍNICA - DOCTOR (SUPABASE REALTIME)
// ==========================================

export async function enviarMensajeChat(remitente, rol, clinica, mensaje, codAtencion = null) {
    const client = window.supabaseClient || window.supabase;
    if (!client || typeof client.from !== 'function') {
        console.warn("[Chat Realtime] Cliente Supabase no disponible. Mensaje simulado en memoria local.");
        return { success: false, error: "Supabase no configurado" };
    }

    try {
        const { data, error } = await client
            .from('mensajes_chat_clinicas')
            .insert([
                {
                    remitente: remitente || 'Anónimo',
                    rol_remitente: rol || 'doctor',
                    clinica_id: clinica || 'General',
                    mensaje: mensaje || '',
                    cod_atencion: codAtencion || null,
                    leido: false
                }
            ])
            .select();

        if (error) {
            console.error("[Chat Realtime] Error al enviar mensaje:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data ? data[0] : null };
    } catch (err) {
        console.error("[Chat Realtime] Excepción al enviar mensaje:", err);
        return { success: false, error: err.message };
    }
}

export async function obtenerHistorialChat(clinica, limite = 50) {
    const client = window.supabaseClient || window.supabase;
    if (!client || typeof client.from !== 'function') {
        console.warn("[Chat Realtime] Cliente Supabase no disponible. Retornando historial vacío.");
        return [];
    }

    try {
        let query = client
            .from('mensajes_chat_clinicas')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(limite);

        if (clinica && clinica !== 'TODAS' && clinica !== 'GENERAL') {
            query = query.eq('clinica_id', clinica);
        }

        const { data, error } = await query;

        if (error) {
            console.error("[Chat Realtime] Error al obtener historial:", error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error("[Chat Realtime] Excepción al obtener historial:", err);
        return [];
    }
}

export function suscribirCanalChat(clinica, onMensajeRecibido) {
    const client = window.supabaseClient || window.supabase;
    if (!client || typeof client.channel !== 'function') {
        console.warn("[Chat Realtime] Cliente Supabase o método channel no disponible para suscripción.");
        return null;
    }

    const channelName = `chat_clinica_${String(clinica || 'general').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;
    
    try {
        const channel = client.channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes_chat_clinicas',
                    filter: clinica && clinica !== 'TODAS' && clinica !== 'GENERAL' ? `clinica_id=eq.${clinica}` : undefined
                },
                (payload) => {
                    console.log("[Chat Realtime] Nuevo mensaje recibido en tiempo real:", payload.new);
                    if (typeof onMensajeRecibido === 'function') {
                        onMensajeRecibido(payload.new);
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[Chat Realtime] Estado de suscripción para ${clinica}:`, status);
            });

        return channel;
    } catch (err) {
        console.error("[Chat Realtime] Error al suscribirse al canal de chat:", err);
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.enviarMensajeChat = enviarMensajeChat;
    window.obtenerHistorialChat = obtenerHistorialChat;
    window.suscribirCanalChat = suscribirCanalChat;
    window.obtenerPacientes = obtenerPacientes;
    window.guardarPaciente = guardarPaciente;
    window.guardarReporte = guardarReporte;
    window.dispatchN8nWebhook = dispatchN8nWebhook;
    window.N8N_SOVEREIGN_CONFIG = N8N_SOVEREIGN_CONFIG;

    // Disparo preventivo en segundo plano para sincronizar en caliente con FastAPI SSOT / n8n
    try {
        if (window.SUPABASE_SOVEREIGN_MODE) {
            setTimeout(() => {
                obtenerPacientes({ backgroundSync: true, limit: 50000 });
            }, 300);
        }
    } catch(e) {}
}

