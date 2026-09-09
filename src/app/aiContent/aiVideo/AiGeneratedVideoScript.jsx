import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScriptIconSrc from "../../../assets/images/aiPowerContent/scriptIcon.png";
import EditIconSrc from "../../../assets/images/aiPowerContent/editIcon.png";
import ArrowIconSrc from "../../../assets/images/aiPowerContent/arrowIcon.png";

const defaultScript = `Okay, I have been sleeping on this and I cannot believe I waited so long to try it.
This HydroGlow Serum has completely changed my morning routine. The hyaluronic acid complex actually penetrates — you can feel it — and within two weeks my skin looked more plump and hydrated than it has in years. It's fragrance-free, absorbs instantly, and works under makeup without pilling. Link in bio.
They have a starter kit right now that's honestly a steal. Your skin will thank you.`;

const sampleRegeneratedScripts = [
  `Okay, I have been sleeping on this and I cannot believe I waited so long to try it.
This HydroGlow Serum has completely changed my morning routine. The hyaluronic acid complex actually penetrates — you can feel it — and within two weeks my skin looked more plump and hydrated than it has in years. It's fragrance-free, absorbs instantly, and works under makeup without pilling. Link in bio.
They have a starter kit right now that's honestly a steal. Your skin will thank you.`,
  `Stop scrolling if you want glass skin! I finally tried this viral HydroGlow Serum and the hype is 100% real.
My dry skin felt instantly rejuvenated and bouncy from day one. Packed with pure hyaluronic acid that deeply absorbs without any stickiness. Check the link in my bio to grab their limited-time starter kit!`,
  `Here is my honest review on the product everyone is talking about: HydroGlow Serum.
Within just 10 days, my skin texture noticeably smoothed out and gained that natural radiant glow. It is lightweight, non-greasy, and layers flawlessly under makeup. Highly recommend getting the starter pack before it sells out!`,
];

const AiGeneratedVideoScript = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creationData = location.state || {};

  const [scriptText, setScriptText] = useState(defaultScript);
  const [isEditing, setIsEditing] = useState(false);
  const [regenIndex, setRegenIndex] = useState(0);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRegenerate = () => {
    const nextIndex = (regenIndex + 1) % sampleRegeneratedScripts.length;
    setRegenIndex(nextIndex);
    setScriptText(sampleRegeneratedScripts[nextIndex]);
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleGenerateVideo = () => {
    navigate("/ai-video-ready", {
      state: {
        ...creationData,
        script: scriptText,
      },
    });
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
            AI Generated Script for Video
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
              endIcon={
                <Box
                  component="img"
                  src={ScriptIconSrc}
                  alt="Regenerate"
                  sx={{
                    width: { xs: 15, sm: 18 },
                    height: { xs: 15, sm: 18 },
                    objectFit: "contain",
                  }}
                />
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
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Regenerate Script
            </Button>

            {/* Edit Script Button */}
            <Button
              variant="contained"
              onClick={handleToggleEdit}
              endIcon={
                <Box
                  component="img"
                  src={EditIconSrc}
                  alt="Edit"
                  sx={{
                    width: { xs: 14, sm: 16 },
                    height: { xs: 14, sm: 16 },
                    objectFit: "contain",
                  }}
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
                  transform: "translateY(-1px)",
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
            endIcon={
              <Box
                component="img"
                src={ArrowIconSrc}
                alt="Generate Video"
                sx={{ width: 18, height: 18, objectFit: "contain" }}
              />
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
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Generate Video
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AiGeneratedVideoScript;
