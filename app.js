/* ================================================================
   ABITUR CHECKLISTEN 2026 - App
   ================================================================ */

/* ================================================================
   ZUSTAND & PERSISTENZ
   ================================================================ */

const STORAGE_KEY = 'abitur-checklisten-2026-offline-v1';
const UI_KEY = 'abitur-checklisten-2026-ui-v1';
const SAVE_DEBOUNCE_MS = 120;

const state = {
  checked: {},
  openSections: {},
  activeSubject: 'deutsch',
  subjectLevels: {}
};

let subjects = [];
let renderQueued = false;
let isInitialRender = true;
let checkedSaveTimer = null;
let uiSaveTimer = null;

const dom = {
  tabs: null,
  app: null
};

function safeParseObject(rawValue) {
  try {
    const parsed = JSON.parse(rawValue || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function loadState() {
  const savedChecked = safeParseObject(localStorage.getItem(STORAGE_KEY));
  const savedUi = safeParseObject(localStorage.getItem(UI_KEY));

  state.checked = savedChecked;
  state.openSections = savedUi.openSections && typeof savedUi.openSections === 'object'
    ? savedUi.openSections
    : {};
  state.subjectLevels = savedUi.subjectLevels && typeof savedUi.subjectLevels === 'object'
    ? savedUi.subjectLevels
    : {};

  if (savedUi.activeSubject && subjects.some(subject => subject.id === savedUi.activeSubject)) {
    state.activeSubject = savedUi.activeSubject;
  }
}

function flushCheckedSave() {
  if (checkedSaveTimer) {
    window.clearTimeout(checkedSaveTimer);
    checkedSaveTimer = null;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.checked));
}

function flushUiSave() {
  if (uiSaveTimer) {
    window.clearTimeout(uiSaveTimer);
    uiSaveTimer = null;
  }
  localStorage.setItem(UI_KEY, JSON.stringify({
    activeSubject: state.activeSubject,
    openSections: state.openSections,
    subjectLevels: state.subjectLevels
  }));
}

function saveChecked() {
  if (checkedSaveTimer) return;
  checkedSaveTimer = window.setTimeout(flushCheckedSave, SAVE_DEBOUNCE_MS);
}

function saveUi() {
  if (uiSaveTimer) return;
  uiSaveTimer = window.setTimeout(flushUiSave, SAVE_DEBOUNCE_MS);
}

/* ================================================================
   HILFSFUNKTIONEN
   ================================================================ */

function getSubject() {
  return subjects.find(subject => subject.id === state.activeSubject) || subjects[0];
}

function getEffectiveLevel(subject) {
  return state.subjectLevels[subject.id] || subject.level || 'gk';
}

function formatLevel(level) {
  if (level === 'lk') return 'Leistungskurs';
  if (level === 'gk') return 'Grundkurs';
  return level;
}

function isTopicVisible(topic, level) {
  return !(topic.level === 'lk' && level === 'gk');
}

function getTopicKey(sectionId, topicIndex) {
  return `${sectionId}_${topicIndex}`;
}

function countVisibleTopics(section, level) {
  let total = 0;
  for (let topicIndex = 0; topicIndex < section.topics.length; topicIndex += 1) {
    if (isTopicVisible(section.topics[topicIndex], level)) {
      total += 1;
    }
  }
  return total;
}

function countDone(section, level) {
  let done = 0;
  for (let topicIndex = 0; topicIndex < section.topics.length; topicIndex += 1) {
    if (!isTopicVisible(section.topics[topicIndex], level)) continue;
    if (state.checked[getTopicKey(section.id, topicIndex)]) done += 1;
  }
  return done;
}

function calcSubjectProgress(subject) {
  const level = getEffectiveLevel(subject);
  let total = 0;
  let done = 0;

  for (let quarterIndex = 0; quarterIndex < subject.quarters.length; quarterIndex += 1) {
    const quarter = subject.quarters[quarterIndex];
    const sections = Array.isArray(quarter.sections) ? quarter.sections : [];

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
      const section = sections[sectionIndex];
      for (let topicIndex = 0; topicIndex < section.topics.length; topicIndex += 1) {
        const topic = section.topics[topicIndex];
        if (!isTopicVisible(topic, level)) continue;
        total += 1;
        if (state.checked[getTopicKey(section.id, topicIndex)]) done += 1;
      }
    }
  }

  return {
    total,
    done,
    pct: total ? (done / total) * 100 : 0
  };
}

function findSectionById(subject, sectionId) {
  for (let quarterIndex = 0; quarterIndex < subject.quarters.length; quarterIndex += 1) {
    const quarter = subject.quarters[quarterIndex];
    const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
      if (sections[sectionIndex].id === sectionId) return sections[sectionIndex];
    }
  }
  return null;
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
  root.style.setProperty('--subject-color', subject.color || '#1d3461');
  root.style.setProperty('--subject-accent', subject.accent || subject.color || '#2563eb');
  root.style.setProperty('--subject-bg', subject.bg || '#eef2fb');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ================================================================
   RENDER
   ================================================================ */

function renderTabs() {
  dom.tabs.innerHTML = subjects.map(subject => {
    const level = getEffectiveLevel(subject).toUpperCase();
    return `
      <button
        class="tab ${subject.id === state.activeSubject ? 'active' : ''}"
        data-subject="${subject.id}"
        style="--tab-color:${subject.color}"
      >${escapeHtml(subject.name)} · ${level}</button>
    `;
  }).join('');
}

function progressRing(pct, color) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return `
    <div class="progressRing">
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="30" fill="none" stroke="#e5e5ea" stroke-width="7"></circle>
        <circle cx="42" cy="42" r="30" fill="none" stroke="${color}" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          transform="rotate(-90 42 42)"></circle>
      </svg>
      <div class="progressText">${Math.round(pct)}%</div>
    </div>
  `;
}

function render() {
  if (!subjects.length) return;

  const subject = getSubject();
  const effectiveLevel = getEffectiveLevel(subject);
  const overall = calcSubjectProgress(subject);

  setTheme(subject);
  renderTabs();

  const quarterHtml = [];

  for (let quarterIndex = 0; quarterIndex < subject.quarters.length; quarterIndex += 1) {
    const quarter = subject.quarters[quarterIndex];
    const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
    const books = Array.isArray(quarter.books) ? quarter.books : [];

    let quarterTotal = 0;
    let quarterDone = 0;
    const sectionHtml = [];

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
      const section = sections[sectionIndex];
      const visibleCount = countVisibleTopics(section, effectiveLevel);
      const doneCount = countDone(section, effectiveLevel);
      const allDone = visibleCount > 0 && doneCount === visibleCount;
      const isOpen = state.openSections[section.id] !== false;

      quarterTotal += visibleCount;
      quarterDone += doneCount;

      let topicsHtml = '';
      if (isOpen) {
        const topicRows = [];
        for (let topicIndex = 0; topicIndex < section.topics.length; topicIndex += 1) {
          const topic = section.topics[topicIndex];
          if (!isTopicVisible(topic, effectiveLevel)) continue;

          const key = getTopicKey(section.id, topicIndex);
          const isChecked = !!state.checked[key];
          const isLK = topic.level === 'lk';
          const isGK = topic.level === 'gk';

          topicRows.push(`
            <label class="topic ${isChecked ? 'checked' : ''}">
              <input type="checkbox" data-topic-key="${key}" ${isChecked ? 'checked' : ''}>
              <span class="topicText">
                ${isLK ? '<span class="lkTag">LK</span>' : ''}${isGK ? '<span class="gkTag">GK</span>' : ''}${escapeHtml(topic.text)}
              </span>
            </label>
          `);
        }

        topicsHtml = `
          <div class="topics">
            ${topicRows.join('')}
            <div class="sectionTools">
              <button class="miniBtn" data-mark-section="${section.id}">
                ${doneCount === visibleCount ? 'Alle abwählen' : 'Alle abhaken'}
              </button>
            </div>
          </div>
        `;
      }

      sectionHtml.push(`
        <article class="section">
          <button class="sectionHeader ${allDone ? 'done' : ''}" data-toggle-section="${section.id}">
            <span class="arrow">${isOpen ? '▾' : '▸'}</span>
            <span class="sectionTitle">${escapeHtml(section.title)}</span>
            <span class="pill">${doneCount}/${visibleCount}</span>
          </button>
          ${topicsHtml}
        </article>
      `);
    }

    const quarterPct = quarterTotal ? (quarterDone / quarterTotal) * 100 : 0;

    const booksHtml = books.length ? `
      <div class="books">
        <div class="booksTitle">Speziallektueren</div>
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
    ` : '';

    quarterHtml.push(`
      <section class="quarter">
        <div class="quarterHead">
          <div class="quarterBadge">${quarter.q}</div>
          <div class="quarterBar">
            <div class="quarterBarFill" style="width:${quarterPct}%"></div>
          </div>
          <div class="quarterMeta">${quarterDone}/${quarterTotal}</div>
        </div>
        ${booksHtml}
        ${sectionHtml.join('')}
      </section>
    `);
  }

  if (isInitialRender) {
    dom.app.classList.add('initial-load');
    isInitialRender = false;
  } else {
    dom.app.classList.remove('initial-load');
  }

  dom.app.innerHTML = `
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
    ${quarterHtml.join('')}
  `;
}

/* ================================================================
   EVENTS
   ================================================================ */

function bindEvents() {
  dom.tabs.addEventListener('click', event => {
    const tab = event.target.closest('.tab[data-subject]');
    if (!tab || !dom.tabs.contains(tab)) return;

    const nextSubject = tab.dataset.subject;
    if (!nextSubject || nextSubject === state.activeSubject) return;

    state.activeSubject = nextSubject;
    saveUi();
    requestRender();
  });

  dom.app.addEventListener('change', event => {
    const checkbox = event.target.closest('[data-topic-key]');
    if (!checkbox || !dom.app.contains(checkbox)) return;

    const key = checkbox.dataset.topicKey;
    if (!key) return;

    state.checked[key] = checkbox.checked;
    saveChecked();

    const topic = checkbox.closest('.topic');
    if (topic) topic.classList.toggle('checked', checkbox.checked);

    requestRender();
  });

  dom.app.addEventListener('click', event => {
    const toggleSection = event.target.closest('[data-toggle-section]');
    if (toggleSection && dom.app.contains(toggleSection)) {
      const id = toggleSection.dataset.toggleSection;
      if (!id) return;
      state.openSections[id] = !(state.openSections[id] !== false);
      saveUi();
      requestRender();
      return;
    }

    const markSection = event.target.closest('[data-mark-section]');
    if (markSection && dom.app.contains(markSection)) {
      const id = markSection.dataset.markSection;
      const subject = getSubject();
      const level = getEffectiveLevel(subject);
      const section = findSectionById(subject, id);
      if (!section) return;

      let hasVisibleTopics = false;
      let allChecked = true;

      for (let topicIndex = 0; topicIndex < section.topics.length; topicIndex += 1) {
        const topic = section.topics[topicIndex];
        if (!isTopicVisible(topic, level)) continue;

        hasVisibleTopics = true;
        if (!state.checked[getTopicKey(id, topicIndex)]) {
          allChecked = false;
          break;
        }
      }

      if (!hasVisibleTopics) return;

      for (let topicIndex = 0; topicIndex < section.topics.length; topicIndex += 1) {
        const topic = section.topics[topicIndex];
        if (!isTopicVisible(topic, level)) continue;
        state.checked[getTopicKey(id, topicIndex)] = !allChecked;
      }

      saveChecked();
      requestRender();
      return;
    }

    const setLevel = event.target.closest('[data-set-level]');
    if (setLevel && dom.app.contains(setLevel)) {
      const subject = getSubject();
      const level = setLevel.dataset.setLevel;
      if (!level || level === state.subjectLevels[subject.id]) return;

      state.subjectLevels[subject.id] = level;
      saveUi();
      requestRender();
      return;
    }

    const resetSubject = event.target.closest('#reset-subject');
    if (resetSubject && dom.app.contains(resetSubject)) {
      const subject = getSubject();
      subject.quarters.forEach(quarter => {
        const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
        sections.forEach(section => {
          section.topics.forEach((topic, topicIndex) => {
            delete state.checked[getTopicKey(section.id, topicIndex)];
          });
        });
      });
      saveChecked();
      requestRender();
      return;
    }

    const resetAll = event.target.closest('#reset-all');
    if (resetAll && dom.app.contains(resetAll)) {
      state.checked = {};
      saveChecked();
      requestRender();
      return;
    }

    const expandAll = event.target.closest('#expand-all');
    if (expandAll && dom.app.contains(expandAll)) {
      const subject = getSubject();
      subject.quarters.forEach(quarter => {
        const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
        sections.forEach(section => {
          state.openSections[section.id] = true;
        });
      });
      saveUi();
      requestRender();
      return;
    }

    const collapseAll = event.target.closest('#collapse-all');
    if (collapseAll && dom.app.contains(collapseAll)) {
      const subject = getSubject();
      subject.quarters.forEach(quarter => {
        const sections = Array.isArray(quarter.sections) ? quarter.sections : [];
        sections.forEach(section => {
          state.openSections[section.id] = false;
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

function applyPerformanceMode() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cores = Number(navigator.hardwareConcurrency || 0);
  const lowPowerDevice = cores > 0 && cores <= 4;

  if (prefersReducedMotion || lowPowerDevice) {
    document.body.classList.add('lite-effects');
  }
}

function bindHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastKnownY = window.scrollY;
  let latestY = lastKnownY;
  let ticking = false;
  let headerHidden = false;
  let scrollIdleTimer = null;

  function markScrolling() {
    document.body.classList.add('is-scrolling');
    if (scrollIdleTimer) {
      window.clearTimeout(scrollIdleTimer);
    }
    scrollIdleTimer = window.setTimeout(() => {
      document.body.classList.remove('is-scrolling');
      scrollIdleTimer = null;
    }, 140);
  }

  function clearScrollState() {
    if (scrollIdleTimer) {
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = null;
    }
    document.body.classList.remove('is-scrolling');
  }

  function onAnimationFrame() {
    const currentY = latestY;
    const scrollingDown = currentY > lastKnownY + 4;
    const scrollingUp = currentY < lastKnownY - 4;

    if (scrollingDown && currentY > 96 && !headerHidden) {
      header.classList.add('header-hidden');
      headerHidden = true;
    } else if ((scrollingUp || currentY <= 96) && headerHidden) {
      header.classList.remove('header-hidden');
      headerHidden = false;
    }

    lastKnownY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    latestY = window.scrollY;
    markScrolling();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onAnimationFrame);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearScrollState();
    }
  });

  window.addEventListener('pagehide', clearScrollState, { passive: true });
}

async function init() {
  dom.tabs = document.getElementById('tabs');
  dom.app = document.getElementById('app');

  if (!dom.tabs || !dom.app) return;

  try {
    const response = await fetch('subjects.json');
    if (!response.ok) {
      throw new Error(`subjects.json konnte nicht geladen werden (HTTP ${response.status})`);
    }
    subjects = await response.json();
  } catch (error) {
    dom.app.innerHTML = '<p style="color:red;padding:20px">Fehler: subjects.json konnte nicht geladen werden.</p>';
    return;
  }

  loadState();
  applyPerformanceMode();
  bindEvents();
  bindHeaderScroll();

  window.addEventListener('beforeunload', () => {
    flushCheckedSave();
    flushUiSave();
  });

  requestRender();
}

init();
