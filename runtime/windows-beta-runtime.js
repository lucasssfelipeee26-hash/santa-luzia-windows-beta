"use strict";

(() => {
  const revision = "7";
  if (document.documentElement.dataset.windowsBetaRuntime === revision) return;
  document.documentElement.dataset.windowsBetaRuntime = revision;

  const style = document.createElement("style");
  style.id = "sl-windows-runtime-r2";
  style.textContent = `
    .sl-b7-trophy, .sl-trophy-3d, .sl-r3-card-trophy { display:none !important; }
    .sl-r6-podium-header > svg, .sl-r6-podium-header > .sl-b7-trophy, .sl-r6-podium-header [data-lucide="trophy"] { display:none !important; }
    .sl-b7-route-shield { display:none !important; }
    .sl-runtime-route-cover { position:fixed; inset:0; z-index:244; pointer-events:none; background:#fffaf0; opacity:0; }
    .sl-r4-presence-locked { margin-top:16px; display:flex; align-items:center; gap:12px; border:1px solid #e2c86f; border-radius:18px; background:linear-gradient(145deg,#fffaf0,#fff3cf); padding:12px 14px; color:#6f541a; font-size:14px; line-height:1.45; box-shadow:0 8px 22px rgba(125,91,21,.08); }
    .sl-r6-clock { position:relative; width:42px; height:42px; flex:0 0 42px; border:3px solid #8f1934; border-radius:50%; background:radial-gradient(circle at 50% 50%,#fff 0 55%,#fff6dc 56% 100%); box-shadow:inset 0 0 0 2px rgba(212,175,55,.34),0 5px 12px rgba(92,45,25,.15); }
    .sl-r6-clock::before { content:""; position:absolute; inset:3px; border-radius:50%; background:repeating-conic-gradient(from -1deg,#8f1934 0 2deg,transparent 2deg 30deg); mask:radial-gradient(circle,transparent 0 72%,#000 73%); opacity:.62; }
    .sl-r6-clock-hand { position:absolute; left:50%; bottom:50%; width:2px; border-radius:999px; background:#6f1d30; transform-origin:50% 100%; will-change:transform; }
    .sl-r6-clock-hour { height:10px; width:3px; }
    .sl-r6-clock-minute { height:14px; }
    .sl-r6-clock-second { height:15px; width:1px; background:#d49b20; transition:transform 160ms cubic-bezier(.2,.8,.2,1); }
    .sl-r6-clock-center { position:absolute; left:50%; top:50%; width:6px; height:6px; border-radius:50%; background:#8f1934; transform:translate(-50%,-50%); box-shadow:0 0 0 2px #fff3c4; }
    .sl-r6-lock-copy strong { display:block; color:#6f1d30; font-size:13px; }
    .sl-r6-lock-copy span { display:block; margin-top:2px; font-size:12px; }
    .sl-b9-private-presence { animation:slR6DailyLoginEnter 440ms cubic-bezier(.2,.78,.2,1) both !important; }
    @keyframes slR6DailyLoginEnter { 0%{opacity:0;transform:translate3d(0,8px,0) scale(.985)} 72%{opacity:1;transform:translate3d(0,-1px,0) scale(1.002)} 100%{opacity:1;transform:none} }
    .sl-r7-presence-tools { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:8px; margin:0 0 12px; padding:10px; border:1px solid #e1d7d1; border-radius:16px; background:#fffaf7; }
    .sl-r7-presence-tools input,.sl-r7-presence-tools select { min-height:40px; min-width:0; border:1px solid #ded5d0; border-radius:12px; background:#fff; padding:8px 11px; color:#3f3537; font-size:12px; outline:none; }
    .sl-r7-presence-tools input:focus,.sl-r7-presence-tools select:focus { border-color:#8f1934; box-shadow:0 0 0 3px rgba(143,25,52,.10); }
    .sl-r7-team-hint { grid-column:1/-1; margin:0; color:#756d6f; font-size:11px; }
    .sl-r7-admin-record { border-left:4px solid #8f1934 !important; }
    .sl-r7-admin-record[data-kind="advertencia"] { background:linear-gradient(145deg,#fff,#fff1f1) !important; }
    .sl-r7-admin-record[data-kind="falta"] { background:linear-gradient(145deg,#fff,#fff6f2) !important; }
    .sl-r7-admin-record[data-kind="justificada"] { background:linear-gradient(145deg,#fff,#fff9e9) !important; border-left-color:#b4871e !important; }
    .sl-r7-record-chip { display:inline-flex; margin-top:8px; border-radius:999px; padding:4px 9px; background:#f3e7e9; color:#7b1326; font-size:10px; font-weight:800; }
    .sl-r7-early-justification { margin-top:14px; border:1px solid #ead18a; border-radius:16px; background:#fff9e9; padding:13px; }
    .sl-r7-early-justification strong { display:block; color:#755611; font-size:13px; }
    .sl-r7-early-justification textarea { width:100%; min-height:76px; margin-top:9px; resize:vertical; border:1px solid #dec98d; border-radius:12px; background:#fff; padding:10px; font:12px/1.45 inherit; }
    .sl-r7-early-justification button { width:100%; min-height:42px; margin-top:8px; border:0; border-radius:12px; background:#8f1934; color:#fff; font-size:12px; font-weight:800; }
    .sl-r7-early-justification p { margin:7px 0 0; font-size:11px; color:#755611; }
    .sl-r7-scale-list { display:grid !important; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:9px !important; }
    .sl-r7-scale-person { display:flex; min-width:0; align-items:center; justify-content:space-between; gap:10px; border-radius:14px !important; border-color:#e1d7d1 !important; background:linear-gradient(145deg,#fff,#fffaf4); padding:11px 13px !important; box-shadow:0 5px 14px rgba(70,37,31,.05); }
    .sl-r7-scale-person strong { min-width:0; color:#2b2224; font-size:13px; }
    .sl-r7-scale-person span { flex:0 0 auto; color:#756d6f; font-size:10px; text-align:right; }
    .sl-r7-my-records { margin:0 0 16px; border:1px solid #e1d7d1; border-radius:20px; background:linear-gradient(145deg,#fff,#fff8ef); padding:14px; box-shadow:0 8px 24px rgba(70,37,31,.07); }
    .sl-r7-my-records h2 { margin:0; color:#6f1d30; font:700 18px Georgia,serif; }
    .sl-r7-my-records-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-top:11px; }
    .sl-r7-my-records-summary span { border-radius:12px; background:#fff; padding:9px 4px; text-align:center; color:#756d6f; font-size:9px; }
    .sl-r7-my-records-summary b { display:block; color:#7b1326; font-size:20px; }
    .sl-r7-my-records details { margin-top:10px; border-top:1px solid #eadfd9; padding-top:10px; }
    .sl-r7-my-records summary { cursor:pointer; color:#5f1423; font-size:12px; font-weight:800; }
    .sl-r7-my-records li { margin-top:7px; color:#655d5f; font-size:11px; line-height:1.45; }
    .sl-r7-liturgy-meta { margin:-2px 0 14px; border:1px solid color-mix(in srgb,var(--sl-liturgical-color,#9a731d) 36%,#e8ded6); border-radius:15px; background:#fffaf2; padding:11px 13px; }
    .sl-r7-liturgy-meta strong { display:block; color:#5f1423; font:700 14px Georgia,serif; }
    .sl-r7-liturgy-meta span { display:block; margin-top:3px; color:#756d6f; font-size:10px; }
    .sl-r7-formation-archive-tools { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; margin-bottom:12px; padding:10px; border:1px solid #e1d7d1; border-radius:15px; background:#fffaf7; }
    .sl-r7-formation-archive-tools input,.sl-r7-formation-archive-tools button { min-height:40px; border:1px solid #ded5d0; border-radius:11px; background:#fff; padding:8px 11px; font-size:12px; }
    .sl-r7-formation-archive-tools button { background:#7b1326; color:#fff; font-weight:800; }
    .sl-r7-delay-clock { width:34px; height:34px; flex-basis:34px; border-width:2px; background:#fffdf7; }
    .sl-r7-delay-clock em { position:absolute; color:#7b1326; font:700 5px/1 Arial,sans-serif; font-style:normal; }
    .sl-r7-delay-clock .n12{left:50%;top:2px;transform:translateX(-50%)}.sl-r7-delay-clock .n3{right:2px;top:50%;transform:translateY(-50%)}.sl-r7-delay-clock .n6{left:50%;bottom:2px;transform:translateX(-50%)}.sl-r7-delay-clock .n9{left:2px;top:50%;transform:translateY(-50%)}
    .sl-r7-delay-source { display:none !important; }
    .sl-r7-compact-sounds { margin-top:8px !important; padding:9px !important; border-radius:15px !important; }
    .sl-r7-compact-sounds h3 { font-size:13px !important; }
    .sl-r7-compact-sounds p { font-size:9px !important; line-height:1.25 !important; }
    .sl-r7-compact-sounds > div:nth-of-type(2) { margin-top:6px !important; gap:4px !important; }
    .sl-r7-compact-sounds button { min-height:28px !important; padding-top:3px !important; padding-bottom:3px !important; font-size:9px !important; }
    .sl-r7-animated-nav-source { transform-box:fill-box; transform-origin:center; will-change:transform; }
    .sl-r7-animate-books { animation:slR7OriginalBookMotion 2.8s ease-in-out infinite; }
    .sl-r7-animate-liturgy { animation:slR7OriginalPageMotion 3.2s ease-in-out infinite; }
    .sl-r7-animate-panel { animation:slR7OriginalPanelMotion 2.6s ease-in-out infinite; }
    @keyframes slR7OriginalBookMotion{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-1px) rotate(-2deg)}}
    @keyframes slR7OriginalPageMotion{0%,100%{transform:perspective(60px) rotateY(0)}50%{transform:perspective(60px) rotateY(-10deg)}}
    @keyframes slR7OriginalPanelMotion{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.03)}}
    .sl-r7-books-icon,.sl-r7-liturgy-icon,.sl-r7-panel-icon { position:relative; display:inline-block; width:28px; height:28px; flex:0 0 28px; }
    .sl-r7-books-icon i { position:absolute; left:3px; width:22px; height:6px; border-radius:2px; box-shadow:0 2px 3px rgba(65,32,29,.14); transform-origin:50% 50%; animation:slR7BookShift 3s ease-in-out infinite; }
    .sl-r7-books-icon i:nth-child(1){bottom:3px;background:#7b1326}.sl-r7-books-icon i:nth-child(2){bottom:10px;background:#d4af37;animation-delay:-1s}.sl-r7-books-icon i:nth-child(3){bottom:17px;background:#315e4d;animation-delay:-2s}
    @keyframes slR7BookShift{0%,100%{transform:translateX(0) rotate(0)}50%{transform:translateX(2px) rotate(-2deg)}}
    .sl-r7-liturgy-icon { border:2px solid #7b1326; border-radius:4px 4px 8px 8px; background:linear-gradient(90deg,#fff8e7 0 48%,#d4af37 49% 51%,#fff8e7 52%); transform:perspective(80px) rotateX(8deg); }
    .sl-r7-liturgy-icon::after { content:""; position:absolute; inset:3px 3px 3px 50%; border-radius:2px 5px 5px 2px; background:#fffdf7; border-left:1px solid #d4af37; transform-origin:left center; animation:slR7PageFlip 3.2s ease-in-out infinite; }
    @keyframes slR7PageFlip{0%,30%,100%{transform:rotateY(0)}55%,72%{transform:rotateY(-155deg)}}
    .sl-r7-panel-icon::before { content:""; position:absolute; left:9px; top:2px; width:10px; height:10px; border-radius:50%; background:#d9a17c; box-shadow:inset -2px -1px 0 rgba(103,47,35,.15); }
    .sl-r7-panel-icon::after { content:""; position:absolute; left:8px; top:12px; width:12px; height:13px; border-radius:7px 7px 5px 5px; background:#7b1326; }
    .sl-r7-panel-icon i { position:absolute; top:12px; width:3px; height:13px; border-radius:3px; background:#d9a17c; transform-origin:50% 90%; animation:slR7PrayArms 2.4s ease-in-out infinite; z-index:2; }
    .sl-r7-panel-icon i:first-child{left:7px;transform:rotate(40deg)}.sl-r7-panel-icon i:last-child{right:7px;transform:rotate(-40deg);animation-delay:-1.2s}
    @keyframes slR7PrayArms{0%,100%{translate:0 0}50%{translate:0 -3px}}
    @media(prefers-reduced-motion:reduce){.sl-r7-books-icon i,.sl-r7-liturgy-icon::after,.sl-r7-panel-icon i,.sl-r7-animated-nav-source{animation:none!important}}
    .sl-r7-copy-removed { display:none !important; }
    .sl-b9-private-presence-head small { display:none !important; }
    .sl-r7-theme-picker { display:flex; align-items:center; gap:10px; margin:0 0 14px; border:1px solid #e1d7d1; border-radius:16px; background:#fff; padding:10px 12px; box-shadow:0 6px 18px rgba(61,32,28,.06); }
    .sl-r7-theme-picker b { color:#5f1423; font-size:12px; }
    .sl-r7-theme-picker select { min-height:38px; min-width:0; flex:1; border:1px solid #ded5d0; border-radius:11px; background:#fff; padding:7px 9px; font-size:11px; }
    .sl-r7-notification-expiring { transition:opacity 220ms ease,transform 220ms ease,max-height 260ms ease,margin 260ms ease,padding 260ms ease; }
    .sl-r7-notification-expired { opacity:0 !important; transform:translateY(-4px); max-height:0 !important; margin-top:0 !important; margin-bottom:0 !important; padding-top:0 !important; padding-bottom:0 !important; overflow:hidden !important; pointer-events:none !important; }
    html[data-sl-personal-theme="azul"]{--primary:#175c9c;--sidebar-primary:#175c9c}html[data-sl-personal-theme="amarelo"]{--primary:#9a731d;--sidebar-primary:#9a731d}html[data-sl-personal-theme="verde"]{--primary:#176b4b;--sidebar-primary:#176b4b}html[data-sl-personal-theme="rosa"]{--primary:#a83d70;--sidebar-primary:#a83d70}html[data-sl-personal-theme="vermelho"]{--primary:#8f1934;--sidebar-primary:#8f1934}html[data-sl-personal-theme="roxo"]{--primary:#69419b;--sidebar-primary:#69419b}html[data-sl-personal-theme="cinza"]{--primary:#55616c;--sidebar-primary:#55616c}
    html[data-sl-personal-theme^="gradiente-"] body{background-attachment:fixed!important;background-size:cover!important}html[data-sl-personal-theme="gradiente-azul"] body{background-image:linear-gradient(145deg,#eef7ff,#dbeaff)!important}html[data-sl-personal-theme="gradiente-amarelo"] body{background-image:linear-gradient(145deg,#fffdf2,#fff0b8)!important}html[data-sl-personal-theme="gradiente-verde"] body{background-image:linear-gradient(145deg,#f1fff8,#d8f2e4)!important}
    @media(max-width:520px){.sl-r7-presence-tools{grid-template-columns:1fr 1fr}.sl-r7-presence-tools input{grid-column:1/-1}}
    [data-sl-r4-presence-locked="true"] { opacity:.58; pointer-events:none !important; user-select:none; }
    .sl-r5-card-trophy { --sl-cup-light:#fff0a4; --sl-cup-main:#d4a526; --sl-cup-dark:#76500b; position:absolute; top:8px; right:8px; z-index:18; width:43px; height:43px; pointer-events:none; filter:drop-shadow(0 8px 8px color-mix(in srgb,var(--sl-cup-dark) 42%,transparent)); animation:slR5CupFloat 3.2s ease-in-out infinite; transform-style:preserve-3d; }
    .sl-r5-card-trophy svg { width:100%; height:100%; overflow:visible; }
    .sl-r5-card-trophy[data-rank="1"] { --sl-cup-light:#fff5b8; --sl-cup-main:#e4b936; --sl-cup-dark:#7b5107; width:50px; height:50px; top:6px; }
    .sl-r5-card-trophy[data-rank="2"] { --sl-cup-light:#ffffff; --sl-cup-main:#b9c2c9; --sl-cup-dark:#59656e; animation-delay:-1.05s; }
    .sl-r5-card-trophy[data-rank="3"] { --sl-cup-light:#ffd1aa; --sl-cup-main:#bd7547; --sl-cup-dark:#6f351d; animation-delay:-2.1s; }
    @keyframes slR5CupFloat { 0%,100%{transform:perspective(380px) translateY(0) rotateY(-9deg) rotateX(2deg)} 50%{transform:perspective(380px) translateY(-5px) rotateY(10deg) rotateX(-2deg)} }
    @media (prefers-reduced-motion:reduce) { .sl-r5-card-trophy { animation:none !important; } }
  `;
  document.head.appendChild(style);

  function text(element) {
    return String(element?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function trophyMarkup(rank) {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="slR3Cup${rank}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--sl-cup-light)"/><stop offset=".45" stop-color="var(--sl-cup-main)"/><stop offset="1" stop-color="var(--sl-cup-dark)"/></linearGradient></defs><g fill="url(#slR3Cup${rank})"><path d="M18 8h28v8c0 13-5 22-11 26v7h7v5H22v-5h7v-7c-6-4-11-13-11-26z"/><path d="M18 13H9v7c0 9 5 15 12 17v-6c-4-2-6-6-6-11v-1h3zm28 0h9v7c0 9-5 15-12 17v-6c4-2 6-6 6-11v-1h-3z"/><rect x="17" y="54" width="30" height="5" rx="2.5"/></g><path d="M25 13h14c-1 10-3 17-7 21-4-4-6-11-7-21z" fill="var(--sl-cup-light)" opacity=".25"/></svg>`;
  }

  function clockMarkup() {
    return '<em class="n12">12</em><em class="n3">3</em><em class="n6">6</em><em class="n9">9</em><i class="sl-r6-clock-hand sl-r6-clock-hour"></i><i class="sl-r6-clock-hand sl-r6-clock-minute"></i><i class="sl-r6-clock-hand sl-r6-clock-second"></i><i class="sl-r6-clock-center"></i>';
  }

  function fixPodiumTrophies() {
    const title = [...document.querySelectorAll("main h1,main h2,main h3")].find((element) => text(element) === "Pódio da equipe");
    const section = title?.closest("section");
    if (!section) return;
    let header = title.parentElement;
    while (header && header !== section && ![...header.children].some((child) => child.matches("svg,.sl-b7-trophy") || child.querySelector?.(':scope > [data-lucide="trophy"]'))) header = header.parentElement;
    header?.classList.add("sl-r6-podium-header");
    const rankOf = (card) => {
      const explicit = Number(card?.dataset?.slRank || card?.dataset?.rank || 0);
      if (explicit >= 1 && explicit <= 3) return explicit;
      for (const element of card?.querySelectorAll?.("span,b,strong,p") || []) {
        const match = text(element).match(/^([123])º$/);
        if (match) return Number(match[1]);
      }
      return 0;
    };
    const cards = [...section.querySelectorAll("article,li,section > div > div")].filter((card) => rankOf(card) > 0);
    for (const rank of [1,2,3]) {
      const card = section.querySelector(`.sl-podium-${rank},.sl-b7-podium[data-sl-rank="${rank}"]`) || cards.find((candidate) => rankOf(candidate) === rank);
      if (!card || card.querySelector(`.sl-r5-card-trophy[data-rank="${rank}"]`)) continue;
      if (getComputedStyle(card).position === "static") card.style.position = "relative";
      const trophy = document.createElement("span");
      trophy.className = "sl-r5-card-trophy";
      trophy.dataset.rank = String(rank);
      trophy.setAttribute("aria-label", `Troféu do ${rank}º lugar`);
      trophy.innerHTML = trophyMarkup(rank);
      card.appendChild(trophy);
    }
  }

  function nowForPresence() {
    return Date.now();
  }

  function updatePresenceClock(root = document) {
    const now = new Date(nowForPresence());
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    root.querySelectorAll(".sl-r6-clock").forEach((clock) => {
      const hour = clock.querySelector(".sl-r6-clock-hour");
      const minute = clock.querySelector(".sl-r6-clock-minute");
      const second = clock.querySelector(".sl-r6-clock-second");
      if (hour) hour.style.transform = `translateX(-50%) rotate(${hours * 30}deg)`;
      if (minute) minute.style.transform = `translateX(-50%) rotate(${minutes * 6}deg)`;
      if (second) second.style.transform = `translateX(-50%) rotate(${seconds * 6}deg)`;
      clock.setAttribute("aria-label", `Horário atual: ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`);
    });
  }

  function scheduledTimeFromArticle(article) {
    const heading = [...article.querySelectorAll("p")].find((element) => /\b\d{1,2}:\d{2}\b/.test(text(element)));
    const match = text(heading).match(/\b(\d{1,2}):(\d{2})\b/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    const now = new Date(nowForPresence());
    const scheduled = new Date(now);
    scheduled.setHours(hours, minutes, 0, 0);
    return { at:scheduled.getTime(), label:`${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}` };
  }

  function applyFormationPresenceLock() {
    const prompt = [...document.querySelectorAll("p")].find((element) => text(element) === "Como foi sua participação?");
    const control = prompt?.closest("[data-no-pull-refresh]");
    const article = control?.closest("article");
    document.querySelectorAll(".sl-r4-presence-locked").forEach((notice) => { if (notice.closest("article") !== article) notice.remove(); });
    if (!control || !article) { ensureEarlyJustification(); return; }
    const schedule = scheduledTimeFromArticle(article);
    const locked = Boolean(schedule && nowForPresence() < schedule.at);
    const optionButtons = [...control.querySelectorAll('button[role="radio"]')];
    const presentButton = optionButtons.find((button) => text(button) === "Presente");
    const absenceButton = optionButtons.find((button) => text(button) === "Falta");
    const justifiedButton = optionButtons.find((button) => text(button) === "Falta justificada");
    const alreadyJustified = justifiedButton?.getAttribute("aria-checked") === "true" && Boolean(control.querySelector("textarea")?.value?.trim());
    absenceButton?.setAttribute("hidden", "");
    if (absenceButton) absenceButton.style.display = "none";
    if (presentButton) presentButton.disabled = locked || alreadyJustified;
    if (justifiedButton) justifiedButton.disabled = alreadyJustified;
    if (alreadyJustified) control.querySelectorAll("button,textarea,input").forEach((element) => { element.disabled = true; });
    control.dataset.slR4PresenceLocked = "false";
    let notice = article.querySelector(".sl-r4-presence-locked");
    if (alreadyJustified) {
      if (!notice) { notice = document.createElement("div"); notice.className = "sl-r4-presence-locked"; control.before(notice); }
      notice.innerHTML = '<span class="sl-r6-lock-copy"><strong>Falta justificada registrada</strong><span>Este registro foi encerrado e não pode ser alterado para presença.</span></span>';
      return;
    }
    if (!locked) { notice?.remove(); return; }
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "sl-r4-presence-locked";
      notice.setAttribute("role", "status");
      notice.innerHTML = `<span class="sl-r6-clock sl-r7-delay-clock" role="img">${clockMarkup()}</span><span class="sl-r6-lock-copy"><strong>Presença bloqueada por enquanto</strong><span></span></span>`;
      control.before(notice);
    }
    const copy = notice.querySelector(".sl-r6-lock-copy span");
    if (copy) copy.textContent = `Será liberada às ${schedule.label}.`;
    updatePresenceClock(notice);
  }

  function ensureEarlyJustification() {
    const sections = [...document.querySelectorAll("main article")];
    for (const article of sections) {
      if (!/Presença bloqueada por enquanto/.test(text(article)) || article.querySelector(".sl-r7-early-justification")) continue;
      const download = article.querySelector('a[href*="/api/formacoes/"][href$="/download"]');
      const match = download?.getAttribute("href")?.match(/\/api\/formacoes\/([^/]+)\/download/);
      if (!match) continue;
      const box = document.createElement("div");
      box.className = "sl-r7-early-justification";
      box.innerHTML = '<strong>Não poderá participar?</strong><p>A falta justificada pode ser enviada desde a publicação da formação.</p><textarea maxlength="500" placeholder="Informe o motivo da ausência"></textarea><button type="button">Enviar falta justificada</button><p class="sl-r7-justification-message"></p>';
      const button = box.querySelector("button");
      button.addEventListener("click", async () => {
        const reason = box.querySelector("textarea").value.trim();
        const message = box.querySelector(".sl-r7-justification-message");
        if (reason.length < 3) { message.textContent = "Informe o motivo da falta justificada."; return; }
        button.disabled = true; button.textContent = "Enviando...";
        try {
          const response = await fetch(`/api/formacoes/${encodeURIComponent(match[1])}/minha-presenca`, { method:"PUT", credentials:"same-origin", headers:{"Content-Type":"application/json","X-Santa-Luzia-Windows-Beta":"1"}, body:JSON.stringify({situacao:"justificada",justificativa:reason}) });
          const data = await response.json().catch(() => null);
          if (!response.ok) throw new Error(data?.erro || "Não foi possível enviar a justificativa.");
          box.innerHTML = '<strong>Falta justificada registrada</strong><p>Este registro foi encerrado e não poderá ser alterado para presença.</p>';
        } catch (error) { message.textContent = error?.message || "Falha ao enviar."; button.disabled = false; button.textContent = "Enviar falta justificada"; }
      });
      const lock = [...article.querySelectorAll("div")].find((element) => /Presença bloqueada por enquanto/.test(text(element)));
      (lock || download)?.before(box);
    }
  }

  let adminRecordsPromise = null;
  function loadAdminRecords() {
    if (!adminRecordsPromise) adminRecordsPromise = fetch("/api/equipe", { cache:"no-store", credentials:"same-origin" })
      .then((response) => response.ok ? response.json() : null).then((data) => Array.isArray(data?.equipe) ? data.equipe : []).catch(() => []);
    return adminRecordsPromise;
  }

  function applyPresenceFilters(panel, kind) {
    const tools = panel.previousElementSibling?.classList?.contains("sl-r7-presence-tools") ? panel.previousElementSibling : null;
    if (!tools) return;
    const query = text(tools.querySelector("input")).toLocaleLowerCase("pt-BR");
    const status = tools.querySelector('[data-filter="status"]')?.value || "todos";
    const year = tools.querySelector('[data-filter="year"]')?.value || "todos";
    panel.querySelectorAll(":scope > article").forEach((card) => {
      const content = text(card).toLocaleLowerCase("pt-BR");
      const matchesQuery = !query || content.includes(query);
      const matchesStatus = status === "todos" || content.includes(status);
      const matchesYear = year === "todos" || content.includes(year);
      const waitForSearch = kind === "equipe" && !query;
      card.style.display = matchesQuery && matchesStatus && matchesYear && !waitForSearch ? "" : "none";
    });
  }

  function ensurePresenceTools(panel, kind) {
    let tools = panel.previousElementSibling?.classList?.contains("sl-r7-presence-tools") ? panel.previousElementSibling : null;
    if (tools?.dataset.kind !== kind) tools?.remove(), tools = null;
    if (!tools) {
      tools = document.createElement("div");
      tools.className = "sl-r7-presence-tools";
      tools.dataset.kind = kind;
      const years = [...new Set([...panel.querySelectorAll("article")].flatMap((card) => text(card).match(/\b20\d{2}\b/g) || []))].sort().reverse();
      tools.innerHTML = `<input type="search" aria-label="Pesquisar registros" placeholder="Pesquisar por nome, formação ou justificativa"><select data-filter="status" aria-label="Filtrar situação"><option value="todos">Todas as situações</option><option value="presente">Presentes</option><option value="falta">Faltas</option><option value="justificada">Justificadas</option><option value="advertência">Advertências</option></select><select data-filter="year" aria-label="Filtrar ano"><option value="todos">Todos os anos</option>${years.map((year) => `<option value="${year}">${year}</option>`).join("")}</select>${kind === "equipe" ? '<p class="sl-r7-team-hint">Digite o nome do acólito ou coroinha para consultar seus registros.</p>' : ""}`;
      panel.before(tools);
      tools.addEventListener("input", () => applyPresenceFilters(panel, kind));
      tools.addEventListener("change", () => applyPresenceFilters(panel, kind));
    }
    applyPresenceFilters(panel, kind);
  }

  async function addAdministrativeHistory(panel) {
    if (panel.dataset.slR7AdminLoaded === "true") return;
    panel.dataset.slR7AdminLoaded = "true";
    const team = await loadAdminRecords();
    if (!panel.isConnected) return;
    for (const member of team) {
      for (const [field, label, kind] of [["advertencias","Advertência","advertencia"],["faltas","Falta em missa/atividade","falta"],["justificativas","Justificativa","justificada"]]) {
        for (const record of Array.isArray(member[field]) ? member[field] : []) {
          if (panel.querySelector(`[data-record-id="${CSS.escape(String(record.id))}"]`)) continue;
          const article = document.createElement("article");
          article.className = "sl-r7-admin-record rounded-2xl border border-[#e1d7d1] bg-white p-4 shadow-sm";
          article.dataset.recordId = String(record.id);
          article.dataset.kind = kind;
          article.innerHTML = `<div><h2 class="font-semibold text-[#2b2224]"></h2><p class="text-xs text-[#756d6f]"></p><span class="sl-r7-record-chip"></span><p class="mt-3 text-sm text-[#4f4749]"></p></div>`;
          article.querySelector("h2").textContent = member.nome || "Membro";
          article.querySelector(".text-xs").textContent = `${member.funcao || "Membro"} · ${String(record.data || "").split("-").reverse().join("/")}`;
          article.querySelector(".sl-r7-record-chip").textContent = label;
          article.querySelector(".mt-3").textContent = record.descricao || "Sem descrição";
          panel.appendChild(article);
        }
      }
    }
    ensurePresenceTools(panel, "historico");
  }

  function enhancePresenceCenter() {
    if (!location.pathname.includes("/area-restrita/moderador/presencas")) return;
    [...document.querySelectorAll("h1,h2")].forEach((heading) => { if (text(heading) === "Controle de Presenças") heading.textContent = "Central de Presenças e Registros"; });
    const selected = [...document.querySelectorAll('[role="tab"][aria-selected="true"]')].find((tab) => /Equipe|Formações|Histórico/.test(text(tab)));
    const panel = document.querySelector('section[role="tabpanel"]');
    if (!selected || !panel) return;
    const label = text(selected);
    if (label.includes("Equipe")) ensurePresenceTools(panel, "equipe");
    if (label.includes("Histórico")) { ensurePresenceTools(panel, "historico"); void addAdministrativeHistory(panel); }
  }

  function organizePublishedScale() {
    document.querySelectorAll("main h3").forEach((heading) => {
      if (!/Acólitos|Coroinhas|Equipe|Escalados/i.test(text(heading))) return;
      const list = heading.parentElement?.querySelector(":scope > ul");
      if (!list) return;
      list.classList.add("sl-r7-scale-list");
      list.querySelectorAll(":scope > li").forEach((item) => {
        const name = item.querySelector("strong");
        if (!name) return;
        if (!name.dataset.slFullName) name.dataset.slFullName = text(name);
        const parts = name.dataset.slFullName.split(/\s+/).filter(Boolean);
        name.textContent = parts.length > 1 ? `${parts[0]} ${parts.at(-1)}` : parts[0] || "";
        item.classList.add("sl-r7-scale-person");
      });
    });
    void enrichPublishedScaleLiturgy();
  }

  let scaleLiturgyPromise = null;
  function enrichPublishedScaleLiturgy() {
    if (!location.pathname.toLowerCase().includes("escala")) return Promise.resolve();
    if (!scaleLiturgyPromise) scaleLiturgyPromise = fetch("/api/escalas", { cache:"no-store", credentials:"same-origin" }).then((response) => response.ok ? response.json() : null).then((data) => Array.isArray(data?.escalas) ? data.escalas : []).catch(() => []);
    return scaleLiturgyPromise.then(async (scales) => {
      for (const scale of scales) {
        if (document.querySelector(`[data-sl-liturgy-scale="${CSS.escape(String(scale.id))}"]`)) continue;
        const [year,month,day] = String(scale.data || "").split("-").map(Number);
        if (!year || !month || !day) continue;
        const formatted = new Intl.DateTimeFormat("pt-BR", { weekday:"long",day:"2-digit",month:"long",year:"numeric",timeZone:"UTC" }).format(new Date(Date.UTC(year,month-1,day)));
        const article = [...document.querySelectorAll("main article")].find((item) => text(item).toLocaleLowerCase("pt-BR").includes(formatted.toLocaleLowerCase("pt-BR")));
        if (!article) continue;
        const date = new Date(Date.UTC(year,month-1,day));
        if (date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate()+1);
        const liturgyDate = date.toISOString().slice(0,10);
        try {
          const response = await fetch(`/api/liturgia?data=${liturgyDate}`, { cache:"force-cache", headers:{"X-Santa-Luzia-Windows-Beta":"1"} });
          const liturgy = await response.json().catch(() => null);
          if (!response.ok || !liturgy) continue;
          const meta = document.createElement("div");
          meta.className = "sl-r7-liturgy-meta";
          meta.dataset.slLiturgyScale = String(scale.id);
          meta.style.setProperty("--sl-liturgical-color", String(liturgy.cor || "#9a731d"));
          meta.innerHTML = "<strong></strong><span></span>";
          meta.querySelector("strong").textContent = liturgy.liturgia || liturgy.tempoLiturgicoAtual || "Celebração litúrgica";
          meta.querySelector("span").textContent = `${liturgy.tempoLiturgicoAtual || "Tempo litúrgico"} · Ciclo ${liturgy.cicloDominical || "—"} · Cor ${liturgy.cor || "—"}${date.getUTCDay() === 0 && String(scale.data) !== liturgyDate ? " · Liturgia do domingo" : ""}`;
          const heading = article.querySelector(":scope > div");
          heading?.after(meta);
        } catch {}
      }
    });
  }

  let myRecordsPromise = null;
  function renderMyAdministrativeRecords() {
    if (!location.pathname.includes("/area-restrita/membro") || document.querySelector(".sl-r7-my-records")) return;
    if (!myRecordsPromise) myRecordsPromise = fetch("/api/auth/me", { cache:"no-store", credentials:"same-origin" }).then((response) => response.ok ? response.json() : null)
      .then(async (auth) => {
        const user = auth?.sessao?.usuario;
        if (!user?.id) return null;
        const response = await fetch(`/api/membros/${encodeURIComponent(user.id)}`, { cache:"no-store", credentials:"same-origin", headers:{"X-Santa-Luzia-Windows-Beta":"1"} });
        const data = await response.json().catch(() => null);
        return response.ok ? data?.membro : null;
      }).catch(() => null);
    void myRecordsPromise.then((member) => {
      if (!member || document.querySelector(".sl-r7-my-records")) return;
      const main = document.querySelector("main > div") || document.querySelector("main");
      if (!main) return;
      const warnings = Array.isArray(member.advertencias) ? member.advertencias : [];
      const absences = Array.isArray(member.faltas) ? member.faltas : [];
      const reasons = Array.isArray(member.justificativas) ? member.justificativas : [];
      const card = document.createElement("section");
      card.className = "sl-r7-my-records";
      const items = [...warnings.map((item) => ({...item,label:"Advertência"})),...absences.map((item) => ({...item,label:"Falta"})),...reasons.map((item) => ({...item,label:"Justificativa"}))].sort((a,b) => Number(b.criadoEm||0)-Number(a.criadoEm||0));
      card.innerHTML = `<h2>Meu acompanhamento</h2><p style="margin:3px 0 0;color:#756d6f;font-size:11px">Presenças, faltas justificadas e advertências visíveis somente para você.</p><div class="sl-r7-my-records-summary"><span><b>${warnings.length}</b>Advertências</span><span><b>${absences.length}</b>Faltas</span><span><b>${reasons.length}</b>Justificativas</span></div><details><summary>Ver histórico pessoal</summary><ul></ul></details>`;
      const list = card.querySelector("ul");
      for (const item of items) { const li=document.createElement("li"); li.textContent=`${item.label} · ${String(item.data||"").split("-").reverse().join("/")} — ${item.descricao||"Sem descrição"}`; list.appendChild(li); }
      if (!items.length) { const li=document.createElement("li"); li.textContent="Nenhum registro administrativo no momento."; list.appendChild(li); }
      main.prepend(card);
    });
  }

  function organizeFormationManagement() {
    const title = [...document.querySelectorAll("h3")].find((heading) => text(heading) === "Formações publicadas");
    const list = title?.parentElement?.querySelector(":scope > div.space-y-3");
    if (!title || !list) return;
    let tools = title.parentElement.querySelector(":scope > .sl-r7-formation-archive-tools");
    if (!tools) {
      tools = document.createElement("div");
      tools.className = "sl-r7-formation-archive-tools";
      tools.dataset.archive = "false";
      tools.innerHTML = '<input type="search" placeholder="Pesquisar formação por título, data ou ano" aria-label="Pesquisar formações"><button type="button">Consultar concluídas</button>';
      title.after(tools);
      tools.querySelector("button").addEventListener("click", () => { tools.dataset.archive = tools.dataset.archive === "true" ? "false" : "true"; tools.querySelector("button").textContent = tools.dataset.archive === "true" ? "Mostrar atuais" : "Consultar concluídas"; organizeFormationManagement(); });
      tools.querySelector("input").addEventListener("input", organizeFormationManagement);
    }
    const query = tools.querySelector("input").value.trim().toLocaleLowerCase("pt-BR");
    const archive = tools.dataset.archive === "true";
    const today = new Intl.DateTimeFormat("en-CA", { timeZone:"America/Cuiaba" }).format(new Date());
    list.querySelectorAll(":scope > article").forEach((card) => {
      const match = text(card).match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
      if (!match) return;
      const iso = `${match[3]}-${match[2]}-${match[1]}`;
      const past = iso < today;
      card.dataset.slFormationPast = String(past);
      const badge = [...card.querySelectorAll("span")].find((element) => /^(Agendada|Cancelada)$/.test(text(element)));
      if (past && badge && text(badge) !== "Cancelada") { badge.textContent = "Concluída"; badge.className = "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"; }
      if (past) [...card.querySelectorAll("button")].filter((button) => /Cancelar|Reativar/.test(text(button))).forEach((button) => { button.disabled = true; button.style.display = "none"; });
      const matches = !query || text(card).toLocaleLowerCase("pt-BR").includes(query);
      card.style.display = matches && (archive ? past : !past) ? "" : "none";
    });
  }

  function enhanceDelayClocks() {
    const targets = [...document.querySelectorAll('a[href*="/atrasos"],button,main h1,main h2,main h3,main div,main span')].filter((element) => {
      const content = text(element);
      return content.length < 100 && /Atrasos|Pontualidade/.test(content) && Boolean(element.querySelector(":scope > svg"));
    });
    for (const target of targets) {
      const host = target.matches("a") ? target : target.parentElement;
      if (!host || target.closest(".sl-r4-presence-locked") || host.closest("[data-sl-delay-clock-host='true']") || host.querySelector(":scope > .sl-r7-delay-clock")) continue;
      host.dataset.slDelayClockHost = "true";
      const source = host.querySelector(":scope > svg");
      source?.classList.add("sl-r7-delay-source");
      const clock = document.createElement("span");
      clock.className = "sl-r6-clock sl-r7-delay-clock";
      clock.setAttribute("role","img");
      clock.innerHTML = clockMarkup();
      source?.after(clock) || host.prepend(clock);
      updatePresenceClock(clock.parentElement || document);
    }
  }

  const catholicEmojis = ["✝️","⛪","🙏","🕊️","🕯️","📖","🌹","❤️‍🔥","👼","🛐"];
  function enhanceProfileAndSoundControls() {
    const bio = document.querySelector("#perfil-bio");
    if (bio) {
      const label = [...document.querySelectorAll("span")].find((element) => text(element) === "Emojis católicos");
      const buttons = [...(label?.parentElement?.querySelectorAll("button") || [])];
      buttons.slice(0,catholicEmojis.length).forEach((button,index) => {
        if (button.dataset.slCatholicEmoji === catholicEmojis[index]) return;
        button.dataset.slCatholicEmoji = catholicEmojis[index];
        button.textContent = catholicEmojis[index];
        button.title = `Adicionar ${catholicEmojis[index]}`;
        button.addEventListener("click", (event) => {
          event.preventDefault(); event.stopImmediatePropagation();
          const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value")?.set;
          const next = `${bio.value}${bio.value && !/\s$/.test(bio.value) ? " " : ""}${catholicEmojis[index]}`.slice(0,280);
          setter?.call(bio,next); bio.dispatchEvent(new Event("input",{bubbles:true}));
        }, true);
      });
    }
    const soundHeading = [...document.querySelectorAll("h3")].find((heading) => text(heading) === "Som das notificações");
    soundHeading?.closest(".rounded-2xl")?.classList.add("sl-r7-compact-sounds");

    const profilesTitle = [...document.querySelectorAll("h2")].find((heading) => text(heading) === "Perfis da equipe");
    const profileSection = profilesTitle?.closest("section");
    const search = profileSection?.querySelector('input[placeholder="Buscar"]');
    const grid = profileSection ? [...profileSection.querySelectorAll("div")].find((element) => element.querySelectorAll(":scope > button").length > 4) : null;
    if (search && grid) {
      const apply = () => { const active=Boolean(search.value.trim()); [...grid.querySelectorAll(":scope > button")].forEach((card,index) => { card.style.display = active || index < 4 ? "" : "none"; }); };
      if (search.dataset.slFourProfiles !== "true") { search.dataset.slFourProfiles="true"; search.addEventListener("input",() => setTimeout(apply,0)); }
      apply();
    }
  }

  function enhanceAnimatedNavigationIcons() {
    const definitions = [
      { pattern:/Biblioteca/i, className:"sl-r7-animate-books" },
      { pattern:/Liturgia/i, className:"sl-r7-animate-liturgy" },
      { pattern:/Painel/i, className:"sl-r7-animate-panel" },
    ];
    for (const element of document.querySelectorAll("a,button,h1,h2,h3")) {
      const content = text(element);
      if (content.length > 80) continue;
      const definition = definitions.find((item) => item.pattern.test(content));
      if (!definition) continue;
      const source = element.querySelector(":scope > svg");
      if (!source || source.classList.contains(definition.className)) continue;
      source.classList.add("sl-r7-animated-nav-source", definition.className);
    }
  }

  function removeRedundantCopy() {
    const patterns = [
      /aprenda, jogue e acompanhe sua evolução/i,
      /jogos da luz e classificação/i,
      /toque em qualquer membro para ver o recado/i,
      /escala atualizada e salva neste aparelho/i,
      /a versão simplificada foi removida/i,
      /whatajong completo, com sons, peças ilustradas/i,
      /o mesmo jogo apresentado como base/i,
    ];
    document.querySelectorAll("p,small,span,div").forEach((element) => {
      const content = text(element);
      if (!content || content.length > 360 || !patterns.some((pattern) => pattern.test(content))) return;
      if (/escala atualizada e salva/i.test(content)) element.closest(".flex.items-center")?.classList.add("sl-r7-copy-removed");
      else element.classList.add("sl-r7-copy-removed");
    });
  }

  function enhancePersonalThemePicker() {
    const key="santa-luzia:windows-beta:personal-theme:v1";
    const saved=localStorage.getItem(key)||"vermelho";
    document.documentElement.dataset.slPersonalTheme=saved;
    if (document.querySelector(".sl-r7-theme-picker")) return;
    const onMemberArea=location.pathname.includes("/area-restrita/membro");
    const onThemePage=location.pathname.includes("/moderador/tema");
    if (!onMemberArea && !onThemePage) return;
    const host=document.querySelector("main > div")||document.querySelector("main"); if(!host)return;
    const picker=document.createElement("section");picker.className="sl-r7-theme-picker";
    picker.innerHTML='<b>Cores</b><select aria-label="Escolher tema pessoal"><option value="vermelho">Vermelho</option><option value="roxo">Roxo</option><option value="azul">Azul</option><option value="amarelo">Amarelo</option><option value="verde">Verde</option><option value="rosa">Rosa</option><option value="cinza">Cinza</option><option value="gradiente-azul">Degradê azul</option><option value="gradiente-amarelo">Degradê amarelo</option><option value="gradiente-verde">Degradê verde</option></select>';
    const select=picker.querySelector("select");select.value=saved;select.addEventListener("change",()=>{localStorage.setItem(key,select.value);document.documentElement.dataset.slPersonalTheme=select.value;});
    host.prepend(picker);
    if(onThemePage){const grid=[...document.querySelectorAll("main div.grid")].find((element)=>element.querySelectorAll(":scope > button").length>2);if(grid)grid.style.display="none";}
  }

  const notificationLifetimeMs = 6 * 60 * 1000;
  const notificationSeenKey = "santa-luzia:windows-beta:notification-first-seen:v1";
  function expireTransientNotifications() {
    const heading = [...document.querySelectorAll("main h1,main h2,main h3")].find((element) => /^(Notificaç(?:ão|ões)|Avisos?)$/i.test(text(element)));
    const panel = heading?.closest("section,article") || heading?.parentElement;
    if (!panel) return;
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem(notificationSeenKey) || "{}"); } catch { seen = {}; }
    const candidates = [...panel.querySelectorAll("article,li")].filter((element) => {
      const content = text(element);
      return content && content !== text(panel) && !element.querySelector("article,li");
    });
    const now = Date.now();
    candidates.forEach((card, index) => {
      const content = text(card).slice(0, 500);
      let hash = 2166136261;
      for (let i = 0; i < content.length; i += 1) { hash ^= content.charCodeAt(i); hash = Math.imul(hash, 16777619); }
      const key = `${location.pathname}:${hash >>> 0}:${index}`;
      const firstSeen = Number(seen[key]) || now;
      if (!seen[key]) seen[key] = firstSeen;
      card.classList.add("sl-r7-notification-expiring");
      if (now - firstSeen >= notificationLifetimeMs) {
        card.classList.add("sl-r7-notification-expired");
        setTimeout(() => card.remove(), 280);
      }
    });
    const freshEntries = Object.fromEntries(Object.entries(seen).filter(([, value]) => now - Number(value) < 7 * 24 * 60 * 60 * 1000));
    try { localStorage.setItem(notificationSeenKey, JSON.stringify(freshEntries)); } catch {}
  }

  function coverRouteTransition(anchor) {
    const href = anchor?.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return;
    let destination;
    try { destination = new URL(href, location.href); } catch { return; }
    if (destination.origin !== location.origin || destination.href === location.href) return;
    document.querySelector(".sl-runtime-route-cover")?.remove();
    const cover = document.createElement("div");
    cover.className = "sl-runtime-route-cover";
    document.body.appendChild(cover);
    cover.style.opacity = "1";
    const origin = location.href;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (location.href === origin && Date.now() - startedAt < 2200) return;
      clearInterval(timer);
      setTimeout(() => {
        const main = document.querySelector("main");
        main?.getAnimations?.().filter((animation) => animation.id === "sl-page-enter" || animation.id === "sl-b7-route-enter").forEach((animation) => animation.cancel());
        main?.animate?.([{ opacity:.82, transform:"translate3d(0,3px,0)" },{ opacity:1, transform:"none" }], { duration:170, easing:"cubic-bezier(.2,.72,.2,1)" });
        const animation = cover.animate([{ opacity:1 },{ opacity:0 }], { duration:140, fill:"forwards", easing:"ease-out" });
        animation.finished.finally(() => cover.remove());
      }, 90);
    }, 40);
  }

  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest(".mobile-app-bottom-nav a[href]") : null;
    if (anchor) coverRouteTransition(anchor);
  }, true);

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; fixPodiumTrophies(); applyFormationPresenceLock(); enhancePresenceCenter(); organizePublishedScale(); renderMyAdministrativeRecords(); organizeFormationManagement(); enhanceDelayClocks(); enhanceProfileAndSoundControls(); enhanceAnimatedNavigationIcons(); removeRedundantCopy(); enhancePersonalThemePicker(); expireTransientNotifications(); });
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
  fixPodiumTrophies();
  applyFormationPresenceLock();
  enhancePresenceCenter();
  organizePublishedScale();
  renderMyAdministrativeRecords();
  organizeFormationManagement();
  enhanceDelayClocks();
  enhanceProfileAndSoundControls();
  enhanceAnimatedNavigationIcons();
  removeRedundantCopy();
  enhancePersonalThemePicker();
  expireTransientNotifications();
  setInterval(() => { applyFormationPresenceLock(); updatePresenceClock(); }, 1_000);
  setInterval(expireTransientNotifications, 15_000);
  window.dispatchEvent(new CustomEvent("santa-luzia:windows-beta-runtime", { detail: { revision } }));
})();
