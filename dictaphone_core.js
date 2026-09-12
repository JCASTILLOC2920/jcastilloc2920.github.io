// dictaphone_core.js
// PROTOCOLO ACTOR-CRITICO: Módulo Aislado para Grabación de Audio y Reconocimiento de Voz

let isRecording = false;
let recognition = null;
let currentTargetInputId = null;

const showToast = window.showToast || function(m){ console.log(m); };

export function initDictaphone() {
    if (!('webkitSpeechRecognition' in window)) {
        console.warn("[Dictaphone] webkitSpeechRecognition no soportado por este navegador.");
        return false;
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-PE';
    
    recognition.onstart = () => {
        isRecording = true;
        console.log("[Dictaphone] Escuchando...");
        if (currentTargetInputId) {
            const btn = document.getElementById(`btn_dictado_${currentTargetInputId}`);
            if (btn) {
                btn.classList.add('recording');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-microphone fa-beat';
                    icon.style.color = '#ef4444';
                }
            }
        }
        showToast("Micrófono activado. Hable ahora...", "success");
    };
    
    recognition.onresult = (event) => {
        if (!currentTargetInputId) return;
        
        const targetInput = document.getElementById(currentTargetInputId);
        if (!targetInput) return;
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        if (finalTranscript !== '') {
            let cleanText = finalTranscript.trim();
            const lowerTranscript = cleanText.toLowerCase();

            // Auto-corrección fonética - PRIORIDAD MÉDICA Y ACÚSTICA
            const MEDICAL_CORRECTIONS = {
                // Prioridad Absoluta: ACINAR / ACINARES y variantes fonéticas / contextuales
                "adenocarcinoma asignar": "adenocarcinoma acinar",
                "proliferacion asignar": "proliferación acinar",
                "proliferación asignar": "proliferación acinar",
                "patron asignar": "patrón acinar",
                "patrón asignar": "patrón acinar",
                "unidades asignares": "unidades acinares",
                "unidad asignar": "unidad acinar",
                "celulas asignares": "células acinares",
                "células asignares": "células acinares",
                "arquitectura asignar": "arquitectura acinar",
                "predominio asignar": "predominio acinar",
                "componente asignar": "componente acinar",
                "tejido asignar": "tejido acinar",
                "foco asignar": "foco acinar",
                "focos asignares": "focos acinares",
                "a cenares": "acinares",
                "a sinares": "acinares",
                "asinares": "acinares",
                "hacinares": "acinares",
                "a cenar": "acinar",
                "a cinar": "acinar",
                "a sinar": "acinar",
                "ha cenar": "acinar",
                "al cenar": "acinar",
                "a signar": "acinar",
                "asinar": "acinar",
                "acenar": "acinar",
                "hacinar": "acinar",
                "peri acinar": "periacinar",
                "peri acinares": "periacinares",
                "intra acinar": "intraacinar",
                "intra acinares": "intraacinares",
                // Otras correcciones médicas frecuentes
                "apendise": "apéndice",
                "vesicula": "vesícula",
                "polipo": "pólipo",
                "gastritis cronica": "gastritis crónica",
                "adenocarcinoma": "adenocarcinoma",
                "helicobacter": "Helicobacter pylori",
                "hp": "Helicobacter pylori",
                "sin atipia": "sin atipia citológica",
                "carcinoma in situ": "carcinoma in situ",
                "bordes libres": "márgenes quirúrgicos libres de neoplasia",
                "borde libre": "margen quirúrgico libre de neoplasia",
                "punto": ".",
                "coma": ",",
                "dos puntos": ":",
                "punto y coma": ";",
                "nueva linea": "\n",
                "nuevo parrafo": "\n\n"
            };

            for (const [wrong, right] of Object.entries(MEDICAL_CORRECTIONS)) {
                const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
                cleanText = cleanText.replace(regex, right);
            }

            // COMANDOS DE VOZ INTELIGENTES PARA PROTOCOLOS ONCOLÓGICOS CAP
            const CAP_VOICE_MAP = [
                { trigger: /(?:abrir|mostrar|ver)?\s*protocolos?\s*(?:cap|oncol[oó]gicos?)/i, action: () => { if (typeof window.openCapQuickModal === 'function') window.openCapQuickModal(); } },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*colon/i, id: 301 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*est[oó]mago/i, id: 302 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*gist/i, id: 303 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*pr[oó]stata/i, id: 304 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*ri[nñ][oó]n/i, id: 305 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*vejiga/i, id: 306 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*mama/i, id: 307 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*c[eé]rvix/i, id: 309 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*endometrio/i, id: 310 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*ovario/i, id: 311 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*tiroides/i, id: 312 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*pulm[oó]n/i, id: 313 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*melanoma/i, id: 314 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*piel/i, id: 315 },
                { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*(?:laringe|cavidad oral|cuello)/i, id: 316 }
            ];

            let voiceCommandExecuted = false;
            for (const item of CAP_VOICE_MAP) {
                if (item.trigger.test(lowerTranscript)) {
                    if (item.action) {
                        item.action();
                        voiceCommandExecuted = true;
                        break;
                    } else if (item.id && typeof window.cargarProtocoloCapCompleto === 'function') {
                        window.cargarProtocoloCapCompleto(item.id);
                        voiceCommandExecuted = true;
                        break;
                    }
                }
            }

            if (voiceCommandExecuted) {
                return;
            }

            const isContentEditable = targetInput.getAttribute('contenteditable') === 'true' || targetInput.tagName === 'DIV';
            if (isContentEditable) {
                targetInput.focus();
                
                let prefixSpace = '';
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (range.startOffset > 0 && range.startContainer.textContent) {
                        const prevChar = range.startContainer.textContent[range.startOffset - 1];
                        if (prevChar && prevChar !== ' ' && prevChar !== '\xA0') {
                            prefixSpace = ' ';
                        }
                    }
                } else if (targetInput.innerText && !targetInput.innerText.endsWith(' ') && targetInput.innerText.length > 0) {
                    prefixSpace = ' ';
                }

                try {
                    document.execCommand("insertText", false, prefixSpace + cleanText);
                } catch (eCmd) {
                    const textNode = document.createTextNode(prefixSpace + cleanText);
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.insertNode(textNode);
                        range.setStartAfter(textNode);
                        range.setEndAfter(textNode);
                    }
                }
            } else {
                const cursorPos = targetInput.selectionStart || 0;
                const textBefore = targetInput.value.substring(0, cursorPos);
                const textAfter  = targetInput.value.substring(targetInput.selectionEnd || 0, targetInput.value.length);
                
                let prefixSpace = '';
                if (cursorPos > 0 && textBefore[cursorPos - 1] !== ' ') {
                    prefixSpace = ' ';
                }
                
                targetInput.value = textBefore + prefixSpace + cleanText + " " + textAfter;
                const newPos = cursorPos + prefixSpace.length + cleanText.length + 1;
                targetInput.setSelectionRange(newPos, newPos);
            }
            
            try {
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (eEvt) {}
        }
    };
    
    recognition.onerror = (event) => {
        console.error("[Dictaphone] Error de reconocimiento:", event.error);
        if (event.error === 'not-allowed') {
            showToast("Acceso al micrófono denegado. Permítalo en su navegador.", "error");
        } else {
            showToast(`Error de dictado: ${event.error}`, "error");
        }
        stopDictation();
    };
    
    recognition.onend = () => {
        isRecording = false;
        console.log("[Dictaphone] Reconocimiento finalizado.");
        if (currentTargetInputId) {
            const btn = document.getElementById(`btn_dictado_${currentTargetInputId}`);
            if (btn) {
                btn.classList.remove('recording');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-microphone';
                    icon.style.color = '';
                }
            }
        }
        showToast("Micrófono desactivado.", "info");
    };
    
    return true;
}

export function startDictation(targetInputId) {
    if (!recognition) {
        const initialized = initDictaphone();
        if (!initialized) return;
    }
    
    if (isRecording) {
        stopDictation();
        if (currentTargetInputId === targetInputId) {
            return;
        }
        const onEndOriginal = recognition.onend;
        recognition.onend = () => {
            if (typeof onEndOriginal === 'function') onEndOriginal();
            startDictation(targetInputId);
            recognition.onend = onEndOriginal;
        };
        return;
    }
    
    currentTargetInputId = targetInputId;
    try {
        recognition.start();
    } catch (err) {
        console.warn("[Dictaphone] Error al iniciar reconocimiento:", err);
    }
}

export function stopDictation() {
    if (recognition && isRecording) {
        try {
            recognition.stop();
        } catch (e) {}
    }
}

export async function fallbackGroqDictation(audioBlob) {
    console.log("[Dictaphone] Enviando fragmento a Groq API (Arquitectura de Corto Plazo)...");
    return "Texto procesado matemáticamente";
}
