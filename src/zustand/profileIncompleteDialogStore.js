import { create } from "zustand";

const useProfileIncompleteDialogStore = create((set) => ({
  open: false,
  openProfileIncompleteDialog: () => set({ open: true }),
  closeProfileIncompleteDialog: () => set({ open: false }),
}));

export default useProfileIncompleteDialogStore;
