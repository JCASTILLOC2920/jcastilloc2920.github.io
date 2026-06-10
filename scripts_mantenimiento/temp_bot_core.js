// --- ESTADO Y CONFIGURACIÓN DEL ASISTENTE (JCPatbot Core) ---
const JCPatbot = {
    state: {
        lastExamenConsultado: "estudio solicitado",
        conversationHistory: [],
        currentAvatar: {
            name: "Victoria",
            role: "Coordinadora de Atención IA",
            state: "idle"
        },
        isProcessing: false,
        knowledgeIndex: [] // Conocimiento estructurado
    },

    config: {
        MAX_HISTORY: 12,
        API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        API_KEY: "41457466",
        SYSTEM_PROMPT: `Eres "Victoria", la Coordinadora de Atención IA de JC PATH LAB.
TU MISIÓN: Orientar pacientes, dar precios exactos y coordinar recojos.
REGLAS DE ORO:
1. Usa el conocimiento adjunto. Si no está ahí, di que consultarás con el Dr. Castillo.
2. Nunca inventes precios. Usa el tarifario estructurado.
3. Si el paciente quiere agendar, usa el botón de WhatsApp.
4. Mantén tono profesional, empático y médico.`
    },

    init() {
        console.log("JCPatbot: Iniciando sistema grado militar...");
        this.indexKnowledge();
    },

    indexKnowledge() {
        if (typeof SITE_KNOWLEDGE === 'undefined') return;
        const sections = SITE_KNOWLEDGE.split('--- SOURCE:');
        this.state.knowledgeIndex = sections
            .filter(s => s.trim())
            .map(s => {
                const parts = s.split(' ---');
                return {
                    source: parts[0] ? parts[0].trim() : "Unknown",
                    content: parts[1] ? parts[1].trim() : ""
                };
            });
        console.log(`JCPatbot: ${this.state.knowledgeIndex.length} fuentes indexadas.`);
    }
};

// Ejecutar inicialización
JCPatbot.init();

// Variables legacy para compatibilidad (usar JCPatbot.state en nuevo código)
let lastExamenConsultado = JCPatbot.state.lastExamenConsultado;
let conversationHistory = JCPatbot.state.conversationHistory;
let currentAvatar = JCPatbot.state.currentAvatar;
