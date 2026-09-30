import React, { useState } from "react";
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

const AiGeneratedScript = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creationData = location.state || {};

  // Always use the user's prompt or refined prompt (never fall back to unrelated hardcoded script)
  const initialPrompt =
    creationData.refinedPrompt ||
    creationData.prompt ||
    creationData.originalPrompt ||
    "A stunning high-resolution cinematic portrait with professional studio lighting, realistic textures, and vibrant depth.";

  const [scriptText, setScriptText] = useState(initialPrompt);
  const [isEditing, setIsEditing] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRegenerate = async () => {
    const rawPrompt =
      creationData.originalPrompt || creationData.prompt || scriptText;

    if (!rawPrompt) {
      toast.error("No prompt available to regenerate.");
      return;
    }

    setRegenLoading(true);
    try {
      const payload = {
        type: (creationData.type || "IMAGE").toUpperCase(),
        prompt: rawPrompt,
        style: creationData.style || "Cinematic, Photorealistic",
        settings: {
          resolution: creationData.resolution || "720p",
          aspectRatio: creationData.aspectRatio || "16:9",
        },
      };

      const response = await refineAiPrompt(payload);
      const resBody = response?.data;

      if (resBody?.status === "success" && resBody?.data) {
        const newRefined =
          resBody.data.refinedPrompt || resBody.data.originalPrompt || rawPrompt;
        setScriptText(newRefined);
        setIsEditing(false);
        toast.success(resBody.message || "Script regenerated successfully!");
      } else {
        toast.error(resBody?.message || "Failed to regenerate script.");
      }
    } catch (error) {
      console.error("Error regenerating script:", error);
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

  // Call POST /ai/generations
  const handleGenerateImage = async () => {
    const finalPrompt = scriptText.trim();
    if (!finalPrompt) {
      toast.error("Please enter or generate a script prompt first.");
      return;
    }

    setGenerateLoading(true);

    const payload = {
      type: "IMAGE",
      prompt: finalPrompt,
      resolution: creationData.resolution || "720p",
      aspectRatio: creationData.aspectRatio || "16:9",
    };

    try {
      const response = await createAiGeneration(payload);
      const resBody = response?.data;

      if (resBody?.status === "success" && resBody?.data) {
        const genData = resBody.data;
        toast.success(resBody.message || "AI image generation started. Status is processing.");

        navigate("/ai-image-ready", {
          state: {
            ...creationData,
            script: finalPrompt,
            refinedPrompt: finalPrompt,
            generationId: genData.generationId,
            contentId: genData.contentId,
            generationData: genData,
            status: genData.status,
            progress: genData.progress,
            reservedCredits: genData.reservedCredits || 1,
            creditsDeducted: genData.creditsDeducted || null,
            prompt: genData.prompt || finalPrompt,
            resolution: creationData.resolution || "720p",
            aspectRatio: creationData.aspectRatio || "16:9",
            imageUrl: genData.imageUrl || genData.outputUrl || null,
          },
        });
      } else {
        const errorMsg =
          resBody?.message || "Failed to start AI image generation. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error creating AI image generation:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while starting image generation.";
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
          Your AI-generated script
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
          We use this to create a script that feels authentic and converts.
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
            AI Generated Script for Image
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
              height: { xs: "auto", sm: "224px" },
              minHeight: { xs: "180px", sm: "224px" },
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
                    fontSize: { xs: "14px", sm: "16px" },
                    lineHeight: "150%",
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
                  fontSize: { xs: "14px", sm: "16px" },
                  lineHeight: "150%",
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

          {/* Right Action Button: Generate Image */}
          <Button
            variant="contained"
            onClick={handleGenerateImage}
            disabled={generateLoading || regenLoading}
            endIcon={
              generateLoading ? (
                <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
              ) : (
                <Box
                  component="img"
                  src={arrowIcon}
                  alt="Generate Image"
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
            {generateLoading ? "Generating Image..." : "Generate Image"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AiGeneratedScript;
