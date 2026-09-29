import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { toast } from "react-toastify";
import Header from "../../../components/header";
import { arrowIcon, uploadIcon } from "../../../assets/aiAssets";
import { uploadAiFileToS3 } from "../../../api/aiContent/uploads";
import { connectAiSocket } from "../../../api/aiContent/aiSocket";
import { refineAiPrompt } from "../../../api/aiContent/prompts";

export const DEFAULT_SUNDARBANS_PROMPT =
  "A breathtaking aerial video showcasing a drone flyover of the Sundarbans mangrove forest in Bangladesh at sunrise. The scene captures the serene beauty of misty waterways winding through the lush, dense canopy. The camera glides smoothly, highlighting the vibrant greens of the mangroves and the soft golden hues of the sunrise filtering through the trees. Wildlife can be seen in the underbrush and waterways, adding life to the tranquil landscape. The composition emphasizes the vastness of the forest, with gentle motion to create a cinematic feel, all within a 720p resolution and a 16:9 aspect ratio, lasting 5 seconds.";

export const DEFAULT_TIGER_MODIFICATION_PROMPT =
  "Add a realistic Royal Bengal tiger from the provided image reference naturally into the existing Sundarbans scene. Preserve the tiger's distinctive orange coat, black stripes, facial features, body proportions, and overall appearance from the reference image. Place the tiger naturally within the mangrove vegetation near the misty waterways, making it feel like it was genuinely present in the original footage. Ensure realistic scale, perspective, lighting, shadows, reflections, depth, and interaction with the surrounding environment. Match the tiger with the warm golden sunrise lighting, tropical haze, lush green mangroves, and cinematic atmosphere of the existing video. Keep the original drone camera movement, composition, environment, duration, resolution, and overall visual style unchanged. The tiger should blend seamlessly into the footage without looking AI-generated, composited, or artificially inserted. The final result should resemble authentic cinematic wildlife footage of a Royal Bengal tiger in the Sundarbans.";

const resolutions = [
  { id: "480p", label: "480p" },
  { id: "720p", label: "720p" },
];

const aspectRatios = [
  { id: "1:1", label: "1 : 1" },
  { id: "4:3", label: "4 : 3" },
  { id: "3:4", label: "3 : 4" },
  { id: "16:9", label: "16 : 9" },
  { id: "9:16", label: "9 : 16" },
];

const durations = [
  { id: "5", label: "5" },
  { id: "10", label: "10" },
  { id: "15", label: "15" },
];

const CreateAiVideoEdit = () => {
  const navigate = useNavigate();

  // Connect AI socket as soon as user opens CreateAiVideoEdit form
  useEffect(() => {
    connectAiSocket();
  }, []);

  // Video Reference State
  const [videoFile, setVideoFile] = useState(null);
  const [videoKey, setVideoKey] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);

  // Image Reference State
  const [imageFile, setImageFile] = useState(null);
  const [imageKey, setImageKey] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  // Prompt, Settings, and Audio State
  const [prompt, setPrompt] = useState("");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");
  const [selectedDuration, setSelectedDuration] = useState("5");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleBack = () => {
    navigate(-1);
  };

  // Video File Upload Handler
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview & state reset
    const previewUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreview(previewUrl);
    setVideoKey("");
    setVideoUploading(true);
    setVideoProgress(0);

    try {
      const uploadRes = await uploadAiFileToS3(file, "videoReference", (pct) => {
        setVideoProgress(pct);
      });

      if (uploadRes?.fileKey) {
        setVideoKey(uploadRes.fileKey);
        toast.success("Video reference uploaded successfully!");
      }
    } catch (err) {
      console.error("Video reference upload error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to upload video reference.";
      toast.error(errMsg);
    } finally {
      setVideoUploading(false);
    }
  };

  // Image File Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview & state reset
    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(previewUrl);
    setImageKey("");
    setImageUploading(true);
    setImageProgress(0);

    try {
      const uploadRes = await uploadAiFileToS3(file, "imageReference", (pct) => {
        setImageProgress(pct);
      });

      if (uploadRes?.fileKey) {
        setImageKey(uploadRes.fileKey);
        toast.success("Image reference uploaded successfully!");
      }
    } catch (err) {
      console.error("Image reference upload error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to upload image reference.";
      toast.error(errMsg);
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveVideo = (e) => {
    e.stopPropagation();
    setVideoFile(null);
    setVideoKey("");
    setVideoPreview(null);
    setVideoProgress(0);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImageKey("");
    setImagePreview(null);
    setImageProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Continue to Script Step
  const handleContinue = async () => {
    if (!videoFile && !videoKey) {
      toast.error("Please add the video you want to edit.");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a video scene prompt / description.");
      return;
    }

    if (videoUploading || imageUploading) {
      toast.info("Files are still uploading. Please wait a moment.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalVideoKey = videoKey;
      let finalImageKey = imageKey;

      // If video file was selected but not uploaded yet, upload now
      if (videoFile && !finalVideoKey) {
        setVideoUploading(true);
        const res = await uploadAiFileToS3(videoFile, "videoReference", (pct) => setVideoProgress(pct));
        finalVideoKey = res.fileKey;
        setVideoKey(finalVideoKey);
        setVideoUploading(false);
      }

      // If image file was selected but not uploaded yet, upload now
      if (imageFile && !finalImageKey) {
        setImageUploading(true);
        const res = await uploadAiFileToS3(imageFile, "imageReference", (pct) => setImageProgress(pct));
        finalImageKey = res.fileKey;
        setImageKey(finalImageKey);
        setImageUploading(false);
      }

      const finalPrompt = prompt.trim();

      // Call /ai/prompts/refine API for VIDEO_EDIT
      const payload = {
        type: "VIDEO_EDIT",
        prompt: finalPrompt,
        style: "Cinematic Color Grade",
        settings: {
          resolution: selectedResolution,
          aspectRatio: selectedAspectRatio,
          duration: selectedDuration,
        },
      };

      const response = await refineAiPrompt(payload);
      const resBody = response?.data;

      if (resBody?.status === "success" && resBody?.data) {
        const refineData = resBody.data;
        const refinedText = refineData.refinedPrompt || finalPrompt;
        const originalText = refineData.originalPrompt || finalPrompt;

        toast.success(resBody.message || "Prompt refined successfully!");

        navigate("/ai-video-edit-generated-script", {
          state: {
            type: "VIDEO_EDIT",
            prompt: originalText,
            originalPrompt: originalText,
            refinedPrompt: refinedText,
            promptId: refineData.promptId,
            style: refineData.style || "Cinematic Color Grade",
            videoModificationPrompt: refinedText,
            videoReference: finalVideoKey || "",
            imageReference: finalImageKey || "",
            videoReferenceKey: finalVideoKey || "",
            imageReferenceKey: finalImageKey || "",
            videoFileName: videoFile?.name || "input_video.mp4",
            imageFileName: imageFile?.name || "image_reference.png",
            videoPreviewUrl: videoPreview,
            imagePreviewUrl: imagePreview,
            audio: audioEnabled,
            resolution: selectedResolution,
            aspectRatio: selectedAspectRatio,
            duration: selectedDuration,
            refineData,
          },
        });
      } else {
        const errorMsg = resBody?.message || "Failed to refine prompt. Please try again.";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Continue error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to process prompt refinement.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFFFFF", pb: 8 }}>
      <Header />
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
          AI Video Editor
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
          Edit, refine, and customize your AI-generated video with ease.
        </Typography>

        {/* Upload Boxes Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 2.5, sm: 2 },
            mb: { xs: 2.5, sm: 3.5 },
          }}
        >
          {/* Video Reference Upload */}
          <Box>
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
              Video Reference
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

            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              style={{ display: "none" }}
            />

            <Box
              onClick={() => videoInputRef.current?.click()}
              sx={{
                width: "100%",
                minHeight: { xs: "145px", sm: "165px" },
                border: "1.5px dashed",
                borderColor: videoKey ? "#10B981" : videoUploading ? "#FF1572" : "#CBD5E1",
                borderRadius: "14px",
                bgcolor: videoKey ? "#F0FDF4" : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
                p: 2,
                position: "relative",
                boxSizing: "border-box",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "#FF1572",
                  bgcolor: "#FFF9FB",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {videoFile ? (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {videoKey ? (
                      <CheckCircleRoundedIcon sx={{ color: "#10B981", fontSize: 24 }} />
                    ) : videoUploading ? (
                      <CircularProgress size={22} sx={{ color: "#FF1572" }} />
                    ) : (
                      <Box
                        component="img"
                        src={uploadIcon}
                        alt="Video"
                        sx={{ width: 28, height: 28, objectFit: "contain" }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#262626",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {videoFile.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleRemoveVideo}
                      sx={{ p: "2px", "&:hover": { color: "#FF1572" } }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>

                  {videoUploading && (
                    <Box sx={{ width: "80%", mt: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={videoProgress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#FEE2E2",
                          "& .MuiLinearProgress-bar": { bgcolor: "#FF1572" },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "11px",
                          fontFamily: "Inter, sans-serif",
                          color: "#6B7280",
                          textAlign: "center",
                          mt: 0.5,
                        }}
                      >
                        Uploading... {videoProgress}%
                      </Typography>
                    </Box>
                  )}

                  {videoKey && (
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontFamily: "Inter, sans-serif",
                        color: "#059669",
                        fontWeight: 500,
                      }}
                    >
                      Uploaded & ready
                    </Typography>
                  )}
                </Box>
              ) : (
                <>
                  <Box
                    component="img"
                    src={uploadIcon}
                    alt="Upload"
                    sx={{ width: 36, height: 36, objectFit: "contain" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "12px", sm: "13px" },
                      fontWeight: 500,
                      color: "#262626",
                      textAlign: "center",
                    }}
                  >
                    Drop reference video here or click to browse
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "10px", sm: "11px" },
                      color: "#8C8C8C",
                      textAlign: "center",
                    }}
                  >
                    MP4, WEBM, MOV · Max 100MB
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Image Reference Upload */}
          <Box>
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
              Image Reference
            </Typography>

            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <Box
              onClick={() => imageInputRef.current?.click()}
              sx={{
                width: "100%",
                minHeight: { xs: "145px", sm: "165px" },
                border: "1.5px dashed",
                borderColor: imageKey ? "#10B981" : imageUploading ? "#FF1572" : "#CBD5E1",
                borderRadius: "14px",
                bgcolor: imageKey ? "#F0FDF4" : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
                p: 2,
                position: "relative",
                boxSizing: "border-box",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "#FF1572",
                  bgcolor: "#FFF9FB",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {imageFile ? (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {imageKey ? (
                      <CheckCircleRoundedIcon sx={{ color: "#10B981", fontSize: 24 }} />
                    ) : imageUploading ? (
                      <CircularProgress size={22} sx={{ color: "#FF1572" }} />
                    ) : (
                      <Box
                        component="img"
                        src={uploadIcon}
                        alt="Image"
                        sx={{ width: 28, height: 28, objectFit: "contain" }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#262626",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {imageFile.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{ p: "2px", "&:hover": { color: "#FF1572" } }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>

                  {imageUploading && (
                    <Box sx={{ width: "80%", mt: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={imageProgress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#FEE2E2",
                          "& .MuiLinearProgress-bar": { bgcolor: "#FF1572" },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "11px",
                          fontFamily: "Inter, sans-serif",
                          color: "#6B7280",
                          textAlign: "center",
                          mt: 0.5,
                        }}
                      >
                        Uploading... {imageProgress}%
                      </Typography>
                    </Box>
                  )}

                  {imageKey && (
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontFamily: "Inter, sans-serif",
                        color: "#059669",
                        fontWeight: 500,
                      }}
                    >
                      Uploaded & ready
                    </Typography>
                  )}
                </Box>
              ) : (
                <>
                  <Box
                    component="img"
                    src={uploadIcon}
                    alt="Upload"
                    sx={{ width: 36, height: 36, objectFit: "contain" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "12px", sm: "13px" },
                      fontWeight: 500,
                      color: "#262626",
                      textAlign: "center",
                    }}
                  >
                    Click to browse image or photo
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      color: "#737373",
                      textAlign: "center",
                    }}
                  >
                    PNG, JPG or WEBP (e.g. tigerr.png)
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Instructions / Base Prompt Section */}
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
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
            Video Scene Prompt / Description
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

          <TextField
            multiline
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your video scene in detail (e.g. A cinematic drone flyover of a lush mangrove forest at sunrise, with misty waterways and golden sunlight filtering through dense tree canopy, camera moving forward smoothly)..."
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: { xs: "110px", sm: "120px" },
                borderRadius: "12px",
                bgcolor: "#FFFFFF",
                fontSize: { xs: "13px", sm: "14px" },
                fontFamily: "Inter, sans-serif",
                color: "#333333",
                alignItems: "flex-start",
                p: { xs: 1.5, sm: 2 },
                "& fieldset": {
                  borderColor: "#B3B3B3",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "#888888",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF1572",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputBase-input": {
                height: "100% !important",
                overflow: "auto !important",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.5,
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#9CA3AF",
                opacity: 1,
                fontSize: { xs: "12px", sm: "13.5px" },
                lineHeight: 1.45,
              },
            }}
          />

          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "11px", sm: "12px" },
              color: "#6B7280",
              mt: 0.8,
              lineHeight: 1.4,
            }}
          >
            💡 <strong>Tip:</strong> Describe the environment, lighting, camera angle/movement, and subject of your video so AI can edit it accurately.
          </Typography>
        </Box>

        {/* Resolution Section */}
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
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
            Resolution
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: { xs: 1, sm: 1.8 },
            }}
          >
            {resolutions.map((item) => {
              const isSelected = selectedResolution === item.id;

              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedResolution(item.id)}
                  sx={{
                    bgcolor: isSelected ? "#FF1572" : "#EBECEF",
                    color: isSelected ? "#FFFFFF" : "#000000",
                    borderRadius: "12px",
                    py: { xs: 1.1, sm: 1.3 },
                    px: { xs: 1, sm: 2 },
                    textAlign: "center",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease-in-out",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "12px", sm: "14px", md: "15px" },
                    lineHeight: "140%",
                    letterSpacing: "-0.5px",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: isSelected ? "#FF1572" : "#DFE1E6",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Aspect Ratio Section */}
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
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
            Aspect Ratio
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(5, 1fr)" },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {aspectRatios.map((item) => {
              const isSelected = selectedAspectRatio === item.id;

              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedAspectRatio(item.id)}
                  sx={{
                    bgcolor: isSelected ? "#FF1572" : "#EBECEF",
                    color: isSelected ? "#FFFFFF" : "#000000",
                    borderRadius: "12px",
                    py: { xs: 1.1, sm: 1.3 },
                    px: { xs: 0.5, sm: 2 },
                    textAlign: "center",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease-in-out",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "12px", sm: "14px", md: "15px" },
                    lineHeight: "140%",
                    letterSpacing: "-0.5px",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: isSelected ? "#FF1572" : "#DFE1E6",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Duration Section */}
        <Box sx={{ mb: { xs: 3.5, sm: 4.5 } }}>
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
            Duration
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: { xs: 1, sm: 1.8 },
            }}
          >
            {durations.map((item) => {
              const isSelected = selectedDuration === item.id;

              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedDuration(item.id)}
                  sx={{
                    bgcolor: isSelected ? "#FF1572" : "#EBECEF",
                    color: isSelected ? "#FFFFFF" : "#000000",
                    borderRadius: "12px",
                    py: { xs: 1.1, sm: 1.3 },
                    px: { xs: 1, sm: 2 },
                    textAlign: "center",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease-in-out",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "12px", sm: "14px", md: "15px" },
                    lineHeight: "140%",
                    letterSpacing: "-0.5px",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: isSelected ? "#FF1572" : "#DFE1E6",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Audio Toggle & Continue Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2.5,
            width: "100%",
            mt: 4,
          }}
        >
          {/* Audio Switch */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: { xs: "14px", sm: "15px", md: "16px" },
                lineHeight: "20px",
                letterSpacing: "-0.5px",
                color: "#000000",
              }}
            >
              Enable AI Audio / Voiceover
            </Typography>

            <Switch
              checked={audioEnabled}
              onChange={(e) => setAudioEnabled(e.target.checked)}
              sx={{
                width: 44,
                height: 24,
                p: 0,
                "& .MuiSwitch-switchBase": {
                  p: "2px",
                  "&.Mui-checked": {
                    transform: "translateX(20px)",
                    color: "#FFFFFF",
                    "& + .MuiSwitch-track": {
                      bgcolor: "#FF1572",
                      opacity: 1,
                    },
                  },
                },
                "& .MuiSwitch-thumb": {
                  width: 20,
                  height: 20,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                },
                "& .MuiSwitch-track": {
                  borderRadius: 10,
                  bgcolor: "#E5E7EB",
                  opacity: 1,
                  boxSizing: "border-box",
                },
              }}
            />
          </Box>

          {/* Continue Script Button */}
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={isSubmitting || videoUploading || imageUploading}
            endIcon={
              isSubmitting || videoUploading || imageUploading ? (
                <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
              ) : (
                <Box
                  component="img"
                  src={arrowIcon}
                  alt="Continue"
                  sx={{ width: 16, height: 16, objectFit: "contain" }}
                />
              )
            }
            sx={{
              bgcolor: "#FF1572",
              color: "#FFFFFF",
              borderRadius: "53px",
              height: "44px",
              px: "22px",
              py: "10px",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                bgcolor: "#FF1572",
                boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                transform: isSubmitting || videoUploading || imageUploading ? "none" : "translateY(-1px)",
              },
              "&.Mui-disabled": {
                bgcolor: "#FF8AB8",
                color: "#FFFFFF",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {isSubmitting || videoUploading || imageUploading ? "Uploading & Processing..." : "Continue Script"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateAiVideoEdit;
