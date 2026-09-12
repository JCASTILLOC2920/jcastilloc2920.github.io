/**
 * ==============================================================================
 * SCREEN-SWITCHER.JS • CONTROLADOR MAESTRO DE NAVEGACIÓN SINGLE-SCREEN (100VH)
 * JC PATH LAB • Anatomía Patológica de Alta Precisión
 * 
 * Especialidad:
 * 1. Conmutación instantánea entre 5 pantallas fijas a 100vh con 0px de overflow
 * 2. Garantía estricta de Cero Salto de Scroll (scroll: 0) en viewport y contenedores
 * 3. Soporte multi-modal: Menú superior, Dots, Botones laterales, Teclado y Swipe táctil
 * 4. Recálculo automático de resolución y resize para Visores 3D y Escáner WSI 40x
 * 5. Conmutación limpia de temas y 5 especialidades médicas sin errores
 * ==============================================================================
 */

(function(window, document) {
    "use strict";

    // Orden canónico de las 4 pantallas autocontenidas a 100vh
    var SCREENS_ORDER = [
        "pantalla-wsi",
        "pantalla-appmovil",
        "pantalla-reportes",
        "pantalla-ihq",
        "pantalla-copiloto"
    ];

    // Mapeo exhaustivo de alias y hashes históricos para compatibilidad total
    var ALIAS_MAP = {
        "hero-wsi-cinematic": "pantalla-wsi",
        "pantalla-wsi": "pantalla-wsi",
        "wsi": "pantalla-wsi",
        "servidor-wsi": "pantalla-wsi",
        "carta": "pantalla-wsi",
        "command-center": "pantalla-wsi",
        "morfometria-ia": "pantalla-wsi",
        "copiloto-gemini": "pantalla-wsi",

        "mapeo-3d": "pantalla-appmovil",
        "pantalla-mapeo3d": "pantalla-appmovil",
        "3d": "pantalla-appmovil",
        "macro360": "pantalla-appmovil",
        "pieza-3d": "pantalla-appmovil",

        "app-movil": "pantalla-appmovil",
        "pantalla-appmovil": "pantalla-appmovil",
        "movil": "pantalla-appmovil",
        "smartphone": "pantalla-appmovil",

        "reportes": "pantalla-reportes",
        "pantalla-reportes": "pantalla-reportes",
        "copiloto": "pantalla-copiloto",
        "pantalla-copiloto": "pantalla-copiloto",
        "reportes": "pantalla-reportes",
        "pantalla-reportes": "pantalla-reportes",
        "copiloto": "pantalla-copiloto",
        "pantalla-copiloto": "pantalla-copiloto",
        "asistente-ihq": "pantalla-ihq",
        "pantalla-ihq": "pantalla-ihq",
        "ihq": "pantalla-ihq",
        "inmunohistoquimica": "pantalla-ihq",

        "tarifario": "pantalla-tarifario",
        "pantalla-tarifario": "pantalla-tarifario",
        "contacto": "pantalla-tarifario",
        "precios": "pantalla-tarifario"
    };

    var currentScreenIndex = 0;
    var isSwitching = false;

    /**
     * Garantiza el reseteo absoluto de cualquier desplazamiento de scroll
     */
    function resetAllScrolls() {
        if (typeof window.scrollTo === "function") {
            try {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            } catch (e) {
                window.scrollTo(0, 0);
            }
        }
        if (document.documentElement) {
            document.documentElement.scrollTop = 0;
            document.documentElement.scrollLeft = 0;
        }
        if (document.body) {
            document.body.scrollTop = 0;
            document.body.scrollLeft = 0;
        }
        var screensContainer = document.getElementById("screensContainer");
        if (screensContainer) {
            screensContainer.scrollTop = 0;
            screensContainer.scrollLeft = 0;
        }
    }

    /**
     * Recalcula el tamaño y nitidez al 100% para Visores 3D y Escáner WSI
     */
    function recalculateActiveViewers(targetId) {
        // Disparo inmediato para sincronía en cuadro actual
        window.dispatchEvent(new Event("resize"));

        // Disparo diferido tras reflow del DOM
        setTimeout(function() {
            window.dispatchEvent(new Event("resize"));

            if (targetId === "pantalla-wsi") {
                if (typeof window.updateWSITransform === "function") {
                    window.updateWSITransform();
                }
                if (typeof window.updateWSIZoomHUD === "function") {
                    window.updateWSIZoomHUD();
                }
                var slideImg = document.getElementById("wsiSlideImg");
                if (slideImg) {
                    slideImg.style.maxWidth = "none";
                }
                window.dispatchEvent(new CustomEvent("wsi-scanner-resize", { detail: { screenId: targetId } }));
            }

            if (targetId === "pantalla-appmovil") {
                window.dispatchEvent(new CustomEvent("appmovil-activated", { detail: { screenId: targetId } }));
            }

            if (targetId === "pantalla-ihq") {
                window.dispatchEvent(new CustomEvent("ihq-table-resize", { detail: { screenId: targetId } }));
            }

            if (targetId === "pantalla-tarifario") {
                window.dispatchEvent(new CustomEvent("tarifario-activated", { detail: { screenId: targetId } }));
            }
        }, 60);
    }

    /**
     * Conmuta la pantalla activa sin ningún salto de scroll
     * @param {string} screenIdentifier ID o alias de la pantalla deseada
     */
    function switchScreen(screenIdentifier) {
        if (!screenIdentifier) return;
        var cleanId = String(screenIdentifier).replace("#", "").trim();
        var targetId = ALIAS_MAP[cleanId] || cleanId;
        var targetSlide = document.getElementById(targetId);

        if (!targetSlide) {
            console.warn("[ScreenSwitcher] Pantalla no encontrada:", cleanId, "->", targetId);
            return;
        }

        isSwitching = true;

        // 1. Reseteo inmediato y estricto de scroll
        resetAllScrolls();

        // 2. Conmutar clase .active en todas las diapositivas
        var allSlides = document.querySelectorAll(".screen-slide");
        for (var i = 0; i < allSlides.length; i++) {
            var slide = allSlides[i];
            slide.classList.remove("active");
            slide.setAttribute("aria-hidden", "true");
            slide.scrollTop = 0;
        }

        targetSlide.classList.add("active");
        targetSlide.setAttribute("aria-hidden", "false");
        targetSlide.scrollTop = 0;

        // 3. Actualizar índice numérico actual
        var idx = SCREENS_ORDER.indexOf(targetId);
        if (idx !== -1) {
            currentScreenIndex = idx;
        }

        // 4. Actualizar botones del Navbar Superior
        var navBtns = document.querySelectorAll(".nav-screen-btn");
        for (var j = 0; j < navBtns.length; j++) {
            var btn = navBtns[j];
            var btnTarget = btn.getAttribute("data-screen");
            if (btnTarget === targetId || ALIAS_MAP[btnTarget] === targetId) {
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
            } else {
                btn.classList.remove("active");
                btn.setAttribute("aria-selected", "false");
            }
        }

        // 5. Actualizar Dots del Navegador Inferior
        var dotBtns = document.querySelectorAll(".slide-dot-btn");
        for (var k = 0; k < dotBtns.length; k++) {
            var dot = dotBtns[k];
            var dotTarget = dot.getAttribute("data-target-screen");
            if (dotTarget === targetId || ALIAS_MAP[dotTarget] === targetId) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        }

        // 6. Actualizar Contador Numérico (ej. 1 / 5)
        var counterText = document.getElementById("slideCounterText");
        if (counterText) {
            counterText.textContent = (currentScreenIndex + 1) + " / " + SCREENS_ORDER.length;
        }

        // 7. Actualizar estado de botones laterales
        var lateralPrev = document.getElementById("lateralPrevBtn");
        var lateralNext = document.getElementById("lateralNextBtn");
        if (lateralPrev) {
            lateralPrev.setAttribute("data-target", SCREENS_ORDER[(currentScreenIndex - 1 + SCREENS_ORDER.length) % SCREENS_ORDER.length]);
        }
        if (lateralNext) {
            lateralNext.setAttribute("data-target", SCREENS_ORDER[(currentScreenIndex + 1) % SCREENS_ORDER.length]);
        }

        // 8. Recalcular tamaño de visores (3D y WSI) para 100% de nitidez
        recalculateActiveViewers(targetId);

        // 9. Actualizar Hash en la URL sin salto ni evento de scroll
        if (window.history && window.history.replaceState) {
            try {
                window.history.replaceState(null, null, "#" + targetId);
            } catch (e) {
                // ignore
            }
        }

        // 10. Despachar evento global de cambio de pantalla
        window.dispatchEvent(new CustomEvent("screen-changed", {
            detail: {
                screenId: targetId,
                index: currentScreenIndex,
                total: SCREENS_ORDER.length
            }
        }));

        // Reseteo post-transición de scroll
        requestAnimationFrame(function() {
            resetAllScrolls();
            isSwitching = false;
        });
    }

    /**
     * Avanza a la siguiente pantalla
     */
    function nextSlide() {
        var nextIdx = (currentScreenIndex + 1) % SCREENS_ORDER.length;
        switchScreen(SCREENS_ORDER[nextIdx]);
    }

    /**
     * Retrocede a la pantalla anterior
     */
    function prevSlide() {
        var prevIdx = (currentScreenIndex - 1 + SCREENS_ORDER.length) % SCREENS_ORDER.length;
        switchScreen(SCREENS_ORDER[prevIdx]);
    }

    /**
     * Inicializa los listeners de teclado (flechas y números)
     */
    function initKeyboardNavigation() {
        window.addEventListener("keydown", function(e) {
            var activeEl = document.activeElement;
            var activeTag = activeEl && activeEl.tagName ? activeEl.tagName.toLowerCase() : "";
            if (["input", "textarea", "select"].includes(activeTag) || (activeEl && activeEl.isContentEditable)) {
                return;
            }

            if (e.key === "ArrowRight" || e.key === "PageDown") {
                e.preventDefault();
                nextSlide();
            } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
                e.preventDefault();
                prevSlide();
            } else if (e.key === "Home") {
                e.preventDefault();
                switchScreen(SCREENS_ORDER[0]);
            } else if (e.key === "End") {
                e.preventDefault();
                switchScreen(SCREENS_ORDER[SCREENS_ORDER.length - 1]);
            } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
                var numIdx = parseInt(e.key, 10) - 1;
                if (SCREENS_ORDER[numIdx]) {
                    e.preventDefault();
                    switchScreen(SCREENS_ORDER[numIdx]);
                }
            }
        });
    }

    /**
     * Inicializa el soporte para deslizamiento táctil (Touch Swipe)
     */
    function initTouchSwipeNavigation() {
        var touchStartX = 0;
        var touchStartY = 0;
        var touchStartTime = 0;
        var isInteractiveTouch = false;

        var screensContainer = document.getElementById("screensContainer") || document.body;

        screensContainer.addEventListener("touchstart", function(e) {
            if (!e.touches || e.touches.length !== 1) return;
            var touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();

            // Verificar si el toque inició dentro de un visor interactivo (3D, zoom WSI, slider, canvas)
            var target = e.target;
            if (target && target.closest) {
                isInteractiveTouch = Boolean(
                    target.closest(".specimen-360-viewport") ||
                    target.closest("canvas") ||
                    target.closest(".wsi-full-viewport") ||
                    target.closest(".wsi-viewport-col") ||
                    target.closest(".wsi-split-container") ||
                    target.closest(".wsi-intro-sidebar") ||
                    target.closest("#wsiIntroSidebar") ||
                    target.closest(".wsi-slide-image") ||
                    target.closest("#wsiRotationWidget") ||
                    target.closest(".rot-dial-wrap") ||
                    target.closest(".wsi-top-bar") ||
                    target.closest(".wsi-minimap-cluster") ||
                    target.closest(".wsi-scale-cluster") ||
                    target.closest(".scanner-viewport-frame") ||
                    target.closest(".scanner-interactive-slide") ||
                    target.closest(".split-screen-controller") ||
                    target.closest(".ihq-table-viewport") ||
                    target.closest("input") ||
                    target.closest("button") ||
                    target.closest("a")
                );
            } else {
                isInteractiveTouch = false;
            }
        }, { passive: true });

        screensContainer.addEventListener("touchend", function(e) {
            if (isInteractiveTouch) return;
            if (!e.changedTouches || e.changedTouches.length === 0) return;

            var touch = e.changedTouches[0];
            var deltaX = touch.clientX - touchStartX;
            var deltaY = touch.clientY - touchStartY;
            var elapsedTime = Date.now() - touchStartTime;

            // Detección estricta de swipe horizontal:
            // 1. Duración menor a 550ms
            // 2. Desplazamiento horizontal mínimo de 45px
            // 3. Desplazamiento horizontal al menos 1.35x mayor que el vertical
            if (elapsedTime < 550 && Math.abs(deltaX) > 45 && Math.abs(deltaX) > (1.35 * Math.abs(deltaY))) {
                if (deltaX < 0) {
                    // Swipe hacia la izquierda -> Siguiente diapositiva
                    nextSlide();
                } else {
                    // Swipe hacia la derecha -> Diapositiva anterior
                    prevSlide();
                }
            }
        }, { passive: true });
    }

    /**
     * Inicializa los listeners de clics en la barra de navegación, dots y botones laterales
     */
    function initClickNavigation() {
        // Clics en botones del Navbar
        var navBtns = document.querySelectorAll(".nav-screen-btn");
        navBtns.forEach(function(btn) {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                var target = btn.getAttribute("data-screen");
                switchScreen(target);
            });
        });

        // Clics en Dots inferiores
        var dotBtns = document.querySelectorAll(".slide-dot-btn");
        dotBtns.forEach(function(dot) {
            dot.addEventListener("click", function(e) {
                e.preventDefault();
                var target = dot.getAttribute("data-target-screen");
                switchScreen(target);
            });
        });

        // Botones de flechas del pill inferior
        var btnPrev = document.getElementById("btnPrevSlide");
        var btnNext = document.getElementById("btnNextSlide");
        if (btnPrev) btnPrev.addEventListener("click", prevSlide);
        if (btnNext) btnNext.addEventListener("click", nextSlide);

        // Botones laterales flotantes
        var lateralPrev = document.getElementById("lateralPrevBtn");
        var lateralNext = document.getElementById("lateralNextBtn");
        if (lateralPrev) lateralPrev.addEventListener("click", prevSlide);
        if (lateralNext) lateralNext.addEventListener("click", nextSlide);

        // Interceptar cualquier enlace con ancla (#) para conmutar pantalla limpiamente sin scroll
        document.querySelectorAll('a[href*="#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var href = link.getAttribute('href');
                if (href && href.indexOf('#') !== -1) {
                    var parts = href.split('#');
                    var hash = parts[1];
                    if (hash && (document.getElementById(hash) || ALIAS_MAP[hash])) {
                        e.preventDefault();
                        switchScreen(hash);
                    }
                }
            });
        });

        // Botones genéricos con clases .screen-nav-prev y .screen-nav-next
        document.querySelectorAll(".screen-nav-prev").forEach(function(el) {
            el.addEventListener("click", prevSlide);
        });
        document.querySelectorAll(".screen-nav-next").forEach(function(el) {
            el.addEventListener("click", nextSlide);
        });
    }

    // Alternar entre Visor Panorámico WSI y Comparador Split Slider Macro/Micro
    window.toggleWsiMode = function() {
        var wsiView = document.getElementById('wsiViewport');
        var splitView = document.getElementById('morphSplitContainer');
        var btn = document.getElementById('btnToggleWsiMode');
        if (!wsiView || !splitView) return;

        if (splitView.style.display === 'none' || !splitView.style.display) {
            splitView.style.display = 'block';
            wsiView.style.display = 'none';
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-microscope"></i> Ver WSI 40x';
                btn.classList.add('active');
            }
        } else {
            splitView.style.display = 'none';
            wsiView.style.display = 'flex';
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-arrows-left-right"></i> Split Macro/Micro';
                btn.classList.remove('active');
            }
        }
    };

    /**
     * Inicializador maestro de Screen Switcher
     */
    function initScreenSwitcher() {
        initClickNavigation();
        initKeyboardNavigation();
        initTouchSwipeNavigation();

        // Manejar cambio de hash directo en la barra de direcciones
        window.addEventListener("hashchange", function() {
            if (window.location.hash) {
                var h = window.location.hash.replace("#", "");
                switchScreen(h);
            }
        });

        // Carga inicial según hash existente o por defecto en pantalla-wsi
        if (window.location.hash) {
            var initialHash = window.location.hash.replace("#", "");
            switchScreen(initialHash);
        } else {
            switchScreen("pantalla-wsi");
        }

        // Verificación de recálculo tras carga completa de recursos (imágenes, webfonts)
        window.addEventListener("load", function() {
            recalculateActiveViewers(SCREENS_ORDER[currentScreenIndex]);
        });

        console.info("%c[ScreenSwitcher] Controlador Single-Screen 100vh activo. Nitidez 100% & Cero Scrollbars.", "color: #38bdf8; font-weight: bold;");
    }

    // Exponer API pública en window
    window.ScreenSwitcher = {
        switchScreen: switchScreen,
        nextSlide: nextSlide,
        prevSlide: prevSlide,
        getCurrentScreenIndex: function() { return currentScreenIndex; },
        getCurrentScreenId: function() { return SCREENS_ORDER[currentScreenIndex]; },
        getScreensOrder: function() { return SCREENS_ORDER.slice(); },
        resizeActiveViewers: recalculateActiveViewers,
        initScreenSwitcher: initScreenSwitcher
    };

    window.switchScreen = switchScreen;
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;

    // Autoiniciar cuando el DOM esté listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initScreenSwitcher);
    } else {
        initScreenSwitcher();
    }

})(window, document);
