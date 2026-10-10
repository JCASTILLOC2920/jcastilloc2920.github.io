// utils.js - Módulo Centralizado de Utilidades Purificadas y Sanitizadores (JC PATH LAB)

export const cleanCodeFunc = (str) => String(str || '').trim().toLowerCase().replace(/[-_\s]/g, '');

export function formatDisplayDate(dateStr) {
    if (!dateStr) return '---';
    if (dateStr instanceof Date) {
        const dd = String(dateStr.getDate()).padStart(2, '0');
        const mm = String(dateStr.getMonth() + 1).padStart(2, '0');
        const yyyy = dateStr.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    const str = String(dateStr).trim();
    if (str.includes('/')) return str;
    const parts = str.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
}

// Expresiones regulares pre-compiladas estáticamente fuera de bucles (Máxima eficiencia CPU)
const REGEX_HTML_NBSP = /&nbsp;/gi;
const REGEX_HTML_AMP = /&amp;/gi;
const REGEX_HTML_SPANS = /<\/?span[^>]*>/gi;
const REGEX_PAPA_NICOLAS = /\bpap[áa]\s*nicol[áa]s\b/gi;
const REGEX_PAPA_NICO_VARIANTS = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;

export function correctPapanicolaouSpelling(text) {
    if (!text) return '';
    
    let result = String(text).replace(REGEX_HTML_NBSP, ' ').replace(REGEX_HTML_AMP, '&');
    result = result.replace(REGEX_HTML_SPANS, '');
    
    result = result.replace(REGEX_PAPA_NICOLAS, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match[0] === match[0].toUpperCase()) return "Papanicolaou";
        return "papanicolaou";
    });
    
    result = result.replace(REGEX_PAPA_NICO_VARIANTS, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match === match.toLowerCase()) return "papanicolaou";
        return "Papanicolaou";
    });
    
    return result;
}

export function cleanTextContentLocal(text) {
    if (!text) return '';
    let result = String(text);
    result = result.replace(/[{}]/g, '');
    result = result.replace(/\b\d{6,}\b/g, '');
    result = result.replace(/\b([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+\1\b/gi, '$1');
    result = correctPapanicolaouSpelling(result);
    return result;
}

export function formatDoctorName(name) {
    if (!name) return "";
    let clean = String(name).toUpperCase().trim();
    clean = clean.replace(/\bDR\s*,/gi, "DR.");
    clean = clean.replace(/\bDRA\s*,/gi, "DRA.");
    clean = clean.replace(/\bDR\s+(?!\.)/gi, "DR. ");
    clean = clean.replace(/\bDRA\s+(?!\.)/gi, "DRA. ");
    clean = clean.replace(/\bDR\s*\.\s*\./gi, "DR.");
    clean = clean.replace(/\bDRA\s*\.\s*\./gi, "DRA.");
    clean = clean.replace(/\s+/g, " ");
    return clean;
}

export function toTitleCase(str) {
    if (!str) return '';
    const minorWords = ['de', 'del', 'la', 'las', 'los', 'y', 'o', 'en'];
    return String(str).toLowerCase().split(/\s+/).map((word, idx) => {
        if (minorWords.includes(word) && idx > 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function sanitizeDateForPg(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const str = dateStr.trim();
    if (!str || str === '---' || str === '-') return null;
    
    // Si ya viene como YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
    }
    // Si viene como DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (dmyMatch) {
        return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }
    return null;
}

export function normalizeSexo(val, especimen = '', nombres = '') {
    const esp = String(especimen || '').toUpperCase();
    
    // 1. Heurística anatómica ABSOLUTA (va PRIMERO - inviolable biológicamente)
    if (esp.includes('ENDOMETR') || esp.includes('UTER') || esp.includes('ÚTER') || esp.includes('CERVIX') || esp.includes('CÉRVIZ') || esp.includes('CUELLO') || esp.includes('OVARIO') || esp.includes('MAMA') || esp.includes('PAP') || esp.includes('PAPANICOLAOU') || esp.includes('VAGIN') || esp.includes('VULV') || esp.includes('PLACENT') || esp.includes('GESTAC') || esp.includes('LEGRADO') || esp.includes('SALPING') || esp.includes('TROFOBLAST')) {
        return 'FEMENINO';
    }
    if (esp.includes('PROSTAT') || esp.includes('PRÓSTAT') || esp.includes('TESTICUL') || esp.includes('TESTÍC') || esp.includes('PENE') || esp.includes('ESCROT') || esp.includes('SEMINAL') || esp.includes('ORQUID') || esp.includes('CIRCUNCIS')) {
        return 'MASCULINO';
    }

    // 2. Valor explícito válido ingresado por el usuario
    const raw = String(val || '').trim().toUpperCase();
    if (raw === 'F' || raw === 'FEMENINO' || raw === 'FEM' || raw.startsWith('FEM')) return 'FEMENINO';
    if (raw === 'M' || raw === 'MASCULINO' || raw === 'MASC' || raw.startsWith('MASC')) return 'MASCULINO';
    
    // 3. Heurística por nombre
    const nom = String(nombres || '').toUpperCase();
    const femaleNames = ['RAIZA', 'BRIGGITTE', 'MARIA', 'MARÍA', 'ROSA', 'ANA', 'CARMEN', 'NELLI', 'NELLY', 'LUCIA', 'LUCÍA', 'PATRICIA', 'GLORIA', 'ELIZABETH', 'CLAUDIA', 'SANDRA', 'VIVIANA', 'MIRTHA', 'MERY', 'MARY', 'ELEANA', 'CYNTHIA', 'NATALY', 'NATALIA', 'JUANA', 'SILVIA', 'BEATRIZ', 'MONICA', 'MÓNICA', 'LAURA', 'GABRIELA', 'YOLANDA', 'TERESA', 'JULIA', 'ESTHER', 'ISABEL', 'ROCIO', 'ROCÍO', 'PILAR', 'ANDREA', 'PAOLA', 'VANESSA', 'KAREN', 'JESSICA', 'FIORELLA', 'STEPHANIE', 'MILAGROS', 'LILIANA', 'KARINA', 'ANGELICA', 'ANGÉLICA', 'EVELYN', 'CECILIA', 'SONIA', 'SUSANA', 'DIANA', 'WENDY', 'LUCERO', 'MARYLUZ', 'PRUDENCIA', 'DAISY', 'EUGENIA', 'MARUJA', 'JUDITH', 'CELESTE', 'ZULEMA', 'SOPHIA', 'YESENIA', 'FLOR', 'CONSUELO', 'HILDA', 'ELVA', 'NORA', 'FATIMA', 'FÁTIMA', 'GRACIELA', 'ALICIA', 'DELIA', 'ELSA', 'AMPARO', 'ROSARIO', 'SOLEDAD', 'VIRGINIA', 'CATALINA', 'EMILIA', 'ESPERANZA', 'LORENA', 'NADIA', 'VALERIA', 'CAMILA', 'SOFIA', 'SOFÍA', 'FERNANDA', 'ALEJANDRA', 'DANIELA', 'MARIANA', 'VERONICA', 'VERÓNICA'];
    const maleNames = ['CARLOS', 'JOSE', 'JUAN', 'LUIS', 'MIGUEL', 'PEDRO', 'MANUEL', 'FRANCISCO', 'ANTONIO', 'JAVIER', 'ANDRES', 'ANDRÉS', 'JORGE', 'ROBERTO', 'MARIO', 'RAFAEL', 'FERNANDO', 'ENRIQUE', 'PABLO', 'RICARDO', 'ALEJANDRO', 'VICTOR', 'VÍCTOR', 'HUGO', 'OSCAR', 'ÓSCAR', 'GUSTAVO', 'RODRIGO', 'IVAN', 'IVÁN', 'FELIX', 'FÉLIX', 'SERGIO', 'ANGEL', 'ÁNGEL', 'ALBERTO', 'ALAN', 'EDGAR', 'CHRISTIAN', 'BRYAN', 'KEVIN', 'JHON', 'JOHN', 'ABEL', 'MARCOS', 'DAVID', 'DANIEL', 'GABRIEL', 'SANTIAGO', 'SEBASTIAN', 'SEBASTIÁN', 'NICOLAS', 'NICOLÁS', 'MARTIN', 'MARTÍN', 'RAMIRO', 'FREDDY', 'FREDY', 'GILBERTO', 'GONZALO', 'ERNESTO', 'ALFREDO', 'ARMANDO', 'ARTURO', 'AUGUSTO', 'BENJAMIN', 'CESAR', 'CÉSAR', 'CLAUDIO', 'DIEGO', 'DOMINGO', 'EDUARDO', 'EMILIO', 'ESTEBAN', 'EUGENIO', 'FABIAN', 'FABIÁN', 'GERARDO', 'GERMAN', 'GERMÁN', 'GIOVANNI', 'HENRY', 'HERBERT', 'JULIO', 'MARLON', 'MAURICIO', 'MAX', 'NILTON', 'NOE', 'NOÉ', 'ORLANDO', 'OSWALDO', 'PATRICIO', 'PAUL', 'RAUL', 'RAÚL', 'RENATO', 'RICHARD', 'ROLANDO', 'ROMAN', 'ROMÁN', 'RUBEN', 'RUBÉN', 'SAMUEL', 'SAUL', 'SAÚL', 'TEODORO', 'TOMAS', 'TOMÁS', 'WALTER', 'WILLIAM', 'WILMER'];
    const parts = nom.split(/[\s,]+/);
    for (const p of parts) {
        if (p && femaleNames.includes(p)) return 'FEMENINO';
        if (p && maleNames.includes(p)) return 'MASCULINO';
    }

    if (raw === 'O' || raw === 'OTRO') return 'OTRO';
    return '';
}

// GARANTÍA DE RETROCOMPATIBILIDAD ABSOLUTA EN WINDOW
if (typeof window !== 'undefined') {
    window.cleanCodeFunc = cleanCodeFunc;
    window.formatDisplayDate = formatDisplayDate;
    window.correctPapanicolaouSpelling = correctPapanicolaouSpelling;
    window.cleanTextContentLocal = cleanTextContentLocal;
    window.formatDoctorName = formatDoctorName;
    window.toTitleCase = toTitleCase;
    window.escapeHtml = escapeHtml;
    window.sanitizeDateForPg = sanitizeDateForPg;
    window.normalizeSexo = normalizeSexo;
}
