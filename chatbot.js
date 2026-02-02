// ============================================
// CHATBOT "MODO DIOS" (LOCAL INTELLIGENCE)
// ============================================

// --- CONFIGURACIÓN ---
const BOT_NAME = "Asistente JC Path Lab";
// Icono más científico

// --- ESTADO DEL CHAT ---
let conversationHistory = [];
let lastBotIntent = null; // Track context (e.g., 'waiting_for_pickup_confirmation')

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    initChatbotUI();
});

function initChatbotUI() {
    const chatContainer = document.getElementById("chat-container");
    const sentBtn = document.getElementById("send-btn");
    const inputField = document.getElementById("chat-input");
    const toggleBtn = document.getElementById("chat-toggle");
    const closeBtn = document.querySelector(".close-btn");

    if (!chatContainer) return; // Seguridad si no existe el HTML

    // Toggle Visibility
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            chatContainer.classList.add("open");
            // Foco en el input al abrir
            setTimeout(() => inputField?.focus(), 300);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatContainer.classList.remove("open");
        });
    }

    // --- TOOLTIP LOGIC (God Mode VISIBILITY) ---
    const tooltip = document.getElementById("chat-tooltip");

    // 1. Mostrar a los 3 segundos
    setTimeout(() => {
        if (tooltip && !chatContainer.classList.contains("open")) {
            tooltip.classList.add("visible");
        }
    }, 3000);

    // 2. Ocultar al hacer clic en el toggle o en el tooltip
    if (toggleBtn && tooltip) {
        const hideTooltip = () => {
            tooltip.classList.remove("visible");
            // Remove from DOM after transition to prevent clicks
            setTimeout(() => tooltip.style.display = "none", 500);
        };

        toggleBtn.addEventListener("click", hideTooltip);
        tooltip.addEventListener("click", () => {
            hideTooltip();
            toggleBtn.click(); // Abrir chat al clickear tooltip
        });
    }

    // Enviar Mensajes
    if (sentBtn && inputField) {
        sentBtn.addEventListener("click", () => handleUserMessage());
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleUserMessage();
        });
    }

    // File Upload Handling
    const fileInput = document.getElementById("chat-file-upload");
    if (fileInput) {
        fileInput.addEventListener("change", async (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                addMessage(`📎 **Imagen adjunta:** ${file.name}`, "user");
                showTypingIndicator();
                try {
                    // Convert to Base64 and send to Gemini
                    const base64Image = await convertToBase64(file);
                    const response = await callGeminiAPI("Analiza esta imagen de una orden médica y extrae: Paciente, Estudios Solicitados y Diagnóstico Presuntivo.", base64Image);
                    removeTypingIndicator();
                    addMessage(response, "bot");
                } catch (err) {
                    console.error(err);
                    removeTypingIndicator();
                    addMessage("Lo siento, hubo un error procesando la imagen. Intenta enviarla por WhatsApp.", "bot");
                }
                // Clear input
                fileInput.value = "";
            }
        });
    }

    // Mensaje de Bienvenida Automático (Personalizado)
    setTimeout(() => {
        addMessage(`¡Hola! Bienvenido a JC PATH LAB. Soy su asistente virtual. 🩺\n\nEntiendo que busca información sobre sus exámenes médicos. Para ayudarle rápido:\n\n🔹 **Precios y Estudios**\n🔹 **Logística y Recojo**\n🔹 **Ubicación y Horarios**\n\n¿En qué puedo ayudarle hoy?`, "bot");
    }, 1500);
}

// --- MOTOR DE RESPUESTA LOCAL (SIN API) ---

async function handleUserMessage() {
    const inputField = document.getElementById("chat-input");
    const userText = inputField.value.trim();

    if (!userText) return;

    // 1. Mostrar mensaje del usuario
    addMessage(userText, "user");
    inputField.value = "";

    // 2. Simular "Pensando..."
    showTypingIndicator();

    // 3. Procesar respuesta
    const thinkingTime = Math.random() * 1000 + 800;

    setTimeout(async () => { // Make callback async
        let response;
        // Try local triage first (fastest)
        const localResponse = generateLocalResponse(userText);

        if (localResponse && !localResponse.includes("pase a humano")) {
            response = localResponse;
        } else {
            // Fallback to AI API if local response is generic
            try {
                response = await callGeminiAPI(userText);
            } catch (error) {
                console.error("API Error:", error);
                response = generateLocalResponse(userText); // Fallback to local if API fails
            }
        }

        removeTypingIndicator();
        addMessage(response, "bot");
    }, thinkingTime);
}

// --- GEMINI API CONFIGURATION ---
const API_KEY = "AIzaSyD1UhBYJ-L_rcM2hK-CKJmi57Lb6wGqyz8";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_PROMPT = `Actúa como el Agente Principal de JC PATH LAB.
Rol: Eres el Asistente Inteligente de JC PATH LAB. Tu personalidad es cálida, profesional y humanizada (estilo TikTok).
Contexto:
- Ubicación: Mz M2 Lote 13, Jardines de Chillón, Puente Piedra.
- Contacto: 986396733.
- Servicios: Anatomía Patológica (biopsias, citologías).

Protocolo de Recolección de Datos (OBLIGATORIO):
Cuando un paciente pregunte por un servicio, saluda y SOLICITA estos 3 datos:
1. Nombre del paciente.
2. Punto de recojo (si es a domicilio o en local).
3. Foto de la solicitud de estudio (pídeles que la adjunten al chat).

Manejo de Imágenes:
- Si el usuario sube una imagen, analízala (OCR) para extraer el tipo de examen y el nombre.

Generación de Link:
- Una vez tengas los datos, genera un enlace de WhatsApp con formato: https://wa.me/51986396733?text=[Resumen del pedido].

Restricciones:
- No diagnósticos médicos.
- Lenguaje sencillo y local (Soles, Recojo).`;

async function callGeminiAPI(userMessage, base64Image = null) {
    const parts = [{ text: userMessage }];

    if (base64Image) {
        // Strip data:image/jpeg;base64, prefix if present for API
        const cleanBase64 = base64Image.split(',')[1] || base64Image;
        parts.push({
            inline_data: {
                mime_type: "image/jpeg", // Assuming JPEG/PNG, API handles generic image types usually, but let's default to jpeg/png flow
                data: cleanBase64
            }
        });
    }

    const payload = {
        contents: [{
            parts: parts
        }],
        systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
        }
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function generateLocalResponse(query) {
    const qLower = query.toLowerCase();

    // --- 1. INTENCIONES DIRECTAS (HARDCODED FAST RESPONSES) ---

    // PRIORITY 1: INTENCIÓN DE FOTO / SOLICITUD (Correccion de Bug "Linfoma")
    if (qLower.includes("foto") || qLower.includes("subir") || qLower.includes("adjuntar") || qLower.includes("enviar") || qLower.includes("solicitud") || qLower.includes("orden")) {
        lastBotIntent = null; // Reset context
        return "¡Excelente! Para enviarnos la foto de su solicitud o estudio, por favor haga clic en el **botón de WhatsApp** (icono verde) que ve en su pantalla. 📲\n\nPor ese medio recibimos todas las órdenes directamente para coordinar el recojo de inmediato.";
    }

    // PRIORITY 1.5: CONFIRMACIÓN DE CONTEXTO (SI / NO)
    if (lastBotIntent === 'waiting_for_pickup_confirmation') {
        if (qLower.match(/^(si|sí|claro|por favor|ok|esta bien|dale)/)) {
            lastBotIntent = null;
            return "¡Perfecto! 🎉\n\nPor favor, haga clic en el **botón de WhatsApp** (la burbuja verde 💬) para coordinar la hora y dirección exacta con nuestra central de recojos.\n\n¡Le esperamos!";
        } else if (qLower.match(/^(no|luego|mas tarde|gracias)/)) {
            lastBotIntent = null;
            return "Entendido. Quedamos a su disposición para cuando lo necesite. 😊\n\nRecuerde que atendemos de Lunes a Sábado.";
        }
    }

    // PRIORITY 2: SALUDOS
    if (qLower.match(/^(hola|buenos d|buenas|hi|que tal|como estas)/)) {
        const saludos = [
            "¡Hola! 👋 Bienvenido a JC PATH LAB. Soy su asistente virtual. ¿En qué estudio médico puedo orientarle hoy?",
            "¡Buenos días! ☀️ Entiendo que la salud es lo primero. Cuénteme, ¿qué información necesita para agilizar su atención?",
            "¡Hola! Quedo atento a su consulta. Recuerde que atendemos en **Puente Piedra** y todo **Lima Norte**. ¿En qué le ayudo? 🩺"
        ];
        return saludos[Math.floor(Math.random() * saludos.length)];
    }

    // PRIORITY 3: IDENTIDAD (Evitar que responda con textos médicos)
    if (qLower.includes("quien eres") || qLower.includes("tu nombre") || qLower.includes("como te llamas") || qLower.includes("que haces") || qLower.includes("eres un robot")) {
        return "Soy el **Asistente Virtual Inteligente de JC PATH LAB**. 🤖\n\nEstoy entrenado para responder preguntas sobre nuestros servicios de anatomía patológica, precios, horarios y ubicación.\n\nAunque sé mucho sobre nuestros protocolos médicos, mi función principal es ayudarle a coordinar sus estudios y recojos de muestras. ¿En qué puedo servirle?";
    }

    // --- 1. TRIAJE INTELIGENTE (CRO & VENTAS) ---
    // Detectar intención de Biopsia o PAP para cerrar venta con foto
    if ((qLower.includes("precio") || qLower.includes("costo") || qLower.includes("cuanto")) &&
        (qLower.includes("biopsia") || qLower.includes("pap") || qLower.includes("papanicolau") || qLower.includes("estudio") || qLower.includes("examen"))) {
        return "Entiendo, estimado/a. Ese es uno de los estudios que realizamos con mayor frecuencia y precisión. 🔬\n\nPara darle una información exacta, **¿podría enviarme una foto de su orden médica?** 📄\n\nAsí el Dr. Castillo podrá validarla de inmediato y confirmarle el costo y tiempo exacto.\n\n👉 *Sube una foto de tu orden médica para darte el precio exacto y programar tu recojo.*";
    }

    // Precios Generales (Si no especifica estudio)
    if (qLower.includes("precio") || qLower.includes("costo") || qLower.includes("cuanto cuesta") || qLower.includes("valor")) {
        // Intentar buscar precios específicos si se menciona un estudio
        const specificPrice = findPriceInText(qLower);
        if (specificPrice) return specificPrice;

        // Respuesta persuasiva de venta con PRECIOS GOD MODE
        return "Con gusto. Manejamos tarifas accesibles para todo **Lima Norte**. 🏥\n\n🔹 **Biopsia Gástrica / Cérvix:** **S/ 80**\n🔹 **Papanicolaou (PAP):** **S/ 20**\n🔹 **Cono Cervical:** **S/ 120**\n🔹 **Biopsia de Próstata:** **S/ 250**\n\n⚠️ *Nuestros resultados son válidos para cualquier clínica u hospital oncológico del país.*\n\n¿Desea enviarme una foto de su orden médica para empezar?";
    }

    // Logística y Recojo (Enfatizar Agilidad)
    if (qLower.includes("recojo") || qLower.includes("domicilio") || qLower.includes("llevo la muestra") || qLower.includes("donde entregar") ||
        (qLower.includes("tengo") && qLower.includes("muestra")) ||
        (qLower.includes("quiero") && qLower.includes("enviar")) ||
        qLower.includes("a donde envio") || qLower.includes("weviar")) { // 'weviar' as typo catch
        lastBotIntent = 'waiting_for_pickup_confirmation'; // Set context
        return "¡Despreocúpese del tráfico! 🛑 Nosotros nos encargamos.\n\n✅ **Recojo en todo Lima:** Vamos a su domicilio o clínica.\n✅ **Provincias:** Recepcionamos encomiendas en agencia.\n\nEl tiempo de respuesta es rápido: **3-4 días hábiles**. ⏱\n\n¿Le gustaría programar el recojo de su muestra ahora?";
    }

    // Dirección / Ubicación (Lima Norte)
    if (qLower.includes("donde") || qLower.includes("ubicacion") || qLower.includes("direccion") || qLower.includes("llegar")) {
        return "Estamos ubicados estratégicamente en **Puente Piedra**, siendo el laboratorio de referencia para todo **Lima Norte** (Ancón, Carabayllo, Comas, Los Olivos). 📍\n\n🏠 **Dirección:** Mz M2 lote 13, Jardines de Chillón.\n\nSi prefiere no venir, recuerde que contamos con **servicio de recojo a domicilio**. 🛵";
    }

    // Horarios
    if (qLower.includes("horario") || qLower.includes("atienden") || qLower.includes("hora")) {
        return "Nuestro horario de atención es:\n\n📅 **Lunes a Viernes:** 9:00 AM - 6:00 PM\n📅 **Sábados:** Previa cita.\n\nSiempre es bueno avisarnos antes de venir para esperarte. 😉";
    }

    // Contacto / Telefono
    // Contacto / Telefono
    if (qLower.includes("telefono") || qLower.includes("celular") || qLower.includes("numero") || qLower.includes("whatsapp") || qLower.includes("contacto") || qLower.includes("contactar") || qLower.includes("hablar")) {
        lastBotIntent = null; // Clear context
        return "Quedamos atentos a su consulta directa al **+51 986 396 733**. 📱\n\nPara una atención más rápida, le sugiero hacer clic en el **botón de WhatsApp** para chatear con nuestra área de recepción y enviar fotos de sus órdenes.";
    }

    // --- 1.5. INTENCIONES DE AYUDA / FALLBACK (SMALL TALK) ---
    if (qLower.includes("ayuda") || qLower.includes("help") || qLower.includes("opciones") || qLower.includes("menu")) {
        return "🤖 **Menú de Ayuda:**\n\n1. **Precios:** Escribe 'precio biopsia' o 'costo papanicolaou'.\n2. **Logística:** Escribe 'recoger muestra' o 'donde entregar'.\n3. **Ubicación:** Escribe 'dirección'.\n4. **Contacto:** Escribe 'hablar con humano'.\n\n¿Cuál eliges?";
    }

    if (qLower.includes("no entiendo") || qLower.includes("error") || qLower.includes("mal") || qLower.includes("equivocado")) {
        return "¡Mil disculpas! 😓 A veces mis circuitos se cruzan.\n\nPara no hacerte perder tiempo, te sugiero contactar directamente a nuestra central humana por WhatsApp haciendo clic aquí abajo. 👇";
    }

    // --- 2. BÚSQUEDA SEMÁNTICA EN 'SITE_KNOWLEDGE' (Cerebro Web) ---
    // Usaremos la variable global SITE_KNOWLEDGE que contiene TODO el texto de la web.

    if (typeof SITE_KNOWLEDGE !== 'undefined') {
        const bestMatch = findBestMatchInKnowledge(query, SITE_KNOWLEDGE);
        if (bestMatch) {
            return bestMatch;
        }
    }

    // --- 3. FALLBACK GENERAL (Empatía + pase a humano) ---
    return "Entiendo su consulta, estimado/a. 🤔 \n\nPara darle una respuesta 100% precisa sobre este tema médico, prefiero que lo vea directamente el Dr. Castillo.\n\n¿Le parece bien si le escribimos por WhatsApp para resolverlo a detalle?";
}

function findPriceInText(query) {
    // Lógica simple para extraer precios si están en el SITE_KNOWLEDGE cerca de la palabra clave
    if (typeof SITE_KNOWLEDGE === 'undefined') return null;

    // Buscar "S/" o "Soles" cerca de palabras clave del query
    const keywords = query.split(' ').filter(w => w.length > 3 && !['hola', 'precio', 'costo'].includes(w));

    if (keywords.length === 0) return null;

    const lines = SITE_KNOWLEDGE.split('\n');
    for (const keyword of keywords) {
        for (const line of lines) {
            if (line.toLowerCase().includes(keyword) && (line.includes("S/") || line.toLowerCase().includes("soles") || line.toLowerCase().includes("precio"))) {
                return `Encontré esta referencia en nuestra lista de precios: \n\n"${line.trim()}"`;
            }
        }
    }
    return null;
}

function findBestMatchInKnowledge(query, knowledgeText) {
    // 1. Dividir el conocimiento en segmentos manejables
    const sentences = knowledgeText.match(/[^.!?]+[.!?]+/g) || knowledgeText.split('\n');

    // GOD MODE: FILTRO MÉDICO ESTRICTO
    // Solo buscamos en la base de datos si la consulta tiene INTENCIÓN MÉDICA o TÉCNICA.
    const medicalTriggers = ["biopsia", "cancer", "tumor", "maligno", "benigno", "papanicolau", "citologia", "inmunohistoquimica", "ihq", "marcador", "prueba", "examen", "analisis", "resultado", "informe", "lamina", "bloque", "taco", "molecula", "genetica", "her2", "ki67", "estudio", "procedimiento", "precio", "costo", "valor", "tarifario"];

    // Normalizar texto para busqueda (sin tildes)
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const qNorm = normalize(query.toLowerCase());

    // Si NO contiene ninguna palabra médica clave, ABORTAR BÚSQUEDA (Evita alucinaciones con textos aleatorios)
    const hasMedicalIntent = medicalTriggers.some(trigger => qNorm.includes(trigger));
    if (!hasMedicalIntent) return null;

    const queryWords = qNorm.split(/\s+/).filter(w => w.length > 4);

    if (queryWords.length === 0) return null;

    let bestMatchIndex = -1;
    let maxScore = 0; // Reset logic

    sentences.forEach((sentence, index) => {
        let score = 0;
        const sentenceLower = normalize(sentence.toLowerCase());

        queryWords.forEach(word => {
            if (sentenceLower.includes(word)) {
                score += 10;
                if (new RegExp(`\\b${word}\\b`).test(sentenceLower)) {
                    score += 5;
                }
            }
        });

        // Penalizar headers
        if (sentence.includes("--- SOURCE:")) score -= 100;

        if (score > maxScore) {
            maxScore = score;
            bestMatchIndex = index;
        }
    });

    // UMBRAL MÁS ALTO (GOD MODE)
    // 15 Puntos = Al menos 1 coincidencia exacta o 2 parciales.
    if (maxScore >= 15 && bestMatchIndex !== -1) {
        let response = "";

        // Contexto inteligente (Previous + Current + Next)
        if (bestMatchIndex > 0) {
            const prev = sentences[bestMatchIndex - 1].trim();
            if (!prev.includes("--- SOURCE:") && prev.length > 20) response += prev + " ";
        }

        response += sentences[bestMatchIndex].trim();

        if (bestMatchIndex < sentences.length - 1) {
            const next = sentences[bestMatchIndex + 1].trim();
            if (!next.includes("--- SOURCE:") && next.length > 20) response += " " + next;
        }

        return `Encontré esto en nuestra base de conocimientos técnica:\n\n"...${response.trim()}..."`;
    }

    return null;
}

// --- UI UTILS ---

function addMessage(text, sender) {
    const chatBody = document.getElementById("chat-messages");
    if (!chatBody) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

    // Formatear enlaces y negritas
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #007bff; text-decoration: underline;">$1</a>')
        .replace(/\n/g, '<br>');

    msgDiv.innerHTML = formattedText;

    chatBody.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const chatBody = document.getElementById("chat-messages");
    if (document.getElementById("typing-indicator")) return;

    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.classList.add("message", "bot-message", "typing");
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>`;

    chatBody.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
}

function scrollToBottom() {
    const chatBody = document.getElementById("chat-messages");
    chatBody.scrollTop = chatBody.scrollHeight;
}
