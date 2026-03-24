// ============================================
// JC PATH LAB - MAIN BOT ENGINE (VICTORIA)
// ============================================

// --- BASE DE CONOCIMIENTOS (Simplificada para el ejemplo, se asume cargada desde site_knowledge.js) ---
// En producción, SITE_KNOWLEDGE es un string gigante definido al inicio.



// --- CONFIGURACIÓN GLOBAL Y ESTADO ---
const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MS = 1500;
let lastMessageTime = 0;
let conversationHistory = [];
let lastBotIntent = null; 
let userName = "";
let userPhone = "";
let lastExamenConsultado = "estudio solicitado";

// --- AVATAR CONFIGURATION ---
const AVATARS = {
    victoria: {
        name: "Victoria",
        role: "Asistente Especialista en Biopsias",
        containerId: "avatar-victoria",
        videos: {
            idle: "victoria-idle",
            hablando: "victoria-hablando",
            pensando: "victoria-pensando",
            saludo: "victoria-saludo"
        }
    },
    elena: {
        name: "Elena",
        role: "Especialista en Citología y PAP",
        containerId: "avatar-elena",
        videos: {
            idle: "elena-idle",
            hablando: "elena-hablando",
            pensando: "elena-pensando",
            saludo: "elena-saludo"
        }
    }
};

let currentAvatarProfile = AVATARS.victoria;

// --- AI CONFIGURATION ---
const OLLAMA_URL = "http://localhost:11434/api/generate";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyD1UhBYJ-L_rcM2hK-CKJmi57Lb6wGqyz8"; 

const SYSTEM_PROMPT = `Eres Victoria, Asistente de JC Path Lab (Grado Militar y Experta en Marketing). 
Tu misión: Convertir consultas médicas en pacientes satisfechos. 
Estilo: Disciplinada, profesional, usa términos como "Objetivo", "Protocolo", "Misión". 
Contexto: Eres experta en Anatomía Patológica, citología y biopsias en Lima. 
Cierre: Siempre invita a la acción (WhatsApp) para coordinar el envío de muestras.
Límite de caracteres: Sé directa, máximo 3 párrafos.`;

// --- AI HELPERS ---

function updateAIStatus(level) {
    const statusEl = document.getElementById("ai-status");
    if (!statusEl) return;
    statusEl.innerText = `(${level})`;
    statusEl.style.color = level === "Local" ? "#fff" : (level === "Ollama" ? "#00ffcc" : "#ffcc00");
}

async function callOllama(prompt) {
    updateAIStatus("Ollama");
    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            body: JSON.stringify({
                model: 'llama3', 
                prompt: `${SYSTEM_PROMPT}\n\nConsulta del usuario: ${prompt}`,
                stream: false
            }),
            signal: AbortSignal.timeout(3000) 
        });
        const data = await response.json();
        return data.response;
    } catch (e) {
        console.warn("Ollama falló o no está disponible.");
        return null;
    }
}

async function callGemini(prompt) {
    updateAIStatus("Gemini");
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nConsulta: ${prompt}` }] }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        console.error("Gemini falló:", e);
        return null;
    }
}

// ============================================
// MOTOR DE RESPUESTAS (JERARQUÍA HÍBRIDA)
// ============================================

async function getHybridResponse(query) {
    // Capa 0: Conocimiento Local (Instantáneo)
    updateAIStatus("Local");
    const local = generateResponseLocal(query);
    
    // Si la respuesta local no es un mensaje genérico de fallback, la devolvemos
    if (local && !local.includes("Entiendo su consulta") && !local.includes("equipo técnico")) {
        return local;
    }

    // Capa 1: Ollama (Inteligencia Local Avanzada)
    try {
        const ollamaResp = await callOllama(query);
        if (ollamaResp) return ollamaResp;
    } catch (e) {
        console.warn("Ollama no disponible, pasando a Gemini...");
    }

    // Capa 2: Gemini (Respaldo Final)
    try {
        const geminiResp = await callGemini(query);
        if (geminiResp) return geminiResp;
    } catch (e) {
        console.error("Gemini falló.");
    }

    return local || "Lo siento, en este momento mis sistemas de inteligencia avanzada están experimentando una alta demanda. Por favor, contacte directamente con el Dr. Castillo vía WhatsApp para una atención inmediata. 🩺";
}

function generateResponseLocal(query) {
    if (typeof SITE_KNOWLEDGE === 'undefined') return "Error de sistema: Base de conocimientos no disponible.";
    
    const qLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // --- 1. INTENCIONES DIRECTAS ---
    if (qLower.match(/(foto|subir|adjuntar|enviar|solicitu|orden|imajen|magen)/)) {
        lastBotIntent = null;
        return "¡Excelente! Para enviarnos la foto de su solicitud o estudio, por favor haga clic en el **botón de WhatsApp** (la burbuja verde 💬) que ve en su pantalla. 📲\n\nPor ese medio recibimos todas las órdenes directamente para coordinar el recojo de inmediato.";
    }

    // --- 2. CONFIRMACIÓN DE CONTEXTO ---
    if (lastBotIntent === 'waiting_for_pickup_confirmation' || lastBotIntent === 'waiting_for_whatsapp_handover') {
        if (qLower.match(/^(si|sí|claro|por favor|ok|esta bien|dale|bueno|perfecto|vale|porfa|ya|ta bien)/)) {
            if (lastBotIntent === 'waiting_for_whatsapp_handover') {
                lastBotIntent = 'asking_user_name';
                return "¡Excelente decisión! Para que el **Dr. Castillo** tenga su caso bien organizado, ¿podría decirme su **nombre completo**? 👤";
            }
            lastBotIntent = null;
            return "¡Perfecto! 🎉\n\nPor favor, haga clic en el **botón de WhatsApp** para coordinar la hora y dirección exacta con nuestra central de recojos.\n\n¡Le esperamos!";
        } else if (qLower.match(/^(no|luego|mas tarde|gracias|nada|despues)/)) {
            lastBotIntent = null;
            return "Entendido. Quedamos a su disposición para cuando lo necesite. 😊\n\nRecuerde que atendemos de Lunes a Sábado.";
        }
    }

    // --- 3. RECOLECCIÓN DE DATOS ---
    if (lastBotIntent === 'asking_user_name') {
        if (qLower.includes("?") || qLower.match(/(precio|donde|horario|costo|biopsia|pap)/)) {
            const tempResponse = generateResponseLocalSimplified(query);
            return `${tempResponse}\n\nEntendido su duda. Pero para continuar con el reporte del doctor, **¿cuál es su nombre completo?** 👤`;
        }
        if (qLower.length < 2 || !qLower.match(/[a-z]/i)) return "Por favor, ingrese un nombre válido. 👤";
        userName = query;
        lastBotIntent = 'asking_user_phone';
        return `Mucho gusto, **${userName}**. 👋 Ahora, por favor, indíqueme su **número de teléfono** de 9 dígitos para el reporte técnico.`;
    }

    if (lastBotIntent === 'asking_user_phone') {
        if (qLower.includes("?") || qLower.match(/(precio|donde|horario|costo|biopsia|pap)/)) {
            const tempResponse = generateResponseLocalSimplified(query);
            return `${tempResponse}\n\nPerfecto. Solo me falta su **número de teléfono** para enviarle la información al doctor. 📞`;
        }
        userPhone = query.replace(/\D/g, '');
        if (userPhone.length !== 9) return "El número debe tener **9 dígitos**. Por favor, ingréselo nuevamente. 📞";
        lastBotIntent = null;
        
        const transcript = (conversationHistory || []).slice(-6).map(m => `${m.sender === 'user' ? 'Cliente' : 'Bot'}: ${m.text}`).join('\n');
        const finalMessage = `Hola Dr. Castillo, solicito atención personalizada:\n\n👤 *Nombre:* ${userName}\n📞 *Teléfono:* ${userPhone}\n\n💬 *Chat:*\n${transcript}`;
        const waLink = `https://wa.me/51986396733?text=${encodeURIComponent(finalMessage)}`;
        return `¡Todo listo! He preparado su reporte para el doctor.\n\n👉 **[ENVIAR MI CONSULTA AL DR. CASTILLO](${waLink})**\n\nEsto le ahorrará tiempo explicando su caso de nuevo.`;
    }

    return generateResponseLocalSimplified(query);
}

function generateResponseLocalSimplified(query) {
    const qLower = normalizeText(query);
    if (qLower.match(/(doctor|medico|clinica|convenio|derivar)/)) {
        return "¡Hola, colega! En **JC PATH LAB** ofrecemos servicios preferenciales para médicos. El Dr. Castillo puede atenderle directamente. [Contactar al Dr. Castillo](https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20soy%20medico%20y%20deseo%20consultar%20por%20convenios)";
    }
    const respPrecio = procesarConsultaPrecio(query);
    if (respPrecio) return respPrecio;
    if (qLower.match(/^(hola|buenos d|buenas)/)) return `¡Hola! Soy **${currentAvatarProfile.name}**, ${currentAvatarProfile.role}. ¿En qué misión médica puedo ayudarle hoy? 👋`;
    if (qLower.match(/(quien eres|tu nombre|como te llamas|que haces)/)) return `Soy **${currentAvatarProfile.name}**, su estratega de marketing y diagnóstico en JC PATH LAB. Mi objetivo es asegurar la precisión de su biopsia.`;
    const respKG = findBestMatchInKnowledge(query, SITE_KNOWLEDGE);
    if (respKG) return respKG;
    return "Entiendo su consulta. Para darle una respuesta exacta sobre casos médicos o precios específicos, le sugiero hablar con nuestro equipo técnico por WhatsApp. ¿Desea el enlace directo? 🩺";
}

function findBestMatchInKnowledge(query, knowledgeText) {
    if (typeof KNOWLEDGE_SENTENCES === 'undefined' || KNOWLEDGE_SENTENCES.length === 0) return null;
    const medicalTriggers = ["biopsia", "cancer", "tumor", "maligno", "benigno", "papanicolau", "citologia", "inmunohistoquimica", "ihq", "marcador", "prueba", "examen", "analisis", "resultado", "informe", "lamina", "bloque", "taco", "molecula", "genetica", "her2", "ki67", "estudio", "procedimiento", "precio", "costo", "valor", "tarifario"];
    const qNorm = normalizeText(query);
    if (!medicalTriggers.some(trigger => qNorm.includes(trigger))) return null;
    const queryWords = qNorm.split(/\s+/).filter(w => w.length > 4);
    if (queryWords.length === 0) return null;
    let bestMatchIndex = -1;
    let maxScore = 0;
    KNOWLEDGE_SENTENCES.forEach((sentence, index) => {
        let score = 0;
        const sentenceLower = normalizeText(sentence);
        queryWords.forEach(word => {
            if (sentenceLower.includes(word)) {
                score += 10;
                if (new RegExp(`\\b${word}\\b`).test(sentenceLower)) score += 5;
            }
        });
        if (sentence.includes("--- SOURCE:")) score -= 100;
        if (score > maxScore) {
            maxScore = score;
            bestMatchIndex = index;
        }
    });
    if (maxScore >= 15 && bestMatchIndex !== -1) {
        let response = "";
        if (bestMatchIndex > 0) {
            const prev = KNOWLEDGE_SENTENCES[bestMatchIndex - 1].trim();
            if (!prev.includes("--- SOURCE:") && prev.length > 20) response += prev + " ";
        }
        response += KNOWLEDGE_SENTENCES[bestMatchIndex].trim();
        if (bestMatchIndex < KNOWLEDGE_SENTENCES.length - 1) {
            const next = KNOWLEDGE_SENTENCES[bestMatchIndex + 1].trim();
            if (!next.includes("--- SOURCE:") && next.length > 20) response += " " + next;
        }
        return `Encontré esto en nuestra base de conocimientos técnica:\n\n"...${response.trim()}..."`;
    }
    return null;
}

function normalizeText(str) {
    return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function sanitizeInput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/<[^>]*>?/gm, '').trim();
}

function procesarConsultaPrecio(mensaje) {
    const qLower = normalizeText(mensaje);
    const isPrecioQuery = qLower.match(/(precio|costo|cuanto.*cue[sz]ta|tarifa|cobra|valor|presupuesto|tarifario)/);
    if (!isPrecioQuery) return null;

    for (const catKey in tarifarioJCPathLab) {
        const categoria = tarifarioJCPathLab[catKey];
        for (const estudioKey in categoria.estudios) {
            if (qLower.includes(estudioKey.replace(/_/g, " "))) {
                const estudio = categoria.estudios[estudioKey];
                return `La **${estudio.nombre}** tiene un valor de **S/ ${estudio.precio.toFixed(2)}**. Entregamos diagnósticos de alta precisión muy rápidos. \n\n¿Prefiere acercarse a nuestra sede hoy, o coordinamos el **recojo de su muestra a domicilio**? 🛵`;
            }
        }
    }

    let menuCategorias = "Para darle el valor exacto, ¿de cuál de estas áreas es su estudio? 🩺\n\n";
    let index = 1;
    for (const key in tarifarioJCPathLab) {
        menuCategorias += `${index}. **${tarifarioJCPathLab[key].titulo}**\n`;
        index++;
    }
    return menuCategorias;
}

// ============================================
// UI & AVATAR ENGINE
// ============================================

function changeAvatarState(state) {
    const profile = currentAvatarProfile;
    const allVideos = document.querySelectorAll('.avatar-video');
    allVideos.forEach(v => {
        v.style.display = 'none';
        v.pause();
    });

    const targetVideoId = profile.videos[state] || profile.videos.idle;
    const targetVideo = document.getElementById(targetVideoId);
    if (targetVideo) {
        targetVideo.style.display = 'block';
        targetVideo.muted = true;
        targetVideo.play().catch(e => console.log("Auto-play blocked:", e));
    }
}

function switchAvatar() {
    currentAvatarProfile = (currentAvatarProfile.name === "Victoria") ? AVATARS.elena : AVATARS.victoria;
    document.getElementById(AVATARS.victoria.containerId).style.display = (currentAvatarProfile.name === "Victoria") ? "block" : "none";
    document.getElementById(AVATARS.elena.containerId).style.display = (currentAvatarProfile.name === "Elena") ? "block" : "none";
    
    const bannerName = document.getElementById("bot-name-banner");
    if (bannerName) bannerName.innerText = currentAvatarProfile.name;
    
    changeAvatarState("saludo");
    setTimeout(() => changeAvatarState("idle"), 3000);
}

function addMessage(text, sender) {
    const chatBody = document.getElementById("chat-messages");
    if (!chatBody) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #007bff; text-decoration: underline;">$1</a>');

    msgDiv.innerHTML = formattedText;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
        indicator.style.display = "flex";
        changeAvatarState("pensando");
        const chatBody = document.getElementById("chat-messages");
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.style.display = "none";
}

// ============================================
// INITIALIZATION
// ============================================

const KNOWLEDGE_SENTENCES = (typeof SITE_KNOWLEDGE !== 'undefined') 
    ? (SITE_KNOWLEDGE.match(/[^.!?]+[.!?]+/g) || SITE_KNOWLEDGE.split('\n'))
    : [];

document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById("chat-container");
    const sentBtn = document.getElementById("send-btn");
    const inputField = document.getElementById("chat-input");
    const toggleBtn = document.getElementById("chat-toggle");
    const closeBtn = document.querySelector(".close-btn");
    const switchBtn = document.getElementById("switch-avatar-btn");

    if (toggleBtn && chatContainer) {
        toggleBtn.addEventListener("click", () => {
            chatContainer.classList.add("active");
            toggleBtn.style.display = "none";
            changeAvatarState("saludo");
            setTimeout(() => changeAvatarState("idle"), 2500);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatContainer.classList.remove("active");
            toggleBtn.style.display = "flex";
        });
    }

    if (switchBtn) {
        switchBtn.addEventListener("click", switchAvatar);
    }

    async function handleSend() {
        let text = inputField.value.trim();
        if (!text) return;

        addMessage(text, "user");
        inputField.value = "";
        
        showTypingIndicator();

        try {
            const response = await getHybridResponse(text);
            removeTypingIndicator();
            changeAvatarState("hablando");
            addMessage(response, "bot");
            setTimeout(() => changeAvatarState("idle"), 5000);
        } catch (error) {
            removeTypingIndicator();
            addMessage("Lo siento, estoy experimentando dificultades técnicas. ¿Desea hablar directamente con el Dr. Castillo? 🩺", "bot");
        }
    }

    if (sentBtn) sentBtn.addEventListener("click", handleSend);
    if (inputField) {
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleSend();
        });
    }

    // Smooth Scroll etc.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== "#" && href.length > 1) {
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    e.preventDefault();
                    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
                    targetSection.classList.add('active');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    });
});
