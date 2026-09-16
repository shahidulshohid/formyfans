import { Box, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCartStore from "../../../zustand/cartStore";
import {
  formatMoney,
  validateSingleCreatorSelection,
} from "../../../utils/cartHelpers";

const OrderSummary = ({ subTotal, shippingCharge, estimatedTax, total }) => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);

  const handleProceed = () => {
    const check = validateSingleCreatorSelection(items);
    if (!check.valid) {
      toast.error(check.message);
      return;
    }
    navigate("/shipping-detail");
  };

  return (
    <Grid item xs={12} md={4}>
      <Box
        sx={{
          bgcolor: "#FF1572",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          color: "white",
        }}
      >
        <Box sx={{ p: 4 }}>
          <Typography
            fontSize={16}
            fontWeight={600}
            mb={2}
            color="white"
            textAlign="center"
          >
            Order Summary
          </Typography>

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Typography
              fontSize={13}
              fontWeight={500}
              color="white"
              sx={{ opacity: 0.9 }}
            >
              Sub Total:
            </Typography>
            <Typography fontSize={14} fontWeight={600} color="white">
              {formatMoney(subTotal)}
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Typography
              fontSize={13}
              fontWeight={500}
              color="white"
              sx={{ opacity: 0.9 }}
            >
              Shipping Charge:
            </Typography>
            <Typography fontSize={14} fontWeight={600} color="white">
              {formatMoney(shippingCharge)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              pt: 1.5,
              borderTop: "1px solid rgba(255,255,255,0.3)",
              mb: 2,
            }}
          >
            <Typography fontSize={14} fontWeight={600} color="white">
              Total:
            </Typography>
            <Typography fontSize={16} fontWeight={700} color="white">
              {formatMoney(total)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center">
            <Button
              fullWidth
              onClick={handleProceed}
              sx={{
                py: 1.5,
                bgcolor: "white",
                color: "#FF1572",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                maxWidth: 275,
                borderRadius: "22px",
                height: 37,
              }}
            >
              Proceed to Shipping Details
            </Button>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

export default OrderSummary;
