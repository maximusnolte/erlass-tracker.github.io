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
let renderQueued = false;

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
  let done = 0;
  for (let i = 0; i < section.topics.length; i += 1) {
    const topic = section.topics[i];
    if (!isTopicVisible(topic, level)) continue;
    if (state.checked[`${section.id}_${i}`]) done += 1;
  }
  return done;
}

function getQuarterKey(subjectId, quarterIndex) {
  return `${subjectId}__q${quarterIndex}`;
}

function getQuarterStats(quarter, level) {
  const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
  let total = 0;
  let done = 0;
  for (let sIndex = 0; sIndex < sections.length; sIndex += 1) {
    const section = sections[sIndex];
    for (let tIndex = 0; tIndex < section.topics.length; tIndex += 1) {
      const topic = section.topics[tIndex];
      if (!isTopicVisible(topic, level)) continue;
      total += 1;
      if (state.checked[`${section.id}_${tIndex}`]) done += 1;
    }
  }
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
  let total = 0;
  let done = 0;

  for (let qIndex = 0; qIndex < subject.quarters.length; qIndex += 1) {
    const quarter = subject.quarters[qIndex];
    const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
    for (let sIndex = 0; sIndex < sections.length; sIndex += 1) {
      const section = sections[sIndex];
      for (let tIndex = 0; tIndex < section.topics.length; tIndex += 1) {
        const topic = section.topics[tIndex];
        if (!isTopicVisible(topic, level)) continue;
        total += 1;
        if (state.checked[`${section.id}_${tIndex}`]) done += 1;
      }
    }
  }

  return { total, done, pct: total ? (done / total) * 100 : 0 };
}

function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
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
            const isOpen  = state.openSections[section.id] === true;

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

function getSectionIdFromTopicKey(topicKey) {
  const index = topicKey.lastIndexOf('_');
  return index > 0 ? topicKey.slice(0, index) : '';
}

function countVisibleTopics(section, level) {
  let total = 0;
  for (let i = 0; i < section.topics.length; i += 1) {
    if (isTopicVisible(section.topics[i], level)) total += 1;
  }
  return total;
}

function findSectionContext(subject, sectionId) {
  for (let qIndex = 0; qIndex < subject.quarters.length; qIndex += 1) {
    const quarter = subject.quarters[qIndex];
    const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
    for (let sIndex = 0; sIndex < sections.length; sIndex += 1) {
      const section = sections[sIndex];
      if (section.id === sectionId) {
        return { quarterIndex: qIndex, section };
      }
    }
  }
  return null;
}

function updateHeroProgress(subject, level) {
  const muted = document.querySelector('.hero .muted');
  const ring = document.querySelector('#app .progressRing[data-target-pct]');
  if (!muted || !ring) return false;

  const overall = calcSubjectProgress(subject);
  muted.textContent = `${formatLevel(level)} · ${overall.done} von ${overall.total} Themen erledigt`;

  const c = Number(ring.style.getPropertyValue('--ring-circ')) || (2 * Math.PI * 30);
  const targetOffset = c * (1 - overall.pct / 100);
  ring.dataset.targetPct = String(overall.pct);
  const progressText = ring.querySelector('.progressText');
  if (progressText) {
    progressText.textContent = `${Math.round(overall.pct)}%`;
  }
  requestAnimationFrame(() => {
    ring.style.setProperty('--ring-offset', targetOffset);
  });

  previousProgress.subjectPctById[subject.id] = overall.pct;
  return true;
}

function updateQuarterProgress(subject, level, quarterIndex) {
  const quarterKey = getQuarterKey(subject.id, quarterIndex);
  const quarterEl = document.querySelector(`[data-quarter-key="${quarterKey}"]`);
  if (!quarterEl) return false;

  const quarter = subject.quarters[quarterIndex];
  if (!quarter) return false;
  const stats = getQuarterStats(quarter, level);

  const meta = quarterEl.querySelector('.quarterMeta');
  if (meta) {
    meta.textContent = `${stats.done}/${stats.total}`;
  }

  const badge = quarterEl.querySelector('.quarterBadge');
  if (badge) {
    badge.classList.toggle('is-complete', stats.complete);
  }

  const bar = quarterEl.querySelector('.quarterBarFill');
  if (bar) {
    bar.dataset.targetWidth = String(stats.pct);
    requestAnimationFrame(() => {
      bar.style.width = `${stats.pct}%`;
    });
  }

  previousProgress.quarterPctByKey[quarterKey] = stats.pct;
  return true;
}

function updateSectionProgress(subject, level, sectionId) {
  const context = findSectionContext(subject, sectionId);
  if (!context) return false;

  const header = document.querySelector(`[data-toggle-section="${sectionId}"]`);
  if (!header) return false;

  const done = countDone(context.section, level);
  const visibleTotal = countVisibleTopics(context.section, level);
  const allDone = visibleTotal > 0 && done === visibleTotal;

  header.classList.toggle('done', allDone);
  const pill = header.querySelector('.pill');
  if (pill) {
    pill.textContent = `${done}/${visibleTotal}`;
  }

  const markBtn = document.querySelector(`[data-mark-section="${sectionId}"]`);
  if (markBtn) {
    markBtn.textContent = allDone ? 'Alle abwählen' : 'Alle abhaken';
  }

  return true;
}

function syncSectionTopicDom(sectionId) {
  const header = document.querySelector(`[data-toggle-section="${sectionId}"]`);
  if (!header) return false;

  const sectionEl = header.closest('.section');
  if (!sectionEl) return false;

  const inputs = sectionEl.querySelectorAll('input[type="checkbox"][data-topic-key]');
  inputs.forEach(input => {
    const checked = !!state.checked[input.dataset.topicKey];
    input.checked = checked;
    const topicLabel = input.closest('.topic');
    if (topicLabel) {
      topicLabel.classList.toggle('checked', checked);
    }
  });
  return true;
}

function applyPartialTopicUpdate(sectionId) {
  const subject = getSubject();
  const level = getEffectiveLevel(subject);
  const context = findSectionContext(subject, sectionId);
  if (!context) {
    requestRender();
    return;
  }

  const sectionOk = updateSectionProgress(subject, level, sectionId);
  const quarterOk = updateQuarterProgress(subject, level, context.quarterIndex);
  const heroOk = updateHeroProgress(subject, level);

  if (!sectionOk || !quarterOk || !heroOk) {
    requestRender();
  }
}

/* ================================================================
   EVENTS
   ================================================================ */

function bindEvents() {
  const tabs = document.getElementById('tabs');
  const app = document.getElementById('app');

  tabs.addEventListener('click', event => {
    const btn = event.target.closest('.tab[data-subject]');
    if (!btn || !tabs.contains(btn)) return;

    const nextSubject = btn.dataset.subject;
    if (nextSubject === state.activeSubject) return;

    state.activeSubject = nextSubject;
    shouldAnimateSubjectSwitch = true;
    saveUi();
    requestRender();
  });

  app.addEventListener('change', event => {
    const input = event.target.closest('[data-topic-key]');
    if (!input || !app.contains(input)) return;

    const subject = getSubject();
    const level = getEffectiveLevel(subject);
    const beforeMap = getQuarterCompletionMap(subject, level);
    state.checked[input.dataset.topicKey] = input.checked;
    saveChecked();
    celebrateCompletedQuarters(subject, level, beforeMap);

    const topicLabel = input.closest('.topic');
    if (topicLabel) {
      topicLabel.classList.toggle('checked', input.checked);
    }
    const sectionId = getSectionIdFromTopicKey(input.dataset.topicKey || '');
    if (!sectionId) {
      requestRender();
      return;
    }

    applyPartialTopicUpdate(sectionId);
  });

  app.addEventListener('click', event => {
    const toggleBtn = event.target.closest('[data-toggle-section]');
    if (toggleBtn && app.contains(toggleBtn)) {
      const id = toggleBtn.dataset.toggleSection;
      state.openSections[id] = state.openSections[id] !== true;
      saveUi();
      requestRender();
      return;
    }

    const markBtn = event.target.closest('[data-mark-section]');
    if (markBtn && app.contains(markBtn)) {
      const id = markBtn.dataset.markSection;
      const subject = getSubject();
      const level = getEffectiveLevel(subject);
      const beforeMap = getQuarterCompletionMap(subject, level);

      let target = null;
      subject.quarters.forEach(q => {
        (q.sections || []).forEach(s => {
          if (s.id === id) target = s;
        });
      });
      if (!target) return;

      let hasVisibleTopic = false;
      let allChecked = true;
      for (let i = 0; i < target.topics.length; i += 1) {
        const topic = target.topics[i];
        if (!isTopicVisible(topic, level)) continue;
        hasVisibleTopic = true;
        if (!state.checked[`${id}_${i}`]) {
          allChecked = false;
          break;
        }
      }
      if (!hasVisibleTopic) return;

      for (let i = 0; i < target.topics.length; i += 1) {
        const topic = target.topics[i];
        if (!isTopicVisible(topic, level)) continue;
        state.checked[`${id}_${i}`] = !allChecked;
      }

      saveChecked();
      celebrateCompletedQuarters(subject, level, beforeMap);

      if (!syncSectionTopicDom(id)) {
        requestRender();
        return;
      }
      applyPartialTopicUpdate(id);
      return;
    }

    const setLevelBtn = event.target.closest('[data-set-level]');
    if (setLevelBtn && app.contains(setLevelBtn)) {
      const subject = getSubject();
      state.subjectLevels[subject.id] = setLevelBtn.dataset.setLevel;
      saveUi();
      requestRender();
      return;
    }

    const resetSubjectBtn = event.target.closest('#reset-subject');
    if (resetSubjectBtn && app.contains(resetSubjectBtn)) {
      const subject = getSubject();
      subject.quarters.forEach(q => {
        (q.sections || []).forEach(s => {
          s.topics.forEach((_, i) => {
            delete state.checked[`${s.id}_${i}`];
          });
        });
      });
      saveChecked();
      requestRender();
      return;
    }

    const resetAllBtn = event.target.closest('#reset-all');
    if (resetAllBtn && app.contains(resetAllBtn)) {
      state.checked = {};
      saveChecked();
      requestRender();
      return;
    }

    const expandAllBtn = event.target.closest('#expand-all');
    if (expandAllBtn && app.contains(expandAllBtn)) {
      getSubject().quarters.forEach(q => {
        (q.sections || []).forEach(s => {
          state.openSections[s.id] = true;
        });
      });
      saveUi();
      requestRender();
      return;
    }

    const collapseAllBtn = event.target.closest('#collapse-all');
    if (collapseAllBtn && app.contains(collapseAllBtn)) {
      getSubject().quarters.forEach(q => {
        (q.sections || []).forEach(s => {
          state.openSections[s.id] = false;
        });
      });
      saveUi();
      requestRender();
    }
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
  applyPerformanceMode();
  bindEvents();
  render();
}
init();

function applyPerformanceMode() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cores = Number(navigator.hardwareConcurrency || 0);
  const lowPowerDevice = cores > 0 && cores <= 4;

  if (prefersReducedMotion || lowPowerDevice) {
    document.body.classList.add('lite-effects');
  }
}

/* ── Header: bei Scroll nach unten ausblenden ───────────────────── */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let nextScrollY = lastScrollY;
  let ticking = false;

  function updateHeader() {
    const currentY = nextScrollY;
    const scrollingDown = currentY > lastScrollY + 2;
    const scrollingUp = currentY < lastScrollY - 2;

    if (scrollingDown && currentY > 80) {
      header.classList.add('header-hidden');
    } else if (scrollingUp || currentY <= 80) {
      header.classList.remove('header-hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    nextScrollY = window.scrollY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
}());
