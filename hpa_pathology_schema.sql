-- ============================================================================
-- THE HUMAN PROTEIN ATLAS (HPA) v25.1 / PATHOLOGY & CANCER IHC SCHEMA
-- Open Data Integration for ARCHIVO-DE-REPORTES & ImmunoMaster AI
-- Compatible with PostgreSQL 15+, Supabase, and SQLite (via type adaptors)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. HPA CANCER TYPES (20 Core Malignancies)
CREATE TABLE IF NOT EXISTS hpa_cancers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cancer_name VARCHAR(128) NOT NULL UNIQUE,
    spanish_name VARCHAR(128) NOT NULL,
    organ_system VARCHAR(128) NOT NULL,
    icd_o_reference VARCHAR(64),
    cohort_patient_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hpa_cancers_name ON hpa_cancers (cancer_name);
CREATE INDEX IF NOT EXISTS idx_hpa_cancers_system ON hpa_cancers (organ_system);

-- 2. HPA ANTIBODIES & CLINICAL VALIDATION REGISTRY (>27,000 Antibodies)
CREATE TABLE IF NOT EXISTS hpa_antibodies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    antibody_code VARCHAR(64) NOT NULL UNIQUE,
    ensembl_gene_id VARCHAR(64) NOT NULL,
    gene_symbol VARCHAR(64) NOT NULL,
    reliability_ih VARCHAR(32) NOT NULL,
    reliability_weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    cellular_localization VARCHAR(255),
    rrid VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hpa_ab_code ON hpa_antibodies (antibody_code);
CREATE INDEX IF NOT EXISTS idx_hpa_ab_gene ON hpa_antibodies (gene_symbol);
CREATE INDEX IF NOT EXISTS idx_hpa_ab_ensg ON hpa_antibodies (ensembl_gene_id);
CREATE INDEX IF NOT EXISTS idx_hpa_ab_reliability ON hpa_antibodies (reliability_ih);

-- 3. HPA TUMOR STAINING EVIDENCE MATRIX (306,237 Records across 20 Cancers)
CREATE TABLE IF NOT EXISTS hpa_tumor_staining_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cancer_id UUID NOT NULL REFERENCES hpa_cancers(id) ON DELETE CASCADE,
    cancer_name VARCHAR(128) NOT NULL,
    ensembl_gene_id VARCHAR(64) NOT NULL,
    gene_symbol VARCHAR(64) NOT NULL,
    patients_high INT NOT NULL DEFAULT 0,
    patients_medium INT NOT NULL DEFAULT 0,
    patients_low INT NOT NULL DEFAULT 0,
    patients_not_detected INT NOT NULL DEFAULT 0,
    patients_total INT NOT NULL DEFAULT 0,
    reactivity_pct NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    bayesian_smoothed_prob NUMERIC(5,4) NOT NULL DEFAULT 0.05,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_hpa_cancer_gene UNIQUE (cancer_id, ensembl_gene_id)
);

CREATE INDEX IF NOT EXISTS idx_hpa_tsp_cancer ON hpa_tumor_staining_profiles (cancer_id);
CREATE INDEX IF NOT EXISTS idx_hpa_tsp_gene ON hpa_tumor_staining_profiles (gene_symbol);
CREATE INDEX IF NOT EXISTS idx_hpa_tsp_ensg ON hpa_tumor_staining_profiles (ensembl_gene_id);
CREATE INDEX IF NOT EXISTS idx_hpa_tsp_reactivity ON hpa_tumor_staining_profiles (reactivity_pct);
