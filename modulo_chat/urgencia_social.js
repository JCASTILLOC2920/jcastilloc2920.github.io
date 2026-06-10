// Social Proof Broadcaster - JC PATH LAB
(function() {
    const messages = [
        "🏢 Clínica en Los Olivos solicitó recojo de biopsias.",
        "⚡ Resultado entregado en 3 días (Cero Retrasos).",
        "👨‍⚕️ Nuevo médico se unió a la Red B2B.",
        "🏥 Recepción nacional: Muestras de Trujillo recibidas.",
        "🔬 Biopsia Gástrica procesada con éxito.",
        "✅ Coordinación activa en Puente Piedra ahora."
    ];

    function createNotification() {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 20px;
            background: rgba(15, 23, 42, 0.95);
            color: #00E5FF;
            padding: 12px 20px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 800;
            z-index: 100000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border-left: 4px solid #00E5FF;
            transform: translateX(-150%);
            transition: transform 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67);
            font-family: 'Outfit', sans-serif;
            letter-spacing: 0.5px;
            pointer-events: none;
        `;
        
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        toast.innerHTML = `<span>RECENTE:</span> ${randomMsg}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            toast.style.transform = 'translateX(-150%)';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

    // Disparar cada 15-30 segundos para no saturar
    setInterval(createNotification, 25000);
    setTimeout(createNotification, 3000); // Primera carga rápida

    // Alerta de Pestaña
    let originalTitle = document.title;
    window.onblur = () => { document.title = "⚠️ ¡COORDINAR RECOJO AQUÍ!"; };
    window.onfocus = () => { document.title = originalTitle; };
})();
