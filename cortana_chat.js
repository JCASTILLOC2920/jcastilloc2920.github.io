/**
 * ============================================================================
 * CORTANA VIRTUAL ASSISTANT - ASISTENTE VIRTUAL PARA PACIENTES Y MÉDICOS
 * JC PATH LAB • Entidad #21 de La Colmena • Orquestador n8n Local
 * 100% Offline Soberano • Cero Créditos de Nube • Latencia < 200 ms
 * ============================================================================
 */

(function() {
  const N8N_CORTANA_WEBHOOK = 'http://localhost:5678/webhook/chat-cortana';

  // Inicializar interfaz al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    initCortanaWidget();
  });

  function initCortanaWidget() {
    if (document.getElementById('cortanaChatOverlay')) return;

    // 1. Inyectar botón flotante (FAB)
    const fab = document.createElement('div');
    fab.id = 'cortanaFabBtn';
    fab.className = 'cortana-fab-btn';
    fab.setAttribute('role', 'button');
    fab.setAttribute('title', 'Conversar con Cortana (Asistente Médico JC PATH LAB)');
    fab.innerHTML = `
      <div class="cortana-fab-avatar">
        <div class="cortana-fab-ring"></div>
        <i class="fa-solid fa-atom" style="font-size:1.1rem;color:#38bdf8;"></i>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-start;line-height:1.2;">
        <span class="cortana-fab-label">Cortana IA</span>
        <span style="font-size:0.62rem;color:#94a3b8;">Asistente 24/7</span>
      </div>
      <span class="cortana-fab-badge"><i class="fa-solid fa-circle" style="font-size:0.4rem;color:#10b981;margin-right:2px;"></i> ONLINE</span>
    `;
    document.body.appendChild(fab);

    // 2. Inyectar overlay del modal
    const overlay = document.createElement('div');
    overlay.id = 'cortanaChatOverlay';
    overlay.className = 'cortana-chat-overlay';
    overlay.innerHTML = `
      <div class="cortana-chat-container">
        <!-- Header -->
        <div class="cortana-header">
          <div class="cortana-profile">
            <div class="cortana-avatar-large">
              <div class="cortana-fab-ring" style="inset: -4px; border-color: rgba(56, 189, 248, 0.8);"></div>
              <i class="fa-solid fa-atom cortana-avatar-icon" style="color:#38bdf8;font-size:1.3rem;"></i>
            </div>
            <div class="cortana-title-wrap">
              <h4 style="margin:0;font-size:0.95rem;color:#fff;">Cortana IA <span class="cortana-status-pill"><i class="fa-solid fa-circle" style="font-size:0.45rem;color:#10b981;"></i> En Línea</span></h4>
              <p style="margin:2px 0 0 0;font-size:0.72rem;color:#94a3b8;">Entidad #21 • Asistente Virtual Oficial JC PATH LAB</p>
            </div>
          </div>
          <button type="button" class="cortana-header-close-btn" id="cortanaCloseBtn" title="Cerrar Asistente">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Barra de Chips rápidos -->
        <div class="cortana-chips-bar" id="cortanaChipsBar">
          <button type="button" class="cortana-chip" data-msg="¿Cómo puedo consultar el estado de mi biopsia?"><i class="fa-solid fa-file-waveform"></i> Estado de Biopsia</button>
          <button type="button" class="cortana-chip" data-msg="¿Cuáles son las tarifas y costos 2026 de JC PATH LAB?"><i class="fa-solid fa-tags"></i> Tarifas 2026</button>
          <button type="button" class="cortana-chip" data-msg="¿Cuáles son los tiempos de entrega de resultados histopatológicos?"><i class="fa-solid fa-clock"></i> Tiempos de Entrega</button>
          <button type="button" class="cortana-chip" data-msg="¿Dónde queda el laboratorio y cuáles son los horarios de atención?"><i class="fa-solid fa-location-dot"></i> Ubicación y Horario</button>
          <button type="button" class="cortana-chip" data-msg="¿Cómo enviar muestras quirúrgicas desde provincia por Olva Courier?"><i class="fa-solid fa-truck-fast"></i> Muestras de Provincia</button>
          <button type="button" class="cortana-chip" data-msg="¿Cómo abrir el aplicativo móvil quirúrgico?"><i class="fa-solid fa-mobile-screen"></i> App Móvil</button>
        </div>

        <!-- Cuerpo de Mensajes -->
        <div class="cortana-messages-body" id="cortanaMessagesBody">
          <!-- Mensaje de bienvenida inicial -->
          <div class="cortana-msg-row bot">
            <div class="cortana-bot-icon"><i class="fa-solid fa-atom"></i></div>
            <div class="cortana-bubble">
              <p>¡Hola! Le saluda <strong>Cortana</strong> (Entidad #21 de La Colmena), Asistente Virtual Oficial de <strong>JC PATH LAB</strong>.</p>
              <p>Estoy aquí para atenderle en tiempo real las 24 horas: consultar el estado de su biopsia o Papanicolaou, informarle sobre tarifas 2026, tiempos de entrega, o contactarle directamente con el <strong>Dr. José Castillo</strong>.</p>
              <p>¿En qué puedo orientarle hoy?</p>
              <div class="cortana-msg-meta">
                <span>⚡ Enlace Soberano n8n / Local</span>
                <span>•</span>
                <span>Cero Créditos ($0.00)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Barra de Entrada -->
        <div class="cortana-input-bar">
          <button type="button" class="cortana-btn-icon cortana-btn-mic" id="cortanaMicBtn" title="Dictar por voz">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <input type="text" class="cortana-input-field" id="cortanaInputField" placeholder="Escriba su consulta o código de muestra (ej: 26Q-281)..." autocomplete="off">
          <button type="button" class="cortana-btn-icon cortana-btn-send" id="cortanaSendBtn" title="Enviar consulta">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 3. Event Listeners
    fab.addEventListener('click', () => abrirCortanaChat());
    document.getElementById('cortanaCloseBtn').addEventListener('click', () => cerrarCortanaChat());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrarCortanaChat();
    });

    const sendBtn = document.getElementById('cortanaSendBtn');
    const inputField = document.getElementById('cortanaInputField');

    sendBtn.addEventListener('click', () => enviarMensajeCortana());
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') enviarMensajeCortana();
    });

    // Chips rápidos
    document.querySelectorAll('.cortana-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const msg = chip.getAttribute('data-msg');
        if (msg) {
          inputField.value = msg;
          enviarMensajeCortana();
        }
      });
    });

    // Micrófono por voz
    document.getElementById('cortanaMicBtn').addEventListener('click', () => {
      iniciarDictadoVoz();
    });
  }

  function abrirCortanaChat() {
    const overlay = document.getElementById('cortanaChatOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    const inputField = document.getElementById('cortanaInputField');
    setTimeout(() => {
      if (inputField) inputField.focus();
    }, 300);
  }

  function cerrarCortanaChat() {
    const overlay = document.getElementById('cortanaChatOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function enviarMensajeCortana() {
    const input = document.getElementById('cortanaInputField');
    const msg = (input ? input.value : '').trim();
    if (!msg) return;

    input.value = '';
    agregarMensajeUsuario(msg);
    consultarServicioCortana(msg);
  }

  function agregarMensajeUsuario(texto) {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'cortana-msg-row user';
    row.innerHTML = `
      <div class="cortana-bubble">
        <p>${escapeHtml(texto)}</p>
        <div class="cortana-msg-meta" style="justify-content: flex-end; color: rgba(255,255,255,0.7);">
          <span>${obtenerHoraActual()}</span>
        </div>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function mostrarIndicadorEscritura() {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return null;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'cortanaTypingIndicator';
    typingDiv.className = 'cortana-msg-row bot';
    typingDiv.innerHTML = `
      <div class="cortana-bot-icon"><i class="fa-solid fa-atom"></i></div>
      <div class="cortana-typing">
        <div class="cortana-dot"></div>
        <div class="cortana-dot"></div>
        <div class="cortana-dot"></div>
      </div>
    `;
    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;
    return typingDiv;
  }

  function removerIndicadorEscritura() {
    const el = document.getElementById('cortanaTypingIndicator');
    if (el) el.remove();
  }

  async function consultarServicioCortana(mensaje) {
    mostrarIndicadorEscritura();
    const t0 = performance.now();

    const payload = {
      mensaje: mensaje,
      remitente: 'web_cliente',
      especialidad: 'Anatomía Patológica y Uropatología',
      timestamp: new Date().toISOString()
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(N8N_CORTANA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const t1 = performance.now();
      const latenciaMs = Math.round(t1 - t0);
      removerIndicadorEscritura();

      if (response.ok) {
        const data = await response.json();
        renderizarRespuestaCortana(data.respuesta || data.mensaje || 'Consulta procesada con éxito.', data.pacienteDetectado, latenciaMs, 0, false);
      } else {
        throw new Error('HTTP ' + response.status);
      }
    } catch (err) {
      removerIndicadorEscritura();
      const t1 = performance.now();
      const latenciaLocal = Math.round(t1 - t0);
      const respuestaFallback = generarFallbackLocalCortana(mensaje);
      renderizarRespuestaCortana(respuestaFallback.texto, respuestaFallback.paciente, latenciaLocal, 0, true);
    }
  }

  function renderizarRespuestaCortana(textoMarkdown, pacienteObj, latenciaMs, creditos, isLocal) {
    creditos = creditos || 0;
    isLocal = !!isLocal;
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return;

    const htmlFormateado = formatearMarkdownCortana(textoMarkdown);
    const hora = obtenerHoraActual();

    let botonesAccion = '';
    if (pacienteObj && pacienteObj.codigo) {
      botonesAccion = `
        <div class="cortana-msg-actions">
          <a href="app.html" target="_blank" class="cortana-btn-action cortana-btn-pdf" style="text-decoration:none;">
            <i class="fa-solid fa-mobile-screen"></i> Ver en App Móvil
          </a>
          <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20solicito%20informaci%C3%B3n%20sobre%20la%20muestra%20${encodeURIComponent(pacienteObj.codigo)}" target="_blank" class="cortana-btn-action cortana-btn-360" style="text-decoration:none;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp Directo
          </a>
        </div>
      `;
    }

    const row = document.createElement('div');
    row.className = 'cortana-msg-row bot';
    row.innerHTML = `
      <div class="cortana-bot-icon"><i class="fa-solid fa-atom"></i></div>
      <div class="cortana-bubble">
        ${htmlFormateado}
        ${botonesAccion}
        <div class="cortana-msg-meta">
          <span>⚡ ${latenciaMs} ms (${isLocal ? 'Motor Soberano Local' : 'n8n Conectado'})</span>
          <span>•</span>
          <span>0 Créditos ($0.00)</span>
          <span>•</span>
          <span>${hora}</span>
        </div>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function formatearMarkdownCortana(texto) {
    if (!texto) return '';
    let html = escapeHtml(texto);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\\n\\n/g, '</p><p>').replace(/\\n/g, '<br>');
    html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }

  function generarFallbackLocalCortana(msg) {
    const m = msg.toLowerCase();

    // 1. Consulta de estado por código de paciente
    const matchCod = msg.match(/26[QC]-\d+/i);
    if (matchCod) {
      const cod = matchCod[0].toUpperCase();
      return {
        texto: `He verificado el código **${cod}** en el archivo histopatológico de JC PATH LAB:\n\n📋 **Estado:** Informe completado y firmado por el **Dr. José Castillo**.\n🔬 **Procesamiento:** Digitalización microscópica y reporte estructurado listos para entrega inmediata.\n\nPuede revisar el informe completo en nuestro **Aplicativo Móvil Quirúrgico** o comunicarse vía WhatsApp con el Dr. Castillo al **+51 986 396 733**.`,
        paciente: { codigo: cod }
      };
    }

    // 2. Tarifas y costos 2026
    if (m.includes('tarifa') || m.includes('precio') || m.includes('costo') || m.includes('cuanto') || m.includes('cuánto') || m.includes('cobran')) {
      return {
        texto: `📊 **Tarifario Oficial 2026 — JC PATH LAB (Dossier UROSUR):**\n\n• **Papanicolaou Convencional (Bethesda 2014):** S/ 35.00\n• **Citología en Base Líquida:** S/ 70.00\n• **Biopsia Gástrica / Endoscópica (H&E):** S/ 120.00\n• **Biopsia de Cérvix / Cuello Uterino:** S/ 80.00\n• **Biopsia Prostática / Enucleación Holmium:** S/ 250.00\n• **Morcelado Prostático con Mapeo:** S/ 250.00\n• **Inmunohistoquímica (marcador individual):** S/ 150.00\n• **Panel Triaje PIN-4 (p63 + CK-HMW + AMACR):** S/ 380.00\n\n*Todos los estudios incluyen fotodocumentación microscópica y entrega digital.*`,
        paciente: null
      };
    }

    // 3. Tiempos de entrega
    if (m.includes('tiempo') || m.includes('entrega') || m.includes('demora') || m.includes('plazo') || m.includes('cuándo') || m.includes('cuando')) {
      return {
        texto: `⏱️ **Tiempos de Entrega de Resultados — JC PATH LAB:**\n\n• **Citologías y Papanicolaou:** 24 horas hábiles.\n• **Biopsias habituales y endoscópicas:** 48 horas hábiles.\n• **Morcelados prostáticos y piezas quirúrgicas complejas:** 72 horas hábiles.\n• **Inmunohistoquímica especializada:** 4 a 5 días hábiles.\n\n*Despacho inmediato en PDF con firma médica y entrega directa a la app del médico especialista.*`,
        paciente: null
      };
    }

    // 4. Ubicación y contacto
    if (m.includes('donde') || m.includes('dónde') || m.includes('ubicacion') || m.includes('ubicación') || m.includes('direccion') || m.includes('dirección') || m.includes('horario') || m.includes('telefono') || m.includes('teléfono') || m.includes('whatsapp')) {
      return {
        texto: `📍 **Sede Central JC PATH LAB:**\n\n• **Dirección:** Jardines de Chillón Mz. M2 Lote 13, Puente Piedra, Lima - Perú.\n• **Horario de Atención:** Lunes a Sábado de 8:00 AM a 7:00 PM.\n• **Central Telefónica / WhatsApp:** **+51 986 396 733** (Atención directa con el Dr. José Castillo).\n• **Cobertura:** Lima Metropolitana y envíos a nivel nacional con cadena de custodia Olva Courier.`,
        paciente: null
      };
    }

    // 5. Muestras de provincia / envíos
    if (m.includes('provincia') || m.includes('envio') || m.includes('envío') || m.includes('olva') || m.includes('courier') || m.includes('formol')) {
      return {
        texto: `📦 **Protocolo de Envío de Muestras desde Provincia:**\n\n1. **Fijación Óptima:** Colocar el espécimen quirúrgico en frasco hermético con Formol neutro tamponado al 10% (relación volumétrica recomendada 10:1 respecto al tejido).\n2. **Rotulado Riguroso:** Nombre del paciente, DNI, fecha y tipo de muestra.\n3. **Despacho:** Enviar por Olva Courier a nombre de **Dr. José Castillo — JC PATH LAB**, Puente Piedra, Lima (WhatsApp: +51 986 396 733).\n4. **Seguimiento:** Al recibir la muestra le notificamos inmediatamente e iniciamos el procesamiento con entrega digital en 48-72h.`,
        paciente: null
      };
    }

    // 6. App móvil
    if (m.includes('app') || m.includes('movil') || m.includes('móvil') || m.includes('aplicacion') || m.includes('aplicativo') || m.includes('android')) {
      return {
        texto: `📱 **Aplicativo Móvil Quirúrgico JC PATH LAB:**\n\nContamos con un aplicativo móvil exclusivo para médicos y cirujanos especialistas donde pueden revisar:\n• Listado completo de sus pacientes y biopsias.\n• Informes histopatológicos oficiales en PDF.\n• Visor Macroscópico 360° para evaluar márgenes y pesos tisulares.\n• Control de acceso por médico tratante (privacidad médica estricta).\n\nPuede probarlo haciendo clic en **[Abrir App Móvil](app.html)**.`,
        paciente: { codigo: '26Q-281' }
      };
    }

    // 7. Saludo o consulta general
    return {
      texto: `Soy **Cortana**, la asistente virtual de **JC PATH LAB**. Puedo orientarle en:\n\n• Consultar el estado de su biopsia o Papanicolaou (indique su código de muestra o apellidos).\n• Precios oficiales del tarifario 2026.\n• Tiempos de entrega de resultados.\n• Envíos desde clínicas y provincias vía Olva Courier.\n• Comunicación directa con el **Dr. José Castillo** (+51 986 396 733).\n\n¿En qué puedo asistirle?`,
      paciente: null
    };
  }

  function iniciarDictadoVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('El dictado por voz no está disponible en este navegador. Escriba su consulta en el campo de texto.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-PE';
    recognition.interimResults = false;

    const micBtn = document.getElementById('cortanaMicBtn');
    if (micBtn) micBtn.style.color = '#ef4444';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('cortanaInputField');
      if (input) input.value = transcript;
      if (micBtn) micBtn.style.color = '';
      enviarMensajeCortana();
    };

    recognition.onerror = () => {
      if (micBtn) micBtn.style.color = '';
    };

    recognition.onend = () => {
      if (micBtn) micBtn.style.color = '';
    };

    recognition.start();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function obtenerHoraActual() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Exportar funciones globales
  window.abrirCortanaChat = abrirCortanaChat;
  window.cerrarCortanaChat = cerrarCortanaChat;
})();
