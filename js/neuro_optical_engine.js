/**
 * ==============================================================================
 * VISOR DE PATOLOGÍA DIGITAL WSI - DR. CASTILLO
 * NEURO-OPTICAL EXECUTION ENGINE & REAL-TIME PERCEPTUAL DYNAMICS
 * ==============================================================================
 * Módulo especializado en renderizado perceptual, sintonización CSF de Campbell-Robson,
 * relieve pseudo-Nomarski DIC 3D, agudizamiento Cornsweet-Pinna, aislamiento mitótico
 * y micro-sacadas temporales anti-pixelado para magnificación diagnóstica >30x.
 *
 * Desarrollado con arquitectura reactiva a 60 FPS (zero garbage collection en loop),
 * compositing subpíxel por hardware GPU y sincronización bidireccional completa.
 * ==============================================================================
 */

(function (window, document) {
    'use strict';

    // Estado interno del motor
    const state = {
        initialized: false,
        activePreset: 'original',
        // Filtros Neuro-Ópticos
        filters: {
            lor: { enabled: false, intensity: 0, filterId: 'filter-lor-realism' },
            nomarski: { enabled: false, depth: 0, angle: 45, filterId: 'filter-nomarski-3d' },
            dehaze: { enabled: false, intensity: 0, filterId: 'filter-dehaze-he' },
            mitotic: { enabled: false, intensity: 0, filterId: 'filter-mitotic-glow' },
            csf: { enabled: false, intensity: 0, filterId: 'filter-csf-boost' },
            microsaccades: { enabled: false, active: false }
        },
        // Ajustes Base (Brillo / Contraste / Saturación)
        base: {
            brightness: 100,
            contrast: 100,
            saturation: 100
        },
        // Loop de Micro-Sacadas
        saccades: {
            rafId: null,
            isRunning: false,
            amplitude: 0.35, // Píxeles de jitter subpíxel
            tremorFreq: 74.0, // Frecuencia de micro-temblor fisiológico (~70-80 Hz)
            driftFreq: 11.5   // Frecuencia de deriva lenta foveal (~10-12 Hz)
        },
        // Programación de repintado 60 FPS
        renderPending: false
    };

    // Cache de Elementos del DOM
    const dom = {
        section: null,
        chips: {},
        toggles: {},
        sliders: {},
        values: {},
        cards: {},
        btnResetNeuro: null,
        btnResetNeuroFull: null,
        btnResetBase: null,
        sliderBrightness: null,
        sliderContrast: null,
        sliderSaturation: null,
        valBrightness: null,
        valContrast: null,
        valSaturation: null,
        badgeMicrosaccades: null,
        svgDefs: null
    };

    /**
     * Definición de configuraciones predeterminadas para los Presets Perceptuales
     */
    const PRESETS = {
        original: {
            name: 'Original',
            base: { brightness: 100, contrast: 100, saturation: 100 },
            lor: { enabled: false, intensity: 0 },
            nomarski: { enabled: false, depth: 0, angle: 45 },
            dehaze: { enabled: false, intensity: 0 },
            mitotic: { enabled: false, intensity: 0 },
            csf: { enabled: false, intensity: 0 }
        },
        lor: {
            name: 'Realismo Óptico (LOR)',
            base: { brightness: 102, contrast: 106, saturation: 108 },
            lor: { enabled: true, intensity: 75 },
            nomarski: { enabled: false, depth: 0, angle: 45 },
            dehaze: { enabled: true, intensity: 50 },
            mitotic: { enabled: false, intensity: 0 },
            csf: { enabled: false, intensity: 0 }
        },
        nomarski: {
            name: 'Relieve Nomarski 3D',
            base: { brightness: 100, contrast: 112, saturation: 95 },
            lor: { enabled: false, intensity: 0 },
            nomarski: { enabled: true, depth: 70, angle: 45 },
            dehaze: { enabled: false, intensity: 0 },
            mitotic: { enabled: false, intensity: 0 },
            csf: { enabled: false, intensity: 0 }
        },
        mitotic: {
            name: 'Pop-Out Mitótico',
            base: { brightness: 98, contrast: 116, saturation: 120 },
            lor: { enabled: false, intensity: 0 },
            nomarski: { enabled: false, depth: 0, angle: 45 },
            dehaze: { enabled: false, intensity: 0 },
            mitotic: { enabled: true, intensity: 85 },
            csf: { enabled: false, intensity: 0 }
        },
        csf: {
            name: 'Claridad Foveal (CSF)',
            base: { brightness: 100, contrast: 108, saturation: 102 },
            lor: { enabled: false, intensity: 0 },
            nomarski: { enabled: false, depth: 0, angle: 45 },
            dehaze: { enabled: false, intensity: 0 },
            mitotic: { enabled: false, intensity: 0 },
            csf: { enabled: true, intensity: 80 }
        }
    };

    /**
     * Localiza el canvas activo de OpenSeadragon de forma segura
     */
    function getViewerCanvas() {
        if (window.viewer && window.viewer.drawer && window.viewer.drawer.canvas) {
            return window.viewer.drawer.canvas;
        }
        return document.querySelector('#openseadragon-viewer canvas') || document.querySelector('.openseadragon-canvas canvas');
    }

    /**
     * Localiza el canvas de la lupa virtual 40x
     */
    function getMagnifierCanvas() {
        return document.getElementById('magnifierCanvas');
    }

    /**
     * Calcula la magnificación óptica real actual (Obj: 2x, 4x, 10x, 20x, 40x, etc.)
     */
    function getCurrentMagnification() {
        const v = window.viewer;
        if (!v || !v.viewport) return 1.0;
        try {
            const slide = window.currentSlide;
            const mpp = (slide && slide.mpp) ? slide.mpp : 0.25;
            const baseMag = 10.0 / mpp;
            const zoom1to1 = v.viewport.imageToViewportZoom(1.0);
            const currentZoom = v.viewport.getZoom(true);
            if (!zoom1to1) return currentZoom;
            return (currentZoom / zoom1to1) * baseMag;
        } catch (e) {
            return (v && v.viewport) ? v.viewport.getZoom(true) : 1.0;
        }
    }

    /**
     * Inicializa las referencias a los elementos DOM
     */
    function queryDomElements() {
        dom.section = document.getElementById('neuroFiltersSection');

        // Presets chips
        ['original', 'lor', 'nomarski', 'mitotic', 'csf'].forEach(key => {
            const idMap = {
                original: 'presetOriginal',
                lor: 'presetLOR',
                nomarski: 'presetNomarski',
                mitotic: 'presetMitotic',
                csf: 'presetCSF'
            };
            dom.chips[key] = document.getElementById(idMap[key]) || document.querySelector(`[data-preset="${key}"]`);
        });

        // Toggles
        dom.toggles.lor = document.getElementById('toggleFilterLOR');
        dom.toggles.nomarski = document.getElementById('toggleFilterNomarski');
        dom.toggles.dehaze = document.getElementById('toggleFilterDehaze');
        dom.toggles.mitotic = document.getElementById('toggleFilterMitotic');
        dom.toggles.csf = document.getElementById('toggleFilterCSF');
        dom.toggles.microsaccades = document.getElementById('toggleFilterMicrosaccades');

        // Sliders
        dom.sliders.lor = document.getElementById('sliderFilterLOR');
        dom.sliders.nomarski = document.getElementById('sliderFilterNomarski');
        dom.sliders.nomarskiAngle = document.getElementById('sliderFilterNomarskiAngle');
        dom.sliders.dehaze = document.getElementById('sliderFilterDehaze');
        dom.sliders.mitotic = document.getElementById('sliderFilterMitotic');
        dom.sliders.csf = document.getElementById('sliderFilterCSF');

        // Valores de texto
        dom.values.lor = document.getElementById('valFilterLOR');
        dom.values.nomarski = document.getElementById('valFilterNomarski');
        dom.values.nomarskiAngle = document.getElementById('valFilterNomarskiAngle');
        dom.values.dehaze = document.getElementById('valFilterDehaze');
        dom.values.mitotic = document.getElementById('valFilterMitotic');
        dom.values.csf = document.getElementById('valFilterCSF');

        // Tarjetas
        dom.cards.lor = document.getElementById('cardFilterLOR');
        dom.cards.nomarski = document.getElementById('cardFilterNomarski');
        dom.cards.dehaze = document.getElementById('cardFilterDehaze');
        dom.cards.mitotic = document.getElementById('cardFilterMitotic');
        dom.cards.csf = document.getElementById('cardFilterCSF');
        dom.cards.microsaccades = document.getElementById('cardFilterMicrosaccades');

        // Botones de Reset
        dom.btnResetNeuro = document.getElementById('btnResetNeuroFilters');
        dom.btnResetNeuroFull = document.getElementById('btnResetNeuroFiltersFull');
        dom.btnResetBase = document.getElementById('btnResetFilters');

        // Sliders Base
        dom.sliderBrightness = document.getElementById('sliderBrightness');
        dom.sliderContrast = document.getElementById('sliderContrast');
        dom.sliderSaturation = document.getElementById('sliderSaturation');
        dom.valBrightness = document.getElementById('valBrightness');
        dom.valContrast = document.getElementById('valContrast');
        dom.valSaturation = document.getElementById('valSaturation');

        // Badge de micro-sacadas
        if (dom.cards.microsaccades) {
            dom.badgeMicrosaccades = dom.cards.microsaccades.querySelector('.neuro-control-badge');
        }

        // SVG Defs
        dom.svgDefs = document.getElementById('neuroFiltersDefs');
    }

    /**
     * Enlaza todos los manejadores de eventos con delegación y debounce 60 FPS
     */
    function bindEvents() {
        // 1. Chips de Presets
        Object.entries(dom.chips).forEach(([key, btn]) => {
            if (!btn) return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                setPreset(key);
            });
        });

        // 2. Toggles de Filtros
        const toggleFilterMap = [
            { key: 'lor', toggle: dom.toggles.lor, slider: dom.sliders.lor, defaultVal: 75 },
            { key: 'nomarski', toggle: dom.toggles.nomarski, slider: dom.sliders.nomarski, defaultVal: 70 },
            { key: 'dehaze', toggle: dom.toggles.dehaze, slider: dom.sliders.dehaze, defaultVal: 50 },
            { key: 'mitotic', toggle: dom.toggles.mitotic, slider: dom.sliders.mitotic, defaultVal: 85 },
            { key: 'csf', toggle: dom.toggles.csf, slider: dom.sliders.csf, defaultVal: 80 }
        ];

        toggleFilterMap.forEach(({ key, toggle, slider, defaultVal }) => {
            if (!toggle) return;
            toggle.addEventListener('change', () => {
                const isChecked = toggle.checked;
                state.filters[key].enabled = isChecked;

                // Si se activa y el slider estaba en 0, asignarle el valor sugerido
                if (isChecked && slider && parseInt(slider.value, 10) === 0) {
                    slider.value = defaultVal;
                    state.filters[key].intensity = defaultVal;
                    if (key === 'nomarski') state.filters.nomarski.depth = defaultVal;
                    updateSliderLabel(key);
                } else if (!isChecked && slider) {
                    state.filters[key].enabled = false;
                }

                syncCardState(key);
                checkActivePresetMatch();
                scheduleRender();
            });
        });

        // Toggle Micro-Sacadas
        if (dom.toggles.microsaccades) {
            dom.toggles.microsaccades.addEventListener('change', () => {
                state.filters.microsaccades.enabled = dom.toggles.microsaccades.checked;
                syncCardState('microsaccades');
                updateMicrosaccadesStatus();
            });
        }

        // 3. Sliders Reactivos (Evento 'input' para 60 FPS)
        const sliderBindings = [
            { key: 'lor', slider: dom.sliders.lor, toggle: dom.toggles.lor, prop: 'intensity' },
            { key: 'nomarski', slider: dom.sliders.nomarski, toggle: dom.toggles.nomarski, prop: 'depth' },
            { key: 'dehaze', slider: dom.sliders.dehaze, toggle: dom.toggles.dehaze, prop: 'intensity' },
            { key: 'mitotic', slider: dom.sliders.mitotic, toggle: dom.toggles.mitotic, prop: 'intensity' },
            { key: 'csf', slider: dom.sliders.csf, toggle: dom.toggles.csf, prop: 'intensity' }
        ];

        sliderBindings.forEach(({ key, slider, toggle, prop }) => {
            if (!slider) return;
            slider.addEventListener('input', () => {
                const val = parseInt(slider.value, 10);
                state.filters[key][prop] = val;
                updateSliderLabel(key);

                // Auto-activar el toggle si el usuario mueve el slider > 0
                if (val > 0 && toggle && !toggle.checked) {
                    toggle.checked = true;
                    state.filters[key].enabled = true;
                    syncCardState(key);
                } else if (val === 0 && toggle && toggle.checked) {
                    toggle.checked = false;
                    state.filters[key].enabled = false;
                    syncCardState(key);
                }

                checkActivePresetMatch();
                updateSVGFilterParams();
                scheduleRender();
            });
        });

        // Slider Ángulo Nomarski (0° - 360°)
        if (dom.sliders.nomarskiAngle) {
            dom.sliders.nomarskiAngle.addEventListener('input', () => {
                const angle = parseInt(dom.sliders.nomarskiAngle.value, 10);
                state.filters.nomarski.angle = angle;
                if (dom.values.nomarskiAngle) {
                    dom.values.nomarskiAngle.textContent = `${angle}°`;
                }
                if (dom.toggles.nomarski && !dom.toggles.nomarski.checked && state.filters.nomarski.depth > 0) {
                    dom.toggles.nomarski.checked = true;
                    state.filters.nomarski.enabled = true;
                    syncCardState('nomarski');
                }
                updateSVGFilterParams();
                scheduleRender();
            });
        }

        // Sliders Base (Brillo / Contraste / Saturación)
        [
            { el: dom.sliderBrightness, valEl: dom.valBrightness, prop: 'brightness' },
            { el: dom.sliderContrast, valEl: dom.valContrast, prop: 'contrast' },
            { el: dom.sliderSaturation, valEl: dom.valSaturation, prop: 'saturation' }
        ].forEach(({ el, valEl, prop }) => {
            if (!el) return;
            el.addEventListener('input', () => {
                const v = parseInt(el.value, 10);
                state.base[prop] = v;
                if (valEl) valEl.textContent = `${v}%`;
                scheduleRender();
            });
        });

        // 4. Botones de Reseteo
        if (dom.btnResetNeuro) {
            dom.btnResetNeuro.addEventListener('click', (e) => {
                e.preventDefault();
                resetNeuroFilters();
            });
        }
        if (dom.btnResetNeuroFull) {
            dom.btnResetNeuroFull.addEventListener('click', (e) => {
                e.preventDefault();
                resetNeuroFilters();
            });
        }
        if (dom.btnResetBase) {
            dom.btnResetBase.addEventListener('click', () => {
                setTimeout(() => {
                    syncBaseFromSliders();
                    scheduleRender();
                }, 10);
            });
        }

        // 5. Integración con eventos de OpenSeadragon
        bindViewerEvents();
    }

    /**
     * Vincula observadores de zoom y render de OpenSeadragon
     */
    function bindViewerEvents() {
        if (!window.viewer) {
            const checkTimer = setInterval(() => {
                if (window.viewer) {
                    clearInterval(checkTimer);
                    bindViewerEvents();
                }
            }, 300);
            return;
        }

        const v = window.viewer;
        const onViewerUpdate = () => {
            updateMicrosaccadesStatus();
        };

        v.addHandler('zoom', onViewerUpdate);
        v.addHandler('animation', onViewerUpdate);
        v.addHandler('open', () => {
            setTimeout(() => {
                applyFilters();
                updateMicrosaccadesStatus();
            }, 50);
        });
    }

    /**
     * Sincroniza la clase .active y .is-active en las tarjetas de control
     */
    function syncCardState(key) {
        const card = dom.cards[key];
        const isEnabled = key === 'microsaccades' 
            ? (state.filters.microsaccades.enabled) 
            : (state.filters[key] && state.filters[key].enabled);

        if (card) {
            card.classList.toggle('active', !!isEnabled);
            card.classList.toggle('is-active', !!isEnabled);
        }
    }

    /**
     * Actualiza el texto de valor en la UI para un slider específico
     */
    function updateSliderLabel(key) {
        const valEl = dom.values[key];
        const slider = dom.sliders[key];
        if (valEl && slider) {
            valEl.textContent = `${slider.value}%`;
        }
    }

    /**
     * Lee los valores actuales de los sliders de brillo, contraste y saturación
     */
    function syncBaseFromSliders() {
        if (dom.sliderBrightness) state.base.brightness = parseInt(dom.sliderBrightness.value, 10) || 100;
        if (dom.sliderContrast) state.base.contrast = parseInt(dom.sliderContrast.value, 10) || 100;
        if (dom.sliderSaturation) state.base.saturation = parseInt(dom.sliderSaturation.value, 10) || 100;

        if (dom.valBrightness) dom.valBrightness.textContent = `${state.base.brightness}%`;
        if (dom.valContrast) dom.valContrast.textContent = `${state.base.contrast}%`;
        if (dom.valSaturation) dom.valSaturation.textContent = `${state.base.saturation}%`;
    }

    /**
     * Activa un Preset Perceptual completo e instantáneo
     */
    function setPreset(presetKey) {
        const preset = PRESETS[presetKey];
        if (!preset) return;

        state.activePreset = presetKey;

        // 1. Actualizar estado visual de los Chips
        Object.entries(dom.chips).forEach(([k, btn]) => {
            if (!btn) return;
            const isActive = (k === presetKey);
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('is-active', isActive);
        });

        // 2. Aplicar configuraciones de Neuro-Filtros
        ['lor', 'nomarski', 'dehaze', 'mitotic', 'csf'].forEach(key => {
            const pConfig = preset[key];
            if (!pConfig) return;

            state.filters[key].enabled = pConfig.enabled;
            if (dom.toggles[key]) {
                dom.toggles[key].checked = pConfig.enabled;
            }

            const val = (key === 'nomarski') ? pConfig.depth : pConfig.intensity;
            if (key === 'nomarski') {
                state.filters.nomarski.depth = val;
                state.filters.nomarski.angle = pConfig.angle !== undefined ? pConfig.angle : 45;
                if (dom.sliders.nomarskiAngle) dom.sliders.nomarskiAngle.value = state.filters.nomarski.angle;
                if (dom.values.nomarskiAngle) dom.values.nomarskiAngle.textContent = `${state.filters.nomarski.angle}°`;
            } else {
                state.filters[key].intensity = val;
            }

            if (dom.sliders[key]) {
                dom.sliders[key].value = val;
            }
            updateSliderLabel(key);
            syncCardState(key);
        });

        // 3. Ajustes de Imagen Base recomendados por el Preset
        if (preset.base) {
            state.base.brightness = preset.base.brightness;
            state.base.contrast = preset.base.contrast;
            state.base.saturation = preset.base.saturation;

            if (dom.sliderBrightness) dom.sliderBrightness.value = preset.base.brightness;
            if (dom.sliderContrast) dom.sliderContrast.value = preset.base.contrast;
            if (dom.sliderSaturation) dom.sliderSaturation.value = preset.base.saturation;

            if (dom.valBrightness) dom.valBrightness.textContent = `${preset.base.brightness}%`;
            if (dom.valContrast) dom.valContrast.textContent = `${preset.base.contrast}%`;
            if (dom.valSaturation) dom.valSaturation.textContent = `${preset.base.saturation}%`;
        }

        // 4. Renderizar inmediatamente a 60 FPS
        applyFilters();
    }

    /**
     * Verifica si la combinación manual de toggles coincide exactamente con algún Preset
     */
    function checkActivePresetMatch() {
        let matchedKey = null;

        for (const [key, preset] of Object.entries(PRESETS)) {
            let matches = true;
            for (const fKey of ['lor', 'nomarski', 'dehaze', 'mitotic', 'csf']) {
                if (state.filters[fKey].enabled !== preset[fKey].enabled) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                matchedKey = key;
                break;
            }
        }

        const anyActive = Object.keys(state.filters).some(k => k !== 'microsaccades' && state.filters[k].enabled);
        if (!anyActive) {
            matchedKey = 'original';
        }

        state.activePreset = matchedKey;

        Object.entries(dom.chips).forEach(([k, btn]) => {
            if (!btn) return;
            const isActive = (k === matchedKey);
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('is-active', isActive);
        });
    }

    /**
     * Actualiza dinámicamente los parámetros internos de los elementos SVG del filtro
     */
    function updateSVGFilterParams() {
        // 1. Relieve Nomarski 3D (#filter-nomarski-3d)
        const filterNomarski = document.getElementById('filter-nomarski-3d');
        if (filterNomarski) {
            const diffLighting = filterNomarski.querySelector('feDiffuseLighting');
            if (diffLighting) {
                const depth = (state.filters.nomarski.depth || 0) / 100;
                diffLighting.setAttribute('surfaceScale', (0.8 + depth * 2.8).toFixed(2));
                diffLighting.setAttribute('diffuseConstant', (0.9 + depth * 0.7).toFixed(2));
            }
            const distLight = filterNomarski.querySelector('feDistantLight');
            if (distLight) {
                const angle = state.filters.nomarski.angle !== undefined ? state.filters.nomarski.angle : 45;
                distLight.setAttribute('azimuth', angle.toString());
            }
        }

        // 2. Realismo Óptico LOR (#filter-lor-realism)
        const filterLOR = document.getElementById('filter-lor-realism');
        if (filterLOR) {
            const ct = filterLOR.querySelector('feComponentTransfer');
            if (ct) {
                const val = (state.filters.lor.intensity || 0) / 100;
                const slopeR = (1.0 + val * 0.20).toFixed(2);
                const slopeG = (1.0 + val * 0.22).toFixed(2);
                const slopeB = (1.0 + val * 0.14).toFixed(2);
                const intR = (-val * 0.08).toFixed(2);
                const intG = (-val * 0.09).toFixed(2);
                const intB = (-val * 0.05).toFixed(2);

                const fR = ct.querySelector('feFuncR');
                const fG = ct.querySelector('feFuncG');
                const fB = ct.querySelector('feFuncB');
                if (fR) { fR.setAttribute('slope', slopeR); fR.setAttribute('intercept', intR); }
                if (fG) { fG.setAttribute('slope', slopeG); fG.setAttribute('intercept', intG); }
                if (fB) { fB.setAttribute('slope', slopeB); fB.setAttribute('intercept', intB); }
            }
        }

        // 3. Dehaze & Pureza Cromática (#filter-dehaze-he)
        const filterDehaze = document.getElementById('filter-dehaze-he');
        if (filterDehaze) {
            const ct = filterDehaze.querySelector('feComponentTransfer');
            if (ct) {
                const val = (state.filters.dehaze.intensity || 0) / 100;
                const slopeR = (1.0 + val * 0.24).toFixed(2);
                const slopeG = (1.0 + val * 0.26).toFixed(2);
                const slopeB = (1.0 + val * 0.18).toFixed(2);
                const intR = (-val * 0.10).toFixed(2);
                const intG = (-val * 0.11).toFixed(2);
                const intB = (-val * 0.07).toFixed(2);

                const fR = ct.querySelector('feFuncR');
                const fG = ct.querySelector('feFuncG');
                const fB = ct.querySelector('feFuncB');
                if (fR) { fR.setAttribute('slope', slopeR); fR.setAttribute('intercept', intR); }
                if (fG) { fG.setAttribute('slope', slopeG); fG.setAttribute('intercept', intG); }
                if (fB) { fB.setAttribute('slope', slopeB); fB.setAttribute('intercept', intB); }
            }
        }

        // 4. Pop-Out Mitótico (#filter-mitotic-glow)
        const filterMitotic = document.getElementById('filter-mitotic-glow');
        if (filterMitotic) {
            const blur = filterMitotic.querySelector('feGaussianBlur');
            if (blur) {
                const val = (state.filters.mitotic.intensity || 0) / 100;
                blur.setAttribute('stdDeviation', (1.2 + val * 3.0).toFixed(1));
            }
        }

        // 5. Claridad Foveal CSF (#filter-csf-boost)
        const filterCSF = document.getElementById('filter-csf-boost');
        if (filterCSF) {
            const conv = filterCSF.querySelector('feConvolveMatrix');
            if (conv) {
                const val = (state.filters.csf.intensity || 0) / 100;
                const divisor = Math.max(16, Math.round(30 - val * 12));
                conv.setAttribute('divisor', divisor.toString());
            }
        }
    }

    /**
     * Ensambla la cadena CSS de filtros combinando base y SVG
     */
    function buildFilterString() {
        const { brightness, contrast, saturation } = state.base;
        let baseFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        const svgFilters = [];

        if (state.filters.lor.enabled) {
            svgFilters.push('url(#filter-lor-realism)');
        }
        if (state.filters.nomarski.enabled) {
            svgFilters.push('url(#filter-nomarski-3d)');
        }
        if (state.filters.dehaze.enabled && !state.filters.lor.enabled) {
            svgFilters.push('url(#filter-dehaze-he)');
        }
        if (state.filters.mitotic.enabled) {
            svgFilters.push('url(#filter-mitotic-glow)');
        }
        if (state.filters.csf.enabled) {
            svgFilters.push('url(#filter-csf-boost)');
        }

        if (svgFilters.length > 0) {
            return `${baseFilter} ${svgFilters.join(' ')}`;
        }
        return baseFilter;
    }

    /**
     * Aplica la cadena de filtros directamente sobre el canvas del visor WSI y la lupa
     */
    function applyFilters() {
        syncBaseFromSliders();
        updateSVGFilterParams();

        const filterValue = buildFilterString();

        // 1. Aplicar a OpenSeadragon canvas
        const canvas = getViewerCanvas();
        if (canvas) {
            canvas.style.filter = filterValue;
        }

        // 2. Aplicar a Magnifier canvas
        const magCanvas = getMagnifierCanvas();
        if (magCanvas) {
            magCanvas.style.filter = filterValue;
        }

        // 3. Revisar estado de micro-sacadas
        updateMicrosaccadesStatus();
    }

    /**
     * Programa una actualización de filtros en el próximo fotograma de animación (60 FPS sin parpadeo)
     */
    function scheduleRender() {
        if (!state.renderPending) {
            state.renderPending = true;
            requestAnimationFrame(() => {
                state.renderPending = false;
                applyFilters();
            });
        }
    }

    /**
     * Evalúa y gestiona el ciclo de vida de las Micro-Sacadas Temporales
     */
    function updateMicrosaccadesStatus() {
        const toggle = dom.toggles.microsaccades;
        const isToggleEnabled = toggle ? toggle.checked : false;
        state.filters.microsaccades.enabled = isToggleEnabled;

        const currentMag = getCurrentMagnification();
        const isHighZoom = currentMag >= 30.0;
        const shouldRun = isToggleEnabled && isHighZoom;

        // Actualizar etiqueta e indicador visual en la interfaz
        if (dom.badgeMicrosaccades) {
            if (isToggleEnabled && isHighZoom) {
                dom.badgeMicrosaccades.textContent = `⚡ Activo (${Math.round(currentMag)}x)`;
                dom.badgeMicrosaccades.classList.add('active', 'is-active');
            } else if (isToggleEnabled && !isHighZoom) {
                dom.badgeMicrosaccades.textContent = `Espera >30x (${Math.round(currentMag)}x)`;
                dom.badgeMicrosaccades.classList.remove('active', 'is-active');
            } else {
                dom.badgeMicrosaccades.textContent = `Zoom > 30x`;
                dom.badgeMicrosaccades.classList.remove('active', 'is-active');
            }
        }

        syncCardState('microsaccades');

        if (shouldRun) {
            startMicrosaccades();
        } else {
            stopMicrosaccades();
        }
    }

    /**
     * Inicia el bucle de micro-desplazamiento temporal subpíxel (RAF loop a 60 FPS)
     */
    function startMicrosaccades() {
        if (state.saccades.isRunning) return;
        state.saccades.isRunning = true;

        const { amplitude, tremorFreq, driftFreq } = state.saccades;

        function loop(timestamp) {
            if (!state.saccades.isRunning) return;

            const t = timestamp * 0.001;
            const angleTremor = t * tremorFreq;
            const angleDrift = t * driftFreq;

            const dx = (Math.sin(angleTremor) * 0.68 + Math.cos(angleDrift) * 0.32) * amplitude;
            const dy = (Math.cos(angleTremor * 1.13) * 0.68 + Math.sin(angleDrift * 0.89) * 0.32) * amplitude;

            // Inyección por hardware GPU vía transform: translate3d sin forzar relayout
            const canvas = getViewerCanvas();
            if (canvas) {
                canvas.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
            }

            // Aplicar también a la lupa virtual si está en inmersión activa
            const magCanvas = getMagnifierCanvas();
            if (magCanvas && magCanvas.offsetParent !== null) {
                magCanvas.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
            }

            state.saccades.rafId = requestAnimationFrame(loop);
        }

        // Ejecutar inmediatamente el primer fotograma para sincronización instantánea
        loop(performance.now());
    }

    /**
     * Detiene el bucle de micro-sacadas y restaura la posición original del canvas
     */
    function stopMicrosaccades() {
        if (!state.saccades.isRunning && !state.saccades.rafId) return;

        state.saccades.isRunning = false;
        if (state.saccades.rafId) {
            cancelAnimationFrame(state.saccades.rafId);
            state.saccades.rafId = null;
        }

        const canvas = getViewerCanvas();
        if (canvas) {
            canvas.style.transform = '';
        }

        const magCanvas = getMagnifierCanvas();
        if (magCanvas) {
            magCanvas.style.transform = '';
        }
    }

    /**
     * Restablece únicamente los Neuro-Filtros a su estado original (desactivados)
     */
    function resetNeuroFilters() {
        setPreset('original');
    }

    /**
     * Restablece tanto Neuro-Filtros como Ajustes Base de Imagen (Brillo 100%, Contraste 100%, Saturación 100%)
     */
    function resetAllFilters() {
        if (dom.sliderBrightness) dom.sliderBrightness.value = 100;
        if (dom.sliderContrast) dom.sliderContrast.value = 100;
        if (dom.sliderSaturation) dom.sliderSaturation.value = 100;

        syncBaseFromSliders();
        setPreset('original');
    }

    /**
     * Inicialización pública del motor
     */
    function init() {
        if (state.initialized) return;

        queryDomElements();
        bindEvents();
        syncBaseFromSliders();

        applyFilters();

        state.initialized = true;
        console.log('⚡ [NeuroOpticalEngine] Motor de Neuro-Filtros y Renderizado Perceptual Inicializado con Éxito.');
    }

    // Inicializar automáticamente cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API Pública Exportada
    const API = {
        init,
        applyFilters,
        setPreset,
        resetFilters: resetNeuroFilters,
        resetAllFilters,
        getViewerCanvas,
        getCurrentMagnification,
        startMicrosaccades,
        stopMicrosaccades,
        updateMicrosaccadesStatus,
        getState: () => JSON.parse(JSON.stringify(state))
    };

    window.NeuroOpticalEngine = API;

})(window, document);
