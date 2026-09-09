import { Box, Typography } from "@mui/material";

const OrderSummary = ({ data }) => {
    return (
        <Box sx={{ display:'flex', justifyContent:'center', flexDirection:'column', width:299, height:280, bgcolor: "#FF1572", borderRadius:20, p: 2, color: "white" }}>
            <Typography fontSize={18} paddingLeft={8} fontWeight={600} mb={3}>Order Summary</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography fontSize={14}>Sub Total :</Typography>
                <Typography fontSize={14} fontWeight={600}>{data.subTotal}</Typography>
            </Box>
            {data.discount ? (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography fontSize={14}>Discount :</Typography>
                    <Typography fontSize={14} fontWeight={600}>-{data.discount}</Typography>
                </Box>
            ) : null}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography fontSize={14}>Shipping Charge :</Typography>
                <Typography fontSize={14} fontWeight={600}>{data.shippingCharge}</Typography>
            </Box>
            {/* <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography fontSize={14}>Estimated Tax :</Typography>
                <Typography fontSize={14} fontWeight={600}>{data.estimatedTax}</Typography>
            </Box> */}
            <Box sx={{ display: "flex", justifyContent: "space-between", pt: 2, borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                <Typography fontSize={16} fontWeight={600}>Total :</Typography>
                <Typography fontSize={16} fontWeight={600}>{data.total}</Typography>
            </Box>
        </Box>
    );
};

export default OrderSummary;
