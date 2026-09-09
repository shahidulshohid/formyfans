import { Box } from "@mui/material";

const SectionCard = ({ children, sx = {}, ...props }) => {
    return (
        <Box
            sx={{
                bgcolor: "white",
                borderRadius: 4,
                p: 3,
                width: "100%",
                maxWidth: { xs: "100%", md: 960 },
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                ...sx,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};

export default SectionCard;
