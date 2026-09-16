import { getProfile } from "../api/modules/profile";
import useUserStore from "../zustand/userUserStore";

export const syncUserFromServer = async () => {
  const { token, setUserData, clearUserData } = useUserStore.getState();
  if (!token) return null;

  try {
    const response = await getProfile();
    if (response?.status === 200 || response?.status === 201) {
      const user = response?.data?.user;
      if (user) {
        // If admin creator's free access expired, logout same as active-session timer
        if (user.isAdminCreator && user.freeMonthsExpireAt) {
          if (new Date() > new Date(user.freeMonthsExpireAt)) {
            clearUserData();
            return null;
          }
        }

        const currentUser = useUserStore.getState().user;
        const moveToSubscription = currentUser?.moveToSubscription ??
          (user.role === "creator" && !user.activeSubscriptionId && !user.isAdminCreator);

        setUserData({ ...user, moveToSubscription });
        return { ...user, moveToSubscription };
      }
    } else {
      console.error("[SYNC] Failed to sync user:", response?.status, response?.data?.message);
    }
  } catch (error) {
    console.error("[SYNC] Failed to sync user:", error);
  }

  return null;
};

export const applyApiUserUpdate = async (apiUser) => {
  if (apiUser) {
    const currentUser = useUserStore.getState().user;
    const moveToSubscription = currentUser?.moveToSubscription ??
      (apiUser.role === "creator" && !apiUser.activeSubscriptionId && !apiUser.isAdminCreator);
    useUserStore.getState().setUserData({ ...apiUser, moveToSubscription });
    return apiUser;
  }

  return syncUserFromServer();
};
