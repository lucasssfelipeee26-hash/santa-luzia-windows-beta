const crypto = require("node:crypto")
const https = require("node:https")

const MAX_REDIRECTS = 5
const MAX_MANIFEST_BYTES = 128 * 1024
const MAX_SCRIPT_BYTES = 1024 * 1024
const REQUEST_TIMEOUT_MS = 30_000

function request(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > MAX_REDIRECTS) return reject(new Error("Muitos redirecionamentos no canal remoto."))
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return reject(new Error("O canal remoto exige HTTPS."))
    const req = https.get(parsed, { headers: { "User-Agent": "SantaLuziaWindowsBeta-Runtime/1", Accept: "application/json, text/javascript" } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume()
        return resolve(request(new URL(response.headers.location, parsed).toString(), redirects + 1))
      }
      if (response.statusCode !== 200) {
        response.resume()
        return reject(new Error(`Servidor do canal remoto respondeu HTTP ${response.statusCode}.`))
      }
      resolve(response)
    })
    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error("Tempo esgotado no canal remoto.")))
    req.on("error", reject)
  })
}

async function readLimited(response, limit, label) {
  const chunks = []
  let size = 0
  for await (const chunk of response) {
    size += chunk.length
    if (size > limit) throw new Error(`${label} excede o limite permitido.`)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

function manifestUrl(repository, cachebuster = Date.now()) {
  return `https://raw.githubusercontent.com/${repository}/main/releases/windows-beta-runtime.json?v=${encodeURIComponent(cachebuster)}`
}

function expectedScriptUrl(repository, scriptPath, revision) {
  return `https://raw.githubusercontent.com/${repository}/main/${scriptPath}?v=${encodeURIComponent(revision)}`
}

function githubRefUrl(repository) {
  return `https://api.github.com/repos/${repository}/git/ref/heads/main`
}

function githubContentUrl(repository, filePath, commit) {
  return `https://api.github.com/repos/${repository}/contents/${filePath}?ref=${encodeURIComponent(commit)}`
}

async function readJson(url, limit, label) {
  const response = await request(url)
  const bytes = await readLimited(response, limit, label)
  return JSON.parse(bytes.toString("utf8"))
}

function decodeGithubContent(payload, limit, label) {
  if (!payload || payload.type !== "file" || payload.encoding !== "base64" || typeof payload.content !== "string") {
    throw new Error(`${label} não foi entregue como arquivo íntegro pelo GitHub.`)
  }
  const bytes = Buffer.from(payload.content.replace(/\s+/g, ""), "base64")
  if (bytes.length < 1 || bytes.length > limit) throw new Error(`${label} excede o limite permitido.`)
  return bytes
}

function validateManifest(manifest, repository) {
  if (!manifest || manifest.repository !== repository) throw new Error("Manifesto remoto pertence a outro repositório.")
  if (!Number.isSafeInteger(manifest.revision) || manifest.revision < 1) throw new Error("Revisão remota inválida.")
  if (manifest.script?.path !== "runtime/windows-beta-runtime.js") throw new Error("Caminho do script remoto não autorizado.")
  if (!/^[a-f0-9]{64}$/i.test(String(manifest.script?.sha256 || ""))) throw new Error("SHA-256 remoto inválido.")
  if (!Number.isSafeInteger(manifest.script?.size) || manifest.script.size < 1 || manifest.script.size > MAX_SCRIPT_BYTES) throw new Error("Tamanho remoto inválido.")
  return manifest
}

async function fetchRuntimeManifest(repository) {
  try {
    const ref = await readJson(githubRefUrl(repository), MAX_MANIFEST_BYTES, "Referência remota")
    const commit = String(ref?.object?.sha || "")
    if (!/^[a-f0-9]{40}$/i.test(commit)) throw new Error("Commit remoto inválido.")
    const payload = await readJson(githubContentUrl(repository, "releases/windows-beta-runtime.json", commit), MAX_MANIFEST_BYTES, "Manifesto remoto")
    const bytes = decodeGithubContent(payload, MAX_MANIFEST_BYTES, "Manifesto remoto")
    const manifest = validateManifest(JSON.parse(bytes.toString("utf8")), repository)
    Object.defineProperty(manifest, "sourceCommit", { value: commit, enumerable: false })
    return manifest
  } catch {
    const response = await request(manifestUrl(repository))
    const bytes = await readLimited(response, MAX_MANIFEST_BYTES, "Manifesto remoto")
    return validateManifest(JSON.parse(bytes.toString("utf8")), repository)
  }
}

function validateScript(bytes, manifest) {
  if (!Buffer.isBuffer(bytes)) bytes = Buffer.from(bytes)
  if (bytes.length !== manifest.script.size) throw new Error(`Tamanho do script remoto divergente: esperado ${manifest.script.size}, recebido ${bytes.length}.`)
  const sha256 = crypto.createHash("sha256").update(bytes).digest("hex")
  if (sha256.toLowerCase() !== manifest.script.sha256.toLowerCase()) throw new Error(`SHA-256 do script remoto divergente: ${sha256}.`)
  return bytes.toString("utf8")
}

async function fetchValidatedRuntime(repository, manifest) {
  validateManifest(manifest, repository)
  if (/^[a-f0-9]{40}$/i.test(String(manifest.sourceCommit || ""))) {
    const payload = await readJson(githubContentUrl(repository, manifest.script.path, manifest.sourceCommit), MAX_SCRIPT_BYTES, "Script remoto")
    return validateScript(decodeGithubContent(payload, MAX_SCRIPT_BYTES, "Script remoto"), manifest)
  }
  const response = await request(expectedScriptUrl(repository, manifest.script.path, manifest.revision))
  const bytes = await readLimited(response, MAX_SCRIPT_BYTES, "Script remoto")
  return validateScript(bytes, manifest)
}

module.exports = {
  decodeGithubContent,
  expectedScriptUrl,
  fetchRuntimeManifest,
  fetchValidatedRuntime,
  githubContentUrl,
  githubRefUrl,
  manifestUrl,
  validateManifest,
  validateScript,
}
