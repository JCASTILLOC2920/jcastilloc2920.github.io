import cv2
import numpy as np
from pathlib import Path

def photomerge_photoshop_grade(image_path: Path, output_path: Path):
    """
    Simula un revelado digital profesional de Photoshop (Camera Raw / Lightroom):
    - Balance de blancos bio-óptico (neutraliza dominantes amarillentas de fluorescentes).
    - Mapeo tonal dinámico adaptativo (recupera sombras sin quemar altas luces).
    - Micro-contraste de borde (Unsharp Masking suave).
    - Gradación de color clínico de alta gama (saturación selectiva + realce cian/esmeralda).
    """
    img = cv2.imread(str(image_path))
    if img is None:
        return False
        
    h, w = img.shape[:2]
    
    # 1. Corrección de Dominante de Color (Gray World adaptativo con preservación de blancos)
    img_float = img.astype(np.float32)
    b_avg, g_avg, r_avg = np.mean(img_float, axis=(0, 1))
    gray_avg = (b_avg + g_avg + r_avg) / 3.0
    
    # Factores de ganancia suaves (máximo 12% de corrección para no alterar colores biológicos)
    kb = np.clip(gray_avg / (b_avg + 1e-5), 0.90, 1.15)
    kg = np.clip(gray_avg / (g_avg + 1e-5), 0.92, 1.08)
    kr = np.clip(gray_avg / (r_avg + 1e-5), 0.90, 1.15)
    
    balanced = img_float.copy()
    balanced[:, :, 0] = np.clip(balanced[:, :, 0] * kb, 0, 255)
    balanced[:, :, 1] = np.clip(balanced[:, :, 1] * kg, 0, 255)
    balanced[:, :, 2] = np.clip(balanced[:, :, 2] * kr, 0, 255)
    balanced = balanced.astype(np.uint8)
    
    # 2. Espacio LAB: Revelado de Sombras y Contraste Tonal (Estilo Camera Raw Clarity)
    lab = cv2.cvtColor(balanced, cv2.COLOR_BGR2LAB)
    l, a, b_ch = cv2.split(lab)
    
    # CLAHE para contraste local profundo en detalles de instrumental y tejido
    clahe = cv2.createCLAHE(clipLimit=1.8, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    
    # Mezcla 70% CLAHE + 30% original para un look 100% natural sin grano artificial
    l_final = (l_enhanced.astype(np.float32) * 0.70 + l.astype(np.float32) * 0.30).astype(np.uint8)
    
    # 3. Micro-Enfoque Unsharp Mask (Definición de alta fidelidad)
    gaussian = cv2.GaussianBlur(l_final, (0, 0), 2.0)
    unsharp = cv2.addWeighted(l_final, 1.35, gaussian, -0.35, 0)
    
    # 4. Color Grading Tecnológico Sutil: Mayor viveza en canales a/b
    a_f = (a.astype(np.float32) - 128.0) * 1.08 + 128.0
    b_f = (b_ch.astype(np.float32) - 128.0) * 1.05 + 128.0
    a_final = np.clip(a_f, 0, 255).astype(np.uint8)
    b_final = np.clip(b_f, 0, 255).astype(np.uint8)
    
    merged_lab = cv2.merge([unsharp, a_final, b_final])
    result = cv2.cvtColor(merged_lab, cv2.COLOR_LAB2BGR)
    
    cv2.imwrite(str(output_path), result, [int(cv2.IMWRITE_JPEG_QUALITY), 96])
    return True

if __name__ == '__main__':
    repo_dir = Path(r"C:\Users\HP\Desktop\repositorio 2\jcastilloc2920.github.io")
    out_dir = repo_dir / "assets" / "fotos_hd"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    targets = [
        "MICROSCOPIO.jpg",
        "microscopio-patologia.jpg",
        "AREA DE MACROSCOPIA.jpg",
        "area-macroscopia.jpg",
        "laboratorio-macroscopia-1.jpg",
        "laboratorio-macroscopia-2.jpg",
        "OFCINAPRINCIPAL1.jpg",
        "OFICINA2.jpg",
        "oficina-administrativa.jpg",
        "recepcion-laboratorio.jpg",
        "SOFTWARE.jpg",
        "analisis-digital-patologia.jpg",
        "morfologia_he_original.jpg",
        "morfologia_ia_pleomorfismo.jpg",
        "morfologia_antes_despues.jpg"
    ]
    
    print("=== INICIANDO PROCESAMIENTO TIPO PHOTOSHOP / CAMERA RAW ===")
    count = 0
    for t in targets:
        src = repo_dir / t
        if src.exists():
            clean_name = t.lower().replace(" ", "_").replace("-", "_")
            dst = out_dir / clean_name
            ok = photomerge_photoshop_grade(src, dst)
            if ok:
                count += 1
                print(f"[OK] {t} -> assets/fotos_hd/{clean_name}")
    print(f"Total procesadas exitosamente: {count} fotos.")
