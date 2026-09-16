import { Box, Typography } from "@mui/material";
import EditIcon from "../../assets/icon/edit.svg";
import EditIcon1 from "../../assets/icon/edit-icon1.svg";
import CustomInput from "../../components/cutomInput";
import SearchIcon from "../../assets/icon/search-brown.svg";
import FilterIcon from "../../assets/icon/filter-icon.svg";
import { Tabs, Tab } from "@mui/material";
import { useState } from "react";
import ChatList from "./chatList";

const MessageSection = () => {
  const [activeTab, setActiveTab] = useState("primary");
  return (
    <Box bgcolor={"background.darkBrown"} p={2} borderRadius={"20px"}>
      <Box display={"flex"} gap={"10px"} justifyContent={"space-around"}>
        <Box display={"flex"} gap={"10px"} alignItems={"center"}>
          <Box>
            <Typography
              color="text.deepPink"
              fontSize={"20px"}
              fontWeight={500}
            >
              Messages
            </Typography>
          </Box>
          <Box>
            <img src={EditIcon} />
          </Box>
        </Box>
        <Box display={"flex"} gap={"10px"} alignItems={"center"}>
          <Box>
            <Typography
              color="primary.white"
              fontSize={"20px"}
              fontWeight={500}
            >
              AI Chat
            </Typography>
          </Box>
          <Box>
            <img src={EditIcon1} />
          </Box>
        </Box>
      </Box>
      <Box mt={2} display={"flex"} justifyContent={"center"}>
        <CustomInput
          placeholder="Search Messages"
          InputStartIcon={
            <img
              src={SearchIcon}
              style={{
                filter: "brightness(0) invert(1)",
                width: 20,
              }}
            />
          }
          InputEndIcon={<img src={FilterIcon} />}
          fullWidth={"80%"}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.deepPink",
              borderRadius: "13px",
              "& fieldset": {
                border: "none",
              },
              "&.Mui-focused fieldset": {
                border: "none",
              },
              "&:hover fieldset": {
                border: "none",
              },
            },
            "& .MuiInputBase-input": {
              padding: "10px 16px",
              "&::placeholder": {
                color: "white",
                opacity: 1,
              },
            },
          }}
        />
      </Box>
      <Box
        display="flex"
        borderBottom="0.1px solid #fff"
        height={36}
        mt={4}
        width={"100%"}
      >
        {["primary", "general", "request"].map((tab) => (
          <Box
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: activeTab === tab ? 400 : 400,
              color:
                activeTab === tab
                  ? "rgba(255, 255, 255, 1)"
                  : "rgba(255, 255, 255, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              px: 1,
            }}
          >
            {tab === "request"
              ? "Request (2)"
              : tab[0].toUpperCase() + tab.slice(1)}

            {/* Indicator */}
            {activeTab === tab && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  height: "3px",
                  width: "100%",
                  backgroundColor: "#ff2b6e",
                  borderRadius: 2,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      <Box>
        <ChatList />
      </Box>
    </Box>
  );
};

export default MessageSection;
