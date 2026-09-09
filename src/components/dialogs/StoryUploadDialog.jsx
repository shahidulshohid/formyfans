import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { createStory } from "../../api/modules/story";
import { uploadMediaService } from "../../utils/helper";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";

export const StoryUploadDialog = ({ open, onClose, onUploaded }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const resetUploadState = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleClose = () => {
    if (isUploading) return;
    onClose?.();
    resetUploadState();
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isAllowedType =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isAllowedType) {
      toast.error("Only image or video files are allowed.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadStory = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo or video first.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFile = await uploadMediaService(selectedFile);
      if (!uploadedFile?.url) {
        toast.error("Story upload failed. Please try again.");
        return;
      }

      const payload = {
        media: uploadedFile.url,
        mediaType: selectedFile.type.startsWith("video/") ? "video" : "image",
      };

      const response = await createStory(payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Story uploaded successfully.");
        onUploaded?.({
          mediaUrl: uploadedFile.url,
          mediaType: payload.mediaType,
        });
        handleClose();
      } else {
        toast.error(response.data.message || "Story upload failed.");
      }
    } catch (error) {
      toast.error(error?.message || "Story upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DialogBox open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogHeader title="Upload Story" onClose={handleClose} />
      <DialogContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <Button
          onClick={handlePickFile}
          fullWidth
          sx={{
            mt: 0.5,
            mb: 2,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "rgba(255, 21, 114, 0.12)",
            color: "#5E1321",
            "&:hover": {
              bgcolor: "rgba(255, 21, 114, 0.2)",
            },
          }}
        >
          Choose Photo or Video
        </Button>

        {previewUrl ? (
          selectedFile?.type?.startsWith("video/") ? (
            <Box
              component="video"
              src={previewUrl}
              controls
              sx={{ width: "100%", borderRadius: "12px", maxHeight: 300 }}
            />
          ) : (
            <Box
              component="img"
              src={previewUrl}
              alt="Story preview"
              sx={{
                width: "100%",
                borderRadius: "12px",
                maxHeight: 300,
                objectFit: "cover",
              }}
            />
          )
        ) : (
          <Typography fontSize={13} color="text.secondary" textAlign="center">
            Select a photo or video to preview before upload.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={handleClose}
          disabled={isUploading}
          sx={{ textTransform: "none", color: "#5E1321" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUploadStory}
          disabled={!selectedFile || isUploading}
          sx={{
            textTransform: "none",
            bgcolor: "#FF1572",
            "&:hover": { bgcolor: "#E0115F" },
          }}
        >
          {isUploading ? "Uploading..." : "Upload Story"}
        </Button>
      </DialogActions>
    </DialogBox>
  );
};
