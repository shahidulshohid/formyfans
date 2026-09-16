import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../../assets/images/search.png";

const Sidebar = ({ menuItems, activeItem }) => {
    const navigate = useNavigate();

    const handleClick = (item) => {
        if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <Box
            sx={{
                width: 198,
                bgcolor: "#FF1572",
                height:776,
                p: 2,
                display: { xs: "none", md: "block" },
            }}
        >
            {/* Search Input */}
            <Box
                sx={{
                    display: "flex",
                    width: 193,
                    height: 36,
                    alignItems: "center",
                    bgcolor: "#5E1321",
                    borderRadius: "37px",
                    px: 1,
                    gap: 2,
                    mb: 4,
                }}
            >
                <img
                    src={SearchIcon}
                    alt="search"
                    style={{ width: 20, height: 18, marginRight: 8 }}
                />
                <Typography fontSize={16} fontWeight={400} color="white">
                    Search
                </Typography>
            </Box>

            {/* Menu Items */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {menuItems.map((item, index) => {
                    const isActive = item.label === activeItem;
                    return (
                        <Typography
                            key={index}
                            fontSize={20}
                            fontWeight={600}
                            color={isActive ? "#5E1321" : "white"}
                            sx={{
                                cursor: item.path ? "pointer" : "default",
                                "&:hover": item.path ? { opacity: 0.8 } : {},
                            }}
                            onClick={() => handleClick(item)}
                        >
                            {item.label}
                        </Typography>
                    );
                })}
            </Box>
        </Box>
    );
};

export default Sidebar;
