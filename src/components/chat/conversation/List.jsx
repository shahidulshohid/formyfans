import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  formatChatTime,
  getDisplayName,
  getInitialName,
  getUserProfileImage,
  modifyConversations,
} from "../../../utils/helper";
import useActiveChatStore from "../../../zustand/activeChatStore";
import useConversationStore from "../../../zustand/conversationStore";
import useSearchKeyStore from "../../../zustand/searchKeyStore";
import useUserStore from "../../../zustand/userUserStore";

const useStyle = {
  list: {
    overflowY: "auto",
    flex: 1,
    height: "100%",
    pt: 0,
  },
};

const ConversationList = () => {
  // User Store
  const { user } = useUserStore();
  // Active Chat Store
  const { activeChat, setActiveChat } = useActiveChatStore();
  // Conversation Store
  const { conversations } = useConversationStore();
  // Search Key Store
  const { chat_search_value } = useSearchKeyStore();

  const handleActiveChat = (conversation) => {
    setActiveChat(conversation);
  };

  const modifiedConversations = modifyConversations(conversations, user);

  const filteredConversations = modifiedConversations.filter((conversation) => {
    const firstName = conversation?.participant?.sender?.firstName || "";
    const lastName = conversation?.participant?.sender?.lastName || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    return fullName.includes(chat_search_value.toLowerCase());
  });

  if (filteredConversations.length === 0) {
    return (
      <>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          flexDirection="column"
          gap={1}
        >
          <Typography variant="body1" color="text.secondary">
            No conversations found
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <List sx={useStyle.list}>
      {filteredConversations?.map((item) => (
        <ListItemButton
          key={item._id}
          onClick={() => handleActiveChat(item)}
          selected={item._id === activeChat?._id}
          sx={{
            "&:hover": {
              backgroundColor: "rgb(163 43 66)",
            },
            "&.Mui-selected": {
              backgroundColor: "rgb(163 43 66)",
            },
          }}
        >
          <ListItemAvatar>
            <Avatar
              src={getUserProfileImage(item?.participant?.sender)}
              sx={{
                width: 43,
                height: 43,
                border: "2px solid",
                borderColor: "secondary.main",
                backgroundColor: "secondary.main",
              }}
            >
              {getInitialName(
                item?.participant?.sender || { firstName: "", lastName: "" },
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
                <Typography
                  variant="body1"
                  color="text.white"
                  fontWeight={500}
                  noWrap
                >
                  {getDisplayName(
                    item?.participant?.sender || {
                      firstName: "",
                      lastName: "",
                    },
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.white"
                  fontWeight={400}
                  fontSize="12px"
                  noWrap
                >
                  {formatChatTime(item.lastUpdated)}
                </Typography>
              </Stack>
            }
            secondary={
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <Typography
                  variant="body2"
                  color="text.halfWhite"
                  fontWeight={400}
                  noWrap
                >
                  {item.lastMessage?.message}
                </Typography>
                {item?._id !== activeChat?._id &&
                  item?.unreadMessagesCount[user?._id] > 0 && (
                    <Box
                      borderRadius="50%"
                      bgcolor="secondary.main"
                      p={1}
                      width={14}
                      height={14}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="14px"
                      fontWeight={500}
                      color="text.white"
                    >
                      {item?.unreadMessagesCount[user?._id]}
                    </Box>
                  )}
              </Stack>
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
};

export default ConversationList;
