import { Box, Container, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfileByUsername } from "../../api/modules/profile";
import Header from "../../components/header";
import ProfileHeader from "./profile";
import UserFeeds from "./userFeeds";
import FollowersAndFollowing from "./followersAndFollowing";
import useUserStore from "../../zustand/userUserStore";
import { USER_ROLES } from "../../components/productForm/constants";
// import Creators from "./creators";
// import Suggestion from "./suggestion";

const ViewProfile = () => {
  // Get Username from URL
  const { username } = useParams();
  // State to store profile data
  const [profileData, setProfileData] = useState(null);
  // State to store loading
  const [loading, setLoading] = useState({
    profile: true,
  });
  // Get User Data from User Store
  const { user } = useUserStore();

  const isOwnProfile = username === user?.username;

  // Function to get profile by username
  const handleGetProfileByUsername = async (username) => {
    try {
      const response = await getProfileByUsername(username);
      if (response.data.status === "success") {
        setProfileData(response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading((prev) => ({
        ...prev,
        profile: false,
      }));
    }
  };

  // Effect to get profile by username
  useEffect(() => {
    if (!username) return;
    handleGetProfileByUsername(username);
  }, [username]);

  return (
    <Box>
      <Header />
      <Box>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ProfileHeader
                isLoading={loading}
                profileData={profileData}
                setProfileData={setProfileData}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <UserFeeds />
            </Grid>
            {/* {isOwnProfile && (
              <Grid
                size={{ xs: 12, md: 3.5 }}
                display={{ xs: "none", md: "flex" }}
              >
                <FollowersAndFollowing />
              </Grid>
            )} */}

            {/* <Grid item size={{ xs: 12, md: 3.5 }}>
              <Suggestion />
              <Creators />
            </Grid> */}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default ViewProfile;
