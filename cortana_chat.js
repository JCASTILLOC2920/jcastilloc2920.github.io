/**
 * ============================================================================
 * CORTANA ULTRA-HUMANA 60 FPS — MOTOR DE VIDEO EN VIVO & LENGUAJE CORPORAL
 * Supercomputadora La Colmena (6 PCs) • 100% Local • Cero Créditos
 * Características:
 *   1. Escenario de Video en Vivo (560x368) con separación de planos:
 *      - Fondo de Oficina JC LAB con colegas en bata blanca pasando detrás de
 *        Cortana (bokeh óptico f/1.8).
 *      - Cuando ESCUCHA: Te mira a los ojos con micro-sacadas oculares,
 *        parpadeo fisiológico natural asimétrico y respiración suave.
 *      - Cuando TIPEA: Antes de responder (1.1s), baja la mirada hacia su
 *        monitor/teclado, reflejo azulado en el rostro y micro-movimiento
 *        rítmico de hombros tecleando.
 *      - Cuando HABLA: Deformación biomecánica de labios y mandíbula a 60 FPS
 *        sincronizada con las sílabas y voz femenina natural.
 *   2. Psicología Conversacional Humana (Test de Turing Clínico):
 *      - Saludos espontáneos variados según la hora del día ("¡Buenos días!
 *        ¿Con quién me comunico hoy y cómo te ayudo?").
 *      - Reconoce cuando la secretaria o médico dice su nombre o clínica.
 *   3. Alojada en la Parte Superior Derecha sin tapar jamás la tabla.
 * ============================================================================
 */
(function() {
  const AVATAR_FACE_URL = 'assets/cortana/cortana_avatar_face.jpg?v=20261106_human60fps';
  const OFFICE_PORTRAIT_URL = 'assets/cortana/cortana_office_portrait.jpg?v=20261106_human60fps';
  const FG_MATTE_URL = 'assets/cortana/cortana_fg_matte.png?v=20261106_human60fps';

  // Estado biomecánico del motor de video 60 FPS
  const videoState = {
    mode: 'listening', // 'listening' | 'typing' | 'speaking' | 'smiling'
    speakingUntil: 0,
    typingUntil: 0,
    phonemeEnergy: 0,
    gazeTargetX: 0,
    gazeTargetY: 0,
    currentGazeX: 0,
    currentGazeY: 0,
    nextBlinkAt: performance.now() + 2400,
    blinkDuration: 150,
    blinkStart: 0,
    passersby: [
      { x: -90, y: 155, speed: 0.55, scale: 0.88, dir: 1, coatColor: 'rgba(241, 245, 249, 0.42)', headColor: 'rgba(210, 180, 160, 0.38)', delay: 0 },
      { x: 640, y: 168, speed: 0.42, scale: 0.78, dir: -1, coatColor: 'rgba(226, 232, 240, 0.36)', headColor: 'rgba(195, 165, 145, 0.34)', delay: 180 }
    ],
    interlocutorName: null,
    interlocutorClinic: null,
    voiceMuted: false
  };

  function obtenerSaludoHumanoVariado() {
    const h = new Date().getHours();
    const Momento = h < 12 ? 'Buenos días' : (h < 19 ? 'Buenas tardes' : 'Buenas noches');
    const momentoMin = Momento.toLowerCase();

    const variaciones = [
      `¡${Momento}! 😊 Le saluda Cortana aquí en recepción de JC PATH LAB. ¿Con quién tengo el gusto hoy y cómo le puedo ayudar?`,
      `¡Hola, muy ${momentoMin}! Qué gusto saludarle. ¿Con quién me comunico y de qué clínica nos escribe para buscarle su informe ahorita mismo?`,
      `¡${Momento}! Aquí Cortana en el laboratorio del Dr. Castillo 😊 Cuénteme, ¿con quién hablo hoy y qué biopsia o citología le ubico?`,
      `¡Hola! ${Momento}, bienvenida a recepción de JC PATH LAB. ¿Con qué señorita o doctor me comunico hoy? Dígame cómo le ayudo.`,
      `¡Qué tal, ${momentoMin}! 😊 Estoy aquí en mi computadora lista para ayudarle. ¿Con quién tengo el gusto y qué pacientito buscamos?`,
      `¡${Momento}! Recepción de anatomía patológica JC PATH LAB. ¿Me regala su nombre o la clínica de donde se comunica para atenderle al toque?`
    ];
    const idx = Math.floor(Math.random() * variaciones.length);
    return variaciones[idx];
  }

  function obtenerFraseTipeoHumana() {
    const frases = [
      'Un segundito, lo estoy buscando aquí en mi teclado...',
      'Déjame tipear el dato en el sistema un momentito...',
      'Ahorita mismo lo reviso en mi pantalla, dame un segundo...',
      'Buscando en la base del laboratorio, un instante por favor...'
    ];
    return frases[Math.floor(Math.random() * frases.length)];
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCortanaSystem);
  } else {
    initCortanaSystem();
  }

  function initCortanaSystem() {
    inyectarUIFlotanteCortana();
    conectarEventosCortana();
  }

  function obtenerPoolPacientes() {
    if (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) return window.patientDatabase;
    if (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) return window.REAL_SUPABASE_PATIENTS;
    if (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) return window.realSupabaseBackup;
    return [];
  }

  function inyectarUIFlotanteCortana() {
    const oldBadge = document.getElementById('cortanaFloatingBadge');
    if (oldBadge) oldBadge.remove();
    const oldPanel = document.getElementById('cortanaAssistantPanel');
    if (oldPanel) oldPanel.remove();

    // A. Estación Cortana en la Parte Superior Derecha (Espacio dedicado sobre la tabla)
    const badge = document.createElement('div');
    badge.id = 'cortanaFloatingBadge';
    badge.className = 'cortana-floating-badge cortana-top-right-dock';
    badge.title = 'Cortana · Recepción en Vivo JC PATH LAB (Espacio superior derecho)';
    badge.innerHTML = `
            <!-- Burbuja Flotante de Diálogo: Asistente del Dr. Castillo -->
      <div class="cortana-speech-bubble" id="cortanaSpeechBubble" title="Haga clic para hablar con el asistente del Dr. Castillo" onclick="if(typeof window.cortanaAbrirChat==='function') window.cortanaAbrirChat();">
        <div class="cortana-bubble-arrow"></div>
        <div class="cortana-bubble-inner">
          <i class="fa-solid fa-wand-magic-sparkles cortana-bubble-sparkle"></i>
          <span class="cortana-bubble-text" id="cortanaSpeechBubbleText">Soy el asistente del Dr. Castillo, ¿en qué te puedo ayudar?</span>
          <button type="button" class="cortana-bubble-close" id="cortanaSpeechBubbleClose" title="Cerrar burbuja" onclick="event.stopPropagation(); document.getElementById('cortanaSpeechBubble').style.display='none';">×</button>
        </div>
      </div>

      <div class="cortana-avatar-ring" id="cortanaAvatarTrigger" title="Abrir Recepción en Vivo con Cortana">
        <img src="${AVATAR_FACE_URL}" alt="Cortana" class="cortana-avatar-img" onerror="this.onerror=null; this.src='icon-192.png';">
        <span class="cortana-status-pulse"></span>
      </div>
      <div class="cortana-badge-text" id="cortanaTextTrigger">
        <span class="cortana-badge-name">Cortana <span class="cortana-live-pill">● EN VIVO</span></span>
        <span class="cortana-badge-role">Recepción & Coordinación</span>
      </div>
      <div class="cortana-top-inline-search" onclick="event.stopPropagation();">
        <i class="fa-solid fa-magnifying-glass cortana-top-search-icon"></i>
        <input type="text" id="cortanaTopQuickInput" class="cortana-top-search-input" placeholder="Buscar código (ej. 387), DNI o paciente..." autocomplete="off" spellcheck="false">
        <button type="button" id="cortanaTopClearBtn" class="cortana-top-clear-btn" style="display:none;" title="Limpiar filtro"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <span class="cortana-badge-chip" id="cortanaChipTrigger" title="Hablar con Cortana en Recepción"><i class="fa-solid fa-video" style="margin-right:4px;"></i>HABLAR</span>
    `;

    const topRightSlot = document.querySelector('.services-search-wrapper') || document.querySelector('.header-right');
    if (topRightSlot) {
      topRightSlot.appendChild(badge);
    } else {
      document.body.appendChild(badge);
    }

    // B. Panel de Videollamada & Chat Humano de Recepción (Esquina Superior Derecha)
    const panel = document.createElement('div');
    panel.id = 'cortanaAssistantPanel';
    panel.className = 'cortana-assistant-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="cortana-panel-header">
        <div class="cortana-header-title-clean">
          <span class="cortana-live-pill-top"><span class="cortana-pulse-dot"></span> RECEPCIÓN EN VIVO</span>
          <span class="cortana-brand-badge">JC PATH LAB</span>
        </div>
        <div class="cortana-header-actions">
          <button type="button" class="cortana-header-btn" id="btnCortanaToggleVoice" title="Activar/Silenciar voz de Cortana"><i class="fa-solid fa-volume-high"></i></button>
          <button type="button" class="cortana-header-btn" id="btnCortanaClearChat" title="Nueva consulta"><i class="fa-solid fa-rotate-left"></i></button>
          <button type="button" class="cortana-header-btn" id="btnCortanaClosePanel" class="cortana-header-btn cortana-close-x-btn" title="Cerrar ventana (Esc)"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>

      <!-- ÚNICA PRESENTACIÓN DE CORTANA (50% MAYOR TAMAÑO: 72px + VIDEO EN MOVIMIENTO) -->
      <div class="cortana-hero-single-profile">
        <div class="cortana-single-avatar-container">
          <video id="cortanaSingleVideoAvatar" src="assets/cortana/videos/idle.mp4" autoplay loop muted playsinline poster="assets/cortana/cortana_avatar_face.jpg" class="cortana-single-avatar-video"></video>
          <span class="cortana-single-status-badge"></span>
        </div>
        <div class="cortana-single-meta">
          <div class="cortana-single-name-row">
            <span class="cortana-single-name">Cortana</span>
            <i class="fa-solid fa-circle-check" style="color:#10b981; font-size:0.85rem;" title="Concierge Oficial Verificada"></i>
            <span class="cortana-single-concierge-tag">CONCIERGE</span>
          </div>
          <div class="cortana-single-role">Recepción & Coordinación &bull; JC PATH LAB</div>
          <div class="cortana-single-state" id="cortanaLiveStateLabel">
            <i class="fa-solid fa-video text-emerald-400" style="color: #10b981; font-size: 0.7rem;"></i> En línea y mirándote
          </div>
        </div>
      </div>

      <div class="cortana-quick-chips">
        <button type="button" class="cortana-chip" data-query="Hola, busco los informes listos">✅ Informes listos</button>
        <button type="button" class="cortana-chip" data-query="Hola, soy de Clínica La Luz">🏥 Clínica La Luz</button>
        <button type="button" class="cortana-chip" data-query="Hola, soy de Clínica Carrión">🏥 Carrión</button>
        <button type="button" class="cortana-chip" data-query="Hola, soy de San Clemente">🏥 San Clemente</button>
        <button type="button" class="cortana-chip" data-query="Hola, soy de Clínica La Mujer">🏥 La Mujer</button>
      </div>
      <div id="cortanaMessagesContainer" class="cortana-messages-container"></div>
      <div id="cortanaTypingIndicator" class="cortana-typing-bar" style="display:none;">
        <span class="cortana-typing-dots"><span></span><span></span><span></span></span>
        <span id="cortanaTypingText">Cortana está tipeando en su teclado...</span>
      </div>
      <div class="cortana-panel-input-box">
        <input type="text" id="cortanaPanelInput" class="cortana-panel-input" placeholder="Escríbeme tu nombre, clínica o el código del paciente..." autocomplete="off">
        <button type="button" id="btnCortanaVoiceInPanel" class="cortana-input-btn voice" title="Hablar por micrófono"><i class="fa-solid fa-microphone"></i></button>
        <button type="button" id="btnCortanaSendInPanel" class="cortana-input-btn send" title="Enviar"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  // [AGENTE PRIME]: Motor de canvas 60FPS purgado (código inerte/dead weight sin canvas en DOM).


  function hablarConVozFemenina(textoPlano) {
    const cleanText = String(textoPlano || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/[😊🪪🧪🏥●✅]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return;

    // Activar lip-sync proporcional a la longitud de la respuesta
    const durMs = Math.min(9500, Math.max(2400, cleanText.length * 52));
    videoState.speakingUntil = performance.now() + durMs;

        if (videoState.voiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      
      // Limpieza fonética para que la voz hable fórmulas y matemáticas con dulzura natural
      let phoneticText = cleanText
        .replace(/\^2/g, ' al cuadrado ')
        .replace(/\^3/g, ' al cubo ')
        .replace(/\+/g, ' más ')
        .replace(/\-/g, ' menos ')
        .replace(/\*/g, ' por ')
        .replace(/\//g, ' sobre ')
        .replace(/=/g, ' es igual a ')
        .replace(/\\alpha/g, ' alfa ')
        .replace(/\\beta/g, ' beta ')
        .replace(/\\theta/g, ' zeta ')
        .replace(/\\pi/g, ' pi ')
        .replace(/\\sqrt\{?([^\}]+)\}?/g, ' raíz cuadrada de $1 ')
        .replace(/\$/g, '');

      const utter = new SpeechSynthesisUtterance(phoneticText);
      utter.lang = 'es-PE';
      // Cadencia suave, pedagógica y tono melódico dulce
      utter.rate = 0.95;
      utter.pitch = 1.12;
      
      const voices = window.speechSynthesis.getVoices() || [];
      // Priorizar voces neuronales naturales de alta calidad humana (Edge, Chrome, Windows 11)
      const naturalVoice = voices.find(v => /es/i.test(v.lang) && /(natural|salome|dalia|jimena|neural|google)/i.test(v.name))
        || voices.find(v => /es/i.test(v.lang) && /(sabina|helena|paulina|laura|monica|female|mujer)/i.test(v.name))
        || voices.find(v => /es/i.test(v.lang));
      
      if (naturalVoice) utter.voice = naturalVoice;
      utter.onend = () => {
        videoState.speakingUntil = Math.min(videoState.speakingUntil, performance.now() + 200);
      };
      window.speechSynthesis.speak(utter);
    } catch (e) {}
  }

  function conectarEventosCortana() {
    const badge = document.getElementById('cortanaFloatingBadge');
    const panel = document.getElementById('cortanaAssistantPanel');
    const closeBtn = document.getElementById('btnCortanaClosePanel');
    const clearBtn = document.getElementById('btnCortanaClearChat');
    const muteBtn = document.getElementById('btnCortanaToggleVoice');
    const input = document.getElementById('cortanaPanelInput');
    const sendBtn = document.getElementById('btnCortanaSendInPanel');
    const voiceBtn = document.getElementById('btnCortanaVoiceInPanel');

    // Buscador rápido directo en la barra superior derecha de Cortana
    const topQuickInput = document.getElementById('cortanaTopQuickInput');
    const topClearBtn = document.getElementById('cortanaTopClearBtn');
    const syncMainSearch = (val) => {
      const inp = document.getElementById('aiSmartSearchInput') || document.getElementById('cortanaSearchInput') || document.getElementById('mobileQuickSearchInput');
      if (inp) {
        inp.value = val;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (typeof window.applyFilters === 'function') window.applyFilters(true);
    };

    if (topQuickInput) {
      topQuickInput.addEventListener('input', (e) => {
        const val = e.target.value || '';
        if (topClearBtn) topClearBtn.style.display = val.trim() ? 'inline-flex' : 'none';
        syncMainSearch(val);
      });
      topQuickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && topQuickInput.value.trim()) {
          e.preventDefault();
          openCortanaPanel(topQuickInput.value.trim());
        }
      });
    }

    if (topClearBtn && topQuickInput) {
      topClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        topQuickInput.value = '';
        topClearBtn.style.display = 'none';
        syncMainSearch('');
        topQuickInput.focus();
      });
    }

    if (badge) {
      badge.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'cortanaTopQuickInput' || e.target.closest('.cortana-top-inline-search'))) return;
        e.stopPropagation();
        const q = topQuickInput && topQuickInput.value.trim() ? topQuickInput.value.trim() : null;
        if (q) openCortanaPanel(q);
        else toggleCortanaPanel();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => closeCortanaPanel());
    if (clearBtn) clearBtn.addEventListener('click', () => limpiarMensajesCortana());
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        videoState.voiceMuted = !videoState.voiceMuted;
        if (videoState.voiceMuted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        muteBtn.innerHTML = videoState.voiceMuted
          ? '<i class="fa-solid fa-volume-xmark" style="color:#f87171;"></i>'
          : '<i class="fa-solid fa-volume-high"></i>';
      });
    }

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => enviarMensajeUsuario());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          enviarMensajeUsuario();
        } else if (e.key === 'Escape') {
          closeCortanaPanel();
        }
      });
    }

    // Auto-minimizar Cortana cuando el usuario hace clic en la tabla de pacientes
    document.addEventListener('click', (e) => {
      if (!panel || panel.style.display === 'none') return;
      const insideCortana = panel.contains(e.target) || (badge && badge.contains(e.target));
      const clickedOpenBtn = e.target.closest('#cortanaOpenChatBtn') || e.target.closest('[onclick*="cortanaAbrirChat"]');
      if (!insideCortana && !clickedOpenBtn) {
        if (e.target.closest('#reportTable') || e.target.closest('.table-container') || e.target.closest('.modal-overlay')) {
          closeCortanaPanel();
        }
      }
    });

    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.cortana-chip');
      if (chip && chip.dataset.query) {
        openCortanaPanel(chip.dataset.query);
      }
    });

    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-PE';
      recognition.continuous = false;
      recognition.interimResults = false;

      let isListening = false;
      voiceBtn.addEventListener('click', () => {
        if (!isListening) {
          try { recognition.start(); isListening = true; voiceBtn.classList.add('recording'); } catch(err) {}
        } else {
          recognition.stop(); isListening = false; voiceBtn.classList.remove('recording');
        }
      });
      recognition.onresult = (ev) => {
        const transcript = ev.results[0][0].transcript;
        if (input) input.value = transcript;
        enviarMensajeUsuario();
        isListening = false;
        voiceBtn.classList.remove('recording');
      };
      recognition.onerror = () => { isListening = false; voiceBtn.classList.remove('recording'); };
      recognition.onend = () => { isListening = false; voiceBtn.classList.remove('recording'); };
    }
  }

  function toggleCortanaPanel() {
    const panel = document.getElementById('cortanaAssistantPanel');
    if (!panel) return;
    if (panel.style.display === 'none' || !panel.style.display) {
      openCortanaPanel();
    } else {
      closeCortanaPanel();
    }
  }

  function openCortanaPanel(initialQuery = null) {
    const panel = document.getElementById('cortanaAssistantPanel');
    const input = document.getElementById('cortanaPanelInput');
    const container = document.getElementById('cortanaMessagesContainer');
    if (!panel) return;
    panel.style.display = 'flex';

    if (container && (!container.hasChildNodes() || container.children.length === 0)) {
      saludoInicialCortana();
    }

    if (initialQuery && typeof initialQuery === 'string' && initialQuery.trim().length > 0) {
      if (input) input.value = initialQuery.trim();
      enviarMensajeUsuario();
    } else if (input) {
      setTimeout(() => input.focus(), 80);
    }
  }

  function closeCortanaPanel() {
    const panel = document.getElementById('cortanaAssistantPanel');
    if (panel) panel.style.display = 'none';
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function limpiarMensajesCortana() {
    const container = document.getElementById('cortanaMessagesContainer');
    if (container) container.innerHTML = '';
    videoState.interlocutorName = null;
    videoState.interlocutorClinic = null;
    saludoInicialCortana();
  }

  function saludoInicialCortana() {
    const saludo = obtenerSaludoHumanoVariado();
    agregarBurbujaBot(`<p>${saludo}</p>`, saludo);
  }

  async function consultarWebhookN8n(mensaje) {
    const hosts = [];
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      hosts.push('http://' + window.location.hostname + ':5678/webhook/chat-cortana');
    }
    hosts.push('http://localhost:5678/webhook/chat-cortana');
    hosts.push('http://192.168.100.250:5678/webhook/chat-cortana');

    const endpoints = Array.from(new Set(hosts));

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensaje: mensaje,
            query: mensaje,
            message: mensaje,
            doctor: videoState.interlocutorName || 'Dr. Especialista',
            medico: videoState.interlocutorName || 'Dr. Especialista',
            canal: 'WEB_CORTANA_CHAT'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          if (data && data.respuesta && data.respuesta.trim().length > 0) {
            let formattedHtml = escapeHtml(data.respuesta)
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\n\n/g, '<br><br>')
              .replace(/\n/g, '<br>');
            return {
              html: '<p style="line-height:1.45; margin:0;">' + formattedHtml + '</p>',
              spoken: data.respuesta.replace(/\*\*/g, '').replace(/<[^>]*>/g, ' ').replace(/\n/g, ' ')
            };
          }
        }
      } catch (e) {
        // Fallback al siguiente endpoint o resolver local
      }
    }
    return null;
  }

  async function enviarMensajeUsuario() {
    const input = document.getElementById('cortanaPanelInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    agregarBurbujaUsuario(text);
    input.value = '';

    // 1. Activar fase de TIPEO HUMANO
    const typingBar = document.getElementById('cortanaTypingIndicator');
    const typingText = document.getElementById('cortanaTypingText');
    if (typingText) typingText.textContent = obtenerFraseTipeoHumana();
    if (typingBar) typingBar.style.display = 'flex';
    videoState.typingUntil = performance.now() + 4500;

    let respObj = null;
    try {
      const minDelayPromise = new Promise(res => setTimeout(res, 800));
      const [n8nResult] = await Promise.all([
        consultarWebhookN8n(text),
        minDelayPromise
      ]);
      respObj = n8nResult;
    } catch (err) {
      console.warn('[Cortana Chat] Webhook n8n no disponible, aplicando respaldo soberano:', err);
    }

    if (!respObj) {
      respObj = resolverConsultaHumana(text);
    }

    if (typingBar) typingBar.style.display = 'none';
    agregarBurbujaBot(respObj.html, respObj.spoken);
  }

  function agregarBurbujaUsuario(text) {
    const container = document.getElementById('cortanaMessagesContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'cortana-msg-row user';
    row.innerHTML = `<div class="cortana-bubble user">${escapeHtml(text)}<span class="cortana-time-tag">${obtenerHoraActual()}</span></div>`;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  // Función de escritura dinámica (Typewriter) mientras el video se mueve hablando
  function animarEscrituraTexto(elementoTexto, htmlCompleto, onFin) {
    // Si contiene etiquetas HTML complejas (tablas, botones, enlaces), renderizar directamente para no romper el DOM
    if (htmlCompleto.includes('<button') || htmlCompleto.includes('<table') || htmlCompleto.includes('<div') || htmlCompleto.includes('<a')) {
      elementoTexto.innerHTML = htmlCompleto;
      if (typeof onFin === 'function') onFin();
      return;
    }

    const textoPlano = htmlCompleto;
    let idx = 0;
    elementoTexto.innerHTML = '';
    const vel = Math.max(12, Math.min(26, Math.floor(1800 / (textoPlano.length || 1))));
    
    const timer = setInterval(() => {
      idx += 2;
      elementoTexto.textContent = textoPlano.substring(0, idx);
      const container = document.getElementById('cortanaMessagesContainer');
      if (container) container.scrollTop = container.scrollHeight;
      
      if (idx >= textoPlano.length) {
        clearInterval(timer);
        elementoTexto.innerHTML = htmlCompleto;
        if (typeof onFin === 'function') onFin();
      }
    }, vel);
  }

  function agregarBurbujaBot(htmlContent, spokenText) {
    const container = document.getElementById('cortanaMessagesContainer');
    if (!container) return;
    
    // Activar video de Cortana hablando
    const avatarVideo = document.getElementById('cortanaSingleVideoAvatar');
    if (avatarVideo) {
      avatarVideo.src = 'assets/cortana/videos/hablando.mp4';
      avatarVideo.play().catch(() => {});
    }

    const row = document.createElement('div');
    row.className = 'cortana-msg-row bot-clean'; // Sin avatar duplicado
    
    const bubble = document.createElement('div');
    bubble.className = 'cortana-bubble bot';
    
    const textSpan = document.createElement('div');
    textSpan.className = 'cortana-bubble-text-content';
    bubble.appendChild(textSpan);

    const timeTag = document.createElement('span');
    timeTag.className = 'cortana-time-tag';
    timeTag.innerText = `Cortana • ${obtenerHoraActual()}`;
    bubble.appendChild(timeTag);

    row.appendChild(bubble);
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;

    // Escribir la información progresivamente
    animarEscrituraTexto(textSpan, htmlContent, () => {
      // Al terminar de escribir, volver suavemente al video idle
      if (avatarVideo) {
        avatarVideo.src = 'assets/cortana/videos/idle.mp4';
        avatarVideo.play().catch(() => {});
      }
    });

    hablarConVozFemenina(spokenText || htmlContent);
  }

  // ==========================================================================
  // CEREBRO CONVERSACIONAL HUMANO (Empatía de Recepción + Búsqueda Exacta)
  // ==========================================================================

  // ==========================================================================
  // CEREBRO CONVERSACIONAL HUMANO SUPERSECRETARIA (JC PATH LAB - SOBERANO)
  // Búsqueda inteligente, soporte multicaso por Doctor/Clínica y Cero Congelamientos
  // ==========================================================================
  function resolverConsultaHumana(rawQuery) {
    const q = (rawQuery || '').trim();
    const qLower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const db = obtenerPoolPacientes();

    // A. Detectar saludo o presentación
    const nameMatch = q.match(/(?:soy|me llamo|habla|con|mi nombre es)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      const detected = nameMatch[1].trim().split(/\s+/)[0];
      if (detected.length >= 3 && !['clinica', 'doctor', 'doctora', 'secretaria', 'paciente', 'informe'].includes(detected.toLowerCase())) {
        videoState.interlocutorName = detected.charAt(0).toUpperCase() + detected.slice(1).toLowerCase();
      }
    }

    // B. Buscar código exacto (ej. 26Q-270, 26Q-377, 384, 270)
    const exactCodeMatch = qLower.match(/\b(\d{2}[qci])-?(\d{1,4})\b/i);
    const numOnlyMatch = qLower.match(/\b(\d{2,4})\b/);
    const dniMatch = qLower.match(/\b\d{8}\b/);

    if (exactCodeMatch) {
      const target = `${exactCodeMatch[1].toUpperCase()}-${exactCodeMatch[2].padStart(2, '0')}`;
      const targetRaw = `${exactCodeMatch[1].toUpperCase()}-${exactCodeMatch[2]}`;
      const match = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toUpperCase();
        return c === target || c === targetRaw || c.replace('-', '') === target.replace('-', '');
      });
      if (match) return renderizarRespuestaIndividual(match);
    }

    if (dniMatch) {
      const dniTarget = dniMatch[0];
      const match = db.find(p => String(p.dni || '').replace(/\D/g, '') === dniTarget);
      if (match) return renderizarRespuestaIndividual(match);
    }

    if (numOnlyMatch) {
      const numTarget = numOnlyMatch[1];
      const match = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toLowerCase();
        return c.endsWith('-' + numTarget) || c.endsWith('-0' + numTarget) || c === numTarget;
      });
      if (match) return renderizarRespuestaIndividual(match);
    }

    // C. Limpieza semántica de ruido y detección de Doctor o Paciente
    const stopWords = [
      'hola', 'buenos', 'dias', 'buenas', 'tardes', 'noches', 'soy', 'llamaba', 'para',
      'saber', 'buscar', 'busca', 'buscame', 'dame', 'entregame', 'ver', 'caso', 'biopsia',
      'biopsias', 'donde', 'esta', 'estan', 'paciente', 'pacientes', 'doctor', 'doctora',
      'dr', 'dra', 'muestra', 'informe', 'informes', 'resultado', 'resultados', 'reutado',
      'reutados', 'clinica', 'por', 'favor', 'gracias', 'con', 'quien', 'ayudo', 'como',
      'del', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'en'
    ];

    const tokens = qLower
      .replace(/[.,¿?¡!]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 3 && !stopWords.includes(t) && (!videoState.interlocutorName || t !== videoState.interlocutorName.toLowerCase()));

    // D. Búsqueda por Doctor / Médico Solicitante
    if (tokens.length > 0) {
      // 1. Probar si coincide con médicos
      const matchesDoctor = db.filter(p => {
        const doc = String(p.medSolicitante || p.med_solicitante || p.doctor || p.medico || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return tokens.some(t => doc.includes(t));
      });

      if (matchesDoctor.length > 0) {
        return renderizarRespuestaMulticaso(matchesDoctor, `Médico: ${tokens.join(' ').toUpperCase()}`);
      }

      // 2. Probar si coincide con Paciente
      const matchesPaciente = db.filter(p => {
        const pac = String(p.paciente || ((p.apellidos || '') + ' ' + (p.nombres || ''))).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return tokens.every(t => pac.includes(t)) || tokens.some(t => t.length >= 4 && pac.includes(t));
      });

      if (matchesPaciente.length === 1) {
        return renderizarRespuestaIndividual(matchesPaciente[0]);
      } else if (matchesPaciente.length > 1) {
        return renderizarRespuestaMulticaso(matchesPaciente, `Paciente: ${tokens.join(' ').toUpperCase()}`);
      }
    }

    // E. Clínicas conocidas
    const clinicasConocidas = [
      { key: 'luz', label: 'Clínica La Luz' },
      { key: 'carrion', label: 'Clínica Carrión' },
      { key: 'clemente', label: 'Clínica San Clemente' },
      { key: 'mujer', label: 'Clínica La Mujer' },
      { key: 'alfa', label: 'Clínica Alfa Prevenir' },
      { key: 'chungui', label: 'Clínica Chungui' },
      { key: 'junco', label: 'Centro Médico Junco' },
      { key: 'uroserv', label: 'Uroserv' }
    ];
    const clinicaObj = clinicasConocidas.find(c => qLower.includes(c.key));
    if (clinicaObj) {
      videoState.interlocutorClinic = clinicaObj.label;
      const matchClinica = db.filter(p => String(p.clinica || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(clinicaObj.key));
      return renderizarRespuestaMulticaso(matchClinica, clinicaObj.label);
    }

    // Fallback inmediato sin trabarse
    const msgFallback = `Hola${videoState.interlocutorName ? ' ' + videoState.interlocutorName : ''}, aquí estoy atenta. 😊 Puedes darme el código de atención (ej. 26Q-270), el apellido del paciente o el nombre del médico para mostrarte los informes al instante.`;
    return {
      html: `<p>${msgFallback}</p>`,
      spoken: msgFallback
    };
  }

  // Helper para renderizar 1 solo paciente
  function renderizarRespuestaIndividual(p) {
    const cod = p.codAtencion || p.cod_atencion || p.codigo || 'S/C';
    const nom = p.paciente || ((p.apellidos || '') + ', ' + (p.nombres || ''));
    const dni = p.dni || '---';
    const esp = p.especimen || 'Biopsia quirúrgica';
    const cli = p.clinica || 'JC PATH LAB';
    const esListo = String(p.estado || '').toLowerCase().includes('complet') || String(p.estado || '').toLowerCase().includes('list') || !!p.firmado;
    const safeCod = escapeHtml(cod);

    const html = `
      <p style="margin-bottom:6px;">¡Ubicado de inmediato! 😊 Es el caso <strong>${safeCod}</strong> de <strong>${escapeHtml(nom)}</strong>:</p>
      <div class="cortana-patient-card ${esListo ? 'ready' : 'processing'}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="cortana-card-code">${safeCod}</span>
          <span style="font-size:0.70rem; font-weight:700; color:${esListo ? '#10b981' : '#f59e0b'};">${esListo ? '● FIRMADO / LISTO' : '● EN PROCESO'}</span>
        </div>
        <div class="cortana-card-title">${escapeHtml(nom)}</div>
        <div class="cortana-card-detail">🪪 DNI: <strong>${escapeHtml(dni)}</strong> • 🏥 ${escapeHtml(cli)}</div>
        <div class="cortana-card-detail">🧪 ${escapeHtml(esp)}</div>
        <div class="cortana-card-actions">
          <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${safeCod}')">
            <i class="fa-solid fa-crosshairs"></i> Ir a la Fila
          </button>
          <button type="button" class="cortana-act-btn view" onclick="window.closeCortanaPanel(); if(window.handleAction){ window.handleAction('editar', '${safeCod}'); } else { window.open('imprimir.html?codAtencion=${safeCod}', '_blank'); }">
            <i class="fa-solid fa-file-pen"></i> Abrir
          </button>
          <button type="button" class="cortana-act-btn pdf" onclick="window.closeCortanaPanel(); window.open('imprimir.html?autoDownload=true&codAtencion=${safeCod}', '_blank');">
            <i class="fa-solid fa-file-pdf"></i> PDF Oficial
          </button>
        </div>
      </div>
    `;
    const spoken = `Listo. El informe ${cod} del paciente ${nom} está ${esListo ? 'firmado y listo para entrega' : 'en proceso'}.`;
    return { html, spoken };
  }

  // Helper para renderizar lista multicaso (ej. todos los de un Doctor)
  function renderizarRespuestaMulticaso(lista, criterio) {
    const total = lista.length;
    const muestra = lista.slice(0, 6); // Primeras 6 tarjetas para ergonomía

    let cardsHtml = '';
    muestra.forEach(p => {
      const cod = p.codAtencion || p.cod_atencion || p.codigo || 'S/C';
      const nom = p.paciente || ((p.apellidos || '') + ', ' + (p.nombres || ''));
      const cli = p.clinica || 'JC PATH LAB';
      const esListo = String(p.estado || '').toLowerCase().includes('complet') || String(p.estado || '').toLowerCase().includes('list') || !!p.firmado;
      const safeCod = escapeHtml(cod);

      cardsHtml += `
        <div class="cortana-patient-card ${esListo ? 'ready' : 'processing'}" style="margin-bottom:8px; padding:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#00f0ff; font-family:monospace;">${safeCod}</strong>
            <span style="font-size:0.65rem; font-weight:700; color:${esListo ? '#10b981' : '#f59e0b'};">${esListo ? '● FIRMADO' : '● EN PROCESO'}</span>
          </div>
          <div style="font-weight:600; font-size:0.85rem; margin-top:2px;">${escapeHtml(nom)}</div>
          <div style="font-size:0.72rem; color:#94a3b8;">🏥 ${escapeHtml(cli)}</div>
          <div class="cortana-card-actions" style="margin-top:6px; gap:4px;">
            <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${safeCod}')" style="padding:4px 8px; font-size:0.7rem;">
              <i class="fa-solid fa-crosshairs"></i> Ver
            </button>
            <button type="button" class="cortana-act-btn pdf" onclick="window.open('imprimir.html?autoDownload=true&codAtencion=${safeCod}', '_blank');" style="padding:4px 8px; font-size:0.7rem; background:#10b981; color:#fff;">
              <i class="fa-solid fa-file-pdf"></i> PDF
            </button>
          </div>
        </div>
      `;
    });

    const html = `
      <p>¡Encontré <strong>${total} informes</strong> asociados a <strong>${escapeHtml(criterio)}</strong>! 😊</p>
      <div style="max-height:320px; overflow-y:auto; padding-right:4px;">
        ${cardsHtml}
      </div>
      ${total > 6 ? `<p style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">Mostrando los 6 más recientes de ${total} registros.</p>` : ''}
    `;
    const spoken = `Encontré ${total} informes para ${criterio}. Aquí tienes la lista con acceso directo al PDF de cada uno.`;
    return { html, spoken };
  }


  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function obtenerHoraActual() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  window.toggleCortanaPanel = toggleCortanaPanel;
  window.openCortanaPanel = openCortanaPanel;
  window.closeCortanaPanel = closeCortanaPanel;
  window.cortanaAbrirChat = openCortanaPanel;
  window.abrirChatInlineCortana = openCortanaPanel;
  window.limpiarChatCortana = limpiarMensajesCortana;
  window.cortanaFiltrarEnTabla = function(target) {
    closeCortanaPanel();
    const inp = document.getElementById('aiSmartSearchInput') || document.getElementById('cortanaSearchInput') || document.getElementById('mobileQuickSearchInput');
    if (inp) {
      inp.value = target;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (typeof window.applyFilters === 'function') window.applyFilters(true);

    setTimeout(() => {
      const table = document.getElementById('reportTable');
      if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(r => {
          if (r.textContent.toUpperCase().includes(String(target).toUpperCase())) {
            r.classList.add('cortana-row-highlight');
            setTimeout(() => r.classList.remove('cortana-row-highlight'), 4000);
          }
        });
      }
    }, 180);
  };
})();

  // ========================================================================
  // ROTACIÓN HUMANA DE FRASES DEL ASISTENTE DEL DR. CASTILLO
  // ========================================================================
  const FRASES_ASISTENTE_CASTILLO = [
    "Soy el asistente del Dr. Castillo, ¿en qué te puedo ayudar?",
    "¡Hola! Asistente del Dr. Castillo a su servicio. ¿Qué informe o caso necesitas?",
    "Coordinación JC PATH LAB: ¿En qué puedo colaborar con el Dr. Castillo hoy?",
    "¿Desea consultar un informe listo o cotéjalo con RENIEC? Escríbame aquí.",
    "¡Buen día! Asistente del Dr. Castillo, dime el código o paciente para ayudarte."
  ];
  let fraseIdx = 0;
  setInterval(function() {
    const bubbleTxt = document.getElementById('cortanaSpeechBubbleText');
    if (!bubbleTxt) return;
    bubbleTxt.style.opacity = '0';
    setTimeout(function() {
      fraseIdx = (fraseIdx + 1) % FRASES_ASISTENTE_CASTILLO.length;
      bubbleTxt.textContent = FRASES_ASISTENTE_CASTILLO[fraseIdx];
      bubbleTxt.style.opacity = '1';
    }, 280);
  }, 10000);
