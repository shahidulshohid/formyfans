import { Typography } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { Gem } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { isStripeKeyConfigured, stripePromise } from "../../config/stripe";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";
import FanbugPaymentForm from "./fanbugPaymentForm";

export const FanbugDialog = forwardRef(function FanbugDialog(
  { onSuccess },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [streamId, setStreamId] = useState(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      setStreamId(null);
    }, 300);
  }, []);

  useImperativeHandle(ref, () => ({
    open: ({ streamId: nextStreamId } = {}) => {
      if (!nextStreamId) return;
      setStreamId(nextStreamId);
      setOpen(true);
    },
    close: handleClose,
  }));

  return (
    <DialogBox open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogHeader
        title="Send Fan bucks"
        secondaryHeading="Support the live stream"
        onClose={handleClose}
        icon={<Gem size={20} />}
      />
      <DialogBody>
        {!isStripeKeyConfigured() || !stripePromise ? (
          <Typography color="error" fontSize={14}>
            Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to
            continue.
          </Typography>
        ) : streamId ? (
          <Elements stripe={stripePromise}>
            <FanbugPaymentForm
              streamId={streamId}
              onClose={handleClose}
              onSuccess={onSuccess}
            />
          </Elements>
        ) : null}
      </DialogBody>
    </DialogBox>
  );
});

FanbugDialog.displayName = "FanbugDialog";
