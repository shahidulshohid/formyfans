import { Box, Typography } from "@mui/material";

const ShippingInfo = ({ data }) => {
    return (
        <>
        
            <Typography fontSize={16} paddingLeft={6} color="#5E1321" fontWeight={600} mb={2}>Shipping Information</Typography>
        <Box sx={{  bgcolor: "#5E1321",paddingLeft:6, pt:3, borderRadius: 20, width:539,height:166, color: "white" , boxShadow: "0 4px 8px rgba(0,0,0,0.1) "}}>
            <Typography fontSize={16} fontWeight={600}  mb={1}>
                <Box component="span" fontWeight={600}>Name: </Box>{data.name}
            </Typography>
            <Typography fontSize={16} fontWeight={600} mb={1}>
                <Box component="span"  fontSize={16} fontWeight={600}>Address: </Box>{data.address}
            </Typography>
            <Typography fontSize={16} fontWeight={600} mb={1}>
                <Box component="span" fontSize={16} fontWeight={600}>Phone: </Box>{data.phone}
            </Typography>
            <Typography fontSize={16} fontWeight={600}>
                <Box component="span" fontSize={16} fontWeight={600}>Mobile: </Box>{data.mobile}
            </Typography>
        </Box>
        
        </>
    );
};

export default ShippingInfo;
