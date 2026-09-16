import { Box, Stack, Typography } from "@mui/material";
import CustomInput from "../../cutomInput";
import useSearchKeyStore from "../../../zustand/searchKeyStore";
import SearchIcon from "@mui/icons-material/Search";

const ConversationHeader = () => {
  const { chat_search_value, setChatSearchValue } = useSearchKeyStore();
  return (
    <Box>
      <Stack
        p={1.5}
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography variant="h5" fontWeight={600} color={"secondary.main"}>
          Messages
        </Typography>
      </Stack>

      <Box px={1.5}>
        <CustomInput
          defaultStyle
          placeholder="Search for a chat"
          value={chat_search_value}
          onChange={(e) => setChatSearchValue(e.target.value)}
          InputStartIcon={<SearchIcon sx={{ color: "text.white", fontSize: 20 }} />}
          backgroundColor={"rgba(255, 80, 120, 1)"}
          color={"text.white"}
          borderRadius={"20px"}
        />
      </Box>
    </Box>
  );
};

export default ConversationHeader;
