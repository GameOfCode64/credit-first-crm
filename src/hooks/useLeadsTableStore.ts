import { create } from "zustand";

export interface LeadsState {
  /* ================= FILTERS ================= */
  search: string;
  statuses: string[];
  assignees: string[];

  /* ================= COLUMNS ================= */
  allColumns: string[];
  visibleColumns: string[];

  /* ================= SELECTION ================= */
  selectedIds: string[];

  /* ================= ACTIONS ================= */
  setSearch: (v: string) => void;
  setStatuses: (v: string[]) => void;
  setAssignees: (v: string[]) => void;

  initializeColumns: (cols: string[]) => void;
  toggleColumn: (key: string) => void;

  toggleSelect: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useLeadsTableStore = create<LeadsState>((set, get) => ({
  /* ================= FILTERS ================= */
  search: "",
  statuses: [],
  assignees: [],

  /* ================= COLUMNS ================= */
  allColumns: [],
  visibleColumns: [],

  /* ================= SELECTION ================= */
  selectedIds: [],

  /* ================= ACTIONS ================= */

  setSearch: (search) => set({ search }),

  setStatuses: (statuses) => set({ statuses }),

  setAssignees: (assignees) => set({ assignees }),

  /* ===== INITIALIZE COLUMNS FROM API ===== */
  initializeColumns: (cols) =>
    set((state) => {
      if (state.allColumns.length === 0) {
        return {
          allColumns: cols,
          visibleColumns: [
            "personName",
            "phone",
            "companyName",
            "status",
            "assignedTo",
            "createdAt",
          ].filter((c) => cols.includes(c)),
        };
      }

      return {
        allColumns: cols,
      };
    }),

  toggleColumn: (key) =>
    set((state) => ({
      visibleColumns: state.visibleColumns.includes(key)
        ? state.visibleColumns.filter((c) => c !== key)
        : [...state.visibleColumns, key],
    })),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),

  selectMultiple: (ids) =>
    set((state) => ({
      selectedIds: [...new Set([...state.selectedIds, ...ids])],
    })),

  clearSelection: () => set({ selectedIds: [] }),
}));
