import path from "node:path";
import { app, BrowserWindow, screen, ipcMain } from "electron";
import started from "electron-squirrel-startup";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

/* ────────────────────────────────────────────────────────────────
   SQUIRREL (Windows installer events)
──────────────────────────────────────────────────────────────── */
if (started) {
  app.quit();
}

/* ────────────────────────────────────────────────────────────────
   LOGGING
──────────────────────────────────────────────────────────────── */
log.transports.file.level = "info";
autoUpdater.logger = log;

/* ────────────────────────────────────────────────────────────────
   GLOBALS
──────────────────────────────────────────────────────────────── */
let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

/* ────────────────────────────────────────────────────────────────
   SPLASH WINDOW  (shown while checking / downloading update)
──────────────────────────────────────────────────────────────── */
const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false, // borderless — same as Discord
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

/* ────────────────────────────────────────────────────────────────
   MAIN WINDOW
──────────────────────────────────────────────────────────────── */
const createMainWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    show: false, // hidden until ready-to-show
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

/* ────────────────────────────────────────────────────────────────
   AUTO-UPDATER  (only in production)
   Flow:
     1. App opens → splash shown
     2. Check for update
        ├─ No update  → open main window immediately
        └─ Update found → download silently
             └─ Download complete → quitAndInstall (relaunch)
──────────────────────────────────────────────────────────────── */

/** Send a status message to the splash window renderer */
const sendSplashStatus = (status: string, progress?: number) => {
  splashWindow?.webContents?.send("update-status", { status, progress });
};

const setupAutoUpdater = () => {
  // Don't run in dev
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    log.info("Dev mode — skipping auto-update, opening main window directly");
    createMainWindow();
    return;
  }

  autoUpdater.autoDownload = true; // download silently in background
  autoUpdater.autoInstallOnAppQuit = false; // we control when to install

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update…");
    sendSplashStatus("Checking for updates…");
  });

  autoUpdater.on("update-not-available", () => {
    log.info("No update available — launching app");
    sendSplashStatus("Launching…");
    // Short delay so splash doesn't flash away instantly
    setTimeout(createMainWindow, 600);
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    sendSplashStatus(`Downloading update ${info.version}…`);
  });

  autoUpdater.on("download-progress", (progress) => {
    const pct = Math.round(progress.percent);
    log.info(`Download progress: ${pct}%`);
    sendSplashStatus(`Downloading update… ${pct}%`, pct);
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded — installing:", info.version);
    sendSplashStatus(`Installing update ${info.version}…`);
    // Give the splash 1s to show "Installing…" before quit
    setTimeout(() => {
      autoUpdater.quitAndInstall(
        true, // isSilent  — no "install" dialog on Windows
        true, // isForceRunAfter — relaunch after install
      );
    }, 1000);
  });

  autoUpdater.on("error", (err) => {
    log.error("Auto-updater error:", err);
    // Don't block the user — just open the app
    sendSplashStatus("Update check failed — launching app");
    setTimeout(createMainWindow, 800);
  });

  autoUpdater.checkForUpdates();
};

/* ────────────────────────────────────────────────────────────────
   IPC  — renderer can query update status (optional)
──────────────────────────────────────────────────────────────── */
ipcMain.handle("get-app-version", () => app.getVersion());

/* ────────────────────────────────────────────────────────────────
   APP LIFECYCLE
──────────────────────────────────────────────────────────────── */
app.on("ready", () => {
  createSplashWindow();

  // Wait for splash to finish loading before kicking off update check
  splashWindow!.webContents.once("did-finish-load", () => {
    setupAutoUpdater();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
