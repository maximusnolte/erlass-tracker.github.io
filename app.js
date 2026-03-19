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
