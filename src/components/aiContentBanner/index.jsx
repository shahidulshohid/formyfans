import { useState } from "react";
import AddToPhotosOutlinedIcon from "@mui/icons-material/AddToPhotosOutlined";
import { Box, Button, Typography } from "@mui/material";
import AiSubscriptionModal from "./AiSubscriptionModal";
import SelectAiContentTypeModal from "./SelectAiContentTypeModal";
import CreateAiImageModal from "./CreateAiImageModal";
import AiGeneratedScriptModal from "./AiGeneratedScriptModal";

const AiContentBanner = () => {
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [openContentTypeModal, setOpenContentTypeModal] = useState(false);
  const [openCreateImageModal, setOpenCreateImageModal] = useState(false);
  const [openScriptModal, setOpenScriptModal] = useState(false);
  const [creationData, setCreationData] = useState(null);
  const subscriptions = true;

  const handleCreateClick = () => {
    if (!subscriptions) {
      setOpenSubscriptionModal(true);
    } else {
      setOpenContentTypeModal(true);
    }
  };

  const handleContentTypeSelect = (item) => {
    if (item.id === "image") {
      setOpenContentTypeModal(false);
      setOpenCreateImageModal(true);
    }
  };

  const handleContinueToScript = (data) => {
    setCreationData(data);
    setOpenCreateImageModal(false);
    setOpenScriptModal(true);
  };

  const handleGenerateFinalImage = (data) => {
    console.log("Generate Image Data:", { ...creationData, ...data });
    setOpenScriptModal(false);
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "#FF15721A",
          border: "1.5px solid #FF15721A",
          borderRadius: "16px",
          px: { xs: 2.5, sm: 3 },
          py: { xs: 1.5, sm: 1.75 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          boxShadow: "0 2px 10px rgba(255, 20, 117, 0.06)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 14px rgba(255, 20, 117, 0.12)",
            borderColor: "#F7A8CE",
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: "#FF1572",
              fontWeight: 700,
              fontSize: { xs: "14px", sm: "16px" },
              lineHeight: 1.25,
              letterSpacing: "-0.2px",
            }}
          >
            AI–Powered Content
          </Typography>
          <Typography
            sx={{
              color: "#484848",
              fontWeight: 500,
              fontSize: { xs: "12px", sm: "13px" },
              lineHeight: 1.3,
              mt: 0.4,
            }}
          >
            Turn your product idea into a ready-to-use UGC video.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddToPhotosOutlinedIcon sx={{ fontSize: "18px !important" }} />}
          onClick={handleCreateClick}
          sx={{
            bgcolor: "#FF1572",
            color: "#ffffff",
            borderRadius: "53px",
            px: { xs: 2, sm: 2.8 },
            py: { xs: 0.8, sm: 1 },
            fontSize: { xs: "13px", sm: "15px" },
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": {
              bgcolor: "#FF1572",
              boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          Create
        </Button>
      </Box>

      {/* AI Subscription Modal (when subscriptions is false) */}
      <AiSubscriptionModal
        open={openSubscriptionModal}
        onClose={() => setOpenSubscriptionModal(false)}
      />

      {/* Select AI Content Type Modal (when subscriptions is true) */}
      <SelectAiContentTypeModal
        open={openContentTypeModal}
        onClose={() => setOpenContentTypeModal(false)}
        onSelect={handleContentTypeSelect}
      />

      {/* Create AI Image Modal (when AI Image is clicked) */}
      <CreateAiImageModal
        open={openCreateImageModal}
        onClose={() => setOpenCreateImageModal(false)}
        onBack={() => {
          setOpenCreateImageModal(false);
          setOpenContentTypeModal(true);
        }}
        onContinue={handleContinueToScript}
      />

      {/* AI Generated Script Modal (when Continue Script is clicked) */}
      <AiGeneratedScriptModal
        open={openScriptModal}
        onClose={() => setOpenScriptModal(false)}
        onBack={() => {
          setOpenScriptModal(false);
          setOpenCreateImageModal(true);
        }}
        onGenerateImage={handleGenerateFinalImage}
        initialPrompt={creationData?.prompt || ""}
      />
    </>
  );
};

export default AiContentBanner;



