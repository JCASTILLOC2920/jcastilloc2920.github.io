import os
import json
import requests

# ==========================================================================
# PUENTE SOBERANO - NODO TITAN (INYECCIÓN A SUPABASE)
# ==========================================================================

print("=== NODO DE SINCRONIZACIÓN SOBERANA (TITAN -> SUPABASE) ===")
print("Iniciando puente de telemetría...")

# 🛡️ CONFIGURACIÓN DEL COMANDANTE 🛡️
# Reemplazar con las credenciales de Supabase
SUPABASE_URL = "https://ckeerpvomxozaarjbauo.supabase.co" 
SUPABASE_KEY = "sb_publishable_kFLVRMjYAJ5ITbyhpDd3tg_Mwbpt0L4"

def inyectar_informe_a_nube(datos_informe):
    """
    Envía el JSON generado por el motor local (Prime) hacia la tabla de pacientes en Supabase.
    """
    endpoint = f"{SUPABASE_URL}/rest/v1/pacientes"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    try:
        response = requests.post(endpoint, headers=headers, data=json.dumps(datos_informe))
        
        if response.status_code in [201, 204]:
            print(f"[ÉXITO] Informe de {datos_informe.get('paciente', 'DESCONOCIDO')} subido a la red.")
            return True
        else:
            print(f"[ERROR] Código de fallo: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"[ERROR CRÍTICO DE RED]: {e}")
        return False

if __name__ == "__main__":
    print("\n[MODO DE PRUEBA]")
    print("Asegúrate de haber colocado tus credenciales en el script.")
    
    # Ejemplo de estructura de datos generada por el dictado médico
    ejemplo_paciente = {
        "codAtencion": "26Q-999",
        "dni": "00000000",
        "medSolicitante": "SISTEMA AUTOMÁTICO TITAN",
        "paciente": "PRUEBA DE CONEXIÓN, SOBERANA",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fecEntrega": "2026-12-31",
        "tipo": "HE"
    }
    
    respuesta = input("¿Deseas enviar el informe de prueba a Supabase? (s/n): ")
    if respuesta.lower() == 's':
        inyectar_informe_a_nube(ejemplo_paciente)
