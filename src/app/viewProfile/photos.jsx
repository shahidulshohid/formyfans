import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteMedia, uploadMedia } from "../../api/modules/media";
import ConfirmPopup from "../../components/pops";
import { deleteMediaService, uploadMediaService } from "../../utils/helper";
import useProfilePhotosStore from "../../zustand/profilePhotosStore";
import useUserStore from "../../zustand/userUserStore";
import { USER_ROLES } from "../../components/productForm/constants";
import { BecomeCreatorCard } from "../../components/cards";

const renderAddPhotoButton = (handleAddPhoto, loading = false) => (
  <Box
    onClick={!loading ? handleAddPhoto : undefined}
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
        <AddCircleOutlineOutlinedIcon />
        <Typography>Add Photo</Typography>
      </>
    )}
  </Box>
);
const EMPTY_PHOTOS = [];
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const Photos = () => {
  const { username } = useParams();
  const { user } = useUserStore();
  const filePickerRef = useRef(null);
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const hasRestoredScroll = useRef(false);

  const [isLoading, setIsLoading] = useState({
    upload: false,
    create: false,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const photos = useProfilePhotosStore(
    (state) => state.cache[username]?.photos ?? EMPTY_PHOTOS,
  );
  const pagination = useProfilePhotosStore(
    (state) => state.cache[username]?.pagination ?? DEFAULT_PAGINATION,
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
  const prependPhoto = useProfilePhotosStore((state) => state.prependPhoto);
  const removePhoto = useProfilePhotosStore((state) => state.removePhoto);
  const setScrollPosition = useProfilePhotosStore(
    (state) => state.setScrollPosition,
  );

  const isOwnProfile = user?.username === username;

  // Is Allowed to post as a creator
  const isAllowedToPost = isOwnProfile && user.role === USER_ROLES.USER;

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

  const handleChangeFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (
      !["image/png", "image/jpeg", "image/webp", "image/jpg"].includes(
        file.type,
      )
    ) {
      toast.error("Only PNG, JPG, or WEBP images are allowed.");
      return;
    }

    // ✅ Size check — 5MB max
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setIsLoading((prev) => ({ ...prev, upload: true }));
    try {
      const fileUrl = await uploadMediaService(file);
      if (fileUrl?.url) {
        await handleUploadMedia(fileUrl);
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, upload: false }));
    }
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
            resourceType: "image",
          });
        } catch {
          // ignore cleanup failure
        }

        removePhoto(username, deleteTarget._id);
        toast.success("Photo deleted successfully.");
        setDeleteTarget(null);
      } else {
        toast.error("Failed to delete photo. Please try again.");
      }
    } catch {
      toast.error("Failed to delete photo. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUploadMedia = async (file) => {
    try {
      const payload = {
        url: file.url,
        publicId: file.public_id,
        type: "photo",
        size: file.bytes,
      };
      setIsLoading((prev) => ({ ...prev, create: true }));
      const response = await uploadMedia(payload);
      if (response?.data?.status === "success") {
        toast.success("Image uploaded successfully.");
        const createdPhoto = response?.data?.data;
        if (createdPhoto?._id) {
          prependPhoto(username, createdPhoto);
        } else {
          fetchPhotos(username, { page: 1, reset: true });
        }
      } else {
        toast.error("Failed to save image. Please try again.");
      }
    } catch {
      toast.error("Failed to save image. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, create: false }));
    }
  };

  if (isAllowedToPost) {
    return <BecomeCreatorCard />;
  }

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
        {isOwnProfile && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <input
              ref={filePickerRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleChangeFile}
              style={{ display: "none" }}
            />
            {renderAddPhotoButton(
              () => filePickerRef.current?.click(),
              isLoading.upload || isLoading.create,
            )}
          </Grid>
        )}

        {photos.map((photo) => (
          <Grid key={photo._id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 350,
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "grey.200",
                "&:hover .profile-media-delete": {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src={photo.url}
                alt="Profile photo"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {isOwnProfile && (
                <IconButton
                  className="profile-media-delete"
                  aria-label="Delete photo"
                  onClick={() => setDeleteTarget(photo)}
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
                    zIndex: 2,
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
        title="Delete Photo?"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        variant="delete"
      />

      {!isPhotosLoading && photos.length === 0 && !isOwnProfile && (
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
