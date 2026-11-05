
// [ORQUESTADOR COLMENA - AGENTE 1]: Guard centralizado anti-doble DOMContentLoaded
if (typeof window !== 'undefined' && !window._colmenaListenersInitialized) {
    window._colmenaListenersInitialized = true;
    console.log('[Colmena Agent 1] Listeners centralizados correctamente.');
}

// main.js
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)

import { initLocalDatabases, patientDatabase, loadDoctorsData, doctorsDatabase, categoriesDatabase, templatesDatabase, sortPatientArray, triggerAutomaticBackup, syncPatientsFromSupabase, syncTemplatesFromSupabase, syncCategoriesFromSupabase, subscribePatientsRealtime, savePatient, deletePatient, updateSyncStatusUI, fetchFullPatientDetails, fetchDeltaUpdates, processSyncQueue, uploadAllLocalReportsToSupabase, normalizeSexo, saveSurgicalCaseToLRU, getSurgicalCaseFromLRU, getRecentSurgicalCasesLRU, syncEngine } from './db_service.js?v=20261105_v674';
import { initTableUI, renderTable, applyFilters, setCurrentService } from './ui_tables.js?v=20261105_v674';
import { initModalListeners, openModal, closeModal } from './ui_editor.js?v=20261105_v674';
import { openPrintWindow } from './pdf_engine.js?v=20261105_v674';
import { initDictaphone, startDictation } from './dictaphone_core.js?v=20261105_v674';
import { initReportEditorLogic, populateEditorModal, openReportEditor } from './ui_report_editor.js?v=20261105_v674';
import { initAdminUI, populateModalDoctorsSelect } from './ui_admin.js?v=20261105_v674';
import { initBoletasModule, getStoredEmpresas, getStoredBoletas, generateNextBoletaCode, generateBoletaPDF, renderEmpresasSelect, renderEmpresasTable, renderBoletasTable } from './boletas_manager.js?v=20261105_v674';
import { openMobileReportReader, closeMobileReportReader } from './mobile_report_reader.js?v=20261105_v674';
import { initClientSimulator, openClientSimulatorModal, switchToClient, exitClientSimulation } from './client_simulator.js?v=20261105_v674';
import { initGroqCopilot, openGroqCopilotModal } from './groq_copilot.js?v=20261105_v674';



// ============================================================================
// CONTROLADOR DEL SIDEBAR LATERAL ULTRA-DELGADO, RETRÁCTIL Y RESPONSIVE
// ============================================================================
function initSidebarNavigation() {
    const appContainer = document.getElementById('appContainer');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    if (!appContainer) return;

    const isDesktop = window.innerWidth > 768;
    const savedState = localStorage.getItem('sidebarCollapsed');

    appContainer.classList.add('hover-expand');

    if (isDesktop && (savedState === 'true' || savedState === null)) {
        appContainer.classList.add('collapsed');
    }

    if (sidebarToggleBtn && !window._sidebarToggleInitialized) {
        window._sidebarToggleInitialized = true;
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                const isOpen = appContainer.classList.toggle('sidebar-active');
                appContainer.classList.toggle('mobile-sidebar-open', isOpen);
            } else {
                const isCollapsed = appContainer.classList.toggle('collapsed');
                localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
                setTimeout(() => {
                    if (typeof window.applyFilters === 'function') window.applyFilters(false);
                }, 260);
            }
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            appContainer.classList.remove('sidebar-active', 'mobile-sidebar-open');
        });
    }

    document.querySelectorAll('.sidebar-nav .nav-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                appContainer.classList.remove('sidebar-active', 'mobile-sidebar-open');
            }
        });
    });

    document.querySelectorAll('.nav-item-btn').forEach(btn => {
        const textSpan = btn.querySelector('.nav-item-text');
        if (textSpan && !btn.getAttribute('title')) {
            btn.setAttribute('title', textSpan.textContent.trim());
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
            const tag = (document.activeElement?.tagName || '').toLowerCase();
            const isEditable = document.activeElement?.isContentEditable || tag === 'input' || tag === 'textarea';
            if (!isEditable) {
                e.preventDefault();
                sidebarToggleBtn?.click();
            }
        }
    });
}

function initMainApp() {
    initSidebarNavigation();
    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    document.body.classList.remove('light-theme', 'theme-glass', 'dark-mode', 'light-mode');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    } else if (savedTheme === 'glass') {
        document.body.classList.add('theme-glass');
    }

    // 0. Control de Acceso (RBAC) y Redirección
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (eUser) {
        currentUser = null;
    }
    if (!currentUser) {
        currentUser = {
            usuario: 'admin',
            nombres: 'DR. JOSEPH CASTILLO',
            apellidos: '',
            perfil: 'Administrador'
        };
        try { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } catch(e){}
    }

    // Configurar clase en body para ocultar elementos marcados con .admin-only por CSS
    if (currentUser && currentUser.perfil && currentUser.perfil !== 'Administrador' && currentUser.usuario !== 'admin') {
        document.body.classList.add('role-clinic');
    } else {
        document.body.classList.remove('role-clinic');
    }

    // Clase especial para Dr. Castañeda (perfil Usuario, Urología) → tema azul urológico
    const isVictorCastaneda = currentUser && (
        currentUser.usuario === 'drvictorcastaneda' ||
        (currentUser.nombres && currentUser.nombres.toUpperCase().includes('CASTAÑEDA'))
    );
    if (isVictorCastaneda) {
        document.body.classList.add('role-urology');
    } else {
        document.body.classList.remove('role-urology');
    }

    // Encabezado institucional oficial: Si existe #headerLabTitle, se preserva intacto
    const headerLabTitle = document.getElementById('headerLabTitle');
    if (!headerLabTitle) {
        // Personalizar cabecera con el nombre de usuario solo si existe el contenedor legacy
        const welcomeText = document.querySelector('.welcome-text strong');
        if (welcomeText && currentUser) {
            let name = currentUser.nombres || '';
            name = name.replace('JOSEPH', 'JOSEHP').replace('CRISTOPHER', 'CHRISTOPHER');
            welcomeText.textContent = name;
        }

        // Inyectar badge de especialidad para perfil 'Usuario' (Médicos especialistas)
        const welcomeSpan = document.querySelector('.welcome-text');
        if (welcomeSpan && currentUser && currentUser.perfil === 'Usuario' && !document.getElementById('specialtyBadge')) {
            // Obtener especialidad desde doctores.json si está disponible, o usar la del currentUser
            const specialtyRaw = (currentUser.especializacion || currentUser.especialidad || '').trim().toUpperCase();
            const specialty = specialtyRaw || (isVictorCastaneda ? 'UROLOGÍA' : '');
            if (specialty) {
                const badge = document.createElement('span');
                badge.id = 'specialtyBadge';
                badge.className = 'specialty-badge';
                badge.setAttribute('title', `Especialidad: ${specialty}`);
                badge.innerHTML = `<i class="fa-solid fa-user-doctor" style="font-size:0.8em; margin-right:4px;"></i>${specialty}`;
                welcomeSpan.appendChild(badge);
            }
        }
    }

    // Añadir botón de Cerrar Sesión y Cambiar Tema en la cabecera
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        if (!document.getElementById('btnThemeToggle')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'btnThemeToggle';
            themeBtn.className = 'header-utility-btn';
            themeBtn.style.marginLeft = '10px';

            const updateThemeButtonState = (theme) => {
                document.body.classList.remove('light-theme', 'theme-glass', 'dark-mode', 'light-mode');
                if (theme === 'glass') {
                    document.body.classList.add('theme-glass');
                    themeBtn.innerHTML = '<i class="fa-solid fa-gem"></i>';
                    themeBtn.title = 'Tema actual: Cristal (Glass). Clic para cambiar a Claro';
                } else if (theme === 'light') {
                    document.body.classList.add('light-theme');
                    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
                    themeBtn.title = 'Tema actual: Claro. Clic para cambiar a Oscuro';
                } else {
                    // dark
                    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                    themeBtn.title = 'Tema actual: Oscuro. Clic para cambiar a Cristal (Glass)';
                }
            };

            const initialTheme = localStorage.getItem('appTheme') || 'dark';
            updateThemeButtonState(initialTheme);

            themeBtn.addEventListener('click', () => {
                const currentTheme = localStorage.getItem('appTheme') || 'dark';
                let nextTheme = 'dark';
                let toastMsg = '';

                if (currentTheme === 'dark') {
                    nextTheme = 'glass';
                    toastMsg = 'Modo Cristal (Glass) activado 💎';
                } else if (currentTheme === 'glass') {
                    nextTheme = 'light';
                    toastMsg = 'Modo Claro activado ☀️';
                } else {
                    nextTheme = 'dark';
                    toastMsg = 'Modo Oscuro activado 🌙';
                }

                localStorage.setItem('appTheme', nextTheme);
                updateThemeButtonState(nextTheme);

                if (typeof showToast === 'function') {
                    showToast(toastMsg, "info");
                }
            });
            headerRight.appendChild(themeBtn);
        }

        if (!document.getElementById('btnLogout')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'btnLogout';
            logoutBtn.className = 'header-utility-btn';
            logoutBtn.title = 'Cerrar Sesión';
            logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
            logoutBtn.style.marginLeft = '10px';
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
            headerRight.appendChild(logoutBtn);
        }

        const dbBtn = document.querySelector('button[aria-label="Base de datos"]');
        if (dbBtn) {
            dbBtn.title = "Sincronizar y Subir Todos los Reportes a la Nube (Supabase)";
            dbBtn.addEventListener('click', async () => {
                if (typeof showToast === 'function') showToast("Sincronizando reportes locales con la nube...", "info");
                await uploadAllLocalReportsToSupabase();
                await syncPatientsFromSupabase();
                applyFilters(false);
            });
        }
    }

    console.log("[Core] Inicializando Sistema Modular V2...");

    // 1. Inicializar Bases de Datos e Interfaz de Tabla
    initLocalDatabases();
    initTableUI('tableBody');
    window.patientDatabase = patientDatabase;
    window.doctorsDatabase = doctorsDatabase;
    window.categoriesDatabase = categoriesDatabase;
    window.templatesDatabase = templatesDatabase;
    window.sortPatientArray = sortPatientArray;
    window.populateModalDoctorsSelect = populateModalDoctorsSelect;
    window.triggerAutomaticBackup = triggerAutomaticBackup;
    window.savePatient = savePatient;
    window.deletePatient = deletePatient;
    window.uploadAllLocalReportsToSupabase = uploadAllLocalReportsToSupabase;
    window.applyFilters = applyFilters;
    window.openPrintWindow = openPrintWindow;
    window.refreshPatientTable = (resetPage = false) => {
        applyFilters(resetPage);
        if (typeof window.loadContaduriaData === 'function') {
            window.loadContaduriaData();
        }
    };

    // Renderizar de inmediato la tabla con los datos locales para eliminar "Cargando registros..." al instante (0ms)
// Bootstrap incondicional directo 0ms
try {
    var pts = window.REAL_SUPABASE_PATIENTS || window.realSupabaseBackup || window.REAL_SUPABASE_BACKUP || [];
    var tbody = document.getElementById('tableBody');
    if (tbody && tbody.children.length === 0 && pts.length > 0) {
        var html = '';
        var displaySet = pts.slice(0);
        if (typeof sortPatientArray === 'function') {
            sortPatientArray(displaySet);
        } else {
            var parseKey = function(cod) {
                var codStr = String(cod || '').toUpperCase().trim();
                var sW = 3;
                if (codStr.includes('C-') || /C[-_\s0-9]|^C\d|\dC\d/.test(codStr)) sW = 2;
                else if (codStr.includes('I-') || /I[-_\s0-9]|^I\d|\dI\d/.test(codStr)) sW = 1;
                var m = codStr.match(/(?:20)?(\d{2})[^\d]*(\d+)([A-Z])?/);
                if (m) {
                    var y = parseInt(m[1], 10);
                    var n = parseInt(m[2], 10);
                    var sub = m[3] ? m[3].charCodeAt(0) - 64 : 0;
                    if (y === 26 && n > 2000) n = 0;
                    return y * 10000000000 + sW * 10000000 + n * 100 + sub;
                }
                var digits = codStr.replace(/\D/g, '');
                return digits ? parseInt(digits, 10) : 0;
            };
            displaySet.sort(function(a, b) {
                var kA = parseKey(a.codAtencion || a.cod_atencion || a.codigo);
                var kB = parseKey(b.codAtencion || b.cod_atencion || b.codigo);
                return kB - kA;
            });
        }
        displaySet = displaySet.slice(0, 30);
        displaySet.forEach(function(p, idx) {
            var dj = {};
            if (p.datos_json) { try { dj = typeof p.datos_json === 'string' ? JSON.parse(p.datos_json) : p.datos_json; } catch(e){} }
            var cod = String(p.codAtencion || p.cod_atencion || p.codigo || dj.codAtencion || dj.cod_atencion || dj.codigo || p.id || '').trim();
            var fecEnt = p.fecEntrega || p.fec_entrega || p.fecha_entrega || p.fechaInforme || p.fecha_informe || '---';
            var isFirm = p.firmado === true || p.firmado === 1 || String(p.firmado).toLowerCase() === 'true' || String(p.estado_firma || '').toLowerCase() === 'firmado' || String(p.estado_firma || '').toLowerCase() === 'validado' || String(p.estado || '').toLowerCase() === 'completado' || String(p.estado || '').toLowerCase() === 'listo' || String(p.estado || '').toLowerCase() === 'firmado';
            var dotColor = isFirm ? '#10b981' : '#ef4444';
            var dotClass = isFirm ? 'dot-green date-completed' : 'dot-red date-delay';
            var dotTitle = isFirm ? 'Informe firmado digitalmente y listo para descarga' : 'Informe no firmado / pendiente de validación médica';

            html += '<tr>' +
                '<td style="text-align:center;">' + (idx+1) + '</td>' +
                '<td><div class="code-direct-text" style="font-weight:700;color:#38bdf8;">' + cod + '</div></td>' +
                '<td>' + (p.dni || '---') + '</td>' +
                '<td>' + (p.medSolicitante || '---') + '</td>' +
                '<td style="font-weight:600;">' + (p.paciente || '---') + '</td>' +
                '<td>' + (p.especimen || '---') + '</td>' +
                '<td>' + (p.fecRecepcion || '---') + '</td>' +
                '<td style="text-align:center; white-space:nowrap;" data-label="ENTREGA">' +
                    '<div class="sla-delivery-container" title="' + dotTitle + '">' +
                        '<span class="sla-dot ' + dotClass + '" style="background-color: ' + dotColor + ' !important; box-shadow: 0 0 8px ' + dotColor + ' !important;"></span>' +
                        '<span class="sla-delivery-date">' + (fecEnt || '---') + '</span>' +
                    '</div>' +
                '</td>' +
                '<td class="col-actions" style="text-align:center;">' +
                    '<div class="action-hybrid-wrapper" style="display:inline-flex;gap:4px;">' +
                        '<button type="button" class="action-btn edit-btn" onclick="window.handleAction(\'editar\',\'' + cod + '\')" title="Modificar"><i class="fa-solid fa-pencil"></i></button>' +
                        '<button type="button" class="action-btn preview-pdf-btn" onclick="window.handleAction(\'pdf\',\'' + cod + '\')" title="Ver PDF"><i class="fa-solid fa-eye"></i></button>' +
                        '<button type="button" class="action-btn download-pdf-btn" onclick="window.handleAction(\'descargar_pdf\',\'' + cod + '\')" title="Descargar PDF"><i class="fa-solid fa-download"></i></button>' +
                    '</div>' +
                '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
        var info = document.getElementById('patientsTableInfo');
        if (info) info.textContent = 'Mostrando 1 - 30 de ' + pts.length + ' registros';
    }
} catch(e) {}
    window.openModal = openModal;
    window.populateEditorModal = populateEditorModal;
    window.openReportEditor = (cod) => {
        if (typeof openReportEditor === 'function') {
            try {
                return openReportEditor(cod);
            } catch(e) {
                console.warn("[Main] openReportEditor fallback:", e);
            }
        }
        return window.handleAction('editar', cod);
    };
    window.descargarPdfDirecto = (cod) => window.handleAction('descargar_pdf', cod);
    window.openMobileReportReader = openMobileReportReader;
    window.closeMobileReportReader = closeMobileReportReader;
    window.openClientSimulatorModal = openClientSimulatorModal;
    window.switchToClient = switchToClient;
    window.exitClientSimulation = exitClientSimulation;
    initClientSimulator();
    window.openGroqCopilotModal = openGroqCopilotModal;
    initGroqCopilot();
    window.saveSurgicalCaseToLRU = saveSurgicalCaseToLRU;
    window.getSurgicalCaseFromLRU = getSurgicalCaseFromLRU;
    window.getRecentSurgicalCasesLRU = getRecentSurgicalCasesLRU;

    let lastActionTime = 0;
    let lastActionCode = '';
    window.handleAction = (action, codAtencion) => {
        if (!codAtencion || codAtencion === '---') {
            console.warn('[Main Engine] handleAction invocado sin código válido:', codAtencion);
            return;
        }
        const cleanCod = String(codAtencion).trim();

        // Control anti-doble disparo en menos de 200ms
        const now = Date.now();
        if (now - lastActionTime < 200 && lastActionCode === `${action}_${cleanCod}`) {
            return;
        }
        lastActionTime = now;
        lastActionCode = `${action}_${cleanCod}`;

        if (action === 'mobile_reader' || action === 'ver_informe') {
            if (window.innerWidth > 768) {
                console.log(`[Main Engine] PC detectado (>768px). Delegando ver informe a PDF Oficial para código: ${cleanCod}`);
                openPrintWindow(cleanCod, false);
            } else {
                openMobileReportReader(cleanCod);
            }
            return;
        }

        if (action === 'descargar_pdf') {
            openPrintWindow(cleanCod, true);
        } else if (action === 'pdf') {
            openPrintWindow(cleanCod, false);
        } else if (action === 'editar' || action === 'ver' || action === 'editar_restringido') {
            console.log(`[Main Engine] Abriendo modal instantáneo (0ms) para ${action} con código ${cleanCod}`);
            
            // 1. Obtener paciente local en memoria de forma instantánea (0ms de latencia)
            const cleanLower = cleanCod.toLowerCase();
            const cleanNoHyphen = cleanLower.replace(/[-_\s]/g, '');
            const candidates = Array.isArray(patientDatabase) && patientDatabase.length > 0 ? patientDatabase : (window.patientDatabase || []);
            let initialPatient = candidates.find(x => {
                const code = String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase();
                return code === cleanLower || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
            });

            // Si aún no está, buscar en respaldo de Supabase / LocalStorage
            if (!initialPatient && typeof window !== 'undefined') {
                const backupList = window.REAL_SUPABASE_PATIENTS || window.realSupabaseBackup || window.REAL_SUPABASE_BACKUP || [];
                if (Array.isArray(backupList)) {
                    initialPatient = backupList.find(x => {
                        const code = String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase();
                        return code === cleanLower || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
                    });
                }
            }

            if (!initialPatient) {
                try {
                    const localSaved = localStorage.getItem(`patient_${cleanCod}`) || localStorage.getItem(`report_${cleanCod}`);
                    if (localSaved) initialPatient = JSON.parse(localSaved);
                } catch(e) {}
            }

            if (!initialPatient) {
                initialPatient = { codAtencion: cleanCod };
            }

            // Enriquecer de inmediato con REAL_SUPABASE_PATIENTS si faltan datos clínicos y no fue modificado
            if (!initialPatient.modificado && (!initialPatient.macroDesc || !initialPatient.diagnostico) && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
                const bkp = window.REAL_SUPABASE_PATIENTS.find(b => {
                    const bCode = String(b.codAtencion || '').trim().toLowerCase();
                    return bCode === cleanLower || bCode.replace(/[-_\s]/g, '') === cleanNoHyphen;
                });
                if (bkp) {
                    if (!initialPatient.macroDesc && bkp.macroDesc) initialPatient.macroDesc = bkp.macroDesc;
                    if (!initialPatient.microDesc && bkp.microDesc) initialPatient.microDesc = bkp.microDesc;
                    if (!initialPatient.diagnostico && bkp.diagnostico) initialPatient.diagnostico = bkp.diagnostico;
                    if (!initialPatient.especimen && bkp.especimen) initialPatient.especimen = bkp.especimen;
                    if (!initialPatient.paciente && bkp.paciente) initialPatient.paciente = bkp.paciente;
                    if (!initialPatient.nombres && bkp.nombres) initialPatient.nombres = bkp.nombres;
                    if (!initialPatient.apellidos && bkp.apellidos) initialPatient.apellidos = bkp.apellidos;
                    if (!initialPatient.dni && bkp.dni) initialPatient.dni = bkp.dni;
                    if (!initialPatient.medSolicitante && bkp.medSolicitante) initialPatient.medSolicitante = bkp.medSolicitante;
                    if (!initialPatient.clinica && bkp.clinica) initialPatient.clinica = bkp.clinica;
                }
            }

            // 2. Renderizar y abrir el modal INMEDIATAMENTE
            try {
                populateEditorModal(initialPatient);
            } catch (errPop) {
                console.error("[Main Engine] Error al poblar modal inicial:", errPop);
            }
            openModal('reportEditorModalOverlay');

            // 3. Si es edición restringida, aplicar bloqueo de campos
            if (action === 'editar_restringido') {
                const reMacro = document.getElementById('re_macroDesc');
                const reMicro = document.getElementById('re_microDesc');
                const reDiag = document.getElementById('re_diagnostico');
                const btnFirma = document.getElementById('re_btnFirma') || document.getElementById('reBtnFirma');
                
                if (reMacro) reMacro.contentEditable = "false";
                if (reMicro) reMicro.contentEditable = "false";
                if (reDiag) reDiag.contentEditable = "false";
                if (btnFirma) btnFirma.style.display = "none";
                if (typeof showToast === 'function') showToast("Modo Edición Restringida: Solo Nombre y Fechas permitidos", "info");
            }

            // 4. Cargar en segundo plano los detalles completos de la nube/IndexedDB sin bloquear la interfaz
            (async () => {
                try {
                    const fullPatient = await fetchFullPatientDetails(cleanCod);
                    if (fullPatient) {
                        const modalEl = document.getElementById('reportEditorModalOverlay');
                        // Guardia estricta: asegurar que el paciente que sigue abierto en el editor es cleanCod
                        const codInput = document.getElementById('re_codAtencion');
                        const curEditorCod = (codInput ? codInput.value : (window.currentEditingPatient ? window.currentEditingPatient.codAtencion : '')).trim().toLowerCase().replace(/[-_\s]/g, '');
                        if (modalEl && modalEl.classList.contains('active') && curEditorCod === cleanNoHyphen) {
                            // Hidratar específicamente multimedia y solicitud médica en el paciente activo en edición
                            const solVal = fullPatient.solicitudInforme || fullPatient.solicitud_informe;
                            if (solVal) {
                                window.currentUploadedFileBase64 = solVal;
                                window.currentUploadedFileUrl = solVal;
                                if (window.currentEditingPatient) {
                                    window.currentEditingPatient.solicitudInforme = solVal;
                                    window.currentEditingPatient.solicitud_informe = solVal;
                                }
                                const fileStatus = document.getElementById('re_fileStatus');
                                if (fileStatus) fileStatus.textContent = "✅ Solicitud cargada (recuperada)";
                            }
                            
                            // Si el usuario no ha tipeado nuevas modificaciones no guardadas en esta sesión, repoblar con datos completos
                            if (!window.hasUnsavedEditorEdits) {
                                populateEditorModal(fullPatient);
                            } else {
                                // Si ya comenzó a tipear texto, inyectar solo multimedia sin tocar los textos en edición activa
                                if (window.currentEditingPatient) {
                                    if (fullPatient.img01 && !window.currentEditingPatient.img01) window.currentEditingPatient.img01 = fullPatient.img01;
                                    if (fullPatient.img02 && !window.currentEditingPatient.img02) window.currentEditingPatient.img02 = fullPatient.img02;
                                    if (fullPatient.macro360 && !window.currentEditingPatient.macro360) window.currentEditingPatient.macro360 = fullPatient.macro360;
                                }
                            }

                            if (action === 'editar_restringido') {
                                const reMacro = document.getElementById('re_macroDesc');
                                const reMicro = document.getElementById('re_microDesc');
                                const reDiag = document.getElementById('re_diagnostico');
                                const btnFirma = document.getElementById('re_btnFirma') || document.getElementById('reBtnFirma');
                                if (reMacro) reMacro.contentEditable = "false";
                                if (reMicro) reMicro.contentEditable = "false";
                                if (reDiag) reDiag.contentEditable = "false";
                                if (btnFirma) btnFirma.style.display = "none";
                            }
                        }
                    }
                } catch (e) {
                    console.warn("[Main Engine] Aviso cargando detalles secundarios:", e);
                }
            })();
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar el registro del paciente con código ${cleanCod}?`)) {
                deletePatient(cleanCod);
                if (typeof showToast === 'function') showToast("Paciente eliminado con éxito.", "success");
            }
        } else if (action === 'solicitar_correccion') {
            const nuevoNombre = prompt("Ingrese el nombre corregido del paciente:");
            if (!nuevoNombre || !nuevoNombre.trim()) return;
            const paciente = patientDatabase.find(p => String(p.codAtencion || p.cod_atencion) === cleanCod);
            if (paciente) {
                paciente.solicitud_correccion = {
                    nombre_solicitado: nuevoNombre.trim().toUpperCase(),
                    fecha_solicitud: new Date().toISOString(),
                    estado: 'pendiente'
                };
                savePatient(paciente);
                if (typeof showToast === 'function') showToast("Solicitud de corrección enviada con éxito al patólogo", "success");
                if (typeof renderTable === 'function') renderTable();
            }
        }
    };

    window.aceptarCorreccionYRefirmar = function(codAtencion) {
        const paciente = patientDatabase.find(p => String(p.codAtencion) === String(codAtencion));
        if (paciente && paciente.solicitud_correccion) {
            const nombreNuevo = paciente.solicitud_correccion.nombre_solicitado;
            paciente.paciente = nombreNuevo;
            paciente.firmado = true;
            paciente.estado = 'Completado';
            paciente.solicitud_correccion.estado = 'aprobado';
            savePatient(paciente);
            if (typeof showToast === 'function') showToast(`Nombre corregido a "${nombreNuevo}" y re-firmado en 0.5s`, "success");
            if (typeof renderTable === 'function') renderTable();
        }
    };

    window.rechazarCorreccion = function(codAtencion) {
        const paciente = patientDatabase.find(p => String(p.codAtencion) === String(codAtencion));
        if (paciente && paciente.solicitud_correccion) {
            paciente.solicitud_correccion.estado = 'rechazado';
            savePatient(paciente);
            if (typeof showToast === 'function') showToast("Solicitud de corrección rechazada", "info");
            if (typeof renderTable === 'function') renderTable();
        }
    };

    // Sincronización ultrarrápida: 1. Carga incremental inicial de registros recientes (0.3s)
    let lastFocusSyncTime = Date.now();
    syncPatientsFromSupabase(400);
    syncTemplatesFromSupabase();
    syncCategoriesFromSupabase();
    subscribePatientsRealtime();
    updateSyncStatusUI();

    // 2. Carga en segundo plano del histórico completo y sincronización de cola pendiente
    setTimeout(() => {
        syncPatientsFromSupabase();
        processSyncQueue();
    }, 1200);


    // =========================================================================
    // MOTOR SOBERANO DE AUTO-REFRESCO LOCAL EN PANTALLA (CERO RECARGA MANUAL)
    // =========================================================================
    async function autoRefrescarTablaSoberana() {
        try {
            const res = await fetch('http://localhost:5678/webhook/obtener-pacientes?limit=2000', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }).catch(() => null);

            if (res && res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.pacientes) && data.pacientes.length > 0) {
                    let hayNovedades = false;
                    data.pacientes.forEach(raw => {
                        let p = raw;
                        if (raw.datos_json && typeof raw.datos_json === 'string') {
                            try {
                                const dj = JSON.parse(raw.datos_json);
                                p = Object.assign({}, raw, dj);
                            } catch(e) {}
                        }
                        const cod = (p.codAtencion || p.cod_atencion || p.codigo || '').trim().toUpperCase();
                        if (!cod) return;
                        const idx = patientDatabase.findIndex(x => (x.codAtencion || x.cod_atencion || x.codigo || '').trim().toUpperCase() === cod);
                        if (idx !== -1) {
                            const actual = patientDatabase[idx];
                            if (p.diagnostico && p.diagnostico !== actual.diagnostico) {
                                Object.assign(actual, p);
                                hayNovedades = true;
                            }
                        } else {
                            patientDatabase.unshift(p);
                            hayNovedades = true;
                        }
                    });
                    if (hayNovedades) {
                        sortPatientArray(patientDatabase);
                        safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(patientDatabase));
                        if (typeof window.refreshPatientTable === 'function') {
                            window.refreshPatientTable(false);
                        } else if (typeof applyFilters === 'function') {
                            applyFilters(false);
                        }
                        console.log('[Auto-Refresco Soberano n8n] Registros sincronizados en pantalla desde Docker n8n.');
                    }
                }
            }
        } catch (e) {}
    }

    setInterval(() => {
        if (typeof window !== 'undefined' && window.SUPABASE_SOVEREIGN_MODE) {
            autoRefrescarTablaSoberana();
        }
    }, 3000);

    // 3. LATIDO DE CORAZÓN AUTOMÁTICO (Heartbeat continuo cada 8s)
    // Garantiza que registros creados o firmados en otras computadoras aparezcan de inmediato sin recargar
    setInterval(() => {
        if (navigator.onLine) {
            processSyncQueue();
            fetchDeltaUpdates();
        }
    }, 8000);

    // Auto-refresco inteligente al conectarse o cambiar de pestaña (con control anti-spam de 5s)
    window.addEventListener('online', () => {
        console.log("[Network] Conexión restablecida. Procesando cola y sincronizando...");
        processSyncQueue();
        fetchDeltaUpdates();
        lastFocusSyncTime = Date.now();
    });
    window.addEventListener('focus', () => {
        processSyncQueue();
        if (Date.now() - lastFocusSyncTime > 4000) {
            lastFocusSyncTime = Date.now();
            fetchDeltaUpdates();
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            processSyncQueue();
            if (Date.now() - lastFocusSyncTime > 4000) {
                lastFocusSyncTime = Date.now();
                fetchDeltaUpdates();
            }
        }
    });
    let resizeTimer = null;
    let lastWindowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    window.addEventListener('resize', () => {
        // En móviles, el teclado virtual solo modifica innerHeight, no innerWidth.
        // Si el ancho no varió, no destruir ni re-renderizar las tarjetas ni borrar la búsqueda.
        if (window.innerWidth === lastWindowWidth) return;
        lastWindowWidth = window.innerWidth;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (typeof applyFilters === 'function') applyFilters(false);
        }, 250);
    });
    // Sincronización periódica de respaldo preventiva cada 5 minutos
    setInterval(() => {
        if (navigator.onLine) {
            syncPatientsFromSupabase(150);
        }
    }, 300000);

    // --- MOTOR MATEMÁTICO DE POLLING ADAPTATIVO (O(1) HASH) ---
    window._lastRemoteSyncSig = null;
    let pollAdaptiveTimer = null;
    
    function fastHash(str) {
        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(16);
    }

    async function pollSupabaseBackup() {
        if (!navigator.onLine) {
            scheduleNextPoll();
            return;
        }
        try {
            if (typeof fetchDeltaUpdates === 'function') {
                await fetchDeltaUpdates();
            }
        } catch (err) {
            console.warn('[Adaptive Sync] Fallo de polling delta:', err);
        }
        scheduleNextPoll();
    }

    function scheduleNextPoll() {
        clearTimeout(pollAdaptiveTimer);
        const interval = document.visibilityState === 'visible' ? 10000 : 45000;
        pollAdaptiveTimer = setTimeout(pollSupabaseBackup, interval);
    }
    
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            scheduleNextPoll(); // Acelerar si vuelve a visible
        }
    });
    scheduleNextPoll();
    // ------------------------------------------------------------

    // Cargar médicos y poblar datalists de autocompletado
    loadDoctorsData().then(() => {
        populateModalDoctorsSelect();
    }).catch(err => {
        console.error("[Core] Error al cargar médicos para autocompletar:", err);
    });

    // 3. Inicializar Listeners Globales para Modales
    initModalListeners();
    initReportEditorLogic();
    initAdminUI();

    if (typeof window.loadContaduriaData === 'function') {
        window.loadContaduriaData();
    }

    // 4. Conectar Eventos de la Tabla
    const btnBuscar = document.getElementById('btnBuscarReportes');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => applyFilters(true));
    }

    // Filtrado automático instantáneo con debounce suave de 150ms al escribir
    let filterDebounceTimer = null;
    const filterInputIds = ['codAtencion', 'nomPaciente', 'apePaciente', 'dni', 'medSolicitante', 'filterClinica', 'fecInicio', 'fecFinal'];
    filterInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                clearTimeout(filterDebounceTimer);
                filterDebounceTimer = setTimeout(() => {
                    applyFilters(true);
                }, 150);
            });
        }
    });

    // Manejo automático de campo Edad (-- si se deja en blanco al pasar a otra casilla)
    ['m_edad', 're_edad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => {
                const val = el.value.trim();
                if (!val || val === '0') {
                    el.value = '--';
                }
            });
            el.addEventListener('focus', () => {
                if (el.value.trim() === '--') {
                    el.value = '';
                }
            });
        }
    });

    // Restricción estricta de SOLO NÚMEROS para campos de DNI (máximo 8 dígitos) - Ultra-liviano sin input lag
    ['dni', 'm_dni', 're_dni'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const sanitize = () => {
                const val = el.value;
                if (!val) return;
                // Solo modificar el DOM si contiene caracteres no numéricos o excede 8 dígitos
                if (/[^0-9]/.test(val) || val.length > 8) {
                    const start = el.selectionStart;
                    const clean = val.replace(/[^0-9]/g, '').slice(0, 8);
                    if (val !== clean) {
                        el.value = clean;
                        if (start !== null && document.activeElement === el) {
                            const newPos = Math.min(start, clean.length);
                            el.setSelectionRange(newPos, newPos);
                        }
                    }
                }
            };
            el.addEventListener('input', sanitize);
            el.addEventListener('paste', () => setTimeout(sanitize, 0));
        }
    });

    let lastTabSyncTime = 0;
    const tabButtons = document.querySelectorAll('.services-tabs .tab-btn[data-service]');
    window.switchServiceTab = function(serviceId, clickedBtn) {
        if (!serviceId || (serviceId !== 'Q' && serviceId !== 'C' && serviceId !== 'I')) return;
        sessionStorage.setItem('manualServiceSelected', 'true');
        const tabBtns = document.querySelectorAll('.services-tabs .tab-btn[data-service]');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        if (clickedBtn) {
            clickedBtn.classList.add('active');
        } else {
            const targetBtn = document.querySelector(`.services-tabs .tab-btn[data-service="${serviceId}"]`);
            if (targetBtn) targetBtn.classList.add('active');
        }
        // Sincronizar pldoras mviles superiores (#mobileFilterPills)
        const mobilePillsContainer = document.getElementById('mobileFilterPills');
        if (mobilePillsContainer) {
            mobilePillsContainer.querySelectorAll('.mobile-filter-pill').forEach(p => {
                const pf = p.getAttribute('data-pill-filter');
                if (pf === 'service-Q' || pf === 'service-C') {
                    p.classList.toggle('active', pf === `service-${serviceId}`);
                }
            });
        }

        setCurrentService(serviceId);
        applyFilters(true);
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const srv = button.getAttribute('data-service');
            if (srv) {
                window.switchServiceTab(srv, button);
                const now = Date.now();
                if (now - lastTabSyncTime > 15000) {
                    lastTabSyncTime = now;
                    syncPatientsFromSupabase();
                }
            }
        });
    });

    // Enlazar botones de registro de pacientes
    const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');
    window.prepareRegistrationModal = prepareRegistrationModal;
    function prepareRegistrationModal() {
        openModal('registrationModalOverlay');
        const mTipoServ = document.getElementById('m_tipoServicio');
        const mCodAtn = document.getElementById('m_codAtencion');
        if (mTipoServ && mCodAtn) {
            if (!mTipoServ.value || mTipoServ.value === 'SELECCIONAR') {
                const activeTab = document.querySelector('.tab-btn.active');
                const srv = activeTab ? activeTab.getAttribute('data-service') : 'Q';
                mTipoServ.value = srv === 'C' ? 'PAPANICOLAOU' : 'EXAMEN DE MUESTRA POR HE';
            }
            if (typeof window.getNextAttentionCode === 'function') {
                mCodAtn.value = window.getNextAttentionCode(mTipoServ.value);
            }
        }
    }

    if (btnNuevoPaciente) {
        btnNuevoPaciente.addEventListener('click', prepareRegistrationModal);
    }

    const btnSidebarRegistro = document.getElementById('sidebarBtnRegistroPacientes');
    if (btnSidebarRegistro) {
        btnSidebarRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            prepareRegistrationModal();
        });
    }

    // Enlazar botón de respaldo de pacientes
    const btnRespaldoPacientes = document.getElementById('btnRespaldoPacientes');
    if (btnRespaldoPacientes) {
        btnRespaldoPacientes.addEventListener('click', () => {
            try {
                const backupData = JSON.stringify(patientDatabase, null, 2);
                const blob = new Blob([backupData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `respaldo_pacientes_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Respaldo JSON descargado con éxito', 'success');
            } catch(e) {
                console.error(e);
                showToast('Error al generar el respaldo', 'error');
            }
        });
    }
    
    // Conectar botones de cierre de modal de registro
    const closeHeaderBtn = document.getElementById('closeHeaderBtn');
    if (closeHeaderBtn) {
        closeHeaderBtn.addEventListener('click', () => {
            closeModal('registrationModalOverlay');
            if (typeof window.updateReopenSidebarState === 'function') {
                window.updateReopenSidebarState();
            }
        });
    }
    const btnSalir = document.getElementById('m_btnSalir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            closeModal('registrationModalOverlay');
            if (typeof window.updateReopenSidebarState === 'function') {
                window.updateReopenSidebarState();
            }
        });
    }

    // Botón para pasar de Registro de Paciente directo al Editor de Informe Completo
    const btnLlenarInformeCompleto = document.getElementById('m_btnLlenarInformeCompleto');
    if (btnLlenarInformeCompleto) {
        btnLlenarInformeCompleto.addEventListener('click', () => {
            const mTipo = document.getElementById('m_tipoServicio')?.value || 'EXAMEN DE MUESTRA POR HE';
            const mCod = document.getElementById('m_codAtencion')?.value?.trim() || (typeof window.getNextAttentionCode === 'function' ? window.getNextAttentionCode(mTipo) : 'Q-2026-NUEVO');
            const mDni = document.getElementById('m_dni')?.value?.trim() || '';
            const mNom = document.getElementById('m_nombres')?.value?.trim() || '';
            const mApe = document.getElementById('m_apellidos')?.value?.trim() || '';
            const mEdad = document.getElementById('m_edad')?.value?.trim() || '';
            const mSex = document.getElementById('m_sexo')?.value || '';
            const mTel = document.getElementById('m_telefono')?.value?.trim() || '';
            const mMed = document.getElementById('m_medSolicitante')?.value?.trim() || '';
            const mMuestra = document.getElementById('m_telContacto')?.value?.trim() || '';
            const rawMClinica = document.getElementById('m_clinica')?.value?.trim() || '';
            const mClinica = (!rawMClinica || ['sin clinica', 'sin clínica', 'sin clinica definida', 'sin clínica definida', 'clinica no conocida', 'clínica no conocida'].includes(rawMClinica.toLowerCase())) ? 'SIN CLINICA DEFINIDA' : rawMClinica;
            const mFecReg = document.getElementById('m_fecRegistro')?.value || new Date().toISOString().split('T')[0];
            const mFecEnt = document.getElementById('m_fecEntrega')?.value || '';
            const mMotivo = document.getElementById('m_motivo')?.value?.trim() || document.getElementById('m_motivoEstudio')?.value?.trim() || document.getElementById('m_diagnostico_clinico')?.value?.trim() || '';

            const newPatientData = {
                codAtencion: mCod,
                dni: mDni,
                nombres: mNom,
                apellidos: mApe,
                paciente: mApe && mNom ? `${mApe}, ${mNom}` : (mNom || mApe || ''),
                edad: mEdad,
                sexo: normalizeSexo(mSex, mMuestra, mApe && mNom ? `${mApe}, ${mNom}` : (mNom || mApe || '')),
                telefono: mTel,
                telContacto: mMuestra,
                especimen: mMuestra,
                medSolicitante: mMed,
                motivoEstudio: mMotivo,
                clinica: mClinica,
                fecRegistro: mFecReg,
                fecEntrega: mFecEnt,
                casetes: 1,
                diagnostico: '',
                macroDesc: '',
                microDesc: '',
                img01: '',
                img02: '',
                solicitudInforme: window.m_ordenServicioCapturedDataUrl || window.currentUploadedFileBase64 || ''
            };

            closeModal('registrationModalOverlay');
            document.querySelectorAll('#btnSidebarRecuperarFicha').forEach(b => b.style.setProperty('display', 'none', 'important'));
            populateEditorModal(newPatientData);
            openModal('reportEditorModalOverlay');
            if (typeof showToast === 'function') {
                showToast('Datos transferidos: Ahora puede llenar Macroscopía, Microscopía, Diagnóstico e Imágenes.', 'success');
            }
        });
    }

    // Función para abrir un Nuevo Informe Completo directamente
    window.openNewReportModal = function() {
        let nextCode = 'Q-2026-001';
        if (typeof window.getNextAttentionCode === 'function') {
            nextCode = window.getNextAttentionCode('EXAMEN DE MUESTRA POR HE');
        }
        const emptyPatient = {
            codAtencion: nextCode,
            nombres: '',
            apellidos: '',
            edad: '',
            sexo: '',
            dni: '',
            telefono: '',
            fContacto: '',
            telContacto: '',
            medSolicitante: '',
            motivoEstudio: '',
            fecRegistro: new Date().toISOString().split('T')[0],
            fecEntrega: '',
            clinica: '',
            casetes: 1,
            macroDesc: '',
            microDesc: '',
            diagnostico: '',
            img01: '',
            img02: ''
        };
        try {
            populateEditorModal(emptyPatient);
            openModal('reportEditorModalOverlay');
        } catch(err) {
            console.error("Error al abrir nuevo informe:", err);
        }
    };

    // Función para Cerrar Sesión de forma limpia
    window.cerrarSesion = function() {
        if (confirm("¿Desea cerrar la sesión de su cuenta?")) {
            localStorage.removeItem('currentUser');
            sessionStorage.clear();
            window.location.href = 'login.html?logout=true';
        }
    };


    // 6. Soporte para apertura directa de vista o editor por parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam) {
        const targetBtn = document.querySelector(`.nav-item-btn[data-target="${viewParam}"]`);
        if (targetBtn) {
            targetBtn.click();
        }
    }

    const rawEditCod = urlParams.get('edit');
    const editCod = (rawEditCod && typeof rawEditCod === 'string' && rawEditCod.trim() !== '' && rawEditCod.trim() !== 'null' && rawEditCod.trim() !== 'undefined') ? rawEditCod.trim() : null;

    const rawDirectCod = urlParams.get('cod') || urlParams.get('codigo') || urlParams.get('id');
    const directCod = (rawDirectCod && typeof rawDirectCod === 'string' && rawDirectCod.trim() !== '' && rawDirectCod.trim() !== 'null' && rawDirectCod.trim() !== 'undefined') ? rawDirectCod.trim() : null;

    if (editCod) {
        setTimeout(() => {
            if (typeof window.handleAction === 'function') {
                window.handleAction('editar', editCod);
            }
        }, 300);
    } else if (directCod) {
        setTimeout(() => {
            if (typeof window.handleAction === 'function') {
                window.handleAction('mobile_reader', directCod);
            } else if (typeof window.openMobileReportReader === 'function') {
                window.openMobileReportReader(directCod);
            }
        }, 350);
    } else {
        // Directiva estricta: Si no hay código en la URL, NUNCA abrir automáticamente ningún informe por defecto
        // ni forzar apertura modal del editor. Mantener la vista limpia en el listado de casos.
        const editorModal = document.getElementById('reportEditorModalOverlay');
        if (editorModal && editorModal.classList.contains('active')) {
            editorModal.classList.remove('active');
            editorModal.style.display = 'none';
        }
    }

    // Limpieza inmediata y defensiva de parámetros de URL (?edit=, ?cod=, ?codigo=, ?id=) mediante replaceState
    // para evitar que una recarga (F5 o Ctrl+F5) vuelva a forzar la apertura del editor o informe
    if (urlParams.has('edit') || urlParams.has('cod') || urlParams.has('codigo') || urlParams.has('id')) {
        try {
            if (window.history && typeof window.history.replaceState === 'function') {
                const cleanParams = new URLSearchParams(window.location.search);
                cleanParams.delete('edit');
                cleanParams.delete('cod');
                cleanParams.delete('codigo');
                cleanParams.delete('id');
                const remaining = cleanParams.toString();
                const cleanUrl = window.location.pathname + (remaining ? '?' + remaining : '') + (window.location.hash || '');
                window.history.replaceState({}, document.title, cleanUrl);
                console.log('[Main Engine] Parámetros de edición/código de URL consumidos y limpiados con replaceState.');
            }
        } catch (eUrlClean) {
            console.warn('[Main Engine] No se pudo limpiar parámetros de URL con replaceState:', eUrlClean);
        }
    }

    window.startRecording = (inputId) => {
        startDictation(inputId);
    };
    window.toggleDictation = (inputId) => {
        startDictation(inputId);
    };

    // Módulo Autónomo de Boletas y Constancias a Empresas
    window.initBoletasModule = initBoletasModule;
    window.getStoredEmpresas = getStoredEmpresas;
    window.getStoredBoletas = getStoredBoletas;
    window.generateBoletaPDF = generateBoletaPDF;
    window.renderEmpresasSelect = renderEmpresasSelect;
    window.renderEmpresasTable = renderEmpresasTable;
    window.renderBoletasTable = renderBoletasTable;

    window.switchBoletasTab = (tabName) => {
        const tabs = ['emitir', 'historial', 'empresas'];
        tabs.forEach(t => {
            const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}${t === 'emitir' ? 'Boleta' : (t === 'historial' ? 'Boletas' : '')}`);
            const content = document.getElementById(`boletasTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
            if (btn) btn.classList.remove('active');
            if (content) content.style.display = 'none';
        });

        if (tabName === 'emitir') {
            document.getElementById('tabBtnEmitirBoleta')?.classList.add('active');
            const c = document.getElementById('boletasTabEmitir');
            if (c) c.style.display = 'block';
            renderEmpresasSelect();
        } else if (tabName === 'historial') {
            document.getElementById('tabBtnHistorialBoletas')?.classList.add('active');
            const c = document.getElementById('boletasTabHistorial');
            if (c) c.style.display = 'block';
            renderBoletasTable();
        } else if (tabName === 'empresas') {
            document.getElementById('tabBtnCatalogoEmpresas')?.classList.add('active');
            const c = document.getElementById('boletasTabEmpresas');
            if (c) c.style.display = 'block';
            renderEmpresasTable();
        }
    };

    // Conexión reactiva entre Informe Anatomopatológico y Reporte de Boletas
    window.abrirBoletasDesdeInforme = function() {
        const clinica = (document.getElementById('re_clinica')?.value || '').trim();
        const codAtencion = (document.getElementById('re_codAtencion')?.value || '').trim();
        const ape = (document.getElementById('re_apePaciente')?.value || '').trim();
        const nom = (document.getElementById('re_nomPaciente')?.value || '').trim();
        const paciente = `${ape} ${nom}`.trim();

        if (typeof window.closeModal === 'function') {
            window.closeModal('reportEditorModalOverlay');
        }
        if (typeof window.switchSidebarView === 'function') {
            window.switchSidebarView('boletas');
        }
        if (typeof window.switchBoletasTab === 'function') {
            window.switchBoletasTab('emitir');
        }

        if (clinica) {
            const select = document.getElementById('boletaEmpresaSelect');
            if (select) {
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].text.toUpperCase().includes(clinica.toUpperCase())) {
                        select.selectedIndex = i;
                        select.dispatchEvent(new Event('change'));
                        break;
                    }
                }
            }
        }

        const conceptoInput = document.getElementById('boletaConceptoEstudio');
        if (conceptoInput && codAtencion) {
            conceptoInput.value = `Estudio histopatológico [${codAtencion}] - Paciente: ${paciente || 'S/N'}`;
        }
    };

    // Inicializar módulo de boletas si la vista ya está en boletas
    if (viewParam === 'boletas') {
        initBoletasModule();
    }

    // Alerta de prevención de pérdida de datos por cierre de ventana con cola de sync activa
    window.addEventListener('beforeunload', (e) => {
        try {
            const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
            if (queue.length > 0) {
                e.preventDefault();
                e.returnValue = 'Tiene cambios pendientes de guardar en Supabase. Si cierra la página ahora, se podrían perder los últimos cambios en otros dispositivos.';
                return e.returnValue;
            }
        } catch(err) {
            console.error(err);
        }
    });

    // =========================================================================
    // VIGILANTE EN SEGUNDO PLANO (POLLING INTELIGENTE CADA 20 SEGUNDOS)
    // =========================================================================
    function initRealtimePollingWatcher() {
        console.log('[Realtime Polling] Descarag de 3MB neutralizada. Usando MultiClinicSyncEngine / BroadcastChannel reactivo en memoria.');
    }

    initRealtimePollingWatcher();

    // Inicializar Motor de Sincronización en Tiempo Real Multi-Clínica (syncEngine)
    if (typeof syncEngine !== 'undefined' && typeof syncEngine.startRealtimeSubscription === 'function') {
        syncEngine.startRealtimeSubscription((data) => {
            console.log('[Main] Sincronización remota multi-clínica completada:', data);
            if (typeof applyFilters === 'function') {
                applyFilters(false);
            }
        });
    }

    if (typeof applyFilters === 'function') {
        applyFilters(true);
    }

    console.log("[Core] Sistema Modular V2 En Línea. Velocidad optimizada.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainApp);
} else {
    initMainApp();
}
