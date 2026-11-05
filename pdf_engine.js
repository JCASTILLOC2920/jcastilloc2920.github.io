// pdf_engine.js
// PROTOCOLO ACTOR-CRITICO: Módulo Aislado para Generación y Enrutamiento de PDF
import { patientDatabase } from './db_service.js?v=20261105_v674';


export function openPrintWindow(codAtencion, autoDownload = false) {
    if (!codAtencion) {
        console.error("Error: No se proporcionó código de atención para generar PDF.");
        return;
    }
    
    console.log(`[PDF Engine] Preparando documento para código: ${codAtencion} (autoDownload: ${autoDownload})`);
    
    const cleanTarget = String(codAtencion).trim().toLowerCase().replace(/[-_\s]/g, '');
    let patient = patientDatabase && Array.isArray(patientDatabase) ? patientDatabase.find(x => String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase().replace(/[-_\s]/g, '') === cleanTarget) : null;
    
    if (!patient && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
        patient = window.REAL_SUPABASE_PATIENTS.find(x => String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase().replace(/[-_\s]/g, '') === cleanTarget);
    }

    if (!patient && typeof window !== 'undefined') {
        const active = window.activePatient || window.currentEditingPatient;
        if (active) {
            const activeCode = String(active.codAtencion || active.cod_atencion || '').trim().toLowerCase().replace(/[-_\s]/g, '');
            if (activeCode === cleanTarget) {
                patient = active;
            }
        }
    }
    
    let isClinicUser = false;
    try {
        const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (u && u.perfil === 'Usuario') isClinicUser = true;
    } catch(e) {}

    const isSigned = patient && (patient.firmado === true || patient.firmado === 1 || String(patient.firmado).toLowerCase() === 'true');
    const isReady = patient && (String(patient.estado || '').toLowerCase().includes('completad') || String(patient.estado || '').toLowerCase().includes('listo') || String(patient.estado || '').toLowerCase().includes('firmad'));
    const isFullySigned = isSigned && isReady;

    if (isClinicUser && !isFullySigned) {
        alert("DOCUMENTO EN PROCESO DE EVALUACIÓN HISTOPATOLÓGICA:\nEl presente informe se encuentra en validación diagnóstica microscópica por el Dr. José Castillo. Por estricta directiva institucional, no puede ser visualizado ni emitido hasta contar con Firma Digital oficial.");
        return;
    }

    if (patient) {
        try {
            const patientStr = JSON.stringify(patient);
            localStorage.setItem('printPatientData', patientStr);
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('printPatientData', patientStr);
            }
        } catch (e) {
            console.warn("[PDF Engine] No se pudo guardar en localStorage/sessionStorage", e);
        }
    }
    
    // Abrir imprimir.html pasando el codAtencion como parámetro GET con autoDownload activo si se solicitó descarga directa
    const printUrl = `imprimir.html?${autoDownload ? 'autoDownload=true&' : ''}codAtencion=${encodeURIComponent(codAtencion)}`;
    const newWindow = window.open(printUrl, '_blank');
    
    if (newWindow) {
        newWindow.focus();
    } else {
        alert("Por favor permita las ventanas emergentes (pop-ups) para generar el PDF.");
    }
}
