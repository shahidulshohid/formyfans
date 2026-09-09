import { Alert, Box, Button, Typography } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { stripePromise } from "../../config/stripe";
import CreatorCheckoutForm from "./CreatorCheckoutForm";
import { initialFanSubscription } from "../../api/modules/fanSubscription";
import { getFanSubscribeOrNot } from "../../api/modules/profile";

function CreatorSubscribeButton({ creatorUsername, creatorData, onSuccess }) {
  const [checkoutData, setCheckoutData] = useState(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleSubscribeClick = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await initialFanSubscription(creatorUsername);
      if (res.data.status === "success") {
        setCheckoutData({
          clientSecret: res.data.clientSecret,
          setupIntentId: res.data.setupIntentId,
          price: res.data.price,
          creatorUsername,
        });
      } else {
        setCheckoutData(null);
      }
    } catch (err) {
      setCheckoutData(null);
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    setCheckoutData(null);
    onSuccess();
  };

  // Checkout form
  if (checkoutData?.clientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret: checkoutData.clientSecret }}
      >
        <CreatorCheckoutForm
          checkoutData={checkoutData}
          onSuccess={handleSubscriptionSuccess}
          onCancel={() => setCheckoutData(null)}
        />
      </Elements>
    );
  }

  // If the creator did not set the price
  if (!creatorData?.isSubscriptionActive) {
    return (
      <Box
        py={4}
        px={2}
        width={"100%"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        borderRadius={"16px"}
        border={"1px solid rgba(255, 21, 114, 0.1)"}
        sx={{
          background:
            "linear-gradient(135deg, rgba(255, 21, 114, 0.05) 0%, rgba(94, 19, 33, 0.05) 100%)",
        }}
      >
        <Typography mb={1.5} fontSize={{ xs: 28, sm: 32 }}>
          🔒
        </Typography>
        <Typography
          fontSize={{ xs: 14, sm: 15 }}
          fontWeight={500}
          color={"text.primary"}
          textAlign={"center"}
          mb={0.5}
        >
          Exclusive content coming soon
        </Typography>
        {/* <Typography
          fontSize={{ xs: 12, sm: 13 }}
          color={"text.secondary"}
          textAlign={"center"}
        >
          This creator hasn't set up a subscription yet. Check back later!
        </Typography> */}
      </Box>
    );
  }

  // Not subscribed
  if (!creatorData?.isSubscribed) {
    return (
      <Box
        width={"100%"}
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
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              width: "100%",
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}
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
          Unlock Exclusive Content
        </Typography>
        <Typography
          fontSize={{ xs: 13, sm: 14 }}
          color="text.secondary"
          textAlign="center"
          mb={2.5}
        >
          Get instant access to premium photos, videos, and exclusive updates
          from this creator
        </Typography>
        <Button
          variant="contained"
          onClick={handleSubscribeClick}
          disabled={actionLoading}
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
          {actionLoading
            ? "Processing..."
            : `Subscribe $${creatorData.subscriptionPrice} / monthly`}
        </Button>
      </Box>
    );
  }

  return null;
}

export default CreatorSubscribeButton;
