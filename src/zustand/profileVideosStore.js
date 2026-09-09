import { create } from "zustand";
import { getMediaByUsername } from "../api/modules/media";

const INITIAL_PAGINATION = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const createDefaultUsernameState = () => ({
  videos: [],
  pagination: { ...INITIAL_PAGINATION },
  scrollPosition: 0,
  isInitialized: false,
  isLoading: false,
  isLoadingMore: false,
});

const useProfileVideosStore = create((set, get) => ({
  cache: {},

  setScrollPosition: (username, scrollPosition) => {
    if (!username) return;
    set((state) => ({
      cache: {
        ...state.cache,
        [username]: {
          ...(state.cache[username] || createDefaultUsernameState()),
          scrollPosition,
        },
      },
    }));
  },

  fetchVideos: async (username, { page = 1, reset = false } = {}) => {
    if (!username) return;

    const userState = get().cache[username] || createDefaultUsernameState();

    if (page === 1) {
      if (userState.isLoading) return;
    } else if (userState.isLoadingMore || !userState.pagination.hasNextPage) {
      return;
    }

    set((state) => ({
      cache: {
        ...state.cache,
        [username]: {
          ...(state.cache[username] || createDefaultUsernameState()),
          ...(page === 1 ? { isLoading: true } : { isLoadingMore: true }),
        },
      },
    }));

    try {
      const response = await getMediaByUsername(username, {
        type: "video",
        page,
        limit: userState.pagination.limit,
      });

      if (response?.status === 200 || response?.status === 201) {
        const payload = response?.data?.data ?? response?.data ?? {};
        const newVideos = Array.isArray(payload?.data) ? payload.data : [];
        const apiPagination = payload?.pagination ?? {};

        set((state) => {
          const current = state.cache[username] || createDefaultUsernameState();
          return {
            cache: {
              ...state.cache,
              [username]: {
                ...current,
                videos:
                  reset || page === 1
                    ? newVideos
                    : [...current.videos, ...newVideos],
                pagination: {
                  page: apiPagination.page ?? page,
                  limit: apiPagination.limit ?? current.pagination.limit,
                  total: apiPagination.totalCount ?? 0,
                  totalPages: apiPagination.totalPages ?? 0,
                  hasNextPage: apiPagination.hasNextPage ?? false,
                  hasPrevPage: apiPagination.hasPrevPage ?? false,
                },
                isInitialized: true,
                isLoading: false,
                isLoadingMore: false,
              },
            },
          };
        });
      }
    } catch {
      set((state) => ({
        cache: {
          ...state.cache,
          [username]: {
            ...(state.cache[username] || createDefaultUsernameState()),
            isLoading: false,
            isLoadingMore: false,
          },
        },
      }));
    }
  },

  loadMoreVideos: async (username) => {
    const userState = get().cache[username] || createDefaultUsernameState();
    if (!userState.pagination.hasNextPage) return;
    await get().fetchVideos(username, { page: userState.pagination.page + 1 });
  },

  prependVideo: (username, video) => {
    if (!username || !video) return;
    set((state) => {
      const current = state.cache[username] || createDefaultUsernameState();
      return {
        cache: {
          ...state.cache,
          [username]: {
            ...current,
            videos: [video, ...current.videos],
            pagination: {
              ...current.pagination,
              total: (current.pagination.total || 0) + 1,
            },
            isInitialized: true,
          },
        },
      };
    });
  },

  removeVideo: (username, videoId) => {
    if (!username || !videoId) return;
    set((state) => {
      const current = state.cache[username] || createDefaultUsernameState();
      return {
        cache: {
          ...state.cache,
          [username]: {
            ...current,
            videos: current.videos.filter((video) => video._id !== videoId),
            pagination: {
              ...current.pagination,
              total: Math.max(0, (current.pagination.total || 0) - 1),
            },
          },
        },
      };
    });
  },
}));

export default useProfileVideosStore;
