import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import CustomButton from "../../components/cutomButon";
import EarningsChart from "./chart";
import useUserStore from "../../zustand/userUserStore";
import { useState } from "react";
import Photos from "./photos";
import Videos from "./videos";

const MidSection = () => {
  // Get User Data from User Store
  const { user } = useUserStore();
  // Store Active Tab
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderCoverImage = () => {
    if (user?.coverImage) {
      return (
        <Box
          component="img"
          src={user?.coverImage}
          alt="cover image"
          width={"100%"}
          height={{ xs: "auto", md: "300px" }}
          borderRadius={"40px"}
        />
      );
    }
    return (
      <Box
        width={"100%"}
        height={{ xs: 200, md: 300 }}
        bgcolor={"primary.main"}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        borderRadius={"40px"}
        overflow={"hidden"}
      >
        <Typography variant="body1" color="text.white" fontWeight={400}>
          No cover image found
        </Typography>
      </Box>
    );
  };

  const renderTabsButton = () => {
    return (
      <Box
        mt={2}
        width={"100%"}
        bgcolor={"background.lightGray"}
        borderRadius={"50px"}
        p={1}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          sx={{
            "& .MuiTabs-flexContainer": {
              justifyContent: "space-around",
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTab-root": {
              fontWeight: 600,
              borderRadius: "50px",
            },
          }}
        >
          <Tab label="Photos" />
          <Tab label="Videos" />
          <Tab label="Live Streams" />
        </Tabs>
      </Box>
    );
  };

  const renderTabContent = () => {
    return (
      <Box>
        {activeTab === 0 && <Photos />}
        {activeTab === 1 && <Videos />}
        {/* {activeTab === 2 && <LiveStreams />} */}
      </Box>
    );
  };

  return (
    <Box mt={1}>
      {renderCoverImage()}
      {renderTabsButton()}
      {renderTabContent()}

      <Box display={"flex"} justifyContent={"space-between"} mt={2}>
        <Box>
          <Typography
            fontSize={{ xs: "16px", md: "28px" }}
            color="text.deepPink"
            fontWeight={600}
          >
            Your Earnings
          </Typography>
        </Box>
        <Box>
          <CustomButton
            title="Monitized Your Post"
            sx={{
              py: { xs: "3px" },
              px: { xs: "15px", md: "30px" },
              borderRadius: "20px",
              fontSize: "15px",
              fontWeight: 600,
              color: "primary.white",
            }}
          />
        </Box>
      </Box>
      <Box>
        <EarningsChart />
      </Box>
    </Box>
  );
};

export default MidSection;
