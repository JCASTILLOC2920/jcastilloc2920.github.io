const tarifarioJCPathLab = {
    citologia: {
        titulo: "Citología y Prevención",
        estudios: {
            "papanicolaou": { nombre: "Papanicolaou (Cérvico-Vaginal)", precio: 20.00 },
            "secrecion": { nombre: "Secreción / Descarga del Pezón", precio: 40.00 },
            "liquidos": { nombre: "Citología de Líquidos (Pleural, Ascítico, Orina)", precio: 70.00 },
            "baaf": { nombre: "Aspiración con Aguja Fina (BAAF)", precio: 90.00 }
        }
    },
    biopsias_simples: {
        titulo: "Biopsias Simples y Endoscópicas",
        estudios: {
            "gastrica": { nombre: "Biopsia Gástrica (Endoscópica)", precio: 50.00 },
            "esofago": { nombre: "Biopsia de Esófago, Intestino o Colon", precio: 80.00 },
            "cervix": { nombre: "Biopsia de Cérvix / Cuello Uterino", precio: 80.00 },
            "piel": { nombre: "Biopsia de Piel (Punch)", precio: 80.00 }
        }
    },
    biopsias_quirurgicas: {
        titulo: "Biopsias Quirúrgicas y Oncológicas",
        estudios: {
            "cono": { nombre: "Cono Cervical (LEEP)", precio: 120.00 },
            "vesicula_apendice": { nombre: "Vesícula Biliar o Apéndice", precio: 110.00 },
            "utero": { nombre: "Útero (Histerectomía simple)", precio: 150.00 },
            "prostata": { nombre: "Próstata (Mapeo por 6 frascos)", precio: 250.00 },
            "mama_radical": { nombre: "Mastectomía / Cuadrantectomía", precio: 350.00 }
        }
    },
    inmunohistoquimica: {
        titulo: "Inmunohistoquímica (IHC)",
        estudios: {
            "marcador": { nombre: "Marcador Individual (Ki67, HER2, CD3, etc.)", precio: 180.00 }, // Con lectura
            "panel_mama": { nombre: "Panel de Mama Básico (RE, RP, HER2, Ki67)", precio: 750.00 }
        }
    }
};
