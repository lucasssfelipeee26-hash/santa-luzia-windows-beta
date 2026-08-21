const beta = require("./config/windows-beta.json")
const [owner, repo] = beta.updateRepository.split("/")

module.exports = {
  appId: "br.com.comunidadesantaluzia.beta",
  productName: beta.appName,
  extraMetadata: {
    main: "electron/main.cjs",
    version: beta.versionName,
  },
  directories: {
    output: "dist-windows",
  },
  files: [
    "electron/**/*",
    "config/windows-beta.json",
    "public/icon-512x512.png",
    "package.json",
  ],
  publish: [
    {
      provider: "github",
      owner,
      repo,
      releaseType: "prerelease",
    },
  ],
  win: {
    target: [
      { target: "nsis", arch: ["x64"] },
      { target: "portable", arch: ["x64"] },
    ],
    icon: "public/icon-512x512.png",
    artifactName: `Santa-Luzia-Beta-Setup-${beta.versionName}-x64.\${ext}`,
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Santa Luzia Beta",
  },
  portable: {
    artifactName: `Santa-Luzia-Beta-Portable-${beta.versionName}-x64.\${ext}`,
  },
}
