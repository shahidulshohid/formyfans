import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FriendImage1 from "../../assets/icon/friends-image1.svg";
import FriendImage2 from "../../assets/icon/friends-image2.svg";
import FriendImage3 from "../../assets/icon/friends-image3.svg";
import CustomButton from "../../components/cutomButon";
import {
  getInterestLabel,
  normalizeInterestValue,
} from "../../constants/interests";
import { getDisplayName, getUserHandle } from "../../utils/helper";
import { getUserProfileImage } from "../../utils/profileImage";
import useUserStore from "../../zustand/userUserStore";
import { getProfile } from "../../api/modules/profile";
import { useEffect, useState } from "react";

import { DUMMY_USER } from "../../constants/dummyAuth";

const PROFILE_SIZE = 150;
const PROFILE_BORDER = 15;
const PROFILE_OVERLAP = (PROFILE_SIZE + PROFILE_BORDER * 2) / 2;

const communityImage = [
  { image: FriendImage1, name: ". 32 your friends are in" },
  { image: FriendImage2, name: ". 12 your friends are in" },
  { image: FriendImage3, name: ". 41 your friends are in" },
];

const Profile = () => {
  // Navigate Hook
  const navigate = useNavigate();
  // Get User Data from User Store
  const { user: rawUser, setUserData } = useUserStore();
  const user = rawUser || DUMMY_USER;
  // Get Display Name and User Handle
  const displayName = getDisplayName(user) || "Shahidul Islam";
  // Get User Handle
  const userHandle = getUserHandle(user) || "@shahidul_demo";
  // Get User Profile Image
  const profileImageSrc = getUserProfileImage(user);
  // Get User Interests
  const userInterests = Array.isArray(user?.interests) && user.interests.length > 0 ? user.interests : ["Music", "Art", "Gaming", "Fitness"];

  const refreshProfile = async () => {
    if (user?.isDummy) return;
    try {
      const response = await getProfile();
      if (response?.status === 200 || response?.status === 201) {
        setUserData(response?.data?.user);
      }
    } catch {
      // ignore
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
          mt: `${PROFILE_OVERLAP + 8}px`,
        }}
      >
        <Box
          sx={{
            bgcolor: "neutral.darkBrown",
            width: "100%",
            borderRadius: "25px",
            position: "relative",
            pt: `${PROFILE_OVERLAP}px`,
            pb: 2,
            px: 1.5,
            height: 246,
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: `-${PROFILE_OVERLAP}px`,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              lineHeight: 0,
            }}
          >
            <Box
              component="img"
              src={profileImageSrc}
              alt={displayName}
              sx={{
                display: "block",
                width: PROFILE_SIZE,
                height: PROFILE_SIZE,
                borderRadius: "50%",
                border: `${PROFILE_BORDER}px solid #FF1572`,
                objectFit: "cover",
                bgcolor: "#fff",
                boxSizing: "border-box",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1.15fr 1fr",
              columnGap: 0.5,
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Box>
              <Typography fontSize={12} color="text.white" fontWeight={600}>
                {user?.followersCount || 0}
              </Typography>
              <Typography fontSize={12} color="text.halfWhite">
                Followers
              </Typography>
            </Box>
            <Box sx={{ px: 0.25, minWidth: 0 }}>
              <Typography
                fontSize={13}
                color="neutral.deepPink"
                fontWeight={600}
                sx={{ lineHeight: 1.3 }}
              >
                {displayName}
              </Typography>
              <Typography
                fontSize={11}
                color="text.halfWhite"
                noWrap
                title={userHandle}
                sx={{
                  lineHeight: 1.3,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userHandle}
              </Typography>
            </Box>
            <Box>
              <Typography fontSize={12} color="text.white" fontWeight={600}>
                {user?.followingCount || 0}
              </Typography>
              <Typography fontSize={12} color="text.halfWhite">
                Following
              </Typography>
            </Box>
          </Box>

          {user?.tagLine && (
            <Box textAlign="center" mt={1.5}>
              <Typography color="primary.white" fontSize={12}>
                {user?.tagLine}
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="center" mt={4.5}>
            <CustomButton
              onClick={() => navigate("/profile")}
              title="My Profile"
              radius="13px"
              width="90%"
              sx={{
                backgroundColor: "neutral.deepPink",
                color: "primary.main",
                py: 0.75,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box mt={1}>
        <CustomButton
          title="Market Place"
          width="100%"
          sx={{
            backgroundColor: "background.darkBrown",
            borderRadius: "30px",
            color: "primary.white",
          }}
          onClick={() => navigate("/market-place")}
        />
      </Box>

      {userInterests.length > 0 && (
        <Box mt={2}>
          <Typography color="text.darkBrown" fontSize={18}>
            Interests
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {userInterests.map((interest) => (
              <Box
                key={normalizeInterestValue(interest)}
                sx={{
                  flex: {
                    xs: "1 1 100%",
                    md: "1 1 calc(50% - 4px)",
                  },
                  minWidth: { md: "calc(50% - 4px)" },
                }}
              >
                <CustomButton
                  title={getInterestLabel(interest)}
                  width="100%"
                  sx={{
                    backgroundColor: "background.darkBrown",
                    borderRadius: "15px",
                    color: "primary.white",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Profile;
