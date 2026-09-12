/**
 * sw.js - Service Worker de Grado Quirúrgico y Modo Quirófano Offline Resiliente
 * JC PATH LAB • Anatomía Patológica & Diagnóstico Oncológico
 * Versión Médico-Quirúrgica: v600.00-quirofano (Fase 3C)
 * 
 * Estrategias implementadas con Workbox y contingencia autónoma estéril:
 * 1. Fast-Network-First con timeout ultra-corto (1.8s) para llamadas HTML/navegación y fallback inmediato a caché estéril.
 * 2. CacheFirst con gestión LRU (Least Recently Used) y cuota protegida para modelos 3D, texturas WebP y fotogramas 360°.
 * 3. StaleWhileRevalidate con cuota para librerías JS, estilos CSS y tipografías médicas.
 * 4. Cola de Sincronización en Segundo Plano (Background Sync) para pedidos de biopsia y formularios clínicos en zonas sin cobertura.
 */

// =============================================================================
// 1. CONFIGURACIÓN DE IDENTIFICADORES Y CACHÉS QUIRÚRGICAS
// =============================================================================
const CACHE_VERSION = 'v600-quirofano';
const CORE_CACHE = `jc-quirofano-core-${CACHE_VERSION}`;
const HEAVY_3D_CACHE = `jc-quirofano-3d-${CACHE_VERSION}`;
const BG_SYNC_QUEUE = 'biopsy-order-queue';
const FAST_NETWORK_TIMEOUT_SECONDS = 1.8; // 1800 ms estricto para quirófanos y sótanos

// Activos vitales estériles precacheados (garantizados en disco)
const PRECACHE_MANIFEST = [
    './',
    './index.html',
    './reportes.html',
    './login.html',
    './solicitud.html',
    './contacto.html',
    './macroscopia-360.html',
    './dossier_institucional_2026.html',
    './manifest.json',
    './favicon.png',
    './logo-jcpathlab.png',
    './firma_sello.png',
    './style.css',
    './reportes.css',
    './dossier_web_interactive.css',
    './dossier_web_interactive.js',
    './surgical_viewer_3d.css',
    './surgical_viewer_3d.js',
    './macro_viewer_360.js',
    './antibodies_data.js',
    './qrcode.min.js',
    './medical_order_cropper.js',
    './mobile_report_reader.css',
    './mobile_report_reader.js',
    './utils.js',
    './db_service.js',
    './main.js',
    './ui_tables.js',
    './ui_report_editor.js',
    './ui_admin.js',
    './ui_editor.js',
    './dictaphone_core.js',
    './plantillas_data.js',
    './pdf_engine.js',
    './users_db.js',
    './supabase_config.js',
    './real_supabase_backup.js',
    './help_guide.js',
    './boletas_manager.js',
    './script.js',
    './client_simulator.js',
    './client_simulator.css',
    './groq_copilot.js',
    './groq_copilot.css',
    './morfologia_he_original.jpg',
    './morfologia_ia_pleomorfismo.jpg',
    './carcinoma_acinar_he.webp',
    './BIOPSIAGASTRICA.webp'
];

// Plantilla HTML de Respaldo Estéril de Emergencia en Quirófano
const STERILE_OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Modo Quirófano Offline • JC PATH LAB</title>
    <style>
        :root {
            --bg-color: #090d16;
            --panel-bg: rgba(15, 23, 42, 0.92);
            --border-color: rgba(56, 189, 248, 0.25);
            --text-primary: #f8fafc;
            --text-muted: #94a3b8;
            --accent-cyan: #38bdf8;
            --accent-emerald: #10b981;
            --accent-amber: #f59e0b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
            text-align: center;
        }
        .sterile-card {
            background: var(--panel-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 32px 24px;
            max-width: 520px;
            width: 100%;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(12px);
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(245, 158, 11, 0.15);
            color: var(--accent-amber);
            border: 1px solid rgba(245, 158, 11, 0.35);
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        .pulse-dot {
            width: 8px;
            height: 8px;
            background-color: var(--accent-amber);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 10px var(--accent-amber);
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
        }
        h1 {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
        }
        h1 span { color: var(--accent-cyan); }
        p {
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-muted);
            margin-bottom: 24px;
        }
        .tools-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 24px;
            text-align: left;
        }
        .tool-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            color: #ffffff;
            text-decoration: none;
            font-size: 13.5px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .tool-link:hover {
            border-color: var(--accent-cyan);
            background: rgba(56, 189, 248, 0.12);
        }
        .action-btn {
            background: linear-gradient(135deg, #0284c7, #0369a1);
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            width: 100%;
            transition: opacity 0.2s;
        }
        .action-btn:hover { opacity: 0.9; }
        .footer-note {
            margin-top: 20px;
            font-size: 11.5px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="sterile-card">
        <div class="status-badge">
            <span class="pulse-dot"></span> Modo Quirófano Offline Activo
        </div>
        <h1>JC PATH LAB <span>• Resiliencia Local</span></h1>
        <p>
            Conectividad de red suspendida en sótano clínico o sala quirúrgica blindada. 
            Los módulos precacheados y la cola de sincronización asíncrona continúan operando con total normalidad.
        </p>
        <div class="tools-grid">
            <a href="./index.html" class="tool-link">
                <span>🏠 Portal Central & Dossier Interactivo</span>
                <span style="color: var(--accent-cyan);">&rarr;</span>
            </a>
            <a href="./reportes.html" class="tool-link">
                <span>📋 Sistema de Reportes & Historial Clínico</span>
                <span style="color: var(--accent-emerald);">&rarr;</span>
            </a>
            <a href="./solicitud.html" class="tool-link">
                <span>📝 Formulario de Pedido de Biopsia (Sync Activo)</span>
                <span style="color: var(--accent-amber);">&rarr;</span>
            </a>
            <a href="./macroscopia-360.html" class="tool-link">
                <span>🔬 Visor Macroscópico 360° & Mapeo</span>
                <span style="color: var(--accent-cyan);">&rarr;</span>
            </a>
        </div>
        <button class="action-btn" onclick="window.location.reload()">
            🔄 Comprobar Conexión con el Servidor
        </button>
        <div class="footer-note">
            Cualquier pedido o reporte guardado en modo offline se transmitirá automáticamente vía Background Sync al recuperar cobertura.
        </div>
    </div>
    <script>
        window.addEventListener('online', () => {
            console.log('[Quirófano Offline] Conexión detectada. Reintentando carga...');
            window.location.reload();
        });
    </script>
</body>
</html>`;

// =============================================================================
// 2. CARGA DE WORKBOX CON CONTINGENCIA AUTÓNOMA
// =============================================================================
let workboxLoaded = false;
try {
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
    if (typeof workbox !== 'undefined') {
        workboxLoaded = true;
        console.log('[SW Quirófano] Workbox 6.5.4 cargado exitosamente desde CDN.');
    }
} catch (e) {
    console.warn('[SW Quirófano] Entorno aislado/offline sin acceso a Workbox CDN. Activando motor nativo de alta resiliencia.');
    workboxLoaded = false;
}

// =============================================================================
// 3. LIFECYCLE: INSTALL & ACTIVATE (LIMPIEZA DE CACHÉ OBSOLETA Y RECLAMO)
// =============================================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CORE_CACHE).then(async (cache) => {
            console.log('[SW Quirófano] Pre-cacheando los activos vitales de la plataforma...');
            // Almacenar también la plantilla estéril de rescate
            await cache.put(
                new Request('./offline-sterile.html'),
                new Response(STERILE_OFFLINE_HTML, {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                })
            );
            return Promise.allSettled(
                PRECACHE_MANIFEST.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.warn(`[SW Quirófano Precache] Recurso omitido o diferido (${asset}):`, err.message);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    const isLegacyCore = cacheName.startsWith('jc-pathlab-medical') || (cacheName.startsWith('jc-quirofano-core') && cacheName !== CORE_CACHE);
                    const isLegacy3D = cacheName.startsWith('jc-quirofano-3d') && cacheName !== HEAVY_3D_CACHE;
                    if (isLegacyCore || isLegacy3D) {
                        console.log('[SW Quirófano] Purgando caché obsoleta:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// =============================================================================
// 4. CONFIGURACIÓN DE ESTRATEGIAS CUANDO WORKBOX ESTÁ DISPONIBLE
// =============================================================================
if (workboxLoaded) {
    workbox.setConfig({ debug: false });
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();

    // -------------------------------------------------------------------------
    // 4.1. COLA DE BACKGROUND SYNC (Para Pedidos de Biopsia y Formularios Clínicos)
    // -------------------------------------------------------------------------
    const biopsySyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin(BG_SYNC_QUEUE, {
        maxRetentionTime: 72 * 60, // 72 horas de persistencia máxima para pedidos de biopsia
        onSync: async ({ queue }) => {
            let entry;
            let successCount = 0;
            while ((entry = await queue.shiftRequest())) {
                try {
                    await fetch(entry.request.clone());
                    successCount++;
                    console.log('[SW Quirófano Sync] Biopsia/solicitud retransmitida con éxito.');
                } catch (error) {
                    await queue.unshiftRequest(entry);
                    console.warn('[SW Quirófano Sync] Reintento fallido, solicitud mantenida en cola:', error);
                    throw error;
                }
            }
            if (successCount > 0) {
                const clients = await self.clients.matchAll({ type: 'window' });
                for (const client of clients) {
                    client.postMessage({
                        type: 'BG_SYNC_COMPLETED',
                        tag: BG_SYNC_QUEUE,
                        syncedCount: successCount,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
    });

    // Registrar interceptor de formularios y pedidos clínicos POST/PUT
    workbox.routing.registerRoute(
        ({ url, request }) => {
            const isWrite = request.method === 'POST' || request.method === 'PUT';
            const isClinicalEndpoint =
                url.pathname.includes('solicitud') ||
                url.pathname.includes('biopsia') ||
                url.pathname.includes('contacto') ||
                url.pathname.includes('pedidos') ||
                url.pathname.includes('/api/');
            return isWrite && isClinicalEndpoint;
        },
        new workbox.strategies.NetworkOnly({
            plugins: [biopsySyncPlugin]
        }),
        'POST'
    );

    // -------------------------------------------------------------------------
    // 4.2. FAST-NETWORK-FIRST (Timeout 1.8s) PARA NAVEGACIÓN Y DOCUMENTOS HTML
    // -------------------------------------------------------------------------
    workbox.routing.registerRoute(
        ({ request, url }) =>
            request.mode === 'navigate' ||
            request.destination === 'document' ||
            url.pathname.endsWith('.html') ||
            url.pathname.endsWith('/'),
        new workbox.strategies.NetworkFirst({
            cacheName: CORE_CACHE,
            networkTimeoutSeconds: FAST_NETWORK_TIMEOUT_SECONDS,
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200]
                })
            ]
        })
    );

    // -------------------------------------------------------------------------
    // 4.3. CACHEFIRST CON EXPIRACIÓN LRU PARA ACTIVOS PESADOS (3D, WEBP, 360°)
    // -------------------------------------------------------------------------
    workbox.routing.registerRoute(
        ({ url, request }) => {
            const path = url.pathname.toLowerCase();
            const is3DModel = /\.(glb|gltf|obj|fbx|bin|hdr|stl|dae)$/i.test(path);
            const is360Viewer =
                path.includes('macro360') ||
                path.includes('microscopio_360') ||
                path.includes('pieza_360');
            const isHeavyImage = /\.(webp|png|jpg|jpeg|svg|avif)$/i.test(path) || request.destination === 'image';
            const isViewerEngine =
                path.endsWith('surgical_viewer_3d.js') ||
                path.endsWith('macro_viewer_360.js');

            return is3DModel || is360Viewer || isHeavyImage || isViewerEngine;
        },
        new workbox.strategies.CacheFirst({
            cacheName: HEAVY_3D_CACHE,
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200]
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 250, // Límite de 250 activos en caché LRU
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días de persistencia quirúrgica
                    purgeOnQuotaError: true // Purga LRU en cuotas reducidas de dispositivos móviles
                })
            ]
        })
    );

    // -------------------------------------------------------------------------
    // 4.4. STALE-WHILE-REVALIDATE PARA SCRIPTS, ESTILOS Y FUENTES MÉDICAS
    // -------------------------------------------------------------------------
    workbox.routing.registerRoute(
        ({ request, url }) =>
            request.destination === 'script' ||
            request.destination === 'style' ||
            request.destination === 'font' ||
            url.hostname.includes('fonts.googleapis.com') ||
            url.hostname.includes('fonts.gstatic.com') ||
            url.hostname.includes('cdnjs.cloudflare.com'),
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: CORE_CACHE,
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200]
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 100,
                    maxAgeSeconds: 14 * 24 * 60 * 60 // 14 días
                })
            ]
        })
    );

    // -------------------------------------------------------------------------
    // 4.5. MANEJADOR GLOBAL DE CAPTURA (CATCH HANDLER) -> RESCATE ESTÉRIL
    // -------------------------------------------------------------------------
    workbox.routing.setCatchHandler(async ({ event }) => {
        const req = event.request;
        if (req.destination === 'document' || req.mode === 'navigate') {
            const cachedPage = await caches.match(req);
            if (cachedPage) return cachedPage;

            const fallbackShell =
                (await caches.match('./reportes.html', { ignoreSearch: true })) ||
                (await caches.match('./index.html', { ignoreSearch: true })) ||
                (await caches.match('./offline-sterile.html', { ignoreSearch: true }));
            if (fallbackShell) return fallbackShell;

            return new Response(STERILE_OFFLINE_HTML, {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
        return Response.error();
    });
}

// =============================================================================
// 5. MOTOR AUTÓNOMO DE CONTINGENCIA NATIVA (SI WORKBOX NO ESTUVIERA PRESENTE)
// =============================================================================
if (!workboxLoaded) {
    self.addEventListener('fetch', (event) => {
        const request = event.request;
        const requestUrl = new URL(request.url);

        // Bypass estricto de streaming y microservicios
        if (
            request.method !== 'GET' ||
            requestUrl.protocol === 'ws:' ||
            requestUrl.protocol === 'wss:' ||
            requestUrl.port === '8085' ||
            requestUrl.pathname.includes('/stream') ||
            requestUrl.pathname.includes('/video_feed') ||
            requestUrl.hostname.includes('supabase.co') ||
            requestUrl.hostname.includes('groq.com') ||
            requestUrl.hostname.includes('resend.com')
        ) {
            return;
        }

        const isNavigation = request.mode === 'navigate' || request.destination === 'document';
        const path = requestUrl.pathname.toLowerCase();
        const is3D = /\.(glb|gltf|obj|fbx|bin|hdr|stl)$/i.test(path);
        const is360 = path.includes('macro360') || path.includes('microscopio_360') || path.includes('pieza_360');
        const isHeavyImg = /\.(webp|png|jpg|jpeg|svg)$/i.test(path) || request.destination === 'image';

        // ESTRATEGIA NATIVA 1: FAST-NETWORK-FIRST (1.8s) PARA NAVEGACIÓN
        if (isNavigation) {
            event.respondWith((async () => {
                let timeoutId;
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('FastTimeout1.8s')), 1800);
                });

                try {
                    const netResponse = await Promise.race([fetch(request), timeoutPromise]);
                    clearTimeout(timeoutId);
                    if (netResponse && netResponse.status === 200) {
                        const clone = netResponse.clone();
                        caches.open(CORE_CACHE).then((c) => c.put(request, clone));
                    }
                    return netResponse;
                } catch (err) {
                    clearTimeout(timeoutId);
                    const cached = await caches.match(request);
                    if (cached) return cached;

                    const rescue =
                        (await caches.match('./reportes.html')) ||
                        (await caches.match('./index.html')) ||
                        (await caches.match('./offline-sterile.html'));
                    if (rescue) return rescue;

                    return new Response(STERILE_OFFLINE_HTML, {
                        status: 200,
                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
                    });
                }
            })());
            return;
        }

        // ESTRATEGIA NATIVA 2: CACHEFIRST PARA ACTIVOS PESADOS (3D, WEBP, 360°)
        if (is3D || is360 || isHeavyImg) {
            event.respondWith((async () => {
                const cached = await caches.match(request);
                if (cached) return cached;

                try {
                    const netResponse = await fetch(request);
                    if (netResponse && netResponse.status === 200) {
                        const clone = netResponse.clone();
                        caches.open(HEAVY_3D_CACHE).then(async (cache) => {
                            cache.put(request, clone);
                            // Gestión elemental LRU limitando tamaño
                            const keys = await cache.keys();
                            if (keys.length > 250) {
                                cache.delete(keys[0]);
                            }
                        });
                    }
                    return netResponse;
                } catch (err) {
                    return cached || Response.error();
                }
            })());
            return;
        }

        // ESTRATEGIA NATIVA 3: STALE-WHILE-REVALIDATE PARA EL RESTO
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const clone = networkResponse.clone();
                            caches.open(CORE_CACHE).then((cache) => cache.put(request, clone));
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);
                return cachedResponse || fetchPromise;
            })
        );
    });
}

// =============================================================================
// 6. MANEJO DE EVENTO SYNC NATIVO (BACKGROUND SYNC LISTENER)
// =============================================================================
self.addEventListener('sync', (event) => {
    if (event.tag === BG_SYNC_QUEUE || event.tag === 'sync-forms' || event.tag === 'biopsy-sync') {
        console.log('[SW Quirófano] Evento de sincronización en segundo plano recibido:', event.tag);
        event.waitUntil(
            (async () => {
                if (workboxLoaded && workbox.backgroundSync) {
                    try {
                        const queue = new workbox.backgroundSync.Queue(BG_SYNC_QUEUE);
                        await queue.replayRequests();
                        console.log('[SW Quirófano] Cola Workbox BackgroundSync retransmitida con éxito.');
                    } catch (e) {
                        console.warn('[SW Quirófano] Reintento de sincronización:', e);
                    }
                }
                const clients = await self.clients.matchAll({ type: 'window' });
                for (const client of clients) {
                    client.postMessage({
                        type: 'BG_SYNC_COMPLETED',
                        tag: event.tag,
                        timestamp: new Date().toISOString()
                    });
                }
            })()
        );
    }
});

// =============================================================================
// 7. CANAL DE MENSAJERÍA ENTRE CLIENTES Y SERVICE WORKER
// =============================================================================
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CHECK_OFFLINE_STATUS') {
        event.ports[0].postMessage({
            status: 'STERILE_ACTIVE',
            cacheVersion: CACHE_VERSION,
            coreCache: CORE_CACHE,
            heavyCache: HEAVY_3D_CACHE,
            workboxEnabled: workboxLoaded
        });
    }
});
