import { Box, Typography } from "@mui/material";
import Person1 from "../../assets/icon/person1.svg";
import Abhilash from "../../assets/images/laura.png";
import Aman from "../../assets/icon/aman.svg";
import George from "../../assets/icon/george.svg";
import MissBeauty from "../../assets/icon/beauty.svg";
import SmileIcon from "../../assets/icon/smile.svg";

const ChatList = () => {
  const chatList = [
    {
      icon: Person1,
      name: "Jhon",
      emoji: SmileIcon,
      message: "hi,good morning",
    },
    {
      icon: Abhilash,
      name: "Abhilash",
      emoji: SmileIcon,
      message: "hey where are you????",
    },
    {
      icon: Aman,
      name: "Aman",
      message: "hlo How do you do",
    },
    {
      icon: George,
      name: "George Jose",
      message: "Now im in france",
    },
    {
      icon: MissBeauty,
      name: "MissBeauty",
      message: "hi,good morning",
    },
  ];
  return (
    <Box mt={2} py={0}>
      {chatList.map((chat, index) => (
        <Box mt={5} key={index}>
          <Box display="flex" gap="25px">
            {/* Avatar */}
            <Box>
              <img
                src={chat.icon}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "rgba(255, 21, 114, 1)",
                  border: "4px solid rgba(255, 21, 114, 1)",
                }}
              />
            </Box>
            <Box>
              <Box display="flex" alignItems={"center"} gap={"3px"} mt={1.1}>
                <Box
                  fontWeight={600}
                  fontSize="17px"
                  letterSpacing={"1px"}
                  color={"primary.white"}
                >
                  {chat.name}
                </Box>
                {chat.emoji && (
                  <img src={chat.emoji} style={{ width: 16, height: 16 }} />
                )}
                <Box bgcolor={"background.deepPink"} borderRadius={"50%"}>
                  <Typography width={"7px"} height={"7px"}>
                    {chat.dot}
                  </Typography>
                </Box>
              </Box>
              <Box
                fontSize="12px"
                color="text.halfWhite"
                fontWeight={500}
                letterSpacing={"0.1px"}
              >
                {chat.message}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ChatList;
