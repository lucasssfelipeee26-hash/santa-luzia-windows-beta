const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const test = require("node:test")

const electronDir = __dirname
const polish = fs.readFileSync(path.join(electronDir, "beta7-polish.js"), "utf8")
const preload = fs.readFileSync(path.join(electronDir, "preload-v5.cjs"), "utf8")
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
  assert.equal(config.versionName, "0.1.0-beta.10")
})
