import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import DownloadIconSrc from "../../../assets/images/aiPowerContent/downloadIcon.png";
import PublishIconSrc from "../../../assets/images/aiPowerContent/publishIcon.png";
import sampleAirplaneVideoThumb from "../../../assets/images/aiPowerContent/sampleAirplaneVideoThumb.jpg";
import CreatePostPublishModal from "../../../components/aiContentBanner/CreatePostPublishModal";

const AiVideoEditReady = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creationData = location.state || {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [openPublishModal, setOpenPublishModal] = useState(false);

  const currentMedia = creationData.videoUrl || creationData.imageUrl || sampleAirplaneVideoThumb;

  const handleBack = () => {
    navigate(-1);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentMedia;
    link.download = "ai-edited-video.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePublishAndPost = () => {
    setOpenPublishModal(true);
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
          Your Video is Ready
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
          Your AI-generated image is ready to preview. Review it, make changes, or generate a new version.
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
          {/* Video Preview Card */}
          <Box
            sx={{
              width: { xs: "100%", sm: "360px", md: "380px" },
              maxWidth: "400px",
              height: { xs: "420px", sm: "490px", md: "520px" },
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.12)",
              bgcolor: "#000000",
              border: "1px solid #E5E7EB",
              position: "relative",
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.16)",
              },
            }}
            onClick={handleTogglePlay}
          >
            {/* Background Media */}
            <Box
              component="img"
              src={currentMedia}
              alt="AI Video Preview"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Central Play / Pause Button */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <IconButton
                sx={{
                  width: { xs: 46, sm: 54 },
                  height: { xs: 46, sm: 54 },
                  bgcolor: "rgba(0, 0, 0, 0.55)",
                  color: "#FFFFFF",
                  backdropFilter: "blur(4px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.75)",
                    transform: "scale(1.08)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {isPlaying ? (
                  <PauseRoundedIcon sx={{ fontSize: { xs: 26, sm: 32 } }} />
                ) : (
                  <PlayArrowRoundedIcon sx={{ fontSize: { xs: 28, sm: 34 }, ml: "3px" }} />
                )}
              </IconButton>
            </Box>

            {/* Bottom Caption Overlay Banner */}
            <Box
              sx={{
                position: "absolute",
                bottom: 14,
                left: 14,
                right: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.8,
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: "rgba(20, 20, 20, 0.7)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "16px",
                  p: "10px 14px",
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "9.5px", sm: "10.5px" },
                    lineHeight: 1.35,
                    fontWeight: 400,
                    color: "rgba(255, 255, 255, 0.92)",
                    textAlign: "center",
                  }}
                >
                  A brand new window just swung open, letting in fresh hope, warm light, and endless possibilities. Breathe it in. This month invites you to see life differently, dream boldly, and step into joy like sunshine through glass.{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                    Happy New Month
                  </Box>
                </Typography>
              </Box>

              {/* Sub-credit watermark */}
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "9px",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.6)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                zozodesign
              </Typography>
            </Box>
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
            <Button
              variant="outlined"
              onClick={handleDownload}
              startIcon={
                <Box
                  component="img"
                  src={DownloadIconSrc}
                  alt="Download"
                  sx={{ width: 18, height: 18, objectFit: "contain" }}
                />
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
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Download
            </Button>

            {/* Publish & Post Button */}
            <Button
              variant="contained"
              onClick={handlePublishAndPost}
              startIcon={
                <Box
                  component="img"
                  src={PublishIconSrc}
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
                  transform: "translateY(-1px)",
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
        }}
      />
    </Box>
  );
};

export default AiVideoEditReady;
