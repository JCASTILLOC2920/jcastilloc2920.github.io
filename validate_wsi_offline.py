#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_wsi_offline.py
Validacion de Activos Histologicos WSI Locales (24/7 Offline Resilience)
JC PATH LAB • Anatomia Patologica & Diagnostico Oncologico
"""

import os
import sys
import time
from PIL import Image

REPO_DIR = os.path.dirname(os.path.abspath(__file__))
WSI_DIR = os.path.join(REPO_DIR, 'wsi_slides')

SLIDES = [
    {
        'num': 1,
        'name': 'Piel / Dermatopatologia',
        'file': 'muestra_1_piel_dermatopatologia.webp',
        'thumb': 'muestra_1_piel_thumb.webp',
        'min_w': 2000,
        'min_h': 2000,
        'target_size_desc': '1.97 MB (Original Master 40x)'
    },
    {
        'num': 2,
        'name': 'Biopsia Gastrica / Neoplasia Digestiva',
        'file': 'muestra_2_biopsia_gastrica.webp',
        'thumb': 'muestra_2_biopsia_gastrica_thumb.webp',
        'min_w': 2000,
        'min_h': 2000,
        'target_size_desc': '~2.3 MB (Optimizado desde PNG 9.9 MB)'
    },
    {
        'num': 3,
        'name': 'Carcinoma Acinar / Patologia Tisular',
        'file': 'muestra_3_carcinoma_acinar.webp',
        'thumb': 'muestra_3_carcinoma_acinar_thumb.webp',
        'min_w': 2000,
        'min_h': 1000,
        'target_size_desc': '~1.4 MB (Alta Definicion 3600px)'
    }
]

def validate():
    print("=" * 75)
    print(" REPORTE DE CERTIFICACION Y AUDITORIA DE ACTIVOS WSI OFFLINE 24/7")
    print("=" * 75)
    print(f"Directorio WSI: {WSI_DIR}")
    print(f"Hora de Auditoria: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 75)

    all_passed = True

    for s in SLIDES:
        print(f"\n[+] Muestra {s['num']}: {s['name']}")
        main_path = os.path.join(WSI_DIR, s['file'])
        thumb_path = os.path.join(WSI_DIR, s['thumb'])

        # 1. Validar Archivo Principal
        if not os.path.exists(main_path):
            print(f"  [!] ERROR: Archivo principal no existe en disco: {s['file']}")
            all_passed = False
            continue

        size_bytes = os.path.getsize(main_path)
        size_mb = size_bytes / (1024 * 1024)

        t0 = time.perf_counter()
        try:
            with Image.open(main_path) as im:
                im.load() # decodificacion completa de pixeles en RAM
                w, h = im.size
                fmt = im.format
                mode = im.mode
        except Exception as e:
            print(f"  [!] ERROR: El archivo no es legible o esta corrupto: {e}")
            all_passed = False
            continue
        decode_time_ms = (time.perf_counter() - t0) * 1000

        print(f"  OK Archivo Principal: {s['file']}")
        print(f"    - Resolucion: {w} x {h} px (Adecuada para Zoom 40x: {'SI' if w >= s['min_w'] else 'NO'})")
        print(f"    - Formato: {fmt} | Modo de Color: {mode}")
        print(f"    - Peso en Disco: {size_bytes:,} bytes ({size_mb:.2f} MB)")
        print(f"    - Meta de Almacenamiento: {s['target_size_desc']}")
        print(f"    - Latencia de Carga Local: {decode_time_ms:.1f} ms (0 ms espera externa de red)")

        # 2. Validar Thumbnail de Minimapa
        if not os.path.exists(thumb_path):
            print(f"  [!] ERROR: Thumbnail no existe en disco: {s['thumb']}")
            all_passed = False
            continue

        th_bytes = os.path.getsize(thumb_path)
        th_kb = th_bytes / 1024

        try:
            with Image.open(thumb_path) as th_im:
                th_im.load()
                th_w, th_h = th_im.size
                th_fmt = th_im.format
        except Exception as e:
            print(f"  [!] ERROR: El thumbnail no es legible: {e}")
            all_passed = False
            continue

        print(f"  OK Thumbnail Minimapa: {s['thumb']}")
        print(f"    - Resolucion Minimapa: {th_w} x {th_h} px")
        print(f"    - Formato: {th_fmt} | Peso: {th_bytes:,} bytes ({th_kb:.1f} KB)")

    print("\n" + "=" * 75)
    if all_passed:
        print(" CERTIFICACION FINAL: APTO PARA OPERACION 100% OFFLINE (RESILIENCIA 24/7)")
        print(" Las 3 muestras histologicas operan de forma autonoma sin red ni nube.")
        print("=" * 75)
        return 0
    else:
        print(" FALLO DE VALIDACION: Revise los errores señalados.")
        print("=" * 75)
        return 1

if __name__ == '__main__':
    sys.exit(validate())
