const assert = require("node:assert/strict")
const crypto = require("node:crypto")
const test = require("node:test")
const runtime = require("./remote-runtime-updater.cjs")

const repository = "lucasssfelipeee26-hash/santa-luzia-windows-beta"
const script = Buffer.from('"use strict";document.documentElement.dataset.windowsBetaRuntime="1";')
const manifest = {
  repository,
  revision: 1,
  script: {
    path: "runtime/windows-beta-runtime.js",
    size: script.length,
    sha256: crypto.createHash("sha256").update(script).digest("hex"),
  },
}

test("aceita somente o canal remoto oficial do Windows", () => {
  assert.equal(runtime.validateManifest(manifest, repository), manifest)
  assert.throws(() => runtime.validateManifest({ ...manifest, repository: "outro/repo" }, repository), /outro repositório/)
  assert.throws(() => runtime.validateManifest({ ...manifest, script: { ...manifest.script, path: "runtime/outro.js" } }, repository), /não autorizado/)
})

test("valida tamanho e SHA-256 antes de executar", () => {
  assert.equal(runtime.validateScript(script, manifest), script.toString("utf8"))
  assert.throws(() => runtime.validateScript(Buffer.concat([script, Buffer.from("x")]), manifest), /Tamanho/)
  assert.throws(() => runtime.validateScript(script, { ...manifest, script: { ...manifest.script, sha256: "0".repeat(64) } }), /SHA-256/)
})

test("usa URLs HTTPS fixas do repositório", () => {
  assert.match(runtime.manifestUrl(repository, 123), /^https:\/\/raw\.githubusercontent\.com\//)
  assert.equal(runtime.expectedScriptUrl(repository, manifest.script.path, 1), `https://raw.githubusercontent.com/${repository}/main/runtime/windows-beta-runtime.js?v=1`)
  assert.equal(runtime.githubRefUrl(repository), `https://api.github.com/repos/${repository}/git/ref/heads/main`)
  assert.equal(runtime.githubContentUrl(repository, manifest.script.path, "a".repeat(40)), `https://api.github.com/repos/${repository}/contents/runtime/windows-beta-runtime.js?ref=${"a".repeat(40)}`)
})

test("decodifica manifesto e runtime do mesmo commit do GitHub", () => {
  const payload = { type: "file", encoding: "base64", content: script.toString("base64") }
  assert.deepEqual(runtime.decodeGithubContent(payload, 1024, "Script remoto"), script)
  assert.throws(() => runtime.decodeGithubContent({ ...payload, encoding: "utf8" }, 1024, "Script remoto"), /arquivo íntegro/)
  assert.throws(() => runtime.decodeGithubContent(payload, 4, "Script remoto"), /limite/)
})
