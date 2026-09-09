import { Box } from "@mui/material";
import ConversationHeader from "./Header";
import ConversationList from "./List";

const ConversationComponent = () => {
  return (
    <Box
      border={"1px solid"}
      borderColor={"divider"}
      height={"100%"}
      display={"flex"}
      flexDirection={"column"}
      overflow={"hidden"}
      bgcolor={"primary.main"}
      borderRadius={"10px"}
    >
      <ConversationHeader />

      <Box
        mt={1}
        flex={1}
        overflow={"hidden"}
        display={"flex"}
        flexDirection={"column"}
      >
        <ConversationList />
      </Box>
    </Box>
  );
};

export default ConversationComponent;
