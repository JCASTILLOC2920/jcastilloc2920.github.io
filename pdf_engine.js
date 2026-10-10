// pdf_engine.js
// PROTOCOLO ACTOR-CRITICO: Módulo Aislado para Generación y Enrutamiento de PDF
import { patientDatabase } from './db_service.js';


export function openPrintWindow(codAtencion, autoDownload = false) {
    if (!codAtencion) {
        console.error("Error: No se proporcionó código de atención para generar PDF.");
        return;
    }
    
    console.log(`[PDF Engine] Preparando documento para código: ${codAtencion} (autoDownload: ${autoDownload})`);
    
    const cleanTarget = String(codAtencion).trim().toLowerCase().replace(/[-_\s]/g, '');
    let patient = patientDatabase && Array.isArray(patientDatabase) ? patientDatabase.find(x => String(x.codAtencion || x.cod_atencion || '').trim().toLowerCase().replace(/[-_\s]/g, '') === cleanTarget) : null;
    
    if (!patient && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
        patient = window.REAL_SUPABASE_PATIENTS.find(x => String(x.codAtencion || '').trim().toLowerCase().replace(/[-_\s]/g, '') === cleanTarget);
    }
    
    if (patient) {
        try {
            localStorage.setItem('printPatientData', JSON.stringify(patient));
        } catch (e) {
            console.warn("[PDF Engine] No se pudo guardar en localStorage", e);
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
