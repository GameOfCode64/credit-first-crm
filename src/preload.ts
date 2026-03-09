import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  /** Get running app version — shown in splash */
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  /** Subscribe to update status messages from main process */
  onUpdateStatus: (
    callback: (payload: { status: string; progress?: number }) => void,
  ) => {
    ipcRenderer.on("update-status", (_event, payload) => callback(payload));
  },
});
