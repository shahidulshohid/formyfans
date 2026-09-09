import { create } from "zustand";

const useTextMessageStore = create((set) => ({
    textMessage: "",
    attachment: null,

    setTextMessage: (textMessage) => set({ textMessage }),
    setAttachment: (attachment) => set({ attachment }),
    resetTextMessage: () => set({ textMessage: "" }),
    resetAttachment: () => set({ attachment: null }),
}));

export default useTextMessageStore;