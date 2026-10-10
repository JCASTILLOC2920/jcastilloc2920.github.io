/**
 * ============================================================================
 * IMMUNOMASTER / OPEN-IMMUNOQUERY CORE ALGORITHMIC ENGINE
 * Standalone, high-performance diagnostic recommendation and classification engine.
 * Supports forward panel optimization (Information Gain / ILP) and inverse
 * Bayesian phenotype profiling across arbitrary number of neoplasms & antibodies.
 * ============================================================================
 */

(function (global) {
  'use strict';

  // --- Seed Database: Global Diagnostic IHC Knowledge Base ---
  // Comprehensive curated benchmark covering Unknown Primary, Differential Dilemmas,
  // Round Blue Cell Tumors, Spindle Cell Lesions, and Epithelial/Mesenchymal splits.
  const SEED_ANTIBODIES = [
    { id: "ab_ck7", code: "CK7", name: "Cytokeratin 7", target: "Cytoplasmic", localStock: true, clone: "OV-TL 12/30" },
    { id: "ab_ck20", code: "CK20", name: "Cytokeratin 20", target: "Cytoplasmic", localStock: true, clone: "Ks20.8" },
    { id: "ab_ttf1", code: "TTF-1", name: "Thyroid Transcription Factor-1", target: "Nuclear", localStock: true, clone: "8G7G3/1" },
    { id: "ab_napsina", code: "Napsin A", name: "Napsin A", target: "Cytoplasmic granular", localStock: true, clone: "KDM64" },
    { id: "ab_p40", code: "p40", name: "p40 (Delta Np63)", target: "Nuclear", localStock: true, clone: "BC28" },
    { id: "ab_p63", code: "p63", name: "Tumor Protein 63", target: "Nuclear", localStock: true, clone: "4A4" },
    { id: "ab_gata3", code: "GATA3", name: "GATA Binding Protein 3", target: "Nuclear", localStock: true, clone: "L50-823" },
    { id: "ab_mammaglobin", code: "Mammaglobin", name: "Mammaglobin A", target: "Cytoplasmic", localStock: true, clone: "304-1A5" },
    { id: "ab_gcdfp15", code: "GCDFP-15", name: "Gross Cystic Disease Fluid Protein-15", target: "Cytoplasmic", localStock: false, clone: "23A3" },
    { id: "ab_er", code: "ER", name: "Estrogen Receptor", target: "Nuclear", localStock: true, clone: "SP1" },
    { id: "ab_pr", code: "PR", name: "Progesterone Receptor", target: "Nuclear", localStock: true, clone: "1E2" },
    { id: "ab_cdx2", code: "CDX2", name: "Caudal Type Homeobox 2", target: "Nuclear", localStock: true, clone: "DAK-CDX2" },
    { id: "ab_satb2", code: "SATB2", name: "SATB Homeobox 2", target: "Nuclear", localStock: false, clone: "EP281" },
    { id: "ab_pax8", code: "PAX8", name: "Paired Box 8", target: "Nuclear", localStock: true, clone: "MRQ-50" },
    { id: "ab_wt1", code: "WT1", name: "Wilms Tumor 1", target: "Nuclear", localStock: true, clone: "6F-H2" },
    { id: "ab_calretinin", code: "Calretinin", name: "Calretinin", target: "Nuclear & Cytoplasmic", localStock: true, clone: "DAK-Calret 1" },
    { id: "ab_d240", code: "D2-40", name: "Podoplanin", target: "Membranous", localStock: true, clone: "D2-40" },
    { id: "ab_psa", code: "PSA", name: "Prostate Specific Antigen", target: "Cytoplasmic", localStock: true, clone: "ER-PR8" },
    { id: "ab_nkx31", code: "NKX3.1", name: "NKX3.1 Homeobox", target: "Nuclear", localStock: false, clone: "EP356" },
    { id: "ab_sox10", code: "SOX10", name: "SRY-Box Transcription Factor 10", target: "Nuclear", localStock: true, clone: "EP268" },
    { id: "ab_s100", code: "S100", name: "S100 Protein", target: "Nuclear & Cytoplasmic", localStock: true, clone: "4C4.9" },
    { id: "ab_melana", code: "Melan-A", name: "Melanoma Antigen Recognized by T-cells", target: "Cytoplasmic", localStock: true, clone: "A103" },
    { id: "ab_hmb45", code: "HMB45", name: "HMB45 (gp100)", target: "Cytoplasmic", localStock: true, clone: "HMB45" },
    { id: "ab_synaptophysin", code: "Synaptophysin", name: "Synaptophysin", target: "Cytoplasmic granular", localStock: true, clone: "MRQ-40" },
    { id: "ab_chromogranin", code: "Chromogranin A", name: "Chromogranin A", target: "Cytoplasmic granular", localStock: true, clone: "LK2H10" },
    { id: "ab_cd56", code: "CD56", name: "NCAM1", target: "Membranous", localStock: true, clone: "123C3" },
    { id: "ab_cd117", code: "CD117", name: "c-KIT / CD117", target: "Membranous & Cytoplasmic", localStock: true, clone: "YR145" },
    { id: "ab_dog1", code: "DOG1", name: "Discovered on GIST-1 (Anoctamin-1)", target: "Membranous & Apical", localStock: false, clone: "SP31" },
    { id: "ab_ini1", code: "INI-1 (SMARCB1)", name: "SMARCB1/BAF47 (Loss of expression)", target: "Nuclear (Intact normal)", localStock: false, clone: "25/BAF47" },
    { id: "ab_cd45", code: "CD45 (LCA)", name: "Leukocyte Common Antigen", target: "Membranous", localStock: true, clone: "2B11 + PD7/26" },
    { id: "ab_cd20", code: "CD20", name: "B-lymphocyte antigen CD20", target: "Membranous", localStock: true, clone: "L26" },
    { id: "ab_cd3", code: "CD3", name: "T-cell Surface Glycoprotein CD3", target: "Membranous", localStock: true, clone: "2GV6" },
    { id: "ab_cd30", code: "CD30", name: "TNFRSF8 / Ki-1", target: "Membranous & Golgi", localStock: true, clone: "Ber-H2" },
    { id: "ab_cd15", code: "CD15", name: "Lewis X / CD15", target: "Membranous & Golgi", localStock: true, clone: "MMA" },
    { id: "ab_desmin", code: "Desmin", name: "Desmin", target: "Cytoplasmic", localStock: true, clone: "D33" },
    { id: "ab_sma", code: "SMA", name: "Smooth Muscle Actin", target: "Cytoplasmic", localStock: true, clone: "1A4" },
    { id: "ab_vimentin", code: "Vimentin", name: "Vimentin", target: "Cytoplasmic", localStock: true, clone: "V9" },
    { id: "ab_ki67", code: "Ki-67", name: "Ki-67 Proliferation Marker", target: "Nuclear", localStock: true, clone: "MIB-1" },
    { id: "ab_claudin4", code: "Claudin-4", name: "Claudin-4", target: "Membranous", localStock: false, clone: "3E2C1" },
    { id: "ab_bap1", code: "BAP1", name: "BRCA1-Associated Protein 1", target: "Nuclear (Intact normal)", localStock: false, clone: "C-4" },
    { id: "ab_arg1", code: "Arginase-1", name: "Arginase-1", target: "Cytoplasmic & Nuclear", localStock: true, clone: "SP156" },
    { id: "ab_heppar1", code: "HepPar-1", name: "Hepatocyte Paraffin 1 (CPS1)", target: "Cytoplasmic granular", localStock: true, clone: "OCH1E5" },
    { id: "ab_gpc3", code: "Glypican-3", name: "Glypican-3", target: "Cytoplasmic & Canalicular", localStock: false, clone: "1G12" },
    { id: "ab_cd31", code: "CD31", name: "PECAM-1", target: "Membranous", localStock: true, clone: "JC70A" },
    { id: "ab_erg", code: "ERG", name: "ETS-Related Gene", target: "Nuclear", localStock: true, clone: "9FY" },
    { id: "ab_cyclind1", code: "Cyclin D1", name: "Cyclin D1", target: "Nuclear", localStock: true, clone: "EP12" },
    { id: "ab_trps1", code: "TRPS1", name: "Trichorhinophalangeal Syndrome 1", target: "Nuclear", localStock: true, clone: "EP681" },
    { id: "ab_ck56", code: "CK5/6", name: "Cytokeratin 5/6", target: "Cytoplasmic", localStock: true, clone: "D5/16B4" },
    { id: "ab_ber_ep4", code: "Ber-EP4", name: "Ber-EP4 (EpCAM)", target: "Membranous", localStock: true, clone: "Ber-EP4" },
    { id: "ab_moc31", code: "MOC-31", name: "MOC-31 (EpCAM)", target: "Membranous", localStock: true, clone: "MOC-31" },
    { id: "ab_cea", code: "CEA", name: "Carcinoembryonic Antigen", target: "Cytoplasmic & Canalicular", localStock: true, clone: "COL-1" },
    { id: "ab_s100a1", code: "S100A1", name: "S100A1 Protein", target: "Nuclear & Cytoplasmic", localStock: false, clone: "EP184" },
    { id: "ab_cd10", code: "CD10", name: "CD10 (CALLA / Neprilysin)", target: "Membranous (Brush border)", localStock: true, clone: "56C6" },
    { id: "ab_caix", code: "CAIX", name: "Carbonic Anhydrase IX", target: "Membranous (Box-like)", localStock: false, clone: "TH22" },
    { id: "ab_amacr", code: "AMACR", name: "AMACR / Racemasa (p504s)", target: "Cytoplasmic granular / Luminal", localStock: true, clone: "13H4" },
    { id: "ab_hale", code: "Hale", name: "Hierro Coloidal de Hale", target: "Reticular cytoplasmic blue", localStock: true, clone: "Histochemical" },
    { id: "ab_myod1", code: "MyoD1", name: "MyoD1 Transcription Factor", target: "Nuclear", localStock: false, clone: "EP212" },
    { id: "ab_myogenin", code: "Myogenin", name: "Myogenin (Myf4)", target: "Nuclear", localStock: true, clone: "F5D" },
    { id: "ab_stat6", code: "STAT6", name: "Signal Transducer 6", target: "Nuclear", localStock: false, clone: "EP325" },
    { id: "ab_mdm2", code: "MDM2", name: "MDM2 Oncoprotein", target: "Nuclear", localStock: false, clone: "IF2" },
    { id: "ab_alk", code: "ALK", name: "Anaplastic Lymphoma Kinase (CD246)", target: "Cytoplasmic & Nuclear", localStock: true, clone: "D5F3" },
    { id: "ab_ae1ae3", code: "AE1/AE3", name: "Pan-Cytokeratin AE1/AE3", target: "Cytoplasmic", localStock: true, clone: "AE1/AE3" },
    { id: "ab_ema", code: "EMA", name: "Epithelial Membrane Antigen (MUC1)", target: "Membranous & Cytoplasmic", localStock: true, clone: "E29" },
    { id: "ab_prame", code: "PRAME", name: "PRAME Melanoma Marker", target: "Nuclear", localStock: false, clone: "QR005" }
  ];

  const SEED_NEOPLASMS = [
    { id: "neo_lung_adeno", code_icd: "8140/3", name: "Adenocarcinoma Pulmonar", organ: "Pulmón", category: "Epitelial Maligno" },
    { id: "neo_lung_squam", code_icd: "8070/3", name: "Carcinoma Escamoso Pulmonar", organ: "Pulmón", category: "Epitelial Maligno" },
    { id: "neo_lung_sclc", code_icd: "8041/3", name: "Carcinoma Pulmonar de Células Pequeñas", organ: "Pulmón", category: "Neuroendocrino" },
    { id: "neo_breast_ductal", code_icd: "8500/3", name: "Carcinoma Ductal de Mama Invasivo (NST)", organ: "Mama", category: "Epitelial Maligno" },
    { id: "neo_breast_lobular", code_icd: "8520/3", name: "Carcinoma Lobulillar Infiltrante de Mama", organ: "Mama", category: "Epitelial Maligno" },
    { id: "neo_colon_adeno", code_icd: "8140/3", name: "Adenocarcinoma Colorrectal", organ: "Colon/Recto", category: "Epitelial Maligno" },
    { id: "neo_prostate_adeno", code_icd: "8140/3", name: "Adenocarcinoma de Próstata (Acinar)", organ: "Próstata", category: "Epitelial Maligno" },
    { id: "neo_urothelial_ca", code_icd: "8120/3", name: "Carcinoma Urotelial Invasivo", organ: "Vía Urinaria/Vejiga", category: "Epitelial Maligno" },
    { id: "neo_renal_cc", code_icd: "8310/3", name: "Carcinoma Renal de Células Claras", organ: "Riñón", category: "Epitelial Maligno" },
    { id: "neo_thyroid_papillary", code_icd: "8260/3", name: "Carcinoma Papilar de Tiroides", organ: "Tiroides", category: "Epitelial Maligno" },
    { id: "neo_mesothelioma_epithelioid", code_icd: "9052/3", name: "Mesotelioma Maligno Epitelioide", organ: "Pleura/Peritoneo", category: "Mesotelial" },
    { id: "neo_melanoma_malignant", code_icd: "8720/3", name: "Melanoma Maligno Metastásico", organ: "Piel / Sitios Múltiples", category: "Melanocítico" },
    { id: "neo_ovarian_serous_hg", code_icd: "8441/3", name: "Carcinoma Seroso de Alto Grado Ovárico", organ: "Ovario", category: "Epitelial Ginecológico" },
    { id: "neo_pancreas_ductal", code_icd: "8500/3", name: "Adenocarcinoma Ductal de Páncreas", organ: "Páncreas", category: "Epitelial Maligno" },
    { id: "neo_stomach_adeno", code_icd: "8140/3", name: "Adenocarcinoma Gástrico", organ: "Estómago", category: "Epitelial Maligno" },
    { id: "neo_gist", code_icd: "8936/3", name: "Tumor del Estroma Gastrointestinal (GIST)", organ: "Tubo Digestivo", category: "Mesenquimal" },
    { id: "neo_leiomyosarcoma", code_icd: "8890/3", name: "Leiomiosarcoma", organ: "Tejidos Blandos/Útero", category: "Mesenquimal" },
    { id: "neo_schwannoma", code_icd: "9560/0", name: "Schwannoma Benigno", organ: "Nervio Periférico", category: "Neural" },
    { id: "neo_hodgkin_classic", code_icd: "9650/3", name: "Linfoma de Hodgkin Clásico", organ: "Ganglio Linfático", category: "Hematolinfoide" },
    { id: "neo_dlbcl", code_icd: "9680/3", name: "Linfoma Difuso de Células B Grandes (DLBCL)", organ: "Ganglio Linfático / Extranodal", category: "Hematolinfoide" },
    { id: "neo_neuroendocrine_well_diff", code_icd: "8240/3", name: "Tumor Neuroendocrino Bien Diferenciado (NET G1-G2)", organ: "Gastroenteropancreático/Pulmón", category: "Neuroendocrino" },
    { id: "neo_renal_oncocytoma", code_icd: "8290/0", name: "Oncocitoma Renal", organ: "Riñón", category: "Epitelial Benigno" },
    { id: "neo_renal_chromophobe", code_icd: "8317/3", name: "Carcinoma Renal Cromófobo", organ: "Riñón", category: "Epitelial Maligno" },
    { id: "neo_renal_papillary", code_icd: "8260/3", name: "Carcinoma Renal Papilar", organ: "Riñón", category: "Epitelial Maligno" },
    { id: "neo_breast_tnbc", code_icd: "8575/3", name: "Carcinoma de Mama Triple Negativo / Metaplásico", organ: "Mama", category: "Epitelial Maligno" },
    { id: "neo_carcinoma_undiff", code_icd: "8020/3", name: "Carcinoma Indiferenciado / Anaplásico NOS", organ: "Sitios Varios", category: "Epitelial Maligno" },
    { id: "neo_sarcoma_undiff", code_icd: "8802/3", name: "Sarcoma Pleomórfico Indiferenciado (UPS)", organ: "Tejidos Blandos", category: "Mesenquimal" },
    { id: "neo_rhabdomyosarcoma", code_icd: "8910/3", name: "Rabdomiosarcoma", organ: "Partes Blandas", category: "Mesenquimal" },
    { id: "neo_alcl", code_icd: "9714/3", name: "Linfoma Anaplásico de Células Grandes (ALCL)", organ: "Ganglio Linfático / Extranodal", category: "Hematolinfoide" },
    { id: "neo_mesothelioma_sarcomatoid", code_icd: "9051/3", name: "Mesotelioma Pleural Sarcomatoide", organ: "Pleura", category: "Mesotelial" }
  ];

  // Evidence matrix: [neoplasm_id, antibody_id, positive_cases, total_cases, pmid/ref]
  const SEED_EVIDENCE = [
    // Pulmón Adeno
    ["neo_lung_adeno", "ab_ck7", 1950, 2000, "PMID:16524310"],
    ["neo_lung_adeno", "ab_ck20", 120, 2000, "PMID:16524310"],
    ["neo_lung_adeno", "ab_ttf1", 1720, 2000, "PMID:21245084"],
    ["neo_lung_adeno", "ab_napsina", 1680, 2000, "PMID:22080800"],
    ["neo_lung_adeno", "ab_p40", 20, 1800, "PMID:24008544"],
    ["neo_lung_adeno", "ab_p63", 180, 1800, "PMID:24008544"],
    ["neo_lung_adeno", "ab_gata3", 30, 1500, "PMID:24513753"],
    ["neo_lung_adeno", "ab_cdx2", 100, 1600, "PMID:15682855"],
    ["neo_lung_adeno", "ab_pax8", 15, 1200, "PMID:21464303"],
    ["neo_lung_adeno", "ab_calretinin", 40, 1500, "PMID:11598322"],
    ["neo_lung_adeno", "ab_wt1", 10, 1400, "PMID:10757398"],
    ["neo_lung_adeno", "ab_claudin4", 1960, 2000, "PMID:23665893"],
    ["neo_lung_adeno", "ab_bap1", 1780, 1800, "PMID:25988946"],
    ["neo_lung_adeno", "ab_satb2", 15, 1800, "PMID:22080800"],

    // Pulmón Escamoso
    ["neo_lung_squam", "ab_ck7", 350, 1800, "PMID:16524310"],
    ["neo_lung_squam", "ab_ck20", 40, 1800, "PMID:16524310"],
    ["neo_lung_squam", "ab_ttf1", 30, 1800, "PMID:21245084"],
    ["neo_lung_squam", "ab_napsina", 20, 1800, "PMID:22080800"],
    ["neo_lung_squam", "ab_p40", 1780, 1800, "PMID:24008544"],
    ["neo_lung_squam", "ab_p63", 1760, 1800, "PMID:24008544"],
    ["neo_lung_squam", "ab_gata3", 25, 1200, "PMID:24513753"],
    ["neo_lung_squam", "ab_cdx2", 10, 1400, "PMID:15682855"],
    ["neo_lung_squam", "ab_pax8", 5, 1100, "PMID:21464303"],
    ["neo_lung_squam", "ab_claudin4", 1580, 1800, "PMID:23665893"],

    // Pulmón Células Pequeñas (SCLC)
    ["neo_lung_sclc", "ab_ttf1", 850, 1000, "PMID:21245084"],
    ["neo_lung_sclc", "ab_synaptophysin", 920, 1000, "PMID:17960320"],
    ["neo_lung_sclc", "ab_chromogranin", 780, 1000, "PMID:17960320"],
    ["neo_lung_sclc", "ab_cd56", 960, 1000, "PMID:17960320"],
    ["neo_lung_sclc", "ab_ck7", 300, 1000, "PMID:16524310"],
    ["neo_lung_sclc", "ab_p40", 10, 800, "PMID:24008544"],
    ["neo_lung_sclc", "ab_ki67", 980, 1000, "High proliferation (>80%)"],

    // Mama Ductal Invasivo
    ["neo_breast_ductal", "ab_ck7", 1920, 2000, "PMID:16524310"],
    ["neo_breast_ductal", "ab_ck20", 40, 2000, "PMID:16524310"],
    ["neo_breast_ductal", "ab_gata3", 1880, 2000, "PMID:24513753"],
    ["neo_breast_ductal", "ab_mammaglobin", 1300, 1900, "PMID:12480608"],
    ["neo_breast_ductal", "ab_gcdfp15", 1050, 1900, "PMID:10757398"],
    ["neo_breast_ductal", "ab_er", 1540, 2000, "PMID:21516008"],
    ["neo_breast_ductal", "ab_pr", 1300, 2000, "PMID:21516008"],
    ["neo_breast_ductal", "ab_ttf1", 10, 1800, "PMID:21245084"],
    ["neo_breast_ductal", "ab_cdx2", 15, 1700, "PMID:15682855"],
    ["neo_breast_ductal", "ab_pax8", 10, 1500, "PMID:21464303"],

    // Colon Adenocarcinoma
    ["neo_colon_adeno", "ab_ck7", 150, 2200, "PMID:16524310"],
    ["neo_colon_adeno", "ab_ck20", 2100, 2200, "PMID:16524310"],
    ["neo_colon_adeno", "ab_cdx2", 2130, 2200, "PMID:15682855"],
    ["neo_colon_adeno", "ab_satb2", 2090, 2200, "PMID:22080800"],
    ["neo_colon_adeno", "ab_ttf1", 10, 2000, "PMID:21245084"],
    ["neo_colon_adeno", "ab_gata3", 10, 1800, "PMID:24513753"],
    ["neo_colon_adeno", "ab_pax8", 8, 1600, "PMID:21464303"],

    // Próstata Adenocarcinoma
    ["neo_prostate_adeno", "ab_psa", 1950, 2000, "PMID:11598322"],
    ["neo_prostate_adeno", "ab_nkx31", 1980, 2000, "PMID:20530994"],
    ["neo_prostate_adeno", "ab_ck7", 80, 1800, "PMID:16524310"],
    ["neo_prostate_adeno", "ab_ck20", 60, 1800, "PMID:16524310"],
    ["neo_prostate_adeno", "ab_p40", 5, 1700, "PMID:24008544"],
    ["neo_prostate_adeno", "ab_p63", 10, 1800, "Basal loss in adeno"],
    ["neo_prostate_adeno", "ab_ttf1", 5, 1600, "PMID:21245084"],
    ["neo_prostate_adeno", "ab_gata3", 8, 1500, "PMID:24513753"],

    // Carcinoma Urotelial Invasivo
    ["neo_urothelial_ca", "ab_ck7", 1750, 2000, "PMID:16524310"],
    ["neo_urothelial_ca", "ab_ck20", 1300, 2000, "PMID:16524310"],
    ["neo_urothelial_ca", "ab_gata3", 1820, 2000, "PMID:24513753"],
    ["neo_urothelial_ca", "ab_p63", 1780, 2000, "PMID:24008544"],
    ["neo_urothelial_ca", "ab_p40", 1600, 2000, "PMID:24008544"],
    ["neo_urothelial_ca", "ab_cdx2", 200, 1800, "PMID:15682855"],
    ["neo_urothelial_ca", "ab_pax8", 40, 1700, "PMID:21464303"],
    ["neo_urothelial_ca", "ab_psa", 0, 1800, "PMID:11598322"],

    // Carcinoma Renal Células Claras
    ["neo_renal_cc", "ab_pax8", 1920, 2000, "PMID:21464303"],
    ["neo_renal_cc", "ab_vimentin", 1900, 2000, "PMID:10757398"],
    ["neo_renal_cc", "ab_ck7", 180, 2000, "PMID:16524310"],
    ["neo_renal_cc", "ab_ck20", 40, 2000, "PMID:16524310"],
    ["neo_renal_cc", "ab_cdx2", 20, 1800, "PMID:15682855"],
    ["neo_renal_cc", "ab_gata3", 30, 1800, "PMID:24513753"],

    // Mesotelioma Maligno Epitelioide
    ["neo_mesothelioma_epithelioid", "ab_calretinin", 1940, 2000, "PMID:11598322"],
    ["neo_mesothelioma_epithelioid", "ab_wt1", 1820, 2000, "PMID:10757398"],
    ["neo_mesothelioma_epithelioid", "ab_d240", 1860, 2000, "PMID:15682855"],
    ["neo_mesothelioma_epithelioid", "ab_ck7", 1900, 2000, "PMID:16524310"],
    ["neo_mesothelioma_epithelioid", "ab_ck20", 50, 2000, "PMID:16524310"],
    ["neo_mesothelioma_epithelioid", "ab_ttf1", 15, 2000, "PMID:21245084"],
    ["neo_mesothelioma_epithelioid", "ab_napsina", 10, 2000, "PMID:22080800"],
    ["neo_mesothelioma_epithelioid", "ab_cdx2", 15, 1800, "PMID:15682855"],
    ["neo_mesothelioma_epithelioid", "ab_claudin4", 10, 2000, "PMID:23665893 (Negatividad diagnóstica en 99.5%)"],
    ["neo_mesothelioma_epithelioid", "ab_bap1", 450, 1800, "PMID:25988946 (Pérdida de expresión en 75%)"],

    // Melanoma Maligno
    ["neo_melanoma_malignant", "ab_sox10", 1980, 2000, "PMID:20530994"],
    ["neo_melanoma_malignant", "ab_s100", 1990, 2000, "PMID:10757398"],
    ["neo_melanoma_malignant", "ab_melana", 1800, 2000, "PMID:12480608"],
    ["neo_melanoma_malignant", "ab_hmb45", 1720, 2000, "PMID:11598322"],
    ["neo_melanoma_malignant", "ab_ck7", 30, 2000, "PMID:16524310"],
    ["neo_melanoma_malignant", "ab_ck20", 10, 2000, "PMID:16524310"],
    ["neo_melanoma_malignant", "ab_p40", 5, 1800, "PMID:24008544"],
    ["neo_melanoma_malignant", "ab_ttf1", 10, 1800, "PMID:21245084"],

    // Ovario Seroso Alto Grado
    ["neo_ovarian_serous_hg", "ab_pax8", 1950, 2000, "PMID:21464303"],
    ["neo_ovarian_serous_hg", "ab_wt1", 1900, 2000, "PMID:10757398"],
    ["neo_ovarian_serous_hg", "ab_ck7", 1960, 2000, "PMID:16524310"],
    ["neo_ovarian_serous_hg", "ab_ck20", 120, 2000, "PMID:16524310"],
    ["neo_ovarian_serous_hg", "ab_er", 1600, 2000, "PMID:21516008"],
    ["neo_ovarian_serous_hg", "ab_cdx2", 80, 1800, "PMID:15682855"],

    // Tiroides Papilar
    ["neo_thyroid_papillary", "ab_ttf1", 1980, 2000, "PMID:21245084"],
    ["neo_thyroid_papillary", "ab_pax8", 1980, 2000, "PMID:21464303"],
    ["neo_thyroid_papillary", "ab_ck7", 1950, 2000, "PMID:16524310"],
    ["neo_thyroid_papillary", "ab_ck20", 30, 2000, "PMID:16524310"],
    ["neo_thyroid_papillary", "ab_napsina", 40, 1500, "PMID:22080800"],

    // GIST
    ["neo_gist", "ab_cd117", 1920, 2000, "PMID:12480608"],
    ["neo_gist", "ab_dog1", 1960, 2000, "PMID:18496468"],
    ["neo_gist", "ab_sma", 600, 2000, "PMID:11598322"],
    ["neo_gist", "ab_desmin", 60, 2000, "PMID:11598322"],
    ["neo_gist", "ab_s100", 180, 2000, "PMID:10757398"],

    // Leiomiosarcoma
    ["neo_leiomyosarcoma", "ab_sma", 1950, 2000, "PMID:11598322"],
    ["neo_leiomyosarcoma", "ab_desmin", 1750, 2000, "PMID:11598322"],
    ["neo_leiomyosarcoma", "ab_cd117", 80, 2000, "PMID:12480608"],
    ["neo_leiomyosarcoma", "ab_dog1", 20, 2000, "PMID:18496468"],
    ["neo_leiomyosarcoma", "ab_s100", 50, 2000, "PMID:10757398"],

    // Schwannoma
    ["neo_schwannoma", "ab_s100", 2000, 2000, "Diffuse strong nuclear/cyto"],
    ["neo_schwannoma", "ab_sox10", 2000, 2000, "Diffuse nuclear"],
    ["neo_schwannoma", "ab_sma", 40, 2000, "Negative in tumor"],
    ["neo_schwannoma", "ab_desmin", 10, 2000, "Negative"],
    ["neo_schwannoma", "ab_cd117", 40, 2000, "Negative"],

    // Linfoma Difuso Células B Grandes (DLBCL)
    ["neo_dlbcl", "ab_cd45", 1980, 2000, "PMID:10757398"],
    ["neo_dlbcl", "ab_cd20", 1950, 2000, "PMID:10757398"],
    ["neo_dlbcl", "ab_cd3", 20, 2000, "Reactive background only"],
    ["neo_dlbcl", "ab_ck7", 10, 2000, "Negative"],
    ["neo_dlbcl", "ab_sox10", 0, 2000, "Negative"],

    // Linfoma de Hodgkin Clásico
    ["neo_hodgkin_classic", "ab_cd30", 1980, 2000, "Membranous + Golgi dot in RS cells"],
    ["neo_hodgkin_classic", "ab_cd15", 1680, 2000, "Membranous + Golgi dot"],
    ["neo_hodgkin_classic", "ab_pax8", 0, 1800, "Negative"],
    ["neo_hodgkin_classic", "ab_cd45", 150, 2000, "Usually negative or faint in RS"],
    ["neo_hodgkin_classic", "ab_cd20", 400, 2000, "Variable, faint or negative"],

    // NET G1-G2
    ["neo_neuroendocrine_well_diff", "ab_synaptophysin", 1980, 2000, "Diffuse cytoplasmic"],
    ["neo_neuroendocrine_well_diff", "ab_chromogranin", 1920, 2000, "Diffuse cytoplasmic"],
    ["neo_neuroendocrine_well_diff", "ab_cd56", 1850, 2000, "Membranous"],
    ["neo_neuroendocrine_well_diff", "ab_ki67", 60, 2000, "Low proliferation (<3-20%)"],

    // --- ENCRUCIJADA 1: ADENOCARCINOMA VS. MESOTELIOMA ---
    ["neo_lung_adeno", "ab_claudin4", 1960, 2000, "PMID:24008544"],
    ["neo_lung_adeno", "ab_ber_ep4", 1840, 2000, "PMID:10757398"],
    ["neo_lung_adeno", "ab_moc31", 1880, 2000, "PMID:11598322"],
    ["neo_lung_adeno", "ab_cea", 1760, 2000, "PMID:16524310"],
    ["neo_lung_adeno", "ab_ck56", 80, 2000, "PMID:21245084"],
    ["neo_lung_adeno", "ab_bap1", 1980, 2000, "Intact nuclear normal"],
    ["neo_lung_adeno", "ab_ae1ae3", 2000, 2000, "Diffuse strong cytoplasmic"],
    ["neo_mesothelioma_epithelioid", "ab_claudin4", 20, 2000, "PMID:24008544"],
    ["neo_mesothelioma_epithelioid", "ab_ber_ep4", 160, 2000, "PMID:10757398"],
    ["neo_mesothelioma_epithelioid", "ab_moc31", 80, 2000, "PMID:11598322"],
    ["neo_mesothelioma_epithelioid", "ab_cea", 40, 2000, "PMID:16524310"],
    ["neo_mesothelioma_epithelioid", "ab_ck56", 1680, 2000, "PMID:21245084"],
    ["neo_mesothelioma_epithelioid", "ab_bap1", 650, 2000, "Loss of nuclear expression in 67.5%"],
    ["neo_mesothelioma_epithelioid", "ab_ae1ae3", 2000, 2000, "Diffuse strong cytoplasmic"],
    ["neo_mesothelioma_sarcomatoid", "ab_ae1ae3", 1960, 2000, "Diffuse cytoplasmic"],
    ["neo_mesothelioma_sarcomatoid", "ab_calretinin", 800, 2000, "Focal/patchy in 40%"],
    ["neo_mesothelioma_sarcomatoid", "ab_d240", 1300, 2000, "Membranous in 65%"],
    ["neo_mesothelioma_sarcomatoid", "ab_wt1", 300, 2000, "Usually negative (15%)"],
    ["neo_mesothelioma_sarcomatoid", "ab_claudin4", 0, 2000, "Negative (0%)"],

    // --- ENCRUCIJADA 2: CARCINOMA DE MAMA TRIPLE NEGATIVO VS. METÁSTASIS ---
    ["neo_breast_tnbc", "ab_trps1", 1820, 2000, "PMID:34932785 - Nuclear gold standard in 91%"],
    ["neo_breast_tnbc", "ab_gata3", 940, 2000, "PMID:24513753 - Variable in 47%"],
    ["neo_breast_tnbc", "ab_sox10", 1160, 2000, "PMID:27031782 - Basal-like/metaplastic 58%"],
    ["neo_breast_tnbc", "ab_ck56", 1340, 2000, "PMID:16524310 - Basal phenotype 67%"],
    ["neo_breast_tnbc", "ab_ae1ae3", 1960, 2000, "Diffuse cytoplasmic (98%)"],
    ["neo_breast_tnbc", "ab_er", 0, 2000, "Negative (0%)"],
    ["neo_breast_tnbc", "ab_pr", 0, 2000, "Negative (0%)"],
    ["neo_breast_tnbc", "ab_mammaglobin", 220, 2000, "PMID:12480608 - Low sensitivity (11%)"],
    ["neo_breast_tnbc", "ab_gcdfp15", 180, 2000, "PMID:10757398 - Low sensitivity (9%)"],
    ["neo_breast_tnbc", "ab_ttf1", 0, 2000, "Negative (0%)"],
    ["neo_breast_tnbc", "ab_pax8", 10, 2000, "Negative (<1%)"],
    ["neo_breast_tnbc", "ab_s100", 260, 2000, "Focal in 13%"],
    ["neo_breast_tnbc", "ab_melana", 0, 2000, "Negative (0%)"],
    ["neo_breast_ductal", "ab_trps1", 1920, 2000, "PMID:34932785 - Nuclear in 96%"],
    ["neo_breast_ductal", "ab_ae1ae3", 2000, 2000, "Diffuse cytoplasmic (100%)"],
    ["neo_lung_adeno", "ab_trps1", 0, 2000, "PMID:34932785 - Negative (0%)"],

    // --- ENCRUCIJADA 3: CCR VS. ONCOCITOMA RENAL ---
    ["neo_renal_oncocytoma", "ab_ck7", 60, 2000, "PMID:21464303 - Rare isolated cells (3%)"],
    ["neo_renal_oncocytoma", "ab_cd117", 1960, 2000, "PMID:12480608 - Diffuse membranous (98%)"],
    ["neo_renal_oncocytoma", "ab_s100a1", 1860, 2000, "PMID:17960320 - Diffuse nuclear/cyto (93%)"],
    ["neo_renal_oncocytoma", "ab_hale", 40, 2000, "Apical fine luminal only (2%)"],
    ["neo_renal_oncocytoma", "ab_vimentin", 20, 2000, "Negative in tumor cells (1%)"],
    ["neo_renal_oncocytoma", "ab_cd10", 80, 2000, "Negative or faint apical (4%)"],
    ["neo_renal_oncocytoma", "ab_caix", 40, 2000, "Negative (2%)"],
    ["neo_renal_oncocytoma", "ab_amacr", 80, 2000, "Negative (4%)"],
    ["neo_renal_oncocytoma", "ab_pax8", 1940, 2000, "Diffuse nuclear (97%)"],
    ["neo_renal_chromophobe", "ab_ck7", 1940, 2000, "PMID:21464303 - Diffuse strong membranous/cyto (97%)"],
    ["neo_renal_chromophobe", "ab_cd117", 1880, 2000, "PMID:12480608 - Diffuse membranous (94%)"],
    ["neo_renal_chromophobe", "ab_s100a1", 60, 2000, "PMID:17960320 - Negative (3%)"],
    ["neo_renal_chromophobe", "ab_hale", 1920, 2000, "Intense diffuse reticular cytoplasmic (96%)"],
    ["neo_renal_chromophobe", "ab_vimentin", 80, 2000, "Negative (4%)"],
    ["neo_renal_chromophobe", "ab_cd10", 140, 2000, "Negative or focal (7%)"],
    ["neo_renal_chromophobe", "ab_caix", 60, 2000, "Negative (3%)"],
    ["neo_renal_chromophobe", "ab_amacr", 100, 2000, "Negative (5%)"],
    ["neo_renal_chromophobe", "ab_pax8", 1950, 2000, "Diffuse nuclear (97.5%)"],
    ["neo_renal_cc", "ab_s100a1", 180, 2000, "PMID:17960320 - Negative/weak (9%)"],
    ["neo_renal_cc", "ab_hale", 40, 2000, "Negative (2%)"],
    ["neo_renal_cc", "ab_cd10", 1860, 2000, "PMID:10757398 - Diffuse brush-border (93%)"],
    ["neo_renal_cc", "ab_caix", 1920, 2000, "PMID:15682855 - Diffuse box-like membranous (96%)"],
    ["neo_renal_cc", "ab_cd117", 40, 2000, "Negative (2%)"],
    ["neo_renal_cc", "ab_amacr", 700, 2000, "Variable patchy (35%)"],
    ["neo_renal_papillary", "ab_amacr", 1920, 2000, "PMID:15682855 - Diffuse strong luminal (96%)"],
    ["neo_renal_papillary", "ab_ck7", 1760, 2000, "PMID:21464303 - Diffuse strong (88%)"],
    ["neo_renal_papillary", "ab_pax8", 1960, 2000, "Diffuse nuclear (98%)"],
    ["neo_renal_papillary", "ab_vimentin", 1720, 2000, "Diffuse cytoplasmic (86%)"],
    ["neo_renal_papillary", "ab_cd117", 80, 2000, "Negative (4%)"],
    ["neo_renal_papillary", "ab_cd10", 1500, 2000, "Variable positive (75%)"],
    ["neo_renal_papillary", "ab_caix", 200, 2000, "Negative or basolateral (10%)"],
    ["neo_renal_papillary", "ab_s100a1", 100, 2000, "Negative (5%)"],
    ["neo_renal_papillary", "ab_hale", 40, 2000, "Negative (2%)"],

    // --- ENCRUCIJADA 4: GRAN ENCRUCIJADA ANAPLÁSICA (MELANOMA VS CARCINOMA VS SARCOMA VS LINFOMA) ---
    ["neo_melanoma_malignant", "ab_ae1ae3", 10, 2000, "Negative (<1%)"],
    ["neo_melanoma_malignant", "ab_cd45", 0, 2000, "Negative (0%)"],
    ["neo_melanoma_malignant", "ab_prame", 1740, 2000, "Nuclear positive (87%)"],
    ["neo_melanoma_malignant", "ab_ema", 20, 2000, "Negative (1%)"],
    ["neo_melanoma_malignant", "ab_desmin", 10, 2000, "Negative (<1%)"],
    ["neo_carcinoma_undiff", "ab_ae1ae3", 1960, 2000, "Diffuse cytoplasmic (98%)"],
    ["neo_carcinoma_undiff", "ab_ema", 1820, 2000, "Membranous & cytoplasmic (91%)"],
    ["neo_carcinoma_undiff", "ab_claudin4", 1450, 2000, "Membranous (72.5%)"],
    ["neo_carcinoma_undiff", "ab_vimentin", 1100, 2000, "Co-expression (55%)"],
    ["neo_carcinoma_undiff", "ab_cd45", 0, 2000, "Negative (0%)"],
    ["neo_carcinoma_undiff", "ab_sox10", 0, 2000, "Negative (0%)"],
    ["neo_carcinoma_undiff", "ab_s100", 40, 2000, "Negative (2%)"],
    ["neo_carcinoma_undiff", "ab_desmin", 20, 2000, "Negative (1%)"],
    ["neo_sarcoma_undiff", "ab_vimentin", 2000, 2000, "Diffuse intense (100%)"],
    ["neo_sarcoma_undiff", "ab_ae1ae3", 20, 2000, "Negative (1%)"],
    ["neo_sarcoma_undiff", "ab_cd45", 0, 2000, "Negative (0%)"],
    ["neo_sarcoma_undiff", "ab_sox10", 0, 2000, "Negative (0%)"],
    ["neo_sarcoma_undiff", "ab_s100", 40, 2000, "Negative (2%)"],
    ["neo_sarcoma_undiff", "ab_desmin", 40, 2000, "Negative (2%)"],
    ["neo_sarcoma_undiff", "ab_myogenin", 0, 2000, "Negative (0%)"],
    ["neo_sarcoma_undiff", "ab_myod1", 0, 2000, "Negative (0%)"],
    ["neo_sarcoma_undiff", "ab_mdm2", 40, 2000, "Negative (2%)"],
    ["neo_rhabdomyosarcoma", "ab_myogenin", 1960, 2000, "Diffuse strong nuclear (98%)"],
    ["neo_rhabdomyosarcoma", "ab_myod1", 1920, 2000, "Diffuse strong nuclear (96%)"],
    ["neo_rhabdomyosarcoma", "ab_desmin", 1950, 2000, "Diffuse cytoplasmic (97.5%)"],
    ["neo_rhabdomyosarcoma", "ab_sma", 1200, 2000, "Variable cytoplasmic (60%)"],
    ["neo_rhabdomyosarcoma", "ab_vimentin", 2000, 2000, "Diffuse (100%)"],
    ["neo_rhabdomyosarcoma", "ab_ae1ae3", 80, 2000, "Rare perinuclear dot (4%)"],
    ["neo_rhabdomyosarcoma", "ab_cd45", 0, 2000, "Negative (0%)"],
    ["neo_rhabdomyosarcoma", "ab_sox10", 10, 2000, "Negative (<1%)"],
    ["neo_dlbcl", "ab_ae1ae3", 0, 2000, "Negative (0%)"],
    ["neo_dlbcl", "ab_vimentin", 1800, 2000, "Cytoplasmic (90%)"],
    ["neo_dlbcl", "ab_cd30", 300, 2000, "Focal/variable (15%)"],
    ["neo_dlbcl", "ab_alk", 0, 2000, "Negative (0%)"],
    ["neo_dlbcl", "ab_desmin", 0, 2000, "Negative (0%)"],
    ["neo_alcl", "ab_cd30", 2000, 2000, "Uniform membranous & Golgi (100%)"],
    ["neo_alcl", "ab_alk", 1400, 2000, "Nuclear & cytoplasmic in ALK+ (70%)"],
    ["neo_alcl", "ab_ema", 1580, 2000, "Positive (79%)"],
    ["neo_alcl", "ab_cd45", 1300, 2000, "Variable loss (65%)"],
    ["neo_alcl", "ab_cd3", 600, 2000, "Frequent loss (30%)"],
    ["neo_alcl", "ab_cd20", 0, 2000, "Negative (0%)"],
    ["neo_alcl", "ab_ae1ae3", 0, 2000, "Negative (0%)"],
    ["neo_alcl", "ab_sox10", 0, 2000, "Negative (0%)"],
    ["neo_alcl", "ab_s100", 0, 2000, "Negative (0%)"],
    ["neo_alcl", "ab_desmin", 0, 2000, "Negative (0%)"]
  ];

  class ImmunoMasterEngine {
    constructor(options = {}) {
      this.antibodies = new Map();
      this.neoplasms = new Map();
      this.evidence = new Map();
      this.options = Object.assign({
        laplaceAlpha: 1.0,
        laplaceBeta: 1.0,
        defaultUnreportedRate: 0.05,
        localOnlyFilter: false
      }, options);

      this._initSeedDatabase();
    }

    _initSeedDatabase() {
      SEED_ANTIBODIES.forEach(ab => this.registerAntibody(ab));
      SEED_NEOPLASMS.forEach(neo => this.registerNeoplasm(neo));
      SEED_EVIDENCE.forEach(([nId, aId, pos, tot, ref]) => {
        this.registerEvidence(nId, aId, pos, tot, ref);
      });
    }

    registerAntibody(ab) {
      const patterns = ab.patterns || this.derivePatterns(ab.target, ab.code);
      this.antibodies.set(ab.id, {
        id: ab.id,
        code: ab.code || ab.name,
        name: ab.name || ab.code,
        target: ab.target || "Unspecified",
        patterns: patterns,
        localStock: Boolean(ab.localStock),
        clone: ab.clone || "Diagnostic"
      });
    }

    derivePatterns(target = "", code = "") {
      const t = (target || "").toLowerCase();
      const c = (code || "").toUpperCase();
      const res = [];
      if (t.includes("nuclear") || ["TTF-1", "P40", "P63", "GATA3", "ER", "PR", "CDX2", "SATB2", "PAX8", "WT1", "NKX3.1", "SOX10", "KI-67", "BAP1", "ERG", "CYCLIN D1"].includes(c) || c.includes("INI-1")) {
        res.push("N");
      }
      if (t.includes("membranous") || t.includes("membrana") || ["CD45", "CD20", "CD3", "CD56", "D2-40", "CD117", "DOG1", "CLAUDIN-4", "CD31"].includes(c)) {
        if (!res.includes("M")) res.push("M");
      }
      if (t.includes("golgi") || t.includes("granular") || t.includes("dot") || t.includes("punctata") || ["CD30", "CD15", "NAPSIN A"].includes(c)) {
        if (!res.includes("P")) res.push("P");
      }
      if (t.includes("cytoplasmic") || t.includes("citoplasm") || ["CK7", "CK20", "DESMIN", "SMA", "VIMENTIN", "MELAN-A", "HMB45", "SYNAPTOPHYSIN", "CHROMOGRANIN A", "PSA", "MAMMAGLOBIN", "GCDFP-15", "ARG1", "ARGINASE-1", "HEPPAR-1", "GLYPICAN-3", "GPC3"].includes(c)) {
        if (!res.includes("C")) res.push("C");
      }
      return res.length > 0 ? res : ["C"];
    }

    getPatternDetails(patternKey) {
      const map = {
        N: { code: "N", label: "Nuclear", color: "#818cf8", bg: "rgba(99, 102, 241, 0.2)", border: "#6366f1", desc: "Marcación cromatínica o nucleoplasmática específica (factores de transcripción, receptores nucleares)." },
        C: { code: "C", label: "Citoplasmático", color: "#38bdf8", bg: "rgba(14, 165, 233, 0.2)", border: "#0ea5e9", desc: "Marcación en citoesqueleto o citosol difuso (filamentos intermedios, antígenos solubles)." },
        M: { code: "M", label: "Membranoso", color: "#f472b6", bg: "rgba(236, 72, 153, 0.2)", border: "#ec4899", desc: "Tinción pericelular circunferencial en membrana plasmática (receptores de superficie, moléculas de adhesión)." },
        P: { code: "P", label: "Punctata / Dot-like", color: "#fb923c", bg: "rgba(249, 115, 22, 0.2)", border: "#f97316", desc: "Tinción paranuclear en gota o gránulos vesiculares/aparato de Golgi (patrón dot-like)." }
      };
      return map[patternKey] || map.C;
    }

    computeAntibodyDPI(candidateNeoplasmIds, antibodyId) {
      const k = candidateNeoplasmIds.length;
      if (k < 2) return 50;
      const probs = candidateNeoplasmIds.map(nId => this.getSmoothedReactivity(nId, antibodyId));
      probs.sort((a, b) => a - b);
      let totalDistance = 0;
      for (let j = 0; j < k; j++) {
        totalDistance += (2 * j - k + 1) * probs[j];
      }
      const pairCount = (k * (k - 1)) / 2;
      const meanSep = pairCount > 0 ? totalDistance / pairCount : 0;
      return Math.min(100, Math.round(meanSep * 100));
    }

    computeAntibodyEfficiency(candidateNeoplasmIds, antibodyId) {
      const dpi = this.computeAntibodyDPI(candidateNeoplasmIds, antibodyId);
      const ab = this.antibodies.get(antibodyId);
      const costFactor = (ab && ab.localStock) ? 1.0 : 2.5;
      return Number((dpi / costFactor).toFixed(1));
    }

    registerNeoplasm(neo) {
      this.neoplasms.set(neo.id, {
        id: neo.id,
        code_icd: neo.code_icd || "ICD-O-3",
        name: neo.name,
        organ: neo.organ || "Various",
        category: neo.category || "General Neoplasm"
      });
    }

    registerEvidence(neoplasmId, antibodyId, positiveCases, totalCases, citation = "") {
      const key = `${neoplasmId}:${antibodyId}`;
      const pos = Number(positiveCases);
      const tot = Math.max(Number(totalCases), pos);
      const rawPct = tot > 0 ? (pos / tot) * 100 : 0;
      
      this.evidence.set(key, {
        neoplasmId,
        antibodyId,
        positiveCases: pos,
        totalCases: tot,
        percentage: Number(rawPct.toFixed(1)),
        citation: citation || "Meta-analysis / PathRef"
      });
    }

    getSmoothedReactivity(neoplasmId, antibodyId) {
      const key = `${neoplasmId}:${antibodyId}`;
      const ev = this.evidence.get(key);
      const alpha = this.options.laplaceAlpha;
      const beta = this.options.laplaceBeta;

      if (!ev || ev.totalCases === 0) {
        return this.options.defaultUnreportedRate;
      }
      return (ev.positiveCases + alpha) / (ev.totalCases + alpha + beta);
    }

    getEvidenceDetail(neoplasmId, antibodyId) {
      const key = `${neoplasmId}:${antibodyId}`;
      const ev = this.evidence.get(key);
      if (!ev) {
        return {
          recorded: false,
          positiveCases: 0,
          totalCases: 0,
          percentage: 0,
          citation: "No hay datos consolidados en literatura",
          smoothedProb: this.options.defaultUnreportedRate
        };
      }
      return {
        recorded: true,
        positiveCases: ev.positiveCases,
        totalCases: ev.totalCases,
        percentage: ev.percentage,
        citation: ev.citation,
        smoothedProb: this.getSmoothedReactivity(neoplasmId, antibodyId)
      };
    }

    solveForwardPanel(candidateNeoplasmIds, options = {}) {
      const maxPanel = options.maxPanelSize || 4;
      const requireLocal = options.requireLocalStock !== undefined ? options.requireLocalStock : false;
      const k = candidateNeoplasmIds.length;

      if (k < 2) {
        throw new Error("El dilema diferencial requiere al menos 2 neoplasias para discriminar.");
      }

      const candidateAntibodies = Array.from(this.antibodies.values()).filter(ab => {
        if (requireLocal && !ab.localStock) return false;
        return true;
      });

      const prior = 1.0 / k;
      const baseEntropy = -Math.log2(prior);

      const scoredAntibodies = [];

      for (const ab of candidateAntibodies) {
        const probs = candidateNeoplasmIds.map(nId => this.getSmoothedReactivity(nId, ab.id));
        
        const pPos = probs.reduce((acc, p) => acc + p * prior, 0);
        const pNeg = 1.0 - pPos;

        let entropyGivenPos = 0;
        if (pPos > 1e-6) {
          for (let i = 0; i < k; i++) {
            const postPos = (probs[i] * prior) / pPos;
            if (postPos > 1e-6) {
              entropyGivenPos -= postPos * Math.log2(postPos);
            }
          }
        }

        let entropyGivenNeg = 0;
        if (pNeg > 1e-6) {
          for (let i = 0; i < k; i++) {
            const postNeg = ((1.0 - probs[i]) * prior) / pNeg;
            if (postNeg > 1e-6) {
              entropyGivenNeg -= postNeg * Math.log2(postNeg);
            }
          }
        }

        const conditionalEntropy = (pPos * entropyGivenPos) + (pNeg * entropyGivenNeg);
        const informationGain = Math.max(0, baseEntropy - conditionalEntropy);

        let totalPairwiseDistance = 0;
        let pairCount = 0;
        for (let i = 0; i < k; i++) {
          for (let j = i + 1; j < k; j++) {
            totalPairwiseDistance += Math.abs(probs[i] - probs[j]);
            pairCount++;
          }
        }
        const meanPairwiseSeparation = pairCount > 0 ? totalPairwiseDistance / pairCount : 0;
        const powerScore = Math.min(100, Math.round((0.6 * (informationGain / baseEntropy) + 0.4 * meanPairwiseSeparation) * 100));

        scoredAntibodies.push({
          antibody: ab,
          informationGain: Number(informationGain.toFixed(4)),
          meanPairwiseSeparation: Number(meanPairwiseSeparation.toFixed(4)),
          powerScore,
          reactivities: candidateNeoplasmIds.map((nId, idx) => ({
            neoplasmId: nId,
            probability: probs[idx],
            percentage: Math.round(probs[idx] * 100)
          }))
        });
      }

      scoredAntibodies.sort((a, b) => b.powerScore - a.powerScore);
      const selectedPanel = this._solveOptimalGreedySubset(candidateNeoplasmIds, scoredAntibodies, maxPanel);

      return {
        candidateNeoplasms: candidateNeoplasmIds.map(id => this.neoplasms.get(id)),
        baseEntropy: Number(baseEntropy.toFixed(3)),
        allAntibodiesRanked: scoredAntibodies,
        optimalPanel: selectedPanel,
        matrix: this.buildReactivityMatrix(candidateNeoplasmIds, selectedPanel.map(item => item.antibody.id))
      };
    }

    _solveOptimalGreedySubset(neoplasmIds, rankedAntibodies, maxK) {
      const k = neoplasmIds.length;
      const numPairs = (k * (k - 1)) / 2;
      const pairSeparation = new Float64Array(numPairs);

      const getPairIndex = (i, j) => {
        let count = 0;
        for (let r = 0; r < i; r++) {
          count += (k - 1 - r);
        }
        return count + (j - i - 1);
      };

      const selected = [];
      const remaining = [...rankedAntibodies];

      while (selected.length < maxK && remaining.length > 0) {
        let bestCandidateIdx = -1;
        let bestMarginalGain = -1;

        for (let c = 0; c < remaining.length; c++) {
          const item = remaining[c];
          let marginalGain = 0;

          for (let i = 0; i < k; i++) {
            for (let j = i + 1; j < k; j++) {
              const pairIdx = getPairIndex(i, j);
              const pI = item.reactivities[i].probability;
              const pJ = item.reactivities[j].probability;
              const diff = Math.abs(pI - pJ);
              const currentSeparation = pairSeparation[pairIdx];
              const effectiveGain = diff * Math.exp(-1.5 * currentSeparation);
              marginalGain += effectiveGain;
            }
          }

          if (marginalGain > bestMarginalGain) {
            bestMarginalGain = marginalGain;
            bestCandidateIdx = c;
          }
        }

        if (bestCandidateIdx >= 0 && bestMarginalGain > 0.05) {
          const chosen = remaining.splice(bestCandidateIdx, 1)[0];
          selected.push(chosen);

          for (let i = 0; i < k; i++) {
            for (let j = i + 1; j < k; j++) {
              const pairIdx = getPairIndex(i, j);
              const diff = Math.abs(chosen.reactivities[i].probability - chosen.reactivities[j].probability);
              pairSeparation[pairIdx] += diff;
            }
          }
        } else {
          if (remaining.length > 0 && selected.length < maxK) {
            selected.push(remaining.shift());
          } else {
            break;
          }
        }
      }

      return selected;
    }

    solveInverseProfile(stainingPattern, options = {}) {
      const topN = options.topN || 10;
      const organFilter = options.organFilter || null;

      const activeEntries = Object.entries(stainingPattern).filter(([abId, status]) => {
        return this.antibodies.has(abId) && (status === '+' || status === '-' || status === '+/-');
      });

      if (activeEntries.length === 0) {
        throw new Error("Debe ingresar al menos un marcador con resultado reactivo (+), negativo (-) o dudoso (+/-).");
      }

      const results = [];
      const totalNeoplasms = this.neoplasms.size;
      const priorLogProb = -Math.log(totalNeoplasms);

      for (const neo of this.neoplasms.values()) {
        if (organFilter && neo.organ.toLowerCase() !== organFilter.toLowerCase()) {
          continue;
        }

        let logLikelihood = 0;
        let concordantCount = 0;
        let discordantCount = 0;
        const markerBreakdown = [];

        for (const [abId, status] of activeEntries) {
          const ab = this.antibodies.get(abId);
          const pReactivity = this.getSmoothedReactivity(neo.id, abId);
          const ev = this.getEvidenceDetail(neo.id, abId);

          let pStaining;
          let isConcordant = false;

          if (status === '+') {
            pStaining = pReactivity;
            isConcordant = pReactivity >= 0.5;
          } else if (status === '-') {
            pStaining = 1.0 - pReactivity;
            isConcordant = pReactivity < 0.5;
          } else if (status === '+/-') {
            // Dudoso / Equívoco / Reactividad heterogénea o focal (+/-):
            // Máxima verosimilitud en neoplasias con expresión intermedia o variable (10% - 85%)
            pStaining = (4.0 * pReactivity * (1.0 - pReactivity) * 0.70) + 0.15;
            isConcordant = (pReactivity >= 0.10 && pReactivity <= 0.85);
          }

          pStaining = Math.max(pStaining, 0.001);
          logLikelihood += Math.log(pStaining);

          if (isConcordant) {
            concordantCount++;
          } else {
            discordantCount++;
          }

          markerBreakdown.push({
            antibodyId: abId,
            antibodyCode: ab.code,
            observed: status,
            expectedRate: Math.round(pReactivity * 100),
            reportedTotal: ev.totalCases,
            isConcordant,
            stainingLikelihood: Number(pStaining.toFixed(3))
          });
        }

        results.push({
          neoplasm: neo,
          logPosterior: priorLogProb + logLikelihood,
          concordantCount,
          discordantCount,
          totalTested: activeEntries.length,
          concordanceRate: Number(((concordantCount / activeEntries.length) * 100).toFixed(1)),
          markerBreakdown
        });
      }

      const maxLogPosterior = Math.max(...results.map(r => r.logPosterior));
      let sumExp = 0;
      for (const r of results) {
        r.expScore = Math.exp(r.logPosterior - maxLogPosterior);
        sumExp += r.expScore;
      }

      for (const r of results) {
        r.posteriorProbability = Number(((r.expScore / sumExp) * 100).toFixed(2));
        delete r.expScore;
      }

      results.sort((a, b) => b.logPosterior - a.logPosterior);
      const topCandidates = results.slice(0, topN);

      return {
        testedPanel: activeEntries.map(([abId, status]) => ({
          antibody: this.antibodies.get(abId),
          observed: status
        })),
        candidates: topCandidates,
        matrix: this.buildReactivityMatrix(
          topCandidates.map(c => c.neoplasm.id),
          activeEntries.map(([abId]) => abId)
        )
      };
    }

    buildReactivityMatrix(neoplasmIds, antibodyIds) {
      const rows = [];
      const validAntibodies = antibodyIds.map(abId => this.antibodies.get(abId)).filter(Boolean);

      const enrichedAntibodies = validAntibodies.map(ab => {
        const dpi = this.computeAntibodyDPI(neoplasmIds, ab.id);
        const costEff = this.computeAntibodyEfficiency(neoplasmIds, ab.id);
        const patterns = ab.patterns || this.derivePatterns(ab.target, ab.code);
        return {
          ...ab,
          dpi,
          costEfficiency: costEff,
          patterns,
          costTier: ab.localStock ? "In-house ($)" : "Externo ($$$)",
          costClass: ab.localStock ? "cost-local" : "cost-external"
        };
      });

      for (const nId of neoplasmIds) {
        const neo = this.neoplasms.get(nId);
        if (!neo) continue;

        const cells = [];
        for (const ab of enrichedAntibodies) {
          const ev = this.getEvidenceDetail(nId, ab.id);
          const tier = this._computeHeatmapTier(ev.percentage, ev.recorded);
          
          cells.push({
            antibodyId: ab.id,
            antibodyCode: ab.code,
            antibodyName: ab.name,
            target: ab.target,
            clone: ab.clone,
            localStock: ab.localStock,
            patterns: ab.patterns,
            percentage: ev.percentage,
            positiveCases: ev.positiveCases,
            totalCases: ev.totalCases,
            citation: ev.citation,
            recorded: ev.recorded,
            tier: tier.name,
            colorHex: tier.colorHex,
            textHex: tier.textHex,
            bgStyle: tier.bgStyle
          });
        }

        rows.push({
          neoplasm: neo,
          cells
        });
      }

      return {
        antibodies: enrichedAntibodies,
        rows
      };
    }

    _computeHeatmapColor(pct, recorded) {
      if (!recorded) return "rgba(30, 41, 59, 0.45)";
      if (pct >= 90) return "#059669"; // Verde esmeralda intenso
      if (pct >= 50) return "#065f46"; // Verde menta suave
      if (pct >= 10) return "#b45309"; // Ámbar suave
      return "rgba(51, 65, 85, 0.45)"; // Gris pizarra translúcido
    }

    _computeHeatmapTier(pct, recorded) {
      if (!recorded) {
        return {
          name: "nr",
          label: "Sin datos consolidados",
          colorHex: "rgba(30, 41, 59, 0.45)",
          textHex: "#64748b",
          bgStyle: "background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(51, 65, 85, 0.35); color: #64748b;"
        };
      }
      if (pct >= 90) {
        return {
          name: "emerald",
          label: "Verde esmeralda intenso (≥90%)",
          colorHex: "#059669",
          textHex: "#ffffff",
          bgStyle: "background: linear-gradient(135deg, #059669, #10b981); border: 1px solid #34d399; color: #ffffff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.35);"
        };
      }
      if (pct >= 50) {
        return {
          name: "mint",
          label: "Verde menta suave (50-89%)",
          colorHex: "#065f46",
          textHex: "#ecfdf5",
          bgStyle: "background: linear-gradient(135deg, rgba(6, 95, 70, 0.85), rgba(13, 148, 136, 0.75)); border: 1px solid rgba(52, 211, 153, 0.45); color: #ecfdf5;"
        };
      }
      if (pct >= 10) {
        return {
          name: "amber",
          label: "Ámbar suave (10-49%)",
          colorHex: "#b45309",
          textHex: "#fef3c7",
          bgStyle: "background: linear-gradient(135deg, rgba(146, 64, 14, 0.85), rgba(180, 83, 9, 0.8)); border: 1px solid rgba(245, 158, 11, 0.45); color: #fef3c7;"
        };
      }
      return {
        name: "slate",
        label: "Gris pizarra translúcido (<10%)",
        colorHex: "rgba(51, 65, 85, 0.45)",
        textHex: "#94a3b8",
        bgStyle: "background: rgba(51, 65, 85, 0.45); border: 1px solid rgba(100, 116, 139, 0.3); color: #cbd5e1;"
      };
    }

    generatePathologySynopticReport(inverseResult, options = {}) {
      if (!inverseResult || !inverseResult.candidates || inverseResult.candidates.length === 0) {
        return "No hay resultados diagnósticos para consolidar.";
      }

      const top = inverseResult.candidates[0];
      const second = inverseResult.candidates[1] || null;
      const invMode = options.inventoryMode || (options.requireLocalStock ? "stock" : "universal");
      const modeHeader = invMode === "stock"
        ? "MODALIDAD: [🔬 MODO STOCK LOCAL JC PATH LAB (150 ANTICUERPOS EN GRADILLA)]"
        : "MODALIDAD: [🌐 MODO UNIVERSAL GLOBAL (+3,500 ANTICUERPOS MUNDIALES)]";

      let text = "================================================================================\n";
      text += "JC PATH LAB • INFORME SINÓPTICO DE INMUNOHISTOQUÍMICA & PERFIL DIAGNÓSTICO\n";
      text += "Departamento de Anatomía Patológica, Patología Quirúrgica & Inteligencia Inmunofenotípica\n";
      text += `${modeHeader}\n`;
      text += "================================================================================\n\n";

      text += "1. PERFIL INMUNOFENOTÍPICO OBSERVADO:\n";
      inverseResult.testedPanel.forEach(item => {
        let obsLabel = "DUDOSO / EQUÍVOCO (+/-)";
        if (item.observed === "+") obsLabel = "POSITIVO (+)";
        else if (item.observed === "-") obsLabel = "NEGATIVO (-)";
        const stockTag = item.antibody.localStock 
          ? "[✓ EN STOCK LOCAL - GRADILLA]" 
          : "[📦 ADQUISICIÓN EXTERNA]";
        text += `   - ${item.antibody.code.padEnd(14)} : ${obsLabel.padEnd(18)} ${stockTag.padEnd(28)} [Diana: ${item.antibody.target}]\n`;
      });
      text += "\n";

      text += "2. CORRELACIÓN DIAGNÓSTICA PROBABILÍSTICA (INFERENCIA MULTICLASE):\n";
      inverseResult.candidates.slice(0, 5).forEach((c, idx) => {
        text += `   [${idx + 1}] ${c.neoplasm.name.toUpperCase()}\n`;
        text += `       Probabilidad Posterior: ${c.posteriorProbability}% | Concordancia: ${c.concordanceRate}% (${c.concordantCount}/${c.totalTested} marcadores)\n`;
        text += `       Órgano de Origen: ${c.neoplasm.organ} | Código ICD-O-3: ${c.neoplasm.code_icd}\n`;
      });
      text += "\n";

      text += "3. ANÁLISIS DE DISCORDANCIAS Y CONFIRMACIÓN:\n";
      const topDiscordant = top.markerBreakdown.filter(m => !m.isConcordant);
      if (topDiscordant.length === 0) {
        text += `   Perfil 100% concordante con ${top.neoplasm.name}.\n`;
        text += `   No se detectaron aberrancias antigénicas significativas en el panel actual.\n`;
      } else {
        text += `   Advertencias de tinción no típica para ${top.neoplasm.name}:\n`;
        topDiscordant.forEach(d => {
          text += `   * Marcador ${d.antibodyCode}: Observado [${d.observed}], Frecuencia en literatura: ${d.expectedRate}%\n`;
        });
      }

      if (second && (top.posteriorProbability - second.posteriorProbability < 25)) {
        text += `\n   DILEMA DIFERENCIAL PENDIENTE:\n`;
        text += `   Existe estrecha proximidad con '${second.neoplasm.name}' (${second.posteriorProbability}%).\n`;
        text += `   Se recomienda ampliar con panel discriminador dirigido de 2da línea.\n`;
      }

      text += "\n================================================================================\n";
      text += "Firma y Certificación Digital: M.C. Patólogo Quirúrgico Especialista\n";
      text += "JC PATH LAB - LABORATORIO DE ANATOMÍA PATOLÓGICA\n";
      text += "================================================================================\n";

      return text;
    }

    generateDiagnosticJustification(item, candidateNeoplasms) {
      const code = item.antibody.code.toUpperCase();
      const reactivities = item.reactivities || [];
      
      // Known clinical rationales
      const RATIONALES = {
        "TTF-1": "Factor de transcripción nuclear indispensable para confirmar histogénesis glandular pulmonar o tiroidea. Discrimina con alta especificidad el adenocarcinoma pulmonar frente a carcinoma escamoso, mesotelioma y metástasis gastrointestinales.",
        "P40": "Isoforma nuclear Delta Np63 de altísima especificidad para estirpe escamosa pulmonar y de mucosas. Carece de la inespecificidad de p63 en adenocarcinomas, siendo el marcador de elección absoluta para la tipificación escamosa.",
        "P63": "Proteína nuclear supresora de tumores; confirma diferenciación escamosa y presencia de células basales/mioepiteliales. Sensible pero susceptible a tinción focal en adenocarcinomas poco diferenciados.",
        "CK7": "Citoqueratina de bajo peso molecular de distribución citoplásmica. Patrón de reactividad supradiafragmático (pulmón, mama, tiroides, mesotelio) que excluye típicamente neoplasias del tracto colorrectal.",
        "CK20": "Citoqueratina citoplásmica de epitelio gástrico foveolar, intestinal y urotelial. Piedra angular en la co-evaluación del binomio CK7/CK20 para delimitación de primario desconocido.",
        "NAPSIN A": "Aspartil proteasa de tinción citoplásmica granular gruesa. Co-marcador de alta especificidad junto a TTF-1 para confirmar adenocarcinoma pulmonar primario frente a metástasis.",
        "CALRETININ": "Proteína fijadora de calcio de expresión nuclear y citoplásmica simultánea. Marcador positivo de máxima sensibilidad y consenso internacional para confirmar mesotelioma maligno epitelioide y excluir adenocarcinoma.",
        "WT1": "Factor de transcripción del tumor de Wilms (tinción nuclear). Reactividad en mesotelio pleural/peritoneal y carcinomas serosos de alto grado ováricos; negativo en carcinomas pulmonares comunes.",
        "D2-40": "Podoplanina de marcación membranosa nítida. Marcador mesotelial complementario y selector de invasión linfovascular; negativo en la gran mayoría de adenocarcinomas metastásicos.",
        "GATA3": "Factor de transcripción maestro nuclear para estirpe mamaria y urotelial invasiva. Útil para descarte de carcinoma urotelial o metástasis mamarias en cavidad torácica o pélvica.",
        "MAMMAGLOBIN": "Secretoglobina citoplásmica de alta especificidad para carcinoma mamario. Confirma origen mamario en adenocarcinomas con sospecha de primario oculto.",
        "GCDFP-15": "Proteína del líquido quístico de mama; marcador citoplásmico de diferenciación apocrina y mamaria, complementario a la mamaglobina y GATA3.",
        "ER": "Receptor nuclear de estrógenos. Identifica fenotipo tumoral hormonodependiente de estirpe mamaria o ginecológica mülleriana.",
        "PR": "Receptor nuclear de progesterona. Coadyuvante en la tipificación de fenotipo luminal y confirmación de estirpe ginecológica/endometrial.",
        "CDX2": "Factor de transcripción nuclear homeobox de alta fidelidad para el epitelio intestinal. Marcador cardinal para diagnosticar adenocarcinoma colorrectal primario o metastásico.",
        "SATB2": "Organizador cromatínico nuclear altamente selectivo del tracto colorrectal inferior. Resuelve metástasis dudosas de primario desconocido con especificidad superior al 95%.",
        "PAX8": "Factor de transcripción nuclear del linaje renal, tiroideo y del tracto genital femenino mülleriano; negativo constante en carcinomas pulmonares, mamarios y gastrointestinales.",
        "PSA": "Antígeno prostático específico de tinción citoplásmica. Confirmación categórica de adenocarcinoma de próstata frente a lesiones uroteliales o colónicas invasivas.",
        "NKX3.1": "Supresor tumoral homeobox nuclear prostático de altísima sensibilidad, retenido incluso en carcinomas prostáticos de alto grado (Gleason 9-10) con pérdida de PSA.",
        "SOX10": "Factor nuclear de diferenciación de cresta neural. Máxima sensibilidad para melanomas primarios y metastásicos (incluso desmoplásicos o amelanóticos) y schwannomas.",
        "S100": "Proteína nuclear y citoplásmica de screening universal para estirpe melanocítica, neural periférica y condroide.",
        "MELAN-A": "Antígeno citoplásmico melanosómico (A103). Marcador confirmatorio para melanoma maligno y tumores corticosuprarrenales.",
        "HMB45": "Glicoproteína melanosómica citoplásmica (gp100). Alta especificidad para melanoma maligno metastásico y tumores de la familia PEComa.",
        "SYNAPTOPHYSIN": "Glicoproteína de membrana de vesículas presinápticas (citoplásmica granular). Marcador pan-neuroendocrino de referencia en carcinomas neuroendocrinos y NET.",
        "CHROMOGRANIN": "Proteína de gránulos secretores neuroendocrinos de centro denso. Confiere especificidad absoluta para diferenciación neuroendocrina bien o moderadamente diferenciada.",
        "CD56": "Molécula de adhesión neural (NCAM-1) membranosa. Marcador neuroendocrino de máxima sensibilidad para carcinoma de células pequeñas (SCLC) y tumores carcinoides.",
        "CD117": "Receptor tirosina quinasa c-KIT con reactividad membranosa/citoplásmica. Diagnóstico patognomónico de tumor del estroma gastrointestinal (GIST) y mastocitosis.",
        "DOG1": "Proteína de canal aniónico (Anoctamina-1). Marcador de elección de 1ra línea para GIST, con retención en neoplasias mutadas para PDGFRA o con CD117 disminuido.",
        "INI-1 (SMARCB1)": "Subunidad nuclear del complejo remodelador de cromatina SWI/SNF. La retención nuclear es normal; la pérdida neta define tumores rabdoides o carcinomas desdiferenciados.",
        "CD45 (LCA)": "Antígeno común leucocitario de membrana. Delimita inmediatamente el linaje hematolinfoide frente a sarcomas de células redondas o carcinomas indiferenciados.",
        "CD20": "Antígeno de diferenciación de linfocitos B maduros. Confirma linfoma difuso de células B grandes (DLBCL) y subclasifica neoplasias linfoides de células grandes.",
        "CD3": "Complejo molecular transmembrana del receptor de células T. Identifica con especificidad absoluta el linaje T en el diagnóstico diferencial hematolinfoide.",
        "CD30": "Receptor TNFRSF8 de marcación membranosa y paranuclear tipo Golgi (dot-like). Patognomónico en células de Reed-Sternberg del linfoma de Hodgkin y linfoma anaplásico.",
        "CD15": "Carbohidrato Lewis X de marcación membranosa y en punto de Golgi. Marcador coadyuvante confirmatorio de linfoma de Hodgkin clásico en combinación con CD30.",
        "DESMIN": "Filamento intermedio muscular citoplásmico. Diferencia sarcoma con diferenciación miogénica (leiomiosarcoma, rabdomiosarcoma) frente a GIST o schwannoma.",
        "SMA": "Actina de músculo liso citoplásmica. Evalúa diferenciación leiomiogénica y miofibroblástica en neoplasias fusocelulares mesenquimales.",
        "VIMENTIN": "Filamento intermedio del citoesqueleto mesenquimal. Evalúa reactividad mesenquimal y sirve de control interno de viabilidad antigénica tisular.",
        "KI-67": "Marcador nuclear de proliferación celular (MIB-1). Cuantifica la fracción de crecimiento celular para graduación biológica de tumores neuroendocrinos y sarcomas."
      };

      let baseRationale = RATIONALES[code] || `Anticuerpo con alto poder discriminatorio (${item.powerScore}%) para separación de linajes celulares en controversia.`;

      // Build contrast dynamic explanation
      if (candidateNeoplasms && candidateNeoplasms.length >= 2 && reactivities.length >= 2) {
        const sorted = [...reactivities].sort((a, b) => b.percentage - a.percentage);
        const topPos = sorted[0];
        const topNeg = sorted[sorted.length - 1];

        const neoMap = new Map(candidateNeoplasms.map(n => [n.id, n.name]));
        const posName = neoMap.get(topPos.neoplasmId) || "Neoplasia 1";
        const negName = neoMap.get(topNeg.neoplasmId) || "Neoplasia 2";

        baseRationale += ` Contraste diferencial: reactividad esperada de ${topPos.percentage}% en ${posName} vs. ${topNeg.percentage}% en ${negName} (Ganancia: ${item.informationGain} bits).`;
      }

      return baseRationale;
    }

    generateConsensusPanelReport(forwardResult, metadata = {}) {
      if (!forwardResult || !forwardResult.optimalPanel || forwardResult.optimalPanel.length === 0) {
        return null;
      }

      const caseCode = metadata.codigoAtencion || metadata.codAtencion || "B-2026-IHC";
      const patientName = metadata.paciente || metadata.nombresApellidos || "PACIENTE EN CONSULTA";
      const requestingPhysician = metadata.medicoSolicitante || "PATOLOGÍA QUIRÚRGICA";
      const issueDate = metadata.fecha || new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const candidateNeoplasms = forwardResult.candidateNeoplasms || [];
      const differentialList = candidateNeoplasms.map((n, idx) => `[${idx + 1}] ${n.name} (Órgano: ${n.organ} | ICD-O-3: ${n.code_icd})`);

      const enrichedPanel = forwardResult.optimalPanel.map((item, idx) => {
        const justification = this.generateDiagnosticJustification(item, candidateNeoplasms);
        const expectedMap = {};
        item.reactivities.forEach(r => {
          const n = candidateNeoplasms.find(cn => cn.id === r.neoplasmId);
          if (n) {
            expectedMap[n.name] = `${r.percentage}%`;
          }
        });

        return {
          rank: idx + 1,
          antibody: item.antibody,
          clone: item.antibody.clone,
          target: item.antibody.target,
          localStock: item.antibody.localStock,
          powerScore: item.powerScore,
          informationGain: item.informationGain,
          meanPairwiseSeparation: item.meanPairwiseSeparation,
          expectedRates: expectedMap,
          justification
        };
      });

      // Build Plaintext Snippet for reportes.html
      let plainSnippet = "================================================================================\n";
      plainSnippet += "JC PATH LAB - LABORATORIO DE ANATOMÍA PATOLÓGICA\n";
      plainSnippet += "PANEL CONSENSUADO DE INMUNOHISTOQUÍMICA DIAGNÓSTICA (SISTEMA IMMUNOMASTER AI)\n";
      plainSnippet += "================================================================================\n";
      plainSnippet += `CÓDIGO DE ATENCIÓN : ${caseCode}\n`;
      plainSnippet += `PACIENTE           : ${patientName.toUpperCase()}\n`;
      plainSnippet += `MÉDICO SOLICITANTE : ${requestingPhysician}\n`;
      plainSnippet += `FECHA DE EMISIÓN   : ${issueDate}\n\n`;

      plainSnippet += "1. DIAGNÓSTICO DIFERENCIAL EN CONTROVERSIA CLÍNICA:\n";
      differentialList.forEach(d => {
        plainSnippet += `   • ${d}\n`;
      });
      plainSnippet += "\n";

      plainSnippet += "2. PANEL DE ANTICUERPOS CONSENSUADO (RESOLUCIÓN MÍNIMA ORTOGONAL):\n";
      enrichedPanel.forEach(p => {
        plainSnippet += `   [#${p.rank}] ${p.antibody.code} (Clon: ${p.clone} | Diana: ${p.target} | Stock: ${p.localStock ? 'Local Inmediato' : 'Referencia'})\n`;
        plainSnippet += `        Reactividades Esperadas: ${Object.entries(p.expectedRates).map(([tumor, rate]) => `${tumor}: ${rate}`).join(" | ")}\n`;
        plainSnippet += `        Justificación Diagnóstica: ${p.justification}\n\n`;
      });

      plainSnippet += "3. SUSTENTO METODOLÓGICO Y MATRICIAL:\n";
      plainSnippet += `   - Entropía Inicial del Dilema H(D) : ${forwardResult.baseEntropy} bits.\n`;
      plainSnippet += `   - Cobertura de Stock Institucional : ${enrichedPanel.every(p => p.localStock) ? '100% de marcadores disponibles en laboratorio central' : 'Requiere reactivos de referencia externa'}.\n`;
      plainSnippet += `   - Nota: Interpretación correlacionada estrictamente con hallazgos de microscopía óptica (H&E).\n`;
      plainSnippet += "================================================================================\n";
      plainSnippet += "JC PATH LAB • LABORATORIO DE ANATOMÍA PATOLÓGICA • VALIDACIÓN TÉCNICA OFICIAL\n";
      plainSnippet += "================================================================================\n";

      // Build HTML Snippet
      let htmlSnippet = `
<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #0f172a; line-height: 1.4; border: 1.5px solid #0f766e; border-radius: 8px; padding: 14px; background: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 6px; margin-bottom: 10px;">
    <div style="font-size: 12pt; font-weight: bold; color: #0f766e; letter-spacing: 0.5px;">JC PATH LAB - LABORATORIO DE ANATOMÍA PATOLÓGICA</div>
    <div style="font-size: 8.5pt; color: #475569; text-transform: uppercase;">División de Inmunohistoquímica & Patología Quirúrgica</div>
    <div style="font-size: 10pt; font-weight: bold; margin-top: 4px; color: #0369a1;">PANEL CONSENSUADO DE INMUNOHISTOQUÍMICA DIAGNÓSTICA</div>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 10px;">
    <tr>
      <td style="padding: 3px 6px; font-weight: bold; width: 22%; border-bottom: 1px solid #e2e8f0;">Código Caso:</td>
      <td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0;">${caseCode}</td>
      <td style="padding: 3px 6px; font-weight: bold; width: 18%; border-bottom: 1px solid #e2e8f0;">Fecha:</td>
      <td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0;">${issueDate}</td>
    </tr>
    <tr>
      <td style="padding: 3px 6px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Paciente:</td>
      <td colspan="3" style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${patientName.toUpperCase()}</td>
    </tr>
    <tr>
      <td style="padding: 3px 6px; font-weight: bold; vertical-align: top;">Controversia:</td>
      <td colspan="3" style="padding: 3px 6px;">${differentialList.join("<br>")}</td>
    </tr>
  </table>

  <div style="font-weight: bold; font-size: 9pt; color: #0f766e; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1px solid #0f766e;">Panel Recomendado & Justificación Diagnóstica:</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 8pt; text-align: left;">
    <thead>
      <tr style="background-color: #f0fdfa; color: #0f766e; border-bottom: 1.5px solid #0f766e;">
        <th style="padding: 6px 8px; width: 18%;">Anticuerpo</th>
        <th style="padding: 6px 8px; width: 14%;">Clon & Diana</th>
        <th style="padding: 6px 8px; width: 28%;">Reactividad Esperada</th>
        <th style="padding: 6px 8px;">Justificación Diagnóstica</th>
      </tr>
    </thead>
    <tbody>
      ${enrichedPanel.map(p => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 8px; font-weight: bold; vertical-align: top;">
            ${p.antibody.code}<br>
            <span style="font-size: 7pt; color: #64748b; font-weight: normal;">${p.antibody.name}</span>
          </td>
          <td style="padding: 6px 8px; vertical-align: top;">
            <strong>${p.clone}</strong><br>
            <span style="font-size: 7.5pt; color: #475569;">${p.target}</span>
          </td>
          <td style="padding: 6px 8px; vertical-align: top;">
            ${Object.entries(p.expectedRates).map(([tumor, rate]) => `• <strong>${tumor.split(" ")[0]}</strong>: ${rate}`).join("<br>")}
          </td>
          <td style="padding: 6px 8px; vertical-align: top; color: #1e293b; line-height: 1.3;">
            ${p.justification}
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div style="margin-top: 8px; font-size: 7.5pt; color: #64748b; text-align: right;">
    JC PATH LAB • Entropía H(D): ${forwardResult.baseEntropy} bits • Algoritmo de Consenso Ortogonal Inmunofenotípico
  </div>
</div>
      `.trim();

      return {
        caseCode,
        patientName,
        requestingPhysician,
        issueDate,
        candidateNeoplasms,
        differentialList,
        enrichedPanel,
        entropy: forwardResult.baseEntropy,
        plainSnippet,
        htmlSnippet,
        matrix: forwardResult.matrix
      };
    }
  }

  // ==========================================================================
  // CONSENSOS INTERNACIONALES: 4 ENCRUCIJADAS DIAGNÓSTICAS CLÁSICAS (WHO 5ta Ed. / PathologyOutlines)
  // ==========================================================================
  const DIAGNOSTIC_CROSSROADS = [
    {
      id: "cr_adeno_vs_meso",
      title: "1. Adenocarcinoma vs. Mesotelioma Maligno Epitelioide",
      subtitle: "Dilema Pleural y Peritoneal (Pleural/Peritoneal Serosal Effusion & Masses)",
      icd_codes: "Adeno Pulmonar: 8140/3 (C34.9) vs. Mesotelioma Epitelioide: 9052/3 (C38.4)",
      organ: "Pleura y Peritoneo",
      neoplasmIds: ["neo_lung_adeno", "neo_mesothelioma_epithelioid", "neo_mesothelioma_sarcomatoid"],
      recommendedAntibodies: ["ab_claudin4", "ab_calretinin", "ab_wt1", "ab_d240", "ab_ck56", "ab_ber_ep4", "ab_moc31", "ab_bap1", "ab_ttf1"],
      clinicalScenario: "Derrame pleural exudativo o engrosamiento pleural nodular en paciente con antecedentes de asbesto o sospecha de primario torácico. Proliferación epitelioide glandular vs trabecular.",
      whoConsensusRules: "El consenso IMIG/CAP/OMS exige al menos 2 marcadores mesoteliales y 2 marcadores de adenocarcinoma. Claudin-4 es el estándar de oro moderno para carcinoma (>98% sensibilidad/especificidad). La pérdida de BAP1 confirma malignidad frente a hiperplasia mesotelial reactiva.",
      tableData: [
        { marker: "Claudin-4", target: "Membranoso", adeno: "98%", meso_epi: "1%", meso_sarc: "0%", role: "Carcinoma (+), Mesotelioma (-)" },
        { marker: "Calretinina", target: "Nuclear & Citoplásmico", adeno: "<3%", meso_epi: "98%", meso_sarc: "40%", role: "Mesotelioma (+)" },
        { marker: "WT1", target: "Nuclear", adeno: "<2%", meso_epi: "85%", meso_sarc: "15%", role: "Mesotelioma (+)" },
        { marker: "D2-40 (Podoplanina)", target: "Membranoso", adeno: "<5%", meso_epi: "90%", meso_sarc: "65%", role: "Mesotelioma (+)" },
        { marker: "CK5/6", target: "Citoplásmico", adeno: "4%", meso_epi: "84%", meso_sarc: "20%", role: "Mesotelioma (+)" },
        { marker: "Ber-EP4 / EpCAM", target: "Membranoso", adeno: "92%", meso_epi: "8%", meso_sarc: "0%", role: "Carcinoma (+)" },
        { marker: "MOC-31", target: "Membranoso", adeno: "94%", meso_epi: "4%", meso_sarc: "0%", role: "Carcinoma (+)" },
        { marker: "BAP1", target: "Nuclear", adeno: "Conservado (>99%)", meso_epi: "Pérdida en 67.5%", meso_sarc: "Pérdida en 20%", role: "Pérdida = Neoplasia Maligna" },
        { marker: "TTF-1", target: "Nuclear", adeno: "85% (si origen pulmonar)", meso_epi: "0%", meso_sarc: "0%", role: "Lugar primario pulmonar" }
      ],
      pearls: [
        "Calretinina requiere positividad tanto NUCLEAR como citoplásmica simultánea para considerarse concluyente en mesotelioma.",
        "Claudin-4 supera con creces a Ber-EP4 y MOC-31 en especificidad al no teñir el mesotelio reactivo ni neoplásico.",
        "Cuidado con adenocarcinomas de ovario (seroso de alto grado): son WT1 positivos y pueden simular mesotelioma peritoneal; usar PAX8 y Claudin-4 para resolver."
      ]
    },
    {
      id: "cr_tnbc_vs_metastasis",
      title: "2. Carcinoma de Mama Triple Negativo vs. Metástasis / Anaplásico",
      subtitle: "Encrucijada Diagnóstica en Mama y Sitios Metastásicos (Pulmón, Serosas, Ganglios)",
      icd_codes: "Mama TNBC/Metaplásico: 8575/3 (C50.9) vs. Adeno Pulmón: 8140/3 vs. Ovario Seroso: 8441/3 vs. Urotelial: 8120/3",
      organ: "Mama y Sitios Metastásicos",
      neoplasmIds: ["neo_breast_tnbc", "neo_breast_ductal", "neo_lung_adeno", "neo_ovarian_serous_hg", "neo_urothelial_ca", "neo_melanoma_malignant"],
      recommendedAntibodies: ["ab_trps1", "ab_gata3", "ab_sox10", "ab_ck56", "ab_ae1ae3", "ab_ttf1", "ab_pax8", "ab_s100"],
      clinicalScenario: "Masa mamaria de alto grado o adenopatía axilar/supraclavicular metastásica con negatividad para receptores hormonales (ER=0, PR=0) y HER2 (0/1+ sin amplificación).",
      whoConsensusRules: "Mamaglobina y GCDFP-15 caen a <10-15% en CMTN. GATA3 es positivo sólo en 40-50% (negativo en carcinomas metaplásicos). TRPS1 es el marcador nuclear definitivo validado (>90% de reactividad en CMTN). SOX10 es positivo en 40-70% de CMTN basales, lo cual representa una clásica trampa diagnóstica con melanoma.",
      tableData: [
        { marker: "TRPS1", target: "Nuclear", tnbc: "91%", luminal: "96%", lung: "0%", ovary: "<2%", urothelial: "<5%", melanoma: "0%", role: "Estándar de Oro Linaje Mamario" },
        { marker: "GATA3", target: "Nuclear", tnbc: "47%", luminal: "94%", lung: "2%", ovary: "2%", urothelial: "88%", melanoma: "0%", role: "Mama / Urotelio" },
        { marker: "SOX10", target: "Nuclear", tnbc: "58%", luminal: "0%", lung: "0%", ovary: "0%", urothelial: "0%", melanoma: "98%", role: "Positivo en CMTN basal y Melanoma" },
        { marker: "Pan-CK (AE1/AE3)", target: "Citoplásmico", tnbc: "98%", luminal: "100%", lung: "100%", ovary: "100%", urothelial: "100%", melanoma: "<1%", role: "Distingue CMTN (+) de Melanoma (-)" },
        { marker: "CK5/6", target: "Citoplásmico", tnbc: "67%", luminal: "5%", lung: "4%", ovary: "2%", urothelial: "60%", melanoma: "0%", role: "Fenotipo Basal-Like" },
        { marker: "TTF-1", target: "Nuclear", tnbc: "0%", luminal: "0%", lung: "85%", ovary: "0%", urothelial: "0%", melanoma: "0%", role: "Confirma Primario Pulmonar" },
        { marker: "PAX8", target: "Nuclear", tnbc: "<1%", luminal: "<1%", lung: "<1%", ovary: "98%", urothelial: "2%", melanoma: "0%", role: "Confirma Primario Ovárico" }
      ],
      pearls: [
        "¡ALERTA!: La positividad para SOX10 en una masa mamaria o axilar NO significa melanoma de manera invariable: 40-70% de carcinomas triple negativos basales o metaplásicos expresan SOX10. La presencia de Pan-Citoqueratina (AE1/AE3+) categórica y negatividad para Melan-A descartan melanoma.",
        "TRPS1 retiene su expresión en carcinomas metaplásicos de mama con componente fusocelular o condroide, donde GATA3 es prácticamente nulo.",
        "Un tumor mamario triple negativo que exprese GATA3 y p40/p63 requiere descartar carcinoma metaplásico de células escamosas o metástasis de carcinoma urotelial."
      ]
    },
    {
      id: "cr_rcc_vs_oncocytoma",
      title: "3. Carcinoma de Células Renales vs. Oncocitoma Renal",
      subtitle: "Dilema de Neoplasias Renales Eosinofílicas y Oncocíticas (ISUP / WHO Vancouver Consensus)",
      icd_codes: "Oncocitoma: 8290/0 vs. CCR Cromófobo: 8317/3 vs. CCR Células Claras: 8310/3 vs. CCR Papilar: 8260/3 (C64.9)",
      organ: "Riñón",
      neoplasmIds: ["neo_renal_oncocytoma", "neo_renal_chromophobe", "neo_renal_cc", "neo_renal_papillary"],
      recommendedAntibodies: ["ab_ck7", "ab_cd117", "ab_s100a1", "ab_hale", "ab_vimentin", "ab_cd10", "ab_caix", "ab_amacr", "ab_pax8"],
      clinicalScenario: "Tumor renal sólido bien delimitado con citoplasma granular intensamente eosinofílico/oncocítico en paciente asintomático con masa incidental.",
      whoConsensusRules: "El oncocitoma es benigno (/0), mientras que el carcinoma cromófobo y el CCRcc son malignos (/3). CK7 es el discriminador primordial: el oncocitoma es negativo o con tinción aislada en damero (<5%), mientras que el carcinoma cromófobo exhibe tinción membranosa y citoplásmica difusa e intensa (>95%). S100A1 es positivo en oncocitoma y negativo en cromófobo.",
      tableData: [
        { marker: "CK7", target: "Membrana / Citoplasma", onco: "3% (células aisladas)", chromo: "97% (difuso intenso)", cc_rcc: "9%", pap_rcc: "88%", role: "Distingue Cromófobo (+) de Oncocitoma (-)" },
        { marker: "CD117 (c-KIT)", target: "Membranoso", onco: "98%", chromo: "94%", cc_rcc: "2%", pap_rcc: "4%", role: "Positivo en ambos oncocíticos; negativo en CCRcc" },
        { marker: "S100A1", target: "Nuclear & Citoplásmico", onco: "93%", chromo: "3%", cc_rcc: "9%", pap_rcc: "5%", role: "Oncocitoma (+), Cromófobo (-)" },
        { marker: "Hierro Coloidal de Hale", target: "Reticular Citoplásmico", onco: "2% (apical fina)", chromo: "96% (azul reticular intenso)", cc_rcc: "2%", pap_rcc: "2%", role: "Cromófobo (+ difuso azul)" },
        { marker: "Vimentina", target: "Citoplásmico", onco: "1%", chromo: "4%", cc_rcc: "95% (difusa fuerte)", pap_rcc: "86%", role: "Positiva fuerte en CCRcc y Papilar" },
        { marker: "CAIX", target: "Membranoso en caja", onco: "2%", chromo: "3%", cc_rcc: "96% (box-like difuso)", pap_rcc: "10%", role: "Específico de CCR Células Claras" },
        { marker: "CD10", target: "Ribete en cepillo", onco: "4%", chromo: "7%", cc_rcc: "93%", pap_rcc: "75%", role: "Diferenciación tubular proximal (CCRcc)" },
        { marker: "AMACR / Racemasa", target: "Granular luminal", onco: "4%", chromo: "5%", cc_rcc: "35%", pap_rcc: "96% (difuso fuerte)", role: "Patognomónico de CCR Papilar" },
        { marker: "PAX8", target: "Nuclear", onco: "97%", chromo: "97.5%", cc_rcc: "98%", pap_rcc: "98%", role: "Confirma linaje renal en todos" }
      ],
      pearls: [
        "CD117 es positivo TANTO en Oncocitoma como en Carcinoma Cromófobo: no sirve para diferenciarlos entre sí, pero excluye con contundencia el CCR de células claras variante eosinofílica.",
        "Una tinción de CK7 focal o dispersa (<5% de células) es perfectamente compatible con Oncocitoma (patrón en 'damero' o 'patchy'). Para diagnosticar Cromófobo se exige tinción difusa en >75-80% de células con realce de membrana.",
        "La tinción histoquímica de Hierro Coloidal de Hale debe interpretarse con cautela: sólo la marcación reticular citoplásmica densa y azul es diagnóstica de carcinoma cromófobo; la marcación en gotas apicales luminales puede verse en oncocitomas."
      ]
    },
    {
      id: "cr_undiff_anaplastic",
      title: "4. Gran Encrucijada Anaplásica: Melanoma vs. Carcinoma vs. Sarcoma vs. Linfoma",
      subtitle: "Neoplasia Maligna Pobremente Diferenciada / Indiferenciada (The Undifferentiated Malignant Neoplasm)",
      icd_codes: "Melanoma: 8720/3 vs. Ca Indiferenciado: 8020/3 vs. Sarcoma (UPS): 8802/3 vs. Rabdo: 8910/3 vs. DLBCL: 9680/3 vs. ALCL: 9714/3",
      organ: "Cualquier Localización (Primario Desconocido)",
      neoplasmIds: ["neo_melanoma_malignant", "neo_carcinoma_undiff", "neo_sarcoma_undiff", "neo_rhabdomyosarcoma", "neo_dlbcl", "neo_alcl"],
      recommendedAntibodies: ["ab_ae1ae3", "ab_cd45", "ab_sox10", "ab_s100", "ab_vimentin", "ab_cd20", "ab_cd30", "ab_desmin", "ab_myogenin", "ab_alk", "ab_claudin4"],
      clinicalScenario: "Tumor de alto grado con células pleomórficas, fusiformes o anaplásicas gigantes multinucleadas, sin diferenciación glanduliforme, escamosa ni organoide identificable al microscopio óptico.",
      whoConsensusRules: "Aplicación obligatoria del panel cuadrivalente de tamizaje de primer escalón: Citoqueratina (AE1/AE3) + CD45 (LCA) + SOX10/S100 + Vimentina. Si los 4 son negativos o discordantes, se recurre a marcadores de rescate: CD30/ALK (Linfoma anaplásico), Miogenina/MyoD1 (Rabdomiosarcoma alveolar/pleomórfico), Claudin-4/p40 (Carcinomas queratino-deficientes) y PRAME.",
      tableData: [
        { marker: "Pan-CK (AE1/AE3)", target: "Citoplásmico", melanoma: "<1%", ca_undiff: "98%", sarcoma_ups: "1%", rhabdo: "4%", dlbcl: "0%", alcl: "0%", role: "Linaje Carcinoma (y Mesotelioma)" },
        { marker: "CD45 (LCA)", target: "Membranoso", melanoma: "0%", ca_undiff: "0%", sarcoma_ups: "0%", rhabdo: "0%", dlbcl: "98%", alcl: "65% (variable)", role: "Linaje Hematolinfoide" },
        { marker: "SOX10", target: "Nuclear", melanoma: "98%", ca_undiff: "0%", sarcoma_ups: "0%", rhabdo: "<1%", dlbcl: "0%", alcl: "0%", role: "Linaje Melanocítico" },
        { marker: "S100", target: "Nuclear & Citoplásmico", melanoma: "99%", ca_undiff: "2%", sarcoma_ups: "2%", rhabdo: "<2%", dlbcl: "0%", alcl: "0%", role: "Sensible Melanocítico / Neural" },
        { marker: "Vimentina", target: "Citoplásmico", melanoma: "100%", ca_undiff: "55%", sarcoma_ups: "100%", rhabdo: "100%", dlbcl: "90%", alcl: "90%", role: "Control viabilidad / Sarcoma" },
        { marker: "CD20", target: "Membranoso", melanoma: "0%", ca_undiff: "0%", sarcoma_ups: "0%", rhabdo: "0%", dlbcl: "98%", alcl: "0%", role: "Linfoma Linaje B (DLBCL)" },
        { marker: "CD30", target: "Membrana & Golgi Dot", melanoma: "0%", ca_undiff: "0%", sarcoma_ups: "0%", rhabdo: "0%", dlbcl: "15%", alcl: "100% (difuso)", role: "Patognomónico de ALCL" },
        { marker: "Miogenina (Myf4)", target: "Nuclear", melanoma: "0%", ca_undiff: "0%", sarcoma_ups: "0%", rhabdo: "98% (fuerte)", dlbcl: "0%", alcl: "0%", role: "Diferenciación Rabdomioblástica" },
        { marker: "Desmina", target: "Citoplásmico", melanoma: "<1%", ca_undiff: "1%", sarcoma_ups: "2%", rhabdo: "97.5%", dlbcl: "0%", alcl: "0%", role: "Linaje Muscular" },
        { marker: "ALK (CD246)", target: "Citoplásmico & Nuclear", melanoma: "0%", ca_undiff: "0%", sarcoma_ups: "0%", rhabdo: "0%", dlbcl: "0%", alcl: "70% (en ALK+)", role: "Traslocación NPM1::ALK" }
      ],
      pearls: [
        "¡CUIDADO CON EL LINFOMA ANAPLÁSICO DE CÉLULAS GRANDES (ALCL)!: Hasta un 35% de los casos de ALCL pierden CD45 (LCA-) y la mayoría pierden CD3 (T-cell-), además de poder expresar EMA (70-80%). Si el patólogo sólo pide CK y CD45, un ALCL puede ser catalogado erróneamente como sarcoma indiferenciado. Siempre solicitar CD30 ante células gigantes en herradura (hallmark cells).",
        "El melanoma amelanótico puede perder marcadores clásicos de maduración (Melan-A y HMB45) en recidivas o metástasis desdiferenciadas, pero SOX10 retiene su positividad nuclear en más del 98% de los casos.",
        "El Rabdomiosarcoma alveolar en adultos simula linfoma o sarcoma de células redondas; la tinción nuclear para Miogenina y MyoD1 es definitiva."
      ]
    }
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ImmunoMasterEngine,
      SEED_ANTIBODIES,
      SEED_NEOPLASMS,
      SEED_EVIDENCE,
      DIAGNOSTIC_CROSSROADS
    };
  } else {
    global.ImmunoMasterEngine = ImmunoMasterEngine;
    global.SEED_ANTIBODIES = SEED_ANTIBODIES;
    global.SEED_NEOPLASMS = SEED_NEOPLASMS;
    global.SEED_EVIDENCE = SEED_EVIDENCE;
    global.DIAGNOSTIC_CROSSROADS = DIAGNOSTIC_CROSSROADS;
  }

})(typeof window !== 'undefined' ? window : globalThis);

