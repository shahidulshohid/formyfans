import { Grid, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import useActiveChatStore from "../../zustand/activeChatStore";
import ConversationComponent from "./conversation";
import MessageComponent from "./message";

const ChatComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { activeChat } = useActiveChatStore();

  return (
    <Grid container sx={{ height: "calc(100vh - 120px)" }} spacing={2}>
      {!isMobile ? (
        <>
          <Grid size={{ xs: 12, md: 3.5 }} sx={{ height: "100%" }}>
            <ConversationComponent />
          </Grid>
          <Grid size={{ xs: 12, md: 8.5 }} sx={{ height: "100%" }}>
            <MessageComponent />
          </Grid>
        </>
      ) : (
        <>
          {!activeChat ? (
            <Grid size={{ xs: 12, md: 3.5 }} sx={{ height: "100%" }}>
              <ConversationComponent />
            </Grid>
          ) : (
            <Grid size={{ xs: 12, md: 3.5 }} sx={{ height: "100%" }}>
              <MessageComponent />
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

export default ChatComponent;
