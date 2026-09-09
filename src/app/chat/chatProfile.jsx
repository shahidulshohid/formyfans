import { Box, Typography } from "@mui/material";
import PhoneIcon from "../../assets/icon/phone.svg";
import VideoIcon from "../../assets/icon/chat-video-icon.svg";
import MessageInfoIcon from "../../assets/icon/info.svg";
import Aman from "../../assets/icon/aman.svg";
import UserChat from "./userChat";
import ChatWindow from "./userChat";
import ChatScreen from "./userChat";

const ChatSection = () => {
  return (
    <>
      <Box
        sx={{
          bgcolor: "background.deepPink",
          borderRadius: "999px",
          px: 10,
          py: 1.2,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 60,
            top: -12,
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "1px solid rgba(94, 19, 33, 1)",
            overflow: "hidden",
          }}
        >
          <img
            src={Aman}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        <Box display="flex" alignItems="center" ml="60px">
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "text.white",
                lineHeight: 1.2,
              }}
            >
              Beast
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                color: "text.white",
              }}
            >
              Active 1 min ago.
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap="50px">
          <img src={PhoneIcon} style={{ width: 18 }} />
          <img src={VideoIcon} style={{ width: 18 }} />
          <img src={MessageInfoIcon} style={{ width: 18 }} />
        </Box>
      </Box>
      <Box>
        <ChatScreen />
      </Box>
    </>
  );
};

export default ChatSection;
