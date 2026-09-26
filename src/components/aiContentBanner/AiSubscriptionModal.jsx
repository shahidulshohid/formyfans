import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { getCreditPricing } from "../../api/aiContent";

const defaultFeatures = [
  "AI Video Generation",
  "AI Image Generation",
  "AI Video Editing",
];

const AiSubscriptionModal = ({
  open,
  onClose,
  onSubscribe,
  setSubscriptionsTrue,
}) => {
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creditAmount, setCreditAmount] = useState(100);

  useEffect(() => {
    if (open) {
      fetchPricingData();
    }
  }, [open]);

  const fetchPricingData = async () => {
    setLoading(true);
    try {
      const response = await getCreditPricing();
      if (response?.data?.data) {
        const data = response.data.data;
        setPricingData(data);
        if (data.defaultCredits) {
          setCreditAmount(data.defaultCredits);
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

  const handleDecrease = () => {
    setCreditAmount((prev) => {
      const current = typeof prev === "number" ? prev : minCredits;
      return Math.max(minCredits, current - 10);
    });
  };

  const handleIncrease = () => {
    setCreditAmount((prev) => {
      const current = typeof prev === "number" ? prev : minCredits;
      return Math.min(maxCredits, current + 10);
    });
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
    }
  };

  const handleCreditBlur = () => {
    if (!creditAmount || creditAmount < minCredits) {
      setCreditAmount(minCredits);
    } else if (creditAmount > maxCredits) {
      setCreditAmount(maxCredits);
    }
  };

  const calculatePrice = (credits) => {
    const num = typeof credits === "number" ? credits : minCredits;
    return (num * pricePerCredit).toFixed(2);
  };

  const handleSubscribe = () => {
    const finalCredits = typeof creditAmount === "number" ? creditAmount : minCredits;
    if (onSubscribe) {
      onSubscribe({
        creditAmount: finalCredits,
        price: calculatePrice(finalCredits),
        pricePerCredit,
        planName,
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
                ${calculatePrice(creditAmount)}
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
                  disabled={creditAmount <= minCredits}
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
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={handleCreditChange}
                    onBlur={handleCreditBlur}
                    min={minCredits}
                    max={maxCredits}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#555555",
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                </Box>

                {/* Plus button */}
                <IconButton
                  onClick={handleIncrease}
                  disabled={creditAmount >= maxCredits}
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
              onClick={handleSubscribe}
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
              Subscribe
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiSubscriptionModal;
