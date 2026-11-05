/**
 * ============================================================================
 * CORTANA - ASISTENTE Y SECRETARIA MÉDICA DIGITAL DE ALTA GAMA (JC PATH LAB)
 * Entidad #21 de La Colmena • 100% Offline • Cero Créditos
 * Avatar Fotorrealista • Localización Instantánea de Expedientes para Secretarias
 * ============================================================================
 */

(function() {
  const AVATAR_URL = 'assets/cortana/cortana_avatar_face.jpg';

  // Pool de frases humanas, empáticas y ejecutivas
  const FRASES_SECRETARIA = [
    'Hola, estoy lista para ayudarte a ubicar cualquier biopsia o resultado.',
    'Buenas tardes, ¿qué paciente o informe necesitas localizar en este momento?',
    'Hola, dime el código de atención o apellido y lo encuentro de inmediato.',
    '¿En qué reporte te colaboro el día de hoy?',
    'Buenas tardes, ¿deseas revisar algún paciente de Clínica La Luz, Carrión o San Clemente?',
    '¿Te puedo ayudar a verificar algún estado de citología o biopsia quirúrgica?'
  ];

  let fraseIndex = 0;
  function obtenerFraseProactiva() {
    const f = FRASES_SECRETARIA[fraseIndex % FRASES_SECRETARIA.length];
    fraseIndex++;
    return f;
  }

  // 1. INICIALIZACIÓN
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCortanaSystem);
  } else {
    initCortanaSystem();
  }

  function initCortanaSystem() {
    inyectarUIFlotanteCortana();
    conectarEventosCortana();
  }

  // 2. INYECCIÓN DINÁMICA DEL WIDGET FLOTANTE Y PANEL
  function inyectarUIFlotanteCortana() {
    if (document.getElementById('cortanaFloatingBadge')) return;

    // A. Badge Flotante Inferior
    const badge = document.createElement('div');
    badge.id = 'cortanaFloatingBadge';
    badge.className = 'cortana-floating-badge';
    badge.title = 'Cortana · Secretaria Médica Digital (Clic para abrir)';
    badge.innerHTML = `
      <div class="cortana-avatar-ring">
        <img src="${AVATAR_URL}" alt="Cortana Secretaria Médica" class="cortana-avatar-img" onerror="this.onerror=null; this.src='icon-192.png';">
        <span class="cortana-status-pulse"></span>
      </div>
      <div class="cortana-badge-text">
        <span class="cortana-badge-name">Cortana <i class="fa-solid fa-sparkles" style="color:#38bdf8; font-size:0.75rem;"></i></span>
        <span class="cortana-badge-role">Secretaria Médica IA</span>
      </div>
      <span class="cortana-badge-chip">Ayuda 1-Clic</span>
    `;
    document.body.appendChild(badge);

    // B. Panel Desplegable de Asistencia
    const panel = document.createElement('div');
    panel.id = 'cortanaAssistantPanel';
    panel.className = 'cortana-assistant-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="cortana-panel-header">
        <div class="cortana-header-profile">
          <div class="cortana-avatar-wrapper">
            <img src="${AVATAR_URL}" alt="Cortana" class="cortana-header-avatar" onerror="this.onerror=null; this.src='icon-192.png';">
            <span class="cortana-online-dot"></span>
          </div>
          <div class="cortana-header-info">
            <div class="cortana-header-name">Cortana <span class="cortana-role-badge">JC PATH LAB</span></div>
            <div class="cortana-header-sub">Secretaria Médica Digital · Asistencia Rápida</div>
          </div>
        </div>
        <div class="cortana-header-actions">
          <button type="button" class="cortana-header-btn" id="btnCortanaClearChat" title="Limpiar conversación"><i class="fa-solid fa-trash-can"></i></button>
          <button type="button" class="cortana-header-btn" id="btnCortanaClosePanel" title="Cerrar asistente"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      <div class="cortana-quick-chips">
        <button type="button" class="cortana-chip" data-query="informes listos de hoy">📋 Listos hoy</button>
        <button type="button" class="cortana-chip" data-query="pacientes de Clinica La Luz">🏥 Clínica La Luz</button>
        <button type="button" class="cortana-chip" data-query="pacientes de San Clemente">🏥 San Clemente</button>
        <button type="button" class="cortana-chip" data-query="como registro un paciente">❓ Nuevo Paciente</button>
        <button type="button" class="cortana-chip" data-query="como imprimo o descargo un informe">🖨️ Imprimir / PDF</button>
      </div>
      <div id="cortanaMessagesContainer" class="cortana-messages-container"></div>
      <div class="cortana-panel-input-box">
        <input type="text" id="cortanaPanelInput" class="cortana-panel-input" placeholder="Pregunta por paciente, código o escribe una duda..." autocomplete="off">
        <button type="button" id="btnCortanaVoiceInPanel" class="cortana-input-btn voice" title="Dictar consulta por voz"><i class="fa-solid fa-microphone"></i></button>
        <button type="button" id="btnCortanaSendInPanel" class="cortana-input-btn send" title="Enviar"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  // 3. CONEXIÓN DE EVENTOS
  function conectarEventosCortana() {
    const badge = document.getElementById('cortanaFloatingBadge');
    const panel = document.getElementById('cortanaAssistantPanel');
    const closeBtn = document.getElementById('btnCortanaClosePanel');
    const clearBtn = document.getElementById('btnCortanaClearChat');
    const input = document.getElementById('cortanaPanelInput');
    const sendBtn = document.getElementById('btnCortanaSendInPanel');
    const voiceBtn = document.getElementById('btnCortanaVoiceInPanel');

    if (badge) {
      badge.addEventListener('click', () => toggleCortanaPanel());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeCortanaPanel());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => limpiarMensajesCortana());
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

    // Chips de consulta rápida
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.cortana-chip');
      if (chip && chip.dataset.query) {
        const q = chip.dataset.query;
        openCortanaPanel(q);
      }
    });

    // Soporte de voz (Web Speech API)
    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-PE';
      recognition.continuous = false;
      recognition.interimResults = false;

      let isListening = false;
      voiceBtn.addEventListener('click', () => {
        if (!isListening) {
          try {
            recognition.start();
            isListening = true;
            voiceBtn.classList.add('recording');
          } catch(err) {}
        } else {
          recognition.stop();
          isListening = false;
          voiceBtn.classList.remove('recording');
        }
      });

      recognition.onresult = (ev) => {
        const transcript = ev.results[0][0].transcript;
        if (input) input.value = transcript;
        enviarMensajeUsuario();
        isListening = false;
        voiceBtn.classList.remove('recording');
      };

      recognition.onerror = () => {
        isListening = false;
        voiceBtn.classList.remove('recording');
      };

      recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('recording');
      };
    }
  }

  // 4. CONTROL DE VISIBILIDAD
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

    // Saludo proactivo inicial si está vacío
    if (container && (!container.hasChildNodes() || container.children.length === 0)) {
      saludoInicialCortana();
    }

    if (initialQuery && initialQuery.trim()) {
      if (input) input.value = initialQuery;
      enviarMensajeUsuario();
    } else if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }

  function closeCortanaPanel() {
    const panel = document.getElementById('cortanaAssistantPanel');
    if (panel) panel.style.display = 'none';
  }

  function saludoInicialCortana() {
    const user = getSessionUser();
    const nombre = obtenerTratamientoUsuario(user);
    const frase = obtenerFraseProactiva();

    agregarMensajeBot(`
      <p>Hola <strong>${escapeHtml(nombre)}</strong>. ${frase}</p>
      <p style="font-size:0.77rem; color:#94a3b8; margin-top:4px;">
        💡 Puedes preguntarme por:
      </p>
      <ul style="margin:4px 0 0 16px; padding:0; font-size:0.76rem; color:#cbd5e1; line-height:1.45;">
        <li>Código de atención (ej. <em>"384"</em> o <em>"26Q-343"</em>)</li>
        <li>Apellidos del paciente (ej. <em>"Bustamante"</em>, <em>"Cama"</em>)</li>
        <li>Pacientes por sede (ej. <em>"Clínica La Luz"</em>, <em>"Carrión"</em>)</li>
        <li>Ayuda operativa: <em>"¿Cómo registro un paciente?"</em></li>
      </ul>
    `);
  }

  function limpiarMensajesCortana() {
    const container = document.getElementById('cortanaMessagesContainer');
    if (container) {
      container.innerHTML = '';
      saludoInicialCortana();
    }
  }

  // 5. ENVÍO Y PROCESAMIENTO DE MENSAJES
  function enviarMensajeUsuario() {
    const input = document.getElementById('cortanaPanelInput');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;

    agregarMensajeUsuario(texto);
    input.value = '';

    procesarPreguntaSecretaria(texto);
  }

  function agregarMensajeUsuario(texto) {
    const container = document.getElementById('cortanaMessagesContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'cortana-msg-row user';
    row.innerHTML = `
      <div class="cortana-bubble user">
        <p>${escapeHtml(texto)}</p>
        <span class="cortana-time-tag">${obtenerHoraActual()}</span>
      </div>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function agregarMensajeBot(htmlContent) {
    const container = document.getElementById('cortanaMessagesContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'cortana-msg-row bot';
    row.innerHTML = `
      <img src="${AVATAR_URL}" alt="Cortana" class="cortana-bubble-avatar" onerror="this.onerror=null; this.src='icon-192.png';">
      <div class="cortana-bubble bot">
        ${htmlContent}
        <span class="cortana-time-tag">Cortana • ${obtenerHoraActual()}</span>
      </div>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function mostrarEscribiendo() {
    const container = document.getElementById('cortanaMessagesContainer');
    if (!container) return null;

    const row = document.createElement('div');
    row.id = 'cortanaTypingIndicator';
    row.className = 'cortana-msg-row bot';
    row.innerHTML = `
      <img src="${AVATAR_URL}" alt="Cortana" class="cortana-bubble-avatar">
      <div class="cortana-bubble bot" style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:0.75rem; color:#94a3b8;">Cortana está buscando...</span>
        <div class="cortana-inline-dot" style="width:6px; height:6px; border-radius:50%; background:#38bdf8;"></div>
      </div>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
    return row;
  }

  function removerEscribiendo() {
    const el = document.getElementById('cortanaTypingIndicator');
    if (el) el.remove();
  }

  // 6. MOTOR INTELIGENTE DE RESPUESTAS PARA SECRETARIAS (0ms SOBERANO)
  function procesarPreguntaSecretaria(query) {
    mostrarEscribiendo();

    // Pequeño retardo humano natural de 250ms
    setTimeout(() => {
      removerEscribiendo();
      const resHtml = resolverConsulta(query);
      agregarMensajeBot(resHtml);
    }, 280);
  }

  function resolverConsulta(rawQuery) {
    const q = (rawQuery || '').trim().toLowerCase();
    const user = getSessionUser();
    const isAdmin = checkIsAdmin(user);
    const userClinic = String(user.clinica || user.sede || user.nombres || '').trim().toLowerCase();

    // Obtener base de datos en memoria O(1)
    const db = (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) ? window.patientDatabase :
               (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) ? window.REAL_SUPABASE_PATIENTS :
               (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) ? window.realSupabaseBackup : [];

    // A. Consultas de Ayuda Operativa
    if (q.includes('como registro') || q.includes('nuevo paciente') || q.includes('ingresar paciente') || q.includes('registrar')) {
      return `
        <p><strong>Para ingresar un nuevo paciente al sistema:</strong></p>
        <ol style="margin:4px 0 6px 16px; padding:0; font-size:0.78rem; line-height:1.5;">
          <li>Haz clic en el botón verde <strong>"Nuevo"</strong> del menú lateral o presiona <code>F2</code>.</li>
          <li>Ingresa el <strong>DNI</strong> (si es DNI peruano de 8 dígitos se autocompletará) o los apellidos y nombres.</li>
          <li>Selecciona la <strong>Clínica de Procedencia</strong> y el servicio (Biopsia Quirúrgica 'Q' o Citología 'C').</li>
          <li>Haz clic en <strong>"Guardar Expediente"</strong>. El sistema le asignará su código correlativo de inmediato.</li>
        </ol>
        <div class="cortana-card-actions">
          <button type="button" class="cortana-act-btn view" onclick="window.openModal ? window.openModal('patientRegistrationModal') : (document.getElementById('patientRegistrationModal') ? document.getElementById('patientRegistrationModal').classList.add('active') : null)">
            <i class="fa-solid fa-user-plus"></i> Abrir Formulario de Registro
          </button>
        </div>
      `;
    }

    if (q.includes('como imprimo') || q.includes('descargar pdf') || q.includes('imprimir') || q.includes('boleta') || q.includes('ticket')) {
      return `
        <p><strong>Para descargar o imprimir informes y boletas:</strong></p>
        <ul style="margin:4px 0 6px 16px; padding:0; font-size:0.78rem; line-height:1.5;">
          <li><strong>Informe Médico en PDF:</strong> En la tabla principal, pulsa el botón con icono de PDF 📄 (o el botón verde "Descargar"). Se abrirá el documento listo para guardar o imprimir.</li>
          <li><strong>Boleta / Constancia:</strong> Usa el botón superior <strong>"Reporte de Boletas"</strong> o pulsa "Imprimir Boleta" en la tarjeta de cualquier paciente.</li>
        </ul>
        <div class="cortana-card-actions">
          <button type="button" class="cortana-act-btn view" onclick="window.switchSidebarView ? window.switchSidebarView('boletas') : null">
            <i class="fa-solid fa-file-invoice-dollar"></i> Ir a Reporte de Boletas
          </button>
        </div>
      `;
    }

    if (q.includes('formol') || q.includes('fijador') || q.includes('fijacion') || q.includes('tamponado')) {
      return `
        <p><strong>Protocolo Institucional de Fijación de Muestras:</strong></p>
        <ul style="margin:4px 0 6px 16px; padding:0; font-size:0.78rem; line-height:1.5;">
          <li><strong>Fijador oficial:</strong> Formaldehído neutro al 10% tamponado (buffer fosfato a pH 7.0).</li>
          <li><strong>Proporción obligatoria:</strong> 10 volúmenes de formol por cada 1 volumen de muestra tisular (10:1).</li>
          <li><strong>Precaución:</strong> No usar alcohol ni suero fisiológico para biopsias que requieran estudio histológico.</li>
        </ul>
      `;
    }

    // B. Búsqueda por Código de Atención o DNI
    const codeMatch = q.match(/\b(?:26)?([qc])-?(\d{1,4})\b/i) || q.match(/\b(\d{2,4})\b/);
    const dniMatch = q.match(/\b\d{8}\b/);

    let pacienteEncontrado = null;

    if (codeMatch) {
      const numTarget = codeMatch[codeMatch.length - 1];
      pacienteEncontrado = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toLowerCase();
        return c.includes(numTarget);
      });
    }

    if (!pacienteEncontrado && dniMatch) {
      const dniTarget = dniMatch[0];
      pacienteEncontrado = db.find(p => {
        const d = String(p.dni || p.numDni || p.numero_documento || '').replace(/\D/g, '');
        return d === dniTarget;
      });
    }

    // Búsqueda por texto (nombre, apellido o espécimen)
    if (!pacienteEncontrado) {
      const tokens = q.split(/\s+/).filter(t => t.length >= 3 && !['buscar', 'caso', 'biopsia', 'donde', 'esta', 'paciente', 'doctor', 'muestra', 'informe', 'favor', 'como'].includes(t));
      if (tokens.length > 0) {
        pacienteEncontrado = db.find(p => {
          const nom = String(p.paciente || ((p.apellidos || '') + ' ' + (p.nombres || ''))).toLowerCase();
          const med = String(p.medico || p.medSolicitante || '').toLowerCase();
          const esp = String(p.especimen || p.tipoMuestra || '').toLowerCase();
          return tokens.some(t => nom.includes(t) || med.includes(t) || esp.includes(t));
        });
      }
    }

    // SI ENCONTRÓ UN PACIENTE ESPECÍFICO:
    if (pacienteEncontrado) {
      const cod = pacienteEncontrado.codAtencion || pacienteEncontrado.cod_atencion || pacienteEncontrado.codigo || 'S/C';
      const nom = pacienteEncontrado.paciente || ((pacienteEncontrado.apellidos || '') + ', ' + (pacienteEncontrado.nombres || ''));
      const dni = pacienteEncontrado.dni || pacienteEncontrado.numDni || 'Sin DNI';
      const esp = pacienteEncontrado.especimen || pacienteEncontrado.tipoMuestra || 'Biopsia quirúrgica';
      const med = pacienteEncontrado.medico || pacienteEncontrado.medSolicitante || 'Dr. Solicitante';
      const cli = pacienteEncontrado.clinica || pacienteEncontrado.clinicaProcedencia || 'JC PATH LAB';
      const diag = pacienteEncontrado.diagnostico || pacienteEncontrado.diagFinal || 'En proceso de lectura microscópica.';
      const rec = pacienteEncontrado.fecRecepcion || pacienteEncontrado.fecRegistro || pacienteEncontrado.fechaIngreso || '-';
      const esListo = String(pacienteEncontrado.estado || '').toLowerCase().includes('list') || !!pacienteEncontrado.informeListo;

      const safeCod = escapeHtml(cod);

      return `
        <p>¡Localicé el expediente solicitado!</p>
        <div class="cortana-patient-card ${esListo ? 'ready' : 'processing'}">
          <span class="cortana-card-code">${safeCod}</span>
          <div class="cortana-card-title">${escapeHtml(nom)} (DNI: ${escapeHtml(dni)})</div>
          <div class="cortana-card-detail">🧪 <strong>Estudio:</strong> ${escapeHtml(esp)}</div>
          <div class="cortana-card-detail">🏥 <strong>Sede:</strong> ${escapeHtml(cli)} • <strong>Médico:</strong> ${escapeHtml(med)}</div>
          <div class="cortana-card-detail" style="margin-top:4px; padding-top:4px; border-top:1px dashed rgba(255,255,255,0.1);">
            📋 <strong>Diagnóstico:</strong> <span style="color:${esListo ? '#34d399' : '#fbbf24'}; font-weight:600;">${escapeHtml(diag)}</span>
          </div>
          <div class="cortana-card-detail" style="font-size:0.72rem; color:#64748b; margin-top:2px;">
            📅 Ingreso: ${escapeHtml(rec)} | Estado: <strong>${esListo ? 'LISTO' : 'EN PROCESO'}</strong>
          </div>
          <div class="cortana-card-actions">
            <button type="button" class="cortana-act-btn view" onclick="window.handleAction ? window.handleAction('editar', '${safeCod}') : null">
              <i class="fa-solid fa-file-pen"></i> Ver / Editar
            </button>
            <button type="button" class="cortana-act-btn pdf" onclick="window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : window.open('imprimir.html?autoDownload=true&codAtencion=${safeCod}')">
              <i class="fa-solid fa-file-pdf"></i> Descargar PDF
            </button>
            <button type="button" class="cortana-act-btn print" onclick="window.open('imprimir.html?autoDownload=true&codAtencion=${safeCod}', '_blank')">
              <i class="fa-solid fa-print"></i> Boleta
            </button>
            <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${safeCod}')">
              <i class="fa-solid fa-table"></i> Ubicar en Tabla
            </button>
          </div>
        </div>
      `;
    }

    // C. Búsqueda por Clínicas (La Luz, Carrión, San Clemente, La Mujer, Alfa Prevenir)
    const clinicasConocidas = ['luz', 'carrion', 'clemente', 'mujer', 'alfa', 'chungui', 'junco', 'uroserv'];
    const clinicaDetectada = clinicasConocidas.find(c => q.includes(c));

    if (clinicaDetectada) {
      const matchClinica = db.filter(p => {
        const c = String(p.clinica || p.clinicaProcedencia || '').toLowerCase();
        return c.includes(clinicaDetectada);
      });

      if (matchClinica.length > 0) {
        const top3 = matchClinica.slice(0, 3);
        let itemsHtml = top3.map(p => `
          <div style="margin:4px 0; padding:4px 6px; background:rgba(255,255,255,0.04); border-radius:6px; font-size:0.75rem;">
            <strong>${escapeHtml(p.codAtencion || p.codigo)}:</strong> ${escapeHtml(p.paciente || p.apellidos || '')} (${escapeHtml(p.especimen || '')})
          </div>
        `).join('');

        return `
          <p>Encontré <strong>${matchClinica.length} expedientes</strong> asociados a esta institución médica.</p>
          <div style="margin:6px 0;">${itemsHtml}</div>
          <div class="cortana-card-actions">
            <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${clinicaDetectada}')">
              <i class="fa-solid fa-filter"></i> Filtrar los ${matchClinica.length} pacientes en la tabla
            </button>
          </div>
        `;
      }
    }

    // D. Búsqueda por Estado General
    if (q.includes('listo') || q.includes('listos') || q.includes('completados')) {
      const listos = db.filter(p => String(p.estado || '').toLowerCase().includes('list') || p.informeListo);
      return `
        <p>Tenemos <strong>${listos.length} informes validados y listos</strong> para entrega.</p>
        <div class="cortana-card-actions">
          <button type="button" class="cortana-act-btn filter" onclick="sessionStorage.setItem('activePillFilter', 'listos'); if(typeof window.applyFilters==='function') window.applyFilters(true);">
            <i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Mostrar listos en la tabla
          </button>
        </div>
      `;
    }

    // Fallback humano
    const frase = obtenerFraseProactiva();
    return `
      <p>No encontré un informe exacto con esos términos.</p>
      <p>Por favor indícame el <strong>código de biopsia</strong> (ej. <em>384</em>), el <strong>DNI</strong> o el <strong>apellido del paciente</strong>.</p>
      <p style="color:#38bdf8; font-weight:600;">${frase}</p>
    `;
  }

  // 7. HELPERS
  function getSessionUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}') || {};
    } catch(e) {
      return {};
    }
  }

  function checkIsAdmin(user) {
    if (!user || !user.usuario) return true;
    const p = String(user.perfil || user.rol || '').toLowerCase();
    const u = String(user.usuario || '').toLowerCase();
    const n = String(user.nombres || user.nombre || '').toUpperCase();
    return p.includes('admin') || u === 'admin' || u === '41457466' || n.includes('CASTILLO') || n.includes('JOSEHP');
  }

  function obtenerTratamientoUsuario(user) {
    if (checkIsAdmin(user)) return 'Dr. José Castillo';
    const nom = String(user.nombres || user.nombre || '').trim();
    return nom || 'Secretaria';
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
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // 8. EXPOSICIÓN GLOBAL
  window.toggleCortanaPanel = toggleCortanaPanel;
  window.openCortanaPanel = openCortanaPanel;
  window.closeCortanaPanel = closeCortanaPanel;
  window.cortanaAbrirChat = openCortanaPanel;
  window.abrirChatInlineCortana = openCortanaPanel;
  window.limpiarChatCortana = limpiarMensajesCortana;
  window.cortanaEnviarMensajeRapido = function(msg) {
    openCortanaPanel(msg);
  };
  window.cortanaFiltrarEnTabla = function(target) {
    const inp = document.getElementById('aiSmartSearchInput') || document.getElementById('mobileQuickSearchInput');
    if (inp) inp.value = target;
    if (typeof window.applyFilters === 'function') window.applyFilters(true);
  };
})();
