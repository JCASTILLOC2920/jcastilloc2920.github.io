document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');
    
    // Función para mostrar una sección específica
    function showSection(sectionId) {
        // Ocultar todas las secciones
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la sección solicitada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Actualizar enlace activo
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        // Guardar estado en el historial
        history.pushState(null, null, `#${sectionId}`);
    }
    
    // Manejar clics en enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                // Cerrar menú móvil si está abierto
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                showSection(targetId);
            }
        });
    });

    // Manejar botón de menú hamburguesa
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Manejar cambios en el historial (botones atrás/adelante)
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            showSection(hash);
        } else if (document.getElementById('inicio')) {
            showSection('inicio');
        }
    });
    
    // Inicializar página según hash de URL
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else if (document.getElementById('inicio')) {
        showSection('inicio');
    }
    
    // Funcionalidad de acordeones para servicios
    const serviceAccordionHeaders = document.querySelectorAll('.service-accordion-header');
    serviceAccordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const content = accordionItem.querySelector('.service-accordion-content');
            const icon = this.querySelector('.service-accordion-icon');
            
            // Alternar el estado del acordeón
            const isActive = content.classList.contains('active');
            
            if (isActive) {
                content.classList.remove('active');
                icon.classList.remove('rotated');
            } else {
                content.classList.add('active');
                icon.classList.add('rotated');
            }
        });
    });
    
    // Funcionalidad de acordeones para CV
    const cvAccordionHeaders = document.querySelectorAll('.cv-accordion-header');
    cvAccordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const content = accordionItem.querySelector('.cv-accordion-content');
            const icon = this.querySelector('.cv-accordion-icon');
            
            // Alternar el estado del acordeón
            const isActive = content.classList.contains('active');
            
            if (isActive) {
                content.classList.remove('active');
                icon.classList.remove('rotated');
            } else {
                content.classList.add('active');
                icon.classList.add('rotated');
            }
        });
    });
    
    

});