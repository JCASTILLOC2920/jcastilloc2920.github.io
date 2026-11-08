/**
 * JC PATH LAB - MACRO & MICRO FOTO INSERTER
 * La Colmena Soberana - Dr. José Castillo
 * Regla Inviolable: La letra amarilla siempre debe ser 'CASO 26Q-[CODIGO]'
 */

(function() {
    'use strict';

    let activeTargetKey = 'img01';

    function notify(msg, type = 'info') {
        if (typeof window.notifyUser === 'function') {
            window.notifyUser(msg, type);
        } else {
            console.log('[MacroMicro ' + type + ']', msg);
        }
    }

    // Normalizador de Código de Caso según Regla Suprema del Dr. Castillo
    window.obtenerCodigoCasoOficial = function() {
        const inputCod = document.getElementById('re_codAtencion');
        let raw = (inputCod && inputCod.value) ? inputCod.value.trim() : '';
        
        let numClean = raw.replace(/^(CASO\s*|26Q[-_\s]*)/gi, '').trim();
        if (!numClean) {
            numClean = 'MUESTRA';
        }
        return 'CASO 26Q-' + numClean;
    };

    /**
     * Pipeline de fallback local con Canvas (si el backend estuviera ocupado)
     */
    async function procesarMacroCanvasFallback(fileOrDataUrl, codigoOficial) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1024;
                const ctx = canvas.getContext('2d');

                // 1. Fondo blanco puro
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, 1024, 1024);

                // 2. Dibujar imagen adaptada a la parte superior (0 a 735)
                const targetW = 1024;
                const targetH = 735;
                ctx.drawImage(img, 0, 0, targetW, targetH);

                // 3. Regla Artesco oficial en la base (735 a 1024)
                const reglaImg = new Image();
                reglaImg.crossOrigin = 'anonymous';
                reglaImg.onload = () => {
                    ctx.drawImage(reglaImg, 0, 735, 1024, 289);
                    dibujarBanner();
                };
                reglaImg.onerror = () => {
                    dibujarReglaVectorial(ctx);
                    dibujarBanner();
                };
                reglaImg.src = 'regla_artesco_oficial.png?v=' + Date.now();

                function dibujarReglaVectorial(c) {
                    c.fillStyle = '#f8fafc';
                    c.fillRect(0, 740, 1024, 284);
                    c.strokeStyle = '#0f172a';
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(50, 850);
                    c.lineTo(974, 850);
                    c.stroke();
                    c.fillStyle = '#0f172a';
                    c.font = 'bold 22px Arial';
                    for (let cm = 0; cm <= 15; cm++) {
                        const x = 60 + cm * 60;
                        c.beginPath();
                        c.moveTo(x, 830);
                        c.lineTo(x, 870);
                        c.stroke();
                        c.fillText(cm.toString(), x - 6, 900);
                    }
                    c.font = 'bold 24px Arial';
                    c.fillText('ARTESCO - CM', 460, 950);
                }

                function dibujarBanner() {
                    const bx = 14;
                    const by = 668;
                    const bw = 345;
                    const bh = 62;

                    ctx.fillStyle = '#ffea00';
                    ctx.fillRect(bx, by, bw, bh);

                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(bx, by, bw, bh);

                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 36px Arial, Helvetica, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(codigoOficial, bx + bw / 2, by + bh / 2);

                    resolve(canvas.toDataURL('image/jpeg', 0.96));
                }
            };
            img.onerror = (e) => reject(e);

            if (typeof fileOrDataUrl === 'string') {
                img.src = fileOrDataUrl;
            } else {
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.readAsDataURL(fileOrDataUrl);
            }
        });
    }

    async function procesarFotoMacroscopica(file, codigoOficial) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;
                try {
                    const response = await fetch('http://127.0.0.1:8000/api/procesar_macro_editorial', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image_base64: base64Data,
                            codigo_caso: codigoOficial
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.status === 'ok' && data.image_base64) {
                            return resolve(data.image_base64);
                        }
                    }
                } catch (netErr) {
                    console.warn('[Macro Colmena API] Conmutando a motor Canvas local:', netErr);
                }

                const fallbackResult = await procesarMacroCanvasFallback(base64Data, codigoOficial);
                resolve(fallbackResult);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * ACCION 1: INSERTAR FOTO MACROSCOPICA
     */
    window.triggerInsertarMacro = function(targetKey = 'img01') {
        activeTargetKey = targetKey;
        const codigoOficial = window.obtenerCodigoCasoOficial();

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if (!file) return;

            notify('📸 La Colmena: Procesando Macroscopía Grado Editorial (' + codigoOficial + ')...', 'info');

            try {
                const imagenFinalBase64 = await procesarFotoMacroscopica(file, codigoOficial);
                
                if (typeof window.setupMiniCropper === 'function') {
                    window.setupMiniCropper(targetKey, imagenFinalBase64);
                    notify('✅ Foto Macroscópica con Regla montada: ' + codigoOficial, 'success');
                } else {
                    notify('✅ Foto procesada: ' + codigoOficial, 'success');
                }
            } catch (err) {
                console.error('[Macro Error]', err);
                notify('Error al procesar la foto macroscópica: ' + err.message, 'error');
            }
        };

        document.body.appendChild(fileInput);
        fileInput.click();
        setTimeout(() => { if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput); }, 1000);
    };

    /**
     * ACCION 2: INSERTAR FOTO MICROSCOPICA
     */
    window.triggerInsertarMicro = function(targetKey = 'img01') {
        activeTargetKey = targetKey;
        mostrarModalSelectorMicro(targetKey);
    };

    function mostrarModalSelectorMicro(targetKey) {
        let modal = document.getElementById('modalSelectorMicroscopia');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalSelectorMicroscopia';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2100000; animation: fadeIn 0.15s ease-out;';
            modal.innerHTML = `
                <div style="background: #0f172a; border: 1px solid #38bdf8; border-radius: 12px; width: 92%; max-width: 480px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); color: #f8fafc; font-family: system-ui, sans-serif;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
                        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-microscope"></i> Insertar Foto Microscópica
                        </h3>
                        <button type="button" id="closeModalSelectorMicro" style="background: transparent; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; padding: 4px 8px;">&times;</button>
                    </div>
                    <p style="margin: 0 0 16px 0; font-size: 0.88rem; color: #cbd5e1;">Seleccione el origen de la microfotografía histopatológica:</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button type="button" id="btnOptMicroEnVivo" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #fff; border: 1px solid #38bdf8; border-radius: 8px; padding: 12px 16px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: left; box-shadow: 0 2px 8px rgba(2,132,199,0.3);">
                            <i class="fa-solid fa-video" style="font-size: 1.25rem; color: #bae6fd;"></i>
                            <div>
                                <div>Capturar en Vivo desde Microscopio Digital</div>
                                <div style="font-size: 0.75rem; font-weight: 400; color: #e0f2fe;">Cámara Motic / HUD Digital en tiempo real</div>
                            </div>
                        </button>
                        
                        <button type="button" id="btnOptMicroArchivo" style="background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 8px; padding: 12px 16px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: left;">
                            <i class="fa-solid fa-folder-open" style="font-size: 1.25rem; color: #38bdf8;"></i>
                            <div>
                                <div>Cargar Archivo de Imagen (PC)</div>
                                <div style="font-size: 0.75rem; font-weight: 400; color: #94a3b8;">Formatos JPG, PNG, TIFF de microfotografía H&E</div>
                            </div>
                        </button>

                        <button type="button" id="btnOptMicroQr" style="background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 8px; padding: 12px 16px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: left;">
                            <i class="fa-solid fa-qrcode" style="font-size: 1.25rem; color: #facc15;"></i>
                            <div>
                                <div>Enviar Microfotografía desde Celular (QR)</div>
                                <div style="font-size: 0.75rem; font-weight: 400; color: #94a3b8;">Escanea con tu teléfono y sube directo</div>
                            </div>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('closeModalSelectorMicro').onclick = () => {
                modal.style.display = 'none';
            };
            modal.onclick = (e) => {
                if (e.target === modal) modal.style.display = 'none';
            };
        }

        modal.style.display = 'flex';

        document.getElementById('btnOptMicroEnVivo').onclick = () => {
            modal.style.display = 'none';
            if (typeof window.openMicroscopeCameraModal === 'function') {
                window.openMicroscopeCameraModal(targetKey);
            } else {
                notify('El visor de microscopio en vivo no está listo.', 'warning');
            }
        };

        document.getElementById('btnOptMicroArchivo').onclick = () => {
            modal.style.display = 'none';
            const inputId = targetKey === 'img02' ? 're_img02Input' : 're_img01Input';
            const el = document.getElementById(inputId);
            if (el) el.click();
        };

        document.getElementById('btnOptMicroQr').onclick = () => {
            modal.style.display = 'none';
            if (typeof window.openQrConnectModal === 'function') {
                window.openQrConnectModal('micro', targetKey);
            }
        };
    }

    console.log('[MacroMicro Inserter] Cargado correctamente.');
})();
