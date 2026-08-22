"use strict";

(() => {
  const PATCH = "0.1.0-beta.7";
  const PRESENCE_KEY = "santa-luzia:windows-beta:weekly-presence-v2";
  const BANNER_SESSION_KEY = "santa-luzia:windows-beta:presence-banner-date";
  const TITLE = "Constância de Luz";
  const DAILY_POINTS = 2;
  const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  let observer = null;
  let scheduled = false;
  let lastRoute = "";
  let shieldTimer = null;

  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const text = (el) => normalize(el?.textContent);

  function todayCuiaba() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Cuiaba" }).format(new Date());
  }

  function dateNumber(iso) {
    const [y,m,d] = String(iso || "").split("-").map(Number);
    if (!y || !m || !d) return NaN;
    return Math.floor(Date.UTC(y,m-1,d) / 86400000);
  }

  function isoFromDayNumber(n) {
    const d = new Date(n * 86400000);
    return d.toISOString().slice(0,10);
  }

  function weekInfo(iso = todayCuiaba()) {
    const n = dateNumber(iso);
    const dow = new Date(n * 86400000).getUTCDay();
    const index = (dow + 6) % 7;
    const monday = n - index;
    return { week: isoFromDayNumber(monday), index, day: index + 1 };
  }

  function defaultPresence() {
    return { week: weekInfo().week, days: [], points: 0, totalPoints: 0, completedWeeks: 0, titles: [], last: "" };
  }

  function readPresence() {
    let state = defaultPresence();
    try {
      const parsed = JSON.parse(localStorage.getItem(PRESENCE_KEY) || "null");
      if (parsed && typeof parsed === "object") {
        state = {
          ...state,
          week: typeof parsed.week === "string" ? parsed.week : state.week,
          days: Array.isArray(parsed.days) ? parsed.days.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7) : [],
          points: Number.isFinite(parsed.points) ? Math.max(0, parsed.points) : 0,
          totalPoints: Number.isFinite(parsed.totalPoints) ? Math.max(0, parsed.totalPoints) : 0,
          completedWeeks: Number.isFinite(parsed.completedWeeks) ? Math.max(0, parsed.completedWeeks) : 0,
          titles: Array.isArray(parsed.titles) ? parsed.titles.filter((x) => typeof x === "string") : [],
          last: typeof parsed.last === "string" ? parsed.last : "",
        };
      }
    } catch {}
    const current = weekInfo();
    if (state.week !== current.week) {
      state.week = current.week;
      state.days = [];
      state.points = 0;
      state.last = "";
      savePresence(state);
    }
    return state;
  }

  function savePresence(state) {
    try { localStorage.setItem(PRESENCE_KEY, JSON.stringify(state)); } catch {}
  }

  function registerToday() {
    const today = todayCuiaba();
    const info = weekInfo(today);
    const state = readPresence();
    if (state.last === today || state.days.includes(info.day)) return { state, added: false, completed: false };
    state.days = [...new Set([...state.days, info.day])].sort((a,b) => a-b);
    state.points = state.days.length * DAILY_POINTS;
    state.totalPoints += DAILY_POINTS;
    state.last = today;
    let completed = false;
    if (info.day === 7 && state.days.length === 7 && !state.titles.includes(TITLE)) {
      state.titles.push(TITLE);
      state.completedWeeks += 1;
      completed = true;
    } else if (info.day === 7 && state.days.length === 7) {
      state.completedWeeks += 1;
      completed = true;
    }
    savePresence(state);
    window.dispatchEvent(new CustomEvent("santa-luzia:windows-weekly-presence", { detail: { ...state, added: DAILY_POINTS, completed } }));
    return { state, added: true, completed };
  }

  function ensureStyles() {
    if (document.getElementById("sl-beta7-polish-style")) return;
    const style = document.createElement("style");
    style.id = "sl-beta7-polish-style";
    style.textContent = `
      :root { --sl-b7-ease:cubic-bezier(.20,.72,.20,1); --sl-b7-soft:cubic-bezier(.16,.84,.24,1); }
      html, body { background:#fffaf0 !important; }
      main { backface-visibility:hidden; transform:translateZ(0); }
      .sl-b7-route-shield { position:fixed; inset:0; z-index:165; pointer-events:none; opacity:0; background:rgba(255,250,240,.68); backdrop-filter:blur(1.5px) saturate(.98); }
      .sl-b7-presence-banner { position:fixed; top:max(14px,env(safe-area-inset-top)); left:50%; z-index:245; width:min(390px,calc(100vw - 20px)); transform:translateX(-50%); padding:13px; border-radius:24px; border:1px solid rgba(123,19,38,.16); background:linear-gradient(145deg,rgba(255,255,255,.985),rgba(255,246,233,.985)); box-shadow:0 20px 54px rgba(72,37,31,.22); backdrop-filter:blur(18px); }
      .sl-b7-presence-head { display:grid; grid-template-columns:42px minmax(0,1fr) auto; align-items:center; gap:9px; }
      .sl-b7-presence-icon { width:42px; height:42px; border-radius:15px; display:grid; place-items:center; background:linear-gradient(145deg,#7b1326,#a62c43); color:white; font-size:21px; box-shadow:0 8px 22px rgba(123,19,38,.25); }
      .sl-b7-presence-head strong { display:block; color:#5f1423; font:800 14px Georgia,serif; }
      .sl-b7-presence-head small { display:block; margin-top:2px; color:#79676b; font-size:9.5px; line-height:1.35; }
      .sl-b7-presence-points { min-width:54px; text-align:center; padding:7px 8px; border-radius:14px; background:#fff4da; color:#70510c; font-size:10px; font-weight:800; }
      .sl-b7-presence-points b { display:block; font-size:16px; line-height:1; }
      .sl-b7-week { display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin-top:11px; }
      .sl-b7-day { min-width:0; padding:6px 2px; border-radius:12px; text-align:center; border:1px solid rgba(123,19,38,.09); background:rgba(255,255,255,.72); color:#88777a; font-size:8px; font-weight:800; }
      .sl-b7-day span { display:grid; place-items:center; width:22px; height:22px; margin:0 auto 3px; border-radius:999px; background:#eee5e5; color:#765e63; font-size:9px; }
      .sl-b7-day.done { color:#6d1728; background:#fff8ee; border-color:rgba(123,19,38,.20); }
      .sl-b7-day.done span { background:#7b1326; color:white; box-shadow:0 4px 12px rgba(123,19,38,.22); }
      .sl-b7-day.today { outline:2px solid rgba(197,151,45,.34); outline-offset:1px; }
      .sl-b7-presence-foot { margin-top:9px; display:flex; justify-content:space-between; gap:8px; color:#7b696d; font-size:9px; }
      .sl-b7-presence-foot strong { color:#631526; }
      .sl-b7-title-chip { display:inline-flex; align-items:center; gap:5px; margin-top:7px; padding:5px 9px; border-radius:999px; background:linear-gradient(120deg,#fff1bd,#f6cf62,#fff5cc); color:#64480b; border:1px solid rgba(175,126,20,.30); font-size:9px; font-weight:900; box-shadow:0 5px 15px rgba(159,113,20,.13); }
      .mobile-app-bottom-nav { position:relative !important; isolation:isolate; }
      .mobile-app-bottom-nav > a { position:relative; z-index:2; }
      .mobile-app-bottom-nav a > span { transition:transform 420ms var(--sl-b7-soft),filter 360ms ease,box-shadow 420ms ease !important; }
      .mobile-app-bottom-nav a[aria-current="page"] > span { transform:translateY(-2px) scale(1.035) !important; box-shadow:0 7px 18px rgba(123,19,38,.16) !important; }
      .sl-b7-nav-pill { position:absolute; z-index:1; pointer-events:none; border-radius:18px; background:linear-gradient(145deg,rgba(123,19,38,.11),rgba(197,151,45,.10)); border:1px solid rgba(123,19,38,.09); box-shadow:0 5px 16px rgba(83,42,39,.08); transition:left 430ms var(--sl-b7-soft),width 430ms var(--sl-b7-soft),top 430ms var(--sl-b7-soft),height 430ms var(--sl-b7-soft),opacity 220ms ease; }
      .sl-b7-podium { background-size:220% 220% !important; animation:slB7RankGlow 5.2s ease-in-out infinite !important; transition:transform 420ms var(--sl-b7-soft),box-shadow 520ms ease,border-color 520ms ease !important; }
      .sl-b7-podium[data-sl-rank="1"] { background-image:linear-gradient(135deg,rgba(255,250,228,.98),rgba(244,207,97,.23),rgba(255,255,255,.98)) !important; border-color:rgba(197,151,45,.72) !important; box-shadow:0 18px 42px rgba(178,129,24,.20),0 0 0 1px rgba(255,221,125,.28) !important; }
      .sl-b7-podium[data-sl-rank="2"] { background-image:linear-gradient(135deg,rgba(255,255,255,.98),rgba(188,198,207,.24),rgba(247,250,252,.98)) !important; border-color:rgba(144,157,168,.68) !important; box-shadow:0 13px 34px rgba(110,127,140,.16) !important; }
      .sl-b7-podium[data-sl-rank="3"] { background-image:linear-gradient(135deg,rgba(255,250,246,.98),rgba(205,129,84,.22),rgba(255,255,255,.98)) !important; border-color:rgba(180,104,63,.66) !important; box-shadow:0 13px 34px rgba(158,89,51,.15) !important; }
      @keyframes slB7RankGlow { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
      .sl-b7-trophy { width:76px; height:76px; flex:0 0 76px; position:relative; perspective:700px; filter:drop-shadow(0 13px 15px rgba(86,56,9,.28)); }
      .sl-b7-trophy::before { content:""; position:absolute; inset:9px; border-radius:50%; background:radial-gradient(circle,rgba(255,221,116,.38),transparent 68%); filter:blur(6px); animation:slB7TrophyAura 3.6s ease-in-out infinite; }
      .sl-b7-trophy svg { position:relative; width:100%; height:100%; overflow:visible; animation:slB7TrophyFloat 4.4s ease-in-out infinite; transform-style:preserve-3d; }
      .sl-b7-trophy::after { content:""; position:absolute; inset:10px 14px; border-radius:16px; background:linear-gradient(112deg,transparent 22%,rgba(255,255,255,.78) 46%,transparent 63%); transform:translateX(-145%) skewX(-10deg); animation:slB7TrophyShine 3.8s ease-in-out infinite; pointer-events:none; }
      @keyframes slB7TrophyFloat { 0%,100%{transform:perspective(620px) rotateY(-8deg) rotateX(2deg) translateY(0)} 50%{transform:perspective(620px) rotateY(9deg) rotateX(-2deg) translateY(-5px)} }
      @keyframes slB7TrophyAura { 0%,100%{opacity:.48;transform:scale(.92)} 50%{opacity:1;transform:scale(1.08)} }
      @keyframes slB7TrophyShine { 0%,55%{transform:translateX(-145%) skewX(-10deg);opacity:0} 68%{opacity:.9} 88%,100%{transform:translateX(150%) skewX(-10deg);opacity:0} }
      @media (prefers-reduced-motion:reduce) { .sl-b7-podium,.sl-b7-trophy svg,.sl-b7-trophy::before,.sl-b7-trophy::after { animation:none !important; } .mobile-app-bottom-nav a > span,.sl-b7-nav-pill { transition-duration:120ms !important; } }
    `;
    document.head.appendChild(style);
  }

  function animate(el, frames, options = {}) {
    if (!(el instanceof Element) || typeof el.animate !== "function") return null;
    try {
      const a = el.animate(frames, {
        duration: Number(options.duration || 360),
        easing: options.easing || "cubic-bezier(.20,.72,.20,1)",
        fill: options.fill || "both",
        delay: Number(options.delay || 0),
      });
      if (options.id) a.id = options.id;
      return a;
    } catch { return null; }
  }

  function isLoggedArea() {
    const t = text(document.body);
    return location.pathname.startsWith("/area-restrita") || /Meu Perfil|Painel do Moderador|Jornada Litúrgica|Escala do Dia/.test(t);
  }

  function removeOldPresence() {
    document.querySelectorAll("#sl-daily-presence").forEach((el) => el.remove());
  }

  function renderPresenceBanner() {
    if (!isLoggedArea()) return;
    removeOldPresence();
    const today = todayCuiaba();
    if (sessionStorage.getItem(BANNER_SESSION_KEY) === today || document.querySelector(".sl-b7-presence-banner")) return;
    const result = registerToday();
    const state = result.state;
    const info = weekInfo(today);
    const banner = document.createElement("section");
    banner.className = "sl-b7-presence-banner";
    banner.setAttribute("role","status");
    const days = WEEK_DAYS.map((label,i) => {
      const n = i + 1;
      const done = state.days.includes(n);
      const cls = `sl-b7-day${done ? " done" : ""}${n === info.day ? " today" : ""}`;
      return `<div class="${cls}"><span>${done ? "✓" : n}</span>${label}</div>`;
    }).join("");
    const unlocked = state.titles.includes(TITLE);
    banner.innerHTML = `
      <div class="sl-b7-presence-head">
        <div class="sl-b7-presence-icon">✦</div>
        <div><strong>Presença da semana</strong><small>${result.added ? `Você entrou hoje e ganhou +${DAILY_POINTS} pontos.` : "Sua presença de hoje já está contabilizada."}</small></div>
        <div class="sl-b7-presence-points"><b>${state.points}</b>/ 14 pts</div>
      </div>
      <div class="sl-b7-week">${days}</div>
      <div class="sl-b7-presence-foot"><span>Dia ${info.day} de 7 · segunda a domingo</span><strong>${state.days.length}/7 dias</strong></div>
      ${unlocked ? `<div class="sl-b7-title-chip">✦ ${TITLE}</div>` : ""}
    `;
    document.body.appendChild(banner);
    sessionStorage.setItem(BANNER_SESSION_KEY, today);
    animate(banner, [
      { opacity:0, transform:"translate(-50%,-18px) scale(.96)" },
      { opacity:1, transform:"translate(-50%,3px) scale(1.008)", offset:.7 },
      { opacity:1, transform:"translate(-50%,0) scale(1)" }
    ], { duration:520, id:"sl-b7-presence-in" });
    setTimeout(() => {
      const a = animate(banner, [
        { opacity:1, transform:"translate(-50%,0) scale(1)" },
        { opacity:0, transform:"translate(-50%,-10px) scale(.985)" }
      ], { duration:340, id:"sl-b7-presence-out" });
      if (a) a.finished.finally(() => banner.remove()); else banner.remove();
    }, result.completed ? 9000 : 6500);
  }

  function decorateProfileTitle() {
    const state = readPresence();
    if (!state.titles.includes(TITLE)) return;
    const t = text(document.body);
    if (!/Meu Perfil|Perfil do membro|Perfil/.test(t)) return;
    if (document.querySelector(".sl-b7-profile-title")) return;
    const heading = [...document.querySelectorAll("main h1,main h2,main h3")].find((el) => /Perfil|Meu Perfil/.test(text(el)));
    const host = heading?.parentElement || document.querySelector("main");
    if (!host) return;
    const chip = document.createElement("div");
    chip.className = "sl-b7-title-chip sl-b7-profile-title";
    chip.textContent = `✦ ${TITLE}`;
    chip.title = "Título de constância: completou uma semana entrando no aplicativo todos os dias.";
    host.appendChild(chip);
  }

  function replaceJoiasWithJogos() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.parentElement || node.parentElement.closest("script,style")) return;
      if (/\bJ[oó]ias\b/i.test(node.nodeValue || "")) node.nodeValue = String(node.nodeValue).replace(/\bJ[oó]ias\b/gi,"Jogos");
    });
  }

  function ensureShield() {
    let shield = document.querySelector(".sl-b7-route-shield");
    if (!shield) {
      shield = document.createElement("div");
      shield.className = "sl-b7-route-shield";
      document.body.appendChild(shield);
    }
    return shield;
  }

  function showShield() {
    const shield = ensureShield();
    if (shieldTimer) clearTimeout(shieldTimer);
    shield.getAnimations?.().forEach((a) => a.cancel());
    animate(shield, [{opacity:0},{opacity:.72}], { duration:150, id:"sl-b7-shield-in" });
    shieldTimer = setTimeout(() => hideShield(), 900);
  }

  function hideShield() {
    const shield = document.querySelector(".sl-b7-route-shield");
    if (!shield) return;
    if (shieldTimer) clearTimeout(shieldTimer);
    shield.getAnimations?.().forEach((a) => a.cancel());
    const a = animate(shield, [{opacity:.72},{opacity:0}], { duration:300, id:"sl-b7-shield-out" });
    if (a) a.finished.finally(() => { if (shield.isConnected) shield.style.opacity = "0"; });
  }

  function animateRoute(force = false) {
    const route = `${location.pathname}${location.search}${location.hash}`;
    if (!force && route === lastRoute) return;
    lastRoute = route;
    const main = document.querySelector("main");
    if (main) {
      main.getAnimations?.().filter((a) => a.id === "sl-page-enter" || a.id === "sl-b7-route-enter").forEach((a) => a.cancel());
      animate(main, [
        { opacity:.32, transform:"translate3d(0,6px,0) scale(.998)", filter:"brightness(.985)" },
        { opacity:1, transform:"translate3d(0,0,0) scale(1)", filter:"brightness(1)" }
      ], { duration:430, easing:"cubic-bezier(.16,.84,.24,1)", id:"sl-b7-route-enter" });
    }
    setTimeout(hideShield, 45);
  }

  function bindSmoothNavigation() {
    if (document.documentElement.dataset.slB7Nav === PATCH) return;
    document.documentElement.dataset.slB7Nav = PATCH;
    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const a = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!a) return;
      const raw = a.getAttribute("href") || "";
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
      let dest;
      try { dest = new URL(raw, location.href); } catch { return; }
      if (dest.origin !== location.origin || dest.href === location.href) return;
      showShield();
    }, true);
  }

  function updateBottomNav() {
    const nav = document.querySelector(".mobile-app-bottom-nav");
    if (!(nav instanceof HTMLElement)) return;
    const active = nav.querySelector('a[aria-current="page"]');
    if (!(active instanceof HTMLElement)) return;
    let pill = nav.querySelector(".sl-b7-nav-pill");
    if (!(pill instanceof HTMLElement)) {
      pill = document.createElement("div");
      pill.className = "sl-b7-nav-pill";
      nav.prepend(pill);
    }
    const nr = nav.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const left = Math.max(0, ar.left - nr.left + 3);
    const top = Math.max(0, ar.top - nr.top + 3);
    const width = Math.max(30, ar.width - 6);
    const height = Math.max(30, ar.height - 6);
    pill.style.left = `${left}px`;
    pill.style.top = `${top}px`;
    pill.style.width = `${width}px`;
    pill.style.height = `${height}px`;
    pill.style.opacity = "1";
    active.querySelector("span")?.getAnimations?.().filter((a) => a.id === "sl-bottom-active").forEach((a) => a.cancel());
  }

  function findPodium() {
    const title = [...document.querySelectorAll("main h1,main h2,main h3")].find((el) => text(el) === "Pódio da equipe");
    const section = title?.closest("section");
    if (!section) return null;
    const grid = [...section.querySelectorAll("div")].find((el) => {
      const children = [...el.children];
      return children.length >= 3 && children.slice(0,3).every((c) => /\b[123]º\b/.test(text(c)));
    });
    return grid ? { title, section, grid } : null;
  }

  function enhanceRanking() {
    const podium = findPodium();
    if (!podium) return;
    const cards = [...podium.grid.children].filter((el) => /\b[123]º\b/.test(text(el))).slice(0,3);
    cards.forEach((card) => {
      const m = text(card).match(/\b([123])º\b/);
      if (!m) return;
      card.classList.add("sl-b7-podium");
      card.dataset.slRank = m[1];
    });

    const host = podium.title.parentElement;
    if (!host) return;
    host.querySelectorAll(".sl-trophy-3d,.sl-b7-trophy").forEach((el) => el.remove());
    const trophy = document.createElement("div");
    trophy.className = "sl-b7-trophy";
    trophy.setAttribute("aria-label","Troféu 3D do ranking");
    trophy.innerHTML = `
      <svg viewBox="0 0 92 92" aria-hidden="true">
        <defs>
          <linearGradient id="b7Cup" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff6bd"/><stop offset=".18" stop-color="#f7d76e"/>
            <stop offset=".43" stop-color="#aa7110"/><stop offset=".64" stop-color="#f3ca4f"/>
            <stop offset=".82" stop-color="#8a5609"/><stop offset="1" stop-color="#ffe78d"/>
          </linearGradient>
          <linearGradient id="b7Stem" x1="0" y1="0" x2="0" y2="1">
            <stop stop-color="#e8bd42"/><stop offset=".55" stop-color="#8a560b"/><stop offset="1" stop-color="#4d2d05"/>
          </linearGradient>
          <radialGradient id="b7Medal"><stop offset="0" stop-color="#fff7c8"/><stop offset=".55" stop-color="#f1c958"/><stop offset="1" stop-color="#99630b"/></radialGradient>
          <filter id="b7Shadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#6d4308" flood-opacity=".34"/></filter>
        </defs>
        <g filter="url(#b7Shadow)">
          <path d="M24 13h44v10c0 18-8 31-18 36v10h9v7H33v-7h9V59C32 54 24 41 24 23z" fill="url(#b7Cup)"/>
          <path d="M24 20H11v8c0 13 8 22 20 23" fill="none" stroke="#c68d21" stroke-width="7" stroke-linecap="round"/>
          <path d="M68 20h13v8c0 13-8 22-20 23" fill="none" stroke="#c68d21" stroke-width="7" stroke-linecap="round"/>
          <path d="M36 18h20c-1 14-5 25-10 30-6-5-9-16-10-30z" fill="#fff8ca" opacity=".25"/>
          <circle cx="46" cy="35" r="10" fill="url(#b7Medal)" stroke="#fff0a3" stroke-width="1.4"/>
          <path d="M46 27.4l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#fff7c4"/>
          <path d="M42 58h8v12h-8z" fill="url(#b7Stem)"/>
          <rect x="29" y="75" width="34" height="8" rx="4" fill="url(#b7Stem)"/>
          <rect x="24" y="82" width="44" height="6" rx="3" fill="#4f2f08"/>
        </g>
      </svg>`;
    host.appendChild(trophy);
  }

  function applyAll(force = false) {
    ensureStyles();
    removeOldPresence();
    replaceJoiasWithJogos();
    animateRoute(force);
    updateBottomNav();
    enhanceRanking();
    decorateProfileTitle();
    renderPresenceBanner();
  }

  function schedule(force = false) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyAll(force);
    });
  }

  function start() {
    ensureStyles();
    bindSmoothNavigation();
    applyAll(true);
    setTimeout(() => applyAll(false), 350);
    setTimeout(() => applyAll(false), 1100);
    observer = new MutationObserver(() => schedule(false));
    observer.observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:["class","aria-current","data-state"] });
    setInterval(() => {
      const route = `${location.pathname}${location.search}${location.hash}`;
      if (route !== lastRoute) schedule(true);
      updateBottomNav();
    }, 300);
    window.addEventListener("resize", () => updateBottomNav());
  }

  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
