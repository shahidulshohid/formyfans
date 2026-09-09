import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { getInitialName } from "../../utils/helper";
import useUserStore from "../../zustand/userUserStore";

const SettingSection = () => {
  // Get User Data from Zustand
  const { user } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const clearUserData = useUserStore((state) => state.clearUserData);

  const handleLogout = () => {
    clearUserData();
    navigate("/");
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/settings/account") return "Account";
    if (path === "/settings/password") return "Change Password";
    if (path === "/settings/privacy") return "Privacy and Security";
    if (path === "/settings/become-creator") return "Become a Creator";
    if (path === "/settings/billing") return "Manage Billing";
    if (path === "/settings/set-price") return "Set Subscription Price";
    if (path === "/settings/activity-log") return "Activity log";
    if (path === "/settings/logout") return "Log Out";
    return "Account";
  };

  const showBillingTab =
    user?.role === "creator" && user?.isInternalUser === false;

  const showSetSubscriptionPriceTab = user?.role === "creator";

  const showBecomeCreatorTab = user?.role === "user";

  const activeTab = getActiveTab();
  const settingsData = [
    {
      icon: AccountCircleOutlinedIcon,
      iconName: "Account",
      pathName: "/settings/account",
    },
    {
      icon: LockOutlinedIcon,
      iconName: "Change Password",
      pathName: "/settings/password",
    },
    {
      icon: HistoryOutlinedIcon,
      iconName: "Activity log",
      pathName: "/settings/activity-log",
    },
    {
      icon: SecurityOutlinedIcon,
      iconName: "Privacy and Security",
      pathName: "/settings/privacy",
    },
    ...(showBecomeCreatorTab
      ? [
          {
            icon: AccountCircleOutlinedIcon,
            iconName: "Become a Creator",
            pathName: "/settings/become-creator",
          },
        ]
      : []),
    ...(showBillingTab
      ? [
          {
            icon: CreditCardOutlinedIcon,
            iconName: "Manage Billing",
            pathName: "/settings/billing",
          },
        ]
      : []),
    ...(showSetSubscriptionPriceTab
      ? [
          {
            icon: SubscriptionsIcon,
            iconName: "Set Subscription Price",
            pathName: "/settings/set-price",
          },
        ]
      : []),
    {
      icon: LogoutOutlinedIcon,
      iconName: "Log Out",
      pathName: "/settings/logout",
    },
  ];

  return (
    <Box bgcolor={"background.darkBrown"} p={2} borderRadius={"10px"}>
      <Box display={"flex"} justifyContent={"center"} mt={3}>
        <Box>
          {/* <img src={user?.profileImage } style={{ borderRadius: "50%", width: "100px", height: "100px", border: "8px solid rgba(255, 21, 114, 1)" }} /> */}

          <Avatar
            src={user?.image}
            sx={{
              width: "100px",
              height: "100px",
              border: "8px solid rgba(255, 21, 114, 1)",
            }}
          >
            {getInitialName(user)}
          </Avatar>
        </Box>
      </Box>
      <List
        dense
        disablePadding
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {settingsData.map((item) => {
          const isActive = activeTab === item.iconName;
          const Icon = item.icon;

          return (
            <ListItem dense key={item.pathName} disablePadding>
              <ListItemButton
                onClick={() =>
                  item.iconName === "Log Out"
                    ? handleLogout()
                    : navigate(item.pathName)
                }
                sx={{
                  borderRadius: "20px",
                  gap: 2,
                  py: 1.5,
                  backgroundColor: isActive
                    ? "rgba(255, 21, 114, 1)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "rgba(255, 21, 114, 1)"
                      : "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 30, color: "common.white" }}>
                  <Icon sx={{ fontSize: 25 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.iconName}
                  primaryTypographyProps={{
                    color: "text.white",
                    fontSize: 18,
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box p={1} mt={1} display={"flex"} justifyContent={"flex-start"}>
        <Typography color="text.white" fontSize={"12px"} fontWeight={600}>
          {moment().format("ddd M/D/YY [@] h:mm A")}
        </Typography>
      </Box>
    </Box>
  );
};

export default SettingSection;
