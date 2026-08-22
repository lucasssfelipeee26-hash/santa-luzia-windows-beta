const { app, BrowserWindow, dialog, shell } = require("electron")
const { autoUpdater } = require("electron-updater")
const fs = require("node:fs")
const path = require("node:path")
const { spawn } = require("node:child_process")
const beta = require("../config/windows-beta.json")
const manifestUpdater = require("./manifest-updater.cjs")
const remoteRuntimeUpdater = require("./remote-runtime-updater.cjs")

const APP_URL = process.env.SANTA_LUZIA_WINDOWS_BETA_URL || beta.serverUrl
const ALLOWED_ORIGIN = new URL(APP_URL).origin
const IS_PORTABLE = Boolean(process.env.PORTABLE_EXECUTABLE_FILE || process.env.PORTABLE_EXECUTABLE_DIR)
let mainWindow = null
let updatePromptOpen = false
let updateCheckRunning = false
let updateInterval = null
let remoteRuntimeInterval = null
let remoteRuntimeRevision = 0
let remoteRuntimeScript = ""
let remoteRuntimeCheckRunning = false
let remoteRuntimeForcePending = false

async function applyRemoteRuntime(win = mainWindow) {
  if (!remoteRuntimeScript || !win || win.isDestroyed()) return false
  if (win.webContents.isLoading()) {
    win.webContents.once("did-finish-load", () => void applyRemoteRuntime(win).catch((error) => console.error("Falha ao reaplicar canal remoto:", error?.message || error)))
    return false
  }
  await win.webContents.executeJavaScript(remoteRuntimeScript, true)
  console.log(`Canal remoto Windows aplicado. Revisão: ${remoteRuntimeRevision}`)
  return true
}

async function checkRemoteRuntime(forceApply = false) {
  if (!app.isPackaged) return
  if (remoteRuntimeCheckRunning) {
    if (forceApply) remoteRuntimeForcePending = true
    return
  }
  remoteRuntimeCheckRunning = true
  try {
    const manifest = await remoteRuntimeUpdater.fetchRuntimeManifest(beta.updateRepository)
    if (manifest.revision > remoteRuntimeRevision) {
      remoteRuntimeScript = await remoteRuntimeUpdater.fetchValidatedRuntime(beta.updateRepository, manifest)
      remoteRuntimeRevision = manifest.revision
      await applyRemoteRuntime()
    } else if (forceApply) {
      await applyRemoteRuntime()
    }
  } catch (error) {
    console.error("Falha no canal remoto exclusivo do Windows Beta:", error?.message || error)
  } finally {
    remoteRuntimeCheckRunning = false
    if (remoteRuntimeForcePending) {
      remoteRuntimeForcePending = false
      setTimeout(() => void checkRemoteRuntime(true), 50)
    }
  }
}

async function installFromManifest(manifest) {
  if (updatePromptOpen || !mainWindow || mainWindow.isDestroyed()) return false
  updatePromptOpen = true
  try {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Nova Beta disponível",
      message: `Santa Luzia Beta ${manifest.versionName} está disponível.`,
      detail: "O atualizador alternativo encontrou o Setup oficial no GitHub. O arquivo será validado por tamanho e SHA-256 antes da instalação.",
      buttons: ["Atualizar agora", "Depois"],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    })
    if (result.response !== 0) return false

    const updateDirectory = await fs.promises.mkdtemp(path.join(app.getPath("temp"), "santa-luzia-beta-update-"))
    const setupPath = path.join(updateDirectory, path.basename(manifest.setup.file))
    try {
      await manifestUpdater.downloadValidatedSetup(manifest, setupPath, (progress) => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setProgressBar(Math.max(0, Math.min(1, progress)))
      })
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setProgressBar(-1)
      const installer = spawn(setupPath, ["/S"], { detached: true, stdio: "ignore", windowsHide: true })
      await new Promise((resolve, reject) => {
        installer.once("spawn", resolve)
        installer.once("error", reject)
      })
      installer.unref()
      app.quit()
      return true
    } catch (error) {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setProgressBar(-1)
      await fs.promises.rm(updateDirectory, { recursive: true, force: true }).catch(() => {})
      throw error
    }
  } finally {
    updatePromptOpen = false
  }
}

async function checkManifestFallback() {
  const manifest = await manifestUpdater.fetchManifest(beta.updateRepository)
  if (manifestUpdater.compareVersions(manifest.versionName, app.getVersion()) <= 0) {
    console.log(`Manifesto direto sem versão mais nova. Instalada: ${app.getVersion()}; manifesto: ${manifest.versionName}`)
    return false
  }
  console.log(`Fallback do manifesto encontrou ${manifest.versionName} para substituir ${app.getVersion()}.`)
  return installFromManifest(manifest)
}

app.setName(beta.appName)
app.setAppUserModelId("br.com.comunidadesantaluzia.beta")

function aplicarCssNativo(win) {
  try {
    const arquivo = path.join(__dirname, "motion-fixes.css")
    const css = fs.readFileSync(arquivo, "utf8")
    void win.webContents.insertCSS(css).catch((error) => {
      console.error("Falha ao aplicar CSS Motion da Beta Windows:", error?.message || error)
    })
  } catch (error) {
    console.error("CSS Motion da Beta Windows ausente:", error?.message || error)
  }
}

function executarScriptNativo(win, nome, rotulo) {
  try {
    const arquivo = path.join(__dirname, nome)
    const script = fs.readFileSync(arquivo, "utf8")
    void win.webContents.executeJavaScript(script, true).catch((error) => {
      console.error(`Falha ao aplicar ${rotulo}:`, error?.message || error)
    })
  } catch (error) {
    console.error(`${rotulo} ausente:`, error?.message || error)
  }
}

function aplicarCorrecoesComportamentais(win) {
  executarScriptNativo(win, "behavior-fixes.js", "correções comportamentais da Beta Windows")
}

function aplicarPolimentoWindows(win) {
  executarScriptNativo(win, "beta7-polish.js", `polimento visual da Beta ${beta.versionName}`)
}

function aplicarRuntimeWindowsEmpacotado(win) {
  executarScriptNativo(win, "../runtime/windows-beta-runtime.js", "correções consolidadas da Beta Windows")
}

function createWindow() {
  const win = new BrowserWindow({
    title: `${beta.appName} ${beta.versionName}`,
    width: 430,
    height: 900,
    minWidth: 390,
    minHeight: 700,
    maxWidth: 620,
    maxHeight: 1100,
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#fffaf0",
    icon: path.join(__dirname, "../public/icon-512x512.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload-v5.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true,
    },
  })

  const currentUserAgent = win.webContents.getUserAgent()
  win.webContents.setUserAgent(`${currentUserAgent} SantaLuziaWindowsBeta/${beta.versionName}`)

  win.webContents.on("did-finish-load", () => {
    aplicarCssNativo(win)
    aplicarCorrecoesComportamentais(win)
    aplicarPolimentoWindows(win)
    aplicarRuntimeWindowsEmpacotado(win)
    void checkRemoteRuntime(true)
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const destino = new URL(url)
      if (destino.origin === ALLOWED_ORIGIN) {
        void win.loadURL(url)
        return { action: "deny" }
      }
      if (destino.protocol === "https:" || destino.protocol === "http:") void shell.openExternal(url)
    } catch {}
    return { action: "deny" }
  })

  win.webContents.on("will-navigate", (event, url) => {
    try {
      const destino = new URL(url)
      if (destino.origin === ALLOWED_ORIGIN) return
      event.preventDefault()
      if (destino.protocol === "https:" || destino.protocol === "http:") void shell.openExternal(url)
    } catch {
      event.preventDefault()
    }
  })

  win.once("ready-to-show", () => win.show())
  void win.loadURL(APP_URL)
  mainWindow = win
  return win
}

async function checkForBetaUpdate() {
  if (!app.isPackaged || IS_PORTABLE || updateCheckRunning) return
  updateCheckRunning = true
  let electronUpdaterFoundNewer = false
  try {
    const result = await autoUpdater.checkForUpdates()
    electronUpdaterFoundNewer = Boolean(result?.updateInfo?.version && manifestUpdater.compareVersions(result.updateInfo.version, app.getVersion()) > 0)
  } catch (error) {
    console.error("Falha ao consultar o canal Beta no GitHub:", error?.message || error)
  }
  if (!electronUpdaterFoundNewer) {
    try {
      await checkManifestFallback()
    } catch (fallbackError) {
      console.error("Falha no fallback do manifesto Beta:", fallbackError?.message || fallbackError)
    }
  }
  updateCheckRunning = false
}

function configureUpdater() {
  if (!app.isPackaged || IS_PORTABLE) return

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowPrerelease = true
  autoUpdater.channel = "beta"

  autoUpdater.on("checking-for-update", () => {
    console.log(`Consultando atualizações do canal beta. Versão instalada: ${app.getVersion()}`)
  })

  autoUpdater.on("update-available", async (info) => {
    if (updatePromptOpen || !mainWindow || mainWindow.isDestroyed()) return
    updatePromptOpen = true
    try {
      const result = await dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "Nova Beta disponível",
        message: `Santa Luzia Beta ${info.version} está disponível.`,
        detail: "Esta atualização é nativa e vem do canal Beta oficial no GitHub.",
        buttons: ["Atualizar agora", "Depois"],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      })
      if (result.response === 0) await autoUpdater.downloadUpdate()
    } finally {
      updatePromptOpen = false
    }
  })

  autoUpdater.on("update-not-available", (info) => {
    console.log(`Canal beta sem versão mais nova. Instalada: ${app.getVersion()}; consultada: ${info?.version || "desconhecida"}`)
  })

  autoUpdater.on("download-progress", (progress) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setProgressBar(Math.max(0, Math.min(1, progress.percent / 100)))
  })

  autoUpdater.on("update-downloaded", async (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setProgressBar(-1)
    if (!mainWindow || mainWindow.isDestroyed()) return
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Atualização pronta",
      message: `Santa Luzia Beta ${info.version} foi baixada.`,
      detail: "O aplicativo Windows será reiniciado para instalar a nova versão nativa.",
      buttons: ["Reiniciar e atualizar", "Mais tarde"],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    })
    if (result.response === 0) autoUpdater.quitAndInstall(false, true)
  })

  autoUpdater.on("error", (error) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setProgressBar(-1)
    console.error("Falha no auto-update da Beta Windows:", error?.message || error)
  })

  setTimeout(() => void checkForBetaUpdate(), 2500)
  updateInterval = setInterval(() => void checkForBetaUpdate(), 15 * 60 * 1000)

  app.on("browser-window-focus", () => {
    void checkForBetaUpdate()
  })
}

function configureRemoteRuntime() {
  if (!app.isPackaged) return
  setTimeout(() => void checkRemoteRuntime(true), 1800)
  remoteRuntimeInterval = setInterval(() => void checkRemoteRuntime(false), 5 * 60 * 1000)
  app.on("browser-window-focus", () => void checkRemoteRuntime(false))
}

app.whenReady().then(() => {
  createWindow()
  configureUpdater()
  configureRemoteRuntime()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("before-quit", () => {
  if (updateInterval) clearInterval(updateInterval)
  if (remoteRuntimeInterval) clearInterval(remoteRuntimeInterval)
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
