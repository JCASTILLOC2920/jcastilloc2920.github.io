// sovereign_integrity_guard.js
// ============================================================================
// JC PATH LAB - PROTOCOLO DE INMUTABILIDAD Y BLINDAJE MATEMÁTICO ANTI-REGRESIÓN
// Director General y Patólogo Principal: Dr. José Castillo
// Directiva Suprema: 100% Offline Soberano • Cero Alucinaciones • Cero Pérdida de Datos
// Fundamento Matemático: Retículo de Información Monótona (Information Lattice Monotonicity)
// ============================================================================

/**
 * 1. Safe Deep Clone: Previene mutaciones no intencionadas por referencia en memoria.
 */
export function safeDeepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(obj);
        } catch (e) {
            // Fallback ante funciones o tipos no soportados por structuredClone
        }
    }
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        if (Array.isArray(obj)) return obj.map(item => safeDeepClone(item));
        const copy = {};
        for (const key of Object.keys(obj)) {
            copy[key] = safeDeepClone(obj[key]);
        }
        return copy;
    }
}

/**
 * 2. Deterministic Hash Checksum (FNV-1a 32-bit):
 * Calcula un checksum invariante sobre el objeto con claves ordenadas canónicamente.
 */
export function computePatientChecksum(patient) {
    if (!patient || typeof patient !== 'object') return '00000000';
    
    // Extraer campos clínicos significativos (excluyendo fotos base64 pesadas y llaves internas)
    const keys = Object.keys(patient)
        .filter(k => !k.startsWith('_') && k !== 'solicitudInforme' && k !== 'img01' && k !== 'img02')
        .sort();
    
    let str = '';
    for (const k of keys) {
        const val = patient[k];
        if (val !== undefined && val !== null) {
            str += `${k}:${typeof val === 'string' ? val.trim() : val}|`;
        }
    }
    
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * 3. Validador de Veracidad de Campos Clínicos (Lattice Monotonicity Validator)
 * Determina si un valor tiene contenido informativo positivo (no es bottom \bot).
 */
export function hasInformationalValue(val) {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed === '' || trimmed === '---' || trimmed === '--') {
            return false;
        }
        const lower = trimmed.toLowerCase();
        if (lower === 'sin clinica definida' || lower === 'sin clinica' || lower === 'sin clínica') {
            return false;
        }
        // Considerar vacío HTML como <p><br></p> o <div><br></div>
        const textOnly = trimmed.replace(/<[^>]*>/g, '').trim();
        if (textOnly === '' || textOnly === '---' || textOnly === '--') {
            return false;
        }
        return true;
    }
    if (typeof val === 'number') return !isNaN(val);
    if (typeof val === 'boolean') return true;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
}

/**
 * 4. Operador de Fusión Monótona Segura ⊕ (Safe Monotonic Merge Operator):
 * (p_local ⊕ p_incoming)(k):
 * Si incoming[k] tiene información válida, se adopta incoming[k].
 * Si incoming[k] está vacío/nulo/--- y local[k] tenía información válida, SE PRESERVA local[k].
 * Protege contra sobreescritura accidental de diagnósticos, macro, micro, médico, dni, etc.
 */
export function safeMonotonicMerge(local, incoming, options = {}) {
    if (!local) return incoming ? safeDeepClone(incoming) : null;
    if (!incoming) return safeDeepClone(local);

    const merged = safeDeepClone(local);
    const forceWipe = options.forceWipe === true;

    for (const [key, incVal] of Object.entries(incoming)) {
        // Omitir llaves de caché de ordenamiento para re-calcularlas después
        if (key.startsWith('_sort') || key.startsWith('_search')) continue;

        const locVal = local[key];

        if (forceWipe) {
            merged[key] = incVal;
            continue;
        }

        // Si el valor entrante tiene información válida:
        if (hasInformationalValue(incVal)) {
            // Protección de diagnósticos clínicos ya consolidados:
            // Si el texto local es un informe completo y el entrante es apenas un fragmento truncado,
            // proteger la versión más completa a menos que se fuerce explícitamente.
            if (['macroDesc', 'microDesc', 'diagnostico'].includes(key)) {
                const locLen = typeof locVal === 'string' ? locVal.replace(/<[^>]*>/g, '').trim().length : 0;
                const incLen = typeof incVal === 'string' ? incVal.replace(/<[^>]*>/g, '').trim().length : 0;
                if (locLen > 30 && incLen < 5 && !options.allowTruncate) {
                    console.warn(`[INTEGRITY GUARD] Rechazada degradación de '${key}' (${locLen} chars vs ${incLen} chars) para ${local.codAtencion || ''}`);
                    merged[key] = locVal;
                    continue;
                }
            }
            merged[key] = incVal;
        } else {
            // El entrante es nulo, vacío o "---"
            // Si el local tiene información, PRESERVAR local intacto
            if (hasInformationalValue(locVal)) {
                merged[key] = locVal;
            } else {
                merged[key] = incVal ?? locVal ?? '';
            }
        }
    }

    // Sincronizar identificador canónico si existe en cualquiera de los dos
    merged.codAtencion = (merged.codAtencion || merged.cod_atencion || local.codAtencion || local.cod_atencion || '').trim();

    // Incrementar versión y registrar timestamp y checksum
    merged._v = (parseInt(local._v || '0', 10) + 1);
    merged._ts = Date.now();
    merged._checksum = computePatientChecksum(merged);

    return merged;
}

/**
 * 5. Proxy de Invariantes en Tiempo de Ejecución (Protected Patient Proxy):
 * Intercepta asignaciones y borrados accidentales de campos críticos en memoria.
 */
export function createProtectedPatientProxy(targetPatient) {
    if (!targetPatient || typeof targetPatient !== 'object') return targetPatient;
    
    const PROTECTED_CORE_FIELDS = new Set([
        'codAtencion', 'cod_atencion', 'paciente', 'nombres', 'apellidos',
        'dni', 'edad', 'sexo', 'medSolicitante', 'doctor', 'clinica',
        'especimen', 'diagnostico', 'macroDesc', 'microDesc'
    ]);

    return new Proxy(targetPatient, {
        set(target, prop, value, receiver) {
            if (PROTECTED_CORE_FIELDS.has(prop)) {
                const currentVal = target[prop];
                // Si el campo ya tiene contenido informativo y se intenta degradar a vacío:
                if (hasInformationalValue(currentVal) && !hasInformationalValue(value)) {
                    console.warn(`[SECURITY PROXY] Bloqueada degradación destructiva en '${String(prop)}': Se intentó sobreescribir valor válido '${currentVal}' con '${value}'. Preservando integridad.`);
                    return true; // No arrojar error para no romper flujos externos, pero preservar el valor
                }
            }
            return Reflect.set(target, prop, value, receiver);
        },
        deleteProperty(target, prop) {
            if (PROTECTED_CORE_FIELDS.has(prop)) {
                console.warn(`[SECURITY PROXY] Bloqueada eliminación de campo protegido '${String(prop)}'.`);
                return true; // Éxito reportado para no reventar caller en strict mode, pero el valor se conserva
            }
            return Reflect.deleteProperty(target, prop);
        }
    });
}

/**
 * 6. Validador de Esquema en Tiempo de Ejecución (Runtime Schema Validator):
 * Verifica la validez estructural y clínica de un objeto paciente.
 */
export function validatePatientSchema(patient) {
    const report = {
        valid: true,
        errors: [],
        warnings: [],
        checksum: null
    };

    if (!patient || typeof patient !== 'object') {
        report.valid = false;
        report.errors.push("El objeto paciente es nulo o no es un objeto.");
        return report;
    }

    const code = String(patient.codAtencion || patient.cod_atencion || '').trim();
    if (!code) {
        report.valid = false;
        report.errors.push("Falta el código de atención ('codAtencion').");
    }

    // Validar formato de código (ej. 26Q-123, 26C-010, etc.)
    if (code && !/^\d{2}[A-Za-z]+-\d+$/i.test(code) && !/^\d+$/i.test(code)) {
        report.warnings.push(`Formato de código inusual: ${code}`);
    }

    report.checksum = computePatientChecksum(patient);
    return report;
}

if (typeof window !== 'undefined') {
    window.SovereignIntegrityGuard = {
        safeDeepClone,
        computePatientChecksum,
        hasInformationalValue,
        safeMonotonicMerge,
        createProtectedPatientProxy,
        validatePatientSchema
    };
}
