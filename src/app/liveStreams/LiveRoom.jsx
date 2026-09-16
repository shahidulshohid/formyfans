import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  VideoTrack 
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { Track } from "livekit-client";
import { Gift, Gem } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createLiveStreamComment,
  endLiveStream,
  getLiveStream,
  getLiveStreamComments,
  getLiveStreamToken,
} from "../../api/modules/liveStream";
import CustomButton from "../../components/cutomButon";
import { FanbugDialog } from "../../components/dialogs";
import FanbugCarousel from "../../components/fanbugCarousel";
import { AppInput } from "../../components/input";
import { SocketContext } from "../../context/SocketContext";
import {
  getDisplayName,
  getInitialName,
  getShortTimeAgo,
  getUserProfileImage,
} from "../../utils/helper";
import VideoStage from "./VideoStage";



const LiveRoom = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const commentsEndRef = useRef(null);
  const fanbugDialogRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [connection, setConnection] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);

  const isCreator = connection?.role === "creator";
  const isCoHost = connection?.role === "co-host";
  const isPublisher = isCreator || isCoHost;
  const publisherIds = useMemo(
    () => [
      stream?.creator?._id || stream?.creator,
      stream?.coHost?._id || stream?.coHost,
    ],
    [stream],
  );
  const fanbugComments = useMemo(
    () =>
      [...comments]
        .filter((item) => item.type === "fanbug")
        .slice(-8)
        .reverse(),
    [comments],
  );

  const participantsMeta = useMemo(() => {
  const meta = {};
  const addEntry = (user) => {
    const id = (user?._id || user)?.toString?.() || user?.toString?.();
    if (!id) return;
    meta[id] = {
      name: user?.username || getDisplayName(user),
      initial: getInitialName(user),
      avatarUrl: getUserProfileImage(user),
    };
  };
  addEntry(stream?.creator);
  addEntry(stream?.coHost);
  return meta;
}, [stream]);

  const appendComment = (newComment) => {
    setComments((prev) =>
      prev.some((item) => item._id === newComment._id)
        ? prev
        : [...prev, newComment],
    );
  };

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        const [streamResponse, tokenResponse, commentsResponse] =
          await Promise.all([
            getLiveStream(streamId),
            getLiveStreamToken(streamId),
            getLiveStreamComments(streamId, { page: 1, limit: 50 }),
          ]);

        setStream(streamResponse?.data?.data);
        setConnection(tokenResponse?.data?.data);
        setComments(commentsResponse?.data?.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Could not join live stream",
        );
        navigate("/live-streams", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [streamId, navigate]);

  useEffect(() => {
    if (!socket || !streamId) return;

    socket.emit("join_livestream", { streamId });

    const handleComment = (newComment) => appendComment(newComment);
    const handleViewerCount = (payload) => {
      if (payload.streamId === streamId) {
        setViewerCount(payload.viewerCount);
      }
    };
    const handleFanbug = (payload) => {
      if (payload.streamId?.toString() !== streamId.toString()) return;
      if (payload.comment) appendComment(payload.comment);
      if (payload.amountInCents) {
        setStream((prev) =>
          prev
            ? {
                ...prev,
                fanbugTotalCents:
                  (prev.fanbugTotalCents || 0) + payload.amountInCents,
                fanbugCount: (prev.fanbugCount || 0) + 1,
              }
            : prev,
        );
      }
    };
    const handleEnded = (payload) => {
      if (payload.streamId === streamId) {
        toast.info("This live stream has ended");
        navigate("/live-streams", { replace: true });
      }
    };

    socket.on("livestream_comment", handleComment);
    socket.on("livestream_viewer_count", handleViewerCount);
    socket.on("livestream_fanbug", handleFanbug);
    socket.on("livestream_ended", handleEnded);

    return () => {
      socket.emit("leave_livestream", { streamId });
      socket.off("livestream_comment", handleComment);
      socket.off("livestream_viewer_count", handleViewerCount);
      socket.off("livestream_fanbug", handleFanbug);
      socket.off("livestream_ended", handleEnded);
    };
  }, [socket, streamId, navigate]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = async () => {
    const content = comment.trim();
    if (!content || sending) return;

    try {
      setSending(true);
      setComment("");
      const response = await createLiveStreamComment(streamId, { content });
      appendComment(response?.data?.data);
    } catch (error) {
      setComment(content);
      toast.error(
        error?.response?.data?.message || "Could not post comment",
      );
    } finally {
      setSending(false);
    }
  };

  const handleCommentKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendComment();
    }
  };

  const handleEndStream = async () => {
    if (ending) return;
    try {
      setEnding(true);
      await endLiveStream(streamId);
      toast.success("Live stream ended");
      navigate("/live-streams", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not end live stream",
      );
      setEnding(false);
    }
  };

  const handleFanbugSuccess = (payload) => {
    if (payload?.comment) {
      appendComment(payload.comment);
    }
  };

  if (loading || !connection || !stream) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="neutral.white"
      >
        <CircularProgress sx={{ color: "neutral.deepPink" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        bgcolor: "neutral.white",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        px={{ xs: 1.5, md: 2.5 }}
        py={1.25}
        bgcolor="neutral.Charcoal"
        color="text.white"
        flexShrink={0}
      >
        <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
          <IconButton
            onClick={() => navigate("/live-streams")}
            sx={{ color: "text.white" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Avatar
            src={getUserProfileImage(stream.creator)}
            sx={{ width: 38, height: 38 }}
          >
            {getInitialName(stream.creator)}
          </Avatar>
          <Box minWidth={0}>
            <Typography fontSize={15} fontWeight={700} noWrap>
              {stream.title}
            </Typography>
            <Typography fontSize={12} color="text.halfWhite" noWrap>
              Host:{" "}
              {stream.creator?.username || getDisplayName(stream.creator)}
              {stream.streamType === "collaborative" &&
                stream.coHost &&
                ` · Co-host: ${
                  stream.coHost.username || getDisplayName(stream.coHost)
                }`}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "background.deepPink",
              color: "text.white",
              px: 1,
              py: 0.35,
              borderRadius: "5px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".06em",
            }}
          >
            LIVE
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5} flexShrink={0}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <VisibilityIcon sx={{ fontSize: 18, color: "text.white" }} />
            <Typography fontSize={13} color="text.white">
              {viewerCount}
            </Typography>
          </Box>
          {!isCreator && (
            <CustomButton
              title="Send Fan bucks"
              icon={<Gem size={16} />}
              handleClickBtn={() =>
                fanbugDialogRef.current?.open({ streamId })
              }
              height={36}
              radius={8}
              fontSize={13}
              bgcolor="background.deepPink"
              color="text.white"
              sx={{
                px: 1.5,
                minWidth: "auto",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "background.deepMaroon" },
              }}
            />
          )}
          {isCreator ? (
            <CustomButton
              title={ending ? "Ending..." : "End live"}
              handleClickBtn={handleEndStream}
              disabled={ending}
              loading={ending}
              height={36}
              radius={8}
              fontSize={13}
              bgcolor="red"
              color="text.white"
              sx={{
                px: 1.5,
                minWidth: "auto",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "background.deepMaroon", opacity: 0.9 },
              }}
            />
          ) : (
            <CustomButton
              title="Leave"
              handleClickBtn={() => navigate("/live-streams")}
              variant="outlined"
              height={36}
              radius={8}
              fontSize={13}
              bgcolor="transparent"
              color="text.white"
              sx={{
                px: 1.5,
                minWidth: "auto",
                whiteSpace: "nowrap",
                borderColor: "text.halfWhite",
                "&:hover": {
                  borderColor: "primary.white",
                  bgcolor: "rgba(255,255,255,.08)",
                },
              }}
            />
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
          gridTemplateRows: { xs: "minmax(0, 58%) minmax(0, 42%)", md: "1fr" },
        }}
      >
        <LiveKitRoom
          token={connection.token}
          serverUrl={connection.serverUrl}
          connect
          video={isPublisher}
          audio={isPublisher}
          onError={(error) => toast.error(error.message)}
          style={{ minWidth: 0, minHeight: 0 }}
        >
          <VideoStage
            isPublisher={isPublisher}
            participantIds={publisherIds}
            participantsMeta={participantsMeta}
            socket={socket}
            streamId={streamId}
          />
        </LiveKitRoom>

        <Box
          bgcolor="primary.white"
          display="flex"
          flexDirection="column"
          minHeight={0}
          borderLeft={{ md: "1px solid" }}
          borderColor={{ md: "neutral.Charcoal" }}
        >
          <Box
            px={2}
            py={1.5}
            borderBottom="1px solid"
            borderColor="background.lightGray"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Typography fontWeight={700} color="text.darkBrown">
              Live comments
            </Typography>
            {isCreator && (stream.fanbugCount || 0) > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Gem size={14} color="#FF1572" />
                <Typography fontSize={12} color="text.deepPink" fontWeight={700}>
                  {(Number(stream.fanbugTotalCents || 0) / 100).toFixed(2)} ·{" "}
                  {stream.fanbugCount} Fan bucks
                </Typography>
              </Box>
            )}
          </Box>

          {fanbugComments.length > 0 && (
            <FanbugCarousel items={fanbugComments} />
          )}

          <Box
            flex={1}
            minHeight={0}
            overflow="auto"
            px={1.5}
            py={1.5}
            display="flex"
            flexDirection="column"
          >
            {comments.length === 0 ? (
              <Typography
                fontSize={13}
                color="text.neutralGrey"
                textAlign="center"
                mt="auto"
                mb="auto"
              >
                Be the first to comment.
              </Typography>
            ) : (
              <Box
                mt="auto"
                display="flex"
                flexDirection="column"
                gap={1.25}
              >
                {comments.map((item) => {
                  const isFanbug = item.type === "fanbug";
                  return (
                    <Box
                      key={item._id}
                      display="flex"
                      gap={1}
                      alignItems="flex-start"
                      sx={
                        isFanbug
                          ? {
                              bgcolor: "rgba(255, 21, 114, 0.08)",
                              border: "1px solid rgba(255, 21, 114, 0.25)",
                              borderRadius: "10px",
                              px: 1,
                              py: 1,
                            }
                          : undefined
                      }
                    >
                      <Avatar
                        src={getUserProfileImage(item.author)}
                        sx={{ width: 30, height: 30, fontSize: 11 }}
                      >
                        {getInitialName(item.author)}
                      </Avatar>
                      <Box minWidth={0} flex={1}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.75}
                          flexWrap="wrap"
                        >
                          <Typography
                            component="span"
                            fontSize={12}
                            fontWeight={700}
                            color="text.darkBrown"
                          >
                            {item.author?.username ||
                              getDisplayName(item.author)}
                          </Typography>
                          {isFanbug && (
                            <Box
                              display="inline-flex"
                              alignItems="center"
                              justifyContent="center"
                              width={22}
                              height={22}
                              borderRadius="6px"
                              bgcolor="background.deepPink"
                              color="text.white"
                              flexShrink={0}
                            >
                              <Gift size={13} />
                            </Box>
                          )}
                          <Typography
                            component="span"
                            fontSize={12}
                            lineHeight={1.35}
                            color={isFanbug ? "text.deepPink" : "inherit"}
                            fontWeight={isFanbug ? 700 : 400}
                            display="inline-flex"
                            alignItems="center"
                            gap={0.4}
                          >
                            {isFanbug && item.fanbugAmount != null ? (
                              <>
                                <Gem size={13} />
                                {Number(item.fanbugAmount).toFixed(2)} Fan bucks
                              </>
                            ) : (
                              item.content
                            )}
                          </Typography>
                        </Box>
                        {isFanbug && Boolean(item.fanbugMessage?.trim()) && (
                          <Typography
                            fontSize={12}
                            color="text.darkBrown"
                            mt={0.35}
                          >
                            {item.fanbugMessage}
                          </Typography>
                        )}
                        <Typography
                          fontSize={10}
                          color="text.neutralGrey"
                          mt={0.25}
                        >
                          {getShortTimeAgo(item.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <Box ref={commentsEndRef} />
              </Box>
            )}
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={0.75}
            p={1.25}
            borderTop="1px solid"
            borderColor="background.lightGray"
            flexShrink={0}
          >
            <AppInput
              size="small"
              placeholder="Write a comment..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={handleCommentKeyDown}
              disabled={sending}
              inputProps={{ maxLength: 300 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <IconButton
              onClick={handleSendComment}
              disabled={!comment.trim() || sending}
              sx={{
                bgcolor: "background.deepPink",
                color: "text.white",
                "&:hover": { bgcolor: "background.deepMaroon" },
                "&.Mui-disabled": {
                  bgcolor: "background.lightGray",
                  color: "text.neutralGrey",
                },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <FanbugDialog ref={fanbugDialogRef} onSuccess={handleFanbugSuccess} />
    </Box>
  );
};

export default LiveRoom;
