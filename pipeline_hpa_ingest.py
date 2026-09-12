"""
================================================================================
PIPELINE DE INGESTA Y MODELADO: THE HUMAN PROTEIN ATLAS (HPA v25.1)
Módulo: ARCHIVO-DE-REPORTES / ImmunoMaster AI
Ingesta de 'cancer_data.tsv' y 'proteinatlas.tsv'
Modelado de >15,000 anticuerpos y perfiles de tinción en 20 tipos de cáncer.
================================================================================
"""

import sys
import os
import io
import zipfile
import urllib.request
import json
import sqlite3
from typing import Dict, List, Tuple, Any

# Configuración de Endpoints HPA Oficiales
HPA_CANCER_DATA_URL = "https://www.proteinatlas.org/download/tsv/cancer_data.tsv.zip"
HPA_PROTEINATLAS_URL = "https://www.proteinatlas.org/download/proteinatlas.tsv.zip"
HPA_CANCERS_REF_URL = "https://www.proteinatlas.org/download/tsv/cancer_cancers.tsv.zip"

# Mapeo de los 20 cánceres principales de HPA a nomenclatura en español y sistemas de órganos
HPA_CANCER_METADATA = {
    "breast cancer": {"es": "Cáncer de mama", "organ": "Mama y aparato reproductor femenino", "icd": "8500/3"},
    "carcinoid": {"es": "Tumor neuroendocrino / Carcinoide", "organ": "Páncreas y tracto gastrointestinal", "icd": "8240/3"},
    "cervical cancer": {"es": "Cáncer de cérvix", "organ": "Mama y aparato reproductor femenino", "icd": "8070/3"},
    "colorectal cancer": {"es": "Cáncer colorrectal", "organ": "Tracto gastrointestinal", "icd": "8140/3"},
    "endometrial cancer": {"es": "Cáncer de endometrio", "organ": "Mama y aparato reproductor femenino", "icd": "8380/3"},
    "glioma": {"es": "Glioma", "organ": "Sistema nervioso central", "icd": "9380/3"},
    "head and neck cancer": {"es": "Cáncer de cabeza y cuello", "organ": "Tracto gastrointestinal / respiratorio", "icd": "8070/3"},
    "liver cancer": {"es": "Cáncer de hígado (Hepatocarcinoma)", "organ": "Hígado y vías biliares", "icd": "8170/3"},
    "lung cancer": {"es": "Cáncer de pulmón", "organ": "Aparato respiratorio", "icd": "8140/3"},
    "lymphoma": {"es": "Linfoma", "organ": "Médula ósea y tejido linfoide", "icd": "9590/3"},
    "melanoma": {"es": "Melanoma maligno", "organ": "Piel", "icd": "8720/3"},
    "ovarian cancer": {"es": "Cáncer de ovario", "organ": "Mama y aparato reproductor femenino", "icd": "8441/3"},
    "pancreatic cancer": {"es": "Cáncer de páncreas", "organ": "Páncreas", "icd": "8140/3"},
    "prostate cancer": {"es": "Cáncer de próstata", "organ": "Aparato reproductor masculino", "icd": "8140/3"},
    "renal cancer": {"es": "Cáncer renal (Carcinoma de células renales)", "organ": "Riñón y vejiga", "icd": "8312/3"},
    "skin cancer": {"es": "Cáncer de piel (No melanoma)", "organ": "Piel", "icd": "8070/3"},
    "stomach cancer": {"es": "Cáncer gástrico", "organ": "Tracto gastrointestinal", "icd": "8140/3"},
    "testis cancer": {"es": "Cáncer testicular (Células germinales)", "organ": "Aparato reproductor masculino", "icd": "9061/3"},
    "thyroid cancer": {"es": "Cáncer de tiroides", "organ": "Tejidos endocrinos", "icd": "8260/3"},
    "urothelial cancer": {"es": "Carcinoma urotelial (Vejiga)", "organ": "Riñón y vejiga", "icd": "8120/3"}
}

# Ponderación Bayesiana de Fiabilidad del Anticuerpo (IWGAV / HPA Scoring)
RELIABILITY_WEIGHTS = {
    "Enhanced": 1.00,   # Máxima validación ortogonal / genética / CRISPR
    "Approved": 1.00,   # Consistencia experimental comprobada con literatura
    "Supported": 0.75,  # Evidencia correlacional con ARNm
    "Uncertain": 0.35,  # Baja concordancia o reactividad cruzada sospechosa
    "": 0.30
}

class HPADataPipeline:
    def __init__(self, cache_dir: str = "data_hpa"):
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)
        self.cancer_data_path = os.path.join(self.cache_dir, "cancer_data.tsv.zip")
        self.proteinatlas_path = os.path.join(self.cache_dir, "proteinatlas.tsv.zip")

    def download_file(self, url: str, target_path: str):
        print(f"[HPA Ingest] Descargando {url} -> {target_path}...")
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ImmunoMaster/4.2"}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(target_path, "wb") as out:
            total_size = int(resp.headers.get("Content-Length", 0))
            downloaded = 0
            block_size = 1024 * 512
            while True:
                chunk = resp.read(block_size)
                if not chunk:
                    break
                out.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    pct = (downloaded / total_size) * 100
                    sys.stdout.write(f"\r  Progreso: {downloaded // (1024*1024)}MB / {total_size // (1024*1024)}MB ({pct:.1f}%)")
                    sys.stdout.flush()
        print("\n[HPA Ingest] Descarga completada exitosamente.")

    def ensure_datasets(self):
        if not os.path.exists(self.cancer_data_path):
            self.download_file(HPA_CANCER_DATA_URL, self.cancer_data_path)
        if not os.path.exists(self.proteinatlas_path):
            self.download_file(HPA_PROTEINATLAS_URL, self.proteinatlas_path)

    def load_antibody_metadata(self) -> Dict[str, dict]:
        """Extrae el catálogo de anticuerpos y sus niveles de fiabilidad de proteinatlas.tsv"""
        print("[HPA Ingest] Indexando catálogo de anticuerpos y validación clínica desde proteinatlas.tsv...")
        ab_meta = {}
        with zipfile.ZipFile(self.proteinatlas_path) as z:
            with z.open("proteinatlas.tsv") as f:
                header = [c.strip().strip('"') for c in f.readline().decode("utf-8").strip().split("\t")]
                gene_idx = header.index("Gene")
                ensg_idx = header.index("Ensembl")
                desc_idx = header.index("Gene description")
                ab_idx = header.index("Antibody")
                rel_ih_idx = header.index("Reliability (IH)")
                loc_idx = header.index("Subcellular main location") if "Subcellular main location" in header else header.index("Subcellular location")
                rrid_idx = header.index("Antibody RRID") if "Antibody RRID" in header else -1

                for line in f:
                    parts = [p.strip().strip('"') for p in line.decode("utf-8").strip().split("\t")]
                    if len(parts) <= max(gene_idx, ensg_idx, ab_idx, rel_ih_idx):
                        continue
                    gene_symbol = parts[gene_idx]
                    ensg_id = parts[ensg_idx]
                    description = parts[desc_idx] if desc_idx < len(parts) else ""
                    rel_ih = parts[rel_ih_idx] if rel_ih_idx < len(parts) else ""
                    loc = parts[loc_idx] if loc_idx < len(parts) else ""
                    rrid = parts[rrid_idx] if rrid_idx != -1 and rrid_idx < len(parts) else ""
                    ab_str = parts[ab_idx] if ab_idx < len(parts) else ""

                    abs_list = [a.strip() for a in ab_str.split(",") if a.strip()]
                    weight = RELIABILITY_WEIGHTS.get(rel_ih, 0.35)

                    record = {
                        "gene_symbol": gene_symbol,
                        "ensg_id": ensg_id,
                        "description": description,
                        "antibodies": abs_list,
                        "reliability_ih": rel_ih,
                        "reliability_weight": weight,
                        "localization": loc,
                        "rrid": rrid
                    }
                    ab_meta[gene_symbol.upper()] = record
                    ab_meta[ensg_id] = record

        print(f"[HPA Ingest] {len(ab_meta)//2} genes procesados con metadatos de validación IHQ.")
        return ab_meta

    def process_staining_matrix(self, ab_meta: Dict[str, dict], top_markers_filter: List[str] = None) -> List[dict]:
        """Procesa cancer_data.tsv calculando tinción y probabilidades bayesianas"""
        print("[HPA Ingest] Procesando perfiles de tinción tumoral en 20 tipos de cáncer...")
        results = []
        filter_set = set([m.upper() for m in top_markers_filter]) if top_markers_filter else None

        with zipfile.ZipFile(self.cancer_data_path) as z:
            with z.open("cancer_data.tsv") as f:
                header = f.readline().decode("utf-8").strip().split("\t")
                # Gene, Gene name, Cancer, High, Medium, Low, Not detected
                for line in f:
                    parts = line.decode("utf-8").strip().split("\t")
                    if len(parts) < 7:
                        continue
                    ensg_id, gene_name, cancer, high_s, med_s, low_s, nd_s = parts[:7]
                    gene_upper = gene_name.upper()

                    if filter_set and (gene_upper not in filter_set and ensg_id not in filter_set):
                        continue

                    try:
                        h = int(high_s)
                        m = int(med_s)
                        l = int(low_s)
                        nd = int(nd_s)
                    except ValueError:
                        continue

                    total = h + m + l + nd
                    pos_cases = h + m  # Clínicamente positivo: Tinción moderada o fuerte
                    reactivity_pct = round((pos_cases / total * 100.0), 1) if total > 0 else 0.0

                    # Suavizado bayesiano Beta(pos + 1, neg + 1)
                    alpha = 1.0
                    beta = 1.0
                    smoothed_prob = round((pos_cases + alpha) / (total + alpha + beta), 4)

                    meta = ab_meta.get(gene_upper) or ab_meta.get(ensg_id) or {}
                    cancer_info = HPA_CANCER_METADATA.get(cancer.lower(), {
                        "es": cancer.capitalize(),
                        "organ": "Otros",
                        "icd": "8000/3"
                    })

                    results.append({
                        "gene_symbol": gene_name,
                        "ensg_id": ensg_id,
                        "cancer_hpa": cancer,
                        "cancer_es": cancer_info["es"],
                        "organ_system": cancer_info["organ"],
                        "staining_high": h,
                        "staining_medium": m,
                        "staining_low": l,
                        "staining_not_detected": nd,
                        "patients_total": total,
                        "positive_cases": pos_cases,
                        "reactivity_pct": reactivity_pct,
                        "bayesian_smoothed_prob": smoothed_prob,
                        "reliability_ih": meta.get("reliability_ih", "Uncertain"),
                        "reliability_weight": meta.get("reliability_weight", 0.35),
                        "antibodies": meta.get("antibodies", []),
                        "cellular_localization": meta.get("localization", "")
                    })

        print(f"[HPA Ingest] Matriz generada con {len(results)} registros de reactividad tumoral.")
        return results

    def export_to_sqlite(self, results: List[dict], db_path: str = "cerebro.db"):
        """Exporta registros normalizados a tabla SQLite para uso local offline"""
        print(f"[HPA Ingest] Exportando tabla a SQLite: {db_path}...")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS hpa_tumor_staining_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gene_symbol TEXT NOT NULL,
            ensg_id TEXT NOT NULL,
            cancer_hpa TEXT NOT NULL,
            cancer_es TEXT NOT NULL,
            organ_system TEXT NOT NULL,
            staining_high INTEGER DEFAULT 0,
            staining_medium INTEGER DEFAULT 0,
            staining_low INTEGER DEFAULT 0,
            staining_not_detected INTEGER DEFAULT 0,
            patients_total INTEGER DEFAULT 0,
            reactivity_pct REAL DEFAULT 0.0,
            bayesian_smoothed_prob REAL DEFAULT 0.0,
            reliability_ih TEXT,
            reliability_weight REAL DEFAULT 1.0,
            antibodies_json TEXT,
            cellular_localization TEXT
        )
        """)
        
        cur.execute("CREATE INDEX IF NOT EXISTS idx_hpa_gene ON hpa_tumor_staining_profiles(gene_symbol);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_hpa_cancer ON hpa_tumor_staining_profiles(cancer_hpa);")
        
        # Inserción en lote
        rows = [
            (
                r["gene_symbol"], r["ensg_id"], r["cancer_hpa"], r["cancer_es"], r["organ_system"],
                r["staining_high"], r["staining_medium"], r["staining_low"], r["staining_not_detected"],
                r["patients_total"], r["reactivity_pct"], r["bayesian_smoothed_prob"],
                r["reliability_ih"], r["reliability_weight"], json.dumps(r["antibodies"]),
                r["cellular_localization"]
            )
            for r in results
        ]
        
        cur.executemany("""
        INSERT INTO hpa_tumor_staining_profiles (
            gene_symbol, ensg_id, cancer_hpa, cancer_es, organ_system,
            staining_high, staining_medium, staining_low, staining_not_detected,
            patients_total, reactivity_pct, bayesian_smoothed_prob,
            reliability_ih, reliability_weight, antibodies_json, cellular_localization
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, rows)
        
        conn.commit()
        conn.close()
        print(f"[HPA Ingest] Guardadas {len(rows)} filas en SQLite correctamente.")

    def export_json(self, results: List[dict], json_path: str = "hpa_cancer_markers_catalog.json"):
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"[HPA Ingest] Guardado JSON estructurado en {json_path}")

if __name__ == "__main__":
    # Biomarcadores diagnósticos clave en patología oncológica
    DIAGNOSTIC_MARKERS = [
        "NKX2-1", "KRT7", "KRT20", "CDX2", "GATA3", "PAX8", "WT1", "SOX10", "S100B",
        "TP63", "CALB2", "EPCAM", "MUC1", "AR", "KLK3", "VIM", "DES", "SYP", "CHGA",
        "MSH2", "MSH6", "MLH1", "PMS2", "ERBB2", "ESR1", "PGR", "BAP1", "SATB2"
    ]
    
    pipeline = HPADataPipeline()
    pipeline.ensure_datasets()
    meta = pipeline.load_antibody_metadata()
    results = pipeline.process_staining_matrix(meta, top_markers_filter=DIAGNOSTIC_MARKERS)
    pipeline.export_json(results, "hpa_top_markers.json")
    print("Pipeline ejecutado exitosamente con marcadores clave.")
