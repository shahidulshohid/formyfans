import { Box, Typography } from "@mui/material";

const FormCard = ({ title, children, sx = {} }) => {
    return (
        <Box
            sx={{
                bgcolor: "white",
                borderRadius: 4,
                p: 3,
                ...sx,
            }}
        >
            {title && (
                <Typography fontSize={18} fontWeight={600} color="#333" mb={3}>
                    {title}
                </Typography>
            )}
            {children}
        </Box>
    );
};

export default FormCard;
