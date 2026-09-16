import { Box, Typography } from "@mui/material";
import CustomButton from "../../../components/cutomButon";
import {
  getInterestLabel,
  normalizeInterestValue,
} from "../../../constants/interests";

const UserInterests = ({ userInterests }) => {
  if (!userInterests || userInterests.length === 0) return null;

  return (
    <Box
      mt={2}
      sx={{
        bgcolor: "colors.white",
        borderRadius: "20px",
        p: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid",
        borderColor: "neutral.ligthColor",
      }}
    >
      <Typography color="text.darkBrown" fontSize={16} fontWeight={700}>
        Your interests
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1} mt={1.5}>
        {userInterests.map((interest) => (
          <CustomButton
            key={normalizeInterestValue(interest)}
            title={getInterestLabel(interest)}
            width="auto"
            sx={{
              backgroundColor: "colors.white",
              border: "1px solid",
              borderColor: "neutral.ligthColor",
              borderRadius: "20px",
              color: "text.darkBrown",
              fontWeight: 500,
              fontSize: 11,
              px: 2,
              py: 0.2,
              minWidth: "unset",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default UserInterests;