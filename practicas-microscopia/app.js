/**
 * Patología Especial - Clases Prácticas de Microscopía
 * UNMSM - Facultad de Medicina San Fernando / Instituto de Patología
 * 
 * Arquitectura Basada en:
 * - Neurociencia Cognitiva (Sweller, Paivio, Von Restorff)
 * - Psicología Conductual (BJ Fogg B=MAP, Endowed Progress Effect)
 * - Glassmorphism Clínico
 */

(() => {
  'use strict';

  // ==========================================
  // 1. ESTADO GLOBAL & PERSISTENCIA LOCAL
  // ==========================================
  const STORAGE_KEY = 'UNMSM_PATOLOGIA_SPECIAL_PROGRESS_V1';
  const NOTES_KEY = 'UNMSM_PATOLOGIA_STUDENT_NOTES_V1';
  const THEME_KEY = 'UNMSM_PATOLOGIA_THEME_V1';

  const defaultProgress = {
    // Endowed Progress Effect: el estudiante inicia con el 12.5% pre-acreditado (Láminas introductorias dominadas)
    endowed: true,
    completedSlides: ['L01-01', 'L01-02', 'L02-01'],
    studiedWeeks: [1],
    favoriteSlides: []
  };

  let appState = {
    currentView: 'grid', // 'grid' | 'timeline' | 'table'
    activeUnit: 'all',  // 'all' | 'U1' | 'U2' | 'U3' | 'U4'
    activeFilter: 'all', // 'all' | 'pending' | 'completed' | 'exam'
    searchQuery: '',
    activeRecallMode: false,
    selectedSlide: null,
    progress: loadProgress(),
    notes: loadNotes(),
    theme: localStorage.getItem(THEME_KEY) || 'dark'
  };

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error al cargar progreso:', e);
    }
    return { ...defaultProgress };
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.progress));
      updateProgressUI();
    } catch (e) {
      console.warn('Error al guardar progreso:', e);
    }
  }

  function loadNotes() {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error al cargar notas:', e);
    }
    return {};
  }

  function saveNoteForSlide(slideId, text) {
    appState.notes[slideId] = text;
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(appState.notes));
    } catch (e) {
      console.warn('Error al guardar notas:', e);
    }
  }

  // ==========================================
  // 2. HELPER DE DATOS & PRÓXIMA CLASE (FOGG)
  // ==========================================
  function getWeeksData() {
    return (window.PATOLOGIA_DATA && window.PATOLOGIA_DATA.semanas) ? window.PATOLOGIA_DATA.semanas : [];
  }

  function getUpcomingLabSession() {
    const weeks = getWeeksData();
    if (!weeks.length) return null;

    for (const week of weeks) {
      if (!appState.progress.studiedWeeks.includes(week.semana)) {
        return week;
      }
    }
    return weeks[0];
  }

  // ==========================================
  // 3. INICIALIZACIÓN Y RENDERIZADO
  // ==========================================
  function initApp() {
    document.documentElement.setAttribute('data-theme', appState.theme);
    const themeToggle = document.getElementById('btnThemeToggle');
    if (themeToggle) {
      themeToggle.textContent = appState.theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    }

    // Configurar enlace de retorno inteligente
    const backBtn = document.getElementById('btnBackToPortal');
    if (backBtn) {
      const path = (window.location.pathname || '').toUpperCase();
      if (path.includes('ARCHIVO-DE-REPORTES')) {
        backBtn.href = '../reportes.html';
        backBtn.innerHTML = '<span>←</span> <span>Reportes</span>';
      } else {
        backBtn.href = '../index.html';
        backBtn.innerHTML = '<span>←</span> <span>Portal</span>';
      }
    }

    setupEventListeners();
    updateProgressUI();
    renderHeroBanner();
    renderContent();
    initChaptersSidebar();
  }

  function renderHeroBanner() {
    const upcoming = getUpcomingLabSession();
    const heroContent = document.getElementById('heroUpcomingDetails');
    if (!heroContent || !upcoming) return;

    const isExam = upcoming.esExamen;
    heroContent.innerHTML = `
      <div class="hero-badge ${isExam ? 'hero-badge-exam' : ''}">
        ${isExam ? '🔥 HITO EVALUATIVO' : '⚡ PRÓXIMO LABORATORIO'}
      </div>
      <h3 class="hero-week-title">Semana ${String(upcoming.semana).padStart(2, '0')}: ${escapeHtml(upcoming.titulo)}</h3>
      <p class="hero-meta-desc">
        <span>📅 <strong>Mar: ${upcoming.fechas.martes}</strong> (17:00–19:00 h) | <strong>Jue: ${upcoming.fechas.jueves}</strong> (15:00–19:00 h)</span>
        <span>📍 ${escapeHtml(upcoming.lugar)}</span>
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary" id="btnGoToUpcoming" data-week="${upcoming.semana}">
          🔍 Explorar Láminas de la Semana
        </button>
        <button class="btn btn-outline" id="btnToggleActiveRecall">
          🧠 ${appState.activeRecallMode ? 'Desactivar Active Recall' : 'Activar Modo Active Recall'}
        </button>
      </div>
    `;

    document.getElementById('btnGoToUpcoming')?.addEventListener('click', (e) => {
      const wNum = e.currentTarget.getAttribute('data-week');
      scrollToWeek(wNum);
    });

    document.getElementById('btnToggleActiveRecall')?.addEventListener('click', () => {
      toggleActiveRecall();
    });
  }

  function updateProgressUI() {
    const weeks = getWeeksData();
    let totalSlides = 0;
    weeks.forEach(w => { totalSlides += (w.laminas ? w.laminas.length : 0); });

    const completedCount = appState.progress.completedSlides.length;
    const percentage = totalSlides > 0 ? Math.min(100, Math.round((completedCount / totalSlides) * 100)) : 0;

    const bar = document.getElementById('semesterProgressBar');
    const text = document.getElementById('progressPercentageText');
    const statsText = document.getElementById('progressRatioText');

    if (bar) bar.style.width = `${percentage}%`;
    if (text) text.textContent = `${percentage}%`;
    if (statsText) statsText.textContent = `${completedCount} de ${totalSlides} láminas dominadas`;
  }

  function filterWeeks() {
    const weeks = getWeeksData();
    return weeks.filter(week => {
      // Filtro por unidad
      if (appState.activeUnit !== 'all') {
        const targetU = 'U' + appState.activeUnit;
        if (week.unidadId !== targetU && week.unidadId !== appState.activeUnit) {
          return false;
        }
      }

      // Filtro por estado
      const slides = week.laminas || [];
      const hasAllSlides = slides.length > 0 && slides.every(s => appState.progress.completedSlides.includes(s.id));
      const weekDone = appState.progress.studiedWeeks.includes(week.semana) || hasAllSlides;

      if (appState.activeFilter === 'completed') {
        if (!weekDone) return false;
      } else if (appState.activeFilter === 'pending') {
        if (weekDone) return false;
      } else if (appState.activeFilter === 'exam') {
        if (!week.esExamen) return false;
      }

      // Filtro por búsqueda
      if (appState.searchQuery.trim() !== '') {
        const q = normalizeString(appState.searchQuery);
        const matchTitle = normalizeString(week.titulo).includes(q);
        const matchResumen = normalizeString(week.resumenSemana || '').includes(q);
        const matchSlides = slides.some(s => 
          normalizeString(s.diagnostico).includes(q) || 
          normalizeString(s.organo).includes(q) ||
          normalizeString(s.tincion).includes(q) ||
          (s.triadaPatognomonica && s.triadaPatognomonica.some(f => normalizeString(f).includes(q))) ||
          normalizeString(s.perlaDiagnostica || '').includes(q)
        );
        if (!matchTitle && !matchResumen && !matchSlides) return false;
      }

      return true;
    });
  }

  function renderContent() {
    const container = document.getElementById('viewsContainer');
    if (!container) return;

    const filtered = filterWeeks();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔬</div>
          <h3>No se encontraron temas ni láminas</h3>
          <p>Prueba con otros términos de búsqueda o selecciona otra unidad temática.</p>
          <button class="btn btn-secondary" id="btnResetFilters">Restablecer Filtros</button>
        </div>
      `;
      document.getElementById('btnResetFilters')?.addEventListener('click', resetFilters);
      return;
    }

    if (appState.currentView === 'grid') {
      renderGridView(container, filtered);
    } else if (appState.currentView === 'timeline') {
      renderTimelineView(container, filtered);
    } else if (appState.currentView === 'table') {
      renderTableView(container, filtered);
    }

    attachCardInteractions();
  }

  // ------------------------------------------
  // VISTA BENTO GRID (Neurociencia: Chunking)
  // ------------------------------------------
  function renderGridView(container, weeks) {
    let html = '<div class="bento-grid-view">';
    weeks.forEach(week => {
      const isExam = week.esExamen;
      const isVonRestorff = week.semana === 8 || week.semana === 16;
      const slides = week.laminas || [];
      const allDone = slides.length > 0 && slides.every(s => appState.progress.completedSlides.includes(s.id));

      html += `
        <article class="bento-card ${isExam ? 'bento-card-exam' : ''} ${isVonRestorff ? 'von-restorff-card' : ''}" id="weekCard-${week.semana}">
          <div class="bento-card-header">
            <div class="bento-badge-group">
              <span class="badge-week">SEM ${String(week.semana).padStart(2, '0')}</span>
              <span class="badge-unit">${week.unidadId}</span>
              ${isExam ? '<span class="badge-exam-alert">EXAMEN PRÁCTICO</span>' : ''}
              ${allDone ? '<span class="badge-done">COMPLETO ✓</span>' : ''}
            </div>
            <button class="btn-icon-fav" title="Marcar semana como estudiada" data-week-id="${week.semana}">
              ${appState.progress.studiedWeeks.includes(week.semana) ? '⭐' : '☆'}
            </button>
          </div>

          <h3 class="bento-title">${escapeHtml(week.titulo)}</h3>
          
          <div class="bento-meta-bar">
            <span>📅 Mar: ${week.fechas.martes} (17-19 h)</span>
            <span>📅 Jue: ${week.fechas.jueves} (15-19 h)</span>
          </div>

          <div class="bento-slides-list">
            <div class="bento-slides-title">Láminas & Diagnósticos Histopatológicos:</div>
            ${slides.length > 0 ? slides.map(slide => {
              const isStudied = appState.progress.completedSlides.includes(slide.id);
              return `
                <div class="slide-pill ${isStudied ? 'slide-studied' : ''}" data-slide-id="${slide.id}">
                  <span class="slide-pill-check" data-action="toggle-slide" data-slide-id="${slide.id}">
                    ${isStudied ? '☑' : '☐'}
                  </span>
                  <div class="slide-pill-info" data-action="open-modal" data-slide-id="${slide.id}">
                    <span class="slide-pill-organ">[${escapeHtml(slide.organo)}]</span>
                    <strong class="slide-pill-name ${appState.activeRecallMode ? 'recall-blurred' : ''}">${escapeHtml(slide.diagnostico)}</strong>
                    <span class="slide-pill-stain">${escapeHtml(slide.tincion)}</span>
                  </div>
                  <button class="btn-micro-peek" data-action="open-modal" data-slide-id="${slide.id}" title="Ver detalles microscópicos">
                    🔬
                  </button>
                </div>
              `;
            }).join('') : `
              <div class="bento-exam-box">
                <p><strong>Evaluación Práctica con Microscopía:</strong></p>
                <p>${escapeHtml(week.resumenSemana)}</p>
              </div>
            `}
          </div>

          <div class="bento-card-footer">
            <span class="bento-loc">📍 ${escapeHtml(week.lugar)}</span>
            <span class="bento-duration">⏱️ ${week.duracion}</span>
          </div>
        </article>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ------------------------------------------
  // VISTA LÍNEA DE TIEMPO CRONOLÓGICA
  // ------------------------------------------
  function renderTimelineView(container, weeks) {
    let html = '<div class="timeline-view">';
    weeks.forEach(week => {
      const isExam = week.esExamen;
      const isDone = appState.progress.studiedWeeks.includes(week.semana);
      const slides = week.laminas || [];

      html += `
        <div class="timeline-node ${isExam ? 'timeline-node-exam' : ''} ${isDone ? 'timeline-node-done' : ''}" id="timelineWeek-${week.semana}">
          <div class="timeline-marker">
            <span class="timeline-dot"></span>
            <span class="timeline-num">${week.semana}</span>
          </div>
          <div class="timeline-content glass-panel">
            <div class="timeline-header">
              <span class="badge-week">SEMANA ${String(week.semana).padStart(2, '0')}</span>
              <span class="badge-unit">${week.unidadId}</span>
              ${isExam ? '<span class="badge-exam-alert">HITO DE EVALUACIÓN</span>' : ''}
              <span class="timeline-date-label">📅 Mar ${week.fechas.martes} & Jue ${week.fechas.jueves}</span>
            </div>
            
            <h3 class="timeline-title">${escapeHtml(week.titulo)}</h3>
            <p class="timeline-desc">${escapeHtml(week.resumenSemana || '')}</p>

            <div class="timeline-slides-grid">
              ${slides.map(slide => {
                const isStudied = appState.progress.completedSlides.includes(slide.id);
                return `
                  <div class="timeline-slide-card ${isStudied ? 'slide-studied' : ''}" data-action="open-modal" data-slide-id="${slide.id}">
                    <div class="tsc-top">
                      <span class="tsc-organ">${escapeHtml(slide.organo)}</span>
                      <span class="tsc-badge">${escapeHtml(slide.aumentoRecomendado || '10X-40X')}</span>
                    </div>
                    <div class="tsc-title ${appState.activeRecallMode ? 'recall-blurred' : ''}">${escapeHtml(slide.diagnostico)}</div>
                    <div class="tsc-footer">
                      <span>${escapeHtml(slide.tincion)}</span>
                      <button class="btn-check-toggle" data-action="toggle-slide" data-slide-id="${slide.id}">
                        ${isStudied ? 'Estudiada ✓' : 'Marcar'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ------------------------------------------
  // VISTA TABLA SINÓPTICA
  // ------------------------------------------
  function renderTableView(container, weeks) {
    let html = `
      <div class="table-view-container glass-panel">
        <table class="synoptic-table">
          <thead>
            <tr>
              <th style="width:60px">Sem.</th>
              <th style="width:140px">Fechas & Horarios</th>
              <th>Tema y Diagnósticos Microscópicos</th>
              <th style="width:130px">Órgano / Tinción</th>
              <th style="width:120px">Sede / Dur.</th>
              <th style="width:90px; text-align:center">Estado</th>
            </tr>
          </thead>
          <tbody>
    `;

    weeks.forEach(week => {
      const slides = week.laminas || [];
      const slidesCount = slides.length;

      if (slidesCount === 0) {
        html += `
          <tr class="table-row-exam">
            <td class="td-sem"><strong>${String(week.semana).padStart(2, '0')}</strong></td>
            <td class="td-dates">
              <div>Mar ${week.fechas.martes} (17-19h)</div>
              <div>Jue ${week.fechas.jueves} (15-19h)</div>
            </td>
            <td class="td-theme" colspan="2">
              <span class="badge-exam-alert">EVALUACIÓN PRÁCTICA</span>
              <strong>${escapeHtml(week.titulo)}</strong>
              <div class="td-subdesc">${escapeHtml(week.resumenSemana)}</div>
            </td>
            <td class="td-loc">${escapeHtml(week.lugar)}<br><small>${week.duracion}</small></td>
            <td class="td-action" style="text-align:center">
              <button class="btn-table-check" data-week-id="${week.semana}">
                ${appState.progress.studiedWeeks.includes(week.semana) ? '✓ Rendido' : 'Pendiente'}
              </button>
            </td>
          </tr>
        `;
      } else {
        slides.forEach((slide, sIdx) => {
          const isStudied = appState.progress.completedSlides.includes(slide.id);
          html += `
            <tr class="${isStudied ? 'tr-studied' : ''}">
              ${sIdx === 0 ? `
                <td class="td-sem" rowspan="${slidesCount}"><strong>${String(week.semana).padStart(2, '0')}</strong></td>
                <td class="td-dates" rowspan="${slidesCount}">
                  <div>Mar ${week.fechas.martes}</div>
                  <div>(17:00–19:00 h)</div>
                  <hr style="opacity:0.1;margin:4px 0">
                  <div>Jue ${week.fechas.jueves}</div>
                  <div>(15:00–19:00 h)</div>
                </td>
              ` : ''}
              <td class="td-slide-item">
                <div class="td-slide-flex">
                  <span class="slide-num-indicator">${sIdx + 1}</span>
                  <a href="javascript:void(0)" class="td-slide-link ${appState.activeRecallMode ? 'recall-blurred' : ''}" data-action="open-modal" data-slide-id="${slide.id}">
                    ${escapeHtml(slide.diagnostico)}
                  </a>
                  <span class="badge-category">${escapeHtml(slide.codigo || '')}</span>
                </div>
              </td>
              <td class="td-organ-stain">
                <div class="organ-tag">${escapeHtml(slide.organo)}</div>
                <div class="stain-tag">${escapeHtml(slide.tincion)}</div>
              </td>
              ${sIdx === 0 ? `
                <td class="td-loc" rowspan="${slidesCount}">
                  <span>Lab. Microscopía</span><br>
                  <small>Inst. Patología UNMSM</small><br>
                  <small>⏱️ ${week.duracion}</small>
                </td>
              ` : ''}
              <td class="td-action" style="text-align:center">
                <button class="btn-table-slide-toggle ${isStudied ? 'is-done' : ''}" data-action="toggle-slide" data-slide-id="${slide.id}">
                  ${isStudied ? 'Dominada ✓' : 'Pendiente'}
                </button>
              </td>
            </tr>
          `;
        });
      }
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = html;
  }

  // ==========================================
  // 4. INTERACCIONES & ACCIONES DE TARJETAS
  // ==========================================
  function attachCardInteractions() {
    document.querySelectorAll('.recall-blurred').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.toggle('recall-revealed');
      });
    });

    document.querySelectorAll('[data-action="open-modal"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const slideId = el.getAttribute('data-slide-id');
        openSlideModal(slideId);
      });
    });

    document.querySelectorAll('[data-action="toggle-slide"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const slideId = el.getAttribute('data-slide-id');
        toggleSlideCompletion(slideId);
      });
    });

    document.querySelectorAll('[data-week-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const wNum = parseInt(el.getAttribute('data-week-id'), 10);
        toggleWeekCompletion(wNum);
      });
    });
  }

  function toggleSlideCompletion(slideId) {
    const idx = appState.progress.completedSlides.indexOf(slideId);
    if (idx > -1) {
      appState.progress.completedSlides.splice(idx, 1);
    } else {
      appState.progress.completedSlides.push(slideId);
    }
    saveProgress();
    renderContent();
    const searchInput = document.getElementById('sidebarSearchInput');
    renderSidebarTree(searchInput ? searchInput.value : '');
  }

  function toggleWeekCompletion(wNum) {
    const idx = appState.progress.studiedWeeks.indexOf(wNum);
    if (idx > -1) {
      appState.progress.studiedWeeks.splice(idx, 1);
    } else {
      appState.progress.studiedWeeks.push(wNum);
    }
    saveProgress();
    renderContent();
    renderHeroBanner();
  }

  function toggleActiveRecall() {
    appState.activeRecallMode = !appState.activeRecallMode;
    renderContent();
    renderHeroBanner();
  }

  function scrollToWeek(weekNumber) {
    appState.activeUnit = 'all';
    appState.activeFilter = 'all';
    appState.searchQuery = '';
    const searchInput = document.getElementById('searchDiagnosisInput');
    if (searchInput) searchInput.value = '';
    
    document.querySelectorAll('.unit-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-unit') === 'all');
    });

    renderContent();

    setTimeout(() => {
      const targetCard = document.getElementById(`weekCard-${weekNumber}`) || document.getElementById(`timelineWeek-${weekNumber}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('highlight-glow');
        setTimeout(() => targetCard.classList.remove('highlight-glow'), 2500);
      }
    }, 100);
  }

  // ==========================================
  // 5. MODAL DE ESTUDIO (ROBBINS 11.ª ED.)
  // ==========================================
  function findSlideById(slideId) {
    const weeks = getWeeksData();
    for (const w of weeks) {
      if (w.laminas) {
        const found = w.laminas.find(s => s.id === slideId);
        if (found) return { slide: found, week: w };
      }
    }
    return null;
  }

  function openSlideModal(slideId) {
    const res = findSlideById(slideId);
    if (!res) return;
    const { slide, week } = res;
    appState.selectedSlide = slide;

    const modalBackdrop = document.getElementById('slideStudyModal');
    const modalContent = document.getElementById('slideModalBody');
    if (!modalBackdrop || !modalContent) return;

    const isDone = appState.progress.completedSlides.includes(slide.id);
    const existingNote = appState.notes[slide.id] || '';
    const webpathUrl = slide.enlacesMicroscopia ? slide.enlacesMicroscopia.webpath : 'https://webpath.med.utah.edu/';
    const pathPresenterUrl = slide.enlacesMicroscopia ? slide.enlacesMicroscopia.pathpresenter : 'https://pathpresenter.net/';
    const histologyGuideUrl = slide.enlacesMicroscopia ? slide.enlacesMicroscopia.histologyGuide : 'https://histologyguide.com/';

    modalContent.innerHTML = `
      <div class="modal-study-header">
        <div class="modal-pill-tags">
          <span class="badge-week">Semana ${String(week.semana).padStart(2, '0')}</span>
          <span class="badge-unit">${week.unidadId}</span>
          <span class="organ-tag">${escapeHtml(slide.organo)}</span>
          <span class="stain-tag">${escapeHtml(slide.tincion)}</span>
          <span class="badge-category">${escapeHtml(slide.codigo || '')}</span>
        </div>
        <button class="btn-close-modal" id="btnCloseSlideModal" title="Cerrar (Esc)">&times;</button>
      </div>

      <h2 class="modal-slide-title">${escapeHtml(slide.diagnostico)}</h2>
      <p class="modal-system-subtitle">${escapeHtml(slide.tipoLesion || '')} &bull; Aumento Sugerido: ${escapeHtml(slide.aumentoRecomendado || '10X-40X')}</p>

      <!-- Metadatos Oficiales de la Sesión San Fernando (Imagen Oficial) -->
      <div style="display: flex; flex-wrap: wrap; gap: 14px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border-subtle); border-radius: var(--radius-sm); padding: 8px 12px; margin-bottom: 16px; font-size: 0.74rem; color: var(--text-secondary);">
        <span>📅 <strong>Fechas:</strong> Mar: ${escapeHtml(week.fechas?.martes || '')} | Jue: ${escapeHtml(week.fechas?.jueves || '')}</span>
        <span>⏰ <strong>Horario:</strong> ${escapeHtml(week.horario || 'Mar 17-19 h | Jue 15-19 h')}</span>
        <span>📍 <strong>Lugar:</strong> ${escapeHtml(week.lugar || 'Laboratorio de Microscopía')} (${escapeHtml(week.duracion || '2.0 h')})</span>
        <span>👨‍🏫 <strong>Responsable:</strong> ${escapeHtml(week.responsable || 'Equipo docente')}</span>
      </div>

      <div class="modal-grid-layout">
        <!-- Columna Izquierda: Visor Microscópico Interactivo -->
        <div class="modal-microscope-viewport glass-panel">
          <div class="viewport-canvas-wrapper" id="canvasMagnifierArea">
            <div class="microscope-reticle">
              <div class="reticle-h"></div>
              <div class="reticle-v"></div>
              <div class="reticle-circle"></div>
            </div>
            <div class="microscope-hud">
              <span id="currentMagLabel">Aumento: 10x</span>
              <span>Campo Histopatológico Virtual</span>
            </div>
            <div class="microscope-sample-preview" id="microSamplePreview">
              <div class="sample-abstract-pattern"></div>
              <p class="sample-caption">${escapeHtml(slide.organo)} – ${escapeHtml(slide.diagnostico)}</p>
            </div>
          </div>

          <div class="magnification-controls">
            <button class="btn-mag active" data-mag="4x">4x Panorámico</button>
            <button class="btn-mag" data-mag="10x">10x Reconocimiento</button>
            <button class="btn-mag" data-mag="40x">40x Gran Aumento</button>
            <button class="btn-mag" data-mag="100x">100x Inmersión</button>
          </div>

          <div class="virtual-links-row">
            <span class="vlinks-label">Exploradores Digitales Oficiales:</span>
            <a href="${webpathUrl}" target="_blank" rel="noopener noreferrer" class="btn-vlink">🔬 WebPath</a>
            <a href="${pathPresenterUrl}" target="_blank" rel="noopener noreferrer" class="btn-vlink">🌐 PathPresenter WSI</a>
            <a href="${histologyGuideUrl}" target="_blank" rel="noopener noreferrer" class="btn-vlink">📘 Histology Guide</a>
          </div>
        </div>

        <!-- Columna Derecha: Criterios Robbins & Notas -->
        <div class="modal-details-col">
          <section class="criteria-card glass-panel">
            <h4 class="criteria-title">
              <span>📖 Tríada Patognomónica / Criterios Histopatológicos</span>
              <small>Robbins Patología 11.ª Edición</small>
            </h4>
            <p class="robbins-def-text"><em>"${escapeHtml(slide.definicionRobbins || '')}"</em></p>
            <ul class="criteria-list">
              ${slide.triadaPatognomonica ? slide.triadaPatognomonica.map(f => `<li>${escapeHtml(f)}</li>`).join('') : ''}
            </ul>
          </section>

          <section class="pearl-card glass-panel">
            <h4 class="pearl-title">💡 Perla Diagnóstica / Clave de Examen</h4>
            <p class="pearl-text">${escapeHtml(slide.perlaDiagnostica || '')}</p>
          </section>

          <section class="notes-card glass-panel">
            <div class="notes-header">
              <label for="studentSlideNote">📝 Mis Anotaciones de Microscopía:</label>
              <span class="autosave-label" id="autosaveStatus">Guardado automáticamente</span>
            </div>
            <textarea id="studentSlideNote" placeholder="Apunta aquí observaciones del docente, tips de tinción o trucos de reconocimiento para el examen práctico...">${escapeHtml(existingNote)}</textarea>
          </section>

          <div class="modal-footer-actions">
            <button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'}" id="btnModalToggleStudy">
              ${isDone ? '✓ Marcada como Estudiada' : 'Marcar como Dominada (+Progreso)'}
            </button>
          </div>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('modal-visible');
    document.body.style.overflow = 'hidden';

    document.getElementById('btnCloseSlideModal')?.addEventListener('click', closeSlideModal);

    const studyBtn = document.getElementById('btnModalToggleStudy');
    studyBtn?.addEventListener('click', () => {
      toggleSlideCompletion(slide.id);
      openSlideModal(slide.id);
    });

    document.querySelectorAll('.btn-mag').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-mag').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const mag = e.currentTarget.getAttribute('data-mag');
        const lbl = document.getElementById('currentMagLabel');
        if (lbl) lbl.textContent = `Aumento: ${mag}`;
        
        const preview = document.getElementById('microSamplePreview');
        if (preview) {
          preview.className = `microscope-sample-preview mag-${mag.toLowerCase()}`;
        }
      });
    });

    const noteArea = document.getElementById('studentSlideNote');
    let timeoutId = null;
    noteArea?.addEventListener('input', () => {
      const statusLbl = document.getElementById('autosaveStatus');
      if (statusLbl) statusLbl.textContent = 'Guardando...';
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveNoteForSlide(slide.id, noteArea.value);
        if (statusLbl) statusLbl.textContent = 'Guardado ✓';
      }, 500);
    });
  }

  function closeSlideModal() {
    const modalBackdrop = document.getElementById('slideStudyModal');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('modal-visible');
    }
    document.body.style.overflow = '';
    appState.selectedSlide = null;
  }

  // ==========================================
  // 6. LISTENERS GLOBALES & FILTROS
  // ==========================================
  function setupEventListeners() {
    // Cambio de Vistas
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        appState.currentView = e.currentTarget.getAttribute('data-view');
        renderContent();
      });
    });

    // Pestañas de Unidades
    document.querySelectorAll('.unit-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.unit-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        appState.activeUnit = e.currentTarget.getAttribute('data-unit');
        renderContent();
      });
    });

    // Filtro de Estado
    const statusSelect = document.getElementById('filterStatusSelect');
    statusSelect?.addEventListener('change', (e) => {
      appState.activeFilter = e.target.value;
      renderContent();
    });

    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchDiagnosisInput');
    searchInput?.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      renderContent();
    });

    // Toggle Tema
    const themeToggle = document.getElementById('btnThemeToggle');
    themeToggle?.addEventListener('click', () => {
      appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', appState.theme);
      localStorage.setItem(THEME_KEY, appState.theme);
      if (themeToggle) themeToggle.textContent = appState.theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    });

    // Tecla ESC para cerrar modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && appState.selectedSlide) {
        closeSlideModal();
      }
    });

    // Clic fuera del modal
    const modalBackdrop = document.getElementById('slideStudyModal');
    modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeSlideModal();
      }
    });
  }

  function resetFilters() {
    appState.activeUnit = 'all';
    appState.activeFilter = 'all';
    appState.searchQuery = '';
    
    const searchInput = document.getElementById('searchDiagnosisInput');
    if (searchInput) searchInput.value = '';

    const statusSelect = document.getElementById('filterStatusSelect');
    if (statusSelect) statusSelect.value = 'all';

    document.querySelectorAll('.unit-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-unit') === 'all');
    });

    renderContent();
  }

  // ==========================================
  // 7. UTILITARIOS
  // ==========================================
  function normalizeString(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // ==========================================
  // 8. CONTROLADOR DEL SIDEBAR DESPLEGABLE DE CAPÍTULOS
  // ==========================================
  function initChaptersSidebar() {
    const sidebar = document.getElementById('chaptersSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const btnOpen = document.getElementById('btnOpenSidebar');
    const btnQuick = document.getElementById('btnQuickChapters');
    const btnThumb = document.getElementById('btnThumbChapters');
    const btnClose = document.getElementById('btnCloseSidebar');
    const searchInput = document.getElementById('sidebarSearchInput');
    const btnClearSearch = document.getElementById('btnSidebarClearSearch');
    const treeContainer = document.getElementById('sidebarChaptersTree');

    function openSidebar() {
      sidebar?.classList.add('open');
      backdrop?.classList.add('active');
      document.body.style.overflow = 'hidden';
      searchInput?.focus();
    }

    function closeSidebar() {
      sidebar?.classList.remove('open');
      backdrop?.classList.remove('active');
      document.body.style.overflow = '';
    }

    btnOpen?.addEventListener('click', openSidebar);
    btnQuick?.addEventListener('click', openSidebar);
    btnThumb?.addEventListener('click', openSidebar);
    btnClose?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar);

    // Atajos de Teclado (Ctrl+K y Slash)
    window.addEventListener('keydown', (e) => {
      const isInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openSidebar();
        searchInput?.focus();
        searchInput?.select();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        openSidebar();
        searchInput?.focus();
        searchInput?.select();
      } else if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
        closeSidebar();
      }
    });

    // Búsqueda en Vivo dentro del Sidebar
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (btnClearSearch) btnClearSearch.style.display = query ? 'block' : 'none';
      renderSidebarTree(query);
    });

    btnClearSearch?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      if (btnClearSearch) btnClearSearch.style.display = 'none';
      renderSidebarTree('');
    });

    renderSidebarTree('');
  }

  function renderSidebarTree(searchQuery = '') {
    const treeContainer = document.getElementById('sidebarChaptersTree');
    if (!treeContainer || !window.PATOLOGIA_DATA) return;

    const query = normalizeString(searchQuery);
    const units = window.PATOLOGIA_DATA.unidades || [];
    const weeks = window.PATOLOGIA_DATA.semanas || [];

    // Calcular estadísticas globales para el HUD
    let totalSlidesCount = 0;
    let completedCount = 0;
    weeks.forEach(w => {
      (w.laminas || []).forEach(s => {
        totalSlidesCount++;
        if (appState.progress.completedSlides.includes(s.id)) completedCount++;
      });
    });

    const slideCountEl = document.getElementById('sidebarSlideCount');
    const progressCountEl = document.getElementById('sidebarProgressCount');
    if (slideCountEl) slideCountEl.textContent = `${totalSlidesCount} Láminas`;
    if (progressCountEl) progressCountEl.innerHTML = `Dominadas: <strong>${completedCount}/${totalSlidesCount}</strong>`;

    let html = '';

    units.forEach((unit, uIdx) => {
      const unitWeeks = weeks.filter(w => w.unidadId === unit.id);
      
      // Filtrar semanas y láminas si hay búsqueda
      const filteredWeeks = unitWeeks.map(week => {
        const matchingSlides = (week.laminas || []).filter(slide => {
          if (!query) return true;
          return (
            normalizeString(slide.diagnostico).includes(query) ||
            normalizeString(slide.organo).includes(query) ||
            normalizeString(slide.tincion).includes(query) ||
            normalizeString(slide.codigo || '').includes(query)
          );
        });

        const weekTitleMatches = normalizeString(week.titulo).includes(query);
        const hasMatches = matchingSlides.length > 0 || weekTitleMatches;

        return {
          ...week,
          matchingSlides: query ? (matchingSlides.length > 0 ? matchingSlides : week.laminas) : week.laminas,
          isMatch: hasMatches
        };
      }).filter(w => !query || w.isMatch);

      if (query && filteredWeeks.length === 0) return;

      // Expandido por defecto si hay búsqueda o si es la primera unidad
      const isUnitExpanded = Boolean(query) || uIdx === 0;

      html += `
        <div class="sidebar-unit-group ${isUnitExpanded ? 'expanded' : ''}" data-unit-id="${unit.id}">
          <button class="sidebar-unit-header" type="button">
            <div style="display: flex; align-items: center;">
              <span class="sidebar-unit-pill" style="background: ${unit.color}25; color: ${unit.color}; border: 1px solid ${unit.color}50;">
                U-${unit.numero}
              </span>
              <span>${escapeHtml(unit.nombre)}</span>
            </div>
            <span class="sidebar-chevron">▶</span>
          </button>
          <div class="sidebar-unit-body">
      `;

      filteredWeeks.forEach((week, wIdx) => {
        const isExam = week.esExamen;
        const slides = week.matchingSlides || [];
        const isWeekExpanded = Boolean(query) || (uIdx === 0 && wIdx === 0);

        html += `
          <div class="sidebar-week-node ${isWeekExpanded ? 'expanded' : ''}" data-week-num="${week.semana}">
            <button class="sidebar-week-trigger" type="button">
              <div style="display: flex; align-items: center; min-width: 0;">
                <span class="sidebar-week-badge">S${String(week.semana).padStart(2, '0')}</span>
                <span class="sidebar-week-title-text" title="${escapeHtml(week.titulo)}">
                  ${highlightText(week.titulo, query)}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                ${isExam ? '<span class="sidebar-week-exam-badge">⚡ Examen</span>' : `<span style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">${slides.length} láminas</span>`}
                <span class="sidebar-week-arrow" style="font-size: 0.65rem; color: var(--text-muted); transform: ${isWeekExpanded ? 'rotate(90deg)' : 'none'}; display: inline-block;">▶</span>
              </div>
            </button>
            <ul class="sidebar-slides-sublist">
        `;

        slides.forEach(slide => {
          const isDone = appState.progress.completedSlides.includes(slide.id);
          html += `
            <li>
              <a class="sidebar-slide-link" data-slide-id="${slide.id}" data-week="${week.semana}" role="button">
                <span class="sidebar-slide-icon">${isDone ? '✅' : '🔬'}</span>
                <span class="sidebar-slide-code">${escapeHtml(slide.codigo || '')}</span>
                <span class="sidebar-slide-diag" title="${escapeHtml(slide.diagnostico)}">
                  ${highlightText(slide.diagnostico, query)}
                </span>
                <span style="font-size: 0.62rem; font-family: var(--font-mono); color: var(--text-muted); padding: 1px 4px; background: rgba(255,255,255,0.06); border-radius: 3px;">${escapeHtml(slide.tincion || 'H&E')}</span>
              </a>
            </li>
          `;
        });

        html += `
            </ul>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    if (!html && query) {
      html = `
        <div style="padding: 28px 12px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔬🔍</div>
          <p style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Sin coincidencias</p>
          <p style="font-size: 0.72rem;">No se encontraron láminas para "${escapeHtml(searchQuery)}".</p>
        </div>
      `;
    }

    treeContainer.innerHTML = html;

    // Conectar eventos del acordeón del sidebar
    treeContainer.querySelectorAll('.sidebar-unit-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const group = e.currentTarget.closest('.sidebar-unit-group');
        group?.classList.toggle('expanded');
      });
    });

    treeContainer.querySelectorAll('.sidebar-week-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const node = e.currentTarget.closest('.sidebar-week-node');
        const arrow = node?.querySelector('.sidebar-week-arrow');
        const isExp = node?.classList.toggle('expanded');
        if (arrow) arrow.style.transform = isExp ? 'rotate(90deg)' : 'none';
      });
    });

    // Conectar clics en láminas para abrir el visor directo
    treeContainer.querySelectorAll('.sidebar-slide-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const slideId = e.currentTarget.getAttribute('data-slide-id');
        if (!slideId) return;

        // Cerrar el drawer en móviles para ver la lámina
        if (window.innerWidth <= 768) {
          const sidebar = document.getElementById('chaptersSidebar');
          const backdrop = document.getElementById('sidebarBackdrop');
          sidebar?.classList.remove('open');
          backdrop?.classList.remove('active');
          document.body.style.overflow = '';
        }

        // Marcar enlace activo
        treeContainer.querySelectorAll('.sidebar-slide-link').forEach(l => l.classList.remove('active-slide'));
        e.currentTarget.classList.add('active-slide');

        openSlideModalById(slideId);
      });
    });
  }

  function highlightText(text, query) {
    if (!query || !text) return escapeHtml(text || '');
    const cleanTextStr = normalizeString(text);
    const idx = cleanTextStr.indexOf(query);
    if (idx === -1) return escapeHtml(text);
    const before = text.substring(0, idx);
    const match = text.substring(idx, idx + query.length);
    const after = text.substring(idx + query.length);
    return `${escapeHtml(before)}<mark class="search-match">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
