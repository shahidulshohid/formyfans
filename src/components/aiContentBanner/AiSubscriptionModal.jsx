import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import {
  calculateCreditPrice,
  confirmStripePaymentIntent,
  getCreditBalance,
  getCreditPricing,
  purchaseAiCredits,
} from "../../api/aiContent";
import { createSubscriptionClientSecret } from "../../api/modules/subscription";
import { isStripeKeyConfigured, stripePromise } from "../../config/stripe";
import useUserStore from "../../zustand/userUserStore";


const defaultFeatures = [
  "AI Video Generation",
  "AI Image Generation",
  "AI Video Editing",
];

const stripeFieldSx = {
  p: 1.25,
  border: "1px solid rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  bgcolor: "#fff",
  "&:focus-within": {
    borderColor: "#FF1572",
    boxShadow: "0 0 0 1px #FF1572",
  },
};

const stripeElementStyle = {
  base: {
    fontSize: "15px",
    color: "#222222",
    fontFamily: "Inter, sans-serif",
    "::placeholder": { color: "#9CA3AF" },
  },
  invalid: { color: "#EF4444" },
};

/**
 * Stripe Payment Form for AI Credit Purchase
 */
const AiCreditStripeForm = ({
  clientSecret,
  paymentIntentId,
  credits,
  amount,
  onSuccess,
  onBack,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Standard Stripe Card Payment
  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      toast.error("Card input is not ready yet.");
      return;
    }

    setProcessing(true);
    setErrorMsg(null);

    try {
      const returnUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/return`
          : "https://localhost:5009/return";

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardNumber },
          return_url: returnUrl,
        }
      );

      if (error) {
        setErrorMsg(error.message);
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded" || paymentIntent?.id) {
        toast.success("AI Credits purchased successfully!");
        onSuccess?.({
          paymentIntentId: paymentIntent.id,
          credits,
          amount,
          status: paymentIntent.status,
        });
      } else {
        setErrorMsg("Payment could not be completed.");
        toast.error("Payment could not be completed.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Payment failed";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <IconButton
            size="small"
            onClick={onBack}
            disabled={processing}
            sx={{ p: 0.5, color: "#555555", "&:hover": { bgcolor: "#F3F4F6" } }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#000000",
              fontSize: { xs: "16px", sm: "17px" },
            }}
          >
            Payment Details
          </Typography>
        </Box>
        <Typography sx={{ color: "#6B7280", fontSize: "12px", pl: 3.5 }}>
          Total: <strong style={{ color: "#FF1572" }}>${amount}</strong> for{" "}
          <strong>{credits?.toLocaleString()} Credits</strong>
        </Typography>
      </Box>

      <Stack spacing={1.8} sx={{ mb: 2.5 }}>
        <Box>
          <Typography
            sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}
          >
            Card Number
          </Typography>
          <Box sx={stripeFieldSx}>
            <CardNumberElement
              options={{ style: stripeElementStyle, showIcon: true }}
            />
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}
            >
              Expiration
            </Typography>
            <Box sx={stripeFieldSx}>
              <CardExpiryElement options={{ style: stripeElementStyle }} />
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.5 }}
            >
              CVC
            </Typography>
            <Box sx={stripeFieldSx}>
              <CardCvcElement options={{ style: stripeElementStyle }} />
            </Box>
          </Box>
        </Stack>
      </Stack>

      {errorMsg && (
        <Typography
          sx={{
            color: "#EF4444",
            fontSize: "12px",
            mb: 2,
            bgcolor: "#FEF2F2",
            p: 1,
            borderRadius: "6px",
          }}
        >
          {errorMsg}
        </Typography>
      )}

      <Stack spacing={1.2}>
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={processing || !stripe}
          startIcon={!processing && <LockOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: "#FF1572",
            color: "#ffffff",
            borderRadius: "12px",
            py: 1.3,
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(255, 21, 114, 0.25)",
            "&:hover": {
              bgcolor: "#FF1572",
              boxShadow: "0 6px 16px rgba(255, 21, 114, 0.35)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {processing ? (
            <CircularProgress size={22} sx={{ color: "#ffffff" }} />
          ) : (
            `Pay $${amount}`
          )}
        </Button>

        <Button
          fullWidth
          onClick={onBack}
          disabled={processing}
          sx={{
            color: "#6B7280",
            textTransform: "none",
            fontSize: "13px",
            fontWeight: 500,
            "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
          }}
        >
          Cancel
        </Button>
      </Stack>
    </form>
  );
};

const AiSubscriptionModal = ({
  open,
  onClose,
  onSubscribe,
  setSubscriptionsTrue,
}) => {
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creditAmount, setCreditAmount] = useState(100);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Purchase & Payment step states
  const [step, setStep] = useState("SELECTION"); // "SELECTION" | "PAYMENT"
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);

  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStep("SELECTION");
      setPurchaseResult(null);
      fetchPricingData();
    }
  }, [open]);

  // Fetch Pricing Plans on Open
  const fetchPricingData = async () => {
    setLoading(true);
    try {
      const response = await getCreditPricing();
      if (response?.data?.data) {
        const data = response.data.data;
        setPricingData(data);
        if (data.defaultCredits) {
          setCreditAmount(data.defaultCredits);
          // Trigger initial calculate price
          handleTriggerPriceCalculation(data.defaultCredits, data.pricePerCredit);
        }
      }
    } catch (error) {
      console.error("Failed to fetch credit pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic values extracted directly from API response
  const pricePerCredit = pricingData?.pricePerCredit ?? 0.1999;
  const minCredits = pricingData?.minCredits ?? 10;
  const maxCredits = pricingData?.maxCredits ?? 10000;
  const planName = pricingData?.planName || "Unlock AI Premium Feature";
  const planDescription =
    pricingData?.planDescription ||
    "Get access to create high-quality videos with AI. Choose a subscription plan that fits your needs and start creating today.";
  const featuresList =
    pricingData?.features && pricingData.features.length > 0
      ? pricingData.features
      : defaultFeatures;

  // Real-time backend calculation using /credits/calculate-price
  const handleTriggerPriceCalculation = (credits, rate = pricePerCredit) => {
    const numCredits = typeof credits === "number" ? credits : parseInt(credits, 10);
    if (isNaN(numCredits) || numCredits <= 0) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setCalculating(true);
      try {
        const res = await calculateCreditPrice({ credits: numCredits });
        if (res?.data?.data?.priceUsd !== undefined) {
          setCalculatedPrice(res.data.data.priceUsd);
        }
      } catch (err) {
        console.error("Failed to calculate credit price:", err);
      } finally {
        setCalculating(false);
      }
    }, 350);
  };

  const handleDecrease = () => {
    const current = typeof creditAmount === "number" ? creditAmount : minCredits;
    const newAmount = Math.max(minCredits, current - 10);
    setCreditAmount(newAmount);
    handleTriggerPriceCalculation(newAmount);
  };

  const handleIncrease = () => {
    const current = typeof creditAmount === "number" ? creditAmount : minCredits;
    const newAmount = Math.min(maxCredits, current + 10);
    setCreditAmount(newAmount);
    handleTriggerPriceCalculation(newAmount);
  };

  const handleCreditChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setCreditAmount("");
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setCreditAmount(num);
      handleTriggerPriceCalculation(num);
    }
  };

  const handleCreditBlur = () => {
    let finalVal = creditAmount;
    if (!creditAmount || creditAmount < minCredits) {
      finalVal = minCredits;
      setCreditAmount(minCredits);
    } else if (creditAmount > maxCredits) {
      finalVal = maxCredits;
      setCreditAmount(maxCredits);
    }
    handleTriggerPriceCalculation(finalVal);
  };

  // Helper for displaying price (uses API calculate result if available, or fallback to exact formula)
  const getDisplayPrice = () => {
    if (calculatedPrice !== null && calculatedPrice !== undefined) {
      return Number(calculatedPrice).toFixed(2);
    }
    const num = typeof creditAmount === "number" ? creditAmount : minCredits;
    return (num * pricePerCredit).toFixed(2);
  };

  // Purchase handler calling /credits/purchase with fallback to /auth/subscription/create-client-secret
  const handlePurchase = async () => {
    const finalCredits =
      typeof creditAmount === "number" ? creditAmount : minCredits;
    const finalPrice = parseFloat(getDisplayPrice()) || 10;
    setPurchaseLoading(true);

    let extractedSecret = null;
    let pIntentId = null;
    let purchasePayload = null;

    // 1. Try /credits/purchase first
    try {
      const response = await purchaseAiCredits({ credits: finalCredits });
      const body = response?.data;
      const data = body?.data || body;

      extractedSecret =
        data?.clientSecret ||
        data?.client_secret ||
        data?.paymentIntent?.client_secret ||
        data?.paymentIntent?.clientSecret ||
        body?.clientSecret ||
        body?.client_secret;

      pIntentId =
        data?.paymentIntentId ||
        data?.paymentIntent?.id ||
        data?.id ||
        body?.paymentIntentId;

      if (extractedSecret) {
        purchasePayload = {
          clientSecret: extractedSecret,
          paymentIntentId: pIntentId,
          credits: finalCredits,
          priceUsd: finalPrice,
          ...data,
        };
      }
    } catch (err) {
      console.warn(
        "purchaseAiCredits failed, attempting subscription secret fallback:",
        err
      );
    }

    // 2. If clientSecret wasn't retrieved from purchaseAiCredits, fallback to createSubscriptionClientSecret
    if (!extractedSecret) {
      try {
        const subRes = await createSubscriptionClientSecret({
          amount: finalPrice,
        });
        const subData = subRes?.data;
        if (subData?.clientSecret || subData?.data?.clientSecret) {
          extractedSecret =
            subData.clientSecret ||
            subData.data?.clientSecret ||
            subData.client_secret;
          pIntentId =
            subData.paymentIntentId ||
            subData.data?.paymentIntentId ||
            subData.id ||
            null;
          purchasePayload = {
            clientSecret: extractedSecret,
            paymentIntentId: pIntentId,
            credits: finalCredits,
            priceUsd: finalPrice,
          };
        }
      } catch (fallbackErr) {
        console.error(
          "createSubscriptionClientSecret fallback failed:",
          fallbackErr
        );
      }
    }

    setPurchaseLoading(false);

    if (extractedSecret) {
      setPurchaseResult(purchasePayload);
      setStep("PAYMENT");
    } else {
      toast.error(
        "Unable to start payment. Please check your network connection or try again."
      );
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    const purchasedCredits = Number(paymentResult?.credits || creditAmount || 0);

    const setUserData = useUserStore.getState().setUserData;
    if (setUserData) {
      setUserData((prev) => ({
        ...prev,
        credits: (prev?.credits || 0) + purchasedCredits,
        aiCredits: (prev?.aiCredits || 0) + purchasedCredits,
        hasAiSubscription: true,
      }));
    }

    // Refresh actual balance from server
    try {
      const balRes = await getCreditBalance();
      if (balRes?.data?.data) {
        const balData = balRes.data.data;
        if (setUserData) {
          setUserData((prev) => ({
            ...prev,
            credits: balData.availableBalance ?? balData.balance ?? (prev?.credits || 0) + purchasedCredits,
            aiCredits: balData.availableBalance ?? balData.balance ?? (prev?.aiCredits || 0) + purchasedCredits,
            hasAiSubscription: true,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to sync balance after payment:", err);
    }

    if (onSubscribe) {
      onSubscribe({
        creditAmount: paymentResult.credits,
        price: paymentResult.amount,
        paymentResult,
        purchaseResult,
        pricingData,
      });
    }
    setSubscriptionsTrue?.(true);
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: { xs: 2.5, sm: 3.5 },
          position: "relative",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
          m: 2,
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        aria-label="close"
        size="small"
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "#9CA3AF",
          "&:hover": {
            color: "#4B5563",
            bgcolor: "#F3F4F6",
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: "visible" }}>
        {loading && !pricingData ? (
          <Box sx={{ py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Skeleton variant="text" width="75%" height={32} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
            <Skeleton variant="rounded" width="100%" height={100} sx={{ my: 1 }} />
            <Skeleton variant="rounded" width="100%" height={44} />
            <Skeleton variant="rounded" width="100%" height={48} sx={{ mt: 1 }} />
          </Box>
        ) : step === "PAYMENT" && purchaseResult?.clientSecret ? (
          stripePromise ? (
            <Elements
              stripe={stripePromise}
              key={purchaseResult.clientSecret}
              options={{
                clientSecret: purchaseResult.clientSecret,
              }}
            >
              <AiCreditStripeForm
                clientSecret={purchaseResult.clientSecret}
                paymentIntentId={purchaseResult.paymentIntentId}
                credits={purchaseResult.credits || creditAmount}
                amount={purchaseResult.priceUsd || getDisplayPrice()}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep("SELECTION")}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <AiCreditStripeForm
              clientSecret={purchaseResult.clientSecret}
              paymentIntentId={purchaseResult.paymentIntentId}
              credits={purchaseResult.credits || creditAmount}
              amount={purchaseResult.priceUsd || getDisplayPrice()}
              onSuccess={handlePaymentSuccess}
              onBack={() => setStep("SELECTION")}
              onClose={onClose}
            />
          )
        ) : (
          <>
            {/* Title */}
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: "#000000",
                fontSize: { xs: "18px", sm: "18px" },
                lineHeight: 1.25,
                pr: 4,
                mb: 1,
              }}
            >
              {planName}
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                color: "#555555",
                fontSize: { xs: "11px", sm: "12px" },
                lineHeight: 1.45,
                mb: 2.5,
              }}
            >
              {planDescription}
            </Typography>

            {/* Price & Unit */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2.5 }}>
              <Typography
                sx={{
                  color: "#FF1572",
                  fontSize: { xs: "22px", sm: "26px" },
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                ${getDisplayPrice()}
              </Typography>
              <Typography
                sx={{
                  color: "#888888",
                  fontSize: { xs: "11px", sm: "12px" },
                  fontWeight: 500,
                }}
              >
                (${pricePerCredit} / credit)
              </Typography>
              {calculating && (
                <CircularProgress size={14} sx={{ color: "#FF1572", ml: 0.5 }} />
              )}
            </Box>

            {/* Feature List */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {featuresList.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <VerifiedRoundedIcon
                    sx={{
                      color: "#FF1572",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      color: "#555555",
                      fontSize: { xs: "11px", sm: "12px" },
                      fontWeight: 500,
                    }}
                  >
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Credit Amount Section */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    color: "#555555",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  Credit Amount
                </Typography>
                <Typography
                  sx={{
                    color: "#888888",
                    fontSize: "11px",
                    fontWeight: 400,
                  }}
                >
                  Min: {minCredits} • Max: {maxCredits.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                {/* Minus button */}
                <IconButton
                  onClick={handleDecrease}
                  disabled={creditAmount <= minCredits || purchaseLoading}
                  sx={{
                    width: 44,
                    height: 44,
                    border: "1px solid #00000052",
                    borderRadius: "10px",
                    color: "#555555",
                    "&:hover": {
                      borderColor: "#9CA3AF",
                      bgcolor: "#F9FAFB",
                    },
                    "&.Mui-disabled": {
                      borderColor: "#00000020",
                      color: "#D1D5DB",
                    },
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                {/* Credit amount display / input */}
                <Box
                  sx={{
                    flex: 1,
                    height: 44,
                    border: "1px solid #00000052",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    "&:focus-within": {
                      borderColor: "#FF1572",
                      boxShadow: "0 0 0 1px #FF1572",
                    },
                  }}
                >
                  <Box
                    component="input"
                    type="number"
                    value={creditAmount}
                    onChange={handleCreditChange}
                    onBlur={handleCreditBlur}
                    min={minCredits}
                    max={maxCredits}
                    disabled={purchaseLoading}
                    sx={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#111827",
                      width: "100%",
                      fontFamily: "inherit",
                      "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                      "&[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                  />
                </Box>

                {/* Plus button */}
                <IconButton
                  onClick={handleIncrease}
                  disabled={creditAmount >= maxCredits || purchaseLoading}
                  sx={{
                    width: 44,
                    height: 44,
                    border: "1px solid #00000052",
                    borderRadius: "10px",
                    color: "#555555",
                    "&:hover": {
                      borderColor: "#9CA3AF",
                      bgcolor: "#F9FAFB",
                    },
                    "&.Mui-disabled": {
                      borderColor: "#00000020",
                      color: "#D1D5DB",
                    },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Subscribe Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handlePurchase}
              disabled={purchaseLoading || loading}
              sx={{
                bgcolor: "#FF1572",
                color: "#ffffff",
                borderRadius: "12px",
                py: 1.4,
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(255, 21, 114, 0.25)",
                "&:hover": {
                  bgcolor: "#FF1572",
                  boxShadow: "0 6px 16px rgba(255, 21, 114, 0.35)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {purchaseLoading ? (
                <CircularProgress size={22} sx={{ color: "#ffffff" }} />
              ) : (
                `Subscribe • $${getDisplayPrice()}`
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiSubscriptionModal;
