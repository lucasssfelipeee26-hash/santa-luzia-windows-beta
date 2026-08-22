const assert = require("node:assert/strict")
const crypto = require("node:crypto")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const test = require("node:test")
const updater = require("./manifest-updater.cjs")

const repository = "lucasssfelipeee26-hash/santa-luzia-windows-beta"

function fixture(overrides = {}) {
  return {
    versionName: "0.1.0-beta.8",
    repository,
    setup: {
      file: "Santa-Luzia-Beta-Setup-0.1.0-beta.8-x64.exe",
      size: 20 * 1024 * 1024,
      sha256: "a".repeat(64),
    },
    ...overrides,
  }
}

test("compara versões beta pela ordem SemVer", () => {
  assert.equal(updater.compareVersions("0.1.0-beta.8", "0.1.0-beta.7"), 1)
  assert.equal(updater.compareVersions("0.1.0-beta.7", "0.1.0-beta.8"), -1)
  assert.equal(updater.compareVersions("0.1.0-beta.8", "0.1.0-beta.8"), 0)
  assert.equal(updater.compareVersions("0.1.0", "0.1.0-beta.99"), 1)
})

test("deriva URLs oficiais e valida o canal do manifesto", () => {
  const manifest = updater.validateManifest(fixture(), repository)
  assert.equal(updater.manifestUrl(repository), `https://raw.githubusercontent.com/${repository}/main/releases/windows-beta-latest.json`)
  assert.equal(updater.releaseSetupUrl(manifest), `https://github.com/${repository}/releases/download/windows-beta-v0.1.0-beta.8/Santa-Luzia-Beta-Setup-0.1.0-beta.8-x64.exe`)
  assert.throws(() => updater.validateManifest(fixture({ repository: "invasor/outro" }), repository), /canal Beta esperado/)
  assert.throws(() => updater.validateManifest(fixture({ setup: { ...fixture().setup, downloadUrl: "https://example.com/setup.exe" } }), repository), /release oficial/)
})

test("rejeita tamanho ou SHA-256 adulterados", async () => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), "santa-luzia-updater-"))
  const file = path.join(directory, "setup.exe")
  const content = Buffer.from("setup oficial de teste")
  await fs.promises.writeFile(file, content)
  const sha = crypto.createHash("sha256").update(content).digest("hex")
  await assert.doesNotReject(updater.validateSetup(file, content.length, sha))
  await assert.rejects(updater.validateSetup(file, content.length + 1, sha), /Tamanho/)
  await assert.rejects(updater.validateSetup(file, content.length, "0".repeat(64)), /SHA-256/)
  await fs.promises.rm(directory, { recursive: true, force: true })
})
