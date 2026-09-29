import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import CreatePostPublishModal from "../../../components/aiContentBanner/CreatePostPublishModal";
import Header from "../../../components/header";
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

const DEFAULT_SAMPLE_IMAGE = sampleAirplaneVideoThumb;

const getCssAspectRatio = (ratio) => {
  switch (ratio) {
    case "1:1":
      return "1 / 1";
    case "4:3":
      return "4 / 3";
    case "3:4":
      return "3 / 4";
    case "9:16":
      return "9 / 16";
    case "16:9":
    default:
      return "16 / 9";
  }
};

const AiImageReady = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creationData = location.state || {};

  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    creationData.mediaUrl || creationData.imageUrl || null
  );
  const [generationStatus, setGenerationStatus] = useState(
    creationData.status || (creationData.generationId ? "processing" : "completed")
  );
  const [progress, setProgress] = useState(creationData.progress || 5);
  const [statusMessage, setStatusMessage] = useState(
    creationData.message || "Your image is being created by AI. Please check back shortly."
  );
  const [downloading, setDownloading] = useState(false);

  // Subscribe to real-time AI socket events (ai:generation_progress, ai:generation_completed, ai:generation_failed)
  useEffect(() => {
    if (!creationData.generationId || imageUrl) return;

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
          setImageUrl(foundUrl);
        }
        setGenerationStatus("completed");
        setProgress(100);
        toast.success(data?.message || payload?.message || "Your AI image is ready!");
      },
      onFailed: (payload) => {
        const data = payload?.data || payload;
        setGenerationStatus("failed");
        toast.error(
          data?.message || payload?.message || "Image generation failed. Please try again."
        );
      },
    });

    return () => {
      unsubscribe();
    };
  }, [creationData.generationId, imageUrl]);

  // Poll GET /ai/generations/:generationId
  useEffect(() => {
    if (!creationData.generationId || imageUrl) return;

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

        // API returns mediaUrl on completion
        const foundUrl = extractAiMediaUrl(resBody) || data.mediaUrl || data.imageUrl;

        if (data.status === "completed" || foundUrl) {
          if (foundUrl) {
            setImageUrl(foundUrl);
          }
          setGenerationStatus("completed");
          setProgress(100);
          toast.success(resBody?.message || data.message || "Your AI image is ready!");
          if (intervalId) clearInterval(intervalId);
        } else if (data.status === "failed" || data.status === "error") {
          setGenerationStatus("failed");
          toast.error(data.message || "Image generation failed. Please try again.");
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Error polling generation status:", err);
      }
    };

    // Check immediately and poll every 3 seconds
    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [creationData.generationId, imageUrl]);

  const isProcessing = !imageUrl && generationStatus === "processing";
  const currentImage = imageUrl || DEFAULT_SAMPLE_IMAGE;

  const handleBack = () => {
    navigate(-1);
  };

  /**
   * Direct file download to user's local Downloads folder
   */
  const handleDownload = async () => {
    if (!currentImage) {
      toast.error("No image available to download.");
      return;
    }

    setDownloading(true);
    const fileName = `ai-image-${creationData.generationId || Date.now()}.jpg`;

    try {
      await downloadMedia(currentImage, fileName);
      toast.success("Image downloaded to your Downloads folder!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download image. Please try again.");
    } finally {
      setDownloading(false);
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
          maxWidth: "880px",
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
          {isProcessing ? "Your AI Image is Being Generated..." : "Your AI Image is Ready"}
        </Typography>

        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#737373",
            fontSize: { xs: "13px", sm: "14px" },
            fontWeight: 400,
            mb: { xs: 3, sm: 3.5 },
          }}
        >
          {isProcessing
            ? "Please wait a moment while AI processes and brings your visual to life."
            : "Review your generated content before publishing or downloading."}
        </Typography>

        {/* Image Preview Box */}
        <Box
          sx={{
            border: "1px solid #EDEDED",
            borderRadius: { xs: "12px", sm: "16px" },
            p: { xs: 2, sm: 3 },
            bgcolor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Main Image Container */}
          <Box
            sx={{
              width: "100%",
              maxWidth:
                creationData.aspectRatio === "9:16" || creationData.aspectRatio === "3:4"
                  ? "360px"
                  : creationData.aspectRatio === "1:1"
                  ? "440px"
                  : "520px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
              bgcolor: "#F9FAFB",
              aspectRatio: getCssAspectRatio(creationData.aspectRatio),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: isProcessing ? 3 : 0,
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
                }}
              >
                <CircularProgress size={44} sx={{ color: "#FF1572" }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#555555",
                  }}
                >
                  Generating image... {progress ? `(${progress}%)` : ""}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    color: "#9CA3AF",
                    textAlign: "center",
                  }}
                >
                  {statusMessage || "Your image is being created by AI. Please hold on."}
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={currentImage}
                alt="AI Generated"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </Box>

          {/* Action Buttons */}
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
            <Button
              variant="outlined"
              onClick={handleDownload}
              disabled={downloading || isProcessing}
              startIcon={
                downloading ? (
                  <CircularProgress size={16} sx={{ color: "#FF1572" }} />
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
                  transform: downloading || isProcessing ? "none" : "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  color: "#9CA3AF",
                  borderColor: "#E5E7EB",
                  bgcolor: "#FAFAFA",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {downloading ? "Downloading..." : "Download"}
            </Button>

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
          imageUrl: currentImage,
        }}
      />
    </Box>
  );
};

export default AiImageReady;
