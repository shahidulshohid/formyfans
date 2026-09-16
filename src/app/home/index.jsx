import { Box, Grid } from "@mui/material";
import Header from "../../components/header";
import StoryRow from "../../components/storyRow";
import ProfileSection from "./profileSection";
import StreamingFollowerSuggestions from "./streamingFollowerSuggestions";
import PostSection from "./post";

const HEADER_HEIGHT = 80; 

const HomePage = () => {
  return (
    <Box>
      <Header />

      <Box maxWidth="1400px" mx="auto" px={2}>
        <Grid container spacing={2}>
          <Grid
            item
            size={{ xs: 12, md: 2.5 }}
            sx={{
              display: { xs: "none", md: "block" },
              position: { md: "sticky" },
              top: { md: `${HEADER_HEIGHT}px` },
              alignSelf: "flex-start",
              height: { md: `calc(100vh - ${HEADER_HEIGHT}px)` },
              overflowY: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <ProfileSection />
          </Grid>

          <Grid item size={{ xs: 12, md: 9.5, lg: 6.5 }}>
            <Box>
              <StoryRow />
            </Box>
            <Box>
              <PostSection />
            </Box>
          </Grid>

          <Grid
            item
            size={{ xs: 12, lg: 3 }}
            sx={{
              display: { xs: "none", md: "none", lg: "block" },
              position: { lg: "sticky" },
              top: { lg: `${HEADER_HEIGHT}px` },
              alignSelf: "flex-start",
              height: { lg: `calc(100vh - ${HEADER_HEIGHT}px)` },
              overflowY: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <StreamingFollowerSuggestions />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;