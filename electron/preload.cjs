"use strict"

// Patches experimentais da Beta Windows.
// Eles são empacotados dentro do EXE: nada desta camada é entregue pelo servidor.
const PATCH_VERSION = "0.1.0-beta.2"
const HIDDEN_MODERATOR_SHORTCUTS = new Set([
  "Painel",
  "Jornada",
  "Quizzes",
  "Escala pública",
])

function normalizar(texto) {
  return String(texto || "").replace(/\s+/g, " ").trim()
}

function aplicarNavegacaoModerador() {
  const painel = document.querySelector('nav[aria-label="Menu da Área Restrita"]')
  if (!painel) return

  const grid = painel.querySelector(".app-nav-grid")
  if (grid) {
    grid.dataset.windowsBetaPatch = PATCH_VERSION
    // Seis atalhos finais: 3 x 2, mantendo proporção semelhante ao Android.
    grid.style.setProperty("grid-template-columns", "repeat(3, minmax(0, 1fr))", "important")
  }

  painel.querySelectorAll("a.app-nav-tile").forEach((atalho) => {
    const label = normalizar(atalho.textContent)
    const deveOcultar = [...HIDDEN_MODERATOR_SHORTCUTS].some((item) => label === item || label.endsWith(item))
    if (!deveOcultar) return

    atalho.dataset.windowsBetaHidden = PATCH_VERSION
    atalho.setAttribute("aria-hidden", "true")
    atalho.setAttribute("tabindex", "-1")
    atalho.style.setProperty("display", "none", "important")
  })
}

function aplicarPatches() {
  aplicarNavegacaoModerador()
}

function iniciar() {
  aplicarPatches()

  let agendado = false
  const observer = new MutationObserver(() => {
    if (agendado) return
    agendado = true
    requestAnimationFrame(() => {
      agendado = false
      aplicarPatches()
    })
  })

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
  })
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciar, { once: true })
} else {
  iniciar()
}
