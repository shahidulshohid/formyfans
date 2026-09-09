import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  TableCell,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OrderSummary from "../../../components/order/OrderSummary";
import ShippingInfo from "../../../components/order/ShippingInfo";
import DeliveryInfo from "../../../components/order/DeliveryInfo";
import PaginatedTable from "../../../components/dynamicTable";
import { useOrder } from "../../../hook/order";
import { mapOrderToDetailsView } from "../../../utils/orderTable";

const ORDER_ITEM_HEADERS = [
  { id: "product", label: "Product", align: "left", width: "42%" },
  { id: "quantity", label: "Quantity", align: "center", width: "18%" },
  { id: "price", label: "Price", align: "center", width: "20%" },
  { id: "total", label: "Total", align: "center", width: "20%" },
];

const ORDER_ITEM_ROWS = ["product", "quantity", "price", "total"];

const OrderDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const { fetchOrderDetails, detailLoading } = useOrder();
  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    setLoadError(null);
    setOrder(null);
    (async () => {
      const res = await fetchOrderDetails(orderId);
      if (res?.success && res.data) {
        setOrder(res.data);
      } else {
        setLoadError(res?.message || "Failed to load order");
      }
    })();
  }, [orderId, fetchOrderDetails]);

  const view = useMemo(
    () => (order ? mapOrderToDetailsView(order) : null),
    [order],
  );

  const renderOrderItemCell = useCallback((row, val) => {
    if (val !== "product") return null;

    return (
      <TableCell
        key={val}
        align="left"
        sx={{ verticalAlign: "middle", py: 2.5, px: 3 }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}
        >
          {row.image ? (
            <Box
              component="img"
              src={row.image}
              alt={row.name}
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : null}
          <Typography
            fontSize={18}
            fontWeight={600}
            sx={{ color: "#5E1321", overflowWrap: "anywhere" }}
          >
            {row.name}
          </Typography>
        </Box>
      </TableCell>
    );
  }, []);

  if (!orderId) {
    return (
      <Box
        sx={{
          bgcolor: "#F5F5F5",
          minHeight: "100vh",
          p: 4,
          textAlign: "center",
        }}
      >
        <Header />
        <Typography color="#5E1321" mt={4}>
          Order not found. Go back to orders list.
        </Typography>
        <Button onClick={() => navigate("/order-listing")} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100vh" }}>
      <Header />

      <Box
        sx={{
          p: { xs: 2, md: 4 },
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          maxWidth: 1203,
          mx: "auto",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate(-1)}
          sx={{
            color: "#5E1321",
            textTransform: "none",
            fontSize: 14,
            fontWeight: 500,
            mb: 2,
            pl: 0,
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          Back
        </Button>

        {detailLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#FF1572" }} />
          </Box>
        ) : loadError || !view ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="#5E1321" mb={2}>
              {loadError || "Order not found"}
            </Typography>
            <Button onClick={() => navigate(-1)} sx={{ color: "#FF1572" }}>
              Go Back
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: { xs: 3, md: 6 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  fontSize={{ xs: 16, md: 18 }}
                  fontWeight={600}
                  color="#5E1321"
                >
                  Order Details
                </Typography>
                <Typography
                  fontSize={{ xs: 14, md: 16 }}
                  fontWeight={600}
                  color="#D2D2D1"
                >
                  {view.orderInfo.orderId}
                </Typography>
              </Box>

              <Grid container spacing={{ xs: 2, md: 4 }}>
                <Grid item xs={6} md={3}>
                  <Typography
                    fontSize={{ xs: 12, md: 18 }}
                    fontWeight={600}
                    color="#00000040"
                    mb={0.5}
                  >
                    ID Number
                  </Typography>
                  <Typography
                    fontSize={{ xs: 12, md: 16 }}
                    fontWeight={600}
                    color="#5E1321"
                  >
                    {view.orderInfo.idNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography
                    fontSize={{ xs: 12, md: 18 }}
                    fontWeight={600}
                    color="#00000040"
                    mb={0.5}
                  >
                    Billing Name
                  </Typography>
                  <Typography
                    fontSize={{ xs: 12, md: 16 }}
                    fontWeight={600}
                    color="#5E1321"
                  >
                    {view.orderInfo.billingName}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography
                    fontSize={{ xs: 12, md: 18 }}
                    fontWeight={600}
                    color="#00000040"
                    mb={0.5}
                  >
                    Date
                  </Typography>
                  <Typography
                    fontSize={{ xs: 12, md: 16 }}
                    fontWeight={600}
                    color="#5E1321"
                  >
                    {view.orderInfo.date}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography
                    fontSize={{ xs: 12, md: 18 }}
                    fontWeight={600}
                    color="#00000040"
                    mb={0.5}
                  >
                    Tracking ID
                  </Typography>
                  <Typography
                    fontSize={{ xs: 12, md: 16 }}
                    fontWeight={600}
                    color="#5E1321"
                  >
                    {view.orderInfo.trackingId}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Typography
              fontSize={{ xs: 16, md: 18 }}
              fontWeight={600}
              color="#5E1321"
              mb={2}
            >
              Items from Order {view.orderInfo.orderId}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 2, md: 3 },
                mb: 3,
                alignItems: { xs: "stretch", md: "flex-start" },
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  maxWidth: { md: 800 },
                  borderRadius: { xs: 3, md: "37px" },
                  overflow: "hidden",
                  bgcolor: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <PaginatedTable
                  tableHeader={ORDER_ITEM_HEADERS}
                  tableData={view.items}
                  displayRows={ORDER_ITEM_ROWS}
                  hidepagination
                  showPagination={false}
                  headerBgColor="#FF1572"
                  headerBorderRadius="37px"
                  headerFontSize={18}
                  cellFontSize={18}
                  fullWidth
                  tableWidth="100%"
                  customRenderCell={renderOrderItemCell}
                  getRowId={(row) => row.id}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", md: 332 } }}>
                <OrderSummary data={view.orderSummary} />
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShippingInfo data={view.shippingInfo} />
              </Grid>
              <Grid item xs={12} md={6}>
                <DeliveryInfo data={view.deliveryInfo} />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default OrderDetails;
