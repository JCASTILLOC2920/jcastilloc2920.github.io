// ui_editor.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Interfaz para Modales, Editores y Safe-Setters

// --- SAFE SETTERS MATEMÁTICOS ---
// Previene crasheos si el elemento no existe en el DOM (Zero Redundancy)

export const safeSetElementValue = (elementId, value) => {
    const el = document.getElementById(elementId);
    if (el) {
        const valToSet = (value !== undefined && value !== null) ? value : '';
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
            el.value = valToSet;
        } else {
            el.innerText = valToSet;
        }
    } else {
        console.warn(`[SafeSetter] Elemento ${elementId} no encontrado.`);
    }
};

export const safeSetElementHTML = (elementId, htmlContent) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = (htmlContent !== undefined && htmlContent !== null) ? htmlContent : '';
    }
};

export const safeToggleDisplay = (elementId, displayState) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = displayState;
    }
};

// --- GESTIÓN DE MODALES ---

let savedMainScrollY = 0;

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        savedMainScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.setProperty('z-index', '999999', 'important');
        modal.style.setProperty('visibility', 'visible', 'important');
        modal.style.setProperty('opacity', '1', 'important');
        document.body.style.overflow = 'hidden'; // Bloquear scroll trasero
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.setProperty('display', 'none', 'important');
        
        // Verificar si aún queda algún otro modal activo antes de desbloquear el body
        const otherActiveModals = document.querySelectorAll('.modal-overlay.active, .report-editor-overlay.active, .modal-overlay[style*="display: flex"], .report-editor-overlay[style*="display: flex"]');
        if (otherActiveModals.length === 0) {
            document.body.style.overflow = ''; 
            if (savedMainScrollY > 0) {
                window.scrollTo({ top: savedMainScrollY, behavior: 'instant' });
            }
        }
    }
}

// Escuchar clics fuera de los modales para cerrarlos automáticamente
export function initModalListeners() {
    window.addEventListener('click', (e) => {
        if (e.target && e.target.classList && (e.target.classList.contains('modal-overlay') || e.target.classList.contains('report-editor-overlay'))) {
            closeModal(e.target.id);
        }
    });

    // Escuchar tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active, .report-editor-overlay.active, .report-editor-overlay[style*="display: flex"]').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}
