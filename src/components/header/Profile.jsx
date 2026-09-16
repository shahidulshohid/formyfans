import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import useUserStore from "../../zustand/userUserStore";
import {
  getDisplayName,
  getUserHandle,
  getUserProfileImage,
} from "../../utils/helper";
import { useCallback, useState } from "react";
import {
  Person2Outlined as Person2OutlinedIcon,
  AttachMoneyOutlined as AttachMoneyOutlinedIcon,
  PersonAddAltOutlined as PersonAddAltOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  LogoutOutlined as LogoutOutlinedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getFullS3Url } from "../../utils/s3Helper";

const useStyle = {
  button: {
    backgroundColor: "colors.white",
    borderRadius: "24px",
    textTransform: "capitalize",
    gap: 1,
    border: "1px solid",
    borderColor: "divider",
    maxWidth: "160px",
    padding: { xs: "4px", md: "4px 6px" },
    minWidth: { xs: "0px", sm: "64px" },
  },
  paper: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 280,
    bgcolor: "background.paper",
    borderRadius: 4,
    boxShadow: "0px 12px 32px rgba(0,0,0,0.12)",
    zIndex: 1200,
  },
};

export const Profile = () => {
  const navigate = useNavigate();
  const { user, clearUserData } = useUserStore();
  const displayName = getDisplayName(user) || "User";
  const userHandle = getUserHandle(user);
  const profileImageSrc = getUserProfileImage(user);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };
  const handleProfileMenuClose = () => {
    setProfileMenuOpen(false);
  };

  const handleHome = () => navigate("/home");
  const handleProfile = () => navigate(`/${user?.username}/all-posts`);
  const handleSettings = () => navigate("/settings");
  const handleStar = () => navigate("/category");
  const handleMessage = () => navigate("/chat");

  const handleLogout = useCallback(() => {
    clearUserData();
    setProfileMenuOpen(false);
    navigate("/");
  }, [clearUserData, navigate]);

  const profileMenuItems = [
    {
      icon: <Person2OutlinedIcon />,
      label: "My profile",
      link: `/${user?.username}/all-posts`,
      onClick: handleProfile,
    },
    // {
    //   icon: <AttachMoneyOutlinedIcon />,
    //   label: "Earnings",
    //   subLabel: 1400,
    // },
    // {
    //   icon: <PersonAddAltOutlinedIcon />,
    //   label: "Subscribers",
    //   subLabel: 10,
    // },
    {
      icon: <SettingsOutlinedIcon />,
      label: "Settings",
      link: `settings`,
      onClick: handleSettings,
    },
    {
      icon: <LogoutOutlinedIcon />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];
  return (
    <ClickAwayListener onClickAway={handleProfileMenuClose}>
      <Box sx={{ position: "relative" }}>
        <Button
          disableRipple
          onClick={toggleProfileMenu}
          sx={{ ...useStyle.button }}
          
        >
          <Typography
            fontSize={"0.875rem"}
            noWrap
            fontWeight={500}
            color="text.primary"
            ml={0.5}
            display={{ xs: "none", sm: "block" }}
          >
            {displayName}
          </Typography>
          <Avatar
            src={getFullS3Url(profileImageSrc)}
            alt={displayName}
            sx={{ width: 30, height: 30 }}
          />
        </Button>

        {profileMenuOpen && (
          <Paper elevation={8} sx={{ ...useStyle.paper }}>
            <Stack p={1.5} direction={"row"} gap={1.5} alignItems={"center"}>
              <Avatar
                src={getFullS3Url(profileImageSrc)}
                alt={displayName}
                sx={{ width: 45, height: 45 }}
              />
              <Box>
                <Typography fontSize={"1rem"} fontWeight={600} noWrap>
                  {displayName}
                </Typography>
                <Typography fontSize={"0.875rem"} color="text.secondary" noWrap>
                  {userHandle}
                </Typography>
              </Box>
            </Stack>
            <Divider />
            <List disablePadding sx={{ p: 0.5 }}>
              {profileMenuItems.map((item) => (
                <ListItemButton
                  key={item.label}
                  onClick={item.onClick}
                  sx={{
                    borderRadius: 1,

                    "& .MuiSvgIcon-root": {
                      fontSize: "1.325rem",
                    },
                    "&:hover": {
                      backgroundColor: "colors.lavenderBlush",
                      "& .MuiTypography-body1": {
                        color: "colors.black",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: "35px",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                      >
                        <Typography
                          fontSize={"0.875rem"}
                          color="colors.mauveTaupe"
                        >
                          {item.label}
                        </Typography>
                        {item.subLabel && (
                          <Typography
                            fontSize={"0.875rem"}
                            color="colors.mauveTaupe"
                          >
                            {item.subLabel}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};
