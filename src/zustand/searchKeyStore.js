import { create } from "zustand";

const useSearchKeyStore = create((set) => ({
    chat_search_value: "",
    creator_search_value: "",
    profile_followers_following_tab:0,

    setChatSearchValue: (value) => set({ chat_search_value: value }),
    setCreatorSearchValue: (value) => set({ creator_search_value: value }),
    setProfileFollowersFollowingTab: (value) => set({ profile_followers_following_tab: value }),
}));

export default useSearchKeyStore;