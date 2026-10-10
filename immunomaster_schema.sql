-- ============================================================================
-- IMMUNOMASTER / OPEN-IMMUNOQUERY UNIVERSAL RELATIONAL SCHEMA
-- Architecture for >3,000 Neoplasms (ICD-O-3 / WHO) & >1,500 Antibodies
-- Compatible with PostgreSQL 15+, Supabase, and SQLite (FTS5 enabled)
-- ============================================================================

-- 1. EXTENSIONS & SETUP (PostgreSQL / Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search and typo tolerance

-- 2. ANTIBODIES / MARKERS CATALOG
CREATE TABLE IF NOT EXISTS antibodies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) NOT NULL UNIQUE,                -- e.g. 'CK7', 'TTF-1', 'SOX10', 'SATB2'
    official_name VARCHAR(255) NOT NULL,            -- e.g. 'Thyroid Transcription Factor-1'
    target_antigen VARCHAR(255),                    -- e.g. 'NKX2-1 homeobox protein'
    cellular_localization VARCHAR(64) NOT NULL,     -- 'Nuclear', 'Cytoplasmic', 'Membranous', 'Perinuclear Dot', 'Golgi'
    recommended_clone VARCHAR(128) DEFAULT 'Various', -- e.g. '8G7G3/1', 'SP141', 'BC28'
    vendor_catalog_refs JSONB DEFAULT '[]'::jsonb,  -- [{'vendor': 'Dako', 'code': 'M3562'}, {'vendor': 'Roche', 'code': '790-4398'}]
    is_local_stock BOOLEAN DEFAULT false,           -- True if currently in local laboratory inventory
    local_stock_vials INT DEFAULT 0,
    cost_per_test_cents INT DEFAULT 1500,           -- Standard cost accounting in cents (USD/PEN)
    clinical_utility_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_antibodies_code ON antibodies (code);
CREATE INDEX IF NOT EXISTS idx_antibodies_local_stock ON antibodies (is_local_stock);
CREATE INDEX IF NOT EXISTS idx_antibodies_trgm ON antibodies USING gin (official_name gin_trgm_ops);

-- 3. NEOPLASMS CATALOG (WHO 5th Edition & ICD-O-3 Universal Standard)
CREATE TABLE IF NOT EXISTS neoplasms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icd_o_code VARCHAR(32) NOT NULL,                -- e.g. '8140/3' (Adenocarcinoma, NOS), '8720/3' (Melanoma)
    who_category VARCHAR(128) NOT NULL,             -- e.g. 'Pulmonary Neoplasms', 'Breast Neoplasms', 'Soft Tissue'
    primary_organ VARCHAR(128) NOT NULL,            -- e.g. 'Lung', 'Breast', 'Colon', 'Kidney'
    histological_name VARCHAR(255) NOT NULL,        -- Official WHO nomenclature
    synonyms TEXT[] DEFAULT ARRAY[]::TEXT[],        -- Alternate diagnostic aliases
    typical_morphology TEXT,                        -- Small blue round, Spindle, Epithelioid, Clear cell, Pleomorphic
    incidence_rank INT DEFAULT 999,                 -- Epidemiological frequency (for Bayesian baseline priors)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_neoplasm_name_organ UNIQUE (histological_name, primary_organ)
);

CREATE INDEX IF NOT EXISTS idx_neoplasms_icd ON neoplasms (icd_o_code);
CREATE INDEX IF NOT EXISTS idx_neoplasms_organ ON neoplasms (primary_organ);
CREATE INDEX IF NOT EXISTS idx_neoplasms_category ON neoplasms (who_category);
CREATE INDEX IF NOT EXISTS idx_neoplasms_name_trgm ON neoplasms USING gin (histological_name gin_trgm_ops);

-- 4. IHC EVIDENCE / REACTIVITY DATA (The ImmunoQuery Matrix Engine)
-- Stores quantitative cases from peer-reviewed literature and consensus panels
CREATE TABLE IF NOT EXISTS ihc_reactivity_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    neoplasm_id UUID NOT NULL REFERENCES neoplasms(id) ON DELETE CASCADE,
    antibody_id UUID NOT NULL REFERENCES antibodies(id) ON DELETE CASCADE,
    positive_cases INT NOT NULL DEFAULT 0,
    total_cases INT NOT NULL DEFAULT 0,
    staining_intensity VARCHAR(32) DEFAULT 'Moderate/Strong', -- 'Weak', 'Moderate', 'Strong', 'Variable'
    staining_pattern VARCHAR(64) DEFAULT 'Diffuse',          -- 'Diffuse (>50%)', 'Focal (10-50%)', 'Rare (<10%)'
    evidence_grade VARCHAR(16) DEFAULT 'Consensus',          -- 'Grade A (Meta-analysis)', 'Grade B (Cohort)', 'Grade C (Case series)'
    pmid_list TEXT[] DEFAULT ARRAY[]::TEXT[],                -- PubMed IDs: ['PMID:21245084', 'PMID:16524310']
    literature_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_neoplasm_antibody UNIQUE (neoplasm_id, antibody_id),
    CONSTRAINT chk_positive_lte_total CHECK (positive_cases <= total_cases)
);

CREATE INDEX IF NOT EXISTS idx_evidence_neoplasm ON ihc_reactivity_evidence (neoplasm_id);
CREATE INDEX IF NOT EXISTS idx_evidence_antibody ON ihc_reactivity_evidence (antibody_id);

-- 5. MATERIALIZED VIEW FOR ULTRA-FAST RUNTIME INFERENCE
-- Pre-calculates smoothed Bayesian beta parameters Beta(pos+1, total-pos+1) and raw %
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ihc_inference_matrix AS
SELECT 
    e.neoplasm_id,
    n.histological_name AS neoplasm_name,
    n.primary_organ,
    n.icd_o_code,
    e.antibody_id,
    a.code AS antibody_code,
    a.cellular_localization,
    a.is_local_stock,
    e.positive_cases,
    e.total_cases,
    ROUND((e.positive_cases::numeric / NULLIF(e.total_cases, 0)::numeric) * 100.0, 1) AS reactivity_pct,
    -- Beta-Binomial smoothed expectation with Laplace prior (alpha=1, beta=1):
    ROUND(((e.positive_cases + 1.0) / (e.total_cases + 2.0))::numeric, 4) AS bayesian_smoothed_prob,
    e.pmid_list
FROM ihc_reactivity_evidence e
JOIN neoplasms n ON e.neoplasm_id = n.id
JOIN antibodies a ON e.antibody_id = a.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_matrix_unique ON mv_ihc_inference_matrix (neoplasm_id, antibody_id);
CREATE INDEX IF NOT EXISTS idx_mv_matrix_ab ON mv_ihc_inference_matrix (antibody_code);
CREATE INDEX IF NOT EXISTS idx_mv_matrix_organ ON mv_ihc_inference_matrix (primary_organ);

-- 6. SQLITE FTS5 COMPATIBILITY DEFINITIONS (For edge offline deployment in client apps)
-- If deploying to SQLite / cerebro.db:
/*
CREATE VIRTUAL TABLE IF NOT EXISTS neoplasms_fts USING fts5(
    neoplasm_id UNINDEXED,
    histological_name,
    synonyms,
    primary_organ,
    who_category,
    tokenize = 'porter unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS antibodies_fts USING fts5(
    antibody_id UNINDEXED,
    code,
    official_name,
    target_antigen,
    tokenize = 'porter unicode61'
);
*/
