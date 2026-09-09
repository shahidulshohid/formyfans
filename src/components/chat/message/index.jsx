import { Box } from "@mui/material";
import { useContext } from "react";
// import ChatBgImage from "../../../assets/images/chat_background.jpg";
import { SocketContext } from "../../../context/SocketContext";
import useActiveChatStore from "../../../zustand/activeChatStore";
import EmptyChat from "./Empty";
import MessageFooter from "./Footer";
import MessageHeader from "./Header";
import MessageBody from "./Message";

const MessageComponent = () => {
  const socket = useContext(SocketContext);
  const { activeChat } = useActiveChatStore();

  if (!activeChat) {
    return (
      <Box
        border={"1px solid"}
        borderColor="divider"
        height={"100%"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        bgcolor={"primary.main"}
        borderRadius={"10px"}
      >
        <EmptyChat />
      </Box>
    );
  }

  // useEffect(() => {
  //   if (activeChat) {
  //     dispatch(fetchInsideMessage(activeChat?.conversationId));
  //   }
  // }, [activeChat]);

  return (
    <Box
      border="1px solid"
      borderColor="divider"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      position="relative"
      overflow="hidden"
      borderRadius={"10px"}
    >
      {/* Background layer */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        sx={{
          // backgroundImage: `url(${ChatBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.08,
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Box
        position="relative"
        zIndex={1}
        height="100%"
        display="flex"
        flexDirection="column"
      >
        <MessageHeader />
        <MessageBody socket={socket} />
        <MessageFooter socket={socket} />
      </Box>
    </Box>
  );
};

export default MessageComponent;
