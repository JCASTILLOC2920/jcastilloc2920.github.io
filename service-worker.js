/**
 * service-worker.js - Puntero Estandarizado al Service Worker Unificado de Quirófano (sw.js)
 * JC PATH LAB • Anatomía Patológica & Diagnóstico Oncológico
 * Fase 3C del Plan de Modernización Web: Modo Quirófano Offline Resiliente
 * 
 * Este archivo estandariza y unifica el registro en clientes legacy y páginas de SEO,
 * delegando la ejecución a 'sw.js' para garantizar estrategias Workbox resilientes,
 * caché estéril y sincronización en segundo plano sin purgas destructivas.
 */

try {
    importScripts('./sw.js');
} catch (error) {
    console.error('[service-worker.js] Fallo al delegar ejecución a sw.js:', error);
}
