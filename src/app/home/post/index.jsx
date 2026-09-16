import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackImpressions } from "../../../api/modules/analytics";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { createConversation } from "../../../api/modules/conversation";
import {
  createCampaignComment,
  likeCampaign,
  unlikeCampaign,
} from "../../../api/modules/campaign";
import { follow, unfollow } from "../../../api/modules/follow";
import {
  createComment,
  createPost,
  deletePost,
  getPostById,
  getPosts,
  likePost,
  unlikePost,
  updatePost,
} from "../../../api/modules/post";
import { CampaignCard, PostCard } from "../../../components/cards";
import {
  CampaignDetailDialog,
  DealPickerDialog,
  PostCommentsDialog,
  PostDetailDialog,
  PostLikesDialog,
  SharePostDialog,
  TagPeopleDialog,
} from "../../../components/dialogs";
import ConfirmPopup from "../../../components/pops";
import { MAX_VIDEO_DURATION_SECONDS } from "../../../constants/common";
import { useS3Upload } from "../../../hook/s3Upload";
import {
  getVideoDuration,
  modifyConversations,
} from "../../../utils/helper";
import useActiveChatStore from "../../../zustand/activeChatStore";
import useConversationStore from "../../../zustand/conversationStore";
import useUserStore from "../../../zustand/userUserStore";
import CreatePostBox from "./createPostBox";
import PostFeedList from "./postFeedList";

// ── Impression tracking wrapper ──────────────────────────────────────────────
// Fires trackImpressions when a post is ≥50% visible for 1 continuous second.
// Timer resets if the post scrolls away before the threshold is met.
// 30s cooldown per post prevents duplicate tracking on rapid scrolls.
const IMPRESSION_THRESHOLD = 0.5;
const IMPRESSION_DELAY_MS = 1000;
const IMPRESSION_COOLDOWN_MS = 30000;

const PostCardWithImpression = ({ post, ...props }) => {
  const ref = useRef(null);
  const timerRef = useRef(null);
  const trackedRef = useRef(new Set());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const postId = entry.target.dataset.postId;
        if (!postId) return;

        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= IMPRESSION_THRESHOLD
        ) {
          timerRef.current = setTimeout(() => {
            if (!trackedRef.current.has(postId)) {
              trackedRef.current.add(postId);
              trackImpressions([postId]);
              setTimeout(
                () => trackedRef.current.delete(postId),
                IMPRESSION_COOLDOWN_MS,
              );
            }
          }, IMPRESSION_DELAY_MS);
        } else {
          if (timerRef.current) clearTimeout(timerRef.current);
        }
      },
      { threshold: [IMPRESSION_THRESHOLD] },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div ref={ref} data-post-id={post._id}>
      <PostCard post={post} {...props} />
    </div>
  );
};

const PostSection = () => {
  // Navigation
  const navigate = useNavigate();
  // Location — used to open PostDetailDialog when arriving from a
  // post_tagged / comment_mentioned notification click (/home, openPostId).
  const location = useLocation();
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
  // Tag People Dialog Ref
  const tagPeopleDialogRef = useRef(null);
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
  // S3 Upload Hook
  const { uploadFile, uploading: s3Uploading } = useS3Upload();
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

  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, imageUpload: s3Uploading }));
  }, [s3Uploading]);
  // Form Data
  const [formData, setFormData] = useState({
    post: "",
    images: [],
  });
  // Edit Post State
  const [editingPostId, setEditingPostId] = useState(null);
  // Create/Update Post dialog open state — lives here (not inside
  // CreatePostBox) so handleCreatePost can close it directly on success,
  // without needing to pass a success/failure signal back down to the child.
  const [dialogOpen, setDialogOpen] = useState(false);
  // Delete Post State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Post Type
  const [contentType, setContentType] = useState("post");
  const [postType, setPostType] = useState("own");
  const [dealPickerOpen, setDealPickerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  // Tagged Users (Facebook-style "with X")
  const [taggedUsers, setTaggedUsers] = useState([]);
  const REEL_MAX_DURATION_SECONDS = 60;

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

    try {
      const result = await uploadFile(file, "media");
      if (result.success) {
        const mediaType = type === "gif" ? "gif" : isVideo ? "video" : "image";
        const fileName = result.data.fileName;

        if (type === "camera") {
          setFormData((prev) => ({
            ...prev,
            images: [{ mediaType, url: fileName }],
          }));
        } else if (type === "gallery") {
          setFormData((prev) => ({
            ...prev,
            images: [{ mediaType, url: fileName }],
          }));
        } else if (type === "gif") {
          setFormData((prev) => ({
            ...prev,
            images: [{ mediaType: "gif", url: fileName }],
          }));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed, please try again.");
    }
  };

  // Handle Camera Capture
  const handleCameraCapture = async (file) => {
    try {
      const result = await uploadFile(file, "media");
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          images: [{ mediaType: "image", url: result.data.fileName }],
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed, please try again.");
    }
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
        ...(taggedUsers.length > 0 && {
          taggedUsers: taggedUsers.map((u) => u._id),
        }),
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
        setTaggedUsers([]);

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

        // Success — close the dialog right here, since this is the
        // only place that actually knows the request succeeded.
        setDialogOpen(false);
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
    // Backend returns taggedUsers as [{ userId, user }] — flatten to user
    // objects so chips, TagPeopleDialog, and the update payload all get the
    // same flat shape that the create flow uses.
    setTaggedUsers(
      post.taggedUsers?.filter((t) => t.user).map((t) => t.user) ?? [],
    );
    setDialogOpen(true);
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
          setDialogOpen(false);
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
  const handleCreateComment = useCallback(
    async (postId, commentContent, mentions = []) => {
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
          ...(mentions.length > 0 && { mentions }),
        };
        const response = await createComment(postId, payload);
        if (response.status === 200 || response.status === 201) {
          toast.success(response.data.message);
        }
      } catch (error) {
        console.error("error", error);
      }
    },
    [],
  );

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

  // Open PostDetailDialog when arriving from a post_tagged / comment_mentioned
  // notification click (navigate("/home", { state: { openPostId } })).
  useEffect(() => {
    const openPostId = location.state?.openPostId;
    if (!openPostId) return;

    // Clear the state so navigating to /home again doesn't reopen the dialog
    navigate("/home", { replace: true, state: {} });

    const alreadyLoaded = postList.find((p) => p._id === openPostId);
    if (alreadyLoaded) {
      postDetailDialogRef.current?.open(alreadyLoaded);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await getPostById(openPostId);
        if (
          !cancelled &&
          (response?.status === 200 || response?.status === 201)
        ) {
          postDetailDialogRef.current?.open(response?.data?.data);
        }
      } catch {
        toast.error("Could not load this post");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openPostId]);

  const hasContent =
    Boolean(formData.post?.trim()) || formData.images?.length > 0;
  const canShowPostButton =
    postType === "collaborative"
      ? Boolean(selectedDeal) && hasContent
      : hasContent;

  // Handle Initiate Chat
  const handleInitiateChat = useCallback(async (post) => {
    try {
      const payload = { participantId: post.author._id };
      // Pass boostId if this is a boosted post with messages objective
      if (post.boost && post.boost.objective === "messages") {
        payload.boostId = post.boost._id;
      }
      const response = await createConversation(payload);

      if (response.status === 200 || response.status === 201) {
        const modifiedConversations = modifyConversations(
          [response.data.data],
          user,
        );

        setActiveChat(modifiedConversations[0]);
        fetchConversations();
        navigate("/chat");
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

  // Handle Follow / Unfollow for boosted posts ("profile" objective).
  // Optimistically flips the author's isFollowing flag, then calls the API.
  const handleFollowBoost = useCallback(
    async (boostedPost, isFollowing) => {
      const authorId = boostedPost?.author?._id;
      if (!authorId) return;

      const originalList = postList;

      setPostList((prev) =>
        prev.map((item) =>
          item._id === boostedPost._id
            ? {
                ...item,
                author: {
                  ...item.author,
                  isFollowing: !isFollowing,
                },
              }
            : item,
        ),
      );

      try {
        const response = isFollowing
          ? await unfollow(authorId)
          : await follow({ userId: authorId });
        if (!(response.status === 200 || response.status === 201)) {
          throw new Error(response?.data?.message || "Action failed");
        }
        toast.success(response?.data?.message);
      } catch (error) {
        setPostList(originalList);
        toast.error(error?.response?.data?.message || error?.message);
      }
    },
    [postList],
  );

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
        <PostCardWithImpression
          key={item.itemType === "boost" ? `boost-${item._id}` : item._id}
          post={item}
          handleLikeDislikePost={handleLikeDislikePost}
          handleCreateComment={handleCreateComment}
          handleOpenPostCommentsDialog={handleOpenPostCommentsDialog}
          handleOpenPostLikesDialog={handleOpenPostLikesDialog}
          handleInitiateChat={handleInitiateChat}
          handleEditPost={handleEditPost}
          handleDeletePost={handleDeletePost}
          handleSharePost={handleOpenSharePostDialog}
          handleFollowBoost={handleFollowBoost}
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
    handleFollowBoost,
  ]);


  const closeDialog = () => {
    setDialogOpen(false);
    if (editingPostId) {
      setEditingPostId(null);
      setFormData({ post: "", images: [] });
      setTaggedUsers([]);
    }
  };

  return (
    <>
      <CreatePostBox
        user={user}
        formData={formData}
        setFormData={setFormData}
        contentType={contentType}
        onContentTypeChange={handleContentTypeChange}
        postType={postType}
        onPostTypeChange={handlePostTypeChange}
        editingPostId={editingPostId}
        setEditingPostId={setEditingPostId}
        selectedDeal={selectedDeal}
        setDealPickerOpen={setDealPickerOpen}
        isLoading={isLoading}
        handleCreatePost={handleCreatePost}
        removeImage={removeImage}
        handleImageChange={handleImageChange}
        handleCameraCapture={handleCameraCapture}
        canShowPostButton={canShowPostButton}
        open={dialogOpen}
        onOpen={() => setDialogOpen(true)}
        onClose={closeDialog}
        taggedUsers={taggedUsers}
        setTaggedUsers={setTaggedUsers}
        tagPeopleDialogRef={tagPeopleDialogRef}
      />

      {/* Post / Campaign feed */}
      <PostFeedList
        isLoadingCreatePost={isLoading.createPost}
        isLoadingGetPosts={isLoading.getPosts}
        postList={postList}
        posts={postListMemo}
        loaderRef={loaderRef}
        isFetchingMoreRef={isFetchingMoreRef}
      />

      {/* Post Comments Dialog */}
      <PostCommentsDialog
        ref={postCommentsDialogRef}
        setPostList={setPostList}
      />
      {/* Post Likes Dialog */}
      <PostLikesDialog ref={postLikesDialogRef} />
      {/* Share Post Dialog */}
      <SharePostDialog ref={sharePostDialogRef} setPostList={setPostList} />
      {/* Confirm Popup */}
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
      {/* Tag People Dialog */}
      <TagPeopleDialog
        ref={tagPeopleDialogRef}
        onDone={(users) => setTaggedUsers(users)}
      />
    </>
  );
};

export default PostSection;