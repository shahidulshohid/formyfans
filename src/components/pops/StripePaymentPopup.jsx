import { useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import {
  createOrderClientSecret,
  confirmOrderPayment,
} from "../../api/modules/payment";
import { isStripeKeyConfigured, stripePromise } from "../../config/stripe";
import { formatMoney } from "../../utils/cartHelpers";

const parseClientSecret = (body) =>
  body?.clientSecret ??
  body?.data?.clientSecret ??
  body?.paymentIntent?.client_secret ??
  null;

const roundAmount = (value) => Math.round(Number(value || 0) * 100) / 100;

const cardElementOptions = {
  hidePostalCode: true,
  disableLink: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#5E1321",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": { color: "#9e9e9e" },
    },
    invalid: { color: "#d32f2f" },
  },
};

/**
 * Pay Now flow:
 * 1. orders/create → orderId
 * 2. create-client-secret { amount, orderId }
 * 3. Stripe charge
 * 4. confirm-payment/:orderId
 * 5. thank you page
 */
const StripeCheckoutForm = ({
  amount,
  onClose,
  onValidate,
  onResolveOrderId,
  onComplete,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [ready, setReady] = useState(false);

  const paymentAmount = useMemo(() => roundAmount(amount), [amount]);

  const handlePay = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe is loading. Please wait.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card form not ready.");
      return;
    }

    setPaying(true);
    try {
      const valid = await onValidate?.();
      if (!valid) return;

      const orderId = await onResolveOrderId?.();
      if (!orderId) return;

      const secretRes = await createOrderClientSecret({
        amount: paymentAmount,
        orderId,
      });
      const secretOk = secretRes?.status >= 200 && secretRes?.status < 300;
      const secretBody = secretRes?.data ?? {};
      const clientSecret = parseClientSecret(secretBody);

      if (!secretOk || !clientSecret) {
        toast.error(secretBody?.message || "Could not start payment");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        },
      );

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        toast.error("Payment was not completed");
        return;
      }

      const confirmRes = await confirmOrderPayment(orderId, {
        paymentIntentId: paymentIntent.id,
      });
      const confirmOk = confirmRes?.status >= 200 && confirmRes?.status < 300;
      if (!confirmOk) {
        toast.error(confirmRes?.data?.message || "Could not confirm payment");
        return;
      }

      const confirmBody = confirmRes?.data ?? {};
      toast.success(confirmBody?.message || "Payment successful");
      onComplete?.({
        orderId: confirmBody.orderId ?? confirmBody.order?.orderId ?? orderId,
        order: confirmBody.order,
        paymentIntentId: paymentIntent.id,
      });
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Payment failed",
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: "100%", minWidth: 0, overflow: "hidden" }}
    >
      <Typography
        fontSize={14}
        color="#5E1321"
        textAlign="center"
        mb={2}
        lineHeight={1.5}
      >
        Enter your card details below to proceed with the payment of{" "}
        <strong>{formatMoney(amount)}</strong>.
      </Typography>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          py: 2,
          px: 1.5,
          mb: 2,
          borderRadius: 2,
          border: "1px solid rgba(94, 19, 33, 0.15)",
          bgcolor: "#fff",
          overflow: "hidden",
          boxSizing: "border-box",
          "& > div": { width: "100% !important", maxWidth: "100%" },
          "& iframe": { width: "100% !important", maxWidth: "100%" },
        }}
      >
        <CardElement
          options={cardElementOptions}
          onReady={() => setReady(true)}
        />
      </Box>

      <DialogActions
        sx={{
          px: 0,
          pb: 0,
          pt: 0,
          m: 0,
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={handlePay}
          disabled={paying || !ready || !stripe}
          sx={{
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#FF1572",
            maxWidth: 280,
            py: 1.1,
            "&:hover": { bgcolor: "#E01260" },
          }}
        >
          {paying ? (
            <CircularProgress size={22} sx={{ color: "white" }} />
          ) : (
            "Pay Now"
          )}
        </Button>
        <Button
          onClick={onClose}
          disabled={paying}
          sx={{
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 600,
            color: "#FF1572",
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};

const StripePaymentPopup = ({
  open,
  onClose,
  amount = 0,
  onValidate,
  onResolveOrderId,
  onComplete,
}) => {
  const handleClose = () => onClose?.();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          maxWidth: 480,
          width: "100%",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ pt: 3.5, pb: 3, px: 3, overflowX: "hidden" }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            mx: "auto",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255, 21, 114, 0.1)",
          }}
        >
          <CreditCardIcon sx={{ fontSize: 36, color: "#FF1572" }} />
        </Box>

        <Typography fontSize={22} fontWeight={700} textAlign="center" mb={1}>
          Online Payment
        </Typography>
        <Typography fontSize={14} color="#666" textAlign="center" mb={2.5}>
          Order total: {formatMoney(amount)}
        </Typography>

        {!isStripeKeyConfigured() ? (
          <Typography fontSize={14} color="#d32f2f" textAlign="center" py={2}>
            Stripe key missing in .env
          </Typography>
        ) : stripePromise ? (
          <Elements stripe={stripePromise}>
            <StripeCheckoutForm
              amount={amount}
              onClose={handleClose}
              onValidate={onValidate}
              onResolveOrderId={onResolveOrderId}
              onComplete={onComplete}
            />
          </Elements>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress sx={{ color: "#FF1572" }} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentPopup;
