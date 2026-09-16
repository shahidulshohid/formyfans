import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { createStory } from "../../api/modules/story";
import { uploadMediaService } from "../../utils/helper";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";
import { DealPickerDialog } from "./DealPickerDialog";
import { CollaborativeDealPicker } from "../collaborativedealpicker";
import { useS3Upload } from "../../hook/s3Upload";  
export const StoryUploadDialog = ({ open, onClose, onUploaded }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadFile, uploading: s3Uploading } = useS3Upload();
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [storyType, setStoryType] = useState("own");
  const [dealPickerOpen, setDealPickerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const resetUploadState = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setStoryType("own");
    setSelectedDeal(null);
  };

  const handleClose = () => {
    if (isUploading) return;
    onClose?.();
    resetUploadState();
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleStoryTypeChange = (event) => {
    const value = event.target.value;
    setStoryType(value);
    if (value === "own") {
      setSelectedDeal(null);
    }
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
    if (storyType === "collaborative" && !selectedDeal) {
      toast.error("Please select a deal for collaborative story.");
      return;
    }
    setIsUploading(true);
    try {
      const result = await uploadFile(selectedFile, "media");
      if (!result.success) {
        toast.error("Story upload failed. Please try again.");
        return;
      }
      const fileName = result.data.fileName;
      const payload = {
        media: fileName,
        mediaType: selectedFile.type.startsWith("video/") ? "video" : "image",
        ...(storyType === "collaborative" && selectedDeal
          ? { dealId: selectedDeal._id }
          : {}),
      };
  
      const response = await createStory(payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Story uploaded successfully.");
        onUploaded?.({
          mediaUrl: fileName,
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
      <DialogHeader
        title="Upload Story"
        onClose={handleClose}
        icon={<AutoStoriesOutlinedIcon fontSize="small" />}
      />
      <DialogContent
      py={2}
        sx={{
          pt: 1,
          background:
            "linear-gradient(180deg, rgba(251, 244, 247, 0.9) 0%, #ffffff 55%)",
        }}
      >
        <Box py={2}>
        <FormControl component="fieldset" sx={{ width: "100%", mb: 2 }}>
          <RadioGroup
            row
            value={storyType}
            onChange={handleStoryTypeChange}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              p: 0.5,
              borderRadius: "14px",
              bgcolor: "colors.lavenderBlush",
              border: "1px solid",
              borderColor: "secondary.light",
              "& .MuiFormControlLabel-root": {
                m: 0,
                borderRadius: "10px",
                px: 0.5,
                py: 0.4,
                justifyContent: "center",
                transition: "background-color 160ms ease, box-shadow 160ms ease",
                "& .MuiFormControlLabel-label": {
                  fontSize: 13,
                  fontWeight: 600,
                  color: "primary.main",
                },
              },
              "& .MuiFormControlLabel-root:has(.Mui-checked)": {
                bgcolor: "colors.white",
                boxShadow: "0 2px 8px rgba(94, 19, 33, 0.08)",
                "& .MuiFormControlLabel-label": {
                  color: "secondary.main",
                },
              },
            }}
          >
            <FormControlLabel
              value="own"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "secondary.light",
                    "&.Mui-checked": { color: "secondary.main" },
                  }}
                />
              }
              label="Own Story"
            />
            <FormControlLabel
              value="collaborative"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: "secondary.light",
                    "&.Mui-checked": { color: "secondary.main" },
                  }}
                />
              }
              label="Collaborative"
            />
          </RadioGroup>
        </FormControl>
        </Box>

        {storyType === "collaborative" && (
          <Box sx={{ mb: 2 }}>
            <CollaborativeDealPicker
              deal={selectedDeal}
              onOpenPicker={() => setDealPickerOpen(true)}
            />
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <Box
          onClick={handlePickFile}
          sx={{
            mb: 2,
            borderRadius: "16px",
            border: "1.5px dashed",
            borderColor: previewUrl ? "secondary.main" : "secondary.light",
            bgcolor: previewUrl ? "rgba(255, 45, 120, 0.04)" : "colors.lightPink",
            px: 2,
            py: previewUrl ? 1.5 : 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            cursor: "pointer",
            transition: "border-color 160ms ease, background-color 160ms ease",
            "&:hover": {
              borderColor: "secondary.main",
              bgcolor: "rgba(255, 45, 120, 0.06)",
            },
          }}
        >
          {!previewUrl && (
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255, 45, 120, 0.12)",
                color: "secondary.main",
                mb: 0.5,
              }}
            >
              <AddPhotoAlternateOutlinedIcon />
            </Box>
          )}

          {previewUrl ? (
            selectedFile?.type?.startsWith("video/") ? (
              <Box
                component="video"
                src={previewUrl}
                controls
                onClick={(e) => e.stopPropagation()}
                sx={{
                  width: "100%",
                  maxHeight: 280,
                  borderRadius: "12px",
                  objectFit: "cover",
                  bgcolor: "colors.candyBlack",
                }}
              />
            ) : (
              <Box
                component="img"
                src={previewUrl}
                alt="Story preview"
                sx={{
                  width: "100%",
                  maxHeight: 280,
                  borderRadius: "12px",
                  objectFit: "cover",
                }}
              />
            )
          ) : (
            <>
              <Typography
                fontSize={14}
                fontWeight={700}
                color="primary.main"
                textAlign="center"
              >
                Choose Photo or Video
              </Typography>
              <Typography
                fontSize={12}
                color="colors.mauveTaupe"
                textAlign="center"
                sx={{ maxWidth: 220 }}
              >
                Pick a moment to share as your story status.
              </Typography>
            </>
          )}

          {previewUrl && (
            <Typography
              fontSize={12}
              fontWeight={600}
              color="secondary.main"
              sx={{ mt: 0.5 }}
            >
              Tap to change media
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1,
          gap: 1,
          borderTop: "1px solid",
          borderColor: "rgba(245, 192, 211, 0.7)",
          bgcolor: "colors.white",
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isUploading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "primary.main",
            borderRadius: "12px",
            px: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUploadStory}
          disabled={
            !selectedFile ||
            isUploading ||
            (storyType === "collaborative" && !selectedDeal)
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "12px",
            px: 2.5,
            bgcolor: "secondary.main",
            boxShadow: "0 8px 18px rgba(255, 45, 120, 0.28)",
            "&:hover": {
              bgcolor: "background.deepPink",
              boxShadow: "0 10px 22px rgba(255, 21, 114, 0.32)",
            },
            "&.Mui-disabled": {
              bgcolor: "rgba(255, 45, 120, 0.35)",
              color: "colors.white",
            },
          }}
        >
          {isUploading ? "Uploading..." : "Upload Story"}
        </Button>
      </DialogActions>

      <DealPickerDialog
        open={dealPickerOpen}
        contentType="story"
        onClose={() => setDealPickerOpen(false)}
        onSelect={(deal) => {
          setSelectedDeal(deal);
          setDealPickerOpen(false);
        }}
      />
    </DialogBox>
  );
};
