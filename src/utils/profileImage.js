export const PROFILE_IMAGE_KEY = "profileImage";

export const setStoredProfileImage = (url) => {
  if (url) {
    localStorage.setItem(PROFILE_IMAGE_KEY, url);
  }
};

export const getStoredProfileImage = () =>
  localStorage.getItem(PROFILE_IMAGE_KEY) || "";

export const clearStoredProfileImage = () => {
  localStorage.removeItem(PROFILE_IMAGE_KEY);
};

export const getUserProfileImage = (user) => {
  const fromUser = user?.image || user?.profileImage || user?.avatar;
  if (fromUser) return fromUser;

  const stored = getStoredProfileImage();
  if (stored) return stored;

  try {
    const signupRaw = localStorage.getItem("signupData");
    if (signupRaw) {
      const signup = JSON.parse(signupRaw);
      if (signup?.image) return signup.image;
    }

    const userDataRaw = localStorage.getItem("userData");
    if (userDataRaw) {
      const parsed = JSON.parse(userDataRaw);
      const persistedUser = parsed?.state?.user;
      return (
        persistedUser?.image ||
        persistedUser?.profileImage ||
        persistedUser?.avatar ||
        ""
      );
    }
  } catch {
    // ignore parse errors
  }

  return "";
};
