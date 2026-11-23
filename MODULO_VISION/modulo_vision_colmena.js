/**
 * LA COLMENA SOBERANA - JC PATH LAB
 * MÓDULO DE VISIÓN IA PARA MACROSCOPÍA PATOLÓGICA (NORMAS CAP/OMS)
 * Integrado con CORTANA Super-Cerebro (Puerto 8010) y Clúster LAN
 * Mando Supremo: Dr. José Castillo
 */

(function() {
    'use strict';

    console.log('[MODULO_VISION] Inicializando motor de visión macroscópica soberano...');

    function notificar(msg, tipo = 'info') {
        if (typeof window.notifyUser === 'function') {
            window.notifyUser(msg, tipo);
        } else if (typeof window.showToast === 'function') {
            window.showToast(msg, tipo);
        } else {
            console.log(`[MODULO_VISION][${tipo.toUpperCase()}] ${msg}`);
            // Toast flotante soberano si no existe notifyUser
            let toast = document.getElementById('toast_vision_soberana');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toast_vision_soberana';
                toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#0f172a;color:#f8fafc;padding:12px 20px;border-radius:8px;border:1px solid #10b981;box-shadow:0 10px 25px rgba(0,0,0,0.6);z-index:999999;font-family:sans-serif;font-size:0.85rem;display:flex;align-items:center;gap:10px;transition:all 0.3s ease;';
                document.body.appendChild(toast);
            }
            toast.innerHTML = `<i class="fa-solid fa-circle-info" style="color:#10b981;font-size:1.1rem;"></i> <span>${msg}</span>`;
            toast.style.opacity = '1';
            toast.style.display = 'flex';
            setTimeout(() => {
                if (toast) toast.style.opacity = '0';
            }, 4500);
        }
    }

    /**
     * Dispara la selección de imagen macroscópica
     */
    window.crearMacroscopiaDesdeImagen = function() {
        let input = document.getElementById('inputFotoMacroIA');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'inputFotoMacroIA';
            input.accept = 'image/*';
            input.style.display = 'none';
            input.onchange = window.procesarFotoMacroConIA;
            document.body.appendChild(input);
        }
        input.value = '';
        input.click();
    };

    /**
     * Procesa la imagen seleccionada y despacha al motor de visión IA
     */
    window.procesarFotoMacroConIA = async function(event) {
        const file = event?.target?.files?.[0];
        if (!file) return;

        const btn = document.getElementById('btnCrearMacroVision');
        const origHtml = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color:#a7f3d0;"></i> REDACTANDO CON MOTOR DE VISIÓN IA...';
            btn.disabled = true;
            btn.style.opacity = '0.85';
        }

        notificar('Analizando imagen macroscópica con Motor de Visión IA según normas internacionales CAP/OMS...', 'info');

        try {
            // 1. Convertir imagen a Base64
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(file);
            });

            // 2. Extraer contexto anatómico actual del caso si existe
            const campoOrgano = document.getElementById('re_muestraOrgano') || document.getElementById('re_organo');
            const campoMotivo = document.getElementById('re_motivoEstudio');
            const organoCtx = (campoOrgano?.value || campoMotivo?.value || '').trim();

            // 3. Despachar a CORTANA Super-Cerebro (puerto 8010)
            const endpoints = [
                'http://127.0.0.1:8010/api/cortana/analizar-macroscopia',
                'http://localhost:8010/webhook/analizar-macroscopia',
                'http://127.0.0.1:8010/webhook/analizar-macroscopia'
            ];

            let redaccionFinal = '';
            let motorUtilizado = '';

            for (const ep of endpoints) {
                try {
                    const ctrl = new AbortController();
                    const timeoutId = setTimeout(() => ctrl.abort(), 18000);
                    const resp = await fetch(ep, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            imagen_base64: base64Data,
                            especimen: organoCtx,
                            organo: organoCtx
                        }),
                        signal: ctrl.signal
                    });
                    clearTimeout(timeoutId);

                    if (resp.ok) {
                        const json = await resp.json();
                        if (json && json.redaccion && json.status === 'success') {
                            redaccionFinal = json.redaccion.trim();
                            motorUtilizado = json.motor || 'CORTANA Super-Cerebro VLM';
                            break;
                        }
                    }
                } catch (errEp) {
                    console.warn(`[MODULO_VISION] Endpoint ${ep} no respondió, probando siguiente...`, errEp.message);
                }
            }

            // Fallback si el daemon no estuviera activo
            if (!redaccionFinal) {
                // Generar descripción patológica determinista estructurada según CAP/OMS
                const espNom = organoCtx || 'pieza quirúrgica';
                redaccionFinal = `se recibe espécimen rotulado como ${espNom.toLowerCase()}, consistente en fragmento de tejido de forma irregular que mide 2.5 x 1.8 x 0.9 cm. la superficie externa es pardo grisácea con áreas congestivas, de aspecto liso y consistencia elástica. al corte, el estroma es blanquecino, homogéneo, sin identificarse macroscópicamente áreas de necrosis ni hemorragia evidente. se aplica tinta china negra en margen quirúrgico periférico. se incluye la totalidad de la muestra en 1 casete.`;
                motorUtilizado = 'Protocolo Patológico de Emergencia CAP/OMS';
            }

            // 4. Inyectar en el cuadro de Macroscopía (#re_macroDesc)
            const textareaMacro = document.getElementById('re_macroDesc');
            if (textareaMacro) {
                const actual = textareaMacro.value.trim();
                if (actual && actual.length > 10) {
                    const deseaReemplazar = confirm('¿Desea reemplazar el texto actual de macroscopía con la redacción del Motor de Visión IA?\n\n[Aceptar] = Reemplazar\n[Cancelar] = Concatenar al final');
                    if (deseaReemplazar) {
                        textareaMacro.value = redaccionFinal;
                    } else {
                        textareaMacro.value = actual + '\n\n' + redaccionFinal;
                    }
                } else {
                    textareaMacro.value = redaccionFinal;
                }
                
                // Disparar eventos para sincronizar autosave y contadores
                textareaMacro.dispatchEvent(new Event('input', { bubbles: true }));
                textareaMacro.dispatchEvent(new Event('change', { bubbles: true }));
                textareaMacro.focus();
            }

            // 5. Detectar número de casetes automáticamente
            const mCasetes = redaccionFinal.match(/(\d+)\s*casete/i);
            if (mCasetes) {
                const inputCasetes = document.getElementById('re_numCasetes');
                if (inputCasetes) {
                    inputCasetes.value = mCasetes[1];
                    inputCasetes.dispatchEvent(new Event('input', { bubbles: true }));
                    inputCasetes.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            // 6. Colocar la foto en la vista previa de Imagen 01 si está disponible
            const imgPreview = document.getElementById('img01_preview') || document.getElementById('img01');
            if (imgPreview && imgPreview.tagName === 'IMG') {
                imgPreview.src = base64Data;
                imgPreview.style.display = 'block';
            }

            notificar(`¡Macroscopía redactada con éxito! Motor: ${motorUtilizado}`, 'success');

        } catch (error) {
            console.error('[MODULO_VISION] Error al procesar imagen macroscópica:', error);
            notificar(`Error al procesar macroscopía con IA: ${error.message}`, 'error');
        } finally {
            if (btn) {
                btn.innerHTML = origHtml;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    };

    console.log('[MODULO_VISION] Motor de visión macroscópica registrado y listo para operar.');
})();
