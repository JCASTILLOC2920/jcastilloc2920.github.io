// pwa_init.js - Inicializador PWA de Grado Médico y Captura de Instalación Android/iOS
(function() {
    'use strict';

    // Guardián de versión y auto-purga para sincronización multi-dispositivo
    const APP_BUILD_VERSION = '20261105_v673';
    const savedVersion = localStorage.getItem('app_version');
    if (savedVersion !== APP_BUILD_VERSION) {
        console.warn(`[PWA Version Guard] Versión previa detectada (${savedVersion} vs ${APP_BUILD_VERSION}). Purgando cachés y sincronizando...`);
        localStorage.setItem('app_version', APP_BUILD_VERSION);
        if ('caches' in window) {
            caches.keys().then(names => names.forEach(n => caches.delete(n)));
        }
        // Directiva Suprema: NUNCA purgar patientDatabaseLocal ni pacientesDB del almacenamiento local
    }

    // Purgar cachés obsoletas del navegador cliente de inmediato
    if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then(function(cacheNames) {
            cacheNames.forEach(function(name) {
                if (name !== 'reportes-cache-v20261023-futuristic-v655') {
                    console.log('[PWA Medical] Purgando caché obsoleta cliente:', name);
                    caches.delete(name);
                }
            });
        });
    }

    ['patientDatabaseLocal', 'patientDatabase', 'pacientesDB', 'patientDatabaseLocal_bak1', 'patientDatabaseLocal_bak2', 'patientDatabaseLocal_bak3', 'activePatientDb'].forEach(function(k){  var val = localStorage.getItem(k);  if (val && (val.indexOf('SIN NOMBRE') !== -1 || val.indexOf('18974') !== -1 || val.indexOf('26Q-189') !== -1)) {    localStorage.removeItem(k);  }});

    // 1. Registro del Service Worker Médico con Bypass de Caché y Autocontrol
    if ('serviceWorker' in navigator) {
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            if (!refreshing) {
                refreshing = true;
                console.log(`[PWA Medical] Nuevo Service Worker activo (${APP_BUILD_VERSION}). Actualizando interfaz automáticamente...`);
                localStorage.setItem('app_version', APP_BUILD_VERSION);
                window.location.reload();
            }
        });

        window.addEventListener('load', function() {
            navigator.serviceWorker.register('sw.js?v=20261105_v673', { scope: './', updateViaCache: 'none' })
                .then(function(registration) {
                    registration.update().catch(function() {});
                    console.log('[PWA Medical] Service Worker registrado con éxito (v655). Scope:', registration.scope);
                    
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA Medical] Nueva versión médica lista. Activando inmediatamente...');
                                    newWorker.postMessage({ action: 'skipWaiting' });
                                }
                            });
                        }
                    });
                })
                .catch(function(err) {
                    console.warn('[PWA Medical] Aviso: Service Worker no disponible o error menor en registro (continuando carga normal):', err);
                });
        });
    }

    // 2. Detección de Modo Standalone / App Ya Instalada
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    }

    // 3. Captura del Evento beforeinstallprompt para Instalación Nativa en Android
    let deferredInstallPrompt = null;
    window.deferredInstallPrompt = null;

    function updateInstallUi(show) {
        const installBtns = document.querySelectorAll('#btnInstallApp, .pwa-install-header-btn, .btn-pwa-install');
        installBtns.forEach(function(btn) {
            if (show && !isAppInstalled()) {
                btn.style.display = 'inline-flex';
                btn.classList.add('pwa-visible');
            } else {
                btn.style.display = 'none';
                btn.classList.remove('pwa-visible');
            }
        });
    }

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredInstallPrompt = e;
        window.deferredInstallPrompt = e;
        console.log('[PWA Medical] Evento beforeinstallprompt capturado. Listo para instalación.');
        
        updateInstallUi(true);
        window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: { promptEvent: e } }));
    });

    // 4. Función Global de Instalación Clínica en 1 Clic
    window.installPwaApp = async function() {
        if (!deferredInstallPrompt) {
            console.log('[PWA Medical] Prompt de instalación no disponible o ya utilizado.');
            return;
        }

        try {
            deferredInstallPrompt.prompt();
            const choiceResult = await deferredInstallPrompt.userChoice;
            console.log('[PWA Medical] Decisión del usuario:', choiceResult.outcome);
            if (choiceResult.outcome === 'accepted') {
                updateInstallUi(false);
            }
            deferredInstallPrompt = null;
            window.deferredInstallPrompt = null;
        } catch (err) {
            console.error('[PWA Medical] Error durante el proceso de instalación:', err);
        }
    };

    // 5. Escuchar cuando la App ha sido instalada exitosamente
    window.addEventListener('appinstalled', function() {
        console.log('[PWA Medical] Aplicación instalada correctamente.');
        deferredInstallPrompt = null;
        window.deferredInstallPrompt = null;
        updateInstallUi(false);
        if (typeof window.showToast === 'function') {
            window.showToast('¡App Patología Digital instalada con éxito!', 'success');
        }
    });

    // 6. Vinculación ergonómica de botones de instalación en el DOM
    function bindInstallButtons() {
        if (isAppInstalled()) {
            updateInstallUi(false);
            return;
        }

        const installBtns = document.querySelectorAll('#btnInstallApp, .pwa-install-header-btn, .btn-pwa-install');
        installBtns.forEach(function(btn) {
            if (!btn._pwaBound) {
                btn._pwaBound = true;
                btn.addEventListener('click', function(ev) {
                    ev.preventDefault();
                    window.installPwaApp();
                });
            }
        });

        if (deferredInstallPrompt) {
            updateInstallUi(true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindInstallButtons);
    } else {
        bindInstallButtons();
    }
    window.addEventListener('load', bindInstallButtons);

    // 7. Healthcheck y Autoreparación de Frontend Anti-Loop
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            const container = document.getElementById('tableBody') || document.getElementById('reportTable') || document.getElementById('tablaPacientes') || document.getElementById('pacientesTable') || document.querySelector('.pv-sheet') || document.querySelector('table');
            const hasContent = container ? (container.innerText.trim().length > 10 || container.querySelectorAll('tr, div').length > 0) : true;

            // Evitar loop infinito chequeando sessionStorage
            const alreadyRepaired = sessionStorage.getItem('pwa_auto_repaired_v630');

            if (!hasContent && !alreadyRepaired) {
                console.warn('[Healthcheck Frontend] Falla detectada (tabla vacía o sin contenido). Ejecutando Autoreparación única...');
                sessionStorage.setItem('pwa_auto_repaired_v630', 'true');
                triggerAutoRepair();
            }
        }, 3500);
    });

    function triggerAutoRepair() {
        try {
            if ('caches' in window) {
                caches.keys().then(names => names.forEach(n => caches.delete(n)));
            }
            localStorage.removeItem('app_cache');

            if (window.RealSupabaseBackup && typeof window.RealSupabaseBackup.restore === 'function') {
                window.RealSupabaseBackup.restore();
            }

            showBanner();
            setTimeout(() => window.location.reload(true), 1500);
        } catch (e) {
            console.error('[AutoRepair Error]', e);
            // window.location.reload();
        }
    }

    function showBanner() {
        if (document.getElementById('auto-recovered-banner')) return;
        const b = document.createElement('div');
        b.id = 'auto-recovered-banner';
        b.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:#10b981;color:#fff;text-align:center;padding:14px;font-weight:bold;z-index:999999;font-family:Inter,sans-serif;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
        b.innerHTML = '<i class="fa-solid fa-circle-check" style="margin-right:8px;"></i> Sistema Autorecuperado - Caché Purgada y Caja Negra Sincronizada';
        document.body.insertBefore(b, document.body.firstChild);
    }
})();
