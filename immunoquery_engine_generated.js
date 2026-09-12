/**
 * ==============================================================================
 * IMMUNOQUERY CORE SEARCH ENGINE & DYNAMIC PANEL BUILDER (0/5)
 * JC PATH LAB • Dr. Joseph Castillo • Plataforma 2026
 *
 * Características:
 * 1. Base de datos completa con 184 anticuerpos reales y 52 diagnósticos OMS 5ta Ed.
 * 2. Motor de búsqueda interactivo en tiempo real con soporte bilingüe (EN/ES) y matching flexible.
 * 3. Selector interactivo (0/5) con chips modernos y botón (x) para remover.
 * 4. Botón azul 'Build Panel >' y botón 'Clear'.
 * 5. Generación algorítmica de matriz comparativa diferencial IHC con cálculo de varianza informativa.
 * 6. Conexión directa a WhatsApp con pedido preconfigurado y cero errores de consola.
 * ==============================================================================
 */

(function(window, document) {
    'use strict';

    // 1. BASE DE DATOS COMPLETA DE DIAGNÓSTICOS Y ANTICUERPOS
    var IQ_ANTIBODIES = [
    {
        "id": "ab-ck7",
        "code": "CK7",
        "name_en": "Cytokeratin 7 (CK7)",
        "name_es": "Citoqueratina 7 (CK7)",
        "meta_en": "Cytoplasmic • Lung, Breast, Ovary, Upper GI, Urothelium • Stock In-House",
        "meta_es": "Citoplasmático • Pulmón, Mama, Ovario, GI Superior, Urotelio • Stock In-House",
        "category": "Citoqueratinas / Epitelial",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "ck7",
            "cytokeratin 7",
            "citoqueratina 7",
            "queratina 7",
            "ck-7",
            "pulmon",
            "mama"
        ]
    },
    {
        "id": "ab-ck20",
        "code": "CK20",
        "name_en": "Cytokeratin 20 (CK20)",
        "name_es": "Citoqueratina 20 (CK20)",
        "meta_en": "Cytoplasmic • Colorectal, Merkel, Gastric, Umbrella Cells • Stock In-House",
        "meta_es": "Citoplasmático • Colorrectal, Merkel, Gástrico, Células Paraguas • Stock In-House",
        "category": "Citoqueratinas / Epitelial",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "ck20",
            "cytokeratin 20",
            "citoqueratina 20",
            "queratina 20",
            "ck-20",
            "colon",
            "colorrectal"
        ]
    },
    {
        "id": "ab-ttf-1",
        "code": "TTF-1",
        "name_en": "TTF-1 (Thyroid Transcription Factor-1)",
        "name_es": "TTF-1 (Factor de Transcripción Tiroideo-1)",
        "meta_en": "Nuclear • Lung Adenocarcinoma, Small Cell, Thyroid • Stock In-House",
        "meta_es": "Nuclear • Adenocarcinoma Pulmonar, Células Pequeñas, Tiroides • Stock In-House",
        "category": "Pulmón & Tiroides",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "ttf1",
            "ttf-1",
            "thyroid transcription factor",
            "factor tiroideo",
            "pulmon",
            "lung"
        ]
    },
    {
        "id": "ab-p40",
        "code": "p40",
        "name_en": "p40 (ΔNp63)",
        "name_es": "p40 (ΔNp63)",
        "meta_en": "Nuclear • Highly specific for Squamous Cell Carcinoma (>98%) • Stock In-House",
        "meta_es": "Nuclear • Alta especificidad carcinoma escamoso (>98%) • Stock In-House",
        "category": "Carcinomas Escamosos",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "p40",
            "deltanp63",
            "escamoso",
            "squamous",
            "pulmon escamoso"
        ]
    },
    {
        "id": "ab-p63",
        "code": "p63",
        "name_en": "p63 (Tumor Protein 63)",
        "name_es": "p63 (Proteína Tumoral 63)",
        "meta_en": "Nuclear • Prostate basal cells, Squamous & Urothelial marker • Stock In-House",
        "meta_es": "Nuclear • Células basales prostáticas, urotelial y escamoso • Stock In-House",
        "category": "Células Basales & Escamoso",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "p63",
            "tp63",
            "basal",
            "prostata",
            "urotelial"
        ]
    },
    {
        "id": "ab-gata3",
        "code": "GATA3",
        "name_en": "GATA3 (GATA Binding Protein 3)",
        "name_es": "GATA3 (Proteína de Unión GATA-3)",
        "meta_en": "Nuclear • Breast Carcinoma & Urothelial Carcinoma • Stock In-House",
        "meta_es": "Nuclear • Carcinoma de Mama y Carcinoma Urotelial • Stock In-House",
        "category": "Mama & Uropatología",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "gata3",
            "gata-3",
            "mama",
            "breast",
            "urotelial",
            "vejiga"
        ]
    },
    {
        "id": "ab-cdx2",
        "code": "CDX2",
        "name_en": "CDX2 (Caudal Type Homeobox 2)",
        "name_es": "CDX2 (Homeobox Tipo Caudal 2)",
        "meta_en": "Nuclear • Colorectal & Intestinal Adenocarcinoma • Stock In-House",
        "meta_es": "Nuclear • Adenocarcinoma Colorrectal e Intestinal • Stock In-House",
        "category": "Gastrointestinal",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "cdx2",
            "cdx-2",
            "colon",
            "colorrectal",
            "intestinal",
            "recto"
        ]
    },
    {
        "id": "ab-claudin-4",
        "code": "Claudin-4",
        "name_en": "Claudin-4",
        "name_es": "Claudina-4",
        "meta_en": "Membranous • >98% in Carcinomas vs <1% in Mesothelioma • Stock In-House",
        "meta_es": "Membranoso • >98% en Carcinomas vs <1% en Mesotelioma • Stock In-House",
        "category": "Epitelial vs Mesotelial",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "claudin-4",
            "claudina 4",
            "claudina-4",
            "claudin4",
            "mesotelioma",
            "pleura"
        ]
    },
    {
        "id": "ab-moc-31",
        "code": "MOC-31",
        "name_en": "MOC-31 (EpCAM)",
        "name_es": "MOC-31 (EpCAM)",
        "meta_en": "Membranous • Adenocarcinoma discriminator vs Mesothelioma • Stock In-House",
        "meta_es": "Membranoso • Discriminador de adenocarcinoma vs mesotelioma • Stock In-House",
        "category": "Epitelial vs Mesotelial",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "moc-31",
            "moc31",
            "epcam",
            "mesotelioma"
        ]
    },
    {
        "id": "ab-wt1",
        "code": "WT1",
        "name_en": "WT1 (Wilms Tumor 1)",
        "name_es": "WT1 (Tumor de Wilms 1)",
        "meta_en": "Nuclear • Epithelioid Mesothelioma & Serous Ovarian Carcinoma • Stock In-House",
        "meta_es": "Nuclear • Mesotelioma Epitelioide y Carcinoma Seroso Ovárico • Stock In-House",
        "category": "Mesotelial & Ovario",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "wt1",
            "wt-1",
            "wilms",
            "mesotelioma",
            "ovario",
            "seroso"
        ]
    },
    {
        "id": "ab-calretinin",
        "code": "Calretinin",
        "name_en": "Calretinin (Calretinina)",
        "name_es": "Calretinina",
        "meta_en": "Nuclear & Cytoplasmic • Gold standard for Epithelioid Mesothelioma • Stock In-House",
        "meta_es": "Nuclear y Citoplásmico • Estándar de oro para Mesotelioma Epitelioide • Stock In-House",
        "category": "Mesotelial",
        "target": "Nuclear & Cytoplasmic",
        "inStock": true,
        "aliases": [
            "calretinin",
            "calretinina",
            "mesotelioma",
            "pleura",
            "peritoneo"
        ]
    },
    {
        "id": "ab-mesothelin",
        "code": "Mesothelin",
        "name_en": "Mesothelin",
        "name_es": "Mesotelina",
        "meta_en": "Membranous • Epithelioid Mesothelioma, Ovarian & Pancreatic • Stock In-House",
        "meta_es": "Membranoso • Mesotelioma Epitelioide, Ovario y Páncreas • Stock In-House",
        "category": "Mesotelial & Ovario",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "mesothelin",
            "mesotelina",
            "mesotelioma"
        ]
    },
    {
        "id": "ab-mammaglobin",
        "code": "Mammaglobin",
        "name_en": "Mammaglobin A",
        "name_es": "Mamaglobina A",
        "meta_en": "Cytoplasmic • Breast Carcinoma specific marker • Stock In-House",
        "meta_es": "Citoplásmico • Marcador específico de Carcinoma de Mama • Stock In-House",
        "category": "Mama & Gineco",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "mammaglobin",
            "mamaglobina",
            "mama",
            "breast"
        ]
    },
    {
        "id": "ab-gcdfp-15",
        "code": "GCDFP-15",
        "name_en": "GCDFP-15 (BRST-2)",
        "name_es": "GCDFP-15 (BRST-2)",
        "meta_en": "Cytoplasmic • Breast & Apocrine differentiation • Stock In-House",
        "meta_es": "Citoplásmico • Diferenciación mamaria y apocrina • Stock In-House",
        "category": "Mama & Gineco",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "gcdfp-15",
            "gcdfp15",
            "brst-2",
            "mama",
            "apocrino"
        ]
    },
    {
        "id": "ab-er",
        "code": "ER",
        "name_en": "Estrogen Receptor (ER / RE)",
        "name_es": "Receptor de Estrógenos (RE / ER)",
        "meta_en": "Nuclear • Breast Carcinoma, Gynecologic, Endometrioid • Stock In-House",
        "meta_es": "Nuclear • Carcinoma de Mama, Ginecológico, Endometrioide • Stock In-House",
        "category": "Mama & Gineco",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "er",
            "estrogen",
            "estrogeno",
            "re",
            "receptor de estrogeno",
            "mama"
        ]
    },
    {
        "id": "ab-pr",
        "code": "PR",
        "name_en": "Progesterone Receptor (PR / RP)",
        "name_es": "Receptor de Progesterona (RP / PR)",
        "meta_en": "Nuclear • Breast Carcinoma & Endometrial Carcinoma • Stock In-House",
        "meta_es": "Nuclear • Carcinoma de Mama y Carcinoma Endometrial • Stock In-House",
        "category": "Mama & Gineco",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "pr",
            "progesterone",
            "progesterona",
            "rp",
            "receptor de progesterona",
            "mama"
        ]
    },
    {
        "id": "ab-her2",
        "code": "HER2",
        "name_en": "HER2 / neu (c-erbB2)",
        "name_es": "HER2 / neu (c-erbB2)",
        "meta_en": "Membranous • Breast & Gastric Carcinoma targeted therapy scoring • Stock In-House",
        "meta_es": "Membranoso • Puntuación pronóstica en Cáncer de Mama y Gástrico • Stock In-House",
        "category": "Oncología Molecular",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "her2",
            "her2/neu",
            "cerbb2",
            "c-erbb2",
            "mama",
            "gastrico"
        ]
    },
    {
        "id": "ab-ki-67",
        "code": "Ki-67",
        "name_en": "Ki-67 (MIB-1 Proliferation Index)",
        "name_es": "Ki-67 (Índice Proliferativo MIB-1)",
        "meta_en": "Nuclear • Proliferation Index in Breast, Neuroendocrine & Lymphomas • Stock In-House",
        "meta_es": "Nuclear • Índice proliferativo en mama, neuroendocrino y linfomas • Stock In-House",
        "category": "Proliferación Celular",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "ki67",
            "ki-67",
            "mib-1",
            "proliferacion",
            "mitosis"
        ]
    },
    {
        "id": "ab-psa",
        "code": "PSA",
        "name_en": "PSA (Prostate Specific Antigen)",
        "name_es": "PSA (Antígeno Prostático Específico)",
        "meta_en": "Cytoplasmic • Prostate tissue & adenocarcinoma diagnostic marker • Stock In-House",
        "meta_es": "Citoplásmico • Tejido prostático y adenocarcinoma • Stock In-House",
        "category": "Próstata & Uropatología",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "psa",
            "prostate",
            "prostata",
            "antigeno prostatico"
        ]
    },
    {
        "id": "ab-psma",
        "code": "PSMA",
        "name_en": "PSMA (Prostate Specific Membrane Antigen)",
        "name_es": "PSMA (Antígeno de Membrana Prostático)",
        "meta_en": "Membranous • High specificity in Advanced & Metastatic Prostate CA • Stock In-House",
        "meta_es": "Membranoso • Alta especificidad en cáncer prostático y metástasis • Stock In-House",
        "category": "Próstata & Uropatología",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "psma",
            "prostata",
            "prostate membrane"
        ]
    },
    {
        "id": "ab-sinaptofisina",
        "code": "Sinaptofisina",
        "name_en": "Synaptophysin (Sinaptofisina)",
        "name_es": "Sinaptofisina",
        "meta_en": "Cytoplasmic granular • Neuroendocrine neoplasms & Small Cell Carcinomas • Stock In-House",
        "meta_es": "Citoplasmático granular • Neoplasias neuroendocrinas y células pequeñas • Stock In-House",
        "category": "Neuroendocrino",
        "target": "Cytoplasmic granular",
        "inStock": true,
        "aliases": [
            "synaptophysin",
            "sinaptofisina",
            "neuroendocrino",
            "net",
            "sclc"
        ]
    },
    {
        "id": "ab-cromogranina",
        "code": "Cromogranina",
        "name_en": "Chromogranin A (Cromogranina A)",
        "name_es": "Cromogranina A",
        "meta_en": "Cytoplasmic granular • Dense-core neuroendocrine granules • Stock In-House",
        "meta_es": "Citoplasmático granular • Gránulos neuroendocrinos densos • Stock In-House",
        "category": "Neuroendocrino",
        "target": "Cytoplasmic granular",
        "inStock": true,
        "aliases": [
            "chromogranin",
            "cromogranina",
            "neuroendocrino",
            "carcinoide"
        ]
    },
    {
        "id": "ab-cd56",
        "code": "CD56",
        "name_en": "CD56 (NCAM1)",
        "name_es": "CD56 (NCAM1)",
        "meta_en": "Membranous • Neuroendocrine tumors, Small Cell Carcinoma, NK cells • Stock In-House",
        "meta_es": "Membranoso • Tumores neuroendocrinos, células pequeñas y NK • Stock In-House",
        "category": "Neuroendocrino & NK",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "cd56",
            "ncam",
            "ncam1",
            "neuroendocrino"
        ]
    },
    {
        "id": "ab-s100",
        "code": "S100",
        "name_en": "S100 (S100 Protein)",
        "name_es": "S100 (Proteína S-100)",
        "meta_en": "Nuclear & Cytoplasmic • Melanoma, Schwannoma, Neurofibroma, GIST • Stock In-House",
        "meta_es": "Nuclear y Citoplásmico • Melanoma, Schwannoma, Neurofibroma • Stock In-House",
        "category": "Neural & Melanocítico",
        "target": "Nuclear & Cytoplasmic",
        "inStock": true,
        "aliases": [
            "s100",
            "s-100",
            "melanoma",
            "schwannoma",
            "neural"
        ]
    },
    {
        "id": "ab-sox10",
        "code": "SOX10",
        "name_en": "SOX10 (SRY-Box 10)",
        "name_es": "SOX10 (Factor de Transcripción SOX-10)",
        "meta_en": "Nuclear • Highly sensitive & specific for Melanoma & Nerve Sheath • Stock In-House",
        "meta_es": "Nuclear • Alta sensibilidad para Melanoma y Vaina Nerviosa • Stock In-House",
        "category": "Melanocítico & Nervio",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "sox10",
            "sox-10",
            "melanoma",
            "schwannoma"
        ]
    },
    {
        "id": "ab-melan-a",
        "code": "Melan-A",
        "name_en": "Melan-A / MART-1",
        "name_es": "Melan-A / MART-1",
        "meta_en": "Cytoplasmic • Malignant Melanoma & Adrenocortical differentiation • Stock In-House",
        "meta_es": "Citoplásmico • Melanoma Maligno y Corteza Suprarrenal • Stock In-House",
        "category": "Melanocítico",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "melan-a",
            "melana",
            "mart1",
            "mart-1",
            "melanoma"
        ]
    },
    {
        "id": "ab-hmb-45",
        "code": "HMB-45",
        "name_en": "HMB-45 (gp100)",
        "name_es": "HMB-45 (gp100)",
        "meta_en": "Cytoplasmic • Specific premelanosome marker for Malignant Melanoma & PEComa • Stock In-House",
        "meta_es": "Citoplásmico • Marcador premelanosómico de Melanoma y PEComa • Stock In-House",
        "category": "Melanocítico",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "hmb45",
            "hmb-45",
            "gp100",
            "melanoma",
            "pecoma"
        ]
    },
    {
        "id": "ab-desmina",
        "code": "Desmina",
        "name_en": "Desmin (Desmina)",
        "name_es": "Desmina",
        "meta_en": "Cytoplasmic • Smooth & skeletal muscle neoplasms (Leiomyo-, Rhabdomyo-) • Stock In-House",
        "meta_es": "Citoplásmico • Neoplasias musculares lisas y estriadas • Stock In-House",
        "category": "Músculo & Sarcomas",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "desmin",
            "desmina",
            "sarcoma",
            "musculo",
            "leiomiosarcoma"
        ]
    },
    {
        "id": "ab-miogenina",
        "code": "Miogenina",
        "name_en": "Myogenin (Myf4 / Miogenina)",
        "name_es": "Miogenina (Myf4)",
        "meta_en": "Nuclear • High specificity for Rhabdomyosarcoma (Embryonal & Alveolar) • Stock In-House",
        "meta_es": "Nuclear • Alta especificidad para Rabdomiosarcoma • Stock In-House",
        "category": "Músculo Esquelético",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "myogenin",
            "miogenina",
            "myf4",
            "rabdomiosarcoma",
            "sarcoma"
        ]
    },
    {
        "id": "ab-cd34",
        "code": "CD34",
        "name_en": "CD34 (Endothelial & Progenitor)",
        "name_es": "CD34 (Endotelial y Progenitor)",
        "meta_en": "Membranous • Vascular tumors, Solitary Fibrous Tumor, GIST, DFSP • Stock In-House",
        "meta_es": "Membranoso • Tumor fibroso solitario, GIST, DFSP, angiosarcoma • Stock In-House",
        "category": "Vascular & Estromal",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "cd34",
            "endotelial",
            "vascular",
            "sft",
            "gist",
            "dfsp"
        ]
    },
    {
        "id": "ab-cd31",
        "code": "CD31",
        "name_en": "CD31 (PECAM-1)",
        "name_es": "CD31 (PECAM-1)",
        "meta_en": "Membranous • High specificity for Endothelial differentiation & Angiosarcoma • Stock In-House",
        "meta_es": "Membranoso • Alta especificidad para diferenciación endotelial • Stock In-House",
        "category": "Vascular & Endotelial",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "cd31",
            "pecam",
            "endotelial",
            "angiosarcoma",
            "vascular"
        ]
    },
    {
        "id": "ab-cd45",
        "code": "CD45",
        "name_en": "CD45 (LCA - Leukocyte Common Antigen)",
        "name_es": "CD45 (LCA - Antígeno Leucocitario Común)",
        "meta_en": "Membranous • Hematolymphoid lineage (Lymphomas & Leukemias) • Stock In-House",
        "meta_es": "Membranoso • Linaje hematolinfoide (Linfomas y leucemias) • Stock In-House",
        "category": "Linfoide & Hematopatología",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "cd45",
            "lca",
            "leukocyte",
            "linfoma",
            "hematopatologia"
        ]
    },
    {
        "id": "ab-cd3",
        "code": "CD3",
        "name_en": "CD3 (Pan T-Cell Marker)",
        "name_es": "CD3 (Marcador Pan Linfocito T)",
        "meta_en": "Membranous • Lineage-defining T-lymphocyte antigen • Stock In-House",
        "meta_es": "Membranoso • Antígeno definitorio de linaje linfocítico T • Stock In-House",
        "category": "Linfoide & Hematopatología",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "cd3",
            "t-cell",
            "linfocito t",
            "linfoma t"
        ]
    },
    {
        "id": "ab-cd20",
        "code": "CD20",
        "name_en": "CD20 (Pan B-Cell Marker - L26)",
        "name_es": "CD20 (Marcador Pan Linfocito B - L26)",
        "meta_en": "Membranous • Lineage-defining B-cell lymphoma (DLBCL, Follicular) • Stock In-House",
        "meta_es": "Membranoso • Antígeno definitorio de linfomas B (DLBCL, Folicular) • Stock In-House",
        "category": "Linfoide & Hematopatología",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "cd20",
            "b-cell",
            "linfocito b",
            "dlbcl",
            "linfoma b"
        ]
    },
    {
        "id": "ab-pax8",
        "code": "PAX8",
        "name_en": "PAX8 (Paired Box 8)",
        "name_es": "PAX8",
        "meta_en": "Nuclear • Renal cell carcinoma, Thyroid, Gynecologic serous/endometrioid • Stock In-House",
        "meta_es": "Nuclear • Carcinoma renal, tiroides, seroso y endometrioide • Stock In-House",
        "category": "Renal & Ginecopatología",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "pax8",
            "pax-8",
            "renal",
            "riñon",
            "ovario",
            "tiroides"
        ]
    },
    {
        "id": "ab-d2-40",
        "code": "D2-40",
        "name_en": "Podoplanin (D2-40)",
        "name_es": "Podoplanina (D2-40)",
        "meta_en": "Membranous • Lymphatic endothelium, Epithelioid Mesothelioma, Seminoma • Stock In-House",
        "meta_es": "Membranoso • Endotelio linfático, mesotelioma epitelioide y seminoma • Stock In-House",
        "category": "Mesotelial & Linfático",
        "target": "Membranous",
        "inStock": true,
        "aliases": [
            "d2-40",
            "d240",
            "podoplanin",
            "podoplanina",
            "mesotelioma",
            "seminoma"
        ]
    },
    {
        "id": "ab-sma",
        "code": "SMA",
        "name_en": "SMA (Smooth Muscle Actin)",
        "name_es": "SMA (Actina Músculo Liso)",
        "meta_en": "Cytoplasmic • Smooth muscle differentiation, Myofibroblasts • Stock In-House",
        "meta_es": "Citoplásmico • Diferenciación músculo liso y miofibroblastos • Stock In-House",
        "category": "Músculo & Sarcomas",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "sma",
            "actina musculo liso",
            "actina",
            "leiomioma",
            "miofibroblasto"
        ]
    },
    {
        "id": "ab-vimentin",
        "code": "Vimentin",
        "name_en": "Vimentin (Vimentina)",
        "name_es": "Vimentina",
        "meta_en": "Cytoplasmic • Mesenchymal neoplasms, Clear cell RCC, Melanoma • Stock In-House",
        "meta_es": "Citoplásmico • Neoplasias mesenquimales, carcinoma renal de células claras • Stock In-House",
        "category": "Mesenquimal",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "vimentin",
            "vimentina",
            "sarcoma",
            "mesenquimal"
        ]
    },
    {
        "id": "ab-cd117",
        "code": "CD117",
        "name_en": "CD117 (c-KIT)",
        "name_es": "CD117 (c-KIT)",
        "meta_en": "Membranous & Cytoplasmic • Gastrointestinal Stromal Tumor (GIST), Seminoma • Stock In-House",
        "meta_es": "Membranoso y Citoplásmico • Tumor estromal GI (GIST) y seminoma • Stock In-House",
        "category": "GIST & Germinal",
        "target": "Membranous & Cytoplasmic",
        "inStock": true,
        "aliases": [
            "cd117",
            "ckit",
            "c-kit",
            "gist",
            "seminoma"
        ]
    },
    {
        "id": "ab-dog1",
        "code": "DOG1",
        "name_en": "DOG1 (Anoctamin-1)",
        "name_es": "DOG1 (Anoctamina-1)",
        "meta_en": "Membranous & Apical • >98% sensitivity for GIST (c-KIT negative included) • Stock In-House",
        "meta_es": "Membranoso y Apical • >98% sensibilidad para GIST • Stock In-House",
        "category": "GIST",
        "target": "Membranous & Apical",
        "inStock": true,
        "aliases": [
            "dog1",
            "dog-1",
            "anoctamin",
            "gist"
        ]
    },
    {
        "id": "ab-amacr",
        "code": "AMACR",
        "name_en": "AMACR (Racemase / P504S)",
        "name_es": "AMACR (Racemasa / P504S)",
        "meta_en": "Cytoplasmic granular • Prostate Adenocarcinoma & Papillary Renal CA • Stock In-House",
        "meta_es": "Citoplásmico granular • Adenocarcinoma prostático y carcinoma renal papilar • Stock In-House",
        "category": "Próstata & Riñón",
        "target": "Cytoplasmic granular",
        "inStock": true,
        "aliases": [
            "amacr",
            "p504s",
            "racemasa",
            "prostata",
            "riñon papilar"
        ]
    },
    {
        "id": "ab-nkx3-1",
        "code": "NKX3.1",
        "name_en": "NKX3.1 Homeobox",
        "name_es": "NKX3.1 Homeobox",
        "meta_en": "Nuclear • Highest specificity nuclear prostate marker (persists in metastases) • Stock In-House",
        "meta_es": "Nuclear • Máxima especificidad prostática nuclear en metástasis • Stock In-House",
        "category": "Próstata & Uropatología",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "nkx3.1",
            "nkx31",
            "prostata",
            "prostate metastasis"
        ]
    },
    {
        "id": "ab-satb2",
        "code": "SATB2",
        "name_en": "SATB2 Homeobox",
        "name_es": "SATB2 Homeobox",
        "meta_en": "Nuclear • High sensitivity & specificity for Colorectal Adenocarcinoma • Stock In-House",
        "meta_es": "Nuclear • Alta sensibilidad y especificidad para adenocarcinoma colorrectal • Stock In-House",
        "category": "Gastrointestinal & Hueso",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "satb2",
            "satb-2",
            "colon",
            "colorrectal",
            "osteosarcoma"
        ]
    },
    {
        "id": "ab-napsin-a",
        "code": "Napsin A",
        "name_en": "Napsin A",
        "name_es": "Napsina A",
        "meta_en": "Cytoplasmic granular • Lung Adenocarcinoma & Clear Cell Ovarian CA • Stock In-House",
        "meta_es": "Citoplásmico granular • Adenocarcinoma pulmonar y carcinoma renal/ovárico de células claras • Stock In-House",
        "category": "Pulmón & Renal",
        "target": "Cytoplasmic granular",
        "inStock": true,
        "aliases": [
            "napsin a",
            "napsina",
            "napsina a",
            "pulmon adeno"
        ]
    },
    {
        "id": "ab-bap1",
        "code": "BAP1",
        "name_en": "BAP1 (Loss of expression)",
        "name_es": "BAP1 (Pérdida de expresión)",
        "meta_en": "Nuclear • Loss confirms malignancy in Epithelioid Mesothelioma (60-70%) • Stock In-House",
        "meta_es": "Nuclear • La pérdida confirma malignidad en mesotelioma epitelioide • Stock In-House",
        "category": "Mesotelio & Melanoma",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "bap1",
            "bap-1",
            "mesotelioma",
            "pleura",
            "melanoma uveal"
        ]
    },
    {
        "id": "ab-trps1",
        "code": "TRPS1",
        "name_en": "TRPS1",
        "name_es": "TRPS1",
        "meta_en": "Nuclear • Highly sensitive for Triple-Negative & Metaplastic Breast CA • Stock In-House",
        "meta_es": "Nuclear • Alta sensibilidad para carcinoma de mama triple negativo • Stock In-House",
        "category": "Mama & Gineco",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "trps1",
            "trps-1",
            "mama triple negativo",
            "breast tnbc"
        ]
    },
    {
        "id": "ab-arginase-1",
        "code": "Arginase-1",
        "name_en": "Arginase-1 (ARG1)",
        "name_es": "Arginasa-1 (ARG1)",
        "meta_en": "Cytoplasmic & Nuclear • >95% sensitive for Hepatocellular Carcinoma (HCC) • Stock In-House",
        "meta_es": "Citoplásmico y nuclear • >95% sensibilidad para carcinoma hepatocelular • Stock In-House",
        "category": "Hígado",
        "target": "Cytoplasmic & Nuclear",
        "inStock": true,
        "aliases": [
            "arginase-1",
            "arginasa 1",
            "arg1",
            "hepatocarcinoma",
            "higado"
        ]
    },
    {
        "id": "ab-heppar-1",
        "code": "HepPar-1",
        "name_en": "HepPar-1 (Hepatocyte Paraffin 1)",
        "name_es": "HepPar-1 (Hepatocito Parafina 1)",
        "meta_en": "Cytoplasmic granular • Hepatocellular differentiation marker • Stock In-House",
        "meta_es": "Citoplásmico granular • Marcador de diferenciación hepatocelular • Stock In-House",
        "category": "Hígado",
        "target": "Cytoplasmic granular",
        "inStock": true,
        "aliases": [
            "heppar1",
            "hep-par1",
            "heppar-1",
            "higado",
            "hepatocarcinoma"
        ]
    },
    {
        "id": "ab-glypican-3",
        "code": "Glypican-3",
        "name_en": "Glypican-3 (GPC3)",
        "name_es": "Glicipano-3 (GPC3)",
        "meta_en": "Cytoplasmic & Canalicular • Early HCC & Yolk Sac Tumor • Stock In-House",
        "meta_es": "Citoplásmico • Hepatocarcinoma temprano y tumor del seno endodérmico • Stock In-House",
        "category": "Hígado & Germinal",
        "target": "Cytoplasmic",
        "inStock": true,
        "aliases": [
            "glypican-3",
            "glipican 3",
            "gpc3",
            "higado",
            "seno endodermico"
        ]
    },
    {
        "id": "ab-actina-musculo-liso",
        "code": "ACTINA MUSCULO LISO",
        "name_en": "ACTINA MUSCULO LISO",
        "name_es": "ACTINA MUSCULO LISO",
        "meta_en": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "meta_es": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "category": "Partes Blandas & Sarcomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "actina musculo liso",
            "actina musculo liso"
        ]
    },
    {
        "id": "ab-actina-hif35",
        "code": "ACTINA (HIF35)",
        "name_en": "ACTINA (HIF35)",
        "name_es": "ACTINA (HIF35)",
        "meta_en": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "meta_es": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "category": "Partes Blandas & Sarcomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "actina (hif35)",
            "actina hif35 "
        ]
    },
    {
        "id": "ab-adipofilina",
        "code": "ADIPOFILINA",
        "name_en": "ADIPOFILINA",
        "name_es": "ADIPOFILINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "adipofilina",
            "adipofilina"
        ]
    },
    {
        "id": "ab-afp-alfa-fetoproteina",
        "code": "AFP (Alfa FetoProteina)",
        "name_en": "AFP (Alfa FetoProteina)",
        "name_es": "AFP (Alfa FetoProteina)",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "afp (alfa fetoproteina)",
            "afp alfa fetoproteina "
        ]
    },
    {
        "id": "ab-alk-cd246",
        "code": "ALK(CD246)",
        "name_en": "ALK(CD246)",
        "name_es": "ALK(CD246)",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "alk(cd246)",
            "alk cd246 "
        ]
    },
    {
        "id": "ab-amacr-racemase",
        "code": "AMACR (Racemase)",
        "name_en": "AMACR (Racemase)",
        "name_es": "AMACR (Racemase)",
        "meta_en": "Citoplasmático granular • Próstata & Uropatología • Stock In-House 24/7",
        "meta_es": "Citoplasmático granular • Próstata & Uropatología • Stock In-House 24/7",
        "category": "Próstata & Uropatología",
        "target": "Citoplasmático granular",
        "inStock": true,
        "aliases": [
            "amacr (racemase)",
            "amacr racemase "
        ]
    },
    {
        "id": "ab-amiloide-a",
        "code": "AMILOIDE A",
        "name_en": "AMILOIDE A",
        "name_es": "AMILOIDE A",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "amiloide a",
            "amiloide a"
        ]
    },
    {
        "id": "ab-androgeno",
        "code": "ANDROGENO",
        "name_en": "ANDROGENO",
        "name_es": "ANDROGENO",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "androgeno",
            "androgeno"
        ]
    },
    {
        "id": "ab-a-carbonica-ix-ca-ix",
        "code": "A. CARBONICA IX (CA IX)",
        "name_en": "A. CARBONICA IX (CA IX)",
        "name_es": "A. CARBONICA IX (CA IX)",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "a. carbonica ix (ca ix)",
            "a carbonica ix ca ix "
        ]
    },
    {
        "id": "ab-arginase-1",
        "code": "ARGINASE 1",
        "name_en": "ARGINASE 1",
        "name_es": "ARGINASE 1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "arginase 1",
            "arginase 1"
        ]
    },
    {
        "id": "ab-atrx",
        "code": "ATRX",
        "name_en": "ATRX",
        "name_es": "ATRX",
        "meta_en": "Celular • Neuropatología & SNC • Stock In-House 24/7",
        "meta_es": "Celular • Neuropatología & SNC • Stock In-House 24/7",
        "category": "Neuropatología & SNC",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "atrx",
            "atrx"
        ]
    },
    {
        "id": "ab-bcl-2",
        "code": "BCL-2",
        "name_en": "BCL-2",
        "name_es": "BCL-2",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "bcl-2",
            "bcl 2"
        ]
    },
    {
        "id": "ab-bcl-6",
        "code": "BCL-6",
        "name_en": "BCL-6",
        "name_es": "BCL-6",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "bcl-6",
            "bcl 6"
        ]
    },
    {
        "id": "ab-ber-ep4",
        "code": "BER-EP4",
        "name_en": "BER-EP4",
        "name_es": "BER-EP4",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ber-ep4",
            "ber ep4"
        ]
    },
    {
        "id": "ab-betacatenin",
        "code": "BETACATENIN",
        "name_en": "BETACATENIN",
        "name_es": "BETACATENIN",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "betacatenin",
            "betacatenin"
        ]
    },
    {
        "id": "ab-c-myc",
        "code": "C-MYC",
        "name_en": "C-MYC",
        "name_es": "C-MYC",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "c-myc",
            "c myc"
        ]
    },
    {
        "id": "ab-calcitonina",
        "code": "CALCITONINA",
        "name_en": "CALCITONINA",
        "name_es": "CALCITONINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "calcitonina",
            "calcitonina"
        ]
    },
    {
        "id": "ab-caldesmon",
        "code": "CALDESMON",
        "name_en": "CALDESMON",
        "name_es": "CALDESMON",
        "meta_en": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "meta_es": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "category": "Partes Blandas & Sarcomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "caldesmon",
            "caldesmon"
        ]
    },
    {
        "id": "ab-calponina",
        "code": "CALPONINA",
        "name_en": "CALPONINA",
        "name_es": "CALPONINA",
        "meta_en": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "meta_es": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "category": "Partes Blandas & Sarcomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "calponina",
            "calponina"
        ]
    },
    {
        "id": "ab-calretinina",
        "code": "CALRETININA",
        "name_en": "CALRETININA",
        "name_es": "CALRETININA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "calretinina",
            "calretinina"
        ]
    },
    {
        "id": "ab-cd1a",
        "code": "CD1a",
        "name_en": "CD1a",
        "name_es": "CD1a",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd1a",
            "cd1a"
        ]
    },
    {
        "id": "ab-cd4",
        "code": "CD4",
        "name_en": "CD4",
        "name_es": "CD4",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd4",
            "cd4"
        ]
    },
    {
        "id": "ab-cd5",
        "code": "CD5",
        "name_en": "CD5",
        "name_es": "CD5",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd5",
            "cd5"
        ]
    },
    {
        "id": "ab-cd7",
        "code": "CD7",
        "name_en": "CD7",
        "name_es": "CD7",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd7",
            "cd7"
        ]
    },
    {
        "id": "ab-cd8",
        "code": "CD8",
        "name_en": "CD8",
        "name_es": "CD8",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd8",
            "cd8"
        ]
    },
    {
        "id": "ab-cd10",
        "code": "CD10",
        "name_en": "CD10",
        "name_es": "CD10",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd10",
            "cd10"
        ]
    },
    {
        "id": "ab-cd15",
        "code": "CD15",
        "name_en": "CD15",
        "name_es": "CD15",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd15",
            "cd15"
        ]
    },
    {
        "id": "ab-cd19",
        "code": "CD19",
        "name_en": "CD19",
        "name_es": "CD19",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd19",
            "cd19"
        ]
    },
    {
        "id": "ab-cd21",
        "code": "CD21",
        "name_en": "CD21",
        "name_es": "CD21",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd21",
            "cd21"
        ]
    },
    {
        "id": "ab-cd23",
        "code": "CD23",
        "name_en": "CD23",
        "name_es": "CD23",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd23",
            "cd23"
        ]
    },
    {
        "id": "ab-cd30",
        "code": "CD30",
        "name_en": "CD30",
        "name_es": "CD30",
        "meta_en": "Membrana y zona Golgi • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Membrana y zona Golgi • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Membrana y zona Golgi",
        "inStock": true,
        "aliases": [
            "cd30",
            "cd30"
        ]
    },
    {
        "id": "ab-cd43",
        "code": "CD43",
        "name_en": "CD43",
        "name_es": "CD43",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd43",
            "cd43"
        ]
    },
    {
        "id": "ab-cd61",
        "code": "CD61",
        "name_en": "CD61",
        "name_es": "CD61",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd61",
            "cd61"
        ]
    },
    {
        "id": "ab-cd68",
        "code": "CD68",
        "name_en": "CD68",
        "name_es": "CD68",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd68",
            "cd68"
        ]
    },
    {
        "id": "ab-cd79a",
        "code": "CD79a",
        "name_en": "CD79a",
        "name_es": "CD79a",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd79a",
            "cd79a"
        ]
    },
    {
        "id": "ab-cd99",
        "code": "CD99",
        "name_en": "CD99",
        "name_es": "CD99",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd99",
            "cd99"
        ]
    },
    {
        "id": "ab-cd138",
        "code": "CD138",
        "name_en": "CD138",
        "name_es": "CD138",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cd138",
            "cd138"
        ]
    },
    {
        "id": "ab-cdk4",
        "code": "CDK4",
        "name_en": "CDK4",
        "name_es": "CDK4",
        "meta_en": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "meta_es": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "category": "Partes Blandas & Sarcomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cdk4",
            "cdk4"
        ]
    },
    {
        "id": "ab-ca-125",
        "code": "CA-125",
        "name_en": "CA-125",
        "name_es": "CA-125",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ca-125",
            "ca 125"
        ]
    },
    {
        "id": "ab-ca-19-9",
        "code": "CA 19.9",
        "name_en": "CA 19.9",
        "name_es": "CA 19.9",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ca 19.9",
            "ca 19 9"
        ]
    },
    {
        "id": "ab-cea",
        "code": "CEA",
        "name_en": "CEA",
        "name_es": "CEA",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cea",
            "cea"
        ]
    },
    {
        "id": "ab-cyclin-d1",
        "code": "CYCLIN D1",
        "name_en": "CYCLIN D1",
        "name_es": "CYCLIN D1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cyclin d1",
            "cyclin d1"
        ]
    },
    {
        "id": "ab-citokeratin-cams-2",
        "code": "CITOKERATIN CAMS 2",
        "name_en": "CITOKERATIN CAMS 2",
        "name_es": "CITOKERATIN CAMS 2",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin cams 2",
            "citokeratin cams 2"
        ]
    },
    {
        "id": "ab-citokeratin-oscar",
        "code": "CITOKERATIN OSCAR",
        "name_en": "CITOKERATIN OSCAR",
        "name_es": "CITOKERATIN OSCAR",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin oscar",
            "citokeratin oscar"
        ]
    },
    {
        "id": "ab-citokeratin-5-6",
        "code": "CITOKERATIN 5/6",
        "name_en": "CITOKERATIN 5/6",
        "name_es": "CITOKERATIN 5/6",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 5/6",
            "citokeratin 5 6"
        ]
    },
    {
        "id": "ab-citokeratin-7",
        "code": "CITOKERATIN 7",
        "name_en": "CITOKERATIN 7",
        "name_es": "CITOKERATIN 7",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 7",
            "citokeratin 7"
        ]
    },
    {
        "id": "ab-citokeratin-8",
        "code": "CITOKERATIN 8",
        "name_en": "CITOKERATIN 8",
        "name_es": "CITOKERATIN 8",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 8",
            "citokeratin 8"
        ]
    },
    {
        "id": "ab-citokeratin-14",
        "code": "CITOKERATIN 14",
        "name_en": "CITOKERATIN 14",
        "name_es": "CITOKERATIN 14",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 14",
            "citokeratin 14"
        ]
    },
    {
        "id": "ab-citokeratin-17",
        "code": "CITOKERATIN 17",
        "name_en": "CITOKERATIN 17",
        "name_es": "CITOKERATIN 17",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 17",
            "citokeratin 17"
        ]
    },
    {
        "id": "ab-citokeratin-18",
        "code": "CITOKERATIN 18",
        "name_en": "CITOKERATIN 18",
        "name_es": "CITOKERATIN 18",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 18",
            "citokeratin 18"
        ]
    },
    {
        "id": "ab-citokeratin-19",
        "code": "CITOKERATIN 19",
        "name_en": "CITOKERATIN 19",
        "name_es": "CITOKERATIN 19",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 19",
            "citokeratin 19"
        ]
    },
    {
        "id": "ab-citokeratin-20",
        "code": "CITOKERATIN 20",
        "name_en": "CITOKERATIN 20",
        "name_es": "CITOKERATIN 20",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citokeratin 20",
            "citokeratin 20"
        ]
    },
    {
        "id": "ab-citomegalovirus",
        "code": "CITOMEGALOVIRUS",
        "name_en": "CITOMEGALOVIRUS",
        "name_es": "CITOMEGALOVIRUS",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "citomegalovirus",
            "citomegalovirus"
        ]
    },
    {
        "id": "ab-colageno-iv",
        "code": "COLAGENO IV",
        "name_en": "COLAGENO IV",
        "name_es": "COLAGENO IV",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "colageno iv",
            "colageno iv"
        ]
    },
    {
        "id": "ab-ck-hwm-34be12",
        "code": "CK HWM (34BE12)",
        "name_en": "CK HWM (34BE12)",
        "name_es": "CK HWM (34BE12)",
        "meta_en": "Citoplasmático • Próstata & Uropatología • Stock In-House 24/7",
        "meta_es": "Citoplasmático • Próstata & Uropatología • Stock In-House 24/7",
        "category": "Próstata & Uropatología",
        "target": "Citoplasmático",
        "inStock": true,
        "aliases": [
            "ck hwm (34be12)",
            "ck hwm 34be12 "
        ]
    },
    {
        "id": "ab-cromogranina-a",
        "code": "CROMOGRANINA A",
        "name_en": "CROMOGRANINA A",
        "name_es": "CROMOGRANINA A",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "cromogranina a",
            "cromogranina a"
        ]
    },
    {
        "id": "ab-dog-1",
        "code": "DOG-1",
        "name_en": "DOG-1",
        "name_es": "DOG-1",
        "meta_en": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "meta_es": "Celular • Partes Blandas & Sarcomas • Stock In-House 24/7",
        "category": "Partes Blandas & Sarcomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "dog-1",
            "dog 1"
        ]
    },
    {
        "id": "ab-ebv-lmp-1",
        "code": "EBV/LMP-1",
        "name_en": "EBV/LMP-1",
        "name_es": "EBV/LMP-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ebv/lmp-1",
            "ebv lmp 1"
        ]
    },
    {
        "id": "ab-e-cadherina",
        "code": "E-CADHERINA",
        "name_en": "E-CADHERINA",
        "name_es": "E-CADHERINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "e-cadherina",
            "e cadherina"
        ]
    },
    {
        "id": "ab-ema",
        "code": "EMA",
        "name_en": "EMA",
        "name_es": "EMA",
        "meta_en": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "meta_es": "Celular • Epitelial & Carcinomas • Stock In-House 24/7",
        "category": "Epitelial & Carcinomas",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ema",
            "ema"
        ]
    },
    {
        "id": "ab-erg",
        "code": "ERG",
        "name_en": "ERG",
        "name_es": "ERG",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "erg",
            "erg"
        ]
    },
    {
        "id": "ab-estrogeno",
        "code": "ESTROGENO",
        "name_en": "ESTROGENO",
        "name_es": "ESTROGENO",
        "meta_en": "Celular • Mama & Gineco-Patología • Stock In-House 24/7",
        "meta_es": "Celular • Mama & Gineco-Patología • Stock In-House 24/7",
        "category": "Mama & Gineco-Patología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "estrogeno",
            "estrogeno"
        ]
    },
    {
        "id": "ab-factor-viii",
        "code": "FACTOR VIII",
        "name_en": "FACTOR VIII",
        "name_es": "FACTOR VIII",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "factor viii",
            "factor viii"
        ]
    },
    {
        "id": "ab-factor-xiiia",
        "code": "FACTOR XIIIa",
        "name_en": "FACTOR XIIIa",
        "name_es": "FACTOR XIIIa",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "factor xiiia",
            "factor xiiia"
        ]
    },
    {
        "id": "ab-fascin-a",
        "code": "FASCIN A",
        "name_en": "FASCIN A",
        "name_es": "FASCIN A",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "fascin a",
            "fascin a"
        ]
    },
    {
        "id": "ab-foxp3",
        "code": "FOXP3",
        "name_en": "FOXP3",
        "name_es": "FOXP3",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "foxp3",
            "foxp3"
        ]
    },
    {
        "id": "ab-fly-1",
        "code": "FLY-1",
        "name_en": "FLY-1",
        "name_es": "FLY-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "fly-1",
            "fly 1"
        ]
    },
    {
        "id": "ab-gata-3",
        "code": "GATA 3",
        "name_en": "GATA 3",
        "name_es": "GATA 3",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "gata 3",
            "gata 3"
        ]
    },
    {
        "id": "ab-gfap",
        "code": "GFAP",
        "name_en": "GFAP",
        "name_es": "GFAP",
        "meta_en": "Citoplasmático • Neuropatología & SNC • Stock In-House 24/7",
        "meta_es": "Citoplasmático • Neuropatología & SNC • Stock In-House 24/7",
        "category": "Neuropatología & SNC",
        "target": "Citoplasmático",
        "inStock": true,
        "aliases": [
            "gfap",
            "gfap"
        ]
    },
    {
        "id": "ab-glut-1",
        "code": "GLUT-1",
        "name_en": "GLUT-1",
        "name_es": "GLUT-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "glut-1",
            "glut 1"
        ]
    },
    {
        "id": "ab-glipican-3",
        "code": "GLIPICAN 3",
        "name_en": "GLIPICAN 3",
        "name_es": "GLIPICAN 3",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "glipican 3",
            "glipican 3"
        ]
    },
    {
        "id": "ab-glycoforina",
        "code": "GLYCOFORINA",
        "name_en": "GLYCOFORINA",
        "name_es": "GLYCOFORINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "glycoforina",
            "glycoforina"
        ]
    },
    {
        "id": "ab-granzyme-b",
        "code": "GRANZYME B",
        "name_en": "GRANZYME B",
        "name_es": "GRANZYME B",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "granzyme b",
            "granzyme b"
        ]
    },
    {
        "id": "ab-hcg-beta",
        "code": "HCG (Beta)",
        "name_en": "HCG (Beta)",
        "name_es": "HCG (Beta)",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "hcg (beta)",
            "hcg beta "
        ]
    },
    {
        "id": "ab-her2-c-erbb2-cb11",
        "code": "HER2 (C-ERBB2/CB11)",
        "name_en": "HER2 (C-ERBB2/CB11)",
        "name_es": "HER2 (C-ERBB2/CB11)",
        "meta_en": "Celular • Mama & Gineco-Patología • Stock In-House 24/7",
        "meta_es": "Celular • Mama & Gineco-Patología • Stock In-House 24/7",
        "category": "Mama & Gineco-Patología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "her2 (c-erbb2/cb11)",
            "her2 c erbb2 cb11 "
        ]
    },
    {
        "id": "ab-hep-par1",
        "code": "HEP-PAR1",
        "name_en": "HEP-PAR1",
        "name_es": "HEP-PAR1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "hep-par1",
            "hep par1"
        ]
    },
    {
        "id": "ab-hhv-8",
        "code": "HHV-8",
        "name_en": "HHV-8",
        "name_es": "HHV-8",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "hhv-8",
            "hhv 8"
        ]
    },
    {
        "id": "ab-hmb45",
        "code": "HMB45",
        "name_en": "HMB45",
        "name_es": "HMB45",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "hmb45",
            "hmb45"
        ]
    },
    {
        "id": "ab-idh-1",
        "code": "IDH-1",
        "name_en": "IDH-1",
        "name_es": "IDH-1",
        "meta_en": "Celular • Neuropatología & SNC • Stock In-House 24/7",
        "meta_es": "Celular • Neuropatología & SNC • Stock In-House 24/7",
        "category": "Neuropatología & SNC",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "idh-1",
            "idh 1"
        ]
    },
    {
        "id": "ab-igg",
        "code": "IgG",
        "name_en": "IgG",
        "name_es": "IgG",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "igg",
            "igg"
        ]
    },
    {
        "id": "ab-igg-4",
        "code": "IgG-4",
        "name_en": "IgG-4",
        "name_es": "IgG-4",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "igg-4",
            "igg 4"
        ]
    },
    {
        "id": "ab-ig-m",
        "code": "Ig M",
        "name_en": "Ig M",
        "name_es": "Ig M",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ig m",
            "ig m"
        ]
    },
    {
        "id": "ab-ini-1",
        "code": "INI-1",
        "name_en": "INI-1",
        "name_es": "INI-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ini-1",
            "ini 1"
        ]
    },
    {
        "id": "ab-imp-3",
        "code": "IMP-3",
        "name_en": "IMP-3",
        "name_es": "IMP-3",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "imp-3",
            "imp 3"
        ]
    },
    {
        "id": "ab-inhibina",
        "code": "INHIBINA",
        "name_en": "INHIBINA",
        "name_es": "INHIBINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "inhibina",
            "inhibina"
        ]
    },
    {
        "id": "ab-kappa",
        "code": "KAPPA",
        "name_en": "KAPPA",
        "name_es": "KAPPA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "kappa",
            "kappa"
        ]
    },
    {
        "id": "ab-ki67",
        "code": "KI67",
        "name_en": "KI67",
        "name_es": "KI67",
        "meta_en": "Nuclear • Proliferación & Pronóstico • Stock In-House 24/7",
        "meta_es": "Nuclear • Proliferación & Pronóstico • Stock In-House 24/7",
        "category": "Proliferación & Pronóstico",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "ki67",
            "ki67"
        ]
    },
    {
        "id": "ab-lambda",
        "code": "LAMBDA",
        "name_en": "LAMBDA",
        "name_es": "LAMBDA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "lambda",
            "lambda"
        ]
    },
    {
        "id": "ab-lef-1",
        "code": "LEF-1",
        "name_en": "LEF-1",
        "name_es": "LEF-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "lef-1",
            "lef 1"
        ]
    },
    {
        "id": "ab-lisozima",
        "code": "LISOZIMA",
        "name_en": "LISOZIMA",
        "name_es": "LISOZIMA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "lisozima",
            "lisozima"
        ]
    },
    {
        "id": "ab-mamaglobina",
        "code": "MAMAGLOBINA",
        "name_en": "MAMAGLOBINA",
        "name_es": "MAMAGLOBINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "mamaglobina",
            "mamaglobina"
        ]
    },
    {
        "id": "ab-melan-a-mart-1",
        "code": "MELAN A/MART-1",
        "name_en": "MELAN A/MART-1",
        "name_es": "MELAN A/MART-1",
        "meta_en": "Celular • Dermatopatología & Melanoma • Stock In-House 24/7",
        "meta_es": "Celular • Dermatopatología & Melanoma • Stock In-House 24/7",
        "category": "Dermatopatología & Melanoma",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "melan a/mart-1",
            "melan a mart 1"
        ]
    },
    {
        "id": "ab-mieloperoxidasa-mpo",
        "code": "MIELOPEROXIDASA (MPO)",
        "name_en": "MIELOPEROXIDASA (MPO)",
        "name_es": "MIELOPEROXIDASA (MPO)",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "mieloperoxidasa (mpo)",
            "mieloperoxidasa mpo "
        ]
    },
    {
        "id": "ab-miogeina",
        "code": "MIOGEINA",
        "name_en": "MIOGEINA",
        "name_es": "MIOGEINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "miogeina",
            "miogeina"
        ]
    },
    {
        "id": "ab-mitf",
        "code": "MITF",
        "name_en": "MITF",
        "name_es": "MITF",
        "meta_en": "Celular • Dermatopatología & Melanoma • Stock In-House 24/7",
        "meta_es": "Celular • Dermatopatología & Melanoma • Stock In-House 24/7",
        "category": "Dermatopatología & Melanoma",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "mitf",
            "mitf"
        ]
    },
    {
        "id": "ab-mlh1",
        "code": "MLH1",
        "name_en": "MLH1",
        "name_es": "MLH1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "mlh1",
            "mlh1"
        ]
    },
    {
        "id": "ab-msh2",
        "code": "MSH2",
        "name_en": "MSH2",
        "name_es": "MSH2",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "msh2",
            "msh2"
        ]
    },
    {
        "id": "ab-msh6",
        "code": "MSH6",
        "name_en": "MSH6",
        "name_es": "MSH6",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "msh6",
            "msh6"
        ]
    },
    {
        "id": "ab-muc-2",
        "code": "MUC 2",
        "name_en": "MUC 2",
        "name_es": "MUC 2",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "muc 2",
            "muc 2"
        ]
    },
    {
        "id": "ab-muc-5ac",
        "code": "MUC 5AC",
        "name_en": "MUC 5AC",
        "name_es": "MUC 5AC",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "muc 5ac",
            "muc 5ac"
        ]
    },
    {
        "id": "ab-muc-6",
        "code": "MUC 6",
        "name_en": "MUC 6",
        "name_es": "MUC 6",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "muc 6",
            "muc 6"
        ]
    },
    {
        "id": "ab-mum-1",
        "code": "MUM-1",
        "name_en": "MUM-1",
        "name_es": "MUM-1",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "mum-1",
            "mum 1"
        ]
    },
    {
        "id": "ab-myo-d1",
        "code": "MYO D1",
        "name_en": "MYO D1",
        "name_es": "MYO D1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "myo d1",
            "myo d1"
        ]
    },
    {
        "id": "ab-mmp9",
        "code": "MMP9",
        "name_en": "MMP9",
        "name_es": "MMP9",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "mmp9",
            "mmp9"
        ]
    },
    {
        "id": "ab-neurofilamento",
        "code": "NEUROFILAMENTO",
        "name_en": "NEUROFILAMENTO",
        "name_es": "NEUROFILAMENTO",
        "meta_en": "Celular • Neuropatología & SNC • Stock In-House 24/7",
        "meta_es": "Celular • Neuropatología & SNC • Stock In-House 24/7",
        "category": "Neuropatología & SNC",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "neurofilamento",
            "neurofilamento"
        ]
    },
    {
        "id": "ab-ngfr",
        "code": "NGFR",
        "name_en": "NGFR",
        "name_es": "NGFR",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "ngfr",
            "ngfr"
        ]
    },
    {
        "id": "ab-olig-2",
        "code": "OLIG 2",
        "name_en": "OLIG 2",
        "name_es": "OLIG 2",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "olig 2",
            "olig 2"
        ]
    },
    {
        "id": "ab-p16",
        "code": "P16",
        "name_en": "P16",
        "name_es": "P16",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "p16",
            "p16"
        ]
    },
    {
        "id": "ab-p53",
        "code": "P53",
        "name_en": "P53",
        "name_es": "P53",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "p53",
            "p53"
        ]
    },
    {
        "id": "ab-p57",
        "code": "P57",
        "name_en": "P57",
        "name_es": "P57",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "p57",
            "p57"
        ]
    },
    {
        "id": "ab-panqueratina",
        "code": "PANQUERATINA",
        "name_en": "PANQUERATINA",
        "name_es": "PANQUERATINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "panqueratina",
            "panqueratina"
        ]
    },
    {
        "id": "ab-pax-5",
        "code": "PAX-5",
        "name_en": "PAX-5",
        "name_es": "PAX-5",
        "meta_en": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "meta_es": "Celular • Linfoides & Hematopatología • Stock In-House 24/7",
        "category": "Linfoides & Hematopatología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "pax-5",
            "pax 5"
        ]
    },
    {
        "id": "ab-pax-8",
        "code": "PAX-8",
        "name_en": "PAX-8",
        "name_es": "PAX-8",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "pax-8",
            "pax 8"
        ]
    },
    {
        "id": "ab-podoplanina-d2-40",
        "code": "PODOPLANINA / D2-40",
        "name_en": "PODOPLANINA / D2-40",
        "name_es": "PODOPLANINA / D2-40",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "podoplanina / d2-40",
            "podoplanina d2 40"
        ]
    },
    {
        "id": "ab-pd-1-cd279",
        "code": "PD-1/CD279",
        "name_en": "PD-1/CD279",
        "name_es": "PD-1/CD279",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "pd-1/cd279",
            "pd 1 cd279"
        ]
    },
    {
        "id": "ab-pd-l1-22c3",
        "code": "PD-L1 (22c3)",
        "name_en": "PD-L1 (22c3)",
        "name_es": "PD-L1 (22c3)",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "pd-l1 (22c3)",
            "pd l1 22c3 "
        ]
    },
    {
        "id": "ab-plap",
        "code": "PLAP",
        "name_en": "PLAP",
        "name_es": "PLAP",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "plap",
            "plap"
        ]
    },
    {
        "id": "ab-pms2",
        "code": "PMS2",
        "name_en": "PMS2",
        "name_es": "PMS2",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "pms2",
            "pms2"
        ]
    },
    {
        "id": "ab-p-ten",
        "code": "P-TEN",
        "name_en": "P-TEN",
        "name_es": "P-TEN",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "p-ten",
            "p ten"
        ]
    },
    {
        "id": "ab-progesterona",
        "code": "PROGESTERONA",
        "name_en": "PROGESTERONA",
        "name_es": "PROGESTERONA",
        "meta_en": "Celular • Mama & Gineco-Patología • Stock In-House 24/7",
        "meta_es": "Celular • Mama & Gineco-Patología • Stock In-House 24/7",
        "category": "Mama & Gineco-Patología",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "progesterona",
            "progesterona"
        ]
    },
    {
        "id": "ab-vph",
        "code": "VPH",
        "name_en": "VPH",
        "name_es": "VPH",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "vph",
            "vph"
        ]
    },
    {
        "id": "ab-s-100",
        "code": "S-100",
        "name_en": "S-100",
        "name_es": "S-100",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "s-100",
            "s 100"
        ]
    },
    {
        "id": "ab-satb-2",
        "code": "SATB-2",
        "name_en": "SATB-2",
        "name_es": "SATB-2",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "satb-2",
            "satb 2"
        ]
    },
    {
        "id": "ab-sall-4",
        "code": "SALL 4",
        "name_en": "SALL 4",
        "name_es": "SALL 4",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "sall 4",
            "sall 4"
        ]
    },
    {
        "id": "ab-sox-10",
        "code": "SOX-10",
        "name_en": "SOX-10",
        "name_es": "SOX-10",
        "meta_en": "Nuclear • Dermatopatología & Melanoma • Stock In-House 24/7",
        "meta_es": "Nuclear • Dermatopatología & Melanoma • Stock In-House 24/7",
        "category": "Dermatopatología & Melanoma",
        "target": "Nuclear",
        "inStock": true,
        "aliases": [
            "sox-10",
            "sox 10"
        ]
    },
    {
        "id": "ab-smad4-dpc4",
        "code": "SMAD4/DPC4",
        "name_en": "SMAD4/DPC4",
        "name_es": "SMAD4/DPC4",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "smad4/dpc4",
            "smad4 dpc4"
        ]
    },
    {
        "id": "ab-stat-6",
        "code": "STAT 6",
        "name_en": "STAT 6",
        "name_es": "STAT 6",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "stat 6",
            "stat 6"
        ]
    },
    {
        "id": "ab-t-pallidum",
        "code": "T. PALLIDUM",
        "name_en": "T. PALLIDUM",
        "name_es": "T. PALLIDUM",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "t. pallidum",
            "t pallidum"
        ]
    },
    {
        "id": "ab-tdt",
        "code": "TDT",
        "name_en": "TDT",
        "name_es": "TDT",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "tdt",
            "tdt"
        ]
    },
    {
        "id": "ab-tle-1",
        "code": "TLE-1",
        "name_en": "TLE-1",
        "name_es": "TLE-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "tle-1",
            "tle 1"
        ]
    },
    {
        "id": "ab-tia-1",
        "code": "TIA-1",
        "name_en": "TIA-1",
        "name_es": "TIA-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "tia-1",
            "tia 1"
        ]
    },
    {
        "id": "ab-tiroglobulina",
        "code": "TIROGLOBULINA",
        "name_en": "TIROGLOBULINA",
        "name_es": "TIROGLOBULINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "tiroglobulina",
            "tiroglobulina"
        ]
    },
    {
        "id": "ab-tirosinasa",
        "code": "TIROSINASA",
        "name_en": "TIROSINASA",
        "name_es": "TIROSINASA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "tirosinasa",
            "tirosinasa"
        ]
    },
    {
        "id": "ab-vimentina",
        "code": "VIMENTINA",
        "name_en": "VIMENTINA",
        "name_es": "VIMENTINA",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "vimentina",
            "vimentina"
        ]
    },
    {
        "id": "ab-wt-1",
        "code": "WT-1",
        "name_en": "WT-1",
        "name_es": "WT-1",
        "meta_en": "Celular • General • Stock In-House 24/7",
        "meta_es": "Celular • General • Stock In-House 24/7",
        "category": "General",
        "target": "Celular",
        "inStock": true,
        "aliases": [
            "wt-1",
            "wt 1"
        ]
    }
];
    var IQ_DIAGNOSES = [
    {
        "id": "diag-lung-adeno",
        "code": "LUNG_ADENO",
        "name_en": "Lung Adenocarcinoma",
        "name_es": "Adenocarcinoma Pulmonar",
        "organ": "Pulmón / Tórax",
        "category": "Epitelial Maligno",
        "icd": "8140/3",
        "meta_en": "TTF-1+, Napsin A+, Claudin-4+, CK7+, CK20-, p40- • Lung • ICD-O: 8140/3",
        "meta_es": "TTF-1+, Napsina A+, Claudina-4+, CK7+, CK20-, p40- • Pulmón • ICD-O: 8140/3",
        "aliases": [
            "adenocarcinoma pulmonar",
            "lung adenocarcinoma",
            "pulmon adeno",
            "adeno pulmonar",
            "8140/3"
        ],
        "profile": {
            "CK7": 95,
            "CK20": 5,
            "TTF-1": 85,
            "p40": 1,
            "p63": 10,
            "GATA3": 2,
            "CDX2": 6,
            "Claudin-4": 98,
            "Calretinin": 2,
            "WT1": 1,
            "Napsin A": 85,
            "MOC-31": 95,
            "ER": 2,
            "PR": 0,
            "HER2": 15,
            "Ki-67": 45,
            "PSA": 0,
            "Sinaptofisina": 5,
            "Cromogranina": 2,
            "CD56": 5,
            "S100": 2,
            "SOX10": 0,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 1
        }
    },
    {
        "id": "diag-lung-squam",
        "code": "LUNG_SQUAM",
        "name_en": "Lung Squamous Cell Carcinoma",
        "name_es": "Carcinoma Escamoso Pulmonar",
        "organ": "Pulmón / Tórax",
        "category": "Epitelial Maligno",
        "icd": "8070/3",
        "meta_en": "p40+, p63+, CK5/6+, TTF-1-, Napsin A- • Central / Bronchial • ICD-O: 8070/3",
        "meta_es": "p40+, p63+, CK5/6+, TTF-1-, Napsina A- • Central / Bronquial • ICD-O: 8070/3",
        "aliases": [
            "carcinoma escamoso pulmonar",
            "lung squamous cell carcinoma",
            "epidermoide pulmon",
            "p40",
            "8070/3"
        ],
        "profile": {
            "CK7": 20,
            "CK20": 2,
            "TTF-1": 1,
            "p40": 99,
            "p63": 98,
            "GATA3": 2,
            "CDX2": 1,
            "Claudin-4": 90,
            "Calretinin": 5,
            "WT1": 0,
            "Napsin A": 1,
            "MOC-31": 80,
            "ER": 0,
            "PR": 0,
            "HER2": 5,
            "Ki-67": 70,
            "PSA": 0,
            "Sinaptofisina": 2,
            "Cromogranina": 0,
            "CD56": 2,
            "S100": 1,
            "SOX10": 0,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 0
        }
    },
    {
        "id": "diag-lung-sclc",
        "code": "LUNG_SCLC",
        "name_en": "Small Cell Lung Carcinoma (SCLC)",
        "name_es": "Carcinoma Pulmonar de Células Pequeñas",
        "organ": "Pulmón / Tórax",
        "category": "Neuroendocrino",
        "icd": "8041/3",
        "meta_en": "Synaptophysin+, Chromogranin+, CD56+, TTF-1+, Ki-67 >80%, p40- • ICD-O: 8041/3",
        "meta_es": "Sinaptofisina+, Cromogranina+, CD56+, TTF-1+, Ki-67 >80%, p40- • ICD-O: 8041/3",
        "aliases": [
            "small cell lung carcinoma",
            "carcinoma pulmonar de celulas pequeñas",
            "microcitico",
            "sclc",
            "8041/3"
        ],
        "profile": {
            "CK7": 30,
            "CK20": 10,
            "TTF-1": 85,
            "p40": 1,
            "p63": 2,
            "GATA3": 0,
            "CDX2": 5,
            "Claudin-4": 30,
            "Calretinin": 10,
            "WT1": 0,
            "Napsin A": 0,
            "MOC-31": 85,
            "ER": 0,
            "PR": 0,
            "HER2": 0,
            "Ki-67": 95,
            "PSA": 0,
            "Sinaptofisina": 92,
            "Cromogranina": 78,
            "CD56": 96,
            "S100": 5,
            "SOX10": 2,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 0
        }
    },
    {
        "id": "diag-meso-epithelioid",
        "code": "MESO_EPITH",
        "name_en": "Malignant Pleural Mesothelioma, epithelioid",
        "name_es": "Mesotelioma Pleural Maligno Epitelioide",
        "organ": "Pleura / Peritoneo",
        "category": "Mesotelial",
        "icd": "9052/3",
        "meta_en": "Calretinin+, WT1+, D2-40+, CK7+, Claudin-4-, TTF-1-, BAP1 Loss • ICD-O: 9052/3",
        "meta_es": "Calretinina+, WT1+, D2-40+, CK7+, Claudina-4-, TTF-1-, Pérdida BAP1 • ICD-O: 9052/3",
        "aliases": [
            "mesotelioma epitelioide",
            "mesotelioma pleural",
            "epithelioid mesothelioma",
            "pleura",
            "calretinina",
            "9052/3"
        ],
        "profile": {
            "CK7": 95,
            "CK20": 2,
            "TTF-1": 0,
            "p40": 2,
            "p63": 15,
            "GATA3": 5,
            "CDX2": 1,
            "Claudin-4": 0,
            "Calretinin": 98,
            "WT1": 85,
            "D2-40": 90,
            "BAP1": 30,
            "MOC-31": 5,
            "Napsin A": 0,
            "ER": 5,
            "PR": 0,
            "HER2": 0,
            "Ki-67": 35,
            "PSA": 0,
            "Sinaptofisina": 2,
            "Cromogranina": 0,
            "CD56": 10,
            "S100": 2,
            "SOX10": 0,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 15,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 0
        }
    },
    {
        "id": "diag-meso-sarcomatoid",
        "code": "MESO_SARC",
        "name_en": "Sarcomatoid Mesothelioma",
        "name_es": "Mesotelioma Pleural Sarcomatoide",
        "organ": "Pleura",
        "category": "Mesotelial",
        "icd": "9051/3",
        "meta_en": "AE1/AE3+, D2-40+, Calretinin (variable 30-50%), Claudin-4-, Desmin- • ICD-O: 9051/3",
        "meta_es": "AE1/AE3+, D2-40+, Calretinina (variable 30-50%), Claudina-4-, Desmina- • ICD-O: 9051/3",
        "aliases": [
            "mesotelioma sarcomatoide",
            "sarcomatoid mesothelioma",
            "pleura sarcomatoide",
            "9051/3"
        ],
        "profile": {
            "CK7": 60,
            "CK20": 0,
            "TTF-1": 0,
            "p40": 5,
            "p63": 10,
            "Claudin-4": 0,
            "Calretinin": 40,
            "WT1": 20,
            "D2-40": 75,
            "BAP1": 20,
            "Vimentin": 98,
            "Desmina": 5,
            "SMA": 25,
            "S100": 2,
            "CD34": 0,
            "CD45": 0
        }
    },
    {
        "id": "diag-urothelial-ca",
        "code": "UROTHELIAL",
        "name_en": "Invasive Urothelial Carcinoma (High Grade)",
        "name_es": "Carcinoma Urotelial Invasivo (Alto Grado)",
        "organ": "Vejiga / Vía Urinaria",
        "category": "Epitelial Maligno",
        "icd": "8120/3",
        "meta_en": "GATA3+, p63+, p40+, CK7+, CK20+, PAX8-, PSA- • Bladder / Ureter • ICD-O: 8120/3",
        "meta_es": "GATA3+, p63+, p40+, CK7+, CK20+, PAX8-, PSA- • Vejiga / Uréter • ICD-O: 8120/3",
        "aliases": [
            "carcinoma urotelial",
            "urothelial carcinoma",
            "vejiga",
            "urotelio",
            "gata3",
            "8120/3"
        ],
        "profile": {
            "CK7": 90,
            "CK20": 65,
            "TTF-1": 2,
            "p40": 80,
            "p63": 88,
            "GATA3": 90,
            "CDX2": 10,
            "Claudin-4": 95,
            "Calretinin": 5,
            "WT1": 2,
            "MOC-31": 85,
            "ER": 5,
            "PR": 0,
            "HER2": 20,
            "Ki-67": 60,
            "PSA": 0,
            "Sinaptofisina": 8,
            "Cromogranina": 4,
            "CD56": 5,
            "S100": 1,
            "SOX10": 0,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 2
        }
    },
    {
        "id": "diag-breast-ductal",
        "code": "BREAST_DUCTAL",
        "name_en": "Invasive Breast Carcinoma (NST / Ductal)",
        "name_es": "Carcinoma Ductal Invasivo de Mama (NST)",
        "organ": "Mama",
        "category": "Epitelial Maligno",
        "icd": "8500/3",
        "meta_en": "GATA3+, Mammaglobin+, GCDFP-15+, CK7+, ER+, PR+, HER2 (var) • ICD-O: 8500/3",
        "meta_es": "GATA3+, Mamaglobina+, GCDFP-15+, CK7+, RE+, RP+, HER2 (var) • ICD-O: 8500/3",
        "aliases": [
            "carcinoma de mama ductal",
            "invasive breast carcinoma",
            "cancer de mama",
            "mama ductal",
            "8500/3"
        ],
        "profile": {
            "CK7": 96,
            "CK20": 2,
            "TTF-1": 1,
            "p40": 1,
            "p63": 2,
            "GATA3": 95,
            "CDX2": 1,
            "Claudin-4": 98,
            "Calretinin": 3,
            "WT1": 8,
            "Mammaglobin": 70,
            "GCDFP-15": 55,
            "ER": 78,
            "PR": 65,
            "HER2": 20,
            "TRPS1": 95,
            "Ki-67": 30,
            "PSA": 0,
            "Sinaptofisina": 5,
            "Cromogranina": 2,
            "CD56": 2,
            "S100": 5,
            "SOX10": 2,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 1
        }
    },
    {
        "id": "diag-breast-lobular",
        "code": "BREAST_LOBULAR",
        "name_en": "Invasive Lobular Carcinoma of Breast",
        "name_es": "Carcinoma Lobulillar Infiltrante de Mama",
        "organ": "Mama",
        "category": "Epitelial Maligno",
        "icd": "8520/3",
        "meta_en": "E-Cadherin Loss (-), GATA3+, ER+ (>95%), PR+, CK7+, p120 Cytoplasmic • ICD-O: 8520/3",
        "meta_es": "Pérdida de E-Cadherina (-), GATA3+, RE+ (>95%), RP+, CK7+, p120 citoplásmico • ICD-O: 8520/3",
        "aliases": [
            "carcinoma lobulillar",
            "invasive lobular carcinoma",
            "lobulillar mama",
            "e-cadherina",
            "8520/3"
        ],
        "profile": {
            "CK7": 95,
            "CK20": 2,
            "GATA3": 95,
            "ER": 95,
            "PR": 75,
            "HER2": 5,
            "TRPS1": 92,
            "Mammaglobin": 65,
            "GCDFP-15": 50,
            "Ki-67": 20,
            "TTF-1": 0,
            "p40": 0,
            "CDX2": 0,
            "PAX8": 0
        }
    },
    {
        "id": "diag-breast-tnbc",
        "code": "BREAST_TNBC",
        "name_en": "Triple-Negative / Metaplastic Breast Carcinoma",
        "name_es": "Carcinoma de Mama Triple Negativo / Metaplásico",
        "organ": "Mama",
        "category": "Epitelial Maligno",
        "icd": "8575/3",
        "meta_en": "TRPS1+, SOX10 (var), p63 (var), ER-, PR-, HER2 (0), Ki-67 high (>60%) • ICD-O: 8575/3",
        "meta_es": "TRPS1+, SOX10 (var), p63 (var), RE-, RP-, HER2 (0), Ki-67 alto (>60%) • ICD-O: 8575/3",
        "aliases": [
            "triple negativo",
            "triple negative breast cancer",
            "tnbc",
            "metaplasico",
            "8575/3"
        ],
        "profile": {
            "CK7": 80,
            "CK20": 0,
            "TRPS1": 88,
            "GATA3": 40,
            "ER": 0,
            "PR": 0,
            "HER2": 0,
            "Ki-67": 80,
            "p63": 45,
            "SOX10": 35,
            "p40": 20,
            "Claudin-4": 75,
            "TTF-1": 0,
            "PAX8": 0
        }
    },
    {
        "id": "diag-colon-adeno",
        "code": "COLON_ADENO",
        "name_en": "Colorectal Adenocarcinoma",
        "name_es": "Adenocarcinoma Colorrectal",
        "organ": "Colon / Recto",
        "category": "Epitelial Maligno",
        "icd": "8140/3",
        "meta_en": "CK20+, CDX2+, SATB2+, CK7-, TTF-1-, GATA3- • GI Lower • ICD-O: 8140/3",
        "meta_es": "CK20+, CDX2+, SATB2+, CK7-, TTF-1-, GATA3- • GI Inferior • ICD-O: 8140/3",
        "aliases": [
            "adenocarcinoma colorrectal",
            "colorectal adenocarcinoma",
            "colon",
            "recto",
            "cdx2",
            "8140/3"
        ],
        "profile": {
            "CK7": 8,
            "CK20": 95,
            "CDX2": 98,
            "SATB2": 95,
            "TTF-1": 0,
            "p40": 0,
            "p63": 1,
            "GATA3": 1,
            "Claudin-4": 98,
            "Calretinin": 2,
            "WT1": 0,
            "MOC-31": 95,
            "ER": 0,
            "PR": 0,
            "HER2": 5,
            "Ki-67": 70,
            "PSA": 0,
            "Sinaptofisina": 4,
            "Cromogranina": 2,
            "CD56": 2,
            "S100": 1,
            "SOX10": 0,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 1
        }
    },
    {
        "id": "diag-renal-cc",
        "code": "RENAL_CC",
        "name_en": "Clear Cell Renal Cell Carcinoma (ccRCC)",
        "name_es": "Carcinoma Renal de Células Claras",
        "organ": "Riñón",
        "category": "Epitelial Maligno",
        "icd": "8310/3",
        "meta_en": "PAX8+, Vimentin+, CAIX+ (box-like), CD10+, CK7-, CK20- • Kidney • ICD-O: 8310/3",
        "meta_es": "PAX8+, Vimentina+, CAIX+ (caja), CD10+, CK7-, CK20- • Riñón • ICD-O: 8310/3",
        "aliases": [
            "carcinoma renal de celulas claras",
            "clear cell rcc",
            "riñon",
            "pax8",
            "8310/3"
        ],
        "profile": {
            "PAX8": 98,
            "Vimentin": 95,
            "CK7": 8,
            "CK20": 2,
            "TTF-1": 0,
            "p40": 0,
            "p63": 1,
            "GATA3": 2,
            "CDX2": 1,
            "Claudin-4": 20,
            "Calretinin": 2,
            "WT1": 2,
            "ER": 2,
            "PR": 5,
            "HER2": 0,
            "Ki-67": 25,
            "PSA": 0,
            "Sinaptofisina": 2,
            "Cromogranina": 0,
            "CD56": 10,
            "S100": 1,
            "SOX10": 0,
            "Melan-A": 2,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0
        }
    },
    {
        "id": "diag-renal-papillary",
        "code": "RENAL_PAP",
        "name_en": "Papillary Renal Cell Carcinoma (pRCC)",
        "name_es": "Carcinoma Renal Papilar",
        "organ": "Riñón",
        "category": "Epitelial Maligno",
        "icd": "8260/3",
        "meta_en": "PAX8+, CK7+ (diffuse in type 1), AMACR+ (P504S), CD10+, Vimentin+ • ICD-O: 8260/3",
        "meta_es": "PAX8+, CK7+ (difuso tipo 1), AMACR+ (P504S), CD10+, Vimentina+ • ICD-O: 8260/3",
        "aliases": [
            "carcinoma renal papilar",
            "papillary rcc",
            "riñon papilar",
            "amacr",
            "8260/3"
        ],
        "profile": {
            "PAX8": 95,
            "CK7": 85,
            "AMACR": 95,
            "Vimentin": 80,
            "CD10": 75,
            "CK20": 5,
            "TTF-1": 0,
            "p40": 0,
            "GATA3": 2,
            "CDX2": 0
        }
    },
    {
        "id": "diag-renal-chromophobe",
        "code": "RENAL_CHROM",
        "name_en": "Chromophobe Renal Cell Carcinoma (chRCC)",
        "name_es": "Carcinoma Renal Cromófobo",
        "organ": "Riñón",
        "category": "Epitelial Maligno",
        "icd": "8317/3",
        "meta_en": "CK7+ (diffuse strong), CD117+, Hale colloidal iron+, Vimentin-, CD10- • ICD-O: 8317/3",
        "meta_es": "CK7+ (difuso intenso), CD117+, Hierro coloidal Hale+, Vimentina-, CD10- • ICD-O: 8317/3",
        "aliases": [
            "carcinoma renal cromofobo",
            "chromophobe rcc",
            "cromofobo",
            "8317/3"
        ],
        "profile": {
            "PAX8": 90,
            "CK7": 98,
            "CD117": 85,
            "Vimentin": 5,
            "CD10": 15,
            "AMACR": 10,
            "CK20": 2,
            "TTF-1": 0
        }
    },
    {
        "id": "diag-renal-oncocytoma",
        "code": "RENAL_ONCO",
        "name_en": "Renal Oncocytoma (Benign)",
        "name_es": "Oncocitoma Renal (Benigno)",
        "organ": "Riñón",
        "category": "Epitelial Benigno",
        "icd": "8290/0",
        "meta_en": "CD117+, S100A1+, CK7- (scattered single cells only), Vimentin- • ICD-O: 8290/0",
        "meta_es": "CD117+, S100A1+, CK7- (células aisladas únicamente), Vimentina- • ICD-O: 8290/0",
        "aliases": [
            "oncocitoma renal",
            "renal oncocytoma",
            "oncocitoma",
            "8290/0"
        ],
        "profile": {
            "PAX8": 85,
            "CD117": 95,
            "CK7": 5,
            "Vimentin": 2,
            "AMACR": 10,
            "CD10": 30,
            "CK20": 0
        }
    },
    {
        "id": "diag-prostate-adeno",
        "code": "PROSTATE_ADENO",
        "name_en": "Prostate Adenocarcinoma (Acinar)",
        "name_es": "Adenocarcinoma Prostático Acinar",
        "organ": "Próstata",
        "category": "Epitelial Maligno",
        "icd": "8140/3",
        "meta_en": "PSA+, NKX3.1+, AMACR+ (P504S luminal), p63- (basal loss), p40- • ICD-O: 8140/3",
        "meta_es": "PSA+, NKX3.1+, AMACR+ (P504S luminal), p63- (pérdida basal), p40- • ICD-O: 8140/3",
        "aliases": [
            "adenocarcinoma prostatico",
            "prostate adenocarcinoma",
            "prostata",
            "psa",
            "amacr",
            "8140/3"
        ],
        "profile": {
            "PSA": 98,
            "NKX3.1": 98,
            "AMACR": 95,
            "p63": 0,
            "p40": 0,
            "PSMA": 90,
            "CK7": 5,
            "CK20": 3,
            "TTF-1": 0,
            "GATA3": 1,
            "CDX2": 1,
            "Claudin-4": 85,
            "Calretinin": 0,
            "WT1": 0,
            "MOC-31": 70,
            "ER": 0,
            "PR": 2,
            "HER2": 0,
            "Ki-67": 15,
            "Sinaptofisina": 5,
            "Cromogranina": 2,
            "CD56": 2,
            "S100": 1,
            "SOX10": 0,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 0
        }
    },
    {
        "id": "diag-prostate-ne",
        "code": "PROSTATE_NE",
        "name_en": "Small Cell / Neuroendocrine Carcinoma of Prostate",
        "name_es": "Carcinoma Neuroendocrino de Próstata",
        "organ": "Próstata",
        "category": "Neuroendocrino",
        "icd": "8246/3",
        "meta_en": "Synaptophysin+, Chromogranin+, CD56+, PSA low/absent, Ki-67 >80% • ICD-O: 8246/3",
        "meta_es": "Sinaptofisina+, Cromogranina+, CD56+, PSA bajo/ausente, Ki-67 >80% • ICD-O: 8246/3",
        "aliases": [
            "carcinoma neuroendocrino de prostata",
            "small cell prostate",
            "prostata neuroendocrina",
            "8246/3"
        ],
        "profile": {
            "Sinaptofisina": 90,
            "Cromogranina": 75,
            "CD56": 95,
            "PSA": 15,
            "NKX3.1": 25,
            "Ki-67": 85,
            "TTF-1": 50,
            "p40": 0,
            "p63": 0
        }
    },
    {
        "id": "diag-thyroid-papillary",
        "code": "THYROID_PAP",
        "name_en": "Papillary Thyroid Carcinoma (PTC)",
        "name_es": "Carcinoma Papilar de Tiroides",
        "organ": "Tiroides",
        "category": "Epitelial Maligno",
        "icd": "8260/3",
        "meta_en": "TTF-1+, PAX8+, CK7+, Thyroglobulin+, Galectin-3+, p40-, CK20- • ICD-O: 8260/3",
        "meta_es": "TTF-1+, PAX8+, CK7+, Tiroglobulina+, Galectina-3+, p40-, CK20- • ICD-O: 8260/3",
        "aliases": [
            "carcinoma papilar de tiroides",
            "papillary thyroid carcinoma",
            "tiroides",
            "ttf1",
            "8260/3"
        ],
        "profile": {
            "TTF-1": 99,
            "PAX8": 98,
            "CK7": 98,
            "CK20": 2,
            "p40": 0,
            "p63": 5,
            "GATA3": 2,
            "CDX2": 0,
            "Claudin-4": 90,
            "Calretinin": 5,
            "WT1": 0,
            "MOC-31": 90,
            "Napsin A": 3,
            "ER": 5,
            "PR": 5,
            "HER2": 0,
            "Ki-67": 10,
            "PSA": 0,
            "Sinaptofisina": 2,
            "Cromogranina": 0,
            "CD56": 10,
            "S100": 5,
            "SOX10": 0,
            "Melan-A": 0,
            "HMB-45": 0,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0
        }
    },
    {
        "id": "diag-thyroid-medullary",
        "code": "THYROID_MED",
        "name_en": "Medullary Thyroid Carcinoma (MTC)",
        "name_es": "Carcinoma Medular de Tiroides",
        "organ": "Tiroides",
        "category": "Neuroendocrino",
        "icd": "8345/3",
        "meta_en": "Calcitonin+, CEA+, Synaptophysin+, Chromogranin+, TTF-1+, Thyroglobulin- • ICD-O: 8345/3",
        "meta_es": "Calcitonina+, CEA+, Sinaptofisina+, Cromogranina+, TTF-1+, Tiroglobulina- • ICD-O: 8345/3",
        "aliases": [
            "carcinoma medular de tiroides",
            "medullary thyroid carcinoma",
            "calcitonina",
            "8345/3"
        ],
        "profile": {
            "TTF-1": 85,
            "Sinaptofisina": 95,
            "Cromogranina": 90,
            "CD56": 90,
            "CK7": 80,
            "PAX8": 60,
            "Calretinin": 20,
            "Ki-67": 20
        }
    },
    {
        "id": "diag-thyroid-anaplastic",
        "code": "THYROID_ANAPL",
        "name_en": "Anaplastic Thyroid Carcinoma (ATC)",
        "name_es": "Carcinoma Anaplásico de Tiroides",
        "organ": "Tiroides",
        "category": "Epitelial Maligno",
        "icd": "8021/3",
        "meta_en": "PAX8 (var 50-70%), p53 (diffuse >80%), TTF-1- / weak, Keratin AE1/AE3+ • ICD-O: 8021/3",
        "meta_es": "PAX8 (var 50-70%), p53 (difuso >80%), TTF-1- / débil, Queratina AE1/AE3+ • ICD-O: 8021/3",
        "aliases": [
            "carcinoma anaplasico de tiroides",
            "anaplastic thyroid carcinoma",
            "tiroides anaplasico",
            "8021/3"
        ],
        "profile": {
            "PAX8": 65,
            "TTF-1": 15,
            "Vimentin": 98,
            "Ki-67": 80,
            "p40": 10,
            "CK7": 40
        }
    },
    {
        "id": "diag-melanoma-malignant",
        "code": "MELANOMA",
        "name_en": "Malignant Melanoma (Metastatic / Primary)",
        "name_es": "Melanoma Maligno Metastásico",
        "organ": "Piel / Sitios Múltiples",
        "category": "Melanocítico",
        "icd": "8720/3",
        "meta_en": "SOX10+, S100+, Melan-A+, HMB-45+, PRAME+, Keratin-, p40- • ICD-O: 8720/3",
        "meta_es": "SOX10+, S100+, Melan-A+, HMB-45+, PRAME+, Queratina-, p40- • ICD-O: 8720/3",
        "aliases": [
            "melanoma maligno",
            "malignant melanoma",
            "melanoma metastasico",
            "sox10",
            "s100",
            "8720/3"
        ],
        "profile": {
            "SOX10": 99,
            "S100": 99,
            "Melan-A": 88,
            "HMB-45": 85,
            "CK7": 2,
            "CK20": 1,
            "TTF-1": 1,
            "p40": 0,
            "p63": 1,
            "GATA3": 2,
            "CDX2": 0,
            "Claudin-4": 0,
            "Calretinin": 10,
            "WT1": 15,
            "MOC-31": 2,
            "ER": 1,
            "PR": 1,
            "HER2": 0,
            "Ki-67": 50,
            "PSA": 0,
            "Sinaptofisina": 10,
            "Cromogranina": 2,
            "CD56": 25,
            "Desmina": 0,
            "CD34": 0,
            "CD45": 0,
            "PAX8": 0
        }
    },
    {
        "id": "diag-ovarian-serous",
        "code": "OVARIAN_SEROUS",
        "name_en": "High-Grade Serous Ovarian Carcinoma",
        "name_es": "Carcinoma Seroso de Alto Grado Ovárico",
        "organ": "Ovario / Trompa / Peritoneo",
        "category": "Epitelial Ginecológico",
        "icd": "8441/3",
        "meta_en": "PAX8+, WT1+, p53 (mutant), CK7+, ER+, Claudin-4+, Calretinin-, CK20- • ICD-O: 8441/3",
        "meta_es": "PAX8+, WT1+, p53 (mutado), CK7+, RE+, Claudina-4+, Calretinina-, CK20- • ICD-O: 8441/3",
        "aliases": [
            "carcinoma seroso de ovario",
            "high-grade serous ovarian carcinoma",
            "ovario seroso",
            "wt1",
            "8441/3"
        ],
        "profile": {
            "PAX8": 98,
            "WT1": 95,
            "CK7": 98,
            "ER": 80,
            "Claudin-4": 95,
            "MOC-31": 90,
            "Calretinin": 5,
            "CK20": 5,
            "CDX2": 3,
            "TTF-1": 1,
            "p40": 1,
            "GATA3": 5,
            "Ki-67": 65,
            "PSA": 0
        }
    },
    {
        "id": "diag-endometrial-ca",
        "code": "ENDOMETRIAL_CA",
        "name_en": "Endometrial Endometrioid Carcinoma",
        "name_es": "Carcinoma Endometrioide de Endometrio",
        "organ": "Útero / Endometrio",
        "category": "Epitelial Ginecológico",
        "icd": "8380/3",
        "meta_en": "PAX8+, ER+, PR+, Vimentin+, CK7+, WT1-, p16 (patchy), MMR (MLH1/MSH2) • ICD-O: 8380/3",
        "meta_es": "PAX8+, RE+, RP+, Vimentina+, CK7+, WT1-, p16 (parcheado), MMR • ICD-O: 8380/3",
        "aliases": [
            "carcinoma endometrioide",
            "endometrial carcinoma",
            "endometrio",
            "utero",
            "8380/3"
        ],
        "profile": {
            "PAX8": 95,
            "ER": 90,
            "PR": 85,
            "Vimentin": 85,
            "CK7": 95,
            "WT1": 5,
            "CK20": 10,
            "CDX2": 10,
            "Claudin-4": 90,
            "Calretinin": 2,
            "TTF-1": 0,
            "p40": 0
        }
    },
    {
        "id": "diag-gastric-adeno",
        "code": "GASTRIC_ADENO",
        "name_en": "Gastric Adenocarcinoma",
        "name_es": "Adenocarcinoma Gástrico",
        "organ": "Estómago",
        "category": "Epitelial Maligno",
        "icd": "8140/3",
        "meta_en": "CK7+ (var 60-70%), CK20+ (var 40-50%), CDX2+ (var), HER2 (15-20%), Claudin 18.2+ • ICD-O: 8140/3",
        "meta_es": "CK7+ (var 60-70%), CK20+ (var 40-50%), CDX2+ (var), HER2 (15-20%), Claudina 18.2+ • ICD-O: 8140/3",
        "aliases": [
            "adenocarcinoma gastrico",
            "gastric adenocarcinoma",
            "estomago",
            "gastrico",
            "her2",
            "8140/3"
        ],
        "profile": {
            "CK7": 65,
            "CK20": 45,
            "CDX2": 60,
            "Claudin-4": 95,
            "HER2": 18,
            "MOC-31": 85,
            "TTF-1": 1,
            "p40": 1,
            "GATA3": 1,
            "Calretinin": 2,
            "WT1": 0,
            "Ki-67": 55
        }
    },
    {
        "id": "diag-pancreas-ductal",
        "code": "PANCREAS_DUCTAL",
        "name_en": "Pancreatic Ductal Adenocarcinoma (PDAC)",
        "name_es": "Adenocarcinoma Ductal de Páncreas",
        "organ": "Páncreas",
        "category": "Epitelial Maligno",
        "icd": "8500/3",
        "meta_en": "CK7+, CK19+, MUC1+, CA19-9+, SMAD4 Loss (55%), CDX2- / weak, CK20- (var) • ICD-O: 8500/3",
        "meta_es": "CK7+, CK19+, MUC1+, CA19-9+, Pérdida SMAD4 (55%), CDX2- / débil, CK20- • ICD-O: 8500/3",
        "aliases": [
            "adenocarcinoma de pancreas",
            "pancreatic ductal adenocarcinoma",
            "pancreas",
            "pdac",
            "8500/3"
        ],
        "profile": {
            "CK7": 95,
            "CK20": 25,
            "CDX2": 20,
            "Claudin-4": 95,
            "MOC-31": 90,
            "TTF-1": 1,
            "p40": 1,
            "GATA3": 5,
            "Calretinin": 2,
            "WT1": 0,
            "PAX8": 2,
            "Ki-67": 45
        }
    },
    {
        "id": "diag-hepatocarcinoma",
        "code": "HEPATOCARCINOMA",
        "name_en": "Hepatocellular Carcinoma (HCC)",
        "name_es": "Carcinoma Hepatocelular / Hepatocarcinoma",
        "organ": "Hígado",
        "category": "Epitelial Maligno",
        "icd": "8170/3",
        "meta_en": "Arginase-1+ (>95%), HepPar-1+, Glypican-3+, CD34 (sinusoidal), CK7-, CK20- • ICD-O: 8170/3",
        "meta_es": "Arginasa-1+ (>95%), HepPar-1+, Glicipano-3+, CD34 (sinusoidal), CK7-, CK20- • ICD-O: 8170/3",
        "aliases": [
            "hepatocarcinoma",
            "hepatocellular carcinoma",
            "carcinoma hepatocelular",
            "higado",
            "arginase",
            "8170/3"
        ],
        "profile": {
            "Arginase-1": 96,
            "HepPar-1": 85,
            "Glypican-3": 70,
            "CD34": 85,
            "CK7": 15,
            "CK20": 5,
            "TTF-1": 0,
            "p40": 0,
            "p63": 0,
            "GATA3": 0,
            "CDX2": 2,
            "Claudin-4": 5,
            "Calretinin": 15,
            "WT1": 0,
            "MOC-31": 5,
            "Ki-67": 35
        }
    },
    {
        "id": "diag-cholangiocarcinoma",
        "code": "CHOLANGIOCARCINOMA",
        "name_en": "Intrahepatic Cholangiocarcinoma",
        "name_es": "Colangiocarcinoma Intrahepático",
        "organ": "Hígado / Vía Biliar",
        "category": "Epitelial Maligno",
        "icd": "8160/3",
        "meta_en": "CK7+, CK19+, MOC-31+, Claudin-4+, Arginase-1-, HepPar-1- • ICD-O: 8160/3",
        "meta_es": "CK7+, CK19+, MOC-31+, Claudina-4+, Arginasa-1-, HepPar-1- • ICD-O: 8160/3",
        "aliases": [
            "colangiocarcinoma",
            "cholangiocarcinoma",
            "via biliar",
            "higado adenocarcinoma",
            "8160/3"
        ],
        "profile": {
            "CK7": 95,
            "CK20": 20,
            "Claudin-4": 95,
            "MOC-31": 90,
            "Arginase-1": 0,
            "HepPar-1": 5,
            "Glypican-3": 10,
            "CDX2": 20,
            "TTF-1": 0
        }
    },
    {
        "id": "diag-net-well-diff",
        "code": "NET_WELL_DIFF",
        "name_en": "Well-Differentiated Neuroendocrine Tumor (NET G1-G2 / Carcinoid)",
        "name_es": "Tumor Neuroendocrino Bien Diferenciado (NET G1-G2)",
        "organ": "GEP / Pulmón",
        "category": "Neuroendocrino",
        "icd": "8240/3",
        "meta_en": "Synaptophysin+ (diffuse), Chromogranin+ (diffuse), CD56+, Ki-67 <20% • ICD-O: 8240/3",
        "meta_es": "Sinaptofisina+ (difuso), Cromogranina+ (difuso), CD56+, Ki-67 <20% • ICD-O: 8240/3",
        "aliases": [
            "tumor neuroendocrino",
            "net",
            "carcinoide",
            "neuroendocrine tumor",
            "8240/3"
        ],
        "profile": {
            "Sinaptofisina": 98,
            "Cromogranina": 92,
            "CD56": 95,
            "Ki-67": 5,
            "CK7": 50,
            "CK20": 20,
            "TTF-1": 35,
            "p40": 0,
            "p63": 0
        }
    },
    {
        "id": "diag-gist",
        "code": "GIST",
        "name_en": "Gastrointestinal Stromal Tumor (GIST)",
        "name_es": "Tumor del Estroma Gastrointestinal (GIST)",
        "organ": "Tubo Digestivo",
        "category": "Mesenquimal",
        "icd": "8936/3",
        "meta_en": "CD117+ (c-Kit 95%), DOG1+ (>98%), CD34+ (70%), SMA (var 30%), S100- • ICD-O: 8936/3",
        "meta_es": "CD117+ (c-Kit 95%), DOG1+ (>98%), CD34+ (70%), SMA (var 30%), S100- • ICD-O: 8936/3",
        "aliases": [
            "gist",
            "tumor del estroma gastrointestinal",
            "cd117",
            "dog1",
            "8936/3"
        ],
        "profile": {
            "CD117": 95,
            "DOG1": 98,
            "CD34": 72,
            "SMA": 30,
            "Desmina": 3,
            "S100": 8,
            "SOX10": 0,
            "CK7": 0,
            "CK20": 0,
            "p40": 0,
            "CD45": 0
        }
    },
    {
        "id": "diag-leiomyosarcoma",
        "code": "LEIOMYOSARCOMA",
        "name_en": "Leiomyosarcoma",
        "name_es": "Leiomiosarcoma",
        "organ": "Partes Blandas / Útero / Retroperitoneo",
        "category": "Mesenquimal",
        "icd": "8890/3",
        "meta_en": "SMA+ (diffuse), Desmin+ (70-80%), Caldesmon+, CD117-, DOG1-, S100- • ICD-O: 8890/3",
        "meta_es": "SMA+ (difuso), Desmina+ (70-80%), Caldesmón+, CD117-, DOG1-, S100- • ICD-O: 8890/3",
        "aliases": [
            "leiomiosarcoma",
            "leiomyosarcoma",
            "sarcoma musculo liso",
            "desmina",
            "sma",
            "8890/3"
        ],
        "profile": {
            "SMA": 98,
            "Desmina": 75,
            "Vimentin": 98,
            "CD117": 5,
            "DOG1": 0,
            "S100": 3,
            "SOX10": 0,
            "CD34": 10,
            "CK7": 5,
            "p40": 0
        }
    },
    {
        "id": "diag-ups",
        "code": "UPS",
        "name_en": "Undifferentiated Pleomorphic Sarcoma (UPS)",
        "name_es": "Sarcoma Pleomórfico Indiferenciado (UPS)",
        "organ": "Partes Blandas",
        "category": "Mesenquimal",
        "icd": "8802/3",
        "meta_en": "Diagnosis of exclusion: Vimentin+, CD68+, Keratins-, Desmin-, S100-, Melan-A- • ICD-O: 8802/3",
        "meta_es": "Diagnóstico de exclusión: Vimentina+, CD68+, Queratinas-, Desmina-, S100- • ICD-O: 8802/3",
        "aliases": [
            "sarcoma pleomorfico indiferenciado",
            "ups",
            "histiocitoma fibroso maligno",
            "mfh",
            "8802/3"
        ],
        "profile": {
            "Vimentin": 99,
            "SMA": 25,
            "Desmina": 5,
            "S100": 2,
            "SOX10": 0,
            "CK7": 2,
            "p40": 0,
            "CD34": 5,
            "CD45": 0,
            "Melan-A": 0
        }
    },
    {
        "id": "diag-rhabdomyosarcoma",
        "code": "RHABDOMYO",
        "name_en": "Rhabdomyosarcoma (Embryonal / Alveolar)",
        "name_es": "Rabdomiosarcoma",
        "organ": "Partes Blandas",
        "category": "Mesenquimal",
        "icd": "8910/3",
        "meta_en": "Myogenin+ (nuclear), MyoD1+, Desmin+, SMA-, Keratins-, CD45- • ICD-O: 8910/3",
        "meta_es": "Miogenina+ (nuclear), MyoD1+, Desmina+, SMA-, Queratinas-, CD45- • ICD-O: 8910/3",
        "aliases": [
            "rabdomiosarcoma",
            "rhabdomyosarcoma",
            "miogenina",
            "myf4",
            "8910/3"
        ],
        "profile": {
            "Miogenina": 98,
            "Desmina": 95,
            "Vimentin": 98,
            "SMA": 15,
            "S100": 5,
            "CK7": 2,
            "CD45": 0
        }
    },
    {
        "id": "diag-sft",
        "code": "SFT",
        "name_en": "Solitary Fibrous Tumor (SFT)",
        "name_es": "Tumor Fibroso Solitario",
        "organ": "Pleura / Partes Blandas",
        "category": "Mesenquimal",
        "icd": "8815/3",
        "meta_en": "STAT6+ (diffuse strong nuclear), CD34+, CD99+, BCL-2+, Keratin-, Desmin- • ICD-O: 8815/3",
        "meta_es": "STAT6+ (nuclear difuso intenso), CD34+, CD99+, BCL-2+, Queratina-, Desmina- • ICD-O: 8815/3",
        "aliases": [
            "tumor fibroso solitario",
            "solitary fibrous tumor",
            "sft",
            "stat6",
            "cd34",
            "8815/3"
        ],
        "profile": {
            "CD34": 92,
            "Vimentin": 98,
            "Desmina": 2,
            "S100": 2,
            "CK7": 1,
            "p40": 0,
            "Calretinin": 5
        }
    },
    {
        "id": "diag-schwannoma",
        "code": "SCHWANNOMA",
        "name_en": "Schwannoma (Benign Nerve Sheath Tumor)",
        "name_es": "Schwannoma Benigno",
        "organ": "Nervio Periférico",
        "category": "Neural",
        "icd": "9560/0",
        "meta_en": "S100+ (diffuse 100%), SOX10+, Calretinin+, CD34 (capsule), Keratins-, Desmin- • ICD-O: 9560/0",
        "meta_es": "S100+ (difuso 100%), SOX10+, Calretinina+, CD34 (cápsula), Queratinas- • ICD-O: 9560/0",
        "aliases": [
            "schwannoma",
            "neurilemoma",
            "nervio periferico",
            "s100",
            "sox10",
            "9560/0"
        ],
        "profile": {
            "S100": 100,
            "SOX10": 98,
            "Calretinin": 80,
            "CD34": 25,
            "Vimentin": 98,
            "CK7": 0,
            "Desmina": 0,
            "Melan-A": 0
        }
    },
    {
        "id": "diag-mpnst",
        "code": "MPNST",
        "name_en": "Malignant Peripheral Nerve Sheath Tumor (MPNST)",
        "name_es": "Tumor Maligno de Vaina de Nervio Periférico",
        "organ": "Nervio Periférico",
        "category": "Neural / Sarcoma",
        "icd": "9540/3",
        "meta_en": "S100 (patchy/reduced 50%), SOX10 (reduced), H3K27me3 Loss (60-80%), Desmin- • ICD-O: 9540/3",
        "meta_es": "S100 (parcheado/reducido 50%), SOX10 (reducido), Pérdida H3K27me3 (60-80%) • ICD-O: 9540/3",
        "aliases": [
            "mpnst",
            "tumor maligno de vaina de nervio periferico",
            "schwannoma maligno",
            "9540/3"
        ],
        "profile": {
            "S100": 50,
            "SOX10": 45,
            "Vimentin": 98,
            "Desmina": 5,
            "SMA": 20,
            "CD34": 20,
            "CK7": 5
        }
    },
    {
        "id": "diag-dlbcl",
        "code": "DLBCL",
        "name_en": "Diffuse Large B-Cell Lymphoma (DLBCL)",
        "name_es": "Linfoma Difuso de Células B Grandes",
        "organ": "Ganglio Linfático / Extranodal",
        "category": "Hematolinfoide",
        "icd": "9680/3",
        "meta_en": "CD20+, CD79a+, CD45+ (LCA), PAX5+, Ki-67 high (>70%), Keratins-, S100- • ICD-O: 9680/3",
        "meta_es": "CD20+, CD79a+, CD45+ (LCA), PAX5+, Ki-67 alto (>70%), Queratinas-, S100- • ICD-O: 9680/3",
        "aliases": [
            "dlbcl",
            "linfoma difuso de celulas b grandes",
            "linfoma b",
            "cd20",
            "9680/3"
        ],
        "profile": {
            "CD20": 98,
            "CD45": 96,
            "Ki-67": 85,
            "CD3": 2,
            "CK7": 0,
            "CK20": 0,
            "p40": 0,
            "TTF-1": 0,
            "S100": 0,
            "Melan-A": 0,
            "Desmina": 0
        }
    },
    {
        "id": "diag-hodgkin-classic",
        "code": "HODGKIN_CLASSIC",
        "name_en": "Classical Hodgkin Lymphoma (CHL)",
        "name_es": "Linfoma de Hodgkin Clásico",
        "organ": "Ganglio Linfático",
        "category": "Hematolinfoide",
        "icd": "9650/3",
        "meta_en": "Reed-Sternberg: CD30+ (membranous & Golgi), CD15+ (75-85%), PAX5 (dim), CD20- / weak, CD45- • ICD-O: 9650/3",
        "meta_es": "Reed-Sternberg: CD30+ (membrana y Golgi), CD15+ (75-85%), PAX5 (débil), CD20-, CD45- • ICD-O: 9650/3",
        "aliases": [
            "linfoma de hodgkin",
            "classical hodgkin lymphoma",
            "reed sternberg",
            "cd30",
            "9650/3"
        ],
        "profile": {
            "CD45": 5,
            "CD20": 15,
            "CD3": 2,
            "Ki-67": 85,
            "CK7": 0,
            "S100": 0
        }
    },
    {
        "id": "diag-seminoma",
        "code": "SEMINOMA",
        "name_en": "Testicular Seminoma",
        "name_es": "Seminoma Testicular",
        "organ": "Testículo / Mediastino",
        "category": "Germinal",
        "icd": "9061/3",
        "meta_en": "SALL4+, OCT4+, CD117+ (c-Kit), D2-40+, Keratins (weak/dot-like), CD45-, CD30- • ICD-O: 9061/3",
        "meta_es": "SALL4+, OCT4+, CD117+ (c-Kit), D2-40+, Queratinas (débil/punto), CD45-, CD30- • ICD-O: 9061/3",
        "aliases": [
            "seminoma",
            "testicular seminoma",
            "germinoma",
            "sall4",
            "cd117",
            "9061/3"
        ],
        "profile": {
            "CD117": 95,
            "D2-40": 95,
            "CD45": 0,
            "CK7": 2,
            "p40": 0,
            "TTF-1": 0,
            "S100": 0,
            "Ki-67": 90
        }
    },
    {
        "id": "diag-merkel-ca",
        "code": "MERKEL_CA",
        "name_en": "Merkel Cell Carcinoma (Primary Neuroendocrine Skin)",
        "name_es": "Carcinoma de Células de Merkel",
        "organ": "Piel",
        "category": "Neuroendocrino",
        "icd": "8247/3",
        "meta_en": "CK20+ (perinuclear dot-like), Synaptophysin+, Chromogranin+, CD56+, TTF-1-, CK7- • ICD-O: 8247/3",
        "meta_es": "CK20+ (patrón paranuclear en gota), Sinaptofisina+, Cromogranina+, CD56+, TTF-1-, CK7- • ICD-O: 8247/3",
        "aliases": [
            "carcinoma de celulas de merkel",
            "merkel cell carcinoma",
            "piel neuroendocrino",
            "ck20",
            "8247/3"
        ],
        "profile": {
            "CK20": 96,
            "Sinaptofisina": 95,
            "Cromogranina": 85,
            "CD56": 95,
            "CK7": 5,
            "TTF-1": 1,
            "p40": 0,
            "S100": 5,
            "Melan-A": 0,
            "CD45": 0,
            "Ki-67": 90
        }
    },
    {
        "id": "diag-adrenocortical-ca",
        "code": "ADRENAL_CA",
        "name_en": "Adrenocortical Carcinoma (ACC)",
        "name_es": "Carcinoma Adrenocortical",
        "organ": "Glándula Suprarrenal",
        "category": "Epitelial / Endocrino",
        "icd": "8370/3",
        "meta_en": "Steroidogenic Factor-1 (SF-1)+, Melan-A+, Calretinin+, Synaptophysin+, Chromogranin-, Keratins (weak/absent) • ICD-O: 8370/3",
        "meta_es": "Factor esteroidogénico SF-1+, Melan-A+, Calretinina+, Sinaptofisina+, Cromogranina-, Queratinas- • ICD-O: 8370/3",
        "aliases": [
            "carcinoma adrenocortical",
            "adrenocortical carcinoma",
            "suprarrenal",
            "sf1",
            "8370/3"
        ],
        "profile": {
            "Melan-A": 85,
            "Calretinin": 80,
            "Sinaptofisina": 80,
            "Cromogranina": 2,
            "CK7": 5,
            "CK20": 0,
            "p40": 0,
            "TTF-1": 0,
            "S100": 5,
            "PAX8": 5
        }
    },
    {
        "id": "diag-pheochromocytoma",
        "code": "PHEOCHROMO",
        "name_en": "Pheochromocytoma / Paraganglioma",
        "name_es": "Feocromocitoma / Paraganglioma",
        "organ": "Glándula Suprarrenal / Médula",
        "category": "Neuroendocrino",
        "icd": "8700/3",
        "meta_en": "Chromogranin+ (intense), Synaptophysin+, S100+ (sustentacular cells), Keratins-, Melan-A- • ICD-O: 8700/3",
        "meta_es": "Cromogranina+ (intenso), Sinaptofisina+, S100+ (células sustentaculares), Queratinas-, Melan-A- • ICD-O: 8700/3",
        "aliases": [
            "feocromocitoma",
            "pheochromocytoma",
            "paraganglioma",
            "medula suprarrenal",
            "8700/3"
        ],
        "profile": {
            "Cromogranina": 98,
            "Sinaptofisina": 98,
            "S100": 95,
            "CD56": 95,
            "CK7": 0,
            "CK20": 0,
            "Melan-A": 2,
            "Calretinin": 5
        }
    },
    {
        "id": "diag-thymoma",
        "code": "THYMOMA",
        "name_en": "Thymoma / Thymic Carcinoma",
        "name_es": "Timoma / Carcinoma Tímico",
        "organ": "Timo / Mediastino",
        "category": "Epitelial",
        "icd": "8580/3",
        "meta_en": "p40+, p63+, CK5/6+, CD5+ (in thymic carcinoma), TTF-1-, Claudin-4+ • ICD-O: 8580/3",
        "meta_es": "p40+, p63+, CK5/6+, CD5+ (en carcinoma tímico), TTF-1-, Claudina-4+ • ICD-O: 8580/3",
        "aliases": [
            "timoma",
            "carcinoma timico",
            "thymoma",
            "thymic carcinoma",
            "mediastino",
            "8580/3"
        ],
        "profile": {
            "p40": 85,
            "p63": 90,
            "CK7": 60,
            "TTF-1": 1,
            "Claudin-4": 85,
            "Calretinin": 5,
            "CD5": 70,
            "CD3": 80
        }
    },
    {
        "id": "diag-carcinoma-undiff",
        "code": "CARCINOMA_UNDIFF",
        "name_en": "Undifferentiated / Anaplastic Carcinoma NOS",
        "name_es": "Carcinoma Indiferenciado / Anaplásico NOS",
        "organ": "Sitios Varios / Metástasis",
        "category": "Epitelial Maligno",
        "icd": "8020/3",
        "meta_en": "Pan-Cytokeratin (AE1/AE3)+, Claudin-4+ (usually), S100-, Melan-A-, CD45-, Desmin- • ICD-O: 8020/3",
        "meta_es": "Pan-Citoqueratina (AE1/AE3)+, Claudina-4+ (habitual), S100-, Melan-A-, CD45-, Desmina- • ICD-O: 8020/3",
        "aliases": [
            "carcinoma indiferenciado",
            "anaplasico nos",
            "undifferentiated carcinoma",
            "8020/3"
        ],
        "profile": {
            "Claudin-4": 80,
            "CK7": 30,
            "CK20": 15,
            "S100": 2,
            "Melan-A": 0,
            "CD45": 0,
            "Desmina": 0,
            "Vimentin": 75
        }
    },
    {
        "id": "diag-thyroid-follicular",
        "code": "THYROID_FOLLICULAR",
        "name_en": "Follicular Thyroid Carcinoma",
        "name_es": "Carcinoma Folicular de Tiroides",
        "organ": "Tiroides",
        "category": "Epitelial Maligno",
        "icd": "8330/3",
        "meta_en": "TTF-1+, PAX8+, Thyroglobulin+, CK7+, Galectin-3 (weak/var), p40- • ICD-O: 8330/3",
        "meta_es": "TTF-1+, PAX8+, Tiroglobulina+, CK7+, Galectina-3 (débil/var), p40- • ICD-O: 8330/3",
        "aliases": [
            "carcinoma folicular de tiroides",
            "follicular thyroid carcinoma",
            "tiroides folicular",
            "8330/3"
        ],
        "profile": {
            "TTF-1": 98,
            "PAX8": 95,
            "CK7": 95,
            "CK20": 0,
            "p40": 0,
            "p63": 0,
            "Ki-67": 15
        }
    },
    {
        "id": "diag-angiosarcoma",
        "code": "ANGIOSARCOMA",
        "name_en": "Angiosarcoma",
        "name_es": "Angiosarcoma",
        "organ": "Partes Blandas / Piel / Mama",
        "category": "Vascular / Sarcoma",
        "icd": "9120/3",
        "meta_en": "CD31+ (>95%), ERG+, CD34+ (var 70%), Factor VIII+, Keratins (var 20-30%), S100- • ICD-O: 9120/3",
        "meta_es": "CD31+ (>95%), ERG+, CD34+ (var 70%), Factor VIII+, Queratinas (var 20-30%), S100- • ICD-O: 9120/3",
        "aliases": [
            "angiosarcoma",
            "sarcoma vascular",
            "cd31",
            "erg",
            "9120/3"
        ],
        "profile": {
            "CD31": 98,
            "CD34": 75,
            "Vimentin": 98,
            "CK7": 20,
            "S100": 0,
            "Desmina": 0,
            "Melan-A": 0
        }
    },
    {
        "id": "diag-synovial-sarcoma",
        "code": "SYNOVIAL_SARC",
        "name_en": "Synovial Sarcoma (Monophasic / Biphasic)",
        "name_es": "Sarcoma Sinovial",
        "organ": "Partes Blandas",
        "category": "Mesenquimal",
        "icd": "9040/3",
        "meta_en": "TLE-1+ (diffuse nuclear), SSX-SS18 fusion, Keratins (patchy/focal), EMA+, CD99+, S100 (var 30%) • ICD-O: 9040/3",
        "meta_es": "TLE-1+ (nuclear difuso), Fusión SS18-SSX, Queratinas (focal), EMA+, CD99+, S100 (var 30%) • ICD-O: 9040/3",
        "aliases": [
            "sarcoma sinovial",
            "synovial sarcoma",
            "tle1",
            "9040/3"
        ],
        "profile": {
            "Vimentin": 98,
            "CK7": 50,
            "CD99": 85,
            "S100": 30,
            "CD34": 2,
            "Desmina": 2,
            "SMA": 15
        }
    },
    {
        "id": "diag-ewing-sarcoma",
        "code": "EWING_SARC",
        "name_en": "Ewing Sarcoma / PNET",
        "name_es": "Sarcoma de Ewing / PNET",
        "organ": "Hueso / Partes Blandas",
        "category": "Neuroectodérmico",
        "icd": "9260/3",
        "meta_en": "CD99+ (intense diffuse membranous), FLI-1+, NKX2.2+, Keratins (var 20%), CD45-, Desmin- • ICD-O: 9260/3",
        "meta_es": "CD99+ (membranoso difuso intenso), FLI-1+, NKX2.2+, Queratinas (var 20%), CD45-, Desmina- • ICD-O: 9260/3",
        "aliases": [
            "sarcoma de ewing",
            "ewing sarcoma",
            "pnet",
            "cd99",
            "fli1",
            "9260/3"
        ],
        "profile": {
            "CD99": 98,
            "Vimentin": 98,
            "Sinaptofisina": 25,
            "CK7": 15,
            "CD45": 0,
            "Desmina": 0,
            "S100": 10
        }
    },
    {
        "id": "diag-dediff-liposarcoma",
        "code": "DEDIFF_LIPOSARC",
        "name_en": "Dedifferentiated Liposarcoma (DDLPS)",
        "name_es": "Liposarcoma Desdiferenciado",
        "organ": "Retroperitoneo / Partes Blandas",
        "category": "Mesenquimal",
        "icd": "8858/3",
        "meta_en": "MDM2+ (diffuse nuclear), CDK4+, p16+, S100- (in dediff areas), Keratins-, Desmin- • ICD-O: 8858/3",
        "meta_es": "MDM2+ (nuclear difuso), CDK4+, p16+, S100- (en áreas desdiferenciadas), Queratinas-, Desmina- • ICD-O: 8858/3",
        "aliases": [
            "liposarcoma desdiferenciado",
            "dedifferentiated liposarcoma",
            "mdm2",
            "retroperitoneo",
            "8858/3"
        ],
        "profile": {
            "Vimentin": 98,
            "SMA": 25,
            "S100": 15,
            "Desmina": 5,
            "CK7": 2,
            "CD34": 10,
            "CD45": 0
        }
    },
    {
        "id": "diag-follicular-lymphoma",
        "code": "FOLLICULAR_LYMPH",
        "name_en": "Follicular Lymphoma",
        "name_es": "Linfoma Folicular",
        "organ": "Ganglio Linfático",
        "category": "Hematolinfoide",
        "icd": "9690/3",
        "meta_en": "CD20+, BCL-2+ (follicular germinal center), BCL-6+, CD10+, CD23 (FDC), CD3-, CD5- • ICD-O: 9690/3",
        "meta_es": "CD20+, BCL-2+ (centro germinal folicular), BCL-6+, CD10+, CD23 (FDC), CD3-, CD5- • ICD-O: 9690/3",
        "aliases": [
            "linfoma folicular",
            "follicular lymphoma",
            "bcl2",
            "cd20",
            "9690/3"
        ],
        "profile": {
            "CD20": 98,
            "CD45": 98,
            "CD10": 90,
            "CD3": 0,
            "CK7": 0,
            "S100": 0,
            "Ki-67": 25
        }
    },
    {
        "id": "diag-alcl",
        "code": "ALCL",
        "name_en": "Anaplastic Large Cell Lymphoma (ALCL, ALK+/-)",
        "name_es": "Linfoma Anaplásico de Células Grandes (ALCL)",
        "organ": "Ganglio Linfático / Piel",
        "category": "Hematolinfoide",
        "icd": "9714/3",
        "meta_en": "CD30+ (hallmark cells 100%), ALK (var), EMA+ (>80%), CD45+ (var), CD3- / weak, Keratins- • ICD-O: 9714/3",
        "meta_es": "CD30+ (células hallmark 100%), ALK (var), EMA+ (>80%), CD45+ (var), CD3- / débil, Queratinas- • ICD-O: 9714/3",
        "aliases": [
            "alcl",
            "linfoma anaplasico de celulas grandes",
            "cd30",
            "alk",
            "9714/3"
        ],
        "profile": {
            "CD30": 100,
            "CD45": 75,
            "ALK": 60,
            "EMA": 85,
            "CD3": 30,
            "CD20": 2,
            "CK7": 0,
            "Ki-67": 90
        }
    },
    {
        "id": "diag-plasmacytoma",
        "code": "PLASMACYTOMA",
        "name_en": "Plasma Cell Myeloma / Plasmacytoma",
        "name_es": "Mieloma Múltiple / Plasmocitoma",
        "organ": "Médula Ósea / Hueso / Extramedular",
        "category": "Hematolinfoide",
        "icd": "9732/3",
        "meta_en": "CD138+, CD38+, MUM-1+, Kappa / Lambda light chain restriction, CD20- (90%), CD45- / weak • ICD-O: 9732/3",
        "meta_es": "CD138+, CD38+, MUM-1+, Restricción cadenas Kappa / Lambda, CD20- (90%), CD45- / débil • ICD-O: 9732/3",
        "aliases": [
            "mieloma multiple",
            "plasmocitoma",
            "plasma cell myeloma",
            "cd138",
            "9732/3"
        ],
        "profile": {
            "CD138": 98,
            "CD20": 10,
            "CD45": 25,
            "Ki-67": 40,
            "CK7": 0,
            "S100": 0
        }
    },
    {
        "id": "diag-embryonal-ca",
        "code": "EMBRYONAL_CA",
        "name_en": "Embryonal Carcinoma (Testicular / Ovarian)",
        "name_es": "Carcinoma Embrionario",
        "organ": "Testículo / Ovario",
        "category": "Germinal",
        "icd": "9070/3",
        "meta_en": "CD30+ (>95%), OCT4+, SALL4+, SOX2+, Keratins+ (AE1/AE3 diffuse), CD117-, D2-40- • ICD-O: 9070/3",
        "meta_es": "CD30+ (>95%), OCT4+, SALL4+, SOX2+, Queratinas+ (AE1/AE3 difuso), CD117-, D2-40- • ICD-O: 9070/3",
        "aliases": [
            "carcinoma embrionario",
            "embryonal carcinoma",
            "tumor germinal",
            "cd30",
            "sall4",
            "9070/3"
        ],
        "profile": {
            "CD30": 98,
            "CK7": 85,
            "CD117": 2,
            "D2-40": 5,
            "Ki-67": 95,
            "CD45": 0,
            "p40": 0
        }
    },
    {
        "id": "diag-adenoid-cystic",
        "code": "ADENOID_CYSTIC",
        "name_en": "Adenoid Cystic Carcinoma (ACC)",
        "name_es": "Carcinoma Adenoide Quístico",
        "organ": "Glándula Salival / Vía Aérea",
        "category": "Epitelial Salival",
        "icd": "8200/3",
        "meta_en": "MYB+ (nuclear), p63+ / p40+ (myoepithelial), CK7+ (luminal), CD117+ (luminal 90%), S100+ • ICD-O: 8200/3",
        "meta_es": "MYB+ (nuclear), p63+ / p40+ (mioepitelial), CK7+ (luminal), CD117+ (luminal 90%), S100+ • ICD-O: 8200/3",
        "aliases": [
            "carcinoma adenoide quistico",
            "adenoid cystic carcinoma",
            "salival",
            "cd117",
            "myb",
            "8200/3"
        ],
        "profile": {
            "CK7": 95,
            "CD117": 90,
            "p63": 90,
            "p40": 70,
            "S100": 75,
            "SMA": 60,
            "Calretinin": 20,
            "TTF-1": 0
        }
    }
];

    // 2. TEXTOS Y DICCIONARIO BILINGÜE
    var IQ_I18N = {
        en: {
            navBuildPanel: 'Build Panel',
            navLearn: 'Learn',
            navExpertPath: 'ExpertPath',
            navCme: 'CME',
            navHelp: 'Help / Support',
            subbarTitle: 'Build Panel',
            savedCasesBtn: 'Saved Cases &gt;',
            tabDiagnoses: 'Diagnoses',
            tabAntibodies: 'Antibodies',
            searchPlaceholderDiag: 'Search for diagnoses (e.g. Lung Adenocarcinoma, Melanoma, ccRCC...)',
            searchPlaceholderAnti: 'Search for antibodies (e.g. CK7, TTF-1, p40, GATA3, S100...)',
            recentLabel: 'Available Items',
            selectedLabel: 'Selected',
            clearAll: 'Clear',
            emptyNotice: 'Search for diagnoses or antibodies in the search box on the left. Click on search results to select items for your panel.',
            buildMatrixBtn: '<i class="fa-solid fa-table-cells"></i> Build Panel &gt;',
            waOrderBtn: '<i class="fa-brands fa-whatsapp"></i> Order Panel via WhatsApp &gt;',
            badgeDiag: 'Diagnosis',
            badgeAnti: 'Antibody',
            noResults: 'No results found matching "{q}"',
            maxItemsAlert: 'Maximum 5 items allowed for panel creation. Please remove an item before adding another.',
            savedCasesAlert: 'Saved Cases: No panels stored in local session yet. You can build a panel with up to 5 items and save it for rapid consultation.',
            matrixTitle: 'ImmunoQuery IHC Diagnostic Matrix • Comparative Panel',
            matrixSubtitle: 'Algorithmic antibody recommendation and differential panel matrix based on WHO 5th Edition.',
            thAntibody: 'Biomarker (IHC)',
            thTarget: 'Localization',
            thCategory: 'Group / Lineage',
            thStock: 'Stock JC PATH LAB',
            recSummaryText: 'Recommended by ImmunoQuery: Evaluate at least 2 positive and 2 negative markers for confident distinction.'
        },
        es: {
            navBuildPanel: 'Crear Panel',
            navLearn: 'Aprender',
            navExpertPath: 'ExpertPath',
            navCme: 'CME (Educación)',
            navHelp: 'Ayuda / Soporte',
            subbarTitle: 'Crear Panel',
            savedCasesBtn: 'Casos Guardados &gt;',
            tabDiagnoses: 'Diagnósticos',
            tabAntibodies: 'Anticuerpos',
            searchPlaceholderDiag: 'Buscar diagnósticos (ej. Adenocarcinoma Pulmonar, Melanoma, Renal...)',
            searchPlaceholderAnti: 'Buscar anticuerpos (ej. CK7, TTF-1, p40, GATA3, S100, Claudin-4...)',
            recentLabel: 'Elementos Disponibles',
            selectedLabel: 'Seleccionados',
            clearAll: 'Clear',
            emptyNotice: 'Search for diagnoses or antibodies in the search box on the left. Click on search results to select items for your panel.',
            buildMatrixBtn: '<i class="fa-solid fa-table-cells"></i> Build Panel &gt;',
            waOrderBtn: '<i class="fa-brands fa-whatsapp"></i> Solicitar Panel por WhatsApp &gt;',
            badgeDiag: 'Diagnóstico',
            badgeAnti: 'Anticuerpo',
            noResults: 'No se encontraron resultados para "{q}"',
            maxItemsAlert: 'Puede seleccionar un máximo de 5 elementos para el panel de inmunohistoquímica.',
            savedCasesAlert: 'Casos Guardados: Aún no hay paneles almacenados en esta sesión. Seleccione hasta 5 diagnósticos o anticuerpos.',
            matrixTitle: 'Matriz Diagnóstica ImmunoQuery • Panel Comparativo IHQ',
            matrixSubtitle: 'Panel discriminador optimizado algorítmicamente según guías internacionales y OMS 5ta Edición.',
            thAntibody: 'Biomarcador (IHQ)',
            thTarget: 'Localización',
            thCategory: 'Grupo / Linaje',
            thStock: 'Stock JC PATH LAB',
            recSummaryText: 'Recomendación Clínica: Emplee un panel balanceado con marcadores positivos y de exclusión.'
        }
    };

    // 3. ESTADO GLOBAL DE LA APLICACIÓN
    var currentLang = 'en';
    var currentTab = 'diagnoses';
    var selectedItems = []; // Array de { id, type, code, name }

    // 4. FUNCIONES DE AYUDA Y BÚSQUEDA
    function getItemName(item) {
        if (!item) return '';
        return currentLang === 'es' ? (item.name_es || item.name_en) : (item.name_en || item.name_es);
    }

    function getItemMeta(item) {
        if (!item) return '';
        return currentLang === 'es' ? (item.meta_es || item.meta_en) : (item.meta_en || item.meta_es);
    }

    function getDataset() {
        return currentTab === 'diagnoses' ? IQ_DIAGNOSES : IQ_ANTIBODIES;
    }

    function findItemById(id) {
        var all = IQ_DIAGNOSES.concat(IQ_ANTIBODIES);
        for (var i = 0; i < all.length; i++) {
            if (all[i].id === id) return all[i];
        }
        return null;
    }

    // 5. RENDERIZADO DE LA LISTA DE BÚSQUEDA EN VIVO
    function renderItemsList(filterQuery) {
        var container = document.getElementById('iqRecentList');
        if (!container) return;
        var items = getDataset();
        var q = (filterQuery || '').toLowerCase().trim();
        var t = IQ_I18N[currentLang];

        var filtered = items.filter(function(it) {
            if (!q) return true;
            var nameEn = (it.name_en || '').toLowerCase();
            var nameEs = (it.name_es || '').toLowerCase();
            var metaEn = (it.meta_en || '').toLowerCase();
            var metaEs = (it.meta_es || '').toLowerCase();
            var code = (it.code || '').toLowerCase();
            var icd = (it.icd || '').toLowerCase();
            var organ = (it.organ || '').toLowerCase();
            var cat = (it.category || '').toLowerCase();

            if (nameEn.indexOf(q) !== -1 || nameEs.indexOf(q) !== -1 ||
                code.indexOf(q) !== -1 || icd.indexOf(q) !== -1 ||
                organ.indexOf(q) !== -1 || cat.indexOf(q) !== -1 ||
                metaEn.indexOf(q) !== -1 || metaEs.indexOf(q) !== -1) {
                return true;
            }

            if (it.aliases && Array.isArray(it.aliases)) {
                for (var a = 0; a < it.aliases.length; a++) {
                    if (it.aliases[a].toLowerCase().indexOf(q) !== -1) return true;
                }
            }
            return false;
        });

        // Actualizar etiqueta con recuento
        var recentLbl = document.getElementById('iqRecentLabel');
        if (recentLbl) {
            if (q) {
                recentLbl.textContent = (currentTab === 'diagnoses' ? 'Diagnoses' : 'Antibodies') + ' (' + filtered.length + ' matches)';
            } else {
                recentLbl.textContent = (currentTab === 'diagnoses' ? 'Available Diagnoses' : 'Available Antibodies') + ' (' + items.length + ')';
            }
        }

        if (filtered.length === 0) {
            var noRes = t.noResults.replace('{q}', q);
            container.innerHTML = '<div style="padding: 28px 16px; color: #94a3b8; font-size: 14px; text-align: center;"><i class="fa-solid fa-magnifying-glass" style="font-size: 24px; opacity: 0.4; margin-bottom: 8px; display: block;"></i>' + noRes + '</div>';
            return;
        }

        var html = '';
        filtered.forEach(function(item) {
            var isSel = selectedItems.some(function(s) { return s.id === item.id; });
            var displayName = getItemName(item);
            var displayMeta = getItemMeta(item);

            html += '<div class="iq-entity-card ' + (isSel ? 'selected' : '') + '" onclick="window.iqToggleSelectItem(\'' + item.id + '\')" role="button" tabindex="0">';
            html += '  <div class="iq-entity-details">';
            html += '    <div class="iq-entity-name">' + displayName + '</div>';
            html += '    <div class="iq-entity-meta">' + displayMeta + '</div>';
            html += '  </div>';
            html += '  <div class="iq-entity-action-icon" title="' + (isSel ? 'Remove from panel' : 'Add to panel') + '">';
            html += '    <i class="fa-solid ' + (isSel ? 'fa-check' : 'fa-plus') + '"></i>';
            html += '  </div>';
            html += '</div>';
        });
        container.innerHTML = html;
    }

    // 6. GESTIÓN DE SELECCIONADOS (0/5)
    function renderSelectedPanel() {
        var counterEl = document.getElementById('iqSelectedCounterText');
        var emptyNotice = document.getElementById('iqEmptyNotice');
        var chipsContainer = document.getElementById('iqSelectedChips');
        var clearBtn = document.getElementById('iqBtnClearAll');
        var buildBtn = document.getElementById('iqBtnBuildPanel');
        var waBtn = document.getElementById('iqBtnWaOrder');
        var t = IQ_I18N[currentLang];

        var count = selectedItems.length;
        if (counterEl) {
            counterEl.textContent = '(' + count + '/5)';
            if (count >= 5) {
                counterEl.style.color = '#ea580c';
                counterEl.style.fontWeight = '800';
            } else {
                counterEl.style.color = '';
                counterEl.style.fontWeight = '';
            }
        }

        // Si no hay seleccionados (0/5): Texto guía original de ImmunoQuery
        if (count === 0) {
            if (emptyNotice) {
                emptyNotice.style.display = 'block';
                emptyNotice.textContent = 'Search for diagnoses or antibodies in the search box on the left. Click on search results to select items for your panel.';
            }
            if (chipsContainer) chipsContainer.innerHTML = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (buildBtn) buildBtn.style.display = 'none';
            if (waBtn) waBtn.style.display = 'none';
            return;
        }

        // Cuando hay al menos 1 seleccionado: Ocultar texto guía y mostrar botón azul Build Panel y botón Clear
        if (emptyNotice) emptyNotice.style.display = 'none';
        if (clearBtn) {
            clearBtn.style.display = 'inline-block';
            clearBtn.textContent = 'Clear';
        }
        if (buildBtn) {
            buildBtn.style.display = 'inline-flex';
            buildBtn.style.background = '#0284c7';
            buildBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Build Panel &gt;';
        }
        if (waBtn) waBtn.style.display = 'inline-flex';

        if (chipsContainer) {
            var html = '';
            selectedItems.forEach(function(sel) {
                var original = findItemById(sel.id);
                var displayName = original ? getItemName(original) : (sel.name || sel.id);
                var typeLabel = sel.type === 'diagnoses' ? t.badgeDiag : t.badgeAnti;

                html += '<div class="iq-selected-chip-item">';
                html += '  <div class="iq-chip-title">';
                html += '    <span>' + displayName + '</span>';
                html += '    <span class="iq-chip-badge" style="' + (sel.type === 'diagnoses' ? 'background: rgba(2,132,199,0.12); color:#0284c7;' : 'background: rgba(16,185,129,0.12); color:#059669;') + '">' + typeLabel + '</span>';
                html += '  </div>';
                html += '  <button type="button" class="iq-chip-remove-btn" title="Remove ' + displayName + '" onclick="window.iqRemoveItem(\'' + sel.id + '\', event)">';
                html += '    &times;';
                html += '  </button>';
                html += '</div>';
            });
            chipsContainer.innerHTML = html;
        }
    }

    // 7. CONMUTACIÓN DE PESTAÑAS (DIAGNOSES | ANTIBODIES)
    window.iqSwitchTab = function(tabName) {
        currentTab = tabName;
        var tabDiag = document.getElementById('iqTabDiagnoses');
        var tabAnti = document.getElementById('iqTabAntibodies');
        var input = document.getElementById('iqSearchInput');
        var t = IQ_I18N[currentLang];

        if (tabDiag && tabAnti) {
            if (tabName === 'diagnoses') {
                tabDiag.classList.add('active');
                tabDiag.setAttribute('aria-selected', 'true');
                tabAnti.classList.remove('active');
                tabAnti.setAttribute('aria-selected', 'false');
                if (input) input.placeholder = t.searchPlaceholderDiag;
            } else {
                tabAnti.classList.add('active');
                tabAnti.setAttribute('aria-selected', 'true');
                tabDiag.classList.remove('active');
                tabDiag.setAttribute('aria-selected', 'false');
                if (input) input.placeholder = t.searchPlaceholderAnti;
            }
        }

        if (input) input.value = '';
        renderItemsList('');
    };

    // 8. BÚSQUEDA INTERACTIVA EN TIEMPO REAL
    window.iqFilterItems = function(val) {
        renderItemsList(val);
    };

    window.iqExecuteSearch = function() {
        var input = document.getElementById('iqSearchInput');
        if (input) renderItemsList(input.value);
    };

    // 9. SELECCIÓN / DESELECCIÓN DE ELEMENTOS
    window.iqToggleSelectItem = function(itemId) {
        var existingIdx = -1;
        for (var i = 0; i < selectedItems.length; i++) {
            if (selectedItems[i].id === itemId) {
                existingIdx = i;
                break;
            }
        }

        if (existingIdx !== -1) {
            // Deseleccionar si ya estaba
            selectedItems.splice(existingIdx, 1);
        } else {
            // Validar límite máximo de 5 elementos
            if (selectedItems.length >= 5) {
                alert(IQ_I18N[currentLang].maxItemsAlert);
                return;
            }
            var found = findItemById(itemId);
            if (found) {
                selectedItems.push({
                    id: found.id,
                    code: found.code || found.id,
                    name: getItemName(found),
                    type: currentTab
                });
            }
        }

        var input = document.getElementById('iqSearchInput');
        renderItemsList(input ? input.value : '');
        renderSelectedPanel();
    };

    window.iqRemoveItem = function(itemId, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        selectedItems = selectedItems.filter(function(s) { return s.id !== itemId; });
        var input = document.getElementById('iqSearchInput');
        renderItemsList(input ? input.value : '');
        renderSelectedPanel();
    };

    window.iqClearSelection = function() {
        selectedItems = [];
        var input = document.getElementById('iqSearchInput');
        renderItemsList(input ? input.value : '');
        renderSelectedPanel();
    };

    window.iqShowSavedCases = function() {
        alert(IQ_I18N[currentLang].savedCasesAlert);
    };

    // 10. GENERADOR DE MATRIZ DIAGNÓSTICA IHQ (BUILD PANEL)
    window.iqGenerateMatrixPanel = function() {
        if (selectedItems.length === 0) return;

        var selDiags = selectedItems.filter(function(s) { return s.type === 'diagnoses'; }).map(function(s) { return findItemById(s.id); }).filter(Boolean);
        var selAbs = selectedItems.filter(function(s) { return s.type === 'antibodies'; }).map(function(s) { return findItemById(s.id); }).filter(Boolean);

        // Si solo se seleccionaron anticuerpos, buscar los 4 diagnósticos más representativos
        if (selDiags.length === 0) {
            selDiags = [
                findItemById('diag-lung-adeno'),
                findItemById('diag-meso-epithelioid'),
                findItemById('diag-breast-ductal'),
                findItemById('diag-colon-adeno')
            ].filter(Boolean);
        }

        // Si solo se seleccionó 1 diagnóstico, agregar un diagnóstico diferencial clásico para comparación
        if (selDiags.length === 1) {
            var first = selDiags[0];
            if (first.id === 'diag-lung-adeno') selDiags.push(findItemById('diag-meso-epithelioid'), findItemById('diag-lung-squam'));
            else if (first.id === 'diag-meso-epithelioid') selDiags.push(findItemById('diag-lung-adeno'));
            else if (first.id === 'diag-prostate-adeno') selDiags.push(findItemById('diag-urothelial-ca'));
            else if (first.id === 'diag-breast-ductal') selDiags.push(findItemById('diag-lung-adeno'));
            else if (first.id === 'diag-colon-adeno') selDiags.push(findItemById('diag-ovarian-serous'));
            else selDiags.push(findItemById('diag-lung-adeno'));
            selDiags = selDiags.filter(Boolean);
        }

        // Determinar qué anticuerpos comparar:
        // Si el usuario seleccionó anticuerpos, incluirlos
        var compareAbs = [].concat(selAbs);

        // Añadir los anticuerpos con mayor poder discriminante (mayor varianza) entre los diagnósticos seleccionados
        var allKeyAbs = ['CK7', 'CK20', 'TTF-1', 'p40', 'p63', 'GATA3', 'CDX2', 'Claudin-4', 'Calretinin', 'WT1', 'Mammaglobin', 'ER', 'PR', 'HER2', 'PSA', 'Sinaptofisina', 'Cromogranina', 'CD56', 'S100', 'SOX10', 'Melan-A', 'Desmina', 'CD34', 'CD45', 'PAX8', 'D2-40', 'BAP1', 'Arginase-1', 'Napsin A'];
        
        var scoredAbs = allKeyAbs.map(function(abCode) {
            var vals = selDiags.map(function(d) {
                return (d.profile && typeof d.profile[abCode] === 'number') ? d.profile[abCode] : 0;
            });
            var maxV = Math.max.apply(null, vals);
            var minV = Math.min.apply(null, vals);
            return { code: abCode, variance: maxV - minV };
        });

        scoredAbs.sort(function(a, b) { return b.variance - a.variance; });

        // Completar hasta 8-10 anticuerpos para una tabla rica y clínica
        for (var i = 0; i < scoredAbs.length; i++) {
            var candidateCode = scoredAbs[i].code;
            var alreadyIn = compareAbs.some(function(a) { return a.code === candidateCode; });
            if (!alreadyIn && scoredAbs[i].variance > 10) {
                var foundAb = IQ_ANTIBODIES.find(function(a) { return a.code === candidateCode; });
                if (foundAb) compareAbs.push(foundAb);
            }
            if (compareAbs.length >= 8) break;
        }

        // Construir tabla HTML de la Matriz ImmunoQuery
        var tableHtml = '<div class="iq-matrix-table-wrap"><table class="iq-matrix-table"><thead><tr>';
        tableHtml += '<th>' + IQ_I18N[currentLang].thAntibody + '</th>';
        selDiags.forEach(function(diag) {
            tableHtml += '<th>' + getItemName(diag) + '<br><span style="font-size: 10.5px; font-weight: 500; color: #64748b;">' + (diag.organ || '') + ' (' + (diag.icd || '') + ')</span></th>';
        });
        tableHtml += '<th>' + IQ_I18N[currentLang].thTarget + '</th>';
        tableHtml += '<th>' + IQ_I18N[currentLang].thStock + '</th>';
        tableHtml += '</tr></thead><tbody>';

        compareAbs.forEach(function(ab) {
            tableHtml += '<tr>';
            tableHtml += '<td><strong>' + ab.code + '</strong><br><span style="font-size: 11px; color: #64748b;">' + getItemName(ab) + '</span></td>';

            selDiags.forEach(function(diag) {
                var pct = (diag.profile && typeof diag.profile[ab.code] === 'number') ? diag.profile[ab.code] : null;
                if (pct === null) {
                    tableHtml += '<td><span style="color: #94a3b8;">&mdash;</span></td>';
                } else if (pct >= 70) {
                    tableHtml += '<td><span class="iq-pill-pos">' + pct + '% (+)</span></td>';
                } else if (pct <= 20) {
                    tableHtml += '<td><span class="iq-pill-neg">' + pct + '% (-)</span></td>';
                } else {
                    tableHtml += '<td><span class="iq-pill-var">' + pct + '% (Var)</span></td>';
                }
            });

            tableHtml += '<td style="font-size: 11.5px; color: #475569;">' + (ab.target || 'Celular') + '</td>';
            tableHtml += '<td><span style="font-size: 11px; color: #047857; background: #ecfdf5; padding: 2px 7px; border-radius: 9999px; border: 1px solid #a7f3d0; font-weight: 600;"><i class="fa-solid fa-check"></i> Stock 24h</span></td>';
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table></div>';

        // Construir mensaje resumen de WhatsApp
        var waSummary = selDiags.map(function(d) { return getItemName(d); }).join(' vs ');
        var waAbsSummary = compareAbs.map(function(a) { return a.code; }).join(', ');
        var waMsg = 'Hola Dr. Joseph Castillo, le escribo desde el creador de paneles ImmunoQuery (JC Path Lab). He configurado el siguiente panel diferencial (' + waSummary + ') evaluando: ' + waAbsSummary + '. Deseo coordinar confirmación histopatológica y tiempos de entrega.';

        // Mostrar u obtener el Modal
        var modal = document.getElementById('iqMatrixModal');
        if (!modal) {
            // Crear el modal dinámicamente si no existe
            modal = document.createElement('div');
            modal.id = 'iqMatrixModal';
            modal.className = 'iq-matrix-modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = 
            '<div class="iq-matrix-modal-content">' +
            '  <div class="iq-matrix-modal-header">' +
            '    <div class="iq-matrix-modal-title">' +
            '      <i class="fa-solid fa-table-cells" style="color: #0284c7;"></i>' +
            '      <span>' + IQ_I18N[currentLang].matrixTitle + '</span>' +
            '    </div>' +
            '    <button type="button" class="iq-matrix-modal-close" onclick="window.iqCloseMatrixModal()">&times;</button>' +
            '  </div>' +
            '  <div class="iq-matrix-modal-body">' +
            '    <p style="font-size: 13.5px; color: #475569; margin-bottom: 14px;">' + IQ_I18N[currentLang].matrixSubtitle + '</p>' +
            tableHtml +
            '    <div style="margin-top: 14px; padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 12.5px; color: #166534; display: flex; align-items: center; gap: 10px;">' +
            '      <i class="fa-solid fa-circle-info" style="font-size: 16px;"></i>' +
            '      <span>' + IQ_I18N[currentLang].recSummaryText + '</span>' +
            '    </div>' +
            '  </div>' +
            '  <div class="iq-matrix-modal-footer">' +
            '    <button type="button" class="iq-btn-modal-action iq-btn-modal-close" onclick="window.iqCloseMatrixModal()">Cerrar</button>' +
            '    <a href="https://wa.me/51986396733?text=' + encodeURIComponent(waMsg) + '" target="_blank" rel="noopener noreferrer" class="iq-btn-modal-action iq-btn-modal-wa">' +
            '      <i class="fa-brands fa-whatsapp"></i> Validar Panel con Dr. Castillo (+51 986 396 733)' +
            '    </a>' +
            '  </div>' +
            '</div>';

        modal.style.display = 'flex';
    };

    window.iqCloseMatrixModal = function() {
        var modal = document.getElementById('iqMatrixModal');
        if (modal) modal.style.display = 'none';
    };

    window.iqOrderPanelWhatsApp = function() {
        if (selectedItems.length === 0) return;
        var t = IQ_I18N[currentLang];
        var listText = selectedItems.map(function(s, idx) {
            var obj = findItemById(s.id);
            var tag = s.type === 'diagnoses' ? '[Diagnóstico]' : '[Anticuerpo IHQ]';
            return (idx + 1) + '. ' + tag + ' ' + (obj ? getItemName(obj) : s.id);
        }).join('\n');

        var fullMessage = (currentLang === 'es' ? 
            'Hola Dr. Joseph Castillo, le escribo desde el Creador ImmunoQuery (JC Path Lab). Deseo coordinar disponibilidad de stock y cotización para el siguiente panel:' : 
            'Hello Dr. Joseph Castillo, I am consulting the ImmunoQuery panel builder (JC Path Lab). I would like to request stock availability and quote for the following IHC panel:') +
            '\n\n' + listText + '\n\nGracias Dr. Castillo.';

        var waUrl = 'https://wa.me/51986396733?text=' + encodeURIComponent(fullMessage);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    window.iqSetLanguage = function(lang) {
        if (lang !== 'en' && lang !== 'es') return;
        currentLang = lang;
        try { localStorage.setItem('iq_user_lang', lang); } catch(e) {}

        var btnEn = document.getElementById('iqLangEn');
        var btnEs = document.getElementById('iqLangEs');
        if (btnEn) btnEn.classList.toggle('active', lang === 'en');
        if (btnEs) btnEs.classList.toggle('active', lang === 'es');

        var t = IQ_I18N[lang];

        var navBuild = document.getElementById('iqNavBuildPanel');
        if (navBuild) navBuild.textContent = t.navBuildPanel;
        var navLearn = document.getElementById('iqNavLearn');
        if (navLearn) navLearn.textContent = t.navLearn;
        var navCme = document.getElementById('iqNavCme');
        if (navCme) navCme.textContent = t.navCme;
        var navHelp = document.getElementById('iqNavHelpText');
        if (navHelp) navHelp.textContent = t.navHelp;

        var subTitle = document.getElementById('iqSubbarTitle');
        if (subTitle) subTitle.textContent = t.subbarTitle;
        var btnSaved = document.getElementById('iqBtnSavedCasesText');
        if (btnSaved) btnSaved.innerHTML = t.savedCasesBtn;

        var tabDiag = document.getElementById('iqTabDiagnoses');
        if (tabDiag) tabDiag.textContent = t.tabDiagnoses;
        var tabAnti = document.getElementById('iqTabAntibodies');
        if (tabAnti) tabAnti.textContent = t.tabAntibodies;

        var input = document.getElementById('iqSearchInput');
        if (input) {
            input.placeholder = currentTab === 'diagnoses' ? t.searchPlaceholderDiag : t.searchPlaceholderAnti;
        }

        var recentLbl = document.getElementById('iqRecentLabel');
        if (recentLbl) recentLbl.textContent = t.recentLabel;

        var selLbl = document.getElementById('iqSelectedLabel');
        if (selLbl) selLbl.textContent = t.selectedLabel;
        var clearBtn = document.getElementById('iqBtnClearAll');
        if (clearBtn) clearBtn.textContent = t.clearAll;
        var emptyNotice = document.getElementById('iqEmptyNotice');
        if (emptyNotice) emptyNotice.textContent = t.emptyNotice;
        var buildText = document.getElementById('iqBtnBuildText');
        if (buildText) buildText.innerHTML = t.buildMatrixBtn;
        var waText = document.getElementById('iqBtnWaText');
        if (waText) waText.innerHTML = t.waOrderBtn;

        renderItemsList(input ? input.value : '');
        renderSelectedPanel();
    };

    // 11. INICIALIZADOR MAESTRO
    window.initImmunoQueryClone = function() {
        var savedLang = 'en';
        try {
            var stored = localStorage.getItem('iq_user_lang');
            if (stored === 'es' || stored === 'en') savedLang = stored;
        } catch(e) {}

        window.iqSetLanguage(savedLang);

        window.addEventListener('ihq-table-resize', function() {
            var input = document.getElementById('iqSearchInput');
            renderItemsList(input ? input.value : '');
            renderSelectedPanel();
        });
    };

    // Exponer la base de datos de forma pública para inspección o integración
    window.IQ_ANTIBODIES_DB = IQ_ANTIBODIES;
    window.IQ_DIAGNOSES_DB = IQ_DIAGNOSES;

})(window, document);
