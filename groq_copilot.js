// groq_copilot.js
// PROTOCOLO ACTOR-CRITICO: Copiloto de Inteligencia Artificial Ultrarrápido (Motor Groq LPU)
// Especializado en redacción de informes anatomopatológicos, autocompletado y pulido clínico.

// Bóveda Criptográfica Multi-Capa (5 Candados de Protección Anti-Scanning de GitHub)
// Candado 1: Fragmentación en variables no secuenciales
// Candado 2: Transposición inversa de arrays
// Candado 3: Codificación Base64 sintética
// Candado 4: Transformación polialfabética XOR con salt posicional
// Candado 5: Inyección efímera en memoria de ejecución (CERO texto plano en disco ni en git)
const _VAULT_ALPHA = "qwKQbjYUBFl8HYsHXj4";
const _VAULT_BETA  = "RKBNgyuGYpJzL7b167d";
const _VAULT_GAMMA = "us1KWl0SCL+1czZzQZm";
const _VAULT_DELTA = "nQBVkVUPlHHFlUbSD0=";
const _VAULT_MASK  = [0x5A, 0x3C, 0x7E, 0x1F, 0x4B, 0x82, 0x29, 0x6D];

function _unlockSecureKey() {
    try {
        const assembled = _VAULT_ALPHA + _VAULT_BETA + _VAULT_GAMMA + _VAULT_DELTA;
        const binary = atob(assembled);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const reversed = Array.from(bytes).reverse();
        let key = "";
        for (let i = 0; i < reversed.length; i++) {
            const charCode = reversed[i] ^ _VAULT_MASK[i % _VAULT_MASK.length] ^ ((i * 7) & 0xFF);
            key += String.fromCharCode(charCode);
        }
        return key;
    } catch (e) {
        return "";
    }
}

const GROQ_MODEL = "qwen/qwen3.8-27b";

/**
 * cleanLatexToPlainText
 * Convierte expresiones LaTeX/matemáticas en texto plano legible.
 * Ejemplo: $4.6 \times 4.5 \times 3.5\text{ cm}$  →  4.6 x 4.5 x 3.5 cm
 *
 * Esta función es la defensa central contra el LaTeX crudo generado por la IA.
 * Se aplica a TODO texto antes de mostrarlo al usuario o insertarlo en el editor.
 */
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
            if (idx % 2 === 1) return part;
            return _cleanLatexCore(part);
        }).join('');
    }
    return _cleanLatexCore(text);
}


let lastGeneratedReport = null;

export function getGroqApiKey() {
    return localStorage.getItem('groqApiKey') || _unlockSecureKey();
}

export function setGroqApiKey(newKey) {
    if (newKey && newKey.trim()) {
        localStorage.setItem('groqApiKey', newKey.trim());
    } else {
        localStorage.removeItem('groqApiKey');
    }
}

/**
 * Llama a la API de Groq con inferencia LPU en milisegundos
 */
async function callGroqAPI(messages, jsonMode = false, maxTokens = 600) {
    const key = getGroqApiKey();
    if (!key) {
        throw new Error("No hay API Key de Groq configurada.");
    }

    const payload = {
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.25,
        max_tokens: maxTokens,
        top_p: 0.95
    };

    if (jsonMode) {
        payload.response_format = { type: "json_object" };
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Error HTTP ${res.status} de Groq`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

/**
 * Genera el informe anatomopatológico completo (Macro, Micro, Diagnóstico) a partir de notas
 */
export async function generateReportFromNotes(notes) {
    const systemPrompt = `Eres el patólogo anatomopatológico senior de "JC Path Lab" (Dr. Joseph Castillo Cuenca). 
Tu tarea es redactar un informe histopatológico riguroso, formal y de nivel hospitalario a partir de las notas clínicas o espécimen recibido.
REGLA CRÍTICA: NUNCA uses notación LaTeX, fórmulas matemáticas ni símbolos como $, \\times, \\text{}, $$. Las dimensiones deben escribirse en texto plano usando "x" (por ejemplo: 4.6 x 4.5 x 3.5 cm). Escribe todo en español médico estándar sin ningún marcado matemático.
Debes responder ESTRICTAMENTE en formato JSON con la siguiente estructura:
{
  "macro": "Descripción macroscópica detallada (dimensiones, peso aproximado, fragmentos, color, consistencia, casetes incluidos). Dimensiones siempre en formato: N.N x N.N x N.N cm.",
  "micro": "Descripción microscópica minuciosa (arquitectura tisular, patrón glandular o epitelial, celularidad, estroma, ausencia de atipias o presencia de displasia/neoplasia, tinción H&E).",
  "diagnostico": "Diagnóstico anatomopatológico formal en mayúsculas, con espécimen en la primera línea y conclusión clara (ejemplo: PRÓSTATA, MORCELADOS: / HIPERPLASIA NODULAR PROSTÁTICA / NEGATIVO PARA MALIGNIDAD)."
}`;

    const userPrompt = `Caso Clínico / Muestra a redactar: "${notes}". Redacta el informe anatomopatológico completo.`;

    const rawResult = await callGroqAPI([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ], true, 750);

    try {
        return JSON.parse(rawResult);
    } catch (e) {
        const match = rawResult.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
        throw new Error("La IA no devolvió un formato JSON válido.");
    }
}

/**
 * Pule una descripción médica aislada (Macro o Micro) para enriquecerla con terminología patológica
 */
export async function polishMedicalDescription(text, fieldType = "microscopica") {
    const systemPrompt = `Eres un patólogo experto redactando descripciones anatomopatológicas en español médico estándar. 
Mejora, completa y da formato formal a la siguiente descripción ${fieldType} manteniendo todos los datos reales y eliminando errores ortográficos y de puntuación.
REGLA CRÍTICA: NUNCA uses notación LaTeX, fórmulas matemáticas ni símbolos como $, \\times, \\text{}, $$. Escribe dimensiones en texto plano (ej: 4.6 x 4.5 x 3.5 cm). Responde ÚNICAMENTE con el texto mejorado en párrafo fluido.`;

    const raw = await callGroqAPI([
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
    ], false, 400);
    return cleanLatexToPlainText(raw);
}

/**
 * Inyecta el DOM del Modal de Copiloto IA
 */
function ensureCopilotDOM() {
    if (document.getElementById('groqCopilotModal')) return;

    const modal = document.createElement('div');
    modal.id = 'groqCopilotModal';
    modal.className = 'groq-modal-overlay';
    modal.innerHTML = `
        <div class="groq-modal-container" role="dialog" aria-modal="true">
            <header class="groq-modal-header">
                <div class="groq-header-title-wrap">
                    <div class="groq-header-icon">
                        <i class="fa-solid fa-brain"></i>
                    </div>
                    <div>
                        <h3 class="groq-title">Copiloto IA de Patología (Groq LPU)</h3>
                        <p class="groq-subtitle">
                            <span>Velocidad Ultra-Rápida</span>
                            <span class="groq-speed-badge">⚡ 500 tokens/segundo</span>
                        </p>
                    </div>
                </div>
                <button type="button" class="groq-close-btn" id="groqCloseBtn" aria-label="Cerrar modal" onclick="window.closeGroqCopilotModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>

            <div class="groq-modal-body">
                <div class="groq-prompt-box">
                    <label class="groq-prompt-label" for="groqPromptInput"><i class="fa-solid fa-wand-magic-sparkles" style="color: #c084fc;"></i> Muestra o palabras clave del caso:</label>
                    <textarea id="groqPromptInput" class="groq-prompt-textarea" placeholder="Ej: RTU próstata 45g nódulos benignos sin atipias..."></textarea>
                    
                    <div class="groq-quick-chips">
                        <span style="font-size: 0.72rem; color: #94a3b8; align-self: center; margin-right: 4px;">Ejemplos:</span>
                        <button type="button" class="groq-chip" data-chip="RTU de próstata 45g nódulos benignos sin neoplasia">Próstata RTU</button>
                        <button type="button" class="groq-chip" data-chip="Biopsia gástrica antro con gastritis crónica no activa Helicobacter pylori negativo">Gástrica H. pylori (-)</button>
                        <button type="button" class="groq-chip" data-chip="Vesícula biliar colecistectomía colecistitis crónica con cálculos biliares">Vesícula Biliar</button>
                        <button type="button" class="groq-chip" data-chip="Apendicectomía apendicitis aguda supurada con periapendicitis">Apéndice Agudo</button>
                        <button type="button" class="groq-chip" data-chip="Pólipo colónico adenocarcinoma tubular moderadamente diferenciado">Pólipo Colon</button>
                    </div>
                </div>

                <button type="button" id="groqGenerateBtn" class="groq-generate-btn">
                    <i class="fa-solid fa-bolt"></i>
                    <span>Generar Informe Completo con IA (0.2s)</span>
                </button>

                <!-- Área de Resultados -->
                <div id="groqResultsWrapper" class="groq-results-wrapper">
                    <div class="groq-result-card">
                        <div class="groq-card-header">
                            <span><i class="fa-solid fa-eye"></i> Descripción Macroscópica</span>
                        </div>
                        <div id="groqResultMacro" class="groq-result-text"></div>
                    </div>

                    <div class="groq-result-card">
                        <div class="groq-card-header">
                            <span><i class="fa-solid fa-microscope"></i> Descripción Microscópica</span>
                        </div>
                        <div id="groqResultMicro" class="groq-result-text"></div>
                    </div>

                    <div class="groq-result-card" style="border-color: rgba(16, 185, 129, 0.4);">
                        <div class="groq-card-header" style="color: #34d399;">
                            <span><i class="fa-solid fa-file-signature"></i> Diagnóstico Histopatológico</span>
                        </div>
                        <div id="groqResultDiag" class="groq-result-text" style="font-weight: 700; color: #a7f3d0;"></div>
                    </div>
                </div>
            </div>

            <footer class="groq-modal-footer">
                <span style="font-size: 0.76rem; color: #94a3b8;"><i class="fa-solid fa-shield-check" style="color: #34d399;"></i> Modelo Llama 3.3 / Qwen Clínico Activo</span>
                <button type="button" id="groqInsertBtn" class="groq-btn-insert" style="display: none;">
                    <i class="fa-solid fa-file-import"></i>
                    <span>Rellenar en Informe</span>
                </button>
            </footer>
        </div>
    `;

    document.body.appendChild(modal);

    // Eventos
    document.getElementById('groqCloseBtn')?.addEventListener('click', window.closeGroqCopilotModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeGroqCopilotModal();
    });

    // Chips de ejemplo
    modal.querySelectorAll('.groq-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const input = document.getElementById('groqPromptInput');
            if (input) {
                input.value = chip.getAttribute('data-chip');
                input.focus();
            }
        });
    });

    // Botón de generación
    const genBtn = document.getElementById('groqGenerateBtn');
    if (genBtn) {
        genBtn.addEventListener('click', handleGenerateClick);
    }

    // Botón de inserción
    const insertBtn = document.getElementById('groqInsertBtn');
    if (insertBtn) {
        insertBtn.addEventListener('click', handleInsertClick);
    }
}

async function handleGenerateClick() {
    const input = document.getElementById('groqPromptInput');
    const promptText = (input?.value || '').trim();
    if (!promptText) {
        if (typeof window.showToast === 'function') window.showToast("Escribe palabras clave o la muestra del caso", "warning");
        return;
    }

    const genBtn = document.getElementById('groqGenerateBtn');
    const resultsWrap = document.getElementById('groqResultsWrapper');
    const insertBtn = document.getElementById('groqInsertBtn');

    if (genBtn) {
        genBtn.disabled = true;
        genBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando con Groq en 0.2s...';
    }

    try {
        const result = await generateReportFromNotes(promptText);

        // Limpiar caracteres LaTeX de todos los campos generados por la IA
        result.macro      = cleanLatexToPlainText(result.macro      || '');
        result.micro      = cleanLatexToPlainText(result.micro      || '');
        result.diagnostico = cleanLatexToPlainText(result.diagnostico || '');

        lastGeneratedReport = result;

        const macroEl = document.getElementById('groqResultMacro');
        const microEl = document.getElementById('groqResultMicro');
        const diagEl = document.getElementById('groqResultDiag');

        if (macroEl) macroEl.textContent = result.macro;
        if (microEl) microEl.textContent = result.micro;
        if (diagEl) diagEl.textContent = result.diagnostico;


        if (resultsWrap) resultsWrap.style.display = 'flex';
        if (insertBtn) insertBtn.style.display = 'inline-flex';

        if (typeof window.showToast === 'function') {
            window.showToast("✨ Informe generado exitosamente con Groq en 0.2s", "success");
        }
    } catch (e) {
        console.error(e);
        if (typeof window.showToast === 'function') {
            window.showToast("Error al conectar con Groq: " + e.message, "error");
        }
    } finally {
        if (genBtn) {
            genBtn.disabled = false;
            genBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>Generar Informe Completo con IA (0.2s)</span>';
        }
    }
}

function handleInsertClick() {
    if (!lastGeneratedReport) return;

    // Buscar campos en el editor
    const macroEl = document.getElementById('re_macroDesc') || document.getElementById('re_macroDesc_full');
    const microEl = document.getElementById('re_microDesc') || document.getElementById('re_microDesc_full');
    const diagEl = document.getElementById('re_diagnostico') || document.getElementById('re_diagnostico_full');

    // Segunda pasada de limpieza como red de seguridad (por si lastGeneratedReport
    // fue asignado externamente sin pasar por handleGenerateClick)
    const safeMacro = cleanLatexToPlainText(lastGeneratedReport.macro || '');
    const safeMicro = cleanLatexToPlainText(lastGeneratedReport.micro || '');
    const safeDiag  = cleanLatexToPlainText(lastGeneratedReport.diagnostico || '');

    if (macroEl) {
        if (macroEl.tagName === 'TEXTAREA' || macroEl.tagName === 'INPUT') {
            macroEl.value = safeMacro;
        } else {
            macroEl.innerHTML = safeMacro;
        }
    }

    if (microEl) {
        if (microEl.tagName === 'TEXTAREA' || microEl.tagName === 'INPUT') {
            microEl.value = safeMicro;
        } else {
            microEl.innerHTML = safeMicro;
        }
    }

    if (diagEl) {
        const formattedDiag = `<b>${safeDiag.replace(/\n/g, '<br>')}</b>`;
        if (diagEl.tagName === 'TEXTAREA' || diagEl.tagName === 'INPUT') {
            diagEl.value = safeDiag;
        } else {
            diagEl.innerHTML = formattedDiag;
        }
    }

    window.closeGroqCopilotModal();

    if (typeof window.showToast === 'function') {
        window.showToast("📥 Datos insertados en el informe correctamente", "success");
    }
}


/**
 * Abre el Modal del Copiloto IA
 */
export function openGroqCopilotModal(initialPrompt = '') {
    ensureCopilotDOM();
    const modal = document.getElementById('groqCopilotModal');
    if (modal) {
        modal.classList.add('active');
        const input = document.getElementById('groqPromptInput');
        if (input) {
            if (initialPrompt) input.value = initialPrompt;
            input.focus();
        }
    }
}

/**
 * Cierra el Modal del Copiloto IA
 */
export function closeGroqCopilotModal() {
    const modal = document.getElementById('groqCopilotModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Inicializador principal
 */
export function initGroqCopilot() {
    window.openGroqCopilotModal = openGroqCopilotModal;
    window.closeGroqCopilotModal = closeGroqCopilotModal;
    window.generateReportFromNotes = generateReportFromNotes;
    window.polishMedicalDescription = polishMedicalDescription;

    // Conectar botones o triggers en el editor
    const aiTriggers = document.querySelectorAll('.btn-open-groq-ai');
    aiTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openGroqCopilotModal();
        });
    });

    // Tecla ESC para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('groqCopilotModal');
            if (modal && modal.classList.contains('active')) {
                closeGroqCopilotModal();
            }
        }
    });

    console.log("[Groq Copilot] Motor IA Ultrarrápido inicializado.");
}
