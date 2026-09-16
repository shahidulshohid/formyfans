import {
  Heart,
  MessageCircle,
  MoreVertical,
  Pause,
  Play,
  Send,
  Volume2,
  VolumeX,
  ArrowRight,
} from "lucide-react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import moment from "moment";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import CommentIcon from "../../assets/icon/message.svg";
import ProfileImage from "../../assets/icon/profile-home-page.svg";
import SendIcon from "../../assets/icon/send.svg";
import {
  getDisplayName,
  getInitialName,
  getUserHandle,
  getUserProfileImage,
  numberFormatter,
} from "../../utils/helper";
import { getFullS3Url } from "../../utils/s3Helper";
import useUserStore from "../../zustand/userUserStore";
import MentionInput from "../MentionInput";
import { Link, useNavigate } from "react-router-dom";
import { trackWebsiteClick, trackProfileVisit } from "../../api/modules/analytics";

const VIDEO_ASPECT_RATIO = "5 / 5";
const POST_AVATAR_SIZE = 50;

// Author avatar, or overlapping stack for collaborative posts.
export const PostAuthorAvatars = ({
  author,
  collaborators,
  size = POST_AVATAR_SIZE,
}) => {
  const collaboratorUsers =
    collaborators?.map((entry) => entry.user).filter(Boolean) ?? [];

  const overlap = Math.round(size * 0.44);

  const avatarSx = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    border: "2px solid",
    borderColor: "neutral.deepPink",
    bgcolor: "colors.white",
    boxSizing: "border-box",
  };

  const renderAvatar = (person, index) => {
    const path = person?.username ? `/${person.username}/all-posts` : null;

    return (
      <Avatar
        key={person?._id || index}
        {...(path ? { component: Link, to: path } : {})}
        src={getFullS3Url(person?.image)}
        alt={getUserHandle(person)}
        sx={{
          ...avatarSx,
          ml: index === 0 ? 0 : `-${overlap}px`,
          zIndex: index + 1,
          cursor: path ? "pointer" : "default",
        }}
      >
        {getInitialName(person)}
      </Avatar>
    );
  };

  if (!collaboratorUsers.length) {
    return renderAvatar(author, 0);
  }

  const people = [author, ...collaboratorUsers].slice(0, 4);

  return (
    <Box display="flex" alignItems="center" flexShrink={0}>
      {people.map((person, index) => renderAvatar(person, index))}
    </Box>
  );
};

// Renders "authorHandle" or, for collaborative posts, "authorHandle and
// collaboratorHandle" (Instagram-style), each name linking to its own profile.
export const PostAuthorHeading = ({ author, collaborators }) => {
  const authorHandle = useMemo(() => getUserHandle(author), [author]);
  const authorPath = author?.username ? `/${author.username}/all-posts` : null;

  if (!collaborators?.length) {
    return (
      <Typography
        component={authorPath ? Link : "span"}
        to={authorPath || undefined}
        color="neutral.black"
        fontWeight={700}
        fontSize="14px"
        sx={{
          textDecoration: "none",
          "&:hover": authorPath ? { textDecoration: "underline" } : undefined,
        }}
      >
        {authorHandle}
      </Typography>
    );
  }

  const nameLink = (person, key) => {
    const handle = getUserHandle(person);
    const path = person?.username ? `/${person.username}/all-posts` : null;
    return (
      <Typography
        key={key}
        component={path ? Link : "span"}
        to={path || undefined}
        color="neutral.black"
        fontWeight={700}
        fontSize="14px"
        display="inline"
        sx={{
          textDecoration: "none",
          "&:hover": path ? { textDecoration: "underline" } : undefined,
        }}
      >
        {handle}
      </Typography>
    );
  };

  return (
    <Typography component="span" color="neutral.black" fontSize="14px">
      {nameLink(author, "author")}
      <Typography component="span" color="text.neutralGrey" fontWeight={400}>
        {" "}
        and{" "}
      </Typography>
      {collaborators.length === 1 ? (
        nameLink(collaborators[0].user, collaborators[0].userId)
      ) : (
        <Typography component="span" color="neutral.black" fontWeight={700}>
          {collaborators.length} others
        </Typography>
      )}
    </Typography>
  );
};

// Facebook-style "with X", "with X and Y", "with X, Y and Z others"
export const PostTaggedUsers = ({ taggedUsers }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const users = taggedUsers?.filter((t) => t.user) ?? [];
  if (!users.length) return null;

  const nameLink = (person, key) => {
    const handle = getUserHandle(person);
    const path = person?.username ? `/${person.username}/all-posts` : null;
    return (
      <Typography
        key={key}
        component={path ? Link : "span"}
        to={path || undefined}
        color="neutral.black"
        fontWeight={600}
        fontSize="13px"
        display="inline"
        sx={{
          textDecoration: "none",
          "&:hover": path ? { textDecoration: "underline" } : undefined,
        }}
      >
        {handle}
      </Typography>
    );
  };

  const othersCount = users.length - 2;
  const othersLabel = othersCount === 1 ? "1 other" : `${othersCount} others`;

  const renderTaggedText = () => {
    if (users.length === 1) {
      return (
        <>
          {" with "}
          {nameLink(users[0].user, users[0].userId)}
        </>
      );
    }
    if (users.length === 2) {
      return (
        <>
          {" with "}
          {nameLink(users[0].user, users[0].userId)}
          {" and "}
          {nameLink(users[1].user, users[1].userId)}
        </>
      );
    }
    // 3+ tagged: "with X, Y and N others" — "N others" is hoverable
    return (
      <>
        {" with "}
        {nameLink(users[0].user, users[0].userId)}
        {", "}
        {nameLink(users[1].user, users[1].userId)}
        {" and "}
        <Typography
          component="span"
          fontWeight={600}
          fontSize="13px"
          color="neutral.deepPink"
          sx={{
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget?.contains?.(e.relatedTarget)) {
              setAnchorEl(null);
            }
          }}
        >
          {othersLabel}
        </Typography>
      </>
    );
  };

  return (
    <>
      <Typography
        component="span"
        color="text.neutralGrey"
        fontSize="13px"
        fontWeight={400}
      >
        {renderTaggedText()}
      </Typography>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              minWidth: 220,
              maxWidth: 300,
              overflow: "hidden",
            },
          },
        }}
        sx={{ pointerEvents: "none" }}
      >
        <Box
          sx={{ py: 0.5 }}
          onMouseEnter={() => {}}
          onMouseLeave={() => setAnchorEl(null)}
          style={{ pointerEvents: "auto" }}
        >
          {users.map((tag) => {
            const u = tag.user;
            const path = u?.username ? `/${u.username}/all-posts` : "#";
            return (
              <Box
                key={tag.userId}
                component={Link}
                to={path}
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorEl(null);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 2,
                  py: 1,
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                <Avatar
                  src={getUserProfileImage(u)}
                  sx={{ width: 36, height: 36, flexShrink: 0 }}
                >
                  {getInitialName(u)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {getDisplayName(u)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {getUserHandle(u)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

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
    handleFollowBoost,
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

    const boost = post.boost || null;
    const boostObjective = boost?.objective || post.boostObjective || null;
    const isFollowingAuthor = Boolean(author?.isFollowing);
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [commentContent, setCommentContent] = useState("");
    const [commentMentions, setCommentMentions] = useState([]);
    const [menuAnchor, setMenuAnchor] = useState(null);

    // Video autoplay-on-view
    const videoRef = useRef(null);
    const userPausedRef = useRef(false);
    const [isVideoInView, setIsVideoInView] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [seeMoreCaption, setSeeMoreCaption] = useState(false);

    const handleSeeMoreCaption = () => {
      setSeeMoreCaption(!seeMoreCaption);
    };

    const isOwnPost = user?._id === author?._id;
    const showBoostCta = Boolean(boost) && !isOwnPost;
    const timeAgo = moment(createdAt).fromNow();

    const handleFollowClick = async () => {
      if (!author?._id) return;
      try {
        await handleFollowBoost?.(post, isFollowingAuthor);
      } catch {
        // Parent handles optimistic rollback + toast.
      }
    };

    const handleWebsiteClick = () => {
      if (boost?.websiteUrl) {
        trackWebsiteClick(boost._id);
        window.open(boost.websiteUrl, "_blank", "noopener,noreferrer");
      }
    };

    const collaboratorEntries = useMemo(
      () => post.collaborators?.filter((c) => c?.user) ?? [],
      [post.collaborators],
    );

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

    const togglePlayPause = () => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (videoEl.paused) {
        userPausedRef.current = false;
        videoEl.play().catch(() => { });
      } else {
        userPausedRef.current = true;
        videoEl.pause();
      }
    };

    const toggleMute = (event) => {
      event.stopPropagation();
      setIsMuted((prev) => !prev);
    };

    // Track whether the video is in the viewport
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

    // Play/pause based on viewport visibility
    useEffect(() => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (isVideoInView && !userPausedRef.current) {
        videoEl.play().catch(() => { });
      } else if (!isVideoInView) {
        videoEl.pause();
        userPausedRef.current = false;
      }
    }, [isVideoInView]);

    return (
      <Box
        bgcolor="colors.white"
        borderRadius="20px"
        mt={2}
        border="1px solid"
        borderColor="neutral.ligthColor"
        // boxShadow="0 4px 20px rgba(0,0,0,0.06)"
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
          <Box
            display="flex"
            gap="10px"
            onClick={() => {
              if (showBoostCta && boostObjective === "profile") {
                trackProfileVisit(post._id);
              }
            }}
          >
            <PostAuthorAvatars
              author={author}
              collaborators={collaboratorEntries}
            />
            <Box>
              <Stack>
                <Box>
                  <PostAuthorHeading
                    author={author}
                    collaborators={collaboratorEntries}
                  />
                  <PostTaggedUsers taggedUsers={post.taggedUsers} />
                </Box>
                <Typography fontSize="12px" color="text.neutralGrey">
                  {timeAgo}
                  {/* {(post.itemType === "boost" || (boost && post.isBoosted)) && (
                    <Typography
                      component="span"
                      fontSize="11px"
                      color="text.neutralGrey"
                      fontWeight={600}
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                      ml={1}
                    >
                      • Sponsored
                    </Typography>
                  )} */}
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
            {/* Boost objective CTAs */}
            {showBoostCta && boostObjective === "profile" && (
              <Box
                component="button"
                onClick={handleFollowClick}
                sx={{
                  border: "none",
                  background: isFollowingAuthor ? "transparent" : "#FF1572",
                  color: isFollowingAuthor ? "#FF1572" : "#FFFFFF",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.6,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  "&:hover": {
                    background: isFollowingAuthor
                      ? "rgba(255, 21, 114, 0.08)"
                      : "#E0115F",
                  },
                  whiteSpace: "nowrap",
                }}
              >
                {isFollowingAuthor ? "Unfollow" : "Follow"}
              </Box>
            )}

            {showBoostCta && boostObjective === "messages" && (
              <Button
                size="small"
                variant="contained"
                onClick={() => handleInitiateChat(post)}
                sx={{
                  bgcolor: "#FF1572",
                  color: "#fff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "20px",
                  px: 2,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#E0115F", boxShadow: "none" },
                }}
              >
                Send Message
              </Button>
            )}

            {isOwnPost && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ color: "text.neutralGrey" }}
                >
                  <MoreVertical size={20} />
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
                    sx={{ color: "neutral.deepPink" }}
                  >
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
        </Box>

        {/* Caption Part */}
        <Box px={2} py={1}>
          <Typography color="neutral.black" fontSize="14px">
            {seeMoreCaption ? caption : caption.slice(0, 180) + "..."}
            {caption.length > 100 && (
              <Typography color="neutral.deepPink" fontSize="12px" onClick={handleSeeMoreCaption} sx={{ cursor: "pointer" }}>
                {seeMoreCaption ? "See less" : "See more"}
              </Typography>
            )}
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
                      <Play
                        size={32}
                        color="#FF1572"
                        style={{ marginLeft: 4 }}
                        fill="#FF1572"
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
                    <Pause size={18} />
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
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </IconButton>
              </>
            ) : (
              <img
                src={getFullS3Url(media[0]?.url)}
                style={{ width: "100%", height: "auto" }}
                alt="Post media"
              />
            )}

            {/* "website" boost objective → Shop Now-style overlay on the media */}
            {showBoostCta && boostObjective === "website" && boost?.websiteUrl && (
              <Box
                onClick={handleWebsiteClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  // position: "absolute",
                  // bottom: 0,
                  // left: 0,
                  // right: 0,
                  // margin: "0 auto",
                  bgcolor: "neutral.deepPink",
                  py: 1.4,
                  px: 2,
                  cursor: "pointer",
                }}
              >
                <Typography
                  sx={{
                    color: "colors.white",
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "none",
                  }}
                >
                  Go to Website
                </Typography>
                <ArrowRight size={18} color="#fff" />
              </Box>
            )}
          </Box>
        )}

        <Stack direction="row" px={2} alignItems="center" gap={3} mt={1}>
          {/* Like */}
          <Box display="flex" alignItems="center" gap={0.6}>
            <Heart
              onClick={() =>
                handleLikeDislikePost(post._id, !isLiked)
              }
              size={20}
              color={isLiked ? "#FF1572" : "rgb(114, 115, 117)"}
              fill={isLiked ? "#FF1572" : "none"}
              style={{ cursor: "pointer" }}
            />

            <Typography
              fontSize="13px"
              fontWeight={600}
              color={isLiked ? "neutral.deepPink" : "text.neutralGrey"}
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

            <MessageCircle size={20} color="rgb(114, 115, 117)" />

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

            <Send size={20} color="rgb(114, 115, 117)" />

            <Typography
              fontSize="13px"
              fontWeight={600}
              color="text.neutralGrey"
            >
              {numberFormatter.format(sharesCount)}
            </Typography>
          </Box>
        </Stack>

        {/* divider + comment section unchanged */}
        {/* <Divider sx={{ borderColor: "neutral.ligthColor", mt: 2.5 }} /> */}

        <Box mt={2} px={2} py={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={(user?.image && getFullS3Url(user.image)) || ProfileImage}
              sx={{
                width: 40,
                height: 40,
                border: "2px solid",
                borderColor: "neutral.deepPink",
                flexShrink: 0,
              }}
            />

            <Box flex={1}>
              <MentionInput
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                mentions={commentMentions}
                onMentionsChange={setCommentMentions}
                InputProps={{
                  endAdornment:
                    commentContent.trim().length > 0 && (
                      <img
                        src={SendIcon}
                        alt="send"
                        style={{
                          width: 18,
                          height: 18,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          handleCreateComment(
                            post._id,
                            commentContent,
                            commentMentions,
                          );
                          setCommentContent("");
                          setCommentMentions([]);
                        }}
                      />
                    ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    bgcolor: "rgba(249, 153, 164, 0.1)",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiInputBase-input": {
                    color: "neutral.black",
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