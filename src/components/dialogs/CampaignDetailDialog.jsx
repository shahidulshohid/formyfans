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
  Chip,
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
import { toast } from "react-toastify";
import {
  createCampaignComment,
  getCampaignById,
  getCampaignComments,
  likeCampaign,
  unlikeCampaign,
} from "../../api/modules/campaign";
import ProfileImage from "../../assets/icon/profile-home-page.svg";
import {
  getDisplayName,
  getInitialName,
  getShortTimeAgo,
  numberFormatter,
} from "../../utils/helper";
import { getFullS3Url } from "../../utils/s3Helper";
import useUserStore from "../../zustand/userUserStore";
import { DialogBox } from "./DialogBox";

export const CampaignDetailDialog = forwardRef(({ setPostList }, ref) => {
  const { user } = useUserStore();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [campaign, setCampaign] = useState(null);
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
    setCampaign(null);
    setComments([]);
    setCommentInput("");
    setCommentsPagination({ page: 1, hasNextPage: false });
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  const handleGetCampaign = async (campaignId, feedItem) => {
    try {
      setIsLoading(true);
      const response = await getCampaignById(campaignId);
      if (response.data.status === "success") {
        const fetched = response.data.data;
        setCampaign({
          ...fetched,
          itemType: "campaign",
          isLiked: feedItem?.isLiked ?? false,
          likesCount: fetched.likesCount ?? feedItem?.likesCount ?? 0,
          commentsCount:
            fetched.commentsCount ?? feedItem?.commentsCount ?? 0,
          sharesCount: fetched.sharesCount ?? feedItem?.sharesCount ?? 0,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetComments = async (campaignId, page = 1) => {
    try {
      setCommentsLoading(true);
      const response = await getCampaignComments(campaignId, {
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
      handleGetCampaign(data._id, data);
      handleGetComments(data._id);
    }
  }, [open, data?._id]);

  const media = campaign?.advertisement?.media?.[0];
  const headline =
    campaign?.advertisement?.headline || campaign?.name || "Campaign";
  const brand = campaign?.brand || "Sponsored";
  const primaryText =
    campaign?.advertisement?.primaryText || campaign?.description || "";

  const isVideo = useMemo(
    () =>
      media?.mediaType === "video" || media?.url?.includes("/video/upload/"),
    [media],
  );

  useEffect(() => {
    if (!open || isLoading || !isVideo || !campaign) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = isMuted;
    videoEl.play().catch(() => {});
  }, [open, isLoading, isVideo, campaign, media?.url]);

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
    if (!campaign?._id || likeLoading) return;

    const wasLiked = campaign.isLiked;
    setCampaign((prev) => ({
      ...prev,
      isLiked: !wasLiked,
      likesCount: Math.max(0, (prev.likesCount ?? 0) + (wasLiked ? -1 : 1)),
    }));

    if (setPostList) {
      setPostList((prev) =>
        prev.map((item) =>
          item._id === campaign._id
            ? {
                ...item,
                isLiked: !wasLiked,
                likesCount: Math.max(
                  0,
                  (item.likesCount ?? 0) + (wasLiked ? -1 : 1),
                ),
              }
            : item,
        ),
      );
    }

    try {
      setLikeLoading(true);
      const response = wasLiked
        ? await unlikeCampaign(campaign._id)
        : await likeCampaign(campaign._id);

      if (!(response?.status === 200 || response?.status === 201)) {
        throw new Error("Like action failed");
      }
    } catch {
      setCampaign((prev) => ({
        ...prev,
        isLiked: wasLiked,
        likesCount: Math.max(
          0,
          (prev.likesCount ?? 0) + (wasLiked ? 1 : -1),
        ),
      }));
      toast.error("Could not update like");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCreateComment = useCallback(async () => {
    const trimmed = commentInput.trim();
    if (!trimmed || !campaign?._id) return;

    setCommentSubmitting(true);
    setCommentInput("");

    setCampaign((prev) => ({
      ...prev,
      commentsCount: (prev.commentsCount ?? 0) + 1,
    }));

    if (setPostList) {
      setPostList((prev) =>
        prev.map((item) =>
          item._id === campaign._id
            ? { ...item, commentsCount: (item.commentsCount ?? 0) + 1 }
            : item,
        ),
      );
    }

    try {
      const response = await createCampaignComment(campaign._id, {
        content: trimmed,
      });
      if (response.status === 200 || response.status === 201) {
        setComments((prev) => [response.data.comment, ...prev]);
      } else {
        throw new Error(response.data?.message);
      }
    } catch (error) {
      setCampaign((prev) => ({
        ...prev,
        commentsCount: Math.max(0, (prev.commentsCount ?? 1) - 1),
      }));
      toast.error(error?.message || "Could not post comment");
    } finally {
      setCommentSubmitting(false);
    }
  }, [commentInput, campaign?._id, setPostList]);

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
            src={getFullS3Url(media.url)}
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
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 36, color: "#FF1572", ml: 0.5 }} />
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
        alt={headline}
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
      <Box key={comment._id} display="flex" gap={1.25} alignItems="flex-start">
        <Avatar
          src={getFullS3Url(comment.author?.image)}
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
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={1.5}
              py={1}
              borderBottom="1px solid #efefef"
              flexShrink={0}
            >
              <Box display="flex" alignItems="center" gap={1} minWidth={0} flex={1}>
                <Chip
                  label="Sponsored"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: "rgba(255, 21, 114, 0.12)",
                    color: "#FF1572",
                  }}
                />
                <Box minWidth={0}>
                  <Typography
                    fontWeight={700}
                    fontSize={14}
                    noWrap
                    color="text.darkBrown"
                  >
                    {brand}
                  </Typography>
                  <Typography fontSize={12} noWrap color="text.secondary">
                    {headline}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

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
              {primaryText && (
                <Box minWidth={0}>
                  <Typography fontSize={13} lineHeight={1.45}>
                    <Box
                      component="span"
                      fontWeight={600}
                      color="text.darkBrown"
                      mr={0.75}
                    >
                      {brand}
                    </Box>
                    {primaryText}
                  </Typography>
                  {(campaign?.startDateTime || campaign?.createdAt) && (
                    <Typography fontSize={11} color="text.secondary" mt={0.5}>
                      {getShortTimeAgo(
                        campaign?.startDateTime || campaign?.createdAt,
                      )}
                    </Typography>
                  )}
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
                    handleGetComments(
                      campaign._id,
                      commentsPagination.page + 1,
                    )
                  }
                  sx={{ cursor: "pointer", color: "text.secondary" }}
                >
                  {commentsLoading ? (
                    <CircularProgress size={14} />
                  ) : (
                    <>
                      <ControlPointIcon sx={{ fontSize: 16 }} />
                      <Typography fontSize={12}>Load more comments</Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>

            <Box flexShrink={0} px={1.5} pt={1}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <IconButton
                  size="small"
                  onClick={handleLikeToggle}
                  disabled={likeLoading}
                >
                  {campaign?.isLiked ? (
                    <FavoriteIcon sx={{ fontSize: 24, color: "#FF1572" }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                  )}
                </IconButton>
                <IconButton size="small">
                  <ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Box>

              <Typography
                fontWeight={600}
                fontSize={13}
                mt={0.5}
                color="text.darkBrown"
              >
                {numberFormatter.format(campaign?.likesCount ?? 0)} likes
              </Typography>
              {(campaign?.startDateTime || campaign?.createdAt) && (
                <Typography
                  fontSize={11}
                  color="text.secondary"
                  mt={0.25}
                  mb={1}
                  letterSpacing="0.03em"
                >
                  {moment(
                    campaign?.startDateTime || campaign?.createdAt,
                  ).fromNow()}
                </Typography>
              )}
            </Box>

            <Divider />

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              px={1.5}
              py={1}
              flexShrink={0}
            >
              <Avatar
                src={(user?.image && getFullS3Url(user.image)) || ProfileImage}
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
});

CampaignDetailDialog.displayName = "CampaignDetailDialog";
