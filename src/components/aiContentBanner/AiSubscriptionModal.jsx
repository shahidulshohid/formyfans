import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

const features = [
  "AI Video Generation",
  "AI Image Generation",
  "AI Video Editing",
];

const AiSubscriptionModal = ({ open, onClose, onSubscribe }) => {
  const [creditAmount, setCreditAmount] = useState(100);

  const handleDecrease = () => {
    setCreditAmount((prev) => Math.max(10, prev - 10));
  };

  const handleIncrease = () => {
    setCreditAmount((prev) => prev + 10);
  };

  const calculatePrice = (credits) => {
    return (credits * 0.1999).toFixed(2);
  };

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe({ creditAmount, price: calculatePrice(creditAmount) });
    }
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
          Unlock AI Premium Feature
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            color: "#555555",
            fontSize: { xs: "10px", sm: "12px" },
            lineHeight: 1.45,
            mb: 2.5,
          }}
        >
          Get access to create high-quality videos with AI. Choose a
          subscription plan that fits your needs and start creating today.
        </Typography>

        {/* Price */}
        <Typography
          sx={{
            color: "#FF1572",
            fontSize: { xs: "20px", sm: "24px" },
            fontWeight: 600,
            lineHeight: 1.1,
            mb: 2.5,
          }}
        >
          ${calculatePrice(creditAmount)}
        </Typography>

        {/* Feature List */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {features.map((feature, index) => (
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
                  fontSize: { xs: "10px", sm: "12px" },
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
          <Typography
            sx={{
              color: "#555555",
              fontSize: "12px",
              fontWeight: 500,
              mb: 1,
            }}
          >
            Credit Amount
          </Typography>

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
              disabled={creditAmount <= 10}
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
                  borderColor: "#00000052",
                  color: "#D1D5DB",
                },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            {/* Credit amount display */}
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
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#555555",
                }}
              >
                {creditAmount}
              </Typography>
            </Box>

            {/* Plus button */}
            <IconButton
              onClick={handleIncrease}
              sx={{
                width: 44,
                height: 44,
                border: "1px solid #00000052",
                borderRadius: "10px",
                color: "#555555",
                "&:hover": {
                  borderColor: "#00000052",
                  bgcolor: "#F9FAFB",
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
      </DialogContent>
    </Dialog>
  );
};

export default AiSubscriptionModal;
