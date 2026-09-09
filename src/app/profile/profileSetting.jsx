import { Avatar, Box, Stack, Typography } from "@mui/material";
import ProfileImage from "../../assets/icon/profile-home-page.svg";
import CustomButton from "../../components/cutomButon";
import useUserStore from "../../zustand/userUserStore";
import {
  getDisplayName,
  getInitialName,
  getUserHandle,
  getUserProfileImage,
} from "../../utils/helper";
import { useNavigate } from "react-router-dom";

const ProfileSetting = () => {
  // Navigate Hook
  const navigate = useNavigate();
  // Get User Data from User Store
  const user = useUserStore((s) => s.user);
  // Get User Profile Image
  const profileImageSrc = getUserProfileImage(user);
  // Get Initial Name
  const initialName = getInitialName(user);
  // Get Display Name
  const displayName = getDisplayName(user);
  // Get User Handle
  const userHandle = getUserHandle(user);
  // Handle Change Password
  const handleChangePassword = () => {
    navigate("/settings");
  };

  return (
    <Stack alignItems="center" justifyContent="center">
      <Avatar
        src={profileImageSrc}
        alt={displayName}
        sx={{
          border: "15px solid",
          borderColor: "neutral.deepPink",
          width: "200px",
          height: "200px",
        }}
      >
        {initialName}
      </Avatar>

      <Typography
        mt={2}
        variant="body1"
        color="neutral.deepPink"
        fontWeight={700}
      >
        {displayName}
      </Typography>
      <Box
        display={"flex"}
        alignItems={"center"}
        gap={1}
        justifyContent="space-between"
        width="100%"
      >
        <Box
          height={"30px"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          bgcolor={"neutral.deepPink"}
          borderRadius={"15px"}
          px={1}
        >
          <Typography lineHeight={1} fontSize={"12px"} color="text.white">
            Followers
          </Typography>
          <Typography
            lineHeight={1}
            fontSize={"12px"}
            textAlign={"center"}
            color="text.white"
          >
            {user?.followersCount || 0}
          </Typography>
        </Box>

        <Typography fontSize={"14px"} color="text.darkBrown" noWrap>
          {userHandle}
        </Typography>

        <Box
          height={"30px"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          bgcolor={"neutral.deepPink"}
          borderRadius={"15px"}
          px={1}
        >
          <Typography lineHeight={1} fontSize={"12px"} color="text.white">
            Following
          </Typography>
          <Typography
            lineHeight={1}
            fontSize={"12px"}
            textAlign={"center"}
            color="text.white"
          >
            {user?.followingCount || 0}
          </Typography>
        </Box>
      </Box>

      <CustomButton
        title="Edit Profile"
        handleClickBtn={handleChangePassword}
        sx={{
          mt: 2,
          width: "100%",
          borderRadius: "50px",
          backgroundColor: "primary.main",
        }}
      />
    </Stack>
  );
};

export default ProfileSetting;
