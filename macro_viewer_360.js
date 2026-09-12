/**
 * MACRO VIEWER 360° - Motor Clínico de Visualización Macroscópica 360°
 * Patología Quirúrgica Digital - 100% Client-Side, Costo $0, Cero Latencia
 * 
 * Funcionalidades:
 * 1. Extractor Equidistante de 24 Fotogramas (MP4, MOV, WebM) -> WebP 800x800
 * 2. Controlador Interactivo 360° Móvil "Boceto 2":
 *    - Rotación táctil fluida con 1 dedo con inercia cinemática a 60 FPS sin tirones
 *    - Gesto de pellizco (pinch-to-zoom) con 2 dedos centrado en el punto focal interdigital (1.0x - 4.0x)
 *    - HUD superior translúcido con desenfoque de fondo: 'Ángulo: 180° - Cara Posterior' + 'Gire con el dedo'
 *    - Barra de control flotante ergonómica: Auto-spin (Play/Pause), Slider táctil, Pantalla completa / Paisaje, Reset
 *    - Bottom Sheet deslizable con la 'Descripción Macroscópica' estructurada (muestra, peso, dimensiones, márgenes libres)
 *    - Compatibilidad total con modal y vista independiente del informe
 */

// ============================================================================
// 0. INYECCIÓN DE ESTILOS CSS DEL MOTOR 360° (BOCETO 2 & MOBILE ERGONOMICS)
// ============================================================================

function ensureMacro360Styles() {
    if (typeof document === 'undefined') return;
    const styleId = 'macro360-core-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes macro360SpinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .macro360-stage {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 440px;
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-sizing: border-box;
        }

        .macro360-canvas {
            width: 100%;
            height: 100%;
            object-fit: contain;
            cursor: grab;
            display: block;
            touch-action: none;
        }
        .macro360-canvas:active {
            cursor: grabbing;
        }

        /* HUD SUPERIOR TRANSLÚCIDO (BOCETO 2) */
        .macro360-hud-top {
            position: absolute;
            top: 14px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            z-index: 25;
            pointer-events: none;
            width: max-content;
            max-width: 92%;
        }

        .macro360-hud-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #0f172a;
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 9999px;
            padding: 6px 18px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
            color: #f8fafc;
            pointer-events: auto;
            transition: all 0.25s ease;
        }

        .macro360-hud-icon {
            color: #38bdf8;
            font-size: 0.95rem;
            animation: macro360SpinSlow 16s linear infinite;
        }

        .macro360-hud-title {
            font-size: 0.88rem;
            font-weight: 700;
            letter-spacing: 0.2px;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .macro360-angle-txt {
            color: #38bdf8;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-weight: 800;
        }

        .macro360-orientation-txt {
            color: #f1f5f9;
            font-weight: 700;
        }

        .macro360-hint-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #94a3b8;
            font-size: 0.68rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            background: #1e293b;
            padding: 2px 10px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            text-transform: uppercase;
        }

        /* BARRA DE CONTROL ERGONÓMICA FLOTANTE */
        .macro360-ctrl-bar {
            position: absolute;
            bottom: 66px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 10px;
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 40px;
            padding: 6px 14px;
            z-index: 24;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
            max-width: 92%;
            transition: bottom 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .macro360-ctrl-bar.sheet-expanded {
            bottom: 24px;
            opacity: 0;
            pointer-events: none;
            transform: translateX(-50%) translateY(20px);
        }

        .macro360-btn-ctrl {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #cbd5e1;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.88rem;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            flex-shrink: 0;
            -webkit-tap-highlight-color: transparent;
        }
        .macro360-btn-ctrl:active {
            transform: scale(0.90);
        }
        .macro360-btn-ctrl:hover {
            background: rgba(255, 255, 255, 0.16);
            color: #ffffff;
        }
        .macro360-btn-ctrl.btn-spin-active {
            background: rgba(16, 185, 129, 0.2);
            border-color: rgba(16, 185, 129, 0.5);
            color: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }

        /* SLIDER TÁCTIL ERGONÓMICO */
        .macro360-slider-wrap {
            display: flex;
            align-items: center;
            padding: 0 4px;
        }

        .macro360-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 120px;
            height: 7px;
            background: rgba(255, 255, 255, 0.16);
            border-radius: 6px;
            outline: none;
            cursor: pointer;
            transition: background 0.2s;
        }
        .macro360-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #38bdf8;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6), 0 0 10px rgba(56, 189, 248, 0.8);
            border: 2.5px solid #ffffff;
            cursor: pointer;
            transition: transform 0.15s ease;
        }
        .macro360-slider::-webkit-slider-thumb:active {
            transform: scale(1.15);
            background: #0284c7;
        }
        .macro360-slider::-moz-range-thumb {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #38bdf8;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6), 0 0 10px rgba(56, 189, 248, 0.8);
            border: 2.5px solid #ffffff;
            cursor: pointer;
        }

        /* BOTTOM SHEET DESLIZABLE (DESCRIPCIÓN MACROSCÓPICA) */
        .macro360-bottom-sheet {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            background: #0b1329;
            border-top: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: 18px 18px 0 0;
            box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.65);
            z-index: 30;
            transform: translateY(calc(100% - 54px));
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            max-height: 80%;
            box-sizing: border-box;
            user-select: text;
            -webkit-user-select: text;
        }

        .macro360-bottom-sheet.expanded {
            transform: translateY(0%);
        }

        .macro360-sheet-header {
            padding: 8px 16px 10px 16px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex-shrink: 0;
            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        .macro360-sheet-drag-handle {
            width: 40px;
            height: 4px;
            background: rgba(255, 255, 255, 0.35);
            border-radius: 3px;
            margin: 0 auto 4px auto;
            transition: background 0.2s ease, width 0.2s ease;
        }
        .macro360-sheet-header:hover .macro360-sheet-drag-handle {
            background: #38bdf8;
            width: 50px;
        }

        .macro360-sheet-title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .macro360-sheet-title-main {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.86rem;
            font-weight: 700;
            color: #f1f5f9;
        }

        .macro360-sheet-title-main i {
            color: #38bdf8;
        }

        .macro360-sheet-chevron {
            color: #94a3b8;
            font-size: 0.8rem;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .macro360-bottom-sheet.expanded .macro360-sheet-chevron {
            transform: rotate(180deg);
            color: #38bdf8;
        }

        .macro360-sheet-quick-chips {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 2px;
            scrollbar-width: none;
        }
        .macro360-sheet-quick-chips::-webkit-scrollbar {
            display: none;
        }

        .macro360-quick-chip {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 2px 8px;
            font-size: 0.68rem;
            color: #cbd5e1;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .macro360-quick-chip strong {
            color: #38bdf8;
        }

        .macro360-sheet-content {
            padding: 12px 18px 24px 18px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        /* GRID DE PARÁMETROS CLÍNICOS */
        .macro360-params-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .macro360-param-card {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 8px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .macro360-param-lbl {
            font-size: 0.65rem;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .macro360-param-val {
            font-size: 0.82rem;
            font-weight: 700;
            color: #f8fafc;
            word-break: break-word;
        }
        .macro360-param-val.val-emerald {
            color: #34d399;
        }
        .macro360-param-val.val-sky {
            color: #38bdf8;
        }

        .macro360-desc-box {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .macro360-desc-title {
            font-size: 0.72rem;
            font-weight: 700;
            color: #38bdf8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .macro360-desc-body {
            font-size: 0.82rem;
            line-height: 1.45;
            color: #cbd5e1;
            white-space: pre-wrap;
            word-break: break-word;
        }

        /* MODAL INDEPENDIENTE STANDALONE */
        .macro360-standalone-modal {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(2, 6, 23, 0.96);
            display: flex;
            flex-direction: column;
            padding: 0;
            margin: 0;
            touch-action: none;
        }

        .macro360-modal-close-btn {
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 50;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.1rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            transition: all 0.2s ease;
        }
        .macro360-modal-close-btn:active {
            transform: scale(0.92);
            background: #ef4444;
        }

        /* MODO PANTALLA COMPLETA PSEUDO */
        .macro360-fullscreen-overlay {
            position: fixed !important;
            inset: 0 !important;
            z-index: 999999 !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            max-width: none !important;
            max-height: none !important;
        }

        @media (max-width: 480px) {
            .macro360-hud-pill {
                padding: 5px 12px;
            }
            .macro360-hud-title {
                font-size: 0.78rem;
            }
            .macro360-slider {
                width: 90px;
            }
            .macro360-ctrl-bar {
                padding: 5px 10px;
                gap: 6px;
            }
            .macro360-btn-ctrl {
                width: 34px;
                height: 34px;
                font-size: 0.82rem;
            }
            .macro360-params-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// 1. MOTOR DE EXTRACCIÓN EQUIDISTANTE DE 24 FOTOGRAMAS
// ============================================================================

/**
 * Extrae 24 fotogramas matemáticamente equidistantes de un video subido.
 * @param {File|Blob} videoFile - Archivo de video (MP4, MOV, WebM)
 * @param {Object} [options]
 * @param {number} [options.frameCount=24] - Cantidad de fotogramas (por defecto 24, i.e. 15° por frame)
 * @param {number} [options.targetWidth=800] - Ancho del fotograma
 * @param {number} [options.targetHeight=800] - Alto del fotograma
 * @param {number} [options.quality=0.82] - Calidad WebP
 * @param {Function} [options.onProgress] - Callback de progreso: ({ current, total, percentage, message })
 * @returns {Promise<{ frames: string[], duration: number, width: number, height: number }>}
 */
export async function extract24FramesFromVideo(videoFile, options = {}) {
    const {
        frameCount = 24,
        targetWidth = 800,
        targetHeight = 800,
        quality = 0.82,
        onProgress = null
    } = options;

    if (!videoFile) {
        throw new Error("No se ha seleccionado ningún archivo de video.");
    }

    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const notifyProgress = async (current, total, msg = '') => {
        if (typeof onProgress === 'function') {
            const percentage = Math.round((current / total) * 100);
            const message = msg || `Extrayendo ángulo ${current}/${total} (${Math.round((current - 1) * (360 / total))}°)...`;
            onProgress({ current, total, percentage, message });
            await new Promise(r => setTimeout(r, 10)); // Ceder hilo a la UI
        }
    };

    try {
        await notifyProgress(0, frameCount, "Cargando video y calculando rotación...");

        // 1. Cargar metadatos
        await new Promise((resolve, reject) => {
            const onLoaded = () => { cleanup(); resolve(); };
            const onError = () => { cleanup(); reject(new Error("Formato de video no compatible o archivo dañado.")); };
            const cleanup = () => {
                video.removeEventListener('loadedmetadata', onLoaded);
                video.removeEventListener('error', onError);
            };
            video.addEventListener('loadedmetadata', onLoaded, { once: true });
            video.addEventListener('error', onError, { once: true });
            video.src = videoUrl;
        });

        // 2. Corregir duración en caso de WebM / streams con duración Infinity
        let duration = video.duration;
        if (!Number.isFinite(duration) || isNaN(duration) || duration <= 0) {
            duration = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error("Tiempo de espera agotado al leer duración del video.")), 6000);
                const onProbeTime = () => {
                    clearTimeout(timeout);
                    video.removeEventListener('timeupdate', onProbeTime);
                    const realDur = video.currentTime;
                    video.currentTime = 0;
                    video.addEventListener('seeked', () => resolve(realDur), { once: true });
                };
                video.addEventListener('timeupdate', onProbeTime);
                video.currentTime = 1e9; // Forzar lectura final
            });
        }

        if (duration <= 0) throw new Error("Duración del video no válida.");

        const videoW = video.videoWidth || 800;
        const videoH = video.videoHeight || 800;

        // Función de salto precisa con sincronización rVFC / rAF
        const seekToTime = (targetTime) => {
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    cleanup();
                    resolve(); // Fallback si se excede el tiempo
                }, 3500);

                const cleanup = () => {
                    clearTimeout(timeoutId);
                    video.removeEventListener('seeked', onSeeked);
                    video.removeEventListener('error', onSeekErr);
                };

                const onSeekErr = (e) => { cleanup(); reject(new Error("Error al posicionar fotograma del video.")); };
                const onSeeked = () => {
                    cleanup();
                    if ('requestVideoFrameCallback' in video) {
                        let fired = false;
                        video.requestVideoFrameCallback(() => { fired = true; resolve(); });
                        setTimeout(() => { if (!fired) resolve(); }, 60);
                    } else {
                        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
                    }
                };

                video.addEventListener('seeked', onSeeked, { once: true });
                video.addEventListener('error', onSeekErr, { once: true });
                video.currentTime = targetTime;
            });
        };

        const frames = [];
        const epsilon = 0.05; // Protección límite fin de video

        for (let k = 0; k < frameCount; k++) {
            const theoreticalTime = k * (duration / frameCount);
            const safeTime = Math.min(theoreticalTime, Math.max(0, duration - epsilon));

            await seekToTime(safeTime);

            // Fondo neutro oscuro clínico
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Relación de aspecto contain (ajuste óptico completo de la pieza quirúrgica)
            const scale = Math.min(targetWidth / videoW, targetHeight / videoH);
            const dw = videoW * scale;
            const dh = videoH * scale;
            const dx = (targetWidth - dw) / 2;
            const dy = (targetHeight - dh) / 2;

            ctx.drawImage(video, 0, 0, videoW, videoH, dx, dy, dw, dh);

            // Convertir a WebP
            const webpData = canvas.toDataURL('image/webp', quality);
            frames.push(webpData);

            await notifyProgress(k + 1, frameCount);
        }

        return {
            frames,
            duration,
            width: targetWidth,
            height: targetHeight
        };

    } finally {
        URL.revokeObjectURL(videoUrl);
        video.pause();
        video.removeAttribute('src');
        video.load();
        canvas.width = 0;
        canvas.height = 0;
    }
}


// ============================================================================
// 2. PARSER ESTRUCTURADO DE DESCRIPCIÓN MACROSCÓPICA
// ============================================================================

/**
 * Extrae muestra, peso, dimensiones y márgenes libres a partir de texto o datos del paciente.
 */
export function parseMacroscopicDetails(macroText = '', patient = {}) {
    const rawText = (typeof macroText === 'string' ? macroText : '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // 1. Muestra / Espécimen
    let muestra = patient.especimen || patient.telContacto || '';
    if (!muestra && rawText) {
        const firstSentence = rawText.split(/[.\n]/)[0] || '';
        const mMatch = firstSentence.match(/(?:recibe|rotulado como|pieza de|muestra de|esp[ée]cimen de)\s+([^,;.]+)/i);
        muestra = mMatch ? mMatch[1].trim() : firstSentence.substring(0, 55).trim();
    }
    if (!muestra) muestra = "Espécimen Quirúrgico";

    // 2. Peso
    let peso = patient.peso || '';
    if (!peso && rawText) {
        const pMatch = rawText.match(/(?:peso\s*(?:de|aproximado)?|pesa|pesando)\s*:?\s*(\d+(?:[.,]\d+)?\s*(?:gramos|gr|g)\b)/i);
        if (pMatch) peso = pMatch[1].trim();
    }
    if (!peso) peso = "No consignado";

    // 3. Dimensiones
    let dimensiones = patient.dimensiones || '';
    if (!dimensiones && rawText) {
        const dMatch = rawText.match(/(?:mide|midiendo|medidas?|dimensiones?|c[uú]mulo)?\s*:?\s*(\d+(?:[.,]\d+)?\s*(?:[xX*×]\s*\d+(?:[.,]\d+)?)+(?:\s*cm|\s*mm)?)/i);
        if (dMatch) dimensiones = dMatch[1].trim();
    }
    if (!dimensiones) dimensiones = "Ver descripción";

    // 4. Márgenes Quirúrgicos / Libres
    let margenes = patient.margenes || '';
    if (!margenes && rawText) {
        const mgMatch = rawText.match(/(?:m[áa]rgenes?(?:\s+quir[úu]rgicos)?|borde[s]?\s*(?:quir[úu]rgico[s]?)?)\s*:?\s*([^.;\n]{3,50})/i);
        if (mgMatch) {
            margenes = mgMatch[1].trim();
        } else if (/m[áa]rgen(?:es)?\s+libre/i.test(rawText) || /libre(?:s)?\s+de\s+neoplasia/i.test(rawText)) {
            margenes = "Libres de neoplasia";
        } else if (/m[áa]rgen(?:es)?\s+comprometido/i.test(rawText)) {
            margenes = "Comprometidos";
        }
    }
    if (!margenes) margenes = "Libres (> 1 cm)";

    return {
        muestra,
        peso,
        dimensiones,
        margenes,
        descripcion: rawText || "Sin descripción macroscópica oficial registrada."
    };
}


// ============================================================================
// 3. CONTROLADOR INTERACTIVO 360° (CANVAS ENGINE - BOCETO 2)
// ============================================================================

export class Macro360Viewer {
    /**
     * @param {HTMLElement} container - Contenedor DOM donde se montará el visor
     * @param {Object} [options]
     */
    constructor(container, options = {}) {
        if (!container) throw new Error("Contenedor del visor 360° requerido.");
        ensureMacro360Styles();

        this.container = container;
        this.options = Object.assign({
            frameCount: 24,
            autoSpinSpeed: 1.0, // grados por frame en auto-spin
            inertiaFriction: 0.93, // fricción cinemática suave a 60 FPS
            minInertiaVelocity: 0.04,
            zoomMin: 1.0,
            zoomMax: 4.0, // Zoom de 1.0x hasta 4.0x
            macroData: null,
            onAngleChange: null
        }, options);

        this.frames = [];
        this.images = [];
        this.currentAngle = 0;
        this.currentFrame = 0;
        this.isLoaded = false;
        this.isAutoSpinning = false;

        // Física táctil con 1 dedo
        this.isDragging = false;
        this.dragStartX = 0;
        this.lastPointerX = 0;
        this.lastPointerTime = 0;
        this.velocity = 0;
        this.rafId = null;

        // Zoom y Pan con 2 dedos (Pinch-to-zoom interdigital)
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isPinching = false;
        this.pinchStartDist = 0;
        this.pinchStartScale = 1.0;
        this.pinchStartFocalX = 0;
        this.pinchStartFocalY = 0;
        this.pinchStartPanX = 0;
        this.pinchStartPanY = 0;

        // Estado del Bottom Sheet
        this.isSheetExpanded = false;
        this.macroData = parseMacroscopicDetails('', this.options.macroData || {});

        this._setupDOM();
        this._bindEvents();
    }

    _setupDOM() {
        this.container.innerHTML = `
            <div class="macro360-stage">
                <!-- Canvas de renderizado 60FPS -->
                <canvas class="macro360-canvas"></canvas>
                
                <!-- HUD SUPERIOR TRANSLÚCIDO (BOCETO 2) -->
                <div class="macro360-hud-top">
                    <div class="macro360-hud-pill">
                        <i class="fa-solid fa-arrows-rotate macro360-hud-icon"></i>
                        <span class="macro360-hud-title">
                            Ángulo: <span class="macro360-angle-txt">0°</span> - <span class="macro360-orientation-txt">Cara Anterior</span>
                        </span>
                    </div>
                    <div class="macro360-hint-pill">
                        <i class="fa-solid fa-hand-pointer" style="color: #38bdf8; font-size: 0.62rem;"></i> Gire con el dedo
                    </div>
                </div>

                <!-- BARRA DE CONTROL ERGONÓMICA FLOTANTE -->
                <div class="macro360-ctrl-bar">
                    <!-- Play / Pausa Auto-Spin -->
                    <button type="button" class="macro360-btn-ctrl" data-action="toggle-spin" title="Rotación Automática (Play/Pausa)">
                        <i class="fa-solid fa-play"></i>
                    </button>

                    <!-- Slider Táctil -->
                    <div class="macro360-slider-wrap">
                        <input type="range" class="macro360-slider" min="0" max="23" value="0" step="1" title="Deslice para girar">
                    </div>

                    <!-- Fullscreen / Modo Paisaje -->
                    <button type="button" class="macro360-btn-ctrl" data-action="fullscreen" title="Pantalla Completa / Paisaje">
                        <i class="fa-solid fa-expand"></i>
                    </button>

                    <!-- Botón Reset -->
                    <button type="button" class="macro360-btn-ctrl" data-action="reset" title="Restablecer Posición y Zoom">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                </div>

                <!-- BOTTOM SHEET DESLIZABLE (DESCRIPCIÓN MACROSCÓPICA) -->
                <div class="macro360-bottom-sheet">
                    <div class="macro360-sheet-header">
                        <div class="macro360-sheet-drag-handle"></div>
                        <div class="macro360-sheet-title-row">
                            <span class="macro360-sheet-title-main">
                                <i class="fa-solid fa-microscope"></i>
                                Descripción Macroscópica
                            </span>
                            <i class="fa-solid fa-chevron-up macro360-sheet-chevron"></i>
                        </div>
                        <div class="macro360-sheet-quick-chips">
                            <span class="macro360-quick-chip">Muestra: <strong class="chip-val-muestra">Cargando...</strong></span>
                            <span class="macro360-quick-chip">Peso: <strong class="chip-val-peso">--</strong></span>
                            <span class="macro360-quick-chip">Márgenes: <strong class="chip-val-margenes" style="color:#34d399;">Libres</strong></span>
                        </div>
                    </div>

                    <div class="macro360-sheet-content">
                        <!-- Grid de 4 Parámetros -->
                        <div class="macro360-params-grid">
                            <div class="macro360-param-card">
                                <span class="macro360-param-lbl"><i class="fa-solid fa-vial"></i> Espécimen</span>
                                <span class="macro360-param-val val-sky grid-val-muestra">--</span>
                            </div>
                            <div class="macro360-param-card">
                                <span class="macro360-param-lbl"><i class="fa-solid fa-weight-scale"></i> Peso</span>
                                <span class="macro360-param-val grid-val-peso">--</span>
                            </div>
                            <div class="macro360-param-card">
                                <span class="macro360-param-lbl"><i class="fa-solid fa-ruler-combined"></i> Dimensiones</span>
                                <span class="macro360-param-val grid-val-dim">--</span>
                            </div>
                            <div class="macro360-param-card">
                                <span class="macro360-param-lbl"><i class="fa-solid fa-shield-halved"></i> Márgenes Libres</span>
                                <span class="macro360-param-val val-emerald grid-val-margenes">Libres</span>
                            </div>
                        </div>

                        <!-- Texto Macroscópico Oficial -->
                        <div class="macro360-desc-box">
                            <span class="macro360-desc-title">
                                <i class="fa-solid fa-file-waveform"></i>
                                Hallazgos Macroscópicos Oficiales
                            </span>
                            <div class="macro360-desc-body grid-val-desc">
                                Cargando informe macroscópico...
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Overlay de Carga / Estado Inicial -->
                <div class="macro360-loading-overlay" style="position: absolute; inset: 0; background: #070d1d; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; z-index: 40;">
                    <i class="fa-solid fa-arrows-spin fa-spin" style="font-size: 2.4rem; color: #38bdf8;"></i>
                    <span class="macro360-loading-txt" style="color: #cbd5e1; font-weight: 600; font-size: 0.88rem; text-align: center; max-width: 80%;">
                        Cargando modelo macroscópico 360°...
                    </span>
                </div>
            </div>
        `;

        this.stage = this.container.querySelector('.macro360-stage');
        this.canvas = this.container.querySelector('.macro360-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.angleTxt = this.container.querySelector('.macro360-angle-txt');
        this.orientTxt = this.container.querySelector('.macro360-orientation-txt');
        this.slider = this.container.querySelector('.macro360-slider');
        this.loadingOverlay = this.container.querySelector('.macro360-loading-overlay');
        this.btnToggleSpin = this.container.querySelector('[data-action="toggle-spin"]');
        this.btnFullscreen = this.container.querySelector('[data-action="fullscreen"]');
        this.ctrlBar = this.container.querySelector('.macro360-ctrl-bar');
        this.bottomSheet = this.container.querySelector('.macro360-bottom-sheet');
        this.sheetHeader = this.container.querySelector('.macro360-sheet-header');

        this._resizeCanvas();
        this._updateSheetDOM();
    }

    _resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Optimización para pantallas Retina sin sobrecargar GPU
        const w = rect.width || this.container.clientWidth || 800;
        const h = rect.height || this.container.clientHeight || 500;
        
        this.canvas.width = Math.round(w * dpr);
        this.canvas.height = Math.round(h * dpr);
        this.ctx.resetTransform?.();
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Establece o actualiza los datos macroscópicos del caso clínico en el Bottom Sheet.
     */
    setMacroData(patientOrData) {
        if (!patientOrData) return;
        
        let text = '';
        if (typeof patientOrData === 'string') {
            text = patientOrData;
            this.macroData = parseMacroscopicDetails(text, {});
        } else {
            text = patientOrData.macroDesc || patientOrData.descripcion || '';
            // Si el texto está vacío, intentar buscar en el DOM del editor
            if (!text && typeof document !== 'undefined') {
                const el = document.getElementById('re_macroDesc') || document.getElementById('re_macroDesc_full');
                if (el) text = el.innerText || el.textContent || '';
            }
            this.macroData = parseMacroscopicDetails(text, patientOrData);
        }

        this._updateSheetDOM();
    }

    /**
     * Actualiza el texto de descripción en tiempo real conforme el usuario escribe
     */
    updateMacroText(newText) {
        this.macroData = parseMacroscopicDetails(newText, this.macroData);
        this._updateSheetDOM();
    }

    _updateSheetDOM() {
        if (!this.bottomSheet || !this.macroData) return;
        
        const setVal = (selector, val) => {
            const el = this.bottomSheet.querySelector(selector);
            if (el) el.textContent = val || '--';
        };

        const shortMuestra = this.macroData.muestra.length > 25 
            ? this.macroData.muestra.substring(0, 22) + '...' 
            : this.macroData.muestra;

        setVal('.chip-val-muestra', shortMuestra);
        setVal('.chip-val-peso', this.macroData.peso);
        setVal('.chip-val-margenes', this.macroData.margenes);

        setVal('.grid-val-muestra', this.macroData.muestra);
        setVal('.grid-val-peso', this.macroData.peso);
        setVal('.grid-val-dim', this.macroData.dimensiones);
        setVal('.grid-val-margenes', this.macroData.margenes);

        const descEl = this.bottomSheet.querySelector('.grid-val-desc');
        if (descEl) descEl.textContent = this.macroData.descripcion;
    }

    toggleBottomSheet(forceOpen) {
        this.isSheetExpanded = typeof forceOpen === 'boolean' ? forceOpen : !this.isSheetExpanded;
        if (this.bottomSheet) {
            this.bottomSheet.classList.toggle('expanded', this.isSheetExpanded);
        }
        if (this.ctrlBar) {
            this.ctrlBar.classList.toggle('sheet-expanded', this.isSheetExpanded);
        }
    }

    /**
     * Carga y precarga un conjunto de 24 fotogramas
     * @param {string[]} framesArray - Array de DataURLs o URLs de los 24 frames
     */
    async loadFrames(framesArray) {
        if (!framesArray || !Array.isArray(framesArray) || framesArray.length === 0) {
            this.loadingOverlay.style.display = 'flex';
            this.loadingOverlay.querySelector('.macro360-loading-txt').textContent = "No hay datos 360° cargados.";
            this.loadingOverlay.querySelector('i').className = "fa-solid fa-cube";
            this.frames = [];
            this.images = [];
            this.isLoaded = false;
            return;
        }

        this.frames = framesArray;
        this.options.frameCount = framesArray.length;
        if (this.slider) this.slider.max = framesArray.length - 1;

        this.loadingOverlay.style.display = 'flex';
        this.loadingOverlay.querySelector('.macro360-loading-txt').textContent = "Precargando fotogramas 360°...";
        this.loadingOverlay.querySelector('i').className = "fa-solid fa-arrows-spin fa-spin";

        // Precargar imágenes en paralelo
        const loadPromises = framesArray.map((src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = src;
            });
        });

        this.images = await Promise.all(loadPromises);
        this.isLoaded = true;
        this.loadingOverlay.style.display = 'none';

        this.setAngle(0);
        this._startRenderLoop();
    }

    setAngle(angleDeg) {
        let norm = ((angleDeg % 360) + 360) % 360;
        this.currentAngle = norm;

        const count = this.options.frameCount || 24;
        const degPerFrame = 360 / count;

        const frameIdx = Math.floor((norm + (degPerFrame / 2)) / degPerFrame) % count;
        this.currentFrame = frameIdx;

        this._updateHUD();
        this._render();

        if (typeof this.options.onAngleChange === 'function') {
            this.options.onAngleChange(this.currentAngle, this.currentFrame);
        }
    }

    _updateHUD() {
        const roundedDeg = Math.round(this.currentAngle);
        if (this.angleTxt) this.angleTxt.textContent = `${roundedDeg}°`;
        if (this.slider && document.activeElement !== this.slider) {
            this.slider.value = this.currentFrame;
        }

        // Actualización de Cara Anatómica según Boceto 2
        // Anterior (315° - 45°), Lateral Derecho (45° - 135°), Posterior (135° - 225°), Lateral Izquierdo (225° - 315°)
        let cara = 'Cara Anterior';
        if (roundedDeg >= 45 && roundedDeg < 135) {
            cara = 'Cara Lateral Derecho';
        } else if (roundedDeg >= 135 && roundedDeg < 225) {
            cara = 'Cara Posterior';
        } else if (roundedDeg >= 225 && roundedDeg < 315) {
            cara = 'Cara Lateral Izquierdo';
        } else {
            cara = 'Cara Anterior';
        }

        if (this.orientTxt) this.orientTxt.textContent = cara;
    }

    _render() {
        if (!this.isLoaded || !this.images[this.currentFrame]) return;

        const rect = this.canvas.getBoundingClientRect();
        const w = rect.width || 800;
        const h = rect.height || 500;
        const img = this.images[this.currentFrame];

        this.ctx.save();
        this.ctx.clearRect(0, 0, w, h);

        // Fondo de estudio fotográfico macroscópico con viñeta radial suave
        const bgGrad = this.ctx.createRadialGradient(w/2, h/2, 40, w/2, h/2, Math.max(w, h));
        bgGrad.addColorStop(0, '#0d1829');
        bgGrad.addColorStop(1, '#020617');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, w, h);

        // Transformaciones: Zoom y Paneo
        this.ctx.translate(w / 2 + this.panX, h / 2 + this.panY);
        this.ctx.scale(this.scale, this.scale);

        // Renderizado proporcional de la pieza macroscópica
        const imgW = img.naturalWidth || 800;
        const imgH = img.naturalHeight || 800;
        const scaleFit = Math.min((w * 0.90) / imgW, (h * 0.90) / imgH);
        const dw = imgW * scaleFit;
        const dh = imgH * scaleFit;

        this.ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        this.ctx.restore();
    }

    _startRenderLoop() {
        if (this.rafId) cancelAnimationFrame(this.rafId);

        const loop = () => {
            let needsContinue = false;

            // 1. Inercia cinemática con 1 dedo
            if (!this.isDragging && !this.isPinching && Math.abs(this.velocity) > this.options.minInertiaVelocity) {
                this.setAngle(this.currentAngle + this.velocity);
                this.velocity *= this.options.inertiaFriction;
                needsContinue = true;
            } else if (!this.isDragging && !this.isPinching && Math.abs(this.velocity) <= this.options.minInertiaVelocity) {
                this.velocity = 0;
            }

            // 2. Giro automático (Auto-Spin)
            if (this.isAutoSpinning && !this.isDragging && !this.isPinching) {
                this.setAngle(this.currentAngle + this.options.autoSpinSpeed);
                needsContinue = true;
            }

            if (this.isDragging || this.isPinching || needsContinue) {
                this.rafId = requestAnimationFrame(loop);
            } else {
                this.rafId = null;
            }
        };

        this.rafId = requestAnimationFrame(loop);
    }

    _bindEvents() {
        this._handlers = {
            resize: () => {
                this._resizeCanvas();
                this._render();
            },
            keydown: (e) => {
                const tab360 = document.getElementById('tab_macro360');
                const isTabActive = !tab360 || tab360.classList.contains('active') || tab360.style.display !== 'none';
                if (!isTabActive) return;
                if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase()) || document.activeElement?.isContentEditable) return;

                const degStep = 360 / (this.options.frameCount || 24);
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                    e.preventDefault();
                    this.setAngle(this.currentAngle - degStep);
                } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                    e.preventDefault();
                    this.setAngle(this.currentAngle + degStep);
                } else if (e.key === ' ') {
                    e.preventDefault();
                    this.toggleAutoSpin();
                } else if (e.key === 'Escape') {
                    if (this.isSheetExpanded) {
                        this.toggleBottomSheet(false);
                    }
                }
            }
        };

        window.addEventListener('resize', this._handlers.resize);
        window.addEventListener('keydown', this._handlers.keydown);

        // ====================================================================
        // FÍSICA TÁCTIL MÓVIL: ROTACIÓN 1 DEDO & PINCH-TO-ZOOM 2 DEDOS
        // ====================================================================
        const canvas = this.canvas;

        // Pointer Events para ratón y soporte base táctil
        canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') return; // Delegamos toques a Touch Events nativos para fluidez máxima
            canvas.setPointerCapture(e.pointerId);
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.lastPointerX = e.clientX;
            this.lastPointerTime = performance.now();
            this.velocity = 0;
            if (!this.rafId) this._startRenderLoop();
        });

        canvas.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch' || !this.isDragging) return;
            const now = performance.now();
            const dt = Math.max(1, now - this.lastPointerTime);
            const dx = e.clientX - this.lastPointerX;
            const rect = canvas.getBoundingClientRect();
            const viewerW = rect.width || 800;
            const degDelta = -(dx / viewerW) * 360;

            const instantVel = (degDelta / dt) * 16.67;
            this.velocity = 0.7 * instantVel + 0.3 * this.velocity;
            this.setAngle(this.currentAngle + degDelta);

            this.lastPointerX = e.clientX;
            this.lastPointerTime = now;
        });

        const endPointerDrag = (e) => {
            if (e.pointerType === 'touch' || !this.isDragging) return;
            this.isDragging = false;
            try { canvas.releasePointerCapture(e.pointerId); } catch(err){}
            if (!this.rafId && (Math.abs(this.velocity) > this.options.minInertiaVelocity || this.isAutoSpinning)) {
                this._startRenderLoop();
            }
        };
        canvas.addEventListener('pointerup', endPointerDrag);
        canvas.addEventListener('pointercancel', endPointerDrag);

        // ====================================================================
        // TOUCH EVENTS NATIVOS (SMARTPHONES) - MÁXIMO RENDIMIENTO 60 FPS
        // ====================================================================
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Evitar scroll de la página

            if (e.touches.length === 1) {
                // 1 DEDO: Inicio de rotación con inercia
                this.isPinching = false;
                this.isDragging = true;
                const t = e.touches[0];
                this.dragStartX = t.clientX;
                this.lastPointerX = t.clientX;
                this.lastPointerTime = performance.now();
                this.velocity = 0;
                if (!this.rafId) this._startRenderLoop();
            } else if (e.touches.length === 2) {
                // 2 DEDOS: Inicio de Pinch-to-zoom
                this.isDragging = false;
                this.velocity = 0;
                this.isPinching = true;

                const t1 = e.touches[0];
                const t2 = e.touches[1];
                const rect = canvas.getBoundingClientRect();

                this.pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY) || 1;
                this.pinchStartScale = this.scale;
                this.pinchStartFocalX = ((t1.clientX + t2.clientX) / 2) - rect.left;
                this.pinchStartFocalY = ((t1.clientY + t2.clientY) / 2) - rect.top;
                this.pinchStartPanX = this.panX;
                this.pinchStartPanY = this.panY;
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();

            if (e.touches.length === 1 && this.isDragging && !this.isPinching) {
                // 1 DEDO: Rotación táctil fluida con velocidad cinemática
                const t = e.touches[0];
                const now = performance.now();
                const dt = Math.max(1, now - this.lastPointerTime);
                const dx = t.clientX - this.lastPointerX;
                const rect = canvas.getBoundingClientRect();
                const viewerW = rect.width || 800;
                const degDelta = -(dx / viewerW) * 360;

                const instantVel = (degDelta / dt) * 16.67;
                this.velocity = 0.7 * instantVel + 0.3 * this.velocity;
                this.setAngle(this.currentAngle + degDelta);

                this.lastPointerX = t.clientX;
                this.lastPointerTime = now;

            } else if (e.touches.length === 2 && this.isPinching) {
                // 2 DEDOS: Pinch-to-zoom centrado en el punto focal interdigital (1.0x - 4.0x)
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                const rect = canvas.getBoundingClientRect();
                const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                const currentFocalX = ((t1.clientX + t2.clientX) / 2) - rect.left;
                const currentFocalY = ((t1.clientY + t2.clientY) / 2) - rect.top;

                const scaleFactor = currentDist / this.pinchStartDist;
                const targetScale = Math.max(this.options.zoomMin, Math.min(this.options.zoomMax, this.pinchStartScale * scaleFactor));

                const cx = rect.width / 2;
                const cy = rect.height / 2;

                // Mantener inmóvil el punto anatómico bajo los dedos
                const px = (this.pinchStartFocalX - cx - this.pinchStartPanX) / this.pinchStartScale;
                const py = (this.pinchStartFocalY - cy - this.pinchStartPanY) / this.pinchStartScale;

                let newPanX = (currentFocalX - cx) - (px * targetScale);
                let newPanY = (currentFocalY - cy) - (py * targetScale);

                // Si regresa al tamaño base, restablecer el centro
                if (targetScale <= 1.05) {
                    newPanX = 0;
                    newPanY = 0;
                } else {
                    // Limitar paneo para evitar perder la imagen fuera de la pantalla
                    const maxPanX = (targetScale - 1) * (rect.width / 2) + 40;
                    const maxPanY = (targetScale - 1) * (rect.height / 2) + 40;
                    newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
                    newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));
                }

                this.scale = targetScale;
                this.panX = newPanX;
                this.panY = newPanY;
                this._render();
            }
        }, { passive: false });

        const endTouch = (e) => {
            if (e.touches.length === 0) {
                this.isDragging = false;
                this.isPinching = false;
                if (!this.rafId && (Math.abs(this.velocity) > this.options.minInertiaVelocity || this.isAutoSpinning)) {
                    this._startRenderLoop();
                }
            } else if (e.touches.length === 1) {
                // Transición suave de 2 dedos a 1 dedo sin salto brusco
                this.isPinching = false;
                this.isDragging = true;
                const t = e.touches[0];
                this.lastPointerX = t.clientX;
                this.lastPointerTime = performance.now();
                this.velocity = 0;
            }
        };

        canvas.addEventListener('touchend', endTouch);
        canvas.addEventListener('touchcancel', endTouch);

        // Zoom con Rueda del Ratón
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2;
            this.setScale(this.scale + zoomDelta);
        }, { passive: false });

        // ====================================================================
        // GESTIÓN DEL BOTTOM SHEET (DESLIZAMIENTO TÁCTIL Y CLICKS)
        // ====================================================================
        if (this.sheetHeader) {
            let sheetStartY = 0;
            let sheetCurrentY = 0;
            let isDraggingSheet = false;

            this.sheetHeader.addEventListener('touchstart', (e) => {
                sheetStartY = e.touches[0].clientY;
                sheetCurrentY = sheetStartY;
                isDraggingSheet = true;
            }, { passive: true });

            this.sheetHeader.addEventListener('touchmove', (e) => {
                if (!isDraggingSheet) return;
                sheetCurrentY = e.touches[0].clientY;
            }, { passive: true });

            this.sheetHeader.addEventListener('touchend', () => {
                if (!isDraggingSheet) return;
                isDraggingSheet = false;
                const deltaY = sheetCurrentY - sheetStartY;
                if (deltaY < -35) {
                    // Deslizó hacia arriba -> Expandir
                    this.toggleBottomSheet(true);
                } else if (deltaY > 35) {
                    // Deslizó hacia abajo -> Colapsar
                    this.toggleBottomSheet(false);
                }
            });

            this.sheetHeader.addEventListener('click', () => {
                this.toggleBottomSheet();
            });
        }

        // ====================================================================
        // BOTONES DE CONTROL FLOTANTE
        // ====================================================================
        this.container.querySelectorAll('.macro360-btn-ctrl').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action === 'toggle-spin') this.toggleAutoSpin();
                else if (action === 'fullscreen') this.toggleFullscreen();
                else if (action === 'reset') this.resetView();
            });
        });

        // Slider de Fotogramas
        if (this.slider) {
            this.slider.addEventListener('input', (e) => {
                const frameIdx = parseInt(e.target.value, 10);
                const degPerFrame = 360 / (this.options.frameCount || 24);
                this.velocity = 0;
                this.setAngle(frameIdx * degPerFrame);
            });
        }
    }

    setScale(newScale) {
        this.scale = Math.max(this.options.zoomMin, Math.min(this.options.zoomMax, newScale));
        if (this.scale <= 1.05) {
            this.panX = 0;
            this.panY = 0;
        }
        this._render();
    }

    resetView() {
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.velocity = 0;
        if (this.isAutoSpinning) this.toggleAutoSpin();
        this.setAngle(0);
    }

    toggleAutoSpin() {
        this.isAutoSpinning = !this.isAutoSpinning;
        if (this.btnToggleSpin) {
            this.btnToggleSpin.innerHTML = this.isAutoSpinning ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
            this.btnToggleSpin.classList.toggle('btn-spin-active', this.isAutoSpinning);
        }
        if (this.isAutoSpinning && !this.rafId) {
            this._startRenderLoop();
        }
    }

    toggleFullscreen() {
        const stage = this.stage || this.container;
        const isDocFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

        if (!isDocFullscreen && !stage.classList.contains('macro360-fullscreen-overlay')) {
            // Intentar Fullscreen API nativa
            if (stage.requestFullscreen) {
                stage.requestFullscreen().catch(() => this._toggleCssFullscreen());
            } else if (stage.webkitRequestFullscreen) {
                stage.webkitRequestFullscreen();
            } else {
                this._toggleCssFullscreen();
            }

            // Intentar bloqueo en modo apaisado (Landscape)
            try {
                if (screen.orientation && typeof screen.orientation.lock === 'function') {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            } catch (err) {}

            if (this.btnFullscreen) {
                this.btnFullscreen.innerHTML = '<i class="fa-solid fa-compress"></i>';
                this.btnFullscreen.title = "Salir de Pantalla Completa";
            }

        } else {
            // Salir de pantalla completa
            if (document.exitFullscreen && isDocFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen && isDocFullscreen) {
                document.webkitExitFullscreen();
            }
            this._toggleCssFullscreen(false);

            try {
                if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                    screen.orientation.unlock();
                }
            } catch (err) {}

            if (this.btnFullscreen) {
                this.btnFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i>';
                this.btnFullscreen.title = "Pantalla Completa / Paisaje";
            }
        }

        setTimeout(() => {
            this._resizeCanvas();
            this._render();
        }, 150);
    }

    _toggleCssFullscreen(force) {
        const stage = this.stage || this.container;
        const shouldActive = typeof force === 'boolean' ? force : !stage.classList.contains('macro360-fullscreen-overlay');
        stage.classList.toggle('macro360-fullscreen-overlay', shouldActive);
        this._resizeCanvas();
        this._render();
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        if (this._handlers) {
            window.removeEventListener('resize', this._handlers.resize);
            window.removeEventListener('keydown', this._handlers.keydown);
            this._handlers = null;
        }
        this.isLoaded = false;
        this.frames = [];
        this.images = [];
    }

    // ========================================================================
    // MODAL STANDALONE INDEPENDIENTE
    // ========================================================================

    /**
     * Abre un modal independiente y optimizado para smartphones con el Visor 360° (Boceto 2).
     * @param {Object} options
     * @param {string[]} options.frames - Array de fotogramas WebP/Base64
     * @param {Object} [options.patient] - Datos clínicos del paciente
     * @param {Object} [options.macroData] - Datos macroscópicos estructurados
     * @param {number} [options.initialAngle=0]
     */
    static openModal(options = {}) {
        const { frames = [], patient = {}, macroData = null, initialAngle = 0 } = options;

        // Limpiar modal previo si existe
        const existing = document.getElementById('macro360-standalone-modal-overlay');
        if (existing) existing.remove();

        const modalDiv = document.createElement('div');
        modalDiv.id = 'macro360-standalone-modal-overlay';
        modalDiv.className = 'macro360-standalone-modal';
        modalDiv.innerHTML = `
            <button type="button" class="macro360-modal-close-btn" title="Cerrar Visor 360°">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="macro360-modal-mount" style="width: 100%; height: 100%; position: relative;"></div>
        `;

        document.body.appendChild(modalDiv);

        const mount = modalDiv.querySelector('.macro360-modal-mount');
        const closeBtn = modalDiv.querySelector('.macro360-modal-close-btn');

        const viewer = new Macro360Viewer(mount, {
            macroData: macroData || patient
        });

        const close = () => {
            viewer.destroy();
            modalDiv.remove();
        };

        closeBtn.addEventListener('click', close);

        // Cargar fotogramas
        if (Array.isArray(frames) && frames.length > 0) {
            viewer.loadFrames(frames).then(() => {
                if (initialAngle) viewer.setAngle(initialAngle);
            });
        } else if (patient && Array.isArray(patient.macro360) && patient.macro360.length > 0) {
            viewer.loadFrames(patient.macro360).then(() => {
                if (initialAngle) viewer.setAngle(initialAngle);
            });
        } else {
            viewer.loadFrames([]);
        }

        return {
            viewer,
            close
        };
    }
}

// Exportar al objeto global de window para acceso desde cualquier script
if (typeof window !== 'undefined') {
    window.extract24FramesFromVideo = extract24FramesFromVideo;
    window.parseMacroscopicDetails = parseMacroscopicDetails;
    window.Macro360Viewer = Macro360Viewer;
}
