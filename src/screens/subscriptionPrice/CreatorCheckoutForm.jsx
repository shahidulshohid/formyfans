import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import CustomButton from "../../components/cutomButon";
import { confirmFanSubscription } from "../../api/modules/fanSubscription";
// import axiosInstance from "../../api/axiosInstance";

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

function CreatorCheckoutForm({ checkoutData, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");

  const { clientSecret, setupIntentId, price, creatorUsername } = checkoutData;

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

      const confirmRes = await confirmFanSubscription(creatorUsername, {
        setupIntentId,
      });

      if (confirmRes.data.status === "success") {
        onSuccess();
      } else {
        setError(confirmRes.data?.message || "Could not complete subscription");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

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
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: "12px",
          border: "1px solid #FF1572",
          background:
            "linear-gradient(180deg, rgba(77, 10, 31, 0.68) 0%, rgba(42, 8, 27, 0.86) 100%)",
          p: { xs: 2, sm: 3 },
          color: "#fff",
        }}
      >
        <Typography fontSize={20} fontWeight={700} mb={0.5}>
          Subscribe to Creator
        </Typography>
        <Typography fontSize={13} color="#E6D3DB" mb={2}>
          ${price}/ monthly — Cancel anytime
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography fontSize={13} color="#E6D3DB" mb={0.5}>
              Cardholder Name
            </Typography>
            <TextField
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Name on card"
              required
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#FF1572" },
                },
              }}
            />
          </Box>

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
              handleClickBtn={onCancel}
              disabled={processing}
              width="100%"
              height="44px"
              bgcolor="transparent"
              color="#fff"
            />
            <CustomButton
              title={processing ? "Processing..." : "Subscribe"}
              type="submit"
              disabled={!stripe || processing}
              loading={processing}
              width="100%"
              height="44px"
              bgcolor="#FF1572"
              color="#fff"
              radius={999}
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default CreatorCheckoutForm;
