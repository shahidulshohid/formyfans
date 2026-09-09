import { Box, Typography } from "@mui/material";

const DeliveryInfo = ({ data }) => {
    return (
        <>
        <Box>
            <Typography fontSize={16}  color="#5E1321" paddingLeft={6} fontWeight={600} mb={2}>Delivery & Payment Information</Typography>
         <Box sx={{ bgcolor: "#5E1321",paddingLeft:6, pt:3, borderRadius: 20, color: "white" , width:539,height:166, boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}}>
            <Typography fontSize={16} fontWeight={600} mb={1}>
                <Box component="span" fontWeight={600}>Payment Type: </Box>{data.paymentType}
            </Typography>
            <Typography fontSize={16} fontWeight={600} mb={1}>{data.delivery}</Typography>
            <Typography fontSize={16} fontWeight={600} mb={1}>
                <Box component="span" fontWeight={600}>Order ID: </Box>{data.orderId}
            </Typography>
            <Typography fontSize={16} fontWeight={600}>
                <Box component="span" fontWeight={600}>Payment Mode: </Box>{data.paymentMode}
            </Typography>
        </Box>

        </Box>
        
        </>
    );
};

export default DeliveryInfo;
