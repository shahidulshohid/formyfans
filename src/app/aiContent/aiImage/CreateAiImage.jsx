import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import Header from "../../../components/header";
import { arrowIcon } from "../../../assets/aiAssets";
import { refineAiPrompt } from "../../../api/aiContent/prompts";
import { connectAiSocket } from "../../../api/aiContent/aiSocket";

const resolutions = [
  { id: "480p", label: "480p" },
  { id: "720p", label: "720p" },
  { id: "1080p", label: "1080p" },
];

const aspectRatios = [
  { id: "1:1", label: "1 : 1" },
  { id: "4:3", label: "4 : 3" },
  { id: "3:4", label: "3 : 4" },
  { id: "16:9", label: "16 : 9" },
  { id: "9:16", label: "9 : 16" },
];

const CreateAiImage = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic, Photorealistic");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");
  const [loading, setLoading] = useState(false);

  // Connect AI Socket on page render (http://46.202.130.209:18081)
  useEffect(() => {
    connectAiSocket();
  }, []);

  // Call /ai/prompts/refine API
  const handleContinue = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate your image.");
      return;
    }

    // Ensure socket is active
    connectAiSocket();

    setLoading(true);

    const appliedStyle = style.trim() || "Cinematic, Photorealistic";

    const payload = {
      type: "IMAGE",
      prompt: prompt.trim(),
      style: appliedStyle,
      settings: {
        resolution: selectedResolution,
        aspectRatio: selectedAspectRatio,
      },
    };

    try {
      const response = await refineAiPrompt(payload);
      const resBody = response?.data;

      if (resBody?.status === "success" && resBody?.data) {
        const refineData = resBody.data;
        toast.success(resBody.message || "Prompt refined successfully!");

        navigate("/ai-generated-script", {
          state: {
            type: "image",
            prompt: prompt.trim(),
            refinedPrompt: refineData.refinedPrompt || prompt.trim(),
            originalPrompt: refineData.originalPrompt || prompt.trim(),
            promptId: refineData.promptId,
            style: refineData.style || appliedStyle,
            resolution: selectedResolution,
            aspectRatio: selectedAspectRatio,
            refineData,
          },
        });
      } else {
        const errorMsg = resBody?.message || "Failed to refine prompt. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error refining prompt:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while refining the prompt.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
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
          Create Images with AI
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
          Describe your idea and let AI bring it to life.
        </Typography>

        {/* Image Generation Prompt Input */}
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
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
            Image Generation Prompt
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

          <TextField
            multiline
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="Describe the image you want to generate, including the subject, style, background, and mood..."
            sx={{
              "& .MuiOutlinedInput-root": {
                height: { xs: "120px", sm: "130px" },
                borderRadius: "12px",
                bgcolor: "#FFFFFF",
                fontSize: { xs: "13px", sm: "14px" },
                fontFamily: "Inter, sans-serif",
                color: "#333333",
                alignItems: "flex-start",
                p: { xs: 1.5, sm: 2 },
                "& fieldset": {
                  borderColor: "#B3B3B3",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "#888888",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF1572",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputBase-input": {
                height: "100% !important",
                overflow: "auto !important",
                fontFamily: "Inter, sans-serif",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#9CA3AF",
                opacity: 1,
                fontSize: { xs: "12px", sm: "14px" },
              },
            }}
          />
        </Box>

        {/* Style Section */}
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
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
            Style
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

          <TextField
            fullWidth
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={loading}
            placeholder="e.g. Cinematic, Photorealistic"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: { xs: "44px", sm: "48px" },
                borderRadius: "12px",
                bgcolor: "#FFFFFF",
                fontSize: { xs: "13px", sm: "14px" },
                fontFamily: "Inter, sans-serif",
                color: "#333333",
                "& fieldset": {
                  borderColor: "#B3B3B3",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "#888888",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF1572",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#9CA3AF",
                opacity: 1,
                fontSize: { xs: "12px", sm: "14px" },
              },
            }}
          />
        </Box>

        {/* Resolution Section */}
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
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
            Resolution
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: { xs: 1, sm: 1.8 },
            }}
          >
            {resolutions.map((item) => {
              const isSelected = selectedResolution === item.id;

              return (
                <Box
                  key={item.id}
                  onClick={() => !loading && setSelectedResolution(item.id)}
                  sx={{
                    bgcolor: isSelected ? "#FF1572" : "#EBECEF",
                    color: isSelected ? "#FFFFFF" : "#000000",
                    borderRadius: "12px",
                    py: { xs: 1.1, sm: 1.3 },
                    px: { xs: 1, sm: 2 },
                    textAlign: "center",
                    cursor: loading ? "default" : "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease-in-out",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "12px", sm: "14px", md: "15px" },
                    lineHeight: "140%",
                    letterSpacing: "-0.5px",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: isSelected ? "#FF1572" : "#DFE1E6",
                      transform: loading ? "none" : "translateY(-1px)",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Aspect Ratio Section */}
        <Box sx={{ mb: { xs: 3.5, sm: 4.5 } }}>
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
            Aspect Ratio
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(5, 1fr)" },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {aspectRatios.map((item) => {
              const isSelected = selectedAspectRatio === item.id;

              return (
                <Box
                  key={item.id}
                  onClick={() => !loading && setSelectedAspectRatio(item.id)}
                  sx={{
                    bgcolor: isSelected ? "#FF1572" : "#EBECEF",
                    color: isSelected ? "#FFFFFF" : "#000000",
                    borderRadius: "12px",
                    py: { xs: 1.1, sm: 1.3 },
                    px: { xs: 0.5, sm: 2 },
                    textAlign: "center",
                    cursor: loading ? "default" : "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease-in-out",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "12px", sm: "14px", md: "15px" },
                    lineHeight: "140%",
                    letterSpacing: "-0.5px",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: isSelected ? "#FF1572" : "#DFE1E6",
                      transform: loading ? "none" : "translateY(-1px)",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Continue Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={loading}
            endIcon={
              loading ? (
                <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
              ) : (
                <Box
                  component="img"
                  src={arrowIcon}
                  alt="Continue"
                  sx={{ width: 16, height: 16, objectFit: "contain" }}
                />
              )
            }
            sx={{
              bgcolor: "#FF1572",
              color: "#FFFFFF",
              borderRadius: "53px",
              height: "44px",
              px: "22px",
              py: "10px",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                bgcolor: "#FF1572",
                boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                transform: loading ? "none" : "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {loading ? "Refining Prompt..." : "Continue Script"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateAiImage;
