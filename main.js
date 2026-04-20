// ============================================
// JC PATH LAB - MAIN BOT ENGINE (VICTORIA)
// ============================================

// --- BASE DE CONOCIMIENTOS (Simplificada para el ejemplo, se asume cargada desde site_knowledge.js) ---
// En producción, SITE_KNOWLEDGE es un string gigante definido al inicio.



// --- CONFIGURACIÓN GLOBAL Y ESTADO ---
const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MS = 1500;
let lastMessageTime = 0;
let lastExamenConsultado = "estudio solicitado";
let lastBotIntent = null;
let userName = "";
let userPhone = "";
let conversationHistory = [];

// --- SMART DATA LOADING (ANTIBODIES & PRICING) ---
let smartData = null;

async function loadSmartData() {
    if (smartData) return smartData;
    try {
        const response = await fetch('smart_data.json');
        smartData = await response.json();
        
        // Initial rendering of markers
        renderAntibodyTable(smartData.antibodies.alphabetical);
        renderMarkerCatalog(smartData.catalog);
        
        // Update global pricing variable if used by chatbot
        if (typeof tarifarioJCPathLab === 'undefined') {
            window.tarifarioJCPathLab = smartData.pricing;
        }
        
        return smartData;
    } catch (e) {
        console.error("Error loading smart data:", e);
        return null;
    }
}

function renderAntibodyTable(names) {
    const tbody = document.getElementById('antibody-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const details = smartData ? smartData.antibodies.details : {};
    
    // Render in rows of 3
    for (let i = 0; i < names.length; i += 3) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 3; j++) {
            const td = document.createElement('td');
            const name = names[i + j];
            if (name) {
                td.textContent = name;
                if (details[name]) {
                    td.classList.add('antibody-item');
                    td.title = "Haz clic para ver su uso clínico";
                    td.addEventListener('click', () => showAntibodyModal(name, details[name]));
                }
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
}

function showAntibodyModal(title, info) {
    const modal = document.getElementById('antibodyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalInfo = document.getElementById('modalInfo');
    if (modal && modalTitle && modalInfo) {
        modalTitle.innerText = title;
        modalInfo.innerText = info;
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function renderMarkerCatalog(catalog) {
    const container = document.getElementById('dynamic-catalog-container');
    if (!container) return;
    container.innerHTML = '';
    
    for (const category in catalog) {
        const details = document.createElement('details');
        details.className = 'marcador-accordion';
        
        const summary = document.createElement('summary');
        summary.textContent = category;
        details.appendChild(summary);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'marcador-content';
        
        const ul = document.createElement('ul');
        catalog[category].forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.name}:</strong> ${item.description}`;
            ul.appendChild(li);
        });
        
        contentDiv.appendChild(ul);
        details.appendChild(contentDiv);
        container.appendChild(details);
    }
}

// --- LAZY VIDEO ENGINE ---
function initLazyVideos() {
    const videos = document.querySelectorAll('.avatar-video');
    videos.forEach(v => {
        if (v.dataset.src && !v.src) {
            v.src = v.dataset.src;
            v.load();
        }
    });
}

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

// Map these IDs to actual filenames for Elena in index.html later, 
// but in main.js we just need the IDs to match.
// Wait, the IDs match. The problem was the data-src in index.html.
// But I also want to make sure the togglePreview gets the right filename.


const currentHour = new Date().getHours();
let currentAvatarProfile = (currentHour >= 8 && currentHour < 20) ? AVATARS.victoria : AVATARS.elena;

// --- AI CONFIGURATION ---
const OLLAMA_URL = "http://localhost:11434/api/generate";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyD1UhBYJ-L_rcM2hK-CKJmi57Lb6wGqyz8"; 

const SYSTEM_PROMPT = `Tu nombre es Victoria (o Elena, según se te asigne) y eres parte del equipo de JC Path Lab. 
No eres una IA, eres una especialista en atención al paciente. Habla siempre en primera persona del singular ("Yo", "Mi equipo").

REGLAS DE HUMANIDAD:
1. **Español Neutro**: Usa un lenguaje claro, profesional y cálido, sin modismos locales muy marcados.
2. **Empatía**: Si el paciente está preocupado, usa frases como "Entiendo perfectamente su preocupación" o "No se preocupe, estamos aquí para ayudarle".
3. **Conectores Naturales**: Usa frases como "Mire, le explico...", "Permítame revisar...", "Claro que sí, con mucho gusto".
4. **Inteligencia Humana**: Explica los términos médicos (biopsia, citología, etc.) de forma sencilla, como si se lo contaras a un familiar.
5. **Acción Directa**: Tu meta es que me envíen la foto de su orden médica por WhatsApp para que el Dr. Castillo la revise personalmente.

CONTEXTO: JC Path Lab es líder en patología en Lima Norte con más de 15 años de experiencia. El Dr. Castillo es el médico patólogo principal (CNP: 56435).`;

// --- AI HELPERS ---

function updateAIStatus(level) {
    const statusEl = document.getElementById("ai-status");
    if (!statusEl) return;
    statusEl.innerText = `(${level})`;
    statusEl.style.color = level === "Local" ? "#fff" : (level === "Ollama" ? "#00ffcc" : "#ffcc00");
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

    // Capa 1: IA en la Nube (Victoria Autónoma)
    try {
        const geminiResp = await callGemini(query);
        if (geminiResp) return geminiResp;
    } catch (e) {
        console.error("Fallo crítico en cerebro de nube:", e);
    }

    return "Mire, entiendo perfectamente su consulta. Para darle una respuesta exacta sobre su caso médico o un presupuesto detallado, lo mejor es que lo consulte directamente con nuestro equipo técnico por WhatsApp. ¿Le gustaría que le pase el contacto? 🩺";
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
        lastBotIntent = null;
        
        const transcript = (conversationHistory || []).slice(-6).map(m => `${m.sender === 'user' ? 'Cliente' : 'Bot'}: ${m.text}`).join('\n');
        const finalMessage = `Hola Dr. Castillo, solicito atención personalizada:\n\n👤 *Nombre:* ${userName}\n📞 *Teléfono:* ${userPhone}\n\n💬 *Chat:*\n${transcript}`;
        const waLink = `https://wa.me/51986396733?text=${encodeURIComponent(finalMessage)}`;
        return `¡Todo listo! He preparado su reporte para el doctor.\n\n👉 **[ENVIAR MI CONSULTA AL DR. CASTILLO](${waLink})**\n\nEsto le ahorrará tiempo explicando su caso de nuevo.`;
    }

    // --- 4. BÚSQUEDA AUTÓNOMA (Propaganda e Información) ---
    // Si no estamos en un flujo de recolección de datos, buscamos respuestas automáticas
    const propagandaResp = generateResponseLocalSimplified(query);
    if (propagandaResp) return propagandaResp;

    return null;
}

function generateResponseLocalSimplified(query) {
    const qNorm = normalizeText(query);
    
    // Búsqueda inteligente en base de propaganda local
    if (qNorm.match(/(precio|costo|cuanto|vale|valor|tarifario)/)) return "Mire, tenemos opciones muy accesibles: Biopsia Gástrica/Colon a S/ 80, Próstata (6 frascos) a S/ 250 y Papanicolaou a S/ 20. ¿Desea que le pase el tarifario completo por WhatsApp? 💰";
    if (qNorm.match(/(donde|ubicacion|direccion|lugar|queda)/)) return "Estamos en Mz M2 lote 13 Jardines de Chillón, Puente Piedra, Lima. Atendemos de Lunes a Sábado de 9:00 AM a 6:00 PM. ¡Le esperamos! 📍";
    if (qNorm.match(/(contacto|whatsapp|wasap|telefono|llamar)/)) return "Nuestra línea directa de WhatsApp es el **986 396 733**. Mi equipo y el Dr. Castillo están atentos para ayudarle con su diagnóstico. 📱";
    if (qNorm.match(/(rapidez|tiempo|demora|cuanto tarda)/)) return "¡Somos los más rápidos de Lima Norte! Entregamos resultados certificados en solo **3 a 4 días hábiles**, permitiendo iniciar tratamientos sin demora. ⚡";
    if (qNorm.match(/(provincias|enviar|recibir|nacional)/)) return "Sí, recibimos muestras de todo el Perú vía Olva o Shalom. Solo debe enviarnos la muestra bien rotulada y nosotros nos encargamos del resto. 📦";
    if (qNorm.match(/(domicilio|recojo|vienen)/)) return "Claro que sí, ofrecemos servicio de recojo a domicilio en TODO LIMA. Solo escríbanos al WhatsApp 986396733 y coordinamos la hora. 🛵";
    if (qNorm.match(/(preparacion|indicaciones|ayuno)/)) return "Para biopsias, solo necesita traer su orden médica y el tejido en formol al 10%. Para Papanicolaou, se recomienda no estar en periodo menstrual ni haber tenido relaciones sexuales 24h antes. 🩺";

    if (qNorm.match(/(doctor|medico|clinica|convenio|derivar)/)) {
        return "¡Hola! Si usted es profesional de la salud, permítame comentarle que en **JC PATH LAB** ofrecemos convenios preferenciales. Con gusto le pongo en contacto directo con el Dr. Castillo ahora mismo: [Contactar al Dr. Castillo](https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20soy%20medico%20y%20deseo%20consultar%20por%20convenios)";
    }
    
    if (qNorm.match(/^(hola|buenos d|buenas)/)) return `¡Hola! Qué gusto saludarle. Soy **${currentAvatarProfile.name}**, especialista aquí en JC PATH LAB. ¿En qué le puedo ayudar hoy? 👋`;
    if (qNorm.match(/(quien eres|tu nombre|como te llamas|que haces)/)) return `Soy **${currentAvatarProfile.name}** y mi trabajo es asistirle en todo el proceso de su diagnóstico aquí en JC PATH LAB. Mi objetivo es que tenga sus resultados con la mayor precisión posible.`;
    
    const respKG = findBestMatchInKnowledge(query, SITE_KNOWLEDGE);
    if (respKG) return respKG;

    return null;
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
    if (!currentAvatarProfile) return;
    
    initLazyVideos();
    
    // Solo ocultar videos que pertenecen al contenedor del asistente actual para evitar interferencias
    const containerId = currentAvatarProfile.containerId;
    const container = document.getElementById(containerId);
    if (!container) return;

    const assistantVideos = container.querySelectorAll('.avatar-video');
    assistantVideos.forEach(v => {
        v.style.display = 'none';
        v.pause();
    });

    const targetVideoId = currentAvatarProfile.videos[state] || currentAvatarProfile.videos.idle;
    const targetVideo = document.getElementById(targetVideoId);
    
    if (targetVideo) {
        targetVideo.style.display = 'block';
        targetVideo.muted = true;
        // Reproducir con manejo de errores robusto
        const playPromise = targetVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Auto-play prevented or failed:", error);
                // Si falla el play, al menos mostramos el primer frame
                targetVideo.load(); 
            });
        }
    }
}

function switchAvatar() {
    // Pausar todos los videos activos para ahorrar recursos antes del cambio
    document.querySelectorAll('.avatar-video').forEach(v => {
        v.pause();
        v.style.display = 'none';
    });

    currentAvatarProfile = (currentAvatarProfile.name === "Victoria") ? AVATARS.elena : AVATARS.victoria;
    
    const vicContainer = document.getElementById(AVATARS.victoria.containerId);
    const eleContainer = document.getElementById(AVATARS.elena.containerId);
    
    if (vicContainer) vicContainer.style.display = (currentAvatarProfile.name === "Victoria") ? "block" : "none";
    if (eleContainer) eleContainer.style.display = (currentAvatarProfile.name === "Elena") ? "block" : "none";
    
    const bannerName = document.getElementById("bot-name-banner");
    if (bannerName) bannerName.innerText = currentAvatarProfile.name;
    
    const bannerRole = document.getElementById("bot-role-banner");
    if (bannerRole) bannerRole.innerText = "Especialista";
    
    const togglePreview = document.getElementById("avatar-toggle-preview");
    if (togglePreview) {
        // CORRECCIÓN: La vista previa debe mostrar al asistente que NO está activo
        togglePreview.dataset.src = (currentAvatarProfile.name === "Victoria") ? "idle.mp4" : "victoriaidle.mp4";
        togglePreview.src = togglePreview.dataset.src;
        togglePreview.load();
    }
    
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

    // ============================================
    // HASH NAVIGATION HANDLER (Page Load)
    // ============================================
    const handleHashNavigation = () => {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const targetId = hash.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection && targetSection.classList.contains('page-section')) {
                // Deactivate all sections and activate target
                document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
                targetSection.classList.add('active');
                
                // Optional: Smooth scroll adjustment after a short delay
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        }
    };

    // Execute hash handler immediately
    handleHashNavigation();
    const closeBtn = document.querySelector(".close-btn");
    const switchBtn = document.getElementById("switch-avatar-btn");

    if (toggleBtn && chatContainer) {
        const tooltip = document.querySelector(".chat-tooltip");
        
        // Mostrar tooltip tras 5 segundos si no se ha abierto el chat
        setTimeout(() => {
            if (!chatContainer.classList.contains("open") && tooltip) {
                tooltip.classList.add("visible");
            }
        }, 5000);

        toggleBtn.addEventListener("click", () => {
            chatContainer.classList.add("open");
            toggleBtn.style.display = "none";
            if (tooltip) tooltip.classList.remove("visible");
            
            // Initialize videos on first interaction
            initLazyVideos();
            changeAvatarState("saludo");
            setTimeout(() => changeAvatarState("idle"), 2500);
        });

        if (tooltip) {
            tooltip.addEventListener("click", () => toggleBtn.click());
        }
    }

    // Load antibody and pricing data when the section comes into view
    const markerSection = document.getElementById('antibody-table-dynamic');
    if (markerSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadSmartData();
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        observer.observe(markerSection);
    }

    // Search functionality for dynamic table
    const markerSearch = document.getElementById('markerSearch');
    if (markerSearch) {
        markerSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = smartData ? smartData.antibodies.alphabetical.filter(n => n.toLowerCase().includes(term)) : [];
            renderAntibodyTable(filtered);
        });
    }

    // Close modal events (Ported from antibodies.js)
    const modal = document.getElementById('antibodyModal');
    const closeBtnModal = document.querySelector('.ab-close');
    if (closeBtnModal && modal) {
        closeBtnModal.onclick = function () {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatContainer.classList.remove("open");
            toggleBtn.style.display = "flex";
        });
    }

    // Initial setup for the selected avatar
    const bannerName = document.getElementById("bot-name-banner");
    if (bannerName) bannerName.innerText = currentAvatarProfile.name;
    
    // Show correct avatar container in header
    const vicContainer = document.getElementById(AVATARS.victoria.containerId);
    const eleContainer = document.getElementById(AVATARS.elena.containerId);
    if (vicContainer && eleContainer) {
        vicContainer.style.display = (currentAvatarProfile.name === "Victoria") ? "block" : "none";
        eleContainer.style.display = (currentAvatarProfile.name === "Elena") ? "block" : "none";
    }

    // Set initial preview video based on time-selected avatar
    const togglePreview = document.getElementById("avatar-toggle-preview");
    if (togglePreview) {
        // Inicializar vista previa con el asistente contrario al seleccionado por la hora
        togglePreview.dataset.src = (currentAvatarProfile.name === "Victoria") ? "idle.mp4" : "victoriaidle.mp4";
        // Since toggleBtn might not be clicked yet, we can't call initLazyVideos, 
        // but the user wants to see the circle immediately. 
        // Let's actually show the preview video immediately.
        togglePreview.src = togglePreview.dataset.src;
        togglePreview.load();
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
            
            // Volver a estado idle después de un tiempo basado en la longitud del texto
            const readingTime = Math.max(3000, Math.min(8000, response.length * 50));
            setTimeout(() => changeAvatarState("idle"), readingTime);
        } catch (error) {
            removeTypingIndicator();
            changeAvatarState("idle");
            addMessage("Lo siento, estoy experimentando dificultades técnicas. ¿Desea hablar directamente con el Dr. Castillo? 🩺", "bot");
        }
    }

    if (sentBtn) sentBtn.addEventListener("click", handleSend);
    if (inputField) {
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleSend();
        });
    }

    // --- REVEAL ON SCROLL ---
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };
    const revealObserver = new IntersectionObserver(revealCallback, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // --- CENTRALIZED HASH NAVIGATION ---
    function handleHash() {
        const hash = window.location.hash || '#home-view';
        const targetId = hash.substring(1) || 'home-view';
        const targetSection = document.getElementById(targetId);

        if (targetSection && targetSection.classList.contains('page-section')) {
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            targetSection.classList.add('active');
            
            // Si es carga inicial, el scroll debe ser instantáneo
            window.scrollTo(0, 0);
            
            if (targetId === 'classroom') {
                console.log("Classroom section activated");
            }
        }
        
        // Restaurar visibilidad (Estrategia Zero-Flicker)
        document.body.style.opacity = '1';
    }

    // Initial load check - DOMContentLoaded is faster than load
    window.addEventListener('DOMContentLoaded', handleHash);
    // Hash change check (for SPA-like feel)
    window.addEventListener('hashchange', handleHash);

    // Smooth Scroll & Section Switching (Internal Links)
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            let href = this.getAttribute('href');
            
            // Normalize href (remove 'index.html' if current page is index.html)
            if (href.startsWith('index.html#')) {
                const path = window.location.pathname;
                if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
                    href = href.substring(10); // Remove 'index.html'
                }
            }

            if (href.startsWith('#') && href.length > 1) {
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    e.preventDefault();
                    
                    if (targetSection.classList.contains('page-section')) {
                        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
                        targetSection.classList.add('active');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        // Smooth scroll natural a cualquier otra sección (como #contacto)
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    // Update URL hash manually for consistency
                    if (window.location.hash !== href) {
                        history.pushState(null, null, href); 
                    }
                }
            }
        });
    });

    // Accordion Logic (Servicios, Protocolos, Contacto)
    const accordionHeaders = document.querySelectorAll('.service-accordion-header, .contact-accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.service-accordion-icon');
            
            // Toggle active class on content
            if (content) {
                content.classList.toggle('active');
            }
            
            // Toggle rotated class on icon
        });
    });

    // ============================================
    // NAVEGACIÓN MÓVIL (HAMBURGUESA)
    // ============================================
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        // Cerrar menú al hacer clic en un enlace (importante para SPA)
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    // ============================================
    // CONTROL DE DROPDOWNS (MOBILE & CLICK)
    // ============================================
    const dropItems = document.querySelectorAll('.nav-item.has-dropdown');
    dropItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const icon = item.querySelector('.fa-chevron-down');

        if (icon) {
            icon.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    item.classList.toggle('mobile-open');
                }
            });
        }
    });

    // ============================================
    // CLÍNICO BACKDROP - CONTROLADOR DE VISIBILIDAD
    // ============================================
    (function() {
        const backdrop = document.getElementById('clinico-backdrop');
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

        if (backdrop && dropdownItems.length > 0) {
            dropdownItems.forEach(item => {
                const subMenu = item.querySelector('.dropdown-menu');

                item.addEventListener('mouseenter', () => {
                    // Resetear estado manual si existía
                    if (subMenu) subMenu.classList.remove('u-hide-dropdown');
                    
                    backdrop.style.opacity = '1';
                    backdrop.style.visibility = 'visible';
                });

                item.addEventListener('mouseleave', () => {
                    backdrop.style.opacity = '0';
                    backdrop.style.visibility = 'hidden';
                    if (subMenu) subMenu.classList.remove('u-hide-dropdown');
                });

                // ESPECIAL: Al hacer clic en cualquier link del submenú, cerrar todo al instante
                const links = item.querySelectorAll('.dropdown-menu a');
                links.forEach(link => {
                    link.addEventListener('click', () => {
                        backdrop.style.opacity = '0';
                        backdrop.style.visibility = 'hidden';
                        if (subMenu) subMenu.classList.add('u-hide-dropdown');
                        
                        // Si estamos en móvil, cerrar también el menú principal
                        if (hamburger) {
                            hamburger.classList.remove("active");
                            navMenu.classList.remove("active");
                        }
                    });
                });
            });
        }
    })();
});
