import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
    Box,
    CircularProgress,
    Dialog,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import useProfileVideosStore from "../../zustand/profileVideosStore";
import useUserStore from "../../zustand/userUserStore";

const Videos = () => {
  const { user } = useUserStore();
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const hasRestoredScroll = useRef(false);
  const username = user?.username;

  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = useProfileVideosStore(
    (state) => state.cache[username]?.videos ?? [],
  );
  const pagination = useProfileVideosStore(
    (state) =>
      state.cache[username]?.pagination ?? {
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
  );
  const scrollPosition = useProfileVideosStore(
    (state) => state.cache[username]?.scrollPosition ?? 0,
  );
  const isInitialized = useProfileVideosStore(
    (state) => state.cache[username]?.isInitialized ?? false,
  );
  const isVideosLoading = useProfileVideosStore(
    (state) => state.cache[username]?.isLoading ?? false,
  );
  const isLoadingMore = useProfileVideosStore(
    (state) => state.cache[username]?.isLoadingMore ?? false,
  );

  const fetchVideos = useProfileVideosStore((state) => state.fetchVideos);
  const loadMoreVideos = useProfileVideosStore((state) => state.loadMoreVideos);
  const setScrollPosition = useProfileVideosStore(
    (state) => state.setScrollPosition,
  );

  useEffect(() => {
    if (!username) return;
    const state = useProfileVideosStore.getState().cache[username];
    if (!state?.isInitialized) {
      fetchVideos(username, { page: 1, reset: true });
    }
  }, [username, fetchVideos]);

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
  }, [isInitialized, scrollPosition, videos.length]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          pagination.hasNextPage &&
          !isFetchingMoreRef.current &&
          username
        ) {
          loadMoreVideos(username);
        }
      },
      { threshold: 0.1, rootMargin: "120px" },
    );

    const loaderNode = loaderRef.current;
    if (loaderNode) {
      observerRef.current.observe(loaderNode);
    }

    return () => observerRef.current?.disconnect();
  }, [pagination.hasNextPage, loadMoreVideos, username, videos.length]);

  const handleOpenVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoRef = (node) => {
    videoPlayerRef.current = node;
    if (!node) return;

    const playVideo = () => node.play().catch(() => {});
    if (node.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      playVideo();
    } else {
      node.addEventListener("canplay", playVideo, { once: true });
    }
  };

  const handleCloseVideo = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      videoPlayerRef.current.currentTime = 0;
    }
    setSelectedVideo(null);
  };

  if (isVideosLoading && videos.length === 0) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress sx={{ color: "#FF1572" }} />
      </Box>
    );
  }

  return (
    <Box my={2}>
      <Grid container spacing={2}>
        {videos.map((video) => (
          <Grid key={video._id} size={{ xs: 12, sm: 6 }}>
            <Box
              onClick={() => handleOpenVideo(video)}
              position="relative"
              width="100%"
              height={180}
              borderRadius="10px"
              overflow="hidden"
              bgcolor="#1a1a1a"
              sx={{
                cursor: "pointer",
              }}
            >
              {video.thumbnail ? (
                <Box
                  component="img"
                  src={video.thumbnail}
                  alt="Video thumbnail"
                  loading="lazy"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "#1a1a1a",
                  }}
                />
              )}

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.45)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PlayArrowIcon
                    sx={{ fontSize: 40, color: "#FF1572", ml: 0.5 }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!selectedVideo}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEntered: () => {
            videoPlayerRef.current?.play().catch(() => {});
          },
        }}
        PaperProps={{
          sx: {
            bgcolor: "#000",
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={handleCloseVideo}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            zIndex: 1,
            color: "#fff",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {selectedVideo && (
          <Box
            component="video"
            ref={handleVideoRef}
            src={selectedVideo.url}
            controls
            autoPlay
            playsInline
            onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
            sx={{
              width: "100%",
              maxHeight: "80vh",
              display: "block",
              outline: "none",
            }}
          />
        )}
      </Dialog>

      {!isVideosLoading && videos.length === 0 && (
        <Box py={6} textAlign="center">
          <Typography color="text.secondary">No videos yet.</Typography>
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

export default Videos;
