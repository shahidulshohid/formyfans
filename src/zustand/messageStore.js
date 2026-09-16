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
        message._id === updatedMessage._id ? updatedMessage : message,
      ),
    }));
  },

  updateInsideMessageInCatch: (id) => {
    set((state) => ({
      insideMessages: state.insideMessages.map((message) =>
        message._id === id
          ? { ...message, isPending: false, error: true }
          : message,
      ),
    }));
  },

  // Updates the status of a shared deal wherever it appears in insideMessages.
  // Handles both cases: sharedDeal.dealId populated (object) or plain ObjectId string.
  updateMessageSharedDealStatus: (dealId, status) => {
    set((state) => ({
      insideMessages: state.insideMessages.map((message) => {
        if (!message.sharedDeal) return message;

        const messageDealId =
          typeof message.sharedDeal.dealId === "object" &&
          message.sharedDeal.dealId !== null
            ? message.sharedDeal.dealId._id
            : message.sharedDeal.dealId;

        if (messageDealId?.toString() !== dealId?.toString()) {
          return message;
        }

        const isPopulated =
          typeof message.sharedDeal.dealId === "object" &&
          message.sharedDeal.dealId !== null;

        return {
          ...message,
          sharedDeal: {
            ...message.sharedDeal,
            status,
            dealId: isPopulated
              ? { ...message.sharedDeal.dealId, status }
              : message.sharedDeal.dealId,
          },
        };
      }),
    }));
  },

  resetInsideMessages: () => set({ insideMessages: [] }),
}));

export default useMessageStore;
