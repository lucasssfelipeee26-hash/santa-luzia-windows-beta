const crypto = require("node:crypto")
const fs = require("node:fs")
const https = require("node:https")
const path = require("node:path")

const MAX_REDIRECTS = 5
const REQUEST_TIMEOUT_MS = 30_000

function parseVersion(value) {
  const match = String(value || "").trim().match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/)
  if (!match) throw new Error(`Versão inválida: ${value}`)
  return {
    core: match.slice(1, 4).map(Number),
    prerelease: match[4] ? match[4].split(".") : [],
  }
}

function compareVersions(left, right) {
  const a = parseVersion(left)
  const b = parseVersion(right)
  for (let index = 0; index < 3; index += 1) {
    if (a.core[index] !== b.core[index]) return a.core[index] > b.core[index] ? 1 : -1
  }
  if (!a.prerelease.length || !b.prerelease.length) {
    if (a.prerelease.length === b.prerelease.length) return 0
    return a.prerelease.length ? -1 : 1
  }
  const length = Math.max(a.prerelease.length, b.prerelease.length)
  for (let index = 0; index < length; index += 1) {
    const av = a.prerelease[index]
    const bv = b.prerelease[index]
    if (av === undefined || bv === undefined) return av === undefined ? -1 : 1
    if (av === bv) continue
    const an = /^\d+$/.test(av)
    const bn = /^\d+$/.test(bv)
    if (an && bn) return Number(av) > Number(bv) ? 1 : -1
    if (an !== bn) return an ? -1 : 1
    return av > bv ? 1 : -1
  }
  return 0
}

function manifestUrl(repository) {
  return `https://raw.githubusercontent.com/${repository}/main/releases/windows-beta-latest.json`
}

function releaseSetupUrl(manifest) {
  const repository = String(manifest.repository || "")
  const version = String(manifest.versionName || "")
  const file = path.basename(String(manifest.setup?.file || ""))
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("Repositório inválido no manifesto.")
  parseVersion(version)
  if (!file || !file.toLowerCase().endsWith(".exe")) throw new Error("Setup inválido no manifesto.")
  const expected = `https://github.com/${repository}/releases/download/windows-beta-v${encodeURIComponent(version)}/${encodeURIComponent(file)}`
  if (manifest.setup.downloadUrl && manifest.setup.downloadUrl !== expected) throw new Error("URL do Setup não corresponde à release oficial esperada.")
  return expected
}

function validateManifest(manifest, expectedRepository) {
  if (!manifest || manifest.repository !== expectedRepository) throw new Error("O manifesto não pertence ao canal Beta esperado.")
  parseVersion(manifest.versionName)
  if (!manifest.setup || !Number.isSafeInteger(manifest.setup.size) || manifest.setup.size < 20 * 1024 * 1024) {
    throw new Error("Tamanho do Setup ausente ou inválido no manifesto.")
  }
  if (!/^[a-f0-9]{64}$/i.test(String(manifest.setup.sha256 || ""))) throw new Error("SHA-256 inválido no manifesto.")
  releaseSetupUrl(manifest)
  return manifest
}

function request(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > MAX_REDIRECTS) return reject(new Error("Muitos redirecionamentos ao consultar o GitHub."))
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return reject(new Error("A atualização exige HTTPS."))
    const req = https.get(parsed, { headers: { "User-Agent": "SantaLuziaWindowsBeta-Updater/1", Accept: "application/json, application/octet-stream" } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume()
        return resolve(request(new URL(response.headers.location, parsed).toString(), redirects + 1))
      }
      if (response.statusCode !== 200) {
        response.resume()
        return reject(new Error(`GitHub respondeu HTTP ${response.statusCode}.`))
      }
      resolve(response)
    })
    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error("Tempo esgotado ao consultar o GitHub.")))
    req.on("error", reject)
  })
}

async function fetchManifest(repository) {
  const response = await request(manifestUrl(repository))
  const chunks = []
  let size = 0
  for await (const chunk of response) {
    size += chunk.length
    if (size > 1024 * 1024) throw new Error("Manifesto maior que o limite permitido.")
    chunks.push(chunk)
  }
  return validateManifest(JSON.parse(Buffer.concat(chunks).toString("utf8")), repository)
}

async function validateSetup(filePath, expectedSize, expectedSha256) {
  const stats = await fs.promises.stat(filePath)
  if (stats.size !== expectedSize) throw new Error(`Tamanho do Setup divergente: esperado ${expectedSize}, recebido ${stats.size}.`)
  const hash = crypto.createHash("sha256")
  const input = fs.createReadStream(filePath)
  for await (const chunk of input) hash.update(chunk)
  const actual = hash.digest("hex")
  if (actual.toLowerCase() !== expectedSha256.toLowerCase()) throw new Error(`SHA-256 do Setup divergente: ${actual}.`)
  return { size: stats.size, sha256: actual }
}

async function downloadValidatedSetup(manifest, destination, onProgress = () => {}) {
  const response = await request(releaseSetupUrl(manifest))
  const expectedSize = manifest.setup.size
  let received = 0
  const hash = crypto.createHash("sha256")
  const output = fs.createWriteStream(destination, { flags: "wx" })
  try {
    for await (const chunk of response) {
      received += chunk.length
      if (received > expectedSize) throw new Error("O Setup recebido excede o tamanho declarado no manifesto.")
      hash.update(chunk)
      if (!output.write(chunk)) await new Promise((resolve) => output.once("drain", resolve))
      onProgress(received / expectedSize)
    }
    await new Promise((resolve, reject) => output.end((error) => error ? reject(error) : resolve()))
    if (received !== expectedSize) throw new Error(`Download incompleto: esperado ${expectedSize}, recebido ${received}.`)
    const actual = hash.digest("hex")
    if (actual.toLowerCase() !== manifest.setup.sha256.toLowerCase()) throw new Error(`SHA-256 do Setup divergente: ${actual}.`)
    return destination
  } catch (error) {
    output.destroy()
    await fs.promises.rm(destination, { force: true }).catch(() => {})
    throw error
  }
}

module.exports = {
  compareVersions,
  downloadValidatedSetup,
  fetchManifest,
  manifestUrl,
  releaseSetupUrl,
  validateManifest,
  validateSetup,
}
