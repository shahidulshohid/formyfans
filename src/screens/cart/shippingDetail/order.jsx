import { Box, Button, Container, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/header";
import check from "../../../assets/images/tick.png";
import { loadLastOrderIds } from "../../../utils/orderResponse";

const Order = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderIds = (() => {
    const fromState = location.state?.orderIds;
    if (Array.isArray(fromState) && fromState.length > 0) {
      return fromState.filter(Boolean);
    }
    if (location.state?.orderId) {
      return [location.state.orderId];
    }
    return loadLastOrderIds();
  })();

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "#D0FCE6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <img src={check} alt="check" />
          </Box>

          <Typography variant="h4" fontWeight={600} color="#5E1321" mb={1}>
            Thank you for your order!
          </Typography>

          <Typography variant="body1" color="#8E8E8E" mb={4}>
            Your order has been received successfully.
          </Typography>

          {orderIds.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              {orderIds.map((id) => (
                <Box
                  key={id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#FFFFFF",
                    borderRadius: 4,
                    px: 4,
                    py: 2,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Typography variant="h6" fontWeight={600} color="#333">
                    Order ID:
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="#FF1572">
                    {id}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}

          <Button
            variant="contained"
            onClick={() => navigate("/my-orders")}
            sx={{
              mt: 4,
              bgcolor: "#FF1572",
              color: "white",
              textTransform: "none",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: "22px",
              px: 4,
              py: 1.25,
              minWidth: 220,
              "&:hover": { bgcolor: "#E01260" },
            }}
          >
            View My Orders
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default Order;
