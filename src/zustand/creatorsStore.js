import { create } from "zustand";
import { getAllCreators } from "../api/modules/profile";

const INITIAL_PAGINATION = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const useCreatorsStore = create((set, get) => ({
  creators: [],
  pagination: INITIAL_PAGINATION,
  scrollPosition: 0,
  isInitialized: false,
  isLoading: false,
  isLoadingMore: false,

  setScrollPosition: (scrollPosition) => set({ scrollPosition }),

  resetCreators: () =>
    set({
      creators: [],
      pagination: INITIAL_PAGINATION,
      scrollPosition: 0,
      isInitialized: false,
      isLoading: false,
      isLoadingMore: false,
    }),

  fetchCreators: async ({ page = 1, reset = false, search = "" } = {}) => {
    const state = get();

    if (page === 1) {
      if (state.isLoading) return;
    } else if (state.isLoadingMore || !state.pagination.hasNextPage) {
      return;
    }

    set(page === 1 ? { isLoading: true } : { isLoadingMore: true });

    try {
      const response = await getAllCreators({
        page,
        limit: state.pagination.limit,
        search,
      });

      if (response?.data?.status === "success") {
        const newCreators = response.data.data?.data ?? [];
        const apiPagination = response.data.data?.pagination ?? {};

        set((current) => ({
          creators:
            reset || page === 1
              ? newCreators
              : [...current.creators, ...newCreators],
          pagination: {
            page: apiPagination.page ?? page,
            limit: apiPagination.limit ?? current.pagination.limit,
            total: apiPagination.totalCount ?? 0,
            totalPages: apiPagination.totalPages ?? 0,
            hasNextPage: apiPagination.hasNextPage ?? false,
            hasPrevPage: apiPagination.hasPrevPage ?? false,
          },
          isInitialized: true,
        }));
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  loadMoreCreators: async () => {
    const { pagination, fetchCreators } = get();
    if (!pagination.hasNextPage) return;
    await fetchCreators({ page: pagination.page + 1 });
  },

  setCreators: (creators) => set({ creators }),

  updateCreatorFollow: (userId, { isFollowing, followersCount }) =>
    set((state) => ({
      creators: state.creators.map((creator) =>
        creator._id === userId
          ? { ...creator, isFollowing, followersCount }
          : creator,
      ),
    })),

  updateCreatorFavorite: (userId, { isFavourite }) =>
    set((state) => ({
      creators: state.creators.map((creator) =>
        creator._id === userId ? { ...creator, isFavourite } : creator,
      ),
    })),
}));

export default useCreatorsStore;
