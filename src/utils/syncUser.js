import { getProfile } from "../api/modules/profile";
import useUserStore from "../zustand/userUserStore";

export const syncUserFromServer = async () => {
  const { token, setUserData } = useUserStore.getState();
  if (!token) return null;

  try {
    const response = await getProfile();
    if (response?.status === 200 || response?.status === 201) {
      const user = response?.data?.user;
      if (user) {
        setUserData(user);
        return user;
      }
    }
  } catch {
    // ignore
  }

  return null;
};

export const applyApiUserUpdate = async (apiUser) => {
  if (apiUser) {
    useUserStore.getState().setUserData(apiUser);
    return apiUser;
  }

  return syncUserFromServer();
};
