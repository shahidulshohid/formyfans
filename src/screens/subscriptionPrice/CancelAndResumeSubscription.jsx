import { Alert, Box, Button, Chip, Typography } from "@mui/material";
import { useState } from "react";
import { cancelFanSubscription, resumeFanSubscription } from "../../api/modules/fanSubscription";

function CancelAndResumeSubscription({
  creatorUsername,
  creatorData,
  onSuccess,
}) {
  const [checkoutData, setCheckoutData] = useState(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Cancel subscription? You will retain access until the end of the billing period.",
      )
    )
      return;

    setActionLoading(true);
    setError("");
    try {
      const response = await cancelFanSubscription(creatorUsername);
      if (response.data.status === "success") {
        onSuccess?.();
      } else {
        toast.error(response.data.message);
        setError(response.data.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    setError("");
    try {
      const response = await resumeFanSubscription(creatorUsername);
      if (response.data.status === "success") {
        onSuccess?.();
      } else {
        setError(response.data.message || "Failed to resume");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resume");
    } finally {
      setActionLoading(false);
    }
  };

  const { isSubscribed, subscription } = creatorData;

  const isCanceledButActive =
    isSubscribed &&
    subscription?.cancelAtPeriodEnd &&
    new Date(subscription?.currentPeriodEnd) > new Date();

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {/* Already subscribed — active */}
      {isSubscribed && !isCanceledButActive && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            py: 3,
            px: 2.5,
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(34, 197, 94, 0.2)",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontSize={24}>✅</Typography>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 15, sm: 16 },
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                Subscription Active
              </Typography>
              <Chip
                label="Premium Access"
                color="success"
                size="small"
                sx={{
                  mt: 0.5,
                  height: 22,
                  fontSize: 11,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Monthly Fee
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  color: "text.primary",
                  mt: 0.5,
                }}
              >
                ${subscription.price}/month
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Next Billing Date
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  color: "text.primary",
                  mt: 0.5,
                }}
              >
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Subscription Status
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 13, sm: 14 },
                  fontWeight: 500,
                  color: "#22c55e",
                  mt: 0.5,
                }}
              >
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Member Since
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 13, sm: 14 },
                  fontWeight: 500,
                  color: "text.primary",
                  mt: 0.5,
                }}
              >
                {new Date(subscription.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="error"
            onClick={handleCancel}
            disabled={actionLoading}
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              py: 1,
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 600,
              borderColor: "rgba(239, 68, 68, 0.5)",
              color: "#ef4444",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
              },
              "&:disabled": {
                opacity: 0.6,
              },
            }}
          >
            {actionLoading ? "Processing..." : "Cancel Subscription"}
          </Button>
        </Box>
      )}

      {/* Canceled but still active */}
      {isCanceledButActive && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            py: 3,
            px: 2.5,
            background: "linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.04) 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(251, 146, 60, 0.2)",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontSize={24}>⏱️</Typography>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 15, sm: 16 },
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                Subscription Canceling
              </Typography>
              <Chip
                label="Access Until Period End"
                sx={{
                  mt: 0.5,
                  height: 22,
                  fontSize: 11,
                  backgroundColor: "rgba(251, 146, 60, 0.2)",
                  color: "#fb923c",
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Monthly Fee
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  color: "text.primary",
                  mt: 0.5,
                }}
              >
                ${subscription.price}/month
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Access Until
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  color: "#fb923c",
                  mt: 0.5,
                }}
              >
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Cancellation Date
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 13, sm: 14 },
                  fontWeight: 500,
                  color: "#fb923c",
                  mt: 0.5,
                }}
              >
                {subscription.canceledAt
                  ? new Date(subscription.canceledAt).toLocaleDateString()
                  : "Pending"}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                Days Left
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 13, sm: 14 },
                  fontWeight: 500,
                  color: "text.primary",
                  mt: 0.5,
                }}
              >
                {Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))} days
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
              backgroundColor: "rgba(251, 146, 60, 0.1)",
              p: 1.5,
              borderRadius: "8px",
              borderLeft: "3px solid #fb923c",
            }}
          >
            💡 You can resume your subscription anytime before the access expires.
          </Typography>

          <Button
            variant="contained"
            onClick={handleResume}
            disabled={actionLoading}
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              py: 1,
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 600,
              backgroundColor: "#fb923c",
              color: "#fff",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#ea580c",
                boxShadow: "0 8px 24px rgba(251, 146, 60, 0.3)",
              },
              "&:disabled": {
                opacity: 0.6,
              },
            }}
          >
            {actionLoading ? "Processing..." : "Resume Subscription"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default CancelAndResumeSubscription;
