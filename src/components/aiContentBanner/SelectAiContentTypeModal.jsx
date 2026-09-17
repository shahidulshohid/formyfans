import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  aiImage,
  aiVideo,
  aiVideoEdit,
} from "../../assets/aiAssets";

const contentTypes = [
  {
    id: "image",
    title: "AI Image",
    icon: aiImage,
  },
  {
    id: "video",
    title: "AI Video",
    icon: aiVideo,
  },
  {
    id: "video_edit",
    title: "AI Video Edit",
    icon: aiVideoEdit,
  },
];

const SelectAiContentTypeModal = ({ open, onClose, onSelect }) => {
  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: "calc(100vw - 28px)", sm: "600px", md: "747px" },
          maxWidth: "747px",
          minHeight: { xs: "auto", md: "280px" },
          height: { xs: "auto", md: "280px" },
          borderRadius: { xs: "16px", md: "16px" },
          p: { xs: "24px 12px 20px 12px", sm: "32px 20px", md: "36px 32px" },
          position: "relative",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
          m: { xs: 1.5, sm: 2 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        aria-label="close"
        size="small"
        sx={{
          position: "absolute",
          right: { xs: 10, sm: 18, md: 24 },
          top: { xs: 10, sm: 18, md: 24 },
          color: "#000000",
          p: { xs: 0.5, sm: 1 },
          "&:hover": {
            bgcolor: "#F3F4F6",
          },
        }}
      >
        <CloseIcon sx={{ fontSize: { xs: "20px", sm: "22px", md: "24px" } }} />
      </IconButton>

      <DialogContent
        sx={{
          p: 0,
          overflow: "visible",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#000000",
            fontSize: { xs: "17px", sm: "20px", md: "24px" },
            lineHeight: { xs: "24px", sm: "30px", md: "36px" },
            letterSpacing: { xs: "-0.5px", md: "-1px" },
            textAlign: "center",
            px: { xs: 4, sm: 2, md: 0 },
            mb: { xs: 2.5, sm: 3.5, md: 4 },
          }}
        >
          Select AI Content Type
        </Typography>

        {/* Content Options */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1, sm: 2, md: 3 },
            width: "100%",
          }}
        >
          {contentTypes.map((item) => (
            <Box
              key={item.id}
              onClick={() => handleSelect(item)}
              sx={{
                width: { xs: "86px", sm: "115px", md: "138px" },
                height: { xs: "80px", sm: "96px", md: "112px" },
                borderRadius: { xs: "12px", sm: "15px" },
                border: "1px solid rgba(0, 0, 0, 0.2)",
                bgcolor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 0.8, sm: 1, md: 1.2 },
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                userSelect: "none",
                flexShrink: 0,
                "&:hover": {
                  borderColor: "#FF1572",
                  bgcolor: "#FFF7FA",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(255, 21, 114, 0.12)",
                  "& .card-icon": {
                    filter:
                      "brightness(0) saturate(100%) invert(20%) sepia(91%) saturate(4156%) hue-rotate(327deg) brightness(101%) contrast(105%)",
                  },
                  "& .card-text": {
                    color: "#FF1572",
                  },
                },
              }}
            >
              {item.icon && (
                <Box
                  component="img"
                  className="card-icon"
                  src={item.icon}
                  alt={item.title}
                  sx={{
                    width: { xs: 24, sm: 28, md: 32 },
                    height: { xs: 24, sm: 28, md: 32 },
                    objectFit: "contain",
                    transition: "filter 0.2s ease-in-out",
                  }}
                />
              )}
              <Typography
                className="card-text"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "10px", sm: "12px" },
                  fontWeight: 500,
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  color: "#000000",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s ease-in-out",
                }}
              >
                {item.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SelectAiContentTypeModal;

