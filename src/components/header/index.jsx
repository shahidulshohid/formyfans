import MenuIcon from "@mui/icons-material/Menu";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getDisplayName, getUserProfileImage } from "../../utils/helper";
import useUserStore from "../../zustand/userUserStore";

import Notification from "../../assets/icon/notification.svg";
import AvatorImage from "../../assets/icon/profile-image.svg";
import SaveIcon from "../../assets/icon/save-icon.svg";
import VideoIcon from "../../assets/icon/video.svg";
import ForMyFansLogo from "../../assets/images/home-page-logo.png";
import ProfileIncompleteAlert from "../profileIncompleteAlert";

import MessageIcon from "../../assets/icon/comment.svg";
import HomeIcon from "../../assets/icon/home-icon.svg";
import ProfileIcon from "../../assets/icon/profile-icon.svg";
import SettingsIcon from "../../assets/icon/setting.svg";
import StarIcon from "../../assets/icon/star.svg";
import useConversationStore from "../../zustand/conversationStore";

import { DUMMY_USER } from "../../constants/dummyAuth";

const Header = ({ Children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();

  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const rawUser = useUserStore((s) => s.user);
  const user = rawUser || DUMMY_USER;
  const clearUserData = useUserStore((s) => s.clearUserData);
  const displayName = getDisplayName(user) || "Shahidul Islam";
  const profileImageSrc = getUserProfileImage(user) || AvatorImage;
  const { conversations } = useConversationStore();

  const unreadMessageCount = (conversations || []).reduce((acc, conversation) => {
    return acc + (conversation?.unreadMessagesCount?.[user?._id] || 0);
  }, 0);

  // Route change active tab
  useEffect(() => {
    if (user?.username && username === user.username) {
      setActiveTab("profile");
      return;
    }

    switch (location.pathname) {
      case "/home":
        setActiveTab("home");
        break;
      case "/profile":
        setActiveTab("profile");
        break;
      case "/settings":
        setActiveTab("settings");
        break;
      case "/category":
        setActiveTab("star");
        break;
      case "/chat":
        setActiveTab("message");
        break;
      default:
        setActiveTab("");
    }
  }, [location.pathname, user?.username, username]);

  // Navigation
  const handleHome = () => navigate("/home");
  const handleProfile = () => navigate(`/${user?.username}/all-posts`);
  const handleSettings = () => navigate("/settings");
  const handleStar = () => navigate("/category");
  const handleMessage = () => navigate("/chat");

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
    setMobileMenuOpen(false);
  };

  const handleLogout = useCallback(() => {
    clearUserData();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  }, [clearUserData, navigate]);

  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NavIcon = ({ icon, tabName, onClick }) => {
    const isActive = activeTab === tabName;

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        onClick={onClick}
        sx={{ cursor: "pointer" }}
      >
        <img
          src={icon}
          style={{
            width: "22px",
            filter: isActive
              ? "invert(29%) sepia(96%) saturate(3300%) hue-rotate(320deg)"
              : "none",
          }}
        />

        {isActive && (
          <Box
            sx={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 21, 114, 1)",
              mt: "4px",
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        py={1}
      >
        <Box
          display="flex"
          gap={{ xs: "10px", md: "25px" }}
          alignItems="center"
        >
          <Box
            onClick={handleHome}
            component="img"
            src={ForMyFansLogo}
            sx={{
              cursor: "pointer",
              width: {
                xs: "70px",
                sm: "90px",
                md: "100px",
              },
            }}
          />
          {/* <Box display={{ xs: "block", md: "block" }} justifyItems={"center"}>
            <CustomInput
              placeholder="Search"
              fullWidth
              sx={{
                "& .MuiInputBase-input": {
                  padding: { xs: "10px 20px", md: "10px 30px" },
                },
              }}
            />
          </Box> */}
        </Box>
        <Box display={{ xs: "none", md: "flex" }} gap="35px">
          <NavIcon icon={HomeIcon} tabName="home" onClick={handleHome} />
          <NavIcon
            icon={ProfileIcon}
            tabName="profile"
            onClick={handleProfile}
          />
          <Badge badgeContent={unreadMessageCount} color="secondary">
            <NavIcon
              icon={MessageIcon}
              tabName="message"
              onClick={handleMessage}
            />
          </Badge>
          <NavIcon
            icon={SettingsIcon}
            tabName="settings"
            onClick={handleSettings}
          />
          <NavIcon icon={StarIcon} tabName="star" onClick={handleStar} />
        </Box>
        <Box display={{ xs: "block", md: "none" }}>
          <IconButton onClick={toggleMobileMenu}>
            <MenuIcon sx={{ color: "background.deepPink", fontSize: "30px" }} />
          </IconButton>
        </Box>

        {/* RIGHT SIDE */}
        <Box
          display={{ xs: "none", md: "flex" }}
          gap="20px"
          alignItems="center"
        >
          {/* <img src={SaveIcon} style={{ cursor: "pointer" }} />
          <img src={VideoIcon} style={{ cursor: "pointer" }} /> */}
          <img
            src={Notification}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/notifications")}
          />

          <Box sx={{ position: "relative" }}>
            <Box
              display="flex"
              alignItems="center"
              gap="10px"
              onClick={toggleProfileMenu}
              sx={{ cursor: "pointer" }}
            >
              <Typography fontWeight={700} fontSize="16px">
                {displayName}
              </Typography>
              <Avatar
                src={profileImageSrc}
                alt={displayName}
                sx={{
                  width: 40,
                  height: 40,
                  border: "5px solid rgba(255, 21, 114, 1)",
                }}
              />
            </Box>

            {profileMenuOpen && (
              <Box
                sx={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: 140,
                  bgcolor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(94, 19, 33, 0.12)",
                  overflow: "hidden",
                  zIndex: 10000,
                }}
              >
                <Button
                  fullWidth
                  onClick={handleLogout}
                  sx={{
                    py: 1.25,
                    color: "#FF1572",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: 15,
                    borderRadius: 0,
                    "&:hover": { bgcolor: "rgba(255, 21, 114, 0.08)" },
                  }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <ProfileIncompleteAlert />

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <Box
          display={{ xs: "flex", md: "none" }}
          flexDirection="column"
          alignItems="center"
          gap="20px"
          mt={2}
          p={2}
          bgcolor="#fff"
          borderRadius="12px"
          position="absolute"
          right="10px"
          top="70px"
          boxShadow="0 4px 10px rgba(0,0,0,0.2)"
          zIndex={9999}
          width={{ xs: 160, sm: 180 }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="8px"
          >
            <Avatar
              src={profileImageSrc}
              alt={displayName}
              sx={{
                width: 50,
                height: 50,
                border: "3px solid rgba(255, 21, 114, 1)",
              }}
            />

            <Typography color="black" fontWeight={600}>
              {displayName}
            </Typography>
            <Button
              fullWidth
              onClick={handleLogout}
              sx={{
                mt: 0.5,
                color: "#FF1572",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Logout
            </Button>
          </Box>
          <NavIcon icon={HomeIcon} tabName="home" onClick={handleHome} />
          <NavIcon
            icon={ProfileIcon}
            tabName="profile"
            onClick={handleProfile}
          />
          <NavIcon
            icon={MessageIcon}
            tabName="message"
            onClick={handleMessage}
          />
          <NavIcon
            icon={SettingsIcon}
            tabName="settings"
            onClick={handleSettings}
          />
          <NavIcon icon={StarIcon} tabName="star" onClick={handleStar} />
        </Box>
      )}

      <Box>{Children}</Box>
    </Container>
  );
};

export default Header;
