import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const BecomeCreatorCard = () => {
  const navigate = useNavigate();
  return (
    <Box
      // width={"100%"}
      mb={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={4}
      px={2}
      borderRadius="16px"
      border="1px solid rgba(255, 21, 114, 0.15)"
      sx={{
        background:
          "linear-gradient(135deg, rgba(255, 21, 114, 0.08) 0%, rgba(94, 19, 33, 0.08) 100%)",
      }}
    >
      <Typography fontSize={{ xs: 28, sm: 32 }} mb={1.5}>
        ✨
      </Typography>
      <Typography
        fontSize={{ xs: 16, sm: 17 }}
        fontWeight={600}
        color="text.primary"
        textAlign="center"
        mb={1}
      >
        Become a creator
      </Typography>
      <Typography
        fontSize={{ xs: 13, sm: 14 }}
        color="text.secondary"
        textAlign="center"
        mb={2.5}
      >
        Start sharing your photos, videos, and exclusive updates — and earn from
        your exclusive content
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/settings/become-creator")}
        sx={{
          bgcolor: "#FF1572",
          borderRadius: "24px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: { xs: 13, sm: 14 },
          px: { xs: 3, sm: 4 },
          py: 1.2,
          width: { xs: "100%", sm: "auto" },
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "#E0115F",
            boxShadow: "0 8px 24px rgba(255, 21, 114, 0.3)",
          },
          "&:disabled": {
            opacity: 0.6,
          },
        }}
      >
        Become a Creator
      </Button>
    </Box>
  );
};
