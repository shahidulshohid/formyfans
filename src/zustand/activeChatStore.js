import { create } from "zustand";

const useActiveChatStore = create((set) => ({
  activeChat: null,

  setActiveChat: (chat) => set({ activeChat: chat }),
}));

export default useActiveChatStore;