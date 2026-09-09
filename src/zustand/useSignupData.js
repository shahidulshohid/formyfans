import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSignupData = create(
  persist(
    (set) => ({
      signupData: null,
      setSignupData: (signupData) => set({ signupData }),
      clearSignupData: () => set({ signupData: null }),
    }),
    {
      name: "signupData",
    }
  )
);

export default useSignupData;
