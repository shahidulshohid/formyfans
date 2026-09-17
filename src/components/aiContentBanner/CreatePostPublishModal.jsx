import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const CreatePostPublishModal = ({ open, onClose, creationData, onPostSuccess }) => {
  const navigate = useNavigate();
  const [thoughts, setThoughts] = useState("");

  useEffect(() => {
    if (open) {
      setThoughts("");
    }
  }, [open]);

  const handlePost = () => {
    console.log("Post submitted with content:", thoughts, creationData);
    if (onPostSuccess) {
      onPostSuccess({
        text: thoughts,
        ...creationData,
      });
    } else {
      onClose();
      navigate("/home", {
        state: {
          newAiPost: {
            text: thoughts,
            image: creationData?.imageUrl,
            script: creationData?.script,
            prompt: creationData?.prompt,
          },
        },
      });
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
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: "calc(100vw - 28px)", sm: "680px", md: "851px" },
          maxWidth: "851px",
          minHeight: { xs: "auto", md: "312px" },
          height: { xs: "auto", md: "312px" },
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
            placeholder="Tell your friends about your thoughts..."
            sx={{
              "& .MuiOutlinedInput-root": {
                width: { xs: "100%", md: "775px" },
                maxWidth: "775px",
                height: { xs: "140px", md: "159px" },
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

        {/* Post Button Action */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={handlePost}
            sx={{
              width: "99px",
              minWidth: "99px",
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
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Post
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostPublishModal;
