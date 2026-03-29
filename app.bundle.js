(()=>{var O="abitur-checklisten-2026-offline-v1",_="abitur-checklisten-2026-ui-v1";var o={checked:{},openSections:{},activeSubject:"deutsch",subjectLevels:{}},y=[],H=!1,U=!0,L=null,E=null,d={tabs:null,app:null};function N(e){try{let t=JSON.parse(e||"{}");return t&&typeof t=="object"?t:{}}catch{return{}}}function V(){let e=N(localStorage.getItem(O)),t=N(localStorage.getItem(_));o.checked=e,o.openSections=t.openSections&&typeof t.openSections=="object"?t.openSections:{},o.subjectLevels=t.subjectLevels&&typeof t.subjectLevels=="object"?t.subjectLevels:{},t.activeSubject&&y.some(s=>s.id===t.activeSubject)&&(o.activeSubject=t.activeSubject)}function D(){L&&(window.clearTimeout(L),L=null),localStorage.setItem(O,JSON.stringify(o.checked))}function R(){E&&(window.clearTimeout(E),E=null),localStorage.setItem(_,JSON.stringify({activeSubject:o.activeSubject,openSections:o.openSections,subjectLevels:o.subjectLevels}))}function x(){L||(L=window.setTimeout(D,120))}function w(){E||(E=window.setTimeout(R,120))}function k(){return y.find(e=>e.id===o.activeSubject)||y[0]}function I(e){return o.subjectLevels[e.id]||e.level||"gk"}function G(e){return e==="lk"?"Leistungskurs":e==="gk"?"Grundkurs":e}function j(e,t){return!(e.level==="lk"&&t==="gk")}function S(e,t){return`${e}_${t}`}function J(e,t){let s=0;for(let n=0;n<e.topics.length;n+=1)j(e.topics[n],t)&&(s+=1);return s}function Q(e,t){let s=0;for(let n=0;n<e.topics.length;n+=1)j(e.topics[n],t)&&o.checked[S(e.id,n)]&&(s+=1);return s}function W(e){let t=I(e),s=0,n=0;for(let r=0;r<e.quarters.length;r+=1){let i=e.quarters[r],v=Array.isArray(i.sections)?i.sections:[];for(let f=0;f<v.length;f+=1){let a=v[f];for(let c=0;c<a.topics.length;c+=1){let b=a.topics[c];j(b,t)&&(s+=1,o.checked[S(a.id,c)]&&(n+=1))}}}return{total:s,done:n,pct:s?n/s*100:0}}function X(e,t){for(let s=0;s<e.quarters.length;s+=1){let n=e.quarters[s],r=Array.isArray(n.sections)?n.sections:[];for(let i=0;i<r.length;i+=1)if(r[i].id===t)return r[i]}return null}function g(){H||(H=!0,requestAnimationFrame(()=>{H=!1,se()}))}function Z(e){let t=document.documentElement;t.style.setProperty("--subject-color",e.color||"#1d3461"),t.style.setProperty("--subject-accent",e.accent||e.color||"#2563eb"),t.style.setProperty("--subject-bg",e.bg||"#eef2fb")}function m(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ee(){d.tabs.innerHTML=y.map(e=>{let t=I(e).toUpperCase();return`
      <button
        class="tab ${e.id===o.activeSubject?"active":""}"
        data-subject="${e.id}"
        style="--tab-color:${e.color}"
      >${m(e.name)} \xB7 ${t}</button>
    `}).join("")}function te(e,t){let n=2*Math.PI*30,r=n*(1-e/100);return`
    <div class="progressRing">
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="30" fill="none" stroke="#e5e5ea" stroke-width="7"></circle>
        <circle cx="42" cy="42" r="30" fill="none" stroke="${t}" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="${n}" stroke-dashoffset="${r}"
          transform="rotate(-90 42 42)"></circle>
      </svg>
      <div class="progressText">${Math.round(e)}%</div>
    </div>
  `}function se(){if(!y.length)return;let e=k(),t=I(e),s=W(e);Z(e),ee();let n=[];for(let r=0;r<e.quarters.length;r+=1){let i=e.quarters[r],v=Array.isArray(i.sections)?i.sections:[],f=Array.isArray(i.books)?i.books:[],a=0,c=0,b=[];for(let p=0;p<v.length;p+=1){let l=v[p],h=J(l,t),T=Q(l,t),Y=h>0&&T===h,C=o.openSections[l.id]!==!1;a+=h,c+=T;let B="";if(C){let K=[];for(let A=0;A<l.topics.length;A+=1){let q=l.topics[A];if(!j(q,t))continue;let M=S(l.id,A),P=!!o.checked[M],z=q.level==="lk",F=q.level==="gk";K.push(`
            <label class="topic ${P?"checked":""}">
              <input type="checkbox" data-topic-key="${M}" ${P?"checked":""}>
              <span class="topicText">
                ${z?'<span class="lkTag">LK</span>':""}${F?'<span class="gkTag">GK</span>':""}${m(q.text)}
              </span>
            </label>
          `)}B=`
          <div class="topics">
            ${K.join("")}
            <div class="sectionTools">
              <button class="miniBtn" data-mark-section="${l.id}">
                ${T===h?"Alle abw\xE4hlen":"Alle abhaken"}
              </button>
            </div>
          </div>
        `}b.push(`
        <article class="section">
          <button class="sectionHeader ${Y?"done":""}" data-toggle-section="${l.id}">
            <span class="arrow">${C?"\u25BE":"\u25B8"}</span>
            <span class="sectionTitle">${m(l.title)}</span>
            <span class="pill">${T}/${h}</span>
          </button>
          ${B}
        </article>
      `)}let u=a?c/a*100:0,$=f.length?`
      <div class="books">
        <div class="booksTitle">Speziallektueren</div>
        ${f.map(p=>{let l=Number.isInteger(p.pages)&&p.pages>0;return`
            <article class="bookItem">
              <span class="bookTag">BUCH</span>
              <span class="bookName">${m(p.name||"")}</span>
              ${l?`<span class="bookPages">${p.pages} Seiten</span>`:""}
            </article>
          `}).join("")}
      </div>
    `:"";n.push(`
      <section class="quarter">
        <div class="quarterHead">
          <div class="quarterBadge">${i.q}</div>
          <div class="quarterBar">
            <div class="quarterBarFill" style="width:${u}%"></div>
          </div>
          <div class="quarterMeta">${c}/${a}</div>
        </div>
        ${$}
        ${b.join("")}
      </section>
    `)}U?(d.app.classList.add("initial-load"),U=!1):d.app.classList.remove("initial-load"),d.app.innerHTML=`
    <section class="hero">
      <div>
        <h2>${m(e.name)}</h2>
        <div class="muted">${m(G(t))} \xB7 ${s.done} von ${s.total} Themen erledigt</div>
        <div class="level-selector">
          <span class="level-label">Kurstyp:</span>
          <div class="level-toggle">
            <button class="level-btn ${t==="gk"?"active":""}" data-set-level="gk">GK</button>
            <button class="level-btn ${t==="lk"?"active":""}" data-set-level="lk">LK</button>
          </div>
        </div>
        <div class="actions">
          <button class="btn" id="reset-subject">Fach zur\xFCcksetzen</button>
          <button class="btn" id="reset-all">Alles zur\xFCcksetzen</button>
          <button class="btn" id="expand-all">Alle aufklappen</button>
          <button class="btn" id="collapse-all">Alle zuklappen</button>
        </div>
      </div>
      ${te(s.pct,e.color)}
    </section>
    ${n.join("")}
  `}function ne(){d.tabs.addEventListener("click",e=>{let t=e.target.closest(".tab[data-subject]");if(!t||!d.tabs.contains(t))return;let s=t.dataset.subject;!s||s===o.activeSubject||(o.activeSubject=s,w(),g())}),d.app.addEventListener("change",e=>{let t=e.target.closest("[data-topic-key]");if(!t||!d.app.contains(t))return;let s=t.dataset.topicKey;if(!s)return;o.checked[s]=t.checked,x();let n=t.closest(".topic");n&&n.classList.toggle("checked",t.checked),g()}),d.app.addEventListener("click",e=>{let t=e.target.closest("[data-toggle-section]");if(t&&d.app.contains(t)){let a=t.dataset.toggleSection;if(!a)return;o.openSections[a]=o.openSections[a]===!1,w(),g();return}let s=e.target.closest("[data-mark-section]");if(s&&d.app.contains(s)){let a=s.dataset.markSection,c=k(),b=I(c),u=X(c,a);if(!u)return;let $=!1,p=!0;for(let l=0;l<u.topics.length;l+=1){let h=u.topics[l];if(j(h,b)&&($=!0,!o.checked[S(a,l)])){p=!1;break}}if(!$)return;for(let l=0;l<u.topics.length;l+=1){let h=u.topics[l];j(h,b)&&(o.checked[S(a,l)]=!p)}x(),g();return}let n=e.target.closest("[data-set-level]");if(n&&d.app.contains(n)){let a=k(),c=n.dataset.setLevel;if(!c||c===o.subjectLevels[a.id])return;o.subjectLevels[a.id]=c,w(),g();return}let r=e.target.closest("#reset-subject");if(r&&d.app.contains(r)){k().quarters.forEach(c=>{(Array.isArray(c.sections)?c.sections:[]).forEach(u=>{u.topics.forEach(($,p)=>{delete o.checked[S(u.id,p)]})})}),x(),g();return}let i=e.target.closest("#reset-all");if(i&&d.app.contains(i)){o.checked={},x(),g();return}let v=e.target.closest("#expand-all");if(v&&d.app.contains(v)){k().quarters.forEach(c=>{(Array.isArray(c.sections)?c.sections:[]).forEach(u=>{o.openSections[u.id]=!0})}),w(),g();return}let f=e.target.closest("#collapse-all");f&&d.app.contains(f)&&(k().quarters.forEach(c=>{(Array.isArray(c.sections)?c.sections:[]).forEach(u=>{o.openSections[u.id]=!1})}),w(),g())})}function ce(){let e=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=Number(navigator.hardwareConcurrency||0),s=t>0&&t<=4;(e||s)&&document.body.classList.add("lite-effects")}function oe(){let e=document.querySelector(".site-header");if(!e)return;let t=window.scrollY,s=t,n=!1,r=!1,i=null;function v(){document.body.classList.add("is-scrolling"),i&&window.clearTimeout(i),i=window.setTimeout(()=>{document.body.classList.remove("is-scrolling"),i=null},140)}function f(){i&&(window.clearTimeout(i),i=null),document.body.classList.remove("is-scrolling")}function a(){let c=s,b=c>t+4,u=c<t-4;b&&c>96&&!r?(e.classList.add("header-hidden"),r=!0):(u||c<=96)&&r&&(e.classList.remove("header-hidden"),r=!1),t=c,n=!1}window.addEventListener("scroll",()=>{s=window.scrollY,v(),!n&&(n=!0,requestAnimationFrame(a))},{passive:!0}),document.addEventListener("visibilitychange",()=>{document.hidden&&f()}),window.addEventListener("pagehide",f,{passive:!0})}async function ie(){if(d.tabs=document.getElementById("tabs"),d.app=document.getElementById("app"),!(!d.tabs||!d.app)){try{let e=await fetch("subjects.json");if(!e.ok)throw new Error(`subjects.json konnte nicht geladen werden (HTTP ${e.status})`);y=await e.json()}catch{d.app.innerHTML='<p style="color:red;padding:20px">Fehler: subjects.json konnte nicht geladen werden.</p>';return}V(),ce(),ne(),oe(),window.addEventListener("beforeunload",()=>{D(),R()}),g()}}ie();})();
