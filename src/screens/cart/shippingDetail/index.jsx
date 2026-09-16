import { useState, useCallback, useMemo } from "react";

import { Box, Container, Grid, Typography, Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import Header from "../../../components/header";

import DeliveryForm from "./deliveryForm";

import OrderSummary from "./orderSummary";

import { StripePaymentPopup } from "../../../components/pops";

import useCartStore from "../../../zustand/cartStore";

import {
  calcCartTotals,
  groupSelectedItemsByCreator,
  validateSingleCreatorSelection,
} from "../../../utils/cartHelpers";

import {
  buildOrderPayload,
  calcOrderTotalsForItems,
  validateShippingForm,
} from "../../../utils/orderPayload";

import { useOrder } from "../../../hook/order";

import { saveLastOrderIds } from "../../../utils/orderResponse";

const INITIAL_SHIPPING = {
  name: "",

  phone: "",

  city: "",

  email: "",

  address: "",

  state: "",

  zip: "",
};

const ShippingDetail = () => {
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);

  const removeSelectedItems = useCartStore((s) => s.removeSelectedItems);

  const { placeOrder } = useOrder();

  const [shipping, setShipping] = useState(INITIAL_SHIPPING);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [stripeOpen, setStripeOpen] = useState(false);

  const [orderPlacedOnline, setOrderPlacedOnline] = useState(false);

  const [pendingOrderId, setPendingOrderId] = useState(null);

  const selectionCheck = useMemo(
    () => validateSingleCreatorSelection(items),
    [items],
  );

  const hasSelectedItems = selectionCheck.valid;

  const { total } = useMemo(() => calcCartTotals(items), [items]);

  const handleShippingChange = useCallback((key, value) => {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }, []);

  const validateCheckout = useCallback(() => {
    const creatorCheck = validateSingleCreatorSelection(items);

    if (!creatorCheck.valid) {
      toast.error(creatorCheck.message);

      return false;
    }

    const missing = validateShippingForm(shipping);

    if (missing.length > 0) {
      toast.error("Please fill all delivery fields first");

      return false;
    }

    return true;
  }, [items, shipping]);

  /** Pay Now step 1: orders/create → orderId for create-client-secret */

  const resolveOrderIdForPayment = useCallback(async () => {
    if (pendingOrderId) return pendingOrderId;

    const creatorGroups = groupSelectedItemsByCreator(items);

    const group = creatorGroups[0];

    const totals = calcOrderTotalsForItems(group.items);

    const payload = buildOrderPayload({
      creatorId: group.creatorId,

      items: group.items,

      shipping,

      paymentMethod: "online",

      stripePayment: null,

      totals,
    });

    const result = await placeOrder(payload);

    if (!result?.success) return null;

    const orderId = result.data?.orderId;

    if (!orderId) {
      toast.error("Order ID not returned from server");

      return null;
    }

    setPendingOrderId(orderId);

    return orderId;
  }, [items, shipping, placeOrder, pendingOrderId]);

  const handlePaymentComplete = useCallback(
    ({ orderId, order }) => {
      setOrderPlacedOnline(true);

      setStripeOpen(false);

      saveLastOrderIds([orderId]);

      removeSelectedItems();

      navigate("/order", {
        replace: true,

        state: { orderIds: [orderId], orderId, order },
      });
    },

    [navigate, removeSelectedItems],
  );

  const handlePaymentMethodChange = useCallback(
    (method) => {
      if (method === "online") {
        if (orderPlacedOnline) return;

        if (!validateCheckout()) return;

        setPaymentMethod("online");

        setStripeOpen(true);
      } else {
        setPaymentMethod("cod");

        setStripeOpen(false);

        if (!orderPlacedOnline) {
          setPendingOrderId(null);
        }
      }
    },

    [orderPlacedOnline, validateCheckout],
  );

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box display="flex" gap={9} justifyContent="center" mb={4}>
          <Box
            display="flex"
            gap={4}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/cart")}
          >
            <Box
              sx={{
                width: 33,

                bgcolor: "#8E8E8E",

                height: 33,

                borderRadius: "50%",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",
              }}
            >
              <Typography fontSize={16} fontWeight={600} color="white">
                1
              </Typography>
            </Box>

            <Typography fontSize={18} fontWeight={600} color="#8E8E8E" mb={3}>
              Shopping Cart
            </Typography>
          </Box>

          <Box
            sx={{
              width: 132,

              height: 2,

              bgcolor: "#5E1321",

              alignSelf: "center",

              mt: -3,
            }}
          />

          <Box display="flex" gap={4}>
            <Box
              sx={{
                width: 33,

                bgcolor: "#5E1321",

                height: 33,

                borderRadius: "50%",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",
              }}
            >
              <Typography fontSize={16} fontWeight={600} color="white">
                2
              </Typography>
            </Box>

            <Typography fontSize={18} fontWeight={600} color="#5E1321" mb={3}>
              Shipping Details
            </Typography>
          </Box>
        </Box>

        {!hasSelectedItems ? (
          <Box
            sx={{
              bgcolor: "white",

              borderRadius: 3,

              p: 6,

              textAlign: "center",

              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",

              maxWidth: 560,

              mx: "auto",
            }}
          >
            <Typography fontSize={18} fontWeight={600} color="#5E1321" mb={1}>
              No products selected
            </Typography>

            <Typography fontSize={14} color="#8E8E8E" mb={3}>
              {items.length === 0
                ? "Your cart is empty. Add items from the marketplace first."
                : "Go back to cart and select items before checkout."}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/cart")}
              sx={{
                bgcolor: "#FF1572",

                textTransform: "none",

                fontWeight: 600,

                borderRadius: 22,

                px: 4,

                "&:hover": { bgcolor: "#E01260" },
              }}
            >
              Back to Shopping Cart
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item size={{ xs: 12, md: 6 }}>
              <DeliveryForm
                shipping={shipping}
                onShippingChange={handleShippingChange}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                stripePaymentComplete={orderPlacedOnline}
              />
            </Grid>

            <Grid
              item
              size={{ xs: 12, md: 6 }}
              sx={{
                display: "flex",

                flexDirection: "column",

                alignItems: { xs: "stretch", md: "flex-end" },
              }}
            >
              <OrderSummary
                shipping={shipping}
                paymentMethod={paymentMethod}
                orderPlacedOnline={orderPlacedOnline}
              />
            </Grid>
          </Grid>
        )}
      </Container>

      <StripePaymentPopup
        open={stripeOpen}
        onClose={() => setStripeOpen(false)}
        amount={total}
        onValidate={validateCheckout}
        onResolveOrderId={resolveOrderIdForPayment}
        onComplete={handlePaymentComplete}
      />
    </>
  );
};

export default ShippingDetail;
