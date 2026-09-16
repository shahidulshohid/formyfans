import { Box, Tab, Tabs } from "@mui/material";
import useSearchKeyStore from "../../zustand/searchKeyStore";
import UserFollowers from "./followers";
import UserFollowing from "./following";

const FollowersAndFollowing = () => {
  const { profile_followers_following_tab, setProfileFollowersFollowingTab } =
    useSearchKeyStore();

  const handleChange = (event, newValue) => {
    setProfileFollowersFollowingTab(newValue);
  };

  const renderTabsButton = () => {
    return (
      <Box
        width={"100%"}
        bgcolor={"background.lightGray"}
        borderRadius={"50px"}
      >
        <Tabs
          value={profile_followers_following_tab}
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
          <Tab label="Followers" />
          <Tab label="Following" />
        </Tabs>
      </Box>
    );
  };

  const renderTabContent = () => {
    return (
      <Box mt={2}>
        {profile_followers_following_tab === 0 && <UserFollowers />}
        {profile_followers_following_tab === 1 && <UserFollowing />}
      </Box>
    );
  };

  return (
    <Box>
      {renderTabsButton()}
      {renderTabContent()}
    </Box>
  );
};

export default FollowersAndFollowing;
