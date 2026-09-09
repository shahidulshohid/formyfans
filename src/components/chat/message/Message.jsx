import DownloadIcon from "@mui/icons-material/Download";
import IosShareIcon from "@mui/icons-material/IosShare";
import MicIcon from "@mui/icons-material/Mic";
import PauseIcon from "@mui/icons-material/Pause";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  downloadFile,
  formatMessageTime,
  getDisplayName,
  getInitialName,
  getUserProfileImage,
} from "../../../utils/helper";
import useActiveChatStore from "../../../zustand/activeChatStore";
import useMessageStore from "../../../zustand/messageStore";
import useUserStore from "../../../zustand/userUserStore";
import CustomButton from "../../cutomButon";
import { PostDetailDialog } from "../../dialogs";

const typingDotStyle = (delay) => ({
  width: 6,
  height: 6,
  bgcolor: "grey.500",
  borderRadius: "50%",
  animation: "typingBounce 1.4s infinite ease-in-out",
  animationDelay: `${delay}ms`,
});

// ─── WhatsApp-style Audio Bubble ─────────────────────────────────────────────
export const AudioBubble = ({ url, isOwn }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100 || 0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      minWidth="220px"
      maxWidth="280px"
      py={0.5}
    >
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Play / Pause button */}
      <IconButton
        onClick={handlePlayPause}
        size="small"
        sx={{
          bgcolor: isOwn ? "primary.main" : "grey.600",
          color: "#fff",
          width: 36,
          height: 36,
          flexShrink: 0,
          "&:hover": {
            bgcolor: isOwn ? "primary.dark" : "grey.700",
          },
        }}
      >
        {isPlaying ? (
          <PauseIcon sx={{ fontSize: 20 }} />
        ) : (
          <PlayArrowIcon sx={{ fontSize: 20 }} />
        )}
      </IconButton>

      {/* Waveform + time */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.3 }}>
        <Box
          onClick={handleProgressClick}
          sx={{
            width: "100%",
            cursor: "pointer",
            "& .MuiLinearProgress-root": {
              height: 4,
              borderRadius: 2,
              bgcolor: isOwn ? "rgba(255,255,255,0.35)" : "grey.300",
            },
            "& .MuiLinearProgress-bar": {
              borderRadius: 2,
              bgcolor: isOwn ? "#fff" : "grey.700",
            },
          }}
        >
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        {/* Time */}
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.68rem",
            color: isOwn ? "rgba(255,255,255,0.8)" : "text.secondary",
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>

      {/* Mic icon */}
      <MicIcon
        sx={{
          fontSize: 16,
          flexShrink: 0,
          color: isOwn ? "rgba(255,255,255,0.7)" : "grey.500",
        }}
      />
    </Box>
  );
};

const SharedPostPreview = ({ sharedPost, postDetailDialogRef }) => {
  if (!sharedPost?.postId) return null;

  const post = sharedPost.postId;
  const media = post?.media?.[0];
  const isVideo =
    media?.mediaType === "video" || media?.url?.includes("/video/upload/");
  const author = post?.authorId;
  const profilePath = author?.username ? `/${author.username}` : null;

  return (
    <Box sx={{ mb: 0.5, width: "100%", maxWidth: 260 }}>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={0.75}
          px={1.25}
          py={0.75}
          sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}
        >
          <IosShareIcon sx={{ fontSize: 14, color: "#FF1572" }} />
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: "#8B92A4",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Shared post
          </Typography>
        </Box>

        {author && (
          <Box
            component={profilePath ? Link : "div"}
            to={profilePath || undefined}
            display="flex"
            alignItems="center"
            gap={1}
            px={1.25}
            py={0.85}
            sx={{
              textDecoration: "none",
              color: "inherit",
              "&:hover": profilePath
                ? { bgcolor: "rgba(255, 21, 114, 0.04)" }
                : undefined,
            }}
          >
            <Avatar
              src={getUserProfileImage(author)}
              sx={{ width: 28, height: 28, fontSize: 12 }}
            >
              {getInitialName(author)}
            </Avatar>
            <Typography
              variant="body2"
              fontWeight={600}
              fontSize={13}
              color="#5E1321"
              noWrap
              sx={{ textDecoration: "none" }}
            >
              {getDisplayName(author)}
            </Typography>
          </Box>
        )}

        {media?.url && (
          <Box
            onClick={() => postDetailDialogRef.current.open(post)}
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              maxHeight: 220,
              overflow: "hidden",
              bgcolor: "#f3f3f3",
              cursor: "pointer",
            }}
          >
            {isVideo ? (
              <Box
                component="video"
                src={media.url}
                muted
                playsInline
                preload="metadata"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Box
                component="img"
                src={media.url}
                alt="Shared post"
                onClick={() => postDetailDialogRef.current.open(post)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </Box>
        )}

        {post.caption && (
          <Typography
            px={1.25}
            py={1}
            fontSize={12}
            lineHeight={1.45}
            color="#282828"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.caption}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ─── Main MessageBody ────────────────────────────────────────────────────────
const MessageBody = ({ socket }) => {
  const messageEndRef = useRef(null);
  const postDetailDialogRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const { user } = useUserStore();
  const { activeChat } = useActiveChatStore();
  const {
    insideMessages,
    loading,
    error,
    fetchInsideMessage,
    addInsideMessage,
  } = useMessageStore();

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({});
    }
  };

  useEffect(() => {
    if (!activeChat) return;
    fetchInsideMessage(activeChat?.conversationId);
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    const handleOnline = () => fetchInsideMessage(activeChat.conversationId);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [activeChat]);

  useEffect(() => {
    if (socket && user && activeChat) {
      socket.emit("reset_unread_count", {
        conversationId: activeChat?.conversationId,
        userId: user?._id,
      });
    }
  }, [activeChat, socket, insideMessages]);

  useEffect(() => {
    if (socket && activeChat && user) {
      socket.emit("join_conversation_room", {
        conversationId: activeChat?.conversationId,
      });
      const handleReceiveMessage = (newMessage) => {
        setIsTyping(false);
        if (newMessage.conversationId === activeChat?.conversationId) {
          addInsideMessage(newMessage);
        }
      };
      socket.on("receive_message", handleReceiveMessage);
      return () => socket.off("receive_message");
    }
  }, [user, socket, activeChat]);

  useEffect(() => {
    if (!socket) return;
    socket.on("user_typing", () => {
      setIsTyping(true);
      scrollToBottom();
    });
    socket.on("user_stop_typing", () => {
      setIsTyping(false);
      scrollToBottom();
    });
    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [insideMessages]);

  const handleDownload = async (file) => {
    try {
      await downloadFile(file);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box flex={1} overflow={"auto"} p={1.5}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          flexDirection="column"
          gap={1}
        >
          <Typography color="error">Error fetching messages</Typography>
          <CustomButton
            title="Retry"
            width="auto"
            handleClickBtn={() =>
              fetchInsideMessage(activeChat?.conversationId)
            }
          />
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {insideMessages.map((message, index) => {
            const isOwn = message.senderId === user?._id;
            const showAvatar =
              index === 0 ||
              insideMessages[index - 1]?.senderId !== message.senderId;
            const isAttachment = !!message.attachment;

            const isImageMsg =
              message.attachment?.type === "image" ||
              (message.attachment?.url &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(message.attachment.url));

            const isPDFMsg =
              message.attachment?.type === "file" ||
              (message.attachment?.url &&
                /\.pdf$/i.test(message.attachment.url));

            const isAudioMsg = message.attachment?.type === "audio";
            const hasSharedPost = Boolean(message.sharedPost);

            return (
              <Box
                key={message._id}
                display="flex"
                justifyContent={isOwn ? "flex-end" : "flex-start"}
              >
                <Box
                  display="flex"
                  flexDirection={isOwn ? "row-reverse" : "row"}
                  alignItems="baseline"
                  gap={1}
                  maxWidth="80%"
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    isOwn ? (
                      <Avatar
                        src={user?.image}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar
                        src={activeChat?.participant?.sender?.image}
                        sx={{ width: 40, height: 40 }}
                      />
                    )
                  ) : (
                    <Box sx={{ width: 40 }} />
                  )}

                  {/* Message Bubble */}
                  <Box
                    px={hasSharedPost ? 0.75 : isAudioMsg ? 1 : 1.5}
                    py={hasSharedPost ? 0.75 : 1}
                    bgcolor={isOwn ? "primary.main" : "secondary.light"}
                    borderRadius={
                      isOwn ? "10px 0 10px 10px" : "0 10px 10px 10px"
                    }
                    boxShadow={1}
                    maxWidth="100%"
                  >
                    {isAttachment && (
                      <>
                        {/* IMAGE */}
                        {isImageMsg && (
                          <Box
                            mb={0.5}
                            borderRadius={2}
                            overflow="hidden"
                            maxWidth="220px"
                            position="relative"
                            sx={{
                              cursor: "pointer",
                              "&:hover": { opacity: 0.95 },
                            }}
                          >
                            <img
                              src={message.attachment.url}
                              alt={message.attachment.name || "image"}
                              style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                            <Box
                              position="absolute"
                              top={4}
                              right={4}
                              bgcolor="rgba(0,0,0,0.5)"
                              borderRadius="50%"
                              p={0.5}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              onClick={() => handleDownload(message.attachment)}
                              sx={{ cursor: "pointer" }}
                            >
                              <DownloadIcon fontSize="small" htmlColor="#fff" />
                            </Box>
                          </Box>
                        )}

                        {/* PDF */}
                        {isPDFMsg && (
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            p={1}
                            mb={0.5}
                            bgcolor="#f5f5f5"
                            borderRadius={
                              isOwn ? "10px 0 10px 10px" : "0 10px 10px 10px"
                            }
                          >
                            <PictureAsPdfIcon color="error" />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={500}>
                                {message.attachment.name || "PDF File"}
                              </Typography>
                              <Typography
                                fontSize="0.75rem"
                                color="text.secondary"
                              >
                                {Math.round(message.attachment.size / 1024)} KB
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(message.attachment)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}

                        {/* AUDIO — WhatsApp style */}
                        {isAudioMsg && (
                          <AudioBubble
                            url={message.attachment.url}
                            isOwn={isOwn}
                          />
                        )}
                      </>
                    )}

                    {hasSharedPost && (
                      <SharedPostPreview sharedPost={message.sharedPost} postDetailDialogRef={postDetailDialogRef} />
                    )}

                    {/* Text */}
                    {message.message && !hasSharedPost && (
                      <Typography
                        variant="body2"
                        sx={{ color: isOwn ? "#fff" : "text.primary" }}
                      >
                        {message.message}
                      </Typography>
                    )}

                    {/* Status */}
                    {message.isPending && (
                      <Typography variant="body2" color="text.white">
                        Sending...
                      </Typography>
                    )}
                    {message.error && (
                      <Typography variant="body2" color="error">
                        Failed to send message
                      </Typography>
                    )}

                    {/* Timestamp */}
                    {message.timestamp && (
                      <Typography
                        color={
                          isOwn ? "rgba(255,255,255,0.7)" : "text.secondary"
                        }
                        fontSize="0.65rem"
                        textAlign="right"
                        mt={0.3}
                      >
                        {formatMessageTime(message.timestamp)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <Box display="flex" alignItems="center" gap={1} p={1}>
              <Avatar
                src={activeChat?.participant?.sender?.image}
                sx={{ width: 40, height: 40 }}
              />
              <Box
                bgcolor="#F5F5F5"
                borderRadius="10px"
                p={1}
                maxWidth="220px"
                boxShadow={1}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Typing
                  </Typography>
                  <Box display="flex" gap={0.5}>
                    <Box sx={typingDotStyle(0)} />
                    <Box sx={typingDotStyle(150)} />
                    <Box sx={typingDotStyle(300)} />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          <div ref={messageEndRef} />
        </Box>
      )}

      <PostDetailDialog ref={postDetailDialogRef} />
    </Box>
  );
};

export default MessageBody;
