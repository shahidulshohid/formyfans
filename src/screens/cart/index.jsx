import { Box, Container, Grid, Typography, Button } from "@mui/material";
import MicImage from "../../assets/icon/mic.jpg";
import CapImage from "../../assets/images/cap.jpg";
import Header from "../../components/header";
import ConfirmPopup from "../../components/pops";
import OrderSummary from "./shoppingCart/orderSummary";
import CartItems from "./shoppingCart/cartItems";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useCartStore from "../../zustand/cartStore";
import {
  calcCartTotals,
  groupCartByCreator,
  needsCreatorEnrichment,
  validateSingleCreatorSelection,
} from "../../utils/cartHelpers";
import { toast } from "react-toastify";
import { enrichCartCreatorNames } from "../../utils/enrichCartCreators";

const Cart = () => {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const items = useCartStore((s) => s.items);
  const creatorRegistry = useCartStore((s) => s.creatorRegistry);
  const toggleItemSelected = useCartStore((s) => s.toggleItemSelected);
  const toggleCreatorSelected = useCartStore((s) => s.toggleCreatorSelected);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeSelectedItems = useCartStore((s) => s.removeSelectedItems);
  const enrichItemsWithCreators = useCartStore(
    (s) => s.enrichItemsWithCreators,
  );
  const setCreatorRegistry = useCartStore((s) => s.setCreatorRegistry);

  useEffect(() => {
    if (!items.some(needsCreatorEnrichment)) return;

    let cancelled = false;
    (async () => {
      const { updates, registry } = await enrichCartCreatorNames(items);
      if (cancelled) return;
      if (Object.keys(updates).length > 0) {
        enrichItemsWithCreators(updates);
      }
      if (Object.keys(registry).length > 0) {
        setCreatorRegistry(registry);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, enrichItemsWithCreators, setCreatorRegistry]);

  const cartVendors = groupCartByCreator(items, creatorRegistry);
  const { subTotal, shippingCharge, estimatedTax, total } =
    calcCartTotals(items);
  const selectedCount = items.filter((i) => i.selected).length;

  const handleRemoveClick = (cartItemId) => {
    const item = items.find((i) => i.cartItemId === cartItemId);
    if (item) {
      setDeleteTarget({ type: "single", cartItemId, name: item.name });
    }
  };

  const handleBulkRemoveClick = () => {
    if (selectedCount === 0) return;
    setDeleteTarget({ type: "bulk", count: selectedCount });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "single") {
      removeItem(deleteTarget.cartItemId);
    } else {
      removeSelectedItems();
    }
    setDeleteTarget(null);
  };

  const deletePopupMessage =
    deleteTarget?.type === "bulk"
      ? `Remove ${deleteTarget.count} selected item${deleteTarget.count > 1 ? "s" : ""} from your cart?`
      : deleteTarget
        ? `Remove "${deleteTarget.name}" from your cart?`
        : "";

  const handleProceedToShipping = () => {
    const check = validateSingleCreatorSelection(items);
    if (!check.valid) {
      toast.error(check.message);
      return;
    }
    navigate("/shipping-detail");
  };

  const interestedProducts = [
    { id: 3, name: "MERILAND HOODIE", price: 79.0, image: MicImage },
  ];

  const mostSoldProducts = [
    { image: MicImage },
    { image: CapImage },
    { image: MicImage },
    { image: CapImage },
  ];

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box display="flex" gap={9} justifyContent="center">
          <Box sx={{ width: 132, height: 0 }} />
          <Box
            display="flex"
            gap={4}
            onClick={() => navigate("/cart")}
            sx={{ cursor: "pointer" }}
          >
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
                1
              </Typography>
            </Box>
            <Typography fontSize={18} fontWeight={600} color="#5E1321" mb={3}>
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
          <Box
            display="flex"
            gap={4}
            onClick={handleProceedToShipping}
            sx={{ cursor: "pointer" }}
          >
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
            <Typography fontSize={18} fontWeight={600} color="#8E8E8E" mb={3}>
              Shipping Details
            </Typography>
          </Box>
        </Box>

        <Grid justifyContent="center" mt={4} container spacing={6}>
          <Grid item xs={12} md={8} width={600}>
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: 3,
                p: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
              }}
            >
              <Typography
                variant="h5"
                fontSize={18}
                fontWeight={600}
                mb={1}
                color="#5E1321"
              >
                Shopping Cart
              </Typography>
              {cartVendors.length > 1 ? (
                <Typography fontSize={12} color="#8E8E8E" mb={2}>
                  You can order from one creator at a time. Selecting a product
                  will unselect items from other creators.
                </Typography>
              ) : null}

              {cartVendors.length === 0 ? (
                <Box py={4} textAlign="center">
                  <Typography color="#8E8E8E" mb={2}>
                    Your cart is empty
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/market-place")}
                    sx={{ textTransform: "none", borderRadius: "22px" }}
                  >
                    Browse Marketplace
                  </Button>
                </Box>
              ) : (
                <>
                  <CartItems
                    cartVendors={cartVendors}
                    onToggleVendor={toggleCreatorSelected}
                    onToggleItem={toggleItemSelected}
                    onRemoveItem={handleRemoveClick}
                    onUpdateQuantity={updateQuantity}
                  />

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      onClick={handleBulkRemoveClick}
                      disabled={selectedCount === 0}
                      sx={{
                        color: "#FF1572",
                        fontSize: 16,
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      Cancel Orders X
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Grid>

          <OrderSummary
            subTotal={subTotal}
            shippingCharge={shippingCharge}
            estimatedTax={estimatedTax}
            total={total}
          />
        </Grid>

        {/* <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12} md={7}>
                        <Typography fontSize={18} fontWeight={600} color="#5E1321" mb={1}>
                            You may also be interested in these deals
                        </Typography>
                        <Typography fontSize={11} color="#8E8E8E" mb={3} sx={{ maxWidth: 500 }}>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </Typography>
                        <Box>
                            {interestedProducts.map((product) => (
                                <Box
                                    key={product.id}
                                    sx={{
                                        display: "flex",
                                        bgcolor: "white",
                                        borderRadius: 15,
                                        p: { xs: 2, md: 3 },
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                        maxWidth: "100%",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={product.image}
                                        alt={product.name}
                                        sx={{
                                            width: 80,
                                            height: 70,
                                            borderRadius: 2,
                                            objectFit: "cover",
                                            mr: 2,
                                        }}
                                    />
                                    <Box flex={1}>
                                        <Box
                                            display="flex"
                                            flexDirection={{ xs: "column", sm: "row" }}
                                            gap={{ xs: 1, sm: 2, md: 14 }}
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                        >
                                            <Typography fontSize={14} fontWeight={600} color="#5E1321">
                                                {product.name}
                                            </Typography>
                                            <Typography fontSize={16} fontWeight={700} color="#5E1321">
                                                ${product.price.toFixed(2)}
                                            </Typography>
                                            <Button
                                                size="small"
                                                onClick={() => navigate("/market-place")}
                                                sx={{
                                                    bgcolor: "#5E1321",
                                                    borderRadius: 8,
                                                    textTransform: "none",
                                                    color: "white",
                                                    fontSize: 16,
                                                    px: 2,
                                                    py: 0.5,
                                                    width: 139,
                                                    height: 37,
                                                    fontWeight: 400,
                                                }}
                                            >
                                                Add to cart
                                            </Button>
                                        </Box>
                                        <Typography fontSize={10} color="#8E8E8E" sx={{ mt: 1.5, lineHeight: 1.4 }}>
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Typography fontSize={18} fontWeight={600} color="#333" mb={3}>
                            Most Sold Products
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, maxWidth: 380 }}>
                            {mostSoldProducts.map((product, index) => (
                                <Box
                                    key={index}
                                    component="img"
                                    src={product.image}
                                    alt="product"
                                    onClick={() => navigate("/market-place")}
                                    sx={{
                                        width: "100%",
                                        height: 140,
                                        borderRadius: 3,
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            transition: "transform 0.3s ease",
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid> */}
      </Container>

      <ConfirmPopup
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === "bulk"
            ? "Remove selected items?"
            : "Remove from cart?"
        }
        message={deletePopupMessage}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="delete"
      />
    </>
  );
};

export default Cart;
