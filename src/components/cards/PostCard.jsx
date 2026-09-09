import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import moment from "moment";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import CommentIcon from "../../assets/icon/message.svg";
import ProfileImage from "../../assets/icon/profile-home-page.svg";
import Send from "../../assets/icon/send.svg";
import {
  getInitialName,
  getUserHandle,
  numberFormatter,
} from "../../utils/helper";
import useUserStore from "../../zustand/userUserStore";
import CustomInput from "../cutomInput";
import { Link } from "react-router-dom";

const VIDEO_ASPECT_RATIO = "5 / 5";

export const PostCard = memo(
  ({
    post,
    handleLikeDislikePost,
    handleCreateComment,
    handleOpenPostCommentsDialog,
    handleOpenPostLikesDialog,
    handleInitiateChat,
    handleEditPost,
    handleDeletePost,
    handleSharePost,
  }) => {
    const {
      author,
      caption,
      media,
      likesCount,
      commentsCount,
      sharesCount,
      isLiked,
      createdAt,
    } = post;
    // User Data
    const { user } = useUserStore();
    // Comment Content
    const [commentContent, setCommentContent] = useState("");
    const [menuAnchor, setMenuAnchor] = useState(null);

    // Video autoplay-on-view
    const videoRef = useRef(null);
    const userPausedRef = useRef(false);
    const [isVideoInView, setIsVideoInView] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const isOwnPost = user?._id === author?._id;
    const timeAgo = moment(createdAt).fromNow();

    const isVideo = useMemo(
      () =>
        media?.[0]?.mediaType === "video" ||
        media?.[0]?.url?.includes("/video/upload/"),
      [media],
    );

    const handleMenuOpen = (event) => {
      setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
      setMenuAnchor(null);
    };

    const userHandle = useMemo(() => getUserHandle(author), [author]);

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
        bgcolor={"background.lightgray"}
        borderRadius={"10px"}
        mt={2}
        border="1px solid"
        borderColor="divider"
        overflow="hidden"
      >
        {/* Header Part */}
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          gap="10px"
          p={2}
        >
          <Box display="flex" gap="10px">
            <Avatar src={author?.image} sx={{ width: "50px", height: "50px" }}>
              {getInitialName(author)}
            </Avatar>
            <Box>
              <Stack>
                <Typography
                  component={Link}
                  to={`/${author?.username}/all-posts`}
                  color="text.darkBrown"
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {userHandle}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  {timeAgo}
                </Typography>
              </Stack>
            </Box>
          </Box>

          {isOwnPost && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ color: "text.neutralGrey" }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    handleEditPost(post);
                    handleMenuClose();
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleDeletePost(post);
                    handleMenuClose();
                  }}
                  sx={{ color: "text.deepPink" }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* Caption Part */}
        <Box px={2} py={1}>
          <Typography color="text.Charcoal" fontSize={"14px"}>
            {caption}
          </Typography>
        </Box>

        {/* Media — only render if available */}
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
                    "&:hover .post-video-pause-btn": { opacity: 1 },
                  }
                : {
                    "&:hover .post-video-pause-btn": { opacity: 1 },
                  }
            }
          >
            {isVideo ? (
              <>
                <Box
                  component="video"
                  ref={videoRef}
                  src={media[0]?.url}
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
                    className="post-video-pause-btn"
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
                src={media[0]?.url}
                style={{ width: "100%", height: "auto" }}
                alt="Post media"
              />
            )}
          </Box>
        )}

        <Stack direction="row" px={2} alignItems="center" gap={3} mt={1}>
          {/* Like */}
          <Box display="flex" alignItems="center" gap={0.8}>
            {isLiked ? (
              <FavoriteIcon
                onClick={() => handleLikeDislikePost(post._id, false)}
                sx={{
                  fontSize: 25,
                  color: "text.deepPink",
                  cursor: "pointer",
                }}
              />
            ) : (
              <FavoriteBorderIcon
                onClick={() => handleLikeDislikePost(post._id, true)}
                sx={{
                  fontSize: 25,
                  color: "text.deepPink",
                  cursor: "pointer",
                }}
              />
            )}

            <Typography
              fontSize="13px"
              fontWeight={600}
              color="text.neutralGrey"
              onClick={() => handleOpenPostLikesDialog(post)}
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {numberFormatter.format(likesCount)}
            </Typography>
          </Box>

          {/* Comments */}
          <Box
            display="flex"
            alignItems="center"
            gap={0.8}
            sx={{ cursor: "pointer" }}
            onClick={() => handleOpenPostCommentsDialog(post)}
          >
            <img src={CommentIcon} style={{ width: 20, height: 20 }} />

            <Typography
              fontSize="13px"
              fontWeight={600}
              color="text.neutralGrey"
            >
              {numberFormatter.format(commentsCount)}
            </Typography>
          </Box>

          {/* Shares */}
          <Box
            display="flex"
            alignItems="center"
            gap={0.8}
            sx={{ cursor: "pointer" }}
            onClick={() => handleSharePost(post)}
          >
            <img src={Send} style={{ width: 20, height: 20 }} />

            <Typography
              fontSize="13px"
              fontWeight={600}
              color="text.neutralGrey"
            >
              {numberFormatter.format(sharesCount)}
            </Typography>
          </Box>
          {/* Can start chat with the user itself */}
          {user?._id !== post.author._id && (
            <Box display="flex" alignItems="center" gap={0.8}>
              <ChatBubbleOutlineOutlinedIcon
                onClick={() => handleInitiateChat(post)}
                sx={{ fontSize: 20, color: "text.deepPink", cursor: "pointer" }}
              />
            </Box>
          )}
        </Stack>

        {/* divider + comment section unchanged */}
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.5)", mt: 2.5 }} />

        <Box mt={2} px={2} py={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={user?.image || ProfileImage}
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
                        handleCreateComment(post._id, commentContent);
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
