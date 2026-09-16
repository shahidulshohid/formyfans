import { Alert, Box, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { USER_ROLES } from "../productForm/constants";
import { getProfileCompletion } from "../../utils/helper";
import useUserStore from "../../zustand/userUserStore";

const ProfileIncompleteAlert = () => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== USER_ROLES.CREATOR) return null;
  if (location.pathname === "/settings/account") return null;

  const { isComplete, percentage, completed, total } = getProfileCompletion(user);
  if (isComplete) return null;

  const remaining = 100 - percentage;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        action={
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/settings/account")}
            sx={{
              bgcolor: "#FF1572",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: 11, sm: 13 },
              px: { xs: 1.5, sm: 2 },
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#E0115F",
                boxShadow: "none",
              },
            }}
          >
            Complete your profile
          </Button>
        }
        sx={{
          alignItems: "center",
          borderRadius: "12px",
          bgcolor: "rgba(255, 21, 114, 0.08)",
          color: "#5E1321",
          border: "1px solid rgba(255, 21, 114, 0.25)",
          "& .MuiAlert-icon": {
            color: "#FF1572",
          },
          "& .MuiAlert-message": {
            fontWeight: 500,
            fontSize: { xs: 13, sm: 14 },
          },
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 1,
        }}
      >
        Your profile is {percentage}% complete ({completed} of {total} steps done).
        {remaining}% is still incomplete — please finish your profile.
      </Alert>
    </Box>
  );
};

export default ProfileIncompleteAlert;
