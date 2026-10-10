// main.js
// PROTOCOLO ACTOR-CRITICO: Orquestador Principal (Punto de Entrada Modular)

import { initLocalDatabases, patientDatabase, loadDoctorsData, doctorsDatabase, categoriesDatabase, templatesDatabase, sortPatientArray, triggerAutomaticBackup, syncPatientsFromSupabase, syncTemplatesFromSupabase, syncCategoriesFromSupabase, subscribePatientsRealtime, savePatient, deletePatient, updateSyncStatusUI, fetchFullPatientDetails, fetchDeltaUpdates, processSyncQueue, uploadAllLocalReportsToSupabase, normalizeSexo, saveSurgicalCaseToLRU, getSurgicalCaseFromLRU, getRecentSurgicalCasesLRU } from './db_service.js';
import { initTableUI, renderTable, applyFilters, setCurrentService } from './ui_tables.js';
import { initModalListeners, openModal, closeModal } from './ui_editor.js';
import { openPrintWindow } from './pdf_engine.js';
import { initDictaphone, startDictation } from './dictaphone_core.js';
import { initReportEditorLogic, populateEditorModal } from './ui_report_editor.js';
import { initAdminUI, populateModalDoctorsSelect } from './ui_admin.js';
import { initBoletasModule, getStoredEmpresas, getStoredBoletas, generateNextBoletaCode, generateBoletaPDF, renderEmpresasSelect, renderEmpresasTable, renderBoletasTable } from './boletas_manager.js';
import { openMobileReportReader, closeMobileReportReader } from './mobile_report_reader.js';
import { initClientSimulator, openClientSimulatorModal, switchToClient, exitClientSimulation } from './client_simulator.js';
import { initGroqCopilot, openGroqCopilotModal } from './groq_copilot.js';



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
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // 0. Control de Acceso (RBAC) y Redirección
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (eUser) {
        currentUser = null;
    }
    if (!currentUser) {
        window.location.replace('login.html');
        return;
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

    // Personalizar cabecera con el nombre de usuario (dinámico — no hardcodeado)
    const welcomeText = document.querySelector('.welcome-text strong');
    if (welcomeText) {
        let name = currentUser.nombres || '';
        name = name.replace('JOSEPH', 'JOSEHP').replace('CRISTOPHER', 'CHRISTOPHER');
        welcomeText.textContent = name;
    }

    // Inyectar badge de especialidad para perfil 'Usuario' (Médicos especialistas)
    const welcomeSpan = document.querySelector('.welcome-text');
    if (welcomeSpan && currentUser.perfil === 'Usuario' && !document.getElementById('specialtyBadge')) {
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

    // Añadir botón de Cerrar Sesión y Cambiar Tema en la cabecera
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        if (!document.getElementById('btnThemeToggle')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'btnThemeToggle';
            themeBtn.className = 'header-utility-btn';
            themeBtn.title = 'Alternar Tema Claro/Oscuro';
            themeBtn.style.marginLeft = '10px';

            const savedTheme = localStorage.getItem('appTheme') || 'dark';
            if (savedTheme === 'light') {
                themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }

            themeBtn.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-theme');
                localStorage.setItem('appTheme', isLight ? 'light' : 'dark');
                themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
                if (typeof showToast === 'function') {
                    showToast(isLight ? "Modo Claro activado" : "Modo Oscuro activado", "info");
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
    try {
        applyFilters(false);
    } catch (e) {
        console.error("[Main Engine] Error en renderizado inicial local:", e);
    }
    if (typeof applyFilters === 'function') {
        Promise.resolve(applyFilters(false)).catch(err => {
            console.warn("[Main Engine] Promesa applyFilters rechazada:", err);
        });
    }
    window.closeModal = closeModal;
    window.openModal = openModal;
    window.populateEditorModal = populateEditorModal;
    window.openReportEditor = (cod) => window.handleAction('editar', cod);
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
        if (!codAtencion || codAtencion === '---') return;
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
            let initialPatient = patientDatabase.find(x => {
                const code = String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase();
                return code === cleanLower || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
            });

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
                const btnFirma = document.getElementById('reBtnFirma');
                
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
                        if (modalEl && modalEl.classList.contains('active')) {
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
                                const btnFirma = document.getElementById('reBtnFirma');
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

    // Sincronización ultrarrápida: 1. Carga incremental inicial de los últimos 150 registros (0.3s)
    let lastFocusSyncTime = Date.now();
    syncPatientsFromSupabase(150);
    syncTemplatesFromSupabase();
    syncCategoriesFromSupabase();
    subscribePatientsRealtime();
    updateSyncStatusUI();

    // 2. Carga en segundo plano del histórico completo y sincronización de cola pendiente
    setTimeout(() => {
        syncPatientsFromSupabase();
        processSyncQueue();
    }, 1800);

    // 3. LATIDO DE CORAZÓN AUTOMÁTICO (Heartbeat de alta frecuencia cada 5s)
    // Garantiza que registros creados o firmados en otras computadoras aparezcan de inmediato sin recargar
    setInterval(() => {
        if (navigator.onLine) {
            processSyncQueue();
            fetchDeltaUpdates();
        }
    }, 5000);

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

    // Restricción estricta de SOLO NÚMEROS para campos de DNI (máximo 8 dígitos)
    ['dni', 'm_dni', 're_dni'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const sanitize = () => {
                el.value = el.value.replace(/[^0-9]/g, '').slice(0, 8);
            };
            el.addEventListener('input', sanitize);
            el.addEventListener('keyup', sanitize);
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
            const mMotivo = document.getElementById('m_motivoEstudio')?.value?.trim() || '';
            const mClinica = document.getElementById('m_clinica')?.value?.trim() || 'CLÍNICA CARRIÓN';
            const mFecReg = document.getElementById('m_fecRegistro')?.value || new Date().toISOString().split('T')[0];
            const mFecEnt = document.getElementById('m_fecEntrega')?.value || '';

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
    const editCod = urlParams.get('edit');
    if (editCod) {
        setTimeout(() => {
            if (typeof window.handleAction === 'function') {
                window.handleAction('editar', editCod);
            }
        }, 300);
    }
    const directCod = urlParams.get('cod') || urlParams.get('codigo') || urlParams.get('id');
    if (directCod) {
        setTimeout(() => {
            if (typeof window.handleAction === 'function') {
                window.handleAction('mobile_reader', directCod);
            } else if (typeof window.openMobileReportReader === 'function') {
                window.openMobileReportReader(directCod);
            }
        }, 350);
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

    // Manejar colapso de filtros en móvil
    const btnToggleFilters = document.getElementById('btnToggleFilters');
    const filterForm = document.getElementById('filterForm');
    if (btnToggleFilters && filterForm) {
        btnToggleFilters.addEventListener('click', () => {
            const isCollapsed = filterForm.classList.toggle('collapsed');
            const spanText = btnToggleFilters.querySelector('span');
            if (spanText) {
                spanText.textContent = isCollapsed ? 'MOSTRAR FILTROS DE BÚSQUEDA' : 'OCULTAR FILTROS DE BÚSQUEDA';
            }
        });
    }

    console.log("[Core] Sistema Modular V2 En Línea. Velocidad optimizada.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainApp);
} else {
    initMainApp();
}
