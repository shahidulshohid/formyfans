import { Box, Stack, Typography } from "@mui/material";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { toast } from "react-toastify";
import { buySubscription } from "../../api/modules/buySubscription";
import CustomButton from "../cutomButon";

const elementStyle = {
  base: {
    fontSize: "16px",
    color: "#5E1321",
    fontFamily: "system-ui, sans-serif",
    "::placeholder": { color: "#9e9e9e" },
  },
  invalid: { color: "#d32f2f" },
};

const fieldBoxSx = {
  p: 1.5,
  border: "1px solid rgba(94, 19, 33, 0.25)",
  borderRadius: "8px",
  bgcolor: "#fff",
  "&:focus-within": {
    borderColor: "#FF1572",
    boxShadow: "0 0 0 1px #FF1572",
  },
};

const CardField = ({ label, children }) => (
  <Box>
    <Typography fontSize="13px" fontWeight={600} color="#5E1321" mb={0.75}>
      {label}
    </Typography>
    <Box sx={fieldBoxSx}>{children}</Box>
  </Box>
);

const SubscriptionPaymentForm = ({
  plan,
  amount,
  clientSecret,
  onSuccess,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      toast.error("Card form not ready.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardNumber },
        },
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!paymentIntent?.id) {
        setErrorMessage("Payment was not completed");
        return;
      }

      const response = await buySubscription({
        planId: plan._id,
        paymentIntentId: paymentIntent.id,
      });

      if (response?.data?.status === "success") {
        const data = response?.data;
        toast.success(response?.data?.message);
        onSuccess?.(data);
        onClose?.();
      } else {
        toast.error(response?.data?.message || "Subscription failed");
        setErrorMessage(response?.data?.message || "Subscription failed");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Payment failed";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <CardField label="Card Number">
          <CardNumberElement
            options={{
              style: elementStyle,
              showIcon: true,
              disableLink: true,
            }}
          />
        </CardField>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <CardField label="Expiration">
              <CardExpiryElement options={{ style: elementStyle }} />
            </CardField>
          </Box>
          <Box sx={{ flex: 1 }}>
            <CardField label="CVC">
              <CardCvcElement options={{ style: elementStyle }} />
            </CardField>
          </Box>
        </Stack>
      </Stack>

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <CustomButton
          title="Cancel"
          variant="outlined"
          handleClickBtn={onClose}
          disabled={isProcessing}
          sx={{
            flex: 1,
            bgcolor: "transparent",
            color: "#5E1321",
            border: "1px solid rgba(94, 19, 33, 0.35)",
          }}
        />
        <CustomButton
          title={isProcessing ? "Processing..." : `Pay $${amount}`}
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          loading={isProcessing}
          sx={{ flex: 2 }}
        />
      </Stack>
    </form>
  );
};

export default SubscriptionPaymentForm;
