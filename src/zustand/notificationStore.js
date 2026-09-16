import { create } from "zustand";
import { getConversations } from "../api/modules/conversation";
import { getNotifications } from "../api/modules/notification";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await getNotifications(params);
      if (response.data.status === "success") {
        set({
          notifications: response.data.data,
          unreadCount: response.data.unreadCount,
          loading: false,
        });
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

  markAllReadLocally: () => {
    const { notifications } = get();
    set({
      unreadCount: 0,
      notifications: notifications.map((n) => ({ ...n, isRead: true })),
    });
  },
}));

export default useNotificationStore;
