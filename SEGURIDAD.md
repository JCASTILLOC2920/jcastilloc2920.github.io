# Guía de Seguridad y Protección de API - JC PATH LAB

Para garantizar que el Asistente Virtual (Dra. Sofia) sea seguro y profesional, sigue estas directrices de protección de datos y credenciales.

## 1. Uso de Variables de Entorno (Secrets)

Nunca escribas tu `API_KEY` directamente en el código de Python o Javascript. He configurado `upgrade_chatbot.py` para que lea la llave desde tu sistema.

### Cómo configurar la llave en Windows (PowerShell):
Ejecuta este comando antes de correr el script de actualización:
```powershell
$env:GEMINI_API_KEY = "tu_clave_secreta_aqui"
python upgrade_chatbot.py
```

## 2. Autenticación por Tokens (Recomendado)

Si decides escalar este chatbot a una aplicación más robusta, el estándar de oro es:
- **No llamar a Gemini desde el navegador**: Crea un pequeño servidor (Node.js, Python/Flask) que actúe como intermediario.
- **Bearer Tokens**: Configura tu servidor para que solo responda si el mensaje trae un encabezado de autorización:
  ```javascript
  // Ejemplo de lo que enviaría el navegador
  headers: {
    "Authorization": "Bearer TOKEN_SECRETO_QUE_SOLO_TU_SABES"
  }
  ```

## 3. Restricción por CORS y Dominios

Configura tu servidor de API (si usas uno propio) para que **solo acepte peticiones** desde:
`https://jcastilloc2920.github.io/`

Esto evita que otros sitios web "roben" tu chatbot y usen tu saldo de API.

## 4. Limitación de Quotas en Google AI Studio

Te recomiendo entrar a [Google AI Studio Settings](https://aistudio.google.com/) y:
1.  **Restringir la API Key**: Configura la llave para que solo pueda usarse con el modelo Gemini Flash.
2.  **Límites de Gasto**: Pon un límite diario para evitar sorpresas en la facturación.

---
**Nota**: El archivo `chatbot.js` generado es público por naturaleza al estar en GitHub Pages. La mejor forma de proteger tu llave al 100% es usar un **Backend Proxy**. Si deseas que te ayude a configurar uno, ¡solo dímelo!
