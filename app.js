/* ================================================================
   ABITUR CHECKLISTEN 2026 – App
   ================================================================ */

import confetti from 'canvas-confetti';


/* ================================================================
   ZUSTAND & PERSISTENZ
   ================================================================ */

const STORAGE_KEY = 'abitur-checklisten-2026-offline-v1';
const UI_KEY      = 'abitur-checklisten-2026-ui-v1';
const CONFETTI_DELAY_MS = 800;

const state = {
  checked:        {},
  openSections:   {},
  activeSubject:  'deutsch',
  subjectLevels:  {}
};

let shouldAnimateSubjectSwitch = false;

const previousProgress = {
  subjectPctById: {},
  quarterPctByKey: {}
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

// GK sieht: gk-Topics + Topics ohne Level
// LK sieht: alles (lk + gk + ohne Level)
function isTopicVisible(topic, level) {
  if (topic.level === 'lk' && level === 'gk') return false;
  return true;
}

function countDone(section, level) {
  return section.topics.filter((topic, i) => {
    if (!isTopicVisible(topic, level)) return false;
    return !!state.checked[`${section.id}_${i}`];
  }).length;
}

function getQuarterKey(subjectId, quarterIndex) {
  return `${subjectId}__q${quarterIndex}`;
}

function getQuarterStats(quarter, level) {
  const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
  const total = sections.flatMap(s =>
    s.topics.filter(t => isTopicVisible(t, level))
  ).length;
  const done = sections.flatMap(s =>
    s.topics.filter((t, i) => {
      if (!isTopicVisible(t, level)) return false;
      return !!state.checked[`${s.id}_${i}`];
    })
  ).length;
  const pct = total ? (done / total) * 100 : 0;
  return { total, done, pct, complete: total > 0 && done === total };
}

function getQuarterCompletionMap(subject, level) {
  const map = {};
  subject.quarters.forEach((quarter, index) => {
    const key = getQuarterKey(subject.id, index);
    map[key] = getQuarterStats(quarter, level).complete;
  });
  return map;
}

function pulseQuarterBadge(subjectId, quarterIndex) {
  const quarterKey = getQuarterKey(subjectId, quarterIndex);
  const badge = document.querySelector(`[data-quarter-key="${quarterKey}"] .quarterBadge`);
  if (!badge) return;
  badge.classList.remove('quarterCelebrate');
  void badge.offsetWidth;
  badge.classList.add('quarterCelebrate');
  window.setTimeout(() => badge.classList.remove('quarterCelebrate'), 1000);
}

function scheduleQuarterConfetti(subjectId, quarterIndex) {
  window.setTimeout(() => {
    if (state.activeSubject !== subjectId) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const level = getEffectiveLevel(subject);
    const quarter = subject.quarters[quarterIndex];
    if (!quarter) return;
    if (!getQuarterStats(quarter, level).complete) return;

    const colors = [subject.color || '#1d3461', subject.accent || '#2563eb', '#ffffff', '#ffd166'];
    confetti({ particleCount: 45, spread: 58, origin: { y: 0.72 }, colors, scalar: 0.9 });
    confetti({ particleCount: 35, spread: 78, origin: { y: 0.72, x: 0.65 }, colors, scalar: 0.9 });
    pulseQuarterBadge(subjectId, quarterIndex);
  }, CONFETTI_DELAY_MS);
}

function celebrateCompletedQuarters(subject, level, beforeMap) {
  const afterMap = getQuarterCompletionMap(subject, level);
  subject.quarters.forEach((_, quarterIndex) => {
    const key = getQuarterKey(subject.id, quarterIndex);
    if (!beforeMap[key] && afterMap[key]) {
      scheduleQuarterConfetti(subject.id, quarterIndex);
    }
  });
}

function calcSubjectProgress(subject) {
  const level = getEffectiveLevel(subject);
  const allTopics = subject.quarters.flatMap(q =>
    (q.sections || []).flatMap(s => s.topics.filter(t => isTopicVisible(t, level)))
  );
  const done = subject.quarters.flatMap(q =>
    (q.sections || []).flatMap(s => s.topics.filter((t, i) => {
      if (!isTopicVisible(t, level)) return false;
      return !!state.checked[`${s.id}_${i}`];
    }))
  );
  return { total: allTopics.length, done: done.length, pct: allTopics.length ? (done.length / allTopics.length) * 100 : 0 };
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
      const nextSubject = btn.dataset.subject;
      if (nextSubject === state.activeSubject) return;
      state.activeSubject = nextSubject;
      shouldAnimateSubjectSwitch = true;
      saveUi();
      render();
    });
  });
}

/* ================================================================
   RENDER – PROGRESS RING
   ================================================================ */

function progressRingWithTransition(fromPct, toPct, color) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const fromOffset = c * (1 - fromPct / 100);
  const safeColor = color || '#1d3461';
  return `
    <div class="progressRing" data-target-pct="${toPct}" style="--ring-color:${safeColor};--ring-offset:${fromOffset};--ring-circ:${c}">
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle class="progressTrack" cx="42" cy="42" r="30" fill="none" stroke-width="7"></circle>
        <circle class="progressFill" cx="42" cy="42" r="30" fill="none" stroke-width="7"
          transform="rotate(-90 42 42)"></circle>
      </svg>
      <div class="progressText">${Math.round(toPct)}%</div>
    </div>
  `;
}

function animateProgressVisuals(app) {
  const ring = app.querySelector('.progressRing[data-target-pct]');
  if (ring) {
    const targetPct = Number(ring.dataset.targetPct) || 0;
    const c = Number(ring.style.getPropertyValue('--ring-circ')) || (2 * Math.PI * 30);
    const targetOffset = c * (1 - targetPct / 100);
    requestAnimationFrame(() => {
      ring.style.setProperty('--ring-offset', targetOffset);
    });
  }

  app.querySelectorAll('.quarterBarFill[data-target-width]').forEach(bar => {
    const target = Number(bar.dataset.targetWidth);
    if (!Number.isFinite(target)) return;
    requestAnimationFrame(() => {
      bar.style.width = `${target}%`;
    });
  });
}

/* ================================================================
   RENDER – HAUPT-ANSICHT
   ================================================================ */

let isInitialRender = true;

function render() {
  const subject        = getSubject();
  const effectiveLevel = getEffectiveLevel(subject);
  setTheme(subject);
  renderTabs();

  const app     = document.getElementById('app');
  const overall = calcSubjectProgress(subject);
  const previousOverallPct = Number.isFinite(previousProgress.subjectPctById[subject.id])
    ? previousProgress.subjectPctById[subject.id]
    : overall.pct;

  const quarterStatsByKey = {};
  subject.quarters.forEach((quarter, quarterIndex) => {
    const key = getQuarterKey(subject.id, quarterIndex);
    quarterStatsByKey[key] = getQuarterStats(quarter, effectiveLevel);
  });

  if (isInitialRender) {
    app.classList.add('initial-load');
  } else {
    app.classList.remove('initial-load');
  }

  if (shouldAnimateSubjectSwitch) {
    app.classList.add('subject-switch');
  } else {
    app.classList.remove('subject-switch');
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
      ${progressRingWithTransition(previousOverallPct, overall.pct, subject.color)}
    </section>

    ${subject.quarters.map((quarter, quarterIndex) => {
      const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
      const books = Array.isArray(quarter.books) ? quarter.books : [];
      const quarterKey = getQuarterKey(subject.id, quarterIndex);
      const quarterStats = quarterStatsByKey[quarterKey];
      const previousQuarterPct = Number.isFinite(previousProgress.quarterPctByKey[quarterKey])
        ? previousProgress.quarterPctByKey[quarterKey]
        : quarterStats.pct;

      return `
        <section class="quarter" data-quarter-key="${quarterKey}" style="--quarter-index:${quarterIndex}">
          <div class="quarterHead">
            <div class="quarterBadge ${quarterStats.complete ? 'is-complete' : ''}">${quarter.q}</div>
            <div class="quarterBar">
              <div class="quarterBarFill" data-target-width="${quarterStats.pct}" style="width:${previousQuarterPct}%"></div>
            </div>
            <div class="quarterMeta">${quarterStats.done}/${quarterStats.total}</div>
          </div>

          ${books.length ? `
            <div class="books">
              <div class="booksTitle">Lektüre:</div>
              ${books.map(book => {
                const hasPages = Number.isInteger(book.pages) && book.pages > 0;
                return `
                  <article class="bookItem">
                    <span class="bookTag">BUCH</span>
                    <span class="bookName">${escapeHtml(book.name || '')}</span>
                    ${hasPages ? `<span class="bookPages">${book.pages} Seiten</span>` : ''}
                  </article>
                `;
              }).join('')}
            </div>
          ` : ''}

          ${sections.map((section, sectionIndex) => {
            const visibleTopics = section.topics.filter(t => isTopicVisible(t, effectiveLevel));
            const done    = countDone(section, effectiveLevel);
            const allDone = done === visibleTopics.length && visibleTopics.length > 0;
            const isOpen  = state.openSections[section.id] !== false;

            return `
              <article class="section" style="--section-index:${sectionIndex}">
                <button class="sectionHeader ${allDone ? 'done' : ''}"
                  data-toggle-section="${section.id}">
                  <span class="arrow">${isOpen ? '▾' : '▸'}</span>
                  <span class="sectionTitle">${escapeHtml(section.title)}</span>
                  <span class="pill">${done}/${visibleTopics.length}</span>
                </button>
                ${isOpen ? `
                  <div class="topics">
                    ${section.topics.map((topic, i) => {
                      if (!isTopicVisible(topic, effectiveLevel)) return '';
                      const key       = `${section.id}_${i}`;
                      const isChecked = !!state.checked[key];
                      const isLK      = topic.level === 'lk';
                      const isGK      = topic.level === 'gk';
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
  animateProgressVisuals(app);

  previousProgress.subjectPctById[subject.id] = overall.pct;
  Object.keys(quarterStatsByKey).forEach(key => {
    previousProgress.quarterPctByKey[key] = quarterStatsByKey[key].pct;
  });

  if (isInitialRender) {
    document.body.classList.add('app-ready');
  }

  shouldAnimateSubjectSwitch = false;
  isInitialRender = false;
}

/* ================================================================
   EVENTS
   ================================================================ */

function bindEvents() {
  document.querySelectorAll('[data-topic-key]').forEach(input => {
    input.addEventListener('change', () => {
      const subject = getSubject();
      const level = getEffectiveLevel(subject);
      const beforeMap = getQuarterCompletionMap(subject, level);
      state.checked[input.dataset.topicKey] = input.checked;
      saveChecked();
      celebrateCompletedQuarters(subject, level, beforeMap);
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
      const id      = btn.dataset.markSection;
      const subject = getSubject();
      const level   = getEffectiveLevel(subject);
      const beforeMap = getQuarterCompletionMap(subject, level);
      let target    = null;
      subject.quarters.forEach(q => (q.sections || []).forEach(s => { if (s.id === id) target = s; }));
      if (!target) return;
      const visibleTopics = target.topics.filter(t => isTopicVisible(t, level));
      const allChecked    = visibleTopics.every(t => {
        const i = target.topics.indexOf(t);
        return !!state.checked[`${id}_${i}`];
      });
      target.topics.forEach((t, i) => {
        if (!isTopicVisible(t, level)) return;
        state.checked[`${id}_${i}`] = !allChecked;
      });
      saveChecked();
      celebrateCompletedQuarters(subject, level, beforeMap);
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
      (q.sections || []).forEach(s =>
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
      (q.sections || []).forEach(s => { state.openSections[s.id] = true; })
    );
    saveUi();
    render();
  });

  document.getElementById('collapse-all').addEventListener('click', () => {
    getSubject().quarters.forEach(q =>
      (q.sections || []).forEach(s => { state.openSections[s.id] = false; })
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
