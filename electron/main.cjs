const { app, BrowserWindow, dialog, shell } = require("electron")
const { autoUpdater } = require("electron-updater")
const fs = require("node:fs")
const path = require("node:path")
const beta = require("../config/windows-beta.json")

const APP_URL = process.env.SANTA_LUZIA_WINDOWS_BETA_URL || beta.serverUrl
const ALLOWED_ORIGIN = new URL(APP_URL).origin
const IS_PORTABLE = Boolean(process.env.PORTABLE_EXECUTABLE_FILE || process.env.PORTABLE_EXECUTABLE_DIR)
let mainWindow = null
let updatePromptOpen = false
let updateCheckRunning = false
let updateInterval = null

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

function aplicarPolimentoBeta7(win) {
  executarScriptNativo(win, "beta7-polish.js", "polimento visual da Beta 0.1.0-beta.7")
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
    aplicarPolimentoBeta7(win)
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
  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    console.error("Falha ao consultar o canal Beta no GitHub:", error?.message || error)
  } finally {
    updateCheckRunning = false
  }
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

app.whenReady().then(() => {
  createWindow()
  configureUpdater()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("before-quit", () => {
  if (updateInterval) clearInterval(updateInterval)
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})