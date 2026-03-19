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


/* ================================================================
   ZUSTAND & PERSISTENZ
   ================================================================ */

const STORAGE_KEY = 'abitur-checklisten-2026-offline-v1';
const UI_KEY      = 'abitur-checklisten-2026-ui-v1';

const state = {
  checked:        {},
  openSections:   {},
  activeSubject:  'deutsch',
  subjectLevels:  {}
};

function loadState() {
  try {
    const savedChecked = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const savedUi      = JSON.parse(localStorage.getItem(UI_KEY)      || '{}');
    state.checked      = savedChecked && typeof savedChecked === 'object' ? savedChecked : {};
    state.openSections = savedUi.openSections && typeof savedUi.openSections === 'object'
                           ? savedUi.openSections : {};
    state.subjectLevels = savedUi.subjectLevels && typeof savedUi.subjectLevels === 'object'
                           ? savedUi.subjectLevels : {};
    if (savedUi.activeSubject && subjects.some(s => s.id === savedUi.activeSubject)) {
      state.activeSubject = savedUi.activeSubject;
    }
  } catch (e) {
    state.checked       = {};
    state.openSections  = {};
    state.subjectLevels = {};
    state.activeSubject = 'deutsch';
  }
}

function saveChecked() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.checked));
}

function saveUi() {
  localStorage.setItem(UI_KEY, JSON.stringify({
    activeSubject:  state.activeSubject,
    openSections:   state.openSections,
    subjectLevels:  state.subjectLevels
  }));
}

/* ================================================================
   HILFSFUNKTIONEN
   ================================================================ */

function getSubject() {
  return subjects.find(s => s.id === state.activeSubject) || subjects[0];
}

function getEffectiveLevel(subject) {
  return state.subjectLevels[subject.id] || subject.level || 'gk';
}

function formatLevel(level) {
  if (level === 'lk') return 'Leistungskurs';
  if (level === 'gk') return 'Grundkurs';
  return level;
}

function countDone(section, level) {
  return section.topics.filter((topic, i) => {
    if (topic.level === 'lk' && level === 'gk') return false;
    if (topic.level === 'gk' && level === 'lk') return false;
    return !!state.checked[`${section.id}_${i}`];
  }).length;
}

function calcSubjectProgress(subject) {
  const level = getEffectiveLevel(subject);
  const total = subject.quarters.flatMap(q =>
    q.sections.flatMap(s => s.topics.filter(t => {
      if (t.level === 'lk' && level === 'gk') return false;
      if (t.level === 'gk' && level === 'lk') return false;
      return true;
    }))
  ).length;
  const done  = subject.quarters.flatMap(q =>
    q.sections.flatMap(s => s.topics.filter((t, i) => {
      if (t.level === 'lk' && level === 'gk') return false;
      if (t.level === 'gk' && level === 'lk') return false;
      return !!state.checked[`${s.id}_${i}`];
    }))
  ).length;
  return { total, done, pct: total ? (done / total) * 100 : 0 };
}

function setTheme(subject) {
  const root = document.documentElement;
  root.style.setProperty('--subject-color',  subject.color  || '#1d3461');
  root.style.setProperty('--subject-accent', subject.accent || subject.color || '#2563eb');
  root.style.setProperty('--subject-bg',     subject.bg     || '#eef2fb');
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
  tabs.innerHTML = subjects.map(subject => {
    const lvl = getEffectiveLevel(subject).toUpperCase();
    return `
      <button
        class="tab ${subject.id === state.activeSubject ? 'active' : ''}"
        data-subject="${subject.id}"
        style="--tab-color:${subject.color}"
      >${escapeHtml(subject.name)} · ${lvl}</button>
    `;
  }).join('');

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

let isInitialRender = true;

function render() {
  const subject       = getSubject();
  const effectiveLevel = getEffectiveLevel(subject);
  setTheme(subject);
  renderTabs();

  const app     = document.getElementById('app');
  const overall = calcSubjectProgress(subject);

  if (isInitialRender) {
    app.classList.add('initial-load');
    isInitialRender = false;
  } else {
    app.classList.remove('initial-load');
  }

  app.innerHTML = `
    <section class="hero">
      <div>
        <h2>${escapeHtml(subject.name)}</h2>
        <div class="muted">${escapeHtml(formatLevel(effectiveLevel))} · ${overall.done} von ${overall.total} Themen erledigt</div>
        <div class="level-selector">
          <span class="level-label">Kurstyp:</span>
          <div class="level-toggle">
            <button class="level-btn ${effectiveLevel === 'gk' ? 'active' : ''}" data-set-level="gk">GK</button>
            <button class="level-btn ${effectiveLevel === 'lk' ? 'active' : ''}" data-set-level="lk">LK</button>
          </div>
        </div>
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
      const qTotal = quarter.sections.flatMap(s =>
        s.topics.filter(t => {
          if (t.level === 'lk' && effectiveLevel === 'gk') return false;
          if (t.level === 'gk' && effectiveLevel === 'lk') return false;
          return true;
        })
      ).length;
      const qDone  = quarter.sections.flatMap(s =>
        s.topics.filter((t, i) => {
          if (t.level === 'lk' && effectiveLevel === 'gk') return false;
          if (t.level === 'gk' && effectiveLevel === 'lk') return false;
          return !!state.checked[`${s.id}_${i}`];
        })
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
            const done          = countDone(section, effectiveLevel);
            const visibleTopics = section.topics.filter(t => {
              if (t.level === 'lk' && effectiveLevel === 'gk') return false;
              if (t.level === 'gk' && effectiveLevel === 'lk') return false;
              return true;
            });
            const allDone = done === visibleTopics.length;
            const isOpen  = state.openSections[section.id] !== false;

            return `
              <article class="section">
                <button class="sectionHeader ${allDone ? 'done' : ''}"
                  data-toggle-section="${section.id}">
                  <span class="arrow">${isOpen ? '▾' : '▸'}</span>
                  <span class="sectionTitle">${escapeHtml(section.title)}</span>
                  <span class="pill">${done}/${visibleTopics.length}</span>
                </button>
                ${isOpen ? `
                  <div class="topics">
                    ${section.topics.map((topic, i) => {
                      const isLK = topic.level === 'lk';
                      const isGK = topic.level === 'gk';
                      if (isLK && effectiveLevel === 'gk') return '';
                      if (isGK && effectiveLevel === 'lk') return '';
                      const key       = `${section.id}_${i}`;
                      const isChecked = !!state.checked[key];
                      return `
                        <label class="topic ${isChecked ? 'checked' : ''}">
                          <input type="checkbox" data-topic-key="${key}" ${isChecked ? 'checked' : ''}>
                          <span class="topicText">
                            ${isLK ? '<span class="lkTag">LK</span>' : ''}${isGK ? '<span class="gkTag">GK</span>' : ''}${escapeHtml(topic.text)}
                          </span>
                        </label>
                      `;
                    }).join('')}
                    <div class="sectionTools">
                      <button class="miniBtn" data-mark-section="${section.id}">
                        ${done === visibleTopics.length ? 'Alle abwählen' : 'Alle abhaken'}
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
      const level   = getEffectiveLevel(subject);
      let target = null;
      subject.quarters.forEach(q => q.sections.forEach(s => { if (s.id === id) target = s; }));
      if (!target) return;
      const allChecked = target.topics.every((t, i) => {
        if (t.level === 'lk' && level === 'gk') return true;
        if (t.level === 'gk' && level === 'lk') return true;
        return !!state.checked[`${id}_${i}`];
      });
      target.topics.forEach((t, i) => {
        if (t.level === 'lk' && level === 'gk') return;
        if (t.level === 'gk' && level === 'lk') return;
        state.checked[`${id}_${i}`] = !allChecked;
      });
      saveChecked();
      render();
    });
  });

  document.querySelectorAll('[data-set-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = getSubject();
      state.subjectLevels[subject.id] = btn.dataset.setLevel;
      saveUi();
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

async function init() {
  try {
    const res = await fetch('subjects.json');
    if (!res.ok) throw new Error(`subjects.json konnte nicht geladen werden (HTTP ${res.status})`);
    window.subjects = await res.json();
  } catch (e) {
    document.getElementById('app').innerHTML =
      '<p style="color:red;padding:20px">Fehler: subjects.json konnte nicht geladen werden.</p>';
    return;
  }
  loadState();
  render();
}
init();

/* ── Header: bei Scroll nach unten ausblenden ───────────────────── */
(function () {
  let lastScrollY = 0;
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', function () {
    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 80) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    lastScrollY = currentY;
  }, { passive: true });
}());
