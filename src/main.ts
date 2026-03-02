import path from "node:path";
import { app, BrowserWindow, screen } from "electron";
import started from "electron-squirrel-startup";
import { updateElectronApp } from "update-electron-app";

// Only run auto-update when not in development mode
if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  updateElectronApp();
}

if (started) {
  app.quit();
}

const createWindow = () => {
  // Get screen dimensions inside createWindow (after app is ready)
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      partition: "persist:main",
    },
  });

  // Maximize the window for better full-screen experience
  mainWindow.maximize();

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // Open the DevTools only in development.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
