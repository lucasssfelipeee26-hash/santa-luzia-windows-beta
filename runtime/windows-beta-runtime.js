"use strict";

(() => {
  const revision = "1";
  if (document.documentElement.dataset.windowsBetaRuntime === revision) return;
  document.documentElement.dataset.windowsBetaRuntime = revision;
  window.dispatchEvent(new CustomEvent("santa-luzia:windows-beta-runtime", { detail: { revision } }));
})();
