"use strict";

(() => {
  const revision = "6";
  if (document.documentElement.dataset.windowsBetaRuntime === revision) return;
  document.documentElement.dataset.windowsBetaRuntime = revision;

  const style = document.createElement("style");
  style.id = "sl-windows-runtime-r2";
  style.textContent = `
    .sl-b7-trophy, .sl-trophy-3d, .sl-r3-card-trophy { display:none !important; }
    .sl-r6-podium-header > svg, .sl-r6-podium-header > .sl-b7-trophy { display:none !important; }
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

  function fixPodiumTrophies() {
    const title = [...document.querySelectorAll("main h1,main h2,main h3")].find((element) => text(element) === "Pódio da equipe");
    const section = title?.closest("section");
    if (!section) return;
    const header = title.parentElement;
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
    if (!control || !article) return;
    const schedule = scheduledTimeFromArticle(article);
    const locked = Boolean(schedule && nowForPresence() < schedule.at);
    control.dataset.slR4PresenceLocked = String(locked);
    control.querySelectorAll("button,textarea,input").forEach((element) => {
      if (locked && !element.disabled) { element.disabled = true; element.dataset.slR4Disabled = "true"; }
      if (!locked && element.dataset.slR4Disabled === "true") { element.disabled = false; delete element.dataset.slR4Disabled; }
    });
    let notice = article.querySelector(".sl-r4-presence-locked");
    if (!locked) { notice?.remove(); return; }
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "sl-r4-presence-locked";
      notice.setAttribute("role", "status");
      notice.innerHTML = `<span class="sl-r6-clock" role="img"><i class="sl-r6-clock-hand sl-r6-clock-hour"></i><i class="sl-r6-clock-hand sl-r6-clock-minute"></i><i class="sl-r6-clock-hand sl-r6-clock-second"></i><i class="sl-r6-clock-center"></i></span><span class="sl-r6-lock-copy"><strong>Presença bloqueada por enquanto</strong><span></span></span>`;
      control.before(notice);
    }
    const copy = notice.querySelector(".sl-r6-lock-copy span");
    if (copy) copy.textContent = `Será liberada às ${schedule.label}.`;
    updatePresenceClock(notice);
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
    cover.animate([{ opacity:0 },{ opacity:1 }], { duration:70, fill:"forwards", easing:"ease-out" });
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
    const lockedPresence = event.target instanceof Element ? event.target.closest('[data-sl-r4-presence-locked="true"]') : null;
    if (lockedPresence) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    const anchor = event.target instanceof Element ? event.target.closest(".mobile-app-bottom-nav a[href]") : null;
    if (anchor) coverRouteTransition(anchor);
  }, true);

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; fixPodiumTrophies(); applyFormationPresenceLock(); });
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
  fixPodiumTrophies();
  applyFormationPresenceLock();
  setInterval(() => { applyFormationPresenceLock(); updatePresenceClock(); }, 1_000);
  window.dispatchEvent(new CustomEvent("santa-luzia:windows-beta-runtime", { detail: { revision } }));
})();
