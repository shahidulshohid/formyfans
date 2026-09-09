import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Skeleton, Stack, Typography } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { createSubscriptionClientSecret } from "../../api/modules/subscription";
import { isStripeKeyConfigured, stripePromise } from "../../config/stripe";
import CustomButton from "../cutomButon";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";
import SubscriptionPaymentForm from "./SubscriptionPaymentForm";

const getPlanAmount = (plan) => {
  const price = plan?.price;
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price) || 0;
  return 0;
};

const PaymentLoadingSkeleton = () => (
  <Stack spacing={2}>
    <Skeleton variant="rounded" height={48} />
    <Skeleton variant="rounded" height={120} />
    <Skeleton variant="rounded" height={44} />
  </Stack>
);

export const StripeSubscriptionDialog = forwardRef(
  function StripeSubscriptionDialog({ onSuccess }, ref) {
    const [open, setOpen] = useState(false);
    const [plan, setPlan] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = useCallback(() => {
      setOpen(false);
      setTimeout(() => {
        setClientSecret(null);
        setPlan(null);
      }, 300);
    }, []);

    useImperativeHandle(ref, () => ({
      openDialog: ({ data }) => {
        if (!data?._id) {
          toast.error("Please select a plan");
          return;
        }
        setPlan(data);
        setClientSecret(null);
        setOpen(true);
      },
      closeDialog: handleClose,
    }));

    const generateSecret = useCallback(async () => {
      if (!plan) return;

      if (!isStripeKeyConfigured()) {
        toast.error("Stripe is not configured");
        return;
      }

      setIsLoading(true);
      setClientSecret(null);

      try {
        const response = await createSubscriptionClientSecret({
          amount: getPlanAmount(plan),
        });
        if (response?.data?.status === "success") {
          const secret = response?.data?.clientSecret;
          setClientSecret(secret);
        } else {
          toast.error(response?.data?.message || "Could not start payment");
          return;
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || err.message || "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    }, [plan]);

    useEffect(() => {
      if (open && plan) {
        generateSecret();
      }
    }, [open, plan, generateSecret]);

    const amount = getPlanAmount(plan);

    return (
      <DialogBox open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogHeader
          title={`Pay for ${plan?.name || "Subscription"}`}
          secondaryHeading={`Amount to pay: $${amount}`}
          onClose={handleClose}
        />
        <DialogBody>
          {!isStripeKeyConfigured() ? (
            <Typography color="error">
              Stripe publishable key is not configured.
            </Typography>
          ) : isLoading ? (
            <PaymentLoadingSkeleton />
          ) : !clientSecret ? (
            <Stack alignItems="center" py={4} spacing={1.5}>
              <Typography fontWeight={600} color="#5E1321">
                Something went wrong!
              </Typography>
              <Typography color="text.secondary">Please try again.</Typography>
              <CustomButton title="Try Again" handleClickBtn={generateSecret} />
            </Stack>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                // appearance: { theme: "stripe" },
              }}
            >
              <SubscriptionPaymentForm
                plan={plan}
                amount={amount}
                clientSecret={clientSecret}
                onSuccess={onSuccess}
                onClose={handleClose}
              />
            </Elements>
          )}
        </DialogBody>
      </DialogBox>
    );
  },
);
