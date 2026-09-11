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
    if (wsiBtn) wsiBtn.click();

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
   1. SIMULADOR DE SMARTPHONE QUIRÚRGICO (EJE 01)
   ========================================================================== */
const PATIENTS_DATA = [
    {
        id: '26Q-281',
        name: 'Avalos Valenzuela, Carlos A.',
        specialty: 'uro',
        procedure: 'Enucleación Prostática HoLEP',
        status: 'status-ready',
        statusText: 'Listo para Imprimir',
        date: '10/09/2026',
        diagnosis: 'Hiperplasia prostática nodular con prostatitis crónica activa. Descarte de adenocarcinoma incidental negativo. Márgenes de resección libres.',
        dr: 'Dr. Bryan Flores Sierra',
        macroImg: 'morfologia_he_original.jpg'
    },
    {
        id: '26Q-285',
        name: 'Mendoza Quispe, Valeria',
        specialty: 'derma',
        procedure: 'Biopsia Escisional de Piel (Espalda)',
        status: 'status-completed',
        statusText: 'Completado',
        date: '09/09/2026',
        diagnosis: 'Melanoma de extensión superficial invasor. Índice de Breslow: 1.20 mm. Nivel IV de Clark. Márgenes quirúrgicos laterales y profundo libres (> 5 mm).',
        dr: 'Dr. Víctor Castañeda',
        macroImg: 'morfologia_ia_pleomorfismo.jpg'
    },
    {
        id: '26Q-289',
        name: 'Huamán Cárdenas, Jorge',
        specialty: 'neuro',
        procedure: 'Resección Tumoral Parietal Izquierda',
        status: 'status-process',
        statusText: 'En Proceso',
        date: '11/09/2026',
        diagnosis: 'Neoplasia glial infiltrante de alto grado sugerente de Astrocitoma Grado 4 / Glioblastoma. En estudio con panel molecular IDH1, ATRX y p53.',
        dr: 'Dr. Alejandro Escalante',
        macroImg: 'morfologia_he_original.jpg'
    },
    {
        id: '26Q-293',
        name: 'Salazar Benítez, Roberto',
        specialty: 'sarcoma',
        procedure: 'Tumor de Muslo (Biopsia Incisional)',
        status: 'status-ready',
        statusText: 'Listo para Imprimir',
        date: '08/09/2026',
        diagnosis: 'Tumor de la estirpe mesenquimal fusocelular compatible con Dermatofibrosarcoma Protuberans (DFSP). Positividad intensa para CD34.',
        dr: 'Dr. Diego Chungui',
        macroImg: 'morfologia_ia_pleomorfismo.jpg'
    },
    {
        id: '26Q-298',
        name: 'Cabrera Ramos, Elena',
        specialty: 'hemato',
        procedure: 'Biopsia de Adenopatía Cervical',
        status: 'status-completed',
        statusText: 'Completado',
        date: '07/09/2026',
        diagnosis: 'Linfoma no Hodgkin difuso de células grandes B (DLBCL). Subtipo centro germinal. Inmunofenotipo: CD20 (+), BCL-6 (+), CD10 (+), Ki-67: 85%.',
        dr: 'Dr. Manuel Sánchez',
        macroImg: 'morfologia_he_original.jpg'
    }
];

function initSmartphoneSimulator() {
    const listContainer = document.getElementById('phonePatientsList');
    if (!listContainer) return;

    renderPhonePatients(PATIENTS_DATA);

    // Búsqueda en smartphone
    const searchInput = document.getElementById('phoneSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = PATIENTS_DATA.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.procedure.toLowerCase().includes(query) || 
                p.id.toLowerCase().includes(query)
            );
            renderPhonePatients(filtered);
        });
    }
}

function renderPhonePatients(patients) {
    const listContainer = document.getElementById('phonePatientsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    patients.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = `phone-patient-card ${idx === 0 ? 'active' : ''}`;
        card.setAttribute('data-specialty', p.specialty);
        card.innerHTML = `
            <div class="p-card-top">
                <span class="p-card-name">${p.name}</span>
                <span class="p-card-status ${p.status}">${p.statusText}</span>
            </div>
            <div class="p-card-meta">
                <span>${p.procedure}</span>
                <span class="font-mono">#${p.id}</span>
            </div>
            <div class="p-card-actions">
                <button type="button" class="btn-phone-action btn-phone-pdf" onclick="openPhoneReport('${p.id}')">
                    <i class="fa-solid fa-file-pdf"></i> Ver Informe
                </button>
                <button type="button" class="btn-phone-action btn-phone-360" onclick="openPhoneMacro('${p.id}')">
                    <i class="fa-solid fa-arrows-spin"></i> Visor 360°
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

window.openPhoneReport = function(id) {
    const p = PATIENTS_DATA.find(item => item.id === id);
    if (!p) return;

    const modal = document.getElementById('phoneReportModal');
    const content = document.getElementById('phoneReportContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div style="background: #0f172a; border-radius: 12px; padding: 14px; border: 1px solid #38bdf8; font-size: 10px; color: #f8fafc; height: 100%; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
                <strong>JC PATH LAB • INFORME OFICIAL</strong>
                <span style="color: #38bdf8; font-weight: 800;">ID: ${p.id}</span>
            </div>
            <p><strong>PACIENTE:</strong> ${p.name.toUpperCase()}</p>
            <p><strong>ESTUDIO:</strong> ${p.procedure}</p>
            <p><strong>MÉDICO SOLICITANTE:</strong> ${p.dr}</p>
            <p><strong>FECHA EMISIÓN:</strong> ${p.date}</p>
            <div style="margin: 10px 0; padding: 8px; background: rgba(2, 132, 199, 0.15); border-left: 3px solid #0284c7; border-radius: 4px;">
                <strong style="color: #38bdf8; display: block; margin-bottom: 2px;">DIAGNÓSTICO HISTOPATOLÓGICO:</strong>
                <span style="font-size: 9.5px; line-height: 1.35; display: block;">${p.diagnosis}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14px; border-top: 1px solid #334155; padding-top: 8px;">
                <div>
                    <span style="font-size: 8px; color: #94a3b8; display: block;">Validez Legal & QR Sunat</span>
                    <span style="color: #10b981; font-weight: 800;"><i class="fa-solid fa-shield-check"></i> Firma Digital Vigente</span>
                </div>
                <img src="firma_sello.png" style="height: 38px; object-fit: contain;">
            </div>
        </div>
    `;
    modal.classList.add('active');
};

window.openPhoneMacro = function(id) {
    const p = PATIENTS_DATA.find(item => item.id === id);
    if (!p) return;

    const modal = document.getElementById('phoneReportModal');
    const content = document.getElementById('phoneReportContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div style="background: #0f172a; border-radius: 12px; padding: 14px; border: 1px solid #7c3aed; font-size: 10px; color: #f8fafc; height: 100%; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
                <strong>REGISTRO MACROSCÓPICO 360°</strong>
                <span style="color: #a855f7; font-weight: 800;">ID: ${p.id}</span>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 8px; background: #000;">
                <img src="${p.macroImg}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="margin-top: 8px; font-size: 9px; color: #cbd5e1;">
                <span>Espécimen quirúrgico tallado según protocolo CAP. Márgenes entintados y peso documentado.</span>
            </div>
        </div>
    `;
    modal.classList.add('active');
};

window.closePhoneModal = function() {
    const modal = document.getElementById('phoneReportModal');
    if (modal) modal.classList.remove('active');
};

/* ==========================================================================
   2. VISOR WSI GIGAPÍXEL VIRTUAL (EJE 02)
   ========================================================================== */
let currentZoomLevel = 1.0;
let isPanning = false;
let startX, startY, currentX = 0, currentY = 0;

function initWSIViewer() {
    const viewport = document.getElementById('wsiViewport');
    const slideImg = document.getElementById('wsiSlideImg');
    if (!viewport || !slideImg) return;

    // Control de Arrastre (Pan)
    viewport.addEventListener('mousedown', (e) => {
        isPanning = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateWSITransform();
        updateWSICoordinates(currentX, currentY);
    });

    window.addEventListener('mouseup', () => {
        isPanning = false;
        if (viewport) viewport.style.cursor = 'grab';
    });

    // Control de Rueda de Ratón (Zoom)
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            currentZoomLevel = Math.min(currentZoomLevel + 0.3, 5.0);
        } else {
            currentZoomLevel = Math.max(currentZoomLevel - 0.3, 1.0);
        }
        updateWSITransform();
        updateWSIZoomHUD();
    }, { passive: false });

    // Botones de Zoom
    const zoomBtns = document.querySelectorAll('.wsi-zoom-btn');
    zoomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            zoomBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mag = parseFloat(btn.getAttribute('data-zoom'));
            currentZoomLevel = mag;
            updateWSITransform();
            updateWSIZoomHUD();
        });
    });

    // Filtros Espectrales Digitales
    const filterBtns = document.querySelectorAll('.wsi-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            slideImg.className = 'wsi-slide-image';
            if (filter !== 'normal') {
                slideImg.classList.add(`filter-${filter}`);
            }
        });
    });

    // Pestañas de Casos de Especialidad en WSI
    const caseTabs = document.querySelectorAll('.wsi-case-tab');
    caseTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            caseTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const imgPath = tab.getAttribute('data-img');
            const label = tab.getAttribute('data-label');
            slideImg.src = imgPath;
            currentX = 0;
            currentY = 0;
            currentZoomLevel = 1.0;
            updateWSITransform();
            const labelElem = document.getElementById('wsiCaseLabel');
            if (labelElem) labelElem.textContent = label;
        });
    });
}

function updateWSITransform() {
    const slideImg = document.getElementById('wsiSlideImg');
    if (slideImg) {
        slideImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoomLevel})`;
    }
}

function updateWSIZoomHUD() {
    const magText = document.getElementById('wsiMagHUD');
    const scaleLine = document.getElementById('wsiScaleText');
    if (!magText) return;

    let text = '2x (Panorámica)';
    let scale = '50 µm';
    if (currentZoomLevel > 3.5) { text = '40x (Inmersión/Nuclear)'; scale = '10 µm'; }
    else if (currentZoomLevel > 2.5) { text = '20x (Celular)'; scale = '20 µm'; }
    else if (currentZoomLevel > 1.8) { text = '10x (Glandular)'; scale = '30 µm'; }
    else if (currentZoomLevel > 1.2) { text = '4x (Arquitectura)'; scale = '40 µm'; }

    magText.textContent = text;
    if (scaleLine) scaleLine.textContent = scale;
}

function updateWSICoordinates(x, y) {
    const coordText = document.getElementById('wsiCoordsHUD');
    if (coordText) {
        coordText.textContent = `X: ${Math.round(x * -1 + 500)} µm | Y: ${Math.round(y * -1 + 300)} µm`;
    }
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
