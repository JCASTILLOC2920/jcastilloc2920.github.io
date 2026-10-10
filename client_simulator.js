// client_simulator.js
// PROTOCOLO ACTOR-CRITICO: Gestor de Sesión Real de Clientes (Doctores y Clínicas)
// Sin simulaciones ni banners: Inicia sesión auténtica en el aplicativo para auditoría real en móvil y PC.

import { usersDatabase } from './users_db.js';
import { patientDatabase } from './db_service.js';

const ADMIN_USER_DEFAULT = {
    id: 1,
    perfil: 'Administrador',
    dni: '41457466',
    nombres: 'JOSEHP CHRISTOPHER, CASTILLO CUENCA',
    usuario: 'admin'
};

// Metadatos enriquecidos de especialidades y sedes para cada cliente
const CLIENT_METADATA = {
    'drvictorcastaneda': {
        type: 'doctor',
        specialty: 'Urología',
        clinic: 'Clínica No Conocida',
        shortTitle: 'Urólogo Especialista'
    },
    'bryanflores': {
        type: 'doctor',
        specialty: 'Cirugía / Ginecología',
        clinic: 'Clínica No Conocida',
        shortTitle: 'Cirujano Especialista'
    },
    'drdiegochungui': {
        type: 'doctor',
        specialty: 'Cirugía Oncológica',
        clinic: 'Clínica Carrión',
        shortTitle: 'Oncólogo Quirúrgico'
    },
    'drjhonvilca': {
        type: 'doctor',
        specialty: 'Cirugía General',
        clinic: 'Sede Principal',
        shortTitle: 'Cirujano General'
    },
    'drjorgemunante': {
        type: 'doctor',
        specialty: 'Gastroenterología / Cirugía',
        clinic: 'Sede Principal',
        shortTitle: 'Gastroenterólogo'
    },
    'drjaimebecerra': {
        type: 'doctor',
        specialty: 'Cirugía General',
        clinic: 'Sede Principal',
        shortTitle: 'Cirujano Especialista'
    },
    'drmanuelsanchez': {
        type: 'doctor',
        specialty: 'Cirugía General / Especialidades',
        clinic: 'Sede Principal',
        shortTitle: 'Médico Cirujano'
    },
    'dralejandroescalante': {
        type: 'doctor',
        specialty: 'Cirugía / San Clemente',
        clinic: 'Clínica San Clemente',
        shortTitle: 'Cirujano Especialista'
    },
    'clinicacarrion': {
        type: 'clinic',
        specialty: 'Hospitalización y Cirugía',
        clinic: 'Callao',
        shortTitle: 'Sede Hospitalaria'
    },
    'carrionventanilla': {
        type: 'clinic',
        specialty: 'Centro Médico Quirúrgico',
        clinic: 'Ventanilla, Callao',
        shortTitle: 'Sede Ambulatoria'
    },
    'Mujersegura': {
        type: 'clinic',
        specialty: 'Ginecología y Prevención',
        clinic: 'Lima',
        shortTitle: 'Salud Femenina'
    },
    'sanclemente': {
        type: 'clinic',
        specialty: 'Policlínico y Cirugía',
        clinic: 'Pisco / Ica',
        shortTitle: 'Sede Regional'
    },
    'alfaprevenir': {
        type: 'clinic',
        specialty: 'Prevención y Diagnóstico',
        clinic: 'Lima',
        shortTitle: 'Sede Ambulatoria'
    },
    'JUNCO2026': {
        type: 'particular',
        specialty: 'Atención Médica Particular',
        clinic: 'Privado',
        shortTitle: 'Cliente Particular'
    }
};

/**
 * Cuenta cuántos pacientes tiene asignados un cliente en patientDatabase
 */
function getClientPatientCount(client) {
    const source = (typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0)
        ? window.REAL_SUPABASE_PATIENTS
        : (Array.isArray(patientDatabase) && patientDatabase.length > 0 ? patientDatabase : []);
    if (!source || source.length === 0) return 0;
    const account = (client.usuario || '').toLowerCase();
    const clinicName = (client.nombres || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return source.filter(item => {
        if (!item) return false;
        const rawMed = `${item.medSolicitante || ''} ${item.doctor || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const itemClinica = (item.clinica || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (account === 'drvictorcastaneda' || account.includes('castaneda')) {
            return rawMed.includes('castaneda') || rawMed.includes('robles') || rawMed.includes('castañeda');
        }
        if (account === 'bryanflores' || clinicName.includes('bryan')) {
            return rawMed.includes('bryan') || (rawMed.includes('flores') && rawMed.includes('sierra'));
        }
        if (account === 'drdiegochungui' || clinicName.includes('chungui')) {
            return rawMed.includes('chungui') || rawMed.includes('diego');
        }
        if (account === 'drjhonvilca' || account.includes('jhonvilca')) {
            return rawMed.includes('vilca') || rawMed.includes('jhon');
        }
        if (account === 'drjorgemunante' || account.includes('munante')) {
            return rawMed.includes('munante') || rawMed.includes('arzapalo');
        }
        if (account === 'drjaimebecerra' || account.includes('becerra')) {
            return rawMed.includes('becerra') || rawMed.includes('ulfe');
        }
        if (account === 'drmanuelsanchez' || account.includes('sanchez')) {
            return rawMed.includes('sanchez') || rawMed.includes('orellana');
        }
        if (account === 'dralejandroescalante' || account.includes('escalante')) {
            return rawMed.includes('escalante') || rawMed.includes('alvaro');
        }

        // Clínicas
        if (clinicName.includes('no conocida')) {
            return itemClinica.includes('no conocida') ||
                   rawMed.includes('castaneda') ||
                   rawMed.includes('robles') ||
                   rawMed.includes('bryan') ||
                   (rawMed.includes('flores') && rawMed.includes('sierra'));
        }
        if (clinicName.includes('mujer')) return itemClinica.includes('mujer');
        if (clinicName.includes('ventanilla')) return itemClinica.includes('ventanilla');
        if (clinicName.includes('carrion')) return itemClinica.includes('carrion');
        if (clinicName.includes('clemente')) return itemClinica.includes('clemente') || rawMed.includes('escalante');
        if (clinicName.includes('alfa')) return itemClinica.includes('alfa') || itemClinica.includes('prevenir');
        if (clinicName.includes('junco')) return itemClinica.includes('junco') || rawMed.includes('junco');

        return false;
    }).length;
}

/**
 * Inyecta el DOM del Modal Selector de Clientes
 */
function ensureModalDOM() {
    if (document.getElementById('clientSimulatorModal')) return;

    const modal = document.createElement('div');
    modal.id = 'clientSimulatorModal';
    modal.className = 'csm-overlay';
    modal.innerHTML = `
        <div class="csm-container" role="dialog" aria-modal="true" aria-labelledby="csmTitle">
            <header class="csm-header">
                <div class="csm-header-left">
                    <div class="csm-header-icon">
                        <i class="fa-solid fa-users-gear"></i>
                    </div>
                    <div>
                        <h2 class="csm-title" id="csmTitle">Acceso Real a Cuentas de Clientes</h2>
                        <p class="csm-subtitle">Inicia sesión auténtica como cada médico o clínica para auditar en vivo la pantalla exacta.</p>
                    </div>
                </div>
                <button type="button" class="csm-close-btn" id="csmCloseBtn" aria-label="Cerrar modal" onclick="window.closeClientSimulatorModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>

            <div class="csm-toolbar">
                <div class="csm-search-box">
                    <i class="fa-solid fa-magnifying-glass csm-search-icon"></i>
                    <input type="text" id="csmSearchInput" class="csm-search-input" placeholder="Buscar por médico o clínica..." autocomplete="off">
                </div>
                <div class="csm-pills">
                    <button type="button" class="csm-pill-btn active" data-filter="all">Todos</button>
                    <button type="button" class="csm-pill-btn" data-filter="doctor">Médicos</button>
                    <button type="button" class="csm-pill-btn" data-filter="clinic">Clínicas</button>
                </div>
            </div>

            <div class="csm-body" id="csmGrid">
                <!-- Tarjetas dinámicas -->
            </div>

            <footer class="csm-footer">
                <span><i class="fa-solid fa-shield-halved" style="color: #10b981;"></i> Al seleccionar un cliente, la página cargará con su perfil 100% real sin banners.</span>
                <span><i class="fa-solid fa-keyboard"></i> ESC</span>
            </footer>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('csmCloseBtn')?.addEventListener('click', window.closeClientSimulatorModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeClientSimulatorModal();
    });

    modal.querySelectorAll('.csm-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.csm-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndRenderCards();
        });
    });

    const searchInput = document.getElementById('csmSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderCards();
        });
    }
}

/**
 * Inyecta el Sheet de Opciones al presionar Cerrar Sesión estando en cuenta de cliente
 */
function ensureExitSheetDOM() {
    if (document.getElementById('clientExitSheet')) return;

    const sheet = document.createElement('div');
    sheet.id = 'clientExitSheet';
    sheet.className = 'client-switch-sheet';
    sheet.innerHTML = `
        <div class="css-content" role="dialog">
            <div class="css-header">
                <h3 id="cssCurrentClientTitle">Sesión Activa de Cliente</h3>
                <p id="cssCurrentClientSub">¿Qué acción deseas realizar?</p>
            </div>
            
            <button type="button" class="css-option-btn btn-return-admin" id="cssBtnReturnAdmin">
                <i class="fa-solid fa-crown" style="font-size: 1.1rem;"></i>
                <div>
                    <div style="font-weight: 700;">Volver a Administrador</div>
                    <div style="font-size: 0.74rem; opacity: 0.85;">Dr. Joseph Castillo Cuenca (Acceso Total)</div>
                </div>
            </button>

            <button type="button" class="css-option-btn" id="cssBtnSwitchClient">
                <i class="fa-solid fa-repeat" style="color: #38bdf8;"></i>
                <div>
                    <div>Cambiar a otro Médico o Clínica</div>
                    <div style="font-size: 0.74rem; color: #94a3b8;">Elegir otro cliente de la lista</div>
                </div>
            </button>

            <button type="button" class="css-option-btn" id="cssBtnFullLogout">
                <i class="fa-solid fa-right-from-bracket" style="color: #ef4444;"></i>
                <div>
                    <div>Cerrar Sesión y salir al Login</div>
                    <div style="font-size: 0.74rem; color: #94a3b8;">Desconectar cuenta actual</div>
                </div>
            </button>

            <button type="button" class="css-option-btn btn-cancel" id="cssBtnCancel">
                Cancelar
            </button>
        </div>
    `;

    document.body.appendChild(sheet);

    document.getElementById('cssBtnReturnAdmin')?.addEventListener('click', () => {
        closeExitSheet();
        exitClientSession();
    });

    document.getElementById('cssBtnSwitchClient')?.addEventListener('click', () => {
        closeExitSheet();
        openClientSimulatorModal();
    });

    document.getElementById('cssBtnFullLogout')?.addEventListener('click', () => {
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    document.getElementById('cssBtnCancel')?.addEventListener('click', closeExitSheet);
    sheet.addEventListener('click', (e) => {
        if (e.target === sheet) closeExitSheet();
    });
}

function openExitSheet() {
    ensureExitSheetDOM();
    let current = null;
    try {
        current = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {}

    const titleEl = document.getElementById('cssCurrentClientTitle');
    const subEl = document.getElementById('cssCurrentClientSub');
    if (titleEl && current) {
        titleEl.textContent = `Cuenta: ${current.nombres || 'Cliente'}`;
    }
    if (subEl && current) {
        subEl.textContent = `Usuario: @${current.usuario || ''}`;
    }

    const sheet = document.getElementById('clientExitSheet');
    if (sheet) sheet.classList.add('active');
}

function closeExitSheet() {
    const sheet = document.getElementById('clientExitSheet');
    if (sheet) sheet.classList.remove('active');
}

/**
 * Filtra y renderiza las tarjetas de clientes
 */
function filterAndRenderCards() {
    const grid = document.getElementById('csmGrid');
    if (!grid) return;

    const activeFilter = document.querySelector('.csm-pill-btn.active')?.getAttribute('data-filter') || 'all';
    const rawSearch = (document.getElementById('csmSearchInput')?.value || '').trim();
    const cleanSearch = rawSearch
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/casteñeda|casteneda/g, 'castaneda');
    const searchTokens = cleanSearch.split(/\s+/).filter(Boolean);

    let current = null;
    try {
        current = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {}
    const activeUsername = current ? (current.usuario || '').toLowerCase() : '';

    const clientUsers = usersDatabase.filter(u => u.perfil === 'Usuario');

    const filtered = clientUsers.filter(user => {
        const username = (user.usuario || '').toLowerCase();
        const meta = CLIENT_METADATA[user.usuario] || { type: 'doctor', specialty: 'Especialista', clinic: 'Sede' };

        if (activeFilter === 'doctor' && meta.type !== 'doctor') return false;
        if (activeFilter === 'clinic' && meta.type !== 'clinic' && meta.type !== 'particular') return false;

        if (searchTokens.length > 0) {
            const raw = `${user.nombres} ${user.usuario} ${meta.specialty} ${meta.clinic}`
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/ñ/g, 'n');
            return searchTokens.every(t => raw.includes(t));
        }

        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8;">
                <i class="fa-solid fa-user-slash" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px; display: block;"></i>
                <div style="font-weight: 600; font-size: 1rem; color: #e2e8f0;">No se encontraron clientes</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(user => {
        const username = user.usuario;
        const meta = CLIENT_METADATA[username] || { type: 'doctor', specialty: 'Especialista', clinic: 'Sede' };
        const isClinic = meta.type === 'clinic' || meta.type === 'particular';
        const avatarIcon = isClinic ? 'fa-hospital' : 'fa-user-doctor';
        const avatarClass = isClinic ? 'csm-avatar-clinic' : 'csm-avatar-doctor';
        const patientCount = getClientPatientCount(user);
        const isActive = activeUsername === username.toLowerCase();

        return `
            <div class="csm-client-card" data-username="${username}">
                <div class="csm-card-top">
                    <div class="csm-client-avatar ${avatarClass}">
                        <i class="fa-solid ${avatarIcon}"></i>
                    </div>
                    <div class="csm-client-meta">
                        <h3 class="csm-client-name">${escapeHtml(user.nombres)}</h3>
                        <p class="csm-client-sub">
                            <span class="csm-tag-specialty">${escapeHtml(meta.specialty)}</span>
                            <span>•</span>
                            <span>${escapeHtml(meta.clinic)}</span>
                            <span class="csm-tag-user">@${escapeHtml(username)}</span>
                        </p>
                    </div>
                </div>
                <div class="csm-card-bottom">
                    <span class="csm-patient-count">
                        <i class="fa-solid fa-folder-open"></i>
                        <strong>${patientCount}</strong> ${patientCount === 1 ? 'paciente' : 'pacientes'}
                    </span>
                    <button type="button" class="csm-btn-select" onclick="window.switchToClient('${escapeHtml(username)}')">
                        <i class="fa-solid ${isActive ? 'fa-circle-check' : 'fa-arrow-right-to-bracket'}"></i>
                        <span>${isActive ? 'Sesión Actual' : 'Entrar a su Aplicativo'}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Abre el Modal Selector de Clientes
 */
export function openClientSimulatorModal() {
    ensureModalDOM();
    filterAndRenderCards();
    const modal = document.getElementById('clientSimulatorModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('csmSearchInput')?.focus();
    }
}

/**
 * Cierra el Modal Selector de Clientes
 */
export function closeClientSimulatorModal() {
    const modal = document.getElementById('clientSimulatorModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Inicia sesión real con la cuenta del cliente (recarga limpia en su aplicativo auténtico)
 */
export function switchToClient(username) {
    const client = usersDatabase.find(u => (u.usuario || '').toLowerCase() === String(username).toLowerCase());
    if (!client) {
        if (typeof window.showToast === 'function') {
            window.showToast("No se encontró el cliente", "error");
        }
        return;
    }

    // Marca para permitir volver al administrador con 1 toque
    sessionStorage.setItem('adminReturnAvailable', 'true');
    localStorage.setItem('currentUser', JSON.stringify(client));

    closeClientSimulatorModal();

    // Recargar limpiamente en reportes.html sin parámetros ni banners
    window.location.href = 'reportes.html';
}

/**
 * Restaura la sesión oficial de Administrador
 */
export function exitClientSession() {
    sessionStorage.removeItem('adminReturnAvailable');
    localStorage.setItem('currentUser', JSON.stringify(ADMIN_USER_DEFAULT));
    window.location.href = 'reportes.html';
}
export const exitClientSimulation = exitClientSession;

/**
 * Inicializador principal
 */
export function initClientSimulator() {
    window.openClientSimulatorModal = openClientSimulatorModal;
    window.closeClientSimulatorModal = closeClientSimulatorModal;
    window.switchToClient = switchToClient;
    window.exitClientSimulation = exitClientSession;

    // Conectar botón en sidebar de Administrador
    const btnSidebar = document.getElementById('btnSidebarClientes');
    if (btnSidebar) {
        btnSidebar.addEventListener('click', (e) => {
            e.preventDefault();
            openClientSimulatorModal();
        });
    }

    // Tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeClientSimulatorModal();
            closeExitSheet();
        }
    });

    // Si estamos en sesión de cliente pero venimos del conmutador de administración,
    // configurar el botón de cerrar sesión y el nombre para permitir retornar a admin con 1 toque
    const isReturnAvailable = sessionStorage.getItem('adminReturnAvailable') === 'true';
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {}

    if (isReturnAvailable && currentUser && currentUser.perfil === 'Usuario') {
        ensureExitSheetDOM();

        // Al presionar el botón de cerrar sesión en la cabecera, mostrar opciones de retorno
        setTimeout(() => {
            const logoutBtn = document.getElementById('btnLogout');
            if (logoutBtn) {
                // Clonar para limpiar handlers anteriores y asociar el sheet
                const newLogout = logoutBtn.cloneNode(true);
                newLogout.title = "Opciones de Sesión (Cambiar Cliente / Volver a Admin)";
                newLogout.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openExitSheet();
                });
                logoutBtn.parentNode?.replaceChild(newLogout, logoutBtn);
            }

            // También permitir tocar en el nombre de bienvenida en la cabecera
            const welcomeText = document.querySelector('.welcome-text');
            if (welcomeText) {
                welcomeText.style.cursor = 'pointer';
                welcomeText.title = "Toca para cambiar de cliente o volver a Administrador";
                welcomeText.addEventListener('click', openExitSheet);
            }
        }, 150);
    }

    // Soporte para URL directa ?clientes=1 o ?simulate_client=open o ?doctor=castaneda
    const urlParams = new URLSearchParams(window.location.search);
    const doctorParam = urlParams.get('doctor') || urlParams.get('cliente') || urlParams.get('medico');
    if (doctorParam) {
        const normParam = doctorParam.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normParam.includes('castaneda') || normParam.includes('victor')) {
            setTimeout(() => {
                switchToClient('drvictorcastaneda');
            }, 100);
            return;
        }
    }

    if (urlParams.get('clientes') === '1' || urlParams.get('simulate_client') === 'open') {
        setTimeout(openClientSimulatorModal, 350);
    }
}
