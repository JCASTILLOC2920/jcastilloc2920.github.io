# Guía de Configuración DNS para GitHub Pages

Si decides migrar de `jcastilloc2920.github.io` a un dominio personalizado (ej. `jcpathlab.com`), sigue estos pasos para configurar tus registros DNS:

## 1. Configurar registros A (Dirección IP de GitHub)
En el panel de control de tu proveedor de dominio (Godaddy, Namecheap, etc.), añade los siguientes registros A:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

## 2. Configurar registro CNAME (Para www)
Crea un registro CNAME para el subdominio `www`:
- **Nombre**: `www`
- **Valor**: `jcastilloc2920.github.io`

## 3. Configurar en GitHub
1. Ve a los **Settings** de tu repositorio en GitHub.
2. Navega a **Pages**.
3. En **Custom domain**, ingresa tu nuevo dominio (ej. `jcpathlab.com`).
4. Haz clic en **Save**.
5. Asegúrate de marcar **Enforce HTTPS** una vez que el certificado SSL se haya generado (esto puede tardar unos minutos).

## 4. Verificar configuración
Puedes usar herramientas como `dig` o servicios online para verificar que los registros DNS se han propagado correctamente.
