import { Box, Stack, Typography } from "@mui/material";
import {
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Gem } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  confirmFanbug,
  createFanbugIntent,
} from "../../api/modules/liveStream";
import { fanbugPaymentValidation } from "../../utils/validation";
import CustomButton from "../cutomButon";
import { AppInput } from "../input";

const PRESET_AMOUNTS = [1, 5, 10, 25];

const formatFanbugs = (value) => Number(value || 0).toFixed(2);

const cardElementOptions = {
  hidePostalCode: true,
  disableLink: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#5E1321",
      fontFamily: "Montserrat, system-ui, sans-serif",
      "::placeholder": { color: "#9e9e9e" },
    },
    invalid: { color: "#d32f2f" },
  },
};

const cardFieldSx = (hasError) => ({
  py: 2,
  px: 1.5,
  borderRadius: "8px",
  border: "1px solid",
  borderColor: hasError ? "error.main" : "rgba(94, 19, 33, 0.25)",
  bgcolor: "primary.white",
  mb: 0.5,
  "&:focus-within": {
    borderColor: hasError ? "error.main" : "neutral.deepPink",
    boxShadow: (theme) =>
      hasError
        ? `0 0 0 1px ${theme.palette.error.main}`
        : `0 0 0 1px ${theme.palette.neutral.deepPink}`,
  },
});

const roundAmount = (value) => Math.round(Number(value || 0) * 100) / 100;

const FanbugPaymentForm = ({ streamId, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState("5");
  const [message, setMessage] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentAmount = useMemo(() => roundAmount(amount), [amount]);

  const selectPreset = (value) => {
    setAmount(value);
    setCustomAmount(String(value));
    setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const handleCustomAmountChange = (event) => {
    const raw = event.target.value;
    setCustomAmount(raw);
    setErrors((prev) => ({ ...prev, amount: "" }));

    const parsed = roundAmount(raw);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(Boolean(event.complete));
    setErrors((prev) => ({
      ...prev,
      card: event.error?.message || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    const isValid = fanbugPaymentValidation(
      { amount: paymentAmount, cardComplete },
      setErrors,
    );
    if (!isValid) return;

    if (!stripe || !elements) {
      toast.error("Stripe is loading. Please wait.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrors((prev) => ({
        ...prev,
        card: "Please enter your card details",
      }));
      return;
    }

    setIsProcessing(true);

    try {
      const intentRes = await createFanbugIntent(streamId, {
        amount: paymentAmount,
        message: message.trim(),
      });

      const intentBody = intentRes?.data ?? {};
      const clientSecret = intentBody?.data?.clientSecret;
      const intentOk = intentRes?.status >= 200 && intentRes?.status < 300;

      if (!intentOk || !clientSecret) {
        const msg = intentBody?.message || "Could not start Fanbug payment";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: cardElement } },
      );

      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        setErrorMessage("Payment was not completed");
        toast.error("Payment was not completed");
        return;
      }

      const confirmRes = await confirmFanbug(streamId, {
        paymentIntentId: paymentIntent.id,
      });
      const confirmBody = confirmRes?.data ?? {};
      const confirmOk = confirmRes?.status >= 200 && confirmRes?.status < 300;

      if (!confirmOk) {
        const msg = confirmBody?.message || "Could not confirm Fanbug";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      toast.success(confirmBody?.message || "Fanbug sent!");
      onSuccess?.(confirmBody?.data);
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Payment failed";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        {PRESET_AMOUNTS.map((value) => {
          const isSelected = paymentAmount === value;
          return (
            <CustomButton
              key={value}
              title={String(value)}
              icon={<Gem size={14} />}
              handleClickBtn={() => selectPreset(value)}
              disabled={isProcessing}
              height={36}
              radius={8}
              sx={{
                minWidth: 72,
                bgcolor: isSelected ? "background.deepPink" : "transparent",
                color: isSelected ? "text.white" : "text.deepPink",
                border: "1px solid",
                borderColor: "neutral.deepPink",
                "&:hover": {
                  bgcolor: isSelected
                    ? "background.deepPink"
                    : "rgba(255, 21, 114, 0.08)",
                },
              }}
            />
          );
        })}
      </Stack>

      <Stack spacing={2} mb={2}>
        <AppInput
          variantStyles="darkBrown"
          inputLabel="Custom Fan bucks"
          type="number"
          placeholder="How many Fan bucks?"
          fullWidth
          size="small"
          value={customAmount}
          onChange={handleCustomAmountChange}
          disabled={isProcessing}
          error={Boolean(errors.amount)}
          helperText={errors.amount}
          inputProps={{ step: "0.01" }}
        />

        <AppInput
          variantStyles="darkBrown"
          inputLabel="Optional message"
          type="text"
          placeholder="Say something nice..."
          fullWidth
          size="small"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={isProcessing}
          inputProps={{ maxLength: 200 }}
        />
      </Stack>

      <Typography
        fontSize={13}
        fontWeight={600}
        color="text.darkBrown"
        mb={0.75}
      >
        Card details
      </Typography>
      <Box sx={cardFieldSx(Boolean(errors.card))}>
        <CardElement
          options={cardElementOptions}
          onChange={handleCardChange}
        />
      </Box>
      {errors.card && (
        <Typography color="error" fontSize={12} mb={1}>
          {errors.card}
        </Typography>
      )}

      {errorMessage && (
        <Typography color="error" fontSize={13} mt={1.5} mb={1}>
          {errorMessage}
        </Typography>
      )}

      <Stack direction="row" spacing={2} mt={2}>
        <CustomButton
          title="Cancel"
          variant="outlined"
          handleClickBtn={onClose}
          disabled={isProcessing}
          sx={{
            flex: 1,
            bgcolor: "transparent",
            color: "text.darkBrown",
            border: "1px solid",
            borderColor: "primary.main",
          }}
        />
        <CustomButton
          title={
            isProcessing
              ? "Processing..."
              : `Send ${formatFanbugs(paymentAmount)} Fan bucks`
          }
          type="submit"
          icon={!isProcessing ? <Gem size={18} /> : null}
          disabled={isProcessing || !stripe}
          loading={isProcessing}
          bgcolor="background.deepPink"
          sx={{
            flex: 2,
            "&:hover": { bgcolor: "background.deepMaroon" },
          }}
        />
      </Stack>
    </Box>
  );
};

export default FanbugPaymentForm;
