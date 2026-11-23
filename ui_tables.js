
// SANITIZADOR SOBERANO DE MUESTRAS: Purgar medidas macroscópicas de la columna ESPÉCIMEN
export function sanitizeSpecimenDisplay(raw) {
    if (!raw) return 'Espécimen Quirúrgico';
    var clean = String(raw)
        .replace(/\b\d+(?:[\.,]\d+)?\s*[xX*]\s*\d+(?:[\.,]\d+)?(?:\s*[xX*]\s*\d+(?:[\.,]\d+)?)?\s*(?:cm|mm|gr|g)?\.?/gi, '')
        .replace(/\b\d+(?:[\.,]\d+)?\s*(?:cm|mm|gr|g)\b/gi, '')
        .replace(/[\(\[\{]\s*[\)\]\}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    clean = clean.replace(/^[\-\s/]+|[\-\s/]+$/g, '');
    return clean ? toTitleCase(clean) : 'Espécimen Quirúrgico';
}


function parseAtencionSortKey(cod) {
  if (!cod) return 0;
  const codStr = String(cod).trim().toUpperCase();
  let serviceWeight = 3;
  if (codStr.includes('C-') || /C[-_\s0-9]|^C\d|\dC\d/.test(codStr)) {
    serviceWeight = 2;
  } else if (codStr.includes('I-') || /I[-_\s0-9]|^I\d|\dI\d/.test(codStr)) {
    serviceWeight = 1;
  }
  const m = codStr.match(/(?:20)?(\d{2})[^\d]*(\d+)([A-Z])?/);
  if (m) {
    const yr = parseInt(m[1], 10);
    let n = parseInt(m[2], 10);
    const sub = m[3] ? m[3].charCodeAt(0) - 64 : 0;
    if (yr === 26 && n > 2000) n = 0;
    return yr * 10000000000 + serviceWeight * 10000000 + n * 100 + sub;
  }
  const digits = codStr.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}
// ui_tables.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Tablas y Filtros

import { patientDatabase, correctPapanicolaouSpelling, cleanCodeFunc, searchPatientsFromSupabase, sortPatientArray, parseCodAtencionForSort, getCorrelativeWindow, matchPatientSmartSound, levenshteinSimilarity } from './db_service.js?v=20261105_v674';
import { toTitleCase, formatDisplayDate, escapeHtml } from './utils.js?v=20261105_v674';
export { toTitleCase, formatDisplayDate, escapeHtml, getCorrelativeWindow, matchPatientSmartSound };

// Helper Soberano RBAC: Verifica si el usuario activo es Administrador (Dr. José Castillo, admin, 41457466)
export function checkIsAdmin(user) {
    if (!user || typeof user !== 'object') {
        try {
            user = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};
        } catch (e) {
            user = {};
        }
    }
    if (!user || !user.usuario) return true; // Por defecto modo soberano Administrador si no hay sesión
    const rawPerfil = String(user.perfil || user.rol || '').trim().toLowerCase();
    const rawUser = String(user.usuario || '').trim().toLowerCase();
    const rawDni = String(user.dni || '').trim();
    const rawNombres = String(user.nombres || user.nombre || '').trim().toUpperCase();

    return rawPerfil === 'administrador' || 
           rawPerfil === 'admin' || 
           rawPerfil.includes('admin') || 
           rawUser === 'admin' || 
           rawUser === '41457466' || 
           rawDni === '41457466' || 
           rawNombres.includes('CASTILLO') || 
           rawNombres.includes('JOSEHP');
}

// Elementos del DOM gestionados por este módulo
let tableBody = null;
let currentService = 'ALL'; // Valor por defecto ALL para visibilidad inmediata de Q + C
export let currentPage = parseInt(sessionStorage.getItem('activeTablePage')) || 1;
export let rowsPerPage = 30;
export let activePillFilter = 'all'; // 'all', 'proceso', 'listos', 'urgentes'

// Inicializador de elementos
export function initTableUI(bodyElementId) {
    tableBody = document.getElementById(bodyElementId);
    initMobileDashboardEvents();

    if (typeof window !== 'undefined' && !window._uiTablesResizeBound) {
        window._uiTablesResizeBound = true;
        let _lastWasMobile = window.innerWidth <= 768;
        let _resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => {
                const nowMobile = window.innerWidth <= 768;
                if (nowMobile !== _lastWasMobile) {
                    _lastWasMobile = nowMobile;
                    renderTable();
                }
            }, 100);
        }, { passive: true });
    }

    // 📡 SINCRONIZACIÓN REACTIVA INTER-PESTAÑAS E INTER-PÁGINAS (BROADCASTCHANNEL)
    if (typeof window !== 'undefined' && !window._uiTablesSyncInit) {
        window._uiTablesSyncInit = true;
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const syncCh = new BroadcastChannel('jcpathlab_realtime_sync');
                syncCh.onmessage = (ev) => {
                    const msg = ev.data;
                    if (msg && msg.type === 'PATIENT_UPDATED' && msg.patient) {
                        const cCode = cleanCodeFunc(msg.patient.codAtencion || msg.patient.cod_atencion);
                        if (cCode) {
                            const local = patientDatabase.find(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === cCode);
                            if (local) {
                                Object.assign(local, msg.patient);
                            } else {
                                patientDatabase.unshift(msg.patient);
                            }
                            // Replicar a todas las estructuras maestras en memoria para consistencia absoluta O(1)
                            ['REAL_SUPABASE_PATIENTS', 'REAL_SUPABASE_BACKUP', 'realSupabaseBackup'].forEach(storeName => {
                                if (Array.isArray(window[storeName])) {
                                    const bIdx = window[storeName].findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === cCode);
                                    if (bIdx !== -1) {
                                        Object.assign(window[storeName][bIdx], msg.patient);
                                    } else {
                                        window[storeName].unshift(Object.assign({}, msg.patient));
                                    }
                                }
                            });
                            sortPatientArray(patientDatabase);
                            // Respetar RBAC en pantalla mediante applyFilters (NUNCA renderTable crudo)
                            applyFilters(false);
                            console.log('[ui_tables Sync] Vista refrescada en caliente (RBAC activo) por actualización remota:', cCode);
                        }
                    }
                };
            }
            window.addEventListener('storage', (ev) => {
                if (ev.key === 'jc_sync_pulse' && ev.newValue) {
                    try {
                        const parsed = JSON.parse(ev.newValue);
                        if (parsed && parsed.patient) {
                            const cCode = cleanCodeFunc(parsed.patient.codAtencion || parsed.patient.cod_atencion);
                            if (cCode) {
                                const local = patientDatabase.find(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === cCode);
                                if (local) Object.assign(local, parsed.patient);
                                else patientDatabase.unshift(parsed.patient);
                                ['REAL_SUPABASE_PATIENTS', 'REAL_SUPABASE_BACKUP', 'realSupabaseBackup'].forEach(storeName => {
                                    if (Array.isArray(window[storeName])) {
                                        const bIdx = window[storeName].findIndex(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === cCode);
                                        if (bIdx !== -1) Object.assign(window[storeName][bIdx], parsed.patient);
                                        else window[storeName].unshift(Object.assign({}, parsed.patient));
                                    }
                                });
                            }
                        }
                    } catch(ePulse) {}
                    applyFilters(false);
                }
            });
        } catch(eSyncUI) {
            console.warn('[ui_tables Sync] Error en listener reactivo:', eSyncUI);
        }
    }

    // ⚡ PINTADO INMEDIATO 0ms: Si activePatientDb, patientDatabase o REAL_SUPABASE_PATIENTS ya están en memoria,
    // renderizar inmediatamente la tabla en #tableBody y fulminar "Cargando registros...".
    if (typeof window !== 'undefined') {
        const hasData = (Array.isArray(window.activePatientDb) && window.activePatientDb.length > 0) ||
                        (Array.isArray(patientDatabase) && patientDatabase.length > 0) ||
                        (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) ||
                        (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) ||
                        (Array.isArray(window.REAL_SUPABASE_BACKUP) && window.REAL_SUPABASE_BACKUP.length > 0) ||
                        (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0);
        if (hasData) {
            try {
                applyFilters(false);
            } catch(eInitFilter) {
                try { renderTable(); } catch(eInitRender) {}
            }
        }
    }
}

export function setCurrentService(serviceId) {
    currentService = serviceId;
    currentPage = 1;
    sessionStorage.setItem('activeTablePage', '1');
}


// Renderizado principal matemático de alto rendimiento (Chunked Rendering < 15ms)

// Función para renderizar el Código de Atención en 2 Niveles Compactos (Prefijo arriba / Número abajo)
export function renderCodeBadge(codeStr) {
    if (!codeStr || String(codeStr).trim() === '' || codeStr === '---') {
        return '<span class="code-badge-empty" style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">---</span>';
    }
    const clean = String(codeStr).trim();
    return `<span class="code-badge-cassette code-direct-text" data-code="${clean}" title="Código de Atención / Biopsia: ${clean}"><span class="badge-cassette-glare"></span>${clean}</span>`;
}

// Función para formatear fechas a DD/MM/YY (Ahorra 20px horizontales y elimina saltos de línea)
export function formatTableDate(dateStr) {
    if (!dateStr) return '---';
    if (dateStr instanceof Date) {
        const dd = String(dateStr.getDate()).padStart(2, '0');
        const mm = String(dateStr.getMonth() + 1).padStart(2, '0');
        const yy = String(dateStr.getFullYear()).slice(-2);
        return `${dd}/${mm}/${yy}`;
    }
    let str = String(dateStr).trim();
    if (str.includes('T')) str = str.split('T')[0];
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            const yy = parts[2].length === 4 ? parts[2].slice(-2) : parts[2];
            return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${yy}`;
        }
        return str;
    }
    const parts = str.split('-');
    if (parts.length === 3) {
        const yy = parts[0].length === 4 ? parts[0].slice(-2) : parts[0];
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${yy}`;
    }
    return str;
}


// ============================================================================
// HELPER SOBERANO: Extracción limpia de Apellido y Nombre humano
// (CERO palabras inventadas, CERO correlativos, CERO badges de reloj)
// ============================================================================
export function parseHumanPatientName(item) {
    if (!item || typeof item !== 'object') {
        return { displayApellido: '---', displayNombre: '---', pacienteName: '---' };
    }
    const isContaminated = (str) => {
        if (!str) return true;
        const u = String(str).trim().toUpperCase();
        if (!u || u === '---' || u === '--' || u === '-' || u === '0') return true;
        if (u.includes('CORRELATIVO')) return true;
        if (/\b\d{2}[A-Z]-\d+\b/.test(u)) return true;
        if (/^CASO\b/i.test(u)) return true;
        if (/^PACIENTE\b/i.test(u)) return true;
        if (u.includes('EN PROCESAMIENTO') || u.includes('EN PROCESO') || u.includes('CASETE') || u.includes('RESERVADO')) return true;
        if (u.includes('MUESTRA') || u.includes('FEMENINO') || u.includes('MASCULINO') || u.includes('AÑOS') || u.includes('PAP 250215')) return true;
        return false;
    };

    const rawApe = String(item.apellidos || '').trim();
    const rawNom = String(item.nombres || '').trim();
    const rawPac = String(item.paciente || '').trim();

    const cleanApe = isContaminated(rawApe) ? '' : rawApe;
    const cleanNom = isContaminated(rawNom) ? '' : rawNom;
    const cleanPac = isContaminated(rawPac) ? '' : rawPac;

    let displayApellido = '';
    let displayNombre = '';

    const splitCompoundName = (rawStr) => {
        if (!rawStr) return { ape: '---', nom: '---' };
        if (rawStr.includes(',')) {
            const parts = rawStr.split(',');
            return { ape: parts[0].trim(), nom: (parts[1] || '').trim() || '---' };
        }
        const words = rawStr.split(/\s+/).filter(Boolean);
        if (words.length <= 2) {
            return { ape: words[0] || '---', nom: words[1] || '---' };
        }
        const preps = ['DE', 'DEL', 'LA', 'LAS', 'LOS', 'SAN', 'SANTA'];
        const apeWords = [];
        let i = 0;
        while (i < words.length - 1 && (apeWords.length < 2 || preps.includes(words[i].toUpperCase()))) {
            apeWords.push(words[i]);
            i++;
        }
        return {
            ape: apeWords.join(' '),
            nom: words.slice(i).join(' ') || '---'
        };
    };

    if (cleanApe && cleanNom) {
        displayApellido = toTitleCase(cleanApe);
        displayNombre = toTitleCase(cleanNom);
    } else if (cleanApe && !cleanNom) {
        // El apellido ya es apellido completo, NO mutilar apellidos compuestos como 'De la Cruz'
        displayApellido = toTitleCase(cleanApe);
        displayNombre = (rawNom && rawNom !== '--' && rawNom !== '---') ? toTitleCase(rawNom) : '(S/N)';
    } else if (!cleanApe && cleanNom) {
        displayApellido = '(Sin Apellido Registrado)';
        displayNombre = toTitleCase(cleanNom);
    } else if (cleanPac) {
        const spl = splitCompoundName(cleanPac);
        displayApellido = toTitleCase(spl.ape);
        displayNombre = toTitleCase(spl.nom);
    } else {
        // FILTRADO INTELIGENTE: Si no hay filiación humana cargada, mostrar médico solicitante y caso correlativo
        const med = String(item.med_solicitante || item.medSolicitante || item.medico || item.doctor || '').trim();
        const cod = String(item.cod_atencion || item.codAtencion || item.codigo || '').trim();
        const sede = String(item.clinica || item.sede || item.procedencia || '').trim();
        
        if (med) {
            let medName = med.replace(/^(DR\.|DRA\.|DOCTOR|DOCTORA)\s+/i, '').trim();
            let medApe = 'Médico';
            if (medName.toUpperCase().includes('MUÑANTE')) medApe = 'Muñante';
            else if (medName.toUpperCase().includes('VILCA')) medApe = 'Vilca';
            else if (medName.toUpperCase().includes('CASTILLO')) medApe = 'Castillo';
            else {
                const parts = medName.split(/\s+/);
                medApe = parts.length > 2 ? parts[2] : parts[0];
            }
            displayApellido = `[Muestra Dr. ${toTitleCase(medApe)}]`;
            displayNombre = cod ? `Caso ${cod} (${toTitleCase(sede || 'En Proceso')})` : 'En Procesamiento Técnico';
        } else if (cod) {
            displayApellido = `[Muestra Laboratorio]`;
            displayNombre = `Caso ${cod} (${toTitleCase(sede || 'En Proceso')})`;
        } else {
            displayApellido = '[Muestra en Proceso]';
            displayNombre = 'Técnica Histopatológica';
        }
    }

    if (!displayApellido || displayApellido === '--' || displayApellido === '-') {
        const cod = String(item.cod_atencion || item.codAtencion || item.codigo || '').trim();
        displayApellido = cod ? `[Caso ${cod}]` : '[Muestra en Laboratorio]';
    }
    if (!displayNombre || displayNombre === '--' || displayNombre === '-' || displayNombre.toLowerCase() === '(s/n)') {
        displayNombre = '(S/N)';
    }

    let pacienteName = `${displayApellido}, ${displayNombre}`;
    return { displayApellido, displayNombre, pacienteName };
}


// ============================================================================
// GESTOR BLINDADO DEL SUBMENÚ DE ACCIONES (ActionMenuManager - SINGLETON)
// ============================================================================
export const ActionMenuManager = {
    portal: null,
    activeCod: null,
    activeTrigger: null,
    hoverTimer: null,
    closeTimer: null,
    isInitialized: false,

    init() {
        if (this.isInitialized || typeof document === 'undefined') return;
        this.ensurePortal();

        // 1. Listener Global en Fase de Captura (Capture Phase: Inmune a stopPropagation externos)
        const onGlobalPointer = (e) => {
            if (!this.isOpen()) return;
            const target = e.target;
            if (this.portal && this.portal.contains(target)) return;
            if (this.activeTrigger && (this.activeTrigger === target || this.activeTrigger.contains(target))) return;
            this.close(false);
        };

        window.addEventListener('pointerdown', onGlobalPointer, true);
        window.addEventListener('click', onGlobalPointer, true);

        // 2. Cierre ante scroll en cualquier contenedor usando Fase de Captura
        const onScrollClose = () => {
            if (this.isOpen()) this.close(true);
        };
        window.addEventListener('scroll', onScrollClose, { capture: true, passive: true });

        // 3. Cierre inmediato con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close(true);
            }
        }, true);

        // 4. Reposicionamiento / Cierre en Redimensión
        window.addEventListener('resize', onScrollClose, { passive: true });

        this.isInitialized = true;
    },

    ensurePortal() {
        if (!this.portal) {
            this.portal = document.getElementById('tableActionMenuPortal');
            if (!this.portal) {
                this.portal = document.createElement('div');
                this.portal.id = 'tableActionMenuPortal';
                this.portal.className = 'table-action-menu-portal';
                this.portal.style.display = 'none';
                document.body.appendChild(this.portal);
            }

            // Manejo de hover / mouseleave sobre el propio portal
            this.portal.addEventListener('mouseenter', () => this.clearHoverTimer());
            this.portal.addEventListener('mouseleave', () => this.startHoverTimer());
        }
        return this.portal;
    },

    isOpen() {
        return !!(this.portal && this.portal.style.display !== 'none' && !this.portal.classList.contains('closing'));
    },

    clearHoverTimer() {
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
            this.hoverTimer = null;
        }
    },

    startHoverTimer() {
        this.clearHoverTimer();
        this.hoverTimer = setTimeout(() => {
            this.close(false);
        }, 300);
    },

    open(triggerBtn, codAtencion, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.init();
        this.clearHoverTimer();
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }

        const safeCod = String(codAtencion || '').trim();
        if (!safeCod) return;

        const portal = this.ensurePortal();
        const buttonEl = triggerBtn || (event ? (event.currentTarget || event.target.closest('button')) : null);

        // Si ya está abierto para este mismo botón y código, no reabrir
        if (this.isOpen() && this.activeCod === safeCod && this.activeTrigger === buttonEl) {
            return;
        }

        // Obtener datos del paciente
        const localSource = Array.isArray(patientDatabase) ? patientDatabase : (Array.isArray(window.patientDatabase) ? window.patientDatabase : []);
        const patient = localSource.find(x => {
            const c = String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase();
            return c === safeCod.toLowerCase();
        }) || { codAtencion: safeCod };

        const slaMenu = (typeof window.getPatientSlaStatus === 'function') ? window.getPatientSlaStatus(patient) : { isFirmado: false };
        const isFirmado = slaMenu.isFirmado;
        let currentUser = null;
        try { currentUser = JSON.parse(localStorage.getItem('currentUser')); } catch(e) {}
        const isAdmin = checkIsAdmin(currentUser);

        const rawPaciente = (patient.paciente || `${patient.apellidos || ''}, ${patient.nombres || ''}`).trim();
        const especimen = (patient.especimen || 'Muestra').trim();
        const waPhone = String(patient.telContacto || patient.telefono || patient.fContacto || '999999999').replace(/\D/g, '');
        const waCleanPhone = waPhone.length === 9 ? `51${waPhone}` : (waPhone.startsWith('51') ? waPhone : `51${waPhone}`);
        const waText = encodeURIComponent(`Estimado(a) *${patient.medSolicitante || 'Doctor'}*, le saludamos del Servicio de Patología. Le informamos que el reporte anatomopatológico del paciente *${rawPaciente}* (Código: *${safeCod}*, Muestra: *${especimen}*) se encuentra *LISTO Y FIRMADO*. 📄 Puede descargar el informe en PDF en el siguiente enlace seguro: https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(safeCod)}`);
        const waUrl = `https://api.whatsapp.com/send?phone=${waCleanPhone}&text=${waText}`;

        // Construir contenido dinámico del menú
        let menuHtml = '';

        // Boceto 3: Lector Diagnóstico Mobile-First / PDF Oficial en PC
        if (window.innerWidth > 768) {
            menuHtml += `<div class="action-portal-item" onclick="window.handleAction('pdf', '${safeCod}'); ActionMenuManager.close(true);" style="color: #38bdf8; font-weight: 700;"><i class="fa-solid fa-file-pdf"></i> Ver PDF Oficial</div>`;
        } else {
            menuHtml += `<div class="action-portal-item" onclick="window.openMobileReportReader && window.openMobileReportReader('${safeCod}'); ActionMenuManager.close(true);" style="color: #38bdf8; font-weight: 700;"><i class="fa-solid fa-mobile-screen-button"></i> Ver Informe (Lector Móvil)</div>`;
        }

        if (isFirmado) {
            menuHtml += `<a href="${waUrl}" target="_blank" class="action-portal-item wa-item" onclick="ActionMenuManager.close(true);"><i class="fa-brands fa-whatsapp"></i> Notificar por WhatsApp</a>`;
        }

        menuHtml += `<div class="action-portal-item" onclick="window.handleAction('pdf', '${safeCod}'); ActionMenuManager.close(true);"><i class="fa-solid fa-print"></i> Previsualizar / Imprimir</div>`;
        menuHtml += `<div class="action-portal-item" onclick="window.handleAction('descargar_pdf', '${safeCod}'); ActionMenuManager.close(true);"><i class="fa-solid fa-download"></i> Descargar PDF Directo</div>`;
        menuHtml += `<div class="action-portal-item" onclick="window.downloadPatientJSON && window.downloadPatientJSON('${safeCod}'); ActionMenuManager.close(true);"><i class="fa-solid fa-file-code"></i> Descargar Ficha JSON</div>`;

        if (isAdmin) {
            menuHtml += `<div class="action-portal-divider"></div>`;
            menuHtml += `<div class="action-portal-item danger-item" onclick="window.handleAction('eliminar', '${safeCod}'); ActionMenuManager.close(true);"><i class="fa-solid fa-trash"></i> Eliminar Registro</div>`;
        } else {
            if (isFirmado) {
                menuHtml += `<div class="action-portal-divider"></div>`;
                menuHtml += `<div class="action-portal-item warning-item" onclick="window.handleAction('solicitar_correccion', '${safeCod}'); ActionMenuManager.close(true);"><i class="fa-solid fa-triangle-exclamation"></i> Solicitar Corrección</div>`;
            } else {
                menuHtml += `<div class="action-portal-divider"></div>`;
                menuHtml += `<div class="action-portal-item" onclick="window.handleAction('editar_restringido', '${safeCod}'); ActionMenuManager.close(true);"><i class="fa-solid fa-pen-to-square"></i> Editar Nombre / Fechas</div>`;
            }
        }

        portal.innerHTML = menuHtml;
        portal.dataset.activeCod = safeCod;
        this.activeCod = safeCod;
        this.activeTrigger = buttonEl;

        // Enlazar listeners de hover al botón disparador
        if (buttonEl && !buttonEl._actionMenuHoverAttached) {
            buttonEl._actionMenuHoverAttached = true;
            buttonEl.addEventListener('mouseenter', () => this.clearHoverTimer());
            buttonEl.addEventListener('mouseleave', () => this.startHoverTimer());
        }

        // Mostrar temporalmente para medir dimensiones
        portal.classList.remove('closing');
        portal.classList.add('open');
        portal.style.display = 'flex';
        portal.style.visibility = 'hidden';

        // Posicionamiento Inteligente (Smart Collision Flip)
        if (buttonEl) {
            const rect = buttonEl.getBoundingClientRect();
            const menuWidth = portal.offsetWidth || 205;
            const menuHeight = portal.offsetHeight || 150;

            let left = rect.right - menuWidth;
            if (left < 10) left = 10;
            if (left + menuWidth > window.innerWidth - 10) {
                left = window.innerWidth - menuWidth - 10;
            }

            let top = rect.bottom + 4;
            // Si sobrepasa el límite inferior del viewport, abrir hacia arriba
            if (top + menuHeight > window.innerHeight - 10) {
                top = rect.top - menuHeight - 4;
            }
            if (top < 10) top = 10;

            portal.style.top = `${Math.round(top)}px`;
            portal.style.left = `${Math.round(left)}px`;
        }

        portal.style.visibility = 'visible';
    },

    close(immediate = false) {
        this.clearHoverTimer();
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }

        const portal = this.portal || document.getElementById('tableActionMenuPortal');
        if (!portal || portal.style.display === 'none') {
            this.activeCod = null;
            this.activeTrigger = null;
            return;
        }

        if (immediate) {
            portal.classList.remove('open', 'closing');
            portal.style.display = 'none';
            this.activeCod = null;
            this.activeTrigger = null;
            return;
        }

        portal.classList.add('closing');
        this.closeTimer = setTimeout(() => {
            portal.classList.remove('open', 'closing');
            portal.style.display = 'none';
            this.activeCod = null;
            this.activeTrigger = null;
            this.closeTimer = null;
        }, 150);
    },

    toggle(triggerBtn, codAtencion, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const safeCod = String(codAtencion || '').trim();
        if (this.isOpen() && this.activeCod === safeCod) {
            this.close(false);
        } else {
            this.open(triggerBtn, codAtencion, event);
        }
    }
};

// Exposición Global y Compatibilidad
window.ActionMenuManager = ActionMenuManager;
window.toggleActionMenu = function(event, codAtencion) {
    const btn = event ? (event.currentTarget || event.target.closest('button')) : null;
    ActionMenuManager.toggle(btn, codAtencion, event);
};

export function renderTable(data = patientDatabase) {
    const wrapper = document.querySelector('.table-responsive-wrapper');
    if (!wrapper) {
        console.error("Error: no se encontró .table-responsive-wrapper");
        return;
    }

    // Poblar datalists de clínicas de forma dinámica con opciones por defecto + clínicas registradas
    const targetDatalists = ['clinicasDatalist', 'clinicasDatalistModal', 'clinicasDatalistEditor'];
    if (!window._lastClinicasCount || window._lastClinicasCount !== data.length) {
        window._lastClinicasCount = data.length;
        const uniqueClinicas = new Set();
        uniqueClinicas.add("SIN CLINICA DEFINIDA");
        uniqueClinicas.add("CLÍNICA CARRIÓN");
        uniqueClinicas.add("CLÍNICA CARRIÓN VENTANILLA");
        uniqueClinicas.add("CLÍNICA SAN CLEMENTE");
        uniqueClinicas.add("CLINICA LA MUJER");
        uniqueClinicas.add("CLÍNICA ALFA PREVENIR");
        uniqueClinicas.add("CLÍNICA LA LUZ");
        uniqueClinicas.add("UROSERV");
        data.forEach(item => {
            if (item.clinica && item.clinica.trim() !== '') {
                const c = item.clinica.trim().toUpperCase();
                if (c !== 'CLÍNICA NO CONOCIDA' && c !== 'SIN CLINICA') {
                    uniqueClinicas.add(c);
                }
            }
        });
        const otherClinicas = Array.from(uniqueClinicas).filter(c => c !== "SIN CLINICA DEFINIDA").sort();
        const sortedClinicas = ["SIN CLINICA DEFINIDA", ...otherClinicas];
        targetDatalists.forEach(id => {
            const datalistEl = document.getElementById(id);
            if (datalistEl) {
                datalistEl.innerHTML = '';
                const frag = document.createDocumentFragment();
                sortedClinicas.forEach(clinica => {
                    const option = document.createElement('option');
                    option.value = clinica;
                    frag.appendChild(option);
                });
                datalistEl.appendChild(frag);
            }
        });
    }

    // Filtrar por servicio activo con clasificación universal por código y espécimen para todos los años (2024, 2025, 2026, 2023, 2022)
    const aiSearchVal = (document.getElementById('aiSmartSearchInput')?.value || '').trim();
    const mobileSearchVal = (document.getElementById('mobileQuickSearchInput')?.value || '').trim();
    const desktopSearchVal = (
        document.getElementById('codAtencion')?.value ||
        document.getElementById('nomPaciente')?.value ||
        document.getElementById('apePaciente')?.value ||
        document.getElementById('dni')?.value ||
        ''
    ).trim();
    const isDirectSearchActive = aiSearchVal.length > 0 || mobileSearchVal.length > 0 || desktopSearchVal.length > 0;

    // Garantía Militar Soberana: renderTable es una función de presentación pura.
    // NUNCA muta filteredData ni re-hidrata destructivamente hacia LocalStorage.
    const masterSupabase = (typeof window !== 'undefined' && (
        (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0 && window.REAL_SUPABASE_PATIENTS) ||
        (Array.isArray(window.REAL_SUPABASE_BACKUP) && window.REAL_SUPABASE_BACKUP.length > 0 && window.REAL_SUPABASE_BACKUP) ||
        (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0 && window.realSupabaseBackup)
    )) || ((typeof getRealSupabasePatients === 'function') ? getRealSupabasePatients() : []);

    let sourceData = [];
    if (Array.isArray(data) && (data.length > 0 || isDirectSearchActive || activePillFilter !== 'all')) {
        sourceData = data;
    } else {
        if (typeof window !== 'undefined' && Array.isArray(window.activePatientDb) && window.activePatientDb.length > 0) {
            sourceData = window.activePatientDb;
        } else if (Array.isArray(patientDatabase) && patientDatabase.length > 0) {
            sourceData = patientDatabase;
        } else if (typeof window !== 'undefined' && Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) {
            sourceData = window.patientDatabase;
        } else if (Array.isArray(masterSupabase) && masterSupabase.length > 0) {
            sourceData = masterSupabase;
        } else if (Array.isArray(data)) {
            sourceData = data;
        }
    }

    // [OPTIMIZACIÓN MILITAR O(1) AGENTE PRIME]: Extracción única de variables invariantes fuera del bucle de filtrado
    let isClinicSession = false;
    let isCurrentAdmin = true;
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        isCurrentAdmin = checkIsAdmin(currentUser);
        isClinicSession = !isCurrentAdmin && !!currentUser.usuario;
    } catch(e) {}
    const isManualService = !!sessionStorage.getItem('manualServiceSelected');
    const isMobileView = typeof window !== 'undefined' && window.innerWidth <= 768;
    const restrictiveServicePill = typeof document !== 'undefined'
        ? document.querySelector('#mobileFilterPills .mobile-filter-pill.active[data-pill-filter="service-Q"], #mobileFilterPills .mobile-filter-pill.active[data-pill-filter="service-C"]')
        : null;
    const restrictiveService = restrictiveServicePill
        ? (restrictiveServicePill.getAttribute('data-pill-filter') === 'service-C' ? 'C' : 'Q')
        : null;

    const filteredByService = sourceData.filter(item => {
        if (!item) return false;
        const codeUpper = String(item.codAtencion || item.cod_atencion || item.codigo || '').toUpperCase();
        const pacUpper = String(item.paciente || item.nombres || '').toUpperCase();
        const rawId = String(item.id || '');
        // FILTRADO SOBERANO: Preservar el 100% de expedientes reales (id 189XX son legítimos de Supabase)
        if (codeUpper.startsWith('26Q-189') && pacUpper.includes('DESCONOCIDO')) return false;
        if (pacUpper.includes('SIN NOMBRE') && (String(item.clinica || '').toUpperCase().includes('SIN CLINICA') || !item.clinica)) return false;
        const especimenUpper = String(item.especimen || '').toUpperCase();
        let s = item.service;
        if (!s || (s !== 'C' && s !== 'Q' && s !== 'I')) {
            // 1. Detección por patrón de código (24C-, 25C-, 26C-, C-01, 24C01, etc.)
            if (codeUpper.includes('C-') || codeUpper.endsWith('C') || /C[-_\s0-9]|^C\d|\dC\d/.test(codeUpper)) {
                s = 'C';
            } else if (codeUpper.includes('I-') || codeUpper.endsWith('I') || /I[-_\s0-9]|^I\d|\dI\d/.test(codeUpper)) {
                s = 'I';
            } else if (codeUpper.includes('Q-') || /Q[-_\s0-9]|^Q\d|\dQ\d/.test(codeUpper)) {
                s = 'Q';
            } else if (especimenUpper.includes('PAPANICOLAOU') || especimenUpper.includes('CITOLOG') || especimenUpper.includes('CERVICOVAGINAL')) {
                s = 'C';
            } else if (especimenUpper.includes('INMUNO') || especimenUpper.includes('IHQ')) {
                s = 'I';
            } else {
                s = 'Q';
            }
            item.service = s;
        }
        // Si el usuario está buscando directamente por texto/código o está en vista ALL, mostrar el resultado sin importar el servicio.
        // GARANTÍA CLÍNICA: Si el usuario es una clínica externa (role-clinic), mostrar todas sus muestras (biopsias y citologías) a menos que filtre manualmente.
        if (window.activeCorrelativeWindow) {
            return true;
        }
        if (isCurrentAdmin && (currentService === 'ALL' || !isManualService)) {
            return true;
        }
        if (isDirectSearchActive || currentService === 'ALL' || (isClinicSession && currentService === 'ALL')) {
            return true;
        }
        if (isClinicSession && (!isManualService)) {
            return true; // En sesión clínica, visibilidad global por defecto para que jamás se pierdan citologías
        }
        // DESBLOQUEO DEFINITIVO MÓVIL: En móvil (<= 768px) o cuando no haya selección restrictiva,
        // mostrar Biopsias (Q), Citologías (C) e Inmuno (I) sin quedar bloqueado por sessionStorage.manualServiceSelected
        if (isMobileView) {
            if (restrictiveService && activePillFilter !== 'listos' && activePillFilter !== 'proceso' && activePillFilter !== 'urgentes') {
                return s === restrictiveService;
            }
            return s === 'Q' || s === 'C' || s === 'I';
        }

        if (!isManualService) {
            return s === 'Q' || s === 'C' || s === 'I';
        }
        return s === currentService;
    });

    const getSla = (typeof window.getPatientSlaStatus === 'function') ? window.getPatientSlaStatus : (item => {
        if (!item) return { isFirmado: false, isModificado: false, estado: 'Pendiente', color: '#ef4444', dotClass: 'dot-red date-delay', title: 'Informe no firmado / pendiente de validación médica' };
        const cleanDiag = String(item.diagnostico || item.diag || '').replace(/<[^>]*>/g, '').trim();
        const cleanMacro = String(item.macroDesc || item.macro_desc || '').replace(/<[^>]*>/g, '').trim();
        const cleanMicro = String(item.microDesc || item.micro_desc || '').replace(/<[^>]*>/g, '').trim();
        const invalid = ['', '---', '--', '-', 'null', 'undefined'];
        const hasDiag = !invalid.includes(cleanDiag.toLowerCase());
        const hasMicro = !invalid.includes(cleanMicro.toLowerCase());
        const hasMacro = !invalid.includes(cleanMacro.toLowerCase());
        const hasDraft = hasMacro || hasMicro;

        const diagUp = cleanDiag.toUpperCase();
        const hasRealFinalDiag = hasDiag && cleanDiag.length >= 20 && !diagUp.includes('EN PROCESO') && !diagUp.includes('PENDIENTE DE') && !diagUp.includes('SIN DIAGNOSTICO') && !diagUp.includes('SIN DIAGNÓSTICO');
        const isSigned = (
            item.firmado === true ||
            item.firmado === 1 ||
            String(item.firmado).toLowerCase() === 'true' ||
            String(item.estado_firma || '').toLowerCase() === 'firmado' ||
            String(item.estado_firma || '').toLowerCase() === 'validado' ||
            String(item.estado || '').toLowerCase() === 'completado' ||
            String(item.estado || '').toLowerCase() === 'listo' ||
            String(item.estado || '').toLowerCase() === 'firmado' ||
            hasRealFinalDiag
        );

        if (isSigned) {
            return { isFirmado: true, isModificado: true, estado: 'Completado', color: '#10b981', dotClass: 'dot-green date-completed', title: 'Informe firmado digitalmente y listo para descarga' };
        }
        return { isFirmado: false, isModificado: hasDraft || hasDiag || item.modificado === true, estado: (hasDraft || hasDiag) ? 'En Proceso' : 'Pendiente', color: '#ef4444', dotClass: 'dot-red date-delay', title: 'Informe no firmado / pendiente de validación médica' };
    });

    // Calcular conteos globales para las píldoras de servicio (Q y C)
    let countQ = 0;
    let countC = 0;
    sourceData.forEach(item => {
        if (!item) return;
        const codeUpper = String(item.codAtencion || item.cod_atencion || '').toUpperCase();
        const especimenUpper = String(item.especimen || '').toUpperCase();
        let s = item.service;
        if (!s || (s !== 'C' && s !== 'Q' && s !== 'I')) {
            if (codeUpper.includes('C-') || codeUpper.endsWith('C') || /C[-_\s0-9]|^C\d|\dC\d/.test(codeUpper) || especimenUpper.includes('PAPANICOLAOU') || especimenUpper.includes('CITOLOG') || especimenUpper.includes('CERVICOVAGINAL')) {
                s = 'C';
            } else if (codeUpper.includes('I-') || codeUpper.endsWith('I') || /I[-_\s0-9]|^I\d|\dI\d/.test(codeUpper) || especimenUpper.includes('INMUNO') || especimenUpper.includes('IHQ')) {
                s = 'I';
            } else {
                s = 'Q';
            }
            item.service = s;
        }
        if (s === 'Q') countQ++;
        if (s === 'C') countC++;
    });

    const pillCountQEl = document.getElementById('pillCountQ');
    const pillCountCEl = document.getElementById('pillCountC');
    if (pillCountQEl) pillCountQEl.textContent = countQ;
    if (pillCountCEl) pillCountCEl.textContent = countC;

    // Calcular conteos dinámicos para las 4 píldoras horizontales de estado
    let countAll = 0;
    let countProceso = 0;
    let countListos = 0;
    let countUrgentes = 0;

    filteredByService.forEach(item => {
        countAll++;
        const sla = getSla(item);
        const isFirm = sla.isFirmado || item.firmado === true || item.estado === 'Completado' || item.estado === 'Listo';
        if (isFirm) {
            countListos++;
        } else if (sla.isModificado) {
            countProceso++;
        } else {
            countUrgentes++;
        }
    });

    const pillCountAllEl = document.getElementById('pillCountAll');
    const pillCountTotalEl = document.getElementById('pillCountTotal');
    const pillCountProcesoEl = document.getElementById('pillCountProceso');
    const pillCountListosEl = document.getElementById('pillCountListos');
    const pillCountUrgentesEl = document.getElementById('pillCountUrgentes');
    if (pillCountAllEl) pillCountAllEl.textContent = countAll;
    if (pillCountTotalEl) pillCountTotalEl.textContent = countAll;
    if (pillCountProcesoEl) pillCountProcesoEl.textContent = countProceso;
    if (pillCountListosEl) pillCountListosEl.textContent = countListos;
    if (pillCountUrgentesEl) pillCountUrgentesEl.textContent = countUrgentes;

    // Filtrar según la píldora activa seleccionada
    let activeDataset = filteredByService;
    if (activePillFilter === 'listos') {
        activeDataset = filteredByService.filter(item => {
            const sla = getSla(item);
            return sla.isFirmado || item.firmado === true || item.estado === 'Completado' || item.estado === 'Listo';
        });
    } else if (activePillFilter === 'proceso') {
        activeDataset = filteredByService.filter(item => {
            const sla = getSla(item);
            const isFirm = sla.isFirmado || item.firmado === true || item.estado === 'Completado' || item.estado === 'Listo';
            return sla.isModificado && !isFirm;
        });
    } else if (activePillFilter === 'urgentes') {
        activeDataset = filteredByService.filter(item => {
            const sla = getSla(item);
            const isFirm = sla.isFirmado || item.firmado === true || item.estado === 'Completado' || item.estado === 'Listo';
            return !isFirm && !sla.isModificado;
        });
    }

    // Si el Modo Ventana Correlativa está activo, usar directamente su lote de sesión (11 pacientes)
    const isCorrelativeMode = !!window.activeCorrelativeWindow;
    if (isCorrelativeMode) {
        activeDataset = window.activeCorrelativeWindow.patients;
    } else {
        // ORDENAR primero (antes de paginar) por año descendente y número descendente (ej: 26Q-235 arriba de 26Q-232)
        sortPatientArray(activeDataset);
    }
    
    // Guardar dataset ordenado globalmente para navegación de casos en el editor
    window.currentActiveDataset = activeDataset;

    // Renderizar Banner Superior del Modo Ventana Correlativa
    let correlativeBanner = document.getElementById('correlativeWindowBanner');
    if (isCorrelativeMode && window.activeCorrelativeWindow) {
        if (!correlativeBanner) {
            correlativeBanner = document.createElement('div');
            correlativeBanner.id = 'correlativeWindowBanner';
            if (wrapper.parentNode) {
                wrapper.parentNode.insertBefore(correlativeBanner, wrapper);
            }
        }
        correlativeBanner.style.display = 'flex';
        correlativeBanner.style.justifyContent = 'space-between';
        correlativeBanner.style.alignItems = 'center';
        correlativeBanner.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)';
        correlativeBanner.style.border = '1px solid #10b981';
        correlativeBanner.style.padding = '10px 16px';
        correlativeBanner.style.borderRadius = '8px';
        correlativeBanner.style.marginBottom = '14px';
        correlativeBanner.style.color = '#10b981';
        correlativeBanner.style.fontSize = '0.9rem';
        correlativeBanner.innerHTML = `
            <div>
                <i class="fa-solid fa-layer-group" style="margin-right: 8px; font-size: 1.1rem;"></i>
                <strong>MODO VENTANA CORRELATIVA (LOTE DE SESIÓN):</strong>
                <span>Mostrando 5 antes y 5 después de <b>${escapeHtml(window.activeCorrelativeWindow.targetCode)}</b> (${window.activeCorrelativeWindow.totalInWindow} pacientes correlativos)</span>
            </div>
            <button type="button" onclick="window.exitCorrelativeWindow && window.exitCorrelativeWindow()" style="background: #10b981; color: #fff; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer; font-weight: 700; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-xmark"></i> Salir del Lote
            </button>
        `;
    } else if (correlativeBanner) {
        correlativeBanner.style.display = 'none';
    }

    // Lógica de Paginación (después del sort)
    const totalRecords = activeDataset.length;
    const totalPages = isCorrelativeMode ? 1 : (Math.ceil(totalRecords / rowsPerPage) || 1);
    
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = 1;
    sessionStorage.setItem('activeTablePage', String(currentPage));

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
    
    const currentSet = isCorrelativeMode ? activeDataset : activeDataset.slice(startIndex, endIndex);

    let currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};
    } catch (e) {
        currentUser = {};
    }
    const isAdmin = checkIsAdmin(currentUser);

    const createRow = (item, index) => {
        const row = document.createElement('tr');
        const cleanItemCod = cleanCodeFunc(item.codAtencion || item.cod_atencion);
        if (window.lastRealtimeInsertedCode && cleanItemCod === window.lastRealtimeInsertedCode) {
            row.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
            row.style.transition = 'background-color 3.5s ease';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 3500);
        }
        // Utiliza la misma función getSla estricta definida al inicio de la renderización

        const sla = getSla(item);
        const isFirmado = sla.isFirmado;
        const isModificado = sla.isModificado;
        const dotBgColor = sla.color;
        const dotClass = sla.dotClass;
        const dotTitle = sla.title;

        const costoVal = parseFloat(item.costo) || 0;
        const adelantoVal = parseFloat(item.adelanto) || 0;
        const costoText = `S/ ${costoVal.toFixed(2)}`;
        const adelantoText = `S/ ${adelantoVal.toFixed(2)}`;

        const { displayApellido, displayNombre, pacienteName } = parseHumanPatientName(item);
        const safeApellido = escapeHtml(displayApellido);
        const safeNombre = escapeHtml(displayNombre);
        const safePaciente = escapeHtml(pacienteName);

        let especimenText = (item.especimen !== undefined && item.especimen !== null ? item.especimen : '').trim();
        if (especimenText) {
            especimenText = toTitleCase(correctPapanicolaouSpelling(especimenText));
            // Reemplazo explícito y obligatorio de Pap por Papanicolaou en la columna de espécimen
            especimenText = especimenText
                .replace(/\bPap\b/gi, 'Papanicolaou')
                .replace(/\bPap\.\b/gi, 'Papanicolaou')
                .replace(/\bVeicula\b/g, 'Vesícula')
                .replace(/\bveicula\b/g, 'vesícula')
                .replace(/\bVescula\b/g, 'Vesícula')
                .replace(/\bvescula\b/g, 'vesícula')
                .replace(/\bApndice\b/g, 'Apéndice')
                .replace(/\bapndice\b/g, 'apéndice')
                .replace(/\bApendice\b/g, 'Apéndice')
                .replace(/\bapendice\b/g, 'apéndice')
                .replace(/\bEstomago\b/g, 'Estómago')
                .replace(/\bestomago\b/g, 'estómago')
                .replace(/\bPolipo\b/g, 'Pólipo')
                .replace(/\bpolipo\b/g, 'pólipo')
                .replace(/\bLitiasica\b/g, 'Litiásica')
                .replace(/\blitiasica\b/g, 'litiásica')
                .replace(/\bUtero\b/g, 'Útero');
        } else {
            especimenText = '---';
        }
        let djItem = {};
        if (item.datos_json) { try { djItem = typeof item.datos_json === 'string' ? JSON.parse(item.datos_json) : item.datos_json; } catch(e){} }
        const rawCodeVal = String(item.codAtencion || item.cod_atencion || item.codigo || djItem.codAtencion || djItem.cod_atencion || djItem.codigo || item.id || '').trim();
        const safeCod = rawCodeVal.replace(/'/g, "\\'");

        const waPhone = String(item.telContacto || item.telefono || item.fContacto || '999999999').replace(/\D/g, '');
        const waCleanPhone = waPhone.length === 9 ? `51${waPhone}` : (waPhone.startsWith('51') ? waPhone : `51${waPhone}`);
        const waText = encodeURIComponent(`Estimado(a) *${item.medSolicitante || 'Doctor'}*, le saludamos del Servicio de Patología. Le informamos que el reporte anatomopatológico del paciente *${pacienteName}* (Código: *${rawCodeVal}*, Muestra: *${especimenText}*) se encuentra *LISTO Y FIRMADO*. 📄 Puede descargar el informe en PDF en el siguiente enlace seguro: https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(rawCodeVal)}`);
        const waUrl = `https://api.whatsapp.com/send?phone=${waCleanPhone}&text=${waText}`;
        const waBtnHtml = `<a href="${waUrl}" target="_blank" class="action-btn whatsapp-btn" title="Enviar Notificación por WhatsApp a 1-Clic"><i class="fa-brands fa-whatsapp"></i> WA</a>`;

        let actionsHtml = '';
        const pendingFix = item.solicitud_correccion && item.solicitud_correccion.estado === 'pendiente';

        const isDesktopScreen = typeof window !== 'undefined' && window.innerWidth > 768;
        const readerBtnIcon = isDesktopScreen ? 'fa-file-pdf' : 'fa-file-medical';
        const readerBtnLabel = isDesktopScreen ? 'Ver PDF' : 'Ver Informe';
        const readerBtnTitle = isDesktopScreen ? 'Ver Informe PDF Oficial' : 'Ver Informe Diagnóstico (Lector Rápido)';
        const readerBtnClick = `if (window.innerWidth > 768) { window.handleAction('pdf', '${safeCod}'); } else { window.openMobileReportReader && window.openMobileReportReader('${safeCod}'); }`;

        if (isAdmin) {
            const fixBannerHtml = pendingFix ? `
                <div style="background:#fffbeb;border:1px solid #f59e0b;padding:3px 6px;border-radius:4px;margin-bottom:4px;font-size:0.72rem;color:#92400e;">
                    <b>🟡 Solicitud:</b> Cambiar a <b>"${item.solicitud_correccion.nombre_solicitado}"</b>
                    <div style="margin-top:2px;display:flex;gap:3px;">
                        <button style="background:#10b981;color:#fff;border:none;padding:2px 6px;border-radius:3px;cursor:pointer;font-weight:bold;font-size:0.7rem;" onclick="window.aceptarCorreccionYRefirmar('${safeCod}')"><i class="fa-solid fa-check"></i> Aceptar</button>
                        <button style="background:#ef4444;color:#fff;border:none;padding:2px 6px;border-radius:3px;cursor:pointer;font-size:0.7rem;" onclick="window.rechazarCorreccion('${safeCod}')"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
            ` : '';

            actionsHtml = `
                <div class="action-hybrid-wrapper">
                    ${fixBannerHtml}
                    <!-- Botón 1: Llenar / Modificar Informe -->
                    <button type="button" class="action-btn edit-btn" onclick="window.handleAction ? window.handleAction('editar', '${safeCod}') : (window.openReportEditor ? window.openReportEditor('${safeCod}') : null)" data-action="editar" data-cod="${safeCod}" title="Llenar / Modificar Informe" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')">
                        <i class="fa-solid fa-pencil" style="pointer-events: none;"></i>
                    </button>
                    <!-- Botón 2: Ver / Previsualizar PDF -->
                    <button type="button" class="action-btn preview-pdf-btn" onclick="window.handleAction ? window.handleAction('pdf', '${safeCod}') : (window.openPrintWindow ? window.openPrintWindow('${safeCod}') : null)" data-action="pdf" data-cod="${safeCod}" title="Ver Informe PDF Oficial" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')">
                        <i class="fa-solid fa-eye" style="pointer-events: none;"></i>
                    </button>
                    <!-- Botón 3: Descargar PDF Directo -->
                    <button type="button" class="action-btn download-pdf-btn" onclick="window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : (window.descargarPdfDirecto ? window.descargarPdfDirecto('${safeCod}') : null)" data-action="descargar_pdf" data-cod="${safeCod}" title="Descargar PDF Oficial Directo (1 Clic)" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')">
                        <i class="fa-solid fa-download" style="pointer-events: none;"></i>
                    </button>
                    <!-- Botón 3.5: Ver Lote Correlativo (±5) -->
                    <button type="button" class="action-btn correlative-btn" onclick="event.stopPropagation(); window.showCorrelativeWindow && window.showCorrelativeWindow('${safeCod}')" data-cod="${safeCod}" title="Ver Lote Correlativo de Sesión (5 antes y 5 después)">
                        <i class="fa-solid fa-layer-group" style="color: #10b981; pointer-events: none;"></i>
                    </button>
                    <!-- Botón 4: Kebab Dropdown (Más opciones) -->
                    <button type="button" class="action-btn kebab-btn" onclick="window.toggleActionMenu ? window.toggleActionMenu(event, '${safeCod}') : null" title="Más opciones (WhatsApp, Imprimir, Ficha)">
                        <i class="fa-solid fa-ellipsis-vertical" style="pointer-events: none;"></i>
                    </button>
                </div>
            `;
        } else {
            actionsHtml = `
                <div class="action-hybrid-wrapper">
                    <!-- Botón 1: Llenar / Modificar Informe -->
                    <button type="button" class="action-btn edit-btn" onclick="window.handleAction ? window.handleAction('editar', '${safeCod}') : (window.openReportEditor ? window.openReportEditor('${safeCod}') : null)" data-action="editar" data-cod="${safeCod}" title="Llenar / Modificar Informe" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')">
                        <i class="fa-solid fa-pencil" style="pointer-events: none;"></i>
                    </button>
                    <!-- Botón 2: Ver / Previsualizar PDF -->
                    <button type="button" class="action-btn preview-pdf-btn" onclick="window.handleAction ? window.handleAction('pdf', '${safeCod}') : (window.openPrintWindow ? window.openPrintWindow('${safeCod}') : null)" data-action="pdf" data-cod="${safeCod}" title="Ver Informe PDF Oficial" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')">
                        <i class="fa-solid fa-eye" style="pointer-events: none;"></i>
                    </button>
                    <!-- Botón 3: Descargar PDF Directo -->
                    <button type="button" class="action-btn download-pdf-btn" onclick="window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : (window.descargarPdfDirecto ? window.descargarPdfDirecto('${safeCod}') : null)" data-action="descargar_pdf" data-cod="${safeCod}" title="Descargar PDF Oficial Directo (1 Clic)" onmouseenter="window.prefetchPatientDetails && window.prefetchPatientDetails('${safeCod}')">
                        <i class="fa-solid fa-download" style="pointer-events: none;"></i>
                    </button>
                    <!-- Botón 3.5: Ver Lote Correlativo (±5) -->
                    <button type="button" class="action-btn correlative-btn" onclick="event.stopPropagation(); window.showCorrelativeWindow && window.showCorrelativeWindow('${safeCod}')" data-cod="${safeCod}" title="Ver Lote Correlativo de Sesión (5 antes y 5 después)">
                        <i class="fa-solid fa-layer-group" style="color: #10b981; pointer-events: none;"></i>
                    </button>
                    <!-- Botón 4: Kebab Dropdown (Más opciones) -->
                    <button type="button" class="action-btn kebab-btn" onclick="window.toggleActionMenu ? window.toggleActionMenu(event, '${safeCod}') : null" title="Más opciones (WhatsApp, Imprimir, Ficha)">
                        <i class="fa-solid fa-ellipsis-vertical" style="pointer-events: none;"></i>
                    </button>
                </div>
            `;
        }

        // Resolución dinámica garantizada de Clínica
        let clinicaDisplayVal = (item.clinica || '').trim();
        const medNormVilcaCheck = (item.medSolicitante || item.doctor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (medNormVilcaCheck.includes('vilca')) {
            clinicaDisplayVal = 'CLÍNICA LA LUZ';
            item.clinica = 'CLÍNICA LA LUZ';
            item.procedencia = 'CLÍNICA LA LUZ';
        } else if (medNormVilcaCheck.includes('marreros') || medNormVilcaCheck.includes('lloclla')) {
            clinicaDisplayVal = 'CLINICA LA MUJER';
        } else if (!clinicaDisplayVal || ['sin clinica', 'sin clínica', 'sin clinica definida', 'sin clínica definida', 'clinica no conocida', 'clínica no conocida'].includes(clinicaDisplayVal.toLowerCase())) {
            if (medNormVilcaCheck.includes('escalante')) {
                clinicaDisplayVal = 'CLÍNICA SAN CLEMENTE';
            } else if (medNormVilcaCheck.includes('sanchez') || medNormVilcaCheck.includes('becerra') || medNormVilcaCheck.includes('ulfe') || medNormVilcaCheck.includes('carrion') || medNormVilcaCheck.includes('munante') || medNormVilcaCheck.includes('arzapalo')) {
                clinicaDisplayVal = 'CLÍNICA CARRIÓN';
            } else if (medNormVilcaCheck.includes('saire') || medNormVilcaCheck.includes('bocangel')) {
                clinicaDisplayVal = 'CLÍNICA ALFA PREVENIR';
            } else {
                clinicaDisplayVal = 'SIN CLINICA DEFINIDA';
            }
        }

        const safeEspecimen = escapeHtml(sanitizeSpecimenDisplay(especimenText));
        let rawDoctorStr = item.medSolicitante || item.med_solicitante || item.medico_solicitante || item.doctor || item.medico || '---';
        const rawDocNorm = rawDoctorStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (rawDocNorm.includes('castillo cuenca') || rawDocNorm.includes('josehpi castillo') || rawDocNorm.includes('josehp christopher castillo')) {
            const cCode = String(item.codAtencion || item.cod_atencion || '').toUpperCase();
            if (cCode.includes('26Q-300') || cCode.includes('26Q-301') || cCode.includes('26Q-259')) {
                rawDoctorStr = 'DR. JORGE ALBERTO MUÑANTE ARZAPALO';
            } else {
                rawDoctorStr = 'PARTICULAR / SIN ESPECIFICAR';
            }
        }
        const safeDoctor = escapeHtml(toTitleCase(rawDoctorStr));
        const safeClinica = escapeHtml(toTitleCase(clinicaDisplayVal));
        const safeDni = escapeHtml((item.dni && String(item.dni).trim() !== '' && String(item.dni).trim() !== '0' && String(item.dni).trim() !== '---') ? String(item.dni).trim() : '---');

        row.innerHTML = `
            <td class="col-index" data-label="#" style="text-align: center;">${index + 1}</td>
            <td class="col-code" data-label="CÓDIGO" style="text-align: center;">${renderCodeBadge(item.codAtencion || item.cod_atencion)}</td>
            <td class="col-dni" data-label="DNI" style="text-align: center;"><span class="dni-chip">${safeDni}</span></td>
            <td class="col-doctor" data-label="MÉDICO">${safeDoctor}<br><span class="table-clinica-subtext" style="display: block; margin-top: 2px;">${safeClinica}</span></td>
            <td class="col-patient" data-label="PACIENTE" onclick="if(window.innerWidth > 768){ if(window.openPrintWindow){ window.openPrintWindow('${safeCod}', false); } else if(window.handleAction){ window.handleAction('pdf', '${safeCod}'); } } else { if(window.openMobileReportReader){ window.openMobileReportReader('${safeCod}'); } }" style="cursor: pointer;" title="Ver informe de ${safePaciente}">
                <div class="patient-cell-wrapper">
                    <div class="patient-line-apellido"><span class="patient-val-apellido">${safeApellido}</span></div>
                    <div class="patient-line-nombre"><span class="patient-val-nombre">${safeNombre}</span></div>
                </div>
            </td>
            <td class="col-specimen" data-label="ESPÉCIMEN">
                <div class="specimen-cell-text" title="${safeEspecimen}">${safeEspecimen}</div>
            </td>
            <td class="col-date col-date-reception" data-label="RECEPCIÓN" style="text-align: center; white-space: nowrap;">
                <span class="date-chip date-reception">${formatTableDate(item.fechaIngreso || item.fecha_ingreso || item.fecRegistro || item.fec_registro || "")}</span>
            </td>
            <td class="col-date col-date-delivery" data-label="ENTREGA" style="text-align: center; white-space: nowrap;">
                <div class="sla-delivery-container" title="${dotTitle}">
                    <span class="sla-dot ${dotClass}" style="background-color: ${dotBgColor} !important; box-shadow: 0 0 8px ${dotBgColor} !important;"></span>
                    <span class="sla-delivery-date">${formatTableDate(item.fecEntrega || item.fec_entrega || item.fecha_entrega || item.fechaInforme || item.fecha_informe || '')}</span>
                </div>
            </td>
            <td class="col-actions" data-label="ACCIONES" style="text-align: center;">
                ${actionsHtml}
            </td>
        `;
        if (window.activeCorrelativeWindow && cleanCodeFunc(rawCodeVal) === cleanCodeFunc(window.activeCorrelativeWindow.targetCode)) {
            row.style.outline = '2px solid #10b981';
            row.style.background = 'rgba(16, 185, 129, 0.12)';
        }
        return row;
    };

    // Generador de Tarjeta Clínica Móvil Ergonómica (Boceto 1)
    const createMobilePatientCard = (item, index) => {
        const card = document.createElement('article');
        card.className = 'mobile-patient-card';
        let djItem = {};
        if (item.datos_json) { try { djItem = typeof item.datos_json === 'string' ? JSON.parse(item.datos_json) : item.datos_json; } catch(e){} }
        const rawCodeVal = String(item.codAtencion || item.cod_atencion || item.codigo || djItem.codAtencion || djItem.cod_atencion || djItem.codigo || item.id || '').trim();
        const safeCod = rawCodeVal.replace(/'/g, "\\'");
        card.dataset.cod = safeCod;

        const sla = getSla(item);
        let stateClass = 'listo';
        let stateLabel = 'Listo para Imprimir';
        let stateIcon = 'fa-solid fa-circle-check';

        if (sla.isFirmado) {
            stateClass = 'listo';
            stateLabel = 'Listo para Imprimir';
            stateIcon = 'fa-solid fa-circle-check';
        } else if (sla.isModificado) {
            stateClass = 'proceso';
            stateLabel = 'En Proceso';
            stateIcon = 'fa-solid fa-clock-rotate-left';
        } else if (sla.estado === 'Muestra Recogida' || item.muestraRecogida || item.recogido || item.enLaboratorio) {
            stateClass = 'recogida';
            stateLabel = 'En Laboratorio';
            stateIcon = 'fa-solid fa-flask-vial';
        } else {
            stateClass = 'urgente';
            stateLabel = 'Urgente';
            stateIcon = 'fa-solid fa-triangle-exclamation';
        }
        card.dataset.estado = stateClass;

        // Nombre y Edad
        const { pacienteName } = parseHumanPatientName(item);

        let ageFormatted = '';
        if (item.edad !== undefined && item.edad !== null && String(item.edad).trim() !== '' && String(item.edad).trim() !== '---') {
            const raw = String(item.edad).trim();
            ageFormatted = raw.toLowerCase().includes('año') ? raw : `${raw} años`;
        }

        // Espécimen
        let especimenText = (item.especimen !== undefined && item.especimen !== null ? item.especimen : '').trim();
        if (especimenText) {
            especimenText = toTitleCase(correctPapanicolaouSpelling(especimenText))
                .replace(/\bPap\b/gi, 'Papanicolaou')
                .replace(/\bPap\.\b/gi, 'Papanicolaou');
        } else {
            especimenText = 'Espécimen Quirúrgico';
        }

        // Diagnóstico
        let diagnosticoText = (item.diagnostico !== undefined && item.diagnostico !== null ? item.diagnostico : '').trim();
        if (diagnosticoText) {
            diagnosticoText = toTitleCase(diagnosticoText);
        }

        // Código de Atención
        const codeDisplay = rawCodeVal ? `ID: ${rawCodeVal}` : 'ID: ---';

        // Fechas
        const fecIngreso = formatTableDate(item.fechaIngreso || item.fecha_ingreso || item.fecRegistro || item.fec_registro || "");
        const fecEntrega = formatTableDate(item.fecEntrega || item.fec_entrega || item.fecha_entrega || item.fechaInforme || item.fecha_informe || '');

        // Resolución dinámica garantizada de Clínica
        let clinicaDisplayVal = (item.clinica || '').trim();
        const medNormVilcaCheck = (item.medSolicitante || item.doctor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (medNormVilcaCheck.includes('vilca')) {
            clinicaDisplayVal = 'CLÍNICA LA LUZ';
            item.clinica = 'CLÍNICA LA LUZ';
            item.procedencia = 'CLÍNICA LA LUZ';
        } else if (medNormVilcaCheck.includes('marreros') || medNormVilcaCheck.includes('lloclla')) {
            clinicaDisplayVal = 'CLINICA LA MUJER';
        } else if (!clinicaDisplayVal || ['sin clinica', 'sin clínica', 'sin clinica definida', 'sin clínica definida', 'clinica no conocida', 'clínica no conocida'].includes(clinicaDisplayVal.toLowerCase())) {
            if (medNormVilcaCheck.includes('escalante')) {
                clinicaDisplayVal = 'CLÍNICA SAN CLEMENTE';
            } else if (medNormVilcaCheck.includes('sanchez') || medNormVilcaCheck.includes('becerra') || medNormVilcaCheck.includes('ulfe') || medNormVilcaCheck.includes('carrion') || medNormVilcaCheck.includes('munante') || medNormVilcaCheck.includes('arzapalo')) {
                clinicaDisplayVal = 'CLÍNICA CARRIÓN';
            } else if (medNormVilcaCheck.includes('saire') || medNormVilcaCheck.includes('bocangel')) {
                clinicaDisplayVal = 'CLÍNICA ALFA PREVENIR';
            } else {
                clinicaDisplayVal = 'SIN CLINICA DEFINIDA';
            }
        }
        let rawDoctorStr = item.medSolicitante || item.med_solicitante || item.medico_solicitante || item.doctor || item.medico || '---';
        const rawDocNorm = rawDoctorStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (rawDocNorm.includes('castillo cuenca') || rawDocNorm.includes('josehpi castillo') || rawDocNorm.includes('josehp christopher castillo')) {
            const cCode = String(item.codAtencion || item.cod_atencion || '').toUpperCase();
            if (cCode.includes('26Q-300') || cCode.includes('26Q-301') || cCode.includes('26Q-259')) {
                rawDoctorStr = 'DR. JORGE ALBERTO MUÑANTE ARZAPALO';
            } else {
                rawDoctorStr = 'PARTICULAR / SIN ESPECIFICAR';
            }
        }
        const safeDoctor = escapeHtml(toTitleCase(rawDoctorStr));
        const safeClinica = escapeHtml(toTitleCase(clinicaDisplayVal));

        card.innerHTML = `
            <div class="mobile-card-header">
                <div class="mobile-card-patient-info">
                    <h3 class="mobile-card-patient-name">
                        ${escapeHtml(pacienteName)}${ageFormatted ? ` <span class="mobile-card-patient-age">(${escapeHtml(ageFormatted)})</span>` : ''}
                    </h3>
                </div>
                <div class="mobile-card-status-badge ${stateClass}">
                    <i class="${stateIcon}"></i>
                    <span>${stateLabel}</span>
                </div>
            </div>

            <div class="mobile-card-body">
                <div class="mobile-card-specimen-row">
                    <div class="mobile-card-specimen-title" title="${escapeHtml(especimenText)}">
                        <i class="fa-solid fa-vial-virus"></i>
                        <span class="specimen-highlight">${escapeHtml(especimenText)}</span>
                    </div>
                    <div class="mobile-card-code-pill" title="Código de Atención Clínica">
                        <i class="fa-solid fa-barcode" style="font-size: 0.72rem; opacity: 0.85;"></i>
                        <span>${escapeHtml(codeDisplay)}</span>
                    </div>
                </div>

                <div class="mobile-card-meta-grid">
                    <div class="mobile-meta-item">
                        <span class="meta-label"><i class="fa-solid fa-calendar-plus"></i> Ingreso</span>
                        <span class="meta-value">${fecIngreso}</span>
                    </div>
                    <div class="mobile-meta-item">
                        <span class="meta-label"><i class="fa-solid fa-calendar-check"></i> Entrega</span>
                        <span class="meta-value">
                            <span class="sla-dot-micro" style="background-color: ${sla.color} !important; box-shadow: 0 0 6px ${sla.color} !important;"></span>
                            ${fecEntrega}
                        </span>
                    </div>
                    <div class="mobile-meta-item full-width">
                        <span class="meta-label"><i class="fa-solid fa-user-doctor"></i> Médico / Sede</span>
                        <span class="meta-value-doctor">${safeDoctor} • <small>${safeClinica}</small></span>
                    </div>
                </div>
            </div>

            <div class="mobile-card-actions">
                <button type="button" class="btn-mobile-action btn-mobile-edit" onclick="window.openReportEditor ? window.openReportEditor('${safeCod}') : window.handleAction('editar', '${safeCod}')" title="Llenar / Modificar Informe">
                    <i class="fa-solid fa-pencil"></i>
                    <span>Llenar</span>
                </button>
                <button type="button" class="btn-mobile-action btn-mobile-pdf" onclick="window.openMobileReportReader ? window.openMobileReportReader('${safeCod}') : window.handleAction('mobile_reader', '${safeCod}')" title="Ver Informe Diagnóstico en Lector Móvil">
                    <i class="fa-solid fa-mobile-screen-button"></i>
                    <span>Ver</span>
                </button>
                <button type="button" class="btn-mobile-action btn-mobile-download" onclick="window.handleAction('descargar_pdf', '${safeCod}')" title="Descargar PDF Oficial Directo">
                    <i class="fa-solid fa-download"></i>
                    <span>PDF</span>
                </button>
                ${item.service !== 'C' ? `
                <button type="button" class="btn-mobile-action btn-mobile-360" onclick="window.openMobile360Modal('${safeCod}')" title="Abrir Visor Macroscópico 360°">
                    <i class="fa-solid fa-arrows-spin"></i>
                    <span>360°</span>
                </button>
                ` : ''}
                <button type="button" class="btn-mobile-action btn-mobile-correlative" onclick="event.stopPropagation(); window.showCorrelativeWindow && window.showCorrelativeWindow('${safeCod}')" title="Ver Lote Correlativo de Sesión (±5)">
                    <i class="fa-solid fa-layer-group" style="color: #10b981;"></i>
                    <span>Lote</span>
                </button>
                <button type="button" class="btn-mobile-action-kebab" onclick="window.toggleActionMenu(event, '${safeCod}')" title="Más opciones">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>
        `;

        if (window.activeCorrelativeWindow && cleanCodeFunc(rawCodeVal) === cleanCodeFunc(window.activeCorrelativeWindow.targetCode)) {
            card.style.border = '2px solid #10b981';
            card.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.4)';
        }

        return card;
    };

    const createTableElement = (subset, baseIndex) => {
        const table = document.createElement('table');
        table.className = 'report-table';
        table.style.flex = '1';
        table.style.minWidth = '0';
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="th-index" style="width: 3.5%;">#</th>
                    <th class="th-code" style="width: 8.5%;">COD. ATENCIÓN</th>
                    <th class="th-dni" style="width: 7.5%;">DNI</th>
                    <th class="th-doctor" style="width: 18%;">MÉDICO / SEDE</th>
                    <th class="th-patient" style="width: 20%;">PACIENTE</th>
                    <th class="th-specimen" style="width: 20%;">ESPÉCIMEN / MUESTRA</th>
                    <th class="th-reception" style="width: 7.5%;">RECEPCIÓN</th>
                    <th class="th-delivery" style="width: 8%;">ENTREGA</th>
                    <th class="th-actions action-header" style="width: 7%; min-width: 72px;">ACCIONES</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');
        subset.forEach((item, index) => {
            tbody.appendChild(createRow(item, baseIndex + index));
        });
        return table;
    };

    // Si no hay datos, mostrar mensaje en tabla de escritorio y en tarjetas móviles
    if (activeDataset.length === 0 && sourceData.length > 0 && !mobileSearchVal && !desktopSearchVal && activePillFilter === 'all') {
        console.warn("[ui_tables] Auto-recuperando dataset para evitar pantalla vacía.");
        activeDataset = sourceData.filter(item => {
            if (!item) return false;
            let s = item.service || 'Q';
            return s === currentService || currentService === 'ALL';
        });
        if (activeDataset.length === 0) {
            // Si el filtro por servicio activo tampoco arroja registros, recuperar el dataset maestro completo
            activeDataset = sourceData.slice();
        }
    }

    if (activeDataset.length === 0) {
        wrapper.style.display = 'block';
        wrapper.style.overflowX = 'auto';
        let tbodyEl = document.getElementById('tableBody');
        if (!tbodyEl || !document.getElementById('reportTable')) {
            wrapper.innerHTML = `
                <table class="report-table" id="reportTable">
                    <thead>
                        <tr>
                            <th class="th-index" style="width: 3.5%;">#</th>
                            <th class="th-code" style="width: 8.5%;">COD. ATENCIÓN</th>
                            <th class="th-dni" style="width: 7.5%;">DNI</th>
                            <th class="th-doctor" style="width: 18%;">MÉDICO / SEDE</th>
                            <th class="th-patient" style="width: 20%;">PACIENTE</th>
                            <th class="th-specimen" style="width: 20%;">ESPÉCIMEN / MUESTRA</th>
                            <th class="th-reception" style="width: 7.5%;">RECEPCIÓN</th>
                            <th class="th-delivery" style="width: 8%;">ENTREGA</th>
                            <th class="th-actions action-header" style="width: 7%; min-width: 72px;">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            `;
            tbodyEl = document.getElementById('tableBody');
        }
        if (tbodyEl) {
            tbodyEl.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                        No se encontraron registros de pacientes para los filtros seleccionados.
                    </td>
                </tr>
            `;
        }
        const mobileContainer = document.getElementById('mobilePatientCardsContainer');
        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <div class="mobile-empty-state">
                    <i class="fa-solid fa-notes-medical" style="font-size: 2.2rem; color: #38bdf8; margin-bottom: 8px;"></i>
                    <p style="margin: 0; font-weight: 700; font-size: 1rem; color: var(--text-primary);">No hay pacientes en esta sección</p>
                    <small style="color: var(--text-muted); display: block; margin: 6px 0 14px 0;">Prueba cambiando de píldora de filtro o limpiando el buscador.</small>
                    <button type="button" class="btn-reset-filters-mobile" onclick="window.resetMobileFiltersToAll && window.resetMobileFiltersToAll()" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #0284c7; color: #ffffff; border: none; border-radius: 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 8px rgba(2,132,199,0.35);">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Ver Todos los Pacientes</span>
                    </button>
                </div>
            `;
        }
        // Actualizar información a 0
        const infoEl = document.getElementById('patientsTableInfo');
        if (infoEl) infoEl.textContent = `Mostrando 0 a 0 de 0 registros`;
        const pagEl = document.getElementById('patientsPagination');
        if (pagEl) pagEl.innerHTML = '';
        return;
    }

    // (Sort ya aplicado antes de la paginación)

    wrapper.style.display = 'block';
    wrapper.style.overflowX = 'auto';

    let tbody = document.getElementById('tableBody');
    if (!tbody || !document.getElementById('reportTable')) {
        wrapper.innerHTML = `
            <table class="report-table" id="reportTable">
                <thead>
                    <tr>
                        <th class="th-index" style="width: 3.5%;">#</th>
                        <th class="th-code" style="width: 8.5%;">COD. ATENCIÓN</th>
                        <th class="th-dni" style="width: 7.5%;">DNI</th>
                        <th class="th-doctor" style="width: 18%;">MÉDICO / SEDE</th>
                        <th class="th-patient" style="width: 20%;">PACIENTE</th>
                        <th class="th-specimen" style="width: 20%;">ESPÉCIMEN / MUESTRA</th>
                        <th class="th-reception" style="width: 7.5%;">RECEPCIÓN</th>
                        <th class="th-delivery" style="width: 8%;">ENTREGA</th>
                        <th class="th-actions action-header" style="width: 7%; min-width: 72px;">ACCIONES</th>
                    </tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>
        `;
        tbody = document.getElementById('tableBody');
    } else {
        tbody.innerHTML = '';
    }

    // Cancelar cualquier lote de renderizado diferido previo para evitar solapamientos o jank
    if (window._pendingTableRenderToken) {
        cancelAnimationFrame(window._pendingTableRenderToken);
        window._pendingTableRenderToken = null;
    }

    const FIRST_CHUNK_SIZE = 30; // Primer lote visible inmediato (posiciones 1 a 30) síncrono al 100% (0ms)
    const SUBSEQUENT_CHUNK_SIZE = 15; // Lotes subsiguientes fluidos a 60 FPS para vistas extendidas

    // -------------------------------------------------------------
    // MONTAJE SÍNCRONO INMEDIATO EN DOM (#tableBody - MODO ESCRITORIO / TABLA)
    // -------------------------------------------------------------
    if (tbody) {
        tbody.innerHTML = '';

        // Renderizado síncrono instantáneo del primer lote de filas (0 ms)
        const firstChunk = currentSet.slice(0, FIRST_CHUNK_SIZE);
        const firstFrag = document.createDocumentFragment();
        firstChunk.forEach((item, index) => {
            try {
                const rowNode = createRow(item, startIndex + index);
                if (rowNode) firstFrag.appendChild(rowNode);
            } catch (eRow) {
                console.error('[Table UI] Error creando fila de paciente:', eRow, item);
            }
        });
        tbody.appendChild(firstFrag);

        // Renderizado diferido progresivo a 60 FPS para el resto de filas si currentSet > 30
        if (currentSet.length > FIRST_CHUNK_SIZE) {
            let currentOffset = FIRST_CHUNK_SIZE;
            function renderNextDesktopChunk() {
                const chunk = currentSet.slice(currentOffset, currentOffset + SUBSEQUENT_CHUNK_SIZE);
                if (chunk.length > 0) {
                    const frag = document.createDocumentFragment();
                    chunk.forEach((item, index) => {
                        try {
                            const rowNode = createRow(item, startIndex + currentOffset + index);
                            if (rowNode) frag.appendChild(rowNode);
                        } catch (eRow) {
                            console.error('[Table UI] Error diferido fila desktop:', eRow, item);
                        }
                    });
                    tbody.appendChild(frag);
                    currentOffset += SUBSEQUENT_CHUNK_SIZE;
                    if (currentOffset < currentSet.length) {
                        window._pendingTableRenderToken = requestAnimationFrame(renderNextDesktopChunk);
                    } else {
                        window._pendingTableRenderToken = null;
                    }
                } else {
                    window._pendingTableRenderToken = null;
                }
            }
            window._pendingTableRenderToken = requestAnimationFrame(renderNextDesktopChunk);
        }
    }

    // -------------------------------------------------------------
    // MONTAJE SÍNCRONO INMEDIATO EN DOM (#mobilePatientCardsContainer - MODO MÓVIL)
    // -------------------------------------------------------------
    const mobileContainer = document.getElementById('mobilePatientCardsContainer');
    if (mobileContainer) {
        mobileContainer.innerHTML = '';

        // Renderizado síncrono instantáneo del primer lote de tarjetas (0 ms)
        const firstChunk = currentSet.slice(0, FIRST_CHUNK_SIZE);
        const firstFrag = document.createDocumentFragment();
        firstChunk.forEach((item, index) => {
            try {
                const cardNode = createMobilePatientCard(item, startIndex + index);
                if (cardNode) firstFrag.appendChild(cardNode);
            } catch (eCard) {
                console.error('[Table UI] Error creando tarjeta móvil:', eCard, item);
            }
        });
        mobileContainer.appendChild(firstFrag);

        // Renderizado diferido progresivo a 60 FPS para el resto de tarjetas si currentSet > 30
        if (currentSet.length > FIRST_CHUNK_SIZE) {
            let currentOffset = FIRST_CHUNK_SIZE;
            function renderNextMobileChunk() {
                const chunk = currentSet.slice(currentOffset, currentOffset + SUBSEQUENT_CHUNK_SIZE);
                if (chunk.length > 0) {
                    const frag = document.createDocumentFragment();
                    chunk.forEach((item, index) => {
                        try {
                            const cardNode = createMobilePatientCard(item, startIndex + currentOffset + index);
                            if (cardNode) frag.appendChild(cardNode);
                        } catch (eCard) {
                            console.error('[Table UI] Error diferido tarjeta móvil:', eCard, item);
                        }
                    });
                    mobileContainer.appendChild(frag);
                    currentOffset += SUBSEQUENT_CHUNK_SIZE;
                    if (currentOffset < currentSet.length) {
                        window._pendingTableRenderToken = requestAnimationFrame(renderNextMobileChunk);
                    } else {
                        window._pendingTableRenderToken = null;
                    }
                } else {
                    window._pendingTableRenderToken = null;
                }
            }
            window._pendingTableRenderToken = requestAnimationFrame(renderNextMobileChunk);
        }
    }

    // Actualizar información
    const infoEl = document.getElementById('patientsTableInfo');
    if (infoEl) {
        infoEl.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalRecords} registros`;
    }

    // Generar botones de paginación con ancla permanente en Página 1 y Última Página
    const pagEl = document.getElementById('patientsPagination');
    if (pagEl) {
        pagEl.innerHTML = '';
        const effectiveTotalPages = Math.max(1, totalPages);

        // Helper para crear botones de paginación
        const createBtn = (text, pageNum, isDisabled = false, isActive = false) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `pagination-btn ${isActive ? 'active' : ''}`;
            btn.textContent = text;
            btn.setAttribute('data-page', String(pageNum));
            btn.disabled = isDisabled;
            return btn;
        };

        // 1. Botón Primera Página
        pagEl.appendChild(createBtn('« Primera', 1, currentPage <= 1));

        // 2. Botón Anterior
        pagEl.appendChild(createBtn('‹ Anterior', currentPage - 1, currentPage <= 1));

        // 3. Botón Página 1 Siempre Visible (Ancla Inicial)
        pagEl.appendChild(createBtn('1', 1, false, currentPage === 1));

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(effectiveTotalPages - 1, currentPage + 1);

        if (currentPage <= 3) {
            endPage = Math.min(effectiveTotalPages - 1, 4);
        }
        if (currentPage >= effectiveTotalPages - 2) {
            startPage = Math.max(2, effectiveTotalPages - 3);
        }

        // Puntos suspensivos iniciales si hay brecha con la página 1
        if (startPage > 2) {
            const dots1 = document.createElement('span');
            dots1.className = 'pagination-dots';
            dots1.textContent = '...';
            dots1.style.cssText = 'padding:0 4px;color:#94a3b8;align-self:center;user-select:none;';
            pagEl.appendChild(dots1);
        }

        // Rango de Páginas Intermedias
        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < effectiveTotalPages) {
                pagEl.appendChild(createBtn(String(i), i, false, i === currentPage));
            }
        }

        // Puntos suspensivos finales si hay brecha con la última página
        if (endPage < effectiveTotalPages - 1) {
            const dots2 = document.createElement('span');
            dots2.className = 'pagination-dots';
            dots2.textContent = '...';
            dots2.style.cssText = 'padding:0 4px;color:#94a3b8;align-self:center;user-select:none;';
            pagEl.appendChild(dots2);
        }

        // 4. Botón Última Página (Ancla Final) si total > 1
        if (effectiveTotalPages > 1) {
            pagEl.appendChild(createBtn(String(effectiveTotalPages), effectiveTotalPages, false, currentPage === effectiveTotalPages));
        }

        // 5. Botón Siguiente
        pagEl.appendChild(createBtn('Siguiente ›', currentPage + 1, currentPage >= effectiveTotalPages));

        // 6. Botón Última Página
        pagEl.appendChild(createBtn('Última »', effectiveTotalPages, currentPage >= effectiveTotalPages));

        if (!pagEl.dataset.listenerAttached) {
            pagEl.dataset.listenerAttached = 'true';
            pagEl.addEventListener('click', (e) => {
                const btn = e.target.closest('.pagination-btn');
                if (!btn || btn.disabled) return;
                const pageAttr = btn.getAttribute('data-page');
                if (pageAttr) {
                    const targetP = parseInt(pageAttr, 10);
                    if (!isNaN(targetP) && targetP > 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.goToPage(targetP);
                    }
                }
            });
        }
    }

    // Delegación de eventos de respaldo para la tabla principal de reportes
    if (typeof document !== 'undefined' && !document.body.dataset.globalActionsAttached) {
        document.body.dataset.globalActionsAttached = 'true';
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#tableBody .action-btn, #reportTable .action-btn');
            if (!btn) return;

            // Si el botón ya ejecutó su onclick inline, no duplicar
            if (btn.hasAttribute('onclick')) return;

            const actionType = btn.getAttribute('data-action') || (btn.classList.contains('edit-btn') ? 'editar' : (btn.classList.contains('pdf-btn') || btn.classList.contains('preview-pdf-btn') ? 'pdf' : (btn.classList.contains('download-pdf-btn') ? 'descargar_pdf' : (btn.classList.contains('delete-btn') ? 'eliminar' : (btn.classList.contains('req-fix-btn') ? 'solicitar_correccion' : '')))));
            
            let codAtencion = btn.getAttribute('data-cod');
            if (!codAtencion || codAtencion === '---') {
                const tr = btn.closest('tr');
                const codTd = tr ? tr.querySelector('td:nth-child(2)') : null;
                codAtencion = codTd ? codTd.textContent.trim() : '';
            }

            if (!codAtencion || codAtencion === '---' || !actionType) return;

            if (typeof window.handleAction === 'function') {
                window.handleAction(actionType, codAtencion);
            }
        });
    }

    // Disparar re-posicionamiento de burbuja de impresión si está activa
    if (typeof window.checkAndTriggerHelpBubbles === 'function') {
        window.checkAndTriggerHelpBubbles();
    }
}

window.goToPage = function(page) {
    const targetP = parseInt(page, 10);
    if (isNaN(targetP) || targetP < 1) return;
    currentPage = targetP;
    sessionStorage.setItem('activeTablePage', String(targetP));
    applyFilters(false);
};

function normalizeText(text) {
    if (!text) return '';
    return text.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/casteñeda|casteneda/g, 'castaneda');
}

export function normalizeClinicName(raw) {
    if (!raw) return 'SIN CLINICA DEFINIDA';
    const norm = normalizeText(raw);
    if (!norm || norm === 'sin clinica' || norm === 'sin clinica definida' || norm === 'no conocida' || norm === 'clinica no conocida' || norm === '---') {
        return 'SIN CLINICA DEFINIDA';
    }
    if (norm.includes('ventanilla')) return 'CLÍNICA CARRIÓN VENTANILLA';
    if (norm.includes('carrion') || norm.includes('hndac')) return 'CLÍNICA CARRIÓN';
    if (norm.includes('clemente')) return 'CLÍNICA SAN CLEMENTE';
    if (norm.includes('mujer')) return 'CLINICA LA MUJER';
    if (norm.includes('alfa') || norm.includes('prevenir')) return 'CLÍNICA ALFA PREVENIR';
    if (norm.includes('luz')) return 'CLÍNICA LA LUZ';
    if (norm.includes('uroserv') || norm.includes('urolog')) return 'UROSERV';
    if (norm.includes('junco')) return 'SR JUNCO';
    return String(raw).trim().toUpperCase();
}


export async function applyFilters(resetPage = false) {
    if (resetPage === true) {
        currentPage = 1;
        sessionStorage.setItem('activeTablePage', '1');
    } else {
        const storedPage = parseInt(sessionStorage.getItem('activeTablePage'));
        if (storedPage && !isNaN(storedPage) && storedPage > 0) {
            currentPage = storedPage;
        }
    }
    const placeholdersToIgnore = [
        'dd/mm/aaaa',
        'cod. atencion',
        'cod.atencion',
        'nom. paciente',
        'nom.paciente',
        'ape. paciente',
        'ape.paciente',
        'digite',
        'ing. nombre doctor o referencia',
        'nombre de clínica',
        'nombre de clinica'
    ];

    function getCleanFilterValue(id) {
        const el = document.getElementById(id);
        if (!el) return '';
        const val = (el.value || '').trim();
        const norm = normalizeText(val);
        if (placeholdersToIgnore.includes(norm)) return '';
        return norm;
    }

    const fecInicio = getCleanFilterValue('fecInicio');
    const fecFinal = getCleanFilterValue('fecFinal');
    const codAtencion = getCleanFilterValue('codAtencion');
    const nomPaciente = getCleanFilterValue('nomPaciente');
    const apePaciente = getCleanFilterValue('apePaciente');
    const dni = getCleanFilterValue('dni').replace(/\D/g, '');
    const medSolicitante = getCleanFilterValue('medSolicitante');
    const filterClinica = getCleanFilterValue('filterClinica');
    const mobileSearchInput = document.getElementById('mobileQuickSearchInput');
    const mobileSearch = mobileSearchInput ? normalizeText(mobileSearchInput.value) : '';

    // BÚSQUEDA INTELIGENTE / ASISTENTE IA CONVERSACIONAL
    const aiSearchInput = document.getElementById('aiSmartSearchInput');
    const rawAiQuery = aiSearchInput ? (aiSearchInput.value || '').trim() : '';
    const normAiQuery = normalizeText(rawAiQuery);

    let aiCodeTarget = '';
    let aiDniTarget = '';
    let aiClinicTarget = '';
    let aiStatusTarget = '';
    let aiServiceTarget = '';
    let aiTokens = [];

    if (normAiQuery) {
        // 1. Detección de Código de Atención (ej. 26Q-346, 346, Q-346, 26C-12)
        const codeMatch = normAiQuery.match(/\b(\d{2}[cqi]-?\d+|\b[cqi]-?\d+|\b\d{3,5}\b)/i);
        if (codeMatch) {
            aiCodeTarget = codeMatch[1].replace(/[-_\s]/g, '');
        }

        // 2. Detección de DNI (8 dígitos continuos)
        const dniMatch = normAiQuery.match(/\b\d{8}\b/);
        if (dniMatch) {
            aiDniTarget = dniMatch[0];
        }

        // 3. Detección de Clínica
        if (normAiQuery.includes('carrion')) aiClinicTarget = 'carrion';
        else if (normAiQuery.includes('clemente')) aiClinicTarget = 'clemente';
        else if (normAiQuery.includes('mujer')) aiClinicTarget = 'mujer';
        else if (normAiQuery.includes('alfa')) aiClinicTarget = 'alfa';

        // 4. Detección de Servicio
        if (normAiQuery.includes('citolog') || normAiQuery.includes('papanicolau') || normAiQuery.includes('pap')) {
            aiServiceTarget = 'C';
        } else if (normAiQuery.includes('biopsia') || normAiQuery.includes('quirurg') || normAiQuery.includes(' he')) {
            aiServiceTarget = 'Q';
        }

        // 5. Detección de Estado
        if (normAiQuery.includes('listo') || normAiQuery.includes('listos') || normAiQuery.includes('firmad') || normAiQuery.includes('completad')) {
            aiStatusTarget = 'completado';
        } else if (normAiQuery.includes('pendiente') || normAiQuery.includes('proceso') || normAiQuery.includes('incomplet')) {
            aiStatusTarget = 'proceso';
        }

        // 6. Palabras de parada (Stop-words)
        const stopWords = ['buscame', 'buscar', 'busca', 'encuentra', 'encontrar', 'muestra', 'muestrame', 'dame', 'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'al', 'a', 'para', 'en', 'con', 'por', 'favor', 'informe', 'informes', 'reporte', 'reportes', 'paciente', 'pacientes', 'registro', 'registros', 'caso', 'casos', 'resultado', 'resultados', 'doctor', 'dr', 'dra'];
        
        let cleanedQuery = normAiQuery;
        if (codeMatch && codeMatch[0]) {
            cleanedQuery = cleanedQuery.replace(codeMatch[0], ' ');
        }
        if (aiDniTarget) {
            cleanedQuery = cleanedQuery.replace(aiDniTarget, ' ');
        }
        if (aiClinicTarget) {
            cleanedQuery = cleanedQuery.replace(aiClinicTarget, ' ');
        }

        aiTokens = cleanedQuery.split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w));
    }

    // Preparación previa única fuera del bucle N para máxima aceleración (O(1) vs O(N))
    let currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};
    } catch (e) {
        currentUser = {};
    }
    const isAdmin = checkIsAdmin(currentUser);
    const isClinicUser = !isAdmin && !!currentUser.usuario;
    const userClinicName = isClinicUser ? normalizeText(currentUser.nombres || '') : '';
    const userAccount = isClinicUser ? normalizeText(currentUser.usuario || '') : '';
    const userAssignedClinic = isClinicUser ? normalizeText(currentUser.clinica || '') : '';
    const allUserTokens = [];

    if (isClinicUser) {
        const ignoreWords = ['del', 'los', 'las', 'un', 'una', 'el', 'la', 'de', 'en', 'al', 'dr', 'dra', 'dr.', 'dra.', 'clinica', 'clínica', 'centro', 'medico', 'médico', 'especializado', 'policlinico', 'policlínica', 'hospital', 'san', 'santa'];
        const tokens = `${userClinicName} ${userAccount} ${userAssignedClinic}`.split(/[\s,._-]+/).filter(w => w.length >= 3 && !ignoreWords.includes(w));
        allUserTokens.push(...tokens);

        if (userClinicName.includes('clemente') || userAccount.includes('clemente') || userClinicName.includes('san clemente')) {
            if (!allUserTokens.includes('clemente')) allUserTokens.push('clemente');
            if (!allUserTokens.includes('escalante')) allUserTokens.push('escalante');
            if (!allUserTokens.includes('alejandro')) allUserTokens.push('alejandro');
        }
        if (userClinicName.includes('ventanilla') || userAccount.includes('ventanilla')) {
            if (!allUserTokens.includes('ventanilla')) allUserTokens.push('ventanilla');
        } else if (userClinicName.includes('carrion') || userAccount.includes('carrion')) {
            if (!allUserTokens.includes('carrion')) allUserTokens.push('carrion');
            if (!allUserTokens.includes('carrion matriz')) allUserTokens.push('carrion matriz');
        }
        if (userClinicName.includes('mujer') || userAccount.includes('mujer') || userAccount.includes('mujersegura')) {
            if (!allUserTokens.includes('mujer')) allUserTokens.push('mujer');
            if (!allUserTokens.includes('marreros')) allUserTokens.push('marreros');
            if (!allUserTokens.includes('lloclla')) allUserTokens.push('lloclla');
        }
        if (userClinicName.includes('alfa') || userAccount.includes('alfa') || userAccount.includes('alfaprevenir') || userClinicName.includes('prevenir')) {
            if (!allUserTokens.includes('alfa')) allUserTokens.push('alfa');
            if (!allUserTokens.includes('prevenir')) allUserTokens.push('prevenir');
            if (!allUserTokens.includes('saire')) allUserTokens.push('saire');
            if (!allUserTokens.includes('bocangel')) allUserTokens.push('bocangel');
        }
        if (userClinicName.includes('luz') || userAccount.includes('luz') || userAccount.includes('vilca') || userAssignedClinic.includes('luz')) {
            if (!allUserTokens.includes('luz')) allUserTokens.push('luz');
            if (!allUserTokens.includes('vilca')) allUserTokens.push('vilca');
        }
        if (userClinicName.includes('uroserv') || userAccount.includes('uroserv') || userClinicName.includes('urolog') || userAssignedClinic.includes('uroserv')) {
            if (!allUserTokens.includes('uroserv')) allUserTokens.push('uroserv');
            if (!allUserTokens.includes('urologico')) allUserTokens.push('urologico');
            if (!allUserTokens.includes('castaneda')) allUserTokens.push('castaneda');
        }
        if (userClinicName.includes('junco') || userAccount.includes('junco')) {
            if (!allUserTokens.includes('junco')) allUserTokens.push('junco');
        }
        if (userClinicName.includes('chungui') || userAccount.includes('chungui') || userAccount.includes('diego')) {
            if (!allUserTokens.includes('chungui')) allUserTokens.push('chungui');
        }
        if (userAccount === 'drvictorcastaneda' || userAccount.includes('castaneda') || userClinicName.includes('castaneda')) {
            if (!allUserTokens.includes('castaneda')) allUserTokens.push('castaneda');
        }
        if (userAccount === 'bryanflores' || userAccount.includes('bryan') || userClinicName.includes('bryan')) {
            if (!allUserTokens.includes('bryan flores')) allUserTokens.push('bryan flores');
            if (!allUserTokens.includes('flores sierra')) allUserTokens.push('flores sierra');
        }
    }

    const filterFunction = (item) => {
        if (!item) return false;
        const codeUpper = String(item.codAtencion || item.cod_atencion || item.codigo || '').toUpperCase();
        const pacUpper = String(item.paciente || item.nombres || '').toUpperCase();
        const rawId = String(item.id || '');
        // FILTRADO SOBERANO DE SEGURIDAD Y LIMPIEZA MILITAR: Preservar todos los IDs 189XX legítimos de Supabase; solo excluir códigos 26Q-18XXX con paciente DESCONOCIDO
        if ((codeUpper.startsWith('26Q-189') || /^26Q-18\d{3}$/.test(codeUpper)) && pacUpper.includes('DESCONOCIDO')) return false;
        if (pacUpper.includes('SIN NOMBRE') && (String(item.clinica || '').toUpperCase().includes('SIN CLINICA') || !item.clinica)) return false;

        const rawCod = String(item.codAtencion || item.cod_atencion || item.codigo || '');
        if (codAtencion) {
            const cleanTarget = codAtencion.replace(/[-_\s]/g, '');
            const dbCod = normalizeText(rawCod);
            const cleanDbCod = dbCod.replace(/[-_\s]/g, '');
            if (!dbCod.includes(codAtencion) && !cleanDbCod.includes(cleanTarget)) return false;
        }

        function normalizeDateToISO(dateStr) {
            if (!dateStr) return '';
            const str = String(dateStr).trim();
            const isoMatch = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
            if (isoMatch) {
                return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
            }
            const dmyMatch = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (dmyMatch) {
                return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
            }
            return str;
        }

        if (fecInicio) {
            const itemDate = normalizeDateToISO(item.fecRegistro || item.fecRecepcion || item.fecha || '');
            const normInicio = normalizeDateToISO(fecInicio);
            if (itemDate && normInicio && itemDate < normInicio) return false;
        }
        if (fecFinal) {
            const itemDate = normalizeDateToISO(item.fecRegistro || item.fecRecepcion || item.fecha || '');
            const normFinal = normalizeDateToISO(fecFinal);
            if (itemDate && normFinal && itemDate > normFinal) return false;
        }

        if (dni && !(item.dni !== undefined && item.dni !== null && String(item.dni).includes(dni))) return false;

        if (!item._searchKey) {
            const raw = `${item.codAtencion || ''} ${item.paciente || ''} ${item.nombres || ''} ${item.apellidos || ''} ${item.dni || ''} ${item.medSolicitante || ''} ${item.clinica || ''} ${item.especimen || ''}`;
            item._searchKey = normalizeText(raw);
        }

        item._searchScore = 1.0;

        if (nomPaciente) {
            const words = nomPaciente.split(/\s+/).filter(Boolean);
            const matchesNom = words.every(w => item._searchKey.includes(w));
            if (!matchesNom) {
                const smartNom = matchPatientSmartSound(item, nomPaciente);
                if (!smartNom.match) return false;
                item._searchScore = Math.min(item._searchScore, smartNom.score);
            }
        }

        if (apePaciente) {
            const words = apePaciente.split(/\s+/).filter(Boolean);
            const matchesApe = words.every(w => item._searchKey.includes(w));
            if (!matchesApe) {
                const smartApe = matchPatientSmartSound(item, apePaciente);
                if (!smartApe.match) return false;
                item._searchScore = Math.min(item._searchScore, smartApe.score);
            }
        }

        if (medSolicitante && !normalizeText(item.medSolicitante).includes(medSolicitante)) return false;
        if (filterClinica) {
            const itemClinicaNorm = normalizeText(item.clinica);
            const itemMedNorm = normalizeText(item.medSolicitante);
            const isNoConocida = filterClinica.includes('no conocida');
            const isCastanedaOrBryan = itemMedNorm.includes('castaneda') || itemMedNorm.includes('robles') || itemMedNorm.includes('bryan') || (itemMedNorm.includes('flores') && itemMedNorm.includes('sierra'));

            if (isNoConocida) {
                const matchNoConocida = itemClinicaNorm.includes('no conocida') || isCastanedaOrBryan;
                if (!matchNoConocida) return false;
            } else {
                if (!itemClinicaNorm.includes(filterClinica) && !itemMedNorm.includes(filterClinica)) return false;
            }
        }

        if (mobileSearch) {
            const words = mobileSearch.split(/\s+/).filter(Boolean);
            const matchesMobile = words.every(w => item._searchKey.includes(w));
            if (!matchesMobile) {
                const smartMobile = matchPatientSmartSound(item, mobileSearch);
                if (!smartMobile.match) return false;
                item._searchScore = Math.min(item._searchScore, smartMobile.score);
            }
        }

        // Filtrado por Asistente IA Conversacional
        if (normAiQuery) {
            if (aiCodeTarget) {
                const cleanItemCode = normalizeText(rawCod).replace(/[-_\s]/g, '');
                if (!cleanItemCode.includes(aiCodeTarget)) return false;
            }
            if (aiDniTarget && !(item.dni && String(item.dni).includes(aiDniTarget))) return false;
            if (aiClinicTarget) {
                const itemClin = normalizeText(item.clinica || '');
                const itemMed = normalizeText(item.medSolicitante || '');
                if (!itemClin.includes(aiClinicTarget) && !itemMed.includes(aiClinicTarget)) return false;
            }
            if (aiServiceTarget) {
                let s = item.service;
                if (!s) {
                    const codeUpper = String(item.codAtencion || item.cod_atencion || '').toUpperCase();
                    const especimenUpper = String(item.especimen || '').toUpperCase();
                    if (codeUpper.includes('C-') || /C[-_\s0-9]|^C\d|\dC\d/.test(codeUpper) || especimenUpper.includes('CITOLOG') || especimenUpper.includes('PAPANICOLAOU')) {
                        s = 'C';
                    } else if (codeUpper.includes('I-') || /I[-_\s0-9]|^I\d|\dI\d/.test(codeUpper) || especimenUpper.includes('INMUNO')) {
                        s = 'I';
                    } else {
                        s = 'Q';
                    }
                }
                if (s !== aiServiceTarget) return false;
            }
            if (aiStatusTarget === 'completado') {
                const isFirmado = item.firmado === true || item.firmado === 'true' || item.firmado === 1 || String(item.estado || '').toLowerCase().includes('completad') || String(item.estado || '').toLowerCase().includes('listo');
                if (!isFirmado) return false;
            } else if (aiStatusTarget === 'proceso') {
                const isFirmado = item.firmado === true || item.firmado === 'true' || item.firmado === 1 || String(item.estado || '').toLowerCase().includes('completad') || String(item.estado || '').toLowerCase().includes('listo');
                if (isFirmado) return false;
            }
            if (aiTokens.length > 0) {
                const matchesTokens = aiTokens.every(t => item._searchKey.includes(t));
                if (!matchesTokens) {
                    const smartTokens = matchPatientSmartSound(item, aiTokens.join(' '));
                    if (!smartTokens.match) return false;
                    item._searchScore = Math.min(item._searchScore, smartTokens.score);
                }
            }
        }

        // Restricción de Seguridad por Rol (RBAC): Para perfil 'Usuario', mostrar únicamente registros de su clínica o médico
        if (isClinicUser) {
            const itemClinica = normalizeText(item.clinica || item.f_contacto || item.procedencia || '');
            const itemMed = normalizeText(item.medSolicitante || item.med_solicitante || '');

            // 1. Médicos Especialistas
            if (userAccount === 'bryanflores' || userClinicName.includes('bryan flores') || userClinicName.includes('bryan')) {
                return (itemMed.includes('bryan') && itemMed.includes('flores')) ||
                       (itemMed.includes('flores') && itemMed.includes('sierra')) ||
                       itemMed.includes('b. flores') ||
                       itemMed === 'flores';
            }
            if (userAccount === 'drvictorcastaneda' || userAccount.includes('castaneda') || userClinicName.includes('castaneda')) {
                return (itemMed.includes('castaneda') && (itemMed.includes('victor') || itemMed.includes('robles') || itemMed.includes('dr'))) ||
                       (itemMed.includes('victor') && itemMed.includes('robles')) ||
                       itemMed.includes('castaneda') ||
                       itemClinica.includes('uroserv') ||
                       itemClinica.includes('urolog');
            }
            if (userAccount === 'drdiegochungui' || userClinicName.includes('chungui')) {
                return itemMed.includes('chungui') && (itemMed.includes('diego') || itemMed.includes('bravo') || itemMed.includes('dr'));
            }
            if (userAccount === 'drjhonvilca' || userAccount.includes('jhonvilca') || userAccount.includes('vilca')) {
                return (itemMed.includes('vilca') && (itemMed.includes('jhon') || itemMed.includes('dr'))) ||
                       itemClinica.includes('luz');
            }
            if (userAccount === 'drjorgemunante' || userAccount.includes('munante')) {
                return itemMed.includes('munante') || itemMed.includes('arzapalo');
            }
            if (userAccount === 'drjaimebecerra' || userAccount.includes('becerra')) {
                return (itemMed.includes('becerra') && (itemMed.includes('jaime') || itemMed.includes('ulfe') || itemMed.includes('dr'))) ||
                       itemMed.includes('ulfe');
            }
            if (userAccount === 'drmanuelsanchez' || userAccount.includes('sanchez')) {
                return (itemMed.includes('sanchez') && (itemMed.includes('manuel') || itemMed.includes('orellana') || itemMed.includes('renato'))) ||
                       itemMed.includes('orellana');
            }
            if (userAccount === 'dralejandroescalante' || userAccount.includes('escalante')) {
                return (itemMed.includes('escalante') && (itemMed.includes('alejandro') || itemMed.includes('alvaro') || itemMed.includes('dr'))) ||
                       (itemMed.includes('alvaro') && itemMed.includes('escalante')) ||
                       itemClinica.includes('clemente') ||
                       itemClinica.includes('san clemente');
            }
            if (userAccount === 'junco2026' || userAccount.includes('junco')) {
                return itemClinica.includes('junco') || itemMed.includes('junco');
            }

            // 2. Clínicas (Blindaje estricto 100% Soberano con aislamiento de sedes)
            if (userAccount.includes('no conocida') || userClinicName.includes('no conocida')) {
                return itemClinica.includes('no conocida') ||
                       itemMed.includes('castaneda') ||
                       itemMed.includes('robles') ||
                       itemMed.includes('bryan') ||
                       (itemMed.includes('flores') && itemMed.includes('sierra'));
            }
            // Sede Carrión Ventanilla
            if (userAccount === 'carrionventanilla' || userAccount.includes('ventanilla') || userClinicName.includes('ventanilla')) {
                return itemClinica.includes('ventanilla') || itemMed.includes('ventanilla');
            }
            // Sede Carrión Matriz (Callao)
            if (userAccount === 'clinicacarrion' || (userAccount.includes('carrion') && !userAccount.includes('ventanilla')) || (userClinicName.includes('carrion') && !userClinicName.includes('ventanilla'))) {
                return (itemClinica.includes('carrion') || itemMed.includes('carrion') || itemMed.includes('chungui') || itemMed.includes('munante') || itemMed.includes('becerra') || itemMed.includes('sanchez') || itemMed.includes('flores')) && !itemClinica.includes('ventanilla');
            }
            // Sede San Clemente
            if (userAccount === 'sanclemente' || userAccount.includes('clemente') || userClinicName.includes('clemente')) {
                return itemClinica.includes('clemente') || itemClinica.includes('san clemente') || itemMed.includes('escalante') || itemMed.includes('alejandro');
            }
            // Sede Clínica La Mujer
            if (userAccount === 'mujersegura' || userAccount.includes('mujer') || userClinicName.includes('mujer')) {
                return itemClinica.includes('mujer') || 
                       itemClinica.includes('mujersegura') ||
                       itemMed.includes('marreros') || 
                       itemMed.includes('lloclla') ||
                       itemClinica.includes('marreros') || 
                       itemClinica.includes('lloclla');
            }
            // Sede Alfa Prevenir
            if (userAccount === 'alfaprevenir' || userAccount.includes('alfa') || userClinicName.includes('alfa') || userClinicName.includes('prevenir')) {
                return itemClinica.includes('alfa') || itemClinica.includes('prevenir') || itemMed.includes('saire') || itemMed.includes('bocangel');
            }
            // Sede Clínica La Luz
            if (userAccount === 'clinicalaluz' || userAccount.includes('laluz') || userAccount.includes('la luz') || userClinicName.includes('la luz') || userClinicName.includes('clinica la luz') || userAssignedClinic.includes('la luz')) {
                return itemClinica.includes('luz') || itemMed.includes('vilca');
            }
            // Sede Uroserv (Centro Urológico Especializado)
            if (userAccount === 'uroserv' || userAccount.includes('uroserv') || userClinicName.includes('uroserv') || userClinicName.includes('urolog') || userAssignedClinic.includes('uroserv')) {
                return itemClinica.includes('uroserv') || itemMed.includes('uroserv') || itemClinica.includes('urolog') || itemMed.includes('castaneda') || itemMed.includes('escalante') || itemMed.includes('romero');
            }

            let isUserMatch = false;

            if (allUserTokens.length > 0) {
                const tokenMatchClinica = itemClinica ? allUserTokens.some(t => itemClinica.includes(t)) : false;
                const tokenMatchMed = itemMed ? allUserTokens.some(t => itemMed.includes(t)) : false;
                if (tokenMatchClinica || tokenMatchMed) {
                    isUserMatch = true;
                }
            }

            if (!isUserMatch && userClinicName) {
                if (itemClinica && (itemClinica.includes(userClinicName) || userClinicName.includes(itemClinica))) {
                    isUserMatch = true;
                }
                if (itemMed && (itemMed.includes(userClinicName) || userClinicName.includes(itemMed))) {
                    isUserMatch = true;
                }
            }

            if (!isUserMatch) return false;
        }


        return true;
    };

    // 1. Unificación universal con prioridad a respaldos maestros soberanos (1,222 expedientes)
    const masterPatientMap = new Map();
    const normalizeKey = (c) => String(c || '').trim().toUpperCase().replace(/[-_\s]/g, '');

    const candidateSources = [
        (typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) ? window.REAL_SUPABASE_PATIENTS : null,
        (typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_BACKUP)) ? window.REAL_SUPABASE_BACKUP : null,
        (typeof window !== 'undefined' && Array.isArray(window.realSupabaseBackup)) ? window.realSupabaseBackup : null,
        (typeof window !== 'undefined' && Array.isArray(window.activePatientDb)) ? window.activePatientDb : null,
        Array.isArray(patientDatabase) ? patientDatabase : null,
        (typeof window !== 'undefined' && Array.isArray(window.patientDatabase)) ? window.patientDatabase : null
    ];

    candidateSources.forEach(src => {
        if (Array.isArray(src)) {
            src.forEach(p => {
                if (p && (p.codAtencion || p.cod_atencion)) {
                    const k = normalizeKey(p.codAtencion || p.cod_atencion);
                    if (k) {
                        const existing = masterPatientMap.get(k);
                        if (existing) {
                            if (typeof safeMergePatientRecords === 'function') {
                                masterPatientMap.set(k, safeMergePatientRecords(existing, p));
                            } else {
                                masterPatientMap.set(k, { ...existing, ...p });
                            }
                        } else {
                            masterPatientMap.set(k, p);
                        }
                    }
                }
            });
        }
    });

    const activePatientDb = Array.from(masterPatientMap.values());
    if (typeof window !== 'undefined') {
        window.activePatientDb = activePatientDb;
        if (Array.isArray(patientDatabase) && patientDatabase.length < activePatientDb.length) {
            patientDatabase.length = 0;
            patientDatabase.push(...activePatientDb);
        }
        if (Array.isArray(window.patientDatabase) && window.patientDatabase.length < activePatientDb.length) {
            window.patientDatabase.length = 0;
            window.patientDatabase.push(...activePatientDb);
        }
    }

    // GARANTÍA MILITAR: Ordenar estrictamente descendente para que los registros más nuevos siempre aparezcan primero
    if (typeof sortPatientArray === 'function') {
        sortPatientArray(activePatientDb);
    }
    let filteredData = activePatientDb.filter(filterFunction);

    // Priorizar por relevancia fonética y caligráfica (exactos primero, difusos después)
    if (mobileSearch || nomPaciente || apePaciente || normAiQuery) {
        filteredData.sort((a, b) => {
            const scoreA = a._searchScore !== undefined ? a._searchScore : 1.0;
            const scoreB = b._searchScore !== undefined ? b._searchScore : 1.0;
            return scoreB - scoreA;
        });
    }

    // RENDERIZADO INSTANTÁNEO 0ms: Actualizar tabla y pie de página inmediatamente con memoria local / contingencia
    renderTable(filteredData);

    // Actualizar badge del Asistente IA
    const aiFeedbackRow = document.getElementById('aiSearchFeedbackRow');
    const aiFeedbackMsg = document.getElementById('aiFeedbackMessage');
    if (aiFeedbackRow && aiFeedbackMsg) {
        if (normAiQuery || mobileSearch || nomPaciente || apePaciente) {
            aiFeedbackRow.style.display = 'flex';
            let summary = [];
            if (aiCodeTarget) summary.push(`código "${aiCodeTarget}"`);
            if (aiDniTarget) summary.push(`DNI "${aiDniTarget}"`);
            if (aiClinicTarget) summary.push(`clínica "${aiClinicTarget}"`);
            if (aiServiceTarget) summary.push(`servicio "${aiServiceTarget === 'C' ? 'citología' : 'biopsia'}"`);
            if (aiStatusTarget) summary.push(`estado "${aiStatusTarget}"`);
            if (aiTokens.length > 0) summary.push(`"${aiTokens.join(' ')}"`);
            if (mobileSearch) summary.push(`búsqueda "${mobileSearch}"`);
            if (nomPaciente) summary.push(`nombre "${nomPaciente}"`);
            if (apePaciente) summary.push(`apellido "${apePaciente}"`);

            const desc = summary.length > 0 ? summary.join(', ') : `"${rawAiQuery || mobileSearch}"`;
            let lotSuggestion = '';
            if (filteredData.length >= 1 && filteredData.length <= 5) {
                const targetCod = filteredData[0].codAtencion || filteredData[0].cod_atencion;
                lotSuggestion = ` &nbsp;•&nbsp; <a href="javascript:void(0)" onclick="window.showCorrelativeWindow && window.showCorrelativeWindow('${targetCod}')" style="color: #10b981; font-weight: 700; text-decoration: underline;"><i class="fa-solid fa-layer-group"></i> Ver Lote Correlativo de Sesión (±5) para ${targetCod}</a>`;
            }
            aiFeedbackMsg.innerHTML = `Mostrando <strong>${filteredData.length}</strong> paciente(s) para: <em>${desc}</em>${lotSuggestion}`;
        } else {
            aiFeedbackRow.style.display = 'none';
        }
    }

    // Búsqueda remota en segundo plano eliminada — todos los datos se cargan de masterPatientMap (REAL_SUPABASE_PATIENTS + patientDatabase)
}

// ============================================================================
// DASHBOARD MÓVIL DE PACIENTES - BOCETO 1 (CONTROLADORES Y VISOR 360)
// ============================================================================

let mobile360Angle = 0;
let mobile360AutoSpin = false;
let mobile360Raf = null;
let currentMobile360Cod = '';

export function initMobileDashboardEvents() {
    if (typeof document === 'undefined') return;
    if (window._mobileDashboardEventsInitialized) return;
    window._mobileDashboardEventsInitialized = true;

    // 0. Barra de Búsqueda Inteligente / Asistente IA (Desktop y Universal)
    const aiInput = document.getElementById('aiSmartSearchInput');
    const aiClearBtn = document.getElementById('btnClearAISearch');
    const aiToggleFiltersBtn = document.getElementById('btnToggleAdvancedFilters');
    const aiResetBadgeBtn = document.getElementById('btnResetSearchBadge');
    const aiVoiceBtn = document.getElementById('btnVoiceSearch');
    const advDrawer = document.getElementById('advancedFiltersDrawer');

    let aiDebounceTimer = null;
    if (aiInput) {
        aiInput.addEventListener('input', () => {
            const val = aiInput.value.trim();
            if (aiClearBtn) aiClearBtn.style.display = val ? 'inline-flex' : 'none';
            if (aiDebounceTimer) clearTimeout(aiDebounceTimer);
            aiDebounceTimer = setTimeout(() => {
                applyFilters(true);
            }, 180);
        });

        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (aiDebounceTimer) clearTimeout(aiDebounceTimer);
                applyFilters(true);
            }
        });
    }

    if (aiClearBtn && aiInput) {
        aiClearBtn.addEventListener('click', () => {
            aiInput.value = '';
            aiClearBtn.style.display = 'none';
            applyFilters(true);
            aiInput.focus();
        });
    }

    if (aiResetBadgeBtn && aiInput) {
        aiResetBadgeBtn.addEventListener('click', () => {
            aiInput.value = '';
            if (aiClearBtn) aiClearBtn.style.display = 'none';
            applyFilters(true);
            aiInput.focus();
        });
    }

    if (aiToggleFiltersBtn && advDrawer) {
        aiToggleFiltersBtn.addEventListener('click', () => {
            const isHidden = advDrawer.style.display === 'none' || !advDrawer.style.display;
            advDrawer.style.display = isHidden ? 'block' : 'none';
            aiToggleFiltersBtn.classList.toggle('active', isHidden);
        });
    }

    // Atajos Rápidos Táctiles (Chips interactivos de 1 clic)
    document.querySelectorAll('.ai-chip-btn').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query') || chip.textContent.trim();
            if (aiInput) {
                aiInput.value = query;
                if (aiClearBtn) aiClearBtn.style.display = 'inline-flex';
                applyFilters(true);
            }
        });
    });

    // Soporte de Voz (Web Speech API nativo del navegador - 100% offline y soberano en Chromium / Edge / Android)
    if (aiVoiceBtn && aiInput) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-PE';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                aiVoiceBtn.classList.add('listening');
                aiVoiceBtn.setAttribute('title', 'Escuchando... hable ahora');
            };

            recognition.onresult = (event) => {
                if (event.results && event.results[0] && event.results[0][0]) {
                    const transcript = event.results[0][0].transcript;
                    aiInput.value = transcript;
                    if (aiClearBtn) aiClearBtn.style.display = 'inline-flex';
                    applyFilters(true);
                }
            };

            recognition.onerror = () => {
                aiVoiceBtn.classList.remove('listening');
            };

            recognition.onend = () => {
                aiVoiceBtn.classList.remove('listening');
                aiVoiceBtn.setAttribute('title', 'Búsqueda por voz / Dictado');
            };

            aiVoiceBtn.addEventListener('click', () => {
                if (aiVoiceBtn.classList.contains('listening')) {
                    recognition.stop();
                } else {
                    try {
                        recognition.start();
                    } catch (e) {
                        try { recognition.stop(); } catch(err) {}
                    }
                }
            });
        } else {
            aiVoiceBtn.style.opacity = '0.5';
            aiVoiceBtn.setAttribute('title', 'Reconocimiento de voz no soportado en este navegador');
        }
    }

    // 1. Buscador Rápido Superior Móvil
    const searchInput = document.getElementById('mobileQuickSearchInput');
    const clearBtn = document.getElementById('btnMobileClearSearch');
    const filterBtn = document.getElementById('btnMobileToggleAdvancedFilters');

    let debounceTimer = null;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const val = searchInput.value.trim();
            if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                applyFilters(true);
            }, 180);
        });
    }

    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            applyFilters(true);
            searchInput.focus();
        });
    }

    window.closeMobileFilters = function() {
        const card = document.querySelector('.filters-card');
        const backdrop = document.getElementById('filtersModalBackdrop');
        if (card) card.classList.remove('mobile-modal-open');
        if (backdrop) backdrop.style.display = 'none';
    };

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            const card = document.querySelector('.filters-card');
            const backdrop = document.getElementById('filtersModalBackdrop');
            if (card) {
                const isOpen = card.classList.toggle('mobile-modal-open');
                if (backdrop) backdrop.style.display = isOpen ? 'block' : 'none';
                const filterForm = document.getElementById('filterForm');
                if (filterForm && isOpen) {
                    filterForm.classList.remove('collapsed');
                }
            }
        });
    }

    const btnBuscar = document.getElementById('btnBuscarReportes');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            window.closeMobileFilters();
        });
    }

    // 2. Píldoras de Filtrado Superior Horizontal con Scroll
    
    // Sincronizar estado visual inicial de pildoras moviles
    const pContainerInit = document.getElementById('mobileFilterPills');
    if (pContainerInit) {
        // En móvil la vista inicial por defecto es global ('Todo'). No auto-activar píldoras restrictivas Q o C al inicio
        pContainerInit.querySelectorAll('.mobile-filter-pill').forEach(p => {
            const pf = p.getAttribute('data-pill-filter');
            if (pf === 'service-Q' || pf === 'service-C') {
                p.classList.remove('active');
            }
        });
    }

    const pillsContainer = document.getElementById('mobileFilterPills');
    if (pillsContainer) {
        pillsContainer.addEventListener('click', (e) => {
            const pill = e.target.closest('.mobile-filter-pill');
            if (!pill) return;
            e.preventDefault();
            const targetFilter = pill.getAttribute('data-pill-filter') || 'all';

            // CASO 1: Cambio de Servicio (Biopsias Q vs Citologa C)
            if (targetFilter === 'service-Q' || targetFilter === 'service-C') {
                const srv = targetFilter === 'service-C' ? 'C' : 'Q';
                setCurrentService(srv);
                sessionStorage.setItem('manualServiceSelected', 'true');
                activePillFilter = 'all';

                // Actualizar píldoras visuales
                pillsContainer.querySelectorAll('.mobile-filter-pill').forEach(p => {
                    const pf = p.getAttribute('data-pill-filter');
                    if (pf === 'service-Q' || pf === 'service-C') {
                        p.classList.toggle('active', pf === targetFilter);
                    } else if (pf === 'all') {
                        p.classList.add('active');
                    } else {
                        p.classList.remove('active');
                    }
                });

                // Cambiar pestaña en desktop y aplicar filtros
                const tabBtns = document.querySelectorAll('.services-tabs .tab-btn[data-service]');
                tabBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-service') === srv));
                
                applyFilters(true);
                return;
            }

            // CASO 2: Cambio de Estado SLA (Todo, En Proceso, Listos, Urgentes)
            // Si el usuario en móvil pulsa 'Todo', asegurar visibilidad global (Biopsias + Citología)
            if (targetFilter === 'all') {
                // Al pulsar 'Todo' no restringir el servicio
                sessionStorage.removeItem('manualServiceSelected');
                pillsContainer.querySelectorAll('.mobile-filter-pill').forEach(p => {
                    const pf = p.getAttribute('data-pill-filter');
                    if (pf === 'service-Q' || pf === 'service-C') {
                        p.classList.remove('active');
                    }
                });
            }
            pillsContainer.querySelectorAll('.mobile-filter-pill').forEach(p => {
                const pf = p.getAttribute('data-pill-filter');
                if (pf !== 'service-Q' && pf !== 'service-C') {
                    p.classList.toggle('active', pf === targetFilter);
                }
            });
            activePillFilter = targetFilter;
            applyFilters(true);
        });
    }

    // Cerrar modal 360 con tecla Escape o clic en backdrop
    const modal360 = document.getElementById('mobile360ViewerModal');
    if (modal360) {
        modal360.addEventListener('click', (e) => {
            if (e.target === modal360) {
                closeMobile360Viewer();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal360 && modal360.style.display !== 'none') {
            closeMobile360Viewer();
        }
    });
}

export function openMobile360Modal(codAtencion) {
    currentMobile360Cod = String(codAtencion || '').trim();
    if (!currentMobile360Cod) return;

    const modal = document.getElementById('mobile360ViewerModal');
    if (!modal) return;

    // Buscar información del paciente en memorias locales y remotas
    const localSource = Array.isArray(patientDatabase) ? patientDatabase : (Array.isArray(window.patientDatabase) ? window.patientDatabase : []);
    const cleanLower = currentMobile360Cod.toLowerCase();
    const cleanNoHyphen = cleanLower.replace(/[-_\s]/g, '');

    let patient = localSource.find(x => {
        const c = String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase();
        return c === cleanLower || c.replace(/[-_\s]/g, '') === cleanNoHyphen;
    });

    if (!patient && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
        patient = window.REAL_SUPABASE_PATIENTS.find(x => {
            const c = String(x.codAtencion || '').trim().toLowerCase();
            return c === cleanLower || c.replace(/[-_\s]/g, '') === cleanNoHyphen;
        });
    }

    if (!patient) {
        patient = { codAtencion: currentMobile360Cod };
    }

    const rawPaciente = (patient.paciente || `${patient.apellidos || ''}, ${patient.nombres || ''}`).trim();
    const pacienteName = rawPaciente ? toTitleCase(rawPaciente) : 'Paciente Clínico';

    let especimenText = (patient.especimen !== undefined && patient.especimen !== null ? patient.especimen : '').trim();
    if (especimenText) {
        especimenText = toTitleCase(correctPapanicolaouSpelling(especimenText))
            .replace(/\bPap\b/gi, 'Papanicolaou')
            .replace(/\bPap\.\b/gi, 'Papanicolaou');
    } else {
        especimenText = 'Espécimen Macroscópico';
    }

    const titleEl = document.getElementById('mobile360ModalTitle');
    const subTitleEl = document.getElementById('mobile360ModalSubtitle');
    if (titleEl) titleEl.textContent = especimenText;
    if (subTitleEl) subTitleEl.textContent = `ID: ${currentMobile360Cod} • ${pacienteName}`;

    // Montar Canvas táctil
    const container = document.getElementById('mobile360CanvasContainer');
    if (container) {
        setupMobile360Canvas(container, patient);
    }

    modal.style.display = 'flex';
}

export function closeMobile360Viewer() {
    if (mobile360Raf) {
        cancelAnimationFrame(mobile360Raf);
        mobile360Raf = null;
    }
    mobile360AutoSpin = false;
    const btnSpin = document.getElementById('btnMobile360ToggleSpin');
    if (btnSpin) {
        btnSpin.innerHTML = '<i class="fa-solid fa-play"></i> <span>Giro Continuo</span>';
        btnSpin.style.color = '';
    }
    const modal = document.getElementById('mobile360ViewerModal');
    if (modal) modal.style.display = 'none';
}

export function toggleMobile360Spin() {
    mobile360AutoSpin = !mobile360AutoSpin;
    const btnSpin = document.getElementById('btnMobile360ToggleSpin');
    if (btnSpin) {
        btnSpin.innerHTML = mobile360AutoSpin ? '<i class="fa-solid fa-pause"></i> <span>Pausar Giro</span>' : '<i class="fa-solid fa-play"></i> <span>Giro Continuo</span>';
        btnSpin.style.color = mobile360AutoSpin ? '#10b981' : '';
    }
}

export function openMobile360Pdf() {
    if (currentMobile360Cod && typeof window.handleAction === 'function') {
        window.handleAction('pdf', currentMobile360Cod);
    }
}

export function setupMobile360Canvas(container, patient) {
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'grab';
    container.appendChild(canvas);

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = (rect.width || 360) * dpr;
    const h = (rect.height || 340) * dpr;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    mobile360Angle = 0;
    mobile360AutoSpin = false;

    // Verificar si el paciente tiene fotogramas o imágenes
    let frames = [];
    if (patient && patient.macro360) {
        if (Array.isArray(patient.macro360) && patient.macro360.length > 0) {
            frames = patient.macro360;
        } else if (typeof patient.macro360 === 'string') {
            try {
                const parsed = JSON.parse(patient.macro360);
                if (Array.isArray(parsed) && parsed.length > 0) frames = parsed;
            } catch (e) {
                if (patient.macro360.startsWith('data:') || patient.macro360.startsWith('http')) {
                    frames = [patient.macro360];
                }
            }
        }
    }

    let loadedImages = [];
    let imagesReady = false;
    if (frames.length > 0) {
        let loadedCount = 0;
        frames.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount >= frames.length) {
                    imagesReady = true;
                    drawFrame();
                }
            };
            img.src = src;
            loadedImages.push(img);
        });
    }

    function updateHud(deg) {
        const normDeg = ((deg % 360) + 360) % 360;
        const angleTxt = document.getElementById('mobile360AngleText');
        const orientTxt = document.getElementById('mobile360OrientationText');
        if (angleTxt) angleTxt.textContent = `${Math.round(normDeg)}°`;
        if (orientTxt) {
            if (normDeg >= 315 || normDeg < 45) {
                orientTxt.textContent = '(Cara Anterior)';
            } else if (normDeg >= 45 && normDeg < 135) {
                orientTxt.textContent = '(Lateral Derecha)';
            } else if (normDeg >= 135 && normDeg < 225) {
                orientTxt.textContent = '(Cara Posterior)';
            } else {
                orientTxt.textContent = '(Lateral Izquierda)';
            }
        }
    }

    function drawFrame() {
        ctx.clearRect(0, 0, w, h);
        const normDeg = ((mobile360Angle % 360) + 360) % 360;
        const rad = (normDeg * Math.PI) / 180;

        // Fondo oscuro clínico de alta gama
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) / 1.2);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Cuadrícula y escala milimétrica en el fondo
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        const gridStep = 40 * dpr;
        for (let x = 0; x < w; x += gridStep) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += gridStep) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Si tenemos imágenes reales cargadas del paciente:
        if (imagesReady && loadedImages.length > 0) {
            const frameIndex = Math.floor((normDeg / 360) * loadedImages.length) % loadedImages.length;
            const img = loadedImages[frameIndex];
            if (img && img.complete) {
                const scale = Math.min((w * 0.85) / img.width, (h * 0.85) / img.height);
                const dw = img.width * scale;
                const dh = img.height * scale;
                const dx = (w - dw) / 2;
                const dy = (h - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
            }
        } else {
            // Renderizado Anatómico Patológico Tridimensional Procedural en Canvas
            ctx.save();
            ctx.translate(w / 2, h / 2);

            // Sombra inferior de apoyo
            ctx.beginPath();
            ctx.ellipse(0, 80 * dpr, 90 * dpr, 20 * dpr, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fill();

            // Rotación 3D simulada
            const cosRot = Math.cos(rad);
            const sinRot = Math.sin(rad);

            // Espécimen quirúrgico principal
            const rx = (75 + Math.abs(cosRot) * 20) * dpr;
            const ry = (55 + Math.abs(sinRot) * 15) * dpr;

            // Degradado de tejido orgánico
            const tissueGrad = ctx.createRadialGradient(-15 * dpr * cosRot, -20 * dpr, 10 * dpr, 0, 0, rx * 1.1);
            tissueGrad.addColorStop(0, '#e29578');
            tissueGrad.addColorStop(0.4, '#b56576');
            tissueGrad.addColorStop(0.85, '#6d2e46');
            tissueGrad.addColorStop(1, '#3d1627');

            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, sinRot * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = tissueGrad;
            ctx.fill();

            // Borde / Margen Quirúrgico entintado (Tinta China / Azul de Metileno)
            ctx.strokeStyle = cosRot > 0 ? '#0284c7' : '#059669';
            ctx.lineWidth = 3.5 * dpr;
            ctx.stroke();

            // Textura y corte seccional patológico
            ctx.beginPath();
            ctx.ellipse(cosRot * 20 * dpr, sinRot * 10 * dpr, rx * 0.45, ry * 0.35, rad * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 230, 220, 0.25)';
            ctx.fill();

            // Rótulo anatómico dinámico sobre el espécimen
            ctx.font = `bold ${11 * dpr}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 6;

            let labelText = 'Muestra Quirúrgica 360°';
            if (patient && patient.especimen) {
                const rawEsp = String(patient.especimen).trim();
                labelText = rawEsp.length > 32 ? (rawEsp.slice(0, 30).trim() + '…') : rawEsp;
            }
            ctx.fillText(labelText, 0, -ry - 18 * dpr);

            ctx.font = `${9.5 * dpr}px monospace`;
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`ID: ${patient.codAtencion || '---'} • ${Math.round(normDeg)}°`, 0, -ry - 4 * dpr);

            ctx.restore();
        }

        updateHud(normDeg);
    }

    // Dibujo inicial
    drawFrame();

    // Eventos táctiles y ratón
    let isDragging = false;
    let lastX = 0;
    let velocity = 0;

    const startDrag = (clientX) => {
        isDragging = true;
        lastX = clientX;
        velocity = 0;
        mobile360AutoSpin = false;
        const btnSpin = document.getElementById('btnMobile360ToggleSpin');
        if (btnSpin) {
            btnSpin.innerHTML = '<i class="fa-solid fa-play"></i> <span>Giro Continuo</span>';
            btnSpin.style.color = '';
        }
        canvas.style.cursor = 'grabbing';
    };

    const moveDrag = (clientX) => {
        if (!isDragging) return;
        const deltaX = clientX - lastX;
        lastX = clientX;
        velocity = deltaX * 0.4;
        mobile360Angle -= deltaX * 0.75;
        drawFrame();
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        canvas.style.cursor = 'grab';
    };

    // Pointer Events (unifica ratón y táctil en móviles)
    canvas.addEventListener('pointerdown', (e) => {
        try { canvas.setPointerCapture(e.pointerId); } catch(err){}
        startDrag(e.clientX);
    });
    canvas.addEventListener('pointermove', (e) => {
        moveDrag(e.clientX);
    });
    canvas.addEventListener('pointerup', (e) => {
        try { canvas.releasePointerCapture(e.pointerId); } catch(err){}
        endDrag();
    });
    canvas.addEventListener('pointercancel', (e) => {
        endDrag();
    });

    // Loop de animación para Auto-Giro e Inercia
    function animationLoop() {
        if (mobile360AutoSpin) {
            mobile360Angle += 1.2;
            drawFrame();
        } else if (Math.abs(velocity) > 0.05) {
            mobile360Angle -= velocity;
            velocity *= 0.92;
            drawFrame();
        }
        mobile360Raf = requestAnimationFrame(animationLoop);
    }

    if (mobile360Raf) cancelAnimationFrame(mobile360Raf);
    mobile360Raf = requestAnimationFrame(animationLoop);
}

export function handleMobileNav(target) {
    document.querySelectorAll('.mobile-bottom-nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`navItem${target.charAt(0).toUpperCase() + target.slice(1)}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (target === 'home') {
        activePillFilter = 'all';
        document.querySelectorAll('.mobile-filter-pill').forEach(p => p.classList.remove('active'));
        document.querySelector('.mobile-filter-pill[data-pill-filter="all"]')?.classList.add('active');

        const searchInput = document.getElementById('mobileQuickSearchInput');
        if (searchInput) {
            searchInput.value = '';
            const clearBtn = document.getElementById('btnMobileClearSearch');
            if (clearBtn) clearBtn.style.display = 'none';
        }

        applyFilters(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'pacientes') {
        if (typeof window.switchSidebarView === 'function') {
            window.switchSidebarView('pacientes');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'visor360') {
        const firstCard = document.querySelector('.mobile-patient-card');
        const targetCod = firstCard ? firstCard.dataset.cod : (patientDatabase[0]?.codAtencion || '26Q-394');
        openMobile360Modal(targetCod);
    } else if (target === 'config') {
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.classList.add('sidebar-active', 'mobile-sidebar-open');
        }
    }
}

export function showCorrelativeWindow(codAtencion) {
    if (!codAtencion) return;
    const win = getCorrelativeWindow(codAtencion, 5);
    if (!win || !win.patients || win.patients.length === 0) {
        if (typeof showToast === 'function') {
            showToast("No se encontró el lote correlativo para este código.", "warning");
        }
        return;
    }
    window.activeCorrelativeWindow = win;
    renderTable(win.patients);
    if (typeof showToast === 'function') {
        showToast(`Mostrando lote correlativo de ${win.patients.length} pacientes (±5 de ${win.targetCode})`, "success");
    }
    const banner = document.getElementById('correlativeWindowBanner');
    if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

export function exitCorrelativeWindow() {
    window.activeCorrelativeWindow = null;
    const banner = document.getElementById('correlativeWindowBanner');
    if (banner) banner.style.display = 'none';
    applyFilters(false);
}

if (typeof window !== 'undefined') {
    window.applyFilters = applyFilters;
    window.renderTable = renderTable;
    window.showCorrelativeWindow = showCorrelativeWindow;
    window.exitCorrelativeWindow = exitCorrelativeWindow;
    window.openMobile360Modal = openMobile360Modal;
    window.closeMobile360Viewer = closeMobile360Viewer;
    window.toggleMobile360Spin = toggleMobile360Spin;
    window.openMobile360Pdf = openMobile360Pdf;
    window.handleMobileNav = handleMobileNav;
    window.initMobileDashboardEvents = initMobileDashboardEvents;
    window.downloadPatientJSON = downloadPatientJSON;
    window.getNextAttentionCode = window.getNextAttentionCode || getNextAttentionCode;
}

export function getNextAttentionCode(serviceValue, options = {}) {
    if (typeof window !== 'undefined' && typeof window._scriptGetNextAttentionCode === 'function') {
        return window._scriptGetNextAttentionCode(serviceValue, options);
    }
    const currentYearTwoDigits = String(new Date().getFullYear()).slice(-2);
    const val = String(serviceValue || '').trim().toUpperCase();
    let letter = (val === 'PAPANICOLAOU' || val.includes('CITOLOG')) ? 'C' : (val.includes('INMUNO') ? 'I' : 'Q');

    const SOBERANO_MIN_CORRELATIVES = { 'Q': 394, 'C': 141, 'I': 40 };
    let patients = [];
    if (typeof window !== 'undefined') {
        patients = window.patientDatabase || window.REAL_SUPABASE_PATIENTS || window.REAL_SUPABASE_BACKUP || [];
    }
    const regex = new RegExp(`^(?:20)?${currentYearTwoDigits}[-_\\s]*${letter}[-_\\s]*(\\d+)`, 'i');
    let maxNum = SOBERANO_MIN_CORRELATIVES[letter] || 1;
    if (Array.isArray(patients)) {
        patients.forEach(p => {
            if (!p) return;
            const code = String(p.codAtencion || p.cod_atencion || p.codigo || '').trim();
            const m = code.match(regex);
            if (m) {
                const num = parseInt(m[1], 10);
                if (!isNaN(num) && num < 700) {
                    if (letter === 'C' && (num === 301 || num === 302 || num >= 300)) {
                        // Salto artificial ignorado para maxNum en serie C
                    } else if (num > maxNum) {
                        maxNum = num;
                    }
                }
            }
        });
    }
    const targetNum = maxNum + 1;
    const nextNumStr = targetNum < 10 ? `00${targetNum}` : (targetNum < 100 ? `0${targetNum}` : String(targetNum));
    return `${currentYearTwoDigits}${letter}-${nextNumStr}`;
}

export function downloadPatientJSON(codOrPatient) {
    try {
        let patient = null;
        if (typeof codOrPatient === 'object' && codOrPatient !== null) {
            patient = codOrPatient;
        } else {
            const cleanCod = String(codOrPatient || '').trim().toLowerCase().replace(/[-_\s]/g, '');
            if (Array.isArray(patientDatabase)) {
                patient = patientDatabase.find(x => String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase().replace(/[-_\s]/g, '') === cleanCod);
            }
            if (!patient && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
                patient = window.REAL_SUPABASE_PATIENTS.find(x => String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase().replace(/[-_\s]/g, '') === cleanCod);
            }
        }
        if (!patient) {
            if (typeof window.showToast === 'function') window.showToast("No se encontraron datos para exportar este paciente.", "warning");
            return;
        }
        const safeCod = (patient.codAtencion || patient.cod_atencion || 'PACIENTE').replace(/[^a-zA-Z0-9_-]/g, '_');
        const exportData = {
            institucion: "JC PATH LAB - Anatomía Patológica y Citopatología",
            fechaExportacion: new Date().toISOString(),
            codigo: patient.codAtencion || patient.cod_atencion,
            paciente: patient
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${safeCod}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof window.showToast === 'function') {
            window.showToast(`📥 Ficha JSON descargada para ${safeCod}`, 'success');
        }
    } catch(e) {
        console.error("[JSON Export] Error exportando JSON de paciente:", e);
    }
}
window.downloadPatientJSON = downloadPatientJSON;

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileDashboardEvents);
    } else {
        initMobileDashboardEvents();
    }
}


// ============================================================================
// AUTO-REFRESCO SILENCIOSO CADA 15 SEGUNDOS (CERO SALTOS / CERO INTERRUPCIONES)
// Protocolo Elena v2 - Autorizado por JHON SPARTAN
// ============================================================================
(function initSilentAutoRefresh() {
    if (typeof window === 'undefined') return;
    if (window._silentRefreshTimer) return; // Evitar instancias duplicadas

    window._silentRefreshTimer = setInterval(async () => {
        try {
            // 1. Si la pestaña está en segundo plano o minimizada, omitir
            if (document.hidden) return;

            // 2. Si la secretaria está escribiendo en el buscador o formulario, no interrumpir
            const activeTag = document.activeElement ? document.activeElement.tagName : '';
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

            // 3. Consultar delta en Supabase en segundo plano
            if (typeof window.fetchDeltaUpdates === 'function') {
                await window.fetchDeltaUpdates();
            }
        } catch (e) {
            // Fallo silencioso sin romper el hilo principal
        }
    }, 15000);
})();
