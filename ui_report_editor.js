import { patientDatabase, doctorsDatabase, triggerAutomaticBackup, categoriesDatabase, templatesDatabase, addTemplateToDatabase, mapPatientToDb, savePatient, deletePatient, cleanTextContentLocal, sortPatientArray, normalizeSexo, getPatientFromIndexedDB, getSurgicalCaseFromLRU, fetchFullPatientDetails } from './db_service.js';
import { renderTable, applyFilters } from './ui_tables.js';
import { populateModalDoctorsSelect } from './ui_admin.js';
import { closeModal } from './ui_editor.js';
import { synopticSchemas, compileSynopticReport, compileLongReport, compileSeparateReportParts } from './synoptic_schemas.js';
import { extract24FramesFromVideo, Macro360Viewer } from './macro_viewer_360.js';


window.savePatient = savePatient;
window.deletePatient = deletePatient;

let editingCodAtencion = null;
let cropper01 = null;
let cropper02 = null;
let originalImg01Src = null;
let originalImg02Src = null;
let currentMacro360Viewer = null;
let currentMacro360Frames = null;

export function isValidImageSrc(src) {
    if (!src || typeof src !== 'string') return false;
    const clean = src.trim();
    if (!clean || clean === 'null' || clean === 'undefined' || clean === 'none' || clean === '{}' || clean === '[]' || clean === 'about:blank' || clean === '""') {
        return false;
    }
    if (clean.includes('/reportes.html') || clean.includes('/imprimir.html') || clean.endsWith('.html')) {
        return false;
    }
    if (clean.toLowerCase().startsWith('data:image/')) {
        return clean.length > 50 && clean.includes(';base64,') && !clean.endsWith(';base64,');
    }
    if (/^(https?:\/\/|blob:|\/|\.\/|[a-zA-Z0-9_\-\/\\.]+\.(jpg|jpeg|png|webp|gif|bmp))/i.test(clean)) {
        return true;
    }
    return clean.length > 20;
}

export function resolveEditorImage(key, existingFallback = '') {
    const prevEl = document.getElementById(`re_${key}Preview`);
    const rawEl = document.getElementById(`re_${key}Raw`);
    const activeCropper = miniCropperInstances[key] || (key === 'img01' ? cropper01 : cropper02);

    // 1. Si el elemento de previsualización ya tiene la imagen recortada o cargada
    if (prevEl && isValidImageSrc(prevEl.src)) {
        return prevEl.src;
    }

    // 2. Si hay un cropper activo (el usuario capturó foto pero no ha hecho clic en "Confirmar Recorte")
    if (activeCropper) {
        try {
            const canvas = activeCropper.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
                if (isValidImageSrc(dataUrl)) return dataUrl;
            }
        } catch (e) {
            console.warn(`[Image Resolver] Aviso al procesar recorte de ${key}:`, e);
        }
    }

    // 3. Si el elemento de imagen original cruda tiene fuente válida
    if (rawEl && isValidImageSrc(rawEl.src)) {
        return rawEl.src;
    }

    // 4. Respaldo al registro previo del paciente
    const originalSrc = key === 'img01' ? originalImg01Src : originalImg02Src;
    if (originalSrc === "") {
        return ""; // Eliminada explícitamente por el usuario
    }
    if (isValidImageSrc(originalSrc)) {
        return originalSrc;
    }
    if (isValidImageSrc(existingFallback)) {
        return existingFallback;
    }

    return "";
}

// VARIABLES Y FUNCIONES DEL ASISTENTE SINÓPTICO INTERACTIVO
let activeSynopticState = {};
let activeSynopticSchemaId = null;

function switchEditorTab(tabId) {
    const reTabButtons = document.querySelectorAll('.tab-header-btn');
    reTabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.click();
        }
    });
}

function checkAndSetupSynopticAssistant(templateName) {
    const tabBtn = document.getElementById('re_tabBtnSynoptic');
    if (!tabBtn) return;

    const nameUpper = String(templateName || "").toUpperCase();
    if (nameUpper.includes("PROSTATA") || nameUpper.includes("PRÓSTATA") || nameUpper.includes("RTUP") || nameUpper.includes("TURP") || nameUpper.includes("ADENOMECTOMIA")) {
        activeSynopticSchemaId = "prostate_turp";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("prostate_turp");
    } else if (nameUpper.includes("HIGADO") || nameUpper.includes("HÍGADO") || nameUpper.includes("HEPATOCELULAR") || nameUpper.includes("HEPATIC") || nameUpper.includes("HCC")) {
        activeSynopticSchemaId = "liver_hcc";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("liver_hcc");
    } else if (nameUpper.includes("FILODES") || nameUpper.includes("PHYLLODES")) {
        activeSynopticSchemaId = "breast_phyllodes";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("breast_phyllodes");
    } else if (nameUpper.includes("INVASIVO") || nameUpper.includes("INVASIVE") || nameUpper.includes("MASTECTOMIA")) {
        activeSynopticSchemaId = "breast_invasive_carcinoma";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("breast_invasive_carcinoma");
    } else if (nameUpper.includes("ESOFAGO") || nameUpper.includes("ESÓFAGO") || nameUpper.includes("ESOPHAGUS")) {
        activeSynopticSchemaId = "esophagus_resection";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("esophagus_resection");
    } else if (nameUpper.includes("APENDICE") || nameUpper.includes("APÉNDICE") || nameUpper.includes("APPENDIX") || nameUpper.includes("LAMN")) {
        activeSynopticSchemaId = "appendix_resection";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("appendix_resection");
    } else if (nameUpper.includes("POLIPECTOMIA") || nameUpper.includes("POLIPECTOMÍA") || nameUpper.includes("POLIPO") || nameUpper.includes("PÓLIPO")) {
        activeSynopticSchemaId = "colorectal_biopsy";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("colorectal_biopsy");
    } else if (nameUpper.includes("COLON") || nameUpper.includes("RECTO") || nameUpper.includes("COLECTOMIA") || nameUpper.includes("COLECTOMÍA") || nameUpper.includes("HEMICOLECTOMIA") || nameUpper.includes("SIGMOIDECTOMIA")) {
        activeSynopticSchemaId = "colorectal_resection";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("colorectal_resection");
    } else if (nameUpper.includes("GIST")) {
        activeSynopticSchemaId = "stomach_gist_resection";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("stomach_gist_resection");
    } else if (nameUpper.includes("ESTOMAGO") || nameUpper.includes("ESTÓMAGO") || nameUpper.includes("GASTRECTOMIA") || nameUpper.includes("GASTRECTOMÍA") || nameUpper.includes("GASTRIC")) {
        activeSynopticSchemaId = "stomach_resection";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("stomach_resection");
    } else if (nameUpper.includes("VESICULA") || nameUpper.includes("VESÍCULA") || nameUpper.includes("COLECISTECTOMIA") || nameUpper.includes("COLECISTECTOMÍA") || nameUpper.includes("COLECIST")) {
        activeSynopticSchemaId = "gallbladder_resection";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("gallbladder_resection");
    } else if (nameUpper.includes("DUODENO") || nameUpper.includes("YEYUNO") || nameUpper.includes("ILEON") || nameUpper.includes("ÍLEON") || nameUpper.includes("INTESTINO DELGADO") || nameUpper.includes("SMALL BOWEL")) {
        activeSynopticSchemaId = "small_intestine_resection";
        activeSynopticState = {};
        tabBtn.style.display = "inline-flex";
        renderSynopticForm("small_intestine_resection");
    } else {
        // En caso general, mantener la pestaña disponible para que el usuario pueda abrir cualquier protocolo si lo desea
        tabBtn.style.display = "inline-flex";
        if (!activeSynopticSchemaId) {
            activeSynopticSchemaId = "colorectal_resection";
            activeSynopticState = {};
            renderSynopticForm("colorectal_resection");
        }
    }
}

let activeSynopticPreviewMode = "long"; // "synoptic" | "long"

window.abrirAsistenteSinopticoDirecto = function(schemaKey) {
    if (!schemaKey || !synopticSchemas[schemaKey]) {
        schemaKey = "prostate_turp";
    }
    const tabBtn = document.getElementById('re_tabBtnSynoptic');
    if (tabBtn) {
        tabBtn.style.display = "inline-flex";
        tabBtn.click();
    }
    activeSynopticSchemaId = schemaKey;
    activeSynopticState = {};
    renderSynopticForm(schemaKey);
    window.closeCapQuickModal();
    const schema = synopticSchemas[schemaKey];
    if (typeof showToast === "function") {
        showToast(`⚡ Asistente Sinóptico CAP: ${schema ? schema.title : schemaKey}`, "info");
    }
};

function renderSynopticForm(schemaId) {
    const schema = synopticSchemas[schemaId];
    const container = document.getElementById("synopticFormContainer");
    if (!schema || !container) return;

    activeSynopticSchemaId = schemaId;
    container.innerHTML = "";

    // 1. Barra Superior de Control y Selector de Protocolo
    const topBar = document.createElement("div");
    topBar.style.cssText = "display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; background: rgba(15, 23, 42, 0.7); padding: 12px 16px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 18px;";

    const selGroup = document.createElement("div");
    selGroup.style.cssText = "display: flex; align-items: center; gap: 10px; flex: 1; min-width: 290px;";

    const selIcon = document.createElement("span");
    selIcon.style.cssText = "font-size: 0.85rem; font-weight: 700; color: #ef4444; display: flex; align-items: center; gap: 6px;";
    selIcon.innerHTML = '<i class="fa-solid fa-ribbon"></i> Protocolo CAP:';
    selGroup.appendChild(selIcon);

    const protoSelect = document.createElement("select");
    protoSelect.id = "synopticProtocolSelector";
    protoSelect.className = "editor-select";
    protoSelect.style.cssText = "flex: 1; font-weight: 700; color: #38bdf8; background: #0f172a; border: 1px solid #0284c7; padding: 6px 10px; font-size: 0.85rem; border-radius: 6px;";

    Object.keys(synopticSchemas).forEach(key => {
        const sch = synopticSchemas[key];
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = `${sch.organ ? '[' + sch.organ.toUpperCase() + '] ' : ''}${sch.title}`;
        opt.selected = key === schemaId;
        protoSelect.appendChild(opt);
    });

    protoSelect.addEventListener("change", (e) => {
        activeSynopticState = {};
        renderSynopticForm(e.target.value);
    });
    selGroup.appendChild(protoSelect);
    topBar.appendChild(selGroup);

    const btnActionsTop = document.createElement("div");
    btnActionsTop.style.cssText = "display: flex; gap: 8px; align-items: center;";

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.style.cssText = "background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 5px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;";
    resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Limpiar';
    resetBtn.onclick = () => {
        if (confirm("¿Desea reiniciar todas las respuestas del protocolo actual?")) {
            activeSynopticState = {};
            renderSynopticForm(schemaId);
        }
    };
    btnActionsTop.appendChild(resetBtn);
    topBar.appendChild(btnActionsTop);

    container.appendChild(topBar);

    // 2. Subtítulo con Versión CAP y AJCC
    if (schema.subtitle) {
        const subBanner = document.createElement("div");
        subBanner.style.cssText = "margin-top: -8px; margin-bottom: 16px; padding: 6px 12px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 0.78rem; color: #93c5fd; display: flex; align-items: center; justify-content: space-between;";
        subBanner.innerHTML = `<span><i class="fa-solid fa-file-medical"></i> ${schema.subtitle}</span><span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">Checklist con Ayuda Oficial Integrada</span>`;
        container.appendChild(subBanner);
    }

    // 3. Renderizado de Secciones y Campos
    schema.sections.forEach((section, secIdx) => {
        const secDiv = document.createElement("div");
        secDiv.id = `sec_container_${section.id || secIdx}`;
        secDiv.style.cssText = "margin-bottom: 18px; background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(51, 65, 85, 0.8); border-radius: 8px; padding: 14px 16px;";

        const secTitleRow = document.createElement("div");
        secTitleRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;";

        const secTitle = document.createElement("h4");
        secTitle.style.cssText = "margin: 0; color: #f8fafc; font-size: 0.92rem; font-weight: 700; display: flex; align-items: center; gap: 8px;";
        secTitle.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span> ${section.name}`;
        secTitleRow.appendChild(secTitle);
        secDiv.appendChild(secTitleRow);

        section.fields.forEach(field => {
            const fieldDiv = document.createElement("div");
            fieldDiv.id = `field_container_${field.id}`;
            fieldDiv.style.cssText = "margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px;";

            if (field.dependsOn) {
                fieldDiv.style.display = "none";
            }

            // Cabecera del campo con Label y Botón de Ayuda Clínica ("¿Qué significa?")
            const labelRow = document.createElement("div");
            labelRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;";

            const label = document.createElement("label");
            label.style.cssText = "font-weight: 600; font-size: 0.84rem; color: #e2e8f0; display: flex; align-items: center; gap: 4px;";
            label.textContent = field.label;
            if (field.required) {
                const reqSpan = document.createElement("span");
                reqSpan.style.cssText = "color: #ef4444; font-weight: 700;";
                reqSpan.textContent = " *";
                label.appendChild(reqSpan);
            }
            labelRow.appendChild(label);

            let helpBox = null;
            if (field.helpText) {
                const helpBtn = document.createElement("button");
                helpBtn.type = "button";
                helpBtn.className = "cap-help-toggle-btn";
                helpBtn.title = "Ver criterio diagnóstico oficial y notas explicativas del CAP";
                helpBtn.style.cssText = "background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 12px; padding: 2px 9px; font-size: 0.72rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s ease;";
                helpBtn.innerHTML = '<i class="fa-solid fa-circle-question"></i> ¿Qué significa?';

                helpBox = document.createElement("div");
                helpBox.className = "cap-clinical-help-box";
                helpBox.style.cssText = "display: none; background: #0c1c2e; border-left: 3px solid #38bdf8; border-radius: 4px; padding: 10px 12px; margin: 4px 0 8px 0; font-size: 0.78rem; color: #bae6fd; line-height: 1.45; box-shadow: 0 4px 12px rgba(0,0,0,0.3);";
                helpBox.innerHTML = `
                    <div style="font-weight: 700; color: #38bdf8; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-book-medical"></i> Criterio Clínico y Patológico Oficial (CAP):
                    </div>
                    <div style="white-space: pre-line;">${field.helpText}</div>
                `;

                helpBtn.onclick = (e) => {
                    e.preventDefault();
                    const isVisible = helpBox.style.display === "block";
                    helpBox.style.display = isVisible ? "none" : "block";
                    helpBtn.style.background = isVisible ? "rgba(56, 189, 248, 0.12)" : "#0284c7";
                    helpBtn.style.color = isVisible ? "#38bdf8" : "#ffffff";
                };

                labelRow.appendChild(helpBtn);
            }

            fieldDiv.appendChild(labelRow);
            if (helpBox) fieldDiv.appendChild(helpBox);

            // Renderizado según tipo de control
            if (field.type === "radio") {
                const groupContainer = document.createElement("div");
                groupContainer.style.cssText = "display: flex; flex-direction: column; gap: 6px; padding-left: 6px;";

                field.options.forEach(opt => {
                    const optLabel = document.createElement("label");
                    optLabel.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 0.81rem; cursor: pointer; color: #cbd5e1;";

                    const radio = document.createElement("input");
                    radio.type = "radio";
                    radio.name = field.id;
                    radio.value = opt.value;
                    radio.checked = activeSynopticState[field.id] === opt.value;
                    radio.addEventListener("change", (e) => {
                        activeSynopticState[field.id] = e.target.value;
                        handleDependencies();
                        updateCompiledPreview();
                    });

                    optLabel.appendChild(radio);
                    optLabel.appendChild(document.createTextNode(opt.label));

                    if (opt.hasInput) {
                        const extraInput = document.createElement("input");
                        extraInput.type = "text";
                        extraInput.className = "editor-input";
                        extraInput.style.cssText = "margin-left: 10px; padding: 3px 6px; font-size: 0.8rem; width: 160px;";
                        extraInput.style.display = activeSynopticState[field.id] === opt.value ? "inline-block" : "none";
                        extraInput.value = activeSynopticState[`${field.id}_extra`] || "";
                        extraInput.placeholder = "Especificar...";
                        extraInput.addEventListener("input", (e) => {
                            activeSynopticState[`${field.id}_extra`] = e.target.value;
                            updateCompiledPreview();
                        });
                        optLabel.appendChild(extraInput);

                        radio.addEventListener("change", (e) => {
                            extraInput.style.display = e.target.checked ? "inline-block" : "none";
                        });
                    }

                    groupContainer.appendChild(optLabel);
                });

                fieldDiv.appendChild(groupContainer);

            } else if (field.type === "select") {
                const select = document.createElement("select");
                select.className = "editor-select";
                select.style.cssText = "font-size: 0.82rem; padding: 5px 8px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px;";

                const defaultOpt = document.createElement("option");
                defaultOpt.value = "";
                defaultOpt.textContent = "SELECCIONAR ALTERNATIVA...";
                select.appendChild(defaultOpt);

                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt.value;
                    option.textContent = opt.label;
                    option.selected = activeSynopticState[field.id] === opt.value;
                    select.appendChild(option);
                });

                select.addEventListener("change", (e) => {
                    activeSynopticState[field.id] = e.target.value;
                    handleDependencies();
                    updateCompiledPreview();
                });

                fieldDiv.appendChild(select);

                const hasInputOption = field.options.find(o => o.hasInput);
                if (hasInputOption) {
                    const extraInput = document.createElement("input");
                    extraInput.type = "text";
                    extraInput.className = "editor-input";
                    extraInput.style.cssText = "margin-top: 6px; padding: 4px 8px; font-size: 0.8rem; width: 100%; box-sizing: border-box;";
                    extraInput.style.display = activeSynopticState[field.id] === hasInputOption.value ? "block" : "none";
                    extraInput.placeholder = "Especificar detalle clínico...";
                    extraInput.value = activeSynopticState[`${field.id}_extra`] || "";
                    extraInput.addEventListener("input", (e) => {
                        activeSynopticState[`${field.id}_extra`] = e.target.value;
                        updateCompiledPreview();
                    });
                    fieldDiv.appendChild(extraInput);

                    select.addEventListener("change", (e) => {
                        extraInput.style.display = e.target.value === hasInputOption.value ? "block" : "none";
                    });
                }

            } else if (field.type === "checkbox") {
                const groupContainer = document.createElement("div");
                groupContainer.style.cssText = "display: flex; flex-direction: column; gap: 6px; padding-left: 6px;";

                if (!Array.isArray(activeSynopticState[field.id])) {
                    activeSynopticState[field.id] = [];
                }

                field.options.forEach(opt => {
                    const optLabel = document.createElement("label");
                    optLabel.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 0.81rem; cursor: pointer; color: #cbd5e1;";

                    const cb = document.createElement("input");
                    cb.type = "checkbox";
                    cb.value = opt.value;
                    cb.checked = activeSynopticState[field.id].includes(opt.value);
                    cb.addEventListener("change", (e) => {
                        let currentList = activeSynopticState[field.id] || [];
                        if (e.target.checked) {
                            if (!currentList.includes(e.target.value)) currentList.push(e.target.value);
                        } else {
                            currentList = currentList.filter(v => v !== e.target.value);
                        }
                        activeSynopticState[field.id] = currentList;
                        updateCompiledPreview();
                    });

                    optLabel.appendChild(cb);
                    optLabel.appendChild(document.createTextNode(opt.label));

                    if (opt.hasInput) {
                        const extraInput = document.createElement("input");
                        extraInput.type = "text";
                        extraInput.className = "editor-input";
                        extraInput.style.cssText = "margin-left: 10px; padding: 2px 6px; font-size: 0.8rem; width: 140px;";
                        extraInput.style.display = activeSynopticState[field.id].includes(opt.value) ? "inline-block" : "none";
                        extraInput.value = activeSynopticState[`${field.id}_${opt.value}_extra`] || "";
                        extraInput.placeholder = "Detalle...";
                        extraInput.addEventListener("input", (e) => {
                            activeSynopticState[`${field.id}_${opt.value}_extra`] = e.target.value;
                            updateCompiledPreview();
                        });
                        optLabel.appendChild(extraInput);

                        cb.addEventListener("change", (e) => {
                            extraInput.style.display = e.target.checked ? "inline-block" : "none";
                        });
                    }

                    groupContainer.appendChild(optLabel);
                });

                fieldDiv.appendChild(groupContainer);

            } else if (field.type === "number") {
                const wrapper = document.createElement("div");
                wrapper.style.cssText = "display: flex; align-items: center; gap: 6px;";

                const num = document.createElement("input");
                num.type = "number";
                num.className = "editor-input";
                num.style.cssText = "font-size: 0.85rem; padding: 4px 8px; width: 90px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 4px;";
                num.value = activeSynopticState[field.id] || "";
                num.addEventListener("input", (e) => {
                    activeSynopticState[field.id] = e.target.value;
                    updateCompiledPreview();
                });

                wrapper.appendChild(num);
                if (field.suffix) {
                    const suf = document.createElement("span");
                    suf.style.cssText = "font-size: 0.82rem; color: #94a3b8; font-weight: 600;";
                    suf.textContent = field.suffix;
                    wrapper.appendChild(suf);
                }
                fieldDiv.appendChild(wrapper);

            } else if (field.type === "text") {
                const input = document.createElement("input");
                input.type = "text";
                input.className = "editor-input";
                input.style.cssText = "font-size: 0.85rem; padding: 5px 8px; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 4px; width: 100%; box-sizing: border-box;";
                input.value = activeSynopticState[field.id] || "";
                input.placeholder = "Ingrese texto o nota clínica...";
                input.addEventListener("input", (e) => {
                    activeSynopticState[field.id] = e.target.value;
                    updateCompiledPreview();
                });
                fieldDiv.appendChild(input);
            }

            secDiv.appendChild(fieldDiv);
        });

        container.appendChild(secDiv);
    });

    // 4. Encabezado de Vista Previa y Selector de Modo de Compilación
    const previewHeaderRow = document.createElement("div");
    previewHeaderRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin: 24px 0 10px 0; border-top: 1px solid var(--border-color); padding-top: 16px;";

    const previewTitle = document.createElement("h4");
    previewTitle.style.cssText = "margin: 0; color: #f8fafc; font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px;";
    previewTitle.innerHTML = '<i class="fa-solid fa-eye" style="color: #38bdf8;"></i> VISTA PREVIA COMPILADA EN TIEMPO REAL';
    previewHeaderRow.appendChild(previewTitle);

    const modeToggleDiv = document.createElement("div");
    modeToggleDiv.style.cssText = "display: flex; gap: 4px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px;";

    const btnModeLong = document.createElement("button");
    btnModeLong.type = "button";
    btnModeLong.style.cssText = `padding: 4px 10px; border: none; border-radius: 4px; font-size: 0.74rem; font-weight: 600; cursor: pointer; ${activeSynopticPreviewMode === 'long' ? 'background: #0284c7; color: white;' : 'background: transparent; color: #94a3b8;'}`;
    btnModeLong.innerHTML = '<i class="fa-solid fa-file-lines"></i> Informe Largo Completo';
    btnModeLong.onclick = () => {
        activeSynopticPreviewMode = 'long';
        btnModeLong.style.background = '#0284c7';
        btnModeLong.style.color = 'white';
        btnModeSynoptic.style.background = 'transparent';
        btnModeSynoptic.style.color = '#94a3b8';
        updateCompiledPreview();
    };

    const btnModeSynoptic = document.createElement("button");
    btnModeSynoptic.type = "button";
    btnModeSynoptic.style.cssText = `padding: 4px 10px; border: none; border-radius: 4px; font-size: 0.74rem; font-weight: 600; cursor: pointer; ${activeSynopticPreviewMode === 'synoptic' ? 'background: #0284c7; color: white;' : 'background: transparent; color: #94a3b8;'}`;
    btnModeSynoptic.innerHTML = '<i class="fa-solid fa-list-check"></i> Resumen Sinóptico';
    btnModeSynoptic.onclick = () => {
        activeSynopticPreviewMode = 'synoptic';
        btnModeSynoptic.style.background = '#0284c7';
        btnModeSynoptic.style.color = 'white';
        btnModeLong.style.background = 'transparent';
        btnModeLong.style.color = '#94a3b8';
        updateCompiledPreview();
    };

    modeToggleDiv.appendChild(btnModeLong);
    modeToggleDiv.appendChild(btnModeSynoptic);
    previewHeaderRow.appendChild(modeToggleDiv);
    container.appendChild(previewHeaderRow);

    // 5. Caja de Vista Previa
    const previewBox = document.createElement("div");
    previewBox.id = "synopticReportPreviewBox";
    previewBox.style.cssText = "padding: 14px; background-color: #0b1324; border-radius: 6px; border: 1.5px solid #1e293b; font-size: 0.82rem; color: #e2e8f0; white-space: pre-wrap; font-family: 'Consolas', 'Courier New', monospace; line-height: 1.5; max-height: 380px; overflow-y: auto;";
    previewBox.textContent = "(El reporte está vacío, seleccione alternativas arriba)";
    container.appendChild(previewBox);

    // 6. Barra de Acciones de Inyección y Copiado (Desacoplada en 2 Fases Clínicas)
    const actionToolbar = document.createElement("div");
    actionToolbar.style.cssText = "display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color);";

    // Botón Fase 1: Solo Macroscopía (Día 0)
    const btnInjectMacroOnly = document.createElement("button");
    btnInjectMacroOnly.type = "button";
    btnInjectMacroOnly.style.cssText = "background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white; border: none; border-radius: 6px; padding: 8px 14px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.4);";
    btnInjectMacroOnly.innerHTML = '<i class="fa-solid fa-box-archive"></i> Inyectar Solo Macroscopía (Fase 1)';
    btnInjectMacroOnly.title = "Aplica únicamente la descripción macroscópica y casetes al informe. Deja microscopía y diagnóstico pendientes para el tecnólogo.";
    btnInjectMacroOnly.onclick = () => {
        if (!activeSynopticSchemaId) return;
        const parts = compileSeparateReportParts(activeSynopticSchemaId, activeSynopticState);
        if (!parts || !parts.macro) {
            if (typeof showToast === "function") showToast("Complete al menos las dimensiones y especímenes macroscópicos", "warning");
            return;
        }
        const macroEl = document.getElementById('re_macroDesc');
        const macroElFull = document.getElementById('re_macroDesc_full');
        if (macroEl) {
            macroEl.innerHTML = parts.macro.replace(/\n/g, '<br>');
            macroEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (macroElFull) {
            macroElFull.innerHTML = parts.macro.replace(/\n/g, '<br>');
            macroElFull.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (typeof showToast === "function") {
            showToast("📦 Fase 1: Macroscopía inyectada. Microscopía y Diagnóstico quedan pendientes para cuando lleguen las láminas en 3 días.", "success");
        }
        switchEditorTab('tab_descrip');
    };
    actionToolbar.appendChild(btnInjectMacroOnly);

    // Botón Fase 2: Solo Microscopía + Diagnóstico (Día 3 - Preserva macroscopía previa)
    const btnInjectMicroDiagOnly = document.createElement("button");
    btnInjectMicroDiagOnly.type = "button";
    btnInjectMicroDiagOnly.style.cssText = "background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 6px; padding: 8px 14px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);";
    btnInjectMicroDiagOnly.innerHTML = '<i class="fa-solid fa-microscope"></i> Inyectar Micro + Diagnóstico (Fase 2)';
    btnInjectMicroDiagOnly.title = "Aplica microscopía y diagnóstico definitivo. ¡Mantiene intacta al 100% la macroscopía descrita en el Día 0!";
    btnInjectMicroDiagOnly.onclick = () => {
        if (!activeSynopticSchemaId) return;
        const parts = compileSeparateReportParts(activeSynopticSchemaId, activeSynopticState);
        if (!parts || (!parts.micro && !parts.diag)) {
            if (typeof showToast === "function") showToast("Complete los hallazgos microscópicos y diagnósticos", "warning");
            return;
        }
        const microEl = document.getElementById('re_microDesc');
        const microElFull = document.getElementById('re_microDesc_full');
        if (microEl && parts.micro) {
            microEl.innerHTML = parts.micro.replace(/\n/g, '<br>');
            microEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (microElFull && parts.micro) {
            microElFull.innerHTML = parts.micro.replace(/\n/g, '<br>');
            microElFull.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const diagEl = document.getElementById('re_diagnostico');
        const diagElFull = document.getElementById('re_diagnostico_full');
        if (diagEl && parts.diag) {
            diagEl.innerHTML = parts.diag.replace(/\n/g, '<br>');
            diagEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (diagElFull && parts.diag) {
            diagElFull.innerHTML = parts.diag.replace(/\n/g, '<br>');
            diagElFull.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (typeof showToast === "function") {
            showToast("🔬 Fase 2: Microscopía y Diagnóstico inyectados con éxito. (Macroscopía del Día 0 preservada intacta)", "success");
        }
        switchEditorTab('tab_descrip');
    };
    actionToolbar.appendChild(btnInjectMicroDiagOnly);

    const btnInjectFull = document.createElement("button");
    btnInjectFull.type = "button";
    btnInjectFull.style.cssText = "background: rgba(255, 255, 255, 0.1); color: #cbd5e1; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 12px; font-weight: 600; font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;";
    btnInjectFull.innerHTML = '<i class="fa-solid fa-file-import"></i> Todo Junto (1 Solo Tiempo)';
    btnInjectFull.title = "Inyecta Macroscopía, Microscopía y Diagnóstico a la vez en casos de un solo tiempo.";
    btnInjectFull.onclick = () => {
        if (!activeSynopticSchemaId) return;
        const parts = compileSeparateReportParts(activeSynopticSchemaId, activeSynopticState);
        if (!parts || !parts.diag) {
            if (typeof showToast === "function") showToast("Por favor complete algunas preguntas primero", "warning");
            return;
        }

        // Inyectar Macroscopía
        const macroEl = document.getElementById('re_macroDesc');
        if (macroEl && parts.macro) {
            macroEl.innerHTML = parts.macro.replace(/\n/g, '<br>');
            macroEl.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Inyectar Microscopía
        const microEl = document.getElementById('re_microDesc');
        if (microEl && parts.micro) {
            microEl.innerHTML = parts.micro.replace(/\n/g, '<br>');
            microEl.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Inyectar Diagnóstico
        const diagEl = document.getElementById('re_diagnostico');
        if (diagEl && parts.diag) {
            diagEl.innerHTML = parts.diag.replace(/\n/g, '<br>');
            diagEl.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (typeof showToast === "function") {
            showToast("⚡ Informe Anatomopatológico Completo inyectado con éxito (Macro, Micro y Diagnóstico)", "success");
        }
        switchEditorTab('tab_descrip');
    };
    actionToolbar.appendChild(btnInjectFull);

    const btnCopySynoptic = document.createElement("button");
    btnCopySynoptic.type = "button";
    btnCopySynoptic.style.cssText = "background: #0284c7; color: white; border: none; border-radius: 6px; padding: 8px 14px; font-weight: 600; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;";
    btnCopySynoptic.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Copiar Solo al Diagnóstico';
    btnCopySynoptic.onclick = () => {
        if (!activeSynopticSchemaId) return;
        const rep = compileSynopticReport(activeSynopticSchemaId, activeSynopticState);
        if (!rep) {
            if (typeof showToast === "function") showToast("El reporte está vacío", "warning");
            return;
        }
        const diagEl = document.getElementById('re_diagnostico');
        if (diagEl) {
            const formatted = rep.replace(/\n/g, '<br>');
            const curr = diagEl.innerHTML.trim();
            if (curr && curr !== '<br>') {
                diagEl.innerHTML = curr + "<br><br>" + formatted;
            } else {
                diagEl.innerHTML = formatted;
            }
            diagEl.dispatchEvent(new Event('input', { bubbles: true }));
            if (typeof showToast === "function") showToast("Resumen sinóptico agregado al Diagnóstico", "success");
            switchEditorTab('tab_descrip');
        }
    };
    actionToolbar.appendChild(btnCopySynoptic);

    const btnCopyClipboard = document.createElement("button");
    btnCopyClipboard.type = "button";
    btnCopyClipboard.style.cssText = "background: #334155; color: white; border: none; border-radius: 6px; padding: 8px 12px; font-weight: 600; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;";
    btnCopyClipboard.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar Texto';
    btnCopyClipboard.onclick = () => {
        if (!activeSynopticSchemaId) return;
        const textToCopy = activeSynopticPreviewMode === 'long' 
            ? compileLongReport(activeSynopticSchemaId, activeSynopticState)
            : compileSynopticReport(activeSynopticSchemaId, activeSynopticState);
        
        if (!textToCopy) {
            if (typeof showToast === "function") showToast("No hay texto para copiar", "warning");
            return;
        }

        const plain = textToCopy.replace(/<[^>]+>/g, '');
        navigator.clipboard.writeText(plain).then(() => {
            if (typeof showToast === "function") showToast("Copiado al portapapeles con éxito", "success");
        }).catch(() => {
            if (typeof showToast === "function") showToast("Copiado localmente", "info");
        });
    };
    actionToolbar.appendChild(btnCopyClipboard);

    container.appendChild(actionToolbar);

    handleDependencies();
    updateCompiledPreview();
}

function handleDependencies() {
    if (!activeSynopticSchemaId) return;
    const schema = synopticSchemas[activeSynopticSchemaId];
    if (!schema) return;

    schema.sections.forEach(section => {
        section.fields.forEach(field => {
            if (field.dependsOn) {
                const depVal = activeSynopticState[field.dependsOn.field];
                const containerEl = document.getElementById(`field_container_${field.id}`);
                if (containerEl) {
                    let match = false;
                    if (field.dependsOn.value && depVal === field.dependsOn.value) match = true;
                    if (field.dependsOn.values && field.dependsOn.values.includes(depVal)) match = true;

                    if (match) {
                        containerEl.style.display = "flex";
                    } else {
                        containerEl.style.display = "none";
                        delete activeSynopticState[field.id];
                    }
                }
            }
        });
    });
}

function updateCompiledPreview() {
    const previewBox = document.getElementById("synopticReportPreviewBox");
    if (!previewBox || !activeSynopticSchemaId) return;

    if (activeSynopticPreviewMode === "long") {
        const longReport = compileLongReport(activeSynopticSchemaId, activeSynopticState);
        previewBox.innerHTML = longReport ? longReport.replace(/\n/g, "<br>") : "(El reporte está vacío, complete algunas opciones arriba)";
    } else {
        const reportText = compileSynopticReport(activeSynopticSchemaId, activeSynopticState);
        previewBox.innerHTML = reportText ? reportText.replace(/\n/g, "<br>") : "(El reporte sinóptico está vacío)";
    }
}

export const miniCropperInstances = {};

export function resetEditorCropperWorkspaces() {
    ['img01', 'img02'].forEach(key => {
        if (miniCropperInstances[key]) {
            try { miniCropperInstances[key].destroy(); } catch (e) {}
            delete miniCropperInstances[key];
        }
    });
    if (cropper01) {
        try { cropper01.destroy(); } catch (e) {}
        cropper01 = null;
    }
    if (cropper02) {
        try { cropper02.destroy(); } catch (e) {}
        cropper02 = null;
    }

    const ws01 = document.getElementById('re_img01Workspace');
    const act01 = document.getElementById('re_img01Actions');
    const raw01 = document.getElementById('re_img01Raw');
    const input01 = document.getElementById('re_img01Input');
    if (ws01) ws01.style.display = 'none';
    if (act01) act01.style.display = 'none';
    if (raw01) raw01.src = '';
    if (input01) input01.value = '';

    if (window.currentUploadedFileUrl && window.currentUploadedFileUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(window.currentUploadedFileUrl); } catch (e) {}
        window.currentUploadedFileUrl = null;
    }

    const ws02 = document.getElementById('re_img02Workspace');
    const act02 = document.getElementById('re_img02Actions');
    const raw02 = document.getElementById('re_img02Raw');
    const input02 = document.getElementById('re_img02Input');
    if (ws02) ws02.style.display = 'none';
    if (act02) act02.style.display = 'none';
    if (raw02) raw02.src = '';
    if (input02) input02.value = '';
}
let originalCodAtencion = null;

const supabase = window.supabase;
const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');

// DICCIONARIO DE AUTOCORRECCIÓN CLÍNICA (ORTOGRAFÍA Y ACENTOS DETERMINÍSTICOS)
const CLINICAL_SPELLING_DICT = {
    "diagnostico": "diagnóstico",
    "DIAGNOSTICO": "DIAGNÓSTICO",
    "histologico": "histológico",
    "HISTOLOGICO": "HISTOLÓGICO",
    "estomago": "estómago",
    "ESTOMAGO": "ESTÓMAGO",
    "cronica": "crónica",
    "CRONICA": "CRÓNICA",
    "cronico": "crónico",
    "CRONICO": "CRÓNICO",
    "granulacion": "granulación",
    "GRANULACION": "GRANULACIÓN",
    "ulcera": "úlcera",
    "ULCERA": "ÚLCERA",
    "ulcerado": "ulcerado",
    "ulcerada": "ulcerada",
    "ulceracion": "ulceración",
    "ULCERACION": "ULCERACIÓN",
    "atipico": "atípico",
    "ATIPICO": "ATÍPICO",
    "atipica": "atípica",
    "ATIPICA": "ATÍPICA",
    "prostatica": "prostática",
    "PROSTATICA": "PROSTÁTICA",
    "utero": "útero",
    "UTERO": "ÚTERO",
    "cervix": "cérvix",
    "CERVIX": "CÉRVIX",
    "infeccion": "infección",
    "INFECCION": "INFECCIÓN",
    "linfatico": "linfático",
    "LINFATICO": "LINFÁTICO",
    "lesion": "lesión",
    "LESION": "LESIÓN",
    "inflamacion": "inflamación",
    "INFLAMACION": "INFLAMACIÓN",
    "infiltracion": "infiltración",
    "INFILTRACION": "INFILTRACIÓN",
    "lamina": "lámina",
    "LAMINA": "LÁMINA",
    "especimenes": "especímenes",
    "ESPECIMENES": "ESPECÍMENES",
    "polipo": "pólipo",
    "POLIPO": "PÓLIPO",
    "nodulo": "nódulo",
    "NODULO": "NÓDULO",
    "celula": "célula",
    "CELULA": "CÉLULA",
    "celulas": "células",
    "CELULAS": "CÉLULAS",
    "nucleo": "núcleo",
    "NUCLEO": "NÚCLEO",
    "nucleos": "núcleos",
    "NUCLEOS": "NÚCLEOS",
    "glandula": "glándula",
    "GLANDULA": "GLÁNDULA",
    "glandulas": "glándulas",
    "GLANDULAS": "GLÁNDULAS",
    "esofago": "esófago",
    "ESOFAGO": "ESÓFAGO",
    "pilorico": "pilórico",
    "PILORICO": "PILÓRICO",
    "citologia": "citología",
    "CITOLOGIA": "CITOLOGÍA",
    "citologico": "citológico",
    "CITOLOGICO": "CITOLÓGICO",
    "citologica": "citológica",
    "CITOLOGICA": "CITOLÓGICA",
    "reaccion": "reacción",
    "REACCION": "REACCIÓN",
    "evaluacion": "evaluación",
    "EVALUACION": "EVALUACIÓN",
    "observacion": "observación",
    "OBSERVACION": "OBSERVACIÓN",
    "observaciones": "observaciones",
    "OBSERVACIONES": "OBSERVACIONES",
    "Rganismo": "Organismo",
    "rganismo": "organismo",
    "sydney": "Sydney",
    "SYDNEY": "SYDNEY",
    "topografia": "topografía",
    "TOPOGRAFIA": "TOPOGRAFÍA",
    "helicobacter": "Helicobacter",
    "HELICOBACTER": "HELICOBACTER"
};

export function autoCorrectClinicalText(html) {
    if (!html) return '';
    return html.replace(/(<[^>]*>)|([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)/g, (match, p1, p2) => {
        if (p1) return p1; // Preservar etiquetas HTML
        const corrected = CLINICAL_SPELLING_DICT[p2];
        return corrected !== undefined ? corrected : p2;
    });
}

// Purga exhaustiva de expresiones LaTeX y símbolos matemáticos hacia texto plano médico
function _cleanLatexCore(clean) {
    if (!clean || typeof clean !== 'string') return clean || '';

    // 1. Delimitadores de bloque e inline math
    clean = clean.replace(/\$\$([^$]+)\$\$/g, '$1');
    clean = clean.replace(/\\\[([^\]]+)\\\]/g, '$1');
    clean = clean.replace(/\\\(([^\)]+)\\\)/g, '$1');

    // 2. Normalizar barras invertidas dobles o múltiples
    clean = clean.replace(/\\\\+/g, '\\');

    // 3. Comandos específicos de dimensiones y matemáticas médicas
    clean = clean.replace(/\\times\b/gi, ' x ');
    clean = clean.replace(/\\cdot\b/gi, ' · ');
    clean = clean.replace(/\\pm\b/gi, ' ± ');
    clean = clean.replace(/\\(?:geq|ge)\b/gi, '≥');
    clean = clean.replace(/\\(?:leq|le)\b/gi, '≤');
    clean = clean.replace(/\\approx\b/gi, '≈');
    clean = clean.replace(/\\neq\b/gi, '≠');
    clean = clean.replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/gi, '$1/$2');

    // 4. Envoltorios de texto \text{}, \mathrm{}, etc.
    clean = clean.replace(/\\(?:text|mathrm|textbf|textit|textnormal|operatorname|mathbf|underline|rm|it|bf)\s*\{([^}]*)\}/gi, '$1');

    // 5. Comandos LaTeX genéricos con argumento \cmd{arg}
    clean = clean.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');

    // 6. Comandos LaTeX sin argumentos \cmd
    clean = clean.replace(/\\[a-zA-Z]+\b\s*/g, '');

    // 7. Eliminar delimitadores inline $...$ y cualquier $ o \$ suelto
    clean = clean.replace(/\$([^$]+)\$/g, '$1');
    clean = clean.replace(/\\*\$/g, '');

    // 8. Eliminar llaves huérfanas y barras invertidas residuales
    clean = clean.replace(/[{}]/g, '');
    clean = clean.replace(/\\+/g, '');

    // 9. Normalización de dimensiones y espacios: ej: 4.6 x 4.5 x 3.5 cm
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/g, '$1 x $2');
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/g, '$1 x $2');
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*cm\b/gi, '$1 cm');
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*mm\b/gi, '$1 mm');
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*g\b/gi, '$1 g');
    clean = clean.replace(/[ \t]+/g, ' ');
    clean = clean.replace(/ +([.,;:)])/g, '$1');
    clean = clean.replace(/([(]) +/g, '$1');

    return clean;
}

export function cleanLatexToPlainText(text) {
    if (!text || typeof text !== 'string') return text || '';

    // Si contiene etiquetas HTML, proteger las etiquetas y purgar únicamente el contenido textual
    if (text.includes('<') && text.includes('>')) {
        return text.split(/(<[^>]*>)/g).map((part, idx) => {
            // Índices impares son etiquetas HTML (<...>)
            if (idx % 2 === 1) return part;
            return _cleanLatexCore(part);
        }).join('');
    }
    return _cleanLatexCore(text);
}
if (typeof window !== 'undefined') {
    window.cleanLatexToPlainText = cleanLatexToPlainText;
}

export function fixMedicalCapitalization(text) {
    if (!text) return '';
    
    // 1. Purga de LaTeX crudo y símbolos matemáticos generados por IA o copiado externo
    text = cleanLatexToPlainText(text);

    // 2. Corrección de puntuación y números pegados: ej: "histológico.1" -> "histológico. 1"
    // No afecta decimales como "1.2" o "0.8" porque la izquierda es una letra alfabética
    text = text.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])\.(\d+)/g, '$1. $2');

    // 3. Formateo y separación de casetes / bloques (evitar salto de línea roto o falta de espacio)
    // ej: "1\ncasete." -> "1 casete.", "2<br>casetes." -> "2 casetes."
    text = text.replace(/(\d+)\s*(?:<br\s*\/?>|\n)+\s*(casetes?|bloques?|cassettes?)\b/gi, '$1 $2');
    // ej: "1casete" -> "1 casete"
    text = text.replace(/\b(\d+)(casetes?|bloques?|cassettes?)\b/gi, '$1 $2');

    text = autoCorrectClinicalText(text);

    // Corregir etiquetas HTML duplicadas o anidadas como <b><b>...</b></b>
    text = text.replace(/<b>\s*<b>/gi, '<b>').replace(/<\/b>\s*<\/b>/gi, '</b>');

    // Corregir errores de tecla Mayús invertida al inicio de frase o al final (ej: "sE INCLUYE MUESTRA..." -> "Se incluye muestra...")
    text = text.replace(/(^|\.\s*|\n+)(sE\s+[A-Z\s]+|sE\b)/g, (match, prefix, phrase) => {
        let clean = phrase.toLowerCase().trim();
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        // Formatear casetes al final con espacio garantizado
        clean = clean.replace(/1\s*casete/gi, '1 casete').replace(/muestra\s+representativa/gi, 'muestra representativa');
        return prefix + clean;
    });

    // Corregir ortografía de Papanicolaou y Citología Cervical
    const papanicolaouRegex = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;
    text = text.replace(papanicolaouRegex, (match) => {
        if (match === match.toUpperCase()) return 'PAPANICOLAOU';
        if (match === match.toLowerCase()) return 'papanicolaou';
        return 'Papanicolaou';
    });
    
    const citologiaRegex = /\bcito[lgj][ií]a\s+cervical\b/gi;
    text = text.replace(citologiaRegex, (match) => {
        if (match === match.toUpperCase()) return 'CITOLOGÍA CERVICAL';
        if (match.startsWith('C') || match.startsWith('c')) {
            return match[0] === 'C' ? 'Citología cervical' : 'citología cervical';
        }
        return 'citología cervical';
    });

    if (text.includes('<') && text.includes('>')) {
        return text.replace(/(>|\.\s+|^\s*)([a-záéíóúñ])/gi, (match, prefix, char) => {
            return prefix + char.toUpperCase();
        });
    }
    return text.split(/(\.\s+|\n+)/).map((segment, idx) => {
        if (idx % 2 === 0 && segment.length > 0) {
            let trimmed = segment.trimStart();
            let leadingSpace = segment.substring(0, segment.length - trimmed.length);
            if (trimmed.length > 0) {
                trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            }
            return leadingSpace + trimmed;
        }
        return segment;
    }).join('');
}

function notifyUser(msg, type = 'success') {
    if (typeof window.showToast === 'function') {
        window.showToast(msg, type);
    } else if (typeof showToast === 'function') {
        showToast(msg, type);
    } else {
        alert(msg);
    }
}

function setEditorReadOnlyState(isReadOnly) {
    const modal = document.getElementById('reportEditorModalOverlay');
    if (!modal) return;
    
    // Inputs, Selects, Textareas
    const inputs = modal.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.id !== 're_btnSalir' && !input.classList.contains('close-btn')) {
            input.disabled = isReadOnly;
        }
    });

    // Divs editables
    const editables = modal.querySelectorAll('div[contenteditable]');
    editables.forEach(div => {
        div.setAttribute('contenteditable', isReadOnly ? 'false' : 'true');
        if (isReadOnly) {
            div.style.backgroundColor = 'var(--bg-readonly)';
            div.style.cursor = 'not-allowed';
        } else {
            div.style.backgroundColor = 'var(--bg-general)';
            div.style.cursor = 'text';
        }
    });
    
    // Botones del editor
    const btnGuardar = document.getElementById('re_btnGuardar');
    if (btnGuardar) {
        btnGuardar.style.display = isReadOnly ? 'none' : '';
    }
    
    const btnUnlockCode = document.getElementById('re_btnUnlockCode');
    if (btnUnlockCode) {
        btnUnlockCode.style.display = isReadOnly ? 'none' : '';
    }
    
    const actionButtons = modal.querySelectorAll('.file-upload-label-btn, .upload-zone, .btn-dictado, .tb-btn, .editor-btn-primary, .editor-btn-secondary');
    actionButtons.forEach(btn => {
        if (btn.id !== 're_btnSalir' && btn.id !== 're_btnVerSolicitud' && btn.id !== 're_btnFirma' && btn.id !== 're_btnPreview') {
            btn.style.display = isReadOnly ? 'none' : '';
        }
    });
}

function setFieldLockState(inputId, buttonId, isLocked) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (input) {
        input.readOnly = isLocked;
        if (isLocked) {
            input.classList.add('readonly-field');
        } else {
            input.classList.remove('readonly-field');
        }
    }
    if (button) {
        button.innerHTML = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
    }
}

export function populateEditorModal(codAtencion) {
    resetEditorCropperWorkspaces();
    if (!codAtencion) return false;

    // Reset all editor input fields and contenteditable elements to prevent cross-patient DOM leakage
    const fieldsToClear = [
        're_codAtencion', 're_dni', 're_nomPaciente', 're_apePaciente', 're_edad',
        're_telefono', 're_fContacto', 're_telContacto', 're_medSolicitante',
        're_motivoEstudio', 're_fecIngreso', 're_fecProbable', 're_fecEntregaReal',
        're_doctor', 're_clinica', 're_catMacro', 're_planMacro', 're_catMicro',
        're_planMicro', 're_catDiag', 're_planDiag'
    ];
    fieldsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const editablesToClear = [
        're_macroDesc', 're_macroDesc_full',
        're_microDesc', 're_microDesc_full',
        're_diagnostico', 're_diagnostico_full'
    ];
    editablesToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    let patient = null;
    if (typeof codAtencion === 'object' && codAtencion !== null) {
        patient = codAtencion;
    } else {
        const cleanCode = String(codAtencion).trim().toLowerCase();
        const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
        patient = patientDatabase.find(x => {
            const code = String(x.codAtencion || '').trim().toLowerCase();
            return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
        });
    }

    if (!patient) {
        if (typeof showToast === 'function') showToast(`No se encontró el registro ${codAtencion}.`, 'error');
        return false;
    }

    // Auto-recuperación si faltan descripciones clínicas
    const pTargetCode = String(patient.codAtencion || codAtencion || '').trim().toLowerCase().replace(/[-_\s]/g, '');
    if ((!patient.macroDesc || !patient.diagnostico) && !patient.modificado && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
        const bkp = window.REAL_SUPABASE_PATIENTS.find(b => String(b.codAtencion || '').trim().toLowerCase().replace(/[-_\s]/g, '') === pTargetCode);
        if (bkp) {
            if (!patient.macroDesc && bkp.macroDesc) patient.macroDesc = bkp.macroDesc;
            if (!patient.microDesc && bkp.microDesc) patient.microDesc = bkp.microDesc;
            if (!patient.diagnostico && bkp.diagnostico) patient.diagnostico = bkp.diagnostico;
            if (!patient.especimen && bkp.especimen) patient.especimen = bkp.especimen;
            if (!patient.dni && bkp.dni) patient.dni = bkp.dni;
            if (!patient.paciente && bkp.paciente) patient.paciente = bkp.paciente;
            if (!patient.nombres && bkp.nombres) patient.nombres = bkp.nombres;
            if (!patient.apellidos && bkp.apellidos) patient.apellidos = bkp.apellidos;
            if (!patient.medSolicitante && bkp.medSolicitante) patient.medSolicitante = bkp.medSolicitante;
            if (!patient.clinica && bkp.clinica) patient.clinica = bkp.clinica;
        }
    }
    
    editingCodAtencion = patient.codAtencion || patient.cod_atencion || codAtencion;
    originalCodAtencion = patient.codAtencion || patient.cod_atencion || codAtencion;
    if (typeof window !== 'undefined') {
        window.activePatientCode = patient.codAtencion || patient.cod_atencion || codAtencion;
        window.currentEditingPatient = patient;
        if (typeof window.saveSurgicalCaseToLRU === 'function') {
            window.saveSurgicalCaseToLRU(patient);
        }
    }

    setFieldLockState('re_codAtencion', 're_btnUnlockCode', true);

    // Helper safely sets values with active focus protection
    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            // Si el usuario está activamente escribiendo en este campo, no sobrescribir
            if (document.activeElement === el) return;

            const isContentEditable = el.getAttribute('contenteditable') === 'true' || el.tagName === 'DIV';
            let formattedVal = val !== undefined && val !== null ? String(val) : "";

            if (isContentEditable) {
                // Purga obligatoria de LaTeX en cualquier campo de texto enriquecido al cargar
                formattedVal = cleanLatexToPlainText(formattedVal);
                if (id.includes('macroDesc') || id.includes('microDesc')) {
                    formattedVal = formattedVal.includes('<') ? formattedVal.toLowerCase() : formattedVal.toLowerCase().replace(/\n/g, '<br>');
                } else if (id.includes('diagnostico')) {
                    formattedVal = formattedVal.includes('<') ? formattedVal.toUpperCase() : formattedVal.toUpperCase().replace(/\n/g, '<br>');
                    if (formattedVal && !formattedVal.startsWith('<b>') && !formattedVal.startsWith('<strong>')) {
                        formattedVal = `<b>${formattedVal}</b>`;
                    }
                }
                el.innerHTML = formattedVal;
            } else {
                el.value = formattedVal;
            }
        }
    };

    safeSet('re_codAtencion', patient.codAtencion || patient.cod_atencion || codAtencion);
    safeSet('re_dni', patient.dni || "0");

    let nomVal = "", apeVal = "";
    if (patient.nombres && patient.apellidos) {
        nomVal = patient.nombres;
        apeVal = patient.apellidos;
    } else if (patient.paciente) {
        const rawP = String(patient.paciente).trim();
        const parts = rawP.split(',');
        if (parts.length > 1) {
            apeVal = parts[0].trim();
            nomVal = parts[1].trim();
        } else {
            const words = rawP.split(/\s+/);
            if (words.length >= 3) {
                apeVal = `${words[0]} ${words[1]}`;
                nomVal = words.slice(2).join(' ');
            } else if (words.length === 2) {
                apeVal = words[0];
                nomVal = words[1];
            } else {
                apeVal = rawP;
                nomVal = '';
            }
        }
    }
    safeSet('re_nomPaciente', nomVal);
    safeSet('re_apePaciente', apeVal);

    const normalizedSex = normalizeSexo(patient.sexo, patient.especimen || patient.telContacto, nomVal || patient.paciente);
    safeSet('re_sexo', normalizedSex);
    
    const finalEdadDisplay = (patient.edad !== undefined && patient.edad !== null && String(patient.edad).trim() !== '' && String(patient.edad).trim() !== '0') ? String(patient.edad).trim() : '--';
    safeSet('re_edad', finalEdadDisplay);
    safeSet('re_telefono', patient.telefono || patient.fContacto || "");
    safeSet('re_fContacto', patient.fContacto || "");
    if (pTargetCode === '26q278' || pTargetCode === '26q-278') {
        const espStr = String(patient.especimen || patient.telContacto || '').toUpperCase();
        const motStr = String(patient.motivoEstudio || '').toUpperCase();
        if (espStr.includes('CERVIX') || motStr.includes('CUELLO UTERINO') || !patient.especimen || patient.especimen === 'CERVIX') {
            patient.especimen = 'BIOPSIA CUTANEA';
            patient.telContacto = 'BIOPSIA CUTANEA';
            patient.motivoEstudio = 'NEVUS VERRUGOSO DE CUERO CABELLUDO';
            patient.modificado = true;
        }
    }

    safeSet('re_telContacto', patient.especimen || patient.telContacto || "");
    safeSet('re_medSolicitante', patient.medSolicitante || "");
    safeSet('re_motivoEstudio', patient.motivoEstudio || "");
    safeSet('re_fecIngreso', patient.fecRegistro || "");
    safeSet('re_fecEntregaReal', patient.fecEntrega || "");

    if (patient.fecRegistro) {
        const d = new Date(patient.fecRegistro + 'T00:00:00');
        if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + 5);
            safeSet('re_fecProbable', d.toISOString().split('T')[0]);
        }
    } else {
        safeSet('re_fecProbable', "");
    }
    
    safeSet('re_doctor', "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA");
    safeSet('re_casetes', patient.casetes || 1);
    safeSet('re_clinica', (patient.clinica && patient.clinica.trim() && patient.clinica.toLowerCase() !== 'sin clinica') ? patient.clinica : "CLÍNICA CARRIÓN");
    if (patient.macroDesc) patient.macroDesc = cleanLatexToPlainText(patient.macroDesc);
    if (patient.microDesc) patient.microDesc = cleanLatexToPlainText(patient.microDesc);
    if (patient.diagnostico) patient.diagnostico = cleanLatexToPlainText(patient.diagnostico);

    safeSet('re_diagnostico', cleanLatexToPlainText(patient.diagnostico || ""));
    safeSet('re_diagnostico_full', cleanLatexToPlainText(patient.diagnostico || ""));
    // Populate templates dynamically according to patient's service
    if (typeof window.populateEditorTemplates === 'function') {
        window.populateEditorTemplates(patient.service || 'Q');
    }
    
    // Auto-detectar especialidades según el órgano / espécimen si vienen vacías
    const especimenText = String(patient.especimen || patient.telContacto || '').toUpperCase();
    let defaultCatMacroId = patient.catMacro || "";
    let defaultCatMicroId = patient.catMicro || "";

    if (!defaultCatMacroId || !defaultCatMicroId) {
        if (especimenText.includes('VESICUL') || especimenText.includes('VESÍCUL') || especimenText.includes('COLECIST')) {
            defaultCatMacroId = defaultCatMacroId || "23";
            defaultCatMicroId = defaultCatMicroId || "24";
        } else if (especimenText.includes('APENDIC') || especimenText.includes('APÉNDIC')) {
            defaultCatMacroId = defaultCatMacroId || "22";
            defaultCatMicroId = defaultCatMicroId || "13";
        } else if (especimenText.includes('PROSTAT') || especimenText.includes('PRÓSTAT') || especimenText.includes('RTUP') || especimenText.includes('TURP')) {
            defaultCatMacroId = defaultCatMacroId || "9";
            defaultCatMicroId = defaultCatMicroId || "25";
        } else if (especimenText.includes('GASTR') || especimenText.includes('ESTOMAG') || especimenText.includes('ESTÓMAG')) {
            defaultCatMacroId = defaultCatMacroId || "3";
            defaultCatMicroId = defaultCatMicroId || "17";
        } else if (especimenText.includes('CERVIX') || especimenText.includes('CÉRVIZ') || especimenText.includes('ENDOMETR') || especimenText.includes('UTER') || especimenText.includes('CUELLO')) {
            defaultCatMacroId = defaultCatMacroId || "4";
            defaultCatMicroId = defaultCatMicroId || "18";
        } else if (especimenText.includes('PAP') || especimenText.includes('CITOLOG')) {
            defaultCatMacroId = defaultCatMacroId || "28";
            defaultCatMicroId = defaultCatMicroId || "29";
        }
    }

    safeSet('re_catMacro', defaultCatMacroId);
    safeSet('re_catMacro_full', defaultCatMacroId);
    if (typeof window.actualizarPlantillasSegunEspecialidad === 'function') {
        window.actualizarPlantillasSegunEspecialidad('macro', defaultCatMacroId);
    }
    safeSet('re_planMacro', patient.planMacro || "");
    safeSet('re_planMacro_full', patient.planMacro || "");
    safeSet('re_macroDesc', cleanLatexToPlainText(patient.macroDesc || ""));
    safeSet('re_macroDesc_full', cleanLatexToPlainText(patient.macroDesc || ""));
    
    safeSet('re_catMicro', defaultCatMicroId);
    safeSet('re_catMicro_full', defaultCatMicroId);
    safeSet('re_catDiag', defaultCatMicroId);
    safeSet('re_catDiag_full', defaultCatMicroId);
    if (typeof window.actualizarPlantillasSegunEspecialidad === 'function') {
        window.actualizarPlantillasSegunEspecialidad('micro', defaultCatMicroId);
        window.actualizarPlantillasSegunEspecialidad('diag', defaultCatMicroId);
    }
    safeSet('re_planMicro', patient.planMicro || "");
    safeSet('re_planMicro_full', patient.planMicro || "");
    safeSet('re_planDiag', patient.planMicro || "");
    safeSet('re_planDiag_full', patient.planMicro || "");
    safeSet('re_microDesc', cleanLatexToPlainText(patient.microDesc || ""));
    safeSet('re_microDesc_full', cleanLatexToPlainText(patient.microDesc || ""));

    // Clear files
    const filesTableBody = document.getElementById('re_filesTableBody');
    if (filesTableBody) filesTableBody.innerHTML = `<tr><td class="empty-table-cell">No hay información solicitada</td></tr>`;
    
    const fileStatus = document.getElementById('re_fileStatus');
    // Soporte dual snake/camelCase estricto del paciente en edición
    const existingSolicitud = patient.solicitudInforme || patient.solicitud_informe || null;
    if (existingSolicitud && typeof existingSolicitud === 'string' && existingSolicitud.trim() !== '') {
        window.currentUploadedFileBase64 = existingSolicitud;
        window.currentUploadedFileUrl = existingSolicitud;
        patient.solicitudInforme = existingSolicitud;
        patient.solicitud_informe = existingSolicitud;
        if (fileStatus) fileStatus.textContent = "✅ Solicitud cargada y lista";
    } else if (window.currentUploadedFileBase64 && window.activePatientCode === (patient.codAtencion || patient.cod_atencion)) {
        // Preservar archivo recién subido si activePatientCode coincide
        patient.solicitudInforme = window.currentUploadedFileBase64;
        patient.solicitud_informe = window.currentUploadedFileBase64;
        if (fileStatus) fileStatus.textContent = "✅ Solicitud cargada y lista";
    } else {
        if (window.currentUploadedFileUrl && window.currentUploadedFileUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(window.currentUploadedFileUrl); } catch(e) {}
        }
        window.currentUploadedFileUrl = null;
        window.currentUploadedFileBase64 = null;
        if (fileStatus) fileStatus.textContent = "Buscando solicitud digitalizada...";

        // Búsqueda asíncrona inmediata en IndexedDB (tienda principal y LRU)
        const pCodeToLookup = patient.codAtencion || patient.cod_atencion || codAtencion;
        if (pCodeToLookup) {
            getPatientFromIndexedDB(pCodeToLookup).then(fromIdb => {
                const foundSol = fromIdb?.solicitudInforme || fromIdb?.solicitud_informe;
                if (foundSol && typeof foundSol === 'string' && foundSol.trim() !== '') {
                    window.currentUploadedFileBase64 = foundSol;
                    window.currentUploadedFileUrl = foundSol;
                    patient.solicitudInforme = foundSol;
                    patient.solicitud_informe = foundSol;
                    if (document.getElementById('re_fileStatus')) {
                        document.getElementById('re_fileStatus').textContent = "✅ Solicitud cargada y lista";
                    }
                } else {
                    if (document.getElementById('re_fileStatus')) {
                        document.getElementById('re_fileStatus').textContent = "Sin archivos seleccionados";
                    }
                }
            }).catch(() => {
                if (document.getElementById('re_fileStatus')) {
                    document.getElementById('re_fileStatus').textContent = "Sin archivos seleccionados";
                }
            });
        } else {
            if (fileStatus) fileStatus.textContent = "Sin archivos seleccionados";
        }
    }
    safeSet('re_fileInput', "");

    // Map Images
    const setupImage = (id, src) => {
        const preview = document.getElementById(`re_${id}Preview`);
        const previewContainer = document.getElementById(`re_${id}PreviewContainer`);
        const uploadZone = document.getElementById(`re_${id}UploadZone`);
        const rawImg = document.getElementById(`re_${id}Raw`);
        const workspace = document.getElementById(`re_${id}Workspace`);
        const actions = document.getElementById(`re_${id}Actions`);

        const cropStep = document.getElementById(`re_${id}CropStep`);
        const stepHeader = document.querySelector(`#tab_${id} .step-header-row`);

        if (workspace) workspace.style.display = 'none';
        if (actions) actions.style.display = 'none';
        if (cropStep) cropStep.style.display = 'none';
        if (rawImg) rawImg.src = '';

        if (src && String(src).trim() !== '' && preview && previewContainer) {
            preview.src = src;
            previewContainer.style.display = 'flex';
            if (uploadZone) uploadZone.style.display = 'none';
            if (stepHeader) stepHeader.style.display = 'none';
        } else if (preview && previewContainer) {
            preview.src = "";
            previewContainer.style.display = 'none';
            if (uploadZone) uploadZone.style.display = 'flex';
            if (stepHeader) stepHeader.style.setProperty('display', 'flex', 'important');
        }
    };
    setupImage('img01', patient.img01);
    setupImage('img02', patient.img02);
    originalImg01Src = patient.img01 || '';
    originalImg02Src = patient.img02 || '';

    // Cargar o Restablecer Datos 360° Macroscópicos
    currentMacro360Frames = Array.isArray(patient.macro360) && patient.macro360.length > 0 ? patient.macro360 : null;
    const badge360 = document.getElementById('re_macro360StatusBadge');
    const btnRemove360 = document.getElementById('re_btnRemoveMacro360');
    const mount360 = document.getElementById('re_macro360ViewerMount');

    if (mount360) {
        if (!currentMacro360Viewer && typeof Macro360Viewer !== 'undefined') {
            currentMacro360Viewer = new Macro360Viewer(mount360);
        } else if (!currentMacro360Viewer && typeof window.Macro360Viewer !== 'undefined') {
            currentMacro360Viewer = new window.Macro360Viewer(mount360);
        }
        
        if (currentMacro360Viewer) {
            currentMacro360Viewer.setMacroData(patient);
        }

        if (currentMacro360Frames && currentMacro360Viewer) {
            currentMacro360Viewer.loadFrames(currentMacro360Frames);
            if (badge360) {
                badge360.textContent = `${currentMacro360Frames.length} Fotogramas Activos (360°)`;
                badge360.style.background = 'rgba(16, 185, 129, 0.2)';
                badge360.style.color = '#10b981';
                badge360.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            }
            if (btnRemove360) btnRemove360.style.display = 'inline-block';
        } else if (currentMacro360Viewer) {
            currentMacro360Viewer.loadFrames([]);
            if (badge360) {
                badge360.textContent = 'Sin modelo 360°';
                badge360.style.background = 'rgba(56, 189, 248, 0.15)';
                badge360.style.color = '#38bdf8';
                badge360.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            }
            if (btnRemove360) btnRemove360.style.display = 'none';
        }
    }

    let currentUser = null;
    try { currentUser = JSON.parse(localStorage.getItem('currentUser')); } catch(e) {}
    const isClinic = currentUser && currentUser.perfil && currentUser.perfil !== 'Administrador' && currentUser.usuario !== 'admin';
    setEditorReadOnlyState(isClinic);

    const spec = patient.especimen || "";
    if (typeof bindAiRetouchButtonsGlobally === 'function') {
        bindAiRetouchButtonsGlobally();
    }

    return true;
}
export function initReportEditorLogic() {
    if (window._reportEditorLogicInitialized) return;
    window._reportEditorLogicInitialized = true;

    // Tab switching logic
    const reTabButtons = document.querySelectorAll('.tab-header-btn');
    reTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            reTabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) targetPane.classList.add('active');

            // Refrescar y recalcular lienzo de Cropper al alternar a pestañas de imagen
            setTimeout(() => {
                if (tabId === 'tab_img01' && miniCropperInstances['img01']) {
                    try { miniCropperInstances['img01'].resize(); } catch(e){}
                } else if (tabId === 'tab_img02' && miniCropperInstances['img02']) {
                    try { miniCropperInstances['img02'].resize(); } catch(e){}
                } else if (tabId === 'tab_macro360' && currentMacro360Viewer) {
                    try {
                        currentMacro360Viewer._resizeCanvas();
                        currentMacro360Viewer._render();
                    } catch(e){}
                } else if (tabId === 'tab_synoptic') {
                    if (!activeSynopticSchemaId) {
                        renderSynopticForm('prostate_turp');
                    }
                }
            }, 100);
        });
    });

    const btnCopiar = document.getElementById("btnCopiarSynoptic");
    if (btnCopiar) {
        btnCopiar.onclick = () => {
            if (!activeSynopticSchemaId) return;
            const schema = synopticSchemas[activeSynopticSchemaId];
            const reportText = compileSynopticReport(activeSynopticSchemaId, activeSynopticState);
            if (!reportText) {
                showToast("El reporte está vacío, selecciona algunas opciones primero", "warning");
                return;
            }

            const targetFieldId = "re_" + schema.targetField;
            const targetEl = document.getElementById(targetFieldId);
            if (targetEl) {
                let formattedHtml = reportText.replace(/\n/g, '<br>');
                const confirmAppend = confirm("¿Desea anexar esta plantilla al final del reporte actual? (Haga clic en Cancelar para reemplazar todo el contenido)");
                const currentContent = targetEl.innerHTML.trim();
                if (confirmAppend && currentContent !== '' && currentContent !== '<br>') {
                    targetEl.innerHTML = currentContent + "<br><br>" + formattedHtml;
                } else {
                    targetEl.innerHTML = formattedHtml;
                }
                showToast("Reporte sinóptico copiado con éxito", "success");
                switchEditorTab("tab_descrip");
            }
        };
    }

    // File upload logic
    const reFileInput = document.getElementById('re_fileInput');
    const reBtnElegirArchivos = document.getElementById('re_btnElegirArchivos');
    const reBtnCarga = document.getElementById('re_btnCarga');
    const reFileStatus = document.getElementById('re_fileStatus');
    const reBtnVerSolicitud = document.getElementById('re_btnVerSolicitud');

    if (reBtnElegirArchivos && reFileInput) {
        reBtnElegirArchivos.addEventListener('click', () => reFileInput.click());
    }

    if (reFileInput && reFileStatus) {
        reFileInput.addEventListener('change', () => {
            if (reFileInput.files.length > 0) {
                reFileStatus.textContent = reFileInput.files.length + " archivo(s) seleccionado(s)";
                if (reBtnCarga) reBtnCarga.click();
            } else {
                reFileStatus.textContent = "Sin archivos seleccionados";
            }
        });
    }

    if (reBtnCarga && reFileInput) {
        reBtnCarga.addEventListener('click', () => {
            if (reFileInput.files.length > 0) {
                const file = reFileInput.files[0];
                
                // Mostrar estado de carga y compresión
                const originalText = reBtnCarga.textContent;
                reBtnCarga.disabled = true;
                reBtnCarga.textContent = "Comprimiendo...";
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        
                        // Escalar proporcionalmente a máx 1200px: ultraligero y perfectamente legible al ojo humano
                        const maxDimension = 1200;
                        if (width > maxDimension || height > maxDimension) {
                            const ratio = Math.min(maxDimension / width, maxDimension / height);
                            width = Math.round(width * ratio);
                            height = Math.round(height * ratio);
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convertir a formato WebP de alta compresión (peso estimado: 40KB a 70KB)
                        const exportFormat = 'image/webp';
                        const exportQuality = 0.55;
                        
                        canvas.toBlob((blob) => {
                            const finalBlob = blob || file; // fallback al original si falla canvas.toBlob
                            const isCompressed = !!blob;
                            
                            if (window.currentUploadedFileUrl && window.currentUploadedFileUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(window.currentUploadedFileUrl);
                            }
                            window.currentUploadedFileUrl = URL.createObjectURL(finalBlob);
                            
                            // Convertir finalBlob a Base64 para guardado persistente
                            const readerBase64 = new FileReader();
                            readerBase64.onloadend = function() {
                                window.currentUploadedFileBase64 = readerBase64.result;
                            };
                            readerBase64.readAsDataURL(finalBlob);
                            
                            const origSizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
                            const compSizeStr = (finalBlob.size / 1024).toFixed(0) + " KB";
                            
                            if (isCompressed) {
                                showToast(`Solicitud cargada y optimizada (${origSizeStr} → ${compSizeStr})`, "success");
                                if (reFileStatus) {
                                    reFileStatus.textContent = `${file.name} (${compSizeStr} - optimizado)`;
                                }
                            } else {
                                showToast("Solicitud cargada con éxito", "success");
                            }
                            
                            reBtnCarga.disabled = false;
                            reBtnCarga.textContent = originalText;
                        }, exportFormat, exportQuality);
                    };
                    img.onerror = function() {
                        showToast("Error al procesar la imagen. Verifique el archivo.", "error");
                        reBtnCarga.disabled = false;
                        reBtnCarga.textContent = originalText;
                    };
                    img.src = e.target.result;
                };
                reader.onerror = function() {
                    showToast("Error al leer el archivo.", "error");
                    reBtnCarga.disabled = false;
                    reBtnCarga.textContent = originalText;
                };
                reader.readAsDataURL(file);
            } else {
                showToast("Seleccione al menos un archivo para cargar", "error");
            }
        });
    }

    // Lógica del Visor de Solicitud Integrado (Glassmorphism Modal)
    let rotacionActualSolicitud = 0;

    window.abrirVisorSolicitud = async function() {
        const modal = document.getElementById('modalVerSolicitud');
        const img = document.getElementById('imgVisorSolicitud');
        const subtitle = document.getElementById('modalVerSolicitudSubtitle');
        if (!modal || !img) return;

        const cod = (document.getElementById('re_codAtencion')?.value || editingCodAtencion || originalCodAtencion || window.activePatientCode || '').trim();

        // 1. Buscar en variables activas en memoria
        let srcToUse = window.currentUploadedFileUrl || window.currentUploadedFileBase64;
        if (!srcToUse && window.currentEditingPatient) {
            srcToUse = window.currentEditingPatient.solicitudInforme || window.currentEditingPatient.solicitud_informe;
        }
        if (!srcToUse && cod) {
            const inDb = patientDatabase.find(p => cleanCodeFunc(p.codAtencion) === cleanCodeFunc(cod));
            if (inDb) {
                srcToUse = inDb.solicitudInforme || inDb.solicitud_informe;
            }
        }

        // 2. Si aún no está, buscar asíncronamente en IndexedDB (tienda principal y LRU)
        if (!srcToUse && cod && typeof getPatientFromIndexedDB === 'function') {
            try {
                const idbRecord = await getPatientFromIndexedDB(cod);
                srcToUse = idbRecord?.solicitudInforme || idbRecord?.solicitud_informe;
            } catch(e) {}
        }
        if (!srcToUse && cod && typeof getSurgicalCaseFromLRU === 'function') {
            try {
                const lruRecord = await getSurgicalCaseFromLRU(cod);
                srcToUse = lruRecord?.solicitudInforme || lruRecord?.solicitud_informe;
            } catch(e) {}
        }

        // 3. Si aún no está, consultar en tiempo real a Supabase
        if (!srcToUse && cod && typeof fetchFullPatientDetails === 'function' && navigator.onLine) {
            try {
                const fullRecord = await fetchFullPatientDetails(cod);
                srcToUse = fullRecord?.solicitudInforme || fullRecord?.solicitud_informe;
            } catch(e) {}
        }

        if (!srcToUse) {
            if (typeof showToast === 'function') {
                showToast("No se ha cargado ninguna solicitud de informe para este paciente", "warning");
            }
            return;
        }

        // Guardar en memoria para siguientes accesos inmediatos
        window.currentUploadedFileBase64 = srcToUse;
        window.currentUploadedFileUrl = srcToUse;
        if (window.currentEditingPatient) {
            window.currentEditingPatient.solicitudInforme = srcToUse;
            window.currentEditingPatient.solicitud_informe = srcToUse;
        }
        const fileStatus = document.getElementById('re_fileStatus');
        if (fileStatus) fileStatus.textContent = "✅ Solicitud cargada y lista";

        rotacionActualSolicitud = 0;
        img.style.transform = 'rotate(0deg)';
        img.src = srcToUse;

        if (subtitle) {
            subtitle.innerText = cod ? `Orden de atención: ${cod}` : 'Orden de servicio digitalizada';
        }

        modal.style.display = 'flex';
    };

    window.cerrarModalVerSolicitud = function() {
        const modal = document.getElementById('modalVerSolicitud');
        if (modal) modal.style.display = 'none';
    };

    window.rotarImagenSolicitud = function() {
        const img = document.getElementById('imgVisorSolicitud');
        if (!img) return;
        rotacionActualSolicitud = (rotacionActualSolicitud + 90) % 360;
        img.style.transform = `rotate(${rotacionActualSolicitud}deg)`;
    };

    window.descargarImagenSolicitud = function() {
        const img = document.getElementById('imgVisorSolicitud');
        if (!img || !img.src) return;
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `solicitud_${document.getElementById('re_codAtencion')?.value || 'paciente'}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Cerrar con tecla Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.cerrarModalVerSolicitud();
        }
    });

    if (reBtnVerSolicitud) {
        reBtnVerSolicitud.addEventListener('click', () => {
            window.abrirVisorSolicitud();
        });
    }

    // Código de atención change confirmation prompt
    const reCodAtencionInput = document.getElementById('re_codAtencion');
    if (reCodAtencionInput) {
        reCodAtencionInput.addEventListener('change', () => {
            const newValue = reCodAtencionInput.value.trim();
            if (originalCodAtencion && newValue !== originalCodAtencion) {
                const confirmChange = confirm("¿Seguro que quiere cambiar el código de atención?");
                if (!confirmChange) {
                    reCodAtencionInput.value = originalCodAtencion;
                }
            }
        });
    }

    // Helper function to compress images using Canvas API (650px max, 0.78 quality matching exact 300 DPI retina threshold for 5.5cm PDF box size)
    function compressImage(fileOrDataUrl, maxWidth = 650, maxHeight = 650, quality = 0.78) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Downscale if image exceeds max dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed jpeg data URL
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = (err) => {
                reject(err);
            };

            if (typeof fileOrDataUrl === 'string') {
                img.src = fileOrDataUrl;
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(fileOrDataUrl);
            }
        });
    }
    window.compressImage = compressImage;

    // Instancias de Mini-Editor Cropper en vivo (usando objeto de ámbito de módulo)

    function getCropperClass() {
        if (typeof window.Cropper === 'function') return window.Cropper;
        if (typeof Cropper === 'function') return Cropper;
        if (window.Cropper && typeof window.Cropper.default === 'function') return window.Cropper.default;
        return null;
    }

    async function getCropperClassAsync() {
        let cls = getCropperClass();
        if (cls) return cls;

        return new Promise((resolve) => {
            try {
                if (!document.querySelector('link[href*="cropper"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css';
                    document.head.appendChild(link);
                }

                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js';
                script.onload = () => resolve(getCropperClass());
                script.onerror = () => resolve(null);
                document.head.appendChild(script);
            } catch(e) {
                resolve(null);
            }
        });
    }

    async function setupMiniCropper(targetKey, fileOrDataUrl) {
        window.setupMiniCropper = setupMiniCropper;
        const rawImg = document.getElementById(`re_${targetKey}Raw`);
        const cropStep = document.getElementById(`re_${targetKey}CropStep`);
        const workspace = document.getElementById(`re_${targetKey}Workspace`);
        const previewContainer = document.getElementById(`re_${targetKey}PreviewContainer`);
        const actions = document.getElementById(`re_${targetKey}Actions`);

        if (!rawImg || !cropStep || !workspace) return;

        if (miniCropperInstances[targetKey]) {
            try {
                miniCropperInstances[targetKey].destroy();
            } catch (err) {}
            delete miniCropperInstances[targetKey];
        }

        // 1. Ocultar encabezado del Paso 1 para dejar la Mesa de Trabajo de imagen única sin pantalla doble
        const stepHeader = document.querySelector(`#tab_${targetKey} .step-header-row`);
        if (stepHeader) stepHeader.style.setProperty('display', 'none', 'important');

        cropStep.style.setProperty('display', 'block', 'important');
        workspace.style.setProperty('display', 'block', 'important');
        if (actions) actions.style.setProperty('display', 'flex', 'important');
        if (previewContainer) previewContainer.style.setProperty('display', 'none', 'important');

        // Reset slider y botones de proporción
        const slider = document.getElementById(`re_angleSlider_${targetKey}`);
        const angleTxt = document.getElementById(`re_angleTxt_${targetKey}`);
        const btn11 = document.getElementById(`re_btnRatio11_${targetKey}`);
        const btn43 = document.getElementById(`re_btnRatio43_${targetKey}`);

        if (slider) slider.value = 0;
        if (angleTxt) angleTxt.textContent = '0°';
        if (btn11) btn11.classList.add('active');
        if (btn43) btn43.classList.remove('active');

        void workspace.offsetHeight;

        // 2. Lectura garantizada Base64 por FileReader para Cropper.js
        let optimizedDataUrl = '';
        if (typeof fileOrDataUrl === 'string') {
            optimizedDataUrl = fileOrDataUrl;
        } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
            try {
                optimizedDataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(fileOrDataUrl);
                });
            } catch(e) {
                try {
                    optimizedDataUrl = await compressImage(fileOrDataUrl, 1600, 1600, 0.90);
                } catch(e2) {
                    console.error("Error al leer archivo en Base64:", e2);
                }
            }
        }

        if (!optimizedDataUrl) {
            notifyUser("Error al cargar la imagen seleccionada.", "error");
            return;
        }

        let isInitialized = false;
        const initCropper = async () => {
            if (isInitialized) return;
            isInitialized = true;

            if (miniCropperInstances[targetKey]) {
                try { miniCropperInstances[targetKey].destroy(); } catch(err){}
                delete miniCropperInstances[targetKey];
            }

            const CropperClass = await getCropperClassAsync();
            if (!CropperClass) {
                console.error("[MiniCropper Error] Librería Cropper.js no encontrada.");
                notifyUser("Error: La librería de recorte no está cargada. Intente recargar la página (F5).", "error");
                return;
            }

            try {
                rawImg.style.display = 'none';
                const cropperInstance = new CropperClass(rawImg, {
                    aspectRatio: 1,       // Default 1:1 Cuadrado
                    viewMode: 0,          // Modo libre sin restricciones de clamping
                    dragMode: 'move',     // Permite arrastrar la caja y la foto
                    autoCrop: true,
                    autoCropArea: 0.60,   // 60% de la foto para alejar del borde perimetral
                    responsive: true,
                    restore: false,
                    modal: false,         // Desactivar oscurecimiento para mantener brillo original 100%
                    guides: true,
                    center: true,
                    highlight: true,
                    background: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: true,
                    zoomable: true,
                    scalable: true,
                    rotatable: true,
                    ready: function() {
                        console.log(`[MiniCropper Success] Instancia ${targetKey} optimizada y lista.`);
                        try {
                            cropperInstance.resize();
                            cropperInstance.crop();
                            setTimeout(() => {
                                try {
                                    cropperInstance.resize();
                                    const canvasData = cropperInstance.getCanvasData();
                                    if (canvasData && canvasData.width > 0) {
                                        const side = Math.min(canvasData.width, canvasData.height) * 0.60;
                                        const left = canvasData.left + (canvasData.width - side) / 2;
                                        const top = canvasData.top + (canvasData.height - side) / 2;
                                        cropperInstance.setCropBoxData({
                                            left: left,
                                            top: top,
                                            width: side,
                                            height: side
                                        });
                                    }
                                } catch(e){}
                            }, 150);
                        } catch(e){}
                    }
                });

                miniCropperInstances[targetKey] = cropperInstance;
            } catch (err) {
                console.error(`[MiniCropper Exception ${targetKey}]`, err);
            }
        };

        rawImg.src = optimizedDataUrl;
        setTimeout(() => {
            initCropper();
            try { bindAiRetouchButtonsGlobally(); } catch(e){}
        }, 150);
    }
    window.setupMiniCropper = setupMiniCropper;

    // Vincular controles de Proporción (1:1 / 4:3), Rotación y Recorte para ambos adjuntos
    ['img01', 'img02'].forEach(key => {
        const btnResetCrop = document.getElementById(`re_btnResetCrop_${key}`);
        const btn11 = document.getElementById(`re_btnRatio11_${key}`);
        const btn43 = document.getElementById(`re_btnRatio43_${key}`);
        const btnRotLeft = document.getElementById(`re_btnRotateLeft_${key}`);
        const btnRotRight = document.getElementById(`re_btnRotateRight_${key}`);
        const slider = document.getElementById(`re_angleSlider_${key}`);
        const angleTxt = document.getElementById(`re_angleTxt_${key}`);
        const btnCrop = document.getElementById(`re_btnCrop${key === 'img01' ? 'Img01' : 'Img02'}`);
        const btnCancel = document.getElementById(`re_btnCancelCrop${key === 'img01' ? 'Img01' : 'Img02'}`);
        const cropStep = document.getElementById(`re_${key}CropStep`);
        const preview = document.getElementById(`re_${key}Preview`);
        const previewContainer = document.getElementById(`re_${key}PreviewContainer`);

        if (btnResetCrop) {
            btnResetCrop.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    const rawImg = document.getElementById(`re_${key}Raw`);
                    if (rawImg && rawImg.src) {
                        if (miniCropperInstances[key]) {
                            try { miniCropperInstances[key].destroy(); } catch(err){}
                            delete miniCropperInstances[key];
                        }
                        setupMiniCropper(key, rawImg.src);
                        notifyUser("Caja de recorte restablecida al centro.", "info");
                    }
                } catch (err) {
                    console.error("Error al reajustar recorte:", err);
                }
            });
        }

        if (btn11) {
            btn11.addEventListener('click', (e) => {
                e.preventDefault();
                btn11.classList.add('active');
                if (btn43) btn43.classList.remove('active');
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.setAspectRatio === 'function') {
                    cropper.setAspectRatio(1);
                }
            });
        }
        if (btn43) {
            btn43.addEventListener('click', (e) => {
                e.preventDefault();
                btn43.classList.add('active');
                if (btn11) btn11.classList.remove('active');
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.setAspectRatio === 'function') {
                    cropper.setAspectRatio(4 / 3);
                }
            });
        }
        if (btnRotLeft) {
            btnRotLeft.addEventListener('click', (e) => {
                e.preventDefault();
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.rotate === 'function') {
                    cropper.rotate(-90);
                } else {
                    notifyUser("Suba o vuelva a seleccionar la imagen para activar la rotación.", "info");
                }
            });
        }
        if (btnRotRight) {
            btnRotRight.addEventListener('click', (e) => {
                e.preventDefault();
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.rotate === 'function') {
                    cropper.rotate(90);
                } else {
                    notifyUser("Suba o vuelva a seleccionar la imagen para activar la rotación.", "info");
                }
            });
        }
        if (slider) {
            slider.addEventListener('input', () => {
                const val = parseInt(slider.value) || 0;
                if (angleTxt) angleTxt.textContent = `${val}°`;
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.rotateTo === 'function') {
                    cropper.rotateTo(val);
                }
            });
        }
        if (btnCrop) {
            btnCrop.addEventListener('click', async (e) => {
                e.preventDefault();
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.getCroppedCanvas === 'function') {
                    const canvas = cropper.getCroppedCanvas();
                    if (canvas) {
                        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
                        const finalBase64 = await compressImage(croppedDataUrl, 650, 650, 0.78);
                        if (preview) preview.src = finalBase64;
                        if (previewContainer) previewContainer.style.display = 'flex';
                        if (cropStep) cropStep.style.display = 'none';
                        try { cropper.destroy(); } catch(err){}
                        delete miniCropperInstances[key];
                        setTimeout(() => { if (typeof window.drawLiveHistogram === 'function') window.drawLiveHistogram(key); }, 60);
                    } else {
                        notifyUser("Error al obtener el recorte de la imagen.", "error");
                    }
                } else {
                    notifyUser("Por favor vuelva a seleccionar la imagen para recortar.", "info");
                }
            });
        }
        if (btnCancel) {
            btnCancel.addEventListener('click', (e) => {
                e.preventDefault();
                if (cropStep) cropStep.style.display = 'none';
                const stepHeader = document.querySelector(`#tab_${key} .step-header-row`);
                if (stepHeader) stepHeader.style.setProperty('display', 'flex', 'important');
                if (miniCropperInstances[key]) {
                    try { miniCropperInstances[key].destroy(); } catch(err){}
                    delete miniCropperInstances[key];
                }
            });
        }
    });

// =========================================================================
// MOTOR DE HISTOGRAMA EN TIEMPO REAL Y AJUSTE FINO FOTOMÉTRICO (SLIDERS)
// =========================================================================
window.drawLiveHistogram = function(key) {
    const previewImg = document.getElementById(`re_${key}Preview`);
    const histCanvas = document.getElementById(`re_hist_${key}`);
    const histAlert = document.getElementById(`re_hist_alert_${key}`);
    if (!previewImg || !histCanvas || !previewImg.src || previewImg.src.endsWith('/reportes.html')) return;

    const ctx = histCanvas.getContext('2d');
    const width = histCanvas.width;
    const height = histCanvas.height;
    ctx.clearRect(0, 0, width, height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 160;
    tempCanvas.height = 120;
    const tCtx = tempCanvas.getContext('2d');
    
    try {
        tCtx.drawImage(previewImg, 0, 0, 160, 120);
        const imgData = tCtx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        const histR = new Uint32Array(256);
        const histG = new Uint32Array(256);
        const histB = new Uint32Array(256);
        const histL = new Uint32Array(256);

        let highLumCount = 0;
        let lowLumCount = 0;
        const total = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
            histR[r]++;
            histG[g]++;
            histB[b]++;
            histL[lum]++;

            if (lum > 248) highLumCount++;
            if (lum < 15) lowLumCount++;
        }

        let maxVal = 1;
        for (let i = 1; i < 255; i++) {
            if (histL[i] > maxVal) maxVal = histL[i];
        }

        const renderChannel = (histArr, color, fillAlpha) => {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, height);
            for (let i = 0; i < 256; i++) {
                const x = (i / 255) * width;
                const h = Math.min(height, (histArr[i] / maxVal) * (height - 4));
                const y = height - h;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.globalAlpha = fillAlpha;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.stroke();
        };

        renderChannel(histR, 'rgba(239, 68, 68, 0.4)', 0.15);
        renderChannel(histG, 'rgba(34, 197, 94, 0.4)', 0.15);
        renderChannel(histB, 'rgba(59, 130, 246, 0.5)', 0.20);
        renderChannel(histL, 'rgba(248, 250, 252, 0.8)', 0.1);

        if (histAlert) {
            if (highLumCount / total > 0.22) {
                histAlert.textContent = "⚠️ Alerta: Luces Quemadas";
                histAlert.style.color = "#f87171";
            } else if (lowLumCount / total > 0.30) {
                histAlert.textContent = "⚠️ Alerta: Subexpuesta";
                histAlert.style.color = "#fbbf24";
            } else {
                histAlert.textContent = "✅ Histograma Calibrado";
                histAlert.style.color = "#10b981";
            }
        }
    } catch(e) {}
};

window.applyLiveAdjustments = function(key) {
    const previewImg = document.getElementById(`re_${key}Preview`);
    const rawImg = document.getElementById(`re_${key}Raw`);
    const briSlider = document.getElementById(`re_slide_bri_${key}`);
    const conSlider = document.getElementById(`re_slide_con_${key}`);
    const satSlider = document.getElementById(`re_slide_sat_${key}`);

    const briVal = document.getElementById(`re_val_bri_${key}`);
    const conVal = document.getElementById(`re_val_con_${key}`);
    const satVal = document.getElementById(`re_val_sat_${key}`);

    if (!previewImg || !briSlider || !conSlider || !satSlider) return;

    const b = parseInt(briSlider.value, 10) || 0;
    const c = parseInt(conSlider.value, 10) || 0;
    const s = parseInt(satSlider.value, 10) || 0;

    if (briVal) briVal.textContent = b > 0 ? `+${b}` : b;
    if (conVal) conVal.textContent = c > 0 ? `+${c}` : c;
    if (satVal) satVal.textContent = s > 0 ? `+${s}` : s;

    let filterStr = "";
    if (b !== 0) filterStr += ` brightness(${100 + b}%)`;
    if (c !== 0) filterStr += ` contrast(${100 + c}%)`;
    if (s !== 0) filterStr += ` saturate(${100 + s}%)`;

    previewImg.style.filter = filterStr.trim() || 'none';
    if (rawImg) rawImg.style.filter = filterStr.trim() || 'none';

    setTimeout(() => { window.drawLiveHistogram(key); }, 50);
};

window.autoCalibrateHistogram = function(key) {
    const previewImg = document.getElementById(`re_${key}Preview`);
    const briSlider = document.getElementById(`re_slide_bri_${key}`);
    const conSlider = document.getElementById(`re_slide_con_${key}`);
    const satSlider = document.getElementById(`re_slide_sat_${key}`);

    if (briSlider) briSlider.value = 0;
    if (conSlider) conSlider.value = 0;
    if (satSlider) satSlider.value = 0;

    const briVal = document.getElementById(`re_val_bri_${key}`);
    const conVal = document.getElementById(`re_val_con_${key}`);
    const satVal = document.getElementById(`re_val_sat_${key}`);
    if (briVal) briVal.textContent = "0";
    if (conVal) conVal.textContent = "0";
    if (satVal) satVal.textContent = "0";

    if (previewImg) previewImg.style.filter = 'none';

    const btnAiMicro = document.getElementById(`re_btnAiMicro_${key}`);
    if (btnAiMicro) {
        btnAiMicro.click();
    }
};

const originalPreRetouchedMap = {};
let pendingRetouchCallback = null;

function bindAiRetouchButtonsGlobally() {
    const compareModal = document.getElementById('reRetouchCompareModalOverlay');
    const compareBefore = document.getElementById('reCompareImgBefore');
    const compareAfter = document.getElementById('reCompareImgAfter');
    const btnApplyCompare = document.getElementById('reBtnApplyCompare');
    const btnDiscardCompare = document.getElementById('reBtnDiscardCompare');

    if (btnApplyCompare && !btnApplyCompare._bound) {
        btnApplyCompare._bound = true;
        btnApplyCompare.onclick = (e) => {
            e.preventDefault();
            if (typeof pendingRetouchCallback === 'function') {
                pendingRetouchCallback();
                pendingRetouchCallback = null;
            }
            if (compareModal) compareModal.style.display = 'none';
        };
    }

    if (btnDiscardCompare && !btnDiscardCompare._bound) {
        btnDiscardCompare._bound = true;
        btnDiscardCompare.onclick = (e) => {
            e.preventDefault();
            pendingRetouchCallback = null;
            if (compareModal) compareModal.style.display = 'none';
            notifyUser("Retoque descartado. Se conservó la fotografía original.", "info");
        };
    }

    ['img01', 'img02'].forEach(key => {
        const previewContainer = document.getElementById(`re_${key}PreviewContainer`);
        const cropStep = document.getElementById(`re_${key}CropStep`);
        const previewImg = document.getElementById(`re_${key}Preview`);
        const rawImg = document.getElementById(`re_${key}Raw`);
        const actions = document.getElementById(`re_${key}Actions`);
        const btnUndo = document.getElementById(`re_btnUndoRetouch_${key}`);

        if (btnUndo) {
            btnUndo.onclick = (e) => {
                e.preventDefault();
                if (originalPreRetouchedMap[key]) {
                    if (previewImg) previewImg.src = originalPreRetouchedMap[key];
                    if (rawImg) rawImg.src = originalPreRetouchedMap[key];
                    btnUndo.style.display = 'none';
                    notifyUser("Retoque deshecho. Se restauró la foto recortada original.", "info");
                }
            };
        }

        ['Macro', 'Micro', 'Pap'].forEach(type => {
            const btnPrimary = document.getElementById(`re_btnAi${type}_${key}`);
            const btnStep2 = document.getElementById(`re_btnAi${type}_${key}_step2`);

            const handleAiRetouch = () => {
                let src = '';

                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.getCroppedCanvas === 'function') {
                    try {
                        const cvs = cropper.getCroppedCanvas();
                        if (cvs) src = cvs.toDataURL('image/jpeg', 0.90);
                    } catch(e) {}
                }

                if (!src) {
                    src = (previewImg && previewImg.src && !previewImg.src.endsWith('/reportes.html')) ? previewImg.src : (rawImg ? rawImg.src : '');
                }

                if (!src || src.endsWith('/reportes.html')) {
                    notifyUser("Por favor cargue una imagen primero.", "warning");
                    return;
                }

                if (!originalPreRetouchedMap[key]) {
                    originalPreRetouchedMap[key] = src;
                }

                notifyUser(`Procesando retoque de ${type} en alta precisión...`, "info");

                const applyRetouchResult = (retouchedSrc) => {
                    if (previewImg) previewImg.src = retouchedSrc;
                    if (rawImg) rawImg.src = retouchedSrc;
                    if (previewContainer) previewContainer.style.display = 'flex';
                    if (cropStep) cropStep.style.display = 'none';
                    if (actions) actions.style.display = 'none';
                    if (btnUndo) btnUndo.style.display = 'inline-flex';
                    setTimeout(() => { if (typeof window.drawLiveHistogram === 'function') window.drawLiveHistogram(key); }, 60);
                    notifyUser(`✨ Retoque de ${type} aplicado con éxito.`, "success");
                };

                const executeRetouch = (processFn) => {
                    processFn(src, type.toLowerCase(), (retouchedSrc) => {
                        if (typeof window.openRetouchCompareModal === 'function') {
                            window.openRetouchCompareModal(src, retouchedSrc, (approvedSrc) => {
                                applyRetouchResult(approvedSrc);
                            }, () => {
                                notifyUser("Retoque descartado. Se conservó la fotografía original.", "info");
                            });
                        } else if (compareModal && compareBefore && compareAfter) {
                            compareBefore.src = src;
                            compareAfter.src = retouchedSrc;
                            compareModal.style.display = 'flex';
                            pendingRetouchCallback = () => applyRetouchResult(retouchedSrc);
                        } else {
                            applyRetouchResult(retouchedSrc);
                        }
                    });
                };

                if (typeof window.processDirectRetouch === 'function') {
                    executeRetouch(window.processDirectRetouch);
                } else if (typeof window.openPhotoEditor === 'function') {
                    window.openPhotoEditor(src, `Muestra_${key}.jpg`, (retouchedSrc) => {
                        applyRetouchResult(retouchedSrc);
                    }, type.toLowerCase());
                }
            };

            if (btnPrimary) btnPrimary.onclick = (e) => { e.preventDefault(); handleAiRetouch(); };
            if (btnStep2) btnStep2.onclick = (e) => { e.preventDefault(); handleAiRetouch(); };
        });
    });
}

    // Carga e iniciación del Mini-Editor para Adjunto Imagen 01
    const reImg01Input = document.getElementById('re_img01Input');
    const reImg01PreviewContainer = document.getElementById('re_img01PreviewContainer');
    const reImg01Preview = document.getElementById('re_img01Preview');
    const reBtnRemoveImg01 = document.getElementById('re_btnRemoveImg01');
    const reBtnEditImg01 = document.getElementById('re_btnEditImg01');

    if (reImg01Input) {
        reImg01Input.addEventListener('click', () => { reImg01Input.value = ''; });
        reImg01Input.addEventListener('change', () => {
            const file = reImg01Input.files[0];
            if (file) {
                notifyUser("Abriendo Mini-Editor de recorte y rotación...", "info");
                setupMiniCropper('img01', file);
            }
        });
    }

    if (reBtnEditImg01) {
        reBtnEditImg01.addEventListener('click', () => {
            if (reImg01Preview && reImg01Preview.src) {
                if (typeof window.openPhotoEditor === 'function') {
                    window.openPhotoEditor(reImg01Preview.src, "Muestra_01.jpg", (croppedBase64) => {
                        reImg01Preview.src = croppedBase64;
                        reImg01PreviewContainer.style.display = 'flex';
                        notifyUser("Imagen 1 retocada con éxito.", "success");
                    });
                } else {
                    notifyUser("El editor interactivo aún se está cargando. La imagen ya está lista.", "info");
                }
            }
        });
    }

    if (reBtnRemoveImg01) {
        reBtnRemoveImg01.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg01Input.value = "";
            reImg01Preview.src = "";
            const raw01 = document.getElementById('re_img01Raw');
            if (raw01) raw01.src = "";
            reImg01PreviewContainer.style.display = 'none';
            if (miniCropperInstances['img01']) {
                try { miniCropperInstances['img01'].destroy(); } catch(err){}
                delete miniCropperInstances['img01'];
            }
            originalImg01Src = ""; // Clear original source to delete completely
        });
    }

    // Carga e iniciación del Mini-Editor para Adjunto Imagen 02
    const reImg02Input = document.getElementById('re_img02Input');
    const reImg02PreviewContainer = document.getElementById('re_img02PreviewContainer');
    const reImg02Preview = document.getElementById('re_img02Preview');
    const reBtnRemoveImg02 = document.getElementById('re_btnRemoveImg02');
    const reBtnEditImg02 = document.getElementById('re_btnEditImg02');

    if (reImg02Input) {
        reImg02Input.addEventListener('click', () => { reImg02Input.value = ''; });
        reImg02Input.addEventListener('change', () => {
            const file = reImg02Input.files[0];
            if (file) {
                notifyUser("Abriendo Mini-Editor de recorte y rotación...", "info");
                setupMiniCropper('img02', file);
            }
        });
    }

    if (reBtnEditImg02) {
        reBtnEditImg02.addEventListener('click', () => {
            if (reImg02Preview && reImg02Preview.src) {
                if (typeof window.openPhotoEditor === 'function') {
                    window.openPhotoEditor(reImg02Preview.src, "Muestra_02.jpg", (croppedBase64) => {
                        reImg02Preview.src = croppedBase64;
                        reImg02PreviewContainer.style.display = 'flex';
                        notifyUser("Imagen 2 retocada con éxito.", "success");
                    });
                } else {
                    notifyUser("El editor interactivo aún se está cargando. La imagen ya está lista.", "info");
                }
            }
        });
    }

    // Carga e interactividad de Video Macroscópico 360°
    const macro360Input = document.getElementById('re_macro360VideoInput');
    const macro360ProgressCard = document.getElementById('re_macro360ProgressCard');
    const macro360ProgressTxt = document.getElementById('re_macro360ProgressTxt');
    const macro360ProgressPercent = document.getElementById('re_macro360ProgressPercent');
    const macro360ProgressBar = document.getElementById('re_macro360ProgressBar');
    const btnRemoveMacro360 = document.getElementById('re_btnRemoveMacro360');

    if (macro360Input) {
        macro360Input.addEventListener('click', () => { macro360Input.value = ''; });
        macro360Input.addEventListener('change', async () => {
            const file = macro360Input.files && macro360Input.files[0];
            if (!file) return;

            try {
                if (macro360ProgressCard) macro360ProgressCard.style.display = 'flex';
                if (macro360ProgressBar) macro360ProgressBar.style.width = '0%';

                const extractFn = typeof extract24FramesFromVideo === 'function'
                    ? extract24FramesFromVideo
                    : window.extract24FramesFromVideo;

                if (!extractFn) {
                    throw new Error("El motor extractor 360° no está disponible.");
                }

                const result = await extractFn(file, {
                    frameCount: 24,
                    targetWidth: 800,
                    targetHeight: 800,
                    quality: 0.82,
                    onProgress: ({ current, total, percentage, message }) => {
                        if (macro360ProgressTxt) macro360ProgressTxt.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:#38bdf8;"></i> ${message}`;
                        if (macro360ProgressPercent) macro360ProgressPercent.textContent = `${percentage}%`;
                        if (macro360ProgressBar) macro360ProgressBar.style.width = `${percentage}%`;
                    }
                });

                currentMacro360Frames = result.frames;

                const mount360 = document.getElementById('re_macro360ViewerMount');
                if (mount360) {
                    if (!currentMacro360Viewer && typeof Macro360Viewer !== 'undefined') {
                        currentMacro360Viewer = new Macro360Viewer(mount360);
                    } else if (!currentMacro360Viewer && typeof window.Macro360Viewer !== 'undefined') {
                        currentMacro360Viewer = new window.Macro360Viewer(mount360);
                    }
                    if (currentMacro360Viewer) {
                        const macroText = document.getElementById('re_macroDesc')?.innerText || document.getElementById('re_macroDesc_full')?.innerText || '';
                        const especimen = document.getElementById('re_telContacto')?.value || '';
                        currentMacro360Viewer.setMacroData({
                            macroDesc: macroText,
                            especimen: especimen
                        });
                        await currentMacro360Viewer.loadFrames(currentMacro360Frames);
                    }
                }

                const badge360 = document.getElementById('re_macro360StatusBadge');
                if (badge360) {
                    badge360.textContent = `24 Fotogramas Activos (360°)`;
                    badge360.style.background = 'rgba(16, 185, 129, 0.2)';
                    badge360.style.color = '#10b981';
                    badge360.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                }
                if (btnRemoveMacro360) btnRemoveMacro360.style.display = 'inline-block';

                notifyUser("¡Modelo 360° generado con éxito! Puede rotarlo con el ratón o flechas ← / →.", "success");
            } catch (err) {
                console.error("Error al procesar video 360°:", err);
                notifyUser(`Error al procesar video: ${err.message}`, "error");
            } finally {
                if (macro360ProgressCard) macro360ProgressCard.style.display = 'none';
            }
        });
    }

    if (btnRemoveMacro360) {
        btnRemoveMacro360.addEventListener('click', () => {
            if (!confirm("¿Desea eliminar la vista macroscópica 360° de este informe?")) return;
            currentMacro360Frames = null;
            if (currentMacro360Viewer) {
                currentMacro360Viewer.loadFrames([]);
            }
            const badge360 = document.getElementById('re_macro360StatusBadge');
            if (badge360) {
                badge360.textContent = 'Sin modelo 360°';
                badge360.style.background = 'rgba(56, 189, 248, 0.15)';
                badge360.style.color = '#38bdf8';
                badge360.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            }
            btnRemoveMacro360.style.display = 'none';
            notifyUser("Modelo 360° eliminado.", "info");
        });
    }

    if (reBtnRemoveImg02) {
        reBtnRemoveImg02.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg02Input.value = "";
            reImg02Preview.src = "";
            const raw02 = document.getElementById('re_img02Raw');
            if (raw02) raw02.src = "";
            reImg02PreviewContainer.style.display = 'none';
            if (miniCropperInstances['img02']) {
                try { miniCropperInstances['img02'].destroy(); } catch(err){}
                delete miniCropperInstances['img02'];
            }
            originalImg02Src = ""; // Clear original source to delete completely
        });
    }

    // Registrar Médico Solicitante
    const reBtnCopiarMed = document.getElementById('re_btnCopiarMed');
    if (reBtnCopiarMed) {
        reBtnCopiarMed.addEventListener('click', () => {
            const docName = document.getElementById('re_medSolicitante').value.trim().toUpperCase();
            if (!docName || docName === 'SELECCIONAR') {
                showToast('Por favor, ingrese el nombre del médico para registrar.', 'error');
                document.getElementById('re_medSolicitante').focus();
                return;
            }

            let normalizedDoc = docName;
            if (!normalizedDoc.startsWith('DR. ') && !normalizedDoc.startsWith('DRA. ') && !normalizedDoc.startsWith('DR ') && !normalizedDoc.startsWith('DRA ')) {
                const firstWord = normalizedDoc.split(' ').filter(w => w !== 'DR' && w !== 'DRA' && w !== 'DR.' && w !== 'DRA.')[0] || '';
                const namesFeminine = ['MARIA', 'ANA', 'CLAUDIA', 'SANDRA', 'ELIZABETH', 'ROSA', 'VIVIANA', 'MIRTHA', 'MERY', 'MARY', 'ELEANA', 'CYNTHIA', 'NATALY', 'CARMEN', 'LUZ', 'PATRICIA', 'JUANA', 'SILVIA', 'BEATRIZ', 'MONICA', 'LAURA', 'GABRIELA'];
                const isFem = namesFeminine.some(n => firstWord.toUpperCase().includes(n));
                normalizedDoc = (isFem ? 'DRA. ' : 'DR. ') + normalizedDoc;
            }

            const exists = doctorsDatabase.some(d => d.doctor.trim().toUpperCase() === normalizedDoc.trim().toUpperCase());
            if (exists) {
                showToast(`El médico "${normalizedDoc}" ya se encuentra registrado.`, 'info');
                (function(){ const el = document.getElementById('re_medSolicitante'); if(el) { el.value = normalizedDoc; } else { console.warn('Missing element: re_medSolicitante'); } })();
                return;
            }

            const docData = {
                doctor: normalizedDoc,
                colegiado: '',
                especializacion: '',
                tipo: 'DR. CLIENTE',
                provincia: '',
                telefono: '',
                correo: '',
                firma: ''
            };

            doctorsDatabase.unshift(docData);
            populateModalDoctorsSelect();
            
            if (usingSupabase) {
                supabase
                    .from('doctores')
                    .insert([{
                        nombre: docData.doctor,
                        cmp: docData.colegiado,
                        rne: docData.especializacion,
                        tipo: docData.tipo,
                        provincia: docData.provincia,
                        telefono: docData.telefono,
                        correo: docData.correo,
                        firma: docData.firma
                    }])
                    .then(({ error }) => {
                        if (error) console.error("Error al registrar doctor en Supabase:", error);
                    });
            }

            const el = document.getElementById('re_medSolicitante'); 
            if(el) { el.value = normalizedDoc; }
            notifyUser(`Médico "${normalizedDoc}" registrado e ingresado con éxito.`, 'success');
        });
    }

    // Auto-asignación en vivo de clínica al ingresar o seleccionar médico solicitante
    const reMedInput = document.getElementById('re_medSolicitante');
    const reClinicaInput = document.getElementById('re_clinica');
    if (reMedInput && reClinicaInput) {
        const autoAssignClinicLive = () => {
            const val = (reMedInput.value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (val.includes('marreros') || val.includes('lloclla')) {
                reClinicaInput.value = 'CLINICA LA MUJER';
            } else if (val.includes('escalante')) {
                reClinicaInput.value = 'CLÍNICA SAN CLEMENTE';
            } else if (val.includes('sanchez') || val.includes('becerra') || val.includes('ulfe') || val.includes('carrion')) {
                reClinicaInput.value = 'CLÍNICA CARRIÓN';
            } else if (val.includes('saire') || val.includes('bocangel')) {
                reClinicaInput.value = 'CLÍNICA ALFA PREVENIR';
            }
        };
        reMedInput.addEventListener('input', autoAssignClinicLive);
        reMedInput.addEventListener('change', autoAssignClinicLive);
    }

    // Registrar Clínica
    const reBtnCopiarClinica = document.getElementById('re_btnCopiarClinica');
    if (reBtnCopiarClinica) {
        reBtnCopiarClinica.addEventListener('click', () => {
            const clinicaName = document.getElementById('re_clinica').value.trim().toUpperCase();
            if (!clinicaName) {
                notifyUser('Por favor, ingrese el nombre de la clínica para registrar.', 'error');
                document.getElementById('re_clinica').focus();
                return;
            }

            const existsInDoctors = doctorsDatabase.some(d => (d.doctor || '').trim().toUpperCase() === clinicaName);
            const existsInPatients = patientDatabase.some(p => (p.clinica || '').trim().toUpperCase() === clinicaName);

            if (existsInDoctors || existsInPatients) {
                notifyUser(`La clínica "${clinicaName}" ya se encuentra registrada.`, 'info');
                const el = document.getElementById('re_clinica');
                if (el) el.value = clinicaName;
                return;
            }

            const clinicaData = {
                doctor: clinicaName,
                colegiado: '',
                especializacion: '',
                tipo: 'CLINICA',
                provincia: '',
                telefono: '',
                correo: '',
                firma: ''
            };

            doctorsDatabase.unshift(clinicaData);
            if (typeof populateModalDoctorsSelect === 'function') populateModalDoctorsSelect();

            if (usingSupabase) {
                supabase
                    .from('doctores')
                    .insert([{
                        nombre: clinicaData.doctor,
                        tipo: 'CLINICA'
                    }])
                    .then(({ error }) => {
                        if (error) console.error("Error al registrar clínica en Supabase:", error);
                    });
            }

            const el = document.getElementById('re_clinica');
            if (el) el.value = clinicaName;

            // Guardar e impactar de inmediato en todas las computadoras en tiempo real
            const savedP = saveEditorDataToDatabase(false);
            if (savedP && typeof window.savePatient === 'function') {
                window.savePatient(savedP);
            }

            notifyUser(`Clínica "${clinicaName}" registrada y sincronizada en tiempo real en todas las computadoras.`, 'success');
        });
    }

    // Salir del editor
    const reBtnSalir = document.getElementById('re_btnSalir');
    if (reBtnSalir) {
        reBtnSalir.addEventListener('click', () => {
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            } else if (typeof applyFilters === 'function') {
                applyFilters(false);
            }
            if (typeof closeModal === 'function') {
                closeModal('reportEditorModalOverlay');
            } else if (typeof window.closeModal === 'function') {
                window.closeModal('reportEditorModalOverlay');
            } else {
                const m = document.getElementById('reportEditorModalOverlay');
                if (m) {
                    m.classList.remove('active');
                    m.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }
        });
    }

    
    function getTempPatientFromEditor() {
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        const getHtml = (id) => {
            const el = document.getElementById(id);
            return el ? el.innerHTML : '';
        };

        const selectedSexo = getVal('re_sexo');
        const existingPat = patientDatabase.find(x => x.codAtencion === getVal('re_codAtencion').trim() || (originalCodAtencion && x.codAtencion === originalCodAtencion));

        const img01 = resolveEditorImage('img01', existingPat ? existingPat.img01 : '');
        const img02 = resolveEditorImage('img02', existingPat ? existingPat.img02 : '');

        const nom = getVal('re_nomPaciente');
        const ape = getVal('re_apePaciente');
        const cod = getVal('re_codAtencion').trim();
        const service = (existingPat && existingPat.service) ? existingPat.service : (cod.toUpperCase().includes('C') ? 'C' : 'Q');

        return {
            service: service,
            codAtencion: cod,
            dni: getVal('re_dni'),
            sexo: normalizeSexo(selectedSexo, getVal('re_telContacto'), `${ape}, ${nom}`),
            nombres: nom,
            apellidos: ape,
            paciente: `${ape}, ${nom}`,
            edad: (getVal('re_edad') && getVal('re_edad') !== '0' && getVal('re_edad') !== '--') ? getVal('re_edad') : '--',
            telefono: getVal('re_telefono'),
            fContacto: getVal('re_fContacto'),
            telContacto: getVal('re_telContacto'),
            medSolicitante: getVal('re_medSolicitante'),
            motivoEstudio: getVal('re_motivoEstudio'),
            especimen: getVal('re_telContacto'),
            doctor: getVal('re_doctor'),
            casetes: parseInt(getVal('re_casetes')) || 1,
            clinica: getVal('re_clinica'),
            diagnostico: cleanLatexToPlainText(autoCorrectClinicalText(getHtml('re_diagnostico'))),
            catMacro: getVal('re_catMacro'),
            planMacro: getVal('re_planMacro'),
            catMicro: getVal('re_catMicro'),
            planMicro: getVal('re_planMicro'),
            catDiag: getVal('re_catDiag'),
            planDiag: getVal('re_planDiag'),
            synopticData: activeSynopticState || {},
            macroDesc: cleanLatexToPlainText(fixMedicalCapitalization(getHtml('re_macroDesc'))),
            microDesc: cleanLatexToPlainText(fixMedicalCapitalization(getHtml('re_microDesc'))),
            fecRegistro: getVal('re_fecIngreso'),
            fecEntrega: getVal('re_fecEntregaReal'),
            img01: img01,
            img02: img02,
            macro360: currentMacro360Frames || (existingPat ? existingPat.macro360 : null) || null
        };
    }


    // Función auxiliar para guardar datos del editor en la base de datos y Supabase
    function saveEditorDataToDatabase(shouldNotify = true) {
        const cleanCode = String(originalCodAtencion || editingCodAtencion || '').trim().toLowerCase();
        const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
        let patient = patientDatabase.find(x => {
            const code = String(x.codAtencion || '').trim().toLowerCase();
            return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
        });

        if (!patient) {
            const newCod = document.getElementById('re_codAtencion') ? document.getElementById('re_codAtencion').value.trim() : (originalCodAtencion || editingCodAtencion);
            patient = { codAtencion: newCod || originalCodAtencion || editingCodAtencion };
            patientDatabase.push(patient);
            sortPatientArray(patientDatabase);
        }

        if (patient) {
            // Guardar campos en el objeto local del paciente
            const newCodAtencion = document.getElementById('re_codAtencion').value.trim();
            const codeChanged = originalCodAtencion && originalCodAtencion !== newCodAtencion;

            // Clonar para evitar mutar el original en patientDatabase antes del borrado
            const targetPatient = codeChanged ? { ...patient } : patient;
            if (codeChanged) {
                delete targetPatient.id; // Evitar conflictos de clave primaria al insertar nuevo registro
            }

            targetPatient.codAtencion = newCodAtencion;
            targetPatient.dni = document.getElementById('re_dni').value;

            const selectedSexo = document.getElementById('re_sexo') ? document.getElementById('re_sexo').value : '';
            targetPatient.sexo = normalizeSexo(selectedSexo || '', document.getElementById('re_telContacto')?.value, `${targetPatient.apellidos}, ${targetPatient.nombres}`);
            targetPatient.fecRegistro = document.getElementById('re_fecIngreso').value;
            targetPatient.fecEntrega = document.getElementById('re_fecEntregaReal').value;

            targetPatient.nombres = (document.getElementById('re_nomPaciente')?.value || '').trim();
            targetPatient.apellidos = (document.getElementById('re_apePaciente')?.value || '').trim();
            if (targetPatient.apellidos && targetPatient.nombres) {
                targetPatient.paciente = `${targetPatient.apellidos}, ${targetPatient.nombres}`;
            } else {
                targetPatient.paciente = targetPatient.apellidos || targetPatient.nombres || '';
            }

            const rawEdadVal = document.getElementById('re_edad').value.trim();
            targetPatient.edad = (rawEdadVal && rawEdadVal !== '0' && rawEdadVal !== '--') ? rawEdadVal : '--';
            targetPatient.telefono = document.getElementById('re_telefono').value;
            targetPatient.fContacto = document.getElementById('re_fContacto').value;
            targetPatient.telContacto = document.getElementById('re_telContacto').value;

            targetPatient.medSolicitante = document.getElementById('re_medSolicitante').value;
            targetPatient.motivoEstudio = document.getElementById('re_motivoEstudio').value;
            targetPatient.especimen = targetPatient.telContacto;

            targetPatient.doctor = document.getElementById('re_doctor').value;
            targetPatient.casetes = parseInt(document.getElementById('re_casetes').value) || 1;
            const enteredClinica = document.getElementById('re_clinica') ? document.getElementById('re_clinica').value.trim() : '';
            targetPatient.clinica = (enteredClinica && enteredClinica.toLowerCase() !== 'sin clinica') ? enteredClinica : 'CLÍNICA CARRIÓN';

            targetPatient.diagnostico = cleanLatexToPlainText(autoCorrectClinicalText(document.getElementById('re_diagnostico').innerHTML));

            const cleanDiagTxt = (document.getElementById('re_diagnostico')?.textContent || document.getElementById('re_diagnostico')?.innerText || '').replace(/<[^>]*>/g, '').trim();
            const cleanMacroTxt = (document.getElementById('re_macroDesc')?.textContent || document.getElementById('re_macroDesc')?.innerText || '').replace(/<[^>]*>/g, '').trim();
            const cleanMicroTxt = (document.getElementById('re_microDesc')?.textContent || document.getElementById('re_microDesc')?.innerText || '').replace(/<[^>]*>/g, '').trim();

            const hasInfoSaved = (cleanDiagTxt !== '' && cleanDiagTxt !== '---') || (cleanMacroTxt !== '' && cleanMacroTxt !== '---') || (cleanMicroTxt !== '' && cleanMicroTxt !== '---');

            // Al hacer clic en Guardar, cualquier cambio en texto, plantilla, clinica, paciente o fotos queda PERMANENTE
            targetPatient.modificado = true;

            const invalidVals = ['', '---', '--', '-', 'null', 'undefined'];
            const hasDiagSaved = !invalidVals.includes(cleanDiagTxt.toLowerCase());
            const hasDraftSaved = !invalidVals.includes(cleanMacroTxt.toLowerCase()) || !invalidVals.includes(cleanMicroTxt.toLowerCase());

            if (hasDiagSaved) {
                targetPatient.firmado = true;
                targetPatient.modificado = true;
                targetPatient.estado = 'Completado';
            } else if (hasDraftSaved) {
                targetPatient.firmado = false;
                targetPatient.modificado = true;
                targetPatient.estado = 'En Proceso';
            } else {
                targetPatient.firmado = false;
                targetPatient.modificado = false;
                targetPatient.estado = 'Pendiente';
            }

            targetPatient.catMacro = document.getElementById('re_catMacro').value;
            targetPatient.planMacro = document.getElementById('re_planMacro').value;
            targetPatient.macroDesc = cleanLatexToPlainText(fixMedicalCapitalization(document.getElementById('re_macroDesc').innerHTML));

            targetPatient.catMicro = document.getElementById('re_catMicro')?.value || '';
            targetPatient.planMicro = document.getElementById('re_planMicro')?.value || '';
            targetPatient.microDesc = cleanLatexToPlainText(fixMedicalCapitalization(document.getElementById('re_microDesc')?.innerHTML || ''));

            targetPatient.catDiag = document.getElementById('re_catDiag')?.value || '';
            targetPatient.planDiag = document.getElementById('re_planDiag')?.value || '';
            targetPatient.synopticData = activeSynopticState || {};

            // Guardar Solicitud de Informe de forma segura sin borrar la existente bajo ninguna circunstancia
            const currentSol = window.currentUploadedFileBase64 
                || targetPatient.solicitudInforme 
                || targetPatient.solicitud_informe 
                || (patient && (patient.solicitudInforme || patient.solicitud_informe)) 
                || (window.currentEditingPatient && (window.currentEditingPatient.solicitudInforme || window.currentEditingPatient.solicitud_informe));

            if (currentSol) {
                targetPatient.solicitudInforme = currentSol;
                targetPatient.solicitud_informe = currentSol;
            } else {
                // Si aún no se encuentra en memoria rápida, verificar patientDatabase para no vaciar un registro existente
                const inDb = patientDatabase.find(p => cleanCodeFunc(p.codAtencion) === cleanCodeFunc(targetPatient.codAtencion));
                const finalSol = (inDb && (inDb.solicitudInforme || inDb.solicitud_informe)) || "";
                targetPatient.solicitudInforme = finalSol;
                targetPatient.solicitud_informe = finalSol;
            }

            // Guardar imágenes de forma segura y robusta
            targetPatient.img01 = resolveEditorImage('img01', targetPatient.img01 || '');
            targetPatient.img02 = resolveEditorImage('img02', targetPatient.img02 || '');

            // Guardar modelo 360° Macroscópico de forma segura
            targetPatient.macro360 = (currentMacro360Frames !== undefined && currentMacro360Frames !== null)
                ? currentMacro360Frames
                : (targetPatient.macro360 || null);

            // Manejar cambio de código de atención
            if (codeChanged) {
                if (typeof window.deletePatient === 'function') {
                    window.deletePatient(originalCodAtencion);
                } else {
                    const oldIdx = patientDatabase.findIndex(x => x.codAtencion === originalCodAtencion);
                    if (oldIdx !== -1) patientDatabase.splice(oldIdx, 1);
                }
                originalCodAtencion = newCodAtencion;
                editingCodAtencion = newCodAtencion;
            }

            // Guardar cambios a IndexedDB y encolar envío a Supabase
            if (typeof window.savePatient === 'function') {
                window.savePatient(targetPatient);
            } else {
                const idx = patientDatabase.findIndex(x => x.codAtencion === targetPatient.codAtencion);
                if (idx !== -1) {
                    patientDatabase[idx] = targetPatient;
                } else {
                    patientDatabase.push(targetPatient);
                }
                sortPatientArray(patientDatabase);
                if (typeof window.triggerAutomaticBackup === 'function') window.triggerAutomaticBackup();
                if (typeof window.refreshPatientTable === 'function') window.refreshPatientTable(); else applyFilters(false);
            }

            try {
                localStorage.setItem('printPatientData', JSON.stringify(targetPatient));
            } catch (e) {
                console.warn("[Storage] Error al persistir printPatientData en localStorage", e);
            }

            if (shouldNotify) {
                if (targetPatient.estado === 'En Proceso' && (!cleanDiagTxt || cleanDiagTxt === '---')) {
                    notifyUser(`📦 Fase 1 guardada: Macroscopía y ${targetPatient.casetes || 1} casete(s) registrados. El caso queda EN PROCESO a la espera de láminas del tecnólogo.`, "success");
                } else {
                    notifyUser("Cambios guardados con éxito en la ficha del paciente", "success");
                }
            } else {
                notifyUser("Sincronizando cambios con la nube en tiempo real...", "info");
            }
            return targetPatient;
        }
        return null;
    }

    // Firma button
    const reBtnFirma = document.getElementById('re_btnFirma');
    if (reBtnFirma) {
        reBtnFirma.addEventListener('click', () => {
            // Auto-generar fecha de entrega si está vacía
            const fecEntregaInput = document.getElementById('re_fecEntregaReal');
            if (fecEntregaInput && !fecEntregaInput.value) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                fecEntregaInput.value = `${yyyy}-${mm}-${dd}`;
            }

            // Asegurar que si el diagnóstico está en blanco se coloque la firma de confirmación
            const diagEl = document.getElementById('re_diagnostico');
            if (diagEl) {
                const cleanDiagText = (diagEl.textContent || diagEl.innerText || '').trim();
                if (!cleanDiagText) {
                    diagEl.innerHTML = '<b>INFORME COMPLETO Y FIRMADO POR PATOLOGÍA.</b>';
                }
            }

            // MARCAR FIRMADO DIRECTAMENTE ANTES DE GUARDAR PARA ATOMICIDAD PERFECTA (0.0s)
            const cleanCode = String(originalCodAtencion || editingCodAtencion || '').trim().toLowerCase();
            const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
            let targetPatient = patientDatabase.find(x => {
                const code = String(x.codAtencion || '').trim().toLowerCase();
                return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
            });

            if (targetPatient) {
                targetPatient.firmado = true;
                targetPatient.estado = 'Completado';
            }

            const savedPatient = saveEditorDataToDatabase(true);
            const tempPatient = savedPatient || targetPatient || getTempPatientFromEditor();
            if (tempPatient) {
                tempPatient.firmado = true;
                tempPatient.estado = 'Completado';
                delete tempPatient._searchKey;
                if (typeof window.savePatient === 'function') {
                    window.savePatient(tempPatient);
                }
                try {
                    localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
                } catch (e) {
                    console.error("[Firma] Error guardando printPatientData en localStorage:", e);
                    try {
                        const light = { ...tempPatient };
                        delete light.solicitudInforme;
                        localStorage.setItem('printPatientData', JSON.stringify(light));
                    } catch (e2) {}
                }
                try {
                    sessionStorage.setItem('printPatientData', JSON.stringify(tempPatient));
                } catch (e3) {}
            }

            closeModal('reportEditorModalOverlay');

            // Refrescar tabla inmediatamente para mostrar el estado COMPLETADO respetando la página actual
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            } else if (typeof applyFilters === 'function') {
                applyFilters(false);
            }

            notifyUser("Informe FIRMADO correctamente. El estado cambió a COMPLETADO.", "success");

            const printUrl = `imprimir.html?autoDownload=true&codAtencion=${encodeURIComponent(tempPatient ? tempPatient.codAtencion || '' : '')}`;
            window.open(printUrl, '_blank', 'width=950,height=1000');
        });
    }

    // Vista Previa button
    const reBtnPreview = document.getElementById('re_btnPreview');
    if (reBtnPreview) {
        reBtnPreview.addEventListener('click', () => {
            // Guardar primero para que los cambios se suban a Supabase inmediatamente
            const savedPatient = saveEditorDataToDatabase(false);
            const tempPatient = savedPatient || getTempPatientFromEditor();

            try {
                localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            } catch (e) {
                console.error("[Vista Previa] Error guardando printPatientData en localStorage:", e);
                try {
                    const light = { ...tempPatient };
                    delete light.solicitudInforme;
                    localStorage.setItem('printPatientData', JSON.stringify(light));
                } catch (e2) {}
            }
            try {
                sessionStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            } catch (e3) {}
            const printUrl = `imprimir.html?autoDownload=false&codAtencion=${encodeURIComponent(tempPatient.codAtencion || '')}`;
            window.open(printUrl, '_blank', 'width=1200,height=950');
        });
    }

    // Guardar cambios del editor
    const reBtnGuardar = document.getElementById('re_btnGuardar');
    if (reBtnGuardar) {
        reBtnGuardar.addEventListener('click', () => {
            saveEditorDataToDatabase(true);
        });
    }

    // Helper de normalización de nombres de categoría
    function normalizeCategoryName(rawName) {
        if (!rawName) return 'OTROS';
        let name = rawName.trim().toUpperCase();
        if (name.includes('PROTOCOLO') || name.includes('SISTEMATIZADO')) {
            return 'PROTOCOLOS SISTEMATIZADOS';
        }
        name = name.replace(/^\((?:MACRO|MICRO)\)\s*/i, '').trim();
        return name || 'OTROS';
    }

    // --- TEMPLATE POPULATION AND SELECTION IN EDITOR MODAL ---
    function actualizarPlantillasSegunEspecialidad(tipo, categoriaId) {
        tipo = tipo.replace('_full', '');
        let selectPlan, selectPlanFull;
        if (tipo === 'macro') {
            selectPlan = document.getElementById('re_planMacro');
            selectPlanFull = document.getElementById('re_planMacro_full');
        } else if (tipo === 'micro') {
            selectPlan = document.getElementById('re_planMicro');
            selectPlanFull = document.getElementById('re_planMicro_full');
        } else if (tipo === 'diag') {
            selectPlan = document.getElementById('re_planDiag');
            selectPlanFull = document.getElementById('re_planDiag_full');
        }

        if (!selectPlan && !selectPlanFull) return;

        if (selectPlan) selectPlan.innerHTML = '<option value="">SELECCIONAR PLANTILLA</option>';
        if (selectPlanFull) selectPlanFull.innerHTML = '<option value="">SELECCIONAR PLANTILLA</option>';

        let plantillas = [];
        const tplsDb = (templatesDatabase && templatesDatabase.length > 0) ? templatesDatabase : (window.defaultTemplates || (typeof defaultTemplates !== 'undefined' ? defaultTemplates : []));
        const catsDb = (categoriesDatabase && categoriesDatabase.length > 0) ? categoriesDatabase : (window.defaultCategories || (typeof defaultCategories !== 'undefined' ? defaultCategories : []));

        if (categoriaId) {
            const categoryObj = catsDb.find(c => String(c.id) === String(categoriaId));
            const catName = categoryObj ? (categoryObj.categoria || '').trim().toUpperCase() : '';
            const normName = normalizeCategoryName(catName);
            const isProtocolos = normName === 'PROTOCOLOS SISTEMATIZADOS' || ['1', '10', '11', '100', '101'].includes(String(categoriaId));

            if (isProtocolos) {
                // Incluir todas las plantillas de protocolos sistematizados y CAP
                plantillas = tplsDb.filter(t => {
                    const cid = String(t.categoryId);
                    const tit = (t.titulo || '').toUpperCase();
                    return ['1', '10', '11', '100', '101'].includes(cid) || tit.startsWith('CAP -') || tit.includes('PROTOCOLO');
                });
            } else if (categoryObj) {
                const matchingCatIds = catsDb
                    .filter(c => normalizeCategoryName(c.categoria) === normName)
                    .map(c => String(c.id));
                plantillas = tplsDb.filter(t => matchingCatIds.includes(String(t.categoryId)));
            } else {
                plantillas = tplsDb.filter(t => String(t.categoryId) === String(categoriaId));
            }

            // Exclusión estricta de plantillas ginecológicas / endometriales si la especialidad seleccionada es Apéndice Cecal
            const isApendiceCat = catName.includes('APÉNDICE') || catName.includes('APENDICE');
            if (isApendiceCat || String(categoriaId) === '22' || String(categoriaId) === '13') {
                plantillas = plantillas.filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return !tit.includes('ENDOMETR') && !tit.includes('PÓLIPO') && !tit.includes('POLIPO') && !tit.includes('LEIOMIOMA') && !tit.includes('CERVIX');
                });
            }
        }
        
        // Si no hay categoría seleccionada, filtrar según el espécimen del formulario
        if (!plantillas || plantillas.length === 0) {
            const telContactoVal = document.getElementById('re_telContacto') ? document.getElementById('re_telContacto').value.toUpperCase() : '';
            if (telContactoVal.includes('VESICUL') || telContactoVal.includes('COLECIST')) {
                plantillas = tplsDb.filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return tit.includes('COLECIST') || tit.includes('VESICUL') || t.categoryId === 23 || t.categoryId === 24;
                });
            } else if (telContactoVal.includes('APENDIC')) {
                plantillas = tplsDb.filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return (t.categoryId === 22 || t.categoryId === 13 || tit.includes('APENDIC')) && !tit.includes('ENDOMETR') && !tit.includes('PÓLIPO') && !tit.includes('POLIPO');
                });
            } else if (telContactoVal.includes('ENDOMETR') || telContactoVal.includes('CERVIX') || telContactoVal.includes('UTER') || telContactoVal.includes('CUELLO') || telContactoVal.includes('POLIPO') || telContactoVal.includes('HIPERPLASIA')) {
                plantillas = tplsDb.filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return t.categoryId === 4 || t.categoryId === 18 || tit.includes('ENDOMETR') || tit.includes('CERVIX') || tit.includes('LEIOMIOMA') || tit.includes('POLIPO') || tit.includes('HIPERPLASIA');
                });
            } else {
                plantillas = [...tplsDb];
            }
        }

        // Deduplicar plantillas por título para que no aparezcan repetidas en el combo
        const uniqueTitlesMap = new Map();
        plantillas.forEach(p => {
            const key = (p.titulo || '').trim().toUpperCase();
            if (!uniqueTitlesMap.has(key)) {
                uniqueTitlesMap.set(key, p);
            }
        });
        const finalPlantillas = Array.from(uniqueTitlesMap.values());

        // Ordenar alfabéticamente por título para fácil localización
        finalPlantillas.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));

        finalPlantillas.forEach(tpl => {
            const opt = document.createElement('option');
            opt.value = tpl.id;
            opt.textContent = tpl.titulo;
            if (selectPlan) selectPlan.appendChild(opt.cloneNode(true));
            if (selectPlanFull) selectPlanFull.appendChild(opt.cloneNode(true));
        });
    }
    window.actualizarPlantillasSegunEspecialidad = actualizarPlantillasSegunEspecialidad;

    function populateEditorTemplates(service = 'Q') {
        const catMacro = document.getElementById('re_catMacro');
        const catMicro = document.getElementById('re_catMicro');
        const catDiag = document.getElementById('re_catDiag');
        const catMacroFull = document.getElementById('re_catMacro_full');
        const catMicroFull = document.getElementById('re_catMicro_full');
        const catDiagFull = document.getElementById('re_catDiag_full');

        const catSelects = [catMacro, catMicro, catDiag, catMacroFull, catMicroFull, catDiagFull].filter(Boolean);
        if (catSelects.length === 0) return;

        // Limpiar combos
        catSelects.forEach(select => {
            select.innerHTML = '<option value="">SELECCIONAR</option>';
        });

        // Poblar especialidades normalizadas
        const cats = (categoriesDatabase && categoriesDatabase.length > 0) ? categoriesDatabase : (window.defaultCategories || (typeof defaultCategories !== 'undefined' ? defaultCategories : []));
        const uniqueCatNames = [...new Set(cats.map(c => normalizeCategoryName(c.categoria)))].sort();

        uniqueCatNames.forEach(catName => {
            const catObj = cats.find(c => normalizeCategoryName(c.categoria) === catName);
            if (!catObj) return;
            const option = document.createElement('option');
            option.value = catObj.id;
            option.textContent = catName;

            catSelects.forEach(select => {
                select.appendChild(option.cloneNode(true));
            });
        });

        // Poblar de inmediato los combos de plantillas
        actualizarPlantillasSegunEspecialidad('macro', catMacro ? catMacro.value : '');
        actualizarPlantillasSegunEspecialidad('micro', catMicro ? catMicro.value : '');
        actualizarPlantillasSegunEspecialidad('diag', catDiag ? catDiag.value : '');
    }
    window.populateEditorTemplates = populateEditorTemplates;

    // =========================================================================
    // MOTOR DE INSERCIÓN CLÍNICA EN DOS FASES (FASE 1: MACRO vs FASE 2: MICRO+DIAG)
    // =========================================================================
    window.insertarPlantillaModular = function(modo) {
        // modo: 'solo_macro' (Fase 1: Talla y Encasatado en Día 0)
        //       'micro_diag' (Fase 2: Lectura de Láminas a los 3 días sin alterar macro previa)
        //       'solo_micro' (Fase 2: Inserción exclusiva de microscopía)
        //       'solo_diag'  (Fase 2: Inserción exclusiva de diagnóstico definitivo)
        //       'completa'   (Ambas fases simultáneas en casos de 1 solo tiempo)
        const tplsDb = (templatesDatabase && templatesDatabase.length > 0) ? templatesDatabase : (window.defaultTemplates || (typeof defaultTemplates !== 'undefined' ? defaultTemplates : []));

        if (modo === 'solo_macro') {
            const selectPlan = document.getElementById('re_planMacro') || document.getElementById('re_planMacro_full');
            const plantillaId = selectPlan ? selectPlan.value : '';
            if (!plantillaId) {
                showToast('Seleccione una plantilla macroscópica primero', 'warning');
                return;
            }

            const schema = getWizardSchemaForTemplate(plantillaId);
            if (schema) {
                abrirPlantillaWizard(plantillaId, null, 'fase1_macro');
                return;
            }

            const plantilla = tplsDb.find(t => String(t.id) === String(plantillaId));
            if (!plantilla) {
                showToast('Plantilla no encontrada', 'error');
                return;
            }

            let textoAInsertar = plantilla.macro || '';
            if (!textoAInsertar) {
                showToast('La plantilla no tiene contenido macroscópico', 'warning');
                return;
            }

            textoAInsertar = cleanLatexToPlainText(fixMedicalCapitalization(textoAInsertar));
            const textarea1 = document.getElementById('re_macroDesc');
            const textarea2 = document.getElementById('re_macroDesc_full');
            const targetEl = textarea1 || textarea2;
            if (targetEl) {
                let formattedHtml = textoAInsertar.replace(/\n/g, '<br>');
                const currentContent = targetEl.innerHTML.trim();
                const newContent = (currentContent === '' || currentContent === '<br>') ? formattedHtml : (currentContent + "<br><br>" + formattedHtml);
                if (textarea1) { textarea1.innerHTML = newContent; textarea1.dispatchEvent(new Event('input', { bubbles: true })); }
                if (textarea2) { textarea2.innerHTML = newContent; textarea2.dispatchEvent(new Event('input', { bubbles: true })); }
            }

            // Detección automática del número de casetes en la macroscopía de la plantilla
            const casetesEl = document.getElementById('re_casetes');
            if (casetesEl) {
                const matchCasetes = textoAInsertar.match(/(\d+)\s*(?:casete|cassette|bloque)/i);
                if (matchCasetes && matchCasetes[1]) {
                    casetesEl.value = String(parseInt(matchCasetes[1], 10));
                }
            }

            // CRÍTICO: re_microDesc y re_diagnostico QUEDAN ESTRICTAMENTE INTACTOS (FASE 1)
            showToast('📦 Fase 1: Macroscopía y casetes insertados. (Microscopía y Diagnóstico quedan pendientes para el tecnólogo)', 'success');
        }
        else if (modo === 'micro_diag') {
            // FASE 2: El patólogo recibe las láminas coloreadas (H&E) 3 días después
            const selectPlan = document.getElementById('re_planMicro') || document.getElementById('re_planDiag') || document.getElementById('re_planMicro_full');
            const plantillaId = selectPlan ? selectPlan.value : '';
            if (!plantillaId) {
                showToast('Seleccione una plantilla en Microscopía o Diagnóstico primero', 'warning');
                return;
            }

            const schema = getWizardSchemaForTemplate(plantillaId);
            if (schema) {
                abrirPlantillaWizard(plantillaId, null, 'fase2_micro');
                return;
            }

            const plantilla = tplsDb.find(t => String(t.id) === String(plantillaId));
            if (!plantilla) {
                showToast('Plantilla no encontrada', 'error');
                return;
            }

            let microText = plantilla.micro || '';
            let diagText = plantilla.diag || '';

            if (!microText && !diagText) {
                showToast('La plantilla no contiene microscopía ni diagnóstico', 'warning');
                return;
            }

            if (microText) {
                microText = cleanLatexToPlainText(fixMedicalCapitalization(microText));
                const textareaMicro1 = document.getElementById('re_microDesc');
                const textareaMicro2 = document.getElementById('re_microDesc_full');
                const targetMicro = textareaMicro1 || textareaMicro2;
                if (targetMicro) {
                    let formattedHtml = microText.replace(/\n/g, '<br>');
                    const currentContent = targetMicro.innerHTML.trim();
                    const newContent = (currentContent === '' || currentContent === '<br>') ? formattedHtml : (currentContent + "<br><br>" + formattedHtml);
                    if (textareaMicro1) { textareaMicro1.innerHTML = newContent; textareaMicro1.dispatchEvent(new Event('input', { bubbles: true })); }
                    if (textareaMicro2) { textareaMicro2.innerHTML = newContent; textareaMicro2.dispatchEvent(new Event('input', { bubbles: true })); }
                }
            }

            if (diagText) {
                diagText = cleanLatexToPlainText(diagText).toUpperCase();
                const textareaDiag1 = document.getElementById('re_diagnostico');
                const textareaDiag2 = document.getElementById('re_diagnostico_full');
                const targetDiag = textareaDiag1 || textareaDiag2;
                if (targetDiag) {
                    let formattedHtml = `<b>${diagText.replace(/\n/g, '<br>')}</b>`;
                    const currentContent = targetDiag.innerHTML.trim();
                    const newContent = (currentContent === '' || currentContent === '<br>') ? formattedHtml : (currentContent + "<br><br>" + formattedHtml);
                    if (textareaDiag1) { textareaDiag1.innerHTML = newContent; textareaDiag1.dispatchEvent(new Event('input', { bubbles: true })); }
                    if (textareaDiag2) { textareaDiag2.innerHTML = newContent; textareaDiag2.dispatchEvent(new Event('input', { bubbles: true })); }
                }
            }

            // CRÍTICO: ¡Macroscopía previa del Día 0 se preserva al 100%!
            showToast('🔬 Fase 2: Microscopía y Diagnóstico aplicados. (¡Macroscopía y casetes del Día 0 preservados intactos!)', 'success');
        }
        else if (modo === 'solo_micro') {
            const selectPlan = document.getElementById('re_planMicro') || document.getElementById('re_planMicro_full');
            const plantillaId = selectPlan ? selectPlan.value : '';
            if (!plantillaId) {
                showToast('Seleccione una plantilla en Microscopía primero', 'warning');
                return;
            }
            const plantilla = tplsDb.find(t => String(t.id) === String(plantillaId));
            if (!plantilla || !plantilla.micro) {
                showToast('La plantilla no tiene contenido microscópico', 'warning');
                return;
            }
            let microText = cleanLatexToPlainText(fixMedicalCapitalization(plantilla.micro));
            const textareaMicro1 = document.getElementById('re_microDesc');
            const textareaMicro2 = document.getElementById('re_microDesc_full');
            const targetMicro = textareaMicro1 || textareaMicro2;
            if (targetMicro) {
                let formattedHtml = microText.replace(/\n/g, '<br>');
                const currentContent = targetMicro.innerHTML.trim();
                const newContent = (currentContent === '' || currentContent === '<br>') ? formattedHtml : (currentContent + "<br><br>" + formattedHtml);
                if (textareaMicro1) { textareaMicro1.innerHTML = newContent; textareaMicro1.dispatchEvent(new Event('input', { bubbles: true })); }
                if (textareaMicro2) { textareaMicro2.innerHTML = newContent; textareaMicro2.dispatchEvent(new Event('input', { bubbles: true })); }
                showToast('Plantilla microscópica insertada (Solo Micro)', 'success');
            }
        }
        else if (modo === 'solo_diag') {
            const selectPlan = document.getElementById('re_planDiag') || document.getElementById('re_planDiag_full') || document.getElementById('re_planMicro');
            const plantillaId = selectPlan ? selectPlan.value : '';
            if (!plantillaId) {
                showToast('Seleccione una plantilla diagnóstica primero', 'warning');
                return;
            }
            const plantilla = tplsDb.find(t => String(t.id) === String(plantillaId));
            if (!plantilla || !plantilla.diag) {
                showToast('La plantilla no tiene contenido diagnóstico', 'warning');
                return;
            }
            let diagText = cleanLatexToPlainText(plantilla.diag).toUpperCase();
            const textareaDiag1 = document.getElementById('re_diagnostico');
            const textareaDiag2 = document.getElementById('re_diagnostico_full');
            const targetDiag = textareaDiag1 || textareaDiag2;
            if (targetDiag) {
                let formattedHtml = `<b>${diagText.replace(/\n/g, '<br>')}</b>`;
                const currentContent = targetDiag.innerHTML.trim();
                const newContent = (currentContent === '' || currentContent === '<br>') ? formattedHtml : (currentContent + "<br><br>" + formattedHtml);
                if (textareaDiag1) { textareaDiag1.innerHTML = newContent; textareaDiag1.dispatchEvent(new Event('input', { bubbles: true })); }
                if (textareaDiag2) { textareaDiag2.innerHTML = newContent; textareaDiag2.dispatchEvent(new Event('input', { bubbles: true })); }
                showToast('Plantilla de diagnóstico insertada (Solo Diagnóstico)', 'success');
            }
        }
        else if (modo === 'completa') {
            const selectPlan = document.getElementById('re_planMacro') || document.getElementById('re_planMicro') || document.getElementById('re_planDiag');
            const plantillaId = selectPlan ? selectPlan.value : '';
            if (plantillaId) {
                const schema = getWizardSchemaForTemplate(plantillaId);
                if (schema) {
                    abrirPlantillaWizard(plantillaId, null, 'completo');
                    return;
                }
                window.desplegarPlantillaCompleta(plantillaId, 'all');
            } else {
                showToast('Seleccione una plantilla primero', 'warning');
            }
        }
    };

    window.insertarPlantilla = function(rawTipo) {
        const tipo = rawTipo.replace('_full', '');
        if (tipo === 'macro') {
            window.insertarPlantillaModular('solo_macro');
        } else if (tipo === 'micro') {
            window.insertarPlantillaModular('solo_micro');
        } else if (tipo === 'diag') {
            window.insertarPlantillaModular('solo_diag');
        } else {
            window.insertarPlantillaModular('solo_macro');
        }
    };

    // --- TEMPLATE DROPDOWNS COORDINATION ---
    function coordinarCategorias(sourceTipo, selectedCategoryId) {
        if (!selectedCategoryId) return;
        sourceTipo = sourceTipo.replace('_full', '');
        
        // Si la fuente es macro, es completamente independiente
        if (sourceTipo === 'macro') return;

        const cats = categoriesDatabase || [];
        const sourceCat = cats.find(c => String(c.id) === String(selectedCategoryId));
        if (!sourceCat) return;
        
        const sourceName = (sourceCat.categoria || '').trim().toUpperCase();
        
        // Sincronizar categorías por nombre homólogo únicamente entre micro y diag
        cats.forEach(c => {
            const name = (c.categoria || '').trim().toUpperCase();
            if (name === sourceName && c.tipo === 'Microscopica') {
                if (sourceTipo !== 'micro') {
                    const el = document.getElementById('re_catMicro');
                    const elFull = document.getElementById('re_catMicro_full');
                    if (el && el.value !== String(c.id)) el.value = c.id;
                    if (elFull && elFull.value !== String(c.id)) elFull.value = c.id;
                    actualizarPlantillasSegunEspecialidad('micro', c.id);
                }
                if (sourceTipo !== 'diag') {
                    const el = document.getElementById('re_catDiag');
                    const elFull = document.getElementById('re_catDiag_full');
                    if (el && el.value !== String(c.id)) el.value = c.id;
                    if (elFull && elFull.value !== String(c.id)) elFull.value = c.id;
                    actualizarPlantillasSegunEspecialidad('diag', c.id);
                }
            }
        });
    }

    function coordinarPlantillaSeleccionada(sourceTipo, selectedTemplateId) {
        sourceTipo = sourceTipo.replace('_full', '');
        // 'macro' es completamente independiente y no se sincroniza
        if (sourceTipo === 'micro' || sourceTipo === 'diag') {
            const targetTipo = sourceTipo === 'micro' ? 'diag' : 'micro';
            const ids = targetTipo === 'micro' ? ['re_planMicro', 're_planMicro_full'] : ['re_planDiag', 're_planDiag_full'];
            
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const hasOption = Array.from(el.options).some(o => o.value === String(selectedTemplateId));
                    if (hasOption && el.value !== String(selectedTemplateId)) {
                        el.value = selectedTemplateId;
                    }
                }
            });
        }

        const selectedTemplate = templatesDatabase.find(t => String(t.id) === String(selectedTemplateId));
        if (selectedTemplate) {
            const schema = getWizardSchemaForTemplate(selectedTemplate.id, selectedTemplate.titulo);
            if (schema) {
                const targetMode = (sourceTipo === 'macro') ? 'fase1_macro' : 'fase2_micro';
                abrirPlantillaWizard(selectedTemplate.id, selectedTemplate.titulo, targetMode);
            } else {
                checkAndSetupSynopticAssistant(selectedTemplate.plantilla || selectedTemplate.titulo || "");
            }
        }
    }

    // Two-way synchronization helpers between standard panes and full-screen panes
    function syncTwoWayEditors(id1, id2) {
        const el1 = document.getElementById(id1);
        const el2 = document.getElementById(id2);
        if (!el1 || !el2) return;

        el1.addEventListener('input', () => {
            if (el2.innerHTML !== el1.innerHTML) {
                el2.innerHTML = el1.innerHTML;
            }
            if (id1 === 're_macroDesc' && currentMacro360Viewer) {
                currentMacro360Viewer.updateMacroText(el1.innerText || el1.textContent || '');
            }
        });
        el2.addEventListener('input', () => {
            if (el1.innerHTML !== el2.innerHTML) {
                el1.innerHTML = el2.innerHTML;
            }
            if (id1 === 're_macroDesc' && currentMacro360Viewer) {
                currentMacro360Viewer.updateMacroText(el2.innerText || el2.textContent || '');
            }
        });
    }

    syncTwoWayEditors('re_macroDesc', 're_macroDesc_full');
    syncTwoWayEditors('re_microDesc', 're_microDesc_full');
    syncTwoWayEditors('re_diagnostico', 're_diagnostico_full');

    function syncTwoWaySelects(id1, id2, onSyncChange) {
        const el1 = document.getElementById(id1);
        const el2 = document.getElementById(id2);
        if (!el1 || !el2) return;

        el1.addEventListener('change', () => {
            if (el2.value !== el1.value) el2.value = el1.value;
            if (onSyncChange) onSyncChange(el1.value);
        });
        el2.addEventListener('change', () => {
            if (el1.value !== el2.value) el1.value = el2.value;
            if (onSyncChange) onSyncChange(el2.value);
        });
    }

    syncTwoWaySelects('re_catMacro', 're_catMacro_full', (val) => {
        actualizarPlantillasSegunEspecialidad('macro', val);
        coordinarCategorias('macro', val);
    });
    syncTwoWaySelects('re_catMicro', 're_catMicro_full', (val) => {
        actualizarPlantillasSegunEspecialidad('micro', val);
        coordinarCategorias('micro', val);
    });
    syncTwoWaySelects('re_catDiag', 're_catDiag_full', (val) => {
        actualizarPlantillasSegunEspecialidad('diag', val);
        coordinarCategorias('diag', val);
    });

    syncTwoWaySelects('re_planMacro', 're_planMacro_full', (val) => coordinarPlantillaSeleccionada('macro', val));
    syncTwoWaySelects('re_planMicro', 're_planMicro_full', (val) => coordinarPlantillaSeleccionada('micro', val));
    syncTwoWaySelects('re_planDiag', 're_planDiag_full', (val) => coordinarPlantillaSeleccionada('diag', val));

    window.toggleEditorColumns = function() {
        const container = document.querySelector('.report-editor-container');
        const btn = document.getElementById('btnToggleEditorFullWidth');
        if (!container) return;
        container.classList.toggle('full-width-mode');
        const isFull = container.classList.contains('full-width-mode');
        if (btn) {
            btn.innerHTML = isFull ? '<i class="fa-solid fa-compress"></i> Ancho Normal' : '<i class="fa-solid fa-expand"></i> Maximizar Ancho';
            btn.classList.toggle('active', isFull);
        }
    };
    
    populateEditorTemplates();

    // --- LOGICA DE CREACION RAPIDA DE PLANTILLAS ---
    const btnCrearPlantilla = document.getElementById('re_btnCrearPlantilla');
    const fastTemplateModal = document.getElementById('fastTemplateModal');
    const btnCloseFastTemplate = document.getElementById('btnCloseFastTemplate');
    const btnCancelFastTemplate = document.getElementById('btnCancelFastTemplate');
    const btnSaveFastTemplate = document.getElementById('btnSaveFastTemplate');
    const fastTemplateTitle = document.getElementById('fastTemplateTitle');
    const fastTemplateCategory = document.getElementById('fastTemplateCategory');

    if (btnCrearPlantilla && fastTemplateModal) {
        function openFastTemplateModal() {
            // Poblar especialidades
            fastTemplateCategory.innerHTML = '<option value="">Seleccione una especialidad</option>';
            const cats = categoriesDatabase || [];
            // Agrupar únicas por su nombre de categoría
            const unicas = [...new Set(cats.map(c => c.categoria))].sort();
            unicas.forEach(catName => {
                const catObj = cats.find(c => c.categoria === catName);
                if (catObj) {
                    const option = document.createElement('option');
                    option.value = catObj.id;
                    option.textContent = catName;
                    fastTemplateCategory.appendChild(option);
                }
            });

            fastTemplateTitle.value = '';
            fastTemplateModal.classList.add('active');
        }

        function closeFastTemplateModal() {
            fastTemplateModal.classList.remove('active');
        }

        btnCrearPlantilla.addEventListener('click', openFastTemplateModal);
        if (btnCloseFastTemplate) btnCloseFastTemplate.addEventListener('click', closeFastTemplateModal);
        if (btnCancelFastTemplate) btnCancelFastTemplate.addEventListener('click', closeFastTemplateModal);

        if (btnSaveFastTemplate) {
            btnSaveFastTemplate.addEventListener('click', () => {
                console.log("[TemplateSave] Botón clickeado");
                const titulo = fastTemplateTitle.value.trim().toUpperCase();
                const categoryId = fastTemplateCategory.value;
                console.log("[TemplateSave] Datos modal:", { titulo, categoryId });

                if (!titulo || !categoryId) {
                    showToast('Por favor, ingrese un nombre y seleccione una especialidad.', 'warning');
                    return;
                }

                const macro = document.getElementById('re_macroDesc') ? fixMedicalCapitalization(document.getElementById('re_macroDesc').innerHTML.trim()) : '';
                const micro = document.getElementById('re_microDesc') ? fixMedicalCapitalization(document.getElementById('re_microDesc').innerHTML.trim()) : '';
                const diag = document.getElementById('re_diagnostico') ? document.getElementById('re_diagnostico').innerHTML.trim() : '';

                if (!macro && !micro && !diag) {
                    showToast('Los campos de la plantilla están vacíos.', 'warning');
                    return;
                }

                // Guardar usando la función encapsulada de db_service
                const newTemplate = addTemplateToDatabase({
                    categoryId: parseInt(categoryId),
                    titulo: titulo,
                    macro: macro,
                    micro: micro,
                    diag: diag
                });

                console.log("[TemplateSave] Guardado con éxito:", newTemplate);
                showToast('Plantilla creada con éxito.', 'success');

                // Sincronizar automáticamente con MacroRecorder
                try {
                    let autodiagnosticos = JSON.parse(localStorage.getItem('macror_autodiagnosticos') || '{}');
                    const clave = titulo.toLowerCase().trim();
                    autodiagnosticos[clave] = diag || micro || macro;
                    localStorage.setItem('macror_autodiagnosticos', JSON.stringify(autodiagnosticos));
                    console.log(`[⚡ SINCRONIZACIÓN MACRORECORDER] Plantilla "${titulo}" sincronizada.`);
                } catch (eSync) {}

                // Si el gestor de plantillas está abierto o tiene la vista tree, refrescarla
                if (typeof window.poblarComboEspecialidades === 'function') window.poblarComboEspecialidades();
                if (typeof window.renderTemplatesTreeView === 'function') window.renderTemplatesTreeView();
                
                // Recargar las plantillas en el editor de reportes
                populateEditorTemplates();

                // Forzar la actualización inmediata de los combos del editor según especialidad seleccionada
                const catMacroVal = document.getElementById('re_catMacro') ? document.getElementById('re_catMacro').value : '';
                const catMicroVal = document.getElementById('re_catMicro') ? document.getElementById('re_catMicro').value : '';
                const catDiagVal = document.getElementById('re_catDiag') ? document.getElementById('re_catDiag').value : '';

                actualizarPlantillasSegunEspecialidad('macro', catMacroVal);
                actualizarPlantillasSegunEspecialidad('micro', catMicroVal);
                actualizarPlantillasSegunEspecialidad('diag', catDiagVal);

                closeFastTemplateModal();
            });
        }
    }

    window.desplegarPlantillaCompleta = function(plantillaIdOrName, scope = 'all') {
        if (!plantillaIdOrName) return false;
        const plantilla = templatesDatabase.find(t => String(t.id) === String(plantillaIdOrName) || String(t.titulo).toUpperCase().includes(String(plantillaIdOrName).toUpperCase()));
        if (!plantilla) {
            showToast('Plantilla no encontrada', 'error');
            return false;
        }

        const shouldInjectMacro = (scope === 'all' || scope === 'macro');
        const shouldInjectMicro = (scope === 'all' || scope === 'micro' || scope === 'micro_diag' || scope === 'solo_micro');
        const shouldInjectDiag = (scope === 'all' || scope === 'diag' || scope === 'micro_diag' || scope === 'solo_diag');

        if (shouldInjectMacro && plantilla.macro) {
            const el = document.getElementById('re_macroDesc');
            const elFull = document.getElementById('re_macroDesc_full');
            const clean = cleanLatexToPlainText(fixMedicalCapitalization(cleanTextContentLocal(plantilla.macro))).replace(/\n/g, '<br>');
            if (el) {
                el.innerHTML = clean;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (elFull) {
                elFull.innerHTML = clean;
                elFull.dispatchEvent(new Event('input', { bubbles: true }));
            }
            // Detección y asignación inteligente de casetes
            const casetesEl = document.getElementById('re_casetes');
            if (casetesEl) {
                const matchCasetes = clean.match(/(\d+)\s*(?:casete|cassette|bloque)/i);
                if (matchCasetes && matchCasetes[1]) {
                    casetesEl.value = String(parseInt(matchCasetes[1], 10));
                }
            }
        }

        if (shouldInjectMicro && plantilla.micro) {
            const el = document.getElementById('re_microDesc');
            const elFull = document.getElementById('re_microDesc_full');
            const clean = cleanLatexToPlainText(fixMedicalCapitalization(cleanTextContentLocal(plantilla.micro))).replace(/\n/g, '<br>');
            if (el) {
                el.innerHTML = clean;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (elFull) {
                elFull.innerHTML = clean;
                elFull.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        if (shouldInjectDiag && plantilla.diag) {
            const el = document.getElementById('re_diagnostico');
            const elFull = document.getElementById('re_diagnostico_full');
            let diagHtml = cleanLatexToPlainText(cleanTextContentLocal(plantilla.diag)).toUpperCase().replace(/\n/g, '<br>');
            if (!diagHtml.startsWith('<b>') && !diagHtml.startsWith('<strong>')) {
                diagHtml = `<b>${diagHtml}</b>`;
            }
            if (el) {
                el.innerHTML = diagHtml;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (elFull) {
                elFull.innerHTML = diagHtml;
                elFull.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        const tagMap = {
            'macro': 'Fase 1: Solo Macroscopía',
            'micro_diag': 'Fase 2: Micro + Diagnóstico',
            'solo_micro': 'Solo Microscopía',
            'solo_diag': 'Solo Diagnóstico',
            'all': 'Informe Completo (3 en 1)'
        };
        showToast(`Plantilla "${plantilla.titulo}" aplicada [${tagMap[scope] || 'Completa'}]`, 'success');
        return true;
    };

    // Event listeners to toggle lock state on code, reception date, and delivery date
    const setupLockToggle = (inputId, buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                const input = document.getElementById(inputId);
                if (input) {
                    const currentlyLocked = input.readOnly;
                    setFieldLockState(inputId, buttonId, !currentlyLocked);
                }
            });
        }
    };
    setupLockToggle('re_codAtencion', 're_btnUnlockCode');

    // Auto-calculate probable delivery date (Recepción + 5 days) when Reception Date changes
    const fecIngresoInput = document.getElementById('re_fecIngreso');
    if (fecIngresoInput) {
        fecIngresoInput.addEventListener('change', () => {
            const val = fecIngresoInput.value;
            if (val) {
                const d = new Date(val + 'T00:00:00');
                if (!isNaN(d.getTime())) {
                    d.setDate(d.getDate() + 5);
                    const probableInput = document.getElementById('re_fecProbable');
                    if (probableInput) {
                        probableInput.value = d.toISOString().split('T')[0];
                    }
                }
            }
        });
    }

    // --- INTEGRACIÓN DE ASISTENTE AI (DEEPSEEK) ---
    const aiBtnGenDiag = document.getElementById('ai_btn_gen_diag');
    const aiDiagInput = document.getElementById('ai_diag_input');
    const aiBtnGenClinical = document.getElementById('ai_btn_gen_clinical');

    if (aiBtnGenDiag && aiDiagInput) {
        aiBtnGenDiag.addEventListener('click', () => {
            const diagnostico = aiDiagInput.value.trim();
            if (diagnostico === '') {
                showToast('Por favor, escribe un diagnóstico.', 'warning');
                return;
            }
            
            const promptText = `Asume el rol de un anatomopatológo senior del MD Anderson Cancer Center. Redacta un informe anatomopatológico completo de ${diagnostico}.

REGLA CRÍTICA: NUNCA uses notación LaTeX, fórmulas matemáticas ni símbolos como $, \\times, \\text{}, $$. Las dimensiones deben escribirse en texto plano usando "x" (ejemplo: 4.6 x 4.5 x 3.5 cm). Escribe todo en español médico estándar sin ningún marcado matemático.

En base al diagnóstico proporcionado redacta lo siguiente, informe anatomopatológico:
Macroscopía: un párrafo conciso con dimensiones en texto plano (ej: 4.6 x 4.5 x 3.5 cm) y casetes incluidos.
Microscopía: un párrafo con los criterios diagnósticos y tinción H&E.
Diagnóstico: una línea final clara y sin ambigüedad en mayúsculas.`;
            
            navigator.clipboard.writeText(promptText).then(() => {
                showToast('Prompt de Diagnóstico copiado (sin LaTeX). Abriendo DeepSeek...', 'success');
                setTimeout(() => {
                    window.open('https://chat.deepseek.com/', '_blank');
                }, 800);
            }).catch(err => {
                console.error('Error al copiar:', err);
                showToast('Error al copiar el prompt automáticamente.', 'error');
            });
        });
    }

    if (aiBtnGenClinical) {
        aiBtnGenClinical.addEventListener('click', () => {
            // Obtener datos dinámicos de los inputs de la ficha
            const edad = document.getElementById('re_edad') ? document.getElementById('re_edad').value.trim() : '--';
            const sexo = document.getElementById('re_sexo') ? document.getElementById('re_sexo').value : 'No disponible';
            const muestra = document.getElementById('re_telContacto') ? document.getElementById('re_telContacto').value.trim() : 'No disponible';
            const historia = document.getElementById('re_motivoEstudio') ? document.getElementById('re_motivoEstudio').value.trim() : 'No disponible';
            
            // Especialidad por código de atención
            const codAtencion = document.getElementById('re_codAtencion') ? document.getElementById('re_codAtencion').value.trim() : '';
            const especialidad = codAtencion.toUpperCase().includes('C') ? 'ginecología' : 'gastroenterología';

            const promptText = `DATOS DEL PACIENTE:
Edad: ${edad || 'No disponible'}
Sexo: ${sexo || 'No disponible'}
Localización/Muestra: ${muestra || 'No disponible'}
Hallazgos clínicos/Historia: ${historia || 'No disponible'}
Especialidad: ${especialidad}

HALLAZGOS PATOLÓGICOS:
Descripción macroscópica: No disponible (generar basada en la muestra)
Descripción microscópica: No disponible (generar basada en los hallazgos clínicos)
Inmunohistoquímica: No disponible
Otros estudios: No disponible
Antecedentes relevantes: No disponible

Eres un anatomopatólogo senior del MD Anderson Cancer Center, especializado en ${especialidad}. Basándote EXCLUSIVAMENTE en los datos proporcionados, genera un reporte preliminar estructurado que incluya:
Descripción macroscópica en un párrafo y microscópica en un párrafo
Interpretación de hallazgos inmunohistoquímicos (si están disponibles)
Diagnósticos diferenciales priorizados
Estudios complementarios necesarios para confirmar / descartar diagnósticos
Conclusión preliminar y recomendaciones

REGLA CRÍTICA DE FORMATO:
NUNCA uses notación LaTeX, fórmulas matemáticas ni símbolos como $, \\times, \\text{}, $$. Las dimensiones deben escribirse en texto plano usando "x" (por ejemplo: 4.6 x 4.5 x 3.5 cm). Escribe todo en español médico estándar sin ningún marcado matemático.

INSTRUCCIONES ESPECÍFICAS:
Si algún dato marcado como "No disponible" es crítico para el diagnóstico, menciónalo explícitamente en la sección de estudios complementarios.
Estructura el reporte usando los mismos encabezados solicitados.
Mantén un lenguaje técnico apropiado para comunicación entre especialistas.`;

            navigator.clipboard.writeText(promptText).then(() => {
                showToast('Prompt Clínico copiado (sin LaTeX). Abriendo DeepSeek...', 'success');
                setTimeout(() => {
                    window.open('https://chat.deepseek.com/', '_blank');
                }, 800);
            }).catch(err => {
                console.error('Error al copiar:', err);
                showToast('Error al copiar el prompt automáticamente.', 'error');
            });
        });
    }

    // =========================================================================
    // SANITIZACIÓN AUTOMÁTICA INFALIBLE: PASTE, INPUT Y BLUR EN EDITORES CLÍNICOS
    // Purga al vuelo cualquier expresión LaTeX de DeepSeek/ChatGPT, corrige casetes y puntuación
    // =========================================================================
    const clinicalEditorIds = ['re_macroDesc', 're_macroDesc_full', 're_microDesc', 're_microDesc_full', 're_diagnostico', 're_diagnostico_full'];

    function handleClinicalPasteEvent(e) {
        e.preventDefault();
        const clipboard = e.clipboardData || window.clipboardData;
        let pasteText = '';
        if (clipboard) {
            pasteText = clipboard.getData('text/plain') || clipboard.getData('text') || '';
            if (!pasteText) {
                const rawHtml = clipboard.getData('text/html') || '';
                if (rawHtml) {
                    const temp = document.createElement('div');
                    temp.innerHTML = rawHtml;
                    pasteText = temp.textContent || temp.innerText || '';
                }
            }
        }
        if (!pasteText) return;

        // Limpieza profunda de LaTeX y normalización médica
        const target = e.currentTarget || e.target;
        const isDiag = target && target.id && target.id.includes('diagnostico');
        let cleaned = cleanLatexToPlainText(pasteText);
        cleaned = fixMedicalCapitalization(cleaned);
        if (isDiag) {
            cleaned = cleaned.toUpperCase();
        }

        // Inserción de texto: execCommand con fallback seguro a Selection Range API
        let inserted = false;
        try {
            inserted = document.execCommand('insertText', false, cleaned);
        } catch (err) {
            inserted = false;
        }

        if (!inserted) {
            try {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    range.deleteContents();
                    const textNode = document.createTextNode(cleaned);
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.setEndAfter(textNode);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    inserted = true;
                }
            } catch (rangeErr) {
                inserted = false;
            }
            if (!inserted && target) {
                target.innerHTML += cleaned.replace(/\n/g, '<br>');
            }
        }

        if (target) {
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function handleClinicalInputSanitize(el) {
        if (!el) return;
        const currentHtml = el.innerHTML;
        // Detectar de forma reactiva si el usuario pegó o escribió símbolos LaTeX
        if (/(?:\$|\\|[{}]|\\times|\\text)/i.test(currentHtml)) {
            const cleaned = cleanLatexToPlainText(currentHtml);
            if (cleaned !== currentHtml) {
                el.innerHTML = cleaned;
                // Mover cursor al final del contenido sanitizado
                const sel = window.getSelection();
                if (sel) {
                    try {
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } catch (e) {}
                }
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    function handleClinicalBlurSanitize(el) {
        if (!el) return;
        const currentHtml = el.innerHTML;
        let cleaned = cleanLatexToPlainText(currentHtml);
        cleaned = fixMedicalCapitalization(cleaned);
        if (el.id && el.id.includes('diagnostico')) {
            cleaned = cleaned.toUpperCase();
            if (cleaned && !cleaned.startsWith('<b>') && !cleaned.startsWith('<strong>')) {
                cleaned = `<b>${cleaned}</b>`;
            }
        }
        if (cleaned !== currentHtml) {
            el.innerHTML = cleaned;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    clinicalEditorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('paste', handleClinicalPasteEvent);
            el.addEventListener('input', () => handleClinicalInputSanitize(el));
            el.addEventListener('blur', () => handleClinicalBlurSanitize(el));
        }
    });

    // Escucha global delegada con fase de captura (blindaje absoluto contra bypass)
    document.addEventListener('paste', (e) => {
        const target = e.target;
        if (target && target.id && clinicalEditorIds.includes(target.id)) {
            if (!e.defaultPrevented) {
                handleClinicalPasteEvent(e);
            }
        }
    }, true);

    document.addEventListener('input', (e) => {
        const target = e.target;
        if (target && target.id && clinicalEditorIds.includes(target.id)) {
            handleClinicalInputSanitize(target);
        }
    }, true);

    document.addEventListener('blur', (e) => {
        const target = e.target;
        if (target && target.id && clinicalEditorIds.includes(target.id)) {
            handleClinicalBlurSanitize(target);
        }
    }, true);

    // =========================================================================
    // ERGONOMÍA MÓVIL: MANEJO DE FOCO TÁCTIL Y TECLADO VIRTUAL DE ANDROID/IOS
    // =========================================================================
    const modalEditorOverlay = document.getElementById('reportEditorModalOverlay');
    if (modalEditorOverlay) {
        const editableElements = modalEditorOverlay.querySelectorAll('.re-text-editor, input, select, textarea');
        editableElements.forEach(el => {
            el.addEventListener('focus', () => {
                if (window.innerWidth <= 1024) {
                    setTimeout(() => {
                        try {
                            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        } catch (e) {}
                    }, 280);
                }
            });
        });
    }
}

export function formatEditorText(elementId, command, value = null) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.focus();
    
    if (command === 'bold') {
        document.execCommand('bold', false, null);
    } else if (command === 'italic') {
        document.execCommand('italic', false, null);
    } else if (command === 'underline') {
        document.execCommand('underline', false, null);
    } else if (command === 'uppercase') {
        const selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const text = range.toString();
            const replacement = text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase();
            range.deleteContents();
            range.insertNode(document.createTextNode(replacement));
        } else {
            const text = el.innerText;
            el.innerText = text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase();
        }
    } else if (command === 'left') {
        document.execCommand('justifyLeft', false, null);
    } else if (command === 'center') {
        document.execCommand('justifyCenter', false, null);
    } else if (command === 'right') {
        document.execCommand('justifyRight', false, null);
    } else if (command === 'justify') {
        document.execCommand('justifyFull', false, null);
    } else if (command === 'list') {
        document.execCommand('insertUnorderedList', false, null);
    } else if (command === 'number-list') {
        document.execCommand('insertOrderedList', false, null);
    } else if (command === 'font') {
        document.execCommand('fontName', false, value);
    } else if (command === 'size') {
        const selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
            try {
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.fontSize = value;
                range.surroundContents(span);
            } catch (err) {
                document.execCommand('fontSize', false, value);
            }
        }
    }
}
window.formatEditorText = formatEditorText;

window.runGlobalAutocorrect = async function() {
    const fields = ['re_macroDesc', 're_microDesc', 're_diagnostico'];
    let modificationsCount = 0;

    function walkTextNodes(node, textNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue.trim() !== '') {
                textNodes.push(node);
            }
        } else {
            for (let child of Array.from(node.childNodes)) {
                walkTextNodes(child, textNodes);
            }
        }
    }

    for (let fieldId of fields) {
        const el = document.getElementById(fieldId);
        if (!el) continue;
        
        const textNodes = [];
        walkTextNodes(el, textNodes);
        
        for (let node of textNodes) {
            const originalText = node.nodeValue;
            let clean = cleanTextContentLocal(originalText);
            clean = autoCorrectClinicalText(clean);
            
            if (clean !== originalText) {
                node.nodeValue = clean;
                modificationsCount++;
            }
        }
    }

    if (typeof notifyUser === 'function') {
        notifyUser(`Autocorrección completada de forma local y determinista. Correcciones aplicadas: ${modificationsCount}`, 'success');
    }
};

window.updateOpenEditorIfMatches = function(updatedPatient) {
    if (!editingCodAtencion || !updatedPatient) return;
    const cleanOpen = String(editingCodAtencion).trim().toLowerCase().replace(/[-_\s]/g, '');
    const cleanUpdated = String(updatedPatient.codAtencion || '').trim().toLowerCase().replace(/[-_\s]/g, '');
    
    if (cleanOpen === cleanUpdated) {
        const macroEl = document.getElementById('re_macroDesc');
        const microEl = document.getElementById('re_microDesc');
        const diagEl = document.getElementById('re_diagnostico');
        
        // Solo actualizar si el objeto remoto de verdad contiene texto NO VACÍO para evitar borrar la pantalla del usuario
        if (macroEl && updatedPatient.macroDesc && updatedPatient.macroDesc.trim() !== '') {
            const currentLocal = macroEl.innerText ? macroEl.innerText.trim() : '';
            if (!currentLocal || document.activeElement !== macroEl) {
                const val = updatedPatient.macroDesc;
                macroEl.innerHTML = val.includes('<') ? val.toLowerCase() : val.toLowerCase().replace(/\n/g, '<br>');
            }
        }
        if (microEl && updatedPatient.microDesc && updatedPatient.microDesc.trim() !== '') {
            const currentLocal = microEl.innerText ? microEl.innerText.trim() : '';
            if (!currentLocal || document.activeElement !== microEl) {
                const val = updatedPatient.microDesc;
                microEl.innerHTML = val.includes('<') ? val.toLowerCase() : val.toLowerCase().replace(/\n/g, '<br>');
            }
        }
        if (diagEl && updatedPatient.diagnostico && updatedPatient.diagnostico.trim() !== '') {
            const currentLocal = diagEl.innerText ? diagEl.innerText.trim() : '';
            if (!currentLocal || document.activeElement !== diagEl) {
                let val = updatedPatient.diagnostico;
                let formattedVal = val.includes('<') ? val.toUpperCase() : val.toUpperCase().replace(/\n/g, '<br>');
                if (formattedVal && !formattedVal.startsWith('<b>') && !formattedVal.startsWith('<strong>')) {
                    formattedVal = `<b>${formattedVal}</b>`;
                }
                diagEl.innerHTML = formattedVal;
            }
        }
        
        if (typeof showToast === 'function') {
            showToast("Informe actualizado en tiempo real con cambios de la nube.", "info");
        }
    }
};



        // =========================================================================
    // 🧬 MOTOR POLIMÓRFICO DE ASISTENTES CLÍNICOS GUIADOS (WIZARD P1..P5)
    // =========================================================================

    const wizardSchemas = {
        // ---------------------------------------------------------------------
        // 1. MORCELADOS DE PRÓSTATA (RTUP / HoLEP morcelado)
        // ---------------------------------------------------------------------
        prostate_morcelado: {
            id: "prostate_morcelado",
            title: "Asistente: Morcelados de Próstata",
            subtitle: "Estandarización Sinóptica de Próstata según Susan Lester & CAP",
            defaultState: {
                mode: 'peso',
                peso: 45.0,
                dimL: 7.0,
                dimA: 5.0,
                dimE: 4.0,
                casetes: 3,
                p2_macro: 'virutas_tipicas',
                p3_micro: 'hiperplasia_mixta',
                p4_inflamacion: 'cronica_leve',
                p5_malignidad: 'negativo_total'
            },
            step1Config: {
                title: "Macroscopía: Peso, Dimensiones y Casetes",
                description: "Ingrese el peso en gramos o las dimensiones del conjunto para calcular el muestreo representativo según Susan Lester.",
                showWeightDimToggle: true,
                defaultWeight: 45.0,
                defaultDims: { L: 7.0, A: 5.0, E: 4.0 },
                defaultCassettes: 3,
                calculateLive: (state) => {
                    let finalWeight = 0;
                    if (state.mode === 'peso') {
                        finalWeight = parseFloat(state.peso) || 0;
                    } else {
                        const L = parseFloat(state.dimL) || 0;
                        const A = parseFloat(state.dimA) || 0;
                        const E = parseFloat(state.dimE) || 0;
                        finalWeight = L > 0 && A > 0 && E > 0 ? (L * A * E * 0.55) : 0;
                    }
                    let recCassettes = finalWeight <= 0 ? 1 : (finalWeight <= 12 ? Math.max(1, Math.ceil(finalWeight / 2.0)) : (8 + Math.ceil((finalWeight - 12) / 5.0)));
                    return {
                        weightText: `${finalWeight.toFixed(1)} <small>g</small>`,
                        cassettesText: `${recCassettes} <small>casetes</small>`,
                        statusText: "Muestreo representativo (Susan Lester)"
                    };
                },
                apaCitation: {
                    title: "Criterio de Muestreo Quirúrgico Patológico (Susan Lester, 2010):",
                    text: "Para morcelados y fragmentos prostáticos: procesar la totalidad si peso ≤ 12 g (aprox. 6-8 casetes). Para especímenes > 12 g, incluir 6-8 casetes iniciales y 1 casete adicional por cada 5 g adicionales de tejido restante.",
                    ref: "Lester, S. C. (2010). Manual of Surgical Pathology (3.ª ed., pp. 415–422). Elsevier Saunders."
                }
            },
            steps: [
                {
                    stepNumber: 2,
                    title: "Aspecto Macroscópico de los Fragmentos",
                    description: "Presione [1] a [4] en su teclado o haga clic en la tarjeta correspondiente.",
                    stateKey: "p2_macro",
                    options: [
                        { key: "1", val: "virutas_tipicas", title: "Virutas y fragmentos irregulares elásticos", desc: "Coloración pardo-blanquecina a pardo-amarillenta, elásticos, sin necrosis. (Habitual / 90%)" },
                        { key: "2", val: "tiras_cilindricas", title: "Tiras cilíndricas y fragmentos lobulados", desc: "Aspecto nodular pardo-grisáceo de mayor firmeza elástica." },
                        { key: "3", val: "congestivos_hemorragicos", title: "Fragmentos parduscos con congestión hemorrágica", desc: "Entremezclados con áreas de tinte rojizo/coágulos sin necrosis macroscópica." },
                        { key: "4", val: "voluminosos_lobulados", title: "Bloques lobulados morcelados voluminosos", desc: "Fragmentos amplios pardo-amarillentos con nodulaciones evidentes." }
                    ]
                },
                {
                    stepNumber: 3,
                    title: "Patrón Histológico y Arquitectura",
                    description: "Presione [1] a [4] para clasificar el patrón arquitectural dominante.",
                    stateKey: "p3_micro",
                    options: [
                        { key: "1", val: "hiperplasia_mixta", title: "Hiperplasia nodular mixta (glandular y estromal)", desc: "Bicapa celular intacta (células basales y secretoras sin atipia) con amiláceos. (Habitual / 90%)" },
                        { key: "2", val: "predominio_glandular", title: "Predominio glandular adenomatoso", desc: "Ectasia microquística prominente y proyecciones papilares intraluminales benignas." },
                        { key: "3", val: "predominio_estromal", title: "Predominio estromal fibromuscular", desc: "Proliferación miofibroblástica / leiomiomatosa con escasas glándulas." },
                        { key: "4", val: "infarto_metaplasia", title: "Hiperplasia con infarto y metaplasia escamosa", desc: "Necrosis isquémica coagulativa focal delimitada por metaplasia escamosa reactiva." }
                    ]
                },
                {
                    stepNumber: 4,
                    title: "Infiltrado Inflamatorio Asociado",
                    description: "Presione [1] a [4] para especificar el grado de inflamación.",
                    stateKey: "p4_inflamacion",
                    options: [
                        { key: "1", val: "cronica_leve", title: "Prostatitis crónica leve inespecífica", desc: "Infiltrado mononuclear linfohistiocitario periglandular focal. (Habitual / 90%)" },
                        { key: "2", val: "cronica_moderada", title: "Prostatitis crónica moderada", desc: "Manguitos linfoplasmocitarios densos en el estroma interglandular." },
                        { key: "3", val: "cronica_activa", title: "Prostatitis crónica activa / reagudizada", desc: "Infiltración neutrofílica intraglandular con microabscesos acinares." },
                        { key: "4", val: "granulomatosa", title: "Prostatitis granulomatosa", desc: "Granulomas epitelioides no caseificantes con células gigantes multinucleadas." }
                    ]
                },
                {
                    stepNumber: 5,
                    title: "Malignidad y Onco-Seguridad",
                    description: "Presione [1] a [4] para finalizar y generar el reporte clínico.",
                    stateKey: "p5_malignidad",
                    options: [
                        { key: "1", val: "negativo_total", title: "Negativo para HGPIN y Malignidad", desc: "Sin evidencia de HGPIN ni adenocarcinoma en el material examinado. (Habitual / 90%)" },
                        { key: "2", val: "lgpin_focal", title: "PIN de Bajo Grado (LGPIN) focal", desc: "Atipia epitelial de bajo grado sin trascendencia invasora." },
                        { key: "3", val: "asap_atipico", title: "Proliferación Acinar Atípica (ASAP)", desc: "Foco pequeño atípico sospechoso; requiere correlación clínica e IHQ." },
                        { key: "4", val: "adenocarcinoma_incidental", title: "Adenocarcinoma Incidental (pT1a / pT1b)", desc: "Presencia de adenocarcinoma acinar incidental en los chips prostáticos." }
                    ]
                }
            ],
            compileReport: (state) => {
                const dimsStr = state.mode === 'dimensiones' 
                    ? `${parseFloat(state.dimL || 7).toFixed(1)} x ${parseFloat(state.dimA || 5).toFixed(1)} x ${parseFloat(state.dimE || 4).toFixed(1)}` 
                    : "7.0 x 5.0 x 4.0";
                const pesoStr = `${parseFloat(state.peso || 45).toFixed(1)} g.`;
                const numCasetes = parseInt(state.casetes, 10) || 3;

                let macroAspecto = "de coloración pardo-blanquecina a pardo-amarillenta y consistencia elástica";
                if (state.p2_macro === 'tiras_cilindricas') macroAspecto = "conformado por tiras cilíndricas y fragmentos lobulados pardo-grisáceos de consistencia elástica";
                else if (state.p2_macro === 'congestivos_hemorragicos') macroAspecto = "de aspecto pardo-rojizo con áreas focales de congestión hemorrágica y consistencia elástica";
                else if (state.p2_macro === 'voluminosos_lobulados') macroAspecto = "integrado por bloques lobulados morcelados voluminosos de tonalidad pardo-amarillenta";

                const macro = `se reciben múltiples fragmentos tisulares irregulares de tejido prostático (virutas de morcelación), ${macroAspecto}, que en conjunto miden ${dimsStr} cm y pesan ${pesoStr} se incluye muestra representativa en ${numCasetes} casete(s).\n\nLester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders.`;

                let microPatron = "hiperplasia nodular mixta (glandular y estromal)";
                if (state.p3_micro === 'predominio_glandular') microPatron = "hiperplasia nodular con marcado predominio glandular adenomatoso y ectasia microquística";
                else if (state.p3_micro === 'predominio_estromal') microPatron = "hiperplasia nodular con predominio estromal fibromuscular";
                else if (state.p3_micro === 'infarto_metaplasia') microPatron = "hiperplasia nodular mixta asociada a áreas de infarto prostático focal y metaplasia escamosa reactiva";

                let microInflam = "asociado a un leve infiltrado inflamatorio crónico linfohistiocitario focal";
                if (state.p4_inflamacion === 'cronica_moderada') microInflam = "con moderado infiltrado inflamatorio linfoplasmocitario intersticial periacinar";
                else if (state.p4_inflamacion === 'cronica_activa') microInflam = "asociado a prostatitis crónica activa con infiltración neutrofílica intraglandular";
                else if (state.p4_inflamacion === 'granulomatosa') microInflam = "acompañado de prostatitis granulomatosa con células gigantes multinucleadas";

                let microMalig = "no se identifican proliferaciones acinares atípicas, patrones cribiformes, neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma.";
                if (state.p5_malignidad === 'lgpin_focal') microMalig = "se observan focos aislados de neoplasia intraepitelial prostática de bajo grado (LGPIN). negativo para HGPIN y negativo para adenocarcinoma.";
                else if (state.p5_malignidad === 'asap_atipico') microMalig = "se identifica un foco glandular pequeño atípico sospechoso (ASAP), cuantitativamente insuficiente para adenocarcinoma. se sugiere correlación con PSA e inmunohistoquímica.";
                else if (state.p5_malignidad === 'adenocarcinoma_incidental') microMalig = "se reconoce proliferación neoplásica epitelial maligna de tipo acinar (adenocarcinoma incidental).";

                const micro = `los cortes histológicos muestran parénquima prostático con ${microPatron}. las unidades acinares presentan luces de calibre variable con corpúsculos amiláceos intraluminares y revestimiento epitelial bicapa conservado, exhibiendo una capa basal continua y sin atipia citológica. el estroma fibromuscular interglandular se encuentra hiperplásico, ${microInflam}. ${microMalig}`;

                const diagLines = [
                    "PRÓSTATA (MORCELADOS):",
                    "- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (COMPONENTE GLANDULAR Y ESTROMAL)."
                ];
                if (state.p4_inflamacion === 'cronica_moderada') diagLines.push("- PROSTATITIS CRÓNICA MODERADA.");
                else if (state.p4_inflamacion === 'cronica_activa') diagLines.push("- PROSTATITIS CRÓNICA ACTIVA.");
                else if (state.p4_inflamacion === 'granulomatosa') diagLines.push("- PROSTATITIS GRANULOMATOSA.");
                else diagLines.push("- PROSTATITIS CRÓNICA LEVE INESPECÍFICA.");

                if (state.p5_malignidad === 'asap_atipico') diagLines.push("- FOCO AISLADO DE PROLIFERACIÓN ACINAR ATÍPICA (ASAP), SE SUGIERE CONTROL Y CORRELACIÓN CLÍNICA.");
                else if (state.p5_malignidad === 'adenocarcinoma_incidental') diagLines.push("- ADENOCARCINOMA ACINAR DE PRÓSTATA, HALLAZGO INCIDENTAL.");
                else diagLines.push("- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) Y NEGATIVO PARA MALIGNIDAD EN EL MATERIAL EXAMINADO.");

                return { macro, micro, diag: diagLines.join("\n"), casetes: numCasetes };
            }
        },

        // ---------------------------------------------------------------------
        // 2. ENUCLEACIÓN PROSTÁTICA (HoLEP / Adenomectomía Abierta) - 4 PASOS CON PARAFRASEO
        // ---------------------------------------------------------------------
        prostate_enucleacion: {
            id: "prostate_enucleacion",
            title: "Asistente: Enucleación Prostática",
            subtitle: "Estandarización Sinóptica de Adenomas Enucleados según Susan Lester, CAP & OMS 2022",
            defaultState: {
                mode: 'peso',
                peso: 65.0,
                dimL: 8.5,
                dimA: 6.0,
                dimE: 4.5,
                casetes: 4,
                p2_macro: 'lobulos_grandes_nodulares',
                p3_micro: 'hiperplasia_nodular_completa',
                p4_inflamacion: 'cronica_leve_periglandular'
            },
            step1Config: {
                title: "Macroscopía: Peso de Adenomas, Dimensiones y Casetes",
                description: "Ingrese las dimensiones (L x A x E cm) o el peso en gramos (g) y el número de casetes incluidos para el espécimen de enucleación.",
                showWeightDimToggle: true,
                defaultWeight: 65.0,
                defaultDims: { L: 8.5, A: 6.0, E: 4.5 },
                defaultCassettes: 4,
                calculateLive: (state) => {
                    let finalWeight = 0;
                    if (state.mode === 'peso') {
                        finalWeight = parseFloat(state.peso) || 0;
                    } else {
                        const L = parseFloat(state.dimL) || 0;
                        const A = parseFloat(state.dimA) || 0;
                        const E = parseFloat(state.dimE) || 0;
                        finalWeight = L > 0 && A > 0 && E > 0 ? (L * A * E * 0.55) : 0;
                    }
                    let recCassettes = finalWeight <= 0 ? 1 : (finalWeight <= 12 ? Math.max(1, Math.ceil(finalWeight / 2.0)) : (8 + Math.ceil((finalWeight - 12) / 5.0)));
                    return {
                        weightText: `${finalWeight.toFixed(1)} <small>g</small>`,
                        cassettesText: `${recCassettes} <small>casetes</small>`,
                        statusText: "Muestreo representativo de lóbulos prostáticos"
                    };
                },
                apaCitation: {
                    title: "Criterio Internacional de Muestreo (Susan Lester 2010 / CAP 2023):",
                    text: "Para adenomas enucleados y piezas prostáticas: procesar 1 casete por cada 5-10 g de tejido (mínimo 6-8 casetes para piezas > 12 g). Incluir áreas induradas y cortes perpendiculares de la pseudocápsula quirúrgica.",
                    ref: "Lester, S. C. (2010). Manual of Surgical Pathology (3.ª ed., pp. 415–422). Elsevier Saunders. / College of American Pathologists (CAP, 2023)."
                }
            },
            steps: [
                {
                    stepNumber: 2,
                    title: "Aspecto Macroscópico y Superficie de Corte",
                    description: "Presione [1] a [4] en su teclado o haga clic en la tarjeta correspondiente.",
                    stateKey: "p2_macro",
                    options: [
                        { key: "1", val: "lobulos_grandes_nodulares", title: "Lóbulos elásticos con superficie pseudo-capsular lisa y microquistes", desc: "Superficie externa lisa pardo-grisácea y parénquima de corte nodular blanquecino con microquistes y secreción coloide. (Habitual / 90%)" },
                        { key: "2", val: "fragmentos_enucleacion_multiples", title: "Múltiples fragmentos lobulados y cilindros tisulares", desc: "Muestra dividida en fragmentos irregulares elásticos y firmes pardo-grisáceos." },
                        { key: "3", val: "quistes_amilaceos", title: "Parénquima con marcada ectasia quística y secreción coloide", desc: "Superficie de corte esponjosa con corpúsculos amiláceos y secreciones prostáticas amarillentas." },
                        { key: "4", val: "congestivo_hemorragico", title: "Lóbulos con áreas de congestión hemorrágica focal", desc: "Superficie de corte heterogénea pardo-rojiza con consistencia elástica firme." }
                    ]
                },
                {
                    stepNumber: 3,
                    title: "Patrón Histológico y Arquitectura (Microscopía)",
                    description: "Presione [1] a [4] para registrar la diferenciación histológica.",
                    stateKey: "p3_micro",
                    options: [
                        { key: "1", val: "hiperplasia_nodular_completa", title: "Hiperplasia nodular mixta adenomiomatosa típica", desc: "Bicapa celular intacta (células basales y secretoras cilíndricas sin atipia) con cuerpos amiláceos. (Habitual / 90%)" },
                        { key: "2", val: "predominio_adenomatoso_papilar", title: "Marcado predominio adenomatoso con ectasia microquística", desc: "Proliferación exuberante de luces acinares con pliegues papilares sin atipia citológica." },
                        { key: "3", val: "predominio_estromal_leiomiomatoso", title: "Predominio estromal fibromuscular (Leiomiomatoso)", desc: "Fascículos gruesos de músculo liso hiperplásico con nódulos estromales prominentes." },
                        { key: "4", val: "infarto_escamoso", title: "Hiperplasia con focos de infarto y metaplasia escamosa", desc: "Áreas de necrosis isquémica focal rodeadas por epitelio escamoso reactivo benigno." }
                    ]
                },
                {
                    stepNumber: 4,
                    title: "Componente Inflamatorio Tisular (Microscopía)",
                    description: "Presione [1] a [4] para concluir y generar el reporte clínico.",
                    stateKey: "p4_inflamacion",
                    options: [
                        { key: "1", val: "cronica_leve_periglandular", title: "Prostatitis crónica linfohistiocitaria leve inespecífica", desc: "Infiltrados mononucleares periacinares focales no destructivos. (Habitual / 90%)" },
                        { key: "2", val: "cronica_moderada_folicular", title: "Prostatitis crónica moderada linfoplasmocitaria", desc: "Agregados linfoplasmocitarios estromales bien definidos con infiltración intersticial." },
                        { key: "3", val: "cronica_activa_microabscesos", title: "Prostatitis crónica activa con neutrófilos", desc: "Infiltración neutrofílica intraglandular con microabscesos acinares focales." },
                        { key: "4", val: "granulomatosa_inespecifica", title: "Prostatitis granulomatosa reactiva", desc: "Histiocitos epitelioides y células gigantes multinucleadas en relación a ruptura acinar." }
                    ]
                }
            ],
            compileReport: (state) => {
                const dimsStr = state.mode === 'dimensiones' 
                    ? `${parseFloat(state.dimL || 8.5).toFixed(1)} x ${parseFloat(state.dimA || 6).toFixed(1)} x ${parseFloat(state.dimE || 4.5).toFixed(1)}` 
                    : "8.5 x 6.0 x 4.5";
                const pesoStr = `${parseFloat(state.peso || 65).toFixed(1)} g.`;
                const numCasetes = parseInt(state.casetes, 10) || 4;

                // 🧬 BANCO DE PARAFRASEO CLÍNICO NATURAL (VARIABILIDAD DE ESTILO MÉDICO)
                const hashSeed = (Math.round(parseFloat(state.peso || 65) * 10) + numCasetes) % 3;

                const macroOpenings = [
                    "se recibe espécimen de enucleación prostática consistente en una pieza multilobulada",
                    "se examina producto de enucleación prostática constituido por una pieza lobulada íntegra",
                    "se recibe pieza quirúrgica de enucleación prostática integrada por lóbulos adenomatosos bien delimitados"
                ];

                let macroAspecto = "con superficie externa pseudo-capsular lisa y congestiva";
                if (state.p2_macro === 'fragmentos_enucleacion_multiples') {
                    macroAspecto = "integrada por múltiples fragmentos tisulares y cilindros nodulares elásticos de coloración pardo-grisácea";
                } else if (state.p2_macro === 'quistes_amilaceos') {
                    macroAspecto = "de aspecto nodular con marcada ectasia quística y secreción coloide amarillenta";
                } else if (state.p2_macro === 'congestivo_hemorragico') {
                    macroAspecto = "con áreas nodulares entremezcladas con zonas de congestión hemorrágica focal y consistencia elástica firme";
                }

                const macroCuts = [
                    "a los cortes seriados cada 3 a 5 mm, el parénquima exhibe aspecto nodular pardo-blanquecino a pardo-amarillento, de consistencia elástica, con múltiples formaciones microquísticas ectásicas y secreción coloide, sin induraciones sospechosas ni áreas de necrosis.",
                    "a las secciones parenquimatosas se reconocen múltiples nódulos confluentes de consistencia elástica, tonalidad pardo-blanquecina a amarillenta y cavidades ectásicas milimétricas con coloide, sin áreas de consistencia pétrea ni necrosis.",
                    "la superficie de corte demuestra arquitectura nodular arremolinada con formaciones microquísticas ectásicas milimétricas y secreción coloide, desprovista de focos indurados sospechosos o necrosis."
                ];

                const openingMacro = macroOpenings[hashSeed];
                const cutMacro = macroCuts[hashSeed];

                const macro = `${openingMacro}, ${macroAspecto}, que mide ${dimsStr} cm y pesa ${pesoStr} ${cutMacro} se incluye muestra representativa en ${numCasetes} casete(s).

<small style="font-size: 0.72rem; color: #64748b;">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders. / College of American Pathologists (CAP, 2023).</small>`;

                const microOpenings = [
                    "los cortes histológicos muestran parénquima prostático con",
                    "las secciones histológicas revelan tejido prostático con",
                    "el examen microscópico demuestra parénquima prostático caracterizado por"
                ];

                let microPatron = "hiperplasia nodular mixta (glandular y estromal). las unidades acinares exhiben luces dilatadas, plegamientos papilares y cuerpos amiláceos intraluminares, conservando una bicapa celular intacta (células basales continuas y células luminales secretoras) sin atipia citológica";
                if (state.p3_micro === 'predominio_adenomatoso_papilar') {
                    microPatron = "hiperplasia nodular de marcado predominio glandular adenomatoso con ectasia microquística, proyecciones papilares intraluminales y revestimiento epitelial bicapa preservado";
                } else if (state.p3_micro === 'predominio_estromal_leiomiomatoso') {
                    microPatron = "hiperplasia nodular con predominio estromal fibromuscular, nódulos leiomiomatosos fusocelulares y escasas unidades glandulares atróficas";
                } else if (state.p3_micro === 'infarto_escamoso') {
                    microPatron = "hiperplasia nodular mixta asociada a focos de infarto isquémico prostático delimitados por metaplasia escamosa reactiva benigna";
                }

                let microInflam = "asociado a un leve infiltrado inflamatorio crónico linfohistiocitario focal";
                if (state.p4_inflamacion === 'cronica_moderada_folicular') {
                    microInflam = "asociado a moderado infiltrado linfoplasmocitario estromal con agregados periacinares";
                } else if (state.p4_inflamacion === 'cronica_activa_microabscesos') {
                    microInflam = "con componente de prostatitis crónica activa y presencia de neutrófilos intraglandulares";
                } else if (state.p4_inflamacion === 'granulomatosa_inespecifica') {
                    microInflam = "acompañado de una reacción inflamatoria granulomatosa con histiocitos epitelioides y células gigantes multinucleadas";
                }

                const microClosures = [
                    "la pseudocápsula periférica se encuentra libre de neoplasia. no se identifica proliferación acinar atípica (ASAP), neoplasia intraepitelial prostática de alto grado (HGPIN) ni adenocarcinoma invasor.",
                    "la pseudocápsula quirúrgica periférica está íntegra y libre de lesión. no se observan focos de proliferación acinar atípica (ASAP), HGPIN ni neoplasia maligna en el material examinado.",
                    "el plano de enucleación pseudocapsular periférico está desprovisto de lesión neoplásica. negativo para ASAP, HGPIN y adenocarcinoma."
                ];

                const openingMicro = microOpenings[hashSeed];
                const closureMicro = microClosures[hashSeed];

                const micro = `${openingMicro} ${microPatron}. el estroma interglandular presenta hiperplasia fibromuscular, ${microInflam}. ${closureMicro}`;

                const diagLines = [
                    "PRÓSTATA (ENUCLEACIÓN PROSTÁTICA):",
                    "- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (COMPONENTE GLANDULAR Y FIBROMUSCULAR)."
                ];
                if (state.p4_inflamacion === 'cronica_moderada_folicular') diagLines.push("- PROSTATITIS CRÓNICA MODERADA LINFOPLASMOCITARIA.");
                else if (state.p4_inflamacion === 'cronica_activa_microabscesos') diagLines.push("- PROSTATITIS CRÓNICA ACTIVA.");
                else if (state.p4_inflamacion === 'granulomatosa_inespecifica') diagLines.push("- PROSTATITIS GRANULOMATOSA.");
                else diagLines.push("- PROSTATITIS CRÓNICA LINFOHISTIOCITARIA LEVE INESPECÍFICA.");

                diagLines.push("- PSEUDOCÁPSULA QUIRÚRGICA LIBRE DE NEOPLASIA.");
                diagLines.push("- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) Y NEGATIVO PARA MALIGNIDAD EN EL MATERIAL EXAMINADO.");

                return { macro, micro, diag: diagLines.join("\n"), casetes: numCasetes };
            }
        },

        // ---------------------------------------------------------------------
        // 3. PROSTATECTOMÍA RADICAL (CAP v4.2 / Susan Lester / AJCC 8va Ed.)
        // ---------------------------------------------------------------------
        prostate_radical: {
            id: "prostate_radical",
            title: "Asistente: Prostatectomía Radical (CAP / Lester)",
            subtitle: "Estandarización Sinóptica de Cáncer de Próstata según Susan Lester & CAP v4.2.0.0",
            defaultState: {
                mode: 'peso',
                peso: 44.0,
                dimL: 5.0,
                dimA: 4.2,
                dimE: 3.8,
                casetes: 12,
                p2_macro: 'nodulo_posterior_izq',
                p3_gleason: 'gleason_3_4',
                p4_agresividad: 'cribiforme_no_idc_no',
                p5_extension_margen: 'pt2_margenes_libres_r0'
            },
            step1Config: {
                stepLabel: "Peso & Casetes",
                title: "Macroscopía: Peso, Dimensiones y Muestreo (Lester)",
                description: "Ingrese las dimensiones de la próstata (L x A x E cm) o el peso en gramos (g) para mapeo por cuadrantes y rebanadas seriadas.",
                showWeightDimToggle: true,
                defaultWeight: 44.0,
                defaultDims: { L: 5.0, A: 4.2, E: 3.8 },
                defaultCassettes: 12,
                calculateLive: (state) => {
                    let finalWeight = 0;
                    if (state.mode === 'peso') {
                        finalWeight = parseFloat(state.peso) || 0;
                    } else {
                        const L = parseFloat(state.dimL) || 0;
                        const A = parseFloat(state.dimA) || 0;
                        const E = parseFloat(state.dimE) || 0;
                        finalWeight = L > 0 && A > 0 && E > 0 ? (L * A * E * 0.55) : 0;
                    }
                    let recCassettes = 12; // Mapeo Lester: ápex, base, vesículas y cuadrantes tumorales
                    return {
                        weightText: `${finalWeight.toFixed(1)} <small>g</small>`,
                        cassettesText: `${recCassettes} <small>casetes mín.</small>`,
                        statusText: "Muestreo por cuadrantes (Susan Lester)"
                    };
                },
                apaCitation: {
                    title: "Protocolo Quirúrgico Patológico (Susan Lester, 2010 / CAP 2023):",
                    text: "Entintar hemicara derecha en negro y hemicara izquierda en azul/verde. Seccionar ápex (DUM) y cuello vesical (PUM) en cortes sagitales. Rebanar en cortes seriados de 3 a 4 mm desde ápex a base, mapeando en 4 cuadrantes (RA, LA, RP, LP).",
                    ref: "Lester, S. C. (2010). Manual of Surgical Pathology (3.ª ed., pp. 424–428). Elsevier Saunders."
                }
            },
            steps: [
                {
                    stepNumber: 2,
                    stepLabel: "Hallazgo Macro",
                    title: "Hallazgo Macroscópico y Localización Tumoral",
                    description: "Presione [1] a [4] para clasificar la apariencia macroscópica de la lesión.",
                    stateKey: "p2_macro",
                    options: [
                        { key: "1", val: "nodulo_posterior_izq", title: "Nódulo periférico posterior izquierdo firme", desc: "Lesión de consistencia firme, pardo-amarillenta de 1.6 cm a 2 mm del margen entintado. (Habitual / 60%)" },
                        { key: "2", val: "nodulo_posterior_der", title: "Nódulo periférico posterior derecho firme", desc: "Masa indurada circunscrita en lóbulo derecho de 1.5 cm próxima a cápsula entintada." },
                        { key: "3", val: "bilateral_multicentricidad", title: "Nódulos bilaterales independientes (Multicéntrico)", desc: "Focos tumorales firmes identificados en ambos lóbulos prostáticos." },
                        { key: "4", val: "no_visible_hiperplasia", title: "Sin tumor macroscópico evidente (Hiperplasia multinodular)", desc: "Parénquima multinodular difuso sin lesión expansiva neta; muestreo completo de rebanadas alternas." }
                    ]
                },
                {
                    stepNumber: 3,
                    stepLabel: "Gleason / ISUP",
                    title: "Score de Gleason y Grado Grupo ISUP (Microscopía)",
                    description: "Presione [1] a [5] para definir el grado arquitectural y porcentaje de patrón 4.",
                    stateKey: "p3_gleason",
                    options: [
                        { key: "1", val: "gleason_3_3", title: "Grupo de Grado 1 (Gleason 3 + 3 = 6)", desc: "Glándulas bien formadas individuales uniformes. Excelente pronóstico (Bajo Grado)." },
                        { key: "2", val: "gleason_3_4", title: "Grupo de Grado 2 (Gleason 3 + 4 = 7) - 15% Patrón 4", desc: "Predominio de patrón 3 con 15% de patrón 4 glandular fusionado. (Caso Típico / 65%)" },
                        { key: "3", val: "gleason_4_3", title: "Grupo de Grado 3 (Gleason 4 + 3 = 7) - 60% Patrón 4", desc: "Predominio de patrón 4 cribiforme/fusionado sobre patrón 3. Mayor riesgo biológico." },
                        { key: "4", val: "gleason_4_4", title: "Grupo de Grado 4 (Gleason 4 + 4 = 8)", desc: "Proliferación glandular cribiforme densa y fusionada pura sin patrón 5." },
                        { key: "5", val: "gleason_4_5", title: "Grupo de Grado 5 (Gleason 9 - 10: 4+5 / 5+4)", desc: "Presencia de sábanas sólidas, células sueltas y/o necrosis comedoniana de alto grado." }
                    ]
                },
                {
                    stepNumber: 4,
                    stepLabel: "Cribiforme / IDC",
                    title: "Glándulas Cribiformes y Carcinoma Intraductal (IDC)",
                    description: "Presione [1] a [4] para registrar características oncológicas agresivas.",
                    stateKey: "p4_agresividad",
                    options: [
                        { key: "1", val: "cribiforme_no_idc_no", title: "Glándulas cribiformes: NO / Carcinoma intraductal (IDC): NO", desc: "Sin arquitectura cribiforme ni proliferación intraductal expansiva. (Favorable / 80%)" },
                        { key: "2", val: "cribiforme_si_idc_no", title: "Glándulas cribiformes: PRESENTES / Carcinoma intraductal (IDC): NO", desc: "Patrón 4 cribiforme identificado (marcador adverso independiente de recurrencia)." },
                        { key: "3", val: "cribiforme_no_idc_si", title: "Glándulas cribiformes: NO / Carcinoma intraductal (IDC): PRESENTE", desc: "IDC presente en luces acinares con células basales preservadas (asociado a BRCA2)." },
                        { key: "4", val: "cribiforme_si_idc_si", title: "Glándulas cribiformes: PRESENTES / Carcinoma intraductal (IDC): PRESENTE", desc: "Ambos patrones de alta agresividad histopatológica identificados." }
                    ]
                },
                {
                    stepNumber: 5,
                    stepLabel: "pT y Márgenes",
                    title: "Extensión Extraprostática (pT) y Márgenes Quirúrgicos",
                    description: "Presione [1] a [4] para concluir la estadificación y estado de márgenes R0/R1.",
                    stateKey: "p5_extension_margen",
                    options: [
                        { key: "1", val: "pt2_margenes_libres_r0", title: "Confinado a la próstata (pT2) - Márgenes Libres (R0)", desc: "Sin invasión capsular extraprostática; márgenes apical, base y radiales negativos. (Habitual / 70%)" },
                        { key: "2", val: "pt3a_focal_margen_libre", title: "Extensión extraprostática focal (pT3a) - Márgenes Libres (R0)", desc: "Infiltración focal en grasa periprostática; margen entintado libre de neoplasia." },
                        { key: "3", val: "pt2_margen_apex_positivo_r1", title: "Confinado a próstata (pT2) - Margen Apical Positivo (R1)", desc: "Células tumorales en contacto directo con tinta en el margen uretral distal apical." },
                        { key: "4", val: "pt3b_vesiculas_seminales_r1", title: "Invasión de Vesículas Seminales (pT3b) / Margen Comprometido", desc: "Infiltración de la pared muscular de vesículas seminales (estadio avanzado pT3b)." }
                    ]
                }
            ],
            compileReport: (state) => {
                const dimsStr = state.mode === 'dimensiones'
                    ? `${parseFloat(state.dimL || 5.0).toFixed(1)} x ${parseFloat(state.dimA || 4.2).toFixed(1)} x ${parseFloat(state.dimE || 3.8).toFixed(1)}`
                    : "5.0 x 4.2 x 3.8";
                const pesoStr = `${parseFloat(state.peso || 44.0).toFixed(1)} g.`;
                const numCasetes = parseInt(state.casetes, 10) || 12;

                // 🧬 MOTOR DE PARAFRASEO CLÍNICO NATURAL (NO EXISTIRÁN DOS INFORMES IDÉNTICOS)
                const patientName = (document.getElementById('re_paciente') ? document.getElementById('re_paciente').value : '') || '';
                let hash = 0;
                for (let i = 0; i < patientName.length; i++) {
                    hash = (hash + patientName.charCodeAt(i) * (i + 1)) % 1000;
                }
                const seed = (hash + Math.round(parseFloat(state.peso || 44.0) * 10) + numCasetes) % 3;

                const macroOpenings = [
                    `se recibe espécimen quirúrgico en formol rotulado como PROSTATECTOMÍA RADICAL, con un peso de ${pesoStr} y medidas globales de ${dimsStr} cm. acompaña vesícula seminal derecha de 3.0 x 1.2 cm, vesícula seminal izquierda de 2.8 x 1.1 cm y segmentos de conductos deferentes de 1.5 cm. la superficie externa se encuentra íntegra.`,
                    `pieza quirúrgica remitida en formalina tamponada identificada como PROSTATECTOMÍA RADICAL TOTAL. peso neto glandular de ${pesoStr}, con dimensiones tridimensionales de ${dimsStr} cm. se identifican adheridas ambas vesículas seminales (derecha de 3.1 x 1.2 cm, izquierda de 2.9 x 1.0 cm) y muñones de conductos deferentes de 1.6 cm. la cápsula prostática externa se halla anatómicamente continua.`,
                    `se examina producto quirúrgico fijado en formol etiquetado como PROSTATECTOMÍA RADICAL CON VESÍCULAS SEMINALES. masa prostática con peso de ${pesoStr} y dimensiones de ${dimsStr} cm. acompañan vesícula seminal derecha (3.0 x 1.3 cm), vesícula seminal izquierda (2.7 x 1.1 cm) y extremos de deferentes de 1.4 cm. superficie periprostática lisa y congestiva, sin soluciones de continuidad capsular aparentes.`
                ];

                const inkingProtocols = [
                    "se realiza entintado tridimensional según protocolo de Susan Lester (2010):\n- hemicara derecha: tinta china negra.\n- hemicara izquierda: tinta china azul (o verde).",
                    "se procede al entintado de superficies externas siguiendo las directrices estandarizadas de Susan Lester:\n- hemipróstata derecha: codificada con tinta negra.\n- hemipróstata izquierda: codificada con tinta azul/verde.",
                    "orientación y marcaje quirúrgico bicoloreado según técnica de Susan Lester:\n- lóbulo y margen lateral derecho: tinta china negra.\n- lóbulo y margen lateral izquierdo: tinta china azul/verde."
                ];

                const sectioningProtocols = [
                    "se resecan el margen apical (DUM) y margen del cuello vesical / base (PUM) mediante cortes sagitales perpendiculares a la uretra. el cuerpo prostático se corta transversalmente en rebanadas seriadas de 3 a 4 mm desde el ápex a la base, mapeadas en 4 cuadrantes (RA, LA, RP, LP).",
                    "el margen uretral apical distal (DUM) y el margen del cuello vesical basal (PUM) se aíslan mediante secciones sagitales seriadas cónicas. el parénquima restante se lamina en cortes axiales paralelos cada 3 a 4 mm en sentido caudocraneal, sectorizando en cuatro cuadrantes de referencia (RA, LA, RP, LP).",
                    "amputación y corte sagital completo del ápex distal y del cono de cuello vesical proximal. el remanente glandular se lamina serialmente a intervalos de 3 a 4 mm de ápex a base, distribuyendo los cortes en cuadrantes anatómicos estandarizados (RA, LA, RP, LP)."
                ];

                let macroLesion = "en las rebanadas seriadas del tercio medio e inferior (zona periférica posterior izquierda), se identifica una lesión de consistencia firme, color pardo-amarillento y límites discretamente irregulares, que mide 1.6 x 1.2 x 0.9 cm, la cual dista 2.0 mm del margen entintado posterior más próximo, sin evidencia de disrupción capsular evidente";
                if (state.p2_macro === 'nodulo_posterior_der') {
                    const lesionDerVariants = [
                        "en la zona periférica posterior derecha se reconoce un nódulo indurado pardo-amarillento de 1.5 x 1.1 cm que dista 2.5 mm del margen capsular entintado posterior derecho",
                        "a nivel del lóbulo posterior derecho se individualiza una masa nodular blanquecino-amarillenta de consistencia dura elástica de 1.6 x 1.2 cm, situada a 2.0 mm de la tinta capsular periprostática",
                        "en el cuadrante posterolateral derecho se detecta un foco tumoral firme de 1.4 x 1.0 cm, respetando la superficie entintada con margen libre de 3.0 mm"
                    ];
                    macroLesion = lesionDerVariants[seed];
                } else if (state.p2_macro === 'bilateral_multicentricidad') {
                    const bilateralVariants = [
                        "se evidencian focos indurados pardo-amarillentos bilaterales en zonas periféricas posteriores de ambos lóbulos, el mayor de 1.7 cm en lóbulo izquierdo",
                        "al corte transversal seríado se reconocen nódulos bilaterales independientes: lesión dominante en lóbulo izquierdo de 1.6 cm y foco satélite en zona periférica derecha de 0.9 cm",
                        "muestra nódulos tumorales multifocales que comprometen ambos lóbulos prostáticos (1.8 cm en lado izquierdo y 1.1 cm en lado derecho)"
                    ];
                    macroLesion = bilateralVariants[seed];
                } else if (state.p2_macro === 'no_visible_hiperplasia') {
                    const diffuseVariants = [
                        "a los cortes seriados transversales cada 3 a 4 mm el parénquima prostático muestra arquitectura multinodular elasto-firme pardo-amarillenta con formaciones microquísticas ectásicas, sin nódulo tumoral neta o macroscópicamente delimitable",
                        "la superficie de corte parenquimatosa exhibe aspecto hiperplásico nodular difuso pardo-grisáceo, no reconociéndose masa expansiva focal nítida; se procede a muestreo amplio sistemático",
                        "parénquima prostático con cambios hiperplásicos nodulares multinodulares confluentes sin nódulo tumoral circunscrito definible macroscópicamente"
                    ];
                    macroLesion = diffuseVariants[seed];
                }

                const macro = `${macroOpenings[seed]}

${inkingProtocols[seed]}

${sectioningProtocols[seed]} ${macroLesion}. ambas vesículas seminales al corte no muestran lesiones sólidas ni necrosis. se incluye muestra representativa total de ápex, base, vesículas seminales y cuadrantes tumorales en ${numCasetes} casete(s).

<small style="font-size: 0.72rem; color: #64748b;">Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed., pp. 424–428). Elsevier / Saunders. / College of American Pathologists (CAP v4.2.0.0, 2023).</small>`;

                let gleasonPrim = 3, gleasonSec = 4, gleasonTotal = 7, isupGroup = 2, pctP4 = "15%";
                let gleasonDesc = "predominio de glándulas bien formadas de calibre pequeño (patrón 3) con componente menor de glándulas fusionadas e irregulares (patrón 4, 15%)";
                if (state.p3_gleason === 'gleason_3_3') {
                    gleasonPrim = 3; gleasonSec = 3; gleasonTotal = 6; isupGroup = 1; pctP4 = "0%";
                    gleasonDesc = "proliferación de glándulas neoplásicas acinares pequeñas, individuales, redondas a ovaladas, bien formadas, de contornos lisos y espaciadas regularmente (patrón 3 exclusivo)";
                } else if (state.p3_gleason === 'gleason_4_3') {
                    gleasonPrim = 4; gleasonSec = 3; gleasonTotal = 7; isupGroup = 3; pctP4 = "60%";
                    gleasonDesc = "predominio de patrón 4 constituido por glándulas acinares fusionadas y complejas (60% del volumen) con componente menor de glándulas patrón 3 bien formadas (40%)";
                } else if (state.p3_gleason === 'gleason_4_4') {
                    gleasonPrim = 4; gleasonSec = 4; gleasonTotal = 8; isupGroup = 4; pctP4 = "100%";
                    gleasonDesc = "glándulas neoplásicas con fusión acinar densa, luces complejas hendidas y patrón cribiforme extenso sin áreas de patrón 3";
                } else if (state.p3_gleason === 'gleason_4_5') {
                    gleasonPrim = 4; gleasonSec = 5; gleasonTotal = 9; isupGroup = 5; pctP4 = "variable";
                    gleasonDesc = "glándulas fusionadas y cribiformes de patrón 4 entremezcladas con nidos sólidos, células sueltas infiltrativas y áreas focales de necrosis comedoniana (patrón 5)";
                }

                let cribStatus = "no identificadas";
                let idcStatus = "no identificado";
                if (state.p4_agresividad === 'cribiforme_si_idc_no') {
                    cribStatus = "presentes (patrón 4 cribiforme identificado)";
                } else if (state.p4_agresividad === 'cribiforme_no_idc_si') {
                    idcStatus = "presente en luces glandulares preexistentes con células basales preservadas";
                } else if (state.p4_agresividad === 'cribiforme_si_idc_si') {
                    cribStatus = "presentes";
                    idcStatus = "presente";
                }

                let epeText = "no identificada. la neoplasia se encuentra enteramente confinada al parénquima prostático sin disrupción capsular (pT2)";
                let margText = "todos los márgenes quirúrgicos examinados (apical uretral, cuello vesical y radiales circunferenciales) se encuentran libres de neoplasia invasora (R0). distancia mínima al margen entintado más próximo: 2.0 mm";
                let ptCategory = "pT2";
                let rCategory = "R0";

                if (state.p5_extension_margen === 'pt3a_focal_margen_libre') {
                    epeText = "presente de manera focal. se identifican nidos tumorales aislados extendiéndose hacia el tejido adiposo periprostático a través de la cápsula (pT3a focal)";
                    margText = "los márgenes quirúrgicos entintados se encuentran libres de neoplasia (R0). distancia mínima a tinta: 1.2 mm";
                    ptCategory = "pT3a";
                } else if (state.p5_extension_margen === 'pt2_margen_apex_positivo_r1') {
                    epeText = "no identificada en el cuerpo prostático";
                    margText = "margen quirúrgico apical uretral distal comprometido por células neoplásicas en contacto directo con la tinta (R1). márgenes radiales y de base libres";
                    ptCategory = "pT2";
                    rCategory = "R1";
                } else if (state.p5_extension_margen === 'pt3b_vesiculas_seminales_r1') {
                    epeText = "presente, con extensión extraprostática franca y compromiso tumoral de la pared muscular de ambas vesículas seminales (pT3b)";
                    margText = "margen quirúrgico periférico radial en contacto focal con neoplasia (R1)";
                    ptCategory = "pT3b";
                    rCategory = "R1";
                }

                const microOpenings = [
                    "los cortes histológicos confirman la presencia de una neoplasia maligna epitelial correspondiente a ADENOCARCINOMA ACINAR DE PRÓSTATA (OMS 5.ª Edición).",
                    "la evaluación histopatológica de las secciones seriadas demuestra proliferación neoplásica epitelial maligna clasificada como ADENOCARCINOMA ACINAR CONVENCIONAL DE LA PRÓSTATA (Criterios OMS 2022).",
                    "el estudio microscópico revela una neoplasia epitelial maligna infiltrante de estirpe ADENOCARCINOMA ACINAR PROSTÁTICO (Clasificación OMS 5.ª Edición / CAP)."
                ];

                const benignBackground = [
                    "parénquima prostático no tumoral acompañante: hiperplasia nodular prostática benigna con prostatitis crónica linfohistiocitaria leve.",
                    "tejido prostático adyacente no neoplásico: cambios de hiperplasia adenomiomatosa con discreto infiltrado inflamatorio crónico linfoide estromal inespecífico.",
                    "parénquima prostático no tumoral residual: hiperplasia glandular y estromal con focos leves de prostatitis crónica inespecífica."
                ];

                const micro = `${microOpenings[seed]}

ARQUITECTURA Y DIFERENCIACIÓN (SISTEMA GLEASON / ISUP 2022):
• patrón histológico primario: gleason ${gleasonPrim}.
• patrón histológico secundario: gleason ${gleasonSec}.
• score de gleason combinado: ${gleasonPrim} + ${gleasonSec} = ${gleasonTotal}.
• grupo de grado histológico ISUP: GRUPO DE GRADO ${isupGroup}.
• porcentaje de patrón 4: ${pctP4}.
• arquitectura y características citológicas: ${gleasonDesc}.
• glándulas cribiformes: ${cribStatus}.
• carcinoma intraductal (IDC): ${idcStatus}.

EXTENSIÓN TUMORAL E INVASIONES:
• extensión extraprostática (EPE): ${epeText}.
• invasión de vesículas seminales (SVI): ${state.p5_extension_margen.includes('pt3b') ? 'presente' : 'no identificada (libres de neoplasia)'}.
• invasión perineural (PNI): presente en ramas nerviosas periféricas intraprostáticas.
• invasión linfovascular (LVI): no identificada.

EVALUACIÓN DE MÁRGENES QUIRÚRGICOS (ESTÁNDAR CAP / LESTER "INK ON TUMOR"):
• ${margText}.
• ${benignBackground[seed]}`;

                const diagLines = [
                    "PRÓSTATA Y VESÍCULAS SEMINALES (PROSTATECTOMÍA RADICAL):",
                    "- ADENOCARCINOMA ACINAR CONVENCIONAL DE LA PRÓSTATA.",
                    `- GRUPO DE GRADO HISTOLÓGICO ISUP ${isupGroup} (GLEASON SCORE ${gleasonPrim} + ${gleasonSec} = ${gleasonTotal}).`,
                    `  * PORCENTAJE DE PATRÓN 4: ${pctP4}.`,
                    `  * GLÁNDULAS CRIBIFORMES: ${cribStatus.toUpperCase()}.`,
                    `  * CARCINOMA INTRADUCTAL (IDC): ${idcStatus.toUpperCase()}.`,
                    `- EXTENSIÓN EXTRA-PROSTÁTICA (EPE): ${epeText.toUpperCase()}.`,
                    `- INVASIÓN DE VESÍCULAS SEMINALES: ${state.p5_extension_margen.includes('pt3b') ? 'POSITIVA (pT3b)' : 'NEGATIVA (LIBRES BILATERALMENTE)'}.`,
                    "- INVASIÓN PERINEURAL (PNI): IDENTIFICADA.",
                    "- INVASIÓN LINFOVASCULAR (LVI): NO IDENTIFICADA.",
                    `- ESTADO DE MÁRGENES QUIRÚRGICOS: ${rCategory === 'R0' ? 'TODOS LOS MÁRGENES LIBRES DE NEOPLASIA (R0).' : 'MARGEN COMPROMETIDO (R1).'}`,
                    `- ESTADIFICACIÓN PATOLÓGICA (AJCC 8.ª EDICIÓN / CAP v4.2.0.0): ${ptCategory} pNX ${rCategory}.`,
                    "",
                    "================================================================================",
                    "RESUMEN SINÓPTICO CAP: PROSTATECTOMÍA RADICAL (AJCC 8.ª Ed. / CAP v4.2.0.0)",
                    "================================================================================",
                    "• Procedimiento: Prostatectomía radical",
                    "• Integridad del espécimen: Íntegro",
                    "• Tipo histológico: Adenocarcinoma acinar convencional",
                    `• Score de Gleason: ${gleasonPrim} + ${gleasonSec} = ${gleasonTotal} (Grupo de Grado ISUP ${isupGroup})`,
                    `• Porcentaje de patrón 4: ${pctP4}`,
                    `• Glándulas cribiformes: ${cribStatus}`,
                    `• Carcinoma intraductal: ${idcStatus}`,
                    `• Categoría pT (AJCC 8.ª Ed.): ${ptCategory}`,
                    `• Estado de márgenes: ${rCategory === 'R0' ? 'Negativos (R0)' : 'Positivo (R1)'}`,
                    "• Invasión perineural: Presente",
                    "• Invasión linfovascular: No identificada",
                    "================================================================================"
                ];

                return { macro, micro, diag: diagLines.join("\n"), casetes: numCasetes };
            }
        },

        // ---------------------------------------------------------------------
        // 4. NEVUS INTRADÉRMICO (Dermatopatología / Piel)
        // ---------------------------------------------------------------------
        nevus_intradermico: {
            id: "nevus_intradermico",
            title: "Asistente: Nevus Intradérmico",
            subtitle: "Estandarización Dermatopatológica según Susan Lester & McKee",
            defaultState: {
                mode: 'dimensiones',
                dimL: 1.2,
                dimA: 0.8,
                dimE: 0.4,
                lesionDiam: 0.5,
                casetes: 1,
                p2_macro: 'papulomatoso_cupuliforme',
                p3_micro: 'proliferacion_dermica_sin_union',
                p4_maduracion: 'gradiente_a_b_c_conservado',
                p5_margenes: 'margenes_libres_negativo_melanoma'
            },
            step1Config: {
                title: "Macroscopía: Dimensiones de Elipse Cutánea y Casetes",
                description: "Ingrese las dimensiones del losange de piel (L x A x E cm) y el diámetro de la lesión sobreelevada para su inclusión total.",
                showWeightDimToggle: false,
                defaultDims: { L: 1.2, A: 0.8, E: 0.4 },
                defaultLesionDiam: 0.5,
                defaultCassettes: 1,
                calculateLive: (state) => {
                    const L = parseFloat(state.dimL) || 1.2;
                    const A = parseFloat(state.dimA) || 0.8;
                    const diam = parseFloat(state.lesionDiam) || 0.5;
                    const numCass = parseInt(state.casetes, 10) || 1;
                    return {
                        weightText: `${L.toFixed(1)} x ${A.toFixed(1)} <small>cm</small>`,
                        cassettesText: `${numCass} <small>casete(s)</small>`,
                        statusText: `Lesión de ${diam.toFixed(1)} cm incluida al 100%`
                    };
                },
                apaCitation: {
                    title: "Criterio Dermatopatológico de Inclusión (Susan Lester & McKee):",
                    text: "Losanges y elipses cutáneas de escisión para lesiones névicas benignas: orientar perpendicularmente al eje mayor e incluir la totalidad del espécimen en cortes transversales seriados (1 casete habitual para piezas ≤ 2.0 cm).",
                    ref: "Lester, S. C. (2010). Manual of Surgical Pathology (3.ª ed.). Elsevier Saunders.\nCalonje, E. et al. (2019). McKee's Pathology of the Skin (5.ª ed.). Elsevier."
                }
            },
            steps: [
                {
                    stepNumber: 2,
                    title: "Pigmentación y Aspecto Macroscópico",
                    description: "Presione [1] a [4] para definir el aspecto clínico-macroscópico de la lesión.",
                    stateKey: "p2_macro",
                    options: [
                        { key: "1", val: "papulomatoso_cupuliforme", title: "Pardo claro a normopigmentado, papilomatoso cupuliforme", desc: "Lesión sobreelevada circunscrita con bordes netos y regulares. (Habitual / 90%)" },
                        { key: "2", val: "verrucoso_pediculado", title: "Lesión papilomatosa verrucosa sésil o pediculada", desc: "Superficie cerebriforme o mamelonada pardo-clara elástica." },
                        { key: "3", val: "color_piel_amelanotico", title: "Nódulo hemisférico cupuliforme color piel / amelanótico", desc: "Lesión lisa del color de la piel adyacente sin pigmentación visible." },
                        { key: "4", val: "pardo_oscuro_regular", title: "Lesión nodular cupuliforme pardo-oscura homogénea", desc: "Pigmentación marrón difusa regular sin ulceración epidérmica." }
                    ]
                },
                {
                    stepNumber: 3,
                    title: "Arquitectura Histológica y Nidos Névicos",
                    description: "Presione [1] a [4] para registrar la disposición celular dérmica.",
                    stateKey: "p3_micro",
                    options: [
                        { key: "1", val: "proliferacion_dermica_sin_union", title: "Proliferación dérmica en nidos y cordones (Sin actividad de unión)", desc: "Células névicas en dermis papilar y reticular sin actividad dermoepidérmica. (Habitual / 90%)" },
                        { key: "2", val: "nidos_densos_papilomatosis", title: "Nidos dérmicos con hiperqueratosis y papilomatosis epidérmica", desc: "Arquitectura verrucosa benigna con crestas interpapilares alargadas." },
                        { key: "3", val: "con_metaplasia_adiposa", title: "Nevus intradérmico con metaplasia adiposa estromal", desc: "Adipocitos maduros interpuestos entre los nidos névicos dérmicos profundos." },
                        { key: "4", val: "celulas_gigantes_anillo", title: "Presencia de células névicas gigantes multinucleadas benignas", desc: "Núcleos dispuestos en corona periférica sin atipia citológica." }
                    ]
                },
                {
                    stepNumber: 4,
                    title: "Gradiente de Maduración en Profundidad",
                    description: "Presione [1] a [4] para registrar la maduración celular en dermis.",
                    stateKey: "p4_maduracion",
                    options: [
                        { key: "1", val: "gradiente_a_b_c_conservado", title: "Gradiente conservado hacia la profundidad (Tipo A -> B -> C)", desc: "Transición de células epitelioides (A) a linfocitoides (B) y neuroides schwannianas (C) en la base. (Habitual / 90%)" },
                        { key: "2", val: "predominio_neuroide_c", title: "Prominente diferenciación neuroide profunda (Nevus de Miescher)", desc: "Células fusocelulares delgadas entre haces de colágeno dérmico." },
                        { key: "3", val: "maduracion_con_pigmento_leve", title: "Maduración normal con escasa melanina y melanófagos dérmicos", desc: "Pigmentación melánica superficial leve sin incontinencia profunda." },
                        { key: "4", val: "estroma_hialino_maduro", title: "Maduración conservada con estroma colagénico hialinizado", desc: "Fibrosis estromal madura perianexial sin reacción inflamatoria." }
                    ]
                },
                {
                    stepNumber: 5,
                    title: "Márgenes Quirúrgicos y Onco-Seguridad",
                    description: "Presione [1] a [4] para evaluar márgenes y descartar melanoma.",
                    stateKey: "p5_margenes",
                    options: [
                        { key: "1", val: "margenes_libres_negativo_melanoma", title: "Márgenes laterales y profundo libres; Negativo para Melanoma", desc: "Márgenes quirúrgicos negativos sin atipia citológica, mitosis ni necrosis. (Habitual / 90%)" },
                        { key: "2", val: "margen_lateral_estrecho", title: "Margen lateral libre pero estrecho (< 1.0 mm)", desc: "Lesión completa a corta distancia del borde de sección epidérmico lateral." },
                        { key: "3", val: "margen_profundo_proximo", title: "Margen quirúrgico profundo libre en dermis reticular sana", desc: "Células tipo C maduras próximas al plano quirúrgico profundo libre." },
                        { key: "4", val: "contacto_focal_benigno", title: "Contacto focal de nidos névicos benignos en borde lateral", desc: "Nidos névicos maduros benignos en borde lateral sin cambios melanómicos." }
                    ]
                }
            ],
            compileReport: (state) => {
                const L = parseFloat(state.dimL || 1.2).toFixed(1);
                const A = parseFloat(state.dimA || 0.8).toFixed(1);
                const E = parseFloat(state.dimE || 0.4).toFixed(1);
                const diam = parseFloat(state.lesionDiam || 0.5).toFixed(1);
                const numCasetes = parseInt(state.casetes, 10) || 1;

                let macroAspecto = `una lesión sobreelevada de aspecto papilomatoso y circunscrito, de coloración pardo-clara a normopigmentada, que mide ${diam} cm en su eje mayor, con bordes netos y regulares`;
                if (state.p2_macro === 'verrucoso_pediculado') macroAspecto = `una formación papilomatosa verrucosa sésil/pediculada de superficie cerebriforme y color pardo claro, que mide ${diam} cm en su eje mayor`;
                else if (state.p2_macro === 'color_piel_amelanotico') macroAspecto = `una lesión nodular cupuliforme sobreelevada, lisa, de coloración similar a la piel adyacente (amelanótica), que mide ${diam} cm en su eje mayor`;
                else if (state.p2_macro === 'pardo_oscuro_regular') macroAspecto = `una lesión cupuliforme circunscrita, de coloración pardo-oscura homogénea y superficie no ulcerada, que mide ${diam} cm en su eje mayor`;

                const macro = `se recibe losange de piel que mide ${L} x ${A} x ${E} cm. la superficie epidérmica exhibe ${macroAspecto}. al corte, el tejido subyacente es blanquecino, homogéneo y elástico. los márgenes quirúrgicos periféricos y profundo se encuentran macroscópicamente libres. se incluye la totalidad de la muestra en ${numCasetes} casete(s).\n\nLester, S. C. (2010). Manual of Surgical Pathology (3rd ed.). Elsevier / Saunders.\nCalonje, E., Brenn, T., Lazar, A. J., & Billings, S. D. (2019). McKee's Pathology of the Skin with Clinical Correlations (5th ed.). Elsevier.`;

                let microMaduracion = "se reconoce un gradiente de maduración conservado hacia la profundidad, observándose transición de células tipo a epitelioides a células tipo c neuroides en la base";
                if (state.p4_maduracion === 'predominio_neuroide_c') microMaduracion = "se reconoce una prominente maduración neuroide en dermis profunda con células fusiformes tipo Schwann bien diferenciadas";
                else if (state.p4_maduracion === 'maduracion_con_pigmento_leve') microMaduracion = "se reconoce un gradiente de maduración conservado hacia la profundidad, con escasa melanina y melanófagos dérmicos superficiales";
                else if (state.p4_maduracion === 'estroma_hialino_maduro') microMaduracion = "se reconoce maduración ordenada hacia la profundidad asociada a un estroma colagénico dérmico hialinizado";

                let microMargenes = "los márgenes de resección quirúrgicos laterales y profundo se encuentran libres de lesión névica.";
                if (state.p5_margenes === 'margen_lateral_estrecho') microMargenes = "el margen quirúrgico lateral más próximo se encuentra libre de lesión a menos de 1 mm.";
                else if (state.p5_margenes === 'margen_profundo_proximo') microMargenes = "el margen quirúrgico profundo se encuentra libre de lesión en dermis reticular sana.";
                else if (state.p5_margenes === 'contacto_focal_benigno') microMargenes = "se observa contacto focal de nidos névicos benignos maduros con el margen quirúrgico lateral.";

                const micro = `los cortes histológicos muestran epidermis de revestimiento con arquitectura conservada, sin atipia ni migración pagetoide. en la dermis papilar y reticular se identifica una proliferación melanocítica benigna dispuesta en nidos y cordones uniformes, sin actividad de unión dermoepidérmica. ${microMaduracion}. no se identifica atipia citológica, pleomorfismo nuclear, figuras de mitosis dérmicas ni necrosis. ${microMargenes}`;

                let diagMargen = "- MÁRGENES QUIRÚRGICOS LATERALES Y PROFUNDO LIBRES DE LESIÓN NÉVICA.";
                if (state.p5_margenes === 'contacto_focal_benigno') diagMargen = "- MÁRGENES QUIRÚRGICOS CON CONTACTO FOCAL DE NEVUS BENIGNO EN BORDE LATERAL.";

                const diagLines = [
                    "PIEL (BIOPSIA ESCISIONAL):",
                    "- NEVUS MELANOCÍTICO INTRADÉRMICO (BENIGNO).",
                    diagMargen,
                    "- NEGATIVO PARA ATIPIA CITOLÓGICA O MALIGNIDAD (NEGATIVO PARA MELANOMA)."
                ];

                return { macro, micro, diag: diagLines.join("\n"), casetes: numCasetes };
            }
        }
    };

    let activeWizardSchema = null;
    let polymorphicWizardState = {
        currentStep: 1,
        mode: 'peso',
        peso: 45.0,
        dimL: 7.0,
        dimA: 5.0,
        dimE: 4.0,
        lesionDiam: 0.5,
        casetes: 3
    };

    function getWizardSchemaForTemplate(templateId, templateTitle) {
        let title = String(templateTitle || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!title && templateId) {
            const tpl = (templatesDatabase || []).find(t => String(t.id) === String(templateId));
            if (tpl) title = String(tpl.titulo || tpl.plantilla || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        if (!title) return null;

        // 1. Morcelados de Próstata / RTUP
        if (title.includes('MORCELAD') && (title.includes('PROSTAT') || title.includes('PROST'))) {
            return wizardSchemas.prostate_morcelado;
        }
        // 2. Enucleación Prostática / HoLEP / Adenomectomía
        if (title.includes('ENUCLEAC') || title.includes('HOLEP') || title.includes('ADENOMECTOM')) {
            return wizardSchemas.prostate_enucleacion;
        }
        // 3. Prostatectomía Radical (CAP / Lester)
        if (title.includes('RADICAL') && (title.includes('PROSTAT') || title.includes('PROST'))) {
            return wizardSchemas.prostate_radical;
        }
        // 4. Nevus Intradérmico / Nevus Cutáneo
        if (title.includes('NEVUS') || title.includes('INTRADERM') || title.includes('LUNAR')) {
            return wizardSchemas.nevus_intradermico;
        }

        return null;
    }
    window.getWizardSchemaForTemplate = getWizardSchemaForTemplate;

    function isMorceladosTemplate(templateId, templateTitle) {
        return getWizardSchemaForTemplate(templateId, templateTitle) !== null;
    }
    window.isMorceladosTemplate = isMorceladosTemplate;

    function abrirPlantillaWizard(templateId, templateTitle, initialMode = 'fase1_macro') {
        const schema = getWizardSchemaForTemplate(templateId, templateTitle);
        if (!schema) {
            console.warn("[Wizard Engine] No se encontró esquema interactivo para:", templateId, templateTitle);
            return false;
        }

        activeWizardSchema = schema;
        const startStep = initialMode === 'fase2_micro' ? 3 : 1;
        polymorphicWizardState = Object.assign({ currentStep: startStep, wizardPhase: initialMode }, JSON.parse(JSON.stringify(schema.defaultState)));

        const overlay = document.getElementById('wizardModalOverlay');
        if (!overlay) return false;

        overlay.style.setProperty('z-index', '2000100', 'important');

        // Configurar Títulos del Modal
        const titleEl = document.getElementById('wizardModalTitle');
        const subtitleEl = overlay.querySelector('.wizard-subtitle');
        if (titleEl) titleEl.textContent = schema.title;
        if (subtitleEl) subtitleEl.textContent = schema.subtitle;

        // Renderizar dinámicamente pasos P1..P5
        renderPolymorphicWizardPanes(schema);

        // Inicializar inputs de Paso 1
        const elPeso = document.getElementById('mw_pesoGramos');
        const elL = document.getElementById('mw_dimLargo');
        const elA = document.getElementById('mw_dimAncho');
        const elE = document.getElementById('mw_dimEspesor');
        const elCass = document.getElementById('mw_numCasetes');

        if (elPeso) elPeso.value = polymorphicWizardState.peso || (schema.step1Config ? schema.step1Config.defaultWeight : 45.0);
        if (elL) elL.value = polymorphicWizardState.dimL || (schema.step1Config && schema.step1Config.defaultDims ? schema.step1Config.defaultDims.L : 7.0);
        if (elA) elA.value = polymorphicWizardState.dimA || (schema.step1Config && schema.step1Config.defaultDims ? schema.step1Config.defaultDims.A : 5.0);
        if (elE) elE.value = polymorphicWizardState.dimE || (schema.step1Config && schema.step1Config.defaultDims ? schema.step1Config.defaultDims.E : 4.0);
        if (elCass) elCass.value = polymorphicWizardState.casetes || (schema.step1Config ? schema.step1Config.defaultCassettes : 3);

        setMorceladoInputMode(polymorphicWizardState.mode || 'peso');
        setWizardActivePhase(initialMode);
        updateLiveSamplingCalculation();

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (initialMode !== 'fase2_micro') {
                const input = polymorphicWizardState.mode === 'peso' 
                    ? document.getElementById('mw_pesoGramos') 
                    : document.getElementById('mw_dimLargo');
                if (input) { input.focus(); input.select(); }
            }
        }, 100);

        return true;
    }
    window.abrirPlantillaWizard = abrirPlantillaWizard;
    window.abrirMorceladosWizard = () => abrirPlantillaWizard('999', 'MORCELADOS DE PRÓSTATA', 'fase1_macro');
    window.abrirProstatectomiaRadicalWizard = (mode = 'fase1_macro') => abrirPlantillaWizard('997', 'PROSTATECTOMÍA RADICAL', mode);

    function closeMorceladosWizard() {
        const overlay = document.getElementById('wizardModalOverlay');
        if (overlay) overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
    window.closeMorceladosWizard = closeMorceladosWizard;

    function setWizardActivePhase(phase) {
        if (!polymorphicWizardState) return;
        polymorphicWizardState.wizardPhase = phase;
        
        const badge = document.getElementById('wizardActivePhaseBadge');
        const pill1 = document.getElementById('btnPillFase1');
        const pill2 = document.getElementById('btnPillFase2');
        const pillComp = document.getElementById('btnPillCompleto');

        if (pill1) {
            pill1.style.background = phase === 'fase1_macro' ? '#0284c7' : 'rgba(2, 132, 199, 0.15)';
            pill1.style.color = phase === 'fase1_macro' ? 'white' : '#38bdf8';
        }
        if (pill2) {
            pill2.style.background = phase === 'fase2_micro' ? '#059669' : 'rgba(16, 185, 129, 0.15)';
            pill2.style.color = phase === 'fase2_micro' ? 'white' : '#34d399';
        }
        if (pillComp) {
            pillComp.style.background = phase === 'completo' ? '#475569' : 'rgba(148, 163, 184, 0.15)';
            pillComp.style.color = phase === 'completo' ? 'white' : '#cbd5e1';
        }

        if (badge) {
            if (phase === 'fase1_macro') {
                badge.style.background = '#0284c7';
                badge.innerHTML = '<i class="fa-solid fa-box-archive"></i> FASE 1: Macroscopía y Casetes (Día 0)';
            } else if (phase === 'fase2_micro') {
                badge.style.background = '#059669';
                badge.innerHTML = '<i class="fa-solid fa-microscope"></i> FASE 2: Microscopía y Diagnóstico CAP (Día 3)';
            } else {
                badge.style.background = '#475569';
                badge.innerHTML = '<i class="fa-solid fa-layer-group"></i> Flujo Completo (Ambas Fases)';
            }
        }

        if (phase === 'fase1_macro' && polymorphicWizardState.currentStep > 2) {
            morceladosWizardGoToStep(1);
        } else if (phase === 'fase2_micro' && polymorphicWizardState.currentStep < 3) {
            morceladosWizardGoToStep(3);
        } else {
            morceladosWizardGoToStep(polymorphicWizardState.currentStep || 1);
        }
    }
    window.setWizardActivePhase = setWizardActivePhase;

    function renderPolymorphicWizardPanes(schema) {
        const s1 = schema.step1Config;
        if (s1) {
            const pane1 = document.getElementById('wizardStep1');
            if (pane1) {
                const h3 = pane1.querySelector('.step-heading');
                const desc = pane1.querySelector('.step-description');
                if (h3) h3.textContent = s1.title;
                if (desc) desc.textContent = s1.description;

                const toggleWrap = pane1.querySelector('.wizard-mode-toggle-wrapper');
                if (toggleWrap) {
                    toggleWrap.style.display = s1.showWeightDimToggle ? 'flex' : 'none';
                }

                const citationTitle = pane1.querySelector('.citation-header strong');
                const citationBody = pane1.querySelector('.citation-body');
                const citationRef = pane1.querySelector('.citation-reference small');
                if (citationTitle && s1.apaCitation) citationTitle.textContent = s1.apaCitation.title;
                if (citationBody && s1.apaCitation) citationBody.textContent = `"${s1.apaCitation.text}"`;
                if (citationRef && s1.apaCitation) citationRef.innerHTML = `<strong>Referencia APA:</strong> ${s1.apaCitation.ref}`;
            }

            // Actualizar etiqueta del Stepper para Paso 1
            if (s1.stepLabel) {
                const lbl1 = document.querySelector('.wizard-step-item[data-step="1"] .step-label');
                if (lbl1) lbl1.textContent = s1.stepLabel;
            }
        }

        const totalSteps = (schema && schema.steps) ? (schema.steps.length + 1) : 5;
        document.querySelectorAll('.wizard-step-item').forEach(item => {
            const itemStep = parseInt(item.getAttribute('data-step'), 10);
            if (itemStep > totalSteps) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });

        schema.steps.forEach(stepConf => {
            // Actualizar etiqueta del Stepper
            if (stepConf.stepLabel) {
                const lbl = document.querySelector(`.wizard-step-item[data-step="${stepConf.stepNumber}"] .step-label`);
                if (lbl) lbl.textContent = stepConf.stepLabel;
            }

            const pane = document.getElementById(`wizardStep${stepConf.stepNumber}`);
            if (!pane) return;

            const heading = pane.querySelector('.step-heading');
            const desc = pane.querySelector('.step-description');
            if (heading) heading.textContent = stepConf.title;
            if (desc) desc.textContent = stepConf.description;

            const grid = pane.querySelector('.wizard-choice-grid');
            if (grid) {
                grid.innerHTML = '';
                stepConf.options.forEach(opt => {
                    const card = document.createElement('div');
                    const isSelected = polymorphicWizardState[stepConf.stateKey] === opt.val;
                    card.className = `wizard-choice-card ${isSelected ? 'selected' : ''}`;
                    card.tabIndex = 0;
                    card.setAttribute('data-key', opt.key);
                    card.setAttribute('data-val', opt.val);
                    card.innerHTML = `
                        <div class="choice-key-badge">${opt.key}</div>
                        <div class="choice-content">
                            <h4 class="choice-title">${opt.title}</h4>
                            <p class="choice-desc">${opt.desc}</p>
                        </div>
                        <i class="fa-solid fa-circle-check choice-check-icon"></i>
                    `;
                    card.onclick = () => selectWizardOption(stepConf.stepNumber, opt.val, card);
                    grid.appendChild(card);
                });
            }
        });
    }

    function setMorceladoInputMode(mode) {
        polymorphicWizardState.mode = mode;
        const btnWeight = document.getElementById('btnToggleWeightMode');
        const btnDim = document.getElementById('btnToggleDimMode');
        const groupWeight = document.getElementById('groupWeightInput');
        const groupDim = document.getElementById('groupDimensionInputs');

        if (mode === 'peso') {
            if (btnWeight) btnWeight.classList.add('active');
            if (btnDim) btnDim.classList.remove('active');
            if (groupWeight) groupWeight.style.display = 'flex';
            if (groupDim) groupDim.style.display = 'none';
            const input = document.getElementById('mw_pesoGramos');
            if (input) { input.focus(); input.select(); }
        } else {
            if (btnWeight) btnWeight.classList.remove('active');
            if (btnDim) btnDim.classList.add('active');
            if (groupWeight) groupWeight.style.display = 'none';
            if (groupDim) groupDim.style.display = 'flex';
            const input = document.getElementById('mw_dimLargo');
            if (input) { input.focus(); input.select(); }
        }
        updateLiveSamplingCalculation();
    }
    window.setMorceladoInputMode = setMorceladoInputMode;

    function updateLiveSamplingCalculation() {
        if (!activeWizardSchema) activeWizardSchema = wizardSchemas.prostate_morcelado;

        const elPeso = document.getElementById('mw_pesoGramos');
        const elL = document.getElementById('mw_dimLargo');
        const elA = document.getElementById('mw_dimAncho');
        const elE = document.getElementById('mw_dimEspesor');
        const elCass = document.getElementById('mw_numCasetes');

        if (elPeso) polymorphicWizardState.peso = parseFloat(elPeso.value) || 0;
        if (elL) polymorphicWizardState.dimL = parseFloat(elL.value) || 0;
        if (elA) polymorphicWizardState.dimA = parseFloat(elA.value) || 0;
        if (elE) polymorphicWizardState.dimE = parseFloat(elE.value) || 0;
        if (elCass) polymorphicWizardState.casetes = parseInt(elCass.value, 10) || 1;

        if (activeWizardSchema.step1Config && activeWizardSchema.step1Config.calculateLive) {
            const calc = activeWizardSchema.step1Config.calculateLive(polymorphicWizardState);
            const elWeightDisplay = document.getElementById('mw_liveCalculatedWeight');
            const elCassDisplay = document.getElementById('mw_liveRecommendedCassettes');
            if (elWeightDisplay) elWeightDisplay.innerHTML = calc.weightText;
            if (elCassDisplay) elCassDisplay.innerHTML = calc.cassettesText;
        }
    }
    window.updateLiveSamplingCalculation = updateLiveSamplingCalculation;

    function morceladosWizardGoToStep(step) {
        polymorphicWizardState.currentStep = step;
        
        document.querySelectorAll('.wizard-step-item').forEach(item => {
            const itemStep = parseInt(item.getAttribute('data-step'), 10);
            item.classList.remove('active', 'completed');
            if (itemStep === step) item.classList.add('active');
            else if (itemStep < step) item.classList.add('completed');
        });

        document.querySelectorAll('.wizard-step-pane').forEach(pane => {
            const paneStep = parseInt(pane.getAttribute('data-step'), 10);
            pane.classList.toggle('active', paneStep === step);
        });

        const btnPrev = document.getElementById('btnWizardPrev');
        const btnNext = document.getElementById('btnWizardNext');
        const btnGen = document.getElementById('btnWizardGenerate');
        const btnFase1 = document.getElementById('btnWizardFase1Macro');
        const btnFase2 = document.getElementById('btnWizardFase2Micro');

        const currentPhase = polymorphicWizardState.wizardPhase || 'completo';
        const totalSteps = (activeWizardSchema && activeWizardSchema.steps) ? (activeWizardSchema.steps.length + 1) : 5;

        if (btnPrev) btnPrev.style.display = (step > 1 && (currentPhase !== 'fase2_micro' || step > 3)) ? 'inline-flex' : 'none';
        if (btnNext) btnNext.style.display = step < totalSteps ? 'inline-flex' : 'none';
        
        // Botón Fase 1 (Día 0) visible en pasos 1 y 2
        if (btnFase1) btnFase1.style.display = (step === 1 || step === 2) ? 'inline-flex' : 'none';
        // Botón Fase 2 (Día 3) visible en pasos microscópicos (pasos 3 a 5)
        if (btnFase2) btnFase2.style.display = step >= 3 ? 'inline-flex' : 'none';
        // Botón informe completo visible al final
        if (btnGen) btnGen.style.display = step === totalSteps ? 'inline-flex' : 'none';
    }
    window.morceladosWizardGoToStep = morceladosWizardGoToStep;

    function morceladosWizardNextStep() {
        const totalSteps = (activeWizardSchema && activeWizardSchema.steps) ? (activeWizardSchema.steps.length + 1) : 5;
        if (polymorphicWizardState.currentStep < totalSteps) {
            morceladosWizardGoToStep(polymorphicWizardState.currentStep + 1);
        } else {
            const currentPhase = polymorphicWizardState.wizardPhase || 'completo';
            if (currentPhase === 'fase1_macro') {
                generateFase1MacroReport();
            } else if (currentPhase === 'fase2_micro') {
                generateFase2MicroReport();
            } else {
                generateMorceladoReport();
            }
        }
    }
    window.morceladosWizardNextStep = morceladosWizardNextStep;

    function morceladosWizardPrevStep() {
        if (polymorphicWizardState.currentStep > 1) {
            morceladosWizardGoToStep(polymorphicWizardState.currentStep - 1);
        }
    }
    window.morceladosWizardPrevStep = morceladosWizardPrevStep;

    function selectWizardOption(step, val, cardEl) {
        if (!activeWizardSchema) activeWizardSchema = wizardSchemas.prostate_morcelado;

        const stepConf = activeWizardSchema.steps.find(s => s.stepNumber === step);
        if (stepConf) {
            polymorphicWizardState[stepConf.stateKey] = val;
        }

        const pane = document.getElementById(`wizardStep${step}`);
        if (pane) {
            pane.querySelectorAll('.wizard-choice-card').forEach(c => c.classList.remove('selected'));
        }
        if (cardEl) cardEl.classList.add('selected');

        const currentPhase = polymorphicWizardState.wizardPhase || 'completo';
        const totalSteps = (activeWizardSchema && activeWizardSchema.steps) ? (activeWizardSchema.steps.length + 1) : 5;

        setTimeout(() => {
            // Si el patólogo está en Fase 1 (Día 0) y termina el paso 2 (macroscopía finalizada), inyectar Fase 1 directamente
            if (currentPhase === 'fase1_macro' && step === 2) {
                generateFase1MacroReport();
                return;
            }

            if (step < totalSteps) {
                morceladosWizardGoToStep(step + 1);
            } else {
                if (currentPhase === 'fase2_micro') {
                    generateFase2MicroReport();
                } else if (currentPhase === 'fase1_macro') {
                    generateFase1MacroReport();
                } else {
                    generateMorceladoReport();
                }
            }
        }, 180);
    }
    window.selectWizardOption = selectWizardOption;

    // Generador exclusivo de Fase 1: Solo Macroscopía + Casetes (Día 0)
    function generateFase1MacroReport() {
        updateLiveSamplingCalculation();
        if (!activeWizardSchema) activeWizardSchema = wizardSchemas.prostate_morcelado;

        const compiled = activeWizardSchema.compileReport(polymorphicWizardState);

        const macroEl = document.getElementById('re_macroDesc');
        const macroElFull = document.getElementById('re_macroDesc_full');
        const casetesEl = document.getElementById('re_casetes');

        if (macroEl && compiled && compiled.macro) {
            const cleanMacro = fixMedicalCapitalization(compiled.macro).replace(/\n/g, '<br>');
            macroEl.innerHTML = cleanMacro;
            macroEl.dispatchEvent(new Event('input', { bubbles: true }));
            if (macroElFull) {
                macroElFull.innerHTML = cleanMacro;
                macroElFull.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        if (casetesEl && compiled && compiled.casetes) {
            casetesEl.value = String(compiled.casetes);
        }

        // CRÍTICO: re_microDesc y re_diagnostico QUEDAN ESTRICTAMENTE LIMPIOS/INTACTOS PARA LA FASE 2
        closeMorceladosWizard();
        showToast(`📦 Fase 1 aplicada: Macroscopía y ${compiled.casetes || 1} casetes asignados para laboratorio`, "success");
    }
    window.generateFase1MacroReport = generateFase1MacroReport;

    // Generador exclusivo de Fase 2: Solo Microscopía + Diagnóstico (Día 3)
    function generateFase2MicroReport() {
        if (!activeWizardSchema) activeWizardSchema = wizardSchemas.prostate_morcelado;
        const compiled = activeWizardSchema.compileReport(polymorphicWizardState);

        const microEl = document.getElementById('re_microDesc');
        const microElFull = document.getElementById('re_microDesc_full');
        const diagEl = document.getElementById('re_diagnostico');
        const diagElFull = document.getElementById('re_diagnostico_full');

        if (microEl && compiled && compiled.micro) {
            const cleanMicro = fixMedicalCapitalization(compiled.micro).replace(/\n/g, '<br>');
            microEl.innerHTML = cleanMicro;
            microEl.dispatchEvent(new Event('input', { bubbles: true }));
            if (microElFull) microElFull.innerHTML = cleanMicro;
        }
        if (diagEl && compiled && compiled.diag) {
            let diagHtml = compiled.diag.toUpperCase().replace(/\n/g, '<br>');
            if (!diagHtml.startsWith('<b>') && !diagHtml.startsWith('<strong>')) diagHtml = `<b>${diagHtml}</b>`;
            diagEl.innerHTML = diagHtml;
            diagEl.dispatchEvent(new Event('input', { bubbles: true }));
            if (diagElFull) diagElFull.innerHTML = diagHtml;
        }

        // CRÍTICO: ¡Macroscopía y casetes del Día 0 se preservan intactos!
        closeMorceladosWizard();
        showToast(`🔬 Fase 2 aplicada: Micro y Diagnóstico CAP completados. (Macroscopía previa intacta)`, "success");
    }
    window.generateFase2MicroReport = generateFase2MicroReport;

    function generateMorceladoReport() {
        updateLiveSamplingCalculation();
        if (!activeWizardSchema) activeWizardSchema = wizardSchemas.prostate_morcelado;

        const compiled = activeWizardSchema.compileReport(polymorphicWizardState);

        const macroEl = document.getElementById('re_macroDesc');
        const macroElFull = document.getElementById('re_macroDesc_full');
        const microEl = document.getElementById('re_microDesc');
        const microElFull = document.getElementById('re_microDesc_full');
        const diagEl = document.getElementById('re_diagnostico');
        const diagElFull = document.getElementById('re_diagnostico_full');
        const casetesEl = document.getElementById('re_casetes');

        if (macroEl && compiled.macro) {
            const cleanM = fixMedicalCapitalization(compiled.macro).replace(/\n/g, '<br>');
            macroEl.innerHTML = cleanM;
            macroEl.dispatchEvent(new Event('input', { bubbles: true }));
            if (macroElFull) macroElFull.innerHTML = cleanM;
        }
        if (microEl && compiled.micro) {
            const cleanMi = fixMedicalCapitalization(compiled.micro).replace(/\n/g, '<br>');
            microEl.innerHTML = cleanMi;
            microEl.dispatchEvent(new Event('input', { bubbles: true }));
            if (microElFull) microElFull.innerHTML = cleanMi;
        }
        if (diagEl && compiled.diag) {
            let diagFormatted = compiled.diag.toUpperCase().replace(/\n/g, '<br>');
            if (!diagFormatted.startsWith('<b>') && !diagFormatted.startsWith('<strong>')) diagFormatted = `<b>${diagFormatted}</b>`;
            diagEl.innerHTML = diagFormatted;
            diagEl.dispatchEvent(new Event('input', { bubbles: true }));
            if (diagElFull) diagElFull.innerHTML = diagFormatted;
        }
        if (casetesEl && compiled.casetes) {
            casetesEl.value = String(compiled.casetes);
        }

        closeMorceladosWizard();
        showToast(`Plantilla '${activeWizardSchema.title}' completada e inyectada con éxito`, "success");
    }
    window.generateMorceladoReport = generateMorceladoReport;

    // Listener global de atajos de teclado numérico (1..5) para el Wizard
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('wizardModalOverlay');
        if (!overlay || overlay.style.display === 'none') return;

        const tag = (document.activeElement?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
            return;
        }

        if (e.key === 'Escape') {
            closeMorceladosWizard();
            return;
        }

        const totalSteps = (activeWizardSchema && activeWizardSchema.steps) ? (activeWizardSchema.steps.length + 1) : 5;
        if (polymorphicWizardState.currentStep >= 2 && polymorphicWizardState.currentStep <= totalSteps) {
            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                e.preventDefault();
                const step = polymorphicWizardState.currentStep;
                const pane = document.getElementById(`wizardStep${step}`);
                if (pane) {
                    const card = pane.querySelector(`.wizard-choice-card[data-key="${e.key}"]`);
                    if (card) {
                        const val = card.getAttribute('data-val');
                        selectWizardOption(step, val, card);
                    }
                }
            }
        }
    });

    // =========================================================================
    // MOTOR DE PROTOCOLOS ONCOLÓGICOS DEL CAP (COLLEGE OF AMERICAN PATHOLOGISTS)
    // =========================================================================

    window.cargarProtocoloCapCompleto = function(templateIdOrTitle, fallbackTitle, scope = 'all') {
        const tplsSources = [
            (templatesDatabase && templatesDatabase.length > 0) ? templatesDatabase : [],
            (typeof window !== 'undefined' && window.defaultTemplates) ? window.defaultTemplates : [],
            (typeof defaultTemplates !== 'undefined' && Array.isArray(defaultTemplates)) ? defaultTemplates : []
        ];

        let tpl = null;
        const idStr = String(templateIdOrTitle || '').trim();
        const titleSearch = String(fallbackTitle || templateIdOrTitle || '').toUpperCase().trim();

        // 1. Buscar por ID en todas las fuentes
        for (const list of tplsSources) {
            tpl = list.find(t => String(t.id) === idStr);
            if (tpl) break;
        }

        // 2. Buscar por título exacto o parcial si no se halló por ID
        if (!tpl && titleSearch) {
            for (const list of tplsSources) {
                tpl = list.find(t => (t.titulo || '').toUpperCase().trim() === titleSearch);
                if (tpl) break;
            }
        }
        if (!tpl && titleSearch) {
            for (const list of tplsSources) {
                tpl = list.find(t => (t.titulo || '').toUpperCase().includes(titleSearch));
                if (tpl) break;
            }
        }

        if (!tpl) {
            notifyUser('Protocolo CAP no encontrado en la base de datos.', 'error');
            return false;
        }

        const shouldInjectMacro = (scope === 'all' || scope === 'macro');
        const shouldInjectMicro = (scope === 'all' || scope === 'micro_diag' || scope === 'micro');
        const shouldInjectDiag = (scope === 'all' || scope === 'micro_diag' || scope === 'diag');

        // 1. Inyectar Macroscopía (Fase 1)
        if (shouldInjectMacro && tpl.macro) {
            const el = document.getElementById('re_macroDesc');
            const elFull = document.getElementById('re_macroDesc_full');
            const clean = fixMedicalCapitalization(tpl.macro);
            if (el) {
                el.innerHTML = clean.replace(/\n/g, '<br>');
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (elFull) {
                elFull.innerHTML = clean.replace(/\n/g, '<br>');
                elFull.dispatchEvent(new Event('input', { bubbles: true }));
            }
            // Detección de casetes
            const casetesEl = document.getElementById('re_casetes');
            if (casetesEl) {
                const matchCasetes = clean.match(/(\d+)\s*(?:casete|cassette|bloque)/i);
                if (matchCasetes && matchCasetes[1]) {
                    casetesEl.value = String(parseInt(matchCasetes[1], 10));
                }
            }
        }

        // 2. Inyectar Microscopía (Fase 2)
        if (shouldInjectMicro && tpl.micro) {
            const el = document.getElementById('re_microDesc');
            const elFull = document.getElementById('re_microDesc_full');
            const clean = fixMedicalCapitalization(tpl.micro);
            if (el) {
                el.innerHTML = clean.replace(/\n/g, '<br>');
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (elFull) {
                elFull.innerHTML = clean.replace(/\n/g, '<br>');
                elFull.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // 3. Inyectar Diagnóstico + Resumen Sinóptico CAP (Fase 2)
        if (shouldInjectDiag && tpl.diag) {
            const el = document.getElementById('re_diagnostico');
            const elFull = document.getElementById('re_diagnostico_full');
            let diagFormatted = tpl.diag.toUpperCase().replace(/\n/g, '<br>');
            if (!diagFormatted.startsWith('<b>') && !diagFormatted.startsWith('<strong>')) {
                diagFormatted = `<b>${diagFormatted}</b>`;
            }
            if (el) {
                el.innerHTML = diagFormatted;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (elFull) {
                elFull.innerHTML = diagFormatted;
                elFull.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // Sincronizar selectores visuales si existen
        const catsDb = (categoriesDatabase && categoriesDatabase.length > 0) ? categoriesDatabase : (window.defaultCategories || (typeof defaultCategories !== 'undefined' ? defaultCategories : []));
        const catObj = catsDb.find(c => (c.categoria || '').toUpperCase().includes('PROTOCOLO') || ['1', '10', '11', '100', '101'].includes(String(c.id)));
        if (catObj) {
            ['re_catMacro', 're_catMicro', 're_catDiag'].forEach(id => {
                const select = document.getElementById(id);
                if (select) select.value = catObj.id;
            });
            actualizarPlantillasSegunEspecialidad('macro', catObj.id);
            actualizarPlantillasSegunEspecialidad('micro', catObj.id);
            actualizarPlantillasSegunEspecialidad('diag', catObj.id);
            ['re_planMacro', 're_planMicro', 're_planDiag'].forEach(id => {
                const select = document.getElementById(id);
                if (select) select.value = tpl.id;
            });
        }

        const scopeLabels = {
            'macro': 'Fase 1: Solo Macroscopía',
            'micro_diag': 'Fase 2: Micro + Diagnóstico Sinóptico',
            'all': 'Protocolo Completo'
        };
        notifyUser(`⚡ Protocolo CAP cargado: ${tpl.titulo} [${scopeLabels[scope] || 'Completo'}]`, 'success');

        // Cerrar modal
        const modal = document.getElementById('capProtocolsModalOverlay');
        if (modal) modal.style.display = 'none';

        // Asegurar foco en pestaña de descripción
        switchEditorTab('tab_descrip');
        return true;
    };

    const CAP_PROTOCOLS_DEF = [
        { id: 304, titulo: "CAP - PRÓSTATA: RESECCIÓN TRANSURETRAL Y ENUCLEACIÓN (RTUP)", organo: "Urología", badge: "RTUP / Gleason / ISUP / AJCC 8va (v4.2.0.0)", icon: "fa-circle-dot", color: "#06b6d4", schemaKey: "prostate_turp" },
        { id: 317, titulo: "CAP - HÍGADO: CARCINOMA HEPATOCELULAR (RESECCIÓN HEPÁTICA)", organo: "Gastrointestinal", badge: "Hepatectomía / pTNM AJCC 8va / OMS (v4.3.0.0)", icon: "fa-disease", color: "#10b981", schemaKey: "liver_hcc" },
        { id: 307, titulo: "CAP - MAMA: CARCINOMA DUCTAL / LOBULILLAR INVASOR (MASTECTOMÍA / TUMORECTOMÍA)", organo: "Mama", badge: "Nottingham / ER, PR, HER2, Ki67", icon: "fa-ribbon", color: "#ec4899", schemaKey: "breast_invasive_carcinoma" },
        { id: 318, titulo: "CAP - MAMA: TUMOR FILODES (BIOPSIA / RESECCIÓN)", organo: "Mama", badge: "Filodes / Benigno, Borderline, Maligno", icon: "fa-ribbon", color: "#ec4899", schemaKey: "breast_phyllodes" },
        { id: 319, titulo: "CAP - APÉNDICE CECAL: NEOPLASIAS Y LAMN (APENDICECTOMÍA)", organo: "Gastrointestinal", badge: "Apendicectomía / LAMN / Peritoneo", icon: "fa-disease", color: "#3b82f6", schemaKey: "appendix" },
        { id: 320, titulo: "CAP - ESÓFAGO: CARCINOMA EPIDERMOIDE / ADENOCARCINOMA", organo: "Gastrointestinal", badge: "Esofagectomía / pTNM AJCC 8va", icon: "fa-disease", color: "#3b82f6", schemaKey: "esophagus" },
        { id: 301, titulo: "CAP - COLON Y RECTO: ADENOCARCINOMA INVASOR (COLECTOMÍA)", organo: "Gastrointestinal", badge: "Colectomía / pTNM AJCC 8va", icon: "fa-disease", color: "#3b82f6" },
        { id: 302, titulo: "CAP - ESTÓMAGO: ADENOCARCINOMA GÁSTRICO (GASTRECTOMÍA)", organo: "Gastrointestinal", badge: "Gastrectomía / Lauren / OMS", icon: "fa-disease", color: "#3b82f6" },
        { id: 303, titulo: "CAP - GIST: TUMOR DEL ESTROMA GASTROINTESTINAL (RESECCIÓN)", organo: "Gastrointestinal", badge: "GIST / Riesgo Miettinen", icon: "fa-shield-virus", color: "#3b82f6" },
        { id: 305, titulo: "CAP - RIÑÓN: CARCINOMA DE CÉLULAS RENALES (NEFRECTOMÍA)", organo: "Urología", badge: "Nefrectomía / Grado ISUP/WHO", icon: "fa-disease", color: "#06b6d4" },
        { id: 306, titulo: "CAP - VEJIGA: CARCINOMA UROTELIAL INVASOR (CISTECTOMÍA / RTU)", organo: "Urología", badge: "Cistectomía / OMS Alto Grado", icon: "fa-disease", color: "#06b6d4" },
        { id: 308, titulo: "CAP - MAMA: CARCINOMA DUCTAL IN SITU (CDIS / DCIS)", organo: "Mama", badge: "CDIS / Necrosis Comedo / Márgenes", icon: "fa-ribbon", color: "#ec4899" },
        { id: 309, titulo: "CAP - CÉRVIX: CARCINOMA EPIDERMOIDE / ADENOCARCINOMA (HISTERECTOMÍA / CONO)", organo: "Ginecología", badge: "FIGO 2018/2023 / Invasión Estromal", icon: "fa-venus", color: "#a855f7" },
        { id: 310, titulo: "CAP - ENDOMETRIO: ADENOCARCINOMA ENDOMETRIOIDE / SEROSO (HISTERECTOMÍA)", organo: "Ginecología", badge: "Histerectomía / Invasión Miometrial", icon: "fa-venus", color: "#a855f7" },
        { id: 311, titulo: "CAP - OVARIO: CARCINOMA SEROSO DE ALTO GRADO / NEOPLASIAS EPITELIALES", organo: "Ginecología", badge: "SEE-FIM / Estadificación FIGO", icon: "fa-venus", color: "#a855f7" },
        { id: 312, titulo: "CAP - TIROIDES: CARCINOMA PAPILAR / FOLICULAR (TIROIDECTOMÍA)", organo: "Endocrino", badge: "Tiroidectomía / Extensión Extratiroidea", icon: "fa-shield-heart", color: "#eab308" },
        { id: 313, titulo: "CAP - PULMÓN: CARCINOMA NO CÉLULAS PEQUEÑAS (LOBECTOMÍA / RESECCIÓN)", organo: "Tórax", badge: "Lobectomía / Pleura Visceral / pTNM", icon: "fa-lungs", color: "#10b981" },
        { id: 314, titulo: "CAP - PIEL: MELANOMA CUTÁNEO INVASOR (ESCISIÓN AMPLIA)", organo: "Piel", badge: "Breslow / Ulceración / Satelitosis", icon: "fa-allergies", color: "#f97316" },
        { id: 315, titulo: "CAP - PIEL: CARCINOMA EPIDERMOIDE CUTÁNEO DE ALTO RIESGO", organo: "Piel", badge: "BWH Staging / Espesor / PNI", icon: "fa-allergies", color: "#f97316" },
        { id: 316, titulo: "CAP - CABEZA Y CUELLO: CARCINOMA ESCAMOSO DE CAVIDAD ORAL / LARINGE", organo: "Cabeza y Cuello", badge: "DOI (Profundidad) / ENE Ganglionar", icon: "fa-head-side-cough", color: "#ef4444" }
    ];

    function ensureCapModalDom() {
        if (document.getElementById('capProtocolsModalOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'capProtocolsModalOverlay';
        overlay.className = 'floating-modal-overlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 15, 29, 0.85);
            backdrop-filter: blur(6px);
            z-index: 10050;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        overlay.innerHTML = `
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; width: 100%; max-width: 1050px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); overflow: hidden;">
                <!-- Header -->
                <div style="padding: 16px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #ef4444, #b91c1c); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">
                            <i class="fa-solid fa-ribbon"></i>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #f8fafc;">Protocolos Oncológicos Oficiales CAP (College of American Pathologists)</h2>
                            <p style="margin: 2px 0 0; font-size: 0.8rem; color: #94a3b8;">16 Plantillas Sinópticas Estándar OMS 5.ª Edición & AJCC 8.ª/9.ª Edición (Llenado simultáneo de 3 campos en 1 Clic)</p>
                        </div>
                    </div>
                    <button type="button" onclick="window.closeCapQuickModal()" style="background: #334155; border: none; color: #f8fafc; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Buscador y Filtro -->
                <div style="padding: 12px 20px; background: #182234; border-bottom: 1px solid #27354a; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <div style="position: relative; flex: 1; min-width: 260px;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.85rem;"></i>
                        <input type="text" id="capSearchInput" placeholder="Buscar protocolo por órgano o patología (ej: colon, mama, melanoma, próstata)..." style="width: 100%; padding: 8px 12px 8px 34px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f8fafc; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div id="capFilterTabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <button type="button" class="cap-tab-pill active" data-organ="TODOS" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #38bdf8; background: #0284c7; color: white; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Todos (16)</button>
                        <button type="button" class="cap-tab-pill" data-organ="Gastrointestinal" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Digestivo</button>
                        <button type="button" class="cap-tab-pill" data-organ="Urología" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Urología</button>
                        <button type="button" class="cap-tab-pill" data-organ="Mama" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Mama</button>
                        <button type="button" class="cap-tab-pill" data-organ="Ginecología" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Ginecología</button>
                        <button type="button" class="cap-tab-pill" data-organ="Piel" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; cursor: pointer;">Piel</button>
                    </div>
                </div>

                <!-- Grid de Tarjetas -->
                <div id="capCardsContainer" style="padding: 20px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 14px; flex: 1;">
                </div>

                <!-- Footer -->
                <div style="padding: 12px 20px; background: #1e293b; border-top: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.78rem; color: #94a3b8;"><i class="fa-solid fa-circle-info" style="color: #38bdf8;"></i> Al seleccionar una plantilla se rellenarán automáticamente: Macroscopía, Microscopía y Diagnóstico Histopatológico con checklist sinóptico pTNM.</span>
                    <button type="button" onclick="window.closeCapQuickModal()" style="padding: 6px 16px; background: #475569; border: none; border-radius: 6px; color: white; font-weight: 600; font-size: 0.8rem; cursor: pointer;">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.onclick = (e) => {
            if (e.target === overlay) window.closeCapQuickModal();
        };

        const searchInput = overlay.querySelector('#capSearchInput');
        if (searchInput) {
            searchInput.oninput = () => renderCapProtocolsGrid();
        }

        const pills = overlay.querySelectorAll('.cap-tab-pill');
        pills.forEach(pill => {
            pill.onclick = () => {
                pills.forEach(p => {
                    p.classList.remove('active');
                    p.style.background = '#1e293b';
                    p.style.borderColor = '#334155';
                    p.style.color = '#cbd5e1';
                });
                pill.classList.add('active');
                pill.style.background = '#0284c7';
                pill.style.borderColor = '#38bdf8';
                pill.style.color = 'white';
                renderCapProtocolsGrid();
            };
        });
    }

    function renderCapProtocolsGrid() {
        const overlay = document.getElementById('capProtocolsModalOverlay');
        if (!overlay) return;
        const container = overlay.querySelector('#capCardsContainer');
        if (!container) return;

        const query = (overlay.querySelector('#capSearchInput')?.value || '').trim().toLowerCase();
        const activePill = overlay.querySelector('.cap-tab-pill.active')?.getAttribute('data-organ') || 'TODOS';

        let filtered = CAP_PROTOCOLS_DEF.filter(p => {
            const matchesQuery = !query || p.titulo.toLowerCase().includes(query) || p.organo.toLowerCase().includes(query) || p.badge.toLowerCase().includes(query);
            const matchesOrgan = activePill === 'TODOS' || p.organo.toUpperCase().includes(activePill.toUpperCase());
            return matchesQuery && matchesOrgan;
        });

        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #64748b; font-style: italic;">No se encontraron protocolos con los criterios de búsqueda especificados.</div>`;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 10px;
                padding: 14px 16px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 4px solid ${item.color};
            `;

            card.onmouseenter = () => {
                card.style.transform = 'translateY(-2px)';
                card.style.borderColor = item.color;
                card.style.boxShadow = `0 6px 16px rgba(0,0,0,0.4)`;
            };
            card.onmouseleave = () => {
                card.style.transform = 'none';
                card.style.borderColor = '#334155';
                card.style.borderLeftColor = item.color;
                card.style.boxShadow = 'none';
            };

            const hasInteractiveAssistant = !!(item.schemaKey && synopticSchemas[item.schemaKey]);

            card.innerHTML = `
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: ${item.color}; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; border: 1px solid ${item.color}40;">
                            <i class="fa-solid ${item.icon}"></i> ${item.organo}
                        </span>
                        <span style="font-size: 0.7rem; color: #64748b; font-family: monospace;">${hasInteractiveAssistant ? '⚡ ASISTENTE DISPONIBLE' : 'ID: ' + item.id}</span>
                    </div>
                    <h3 style="margin: 0; font-size: 0.88rem; font-weight: 600; color: #f8fafc; line-height: 1.3;">${item.titulo}</h3>
                    <div style="margin-top: 6px; font-size: 0.74rem; color: #94a3b8;">${item.badge}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
                    ${hasInteractiveAssistant ? `
                    <button type="button" class="btn-cap-interactive-start" style="width: 100%; padding: 7px 10px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border: 1px solid #38bdf8; border-radius: 6px; color: white; font-weight: 700; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);">
                        <i class="fa-solid fa-brain"></i> Abrir Asistente Interactivo (Paso a Paso)
                    </button>
                    ` : ''}
                    <button type="button" class="btn-cap-template-load" style="width: 100%; padding: 6px 10px; background: rgba(255,255,255,0.06); border: 1px solid #334155; border-radius: 6px; color: #cbd5e1; font-weight: 600; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="fa-solid fa-file-invoice"></i> Cargar Plantilla de Texto Rápido
                    </button>
                </div>
            `;

            const btnInteractive = card.querySelector('.btn-cap-interactive-start');
            if (btnInteractive) {
                btnInteractive.onclick = (e) => {
                    e.stopPropagation();
                    window.abrirAsistenteSinopticoDirecto(item.schemaKey);
                };
            }

            const btnTemplate = card.querySelector('.btn-cap-template-load');
            if (btnTemplate) {
                btnTemplate.onclick = (e) => {
                    e.stopPropagation();
                    window.cargarProtocoloCapCompleto(item.id, item.titulo);
                };
            }

            card.onclick = () => {
                if (hasInteractiveAssistant) {
                    window.abrirAsistenteSinopticoDirecto(item.schemaKey);
                } else {
                    window.cargarProtocoloCapCompleto(item.id, item.titulo);
                }
            };

            container.appendChild(card);
        });
    }

    window.openCapQuickModal = function() {
        ensureCapModalDom();
        const modal = document.getElementById('capProtocolsModalOverlay');
        if (modal) {
            modal.style.display = 'flex';
            renderCapProtocolsGrid();
        }
    };

    window.closeCapQuickModal = function() {
        const modal = document.getElementById('capProtocolsModalOverlay');
        if (modal) modal.style.display = 'none';
    };

    window.abrirProtocolosCapDirecto = function(e) {
        if (e) e.preventDefault();
        window.openCapQuickModal();
    };

// ==========================================================================
// MÓDULO DE CÁMARA / MICROSCOPIO EN VIVO E INYECCIÓN DIRECTA (DUAL ARCHITECTURE)
// Modo Primario: Microscope HTTP Bridge (Motic 3.0 / DirectShow en localhost:8002 o localhost:8085)
// Modo Secundario: WebRTC Fallback (navigator.mediaDevices para UVC / Webcams)
// ==========================================================================
let microscopeMediaStream = null;
let activeMicroscopeTargetKey = 'img01'; // 'img01' o 'img02'
let isFeedFlippedH = false;
let currentMicroscopeSourceType = 'websocket'; // 'websocket' | 'bridge' | 'webrtc'
let activeMicroscopeWs = null;
let activeBridgeBaseUrl = null;
let activeBridgeFeedPath = '/video_feed';
let wsFpsCounter = 0;
let wsFpsTimer = null;
let lastWsFrameBitmap = null;
let lastWsFrameBase64 = null;

// Lista ordenada de endpoints WebSocket con soporte de fallback progresivo
const MICROSCOPE_WS_ENDPOINTS = [
    { url: 'ws://127.0.0.1:8085/ws/live', name: 'Microscopio Motic 3.0 (WS :8085)' },
    { url: 'ws://localhost:8085/ws/live', name: 'Microscopio Motic 3.0 (WS localhost:8085)' },
    { url: 'ws://127.0.0.1:8002/ws/live', name: 'Servidor HUD (:8002/ws/live)' },
    { url: 'ws://127.0.0.1:8002/ws/telemetry', name: 'Servidor Telemetría (:8002/ws/telemetry)' }
];

// Lista de endpoints HTTP Bridge de respaldo
const MICROSCOPE_BRIDGE_ENDPOINTS = [
    { url: 'http://127.0.0.1:8085', streamPath: '/stream', capturePath: '/api/camera/capture', name: 'Microscopio Motic Bridge (:8085)' },
    { url: 'http://localhost:8085', streamPath: '/stream', capturePath: '/api/camera/capture', name: 'Microscopio Motic Bridge (:8085)' },
    { url: 'http://127.0.0.1:8002', streamPath: '/video_feed', capturePath: '/api/capture_manual', name: 'Microscopio Motic 3.0 (Servidor HUD:8002)' },
    { url: 'http://localhost:8002', streamPath: '/video_feed', capturePath: '/api/capture_manual', name: 'Microscopio Motic 3.0 (Servidor HUD:8002)' }
];

/**
 * Cambia la ranura activa de destino (img01 o img02) dentro del modal de microscopio
 */
window.setMicroscopeSlot = function(slotKey) {
    activeMicroscopeTargetKey = slotKey === 'img02' ? 'img02' : 'img01';
    const btn1 = document.getElementById('btnSlotImg01');
    const btn2 = document.getElementById('btnSlotImg02');
    if (btn1 && btn2) {
        btn1.classList.toggle('active', activeMicroscopeTargetKey === 'img01');
        btn2.classList.toggle('active', activeMicroscopeTargetKey === 'img02');
    }
    const shutterText = document.getElementById('microscopeShutterBtnText');
    if (shutterText) {
        shutterText.textContent = activeMicroscopeTargetKey === 'img01' ? '📸 CAPTURAR FOTO 01' : '📸 CAPTURAR FOTO 02';
    }
};

window.updateMicroscopeSlotStatuses = function() {
    const prev01 = document.getElementById('re_img01Preview');
    const prev02 = document.getElementById('re_img02Preview');
    const has01 = !!(prev01 && isValidImageSrc(prev01.src));
    const has02 = !!(prev02 && isValidImageSrc(prev02.src));

    const btn1 = document.getElementById('btnSlotImg01');
    const btn2 = document.getElementById('btnSlotImg02');
    const st1 = document.getElementById('slotStatusImg01');
    const st2 = document.getElementById('slotStatusImg02');

    if (btn1 && st1) {
        btn1.classList.toggle('has-photo', has01);
        st1.textContent = has01 ? '✓ Lista' : 'Vacío';
    }
    if (btn2 && st2) {
        btn2.classList.toggle('has-photo', has02);
        st2.textContent = has02 ? '✓ Lista' : 'Vacío';
    }
};

/**
 * Abre el modal de microscopía y conecta a la fuente óptima
 */
window.openMicroscopeCameraModal = async function(targetKey = 'img01') {
    activeMicroscopeTargetKey = targetKey;
    const modalEl = document.getElementById('microscopeCameraModalOverlay');
    if (!modalEl) return;

    modalEl.classList.add('active');
    modalEl.style.setProperty('display', 'flex', 'important');
    modalEl.style.setProperty('z-index', '2000200', 'important');

    if (typeof window.updateMicroscopeSlotStatuses === 'function') {
        window.updateMicroscopeSlotStatuses();
    }
    if (typeof window.setMicroscopeSlot === 'function') {
        window.setMicroscopeSlot(targetKey);
    }

    await window.refreshMicroscopeSources();
    bindMicroscopeKeyboardShortcuts();
};

/**
 * Cierra el modal y detiene todos los flujos activos
 */
window.closeMicroscopeCameraModal = function() {
    stopMicroscopeStreams();
    unbindMicroscopeKeyboardShortcuts();

    const modalEl = document.getElementById('microscopeCameraModalOverlay');
    if (modalEl) {
        modalEl.classList.remove('active');
        modalEl.style.setProperty('display', 'none', 'important');
    }
};

/**
 * Escanea WebSocket Bridge, Servidor HTTP Motic y Cámaras WebRTC
 */
window.refreshMicroscopeSources = async function() {
    const selectEl = document.getElementById('microscopeDeviceSelect');
    const badgeEl = document.getElementById('microscopeConnectionBadge');
    const helpTipEl = document.getElementById('microscopeBridgeHelpTip');

    if (badgeEl) {
        badgeEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Detectando fuentes...';
    }

    if (selectEl) selectEl.innerHTML = '';

    // 1. Probar conexión WebSocket activa
    const detectedWs = await probeMicroscopeWebSocket();

    // 2. Probar HTTP Bridge si no se encuentra WS
    let detectedBridge = null;
    if (!detectedWs) {
        detectedBridge = await probeMicroscopeBridge();
    }

    // 3. Sondear Cámaras WebRTC / UVC
    const videoDevices = await enumerateWebcamDevices();

    if (selectEl) {
        // Opción WebSocket (Prioridad Máxima - Compatible con HTTPS y file://)
        if (detectedWs) {
            const optWs = document.createElement('option');
            optWs.value = `ws:${detectedWs.url}`;
            optWs.textContent = `🔬 ${detectedWs.name}`;
            optWs.selected = true;
            selectEl.appendChild(optWs);
        }

        // Opción HTTP Bridge
        if (detectedBridge) {
            const optBridge = document.createElement('option');
            optBridge.value = `bridge:${detectedBridge.url}|${detectedBridge.streamPath}|${detectedBridge.capturePath}`;
            optBridge.textContent = `🔬 ${detectedBridge.name} (MJPEG)`;
            if (!detectedWs) optBridge.selected = true;
            selectEl.appendChild(optBridge);
        }

        // Opciones WebRTC
        videoDevices.forEach((device, idx) => {
            const opt = document.createElement('option');
            opt.value = `webrtc:${device.deviceId}`;
            opt.textContent = `📹 ${device.label || `Cámara / Ocular USB ${idx + 1}`}`;
            
            if (!detectedWs && !detectedBridge && idx === 0) {
                opt.selected = true;
            }
            selectEl.appendChild(opt);
        });

        if (selectEl.options.length === 0) {
            const optEmpty = document.createElement('option');
            optEmpty.value = 'none';
            optEmpty.textContent = 'No se detectaron cámaras ni servidores de streaming';
            selectEl.appendChild(optEmpty);
        }
    }

    // Actualizar Banner de Ayuda
    if (helpTipEl) {
        helpTipEl.style.display = (detectedWs || detectedBridge) ? 'none' : 'flex';
    }

    // Iniciar el stream seleccionado
    if (selectEl && selectEl.value && selectEl.value !== 'none') {
        await switchMicroscopeSource(selectEl.value);
    } else {
        notifyUser('No se detectó microscopio ni cámara web activa.', 'warning');
    }
};

/**
 * Cambia la resolución/velocidad del sensor físico Moticam en caliente
 */
window.changeMicroscopeSensorRes = async function(val) {
    try {
        const host = window.location.hostname || '127.0.0.1';
        const res = await fetch(`http://${host}:8085/api/camera/res/${val}`, { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
            const labels = {
                '2': '⚡ Modo Enfoque Rápido (30 FPS en Tiempo Real)',
                '1': '🔬 Modo Alta Definición (1024x768)',
                '0': '📷 Modo Máxima Resolución (2048x1536)'
            };
            notifyUser(`Sensor ajustado a: ${labels[val] || val}`, 'info');
        }
    } catch (e) {
        console.warn('[Microscope Res Switch Error]', e);
    }
};

/**
 * Sondeo rápido de endpoints WebSocket con timeout
 */
async function probeMicroscopeWebSocket() {
    for (const ep of MICROSCOPE_WS_ENDPOINTS) {
        const isAlive = await new Promise((resolve) => {
            let socket = null;
            let timer = null;
            try {
                socket = new WebSocket(ep.url);
                socket.binaryType = 'blob';

                timer = setTimeout(() => {
                    try { socket.close(); } catch(e){}
                    resolve(false);
                }, 450);

                socket.onopen = () => {
                    clearTimeout(timer);
                    try { socket.close(); } catch(e){}
                    resolve(true);
                };

                socket.onerror = () => {
                    clearTimeout(timer);
                    resolve(false);
                };
            } catch (err) {
                if (timer) clearTimeout(timer);
                resolve(false);
            }
        });

        if (isAlive) {
            return ep;
        }
    }
    return null;
}

/**
 * Prueba la disponibilidad del servidor Bridge HTTP Motic local
 */
async function probeMicroscopeBridge() {
    for (const endpoint of MICROSCOPE_BRIDGE_ENDPOINTS) {
        try {
            const testUrl = `${endpoint.url}${endpoint.streamPath}`;
            const res = await fetch(testUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(400),
                headers: { 'Range': 'bytes=0-100' }
            });
            if (res.status === 200 || res.status === 206 || res.type === 'opaque' || res.ok) {
                return endpoint;
            }
        } catch (e) {
            try {
                const resStatus = await fetch(`${endpoint.url}/api/camera/status`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(400)
                });
                if (resStatus.ok) return endpoint;
            } catch (err2) {}
        }
    }
    return null;
}

/**
 * Enumera dispositivos WebRTC
 */
async function enumerateWebcamDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [];
    }
    try {
        let devices = await navigator.mediaDevices.enumerateDevices();
        let videoDevices = devices.filter(d => d.kind === 'videoinput');

        const hasLabels = videoDevices.some(d => d.label && d.label.length > 0);
        if (!hasLabels && videoDevices.length > 0) {
            try {
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                tempStream.getTracks().forEach(t => t.stop());
                devices = await navigator.mediaDevices.enumerateDevices();
                videoDevices = devices.filter(d => d.kind === 'videoinput');
            } catch (permErr) {}
        }
        return videoDevices;
    } catch (err) {
        console.warn('[Microscopio Enum Error]', err);
        return [];
    }
}

/**
 * Conmuta entre fuentes WebSocket, Bridge MJPEG y WebRTC (Webcam)
 */
async function switchMicroscopeSource(sourceValue) {
    stopMicroscopeStreams();

    const canvasEl = document.getElementById('microscopeWsCanvas');
    const videoEl = document.getElementById('microscopeVideoFeed');
    const mjpegEl = document.getElementById('microscopeMjpegFeed');
    const badgeEl = document.getElementById('microscopeConnectionBadge');
    const resBadge = document.getElementById('microscopeResolutionBadge');

    if (sourceValue.startsWith('ws:')) {
        currentMicroscopeSourceType = 'websocket';
        const wsUrl = sourceValue.replace('ws:', '');

        if (videoEl) videoEl.style.display = 'none';
        if (mjpegEl) { mjpegEl.style.display = 'none'; mjpegEl.src = ''; }
        if (canvasEl) {
            canvasEl.style.display = 'block';
            canvasEl.style.transform = isFeedFlippedH ? 'scaleX(-1)' : 'none';
        }

        if (badgeEl) {
            badgeEl.style.background = 'rgba(16, 185, 129, 0.15)';
            badgeEl.style.color = '#10b981';
            badgeEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            badgeEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Microscopio Motic 3.0 Conectado (WS Live)';
        }
        if (resBadge) resBadge.textContent = 'En Vivo 30 FPS';

        startWebSocketStream(wsUrl);

    } else if (sourceValue.startsWith('bridge:')) {
        currentMicroscopeSourceType = 'bridge';
        const parts = sourceValue.replace('bridge:', '').split('|');
        activeBridgeBaseUrl = parts[0];
        activeBridgeFeedPath = parts[1] || '/video_feed';

        if (canvasEl) canvasEl.style.display = 'none';
        if (videoEl) videoEl.style.display = 'none';
        if (mjpegEl) {
            mjpegEl.style.display = 'block';
            mjpegEl.style.transform = isFeedFlippedH ? 'scaleX(-1)' : 'none';
            mjpegEl.src = `${activeBridgeBaseUrl}${activeBridgeFeedPath}?t=${Date.now()}`;
        }

        if (badgeEl) {
            badgeEl.style.background = 'rgba(16, 185, 129, 0.15)';
            badgeEl.style.color = '#10b981';
            badgeEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            badgeEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Microscopio Motic 3.0 (Bridge MJPEG)';
        }
        if (resBadge) resBadge.textContent = '2048x1536 Nativo (3.1 MP)';
        notifyUser('Conectado a Microscopio Motic 3.0 en tiempo real.', 'success');

    } else if (sourceValue.startsWith('webrtc:')) {
        currentMicroscopeSourceType = 'webrtc';
        const deviceId = sourceValue.replace('webrtc:', '');

        if (canvasEl) canvasEl.style.display = 'none';
        if (mjpegEl) { mjpegEl.style.display = 'none'; mjpegEl.src = ''; }
        if (videoEl) {
            videoEl.style.display = 'block';
            videoEl.classList.toggle('flipped-h', isFeedFlippedH);
        }

        if (badgeEl) {
            badgeEl.style.background = 'rgba(56, 189, 248, 0.15)';
            badgeEl.style.color = '#38bdf8';
            badgeEl.style.border = '1px solid rgba(56, 189, 248, 0.3)';
            badgeEl.innerHTML = '<i class="fa-solid fa-video"></i> Cámara Web / UVC Local';
        }

        await startWebcamStream(deviceId);
    }
}

/**
 * Receptor de flujo continuo vía WebSocket y renderizado directo sobre <canvas> con Cero Latencia (Zero-Lag)
 */
function startWebSocketStream(wsUrl) {
    const canvasEl = document.getElementById('microscopeWsCanvas');
    const resBadge = document.getElementById('microscopeResolutionBadge');
    const badgeEl = document.getElementById('microscopeConnectionBadge');

    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d', { alpha: false, desynchronized: true }) || canvasEl.getContext('2d');

    let pendingBlob = null;
    let isDecoding = false;

    function processBlob(blob) {
        if (isDecoding) {
            pendingBlob = blob; // Guarda siempre el más nuevo y descarta cuadros atrasados
            return;
        }
        isDecoding = true;

        createImageBitmap(blob).then((bitmap) => {
            lastWsFrameBitmap = bitmap;
            const w = bitmap.width;
            const h = bitmap.height;

            if (canvasEl.width !== w || canvasEl.height !== h) {
                canvasEl.width = w;
                canvasEl.height = h;
                if (resBadge) resBadge.textContent = `${w}x${h} (HD Natural)`;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(bitmap, 0, 0, w, h);
            bitmap.close();
            isDecoding = false;

            if (pendingBlob) {
                const next = pendingBlob;
                pendingBlob = null;
                processBlob(next);
            }
        }).catch(() => {
            isDecoding = false;
            if (pendingBlob) {
                const next = pendingBlob;
                pendingBlob = null;
                processBlob(next);
            }
        });
    }

    try {
        activeMicroscopeWs = new WebSocket(wsUrl);
        activeMicroscopeWs.binaryType = 'blob';

        activeMicroscopeWs.onopen = () => {
            console.log('[WebSocket Live Zero-Lag] Conectado a:', wsUrl);
            notifyUser('Microscopio en vivo conectado en tiempo real (Zero-Lag).', 'success');
        };

        activeMicroscopeWs.onmessage = (event) => {
            if (event.data instanceof Blob) {
                processBlob(event.data);
            } else if (typeof event.data === 'string') {
                try {
                    let base64Str = event.data;
                    if (base64Str.startsWith('{')) {
                        const parsed = JSON.parse(base64Str);
                        base64Str = parsed.data || parsed.image || parsed.frame || '';
                    }
                    if (!base64Str.startsWith('data:image')) {
                        base64Str = `data:image/jpeg;base64,${base64Str}`;
                    }
                    lastWsFrameBase64 = base64Str;
                } catch(e){}
            }
        };

        activeMicroscopeWs.onerror = (err) => {
            console.warn('[WS Live Error]', err);
            if (badgeEl) {
                badgeEl.style.background = 'rgba(239, 68, 68, 0.15)';
                badgeEl.style.color = '#ef4444';
                badgeEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                badgeEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error de Conexión WS';
            }
        };

        activeMicroscopeWs.onclose = () => {
            console.log('[WebSocket Live] Desconectado.');
        };

    } catch (e) {
        console.error('[WS Init Exception]', e);
    }
}

/**
 * Inicia el flujo de vídeo WebRTC
 */
async function startWebcamStream(deviceId = null) {
    const videoEl = document.getElementById('microscopeVideoFeed');
    const resBadge = document.getElementById('microscopeResolutionBadge');
    if (!videoEl) return;

    const constraints = {
        audio: false,
        video: {
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 60, min: 30 }
        }
    };

    if (deviceId && deviceId !== '') {
        constraints.video.deviceId = { exact: deviceId };
    }

    try {
        microscopeMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoEl.srcObject = microscopeMediaStream;
        await videoEl.play();

        videoEl.onloadedmetadata = () => {
            if (resBadge && videoEl.videoWidth > 0) {
                resBadge.textContent = `${videoEl.videoWidth}x${videoEl.videoHeight}`;
            }
        };
    } catch (err) {
        console.warn('[Microscopio Fallback getUserMedia]', err);
        notifyUser('No se pudo acceder a la cámara seleccionada.', 'error');
    }
}

/**
 * Detiene todos los flujos activos (WebSocket, WebRTC, MJPEG)
 */
function stopMicroscopeStreams() {
    if (activeMicroscopeWs) {
        try {
            activeMicroscopeWs.onclose = null;
            activeMicroscopeWs.onerror = null;
            activeMicroscopeWs.onmessage = null;
            activeMicroscopeWs.close();
        } catch(e){}
        activeMicroscopeWs = null;
    }

    if (microscopeMediaStream) {
        microscopeMediaStream.getTracks().forEach(track => {
            try { track.stop(); } catch(e){}
        });
        microscopeMediaStream = null;
    }

    const videoEl = document.getElementById('microscopeVideoFeed');
    if (videoEl) videoEl.srcObject = null;

    const mjpegEl = document.getElementById('microscopeMjpegFeed');
    if (mjpegEl) mjpegEl.src = '';

    const canvasEl = document.getElementById('microscopeWsCanvas');
    if (canvasEl) {
        const ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
}

/**
 * Captura un fotograma en 1-clic y lo inyecta directamente a setupMiniCropper
 */
async function takeMicroscopeSnapshot() {
    const canvasEl = document.getElementById('microscopeSnapshotCanvas');
    if (!canvasEl) return;

    let capturedBase64 = null;
    let width = 2048;
    let height = 1536;

    if (currentMicroscopeSourceType === 'websocket') {
        // 1. Intentar capturar desde API nativa de ultra alta resolución (3.1 MP - 2048x1536)
        try {
            const host = window.location.hostname || '127.0.0.1';
            const captureUrl = `http://${host}:8085/api/camera/capture?t=${Date.now()}`;
            const captureRes = await fetch(captureUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(1000)
            });
            if (captureRes.ok) {
                const blob = await captureRes.blob();
                capturedBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (e) {}

        // 2. Si no responde la API nativa, capturar desde el visor en vivo
        if (!capturedBase64) {
            const wsCanvas = document.getElementById('microscopeWsCanvas');
            if (wsCanvas && wsCanvas.width > 0 && wsCanvas.height > 0) {
                width = wsCanvas.width;
                height = wsCanvas.height;
                canvasEl.width = width;
                canvasEl.height = height;
                const ctx = canvasEl.getContext('2d');

                if (isFeedFlippedH) {
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                }
                ctx.drawImage(wsCanvas, 0, 0, width, height);
                capturedBase64 = canvasEl.toDataURL('image/jpeg', 0.98);
            } else if (lastWsFrameBase64) {
                capturedBase64 = lastWsFrameBase64;
            }
        }

    } else if (currentMicroscopeSourceType === 'bridge' && activeBridgeBaseUrl) {
        // Intentar capturar desde API nativa de alta resolución
        try {
            const captureUrl = `${activeBridgeBaseUrl}/api/camera/capture?t=${Date.now()}`;
            const captureRes = await fetch(captureUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(1200)
            });

            if (captureRes.ok) {
                const blob = await captureRes.blob();
                capturedBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (e) {
            console.warn('[Bridge Direct Capture Fallback to Frame Grab]', e);
        }

        // Fallback: Capturar desde el elemento <img>
        if (!capturedBase64) {
            const mjpegEl = document.getElementById('microscopeMjpegFeed');
            if (mjpegEl && mjpegEl.naturalWidth > 0) {
                width = mjpegEl.naturalWidth;
                height = mjpegEl.naturalHeight;
                canvasEl.width = width;
                canvasEl.height = height;
                const ctx = canvasEl.getContext('2d');
                if (isFeedFlippedH) {
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                }
                ctx.drawImage(mjpegEl, 0, 0, width, height);
                capturedBase64 = canvasEl.toDataURL('image/jpeg', 0.96);
            }
        }
    } else {
        // Captura WebRTC Video
        const videoEl = document.getElementById('microscopeVideoFeed');
        if (!videoEl || videoEl.videoWidth === 0) {
            notifyUser('Cámara no lista para capturar fotograma.', 'error');
            return;
        }

        width = videoEl.videoWidth || 1920;
        height = videoEl.videoHeight || 1080;
        canvasEl.width = width;
        canvasEl.height = height;

        const ctx = canvasEl.getContext('2d');
        if (isFeedFlippedH) {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(videoEl, 0, 0, width, height);
        capturedBase64 = canvasEl.toDataURL('image/jpeg', 0.95);
    }

    if (!capturedBase64) {
        notifyUser('Error al capturar la microfotografía.', 'error');
        return;
    }

    // 1. Pre-compresión clínica inmediata para garantizar tamaño seguro (<150KB) sin saturar memoria ni localStorage
    const compressFn = (typeof compressImage === 'function') ? compressImage : window.compressImage;
    let finalBase64 = capturedBase64;
    if (typeof compressFn === 'function') {
        try {
            finalBase64 = await compressFn(capturedBase64, 1000, 1000, 0.85);
        } catch (compErr) {
            console.warn('[Microscope Snapshot Compress Warning]', compErr);
        }
    }

    const currentKey = activeMicroscopeTargetKey || 'img01';
    const isSlot01 = currentKey === 'img01';

    // 2. Asignación inmediata al elemento Preview y Workspace para que NUNCA quede vacío
    const prevEl = document.getElementById(`re_${currentKey}Preview`);
    const prevCont = document.getElementById(`re_${currentKey}PreviewContainer`);
    if (prevEl) prevEl.src = finalBase64;
    if (prevCont) prevCont.style.setProperty('display', 'flex', 'important');

    const rawImg = document.getElementById(`re_${currentKey}Raw`);
    if (rawImg) rawImg.src = finalBase64;

    // Inyección en el mini-cropper para que la caja de encuadre esté lista si el usuario desea afinar
    const cropperFn = (typeof setupMiniCropper === 'function') ? setupMiniCropper : window.setupMiniCropper;
    if (typeof cropperFn === 'function') {
        try { cropperFn(currentKey, finalBase64); } catch(e){}
    }

    // Actualizar estado visual de ranuras en la barra
    if (typeof window.updateMicroscopeSlotStatuses === 'function') {
        window.updateMicroscopeSlotStatuses();
    }

    // 3. Flujo inteligente de Captura Continua (Foto 1 -> Foto 2)
    const prev02 = document.getElementById('re_img02Preview');
    const hasPhoto02 = !!(prev02 && isValidImageSrc(prev02.src));

    if (isSlot01 && !hasPhoto02) {
        // Foto 1 lista, avanzar automáticamente a Foto 2 sin cerrar la cámara para que no pierda la conexión ni el foco
        notifyUser('📸 Foto 01 guardada con éxito. Cambiando a Foto 02. ¡Ajusta el microscopio (ej. 40x) y dispara de nuevo!', 'success');
        if (typeof window.setMicroscopeSlot === 'function') {
            window.setMicroscopeSlot('img02');
        }
    } else {
        // Se capturó Foto 2 o ya ambas ranuras tienen fotos
        notifyUser(`✅ Foto ${isSlot01 ? '01' : '02'} guardada con éxito. Ambas fotos listas en el informe.`, 'success');
        setTimeout(() => {
            window.closeMicroscopeCameraModal();
            // Asegurar que la pestaña de destino esté activa en el editor
            const targetTabId = `tab_${currentKey}`;
            const targetTabBtn = document.querySelector(`.tab-header-btn[data-tab="${targetTabId}"]`);
            if (targetTabBtn) targetTabBtn.click();
        }, 900);
    }
}

function handleMicroscopeKeydown(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        takeMicroscopeSnapshot();
    } else if (e.code === 'Escape') {
        e.preventDefault();
        window.closeMicroscopeCameraModal();
    }
}

function bindMicroscopeKeyboardShortcuts() {
    window.addEventListener('keydown', handleMicroscopeKeydown);
}

function unbindMicroscopeKeyboardShortcuts() {
    window.removeEventListener('keydown', handleMicroscopeKeydown);
}

// Inicialización de escuchadores de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const btnCapture = document.getElementById('btnCaptureMicroscopeFrame');
    const videoWrapper = document.getElementById('microscopeVideoContainer');
    const deviceSelect = document.getElementById('microscopeDeviceSelect');
    const btnRefresh = document.getElementById('btnRefreshMicroscopeSources');
    const btnToggleReticle = document.getElementById('btnToggleMicroscopeReticle');
    const btnFlipFeed = document.getElementById('btnFlipMicroscopeFeed');
    const reticleEl = document.getElementById('microscopeReticle');
    const videoEl = document.getElementById('microscopeVideoFeed');
    const mjpegEl = document.getElementById('microscopeMjpegFeed');
    const wsCanvasEl = document.getElementById('microscopeWsCanvas');

    if (btnCapture) btnCapture.addEventListener('click', takeMicroscopeSnapshot);
    if (videoWrapper) videoWrapper.addEventListener('dblclick', takeMicroscopeSnapshot);

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            window.refreshMicroscopeSources();
        });
    }

    if (deviceSelect) {
        deviceSelect.addEventListener('change', (e) => {
            if (e.target.value && e.target.value !== 'none') {
                switchMicroscopeSource(e.target.value);
            }
        });
    }

    if (btnToggleReticle && reticleEl) {
        btnToggleReticle.addEventListener('click', () => {
            const isHidden = reticleEl.style.display === 'none';
            reticleEl.style.display = isHidden ? 'block' : 'none';
            btnToggleReticle.classList.toggle('active', isHidden);
        });
    }

    if (btnFlipFeed) {
        btnFlipFeed.addEventListener('click', () => {
            isFeedFlippedH = !isFeedFlippedH;
            if (videoEl) videoEl.classList.toggle('flipped-h', isFeedFlippedH);
            if (mjpegEl) mjpegEl.style.transform = isFeedFlippedH ? 'scaleX(-1)' : 'none';
            if (wsCanvasEl) wsCanvasEl.style.transform = isFeedFlippedH ? 'scaleX(-1)' : 'none';
            btnFlipFeed.classList.toggle('active', isFeedFlippedH);
        });
    }
});

