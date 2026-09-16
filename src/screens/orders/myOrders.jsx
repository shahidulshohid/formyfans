import { Box, Container } from "@mui/material";
import Header from "../../components/header";
import MarketplaceNavBar from "../../components/marketplace/MarketplaceNavBar";
import OrdersListPanel from "../../components/orders/OrdersListPanel";

const MyOrders = () => {
    return (
        <Box>
            <Header />
            <Container maxWidth="lg" sx={{ pb: 4 }}>
                <MarketplaceNavBar activePath="/my-orders" />
                <Box
                    sx={{
                        bgcolor: "#F5F5F5",
                        borderRadius: 3,
                        p: { xs: 2, md: 4 },
                        minHeight: 400,
                    }}
                >
                    <OrdersListPanel
                        source="my"
                        title="My Orders"
                        subtitle="Orders you have placed."
                    />
                </Box>
            </Container>
        </Box>
    );
};

export default MyOrders;
