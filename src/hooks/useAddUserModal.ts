import { create } from "zustand";

interface AddUserModalState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useAddUserModal = create<AddUserModalState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
