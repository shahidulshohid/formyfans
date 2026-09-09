import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import CustomButton from "../../components/cutomButon";
import { confirmSubscriptionSetup } from "../../api/modules/subscription";

const elementStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#fff",
      fontFamily: "Montserrat, system-ui, sans-serif",
      "::placeholder": { color: "rgba(255,255,255,0.45)" },
    },
    invalid: { color: "#ff8a8a" },
  },
};

const fieldBoxSx = {
  p: 1.5,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "8px",
  bgcolor: "rgba(0, 0, 0, 0.2)",
  "&:focus-within": {
    borderColor: "#FF1572",
    boxShadow: "0 0 0 1px #FF1572",
  },
};

const CardField = ({ label, children }) => (
  <Box>
    <Typography fontSize={13} fontWeight={600} color="#fff" mb={0.75}>
      {label}
    </Typography>
    <Box sx={fieldBoxSx}>{children}</Box>
  </Box>
);

const planLabel = (planName) =>
  planName === "basic" ? "Basic" : planName === "pro" ? "Pro" : planName;

function CheckoutForm({ checkoutData, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");

  const { clientSecret, planName, isTrial } = checkoutData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { name: cardholderName },
        },
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const confirmRes = await confirmSubscriptionSetup({
        setupIntentId: checkoutData.setupIntentId,
        planId: checkoutData.planId,
      });

      if (confirmRes?.status >= 200 && confirmRes?.status < 300) {
        const userData = confirmRes?.data?.user;
        onSuccess(userData);
      } else {
        setError(
          confirmRes?.data?.message || "Could not complete subscription",
        );
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
        maxWidth: 480,
        borderRadius: "12px",
        border: "1px solid #FF1572",
        background:
          "linear-gradient(180deg, rgba(77, 10, 31, 0.68) 0%, rgba(42, 8, 27, 0.86) 100%)",
        p: { xs: 2, sm: 3 },
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      }}
    >
      <Typography fontSize={{ xs: 20, sm: 22 }} fontWeight={700} mb={1}>
        Subscribe to {planLabel(planName)} Plan
      </Typography>

      {isTrial && (
        <Typography fontSize={13} color="#E6D3DB" mb={2}>
          Your card won&apos;t be charged during the trial. Cancel anytime
          before it ends to avoid being billed.
        </Typography>
      )}

      <Stack spacing={2}>
        <Typography fontSize={13} color="#E6D3DB" mb={0.5}>
          Cardholder Name
        </Typography>
        <TextField
          // label="Cardholder Name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Name on card"
          required
          fullWidth
          size="small"
          InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
              "&.Mui-focused fieldset": { borderColor: "#FF1572" },
            },
          }}
        />

        <CardField label="Card Number">
          <CardNumberElement options={elementStyle} />
        </CardField>

        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <CardField label="Expiry Date">
              <CardExpiryElement options={elementStyle} />
            </CardField>
          </Box>
          <Box flex={1}>
            <CardField label="CVC">
              <CardCvcElement options={elementStyle} />
            </CardField>
          </Box>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction="row" spacing={1.5} mt={1}>
          <CustomButton
            title="Back"
            variant="outlined"
            handleClickBtn={onCancel}
            disabled={processing}
            width="100%"
            height="44px"
            bgcolor="transparent"
            color="#fff"
            sx={{
              flex: 1,
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          />
          <CustomButton
            title={
              processing
                ? "Processing..."
                : isTrial
                  ? "Start Trial"
                  : "Subscribe"
            }
            type="submit"
            disabled={!stripe || processing}
            loading={processing}
            width="100%"
            height="44px"
            bgcolor="#FF1572"
            color="#fff"
            radius={999}
            sx={{ flex: 2 }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

export default CheckoutForm;
