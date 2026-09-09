import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { formatMoney } from "../../utils/cartHelpers";

const PaymentConfirmedPopup = ({
  open = false,
  onClose,
  message = "Payment confirmed",
  orderId,
  paymentStatus,
  totalAmount,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(94, 19, 33, 0.18)",
        },
      }}
    >
      <DialogContent sx={{ pt: 3.5, pb: 1, px: 3, textAlign: "center" }}>
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
            bgcolor: "#D0FCE6",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40, color: "#0CA904" }} />
        </Box>

        <Typography fontSize={22} fontWeight={700} color="#5E1321" mb={1}>
          {message || "Payment confirmed"}
        </Typography>

        {orderId ? (
          <Typography fontSize={14} fontWeight={600} color="#FF1572" mb={1}>
            Order ID: {orderId}
          </Typography>
        ) : null}

        {paymentStatus ? (
          <Typography fontSize={13} color="#0CA904" fontWeight={600} mb={1}>
            Status: {paymentStatus}
          </Typography>
        ) : null}

        {totalAmount != null ? (
          <Typography fontSize={14} color="#666" mb={1}>
            Amount paid: {formatMoney(totalAmount)}
          </Typography>
        ) : null}

        <Typography fontSize={14} color="#8E8E8E" lineHeight={1.6} mt={1}>
          Ab <strong>Confirm Order</strong> dabayein — phir thank you page par
          redirect ho jayega.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={onClose}
          fullWidth
          sx={{
            bgcolor: "#FF1572",
            borderRadius: "22px",
            py: 1.25,
            textTransform: "none",
            fontWeight: 600,
            maxWidth: 280,
            "&:hover": { bgcolor: "#E01260" },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentConfirmedPopup;
