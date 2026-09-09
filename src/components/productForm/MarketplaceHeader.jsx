import { Box, Typography, Grid } from "@mui/material";
import CustomInput from "../cutomInput";

const MarketplaceHeader = ({ searchIcon, chatIcon, navItems = [] }) => {
    return (
        <Box
            bgcolor="background.deepPink"
            mt={{ xs: 2, md: 6 }}
            px={{ xs: 2, md: 3 }}
            py={1.5}
            mb={4}
            borderRadius="40px"
            sx={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
        >
            <Grid container alignItems="center" spacing={{ xs: 2, md: 0 }}>
                {/* Title */}
                <Grid item size={{ xs: 12, md: 3 }}>
                    <Typography
                        fontSize={{ xs: "18px", md: "22px" }}
                        fontWeight={600}
                        color="neutral.darkBrown"
                        textAlign={{ xs: "center", md: "left" }}
                    >
                        Market Place
                    </Typography>
                </Grid>

                {/* Navigation Icons */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Box
                        display="flex"
                        justifyContent={{ xs: "space-around", md: "center" }}
                        alignItems="center"
                        gap={{ xs: "16px", md: "32px" }}
                        flexWrap="wrap"
                    >
                        {navItems.map((item, index) => (
                            <Box
                                key={index}
                                display="flex"
                                alignItems="center"
                                gap="8px"
                                sx={{
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                <img
                                    src={item.icon}
                                    alt={item.iconName}
                                    width={18}
                                    height={18}
                                />
                                <Typography
                                    fontSize={{ xs: "12px", md: "14px" }}
                                    fontWeight={500}
                                    color="neutral.white"
                                >
                                    {item.iconName}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Grid>

                {/* Search Bar */}
                <Grid item size={{ xs: 12, md: 3 }}>
                    <CustomInput
                        placeholder="Search By Name"
                        InputStartIcon={<img src={searchIcon} alt="search" />}
                        InputEndIcon={<img src={chatIcon} alt="chat" width={26} />}
                        sx={{
                            width: "100%",
                            maxWidth: { xs: "100%", md: "260px" },
                            ml: "auto",
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "neutral.white",
                                borderRadius: "20px",
                                height: "40px",
                                "& fieldset": {
                                    border: "none",
                                },
                                "&.Mui-focused fieldset": {
                                    border: "none",
                                },
                                "&:hover fieldset": {
                                    border: "none",
                                },
                            },
                            "& .MuiInputBase-input": {
                                fontSize: "14px",
                                color: "text.darkBrown",
                                padding: "8px 10px",
                                "&::placeholder": {
                                    color: "text.darkBrown",
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default MarketplaceHeader;
