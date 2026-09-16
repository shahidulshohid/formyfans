import { create } from "zustand";

const useSidebarDrawerStore = create((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
}));

export default useSidebarDrawerStore;
