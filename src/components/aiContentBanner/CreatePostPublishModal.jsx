import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createPost } from "../../api/modules/post";

const CreatePostPublishModal = ({
  open,
  onClose,
  creationData,
  onPostSuccess,
}) => {
  const navigate = useNavigate();
  const [thoughts, setThoughts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setThoughts("");
      setIsSubmitting(false);
    }
  }, [open]);

  // Extract media details from creationData
  const mediaUrl =
    creationData?.mediaUrl ||
    creationData?.imageUrl ||
    creationData?.videoUrl ||
    creationData?.outputUrl ||
    creationData?.url ||
    "";

  const isVideo =
    creationData?.type === "video" ||
    creationData?.type === "VIDEO" ||
    creationData?.type === "video_edit" ||
    creationData?.type === "VIDEO_EDIT" ||
    Boolean(creationData?.videoUrl && !creationData?.imageUrl) ||
    (typeof mediaUrl === "string" &&
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(mediaUrl));

  const mediaType = isVideo ? "video" : "image";

  const mediaList = mediaUrl
    ? [
        {
          url: mediaUrl,
          mediaType: mediaType,
          ...(creationData?.publicId && { publicId: creationData.publicId }),
        },
      ]
    : [];

  const handlePost = async () => {
    if (isSubmitting) return;

    if (!thoughts.trim() && mediaList.length === 0) {
      toast.error("Please enter a caption or attach media to post.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      caption: thoughts.trim(),
      media: mediaList,
    };

    try {
      const response = await createPost(payload);
      const resData = response?.data;
      const isSuccess =
        response?.status === 200 ||
        response?.status === 201 ||
        resData?.status === "success";

      if (isSuccess) {
        toast.success(resData?.message || "Post created successfully");
        if (onPostSuccess) {
          onPostSuccess(resData?.post || resData?.data || resData);
        }
        onClose();
        navigate("/home");
      } else {
        toast.error(resData?.message || "Failed to create post");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred while creating the post.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth={false}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: "calc(100vw - 28px)", sm: "680px", md: "851px" },
          maxWidth: "851px",
          borderRadius: "16px",
          p: { xs: "20px 16px", sm: "24px 38px" },
          position: "relative",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
          m: { xs: 1.5, sm: 2 },
          boxSizing: "border-box",
          bgcolor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      {/* Header: Title and Close button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#000000",
            fontSize: { xs: "17px", sm: "19px", md: "20px" },
            lineHeight: "28px",
            letterSpacing: "-0.5px",
          }}
        >
          Create Post & Publish
        </Typography>

        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="close"
          size="small"
          sx={{
            color: "#000000",
            p: 0.5,
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: "20px", sm: "22px" } }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: "visible" }}>
        {/* Thoughts Input / Textarea */}
        <Box sx={{ mb: 2 }}>
          <TextField
            multiline
            fullWidth
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            disabled={isSubmitting}
            placeholder="Tell your friends about your thoughts..."
            sx={{
              "& .MuiOutlinedInput-root": {
                width: "100%",
                height: { xs: "130px", md: "150px" },
                borderRadius: "16px",
                bgcolor: "#F9F9F9",
                fontSize: { xs: "13px", sm: "14px" },
                fontFamily: "Inter, sans-serif",
                color: "#333333",
                alignItems: "flex-start",
                p: { xs: 1.5, sm: 2 },
                "& fieldset": {
                  borderColor: "#E5E7EB",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "#CBD5E1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF1572",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputBase-input": {
                fontFamily: "Inter, sans-serif",
                lineHeight: "1.5",
                height: "100% !important",
                overflow: "auto !important",
              },
              "& .MuiInputBase-input::placeholder, & textarea::placeholder": {
                color: "#9E9E9E",
                opacity: 1,
                fontSize: { xs: "13px", sm: "14px" },
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
              },
            }}
          />
        </Box>

        {/* Attached AI Media Preview Indicator */}
        {mediaUrl && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.2,
              mb: 2,
              borderRadius: "12px",
              bgcolor: "#FFF0F5",
              border: "1px solid #FFD1E3",
            }}
          >
            {isVideo ? (
              <Box
                component="video"
                src={mediaUrl}
                muted
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "8px",
                  objectFit: "cover",
                  bgcolor: "#000000",
                }}
              />
            ) : (
              <Box
                component="img"
                src={mediaUrl}
                alt="Media Preview"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AutoAwesomeIcon sx={{ fontSize: 15, color: "#FF1572" }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    color: "#111827",
                  }}
                >
                  AI Generated {isVideo ? "Video" : "Image"} Attached
                </Typography>
              </Box>
              <Typography
                noWrap
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#6B7280",
                }}
              >
                {creationData?.prompt || "Ready to publish to your feed"}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Action Buttons: Cancel and Post */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
          }}
        >
          <Button
            variant="text"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: "#6B7280",
              fontWeight: 500,
              fontSize: "14px",
              textTransform: "none",
              fontFamily: "Inter, sans-serif",
              "&:hover": {
                bgcolor: "#F3F4F6",
                color: "#111827",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handlePost}
            disabled={isSubmitting}
            sx={{
              width: "100px",
              minWidth: "100px",
              height: "41px",
              borderRadius: "12px",
              bgcolor: "#FF1572",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
              p: 0,
              "&:hover": {
                bgcolor: "#FF1572",
                boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                transform: isSubmitting ? "none" : "translateY(-1px)",
              },
              "&.Mui-disabled": {
                bgcolor: "#FF8AB8",
                color: "#FFFFFF",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
            ) : (
              "Post"
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostPublishModal;
