/**
 * ==============================================================================
 * BIOPHILIC-ENGINE.JS • NÚCLEO DE ANIMACIONES BIOFÍLICAS & GPU (FASE 3A)
 * JC PATH LAB • Anatomía Patológica de Alta Precisión
 * 
 * Especialidad:
 * 1. Dinámica Viscoelástica Celular Subamortiguada (zeta = 0.72, omega_n = 24.0 rad/s)
 * 2. Aceleración Estricta por GPU (translate3d, rotate3d, scale3d) & 'will-change' dinámico
 * 3. Eliminación Total de Saltos Bruscos, Parpadeos y Fricción Perceptual
 * 4. Integración Nativa con W3C View Transitions API para Smartphone Quirúrgico
 * ==============================================================================
 */

// --- CONSTANTES FÍSICAS DE LA DINÁMICA CELULAR ---
const CELL_PHYSICS = Object.freeze({
    ZETA: 0.72,               // Factor de amortiguamiento subamortiguado óptimo (3.84% sobrepaso viscoelástico)
    OMEGA: 24.0,              // Frecuencia angular natural (rad/s)
    K: 576.0,                 // Constante elástica k = omega^2
    C: 34.56,                 // Coeficiente de fricción interna c = 2 * zeta * omega
    EPSILON_DISP: 0.0004,     // Umbral de reposo para desplazamiento
    EPSILON_VEL: 0.0004,      // Umbral de reposo para velocidad
    MAX_DELTA_TIME: 0.032,    // Límite de integración temporal (evita saltos por caída de FPS)
    BEZIER_CURVE: 'cubic-bezier(0.24, 1.28, 0.38, 1)' // Equivalente analítico de zeta=0.72
});

/**
 * Inyector de Estilos CSS Biofílicos y Transiciones de Vista W3C
 */
function injectBiophilicStyles() {
    if (document.getElementById('biophilic-engine-styles')) return;

    const style = document.createElement('style');
    style.id = 'biophilic-engine-styles';
    style.textContent = `
        /* ==========================================================================
           W3C VIEW TRANSITIONS API - MORFOLOGÍA CELULAR FLUIDA (zeta=0.72)
           ========================================================================== */

        /* Aísla la transición para evitar parpadeos globales en el viewport */
        ::view-transition-old(root),
        ::view-transition-new(root) {
            animation: none;
            mix-blend-mode: normal;
        }

        /* Contenedor del morphing continuo entre tarjeta móvil y modal visor */
        ::view-transition-group(phone-modal-surface) {
            animation-duration: 440ms;
            animation-timing-function: ${CELL_PHYSICS.BEZIER_CURVE};
            overflow: hidden;
            border-radius: 36px;
            box-shadow: 0 25px 65px -12px rgba(2, 6, 23, 0.95), 0 0 40px rgba(56, 189, 248, 0.35);
        }

        ::view-transition-old(phone-modal-surface) {
            animation-duration: 440ms;
            animation-timing-function: ${CELL_PHYSICS.BEZIER_CURVE};
            mix-blend-mode: normal;
            border-radius: inherit;
        }

        ::view-transition-new(phone-modal-surface) {
            animation-duration: 440ms;
            animation-timing-function: ${CELL_PHYSICS.BEZIER_CURVE};
            mix-blend-mode: normal;
            border-radius: inherit;
        }

        /* ==========================================================================
           ESTABILIZACIÓN DE GPU Y ACELERACIÓN DE COMPOSICIÓN
           ========================================================================== */
        .phone-mockup-container {
            perspective: 1200px;
            -webkit-perspective: 1200px;
        }

        .phone-screen {
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }

        .phone-patient-card,
        .pillar-card,
        .app-feature-box,
        .btn-phone-action,
        .wsi-preset-btn,
        .btn-wsi-action,
        .gemini-prompt-btn,
        .pricing-card {
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            position: relative;
        }

        /* Inhibe transiciones de transform durante la simulación activa para evitar conflicto con el integrador */
        .bio-spring-active {
            transition: transform 0s !important;
        }

        /* Resplandor Especular de Membrana Lipídica (Citoplasma reflectivo) */
        .phone-patient-card::before,
        .pillar-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(
                circle 150px at var(--cell-sheen-x, 50%) var(--cell-sheen-y, 50%),
                rgba(56, 189, 248, calc(var(--cell-sheen-opacity, 0) * 0.18)),
                transparent 72%
            );
            pointer-events: none;
            z-index: 2;
            opacity: var(--cell-sheen-opacity, 0);
            transition: opacity 0.28s ease-out;
        }

        /* Evita salto de opacidad durante la animación de transición de vista */
        .phone-report-preview-modal.biophilic-view-transitioning {
            transition: none !important;
            display: flex !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Oscilador Armónico Subamortiguado (zeta = 0.72)
 * Resuelve la ecuación: d²x/dt² + 2*zeta*omega*dx/dt + omega²*(x - target) = 0
 */
class UnderdampedCellSpring {
    constructor(initialValue = 0) {
        this.val = initialValue;
        this.target = initialValue;
        this.velocity = 0;
    }

    set(val) {
        this.val = val;
        this.target = val;
        this.velocity = 0;
    }

    setTarget(target) {
        this.target = target;
    }

    step(dt) {
        const disp = this.val - this.target;
        const force = -CELL_PHYSICS.K * disp - CELL_PHYSICS.C * this.velocity;
        this.velocity += force * dt;
        this.val += this.velocity * dt;

        const isDisplaced = Math.abs(disp) > CELL_PHYSICS.EPSILON_DISP;
        const isMoving = Math.abs(this.velocity) > CELL_PHYSICS.EPSILON_VEL;
        return isDisplaced || isMoving;
    }

    snap() {
        this.val = this.target;
        this.velocity = 0;
    }
}

/**
 * Controlador Físico de Membrana Celular para Elementos Individuales
 */
class BiophilicCellController {
    constructor(element, options = {}) {
        this.el = element;
        this.options = {
            maxTilt: options.maxTilt ?? 7.5,        // Inclinación máxima 3D en grados
            maxTranslate: options.maxTranslate ?? 5.0, // Desplazamiento reactivo en px
            hoverScale: options.hoverScale ?? 1.026,   // Dilatación citoplasmática en hover
            pressScale: options.pressScale ?? 0.962,   // Compresión viscoelástica al pulsar
            hasSheen: options.hasSheen ?? true,        // Sheen especular reflectivo
            ...options
        };

        // Resortes subamortiguados por grado de libertad
        this.springX = new UnderdampedCellSpring(0);
        this.springY = new UnderdampedCellSpring(0);
        this.springRx = new UnderdampedCellSpring(0);
        this.springRy = new UnderdampedCellSpring(0);
        this.springScale = new UnderdampedCellSpring(1.0);
        this.springSheenOpacity = new UnderdampedCellSpring(0);

        this.sheenX = 50;
        this.sheenY = 50;
        this.targetSheenX = 50;
        this.targetSheenY = 50;

        this.isHovered = false;
        this.isPressed = false;
        this.isLoopRunning = false;
        this.rafId = null;
        this.lastTime = 0;

        this.bindEvents();
    }

    bindEvents() {
        const onPointerEnter = (e) => {
            this.isHovered = true;
            this.updatePointerTarget(e);
            this.springScale.setTarget(this.options.hoverScale);
            this.springSheenOpacity.setTarget(1.0);
            this.startLoop();
        };

        const onPointerMove = (e) => {
            if (!this.isHovered) this.isHovered = true;
            this.updatePointerTarget(e);
            this.startLoop();
        };

        const onPointerLeave = () => {
            this.isHovered = false;
            this.isPressed = false;
            this.springX.setTarget(0);
            this.springY.setTarget(0);
            this.springRx.setTarget(0);
            this.springRy.setTarget(0);
            this.springScale.setTarget(1.0);
            this.springSheenOpacity.setTarget(0);
            this.startLoop();
        };

        const onPointerDown = (e) => {
            this.isPressed = true;
            this.springScale.setTarget(this.options.pressScale);
            this.updatePointerTarget(e, 0.7); // Mayor resistencia a la deformación
            this.startLoop();
        };

        const onPointerUp = () => {
            this.isPressed = false;
            // Al soltar, la dinámica subamortiguada produce un sobrepaso elástico natural
            this.springScale.setTarget(this.isHovered ? this.options.hoverScale : 1.0);
            this.startLoop();
        };

        this.el.addEventListener('pointerenter', onPointerEnter, { passive: true });
        this.el.addEventListener('pointermove', onPointerMove, { passive: true });
        this.el.addEventListener('pointerleave', onPointerLeave, { passive: true });
        this.el.addEventListener('pointerdown', onPointerDown, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        this.el.addEventListener('pointercancel', onPointerLeave, { passive: true });
    }

    updatePointerTarget(e, resistance = 1.0) {
        const rect = this.el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Normalización centrada (-0.5 a 0.5)
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        // Coordenadas absolutas de resplandor citoplasmático
        this.targetSheenX = (normX + 0.5) * 100;
        this.targetSheenY = (normY + 0.5) * 100;

        // Inclinación 3D y desplazamiento magnético hacia el puntero
        const tiltX = -normY * this.options.maxTilt * resistance;
        const tiltY = normX * this.options.maxTilt * resistance;
        const transX = normX * this.options.maxTranslate * resistance;
        const transY = normY * this.options.maxTranslate * resistance;

        this.springRx.setTarget(tiltX);
        this.springRy.setTarget(tiltY);
        this.springX.setTarget(transX);
        this.springY.setTarget(transY);
    }

    startLoop() {
        if (this.isLoopRunning) return;
        this.isLoopRunning = true;
        this.lastTime = performance.now();

        // Aplicación dinámica de will-change exclusivamente durante la animación
        this.el.style.willChange = 'transform';
        this.el.classList.add('bio-spring-active');

        this.rafId = requestAnimationFrame(this.tick.bind(this));
    }

    tick(time) {
        let dt = (time - this.lastTime) / 1000;
        if (dt > CELL_PHYSICS.MAX_DELTA_TIME) dt = CELL_PHYSICS.MAX_DELTA_TIME;
        this.lastTime = time;

        // Integración física de cada grado de libertad
        const activeX = this.springX.step(dt);
        const activeY = this.springY.step(dt);
        const activeRx = this.springRx.step(dt);
        const activeRy = this.springRy.step(dt);
        const activeScale = this.springScale.step(dt);
        const activeSheen = this.springSheenOpacity.step(dt);

        // Suavizado del resplandor especular
        this.sheenX += (this.targetSheenX - this.sheenX) * 0.25;
        this.sheenY += (this.targetSheenY - this.sheenY) * 0.25;

        // Renderizado ESTRICTO por GPU (translate3d, rotateX, rotateY, scale3d)
        const x = this.springX.val.toFixed(3);
        const y = this.springY.val.toFixed(3);
        const rx = this.springRx.val.toFixed(3);
        const ry = this.springRy.val.toFixed(3);
        const s = this.springScale.val.toFixed(4);

        this.el.style.transform = `translate3d(${x}px, ${y}px, 0px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${s}, ${s}, 1)`;

        if (this.options.hasSheen) {
            this.el.style.setProperty('--cell-sheen-x', `${this.sheenX.toFixed(1)}%`);
            this.el.style.setProperty('--cell-sheen-y', `${this.sheenY.toFixed(1)}%`);
            this.el.style.setProperty('--cell-sheen-opacity', `${this.springSheenOpacity.val.toFixed(3)}`);
        }

        const isAnyActive = activeX || activeY || activeRx || activeRy || activeScale || activeSheen;

        if (isAnyActive || this.isHovered || this.isPressed) {
            this.rafId = requestAnimationFrame(this.tick.bind(this));
        } else {
            // Settle en estado de reposo absoluto: liberación de recursos de GPU
            this.isLoopRunning = false;
            this.springX.snap();
            this.springY.snap();
            this.springRx.snap();
            this.springRy.snap();
            this.springScale.snap();
            this.springSheenOpacity.snap();

            this.el.classList.remove('bio-spring-active');
            this.el.style.willChange = 'auto';
            this.el.style.transform = '';
            if (this.options.hasSheen) {
                this.el.style.setProperty('--cell-sheen-opacity', '0');
            }
        }
    }
}

/**
 * ==============================================================================
 * SOPORTE PARA W3C VIEW TRANSITIONS API
 * Morfología fluida continua entre la tarjeta del smartphone y el visor modal
 * ==============================================================================
 */
let lastActivePhoneCard = null;

/**
 * Ejecuta la transición de apertura de informe o visor 360°
 */
function transitionOpenPhoneModal(patientId, executeNativeOpen) {
    const modal = document.getElementById('phoneReportModal');
    // Encuentra la tarjeta del paciente en el listado
    const card = document.querySelector(`.phone-patient-card button[onclick*="${patientId}"]`)?.closest('.phone-patient-card')
              || document.querySelector(`.phone-patient-card`);

    lastActivePhoneCard = card;

    if (!modal) {
        executeNativeOpen();
        return;
    }

    // 1. Verificación de soporte nativo de W3C View Transitions API
    if (typeof document.startViewTransition === 'function') {
        if (card) {
            card.style.viewTransitionName = 'phone-modal-surface';
        }

        modal.classList.add('biophilic-view-transitioning');

        const transition = document.startViewTransition(() => {
            if (card) {
                card.style.viewTransitionName = '';
            }
            modal.style.viewTransitionName = 'phone-modal-surface';
            executeNativeOpen();
        });

        transition.finished.finally(() => {
            modal.style.viewTransitionName = '';
            modal.classList.remove('biophilic-view-transitioning');
        });
    } else {
        // 2. Fallback de alto rendimiento mediante FLIP & WAAPI con curva zeta=0.72
        fallbackViscoelasticFlipOpen(card, modal, executeNativeOpen);
    }
}

/**
 * Ejecuta la transición de cierre del modal del smartphone
 */
function transitionClosePhoneModal(executeNativeClose) {
    const modal = document.getElementById('phoneReportModal');
    const card = lastActivePhoneCard;

    if (!modal) {
        executeNativeClose();
        return;
    }

    if (typeof document.startViewTransition === 'function' && card) {
        modal.style.viewTransitionName = 'phone-modal-surface';
        modal.classList.add('biophilic-view-transitioning');

        const transition = document.startViewTransition(() => {
            modal.style.viewTransitionName = '';
            card.style.viewTransitionName = 'phone-modal-surface';
            executeNativeClose();
        });

        transition.finished.finally(() => {
            card.style.viewTransitionName = '';
            modal.classList.remove('biophilic-view-transitioning');
        });
    } else if (card) {
        fallbackViscoelasticFlipClose(card, modal, executeNativeClose);
    } else {
        executeNativeClose();
    }
}

/**
 * Fallback WAAPI FLIP Apertura con dinamica viscoelástica (zeta=0.72)
 */
function fallbackViscoelasticFlipOpen(card, modal, executeNativeOpen) {
    if (!card) {
        executeNativeOpen();
        return;
    }

    const firstRect = card.getBoundingClientRect();
    executeNativeOpen();
    const lastRect = modal.getBoundingClientRect();

    if (lastRect.width === 0 || lastRect.height === 0) return;

    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;
    const sx = firstRect.width / lastRect.width;
    const sy = firstRect.height / lastRect.height;

    modal.animate([
        {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale3d(${sx}, ${sy}, 1)`,
            opacity: 0.82,
            borderRadius: '12px'
        },
        {
            transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
            opacity: 1,
            borderRadius: '36px'
        }
    ], {
        duration: 440,
        easing: CELL_PHYSICS.BEZIER_CURVE,
        fill: 'forwards'
    });
}

/**
 * Fallback WAAPI FLIP Cierre con dinámica viscoelástica (zeta=0.72)
 */
function fallbackViscoelasticFlipClose(card, modal, executeNativeClose) {
    const firstRect = modal.getBoundingClientRect();
    const lastRect = card.getBoundingClientRect();

    if (firstRect.width === 0 || firstRect.height === 0) {
        executeNativeClose();
        return;
    }

    const dx = lastRect.left - firstRect.left;
    const dy = lastRect.top - firstRect.top;
    const sx = lastRect.width / firstRect.width;
    const sy = lastRect.height / firstRect.height;

    const anim = modal.animate([
        {
            transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
            opacity: 1,
            borderRadius: '36px'
        },
        {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale3d(${sx}, ${sy}, 1)`,
            opacity: 0,
            borderRadius: '12px'
        }
    ], {
        duration: 400,
        easing: CELL_PHYSICS.BEZIER_CURVE,
        fill: 'forwards'
    });

    anim.onfinish = () => {
        executeNativeClose();
        modal.style.transform = '';
    };
}

/**
 * Intercepta los controladores de llamada de smartphone del dossier interactivo
 */
function hookSmartphoneViewTransitions() {
    // Intercepción de Ver Informe
    const nativeOpenReport = window.openPhoneReport;
    window.openPhoneReport = function(id) {
        transitionOpenPhoneModal(id, () => {
            if (typeof nativeOpenReport === 'function') {
                nativeOpenReport(id);
            }
        });
    };

    // Intercepción de Visor 360°
    const nativeOpenMacro = window.openPhoneMacro;
    window.openPhoneMacro = function(id) {
        transitionOpenPhoneModal(id, () => {
            if (typeof nativeOpenMacro === 'function') {
                nativeOpenMacro(id);
            }
        });
    };

    // Intercepción de Cierre
    const nativeCloseModal = window.closePhoneModal;
    window.closePhoneModal = function() {
        transitionClosePhoneModal(() => {
            if (typeof nativeCloseModal === 'function') {
                nativeCloseModal();
            }
        });
    };
}

/**
 * Adjunta controladores de física celular viscoelástica a los elementos biofílicos
 */
const attachedControllers = new WeakSet();

function attachBiophilicPhysics(root = document) {
    // 1. Tarjetas del smartphone interactivo
    const phoneCards = root.querySelectorAll('.phone-patient-card');
    phoneCards.forEach(card => {
        if (!attachedControllers.has(card)) {
            new BiophilicCellController(card, {
                maxTilt: 6.0,
                maxTranslate: 4.0,
                hoverScale: 1.024,
                pressScale: 0.965,
                hasSheen: true
            });
            attachedControllers.add(card);
        }
    });

    // 2. Botones de acción del teléfono ("Ver Informe", "Visor 360°")
    const phoneActionBtns = root.querySelectorAll('.btn-phone-action');
    phoneActionBtns.forEach(btn => {
        if (!attachedControllers.has(btn)) {
            new BiophilicCellController(btn, {
                maxTilt: 4.0,
                maxTranslate: 3.0,
                hoverScale: 1.038,
                pressScale: 0.950,
                hasSheen: false
            });
            attachedControllers.add(btn);
        }
    });

    // 3. Pilares tecnológicos interactivos
    const pillarCards = root.querySelectorAll('.pillar-card');
    pillarCards.forEach(card => {
        if (!attachedControllers.has(card)) {
            new BiophilicCellController(card, {
                maxTilt: 7.0,
                maxTranslate: 6.0,
                hoverScale: 1.025,
                pressScale: 0.970,
                hasSheen: true
            });
            attachedControllers.add(card);
        }
    });

    // 4. Cajas de características de la app móvil
    const appFeatureBoxes = root.querySelectorAll('.app-feature-box');
    appFeatureBoxes.forEach(box => {
        if (!attachedControllers.has(box)) {
            new BiophilicCellController(box, {
                maxTilt: 4.5,
                maxTranslate: 4.0,
                hoverScale: 1.018,
                pressScale: 0.975,
                hasSheen: true
            });
            attachedControllers.add(box);
        }
    });

    // 5. Botones de control del visor WSI y acciones generales
    const interactiveBtns = root.querySelectorAll('.wsi-preset-btn, .btn-wsi-action, .gemini-prompt-btn, .pricing-card');
    interactiveBtns.forEach(el => {
        if (!attachedControllers.has(el)) {
            new BiophilicCellController(el, {
                maxTilt: 5.0,
                maxTranslate: 3.5,
                hoverScale: 1.022,
                pressScale: 0.965,
                hasSheen: true
            });
            attachedControllers.add(el);
        }
    });
}

/**
 * Observador de Mutaciones DOM para reconexión instantánea tras filtrado/búsqueda
 */
function observePhoneListMutations() {
    const listContainer = document.getElementById('phonePatientsList');
    if (!listContainer) return;

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                attachBiophilicPhysics(listContainer);
                break;
            }
        }
    });

    observer.observe(listContainer, { childList: true });
}

/**
 * Inicializador Maestro del Motor Biofílico
 */
export function initBiophilicEngine() {
    injectBiophilicStyles();
    hookSmartphoneViewTransitions();
    attachBiophilicPhysics();
    observePhoneListMutations();

    console.info('%c[JC PATH LAB] Motor Biofílico Activado: Dinámica Celular (zeta=0.72) & W3C View Transitions API.', 'color: #38bdf8; font-weight: bold;');
}

// Autoejecución tras carga segura del DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBiophilicEngine);
} else {
    // Si el DOM ya está listo (ej. script tipo módulo diferido), arrancar de inmediato
    initBiophilicEngine();
}

export {
    BiophilicCellController,
    UnderdampedCellSpring,
    CELL_PHYSICS,
    transitionOpenPhoneModal,
    transitionClosePhoneModal
};
