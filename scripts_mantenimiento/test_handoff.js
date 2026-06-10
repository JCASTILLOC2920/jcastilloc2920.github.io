
/**
 * Test Script for Warm Handoff Integration
 * Run this in the browser console to verify logic.
 */

function testWarmHandoff() {
    console.log("--- INICIANDO PRUEBAS DE TRASPASO EN CALIENTE ---");

    // 1. Simular captura de examen
    console.log("Prueba 1: Captura de contexto de examen");
    procesarConsultaPrecio("¿Cuánto cuesta una Biopsia de Cérvix?");
    if (lastExamenConsultado === "BIOPSIA DE CERVIX") {
        console.log("✅ OK: lastExamenConsultado actualizado a " + lastExamenConsultado);
    } else {
        console.error("❌ ERROR: lastExamenConsultado es " + lastExamenConsultado);
    }

    // 2. Verificar Regex de Intención
    console.log("\nPrueba 2: Detección de intención (Regex)");
    const positiveInputs = ["ok", "si", "sí", "claro", "agendar", "quiero avanzar"];
    positiveInputs.forEach(input => {
        if (checkForWarmHandoff(input)) {
            console.log(`✅ OK: '${input}' detectado correctamente.`);
        } else {
            console.error(`❌ ERROR: '${input}' NO detectado.`);
        }
    });

    // 3. Verificar Generación de URL
    console.log("\nPrueba 3: Generación de URL de WhatsApp");
    const buttonHtml = generarBotonWhatsApp("BIOPSIA DE CERVIX");
    if (buttonHtml.includes("wa.me") && buttonHtml.includes("BIOPSIA%20DE%20CERVIX")) {
        console.log("✅ OK: URL generada y codificada correctamente.");
        // Extraer link para inspección manual si es necesario
        const link = buttonHtml.match(/href="(.*?)"/)[1];
        console.log("URL Resultante: " + link);
    } else {
        console.error("❌ ERROR: El botón HTML no contiene los datos esperados.");
    }

    console.log("\n--- PRUEBAS FINALIZADAS ---");
}

// Ejecutar si estamos en un entorno de pruebas o manualmente
// testWarmHandoff();
