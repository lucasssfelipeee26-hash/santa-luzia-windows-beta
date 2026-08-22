"use strict"

// Santa Luzia Windows Beta — camada visual nativa de experimentação.
// Tudo neste arquivo é empacotado no EXE e só chega ao usuário por atualização
// nativa da Beta Windows. O Android code 18 permanece intocado até aprovação.
const PATCH_VERSION = "0.1.0-beta.3"
const RANKING_STORAGE = "santa-luzia:windows-beta:ranking-v3"
const HIDDEN_MODERATOR_SHORTCUTS = new Set([
  "Painel",
  "Jornada",
  "Quizzes",
  "Escala pública",
])

let rankingAtivo = false
let rankingSignature = ""
let ultimaRota = ""
let bannerTimer = null
let observer = null
let agendado = false

function normalizar(texto) {
  return String(texto || "").replace(/\s+/g, " ").trim()
}

function texto(el) {
  return normalizar(el?.textContent)
}

function reduzirMovimento() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches } catch { return false }
}

function injetarEstilos() {
  if (document.getElementById("sl-beta-motion-style")) return
  const style = document.createElement("style")
  style.id = "sl-beta-motion-style"
  style.textContent = `
    :root { --sl-motion-ease: cubic-bezier(.22,.8,.22,1); }

    @keyframes slPageEnter {
      0% { opacity: 0; transform: translate3d(0,8px,0) scale(.997); }
      60% { opacity: 1; }
      100% { opacity: 1; transform: translate3d(0,0,0) scale(1); }
    }
    @keyframes slLogoEntry {
      0% { transform: scale(.91) rotate(-3deg); filter: brightness(.92) saturate(.9); box-shadow: 0 0 0 0 rgba(212,175,55,0); }
      42% { transform: scale(1.055) rotate(1.5deg); filter: brightness(1.08) saturate(1.08); box-shadow: 0 0 0 8px rgba(212,175,55,.16); }
      72% { transform: scale(.99) rotate(-.4deg); box-shadow: 0 0 0 4px rgba(212,175,55,.09); }
      100% { transform: scale(1) rotate(0); filter: none; box-shadow: 0 2px 8px rgba(95,16,32,.12); }
    }
    @keyframes slCardReveal {
      0% { opacity: 0; transform: translate3d(0,7px,0) scale(.99); }
      100% { opacity: 1; transform: translate3d(0,0,0) scale(1); }
    }
    @keyframes slDialogEnter {
      0% { opacity: 0; transform: translate(-50%,-48%) scale(.965); }
      100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
    }
    @keyframes slTabPanelEnter {
      0% { opacity: .15; transform: translate3d(0,5px,0); }
      100% { opacity: 1; transform: translate3d(0,0,0); }
    }
    @keyframes slAvatarTurn {
      0% { transform: perspective(500px) rotateY(-180deg) scale(.86); filter: brightness(.82); }
      54% { transform: perspective(500px) rotateY(18deg) scale(1.06); filter: brightness(1.08); }
      78% { transform: perspective(500px) rotateY(-5deg) scale(.99); }
      100% { transform: perspective(500px) rotateY(0) scale(1); filter: none; }
    }
    @keyframes slHaloSpin { to { transform: rotate(360deg); } }
    @keyframes slTrophyFloat {
      0%,100% { transform: perspective(500px) rotateY(-7deg) rotateX(2deg) translateY(0); }
      50% { transform: perspective(500px) rotateY(8deg) rotateX(-2deg) translateY(-3px); }
    }
    @keyframes slTrophyShine {
      0% { transform: translateX(-150%) skewX(-18deg); opacity: 0; }
      18% { opacity: .75; }
      42%,100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
    }
    @keyframes slScorePop {
      0% { transform: scale(.84); opacity: .55; }
      62% { transform: scale(1.14); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes slBannerIn {
      0% { opacity: 0; transform: translate3d(-50%,-18px,0) scale(.94); }
      58% { opacity: 1; transform: translate3d(-50%,3px,0) scale(1.015); }
      100% { opacity: 1; transform: translate3d(-50%,0,0) scale(1); }
    }
    @keyframes slBannerOut {
      to { opacity: 0; transform: translate3d(-50%,-12px,0) scale(.97); }
    }
    @keyframes slBannerAvatar {
      0% { transform: perspective(420px) rotateY(-180deg) scale(.82); }
      68% { transform: perspective(420px) rotateY(16deg) scale(1.08); }
      100% { transform: perspective(420px) rotateY(0) scale(1); }
    }
    @keyframes slActiveGlow {
      0%,100% { box-shadow: 0 6px 16px rgba(123,19,38,.18); }
      50% { box-shadow: 0 7px 22px rgba(123,19,38,.30); }
    }

    main.sl-page-enter { animation: slPageEnter 300ms var(--sl-motion-ease) both; will-change: transform,opacity; }
    .sl-logo-entry { animation: slLogoEntry 820ms var(--sl-motion-ease) both !important; transform-origin: center; }
    .sl-card-reveal { animation: slCardReveal 300ms var(--sl-motion-ease) both; animation-delay: var(--sl-delay,0ms); }
    .app-nav-panel.sl-dialog-enter { animation: slDialogEnter 260ms var(--sl-motion-ease) both; }
    [role="tabpanel"].sl-tab-panel-enter { animation: slTabPanelEnter 240ms var(--sl-motion-ease) both; }

    :where(button,a[href],[role="button"]) { -webkit-tap-highlight-color: transparent; }
    :where(button,a[href],[role="button"]):active { transform: scale(.975); transition-duration: 80ms !important; }

    .mobile-app-bottom-nav a > span { transition: transform 220ms var(--sl-motion-ease), box-shadow 220ms ease, background-color 180ms ease !important; }
    .mobile-app-bottom-nav a[aria-current="page"] > span {
      transform: translateY(-3px) scale(1.055);
      animation: slActiveGlow 2.4s ease-in-out infinite;
    }

    .sl-podium-grid { perspective: 900px; }
    .sl-podium-card {
      isolation: isolate;
      overflow: visible !important;
      transition: transform 260ms var(--sl-motion-ease), box-shadow 260ms ease, border-color 260ms ease !important;
    }
    .sl-podium-card:hover { transform: translateY(-3px) scale(1.012); }
    .sl-podium-1 { order: 2 !important; min-height: 178px; border-color: rgba(194,153,45,.52) !important; box-shadow: 0 14px 34px rgba(154,118,32,.15) !important; }
    .sl-podium-2 { order: 1 !important; border-color: rgba(146,154,164,.48) !important; }
    .sl-podium-3 { order: 3 !important; border-color: rgba(176,111,65,.46) !important; }
    .sl-rank-badge { min-width: 31px; min-height: 25px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px !important; letter-spacing: -.02em; box-shadow: 0 4px 12px rgba(44,31,24,.12); }
    .sl-podium-1 .sl-rank-badge { min-width: 38px; min-height: 30px; font-size: 16px !important; background: linear-gradient(145deg,#f7dc79,#b88920) !important; color:#3c2a0a !important; }
    .sl-podium-2 .sl-rank-badge { background: linear-gradient(145deg,#eef1f3,#9ba3aa) !important; color:#32383d !important; }
    .sl-podium-3 .sl-rank-badge { background: linear-gradient(145deg,#e8b080,#a9653d) !important; color:#402315 !important; }

    .sl-top-avatar {
      position: relative !important;
      overflow: visible !important;
      transform-style: preserve-3d;
      z-index: 2;
      box-shadow: 0 6px 17px rgba(44,25,22,.15) !important;
    }
    .sl-top-avatar > img, .sl-top-avatar > [data-slot="avatar-fallback"] { border-radius: 9999px; clip-path: circle(50%); }
    .sl-top-avatar::before {
      content: "";
      position: absolute;
      inset: -7px;
      border-radius: 9999px;
      padding: 3px;
      background: conic-gradient(from 0deg,var(--sl-halo-a),var(--sl-halo-b),#fff7c6,var(--sl-halo-a),var(--sl-halo-b),var(--sl-halo-a));
      -webkit-mask: linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      filter: drop-shadow(0 0 6px var(--sl-halo-glow));
      animation: slHaloSpin 2.6s linear infinite;
      pointer-events: none;
    }
    .sl-gold { --sl-halo-a:#8f6511; --sl-halo-b:#ffd96a; --sl-halo-glow:rgba(224,174,42,.72); }
    .sl-silver { --sl-halo-a:#76818b; --sl-halo-b:#e9eef2; --sl-halo-glow:rgba(167,181,193,.68); }
    .sl-bronze { --sl-halo-a:#8b4e2f; --sl-halo-b:#e1a273; --sl-halo-glow:rgba(188,112,68,.64); }
    .sl-avatar-spin { animation: slAvatarTurn 980ms cubic-bezier(.18,.82,.25,1) both !important; animation-delay: var(--sl-spin-delay,0ms) !important; }

    .sl-points-pop { animation: slScorePop 380ms var(--sl-motion-ease) both; }

    .sl-trophy-3d {
      position: relative;
      width: 58px;
      height: 58px;
      flex: 0 0 auto;
      filter: drop-shadow(0 9px 10px rgba(111,76,17,.25));
      animation: slTrophyFloat 3.2s ease-in-out infinite;
      transform-style: preserve-3d;
      overflow: hidden;
      border-radius: 18px;
    }
    .sl-trophy-3d svg { width: 100%; height: 100%; display:block; }
    .sl-trophy-3d::after {
      content:"";
      position:absolute;
      inset:-15% auto -15% -40%;
      width:26%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
      animation:slTrophyShine 3.8s ease-in-out infinite;
      pointer-events:none;
    }

    .sl-ranking-banner {
      --sl-banner-accent:#c59a35;
      position: fixed;
      left: 50%;
      top: max(16px,env(safe-area-inset-top));
      z-index: 190;
      width: min(368px,calc(100vw - 24px));
      display: grid;
      grid-template-columns: 54px minmax(0,1fr) auto;
      align-items:center;
      gap:10px;
      padding:10px 12px;
      border:1px solid color-mix(in srgb,var(--sl-banner-accent) 55%,white);
      border-radius:22px;
      background:rgba(255,253,249,.97);
      box-shadow:0 18px 50px rgba(54,30,25,.20), inset 0 0 0 1px rgba(255,255,255,.72);
      backdrop-filter:blur(18px);
      transform:translateX(-50%);
      animation:slBannerIn 430ms var(--sl-motion-ease) both;
    }
    .sl-ranking-banner.sl-out { animation:slBannerOut 250ms ease forwards; }
    .sl-ranking-banner-avatar {
      width:48px;height:48px;border-radius:9999px;object-fit:cover;
      border:3px solid var(--sl-banner-accent);
      box-shadow:0 0 0 4px color-mix(in srgb,var(--sl-banner-accent) 18%,transparent);
      animation:slBannerAvatar 850ms var(--sl-motion-ease) both;
    }
    .sl-ranking-banner-fallback {
      display:flex;align-items:center;justify-content:center;font-weight:900;color:#671526;
      background:#fff6eb;
    }
    .sl-ranking-banner small { display:block;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--sl-banner-accent); }
    .sl-ranking-banner strong { display:block;margin-top:2px;font-size:13px;line-height:1.25;color:#351f23; }
    .sl-ranking-banner p { margin:2px 0 0;font-size:10px;color:#75666a; }
    .sl-ranking-banner-rank { min-width:42px;text-align:center;font-size:18px;font-weight:1000;color:var(--sl-banner-accent); }

    @media (prefers-reduced-motion: reduce) {
      *,*::before,*::after { animation-duration:.001ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; }
      .mobile-app-bottom-nav a[aria-current="page"] > span { transform:none; }
    }
  `
  document.head.appendChild(style)
}

function reiniciarAnimacao(elemento, classe, duracao = 1100) {
  if (!elemento || reduzirMovimento()) return
  elemento.classList.remove(classe)
  void elemento.offsetWidth
  elemento.classList.add(classe)
  window.setTimeout(() => elemento.classList.remove(classe), duracao)
}

function animarLogo() {
  const logo = document.querySelector('img[alt="Santa Luzia"]')
  const moldura = logo?.parentElement
  if (!moldura) return
  reiniciarAnimacao(moldura, "sl-logo-entry", 1000)
}

function animarRota() {
  const rota = `${location.pathname}${location.search}`
  const main = document.querySelector("main")
  if (!main) return
  if (rota === ultimaRota && main.dataset.slRouteAnimated === PATCH_VERSION) return
  ultimaRota = rota
  main.dataset.slRouteAnimated = PATCH_VERSION
  reiniciarAnimacao(main, "sl-page-enter", 430)
}

function aplicarMicroanimacoes() {
  const main = document.querySelector("main")
  if (main) {
    const candidatos = [
      ...main.querySelectorAll(":scope > section"),
      ...main.querySelectorAll('[role="tabpanel"][data-state="active"] > section'),
    ]
    candidatos.slice(0, 14).forEach((el, indice) => {
      if (el.dataset.slReveal === PATCH_VERSION) return
      el.dataset.slReveal = PATCH_VERSION
      el.style.setProperty("--sl-delay", `${Math.min(indice * 38, 190)}ms`)
      el.classList.add("sl-card-reveal")
    })
  }

  document.querySelectorAll('.app-nav-panel:not([data-sl-motion])').forEach((painel) => {
    painel.dataset.slMotion = PATCH_VERSION
    painel.classList.add("sl-dialog-enter")
  })

  document.querySelectorAll('[role="tabpanel"][data-state="active"]').forEach((painel) => {
    if (painel.dataset.slTabMotion === PATCH_VERSION) return
    painel.dataset.slTabMotion = PATCH_VERSION
    reiniciarAnimacao(painel, "sl-tab-panel-enter", 360)
  })
}

function aplicarNavegacaoModerador() {
  document.querySelectorAll('nav[aria-label="Menu da Área Restrita"]').forEach((painel) => {
    const atalhos = [...painel.querySelectorAll("a.app-nav-tile")]
    const labels = atalhos.map((atalho) => texto(atalho))
    const menuModerador = labels.includes("Presenças") && labels.includes("Registro") && labels.includes("Cores")
    if (!menuModerador) return

    const grid = painel.querySelector(".app-nav-grid")
    if (grid) {
      grid.dataset.windowsBetaPatch = PATCH_VERSION
      grid.style.setProperty("grid-template-columns", "repeat(3, minmax(0, 1fr))", "important")
    }

    atalhos.forEach((atalho) => {
      const label = texto(atalho)
      if (!HIDDEN_MODERATOR_SHORTCUTS.has(label)) return
      atalho.dataset.windowsBetaHidden = PATCH_VERSION
      atalho.setAttribute("aria-hidden", "true")
      atalho.setAttribute("tabindex", "-1")
      atalho.style.setProperty("display", "none", "important")
    })
  })
}

function classeMedalha(posicao) {
  if (posicao === 1) return "sl-gold"
  if (posicao === 2) return "sl-silver"
  return "sl-bronze"
}

function corMedalha(posicao) {
  if (posicao === 1) return "#c79a2c"
  if (posicao === 2) return "#929da6"
  if (posicao === 3) return "#ad6945"
  return "#7b1326"
}

function avatarDoCard(card) {
  const img = card?.querySelector("img")
  if (img?.parentElement) return img.parentElement
  return card?.querySelector('[class*="rounded-full"][class*="overflow-hidden"]') || null
}

function inserirTrofeu3d(secao) {
  const cabecalho = secao?.querySelector(":scope > div")
  if (!cabecalho || cabecalho.querySelector(".sl-trophy-3d")) return

  const icones = [...cabecalho.querySelectorAll("svg")]
  const iconeOriginal = icones[icones.length - 1]
  if (iconeOriginal) iconeOriginal.style.display = "none"

  const trofeu = document.createElement("div")
  trofeu.className = "sl-trophy-3d"
  trofeu.setAttribute("aria-label", "Troféu do pódio")
  trofeu.innerHTML = `
    <svg viewBox="0 0 72 72" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="slGoldCup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff1a4"/><stop offset=".28" stop-color="#e2b53d"/><stop offset=".56" stop-color="#9f6c12"/><stop offset=".78" stop-color="#f4d267"/><stop offset="1" stop-color="#7c4e09"/>
        </linearGradient>
        <linearGradient id="slGoldStem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f6d86e"/><stop offset="1" stop-color="#8d590d"/>
        </linearGradient>
        <radialGradient id="slCupGlow" cx="38%" cy="24%" r="70%"><stop offset="0" stop-color="#fffbd6" stop-opacity=".92"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      </defs>
      <rect x="3" y="3" width="66" height="66" rx="19" fill="#fff9e8" stroke="#d9b64f" stroke-opacity=".45"/>
      <path d="M20 18h32v9c0 12-6.6 20-16 20S20 39 20 27v-9Z" fill="url(#slGoldCup)" stroke="#825108" stroke-width="1.3"/>
      <path d="M20 23H12v5c0 9 5.2 14 13.5 14" fill="none" stroke="#c58e24" stroke-width="5" stroke-linecap="round"/>
      <path d="M52 23h8v5c0 9-5.2 14-13.5 14" fill="none" stroke="#c58e24" stroke-width="5" stroke-linecap="round"/>
      <path d="M33 46h6v10h-6z" fill="url(#slGoldStem)"/>
      <path d="M25 61c1-5 5-7 11-7s10 2 11 7H25Z" fill="url(#slGoldCup)" stroke="#825108" stroke-width="1"/>
      <ellipse cx="31" cy="27" rx="10" ry="8" fill="url(#slCupGlow)"/>
      <path d="M31 21c4 1 8 0 13-2" stroke="#fff7c4" stroke-width="2" stroke-linecap="round" opacity=".75"/>
    </svg>`
  cabecalho.appendChild(trofeu)
}

function parsePosicao(card) {
  const match = texto(card).match(/\b(\d+)º/)
  return match ? Number(match[1]) : 0
}

function parsePontos(card) {
  const strong = card?.querySelector("strong")
  if (strong && /^\d+$/.test(texto(strong))) return Number(texto(strong))
  const match = texto(card).match(/(\d+)\s*pontos?/i)
  return match ? Number(match[1]) : 0
}

function parseNome(card) {
  const serif = card?.querySelector("p.font-serif")
  if (serif) return texto(serif)
  const ps = [...(card?.querySelectorAll("p") || [])]
  const candidato = ps.find((p) => {
    const t = texto(p)
    return t && !/pontos|quiz|participante|acólito|coroinha|moderador/i.test(t)
  })
  return texto(candidato)
}

function parseAvatar(card) {
  return card?.querySelector("img")?.getAttribute("src") || ""
}

function coletarRanking(secao) {
  const grid = secao?.querySelector(".sl-podium-grid") || secao?.querySelector(".grid.grid-cols-3")
  const resultado = []
  if (grid) {
    ;[...grid.children].forEach((card) => {
      const posicao = parsePosicao(card)
      const nome = parseNome(card)
      if (!posicao || !nome) return
      resultado.push({ posicao, nome, pontos: parsePontos(card), avatar: parseAvatar(card) })
    })
  }

  const restantes = secao?.nextElementSibling
  if (restantes) {
    ;[...restantes.children].forEach((row) => {
      const posicao = parsePosicao(row)
      const nome = parseNome(row)
      if (!posicao || !nome || resultado.some((r) => r.posicao === posicao && r.nome === nome)) return
      resultado.push({ posicao, nome, pontos: parsePontos(row), avatar: parseAvatar(row) })
    })
  }
  return resultado.sort((a,b) => a.posicao - b.posicao)
}

function nomeUsuarioAtual(secao) {
  let anterior = secao?.previousElementSibling
  while (anterior) {
    if (/Sua posição/i.test(texto(anterior))) {
      const ps = [...anterior.querySelectorAll("p")]
      const nome = ps.find((p) => {
        const t = texto(p)
        return t && !/Sua posição|pontos/i.test(t)
      })
      return texto(nome)
    }
    anterior = anterior.previousElementSibling
  }
  return ""
}

function mostrarBanner(evento) {
  document.querySelectorAll(".sl-ranking-banner").forEach((el) => el.remove())
  if (bannerTimer) window.clearTimeout(bannerTimer)

  const banner = document.createElement("div")
  banner.className = "sl-ranking-banner"
  banner.style.setProperty("--sl-banner-accent", corMedalha(evento.posicao))
  banner.setAttribute("role", "status")
  banner.setAttribute("aria-live", "polite")

  const avatar = evento.avatar
    ? `<img class="sl-ranking-banner-avatar" src="${String(evento.avatar).replace(/"/g,"&quot;")}" alt="" />`
    : `<div class="sl-ranking-banner-avatar sl-ranking-banner-fallback">${normalizar(evento.nome).slice(0,1).toUpperCase()}</div>`

  banner.innerHTML = `
    ${avatar}
    <div><small>${evento.rotulo}</small><strong>${evento.mensagem}</strong><p>${evento.pontos} pontos</p></div>
    <div class="sl-ranking-banner-rank">${evento.posicao}º</div>`
  document.body.appendChild(banner)

  bannerTimer = window.setTimeout(() => {
    banner.classList.add("sl-out")
    window.setTimeout(() => banner.remove(), 280)
  }, 4400)
}

function compararRanking(atual, usuarioAtual) {
  const assinatura = JSON.stringify(atual.map((r) => [r.posicao,r.nome,r.pontos]))
  if (!atual.length || assinatura === rankingSignature) return
  rankingSignature = assinatura

  let anterior = null
  try { anterior = JSON.parse(localStorage.getItem(RANKING_STORAGE) || "null") } catch {}
  try { localStorage.setItem(RANKING_STORAGE, JSON.stringify({ em:Date.now(), ranking:atual })) } catch {}
  if (!anterior?.ranking?.length || Date.now() - Number(anterior.em || 0) > 3 * 24 * 60 * 60 * 1000) return

  const antes = new Map(anterior.ranking.map((r) => [r.nome,r]))
  const agora = new Map(atual.map((r) => [r.nome,r]))
  const liderAntes = anterior.ranking.find((r) => r.posicao === 1)
  const liderAgora = atual.find((r) => r.posicao === 1)

  if (liderAntes && liderAgora && liderAntes.nome !== liderAgora.nome) {
    mostrarBanner({ ...liderAgora, rotulo:"Novo líder", mensagem:`${liderAgora.nome} assumiu o 1º lugar!` })
    return
  }

  if (usuarioAtual) {
    const euAntes = antes.get(usuarioAtual)
    const euAgora = agora.get(usuarioAtual)
    if (euAntes && euAgora) {
      const ultrapassouVoce = atual.find((r) => {
        const velho = antes.get(r.nome)
        return r.nome !== usuarioAtual && velho && velho.posicao > euAntes.posicao && r.posicao < euAgora.posicao
      })
      if (ultrapassouVoce) {
        mostrarBanner({ ...ultrapassouVoce, rotulo:"Mudança no ranking", mensagem:`${ultrapassouVoce.nome} passou você` })
        return
      }
      if (euAgora.posicao < euAntes.posicao) {
        mostrarBanner({ ...euAgora, rotulo:"Você subiu", mensagem:`Você avançou para o ${euAgora.posicao}º lugar!` })
        return
      }
    }
  }

  const entrouTop3 = atual.find((r) => {
    const velho = antes.get(r.nome)
    return r.posicao <= 3 && velho && velho.posicao > 3
  })
  if (entrouTop3) {
    mostrarBanner({ ...entrouTop3, rotulo:"Top 3", mensagem:`${entrouTop3.nome} entrou no Top 3!` })
    return
  }

  const maiorSubida = atual
    .map((r) => ({ atual:r, velho:antes.get(r.nome) }))
    .filter((x) => x.velho && x.atual.posicao < x.velho.posicao)
    .sort((a,b) => (b.velho.posicao - b.atual.posicao) - (a.velho.posicao - a.atual.posicao))[0]
  if (maiorSubida) {
    const r = maiorSubida.atual
    mostrarBanner({ ...r, rotulo:"Subiu no ranking", mensagem:`${r.nome} subiu para o ${r.posicao}º lugar` })
  }
}

function aplicarRanking() {
  const titulo = [...document.querySelectorAll("h1,h2")].find((el) => texto(el) === "Pódio da equipe")
  const secao = titulo?.closest("section") || null
  const visivel = Boolean(secao && secao.offsetParent !== null)
  if (!visivel) {
    rankingAtivo = false
    return
  }

  inserirTrofeu3d(secao)
  const grid = secao.querySelector(".grid.grid-cols-3")
  if (!grid) return
  grid.classList.add("sl-podium-grid")

  const cards = [...grid.children]
  cards.forEach((card) => {
    const posicao = parsePosicao(card)
    if (posicao < 1 || posicao > 3) return
    card.classList.add("sl-podium-card", `sl-podium-${posicao}`)
    const badge = [...card.querySelectorAll("span")].find((el) => new RegExp(`^${posicao}º$`).test(texto(el)))
    badge?.classList.add("sl-rank-badge")

    const avatar = avatarDoCard(card)
    if (avatar) {
      avatar.classList.add("sl-top-avatar", classeMedalha(posicao))
      avatar.style.setProperty("--sl-spin-delay", `${(posicao - 1) * 85}ms`)
      if (!rankingAtivo) reiniciarAnimacao(avatar, "sl-avatar-spin", 1250)
    }

    const pontos = [...card.querySelectorAll("p,strong")].find((el) => /^(\d+)$/.test(texto(el)))
    if (pontos) {
      const valor = texto(pontos)
      if (pontos.dataset.slPoints !== valor) {
        if (pontos.dataset.slPoints) reiniciarAnimacao(pontos, "sl-points-pop", 520)
        pontos.dataset.slPoints = valor
      }
    }
  })

  const ranking = coletarRanking(secao)
  compararRanking(ranking, nomeUsuarioAtual(secao))
  rankingAtivo = true
}

function aplicarTudo() {
  injetarEstilos()
  animarRota()
  aplicarMicroanimacoes()
  aplicarNavegacaoModerador()
  aplicarRanking()
}

function agendar() {
  if (agendado) return
  agendado = true
  window.requestAnimationFrame(() => {
    agendado = false
    aplicarTudo()
  })
}

function iniciar() {
  injetarEstilos()
  ultimaRota = ""
  aplicarTudo()
  window.setTimeout(animarLogo, 80)

  window.addEventListener("santa-luzia:manual-sync", () => {
    window.setTimeout(() => {
      animarLogo()
      rankingAtivo = false
      agendar()
    }, 60)
  })

  window.addEventListener("popstate", () => window.setTimeout(agendar, 0))
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null
    if (link) window.setTimeout(agendar, 0)
  }, true)

  observer = new MutationObserver(agendar)
  observer.observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:["data-state","aria-current","class"] })

  window.setInterval(() => {
    const rota = `${location.pathname}${location.search}`
    if (rota !== ultimaRota) agendar()
  }, 350)
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciar, { once:true })
} else {
  iniciar()
}
