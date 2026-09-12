import { usersDatabase, categoriesDatabase, doctorsDatabase, defaultCategories, templatesDatabase, patientDatabase, saveCategoryToSupabase, deleteCategoryFromSupabase, saveTemplateToSupabase, deleteTemplateFromSupabase } from "./db_service.js";
import { applyFilters } from "./ui_tables.js";
const supabase = window.supabase;
const usingSupabase = !!(supabase && window.SUPABASE_CONFIG);

let filteredUsers = [];
export let currentUserPage = 1;
let userPageLength = 10;
let filteredCategories = [];
export let currentCategoryPage = 1;
let categoryPageLength = 10;
let activeTemplateTab = "Macroscopica";
let currentCategoryId = null;
let filteredDoctors = [];
export let currentDoctorPage = 1;
let doctorPageLength = 10;
let editingDoctorIndex = null;

const showToast = window.showToast || function(m){console.log(m)};


window.switchSidebarView = function(target, clickedBtn) {
    document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    } else {
        const tBtn = document.querySelector(`.nav-item-btn[data-target="${target}"]`);
        if (tBtn) tBtn.classList.add('active');
    }

    document.querySelectorAll('.dashboard-view, .dashboard-section, #view-patients, #view-templates, #view-users, #view-doctors, #view-contaduria, #view-boletas').forEach(view => {
        view.style.display = 'none';
    });

    if (target === 'pacientes') {
        const v = document.getElementById('view-patients');
        if (v) v.style.display = 'block';
        if (typeof window.applyFilters === 'function') {
            window.applyFilters(false);
        } else if (typeof applyFilters === 'function') {
            applyFilters(false);
        }
    } else if (target === 'boletas') {
        const v = document.getElementById('view-boletas');
        if (v) v.style.display = 'block';
        if (typeof window.initBoletasModule === 'function') {
            window.initBoletasModule();
        }
    } else if (target === 'doctor') {
        const v = document.getElementById('view-doctors');
        if (v) v.style.display = 'block';
        if (typeof loadDoctorsData === 'function') loadDoctorsData();
    } else if (target === 'usuario') {
        const v = document.getElementById('view-users');
        if (v) v.style.display = 'block';
        if (typeof loadUsersData === 'function') loadUsersData();
    } else if (target === 'plantilla' || target === 'template') {
        const v = document.getElementById('view-templates');
        if (v) v.style.display = 'block';
        if (typeof window.poblarCategoriasDropdown === 'function') window.poblarCategoriasDropdown();
        if (typeof window.renderTemplatesTreeView === 'function') window.renderTemplatesTreeView();
        if (typeof loadCategoriesData === 'function') loadCategoriesData();
    } else if (target === 'contaduria') {
        const v = document.getElementById('view-contaduria');
        if (v) v.style.display = 'block';
        if (typeof loadContaduriaData === 'function') loadContaduriaData();
    } else if (target === 'nuevo_informe') {
        const v = document.getElementById('view-patients');
        if (v) v.style.display = 'block';
        if (typeof window.openNewReportModal === 'function') {
            window.openNewReportModal();
        } else {
            if (typeof window.populateEditorModal === 'function') {
                window.populateEditorModal({ codAtencion: 'Q-2026-NUEVO' });
            }
            if (typeof window.openModal === 'function') window.openModal('reportEditorModalOverlay');
        }
    } else if (target === 'registro') {
        const v = document.getElementById('view-patients');
        if (v) v.style.display = 'block';
        if (typeof window.openRegistrationModal === 'function') {
            window.openRegistrationModal();
        } else if (typeof window.prepareRegistrationModal === 'function') {
            window.prepareRegistrationModal();
        }
        if (typeof window.openModal === 'function') window.openModal('registrationModalOverlay');
    }
};

export function initAdminUI() {
    document.querySelectorAll('.nav-item-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const actualBtn = e.target.closest('.nav-item-btn[data-target]') || btn;
            const target = actualBtn.getAttribute('data-target');
            if (!target) return;
            window.switchSidebarView(target, actualBtn);
        });
    });

    function debounce(fn, delay = 180) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    const contaduriaSearchInput = document.getElementById('contaduriaSearchInput');
    if (contaduriaSearchInput) contaduriaSearchInput.addEventListener('input', debounce(applyContaduriaFilters, 180));

    const contaduriaPageLength = document.getElementById('contaduriaPageLength');
    if (contaduriaPageLength) contaduriaPageLength.addEventListener('change', renderContaduriaTable);

    document.querySelectorAll('#contaduriaTabsNav button[data-contaduria-service]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#contaduriaTabsNav button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setContaduriaService(btn.getAttribute('data-contaduria-service'));
        });
    });

    const doctorsSearchInput = document.getElementById('doctorsSearchInput');
    if (doctorsSearchInput) doctorsSearchInput.addEventListener('input', debounce(applyDoctorFilters, 180));

    const doctorsPageLength = document.getElementById('doctorsPageLength');
    if (doctorsPageLength) doctorsPageLength.addEventListener('change', renderDoctorsTable);

    const btnNuevoDoctor = document.getElementById('btnNuevoDoctor');
    if (btnNuevoDoctor) btnNuevoDoctor.addEventListener('click', () => openDoctorModal());

    const closeDoctorModalBtn = document.getElementById('closeDoctorModalBtn');
    if (closeDoctorModalBtn) closeDoctorModalBtn.addEventListener('click', closeDoctorModal);

    const btnCancelarDoctor = document.getElementById('btnCancelarDoctor');
    if (btnCancelarDoctor) btnCancelarDoctor.addEventListener('click', closeDoctorModal);

    const doctorForm = document.getElementById('doctorForm');
    if (doctorForm) {
        doctorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveDoctorData();
        });
    }

    const usersSearchInput = document.getElementById('usersSearchInput');
    if (usersSearchInput) usersSearchInput.addEventListener('input', debounce(applyUserFilters, 180));

    const usersPageLength = document.getElementById('usersPageLength');
    if (usersPageLength) usersPageLength.addEventListener('change', renderUsersTable);

    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', () => {
            if (usersDatabase.some(u => u.isNew)) {
                showToast('Ya hay un nuevo usuario en edición.', 'warning');
                return;
            }
            const nextId = usersDatabase.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
            const draftUser = { id: nextId, perfil: 'Usuario', dni: '', nombres: '', usuario: '', clave: '', isNew: true };
            usersDatabase.unshift(draftUser);
            applyUserFilters();
        });
    }

    const categoriesSearchInput = document.getElementById('categoriesSearchInput');
    if (categoriesSearchInput) categoriesSearchInput.addEventListener('input', debounce(applyCategoryFilters, 180));

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const catNombre = document.getElementById('catNombre').value.trim();
            if (!catNombre) { showToast('Ingrese un nombre', 'error'); return; }
            const newId = categoriesDatabase.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
            const newCategoryItem = { id: newId, tipo: activeTemplateTab, categoria: catNombre };
            categoriesDatabase.unshift(newCategoryItem);
            saveCategoryToSupabase(newCategoryItem);
            categoryForm.reset();
            applyCategoryFilters();
            showToast('Categoría guardada', 'success');
        });
    }

    const subtabMacro = document.getElementById('subtabMacro');
    const subtabMicro = document.getElementById('subtabMicro');
    if (subtabMacro && subtabMicro) {
        subtabMacro.addEventListener('click', () => { activeTemplateTab = 'Macroscopica'; applyCategoryFilters(); });
        subtabMicro.addEventListener('click', () => { activeTemplateTab = 'Microscopica'; applyCategoryFilters(); });
    }

    // Inicializar el gestor de plantillas
    const tplSearch = document.getElementById('tplSearch');
    if (tplSearch) {
        tplSearch.addEventListener('input', debounce(() => {
            if (typeof window.renderTemplatesTreeView === 'function') {
                window.renderTemplatesTreeView();
            }
        }, 180));
    }

    // Poblar dropdown de categorías de plantillas
    if (typeof window.poblarCategoriasDropdown === 'function') {
        window.poblarCategoriasDropdown();
    }
    
    // Renderizar árbol de plantillas inicial
    if (typeof window.renderTemplatesTreeView === 'function') {
        window.renderTemplatesTreeView();
    }
}

function loadUsersData() {
    if (usingSupabase && supabase) {
        supabase.from('usuarios').select('*').then(({ data, error }) => {
            if (!error && data && data.length > 0) {
                data.forEach(dbUser => {
                    const local = usersDatabase.find(u => (u.usuario || '').toLowerCase() === (dbUser.usuario || '').toLowerCase());
                    if (local) {
                        if (dbUser.clave) local.clave = dbUser.clave;
                        if (dbUser.perfil) local.perfil = dbUser.perfil;
                        if (dbUser.nombres) local.nombres = dbUser.nombres;
                        if (dbUser.dni) local.dni = dbUser.dni;
                    } else {
                        usersDatabase.push({
                            id: dbUser.id,
                            perfil: dbUser.perfil || 'Usuario',
                            dni: dbUser.dni || '',
                            nombres: dbUser.nombres || '',
                            usuario: dbUser.usuario || '',
                            clave: dbUser.clave || ''
                        });
                    }
                });
            }
            applyUserFilters();
        }).catch(e => {
            console.warn("[Supabase] Aviso al cargar usuarios:", e);
            applyUserFilters();
        });
    } else {
        applyUserFilters();
    }
}

function applyUserFilters() {
        const query = (document.getElementById('usersSearchInput')?.value || '').trim().toLowerCase();

        filteredUsers = usersDatabase.filter(u => {
            const perfil = (u.perfil || '').toLowerCase();
            const dni = (u.dni || '').toString().toLowerCase();
            const nombres = (u.nombres || '').toLowerCase();
            const usuario = (u.usuario || '').toLowerCase();
            const clave = (u.clave || '').toLowerCase();

            return perfil.includes(query) ||
                dni.includes(query) ||
                nombres.includes(query) ||
                usuario.includes(query) ||
                clave.includes(query);
        });

        currentUserPage = 1;
        renderUsersTable();
    }

function renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const lengthVal = document.getElementById('usersPageLength')?.value || '10';
        userPageLength = lengthVal === 'all' ? filteredUsers.length : parseInt(lengthVal, 10);

        const totalRecords = filteredUsers.length;
        const totalPages = Math.ceil(totalRecords / userPageLength) || 1;

        if (currentUserPage > totalPages) {
            currentUserPage = totalPages;
        }

        const startIndex = (currentUserPage - 1) * userPageLength;
        const endIndex = Math.min(startIndex + userPageLength, totalRecords);

        const pageRecords = filteredUsers.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">
                        No se encontraron registros de usuarios.
                    </td>
                </tr>
            `;
            const infoDiv = document.getElementById('usersTableInfo');
            if (infoDiv) infoDiv.innerText = 'Mostrando 0 a 0 de 0 registros';
            renderUsersPagination(totalPages);
            return;
        }

        const fragment = document.createDocumentFragment();
        pageRecords.forEach((item, index) => {
            const rowIndex = startIndex + index + 1;
            const row = document.createElement('tr');

            const claveVal = (item.clave || '').trim();
            const hasClave = claveVal.length > 0;

            if (item.isNew || item.isEditing) {
                row.innerHTML = `
                    <td>${rowIndex}</td>
                    <td>
                        <select class="user-inline-perfil filter-input" style="padding:4px; width:100%;">
                            <option value="Administrador" ${item.perfil === 'Administrador' ? 'selected' : ''}>Administrador</option>
                            <option value="Usuario" ${item.perfil === 'Usuario' || item.perfil === 'Personal' ? 'selected' : ''}>Usuario</option>
                        </select>
                    </td>
                    <td><input type="text" class="user-inline-dni filter-input" value="${item.dni || ''}" style="padding:4px; width:100%;"></td>
                    <td><input type="text" class="user-inline-nombres filter-input" value="${item.nombres || ''}" style="padding:4px; width:100%;"></td>
                    <td><input type="text" class="user-inline-usuario filter-input" value="${item.usuario || ''}" style="padding:4px; width:100%;"></td>
                    <td><input type="password" class="user-inline-clave filter-input" value="${item.clave || ''}" style="padding:4px; width:100%;"></td>
                    <td class="action-cell">
                        <button type="button" class="action-btn save-btn" style="color: #38bdf8;" title="Guardar Cambios" onclick="saveInlineUser(${startIndex + index})">
                            <i class="fa-solid fa-floppy-disk"></i>
                        </button>
                    </td>
                    <td class="action-cell">
                        <button type="button" class="action-btn cancel-btn" style="color: #ef4444;" title="Cancelar" onclick="cancelInlineUser(${startIndex + index})">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </td>
                    <td class="action-cell"></td>
                `;
            } else {
                row.innerHTML = `
                    <td>${rowIndex}</td>
                    <td><strong>${item.perfil || '---'}</strong></td>
                    <td>${item.dni || '---'}</td>
                    <td><strong>${item.nombres || '---'}</strong></td>
                    <td>${item.usuario || '---'}</td>
                    <td>
                        <span id="user-clave-txt-${rowIndex}" style="font-family: monospace; font-weight: 600;">••••••••</span>
                        ${hasClave ? `<button type="button" class="action-btn" style="color: #38bdf8; margin-left: 8px; padding: 2px 6px;" title="Ver/Ocultar Clave" data-clave="${encodeURIComponent(claveVal)}" onclick="toggleUserClaveVisibility(${rowIndex}, decodeURIComponent(this.getAttribute('data-clave')))"><i class="fa-solid fa-eye" id="user-clave-icon-${rowIndex}"></i></button>` : '<span style="color:#64748b;">---</span>'}
                    </td>
                    <td class="action-cell">
                        <button type="button" class="action-btn edit-btn" title="Editar Usuario" onclick="handleUserAction('editar', ${startIndex + index})">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                    </td>
                    <td class="action-cell">
                        <button type="button" class="action-btn lock-btn" style="color: #475569;" title="Bloquear/Desbloquear Usuario" onclick="handleUserAction('bloquear', ${startIndex + index})">
                            <i class="fa-solid fa-lock"></i>
                        </button>
                    </td>
                    <td class="action-cell">
                        <button type="button" class="action-btn approve-btn" style="color: #22c55e;" title="Activar/Desactivar Usuario" onclick="handleUserAction('aprobar', ${startIndex + index})">
                            <i class="fa-solid fa-circle-check"></i>
                        </button>
                    </td>
                `;
            }
            fragment.appendChild(row);
        });
        tbody.appendChild(fragment);

        // Update info text

        const infoDiv = document.getElementById('usersTableInfo');
        if (infoDiv) {
            infoDiv.innerText = `Mostrando del ${startIndex + 1} al ${endIndex} de un total: ${totalRecords} registros`;
        }

        renderUsersPagination(totalPages);
    }

function renderUsersPagination(totalPages) {
        const container = document.getElementById('usersPagination');
        if (!container) return;

        container.innerHTML = '';

        // Anterior button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerText = 'Anterior';
        prevBtn.disabled = currentUserPage === 1;
        prevBtn.onclick = () => {
            if (currentUserPage > 1) {
                currentUserPage--;
                renderUsersTable();
            }
        };
        container.appendChild(prevBtn);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = `pagination-btn ${i === currentUserPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentUserPage = i;
                renderUsersTable();
            };
            container.appendChild(pageBtn);
        }

        // Siguiente button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerText = 'Siguiente';
        nextBtn.disabled = currentUserPage === totalPages;
        nextBtn.onclick = () => {
            if (currentUserPage < totalPages) {
                currentUserPage++;
                renderUsersTable();
            }
        };
        container.appendChild(nextBtn);
    }

function loadCategoriesData() {
        applyCategoryFilters();
    }

function applyCategoryFilters() {
        const query = (document.getElementById('categoriesSearchInput')?.value || '').trim().toLowerCase();

        filteredCategories = categoriesDatabase.filter(c => {
            const tipo = (c.tipo || '').toLowerCase();
            const cat = (c.categoria || '').toLowerCase();

            return tipo === activeTemplateTab.toLowerCase() && cat.includes(query);
        });

        renderCategoriesList();
    }

function renderCategoriesList() {
        const container = document.getElementById('categoriesListContainer');
        if (!container) return;

        container.innerHTML = '';

        if (filteredCategories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 0.9rem;">
                    No se encontraron categorías.
                </div>
            `;
            return;
        }

        filteredCategories.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-item-btn';
            btn.style.cssText = `
                display: flex; justify-content: space-between; align-items: center;
                width: 100%; padding: 12px 15px; background: white; border: 1px solid #e2e8f0;
                border-radius: 6px; cursor: pointer; transition: all 0.2s; text-align: left;
                color: #334155; font-weight: 500;
            `;

            // Hover effect can be added via class or inline events
            btn.onmouseenter = () => { if (!btn.classList.contains('active-cat')) btn.style.background = '#f8fafc'; };
            btn.onmouseleave = () => { if (!btn.classList.contains('active-cat')) btn.style.background = 'white'; };

            btn.innerHTML = `
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.categoria.toUpperCase()}</span>
                <div style="display: flex; gap: 8px;">
                    <i class="fa-solid fa-pencil" style="color: #64748b; font-size: 0.85rem;" title="Editar" onclick="event.stopPropagation(); handleCategoryAction('editar', ${index})"></i>
                    <i class="fa-solid fa-trash" style="color: #ef4444; font-size: 0.85rem;" title="Eliminar" onclick="event.stopPropagation(); handleCategoryAction('eliminar', ${index})"></i>
                </div>
            `;

            btn.onclick = () => {
                // Remove active styling from all
                document.querySelectorAll('.category-item-btn').forEach(b => {
                    b.classList.remove('active-cat');
                    b.style.background = 'white';
                    b.style.borderColor = '#e2e8f0';
                    b.style.color = '#334155';
                });

                // Add active styling
                btn.classList.add('active-cat');
                btn.style.background = '#f0f9ff';
                btn.style.borderColor = '#38bdf8';
                btn.style.color = '#0369a1';

                if (typeof window.renderTemplatesTreeView === 'function') {
                    window.renderTemplatesTreeView();
                }
            };

            container.appendChild(btn);
        });
    }

async function loadDoctorsData() {
        if (doctorsDatabase.length > 0) {
            applyDoctorFilters();
            return;
        }

        try {
            const response = await fetch('doctores.json');
            if (!response.ok) throw new Error('Error al leer doctores.json');
            const data = await response.json();
            doctorsDatabase.length = 0;
            data.forEach(d => doctorsDatabase.push(d));

            // Llenar el select de Med. Solicitante en el modal de registro de paciente
            populateModalDoctorsSelect();

            applyDoctorFilters();
        } catch (error) {
            console.error('Error al cargar la lista de doctores:', error);
            if (window.location.protocol === 'file:') {
                showToast('Aviso: Ejecute la app con un servidor local (ej: Live Server) para cargar la lista de doctores.json debido a restricciones del navegador.', 'info');
            } else {
                showToast('Error al cargar la lista de doctores desde el servidor.', 'error');
            }
        }
    }

function normalizeDoctorSearch(str) {
    if (!str) return '';
    return str.toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/casteñeda|casteneda/g, 'castaneda')
        .trim();
}

function applyDoctorFilters() {
    const rawQuery = (document.getElementById('doctorsSearchInput')?.value || '').trim();
    const cleanQuery = normalizeDoctorSearch(rawQuery);
    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

    filteredDoctors = doctorsDatabase.filter(d => {
        if (queryTokens.length === 0) return true;
        const haystack = normalizeDoctorSearch([
            d.doctor || '',
            d.tipo || '',
            d.provincia || '',
            d.especializacion || '',
            d.colegiado || '',
            d.telefono || '',
            d.correo || ''
        ].join(' '));

        return queryTokens.every(token => haystack.includes(token));
    });

    currentDoctorPage = 1;
    renderDoctorsTable();
}

function renderDoctorsTable() {
        const tbody = document.getElementById('doctorsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const lengthVal = document.getElementById('doctorsPageLength')?.value || '10';
        doctorPageLength = lengthVal === 'all' ? filteredDoctors.length : parseInt(lengthVal, 10);

        const totalRecords = filteredDoctors.length;
        const totalPages = Math.ceil(totalRecords / doctorPageLength) || 1;

        if (currentDoctorPage > totalPages) {
            currentDoctorPage = totalPages;
        }

        const startIndex = (currentDoctorPage - 1) * doctorPageLength;
        const endIndex = Math.min(startIndex + doctorPageLength, totalRecords);

        const pageRecords = filteredDoctors.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: 20px; color: #64748b;">
                        No se encontraron registros de doctores.
                    </td>
                </tr>
            `;
            renderDoctorsPagination(totalPages);
            return;
        }

        const fragment = document.createDocumentFragment();
        pageRecords.forEach((item, index) => {
            const rowIndex = startIndex + index + 1;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${rowIndex}</td>
                <td><strong>${item.tipo || '---'}</strong></td>
                <td>${item.provincia || '---'}</td>
                <td><strong>${item.doctor || '---'}</strong></td>
                <td>${item.especializacion || '---'}</td>
                <td>${item.colegiado || '---'}</td>
                <td>${item.telefono || '---'}</td>
                <td>${item.correo || '---'}</td>
                <td>${item.firma || '---'}</td>
                <td class="action-cell">
                    <button type="button" class="action-btn edit-btn" title="Editar Doctor" onclick="handleDoctorAction('editar', ${startIndex + index})">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn" style="color: #22c55e;" title="Validar Doctor" onclick="handleDoctorAction('validar', ${startIndex + index})">
                        <i class="fa-solid fa-circle-check"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn delete-btn" title="Eliminar Doctor" onclick="handleDoctorAction('eliminar', ${startIndex + index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            fragment.appendChild(row);
        });
        tbody.appendChild(fragment);

        renderDoctorsPagination(totalPages);
    }

function renderDoctorsPagination(totalPages) {
        const container = document.getElementById('doctorsPagination');
        if (!container) return;

        container.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentDoctorPage === 1;
        prevBtn.onclick = () => {
            if (currentDoctorPage > 1) {
                currentDoctorPage--;
                renderDoctorsTable();
            }
        };
        container.appendChild(prevBtn);

        // Page buttons
        let startPage = Math.max(1, currentDoctorPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = `pagination-btn ${i === currentDoctorPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentDoctorPage = i;
                renderDoctorsTable();
            };
            container.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentDoctorPage === totalPages;
        nextBtn.onclick = () => {
            if (currentDoctorPage < totalPages) {
                currentDoctorPage++;
                renderDoctorsTable();
            }
        };
        container.appendChild(nextBtn);
    }

export function openDoctorModal(index = null) {
    editingDoctorIndex = index;
    const titleEl = document.getElementById('doctorModalTitle');
    const doctorModalOverlay = document.getElementById('doctorModalOverlay');
    const doctorForm = document.getElementById('doctorForm');

    if (index !== null) {
        if (titleEl) titleEl.innerText = 'Editar Doctor';
        const doc = filteredDoctors[index];
        if (doc) {
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
            setVal('d_tipo', doc.tipo || 'DR. CLIENTE');
            setVal('d_provincia', doc.provincia || '');
            setVal('d_doctor', doc.doctor || '');
            setVal('d_especializacion', doc.especializacion || '');
            setVal('d_colegiado', doc.colegiado || '');
            setVal('d_telefono', doc.telefono || '');
            setVal('d_correo', doc.correo || '');
        }
    } else {
        if (titleEl) titleEl.innerText = 'Registrar Doctor';
        if (doctorForm) doctorForm.reset();
    }

    if (doctorModalOverlay) doctorModalOverlay.classList.add('active');
}

export function closeDoctorModal() {
    const doctorModalOverlay = document.getElementById('doctorModalOverlay');
    const doctorForm = document.getElementById('doctorForm');
    if (doctorModalOverlay) doctorModalOverlay.classList.remove('active');
    if (doctorForm) doctorForm.reset();
    editingDoctorIndex = null;
}

export function saveDoctorData() {
    const d_tipo = document.getElementById('d_tipo')?.value || 'DR. CLIENTE';
    const d_provincia = (document.getElementById('d_provincia')?.value || '').trim();
    const d_doctor = (document.getElementById('d_doctor')?.value || '').trim().toUpperCase();
    const d_especializacion = (document.getElementById('d_especializacion')?.value || '').trim();
    const d_colegiado = (document.getElementById('d_colegiado')?.value || '').trim();
    const d_telefono = (document.getElementById('d_telefono')?.value || '').trim();
    const d_correo = (document.getElementById('d_correo')?.value || '').trim();

    if (!d_doctor) {
        showToast('El nombre del doctor es obligatorio.', 'error');
        return;
    }

    if (editingDoctorIndex !== null && filteredDoctors[editingDoctorIndex]) {
        const docObj = filteredDoctors[editingDoctorIndex];
        const oldName = docObj.doctor;
        docObj.tipo = d_tipo;
        docObj.provincia = d_provincia;
        docObj.doctor = d_doctor;
        docObj.especializacion = d_especializacion;
        docObj.colegiado = d_colegiado;
        docObj.telefono = d_telefono;
        docObj.correo = d_correo;

        const dbDoc = doctorsDatabase.find(d => d.doctor === oldName);
        if (dbDoc) {
            Object.assign(dbDoc, docObj);
        }

        if (usingSupabase) {
            supabase
                .from('doctores')
                .update({
                    tipo: d_tipo,
                    provincia: d_provincia,
                    nombre: d_doctor,
                    especializacion: d_especializacion,
                    colegiado: d_colegiado,
                    telefono: d_telefono,
                    correo: d_correo
                })
                .eq('nombre', oldName)
                .then(({ error }) => {
                    if (error) console.error("Error al actualizar doctor en Supabase:", error);
                });
        }
        showToast(`Doctor "${d_doctor}" actualizado con éxito.`, 'success');
    } else {
        const newDoc = {
            tipo: d_tipo,
            provincia: d_provincia,
            doctor: d_doctor,
            especializacion: d_especializacion,
            colegiado: d_colegiado,
            telefono: d_telefono,
            correo: d_correo,
            firma: 'SIN FIRMA'
        };
        doctorsDatabase.unshift(newDoc);
        if (usingSupabase) {
            supabase
                .from('doctores')
                .insert([{
                    tipo: d_tipo,
                    provincia: d_provincia,
                    nombre: d_doctor,
                    especializacion: d_especializacion,
                    colegiado: d_colegiado,
                    telefono: d_telefono,
                    correo: d_correo
                }])
                .then(({ error }) => {
                    if (error) console.error("Error al registrar doctor en Supabase:", error);
                });
        }
        showToast(`Doctor "${d_doctor}" registrado con éxito.`, 'success');
    }

    closeDoctorModal();
    applyDoctorFilters();
    populateModalDoctorsSelect();
}

export function populateModalDoctorsSelect() {
        const datalist = document.getElementById('medicosList');
        const datalist2 = document.getElementById('medicosListEditor');
        const datalistFilter = document.getElementById('medicosDatalist');
        const datalistClinicas = document.getElementById('clinicasDatalistEditor');
        if (!datalist && !datalist2 && !datalistFilter && !datalistClinicas) return;

        if (datalist) datalist.innerHTML = '';
        if (datalist2) datalist2.innerHTML = '';
        if (datalistFilter) datalistFilter.innerHTML = '';
        if (datalistClinicas) datalistClinicas.innerHTML = '';

        // Obtener médicos únicos
        const doctorSet = new Set();
        doctorsDatabase.forEach(d => {
            if (d.doctor && d.doctor.trim() !== '' && d.doctor !== 'SIN DATOS' && !d.doctor.includes('---')) {
                doctorSet.add(d.doctor.trim().toUpperCase());
            }
        });
        if (window.patientDatabase) {
            window.patientDatabase.forEach(p => {
                if (p.medSolicitante && p.medSolicitante.trim() !== '' && !p.medSolicitante.includes('---')) {
                    doctorSet.add(p.medSolicitante.trim().toUpperCase());
                }
            });
        }

        const uniqueDoctors = Array.from(doctorSet).sort();

        uniqueDoctors.forEach(doc => {
            if (datalist) {
                const option = document.createElement('option');
                option.value = doc;
                datalist.appendChild(option);
            }
            if (datalist2) {
                const option2 = document.createElement('option');
                option2.value = doc;
                datalist2.appendChild(option2);
            }
            if (datalistFilter) {
                const optionFilter = document.createElement('option');
                optionFilter.value = doc;
                datalistFilter.appendChild(optionFilter);
            }
        });

        // Obtener clínicas únicas para autocompletado de Clínica
        const uniqueClinicas = new Set();
        uniqueClinicas.add("CLÍNICA SAN CLEMENTE");
        uniqueClinicas.add("CLÍNICA CARRIÓN");
        uniqueClinicas.add("CLINICA LA MUJER");
        uniqueClinicas.add("CLÍNICA ALFA PREVENIR");
        uniqueClinicas.add("CLÍNICA NO CONOCIDA");
        doctorsDatabase.forEach(d => {
            if (d.tipo === 'CLINICA' && d.doctor) uniqueClinicas.add(d.doctor.trim().toUpperCase());
        });
        if (window.patientDatabase) {
            window.patientDatabase.forEach(p => {
                if (p.clinica && p.clinica.trim() !== '') uniqueClinicas.add(p.clinica.trim().toUpperCase());
            });
        }

        if (datalistClinicas) {
            uniqueClinicas.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                datalistClinicas.appendChild(opt);
            });
        }
}

window.toggleUserClaveVisibility = function (rowIndex, realClave) {
    const txtEl = document.getElementById(`user-clave-txt-${rowIndex}`);
    const iconEl = document.getElementById(`user-clave-icon-${rowIndex}`);
    if (!txtEl || !iconEl) return;

    if (txtEl.innerText === '••••••••') {
        txtEl.innerText = realClave;
        txtEl.style.color = '#38bdf8';
        iconEl.className = 'fa-solid fa-eye-slash';
    } else {
        txtEl.innerText = '••••••••';
        txtEl.style.color = '';
        iconEl.className = 'fa-solid fa-eye';
    }
};

window.handleUserAction = function (action, globalIndex) {
        const user = filteredUsers[globalIndex];
        if (!user) return;

        if (action === 'editar') {
            if (usersDatabase.some(u => u.isNew || u.isEditing)) {
                showToast('Ya hay un usuario en edición o borrador. Guarde o cancele antes de continuar.', 'warning');
                return;
            }
            user.isEditing = true;
            renderUsersTable();
        } else if (action === 'bloquear') {
            showToast(`Usuario ${user.nombres} bloqueado/desbloqueado con éxito.`, 'success');
        } else if (action === 'aprobar') {
            showToast(`Estado de usuario ${user.nombres} cambiado.`, 'success');
        }
    };

window.handleCategoryAction = function (action, globalIndex) {
        const cat = filteredCategories[globalIndex];
        if (!cat) return;

        if (action === 'editar') {
            const newName = prompt('Editar nombre de la categoría:', cat.categoria);
            if (newName && newName.trim()) {
                const dbIndex = categoriesDatabase.findIndex(x => x.id === cat.id);
                if (dbIndex !== -1) {
                    categoriesDatabase[dbIndex].categoria = newName.trim();
                    saveCategoryToSupabase(categoriesDatabase[dbIndex]);
                    applyCategoryFilters();

                    // Actualizar el título si esta categoría está abierta
                    if (currentCategoryId === cat.id) {
                        if (typeof window.renderTemplatesTreeView === 'function') window.renderTemplatesTreeView();
                    }
                    showToast('Categoría modificada con éxito.', 'success');
                }
            }
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar la categoría "${cat.categoria}" y TODAS sus plantillas permanentemente?`)) {
                // Eliminar plantillas hijas en Supabase
                const childTemplates = templatesDatabase.filter(t => t.categoryId === cat.id);
                childTemplates.forEach(t => deleteTemplateFromSupabase(t.id));
                
                // Actualizar array en memoria
                const newTpls = templatesDatabase.filter(t => t.categoryId !== cat.id);
                templatesDatabase.length = 0;
                templatesDatabase.push(...newTpls);

                // Eliminar categoría en Supabase
                deleteCategoryFromSupabase(cat.id);
                const newCats = categoriesDatabase.filter(x => x.id !== cat.id);
                categoriesDatabase.length = 0;
                categoriesDatabase.push(...newCats);

                applyCategoryFilters();

                if (currentCategoryId === cat.id) {
                    if (typeof window.limpiarEditorPlantilla === 'function') {
                        window.limpiarEditorPlantilla();
                    }
                }

                showToast('Categoría y sus plantillas eliminadas con éxito.', 'success');
            }
        }
    };

window.handleDoctorAction = function (action, globalIndex) {
        const doctor = filteredDoctors[globalIndex];
        if (!doctor) return;

        if (action === 'editar') {
            openDoctorModal(globalIndex);
        } else if (action === 'validar') {
            showToast(`Doctor "${doctor.doctor}" validado correctamente.`, 'success');
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar de forma permanente al doctor "${doctor.doctor}"?`)) {
                const viejoNombre = doctor.doctor;
                // Eliminar de filteredDoctors
                filteredDoctors.splice(globalIndex, 1);
                // Eliminar de doctorsDatabase
                const dbIndex = doctorsDatabase.findIndex(d => d.doctor === viejoNombre);
                if (dbIndex !== -1) {
                    doctorsDatabase.splice(dbIndex, 1);
                }

                if (usingSupabase) {
                    supabase
                        .from('doctores')
                        .delete()
                        .eq('nombre', viejoNombre)
                        .then(({ error }) => {
                            if (error) console.error("Error al eliminar doctor en Supabase:", error);
                        });
                }
                showToast(`Doctor "${viejoNombre}" eliminado.`, 'error');
                renderDoctorsTable();
                populateModalDoctorsSelect();
            }
        }
    };

window.saveInlineUser = function (globalIndex) {
        const startIndex = (currentUserPage - 1) * userPageLength;
        const domIndex = globalIndex - startIndex;
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        const row = tbody.children[domIndex];
        if (!row) return;

        const perfil = row.querySelector('.user-inline-perfil').value;
        const dni = row.querySelector('.user-inline-dni').value.trim();
        const nombres = row.querySelector('.user-inline-nombres').value.trim().toUpperCase();
        const usuario = row.querySelector('.user-inline-usuario').value.trim();
        const clave = row.querySelector('.user-inline-clave').value.trim();

        if (!dni || !nombres || !usuario || !clave) {
            showToast('Por favor complete todos los campos del usuario.', 'error');
            return;
        }

        const dbPerfil = perfil === 'Usuario' ? 'Personal' : perfil;

        const user = filteredUsers[globalIndex];
        if (!user) return;

        const isCreating = user.isNew;

        user.perfil = dbPerfil;
        user.dni = dni;
        user.nombres = nombres;
        user.usuario = usuario;
        user.clave = clave;
        delete user.isNew;
        delete user.isEditing;

        if (usingSupabase) {
            if (isCreating) {
                supabase
                    .from('usuarios')
                    .insert([{
                        perfil: dbPerfil,
                        dni: dni,
                        nombres: nombres,
                        usuario: usuario,
                        clave: clave
                    }])
                    .then(({ error }) => {
                        if (error) {
                            console.error("Error al guardar usuario en Supabase:", error);
                            showToast("Error al guardar usuario en la nube.", "error");
                        } else {
                            showToast(`Usuario "${nombres}" guardado en la nube.`, 'success');
                        }
                    });
            } else {
                supabase
                    .from('usuarios')
                    .update({
                        perfil: dbPerfil,
                        dni: dni,
                        nombres: nombres,
                        usuario: usuario,
                        clave: clave
                    })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) {
                            console.error("Error al actualizar usuario en Supabase:", error);
                            showToast("Error al actualizar usuario en la nube.", "error");
                        } else {
                            showToast(`Usuario "${nombres}" actualizado en la nube.`, 'success');
                        }
                    });
            }
        }

        showToast(`Usuario "${nombres}" guardado con éxito.`, 'success');
        applyUserFilters();
    };

window.cancelInlineUser = function (globalIndex) {
        const user = filteredUsers[globalIndex];
        if (user) {
            if (user.isNew) {
                const dbIndex = usersDatabase.findIndex(u => u.id === user.id);
                if (dbIndex !== -1) {
                    usersDatabase.splice(dbIndex, 1);
                }
            } else {
                delete user.isEditing;
            }
        }
        applyUserFilters();
    };

window.openDoctorModal = openDoctorModal;
window.closeDoctorModal = closeDoctorModal;
window.saveDoctorData = saveDoctorData;


// ============================================================================
// LÓGICA DE VISUALIZACIÓN DE PLANTILLAS ESTÁTICAS DE LA WEB
// ============================================================================

function normalizeCategoryName(rawName) {
    if (!rawName) return 'OTROS';
    let name = rawName.trim().toUpperCase();
    if (name.includes('PROTOCOLO') || name.includes('SISTEMATIZADO')) {
        return 'PROTOCOLOS SISTEMATIZADOS';
    }
    name = name.replace(/^\((?:MACRO|MICRO)\)\s*/i, '').trim();
    return name || 'OTROS';
}

export function poblarCategoriasDropdown() {
    const select = document.getElementById('tplCategoria');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione especialidad...</option>';
    
    const cats = (categoriesDatabase && categoriesDatabase.length > 0) ? categoriesDatabase : (window.defaultCategories || defaultCategories || []);
    // Agrupar especialidades de forma única por nombre normalizado
    const uniqueNames = [...new Set(cats.map(c => normalizeCategoryName(c.categoria)))].sort();
    
    uniqueNames.forEach(catName => {
        const catObj = cats.find(c => normalizeCategoryName(c.categoria) === catName);
        if (catObj) {
            const option = document.createElement('option');
            option.value = catObj.id;
            option.textContent = catName;
            select.appendChild(option);
        }
    });
}

window.poblarCategoriasDropdown = poblarCategoriasDropdown;

window.renderTemplatesTreeView = function() {
    const treeView = document.getElementById('templatesTreeView');
    if (!treeView) return;
    treeView.innerHTML = '';

    const query = (document.getElementById('tplSearch')?.value || '').trim().toLowerCase();
    const cats = (categoriesDatabase && categoriesDatabase.length > 0) ? categoriesDatabase : (typeof defaultCategories !== 'undefined' ? defaultCategories : (window.defaultCategories || []));
    const tpls = (templatesDatabase && templatesDatabase.length > 0) ? templatesDatabase : (typeof defaultTemplates !== 'undefined' ? defaultTemplates : (window.defaultTemplates || []));
    
    // Normalizar y agrupar categorías de forma unificada (ej. PROTOCOLOS SISTEMATIZADOS única)
    const uniqueCatNames = [...new Set(cats.map(c => normalizeCategoryName(c.categoria)))].sort();
    let matchesFound = false;

    uniqueCatNames.forEach(catName => {
        // Encontrar todas las IDs de categorías que comparten este nombre canónico
        const matchingCats = cats.filter(c => normalizeCategoryName(c.categoria) === catName);
        const catIds = matchingCats.map(c => c.id);

        const isProtocolCategory = catName === 'PROTOCOLOS SISTEMATIZADOS';

        // Encontrar plantillas asociadas a estas categorías con tolerancia de tipo y captura de protocolos
        let categoryTemplates = [];
        if (isProtocolCategory) {
            const protocolIds = [1, 10, 11, 100, 101];
            categoryTemplates = tpls.filter(t => {
                const cid = Number(t.categoryId);
                const tit = (t.titulo || '').toUpperCase();
                return protocolIds.includes(cid) || tit.startsWith('CAP -') || tit.includes('PROTOCOLO');
            });
        } else {
            categoryTemplates = tpls.filter(t => catIds.map(String).includes(String(t.categoryId)));
        }

        // Deduplicar plantillas por título para vista limpia
        const seenTitles = new Set();
        categoryTemplates = categoryTemplates.filter(t => {
            const key = (t.titulo || '').trim().toUpperCase();
            if (seenTitles.has(key)) return false;
            seenTitles.add(key);
            return true;
        });

        // Filtrar plantillas según el buscador
        const filteredTemplates = categoryTemplates.filter(t => {
            if (!query) return true;
            return (t.titulo || '').toLowerCase().includes(query) ||
                   (t.macro || '').toLowerCase().includes(query) ||
                   (t.micro || '').toLowerCase().includes(query) ||
                   (t.diag || '').toLowerCase().includes(query);
        });

        // Si el buscador está activo, y ni el nombre de la categoría ni ninguna plantilla coinciden, no mostrar
        const catNameMatches = catName.toLowerCase().includes(query);
        if (query && !catNameMatches && filteredTemplates.length === 0) {
            return;
        }

        matchesFound = true;

        // Crear la cabecera de la categoría
        const catHeader = document.createElement('div');
        catHeader.className = 'tree-category';
        catHeader.style.cssText = `
            padding: 10px 15px;
            background: #1e293b;
            font-weight: bold;
            border-bottom: 1px solid #334155;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            color: #38bdf8;
            user-select: none;
        `;
        
        catHeader.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open" style="display:inline-block; vertical-align:middle;"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2A2 2 0 0 0 12 6h6a2 2 0 0 1 2 2v2"/></svg>
            ${catName}
        `;
        treeView.appendChild(catHeader);

        const itemsContainer = document.createElement('div');
        itemsContainer.style.display = 'block';
        treeView.appendChild(itemsContainer);

        catHeader.onclick = () => {
            const isCollapsed = itemsContainer.style.display === 'none';
            itemsContainer.style.display = isCollapsed ? 'block' : 'none';
            const folderSvg = catHeader.querySelector('svg');
            if (folderSvg) {
                if (isCollapsed) {
                    folderSvg.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open" style="display:inline-block; vertical-align:middle;"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2A2 2 0 0 0 12 6h6a2 2 0 0 1 2 2v2"/></svg>`;
                } else {
                    folderSvg.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder" style="display:inline-block; vertical-align:middle;"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
                }
            }
        };

        if (filteredTemplates.length === 0) {
            const noTplItem = document.createElement('div');
            noTplItem.style.cssText = `
                padding: 8px 15px 8px 30px;
                color: #64748b;
                font-style: italic;
                font-size: 0.85rem;
                background: #2b3548;
                border-bottom: 1px solid #1e293b;
            `;
            noTplItem.textContent = 'Sin plantillas';
            itemsContainer.appendChild(noTplItem);
        } else {
            filteredTemplates.forEach(tpl => {
                const tplItem = document.createElement('div');
                tplItem.className = 'tree-template-item';
                tplItem.setAttribute('data-id', tpl.id);
                tplItem.style.cssText = `
                    padding: 8px 15px 8px 30px;
                    border-bottom: 1px solid #1e293b;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    background: #2b3548;
                    transition: background 0.15s;
                `;

                tplItem.onmouseenter = () => {
                    if (!tplItem.classList.contains('active-item')) {
                        tplItem.style.background = '#374151';
                    }
                };
                tplItem.onmouseleave = () => {
                    if (!tplItem.classList.contains('active-item')) {
                        tplItem.style.background = '#2b3548';
                    }
                };

                tplItem.innerHTML = `
                    <span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text" style="display:inline-block; margin-right:6px; vertical-align:middle;"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                        ${tpl.titulo}
                    </span>
                    <span style="color: #64748b; font-size: 0.8rem; font-family: monospace;">ID: ${tpl.id}</span>
                `;

                tplItem.onclick = (e) => {
                    e.stopPropagation();
                    
                    document.querySelectorAll('.tree-template-item').forEach(el => {
                        el.classList.remove('active-item');
                        el.style.background = '#2b3548';
                        el.style.color = 'white';
                    });
                    
                    tplItem.classList.add('active-item');
                    tplItem.style.background = '#1e3a8a';
                    tplItem.style.color = '#38bdf8';

                    // Cargar valores al formulario (Solo Lectura)
                    document.getElementById('tplId').value = tpl.id || '';
                    document.getElementById('tplCategoria').value = tpl.categoryId || '';
                    document.getElementById('tplTitulo').value = tpl.titulo || '';
                    document.getElementById('tplMacro').value = tpl.macro || '';
                    document.getElementById('tplMicro').value = tpl.micro || '';
                    document.getElementById('tplDiag').value = tpl.diag || '';

                    // Forzar actualización inmediata del live preview en vivo
                    const inputEvent = new Event('input', { bubbles: true });
                    document.getElementById('tplMacro').dispatchEvent(inputEvent);
                    document.getElementById('tplMicro').dispatchEvent(inputEvent);
                    document.getElementById('tplDiag').dispatchEvent(inputEvent);
                    document.getElementById('tplTitulo').dispatchEvent(inputEvent);
                };

                itemsContainer.appendChild(tplItem);
            });
        }
    });

    if (!matchesFound) {
        treeView.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #64748b; font-style: italic;">
                No se encontraron plantillas.
            </div>
        `;
    }
};

window.guardarPlantilla = function() {
    const idVal = document.getElementById('tplId')?.value;
    const catId = parseInt(document.getElementById('tplCategoria')?.value);
    const titulo = (document.getElementById('tplTitulo')?.value || '').trim();
    const macro = (document.getElementById('tplMacro')?.value || '').trim();
    const micro = (document.getElementById('tplMicro')?.value || '').trim();
    const diag = (document.getElementById('tplDiag')?.value || '').trim();

    if (!catId || !titulo) {
        if (typeof showToast === 'function') showToast('Por favor seleccione una especialidad y escriba el nombre de la plantilla.', 'warning');
        return;
    }

    if (idVal) {
        const tpl = templatesDatabase.find(t => String(t.id) === String(idVal));
        if (tpl) {
            tpl.categoryId = catId;
            tpl.titulo = titulo;
            tpl.macro = macro;
            tpl.micro = micro;
            tpl.diag = diag;
            saveTemplateToSupabase(tpl);
            if (typeof showToast === 'function') showToast('Plantilla actualizada con éxito.', 'success');
        }
    } else {
        const maxId = templatesDatabase.length > 0 ? Math.max(...templatesDatabase.map(t => parseInt(t.id) || 0)) : 0;
        const newTemplate = {
            id: maxId + 1,
            categoryId: catId,
            titulo: titulo,
            macro: macro,
            micro: micro,
            diag: diag
        };
        templatesDatabase.push(newTemplate);
        saveTemplateToSupabase(newTemplate);
        document.getElementById('tplId').value = newTemplate.id;
        if (typeof showToast === 'function') showToast('Nueva plantilla guardada con éxito.', 'success');
    }

    if (typeof window.renderTemplatesTreeView === 'function') window.renderTemplatesTreeView();
};

window.limpiarEditorPlantilla = function() {
    const form = document.getElementById('templateForm');
    if (form) form.reset();
    const idEl = document.getElementById('tplId');
    if (idEl) idEl.value = '';
    
    document.querySelectorAll('.tree-template-item').forEach(el => {
        el.classList.remove('active-item');
        el.style.background = '#2b3548';
        el.style.color = 'white';
    });
};

window.eliminarPlantilla = function(id) {
    const targetId = id || document.getElementById('tplId')?.value;
    if (!targetId) {
        if (typeof showToast === 'function') showToast('Seleccione una plantilla del árbol para eliminar.', 'warning');
        return;
    }
    const idx = templatesDatabase.findIndex(t => String(t.id) === String(targetId));
    if (idx !== -1) {
        if (confirm(`¿Está seguro de eliminar la plantilla ID ${targetId}?`)) {
            const deletedId = templatesDatabase[idx].id;
            templatesDatabase.splice(idx, 1);
            deleteTemplateFromSupabase(deletedId);
            window.limpiarEditorPlantilla();
            if (typeof window.renderTemplatesTreeView === 'function') window.renderTemplatesTreeView();
            if (typeof showToast === 'function') showToast('Plantilla eliminada con éxito.', 'success');
        }
    }
};

window.sincronizarPlantillasCortana = function() {
    if (typeof showToast === 'function') showToast('Plantillas sincronizadas con la base de datos local y nube.', 'info');
};

window.crearNuevaEspecialidad = function() {
    const nombre = prompt("Ingrese el nombre de la nueva especialidad / categoría:");
    if (!nombre || !nombre.trim()) return;

    const cleanName = nombre.trim().toUpperCase();
    const existing = categoriesDatabase.find(c => (c.categoria || c.nombre || '').toUpperCase() === cleanName);
    if (existing) {
        if (typeof showToast === 'function') showToast('Esa especialidad ya existe.', 'warning');
        return;
    }

    const maxId = categoriesDatabase.length > 0 ? Math.max(...categoriesDatabase.map(c => c.id || 0)) : 0;
    const newCat = { id: maxId + 1, categoria: cleanName, tipo: 'Macroscopica' };
    categoriesDatabase.push(newCat);
    saveCategoryToSupabase(newCat);
    loadCategoriesData();
    if (typeof showToast === 'function') showToast(`Especialidad ${cleanName} creada con éxito.`, 'success');
};

// ==========================================================================
// MÓDULO DE CONTADURÍA (TABLA COMBINADA DE PACIENTES QUIRÚRGICOS Q Y CITOLOGÍA C)
// ==========================================================================
let filteredContaduria = [];
export let currentContaduriaPage = 1;
let contaduriaPageLength = 10;
export let currentContaduriaService = 'Q';

export function setContaduriaService(serviceId) {
    currentContaduriaService = serviceId;
    currentContaduriaPage = 1;
    applyContaduriaFilters();
}

export function loadContaduriaData() {
    applyContaduriaFilters();
}
window.loadContaduriaData = loadContaduriaData;
window.applyContaduriaFilters = applyContaduriaFilters;

export function applyContaduriaFilters() {
    const searchVal = (document.getElementById('contaduriaSearchInput')?.value || '').trim().toLowerCase();
    const rawData = window.patientDatabase || patientDatabase || [];

    filteredContaduria = rawData.filter(item => {
        let s = item.service;
        if (!s || (s !== 'C' && s !== 'Q' && s !== 'I')) {
            const combined = `${item.service || ''} ${item.especimen || ''} ${item.codAtencion || ''} ${item.cod_atencion || ''}`.toUpperCase();
            if (combined.includes('PAPANICOLAOU') || combined.includes('CITOLOG') || combined.includes('C-')) {
                s = 'C';
            } else if (combined.includes('INMUNO') || combined.includes('I-')) {
                s = 'I';
            } else {
                s = 'Q';
            }
            item.service = s;
        }

        if (s !== currentContaduriaService) return false;

        if (!searchVal) return true;
        const code = String(item.codAtencion || item.cod_atencion || '').toLowerCase();
        const dni = String(item.dni || '').toLowerCase();
        const name = String(item.paciente || `${item.apellidos || ''} ${item.nombres || ''}`).toLowerCase();
        const doc = String(item.medSolicitante || '').toLowerCase();
        const spec = String(item.especimen || '').toLowerCase();
        return code.includes(searchVal) || dni.includes(searchVal) || name.includes(searchVal) || doc.includes(searchVal) || spec.includes(searchVal);
    });

    if (typeof window.sortPatientArray === 'function') {
        window.sortPatientArray(filteredContaduria);
    }
    renderContaduriaTable();
}

export function renderContaduriaTable() {
    const tbody = document.getElementById('contaduriaTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const lengthSelect = document.getElementById('contaduriaPageLength');
    const selectedLen = lengthSelect ? lengthSelect.value : '10';
    contaduriaPageLength = selectedLen === 'all' ? filteredContaduria.length : parseInt(selectedLen) || 10;

    const totalRecords = filteredContaduria.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / (contaduriaPageLength || 1)));
    if (currentContaduriaPage > totalPages) currentContaduriaPage = totalPages;

    const start = (currentContaduriaPage - 1) * contaduriaPageLength;
    const end = Math.min(start + contaduriaPageLength, totalRecords);
    const pageRecords = filteredContaduria.slice(start, end);

    if (pageRecords.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 20px;">No se encontraron registros de contaduría.</td></tr>`;
    } else {
        const fragment = document.createDocumentFragment();
        pageRecords.forEach((item, index) => {
            const tr = document.createElement('tr');
            const rowNum = start + index + 1;

            const codeDisplay = item.codAtencion || item.cod_atencion || '---';
            const isCytology = codeDisplay.includes('C') || item.service === 'C';
            const badgeColor = isCytology ? '#ec4899' : '#0284c7';

            const costoVal = parseFloat(item.costo || 0).toFixed(2);
            const adelantoVal = parseFloat(item.adelanto || 0).toFixed(2);

            let statusBadge = '<span class="status-badge status-pending">PENDIENTE</span>';
            if (item.pagado) {
                statusBadge = '<span class="status-badge status-completed">PAGADO</span>';
            }

            let contaduriaPaciente = '';
            const cApellidos = (item.apellidos || '').trim();
            const cNombres = (item.nombres || '').trim();
            const cPaciente = (item.paciente || '').trim();

            if (cApellidos && cNombres) {
                contaduriaPaciente = `${cApellidos.toUpperCase()}, ${cNombres.toUpperCase()}`;
            } else if (cPaciente.includes(',')) {
                const parts = cPaciente.split(',');
                contaduriaPaciente = `${parts[0].trim().toUpperCase()}, ${parts[1].trim().toUpperCase()}`;
            } else if (cPaciente) {
                const words = cPaciente.split(/\s+/);
                if (words.length >= 3) {
                    const ap = words.slice(0, 2).join(' ');
                    const nom = words.slice(2).join(' ');
                    contaduriaPaciente = `${ap.toUpperCase()}, ${nom.toUpperCase()}`;
                } else {
                    contaduriaPaciente = cPaciente.toUpperCase();
                }
            } else {
                contaduriaPaciente = '---';
            }

            tr.innerHTML = `
                <td style="text-align: center;">${rowNum}</td>
                <td><strong>${codeDisplay}</strong></td>
                <td>${item.dni || '---'}</td>
                <td>${item.medSolicitante || '---'}</td>
                <td><strong>${contaduriaPaciente}</strong></td>
                <td>${item.especimen || '---'}</td>
                <td style="text-align: right; font-weight: bold; color: #22c55e;">S/ ${costoVal}</td>
                <td style="text-align: right; font-weight: 500;">S/ ${adelantoVal}</td>
                <td style="text-align: center;">${statusBadge}</td>
            `;
            fragment.appendChild(tr);
        });
        tbody.appendChild(fragment);
    }

    // Info footer
    const infoEl = document.getElementById('contaduriaTableInfo');
    if (infoEl) {
        const serviceText = currentContaduriaService === 'C' ? 'Servicio Citología (C)' : 'Servicio Muestra HE (Q)';
        infoEl.textContent = totalRecords === 0
            ? `Mostrando 0 registros (${serviceText})`
            : `Mostrando del ${start + 1} al ${end} de un total de ${totalRecords} registros (${serviceText})`;
    }

    // Render Pagination Buttons
    const pagEl = document.getElementById('contaduriaPagination');
    if (pagEl) {
        pagEl.innerHTML = '';
        if (totalPages > 1) {
            for (let p = 1; p <= totalPages; p++) {
                const btn = document.createElement('button');
                btn.className = `pagination-btn ${p === currentContaduriaPage ? 'active' : ''}`;
                btn.textContent = p;
                btn.onclick = () => {
                    currentContaduriaPage = p;
                    renderContaduriaTable();
                };
                pagEl.appendChild(btn);
            }
        }
    }
}

// =========================================================================
// SISTEMA DE RESPALDO Y RESTAURACIÓN EN 1 CLIC (JC PATH LAB)
// =========================================================================

export function exportDatabaseBackupJSON() {
    try {
        const patients = (typeof window !== 'undefined' && Array.isArray(window.patientDatabase)) ? window.patientDatabase : [];
        const templates = (typeof window !== 'undefined' && Array.isArray(window.templatesDatabase)) ? window.templatesDatabase : [];
        const categories = (typeof window !== 'undefined' && Array.isArray(window.categoriesDatabase)) ? window.categoriesDatabase : [];
        const doctors = (typeof window !== 'undefined' && Array.isArray(window.doctorsDatabase)) ? window.doctorsDatabase : [];

        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');

        const backupData = {
            appName: "JC PATH LAB - Archivo de Reportes",
            version: "v525.00",
            exportDate: now.toISOString(),
            displayDate: now.toLocaleString(),
            recordCount: patients.length,
            patients: patients,
            templates: templates,
            categories: categories,
            doctors: doctors
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respaldo_datos_jcpathlab_${dateStr}_${timeStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof window.showToast === 'function') {
            window.showToast(`💾 Respaldo JSON descargado con éxito (${patients.length} pacientes).`, 'success');
        }
    } catch (e) {
        console.error("Error al exportar respaldo JSON:", e);
        if (typeof window.showToast === 'function') {
            window.showToast(`❌ Error al generar respaldo: ${e.message}`, 'error');
        }
    }
}

export function importDatabaseBackupJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data || !Array.isArray(data.patients)) {
                throw new Error("El archivo no contiene un formato de respaldo válido (falta lista de pacientes).");
            }

            let importedCount = 0;
            if (typeof window.upsertAndSortPatient === 'function') {
                data.patients.forEach(p => {
                    if (p && (p.codAtencion || p.cod_atencion)) {
                        window.upsertAndSortPatient(p);
                        importedCount++;
                    }
                });
            } else if (Array.isArray(window.patientDatabase)) {
                data.patients.forEach(p => {
                    if (p && (p.codAtencion || p.cod_atencion)) {
                        const targetClean = String(p.codAtencion || p.cod_atencion).trim().toLowerCase().replace(/[-_\s]/g, '');
                        const idx = window.patientDatabase.findIndex(lp => String(lp.codAtencion || lp.cod_atencion).trim().toLowerCase().replace(/[-_\s]/g, '') === targetClean);
                        if (idx !== -1) {
                            Object.assign(window.patientDatabase[idx], p);
                        } else {
                            window.patientDatabase.push(p);
                        }
                        importedCount++;
                    }
                });
            }

            try {
                localStorage.setItem('patientDatabaseLocal', JSON.stringify(window.patientDatabase));
            } catch (err) {}

            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            }

            if (typeof window.showToast === 'function') {
                window.showToast(`✅ ${importedCount} pacientes restaurados y fusionados con éxito sin duplicados.`, 'success');
            }
        } catch (err) {
            console.error("Error al importar respaldo:", err);
            if (typeof window.showToast === 'function') {
                window.showToast(`❌ Error al importar archivo: ${err.message}`, 'error');
            }
        }
    };
    reader.readAsText(file);
}

export function exportMasterJsBackup() {
    try {
        const patients = (typeof window !== 'undefined' && Array.isArray(window.patientDatabase)) ? window.patientDatabase : [];
        const jsContent = `// real_supabase_backup.js\n// RESPALDO REAL DE LA BASE DE DATOS SUPABASE DE PROD\nif (typeof window !== 'undefined') {\n    window.REAL_SUPABASE_PATIENTS = ${JSON.stringify(patients, null, 2)};\n}\n`;
        const blob = new Blob([jsContent], { type: "application/javascript;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `real_supabase_backup.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof window.showToast === 'function') {
            window.showToast(`📦 Archivo maestro real_supabase_backup.js generado con éxito (${patients.length} expedientes).`, 'success');
        }
    } catch (e) {
        console.error("Error al exportar real_supabase_backup.js:", e);
    }
}

if (typeof window !== 'undefined') {
    window.initAdminUI = initAdminUI;
    window.exportDatabaseBackupJSON = exportDatabaseBackupJSON;
    window.importDatabaseBackupJSON = importDatabaseBackupJSON;
    window.exportMasterJsBackup = exportMasterJsBackup;
}


