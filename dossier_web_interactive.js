/**
 * JC PATH LAB • CONTROLADOR WEB INTERACTIVO MULTIESPECIALIDAD
 * Ejes: App Móvil, Visor WSI 40x, Split-Slider Morfometría IA, Copiloto Gémini,
 * Asistente Virtual IHQ (150 Biomarcadores reales), Mapeo 3D 360° y Calculadora 2026.
 */

document.addEventListener('DOMContentLoaded', () => {
    initSpecialtiesSubnav();
    initSmartphoneSimulator();
    initWSIViewer();
    initMorphSplitSlider();
    initGeminiCopilot();
    initIHQAssistant();
    initSpecimen360Viewer();
    initPricingCalculator();
});

/* ==========================================================================
   0. NAVEGACIÓN Y SWITCHER DE 5 ESPECIALIDADES
   ========================================================================== */
function initSpecialtiesSubnav() {
    const tabs = document.querySelectorAll('.specialty-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const spec = tab.getAttribute('data-specialty');
            handleSpecialtyChange(spec);
        });
    });
}

function handleSpecialtyChange(spec) {
    // Sincronizar en el Smartphone
    const phoneSelect = document.querySelector(`.phone-patient-card[data-specialty="${spec}"]`);
    if (phoneSelect) phoneSelect.click();

    // Sincronizar en el Visor WSI si existe caso
    const wsiBtn = document.querySelector(`.wsi-case-tab[data-specialty="${spec}"]`);
    if (wsiBtn) {
        wsiBtn.click();
    } else if (spec === 'uro' || spec === 'derma') {
        const btnProstate = document.getElementById('btnSampleProstate') || document.getElementById('btnSampleSkin');
        if (btnProstate) btnProstate.click();
    } else if (spec === 'gastro') {
        const btnGastric = document.getElementById('btnSampleGastric');
        if (btnGastric) btnGastric.click();
    } else if (spec === 'sarcoma' || spec === 'neuro' || spec === 'renal') {
        const btnRenal = document.getElementById('btnSampleRenal') || document.getElementById('btnSampleAcinar');
        if (btnRenal) btnRenal.click();
    }
}
    // Filtrar tabla de IHQ según especialidad
    const catMap = {
        'uro': 'Urológicos & Germinales',
        'derma': 'Melanocíticos & Dermatopatología',
        'neuro': 'Neuropatología & Neuroendocrino',
        'sarcoma': 'Partes Blandas & Sarcomas',
        'hemato': 'Linfoides & Hematopatología'
    };
    if (catMap[spec]) {
        const pill = document.querySelector(`.pill-filter[data-category="${catMap[spec]}"]`);
        if (pill) pill.click();
    }
}

/* ==========================================================================
   1. SIMULADOR DE SMARTPHONE QUIRÚRGICO (EJE 01 • 100% INTERACTIVO)
   ========================================================================== */
const PATIENTS_DATA = [
    {
        id: '26Q-0182',
        name: 'García Morales, Juan',
        age: '62 años',
        gender: 'Masculino',
        specialty: 'gastro',
        procedure: 'Gastrectomía Subtotal + Linfadenectomía D2',
        organ: 'Estómago (Antro y Cuerpo)',
        status: 'status-completed',
        statusText: 'Completado',
        date: '11/09/2026',
        dr: 'Dr. Bryan Flores Sierra',
        hospital: 'Servicio de Cirugía Oncológica',
        macroscopy: 'Pieza de gastrectomía subtotal de 14.5 x 8.2 x 3.5 cm. A la apertura por curvatura mayor se identifica neoplasia ulcerada de 3.2 x 2.8 cm en antro gástrico, a 4.5 cm del margen proximal y a 3.8 cm del margen distal. Se aíslan 16 ganglios perigástricos.',
        diagnosis: 'ADENOCARCINOMA GÁSTRICO DE TIPO INTESTINAL (CLASIFICACIÓN DE LAURÉN), MODERADAMENTE DIFERENCIADO (G2), INFILTRANTE HASTA LA CAPA SUBEROSAL (pT3). MÁRGENES QUIRÚRGICOS PROXIMAL, DISTAL Y RADIAL LIBRES DE NEOPLASIA (R0). DIECISÉIS GANGLIOS LINFÁTICOS REGIONALES AISLADOS SIN METÁSTASIS (0/16, pN0). ESTADÍO PATOLÓGICO: pT3 pN0 cM0 (Estadío IIA).',
        margins: 'Márgenes Quirúrgicos R0: Proximal libre a 45 mm, Distal libre a 38 mm',
        ihqSummary: 'HER2: Negativo (Score 0) • Claudina 18.2: (+) Positivo intenso en 80% • MMR: MLH1+, MSH2+, MSH6+, PMS2+ (MSS)',
        macroImg: 'morfologia_he_original.jpg'
    },
    {
        id: '26Q-0194',
        name: 'Mendoza Ríos, Carlos',
        age: '67 años',
        gender: 'Masculino',
        specialty: 'uro',
        procedure: 'Prostatectomía Radical Laparoscópica',
        organ: 'Próstata y Vesículas Seminales',
        status: 'status-completed',
        statusText: 'Completado',
        date: '11/09/2026',
        dr: 'Dr. Víctor Castañeda',
        hospital: 'Departamento de Urología Oncológica',
        macroscopy: 'Pieza quirúrgica completa que pesa 48.5 gramos y mide 5.2 x 4.8 x 4.0 cm con ambas vesículas seminales. Cápsula lisa con tinta china negra en hemi-glándula derecha y verde en izquierda.',
        diagnosis: 'ADENOCARCINOMA PROSTÁTICO ACINAR HABITUAL. SCORE DE GLEASON: 4 + 3 = 7 (GRUPO GRADO 3 DE LA ISUP / OMS 2026). PATRÓN 4 CRIBIFORME: 65%. NEOPLASIA CONFINADA AL ÓRGANO (pT2). MÁRGENES QUIRÚRGICOS APICAL, BASAL Y PERIFÉRICOS LIBRES DE NEOPLASIA (R0). VESÍCULAS SEMINALES Y CUELLO VESICAL LIBRES.',
        margins: 'Márgenes Quirúrgicos R0: Margen apical libre a 4.2 mm, margen radial libre a 3.8 mm',
        ihqSummary: 'AMACR (P504S): (+) Positividad luminal intensa • p63: (-) Negativo ausente en células basales',
        macroImg: 'morfologia_ia_pleomorfismo.jpg'
    },
    {
        id: '26Q-0281',
        name: 'Avalos Valenzuela, Carlos A.',
        age: '59 años',
        gender: 'Masculino',
        specialty: 'uro',
        procedure: 'Enucleación Prostática HoLEP',
        organ: 'Tejido Prostático Morcelado',
        status: 'status-ready',
        statusText: 'Listo para Imprimir',
        date: '10/09/2026',
        dr: 'Dr. Bryan Flores Sierra',
        hospital: 'Unidad de Cirugía Endourológica Láser',
        macroscopy: 'Múltiples fragmentos tisulares morcelados blanquecino-amarillentos, elásticos, que pesan en conjunto 42.5 gramos.',
        diagnosis: 'HIPERPLASIA PROSTÁTICA NODULAR BENIGNA (ADENOMIOMATOSA) ASOCIADA A PROSTATITIS CRÓNICA ACTIVA MODERADA Y CAMBIOS INFLAMATORIOS REACTIVOS. NEGATIVO PARA NEOPLASIA MALIGNA O ATIPIA GLANDULAR EN LOS 42.5 GRAMOS EXAMINADOS.',
        margins: 'Material de enucleación endoscópica sin evidencia de malignidad (R0)',
        ihqSummary: 'No requerido por ausencia de sospecha histológica',
        macroImg: 'morfologia_he_original.jpg'
    },
    {
        id: '26Q-0285',
        name: 'Mendoza Quispe, Valeria',
        age: '42 años',
        gender: 'Femenino',
        specialty: 'derma',
        procedure: 'Biopsia Escisional de Piel (Espalda)',
        organ: 'Piel Escapular y Tejido Celular Subcutáneo',
        status: 'status-completed',
        statusText: 'Completado',
        date: '09/09/2026',
        dr: 'Dr. Víctor Castañeda',
        hospital: 'Dermatología Quirúrgica',
        macroscopy: 'Losange de piel de 3.8 x 2.2 cm con profundidad de 1.4 cm. Se observa lesión pigmentada asimétrica de 1.1 x 0.9 cm, pardo-oscura.',
        diagnosis: 'MELANOMA MALIGNO DE EXTENSIÓN SUPERFICIAL INVASOR. ESPESOR TUMORAL DE BRESLOW: 1.15 MM. NIVEL IV DE CLARK. FASE DE CRECIMIENTO VERTICAL. AUSENCIA DE ULCERACIÓN MICROSCÓPICA (pT2a). MÁRGENES QUIRÚRGICOS LATERALES Y PROFUNDO LIBRES DE NEOPLASIA (> 5 MM, R0).',
        margins: 'Margen profundo libre a 6.5 mm • Margen lateral más cercano a 7.2 mm (R0)',
        ihqSummary: 'Melan-A (+), HMB-45 (+ zonal), SOX10 (+ difuso nuclear), Ki-67: 18%',
        macroImg: 'morfologia_ia_pleomorfismo.jpg'
    },
    {
        id: '26Q-0289',
        name: 'Huamán Cárdenas, Jorge',
        age: '54 años',
        gender: 'Masculino',
        specialty: 'neuro',
        procedure: 'Resección Tumoral Parietal Izquierda',
        organ: 'Tejido Encefálico Parieto-Occipital',
        status: 'status-process',
        statusText: 'En Proceso',
        date: '11/09/2026',
        dr: 'Dr. Alejandro Escalante',
        hospital: 'Servicio de Neurocirugía de Alta Complejidad',
        macroscopy: 'Múltiples fragmentos irregulares pardos-rojizos friables de consistencia blanda que miden en conjunto 3.6 x 2.4 x 1.8 cm.',
        diagnosis: 'REPORTE PRELIMINAR DE BIOPSIA POR CONGELACIÓN / DEFINITIVA: NEOPLASIA GLIAL INFILTRANTE DE ALTO GRADO SUGESTIVA DE GLIOBLASTOMA (GRADO 4 OMS). PANEL DE BIOMARCADORES MOLECULARES EN PROCESAMIENTO URGENTE (IDH1 R132H, ATRX, p53, Ki-67). INFORME FINAL EN 12 HORAS.',
        margins: 'Resección citorreductora guiada por fluorescencia intraoperatoria',
        ihqSummary: 'Panel molecular en curso (IDH1, p53, ATRX, Ki-67)',
        macroImg: 'morfologia_he_original.jpg'
    },
    {
        id: '26Q-0293',
        name: 'Salazar Benítez, Roberto',
        age: '49 años',
        gender: 'Masculino',
        specialty: 'sarcoma',
        procedure: 'Tumor de Muslo (Biopsia Incisional & Resección)',
        organ: 'Tejidos Blandos del Muslo Derecho',
        status: 'status-completed',
        statusText: 'Completado',
        date: '08/09/2026',
        dr: 'Dr. Diego Chungui',
        hospital: 'Unidad de Cirugía de Sarcomas & Partes Blandas',
        macroscopy: 'Pieza quirúrgica elipsoide de 8.5 x 5.8 x 4.2 cm con masa tumoral blanquecina de consistencia firme-elástica que mide 4.6 cm.',
        diagnosis: 'DERMATOFIBROSARCOMA PROTUBERANS (DFSP) CLÁSICO. PROLIFERACIÓN DE CÉLULAS FUSIFORMES CON PATRÓN ESTORIFORME TÍPICO EN RUEDA DE CARRETA E INFILTRACIÓN EN PANAL DE ABEJA EN TEJIDO ADIPOSO. MÁRGENES QUIRÚRGICOS LIBRES DE LESIÓN (R0).',
        margins: 'Margen profundo sobre fascia muscular libre a 4.5 mm (R0)',
        ihqSummary: 'CD34: (+) Intenso y difuso en 100% • S100: (-) Negativo • Desmina: (-) Negativo',
        macroImg: 'morfologia_ia_pleomorfismo.jpg'
    },
    {
        id: '26Q-0298',
        name: 'Cabrera Ramos, Elena',
        age: '58 años',
        gender: 'Femenino',
        specialty: 'hemato',
        procedure: 'Biopsia de Adenopatía Cervical',
        organ: 'Ganglio Linfático Cervical Nivel II',
        status: 'status-completed',
        statusText: 'Completado',
        date: '07/09/2026',
        dr: 'Dr. Manuel Sánchez',
        hospital: 'Hematología & Oncología Médica',
        macroscopy: 'Pieza nodular encapsulada de 3.2 x 2.4 x 1.6 cm con superficie de corte blanquecina homogénea carnosa tipo carne de pescado.',
        diagnosis: 'LINFOMA NO HODGKIN DIFUSO DE CÉLULAS GRANDES B (DLBCL). SUBTIPO DE CENTRO GERMINAL (ALGORITMO DE HANS). ÍNDICE DE PROLIFERACIÓN CELULAR KI-67: 85%. NEGATIVO PARA DOBLE HIT (MYC / BCL2 NEGATIVO).',
        margins: 'Cápsula ganglionar respetada en los bordes resecados (R0)',
        ihqSummary: 'CD20: (+) Difuso membranoso • CD10: (+) • BCL-6: (+) • MUM1: (-) • Ki-67: 85%',
        macroImg: 'morfologia_he_original.jpg'
    }
];

// Estado interactivo del simulador
let currentPhoneFilter = 'all';
let currentPhoneQuery = '';
let currentPhoneTab = 'reports';

function initSmartphoneSimulator() {
    const listContainer = document.getElementById('phonePatientsList');
    if (!listContainer) return;

    // Inicializar reloj del smartphone en vivo
    updatePhoneClock();
    setInterval(updatePhoneClock, 1000);

    // Renderizar pacientes iniciales
    applyPhoneFilters();

    // Renderizar sub-vistas del teléfono
    renderPhoneNotifications();
    renderPhoneSettings();

    // Búsqueda en tiempo real
    const searchInput = document.getElementById('phoneSearchInput');
    const clearBtn = document.getElementById('phoneSearchClear');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentPhoneQuery = (e.target.value || '').trim().toLowerCase();
            if (clearBtn) {
                clearBtn.style.display = currentPhoneQuery.length > 0 ? 'block' : 'none';
            }
            applyPhoneFilters();
        });
    }

    window.addEventListener('appmovil-activated', () => {
        updatePhoneClock();
        applyPhoneFilters();
    });
}

function updatePhoneClock() {
    const clockEl = document.getElementById('phoneLiveClock');
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
}

function applyPhoneFilters() {
    let filtered = PATIENTS_DATA;

    // Filtro por Estado
    if (currentPhoneFilter === 'process') {
        filtered = filtered.filter(p => p.status === 'status-process');
    } else if (currentPhoneFilter === 'completed') {
        filtered = filtered.filter(p => p.status === 'status-completed' || p.status === 'status-ready');
    }

    // Filtro por Búsqueda de Texto
    if (currentPhoneQuery) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(currentPhoneQuery) ||
            p.id.toLowerCase().includes(currentPhoneQuery) ||
            p.procedure.toLowerCase().includes(currentPhoneQuery) ||
            p.diagnosis.toLowerCase().includes(currentPhoneQuery) ||
            p.dr.toLowerCase().includes(currentPhoneQuery) ||
            p.organ.toLowerCase().includes(currentPhoneQuery)
        );
    }

    // Actualizar contadores en tabs
    updatePhoneCounters();

    // Renderizar en lista
    renderPhonePatients(filtered);

    // Actualizar texto resumen
    const summaryText = document.getElementById('phonePatientsCountText');
    if (summaryText) {
        summaryText.innerHTML = `<i class="fa-solid fa-list-check" style="color: #38bdf8;"></i> Mostrando ${filtered.length} de ${PATIENTS_DATA.length} biopsias`;
    }
}

function updatePhoneCounters() {
    const countAll = document.getElementById('countAll');
    const countProcess = document.getElementById('countProcess');
    const countCompleted = document.getElementById('countCompleted');

    if (countAll) countAll.textContent = PATIENTS_DATA.length;
    if (countProcess) {
        const inProcess = PATIENTS_DATA.filter(p => p.status === 'status-process').length;
        countProcess.textContent = inProcess;
    }
    if (countCompleted) {
        const completed = PATIENTS_DATA.filter(p => p.status === 'status-completed' || p.status === 'status-ready').length;
        countCompleted.textContent = completed;
    }
}

function renderPhonePatients(patients) {
    const listContainer = document.getElementById('phonePatientsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (patients.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 35px 15px; color: #64748b;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 26px; margin-bottom: 8px; color: #334155;"></i>
                <div style="font-size: 11px; font-weight: 700; color: #cbd5e1;">Sin resultados para la búsqueda</div>
                <div style="font-size: 9.5px; margin-top: 4px;">Intenta con otro paciente o código 26Q-...</div>
                <button type="button" class="btn-phone-action btn-phone-pdf" style="margin: 12px auto 0 auto; max-width: 130px;" onclick="clearPhoneSearch()">
                    Ver todas las biopsias
                </button>
            </div>
        `;
        return;
    }

    patients.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = `phone-patient-card ${idx === 0 ? 'active' : ''}`;
        card.setAttribute('data-specialty', p.specialty);
        card.setAttribute('data-id', p.id);
        // Permitir click en toda la tarjeta para abrir el informe
        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            openPhoneReport(p.id);
        };

        card.innerHTML = `
            <div class="p-card-top">
                <span class="p-card-name">${p.name}</span>
                <span class="p-card-status ${p.status}">${p.statusText}</span>
            </div>
            <div class="p-card-proc">
                <i class="fa-solid fa-microscope" style="color: #38bdf8; font-size: 9px;"></i>
                <span>${p.procedure}</span>
            </div>
            <div class="p-card-diag-preview">
                <strong>Diagnóstico:</strong> ${p.diagnosis.slice(0, 110)}...
            </div>
            <div class="p-card-meta">
                <span class="p-dr"><i class="fa-solid fa-user-doctor"></i> ${p.dr}</span>
                <span class="p-id">#${p.id}</span>
            </div>
            <div class="p-card-actions">
                <button type="button" class="btn-phone-action btn-phone-pdf" onclick="openPhoneReport('${p.id}')" title="Ver Informe Quirúrgico Oficial">
                    <i class="fa-solid fa-file-waveform"></i> Ver Informe
                </button>
                <button type="button" class="btn-phone-action btn-phone-360" onclick="openPhoneMacro('${p.id}')" title="Visor de Fotografía Macroscópica">
                    <i class="fa-solid fa-arrows-spin"></i> Visor 360°
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

window.setPhoneFilter = function(filter) {
    currentPhoneFilter = filter;
    const buttons = document.querySelectorAll('.phone-subtab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    // Si no estamos en la vista de lista, volver a ella
    switchPhoneTab('reports');
    applyPhoneFilters();
};

window.switchPhoneTab = function(tabName) {
    currentPhoneTab = tabName;

    // Actualizar botones de la barra inferior
    const navItems = document.querySelectorAll('.phone-nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Cerrar modal si estuviese abierto
    closePhoneModal();

    // Conmutar pantallas internas del móvil
    const viewList = document.getElementById('phoneListView');
    const viewNotif = document.getElementById('phoneNotificationsView');
    const viewSet = document.getElementById('phoneSettingsView');

    if (viewList) viewList.style.display = tabName === 'reports' ? 'flex' : 'none';
    if (viewNotif) viewNotif.style.display = tabName === 'notifications' ? 'flex' : 'none';
    if (viewSet) viewSet.style.display = tabName === 'settings' ? 'flex' : 'none';
};

window.focusPhoneSearch = function() {
    switchPhoneTab('reports');
    const searchInput = document.getElementById('phoneSearchInput');
    if (searchInput) {
        searchInput.focus();
        showPhoneToast('Ingresa nombre o código de biopsia 26Q-...', 'fa-magnifying-glass');
    }
};

window.clearPhoneSearch = function() {
    const searchInput = document.getElementById('phoneSearchInput');
    const clearBtn = document.getElementById('phoneSearchClear');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    currentPhoneQuery = '';
    applyPhoneFilters();
    showPhoneToast('Lista de biopsias restablecida', 'fa-arrows-rotate');
};

window.refreshPhoneData = function() {
    const syncBtn = document.querySelector('.btn-phone-sync');
    if (syncBtn) {
        syncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando...';
        setTimeout(() => {
            syncBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> En vivo';
            showPhoneToast('Sincronizado con LIS Hospitalario & Servidor WSI', 'fa-circle-check');
        }, 500);
    }
};

window.showPhoneToast = function(msg, icon = 'fa-circle-check') {
    const toast = document.getElementById('phoneToast');
    const toastMsg = document.getElementById('phoneToastMsg');
    if (!toast || !toastMsg) return;

    toast.querySelector('i').className = `fa-solid ${icon}`;
    toastMsg.textContent = msg;
    toast.classList.add('show');

    if (window._phoneToastTimeout) clearTimeout(window._phoneToastTimeout);
    window._phoneToastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
};

/* ==========================================================================
   REPORTE PATOLÓGICO QUIRÚRGICO DENTRO DEL SMARTPHONE
   ========================================================================== */
window.openPhoneReport = function(id) {
    const p = PATIENTS_DATA.find(item => item.id === id);
    if (!p) return;

    const modal = document.getElementById('phoneReportModal');
    const content = document.getElementById('phoneReportContent');
    const headerId = document.getElementById('phoneReportHeaderId');
    if (!modal || !content) return;

    if (headerId) headerId.textContent = p.id;

    // SVG QR oficial con diseño nítido
    const qrSvg = `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <rect width="100" height="100" fill="#ffffff" />
            <!-- Esquina superior izquierda -->
            <rect x="6" y="6" width="26" height="26" fill="#0f172a" rx="3" />
            <rect x="11" y="11" width="16" height="16" fill="#ffffff" rx="1" />
            <rect x="15" y="15" width="8" height="8" fill="#0284c7" />
            <!-- Esquina superior derecha -->
            <rect x="68" y="6" width="26" height="26" fill="#0f172a" rx="3" />
            <rect x="73" y="11" width="16" height="16" fill="#ffffff" rx="1" />
            <rect x="77" y="15" width="8" height="8" fill="#0284c7" />
            <!-- Esquina inferior izquierda -->
            <rect x="6" y="68" width="26" height="26" fill="#0f172a" rx="3" />
            <rect x="11" y="73" width="16" height="16" fill="#ffffff" rx="1" />
            <rect x="15" y="77" width="8" height="8" fill="#0284c7" />
            <!-- Módulos de datos simulados -->
            <rect x="38" y="8" width="8" height="6" fill="#0f172a" />
            <rect x="52" y="8" width="10" height="6" fill="#0f172a" />
            <rect x="38" y="20" width="6" height="10" fill="#0f172a" />
            <rect x="50" y="20" width="12" height="6" fill="#0284c7" />
            <rect x="8" y="38" width="6" height="12" fill="#0f172a" />
            <rect x="20" y="38" width="8" height="8" fill="#0f172a" />
            <rect x="34" y="36" width="12" height="12" fill="#0284c7" rx="2" />
            <rect x="52" y="34" width="14" height="6" fill="#0f172a" />
            <rect x="72" y="38" width="10" height="6" fill="#0f172a" />
            <rect x="86" y="38" width="8" height="12" fill="#0f172a" />
            <rect x="38" y="54" width="8" height="10" fill="#0f172a" />
            <rect x="52" y="52" width="12" height="12" fill="#0284c7" />
            <rect x="70" y="52" width="8" height="8" fill="#0f172a" />
            <rect x="84" y="56" width="10" height="8" fill="#0f172a" />
            <rect x="38" y="70" width="12" height="8" fill="#0f172a" />
            <rect x="56" y="70" width="8" height="12" fill="#0f172a" />
            <rect x="70" y="74" width="14" height="8" fill="#0f172a" />
            <rect x="42" y="86" width="16" height="8" fill="#0284c7" />
            <rect x="64" y="86" width="10" height="8" fill="#0f172a" />
            <rect x="80" y="86" width="14" height="8" fill="#0f172a" />
        </svg>
    `;

    content.innerHTML = `
        <div class="phone-report-doc">
            <!-- Membrete Oficial -->
            <div class="p-rep-letterhead">
                <div>
                    <div class="p-rep-brand-title">
                        <i class="fa-solid fa-circle-nodes" style="color: #38bdf8;"></i>
                        JC PATH LAB <strong>ONCOLOGÍA</strong>
                    </div>
                    <div class="p-rep-doc-auth">
                        Dr. Joseph Castillo &bull; Patólogo Clínico CMP 56435 - RNE 32890<br>
                        RUC 20601234567 &bull; Certificación Digital ISO 15189
                    </div>
                </div>
                <div>
                    <span class="p-rep-badge-val"><i class="fa-solid fa-shield-check"></i> Oficial Valedero</span>
                </div>
            </div>

            <!-- Ficha Clínica del Paciente -->
            <div class="p-rep-grid">
                <div class="p-rep-field">
                    <span class="p-rep-label">Paciente</span>
                    <span class="p-rep-value">${p.name.toUpperCase()}</span>
                </div>
                <div class="p-rep-field">
                    <span class="p-rep-label">Código de Biopsia</span>
                    <span class="p-rep-value font-mono" style="color: #38bdf8;">#${p.id}</span>
                </div>
                <div class="p-rep-field">
                    <span class="p-rep-label">Edad / Sexo</span>
                    <span class="p-rep-value">${p.age} &bull; ${p.gender}</span>
                </div>
                <div class="p-rep-field">
                    <span class="p-rep-label">Fecha Emisión</span>
                    <span class="p-rep-value">${p.date}</span>
                </div>
                <div class="p-rep-field" style="grid-column: span 2;">
                    <span class="p-rep-label">Médico Tratante &bull; Servicio</span>
                    <span class="p-rep-value">${p.dr} &bull; ${p.hospital}</span>
                </div>
                <div class="p-rep-field" style="grid-column: span 2;">
                    <span class="p-rep-label">Procedimiento Quirúrgico</span>
                    <span class="p-rep-value" style="color: #93c5fd;">${p.procedure}</span>
                </div>
            </div>

            <!-- Descripción Macroscópica -->
            <div class="p-rep-section">
                <div class="p-rep-sec-title">
                    <i class="fa-solid fa-magnifying-glass"></i> I. DESCRIPCIÓN MACROSCÓPICA (CAP 2026)
                </div>
                <div class="p-rep-sec-content">
                    ${p.macroscopy}
                </div>
            </div>

            <!-- Diagnóstico Histopatológico con Márgenes R0 -->
            <div class="p-rep-section">
                <div class="p-rep-sec-title" style="color: #38bdf8;">
                    <i class="fa-solid fa-microscope"></i> II. DIAGNÓSTICO HISTOPATOLÓGICO DEFINITIVO
                </div>
                <div class="p-rep-sec-content diagnosis-box">
                    <strong>${p.diagnosis}</strong>
                    <div style="margin-top: 6px;">
                        <span class="p-rep-margins-tag">
                            <i class="fa-solid fa-check-double"></i> ${p.margins}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Biomarcadores e Inmunohistoquímica si aplica -->
            <div class="p-rep-section">
                <div class="p-rep-sec-title">
                    <i class="fa-solid fa-dna"></i> III. BIOMARCADORES & INMUNOHISTOQUÍMICA
                </div>
                <div class="p-rep-sec-content" style="font-size: 8.5px;">
                    ${p.ihqSummary}
                </div>
            </div>

            <!-- Certificación Médico-Legal, Firma Digital y QR -->
            <div class="p-rep-legal-footer">
                <div class="p-rep-qr-wrap">
                    <div class="p-rep-qr-code" title="QR de Verificación Sunat & LIS">${qrSvg}</div>
                    <div class="p-rep-legal-meta">
                        <span style="font-size: 8px; color: #10b981; font-weight: 800;">
                            <i class="fa-solid fa-fingerprint"></i> Firma Digital Criptográfica
                        </span>
                        <span style="font-size: 7px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
                            SHA-256: 9e3b...${p.id.replace('-', '')}fd1a
                        </span>
                        <span style="font-size: 7.5px; color: #94a3b8;">
                            Despacho Digital Instantáneo &bull; Validez Pericial
                        </span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <img src="firma_sello.png" class="p-rep-seal-img" alt="Firma Dr. Joseph Castillo">
                </div>
            </div>

            <!-- Botonera de Acciones Inmediatas -->
            <div class="p-rep-action-toolbar">
                <button type="button" class="btn-rep-action pdf" onclick="downloadPhonePDF('${p.id}')">
                    <i class="fa-solid fa-file-pdf"></i> Descargar PDF
                </button>
                <button type="button" class="btn-rep-action wsp" onclick="sharePhoneWhatsApp('${p.id}')">
                    <i class="fa-brands fa-whatsapp"></i> Enviar por WhatsApp
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
};

window.closePhoneModal = function() {
    const modal = document.getElementById('phoneReportModal');
    if (modal) modal.classList.remove('active');
};

window.openPhoneMacro = function(id) {
    const p = PATIENTS_DATA.find(item => item.id === id);
    if (!p) return;

    const modal = document.getElementById('phoneReportModal');
    const content = document.getElementById('phoneReportContent');
    const headerId = document.getElementById('phoneReportHeaderId');
    if (!modal || !content) return;

    if (headerId) headerId.textContent = `${p.id} • MACRO 360°`;

    content.innerHTML = `
        <div class="phone-report-doc" style="height: 100%; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 6px; margin-bottom: 8px;">
                <span style="font-weight: 800; color: #38bdf8; font-size: 10px;">
                    <i class="fa-solid fa-arrows-spin"></i> REGISTRO FOTOGRÁFICO DE TALLADO
                </span>
                <span class="font-mono" style="color: #a855f7; font-weight: 800; font-size: 9px;">#${p.id}</span>
            </div>
            <div style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 8px; background: #000000; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="${p.macroImg}" style="width: 100%; height: 100%; object-fit: cover;" alt="Tallado Quirúrgico">
                <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); padding: 3px 8px; border-radius: 4px; font-size: 8px; color: #38bdf8; font-weight: 700;">
                    <i class="fa-solid fa-check"></i> Márgenes entintados protocolo CAP
                </div>
            </div>
            <div style="margin-top: 8px; font-size: 8.5px; color: #cbd5e1; line-height: 1.35;">
                <p><strong>Espécimen:</strong> ${p.organ}</p>
                <p style="color: #94a3b8;">${p.macroscopy}</p>
            </div>
            <div class="p-rep-action-toolbar" style="margin-top: 10px;">
                <button type="button" class="btn-rep-action pdf" onclick="openPhoneReport('${p.id}')">
                    <i class="fa-solid fa-file-lines"></i> Ver Informe Escrito
                </button>
                <button type="button" class="btn-rep-action wsp" onclick="sharePhoneWhatsApp('${p.id}')">
                    <i class="fa-brands fa-whatsapp"></i> Compartir Foto
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
};

/* ==========================================================================
   DESCARGA DE PDF & ENVÍO POR WHATSAPP
   ========================================================================== */
window.downloadPhonePDF = function(id) {
    const p = PATIENTS_DATA.find(item => item.id === id);
    if (!p) return;

    showPhoneToast(`Generando PDF Oficial ${p.id}...`, 'fa-spinner fa-spin');

    // Generar archivo descargable con contenido clínico
    setTimeout(() => {
        const reportText = `===============================================================
JC PATH LAB • CENTRO ESPECIALIZADO DE ANATOMÍA PATOLÓGICA
DR. JOSEPH CASTILLO • CMP 56435 • RNE 32890
===============================================================
INFORME HISTOPATOLÓGICO QUIRÚRGICO OFICIAL
CÓDIGO DE BIOPSIA: ${p.id}
FECHA DE EMISIÓN: ${p.date}
PACIENTE: ${p.name.toUpperCase()} (${p.age}, ${p.gender})
MÉDICO SOLICITANTE: ${p.dr}
SERVICIO: ${p.hospital}
ESTUDIO: ${p.procedure}
ÓRGANO: ${p.organ}

I. DESCRIPCIÓN MACROSCÓPICA:
${p.macroscopy}

II. DIAGNÓSTICO HISTOPATOLÓGICO DEFINITIVO:
${p.diagnosis}

MÁRGENES QUIRÚRGICOS:
${p.margins}

III. INMUNOHISTOQUÍMICA & BIOMARCADORES:
${p.ihqSummary}

ESTADO DE FIRMA: CERTIFICADO Y FIRMADO DIGITALMENTE (SUNAT / LIS)
HASH DE INTEGRIDAD: SHA-256-JC-${p.id.replace('-', '')}-VALID
===============================================================`;

        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `INFORME_${p.id}_${p.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showPhoneToast(`¡Informe ${p.id} descargado con éxito!`, 'fa-file-circle-check');
    }, 600);
};

window.sharePhoneWhatsApp = function(id) {
    const p = PATIENTS_DATA.find(item => item.id === id);
    if (!p) return;

    const msg = encodeURIComponent(
        `*JC PATH LAB • Reporte Quirúrgico Oficial*\n` +
        `*ID Biopsia:* ${p.id}\n` +
        `*Paciente:* ${p.name}\n` +
        `*Estudio:* ${p.procedure}\n` +
        `*Diagnóstico:* ${p.diagnosis.slice(0, 140)}...\n` +
        `*Márgenes:* ${p.margins}\n` +
        `*Médico:* ${p.dr}\n` +
        `*Ver Informe Digital Seguro:* https://jcpathlab.pe/informe/${p.id}`
    );

    const whatsappUrl = `https://api.whatsapp.com/send?text=${msg}`;
    window.open(whatsappUrl, '_blank');
    showPhoneToast(`Enlace seguro de ${p.id} preparado para WhatsApp`, 'fa-brands fa-whatsapp');
};

/* ==========================================================================
   SUB-VISTAS DEL SMARTPHONE: NOTIFICACIONES & AJUSTES
   ========================================================================== */
function renderPhoneNotifications() {
    const container = document.getElementById('phoneNotificationsList');
    if (!container) return;

    const notifs = [
        {
            icon: 'fa-file-circle-check',
            type: 'green',
            title: 'Biopsia 26Q-0182 Firmada',
            desc: 'García Morales, Juan: Gastrectomía D2 validada con márgenes R0 libres.',
            time: 'Hace 4 minutos',
            id: '26Q-0182',
            unread: true
        },
        {
            icon: 'fa-shield-halved',
            type: 'blue',
            title: 'Despacho Digital 26Q-0194',
            desc: 'Mendoza Ríos, Carlos: Prostatectomía radical Gleason 4+3 despachada.',
            time: 'Hace 22 minutos',
            id: '26Q-0194',
            unread: true
        },
        {
            icon: 'fa-clock-rotate-left',
            type: 'amber',
            title: 'Muestra 26Q-0289 en Proceso',
            desc: 'Huamán Cárdenas, Jorge: Inclusión histológica urgente iniciada.',
            time: 'Hace 1 hora',
            id: '26Q-0289',
            unread: false
        }
    ];

    container.innerHTML = notifs.map(n => `
        <div class="phone-notification-card ${n.unread ? 'unread' : ''}" onclick="openPhoneReport('${n.id}')">
            <div class="p-notif-icon ${n.type}">
                <i class="fa-solid ${n.icon}"></i>
            </div>
            <div class="p-notif-body">
                <span class="p-notif-title">${n.title}</span>
                <span class="p-notif-desc">${n.desc}</span>
                <span class="p-notif-time"><i class="fa-regular fa-clock"></i> ${n.time}</span>
            </div>
        </div>
    `).join('');
}

function renderPhoneSettings() {
    const container = document.getElementById('phoneSettingsScroll');
    if (!container) return;

    container.innerHTML = `
        <div class="phone-setting-card">
            <div style="font-size: 10.5px; font-weight: 800; color: #38bdf8; margin-bottom: 8px;">
                <i class="fa-solid fa-bell"></i> Canales de Despacho Inmediato
            </div>
            <div class="phone-setting-row">
                <div>
                    <div class="p-set-label">Alertas Push vía WhatsApp</div>
                    <div class="p-set-desc">Recibir aviso apenas se emita el informe</div>
                </div>
                <div class="phone-toggle-switch" onclick="toggleSwitch(this)"><div class="phone-toggle-knob"></div></div>
            </div>
            <div class="phone-setting-row">
                <div>
                    <div class="p-set-label">Descarga de Microfotografías 40x</div>
                    <div class="p-set-desc">Adjuntar láminas digitales en alta resolución</div>
                </div>
                <div class="phone-toggle-switch" onclick="toggleSwitch(this)"><div class="phone-toggle-knob"></div></div>
            </div>
            <div class="phone-setting-row">
                <div>
                    <div class="p-set-label">Avisos de Biopsia por Congelación</div>
                    <div class="p-set-desc">Prioridad crítica intraoperatoria</div>
                </div>
                <div class="phone-toggle-switch" onclick="toggleSwitch(this)"><div class="phone-toggle-knob"></div></div>
            </div>
        </div>

        <div class="phone-setting-card">
            <div style="font-size: 10.5px; font-weight: 800; color: #10b981; margin-bottom: 8px;">
                <i class="fa-solid fa-user-shield"></i> Credenciales de Especialista
            </div>
            <div style="font-size: 9px; color: #cbd5e1; line-height: 1.4;">
                <p><strong>Patólogo Responsable:</strong> Dr. Joseph Castillo</p>
                <p><strong>Colegiatura:</strong> CMP 56435 &bull; RNE 32890</p>
                <p><strong>Soporte Directo:</strong> +51 987 654 321</p>
            </div>
            <button type="button" class="btn-phone-action btn-phone-pdf" style="margin-top: 10px; width: 100%;" onclick="showPhoneToast('Línea médica directa conectada', 'fa-phone')">
                <i class="fa-solid fa-headset"></i> Contactar al Dr. Castillo
            </button>
        </div>
    `;
}

window.toggleSwitch = function(el) {
    const knob = el.querySelector('.phone-toggle-knob');
    if (el.style.background === 'rgb(51, 65, 85)' || el.style.background === '#334155') {
        el.style.background = '#0284c7';
        knob.style.transform = 'translateX(0)';
        showPhoneToast('Preferencia activada', 'fa-check');
    } else {
        el.style.background = '#334155';
        knob.style.transform = 'translateX(-17px)';
        showPhoneToast('Preferencia pausada', 'fa-pause');
    }
};

/* ==========================================================================
   2. VISOR WSI GIGAPÍXEL INTERACTIVO PROFESIONAL (PANTALLA 1)
   ========================================================================== */
const WSI_DATA = {
    prostate: {
        id: 'prostate',
        name: 'Carcinoma de Próstata (Gleason 4+3)',
        title: 'Biopsia Prostática (Adenocarcinoma Acinar Gleason 4+3 = 7, ISUP 3)',
        image: 'wsi_slides/muestra_1_carcinoma_prostata_real.webp',
        thumb: 'wsi_slides/muestra_1_carcinoma_prostata_real_thumb.webp',
        organ: 'Próstata / Uropatología',
        organShort: 'Próstata',
        stain: 'H&E 40x (0.25 µm/px)',
        stainShort: 'H&E 40x',
        diagnosis: 'Adenocarcinoma Acinar de Próstata — Gleason 4+3 = 7 (ISUP Grado 3)',
        findings: 'Cilindros de biopsia prostática con proliferación maligna epitelial que infiltra el estroma fibromuscular prostático. Predominio de glándulas cribiformes irregulares y luces fusionadas (patrón Gleason 4) asociadas a glándulas individuales bien formadas (patrón Gleason 3). Nucleomegalia marcada con macronucléolos prominentes y pérdida completa de la capa de células basales.',
        note: 'Biopsia prostática con adenocarcinoma acinar Gleason 4+3 (ISUP 3), luces cribiformes confluentes y atipia citológica severa.',
        aiTags: [
            { text: 'Luces Cribiformes (Patrón 4)', class: 'tag-pleomorphism', top: '40%', left: '45%' },
            { text: 'Macronucléolos Prominentes 99%', class: 'tag-mitosis', top: '55%', left: '62%' },
            { text: 'Estroma Fibromuscular Infiltrado', class: 'tag-stroma', top: '70%', left: '28%' }
        ],
        aiLegend: [
            { color: 'leg-red', text: 'Patrón Gleason 4 (Cribiforme)' },
            { color: 'leg-sky', text: 'Glándulas Neoplásicas Gleason 3' },
            { color: 'leg-green', text: 'Estroma Fibromuscular' }
        ]
    },
    gastric: {
        id: 'gastric',
        name: 'Biopsia Gástrica (H&E 40x)',
        title: 'Biopsia Gástrica (Adenocarcinoma / Mucosa Digestiva H&E 40x)',
        image: 'wsi_slides/muestra_2_biopsia_gastrica.webp',
        thumb: 'wsi_slides/muestra_2_biopsia_gastrica_thumb.webp',
        organ: 'Estómago / Gastroenteropatología',
        organShort: 'Estómago',
        stain: 'H&E 40x (0.25 µm/px)',
        stainShort: 'H&E 40x',
        diagnosis: 'Biopsia Gástrica: Adenocarcinoma Infiltrante / Neoplasia Digestiva Maligna',
        findings: 'Fragmentos de mucosa gástrica con arquitectura glandular foveolar desestructurada por neoplasia maligna epitelial infiltrante en lámina propia. Formación de túbulos atípicos irregulares de contorno cribiforme, marcada pérdida de polaridad, hipercromatismo nuclear, figuras mitóticas atípicas y respuesta desmoplásica estromal activa.',
        note: 'Distorsión glandular profunda con luces confluentes, pleomorfismo severo, mitosis atípicas y desmoplasia estromal peritumoral.',
        aiTags: [
            { text: 'Mitosis Atípica 98%', class: 'tag-mitosis', top: '38%', left: '42%' },
            { text: 'Pleomorfismo Nuclear Severo', class: 'tag-pleomorphism', top: '52%', left: '58%' },
            { text: 'Desmoplasia Estromal Activa', class: 'tag-stroma', top: '65%', left: '33%' }
        ],
        aiLegend: [
            { color: 'leg-red', text: 'Mitosis Atípicas' },
            { color: 'leg-sky', text: 'Glándulas Neoplásicas Infiltrantes' },
            { color: 'leg-green', text: 'Desmoplasia Estromal' }
        ]
    },
    renal: {
        id: 'renal',
        name: 'Corte Quirúrgico Renal (H&E)',
        title: 'Corte Quirúrgico Renal (Oncocitoma Benigno / Parénquima Renal H&E 40x)',
        image: 'wsi_slides/muestra_3_carcinoma_acinar.webp',
        thumb: 'wsi_slides/muestra_3_carcinoma_acinar_thumb.webp',
        organ: 'Riñón / Nefropatología Quirúrgica',
        organShort: 'Riñón',
        stain: 'H&E 40x (0.25 µm/px)',
        stainShort: 'H&E 40x',
        diagnosis: 'Corte Quirúrgico Renal: Oncocitoma Benigno / Proliferación Epitelial Oncocítica',
        findings: 'Proliferación epitelial bien delimitada compuesta por nidos sólidos y estructuras túbulo-quísticas de células oncocíticas de amplio citoplasma granular intensamente eosinófilo. Núcleos redondos monomórficos centrales sin mitosis atípicas ni necrosis, inmersos en un estroma laxo mixoide o hialinizado.',
        note: 'Arquitectura en nidos de células oncocíticas de citoplasma eosinófilo denso sin atipia citológica destructiva.',
        aiTags: [
            { text: 'Nidos Oncocíticos Típicos', class: 'tag-pleomorphism', top: '40%', left: '45%' },
            { text: 'Citoplasma Eosinófilo Granular', class: 'tag-mitosis', top: '55%', left: '62%' },
            { text: 'Estroma Hialino Central', class: 'tag-stroma', top: '70%', left: '28%' }
        ],
        aiLegend: [
            { color: 'leg-red', text: 'Nidos Oncocíticos' },
            { color: 'leg-sky', text: 'Células Oncocíticas' },
            { color: 'leg-green', text: 'Estroma Central' }
        ]
    }
};

// Retrocompatibilidad con nombres y claves anteriores
WSI_DATA.skin = WSI_DATA.prostate;
WSI_DATA.piel = WSI_DATA.prostate;
WSI_DATA.acinar = WSI_DATA.renal;
WSI_DATA.gastrica = WSI_DATA.gastric;

let currentSampleKey = 'skin';
let currentZoomLevel = 1.0; // 1.0 = 2x, 1.6 = 4x, 2.5 = 10x, 3.6 = 20x, 5.0 = 40x
let currentRotation = 0; // 0° - 360°
let isPanning = false;
let startX = 0, startY = 0;
let currentX = 0, currentY = 0;
let isAiActive = false;
let isLensActive = false;
let isDialDragging = false;

// Precarga inmediata de las 3 muestras histológicas en memoria RAM para 0ms lag
(function preloadWSISamples() {
    try {
        ['skin', 'gastric', 'acinar'].forEach(key => {
            if (WSI_DATA[key]) {
                const img = new Image();
                img.src = WSI_DATA[key].image;
                const thumb = new Image();
                thumb.src = WSI_DATA[key].thumb;
            }
        });
    } catch (e) {}
})();

// Control estricto de límites de Pan para que el tejido nunca desborde ni se pierda
function clampPanCoords(x, y) {
    const viewport = document.getElementById('wsiViewport');
    const vpW = viewport ? (viewport.clientWidth || window.innerWidth) : window.innerWidth;
    const vpH = viewport ? (viewport.clientHeight || (window.innerHeight - 52)) : (window.innerHeight - 52);

    const maxBoundX = Math.max(vpW * 0.45, (vpW * 0.52 * currentZoomLevel));
    const maxBoundY = Math.max(vpH * 0.45, (vpH * 0.52 * currentZoomLevel));

    return {
        x: Math.max(-maxBoundX, Math.min(maxBoundX, x)),
        y: Math.max(-maxBoundY, Math.min(maxBoundY, y))
    };
}

// Exponer funciones globales requeridas por screen-switcher.js
window.updateWSITransform = function() {
    applyWSITransform();
};

window.updateWSIZoomHUD = function() {
    updateScaleAndHUD();
};

function applyWSITransform() {
    const stage = document.getElementById('wsiTransformStage');
    if (!stage) return;
    const clamped = clampPanCoords(currentX, currentY);
    currentX = clamped.x;
    currentY = clamped.y;
    stage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoomLevel}) rotate(${currentRotation}deg)`;
    updateRotationHUD();
    updateScaleAndHUD();
    updateMinimapRect();
}

function updateRotationHUD() {
    const angleElem = document.getElementById('wsiAngleDisplay');
    if (angleElem) angleElem.textContent = `${Math.round(currentRotation)}°`;

    const dialText = document.getElementById('dialDegreesText');
    if (dialText) dialText.textContent = `${Math.round(currentRotation)}°`;

    const needle = document.getElementById('rotDialNeedle');
    if (needle) {
        needle.style.transform = `rotate(${currentRotation}deg)`;
    }

    // Actualizar botones de acceso rápido de rotación
    const quickBtns = document.querySelectorAll('.rot-quick-btn');
    quickBtns.forEach(btn => {
        const angle = parseInt(btn.getAttribute('data-angle'), 10);
        if (Math.abs(angle - currentRotation) < 3) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateScaleAndHUD() {
    const scaleVal = document.getElementById('wsiScaleValue');
    const scaleLine = document.getElementById('wsiScaleLine');
    const minimapMag = document.getElementById('minimapMagBadge');
    if (!scaleVal) return;

    let text = '250 µm';
    let lineWidth = '100px';
    let magLabel = '2x';

    if (currentZoomLevel >= 4.2) {
        text = '10 µm';
        lineWidth = '100px';
        magLabel = '40x';
    } else if (currentZoomLevel >= 3.0) {
        text = '25 µm';
        lineWidth = '90px';
        magLabel = '20x';
    } else if (currentZoomLevel >= 2.0) {
        text = '50 µm';
        lineWidth = '85px';
        magLabel = '10x';
    } else if (currentZoomLevel >= 1.3) {
        text = '100 µm';
        lineWidth = '95px';
        magLabel = '4x';
    } else {
        text = '250 µm';
        lineWidth = '100px';
        magLabel = '2x';
    }

    scaleVal.textContent = text;
    if (scaleLine) scaleLine.style.width = lineWidth;
    if (minimapMag) minimapMag.textContent = magLabel;

    // Actualizar píldoras de aumento
    const pills = document.querySelectorAll('.wsi-mag-pill');
    pills.forEach(p => {
        const pz = parseFloat(p.getAttribute('data-zoom'));
        if (Math.abs(pz - currentZoomLevel) < 0.25) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });
}

function updateMinimapRect() {
    const rect = document.getElementById('wsiMinimapRect');
    const box = document.getElementById('wsiMinimapBox');
    const viewport = document.getElementById('wsiViewport');
    if (!rect || !box || !viewport) return;

    const vpW = viewport.clientWidth || 1000;
    const vpH = viewport.clientHeight || 700;

    const zoom = Math.max(1, currentZoomLevel);
    const boxW = box.clientWidth || 144;
    const boxH = box.clientHeight || 96;

    // Tamaño proporcional del rectángulo visible
    const rw = Math.max(18, Math.min(boxW, boxW / zoom));
    const rh = Math.max(18, Math.min(boxH, boxH / zoom));

    // Desplazamiento relativo
    const maxPanX = vpW * 0.7;
    const maxPanY = vpH * 0.7;
    const normX = Math.max(-1, Math.min(1, currentX / (maxPanX * zoom)));
    const normY = Math.max(-1, Math.min(1, currentY / (maxPanY * zoom)));

    const rx = Math.max(0, Math.min(boxW - rw, (boxW - rw) / 2 - (normX * (boxW - rw) / 2)));
    const ry = Math.max(0, Math.min(boxH - rh, (boxH - rh) / 2 - (normY * (boxH - rh) / 2)));

    rect.style.width = `${rw}px`;
    rect.style.height = `${rh}px`;
    rect.style.left = `${rx}px`;
    rect.style.top = `${ry}px`;
}

function updateAiOverlayForSample(data) {
    const aiOverlay = document.getElementById('wsiAiOverlay');
    if (!aiOverlay || !data || !data.aiTags) return;

    let tagsHtml = '';
    data.aiTags.forEach(tag => {
        tagsHtml += `
            <div class="wsi-ai-tag ${tag.class}" style="top: ${tag.top}; left: ${tag.left};">
                <span class="ai-box"></span>
                <span class="ai-txt">${tag.text}</span>
            </div>
        `;
    });

    let legendHtml = '<div class="wsi-ai-legend">';
    if (data.aiLegend) {
        data.aiLegend.forEach(item => {
            legendHtml += `<div class="ai-leg-item"><span class="leg-color ${item.color}"></span> ${item.text}</div>`;
        });
    }
    legendHtml += '</div>';

    aiOverlay.innerHTML = tagsHtml + legendHtml;
}

function updateWSIIntroSidebar(data) {
    if (!data) return;

    // 1. Actualización de elementos directos por ID en la columna derecha
    const sidebarTitle = document.getElementById('wsiSidebarTitle') || document.getElementById('wsiIntroTitle');
    const sidebarDesc = document.getElementById('wsiSidebarDesc') || document.getElementById('wsiIntroDesc');
    const sidebarDiagTitle = document.getElementById('wsiDiagnosisHeading') || document.getElementById('wsiSidebarDiagTitle');
    const sidebarGleason = document.getElementById('wsiGleasonVal') || document.getElementById('wsiSidebarGleason');
    const sidebarIsup = document.getElementById('wsiIsupVal') || document.getElementById('wsiSidebarIsup');

    if (sidebarTitle) sidebarTitle.textContent = 'CENTRO DE PATOLOGÍA DIGITAL WSI 40X';
    if (sidebarDesc && data.introText) sidebarDesc.textContent = data.introText;

    if (data.id === 'prostate' || data.id === 'acinar') {
        if (sidebarDiagTitle) sidebarDiagTitle.textContent = 'Adenocarcinoma Acinar de Próstata';
        if (sidebarGleason) sidebarGleason.textContent = '4 + 3 = 7';
        if (sidebarIsup) sidebarIsup.textContent = 'ISUP 3';
    } else if (data.id === 'gastric') {
        if (sidebarDiagTitle) sidebarDiagTitle.textContent = 'Biopsia Gástrica: Adenocarcinoma Infiltrante';
        if (sidebarGleason) sidebarGleason.textContent = 'Laurén G2';
        if (sidebarIsup) sidebarIsup.textContent = 'pT3 R0';
    } else if (data.id === 'skin') {
        if (sidebarDiagTitle) sidebarDiagTitle.textContent = 'Piel: Dermatopatología (Infiltrado Dérmico)';
        if (sidebarGleason) sidebarGleason.textContent = 'Benigno';
        if (sidebarIsup) sidebarIsup.textContent = 'No Neoplásico';
    } else if (data.id === 'renal') {
        if (sidebarDiagTitle) sidebarDiagTitle.textContent = 'Corte Quirúrgico Renal: Oncocitoma Benigno';
        if (sidebarGleason) sidebarGleason.textContent = 'Benigno';
        if (sidebarIsup) sidebarIsup.textContent = 'OMS Grado 1';
    }

    // 2. Sincronizar botones de muestra activos en el panel lateral
    const sideBtns = document.querySelectorAll('.wsi-quick-sample-btn');
    sideBtns.forEach(btn => {
        const id = btn.id || '';
        const isMatch = ((data.id === 'prostate' || data.id === 'acinar') && (id.includes('Prostate') || id.includes('Acinar'))) ||
                        (data.id === 'gastric' && id.includes('Gastric')) ||
                        ((data.id === 'renal' || data.id === 'skin') && (id.includes('Renal') || id.includes('Skin')));
        if (isMatch) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
function switchWSISample(sampleKey) {
    if (!WSI_DATA[sampleKey]) return;
    currentSampleKey = sampleKey;
    const data = WSI_DATA[sampleKey];

    // Actualizar imagen principal y miniatura
    const slideImg = document.getElementById('wsiSlideImg');
    const minimapThumb = document.getElementById('wsiMinimapThumb');
    const sampleTitle = document.getElementById('wsiSampleTitle');
    const organBadge = document.getElementById('wsiOrganBadge');
    const sampleSub = document.getElementById('wsiSampleSub');
    const metaOrgan = document.getElementById('wsiMetaOrgan');
    const metaStain = document.getElementById('wsiMetaStain');
    const sampleNote = document.getElementById('wsiSampleNote');
    const lens = document.getElementById('wsiMagnifierLens');

    if (slideImg) slideImg.src = data.image;
    if (minimapThumb) minimapThumb.src = data.thumb;
    if (sampleTitle) sampleTitle.textContent = data.title;
    if (organBadge) organBadge.innerHTML = `<i class="fa-solid fa-microscope"></i> ${data.organ}`;
    if (metaOrgan) metaOrgan.textContent = data.organShort || data.organ;
    if (metaStain) metaStain.textContent = data.stainShort || data.stain || 'H&E 40x';
    if (sampleSub) sampleSub.textContent = data.findings || data.note;
    if (sampleNote) sampleNote.textContent = data.note || data.findings || data.diagnosis;

    // Actualizar lupa si estuviese abierta
    if (lens && isLensActive) {
        lens.style.backgroundImage = `url('${data.image}')`;
    }

    // Actualizar botones de muestra activos
    const sampleBtns = document.querySelectorAll('.wsi-sample-btn');
    sampleBtns.forEach(btn => {
        const btnSample = btn.getAttribute('data-sample');
        if (btnSample === sampleKey ||
            (sampleKey === 'skin' && (btnSample === 'prostate' || btnSample === 'skin')) ||
            (sampleKey === 'gastric' && (btnSample === 'renal' || btnSample === 'gastric')) ||
            (sampleKey === 'acinar' && btnSample === 'acinar')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Actualizar overlay de IA para la muestra actual
    updateAiOverlayForSample(data);

    // Actualizar sidebar interactivo
    updateWSIIntroSidebar(data);

    // Resetear posición suavemente: centrar Pan (0,0) y Zoom a 1.0 (2x), preservando la rotación activa (0°-360°)
    currentX = 0;
    currentY = 0;
    currentZoomLevel = 1.0;
    // currentRotation se mantiene intacta según especificación clínica
    applyWSITransform();

    if (typeof showWSIToast === 'function') {
        showWSIToast(`Muestra activa: ${data.name || data.title}`);
    }
}



function initWSIViewer() {
    const viewport = document.getElementById('wsiViewport');
    const slideImg = document.getElementById('wsiSlideImg');
    if (!viewport || !slideImg) return;

    // 1. Selector Dinámico de las 3 Muestras Histológicas Oficiales
    const sampleBtns = document.querySelectorAll('.wsi-sample-btn, .wsi-quick-sample-btn');
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-sample') || btn.getAttribute('data-wsi-sample');
            if (key) switchWSISample(key);
        });
    });

    const btnProstate = document.getElementById('btnSampleProstate') || document.getElementById('btnSampleSkin');
    const btnGastric = document.getElementById('btnSampleGastric');
    const btnRenal = document.getElementById('btnSampleRenal') || document.getElementById('btnSampleAcinar');

    if (btnProstate) btnProstate.addEventListener('click', () => switchWSISample('prostate'));
    if (btnGastric) btnGastric.addEventListener('click', () => switchWSISample('gastric'));
    if (btnRenal) btnRenal.addEventListener('click', () => switchWSISample('renal'));

    // Evitar propagación de clics y toques desde la barra lateral derecha hacia el viewport de pan
    const sidebar = document.querySelector('.wsi-intro-sidebar') || document.getElementById('wsiIntroSidebar');
    if (sidebar) {
        sidebar.addEventListener('mousedown', (e) => e.stopPropagation());
        sidebar.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        sidebar.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
    }

    // Toggle para Colapso / Expansión Quirúrgica del Sidebar (100% vs 80%)
    const btnSidebarToggle = document.getElementById('wsiSidebarToggleBtn');
    const splitContainer = document.getElementById('wsiSplitContainer') || document.getElementById('wsiMainLayout');
    if (btnSidebarToggle && splitContainer) {
        btnSidebarToggle.addEventListener('click', () => {
            splitContainer.classList.toggle('sidebar-collapsed');
            const isCollapsed = splitContainer.classList.contains('sidebar-collapsed');
            btnSidebarToggle.setAttribute('title', isCollapsed ? 'Mostrar Panel Lateral' : 'Colapsar Panel Lateral (100% Pantalla Completa)');
            const icon = btnSidebarToggle.querySelector('i');
            if (icon) {
                icon.className = isCollapsed ? 'fa-solid fa-angles-left' : 'fa-solid fa-angles-right';
            }
            setTimeout(() => {
                applyWSITransform();
            }, 330);
        });
    }

    // Toggle móvil para Drawer Deslizable del Caso Clínico
    const mobileDrawerHandle = document.getElementById('wsiMobileDrawerHandle');
    if (mobileDrawerHandle && sidebar) {
        mobileDrawerHandle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-expanded');
        });
    }

    // 2. Pan / Arrastre sobre el viewport izquierdo (80% del contenedor)
    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('#wsiRotationWidget') || 
            e.target.closest('.wsi-minimap-cluster') || 
            e.target.closest('.wsi-scale-cluster') ||
            e.target.closest('.wsi-intro-sidebar') ||
            e.target.closest('#wsiIntroSidebar')) return;
        isPanning = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        const rawX = e.clientX - startX;
        const rawY = e.clientY - startY;
        const clamped = clampPanCoords(rawX, rawY);
        currentX = clamped.x;
        currentY = clamped.y;
        applyWSITransform();
    });

    window.addEventListener('mouseup', () => {
        isPanning = false;
        if (viewport) viewport.style.cursor = 'grab';
    });

    // Soporte táctil móvil fluido (Pan y Pinch-to-zoom)
    let touchStartDist = 0;
    let initialZoom = 1.0;
    viewport.addEventListener('touchstart', (e) => {
        if (e.target.closest('#wsiRotationWidget') || 
            e.target.closest('.wsi-minimap-cluster') || 
            e.target.closest('.wsi-scale-cluster') ||
            e.target.closest('.wsi-intro-sidebar') ||
            e.target.closest('#wsiIntroSidebar')) return;

        if (e.touches.length === 1) {
            isPanning = true;
            startX = e.touches[0].clientX - currentX;
            startY = e.touches[0].clientY - currentY;
        } else if (e.touches.length === 2) {
            isPanning = false;
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialZoom = currentZoomLevel;
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (isPanning && e.touches.length === 1) {
            e.preventDefault();
            const rawX = e.touches[0].clientX - startX;
            const rawY = e.touches[0].clientY - startY;
            const clamped = clampPanCoords(rawX, rawY);
            currentX = clamped.x;
            currentY = clamped.y;
            applyWSITransform();
        } else if (e.touches.length === 2 && touchStartDist > 0) {
            e.preventDefault();
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor = currentDist / touchStartDist;
            currentZoomLevel = Math.max(1.0, Math.min(5.5, initialZoom * factor));
            applyWSITransform();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', () => {
        isPanning = false;
        touchStartDist = 0;
    });

    // 3. Zoom con Rueda del Ratón
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        currentZoomLevel = Math.max(1.0, Math.min(5.5, currentZoomLevel + delta));
        applyWSITransform();
    }, { passive: false });

    // 4. Botones de Zoom (+ y -)
    const btnZoomIn = document.getElementById('btnWsiZoomIn');
    const btnZoomOut = document.getElementById('btnWsiZoomOut');
    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            currentZoomLevel = Math.min(5.5, currentZoomLevel + 0.35);
            applyWSITransform();
        });
    }
    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            currentZoomLevel = Math.max(1.0, currentZoomLevel - 0.35);
            applyWSITransform();
        });
    }

    // 5. Botones de Píldoras de Aumento (2x, 4x, 10x, 20x, 40x)
    const magPills = document.querySelectorAll('.wsi-mag-pill');
    magPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const targetZoom = parseFloat(pill.getAttribute('data-zoom'));
            if (!isNaN(targetZoom)) {
                currentZoomLevel = targetZoom;
                applyWSITransform();
            }
        });
    });

    // 6. Controles de Rotación en Barra Superior
    const btnRotateCW = document.getElementById('btnWsiRotateCW');
    const btnRotateCCW = document.getElementById('btnWsiRotateCCW');
    const btnResetRot = document.getElementById('btnWsiResetRot');

    if (btnRotateCW) {
        btnRotateCW.addEventListener('click', () => {
            currentRotation = (currentRotation + 15) % 360;
            applyWSITransform();
        });
    }
    if (btnRotateCCW) {
        btnRotateCCW.addEventListener('click', () => {
            currentRotation = (currentRotation - 15 + 360) % 360;
            applyWSITransform();
        });
    }
    if (btnResetRot) {
        btnResetRot.addEventListener('click', () => {
            currentRotation = 0;
            applyWSITransform();
        });
    }

    // 7. Widget de Rotación: Dial Circular (0° a 360°)
    const dialWrap = document.getElementById('rotDialWrap');
    const dialCircle = document.getElementById('rotDialCircle');

    function handleDialRotate(clientX, clientY) {
        if (!dialCircle) return;
        const rect = dialCircle.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        let deg = Math.round(Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        if (deg < 0) deg += 360;
        if (deg >= 360) deg -= 360;
        currentRotation = deg;
        applyWSITransform();
    }

    if (dialWrap) {
        dialWrap.addEventListener('mousedown', (e) => {
            isDialDragging = true;
            handleDialRotate(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDialDragging) return;
            handleDialRotate(e.clientX, e.clientY);
        });

        window.addEventListener('mouseup', () => {
            isDialDragging = false;
        });

        dialWrap.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                isDialDragging = true;
                handleDialRotate(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDialDragging || e.touches.length === 0) return;
            handleDialRotate(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDialDragging = false;
        });
    }

    // Accesos Rápidos de Rotación (0°, 90°, 180°, 270°)
    const rotQuickBtns = document.querySelectorAll('.rot-quick-btn');
    rotQuickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const angle = parseInt(btn.getAttribute('data-angle'), 10);
            currentRotation = angle;
            applyWSITransform();
        });
    });

    // 8. Barra Táctil Flotante
    const btnTouchCenter = document.getElementById('btnTouchCenter');
    const btnTouchZoomIn = document.getElementById('btnTouchZoomIn');
    const btnTouchZoomOut = document.getElementById('btnTouchZoomOut');
    const btnTouchReset = document.getElementById('btnTouchReset');

    if (btnTouchCenter) {
        btnTouchCenter.addEventListener('click', () => {
            currentX = 0;
            currentY = 0;
            applyWSITransform();
        });
    }
    if (btnTouchZoomIn) {
        btnTouchZoomIn.addEventListener('click', () => {
            currentZoomLevel = Math.min(5.5, currentZoomLevel + 0.35);
            applyWSITransform();
        });
    }
    if (btnTouchZoomOut) {
        btnTouchZoomOut.addEventListener('click', () => {
            currentZoomLevel = Math.max(1.0, currentZoomLevel - 0.35);
            applyWSITransform();
        });
    }
    if (btnTouchReset) {
        btnTouchReset.addEventListener('click', () => {
            currentX = 0;
            currentY = 0;
            currentZoomLevel = 1.0;
            currentRotation = 0;
            applyWSITransform();
        });
    }

    // 9. Minimapa Radar: Click / Drag para centrar región
    const minimapBox = document.getElementById('wsiMinimapBox');
    if (minimapBox) {
        const navigateToMinimap = (clientX, clientY) => {
            const rect = minimapBox.getBoundingClientRect();
            const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

            const vpW = viewport.clientWidth || 1000;
            const vpH = viewport.clientHeight || 700;
            const maxPanX = vpW * 0.7;
            const maxPanY = vpH * 0.7;

            currentX = -((px - 0.5) * 2) * maxPanX * currentZoomLevel;
            currentY = -((py - 0.5) * 2) * maxPanY * currentZoomLevel;
            applyWSITransform();
        };

        let isMinimapDown = false;
        minimapBox.addEventListener('mousedown', (e) => {
            isMinimapDown = true;
            navigateToMinimap(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (isMinimapDown) {
                navigateToMinimap(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            isMinimapDown = false;
        });
    }

    // 10. Morfometría IA
    const btnAi = document.getElementById('btnWsiAi');
    const aiOverlay = document.getElementById('wsiAiOverlay');
    if (btnAi && aiOverlay) {
        btnAi.addEventListener('click', () => {
            isAiActive = !isAiActive;
            btnAi.classList.toggle('active', isAiActive);
            aiOverlay.classList.toggle('active', isAiActive);
            showWSIToast(isAiActive ? 'Morfometría IA: Detección y Conteo Mitótico Activados' : 'Morfometría IA: Vista H&E Pura');
        });
    }

    // 11. Lupa de Inmersión 80x
    const btnLens = document.getElementById('btnWsiLens');
    const lens = document.getElementById('wsiMagnifierLens');
    if (btnLens && lens) {
        btnLens.addEventListener('click', () => {
            isLensActive = !isLensActive;
            btnLens.classList.toggle('active', isLensActive);
            lens.style.display = isLensActive ? 'block' : 'none';
            if (isLensActive) {
                lens.style.backgroundImage = `url('${slideImg.src}')`;
                lens.style.backgroundSize = `${slideImg.naturalWidth ? slideImg.naturalWidth * 2.5 : 3000}px auto`;
                showWSIToast('Lupa 80x: Pasa el cursor sobre el tejido');
            }
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!isLensActive) return;
            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            lens.style.left = `${mouseX}px`;
            lens.style.top = `${mouseY}px`;

            const bgX = -((mouseX / rect.width) * 100 * 2.5) + 50;
            const bgY = -((mouseY / rect.height) * 100 * 2.5) + 50;
            lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
        });
    }

    // 12. Captura de Fotograma Histopatológico
    const btnCapture = document.getElementById('btnWsiCapture');
    if (btnCapture) {
        btnCapture.addEventListener('click', () => {
            const origFilter = viewport.style.filter;
            viewport.style.filter = 'brightness(2.2)';
            setTimeout(() => { viewport.style.filter = origFilter; }, 120);
            showWSIToast('Fotograma histológico 40x capturado con calibración 0.25 µm/px');
        });
    }

    // 13. Exportar / Descargar WSI
    const btnExport = document.getElementById('btnWsiExport');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const curData = WSI_DATA[currentSampleKey];
            const a = document.createElement('a');
            a.href = curData.image;
            a.download = `${currentSampleKey}_wsi_40x.webp`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showWSIToast(`Descargando ROI de ${curData.title}`);
        });
    }

    // 14. Pantalla Completa (Fullscreen)
    const btnFullscreen = document.getElementById('btnWsiFullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            const screenWSI = document.getElementById('pantalla-wsi');
            if (!document.fullscreenElement) {
                if (screenWSI.requestFullscreen) screenWSI.requestFullscreen();
                else if (screenWSI.webkitRequestFullscreen) screenWSI.webkitRequestFullscreen();
                btnFullscreen.innerHTML = '<i class="fa-solid fa-compress"></i>';
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
                btnFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i>';
            }
        });
    }

    // 15. Verificación de enlace con Servidor Cloudflare WSI Propio
    checkCloudflareTunnel();
    setInterval(checkCloudflareTunnel, 60000);

    // Inicialización del visor con la muestra 1 (Carcinoma de Próstata Oficial)
    switchWSISample('prostate');
    applyWSITransform();
}

/**
 * Verifica el estado del túnel Cloudflare hacia el Servidor WSI físico local
 */
async function checkCloudflareTunnel() {
    const beacon = document.getElementById('wsiServerBeacon');
    const btnText = document.getElementById('wsiServerBtnText');
    const directBtn = document.getElementById('wsiServerDirectBtn');
    const noticeBanner = document.getElementById('wsiTunnelNoticeBanner');

    const TUNNEL_URL = 'https://icon-kidney-collins-rebecca.trycloudflare.com/';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        await fetch(TUNNEL_URL, {
            method: 'GET',
            mode: 'no-cors',
            signal: controller.signal,
            cache: 'no-cache'
        });
        clearTimeout(timeoutId);

        // Servidor Cloudflare en línea
        if (beacon) beacon.className = 'wsi-live-beacon online';
        if (btnText) btnText.textContent = 'Servidor WSI En Vivo (3.5 TB)';
        if (directBtn) directBtn.title = 'Túnel Cloudflare Activo: Conectado a Servidor WSI In-House (3.5 TB en F:\\LAMINARIO DE PATOLOGIA)';
        if (noticeBanner) noticeBanner.style.display = 'none';
    } catch (err) {
        // Servidor Cloudflare en reposo o inactivo
        if (beacon) beacon.className = 'wsi-live-beacon offline';
        if (btnText) btnText.textContent = 'Servidor WSI (En Reposo)';
        if (directBtn) directBtn.title = 'Aviso de Túnel: Servidor WSI en reposo nocturno. Las 3 muestras locales de alta resolución están disponibles 24/7 en el navegador.';
        if (noticeBanner) noticeBanner.style.display = 'block';
    }
}

window.checkCloudflareTunnel = checkCloudflareTunnel;
window.switchWSISample = switchWSISample;
window.setWSIRotation = function(deg) {
    currentRotation = Math.round(deg) % 360;
    if (currentRotation < 0) currentRotation += 360;
    applyWSITransform();
};

function showWSIToast(msg) {
    let toast = document.getElementById('wsiToastMessage');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'wsiToastMessage';
        toast.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 19, 34, 0.95);
            backdrop-filter: blur(14px);
            border: 1px solid #38bdf8;
            color: #ffffff;
            padding: 8px 18px;
            border-radius: 20px;
            font-family: 'Montserrat', sans-serif;
            font-size: 11px;
            font-weight: 700;
            z-index: 9999;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2800);
}

/* ==========================================================================
   3. COMPARADOR SPLIT-SCREEN MORFOMETRÍA IA (EJE 03)
   ========================================================================== */
function initMorphSplitSlider() {
    const container = document.getElementById('morphSplitContainer');
    const aiLayer = document.getElementById('morphAiLayer');
    const handle = document.getElementById('morphSplitHandle');
    if (!container || !aiLayer || !handle) return;

    let isDragging = false;

    const onMove = (clientX) => {
        const rect = container.getBoundingClientRect();
        let offsetX = clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;
        const percentage = (offsetX / rect.width) * 100;
        aiLayer.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
    };

    handle.addEventListener('mousedown', () => { isDragging = true; });
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        onMove(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        onMove(e.clientX);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch para Móviles
    handle.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
    container.addEventListener('touchmove', (e) => {
        if (!isDragging || !e.touches[0]) return;
        onMove(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { isDragging = false; });

    // Filtros de Capas de Morfometría
    const toggleLayerBtns = document.querySelectorAll('.morph-layer-toggle');
    toggleLayerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            // Simular actualización visual de HUD
            const counter = document.getElementById('counterCells');
            if (counter && btn.getAttribute('data-toggle') === 'segmentation') {
                counter.textContent = btn.classList.contains('active') ? '519' : '0 (Desactivado)';
            }
        });
    });
}

/* ==========================================================================
   4. COPILOTO GÉMINI WSI & TRIAJE DIAGNÓSTICO (EJE 04)
   ========================================================================== */
const DIFFERENTIALS_INFO = {
    '1': {
        name: '1. Adenocarcinoma Acinar de Próstata (Gleason 4)',
        prob: '89.4%',
        tagClass: 'prob-high',
        roiTop: '25%',
        roiLeft: '22%',
        desc: 'Glándulas infiltrantes con fusión acinar y patrón cribiforme sin estroma interpuesto. Macronucléolos patognomónicos prominentes.',
        ihq: 'Ausencia total de capa basal: p63 (-) y CK-HMW (-). Sobreexpresión citoplasmática intensa de AMACR / P504S (+++).'
    },
    '2': {
        name: '2. Adenosis Prostática / Hiperplasia Adenomatosa (AAH)',
        prob: '6.2%',
        tagClass: 'prob-mid',
        roiTop: '50%',
        roiLeft: '60%',
        desc: 'Proliferación lobular apretada de acinos pequeños en zona de transición que simula adenocarcinoma Gleason 1-2.',
        ihq: 'Preservación de capa basal continua o fenestrada: p63 (+) y CK-HMW (+). Negatividad estricta o focal débil de AMACR / P504S (-).'
    },
    '3': {
        name: '3. Neoplasia Intraepitelial Prostática de Alto Grado (HGPIN)',
        prob: '3.1%',
        tagClass: 'prob-low',
        roiTop: '35%',
        roiLeft: '45%',
        desc: 'Células acinares con macronucléolos prominentes que replican adenocarcinoma, pero estrictamente confinadas al ducto.',
        ihq: 'Capa basal presente fenestrada: p63 (+) y CK-HMW (+). Células luminales AMACR (+) pero sin invasión al estroma.'
    },
    '4': {
        name: '4. Atrofia Parcial / Atrofia Pos-Esclerótica',
        prob: '1.3%',
        tagClass: 'prob-low',
        roiTop: '65%',
        roiLeft: '15%',
        desc: 'Glándulas encogidas festoneadas con retracción estromal pseudoinfiltrativa y citoplasma anfófilo escaso.',
        ihq: 'Capa basal prominente y continua: p63 (+++) y CK-HMW (+++). Ausencia de nucléolos y AMACR / P504S (-) rotundo.'
    }
};

function initGeminiCopilot() {
    const diffCards = document.querySelectorAll('.diff-card-interactive');
    const roiBox = document.getElementById('geminiRoiBox');
    const roiLabel = document.getElementById('geminiRoiLabel');

    diffCards.forEach(card => {
        card.addEventListener('click', () => {
            diffCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const id = card.getAttribute('data-diff-id');
            const data = DIFFERENTIALS_INFO[id];
            if (!data) return;

            // Mover la caja de ROI en el corte microscópico
            if (roiBox) {
                roiBox.style.top = data.roiTop;
                roiBox.style.left = data.roiLeft;
            }
            if (roiLabel) {
                roiLabel.textContent = `ROI • ${data.name.split('.')[1].trim()} (${data.prob})`;
            }
        });
    });

    // Consola de Diálogo Clínico con Gémini
    const askBtn = document.getElementById('btnAskGemini');
    const inputField = document.getElementById('geminiQuestionInput');
    const outputBox = document.getElementById('geminiAnswerBox');

    if (askBtn && inputField && outputBox) {
        askBtn.addEventListener('click', () => {
            const question = inputField.value.trim();
            if (!question) return;

            askBtn.disabled = true;
            askBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analizando...';
            outputBox.style.display = 'block';
            outputBox.innerHTML = '<span style="color: #a5b4fc;"><i class="fa-solid fa-brain fa-fade"></i> Gémini WSI: Procesando corte a 40x y calculando panel inmunofenotípico...</span>';

            setTimeout(() => {
                let answer = '';
                const qLower = question.toLowerCase();
                if (qLower.includes('adenosis') || qLower.includes('diferencia')) {
                    answer = `<strong>Copiloto Gémini WSI:</strong> En este foco a 40x se observa ausencia completa de membrana basal en los nidos cribiformes centrales. La preservación de p63 descartaría malignidad (indicando adenosis), pero la sobreexpresión de AMACR/Racemasa (+++) confirma categóricamente <em>Adenocarcinoma Acinar Gleason 4 (ISUP Grade Group 4)</em>. Se sugiere cóctel PIN-4 para validación legal.`;
                } else if (qLower.includes('pin') || qLower.includes('ihq')) {
                    answer = `<strong>Copiloto Gémini WSI:</strong> El panel estandarizado sugerido es el cóctel triple PIN-4 [p63 + CK-HMW (34βE12) + AMACR / P504S]. Las células tumorales deben ser negativas para células basales y positivas difusas luminales para racemasa.`;
                } else {
                    answer = `<strong>Copiloto Gémini WSI:</strong> Análisis multivariable completado. Se corroboran atipias nucleares con macronucléolos en 97.3% de los núcleos analizados con relación N/C del 39%. El perfil histológico es compatible con <em>Adenocarcinoma Acinar de Próstata Gleason 4</em> (Probabilidad bayesiana: 89.4%).`;
                }
                outputBox.innerHTML = answer;
                askBtn.disabled = false;
                askBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> Consultar';
            }, 1200);
        });
    }
}

/* ==========================================================================
   5. ASISTENTE VIRTUAL DE INMUNOHISTOQUÍMICA (150 BIOMARCADORES REALES)
   ========================================================================== */
function initIHQAssistant() {
    const searchInput = document.getElementById('ihqSearchInput');
    const searchBtn = document.getElementById('btnIhqSearch');
    const resultCard = document.getElementById('ihqResultCard');
    const masterTableBody = document.getElementById('ihqMasterTableBody');
    const countBadge = document.getElementById('ihqTotalCountBadge');

    if (!window.ANTIBODIES_STOCK_DB) return;

    if (countBadge) countBadge.textContent = `${window.ANTIBODIES_STOCK_DB.length} Biomarcadores`;

    // Renderizar tabla maestra completa
    renderIHQMasterTable(window.ANTIBODIES_STOCK_DB);

    // Búsqueda del Asistente Virtual
    const doSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;

        // Buscar coincidencia exacta o por subcadena
        const match = window.ANTIBODIES_STOCK_DB.find(ab => 
            ab.name.toLowerCase() === query || 
            ab.name.toLowerCase().includes(query) ||
            query.includes(ab.name.toLowerCase().split(' ')[0])
        );

        if (!resultCard) return;

        resultCard.classList.add('active');
        if (match) {
            resultCard.style.borderColor = '#10b981';
            resultCard.innerHTML = `
                <div class="ihq-result-header">
                    <div class="ihq-result-name">
                        <i class="fa-solid fa-vial-circle-check" style="color: #10b981; margin-right: 8px;"></i>
                        ${match.name}
                    </div>
                    <span class="badge-in-stock">✅ EN STOCK ACTIVO (JC PATH LAB)</span>
                </div>
                <div class="ihq-result-body">
                    <p style="margin-bottom: 6px;"><strong>Utilidad Diagnóstica Oficial:</strong> ${match.description}</p>
                    <p style="font-size: 12px; color: #94a3b8;">
                        <strong>Categoría:</strong> ${match.category} &bull; 
                        <strong>Localización:</strong> ${match.localization} &bull; 
                        <strong>Tiempo de Respuesta:</strong> ${match.turnaround}
                    </p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20deseo%20coordinar%20estudio%20con%20el%20marcador%20${encodeURIComponent(match.name)}" target="_blank" class="btn-header btn-header-wa" style="padding: 6px 14px; font-size: 11.5px;">
                        <i class="fa-brands fa-whatsapp"></i> Solicitar Marcador vía WhatsApp
                    </a>
                    <span style="font-size: 11px; color: #64748b;">Protocolizado bajo controles externos de calidad.</span>
                </div>
            `;
        } else {
            resultCard.style.borderColor = '#ef4444';
            resultCard.innerHTML = `
                <div class="ihq-result-header">
                    <div class="ihq-result-name" style="color: #f87171;">
                        <i class="fa-solid fa-circle-xmark" style="color: #ef4444; margin-right: 8px;"></i>
                        "${searchInput.value.toUpperCase()}"
                    </div>
                    <span class="badge-not-stock">❌ NO DISPONIBLE EN STOCK INMEDIATO</span>
                </div>
                <div class="ihq-result-body">
                    <p>Este marcador específico no se encuentra actualmente en el inventario base de 150 anticuerpos validados de JC PATH LAB.</p>
                    <p style="font-size: 12px; color: #94a3b8;">Puede coordinar con el Dr. Joseph Castillo para evaluar importación especializada o recomendar paneles sustitutos diagnósticos validados.</p>
                </div>
                <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20consulto%20por%20la%20factibilidad%20de%20importaci%C3%B3n%20del%20marcador%20${encodeURIComponent(searchInput.value)}" target="_blank" class="btn-header btn-header-wa" style="padding: 6px 14px; font-size: 11.5px;">
                    <i class="fa-brands fa-whatsapp"></i> Consultar Factibilidad con el Patólogo
                </a>
            `;
        }
    };

    if (searchBtn) searchBtn.addEventListener('click', doSearch);
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') doSearch();
        });
    }

    // Píldoras de Filtro de Categoría en Tabla Maestra
    const categoryPills = document.querySelectorAll('.pill-filter');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const cat = pill.getAttribute('data-category');
            if (cat === 'all') {
                renderIHQMasterTable(window.ANTIBODIES_STOCK_DB);
            } else {
                const filtered = window.ANTIBODIES_STOCK_DB.filter(ab => 
                    ab.category === cat || 
                    ab.category.toLowerCase().includes(cat.toLowerCase().split(' ')[0]) ||
                    cat.toLowerCase().includes(ab.category.toLowerCase().split(' ')[0])
                );
                renderIHQMasterTable(filtered);
            }
        });
    });

    // Búsqueda en vivo en la tabla maestra
    const tableLiveSearch = document.getElementById('ihqTableLiveSearch');
    if (tableLiveSearch) {
        tableLiveSearch.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = window.ANTIBODIES_STOCK_DB.filter(ab => 
                ab.name.toLowerCase().includes(val) || 
                ab.description.toLowerCase().includes(val) ||
                ab.category.toLowerCase().includes(val)
            );
            renderIHQMasterTable(filtered);
        });
    }
}

function renderIHQMasterTable(antibodies) {
    const tableBody = document.getElementById('ihqMasterTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    antibodies.forEach(ab => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 800; color: #ffffff;">${ab.name}</td>
            <td><span class="glass-pill" style="padding: 2px 8px; font-size: 10px; color: #38bdf8;">${ab.category}</span></td>
            <td><span style="font-size: 11px; color: #94a3b8;">${ab.localization}</span></td>
            <td style="font-size: 12px; color: #cbd5e1;">${ab.description}</td>
            <td><span style="color: #34d399; font-weight: 800; font-size: 11px;">${ab.turnaround}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

/* ==========================================================================
   6. MAPEO DE PIEZA QUIRÚRGICA 3D 360° (EJE 06 / PÁGINA 7)
   ========================================================================== */
const PINS_SPECIMEN_DATA = {
    '1': {
        title: 'PIN 1: ÁPEX PROSTÁTICO',
        verdict: 'Margen R0 Libre (> 3.2 mm de seguridad)',
        details: 'Tinta china negra indemne en cápsula anterior y apical. Sin solución de continuidad capsular. Ausencia de focos neoplásicos en borde quirúrgico.',
        casete: 'Casete B-02',
        microImg: 'morfologia_he_original.jpg'
    },
    '2': {
        title: 'PIN 2: NÓDULO DOMINANTE',
        verdict: 'Adenocarcinoma Acinar ISUP 4 (Gleason 4+4=8)',
        details: 'Zona periférica posterolateral derecha (1.8 x 1.4 cm). Fusión glandular extensa con patrón cribiforme y macronucléolos atípicos en 97.3% de núcleos.',
        casete: 'Casete A-04',
        microImg: 'morfologia_ia_pleomorfismo.jpg'
    },
    '3': {
        title: 'PIN 3: CUELLO VESICAL',
        verdict: 'Margen Basal: R0 Libre (4.8 mm)',
        details: 'Epitelio urotelial conservado sobre haces de músculo detrusor intactos. Ausencia de extensión directa o invasión neoplásica.',
        casete: 'Casete C-01',
        microImg: 'morfologia_he_original.jpg'
    },
    '4': {
        title: 'PIN 4: FASCÍCULO NEUROVASCULAR',
        verdict: 'Invasión Perineural (PNI) Negativa • pT2c Órgano-Confinado',
        details: 'Cápsula prostática continua y respetada en su espesor total. Filetes nerviosos mielinizados periféricos indemnes sin nidos perineurales.',
        casete: 'Casete D-03',
        microImg: 'morfologia_he_original.jpg'
    }
};

let current360Frame = 0;
const TOTAL_360_FRAMES = 36;
let isSpinning360 = true;
let spin360Interval = null;

function initSpecimen360Viewer() {
    const frameImg = document.getElementById('specimen360Img');
    const viewport = document.getElementById('specimen360Viewport');
    const spinBtn = document.getElementById('btnToggle360Spin');
    if (!frameImg || !viewport) return;

    // Precarga de los 36 fotogramas
    for (let i = 0; i < TOTAL_360_FRAMES; i++) {
        const pad = String(i).padStart(2, '0');
        const img = new Image();
        img.src = `macro360_clean/frame_${pad}.webp`;
    }

    // Giro automático continuo
    const startAutoSpin = () => {
        if (spin360Interval) clearInterval(spin360Interval);
        spin360Interval = setInterval(() => {
            current360Frame = (current360Frame + 1) % TOTAL_360_FRAMES;
            update360FrameImage();
        }, 90);
    };

    const stopAutoSpin = () => {
        if (spin360Interval) clearInterval(spin360Interval);
        spin360Interval = null;
    };

    if (isSpinning360) startAutoSpin();

    if (spinBtn) {
        spinBtn.addEventListener('click', () => {
            isSpinning360 = !isSpinning360;
            if (isSpinning360) {
                startAutoSpin();
                spinBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar Giro';
                spinBtn.classList.add('active');
            } else {
                stopAutoSpin();
                spinBtn.innerHTML = '<i class="fa-solid fa-play"></i> Reanudar Giro';
                spinBtn.classList.remove('active');
            }
        });
    }

    // Arrastre Manual 360° (Mouse & Touch)
    let isDragging360 = false;
    let dragStartX = 0;

    viewport.addEventListener('mousedown', (e) => {
        isDragging360 = true;
        dragStartX = e.clientX;
        stopAutoSpin();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging360) return;
        const deltaX = e.clientX - dragStartX;
        if (Math.abs(deltaX) > 8) {
            const step = deltaX > 0 ? -1 : 1;
            current360Frame = (current360Frame + step + TOTAL_360_FRAMES) % TOTAL_360_FRAMES;
            update360FrameImage();
            dragStartX = e.clientX;
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging360) {
            isDragging360 = false;
            if (isSpinning360) startAutoSpin();
        }
    });

    // Touch móvil
    viewport.addEventListener('touchstart', (e) => {
        if (!e.touches[0]) return;
        isDragging360 = true;
        dragStartX = e.touches[0].clientX;
        stopAutoSpin();
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (!isDragging360 || !e.touches[0]) return;
        const deltaX = e.touches[0].clientX - dragStartX;
        if (Math.abs(deltaX) > 10) {
            const step = deltaX > 0 ? -1 : 1;
            current360Frame = (current360Frame + step + TOTAL_360_FRAMES) % TOTAL_360_FRAMES;
            update360FrameImage();
            dragStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
        if (isDragging360) {
            isDragging360 = false;
            if (isSpinning360) startAutoSpin();
        }
    });

    // Clic en Pines Histológicos
    const pins = document.querySelectorAll('.pin-marker');
    pins.forEach(pin => {
        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            const pinId = pin.getAttribute('data-pin-id');
            openPinModal(pinId);
        });
    });

    // Clic en Tarjetas descriptivas de pines
    const pinCards = document.querySelectorAll('.pin-desc-card');
    pinCards.forEach(card => {
        card.addEventListener('click', () => {
            const pinId = card.getAttribute('data-pin-id');
            openPinModal(pinId);
        });
    });
}

function update360FrameImage() {
    const frameImg = document.getElementById('specimen360Img');
    const angleText = document.getElementById('specimen360Angle');
    if (!frameImg) return;

    const pad = String(current360Frame).padStart(2, '0');
    frameImg.src = `macro360_clean/frame_${pad}.webp`;

    if (angleText) {
        const degrees = Math.round((current360Frame / TOTAL_360_FRAMES) * 360);
        angleText.textContent = `${degrees}°`;
    }
}

window.openPinModal = function(pinId) {
    const data = PINS_SPECIMEN_DATA[pinId];
    if (!data) return;

    const modal = document.getElementById('pinMicroModal');
    const title = document.getElementById('pinModalTitle');
    const verdict = document.getElementById('pinModalVerdict');
    const details = document.getElementById('pinModalDetails');
    const casete = document.getElementById('pinModalCasete');
    const img = document.getElementById('pinModalMicroImg');

    if (!modal) return;

    if (title) title.textContent = data.title;
    if (verdict) verdict.textContent = data.verdict;
    if (details) details.textContent = data.details;
    if (casete) casete.textContent = data.casete;
    if (img) img.src = data.microImg;

    modal.classList.add('active');
};

window.closePinModal = function() {
    const modal = document.getElementById('pinMicroModal');
    if (modal) modal.classList.remove('active');
};

/* ==========================================================================
   7. CALCULADORA DE TARIFAS Y CONVENIOS 2026 (EJE 07)
   ========================================================================== */
const BASE_PRICES = {
    'rtu': { name: 'Morcelados Prostáticos / RTU', price: 70, time: '48 - 72 hrs' },
    'prostatectomia': { name: 'Prostatectomía Radical Oncológica', price: 140, time: '4 - 5 días' },
    'menores': { name: 'Piezas Quirúrgicas Menores', price: 60, time: '48 hrs' },
    'endoscopicas': { name: 'Biopsias Endoscópicas (Vejiga)', price: 60, time: '48 hrs' },
    'trucut': { name: 'Biopsia de Próstata por Punción', price: 120, time: '72 hrs' }
};

function initPricingCalculator() {
    const volumeSlider = document.getElementById('calcVolumeSlider');
    const volumeText = document.getElementById('calcVolumeText');
    const totalElem = document.getElementById('calcTotalEstimate');
    const timeElem = document.getElementById('calcAvgTime');
    const checkboxes = document.querySelectorAll('.calc-proc-check');

    if (!volumeSlider) return;

    const recalculate = () => {
        const vol = parseInt(volumeSlider.value);
        if (volumeText) volumeText.textContent = `${vol} casos/mes`;

        let activeCount = 0;
        let sumPrice = 0;
        let maxTime = '48 hrs';

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const key = cb.value;
                if (BASE_PRICES[key]) {
                    sumPrice += BASE_PRICES[key].price;
                    activeCount++;
                    if (key === 'prostatectomia') maxTime = '4 - 5 días';
                }
            }
        });

        const avgUnitPrice = activeCount > 0 ? (sumPrice / activeCount) : 70;
        const totalEstimate = Math.round(avgUnitPrice * vol);

        if (totalElem) totalElem.textContent = `S/ ${totalEstimate.toLocaleString('es-PE')}.00`;
        if (timeElem) timeElem.textContent = maxTime;

        // Actualizar enlace de WhatsApp con el presupuesto pre-llenado
        const waBtn = document.getElementById('btnCalcWhatsApp');
        if (waBtn) {
            const msg = `Hola Dr. Joseph Castillo, estimamos un volumen de ${vol} pacientes/mes en nuestra clínica y deseamos coordinar convenio institucional bajo el tarifario 2026 (Presupuesto aprox: S/ ${totalEstimate}.00).`;
            waBtn.href = `https://wa.me/51986396733?text=${encodeURIComponent(msg)}`;
        }
    };

    volumeSlider.addEventListener('input', recalculate);
    checkboxes.forEach(cb => cb.addEventListener('change', recalculate));
    recalculate();
}
