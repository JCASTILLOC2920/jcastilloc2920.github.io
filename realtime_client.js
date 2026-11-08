/**
 * realtime_client.js - Sincronizador Soberano en Tiempo Real para Clínicas
 * JC PATH LAB - Director General: Dr. José Castillo
 * Latencia <1s vía Server-Sent Events (SSE) + BroadcastChannel + Polling anticaché cada 10s.
 */
(function() {
    const CHANNEL_NAME = 'jcpathlab_realtime_reports';
    const SYNC_PORT = 8766;
    let bc = null;
    let sseSource = null;
    let lastKnownHash = null;

    try {
        if (typeof BroadcastChannel !== 'undefined') {
            bc = new BroadcastChannel(CHANNEL_NAME);
        }
    } catch(e) {
        console.warn('[Realtime] BroadcastChannel no disponible.');
    }

    // Componente visual de notificación flotante no intrusiva
    function mostrarBannerNotificacionClinica(data) {
        if (!data || !data.codigo) return;
        let banner = document.getElementById('jcpathlab-live-notification-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'jcpathlab-live-notification-banner';
            banner.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 999999;
                background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
                border: 1px solid #10B981;
                border-left: 5px solid #10B981;
                color: #F8FAFC;
                padding: 14px 20px;
                border-radius: 8px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.3);
                font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                font-size: 13px;
                max-width: 380px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
                transform: translateX(120%);
                opacity: 0;
            `;
            document.body.appendChild(banner);
        }

        const icono = data.firmado ? '✨' : '📝';
        const estadoTexto = data.firmado ? 'FIRMADO / LISTO PARA ENTREGA' : (data.estado || 'Actualizado');
        banner.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:#38BDF8; font-family:'JetBrains Mono', monospace;">${data.codigo}</span>
                <span style="font-size:11px; font-weight:700; color:#10B981; text-transform:uppercase;">${icono} ${estadoTexto}</span>
            </div>
            <div style="font-size:13px; font-weight:600; color:#FFFFFF;">${data.paciente || 'Paciente Registrado'}</div>
            <div style="font-size:11px; color:#94A3B8;">${data.clinica || 'JC PATH LAB'} • Actualizado en vivo (< 3s)</div>
        `;

        // Mostrar con animación
        banner.style.transform = 'translateX(0)';
        banner.style.opacity = '1';

        // Auto-ocultar tras 7 segundos
        setTimeout(() => {
            if (banner) {
                banner.style.transform = 'translateX(120%)';
                banner.style.opacity = '0';
            }
        }, 7000);
    }

    window.RealtimeClient = {
        init: function(onRefreshCallback) {
            console.log("[Realtime Client] Iniciando enlace de publicación instantánea con JC PATH LAB...");

            // 1. Canal entre pestañas locales (<1ms)
            if (bc) {
                bc.onmessage = function(ev) {
                    if (ev && ev.data && ev.data.action === 'refresh_reports') {
                        mostrarBannerNotificacionClinica(ev.data.payload);
                        if (typeof onRefreshCallback === 'function') onRefreshCallback(ev.data);
                    }
                };
            }

            // 2. Storage event fallback
            window.addEventListener('storage', function(ev) {
                if (ev.key === 'jcpathlab_realtime_ping') {
                    try {
                        const payload = JSON.parse(ev.newValue);
                        mostrarBannerNotificacionClinica(payload);
                    } catch(e) {}
                    if (typeof onRefreshCallback === 'function') onRefreshCallback();
                }
            });

            // 3. Conexión SSE Server-Sent Events (sincronizador_tiempo_real_clinicas.py)
            const syncHost = window.location.hostname || 'localhost';
            const sseUrl = `http://${syncHost}:${SYNC_PORT}/api/stream`;

            function conectarSSE() {
                try {
                    sseSource = new EventSource(sseUrl);
                    sseSource.onmessage = function(e) {
                        try {
                            const data = JSON.parse(e.data);
                            if (data.tipo === 'INFORME_ACTUALIZADO') {
                                console.log('[Realtime SSE] Notificación instantánea recibida:', data.codigo);
                                mostrarBannerNotificacionClinica(data);
                                if (typeof onRefreshCallback === 'function') onRefreshCallback(data);
                            }
                        } catch(err) {}
                    };
                    sseSource.onerror = function() {
                        if (sseSource) sseSource.close();
                        setTimeout(conectarSSE, 8000); // Reintento suave
                    };
                } catch(e) {}
            }
            conectarSSE();

            // 4. Polling anticaché ultra-ligero cada 10 segundos contra real_supabase_backup.js
            setInterval(() => {
                const ts = Date.now();
                fetch(`real_supabase_backup.js?t=${ts}`, { method: 'HEAD', cache: 'no-store' })
                    .then(res => {
                        const etag = res.headers.get('ETag') || res.headers.get('Last-Modified');
                        if (etag && lastKnownHash && etag !== lastKnownHash) {
                            console.log('[Realtime Polling] Novedades detectadas en disco, refrescando vista.');
                            if (typeof onRefreshCallback === 'function') onRefreshCallback();
                        }
                        if (etag) lastKnownHash = etag;
                    })
                    .catch(() => {});
            }, 10000);
        },

        notifyDoctorSave: function(payload, successCallback) {
            // Emisión instantánea a todas las pestañas de clínicas
            if (bc) {
                bc.postMessage({ action: 'refresh_reports', payload: payload, timestamp: Date.now() });
            }
            try {
                localStorage.setItem('jcpathlab_realtime_ping', JSON.stringify(payload || {}));
            } catch(e) {}

            // Despacho asíncrono al micro-servidor de tiempo real (puerto 8766)
            const syncHost = window.location.hostname || 'localhost';
            fetch(`http://${syncHost}:${SYNC_PORT}/api/guardar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (typeof successCallback === 'function') successCallback(data);
            })
            .catch(() => {
                // Fallback a n8n
                fetch('http://localhost:5678/webhook/guardar-reporte', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).finally(() => {
                    if (typeof successCallback === 'function') successCallback({ offline: true });
                });
            });
        }
    };

    // Auto-arranque al cargar el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.RealtimeClient.init());
    } else {
        window.RealtimeClient.init();
    }
})();
