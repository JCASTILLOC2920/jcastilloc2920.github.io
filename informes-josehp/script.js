// ==========================================================================
// CONTROLADOR LOGIC: JC PATH LAB - GESTOR DE PACIENTES (SUPABASE CLOUD)
// ==========================================================================

// --- CONFIGURACIÓN DE SUPABASE ---
// ¡ATENCIÓN COMANDANTE! Reemplaza estas dos variables con las tuyas desde supabase.com
const SUPABASE_URL = 'https://ckeerpvomxozaarjbauo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kFLVRMjYAJ5ITbyhpDd3tg_Mwbpt0L4';

// Inicializar Cliente
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Base de Datos Local en Memoria (Se sincroniza con Supabase)
let pacientes = [];

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

// Campos del Formulario
const mCodAtencion = document.getElementById("mCodAtencion");
const mDni = document.getElementById("mDni");
const mPaciente = document.getElementById("mPaciente");
const mMedSolicitante = document.getElementById("mMedSolicitante");
const mCosto = document.getElementById("mCosto");
const mAdelanto = document.getElementById("mAdelanto");
const mFechaEntrega = document.getElementById("mFechaEntrega");

// ==========================================================================
// 🚀 CONEXIÓN A LA NUBE (FETCH DATOS)
// ==========================================================================
async function cargarPacientes() {
    tableBody.innerHTML = `<tr><td colspan="12" class="text-center" style="padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Conectando al Servidor Médico...</td></tr>`;
    
    try {
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('fecEntrega', { ascending: false });
            
        if (error) throw error;
        
        pacientes = data || [];
        renderTable();
    } catch (err) {
        console.error("Error al cargar datos:", err);
        tableBody.innerHTML = `<tr><td colspan="12" class="text-center" style="padding: 2rem; color: var(--badge-danger);">Error de conexión a la Base de Datos. Verifica tu URL y Clave API de Supabase en script.js.</td></tr>`;
    }
}

// ==========================================================================
// 🛠️ RENDERIZAR TABLA DE PACIENTES
// ==========================================================================
function renderTable(dataFiltrada = null) {
    const listado = dataFiltrada ? dataFiltrada : pacientes.filter(p => p.tipo === pestañaActiva);
    tableBody.innerHTML = "";

    if (listado.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="12" class="text-center" style="padding: 2rem; color: var(--text-muted);">No se encontraron registros en la categoría seleccionada.</td></tr>`;
        return;
    }

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    listado.forEach((item, index) => {
        const tr = document.createElement("tr");

        const fechaEntrega = new Date(item.fecEntrega + "T00:00:00");
        const esRetrasado = fechaEntrega < hoy;
        const claseBadgeFecha = esRetrasado ? "badge-danger" : "badge-success";

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td style="font-weight: 600; color: var(--accent-color);">${item.codAtencion}</td>
            <td>${item.dni}</td>
            <td style="font-size: 0.8rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.medSolicitante}">${item.medSolicitante}</td>
            <td style="font-weight: 500;">${item.paciente}</td>
            <td><span class="badge badge-danger">S/. ${(item.costo || 0).toFixed(2)}</span></td>
            <td><span class="badge badge-danger">S/. ${(item.adelanto || 0).toFixed(2)}</span></td>
            <td><span class="badge badge-danger">S/. ${(item.resta || 0).toFixed(2)}</span></td>
            <td><span class="badge ${claseBadgeFecha}">${item.fecEntrega}</span></td>
            <td class="text-center">
                <button class="action-btn btn-edit" onclick="abrirEditarPaciente('${item.id}')" title="Editar"><i class="fa-solid fa-pencil"></i></button>
            </td>
            <td class="text-center">
                <button class="action-btn btn-view" onclick="verDetallesPaciente('${item.id}')" title="Descargar/Ver PDF"><i class="fa-solid fa-file-pdf"></i></button>
            </td>
            <td class="text-center">
                <button class="action-btn btn-delete" onclick="eliminarPaciente('${item.id}')" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================================================
// 🔍 FILTRAR Y BUSCAR PACIENTES (CLIENT SIDE)
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
        if (p.tipo !== pestañaActiva) return false;
        if (fInicio && new Date(p.fecEntrega) < new Date(fInicio)) return false;
        if (fFinal && new Date(p.fecEntrega) > new Date(fFinal)) return false;
        if (cod && !p.codAtencion.toLowerCase().includes(cod)) return false;
        if (nom && !p.paciente.toLowerCase().includes(nom)) return false;
        if (ape && !p.paciente.toLowerCase().includes(ape)) return false;
        if (documento && !p.dni.includes(documento)) return false;
        if (medico && !p.medSolicitante.toLowerCase().includes(medico)) return false;
        return true;
    });

    renderTable(filtrados);
});

searchForm.addEventListener("reset", () => setTimeout(() => renderTable(), 10));

// ==========================================================================
// 🎛️ NAVEGACIÓN POR PESTAÑAS
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

toggleSidebarBtn.addEventListener("click", () => sidebar.classList.toggle("collapsed"));

// ==========================================================================
// 💾 GESTIÓN DEL MODAL Y BASE DE DATOS (CREATE / UPDATE)
// ==========================================================================
function abrirModal(modo = "crear") {
    patientModal.classList.add("active");
    if (modo === "crear") {
        modalTitle.innerText = "Registrar Nuevo Paciente";
        modalForm.reset();
        pacienteEnEdicionId = null;
        const prefijo = pestañaActiva === "HE" ? "26Q-" : (pestañaActiva === "IHC" ? "26I-" : "26C-");
        mCodAtencion.value = `${prefijo}${Math.floor(Math.random() * 1000)}`;
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

modalForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const costo = parseFloat(mCosto.value) || 0;
    const adelanto = parseFloat(mAdelanto.value) || 0;
    const resta = Math.max(0, costo - adelanto);

    const payload = {
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

    try {
        if (pacienteEnEdicionId === null) {
            // INSERTAR
            const { error } = await supabase.from('pacientes').insert([payload]);
            if (error) throw error;
            alert("Paciente registrado en la nube con éxito.");
        } else {
            // ACTUALIZAR
            const { error } = await supabase.from('pacientes').update(payload).eq('id', pacienteEnEdicionId);
            if (error) throw error;
            alert("Datos actualizados en la nube.");
        }
        
        cerrarModal();
        await cargarPacientes(); // Refrescar lista

    } catch (err) {
        console.error(err);
        alert("Error al guardar en Supabase. Revisa la consola para más detalles.");
    }
});

// ==========================================================================
// 🗑️ ACCIONES GLOBALES
// ==========================================================================
window.abrirEditarPaciente = function (idStr) {
    // Supabase returns UUIDs as strings usually, or IDs as numbers.
    const p = pacientes.find(item => String(item.id) === String(idStr));
    if (!p) return;

    pacienteEnEdicionId = p.id;
    modalTitle.innerText = `Editar Paciente - ${p.codAtencion}`;

    mCodAtencion.value = p.codAtencion;
    mDni.value = p.dni;
    mPaciente.value = p.paciente;
    mMedSolicitante.value = p.medSolicitante;
    mCosto.value = p.costo || 0;
    mAdelanto.value = p.adelanto || 0;
    mFechaEntrega.value = p.fecEntrega;

    abrirModal("editar");
};

window.eliminarPaciente = async function (idStr) {
    const p = pacientes.find(item => String(item.id) === String(idStr));
    if (!p) return;

    if (confirm(`¿Eliminar permanentemente a ${p.paciente} de la nube?`)) {
        try {
            const { error } = await supabase.from('pacientes').delete().eq('id', p.id);
            if (error) throw error;
            await cargarPacientes();
        } catch (err) {
            console.error(err);
            alert("Error eliminando registro.");
        }
    }
};

window.verDetallesPaciente = function (idStr) {
    const p = pacientes.find(item => String(item.id) === String(idStr));
    if (!p) return;

    alert(`Detalles del Registro Clínico:\n
Código: ${p.codAtencion}
DNI: ${p.dni}
Paciente: ${p.paciente}
Médico Solicitante: ${p.medSolicitante}\n
* En una fase posterior, este botón descargará automáticamente el PDF que hayas subido desde tu laboratorio local.`);
};

// Iniciar app
document.addEventListener("DOMContentLoaded", () => {
    cargarPacientes();
});
