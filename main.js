document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');

    function showSection(sectionId) {
        const targetSection = document.getElementById(sectionId);

        // Safety Check: If the section doesn't exist (e.g., on a subpage like precios.html),
        // STOP here. Do not clear active classes from nav links.
        if (!targetSection) {
            return;
        }

        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        targetSection.classList.add('active');

        navLinks.forEach(link => {
            // Only manipulate links that are local anchors (starting with #)
            // This preserves the hardcoded 'active' class on subpages for external links
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                link.classList.remove('active');
                if (href === `#${sectionId}`) {
                    link.classList.add('active');
                }
            }
        });
        history.pushState(null, null, `#${sectionId}`);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // FIX: Ignore href="#" (dropdown toggles) and require non-empty hash
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetId = href.substring(1);

                // Only run showSection if the target actually exists
                if (document.getElementById(targetId)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    showSection(targetId);
                }
            }
        });
    });

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (!navMenu.classList.contains('active')) {
            document.querySelectorAll('.has-dropdown').forEach(item => {
                item.classList.remove('mobile-active');
            });
        }
    });

    const dropdownToggles = document.querySelectorAll('.has-dropdown > .nav-link');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                const parent = this.parentElement;
                document.querySelectorAll('.has-dropdown').forEach(item => {
                    if (item !== parent) item.classList.remove('mobile-active');
                });
                parent.classList.toggle('mobile-active');
            }
        });
    });

    window.addEventListener('popstate', function () {
        const hash = window.location.hash.substring(1);
        if (hash) {
            showSection(hash);
        } else if (document.getElementById('inicio')) {
            showSection('inicio');
        }
    });

    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else if (document.getElementById('inicio')) {
        // Only default to 'inicio' if it exists
        showSection('inicio');
    }

    function initAccordion(headerSelector) {
        const headers = document.querySelectorAll(headerSelector);
        headers.forEach(header => {
            header.addEventListener('click', function () {
                const accordionItem = this.parentElement;
                const content = accordionItem.querySelector('.service-accordion-content');
                const icon = this.querySelector('.service-accordion-icon');
                if (content) {
                    const isActive = content.classList.contains('active');
                    if (isActive) {
                        content.classList.remove('active');
                        if (icon) icon.classList.remove('rotated');
                    } else {
                        content.classList.add('active');
                        if (icon) icon.classList.add('rotated');
                    }
                }
            });
        });
    }

    initAccordion('.service-accordion-header');
});