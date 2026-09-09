import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getConversations } from "../api/modules/conversation";

const useConversationStore = create(
    persist(
        (set, get) => ({
            conversations: [],
            loading: false,
            error: null,

            fetchConversations: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await getConversations();
                    if (response.data.status === "success") {
                        set({ conversations: response.data.data, loading: false });
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

            addNewConversation: (conversation) => {
                set((state) => ({
                    conversations: [conversation, ...state.conversations],
                }));
            },

            resetUnreadMessagesCount: (data) => {
                set((state) => {
                    const index = state.conversations.findIndex(
                        (item) => item.conversationId === data.conversationId
                    );
                    if (index === -1) return state;

                    const updated = [...state.conversations];
                    updated[index] = {
                        ...updated[index],
                        unreadMessagesCount: data?.unreadMessagesCount,
                    };
                    return { conversations: updated };
                });
            },

            updateConversation: (data) => {
                set((state) => {
                    const index = state.conversations.findIndex(
                        (item) => item.conversationId === data.conversationId
                    );

                    if (index === -1) {
                        return { conversations: [data, ...state.conversations] };
                    }

                    const updatedConversation = {
                        ...state.conversations[index],
                        unreadMessagesCount: data?.unreadMessagesCount,
                        lastMessage: data?.lastMessage,
                    };

                    if (data?.isListUpdated === undefined) {
                        updatedConversation.lastUpdated = Date.now();
                    }

                    const updated = [...state.conversations];
                    updated.splice(index, 1);

                    if (data?.isListUpdated === undefined) {
                        updated.unshift(updatedConversation);
                    } else {
                        updated.splice(index, 0, updatedConversation);
                    }

                    return { conversations: updated };
                });
            },
        }),
        {
            name: "conversation-store", // localStorage key
            partialize: (state) => ({ conversations: state.conversations }),
        }
    )
);

export default useConversationStore;