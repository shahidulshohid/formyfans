import { Box, Typography } from "@mui/material";

const OrderItemsTable = ({ items }) => {
    return (
        <>
            {/* Table Header */}
            <Box sx={{ display: "flex", px:3, alignItems:'center', bgcolor: "#FF1572", width:750,height:56, borderRadius:37, mb:4}}>
                <Typography fontSize={18} pr={6} fontWeight={600} color="white" sx={{ flex: 2 }}>Product</Typography>
                <Typography fontSize={18} fontWeight={600} color="white" sx={{ flex: 1, textAlign: "center" }}>Quantity</Typography>
                <Typography fontSize={18} fontWeight={600} color="white" sx={{ flex: 1, textAlign: "center" }}>Price</Typography>
                <Typography fontSize={18} fontWeight={600} color="white" sx={{ flex: 1, textAlign: "center" }}>Total</Typography>
            </Box>
        <Box sx={{ bgcolor: "white", borderRadius: 4, overflow: "hidden",  width:800 , height:193, borderRadius:60  }}>
            {/* Table Body */}
            <Box  sx={{ p: 2  }}>
                {items.map((item) => (
                    <Box key={item.id} sx={{ display: "flex", alignItems: "center", py: 2, borderBottom: "1px solid #eee" }}>
                        <Box sx={{ flex: 2, display: "flex", px:3, alignItems: "center", gap: 2 }}>
                            <Box component="img" src={item.image} alt={item.name} sx={{ width: 50, height: 50, borderRadius: 1, objectFit: "cover" }} />
                            <Typography fontSize={18} fontWeight={600} color="#5E1321">{item.name}</Typography>
                        </Box>
                        <Typography fontSize={18} fontWeight={600} color="#5E1321" sx={{ flex: 1, textAlign: "center" }}>{item.quantity}</Typography>
                        <Typography fontSize={18} fontWeight={600} color="#5E1321" sx={{ flex: 1, textAlign: "center" }}>{item.price}</Typography>
                        <Typography fontSize={18} fontWeight={600} color="#5E1321" sx={{ flex: 1, textAlign: "center" }}>{item.total}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
        
        </>
    );
};

export default OrderItemsTable;
