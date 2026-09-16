import { Box } from "@mui/material";
import Header from "../../../components/header";
import Sidebar from "../../../components/sidebar";
import MarketplaceNavBar from "../../../components/marketplace/MarketplaceNavBar";
import OrdersListPanel from "../../../components/orders/OrdersListPanel";

const OrderListing = () => {
    const menuItems = [
        { label: "Product List", path: "/product-listing" },
        { label: "Create Product", path: "/create-product" },
        { label: "Orders List", path: "/order-listing" },
    ];

    return (
        <Box>
            <Header />
            <Box sx={{ boxSizing: "border-box", padding: 2 }}>
                <MarketplaceNavBar activePath="/order-listing" />

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        minHeight: "calc(100vh - 64px)",
                    }}
                >
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Sidebar menuItems={menuItems} activeItem="Orders List" />
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 2, md: 4 },
                            bgcolor: "#F5F5F5",
                            minWidth: 0,
                            overflow: "auto",
                        }}
                    >
                        <OrdersListPanel source="shop" />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default OrderListing;
