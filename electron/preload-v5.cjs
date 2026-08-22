"use strict"

// Santa Luzia Windows Beta — experimentos visuais empacotados no EXE.
// Esta camada existe apenas no canal Windows Beta. Android code 18 permanece intacto.
const PATCH_VERSION = "0.1.0-beta.4"
const RANKING_STORAGE = "santa-luzia:windows-beta:ranking-v4"
const HIDDEN_MODERATOR_SHORTCUTS = new Set(["Painel", "Jornada", "Quizzes", "Escala pública"])

let observer = null
let framePendente = false
let rotaAtual = ""
let rankingVisivel = false
let rankingAssinatura = ""
let bannerTimer = null
let logoAnimado = false
let ultimoTabAtivo = ""

function normalizar(value) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

function texto(el) {
  return normalizar(el?.textContent)
}

function reduzMovimento() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches } catch { return false }
}

function visivel(el) {
  if (!(el instanceof Element)) return false
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0"
}

function animar(el, keyframes, options = {}) {
  if (!(el instanceof Element) || !visivel(el) || typeof el.animate !== "function") return null
  const reduced = reduzMovimento()
  const frames = reduced ? [{ opacity: 0.55 }, { opacity: 1 }] : keyframes
  const duration = reduced ? Math.min(140, Number(options.duration || 300)) : Number(options.duration || 300)
  try {
    el.getAnimations?.().filter((a) => a.id === options.id).forEach((a) => a.cancel())
    const animation = el.animate(frames, {
      duration,
      delay: reduced ? 0 : Number(options.delay || 0),
      easing: options.easing || "cubic-bezier(.22,.8,.22,1)",
      fill: options.fill || "both",
      iterations: options.iterations || 1,
      direction: options.direction || "normal",
    })
    if (options.id) animation.id = options.id
    return animation
  } catch { return null }
}

function marcarUmaVez(el, key) {
  if (!(el instanceof HTMLElement)) return false
  const attr = `sl${key}`
  if (el.dataset[attr] === PATCH_VERSION) return false
  el.dataset[attr] = PATCH_VERSION
  return true
}

function injetarEstilos() {
  if (document.getElementById("sl-beta4-native-style")) return
  const style = document.createElement("style")
  style.id = "sl-beta4-native-style"
  style.textContent = `
    html[data-windows-motion-version="${PATCH_VERSION}"] { --sl-ease: cubic-bezier(.22,.8,.22,1); }
    :where(button,a[href],[role="button"]) { -webkit-tap-highlight-color: transparent; }
    :where(button,a[href],[role="button"]) { transition: transform 130ms ease, filter 160ms ease, box-shadow 180ms ease; }
    :where(button,a[href],[role="button"]):active { transform: scale(.972); }
    .mobile-app-bottom-nav a > span { transition: transform 230ms var(--sl-ease), box-shadow 230ms ease !important; }
    .mobile-app-bottom-nav a[aria-current="page"] > span { transform: translateY(-4px) scale(1.06); box-shadow: 0 8px 20px rgba(123,19,38,.22) !important; }
    .sl-podium-grid { perspective: 900px; align-items: end !important; }
    .sl-podium-card { isolation:isolate; overflow:visible !important; transform-style:preserve-3d; }
    .sl-podium-1 { order:2 !important; min-height:184px; border-color:rgba(196,151,34,.62) !important; box-shadow:0 16px 38px rgba(160,120,25,.17) !important; }
    .sl-podium-2 { order:1 !important; border-color:rgba(151,160,169,.58) !important; box-shadow:0 10px 26px rgba(109,122,134,.10) !important; }
    .sl-podium-3 { order:3 !important; border-color:rgba(177,105,62,.56) !important; box-shadow:0 10px 26px rgba(158,91,53,.10) !important; }
    .sl-rank-badge { min-width:34px !important; min-height:28px !important; display:inline-flex !important; align-items:center; justify-content:center; font-size:14px !important; font-weight:950 !important; box-shadow:0 5px 14px rgba(55,36,28,.14); }
    .sl-podium-1 .sl-rank-badge { min-width:42px !important; min-height:34px !important; font-size:17px !important; background:linear-gradient(145deg,#ffe78a,#bd8d20) !important; color:#3f2d08 !important; }
    .sl-podium-2 .sl-rank-badge { background:linear-gradient(145deg,#f2f5f7,#9ba5ae) !important; color:#31383e !important; }
    .sl-podium-3 .sl-rank-badge { background:linear-gradient(145deg,#efbd91,#a7663f) !important; color:#422519 !important; }
    .sl-top-avatar { position:relative !important; overflow:visible !important; z-index:3; transform-style:preserve-3d; background:white; }
    .sl-top-avatar > img, .sl-top-avatar > [data-slot="avatar-fallback"] { border-radius:9999px !important; clip-path:circle(50%); }
    .sl-top-avatar::before, .sl-top-avatar::after { content:""; position:absolute; border-radius:9999px; pointer-events:none; }
    .sl-top-avatar::before { inset:-8px; z-index:-2; background:conic-gradient(from var(--sl-halo-angle,0deg),transparent 0 10%,var(--sl-halo-a) 16%,var(--sl-halo-b) 33%,#fff9cd 43%,var(--sl-halo-a) 57%,transparent 70% 82%,var(--sl-halo-b) 93%,transparent); animation:slHaloOrbit 2.25s linear infinite; filter:drop-shadow(0 0 7px var(--sl-halo-glow)); }
    .sl-top-avatar::after { inset:-4px; z-index:-1; background:#fffdf9; }
    .sl-gold { --sl-halo-a:#a36d04; --sl-halo-b:#ffd960; --sl-halo-glow:rgba(231,174,27,.84); }
    .sl-silver { --sl-halo-a:#687681; --sl-halo-b:#edf3f7; --sl-halo-glow:rgba(161,180,195,.78); }
    .sl-bronze { --sl-halo-a:#88482a; --sl-halo-b:#e7a06f; --sl-halo-glow:rgba(196,105,56,.72); }
    @property --sl-halo-angle { syntax:"<angle>"; inherits:false; initial-value:0deg; }
    @keyframes slHaloOrbit { to { --sl-halo-angle:360deg; transform:rotate(360deg); } }
    .sl-trophy-3d { width:64px; height:64px; flex:0 0 64px; position:relative; border-radius:18px; filter:drop-shadow(0 10px 12px rgba(92,61,15,.30)); transform-style:preserve-3d; }
    .sl-trophy-3d svg { width:100%; height:100%; display:block; }
    .sl-trophy-3d::after { content:""; position:absolute; inset:7px 8px; border-radius:14px; background:linear-gradient(115deg,transparent 20%,rgba(255,255,255,.72) 42%,transparent 60%); transform:translateX(-135%); animation:slTrophySweep 3.4s ease-in-out infinite; pointer-events:none; }
    @keyframes slTrophySweep { 0%,54% { transform:translateX(-140%); opacity:0; } 64% { opacity:.9; } 84%,100% { transform:translateX(160%); opacity:0; } }
    .sl-ranking-banner { --sl-banner:#c49b37; position:fixed; top:14px; left:50%; z-index:240; width:min(380px,calc(100vw - 22px)); transform:translateX(-50%); display:grid; grid-template-columns:54px minmax(0,1fr) auto; align-items:center; gap:10px; padding:10px 12px; border-radius:22px; border:1px solid color-mix(in srgb,var(--sl-banner) 58%,white); background:rgba(255,253,249,.98); box-shadow:0 18px 52px rgba(54,30,25,.23); backdrop-filter:blur(18px); }
    .sl-ranking-banner-avatar { width:48px; height:48px; border-radius:9999px; object-fit:cover; border:3px solid var(--sl-banner); box-shadow:0 0 0 4px color-mix(in srgb,var(--sl-banner) 18%,transparent); }
    .sl-ranking-banner-fallback { display:flex; align-items:center; justify-content:center; background:#fff6e9; color:#681426; font-weight:950; }
    .sl-ranking-banner small { display:block; font-size:9px; font-weight:950; text-transform:uppercase; letter-spacing:.12em; color:var(--sl-banner); }
    .sl-ranking-banner strong { display:block; margin-top:2px; color:#351f23; font-size:13px; line-height:1.2; }
    .sl-ranking-banner p { margin:3px 0 0; color:#77656a; font-size:10px; }
    .sl-ranking-banner-rank { min-width:44px; text-align:center; font-size:19px; font-weight:1000; color:var(--sl-banner); }
    .sl-presence-active { box-shadow:0 8px 22px rgba(123,19,38,.13) !important; }
    .sl-formation-highlight { position:relative; overflow:hidden; }
    .sl-formation-highlight::after { content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 48%,transparent 62%); transform:translateX(-140%); animation:slFormationSheen 4.2s ease-in-out infinite; }
    @keyframes slFormationSheen { 0%,64% { transform:translateX(-140%); } 86%,100% { transform:translateX(140%); } }
    @media (prefers-reduced-motion: reduce) { .sl-top-avatar::before, .sl-trophy-3d::after, .sl-formation-highlight::after { animation:none !important; } .mobile-app-bottom-nav a[aria-current="page"] > span { transform:none; } }
  `
  document.head?.appendChild(style)
  document.documentElement.dataset.windowsMotionVersion = PATCH_VERSION
}

function animarEntradaPagina(force = false) {
  const rota = `${location.pathname}${location.search}${location.hash}`
  if (!force && rota === rotaAtual) return
  rotaAtual = rota
  const main = document.querySelector("main")
  if (!main) return
  animar(main, [{ opacity:0, transform:"translate3d(0,10px,0) scale(.996)" }, { opacity:1, transform:"translate3d(0,0,0) scale(1)" }], { duration:330, id:"sl-page-enter" })
}

function animarLogo(force = false) {
  const img = document.querySelector('img[alt="Santa Luzia"]')
  const alvo = img?.parentElement || img
  if (!alvo) return
  if (!force && logoAnimado) return
  logoAnimado = true
  animar(alvo, [
    { opacity:.55, transform:"scale(.88) rotate(-4deg)", filter:"brightness(.9) saturate(.85)", boxShadow:"0 0 0 0 rgba(212,175,55,0)" },
    { opacity:1, transform:"scale(1.07) rotate(1.8deg)", filter:"brightness(1.08) saturate(1.08)", boxShadow:"0 0 0 9px rgba(212,175,55,.16)", offset:.52 },
    { opacity:1, transform:"scale(.99) rotate(-.5deg)", boxShadow:"0 0 0 4px rgba(212,175,55,.09)", offset:.78 },
    { opacity:1, transform:"scale(1) rotate(0deg)", filter:"none", boxShadow:"0 2px 8px rgba(95,16,32,.12)" },
  ], { duration:920, id:"sl-logo-entry" })
}

function animarCardsDaTela() {
  const main = document.querySelector("main")
  if (!main) return
  const cards = [...main.querySelectorAll("section, article, [class*='rounded-2xl']")].filter((el) => visivel(el) && !el.closest('[role="dialog"]')).slice(0, 16)
  cards.forEach((card, index) => {
    if (!marcarUmaVez(card, "CardReveal")) return
    animar(card, [{ opacity:0, transform:"translate3d(0,8px,0) scale(.992)" }, { opacity:1, transform:"translate3d(0,0,0) scale(1)" }], { duration:300, delay:Math.min(index,8)*42, id:`sl-card-${index}` })
  })
  for (const label of ["Cursos Litúrgicos", "Escala do Dia", "Liturgia Diária"]) {
    const el = [...main.querySelectorAll("a,button,section,article,div")].find((node) => texto(node).includes(label) && visivel(node))
    if (el && marcarUmaVez(el, `VideoCard${label.replace(/\W/g,"")}`)) {
      animar(el, [{ opacity:.35, transform:"translateY(10px) scale(.97)" }, { opacity:1, transform:"translateY(-2px) scale(1.015)", offset:.72 }, { opacity:1, transform:"translateY(0) scale(1)" }], { duration:520, delay:120, id:`sl-video-card-${label}` })
    }
  }
}

function aplicarMenuModerador() {
  const navs = [...document.querySelectorAll('nav[aria-label="Menu da Área Restrita"], .app-nav-panel')]
  for (const painel of navs) {
    const atalhos = [...painel.querySelectorAll("a.app-nav-tile, a[href]")]
    const labels = atalhos.map(texto)
    const moderador = labels.some((l) => l.includes("Presenças")) && labels.some((l) => l.includes("Registro")) && labels.some((l) => l.includes("Cores"))
    if (!moderador) continue
    const grid = painel.querySelector(".app-nav-grid") || atalhos[0]?.parentElement
    if (grid instanceof HTMLElement) grid.style.setProperty("grid-template-columns", "repeat(3,minmax(0,1fr))", "important")
    atalhos.forEach((atalho) => {
      const label = texto(atalho)
      const ocultar = [...HIDDEN_MODERATOR_SHORTCUTS].some((item) => label === item || label.endsWith(item))
      if (ocultar) { atalho.setAttribute("aria-hidden", "true"); atalho.setAttribute("tabindex", "-1"); atalho.style.setProperty("display", "none", "important") }
      else { atalho.removeAttribute("aria-hidden"); if (atalho.getAttribute("tabindex") === "-1") atalho.removeAttribute("tabindex") }
    })
    if (visivel(painel) && marcarUmaVez(painel, "ModeratorMenu")) {
      animar(painel, [{ opacity:0, transform:"translateY(-8px) scale(.965)" }, { opacity:1, transform:"translateY(0) scale(1)" }], { duration:300, id:"sl-nav-dialog" })
      const vivos = atalhos.filter((a) => a.getAttribute("aria-hidden") !== "true" && visivel(a))
      vivos.forEach((a,i) => animar(a,[{ opacity:0, transform:"translateY(8px) scale(.93)" }, { opacity:1, transform:"translateY(0) scale(1)" }], { duration:330, delay:80+i*48, id:`sl-nav-tile-${i}` }))
    }
  }
}

function aplicarDialogs() {
  const dialogs = [...document.querySelectorAll('[role="dialog"], .app-mobile-menu-layer .app-nav-panel')].filter(visivel)
  dialogs.forEach((dialog) => { if (marcarUmaVez(dialog, "Dialog")) animar(dialog,[{ opacity:0, transform:"translateY(-7px) scale(.96)" }, { opacity:1, transform:"translateY(0) scale(1)" }], { duration:260, id:"sl-dialog" }) })
}

function aplicarBottomNav() {
  const nav = document.querySelector(".mobile-app-bottom-nav")
  if (!nav) return
  const ativo = nav.querySelector('a[aria-current="page"]')
  if (!ativo) return
  const href = ativo.getAttribute("href") || texto(ativo)
  if (nav.dataset.slActiveHref === href) return
  nav.dataset.slActiveHref = href
  const icon = ativo.querySelector("span") || ativo
  animar(icon,[{ transform:"translateY(1px) scale(.88)", opacity:.65 }, { transform:"translateY(-6px) scale(1.11)", opacity:1, offset:.62 }, { transform:"translateY(-4px) scale(1.06)", opacity:1 }], { duration:360, id:"sl-bottom-active" })
}

function aplicarTabs() {
  const tabs = [...document.querySelectorAll('[role="tab"][data-state="active"], [role="tab"][aria-selected="true"]')].filter(visivel)
  for (const tab of tabs) {
    const key = `${location.pathname}:${tab.getAttribute("value") || tab.getAttribute("data-value") || texto(tab)}`
    if (key === ultimoTabAtivo) continue
    ultimoTabAtivo = key
    animar(tab,[{ transform:"scale(.92)", opacity:.65 }, { transform:"scale(1.045)", opacity:1, offset:.6 }, { transform:"scale(1)", opacity:1 }], { duration:300, id:"sl-tab-active" })
    const panel = document.querySelector('[role="tabpanel"][data-state="active"]')
    if (panel && visivel(panel)) animar(panel,[{ opacity:.08, transform:"translate3d(10px,4px,0)" }, { opacity:1, transform:"translate3d(0,0,0)" }], { duration:300, id:"sl-tab-panel" })
  }
}

function aplicarPresencasEFormacao() {
  const bodyText = texto(document.body)
  const isPresenca = bodyText.includes("Comitê de Presença")
  const isFormacao = bodyText.includes("Central de Formação") || bodyText.includes("Próxima formação") || location.pathname.includes("formacao")
  if (isPresenca) {
    const counters = [...document.querySelectorAll("main section, main article, main [class*='rounded']")].filter((el) => { const t = texto(el); return visivel(el) && (t.includes("Presenças") || t.includes("Faltas") || t.includes("Justificadas") || t.includes("Não marcadas")) }).slice(0,8)
    counters.forEach((el,i) => { el.classList.add("sl-presence-active"); if (marcarUmaVez(el,"Presence")) animar(el,[{ opacity:.25, transform:"translateY(8px) scale(.97)" }, { opacity:1, transform:"translateY(0) scale(1)" }], { duration:360, delay:i*50, id:`sl-pres-${i}` }) })
    const rows = [...document.querySelectorAll("main article, main li, main [class*='border']")].filter((el) => visivel(el) && texto(el).length > 18).slice(0,20)
    rows.forEach((row,i) => { if (marcarUmaVez(row,"PresenceRow")) animar(row,[{opacity:0,transform:"translateX(-8px)"},{opacity:1,transform:"translateX(0)"}],{duration:270,delay:Math.min(i,10)*32,id:`sl-pres-row-${i}`}) })
  }
  if (isFormacao) {
    const cards = [...document.querySelectorAll("main section, main article, main [class*='rounded']")].filter((el) => { const t = texto(el); return visivel(el) && (t.includes("formação") || t.includes("Formação") || t.includes("Histórico")) }).slice(0,14)
    cards.forEach((el,i) => { if (i < 4) el.classList.add("sl-formation-highlight"); if (marcarUmaVez(el,"Formation")) animar(el,[{ opacity:0, transform:"translateY(10px) scale(.985)" }, { opacity:1, transform:"translateY(0) scale(1)" }], { duration:380, delay:i*45, id:`sl-form-${i}` }) })
  }
}

function posicaoDoCard(card) {
  const badge = [...card.querySelectorAll("span,b,strong")].find((el) => /^\s*[123]º\s*$/.test(texto(el)))
  const match = texto(badge).match(/([123])º/)
  return match ? Number(match[1]) : 0
}

function avatarDoCard(card) { const img = card.querySelector('img[src]'); if (!img) return null; const root = img.closest('[data-slot="avatar"]') || img.parentElement; return root instanceof HTMLElement ? root : img }
function nomeDoCard(card) { const candidates = [...card.querySelectorAll("p,h3,strong")].map(texto).filter(Boolean); return candidates.find((t) => !/^\d+$/.test(t) && t !== "pontos" && !t.endsWith("º") && t.length > 2) || "Participante" }
function pontosDoCard(card) { const ps = [...card.querySelectorAll("p,strong,span")]; for (const el of ps) { const t = texto(el); if (/^\d{1,6}$/.test(t) && texto(el.parentElement).toLowerCase().includes("ponto")) return Number(t) } const all = texto(card).match(/\b(\d{1,6})\s*pontos?\b/i); return all ? Number(all[1]) : 0 }

function criarTrofeu3D() {
  const wrap = document.createElement("div")
  wrap.className = "sl-trophy-3d"
  wrap.setAttribute("aria-label", "Troféu do ranking")
  wrap.innerHTML = `<svg viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="slCup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset=".24" stop-color="#efc553"/><stop offset=".55" stop-color="#a66f10"/><stop offset=".76" stop-color="#f4cf61"/><stop offset="1" stop-color="#7d4e08"/></linearGradient><linearGradient id="slBase" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7f4d0b"/><stop offset="1" stop-color="#3e2308"/></linearGradient><filter id="slShadow"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity=".3"/></filter></defs><g filter="url(#slShadow)"><path d="M23 12h34v9c0 15-6 25-14 29v8h9v6H28v-6h9v-8c-8-4-14-14-14-29z" fill="url(#slCup)"/><path d="M23 18H13v7c0 10 6 17 15 18" fill="none" stroke="#c99328" stroke-width="6" stroke-linecap="round"/><path d="M57 18h10v7c0 10-6 17-15 18" fill="none" stroke="#c99328" stroke-width="6" stroke-linecap="round"/><rect x="24" y="64" width="32" height="7" rx="3.5" fill="url(#slBase)"/><path d="M31 18h18c-1 12-4 20-9 24-5-4-8-12-9-24z" fill="#fff6c4" opacity=".22"/></g></svg>`
  if (!reduzMovimento()) animar(wrap,[{ transform:"perspective(520px) rotateY(-10deg) rotateX(2deg) translateY(0)" },{ transform:"perspective(520px) rotateY(10deg) rotateX(-2deg) translateY(-4px)" },{ transform:"perspective(520px) rotateY(-10deg) rotateX(2deg) translateY(0)" }], { duration:3400, iterations:Infinity, easing:"ease-in-out", id:"sl-trophy-float" })
  return wrap
}

function corPosicao(pos) { return pos === 1 ? "#c69a2a" : pos === 2 ? "#9ba7b0" : pos === 3 ? "#b56f48" : "#7b1326" }

function coletarRanking(secao, cards) {
  const entries = []
  cards.forEach((card) => { const pos = posicaoDoCard(card); if (!pos) return; const img = card.querySelector('img[src]'); entries.push({ posicao:pos, nome:nomeDoCard(card), pontos:pontosDoCard(card), foto:img?.getAttribute("src") || "" }) })
  const rows = [...document.querySelectorAll("main [class*='rounded-2xl']")].filter((el) => el !== secao && visivel(el))
  for (const row of rows) { const match = texto(row).match(/\b(\d{1,3})º\b/); if (!match) continue; const pos = Number(match[1]); if (entries.some((e) => e.posicao === pos)) continue; const img = row.querySelector('img[src]'); const nomes = [...row.querySelectorAll("p,strong")].map(texto).filter((t) => t && !/^\d+/.test(t)); const pts = texto(row).match(/\b(\d{1,6})\s*(?:pts|pontos?)\b/i); entries.push({ posicao:pos, nome:nomes[0] || "Participante", pontos:pts ? Number(pts[1]) : 0, foto:img?.getAttribute("src") || "" }) }
  return entries.sort((a,b)=>a.posicao-b.posicao).slice(0,50)
}

function snapshotRanking() { try { return JSON.parse(localStorage.getItem(RANKING_STORAGE) || "null") } catch { return null } }
function salvarRanking(entries) { try { localStorage.setItem(RANKING_STORAGE, JSON.stringify({ at:Date.now(), entries })) } catch {} }
function nomeAtual() { const bloco = [...document.querySelectorAll("main div,main section")].find((el) => texto(el).includes("Sua posição")); if (!bloco) return ""; const parts = [...bloco.querySelectorAll("p,strong")].map(texto).filter(Boolean); return parts.find((t) => t !== "Sua posição" && !/^\d+/.test(t) && t !== "pontos") || "" }

function mostrarBanner(evento) {
  document.querySelector(".sl-ranking-banner")?.remove()
  if (bannerTimer) clearTimeout(bannerTimer)
  const banner = document.createElement("div")
  banner.className = "sl-ranking-banner"
  banner.style.setProperty("--sl-banner", corPosicao(evento.posicao))
  const initials = evento.nome.split(/\s+/).filter(Boolean).slice(0,2).map((p)=>p[0]).join("").toUpperCase()
  const avatar = evento.foto ? `<img class="sl-ranking-banner-avatar" src="${evento.foto.replace(/"/g,"&quot;")}" alt=""/>` : `<div class="sl-ranking-banner-avatar sl-ranking-banner-fallback">${initials}</div>`
  banner.innerHTML = `${avatar}<div><small>${evento.rotulo}</small><strong>${evento.mensagem}</strong><p>${evento.pontos} pontos</p></div><div class="sl-ranking-banner-rank">${evento.posicao}º</div>`
  document.body.appendChild(banner)
  animar(banner,[{ opacity:0, transform:"translate3d(-50%,-20px,0) scale(.93)" },{ opacity:1, transform:"translate3d(-50%,3px,0) scale(1.015)", offset:.62 },{ opacity:1, transform:"translate3d(-50%,0,0) scale(1)" }], { duration:430, id:"sl-ranking-banner" })
  const av = banner.querySelector(".sl-ranking-banner-avatar")
  animar(av,[{ transform:"perspective(420px) rotateY(0deg) scale(.82)" },{ transform:"perspective(420px) rotateY(300deg) scale(1.08)", offset:.72 },{ transform:"perspective(420px) rotateY(360deg) scale(1)" }], { duration:980, delay:80, id:"sl-banner-avatar" })
  bannerTimer = setTimeout(() => { const a = animar(banner,[{opacity:1,transform:"translate3d(-50%,0,0)"},{opacity:0,transform:"translate3d(-50%,-12px,0) scale(.97)"}],{duration:250,id:"sl-banner-out"}); if (a) a.finished.finally(()=>banner.remove()); else banner.remove() }, 3200)
}

function compararRanking(entries) {
  if (!entries.length) return
  const previous = snapshotRanking(); salvarRanking(entries); if (!previous?.entries?.length) return
  const prevByName = new Map(previous.entries.map((e)=>[normalizar(e.nome).toLowerCase(),e])); const eu = normalizar(nomeAtual()).toLowerCase()
  const novoLider = entries[0], antigoLider = previous.entries[0]
  if (novoLider && antigoLider && normalizar(novoLider.nome).toLowerCase() !== normalizar(antigoLider.nome).toLowerCase()) { mostrarBanner({ ...novoLider, rotulo:"Novo líder", mensagem:`${novoLider.nome} chegou ao 1º lugar` }); return }
  if (eu) { const atualEu = entries.find((e)=>normalizar(e.nome).toLowerCase() === eu); const anteriorEu = prevByName.get(eu); if (atualEu && anteriorEu) { const passouVoce = entries.find((e) => { const prev = prevByName.get(normalizar(e.nome).toLowerCase()); return prev && prev.posicao > anteriorEu.posicao && e.posicao < atualEu.posicao }); if (passouVoce) { mostrarBanner({ ...passouVoce, rotulo:"Mudança no ranking", mensagem:`${passouVoce.nome} passou você` }); return } } }
  const entrouTop3 = entries.find((e) => e.posicao <= 3 && (prevByName.get(normalizar(e.nome).toLowerCase())?.posicao || 999) > 3)
  if (entrouTop3) { mostrarBanner({ ...entrouTop3, rotulo:"Entrou no Top 3", mensagem:`${entrouTop3.nome} agora está em ${entrouTop3.posicao}º` }); return }
  const subida = entries.map((e)=>({ atual:e, anterior:prevByName.get(normalizar(e.nome).toLowerCase()) })).filter((x)=>x.anterior && x.atual.posicao < x.anterior.posicao).sort((a,b)=>(b.anterior.posicao-b.atual.posicao)-(a.anterior.posicao-a.atual.posicao))[0]
  if (subida) mostrarBanner({ ...subida.atual, rotulo:"Subiu no ranking", mensagem:`${subida.atual.nome} subiu para o ${subida.atual.posicao}º lugar` })
}

function aplicarRanking() {
  const title = [...document.querySelectorAll("h1,h2,h3")].find((el)=>texto(el) === "Pódio da equipe")
  const secao = title?.closest("section")
  if (!secao || !visivel(secao)) { rankingVisivel = false; return }
  const grid = [...secao.querySelectorAll("div")].find((el)=>el.children.length >= 3 && [...el.children].slice(0,3).every((c)=>posicaoDoCard(c) > 0))
  if (!grid) return
  grid.classList.add("sl-podium-grid")
  const cards = [...grid.children].filter((el)=>posicaoDoCard(el)>0).slice(0,3)
  const signature = cards.map((c)=>`${posicaoDoCard(c)}:${nomeDoCard(c)}:${pontosDoCard(c)}`).join("|")
  const entrando = !rankingVisivel, mudou = rankingAssinatura && rankingAssinatura !== signature
  rankingAssinatura = signature
  cards.forEach((card,index)=>{
    const pos = posicaoDoCard(card); card.classList.add("sl-podium-card",`sl-podium-${pos}`)
    const badge = [...card.querySelectorAll("span,b,strong")].find((el)=>new RegExp(`^${pos}º$`).test(texto(el))); badge?.classList.add("sl-rank-badge")
    const avatar = avatarDoCard(card)
    if (avatar) { avatar.classList.add("sl-top-avatar",pos===1?"sl-gold":pos===2?"sl-silver":"sl-bronze"); if (entrando) animar(avatar,[{ transform:"perspective(560px) rotateY(0deg) scale(.86)", filter:"brightness(.82)" },{ transform:"perspective(560px) rotateY(292deg) scale(1.065)", filter:"brightness(1.08)", offset:.72 },{ transform:"perspective(560px) rotateY(360deg) scale(1)", filter:"none" }], { duration:1080, delay:index*120, id:`sl-avatar-spin-${pos}` }) }
    const points = [...card.querySelectorAll("p,strong,span")].find((el)=>/^\d{1,6}$/.test(texto(el)) && texto(el.parentElement).toLowerCase().includes("ponto"))
    if (points && (entrando || mudou)) animar(points,[{transform:"scale(.78)",opacity:.5},{transform:"scale(1.16)",opacity:1,offset:.65},{transform:"scale(1)",opacity:1}],{duration:400,delay:160+index*70,id:`sl-points-${pos}`})
    if (entrando) animar(card,[{opacity:0,transform:"translateY(16px) scale(.95)"},{opacity:1,transform:"translateY(0) scale(1)"}],{duration:460,delay:80+index*80,id:`sl-podium-card-${pos}`})
  })
  const header = title.parentElement
  if (header && !header.querySelector(".sl-trophy-3d")) { const oldIcon = [...header.querySelectorAll("svg")].find((svg)=>svg.getBoundingClientRect().width <= 32); if (oldIcon instanceof HTMLElement) oldIcon.style.display = "none"; header.appendChild(criarTrofeu3D()) }
  const entries = coletarRanking(secao,cards); if (entrando || mudou) compararRanking(entries); rankingVisivel = true
}

function aplicarInteracoes() {
  if (document.documentElement.dataset.slInteractionBound === PATCH_VERSION) return
  document.documentElement.dataset.slInteractionBound = PATCH_VERSION
  document.addEventListener("pointerdown", (event) => { const target = event.target instanceof Element ? event.target.closest("button,a[href],[role='button']") : null; if (target && visivel(target)) animar(target,[{transform:"scale(1)"},{transform:"scale(.965)"}],{duration:90,fill:"forwards",id:"sl-press"}) }, true)
  document.addEventListener("pointerup", (event) => { const target = event.target instanceof Element ? event.target.closest("button,a[href],[role='button']") : null; if (target && visivel(target)) animar(target,[{transform:"scale(.965)"},{transform:"scale(1.025)",offset:.62},{transform:"scale(1)"}],{duration:210,id:"sl-release"}) }, true)
  document.addEventListener("click", (event) => { const target = event.target instanceof Element ? event.target.closest("a[href],[role='tab'],button") : null; if (!target) return; if (target.matches("a[href]")) setTimeout(()=>{ logoAnimado=false; aplicarTudo(true) },40); if (target.matches('[role="tab"]')) setTimeout(()=>{ ultimoTabAtivo=""; aplicarTudo(false) },30) }, true)
  window.addEventListener("focus", ()=>agendar(false)); window.addEventListener("online", ()=>agendar(false))
  window.addEventListener("keydown", (event) => { if (event.ctrlKey && event.shiftKey && String(event.key).toLowerCase() === "a") { logoAnimado=false; rotaAtual=""; rankingVisivel=false; ultimoTabAtivo=""; aplicarTudo(true) } })
}

function aplicarTudo(force = false) { injetarEstilos(); animarEntradaPagina(force); animarLogo(force); animarCardsDaTela(); aplicarMenuModerador(); aplicarDialogs(); aplicarBottomNav(); aplicarTabs(); aplicarPresencasEFormacao(); aplicarRanking() }
function agendar(force = false) { if (framePendente) return; framePendente = true; requestAnimationFrame(()=>{ framePendente = false; aplicarTudo(force) }) }
function iniciar() {
  injetarEstilos(); aplicarInteracoes(); aplicarTudo(true); setTimeout(()=>aplicarTudo(false),220); setTimeout(()=>aplicarTudo(false),850)
  observer = new MutationObserver(()=>agendar(false)); observer.observe(document.documentElement,{ subtree:true, childList:true, attributes:true, attributeFilter:["data-state","aria-current","class","style"] })
  setInterval(()=>{ const route = `${location.pathname}${location.search}${location.hash}`; if (route !== rotaAtual) { logoAnimado=false; ultimoTabAtivo=""; rankingVisivel=false; agendar(true) } },300)
}
if (document.readyState === "loading") window.addEventListener("DOMContentLoaded",iniciar,{once:true}); else iniciar()
