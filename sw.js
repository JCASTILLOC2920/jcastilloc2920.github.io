// sw.js - Service Worker Médico Ultra-Resiliente y Permisivo (Modo Quirófano)
// Versión Médico-Quirúrgica 655.0 Futuristic
const CACHE_NAME = 'reportes-cache-20261101_v658';

const STATIC_ASSETS = [
    './',
    './reportes.html',
    './login.html',
    './imprimir.html',
    './index.html',
    './mobile_camera_drop.html',
    './morfologia_he_original.jpg',
    './morfologia_ia_pleomorfismo.jpg',
    './qrcode.min.js',
    './medical_order_cropper.js',
    './manifest.json',
    './favicon.png',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png',
    './logo-jcpathlab.png',
    './header_reporte.png',
    './firma_sello.png',
    './style.css',
    './reportes.css',
    './modern_pathology_theme.css',
    './photo_editor.css',
    './photo_editor.js',
    './mobile_report_reader.css',
    './mobile_report_reader.js',
    './cropper.min.css',
    './cropper.min.js',
    './pwa_init.js',
    './responsive_scaler.js',
    './utils.js',
    './db_service.js',
  './sovereign_integrity_guard.js',
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
    './synoptic_schemas.js',
    './cap_schemas_digestivo.js',
    './cap_schemas_gyn_endocrine.js',
    './cap_schemas_liver.js',
    './cap_schemas_urology.js',
    './macro_viewer_360.js',
    './script.js',
    './doctores.json',
    './client_simulator.js',
    './client_simulator.css',
    './groq_copilot.js',
    './groq_copilot.css'
];

// 1. INSTALACIÓN: Pre-cacheo tolerante a fallos
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                STATIC_ASSETS.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.warn(`[SW Precache] Omitido (${asset}):`, err.message);
                    })
                )
            );
        })
    );
});

// 2. ACTIVACIÓN: Limpieza de cachés viejas y toma de control inmediata
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Mensajes externos
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

// 3. FETCH HANDLER: Stale-While-Revalidate para assets estáticos con bypass estricto para APIs
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Bypass estricto para métodos no-GET, WebSockets, APIs externas y streams
    if (
        request.method !== 'GET' ||
        url.protocol === 'ws:' ||
        url.protocol === 'wss:' ||
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('groq.com') ||
        url.hostname.includes('resend.com') ||
        url.hostname.includes('resend.dev') ||
        url.pathname.includes('/stream') ||
        url.pathname.includes('/video_feed') ||
        url.protocol.startsWith('chrome-extension')
    ) {
        return;
    }

        // Estrategia Network-First estricta para HTML / Navegación y Scripts Críticos de Datos
    const isHtmlNavigation = request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
    const isCriticalScript = url.pathname.endsWith('real_supabase_backup.js') || 
                             url.pathname.endsWith('supabase_config.js') || 
                             url.pathname.endsWith('db_service.js') || 
                             url.pathname.endsWith('main.js');

    if (isHtmlNavigation || isCriticalScript) {
        event.respondWith(
            fetch(request).then((networkResponse) => {
                if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(async () => {
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                if (isHtmlNavigation) {
                    const fallback = await caches.match('./reportes.html') || await caches.match('./index.html');
                    if (fallback) return fallback;

                    return new Response(
                        '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Modo Quirófano Offline</title></head><body style="background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:50px;"><h2>🔬 Conexión Restringida</h2><p>La red no está disponible y el recurso no está precacheado.</p><button onclick="window.location.reload()" style="background:#0284c7;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;">Reintentar</button></body></html>',
                        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                    );
                }
                return new Response('', { status: 200, headers: { 'Content-Type': 'application/javascript' } });
            })
        );
        return;
    }

    // Estrategia Stale-While-Revalidate (O(1) instantáneo desde caché, actualización de red en segundo plano)
    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(request);

            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
                    cache.put(request, networkResponse.clone()).catch(() => {});
                }
                return networkResponse;
            }).catch(() => {});

            if (cachedResponse) {
                event.waitUntil(fetchPromise);
                return cachedResponse;
            }

            try {
                const networkResponse = await fetchPromise;
                if (networkResponse) {
                    return networkResponse;
                }
            } catch (err) {}

            return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        })
    );
});