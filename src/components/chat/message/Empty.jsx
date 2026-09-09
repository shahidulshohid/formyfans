import { Box, Stack, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const EmptyChat = () => {
  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      height={"100%"}
      bgColor={"secondary.light"}
    >
      <Stack
        spacing={2}
        alignItems={"center"}
        sx={{
          opacity: 0.6,
        }}
      >
        <Box
          width={80}
          height={80}
          borderRadius={"50%"}
          bgcolor={"rgba(0, 0, 0, 0.04)"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <ChatBubbleOutlineIcon
            sx={{
              fontSize: 40,
              color: "text.white",

            }}
          />
        </Box>
        <Stack spacing={0.5} alignItems={"center"}>
          <Typography
            variant="h6"
            fontWeight={600}
            color="text.white"
            sx={{ fontSize: "1.1rem" }}
          >
            No chat selected
          </Typography>
          <Typography
            variant="body2"
            color="text.white"
            sx={{ fontSize: "0.875rem" }}
          >
            Select a conversation to start messaging
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EmptyChat;
