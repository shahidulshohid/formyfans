import { create } from "zustand";

const useInterestDialogStore = create((set) => ({
  open: false,
  selectedInterests: [],
  title: "Update Interests",
  onSave: null,
  openInterestDialog: ({
    selectedInterests = [],
    onSave,
    title = "Update Interests",
  } = {}) =>
    set({
      open: true,
      selectedInterests: [...selectedInterests],
      onSave,
      title,
    }),
  closeInterestDialog: () =>
    set({
      open: false,
      selectedInterests: [],
      onSave: null,
      title: "Update Interests",
    }),
}));

export default useInterestDialogStore;
