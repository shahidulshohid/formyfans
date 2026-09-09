import { Box, CircularProgress, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { uploadMediaService } from "../../utils/helper";

const CoverImageUpload = ({
    value = "",
    onChange,
    onUploadingChange,
    error = "",
    label = "Upload cover photo",
    disabled = false,
    successMessage = "Cover photo uploaded.",
}) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleImageSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || disabled || uploading) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB.");
            return;
        }

        setUploading(true);
        onUploadingChange?.(true);

        try {
            const fileUrl = await uploadMediaService(file);
            onChange?.(fileUrl?.url);
            toast.success(successMessage);
        } catch {
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            onUploadingChange?.(false);
        }
    };

    const isUploading = uploading || disabled;

    return (
        <Box width="100%">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageSelect}
                disabled={isUploading}
                style={{ display: "none" }}
            />
            <Box
                onClick={() => !isUploading && fileInputRef.current?.click()}
                sx={{
                    width: "100%",
                    height: { xs: 140, md: 180 },
                    borderRadius: "20px",
                    border: "3px solid #FF1572",
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isUploading ? "wait" : "pointer",
                    position: "relative",
                }}
            >
                {isUploading ? (
                    <CircularProgress size={40} sx={{ color: "#FF1572" }} />
                ) : value ? (
                    <Box
                        component="img"
                        src={value}
                        alt="Cover"
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <ImageOutlinedIcon sx={{ fontSize: 48, color: "#FF1572" }} />
                        <Typography fontSize={13} color="#8B92A4">
                            Click to upload cover photo
                        </Typography>
                    </Box>
                )}
                {value && !isUploading && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: "rgba(255, 21, 114, 0.85)",
                            py: 1,
                        }}
                    >
                        <Typography
                            textAlign="center"
                            fontSize={12}
                            fontWeight={600}
                            color="#fff"
                        >
                            Change Cover
                        </Typography>
                    </Box>
                )}
            </Box>
            {label && (
                <Typography fontSize={14} color="#5E1321" mt={1} fontWeight={600}>
                    {label}
                </Typography>
            )}
            {error && (
                <Typography color="error" fontSize={12} mt={0.5}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default CoverImageUpload;
