import { create } from "zustand";
import { getMessages } from "../api/modules/message";

const useMessageStore = create((set) => ({
    insideMessages: [],
    loading: false,
    error: null,

    fetchInsideMessage: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await getMessages(id);
            if (response.data.status === "success") {
                set({ insideMessages: response.data.data, loading: false });
            } else {
                set({ error: response.data.message, loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data || error.message,
                loading: false,
            });
        }
    },

    addInsideMessage: (message) => {
        set((state) => ({
            insideMessages: [...state.insideMessages, message],
        }));
    },

    updateInsideMessage: (updatedMessage) => {
        set((state) => ({
            insideMessages: state.insideMessages.map((message) =>
                message._id === updatedMessage._id ? updatedMessage : message
            ),
        }));
    },

    updateInsideMessageInCatch: (id) => {
        set((state) => ({
            insideMessages: state.insideMessages.map((message) =>
                message._id === id
                    ? { ...message, isPending: false, error: true }
                    : message
            ),
        }));
    },

    resetInsideMessages: () => set({ insideMessages: [] }),
}));

export default useMessageStore;