import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import { toast } from "react-toastify";
import { getCreditPricing, updateCreditPricing } from "../../api/aiContent/credits";

/**
 * AdminCreditPricingForm Component
 * Manages credit pricing configurations including reservationSafetyMultiplier
 * Validation: Minimum: 1, Maximum: 10, Default: 2
 */
const AdminCreditPricingForm = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservationSafetyMultiplier, setReservationSafetyMultiplier] = useState(2);
  const [pricePerCredit, setPricePerCredit] = useState(0.1999);
  const [minCredits, setMinCredits] = useState(10);
  const [maxCredits, setMaxCredits] = useState(10000);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      loadPricing();
    }
  }, [open]);

  const loadPricing = async () => {
    setLoading(true);
    setErrors({});
    try {
      const res = await getCreditPricing();
      const data = res?.data?.data || res?.data || {};
      if (data.reservationSafetyMultiplier !== undefined) {
        setReservationSafetyMultiplier(Number(data.reservationSafetyMultiplier));
      } else {
        setReservationSafetyMultiplier(2);
      }
      if (data.pricePerCredit !== undefined) {
        setPricePerCredit(data.pricePerCredit);
      }
      if (data.minCredits !== undefined) {
        setMinCredits(data.minCredits);
      }
      if (data.maxCredits !== undefined) {
        setMaxCredits(data.maxCredits);
      }
    } catch (err) {
      console.error("Failed to load credit pricing:", err);
      toast.error("Could not load credit pricing settings");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    const mult = Number(reservationSafetyMultiplier);
    if (isNaN(mult) || mult < 1 || mult > 10) {
      errs.reservationSafetyMultiplier =
        "Reservation safety multiplier must be between 1 and 10.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        reservationSafetyMultiplier: Number(reservationSafetyMultiplier),
        pricePerCredit: Number(pricePerCredit),
        minCredits: Number(minCredits),
        maxCredits: Number(maxCredits),
      };

      const res = await updateCreditPricing(payload);
      toast.success(res?.data?.message || "Credit pricing updated successfully!");
      if (onSuccess) onSuccess(res?.data?.data || payload);
      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to update credit pricing:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update credit pricing settings";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: { xs: 1, sm: 2 },
          fontFamily: "Inter, sans-serif",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TuneIcon sx={{ color: "#FF1572" }} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "18px",
              fontFamily: "Inter, sans-serif",
              color: "#111827",
            }}
          >
            Admin Credit Pricing Configuration
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#FF1572" }} />
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* reservationSafetyMultiplier field */}
            <Box>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  mb: 0.5,
                  color: "#374151",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Reservation Safety Multiplier *
              </Typography>
              <TextField
                fullWidth
                type="number"
                inputProps={{ min: 1, max: 10, step: 0.1 }}
                value={reservationSafetyMultiplier}
                onChange={(e) => {
                  setReservationSafetyMultiplier(e.target.value);
                  if (errors.reservationSafetyMultiplier) {
                    setErrors((prev) => ({ ...prev, reservationSafetyMultiplier: null }));
                  }
                }}
                error={Boolean(errors.reservationSafetyMultiplier)}
                helperText={
                  errors.reservationSafetyMultiplier ||
                  "Safety multiplier for credit reservation hold (Min: 1, Max: 10, Default: 2)"
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Box>

            {/* Price Per Credit */}
            <Box>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  mb: 0.5,
                  color: "#374151",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Price Per Credit ($)
              </Typography>
              <TextField
                fullWidth
                type="number"
                inputProps={{ min: 0.01, step: 0.0001 }}
                value={pricePerCredit}
                onChange={(e) => setPricePerCredit(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Box>

            {/* Min / Max Credits Row */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                    color: "#374151",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Min Credits
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ min: 1 }}
                  value={minCredits}
                  onChange={(e) => setMinCredits(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                    color: "#374151",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Max Credits
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ min: 1 }}
                  value={maxCredits}
                  onChange={(e) => setMaxCredits(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#6B7280",
            textTransform: "none",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || submitting}
          sx={{
            bgcolor: "#FF1572",
            color: "#FFFFFF",
            borderRadius: "8px",
            textTransform: "none",
            px: 3,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            "&:hover": {
              bgcolor: "#E00E61",
            },
          }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: "#FFF" }} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminCreditPricingForm;
