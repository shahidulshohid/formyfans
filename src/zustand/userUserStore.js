import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DUMMY_USER, DUMMY_TOKEN } from "../constants/dummyAuth";

const useUserStore = create(
  persist(
    (set) => ({
      user: DUMMY_USER,
      token: DUMMY_TOKEN,
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
