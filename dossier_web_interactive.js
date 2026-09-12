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
    } else if (spec === 'uro' || spec === 'derma') {    const btnProstate = document.getElementById('btnSampleProstate') || document.getElementById('btnSampleSkin');
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
