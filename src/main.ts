import path from "node:path";
import { app, BrowserWindow, screen, ipcMain, autoUpdater } from "electron";
import started from "electron-squirrel-startup";
import { updateElectronApp, UpdateSourceType } from "update-electron-app";
import log from "electron-log";

// ─────────────────────────────────────────────────────────────────
//  NOTE: Do NOT import from "electron-updater" anywhere in this file.
//  This project uses Electron Forge + Squirrel, not electron-builder.
//  The correct autoUpdater is the one imported above from "electron".
// ─────────────────────────────────────────────────────────────────

/* ── Squirrel Windows installer events ── */
if (started) app.quit();

/* ── Logging ── */
log.transports.file.level = "info";

/* ── Globals ── */
let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

/* ─────────────────────────────────────────────────────────────────
   SPLASH WINDOW
───────────────────────────────────────────────────────────────── */
const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false,
    resizable: false,
    center: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      partition: "persist:main",
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    splashWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/splash.html`);
  } else {
    splashWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/splash.html`),
    );
  }
};

/* ─────────────────────────────────────────────────────────────────
   MAIN WINDOW
───────────────────────────────────────────────────────────────── */
const createMainWindow = () => {
  if (mainWindow) return;

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      partition: "persist:main",
    },
  });

  mainWindow.maximize();

  mainWindow.once("ready-to-show", () => {
    splashWindow?.close();
    splashWindow = null;
    mainWindow?.show();
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const sendStatus = (status: string, progress?: number) => {
  splashWindow?.webContents?.send("update-status", { status, progress });
};

const openApp = (delayMs = 500) => {
  setTimeout(createMainWindow, delayMs);
};

/* ─────────────────────────────────────────────────────────────────
   UPDATE SETUP
   
   Uses: electron's built-in autoUpdater (Squirrel) via update-electron-app
   Does NOT use: electron-updater, app-update.yml, latest.yml
   
   Squirrel feed is served by update.electronjs.org for public GitHub repos.
   Requires at least one published GitHub release with the .exe installer.
───────────────────────────────────────────────────────────────── */
const setupUpdater = () => {
  /* Dev — skip update, open app directly */
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    log.info("Dev mode — skipping update check");
    openApp(400);
    return;
  }

  /* Wire up Electron's autoUpdater events BEFORE calling updateElectronApp */
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update…");
    sendStatus("Checking for updates…");
  });

  autoUpdater.on("update-available", () => {
    log.info("Update available — downloading");
    sendStatus("Downloading update…");
  });

  autoUpdater.on("update-not-available", () => {
    log.info("Up to date — launching");
    sendStatus("Launching…");
    openApp(500);
  });

  autoUpdater.on("update-downloaded", () => {
    log.info("Update downloaded — installing now");
    sendStatus("Installing update…");
    // Quit and install — Squirrel relaunches the app automatically
    setTimeout(() => autoUpdater.quitAndInstall(), 1000);
  });

  autoUpdater.on("error", (err: Error) => {
    // Never block the user — always open the app on any update error
    log.error("Update error:", err.message);
    sendStatus("Launching…");
    openApp(500);
  });

  /* updateElectronApp sets the Squirrel feed URL and calls
     autoUpdater.checkForUpdates() — that's all it does.
     Our event listeners above handle everything else.         */
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: "GameOfCode64/credit-first-crm",
    },
    logger: log,
    notifyUser: false, // we show our own splash UI
  });
};

/* ─────────────────────────────────────────────────────────────────
   IPC
───────────────────────────────────────────────────────────────── */
ipcMain.handle("get-app-version", () => app.getVersion());

/* ─────────────────────────────────────────────────────────────────
   APP LIFECYCLE
───────────────────────────────────────────────────────────────── */
app.on("ready", () => {
  createSplashWindow();

  splashWindow!.webContents.once("did-finish-load", () => {
    setupUpdater();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
