import { create } from "zustand";

const useCreatorStore = create((set) => ({
  creators: [],
  loading: false,
  error: null,

  setActiveChat: (chat) => set({ activeChat: chat }),
}));

export default useCreatorStore;