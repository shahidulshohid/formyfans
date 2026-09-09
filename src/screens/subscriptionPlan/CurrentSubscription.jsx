import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  cancelSubscription,
  resumeSubscription,
} from "../../api/modules/subscription";
import { applyApiUserUpdate } from "../../utils/syncUser";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "trialing":
      return "info";
    case "canceled":
    case "past_due":
      return "error";
    default:
      return "default";
  }
};

const DetailRow = ({ label, children, isSettings }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap={2}
    py={1}
  >
    <Typography
      fontSize={14}
      color={isSettings ? "text.secondary" : "rgba(255,255,255,0.7)"}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

function CurrentSubscription({ subscription, onChange, variant = "default" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSettings = variant === "settings";

  const isTrialing = subscription.status === "trialing";

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?"))
      return;

    setLoading(true);
    setError("");
    try {
      const response = await cancelSubscription();
      if (response?.status >= 200 && response?.status < 300) {
        await applyApiUserUpdate(response?.data?.user);
        onChange();
      } else {
        setError(response?.data?.message || "Failed to cancel");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await resumeSubscription();
      if (response?.status >= 200 && response?.status < 300) {
        await applyApiUserUpdate(response?.data?.user);
        onChange();
      } else {
        setError(response?.data?.message || "Failed to resume");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={
        isSettings
          ? {
              width: "100%",
              borderRadius: "12px",
              border: "1px solid rgba(94, 19, 33, 0.15)",
              bgcolor: "#fff",
              p: { xs: 2, sm: 3 },
              color: "#5E1321",
            }
          : {
              width: "100%",
              maxWidth: 480,
              borderRadius: "12px",
              border: "1px solid #FF1572",
              background:
                "linear-gradient(180deg, rgba(77, 10, 31, 0.68) 0%, rgba(42, 8, 27, 0.86) 100%)",
              p: { xs: 2, sm: 3 },
              color: "#fff",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }
      }
    >
      <Typography
        fontSize={{ xs: 20, sm: 22 }}
        fontWeight={700}
        mb={2}
        color={isSettings ? "#5E1321" : "inherit"}
      >
        Your Subscription
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        divider={
          <Divider
            sx={{
              borderColor: isSettings
                ? "rgba(94, 19, 33, 0.12)"
                : "rgba(255,255,255,0.12)",
            }}
          />
        }
      >
        <DetailRow label="Plan" isSettings={isSettings}>
          <Typography fontSize={14} fontWeight={700} color="#5E1321">
            {(subscription.plan || subscription.planName || "-").toUpperCase()}
          </Typography>
        </DetailRow>

        <DetailRow label="Status" isSettings={isSettings}>
          <Chip
            label={subscription.status}
            size="small"
            color={getStatusColor(subscription.status)}
            sx={{ textTransform: "capitalize", fontWeight: 600 }}
          />
        </DetailRow>

        {isTrialing && (
          <DetailRow label="Trial ends on" isSettings={isSettings}>
            <Typography fontSize={14} fontWeight={600} color="#5E1321">
              {formatDate(subscription.trialEnd)}
            </Typography>
          </DetailRow>
        )}

        <DetailRow label="Current period ends" isSettings={isSettings}>
          <Typography fontSize={14} fontWeight={600} color="#5E1321">
            {formatDate(subscription.currentPeriodEnd)}
          </Typography>
        </DetailRow>
      </Stack>

      {subscription.cancelAtPeriodEnd && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Your subscription is set to cancel on{" "}
          {formatDate(subscription.currentPeriodEnd)}.
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={3}>
        {subscription.cancelAtPeriodEnd ? (
          <Button
            variant={isSettings ? "contained" : "outlined"}
            onClick={handleResume}
            disabled={loading}
            sx={{
              flex: 1,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "999px",
              ...(isSettings
                ? {
                    bgcolor: "#FF1572",
                    color: "#fff",
                    "&:hover": { bgcolor: "#e01366" },
                  }
                : {
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      borderColor: "#fff",
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                  }),
            }}
          >
            Resume Subscription
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancel}
            disabled={loading}
            sx={{
              flex: 1,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "999px",
              ...(isSettings && {
                borderColor: "#d32f2f",
                color: "#d32f2f",
              }),
            }}
          >
            Cancel Subscription
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default CurrentSubscription;
