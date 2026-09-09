import { Box, Button, Typography } from "@mui/material";
import SettingHeader from "../../components/settingHeader";
import AccountIcon from "../../assets/icon/account.svg";
import CustomButton from "../../components/cutomButon";
import { useNavigate } from "react-router-dom";

const BecomeCreator = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <SettingHeader title="Become a Creator" icon={AccountIcon} />

      <Box
        sx={{
          width: "100%",
          maxWidth: 793,
          bgcolor: "#FFF5F9",
          borderRadius: "24px",
          p: { xs: 3, md: 4 },
          border: "1px solid #FFD7E7",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} color="#5E1321">
          Want to become a creator?
        </Typography>

        <Typography color="#6A4A56" lineHeight={1.7}>
          As a creator, you can connect with your fans, share posts, upload
          photos and videos, and grow your community.
        </Typography>

        <Box
          component="ul"
          sx={{ m: 0, pl: 3, color: "#6A4A56", lineHeight: 1.8 }}
        >
          <li>Follow and interact with your fans</li>
          <li>Get special recognition with a creator badge</li>
          <li>Enjoy better visibility and priority on the platform</li>
          <li>List your products in the marketplace</li>
        </Box>

        <CustomButton
          title="Become a Creator"
          handleClickBtn={() => navigate("/subscription-plans")}
          sx={{
            alignSelf: "flex-start",
            bgcolor: "#FF1572",
            color: "#fff",
            px: 3,
            py: 1,
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#E10F63",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default BecomeCreator;
