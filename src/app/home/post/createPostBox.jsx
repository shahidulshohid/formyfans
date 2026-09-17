import {
  Avatar,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { Camera as CameraIcon, ImagePlus, PlayCircle, Sticker, Users, X } from "lucide-react";
import { useRef, useState } from "react";
import { CollaborativeDealPicker } from "../../../components/collaborativedealpicker";
import CustomButton from "../../../components/cutomButon";
import CustomInput from "../../../components/cutomInput";
import {
  CameraDialog,
  DialogBox,
  DialogHeader,
} from "../../../components/dialogs";
import { USER_ROLES } from "../../../components/productForm/constants";
import PostMediaPreviewSkeleton from "../../../components/skeleton/PostMediaPreviewSkeleton";
import { getFullS3Url } from "../../../utils/s3Helper";

const CreatePostBox = ({
  user,
  formData,
  setFormData,
  contentType,
  onContentTypeChange,
  postType,
  onPostTypeChange,
  editingPostId,
  setEditingPostId,
  selectedDeal,
  setDealPickerOpen,
  isLoading,
  handleCreatePost,
  removeImage,
  handleImageChange,
  handleCameraCapture,
  canShowPostButton,
  open,
  onOpen,
  onClose,
  taggedUsers,
  setTaggedUsers,
  tagPeopleDialogRef,
}) => {
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const cameraImageInputRef = useRef(null);
  const galleryImageInputRef = useRef(null);
  const gifImageInputRef = useRef(null);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // if (!user || user?.role !== USER_ROLES.CREATOR) return null; // ami comand kore rakhsi ai line

  // Shared style for the attachment-option buttons (Photo/Video, GIF, Camera)
  const optionBtnSx = {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    px: 1.5,
    py: 0.9,
    borderRadius: "10px",
    color: "neutral.grey",
    "&:hover": {
      bgcolor: "background.softPinkLight",
      color: "neutral.deepPink",
    },
  };

  return (
    <>
      {/* Collapsed trigger box */}
      <Box
        onClick={onOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "colors.white",
          border: "1px solid",
          borderColor: "neutral.ligthColor",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          p: 1.75,
          mt: 2,
          cursor: "pointer",
        }}
      >
        <Avatar
          src={getFullS3Url(user?.image)}
          sx={{
            width: 44,
            height: 44,
            border: "2px solid",
            borderColor: "neutral.deepPink",
          }}
        />
        <Box
          sx={{
            flex: 1,
            bgcolor: "background.white",
            borderRadius: "999px",
            border: "1px solid",
            borderColor: "neutral.ligthColor",
            px: 2.5,
            py: 1.4,
          }}
        >
          <Typography fontSize="14px" color="text.neutralGrey">
            Start a post
          </Typography>
        </Box>
      </Box>

      {/* Dialog with the full create/update post system */}
      <DialogBox
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            bgcolor: "colors.white",
          },
        }}
      >
        <DialogHeader
          title={editingPostId ? "Update Post" : "Create Post"}
          onClose={onClose}
        />
        <Box p={2.5} pt={0}>
          {!editingPostId && (
            <FormControl>
              <RadioGroup
                aria-labelledby="post-type-label"
                name="controlled-radio-buttons-group"
                value={contentType}
                onChange={onContentTypeChange}
                sx={{ flexDirection: "row", gap: 2, mt: 0.5, mb: 1 }}
              >
                <FormControlLabel
                  value="post"
                  control={<Radio sx={{ color: "neutral.deepPink" }} />}
                  label="Post"
                />
                <FormControlLabel
                  value="reel"
                  control={<Radio sx={{ color: "neutral.deepPink" }} />}
                  label="Reel"
                />
              </RadioGroup>
            </FormControl>
          )}

          {/* Row 1: avatar + big input, single row (LinkedIn-style compose bar) */}
          <Stack direction="row" alignItems="center" gap={1.25}>

            <Box flex={1}>
              <CustomInput
                placeholder="Tell your friends about your thoughts.."
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, post: e.target.value }))
                }
                value={formData.post}
                type="text"
                name="post"
                borderRadius="16px"
                rows={4}
                multiline={true}
                backgroundColor={"#F9F9F9"}
                sx={{
                  "& .MuiInputBase-root": {
                    minHeight: "56px",
                  },
                  "& .MuiInputBase-input": {
                    color: "neutral.black",
                    fontSize: "15px",
                  },
                }}
              />
            </Box>
          </Stack>

          {/* Row 2: attachment options, below the input — LinkedIn style */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            gap={0.5}
            mt={1.5}
            pt={1.5}
            sx={{ borderTop: "1px solid", borderColor: "neutral.ligthColor" }}
          >
            <Box
              onClick={() => galleryImageInputRef.current?.click()}
              sx={{ ...optionBtnSx, cursor: "pointer" }}
            >
              <ImagePlus size={20} />
              <Typography fontSize="13px" fontWeight={600}>
                {contentType === "reel" ? "Video" : "Photo/Video"}
              </Typography>
              <input
                type="file"
                ref={galleryImageInputRef}
                style={{ display: "none" }}
                accept={
                  contentType === "reel"
                    ? "video/mp4,video/webm,video/quicktime"
                    : "image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime"
                }
                onChange={(e) => handleImageChange(e, "gallery")}
              />
            </Box>

            {contentType !== "reel" && (
              <Box
                onClick={() => gifImageInputRef.current?.click()}
                sx={{ ...optionBtnSx, cursor: "pointer" }}
              >
                <Sticker size={20} />
                <Typography fontSize="13px" fontWeight={600}>
                  GIF
                </Typography>
                <input
                  type="file"
                  ref={gifImageInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "gif")}
                />
              </Box>
            )}

            <Box
              onClick={() => {
                if (contentType === "reel" || isMobile) {
                  cameraImageInputRef.current?.click();
                } else {
                  setCameraModalOpen(true);
                }
              }}
              sx={{ ...optionBtnSx, cursor: "pointer" }}
            >
              <CameraIcon size={20} />
              <Typography fontSize="13px" fontWeight={600}>
                Camera
              </Typography>
              <input
                type="file"
                ref={cameraImageInputRef}
                style={{ display: "none" }}
                accept={
                  contentType === "reel"
                    ? "video/mp4,video/webm,video/quicktime"
                    : "image/*"
                }
                capture={isMobile ? "environment" : undefined}
                onChange={(e) => handleImageChange(e, "camera")}
              />
            </Box>

            <Box
              onClick={() => tagPeopleDialogRef?.current?.open(taggedUsers)}
              sx={{ ...optionBtnSx, cursor: "pointer" }}
            >
              <Users size={20} />
              <Typography fontSize="13px" fontWeight={600}>
                Tag People
              </Typography>
            </Box>
          </Stack>

          {/* Tagged Users Chips */}
          {taggedUsers?.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1.5 }}>
              {taggedUsers.map((u) => (
                <Chip
                  key={u._id}
                  label={`with ${u.firstName} ${u.lastName}`}
                  size="small"
                  onDelete={() =>
                    setTaggedUsers((prev) => prev.filter((t) => t._id !== u._id))
                  }
                  deleteIcon={<X size={14} />}
                  sx={{
                    bgcolor: "rgba(255, 21, 114, 0.1)",
                    color: "neutral.deepPink",
                    fontWeight: 600,
                    fontSize: "12px",
                    "& .MuiChip-deleteIcon": {
                      color: "neutral.deepPink",
                      "&:hover": { color: "#E0115F" },
                    },
                  }}
                />
              ))}
            </Stack>
          )}

          <Stack direction="row" alignItems="center" gap={1}>
            {contentType === "reel" && (
              <Typography fontSize="11px" fontWeight={500} variant="body2" color="text.neutralGrey" mt={1}>
                Reel upload supports only video and must be 50 seconds or
                shorter.
              </Typography>
            )}
            {isLoading.imageUpload && <PostMediaPreviewSkeleton />}

            {formData.images?.length > 0 && (
              <Box mt={2}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {formData.images.map((file, index) => {
                    const isVideo =
                      file.mediaType === "video" ||
                      file.url?.includes("/video/upload/");
                    const mediaUrl = getFullS3Url(file.url);

                    return (
                      <Box
                        key={index}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: "10px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {isVideo ? (
                          <>
                            <Box
                              component="video"
                              src={mediaUrl}
                              muted
                              playsInline
                              preload="metadata"
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                bgcolor: "#1a1a1a",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "rgba(0, 0, 0, 0.35)",
                                pointerEvents: "none",
                              }}
                            >
                              <PlayCircle size={32} color="#fff" />
                            </Box>
                          </>
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`preview-${index}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}

                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            width: 24,
                            height: 24,
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.8)",
                            },
                          }}
                        >
                          <X size={14} />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Stack>

          {!editingPostId && (
            <>
              <FormControl>
                <RadioGroup
                  aria-labelledby="post-type-label"
                  name="controlled-radio-buttons-group"
                  value={postType}
                  onChange={onPostTypeChange}
                  sx={{ flexDirection: "row", gap: 2, mt: 1 }}
                >
                  <FormControlLabel
                    value="own"
                    control={<Radio sx={{ color: "neutral.deepPink" }} />}
                    label="Own"
                  />
                  <FormControlLabel
                    value="collaborative"
                    control={<Radio sx={{ color: "neutral.deepPink" }} />}
                    label="Collaborative"
                  />
                </RadioGroup>
              </FormControl>

              {postType === "collaborative" && (
                <CollaborativeDealPicker
                  deal={selectedDeal}
                  onOpenPicker={() => setDealPickerOpen(true)}
                />
              )}
            </>
          )}

          {canShowPostButton && (
            <Stack direction={"row"} justifyContent={"flex-end"} mt={2}>
              <CustomButton
                title={editingPostId ? "Update" : "Post"}
                width={"100px"}
                sx={{
                  backgroundColor: "neutral.deepPink",
                  color: "colors.white",
                }}
                onClick={handleCreatePost}
                loading={isLoading.createPost}
              />
            </Stack>
          )}
        </Box>

        <CameraDialog
          open={cameraModalOpen}
          onClose={() => setCameraModalOpen(false)}
          onCapture={handleCameraCapture}
        />
      </DialogBox>
    </>
  );
};

export default CreatePostBox;