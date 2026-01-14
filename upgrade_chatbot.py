
import os

# Paths
base_dir = r"c:\Users\josehp\Desktop\paginas web\jcastilloc2920.github.io-index.html"
knowledge_file = os.path.join(base_dir, "site_knowledge.js")
chatbot_file = os.path.join(base_dir, "chatbot.js")

# The specialized Gemini Chatbot Logic
gemini_logic = r"""

// --- GEMINI AI CONFIGURATION ---
// ADVERTENCIA DE SEGURIDAD: Esta API Key es de prueba/uso gratuito. 
// Para mayor seguridad en producción, deberías usar un backend proxy.
// Por ahora, usamos la implementación directa (Client-Side) como solicitado.
const API_KEY = "TU_API_KEY_DE_GEMINI_AQUI"; // <--- EL USUARIO DEBE PONER SU LLAVE AQUÍ
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// --- STATE MANAGEMENT ---
let conversationHistory = [];
let userDetails = {
    name: null,
    sample: null,
    address: null,
    phone: null
};

// --- DOM ELEMENTS (Wait for load) ---
document.addEventListener("DOMContentLoaded", () => {
    // Initialize UI
    initChatbotUI();
});

function initChatbotUI() {
    const chatBody = document.getElementById("chat-body");
    const inputField = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    // Add event listeners if elements exist
    if (inputField && sendBtn) {
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleUserMessage();
        });
        sendBtn.addEventListener("click", handleUserMessage);
    }
    
    // Initial Greeting
    setTimeout(() => {
        addMessage("¡Hola! 😊 Soy el Asistente Virtual del Dr. Castillo. Mi misión es ayudarte con información sobre biopsias, precios y coordinar el recojo de muestras. ¿En qué puedo ayudarte hoy?", "bot");
    }, 1000);
}

// --- CORE CHAT FUNCTIONS ---

async function handleUserMessage() {
    const inputField = document.getElementById("user-input");
    const userText = inputField.value.trim();
    if (!userText) return;

    // Display User Message
    addMessage(userText, "user");
    inputField.value = "";
    
    // Show typing indicator
    showTypingIndicator();

    // Call AI
    try {
        const aiResponse = await callGeminiAPI(userText);
        removeTypingIndicator();
        addMessage(aiResponse, "bot");
        
        // Check if we have complete lead info to show WhatsApp Button
        checkLeadCompletion();
        
    } catch (error) {
        console.error("AI Error:", error);
        removeTypingIndicator();
        addMessage("Lo siento, tuve un pequeño error de conexión. 😔 ¿Podrías intentar preguntar de nuevo? O si prefieres, escríbenos al WhatsApp.", "bot");
    }
}

function addMessage(text, sender) {
    const chatBody = document.getElementById("chat-body");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    
    // Parse Markdown-like links or bold text if needed (Basic implementation)
    // For now, plain text is safer to prevent XSS, but we can allow basic formatting
    // Converting **text** to <strong>text</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    msgDiv.innerHTML = formattedText;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Add to history
    conversationHistory.push({ role: sender === "user" ? "user" : "model", parts: [{ text: text }] });
}

function showTypingIndicator() {
    const chatBody = document.getElementById("chat-body");
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.classList.add("message", "bot-message");
    typingDiv.innerHTML = "<em>Escribiendo...</em>";
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
}

// --- INTELLIGENCE & API ---

async function callGeminiAPI(userMessage) {
    
    // System Prompt construction
    // We inject the SITE_KNOWLEDGE here
    const systemInstruction = `
ERES: El Asistente Virtual IA del laboratorio "JC PATH LAB" del Dr. Josehp Castillo.
TU PERSONALIDAD: Amable, empático, profesional, paciente y muy servicial. Eres un experto en patología y biopsias.
TU OBJETIVO PRINCIPAL: Responder dudas usando el conocimiento del sitio web Y recolectar los datos del cliente para una venta/servicio.

CONOCIMIENTO DEL SITIO WEB (ÚSALO COMO TU FUENTE DE VERDAD):
${typeof SITE_KNOWLEDGE !== 'undefined' ? SITE_KNOWLEDGE.substring(0, 30000) + "... [Truncado por seguridad de token]" : "No se cargó el conocimiento."}

INSTRUCCIONES DE RECOLECCIÓN DE DATOS (IMPORTANTE):
Tu meta oculta es conseguir estos 4 datos para coordinar el servicio, pero debes pedirlos de forma natural durante la conversación, no todos de golpe como un robot.
1. NOMBRE COMPLETO
2. TIPO DE MUESTRA (¿Qué biopsia es? ¿Piel, estómago, papanicolaou?)
3. DIRECCIÓN EXACTA (Para recojo o referencia)
4. TELÉFONO DE CONTACTO

REGLAS DE INTERACCIÓN:
- Si te preguntan precios, búscalos en el texto proporcionado. Si dice "Consultar", di que depende del caso y pide detalles.
- Si te preguntan temas médicos, responde con base en los artículos del Dr. Castillo que leíste, pero SIEMPRE aclara que "como IA no puedo diagnosticar, pero el Dr. Castillo revisará tu caso".
- Al final de tus respuestas, intenta sutilmente pedir uno de los datos faltantes si el usuario muestra interés en un servicio. Ej: "¿Para qué paciente sería el estudio?" o "¿En qué distrito te encuentras para ver la cobertura?".

FORMATO DE RESPUESTA:
- Usa emojis ocasionalmente (😊, 🔬).
- Sé breve y directo.
- Si ya tienes TODOS los 4 datos (Nombre, Muestra, Dirección, Teléfono), GENERA UN MENSAJE FINAL confirmando y sugiriendo contactar por WhatsApp.
`;

    const requestBody = {
        contents: [
            { role: "user", parts: [{ text: systemInstruction }] }, // System prompt as first user msg hack (or use system_instruction if model supports)
            ...conversationHistory, // Previous context
            { role: "user", parts: [{ text: userMessage }] }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
        }
    };

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    const reply = data.candidates[0].content.parts[0].text;
    
    // Internal Logic: Try to extract data from user message (Basic Regex or better, ask AI to format it JSON in future)
    // For now, we rely on the conversation flow. We can add a "Data Extraction" pass later if needed.
    
    return reply;
}

function checkLeadCompletion() {
    // This is a simplified check. In a real heavy AI app, we would ask the AI to output a JSON flag.
    // Given client-side constraints, we trust the AI to drive the conversation to the WhatsApp point.
    // However, we can add a persistent button "Enviar pedido por WhatsApp" if the conversation gets long.
    
    if (conversationHistory.length > 6) {
        // Show the WhatsApp CTA if conversation is engaged
        const headers = document.querySelectorAll(".whatsapp-float");
        // Ensure buttons keep pulsating or explicitly suggest clicking them
    }
}
"""

print("Reading Knowledge Base...")
try:
    with open(knowledge_file, 'r', encoding='utf-8') as f:
        knowledge_content = f.read()
except FileNotFoundError:
    print("Error: site_knowledge.js not found. Run build_knowledge.py first.")
    knowledge_content = 'const SITE_KNOWLEDGE = "Error: Knowledge base missing.";'

print("Merging and creating new chatbot.js...")
final_content = knowledge_content + "\n" + gemini_logic

with open(chatbot_file, 'w', encoding='utf-8') as f:
    f.write(final_content)

print(f"Successfully upgraded chatbot.js. Total size: {len(final_content)} bytes.")

