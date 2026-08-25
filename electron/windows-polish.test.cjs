const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const test = require("node:test")

const electronDir = __dirname
const polish = fs.readFileSync(path.join(electronDir, "beta7-polish.js"), "utf8")
const preload = fs.readFileSync(path.join(electronDir, "preload-v5.cjs"), "utf8")
const behavior = fs.readFileSync(path.join(electronDir, "behavior-fixes.js"), "utf8")
const config = JSON.parse(fs.readFileSync(path.join(electronDir, "..", "config", "windows-beta.json"), "utf8"))

test("mantém a barra inferior com a geometria original do Android", () => {
  assert.doesNotMatch(polish, /\.mobile-app-bottom-nav\s*\{[^}]*position:/)
  assert.doesNotMatch(polish, /\.mobile-app-bottom-nav a\[aria-current="page"\][^{]*\{[^}]*transform:/)
  assert.doesNotMatch(preload, /\.mobile-app-bottom-nav a\[aria-current="page"\][^{]*\{[^}]*transform:/)
  assert.match(polish, /restoreAndroidBottomNav/)
})

test("usa somente um troféu sem estrela central", () => {
  assert.doesNotMatch(polish, /id="b7Medal"|M46 27\.4l2\.2 4\.5/)
  assert.match(polish, /originalIcon\.replaceWith\(trophy\)/)
  assert.doesNotMatch(preload, /header\.appendChild\(criarTrofeu3D\(\)\)/)
})

test("isola a presença semanal pelo usuário autenticado", () => {
  assert.match(polish, /PRESENCE_KEY_PREFIX/)
  assert.match(polish, /encodeURIComponent\(String\(userId/)
  assert.match(polish, /user\.tipo === "moderador" \|\| user\.funcao === "Acólito" \|\| user\.funcao === "Coroinha"/)
  assert.match(polish, /visível somente nesta conta/)
})

test("preserva o snapshot estável do Android", () => {
  assert.equal(config.androidBaseCommit, "e4be377dd6b59505b9fd7e8e9e3fd92caf3c7b77")
  assert.equal(config.channel, "windows-beta")
  assert.equal(config.updateRepository, "lucasssfelipeee26-hash/santa-luzia-windows-beta")
  assert.match(config.versionName, /^0\.1\.0-beta\.\d+$/)
})

test("mantém o Quiz na sessão ativa e limita a transição visual", () => {
  const runtime = fs.readFileSync(path.join(electronDir, "..", "runtime", "windows-beta-runtime.js"), "utf8")
  assert.match(runtime, /coverRouteTransition/)
  assert.doesNotMatch(runtime, /contentChanged/)
  assert.match(runtime, /duration:420/)
  assert.doesNotMatch(runtime, /href\.startsWith\("\/area-restrita\/ranking"\)[\s\S]{0,260}location\.assign/)
  assert.doesNotMatch(behavior, /location\.assign/)
  assert.match(runtime, /data-sl-nav-motion/)
  assert.match(runtime, /ensureQuizVisible/)
  assert.match(runtime, /removeLateArrivalBanner/)
  assert.match(runtime, /sl-r13-native-clock/)
  assert.match(runtime, /slR13Presence/)
  assert.match(runtime, /slR13Record/)
})

test("não oculta os contêineres completos do Quiz ao remover textos redundantes", () => {
  const runtime = fs.readFileSync(path.join(electronDir, "..", "runtime", "windows-beta-runtime.js"), "utf8")
  assert.match(runtime, /querySelectorAll\("\.sl-r7-copy-removed"\)/)
  assert.match(runtime, /querySelectorAll\("p,small"\)/)
  assert.doesNotMatch(runtime, /querySelectorAll\("p,small,span,div"\)/)
  assert.doesNotMatch(runtime, /element\.closest\("\.flex[^\n]+sl-r7-copy-removed/)
})
