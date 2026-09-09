import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import sampleAiImage from "../../../assets/images/aiPowerContent/sampleAiImage.jpg";
import DownloadIconSrc from "/aiPowerContent/downloadIcon.png";
import PublishIconSrc from "/aiPowerContent/publishIcon.png";
import CreatePostPublishModal from "../../../components/aiContentBanner/CreatePostPublishModal";

const AiImageReady = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const creationData = location.state || {};

  const [openPublishModal, setOpenPublishModal] = useState(false);

  const currentImage = creationData.imageUrl || sampleAiImage;

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentImage;
    link.download = "ai-generated-image.jpg";
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
          Your Image is Ready
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

        {/* Central Image Card Container */}
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
          {/* Image Card */}
          <Box
            sx={{
              width: { xs: "100%", sm: "360px", md: "380px" },
              maxWidth: "400px",
              height: { xs: "380px", sm: "470px", md: "490px" },
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
              bgcolor: "#F8F9FA",
              border: "1px solid #EDEDED",
              position: "relative",
            }}
          >
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
          imageUrl: currentImage,
        }}
      />
    </Box>
  );
};

export default AiImageReady;
