import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import useProfilePhotosStore from "../../zustand/profilePhotosStore";
import useUserStore from "../../zustand/userUserStore";

const Photos = () => {
  const { user } = useUserStore();
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const hasRestoredScroll = useRef(false);
  const username = user?.username;

  const photos = useProfilePhotosStore(
    (state) => state.cache[username]?.photos ?? [],
  );
  const pagination = useProfilePhotosStore(
    (state) =>
      state.cache[username]?.pagination ?? {
        page: 1,
        limit: 4,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
  );
  const scrollPosition = useProfilePhotosStore(
    (state) => state.cache[username]?.scrollPosition ?? 0,
  );
  const isInitialized = useProfilePhotosStore(
    (state) => state.cache[username]?.isInitialized ?? false,
  );
  const isPhotosLoading = useProfilePhotosStore(
    (state) => state.cache[username]?.isLoading ?? false,
  );
  const isLoadingMore = useProfilePhotosStore(
    (state) => state.cache[username]?.isLoadingMore ?? false,
  );

  const fetchPhotos = useProfilePhotosStore((state) => state.fetchPhotos);
  const loadMorePhotos = useProfilePhotosStore((state) => state.loadMorePhotos);
  const setScrollPosition = useProfilePhotosStore(
    (state) => state.setScrollPosition,
  );

  useEffect(() => {
    if (!username) return;
    const state = useProfilePhotosStore.getState().cache[username];
    if (!state?.isInitialized) {
      fetchPhotos(username, { page: 1, reset: true });
    }
  }, [username, fetchPhotos]);

  useEffect(() => {
    isFetchingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  useEffect(() => {
    if (!username) return;

    const handleScroll = () => {
      setScrollPosition(username, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      setScrollPosition(username, window.scrollY);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [username, setScrollPosition]);

  useEffect(() => {
    hasRestoredScroll.current = false;
  }, [username]);

  useEffect(() => {
    if (!isInitialized || hasRestoredScroll.current || scrollPosition <= 0) {
      return;
    }

    const restoreScroll = () => {
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
      hasRestoredScroll.current = true;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(restoreScroll);
    });
  }, [isInitialized, scrollPosition, photos.length]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          pagination.hasNextPage &&
          !isFetchingMoreRef.current &&
          username
        ) {
          loadMorePhotos(username);
        }
      },
      { threshold: 0.1, rootMargin: "120px" },
    );

    const loaderNode = loaderRef.current;
    if (loaderNode) {
      observerRef.current.observe(loaderNode);
    }

    return () => observerRef.current?.disconnect();
  }, [pagination.hasNextPage, loadMorePhotos, username, photos.length]);

  if (isPhotosLoading && photos.length === 0) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress sx={{ color: "#FF1572" }} />
      </Box>
    );
  }

  return (
    <Box my={2}>
      <Grid container spacing={2}>
        {photos.map((photo) => (
          <Grid key={photo._id} size={{ xs: 12, sm: 6 }}>
            <Box
              position="relative"
              width="100%"
              height={180}
              bgcolor="grey.200"
              border="4px solid"
              borderColor="background.lightGray"
              borderRadius="10px"
              overflow="hidden"
            >
              <Box
                component="img"
                src={photo.url}
                alt="Profile photo"
                loading="lazy"
                width="100%"
                height="100%"
                display="block"
                sx={{
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {!isPhotosLoading && photos.length === 0 && (
        <Box py={6} textAlign="center">
          <Typography color="text.secondary">No photos yet.</Typography>
        </Box>
      )}

      <Box
        ref={loaderRef}
        py={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={48}
      >
        {isLoadingMore && (
          <CircularProgress size={28} sx={{ color: "#FF1572" }} />
        )}
      </Box>
    </Box>
  );
};

export default Photos;
