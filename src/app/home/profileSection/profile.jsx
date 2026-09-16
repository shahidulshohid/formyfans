import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FriendImage1 from "../../../assets/icon/friends-image1.svg";
import FriendImage2 from "../../../assets/icon/friends-image2.svg";
import FriendImage3 from "../../../assets/icon/friends-image3.svg";
import CustomButton from "../../../components/cutomButon";
import {
  getInterestLabel,
  normalizeInterestValue,
  normalizeInterests,
} from "../../../constants/interests";
import { getDisplayName, getUserHandle } from "../../../utils/helper";
import { getUserProfileImage } from "../../../utils/profileImage";
import useUserStore from "../../../zustand/userUserStore";
import { getProfile } from "../../../api/modules/profile";
import { useEffect, useState } from "react";
import UserInterests from "./userInterests";
import { getFullS3Url } from "../../../utils/s3Helper";

const PROFILE_SIZE = 80;
const PROFILE_BORDER = 15;
const PROFILE_OVERLAP = (PROFILE_SIZE + PROFILE_BORDER * 2) / 2;

const communityImage = [
  { image: FriendImage1, name: ". 32 your friends are in" },
  { image: FriendImage2, name: ". 12 your friends are in" },
  { image: FriendImage3, name: ". 41 your friends are in" },
];

const Profile = ({ hideInterests = false }) => {
  // Navigate Hook
  const navigate = useNavigate();
  // Get User Data from User Store
  const { user, setUserData } = useUserStore();
  // Get Display Name and User Handle
  const displayName = getDisplayName(user);
  // Get User Handle
  const userHandle = getUserHandle(user);
  // Get User Profile Image
  const profileImageSrc = getUserProfileImage(user);
  // Get User Interests
  const userInterests = normalizeInterests(user?.interests);

  const refreshProfile = async () => {
    try {
      const response = await getProfile();
      if (response?.status === 200 || response?.status === 201) {
        setUserData(response?.data?.user);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!user?._id) return;
    refreshProfile();
  }, [user?._id]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          mx: { xs: "auto", md: 0 },
        }}
      >
        <Box
          sx={{
            bgcolor: "colors.white",
            width: "100%",
            borderRadius: "25px",
            position: "relative",
            p: 2.5,
            px: 1.5,
            boxSizing: "border-box",
            border: "1px solid",
            borderColor: "neutral.ligthColor",
          }}
        >
          <Stack direction="column" justifyContent="center" alignItems="center">
          <Box
            sx={{
              lineHeight: 0,
              width: PROFILE_SIZE + PROFILE_BORDER,
              height: PROFILE_SIZE + PROFILE_BORDER,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #FFA500, rgba(255,21,114,1), rgba(254,107,123,1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              p: "4px",
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                bgcolor: "colors.white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                p: "4px",
              }}
            >
              <Box
                component="img"
                src={getFullS3Url(profileImageSrc)}
                alt={displayName}
                sx={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  bgcolor: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </Box>
          </Box>
          </Stack>
          <Box textAlign="center">
            <Typography
              fontSize={20}
              color="neutral.black"
              fontWeight={700}
              noWrap
              sx={{ lineHeight: 1.3 }}
            >
              {displayName}
            </Typography>
            <Typography
              fontSize={13}
              color="text.neutralGrey"
              noWrap
              title={userHandle}
              sx={{
                lineHeight: 1.4,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userHandle}
            </Typography>
          </Box>

          {user?.tagLine && (
            <Box display="flex" justifyContent="center" mt={1.5}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "background.softPinkLight",
                  color: "neutral.deepPink",
                  borderRadius: "20px",
                  px: 1.5,
                  py: 0.5,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Typography component="span" fontSize={12} fontWeight={600} color="inherit">
                  • {user?.tagLine}
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "neutral.ligthColor",
              mt: 2,
              mb: 1.5,
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              textAlign: "center",
              mb: 1.5,
            }}
          >
            <Box>
              <Typography fontSize={14} color="neutral.black" fontWeight={700}>
                {user?.followersCount || 0}
              </Typography>
              <Typography fontSize={12} color="text.neutralGrey">
                Followers
              </Typography>
            </Box>
            <Box>
              <Typography fontSize={14} color="neutral.black" fontWeight={700}>
                {user?.followingCount || 0}
              </Typography>
              <Typography fontSize={12} color="text.neutralGrey">
                Following
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={1} alignItems="center">
            <CustomButton
              onClick={() => navigate(`/${user?.username}/all-posts`)}
              title="View My Profile"
              radius="13px"
              width="90%"
              sx={{
                backgroundColor: "neutral.deepPink",
                color: "colors.white",
                fontWeight: 700,
                py: 1,
                boxShadow: "0 6px 10px -6px rgba(0,0,0,0.35)",
              }}
            />

            <CustomButton
              title="Market Place"
              radius="13px"
              width="90%"
              sx={{
                backgroundColor: "colors.white",
                border: "1px solid",
                borderColor: "neutral.ligthColor",
                color: "neutral.black",
                fontWeight: 700,
                py: 1,
              }}
              onClick={() => navigate("/market-place")}
            />
          </Box>
        </Box>
      </Box>

      {!hideInterests && <UserInterests userInterests={userInterests} />}
    </>
  );
};

export default Profile;