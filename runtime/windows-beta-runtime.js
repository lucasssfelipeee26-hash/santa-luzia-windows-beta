"use strict";

(() => {
  const revision = "3";
  if (document.documentElement.dataset.windowsBetaRuntime === revision) return;
  document.documentElement.dataset.windowsBetaRuntime = revision;

  const style = document.createElement("style");
  style.id = "sl-windows-runtime-r2";
  style.textContent = `
    .sl-b7-trophy, .sl-trophy-3d { display:none !important; }
    .sl-b7-route-shield { display:none !important; }
    .sl-runtime-route-cover { position:fixed; inset:0; z-index:244; pointer-events:none; background:#fffaf0; opacity:0; }
    .sl-r3-card-trophy { --sl-cup-light:#fff0a4; --sl-cup-main:#d4a526; --sl-cup-dark:#76500b; position:absolute; top:7px; right:6px; z-index:8; width:34px; height:34px; pointer-events:none; filter:drop-shadow(0 6px 7px color-mix(in srgb,var(--sl-cup-dark) 34%,transparent)); animation:slR3CupFloat 3.2s ease-in-out infinite; transform-style:preserve-3d; }
    .sl-r3-card-trophy svg { width:100%; height:100%; overflow:visible; }
    .sl-r3-card-trophy[data-rank="1"] { --sl-cup-light:#fff5b8; --sl-cup-main:#e4b936; --sl-cup-dark:#7b5107; width:39px; height:39px; top:5px; }
    .sl-r3-card-trophy[data-rank="2"] { --sl-cup-light:#ffffff; --sl-cup-main:#b9c2c9; --sl-cup-dark:#59656e; animation-delay:-1.05s; }
    .sl-r3-card-trophy[data-rank="3"] { --sl-cup-light:#ffd1aa; --sl-cup-main:#bd7547; --sl-cup-dark:#6f351d; animation-delay:-2.1s; }
    @keyframes slR3CupFloat { 0%,100%{transform:perspective(380px) translateY(0) rotateY(-8deg)} 50%{transform:perspective(380px) translateY(-4px) rotateY(9deg)} }
    @media (prefers-reduced-motion:reduce) { .sl-r3-card-trophy { animation:none !important; } }
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
    section.querySelectorAll(".sl-trophy-3d").forEach((element) => element.remove());
    for (const rank of [1,2,3]) {
      const card = section.querySelector(`.sl-podium-${rank},.sl-b7-podium[data-sl-rank="${rank}"]`);
      if (!card || card.querySelector(`.sl-r3-card-trophy[data-rank="${rank}"]`)) continue;
      const trophy = document.createElement("span");
      trophy.className = "sl-r3-card-trophy";
      trophy.dataset.rank = String(rank);
      trophy.setAttribute("aria-label", `Troféu do ${rank}º lugar`);
      trophy.innerHTML = trophyMarkup(rank);
      card.appendChild(trophy);
    }
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
    const anchor = event.target instanceof Element ? event.target.closest(".mobile-app-bottom-nav a[href]") : null;
    if (anchor) coverRouteTransition(anchor);
  }, true);

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; fixPodiumTrophies(); });
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
  fixPodiumTrophies();
  window.dispatchEvent(new CustomEvent("santa-luzia:windows-beta-runtime", { detail: { revision } }));
})();
