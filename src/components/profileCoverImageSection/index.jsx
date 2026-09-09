import { Box } from "@mui/material";
import CoverImageUpload from "../coverImageUpload";
import ProfileImageUpload from "../profileImageUpload";

const ProfileCoverImageSection = ({
    profileImage = "",
    coverImage = "",
    onProfileImageChange,
    onCoverImageChange,
    onUploadingChange,
    profileError = "",
    coverError = "",
}) => {
    const handleUploadingChange = (isUploading) => {
        onUploadingChange?.(isUploading);
    };

    return (
        <Box sx={{ width: "100%", maxWidth: 793, mb: { xs: 8, md: 9 } }}>
            <Box sx={{ position: "relative" }}>
                <CoverImageUpload
                    value={coverImage || ""}
                    onChange={onCoverImageChange}
                    onUploadingChange={handleUploadingChange}
                    error={coverError}
                    label=""
                />
                <Box
                    sx={{
                        position: "absolute",
                        left: { xs: 16, md: 24 },
                        bottom: { xs: -50, md: -55 },
                    }}
                >
                    <ProfileImageUpload
                        value={profileImage || ""}
                        onChange={onProfileImageChange}
                        onUploadingChange={handleUploadingChange}
                        error={profileError}
                        label="Profile photo"
                        containerMb={0}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default ProfileCoverImageSection;
