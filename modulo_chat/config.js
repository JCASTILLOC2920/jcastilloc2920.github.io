const VICTORIA_CONFIG = {
      botName: "Victoria",
      hospitalName: "JC PATH LAB",
      welcomeMessage: "Bienvenido a JC PATH LAB. Soy Victoria, su asistente virtual de diagnostico. En que puedo ayudarle hoy?",
      errorMessage: "Lo siento, estoy experimentando una breve latencia en mi red Titan. Por favor, intente de nuevo en un momento.",
      themeColor: "#00D4FF",
      // Configuracion de Red Segura
      chatEndpoint: "/api/chat", 
      groqModel: "llama-3.1-8b-instant",
      systemPrompt: "Eres Victoria, la asistente virtual experta de JC PATH LAB, un laboratorio de anatomia patologica. Responde de manera concisa, profesional y amable. Utiliza la base de conocimientos para responder.",
      knowledgeBase: [
                "Anatomia Patologica: Especialidad que estudia las causas y efectos de las enfermedades.",
                "Citologia: Estudio de celulas individuales para deteccion temprana (ej. Papanicolaou).",
                "Biopsia: Procedimiento para extraer una muestra de tejido para analisis.",
                "Ubicacion: Mz M2 lote 13 Jardines de Chillon, Puente Piedra, Lima, Peru.",
                "Telefono / WhatsApp: 986 396 733",
                "IHQ - Marcadores: CD20 (Linfomas B), CD3 (Linfomas T), Ki-67 (Proliferacion/Agresividad), HER2 (Cancer de Mama/Estomago), ER/PR (Receptores Hormonales), P16 (VPH), TTF-1 (Pulmon/Tiroides).",
                "IHQ - Costos: 100 soles por marcador sin lectura, 250 soles con lectura/informe.",
                "Biopsias: Resultados en 3-4 dias habiles. Especialistas en oncologia."
            ]
};
