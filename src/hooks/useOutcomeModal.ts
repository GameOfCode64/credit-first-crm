import { create } from "zustand";

/* ================= TYPES ================= */

export type PipelineStage = "INITIAL" | "ACTIVE" | "CLOSED";

export interface OutcomeModalPayload {
  outcomeId?: string;
  key?: string;
  name?: string;
  stage: PipelineStage;
  color?: string;
  reasons?: { id?: string; label: string }[];
}

/* ================= STORE ================= */

interface OutcomeModalStore {
  isOpen: boolean;
  payload: OutcomeModalPayload | null;

  open: (stage: PipelineStage, data?: Partial<OutcomeModalPayload>) => void;
  close: () => void;
}

export const useOutcomeReasonModal = create<OutcomeModalStore>((set) => ({
  isOpen: false,
  payload: null,

  open: (stage, data) =>
    set({
      isOpen: true,
      payload: {
        stage,
        ...data,
      },
    }),

  close: () =>
    set({
      isOpen: false,
      payload: null,
    }),
}));
