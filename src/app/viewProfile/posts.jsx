import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createConversation } from "../../api/modules/conversation";
import {
  createComment,
  createPost,
  deletePost,
  getPostsByUsername,
  likePost,
  unlikePost,
  updatePost,
} from "../../api/modules/post";
import Camera from "../../assets/icon/camera.svg";
import Gallery from "../../assets/icon/gallery.svg";
import Gif from "../../assets/icon/gif.svg";
import ProfileImage from "../../assets/icon/profile-home-page.svg";
import { BecomeCreatorCard, PostCard } from "../../components/cards";
import CustomButton from "../../components/cutomButon";
import CustomInput from "../../components/cutomInput";
import {
  CameraDialog,
  PostCommentsDialog,
  PostDetailDialog,
  PostLikesDialog,
  SharePostDialog,
} from "../../components/dialogs";
import ConfirmPopup from "../../components/pops";
import { USER_ROLES } from "../../components/productForm/constants";
import PostCardSkeleton from "../../components/skeleton/PostCardSkeleton";
import PostMediaPreviewSkeleton from "../../components/skeleton/PostMediaPreviewSkeleton";
import { modifyConversations, uploadMediaService } from "../../utils/helper";
import useActiveChatStore from "../../zustand/activeChatStore";
import useConversationStore from "../../zustand/conversationStore";
import useUserStore from "../../zustand/userUserStore";

const Posts = () => {
  // Get Username from URL
  const { username } = useParams();
  // Navigation
  const navigate = useNavigate();
  // Post Detail Dialog Ref
  const postDetailDialogRef = useRef(null);
  // Post Comments Dialog Ref
  const postCommentsDialogRef = useRef(null);
  // Post Likes Dialog Ref
  const postLikesDialogRef = useRef(null);
  // Post Share Dialog Ref
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

  // Device detection
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Is Own Profile
  const isOwnProfile = user?.username === username;

  // Is Allowed to post as a creator
  const isAllowedToPost = isOwnProfile && user.role === USER_ROLES.USER;

  // Handle Remove Image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle Image Change
  const handleImageChange = async (event, type) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (type === "gif" && file.type !== "image/gif") {
      toast.error("Please select a valid GIF file.");
      return;
    }

    if (
      type === "gallery" &&
      !["image/png", "image/jpeg", "image/webp"].includes(file.type)
    ) {
      toast.error("Only PNG, JPG, or WEBP images are allowed.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    setIsLoading((prev) => ({ ...prev, imageUpload: true }));
    const fileUrl = await uploadMediaService(file);
    if (type === "camera") {
      setFormData((prev) => ({
        ...prev,
        images: [{ mediaType: "image", url: fileUrl?.url }],
        // TODO: Add camera image to the form data
        // images: [...prev.images, { type: "image", url: url }],
      }));
    } else if (type === "gallery") {
      setFormData((prev) => ({
        ...prev,
        images: [{ mediaType: "image", url: fileUrl?.url }],
        // TODO: Add multiple gallery images to the form data
        // images: [...prev.images, { type: "image", url: url }],
      }));
    } else if (type === "gif") {
      setFormData((prev) => ({
        ...prev,
        images: [{ mediaType: "gif", url: fileUrl?.url }],
        // TODO: Add gif image to the form data
        // images: [...prev.images, { type: "gif", url: url }],
      }));
    }
    setIsLoading((prev) => ({ ...prev, imageUpload: false }));
  };

  // Handle Camera Capture
  const handleCameraCapture = async (file) => {
    setIsLoading((prev) => ({ ...prev, imageUpload: true }));
    const fileUrl = await uploadMediaService(file);
    setFormData((prev) => ({
      ...prev,
      images: [{ mediaType: "image", url: fileUrl?.url }],
    }));
    setIsLoading((prev) => ({ ...prev, imageUpload: false }));
  };

  // Handle Create / Update Post
  const handleCreatePost = async () => {
    if (!formData.post?.trim() && formData.images?.length === 0) {
      toast.error(
        "Please enter a post Or select at least one image, gif or gallery image",
      );
      return;
    }

    try {
      setIsLoading((prev) => ({ ...prev, createPost: true }));
      const payload = {
        caption: formData.post,
        media: formData.images,
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
    } catch {
      // ignore
    }
  }, []);

  // Handle Open Post Comments Dialog
  // const handleOpenPostCommentsDialog = useCallback((post) => {
  //   postCommentsDialogRef.current?.open({ data: post });
  // }, []);
  // Handle Open Post Comments Dialog
  const handleOpenPostCommentsDialog = useCallback((post) => {
    postDetailDialogRef.current?.open(post);
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

      const response = await getPostsByUsername(username, { page, limit: 8 });
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
        mt={2}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Avatar
            src={user?.image || ProfileImage}
            sx={{
              border: "3px solid",
              borderColor: "text.deepPink",
              width: "40px",
              height: "40px",
            }}
          />
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
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => handleImageChange(e, "gallery")}
            />
          </IconButton>
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
            <img
              src={Gif}
              alt="gif"
              //   style={{ width: "20px", height: "20px" }}
            />
            <input
              type="file"
              ref={gifImageInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e) => handleImageChange(e, "gif")}
            />
          </IconButton>
          {/* <IconButton
            sx={{
              p: 1,
              backgroundColor: "background.darkBrown",
              "&:hover": {
                backgroundColor: "background.darkBrown",
              },
            }}
            onClick={() => cameraImageInputRef.current?.click()}
          >
            <img src={Camera} alt="camera" />
            <input
              type="file"
              ref={cameraImageInputRef}
              style={{ display: "none" }}
              accept="image/*"
              capture="environment"
              onChange={(e) => handleImageChange(e, "camera")}
            />
          </IconButton> */}
          <IconButton
            sx={{
              p: 1,
              backgroundColor: "background.darkBrown",
              "&:hover": { backgroundColor: "background.darkBrown" },
            }}
            onClick={() => {
              if (isMobile) {
                cameraImageInputRef.current?.click();
              } else {
                setCameraModalOpen(true);
              }
            }}
          >
            <img src={Camera} alt="camera" />
            {isMobile && (
              <input
                type="file"
                ref={cameraImageInputRef}
                style={{ display: "none" }}
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageChange(e, "camera")}
              />
            )}
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1}>
          {isLoading.imageUpload && <PostMediaPreviewSkeleton />}

          {formData.images?.length > 0 && (
            <Box mt={2}>
              <Box display="flex" gap={1} flexWrap="wrap">
                {formData.images.map((file, index) => (
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
                    <img
                      src={file.url}
                      alt={`preview-${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

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
                ))}
              </Box>
            </Box>
          )}
        </Stack>
        {(formData.post || formData.images?.length > 0) && (
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

  // Handle Share Post
  const handleOpenSharePostDialog = useCallback((post) => {
    sharePostDialogRef.current?.open({ data: post });
  }, []);

  // Use Memo to Render Post List
  const postListMemo = useMemo(() => {
    return postList.map((post) => (
      <PostCard
        key={post._id}
        post={post}
        handleLikeDislikePost={handleLikeDislikePost}
        handleCreateComment={handleCreateComment}
        handleOpenPostCommentsDialog={handleOpenPostCommentsDialog}
        handleOpenPostLikesDialog={handleOpenPostLikesDialog}
        handleInitiateChat={handleInitiateChat}
        handleEditPost={handleEditPost}
        handleDeletePost={handleDeletePost}
        handleSharePost={handleOpenSharePostDialog}
      />
    ));
  }, [
    postList,
    handleLikeDislikePost,
    handleCreateComment,
    handleOpenPostCommentsDialog,
    handleOpenPostLikesDialog,
    handleEditPost,
    handleDeletePost,
    handleOpenSharePostDialog,
  ]);

  if (isAllowedToPost) {
    return <BecomeCreatorCard />;
  }

  return (
    <>
      {/* <Grid container justifyContent={isOwnProfile ? "flex-start" : "center"}> */}
      <Grid container justifyContent={"center"}>
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Render Post Actions */}
          {/* {renderPostActions()} */}
          {/* Render Post Card Skeleton */}
          {/* {isLoading.createPost && <PostCardSkeleton />} */}
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
        </Grid>
      </Grid>
      {/* Render Post Comments Dialog */}
      <PostCommentsDialog
        ref={postCommentsDialogRef}
        setPostList={setPostList}
      />
      {/* Render Post Likes Dialog */}
      <PostLikesDialog ref={postLikesDialogRef} />
      <SharePostDialog ref={sharePostDialogRef} setPostList={setPostList} />
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
    </>
  );
};

export default Posts;
