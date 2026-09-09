import { Box, Typography } from "@mui/material";
import DownArrow from "../../assets/icon/down-arrow.svg";
const SelectOption = ({ title, placeholder = "Select" }) => {
    return (
        <Box
            sx={{
                bgcolor: "#FF1572",
                borderRadius: 8,
                p: 2,
                mb: 3,
                width:328,
                height:121
            }}
        >
            <Typography fontSize={24} fontWeight={600} color="white" mb={2}>
                {title}
            </Typography>
            <Box
                sx={{
                    bgcolor: "white",
                    borderRadius: 31.5,
                    px: 1,
                    py: .5,
                    width:294,
                    height:38,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    
                }}
            >
                <Typography fontSize={16} color="#5E1321">
                    {placeholder}
                </Typography>
                <img src={DownArrow} alt="Arrow" />
            </Box>
        </Box>
    );
};

export default SelectOption;
