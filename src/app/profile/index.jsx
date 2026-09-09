import { Box, Container, Grid } from "@mui/material";
import { useEffect } from "react";
import { getProfile } from "../../api/modules/profile";
import Header from "../../components/header";
import useUserStore from "../../zustand/userUserStore";
import MidSection from "./midSection";
import ProfileSetting from "./profileSetting";

const Profile = () => {
  const { user, setUserData } = useUserStore();

  const backBtn = () => {
    window.history.back();
  };

  const refreshProfile = async () => {
    try {
      const response = await getProfile();
      if (response?.status === 200 || response?.status === 201) {
        setUserData(response?.data?.user);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    refreshProfile();
  }, [user?._id]);

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        {/* <Box mt={2} sx={{ cursor: "pointer" }}>
                    <img src={BackBtn} onClick={backBtn} />
                </Box> */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box textAlign={"center"}>
              <ProfileSetting />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5.5 }}>
            <MidSection />
          </Grid>
          {/* <Grid size={{ xs: 12, md: 3.5 }}>
            <FollowersAndFollowing />
          </Grid> */}
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
