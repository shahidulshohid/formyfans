import React, { useState, useRef, useEffect } from "react";
import {
  DialogActionButtons,
  DialogBody,
  DialogBox,
  DialogHeader,
} from "../../components/dialogs";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import GalleryIcon from "../../assets/images/gallery-icon.png";
import VideoIcon from "../../assets/images/video-icon.png";
import LiveIcon from "../../assets/images/live-icon.png";
import StoryIcon from "../../assets/images/story-icon.png";
import { AppInput } from "../../components/input";
import { exclusiveContentValidation } from "../../utils/validation";
import { uploadMediaService } from "../../utils/helper";
import { toast } from "react-toastify";

const contentTypes = [
  { key: "photo", label: "Photo", icon: GalleryIcon },
  { key: "video", label: "Video", icon: VideoIcon },
  // { key: "live", label: "Live Stream", icon: LiveIcon },
  // { key: "story", label: "Story", icon: StoryIcon },
];

const initialFormData = { title: "", description: "", tag: "" };

const getAcceptForType = (type) => {
  if (type === "video") return "video/mp4,video/webm,video/quicktime";
  return "image/png,image/jpeg,image/webp";
};

const AddExclusiveContentDialog = ({
  open,
  onClose,
  onConfirm,
  editData = null,
  loading = false,
}) => {
  const [selectedType, setSelectedType] = useState("photo");
  const [formData, setFormData] = useState(initialFormData);

  const [media, setMedia] = useState(null);
  const [isMediaUploading, setIsMediaUploading] = useState(false);

  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setSelectedType(editData.selectedType || "photo");
      setFormData({
        title: editData.title || "",
        description: editData.description || "",
        tag: editData.tag || "",
      });
      setMedia(
        editData.image
          ? {
              url: editData.image,
              mediaType: editData.selectedType === "video" ? "video" : "image",
            }
          : null,
      );
    } else {
      setSelectedType("photo");
      setFormData(initialFormData);
      setMedia(null);
    }
    setErrors({});
    setIsMediaUploading(false);
  }, [open, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const handleFileSelect = async (file) => {
    if (!file) return;

    const isVideoType = selectedType === "video";

    if (isVideoType && !file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }
    if (!isVideoType && !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    try {
      setIsMediaUploading(true);
      const uploaded = await uploadMediaService(file);
      setMedia({
        url: uploaded?.url,
        mediaType: isVideoType ? "video" : "image",
      });
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    } catch (error) {
      toast.error(typeof error === "string" ? error : "File uploading failed.");
    } finally {
      setIsMediaUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
    e.target.value = "";
  };

  const handleTypeChange = (typeKey) => {
    setSelectedType(typeKey);
    setMedia(null);
  };

  const handleSave = () => {
    if (isMediaUploading) {
      toast.info("Please wait, media is still uploading...");
      return;
    }

    const payload = {
      selectedType,
      ...formData,
      image: media?.url || null,
      mediaType:
        media?.mediaType || (selectedType === "video" ? "video" : "image"),
    };
    const isValid = exclusiveContentValidation(payload, setErrors);
    if (!isValid) return;

    onConfirm?.(payload);
  };

  const isEditMode = Boolean(editData);
  const isVideoType = selectedType === "video";

  return (
    <DialogBox open={open} onClose={onClose}>
      <DialogHeader
        title={
          isEditMode ? "Edit Exclusive Content" : "Create New Exclusive Content"
        }
        onClose={onClose}
      />
      <DialogBody>
        <Box>
          <Typography color="secondary.main" fontWeight={500} mb={1.5}>
            1: Select Content Type
          </Typography>
          <Grid container spacing={1.5}>
            {contentTypes.map((type) => (
              <Grid item size={{ xs: 6, sm: 3 }} key={type.key}>
                <Box
                  onClick={() => handleTypeChange(type.key)}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  gap={1}
                  py={2}
                  borderRadius={2}
                  border="1px solid"
                  borderColor={
                    selectedType === type.key ? "#FF1572" : "grey.300"
                  }
                  bgcolor={selectedType === type.key ? "#FF15720F" : "#fff"}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#FF1572",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={type.icon}
                    alt={type.label}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography
                    fontSize={13}
                    fontWeight={500}
                    color={
                      selectedType === type.key ? "#FF1572" : "text.secondary"
                    }
                  >
                    {type.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {errors.selectedType && (
            <Typography color="error" fontSize={12} mt={0.5}>
              {errors.selectedType}
            </Typography>
          )}

          <Box mt={2}>
            <Typography color="secondary.main" fontWeight={500} mb={1.5}>
              2: Add {isVideoType ? "Video" : "Image"}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptForType(selectedType)}
              onChange={handleInputChange}
              style={{ display: "none" }}
            />
            <Box
              onClick={() => !isMediaUploading && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gap={1.5}
              width="100%"
              height={260}
              borderRadius={2}
              border="1px solid"
              borderColor={
                errors.image
                  ? "error.main"
                  : isDragActive
                    ? "#FF1572"
                    : "grey.300"
              }
              bgcolor="#fff"
              sx={{
                cursor: isMediaUploading ? "default" : "pointer",
                overflow: "hidden",
                transition: "border-color 0.2s",
                "&:hover": {
                  borderColor: isMediaUploading ? "grey.300" : "#FF1572",
                },
              }}
            >
              {isMediaUploading ? (
                <>
                  <CircularProgress size={28} />
                  <Typography fontSize={13} color="text.secondary">
                    Uploading...
                  </Typography>
                </>
              ) : media?.url ? (
                media.mediaType === "video" ? (
                  <Box
                    component="video"
                    src={media.url}
                    controls
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={media.url}
                    alt="Preview"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )
              ) : (
                <>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width={56}
                    height={56}
                    borderRadius={1.5}
                    bgcolor="#FF1572"
                  >
                    <ImageIcon sx={{ color: "#fff", fontSize: 28 }} />
                  </Box>
                  <Typography
                    fontSize={13}
                    color="text.secondary"
                    textAlign="center"
                  >
                    Drag & drop your {isVideoType ? "video" : "picture"} here
                    <br />
                  </Typography>
                </>
              )}
            </Box>
            {errors.image && (
              <Typography color="error" fontSize={12} mt={0.5}>
                {errors.image}
              </Typography>
            )}
          </Box>

          <Box mt={2}>
            <Typography color="secondary.main" fontWeight={500} mb={1.5}>
              3: Content Details
            </Typography>
            <Typography
              color="text.darkBrown"
              fontSize={"18px"}
              fontWeight={600}
            >
              Title
            </Typography>
            <Box mt={1} mb={2}>
              <AppInput
                placeholder="Enter a title for your Exclusive Content"
                value={formData.title}
                name="title"
                onChange={handleChange}
                variantStyles="profileSearch"
                type="text"
                error={Boolean(errors.title)}
                helperText={errors.title}
              />
            </Box>
            <Typography
              color="text.darkBrown"
              fontSize={"18px"}
              fontWeight={600}
            >
              Description
            </Typography>
            <Box mt={1}>
              <AppInput
                placeholder="Message"
                value={formData.description}
                name="description"
                onChange={handleChange}
                multiline
                rows={3}
                variantStyles="profileSearch"
                error={Boolean(errors.description)}
                helperText={errors.description}
              />
            </Box>

            <Box mt={2}>
              <Typography
                color="text.darkBrown"
                fontSize={"18px"}
                fontWeight={600}
              >
                Tag
              </Typography>
              <Box mt={1}>
                <AppInput
                  placeholder="Add a tag (optional)"
                  value={formData.tag}
                  name="tag"
                  onChange={handleChange}
                  multiline
                  rows={2}
                  variantStyles="profileSearch"
                  error={Boolean(errors.tag)}
                  helperText={errors.tag}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogBody>
      <DialogActionButtons
        onCancel={onClose}
        onConfirm={handleSave}
        confirmText={isEditMode ? "Update" : "Save"}
        cancelText="Cancel"
        disabled={isMediaUploading}
        loading={loading}
      />
    </DialogBox>
  );
};

export default AddExclusiveContentDialog;
