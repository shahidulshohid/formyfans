import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { Home } from "./Home";
import { Logo } from "./Logo";
import { Messages } from "./Messages";
import { Notification } from "./Notifications";
import { Profile } from "./Profile";
import { CreativeCommons } from "lucide-react";
import useUserStore from "../../zustand/userUserStore";
import { USER_ROLES } from "../../components/productForm/constants";
import CreativeCommonsIcon from "../../assets/images/creator-hub-image.png";
import SidebarDrawer from "../sidebarDrawer";
import useSidebarDrawerStore from "../../zustand/sidebarDrawerStore";

const Header = ({ Children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavValue, setMobileNavValue] = useState("/home");
  const { user } = useUserStore();
  const { openDrawer, closeDrawer } = useSidebarDrawerStore();
  const isCreator = user?.role === "creator";

  useEffect(() => {
    closeDrawer();
    const path = location.pathname;

    if (path.startsWith("/home")) {
      setMobileNavValue("/home");
    } else if (path.startsWith("/category")) {
      setMobileNavValue("/category");
    } else if (path.startsWith("/market")) {
      setMobileNavValue("/market");
    } else if (path.startsWith("/chat")) {
      setMobileNavValue("/chat");
    } else if (path.startsWith(`/${user?.username}/all-posts`)) {
      setMobileNavValue(`/${user?.username}/all-posts`);
    } else {
      setMobileNavValue("/home");
    }
  }, [location.pathname]);

  const handleMobileNavChange = (event, newValue) => {
    setMobileNavValue(newValue);
    navigate(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 12 }}>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: "none",
          backgroundColor: "#fff0f5b3",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <Logo />
          <Box sx={{
            display: { xs: "flex", lg: "none" },
            justifyContent: "flex-end",
            width: "100%",
            mr: 1
          }}>
            <IconButton
              onClick={openDrawer}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack
            display={{ xs: "none", sm: "flex" }}
            direction={"row"}
            gap={{ xs: 1, sm: 1.5 }}
            alignItems="center"
            mr={1}
          >
            <Home />
            <Messages />
            <Notification />
            {isCreator && (
              <img
                src={CreativeCommonsIcon}
                color="#887E81"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                onClick={() =>
                  window.open(import.meta.env.VITE_CREATOR_HUB_URL, "_blank")
                }
              />
            )}

          </Stack>
          <Profile />

        </Toolbar>
      </AppBar>

      <Box
        display={{ xs: "block", sm: "none" }}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "#fff0f5b3",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <BottomNavigation
          showLabels
          value={mobileNavValue}
          onChange={handleMobileNavChange}
        >
          <BottomNavigationAction
            label="Feed"
            value="/home"
            icon={<HomeOutlinedIcon />}
          />
          <BottomNavigationAction
            label="Search"
            value="/category"
            icon={<SearchOutlinedIcon />}
          />
          <BottomNavigationAction
            label="Market"
            value="/market"
            icon={<AttachMoneyOutlinedIcon />}
          />
          <BottomNavigationAction
            label="Inbox"
            value="/chat"
            icon={<ChatBubbleOutlineOutlinedIcon />}
          />
          <BottomNavigationAction
            label="Profile"
            value={`/${user?.username}/all-posts`}
            icon={<PersonOutlineOutlinedIcon />}
          />
        </BottomNavigation>
      </Box>
      <SidebarDrawer />
    </Box>
  );
};

export default Header;
