import {
    ControlBar,
    RoomAudioRenderer,
    useLocalParticipant,
    useTracks,
    VideoTrack
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Avatar, Box, Typography } from "@mui/material";
import { Track } from "livekit-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFullS3Url } from "../../utils/s3Helper";

// Min/max PIP size limits (px) — same limits apply on publisher and viewer side
const PIP_MIN_WIDTH = 90;
const PIP_MIN_HEIGHT = 60;
const PIP_MAX_WIDTH = 320;
const PIP_MAX_HEIGHT = 220;
const DEFAULT_PIP_WIDTH = 150;
const DEFAULT_PIP_HEIGHT = 100;

const PublisherCell = ({
  identity,
  name,
  initial,
  avatarUrl,
  cameraTrack,
  screenShareTrack,
  isLocal,
  socket,
  streamId,
  pipPos,
  pipSize,
  onLocalDrag,
  onRemoteMove,
  onLocalResize,
  onRemoteResize,
}) => {
  const containerRef = useRef(null);
  const pipRef = useRef(null);
  const dragState = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const resizeState = useRef({ resizing: false, startX: 0, startY: 0, startW: 0, startH: 0 });
  const lastEmitRef = useRef(0);
  const lastResizeEmitRef = useRef(0);

  const hasScreenShare = Boolean(screenShareTrack?.publication);
  const cameraPublished = Boolean(cameraTrack?.publication);
  const cameraMuted = Boolean(cameraTrack?.publication?.isMuted);
  const hasCamera = cameraPublished && !cameraMuted;

  const width = pipSize?.width ?? DEFAULT_PIP_WIDTH;
  const height = pipSize?.height ?? DEFAULT_PIP_HEIGHT;

  const handlePointerDown = useCallback(
    (e) => {
      if (!isLocal) return;
      const pipEl = pipRef.current;
      const containerEl = containerRef.current;
      if (!pipEl || !containerEl) return;

      const pipRect = pipEl.getBoundingClientRect();
      dragState.current = {
        dragging: true,
        offsetX: e.clientX - pipRect.left,
        offsetY: e.clientY - pipRect.top,
      };

      const handlePointerMove = (moveEvent) => {
        if (!dragState.current.dragging) return;
        const containerRect = containerEl.getBoundingClientRect();
        const pipW = pipRect.width;
        const pipH = pipRect.height;

        let newX =
          moveEvent.clientX - containerRect.left - dragState.current.offsetX;
        let newY =
          moveEvent.clientY - containerRect.top - dragState.current.offsetY;

        newX = Math.max(0, Math.min(newX, containerRect.width - pipW));
        newY = Math.max(0, Math.min(newY, containerRect.height - pipH));

        const xPct = newX / containerRect.width;
        const yPct = newY / containerRect.height;

        onLocalDrag(identity, { x: newX, y: newY });

        const now = Date.now();
        if (socket && streamId && now - lastEmitRef.current > 66) {
          lastEmitRef.current = now;
          socket.emit("livestream_pip_move", {
            streamId,
            participantId: identity,
            xPct,
            yPct,
          });
        }
      };

      const handlePointerUp = () => {
        dragState.current.dragging = false;
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [isLocal, socket, streamId, identity, onLocalDrag],
  );

  // --- Resize handle drag ---
  const handleResizePointerDown = useCallback(
    (e) => {
      if (!isLocal) return;
      e.stopPropagation(); 
      const containerEl = containerRef.current;
      if (!containerEl) return;

      resizeState.current = {
        resizing: true,
        startX: e.clientX,
        startY: e.clientY,
        startW: width,
        startH: height,
      };

      const handleResizeMove = (moveEvent) => {
        if (!resizeState.current.resizing) return;
        const containerRect = containerEl.getBoundingClientRect();

        const deltaX = moveEvent.clientX - resizeState.current.startX;
        const deltaY = moveEvent.clientY - resizeState.current.startY;

        let newW = resizeState.current.startW + deltaX;
        let newH = resizeState.current.startH + deltaY;

        newW = Math.max(PIP_MIN_WIDTH, Math.min(newW, PIP_MAX_WIDTH));
        newH = Math.max(PIP_MIN_HEIGHT, Math.min(newH, PIP_MAX_HEIGHT));

        // container se bahar na jaye
        newW = Math.min(newW, containerRect.width - 8);
        newH = Math.min(newH, containerRect.height - 8);

        const widthPct = newW / containerRect.width;
        const heightPct = newH / containerRect.height;

        onLocalResize(identity, { width: newW, height: newH });

        const now = Date.now();
        if (socket && streamId && now - lastResizeEmitRef.current > 66) {
          lastResizeEmitRef.current = now;
          socket.emit("livestream_pip_resize", {
            streamId,
            participantId: identity,
            widthPct,
            heightPct,
          });
        }
      };

      const handleResizeUp = () => {
        resizeState.current.resizing = false;
        window.removeEventListener("pointermove", handleResizeMove);
        window.removeEventListener("pointerup", handleResizeUp);
      };

      window.addEventListener("pointermove", handleResizeMove);
      window.addEventListener("pointerup", handleResizeUp);
    },
    [isLocal, socket, streamId, identity, width, height, onLocalResize],
  );

  // Viewer side: receive this participant's pip position
  useEffect(() => {
    if (!socket || isLocal) return;

    const handlePipMove = (payload) => {
      if (payload.streamId?.toString() !== streamId?.toString()) return;
      if (payload.participantId !== identity) return;
      const containerEl = containerRef.current;
      if (!containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      onRemoteMove(identity, {
        x: payload.xPct * rect.width,
        y: payload.yPct * rect.height,
      });
    };

    socket.on("livestream_pip_move", handlePipMove);
    return () => socket.off("livestream_pip_move", handlePipMove);
  }, [socket, streamId, isLocal, identity, onRemoteMove]);


  useEffect(() => {
    if (!socket || isLocal) return;

    const handlePipResize = (payload) => {
      if (payload.streamId?.toString() !== streamId?.toString()) return;
      if (payload.participantId !== identity) return;
      const containerEl = containerRef.current;
      if (!containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      onRemoteResize(identity, {
        width: payload.widthPct * rect.width,
        height: payload.heightPct * rect.height,
      });
    };

    socket.on("livestream_pip_resize", handlePipResize);
    return () => socket.off("livestream_pip_resize", handlePipResize);
  }, [socket, streamId, isLocal, identity, onRemoteResize]);

  const CameraOffAvatar = ({ size = 72 }) => (
    <Box
      height="100%"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="neutral.darkBlack"
    >
      <Avatar
        src={getFullS3Url(avatarUrl)}
        sx={{
          width: size,
          height: size,
          fontSize: size / 2.3,
          bgcolor: "neutral.Charcoal",
          color: "text.white",
          fontWeight: 700,
        }}
      >
        {initial}
      </Avatar>
    </Box>
  );

  const NameLabel = () => (
    <Box
      sx={{
        position: "absolute",
        bottom: 8,
        left: 8,
        px: 1,
        py: 0.25,
        bgcolor: "rgba(0,0,0,0.55)",
        borderRadius: "6px",
        zIndex: 3,
        maxWidth: "70%",
      }}
    >
      <Typography fontSize={11} fontWeight={600} color="text.white" noWrap>
        {name}
      </Typography>
    </Box>
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        bgcolor: "neutral.darkBlack",
      }}
    >
      {hasScreenShare ? (
        <VideoTrack
          trackRef={screenShareTrack}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : hasCamera ? (
        <VideoTrack
          trackRef={cameraTrack}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : cameraPublished !== undefined ? (
        <CameraOffAvatar />
      ) : (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="text.halfWhite"
          fontSize={13}
        >
          Waiting...
        </Box>
      )}

      {(hasScreenShare || cameraPublished) && <NameLabel />}

      {hasScreenShare && (
        <Box
          ref={pipRef}
          onPointerDown={isLocal ? handlePointerDown : undefined}
          sx={{
            position: "absolute",
            left: pipPos.x,
            top: pipPos.y ?? "auto",
            bottom: pipPos.y == null ? 12 : "auto",
            width,
            height,
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
            cursor: isLocal ? "grab" : "default",
            userSelect: "none",
            zIndex: 2,
            "&:active": { cursor: isLocal ? "grabbing" : "default" },
          }}
        >
          {hasCamera ? (
            <VideoTrack
              trackRef={cameraTrack}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
              }}
            />
          ) : (
            <CameraOffAvatar size={Math.min(width, height) * 0.5} />
          )}

          {isLocal && (
            <Box
              onPointerDown={handleResizePointerDown}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 18,
                height: 18,
                cursor: "nwse-resize",
                zIndex: 4,
                background:
                  "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.85) 50%)",
                borderBottomRightRadius: "8px",
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

const VideoStage = ({
  isPublisher,
  participantIds,
  participantsMeta = {},
  socket,
  streamId,
}) => {
  const { localParticipant } = useLocalParticipant();

  const allTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const cells = useMemo(() => {
    const ids = participantIds.filter(Boolean).map((id) => id.toString());
    const getSource = (t) => t.publication?.source || t.source;

    return ids
      .map((identity) => {
        const ownTracks = allTracks.filter(
          (t) => t.participant?.identity === identity,
        );
        const cameraTrack = ownTracks.find(
          (t) => getSource(t) === Track.Source.Camera,
        );
        const screenShareTrack = ownTracks.find(
          (t) => getSource(t) === Track.Source.ScreenShare,
        );
        return { identity, cameraTrack, screenShareTrack };
      })
      .filter(
        (cell) =>
          cell.cameraTrack?.participant || cell.screenShareTrack?.participant,
      );
  }, [allTracks, participantIds]);

  const [pipPositions, setPipPositions] = useState({});
  const [pipSizes, setPipSizes] = useState({});

  const getPipPos = (identity) => pipPositions[identity] ?? { x: 12, y: null };
  const getPipSize = (identity) =>
    pipSizes[identity] ?? { width: DEFAULT_PIP_WIDTH, height: DEFAULT_PIP_HEIGHT };

  const handleLocalDrag = useCallback((identity, pos) => {
    setPipPositions((prev) => ({ ...prev, [identity]: pos }));
  }, []);

  const handleRemoteMove = useCallback((identity, pos) => {
    setPipPositions((prev) => ({ ...prev, [identity]: pos }));
  }, []);

  const handleLocalResize = useCallback((identity, size) => {
    setPipSizes((prev) => ({ ...prev, [identity]: size }));
  }, []);

  const handleRemoteResize = useCallback((identity, size) => {
    setPipSizes((prev) => ({ ...prev, [identity]: size }));
  }, []);

  return (
    <Box
      data-lk-theme="default"
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "neutral.darkBlack",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {cells.length === 0 ? (
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="text.halfWhite"
          px={2}
          textAlign="center"
        >
          Waiting for host or co-host to go live...
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: "1px",
            bgcolor: "neutral.darkBlack",
          }}
        >
          {cells.map((cell) => {
            const meta = participantsMeta[cell.identity] || {};
            return (
              <Box
                key={cell.identity}
                sx={{ flex: 1, minWidth: 0, minHeight: 0 }}
              >
                <PublisherCell
                  identity={cell.identity}
                  name={meta.name || "Unknown"}
                  initial={meta.initial || "?"}
                  avatarUrl={meta.avatarUrl}
                  cameraTrack={cell.cameraTrack}
                  screenShareTrack={cell.screenShareTrack}
                  isLocal={localParticipant?.identity === cell.identity}
                  socket={socket}
                  streamId={streamId}
                  pipPos={getPipPos(cell.identity)}
                  pipSize={getPipSize(cell.identity)}
                  onLocalDrag={handleLocalDrag}
                  onRemoteMove={handleRemoteMove}
                  onLocalResize={handleLocalResize}
                  onRemoteResize={handleRemoteResize}
                />
              </Box>
            );
          })}
        </Box>
      )}

      {isPublisher && (
        <ControlBar
          controls={{ screenShare: true, chat: false, leave: false }}
        />
      )}
      <RoomAudioRenderer />
    </Box>
  );
};

export default VideoStage;