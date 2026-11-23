// mobile_report_reader.js
// PROTOCOLO ACTOR-CRITICO: Módulo Lector Diagnóstico Responsive Mobile-First (Boceto 3)
// Especializado en lectura médica en dispositivos móviles, Lightbox táctil y Web Share API

import { patientDatabase, fetchFullPatientDetails } from './db_service.js?v=20261105_v674';
import { openPrintWindow } from './pdf_engine.js?v=20261105_v674';
import { toTitleCase, escapeHtml } from './utils.js?v=20261105_v674';

let activePatient = null;
let currentPhotos = [];
let activePhotoIndex = 0;
let lightboxScale = 1;
let lightboxPanX = 0;
let lightboxPanY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let initialPinchDistance = null;
let initialPinchScale = 1;
let lastTapTime = 0;

// Directiva Soberana: Cero inyección de microfotografías por defecto o demo (100% fidelidad diagnóstica real)
const DEFAULT_HE_PHOTOS = [];

/**
 * Asegura la inyección del DOM para el Lector Móvil y el Lightbox
 */
function ensureReaderDOM() {
    if (document.getElementById('mobileReportReaderOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mobileReportReaderOverlay';
    overlay.className = 'mrr-overlay';
    overlay.innerHTML = `
        <!-- Encabezado Sticky con flecha de retorno y botones superiores -->
        <header class="mrr-header">
            <button type="button" class="mrr-back-btn" id="mrrBackBtn" aria-label="Volver a la lista">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div class="mrr-header-patient-info">
                <div class="mrr-header-title" id="mrrHeaderName">CARGANDO PACIENTE...</div>
                <div class="mrr-header-meta" id="mrrHeaderMeta">-- AÑOS · COD: ---</div>
            </div>
            <div class="mrr-header-actions">
                <button type="button" class="mrr-header-pdf-btn" id="mrrTopPdfBtn" title="Ver PDF Oficial A4">
                    <i class="fa-solid fa-file-pdf"></i>
                    <span>PDF Oficial</span>
                </button>
                <button type="button" class="mrr-header-btn turbo-btn" id="mrrTopTurboBtn" title="Terminal Turbo Móvil" onclick="window.location.href='mobile_turbo.html'">
                    <i class="fa-solid fa-bolt" style="color: #38bdf8;"></i>
                </button>
                <button type="button" class="mrr-header-btn share-btn" id="mrrTopShareBtn" title="Compartir">
                    <i class="fa-solid fa-share-nodes"></i>
                </button>
                <button type="button" class="mrr-header-btn download-btn" id="mrrTopDownloadBtn" title="Descargar PDF">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>
        </header>

        <!-- Cuerpo con scroll táctil -->
        <main class="mrr-scroll-body" id="mrrScrollBody">
            <!-- 1. Tarjeta Destacada de DIAGNÓSTICO HISTOPATOLÓGICO -->
            <section class="mrr-diag-card">
                <div class="mrr-diag-card-header">
                    <span class="mrr-diag-tag"><i class="fa-solid fa-microscope"></i> DIAGNÓSTICO HISTOPATOLÓGICO</span>
                    <span class="mrr-validation-pill" id="mrrValidationPill"><i class="fa-solid fa-circle-check"></i> FIRMADO Y VALIDADO</span>
                </div>
                
                <div class="mrr-specimen-title" id="mrrSpecimenTitle">MAMA DERECHA, MASTECTOMÍA RADICAL:</div>
                
                <!-- Badge Clínico Destacado (Boceto 3) -->
                <div class="mrr-clinical-badge" id="mrrClinicalBadge">
                    <div class="mrr-clinical-badge-icon" id="mrrClinicalBadgeIcon">
                        <i class="fa-solid fa-disease"></i>
                    </div>
                    <div class="mrr-clinical-badge-text" id="mrrClinicalBadgeText">
                        Carcinoma Ductal Invasivo - Grado II
                    </div>
                </div>

                <!-- Texto de Diagnóstico Ultra-Legible -->
                <div class="mrr-diag-text-body" id="mrrDiagTextBody">
                    Cargando diagnóstico histopatológico...
                </div>

                <div class="mrr-diag-footer">
                    <span id="mrrDoctorName"><i class="fa-solid fa-user-doctor"></i> Patólogo: Dr. Joseph Castillo C.</span>
                    <span id="mrrMedSolicitante"><i class="fa-solid fa-stethoscope"></i> Solicitante: ---</span>
                    <span id="mrrReportDate"><i class="fa-regular fa-calendar-check"></i> Fecha: --/--/----</span>
                </div>
            </section>

            <!-- 2. Detalles Clínicos e Histopatológicos en Acordeones -->
            <div class="mrr-section-heading">
                <span class="mrr-section-title"><i class="fa-solid fa-file-waveform"></i> Detalles Clínicos y Hallazgos</span>
            </div>

            <div class="mrr-accordions-group" id="mrrAccordionsGroup">
                <!-- Acordeón 1: Datos Clínicos y Muestra Remitida -->
                <div class="mrr-accordion-card active" id="mrrAccClinical">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-notes-medical"></i></span>
                            <span class="mrr-acc-label">Datos Clínicos y Muestra Remitida</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <table class="mrr-synoptic-table">
                            <tbody>
                                <tr>
                                    <td class="col-param">Muestra / Espécimen</td>
                                    <td class="col-value" id="mrrColEspecimen">---</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Médico Solicitante</td>
                                    <td class="col-value" id="mrrColMedSolicitante">---</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Sede / Clínica</td>
                                    <td class="col-value" id="mrrColClinica">---</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Fecha de Ingreso</td>
                                    <td class="col-value" id="mrrColFecRecepcion">---</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Acordeón 2: Descripción Macroscópica -->
                <div class="mrr-accordion-card active" id="mrrAccMacro">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-eye"></i></span>
                            <span class="mrr-acc-label">Descripción Macroscópica</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <div class="mrr-desc-text" id="mrrMacroText" style="padding: 12px 14px; color: var(--mrr-text-main); font-size: 0.88rem; line-height: 1.6; white-space: pre-line;">
                            No registrada.
                        </div>
                    </div>
                </div>

                <!-- Acordeón 3: Descripción Microscópica -->
                <div class="mrr-accordion-card active" id="mrrAccMicro">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-microscope"></i></span>
                            <span class="mrr-acc-label">Descripción Microscópica</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <div class="mrr-desc-text" id="mrrMicroText" style="padding: 12px 14px; color: var(--mrr-text-main); font-size: 0.88rem; line-height: 1.6; white-space: pre-line;">
                            No registrada.
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Galería Táctil de Microfotografías H&E -->
            <section class="mrr-gallery-card">
                <div class="mrr-gallery-header">
                    <span class="mrr-gallery-title"><i class="fa-solid fa-images"></i> Microfotografías H&E</span>
                    <span style="font-size: 0.72rem; color: #94a3b8;"><i class="fa-solid fa-expand"></i> Toca para ampliar</span>
                </div>
                <div class="mrr-gallery-grid" id="mrrGalleryGrid">
                    <!-- Miniaturas dinámicas -->
                </div>
            </section>
        </main>

        <!-- 4. Botón de Acción Flotante (FAP) en la zona del pulgar (Thumb Zone) -->
        <div class="mrr-fap-container">
            <button type="button" class="mrr-fap-btn" id="mrrFapShareBtn">
                <i class="fa-brands fa-whatsapp"></i>
                <i class="fa-solid fa-share-nodes"></i>
                <span>Compartir Informe PDF</span>
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Inyectar Lightbox Fullscreen Táctil
    const lightbox = document.createElement('div');
    lightbox.id = 'mrrLightboxOverlay';
    lightbox.className = 'mrr-lightbox';
    lightbox.innerHTML = `
        <div class="mrr-lightbox-header">
            <div style="display: flex; align-items: center;">
                <span class="mrr-lightbox-title" id="mrrLightboxTitle">Microfotografía H&E</span>
                <span class="mrr-lightbox-counter" id="mrrLightboxCounter">1 / 2</span>
            </div>
            <button type="button" class="mrr-lightbox-close" id="mrrLightboxCloseBtn" aria-label="Cerrar visor">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="mrr-lightbox-viewport" id="mrrLightboxViewport">
            <img id="mrrLightboxImg" class="mrr-lightbox-img" src="" alt="Microfotografía Fullscreen" draggable="false" />
        </div>

        <!-- Barra de Herramientas de Zoom Flotante -->
        <div class="mrr-lightbox-toolbar">
            <button type="button" class="mrr-zoom-btn" id="mrrBtnZoomOut" title="Alejar"><i class="fa-solid fa-minus"></i></button>
            <span class="mrr-zoom-level-text" id="mrrZoomLevelText">100%</span>
            <button type="button" class="mrr-zoom-btn" id="mrrBtnZoomIn" title="Acercar"><i class="fa-solid fa-plus"></i></button>
            <button type="button" class="mrr-zoom-btn" id="mrrBtnZoomReset" title="Restablecer (1:1)" style="font-size: 0.8rem; font-weight: 700;">1:1</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Inyectar Bottom Sheet de opciones de compartir
    const shareSheet = document.createElement('div');
    shareSheet.id = 'mrrShareSheetBackdrop';
    shareSheet.className = 'mrr-sheet-backdrop';
    shareSheet.innerHTML = `
        <div class="mrr-share-sheet" id="mrrShareSheet">
            <div class="mrr-sheet-handle"></div>
            <div class="mrr-sheet-title">Compartir Informe Anatomopatológico</div>
            <div class="mrr-sheet-options">
                <button type="button" class="mrr-sheet-item whatsapp-item" id="mrrSheetWaBtn">
                    <i class="fa-brands fa-whatsapp"></i>
                    <span>Enviar directamente por WhatsApp</span>
                </button>
                <button type="button" class="mrr-sheet-item download-item" id="mrrSheetDownloadBtn">
                    <i class="fa-solid fa-file-pdf"></i>
                    <span>Descargar PDF Oficial</span>
                </button>
                <button type="button" class="mrr-sheet-item copy-item" id="mrrSheetCopyBtn">
                    <i class="fa-solid fa-link"></i>
                    <span>Copiar Enlace Seguro del Informe</span>
                </button>
            </div>
            <button type="button" class="mrr-sheet-close-btn" id="mrrSheetCloseBtn">Cancelar</button>
        </div>
    `;
    document.body.appendChild(shareSheet);

    bindReaderEvents();
}

/**
 * Enlaza eventos táctiles, clics y atajos
 */
function bindReaderEvents() {
    // 1. Botón Volver
    document.getElementById('mrrBackBtn')?.addEventListener('click', closeMobileReportReader);

    // 2. Botón Destacado: Ver PDF Oficial A4 (Cierra lector móvil y abre PDF de inmediato)
    document.getElementById('mrrTopPdfBtn')?.addEventListener('click', () => {
        if (activePatient && (activePatient.codAtencion || activePatient.cod_atencion)) {
            const targetCod = String(activePatient.codAtencion || activePatient.cod_atencion).trim();
            closeMobileReportReader();
            if (typeof openPrintWindow === 'function') {
                openPrintWindow(targetCod, false);
            } else if (typeof window.openPrintWindow === 'function') {
                window.openPrintWindow(targetCod, false);
            } else if (typeof window.handleAction === 'function') {
                window.handleAction('pdf', targetCod);
            }
        }
    });

    // 3. Botón Compartir Top Bar
    document.getElementById('mrrTopShareBtn')?.addEventListener('click', () => triggerShareAction());

    // 4. Botón Descargar Top Bar
    document.getElementById('mrrTopDownloadBtn')?.addEventListener('click', () => {
        if (activePatient && activePatient.codAtencion) {
            openPrintWindow(activePatient.codAtencion, true);
        }
    });

    // 4. Botón FAP Flotante en Thumb Zone
    document.getElementById('mrrFapShareBtn')?.addEventListener('click', () => triggerShareAction());

    // 5. Alternar Acordeones Interactivos
    const accGroup = document.getElementById('mrrAccordionsGroup');
    if (accGroup) {
        accGroup.addEventListener('click', (e) => {
            const header = e.target.closest('.mrr-accordion-header');
            if (!header) return;
            const card = header.closest('.mrr-accordion-card');
            if (card) {
                card.classList.toggle('active');
            }
        });
    }

    // 6. Lightbox: Cerrar
    document.getElementById('mrrLightboxCloseBtn')?.addEventListener('click', closeLightbox);

    // 7. Lightbox: Zoom Buttons
    document.getElementById('mrrBtnZoomIn')?.addEventListener('click', () => setLightboxScale(lightboxScale + 0.5));
    document.getElementById('mrrBtnZoomOut')?.addEventListener('click', () => setLightboxScale(lightboxScale - 0.5));
    document.getElementById('mrrBtnZoomReset')?.addEventListener('click', () => resetLightboxTransform());

    // 8. Lightbox: Interacciones Táctiles (Pinch to Zoom, Pan y Doble Tap)
    const viewport = document.getElementById('mrrLightboxViewport');
    const img = document.getElementById('mrrLightboxImg');

    if (viewport && img) {
        // Doble clic / Doble tap para zoom
        viewport.addEventListener('click', (e) => {
            if (e.target.closest('.mrr-lightbox-toolbar') || e.target.closest('.mrr-lightbox-header')) return;
            const now = Date.now();
            if (now - lastTapTime < 300) {
                // Doble tap detectado
                if (lightboxScale > 1.2) {
                    resetLightboxTransform();
                } else {
                    setLightboxScale(2.5);
                }
            }
            lastTapTime = now;
        });

        // Touch Start
        viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Pinch zoom inicio
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                initialPinchScale = lightboxScale;
            } else if (e.touches.length === 1 && lightboxScale > 1) {
                // Pan inicio
                isPanning = true;
                viewport.classList.add('panning');
                startPanX = e.touches[0].clientX - lightboxPanX;
                startPanY = e.touches[0].clientY - lightboxPanY;
            }
        }, { passive: true });

        // Touch Move
        viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialPinchDistance) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                const newScale = initialPinchScale * (dist / initialPinchDistance);
                setLightboxScale(newScale, true);
            } else if (e.touches.length === 1 && isPanning) {
                e.preventDefault();
                lightboxPanX = e.touches[0].clientX - startPanX;
                lightboxPanY = e.touches[0].clientY - startPanY;
                applyLightboxTransform();
            }
        }, { passive: false });

        // Touch End
        viewport.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialPinchDistance = null;
            }
            if (e.touches.length === 0) {
                isPanning = false;
                viewport.classList.remove('panning');
            }
        }, { passive: true });
    }

    // 9. Sheet de opciones
    const sheetBackdrop = document.getElementById('mrrShareSheetBackdrop');
    const sheetCloseBtn = document.getElementById('mrrSheetCloseBtn');
    sheetCloseBtn?.addEventListener('click', () => closeShareSheet());
    sheetBackdrop?.addEventListener('click', (e) => {
        if (e.target === sheetBackdrop) closeShareSheet();
    });

    document.getElementById('mrrSheetWaBtn')?.addEventListener('click', () => {
        closeShareSheet();
        shareViaWhatsAppDirect();
    });

    document.getElementById('mrrSheetDownloadBtn')?.addEventListener('click', () => {
        closeShareSheet();
        if (activePatient && activePatient.codAtencion) {
            openPrintWindow(activePatient.codAtencion, true);
        }
    });

    document.getElementById('mrrSheetCopyBtn')?.addEventListener('click', () => {
        closeShareSheet();
        copyReportLink();
    });

    // 10. Escape key para cerrar Lightbox o Lector
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lb = document.getElementById('mrrLightboxOverlay');
            if (lb && lb.classList.contains('active')) {
                closeLightbox();
            } else {
                closeMobileReportReader();
            }
        }
    });
}

/**
 * Aplica transformaciones de escala y pan a la imagen del Lightbox
 */
function applyLightboxTransform() {
    const img = document.getElementById('mrrLightboxImg');
    const txt = document.getElementById('mrrZoomLevelText');
    if (!img) return;

    // Límite de traslación
    const maxPan = 400 * (lightboxScale - 1);
    lightboxPanX = Math.max(-maxPan, Math.min(maxPan, lightboxPanX));
    lightboxPanY = Math.max(-maxPan, Math.min(maxPan, lightboxPanY));

    img.style.transform = `translate3d(${lightboxPanX}px, ${lightboxPanY}px, 0px) scale(${lightboxScale})`;
    if (txt) txt.textContent = `${Math.round(lightboxScale * 100)}%`;
}

function setLightboxScale(scale, updateTransform = true) {
    lightboxScale = Math.max(1, Math.min(5, scale));
    if (lightboxScale === 1) {
        lightboxPanX = 0;
        lightboxPanY = 0;
    }
    if (updateTransform) applyLightboxTransform();
}

function resetLightboxTransform() {
    lightboxScale = 1;
    lightboxPanX = 0;
    lightboxPanY = 0;
    applyLightboxTransform();
}

/**
 * Abre el Lightbox en una foto específica
 */
function openLightbox(photoIndex = 0) {
    if (!currentPhotos || currentPhotos.length === 0) return;
    activePhotoIndex = Math.max(0, Math.min(currentPhotos.length - 1, photoIndex));
    const photo = currentPhotos[activePhotoIndex];

    const lb = document.getElementById('mrrLightboxOverlay');
    const img = document.getElementById('mrrLightboxImg');
    const title = document.getElementById('mrrLightboxTitle');
    const counter = document.getElementById('mrrLightboxCounter');

    if (!lb || !img) return;

    img.src = photo.url;
    if (title) title.textContent = photo.title || 'Microfotografía H&E';
    if (counter) counter.textContent = `${activePhotoIndex + 1} / ${currentPhotos.length}`;

    resetLightboxTransform();
    lb.classList.add('active');
}

function closeLightbox() {
    const lb = document.getElementById('mrrLightboxOverlay');
    if (lb) lb.classList.remove('active');
    resetLightboxTransform();
}

/**
 * Consulta resiliente en IndexedDB (ClinicaReportesDB -> pacientes_completos)
 */
async function getPatientFromIndexedDB(codAtencion) {
    if (!codAtencion || typeof indexedDB === 'undefined') return null;
    const cleanCod = String(codAtencion).trim();
    const cleanTarget = cleanCod.toLowerCase().replace(/[-_\s]/g, '');

    return new Promise((resolve) => {
        try {
            const req = indexedDB.open('ClinicaReportesDB');
            req.onerror = () => resolve(null);
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db || !db.objectStoreNames || !db.objectStoreNames.contains('pacientes_completos')) {
                    resolve(null);
                    return;
                }
                const tx = db.transaction('pacientes_completos', 'readonly');
                const store = tx.objectStore('pacientes_completos');

                const getReq = store.get(cleanCod);
                getReq.onsuccess = () => {
                    if (getReq.result) {
                        resolve(getReq.result);
                    } else {
                        // Búsqueda insensible a mayúsculas y guiones
                        const cursorReq = store.openCursor();
                        cursorReq.onsuccess = (ev) => {
                            const cursor = ev.target.result;
                            if (cursor) {
                                const val = cursor.value;
                                const c = String(val.codAtencion || val.cod_atencion || '').toLowerCase().replace(/[-_\s]/g, '');
                                if (c === cleanTarget) {
                                    resolve(val);
                                    return;
                                }
                                cursor.continue();
                            } else {
                                resolve(null);
                            }
                        };
                        cursorReq.onerror = () => resolve(null);
                    }
                };
                getReq.onerror = () => resolve(null);
            };
        } catch (err) {
            resolve(null);
        }
    });
}

/**
 * Extrae de forma exhaustiva el diagnóstico sin importar la propiedad donde se encuentre
 */
function getPatientDiagnosisField(patient) {
    if (!patient) return '';
    let diag = String(
        patient.diagnostico || 
        patient.diagnostico_histopatologico || 
        patient.diagnosticoHistopatologico || 
        patient.diag || 
        patient.conclusion || 
        patient.diagnostico_citologico || 
        patient.diagCitologico || 
        patient.diagnostico_final || 
        patient.diagnosticoFinal || 
        patient.resultado || 
        ''
    ).trim();
    // En Citología (Papanicolaou), el reporte frecuentemente se almacena en microDesc / microscopia
    const codeUpper = String(patient.codAtencion || patient.cod_atencion || '').toUpperCase();
    const espUpper = String(patient.especimen || patient.muestra || patient.muestraRemitida || patient.telContacto || '').toUpperCase();
    const srvUpper = String(patient.service || '').toUpperCase();
    const isCito = srvUpper === 'C' || srvUpper.includes('CITOLOG') || 
                   codeUpper.includes('C-') || codeUpper.endsWith('C') || 
                   /C[-_\s0-9]|^C\d|\dC\d/.test(codeUpper) ||
                   espUpper.includes('PAPANICOLAOU') || espUpper.includes('CITOLOG') || 
                   espUpper.includes('CERVICOVAGINAL');

    if (!diag && isCito) {
        diag = String(patient.microDesc || patient.micro_desc || patient.microscopia || patient.conclusiones || patient.descripcion || '').trim();
    }
    return diag;
}

/**
 * Sanitiza y formatea el reporte de diagnóstico para máxima nitidez médica
 * Respeta saltos de línea, negritas <b>/<strong>, párrafos <p>, viñetas e indentación
 */
function formatMedicalReportHtml(raw) {
    if (!raw) return '';
    let str = String(raw).trim();
    
    // Normalizar secuencias de salto de línea
    str = str.replace(/\\+n/gi, '\n');
    str = str.replace(/\\+r/gi, '');
    
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(str);
    if (!hasHtmlTags) {
        // Texto plano: escapar caracteres sensibles para seguridad
        const escaped = escapeHtml(str);
        // Resaltar títulos y secciones diagnósticas habituales en patología
        const highlighted = escaped.replace(/(^|\n)([-•*#\s\d.]*)((?:DIAGN[ÓO]STICO|CONCLUSI[ÓO]N|NOTA|COMENTARIO|DESCRIPCI[ÓO]N|INFORME|MUESTRA|ESP[ÉE]CIMEN)[^:\n]*:)/gi, '$1<strong>$2$3</strong>');
        return highlighted.replace(/\r?\n/g, '<br>');
    }
    
    // Si ya trae formato HTML (ej. desde editor WYSIWYG / Word / Supabase)
    // Limpieza de etiquetas no seguras preservando formato clínico
    str = str.replace(/<(script|iframe|object|embed|style)[\s\S]*?<\/\1>/gi, '');
    str = str.replace(/on\w+="[^"]*"/gi, '');
    str = str.replace(/on\w+='[^']*'/gi, '');
    str = str.replace(/javascript:/gi, '');
    // Neutralizar colores inline fijos (blanco/negro estático) que provocan texto invisible en modo claro o modo oscuro
    str = str.replace(/color\s*:\s*(#fff(fff)?|white|rgba?\(\s*255\s*,\s*255\s*,\s*255[^)]*\))\s*;?/gi, '');
    str = str.replace(/background(-color)?\s*:\s*(#fff(fff)?|white|rgba?\(\s*255\s*,\s*255\s*,\s*255[^)]*\))\s*;?/gi, '');
    
    // Si contiene saltos de línea sin <p> ni <br>, convertirlos
    if (!str.includes('<p') && !str.includes('<br')) {
        str = str.replace(/\r?\n/g, '<br>');
    }
    
    return str;
}

/**
 * Extrae o sintetiza el badge clínico y diagnóstico ordenado sin inventar patologías falsas
 */
export function parseClinicalDiagnosis(patient) {
    if (!patient) {
        return {
            badge: 'Diagnóstico en Proceso',
            specimen: 'ESPECÍMEN HISTOPATOLÓGICO:',
            diagText: '<span style="color: #94a3b8; font-style: italic;">Informe en proceso de validación anatomopatológica.</span>',
            severity: 'alert'
        };
    }

    const rawDiag = getPatientDiagnosisField(patient);
    const rawEspecimen = String(
        patient.especimen || 
        patient.muestra || 
        patient.muestraRemitida || 
        patient.telContacto || 
        ''
    ).trim();

    // Obtener texto plano para el análisis taxonómico médico
    let plainDiag = rawDiag.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    plainDiag = plainDiag.replace(/\\+n/gi, ' ');
    const diagUpper = plainDiag.toUpperCase();

    // 1. Título del Espécimen (destacado y sin redundancias)
    let specimenTitle = '';
    if (rawEspecimen && rawEspecimen !== '---' && rawEspecimen !== '--' && !rawEspecimen.toUpperCase().includes('ESPÉCIMEN QUIRÚRGICO') && !rawEspecimen.toUpperCase().includes('MUESTRA REMITIDA')) {
        specimenTitle = rawEspecimen.toUpperCase();
        if (!specimenTitle.endsWith(':')) specimenTitle += ':';
    } else {
        // Deducir del texto si la primera línea contiene el espécimen (ej: "MAMA DERECHA, BIOPSIA:")
        const firstLineMatch = rawDiag.split(/[\n<]/)[0].trim().replace(/^<[^>]*>/, '');
        if (firstLineMatch.endsWith(':') && firstLineMatch.length < 80 && !/^(DIAGN|INFORME|RESULTADO)/i.test(firstLineMatch)) {
            specimenTitle = firstLineMatch.toUpperCase();
        } else if (rawEspecimen) {
            specimenTitle = rawEspecimen.toUpperCase();
            if (!specimenTitle.endsWith(':')) specimenTitle += ':';
        } else {
            specimenTitle = 'ESPECÍMEN HISTOPATOLÓGICO:';
        }
    }

    // 2. Badge Clínico y Severidad
    let clinicalBadge = 'Diagnóstico Clínico';
    let severity = 'alert'; // 'malignant' | 'benign' | 'alert'

    if (diagUpper.includes('CARCINOMA DUCTAL') || diagUpper.includes('CARCINOMA INVASOR') || diagUpper.includes('CARCINOMA INFILTRANTE') || diagUpper.includes('NST')) {
        severity = 'malignant';
        if (diagUpper.includes('GRADO III') || diagUpper.includes('GRADO 3')) {
            clinicalBadge = 'Carcinoma Ductal Invasivo - Grado III';
        } else if (diagUpper.includes('GRADO I') || diagUpper.includes('GRADO 1')) {
            clinicalBadge = 'Carcinoma Ductal Invasivo - Grado I';
        } else {
            clinicalBadge = 'Carcinoma Ductal Invasivo - Grado II';
        }
    } else if (diagUpper.includes('ADENOCARCINOMA')) {
        severity = 'malignant';
        if (diagUpper.includes('POCO DIFERENCIADO') || diagUpper.includes('GRADO 3') || diagUpper.includes('GRADO III')) {
            clinicalBadge = 'Adenocarcinoma Poco Diferenciado (G3)';
        } else if (diagUpper.includes('MODERADAMENTE') || diagUpper.includes('GRADO 2') || diagUpper.includes('GRADO II')) {
            clinicalBadge = 'Adenocarcinoma Moderadamente Diferenciado';
        } else {
            clinicalBadge = 'Adenocarcinoma Invasor';
        }
    } else if (diagUpper.includes('CARCINOMA ESCAMOSO') || diagUpper.includes('CARCINOMA EPIDERMOIDE')) {
        severity = 'malignant';
        clinicalBadge = 'Carcinoma Epidermoide Infiltrante';
    } else if (diagUpper.includes('PAPANICOLAOU') || diagUpper.includes('LIE') || diagUpper.includes('SIL') || diagUpper.includes('CITOLOG')) {
        if (diagUpper.includes('ALTO GRADO') || diagUpper.includes('HSIL') || diagUpper.includes('NIC 2') || diagUpper.includes('NIC 3') || diagUpper.includes('NIC II') || diagUpper.includes('NIC III')) {
            severity = 'malignant';
            clinicalBadge = 'LIE de Alto Grado (HSIL)';
        } else if (diagUpper.includes('BAJO GRADO') || diagUpper.includes('LSIL') || diagUpper.includes('NIC 1') || diagUpper.includes('NIC I')) {
            severity = 'alert';
            clinicalBadge = 'LIE de Bajo Grado (LSIL)';
        } else if (diagUpper.includes('ASC-US') || diagUpper.includes('ASCUS')) {
            severity = 'alert';
            clinicalBadge = 'Células Escamosas Atípicas (ASC-US)';
        } else if (diagUpper.includes('NEGATIVO') || diagUpper.includes('NILM')) {
            severity = 'benign';
            clinicalBadge = 'Negativo para Malignidad (NILM)';
        } else {
            severity = 'alert';
            clinicalBadge = 'Citología Cérvico-Uterina (Pap)';
        }
    } else if (diagUpper.includes('COLECISTITIS')) {
        severity = 'alert';
        if (diagUpper.includes('REAGUDIZADA')) {
            clinicalBadge = 'Colecistitis Crónica Reagudizada';
        } else {
            clinicalBadge = 'Colecistitis Crónica Litiásica';
        }
    } else if (diagUpper.includes('APENDICITIS')) {
        severity = 'alert';
        clinicalBadge = 'Apendicitis Aguda Supurada';
    } else if (diagUpper.includes('GASTRITIS')) {
        severity = 'alert';
        if (diagUpper.includes('HELICOBACTER') || diagUpper.includes('H. PYLORI')) {
            clinicalBadge = 'Gastritis Crónica con H. Pylori (+)';
        } else {
            clinicalBadge = 'Gastritis Crónica Antral';
        }
    } else if (diagUpper.includes('CERVICITIS')) {
        severity = 'benign';
        clinicalBadge = 'Cervicitis Crónica Severa';
    } else if (diagUpper.includes('POLIPO') || diagUpper.includes('PÓLIPO')) {
        severity = 'benign';
        clinicalBadge = 'Pólipo Benigno Remitido';
    } else if (diagUpper.includes('LIPOMA')) {
        severity = 'benign';
        clinicalBadge = 'Lipoma Benigno';
    } else if (diagUpper.includes('FIBROADENOMA')) {
        severity = 'benign';
        clinicalBadge = 'Fibroadenoma Mamario';
    } else if (diagUpper.includes('HIPERPLASIA')) {
        severity = 'alert';
        clinicalBadge = 'Hiperplasia Benigna';
    } else if (diagUpper.includes('NEGATIVO PARA') || diagUpper.includes('SIN EVIDENCIA DE MALIGNIDAD')) {
        severity = 'benign';
        clinicalBadge = 'Negativo para Malignidad';
    } else if (plainDiag.length > 3) {
        severity = 'alert';
        const lines = plainDiag.split(/\r?\n/).map(l => l.replace(/^[-•*#\s\d.)]+/, '').trim()).filter(l => l.length > 0);
        let chosenLine = '';
        for (const line of lines) {
            if (line.endsWith(':') && line.length < 80) continue;
            if (/^(DIAGN|INFORME|PACIENTE|EDAD|FECHA)/i.test(line)) continue;
            chosenLine = line;
            break;
        }
        if (!chosenLine && lines.length > 0) chosenLine = lines[0];
        clinicalBadge = chosenLine.length > 55 ? chosenLine.substring(0, 52) + '...' : (chosenLine || 'Diagnóstico Histopatológico');
    } else {
        severity = 'alert';
        clinicalBadge = 'Diagnóstico en Proceso';
    }

    // Detección de citología completada con datos en microDesc
    const codDiagUpper = String(patient.codAtencion || patient.cod_atencion || '').toUpperCase();
    const espDiagUpper = String(patient.especimen || patient.muestra || patient.muestraRemitida || patient.telContacto || '').toUpperCase();
    const srvDiagUpper = String(patient.service || '').toUpperCase();
    const isCitoCase = srvDiagUpper === 'C' || srvDiagUpper.includes('CITOLOG') ||
                       codDiagUpper.includes('C-') ||
                       codDiagUpper.endsWith('C') ||
                       /C[-_\s0-9]|^C\d|\dC\d/.test(codDiagUpper) ||
                       espDiagUpper.includes('CITOLOG') ||
                       espDiagUpper.includes('PAPANICOLAOU') ||
                       espDiagUpper.includes('CERVICOVAGINAL');
    const rawMicroData = String(patient.microDesc || patient.micro_desc || patient.microscopia || '').trim();
    const hasMicroDesc = rawMicroData.length > 0 && !['---', '--', '-', 'null', 'undefined'].includes(rawMicroData.toLowerCase());
    const isCitoCompleted = isCitoCase && hasMicroDesc;

    if (isCitoCompleted && (clinicalBadge === 'Diagnóstico en Proceso' || !clinicalBadge || clinicalBadge === 'Diagnóstico Clínico')) {
        const microUpper = rawMicroData.toUpperCase();
        if (microUpper.includes('ALTO GRADO') || microUpper.includes('HSIL') || microUpper.includes('NIC 2') || microUpper.includes('NIC 3') || microUpper.includes('NIC II') || microUpper.includes('NIC III')) {
            severity = 'malignant';
            clinicalBadge = 'LIE de Alto Grado (HSIL)';
        } else if (microUpper.includes('BAJO GRADO') || microUpper.includes('LSIL') || microUpper.includes('NIC 1') || microUpper.includes('NIC I')) {
            severity = 'alert';
            clinicalBadge = 'LIE de Bajo Grado (LSIL)';
        } else if (microUpper.includes('ASC-US') || microUpper.includes('ASCUS')) {
            severity = 'alert';
            clinicalBadge = 'Células Escamosas Atípicas (ASC-US)';
        } else if (microUpper.includes('NEGATIVO') || microUpper.includes('NILM') || microUpper.includes('NINGUNO') || microUpper.includes('ADECUADA')) {
            severity = 'benign';
            clinicalBadge = 'Negativo para Malignidad (NILM)';
        } else {
            severity = 'benign';
            clinicalBadge = 'Citología Cérvico-Uterina (Pap)';
        }
    }

    if (isCitoCase && (!specimenTitle || specimenTitle === 'ESPECÍMEN HISTOPATOLÓGICO:')) {
        specimenTitle = 'ESPECÍMEN CITOLÓGICO (PAPANICOLAOU):';
    }

    // 3. Formateo Ultra-Legible del Texto del Diagnóstico
    let formattedDiagHtml = formatMedicalReportHtml(rawDiag);
    if (isCitoCompleted && (!formattedDiagHtml || formattedDiagHtml.trim() === '' || formattedDiagHtml.includes('TIPO DE MUESTRA') || formattedDiagHtml.includes('CALIDAD DE MUESTRA'))) {
        // En citología completada con microDesc: Evitar mostrar el banner amarillo de 'Informe en proceso... Pendiente'
        // y presentar la tarjeta oficial validada Bethesda (la tabla de criterios se anexa inmediatamente abajo)
        formattedDiagHtml = `
            <div style="margin: 8px 0; padding: 12px 14px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; text-align: center;">
                <div style="font-weight: 700; color: #34d399; font-size: 0.95rem; margin-bottom: 4px;">
                    <i class="fa-solid fa-file-circle-check"></i> INFORME CITOLÓGICO VALIDADO Y EMITIDO
                </div>
                <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4;">
                    Muestra procesada y evaluada satisfactoriamente. El informe oficial físico fue emitido y validado bajo el Sistema Bethesda.
                </div>
            </div>`;
    } else if (!formattedDiagHtml || formattedDiagHtml.trim() === '') {
        const sla = (typeof window.getPatientSlaStatus === 'function') ? window.getPatientSlaStatus(patient) : null;
        if (sla && sla.isFirmado) {
            formattedDiagHtml = `
                <div style="margin: 8px 0; padding: 12px 14px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; text-align: center;">
                    <div style="font-weight: 700; color: #34d399; font-size: 0.95rem; margin-bottom: 4px;">
                        <i class="fa-solid fa-file-circle-check"></i> INFORME CITOLÓGICO VALIDADO Y EMITIDO
                    </div>
                    <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4;">
                        Muestra procesada y evaluada satisfactoriamente. El informe oficial físico fue emitido y validado bajo el Sistema Bethesda.
                    </div>
                </div>`;
        } else if (sla && sla.isModificado) {
            formattedDiagHtml = '<span style="color: #fbbf24; font-style: italic;">Informe en proceso de redacción macroscópica/microscópica. Pendiente de diagnóstico y emisión oficial.</span>';
        } else {
            formattedDiagHtml = '<span style="color: #94a3b8; font-style: italic;">Sin información diagnóstica ingresada. Informe en estado Pendiente.</span>';
        }
    }

    return {
        badge: clinicalBadge,
        specimen: specimenTitle,
        diagText: formattedDiagHtml,
        severity: severity
    };
}

/**
 * Renderiza la información del paciente al DOM del Lector Móvil
 */

/**
 * Formatea descripciones de Papanicolaou / Bethesda en una estructura tabular nítida
 */
function formatCytologyBethesdaHtml(text) {
    if (!text) return '<span style="color: #94a3b8; font-style: italic;">No registrada.</span>';
    let str = String(text).trim();
    str = str.replace(/\\+n/gi, '\n').replace(/\\+N/gi, '\n');

    // Normalizar puntos suspensivos desiguales y colapso de líneas
    const cytologyLabels = [
        'tinción:', 'clasificación:', 'adecuación:', 'celularidad:',
        'células endocervicales:', 'células endocervicales / zona de transformación:',
        'calidad de la preservación celular:', 'calidad de la preservación:',
        'células escamosas:', 'células glandulares:', 'microorganismos:',
        'cambios reactivos/reparativos:', 'otros hallazgos:',
        'tipo de muestra:', 'calidad de la muestra:', 'calidad de muestra:',
        'componente inflamatorio:', 'cambios reactivos:', 'cambios celulares:'
    ];

    cytologyLabels.forEach(lbl => {
        const esc = lbl.replace(/[\/]/g, '\\$&');
        const regex = new RegExp(`([^\\n])\\s+(\\b${esc})`, 'gi');
        str = str.replace(regex, '$1\n$2');
    });

    // Separar secciones numeradas pegadas
    str = str.replace(/([^\n])\s+(\b[1-9]\.\s+[A-ZÁÉÍÓÚÑa-záéíóúñ])/g, '$1\n$2');

    const lines = str.split('\n').map(l => l.trim()).filter(Boolean);
    let htmlOut = '<div class="mrr-bethesda-table" style="display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem;">';

    lines.forEach(line => {
        if (/^\d+\./.test(line)) {
            htmlOut += `<div style="margin-top: 8px; font-weight: 800; color: #38bdf8; text-transform: uppercase; font-size: 0.82rem; letter-spacing: 0.5px;">${escapeHtml(line)}</div>`;
        } else if (line.includes(':')) {
            const idx = line.indexOf(':');
            const label = line.substring(0, idx).replace(/[\.\s]+$/, '').trim();
            const val = line.substring(idx + 1).trim();
            htmlOut += `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 4px; gap: 12px;">
                    <span style="font-weight: 600; color: #94a3b8; min-width: 130px; text-transform: capitalize;">${escapeHtml(label)}:</span>
                    <span style="color: var(--mrr-text-main, #f1f5f9); text-align: right; flex: 1;">${escapeHtml(val)}</span>
                </div>`;
        } else {
            htmlOut += `<div style="line-height: 1.5; color: var(--mrr-text-main, #f1f5f9);">${escapeHtml(line)}</div>`;
        }
    });

    htmlOut += '</div>';
    return htmlOut;
}

function renderPatientToDOM(patient, cleanCod) {
    if (!patient) return;
    activePatient = patient;

    // 1. Poblar Encabezado
    let rawPaciente = (patient.paciente || `${patient.apellidos || ''} ${patient.nombres || ''}`).trim();
    if (!rawPaciente || rawPaciente === ',') {
        rawPaciente = `${patient.nombres || ''} ${patient.apellidos || ''}`.trim() || 'PACIENTE CLÍNICO';
    }
    const cleanPaciente = toTitleCase(rawPaciente.replace(/^,\s*/, '')).toUpperCase();
    const rawAge = String(patient.edad !== undefined && patient.edad !== null ? patient.edad : '').trim();
    const edadStr = (rawAge && rawAge !== '0' && rawAge !== '--') ? (rawAge.toUpperCase().includes('AÑO') ? rawAge.toUpperCase() : `${rawAge} AÑOS`) : '-- AÑOS';
    const codStr = `CÓD: ${patient.codAtencion || cleanCod}`;

    const titleEl = document.getElementById('mrrHeaderName');
    const metaEl = document.getElementById('mrrHeaderMeta');
    if (titleEl) titleEl.textContent = cleanPaciente;
    if (metaEl) metaEl.textContent = `${edadStr} · ${codStr}`;

    // 2. Poblar Tarjeta Destacada de Diagnóstico
    const clinical = parseClinicalDiagnosis(patient);
    const specEl = document.getElementById('mrrSpecimenTitle');
    const badgeEl = document.getElementById('mrrClinicalBadge');
    const badgeIconEl = document.getElementById('mrrClinicalBadgeIcon');
    const badgeTextEl = document.getElementById('mrrClinicalBadgeText');
    const diagTextEl = document.getElementById('mrrDiagTextBody');
    const doctorEl = document.getElementById('mrrDoctorName');
    const medSolEl = document.getElementById('mrrMedSolicitante');
    const dateEl = document.getElementById('mrrReportDate');
    const pill = document.getElementById('mrrValidationPill');

    if (specEl) specEl.textContent = clinical.specimen;
    if (badgeTextEl) badgeTextEl.textContent = clinical.badge;
    
    // Para Citología (Papanicolaou): Si existe desglose microscópico Bethesda, integrarlo directamente en la tarjeta principal
    let fullDiagHtml = clinical.diagText;
    const codUpper = String(patient.codAtencion || patient.cod_atencion || cleanCod || '').toUpperCase().trim();
    const espUpper = String(patient.especimen || patient.muestra || patient.muestraRemitida || patient.telContacto || '').toUpperCase();
    const srvUpper = String(patient.service || '').toUpperCase();
    const isCitoPatient = srvUpper === 'C' || srvUpper.includes('CITOLOG') ||
                          codUpper.includes('C-') ||
                          codUpper.endsWith('C') ||
                          /C[-_\s0-9]|^C\d|\dC\d/.test(codUpper) ||
                          espUpper.includes('CITOLOG') ||
                          espUpper.includes('PAPANICOLAOU') ||
                          espUpper.includes('CERVICOVAGINAL');
    const rawMicroDesc = (patient.microDesc || patient.micro_desc || '').trim();
    if (isCitoPatient && rawMicroDesc && !fullDiagHtml.includes('mrr-bethesda-table')) {
        fullDiagHtml += `
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.15);">
                <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
                    <i class="fa-solid fa-microscope"></i> Criterios y Evaluación Microscópica (Bethesda):
                </div>
                ${formatCytologyBethesdaHtml(rawMicroDesc)}
            </div>`;
    }
    if (diagTextEl) diagTextEl.innerHTML = fullDiagHtml;

    if (badgeEl) {
        badgeEl.classList.remove('badge-malignant', 'badge-benign', 'badge-alert');
        if (clinical.severity === 'malignant') {
            badgeEl.classList.add('badge-malignant');
            if (badgeIconEl) badgeIconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        } else if (clinical.severity === 'benign') {
            badgeEl.classList.add('badge-benign');
            if (badgeIconEl) badgeIconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        } else {
            badgeEl.classList.add('badge-alert');
            if (badgeIconEl) badgeIconEl.innerHTML = '<i class="fa-solid fa-notes-medical"></i>';
        }
    }

    if (doctorEl) doctorEl.innerHTML = `<i class="fa-solid fa-user-doctor"></i> Patólogo: ${toTitleCase(patient.doctor || 'Dr. Joseph Castillo Cuenca')}`;
    if (medSolEl) {
        const med = patient.medSolicitante || patient.med_solicitante;
        medSolEl.innerHTML = `<i class="fa-solid fa-stethoscope"></i> Solicitante: ${med ? toTitleCase(med) : '---'}`;
    }
    if (dateEl) {
        const d = patient.fecEntrega || patient.fecRegistro || new Date().toLocaleDateString('es-PE');
        dateEl.innerHTML = `<i class="fa-regular fa-calendar-check"></i> Fecha: ${d}`;
    }
    if (pill) {
        const sla = (typeof window.getPatientSlaStatus === 'function') ? window.getPatientSlaStatus(patient) : {
            isFirmado: false,
            isModificado: false,
            estado: 'Pendiente'
        };
        const hasMicro = rawMicroDesc && !['---', '--', '-', 'null', 'undefined'].includes(rawMicroDesc.toLowerCase());
        const isCompletedOrFirmado = sla.isFirmado || (isCitoPatient && hasMicro) || patient.firmado || patient.estado === 'Completado';
        if (isCompletedOrFirmado) {
            pill.innerHTML = `<i class="fa-solid fa-circle-check"></i> FIRMADO Y VALIDADO`;
            pill.style.background = '';
            pill.style.borderColor = '';
            pill.style.color = '';
        } else if (sla.isModificado) {
            pill.innerHTML = `<i class="fa-solid fa-clock"></i> EN PROCESO / PRELIMINAR`;
            pill.style.background = 'rgba(245, 158, 11, 0.15)';
            pill.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            pill.style.color = '#fbbf24';
        } else {
            pill.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> PENDIENTE`;
            pill.style.background = 'rgba(225, 29, 72, 0.15)';
            pill.style.borderColor = 'rgba(225, 29, 72, 0.4)';
            pill.style.color = '#f43f5e';
        }
    }

    // 3. Poblar Acordeones Clínicos
    const isCitologia = isCitoPatient;

    // Adaptación para Citología (Bethesda)
    const diagTagEl = document.querySelector('.mrr-diag-tag');
    if (diagTagEl) {
        if (isCitologia) {
            diagTagEl.innerHTML = '<i class="fa-solid fa-vial"></i> DIAGNÓSTICO CITOLÓGICO (BETHESDA)';
        } else {
            diagTagEl.innerHTML = '<i class="fa-solid fa-microscope"></i> DIAGNÓSTICO HISTOPATOLÓGICO';
        }
    }

    const colEsp = document.getElementById('mrrColEspecimen');
    const colMed = document.getElementById('mrrColMedSolicitante');
    const colCli = document.getElementById('mrrColClinica');
    const colFec = document.getElementById('mrrColFecRecepcion');
    if (colEsp) colEsp.textContent = patient.especimen || clinical.specimen.replace(/:$/, '') || '---';
    if (colMed) colMed.textContent = toTitleCase(patient.medSolicitante || patient.med_solicitante || '---');
    if (colCli) colCli.textContent = toTitleCase(patient.clinica || '---');
    if (colFec) colFec.textContent = patient.fecRegistro || patient.fecIngreso || '---';

    const macroAcc = document.getElementById('mrrAccMacro');
    const macroEl = document.getElementById('mrrMacroText');
    const microEl = document.getElementById('mrrMicroText');

    if (isCitologia) {
        if (macroAcc) macroAcc.style.display = 'none'; // Citología no tiene macroscopía quirúrgica
    } else {
        if (macroAcc) macroAcc.style.display = 'block';
    }

    if (macroEl) macroEl.textContent = (patient.macroDesc || patient.macro_desc || 'No se registró descripción macroscópica.').trim();
    if (microEl) {
        const rawMicro = (patient.microDesc || patient.micro_desc || '').trim();
        if (isCitologia && rawMicro) {
            microEl.innerHTML = formatCytologyBethesdaHtml(rawMicro);
        } else {
            microEl.textContent = rawMicro || 'No se registró descripción microscópica.';
        }
    }

    // 4. Poblar Galería
    const galleryTitle = document.querySelector('.mrr-gallery-title');
    if (galleryTitle) {
        if (isCitologia) {
            galleryTitle.innerHTML = '<i class="fa-solid fa-images"></i> Microfotografías Citológicas (Papanicolaou)';
        } else {
            galleryTitle.innerHTML = '<i class="fa-solid fa-images"></i> Microfotografías H&E';
        }
    }
    renderMicroGallery(patient);
}

/**
 * Renderiza la galería táctil de microfotografías reales del paciente
 */
function renderMicroGallery(patient) {
    const grid = document.getElementById('mrrGalleryGrid');
    const section = document.querySelector('.mrr-gallery-card');
    if (!grid) return;

    grid.innerHTML = '';
    currentPhotos = [];

    // Revisar si el paciente tiene fotos reales asignadas
    if (patient.img01 && typeof patient.img01 === 'string' && patient.img01.trim() !== '') {
        currentPhotos.push({
            url: patient.img01,
            mag: '10x H&E',
            title: 'Microfotografía Principal H&E (10x)',
            caption: 'Vista panorámica histológica en hematoxilina y eosina.'
        });
    }
    if (patient.img02 && typeof patient.img02 === 'string' && patient.img02.trim() !== '') {
        currentPhotos.push({
            url: patient.img02,
            mag: '40x H&E',
            title: 'Microfotografía de Detalle H&E (40x)',
            caption: 'Campo de gran aumento (40x) focalizando detalle citológico.'
        });
    }

    // Foto de Solicitud de Examen Anatomopatológico / Orden Médica
    const solFoto = patient.solicitudInforme || patient.solicitud_informe;
    if (solFoto && typeof solFoto === 'string' && solFoto.trim() !== '') {
        currentPhotos.push({
            url: solFoto,
            mag: 'ORDEN MÉDICA',
            title: 'Solicitud de Examen Anatomopatológico',
            caption: 'Documento original y solicitud médica escaneada / fotografiada.'
        });
    }

    // Si no tiene microfotografías ni documentos adjuntos, ocultar la tarjeta de galería para no mostrar fotos ajenas
    if (currentPhotos.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }

    if (section) section.style.display = 'block';

    // Crear elementos de miniatura
    currentPhotos.forEach((photo, idx) => {
        const item = document.createElement('div');
        item.className = 'mrr-gallery-thumb-item';
        item.innerHTML = `
            <div class="mrr-thumb-aspect">
                <img src="${photo.url}" alt="${escapeHtml(photo.title)}" class="mrr-thumb-img" loading="lazy" />
                <span class="mrr-thumb-tag">${photo.mag}</span>
                <span class="mrr-thumb-expand-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
            </div>
            <div class="mrr-thumb-caption">${escapeHtml(photo.caption)}</div>
        `;
        item.addEventListener('click', () => openLightbox(idx));
        grid.appendChild(item);
    });
}

/**
 * Función principal para abrir el Lector Móvil
 */
export async function openMobileReportReader(codAtencion) {
    if (!codAtencion || codAtencion === '---') return;

    ensureReaderDOM();

    let inputPatient = null;
    if (typeof codAtencion === 'object' && codAtencion !== null) {
        inputPatient = { ...codAtencion };
        codAtencion = inputPatient.codAtencion || inputPatient.cod_atencion || inputPatient.id || '';
    }

    const cleanCod = String(codAtencion).trim();
    const cleanNoHyphen = cleanCod.toLowerCase().replace(/[-_\s]/g, '');

    // 1. Resolver paciente en memoria síncrona (0ms)
    let patient = inputPatient || null;
    if (!patient && Array.isArray(patientDatabase)) {
        const found = patientDatabase.find(x => {
            const c = String(x.codAtencion || x.cod_atencion || '').toLowerCase().replace(/[-_\s]/g, '');
            return c === cleanNoHyphen;
        });
        if (found) patient = { ...found };
    }

    if (!patient && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
        const found = window.REAL_SUPABASE_PATIENTS.find(b => {
            const c = String(b.codAtencion || '').toLowerCase().replace(/[-_\s]/g, '');
            return c === cleanNoHyphen;
        });
        if (found) patient = { ...found };
    }

    // Buscar en respaldo local si no está en RAM
    if (!patient) {
        try {
            const localList = JSON.parse(localStorage.getItem('patientDatabase') || localStorage.getItem('patientDatabaseLocal') || '[]');
            if (Array.isArray(localList)) {
                const found = localList.find(b => {
                    const c = String(b.codAtencion || b.cod_atencion || '').toLowerCase().replace(/[-_\s]/g, '');
                    return c === cleanNoHyphen;
                });
                if (found) patient = { ...found };
            }
        } catch (e) {
            console.warn('[MRR] Error en cache local:', e);
        }
    }

    // Verificación de Control de Acceso (RBAC) - Doctores y Clínicas solo ven sus propios informes
    try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userAccount = String(storedUser.usuario || '').toLowerCase().trim();
        const userRole = String(storedUser.perfil || '').toLowerCase().trim();
        const userClinic = String(storedUser.clinica || '').toLowerCase().trim();
        const isAdmin = userAccount === 'admin' || userRole === 'administrador';

        if (!isAdmin) {
            const patMed = String(patient.medSolicitante || patient.doctor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const patCli = String(patient.clinica || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            let isAllowed = false;

            if (userAccount === 'bryanflores' || userClinic.includes('bryan flores') || userClinic.includes('bryan')) {
                isAllowed = (patMed.includes('bryan') && patMed.includes('flores')) || (patMed.includes('flores') && patMed.includes('sierra')) || patMed.includes('bryan flores') || patMed.includes('b. flores') || patMed === 'flores';
            } else if (userAccount === 'drvictorcastaneda' || userAccount.includes('castaneda') || userClinic.includes('castaneda')) {
                isAllowed = patMed.includes('castaneda') && (patMed.includes('victor') || patMed.includes('robles') || patMed.includes('dr'));
            } else if (userAccount === 'drdiegochungui' || userClinic.includes('chungui')) {
                isAllowed = patMed.includes('chungui') && (patMed.includes('diego') || patMed.includes('bravo') || patMed.includes('dr'));
            } else if (userAccount === 'drjhonvilca' || userAccount.includes('jhonvilca')) {
                isAllowed = (patMed.includes('vilca') && (patMed.includes('jhon') || patMed.includes('dr'))) || patCli.includes('luz');
            } else if (userAccount === 'drjorgemunante' || userAccount.includes('munante')) {
                isAllowed = patMed.includes('munante') || patMed.includes('arzapalo');
            } else if (userAccount === 'drjaimebecerra' || userAccount.includes('becerra')) {
                isAllowed = patMed.includes('becerra') || patMed.includes('ulfe');
            } else if (userAccount === 'drmanuelsanchez' || userAccount.includes('sanchez')) {
                isAllowed = patMed.includes('sanchez') && (patMed.includes('manuel') || patMed.includes('orellana'));
            } else if (userAccount === 'dralejandroescalante' || userAccount.includes('escalante')) {
                isAllowed = (patMed.includes('escalante') && (patMed.includes('alejandro') || patMed.includes('alvaro'))) || patCli.includes('clemente');
            } else if (userAccount === 'junco2026' || userAccount.includes('junco')) {
                isAllowed = patCli.includes('junco') || patMed.includes('junco');
            } else if (userAccount === 'carrionventanilla') {
                isAllowed = patCli.includes('ventanilla') || patMed.includes('ventanilla');
            } else if (userAccount === 'clinicacarrion') {
                isAllowed = (patCli.includes('carrion') || patMed.includes('carrion') || patMed.includes('chungui') || patMed.includes('munante') || patMed.includes('becerra') || patMed.includes('sanchez') || patMed.includes('flores')) && !patCli.includes('ventanilla');
            } else if (userAccount === 'sanclemente') {
                isAllowed = patCli.includes('clemente') || patCli.includes('san clemente') || patMed.includes('escalante') || patMed.includes('alejandro');
            } else if (userAccount === 'mujersegura' || userAccount.includes('mujer')) {
                isAllowed = patCli.includes('mujer') || patCli.includes('mujersegura') || patMed.includes('marreros') || patMed.includes('lloclla');
            } else if (userAccount === 'alfaprevenir' || userAccount.includes('alfa')) {
                isAllowed = patCli.includes('alfa') || patCli.includes('prevenir') || patMed.includes('saire') || patMed.includes('bocangel');
            } else if (userAccount === 'clinicalaluz' || userAccount.includes('laluz') || userAccount.includes('la luz') || userClinic.includes('la luz')) {
                isAllowed = patCli.includes('luz') || patMed.includes('vilca');
            } else if (userAccount === 'uroserv' || userAccount.includes('uroserv') || userClinic.includes('uroserv') || userClinic.includes('urolog')) {
                isAllowed = patCli.includes('uroserv') || patCli.includes('urolog') || patMed.includes('castaneda');
            } else {
                if (userClinic && (patCli.includes(userClinic) || userClinic.includes(patCli) || patMed.includes(userClinic))) {
                    isAllowed = true;
                }
            }

            if (!isAllowed) {
                alert('Acceso no autorizado: Este reporte clínico no corresponde a su cuenta.');
                return;
            }
        }
    } catch (e) {
        console.warn('[MRR] Error validando permisos RBAC:', e);
    }

    // Renderizar de inmediato para respuesta instantánea (0ms)
    renderPatientToDOM(patient, cleanCod);

    // 2. Activar overlay y asegurar scroll al inicio de la tarjeta de diagnóstico
    const overlay = document.getElementById('mobileReportReaderOverlay');
    const scrollBody = document.getElementById('mrrScrollBody');

    if (overlay) {
        overlay.classList.add('active');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden'; // Prevenir scroll de fondo en iOS y Android
    }

    if (scrollBody) {
        scrollBody.scrollTop = 0;
    }

    // Doble verificación con requestAnimationFrame y timeout para asegurar que la tarjeta de diagnóstico sea 100% visible sin recorte
    requestAnimationFrame(() => {
        if (scrollBody) {
            scrollBody.scrollTop = 0;
        }
        const diagCard = document.querySelector('.mrr-diag-card');
        if (diagCard && typeof diagCard.scrollIntoView === 'function') {
            diagCard.scrollIntoView({ behavior: 'instant', block: 'start' });
            if (scrollBody) scrollBody.scrollTop = 0;
        }
    });

    setTimeout(() => {
        if (scrollBody) scrollBody.scrollTop = 0;
    }, 50);

    // 3. Enriquecimiento resiliente asíncrono y revalidación en segundo plano (SWR)
    const currentDiag = getPatientDiagnosisField(patient);
    const hasMeaningfulDiag = currentDiag && currentDiag !== '' && !currentDiag.includes('proceso de validación');
    const hasPhotos = !!patient && !!(patient.img01 || patient.img02 || patient.macro360 || patient.solicitudInforme || patient.solicitud_informe);

    // Si falta diagnóstico o fotos, o si estamos conectados a la red, ejecutar enriquecimiento y revalidación en background
    if (!hasMeaningfulDiag || !hasPhotos || navigator.onLine) {
        let enriched = false;

        // A. Consultar respaldo REAL_SUPABASE_PATIENTS (solo si faltan datos inmediatos)
        if ((!hasMeaningfulDiag || !hasPhotos) && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
            const bkp = window.REAL_SUPABASE_PATIENTS.find(b => {
                const c = String(b.codAtencion || '').toLowerCase().replace(/[-_\s]/g, '');
                return c === cleanNoHyphen;
            });
            if (bkp) {
                if (!hasMeaningfulDiag && getPatientDiagnosisField(bkp)) {
                    Object.assign(patient, bkp);
                    enriched = true;
                }
                if (!patient.img01 && bkp.img01) { patient.img01 = bkp.img01; enriched = true; }
                if (!patient.img02 && bkp.img02) { patient.img02 = bkp.img02; enriched = true; }
                if (!patient.solicitudInforme && (bkp.solicitudInforme || bkp.solicitud_informe)) {
                    patient.solicitudInforme = bkp.solicitudInforme || bkp.solicitud_informe;
                    enriched = true;
                }
                if (!patient.macro360 && bkp.macro360) { patient.macro360 = bkp.macro360; enriched = true; }
            }
        }

        // B. Consultar IndexedDB paciente completo
        if (!hasMeaningfulDiag || !hasPhotos) {
            try {
                const fromIdb = await getPatientFromIndexedDB(cleanCod);
                if (fromIdb) {
                    if (!hasMeaningfulDiag && getPatientDiagnosisField(fromIdb)) {
                        Object.assign(patient, fromIdb);
                        enriched = true;
                    }
                    if (!patient.img01 && fromIdb.img01) { patient.img01 = fromIdb.img01; enriched = true; }
                    if (!patient.img02 && fromIdb.img02) { patient.img02 = fromIdb.img02; enriched = true; }
                    if (!patient.solicitudInforme && (fromIdb.solicitudInforme || fromIdb.solicitud_informe)) {
                        patient.solicitudInforme = fromIdb.solicitudInforme || fromIdb.solicitud_informe;
                        enriched = true;
                    }
                    if (!patient.macro360 && fromIdb.macro360) { patient.macro360 = fromIdb.macro360; enriched = true; }
                }
            } catch (e) {}
        }

        // C. Consultar fetchFullPatientDetails
        if (!hasMeaningfulDiag || !hasPhotos) {
            try {
                const fetchFn = window.fetchFullPatientDetails;
                const full = typeof fetchFn === 'function' ? await fetchFn(cleanCod) : null;
                if (full) {
                    if (!hasMeaningfulDiag && getPatientDiagnosisField(full)) {
                        Object.assign(patient, full);
                        enriched = true;
                    }
                    if (!patient.img01 && full.img01) { patient.img01 = full.img01; enriched = true; }
                    if (!patient.img02 && full.img02) { patient.img02 = full.img02; enriched = true; }
                    if (!patient.solicitudInforme && (full.solicitudInforme || full.solicitud_informe)) {
                        patient.solicitudInforme = full.solicitudInforme || full.solicitud_informe;
                        enriched = true;
                    }
                    if (!patient.macro360 && full.macro360) { patient.macro360 = full.macro360; enriched = true; }
                }
            } catch (e) {}
        }

        // D. Revalidación en vivo con Supabase (Actualización reactiva garantizada)
        if (typeof window !== 'undefined' && (window.supabase || window.supabaseClient) && navigator.onLine) {
            try {
                const sb = window.supabase || window.supabaseClient;
                const { data, error } = await sb
                    .from('pacientes')
                    .select('*')
                    .ilike('cod_atencion', cleanCod)
                    .maybeSingle();
                if (!error && data) {
                    const mapped = {
                        codAtencion: data.cod_atencion,
                        paciente: data.paciente,
                        nombres: data.nombres,
                        apellidos: data.apellidos,
                        edad: data.edad,
                        sexo: data.sexo,
                        dni: data.dni,
                        especimen: data.especimen,
                        doctor: data.doctor,
                        medSolicitante: data.med_solicitante,
                        clinica: data.clinica,
                        diagnostico: data.diagnostico,
                        macroDesc: data.macro_desc,
                        microDesc: data.micro_desc,
                        fecRegistro: data.fec_registro,
                        fecEntrega: data.fec_entrega,
                        telefono: data.telefono,
                        firmado: data.firmado,
                        img01: data.img01,
                        img02: data.img02,
                        solicitudInforme: data.solicitud_informe || data.solicitudInforme || null,
                        macro360: data.macro360 || null
                    };
                    // Protección contra borrado de citología: Si la nube viene sin diagnóstico pero localmente existe, preservarlo
                    if (!mapped.diagnostico && (data.micro_desc || patient.diagnostico)) {
                        mapped.diagnostico = patient.diagnostico || data.micro_desc;
                    }
                    if (data.service) mapped.service = data.service;
                    if (mapped.diagnostico !== patient.diagnostico || mapped.firmado !== patient.firmado || mapped.img01 !== patient.img01 || mapped.img02 !== patient.img02) {
                        Object.assign(patient, mapped);
                        enriched = true;
                    }
                }
            } catch (err) {
                console.warn('[MRR] Error en consulta directa de rescate:', err);
            }
        }

        if (enriched) {
            renderPatientToDOM(patient, cleanCod);
            renderMicroGallery(patient);
        }
    }

    // Historial para botón retroceso en móviles Android
    try {
        window.history.pushState({ mrrOpen: true }, '');
        const onPopState = () => {
            closeMobileReportReader();
            window.removeEventListener('popstate', onPopState);
        };
        window.addEventListener('popstate', onPopState, { once: true });
    } catch (e) {
        // Ignorar si el navegador restringe pushState
    }
}

/**
 * Cierra el Lector Móvil y restaura el scroll de la página
 */
export function closeMobileReportReader() {
    closeLightbox();
    closeShareSheet();
    const overlay = document.getElementById('mobileReportReaderOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }
    const scrollBody = document.getElementById('mrrScrollBody');
    if (scrollBody) {
        scrollBody.scrollTop = 0;
    }
}

/**
 * Acción principal de Compartir (Web Share API con fallback directo a WhatsApp y Sheet)
 */
async function triggerShareAction() {
    if (!activePatient) return;

    const cod = activePatient.codAtencion || '';
    const rawPaciente = (activePatient.paciente || `${activePatient.apellidos || ''} ${activePatient.nombres || ''}`).trim();
    const cleanPaciente = toTitleCase(rawPaciente.replace(/^,\s*/, ''));
    const clinical = parseClinicalDiagnosis(activePatient);
    const reportUrl = `https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`;

    const shareData = {
        title: `Informe Patológico - ${cleanPaciente}`,
        text: `📄 *REPORTE ANATOMOPATOLÓGICO OFICIAL*\nPaciente: *${cleanPaciente}*\nCódigo: *${cod}*\nDiagnóstico: *${clinical.badge}*\n\nPuede consultar el informe oficial en el siguiente enlace:\n${reportUrl}`,
        url: reportUrl
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn('[Mobile Reader] Web Share error, usando fallback:', err);
                openShareSheet();
            }
            return;
        }
    }

    openShareSheet();
}

/**
 * Enviar por WhatsApp con mensaje preconfigurado y teléfono limpio
 */
function shareViaWhatsAppDirect() {
    if (!activePatient) return;

    const cod = activePatient.codAtencion || '';
    const rawPaciente = (activePatient.paciente || `${activePatient.apellidos || ''} ${activePatient.nombres || ''}`).trim();
    const cleanPaciente = toTitleCase(rawPaciente.replace(/^,\s*/, ''));
    const clinical = parseClinicalDiagnosis(activePatient);
    
    // Extraer únicamente teléfonos numéricos reales (NO telContacto que almacena muestra)
    const rawTel = String(activePatient.telefono || activePatient.celular || activePatient.telPaciente || '').replace(/\D/g, '');
    let waUrl = '';

    const waText = encodeURIComponent(`📄 *REPORTE ANATOMOPATOLÓGICO OFICIAL*\nPaciente: *${cleanPaciente}*\nCódigo: *${cod}*\nDiagnóstico: *${clinical.badge}*\n\n📥 Puede consultar y descargar el informe oficial en PDF en el siguiente enlace seguro:\nhttps://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`);

    if (rawTel.length === 9) {
        waUrl = `https://api.whatsapp.com/send?phone=51${rawTel}&text=${waText}`;
    } else if (rawTel.length > 9 && rawTel.startsWith('51')) {
        waUrl = `https://api.whatsapp.com/send?phone=${rawTel}&text=${waText}`;
    } else {
        // Abrir WhatsApp para seleccionar el contacto nativamente
        waUrl = `https://api.whatsapp.com/send?text=${waText}`;
    }

    window.open(waUrl, '_blank');
}

/**
 * Copiar enlace seguro al portapapeles
 */
function copyReportLink() {
    if (!activePatient) return;
    const cod = activePatient.codAtencion || '';
    const url = `https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert('¡Enlace del informe copiado al portapapeles!');
        }).catch(() => {
            prompt('Copie el enlace seguro:', url);
        });
    } else {
        prompt('Copie el enlace seguro:', url);
    }
}

function openShareSheet() {
    const backdrop = document.getElementById('mrrShareSheetBackdrop');
    const sheet = document.getElementById('mrrShareSheet');
    if (backdrop && sheet) {
        backdrop.classList.add('active');
        sheet.classList.add('active');
    }
}

function closeShareSheet() {
    const backdrop = document.getElementById('mrrShareSheetBackdrop');
    const sheet = document.getElementById('mrrShareSheet');
    if (backdrop && sheet) {
        sheet.classList.remove('active');
        backdrop.classList.remove('active');
    }
}

// Exposición global
if (typeof window !== 'undefined') {
    window.openMobileReportReader = openMobileReportReader;
    window.closeMobileReportReader = closeMobileReportReader;
}
