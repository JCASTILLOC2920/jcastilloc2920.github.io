// ==============================================================================
// MÓDULO AUTÓNOMO DE BOLETAS Y CONSTANCIAS DE PAGO A EMPRESAS (JC PATH LAB)
// Arquitectura: Local-First Permanente + Respaldo en Supabase (Cero Pérdidas)
// ==============================================================================

const STORAGE_KEY_EMPRESAS = 'jcpath_empresas_catalog';
const STORAGE_KEY_BOLETAS = 'jcpath_boletas_history';

// Empresas iniciales por defecto si la base de datos está completamente vacía
const DEFAULT_EMPRESAS = [
    {
        id: 'emp_01',
        razonSocial: 'CLÍNICA SAN CLEMENTE S.A.C.',
        ruc: '20512345678',
        direccion: 'Av. Principal 123, Ica',
        telefono: '956123456',
        contacto: 'Administración / Facturación',
        createdAt: new Date().toISOString()
    },
    {
        id: 'emp_carrion_ventanilla',
        razonSocial: 'EMP. DE SERV. DE SALUD POLICL. CARRION S.A. (CLÍNICA CARRIÓN)',
        ruc: '20419815552',
        direccion: 'Av. Pedro Beltrán Nro. 175, Urb. Ciudad Satélite (Fte. Comisaría), Ventanilla, Callao',
        telefono: '5531610',
        contacto: 'Administración / Facturación',
        createdAt: new Date().toISOString()
    }
];

// Configuración del Laboratorio Emisor
const LAB_INFO = {
    nombre: 'JC PATH LAB | ANATOMÍA PATOLÓGICA',
    subtitulo: 'DIAGNÓSTICO HISTOPATOLÓGICO, CITOLÓGICO E INMUNOHISTOQUÍMICA',
    director: 'Dirección Médica Especializada | Dr. Juan Castillo',
    ruc: '10458923412',
    telefono: '956 789 012',
    direccionLocal: 'Av. Cutervo N° 123 (Frente al Hospital Regional), Ica - Perú'
};

// ==============================================================================
// 1. CAPA DE PERSISTENCIA LOCAL BLINDADA
// ==============================================================================

export function getStoredEmpresas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_EMPRESAS);
        let list = [];
        if (!raw) {
            list = [...DEFAULT_EMPRESAS];
            localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(list));
            return list;
        }
        const data = JSON.parse(raw);
        list = Array.isArray(data) ? data : [...DEFAULT_EMPRESAS];

        // Auto-verificar que las empresas esenciales como Clínica Carrión siempre existan en la lista
        DEFAULT_EMPRESAS.forEach(def => {
            const exists = list.some(item => item.ruc === def.ruc || (item.razonSocial && item.razonSocial.includes('CARRION')));
            if (!exists) {
                list.push(def);
                saveStoredEmpresas(list);
            }
        });

        return list;
    } catch (e) {
        console.warn('[BoletasManager] Error al leer empresas locales:', e);
        return DEFAULT_EMPRESAS;
    }
}

export function saveStoredEmpresas(empresas) {
    try {
        localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(empresas));
        syncEmpresaToSupabase(empresas);
    } catch (e) {
        console.error('[BoletasManager] Error al guardar empresas locales:', e);
    }
}

export function getStoredBoletas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_BOLETAS);
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.warn('[BoletasManager] Error al leer boletas locales:', e);
        return [];
    }
}

export function saveStoredBoletas(boletas) {
    try {
        localStorage.setItem(STORAGE_KEY_BOLETAS, JSON.stringify(boletas));
        syncBoletasToSupabase(boletas);
    } catch (e) {
        console.error('[BoletasManager] Error al guardar boletas locales:', e);
    }
}

async function syncEmpresaToSupabase(empresas) {
    try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            await window.supabaseClient.from('empresas_boletas').upsert(empresas, { onConflict: 'ruc' });
        }
    } catch (e) {}
}

async function syncBoletasToSupabase(boletas) {
    try {
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            await window.supabaseClient.from('historial_boletas').upsert(boletas, { onConflict: 'codigo' });
        }
    } catch (e) {}
}

// ==============================================================================
// 2. GESTIÓN DE CÓDIGO CORRELATIVO SEGURO (Anti-Colisiones)
// ==============================================================================

export function generateNextBoletaCode() {
    const boletas = getStoredBoletas();
    const currentYear = new Date().getFullYear();
    const prefix = `BOL-${currentYear}-`;
    
    let maxNum = 0;
    boletas.forEach(b => {
        if (b.codigo && b.codigo.startsWith(prefix)) {
            const numPart = parseInt(b.codigo.replace(prefix, ''), 10);
            if (!isNaN(numPart) && numPart > maxNum) {
                maxNum = numPart;
            }
        }
    });

    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}

// ==============================================================================
// 3. GENERADOR PROFESIONAL DE CONSTANCIA / BOLETA EN PDF CON DESGLOSE COMPLETO
// ==============================================================================

export function generateBoletaPDF(boletaData) {
    const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);
    if (!jsPDFClass) {
        alert('Cargando motor de generación PDF... Por favor intente en un momento.');
        return;
    }

    const doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [15, 23, 42];     // #0f172a
    const accentColor = [2, 132, 199];     // #0284c7
    const textColor = [30, 41, 59];        // #1e293b
    const lightBg = [248, 250, 252];       // #f8fafc

    // 1. Cabecera con Membrete Oficial del Laboratorio
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 44, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(LAB_INFO.nombre, 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(LAB_INFO.subtitulo, 14, 23);
    doc.text(LAB_INFO.director, 14, 29);
    doc.text(`Dirección del Local: ${LAB_INFO.direccionLocal}`, 14, 35);
    doc.text(`RUC: ${LAB_INFO.ruc} | Teléfono: ${LAB_INFO.telefono}`, 14, 40);

    // Recuadro de la Constancia (Esquina Superior Derecha)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(138, 7, 58, 30, 2, 2, 'FD');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.roundedRect(138, 7, 58, 30, 2, 2, 'S');

    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('CONSTANCIA DE SERVICIO', 167, 14, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setTextColor(...accentColor);
    doc.text('LIQUIDACIÓN TÉCNICA CLÍNICA', 167, 19, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text(boletaData.codigo, 167, 29, { align: 'center' });

    // 2. Datos de la Entidad / Clínica Facturada
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, 49, 182, 34, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...accentColor);
    doc.text('DATOS DE LA EMPRESA / INSTITUCIÓN CLIENTE:', 18, 55);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text('RAZÓN SOCIAL:', 18, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(boletaData.razonSocial || 'NO ESPECIFICADO', 46, 62);

    doc.setFont('helvetica', 'bold');
    doc.text('RUC / DNI:', 18, 69);
    doc.setFont('helvetica', 'normal');
    doc.text(boletaData.ruc || '-', 46, 69);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA EMISIÓN:', 125, 69);
    doc.setFont('helvetica', 'normal');
    const fechaFormat = boletaData.fecha ? new Date(boletaData.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('es-PE');
    doc.text(fechaFormat, 158, 69);

    doc.setFont('helvetica', 'bold');
    doc.text('DIRECCIÓN:', 18, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(boletaData.direccion || 'Domicilio fiscal convenido', 46, 76);

    // 3. Tabla Desglosada con Cada Muestra Individual
    let currentY = 89;

    doc.setFillColor(...primaryColor);
    doc.rect(14, currentY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ITEM', 18, currentY + 5.5);
    doc.text('DESCRIPCIÓN DE LA MUESTRA / ESTUDIO PATOLÓGICO', 35, currentY + 5.5);
    doc.text('CANTIDAD', 135, currentY + 5.5, { align: 'center' });
    doc.text('PRECIO UNIT.', 160, currentY + 5.5, { align: 'right' });
    doc.text('SUBTOTAL (S/)', 190, currentY + 5.5, { align: 'right' });

    currentY += 8;

    const muestras = Array.isArray(boletaData.muestras) && boletaData.muestras.length > 0
        ? boletaData.muestras
        : [
            {
                descripcion: boletaData.concepto || 'Procesamiento e informe histopatológico de muestra quirúrgica',
                precio: parseFloat(boletaData.precioUnitario) || (parseFloat(boletaData.total) / (parseInt(boletaData.numMuestras, 10) || 1))
            }
        ];

    let totalCalculado = 0;

    muestras.forEach((m, idx) => {
        const itemNum = (idx + 1).toString().padStart(2, '0');
        const descTexto = m.descripcion || `Procesamiento de muestra #${idx + 1}`;
        const pUnit = parseFloat(m.precio) || 0;
        totalCalculado += pUnit;

        doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
        doc.rect(14, currentY, 182, 9, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(14, currentY + 9, 196, currentY + 9);

        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(itemNum, 18, currentY + 6);
        doc.text(descTexto.substring(0, 68), 35, currentY + 6);
        doc.text('1', 135, currentY + 6, { align: 'center' });
        doc.text(`S/ ${pUnit.toFixed(2)}`, 160, currentY + 6, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`S/ ${pUnit.toFixed(2)}`, 190, currentY + 6, { align: 'right' });

        currentY += 9;
    });

    const totalFinal = parseFloat(boletaData.total) || totalCalculado;
    currentY += 8;

    // 4. Bloque de Totales y Liquidación al final de la tabla
    doc.setFillColor(...lightBg);
    doc.roundedRect(110, currentY, 86, 26, 2, 2, 'FD');
    doc.setDrawColor(...accentColor);
    doc.roundedRect(110, currentY, 86, 26, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...textColor);
    doc.text('CANTIDAD TOTAL DE MUESTRAS:', 114, currentY + 8);
    doc.text(`${muestras.length}`, 190, currentY + 8, { align: 'right' });

    doc.text('TOTAL A LIQUIDAR (SUMA):', 114, currentY + 18);
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.text(`S/ ${totalFinal.toFixed(2)}`, 190, currentY + 19, { align: 'right' });

    // 5. Nota Bancaria y Conformidad
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Modalidad de Pago: Depósito / Transferencia Bancaria Directa.', 14, currentY + 8);
    doc.text('Constancia de conformidad técnica para archivo contable y auditoría clínica.', 14, currentY + 14);
    doc.text('Suma total consolidada de todas las muestras procesadas en la presente orden.', 14, currentY + 20);

    // 6. Pie de Página
    const footerY = 270;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footerY, 196, footerY);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`JC PATH LAB © 2026 | Local: ${LAB_INFO.direccionLocal}`, 14, footerY + 6);
    doc.text(`Constancia Ref: ${boletaData.codigo} | Emisión: ${new Date().toLocaleString('es-PE')}`, 196, footerY + 6, { align: 'right' });

    // Descarga directa
    const filename = `Constancia_${boletaData.codigo}_${(boletaData.razonSocial || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.pdf`;
    doc.save(filename);
}

// ==============================================================================
// 4. CONTROLADOR DE INTERFAZ DE USUARIO (#view-boletas) CON MUESTRAS DINÁMICAS
// ==============================================================================

// Lista en memoria de las muestras para la emisión actual
let muestrasActuales = [
    { descripcion: 'Muestra #1: Biopsia gástrica / espécimen histopatológico', precio: 70.00 }
];

export function initBoletasModule() {
    renderEmpresasSelect();
    renderEmpresasTable();
    renderBoletasTable();
    renderMuestrasInputs();
    setupBoletasEventListeners();

    const fechaInput = document.getElementById('boletaFechaEmision');
    if (fechaInput && !fechaInput.value) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
}

export function renderMuestrasInputs() {
    const container = document.getElementById('boletaMuestrasContainer');
    if (!container) return;

    container.innerHTML = '';

    muestrasActuales.forEach((item, index) => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; gap: 8px; align-items: center; background: rgba(30, 41, 59, 0.6); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05);';
        row.innerHTML = `
            <span style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; min-width: 24px;">#${index + 1}</span>
            <input type="text" class="filter-input input-muestra-desc" data-index="${index}" value="${escapeHtml(item.descripcion)}" placeholder="Descripción de la muestra (ej: Biopsia gástrica)" style="flex: 2; font-size: 0.85rem; padding: 6px 10px;">
            <div style="display: flex; align-items: center; gap: 4px;">
                <span style="font-size: 0.8rem; color: #94a3b8;">S/</span>
                <input type="number" step="0.50" min="0" class="filter-input input-muestra-precio" data-index="${index}" value="${(item.precio || 0).toFixed(2)}" placeholder="0.00" style="width: 90px; font-size: 0.85rem; font-weight: 700; text-align: right; padding: 6px 8px;">
            </div>
            ${muestrasActuales.length > 1 ? `
                <button type="button" class="btn btn-secondary btn-remove-muestra" data-index="${index}" style="padding: 6px 9px; color: #f87171; border-color: rgba(239, 68, 68, 0.3);" title="Quitar esta muestra">
                    <i class="fa-solid fa-trash"></i>
                </button>
            ` : '<div style="width: 32px;"></div>'}
        `;
        container.appendChild(row);
    });

    // Vincular eventos de inputs
    container.querySelectorAll('.input-muestra-desc').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            if (muestrasActuales[idx]) {
                muestrasActuales[idx].descripcion = e.target.value;
            }
        });
    });

    container.querySelectorAll('.input-muestra-precio').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            if (muestrasActuales[idx]) {
                muestrasActuales[idx].precio = parseFloat(e.target.value) || 0;
                recomputeTotal();
            }
        });
    });

    container.querySelectorAll('.btn-remove-muestra').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            if (muestrasActuales.length > 1) {
                muestrasActuales.splice(idx, 1);
                renderMuestrasInputs();
                recomputeTotal();
            }
        });
    });

    recomputeTotal();
}

export function promptAgregarNuevaMuestra(defaultPrecio = 70.00) {
    const nextIndex = muestrasActuales.length + 1;
    let desc = `Muestra #${nextIndex}: Biopsia / espécimen histopatológico`;
    
    // Añadimos directamente a la lista
    muestrasActuales.push({
        descripcion: desc,
        precio: defaultPrecio
    });

    renderMuestrasInputs();
}

export function renderEmpresasSelect() {
    const select = document.getElementById('boletaEmpresaSelect');
    if (!select) return;

    const empresas = getStoredEmpresas();
    select.innerHTML = '<option value="">-- SELECCIONAR EMPRESA O CLÍNICA HABITUAL --</option>';

    empresas.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id;
        opt.textContent = `${emp.razonSocial} (RUC: ${emp.ruc})`;
        select.appendChild(opt);
    });
}

export function renderEmpresasTable() {
    const tbody = document.getElementById('boletasEmpresasTableBody');
    if (!tbody) return;

    const empresas = getStoredEmpresas();
    tbody.innerHTML = '';

    if (empresas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94a3b8;">No hay empresas registradas aún. Presione "➕ Nueva Empresa" para agregar una.</td></tr>';
        return;
    }

    empresas.forEach((emp, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${escapeHtml(emp.razonSocial)}</strong></td>
            <td><code>${escapeHtml(emp.ruc)}</code></td>
            <td>${escapeHtml(emp.direccion || '-')}</td>
            <td>${escapeHtml(emp.telefono || '-')}</td>
            <td>
                <button type="button" class="editor-btn-danger btn-sm-tool" onclick="window.deleteEmpresaDirectly && window.deleteEmpresaDirectly('${emp.id}')" title="Eliminar empresa del catálogo">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderBoletasTable() {
    const tbody = document.getElementById('boletasHistoryTableBody');
    if (!tbody) return;

    const boletas = getStoredBoletas();
    tbody.innerHTML = '';

    if (boletas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #94a3b8;">Aún no se han emitido constancias. Seleccione una empresa arriba y presione "GENERAR CONSTANCIA PDF".</td></tr>';
        return;
    }

    const sorted = [...boletas].sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));

    sorted.forEach(b => {
        const tr = document.createElement('tr');
        const fechaStr = b.fecha ? new Date(b.fecha).toLocaleDateString('es-PE') : '-';
        tr.innerHTML = `
            <td><strong style="color: #38bdf8;">${escapeHtml(b.codigo)}</strong></td>
            <td><strong>${escapeHtml(b.razonSocial)}</strong></td>
            <td>${fechaStr}</td>
            <td style="text-align:center;">${b.numMuestras || 1} muestras</td>
            <td><strong style="color: #10b981;">S/ ${(parseFloat(b.total) || 0).toFixed(2)}</strong></td>
            <td>
                <button type="button" class="editor-btn-secondary btn-sm-tool" onclick="window.reprintBoletaDirectly && window.reprintBoletaDirectly('${b.codigo}')" title="Reimprimir / Descargar PDF">
                    <i class="fa-solid fa-print"></i> PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function recomputeTotal() {
    const total = muestrasActuales.reduce((acc, item) => acc + (parseFloat(item.precio) || 0), 0);
    const count = muestrasActuales.length;

    const totalDisplay = document.getElementById('boletaTotalDisplay');
    const subtotalCalc = document.getElementById('boletaSubtotalCalculado');
    const countDisplay = document.getElementById('boletaTotalMuestrasCount');

    if (totalDisplay) totalDisplay.textContent = `S/ ${total.toFixed(2)}`;
    if (subtotalCalc) subtotalCalc.textContent = `S/ ${total.toFixed(2)}`;
    if (countDisplay) countDisplay.textContent = `${count}`;
}

let _boletasListenersAttached = false;

function setupBoletasEventListeners() {
    if (_boletasListenersAttached) return;
    _boletasListenersAttached = true;

    const select = document.getElementById('boletaEmpresaSelect');
    if (select) {
        select.addEventListener('change', (e) => {
            const empId = e.target.value;
            const empresas = getStoredEmpresas();
            const found = empresas.find(emp => emp.id === empId);

            const rucEl = document.getElementById('boletaRucDisplay');
            const dirEl = document.getElementById('boletaDirDisplay');
            const telEl = document.getElementById('boletaTelDisplay');

            if (found) {
                if (rucEl) rucEl.textContent = found.ruc || '-';
                if (dirEl) dirEl.textContent = found.direccion || 'No especificada';
                if (telEl) telEl.textContent = found.telefono || 'No registrado';
            } else {
                if (rucEl) rucEl.textContent = '-';
                if (dirEl) dirEl.textContent = '-';
                if (telEl) telEl.textContent = '-';
            }
        });
    }

    const btnAddMuestra = document.getElementById('btnAgregarMuestraBoleta');
    if (btnAddMuestra) {
        btnAddMuestra.addEventListener('click', () => {
            // Preguntar si desea ingresar otra muestra de forma continua
            promptAgregarNuevaMuestra();
        });
    }

    const btnEmitir = document.getElementById('btnEmitirBoletaDirecto');
    if (btnEmitir) {
        btnEmitir.addEventListener('click', handleEmitirBoletaClick);
    }

    const btnNuevaEmpresa = document.getElementById('btnOpenModalNuevaEmpresa');
    if (btnNuevaEmpresa) {
        btnNuevaEmpresa.addEventListener('click', () => {
            const modal = document.getElementById('modalNuevaEmpresa');
            if (modal) modal.style.display = 'flex';
        });
    }

    const btnGuardarEmpresa = document.getElementById('btnGuardarNuevaEmpresa');
    if (btnGuardarEmpresa) {
        btnGuardarEmpresa.addEventListener('click', handleGuardarNuevaEmpresa);
    }
}

function handleEmitirBoletaClick() {
    const select = document.getElementById('boletaEmpresaSelect');
    const empId = select?.value;

    if (!empId) {
        alert('Por favor seleccione una empresa o clínica de la lista antes de generar la constancia.');
        select?.focus();
        return;
    }

    const empresas = getStoredEmpresas();
    const empresa = empresas.find(e => e.id === empId);
    if (!empresa) {
        alert('Empresa no encontrada en el catálogo.');
        return;
    }

    if (muestrasActuales.length === 0) {
        alert('Debe ingresar al menos una muestra.');
        return;
    }

    // Flujo interactivo: Preguntar al usuario si desea ingresar otra muestra antes de cerrar la hoja
    let continuarPreguntando = true;
    while (continuarPreguntando) {
        const respuesta = confirm(`Actualmente tiene ${muestrasActuales.length} muestra(s) registrada(s).\n\n¿Desea ingresar otra muestra adicional a esta constancia?`);
        if (respuesta) {
            const numNueva = muestrasActuales.length + 1;
            const precioStr = prompt(`Ingrese el precio para la Muestra #${numNueva} (en Soles):`, "70.00");
            if (precioStr !== null) {
                const precio = parseFloat(precioStr) || 70.00;
                const desc = prompt(`Descripción para la Muestra #${numNueva}:`, `Muestra #${numNueva}: Biopsia / espécimen histopatológico`) || `Muestra #${numNueva}`;
                muestrasActuales.push({ descripcion: desc, precio });
                renderMuestrasInputs();
            }
        } else {
            continuarPreguntando = false;
        }
    }

    const total = muestrasActuales.reduce((acc, m) => acc + (parseFloat(m.precio) || 0), 0);

    if (total <= 0) {
        alert('El monto total a facturar debe ser mayor a cero.');
        return;
    }

    const codigo = generateNextBoletaCode();
    const fecha = document.getElementById('boletaFechaEmision')?.value || new Date().toISOString().split('T')[0];
    const concepto = document.getElementById('boletaConceptoEstudio')?.value || 'Servicio de procesamiento e informe histopatológico.';
    const tipoServicio = document.getElementById('boletaTipoServicioSelect')?.value || 'Servicio de Anatomía Patológica';

    const boletaData = {
        codigo,
        empresaId: empresa.id,
        razonSocial: empresa.razonSocial,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        fecha,
        numMuestras: muestrasActuales.length,
        muestras: [...muestrasActuales],
        total,
        concepto,
        tipoServicio,
        createdAt: new Date().toISOString()
    };

    const boletas = getStoredBoletas();
    boletas.push(boletaData);
    saveStoredBoletas(boletas);

    generateBoletaPDF(boletaData);
    renderBoletasTable();

    if (typeof window.notifyUser === 'function') {
        window.notifyUser(`Constancia ${codigo} generada exitosamente.`, 'success');
    } else {
        alert(`✅ Constancia ${codigo} generada exitosamente para ${empresa.razonSocial}.\nTotal Liquidado: S/ ${total.toFixed(2)} (${muestrasActuales.length} muestras).`);
    }
}

function handleGuardarNuevaEmpresa() {
    const razonSocial = (document.getElementById('newEmpRazonSocial')?.value || '').trim();
    const ruc = (document.getElementById('newEmpRuc')?.value || '').trim();
    const direccion = (document.getElementById('newEmpDireccion')?.value || '').trim();
    const telefono = (document.getElementById('newEmpTelefono')?.value || '').trim();

    if (!razonSocial) {
        alert('Ingrese la Razón Social o Nombre de la Institución.');
        return;
    }
    if (!ruc || ruc.length < 8) {
        alert('Ingrese un RUC (11 dígitos) o DNI (8 dígitos) válido.');
        return;
    }

    const empresas = getStoredEmpresas();
    const existe = empresas.find(e => e.ruc === ruc);
    if (existe) {
        alert('Ya existe una empresa registrada con este mismo RUC o documento.');
        return;
    }

    const newEmp = {
        id: `emp_${Date.now()}`,
        razonSocial: razonSocial.toUpperCase(),
        ruc,
        direccion: direccion || 'No especificada',
        telefono: telefono || '-',
        createdAt: new Date().toISOString()
    };

    empresas.push(newEmp);
    saveStoredEmpresas(empresas);

    document.getElementById('newEmpRazonSocial').value = '';
    document.getElementById('newEmpRuc').value = '';
    document.getElementById('newEmpDireccion').value = '';
    document.getElementById('newEmpTelefono').value = '';

    const modal = document.getElementById('modalNuevaEmpresa');
    if (modal) modal.style.display = 'none';

    renderEmpresasSelect();
    renderEmpresasTable();

    const select = document.getElementById('boletaEmpresaSelect');
    if (select) {
        select.value = newEmp.id;
        select.dispatchEvent(new Event('change'));
    }

    if (typeof window.notifyUser === 'function') {
        window.notifyUser(`Empresa "${newEmp.razonSocial}" registrada permanentemente.`, 'success');
    }
}

window.deleteEmpresaDirectly = function(empId) {
    const empresas = getStoredEmpresas();
    const emp = empresas.find(e => e.id === empId);
    if (!emp) return;

    if (confirm(`¿Está seguro de eliminar a "${emp.razonSocial}" del catálogo de empresas?`)) {
        const filtered = empresas.filter(e => e.id !== empId);
        saveStoredEmpresas(filtered);
        renderEmpresasSelect();
        renderEmpresasTable();
        if (typeof window.notifyUser === 'function') {
            window.notifyUser('Empresa eliminada del catálogo.', 'info');
        }
    }
};

window.reprintBoletaDirectly = function(codigo) {
    const boletas = getStoredBoletas();
    const found = boletas.find(b => b.codigo === codigo);
    if (found) {
        generateBoletaPDF(found);
    } else {
        alert('No se encontró la boleta especificada.');
    }
};

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

