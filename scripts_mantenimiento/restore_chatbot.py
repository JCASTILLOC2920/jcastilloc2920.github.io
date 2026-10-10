import os
import glob
import json

# Configuration
base_dir = os.path.dirname(os.path.abspath(__file__))
chatbot_js_path = os.path.join(base_dir, 'chatbot.js')

# The Gemeni/Chatbot Logic (Spanish)
gemini_logic = r"""
// ============================================
// CONFIGURACIÓN DE INTELIGENCIA ARTIFICIAL (GEMINI)
// ============================================

// API KEY proporcionada por el usuario
const GEMINI_API_KEY = "AIzaSyDHCunorqlW9aXjMYIrMsGK6KsxEm1GC7o"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// --- ESTADO DEL CHAT ---
let conversationHistory = [];
// Datos que queremos recolectar proactivamente
let userDetails = {
    name: null,
    sample: null,
    address: null,
    phone: null
};

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    initChatbotUI();
});

function initChatbotUI() {
    const chatBody = document.getElementById("chat-messages");
    const inputField = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const toggleBtn = document.getElementById("chat-toggle");
    const closeBtn = document.querySelector(".close-btn");
    const chatContainer = document.getElementById("chat-container");

    // Event Listeners
    if (toggleBtn && chatContainer) {
        toggleBtn.addEventListener("click", () => {
            chatContainer.classList.toggle("open");
        });
    }

    if (closeBtn && chatContainer) {
        closeBtn.addEventListener("click", () => {
            chatContainer.classList.remove("open");
        });
    }

    if (inputField && sendBtn) {
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleUserMessage();
        });
        sendBtn.addEventListener("click", handleUserMessage);
    }
    
    // Saludo Inicial
    setTimeout(() => {
        addMessage("¡Hola! 😊 Soy el Asistente Virtual del Dr. Castillo. Mi misión es ayudarte con información sobre biopsias, precios y coordinar el recojo de muestras. ¿En qué puedo ayudarte hoy?", "bot");
    }, 1000);
}

// --- LÓGICA DEL CHAT ---

async function handleUserMessage() {
    const inputField = document.getElementById("chat-input");
    if (!inputField) return;
    const userText = inputField.value.trim();
    if (!userText) return;

    // Mostrar mensaje del usuario
    addMessage(userText, "user");
    inputField.value = "";
    
    // Mostrar indicador "Escribiendo..."
    showTypingIndicator();

    try {
        // Llamada a la API de Gemini
        const aiResponse = await callGeminiAPI(userText);
        removeTypingIndicator();
        
        // Procesar respuesta de la IA (detectar si hay comando oculto de LEAD)
        // Buscamos algo tipo [[READY_LEAD: {...}]] si la IA fuera muy avanzada,
        // pero por ahora mostraremos la respuesta tal cual.
        
        addMessage(aiResponse, "bot");
        
        // Verificar si la conversación está madura para ofrecer WhatsApp
        checkLeadCompletion();
        
    } catch (error) {
        console.error("AI Error:", error);
        removeTypingIndicator();
        addMessage("Lo siento, tuve un pequeño error de conexión. 😔 ¿Podrías intentar preguntar de nuevo? O si prefieres, escríbenos al WhatsApp.", "bot");
    }
}

function addMessage(text, sender) {
    const chatBody = document.getElementById("chat-messages");
    if (!chatBody) return;
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    
    // Formateo básico de Markdown (Negritas)
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convertir saltos de línea
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    msgDiv.innerHTML = formattedText;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Agregar al historial para mantener contexto
    conversationHistory.push({ role: sender === "user" ? "user" : "model", parts: [{ text: text }] });
}

function showTypingIndicator() {
    const chatBody = document.getElementById("chat-messages");
    if (!chatBody) return;
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.classList.add("message", "bot-message");
    typingDiv.style.display = "block"; // Asegurar visibilidad
    typingDiv.innerHTML = "<em>Escribiendo...</em>";
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
}

// --- INTERACCIÓN CON GEMINI API ---

async function callGeminiAPI(userMessage) {
    
    // Construcción del Prompt del Sistema
    // Inyectamos el conocimiento del sitio (definido al inicio del archivo)
    
    // Truncamos el conocimiento si es muy largo para no exceder tokens (seguridad básica)
    const knowledgeSnippet = (typeof SITE_KNOWLEDGE !== 'undefined') 
        ? SITE_KNOWLEDGE.substring(0, 40000) 
        : "No hay conocimiento cargado.";

    const systemInstruction = `
ERES: El Asistente Virtual IA del laboratorio "JC PATH LAB" del Dr. Josehp Castillo.
TU PERSONALIDAD: Amable, empático, profesional, paciente y muy servicial. Eres un experto en patología y biopsias.
IDIOMA: Español (Siempre responde en español).

TU OBJETIVO PRINCIPAL: Responder dudas usando el conocimiento del sitio web Y intentar recolectar datos para coordinar un servicio.

CONOCIMIENTO DEL SITIO WEB (BASE DE DATOS):
${knowledgeSnippet}

INSTRUCCIONES DE RECOLECCIÓN DE DATOS:
Intenta obtener estos 4 datos de forma conversacional (no interrogatorio):
1. NOMBRE COMPLETO
2. TIPO DE MUESTRA (¿Qué estudio necesita?)
3. DIRECCIÓN EXACTA (Para referencia/recojo)
4. TELÉFONO

REGLAS:
- Si preguntan precios, búscalos en el texto.
- No diagnostiques enfermedades ("No soy médico, pero el Dr. Castillo revisará su caso").
- Sé conciso y usa emojis.
- Si detectas que el usuario ya dio toda la info o quiere contactar, sugiere el botón de WhatsApp.

IMPORTANTE: Si el usuario te da sus datos (Nombre, dirección, teléfono), CONFIRMA que los recibiste y dile que haga clic en el botón de WhatsApp para finalizar.
`;

    const requestBody = {
        contents: [
            { role: "user", parts: [{ text: systemInstruction }] }, // System Prompt Hack
            ...conversationHistory,
            { role: "user", parts: [{ text: userMessage }] }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
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
    
    return data.candidates[0].content.parts[0].text;
}

function checkLeadCompletion() {
    // Si la conversación es larga, recordamos el WhatsApp
    if (conversationHistory.length > 8) {
        // Podríamos inyectar un mensaje del sistema o resaltar el botón
    }
}
"""

def get_clean_text_content(file_path):
    """Reads a file trying multiple encodings and returns clean text."""
    # Priority: utf-8, then latin-1. 
    # 'utf-8-sig' handles BOM automatically.
    encodings = ['utf-8-sig', 'utf-8', 'latin-1', 'cp1252']
    
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.read()
                # Basic cleanup of null bytes if any behave weirdly
                content = content.replace('\x00', '')
                return content
        except (UnicodeDecodeError, TypeError):
            continue
    return ""

def build_knowledge_base():
    """Scrapes all HTML files and builds the knowledge string safely."""
    knowledge_parts = []
    html_files = glob.glob(os.path.join(base_dir, '*.html'))
    
    for file_path in html_files:
        filename = os.path.basename(file_path)
        content = get_clean_text_content(file_path)
        
        # Simple extraction: Remove HTML tags partially or just dump text
        # For robustness, let's keep it simple: just collapse spaces
        clean_text = " ".join(content.split())
        
        # Add to knowledge list
        knowledge_parts.append(f"--- FILE: {filename} ---\n{clean_text}")
    
    # Use json.dumps to safely escape everything for JS
    # This turns the python string into a valid JSON string literal (with quotes)
    full_text = "\n".join(knowledge_parts)
    json_string = json.dumps(full_text) 
    return json_string

def restore():
    print("Regenerating Knowledge Base (Safe Mode)...")
    knowledge_json_string = build_knowledge_base()
    
    # Construct the JS variable declaration.
    # Note: json.dumps returns a string like '"content"', so we don't need extra quotes.
    js_knowledge_decl = f"const SITE_KNOWLEDGE = {knowledge_json_string};\n"
    
    final_content = js_knowledge_decl + "\n" + gemini_logic
    
    with open(chatbot_js_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print(f"chatbot.js restored! Size: {len(final_content)} bytes")

if __name__ == "__main__":
    restore()
