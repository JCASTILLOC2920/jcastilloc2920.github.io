// help_guide.js
// Sistema de Burbujas de Ayuda Visual / Onboarding Premium para Personal Técnico
// Garantiza no-sobreposición e interactividad exclusiva.

(function() {
    // Inyectar triggers visuales (?) al lado de los componentes claves
    function insertTriggers() {
        // 1. Trigger de búsqueda (Desktop)
        const labelNom = document.querySelector('label[for="nomPaciente"]');
        if (labelNom && !document.getElementById('searchHelpTrigger')) {
            const trigger = document.createElement('span');
            trigger.id = 'searchHelpTrigger';
            trigger.className = 'help-trigger-badge';
            trigger.title = 'Ver ayuda de búsqueda';
            trigger.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
            labelNom.appendChild(trigger);
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                showSearchBubble();
            });
        }

        // 2. Trigger de búsqueda (Mobile)
        const btnToggle = document.getElementById('btnToggleFilters');
        if (btnToggle && !document.getElementById('searchHelpTriggerMobile')) {
            const trigger = document.createElement('span');
            trigger.id = 'searchHelpTriggerMobile';
            trigger.className = 'help-trigger-badge';
            trigger.title = 'Ver ayuda de búsqueda';
            trigger.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
            btnToggle.appendChild(trigger);
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                showSearchBubble();
            });
        }

        // 3. Trigger de impresión (En la cabecera de la columna ACCIONES de la tabla)
        const actionHeader = document.querySelector('.action-header');
        if (actionHeader && !document.getElementById('printHelpTrigger')) {
            const trigger = document.createElement('span');
            trigger.id = 'printHelpTrigger';
            trigger.className = 'help-trigger-badge';
            trigger.title = 'Ver ayuda de impresión';
            trigger.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
            actionHeader.appendChild(trigger);
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                showPrintBubble();
            });
        }
    }

    function initHelpGuide() {
        // Agregar botón de ayuda general en la cabecera si no existe
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('btnShowHelpGuide')) {
            const helpBtn = document.createElement('button');
            helpBtn.id = 'btnShowHelpGuide';
            helpBtn.type = 'button';
            helpBtn.className = 'header-utility-btn';
            helpBtn.title = 'Guía de Ayuda Visual';
            helpBtn.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
            helpBtn.style.marginRight = '8px';
            
            const dbBtn = headerRight.querySelector('.header-utility-btn[aria-label="Base de datos"]');
            if (dbBtn) {
                headerRight.insertBefore(helpBtn, dbBtn);
            } else {
                headerRight.appendChild(helpBtn);
            }

            helpBtn.addEventListener('click', () => {
                // Al presionar el botón general de la cabecera, mostramos la primera ayuda
                showSearchBubble();
            });
        }

        // Insertar los triggers en el DOM
        insertTriggers();

        // Trigger de la cabecera de búsqueda (Neuro-Diseño)
        const headerHelp = document.getElementById('searchHeaderHelpTrigger');
        if (headerHelp) {
            headerHelp.addEventListener('click', (e) => {
                e.stopPropagation();
                showHeaderSearchBubble();
            });
        }
    }

    function createBubble(id, targetElement, placement, text) {
        // Eliminar TODAS las burbujas existentes para que NUNCA se sobrepongan
        hideHelpBubbles();

        const rect = targetElement.getBoundingClientRect();
        
        // Si el elemento no está visible, no renderizar la burbuja
        if (rect.width === 0 || rect.height === 0) return;

        const bubble = document.createElement('div');
        bubble.id = id;
        bubble.className = 'help-guide-bubble';
        
        bubble.innerHTML = `
            <div class="bubble-content">${text}</div>
            <div class="bubble-actions">
                <button type="button" class="btn-bubble-close">Entendido</button>
            </div>
        `;

        document.body.appendChild(bubble);

        // Posicionar de manera absoluta
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        
        let top = 0;
        let left = 0;
        let arrowClass = '';

        const bubbleWidth = bubble.offsetWidth || 230;
        const bubbleHeight = bubble.offsetHeight || 80;

        if (placement === 'bottom') {
            top = rect.bottom + scrollY + 12;
            left = rect.left + scrollX + (rect.width / 2) - (bubbleWidth / 2);
            arrowClass = 'arrow-top';
        } else if (placement === 'top') {
            top = rect.top + scrollY - bubbleHeight - 12;
            left = rect.left + scrollX + (rect.width / 2) - (bubbleWidth / 2);
            arrowClass = 'arrow-bottom';
        } else if (placement === 'left') {
            top = rect.top + scrollY + (rect.height / 2) - (bubbleHeight / 2);
            left = rect.left + scrollX - bubbleWidth - 12;
            arrowClass = 'arrow-right';
        } else if (placement === 'right') {
            top = rect.top + scrollY + (rect.height / 2) - (bubbleHeight / 2);
            left = rect.right + scrollX + 12;
            arrowClass = 'arrow-left';
        }

        // Limitar márgenes
        left = Math.max(10, Math.min(window.innerWidth - bubbleWidth - 10, left));
        top = Math.max(10, top);

        bubble.style.top = top + 'px';
        bubble.style.left = left + 'px';
        bubble.classList.add(arrowClass);

        // Configurar botón cerrar
        bubble.querySelector('.btn-bubble-close').addEventListener('click', (e) => {
            e.stopPropagation();
            bubble.remove();
        });
    }

    function showSearchBubble() {
        const isMobile = window.innerWidth <= 768;
        const searchTarget = isMobile ? document.getElementById('btnToggleFilters') : document.getElementById('nomPaciente');
        
        if (searchTarget) {
            const text = isMobile 
                ? '🔍 Presiona aquí para mostrar los filtros de búsqueda por Nombre o DNI.'
                : '🔍 Escribe aquí el Nombre o el DNI para buscar un informe rápido.';
            createBubble('search-help-bubble', searchTarget, isMobile ? 'bottom' : 'top', text);
        }
    }

    function showHeaderSearchBubble() {
        const target = document.getElementById('searchHeaderHelpTrigger');
        if (target) {
            createBubble(
                'header-search-help-bubble',
                target,
                'bottom',
                '🔍 Escribe en cualquiera de las casillas inferiores (Nombre, DNI, etc.) para filtrar al instante. Presiona el botón "Buscar" al costado para recargar la información de la nube.'
            );
        }
    }

    function showPrintBubble() {
        const firstPdfBtn = document.querySelector('.report-table .pdf-btn');
        if (firstPdfBtn) {
            createBubble(
                'print-help-bubble',
                firstPdfBtn,
                window.innerWidth <= 768 ? 'bottom' : 'left',
                '🖨️ Presiona este icono de impresora para abrir y mandar a imprimir el informe.'
            );
        } else {
            // Caso de tabla vacía: apuntamos al header de acciones
            const actionHeader = document.querySelector('.action-header');
            if (actionHeader) {
                createBubble(
                    'print-help-bubble',
                    actionHeader,
                    'bottom',
                    '🖨️ Aquí aparecerá la columna con el icono de impresora para cada paciente.'
                );
            }
        }
    }

    function hideHelpBubbles() {
        const bubbles = document.querySelectorAll('.help-guide-bubble');
        bubbles.forEach(b => b.remove());
    }

    // Registrar globalmente
    window.checkAndTriggerHelpBubbles = function() {
        // Re-inyectar triggers (necesario cuando la tabla se re-renderiza)
        insertTriggers();
    };
    window.hideHelpBubbles = hideHelpBubbles;

    // Inicializar al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHelpGuide);
    } else {
        initHelpGuide();
    }

    // Cerrar burbujas activas si el usuario pulsa en cualquier otra parte del documento
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.help-guide-bubble') && !e.target.closest('.help-trigger-badge') && !e.target.closest('#btnShowHelpGuide')) {
            hideHelpBubbles();
        }
    });

    // Adaptar posiciones al redimensionar la ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Si hay alguna burbuja activa en pantalla, re-renderizarla para acomodar la posición
            const searchBubble = document.getElementById('search-help-bubble');
            const printBubble = document.getElementById('print-help-bubble');
            const headerSearchBubble = document.getElementById('header-search-help-bubble');
            if (searchBubble) showSearchBubble();
            if (printBubble) showPrintBubble();
            if (headerSearchBubble) showHeaderSearchBubble();
        }, 150);
    });
})();
