import { Box, Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import Banner1 from "../../assets/images/animation-image1.png";
import Banner2 from "../../assets/images/animation-image2.png";
import Banner3 from "../../assets/images/animation-image3.png";
import Banner4 from "../../assets/images/animation-image4.png";
import BackgroundBanner from "../../assets/images/backgroundBanner.png";

const BANNERS = [Banner1, Banner2, Banner3, Banner4];
const BANNER_INTERVAL_MS = 4500;

export const AuthContainer = ({ children }) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, BANNER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container minHeight="100vh">
      <Grid size={{ xs: 12, md: 6 }}>
        <Box
          sx={{
            backgroundImage: `url(${BackgroundBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Container sx={{ maxWidth: "450px !important", py: 2 }}>
            {children}
          </Container>
        </Box>
      </Grid>

      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{ display: { xs: "none", md: "block" } }}
      >
        <Box
          sx={{
            position: "relative",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {BANNERS.map((banner, index) => (
            <Box
              key={banner}
              component="img"
              src={banner}
              alt=""
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                opacity: index === currentBanner ? 1 : 0,
                transform: index === currentBanner ? "scale(1)" : "scale(1.05)",
                transition: "opacity 1.4s ease-in-out, transform 4.5s ease-out",
                willChange: "opacity, transform",
              }}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};
