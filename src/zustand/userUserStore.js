import { create } from "zustand";
import { persist } from "zustand/middleware";


const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUserData: (userOrUpdater) =>
        set((state) => ({
          user:
            typeof userOrUpdater === "function"
              ? userOrUpdater(state.user)
              : userOrUpdater,
        })),
      setToken: (token) => set({ token }),
      setAuthData: ({ user, token }) => set({ user, token }),
      clearUserData: () => {
        set({ user: null, token: null });
        localStorage.clear();
      },
    }),
    {
      name: "userData",
    }
  )
);

export default useUserStore;
