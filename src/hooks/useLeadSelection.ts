import { create } from "zustand";

interface LeadSelectionState {
  selectedLeadId: string | null;
  selectLead: (id: string) => void;
}

export const useLeadSelection = create<LeadSelectionState>((set) => ({
  selectedLeadId: null,
  selectLead: (id) => set({ selectedLeadId: id }),
}));
