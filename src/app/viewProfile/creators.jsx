import { Box, Typography } from "@mui/material";
import ElipseIcon from "../../assets/icon/elipse.svg";
import CircleIcon from "../../assets/icon/circle.svg";
import CreatorImage from "../../assets/images/creator-image.png";
import CustomButton from "../../components/cutomButon";
const Creators = () => {
  return (
    <Box bgcolor={"background.darkBrown"} borderRadius={"20px"} p={2} mt={3}>
      <Box display={"flex"} gap={"40px"}>
        <Box>
          <Typography color="text.white" fontSize={"16px"} fontWeight={600}>
            Most Game Creators
          </Typography>
        </Box>
        <Box display={"flex"} gap={"3px"}>
          <img src={ElipseIcon} style={{ width: "20px" }} />
          <img src={CircleIcon} style={{ width: "20px" }} />
          <img src={CircleIcon} style={{ width: "20px" }} />
        </Box>
      </Box>
      <Box mt={1}>
        <img
          src={CreatorImage}
          style={{
            width: "100%",
            height: { xs: "auto", md: "300px" },
            borderRadius: "20px",
          }}
        />
      </Box>
      <Box mt={1}>
        <CustomButton
          title="Explore More"
          radius={"20px"}
          width={"100%"}
          height={"40px"}
          sx={{ color: "text.white", backgroundColor: "background.deepPink" }}
        />
      </Box>
    </Box>
  );
};

export default Creators;
