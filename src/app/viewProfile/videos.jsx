import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import {
  Box,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteMedia, uploadMedia } from "../../api/modules/media";
import ConfirmPopup from "../../components/pops";
import {
  createVideoThumbnail,
  deleteMediaService,
  uploadMediaService,
  getVideoDuration,
} from "../../utils/helper";
import useProfileVideosStore from "../../zustand/profileVideosStore";
import useUserStore from "../../zustand/userUserStore";
import { USER_ROLES } from "../../components/productForm/constants";
import { BecomeCreatorCard } from "../../components/cards";

const MAX_VIDEO_DURATION_SECONDS = 60;

const renderAddVideoButton = (handleAddVideo, loading = false) => (
  <Box
    onClick={!loading ? handleAddVideo : undefined}
    display="flex"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    gap={1}
    width="100%"
    height="350px"
    bgcolor="grey.200"
    borderRadius={1}
    border="1px dashed"
    borderColor="grey.300"
    sx={{
      opacity: loading ? 0.7 : 1,
      "&:hover": {
        borderColor: loading ? "grey.300" : "grey.400",
        cursor: loading ? "default" : "pointer",
      },
    }}
  >
    {loading ? (
      <CircularProgress size={24} sx={{ color: "#FF1572" }} />
    ) : (
      <>
        <VideoCallOutlinedIcon />
        <Typography>Add Video</Typography>
        <Typography fontSize={11} color="text.secondary">
          Max 1 minute
        </Typography>
      </>
    )}
  </Box>
);

const Videos = () => {
  const { username } = useParams();
  const { user } = useUserStore();
  const filePickerRef = useRef(null);
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const hasRestoredScroll = useRef(false);

  const [isLoading, setIsLoading] = useState({
    upload: false,
    create: false,
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
  const prependVideo = useProfileVideosStore((state) => state.prependVideo);
  const removeVideo = useProfileVideosStore((state) => state.removeVideo);
  const setScrollPosition = useProfileVideosStore(
    (state) => state.setScrollPosition,
  );

  const isOwnProfile = user?.username === username;

  // Is Allowed to post as a creator
  const isAllowedToPost = isOwnProfile && user.role === USER_ROLES.USER;

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;

    setDeleteLoading(true);
    try {
      const response = await deleteMedia(deleteTarget._id);
      if (response?.data?.status === "success" || response?.status === 200) {
        try {
          await deleteMediaService({
            publicId: deleteTarget.publicId,
            url: deleteTarget.url,
            resourceType: "video",
          });

          if (deleteTarget.thumbnail || deleteTarget.thumbnailPublicId) {
            await deleteMediaService({
              publicId: deleteTarget.thumbnailPublicId,
              url: deleteTarget.thumbnail,
              resourceType: "image",
            });
          }
        } catch {
          // ignore cleanup failure
        }

        if (selectedVideo?._id === deleteTarget._id) {
          handleCloseVideo();
        }

        removeVideo(username, deleteTarget._id);
        toast.success("Video deleted successfully.");
        setDeleteTarget(null);
      } else {
        toast.error("Failed to delete video. Please try again.");
      }
    } catch {
      toast.error("Failed to delete video. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChangeFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed.");
      return;
    }

    try {
      const duration = await getVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        toast.error("Video must be 1 minute or shorter.");
        return;
      }
    } catch {
      toast.error("Could not read video file. Please try another video.");
      return;
    }

    setIsLoading((prev) => ({ ...prev, upload: true }));
    try {
      const thumbnailFile = await createVideoThumbnail(file);
      const [videoUpload, thumbnailUpload] = await Promise.all([
        uploadMediaService(file),
        uploadMediaService(thumbnailFile),
      ]);

      if (videoUpload?.url) {
        await handleUploadMedia(videoUpload, thumbnailUpload);
      } else {
        toast.error("Failed to upload video. Please try again.");
      }
    } catch {
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const handleUploadMedia = async (videoFile, thumbnailFile) => {
    try {
      const payload = {
        url: videoFile.url,
        publicId: videoFile.public_id,
        type: "video",
        size: videoFile.bytes,
        thumbnail: thumbnailFile?.url || "",
        thumbnailPublicId: thumbnailFile?.public_id || "",
      };
      setIsLoading((prev) => ({ ...prev, create: true }));
      const response = await uploadMedia(payload);
      if (response?.data?.status === "success") {
        toast.success("Video uploaded successfully.");
        const createdVideo = response?.data?.data;
        if (createdVideo?._id) {
          prependVideo(username, createdVideo);
        } else {
          fetchVideos(username, { page: 1, reset: true });
        }
      } else {
        toast.error("Failed to save video. Please try again.");
      }
    } catch {
      toast.error("Failed to save video. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, create: false }));
    }
  };

  if (isAllowedToPost) {
    return <BecomeCreatorCard />;
  }

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
        {isOwnProfile && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <input
              ref={filePickerRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleChangeFile}
              style={{ display: "none" }}
            />
            {renderAddVideoButton(
              () => filePickerRef.current?.click(),
              isLoading.upload || isLoading.create,
            )}
          </Grid>
        )}

        {videos.map((video) => (
          <Grid key={video._id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              onClick={() => handleOpenVideo(video)}
              sx={{
                position: "relative",
                width: "100%",
                height: 350,
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "#1a1a1a",
                cursor: "pointer",
                "&:hover .profile-media-delete": {
                  opacity: 1,
                },
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

              {isOwnProfile && (
                <IconButton
                  className="profile-media-delete"
                  aria-label="Delete video"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(video);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    bgcolor: "#FF1572",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    zIndex: 3,
                    "&:hover": {
                      bgcolor: "#e01265",
                    },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <ConfirmPopup
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Video?"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        variant="delete"
      />

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

      {!isVideosLoading && videos.length === 0 && !isOwnProfile && (
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
