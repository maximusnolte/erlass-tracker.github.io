/* ================================================================
   ABITUR CHECKLISTEN 2026 – App

   ╔══════════════════════════════════════════════════════════════╗
   ║  KONFIGURATION                                               ║
   ║  Farben, Fächer und Inhalte lassen sich hier zentral ändern  ║
   ╚══════════════════════════════════════════════════════════════╝

   Jedes Fach-Objekt hat folgende konfigurierbaren Felder:
     id     → Eindeutiger Bezeichner (kein Leerzeichen, kein Umlaut)
     name   → Anzeigename im Tab und in der Überschrift
     level  → z. B. "Leistungskurs" oder "Grundkurs"
     color  → Hauptfarbe als HEX  (#rrggbb)  – Tab, Rahmen, Badges …
     accent → Hellere Variante    (#rrggbb)  – Fortschrittsbalken
     bg     → Sehr heller Ton     (#rrggbb)  – abgehaktes Element

   ================================================================ */

const subjects = [

  /* ─────────────────────────── Deutsch ─────────────────────── */
  {
    id: 'deutsch',
    name: 'Deutsch',
    level: 'Leistungskurs',
    color:  '#c0392b',   /* Weinrot  */
    accent: '#e74c3c',
    bg:     '#fff5f5',
    quarters: [
      {
        q: 'Q1',
        sections: [
          {
            id: 'de_q1_1',
            title: 'Q1.1 – Epochenumbruch 18./19. Jahrhundert',
            topics: [
              'Literarische Texte: Dramatik (z. B. Schiller, Kleist) oder Epik (z. B. Tieck, E. T. A. Hoffmann) und Lyrik (z. B. Goethe, Hölderlin, Günderrode, Eichendorff)',
              'Schlüsselthemen der Weimarer Klassik: Idealisierung, Humanität, Kunstautonomie',
              'Schlüsselthemen der Romantik: Phantasie, Traum, Seelenleben, Nachtseiten',
              '[LK] Programmatische Texte zu Sprache und Literatur (z. B. Humboldt, Schiller, Novalis, Schlegel)',
              '[LK] Romantik und Modernität',
              'Pflichtlektüre: Lyrik der Romantik',
              'Pflichtlektüre: Heinrich v. Kleist – Der zerbrochene Krug'
            ]
          },
          {
            id: 'de_q1_2',
            title: 'Q1.2 – Sprache, Medien, Wirklichkeit',
            topics: [
              'Audiovisuelle oder auditive Medien und ihre Spezifika (z. B. Kameraführung, Schnitt, Licht, Geräusche, Musik)',
              'Sprache und ihre Wirkung in Medien (Syntax, Semantik, Pragmatik)',
              'Politisch-gesellschaftliche Kommunikation in unterschiedlichen Medien',
              'Reflexion über Realitätskonstruktionen in unterschiedlichen Medienformaten',
              '[LK] Pragmatische Texte zu sprachphilosophischen Fragestellungen',
              '[LK] Linguistisches Relativitätsprinzip (Sapir-Whorf-Hypothese) und Kritik daran'
            ]
          },
          {
            id: 'de_q1_3',
            title: 'Q1.3 – Natur als Imagination und Wirklichkeit',
            topics: [
              'Exemplarische Naturlyrik vom 18. Jahrhundert bis zur Gegenwart',
              'Naturbilder im Vergleich: Natur als Seelenraum, bedrohliche oder bedrohte Natur',
              'Metaphorik der Natur: Garten, Wald, Jahres- und Tageszeiten',
              '[LK] Pragmatische Texte über das Verhältnis von Natur und Mensch'
            ]
          }
        ]
      },
      {
        q: 'Q2',
        sections: [
          {
            id: 'de_q2_1',
            title: 'Q2.1 – Sprache und Öffentlichkeit',
            topics: [
              'Reden, Flugschriften oder Essays in historischen, politischen und kommunikativen Kontexten',
              'Argumentative Strukturen und persuasiv-manipulative Strategien',
              'Politisch-gesellschaftliche Kommunikation zwischen Verständigung und Strategie',
              'Sprachliche Merkmale politisch-gesellschaftlicher Kommunikation',
              'Eigene Beiträge: Rede, Kommentar, materialgestütztes Schreiben',
              '[LK] Rhetorik: rhetorische Gattungen, Aufbau und Struktur einer Rede'
            ]
          },
          {
            id: 'de_q2_2',
            title: 'Q2.2 – Soziales Drama und politisches Theater',
            topics: [
              'Ein soziales oder politisches Drama des 19. oder 20. Jahrhunderts',
              'Programmatische Positionen der Autorin oder des Autors',
              'Dramatische Realisierung und Aktualisierung (z. B. Inszenierung, Kritik)',
              '[LK] Vergleichende Betrachtung von Themen, Motiven und Dramenstrukturen',
              'Pflichtlektüre: Georg Büchner – Woyzeck'
            ]
          },
          {
            id: 'de_q2_3',
            title: 'Q2.3 – Schriftsteller im Widerstand',
            topics: [
              'Politisch engagierte Literatur des Widerstandes im Vormärz',
              'Gesellschafts- und Systemkritik in pragmatischen Texten',
              'Schlüsselthemen: Macht und Machtmissbrauch',
              '[LK] Exilliteraten und Leitmotive ihres Schreibens',
              'Pflichtlektüre: Jenny Erpenbeck – Heimsuchung'
            ]
          }
        ]
      },
      {
        q: 'Q3',
        sections: [
          {
            id: 'de_q3_1',
            title: 'Q3.1 – Subjektivität und Verantwortung',
            topics: [
              'Ganzschrift oder mehrere kürzere Texte zu Subjektivität, Verantwortung und anthropologischen Grundfragen',
              'Thematische Spiegelungen in pragmatischen Texten: homo superior, homo faber, homo patiens',
              '[LK] Literarische Stoffe und Motive der europäischen Tradition (z. B. Prometheus, Narziss, Antigone, Faust)'
            ]
          },
          {
            id: 'de_q3_2',
            title: 'Q3.2 – Epochenumbruch 19./20. Jahrhundert',
            topics: [
              'Texte der literarischen Moderne: Epik oder Dramatik und Lyrik',
              'Literaturgeschichtliche Strömungen zwischen Naturalismus und Expressionismus',
              'Neue Formen des Erzählens und des lyrischen Sprechens',
              'Spiegelung kulturgeschichtlicher Entwicklungen in der Literatur',
              '[LK] Programmatische Texte (z. B. Nietzsche, Freud, Simmel, Pinthus)',
              '[LK] Pluralität, Psychologisierung, Verwissenschaftlichung, Fortschrittskritik, Kulturpessimismus',
              'Pflichtlektüre: Franz Kafka – Der Prozess',
              'Pflichtlektüre: Texte des Epochenumbruchs 19./20. Jahrhundert'
            ]
          },
          {
            id: 'de_q3_4',
            title: 'Q3.4 – Sprache und Identität',
            topics: [
              'Texte zu Sprache und Fremdheitserfahrung, Sprachreflexion und Sprachexperimente, insbesondere um 1900',
              'Pragmatische Texte zu Sprache, Bildung und Entwicklung',
              '[LK] Literarische Texte zu Sprachlosigkeit und Sprachkritik in der literarischen Moderne um 1900'
            ]
          }
        ]
      }
    ]
  },

  /* ─────────────────────────── Englisch ────────────────────── */
  {
    id: 'englisch',
    name: 'Englisch',
    level: 'Leistungskurs',
    color:  '#1a5276',   /* Navy Blue */
    accent: '#2980b9',
    bg:     '#f0f8ff',
    quarters: [
      {
        q: 'Q1',
        sections: [
          {
            id: 'en_q1_1',
            title: 'Q1.1 – The USA: Formation of a Nation',
            topics: [
              'Development and principles of American democracy',
              '"Life, liberty and the pursuit of happiness"',
              'Landmarks of American history: Civil Rights Movement',
              'Landmarks of American history: Black Lives Matter',
              '[LK] Recent political and social developments',
              'Pflichtwerk: Gran Torino (Film)'
            ]
          },
          {
            id: 'en_q1_2',
            title: 'Q1.2 – Living in American Society',
            topics: [
              'Migration and the American Dream',
              'Questions of identity',
              '[LK] Values and beliefs: Patriotism'
            ]
          },
          {
            id: 'en_q1_3',
            title: 'Q1.3 – Manifestation of Individualism',
            topics: [
              'The American Dream as a manifestation of individualism',
              'Conformity vs. individualism',
              'Ambitions and obstacles',
              '[LK] Visions and nightmares: individual destinies',
              '[LK] Regulation of gun ownership'
            ]
          }
        ]
      },
      {
        q: 'Q2',
        sections: [
          {
            id: 'en_q2_1',
            title: 'Q3.5 (in Q2) – Globalization',
            topics: [
              'Resources and the future of energy / sustainability',
              'Global chances and challenges',
              'Globalization and the economy',
              'Chances and challenges of digitalization',
              '[LK] Making globalization work, outsourcing, consumption',
              'Pflichttexte: Orwell – Shooting an Elephant; Kureishi – My Son the Fanatic; Zadie Smith – The Embassy of Cambodia'
            ]
          },
          {
            id: 'en_q2_2',
            title: 'Q2.1 – Great Britain: Past and Present',
            topics: [
              'Tradition and change: British Empire and Brexit',
              'Being British: national identity and national stereotypes',
              '[LK] Elizabethan England: Golden Age, worldview, development of theatre'
            ]
          },
          {
            id: 'en_q2_3',
            title: 'Q2.2 – Ethnic Diversity',
            topics: [
              'Great Britain as a multicultural society',
              'Effects of the colonial past',
              'Prejudice and the one-track mind',
              '[LK] Integration versus assimilation'
            ]
          }
        ]
      },
      {
        q: 'Q3',
        sections: [
          {
            id: 'en_q3_1',
            title: 'Q3.1 – Human Dilemmas',
            topics: [
              'Extreme situations: struggle for survival',
              'Being different',
              '[LK] Drama by William Shakespeare: Macbeth',
              'Pflichtlektüren: Shakespeare – Macbeth; Dave Eggers – The Circle'
            ]
          },
          {
            id: 'en_q3_3',
            title: 'Q3.3 – Gender Issues',
            topics: [
              'Gender and identity',
              'Gender roles and gender inequality',
              'Culture and gender – now and then',
              'Gender constructions in advertising',
              '[LK] Changing ideals of beauty (Shakespeare sonnets)',
              '[LK] Gender issues in the arts'
            ]
          },
          {
            id: 'en_q4_2',
            title: 'Q4.2 (in Q3) – The Media',
            topics: [
              'Diversity of the media: traditional and modern media, social media, new careers',
              'The power of the media: impact on the individual and society',
              'Making reality – faking reality',
              'Information, entertainment, manipulation',
              'Reliability of information and impact of images',
              '[LK] Communication: critical handling of communication strategies'
            ]
          }
        ]
      }
    ]
  },

  /* ─────────────────────────── Biologie ────────────────────── */
  {
    id: 'biologie',
    name: 'Biologie',
    level: 'Leistungskurs',
    color:  '#0f766e',   /* Teal */
    accent: '#14b8a6',
    bg:     '#effcf8',
    quarters: [
      {
        q: 'Q1',
        sections: [
          {
            id: 'bio_q1_1',
            title: 'Q1 – Biologische Strukturen und Prozesse',
            topics: [
              'Biomembranen und Stofftransport',
              'Enzyme und ihre Regulation',
              'Stoffwechselprozesse: Fotosynthese und Zellatmung',
              'Experimentieren, Daten auswerten, Modelle anwenden'
            ]
          },
          {
            id: 'bio_q1_2',
            title: 'Q1 – Genetik und Molekularbiologie',
            topics: [
              'DNA-Struktur und Replikation',
              'Proteinbiosynthese',
              'Genregulation',
              'Mutationen und ihre Folgen',
              '[LK] Vertiefte Analyse molekularbiologischer Verfahren'
            ]
          }
        ]
      },
      {
        q: 'Q2',
        sections: [
          {
            id: 'bio_q2_1',
            title: 'Q2 – Neurobiologie und Verhalten',
            topics: [
              'Aufbau und Funktion von Nervenzellen',
              'Erregungsleitung und Synapse',
              'Hormone und neuronale Steuerung',
              'Verhalten und Verhaltensökologie',
              '[LK] Komplexe Regulations- und Vernetzungsprozesse'
            ]
          },
          {
            id: 'bio_q2_2',
            title: 'Q2 – Ökologie',
            topics: [
              'Ökosysteme und Wechselbeziehungen',
              'Stoffkreisläufe und Energiefluss',
              'Populationen und Umweltfaktoren',
              'Nachhaltigkeit und anthropogene Einflüsse',
              '[LK] Vertiefte Systembetrachtung und Modellierung'
            ]
          }
        ]
      },
      {
        q: 'Q3',
        sections: [
          {
            id: 'bio_q3_1',
            title: 'Q3 – Evolution',
            topics: [
              'Evolutionsfaktoren',
              'Synthetische Evolutionstheorie',
              'Artbildung und Stammbäume',
              'Evolutionsbelege',
              '[LK] Mechanismen der Evolution auf verschiedenen Ebenen'
            ]
          },
          {
            id: 'bio_q3_2',
            title: 'Q3 – Fachmethoden und Bewertung',
            topics: [
              'Hypothesen bilden und prüfen',
              'Experimentelle Ergebnisse interpretieren',
              'Biologische Sachverhalte fachsprachlich darstellen',
              'Chancen und Grenzen biologischer Erkenntnisse beurteilen'
            ]
          }
        ]
      }
    ]
  },

  /* ─────────────────────────── Mathematik ──────────────────── */
  {
    id: 'mathematik',
    name: 'Mathematik',
    level: 'Leistungskurs',
    color:  '#6d28d9',   /* Violett */
    accent: '#8b5cf6',
    bg:     '#f6f0ff',
    quarters: [
      {
        q: 'Q1',
        sections: [
          {
            id: 'ma_q1_1',
            title: 'Q1 – Analysis',
            topics: [
              'Funktionen und Funktionseigenschaften',
              'Ableitungen und Änderungsraten',
              'Kurvendiskussion und Extremwertprobleme',
              'Anwendungen im Sachkontext',
              '[LK] Vertiefte Argumentation und Modellbildung'
            ]
          }
        ]
      },
      {
        q: 'Q2',
        sections: [
          {
            id: 'ma_q2_1',
            title: 'Q2 – Lineare Algebra / Analytische Geometrie',
            topics: [
              'Vektoren und Geraden',
              'Ebenen und Lagebeziehungen',
              'Matrizen und lineare Gleichungssysteme',
              'Geometrische und algebraische Lösungsverfahren',
              '[LK] Mehrschrittige Modellierungsaufgaben'
            ]
          }
        ]
      },
      {
        q: 'Q3',
        sections: [
          {
            id: 'ma_q3_1',
            title: 'Q3 – Stochastik',
            topics: [
              'Wahrscheinlichkeitsrechnung',
              'Zufallsgrößen und Verteilungen',
              'Hypothesentests und beurteilende Statistik',
              'Stochastische Modelle im Kontext',
              '[LK] Begründung, Interpretation und Reflexion von Ergebnissen'
            ]
          }
        ]
      }
    ]
  },

  /* ─────────────────────────── Politik & Wirtschaft ────────── */
  {
    id: 'powi',
    name: 'Politik & Wirtschaft',
    level: 'Leistungskurs',
    color:  '#166534',   /* Grün */
    accent: '#22c55e',
    bg:     '#f0fff4',
    quarters: [
      {
        q: 'Q1',
        sections: [
          {
            id: 'powi_q1_1',
            title: 'Q1.1 – Verfassung und Verfassungswirklichkeit',
            topics: [
              'Grundrechte und Rechtsstaatlichkeit',
              'Parlament, Länderkammer, Bundesregierung, EU im Gesetzgebungsprozess',
              'Spannungsfeld Exekutive – Legislative',
              'Rolle des Bundesverfassungsgerichts'
            ]
          },
          {
            id: 'powi_q1_2',
            title: 'Q1.2 – Herausforderungen der Parteiendemokratie',
            topics: [
              'Politische Parteien: Aufgaben, Funktionen, Populismus',
              'Alternative Formen politischer Beteiligung',
              'Nationale Wahlen und Europaparlament-Wahl',
              'Parteiensysteme und Exekutivbildung'
            ]
          },
          {
            id: 'powi_q1_4',
            title: 'Q1.4 – Öffentlichkeit im Wandel',
            topics: [
              'Aufgaben, Funktionen und Probleme klassischer Massenmedien',
              'Chancen und Risiken neuer Kommunikationsformen',
              'Filterblasen und Fake News',
              'Veränderungen zwischen Medien und politischen Akteuren'
            ]
          }
        ]
      },
      {
        q: 'Q2',
        sections: [
          {
            id: 'powi_q2_1',
            title: 'Q2.1 – Konjunkturanalyse und Konjunkturpolitik',
            topics: [
              'Beobachtung, Analyse und Prognose wirtschaftlicher Konjunktur',
              'Keynesianische Konzeption',
              'Nachfrageorientierte Politik: Fiskalpolitik und Geldpolitik',
              'Probleme: Inflation und Staatsverschuldung'
            ]
          },
          {
            id: 'powi_q2_2',
            title: 'Q2.2 – Nachhaltiges Wachstum und fairer Wettbewerb',
            topics: [
              'Bedeutung und Faktoren wirtschaftlichen Wachstums',
              'Neoklassische Konzeption und Angebotsbedingungen',
              'Angebotsorientierte Wirtschaftspolitik',
              'Wettbewerbsfähigkeit im europäischen Binnenmarkt',
              'Probleme angebotsorientierter Politik'
            ]
          },
          {
            id: 'powi_q2_4',
            title: 'Q2.4 – Arbeitsmarkt und Tarifpolitik',
            topics: [
              'Beschäftigungsentwicklung und Fachkräftemangel',
              'Arbeitsmarktpolitische Instrumente',
              'Tarifvertragsparteien, Tarifpolitik und Tarifautonomie',
              'Einkommens- und Vermögensverteilung',
              'Gerechtigkeitsbegriffe'
            ]
          }
        ]
      },
      {
        q: 'Q3',
        sections: [
          {
            id: 'powi_q3_1',
            title: 'Q3.1 – Internationale Konflikte',
            topics: [
              'Analyse aktueller Konflikte',
              'Konfliktarten: Bürgerkrieg, zwischenstaatlicher Konflikt, Terrorismus, Cyberangriff',
              'Folgen: Flucht und Vertreibung',
              'Ziele deutscher Außen- und Sicherheitspolitik',
              'UNO und NATO'
            ]
          },
          {
            id: 'powi_q3_2',
            title: 'Q3.2 – Strukturwandel der Weltwirtschaft',
            topics: [
              'Entgrenzung und Verflechtung von Nationalökonomien',
              'Außenhandel, Freihandelszonen, Binnenmärkte, Währungsräume, Kapitalmärkte',
              'Globalisierung von Unternehmen und Produktionsprozessen',
              'Standortfaktoren und Standortwettbewerb',
              'Wohlfahrtsstaat vs. Wettbewerbsstaat',
              'WTO: Liberalisierung vs. Regulierung'
            ]
          },
          {
            id: 'powi_q3_5',
            title: 'Q3.5 – Weltumweltpolitik',
            topics: [
              'Wechselwirkungen globaler ökologischer und ökonomischer Herausforderungen',
              'Weltklimawandel',
              'Ziele, Interessen und Strategien staatlicher und privater Akteure',
              'Internationale Umweltpolitik: Kooperation vs. Verteilungskonflikte'
            ]
          }
        ]
      }
    ]
  }

];

/* ================================================================
   ZUSTAND & PERSISTENZ
   ================================================================ */

const STORAGE_KEY = 'abitur-checklisten-2026-offline-v1';
const UI_KEY      = 'abitur-checklisten-2026-ui-v1';

const state = {
  checked:       {},
  openSections:  {},
  activeSubject: 'deutsch'
};

function loadState() {
  try {
    const savedChecked = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const savedUi      = JSON.parse(localStorage.getItem(UI_KEY)      || '{}');
    state.checked      = savedChecked && typeof savedChecked === 'object' ? savedChecked : {};
    state.openSections = savedUi.openSections && typeof savedUi.openSections === 'object'
                           ? savedUi.openSections : {};
    if (savedUi.activeSubject && subjects.some(s => s.id === savedUi.activeSubject)) {
      state.activeSubject = savedUi.activeSubject;
    }
  } catch (e) {
    state.checked       = {};
    state.openSections  = {};
    state.activeSubject = 'deutsch';
  }
}

function saveChecked() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.checked));
}

function saveUi() {
  localStorage.setItem(UI_KEY, JSON.stringify({
    activeSubject: state.activeSubject,
    openSections:  state.openSections
  }));
}

/* ================================================================
   HILFSFUNKTIONEN
   ================================================================ */

function getSubject() {
  return subjects.find(s => s.id === state.activeSubject) || subjects[0];
}

function countDone(section) {
  return section.topics.filter((_, i) => state.checked[`${section.id}_${i}`]).length;
}

function calcSubjectProgress(subject) {
  const total = subject.quarters.flatMap(q => q.sections.flatMap(s => s.topics)).length;
  const done  = subject.quarters.flatMap(q =>
    q.sections.flatMap(s => s.topics.filter((_, i) => state.checked[`${s.id}_${i}`]))
  ).length;
  return { total, done, pct: total ? (done / total) * 100 : 0 };
}

function setTheme(subject) {
  const root = document.documentElement;
  root.style.setProperty('--subject-color',  subject.color);
  root.style.setProperty('--subject-accent', subject.accent);
  root.style.setProperty('--subject-bg',     subject.bg);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

/* ================================================================
   RENDER – TABS
   ================================================================ */

function renderTabs() {
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = subjects.map(subject => `
    <button
      class="tab ${subject.id === state.activeSubject ? 'active' : ''}"
      data-subject="${subject.id}"
      style="--tab-color:${subject.color}"
    >${subject.name} · ${subject.level}</button>
  `).join('');

  tabs.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeSubject = btn.dataset.subject;
      saveUi();
      render();
    });
  });
}

/* ================================================================
   RENDER – PROGRESS RING
   ================================================================ */

function progressRing(pct, color) {
  const r      = 30;
  const c      = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return `
    <div class="progressRing">
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="30" fill="none" stroke="#e5e5ea" stroke-width="7"></circle>
        <circle cx="42" cy="42" r="30" fill="none" stroke="${color}" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
          transform="rotate(-90 42 42)"></circle>
      </svg>
      <div class="progressText">${Math.round(pct)}%</div>
    </div>
  `;
}

/* ================================================================
   RENDER – HAUPT-ANSICHT
   ================================================================ */

function render() {
  const subject = getSubject();
  setTheme(subject);
  renderTabs();

  const app     = document.getElementById('app');
  const overall = calcSubjectProgress(subject);

  app.innerHTML = `
    <section class="hero">
      <div>
        <h2>${escapeHtml(subject.name)}</h2>
        <div class="muted">${escapeHtml(subject.level)} · ${overall.done} von ${overall.total} Themen erledigt</div>
        <div class="actions">
          <button class="btn" id="reset-subject">Fach zurücksetzen</button>
          <button class="btn" id="reset-all">Alles zurücksetzen</button>
          <button class="btn" id="expand-all">Alle aufklappen</button>
          <button class="btn" id="collapse-all">Alle zuklappen</button>
        </div>
      </div>
      ${progressRing(overall.pct, subject.color)}
    </section>

    ${subject.quarters.map(quarter => {
      const qTotal = quarter.sections.flatMap(s => s.topics).length;
      const qDone  = quarter.sections.flatMap(s =>
        s.topics.filter((_, i) => state.checked[`${s.id}_${i}`])
      ).length;
      const qPct = qTotal ? (qDone / qTotal) * 100 : 0;

      return `
        <section class="quarter">
          <div class="quarterHead">
            <div class="quarterBadge">${quarter.q}</div>
            <div class="quarterBar">
              <div class="quarterBarFill" style="width:${qPct}%"></div>
            </div>
            <div class="quarterMeta">${qDone}/${qTotal}</div>
          </div>

          ${quarter.sections.map(section => {
            const done   = countDone(section);
            const allDone = done === section.topics.length;
            const isOpen  = state.openSections[section.id] !== false;

            return `
              <article class="section">
                <button class="sectionHeader ${allDone ? 'done' : ''}"
                  data-toggle-section="${section.id}">
                  <span class="arrow">${isOpen ? '▾' : '▸'}</span>
                  <span class="sectionTitle">${escapeHtml(section.title)}</span>
                  <span class="pill">${done}/${section.topics.length}</span>
                </button>
                ${isOpen ? `
                  <div class="topics">
                    ${section.topics.map((topic, i) => {
                      const key       = `${section.id}_${i}`;
                      const isChecked = !!state.checked[key];
                      const isLK      = topic.startsWith('[LK]');
                      const text      = isLK ? topic.replace('[LK] ', '') : topic;
                      return `
                        <label class="topic ${isChecked ? 'checked' : ''}">
                          <input type="checkbox" data-topic-key="${key}" ${isChecked ? 'checked' : ''}>
                          <span class="topicText">
                            ${isLK ? '<span class="lkTag">LK</span>' : ''}${escapeHtml(text)}
                          </span>
                        </label>
                      `;
                    }).join('')}
                    <div class="sectionTools">
                      <button class="miniBtn" data-mark-section="${section.id}">
                        ${done === section.topics.length ? 'Alle abwählen' : 'Alle abhaken'}
                      </button>
                    </div>
                  </div>
                ` : ''}
              </article>
            `;
          }).join('')}
        </section>
      `;
    }).join('')}
  `;

  bindEvents();
}

/* ================================================================
   EVENTS
   ================================================================ */

function bindEvents() {
  document.querySelectorAll('[data-topic-key]').forEach(input => {
    input.addEventListener('change', () => {
      state.checked[input.dataset.topicKey] = input.checked;
      saveChecked();
      render();
    });
  });

  document.querySelectorAll('[data-toggle-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.toggleSection;
      state.openSections[id] = !(state.openSections[id] !== false);
      saveUi();
      render();
    });
  });

  document.querySelectorAll('[data-mark-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.markSection;
      const subject = getSubject();
      let target = null;
      subject.quarters.forEach(q => q.sections.forEach(s => { if (s.id === id) target = s; }));
      if (!target) return;
      const allChecked = target.topics.every((_, i) => !!state.checked[`${id}_${i}`]);
      target.topics.forEach((_, i) => { state.checked[`${id}_${i}`] = !allChecked; });
      saveChecked();
      render();
    });
  });

  document.getElementById('reset-subject').addEventListener('click', () => {
    const subject = getSubject();
    subject.quarters.forEach(q =>
      q.sections.forEach(s =>
        s.topics.forEach((_, i) => { delete state.checked[`${s.id}_${i}`]; })
      )
    );
    saveChecked();
    render();
  });

  document.getElementById('reset-all').addEventListener('click', () => {
    state.checked = {};
    saveChecked();
    render();
  });

  document.getElementById('expand-all').addEventListener('click', () => {
    getSubject().quarters.forEach(q =>
      q.sections.forEach(s => { state.openSections[s.id] = true; })
    );
    saveUi();
    render();
  });

  document.getElementById('collapse-all').addEventListener('click', () => {
    getSubject().quarters.forEach(q =>
      q.sections.forEach(s => { state.openSections[s.id] = false; })
    );
    saveUi();
    render();
  });
}

/* ================================================================
   INIT
   ================================================================ */

loadState();
render();
