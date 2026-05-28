// VICTORIA AI - CONFIGURACIÓN Y DICCIONARIO COGNITIVO SOBERANO v3.0
// JC PATH LAB - 100% OFFLINE / CASCARÓN VACÍO

const VICTORIA_CONFIG = {
    botName: "Victoria",
    hospitalName: "JC PATH LAB",
    whatsappNumber: "51986396733",
    
    welcomeMessage: "Hola, soy <strong>Victoria AI</strong>, su asistente virtual de Anatomía Patológica en <strong>JC PATH LAB</strong>. Me he sincronizado localmente en modo soberano. <br><br>¿En qué diagnóstico, biopsia, tarifa de inmunohistoquímica (IHQ) o distrito de recojo puedo asistirle hoy?",
    
    errorMessage: "Lo siento, mi canal local está experimentando alta latencia. Por favor, contácteme directamente por WhatsApp para coordinar de inmediato.",
    
    themeColor: "#0d9488", // Teal Clínico Premium

    // DICCIONARIO CLÍNICO DE RESPUESTAS DIRECTAS (Mapeo de Intenciones y Palabras Clave)
    intents: [
        {
            name: "precios_tarifas",
            keywords: ["precio", "costo", "tarifa", "cuanto cuesta", "valor", "soles", "pagar", "cotizacion"],
            response: "En <strong>JC PATH LAB</strong> garantizamos tarifas altamente competitivas con entrega rápida en 3-4 días:<br>" +
                      "• <strong>Biopsia Simple:</strong> S/. 150 (Estudio histopatológico estándar).<br>" +
                      "• <strong>Inmunohistoquímica (IHQ):</strong> S/. 100 por cada anticuerpo (marcador).<br>" +
                      "• <strong>IHQ con Informe Completo:</strong> S/. 250 (Paquete diagnóstico).<br>" +
                      "• <strong>Papanicolaou (PAP):</strong> S/. 50 (Lectura y reporte citológico).<br>" +
                      "• <strong>Segunda Opinión Diagnóstica:</strong> Desde S/. 200.<br><br>" +
                      "¿Desea cotizar un examen específico o agendar un recojo a domicilio?"
        },
        {
            name: "tiempos_entrega",
            keywords: ["tiempo", "plazo", "entrega", "demora", "cuanto tarda", "dias", "rapido", "urgente"],
            response: "Sabemos que cada minuto cuenta para su diagnóstico. Nuestros plazos son líderes en el sector patológico:<br>" +
                      "• <strong>Biopsias de rutina:</strong> 3 a 4 días útiles (entrega digital garantizada).<br>" +
                      "• <strong>Inmunohistoquímica (IHQ):</strong> 4 a 5 días útiles (procesamiento de marcadores).<br>" +
                      "• <strong>Papanicolaou / Citología:</strong> 24 a 48 horas.<br>" +
                      "• <strong>Casos Complejos / Consultas:</strong> 5 días útiles.<br><br>" +
                      "Ofrecemos un canal de urgencia preferencial para casos oncológicos críticos."
        },
        {
            name: "anticuerpos_ihq",
            keywords: ["anticuerpo", "marcador", "ihq", "inmunohistoquimica", "her2", "ki67", "estrogeno", "progesterona", "ck19", "vph", "pdl1", "cd20", "cd3"],
            response: "Disponemos de un panel completo de marcadores de inmunohistoquímica (IHQ) para oncología y patología de precisión:<br>" +
                      "• <strong>HER2 / Ki-67 / RE / RP:</strong> Perfil clave para caracterización y pronóstico de cáncer de mama.<br>" +
                      "• <strong>CK19 / Tiroglobulina:</strong> Excelente para diagnóstico diferencial en tiroides (Cáncer Papilar).<br>" +
                      "• <strong>PD-L1 (22c3):</strong> Predictor clave para inmunoterapia personalizada.<br>" +
                      "• <strong>VPH (Virus de Papiloma Humano):</strong> Detección directa en bloques de tejido cervical.<br>" +
                      "• <strong>CD3 / CD20:</strong> Panel linfático básico para clasificación de linfomas.<br><br>" +
                      "¿Qué marcador específico le han solicitado en su orden médica?"
        },
        {
            name: "recojo_distritos",
            keywords: ["recojo", "domicilio", "traer", "llevar", "recoger", "donde estan", "direccion", "ubicar", "sede", "clinica", "consultorio", "puente piedra", "los olivos", "comas", "carabayllo", "ancon", "smp", "independencia"],
            response: "Nuestra central patológica se ubica en <strong>Puente Piedra: Mz M2 lote 13, Jardines de Chillón</strong>.<br><br>" +
                      "📍 <strong>Punto de Toma de Muestra Recomendado:</strong> Para una atención ágil y rápida en Lima Norte, recomendamos asistir al <strong>Consultorio Carrión (Bolognesi 322, Puente Piedra)</strong>.<br><br>" +
                      "🛵 <strong>Servicio de Recojo de Biopsias a Domicilio/Clínicas:</strong> Cubrimos Puente Piedra, Los Olivos, Comas, Carabayllo, Independencia, Ancón y todo Lima Metropolitana. Nosotros vamos por la muestra médica directamente para asegurar la cadena de custodia clínica."
        },
        {
            name: "contacto_humano",
            keywords: ["doctor", "patologo", "hablar", "telefono", "whatsapp", "contacto", "josehp", "castillo", "cita", "atencion", "agendar", "correo", "llamar"],
            response: "Puede comunicarse de forma directa y soberana con el <strong>Dr. Josehp Castillo Cuenca (Médico Patólogo)</strong> al <strong>+51 986396733</strong>.<br><br>" +
                      "Estaremos encantados de coordinar el procesamiento de su biopsia, validar sus láminas o cotizar su panel IHC de forma personalizada."
        }
    ],

    // RESPUESTAS SEGÚN PALABRAS CLAVE GENÉRICAS
    defaultResponse: "He comprendido su consulta. Para brindarle un servicio de precisión oncológica óptimo, le sugiero conversar de forma inmediata con nuestro especialista por WhatsApp, o bien cargar su orden médica aquí mismo utilizando el botón de la cámara para que extraigamos sus datos automáticamente.<br><br>" +
                      "<strong>JC PATH LAB</strong>: Resultados exactos cuando más los necesita."
};
