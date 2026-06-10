// ==========================================================================
// CONTROLADOR LOGIC: JC PATH LAB - GESTOR DE PACIENTES
// ==========================================================================

// Base de Datos en Memoria (Inicializada con registros del Mock de la Imagen)
let pacientes = [
    { id: 1, codAtencion: "26Q-188", dni: "09865594", medSolicitante: "Dr. Juan Jesús Marreros Lloclla", paciente: "PAULINA, GIRÓN VEGA", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-15", tipo: "HE" },
    { id: 2, codAtencion: "26Q-187", dni: "007349667", medSolicitante: "Dr. Juan Jesús Marreros Lloclla", paciente: "FRANCIS DELIMAR, PINEDA ESCALONA", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-15", tipo: "HE" },
    { id: 3, codAtencion: "26Q-186", dni: "44271446", medSolicitante: "DRA PÉREZ ROSALES CLAUDIA CAMILA", paciente: "HILDA, NAVARRO CANCHARI", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-15", tipo: "HE" },
    { id: 4, codAtencion: "26Q-185", dni: "0", medSolicitante: "DR JUAN CARLOS SEVILLA LLORCA", paciente: "IAN, CHUQUILLON PENOLFO", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-15", tipo: "HE" },
    { id: 5, codAtencion: "26Q-184", dni: "40784921", medSolicitante: "DR. CANCHARI VILLAR STEVE PERCY", paciente: "IVINOVITH, HUCHON ZAGA", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-15", tipo: "HE" },
    { id: 6, codAtencion: "26Q-181", dni: "80504246", medSolicitante: "DRA. KELLY CANTARO SILVA", paciente: "EDITH, ALVARADO", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-15", tipo: "HE" },
    { id: 7, codAtencion: "26Q-180", dni: "0", medSolicitante: "DRA. LAURA SAIRE BOCANGEL", paciente: "MARTHA, CAMPOS LIZAÑA DE QUISPE", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-15", tipo: "HE" },
    { id: 8, codAtencion: "26Q-179", dni: "20101969", medSolicitante: "DR. RUIZ RAYA KARIM", paciente: "ROCIO SOLEDAD, CONDOR MATOS", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-13", tipo: "HE" },
    { id: 9, codAtencion: "26Q-178", dni: "0", medSolicitante: "--------------------", paciente: "EOLTH, GOMEZ", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    { id: 10, codAtencion: "26Q-177", dni: "0", medSolicitante: "--------------------", paciente: "EOLTH, GOMEZ", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    { id: 11, codAtencion: "26Q-176", dni: "0", medSolicitante: "--------------------", paciente: "FOLTH, GOMEZ", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    { id: 12, codAtencion: "26Q-175", dni: "0", medSolicitante: "--------------------", paciente: "GLADYS ROXANA, URIBE DELGADO", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    { id: 13, codAtencion: "26Q-174", dni: "0", medSolicitante: "--------------------", paciente: "GLADYS ROXANA, URIBE DELGADO", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    { id: 14, codAtencion: "26Q-173", dni: "48865824", medSolicitante: "DRA. KELLY CANTARO SILVA", paciente: "DIANA CAROLINA, CARRILLO CANCHUMANTA", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    { id: 15, codAtencion: "26Q-172", dni: "48865824", medSolicitante: "DRA. KELLY CANTARO SILVA", paciente: "DIANA CAROLINA, CARRILLO CANCHUMANTA", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    { id: 16, codAtencion: "26Q-171", dni: "73368007", medSolicitante: "DR. JAIME VICTOR BECERRA ULFE", paciente: "YORDI KEVIN, ALVARADO ENHORABUENA", costo: 0.00, adelanto: 0.00, resta: 0.00, fecEntrega: "2026-06-09", tipo: "HE" },
    
    // Mocks adicionales para pruebas de Inmunohistoquímica y Citología
    { id: 17, codAtencion: "26I-054", dni: "74883921", medSolicitante: "Dr. Carlos Valdivia", paciente: "MIGUEL ANGEL, ROJAS LUZON", costo: 150.00, adelanto: 100.00, resta: 50.00, fecEntrega: "2026-06-18", tipo: "IHC" },
    { id: 18, codAtencion: "26C-122", dni: "42119023", medSolicitante: "Dra. Ana Maria Estrada", paciente: "CARLA SOFIA, PEZO VALLE", costo: 50.00, adelanto: 50.00, resta: 0.00, fecEntrega: "2026-06-12", tipo: "CITO" }
];

// Estado de la Pestaña Activa
let pestañaActiva = "HE";
let pacienteEnEdicionId = null;

// Elementos DOM
const tableBody = document.getElementById("patientTableBody");
const searchForm = document.getElementById("searchForm");
const tabLinks = document.querySelectorAll(".tab-link");
const sidebar = document.getElementById("sidebarMenu");
const toggleSidebarBtn = document.getElementById("toggleSidebar");

// Elementos del Modal
const patientModal = document.getElementById("patientModal");
const openModalBtn = document.getElementById("addPatientBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const modalForm = document.getElementById("modalForm");
const modalTitle = document.getElementById("modalTitle");

// Campos del Formulario del Modal
const mCodAtencion = document.getElementById("mCodAtencion");
const mDni = document.getElementById("mDni");
const mPaciente = document.getElementById("mPaciente");
const mMedSolicitante = document.getElementById("mMedSolicitante");
const mCosto = document.getElementById("mCosto");
const mAdelanto = document.getElementById("mAdelanto");
const mFechaEntrega = document.getElementById("mFechaEntrega");

// ==========================================================================
// 🛠️ RENDERIZAR TABLA DE PACIENTES
// ==========================================================================
function renderTable(dataFiltrada = null) {
    const listado = dataFiltrada ? dataFiltrada : pacientes.filter(p => p.tipo === pestañaActiva);
    tableBody.innerHTML = "";

    if (listado.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="12" class="text-center" style="padding: 2rem; color: var(--text-muted);">No se encontraron registros de pacientes.</td></tr>`;
        return;
    }

    const hoy = new Date();
    // Normalizar hora de hoy para comparación de fechas
    hoy.setHours(0,0,0,0);

    listado.forEach((item, index) => {
        const tr = document.createElement("tr");

        // Determinar color de celda de Fecha de Entrega
        const fechaEntrega = new Date(item.fecEntrega + "T00:00:00");
        const esRetrasado = fechaEntrega < hoy;
        const claseBadgeFecha = esRetrasado ? "badge-danger" : "badge-success";

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td style="font-weight: 600; color: var(--accent-color);">${item.codAtencion}</td>
            <td>${item.dni}</td>
            <td style="font-size: 0.8rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.medSolicitante}">${item.medSolicitante}</td>
            <td style="font-weight: 500;">${item.paciente}</td>
            <td><span class="badge badge-danger">S/. ${item.costo.toFixed(2)}</span></td>
            <td><span class="badge badge-danger">S/. ${item.adelanto.toFixed(2)}</span></td>
            <td><span class="badge badge-danger">S/. ${item.resta.toFixed(2)}</span></td>
            <td><span class="badge ${claseBadgeFecha}">${item.fecEntrega}</span></td>
            <td class="text-center">
                <button class="action-btn btn-edit" onclick="abrirEditarPaciente(${item.id})" title="Editar"><i class="fa-solid fa-pencil"></i></button>
            </td>
            <td class="text-center">
                <button class="action-btn btn-view" onclick="verDetallesPaciente(${item.id})" title="Ver Detalles"><i class="fa-solid fa-magnifying-glass"></i></button>
            </td>
            <td class="text-center">
                <button class="action-btn btn-delete" onclick="eliminarPaciente(${item.id})" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================================================
// 🔍 FILTRAR Y BUSCAR PACIENTES
// ==========================================================================
searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fInicio = document.getElementById("fecInicio").value;
    const fFinal = document.getElementById("fecFinal").value;
    const cod = document.getElementById("codAtencion").value.toLowerCase().trim();
    const nom = document.getElementById("nomPaciente").value.toLowerCase().trim();
    const ape = document.getElementById("apePaciente").value.toLowerCase().trim();
    const documento = document.getElementById("dni").value.trim();
    const medico = document.getElementById("medSolicitante").value.toLowerCase().trim();

    const filtrados = pacientes.filter(p => {
        // Filtro estricto por categoría activa en la vista
        if (p.tipo !== pestañaActiva) return false;

        // Filtro por Fecha de Entrega
        if (fInicio && new Date(p.fecEntrega) < new Date(fInicio)) return false;
        if (fFinal && new Date(p.fecEntrega) > new Date(fFinal)) return false;

        // Filtros por campos de texto
        if (cod && !p.codAtencion.toLowerCase().includes(cod)) return false;
        if (nom && !p.paciente.toLowerCase().includes(nom)) return false;
        if (ape && !p.paciente.toLowerCase().includes(ape)) return false;
        if (documento && !p.dni.includes(documento)) return false;
        if (medico && !p.medSolicitante.toLowerCase().includes(medico)) return false;

        return true;
    });

    renderTable(filtrados);
});

// Resetear búsqueda al presionar "Reset" en el formulario si se tuviera o al limpiar campos
searchForm.addEventListener("reset", () => {
    setTimeout(() => renderTable(), 10);
});

// ==========================================================================
// 🎛️ NAVEGACIÓN POR PESTAÑAS (TABS)
// ==========================================================================
tabLinks.forEach(tab => {
    tab.addEventListener("click", function () {
        tabLinks.forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        pestañaActiva = this.getAttribute("data-tab");
        searchForm.reset();
        renderTable();
    });
});

// ==========================================================================
// 🧭 CONTROL SIDEBAR (PLEGAR/DESPLEGAR)
// ==========================================================================
toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// ==========================================================================
// 💾 GESTIÓN DEL MODAL (CREAR / EDITAR REGISTROS)
// ==========================================================================
function abrirModal(modo = "crear") {
    patientModal.classList.add("active");
    if (modo === "crear") {
        modalTitle.innerText = "Registrar Nuevo Paciente";
        modalForm.reset();
        pacienteEnEdicionId = null;
        
        // Autocompletar código sugerido según servicio
        const prefijo = pestañaActiva === "HE" ? "26Q-" : (pestañaActiva === "IHC" ? "26I-" : "26C-");
        const maxId = pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1;
        mCodAtencion.value = `${prefijo}${100 + maxId}`;
    }
}

function cerrarModal() {
    patientModal.classList.remove("active");
    modalForm.reset();
    pacienteEnEdicionId = null;
}

openModalBtn.addEventListener("click", () => abrirModal("crear"));
closeModalBtn.addEventListener("click", cerrarModal);
cancelModalBtn.addEventListener("click", cerrarModal);

// Cerrar al hacer click fuera de la tarjeta modal
patientModal.addEventListener("click", (e) => {
    if (e.target === patientModal) cerrarModal();
});

// Enviar Formulario del Modal (Guardar)
modalForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const costo = parseFloat(mCosto.value) || 0;
    const adelanto = parseFloat(mAdelanto.value) || 0;
    const resta = Math.max(0, costo - adelanto);

    if (pacienteEnEdicionId === null) {
        // Registrar Nuevo Paciente
        const nuevoPaciente = {
            id: pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1,
            codAtencion: mCodAtencion.value.trim(),
            dni: mDni.value.trim(),
            medSolicitante: mMedSolicitante.value.trim(),
            paciente: mPaciente.value.trim().toUpperCase(),
            costo: costo,
            adelanto: adelanto,
            resta: resta,
            fecEntrega: mFechaEntrega.value,
            tipo: pestañaActiva
        };
        pacientes.unshift(nuevoPaciente); // Agregar al inicio de la lista
        alert("Paciente registrado con éxito.");
    } else {
        // Guardar Cambios en Edición
        const idx = pacientes.findIndex(p => p.id === pacienteEnEdicionId);
        if (idx !== -1) {
            pacientes[idx].codAtencion = mCodAtencion.value.trim();
            pacientes[idx].dni = mDni.value.trim();
            pacientes[idx].medSolicitante = mMedSolicitante.value.trim();
            pacientes[idx].paciente = mPaciente.value.trim().toUpperCase();
            pacientes[idx].costo = costo;
            pacientes[idx].adelanto = adelanto;
            pacientes[idx].resta = resta;
            pacientes[idx].fecEntrega = mFechaEntrega.value;
        }
        alert("Datos del paciente actualizados.");
    }

    cerrarModal();
    renderTable();
});

// Función para abrir modal en modo Edición
window.abrirEditarPaciente = function (id) {
    const p = pacientes.find(item => item.id === id);
    if (!p) return;

    pacienteEnEdicionId = id;
    modalTitle.innerText = `Editar Paciente - ${p.codAtencion}`;

    mCodAtencion.value = p.codAtencion;
    mDni.value = p.dni;
    mPaciente.value = p.paciente;
    mMedSolicitante.value = p.medSolicitante;
    mCosto.value = p.costo;
    mAdelanto.value = p.adelanto;
    mFechaEntrega.value = p.fecEntrega;

    abrirModal("editar");
};

// ==========================================================================
// 🗑️ ACCIONES DE LA TABLA (ELIMINAR / VER DETALLES)
// ==========================================================================
window.eliminarPaciente = function (id) {
    const p = pacientes.find(item => item.id === id);
    if (!p) return;

    if (confirm(`¿Está seguro de eliminar el registro de ${p.paciente} (${p.codAtencion})?`)) {
        pacientes = pacientes.filter(item => item.id !== id);
        renderTable();
    }
};

window.verDetallesPaciente = function (id) {
    const p = pacientes.find(item => item.id === id);
    if (!p) return;

    alert(`Detalles del Registro Clínico:\n
Código: ${p.codAtencion}
DNI: ${p.dni}
Paciente: ${p.paciente}
Médico Solicitante: ${p.medSolicitante}
Costo total: S/. ${p.costo.toFixed(2)}
Adelanto pagado: S/. ${p.adelanto.toFixed(2)}
Saldo restante: S/. ${p.resta.toFixed(2)}
Fecha límite de entrega: ${p.fecEntrega}
Categoría de Estudio: ${p.tipo === "HE" ? "Muestra HE (Q)" : (p.tipo === "IHC" ? "Inmunohistoquímica (I)" : "Citología (C)")}`);
};

// ==========================================================================
// 🚀 INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    renderTable();
});
