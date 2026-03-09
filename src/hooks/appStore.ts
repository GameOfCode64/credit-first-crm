import { create } from "zustand";

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
    };
  }
}

interface AppStore {
  version: string;
  loadVersion: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  version: "",
  loadVersion: async () => {
    const v = await window.electronAPI?.getAppVersion();
    set({ version: v ?? "" });
  },
}));
