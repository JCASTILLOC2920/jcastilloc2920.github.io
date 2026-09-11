/**
 * ==========================================================================
 * PATOLOGÍA ESPECIAL - CLASES PRÁCTICAS DE MICROSCOPÍA (UNMSM 2026-II)
 * Instituto de Patología "Julio C. Tello" - Facultad de Medicina San Fernando
 * Dataset Maestro de Clases Prácticas, Diagnósticos y Láminas Histopatológicas
 * Referencia: Robbins & Kumar Patología Estructural y Funcional (11.ª Edición)
 * ==========================================================================
 */

window.PATOLOGIA_DATA = {
  meta: {
    asignatura: "Patología Especial",
    codigo: "ME4015",
    semestre: "2026-II",
    escuela: "Escuela Profesional de Medicina Humana",
    facultad: "Facultad de Medicina San Fernando",
    universidad: "Universidad Nacional Mayor de San Marcos (UNMSM)",
    departamento: "Departamento Académico de Patología",
    sede: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
    duracionHoras: "2.0 horas por sesión",
    horarios: {
      martes: "17:00 – 19:00 h",
      jueves: "15:00 – 19:00 h (Grupos A y B, 2.0 h por grupo)"
    },
    docenteResponsable: "Dr. Omar Lorenzo Reyes Morales",
    edicionReferencia: "Robbins & Cotran Patología Estructural y Funcional (11.ª Ed., 2024-2026)"
  },

  unidades: [
    {
      id: "U1",
      numero: "I",
      nombre: "Patología Cardiovascular y Respiratoria",
      descripcion: "Lesiones vasculares, cardiopatía isquémica, neumopatías obstructivas, infecciosas e intersticiales.",
      color: "#38bdf8",
      colorGlow: "rgba(56, 189, 248, 0.35)",
      semanas: [1, 2, 3, 4]
    },
    {
      id: "U2",
      numero: "II",
      nombre: "Patología Neurológica, Endocrina y Renal",
      descripcion: "Neoplasias del SNC y meninges, tiroidopatías, glomerulopatías, nefropatías e I Examen Práctico.",
      color: "#a855f7",
      colorGlow: "rgba(168, 85, 247, 0.35)",
      semanas: [5, 6, 7, 8]
    },
    {
      id: "U3",
      numero: "III",
      nombre: "Patología Urogenital, Mamaria y Ginecológica",
      descripcion: "Próstata, vejiga, testículo, patología tumoral mamaria, lesiones por VPH, cuello uterino y endometrio.",
      color: "#ec4899",
      colorGlow: "rgba(236, 72, 153, 0.35)",
      semanas: [9, 10, 11]
    },
    {
      id: "U4",
      numero: "IV",
      nombre: "Patología Digestiva, Hepatobiliar, Linfática y Piel",
      descripcion: "Tubo digestivo, cirrosis, hepatitis, linfomas, carcinomas cutáneos, melanoma y II Examen Práctico.",
      color: "#10b981",
      colorGlow: "rgba(16, 185, 129, 0.35)",
      semanas: [12, 13, 14, 15, 16]
    }
  ],

  semanas: [
    {
      semana: 1,
      unidadId: "U1",
      titulo: "Patología cardiovascular: lesiones vasculares y cardíacas",
      fechas: {
        martes: "25/08/2026",
        jueves: "27/08/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Básica",
      dificultadNivel: 1,
      resumenSemana: "Estudio de las alteraciones vasculares iniciales y avanzadas, mecanismos de ateroesclerosis, trombosis intravascular y la cronología lesional del infarto de miocardio.",
      laminas: [
        {
          id: "L01-01",
          codigo: "L-CV-01",
          diagnostico: "Aterosclerosis Aórtica (Placa de Ateroma)",
          organo: "Aorta / Arteria de gran calibre",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Lesión fibrointimal lipídica crónica",
          definicionRobbins: "Placa intimal sobreelevada con un centro lipídico necrótico blando cubierto por una capa fibrosa colágena densa.",
          triadaPatognomonica: [
            "Centro necrótico acelular con hendiduras y agujas de colesterol (colesterol clefts) vacías por disolución técnica.",
            "Células espumosas (macrófagos y células musculares lisas repletas de lípidos en citoplasma).",
            "Capa fibrosa intimal compuesta por colágeno denso, elastina y células musculares lisas proliferantes."
          ],
          perlaDiagnostica: "La calcificación distrófica basófila y la neovascularización en la base de la placa aumentan drásticamente el riesgo de rotura y trombosis superpuesta.",
          metaforaVisual: "Aspecto en 'aguja de cristal' por los cristales birrefringentes de colesterol rodeados de células espumosas.",
          diagnosticoDiferencial: [
            "Arteriosclerosis de Mönckeberg (calcifica la capa media, no la íntima y no obstruye la luz)",
            "Arteriolosclerosis hialina (propia de vasos pequeños y arteriolas en HTA)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CVHTML/CV005.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L01-02",
          codigo: "L-CV-02",
          diagnostico: "Infarto Agudo de Miocardio (Necrosis Coagulativa)",
          organo: "Corazón (Miocardio Ventricular)",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Necrosis isquémica coagulativa miocítica",
          definicionRobbins: "Muerte de cardiomiocitos por isquemia prolongada, manifestada por necrosis coagulativa, infiltrado neutrofílico y posterior reparación fibrosa.",
          triadaPatognomonica: [
            "Miocardiocitos hipereosinófilos anucleados (cariolisis/picnosis) con pérdida de estriaciones transversales.",
            "Infiltrado inflamatorio intersticial masivo de neutrófilos polimorfonucleares (pico entre 24-72 horas).",
            "Fibras miocárdicas ondeadas (wavy fibers) en la periferia de la zona infartada por tracción mecánica."
          ],
          perlaDiagnostica: "Hacia el 4.º a 7.º día se desintegra el infiltrado leucocitario y aparecen macrófagos fagocitando restos; es el momento de mayor fragilidad de la pared con riesgo de rotura cardíaca.",
          metaforaVisual: "Células fantasma: los contornos celulares se preservan como lápidas sin núcleos en su interior.",
          diagnosticoDiferencial: [
            "Miocarditis viral aguda (infiltrado mononuclear linfocitario sin necrosis en masa)",
            "Necrosis en bandas de contracción (propia de infarto reperfundido con bandas eosinófilas transversales densas)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CVHTML/CV036.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L01-03",
          codigo: "L-CV-03",
          diagnostico: "Trombosis Arterial Oclusiva con Líneas de Zahn",
          organo: "Arteria muscular de mediano calibre",
          tincion: "H&E / Tricrómico",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Masa intravascular hemática y plaquetaria",
          definicionRobbins: "Formación de un coágulo hemático intravascular patológico adherido al endotelio lesionado de un vaso arterial.",
          triadaPatognomonica: [
            "Líneas de Zahn evidentes: bandas pálidas alternantes de plaquetas y fibrina superpuestas a bandas oscuras de eritrocitos.",
            "Adherencia focal del trombo a la pared endotelial arterial desnuda o erosionada.",
            "Signos tempranos de recanalización con capilares endoteliales neoformados atravesando la masa trombótica."
          ],
          perlaDiagnostica: "Las líneas de Zahn solo se forman con flujo sanguíneo activo; su presencia certifica que la trombosis ocurrió in vivo y descarta un coágulo post mórtem en 'grasa de pollo'.",
          metaforaVisual: "Aspecto estratificado en láminas 'marmoleadas' rosadas y rojas.",
          diagnosticoDiferencial: [
            "Coágulo post mórtem (gelatinoso, no adherido, sin líneas de Zahn)",
            "Émbolo tumoral intravascular (nidos de células atípicas sin matriz fibrino-plaquetaria predominante)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CVHTML/CV014.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 2,
      unidadId: "U1",
      titulo: "Patología cardiovascular avanzada",
      fechas: {
        martes: "01/09/2026",
        jueves: "03/09/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Media",
      dificultadNivel: 2,
      resumenSemana: "Correlación de procesos infecciosos e inmunológicos del endocardio y miocardio. Reconocimiento de los cuerpos de Aschoff patognomónicos de la fiebre reumática.",
      laminas: [
        {
          id: "L02-01",
          codigo: "L-CV-04",
          diagnostico: "Miocarditis Linfocitaria (Viral)",
          organo: "Miocardio",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Inflamación intersticial miocárdica no isquémica",
          definicionRobbins: "Proceso inflamatorio del miocardio caracterizado por infiltración leucocitaria con degeneración y necrosis de miocitos no atribuible a isquemia coronaria.",
          triadaPatognomonica: [
            "Denso infiltrado inflamatorio mononuclear difuso compuesto primordialmente por linfocitos T y macrófagos.",
            "Focos evidentes de degeneración vacuolar, necrosis focal aislada y lisis de fibras musculares cardíacas individuales.",
            "Edema intersticial marcado que diseca los fascículos de cardiomiocitos."
          ],
          perlaDiagnostica: "A diferencia del infarto, no respeta territorios de arterias coronarias y la necrosis no es confluente en bloque sino parcelar y salpicada.",
          metaforaVisual: "Infiltrado en 'parches' linfocitarios estrangulando fibras miocárdicas viables.",
          diagnosticoDiferencial: [
            "Miocarditis por hipersensibilidad (infiltrado rico en eosinófilos)",
            "Miocarditis de células gigantes (células multinucleadas con pronóstico fulminante)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CVHTML/CV054.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L02-02",
          codigo: "L-CV-05",
          diagnostico: "Endocarditis Infecciosa (Vegetación Valvular)",
          organo: "Válvula Mitral / Aórtica",
          tincion: "H&E / Gram",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Masa trombótica séptica destructiva",
          definicionRobbins: "Colonización o invasión microbiana de las válvulas cardíacas o el endocardio mural, con formación de vegetaciones friables compuestas de fibrina y microorganismos.",
          triadaPatognomonica: [
            "Vegetación superficial compuesta por masa densa de fibrina acidófila, detritos celulares y plaquetas.",
            "Colonias bacterianas basófilas masivas inmersas en la matriz de fibrina.",
            "Destrucción necrótica ulcerada del tejido colágeno valvular con infiltrado de neutrófilos en la base de implantación."
          ],
          perlaDiagnostica: "En la endocarditis subaguda por Streptococcus viridans suele haber fibrosis y tejido de granulación en la base; en la aguda por S. aureus predomina la destrucción supurada destructiva.",
          metaforaVisual: "Aspecto de 'arrecife de coral' fibrinoide coronado por colonias bacterianas teñidas de azul oscuro.",
          diagnosticoDiferencial: [
            "Endocarditis trombótica no bacteriana (marántica: vegetaciones estériles sin gérmenes ni inflamación destructiva)",
            "Endocarditis de Libman-Sacks (asociada a LES, con necrosis fibrinoide en ambas caras valvulares)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CVHTML/CV028.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L02-03",
          codigo: "L-CV-06",
          diagnostico: "Cardiopatía Reumática (Cuerpos de Aschoff)",
          organo: "Miocardio / Endocardio",
          tincion: "H&E",
          aumentoRecomendado: "40X",
          tipoLesion: "Granuloma inflamatorio perivascular inmunitario",
          definicionRobbins: "Manifestación miocárdica patognomónica de la fiebre reumática aguda secundaria a reacción inmunológica cruzada contra antígenos de Streptococcus pyogenes.",
          triadaPatognomonica: [
            "Cuerpos de Aschoff: granulomas perivasculares con centro necrótico fibrinoide rodeado de células mononucleares.",
            "Células de Anitschkow (células en oruga): histiocitos con núcleo ovoide y cromatina central condensada en cinta ondulada.",
            "Células gigantes de Aschoff multinucleadas con citoplasma anfófilo o basófilo."
          ],
          perlaDiagnostica: "En corte transversal, la cromatina de las células de Anitschkow parece un 'ojo de búho' central; en longitudinal, adquiere la clásica silueta de 'oruga' (caterpillar cell).",
          metaforaVisual: "Núcleos 'en oruga' con cromatina aserrada central.",
          diagnosticoDiferencial: [
            "Granuloma tuberculoso miocárdico (con células de Langhans y caseificación amplia)",
            "Sarcoidosis cardíaca (granulomas desnudos sin necrosis fibrinoide)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CVHTML/CV062.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 3,
      unidadId: "U1",
      titulo: "Patología respiratoria I",
      fechas: {
        martes: "08/09/2026",
        jueves: "10/09/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Básica",
      dificultadNivel: 1,
      resumenSemana: "Reconocimiento morfológico del espectro EPOC (enfisema centroacinar/panacinar y bronquitis crónica) y de las infecciones pulmonares alveolares con consolidación exudativa.",
      laminas: [
        {
          id: "L03-01",
          codigo: "L-RESP-01",
          diagnostico: "Enfisema Pulmonar (Centroacinar / Panacinar)",
          organo: "Pulmón",
          tincion: "H&E",
          aumentoRecomendado: "4X - 10X",
          tipoLesion: "Destrucción septal y dilatación del espacio aéreo distal",
          definicionRobbins: "Agrandamiento anómalo y permanente de los espacios aéreos distales al bronquiolo terminal, con destrucción de sus paredes y sin fibrosis evidente.",
          triadaPatognomonica: [
            "Espacios aéreos alveolares marcadamente dilatados con pérdida del patrón en panal regular.",
            "Septos alveolares rotos, adelgazados y amputados que quedan flotando como espolones ciegos en la luz alveolar.",
            "Macrófagos alveolares con pigmento antracótico negro de carbón acumulados en los fondos de saco."
          ],
          perlaDiagnostica: "La pérdida de anclajes radiales bronquiolares que proporcionan los septos elásticos sanos causa el colapso espiratorio dinámico de la vía aérea en el paciente con EPOC.",
          metaforaVisual: "Malla rota en jirones con lagunas aéreas vacías sobredimensionadas.",
          diagnosticoDiferencial: [
            "Sobredistensión compensadora (alveolos dilatados pero con septos intactos, no rotos)",
            "Artefacto de insuflación histológica"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG006.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L03-02",
          codigo: "L-RESP-02",
          diagnostico: "Bronquitis Crónica con Hiperplasia Mucosa",
          organo: "Bronquio lobar / segmentario",
          tincion: "H&E / PAS",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Hipertrofia glandular bronquial con inflamación crónica",
          definicionRobbins: "Enfermedad clínica caracterizada por tos productiva persistente debida a hipersecreción de moco e inflamación bronquial crónica.",
          triadaPatognomonica: [
            "Hiperplasia e hipertrofia marcada de glándulas submucosas bronquiales con Índice de Reid > 0.4.",
            "Metaplasia de células caliciformes en el epitelio respiratorio cilíndrico ciliado.",
            "Infiltrado inflamatorio crónico mononuclear (linfocitos y células plasmáticas) en la lámina propia bronquial."
          ],
          perlaDiagnostica: "El índice de Reid mide el cociente entre el espesor de la capa de glándulas submucosas y el espesor de la pared bronquial (de epitelio a cartílago); un valor > 0.5 confirma bronquitis severa.",
          metaforaVisual: "Atestamiento de acinos mucosos que empujan y engruesan la submucosa hacia la luz bronquial.",
          diagnosticoDiferencial: [
            "Asma bronquial (membrana basal marcadamente engrosada con abundantes eosinófilos e hipertrofia del músculo liso)",
            "Bronquiectasia (destrucción transmural necrótica y dilatación irreversible)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG002.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L03-03",
          codigo: "L-RESP-03",
          diagnostico: "Bronconeumonía Bacteriana Aguda Supurada",
          organo: "Pulmón",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Consolidación alveolar exudativa focal en parches",
          definicionRobbins: "Consolidación parcheada centrada en bronquiolos terminales y extendida a los alvéolos contiguos, producida típicamente por bacterias piógenas.",
          triadaPatognomonica: [
            "Exudado rico en polimorfonucleares neutrófilos, fibrina y detritos celulares que llena completamente las luces alveolares.",
            "Distribución en parches (focos consolidados de hepatización alternando con alvéolos aireados adyacentes).",
            "Bronquiolos respiratorios centrales repletos de secreción purulenta con necrosis focal del epitelio de revestimiento."
          ],
          perlaDiagnostica: "A diferencia de la neumonía lobar que compromete un lóbulo entero de manera homogénea en una misma fase, la bronconeumonía es multicéntrica, bilateral y suele afectar lóbulos basales.",
          metaforaVisual: "Parches densos de infiltrado neutrofílico que 'inundan' los alvéolos como una esponja repleta de pus.",
          diagnosticoDiferencial: [
            "Neumonía lobar (consolidación uniforme de todo un lóbulo en idéntico estadio evolutivo)",
            "Neumonía por Pneumocystis jirovecii (exudado eosinófilo espumoso en 'panal de abejas')"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG023.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L03-04",
          codigo: "L-RESP-04",
          diagnostico: "Bronquiectasias con Ulceración y Fibrosis",
          organo: "Pulmón / Bronquio de mediano calibre",
          tincion: "H&E",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Dilatación permanente con destrucción parietal bronquial",
          definicionRobbins: "Dilatación permanente de bronquios y bronquiolos provocada por la destrucción de los componentes musculares y elásticos parietales debida a infección e inflamación crónica.",
          triadaPatognomonica: [
            "Dilatación sacular o cilíndrica extrema de la luz bronquial repleta de exudado purulento descamado.",
            "Destrucción necrótica y pérdida del soporte muscular liso, elástico y cartilaginoso de la pared bronquial.",
            "Extensa fibrosis parietal y peribronquial con áreas de metaplasia escamosa del epitelio respiratorio."
          ],
          perlaDiagnostica: "El círculo vicioso de obstrucción e infección crónica bacteriana conduce a la sustitución del epitelio ciliado por epitelio plano estratificado, perdiéndose el aclaramiento mucociliar.",
          metaforaVisual: "Bronquio ensanchado como un embudo con pared desestructurada y luz tapizada de detritos.",
          diagnosticoDiferencial: [
            "Absceso pulmonar (cavidad purulenta destructiva sin remanentes de pared bronquial previa)",
            "Bronquitis aguda (no hay destrucción ni dilatación irreversible de la pared)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG011.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 4,
      unidadId: "U1",
      titulo: "Patología respiratoria II",
      fechas: {
        martes: "15/09/2026",
        jueves: "17/09/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Avanzada",
      dificultadNivel: 3,
      resumenSemana: "Diagnóstico diferencial morfológico de las neoplasias malignas de pulmón (carcinoma escamoso vs adenocarcinoma vs células pequeñas), fibrosis intersticial y tuberculosis diseminada.",
      laminas: [
        {
          id: "L04-01",
          codigo: "L-RESP-05",
          diagnostico: "Fibrosis Pulmonar Idiopática (Patrón UIP)",
          organo: "Pulmón periférico y subpleural",
          tincion: "H&E / Tricrómico de Masson",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Neumopatía intersticial fibrosante progresiva",
          definicionRobbins: "Trastorno pulmonar progresivo caracterizado por fibrosis intersticial parcheada, focos fibroblásticos activos y remodelado quístico en panal de abejas.",
          triadaPatognomonica: [
            "Heterogeneidad temporal y espacial: áreas de parénquima sano alternando con colágeno fibroso denso acelular.",
            "Focos fibroblásticos activos: pequeños cúmulos mesenquimales convexos subepiteliales ricos en fibroblastos y miofibroblastos jóvenes.",
            "Cambio quístico en panal de abejas (honeycomb): espacios quísticos dilatados tapizados por epitelio bronquiolar rellenos de moco."
          ],
          perlaDiagnostica: "La localización predominantemente subpleural y basal es el sello histológico de la UIP; la presencia de focos fibroblásticos confirma enfermedad en actividad activa.",
          metaforaVisual: "Paisaje 'en mosaico' con islas de pulmón viable rodeadas de cicatriz colágena densa azul en Masson.",
          diagnosticoDiferencial: [
            "Neumonía intersticial inespecífica (NSIP: fibrosis uniforme y temporalmente homogénea, sin panalización)",
            "Sarcoidosis pulmonar avanzada (fibrosis con granulomas no caseificantes peribroncovasculares)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG050.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L04-02",
          codigo: "L-RESP-06",
          diagnostico: "Tuberculosis Miliar Pulmonar",
          organo: "Pulmón",
          tincion: "H&E / Ziehl-Neelsen",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Diseminación hematógena granulomatosa micrométrica",
          definicionRobbins: "Siembra hematógena masiva de Mycobacterium tuberculosis con formación de diminutos granulomas caseificantes microscópicos en todos los lóbulos.",
          triadaPatognomonica: [
            "Múltiples microgranulomas individualizados de 1 a 2 mm uniformemente diseminados por el parénquima alveolar.",
            "Centro con microfocos de necrosis caseosa eosinofílica granular.",
            "Corona de células epitelioides y células gigantes multinucleadas de Langhans (núcleos en arco periférico)."
          ],
          perlaDiagnostica: "Se denomina 'miliar' por semejar semillas de mijo (1-2 mm); los granulomas asientan en las paredes alveolares al diseminarse por capilares arteriales pulmonares.",
          metaforaVisual: "Sembrado esférico de microgranulomas como perlas blanquecinas en la trama pulmonar.",
          diagnosticoDiferencial: [
            "Histoplasmosis diseminada (levaduras intracelulares de 2-4 µm dentro de macrófagos)",
            "Carcinomatosis linfangítica (nidos tumorales epiteliales dentro de linfáticos septales)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG041.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L04-03",
          codigo: "L-RESP-07",
          diagnostico: "Carcinoma Epidermoide Pulmonar (Escamoso)",
          organo: "Bronquio proximal / Pulmón central",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia maligna epitelial queratinizante",
          definicionRobbins: "Neoplasia epitelial maligna central fuertemente ligada al tabaquismo que muestra diferenciación escamosa con perlas córneas o puentes intercelulares.",
          triadaPatognomonica: [
            "Perlas de queratina (remolinos córneos concéntricos de queratina acidófila intensa).",
            "Puentes intercelulares (desmosomas prominentes visibles entre células tumorales a 40X).",
            "Atipia citológica marcada con núcleos hipercromáticos voluminosos, mitosis atípicas y desmoplasia estromal peritumoral."
          ],
          perlaDiagnostica: "En inmunohistoquímica es clásicamente p40 positivo, p63 positivo y TTF-1 negativo, diferenciándolo inequívocamente del adenocarcinoma.",
          metaforaVisual: "Perlas de queratina en 'capas de cebolla' brillantes en medio de sábanas tumorales basófilas.",
          diagnosticoDiferencial: [
            "Adenocarcinoma pulmonar poco diferenciado (TTF-1 positivo, napsina A positiva)",
            "Carcinoma de células pequeñas (sin queratina, cromatina en sal y pimienta, amoldamiento nuclear)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG064.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L04-04",
          codigo: "L-RESP-08",
          diagnostico: "Adenocarcinoma Pulmonar Infiltrante",
          organo: "Pulmón periférico",
          tincion: "H&E / PAS / Alcian Blue",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia maligna epitelial glandular",
          definicionRobbins: "Carcinoma epitelial maligno con diferenciación glandular o producción de mucina; es el cáncer de pulmón más común en no fumadores y mujeres.",
          triadaPatognomonica: [
            "Formación de túbulos, ácinos irregulares, papilas o patrón cribiforme infiltrando el estroma colágeno.",
            "Vacuolas intracitoplasmáticas de mucina o secreción de moco en las luces glandulares atípicas.",
            "Pleomorfismo nuclear con nucléolos prominentes únicos o múltiples y pérdida de la polaridad epitelial."
          ],
          perlaDiagnostica: "La positividad inmunohistoquímica para TTF-1 (factor de transcripción tiroideo 1) y Napsina A confirma origen pulmonar primario y descarta metástasis de colon o mama.",
          metaforaVisual: "Glándulas atípicas fusionadas que crecen 'espalda contra espalda' rompiendo la membrana basal.",
          diagnosticoDiferencial: [
            "Carcinoma epidermoide poco diferenciado (p40 positivo)",
            "Metástasis de adenocarcinoma colónico (CDX2 positivo, TTF-1 negativo, glándulas con 'necrosis sucia')"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG067.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L04-05",
          codigo: "L-RESP-09",
          diagnostico: "Carcinoma Pulmonar de Células Pequeñas (Oat Cell)",
          organo: "Pulmón perihiliar central",
          tincion: "H&E",
          aumentoRecomendado: "40X",
          tipoLesion: "Neoplasia neuroendocrina de alto grado (G3)",
          definicionRobbins: "Tumor neuroendocrino maligno altamente agresivo compuesto por células pequeñas con citoplasma escaso, bordes mal definidos y mitosis muy elevadas.",
          triadaPatognomonica: [
            "Células redondas u ovoides pequeñas (menores al diámetro de 3 linfocitos) con citoplasma prácticamente invisible.",
            "Cromatina nuclear finamente granular dispersa ('en sal y pimienta') sin nucléolos prominentes.",
            "Amoldamiento nuclear (nuclear molding: núcleos que se deforman y encajan entre sí) y necrosis extensa con efecto Azzopardi."
          ],
          perlaDiagnostica: "El efecto Azzopardi corresponde a la basofilia prominente en las paredes vasculares por impregnación de ADN liberado por células tumorales necróticas lisadas.",
          metaforaVisual: "Sábanas de células 'en grano de avena' amoldadas con fondo de necrosis masiva.",
          diagnosticoDiferencial: [
            "Linfoma no Hodgkin difuso (CD45/CD20 positivo, sin amoldamiento nuclear ni efecto Azzopardi)",
            "Tumor carcinoide típico (bajo índice mitótico, sin necrosis, arquitectura organoide en nidos)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LUNGHTML/LUNG069.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 5,
      unidadId: "U2",
      titulo: "Patología neurológica",
      fechas: {
        martes: "22/09/2026",
        jueves: "24/09/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Media",
      dificultadNivel: 2,
      resumenSemana: "Estudio de las neoplasias más frecuentes del neuroeje y nervio periférico: gliomas difusos de alto grado, tumores de la vaina neural y meningiomas con cuerpos de Psamoma.",
      laminas: [
        {
          id: "L05-01",
          codigo: "L-NEURO-01",
          diagnostico: "Schwannoma (Neurilemoma de VIII Par)",
          organo: "Nervio periférico / Ángulo pontocerebeloso",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia benigna de vaina de nervio periférico",
          definicionRobbins: "Tumor benigno originado en las células de Schwann que exhibe alternancia clásica de áreas hipercelulares (Antoni A) e hipocelulares (Antoni B).",
          triadaPatognomonica: [
            "Zonas Antoni A densas con células fusiformes bipolares dispuestas en fascículos entrelazados.",
            "Cuerpos de Verocay: dos hileras paralelas de núcleos en empalizada que delimitan proyecciones citoplasmáticas fibrilares acelulares centrales.",
            "Zonas Antoni B laxas, microquísticas y mixoides con histiocitos xantomatosos y vasos sanguíneos hialinizados ectásicos."
          ],
          perlaDiagnostica: "Positividad inmunohistoquímica intensa y difusa para proteína S100 y SOX10 en el 100% de las células tumorales.",
          metaforaVisual: "Cuerpos de Verocay asemejando hileras de soldados montando guardia a ambos lados de un camino eosinófilo.",
          diagnosticoDiferencial: [
            "Neurofibroma (mezcla de células de Schwann, fibroblastos y axones con estroma colágeno en 'hilos de zanahoria')",
            "Meningioma fibroso (verticilos concéntricos EMA positivos, S100 negativo o focal)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CNSHTML/CNS092.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L05-02",
          codigo: "L-NEURO-02",
          diagnostico: "Glioblastoma Multiforme (Astrocitoma Grado 4 OMS)",
          organo: "Cerebro (Hemisferio cerebral - sustancia blanca)",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia glial astrocitaria maligna de alto grado",
          definicionRobbins: "El glioma difuso maligno más frecuente y letal, caracterizado histológicamente por pleomorfismo celular, necrosis y proliferación microvascular.",
          triadaPatognomonica: [
            "Necrosis geográfica o serpiginosa con pseudopalizada de células tumorales viables en los bordes necróticos.",
            "Proliferación microvascular endotelial florida con formación de ovillos 'glomeruloides'.",
            "Marcado pleomorfismo nuclear y citológico astrocítico con células gigantes multinucleadas bizarras y abundantes mitosis atípicas."
          ],
          perlaDiagnostica: "Cualquier astrocitoma infiltrante en adultos que exhiba necrosis con pseudopalizada o proliferación endotelial glomeruloide califica automáticamente como Grado 4 según la OMS.",
          metaforaVisual: "Glomérulos vasculares endoteliales que recuerdan a los penachos del riñón.",
          diagnosticoDiferencial: [
            "Astrocitoma anaplásico Grado 3 (atipia y mitosis elevadas pero sin necrosis ni proliferación vascular)",
            "Metástasis cerebral carcinoma (demarcación neta con parénquima y citoqueratinas positivas)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CNSHTML/CNS084.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L05-03",
          codigo: "L-NEURO-03",
          diagnostico: "Meningioma Meningotelial / Psamomatoso",
          organo: "Meninges (Duramadre craneal)",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia meníngea benigna (Grado 1 OMS)",
          definicionRobbins: "Tumor benigno originado en las células meningoteliales de la aracnoides, típicamente adherido a la duramadre y de crecimiento lento.",
          triadaPatognomonica: [
            "Disposición en verticilos, espirales o remolinos concéntricos de células meningoteliales.",
            "Células con citoplasma sincitial mal delimitado y núcleos ovoides con pseudoinclusiones nucleares citoplasmáticas e invaginaciones.",
            "Cuerpos de Psamoma: microcalcificaciones concéntricas laminadas redondas basófilas en el centro de los verticilos."
          ],
          perlaDiagnostica: "Son típicamente positivos para EMA (antígeno de membrana epitelial) y receptores de progesterona (PR), explicando su mayor incidencia y crecimiento durante el embarazo en mujeres.",
          metaforaVisual: "Remolinos de agua o 'capas de cebolla' con calcificaciones concéntricas (psamomas).",
          diagnosticoDiferencial: [
            "Schwannoma (S100 positivo intenso, cuerpos de Verocay, sin cuerpos de Psamoma)",
            "Meningioma atípico Grado 2 (≥ 4 mitosis por 10 CGA, pérdida de arquitectura o invasión ósea)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CNSHTML/CNS090.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L05-04",
          codigo: "L-NEURO-04",
          diagnostico: "Ependimoma con Pseudoorosetas Perivasculares",
          organo: "Médula espinal / Cuarto ventrículo",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia glial de la pared ventricular",
          definicionRobbins: "Tumor originado en las células ependimarias que tapizan el sistema ventricular y el canal central medular.",
          triadaPatognomonica: [
            "Pseudoorosetas perivasculares: células tumorales cuyos núcleos se alejan radialmente de un vaso central proyectando prolongaciones fibrilares acelulares hacia la pared vascular.",
            "Rosetas ependimarias verdaderas (ocasionales): células cilíndricas dispuestas concéntricamente alrededor de una luz central vacía que recuerda el conducto ependimario.",
            "Fondo fibrilar glial uniforme con núcleos redondos u ovoides con cromatina granular densa."
          ],
          perlaDiagnostica: "La zona perivascular acelular es patognomónica; en inmunohistoquímica expresan GFAP y muestran positividad en 'punto' para EMA citoplasmático.",
          metaforaVisual: "Ruedas de carreta donde el eje es el vaso sanguíneo y los radios son las prolongaciones celulares.",
          diagnosticoDiferencial: [
            "Meduloblastoma (células embrionarias pequeñas redondas con rosetas de Homer-Wright sin vaso central)",
            "Oligodendroglioma (aspecto en 'huevo frito' con red capilar en 'alambre de gallinero')"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/CNSHTML/CNS087.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 6,
      unidadId: "U2",
      titulo: "Patología endocrina",
      fechas: {
        martes: "29/09/2026",
        jueves: "01/10/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Básica",
      dificultadNivel: 1,
      resumenSemana: "Reconocimiento morfológico de las lesiones nodulares de tiroides (bocio coloide, tiroiditis autoinmune y carcinoma papilar con sus rasgos nucleares cardinales) y adenomas hipofisarios.",
      laminas: [
        {
          id: "L06-01",
          codigo: "L-ENDO-01",
          diagnostico: "Bocio Coloide Nodular Tiroideo",
          organo: "Glándula Tiroides",
          tincion: "H&E",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Hiperplasia nodular folicular no neoplásica",
          definicionRobbins: "Agrandamiento tiroideo multinodular secundario a ciclos repetidos de hiperplasia e involución folicular por estimulación desequilibrada de TSH.",
          triadaPatognomonica: [
            "Folículos tiroideos de tamaño muy irregular: desde microfolículos hasta macrofolículos gigantes distendidos repletos de coloide denso eosinófilo.",
            "Epitelio folicular aplanado o cúbico atrófico por la presión del coloide luminal.",
            "Estroma con fibrosis, focos de hemorragia reciente/antigua con hemosiderina y áreas de calcificación distrófica sin cápsula tumoral verdadera."
          ],
          perlaDiagnostica: "A diferencia del adenoma folicular, no tiene una cápsula fibrosa completa bien formada que comprima el parénquima exterior; muestra múltiples nódulos confluentes sin atipia nuclear.",
          metaforaVisual: "Lagos gigantescos de coloide rosado rodeados de epitelio plano como baldosas.",
          diagnosticoDiferencial: [
            "Adenoma folicular tiroideo (nódulo único encapsulado con compresión del tejido tiroideo adyacente)",
            "Enfermedad de Graves (epitelio cilíndrico hiperplásico alto con proyecciones papilares y festoneado del coloide periférico)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/ENDOHTML/ENDO022.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L06-02",
          codigo: "L-ENDO-02",
          diagnostico: "Tiroiditis Crónica de Hashimoto (Linfocítica)",
          organo: "Glándula Tiroides",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Destrucción autoinmunitaria del parénquima folicular",
          definicionRobbins: "Causa más común de hipotiroidismo en áreas con yodo suficiente; destrucción inmunitaria mediada por células T citotóxicas y anticuerpos contra tiroglobulina y TPO.",
          triadaPatognomonica: [
            "Infiltrado inflamatorio linfoplasmocitario intersticial difuso masivo con formación de folículos linfoides y centros germinales prominentes.",
            "Metaplasia de células de Hürthle (células oxífilas / de Askanazy): células foliculares transformadas con citoplasma granular eosinófilo brillante repleto de mitocondrias.",
            "Atrofia, colapso y reducción drástica de los folículos tiroideos con escasez o ausencia de coloide."
          ],
          perlaDiagnostica: "Los pacientes tienen un riesgo significativamente aumentado de desarrollar linfoma tiroideo no Hodgkin de células B de la zona marginal (linfoma MALT).",
          metaforaVisual: "Un ganglio linfático germinal que ha invadido y sustituido a la glándula tiroides, salpicado de células de Hürthle rosadas intensas.",
          diagnosticoDiferencial: [
            "Tiroiditis subaguda de De Quervain (granulomas con células gigantes de cuerpo extraño alrededor de coloide extravasado)",
            "Linfoma tiroideo primario (sábanas monótonas de linfocitos atípicos que destruyen la pared de los vasos)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/ENDOHTML/ENDO025.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L06-03",
          codigo: "L-ENDO-03",
          diagnostico: "Carcinoma Papilar de Tiroides (Rasgos Nucleares Patognomónicos)",
          organo: "Glándula Tiroides",
          tincion: "H&E",
          aumentoRecomendado: "40X",
          tipoLesion: "Neoplasia epitelial maligna tiroidea",
          definicionRobbins: "El cáncer tiroideo más frecuente (>85%); su diagnóstico se basa exclusivamente en alteraciones nucleares diagnósticas específicas independientemente de la presencia de papilas.",
          triadaPatognomonica: [
            "Núcleos en vidrio esmerilado / 'ojos de la huérfana Annie' (cromatina finamente dispersa y clara que hace ver al núcleo ópticamente vacío).",
            "Hendiduras o ranuras nucleares longitudinales (ranuras en 'grano de café') y pseudoinclusiones citoplasmáticas intranucleares.",
            "Cuerpos de Psamoma (calcificaciones concéntricas laminadas basófilas en los ejes de las papilas fibrovasculares)."
          ],
          perlaDiagnostica: "Incluso si el tumor forma folículos puros sin una sola papila (variante folicular del carcinoma papilar), la presencia de estos núcleos confirma malignidad papilar.",
          metaforaVisual: "Núcleos transparentes como los ojos de la niña de historieta 'Annie la huerfanita' y ranuras en grano de café.",
          diagnosticoDiferencial: [
            "Carcinoma folicular de tiroides (cápsula invadida o permeación vascular, sin núcleos de Orphan Annie)",
            "Carcinoma medular de tiroides (origen en células C, estroma amiloide rojo Congo positivo, calcitonina positiva)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/ENDOHTML/ENDO028.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L06-04",
          codigo: "L-ENDO-04",
          diagnostico: "Adenoma Hipofisario (Prolactinoma / Corticotropinoma)",
          organo: "Adenohipófisis (Silla turca)",
          tincion: "H&E / Reticulina",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia neuroendocrina benigna monoclonal",
          definicionRobbins: "Tumor benigno originado en las células epiteliales de la adenohipófisis que produce disrupción de la red normal de reticulina reticular.",
          triadaPatognomonica: [
            "Monotonía celular marcada: sábanas, nidos o cordones de células homogéneas con idéntica afinidad tintorial (todas acidófilas, basófilas o cromófobas).",
            "Pérdida completa de la red de reticulina que normalmente delimita los nidos acinares en la hipófisis sana (colapso visible en tinción de reticulina).",
            "Ausencia de estroma conectivo fibroso intercelular significativo y rica vascularización capilar sinusoidal fenestrada."
          ],
          perlaDiagnostica: "La tinción de plata para reticulina es la prueba de oro patológica: en la hipófisis sana la red está intacta envolviendo acinos; en el adenoma la trama se borra por completo.",
          metaforaVisual: "Un 'mar monótono' de células clonadas idénticas que han borrado el mosaico celular habitual.",
          diagnosticoDiferencial: [
            "Hiperplasia adenohipofisaria (la red de reticulina está distendida pero intacta y se preserva el polimorfismo celular)",
            "Craneofaringioma (células epiteliales con queratina laminar húmeda y cristales de colesterol en 'aceite de motor de maquinaria')"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/ENDOHTML/ENDO006.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 7,
      unidadId: "U2",
      titulo: "Patología renal",
      fechas: {
        martes: "06/10/2026",
        jueves: "08/10/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Avanzada",
      dificultadNivel: 3,
      resumenSemana: "Diagnóstico diferencial morfológico de las glomerulopatías no proliferativas (membranosa) y proliferativas (postestreptocócica/crescéntica), tiroidización tubular en pielonefritis y cáncer renal de células claras.",
      laminas: [
        {
          id: "L07-01",
          codigo: "L-REN-01",
          diagnostico: "Nefropatía Membranosa (Glomerulonefritis Membranosa)",
          organo: "Riñón (Corteza)",
          tincion: "H&E / PAS / Plata Metenamina de Jones",
          aumentoRecomendado: "40X - 100X",
          tipoLesion: "Glomerulopatía no proliferativa por inmunocomplejos",
          definicionRobbins: "Causa principal de síndrome nefrótico en adultos no diabéticos, mediada por anticuerpos frente a PLA2R con depósitos subepiteliales inmunitarios difusos.",
          triadaPatognomonica: [
            "Engrosamiento difuso y homogéneo de las paredes de las asas capilares glomerulares en todo el glomérulo.",
            "Ausencia de proliferación celular mesangial o endotelial significativa (glomérulos normocelulares).",
            "Patrón de 'espículas y huecos' (spikes and domes) en la membrana basal visible en tinción de plata metenamina (Jones)."
          ],
          perlaDiagnostica: "En inmunofluorescencia exhibe un patrón granular difuso en 'cielo estrellado' de IgG y C3 a lo largo de todas las membranas basales capilares.",
          metaforaVisual: "Asas capilares de alambre rígidas con púas o 'espículas' en su contorno externo epitelial.",
          diagnosticoDiferencial: [
            "Glomerulonefritis membranoproliferativa (hay doble contorno en 'riel de tranvía' con marcada hipercelularidad mesangial)",
            "Amiloidosis renal (depósitos de material amorfo acelular rojo Congo positivo con birrefringencia verde manzana)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/RENAHTML/RENAL020.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L07-02",
          codigo: "L-REN-02",
          diagnostico: "Glomerulonefritis Proliferativa Aguda (Postinfecciosa / Crescéntica)",
          organo: "Riñón",
          tincion: "H&E / PAS",
          aumentoRecomendado: "40X",
          tipoLesion: "Glomerulonefritis hipercelular inflamatoria exudativa",
          definicionRobbins: "Glomerulopatía inflamatoria aguda inducida por inmunocomplejos tras infección faríngea o cutánea por estreptococo beta-hemolítico del grupo A.",
          triadaPatognomonica: [
            "Glomérulos voluminosos marcadamente hipercelulares que desbordan y ocupan la totalidad del espacio de Bowman.",
            "Proliferación de células endoteliales y mesangiales con oclusión casi total de las luces capilares.",
            "Infiltrado prominente de neutrófilos intraglomerulares ('exudativa') y formación de semilunas celulares en casos graves rápidamente progresivos."
          ],
          perlaDiagnostica: "En microscopía electrónica se aprecian los depósitos electrodensos subepiteliales en forma de 'jorobas' (humps) patognomónicos.",
          metaforaVisual: "Glomérulos hinchados como esferas hiperdensas que colapsan la cápsula de Bowman sin luces capilares visibles.",
          diagnosticoDiferencial: [
            "Nefropatía por IgA (proliferación mesangial focal sin neutrófilos masivos)",
            "Nefritis lúpica clase IV (depósitos en 'asas de alambre' subendoteliales con cariorrexis)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/RENAHTML/RENAL014.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L07-03",
          codigo: "L-REN-03",
          diagnostico: "Pielonefritis Crónica con Tiroidización Renal",
          organo: "Riñón",
          tincion: "H&E / PAS",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Nefropatía tubulointersticial cicatrizal crónica",
          definicionRobbins: "Inflamación tubulointersticial crónica cicatrizante con deformidad de cálices y pelvis renal secundaria a infecciones bacterianas recurrentes o reflujo vesicoureteral.",
          triadaPatognomonica: [
            "Tiroidización renal: túbulos atróficos dilatados rellenos de cilindros hialinos de proteína de Tamm-Horsfall densamente eosinófilos que remedan folículos tiroideos.",
            "Infiltrado inflamatorio crónico linfoide y plasmocitario difuso en el intersticio cortical y medular.",
            "Intensa fibrosis intersticial peritubular con periglomerulitis fibrosa concéntrica en 'capas de cebolla' y esclerosis glomerular global."
          ],
          perlaDiagnostica: "La presencia de cicatrices groseras en polo superior e inferior sobre cálices dilatados deformados es el correlato macroscópico de la tiroidización microscópica.",
          metaforaVisual: "El riñón 'disfrazado' de tiroides: cilindros proteicos coloides en luces tubulares dilatadas.",
          diagnosticoDiferencial: [
            "Nefrosclerosis hipertensiva benigna (compromete arteriolas con hialinosis sin tiroidización ni deformidad calicial)",
            "Nefritis intersticial por fármacos (infiltrado con abundantes eosinófilos sin cicatrices caliciales)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/RENAHTML/RENAL044.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L07-04",
          codigo: "L-REN-04",
          diagnostico: "Carcinoma Renal de Células Claras",
          organo: "Riñón (Corteza)",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia epitelial maligna de túbulos proximales",
          definicionRobbins: "El subtipo más común de cáncer renal (70-80%), estrechamente asociado a pérdida o mutación del gen supresor tumoral VHL en el cromosoma 3p.",
          triadaPatognomonica: [
            "Nidos, cordones y sábanas de células tumorales poligonales con citoplasma transparente ópticamente vacío (rico en glucógeno y lípidos disueltos).",
            "Red estromal vascular sumamente delicada de capilares sinusoidales arboriformes que rodea cada nido tumoral.",
            "Límites celulares bien definidos ('células vegetales') con grados nucleares ISUP/WHO según la visibilidad nucleolar."
          ],
          perlaDiagnostica: "La extrema riqueza de capilares de pared delgada explica la marcada propensión a la invasión neoplásica de la vena renal y la hematuria intermitente macroscópica.",
          metaforaVisual: "Mosaico de 'células vegetales' transparentes envueltas en una fina red de alambre vascular.",
          diagnosticoDiferencial: [
            "Carcinoma renal cromófobo (citoplasma acidófilo perinuclear con halos claros y núcleos en 'pasa de uva')",
            "Oncocitoma benigno (células intensamente eosinófilas por densidad mitocondrial, sin atipia ni células claras)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/RENAHTML/RENAL060.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 8,
      unidadId: "U2",
      titulo: "I EXAMEN PRÁCTICO (Evaluación de Unidades I y II)",
      esExamen: true,
      tipoExamen: "Parcial",
      fechas: {
        martes: "13/10/2026",
        jueves: "15/10/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Examen",
      dificultadNivel: 4,
      resumenSemana: "Hito Evaluativo Mayor: Examen práctico en microscopios ópticos por estaciones cronometradas (2 minutos por lámina). Evaluación ciega de diagnóstico histopatológico, órgano, tipo de lesión y criterios de oro.",
      laminas: [
        {
          id: "L08-01",
          codigo: "EXAMEN-01",
          diagnostico: "Estaciones de Microscopía: Sistema Cardiovascular, Respiratorio, Nervioso, Endocrino y Renal",
          organo: "Órganos correspondientes a las Semanas 1 a 7",
          tincion: "H&E / Tinciones Especiales (PAS, Masson, Ziehl-Neelsen)",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Evaluación Práctica Sumativa Oficial",
          definicionRobbins: "Evaluación práctica individualizada según rúbrica oficial UNMSM. El estudiante debe demostrar competencia en reconocimiento morfológico, diferenciación entre procesos benignos y malignos, y correlación anatomoclínica.",
          triadaPatognomonica: [
            "Identificación correcta del tejido/órgano de origen a 10X.",
            "Diagnóstico de precisión de la entidad patológica a 40X.",
            "Identificación de 2 criterios histológicos patognomónicos por estación."
          ],
          perlaDiagnostica: "¡Consejo de Oro para el Examen!: Comienza siempre escaneando a 4X o 10X para comprender la arquitectura (papilar, folicular, tubular, granulomatosa) antes de saltar a 40X a buscar mitosis o atipias.",
          metaforaVisual: "Carrusel rotatorio de microscopios con timbre de cambio de estación cada 120 segundos.",
          diagnosticoDiferencial: [
            "Revisar tabla de diagnósticos diferenciales de semanas 1 a 7"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 9,
      unidadId: "U3",
      titulo: "Patología urogenital",
      fechas: {
        martes: "20/10/2026",
        jueves: "22/10/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Media",
      dificultadNivel: 2,
      resumenSemana: "Diagnóstico diferencial entre hiperplasia benigna y adenocarcinoma de próstata (criterios de Gleason y pérdida de la capa basal), carcinoma urotelial de vejiga y seminoma testicular.",
      laminas: [
        {
          id: "L09-01",
          codigo: "L-URO-01",
          diagnostico: "Hiperplasia Prostática Benigna (HPB)",
          organo: "Próstata (Zona transicional periuretral)",
          tincion: "H&E",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Proliferación nodular estromal y glandular benigna",
          definicionRobbins: "Agrandamiento prostático no neoplásico extremadamente prevalente en hombres mayores de 50 años inducido por dihidrotestosterona (DHT).",
          triadaPatognomonica: [
            "Nódulos hiperplásicos de glándulas revestidas por doble capa celular intacta (capa externa mioepitelial basal y capa interna secretora luminal).",
            "Pliegues papilares intraluminales regulares tapizados por epitelio cilíndrico sin atipia nuclear.",
            "Cuerpos amiláceos (corpora amylacea) laminares densamente eosinófilos en las luces glandulares distendidas."
          ],
          perlaDiagnostica: "La presencia estricta de la doble capa celular (confirmable con p63 o citoqueratina de alto peso molecular positiva en basales) excluye de manera categórica el adenocarcinoma.",
          metaforaVisual: "Glándulas festoneadas de doble carril con cuerpos amiláceos semejando rocas concéntricas en su interior.",
          diagnosticoDiferencial: [
            "Adenocarcinoma prostático acinar (capa basal ausente, nucléolos gigantes, glándulas apiñadas pequeñas)",
            "Prostatitis crónica granulomatosa"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/MALEHTML/MALE014.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L09-02",
          codigo: "L-URO-02",
          diagnostico: "Adenocarcinoma de Próstata (Escala de Gleason / Grupos Grado ISUP)",
          organo: "Próstata (Zona periférica posterior)",
          tincion: "H&E / Inmunohistoquímica (p63/AMACR)",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia epitelial maligna invasora",
          definicionRobbins: "La neoplasia maligna visceral más común en varones; surge típicamente en la zona periférica y su graduación histológica de Gleason predice con precisión el pronóstico.",
          triadaPatognomonica: [
            "Ausencia absoluta de la capa de células basales mioepiteliales (p63 negativa) en los acinos malignos.",
            "Glándulas pequeñas, atestadas, irregulares que infiltran de manera invasiva entre los acinos benignos normales.",
            "Macronucléolos prominentes hipertróficos y cristaloides eosinófilos intraluminales con tinción positiva para AMACR.",
            "Invasión perineural tumoral confirmatoria de malignidad."
          ],
          perlaDiagnostica: "La invasión perineural (glándulas neoplásicas abrazando o infiltrando vainas de nervios intrínsecos) es un signo microscópico irrefutable de malignidad.",
          metaforaVisual: "Acinos malignos en fila apretada con macronucléolos que resaltan como pupilas negras en un fondo celular claro.",
          diagnosticoDiferencial: [
            "Atrofia adenomatosa prostática (mantiene células basales y carece de macronucléolos)",
            "PIN de alto grado (proliferación atípica confinada dentro de ductos con células basales aún presentes)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/MALEHTML/MALE017.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L09-03",
          codigo: "L-URO-03",
          diagnostico: "Carcinoma Urotelial Papilar Invasor de Vejiga",
          organo: "Vejiga Urinaria",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia epitelial maligna urotelial",
          definicionRobbins: "Cáncer de vías urinarias derivado del urotelio de transición, fuertemente asociado al tabaquismo y exposición ocupacional a aminas aromáticas.",
          triadaPatognomonica: [
            "Proliferación papilar frondosa con ejes fibrovasculares tapizados por más de 7 capas de urotelio marcadamente atípico.",
            "Pérdida de la polaridad celular, pleomorfismo nuclear severo y frecuentes mitosis atípicas en todos los niveles epiteliales.",
            "Infiltración destructiva en nidos irregulares atravesando la lámina propia hacia la capa muscular propia (músculo detrusor)."
          ],
          perlaDiagnostica: "La distinción entre tumor que no invade músculo (Ta, T1) y tumor con invasión de muscular propia (T2) es la frontera crítica que define la indicación de cistectomía radical.",
          metaforaVisual: "Árboles papilares con urotelio desorganizado anárquico cuyas raíces penetran los haces musculares.",
          diagnosticoDiferencial: [
            "Papiloma urotelial benigno (delgado, <7 capas celulares, sin atipia ni mitosis)",
            "Carcinoma epidermoide de vejiga (asociado a Schistosoma haematobium con queratina)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/RENAHTML/RENAL072.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L09-04",
          codigo: "L-URO-04",
          diagnostico: "Seminoma Testicular Clásico",
          organo: "Testículo",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Tumor maligno de células germinales seminomatoso",
          definicionRobbins: "El tumor de células germinales testicular más frecuente (50%), caracterizado por células homogéneas claras y tabiques fibrosos linfocitarios.",
          triadaPatognomonica: [
            "Sábanas y nidos uniformes de células tumorales poligonales grandes con citoplasma claro rico en glucógeno (PAS positivo).",
            "Núcleo vesicular redondo central prominente con uno o dos nucleolos gigantes y membrana nuclear bien marcada.",
            "Septos de tejido conectivo fibroso delicado ricamente infiltrados por linfocitos T maduros y granulomas histiocitarios ocasionales."
          ],
          perlaDiagnostica: "Son intensamente radiosensibles y quimiosensibles (curación >95% en estadio I); expresan positividad inmunohistoquímica para OCT3/4, SALL4, c-KIT (CD117) y D2-40.",
          metaforaVisual: "Células monótonas como 'huevos fritos' claros empaquetadas entre delgadas cortinas de linfocitos.",
          diagnosticoDiferencial: [
            "Carcinoma embrionario (células anaplásicas con pleomorfismo marcado, mitosis atípicas y necrosis)",
            "Linfoma testicular difuso de células B grandes (en varones ancianos, no septado, CD20 positivo)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/MALEHTML/MALE040.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 10,
      unidadId: "U3",
      titulo: "Patología mamaria",
      fechas: {
        martes: "27/10/2026",
        jueves: "29/10/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Avanzada",
      dificultadNivel: 3,
      resumenSemana: "Correlación diagnóstica entre lesiones benignas (fibroadenoma, cambios fibroquísticos) y malignas invasivas (carcinoma ductal vs lobulillar en fila india con pérdida de E-cadherina).",
      laminas: [
        {
          id: "L10-01",
          codigo: "L-MAMA-01",
          diagnostico: "Fibroadenoma Mamario (Patrón Intra y Pericanalicular)",
          organo: "Glándula mamaria",
          tincion: "H&E",
          aumentoRecomendado: "10X - 20X",
          tipoLesion: "Tumor bifásico fibroepitelial benigno",
          definicionRobbins: "El tumor mamario benigno más común en mujeres jóvenes fértiles; proliferación armónica del estroma intralobulillar y de los conductos mamarios.",
          triadaPatognomonica: [
            "Proliferación estromal celular mixoide o colágena laxa sin atipia nuclear ni mitosis patológicas.",
            "Patrón intracanalicular: compresión del estroma sobre los ductos colapsándolos en hendiduras o hendiduras ramificadas en astas de ciervo.",
            "Patrón pericanalicular: proliferación concéntrica ordenada de estroma rodeando conductos mamarios redondos abiertos con doble capa celular conservada."
          ],
          perlaDiagnostica: "A diferencia del tumor filodes, el estroma del fibroadenoma no muestra hipercelularidad atípica, sobrecrecimiento estromal ni figuras mitóticas frecuentes.",
          metaforaVisual: "Ductos mamarios aplastados como 'astas de ciervo' en medio de un estroma fibroso ondulante.",
          diagnosticoDiferencial: [
            "Tumor filodes benigno (estroma hipercelular condensado subepitelial con hendiduras foliáceas en hoja)",
            "Adenosis esclerosante (lobulillos distorsionados con fibrosis pero conservando arquitectura lobulillar)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/BREAHTML/BREA004.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L10-02",
          codigo: "L-MAMA-02",
          diagnostico: "Carcinoma Ductal In Situ (CDIS con Patrón Comedocarcinoma)",
          organo: "Glándula mamaria",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia epitelial maligna no invasora",
          definicionRobbins: "Proliferación clonal maligna de células epiteliales confinada dentro del sistema ductal mamario sin rotura de la membrana basal mioepitelial.",
          triadaPatognomonica: [
            "Conductos mamarios marcadamente dilatados y repletos de células epiteliales tumorales malignas atípicas.",
            "Zona central de necrosis eosinófila acelular en 'comedón' con detritos nucleares y microcalcificaciones basófilas distróficas.",
            "Membrana basal del conducto y capa mioepitelial periférica intactas (p63 positiva continua)."
          ],
          perlaDiagnostica: "El comedocarcinoma es la variante de mayor grado citológico de CDIS; las microcalcificaciones intraluminales son las que alertan al radiólogo en la mamografía de tamizaje.",
          metaforaVisual: "Ductos rellenos de células atípicas con un tapón central de necrosis semejante al sebo de un comedón.",
          diagnosticoDiferencial: [
            "Hiperplasia ductal atípica (ADH: lesión menor a 2 mm o que no llena completamente los conductos)",
            "Carcinoma ductal invasivo (ruptura de membrana basal con infiltración al estroma circundante)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/BREAHTML/BREA010.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L10-03",
          codigo: "L-MAMA-03",
          diagnostico: "Carcinoma Ductal Invasivo No Especial (NST / Ductal Infiltrante)",
          organo: "Glándula mamaria",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia maligna invasora de mama (75% de casos)",
          definicionRobbins: "El tipo más frecuente de cáncer de mama invasivo; infiltra el estroma mamario formando cordones, nidos sólidos y túbulos con densa desmoplasia.",
          triadaPatognomonica: [
            "Infiltración destructiva del estroma colágeno y tejido adiposo por nidos y cordones de células epiteliales atípicas.",
            "Reacción estromal desmoplásica colágena densa peritumoral (estroma fibroso duro esclerosante).",
            "Pérdida total de células mioepiteliales peritumorales con atipia nuclear variable y mitosis (Graduación de Nottingham)."
          ],
          perlaDiagnostica: "La evaluación inmunohistoquímica de receptores de estrógeno (RE), progesterona (RP), HER2 y Ki-67 define los subtipos moleculares intrínsecos (Luminal A, Luminal B, HER2 enriquecido y Triple Negativo).",
          metaforaVisual: "Nidos celulares estelares que avanzan e invaden agresivamente la grasa mamaria.",
          diagnosticoDiferencial: [
            "Carcinoma lobulillar invasivo (células discohesivas en hilera india sin desmoplasia cohesiva)",
            "Cicatriz radiada / Lesión esclerosante compleja (mantiene células mioepiteliales basales p63+)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/BREAHTML/BREA015.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L10-04",
          codigo: "L-MAMA-04",
          diagnostico: "Carcinoma Lobulillar Infiltrante (Pérdida de E-Cadherina)",
          organo: "Glándula mamaria",
          tincion: "H&E / Inmunohistoquímica (E-Cadherina)",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia epitelial maligna discohesiva",
          definicionRobbins: "Segundo tipo más común de cáncer mamario (10-15%); caracterizado por la pérdida de la molécula de adhesión intercelular E-cadherina (mutación en CDH1).",
          triadaPatognomonica: [
            "Células neoplásicas monomórficas pequeñas discohesivas dispuestas en filas individuales de un solo archivo ('filas indias').",
            "Disposición concéntrica de células tumorales rodeando conductos mamarios benignos normales ('patrón en diana').",
            "Pérdida total y completa de la tinción de membrana para E-cadherina por inmunohistoquímica."
          ],
          perlaDiagnostica: "Debido a su patrón infiltrativo difuso sin desmoplasia marcada, suele ser clínicamente difícil de palpar y con mamografía falsamente negativa; tiene mayor propensión a la bilateralidad y multicentricidad.",
          metaforaVisual: "Células marchando en fila de a uno ('fila india') sorteando las fibras de colágeno sin formar túbulos.",
          diagnosticoDiferencial: [
            "Carcinoma ductal invasivo (forma túbulos o nidos y expresa E-cadherina membranosa positiva)",
            "Linfocitos inflamatorios en el estroma (células más pequeñas, CD45 positivas)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/BREAHTML/BREA017.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 11,
      unidadId: "U3",
      titulo: "Patología ginecológica",
      fechas: {
        martes: "03/11/2026",
        jueves: "05/11/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Avanzada",
      dificultadNivel: 3,
      resumenSemana: "Reconocimiento citohistológico de lesiones preinvasoras e invasoras del cuello uterino por VPH oncogénico (coilocitosis, NIC I-III), adenocarcinoma de endometrio y neoplasias ováricas.",
      laminas: [
        {
          id: "L11-01",
          codigo: "L-GIN-01",
          diagnostico: "Neoplasia Intraepitelial Cervical (NIC I / LIE de Bajo Grado con Coilocitosis)",
          organo: "Cuello uterino (Zona de transformación)",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Lesión escamosa intraepitelial premaligna / VPH",
          definicionRobbins: "Efecto citopático del virus del papiloma humano (VPH) de alto riesgo con atipia nuclear limitada al tercio inferior del epitelio escamoso estratificado.",
          triadaPatognomonica: [
            "Coilocitos patognomónicos en capas intermedias y superficiales: núcleos agrandados, hipercromáticos, irregulares con halo claro perinuclear bien demarcado.",
            "Desorganización arquitectural y mitosis confinadas estrictamente al tercio inferior (tercio basal) del epitelio.",
            "Maduración y aplanamiento celular preservado en los dos tercios superiores del epitelio con membrana basal íntegra."
          ],
          perlaDiagnostica: "En NIC III (LIE de alto grado), la desdiferenciación celular, la pérdida de polaridad y las mitosis atípicas ocupan todo el espesor del epitelio escamoso (carcinoma in situ).",
          metaforaVisual: "Células con 'halo de ángel' blanco perinuclear y núcleos arrugados como pasas de uva.",
          diagnosticoDiferencial: [
            "NIC III (p16 difusamente positivo en bloque en todo el espesor, Ki-67 > 50%)",
            "Cambios reactivos por cervicitis (halos perinucleares tenues sin atipia nuclear)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/FEMHTML/FEM010.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L11-02",
          codigo: "L-GIN-02",
          diagnostico: "Carcinoma Epidermoide de Cérvix Infiltrante",
          organo: "Cuello uterino (Exocérvix / Endocérvix)",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia epitelial maligna invasora",
          definicionRobbins: "Carcinoma invasor del cuello uterino originado en la zona de transformación tras infección persistente por genotipos oncogénicos de VPH (especialmente 16 y 18).",
          triadaPatognomonica: [
            "Rotura franca de la membrana basal con nidos y lengüetas de células escamosas atípicas infiltrando el estroma cervical.",
            "Pleomorfismo nuclear marcado, mitosis atípicas, disqueratosis y perlas córneas de queratina (en variante queratinizante).",
            "Intensa respuesta inflamatoria linfohistiocitaria y desmoplasia estromal circundante."
          ],
          perlaDiagnostica: "La positividad intensa y continua ('en bloque') para p16INK4a por sobreexpresión secundaria a la degradación de Rb por la oncoproteína viral E7 confirma la etiología por VPH de alto riesgo.",
          metaforaVisual: "Lengüetas escamosas invasoras que carcomen el estroma fibromuscular cervical.",
          diagnosticoDiferencial: [
            "NIC III con afectación glandular endocervical (la membrana basal de las glándulas está respetada)",
            "Adenocarcinoma endocervical (forma luces glandulares mucinosas y es CEA/p16 positivo)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/FEMHTML/FEM014.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L11-03",
          codigo: "L-GIN-03",
          diagnostico: "Adenocarcinoma Endometrioide de Endometrio",
          organo: "Útero (Endometrio / Miometrio)",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia epitelial maligna glandular Tipo I (estrógeno-dependiente)",
          definicionRobbins: "El cáncer invasivo más común del aparato reproductor femenino en países desarrollados; surge sobre hiperplasia endometrial con atipia ligada a exceso estrogénico.",
          triadaPatognomonica: [
            "Arquitectura glandular 'espalda con espalda' (back-to-back): glándulas atípicas complejas fusionadas sin estroma interpuesto.",
            "Estratificación celular epitelial con pérdida de polaridad, hipercromatismo y mitosis frecuentes.",
            "Invasión destructiva del estroma endometrial y permeación infiltrante a través de los fascículos del miometrio."
          ],
          perlaDiagnostica: "El grado histológico FIGO se define por el porcentaje de crecimiento sólido no glandular ni escamoso: Grado 1 (≤5%), Grado 2 (6-50%), Grado 3 (>50% sólido).",
          metaforaVisual: "Glándulas tumorales coalescentes que se tocan pared con pared sin tejido conjuntivo intermedio.",
          diagnosticoDiferencial: [
            "Hiperplasia endometrial atípica (confinada a la mucosa sin invasión miometrial)",
            "Carcinoma seroso de endometrio Tipo II (papilas con marcada atipia nuclear y mutación de TP53 difusa)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/FEMHTML/FEM028.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L11-04",
          codigo: "L-GIN-04",
          diagnostico: "Cistadenocarcinoma Seroso de Ovario de Alto Grado",
          organo: "Ovario",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia epitelial maligna ovárica (más del 70% de cáncer ovárico)",
          definicionRobbins: "Tumor maligno derivado del epitelio de la fimbria tubárica o superficie ovárica, fuertemente asociado a mutaciones en TP53 y genes BRCA1/2.",
          triadaPatognomonica: [
            "Estructuras papilares complejas con tallos fibrovasculares revestidas por células marcadamente anaplásicas con atipia severa.",
            "Cuerpos de Psamoma concéntricos calcificados abundantes en el estroma de las papilas.",
            "Crecimiento sólido infiltrante difuso con necrosis extensa y figuras mitóticas aberrantes muy elevadas."
          ],
          perlaDiagnostica: "Presenta mutación difusa de TP53 (100% de positividad en bloque o negatividad nula) y sobreexpresión de WT1, CK7 y PAX8.",
          metaforaVisual: "Frondas papilares desestructuradas cargadas de calcificaciones en perla (psamomas).",
          diagnosticoDiferencial: [
            "Cistadenoma seroso benigno (papilas simples tapizadas por monocapa de epitelio tubárico ciliado sin atipia)",
            "Tumor seroso borderline (proliferación papilar con atipia leve/moderada pero sin invasión estromal destructiva)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/FEMHTML/FEM037.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 12,
      unidadId: "U4",
      titulo: "Patología gastrointestinal",
      fechas: {
        martes: "10/11/2026",
        jueves: "12/11/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Media",
      dificultadNivel: 2,
      resumenSemana: "Reconocimiento morfológico de la cascada de carcinogénesis gástrica (Correa: gastritis crónica atrófica, metaplasia intestinal, adenocarcinoma gástrico difuso con células en anillo de sello), esófago de Barrett y cáncer colorrectal.",
      laminas: [
        {
          id: "L12-01",
          codigo: "L-GI-01",
          diagnostico: "Esófago de Barrett con Metaplasia Intestinal",
          organo: "Esófago distal (Unión gastroesofágica)",
          tincion: "H&E / Alcian Blue",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Metaplasia epitelial columnar adaptativa",
          definicionRobbins: "Complicación de la enfermedad por reflujo gastroesofágico (ERGE) crónico; sustitución del epitelio escamoso estratificado por epitelio cilíndrico intestinal con células caliciformes.",
          triadaPatognomonica: [
            "Presencia inequívoca de células caliciformes verdaderas (células globosas con vacuola de mucina ácida azul en Alcian Blue).",
            "Sustitución de la mucosa escamosa esofágica por arquitectura glandular de tipo intestinal con criptas.",
            "Lámina propia con infiltrado inflamatorio crónico de linfocitos y células plasmáticas."
          ],
          perlaDiagnostica: "La presencia de células caliciformes es el criterio histopatológico estricto que define el esófago de Barrett y confiere riesgo aumentado de adenocarcinoma de esófago.",
          metaforaVisual: "Células caliciformes teñidas de azul turquesa en Alcian Blue semejando copas de cristal en la mucosa esofágica.",
          diagnosticoDiferencial: [
            "Metaplasia gástrica foveolar (células cilíndricas que producen mucina neutra sin células caliciformes verdaderas)",
            "Displasia de alto grado en esófago de Barrett (estratificación nuclear, mitosis en superficie y pérdida de mucosecreción)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/GIHTML/GI007.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L12-02",
          codigo: "L-GI-02",
          diagnostico: "Gastritis Crónica por Helicobacter pylori con Metaplasia Intestinal",
          organo: "Estómago (Antro gástrico)",
          tincion: "H&E / Giemsa / Warthin-Starry",
          aumentoRecomendado: "40X - 100X",
          tipoLesion: "Inflamación gástrica activa y crónica con atrofia glandular",
          definicionRobbins: "Infección bacteriana gástrica crónica que induce infiltrado inflamatorio mononuclear en lámina propia, daño foveolar y metaplasia intestinal preneoplásica.",
          triadaPatognomonica: [
            "Bacterias espiriladas curvadas (H. pylori) adheridas a la superficie de las células foveolares y dentro de las criptas mucosas (visibles con Giemsa).",
            "Infiltrado inflamatorio mixto: linfocitos y células plasmáticas en la lámina propia (cronicidad) y neutrófilos intraepiteliales (actividad).",
            "Focos de metaplasia intestinal con aparición de células caliciformes y enterocitos con borde en cepillo."
          ],
          perlaDiagnostica: "La presencia de neutrófilos en el epitelio glandular define 'actividad' y se asocia estrechamente a la presencia viable de la bacteria; su erradicación resuelve la inflamación activa.",
          metaforaVisual: "Pequeñas 'gaviotas' o 'comas' azuladas nadando sobre la capa de moco gástrico en la tinción de Giemsa.",
          diagnosticoDiferencial: [
            "Gastritis autoinmune (afecta cuerpo/fundus con atrofia de células parietales y anemia perniciosa)",
            "Gastritis química / reactiva por reflujo biliar o AINEs (hiperplasia foveolar con escasa inflamación celular)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/GIHTML/GI017.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L12-03",
          codigo: "L-GI-03",
          diagnostico: "Adenocarcinoma Gástrico Difuso (Células en Anillo de Sello / Linitis Plástica)",
          organo: "Estómago (Pared gástrica)",
          tincion: "H&E / PAS / Mucicarmín",
          aumentoRecomendado: "40X",
          tipoLesion: "Neoplasia maligna gástrica discohesiva infiltrante",
          definicionRobbins: "Carcinoma gástrico indiferenciado de tipo difuso (clasificación de Lauren); células no forman glándulas sino que infiltran individualmente la pared gástrica con mutación de E-cadherina.",
          triadaPatognomonica: [
            "Células en anillo de sello: células tumorales redondas aisladas con vacuola citoplasmática gigante de mucina que comprime el núcleo hacia la periferia.",
            "Infiltración difusa discohesiva transmural a través de la submucosa, muscular propia y serosa sin formar luces glandulares.",
            "Intensa reacción desmoplásica fibrosa colágena que engrosa y rigidiza toda la pared gástrica (linitis plástica macroscópica)."
          ],
          perlaDiagnostica: "La tinción de mucicarmín o PAS tiñe la vacuola de mucina intracelular de color magenta brillante, confirmando el origen epitelial y descartando linfoma o melanoma.",
          metaforaVisual: "Anillos de sello de oro donde la piedra preciosa del anillo es el núcleo marginado en semiluna.",
          diagnosticoDiferencial: [
            "Adenocarcinoma gástrico tipo intestinal (forma glándulas tubulares y papilas)",
            "Linfoma gástrico MALT (células linfoides sin vacuolas de mucina, CD20 positivo)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/GIHTML/GI023.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L12-04",
          codigo: "L-GI-04",
          diagnostico: "Adenocarcinoma Tubular Invasor de Colon (Con Necrosis Sucia)",
          organo: "Colon / Recto",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia epitelial maligna de la mucosa colónica",
          definicionRobbins: "La neoplasia maligna gastrointestinal más frecuente; surge mediante la vía de inestabilidad cromosómica (secuencia adenoma-carcinoma APC/K-RAS/p53) o por inestabilidad de microsatélites.",
          triadaPatognomonica: [
            "Glándulas tumorales atípicas, irregulares, ramificadas y cribiformes que infiltran la submucosa y la muscular propia.",
            "Necrosis sucia intraluminal (dirty necrosis): detritos celulares necróticos granulares basófilos y eosinófilos acumulados en las luces de las glándulas.",
            "Atipia citológica marcada: epitelio pseudoestratificado columnar alto con hipercromatismo, pérdida de polaridad y desmoplasia estromal periglandular."
          ],
          perlaDiagnostica: "La presencia de 'necrosis sucia' en una biopsia metastásica es fuertemente indicativa de origen colorrectal primario (positividad típica para CK20 y CDX2, con CK7 negativo).",
          metaforaVisual: "Glándulas tubulares monstruosas rellenas de 'barro' necrótico desmoronado.",
          diagnosticoDiferencial: [
            "Adenoma tubular de colon con displasia de alto grado (la lámina propia está respetada sin invasión de la muscularis mucosae)",
            "Enfermedad de Crohn con displasia"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/GIHTML/GI047.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 13,
      unidadId: "U4",
      titulo: "Patología hepatobiliar",
      fechas: {
        martes: "17/11/2026",
        jueves: "19/11/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Avanzada",
      dificultadNivel: 3,
      resumenSemana: "Diagnóstico anatomopatológico de la cirrosis hepática (nódulos de regeneración delimitados por septos fibrosos en Masson), esteatohepatitis alcohólica/MASH y carcinoma hepatocelular.",
      laminas: [
        {
          id: "L13-01",
          codigo: "L-HEP-01",
          diagnostico: "Cirrosis Hepática (Nódulos Regenerativos y Puentes Fibrosos)",
          organo: "Hígado",
          tincion: "H&E / Tricrómico de Masson / Reticulina",
          aumentoRecomendado: "4X - 20X",
          tipoLesion: "Remodelado fibroso difuso terminal",
          definicionRobbins: "Estadio final de la hepatopatía crónica; caracterizado por la tríada de fibrosis difusa, puentes septales porto-centrales y conversión de la arquitectura en nódulos regenerativos.",
          triadaPatognomonica: [
            "Nódulos esféricos regenerativos de hepatocitos desprovistos de vena centrolobulillar normal.",
            "Bandas y septos colágenos fibrosos que rodean y aíslan por completo cada nódulo (teñidos de azul intenso con Masson).",
            "Proliferación de conductillos biliares atípicos (reacción ductular) e infiltrado mononuclear en los septos fibrosos."
          ],
          perlaDiagnostica: "El colapso de la trama de reticulina y la formación de shunts vasculares intrahepáticos en los septos son la causa directa del síndrome de hipertensión portal.",
          metaforaVisual: "Islas redondeadas de hepatocitos prisioneras en una red azulada de colágeno denso.",
          diagnosticoDiferencial: [
            "Hepatitis crónica precirrótica (fibrosis en puentes sin nódulos regenerativos de 360 grados)",
            "Hiperplasia nodular regenerativa (nódulos hepatocitarios sin bandas fibrosas colágenas en Masson)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LIVERHTML/LIVER025.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L13-02",
          codigo: "L-HEP-02",
          diagnostico: "Esteatohepatitis Alcohólica / MASH (Cuerpos de Mallory-Denk)",
          organo: "Hígado",
          tincion: "H&E",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Degeneración hepatocitaria metabólica / tóxica",
          definicionRobbins: "Forma agresiva de daño graso hepático con necrosis hepatocitaria, balonización de células hepáticas e inflamación neutrofílica.",
          triadaPatognomonica: [
            "Degeneración balonizante de hepatocitos (hepatocitos hinchados, edematosos con pérdida de citoesqueleto).",
            "Cuerpos de Mallory-Denk: inclusiones citoplasmáticas acidófilas irregulares amorfas de citoqueratinas agregadas hiperfosforiladas.",
            "Infiltrado inflamatorio perivenular pericelular rico en leucocitos neutrófilos y fibrosis 'en red de gallinero' (fibrosis pericelular)."
          ],
          perlaDiagnostica: "La fibrosis pericelular que envuelve hepatocitos individuales como alambre de gallinero comienza en la zona 3 (centrolobulillar) por su menor oxigenación.",
          metaforaVisual: "Cuerpos de Mallory como 'madejas de lana' rojas desordenadas dentro de hepatocitos balonizados.",
          diagnosticoDiferencial: [
            "Esteatosis hepática simple (gotas lipídicas macrovacuolares sin balonización ni neutrófilos)",
            "Hepatitis viral aguda (cuerpos de Councilman apoptóticos con predominio de infiltrado linfocitario)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LIVERHTML/LIVER012.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L13-03",
          codigo: "L-HEP-03",
          diagnostico: "Carcinoma Hepatocelular (Hepatocarcinoma)",
          organo: "Hígado (Sobre fondo de cirrosis)",
          tincion: "H&E / Reticulina",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia epitelial maligna hepatocelular",
          definicionRobbins: "El tumor maligno primario del hígado más común (>85%); se desarrolla predominantemente sobre hígado cirrótico por VHB, VHC o esteatohepatitis.",
          triadaPatognomonica: [
            "Trabéculas neoplásicas engrosadas de más de 3 a 5 hepatocitos de espesor (pérdida de la placa trabecular monocelular normal).",
            "Hepatocitos tumorales poligonales con nucléolos gigantes, atipia citológica y glóbulos de bilis intracitoplasmáticos o canaliculares.",
            "Ausencia completa de espacios porta normales y colapso/ausencia de la red de fibras de reticulina alrededor de las trabéculas."
          ],
          perlaDiagnostica: "La producción microscópica de bilis por las células tumorales es la prueba reina irrefutable de diferenciación hepatocelular primaria.",
          metaforaVisual: "Trabéculas gruesas como autopistas celulares desorganizadas separadas por sinusoides dilatados sin soporte de reticulina.",
          diagnosticoDiferencial: [
            "Colangiocarcinoma intrahepático (forma glándulas mucinosas tubulares con estroma densamente desmoplásico)",
            "Metástasis hepática de adenocarcinoma (múltiples nódulos sin producción biliar)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/LIVERHTML/LIVER050.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 14,
      unidadId: "U4",
      titulo: "Patología linfohematopoyética",
      fechas: {
        martes: "24/11/2026",
        jueves: "26/11/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Avanzada",
      dificultadNivel: 3,
      resumenSemana: "Diferenciación entre neoplasias linfoides: Linfoma de Hodgkin con sus células diagnósticas de Reed-Sternberg y células lacunares vs Linfoma No Hodgkin Difuso de Células B Grandes (DLBCL) y mieloma/plasmocitoma.",
      laminas: [
        {
          id: "L14-01",
          codigo: "L-LINFO-01",
          diagnostico: "Linfoma de Hodgkin Clásico (Variedad Esclerosis Nodular)",
          organo: "Ganglio linfático (Cervical / Mediastínico)",
          tincion: "H&E / Inmunohistoquímica (CD30/CD15)",
          aumentoRecomendado: "40X",
          tipoLesion: "Neoplasia linfoide con células gigantes en estroma reactivo",
          definicionRobbins: "Subtipo más frecuente del linfoma de Hodgkin (70%); caracterizado por bandas de colágeno fibroso birrefringente y células neoplásicas lacunares.",
          triadaPatognomonica: [
            "Células de Reed-Sternberg clásicas: binucleadas con núcleos en espejo y macronucléolos eosinófilos semejantes a 'ojos de búho'.",
            "Células lacunares: células tumorales con citoplasma pálido retraído que dejan un espacio claro pericelular en cortes fijados en formol.",
            "Bandas anchas de colágeno fibroso acelular que tabican el ganglio en nódulos, inmersas en un fondo reactivo de linfocitos T, eosinófilos, células plasmáticas e histiocitos."
          ],
          perlaDiagnostica: "Las células de Reed-Sternberg representan menos del 1-2% de la masa tumoral; el 98% restante es un infiltrado reactivo no neoplásico reclutado por citocinas tumorales. Son CD30+ y CD15+.",
          metaforaVisual: "Macronucléolos rojos intensos en células binucleadas semejando 'ojos de búho' mirando al microscopista.",
          diagnosticoDiferencial: [
            "Linfoma no Hodgkin anaplásico de células grandes (CD30+, pero ALK positivo y sábanas tumorales continuas sin fondo reactivo)",
            "Linfadenitis por mononucleosis infecciosa (inmunoblastos reactivos sin bandas colágenas nodulares)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/HEMEHTML/HEME050.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L14-02",
          codigo: "L-LINFO-02",
          diagnostico: "Linfoma No Hodgkin Difuso de Células B Grandes (DLBCL)",
          organo: "Ganglio linfático",
          tincion: "H&E / Inmunohistoquímica (CD20)",
          aumentoRecomendado: "40X",
          tipoLesion: "Neoplasia linfoide B de alto grado agresiva",
          definicionRobbins: "La forma más común de linfoma no Hodgkin en adultos (30-40%); caracterizada por la proliferación difusa destructiva de linfocitos B grandes.",
          triadaPatognomonica: [
            "Borramiento difuso completo de la arquitectura del ganglio linfático (desaparición total de folículos y senos subcapsulares).",
            "Sábanas monótonas continuas de células linfoides tumorales grandes (células cuyo núcleo supera el tamaño de dos linfocitos pequeños o un macrófago).",
            "Cromatina vesicular, nucléolos prominentes múltiples adosados a la membrana nuclear y muy elevado índice proliferativo (Ki-67 > 80%)."
          ],
          perlaDiagnostica: "Positividad membranosa intensa y uniforme en el 100% de las células tumorales para CD20, lo que fundamenta el tratamiento diana con el anticuerpo monoclonal rituximab.",
          metaforaVisual: "Un 'mar monótono' de linfoblastos gigantes que ha borrado el paisaje habitual del ganglio.",
          diagnosticoDiferencial: [
            "Linfoma folicular Grado 3 (conserva patrón folicular nodular con sobreexpresión de BCL2)",
            "Carcinoma poco diferenciado metastásico (positivo para citoqueratinas y negativo para CD45/CD20)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/HEMEHTML/HEME042.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L14-03",
          codigo: "L-LINFO-03",
          diagnostico: "Plasmocitoma / Mieloma Múltiple",
          organo: "Médula ósea / Hueso",
          tincion: "H&E",
          aumentoRecomendado: "40X",
          tipoLesion: "Neoplasia clonal de células plasmáticas",
          definicionRobbins: "Neoplasia hematológica caracterizada por la proliferación clonal de células plasmáticas productoras de una inmunoglobulina monoclonal (gammapatía monoclonal).",
          triadaPatognomonica: [
            "Sábanas densas de células plasmáticas neoplásicas atípicas con núcleo excéntrico desplazado.",
            "Cromatina nuclear en 'rueda de carreta' o 'carátula de reloj' con un halo pálido paranuclear conspicuo (aparato de Golgi hipertrofiado).",
            "Células plasmáticas multinucleadas, formas pleomórficas con cuerpos de Russell (inclusiones citoplasmáticas de Ig) y cuerpos de Dutcher (inclusiones intranucleares)."
          ],
          perlaDiagnostica: "La positividad para CD138 (sindecano-1), CD38 y la restricción de cadenas ligeras kappa o lambda por inmunohistoquímica certifica la monoclonalidad tumoral.",
          metaforaVisual: "Células plasmáticas con halos paranucleares y núcleos en 'rueda de carreta' invadiendo el hueso.",
          diagnosticoDiferencial: [
            "Reacción plasmocitaria reactiva policlonal (mezcla equilibrada de cadenas ligeras kappa y lambda sin destrucción ósea)",
            "Linfoma linfoplasmocítico / Macroglobulinemia de Waldenström (células linfoplasmocitoides IgM secretoras)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/HEMEHTML/HEME068.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 15,
      unidadId: "U4",
      titulo: "Patología dermatológica",
      fechas: {
        martes: "01/12/2026",
        jueves: "03/12/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Avanzada",
      dificultadNivel: 3,
      resumenSemana: "Diagnóstico diferencial de las neoplasias malignas de piel (carcinoma basocelular con empalizada vs espinocelular con perlas córneas vs melanoma maligno con diseminación pagetoide) y pénfigo vulgar acantolítico.",
      laminas: [
        {
          id: "L15-01",
          codigo: "L-PIEL-01",
          diagnostico: "Carcinoma Basocelular Cutáneo (Patrón Nodular)",
          organo: "Piel (Epidermis y dermis)",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia epitelial maligna de baja agresividad (células basales)",
          definicionRobbins: "El cáncer cutáneo más común del ser humano; invasor localmente pero con tasa de metástasis extraordinariamente baja (<0.1%), asociado a mutaciones en la vía Hedgehog (PTCH1).",
          triadaPatognomonica: [
            "Nidos e islotes dérmicos de células basaloides hipercromáticas uniformes con citoplasma escaso y núcleos ovoides basófilos.",
            "Empalizada periférica: núcleos de la capa externa del nido dispuestos en fila perpendicular y radial ordenada.",
            "Hendiduras o espacios de retracción peritumorales artificiales característicos entre los nidos tumorales y el estroma dérmico circundante."
          ],
          perlaDiagnostica: "El artefacto de retracción mucilaginoso entre el tumor y el estroma dérmico mixoide fibroblástico es el sello que lo diferencia de tumores de anejos o carcinomas escamosos.",
          metaforaVisual: "Nidos rodeados de 'soldados en empalizada' alineados en la periferia como una valla de estacas.",
          diagnosticoDiferencial: [
            "Tricoblastoma / Tricoepitelioma (tumor benigno con diferenciación folicular sin artefacto de retracción peritumoral)",
            "Carcinoma epidermoide (células poligonales con puentes intercelulares y queratina central)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/SKINHTML/SKIN028.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L15-02",
          codigo: "L-PIEL-02",
          diagnostico: "Carcinoma Espinocelular de Piel (Epidermoide Infiltrante)",
          organo: "Piel fotoexpuesta",
          tincion: "H&E",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Neoplasia maligna de queratinocitos epidérmicos",
          definicionRobbins: "Segundo cáncer de piel más frecuente; vinculado a daño por radiación ultravioleta acumulada con mutaciones precoces en TP53.",
          triadaPatognomonica: [
            "Nidos y cordones invasivos de queratinocitos atípicos que rompen la membrana basal epidérmica e invaden la dermis reticular.",
            "Perlas de queratina concéntricas eosinófilas laminadas y disqueratosis (queratinización prematura celular con cuerpos redondos).",
            "Puentes intercelulares prominentes visibles entre las células tumorales pleomórficas a 40X."
          ],
          perlaDiagnostica: "Se origina con frecuencia sobre una queratosis actínica preexistente; la rotura de la unión dermoepidérmica marca la transición a carcinoma invasor con riesgo de metástasis ganglionar.",
          metaforaVisual: "Perlas córneas rojas brillantes en medio de sábanas celulares espinosas invasoras.",
          diagnosticoDiferencial: [
            "Queratosis actínica (atipia limitada al epitelio epidérmico sin invasión dérmica)",
            "Queratocantoma (neoplasia bien diferenciada con cráter crateriforme central repleto de queratina)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/SKINHTML/SKIN032.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L15-03",
          codigo: "L-PIEL-03",
          diagnostico: "Melanoma Cutáneo Maligno Invasor",
          organo: "Piel",
          tincion: "H&E / Inmunohistoquímica (Melan-A / HMB-45 / S100)",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Neoplasia melanocítica maligna altamente invasora",
          definicionRobbins: "La neoplasia cutánea más letal; se caracteriza por atipia citológica extrema de melanocitos, diseminación pagetoide intraepidérmica y crecimiento dérmico vertical.",
          triadaPatognomonica: [
            "Diseminación pagetoide: migración ascendente de melanocitos atípicos solitarios hacia las capas superiores granulosa y córnea de la epidermis.",
            "Atipia melanocítica marcada con macronucléolos eosinófilos gigantes ('en ojo de buey') y ausencia de maduración en profundidad.",
            "Invasión dérmica vertical con pigmento melánico granular marrón oscuro intratumoral y en melanófagos estromales."
          ],
          perlaDiagnostica: "El espesor o profundidad de Breslow (medido en milímetros desde la capa granulosa hasta la célula tumoral más profunda) es el factor pronóstico individual más potente en melanoma.",
          metaforaVisual: "Melanocitos atípicos trepando por la epidermis como 'gotas de lluvia ascendentes' (pagetoide).",
          diagnosticoDiferencial: [
            "Nevo de Spitz (nidos regulares con cuerpos de Kamino y maduración celular en la base dérmica)",
            "Nevo displásico (atipia citológica leve/moderada sin diseminación pagetoide alta ni invasión vertical destructiva)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/SKINHTML/SKIN040.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        },
        {
          id: "L15-04",
          codigo: "L-PIEL-04",
          diagnostico: "Pénfigo Vulgar (Ampolla Intraepidérmica Suprabasal con Acantólisis)",
          organo: "Piel / Mucosa oral",
          tincion: "H&E / Inmunofluorescencia",
          aumentoRecomendado: "20X - 40X",
          tipoLesion: "Dermatosis ampollosa autoinmune acantolítica",
          definicionRobbins: "Enfermedad autoinmunitaria potencialmente mortal mediada por anticuerpos IgG dirigidos contra la desmogleína 3 de los desmosomas queratinocíticos.",
          triadaPatognomonica: [
            "Ampolla intraepidérmica suprabasal: formación de una hendidura o ampolla inmediatamente por encima de la capa de células basales.",
            "Acantólisis: pérdida de cohesión y desprendimiento de los queratinocitos, que quedan flotando redondos dentro de la ampolla (células acantolíticas de Tzanck).",
            "Patrón en 'hilera de lápidas' (row of tombstones): las células basales permanecen adheridas a la membrana basal mediante hemidesmosomas intactos."
          ],
          perlaDiagnostica: "En inmunofluorescencia directa exhibe un patrón en 'malla de pescar' o 'panal de abejas' característico con depósito intraepidérmico de IgG intercelular.",
          metaforaVisual: "Células basales erguidas en el piso de la ampolla asemejando lápidas en un cementerio inundado.",
          diagnosticoDiferencial: [
            "Penfigoide ampolloso (ampolla subepidérmica con toda la epidermis en el techo y depósito lineal de IgG en membrana basal)",
            "Dermatitis herpetiforme (microabscesos neutrofílicos en las papilas dérmicas con depósitos granulares de IgA)"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/SKINHTML/SKIN008.html",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    },

    {
      semana: 16,
      unidadId: "U4",
      titulo: "II EXAMEN PRÁCTICO (Evaluación Final de Unidades III y IV)",
      esExamen: true,
      tipoExamen: "Final",
      fechas: {
        martes: "08/12/2026",
        jueves: "10/12/2026"
      },
      horario: "Martes 17:00–19:00 h | Jueves 15:00–19:00 h",
      lugar: "Laboratorio de Microscopía – Instituto de Patología UNMSM",
      responsable: "Equipo docente",
      duracion: "2.0 horas",
      dificultad: "Examen",
      dificultadNivel: 4,
      resumenSemana: "Hito Evaluativo Mayor y Clausura: Evaluación práctica en microscopios ópticos por estaciones cronometradas correspondientes a Unidades III y IV (Próstata, Mama, Cérvix, Tubo digestivo, Hígado, Ganglio linfático y Piel). Cierre de actas promocionales.",
      laminas: [
        {
          id: "L16-01",
          codigo: "EXAMEN-02",
          diagnostico: "Evaluación Práctica II: Estaciones de Microscopía Final",
          organo: "Órganos correspondientes a las Semanas 9 a 15",
          tincion: "H&E / Tinciones Especiales (Masson, Giemsa, Reticulina, Alcian Blue)",
          aumentoRecomendado: "10X - 40X",
          tipoLesion: "Evaluación Práctica Sumativa Final de Asignatura",
          definicionRobbins: "Evaluación final de competencias diagnósticas anatomopatológicas. Rúbrica oficial de la Cátedra de Patología Especial UNMSM.",
          triadaPatognomonica: [
            "Reconocimiento instantáneo del tejido e identificación del órgano diana.",
            "Discriminación inequívoca entre patología reactiva/benigna y proliferación neoplásica maligna invasora.",
            "Sustentación de la conducta diagnóstica con 2 criterios histopatológicos de oro por lámina."
          ],
          perlaDiagnostica: "¡Felicidades por culminar el curso!: La anatomía patológica es el cimiento de la medicina clínica; cada diagnóstico microscópico que has aprendido define el tratamiento y pronóstico de un paciente real.",
          metaforaVisual: "Balanza de la justicia diagnóstica y rúbrica de excelencia San Fernando.",
          diagnosticoDiferencial: [
            "Revisar tabla de diagnósticos diferenciales de semanas 9 a 15"
          ],
          enlacesMicroscopia: {
            webpath: "https://webpath.med.utah.edu/",
            pathpresenter: "https://pathpresenter.net/",
            histologyGuide: "https://histologyguide.com/"
          }
        }
      ]
    }
  ]
};
