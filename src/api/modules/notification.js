import { Notification_ENDPOINTS } from "../endpoints";
import api from "../index";

export const getNotifications = async (params) => {
  return api(Notification_ENDPOINTS.GET_NOTIFICATIONS, params, "get");
};
export const markAllNotificationsRead = async (params) => {
  return api(Notification_ENDPOINTS.MARK_ALL_NEED, {}, "patch");
};
