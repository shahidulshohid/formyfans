import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreatePostPublishModal from "../../../components/aiContentBanner/CreatePostPublishModal";
import Header from "../../../components/header";
import { toast } from "react-toastify";
import {
  downloadIcon,
  publishIcon,
  sampleAirplaneVideoThumb,
} from "../../../assets/aiAssets";
import { getAiGenerationStatus } from "../../../api/aiContent/generations";
import {
  subscribeToAiGeneration,
  extractAiMediaUrl,
} from "../../../api/aiContent/aiSocket";
import { downloadMedia } from "../../../api/aiContent/downloadMedia";

const DEFAULT_SAMPLE_VIDEO_THUMB = sampleAirplaneVideoThumb;

const AiVideoReady = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creationData = location.state || {};

  const playerContainerRef = useRef(null);
  const videoRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [videoUrl, setVideoUrl] = useState(
    creationData.mediaUrl || creationData.videoUrl || null
  );
  const [generationStatus, setGenerationStatus] = useState(
    creationData.status || (creationData.generationId ? "processing" : "completed")
  );
  const [progress, setProgress] = useState(creationData.progress || 5);
  const [statusMessage, setStatusMessage] = useState(
    creationData.message || "Your edited video is being created by AI. Please check back shortly."
  );

  // Subscribe to real-time AI socket events
  useEffect(() => {
    if (!creationData.generationId || videoUrl) return;

    const unsubscribe = subscribeToAiGeneration(creationData.generationId, {
      onProgress: (payload) => {
        const data = payload?.data || payload;
        if (data?.status) setGenerationStatus(data.status);
        if (data?.progress !== undefined) setProgress(data.progress);
        if (data?.message) setStatusMessage(data.message);
      },
      onCompleted: (payload) => {
        const data = payload?.data || payload;
        const foundUrl = extractAiMediaUrl(payload);

        if (foundUrl) {
          setVideoUrl(foundUrl);
        }
        setGenerationStatus("completed");
        setProgress(100);
        toast.success(data?.message || "Your AI video is ready!");
      },
      onError: (err) => {
        setGenerationStatus("failed");
        toast.error(err?.message || "Video generation failed. Please try again.");
      },
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [creationData.generationId, videoUrl]);

  // Poll GET /ai/generations/:generationId
  useEffect(() => {
    if (!creationData.generationId || videoUrl) return;

    let intervalId = null;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await getAiGenerationStatus(creationData.generationId);
        const resBody = res?.data;
        const data = resBody?.data || resBody;

        if (!isMounted || !data) return;

        if (data.status) setGenerationStatus(data.status);
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.message) setStatusMessage(data.message);

        const foundUrl =
          extractAiMediaUrl(resBody) || data.mediaUrl || data.videoUrl || data.outputUrl;

        if (data.status === "completed" || foundUrl) {
          if (foundUrl) {
            setVideoUrl(foundUrl);
          }
          setGenerationStatus("completed");
          setProgress(100);
          toast.success(resBody?.message || data.message || "Your AI video is ready!");
          if (intervalId) clearInterval(intervalId);
        } else if (data.status === "failed" || data.status === "error") {
          setGenerationStatus("failed");
          toast.error(data.message || "Video generation failed. Please try again.");
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Error polling video generation status:", err);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [creationData.generationId, videoUrl]);

  // Handle Fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const isProcessing = !videoUrl && generationStatus === "processing";
  const currentMedia = videoUrl || DEFAULT_SAMPLE_VIDEO_THUMB;
  const isDirectVideo =
    Boolean(videoUrl) ||
    (typeof currentMedia === "string" &&
      !currentMedia.endsWith(".jpg") &&
      !currentMedia.endsWith(".jpeg") &&
      !currentMedia.endsWith(".png") &&
      !currentMedia.endsWith(".webp") &&
      (currentMedia.endsWith(".mp4") ||
        currentMedia.endsWith(".webm") ||
        currentMedia.endsWith(".mov") ||
        currentMedia.startsWith("blob:") ||
        currentMedia.startsWith("data:video")));

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = async () => {
    if (!currentMedia) {
      toast.error("No video available to download.");
      return;
    }

    try {
      setIsDownloading(true);
      const isVid = Boolean(
        videoUrl ||
        isDirectVideo ||
        (typeof currentMedia === "string" &&
          (currentMedia.includes(".mp4") ||
            currentMedia.includes(".webm") ||
            currentMedia.includes("video")))
      );
      const ext = isVid ? "mp4" : "jpg";
      const fileName = `formyfans-video-${creationData.generationId || Date.now()}.${ext}`;

      const success = await downloadMedia(currentMedia, fileName);
      if (success) {
        toast.success("Download started!");
      }
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download video. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePublishAndPost = () => {
    setOpenPublishModal(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFFFFF", pb: 8 }}>
      <Header />
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "920px",
          px: { xs: 2.5, sm: 4 },
          pt: { xs: 3, sm: 5, md: 6 },
        }}
      >
        {/* Back Button */}
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: "18px", color: "#000000" }} />}
            onClick={handleBack}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#000000",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "140%",
              letterSpacing: "-0.5px",
              textTransform: "none",
              p: 0,
              minWidth: "auto",
              "&:hover": {
                bgcolor: "transparent",
                color: "#FF1572",
                "& .MuiSvgIcon-root": {
                  color: "#FF1572",
                },
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Back
          </Button>
        </Box>

        {/* Title & Subtitle */}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#FF1572",
            fontSize: { xs: "22px", sm: "26px", md: "28px" },
            lineHeight: "36px",
            letterSpacing: "-1px",
            mb: 0.6,
          }}
        >
          {isProcessing ? "Your AI Video is Being Generated..." : "Your Video is Ready"}
        </Typography>

        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#737373",
            fontSize: { xs: "13px", sm: "14px" },
            fontWeight: 400,
            mb: { xs: 3, sm: 4 },
          }}
        >
          {isProcessing
            ? "Please wait a moment while AI processes and renders your video."
            : "Your AI-generated video is ready. Preview it with full audio and zoom controls, or download it directly."}
        </Typography>

        {/* Central Video Preview Card Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            mt: { xs: 1, sm: 2 },
          }}
        >
          {/* Video Player Card */}
          <Box
            ref={playerContainerRef}
            sx={{
              width: { xs: "100%", sm: "420px", md: "520px" },
              maxWidth: "520px",
              aspectRatio: isFullscreen ? "auto" : "16 / 9",
              minHeight: { xs: "280px", sm: "320px", md: "360px" },
              borderRadius: isFullscreen ? "0px" : "16px",
              overflow: "hidden",
              boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15)",
              bgcolor: "#000000",
              border: isFullscreen ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isProcessing ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  p: 3,
                  textAlign: "center",
                }}
              >
                <CircularProgress size={52} sx={{ color: "#FF1572" }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#FFFFFF",
                  }}
                >
                  Generating video... {progress ? `(${progress}%)` : ""}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.7)",
                    lineHeight: 1.4,
                    maxWidth: "380px",
                  }}
                >
                  {statusMessage || "Your video is being created by AI. Please hold on."}
                </Typography>
              </Box>
            ) : (
              <>
                {/* Video Media Element with Native HTML5 Controls & Native Three-Dot Menu */}
                {isDirectVideo ? (
                  <Box
                    component="video"
                    ref={videoRef}
                    src={currentMedia}
                    controls
                    playsInline
                    loop
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      bgcolor: "#000000",
                      display: "block",
                      borderRadius: isFullscreen ? "0px" : "16px",
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={currentMedia}
                    alt="AI Video Preview"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: isFullscreen ? "0px" : "16px",
                    }}
                  />
                )}
              </>
            )}
          </Box>

          {/* Action Buttons: Download & Publish */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 1.5, sm: 2 },
              mt: { xs: 3, sm: 3.5 },
              width: { xs: "100%", sm: "auto" },
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            {/* Download Button */}
            {/* <Button
              variant="outlined"
              onClick={handleDownload}
              disabled={isProcessing || isDownloading}
              startIcon={
                isDownloading ? (
                  <CircularProgress size={18} sx={{ color: "#FF1572" }} />
                ) : (
                  <Box
                    component="img"
                    src={downloadIcon}
                    alt="Download"
                    sx={{ width: 18, height: 18, objectFit: "contain" }}
                  />
                )
              }
              sx={{
                bgcolor: "#FFFFFF",
                color: "#FF1572",
                borderColor: "#FFD1E3",
                borderWidth: "1px",
                borderRadius: "53px",
                height: "44px",
                px: { xs: "20px", sm: "24px" },
                py: "10px",
                fontSize: { xs: "13px", sm: "14px" },
                fontWeight: 600,
                textTransform: "none",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
                whiteSpace: "nowrap",
                flex: { xs: 1, sm: "none" },
                minWidth: { xs: "130px", sm: "140px" },
                "&:hover": {
                  borderColor: "#FF1572",
                  bgcolor: "#FFF5F8",
                  transform: isProcessing || isDownloading ? "none" : "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  color: "#9CA3AF",
                  borderColor: "#E5E7EB",
                  bgcolor: "#FAFAFA",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {isDownloading ? "Downloading..." : "Download Video"}
            </Button> */}

            {/* Publish & Post Button */}
            <Button
              variant="contained"
              onClick={handlePublishAndPost}
              disabled={isProcessing}
              startIcon={
                <Box
                  component="img"
                  src={publishIcon}
                  alt="Publish & Post"
                  sx={{ width: 18, height: 18, objectFit: "contain" }}
                />
              }
              sx={{
                bgcolor: "#FF1572",
                color: "#FFFFFF",
                borderRadius: "53px",
                height: "44px",
                px: { xs: "20px", sm: "24px" },
                py: "10px",
                fontSize: { xs: "13px", sm: "14px" },
                fontWeight: 600,
                textTransform: "none",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
                whiteSpace: "nowrap",
                flex: { xs: 1, sm: "none" },
                minWidth: { xs: "140px", sm: "155px" },
                "&:hover": {
                  bgcolor: "#FF1572",
                  boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                  transform: isProcessing ? "none" : "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  bgcolor: "#E5E7EB",
                  color: "#9CA3AF",
                  boxShadow: "none",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Publish & Post
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Create Post & Publish Modal */}
      <CreatePostPublishModal
        open={openPublishModal}
        onClose={() => setOpenPublishModal(false)}
        creationData={{
          ...creationData,
          mediaUrl: currentMedia,
          videoUrl: currentMedia,
        }}
      />
    </Box>
  );
};

export default AiVideoReady;
