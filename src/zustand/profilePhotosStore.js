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
  photos: [],
  pagination: { ...INITIAL_PAGINATION },
  scrollPosition: 0,
  isInitialized: false,
  isLoading: false,
  isLoadingMore: false,
});

const useProfilePhotosStore = create((set, get) => ({
  cache: {},

  getUsernameState: (username) =>
    get().cache[username] || createDefaultUsernameState(),

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

  fetchPhotos: async (username, { page = 1, reset = false } = {}) => {
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
        type: "photo",
        page,
        limit: userState.pagination.limit,
      });

      if (response?.status === 200 || response?.status === 201) {
        const payload = response?.data?.data ?? {};
        const newPhotos = Array.isArray(payload?.data) ? payload.data : [];
        const apiPagination = payload?.pagination ?? {};

        set((state) => {
          const current = state.cache[username] || createDefaultUsernameState();
          return {
            cache: {
              ...state.cache,
              [username]: {
                ...current,
                photos:
                  reset || page === 1
                    ? newPhotos
                    : [...current.photos, ...newPhotos],
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

  loadMorePhotos: async (username) => {
    const userState = get().cache[username] || createDefaultUsernameState();
    if (!userState.pagination.hasNextPage) return;
    await get().fetchPhotos(username, { page: userState.pagination.page + 1 });
  },

  prependPhoto: (username, photo) => {
    if (!username || !photo) return;
    set((state) => {
      const current = state.cache[username] || createDefaultUsernameState();
      return {
        cache: {
          ...state.cache,
          [username]: {
            ...current,
            photos: [photo, ...current.photos],
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

  removePhoto: (username, photoId) => {
    if (!username || !photoId) return;
    set((state) => {
      const current = state.cache[username] || createDefaultUsernameState();
      return {
        cache: {
          ...state.cache,
          [username]: {
            ...current,
            photos: current.photos.filter((photo) => photo._id !== photoId),
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

export default useProfilePhotosStore;
