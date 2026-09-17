import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "../../../components/header";
import { arrowIcon, uploadIcon } from "../../../assets/aiAssets";

const CreateAiVideoEdit = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);

  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleContinue = () => {
    navigate("/ai-video-edit-generated-script", {
      state: {
        type: "video_edit",
        videoFile: videoFile ? videoFile.name : null,
        imageFile: imageFile ? imageFile.name : null,
        prompt,
        audio: audioEnabled,
      },
    });
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
          AI Video Editor
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
          Edit, refine, and customize your AI-generated video with ease.
        </Typography>

        {/* Upload Boxes Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 2.5, sm: 2 },
            mb: { xs: 2.5, sm: 3.5 },
          }}
        >
          {/* Video Reference Upload */}
          <Box>
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
              Video Reference
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

            <input
              type="file"
              accept="video/*,image/*"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              style={{ display: "none" }}
            />

            <Box
              onClick={() => videoInputRef.current?.click()}
              sx={{
                width: "100%",
                height: { xs: "145px", sm: "165px" },
                border: "1.5px dashed #CBD5E1",
                borderRadius: "14px",
                bgcolor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
                p: 2,
                boxSizing: "border-box",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "#FF1572",
                  bgcolor: "#FFF9FB",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                component="img"
                src={uploadIcon}
                alt="Upload"
                sx={{ width: 36, height: 36, objectFit: "contain" }}
              />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "12px", sm: "13px" },
                  fontWeight: 500,
                  color: "#262626",
                  textAlign: "center",
                }}
              >
                {videoFile ? videoFile.name : "Drop product image here or click to browse files"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "10px", sm: "11px" },
                  color: "#8C8C8C",
                  textAlign: "center",
                }}
              >
                JPG, PNG, WEBP · Max 10MB
              </Typography>
            </Box>
          </Box>

          {/* Image Reference Upload */}
          <Box>
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
              Image Reference
            </Typography>

            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <Box
              onClick={() => imageInputRef.current?.click()}
              sx={{
                width: "100%",
                height: { xs: "145px", sm: "165px" },
                border: "1.5px dashed #CBD5E1",
                borderRadius: "14px",
                bgcolor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
                p: 2,
                boxSizing: "border-box",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "#FF1572",
                  bgcolor: "#FFF9FB",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                component="img"
                src={uploadIcon}
                alt="Upload"
                sx={{ width: 36, height: 36, objectFit: "contain" }}
              />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "12px", sm: "13px" },
                  fontWeight: 500,
                  color: "#262626",
                  textAlign: "center",
                }}
              >
                {imageFile ? imageFile.name : "Click to browse image or photo"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#737373",
                  textAlign: "center",
                }}
              >
                PNG, JPG or WEBP (optional)
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Instructions / Prompt Section */}
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
            Editing Instructions / Prompt
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
            placeholder="Describe what edits or enhancements you want AI to make to your video, transitions, effects, pacing, etc..."
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

        {/* Audio Toggle & Continue Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2.5,
            width: "100%",
            mt: 4,
          }}
        >
          {/* Audio Switch */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: { xs: "14px", sm: "15px", md: "16px" },
                lineHeight: "20px",
                letterSpacing: "-0.5px",
                color: "#000000",
              }}
            >
              Enable AI Audio / Voiceover
            </Typography>

            <Switch
              checked={audioEnabled}
              onChange={(e) => setAudioEnabled(e.target.checked)}
              sx={{
                width: 44,
                height: 24,
                p: 0,
                "& .MuiSwitch-switchBase": {
                  p: "2px",
                  "&.Mui-checked": {
                    transform: "translateX(20px)",
                    color: "#FFFFFF",
                    "& + .MuiSwitch-track": {
                      bgcolor: "#FF1572",
                      opacity: 1,
                    },
                  },
                },
                "& .MuiSwitch-thumb": {
                  width: 20,
                  height: 20,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                },
                "& .MuiSwitch-track": {
                  borderRadius: 10,
                  bgcolor: "#E5E7EB",
                  opacity: 1,
                  boxSizing: "border-box",
                },
              }}
            />
          </Box>

          {/* Continue Script Button */}
          <Button
            variant="contained"
            onClick={handleContinue}
            endIcon={
              <Box
                component="img"
                src={arrowIcon}
                alt="Continue"
                sx={{ width: 16, height: 16, objectFit: "contain" }}
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

export default CreateAiVideoEdit;
