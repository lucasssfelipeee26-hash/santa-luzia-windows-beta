"use strict";

(() => {
  const PATCH = "0.1.0-beta.4";
  const PRESENCE_KEY = "santa-luzia:windows-beta:daily-presence-v1";
  const NAV_TIMEOUT = 650;
  let observer = null;
  let scheduled = false;
  let lastRoute = "";

  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const text = (el) => normalize(el?.textContent);

  function todayCuiaba() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Cuiaba" }).format(new Date());
  }

  function dayNumber(iso) {
    const [y, m, d] = String(iso || "").split("-").map(Number);
    if (!y || !m || !d) return NaN;
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  }

  function readPresence() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PRESENCE_KEY) || "null");
      if (parsed && typeof parsed === "object") {
        return {
          last: typeof parsed.last === "string" ? parsed.last : "",
          streak: Number.isFinite(parsed.streak) ? Math.max(0, parsed.streak) : 0,
          best: Number.isFinite(parsed.best) ? Math.max(0, parsed.best) : 0,
          history: Array.isArray(parsed.history) ? parsed.history.filter((x) => typeof x === "string").slice(-90) : [],
        };
      }
    } catch {}
    return { last: "", streak: 0, best: 0, history: [] };
  }

  function currentPresence() {
    const state = readPresence();
    const today = todayCuiaba();
    if (!state.last) return state;
    const gap = dayNumber(today) - dayNumber(state.last);
    if (gap > 1) return { ...state, streak: 0 };
    return state;
  }

  function registerPresence() {
    const today = todayCuiaba();
    const state = currentPresence();
    if (state.last === today) return state;
    const gap = state.last ? dayNumber(today) - dayNumber(state.last) : NaN;
    const streak = gap === 1 ? state.streak + 1 : 1;
    const history = [...new Set([...state.history, today])].slice(-90);
    const next = { last: today, streak, best: Math.max(state.best, streak), history };
    try { localStorage.setItem(PRESENCE_KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new CustomEvent("santa-luzia:windows-presence", { detail: next }));
    return next;
  }

  function messageFor(streak, checked) {
    if (!checked) {
      if (streak >= 15) return `Você já chegou a ${streak} dias. Registre hoje para manter a sequência.`;
      if (streak >= 10) return `${streak} dias de constância. Continue sua caminhada hoje.`;
      if (streak >= 3) return `${streak} dias seguidos. Registre sua presença de hoje.`;
      return "Registre sua entrada diária no aplicativo. Isso é separado da presença em missas e formações.";
    }
    if (streak >= 15) return `Excelente constância: ${streak} dias seguidos!`;
    if (streak >= 10) return `${streak} dias seguidos. Sua constância está crescendo!`;
    if (streak >= 3) return `${streak} dias seguidos. Continue firme!`;
    if (streak === 2) return "Dois dias seguidos. A sequência começou!";
    return "Presença de hoje registrada. Volte amanhã para continuar a sequência.";
  }

  function ensureStyles() {
    if (document.getElementById("sl-beta4-behavior-style")) return;
    const style = document.createElement("style");
    style.id = "sl-beta4-behavior-style";
    style.textContent = `
      @keyframes slB4Rise { from { opacity:0; transform:translateY(8px) scale(.985) } to { opacity:1; transform:none } }
      @keyframes slB4Pulse { 0% { transform:scale(.94); opacity:.55 } 60% { transform:scale(1.08); opacity:1 } 100% { transform:scale(1); opacity:1 } }
      @keyframes slB4ToastIn { from { opacity:0; transform:translate(-50%,-14px) scale(.96) } to { opacity:1; transform:translate(-50%,0) scale(1) } }
      #sl-daily-presence { margin:0 0 12px; border:1px solid rgba(123,19,38,.15); border-radius:22px; overflow:hidden; background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(255,248,238,.96)); box-shadow:0 10px 26px rgba(78,38,31,.07); animation:slB4Rise .34s cubic-bezier(.22,.8,.22,1) both; }
      #sl-daily-presence .slp-inner { display:grid; grid-template-columns:44px minmax(0,1fr); gap:11px; padding:13px; align-items:center; }
      #sl-daily-presence .slp-icon { width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:15px; background:linear-gradient(145deg,#7b1326,#a52b41); color:white; box-shadow:0 7px 18px rgba(123,19,38,.23); font-size:22px; }
      #sl-daily-presence .slp-title { margin:0; font-family:Georgia,serif; color:#671526; font-weight:800; font-size:15px; }
      #sl-daily-presence .slp-meta { margin:3px 0 0; color:#78696c; font-size:10px; line-height:1.4; }
      #sl-daily-presence .slp-row { grid-column:1/-1; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:9px; align-items:center; border-top:1px solid rgba(123,19,38,.08); padding-top:10px; }
      #sl-daily-presence .slp-streak { min-width:0; font-size:11px; color:#3e3032; }
      #sl-daily-presence .slp-streak strong { color:#7b1326; font-size:14px; }
      #sl-daily-presence button { border:0; border-radius:13px; min-height:38px; padding:0 12px; background:#7b1326; color:white; font-weight:800; font-size:11px; cursor:pointer; box-shadow:0 7px 18px rgba(123,19,38,.18); }
      #sl-daily-presence button:disabled { background:#e8dedf; color:#6c5e61; box-shadow:none; cursor:default; }
      #sl-daily-presence.sl-checked .slp-icon { animation:slB4Pulse .48s cubic-bezier(.22,.8,.22,1) both; }
      .sl-task-fullscreen { position:fixed !important; inset:0 !important; width:100vw !important; max-width:none !important; height:100dvh !important; max-height:none !important; border-radius:0 !important; transform:none !important; overflow:auto !important; z-index:180 !important; animation:slB4Rise .28s cubic-bezier(.22,.8,.22,1) both !important; }
      .sl-task-fullscreen [role="tablist"] { position:sticky; top:0; z-index:2; backdrop-filter:blur(14px); }
      .sl-b4-feedback { position:fixed; left:50%; top:max(16px,env(safe-area-inset-top)); z-index:250; width:min(360px,calc(100vw - 24px)); border-radius:18px; padding:11px 13px; background:rgba(255,255,255,.98); border:1px solid rgba(123,19,38,.14); box-shadow:0 18px 44px rgba(50,28,29,.2); animation:slB4ToastIn .3s cubic-bezier(.22,.8,.22,1) both; }
      .sl-b4-feedback strong { display:block; font-size:13px; color:#3b282c; }
      .sl-b4-feedback span { display:block; margin-top:2px; font-size:10px; color:#756568; line-height:1.4; }
      .sl-b4-feedback.good { border-color:rgba(22,139,91,.28); }
      .sl-b4-feedback.bad { border-color:rgba(190,55,55,.24); }
      .sl-b4-nav-pending { pointer-events:none; opacity:.78; }
      @media (prefers-reduced-motion:reduce) { #sl-daily-presence,.sl-task-fullscreen,.sl-b4-feedback,#sl-daily-presence.sl-checked .slp-icon { animation:none !important; } }
    `;
    document.head.appendChild(style);
  }

  function isLoggedArea() {
    const bodyText = text(document.body);
    return location.pathname.startsWith("/area-restrita") || /Meu Perfil|Moderador|Jornada Litúrgica|Escala do Dia/.test(bodyText);
  }

  function isHomeLike() {
    if (!isLoggedArea()) return false;
    const path = location.pathname.replace(/\/$/, "") || "/";
    const allowed = path === "/visitante" || path === "/area-restrita/membro" || path === "/area-restrita/moderador" || path === "/";
    if (!allowed) return false;
    const t = text(document.body);
    return /Escala do Dia|Meu Perfil|Painel do Moderador|Próximo compromisso|Jornada Litúrgica/.test(t) && !/Controle de Presenças/.test(t);
  }

  function renderPresence(card, state) {
    const today = todayCuiaba();
    const checked = state.last === today;
    const streak = checked ? state.streak : currentPresence().streak;
    card.classList.toggle("sl-checked", checked);
    card.innerHTML = `
      <div class="slp-inner">
        <div class="slp-icon" aria-hidden="true">${checked ? "✓" : "🔥"}</div>
        <div>
          <p class="slp-title">Presença diária</p>
          <p class="slp-meta">${messageFor(streak, checked)}</p>
        </div>
        <div class="slp-row">
          <div class="slp-streak"><strong>${streak}</strong> dia${streak === 1 ? "" : "s"} em sequência · melhor: ${Math.max(state.best || 0, streak)}</div>
          <button type="button" ${checked ? "disabled" : ""}>${checked ? "Registrada hoje" : "Registrar presença"}</button>
        </div>
      </div>`;
    const button = card.querySelector("button");
    if (button && !checked) {
      button.addEventListener("click", () => {
        const next = registerPresence();
        renderPresence(card, next);
        showFeedback("Presença registrada", `Sequência atual: ${next.streak} dia${next.streak === 1 ? "" : "s"}.`, "good");
      }, { once: true });
    }
  }

  function ensurePresenceCard() {
    if (!isHomeLike()) return;
    const main = document.querySelector("main");
    if (!main || main.querySelector("#sl-daily-presence")) return;
    const card = document.createElement("section");
    card.id = "sl-daily-presence";
    card.dataset.windowsBetaPatch = PATCH;
    renderPresence(card, currentPresence());

    const sections = [...main.children].filter((el) => el.nodeType === 1);
    const anchor = sections.find((el) => /Escala do Dia|Próximo compromisso|Meu Perfil|Jornada Litúrgica/.test(text(el)));
    if (anchor?.nextSibling) main.insertBefore(card, anchor.nextSibling);
    else if (anchor) main.appendChild(card);
    else main.prepend(card);
  }

  function ensureTaskFullscreen() {
    const candidates = [
      ...document.querySelectorAll('[role="dialog"]'),
      ...document.querySelectorAll('[data-state="open"]'),
    ];
    candidates.forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const t = text(el);
      const hasTaskTabs = /Instruções/.test(t) && /Enviar resposta/.test(t);
      const looksTask = /Tarefa|Atividade|Missão/.test(t) && /resposta|instruç/i.test(t);
      if (hasTaskTabs || looksTask) {
        el.classList.add("sl-task-fullscreen");
        el.dataset.windowsBetaTask = PATCH;
      }
    });
  }

  function showFeedback(title, subtitle, type = "") {
    document.querySelectorAll(".sl-b4-feedback").forEach((el) => el.remove());
    const toast = document.createElement("div");
    toast.className = `sl-b4-feedback ${type}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `<strong></strong><span></span>`;
    toast.querySelector("strong").textContent = title;
    toast.querySelector("span").textContent = subtitle;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3200);
  }

  function watchResultButton(button) {
    if (!(button instanceof HTMLElement) || button.dataset.slB4Result === PATCH) return;
    button.dataset.slB4Result = PATCH;
    button.addEventListener("click", () => {
      const scope = button.closest("form,section,[role=dialog],article,div") || document.body;
      const before = text(scope);
      window.setTimeout(() => {
        const after = text(scope);
        if (after === before) return;
        if (/corret[oa]|parabéns|acertou|resposta certa/i.test(after)) {
          showFeedback("Resposta correta!", "Muito bem. A pontuação/XP é contabilizada pelo resultado da atividade.", "good");
        } else if (/incorret[oa]|resposta errada|não foi dessa vez|tente novamente/i.test(after)) {
          showFeedback("Resposta incorreta", "Confira a explicação e tente aprender com a resposta, sem perder o progresso.", "bad");
        }
      }, 180);
    });
  }

  function ensureResultFeedback() {
    [...document.querySelectorAll("button")].forEach((button) => {
      if (/Conferir resultado/i.test(text(button))) watchResultButton(button);
    });
  }

  function installNavigationFallback() {
    if (document.documentElement.dataset.slB4Nav === PATCH) return;
    document.documentElement.dataset.slB4Nav = PATCH;
    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!target) return;
      const rawHref = target.getAttribute("href") || "";
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;
      let destination;
      try { destination = new URL(rawHref, location.href); } catch { return; }
      if (destination.origin !== location.origin) return;
      const from = location.href;
      const expected = destination.href;
      target.classList.add("sl-b4-nav-pending");
      window.setTimeout(() => {
        target.classList.remove("sl-b4-nav-pending");
        if (location.href === from && expected !== from) location.assign(expected);
      }, NAV_TIMEOUT);
    }, true);
  }

  function replayOnRouteChange() {
    const route = `${location.pathname}${location.search}${location.hash}`;
    if (route === lastRoute) return;
    lastRoute = route;
    const main = document.querySelector("main");
    if (!main || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    main.animate([
      { opacity: .25, transform: "translateY(6px) scale(.998)" },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ], { duration: 300, easing: "cubic-bezier(.22,.8,.22,1)" });
  }

  function apply() {
    scheduled = false;
    ensureStyles();
    installNavigationFallback();
    replayOnRouteChange();
    ensurePresenceCard();
    ensureTaskFullscreen();
    ensureResultFeedback();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  function start() {
    apply();
    observer?.disconnect();
    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state", "aria-current"] });
    window.addEventListener("popstate", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("santa-luzia:server-sync", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
