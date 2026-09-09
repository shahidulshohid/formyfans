import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createExclusiveContentComment,
  getExclusiveContentById,
  getExclusiveContentComments,
  likeExclusiveContent,
  unlikeExclusiveContent,
} from "../../api/modules/exclusiveContent";
import { createComment } from "../../api/modules/post";
import ProfileImage from "../../assets/icon/profile-home-page.svg";
import {
  getDisplayName,
  getInitialName,
  getShortTimeAgo,
  getUserHandle,
  getUserProfileImage,
  numberFormatter,
} from "../../utils/helper";
import useUserStore from "../../zustand/userUserStore";
import { DialogBox } from "./DialogBox";

export const ExclusiveContentDetailDialog = forwardRef(
  ({ setPostList }, ref) => {
    const { user } = useUserStore();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentsPagination, setCommentsPagination] = useState({
      page: 1,
      hasNextPage: false,
    });
    const [likeLoading, setLikeLoading] = useState(false);
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    useImperativeHandle(ref, () => ({
      open: (dataParams) => {
        setOpen(true);
        setData(dataParams);
      },
      close: () => setOpen(false),
    }));

    const resetState = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setIsMuted(true);
      setData(null);
      setPost(null);
      setComments([]);
      setCommentInput("");
      setCommentsPagination({ page: 1, hasNextPage: false });
    };

    const handleClose = () => {
      setOpen(false);
      resetState();
    };

    const handleGetExclusiveContent = async (id) => {
      try {
        setIsLoading(true);
        const response = await getExclusiveContentById(id);
        if (response.data.status === "success") {
          setPost(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const handleGetComments = async (id, page = 1) => {
      try {
        setCommentsLoading(true);
        const response = await getExclusiveContentComments(id, {
          page,
          limit: 10,
        });
        if (response.status === 200 || response.status === 201) {
          setComments((prev) =>
            page === 1
              ? response.data.comments
              : [...prev, ...response.data.comments],
          );
          setCommentsPagination({
            page,
            hasNextPage: response.data.pagination?.hasNextPage ?? false,
          });
        }
      } catch (error) {
        toast.error(error?.message || "Could not load comments");
      } finally {
        setCommentsLoading(false);
      }
    };

    useEffect(() => {
      if (open && data?._id) {
        handleGetExclusiveContent(data._id);
        handleGetComments(data._id);
      }
    }, [open, data?._id]);

    const author = post?.authorId || post?.author;
    const media = post?.media?.[0];

    const isVideo = useMemo(
      () =>
        media?.mediaType === "video" || media?.url?.includes("/video/upload/"),
      [media],
    );

    useEffect(() => {
      if (!open || isLoading || !isVideo || !post) return;

      const videoEl = videoRef.current;
      if (!videoEl) return;

      videoEl.muted = isMuted;
      videoEl.play().catch(() => {});
    }, [open, isLoading, isVideo, post, media?.url]);

    const togglePlayPause = () => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (videoEl.paused) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    };

    const toggleMute = (e) => {
      e.stopPropagation();
      setIsMuted((prev) => {
        const next = !prev;
        if (videoRef.current) videoRef.current.muted = next;
        return next;
      });
    };

    const handleLikeToggle = async () => {
      if (!post?._id || likeLoading) return;

      const wasLiked = post.isLiked;
      setPost((prev) => ({
        ...prev,
        isLiked: !wasLiked,
        likesCount: Math.max(0, (prev.likesCount ?? 0) + (wasLiked ? -1 : 1)),
      }));

      if (setPostList) {
        setPostList((prev) =>
          prev.map((p) =>
            p._id === post._id
              ? {
                  ...p,
                  isLiked: !wasLiked,
                  likesCount: Math.max(
                    0,
                    (p.likesCount ?? 0) + (wasLiked ? -1 : 1),
                  ),
                }
              : p,
          ),
        );
      }

      try {
        setLikeLoading(true);
        const response = wasLiked
          ? await unlikeExclusiveContent(post._id)
          : await likeExclusiveContent({ postId: post._id });

        if (!(response?.status === 200 || response?.status === 201)) {
          throw new Error("Like action failed");
        }
      } catch {
        setPost((prev) => ({
          ...prev,
          isLiked: wasLiked,
          likesCount: Math.max(0, (prev.likesCount ?? 0) + (wasLiked ? 1 : -1)),
        }));
        toast.error("Could not update like");
      } finally {
        setLikeLoading(false);
      }
    };

    const handleCreateComment = useCallback(async () => {
      const trimmed = commentInput.trim();
      if (!trimmed || !post?._id) return;

      setCommentSubmitting(true);
      setCommentInput("");

      // Optimistic update
      setPost((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount ?? 0) + 1,
      }));

      if (setPostList) {
        setPostList((prev) =>
          prev.map((p) =>
            p._id === post._id
              ? { ...p, commentsCount: p.commentsCount + 1 }
              : p,
          ),
        );
      }

      try {
        const response = await createExclusiveContentComment(post._id, {
          content: trimmed,
        });
        if (response.status === 200 || response.status === 201) {
          setComments((prev) => [response.data.comment, ...prev]);
        } else {
          throw new Error(response.data?.message);
        }
      } catch (error) {
        setPost((prev) => ({
          ...prev,
          commentsCount: Math.max(0, (prev.commentsCount ?? 1) - 1),
        }));
        toast.error(error?.message || "Could not post comment");
      } finally {
        setCommentSubmitting(false);
      }
    }, [commentInput, post?._id]);

    const handleCommentKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCreateComment();
      }
    };

    const renderMedia = () => {
      if (!media?.url) {
        return (
          <Typography color="grey.500" fontSize={14}>
            No media available
          </Typography>
        );
      }

      if (isVideo) {
        return (
          <Box
            position="relative"
            width="100%"
            height="100%"
            onClick={togglePlayPause}
            sx={{ cursor: "pointer" }}
          >
            <Box
              component="video"
              ref={videoRef}
              src={media.url}
              muted={isMuted}
              playsInline
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />

            {!isPlaying && (
              <Box
                position="absolute"
                inset={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="rgba(0, 0, 0, 0.25)"
                onClick={togglePlayPause}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    bgcolor: "rgba(0, 0, 0, 0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PlayArrowIcon
                    sx={{ fontSize: 32, color: "#fff", ml: 0.5 }}
                  />
                </Box>
              </Box>
            )}

            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={1}
              py={0.75}
              sx={{
                background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                size="small"
                onClick={togglePlayPause}
                sx={{
                  bgcolor: "rgba(0,0,0,0.45)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
                }}
              >
                {isPlaying ? (
                  <PauseIcon fontSize="small" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )}
              </IconButton>

              <IconButton
                size="small"
                onClick={toggleMute}
                sx={{
                  bgcolor: "rgba(0,0,0,0.45)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
                }}
              >
                {isMuted ? (
                  <VolumeOffIcon fontSize="small" />
                ) : (
                  <VolumeUpIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        );
      }

      return (
        <Box
          component="img"
          src={media.url}
          alt="Post media"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      );
    };

    const renderCommentsList = () => {
      if (commentsLoading && comments.length === 0) {
        return (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={24} sx={{ color: "#FF1572" }} />
          </Box>
        );
      }

      if (!commentsLoading && comments.length === 0) {
        return (
          <Typography
            fontSize={13}
            color="text.secondary"
            textAlign="center"
            py={3}
          >
            No comments yet. Start the conversation.
          </Typography>
        );
      }

      return comments.map((comment) => (
        <Box
          key={comment._id}
          display="flex"
          gap={1.25}
          alignItems="flex-start"
        >
          <Avatar
            src={comment.author?.image}
            sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}
          >
            {getInitialName(comment.author)}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              fontSize={13}
              lineHeight={1.45}
              sx={{ wordBreak: "break-word" }}
            >
              <Box
                component="span"
                fontWeight={600}
                color="text.darkBrown"
                mr={0.75}
              >
                {getDisplayName(comment.author)}
              </Box>
              {comment.content}
            </Typography>
            <Typography fontSize={11} color="text.secondary" mt={0.5}>
              {getShortTimeAgo(comment.createdAt)}
            </Typography>
          </Box>
        </Box>
      ));
    };

    return (
      <DialogBox
        open={open}
        onClose={handleClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-paper": {
            width: "min(1000px, 96vw)",
            maxWidth: "min(1000px, 96vw)",
            borderRadius: "12px",
            overflow: "hidden",
            m: 1,
          },
        }}
      >
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={420}
            width="min(800px, 96vw)"
          >
            <CircularProgress sx={{ color: "#FF1572" }} />
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            sx={{
              width: "100%",
              height: { xs: "auto", md: "min(85vh, 720px)" },
              maxHeight: { xs: "92vh", md: "min(85vh, 720px)" },
              bgcolor: "#fff",
            }}
          >
            {/* Left — media (50%) */}
            <Box
              sx={{
                flex: { md: "0 0 50%" },
                width: { xs: "100%", md: "50%" },
                bgcolor: "#000",
                minHeight: { xs: 280, md: "100%" },
                maxHeight: { xs: 360, md: "none" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {renderMedia()}
            </Box>

            {/* Right — comments panel (50%) */}
            <Box
              sx={{
                flex: { md: "0 0 50%" },
                width: { xs: "100%", md: "50%" },
                display: "flex",
                flexDirection: "column",
                borderLeft: { md: "1px solid #efefef" },
                minHeight: { xs: 320, md: 0 },
                maxHeight: { xs: "none", md: "100%" },
                minWidth: 0,
              }}
            >
              {/* Header */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={1.5}
                py={1}
                borderBottom="1px solid #efefef"
                flexShrink={0}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  component={author?.username ? Link : "div"}
                  to={
                    author?.username
                      ? `/${author.username}/all-posts`
                      : undefined
                  }
                  onClick={handleClose}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Avatar
                    src={getUserProfileImage(author)}
                    sx={{
                      width: 32,
                      height: 32,
                      border: "2px solid #FF1572",
                    }}
                  >
                    {getInitialName(author)}
                  </Avatar>
                  <Typography
                    fontWeight={600}
                    fontSize={14}
                    noWrap
                    color="text.darkBrown"
                  >
                    {getUserHandle(author)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  {/* <IconButton size="small">
                  <MoreHorizIcon fontSize="small" />
                </IconButton> */}
                  <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Scrollable caption + comments */}
              <Box
                flex={1}
                overflow="auto"
                px={1.5}
                py={1.5}
                display="flex"
                flexDirection="column"
                gap={2}
                sx={{ minHeight: 0 }}
              >
                {post?.caption && (
                  <Box>
                    {/* Title - Big and Bold */}
                    {post?.title && (
                      <Typography
                        sx={{
                          fontSize: { xs: 18, sm: 20 },
                          fontWeight: 700,
                          color: "text.darkBrown",
                          mb: 1.5,
                          lineHeight: 1.3,
                        }}
                      >
                        {post.title}
                      </Typography>
                    )}

                    {/* Tags - Styled nicely */}
                    {post?.tags && post.tags.length > 0 && (
                      <Box display="flex" gap={0.6} flexWrap="wrap" mb={2}>
                        {post.tags.map((tag, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              backgroundColor: "#FF1572",
                              color: "#fff",
                              px: 1.2,
                              py: 0.5,
                              borderRadius: "20px",
                              fontSize: 12,
                              fontWeight: 600,
                              letterSpacing: "0.3px",
                            }}
                          >
                            #{tag}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Caption - Clean text */}
                    <Typography
                      fontSize={13}
                      lineHeight={1.7}
                      color="text.primary"
                      sx={{
                        wordBreak: "break-word",
                        mb: 1.5,
                      }}
                    >
                      {post.caption}
                    </Typography>

                    {/* Divider */}
                    <Divider sx={{ my: 2 }} />
                  </Box>
                )}

                {renderCommentsList()}

                {commentsPagination.hasNextPage && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={0.5}
                    py={0.5}
                    onClick={() =>
                      handleGetComments(post._id, commentsPagination.page + 1)
                    }
                    sx={{ cursor: "pointer", color: "text.secondary" }}
                  >
                    {commentsLoading ? (
                      <CircularProgress size={14} />
                    ) : (
                      <>
                        <ControlPointIcon sx={{ fontSize: 16 }} />
                        <Typography fontSize={12}>
                          Load more comments
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>

              {/* Actions + stats */}
              <Box flexShrink={0} px={1.5} pt={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={handleLikeToggle}
                      disabled={likeLoading}
                    >
                      {post?.isLiked ? (
                        <FavoriteIcon sx={{ fontSize: 24, color: "#FF1572" }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                      )}
                    </IconButton>
                    <IconButton size="small">
                      <ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                    {/* <IconButton size="small">
                    <SendIcon sx={{ fontSize: 22 }} />
                  </IconButton> */}
                  </Box>
                </Box>

                <Typography
                  fontWeight={600}
                  fontSize={13}
                  mt={0.5}
                  color="text.darkBrown"
                >
                  {numberFormatter.format(post?.likesCount ?? 0)} likes
                </Typography>
                {post?.createdAt && (
                  <Typography
                    fontSize={11}
                    color="text.secondary"
                    mt={0.25}
                    mb={1}
                    letterSpacing="0.03em"
                  >
                    {moment(post.createdAt).fromNow()}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Add comment */}
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                px={1.5}
                py={1}
                flexShrink={0}
              >
                <Avatar
                  src={user?.image || ProfileImage}
                  sx={{ width: 28, height: 28, flexShrink: 0 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  disabled={commentSubmitting}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: 13 },
                  }}
                />
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  color={commentInput.trim() ? "#FF1572" : "text.disabled"}
                  onClick={handleCreateComment}
                  sx={{
                    cursor: commentInput.trim() ? "pointer" : "default",
                    flexShrink: 0,
                    userSelect: "none",
                  }}
                >
                  {commentSubmitting ? "..." : "Post"}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogBox>
    );
  },
);

ExclusiveContentDetailDialog.displayName = "ExclusiveContentDetailDialog";
