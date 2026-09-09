import { Box, Container, Grid } from "@mui/material";
import Header from "../../components/header";
import StoryRow from "../../components/storyRow";
import AiContentBanner from "../../components/aiContentBanner";
import LiveStreaming from "./LiveStreaming";
import MessageSection from "./messageSection";
import Profile from "./profile";

const HomePage = () => {


  return (
    <Box>
      <Header />
      {/* <Container maxWidth="sm"> */}
      <Container maxWidth="sm">
        <StoryRow />
        <Box sx={{ mt: 2 }}>
          <AiContentBanner />
        </Box>
      </Container>

      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, md: 3 }}>
            <Box>
              <Profile />
            </Box>
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Box>
              <MessageSection />
            </Box>
          </Grid>
          <Grid item size={{ xs: 12, md: 3 }}>
            <Box>
              <LiveStreaming />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
