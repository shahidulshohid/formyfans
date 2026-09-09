import { Box, Typography } from "@mui/material";
import SecurityIcon from "../../assets/icon/privacy.svg";
import CustomCheckbox from "../../components/cutomChecked";

const PrivacySection = () => {
  return (
    <>
      <Box
        bgcolor={"background.deepPink"}
        borderRadius={"30px"}
        p={{ xs: 1.5, md: 2 }}
      >
        <Box
          display={"flex"}
          gap={"10px"}
          alignItems={"center"}
          justifyContent={{ xs: "center", md: "flex-start" }}
        >
          <Box>
            <img src={SecurityIcon} style={{ width: "30px", height: "30px" }} />
          </Box>
          <Box>
            <Typography
              color="text.white"
              fontSize={{ xs: "18px", md: "22px" }}
            >
              Privacy and Security
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        bgcolor={"background.darkBrown"}
        p={{ xs: 2, md: 3 }}
        borderRadius={{ xs: "30px", md: "58px" }}
        mt={1.5}
        height={{ xs: "auto", md: "745px" }}
      >
        <Box mt={{ xs: 3, md: 6 }}>
          <Typography
            fontSize={{ xs: "20px", md: "25px" }}
            color="primary.white"
          >
            Account privacy
          </Typography>
          <CustomCheckbox label="Private account" />
          <Typography
            fontSize={{ xs: "11px", md: "12px" }}
            lineHeight={"16px"}
            color="primary.white"
          >
            Lorem ipsum dolor sit amet consectetur. Potenti amet sed in nunc
            dictum volutpat a. Mauris scelerisque rhoncus pretium sagittis nisi
            neque tristique justo. Nec nulla eget nunc mattis vel ipsum quam. In
            condimentum maecenas aliquam id dolor. Sagittis orci est sed sed.
            Nec consequat quis vitae vestibulum quisque vel lorem.
          </Typography>
        </Box>
        <Box
          border={"1px solid rgba(255, 255, 255, 1)"}
          mt={{ xs: 3, md: 5 }}
        ></Box>
        <Box mt={{ xs: 2, md: 3 }}>
          <Typography
            fontSize={{ xs: "20px", md: "25px" }}
            color="primary.white"
          >
            Account status
          </Typography>
          <CustomCheckbox label="Show activity status" />
          <Typography
            fontSize={{ xs: "11px", md: "12px" }}
            lineHeight={"16px"}
            color="primary.white"
          >
            Lorem ipsum dolor sit amet consectetur. Potenti amet sed in nunc
            dictum volutpat a. Mauris scelerisque rhoncus pretium sagittis nisi
            neque tristique justo. Nec nulla eget nunc mattis vel ipsum quam. In
            condimentum maecenas aliquam id dolor. Sagittis orci est sed sed.
            Nec consequat quis vitae vestibulum quisque vel lorem.
          </Typography>
        </Box>
        <Box
          border={"1px solid rgba(255, 255, 255, 1)"}
          mt={{ xs: 4, md: 8 }}
        ></Box>
        <Box mt={{ xs: 2, md: 2 }}>
          <Typography
            fontSize={{ xs: "20px", md: "25px" }}
            color="primary.white"
          >
            Two-factor authentication
          </Typography>
          <CustomCheckbox label="Use authentication app" />
          <Typography
            fontSize={{ xs: "11px", md: "12px" }}
            lineHeight={"16px"}
            color="primary.white"
          >
            Lorem ipsum dolor sit amet consectetur. Potenti amet sed in nunc
            dictum volutpat a. Mauris scelerisque rhoncus pretium sagittis nisi
            neque
          </Typography>
        </Box>
        <Box mt={1}>
          <CustomCheckbox label="Use authentication app" />
          <Typography
            fontSize={{ xs: "11px", md: "12px" }}
            lineHeight={"16px"}
            color="primary.white"
          >
            Lorem ipsum dolor sit amet consectetur. Potenti amet sed in nunc
            dictum volutpat a. Mauris scelerisque rhoncus pretium sagittis nisi
            neque
          </Typography>
          <Box border={"1px solid rgba(255, 255, 255, 1)"} mt={3}></Box>
        </Box>
      </Box>
    </>
  );
};

export default PrivacySection;
