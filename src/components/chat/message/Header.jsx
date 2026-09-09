import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  getDisplayName,
  getInitialName,
  getUserProfileImage,
} from "../../../utils/helper";
import useActiveChatStore from "../../../zustand/activeChatStore";
import useMessageStore from "../../../zustand/messageStore";

const MessageHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { activeChat, setActiveChat } = useActiveChatStore();
  const { insideMessages, loading, error } = useMessageStore();

  // Last Message
  const lastMessage = insideMessages[insideMessages.length - 1];
  const userProfileImage = getUserProfileImage(activeChat?.participant?.sender);
  const userInitialName = getInitialName(
    activeChat?.participant?.sender || { firstName: "", lastName: "" },
  );
  const userDisplayName = getDisplayName(
    activeChat?.participant?.sender || { firstName: "", lastName: "" },
  );

  return (
    <Stack
      gap={2}
      direction={"row"}
      alignItems={"center"}
      borderBottom={"1px solid #E1E7EF"}
      p={1.5}
      // bgcolor={grey[50]}
      bgcolor={"secondary.main"}
    >
      {isMobile && (
        <IconButton
          onClick={() => {
            setActiveChat(null);
          }}
        >
          <ArrowBackIcon sx={{ color: "black" }} />
        </IconButton>
      )}
      <Avatar
        src={userProfileImage}
        sx={{
          width: 45,
          height: 45,
          backgroundColor: "primary.main",
        }}
      >
        {userInitialName}
      </Avatar>
      <Box>
        <Typography variant="body1" fontWeight={600} color={"text.white"}>
          {userDisplayName}
        </Typography>
        <Typography variant="body2" color={"text.primary"}>
          {/* {activeChat?.lastMessage?.message} */}
          {lastMessage?.message || lastMessage?.attachment?.name}
        </Typography>
      </Box>
    </Stack>
  );
};

export default MessageHeader;
