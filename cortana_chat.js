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
    iniciarMotorVideo60FPS();
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

  // ==========================================================================
  // MOTOR DE VIDEO BIOMECÁNICO A 60 FPS (Labios, Ojos, Tipeo y Oficina Viva)
  // ==========================================================================
  function iniciarMotorVideo60FPS() {
    const canvas = document.getElementById('cortanaLiveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const bgImg = new Image();
    const fgImg = new Image();
    let bgLoaded = false;
    let fgLoaded = false;

    bgImg.onload = () => { bgLoaded = true; };
    fgImg.onload = () => { fgLoaded = true; };
    bgImg.src = OFFICE_PORTRAIT_URL;
    fgImg.src = FG_MATTE_URL;

    // Coordenadas anatómicas calibradas sobre 560x368
    const LEFT_EYE = { x: 260, y: 170, rx: 13, ry: 7 };
    const RIGHT_EYE = { x: 327, y: 160, rx: 14, ry: 7 };
    const MOUTH = { x: 301, y: 236, w: 48, h: 22 };

    function renderLoop(now) {
      requestAnimationFrame(renderLoop);
      const panel = document.getElementById('cortanaAssistantPanel');
      if (!panel || panel.style.display === 'none' || !bgLoaded) return;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Determinar modo activo
      if (now < videoState.typingUntil) {
        videoState.mode = 'typing';
      } else if (now < videoState.speakingUntil) {
        videoState.mode = 'speaking';
      } else {
        videoState.mode = 'listening';
      }

      // Actualizar etiquetas HUD
      const hudTag = document.getElementById('cortanaHudActionTag');
      const stateLabel = document.getElementById('cortanaLiveStateLabel');
      if (videoState.mode === 'typing') {
        if (hudTag) hudTag.textContent = '⌨️ Tipeando en el sistema...';
        if (stateLabel) stateLabel.textContent = 'Mirando su teclado · Buscando expediente...';
      } else if (videoState.mode === 'speaking') {
        if (hudTag) hudTag.textContent = '🗣️ Hablándote en vivo...';
        if (stateLabel) stateLabel.textContent = 'Respondiéndote en directo · JC PATH LAB';
      } else {
        if (hudTag) hudTag.textContent = '👀 Mirándote · Escuchando';
        if (stateLabel) stateLabel.textContent = 'Atenta a tu consulta · Recepción JC PATH LAB';
      }

      // 1. CAPA 0: Fondo de Oficina JC LAB con sutil paneo de cámara en vivo
      const camSwayX = Math.sin(now * 0.0008) * 2.2;
      const camSwayY = Math.cos(now * 0.0011) * 1.4;
      ctx.save();
      ctx.drawImage(bgImg, camSwayX - 3, camSwayY - 2, W + 6, H + 4);

      // 2. CAPA 1: Personas / colegas caminando DETRÁS de Cortana en la oficina
      // (Se dibujan después del fondo y ANTES de la silueta recortada fgImg de Cortana)
      videoState.passersby.forEach((p) => {
        if (p.delay > 0) {
          p.delay--;
          return;
        }
        p.x += p.speed * p.dir;
        const bobY = Math.sin(now * 0.009 + p.x * 0.08) * 3.2;
        if (p.dir === 1 && p.x > W + 110) {
          p.x = -100;
          p.delay = 140 + Math.floor(Math.random() * 180);
        } else if (p.dir === -1 && p.x < -110) {
          p.x = W + 100;
          p.delay = 160 + Math.floor(Math.random() * 200);
        }

        ctx.save();
        ctx.filter = 'blur(5px)';
        const px = p.x + camSwayX;
        const py = p.y + bobY + camSwayY;
        const sc = p.scale;

        // Sombra suave ambiental
        ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
        ctx.beginPath();
        ctx.ellipse(px, py + 72 * sc, 34 * sc, 68 * sc, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bata blanca médica de colega caminando en segundo plano
        ctx.fillStyle = p.coatColor;
        ctx.beginPath();
        ctx.ellipse(px, py + 76 * sc, 31 * sc, 64 * sc, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cabeza en movimiento
        ctx.fillStyle = p.headColor;
        ctx.beginPath();
        ctx.arc(px, py + 6 * sc, 16 * sc, 0, Math.PI * 2);
        ctx.fill();

        // Cabello oscuro sutil
        ctx.fillStyle = 'rgba(30, 25, 22, 0.32)';
        ctx.beginPath();
        ctx.arc(px, py + 2 * sc, 16 * sc, Math.PI, Math.PI * 2);
        ctx.fill();

        // Carpeta / portapapeles clínico en mano
        ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
        ctx.fillRect(px + (p.dir * 12 * sc), py + 48 * sc, 16 * sc, 22 * sc);
        ctx.restore();
      });
      ctx.restore();

      // 3. CAPA 2: Cuerpo y Rostro de Cortana con Lenguaje Corporal a 60 FPS
      // Calcular respiración, postura de tipeo e inclinación empática
      let breathY = Math.sin(now * 0.0026) * 2.1;
      let headTiltRad = Math.sin(now * 0.0014) * 0.012;
      let bodyShiftX = camSwayX * 0.6;
      let bodyShiftY = breathY;
      let typingShoulderJitter = 0;

      if (videoState.mode === 'typing') {
        // Cuando tipea: inclina ligeramente la cabeza y mirada hacia abajo y mueve hombros al teclear
        bodyShiftY += 4.5 + Math.sin(now * 0.032) * 1.1;
        bodyShiftX += Math.cos(now * 0.025) * 1.3;
        headTiltRad = -0.022 + Math.sin(now * 0.018) * 0.008;
        typingShoulderJitter = Math.sin(now * 0.045) * 1.6;
      } else if (videoState.mode === 'speaking') {
        // Cuando habla: micro-expresión activa y asentimiento natural
        bodyShiftY += Math.sin(now * 0.008) * 1.5;
        headTiltRad = Math.sin(now * 0.0045) * 0.018;
      }

      ctx.save();
      ctx.translate(W * 0.5 + bodyShiftX, H * 0.55 + bodyShiftY);
      ctx.rotate(headTiltRad);
      ctx.translate(-W * 0.5, -H * 0.55);

      const activePortrait = fgLoaded ? fgImg : bgImg;
      ctx.drawImage(activePortrait, 0, 0, W, H);

      // Si está tipeando, animar sutilmente los hombros/brazos (y=260..368) simulando tecleo rápido
      if (videoState.mode === 'typing') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(110, 265, 360, 103);
        ctx.clip();
        ctx.drawImage(
          activePortrait,
          110, 265, 360, 103,
          110 + typingShoulderJitter, 265 + Math.abs(typingShoulderJitter) * 0.7, 360, 103
        );
        // Reflejo azulado suave del monitor clínico sobre su rostro y bata mientras tipea
        const monGrad = ctx.createRadialGradient(300, 260, 10, 300, 220, 160);
        monGrad.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
        monGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        ctx.fillStyle = monGrad;
        ctx.fillRect(140, 80, 320, 280);
        ctx.restore();
      }

      // 4. PARPADEO FISIOLÓGICO HUMANO Y DIRECCIÓN DE MIRADA (CUANDO ESCUCHA VS TIPEA)
      if (now >= videoState.nextBlinkAt) {
        videoState.blinkStart = now;
        // Parpadeo humano aleatorio cada 2.6s a 5.4s (con doble parpadeo ocasional)
        const isDouble = Math.random() < 0.22;
        videoState.nextBlinkAt = now + (isDouble ? 320 : (2600 + Math.random() * 2800));
      }
      const blinkElapsed = now - videoState.blinkStart;
      let blinkFactor = 0;
      if (blinkElapsed >= 0 && blinkElapsed <= videoState.blinkDuration) {
        blinkFactor = Math.sin((blinkElapsed / videoState.blinkDuration) * Math.PI);
      }
      // Si está tipeando, entrecierra los párpados superiores 38% mirando su teclado/pantalla inferior
      if (videoState.mode === 'typing') {
        blinkFactor = Math.max(blinkFactor, 0.42);
      }

      if (blinkFactor > 0.05) {
        [LEFT_EYE, RIGHT_EYE].forEach((eye) => {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(eye.x, eye.y, eye.rx, eye.ry * blinkFactor, -0.14, 0, Math.PI * 2);
          // Tono cálido real de su párpado superior + línea de pestañas
          const lidGrad = ctx.createLinearGradient(eye.x, eye.y - eye.ry, eye.x, eye.y + eye.ry);
          lidGrad.addColorStop(0, 'rgba(218, 174, 148, 0.94)');
          lidGrad.addColorStop(0.75, 'rgba(198, 150, 125, 0.95)');
          lidGrad.addColorStop(1, 'rgba(58, 38, 30, 0.92)');
          ctx.fillStyle = lidGrad;
          ctx.fill();
          ctx.restore();
        });
      } else {
        // Brillo ocular vivo (catchlight corneal que se mueve al mirarte)
        const gazeOffsetX = videoState.mode === 'listening' ? Math.sin(now * 0.002) * 1.4 : 0;
        const gazeOffsetY = videoState.mode === 'typing' ? 2.2 : Math.cos(now * 0.0017) * 0.8;
        [LEFT_EYE, RIGHT_EYE].forEach((eye) => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
          ctx.beginPath();
          ctx.arc(eye.x - 2 + gazeOffsetX, eye.y - 2 + gazeOffsetY, 1.45, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 5. SINCRONIZACIÓN LABIAL Y MANDIBULAR A 60 FPS (CUANDO HABLA)
      if (videoState.mode === 'speaking') {
        // Onda fonética combinada de sílabas (vocales abiertas + consonantes bilabiales)
        const wave1 = Math.sin(now * 0.028);
        const wave2 = Math.sin(now * 0.047 + 1.3);
        const wave3 = Math.cos(now * 0.019);
        const mouthOpen = Math.max(0, (wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.2 + 0.35)) * 7.2;

        if (mouthOpen > 0.6) {
          ctx.save();
          // Desplazar suavemente el labio inferior y mentón hacia abajo según mouthOpen
          const chinBoxX = MOUTH.x - 28;
          const chinBoxY = MOUTH.y;
          const chinBoxW = 56;
          const chinBoxH = 34;

          ctx.beginPath();
          ctx.ellipse(MOUTH.x, MOUTH.y + 12, 26, 20, -0.08, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            activePortrait,
            chinBoxX, chinBoxY, chinBoxW, chinBoxH,
            chinBoxX, chinBoxY + mouthOpen * 0.82, chinBoxW, chinBoxH
          );
          ctx.restore();

          // Cavidad oral interna natural, línea dental superior sutil y sombra labial
          ctx.save();
          const rxMouth = 13.5 + Math.sin(now * 0.021) * 2.2;
          const ryMouth = Math.min(5.8, mouthOpen * 0.58);
          ctx.beginPath();
          ctx.ellipse(MOUTH.x, MOUTH.y + 1.2, rxMouth, ryMouth, -0.07, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(68, 22, 26, 0.86)';
          ctx.fill();

          // Sutil destello de dientes superiores en vocales abiertas
          if (ryMouth > 2.1) {
            ctx.beginPath();
            ctx.ellipse(MOUTH.x, MOUTH.y - ryMouth * 0.25, rxMouth * 0.68, ryMouth * 0.38, -0.07, 0, Math.PI);
            ctx.fillStyle = 'rgba(248, 245, 242, 0.76)';
            ctx.fill();
          }

          // Contorno cálido de labio superior e inferior
          ctx.strokeStyle = 'rgba(182, 92, 88, 0.72)';
          ctx.lineWidth = 1.3;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
    }

    requestAnimationFrame(renderLoop);
  }

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

    // Fallback Groq migrado a Docker n8n backend seguro

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
  function resolverConsultaHumana(rawQuery) {
    const q = (rawQuery || '').trim();
    const qLower = q.toLowerCase();
    const db = obtenerPoolPacientes();

    // A. Detectar si la persona se está presentando (ej. "Hola soy María de la Clínica La Luz")
    const nameMatch = q.match(/(?:soy|me llamo|habla|con|mi nombre es)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      const detected = nameMatch[1].trim().split(/\s+/)[0];
      if (detected.length >= 3 && !['clinica', 'doctor', 'doctora', 'secretaria', 'paciente', 'informe'].includes(detected.toLowerCase())) {
        videoState.interlocutorName = detected.charAt(0).toUpperCase() + detected.slice(1).toLowerCase();
      }
    }

    const trato = videoState.interlocutorName ? `${videoState.interlocutorName}` : 'corazón';

    // B. Buscar código exacto (ej. 26Q-377, 384), DNI o apellido de paciente
    const exactCodeMatch = qLower.match(/\b(\d{2}[qci])-?(\d{1,4})\b/i);
    const numOnlyMatch = qLower.match(/\b(\d{2,4})\b/);
    const dniMatch = qLower.match(/\b\d{8}\b/);

    let pacienteEncontrado = null;

    if (exactCodeMatch) {
      const target = `${exactCodeMatch[1].toUpperCase()}-${exactCodeMatch[2].padStart(2, '0')}`;
      const targetRaw = `${exactCodeMatch[1].toUpperCase()}-${exactCodeMatch[2]}`;
      pacienteEncontrado = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toUpperCase();
        return c === target || c === targetRaw;
      });
    }

    if (!pacienteEncontrado && dniMatch) {
      const dniTarget = dniMatch[0];
      pacienteEncontrado = db.find(p => String(p.dni || '').replace(/\D/g, '') === dniTarget);
    }

    if (!pacienteEncontrado && numOnlyMatch) {
      const numTarget = numOnlyMatch[1];
      pacienteEncontrado = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toLowerCase();
        return c.endsWith('-' + numTarget) || c.endsWith('-0' + numTarget);
      });
    }

    if (!pacienteEncontrado) {
      const stopWords = ['hola', 'buenos', 'dias', 'buenas', 'tardes', 'noches', 'soy', 'llamaba', 'para', 'saber', 'buscar', 'caso', 'biopsia', 'donde', 'esta', 'paciente', 'doctor', 'doctora', 'muestra', 'informe', 'clinica', 'por', 'favor', 'gracias', 'con', 'quien', 'ayudo', 'como'];
      const tokens = qLower
        .replace(/[.,¿?¡!]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length >= 3 && !stopWords.includes(t) && (!videoState.interlocutorName || t !== videoState.interlocutorName.toLowerCase()));
      if (tokens.length > 0) {
        pacienteEncontrado = db.find(p => {
          const nom = String(p.paciente || ((p.apellidos || '') + ' ' + (p.nombres || ''))).toLowerCase();
          const med = String(p.medSolicitante || p.med_solicitante || p.doctor || '').toLowerCase();
          return tokens.every(t => nom.includes(t) || med.includes(t));
        });
      }
    }

    if (pacienteEncontrado) {
      const cod = pacienteEncontrado.codAtencion || pacienteEncontrado.cod_atencion || pacienteEncontrado.codigo || 'S/C';
      const nom = pacienteEncontrado.paciente || ((pacienteEncontrado.apellidos || '') + ', ' + (pacienteEncontrado.nombres || ''));
      const dni = pacienteEncontrado.dni || '---';
      const esp = pacienteEncontrado.especimen || 'Biopsia quirúrgica';
      const cli = pacienteEncontrado.clinica || 'JC PATH LAB';
      const esListo = String(pacienteEncontrado.estado || '').toLowerCase().includes('complet') || String(pacienteEncontrado.estado || '').toLowerCase().includes('list') || !!pacienteEncontrado.firmado;
      const safeCod = escapeHtml(cod);

      const introFrases = [
        `¡Aquí lo tengo en mi pantalla${videoState.interlocutorName ? ', ' + videoState.interlocutorName : ''}! 😊 Es el caso <strong>${safeCod}</strong> de <strong>${escapeHtml(nom)}</strong>.`,
        `¡Listo, ya lo ubiqué en el sistema! Mira, corresponde al código <strong>${safeCod}</strong> (${escapeHtml(nom)}).`,
        `¡Encontrado al toque! 😊 Aquí tienes los datos del informe <strong>${safeCod}</strong>:`
      ];
      const introElegida = introFrases[Math.floor(Math.random() * introFrases.length)];
      const spoken = `Listo, ya lo tengo aquí en mi pantalla. Es el informe ${cod} del paciente ${nom}, estado ${esListo ? 'firmado y listo para entrega' : 'en procesamiento en el laboratorio'}.`;

      const html = `
        <p style="margin-bottom:6px;">${introElegida}</p>
        <div class="cortana-patient-card ${esListo ? 'ready' : 'processing'}">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="cortana-card-code">${safeCod}</span>
            <span style="font-size:0.68rem; font-weight:700; color:${esListo ? '#10b981' : '#f59e0b'};">${esListo ? '● FIRMADO / LISTO' : '● EN PROCESO'}</span>
          </div>
          <div class="cortana-card-title">${escapeHtml(nom)}</div>
          <div class="cortana-card-detail">🪪 DNI: <strong>${escapeHtml(dni)}</strong> • 🏥 ${escapeHtml(cli)}</div>
          <div class="cortana-card-detail">🧪 ${escapeHtml(esp)}</div>
          <div class="cortana-card-actions">
            <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${safeCod}')">
              <i class="fa-solid fa-crosshairs"></i> Ir a la Fila (Auto-Cerrar)
            </button>
                        <button type="button" class="cortana-act-btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; font-weight:700;" onclick="window.closeCortanaPanel(); if(window.openReportEditor){ window.openReportEditor('26Q-383'); setTimeout(() => window.inyectarYGuardar26Q383Oficial && window.inyectarYGuardar26Q383Oficial(true), 350); }">
              <i class="fa-solid fa-file-circle-check"></i> Cargar PDF y Guardar
            </button>
            <button type="button" class="cortana-act-btn view" onclick="window.closeCortanaPanel(); window.handleAction ? window.handleAction('editar', '${safeCod}') : null">
              <i class="fa-solid fa-file-pen"></i> Abrir
            </button>
            <button type="button" class="cortana-act-btn pdf" onclick="window.closeCortanaPanel(); window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : window.open('imprimir.html?autoDownload=true&codAtencion=${safeCod}')">
              <i class="fa-solid fa-file-pdf"></i> PDF
            </button>
          </div>
        </div>
      `;
      return { html, spoken };
    }

    // C. Si menciona una clínica conocida
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
    const clinicaObj = clinicasConocidas.find(c => qLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(c.key));
    if (clinicaObj) {
      videoState.interlocutorClinic = clinicaObj.label;
      const matchClinica = db.filter(p => String(p.clinica || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(clinicaObj.key));
      const saludoNombre = videoState.interlocutorName ? `¡Qué gusto saludarte, <strong>${videoState.interlocutorName}</strong> de <strong>${clinicaObj.label}</strong>! 😊` : `¡Bienvenida, <strong>${clinicaObj.label}</strong>! Qué gusto atenderles 😊`;
      const spoken = `Qué gusto saludarte de ${clinicaObj.label}. Acabo de filtrar sus ${matchClinica.length} informes en el sistema. Dime el apellido del paciente o dale al botón para verlos todos en la tabla.`;
      return {
        html: `
          <p>${saludoNombre} Acabo de revisar aquí en el sistema y tenemos <strong>${matchClinica.length} informes registrados</strong> de su sede.</p>
          <p style="margin-top:4px;">¿De qué pacientito necesitas el resultado hoy? Si quieres, te filtro los ${matchClinica.length} en la tabla ahorita mismo:</p>
          <div class="cortana-card-actions" style="margin-top:6px;">
            <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${clinicaObj.key}')">
              <i class="fa-solid fa-filter"></i> Ver los ${matchClinica.length} de ${clinicaObj.label} (Auto-Cerrar)
            </button>
          </div>
        `,
        spoken
      };
    }

    // D. Si pide informes listos
    if (qLower.includes('listo') || qLower.includes('completado') || qLower.includes('firmado')) {
      const listos = db.filter(p => p.firmado || String(p.estado || '').toLowerCase().includes('complet'));
      const spoken = `Claro que sí. Ahorita mismo tenemos ${listos.length} informes ya firmados por el doctor Castillo y listos para imprimir.`;
      return {
        html: `
          <p>¡Claro que sí${videoState.interlocutorName ? ', ' + videoState.interlocutorName : ''}! 😊 Ahorita mismo tenemos <strong>${listos.length} informes firmados por el Dr. Castillo</strong> y listos para descargar.</p>
          <div class="cortana-card-actions" style="margin-top:6px;">
            <button type="button" class="cortana-act-btn filter" onclick="window.closeCortanaPanel(); if(typeof window.cortanaFiltrar==='function') window.cortanaFiltrar('listos');">
              <i class="fa-solid fa-circle-check"></i> Mostrar los listos en la tabla
            </button>
          </div>
        `,
        spoken
      };
    }

    // E. Si la persona se acaba de presentar con su nombre o saluda ("Hola", "Buenos días soy Rocío")
    if (videoState.interlocutorName && (qLower.includes('hola') || qLower.includes('buen') || qLower.includes('soy') || qLower.includes('llamo'))) {
      const resp = `¡Hola <strong>${videoState.interlocutorName}</strong>, qué alegría saludarte! 😊 Cuéntame, ¿de qué clínica te comunicas hoy o qué apellido de paciente te busco aquí en mi computadora?`;
      return { html: `<p>${resp}</p>`, spoken: resp };
    }

    // F. Respuesta conversacional cálida con variaciones humanas
    
    // --- PROTOCOLOS CLINICOS OFICIALES JC PATH LAB (100% OFFLINE RESILIENTE) ---
    // 1. Toma de muestras y fijación con formol
    if (qLower.includes('formol') || qLower.includes('fijar') || qLower.includes('fijacion') || qLower.includes('conservar') || (qLower.includes('muestra') && (qLower.includes('como') || qLower.includes('preparar') || qLower.includes('enviar') || qLower.includes('liquido')))) {
      const spoken = "Para conservar una biopsia correctamente, la regla de oro es Formol al 10% neutro tamponado en proporción de una parte de tejido por diez partes de formol. El frasco debe ser hermético de boca ancha y estar bien rotulado con el nombre y DNI del paciente.";
      return {
        html: `
          <p><strong>🔬 Protocolo Oficial de Fijación de Biopsias:</strong></p>
          <div class="cortana-patient-card ready" style="margin: 8px 0; font-size: 0.84rem;">
            <p style="margin: 3px 0;"><strong>1. Fijador Estándar:</strong> Formol buffer neutro al <strong>10%</strong> (pH 7.0 - 7.2). Nunca usar alcohol, suero ni agua para piezas quirúrgicas histológicas.</p>
            <p style="margin: 3px 0;"><strong>2. Proporción Volumétrica:</strong> <strong>1:10</strong> (1 volumen de tejido por 10 volúmenes de fijador). La muestra debe flotar libremente sin comprimirse.</p>
            <p style="margin: 3px 0;"><strong>3. Recipiente:</strong> Frasco plástico hermético de boca ancha debidamente rotulado con: <em>Nombre completo, DNI, Fecha y Tipo de Muestra / Órgano</em>.</p>
          </div>
          <div class="cortana-card-actions" style="margin-top:6px;">
            <a href="https://wa.me/51986396733?text=Hola%20Dr.%20Castillo,%20necesito%20coordinar%20el%20envio%20de%20una%20biopsia" target="_blank" class="cortana-act-btn filter" style="text-decoration:none;">
              <i class="fa-brands fa-whatsapp"></i> Coordinar Envío por WhatsApp
            </a>
          </div>
        `,
        spoken
      };
    }

    // 2. Citología, Papanicolaou y PAAF
    if (qLower.includes('papanicolau') || qLower.includes('papanicolaou') || qLower.includes('pap') || qLower.includes('citologia') || qLower.includes('paaf') || qLower.includes('frotis') || qLower.includes('fijar citologia')) {
      const spoken = "Para citologías y frotis de Papanicolaou, la fijación debe ser inmediata en alcohol al 96% o cito-spray en menos de 10 segundos para evitar artefacto por desecación al aire.";
      return {
        html: `
          <p><strong>🧪 Protocolo de Citología y Papanicolaou:</strong></p>
          <div class="cortana-patient-card ready" style="margin: 8px 0; font-size: 0.84rem;">
            <p style="margin: 3px 0;"><strong>1. Fijación Inmediata:</strong> Sumergir en alcohol al <strong>96%</strong> o aplicar cito-spray a 20 cm en <strong>menos de 10 segundos</strong> tras la toma. No permitir secado al aire.</p>
            <p style="margin: 3px 0;"><strong>2. Identificación de Lámina:</strong> Rotular en el extremo esmerilado con lápiz de grafito o marcador indeleble resistente a solventes.</p>
            <p style="margin: 3px 0;"><strong>3. Tiempo de Resultado:</strong> Entrega garantizada en <strong>24 a 48 horas</strong> con clasificación Bethesda 2020.</p>
          </div>
        `,
        spoken
      };
    }

    // 3. Inmunohistoquímica (IHQ) y bloques de parafina
    if (qLower.includes('ihq') || qLower.includes('inmuno') || qLower.includes('inmunohistoquimica') || qLower.includes('bloque') || qLower.includes('parafina') || qLower.includes('marcador')) {
      const spoken = "Para paneles de inmunohistoquímica, se requiere el bloque de parafina del centro de procedencia acompañado de su lámina H y E de referencia. Contamos con más de 150 anticuerpos en stock local con entrega en 48 a 72 horas.";
      return {
        html: `
          <p><strong>🧬 Servicio de Inmunohistoquímica de Alta Complejidad:</strong></p>
          <div class="cortana-patient-card ready" style="margin: 8px 0; font-size: 0.84rem;">
            <p style="margin: 3px 0;"><strong>Requisitos:</strong> Bloque de parafina representativo con suficiente celularidad tumoral + Lámina H&E original de biopsia.</p>
            <p style="margin: 3px 0;"><strong>Capacidad:</strong> <strong>150+ anticuerpos</strong> en stock local (Dabbs / ImmunoQuery) con tecnología automatizada de recuperación antigénica.</p>
            <p style="margin: 3px 0;"><strong>Tiempo de Entrega:</strong> <strong>48 a 72 horas hábiles</strong>.</p>
          </div>
          <div class="cortana-card-actions" style="margin-top:6px;">
            <a href="creador-paneles-ihq.html" class="cortana-act-btn filter" style="text-decoration:none;">
              <i class="fa-solid fa-dna"></i> Abrir Simulador de Paneles IHQ
            </a>
          </div>
        `,
        spoken
      };
    }

    // 4. Tiempos de entrega y tarifas
    if (qLower.includes('tiempo') || qLower.includes('cuanto demora') || qLower.includes('cuando esta') || qLower.includes('demora') || qLower.includes('precio') || qLower.includes('costo') || qLower.includes('tarifa')) {
      const spoken = "Nuestros tiempos oficiales de entrega son de 24 a 48 horas para biopsias rutinarias y endoscópicas, 48 a 72 horas para inmunohistoquímica y 72 a 96 horas para piezas quirúrgicas oncológicas complejas.";
      return {
        html: `
          <p><strong>⏱️ Tiempos de Entrega & Tarifario Institucional:</strong></p>
          <div class="cortana-patient-card ready" style="margin: 8px 0; font-size: 0.84rem;">
            <p style="margin: 3px 0;">• <strong>Biopsias Endoscópicas / Piel:</strong> 24 a 48 horas hábiles.</p>
            <p style="margin: 3px 0;">• <strong>Citología / Papanicolaou:</strong> 24 a 48 horas hábiles.</p>
            <p style="margin: 3px 0;">• <strong>Inmunohistoquímica (IHQ):</strong> 48 a 72 horas hábiles.</p>
            <p style="margin: 3px 0;">• <strong>Piezas Quirúrgicas Oncológicas:</strong> 72 a 96 horas hábiles (incluye inclusión múltiple y márgenes).</p>
          </div>
          <div class="cortana-card-actions" style="margin-top:6px;">
            <a href="precios.html" class="cortana-act-btn view" style="text-decoration:none;">
              <i class="fa-solid fa-list-check"></i> Ver Lista de Precios
            </a>
          </div>
        `,
        spoken
      };
    }

    // 5. Horarios, sedes y contacto WhatsApp
    if (qLower.includes('horario') || qLower.includes('atencion') || qLower.includes('donde estan') || qLower.includes('direccion') || qLower.includes('ubicacion') || qLower.includes('sede') || qLower.includes('telefono') || qLower.includes('whatsapp') || qLower.includes('contacto')) {
      const spoken = "Atendemos de Lunes a Sábado de 8 de la mañana a 7 de la noche. Nuestra sede central está en Lima con recepción y cobertura a nivel nacional. Puede comunicarse directamente al WhatsApp oficial 986 396 733 o al 924 196 281.";
      return {
        html: `
          <p><strong>📍 Sedes & Horario de Atención:</strong></p>
          <div class="cortana-patient-card ready" style="margin: 8px 0; font-size: 0.84rem;">
            <p style="margin: 3px 0;"><strong>Horario:</strong> Lunes a Sábado: <strong>8:00 AM – 7:00 PM</strong>.</p>
            <p style="margin: 3px 0;"><strong>Recepción:</strong> Lima Norte / Cobertura nacional mediante envíos seguros por Olva Courier, Shalom o motorizado clínico.</p>
            <p style="margin: 3px 0;"><strong>Teléfonos:</strong> <strong>+51 986 396 733</strong> / <strong>+51 924 196 281</strong>.</p>
          </div>
          <div class="cortana-card-actions" style="margin-top:6px;">
            <a href="https://wa.me/51986396733" target="_blank" class="cortana-act-btn filter" style="text-decoration:none;">
              <i class="fa-brands fa-whatsapp"></i> Hablar por WhatsApp
            </a>
          </div>
        `,
        spoken
      };
    }

    const respuestasHumanas = [
      `¡Hola! 😊 Disculpa, no alcancé a encontrar ese nombre exacto aquí en mi pantalla. ¿Me confirmas con quién tengo el gusto y el <strong>apellido del paciente</strong> o su <strong>código</strong> (ej. <em>26Q-377</em>)?`,
      `Cuéntame con confianza 😊 ¿Con quién me comunico y de qué clínica nos escribes? Pásame el apellido del paciente o su DNI y te lo busco ahorita mismo.`,
      `¡Aquí te escucho! 😊 Dime el código de la biopsia (como <em>377</em> o <em>384</em>) o el apellido del paciente para llevarte directo a su fila.`
    ];
    const r = respuestasHumanas[Math.floor(Math.random() * respuestasHumanas.length)];
    return { html: `<p>${r}</p>`, spoken: r };
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
          if (r.innerText.toUpperCase().includes(String(target).toUpperCase())) {
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
