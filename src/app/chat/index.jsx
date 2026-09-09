import { Box, Container } from "@mui/material";
import React from "react";
import ChatComponent from "../../components/chat";
import Header from "../../components/header";

const Chat = () => {
  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <ChatComponent />
      </Container>
    </Box>
  );
};

export default Chat;
