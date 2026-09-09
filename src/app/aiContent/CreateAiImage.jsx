import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowIconSrc from "../../assets/images/aiPowerContent/arrowIcon.png";

const resolutions = [
  { id: "1024x1024", label: "1024 × 1024" },
  { id: "1536x1024", label: "1536 × 1024" },
  { id: "2048x2048", label: "2048 × 2048" },
];

const aspectRatios = [
  { id: "1:1", label: "1 : 1" },
  { id: "16:9", label: "16 : 9" },
  { id: "9:16", label: "9 : 16" },
  { id: "4:5", label: "4 : 5" },
];

const CreateAiImage = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [selectedResolution, setSelectedResolution] = useState("1536x1024");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");

  const handleContinue = () => {
    navigate("/ai-generated-script", {
      state: {
        prompt,
        resolution: selectedResolution,
        aspectRatio: selectedAspectRatio,
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFFFFF", pb: 8 }}>
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
              gridTemplateColumns: {
                xs: "repeat(3, 1fr)",
                sm: "repeat(3, 1fr)",
              },
              gap: { xs: 1, sm: 1.8 },
            }}
          >
            {resolutions.map((item) => {
              const isSelected = selectedResolution === item.id;

              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedResolution(item.id)}
                  sx={{
                    bgcolor: isSelected ? "#FF1572" : "#EBECEF",
                    color: isSelected ? "#FFFFFF" : "#000000",
                    borderRadius: "12px",
                    py: { xs: 1.1, sm: 1.3 },
                    px: { xs: 1, sm: 2 },
                    textAlign: "center",
                    cursor: "pointer",
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
                      transform: "translateY(-1px)",
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
              gridTemplateColumns: {
                xs: "repeat(4, 1fr)",
                sm: "repeat(4, 1fr)",
              },
              gap: { xs: 0.8, sm: 1.8 },
            }}
          >
            {aspectRatios.map((item) => {
              const isSelected = selectedAspectRatio === item.id;

              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedAspectRatio(item.id)}
                  sx={{
                    bgcolor: isSelected ? "#FF1572" : "#EBECEF",
                    color: isSelected ? "#FFFFFF" : "#000000",
                    borderRadius: "12px",
                    py: { xs: 1.1, sm: 1.3 },
                    px: { xs: 0.5, sm: 2 },
                    textAlign: "center",
                    cursor: "pointer",
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
                      transform: "translateY(-1px)",
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
            endIcon={
              <Box
                component="img"
                src={ArrowIconSrc}
                alt="Continue Script"
                sx={{ width: 18, height: 18, objectFit: "contain" }}
              />
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
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Continue Script
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateAiImage;
