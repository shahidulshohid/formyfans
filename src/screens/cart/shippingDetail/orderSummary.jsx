import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import MicImage from "../../../assets/icon/mic.jpg";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCartStore from "../../../zustand/cartStore";
import {
  calcCartTotals,
  formatMoney,
  groupSelectedItemsByCreator,
  validateSingleCreatorSelection,
} from "../../../utils/cartHelpers";
import {
  buildOrderPayload,
  calcOrderTotalsForItems,
  validateShippingForm,
} from "../../../utils/orderPayload";
import { useOrder } from "../../../hook/order";
import {
  extractOrderIds,
  saveLastOrderIds,
} from "../../../utils/orderResponse";

const OrderSummary = ({ shipping, paymentMethod, stripePayment }) => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeSelectedItems = useCartStore((s) => s.removeSelectedItems);
  const { placeOrders, loading } = useOrder();

  const selectedItems = items.filter((item) => item.selected);
  const { subTotal, shippingCharge, estimatedTax, total } =
    calcCartTotals(items);

  const handleQuantityChange = (cartItemId, change) => {
    const item = items.find((i) => i.cartItemId === cartItemId);
    if (!item) return;
    updateQuantity(cartItemId, item.quantity + change);
  };

  const handleConfirmOrder = async () => {
    const creatorCheck = validateSingleCreatorSelection(items);
    if (!creatorCheck.valid) {
      toast.error(creatorCheck.message);
      return;
    }

    const missing = validateShippingForm(shipping);
    if (missing.length > 0) {
      toast.error("Please fill all delivery fields");
      return;
    }

    const creatorGroups = groupSelectedItemsByCreator(items);
    const group = creatorGroups[0];
    const totals = calcOrderTotalsForItems(group.items);

    if (paymentMethod === "online") {
      if (orderPlacedOnline) {
        toast.info("Order already placed. Check thank you page.");
        navigate("/order", { replace: true });
      } else {
        toast.error("Please complete payment using Pay Now");
      }
      return;
    }

    const payload = buildOrderPayload({
      creatorId: group.creatorId,
      items: group.items,
      shipping,
      paymentMethod,
      stripePayment,
      totals,
    });

    const result = await placeOrders([payload]);
    if (!result?.success) return;

    const orderIds = extractOrderIds(result.data);
    saveLastOrderIds(orderIds);
    toast.success("Order placed successfully");
    navigate("/order", {
      replace: true,
      state: { orderIds, orderId: orderIds[0] },
    });
    removeSelectedItems();
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: 4,
        p: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        height: "fit-content",
        width: { xs: "100%", md: 433 },
      }}
    >
      <Typography fontSize={18} fontWeight={600} color="#5E1321" mb={3}>
        Order Summary
      </Typography>

      {selectedItems.length === 0 ? (
        <Box py={3} textAlign="center">
          <Typography fontSize={14} color="#8E8E8E" mb={2}>
            No products selected. Go back to cart and select items.
          </Typography>
          <Button
            onClick={() => navigate("/cart")}
            sx={{ textTransform: "none", color: "#FF1572", fontWeight: 600 }}
          >
            Back to Shopping Cart
          </Button>
        </Box>
      ) : (
        <>
          {selectedItems.map((item) => {
            const originalUnitPrice =
              Number(item.listUnitPrice) > 0
                ? item.listUnitPrice
                : item.unitPrice;
            const variantLabel = [item.size, item.colour]
              .filter(Boolean)
              .join(" · ");

            return (
              <Box
                key={item.cartItemId}
                sx={{ display: "flex", alignItems: "center", mb: 3 }}
              >
                <Box
                  component="img"
                  src={item.image || MicImage}
                  alt={item.productName}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    objectFit: "cover",
                    mr: 2,
                  }}
                />

                <Box flex={1} minWidth={0}>
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    color="#5E1321"
                    sx={{ textTransform: "uppercase" }}
                  >
                    {item.productName}
                  </Typography>
                  {variantLabel ? (
                    <Typography fontSize={11} color="#8E8E8E" fontWeight={500}>
                      Size: {item.size || "—"} · Colour: {item.colour || "—"}
                    </Typography>
                  ) : null}
                  <Typography fontSize={14} fontWeight={700} color="#FF1572">
                    {formatMoney(originalUnitPrice)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #74002E",
                    borderRadius: 2,
                    overflow: "hidden",
                    width: 102,
                    height: 46,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.cartItemId, -1)}
                    disabled={item.quantity <= 1}
                    sx={{ borderRadius: 0, p: 0, width: 34, height: 46 }}
                  >
                    <RemoveIcon sx={{ fontSize: 20, color: "#74002E" }} />
                  </IconButton>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      width: 34,
                      textAlign: "center",
                      lineHeight: "46px",
                    }}
                  >
                    {String(item.quantity).padStart(2, "0")}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.cartItemId, 1)}
                    disabled={item.quantity >= item.maxQuantity}
                    sx={{ borderRadius: 0, p: 0, width: 34, height: 46 }}
                  >
                    <AddIcon sx={{ fontSize: 20, color: "#74002E" }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}

          <Box sx={{ borderTop: "1px solid #000000", my: 3 }} />

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Typography fontSize={18} fontWeight={600} color="#5E1321">
              Sub Total
            </Typography>
            <Typography fontSize={18} fontWeight={600} color="#5E1321">
              {formatMoney(subTotal)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography fontSize={18} fontWeight={600} color="#5E1321">
              Shipping
            </Typography>
            <Typography fontSize={18} fontWeight={600} color="#5E1321">
              {formatMoney(shippingCharge)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
              pt: 2,
              borderTop: "1px solid #000000",
            }}
          >
            <Typography fontSize={18} fontWeight={600} color="#5E1321">
              Total
            </Typography>
            <Typography fontSize={18} fontWeight={600} color="#5E1321">
              {formatMoney(total)}
            </Typography>
          </Box>

          {paymentMethod === "online" ? (
            <Typography fontSize={13} color="#8E8E8E" textAlign="center" px={1}>
              Online order: select <strong>Online Payment</strong> →{" "}
              <strong>Pay Now</strong> (order auto-complete ho jayega)
            </Typography>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={handleConfirmOrder}
                disabled={selectedItems.length === 0 || loading}
                sx={{
                  bgcolor: "#FF1572",
                  color: "white",
                  py: 1.5,
                  borderRadius: 22,
                  fontSize: 16,
                  fontWeight: 600,
                  height: 37,
                  width: 275,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#E01260" },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Confirm Order"
                )}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default OrderSummary;
