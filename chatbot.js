document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatToggle = document.getElementById('chat-toggle');
    const closeBtn = document.querySelector('.close-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const optionsContainer = document.getElementById('bot-options');
    const userInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    const whatsappNumber = '51986396733';

    // --- KNOWLEDGE BASE ---
    const KNOWLEDGE_BASE = {
        saludos: {
            keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'],
            response: "¡Hola! Soy el asistente virtual del Dr. Josehp Castillo en JC PATH LAB. ¿En qué puedo ayudarte hoy? Estoy aquí para resolver tus dudas sobre análisis, precios o coordinar tu atención."
        },
        precios: {
            keywords: ['precio', 'costo', 'cuanto cuesta', 'tarifa', 'cotizacion', 'soles'],
            response: "Contamos con tarifas competitivas y transparentes:<br><br>• <b>Biopsias:</b> Desde S/ 80 (Gástrica, Útero, etc.) hasta S/ 250 (Próstata, Oncológicas).<br>• <b>Citología:</b> Papanicolaou S/ 20.<br>• <b>Inmunohistoquímica:</b> S/ 100 por marcador (Sin lectura) o S/ 250 (Con informe).<br>• <b>Piezas Quirúrgicas:</b> Desde S/ 110.<br><br>¿Deseas una cotización formal por WhatsApp?"
        },
        biopsias: {
            keywords: ['biopsia', 'gastrica', 'prostata', 'cervix', 'cono', 'quirurgica'],
            response: "Somos especialistas en procesamiento de biopsias con resultados en 24-48 horas. Procesamos biopsias gástricas, de próstata (S/ 250), de cuello uterino (S/ 80), cono cervical (S/ 120) y piezas oncológicas complejas."
        },
        citologia: {
            keywords: ['papanicolau', 'citologia', 'tiroides', 'paag', 'liquido'],
            response: "Realizamos estudios citológicos de alta precisión. El <b>Papanicolaou</b> tiene un costo de S/ 20. También realizamos extendidos de tiroides y aspiraciones por aguja fina (PAAG)."
        },
        inmunohistoquimica: {
            keywords: ['ihc', 'inmunohistoquimica', 'marcadores', 'anticuerpos', 'her2', 'ki67'],
            response: "Contamos con un panel de más de 100 anticuerpos (Ki67, HER2, p16, CD20, etc.) para diagnósticos oncológicos definitivos. El costo por marcador es de S/ 100 solo procesamiento o S/ 250 con informe patológico."
        },
        vph: {
            keywords: ['vph', 'papiloma', 'verrugas', 'cuello uterino', 'cancer'],
            response: "El VPH es el virus de transmisión sexual más común. En JC PATH LAB realizamos el descarte mediante citología (Papanicolaou) y pruebas de p16/Ki67 para evaluar el riesgo de cáncer. ¡No te alarmes, la detección temprana es la clave!"
        },
        dr_castillo: {
            keywords: ['doctor', 'quien es', 'josehp', 'experiencia', 'curriculum', 'especialista'],
            response: "El <b>Dr. Josehp Castillo Cuenca</b> es un médico patólogo con amplia trayectoria en el diagnóstico de cáncer, subespecialista en áreas como Dermatopatología y Patología Oncológica. Su enfoque es la rapidez y la precisión absoluta."
        },
        tiempo: {
            keywords: ['tiempo', 'cuando esta', 'entrega', 'tarda', 'demora', 'resultado'],
            response: "Entendemos la urgencia. Los resultados de biopsias de rutina y citologías suelen estar listos en <b>24 a 48 horas</b>. Casos especiales de inmunohistoquímica pueden tomar un poco más según la complejidad."
        },
        contacto: {
            keywords: ['contacto', 'donde estan', 'ubicacion', 'telefono', 'whatsapp', 'cita', 'atencion'],
            response: "Estamos ubicados en Puente Piedra, Lima. Puedes escribirnos directamente al WhatsApp o llamarnos al <b>986396733</b> para coordinar el envío de muestras o tu atención."
        },
        especialidades: {
            keywords: ['especialidad', 'subespecialidad', 'dermatopatologia', 'neuropatologia', 'partes blandas', 'gastrointestinal', 'genitourinario'],
            response: "El Dr. Castillo es experto en múltiples subespecialidades:<br><br>• <b>Dermatopatología:</b> Biopsias de piel y cuero cabelludo.<br>• <b>Neuropatología:</b> Tumores de sistema nervioso.<br>• <b>Partes Blandas:</b> Diagnóstico de sarcomas y tumores de grasa.<br>• <b>Gastrointestinal:</b> Biopsias de estómago, colon e hígado.<br>• <b>Genitourinario:</b> Próstata, riñón y vejiga.<br><br>¿Te gustaría saber sobre alguna en específico?"
        },
        muestras: {
            keywords: ['muestra', 'enviar', 'formol', 'frasco', 'envio'],
            response: "Para el envío de muestras: deben estar sumergidas en <b>formol al 10%</b> en un frasco bien cerrado y rotulado con el nombre del paciente. Podemos ayudarte con la logística de recojo, solo escríbenos al WhatsApp."
        },
        problemas: {
            keywords: ['problema', 'queja', 'error', 'ayuda', 'urgente', 'mal', 'no funciona'],
            response: "Lamento que tengas inconvenientes. Por favor, permíteme conectarte directamente con el Dr. Castillo para resolver esto de inmediato. ¿Quieres que abra el WhatsApp ahora?"
        }
    };

    let conversationHistory = [];

    function showBotMessage(message, withOptions = true) {
        typingIndicator.style.display = 'block';
        scrollToBottom();

        setTimeout(() => {
            typingIndicator.style.display = 'none';
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message bot-message';
            messageEl.innerHTML = message;
            messagesContainer.appendChild(messageEl);
            scrollToBottom();

            if (withOptions) {
                renderGeneralOptions();
            }

            conversationHistory.push(`Asistente: ${message.replace(/<[^>]*>?/gm, '')}`);
            detectLeadIntent(message);
        }, 800);
    }

    function showUserMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message user-message';
        messageEl.textContent = message;
        messagesContainer.appendChild(messageEl);
        scrollToBottom();
        conversationHistory.push(`Usuario: ${message}`);
    }

    function detectLeadIntent(botResponse) {
        // Simple logic to show WhatsApp button if interest is high
        const interestKeywords = ['precios', 'biopsia', 'atencion', 'contacto', 'problema', 'cotizacion'];
        const lowerResponse = botResponse.toLowerCase();

        if (interestKeywords.some(k => lowerResponse.includes(k))) {
            const whatsappCard = document.createElement('div');
            whatsappCard.className = 'whatsapp-card';
            whatsappCard.innerHTML = `
                <a href="#" class="whatsapp-link" id="wa-lead-btn">
                    <i class="fab fa-whatsapp"></i> Hablar con el Dr. Castillo
                </a>
                <p style="font-size: 11px; margin-top: 5px; color: #555;">Recibirás atención inmediata y personalizada.</p>
            `;
            messagesContainer.appendChild(whatsappCard);
            scrollToBottom();

            document.getElementById('wa-lead-btn').addEventListener('click', (e) => {
                e.preventDefault();
                redirectToWhatsApp();
            });
        }
    }

    function redirectToWhatsApp() {
        const summary = conversationHistory.slice(-5).join('\n');
        const finalMessage = `Hola Dr. Castillo, estoy consultando en su web y requiero ayuda específica. Resumen:\n\n${summary}`;
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
        window.open(url, '_blank');
        showBotMessage("Abriendo WhatsApp... ¡Un momento por favor!", false);
    }

    function handleUserInput() {
        const input = userInput.value.trim().toLowerCase();
        if (!input) return;

        showUserMessage(userInput.value);
        userInput.value = '';

        let bestMatch = null;
        let maxKeywords = 0;

        for (const topic in KNOWLEDGE_BASE) {
            const matches = KNOWLEDGE_BASE[topic].keywords.filter(k => input.includes(k)).length;
            if (matches > maxKeywords) {
                maxKeywords = matches;
                bestMatch = KNOWLEDGE_BASE[topic].response;
            }
        }

        if (bestMatch) {
            showBotMessage(bestMatch);
        } else {
            showBotMessage("Es una buena pregunta. Para darte una respuesta precisa sobre ese tema, te sugiero consultarlo directamente con nuestro equipo de especialistas vía WhatsApp.");
        }
    }

    function renderGeneralOptions() {
        optionsContainer.innerHTML = '';
        const options = [
            { text: "Ver Precios", topic: "precios" },
            { text: "Tiempos de Entrega", topic: "tiempo" },
            { text: "Dudas sobre VPH", topic: "vph" },
            { text: "WhatsApp Directo", action: "whatsapp" }
        ];

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                showUserMessage(opt.text);
                if (opt.action === 'whatsapp') {
                    redirectToWhatsApp();
                } else {
                    showBotMessage(KNOWLEDGE_BASE[opt.topic].response);
                }
            });
            optionsContainer.appendChild(btn);
        });
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- EVENT LISTENERS ---
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
        if (chatContainer.classList.contains('open') && messagesContainer.children.length === 0) {
            showBotMessage("¡Bienvenido! Soy el asistente virtual de <b>JC PATH LAB</b>. ¿Cómo puedo ayudarte hoy con tus dudas de patología?");
        }
    });

    closeBtn.addEventListener('click', () => chatContainer.classList.remove('open'));
    sendBtn.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserInput(); });
});
