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
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import useConversationStore from "../../zustand/conversationStore";
import useUserStore from "../../zustand/userUserStore";
import { useContext, useState } from "react";
import {
  formatChatTime,
  formatTime,
  getDisplayName,
  getInitialName,
  getUserProfileImage,
  modifyConversations,
} from "../../utils/helper";
import useActiveChatStore from "../../zustand/activeChatStore";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { MessageCircle } from "lucide-react";
import { getFullS3Url } from "../../utils/s3Helper";

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
  chip: {
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
  },
};

export const Messages = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const socket = useContext(SocketContext);
  const { conversations, loading, error } = useConversationStore();
  const { activeChat, setActiveChat } = useActiveChatStore();
  const [messageMenuOpen, setMessageMenuOpen] = useState(false);

  const modifiedConversations = modifyConversations(conversations, user);

  const unreadMessageCount = conversations.reduce((acc, conversation) => {
    return acc + (conversation.unreadMessagesCount[user?._id] || 0);
  }, 0);

  const handleActiveChat = (conversation) => {
    navigate("/chat");
    setActiveChat(conversation);
  };

  const toggleMessageMenu = () => {
    setMessageMenuOpen((prev) => !prev);
  };

  const handleOpenMessageMenu = () => {
    setMessageMenuOpen(false);
  };

  const handleAllMarkAsReadMessages = () => {
    if (socket && user?._id) {
      socket.emit("mark_all_read", { userId: user?._id });
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
            Failed to load conversations. Please try again.
          </Typography>
        </Box>
      );
    }

    if (modifiedConversations.length === 1) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No conversations found
          </Typography>
        </Box>
      );
    }

    return (
      <List disablePadding dense sx={{ overflow: "hidden" }}>
        {modifiedConversations.slice(0, 5)?.map((item) => (
          <ListItemButton
            key={item._id}
            onClick={() => handleActiveChat(item)}
            sx={{
              overflow: "hidden",
              "&:hover": {
                backgroundColor: "colors.lavenderBlush",
              },
              "&.Mui-selected": {
                backgroundColor: "colors.lavenderBlush",
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={getFullS3Url(getUserProfileImage(item?.participant?.sender))}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: "secondary.light",
                }}
              >
                {getInitialName(
                  item?.participant?.sender || {
                    firstName: "",
                    lastName: "",
                  },
                )}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
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
                      fontWeight={
                        item?._id !== activeChat?._id &&
                        item?.unreadMessagesCount[user?._id] > 0
                          ? 600
                          : 500
                      }
                      color="text.primary"
                      noWrap
                    >
                      {getDisplayName(
                        item?.participant?.sender || {
                          firstName: "",
                          lastName: "",
                        },
                      )}
                    </Typography>
                    {item?._id !== activeChat?._id &&
                      item?.unreadMessagesCount[user?._id] > 0 && (
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
                    {formatTime(item.lastUpdated)}
                  </Typography>
                </Stack>
              }
              secondary={
                <Typography
                  fontSize={"0.75rem"}
                  fontWeight={400}
                  color="text.secondary"
                  noWrap
                >
                  {item.lastMessage?.message}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    );
  };

  return (
    <ClickAwayListener onClickAway={handleOpenMessageMenu}>
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={toggleMessageMenu}
          size="small"
          sx={{
            borderRadius: 1,
          }}
        >
          <Badge
            badgeContent={isNaN(unreadMessageCount) ? 0 : unreadMessageCount}
            color="secondary"
          >
          <MessageCircle />
          </Badge>
        </IconButton>
        {messageMenuOpen && (
          <Paper elevation={8} sx={{ ...useStyle.paper }}>
            <Stack
              p={1.5}
              direction={"row"}
              gap={1.5}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography fontSize={"1rem"} fontWeight={600} noWrap>
                Messages
              </Typography>
              {!loading && !error && modifiedConversations.length > 0 && (
                <Typography
                  fontSize={"0.75rem"}
                  fontWeight={600}
                  color="secondary.main"
                  onClick={handleAllMarkAsReadMessages}
                  sx={{ cursor: "pointer" }}
                >
                  Mark all read
                </Typography>
              )}
            </Stack>
            <Divider />
            {renderMenuBody()}
            <Divider />
            <Stack p={1.5}>
              <Chip
                variant="outlined"
                label="Open Inbox"
                clickable
                onClick={() => navigate("/chat")}
                sx={{
                  ...useStyle.chip,
                }}
              />
            </Stack>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};
