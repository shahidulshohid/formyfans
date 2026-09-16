import { Box, Typography, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table";
import { useOrder } from "../../hook/order";
import { mapOrderToTableRow } from "../../utils/orderTable";

const TABLE_HEADERS = [
    { key: "orderId", label: "Order Id", flex: 1.2 },
    { key: "billingName", label: "Billing Name", flex: 1.5 },
    { key: "orderStatus", label: "Order Status", flex: 1.4 },
    { key: "totalPricing", label: "Total Pricing", flex: 1.2 },
    { key: "date", label: "Date", flex: 1 },
    { key: "qty", label: "Qty", flex: 0.8, align: "center" },
    { key: "button", label: "View Details", flex: 0.8, align: "center" },
];

const OrdersListPanel = ({
    title = "List of Orders",
    /** "shop" = creator Orders List | "my" = buyer My Orders */
    source = "shop",
}) => {
    const navigate = useNavigate();
    const { orders, listLoading, fetchShopOrders, fetchMyOrders, changeOrderStatus, statusUpdatingId } =
        useOrder();

    const handleViewDetails = (row) => {
        const orderId = row.orderId || row.raw?.orderId;
        if (!orderId) return;
        navigate("/order-details", { state: { orderId } });
    };

    const loadOrders = useCallback(() => {
        if (source === "my") {
            fetchMyOrders();
        } else {
            fetchShopOrders();
        }
    }, [source, fetchMyOrders, fetchShopOrders]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const tableData = useMemo(() => orders.map(mapOrderToTableRow), [orders]);

    return (
        <Box>
            <Typography fontSize={{ xs: 18, md: 20 }} fontWeight={600} color="#333" mb={1}>
                {title}
            </Typography>
            {/* {subtitle ? (
                <Typography fontSize={13} color="#8E8E8E" mb={3}>
                    {subtitle}
                </Typography>
            ) : null} */}

            {listLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress sx={{ color: "#FF1572" }} />
                </Box>
            ) : (
                <Box sx={{ overflowX: "auto" }}>
                    <Table
                        headers={TABLE_HEADERS}
                        data={tableData}
                        readOnlyOrderStatus={source === "my"}
                        onOrderStatusChange={
                            source === "shop"
                                ? (row, status) => changeOrderStatus(row, status)
                                : undefined
                        }
                        orderStatusUpdatingId={source === "shop" ? statusUpdatingId : null}
                        emptyMessage="No orders found"
                        onView={handleViewDetails}
                        sx={{
                            width: { xs: "max-content", md: "100%" },
                            minWidth: { xs: 700, md: "auto" },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default OrdersListPanel;
