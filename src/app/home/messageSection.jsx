import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createConversation } from "../../api/modules/conversation";
import {
  createCampaignComment,
  likeCampaign,
  unlikeCampaign,
} from "../../api/modules/campaign";
import { follow } from "../../api/modules/follow";
import {
  createComment,
  createPost,
  deletePost,
  getPosts,
  likePost,
  unlikePost,
  updatePost,
} from "../../api/modules/post";
import Camera from "../../assets/icon/camera.svg";
import Gallery from "../../assets/icon/gallery.svg";
import Gif from "../../assets/icon/gif.svg";
import { CampaignCard, PostCard } from "../../components/cards";
import { CollaborativeDealPicker } from "../../components/collaborativedealpicker";
import CustomButton from "../../components/cutomButon";
import CustomInput from "../../components/cutomInput";
import {
  CameraDialog,
  CampaignDetailDialog,
  DealPickerDialog,
  PostCommentsDialog,
  PostDetailDialog,
  PostLikesDialog,
  SharePostDialog,
} from "../../components/dialogs";
import ConfirmPopup from "../../components/pops";
import { USER_ROLES } from "../../components/productForm/constants";
import PostCardSkeleton from "../../components/skeleton/PostCardSkeleton";
import PostMediaPreviewSkeleton from "../../components/skeleton/PostMediaPreviewSkeleton";
import { MAX_VIDEO_DURATION_SECONDS } from "../../constants/common";
import {
  getVideoDuration,
  modifyConversations,
  uploadMediaService,
} from "../../utils/helper";
import { getFullS3Url } from "../../utils/s3Helper";
import useActiveChatStore from "../../zustand/activeChatStore";
import useConversationStore from "../../zustand/conversationStore";
import useUserStore from "../../zustand/userUserStore";

const MessageSection = () => {
  // Navigation
  const navigate = useNavigate();
  // Post Detail Dialog Ref
  const postDetailDialogRef = useRef(null);
  // Campaign Detail Dialog Ref
  const campaignDetailDialogRef = useRef(null);
  // Post Comments Dialog Ref
  const postCommentsDialogRef = useRef(null);
  // Post Likes Dialog Ref
  const postLikesDialogRef = useRef(null);
  // Share Post Dialog Ref
  const sharePostDialogRef = useRef(null);
  // Camera Image Input Ref
  const cameraImageInputRef = useRef(null);
  // Gallery Image Input Ref
  const galleryImageInputRef = useRef(null);
  // Gif Image Input Ref
  const gifImageInputRef = useRef(null);
  // Observer Ref
  const observerRef = useRef(null);
  // Loader Ref
  const loaderRef = useRef(null);
  // Pagination Ref
  const paginationRef = useRef({ page: 1, hasNextPage: false });
  // Is Fetching More Ref
  const isFetchingMoreRef = useRef(false);
  // User Data
  const { user } = useUserStore();
  // Active Chat Store
  const { activeChat, setActiveChat } = useActiveChatStore();
  // Conversation Store
  const { fetchConversations } = useConversationStore();
  // Post List
  const [postList, setPostList] = useState([]);
  // Loading State
  const [isLoading, setIsLoading] = useState({
    post: false,
    getPosts: false,
    likeDislikePost: false,
    createPost: false,
    imageUpload: false,
  });
  // Form Data
  const [formData, setFormData] = useState({
    post: "",
    images: [],
  });
  // Camera Modal Open State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  // Edit Post State
  const [editingPostId, setEditingPostId] = useState(null);
  // Delete Post State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Post Type
  const [contentType, setContentType] = useState("post");
  const [postType, setPostType] = useState("own");
  const [dealPickerOpen, setDealPickerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const REEL_MAX_DURATION_SECONDS = 60;

  // Device detection -
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleContentTypeChange = (e) => {
    const value = e.target.value;
    setContentType(value);
    if (value === "reel") {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((item) => item.mediaType === "video"),
      }));
    }
  };

  // When the person switches back to "Own", clear any attached deal
  const handlePostTypeChange = (e) => {
    const value = e.target.value;
    setPostType(value);
    if (value === "own") {
      setSelectedDeal(null);
    } else {
      setDealPickerOpen(true);
    }
  };

  // Handle Remove Image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = async (event, type) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (contentType === "reel" && !isVideo) {
      toast.error("Reel can only contain a video.");
      return;
    }

    if (!isImage && !isVideo) {
      toast.error("Please select a valid image or video file.");
      return;
    }

    if (type === "gif" && file.type !== "image/gif") {
      toast.error("Please select a valid GIF file.");
      return;
    }

    if (type === "gallery") {
      if (contentType === "reel") {
        if (!isVideo) {
          toast.error("Reel can only contain a video.");
          return;
        }

        if (
          !["video/mp4", "video/quicktime", "video/webm"].includes(file.type)
        ) {
          toast.error("Only MP4, MOV, or WEBM videos are allowed for reels.");
          return;
        }
      } else {
        if (
          isImage &&
          !["image/png", "image/jpeg", "image/webp"].includes(file.type)
        ) {
          toast.error("Only PNG, JPG, or WEBP images are allowed.");
          return;
        }

        if (
          isVideo &&
          !["video/mp4", "video/quicktime", "video/webm"].includes(file.type)
        ) {
          toast.error("Only MP4, MOV, or WEBM videos are allowed.");
          return;
        }
      }
    }

    if (isVideo) {
      try {
        const duration = await getVideoDuration(file);
        const maxDuration =
          contentType === "reel"
            ? REEL_MAX_DURATION_SECONDS
            : MAX_VIDEO_DURATION_SECONDS;

        if (duration > maxDuration) {
          toast.error(
            `Video must be ${
              contentType === "reel" ? "60 seconds" : "1 hour"
            } or shorter.`,
          );
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not read this video, please try a different file.");
        return;
      }
    }

    setIsLoading((prev) => ({ ...prev, imageUpload: true }));
    try {
      const uploaded = await uploadMediaService(file);
      const mediaType = type === "gif" ? "gif" : isVideo ? "video" : "image";

      if (type === "camera") {
        setFormData((prev) => ({
          ...prev,
          images: [{ mediaType, fileName: uploaded?.fileName }],
        }));
      } else if (type === "gallery") {
        setFormData((prev) => ({
          ...prev,
          images: [{ mediaType, fileName: uploaded?.fileName }],
        }));
      } else if (type === "gif") {
        setFormData((prev) => ({
          ...prev,
          images: [{ mediaType: "gif", fileName: uploaded?.fileName }],
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed, please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, imageUpload: false }));
    }
  };

  // Handle Camera Capture
  const handleCameraCapture = async (file) => {
    setIsLoading((prev) => ({ ...prev, imageUpload: true }));
    const uploaded = await uploadMediaService(file);
    setFormData((prev) => ({
      ...prev,
      images: [{ mediaType: "image", fileName: uploaded?.fileName }],
    }));
    setIsLoading((prev) => ({ ...prev, imageUpload: false }));
  };

  // Handle Create / Update Post
  const handleCreatePost = async () => {
    if (contentType === "reel") {
      if (
        !formData.images?.length ||
        !formData.images.some((item) => item.mediaType === "video")
      ) {
        toast.error("Reel must include a video.");
        return;
      }
    } else if (!formData.post?.trim() && formData.images?.length === 0) {
      toast.error(
        "Please enter a post or select at least one image, gif, or video",
      );
      return;
    }

    try {
      setIsLoading((prev) => ({ ...prev, createPost: true }));
      const payload = {
        caption: formData.post,
        media: formData.images,
        ...(!editingPostId && { contentType }),
        ...(!editingPostId && selectedDeal && postType === "collaborative"
          ? { dealId: selectedDeal._id }
          : {}),
      };

      const response = editingPostId
        ? await updatePost(editingPostId, payload)
        : await createPost(payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        setFormData({
          post: "",
          images: [],
        });

        setSelectedDeal(null);
        setPostType("own");

        if (editingPostId) {
          setPostList((prev) =>
            prev.map((post) =>
              post._id === editingPostId ? response.data.post : post,
            ),
          );
          setEditingPostId(null);
        } else {
          setTimeout(() => {
            setPostList((prev) => [response.data.post, ...prev]);
          }, 800);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, createPost: false }));
    }
  };

  // Handle Edit Post
  const handleEditPost = useCallback((post) => {
    setEditingPostId(post._id);
    setFormData({
      post: post.caption || "",
      images: post.media || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle Delete Post
  const handleDeletePost = useCallback((post) => {
    setDeleteTarget(post);
  }, []);

  const handleConfirmDeletePost = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      const response = await deletePost(deleteTarget._id);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        setPostList((prev) =>
          prev.filter((post) => post._id !== deleteTarget._id),
        );
        if (editingPostId === deleteTarget._id) {
          setEditingPostId(null);
          setFormData({ post: "", images: [] });
        }
        setDeleteTarget(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Like Dislike Post
  const handleLikeDislikePost = useCallback(async (postId, isLiked) => {
    const originalList = postList;

    setPostList((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.likesCount + (post.isLiked ? -1 : 1),
            }
          : post,
      ),
    );

    try {
      await (isLiked ? likePost({ postId }) : unlikePost(postId));
    } catch (error) {
      setPostList(originalList);
      // toast.error(error?.message);
    }
  }, []);

  // Handle Like Dislike Campaign
  const handleLikeDislikeCampaign = useCallback(async (campaignId, isLiked) => {
    const originalList = postList;

    setPostList((prev) =>
      prev.map((item) =>
        item._id === campaignId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likesCount: item.likesCount + (item.isLiked ? -1 : 1),
            }
          : item,
      ),
    );

    try {
      await (isLiked ? likeCampaign(campaignId) : unlikeCampaign(campaignId));
    } catch (error) {
      setPostList(originalList);
    }
  }, []);

  // Handle Create Comment
  const handleCreateComment = useCallback(async (postId, commentContent) => {
    setPostList((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              commentsCount: post.commentsCount + 1,
            }
          : post,
      ),
    );

    try {
      const payload = {
        content: commentContent,
      };
      const response = await createComment(postId, payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("error", error);
    }
  }, []);

  // Handle Create Campaign Comment
  const handleCreateCampaignComment = useCallback(
    async (campaignId, commentContent) => {
      setPostList((prev) =>
        prev.map((item) =>
          item._id === campaignId
            ? {
                ...item,
                commentsCount: (item.commentsCount ?? 0) + 1,
              }
            : item,
        ),
      );

      try {
        const response = await createCampaignComment(campaignId, {
          content: commentContent,
        });
        if (response.status === 200 || response.status === 201) {
          toast.success(response.data.message);
        }
      } catch (error) {
        console.error("error", error);
      }
    },
    [],
  );

  // Handle Open Post Comments Dialog
  const handleOpenPostCommentsDialog = useCallback((post) => {
    postDetailDialogRef.current?.open(post);
  }, []);

  // Handle Open Campaign Comments Dialog
  const handleOpenCampaignCommentsDialog = useCallback((campaign) => {
    campaignDetailDialogRef.current?.open(campaign);
  }, []);

  // Handle Open Post Likes Dialog
  const handleOpenPostLikesDialog = useCallback((post) => {
    postLikesDialogRef.current?.open({ data: post });
  }, []);

  // Handle Get Posts
  const handleGetPosts = async (page = 1) => {
    if (isFetchingMoreRef.current) return;

    try {
      page === 1
        ? setIsLoading((prev) => ({ ...prev, getPosts: true }))
        : (() => {
            isFetchingMoreRef.current = true;
          })();

      const response = await getPosts({ page, limit: 8 });
      if (response.status === 200 || response.status === 201) {
        const newPosts = response.data.data;
        const paginationData = response.data.pagination;
        setPostList((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));

        paginationRef.current = {
          page: paginationData?.page,
          hasNextPage: paginationData?.hasNextPage,
        };
      }
    } catch (error) {
      toast.error(error?.message);
    } finally {
      page === 1
        ? setIsLoading((prev) => ({ ...prev, getPosts: false }))
        : (() => {
            isFetchingMoreRef.current = false;
          })();
    }
  };

  // Use Effect to Observe Posts
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          paginationRef.current.hasNextPage &&
          !isFetchingMoreRef.current
        ) {
          handleGetPosts(paginationRef.current.page + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) observerRef.current.observe(loaderRef.current);

    return () => observerRef.current?.disconnect();
  }, []);

  // Use Effect to Get Posts
  useEffect(() => {
    handleGetPosts();
  }, []);

  const hasContent =
    Boolean(formData.post?.trim()) || formData.images?.length > 0;
  const canShowPostButton =
    postType === "collaborative"
      ? Boolean(selectedDeal) && hasContent
      : hasContent;

  // Render Post Actions
  const renderPostActions = () => {
    if (!user || user?.role !== USER_ROLES.CREATOR) return null;
    return (
      <Box
        bgcolor={"background.lightgray"}
        border="1px solid"
        borderColor="divider"
        borderRadius={"10px"}
        p={2}
        pt={!editingPostId ? 1 : 2}
        mt={2}
      >
        {!editingPostId && (
          <FormControl>
            <RadioGroup
              aria-labelledby="post-type-label"
              name="controlled-radio-buttons-group"
              value={contentType}
              onChange={handleContentTypeChange}
              sx={{ flexDirection: "row", gap: 2, mt: 1 }}
            >
              <FormControlLabel value="post" control={<Radio />} label="Post" />
              <FormControlLabel value="reel" control={<Radio />} label="Reel" />
              
            </RadioGroup>
          </FormControl>
        )}
        <Stack direction="row" alignItems="center" gap={1}>
          {/* <Avatar
            src={user?.image || ProfileImage}
            sx={{
              border: "3px solid",
              borderColor: "text.deepPink",
              width: "40px",
              height: "40px",
            }}
          /> */}

          <Box flex={1}>
            <CustomInput
              placeholder="Tell your friends about your thoughts.."
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, post: e.target.value }))
              }
              value={formData.post}
              type="text"
              name="post"
              borderRadius="40px"
              sx={{
                "& .MuiInputBase-input": {
                  color: "primary.white",
                  padding: "10px 15px",
                },
              }}
            />
          </Box>
          <IconButton
            sx={{
              p: 1.3,
              backgroundColor: "background.darkBrown",
              "&:hover": {
                backgroundColor: "background.darkBrown",
              },
            }}
            onClick={() => galleryImageInputRef.current?.click()}
          >
            <img
              src={Gallery}
              alt="gallery"
              style={{ width: "20px", height: "20px" }}
            />
            <input
              type="file"
              ref={galleryImageInputRef}
              style={{ display: "none" }}
              accept={
                contentType === "reel"
                  ? "video/mp4,video/webm,video/quicktime"
                  : "image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime"
              }
              onChange={(e) => handleImageChange(e, "gallery")}
            />
          </IconButton>
          {contentType !== "reel" && (
            <IconButton
              sx={{
                p: 1,
                backgroundColor: "background.darkBrown",
                "&:hover": {
                  backgroundColor: "background.darkBrown",
                },
              }}
              onClick={() => gifImageInputRef.current?.click()}
            >
              <img src={Gif} alt="gif" />
              <input
                type="file"
                ref={gifImageInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => handleImageChange(e, "gif")}
              />
            </IconButton>
          )}
          <IconButton
            sx={{
              p: 1,
              backgroundColor: "background.darkBrown",
              "&:hover": { backgroundColor: "background.darkBrown" },
            }}
            onClick={() => {
              if (contentType === "reel" || isMobile) {
                cameraImageInputRef.current?.click();
              } else {
                setCameraModalOpen(true);
              }
            }}
          >
            <img src={Camera} alt="camera" />
            <input
              type="file"
              ref={cameraImageInputRef}
              style={{ display: "none" }}
              accept={
                contentType === "reel"
                  ? "video/mp4,video/webm,video/quicktime"
                  : "image/*"
              }
              capture={isMobile ? "environment" : undefined}
              onChange={(e) => handleImageChange(e, "camera")}
            />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1}>
          {contentType === "reel" && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Reel upload supports only video and must be 50 seconds or shorter.
            </Typography>
          )}
          {isLoading.imageUpload && <PostMediaPreviewSkeleton />}

          {formData.images?.length > 0 && (
            <Box mt={2}>
              <Box display="flex" gap={1} flexWrap="wrap">
                {formData.images.map((file, index) => {
                  const isVideo =
                    file.mediaType === "video";

                  return (
                    <Box
                      key={index}
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: "10px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {isVideo ? (
                        <>
                          <Box
                            component="video"
                            src={getFullS3Url(file.fileName || file.url)}
                            muted
                            playsInline
                            preload="metadata"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              bgcolor: "#1a1a1a",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(0, 0, 0, 0.35)",
                              pointerEvents: "none",
                            }}
                          >
                            <PlayArrowIcon
                              sx={{ color: "#fff", fontSize: 32 }}
                            />
                          </Box>
                        </>
                      ) : (
                        <img
                          src={getFullS3Url(file.fileName || file.url)}
                          alt={`preview-${index}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          width: 24,
                          height: 24,
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.8)",
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Stack>

        {!editingPostId && (
          <>
            <FormControl>
              <RadioGroup
                aria-labelledby="post-type-label"
                name="controlled-radio-buttons-group"
                value={postType}
                onChange={handlePostTypeChange}
                sx={{ flexDirection: "row", gap: 2, mt: 1 }}
              >
                <FormControlLabel value="own" control={<Radio />} label="Own" />
                <FormControlLabel
                  value="collaborative"
                  control={<Radio />}
                  label="Collaborative"
                />
              </RadioGroup>
            </FormControl>

            {postType === "collaborative" && (
              <CollaborativeDealPicker
                deal={selectedDeal}
                onOpenPicker={() => setDealPickerOpen(true)}
              />
            )}
          </>
        )}

        {canShowPostButton && (
          <Stack direction={"row"} justifyContent={"flex-end"} mt={2}>
            <CustomButton
              title={editingPostId ? "Update" : "Post"}
              width={"100px"}
              sx={{ color: "text.darkBrown" }}
              onClick={handleCreatePost}
              loading={isLoading.createPost}
            />
          </Stack>
        )}
        <CameraDialog
          open={cameraModalOpen}
          onClose={() => setCameraModalOpen(false)}
          onCapture={handleCameraCapture}
        />
      </Box>
    );
  };

  // Render Loader
  const renderPostSkeletonLoader = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <PostCardSkeleton key={index} />
    ));
  };

  // Render No Posts Found
  const renderNoPostsFound = () => {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <Typography variant="body1" color="text.primary">
          No posts found
        </Typography>
      </Box>
    );
  };

  // Handle Initiate Chat
  const handleInitiateChat = useCallback(async (post) => {
    try {
      const response = await createConversation({
        participantId: post.author._id,
      });

      if (response.status === 200 || response.status === 201) {
        // toast.success(response.data.message);
        const modifiedConversations = modifyConversations(
          [response.data.data],
          user,
        );

        setActiveChat(modifiedConversations[0]);
        fetchConversations();
        navigate("/chat");
      } else {
        // toast.error(response.data.message);
      }
    } catch (error) {
      // toast.error(error?.message);
    }
  }, []);

  // Handle Follow Campaign Creator
  const handleFollowCampaignCreator = useCallback(async (creatorId) => {
    if (!creatorId) return;

    const originalList = postList;

    setPostList((prev) =>
      prev.map((item) =>
        item.itemType === "campaign" &&
        item.creator?._id?.toString() === creatorId.toString()
          ? {
              ...item,
              creator: {
                ...item.creator,
                isFollowing: true,
              },
            }
          : item,
      ),
    );

    try {
      const response = await follow({ userId: creatorId });
      if (!(response.status === 200 || response.status === 201)) {
        throw new Error(response?.data?.message || "Follow failed");
      }
      toast.success(response?.data?.message || "Followed successfully");
    } catch (error) {
      setPostList(originalList);
      toast.error(error?.response?.data?.message || error?.message);
    }
  }, []);

  // Handle Open Share Post Dialog
  const handleOpenSharePostDialog = useCallback((post) => {
    sharePostDialogRef.current?.open({ data: post });
  }, []);

  // Use Memo to Render Post List
  const postListMemo = useMemo(() => {
    return postList.map((item) => {
      if (item.itemType === "campaign") {
        return (
          <CampaignCard
            key={item._id}
            campaign={item}
            handleLikeDislikePost={handleLikeDislikeCampaign}
            handleCreateComment={handleCreateCampaignComment}
            handleOpenPostCommentsDialog={handleOpenCampaignCommentsDialog}
            handleOpenPostLikesDialog={handleOpenPostLikesDialog}
            handleSharePost={handleOpenSharePostDialog}
            handleFollowCreator={handleFollowCampaignCreator}
          />
        );
      }

      return (
        <PostCard
          key={item._id}
          post={item}
          handleLikeDislikePost={handleLikeDislikePost}
          handleCreateComment={handleCreateComment}
          handleOpenPostCommentsDialog={handleOpenPostCommentsDialog}
          handleOpenPostLikesDialog={handleOpenPostLikesDialog}
          handleInitiateChat={handleInitiateChat}
          handleEditPost={handleEditPost}
          handleDeletePost={handleDeletePost}
          handleSharePost={handleOpenSharePostDialog}
        />
      );
    });
  }, [
    postList,
    handleLikeDislikePost,
    handleLikeDislikeCampaign,
    handleCreateComment,
    handleCreateCampaignComment,
    handleOpenPostCommentsDialog,
    handleOpenCampaignCommentsDialog,
    handleOpenPostLikesDialog,
    handleEditPost,
    handleDeletePost,
    handleOpenSharePostDialog,
    handleFollowCampaignCreator,
  ]);

  return (
    <>
      {/* Render Post Actions */}
      {renderPostActions()}
      {/* Render Post Card Skeleton */}
      {isLoading.createPost && <PostCardSkeleton />}
      {/* Render Post List */}
      {isLoading.getPosts
        ? renderPostSkeletonLoader()
        : isLoading.getPosts === false && postList?.length === 0
          ? renderNoPostsFound()
          : postListMemo}
      {/* Render Loader */}
      <Box ref={loaderRef} display="flex" justifyContent="center" py={2}>
        {isFetchingMoreRef.current && <CircularProgress size={24} />}
      </Box>
      {/* Render Post Comments Dialog */}
      <PostCommentsDialog
        ref={postCommentsDialogRef}
        setPostList={setPostList}
      />
      {/* Render Post Likes Dialog */}
      <PostLikesDialog ref={postLikesDialogRef} />
      {/* Render Share Post Dialog */}
      <SharePostDialog ref={sharePostDialogRef} setPostList={setPostList} />
      {/* Render Confirm Popup */}
      <ConfirmPopup
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeletePost}
        title="Delete Post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        variant="delete"
      />
      <PostDetailDialog ref={postDetailDialogRef} setPostList={setPostList} />
      <CampaignDetailDialog
        ref={campaignDetailDialogRef}
        setPostList={setPostList}
      />
      <DealPickerDialog
        open={dealPickerOpen}
        contentType={contentType}
        onClose={() => setDealPickerOpen(false)}
        onSelect={(deal) => {
          setSelectedDeal(deal);
          setDealPickerOpen(false);
        }}
      />
    </>
  );
};

export default MessageSection;
