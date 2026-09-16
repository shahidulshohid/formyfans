import { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import useNotificationStore from "../../zustand/notificationStore";
import useUserStore from "../../zustand/userUserStore";
import { useNavigate } from "react-router-dom";
import { formatChatTime, formatTime, getInitialName } from "../../utils/helper";
import { SocketContext } from "../../context/SocketContext";
import { markAllNotificationsRead } from "../../api/modules/notification";
import { toast } from "react-toastify";
import { Bell } from "lucide-react";

const useStyle = {
  paper: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 340,
    bgcolor: "background.paper",
    borderRadius: 4,
    boxShadow: "0px 12px 32px rgba(0,0,0,0.12)",
    zIndex: 1200,
  },
};

export const Notification = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const socket = useContext(SocketContext);
  const { notifications, loading, error, fetchNotifications, unreadCount, markAllReadLocally } =
    useNotificationStore();
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);



  const toggleNotificationMenu = async () => {
    const willOpen = !notificationMenuOpen;
    setNotificationMenuOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      markAllReadLocally(); 
      try {
        await markAllNotificationsRead();
      } catch (err) {
        console.error(err);
        fetchNotifications(); 
      }
    }
  };

  const handleCloseNotificationMenu = () => {
    setNotificationMenuOpen(false);
  };

  const handleAllMarkAsReadNotifications = async () => {
    try {
      const response = await markAllNotificationsRead();
      if (response.data?.status === "success") {
        fetchNotifications();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err?.message);
      toast.error("Something went wrong");
    }
  };

  // const handleAllMarkAsReadNotifications = () => {
  //   if (socket && user?._id) {
  //     socket.emit("mark_all_notifications_read", { userId: user._id });
  //   }
  // };

  const handleNotificationClick = (notification) => {
    setNotificationMenuOpen(false);
    const { type, targetId, meta } = notification;

    // Post engagement types that should open PostDetailDialog
    const postEngagementTypes = [
      "post_tagged",
      "comment_mentioned",
      "post_liked",
      "post_commented",
      "post_shared",
    ];

    if (postEngagementTypes.includes(type)) {
      // For post_commented, targetId is commentId, postId is in meta
      const postId = type === "post_commented" ? meta?.postId : targetId;
      if (postId) {
        navigate("/home", { state: { openPostId: postId } });
      }
    }
  };

  const renderMenuBody = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={24} color="secondary" />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={4}
          px={2}
        >
          <Typography variant="body2" color="error" align="center">
            Failed to load notifications. Please try again.
          </Typography>
        </Box>
      );
    }

    if (notifications.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No notifications yet
          </Typography>
        </Box>
      );
    }

    return (
      <List disablePadding dense sx={{ overflow: "hidden" }}>
        {notifications.slice(0, 5)?.map((item) => {
          // Post engagement types that should be clickable to open PostDetailDialog
          const postEngagementTypes = [
            "post_tagged",
            "comment_mentioned",
            "post_liked",
            "post_commented",
            "post_shared",
          ];
          const isClickable = postEngagementTypes.includes(item.type);
          return (
            <ListItemButton
              key={item._id}
              onClick={
                isClickable
                  ? () => handleNotificationClick(item)
                  : undefined
              }
              sx={{
                overflow: "hidden",
                cursor: isClickable ? "pointer" : "default",
                "&:hover": isClickable
                  ? { backgroundColor: "colors.lavenderBlush" }
                  : undefined,
              }}
            >
            <ListItemAvatar>
              <Avatar
                src={item?.sender?.image}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: "secondary.light",
                }}
              >
                {getInitialName(
                  item?.sender || { firstName: "", lastName: "" },
                )}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack
                  gap={1}
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={0.7}
                    flex={1}
                    minWidth={0}
                  >
                    <Typography
                      fontSize={"0.813rem"}
                      fontWeight={item.isRead ? 400 : 600}
                      color="text.primary"
                      noWrap
                    >
                      {item.title}
                    </Typography>
                    {!item.isRead && (
                      <Box
                        borderRadius="50%"
                        bgcolor="secondary.main"
                        width={6}
                        height={6}
                        flexShrink={0}
                      />
                    )}
                  </Stack>
                  <Typography
                    fontSize={"0.75rem"}
                    fontWeight={400}
                    color="text.secondary"
                    flexShrink={0}
                  >
                    {formatTime(item.createdAt)}
                  </Typography>
                </Stack>
              }
              secondary={
                <Typography fontSize="0.7rem" color="text.secondary" noWrap>
                  {item.message}
                </Typography>
              }
            />
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  return (
    <ClickAwayListener onClickAway={handleCloseNotificationMenu}>
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={toggleNotificationMenu}
          size="small"
          sx={{
            borderRadius: 1,
          }}
        >
          <Badge
            badgeContent={isNaN(unreadCount) ? 0 : unreadCount}
            color="secondary"
          >
           <Bell />
          </Badge>
        </IconButton>
        {notificationMenuOpen && (
          <Paper elevation={8} sx={{ ...useStyle.paper }}>
            <Stack
              p={1.5}
              direction={"row"}
              gap={1.5}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography fontSize={"1rem"} fontWeight={600} noWrap>
                Notifications
              </Typography>
            </Stack>
            <Divider />
            {renderMenuBody()}
            <Divider />
            <Stack p={1.5}>
              <Chip
                variant="outlined"
                label="View All"
                clickable
                onClick={() => navigate("/notifications")}
                sx={{
                  backgroundColor: "transparent",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  padding: 2,
                  color: "colors.black",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "colors.lavenderBlush",
                  },
                }}
              />
            </Stack>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};
