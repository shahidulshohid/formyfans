import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CommentIcon from "../../assets/icon/message.svg";
import ProfileImage from "../../assets/icon/profile-home-page.svg";
import Send from "../../assets/icon/send.svg";
import {
  getDisplayName,
  getInitialName,
  getUserProfileImage,
  numberFormatter,
} from "../../utils/helper";
import { getFullS3Url } from "../../utils/s3Helper";
import useUserStore from "../../zustand/userUserStore";
import CustomInput from "../cutomInput";

const VIDEO_ASPECT_RATIO = "5 / 5";

const CTA_LABELS = {
  book_now: "Book Now",
  learn_more: "Learn More",
  shop_now: "Shop Now",
  sign_up: "Sign Up",
  contact_us: "Contact Us",
  apply_now: "Apply Now",
  get_offer: "Get Offer",
  watch_more: "Watch More",
};

const formatCtaLabel = (cta) => {
  if (!cta) return "Learn More";
  if (CTA_LABELS[cta]) return CTA_LABELS[cta];
  return cta
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const CampaignCard = memo(
  ({
    campaign,
    handleLikeDislikePost,
    handleCreateComment,
    handleOpenPostCommentsDialog,
    handleOpenPostLikesDialog,
    handleSharePost,
    handleFollowCreator,
  }) => {
    const {
      brand,
      name,
      description,
      advertisement,
      objective,
      category,
      creator,
      likesCount = 0,
      commentsCount = 0,
      sharesCount = 0,
      isLiked = false,
      _id,
    } = campaign;

    const { user } = useUserStore();
    const [commentContent, setCommentContent] = useState("");
    const [followLoading, setFollowLoading] = useState(false);

    const media = advertisement?.media || [];
    const headline = advertisement?.headline || name;
    const primaryText = advertisement?.primaryText || description;
    const ctaLabel = formatCtaLabel(advertisement?.callToAction);
    const destinationUrl = advertisement?.designationUrl;
    const creatorProfilePath = creator?.username
      ? `/${creator.username}/all-posts`
      : null;
    const creatorId = creator?._id;
    const isOwnCreator =
      creatorId && user?._id && creatorId.toString() === user._id.toString();
    const showFollowButton =
      Boolean(creatorId) &&
      !isOwnCreator &&
      !creator?.isFollowing &&
      Boolean(handleFollowCreator);

    const onFollowClick = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!creatorId || followLoading) return;

      setFollowLoading(true);
      try {
        await handleFollowCreator(creatorId);
      } finally {
        setFollowLoading(false);
      }
    };

    const videoRef = useRef(null);
    const userPausedRef = useRef(false);
    const [isVideoInView, setIsVideoInView] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const isVideo = useMemo(
      () =>
        media?.[0]?.mediaType === "video" ||
        media?.[0]?.url?.includes("/video/upload/"),
      [media],
    );

    const togglePlayPause = () => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (videoEl.paused) {
        userPausedRef.current = false;
        videoEl.play().catch(() => {});
      } else {
        userPausedRef.current = true;
        videoEl.pause();
      }
    };

    const toggleMute = (event) => {
      event.stopPropagation();
      setIsMuted((prev) => !prev);
    };

    const handleCtaClick = () => {
      if (!destinationUrl) return;
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    };

    useEffect(() => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      const observer = new IntersectionObserver(
        ([entry]) => setIsVideoInView(entry.isIntersecting),
        { threshold: 0.6 },
      );

      observer.observe(videoEl);
      return () => observer.disconnect();
    }, [isVideo]);

    useEffect(() => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (isVideoInView && !userPausedRef.current) {
        videoEl.play().catch(() => {});
      } else if (!isVideoInView) {
        videoEl.pause();
        userPausedRef.current = false;
      }
    }, [isVideoInView]);

    return (
      <Box
        bgcolor="background.lightgray"
        borderRadius="10px"
        mt={2}
        border="1px solid"
        borderColor="divider"
        overflow="hidden"
      >
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          p={2}
        >
          <Box
            component={creatorProfilePath ? Link : "div"}
            to={creatorProfilePath || undefined}
            display="flex"
            alignItems="center"
            gap={1.25}
            minWidth={0}
            sx={{
              textDecoration: "none",
              color: "inherit",
              "&:hover": creatorProfilePath ? { opacity: 0.9 } : undefined,
            }}
          >
            <Avatar
              src={(getUserProfileImage(creator))}
              sx={{
                width: 44,
                height: 44,
                fontSize: 16,
                flexShrink: 0,
                border: "2px solid",
                borderColor: "text.deepPink",
              }}
            >
              {getInitialName(creator) || brand?.[0]?.toUpperCase() || "A"}
            </Avatar>

            <Box minWidth={0}>
              <Typography
                fontSize={14}
                fontWeight={700}
                color="text.darkBrown"
                noWrap
                lineHeight={1.25}
              >
                {creator?.username ||
                  getDisplayName(creator) ||
                  brand ||
                  "Campaign"}
              </Typography>
              <Typography
                fontSize={12}
                fontWeight={500}
                color="text.primary"
                lineHeight={1.2}
              >
                Ad
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" alignItems="center" gap={0.75} flexShrink={0}>
            {showFollowButton && (
              <Box
                component="button"
                onClick={onFollowClick}
                disabled={followLoading}
                sx={{
                  border: "none",
                  background: "#FF1572",
                  color: "#FFFFFF",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.6,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  "&:hover": { background: "#E0115F" },
                  "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
                  whiteSpace: "nowrap",
                }}
              >
                {followLoading ? "..." : "Follow"}
              </Box>
            )}
            {category?.name && (
              <Chip
                label={category.name}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11,
                  textTransform: "capitalize",
                  bgcolor: "#F1F3F4",
                  color: "#5F6368",
                }}
              />
            )}
            {objective?.name && (
              <Chip
                label={objective.name}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11,
                  textTransform: "capitalize",
                  bgcolor: "#E8F0FE",
                  color: "#1565C0",
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Media */}
        {media?.length > 0 && (
          <Box
            position="relative"
            sx={
              isVideo
                ? {
                    width: "100%",
                    aspectRatio: VIDEO_ASPECT_RATIO,
                    overflow: "hidden",
                    bgcolor: "#1a1a1a",
                    "&:hover .campaign-video-pause-btn": { opacity: 1 },
                  }
                : undefined
            }
          >
            {isVideo ? (
              <>
                <Box
                  component="video"
                  ref={videoRef}
                  src={getFullS3Url(media[0]?.url)}
                  controls={false}
                  muted={isMuted}
                  loop
                  playsInline
                  onClick={togglePlayPause}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
                {!isPlaying && (
                  <Box
                    onClick={togglePlayPause}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(0, 0, 0, 0.35)",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PlayArrowIcon
                        sx={{ fontSize: 36, color: "#FF1572", ml: 0.5 }}
                      />
                    </Box>
                  </Box>
                )}
                {isPlaying && (
                  <IconButton
                    className="campaign-video-pause-btn"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause();
                    }}
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "common.white",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                  >
                    <PauseIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={toggleMute}
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "common.white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  {isMuted ? (
                    <VolumeOffIcon fontSize="small" />
                  ) : (
                    <VolumeUpIcon fontSize="small" />
                  )}
                </IconButton>
              </>
            ) : (
              <img
                src={getFullS3Url(media[0]?.url)}
                style={{ width: "100%", height: "auto", display: "block" }}
                alt={headline || "Campaign media"}
              />
            )}
          </Box>
        )}

        {/* Copy + CTA */}
        <Box px={2} py={1.5}>
          {headline && (
            <Typography
              color="text.darkBrown"
              fontSize={15}
              fontWeight={700}
              mb={primaryText ? 0.75 : 1.5}
            >
              {headline}
            </Typography>
          )}
          {primaryText && (
            <Typography color="text.Charcoal" fontSize={14} mb={1.5}>
              {primaryText}
            </Typography>
          )}

          {destinationUrl && (
            <Button
              fullWidth
              variant="contained"
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              onClick={handleCtaClick}
              sx={{
                bgcolor: "#FF1572",
                color: "#fff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "10px",
                py: 1.1,
                boxShadow: "none",
                "&:hover": { bgcolor: "#E0115F", boxShadow: "none" },
              }}
            >
              {ctaLabel}
            </Button>
          )}
        </Box>

        {/* Engagement */}
        <Stack direction="row" px={2} alignItems="center" gap={3} pb={1}>
          <Box display="flex" alignItems="center" gap={0.8}>
            {isLiked ? (
              <FavoriteIcon
                onClick={() => handleLikeDislikePost?.(_id, false)}
                sx={{
                  fontSize: 25,
                  color: "text.deepPink",
                  cursor: handleLikeDislikePost ? "pointer" : "default",
                }}
              />
            ) : (
              <FavoriteBorderIcon
                onClick={() => handleLikeDislikePost?.(_id, true)}
                sx={{
                  fontSize: 25,
                  color: "text.deepPink",
                  cursor: handleLikeDislikePost ? "pointer" : "default",
                }}
              />
            )}
            <Typography
              fontSize="13px"
              fontWeight={600}
              color="text.neutralGrey"
              onClick={() => handleOpenPostLikesDialog?.(campaign)}
              sx={{
                cursor: handleOpenPostLikesDialog ? "pointer" : "default",
                "&:hover": handleOpenPostLikesDialog
                  ? { textDecoration: "underline" }
                  : undefined,
              }}
            >
              {numberFormatter.format(likesCount)}
            </Typography>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={0.8}
            sx={{ cursor: handleOpenPostCommentsDialog ? "pointer" : "default" }}
            onClick={() => handleOpenPostCommentsDialog?.(campaign)}
          >
            <img src={CommentIcon} style={{ width: 20, height: 20 }} alt="" />
            <Typography
              fontSize="13px"
              fontWeight={600}
              color="text.neutralGrey"
            >
              {numberFormatter.format(commentsCount)}
            </Typography>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={0.8}
            sx={{ cursor: handleSharePost ? "pointer" : "default" }}
            onClick={() => handleSharePost?.(campaign)}
          >
            <img src={Send} style={{ width: 20, height: 20 }} alt="" />
            <Typography
              fontSize="13px"
              fontWeight={600}
              color="text.neutralGrey"
            >
              {numberFormatter.format(sharesCount)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.5)", mt: 1.5 }} />

        <Box mt={2} px={2} py={1} pb={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={(user?.image && getFullS3Url(user.image)) || ProfileImage}
              sx={{
                width: 40,
                height: 40,
                border: "2px solid",
                borderColor: "text.deepPink",
                flexShrink: 0,
              }}
            />

            <Box flex={1}>
              <CustomInput
                placeholder="Write your comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                type="text"
                name="comment"
                borderRadius="10px"
                InputEndIcon={
                  commentContent.trim().length > 0 && (
                    <img
                      src={Send}
                      alt="send"
                      style={{
                        width: 18,
                        height: 18,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        handleCreateComment?.(_id, commentContent);
                        setCommentContent("");
                      }}
                    />
                  )
                }
                sx={{
                  "& .MuiInputBase-input": {
                    color: "primary.white",
                    padding: "10px 15px",
                  },
                }}
              />
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  },
);
