
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatToggle = document.getElementById('chat-toggle');
    const closeBtn = document.querySelector('.close-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const optionsContainer = document.getElementById('bot-options');
    const inputContainer = document.getElementById('chat-input-container');
    const userInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    const whatsappNumber = '51986396733';
    const whatsappMessage = 'Hola, vengo de la página web y quisiera hacer una consulta.';

    // --- CHATBOT DIALOGUE AND LOGIC ---
    const conversation = {
        start: {
            text: "Hola, soy tu asistente virtual de JC Pathlab. Entiendo que buscar un diagnóstico puede generar inquietud. Estoy aquí para ayudarte a resolver tus dudas con total confianza y rapidez.",
            options: [
                { text: "Soy Médico / Clínica", next: "doctor" },
                { text: "Soy Paciente", next: "patient" },
                { text: "Consultar Precios", next: "pricing" },
                { text: "Chatear por WhatsApp", action: "whatsapp" }
            ]
        },
        doctor: {
            text: "Perfecto. Ofrecemos diagnósticos precisos y rápidos, respaldados por años de experiencia, para garantizar la mejor y más segura atención a sus pacientes. ¿Qué información necesita?",
            options: [
                { text: "Tiempos de Entrega", next: "turnaround" },
                { text: "Consultar Precios", next: "pricing" },
                { text: "Cómo Enviar Muestras", next: "samples" },
                { text: "Hablar con un Especialista", next: "lead_capture_start" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver", next: "start" }
            ]
        },
        patient: {
            text: "Comprendo tu preocupación. Estamos aquí para darte la seguridad y tranquilidad que necesitas. Por favor, recuerda que los resultados siempre deben ser interpretados por tu médico tratante. ¿Cómo puedo orientarte?",
            options: [
                { text: "¿Cuánto tarda mi resultado?", next: "turnaround_patient" },
                { text: "Consultar Precios", next: "pricing" },
                { text: "Necesito ayuda con mi diagnóstico", next: "patient_help" },
                { text: "Quiero contactar al laboratorio", next: "lead_capture_start" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver", next: "start" }
            ]
        },
        services: {
            text: "Nos especializamos en una amplia gama de diagnósticos para darte resultados certeros. Nuestra experiencia es tu tranquilidad. ¿Sobre qué área te gustaría saber más?",
            options: [
                { text: "Biopsias", next: "service_info" },
                { text: "Citopatología", next: "service_info" },
                { text: "Dermatopatología", next: "service_info" },
                { text: "Neuropatología", next: "service_info" },
                { text: "Volver", next: "start" }
            ]
        },
        pricing: {
            text: "Aquí tienes nuestra lista detallada de precios. Selecciona una categoría para ver más:",
            options: [
                { text: "Biopsias", next: "price_biopsy" },
                { text: "Citología", next: "price_cytology" },
                { text: "Piezas Quirúrgicas", next: "price_surgical" },
                { text: "Marcadores / IHC", next: "price_ihc" },
                { text: "Volver", next: "start" }
            ]
        },
        price_biopsy: {
            text: "<b>Tarifas de Biopsias:</b><br><br>• Biopsia Gástrica: <b>S/ 80</b><br>• Biopsia Esófago/Intestiono/Colon: <b>S/ 80</b><br>• Biopsia de Cervix: <b>S/ 80</b><br>• Cono Cervical: <b>S/ 120</b><br>• Biopsia de Próstata (6 frascos): <b>S/ 250</b>",
            options: [
                { text: "Solicitar cotización exacta", next: "lead_capture_start" },
                { text: "Ver otros precios", next: "pricing" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver al inicio", next: "start" }
            ]
        },
        price_cytology: {
            text: "<b>Tarifas de Citología:</b><br><br>• Papanicolau: <b>S/ 20</b><br>• Extendido de Tiroides (por lámina): <b>S/ 20</b><br>• Extendido PAAG Glándula Salival (por lámina): <b>S/ 20</b>",
            options: [
                { text: "Solicitar cotización exacta", next: "lead_capture_start" },
                { text: "Ver otros precios", next: "pricing" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver al inicio", next: "start" }
            ]
        },
        price_surgical: {
            text: "<b>Piezas Convencionales:</b><br>• Vesícula/Apéndice: S/ 110<br>• Útero y Ovarios: S/ 150<br>• Placenta: S/ 80<br>• Tumor partes blandas (<4cm): S/ 100<br><br><b>Oncológicas:</b><br>• Estómago/Colon/Riñón: S/ 250<br>• Útero c/Ganglios: S/ 300<br>• Médula Ósea: S/ 150",
            options: [
                { text: "Solicitar cotización exacta", next: "lead_capture_start" },
                { text: "Ver otros precios", next: "pricing" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver al inicio", next: "start" }
            ]
        },
        price_ihc: {
            text: "<b>Tarifas Marcadores / IHC:</b><br><br>• Marcador SIN lectura: <b>S/ 100</b><br>• Marcador CON lectura/informe: <b>S/ 250</b><br><br>Contamos con un amplio panel de anticuerpos (Ki67, CD3, CD20, Her2, etc).",
            options: [
                { text: "Solicitar cotización exacta", next: "lead_capture_start" },
                { text: "Ver otros precios", next: "pricing" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver al inicio", next: "start" }
            ]
        },
        service_info: {
            text: "Ofrecemos un servicio de diagnóstico detallado y rápido en esa área. Para darte información más específica y personalizada, lo mejor es que hables con uno de nuestros especialistas.",
            options: [
                { text: "Contactar a un Especialista", next: "lead_capture_start" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Ver otros servicios", next: "services" },
                { text: "Volver al inicio", next: "start" }
            ]
        },
        turnaround: {
            text: "Entendemos que la rapidez es crucial. Nuestros resultados de rutina suelen estar listos en 24-48 horas, garantizando un diagnóstico veloz para la tranquilidad de todos.",
            options: [
                { text: "Contactar para un caso urgente", next: "lead_capture_start" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver", next: "doctor" }
            ]
        },
        turnaround_patient: {
            text: "Sabemos que la espera puede ser difícil. Generalmente, los resultados están disponibles en 24-48 horas. Tu médico te contactará en cuanto los reciba y los revise.",
            options: [
                { text: "Tengo otra duda", next: "patient" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver al inicio", next: "start" }
            ]
        },
        samples: {
            text: "El proceso es sencillo y seguro. Para coordinar la logística de envío y asegurarnos de que tu muestra llegue en perfectas condiciones, por favor déjanos tus datos y te llamaremos a la brevedad.",
            options: [
                { text: "Dejar mis datos", next: "lead_capture_start" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver", next: "doctor" }
            ]
        },
        patient_help: {
            text: "Entiendo. Aunque no podemos darte un diagnóstico por este medio, podemos ponerte en contacto con nuestro equipo para que te orienten. Tu tranquilidad es nuestra prioridad.",
            options: [
                { text: "Sí, quiero que me contacten", next: "lead_capture_start" },
                { text: "Hablar por WhatsApp", action: "whatsapp" },
                { text: "Volver", next: "patient" }
            ]
        },
        lead_capture_start: {
            text: "Para darte una atención personalizada y resolver tu caso con la urgencia que merece, por favor, déjame tu nombre.",
            input: true,
            next: "lead_capture_contact"
        },
        lead_capture_contact: {
            text: "Gracias, {name}. Ahora, por favor, déjame tu número de teléfono o correo electrónico para que uno de nuestros especialistas se ponga en contacto contigo a la brevedad.",
            input: true,
            next: "lead_capture_end"
        },
        lead_capture_end: {
            text: "Perfecto, {name}. Hemos recibido tus datos ({contact}). Un especialista te contactará muy pronto. Estamos para darte la seguridad y tranquilidad que necesitas.",
            options: [
                { text: "Hablar por WhatsApp ahora", action: "whatsapp" },
                { text: "Tengo otra consulta", next: "start" }
            ]
        }
    };

    let currentStep = 'start';
    let capturedData = {};
    let conversationHistory = [];

    function showBotMessage(message) {
        // Clean HTML for history
        const cleanMessage = message.replace(/<[^>]*>?/gm, '');
        conversationHistory.push(`Asistente: ${cleanMessage}`);

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message bot-message';
        messageEl.innerHTML = message; // Use innerHTML to allow for bold/links
        messagesContainer.appendChild(messageEl);
        scrollToBottom();
    }

    function showUserMessage(message) {
        conversationHistory.push(`Usuario: ${message}`);

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message user-message';
        messageEl.textContent = message;
        messagesContainer.appendChild(messageEl);
        scrollToBottom();
    }

    function renderStep(stepKey) {
        currentStep = stepKey;
        const step = conversation[stepKey];

        if (step.text) {
            let message = step.text;
            if (message.includes('{name}')) message = message.replace('{name}', capturedData.name);
            if (message.includes('{contact}')) message = message.replace('{contact}', capturedData.contact);
            showBotMessage(message);
        }

        optionsContainer.innerHTML = '';
        if (step.options) {
            inputContainer.style.display = 'none';
            step.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option.text;
                if (option.next) button.dataset.next = option.next;
                if (option.action) button.dataset.action = option.action;
                optionsContainer.appendChild(button);
            });
        } else {
            inputContainer.style.display = 'flex';
            userInput.focus();
        }
    }

    function handleOptionClick(e) {
        if (e.target.classList.contains('option-btn')) {
            const nextStep = e.target.dataset.next;
            const action = e.target.dataset.action;

            showUserMessage(e.target.textContent);

            if (action === 'whatsapp') {
                const summary = conversationHistory.join('\n');
                const finalMessage = `Hola, vengo de la página web. Aquí está el resumen de mi consulta con el asistente:\n\n${summary}`;
                const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;

                window.open(url, '_blank');
                showBotMessage("Abriendo WhatsApp para que puedas comunicarte con nosotros directamente con el resumen de tu consulta.");
                return;
            }

            if (nextStep) {
                renderStep(nextStep);
            }
        }
    }

    function handleSend() {
        const inputText = userInput.value.trim();
        if (inputText === '') return;

        showUserMessage(inputText);
        userInput.value = '';

        const step = conversation[currentStep];
        if (step.next === 'lead_capture_contact') {
            capturedData.name = inputText;
        } else if (step.next === 'lead_capture_end') {
            capturedData.contact = inputText;
        }

        renderStep(step.next);
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- EVENT LISTENERS ---
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
        if (chatContainer.classList.contains('open')) {
            if (messagesContainer.children.length === 0) {
                renderStep('start');
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        chatContainer.classList.remove('open');
    });

    optionsContainer.addEventListener('click', handleOptionClick);
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
});
