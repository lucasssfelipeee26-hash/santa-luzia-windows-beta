"use strict";

(() => {
  const revision = "2";
  if (document.documentElement.dataset.windowsBetaRuntime === revision) return;
  document.documentElement.dataset.windowsBetaRuntime = revision;

  const style = document.createElement("style");
  style.id = "sl-windows-runtime-r2";
  style.textContent = `
    .sl-b7-trophy::before { display:none !important; animation:none !important; }
    .sl-runtime-route-cover { position:fixed; inset:0; z-index:244; pointer-events:none; background:#fffaf0; opacity:0; }
  `;
  document.head.appendChild(style);

  function text(element) {
    return String(element?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function fixTrophy() {
    const title = [...document.querySelectorAll("main h1,main h2,main h3")].find((element) => text(element) === "Pódio da equipe");
    const section = title?.closest("section");
    if (!section) return;
    section.querySelectorAll(".sl-trophy-3d").forEach((element) => element.remove());
    const trophies = [...section.querySelectorAll(".sl-b7-trophy")];
    const trophy = trophies.shift();
    trophies.forEach((element) => element.remove());
    if (!trophy) return;
    const header = title.parentElement?.parentElement;
    if (!header) return;
    const smallIcon = [...header.querySelectorAll("svg")].find((svg) => !svg.closest(".sl-b7-trophy") && svg.getBoundingClientRect().width <= 32);
    if (smallIcon) smallIcon.replaceWith(trophy);
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
    cover.animate([{ opacity:0 },{ opacity:1 }], { duration:100, fill:"forwards", easing:"ease-out" });
    const origin = location.href;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (location.href === origin && Date.now() - startedAt < 2200) return;
      clearInterval(timer);
      setTimeout(() => {
        const animation = cover.animate([{ opacity:1 },{ opacity:0 }], { duration:240, fill:"forwards", easing:"ease-out" });
        animation.finished.finally(() => cover.remove());
      }, 260);
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
    requestAnimationFrame(() => { scheduled = false; fixTrophy(); });
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
  fixTrophy();
  window.dispatchEvent(new CustomEvent("santa-luzia:windows-beta-runtime", { detail: { revision } }));
})();
