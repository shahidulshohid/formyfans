import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import Header from "../../../components/header";
import {
  arrowIcon,
  editIcon,
  scriptIcon,
} from "../../../assets/aiAssets";
import { refineAiPrompt } from "../../../api/aiContent/prompts";
import { createAiGeneration } from "../../../api/aiContent/generations";
import { connectAiSocket } from "../../../api/aiContent/aiSocket";

const AiGeneratedVideoEditScript = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creationData = location.state || {};

  useEffect(() => {
    connectAiSocket();
  }, []);

  // Modification prompt state (uses refinedPrompt generated from previous step)
  const initialModScript =
    creationData.refinedPrompt ||
    creationData.videoModificationPrompt ||
    creationData.prompt ||
    creationData.originalPrompt ||
    "";

  const [scriptText, setScriptText] = useState(initialModScript);
  const [isEditing, setIsEditing] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  // Regenerate video modification script using refine prompt API
  const handleRegenerate = async () => {
    const rawPrompt =
      creationData.originalPrompt || creationData.prompt || scriptText.trim();

    if (!rawPrompt) {
      toast.error("No prompt available to regenerate.");
      return;
    }

    setRegenLoading(true);
    try {
      const validRes = creationData.resolution === "480p" ? "480p" : "720p";
      const validDuration = [5, 10, 15].includes(Number(creationData.duration))
        ? Number(creationData.duration)
        : 5;

      const payload = {
        type: "VIDEO_EDIT",
        prompt: rawPrompt,
        style: creationData.style || "Cinematic Color Grade",
        settings: {
          resolution: validRes,
          aspectRatio: creationData.aspectRatio || "16:9",
          duration: validDuration,
        },
      };

      const response = await refineAiPrompt(payload);
      const resBody = response?.data;

      if (resBody?.status === "success" && resBody?.data) {
        const newRefined =
          resBody.data.refinedPrompt || resBody.data.originalPrompt || rawPrompt;
        setScriptText(newRefined);
        setIsEditing(false);
        toast.success(resBody.message || "Modification script regenerated successfully!");
      } else {
        toast.error(resBody?.message || "Failed to regenerate script.");
      }
    } catch (error) {
      console.error("Error regenerating modification script:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while regenerating the script.";
      toast.error(errorMsg);
    } finally {
      setRegenLoading(false);
    }
  };

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  // Trigger POST /ai/generations with type: "VIDEO_EDIT"
  const handleGenerateVideo = async () => {
    const finalModScript = scriptText.trim();

    const videoRefKey = creationData.videoReference || creationData.videoReferenceKey;
    if (!videoRefKey) {
      toast.error("Please add the video you want to edit.");
      return;
    }

    setGenerateLoading(true);

    const basePrompt =
      creationData.originalPrompt || creationData.prompt || finalModScript;

    const validRes = creationData.resolution === "480p" ? "480p" : "720p";
    const validDuration = [5, 10, 15].includes(Number(creationData.duration))
      ? Number(creationData.duration)
      : 5;

    const payload = {
      type: "VIDEO_EDIT",
      prompt: basePrompt,
      videoModificationPrompt: finalModScript,
      resolution: validRes,
      aspectRatio: creationData.aspectRatio || "16:9",
      duration: validDuration,
      audio: creationData.audio !== undefined ? Boolean(creationData.audio) : true,
    };

    if (videoRefKey) {
      payload.videoReference = videoRefKey;
    }
    if (creationData.imageReference || creationData.imageReferenceKey) {
      payload.imageReference =
        creationData.imageReference || creationData.imageReferenceKey;
    }

    try {
      const response = await createAiGeneration(payload);
      const resBody = response?.data;
      const isOk =
        (response?.status >= 200 && response?.status < 300) ||
        resBody?.status === "success";

      const genData = resBody?.data || resBody;

      if (isOk && (genData?.generationId || resBody?.status === "success")) {
        toast.success(
          resBody?.message || "AI video_edit generation started. Status is processing."
        );

        navigate("/ai-video-edit-ready", {
          state: {
            ...creationData,
            type: "VIDEO_EDIT",
            generationId: genData?.generationId,
            contentId: genData?.contentId,
            generationData: genData,
            status: genData?.status || "processing",
            progress: genData?.progress !== undefined ? genData.progress : 5,
            reservedCredits: genData?.reservedCredits || 6,
            message:
              genData?.message ||
              "Your edited video is being created by AI. Please check back shortly.",
            estimatedWaitSeconds: genData?.estimatedWaitSeconds || 65,
            prompt: genData?.prompt || basePrompt,
            videoModificationPrompt: finalModScript,
            videoReference: payload.videoReference,
            imageReference: payload.imageReference,
            resolution: creationData.resolution || "720p",
            aspectRatio: creationData.aspectRatio || "16:9",
            duration: creationData.duration || "5",
            audio: payload.audio,
            videoUrl:
              genData?.videoUrl || genData?.outputUrl || genData?.mediaUrl || null,
          },
        });
      } else {
        const errorMsg =
          resBody?.message || "Failed to start AI video edit generation. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error creating AI video edit generation:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while starting video edit generation.";
      toast.error(errorMsg);
    } finally {
      setGenerateLoading(false);
    }
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
          Your AI Video Edit Instructions
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
          Review and refine how AI will modify your video with the provided reference assets.
        </Typography>

        {/* AI Generated Script Label */}
        <Box sx={{ mb: { xs: 3, sm: 3.5 } }}>
          <Typography
            component="label"
            sx={{
              display: "block",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: { xs: "14px", sm: "15px", md: "16px" },
              lineHeight: "20px",
              letterSpacing: "-0.5px",
              color: "#000000",
              mb: 1.2,
            }}
          >
            Video Modification Instructions
            <Box
              component="span"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: { xs: "14px", sm: "16px" },
                lineHeight: "20px",
                color: "#FF1572",
                ml: 0.4,
              }}
            >
              *
            </Box>
          </Typography>

          {/* Script Content Area */}
          <Box
            sx={{
              width: "100%",
              height: { xs: "auto", sm: "240px" },
              minHeight: { xs: "190px", sm: "240px" },
              borderRadius: "12px",
              border: "1px solid #B3B3B3",
              bgcolor: "#FFFFFF",
              p: { xs: 2, sm: "20px 24px" },
              boxSizing: "border-box",
              overflowY: "auto",
              transition: "border-color 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#888888",
              },
            }}
          >
            {isEditing ? (
              <TextField
                multiline
                fullWidth
                variant="standard"
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: { xs: "14px", sm: "15px" },
                    lineHeight: "160%",
                    letterSpacing: "0px",
                    color: "#000000",
                    p: 0,
                  },
                }}
              />
            ) : (
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: { xs: "14px", sm: "15px" },
                  lineHeight: "160%",
                  letterSpacing: "0px",
                  color: "#000000",
                  whiteSpace: "pre-line",
                }}
              >
                {scriptText}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Action Buttons Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1.5, sm: 2 },
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {/* Left Action Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {/* Regenerate Script Button */}
            <Button
              variant="contained"
              onClick={handleRegenerate}
              disabled={regenLoading || generateLoading}
              endIcon={
                regenLoading ? (
                  <CircularProgress size={14} sx={{ color: "#FFFFFF" }} />
                ) : (
                  <Box
                    component="img"
                    src={scriptIcon}
                    alt="Regenerate"
                    sx={{ width: 16, height: 16, objectFit: "contain" }}
                  />
                )
              }
              sx={{
                bgcolor: "#FF1572",
                color: "#FFFFFF",
                borderRadius: "53px",
                height: "44px",
                px: { xs: "10px", sm: "18px", md: "20px" },
                py: "10px",
                gap: { xs: "4px", sm: "8px" },
                fontSize: { xs: "11px", sm: "13px", md: "14px" },
                fontWeight: 600,
                textTransform: "none",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
                whiteSpace: "nowrap",
                flex: { xs: 1, sm: "none" },
                minWidth: 0,
                "& .MuiButton-endIcon": {
                  ml: { xs: "4px", sm: "8px" },
                  mr: 0,
                },
                "&:hover": {
                  bgcolor: "#FF1572",
                  boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                  transform: regenLoading || generateLoading ? "none" : "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {regenLoading ? "Regenerating..." : "Regenerate Script"}
            </Button>

            {/* Edit Script Button */}
            <Button
              variant="contained"
              onClick={handleToggleEdit}
              disabled={regenLoading || generateLoading}
              endIcon={
                <Box
                  component="img"
                  src={editIcon}
                  alt="Edit"
                  sx={{ width: 14, height: 14, objectFit: "contain" }}
                />
              }
              sx={{
                bgcolor: "#1E6BFF",
                color: "#FFFFFF",
                borderRadius: "53px",
                height: "44px",
                px: { xs: "10px", sm: "18px", md: "20px" },
                py: "10px",
                gap: { xs: "4px", sm: "8px" },
                fontSize: { xs: "11px", sm: "13px", md: "14px" },
                fontWeight: 600,
                textTransform: "none",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
                whiteSpace: "nowrap",
                flex: { xs: 1, sm: "none" },
                minWidth: 0,
                "& .MuiButton-endIcon": {
                  ml: { xs: "4px", sm: "8px" },
                  mr: 0,
                },
                "&:hover": {
                  bgcolor: "#1558D6",
                  boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                  transform: regenLoading || generateLoading ? "none" : "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {isEditing ? "Save Script" : "Edit Script"}
            </Button>
          </Box>

          {/* Right Action Button: Generate Video */}
          <Button
            variant="contained"
            onClick={handleGenerateVideo}
            disabled={generateLoading || regenLoading}
            endIcon={
              generateLoading ? (
                <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
              ) : (
                <Box
                  component="img"
                  src={arrowIcon}
                  alt="Generate Video"
                  sx={{ width: 16, height: 16, objectFit: "contain" }}
                />
              )
            }
            sx={{
              bgcolor: "#FF1572",
              color: "#FFFFFF",
              borderRadius: "53px",
              height: "44px",
              px: { xs: "18px", sm: "24px" },
              py: "10px",
              gap: "8px",
              fontSize: { xs: "13px", sm: "15px" },
              fontWeight: 600,
              textTransform: "none",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
              whiteSpace: "nowrap",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                bgcolor: "#FF1572",
                boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                transform: generateLoading || regenLoading ? "none" : "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {generateLoading ? "Generating Video..." : "Generate Video"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AiGeneratedVideoEditScript;
