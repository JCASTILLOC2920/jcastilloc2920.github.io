
antibodies = [
    "ACTINA MUSCULO LISO", "ACTINA (HIF35)", "ADIPOFILINA", "AFP (Alfa FetoProteina)", "ALK(CD246)", 
    "AMACR (Racemase)", "AMILOIDE A", "ANDROGENO", "A. CARBONICA IX (CA IX)", "ARGINASE 1", "ATRX", 
    "BCL-2", "BCL-6", "BER-EP4", "BETACATENIN", "C-MYC", "CALCITONINA", "CALDESMON", "CALPONINA", 
    "CALRETININA", "CD1a", "CD3", "CD4", "CD5", "CD7", "CD8", "CD10", "CD15", "CD19", "CD20", 
    "CD21", "CD23", "CD30", "CD31", "CD34", "CD43", "CD45", "CD56", "CD61", "CD68", "CD79a", 
    "CD99", "CD117", "CD138", "CDK4", "CDX2", "CA-125", "CA 19.9", "CEA", "CYCLIN D1", 
    "CITOKERATIN CAMS 2", "CITOKERATIN OSCAR", "CITOKERATIN 5/6", "CITOKERATIN 7", "CITOKERATIN 8", 
    "CITOKERATIN 14", "CITOKERATIN 17", "CITOKERATIN 18", "CITOKERATIN 19", "CITOKERATIN 20", 
    "CITOMEGALOVIRUS", "COLAGENO IV", "CK HWM (34BE12)", "CROMOGRANINA A", "DESMINA", "DOG-1", 
    "EBV/LMP-1", "E-CADHERINA", "EMA", "ERG", "ESTROGENO", "FACTOR VIII", "FACTOR XIIIa", 
    "FASCIN A", "FOXP3", "FLY-1", "GCOFP-15", "GATA 3", "GFAP", "GLUT-1", "GLIPICAN 3", 
    "GLYCOFORINA", "GRANZYME B", "HCG (Beta)", "HER2 (C-ERBB2/CB11)", "HEP-PAR1", "HHV-8", 
    "HMB45", "IDH-1", "IgG", "IgG-4", "Ig M", "INI-1", "IMP-3", "INHIBINA", "KAPPA", "KI67", 
    "LAMBDA", "LEF-1", "LISOZIMA", "MAMAGLOBINA", "MELAN A/MART-1", "MIELOPEROXIDASA (MPO)", 
    "MIOGEINA", "MITF", "MLH1", "MSH2", "MSH6", "MUC 2", "MUC 5AC", "MUC 6", "MUM-1", "MYO D1", 
    "MMP9", "NAPSIN A", "NEUROFILAMENTO", "NGFR", "OLIG 2", "P16", "P40", "PS3", "P57", 
    "PANQUERATINA", "PAX-5", "PAX-8", "PODOPLANIND2-40", "PD-1/CD279", "PD-L1 (22c3)", "PLAP", 
    "PMS2", "PSA", "P-TEN", "PROGESTERONA", "PVH", "S-100", "SATB-2", "SALL 4", "SINAPTOFISINA", 
    "SOX-10", "SMAD4/DPC4", "STAT 6", "T. PALLIDUM", "TDT", "TLE-1", "TIA-1", "TIROGLOBULINA", 
    "TIROSINASA", "TTF-1", "VIMENTINA", "WT-1"
]

print('<div class="price-list-container" style="margin-top: 20px; margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid var(--accent);">')
print('    <h4 style="color: var(--secondary); font-size: 1.1rem; margin-top: 0; margin-bottom: 15px; font-weight: 700;">RELACIÓN DE ANTICUERPOS PARA INMUNOHISTOQUIMICA</h4>')
print('    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">')
print('        <tbody>')

for i in range(0, len(antibodies), 3):
    print('            <tr style="border-bottom: 1px solid #e9ecef;">')
    for j in range(3):
        if i + j < len(antibodies):
            print(f'                <td style="padding: 6px 4px; color: var(--dark); width: 33%;">{antibodies[i+j]}</td>')
        else:
            print('                <td style="padding: 6px 4px; width: 33%;"></td>')
    print('            </tr>')

print('        </tbody>')
print('    </table>')
print('</div>')
