import {
  Box,
  CircularProgress,
  FormHelperText,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useRef, useState } from "react";
import SectionCard from "./SectionCard";

const ProductImageUpload = ({
  images = [],
  onFilesSelect,
  onRemoveImage,
  uploading = false,
  embedded = false,
  error = false,
  helperText = "",
}) => {
  const [previewIndex, setPreviewIndex] = useState(0);
  const fileInputRef = useRef(null);
  const prevImageCountRef = useRef(images.length);

  useEffect(() => {
    if (previewIndex >= images.length) {
      setPreviewIndex(Math.max(0, images.length - 1));
    }
    if (images.length > prevImageCountRef.current) {
      setPreviewIndex(images.length - 1);
    }
    prevImageCountRef.current = images.length;
  }, [images.length, previewIndex]);

  const mainImage = images[previewIndex];

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length) onFilesSelect?.(files);
  };

  const handleRemove = (index) => {
    onRemoveImage?.(index);
    if (previewIndex === index) {
      setPreviewIndex(Math.max(0, index - 1));
    } else if (previewIndex > index) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  const openFilePicker = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const content = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        multiple
        onChange={handleFileInput}
        disabled={uploading}
        style={{ display: "none" }}
      />

      {embedded && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mb: 1,
            justifyContent: "space-between",
          }}
        >
          <Typography fontSize={16} fontWeight={600} color="#FF1572">
            Product Images
          </Typography>
          <Typography
            onClick={(e) => {
              e.stopPropagation();
              openFilePicker();
            }}
            sx={{
              color: "#5E1321",
              fontSize: 34,
              fontWeight: 300,
              width: 24,
              height: 24,
              lineHeight: 1,
              cursor: uploading ? "not-allowed" : "pointer",
              userSelect: "none",
            }}
          >
            +
          </Typography>
        </Box>
      )}

      <Box
        onClick={openFilePicker}
        sx={{
          width: "100%",
          maxWidth: "100%",
          height: embedded ? 160 : 260,
          minHeight: embedded ? 160 : 260,
          bgcolor: "#E8E8E8",
          borderRadius: 6,
          position: "relative",
          overflow: "hidden",
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? (
          <CircularProgress size={40} sx={{ color: "#FF1572" }} />
        ) : mainImage ? (
          <Box
            component="img"
            src={mainImage}
            alt="Product preview"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Typography color="#5E1321" fontSize={14} fontWeight={600}>
            Click to upload images
          </Typography>
        )}

        {!embedded && (
          <Typography
            onClick={(e) => {
              e.stopPropagation();
              openFilePicker();
            }}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "#5E1321",
              fontSize: 34,
              fontWeight: 300,
              width: 24,
              height: 24,
              lineHeight: 1,
              cursor: uploading ? "not-allowed" : "pointer",
              userSelect: "none",
            }}
          >
            +
          </Typography>
        )}

        {images.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1.5,
              maxWidth: "90%",
              overflowX: "auto",
            }}
          >
            {images.map((url, index) => (
              <Box
                key={`${url}-${index}`}
                sx={{
                  position: "relative",
                  flexShrink: 0,
                  width: embedded ? 44 : 52,
                  height: embedded ? 44 : 52,
                }}
              >
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewIndex(index);
                  }}
                  sx={{
                    width: embedded ? 40 : 48,
                    height: embedded ? 40 : 48,
                    borderRadius: "50%",
                    overflow: "hidden",
                    cursor: "pointer",
                    border:
                      index === previewIndex
                        ? "2px solid #FF1572"
                        : "2px solid white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  <Box
                    component="img"
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <IconButton
                  size="small"
                  aria-label="Remove image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  disabled={uploading}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: embedded ? 18 : 20,
                    height: embedded ? 18 : 20,
                    bgcolor: "#FF1572",
                    color: "#fff",
                    border: "2px solid #fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                    p: 0,
                    zIndex: 2,
                    "&:hover": { bgcolor: "#e01265" },
                    "&.Mui-disabled": {
                      bgcolor: "rgba(255, 21, 114, 0.5)",
                      color: "#fff",
                    },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: embedded ? 12 : 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Typography fontSize={14} color="#00000040" textAlign="center">
        {uploading
          ? "Uploading to Cloudinary..."
          : "Set the product thumbnail. JPEG or PNG — multiple images allowed"}
      </Typography>

      {images.length > 0 && (
        <Typography
          fontSize={12}
          fontWeight={600}
          color="#5E1321"
          mt={1}
          textAlign="center"
        >
          {images.length} image(s) uploaded
        </Typography>
      )}
    </>
  );

  if (embedded) {
    return (
      <Box sx={{ width: "100%", maxWidth: "100%" }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            border: error ? "12px solid" : "12px solid #FF1572",
            borderColor: error ? "error.main" : "#FF1572",
            borderRadius: 8,
            p: 1.5,
            boxSizing: "border-box",
            opacity: uploading ? 0.85 : 1,
          }}
        >
          {content}
        </Box>
        {helperText ? (
          <FormHelperText error={error} sx={{ mx: 0, mt: 0.75 }}>
            {helperText}
          </FormHelperText>
        ) : null}
      </Box>
    );
  }

  return (
    <SectionCard
      sx={{
        border: "12px solid #FF1572",
        borderRadius: 8,
        p: 2,
        width: { xs: "100%", md: 328 },
        maxWidth: 328,
        minHeight: 380,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mb: 4,
        opacity: uploading ? 0.85 : 1,
      }}
    >
      {content}
    </SectionCard>
  );
};

export default ProductImageUpload;
